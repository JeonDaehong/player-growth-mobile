/**
 * 길드 목록 — 서버의 `guilds` 표와 `profiles` 를 합쳐 화면이 쓰는 `Guild` 로 만든다.
 *
 * 두 곳에서 온다:
 *   `guilds`    이름 · 소개 · 문장 · 길드장   (길드장이 만들 때 한 번 쓴다)
 *   `profiles`  누가 어느 길드인가 · 그 사람의 템렙 · 기여도 · 오늘 출석했는가
 *
 * **인원과 평균 아이템레벨을 서버에 저장하지 않는 게 요점이다.** 저장하면 누가
 * 탈퇴할 때마다 갱신해야 하고, 한 번만 놓쳐도 "12명" 이라고 적힌 빈 길드가 남는다.
 * 프로필은 어차피 랭킹 때문에 전부 받아 두고 있으므로(useBoard.ts), 세기만 하면
 * 된다 — 추가 질의가 없고, 랭킹이 실시간이면 길드 인원도 자동으로 실시간이다.
 *
 * 처음에는 **목록이 비어 있다.** 그게 맞다 — 아무도 아직 안 만들었으니까.
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import {
  GUILD_CAPACITY, type Guild, type GuildMember, type GuildStats,
} from '@/core/guilds';
import { fetchGuilds, netEnabled, onGuilds, type GuildRow, type NetProfile } from './net';
import { coalesce, startPolling } from './poller';
import { rosterMeId, rosterProfiles, useMeId, useProfiles } from './useBoard';

/** 소켓이 놓친 것을 주워 오는 간격 — 길드는 자주 생기지 않는다 */
const RECHECK_MS = 60_000;

interface GuildDirState {
  rows: GuildRow[];
  loading: boolean;
  set: (rows: GuildRow[]) => void;
}

const useDir = create<GuildDirState>()((set) => ({
  rows: [],
  loading: netEnabled(),
  set: (rows) => set({ rows, loading: false }),
}));

/** 길드 명부를 서버에 붙인다. App 이 한 번만 부른다 (`useLive` 와 같은 자리) */
export function connectGuilds(): () => void {
  if (!netEnabled()) {
    useDir.setState({ loading: false });
    return () => {};
  }
  const pull = () => void fetchGuilds().then((rows) => useDir.getState().set(rows));
  /*
    길드는 행 하나가 바뀌어도 목록 전체를 다시 받는다. 인원이 몇 개 안 되고
    (베타에서는 많아야 수십), 생성·해산은 드물다. 부분 갱신을 만들 값어치가 없다.

    대신 **몰아서** 받는다. 레이드 정산 직후처럼 여러 길드가 같은 순간에 갱신되면
    같은 200줄을 그 수만큼 받아 오는데, 마지막 한 번이면 결과가 같다.
  */
  const off = onGuilds(coalesce(pull));
  const stopPoll = startPolling(pull, RECHECK_MS);
  return () => {
    stopPoll();
    off();
  };
}

/** 길드 하나의 실제 인원에서 뽑는 값들 */
function summarize(row: GuildRow, members: NetProfile[]): Guild {
  const n = members.length;
  const ilvlSum = members.reduce((a, p) => a + p.ilvl, 0);
  return {
    id: row.id,
    emblem: row.emblem,
    name: row.name,
    motto: row.motto,
    masterId: row.masterId,
    master: row.masterNick,
    capacity: row.capacity || GUILD_CAPACITY,
    members: n,
    avgIlvl: n ? Math.round(ilvlSum / n) : 0,
    weekly: members.reduce((a, p) => a + p.guildStats.weekly, 0),
  };
}

export interface GuildDirectory {
  /** 서버에 있는 모든 길드 (주간 기여도 내림차순) */
  guilds: Guild[];
  loading: boolean;
  /** 이 빌드에 서버가 없다 (로컬 개발) */
  off: boolean;
  /** 이름 중복 검사에 쓴다 */
  names: string[];
}

export function useGuilds(): GuildDirectory {
  const rows = useDir((s) => s.rows);
  const loading = useDir((s) => s.loading);
  const profiles = useProfiles();

  const guilds = useMemo(() => {
    const byGuild = new Map<string, NetProfile[]>();
    for (const p of profiles) {
      if (!p.guildId) continue;
      const list = byGuild.get(p.guildId);
      if (list) list.push(p);
      else byGuild.set(p.guildId, [p]);
    }
    return rows
      .map((r) => summarize(r, byGuild.get(r.id) ?? []))
      .sort((a, b) => b.weekly - a.weekly || b.avgIlvl - a.avgIlvl);
  }, [rows, profiles]);

  const names = useMemo(() => rows.map((r) => r.name), [rows]);

  return { guilds, loading, off: !netEnabled(), names };
}

