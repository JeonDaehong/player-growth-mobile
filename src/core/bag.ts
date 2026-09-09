/**
 * ── 가방 ── 지금 **가지고 있는 것**을 네 갈래로 늘어놓는다.
 *
 * 여태 가진 물건이 화면 여기저기에 흩어져 있었다. 경험의 서는 레벨업 창
 * 안에서만 보였고, 강성의 영약은 캐릭터 창의 각성 단추 옆 숫자로만 보였다.
 * 그래서 **무엇을 얼마나 들고 있나**를 한눈에 볼 자리가 없었다 — 창을 세
 * 군데 열어야 했고, 안 열어 본 물건은 있는 줄도 몰랐다.
 *
 * ## 갈래 넷
 *
 *   장비  몸에 걸치는 것
 *   소비  쓰면 없어지는 것 (경험의 서)
 *   재료  다른 것을 만들거나 올리는 데 들어가는 것 (강성의 영약)
 *   기타  위 셋에 안 들어가는 것
 *
 * 셋으로 줄일 수도 있었지만 넷이 흔한 모양이라 사람이 이미 안다. 무엇보다
 * **빈 갈래도 자리를 지켜야** 한다 — 장비가 없는 것과 장비라는 것이 이
 * 게임에 없는 것은 다른 말이고, 빈 칸에 그 까닭을 적어 두면 앞엣것이 된다.
 *
 * ## 골드와 다이아는 여기 없다
 *
 * 저 둘은 위 띠에 늘 떠 있다 (`TopBar`). 가방에 또 넣으면 같은 것이 두
 * 자리에 있는 셈이고, 무엇보다 **저건 가진 물건이 아니라 지갑**이다 —
 * 물건은 세는 것이고 지갑은 읽는 것이다.
 *
 * ## 이 파일은 세기만 한다
 *
 * 쓰는 일은 여기 없다. 경험의 서를 붓는 것은 레벨업 창이 하고(`feedBooks`),
 * 영약을 쓰는 것은 각성이 한다(`awaken`). 가방은 **어디서 쓰는지 알려 주는
 * 데까지**다 (`where`) — 여기서 또 쓰게 하면 같은 일을 두 곳에서 하게 되고,
 * 그러면 둘 중 한쪽에만 조건이 붙는 날이 온다.
 */
import { BOOKS, BOOK_IDS, BookId } from './exp';
import { GIFTS, GIFT_IDS, GiftId } from './bond';
import { ELIXIR_NAME } from './growth';

/** 가방의 갈래 */
export type BagTab = 'gear' | 'use' | 'mat' | 'etc';

export const BAG_TABS: readonly { id: BagTab; label: string }[] = [
  { id: 'gear', label: '장비' },
  { id: 'use', label: '소비' },
  { id: 'mat', label: '재료' },
  { id: 'etc', label: '기타' },
];

/** 갈래가 비었을 때 그 자리에 적는 말 — **까닭까지** 적는다 (머리말) */
export const BAG_EMPTY: Record<BagTab, string> = {
  gear: '아직 장비가 없습니다.\n이 게임은 무구가 아니라 사람을 키웁니다 — '
    + '레벨·성·스킬 트리가 그 자리를 대신합니다.',
  use: '쓸 것이 없습니다.\n경험의 서는 판을 깨면 나옵니다.',
  mat: '재료가 없습니다.\n강성의 영약은 10판부터 우두머리에게서 나옵니다.',
  etc: '선물이 없습니다.\n인연을 쌓는 데 씁니다.',
};

/** 가방에 놓인 칸 하나 */
export interface BagRow {
  /** 목록의 열쇠이자 곧 물건의 이름표 */
  key: string;
  tab: BagTab;
  name: string;
  /** 무엇에 쓰는 물건인가 — 한 줄 */
  desc: string;
  /** 그림 (`assets/sprites/<set>/<art>`). 아직 없으면 빈 자리로 뜬다 */
  set: string;
  art: string;
  /** 몇 개 */
  n: number;
  /** 어디서 쓰나 — 쓰는 자리로 보내는 대신 **말로만** 알려 준다 (머리말) */
  where: string;
}

/** 가방이 읽는 것 — 세이브 통째로 안 받는다 (`state/types` 를 안 물게) */
export interface BagOwned {
  books: Partial<Record<BookId, number>>;
  elixir: number;
  gifts: Partial<Record<GiftId, number>>;
}

/**
 * 가진 것을 칸으로 편다.
 *
 * **0 개는 안 넣는다.** 가진 적 없는 물건까지 늘어놓으면 가방이 도감이 되고,
 * 그러면 "내가 뭘 가졌나" 를 세는 자리가 아니게 된다. 그 갈래가 통째로 비면
 * 화면이 까닭을 적는다 (`BAG_EMPTY`).
 */
export function bagOf(own: BagOwned): BagRow[] {
  const out: BagRow[] = [];

  for (const id of BOOK_IDS) {
    const n = Math.max(0, Math.floor(own.books?.[id] ?? 0));
    if (n <= 0) continue;
    const d = BOOKS[id];
    out.push({
      key: id,
      tab: 'use',
      name: d.name,
      desc: `한 권에 경험치 ${d.exp.toLocaleString()}`,
      set: 'item_icon',
      art: d.art,
      n,
      where: '영웅 관리 · 레벨업',
    });
  }

  const el = Math.max(0, Math.floor(own.elixir ?? 0));
  if (el > 0) {
    out.push({
      key: 'elixir',
      tab: 'mat',
      name: ELIXIR_NAME,
      desc: '각성에 들어갑니다. 팔 수도 살 수도 없습니다.',
      set: 'growth',
      art: 'elixir',
      n: el,
      where: '영웅 관리 · 각성',
    });
  }

  /*
    ── 선물은 **기타**다 ──

    소비도 재료도 아니다. 쓰면 없어지지만 경험의 서처럼 부어 넣는 것이
    아니라 **누구에게 무엇을 주느냐**가 곧 내용이라, 소비 칸에 섞으면
    고르는 일이 아니게 된다 (`core/bond` 의 `GIFT_LIKE`).
  */
  for (const id of GIFT_IDS) {
    const n = Math.max(0, Math.floor(own.gifts?.[id] ?? 0));
    if (n <= 0) continue;
    const d = GIFTS[id];
    out.push({
      key: id,
      tab: 'etc',
      name: d.name,
      desc: d.desc,
      set: 'gift_icon',
      art: d.art,
      n,
      where: '영웅 관리 · 인연 · 선물주기',
    });
  }

  return out;
}

/** 그 갈래의 칸들 */
export const bagIn = (rows: readonly BagRow[], tab: BagTab): BagRow[] =>
  rows.filter((r) => r.tab === tab);

/*
  여기 `bagCounts` 가 있었다 — 갈래마다 몇 칸인지를 세어 아래 줄에
  `소비 2` 처럼 붙이던 것이다. 걷었다: 저 줄은 **어디를 볼까**를 고르는
  자리이지 세는 자리가 아니고, 네 칸이 정확히 같은 폭으로 서는데 어떤
  칸에만 숫자가 붙으면 글자 길이가 들쭉날쭉해진다.

  세는 자리는 화면 맨 위에 따로 있다 (`ItemScreen` 의 `소비 2종`).
*/
