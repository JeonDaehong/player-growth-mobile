/**
 * 강화 시스템 (기획서 §4)
 * 이 게임의 심장. 확률·비용·주문서 적용을 전부 순수 함수로 두어
 * 시뮬레이션(__sim__.ts)으로 밸런스를 검증할 수 있게 한다.
 */
import { ARTISAN_TIER, Item, ScrollId, Tier } from './types';
import { TIERS, isArtisan } from './tiers';
import { g } from './currency';
import { Rand, rnd } from './rng';

export type EnhanceOutcome = 'success' | 'fail' | 'downgrade' | 'destroy';

export interface Odds {
  success: number;
  fail: number;
  downgrade: number;
  destroy: number;
}

/** §4-1 강화 확률표 (전 티어 공통). index = 목표 강화 단계 */
const TABLE: Record<number, Odds> = {
  1:  { success: 95, fail: 5,  downgrade: 0,  destroy: 0 },
  2:  { success: 90, fail: 10, downgrade: 0,  destroy: 0 },
  3:  { success: 85, fail: 15, downgrade: 0,  destroy: 0 },
  4:  { success: 80, fail: 20, downgrade: 0,  destroy: 0 },
  5:  { success: 75, fail: 25, downgrade: 0,  destroy: 0 },
  6:  { success: 65, fail: 30, downgrade: 5,  destroy: 0 },
  7:  { success: 60, fail: 33, downgrade: 7,  destroy: 0 },
  8:  { success: 55, fail: 36, downgrade: 9,  destroy: 0 },
  9:  { success: 50, fail: 39, downgrade: 11, destroy: 0 },
  10: { success: 45, fail: 42, downgrade: 13, destroy: 0 },
  11: { success: 40, fail: 45, downgrade: 15, destroy: 0 },
  12: { success: 35, fail: 48, downgrade: 17, destroy: 0 },
  13: { success: 30, fail: 50, downgrade: 15, destroy: 5 },
  14: { success: 25, fail: 50, downgrade: 17, destroy: 8 },
  15: { success: 20, fail: 50, downgrade: 20, destroy: 10 },
};

/**
 * 장인 무구 확률 (docs/ENHANCE_MILESTONE_DESIGN.md §6-3).
 *
 * **파괴도 하락도 0 이다.** 장인 무구는 부러지지도, 내려가지도 않는다 —
 * 올라가거나, 제자리다. 브레이크는 페널티가 아니라 **확률 곡선 자체**가 맡는다.
 *
 * 예전엔 "+1 50% → +16 25% 고정 + 하락 15%" 였다. 그런데 고정 구간이 생기면
 * 위로 갈수록 어려워진다는 감각이 +16 에서 끊기고, 하락 15% 는 어렵게 올린 칸을
 * 되돌려 놓아 "무한 강화"가 벌칙처럼 느껴졌다.
 *
 * 지금은 **한 줄의 등비 곡선**이다. 두 점만 박아 두고 그 사이를 잇는다.
 *   · +1  (0 → 1)    = 60%    — 제련하자마자 첫 칸은 시원하게 붙는다
 *   · +100 (99 → 100) = 0.4%  — 세 자리 강화는 평생의 과업이다
 * 한 칸 오를 때마다 ×0.9506 이라 어디를 잘라 봐도 "바로 앞 칸보다 조금 더 어렵다".
 *
 * 하락이 사라진 만큼 기대 도달 레벨은 확률 곡선만으로 정해진다. 0.4% 아래로는
 * 내려가지 않게 바닥을 두어(+100 이후 고정) 무한 강화가 말 그대로 무한하도록 둔다.
 */
/** +1 성공률 (%) — 제련 직후 첫 칸 */
export const ARTISAN_TOP = 60;
/** ARTISAN_END_LEVEL 에서의 성공률 (%). 그 아래로는 내려가지 않는다 */
export const ARTISAN_END = 0.4;
/** 이 목표 단계에서 ARTISAN_END 에 닿는다 (99 → 100 강) */
export const ARTISAN_END_LEVEL = 100;
/** 한 칸당 감쇠율 — 위 두 점을 잇는 등비 (≈ ×0.9506) */
const ARTISAN_DECAY = Math.pow(ARTISAN_END / ARTISAN_TOP, 1 / (ARTISAN_END_LEVEL - 1));

