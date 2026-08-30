/**
 * 랭킹 데이터 — 서버의 profiles 를 받아 화면이 쓰는 `Player` 로 옮긴다.
 *
 * 예전엔 `population(dayKey)` 한 줄이면 됐다. 가짜였으니까 — 하루치 씨앗을 넣으면
 * 99명이 즉시 나왔다. 진짜 사람은 왕복을 한 번 해야 하고, 그 사이에 화면이
 * 비어 있는 순간이 생긴다. 그래서 상태가 셋이다: 받는 중 / 나뿐 / 여럿.
 *
 * **구독은 앱 전체에 하나다.** 랭킹 화면과 채팅(명패의 순위)이 각자 붙으면
 * 소켓이 둘, 재확인 질의도 둘이 된다. 그래서 zustand 스토어 하나에 모아 두고
 * 드라이버(`connectRoster`)를 App 에서 한 번만 돌린다 — 화면은 읽기만 한다.
 *
 * 갱신
 *   · 붙을 때 한 번 받는다
 *   · 그 뒤로는 **실시간**이다. 누가 강화에 성공해 프로필을 올리면 그 줄만 갈린다
 *     (postgres_changes 로 바뀐 행 하나가 온다 — 전체를 다시 받지 않는다)
 *   · 소켓이 죽었을 때를 대비해 뜸하게 한 번 더 확인한다
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import type { Player } from '@/core/ranking';
import { fetchProfiles, myUserId, netEnabled, onProfiles, type NetProfile } from './net';
import { startPolling } from './poller';

/** 소켓이 놓친 것을 주워 오는 간격 (채팅보다 뜸하다 — 한 번에 다 받는 질의다) */
const RECHECK_MS = 60_000;

export const toPlayer = (p: NetProfile): Player => ({
  id: p.userId,
  nick: p.nick,
  avatar: p.avatar,
  ilvl: p.ilvl,
  gear: p.gear,
  weapons: p.weapons,
  net: p.net,
  arenaPoints: p.arenaPoints,
  wins: p.wins,
  losses: p.losses,
  guildId: p.guildId,
  guildName: p.guildName,
  title: p.title,
});

interface RosterState {
  rows: Record<string, NetProfile>;
  /** 첫 묶음을 아직 받는 중인가 */
  loading: boolean;
  /** 로그인한 내 user_id — 순위표에서 서버본의 나를 걷어 낼 때 쓴다 */
  meId: string | null;
  replaceAll: (list: NetProfile[]) => void;
  upsert: (p: NetProfile) => void;
}

const useRosterStore = create<RosterState>()((set) => ({
  rows: {},
  loading: netEnabled(),
  meId: null,
  replaceAll: (list) =>
    set({ rows: Object.fromEntries(list.map((p) => [p.userId, p])), loading: false }),
  upsert: (p) => set((s) => ({ rows: { ...s.rows, [p.userId]: p } })),
}));

/**
 * 순위표를 서버에 붙인다. App 이 한 번만 부른다 (`useLive` 와 같은 자리).
 * 정리 함수를 돌려준다.
 */
export function connectRoster(): () => void {
  if (!netEnabled()) {
    useRosterStore.setState({ loading: false });
    return () => {};
  }
  void myUserId().then((id) => useRosterStore.setState({ meId: id }));

  const pull = () => void fetchProfiles().then((list) => useRosterStore.getState().replaceAll(list));

  // 바뀐 사람의 줄만 갈아 끼운다
  const off = onProfiles((p) => useRosterStore.getState().upsert(p));
  // 탭이 숨겨져 있는 동안은 쉰다 — 돌아오면 곧바로 한 번 받는다 (state/poller.ts)
  const stopPoll = startPolling(pull, RECHECK_MS);

  return () => {
    stopPoll();
    off();
  };
}

export interface Roster {
  /** 나를 뺀 다른 플레이어들 */
  others: Player[];
  /** 첫 묶음을 아직 받는 중인가 */
  loading: boolean;
  /** 이 빌드에 서버가 없다 (로컬 개발) */
  off: boolean;
}

/** 훅 밖에서 지금 값을 읽는다 (게임 스토어의 액션이 쓴다) */
export const rosterProfiles = (): NetProfile[] => Object.values(useRosterStore.getState().rows);
export const rosterMeId = (): string | null => useRosterStore.getState().meId;

/**
 * 받아 둔 프로필 원본.
 *
 * 랭킹은 `Player` 로 옮겨 쓰지만, 길드는 거기 없는 것(기여도·출석·레이드 피해)을
 * 본다. 같은 데이터를 두 번 받지 않으려고 원본을 그대로 내어 준다.
 */
export function useProfiles(): NetProfile[] {
  const rows = useRosterStore((s) => s.rows);
  return useMemo(() => Object.values(rows), [rows]);
}

/** 로그인한 내 user_id (드라이버가 붙으면 채워진다) */
export function useMeId(): string | null {
  return useRosterStore((s) => s.meId);
}

export function useRoster(): Roster {
  const rows = useRosterStore((s) => s.rows);
  const loading = useRosterStore((s) => s.loading);
  const meId = useRosterStore((s) => s.meId);

  const others = useMemo(
    () => Object.values(rows).filter((p) => p.userId !== meId).map(toPlayer),
    [rows, meId],
  );

  return { others, loading, off: !netEnabled() };
}
