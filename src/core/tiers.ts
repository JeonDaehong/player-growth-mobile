/** 장비 티어 테이블 (기획서 §3-2) 및 아이템레벨 계산. */
import { ARMOR_KINDS, ARTISAN_TIER, Item, PartKind, SLOT_ACCEPTS, SLOT_IDS, SlotId, Tier, WEAPON_KINDS } from './types';
import { artisanItemName } from './artisans';
import { g, s, b } from './currency';

export interface TierDef {
  tier: Tier;
  /** 접두어 (예: "낡은 검") */
  prefix: string;
  /** +0 기본 아이템레벨 */
  base: number;
  /** 강화 1회당 상승 */
  inc: number;
  /** 최대 강화 (장인은 Infinity) */
  maxLevel: number;
  /** 강화 1회 기본 비용 (쿠퍼) */
  enhanceBase: number;
  /** +0 판매가 (쿠퍼) */
  sellBase: number;
  /** 강화 1단계당 판매가 가산 (쿠퍼) */
  sellPerLevel: number;
  /** 다음 티어로 승급 비용 (쿠퍼). 최고 티어는 null */
  promoteCost: number | null;
}

/**
 * 티어 표.
 *
 * ## 승급 비용을 낮췄다 (2026-08)
 *
 * 2티어로 올라가는 데 50실버, 3티어에 2골드였다. 그런데 **승급은 아이템레벨이
 * 잠깐 떨어지는 일**이다 (강화가 +0 으로 돌아간다). 대가를 치르고 약해지는
 * 선택이라, 값이 조금만 세도 사람은 그냥 안 한다 — 실제로 2티어에서 멈췄다.
 *
 * 초반 네 칸을 크게 깎고(50실버 → 5실버, 2골드 → 30실버), 위로 갈수록 원래
 * 곡선으로 돌려놓는다. 후반 승급은 돈이 남아도는 시점의 일이라 벽이 아니다.
 *
 * ## 아이템레벨 계단을 세웠다 (base)
 *
 * `base` 는 그 티어의 0강 아이템레벨이다. 10 → 30 → 60 → 100 … 이었는데,
 * 승급 직후 체감이 밋밋했다 — 앞 티어 +15 로 키워 놓은 것보다 **낮은 데서**
 * 시작하니, 값을 치르고 올라갔는데 숫자가 내려갔다.
 *
 * 원래 표는 **승급하면 아이템레벨이 오히려 떨어졌다.** 1티어 무기를 +15 까지
 * 올려 놓으면 36 인데 2티어 0강이 30 이었다 — 값을 치르고 약해지는 것이라
 * 아무도 승급을 안 했다. 저티어일수록 심했다 (t1→t2 는 −15%).
 *
 * 지금은 각 티어의 base 가 **앞 티어 무기를 +15 까지 올린 값보다 20% 가까이
 * 위**다. 승급하는 순간 숫자가 확실히 뛰고, 그 뒤로 15칸을 더 올릴 여지가 있다.
 *
 * 값을 고를 때 세 가지를 동시에 만족시켜야 했다:
 *   · 티어 계단  — base[n+1] > (n티어 무기 +15) × 1.15
 *   · 부위 격차  — +15 에서 무기가 장신구보다 20% 이상 높다 (KIND_ILVL_WEIGHT)
 *   · 표시 가능  — inc 가 1 미만이면 "상승치 0" 으로 보인다
 * 셋은 서로 당기는 관계라 (계단을 키우려면 base 를 올려야 하는데, base 를 올리면
 * 강화가 차지하는 몫이 줄어 부위 격차가 작아진다) 사다리는 이 균형점이다.
 *
 * ⚠ 절대값이 커진 것은 밸런스에 영향이 없다. 승률은 `log(내 템렙 / 상대 템렙)` 로
 * **비율**만 보고(`ilvlWinRate`), 탐험·탑의 권장 곡선은 이 표에서 유도된다
 * (`maxSetIlvl` · `exploreRecIlvl`). 표를 고치면 곡선이 따라 움직인다.
 */
