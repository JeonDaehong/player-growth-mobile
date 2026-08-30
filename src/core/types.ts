/** 게임 전역 도메인 타입. 순수 데이터만 — RN 의존 없음. */

// ── 장비 부위 (기획서 §3-1) ─────────────────────────────
/** 무기 11종 */
export const WEAPON_KINDS = [
  'spear', 'sword', 'blade', 'axe', 'mace', 'hammer', // 근거리 6
  'bow', 'crossbow',                                   // 원거리 2
  'staff', 'rod', 'fan',                               // 마법도구 3
] as const;
/** 방어구 5종 */
export const ARMOR_KINDS = ['chest', 'helm', 'glove', 'greaves', 'boot'] as const;
/** 장신구 4종 */
export const ACC_KINDS = ['ear', 'neck', 'ring', 'belt'] as const;

export const PART_KINDS = [...WEAPON_KINDS, ...ARMOR_KINDS, ...ACC_KINDS] as const;

export type WeaponKind = (typeof WEAPON_KINDS)[number];
export type ArmorKind = (typeof ARMOR_KINDS)[number];
export type AccKind = (typeof ACC_KINDS)[number];
export type PartKind = (typeof PART_KINDS)[number];

export const KIND_NAME: Record<PartKind, string> = {
  spear: '창', sword: '검', blade: '도', axe: '부', mace: '추', hammer: '망',
  bow: '활', crossbow: '노', staff: '봉', rod: '장', fan: '선',
  chest: '갑옷', helm: '투구', glove: '장갑', greaves: '각갑', boot: '신발',
  ear: '귀걸이', neck: '목걸이', ring: '반지', belt: '허리띠',
};

/** 공격 모션 분류 — 무기 종류별로 연출이 달라진다 (§1) */
export const WEAPON_MOTION: Record<WeaponKind, 'thrust' | 'slash' | 'smash' | 'shoot' | 'cast'> = {
  spear: 'thrust', sword: 'slash', blade: 'slash', axe: 'smash', mace: 'smash', hammer: 'smash',
  bow: 'shoot', crossbow: 'shoot', staff: 'cast', rod: 'cast', fan: 'cast',
};

export function isWeaponKind(k: PartKind): k is WeaponKind {
  return (WEAPON_KINDS as readonly string[]).includes(k);
}

// ── 착용 슬롯 10칸 ─────────────────────────────────────
/**
 * ## 좌우를 없앴다 (2026-08)
 *
 * 원래는 16칸이었다 — 견갑·장갑·신발이 좌우 두 짝이고, 귀걸이·반지도 좌우였다.
 * 그런데 **좌우가 아무 의미가 없었다.** 왼쪽 신발과 오른쪽 신발은 같은 물건을
 * 받고 같은 값을 내고 같은 아이템레벨을 준다. 칸이 하나 더 있을 뿐이라,
 * 강화할 때 똑같은 걸 두 번 해야 하는 것 말고는 달라지는 게 없었다.
 *
 * 방어구 세 부위는 **한 칸으로 합쳤다** (견갑·장갑·신발).
 *
 * ## 다시 줄였다 — 13 → 10칸 (2026-08)
 *
 * 귀걸이·반지도 **한 개씩**으로 줄이고, **견갑을 통째로 없앴다.** 남은 이유가
 * 좌우와 똑같았다 — 귀걸이 1과 귀걸이 2는 같은 물건을 받고 같은 값을 주므로,
 * 강화할 때 똑같은 걸 두 번 하는 것 말고는 달라지는 게 없었다. 칸이 줄면
 * 한 칸에 들이는 공이 그만큼 커지고, 그게 이 게임이 재미있어지는 방향이다.
 *
 * 흉갑은 **갑옷**으로 이름을 바꿨다. 부위 이름이 전부 낯선 한자어인데
 * 몸통만이라도 바로 읽히는 편이 낫다.
 *
 * 칸이 줄면 전체 아이템레벨 총합도 줄어든다. 탐험·탑·심연의 권장 곡선은 전부
 * `maxSetIlvl()` 에서 유도되므로(`SLOT_COUNT` 포함) 알아서 따라온다.
 * 빠진 칸에 있던 장비는 마이그레이션이 창고로 옮긴다 (`LEGACY_SLOT` → `fixEquipped`).
 */
export const SLOT_IDS = [
  'weapon',
  'helm', 'chest', 'glove', 'greaves', 'boot',
  'ear', 'neck', 'ring', 'belt',
] as const;
export type SlotId = (typeof SLOT_IDS)[number];

