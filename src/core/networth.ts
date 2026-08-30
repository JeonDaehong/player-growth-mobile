/**
 * 자산 분류.
 *
 * 돈을 한 덩어리로 보면 "지금 강화할 수 있는 돈"과 "팔아야 생기는 돈"이 뒤섞인다.
 * 유동성 기준으로 나눠서 보여준다.
 *
 * ## 왜 장비는 자산에서 뺐는가
 *
 * 장비를 자산에 넣으면 **아이템레벨 순위표와 자산 순위표가 같은 줄을 만든다.**
 * 강화에 성공한 사람이 두 판에서 동시에 올라가니, 자산 랭킹이 "돈을 얼마나 모았나"
 * 가 아니라 "장비가 얼마나 좋은가" 의 그림자가 됐다. 게다가 장비값은 팔아야만
 * 생기는 돈인데, 실제로 파는 사람은 거의 없다 — 세어 봐야 쓸 수 없는 숫자였다.
 *
 * 그래서 `gross`·`net` 은 **소지금 + 변동성 자산 − 부채**만 센다.
 * 장비 판매가(`gearWorn`·`gearStored`)는 참고용으로 계속 계산해 두되 합계에는
 * 넣지 않는다 — 화면에서 "팔면 이만큼" 을 따로 보여 줄 자리가 있다.
 */
import { Item, SLOT_IDS } from './types';
import { Equipped } from './tiers';
import { sellPrice } from './economy';

export interface AssetBreakdown {
  /** 즉시 사용 가능 — 소지금 */
  liquid: number;
  /**
   * 환금성 자산 — 장비 판매가 (착용 + 창고).
   * ⚠ `gross`·`net` 에는 **들어가지 않는다** (위 주석 참고). 참고 표시용이다.
   */
  gearWorn: number;
  gearStored: number;

  gear: number;       // worn + stored — 참고용. 합계에는 안 들어간다
  gross: number;      // = liquid. 주식장을 없앤 뒤로 소지금이 곧 총자산이다
  /**
   * 순자산.
   *
   * 은행까지 없앤 뒤로 빚질 곳이 없어서 `gross` 와 늘 같다. 이름을 남겨 두는 건
   * 순위표·화면이 **여기 하나만** 보게 하기 위해서다 — 나중에 부채가 다시 생겨도
   * 고칠 곳이 이 파일뿐이다.
   */
  net: number;
}

export function breakdown(args: {
  money: number;
  equipped: Equipped;
  inventory: Item[];
}): AssetBreakdown {
  const { money, equipped, inventory } = args;

  let worn = 0;
  for (const sl of SLOT_IDS) {
    const it = equipped[sl];
    if (it) worn += sellPrice(it);
  }
  const stored = inventory.reduce((a, it) => a + sellPrice(it), 0);

  const gear = worn + stored;
  /*
    장비는 빠진다 — 자산 순위표가 아이템레벨 순위표의 사본이 되지 않게.
    주식장을 없앤 뒤로 여기 남는 건 소지금뿐이다 (그래서 gross === liquid).
    합계 계산을 지우지 않고 남겨 두는 이유는, 나중에 다른 변동자산이 생겨도
    화면과 순위표가 이 한 곳만 보면 되게 하기 위해서다.
  */
  const gross = money;

  return {
    liquid: money,
    gearWorn: worn,
    gearStored: stored,
    gear,
    gross,
    net: gross,
  };
}