export const TIERS: Record<Tier, TierDef> = {
  1:  { tier: 1,  prefix: '낡은',      base: 10,  inc: 1,  maxLevel: 15, enhanceBase: b(5),   sellBase: b(1),    sellPerLevel: b(5),   promoteCost: s(5) },
  2:  { tier: 2,  prefix: '청동',      base: 30,  inc: 2,  maxLevel: 15, enhanceBase: b(50),  sellBase: s(20),   sellPerLevel: s(3),   promoteCost: s(30) },
  3:  { tier: 3,  prefix: '철',        base: 60,  inc: 3,  maxLevel: 15, enhanceBase: s(2),   sellBase: s(80),   sellPerLevel: s(12),  promoteCost: g(1.5) },
  4:  { tier: 4,  prefix: '강철',      base: 100, inc: 5,  maxLevel: 15, enhanceBase: s(8),   sellBase: g(3),    sellPerLevel: s(45),  promoteCost: g(6) },
  5:  { tier: 5,  prefix: '은',        base: 150, inc: 7,  maxLevel: 15, enhanceBase: s(25),  sellBase: g(10),   sellPerLevel: g(1.5), promoteCost: g(25) },
  6:  { tier: 6,  prefix: '금',        base: 220, inc: 10, maxLevel: 15, enhanceBase: s(70),  sellBase: g(28),   sellPerLevel: g(4),   promoteCost: g(80) },
  7:  { tier: 7,  prefix: '백금',      base: 300, inc: 14, maxLevel: 15, enhanceBase: g(2),   sellBase: g(72),   sellPerLevel: g(10),  promoteCost: g(240) },
  8:  { tier: 8,  prefix: '미스릴',    base: 400, inc: 18, maxLevel: 15, enhanceBase: g(5),   sellBase: g(180),  sellPerLevel: g(25),  promoteCost: g(700) },
  9:  { tier: 9,  prefix: '오리할콘',  base: 520, inc: 24, maxLevel: 15, enhanceBase: g(12),  sellBase: g(480),  sellPerLevel: g(65),  promoteCost: g(1800) },
  10: { tier: 10, prefix: '용린',      base: 660, inc: 30, maxLevel: 15, enhanceBase: g(30),  sellBase: g(1200), sellPerLevel: g(160), promoteCost: null },
  [ARTISAN_TIER]: {
    tier: ARTISAN_TIER, prefix: '장인의', base: 850, inc: 40, maxLevel: Infinity,
    enhanceBase: g(80), sellBase: g(3000), sellPerLevel: g(400), promoteCost: null,
  },
};