/**
 * 장인 무구의 목표 단계별 확률.
 * 하락·파괴 없음 — 남는 건 전부 "실패(유지)" 다.
 */
export function artisanOdds(targetLevel: number): Odds {
  const step = Math.max(0, Math.round(targetLevel) - 1);
  const success = Math.max(ARTISAN_END, ARTISAN_TOP * Math.pow(ARTISAN_DECAY, step));
  return {
    success,
    fail: Math.max(0, 100 - success),
    downgrade: 0,
    destroy: 0,
  };
}

/** 목표 단계의 기본 확률. 목표 = item.level + 1 */
export function baseOdds(targetLevel: number): Odds {
  if (targetLevel >= 16) return artisanOdds(targetLevel);
  return { ...(TABLE[targetLevel] ?? TABLE[1]) };
}

/**
 * 티어 사다리.
 *
 * 기획서 §4-1 의 확률표는 전 티어 공통이지만, 그러면 낡은 검을 올리는 것과
 * 용린 무구를 올리는 것이 똑같이 어렵다.
 *
 * 핵심은 **낮은 단계에서는 티어 차이가 거의 없고, 높은 단계에서 크게 벌어진다**는 것:
 *   +1  → 1티어 100% · 2티어 97% · 10티어 76%   (티어당 ×0.97)
 *   +15 → 1티어 50%  · 8티어 3.2%  · 10티어 1.5%  (아래 앵커표)
 * 두 앵커 사이는 로그 공간에서 잇되, 가중치를 **제곱**으로 준다.
 * 직선으로 이으면 중간 단계까지 같이 무너져(10티어 +8 이 8.7%) 승급 사다리가
 * 끊긴다. 제곱을 쓰면 페널티가 +13~+15 에 몰려 "낮은 단계는 거의 차이 없고
 * 높은 단계에서 벌어진다"는 의도가 그대로 나온다.
 *
 * 결과적으로 고티어 +15 는 쿠지 A상(강화 확정 주문서)이 사실상 유일한 길이 된다 —
 * 오락실로 사람을 밀어 넣는 게 이 게임의 고리다.
 */

/** +1 성공률 (%) — 티어당 ×0.97 */
const lowSuccess = (tier: number) => Math.min(100, 100 * Math.pow(0.97, tier - 1));

/**
 * +15 성공률 (%) — 티어별 앵커.
 *
 * 사다리를 두 단계 완만하게 늘렸다. 처음엔 6티어가 3.2% 였는데 그러면 금 장비
 * 하나를 +15 로 만드는 데 평균 101 개를 터뜨려야 해서 승급 사다리가 사실상
 * 끊겼다. 지금은 **그 난이도가 8티어**에 오고, 1티어 50% 를 그대로 둔 채
 * 티어당 ×0.675 등비로 잇는다.
 */
const TOP_SUCCESS: Record<number, number> = {
  1: 50, 2: 34, 3: 23, 4: 15, 5: 10, 6: 7, 7: 4.7, 8: 3.2, 9: 2.2, 10: 1.5,
};

/** 옛 로그처럼 티어를 모를 때 쓰는 중간 티어 */
export const TIER_NEUTRAL = 6;

/** 티어·목표단계별 성공률 (%). 목표 = item.level + 1 */
export function tierSuccess(targetLevel: number, tier: number): number {
  const L = Math.min(15, Math.max(1, Math.round(targetLevel)));
  const t = Math.min(10, Math.max(1, Math.round(tier)));
  // 제곱 가중치 — 페널티를 고단계로 몰아 준다
  const w = Math.pow((L - 1) / 14, 2);
  const lo = Math.log(lowSuccess(t));
  const hi = Math.log(TOP_SUCCESS[t]);
  return Math.exp(lo * (1 - w) + hi * w);
}

