/**
 * 장비 가루 — 파괴된 장비가 남기는 것.
 *
 * ## 왜 만들었나
 *
 * 강화 파괴는 이 게임에서 제일 아픈 사건이다. +13 짜리가 한순간에 사라지고
 * **아무것도 안 남는다.** 그 자리에서 게임을 끄는 사람이 나오는 게 당연하다 —
 * 몇 시간을 갈아 넣은 결과가 0 이 되는데 다음에 할 일이 안 보이기 때문이다.
 *
 * 가루는 그 0 을 **아주 작은 무언가**로 바꾼다. 잃은 것을 되돌려 주지 않는다:
 * 복구되는 건 **그 티어의 0강 장비**다. 강화 단계도, 각인도, 연성도 안 돌아온다.
 * "다시 시작할 물건" 만 손에 쥐여 주는 것이고, 그게 딱 알맞은 위로다.
 *
 * ## 왜 티어별로 나누지 않았나
 *
 * 가루를 티어별로 나누면(1티어 가루, 2티어 가루…) 창고에 열한 종류가 쌓이고,
 * 낮은 티어 가루는 영원히 안 쓰인다. 한 종류로 두고 **티어마다 필요한 개수**를
 * 다르게 잡는다 — 그러면 낮은 티어에서 모은 가루가 위에서도 쓰인다.
 */
import { TIERS } from './tiers';
import { PartKind, Tier } from './types';

/**
 * 파괴로 얻는 가루.
 *
 * 티어가 높을수록, 강화가 높을수록 많이 나온다. 높은 강화에서 터진 게 더 아프고,
 * 아픈 만큼 돌려받는 게 맞다.
 *
 * 값은 "같은 티어를 복구하려면 서너 번은 터져야 한다" 를 기준으로 잡았다.
 * 한 번 터진 걸로 바로 복구되면 파괴가 무섭지 않고, 열 번이 필요하면 가루가
 * 있으나 마나가 된다.
 */
export function dustFromBreak(tier: Tier, level: number): number {
  const t = Math.max(1, Math.min(11, tier));
  const lv = Math.max(0, level);
  /* 티어당 2개 + 강화 3칸당 1개 */
  return t * 2 + Math.floor(lv / 3);
}

/**
 * 그 티어의 0강 장비를 복구하는 데 드는 가루.
 *
 * `dustFromBreak` 의 같은 티어 평균 산출(+10 근처에서 터진다고 보면 티어×2+3)의
 * 약 3.5배다 — 세 번 남짓 터져야 한 벌이 돌아온다.
 */
export function restoreDust(tier: Tier): number {
  const t = Math.max(1, Math.min(10, tier));
  return Math.round((t * 2 + 3) * 3.5);
}

/**
 * 복구에 함께 드는 돈.
 *
 * 가루만으로 되게 하면 파괴가 **이득**이 되는 구간이 생긴다 (낮은 티어를 일부러
 * 터뜨려 가루를 모으는 식). 그 티어를 새로 사는 값의 절반쯤을 같이 받아
 * "터뜨려서 얻는 것" 이 되지 않게 막는다.
 */
export function restoreCost(tier: Tier): number {
  const t = Math.max(1, Math.min(10, tier));
  return Math.round(TIERS[t as Tier].sellBase * 1.5);
}

/** 복구할 수 있는 티어인가 — 장인 무구(11)는 제련으로만 만든다 */
export const canRestore = (tier: number): tier is Tier => tier >= 1 && tier <= 10;

export interface RestoreOrder {
  tier: Tier;
  kind: PartKind;
}
