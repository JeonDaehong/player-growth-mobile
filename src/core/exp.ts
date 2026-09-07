/**
 * ── 경험의 서 ── 레벨을 **한 칸씩** 말고 **한 번에** 올리는 길.
 *
 * 여태 레벨은 단추를 눌러 한 칸씩 올렸다 (`levelUp`). 1레벨에서 100까지
 * 아흔아홉 번을 눌러야 했고, 그건 고르는 일이 아니라 **노동**이다 — 누를
 * 때마다 정하는 것이 아무것도 없으니까.
 *
 * 이제 책을 넣는다. 넣은 만큼 경험치가 오르고, 경험치가 차면 레벨이 오른다.
 * 한 번에 열 칸을 올릴 수도 있고 한 칸만 올릴 수도 있다.
 *
 * ## 왜 셋인가
 *
 * 낡은 · 온전한 · 명품. 값이 10배씩 벌어진다 (`BOOKS`).
 *
 * 하나뿐이면 초반에는 한 권이 세 레벨이고 후반에는 백 권이 한 레벨이라,
 * 같은 물건이 시기에 따라 전혀 다른 것이 된다. 셋으로 나누면 **지금 내가
 * 어느 단계인가**가 쓰는 책으로 읽힌다.
 *
 * ## 골드도 같이 든다
 *
 * 책만으로는 안 되고 **경험치에 비례하는 돈**이 같이 든다 (`goldFor`).
 * 책은 모이는 것이고 골드는 쓰는 것이라, 둘을 같이 걸어야 "책이 쌓였는데
 * 쓸 데가 없다" 와 "골드가 남는데 쓸 데가 없다" 가 서로를 푼다.
 *
 * ## 남는 경험치는 **버리지 않는다**
 *
 * 넣은 것이 다음 레벨에 모자라면 그만큼이 그대로 쌓인다 (`OwnedChar.exp`).
 * 버리면 사람이 계산기를 두드려야 하는데, 그건 이 화면이 시킬 일이 아니다.
 */

/** 책 세 가지의 이름표 */
export type BookId = 'old' | 'fine' | 'prime';

export const BOOK_IDS: readonly BookId[] = ['old', 'fine', 'prime'];

export interface BookDef {
  id: BookId;
  name: string;
  /** 한 권이 주는 경험치 */
  exp: number;
  /** 화면에 그릴 로고 (`assets/sprites/item_icon/`). 없으면 빈 자리 */
  art: string;
}

/**
 * 값이 **10배씩** 벌어진다.
 *
 * 2배씩이면 셋이 거의 같은 것이 되어 나눈 뜻이 없고, 100배씩이면 가운데
 * 것을 쓸 구간이 없다. 10배면 **한 단계가 대략 한 시기**다 — 낡은 것으로
 * 초반을, 온전한 것으로 중반을, 명품으로 끝을 올린다.
 */
export const BOOKS: Record<BookId, BookDef> = {
  old: { id: 'old', name: '낡은 경험의 서', exp: 120, art: 'book_old' },
  fine: { id: 'fine', name: '온전한 경험의 서', exp: 1_200, art: 'book_fine' },
  prime: { id: 'prime', name: '명품 경험의 서', exp: 12_000, art: 'book_prime' },
};

/** 넣은 책들이 주는 경험치 합 */
export function expOf(bag: Partial<Record<BookId, number>>): number {
  return BOOK_IDS.reduce((a, id) => a + Math.max(0, Math.floor(bag[id] ?? 0)) * BOOKS[id].exp, 0);
}

/**
 * ── 다음 한 칸에 드는 경험치 ──
 *
 * 골드 값과 **같은 모양의 곡선**이다 (`core/growth` 의 `lvCost` — 7.5%씩).
 * 두 값이 다른 속도로 오르면 어느 구간에서는 책이 남고 어느 구간에서는
 * 골드가 남는데, 그 어긋남에는 아무 뜻이 없다.
 */
export function lvExp(lv: number): number {
  return Math.floor(100 * Math.pow(1.075, Math.max(1, Math.floor(lv)) - 1));
}

/** 경험치 1 당 드는 골드 */
export const GOLD_PER_EXP = 0.6;

/** 이만큼의 경험치를 넣으려면 드는 골드 */
export const goldFor = (exp: number): number => Math.ceil(Math.max(0, exp) * GOLD_PER_EXP);

/**
 * 경험치를 부어 넣은 결과 — **몇 레벨이 되고 얼마가 남나.**
 *
 * 상한에 닿으면 거기서 멈추고 **남는 것은 그대로 돌려준다** (`left`). 상한을
 * 넘겨 부은 것을 삼켜 버리면, 승급 전에 책을 넣은 사람이 그걸 잃는다.
 *
 * @param lv   지금 레벨
 * @param exp  지금 쌓여 있는 경험치
 * @param add  새로 붓는 경험치
 * @param cap  이 사람의 레벨 상한 (`capOf`)
 */
export function feed(lv: number, exp: number, add: number, cap: number): {
  lv: number; exp: number; up: number;
} {
  let nl = Math.max(1, Math.floor(lv));
  let ne = Math.max(0, Math.floor(exp)) + Math.max(0, Math.floor(add));
  const from = nl;
  while (nl < cap) {
    const need = lvExp(nl);
    if (ne < need) break;
    ne -= need;
    nl += 1;
  }
  /* 상한에서는 더 안 쌓는다 — 쌓아 봐야 쓸 데가 없고, 창에 뜨는 수만 커진다 */
  if (nl >= cap) ne = 0;
  return { lv: nl, exp: ne, up: nl - from };
}

/**
 * 지금 레벨에서 상한까지 **남은 경험치 전부.**
 *
 * 창이 "얼마나 더 부어야 끝인가" 를 적는 데 쓴다. 그 수가 없으면 사람이
 * 책을 하나씩 넣어 보며 알아내야 한다.
 */
export function expToCap(lv: number, exp: number, cap: number): number {
  let need = 0;
  for (let i = Math.max(1, Math.floor(lv)); i < cap; i++) need += lvExp(i);
  return Math.max(0, need - Math.max(0, Math.floor(exp)));
}