/**
 * 내 길드 하나.
 *
 * ⚠ 목록의 그 줄을 그대로 쓰면 안 된다. 서버에 실린 내 프로필은 최대 30초 낡았고
 * (net.ts 가 눌러 올린다), 그래서 방금 강화한 결과가 **내 길드 평균에만** 반영이
 * 안 된다. 나를 걷어 내고 지금 값으로 갈아 끼운다.
 *
 * 인원도 같은 이유로 `길드원 + 1` 이다 — 서버에 내 줄이 아직 없어도(첫 접속)
 * 나는 분명히 이 길드에 있다.
 */
function withMe(row: GuildRow, mates: NetProfile[], myIlvl: number, myWeekly: number): Guild {
  const n = mates.length + 1;
  const ilvlSum = mates.reduce((a, p) => a + p.ilvl, 0) + myIlvl;
  return {
    id: row.id,
    emblem: row.emblem,
    name: row.name,
    motto: row.motto,
    masterId: row.masterId,
    master: row.masterNick,
    capacity: row.capacity || GUILD_CAPACITY,
    members: n,
    avgIlvl: Math.round(ilvlSum / n),
    weekly: mates.reduce((a, p) => a + p.guildStats.weekly, 0) + Math.max(0, myWeekly),
  };
}

/** 같은 길드 사람들 — 나를 뺀 명단 */
const matesIn = (profiles: NetProfile[], guildId: string, meId: string | null) =>
  profiles.filter((p) => p.guildId === guildId && p.userId !== meId);

export function useMates(guildId: string | null): NetProfile[] {
  const profiles = useProfiles();
  const meId = useMeId();
  return useMemo(
    () => (guildId ? matesIn(profiles, guildId, meId) : []),
    [profiles, guildId, meId],
  );
}

/** 내 길드 — 지금의 나를 섞은 값 */
export function useMyGuildLive(
  guildId: string | null, myIlvl: number, myWeekly: number,
): Guild | null {
  const rows = useDir((s) => s.rows);
  const mates = useMates(guildId);
  return useMemo(() => {
    const row = rows.find((r) => r.id === guildId);
    return row ? withMe(row, mates, myIlvl, myWeekly) : null;
  }, [rows, mates, guildId, myIlvl, myWeekly]);
}

/**
 * 훅 밖에서 지금 상태를 읽는다 — 게임 스토어의 액션(출석·레이드·보스 수령)이 쓴다.
 * 화면이 안 열려 있어도 값이 필요하므로 스토어에서 직접 꺼낸다.
 */
export function guildSnapshot(
  guildId: string | null, myIlvl: number, myWeekly: number,
): { guild: Guild | null; mates: NetProfile[] } {
  if (!guildId) return { guild: null, mates: [] };
  const row = useDir.getState().rows.find((r) => r.id === guildId);
  const mates = matesIn(rosterProfiles(), guildId, rosterMeId());
  return { guild: row ? withMe(row, mates, myIlvl, myWeekly) : null, mates };
}

/** 명단 한 줄로 옮긴다 */
export const toMember = (p: NetProfile, masterId: string): GuildMember => ({
  id: p.userId,
  nick: p.nick,
  ilvl: p.ilvl,
  weekly: p.guildStats.weekly,
  isMaster: p.userId === masterId,
});

// ── 길드원들이 올려 둔 수치 모으기 ─────────────────────
//
// 레이드·보스의 총 피해와 오늘 출석한 인원은 **각자 올린 값의 합**이다.
// 서버가 판정할 게 없어 표 하나로 끝난다. 대신 주기 키(오늘·이번 주)가
// 맞는 것만 센다 — 지난주 피해가 이번 주 보스에 얹히면 안 된다.

const pick = (s: GuildStats, which: 'boss' | 'raidD' | 'raidW') => s[which];

/** 이 주기에 길드원들이 넣은 피해의 합 (나는 뺀다 — 부르는 쪽이 자기 것을 안다) */
export function matesDamage(
  mates: NetProfile[], which: 'boss' | 'raidD' | 'raidW', periodKey: string,
): number {
  let sum = 0;
  for (const p of mates) {
    const d = pick(p.guildStats, which);
    if (d.key === periodKey) sum += d.dmg;
  }
  return sum;
}

/** 보스 기여도 순위에 올릴 길드원들 */
export function matesBossRows(mates: NetProfile[], weekKey: string) {
  return mates
    .filter((p) => p.guildStats.boss.key === weekKey)
    .map((p) => ({ nick: p.nick, damage: p.guildStats.boss.dmg }));
}

/** 오늘 출석한 길드원 수 (나는 뺀다) */
export function matesAttended(mates: NetProfile[], dayKey: string): number {
  return mates.filter((p) => p.guildStats.attendDay === dayKey).length;
}

/** 길드원들의 이번 주 기여도 합 (금고 규모의 재료) */
export function matesWeekly(mates: NetProfile[]): number {
  return mates.reduce((a, p) => a + p.guildStats.weekly, 0);
}
