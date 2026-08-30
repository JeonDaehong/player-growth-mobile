/**
 * 상점 (이세계 행상인).
 *
 * 예전에는 현금으로 사는 재화(다이아)가 따로 있었고 이 파일이 그 가격표였다.
 * 화폐를 **골드 하나로** 줄이면서(`core/currency`) 다이아와 결제 흐름을 걷어냈다.
 * 남은 것은 골드로 사는 물건과 닉네임 변경 규칙이다.
 */

import { g } from './currency';
import { hasProfanity } from './profanity';

// ── 캐시 아이템 ────────────────────────────────────────

export type CashItemId = 'nick_ticket';

export interface CashItem {
  id: CashItemId;
  name: string;
  desc: string;
  price: number;
  /** 한 번에 살 수 있는 최대 개수 */
  maxBuy: number;
}

export const CASH_ITEMS: CashItem[] = [
  {
    id: 'nick_ticket',
    name: '닉네임 변경권',
    desc: '무료 변경 기간이 남지 않았을 때 닉네임을 바꿉니다.',
    /* 다이아 1,000 → 골드로 옮겼다. 장비 몇 단계 값이라 가볍지도 무겁지도 않다 */
    price: g(10),
    maxBuy: 5,
  },
];

export const cashItem = (id: CashItemId) => CASH_ITEMS.find((x) => x.id === id)!;

// ── 닉네임 변경 규칙 ───────────────────────────────────

/** 무료 변경 주기 */
export const NICKNAME_FREE_DAYS = 90;
const DAY = 86_400_000;

export const NICKNAME_MIN = 2;
/**
 * 최대 길이.
 *
 * 12자였을 때 채팅 말풍선과 랭킹 표에서 이름이 줄을 넘겼다. 한글 10자면
 * 웬만한 별명은 다 들어가면서 한 줄에 남는다.
 */
export const NICKNAME_MAX = 10;

export type NicknameError = 'empty' | 'short' | 'long' | 'same' | 'ticket' | 'profanity' | null;

/** 다음 무료 변경까지 남은 ms (0 이면 지금 무료) */
export function freeChangeIn(lastChangedAt: number, now: number): number {
  if (!lastChangedAt) return 0;                 // 한 번도 안 바꿨으면 무료
  return Math.max(0, lastChangedAt + NICKNAME_FREE_DAYS * DAY - now);
}

export const canChangeFree = (lastChangedAt: number, now: number) =>
  freeChangeIn(lastChangedAt, now) === 0;

/**
 * 닉네임 변경 가능 여부.
 * 무료 기간이 아니면 변경권이 있어야 한다.
 */
export function validateNickname(
  next: string,
  current: string,
  lastChangedAt: number,
  now: number,
  tickets: number,
): NicknameError {
  const t = next.trim();
  if (!t) return 'empty';
  if (t.length < NICKNAME_MIN) return 'short';
  if (t.length > NICKNAME_MAX) return 'long';
  // 채팅은 별표로 덮고 넘어가지만 닉네임은 아예 못 만들게 한다 —
  // 남의 화면에 계속 박혀 있는 이름을 별표로 두면 그게 더 눈에 띈다
  if (hasProfanity(t)) return 'profanity';
  if (t === current) return 'same';
  if (!canChangeFree(lastChangedAt, now) && tickets <= 0) return 'ticket';
  return null;
}

export const NICKNAME_MSG: Record<Exclude<NicknameError, null>, string> = {
  empty: '닉네임을 입력하세요',
  short: `닉네임은 ${NICKNAME_MIN}자 이상이어야 합니다`,
  long: `닉네임은 ${NICKNAME_MAX}자까지입니다`,
  same: '지금 쓰는 닉네임과 같습니다',
  ticket: '무료 변경 기간이 아닙니다 — 닉네임 변경권이 필요합니다',
  profanity: '사용할 수 없는 단어가 들어 있습니다',
};

/** 남은 기간을 사람이 읽는 문장으로 */
export function freeChangeLabel(lastChangedAt: number, now: number): string {
  const left = freeChangeIn(lastChangedAt, now);
  if (left === 0) return '지금 무료로 바꿀 수 있습니다';
  const days = Math.ceil(left / DAY);
  return `무료 변경까지 ${days}일 남음`;
}
