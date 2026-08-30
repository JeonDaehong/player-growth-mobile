/**
 * 복권 상점.
 * 구매 즉시 결과를 까지 않고 **매일 오후 8시 추첨**까지 기다린다.
 * 결과는 (회차 + 발급번호) 시드로 고정 — 앱을 껐다 켜도 같은 결과가 나온다.
 */
import { g, s } from './currency';
import { seeded } from './rng';

export const TICKET_PRICE = s(5);      // 1장 5실버
export const DAILY_LIMIT = 10;         // 회차당 최대 10장
export const DRAW_HOUR = 20;           // 오후 8시 추첨

export type LotteryRank = 1 | 2 | 3 | 4 | 5;

export interface PrizeDef {
  rank: LotteryRank;
  label: string;
  /** 당첨 확률 (0~1) */
  prob: number;
  amount: number;
}

/**
 * 등수는 배타적 — 위에서부터 순서대로 판정한다.
 *
 * 확률은 지정된 값(0.001% / 0.01% / 0.1% / 1% / 10%)을 그대로 쓰고,
 * 상금은 **등수마다 기대값 기여가 같아지도록** 배치했다.
 *   확률 ÷10 마다 상금 ×10  →  각 등수 기여 = 50쿠퍼, 총 EV = 250쿠퍼
 *   티켓 가격 500쿠퍼(5실버) 대비 환급률 50% (실제 복권과 같은 수준).
 *
 * ⚠ 처음 지정된 상금(5000/1000/50/5골드/50실버)은 EV 가 가격의 6배여서
 * 사면 살수록 이득인 확정 수입원이 됐다. 조정 근거는 DEVELOPMENT.md 참고.
 */
export const PRIZES: PrizeDef[] = [
  { rank: 1, label: '1등', prob: 0.00001, amount: g(500) },
  { rank: 2, label: '2등', prob: 0.0001,  amount: g(50) },
  { rank: 3, label: '3등', prob: 0.001,   amount: g(5) },
  { rank: 4, label: '4등', prob: 0.01,    amount: s(50) },
  { rank: 5, label: '5등', prob: 0.10,    amount: s(5) },
];

export const prizeOf = (rank: LotteryRank) => PRIZES.find((p) => p.rank === rank)!;

/** 당첨 확률 총합 */
export const WIN_PROB = PRIZES.reduce((a, p) => a + p.prob, 0);

/** 1장당 기대 회수액 (쿠퍼) */
export function expectedValue(): number {
  return PRIZES.reduce((a, p) => a + p.prob * p.amount, 0);
}

/**
 * 환급률 = 기대 회수액 / 가격.
 * 1.0 을 넘으면 사면 살수록 이득인 돈 복사가 된다. 0.4~0.9 사이를 유지한다.
 */
export function payoutRatio(): number {
  return expectedValue() / TICKET_PRICE;
}

/** 다음 추첨 시각 (로컬 오후 8시). 이미 지났으면 다음 날. */
export function nextDrawAt(now: number): number {
  const d = new Date(now);
  const draw = new Date(d.getFullYear(), d.getMonth(), d.getDate(), DRAW_HOUR, 0, 0, 0);
  if (draw.getTime() <= now) draw.setDate(draw.getDate() + 1);
  return draw.getTime();
}

/** 회차 키 — 추첨 날짜. 시드와 구매 한도 계산에 함께 쓴다. */
export function drawKey(now: number): string {
  const d = new Date(nextDrawAt(now));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 결과 판정 — (회차, 발급번호) 시드 고정 */
export function resultFor(key: string, serial: number): LotteryRank | null {
  const r = seeded('lottery', key, serial)();
  let acc = 0;
  for (const p of PRIZES) {
    acc += p.prob;
    if (r < acc) return p.rank;
  }
  return null;
}

export interface Ticket {
  id: string;
  serial: number;
  drawKey: string;
  drawAt: number;
  boughtAt: number;
}

export interface LotteryResult {
  id: string;
  serial: number;
  drawKey: string;
  rank: LotteryRank | null;
  prize: number;
  at: number;
}
