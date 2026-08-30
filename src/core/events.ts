/**
 * 이벤트 (기타 탭).
 * 지금은 출석체크 하나뿐이지만, 나중에 이벤트를 추가할 걸 전제로
 * 목록 구조를 먼저 세워 둔다.
 */
import { s } from './currency';

export type EventId = 'attendance' | 'coupon';

export interface EventDef {
  id: EventId;
  title: string;
  desc: string;
  /** 참여 주기 */
  period: 'daily' | 'once';
}

export const EVENTS: EventDef[] = [
  {
    id: 'attendance',
    title: '출석체크',
    desc: '하루 한 번 출석하면 보상을 드립니다.',
    period: 'daily',
  },
  {
    id: 'coupon',
    title: '쿠폰 등록',
    desc: '받은 쿠폰 코드를 입력하면 보상을 드립니다.',
    period: 'once',
  },
];

/** 출석 보상 — 5실버 */
export const ATTENDANCE_REWARD = s(5);

/** 로컬 날짜 키 */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 어제인지 (연속 출석 판정용) */
export function isYesterday(prev: string, now: number): boolean {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return dayKey(d.getTime()) === prev;
}
