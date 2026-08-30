/**
 * 정령석 (룬각인).
 *
 * 설계는 docs/SPIRIT_STONE_DESIGN.md. 이 파일은 그 문서를 그대로 옮긴 **순수 함수**다.
 * 표(등급·확률·특성·수치)는 spiritPreview 에 있고, 여기서는 뽑기·합산·상한을 다룬다.
 */
import type { Item, PartKind, Tier } from './types';
import { SLOT_IDS } from './types';
import type { Equipped } from './tiers';
import {
  AXES, Axis, GRADES, GRADE_INFO, Grade, SET_STEPS, STONES, StoneTier, TRAITS, Trait, traitsOf,
} from './spiritPreview';
import type { Rand } from './rng';

/** 룬각인을 받을 수 있는 최소 티어 — 3티어(철) 이상 */
export const RUNE_MIN_TIER: Tier = 3;

export interface Spirit {
  grade: Grade;
  /** TRAITS 의 name */
  trait: string;
}

export const canEngrave = (item: Item) => item.tier >= RUNE_MIN_TIER;

/** 못 새기는 이유 (없으면 null) */
export function engraveBlock(item: Item): string | null {
  if (!canEngrave(item)) return `${RUNE_MIN_TIER}티어 이상 장비에만 새길 수 있습니다`;
  return null;
}

// ── 뽑기 ───────────────────────────────────────────────

/** 정령석 하나를 굴린다 — 등급 → 그 등급의 특성 하나 */
export function roll(stone: StoneTier, r: Rand = Math.random): Spirit {
  const def = STONES.find((s) => s.id === stone)!;
  let x = r() * 100;
  let grade: Grade = GRADES[0];
  for (const g of GRADES) {
    const p = def.odds[g];
    if (p === undefined) continue;
    grade = g;
    if (x < p) break;
    x -= p;
  }
  const pool = traitsOf(grade);
  return { grade, trait: pool[Math.floor(r() * pool.length)].name };
}

export const traitOf = (s: Spirit): Trait | undefined =>
  TRAITS.find((t) => t.name === s.trait && t.grade === s.grade);

// ── 수치 ───────────────────────────────────────────────

/** 축별 등급 수치 (설계 §3-3) */
const AXIS_VALUE: Record<string, Record<Grade, number>> = {
  rate:   { F: 0.1,  E: 0.2, D: 0.4, C: 0.7,  B: 1.1, A: 1.8, S: 3,  SS: 5,  SSS: 8 },
  reward: { F: 0.5,  E: 1,   D: 2,   C: 3.5,  B: 5,   A: 8,   S: 12, SS: 18, SSS: 25 },
  arena:  { F: 0.1,  E: 0.2, D: 0.3, C: 0.5,  B: 0.8, A: 1.2, S: 2,  SS: 3.5, SSS: 5 },
  dur:    { F: 1,    E: 2,   D: 4,   C: 7,    B: 11,  A: 18,  S: 30, SS: 40, SSS: 50 },
  cost:   { F: 0.5,  E: 1,   D: 2,   C: 3.5,  B: 5,   A: 8,   S: 12, SS: 18, SSS: 25 },
  enh:    { F: 0.05, E: 0.1, D: 0.2, C: 0.35, B: 0.5, A: 0.8, S: 1.2, SS: 2, SSS: 3 },
  guard:  { F: 0.5,  E: 1,   D: 2,   C: 3,    B: 5,   A: 8,   S: 12, SS: 18, SSS: 25 },
};

/** 축 → 어느 수치표를 쓰는가 */
const AXIS_SCALE: Record<Axis, keyof typeof AXIS_VALUE> = {
  explore_rate: 'rate',
  tower_rate: 'rate',
  quest_rate: 'rate',
  explore_reward: 'reward',
  quest_reward: 'reward',
  parttime: 'reward',
  sell: 'reward',
  arena: 'arena',
  durability: 'dur',
  repair: 'cost',
  shop: 'cost',
  enhance_rate: 'enh',
  enhance_guard: 'guard',
};

export type Bonus = Partial<Record<Axis, number>>;

/** 상한 (설계 §5) — 개별 + 세트 합계에 적용 */
export const CAPS: Record<Axis, number> = {
  explore_rate: 25,
  tower_rate: 25,
  quest_rate: 20,
  explore_reward: 150,
  quest_reward: 100,
  parttime: 80,
  sell: 80,
  arena: 15,
  durability: 80,
  repair: 60,
  shop: 40,
  enhance_rate: 3,
  enhance_guard: 30,
};

const add = (b: Bonus, a: Axis, v: number) => { b[a] = (b[a] ?? 0) + v; };

/** 정령석 하나가 주는 효과 */
export function spiritBonus(s: Spirit): Bonus {
  const t = traitOf(s);
  const out: Bonus = {};
  if (!t) return out;
  for (const a of t.axes) add(out, a, AXIS_VALUE[AXIS_SCALE[a]][s.grade]);
  return out;
}

/** 정령석 하나가 주는 아이템레벨 */
export const spiritIlvl = (s: Spirit) => GRADE_INFO[s.grade].ilvl;

// ── 세트 ───────────────────────────────────────────────

export interface SetCount {
  trait: string;
  grade: Grade;
  count: number;
  /** 지금 발동한 단계 (0 = 미발동) */
  step: number;
}

