/**
 * 일일 · 주간 미션.
 *
 * 설계 원칙은 길드 주간 퀘스트(guildQuest.ts)와 같다 — **수락 버튼을 만들지 않는다.**
 * 평소 하던 걸 하면 칸이 알아서 찬다. 새 카운터도 만들지 않고, 이미 길드 퀘스트가
 * 쓰고 있는 진행 축(GqKey)에 그대로 얹는다. 축을 늘리면 그걸 올려 주는 자리를
 * 전부 찾아 고쳐야 하고, 한 군데 빼먹으면 영영 안 차는 칸이 생긴다.
 *
 * 보상은 골드·주문서로 준다. 주간을 전부 채우면 더 크게 준다 —
 * 무과금으로 다이아를 만질 수 있는 유일한 정규 창구다.
 */
import { GqKey } from './guildQuest';
import { ScrollId } from './types';
import { fmtShort, g, s } from './currency';

export type MissionScope = 'daily' | 'weekly';

export interface MissionDef {
  id: string;
  key: GqKey;
  label: string;
  /** 목표치 */
  goal: number;
  /** 금액 축인가 (표시 단위가 다르다) */
  money?: boolean;
  reward: MissionReward;
}

export interface MissionReward {
  money?: number;
  scroll?: ScrollId;
  scrollQty?: number;
}

/**
 * 일일 미션.
 *
 * 목표는 "접속해서 한 바퀴 돌면 끝나는" 선에 둔다. 하루치 체력(144)으로 탐험을
 * 도는 사람이 자연히 넘기는 수치라, 미션 때문에 따로 할 일이 생기지 않는다.
 */
export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: 'd_enhance', key: 'enhance', label: '강화 성공', goal: 5,
    reward: { money: g(1) },
  },
  {
    id: 'd_clear', key: 'clear', label: '탐험 · 보스의탑 클리어', goal: 3,
    reward: { money: g(1) },
  },
  {
    id: 'd_arena', key: 'arena', label: '투기장 승리', goal: 2,
    reward: { money: g(1), scroll: 'succ_low', scrollQty: 1 },
  },
  /*
    도박 칸의 목표는 **한 판 걸어 보면 넘는 선**이어야 한다.

    5골드 → 50실버 → 5실버로 두 번 내렸다. 미션을 채우려고 도박을 하게 되는데,
    이 게임에서 도박은 **돈을 잃으라고 있는 자리**라 일일 칸이 손실을 강요하면 안 된다.
    5실버면 크리처 러쉬 최소 배팅(1실버) 다섯 판 — 하다 보면 채워지는 선이고,
    작정하고 채우려 해도 잃을 게 별로 없다.
  */
  {
    id: 'd_gamble', key: 'gamble', label: '도박 배팅 누적', goal: s(5), money: true,
    reward: { money: g(1) },
  },
];

/** 일일 전부 달성 보너스 */
export const DAILY_ALL_REWARD: MissionReward = { money: g(4), scroll: 'succ_low', scrollQty: 1 };

/**
 * 주간 미션.
 *
 * 일일을 이레 내내 성실히 돌면 자연히 채워지는 양의 **1.4배쯤**으로 잡았다.
 * 그대로 두면 일일의 부록이 되고, 너무 높이면 주말에 몰아치는 노동이 된다.
 */
export const WEEKLY_MISSIONS: MissionDef[] = [
  {
    id: 'w_enhance', key: 'enhance', label: '강화 성공', goal: 50,
    reward: { money: g(8) },
  },
  {
    id: 'w_clear', key: 'clear', label: '탐험 · 보스의탑 클리어', goal: 30,
    reward: { money: g(8), scroll: 'succ_low', scrollQty: 1 },
  },
  {
    id: 'w_arena', key: 'arena', label: '투기장 승리', goal: 20,
    reward: { money: g(6), scroll: 'guard_down', scrollQty: 1 },
  },
  /* 일일(5실버)을 이레 모으면 35실버다. 1골드면 그 위에 살짝 얹은 선이다 */
  {
    id: 'w_gamble', key: 'gamble', label: '도박 배팅 누적', goal: g(1), money: true,
    reward: { money: g(6) },
  },
  {
    id: 'w_sell', key: 'sell', label: '장비 판매', goal: 10,
    reward: { money: g(5), scroll: 'succ_mid', scrollQty: 1 },
  },
];