/** 성공률에 배수를 걸고, 남은 확률을 실패군에서 비례로 맞춘다 */
function withSuccessMul(o: Odds, mul: number): Odds {
  if (mul === 1) return o;
  const success = Math.min(100, o.success * mul);
  const delta = success - o.success;
  const rest = o.fail + o.downgrade + o.destroy;
  if (rest <= 0) return { success, fail: 0, downgrade: 0, destroy: 0 };
  const k = Math.max(0, (rest - delta) / rest);
  return { success, fail: o.fail * k, downgrade: o.downgrade * k, destroy: o.destroy * k };
}

// ── 주문서 (§4-3) ──────────────────────────────────────
export interface ScrollDef {
  id: ScrollId;
  name: string;
  desc: string;
  price: number;
  /** 성공 확률 배수 */
  successMul?: number;
  /** 등급 하락 판정 시 방어 확률 */
  downGuard?: number;
  /** 파괴 판정 시 방어 확률 */
  destroyGuard?: number;
  /** 무조건 성공 */
  guarantee?: boolean;
}

export const SCROLLS: Record<ScrollId, ScrollDef> = {
  succ_low:  { id: 'succ_low',  name: '하급 강화 확률 상승', desc: '성공 확률 ×1.2', price: g(1),   successMul: 1.2 },
  succ_mid:  { id: 'succ_mid',  name: '중급 강화 확률 상승', desc: '성공 확률 ×1.3', price: g(5),   successMul: 1.3 },
  succ_high: { id: 'succ_high', name: '상급 강화 확률 상승', desc: '성공 확률 ×1.5', price: g(10),  successMul: 1.5 },
  guard_down:       { id: 'guard_down',       name: '등급 하락 확률 보정', desc: '등급 하락 판정 시 50% 방어', price: g(20),  downGuard: 0.5 },
  guard_destroy50:  { id: 'guard_destroy50',  name: '장비 파괴 확률 방어',  desc: '파괴 판정 시 50% 방어',     price: g(50),  destroyGuard: 0.5 },
  guard_destroy100: { id: 'guard_destroy100', name: '장비 파괴 완전 방어',  desc: '파괴 판정 시 100% 방어',    price: g(200), destroyGuard: 1.0 },
  /**
   * 강화 확정 주문서 — 쿠지 A상 전용. 상점 판매 없음(가격 0, SCROLL_ORDER 제외).
   * 1회 강화가 무조건 성공한다. 장인 무구의 높은 단계(성공률이 한 자리로 떨어지는 구간)에서
   * 가치가 극대화된다.
   */
  guarantee: { id: 'guarantee', name: '강화 확정 주문서', desc: '이번 강화 100% 성공', price: 0, guarantee: true },
};

/** 상점 판매 목록 — 확정 주문서는 비매품이라 제외 */
export const SCROLL_ORDER: ScrollId[] = [
  'succ_low', 'succ_mid', 'succ_high', 'guard_down', 'guard_destroy50', 'guard_destroy100',
];

/** 강화 화면에서 고를 수 있는 목록 — 확정 주문서를 맨 위에 둔다 */
export const ENHANCE_SCROLL_ORDER: ScrollId[] = ['guarantee', ...SCROLL_ORDER];

/**
 * 주문서를 반영한 실제 확률.
 * 성공률이 오른 만큼은 실패/하락/파괴에서 **비율대로** 깎는다.
 * (주문서는 1회 1장만 — 중첩 불가, §4-3)
 */
/**
 * 강화 성공률을 건드리는 모든 출처 (docs/GUILD_CONTENT_DESIGN.md §6).
 *
 * 네 곳에서 확률을 만지는데 각자 곱하기 시작하면 총량이 조용히 무너진다.
 * **여기 한 곳에서만 합산한다** — 호출부는 이 객체를 채워 넘길 뿐이다.
 */
export interface OddsMods {
  /** 칭호 등 고정 %p 가산 */
  bonusPct?: number;
  /** 정령석 enhance_rate — %p 가산 */
  spiritPct?: number;
  /** 길드 스킬 "대장간의 조언" — 곱 */
  guildMul?: number;
  /** 정령석·길드 파괴 방어 — 파괴 확률에서 빼는 %p */
  guardPct?: number;
}

