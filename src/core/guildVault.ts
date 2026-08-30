/**
 * 길드 일일 배당 (docs/GUILD_CONTENT_DESIGN.md §7).
 *
 * ⚠ **상한이 이 시스템에서 제일 중요한 숫자다.**
 * 가만히 있어도 들어오는 돈은 "돈이 없어서 도박한다"는 이 게임의 정체성을 직접 깎는다.
 * 강화비의 절반으로 묶어 두면 배당은 전 구간에서 "지금 내 티어 강화 반 번"이다 —
 * 도움은 되지만 파산을 막아 주지는 않는다.
 *
 * 아이템레벨에 비례시키면 안 된다. 강화비는 티어당 약 2.4배씩 오르는데
 * 아이템레벨은 1.35배씩만 올라서, 어떤 계수를 잡아도 초반엔 과하고 후반엔 무의미해진다.
 */
import { SLOT_IDS } from './types';
import { Equipped, TIERS } from './tiers';
import { levelCoef } from './enhance';

/** 금고에 들어가는 주간 기여도 비율 */
export const VAULT_RATE = 0.02;
/** 상한 계수 — "강화 반 번" */
export const DIVIDEND_CAP_RATIO = 0.5;

/** 착용 장비 중 가장 높은 티어. 아무것도 안 차고 있으면 1 */
export function topTier(eq: Equipped): number {
  let t = 1;
  for (const slot of SLOT_IDS) {
    const it = eq[slot];
    if (it && it.tier > t) t = it.tier;
  }
  return t;
}

/** 하루 배당 상한 = 지금 내 티어 +13~15 강화 1회의 절반 */
export function dividendCap(eq: Equipped): number {
  const t = topTier(eq);
  return Math.max(1, Math.round(TIERS[t].enhanceBase * levelCoef(15) * DIVIDEND_CAP_RATIO));
}

/**
 * 길드 금고 규모.
 *
 * `matesWeekly` 는 **나를 뺀 길드원들의 이번 주 기여도 합**이다. 예전엔 지어낸
 * 구성원들의 기여도를 더했는데, 이제 같은 길드 프로필에서 모아 온다
 * (state/useGuilds.ts). 나 혼자인 길드는 내 기여도만으로 금고가 찬다 —
 * 적지만 0은 아니고, 사람이 늘면 눈에 띄게 커진다.
 */
export function vaultOf(matesWeekly: number, myWeekly: number): number {
  return Math.round((Math.max(0, matesWeekly) + Math.max(0, myWeekly)) * VAULT_RATE);
}

/**
 * 오늘 받을 배당.
 * 기여도 비례로 나누되 마지막에 상한으로 자른다 — 큰 길드에 들어가도 상한은 내 티어가 정한다.
 */
export function dividendFor(
  matesWeekly: number, myWeekly: number, eq: Equipped, vaultMul: number,
): number {
  const mine = Math.max(0, myWeekly);
  const total = Math.max(0, matesWeekly) + mine;
  if (total <= 0) return 0;
  const raw = vaultOf(matesWeekly, mine) * (mine / total) * vaultMul;
  return Math.max(0, Math.min(dividendCap(eq), Math.round(raw)));
}