/**
 * 주간 전부 달성 보너스 — 다이아.
 *
 * 100 다이아 = 최소 묶음(1,200원)과 같은 값이고, 캐시 아이템 하나가 1,000 다이아다.
 * 즉 **열 주를 꼬박 채워야 캐시 물건 하나**다. 300을 주면 3주면 되어 과금 유인이
 * 사라지고, 0을 주면 무과금이 다이아를 만질 길이 아예 없어진다. 그 사이에 둔다.
 */
export const WEEKLY_ALL_REWARD: MissionReward = {
  money: g(20), scroll: 'succ_high', scrollQty: 1,
};

export const missionsOf = (scope: MissionScope) =>
  (scope === 'daily' ? DAILY_MISSIONS : WEEKLY_MISSIONS);

export const allRewardOf = (scope: MissionScope) =>
  (scope === 'daily' ? DAILY_ALL_REWARD : WEEKLY_ALL_REWARD);

/** 한 칸이 끝났는가 */
export const missionDone = (def: MissionDef, progress: number) => progress >= def.goal;

/** 몇 칸을 끝냈는가 */
export function doneCount(scope: MissionScope, prog: Record<GqKey, number>): number {
  return missionsOf(scope).filter((m) => missionDone(m, prog[m.key] ?? 0)).length;
}

/** 전부 끝냈는가 */
export const allDone = (scope: MissionScope, prog: Record<GqKey, number>) =>
  doneCount(scope, prog) >= missionsOf(scope).length;

/**
 * 지금 받을 수 있는 칸들 — 달성했고 아직 안 받은 것.
 *
 * 일괄 수령이 무엇을 줄지 미리 세어 보는 데도 쓰고, 실제로 줄 때도 쓴다.
 * 두 곳이 각자 세면 "3개 받기" 를 눌렀는데 2개만 들어오는 일이 생긴다.
 * `'all'` (전부 달성 보너스)도 같은 목록에 넣는다 — 받는 사람 입장에서는
 * 그것도 그냥 받을 게 하나 더 있는 것이다.
 */
export function claimableIds(
  scope: MissionScope,
  prog: Record<GqKey, number>,
  claimed: readonly string[],
): string[] {
  const out = missionsOf(scope)
    .filter((m) => missionDone(m, prog[m.key] ?? 0) && !claimed.includes(m.id))
    .map((m) => m.id);
  if (allDone(scope, prog) && !claimed.includes('all')) out.push('all');
  return out;
}

/** 보상 여러 개를 한 덩어리로 — 일괄 수령 토스트가 이걸 쓴다 */
export function sumRewards(list: readonly MissionReward[]): MissionReward {
  const out: MissionReward = {};
  let money = 0;
  for (const r of list) {
    money += r.money ?? 0;
  }
  if (money) out.money = money;
  return out;
}

/**
 * 일괄 수령 요약 — 주문서는 종류가 섞이므로 **장수만** 센다.
 *
 * `rewardLabel` 은 한 칸의 보상을 적는 함수라 주문서 종류가 하나뿐이다.
 * 여러 칸을 합치면 종류가 여러 가지가 되는데, 거기까지 다 적으면 토스트가
 * 세 줄이 된다 — 몇 장인지만 말하고 나머지는 창고가 보여 준다.
 */
export function bulkLabel(list: readonly MissionReward[]): string {
  const parts: string[] = [];
  const sum = sumRewards(list);
  if (sum.money) parts.push(fmtShort(sum.money));
  const scrolls = list.reduce((a, r) => a + (r.scroll ? (r.scrollQty ?? 0) : 0), 0);
  if (scrolls) parts.push(`주문서 ${scrolls}장`);
  return parts.join(' + ');
}

/** 보상 한 줄 요약 — 목록과 토스트가 같은 문장을 쓴다 */
export function rewardLabel(r: MissionReward): string {
  const parts: string[] = [];
  if (r.money) parts.push(fmtShort(r.money));
  if (r.scroll && r.scrollQty) parts.push(`주문서 ${r.scrollQty}장`);
  return parts.join(' + ');
}

/** 자정까지 남은 ms */
export function untilMidnight(now: number): number {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now;
}

/** 다음 월요일 자정까지 남은 ms */
export function untilWeekReset(now: number): number {
  const d = new Date(now);
  const day = d.getDay();
  // 월요일(1) 이 시작. 오늘이 월요일이면 다음 월요일까지 7일.
  const ahead = ((8 - day) % 7) || 7;
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + ahead, 0, 0, 0, 0);
  return next.getTime() - now;
}

/** "2일 13시간" / "13시간 20분" / "20분" */
export function leftLabel(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d > 0) return `${d}일 ${h}시간`;
  if (h > 0) return `${h}시간 ${mm}분`;
  return `${mm}분`;
}
