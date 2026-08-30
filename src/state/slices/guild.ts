/**
 * 길드 — 가입부터 레이드 정산까지.
 *
 * `store.ts` 한 파일에 3,600줄이 있던 시절에는 액션 하나를 고치려고 열 때마다
 * 관계없는 스무 개를 지나야 했다. 여기 있는 것들은 **같이 고쳐지는 것끼리** 모았다.
 *
 * 이 파일은 스토어를 만들지 않는다 — 액션 뭉치를 돌려줄 뿐이고, 조립은
 * `store.ts` 가 한다. 그래서 저장·마이그레이션·미들웨어는 여전히 한 곳에만 있다.
 * `get()` 은 **스토어 전체**를 주므로 다른 뭉치의 액션도 그대로 부를 수 있다.
 */
import type { Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { playerCurrentIlvl } from '@/core/tiers';
import { weekKeyOf } from '@/core/rush';
import { GqKey } from '@/core/guildQuest';
import {
  allDone,
  allRewardOf,
  bulkLabel,
  claimableIds,
  missionDone,
  missionsOf,
  rewardLabel,
} from '@/core/missions';
import {
  SKILL_MAX,
  SKILL_POINT_COST,
  freePoints,
  guildEffects,
  levelOf,
} from '@/core/guildSkill';
import {
  RAID_DEFS,
  bossName as raidBossName,
  guildLevelOf,
  inSettleWindow,
  raidGp,
  raidHit,
  raidHp,
  settleLeft,
  skillPointsAt,
} from '@/core/guildRaid';
import { ATTEND_GP, attendExp, attendReward } from '@/core/guildAttend';
import {
  BOSS_DAILY_TRIES,
  bossBoard,
  bossHp,
  bossOpen,
  bossReward,
  myHit,
  totalDamage,
} from '@/core/guildBoss';
import { dividendFor } from '@/core/guildVault';
import { fmtShort } from '@/core/currency';
import {
  APPLY_REASON_MAX,
  APPLY_REASON_MIN,
  GUILD_CREATE_COST,
  GUILD_MOTTO_MAX,
  GUILD_NAME_MSG,
  validateGuildName,
} from '@/core/guilds';
import { matesAttended, matesBossRows, matesDamage, matesWeekly } from '../useGuilds';
import { createGuildRow, deleteGuildRow } from '../net';
import { rosterMeId } from '../useBoard';
import { MATERIAL_IDS } from '@/core/artisans';
import { hasProfanity } from '@/core/profanity';
import { pushGuildNotice, pushMyEvent } from '../live';
import {
  EMPTY_GQ,
  applyWear,
  currentGuild,
  dayKey,
  guildOf,
  noGuildMsg,
  titleMods,
  weeklyPointsOf,
} from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type GuildActions = Pick<
  Store,
  'joinGuild' | 'leaveGuild' | 'createGuild' | 'disbandGuild' | 'bumpGuildQuest'
  | 'claimMission' | 'claimAllMissions' | 'levelSkill' | 'joinRaid' | 'guildAttend'
  | 'joinBoss' | 'claimBoss' | 'claimDividend'
>;

export const createGuildSlice = (
  set: SliceSet,
  get: SliceGet,
): GuildActions => ({
  joinGuild: (id, reason) => {
    const st = get();
    // 내가 길드장인 길드를 두고 남의 길드에 들어가면 내 길드가 사라진다 — 막는다
    if (st.guildId && currentGuild(st)?.masterId === rosterMeId()) {
      get().toast('내 길드를 먼저 해산해야 합니다', 'bad');
      return false;
    }
    if (st.guildId) { get().toast('이미 길드에 속해 있습니다', 'bad'); return false; }
    const t = reason.trim();
    if (t.length < APPLY_REASON_MIN) {
      get().toast(`신청 사유를 ${APPLY_REASON_MIN}자 이상 적어 주세요`, 'bad');
      return false;
    }
    /*
      가입은 **내 프로필의 guild_id 를 바꾸는 것**이 전부다. 길드장의 수락을
      기다리게 하려면 서버에 신청함과 판정이 필요한데, 스무 명 남짓한 베타에서
      그건 "아무도 안 받아 줘서 못 들어감" 으로 끝난다. 문턱은 사유 열 자와
      가입 첫날 대기로 둔다.

      올리는 건 useNetSync 가 한다 — guildId 가 바뀌면 30초를 안 기다리고
      곧바로 올린다 (길드 채팅 권한이 이 값으로 판정되기 때문).
    */
    /*
      ⚠ **하루치 기록을 지우지 않는다.**

      예전에는 가입할 때 `guildCheck` · `guildBoss` 를 비웠다. "지난 길드의 기록을
      이어받지 않는다" 는 뜻이었는데, 그게 오히려 **하루에 두 번 먹는 구멍**을
      냈다 — A길드에서 출석하고 나와서 B길드에 들어가면 출석이 다시 열렸다.
      그 구멍을 막으려고 가입 첫날 전체를 잠갔고(대기), 그래서 정직하게 들어온
      사람이 하루를 통째로 손해 봤다.

      지금은 **한도만 그대로 들고 간다.** 오늘 이미 출석했으면 길드를 옮겨도
      `guildCheck.dayKey` 가 오늘이라 막힌다 — 구멍이 애초에 없으므로 대기가
      필요 없다. 기여도(`damage`)는 새 길드로 안 가져간다: 한도는 사람에게
      붙는 것이고 기여는 길드에 붙는 것이다.
    */
    const b = st.guildBoss;
    set({
      guildId: id,
      guildApplyReason: t.slice(0, APPLY_REASON_MAX),
      guildJoinedAt: Date.now(),
      guildBoss: { ...b, damage: 0, claimed: false },
    });
    get().toast('길드에 가입했습니다', 'good');
    pushGuildNotice(`${get().nickname}님이 길드에 들어왔습니다`);
    return true;
  },

  leaveGuild: () => {
    const st = get();
    if (st.guildId && currentGuild(st)?.masterId === rosterMeId()) {
      get().disbandGuild();
      return;
    }
    pushGuildNotice(`${get().nickname}님이 길드를 떠났습니다`);
    /*
      ⚠ **하루치 기록(`guildCheck`)은 지우지 않는다.**

      탈퇴할 때 비우면 "탈퇴 → 재가입" 으로 출석이 다시 열린다 — 가입할 때
      안 지우도록 고쳐 봐야 탈퇴 쪽에 같은 구멍이 남는다 (실제로 남아 있었고
      스토어 시험이 잡았다). 한도는 **길드가 아니라 사람에게** 붙는 값이다.

      기여도(`total`)는 남아도 새 길드에서 쓰이지 않는다. 새 길드에서 출석하면
      그때 오늘 날짜로 덮인다.
    */
    set({ guildId: null, guildApplyReason: '', guildJoinedAt: 0 });
    get().toast('길드를 탈퇴했습니다', 'plain');
  },

  /**
   * 길드 창설.
   *
   * ⚠ **서버가 성공을 돌려준 뒤에 돈을 뺀다.** 이름 중복의 최종 판정은 서버의
   * 유니크 인덱스이고, 두 사람이 같은 순간에 같은 이름을 내면 늦은 쪽은 거기서만
   * 막힌다 — 먼저 100골드를 빼 두면 그 사람은 돈만 잃는다.
   */
  createGuild: async (name, motto, emblem) => {
    const st = get();
    if (st.guildId) { get().toast('이미 길드에 속해 있습니다', 'bad'); return false; }
    const err = validateGuildName(name);
    if (err) { get().toast(GUILD_NAME_MSG[err], 'bad'); return false; }
    // 소개말도 이름과 같이 목록에 계속 붙어 다닌다 — 이름만 막으면 소개말로 샌다
    if (hasProfanity(motto)) {
      get().toast('소개말에 사용할 수 없는 단어가 들어 있습니다', 'bad');
      return false;
    }
    if (st.money < GUILD_CREATE_COST) {
      get().toast(`창설 비용 ${fmtShort(GUILD_CREATE_COST)}이 필요합니다`, 'bad');
      return false;
    }

    const res = await createGuildRow(
      name, motto.slice(0, GUILD_MOTTO_MAX), emblem, st.nickname);
    if (!res.ok) {
      get().toast(
        res.reason === 'taken' ? '이미 있는 길드 이름입니다'
          : res.reason === 'already-master' ? '이미 다른 길드의 길드장입니다'
            : res.reason === 'offline' ? '서버에 연결되어 있지 않습니다'
              : '길드를 만들지 못했습니다',
        'bad');
      return false;
    }

    // 여기서부터는 서버에 줄이 생긴 뒤다
    set({
      money: get().money - GUILD_CREATE_COST,
      guildId: res.guild.id,
      guildJoinedAt: Date.now(),
      /* 하루치 기록은 안 건드린다 — 탈퇴·가입과 같은 이유 (한도는 사람에게 붙는다) */
    });
    get().toast(`길드 "${res.guild.name}" 창설 완료`, 'good');
    pushMyEvent('guild', `${get().nickname}님이 길드 "${res.guild.name}"을(를) 창설했습니다`);
    get().checkTitles();
    return true;
  },

  /**
   * 해산. 비용은 돌려주지 않는다 — 만들고 부수기를 반복해 이득 볼 구멍이 없어야 한다.
   * 남아 있던 길드원의 소속은 서버 트리거가 풀어 준다 (supabase/schema.sql).
   */
  disbandGuild: () => {
    const id = get().guildId;
    /* 하루치 기록은 안 건드린다 — 해산 → 재창설로 출석을 다시 열 수 없게 */
    set({ guildId: null, guildApplyReason: '', guildJoinedAt: 0 });
    if (id) void deleteGuildRow(id);
    get().toast('길드를 해산했습니다', 'plain');
  },


  // ── 길드 콘텐츠 ───────────────────────────────────

  /**
   * 진행 축 하나를 올린다.
   * 길드 주간 퀘스트와 개인 일일·주간 미션이 **같은 이벤트**를 먹는다 —
   * 축을 따로 두면 올려 주는 자리를 두 배로 관리하게 되고, 한쪽만 빼먹는다.
   */
  bumpGuildQuest: (k, by = 1) =>
    set((st) => {
      const now = Date.now();
      const week = weekKeyOf(now);
      const day = dayKey(now);
      const cur = st.guildQuest.weekKey === week
        ? st.guildQuest.mine
        : { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 };
      const mp = st.missions;
      const dayProg = mp.dayKey === day ? mp.day : EMPTY_GQ;
      const weekProg = mp.weekKey === week ? mp.week : EMPTY_GQ;
      return {
        guildQuest: { weekKey: week, mine: { ...cur, [k]: (cur[k] ?? 0) + by } },
        missions: {
          dayKey: day,
          weekKey: week,
          day: { ...dayProg, [k]: (dayProg[k] ?? 0) + by },
          week: { ...weekProg, [k]: (weekProg[k] ?? 0) + by },
          // 기간이 바뀌었으면 수령 기록도 함께 비운다
          claimedDay: mp.dayKey === day ? mp.claimedDay : [],
          claimedWeek: mp.weekKey === week ? mp.claimedWeek : [],
        },
      };
    }),

  /** 끝난 미션 한 칸의 보상을 받는다 */
  claimMission: (scope, id) => {
    const st = get();
    const now = Date.now();
    const day = dayKey(now);
    const week = weekKeyOf(now);
    const daily = scope === 'daily';
    const fresh = daily ? st.missions.dayKey === day : st.missions.weekKey === week;
    const prog = (fresh ? (daily ? st.missions.day : st.missions.week) : EMPTY_GQ) as Record<GqKey, number>;
    const claimed = fresh ? (daily ? st.missions.claimedDay : st.missions.claimedWeek) : [];
    if (claimed.includes(id)) { get().toast('이미 받았습니다', 'bad'); return false; }

    // id 가 'all' 이면 전부 달성 보너스
    const isAll = id === 'all';
    const def = isAll ? null : missionsOf(scope).find((m) => m.id === id) ?? null;
    if (!isAll && !def) return false;
    const ready = isAll ? allDone(scope, prog) : missionDone(def!, prog[def!.key] ?? 0);
    if (!ready) { get().toast('아직 달성하지 못했습니다', 'bad'); return false; }

    const reward = isAll ? allRewardOf(scope) : def!.reward;
    const scrolls = { ...st.scrolls };
    if (reward.scroll && reward.scrollQty) {
      scrolls[reward.scroll] = (scrolls[reward.scroll] ?? 0) + reward.scrollQty;
    }
    const nextClaimed = [...claimed, id];
    set({
      money: st.money + (reward.money ?? 0),
      scrolls,
      missions: {
        dayKey: day,
        weekKey: week,
        day: fresh || !daily ? (daily ? prog : st.missions.day) : EMPTY_GQ,
        week: fresh || daily ? (daily ? st.missions.week : prog) : EMPTY_GQ,
        claimedDay: daily ? nextClaimed : (st.missions.dayKey === day ? st.missions.claimedDay : []),
        claimedWeek: daily ? (st.missions.weekKey === week ? st.missions.claimedWeek : []) : nextClaimed,
      },
    });
    get().toast(`${isAll ? '전부 달성' : def!.label} — ${rewardLabel(reward)} 획득`, 'good');
    return true;
  },

  /**
   * 일괄 수령.
   *
   * 미션은 하루 네 칸 + 보너스, 주간 다섯 칸 + 보너스다. 다 채우고 나면 칸마다
   * 팝업을 열고 받고 닫기를 다섯 번 반복해야 했다 — 그 다섯 번이 보상이 아니라
   * 노동이었다. 여기서 한 번에 끝낸다.
   *
   * ⚠ 한 번의 `set` 으로 끝낸다. `claimMission` 을 반복 호출하면 그때마다
   * 리렌더가 돌고 토스트가 다섯 개 쌓인다. 무엇보다 각 호출이 `get()` 으로
   * 상태를 다시 읽으므로 중간에 하나라도 틀어지면 어디까지 받았는지가 흐려진다.
   *
   * @returns 받은 칸 수 (없으면 0)
   */
  claimAllMissions: (scope) => {
    const st = get();
    const now = Date.now();
    const day = dayKey(now);
    const week = weekKeyOf(now);
    const daily = scope === 'daily';
    const fresh = daily ? st.missions.dayKey === day : st.missions.weekKey === week;
    const prog = (fresh ? (daily ? st.missions.day : st.missions.week) : EMPTY_GQ) as Record<GqKey, number>;
    const claimed = fresh ? (daily ? st.missions.claimedDay : st.missions.claimedWeek) : [];

    const ids = claimableIds(scope, prog, claimed);
    if (!ids.length) { get().toast('받을 수 있는 보상이 없습니다', 'bad'); return 0; }

    const rewards = ids.map((id) =>
      (id === 'all' ? allRewardOf(scope) : missionsOf(scope).find((m) => m.id === id)!.reward));

    const scrolls = { ...st.scrolls };
    let money = st.money;
    for (const r of rewards) {
      money += r.money ?? 0;
      if (r.scroll && r.scrollQty) {
        scrolls[r.scroll] = (scrolls[r.scroll] ?? 0) + r.scrollQty;
      }
    }

    const nextClaimed = [...claimed, ...ids];
    set({
      money,
      scrolls,
      missions: {
        dayKey: day,
        weekKey: week,
        day: fresh || !daily ? (daily ? prog : st.missions.day) : EMPTY_GQ,
        week: fresh || daily ? (daily ? st.missions.week : prog) : EMPTY_GQ,
        claimedDay: daily ? nextClaimed : (st.missions.dayKey === day ? st.missions.claimedDay : []),
        claimedWeek: daily ? (st.missions.weekKey === week ? st.missions.claimedWeek : []) : nextClaimed,
      },
    });
    get().toast(`${ids.length}칸 수령 — ${bulkLabel(rewards)}`, 'good');
    return ids.length;
  },

  /**
   * 스킬 한 칸을 올린다. 값은 GP 가 아니라 **길드 레벨로 받은 포인트**다.
   * 찍는 건 길드장만 할 수 있다 — 아무나 찍으면 방향이 안 정해진다.
   */
  levelSkill: (id) => {
    const st = get();
    if (!st.guildId) { get().toast('길드에 속해 있어야 합니다', 'bad'); return false; }
    if (currentGuild(st)?.masterId !== rosterMeId()) {
      get().toast('길드장만 스킬을 찍을 수 있습니다', 'bad'); return false;
    }
    const cur = levelOf(st.guildSkills, id);
    if (cur >= SKILL_MAX) { get().toast('이미 최대 레벨입니다', 'bad'); return false; }
    const earned = skillPointsAt(guildLevelOf(st.guildExp).level);
    const free = freePoints(st.guildSkills, earned);
    if (free < SKILL_POINT_COST) {
      get().toast('스킬 포인트가 없습니다 — 길드 레벨을 올리세요', 'bad'); return false;
    }
    set({ guildSkills: { ...st.guildSkills, [id]: cur + 1 } });
    return true;
  },

  /**
   * 레이드 한 대.
   * 정산 창(자정~00:10)에는 막는다 — 그 10분에 넣은 딜이 어느 주기로 가는지
   * 애매해지고, 정산 결과를 눈으로 확인할 수 없다.
   */
  joinRaid: (id) => {
    const st = get();
    const now = Date.now();
    const def = RAID_DEFS[id];
    if (!st.guildId) { get().toast('길드에 속해 있어야 합니다', 'bad'); return { ok: false }; }
    if (inSettleWindow(now)) {
      get().toast(`정산 중입니다 — ${Math.ceil(settleLeft(now) / 60000)}분 뒤에 열립니다`, 'bad');
      return { ok: false };
    }
    const key = def.period === 'day' ? dayKey(now) : weekKeyOf(now);
    const day = dayKey(now);
    const cur = st.raids[id].periodKey === key
      ? st.raids[id]
      : { periodKey: key, damage: 0, tries: 0, dayKey: '', today: 0, claimed: false };
    if (cur.tries >= def.tries) {
      get().toast(`이번 ${def.period === 'day' ? '일일' : '주간'} 참여를 모두 썼습니다`, 'bad');
      return { ok: false };
    }
    const today = cur.dayKey === day ? cur.today : 0;
    if (today >= def.daily) {
      get().toast(`오늘은 ${def.daily}회까지입니다`, 'bad');
      return { ok: false };
    }

    const { guild, mates } = guildOf(st);
    const my = playerCurrentIlvl(st.equipped, titleMods(st).runeIlvlMul);
    const dmg = raidHit(my, guildEffects(st.guildSkills).raidDmgMul, Math.random);
    // 기여도는 피해에 조금만 비례한다 — 템렙 낮은 사람이 밀려나면 안 된다
    const gp = raidGp(def, dmg, my);
    // 길드 활동은 체력을 쓰지 않는다 (guildRaid.ts)
    set({
      guildPoints: st.guildPoints + gp,
      raids: {
        ...st.raids,
        [id]: { ...cur, damage: cur.damage + dmg, tries: cur.tries + 1, dayKey: day, today: today + 1 },
      },
    });
    applyWear(set, get);
    // 이 한 대로 넘어갔는지까지 알려 준다 — 연출이 "처치" 를 띄울 수 있어야 한다
    const killed = guild
      ? cur.damage + dmg + matesDamage(mates, def.period === 'day' ? 'raidD' : 'raidW', key)
        >= raidHp(def, guild)
      : false;
    return { ok: true, damage: dmg, killed, boss: raidBossName(id, key) };
  },

  /**
   * 길드 출석 — 하루 한 번.
   *
   * 레이드는 체력을 쓰고 아이템레벨을 탄다. 출석은 누구나 같은 값을 내는 자리다.
   * 보상은 **현재 길드 레벨만큼의 실버** — 길드가 자라면 이 숫자가 같이 커진다.
   */
  guildAttend: () => {
    const st = get();
    const now = Date.now();
    const { guild, mates: crew } = guildOf(st);
    if (!guild) { get().toast(noGuildMsg(st), 'bad'); return { ok: false }; }
    const day = dayKey(now);
    if (st.guildCheck.dayKey === day) {
      get().toast('오늘은 이미 길드 출석을 했습니다', 'bad');
      return { ok: false };
    }

    const level = guildLevelOf(st.guildExp).level;
    const money = attendReward(level);
    // 오늘 실제로 출석한 길드원 수. 나 혼자면 정말 1명이다
    const mates = matesAttended(crew, day);
    const exp = attendExp(mates);
    const before = level;
    const after = guildLevelOf(st.guildExp + exp).level;

    set({
      money: st.money + money,
      guildPoints: st.guildPoints + ATTEND_GP,
      guildExp: st.guildExp + exp,
      guildCheck: { dayKey: day, total: st.guildCheck.total + 1 },
    });
    get().toast(`길드 출석 — ${fmtShort(money)} · 기여도 +${ATTEND_GP}`, 'good');
    if (after > before) {
      get().toast(`길드 레벨 ${after} 달성 — 스킬 포인트 +${after - before}`, 'good');
    }
    return { ok: true, money, exp, gp: ATTEND_GP, mates };
  },

  joinBoss: () => {
    const st = get();
    const now = Date.now();
    if (!st.guildId) { get().toast('길드에 속해 있어야 합니다', 'bad'); return { ok: false }; }
    if (!bossOpen(now)) { get().toast('합동 사냥은 금~일에만 열립니다', 'bad'); return { ok: false }; }
    const week = weekKeyOf(now);
    const day = dayKey(now);
    const b = st.guildBoss.weekKey === week
      ? st.guildBoss
      : { weekKey: week, damage: 0, tries: 0, dayKey: '', today: 0, claimed: false };
    const today = b.dayKey === day ? b.today : 0;
    if (today >= BOSS_DAILY_TRIES) {
      get().toast(`오늘은 ${BOSS_DAILY_TRIES}회까지입니다`, 'bad');
      return { ok: false };
    }
    const my = playerCurrentIlvl(st.equipped, titleMods(st).runeIlvlMul);
    const dmg = myHit(my, Math.random);
    // 길드 활동은 체력을 쓰지 않는다 (guildRaid.ts)
    set({
      guildBoss: { ...b, damage: b.damage + dmg, tries: b.tries + 1, dayKey: day, today: today + 1 },
    });
    applyWear(set, get);
    return { ok: true, damage: dmg };
  },

  claimBoss: () => {
    const st = get();
    const { guild, mates } = guildOf(st);
    if (!guild) return false;
    const now = Date.now();
    const week = weekKeyOf(now);
    if (st.guildBoss.weekKey !== week || st.guildBoss.claimed) return false;
    if (st.guildBoss.tries <= 0) { get().toast('참여 기록이 없습니다', 'bad'); return false; }
    // 주간이 끝나기 전에는 수령할 수 없다 (마지막 순위가 확정되지 않는다)
    if (bossOpen(now)) { get().toast('사냥 주간이 끝난 뒤에 수령할 수 있습니다', 'bad'); return false; }

    const rows = bossBoard(matesBossRows(mates, week), st.nickname, st.guildBoss.damage);
    const killed = totalDamage(rows) >= bossHp(guild);
    const rank = rows.findIndex((x) => x.isMe) + 1;
    const rw = bossReward(killed, rank, true);
    if (!rw) return false;
    set({
      guildPoints: st.guildPoints + rw.gp,
      scrolls: { ...st.scrolls, [rw.scroll]: (st.scrolls[rw.scroll] ?? 0) + 1 },
      materials: rw.material
        ? { ...st.materials, [MATERIAL_IDS[0]]: (st.materials[MATERIAL_IDS[0]] ?? 0) + rw.material }
        : st.materials,
      guildBoss: { ...st.guildBoss, claimed: true },
    });
    get().toast(`${killed ? '토벌 성공' : '토벌 실패'} — ${rw.label} 보상 수령`, killed ? 'good' : 'plain');
    return true;
  },

  claimDividend: () => {
    const st = get();
    const { guild, mates } = guildOf(st);
    if (!guild) { get().toast(noGuildMsg(st), 'bad'); return false; }
    const day = dayKey(Date.now());
    if (st.dividendDay === day) { get().toast('오늘 배당은 이미 받았습니다', 'bad'); return false; }
    const geff = guildEffects(st.guildSkills);
    // 금고는 길드원들이 올린 기여도의 합에서 나온다 — 나 혼자면 내 몫만 찬다
    const amount = dividendFor(
      matesWeekly(mates), weeklyPointsOf(st), st.equipped, geff.dividendMul);
    set({ money: st.money + amount, dividendDay: day });
    get().toast(amount > 0 ? `길드 배당 ${fmtShort(amount)}` : '이번엔 배당이 없습니다',
      amount > 0 ? 'good' : 'plain');
    return true;
  },
});
