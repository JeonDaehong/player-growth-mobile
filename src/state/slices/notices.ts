/**
 * 없앤 콘텐츠의 뒷정리 안내.
 *
 * 주식장과 은행을 없애면서, 거기 묶여 있던 재산은 마이그레이션이 돌려준다
 * (`state/migrate.ts` — 종목은 마지막 시세로 돈으로, 담보는 창고로).
 * 여기 있는 두 액션은 **그 사실을 알린 뒤 표시만 지운다.**
 *
 * 정산 세대(`marketClosed` · `bankClosed`)는 건드리지 않는다 — 그건 "이미 돌려줬다"
 * 는 기록이고, 지우면 켤 때마다 다시 돌려주게 된다.
 *
 * 이 파일은 원래 대출·주식 거래가 있던 자리다. 둘 다 없어져서 남은 게 이것뿐이다.
 */
import type { Store } from '../types';
import type { SliceGet, SliceSet } from './kit';


/** 이 뭉치가 맡는 액션들 */
export type NoticesActions = Pick<
  Store,
  'clearMarketPayout' | 'clearBankNotice'
>;

export const createNoticesSlice = (
  set: SliceSet,
  get: SliceGet,
): NoticesActions => ({
  // ── 금융 ────────────────────────────────────────
  clearMarketPayout: () => set({ marketPayout: null }),

  /*
    은행 폐쇄 안내를 닫는다.

    담보로 잡혀 있던 장비는 창고로 돌아갔고 남은 빚은 탕감했다
    (state/migrate.ts 의 `loanCollateral`). 이건 그 사실을 알린 뒤 표시만 지우는
    것이다 — `bankClosed` 세대는 그대로라 담보가 다시 복제되지 않는다.
  */
  clearBankNotice: () => set({ bankReturned: 0 }),
});