/** 각 슬롯이 받는 부위 종류. 무기 슬롯만 11종 중 아무거나. */
export const SLOT_ACCEPTS: Record<SlotId, readonly PartKind[]> = {
  weapon: WEAPON_KINDS,
  helm: ['helm'], chest: ['chest'],
  glove: ['glove'], greaves: ['greaves'], boot: ['boot'],
  ear: ['ear'], neck: ['neck'], ring: ['ring'], belt: ['belt'],
};

/** 칸에 찍는 짧은 이름. 한 칸에 한 글자라 서로 겹치면 안 된다 */
export const SLOT_NAME: Record<SlotId, string> = {
  weapon: '무기',
  helm: '투', chest: '갑', glove: '완', greaves: '각', boot: '화',
  neck: '경', belt: '요', ear: '이', ring: '지',
};

/**
 * 옛 슬롯 이름 → 새 이름.
 *
 * 저장본과 서버에 올라간 프로필이 아직 `bootL` 같은 이름을 들고 있다.
 * 좌우 두 짝 중 **왼쪽을 살리고 오른쪽은 버린다** — 둘 다 살릴 칸이 없고,
 * 어느 쪽을 살려도 같은 물건이라 고를 근거가 없다.
 * (버려지는 쪽은 마이그레이션이 창고로 넣어 준다 — 값을 치른 물건이다)
 */
export const LEGACY_SLOT: Record<string, SlotId | null> = {
  // 16칸 시절의 좌우 짝
  shoulderL: null, shoulderR: null,
  gloveL: 'glove', gloveR: null,
  bootL: 'boot', bootR: null,
  earL: 'ear', earR: null,
  ringL: 'ring', ringR: null,
  // 13칸 시절 — 견갑을 없애고 장신구를 한 개씩으로 줄였다 (2026-08)
  shoulder: null,
  ear1: 'ear', ear2: null,
  ring1: 'ring', ring2: null,
};

// ── 아이템 ─────────────────────────────────────────────
/** 1~10 = 일반 티어, 11 = 장인의 무구 (★) */
export type Tier = number;
export const ARTISAN_TIER = 11;

/** 장비에 새긴 룬각인 (정령석). 3티어 이상만 가질 수 있다 — core/spirit */
export interface ItemSpirit {
  grade: string;
  trait: string;
}

export interface Item {
  id: string;
  kind: PartKind;
  tier: Tier;
  /** 강화 단계. 일반 티어는 0~15, 장인은 무한. */
  level: number;
  /** 내구도 0~100 (%) */
  dur: number;
  /** 새겨진 정령석. 승급해도 따라가고, 파괴하면 장비째 사라진다 */
  spirit?: ItemSpirit;
  /**
   * 연성액 배수 (×1.01~2.00). 승급해도 따라가고, 파괴하면 장비째 사라진다.
   * 아이템레벨에만 곱한다 — 수리비는 원본을 쓴다(economy.ts).
   */
  alch?: number;
  /**
   * 해방한 마일스톤 수 (장인 무구 전용).
   * n 이면 +5, +10 … +5n 마일스톤이 열려 있다. **영구** — 하락해도 유지된다.
   */
  freed?: number;
}

// ── 강화 주문서 (§4-3) ──────────────────────────────────
export const SCROLL_IDS = [
  'succ_low', 'succ_mid', 'succ_high', 'guard_down', 'guard_destroy50', 'guard_destroy100',
  /** 쿠지 A상 전용 — 상점에서 살 수 없다 */
  'guarantee',
] as const;
export type ScrollId = (typeof SCROLL_IDS)[number];

// ── 대출 (§7-8) ────────────────────────────────────────
// ── 투기장 (§7-4) ──────────────────────────────────────
export const ARENA_TIERS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;
export type ArenaTier = (typeof ARENA_TIERS)[number];

// ── 퀘스트 (§7-3) ──────────────────────────────────────
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface Quest {
  id: string;
  title: string;
  difficulty: QuestDifficulty;
  /** 추천 아이템레벨 (§7-3 표: 내 템렙 대비) */
  recIlvl: number;
  /**
   * 이 퀘스트를 굴린 시점의 내 아이템레벨.
   * 승률 보정의 기준선이다 — 이게 있어야 "장비를 갖추면 쉬워진다"가 성립한다.
   */
  baseIlvl: number;
  deposit: number;
  reward: number;
}


// ── 도박 (§7-1) ────────────────────────────────────────
export interface Creature {
  id: string;
  name: string;
  wins: number;
  losses: number;
}

export interface RushMatch {
  /** 5분 단위 슬롯 인덱스 — 시드로도 쓰임 */
  slot: number;
  a: string;
  b: string;
  /** 특수룰 회차 (30분마다) */
  special: boolean;
  oddsA: number;
  oddsB: number;
  startsAt: number;
  endsAt: number;
}

export interface RushBet {
  slot: number;
  on: string;
  amount: number;
  odds: number;
}
