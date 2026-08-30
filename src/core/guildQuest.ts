/**
 * 길드 주간 퀘스트 (docs/GUILD_CONTENT_DESIGN.md §2).
 *
 * 핵심은 **또 다른 노동을 만들지 않는 것**이다. 수락 버튼이 없다 —
 * 강화하면 강화 칸이, 도박하면 도박 칸이 알아서 찬다.
 *
 * 목표는 길드 합산이고 **구성원 수에 비례**한다. 같은 목표를 주면 큰 길드가 무조건
 * 유리해서 길드 선택이 "제일 큰 곳"으로 끝난다. 비례시키면 큰 길드 = 안정,
 * 작은 길드 = 고배당 구도가 된다.
 */
import { Guild } from './guilds';
import { g } from './currency';

export const GQ_SLOTS = 5;
export const GQ_GP = 100;
/** 5개 전부 달성 보너스 */
export const GQ_BONUS_GP = 200;

/** 통계에서 바로 세지는 축만 쓴다 — 새 카운터를 만들면 그게 곧 노동이다 */
export type GqKey = 'enhance' | 'clear' | 'arena' | 'gamble' | 'sell';

export interface GqDef {
  key: GqKey;
  label: string;
  /** 구성원 1인당 목표 */
  per: number;
  /** 금액 축인가 (표시 단위가 다르다) */
  money?: boolean;
}

export const GQ_DEFS: GqDef[] = [
  { key: 'enhance', label: '강화 성공 누적', per: 3 },
  { key: 'clear', label: '탐험 · 보스의탑 클리어', per: 2 },
  { key: 'arena', label: '투기장 승리', per: 1 },
  { key: 'gamble', label: '도박 배팅 누적', per: g(0.5), money: true },
  // 장비를 파는 건 이 게임에서 손절이다. 길드가 손절을 칭찬하면 파산 루트에 명분이 생긴다
  { key: 'sell', label: '장비 판매', per: 1 },
];

export const goalOf = (def: GqDef, members: number) => Math.round(def.per * Math.max(1, members));

export interface GqProgress {
  def: GqDef;
  goal: number;
  /** 길드원들이 채운 몫 (나 제외) */
  crew: number;
  mine: number;
  total: number;
  done: boolean;
}

/**
 * 진행판.
 *
 * 예전엔 `npcProgress()` 가 없는 사람들의 몫을 목표의 30~60% 만큼 **지어내서**
 * 미리 채워 뒀다. 혼자 들어와도 판이 반쯤 차 있었고, 그래서 다섯 칸이 그냥
 * 채워졌다 — 길드에 사람이 있든 없든 결과가 같았다.
 *
 * 지금 `crew` 는 같은 길드원들이 실제로 올린 몫의 합이다 (state/useGuilds.ts).
 * 나 혼자면 0이고, 목표도 인원 비례라 혼자짜리 길드는 1인분 목표를 받는다.
 *
 * 내 몫은 반드시 분리해서 돌려준다 — 합산만 보이면 참여 동기가 사라진다.
 */
export function questBoard(
  guild: Guild, mine: Record<GqKey, number>, crew: Record<string, number> = {},
): GqProgress[] {
  return GQ_DEFS.map((def) => {
    const goal = goalOf(def, guild.members);
    const others = Math.max(0, crew[def.key] ?? 0);
    const my = Math.max(0, mine[def.key] ?? 0);
    const total = others + my;
    return { def, goal, crew: others, mine: my, total, done: total >= goal };
  });
}

/** 이번 주에 확정된 GP */
export function questGp(board: GqProgress[]): number {
  const done = board.filter((x) => x.done).length;
  return done * GQ_GP + (done === board.length ? GQ_BONUS_GP : 0);
}
