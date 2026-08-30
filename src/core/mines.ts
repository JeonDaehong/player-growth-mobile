/**
 * 지뢰밭 (docs/ARCADE_CONTENT_DESIGN.md §2).
 *
 * 5×5 광산. **지뢰 개수를 내가 고른다** — 위험을 스스로 설계하는 게 핵심이다.
 * 지뢰 1개면 68% 로 ×1.35 를 반복하고, 8개면 2.25% 로 ×40.93 한 방을 노린다.
 * 도박장에 없던 축이다.
 *
 * 배당을 `HOUSE / P(성공)` 으로 정의했으므로 **어떤 조합을 골라도 EV 가 같다.**
 * 최적 전략이 존재하지 않고, 하우스 마진이 수식으로 보장된다
 * (섯다는 EV 가 정확히 1.00 이라 하우스 엣지가 0 이었다 — 그 문제가 원리적으로 안 생긴다).
 */
import { Rand, rnd } from './rng';
import { g, s } from './currency';

export const MINES_SIZE = 5;
export const MINES_CELLS = MINES_SIZE * MINES_SIZE;

export const MINES_MIN = 1;
export const MINES_MAX = 8;

/**
 * 열 수 있는 최대 칸.
 *
 * 상한이 없으면 지뢰 10개로 15칸을 다 열었을 때 배당이 ×3,000,000 이 되어
 * 100골드 배팅 하나로 경제가 무너진다. 8칸이면 최대 ×40.93 —
 * 크리처 러쉬 특수룰과 같은 급이다.
 * 연출로는 "여덟 번 파면 광부가 지쳐서 올라온다".
 */
export const MINES_MAX_OPEN = 8;

/** 하우스 마진 8% — 크리처 러쉬와 같다 */
export const MINES_HOUSE = 0.92;

export const MINES_MIN_BET = s(1);
export const MINES_MAX_BET = g(100);

/** k 칸을 연속으로 안전하게 열 확률 */
export function safeProb(mines: number, k: number): number {
  let p = 1;
  for (let i = 0; i < k; i++) p *= (MINES_CELLS - mines - i) / (MINES_CELLS - i);
  return p;
}

/** 지뢰 m 개에서 k 칸을 열었을 때의 배당 배수 */
export function payout(mines: number, k: number): number {
  if (k <= 0) return 0;
  const p = safeProb(mines, k);
  if (p <= 0) return 0;
  return Math.round((MINES_HOUSE / p) * 100) / 100;
}

/**
 * 어떤 (지뢰, 칸) 조합에서도 기대값이 하우스 마진과 같다.
 * 스모크가 이걸 전 조합에서 검사한다 — 배당식을 건드리면 바로 걸린다.
 */
export const expectedValue = (mines: number, k: number) => safeProb(mines, k) * payout(mines, k);

/** 지뢰 위치. 시드를 받아 재현 가능하게 만든다 (판을 저장했다가 이어서 연다) */
export function layMines(mines: number, r: Rand = rnd): number[] {
  const idx = Array.from({ length: MINES_CELLS }, (_, i) => i);
  // Fisher-Yates — 앞에서 mines 개만 쓴다
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, mines).sort((a, x) => a - x);
}

export interface MinesGame {
  mines: number;
  bet: number;
  /** 지뢰 위치 — 판을 시작할 때 확정한다 */
  bombs: number[];
  /** 지금까지 연 칸 */
  opened: number[];
  /** 밟았는가 */
  dead: boolean;
  /** 정산이 끝났는가 */
  done: boolean;
}

export function newGame(mines: number, bet: number, r: Rand = rnd): MinesGame {
  const m = Math.max(MINES_MIN, Math.min(MINES_MAX, Math.round(mines)));
  return { mines: m, bet, bombs: layMines(m, r), opened: [], dead: false, done: false };
}

/** 지금 [나온다] 를 누르면 받는 금액 */
export const currentPrize = (game: MinesGame) =>
  game.dead ? 0 : Math.floor(game.bet * payout(game.mines, game.opened.length));

/** 다음 한 칸이 안전할 확률(0~1) */
export const nextSafeChance = (game: MinesGame) => {
  const left = MINES_CELLS - game.opened.length;
  return left <= 0 ? 0 : (left - game.mines) / left;
};

export const canOpen = (game: MinesGame) =>
  !game.dead && !game.done && game.opened.length < MINES_MAX_OPEN;

/**
 * 칸 하나를 연다. 지뢰면 그 자리에서 끝난다.
 * 8칸을 채우면 자동 정산 상태(`done`)가 된다.
 */
export function open(game: MinesGame, cell: number): MinesGame {
  if (!canOpen(game) || game.opened.includes(cell)) return game;
  if (game.bombs.includes(cell)) {
    return { ...game, opened: [...game.opened, cell], dead: true, done: true };
  }
  const opened = [...game.opened, cell];
  return { ...game, opened, done: opened.length >= MINES_MAX_OPEN };
}

/** 정산 — 이미 끝난 판이면 그대로 */
export const cashOut = (game: MinesGame): MinesGame => ({ ...game, done: true });
