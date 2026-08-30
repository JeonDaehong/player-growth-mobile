/**
 * 심연 — 로그라이크 하강 (docs/ABYSS_ALCHEMY_DESIGN.md).
 *
 * 탐험·탑은 한 방 판정이라 진행 중에 고민할 게 없다. 심연은 **연속 판정 + 자발적 탈출**이다.
 * 화면에 버튼이 둘뿐이다 — [더 내려간다] / [귀환한다].
 * 귀환하면 누적 보상을 받고, 실패하면 전부 소멸한다.
 *
 * 곡선을 상수로 박지 않는다. `combat.ts:CURVE_SCALE` 과 같은 이유다 —
 * 부위 가중치나 마일스톤을 건드리면 상수가 조용히 어긋난다.
 */
import { Rand, rnd } from './rng';
import { fullSetIlvl, maxSetIlvl, toAvg } from './tiers';
import { b } from './currency';

/** 1층 = 티어 6 +15 풀셋, 이 층에서 최고 세트와 만난다 */
export const ABYSS_FLOORS_TO_MAX = 20;
/** 입장 체력 — 이 게임에서 가장 무거운 콘텐츠 (탑 12보다 높다) */
export const ABYSS_STAMINA = 15;
/** 층당 착용 장비 전체 내구도 소모(%p). 깊이가 곧 페널티라 별도 제동 규칙이 필요 없다 */
export const ABYSS_DUR_COST = 2;

const abyssBase = () => fullSetIlvl(6, 15);
const abyssStep = () => (maxSetIlvl() - abyssBase()) / (ABYSS_FLOORS_TO_MAX - 1);

/** n 층 권장 아이템레벨(합). 상한이 없다 — 심연만 위로 열려 있다 */
export const abyssRecIlvl = (n: number) => Math.round(abyssBase() + (n - 1) * abyssStep());

/**
 * n 층 통과 확률 (0~1).
 *
 * ⚠ 탐험·탑·투기장의 `ilvlWinRate` 를 쓰지 않는다. 저 곡선은 **한 방 판정**용이라
 * 비율 차이에 아주 가파르다 (1.5배면 93%, 1.5배 모자라면 20%). 심연은 그 판정을
 * **20번 연달아** 통과해야 하므로 같은 가파름을 물리면 완주 확률이 곱해져
 * 무너진다 — 최고 세트의 20층 완주가 15% 에서 2.6% 가 됐다.
 *
 * 그래서 심연은 예전의 완만한 차이식을 **자기 곡선으로** 들고 간다.
 * 앵커는 그대로다: 그 층의 권장 템렙에 딱 맞추면 50%.
 */
const DESCENT_SLOPE = 0.6;
export function descentPass(myCur: number, recIlvl: number): number {
  const p = 50 + (toAvg(myCur) - toAvg(recIlvl)) * DESCENT_SLOPE;
  return Math.max(5, Math.min(95, p)) / 100;
}

export const abyssPass = (myCur: number, n: number) => descentPass(myCur, abyssRecIlvl(n));

// ── 드랍 ────────────────────────────────────────────────

export const ABYSS_MATERIALS = ['ash', 'shard', 'core'] as const;
export type AbyssMaterial = (typeof ABYSS_MATERIALS)[number];

export const ABYSS_MATERIAL_NAME: Record<AbyssMaterial, string> = {
  ash: '심연의 재', shard: '심연의 결정', core: '심연의 핵',
};

/** 결정이 나오기 시작하는 층 */
export const SHARD_FROM = 10;
export const SHARD_CHANCE = 0.6;
/**
 * 핵이 나오기 시작하는 층. **확정 드랍**이다 —
 * 확률로 두면 20층 도달 확률(약 15%)에 또 확률이 곱해져 기대 획득량이 무의미해진다.
 */
export const CORE_FROM = ABYSS_FLOORS_TO_MAX;

export interface FloorDrop {
  ash: number;
  shard: number;
  core: number;
  money: number;
}

/**
 * n 층을 통과했을 때의 획득물.
 *
 * 골드는 일부러 짜다. 후하게 주면 심연이 그냥 효율 좋은 파밍터가 되고,
 * 귀환/하강 선택이 계산 문제로 변한다. 심연의 가치는 재료여야 한다.
 */
export function floorDrop(n: number, r: Rand = rnd): FloorDrop {
  return {
    ash: 1 + Math.floor(r() * 3),
    shard: n >= SHARD_FROM && r() < SHARD_CHANCE ? 1 : 0,
    core: n >= CORE_FROM ? 1 : 0,
    money: b(Math.round(toAvg(abyssRecIlvl(n)) * 50)),
  };
}

export const emptyDrop = (): FloorDrop => ({ ash: 0, shard: 0, core: 0, money: 0 });

export const addDrop = (a: FloorDrop, x: FloorDrop): FloorDrop => ({
  ash: a.ash + x.ash, shard: a.shard + x.shard, core: a.core + x.core, money: a.money + x.money,
});

export const dropIsEmpty = (d: FloorDrop) => !d.ash && !d.shard && !d.core && !d.money;

/** 진행 중인 하강. 앱을 껐다 켜도 이어지도록 저장한다 */
export interface AbyssRun {
  /** 지금까지 통과한 층. 0 이면 입장만 한 상태 */
  floor: number;
  /** 아직 확정되지 않은 누적 보상 — 실패하면 통째로 사라진다 */
  bag: FloorDrop;
  startedAt: number;
}

export const newRun = (now: number): AbyssRun => ({ floor: 0, bag: emptyDrop(), startedAt: now });

/** 다음에 도전할 층 */
export const nextFloor = (run: AbyssRun) => run.floor + 1;

/** 누적 보상 한 줄 요약 */
export function bagSummary(bag: FloorDrop): string {
  const parts: string[] = [];
  if (bag.ash) parts.push(`재 ×${bag.ash}`);
  if (bag.shard) parts.push(`결정 ×${bag.shard}`);
  if (bag.core) parts.push(`핵 ×${bag.core}`);
  return parts.join(' · ') || '없음';
}
