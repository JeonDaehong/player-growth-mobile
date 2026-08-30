/**
 * 연금술 — 연성액 (docs/ABYSS_ALCHEMY_DESIGN.md §4).
 *
 * 심연 재료 + 채집류 부재료로 만든 연성액이 장비 아이템레벨에 배수를 건다.
 * 정령석과 **같은 규칙**이라 새로 외울 게 없다 — 한 등급 위는 하한과 상한이 함께 오르고,
 * 재부여하면 기존 배수가 사라지고, 승급하면 소멸한다.
 */
import { g } from './currency';
import { Rand, rnd } from './rng';
import { Item, Tier } from './types';

export const POTIONS = ['low', 'mid', 'high'] as const;
export type PotionTier = (typeof POTIONS)[number];

export const RESULTS = ['dross', 'refined', 'ethereal', 'auroral', 'mythic'] as const;
export type PotionResult = (typeof RESULTS)[number];

export const RESULT_NAME: Record<PotionResult, string> = {
  dross: '잔재', refined: '정련', ethereal: '영묘', auroral: '극광', mythic: '신화',
};

/** 결과 등급 확률 — 세 연성액 공통이라 표 하나만 외우면 된다 */
export const RESULT_ODDS: Record<PotionResult, number> = {
  dross: 60, refined: 25, ethereal: 10, auroral: 4, mythic: 1,
};

/** 등급별 배수 밴드 [하한, 상한]. 밴드 안에서는 균등 분포 */
export const BANDS: Record<PotionTier, Record<PotionResult, [number, number]>> = {
  low: {
    dross: [1.01, 1.03], refined: [1.04, 1.06], ethereal: [1.07, 1.10],
    auroral: [1.11, 1.15], mythic: [1.16, 1.20],
  },
  mid: {
    dross: [1.05, 1.10], refined: [1.11, 1.18], ethereal: [1.19, 1.28],
    auroral: [1.29, 1.40], mythic: [1.41, 1.50],
  },
  high: {
    dross: [1.15, 1.25], refined: [1.26, 1.40], ethereal: [1.41, 1.60],
    auroral: [1.61, 1.85], mythic: [1.86, 2.00],
  },
};

export interface PotionDef {
  id: PotionTier;
  name: string;
  /** 심연 재료 */
  ash: number;
  shard: number;
  core: number;
  /** 채집류 부재료 — 심연만 돌아서는 만들 수 없다 */
  byproduct: { activity: 'gather' | 'hunt' | 'fish'; grade: 'B' | 'A' | 'S'; qty: number };
  cost: number;
}

/** 제작비는 골드. 부재료가 세 활동에 하나씩 걸쳐 있어 콘텐츠가 한 줄로 묶인다 */
export const POTION_DEFS: Record<PotionTier, PotionDef> = {
  low: {
    id: 'low', name: '하급 연성액', ash: 12, shard: 0, core: 0,
    byproduct: { activity: 'gather', grade: 'B', qty: 1 }, cost: g(3),
  },
  mid: {
    id: 'mid', name: '중급 연성액', ash: 20, shard: 5, core: 0,
    byproduct: { activity: 'hunt', grade: 'A', qty: 1 }, cost: g(25),
  },
  high: {
    id: 'high', name: '상급 연성액', ash: 30, shard: 12, core: 2,
    byproduct: { activity: 'fish', grade: 'S', qty: 1 }, cost: g(150),
  },
};

/** 연성액을 부여할 수 있는 최소 티어 — 백금(7) */
export const ALCH_MIN_TIER: Tier = 7;

export const canImbue = (item: Item) => item.tier >= ALCH_MIN_TIER;

/** 부여할 수 없는 이유. null 이면 가능 */
export function imbueBlock(item: Item): string | null {
  if (!canImbue(item)) return `${ALCH_MIN_TIER}티어 이상 장비에만 부여할 수 있습니다`;
  return null;
}

export interface Potion {
  tier: PotionTier;
  result: PotionResult;
  /** 확정된 배수 */
  mul: number;
}

/** 결과 등급 하나를 뽑는다 */
export function rollResult(r: Rand = rnd): PotionResult {
  let x = r() * 100;
  for (const res of RESULTS) {
    x -= RESULT_ODDS[res];
    if (x < 0) return res;
  }
  return 'dross';
}

/** 연성액 한 병의 결과. 배수는 밴드 안 균등 (소수 둘째 자리) */
export function roll(tier: PotionTier, r: Rand = rnd): Potion {
  const result = rollResult(r);
  const [lo, hi] = BANDS[tier][result];
  const mul = Math.round((lo + r() * (hi - lo)) * 100) / 100;
  return { tier, result, mul };
}

/** 그 연성액의 기대 배수 (밴드 중앙 × 확률) */
export function expectedMul(tier: PotionTier): number {
  let sum = 0;
  for (const res of RESULTS) {
    const [lo, hi] = BANDS[tier][res];
    sum += ((lo + hi) / 2) * (RESULT_ODDS[res] / 100);
  }
  return Math.round(sum * 1000) / 1000;
}

/** 배수 표기 — "×1.24" */
export const fmtMul = (m: number) => `×${m.toFixed(2)}`;
