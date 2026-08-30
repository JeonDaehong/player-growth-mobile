/**
 * 해방 — 장인 무구의 마일스톤을 돈으로 연다 (docs/ENHANCE_MILESTONE_DESIGN.md §6).
 *
 * 장인 무구는 무한 강화라 마일스톤이 +20, +25, +30 … 끝없이 생긴다.
 * 그걸 공짜로 주면 무한 성장이 되고, 팔면 끝나지 않는 골드 sink 가 된다. 후자를 택했다.
 *
 * 두 가지가 이 설계의 전부다.
 *   · **순서대로만** — +5 를 열지 않고 +10 을 열 수 없다
 *   · **영구** — 하락으로 그 아래로 떨어져도 해방은 유지된다.
 *     15% 하락으로 지출이 무효화되면 아무도 사지 않는다. 지출은 영구, 손실은 일시적.
 */
import { Item } from './types';
import { MILESTONE_CAP, MILESTONE_STEP, TIERS, isArtisan, kindWeight, round1 } from './tiers';

/** n 번째 해방 비용 = 10,000골드 × n. 보너스는 3번째부터 고정이라 효율이 계속 나빠진다 */
export const LIBERATION_BASE = 10_000;

export const freedOf = (item: Item) => Math.max(0, item.freed ?? 0);

/** 다음에 열 마일스톤의 강화 단계 (+5, +10 …) */
export const nextMilestoneLevel = (item: Item) => (freedOf(item) + 1) * MILESTONE_STEP;

/** 다음 해방 비용 */
export const liberationCost = (item: Item) => LIBERATION_BASE * (freedOf(item) + 1);

/** 다음 해방이 주는 아이템레벨 */
export function liberationGain(item: Item): number {
  const n = freedOf(item) + 1;
  const step = TIERS[item.tier].inc * kindWeight(item.kind);
  return round1(step * Math.min(n, MILESTONE_CAP));
}

export type LiberationBlock = 'not_artisan' | 'not_reached' | 'poor';

/**
 * 해방할 수 없는 이유. null 이면 가능하다.
 *
 * 도달하지 않은 마일스톤을 미리 사게 두면 "돈만 있으면 강화 없이 세진다"가 되어
 * 강화가 선택 사항이 된다. 반드시 강화가 앞서야 한다.
 */
export function liberationBlock(item: Item, money: number): LiberationBlock | null {
  if (!isArtisan(item.tier)) return 'not_artisan';
  if (item.level < nextMilestoneLevel(item)) return 'not_reached';
  if (money < liberationCost(item)) return 'poor';
  return null;
}

export const LIBERATION_MSG: Record<LiberationBlock, string> = {
  not_artisan: '장인의 무구에만 새길 수 있는 봉인입니다',
  not_reached: '아직 그 단계에 닿지 않았습니다',
  poor: '해방 비용이 부족합니다',
};

/** 해방을 적용한 새 장비. 실패하면 null */
export function liberate(item: Item, money: number): { item: Item; cost: number } | null {
  if (liberationBlock(item, money)) return null;
  return { item: { ...item, freed: freedOf(item) + 1 }, cost: liberationCost(item) };
}
