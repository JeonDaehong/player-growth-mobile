/** 컬렉션 북 (기획서 §11) */
import { ACC_KINDS, ARMOR_KINDS, ARTISAN_TIER, KIND_NAME, PART_KINDS, PartKind, WEAPON_KINDS } from './types';
import { ARTISAN_PART_GROUPS, DUNKARAX } from './artisans';
import { NORMAL_TIERS } from './tiers';
import { g } from './currency';

/** 도감 키: "sword:3" */
export const entryKey = (kind: PartKind, tier: number) => `${kind}:${tier}`;

/** 일반 티어 칸: 전 부위 × 10티어 (견갑을 없애 20부위 = 200칸) */
export const NORMAL_ENTRIES = PART_KINDS.length * NORMAL_TIERS.length;
/** 장인 시리즈 칸: 전 부위 × 1 */
export const ARTISAN_ENTRIES = PART_KINDS.length;
export const TOTAL_ENTRIES = NORMAL_ENTRIES + ARTISAN_ENTRIES;

/** 장인 시리즈 도감 키 */
export const artisanKey = (kind: PartKind) => entryKey(kind, ARTISAN_TIER);

/** 장인 시리즈 도감 구성 — 장인은 둔카락스 한 명이고 부위군으로만 나눈다 */
export const ARTISAN_GROUPS = ARTISAN_PART_GROUPS;
export { DUNKARAX };

export function isArtisanComplete(registered: Set<string>): boolean {
  return PART_KINDS.every((k) => registered.has(artisanKey(k)));
}

export function artisanCount(registered: Set<string>): number {
  return PART_KINDS.filter((k) => registered.has(artisanKey(k))).length;
}

export const GROUPS = [
  { id: 'weapon', label: '무기', kinds: WEAPON_KINDS as readonly PartKind[] },
  { id: 'armor', label: '방어구', kinds: ARMOR_KINDS as readonly PartKind[] },
  { id: 'acc', label: '장신구', kinds: ACC_KINDS as readonly PartKind[] },
] as const;

export function isKindComplete(registered: Set<string>, kind: PartKind): boolean {
  return NORMAL_TIERS.every((t) => registered.has(entryKey(kind, t)));
}

export function completedKinds(registered: Set<string>): PartKind[] {
  return PART_KINDS.filter((k) => isKindComplete(registered, k));
}

export function isAllWeaponsComplete(registered: Set<string>): boolean {
  return WEAPON_KINDS.every((k) => isKindComplete(registered, k));
}

export function completionRate(registered: Set<string>): number {
  return registered.size / TOTAL_ENTRIES;
}

// ── 완성 보상 (§11) ────────────────────────────────────
export const KIND_COMPLETE_REWARD = g(10);
export const ALL_WEAPONS_REWARD = g(200);
export const FULL_BOOK_REWARD = g(1000);
/** 장인 시리즈 21종 전부 등록 */
export const ARTISAN_SET_REWARD = g(2000);

export interface CollectionRewardState {
  /** 이미 수령한 부위 */
  claimedKinds: string[];
  claimedAllWeapons: boolean;
  claimedFullBook: boolean;
  claimedArtisanSet?: boolean;
}

export interface PendingReward {
  id: string;
  label: string;
  amount: number;
  title?: string;
}

/** 아직 수령하지 않은 완성 보상 목록 */
export function pendingRewards(
  registered: Set<string>,
  claimed: CollectionRewardState,
): PendingReward[] {
  const out: PendingReward[] = [];
  for (const k of completedKinds(registered)) {
    if (!claimed.claimedKinds.includes(k)) {
      out.push({ id: `kind:${k}`, label: `${KIND_NAME[k]} 풀 등록`, amount: KIND_COMPLETE_REWARD });
    }
  }
  if (isAllWeaponsComplete(registered) && !claimed.claimedAllWeapons) {
    out.push({ id: 'allWeapons', label: '무기 전 종류 풀 등록', amount: ALL_WEAPONS_REWARD, title: 'weapon_collector' });
  }
  if (isArtisanComplete(registered) && !claimed.claimedArtisanSet) {
    out.push({ id: 'artisanSet', label: '장인 시리즈 21종 풀 등록', amount: ARTISAN_SET_REWARD });
  }
  if (registered.size >= TOTAL_ENTRIES && !claimed.claimedFullBook) {
    out.push({ id: 'fullBook', label: '전체 도감 100%', amount: FULL_BOOK_REWARD, title: 'curator' });
  }
  return out;
}