/**
 * 총캡 — 어떻게 쌓아도 원래 확률의 1.75배를 넘지 않는다.
 * 주문서 ×1.5 · 길드 ×1.10 · 정령석 +3%p · 칭호 +0.1%p 가 전부 걸려도 여기서 잘린다.
 */
export const ODDS_TOTAL_CAP = 1.75;

export function effectiveOdds(
  targetLevel: number,
  scroll: ScrollId | null | undefined,
  bonusPct: number,
  /** 장비 티어. 확률이 티어에 따라 달라지므로 생략할 수 없다. */
  tier: number,
  mods: OddsMods = {},
): Odds {
  // 확정 주문서는 확률표를 아예 건너뛴다
  if (scroll && SCROLLS[scroll]?.guarantee) {
    return { success: 100, fail: 0, downgrade: 0, destroy: 0 };
  }
  /**
   * 장인의 무구는 티어 사다리를 타지 않고 **자기 곡선**(artisanOdds)을 쓴다.
   * 사다리를 그대로 물리면 +15 성공률이 0.05% 가 되어 무한 강화 자체가
   * 불가능해진다 — 장인 무구는 애초에 다른 규칙의 물건이다.
   */
  const artisan = targetLevel >= 16 || tier >= ARTISAN_TIER;
  const table = baseOdds(targetLevel);
  const o = artisan
    ? artisanOdds(targetLevel)
    : withSuccessMul(table, tierSuccess(targetLevel, tier) / table.success);
  const raw = o.success;

  // 총예산 — 곱은 곱끼리, 가산은 가산끼리 모은 뒤 마지막에 한 번만 캡을 씌운다
  const scrollMul = (scroll && SCROLLS[scroll]?.successMul) || 1;
  const guildMul = mods.guildMul ?? 1;
  const addPct = (bonusPct || 0) + (mods.spiritPct ?? 0);
  const target = Math.min(raw * scrollMul * guildMul + addPct, raw * ODDS_TOTAL_CAP);

  const success = Math.max(0, Math.min(100, target));
  const delta = success - raw;
  const rest = o.fail + o.downgrade + o.destroy;
  if (rest <= 0) return { success, fail: 0, downgrade: 0, destroy: 0 };

  // 오른 만큼은 실패군에서 비율대로 깎는다
  const k = Math.max(0, (rest - delta) / rest);
  const out: Odds = { success, fail: o.fail * k, downgrade: o.downgrade * k, destroy: o.destroy * k };

  // 파괴 방어는 파괴에서만 뺀다 (그만큼 단순 실패로 돌린다)
  const guard = mods.guardPct ?? 0;
  if (guard > 0 && out.destroy > 0) {
    const cut = Math.min(out.destroy, guard);
    out.destroy -= cut;
    out.fail += cut;
  }
  return out;
}

/** 강화 비용 = 티어 기본 강화비 × 레벨 계수 (§4-2) */
export function levelCoef(targetLevel: number): number {
  if (targetLevel <= 5) return 1;
  if (targetLevel <= 9) return 2;
  if (targetLevel <= 12) return 4;
  return 8; // +13~+15, 그리고 +16 이상 고정 ×8
}

export function enhanceCost(item: Item, scroll?: ScrollId | null): number {
  const target = item.level + 1;
  const base = TIERS[item.tier].enhanceBase * levelCoef(target);
  return base + (scroll ? SCROLLS[scroll].price : 0);
}

/** 이 장비를 더 강화할 수 있는가 (일반 티어는 +15 상한) */
export function canEnhance(item: Item): boolean {
  return item.level < TIERS[item.tier].maxLevel;
}

export interface EnhanceResult {
  outcome: EnhanceOutcome;
  /** 판정 후 아이템. destroy 면 null */
  item: Item | null;
  /** 주문서로 하락/파괴를 막았는가 (연출용) */
  guarded: boolean;
  odds: Odds;
  cost: number;
  /** 장인 무구 파괴 시 반환 재료 */
  refundMaterials: number;
}

