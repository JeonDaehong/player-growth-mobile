/**
 * 장비 정보 · 획득 조건.
 * 컬렉션에서 칸을 누르면 뜨는 팝업이 쓰는 순수 계산 모듈.
 */
import { ARTISAN_TIER, KIND_NAME, PartKind, isWeaponKind } from './types';
import { fmtShort } from './currency';
import { TIERS, itemLevel, newItem , kindInc } from './tiers';
import { sellPrice } from './economy';
import { enhanceCost } from './enhance';
import { ARTISAN_FORGE_COST, ARTISAN_FORGE_MATERIALS } from './enhance';
import { SHOP_T1_PRICE } from './economy';
import { ARTISAN_MATERIAL_DROP } from './combat';

export interface ItemSpec {
  kind: PartKind;
  tier: number;
  /** "낡은 검" */
  name: string;
  /** +0 아이템레벨 */
  base: number;
  /** 강화 1회당 상승 */
  inc: number;
  /** +15 도달 시 아이템레벨 (장인은 상한 없음) */
  maxIlvl: number | null;
  /** +0 판매가 */
  sellBase: number;
  /** +0 → +1 강화 비용 */
  firstEnhance: number;
  /** 다음 티어 승급 비용 (최고 티어는 null) */
  promote: number | null;
  isWeapon: boolean;
}

export function itemSpec(kind: PartKind, tier: number): ItemSpec {
  const t = TIERS[tier];
  const at0 = newItem(kind, tier, 0, 100);
  const artisan = tier >= ARTISAN_TIER;
  return {
    kind,
    tier,
    name: `${t.prefix} ${KIND_NAME[kind]}`,
    base: t.base,
    inc: kindInc(kind, tier as never),
    maxIlvl: artisan ? null : itemLevel(newItem(kind, tier, t.maxLevel, 100)),
    sellBase: sellPrice(at0),
    firstEnhance: enhanceCost(at0, null),
    promote: t.promoteCost,
    isWeapon: isWeaponKind(kind),
  };
}

export interface Unlock {
  /** 한 줄 요약 */
  how: string;
  /** 단계별 안내 */
  steps: string[];
  /** 지금 바로 가능한가 */
  reachable: boolean;
}

/**
 * 획득 조건.
 * 티어 1은 상점, 2~10은 "이전 티어 +15 → 승급", 장인은 보스의탑 50층 재료.
 */
export function unlockOf(kind: PartKind, tier: number, ownedTiers: Set<number>): Unlock {
  const name = KIND_NAME[kind];

  if (tier >= ARTISAN_TIER) {
    return {
      how: '보스의탑 50층에서 재료를 모아 장인의집에서 제련',
      steps: [
        `보스의탑 50층 클리어 (재료 드랍 ${ARTISAN_MATERIAL_DROP * 100}%, 재탕에도 유지)`,
        `장인의 ${name} 재료 ${ARTISAN_FORGE_MATERIALS}개 수집`,
        `장인의집에서 제련 (${ARTISAN_FORGE_COST / 10000}골드)`,
      ],
      reachable: false,
    };
  }

  if (tier === 1) {
    return {
      how: `마을 › 상점에서 ${fmtShort(SHOP_T1_PRICE)}에 구매`,
      steps: [`상점에서 ${name} 구매 — 부위당 ${fmtShort(SHOP_T1_PRICE)}`],
      reachable: true,
    };
  }

  const prev = tier - 1;
  const prevT = TIERS[prev];
  const hasPrev = ownedTiers.has(prev);
  return {
    how: `${prevT.prefix} ${name}을(를) +15까지 강화한 뒤 승급`,
    steps: [
      hasPrev
        ? `${prevT.prefix} ${name} 확보 (완료)`
        : `먼저 ${prevT.prefix} ${name}을(를) 얻어야 합니다`,
      `착용한 뒤 +15까지 강화`,
      `홈 화면에서 승급 (${fmtShort(prevT.promoteCost ?? 0)})`,
    ],
    reachable: hasPrev,
  };
}

/** 도감 키에서 부위/티어 되돌리기 */
export function parseEntryKey(key: string): { kind: PartKind; tier: number } | null {
  const [k, t] = key.split(':');
  const tier = Number(t);
  if (!k || !Number.isFinite(tier)) return null;
  return { kind: k as PartKind, tier };
}