/** 착용 장비의 특성별 개수 */
export function setCounts(eq: Equipped): SetCount[] {
  const m = new Map<string, SetCount>();
  for (const slot of SLOT_IDS) {
    const sp = eq[slot]?.spirit as Spirit | undefined;
    if (!sp) continue;
    const key = `${sp.trait}|${sp.grade}`;
    const cur = m.get(key) ?? { trait: sp.trait, grade: sp.grade, count: 0, step: 0 };
    cur.count += 1;
    m.set(key, cur);
  }
  for (const v of m.values()) {
    v.step = SET_STEPS.filter((s) => v.count >= s.count).length;
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

/** 세트 단계 계수 (설계 §4-1) */
const setMul = (step: number) => (step <= 0 ? 0 : SET_STEPS[step - 1].mul);

/** 세트 시너지의 등급 계수 (설계 §4-2, 5세트 기준) */
const SET_BASE: Record<Grade, { reward: number; rate: number; arena: number; ilvl: number }> = {
  F:   { reward: 2,  rate: 0.1, arena: 0,   ilvl: 20 },
  E:   { reward: 3,  rate: 0.2, arena: 0,   ilvl: 40 },
  D:   { reward: 4,  rate: 0.3, arena: 0.2, ilvl: 70 },
  C:   { reward: 5,  rate: 0.5, arena: 0.3, ilvl: 110 },
  B:   { reward: 7,  rate: 0.7, arena: 0.5, ilvl: 170 },
  A:   { reward: 9,  rate: 1,   arena: 0.8, ilvl: 260 },
  S:   { reward: 12, rate: 1.5, arena: 1.2, ilvl: 380 },
  SS:  { reward: 16, rate: 2,   arena: 1.8, ilvl: 550 },
  SSS: { reward: 22, rate: 3,   arena: 2.5, ilvl: 800 },
};

export interface SpiritTotal {
  bonus: Bonus;
  /** 정령석이 더해 주는 아이템레벨 (개별 + 세트) */
  ilvl: number;
  sets: SetCount[];
  /** 상한에 걸린 축 */
  capped: Axis[];
}

/**
 * 착용 장비 전체의 정령석 효과.
 *
 * 개별 효과를 모두 더하고, 세트 단계별 시너지를 얹은 뒤, **마지막에 상한**을 건다.
 * 상한이 없으면 16칸 SSS 가 통과 확률을 100% 로 밀어 게임이 끝난다.
 */
/**
 * 착용 중인 정령석의 합계.
 *
 * `mods` 는 칭호 보정이다. 기본값 1 이라 칭호가 없으면 예전과 같은 값이 나온다 —
 * 보정을 호출부마다 곱하면 화면과 전투가 다른 아이템레벨을 보게 된다.
 */
export function spiritTotal(
  eq: Equipped,
  mods: { runeIlvlMul?: number; setSynergyMul?: number } = {},
): SpiritTotal {
  const runeMul = mods.runeIlvlMul ?? 1;
  const synMul = mods.setSynergyMul ?? 1;
  const bonus: Bonus = {};
  let ilvl = 0;

  for (const slot of SLOT_IDS) {
    const sp = eq[slot]?.spirit as Spirit | undefined;
    if (!sp) continue;
    ilvl += spiritIlvl(sp) * runeMul;
    for (const [a, v] of Object.entries(spiritBonus(sp))) add(bonus, a as Axis, v);
  }

  const sets = setCounts(eq);
  for (const s of sets) {
    if (s.step <= 0) continue;
    const mul = setMul(s.step) * synMul;
    const b = SET_BASE[s.grade];
    ilvl += b.ilvl * mul * runeMul;
    const t = TRAITS.find((x) => x.name === s.trait);
    if (!t) continue;
    // 그 특성이 건드리는 축에만 시너지를 준다
    for (const a of t.axes) {
      const scale = AXIS_SCALE[a];
      const v = scale === 'reward' || scale === 'cost' ? b.reward
        : scale === 'arena' ? b.arena : b.rate;
      add(bonus, a, v * mul);
    }
    // 16세트는 주 효과가 한 번 더 (설계 §4-1)
    if (s.count >= 16 && t.axes.length) {
      add(bonus, t.axes[0], AXIS_VALUE[AXIS_SCALE[t.axes[0]]][s.grade]);
    }
  }

  const capped: Axis[] = [];
  for (const a of Object.keys(bonus) as Axis[]) {
    const v = Math.round((bonus[a] ?? 0) * 100) / 100;
    if (v > CAPS[a]) { bonus[a] = CAPS[a]; capped.push(a); } else bonus[a] = v;
  }
  return { bonus, ilvl: Math.round(ilvl), sets, capped };
}

/** 효과 한 줄 설명 (부호와 단위를 축에 맞춰 붙인다) */
export function axisText(a: Axis, v: number): string {
  const pp = a === 'explore_rate' || a === 'tower_rate' || a === 'quest_rate'
    || a === 'arena' || a === 'enhance_rate' || a === 'enhance_guard';
  const minus = a === 'durability' || a === 'repair' || a === 'shop';
  const n = Math.round(v * 100) / 100;
  return `${AXES[a]} ${minus ? '−' : '+'}${n}${pp ? '%p' : '%'}`;
}

export { GRADES, GRADE_INFO, STONES, SET_STEPS, TRAITS, traitsOf, AXES };
export type { Grade, Axis, Trait, StoneTier, PartKind };