/**
 * 강화 1회 판정. 순수 함수 — 소지금 차감은 호출자(store) 책임.
 */
export function tryEnhance(
  item: Item,
  scroll?: ScrollId | null,
  r: Rand = rnd,
  bonusPct = 0,
  /** 정령석·길드 보정. 총예산은 effectiveOdds 가 한 곳에서 합산한다 */
  mods: OddsMods = {},
): EnhanceResult {
  const target = item.level + 1;
  const odds = effectiveOdds(target, scroll, bonusPct, item.tier, mods);
  const cost = enhanceCost(item, scroll);
  const def = scroll ? SCROLLS[scroll] : undefined;

  const roll = r() * 100;
  let outcome: EnhanceOutcome;
  if (roll < odds.success) outcome = 'success';
  else if (roll < odds.success + odds.fail) outcome = 'fail';
  else if (roll < odds.success + odds.fail + odds.downgrade) outcome = 'downgrade';
  else outcome = 'destroy';

  let guarded = false;

  // 하락 방어 주문서
  if (outcome === 'downgrade' && def?.downGuard && r() < def.downGuard) {
    outcome = 'fail';
    guarded = true;
  }
  // 파괴 방어 주문서
  if (outcome === 'destroy' && def?.destroyGuard && r() < def.destroyGuard) {
    outcome = 'fail';
    guarded = true;
  }

  let next: Item | null = { ...item };
  let refund = 0;
  switch (outcome) {
    case 'success':
      next = { ...item, level: item.level + 1 };
      break;
    case 'fail':
      break; // 유지
    case 'downgrade':
      next = { ...item, level: Math.max(0, item.level - 1) };
      break;
    case 'destroy':
      // 장인 무구는 파괴되지 않는다 (artisanOdds().destroy === 0)
      next = null;
      break;
  }

  return { outcome, item: next, guarded, odds, cost, refundMaterials: refund };
}

// ── 승급 (§3-2, §3-3) ──────────────────────────────────
/** +15 달성 시 다음 티어 +0 으로 승급 가능. 100% 성공하지만 비용이 크다. */
export function canPromote(item: Item): boolean {
  if (isArtisan(item.tier)) return false;
  const t = TIERS[item.tier];
  return item.level >= t.maxLevel && t.promoteCost !== null;
}

export function promoteCost(item: Item): number | null {
  return TIERS[item.tier].promoteCost;
}

/**
 * 승급 — 티어가 오르고 강화는 +0 으로 돌아간다.
 *
 * 정령석 각인과 연성 배수는 **따라간다.**
 * 예전에는 둘 다 소멸시켰는데(설계 §6), SSS 를 뽑아 놓고 승급을 못 하는
 * 교착이 생겼다. 어렵게 얻은 것을 티어 올리기의 대가로 태우게 하면
 * 사람은 승급을 안 하고 멈춘다 — 성장 사다리를 막는 쪽이 더 나쁘다.
 * (파괴는 여전히 전부 잃는다 — 그건 강화 도박의 대가다)
 */
export function promote(item: Item): Item {
  return { ...item, tier: (item.tier + 1) as Tier, level: 0 };
}

/**
 * 제련에 필요한 재료 수.
 *
 * 예전엔 부위마다 따로 100개였는데(21종), 50층 클리어 10% 드랍이라 한 부위에
 * 1,000회 등반이 필요했다. 재료를 3계열로 묶어(번스타인) 현실적인 선으로 내렸다.
 *
 * 드랍이 확정에서 15%(+30% 로 1개 더)로 바뀌면서 회당 수급이 1.3 → 0.195 개가 됐다.
 * 25개를 그대로 두면 한 부위에 128회 등반이라 벽이 된다 — 같은 배율로 10개까지 내려
 * 한 부위 ≈ 51회를 맞췄다.
 */
export const ARTISAN_FORGE_MATERIALS = 10;
export const ARTISAN_FORGE_COST = g(500);
export { ARTISAN_TIER };