/** 일반 티어 1~10 (도감/상점용) */
export const NORMAL_TIERS: Tier[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const isArtisan = (tier: Tier) => tier >= ARTISAN_TIER;

/** 아이템의 순수 아이템레벨 (내구도 미반영) */
/**
 * 부위별 강화 가중치.
 *
 * 무기 한 자루가 반지 하나와 똑같이 오르면 무기를 올릴 이유가 없다.
 * 그렇다고 배로 벌어지면 나머지 15칸이 장식이 되므로 ±15% 안에서만 흔든다.
 *
 * 가중치는 **실제 슬롯 구성(무기 1 · 방어구 9 · 장신구 6)에 대해 합이 16**이 되도록
 * 골랐다 (1.15 + 9×1.05 + 6×0.90 = 16). 전체 아이템레벨 총합이 그대로라
 * 탐험·투기장 권장 곡선을 다시 맞출 필요가 없다.
 */
export const KIND_ILVL_WEIGHT = { weapon: 1.7, armor: 1.2, acc: 0.9 } as const;

/**
 * 실제 슬롯 구성으로 채운 최고 세트(10티어 +15)의 아이템레벨 합.
 *
 * 가중치를 바꾸면 이 값이 움직인다. 탐험·보스의탑 권장 곡선을 이 값에 맞춰
 * 스케일하므로, 가중치만 고쳐도 엔드게임 승률이 저절로 유지된다.
 * (예전에는 17,760 이 코드 곳곳에 상수로 박혀 있어 가중치를 건드리면 챕터 100
 *  승률이 50% → 82% 로 튀었다)
 */
/** 임의 티어·강화단계의 풀셋 아이템레벨 합 (실제 슬롯 구성 기준) */
export function fullSetIlvl(tier: Tier, level: number): number {
  /*
    ⚠ 식을 여기서 다시 쓰지 않는다.

    예전엔 `Math.round(base + inc*weight*level + milestone)` 를 손으로 적어 뒀는데,
    `baseItemLevel` 은 **0.1 단위**로 반올림한다 (`round1`). 두 값이 정수로 떨어지는
    동안에는 우연히 일치했지만, 티어 표의 `inc` 가 커지면서 가중치를 곱한 값에
    소수가 생기자 합이 어긋났다 (16칸에서 2.8 차이).

    같은 것을 두 번 적으면 언젠가 갈라진다. 실제 아이템을 만들어 `itemLevel` 에
    물어본다 — 그러면 갈라질 자리가 없다.
  */
  let sum = 0;
  for (const slot of SLOT_IDS) {
    const kind = slot === 'weapon' ? 'sword' : SLOT_ACCEPTS[slot][0];
    sum += itemLevel(newItem(kind, tier, level, 100));
  }
  return round1(sum);
}

export function maxSetIlvl(): number {
  return fullSetIlvl(10, 15);
}

// ── 강화 마일스톤 (docs/ENHANCE_MILESTONE_DESIGN.md) ────
//
// +1~+15 는 랜드마크 없는 평지였다. 5칸마다 계단을 놓는다.
// 부수 효과가 본체다 — +10·+15 직후의 하락이 3~4배 아파진다.

/** 마일스톤 간격 */
export const MILESTONE_STEP = 5;
/**
 * 한 마일스톤이 주는 최대 배수 (강화 3회분).
 * 이 캡이 없으면 무한 강화 구간에서 보너스가 2차식으로 터진다 (+50 이면 55회분).
 */
export const MILESTONE_CAP = 3;

/**
 * +5n 에서 받는 추가 아이템레벨.
 *
 * `freed` 는 장인 무구 전용 게이트다. 장인은 마일스톤이 봉인되어 있고
 * 해방(liberation.ts)으로 순서대로 연다 — 무한 강화에 공짜 무한 성장을 주지 않기 위해서다.
 * 일반 티어(1~10)는 게이트가 없다 (freed 를 무시한다).
 */
export function milestoneBonus(kind: PartKind, tier: Tier, level: number, freed = 0): number {
  const step = TIERS[tier].inc * kindWeight(kind);
  const reached = Math.floor(level / MILESTONE_STEP);
  const open = isArtisan(tier) ? Math.min(reached, Math.max(0, freed)) : reached;
  let sum = 0;
  for (let n = 1; n <= open; n++) sum += step * Math.min(n, MILESTONE_CAP);
  return sum;
}

/** 다음 마일스톤까지 남은 강화 횟수 (0 이면 지금이 마일스톤) */
export const toNextMilestone = (level: number) =>
  (MILESTONE_STEP - (level % MILESTONE_STEP)) % MILESTONE_STEP;

export function kindWeight(kind: PartKind): number {
  if ((WEAPON_KINDS as readonly string[]).includes(kind)) return KIND_ILVL_WEIGHT.weapon;
  if ((ARMOR_KINDS as readonly string[]).includes(kind)) return KIND_ILVL_WEIGHT.armor;
  return KIND_ILVL_WEIGHT.acc;
}

/** 이 부위의 강화 1회당 상승치 (표시용) */
export function kindInc(kind: PartKind, tier: Tier): number {
  return Math.round(TIERS[tier].inc * kindWeight(kind) * 10) / 10;
}

/**
 * 아이템레벨. 부위 가중치가 소수를 만들어서(무기 ×1.7 → 강화당 +1.7) 정수로
 * 자르지 않는다. 반올림 대신 **소수 1자리**로만 정리해 부동소수 잡음을 없앤다.
 * 표시는 fmtIlvl 이 담당한다 (소수부가 0 이면 안 보여준다).
 */
export function itemLevel(item: Item): number {
  return round1(baseItemLevel(item) * (item.alch ?? 1));
}

/**
 * 연성액 배수를 **빼고** 계산한 아이템레벨.
 *
 * 수리비가 이걸 쓴다 — 연성액은 장비를 세게 만들 뿐 비싸게 만들면 안 된다
 * (배수를 itemLevel 에 넣으면 수리비가 최대 2배가 된다).
 */
export function baseItemLevel(item: Item): number {
  const t = TIERS[item.tier];
  // 정령석 보너스는 개별 값만 여기서 더한다 (세트 시너지는 core/spirit 이 따로 얹는다)
  const rune = item.spirit ? (SPIRIT_ILVL[item.spirit.grade] ?? 0) : 0;
  return round1(
    t.base
    + t.inc * kindWeight(item.kind) * item.level
    + milestoneBonus(item.kind, item.tier, item.level, item.freed)
    + rune,
  );
}

/**
 * 등급별 정령석 아이템레벨 (docs/SPIRIT_STONE_DESIGN.md §3).
 * core/spirit 을 import 하면 순환이 생겨 값만 옮겨 둔다 — 스모크가 두 표의 일치를 검사한다.
 */
const SPIRIT_ILVL: Record<string, number> = {
  F: 7, E: 14, D: 25, C: 40, B: 60, A: 90, S: 130, SS: 190, SSS: 280,
};

/** 소수 1자리로 정리 — 0.1 단위 합이 어긋나는 것을 막는다 */
export const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * 내구도 보정이 반영된 "현재 아이템레벨" (§10)
 * 내구도 50% 이하부터, 1%p 하락당 현재 아이템레벨 −1%.
 */
export function currentItemLevel(item: Item): number {
  const raw = itemLevel(item);
  if (item.dur >= 50) return raw;
  const penalty = (50 - item.dur) / 100; // dur 0 → 50% 감소
  return round1(raw * (1 - penalty));
}

/** 장비 이름: "낡은 검 +3", 장인 무구는 "둔카락스의 검 +3" */
export function itemName(item: Item, kindName: Record<PartKind, string>): string {
  const base = isArtisan(item.tier)
    ? artisanItemName(item.kind)
    : `${TIERS[item.tier].prefix} ${kindName[item.kind]}`;
  return item.level > 0 ? `${base} +${item.level}` : base;
}

export type Equipped = Partial<Record<SlotId, Item>>;

/** 슬롯 수. 기획서의 밸런스 곡선이 '16슬롯 평균' 기준이라 환산 상수로도 쓴다. */
export const SLOT_COUNT = SLOT_IDS.length;

/**
 * 플레이어 아이템레벨 = 착용 16슬롯 아이템레벨의 **합**.
 *
 * ⚠ 기획서 §3-1 은 "평균"으로 정의하지만, 평균은 슬롯 하나를 강화해도 1/16 만
 * 올라 강화가 반영되지 않는 것처럼 보인다(실제로 혼동을 유발했다). 그래서
 * 합으로 바꿨다.
 *
 * 대신 §7-3~7-6 의 권장 템렙 곡선은 전부 평균 기준으로 짜여 있으므로,
 * 곡선 쪽을 SLOT_COUNT 배로 올려 상대 난이도를 그대로 보존한다 (→ combat.ts).
 */
export function playerIlvl(eq: Equipped): number {
  let sum = 0;
  for (const slot of SLOT_IDS) {
    const it = eq[slot];
    if (it) sum += itemLevel(it);
  }
  return round1(sum);
}

/**
 * 내구도 보정 후 플레이어 아이템레벨 — 실제 전투에 쓰이는 값 (§10)
 *
 * `runeIlvlMul` 은 칭호 보정(룬의 대가·태초를 본 자). 화면의 아이템레벨과
 * 전투가 쓰는 값이 갈라지면 "표시는 올랐는데 안 이긴다"가 되므로 같이 얹는다.
 */
export function playerCurrentIlvl(eq: Equipped, runeIlvlMul = 1): number {
  let sum = 0;
  let rune = 0;
  for (const slot of SLOT_IDS) {
    const it = eq[slot];
    if (!it) continue;
    sum += currentItemLevel(it);
    if (it.spirit) rune += SPIRIT_ILVL[it.spirit.grade] ?? 0;
  }
  return round1(sum + rune * (runeIlvlMul - 1));
}

/** 슬롯 평균 환산 — 기획서 곡선/금액 계수와 비교할 때만 쓴다 */
export const toAvg = (ilvlSum: number) => ilvlSum / SLOT_COUNT;

export function equippedCount(eq: Equipped): number {
  return SLOT_IDS.filter((sl) => !!eq[sl]).length;
}

/** 아이템레벨 표기 — 합이라 값이 크다. 천 단위 구분자를 넣는다. */
/**
 * 아이템레벨 표기. 소수부가 있으면 첫째 자리까지, 없으면 정수로.
 *   1425   → "1,425"
 *   11.7   → "11.7"
 *   160.05 → "160.1"  (0.1 단위로 이미 정리되어 이런 값은 잘 없다)
 */
export function fmtIlvl(n: number): string {
  const v = round1(n);
  const frac = Math.abs(v % 1) > 1e-9;
  return v.toLocaleString('en-US', {
    minimumFractionDigits: frac ? 1 : 0,
    maximumFractionDigits: 1,
  });
}

/** 내구도 보정이 걸려 있는가 (홈/전투 진입 화면 경고 표시용, §10 UX 필수) */
export function hasDurabilityPenalty(eq: Equipped): boolean {
  return SLOT_IDS.some((sl) => {
    const it = eq[sl];
    return !!it && it.dur < 50;
  });
}

let _seq = 0;
export function newItem(kind: PartKind, tier: Tier, level = 0, dur = 100): Item {
  _seq += 1;
  return { id: `${kind}-${tier}-${Date.now().toString(36)}-${_seq.toString(36)}`, kind, tier, level, dur };
}
