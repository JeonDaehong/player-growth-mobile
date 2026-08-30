/**
 * 통계 화면이 쓰는 파생 계산.
 * 강화 히스토리에서 분포를 뽑는다 — 순수 함수라 화면 없이 검증할 수 있다.
 */
import { TIER_NEUTRAL, effectiveOdds } from './enhance';

/** 통계 계산에 필요한 최소 형태 (store 의 EnhanceLog 와 호환) */
export interface LogLike {
  from: number;
  to: number;
  outcome: 'success' | 'fail' | 'downgrade' | 'destroy';
  cost: number;
  /** 티어. 이 필드가 생기기 전 로그에는 없어서 중립 티어로 본다. */
  tier?: number;
}

export interface OutcomeDist {
  success: number;
  fail: number;
  downgrade: number;
  destroy: number;
  total: number;
  successRate: number;
}

export function outcomeDist(logs: LogLike[]): OutcomeDist {
  const d = { success: 0, fail: 0, downgrade: 0, destroy: 0 };
  for (const l of logs) d[l.outcome] += 1;
  const total = logs.length;
  return { ...d, total, successRate: total ? d.success / total : 0 };
}

/** 목표 단계별 시도 횟수 (+1 ~ +15, 그 위는 한 칸에 묶는다) */
export function attemptsByLevel(logs: LogLike[]): { label: string; value: number }[] {
  const buckets = new Array(16).fill(0) as number[]; // index 1..15, 0 = +16 이상
  for (const l of logs) {
    const target = l.from + 1;
    if (target >= 16) buckets[0] += 1;
    else buckets[target] += 1;
  }
  const out = [];
  for (let i = 1; i <= 15; i++) out.push({ label: `${i}`, value: buckets[i] });
  if (buckets[0] > 0) out.push({ label: '16+', value: buckets[0] });
  return out;
}

/**
 * 실측 성공률 vs 이론 기대치.
 * 각 시도의 목표 단계 확률을 더해 기대 성공 수를 구한다 — "운이 나빴나"를 판단할 수 있다.
 */
export function luck(logs: LogLike[]): { expected: number; actual: number; diff: number } {
  let expected = 0;
  let actual = 0;
  for (const l of logs) {
    expected += effectiveOdds(l.from + 1, null, 0, l.tier ?? TIER_NEUTRAL).success / 100;
    if (l.outcome === 'success') actual += 1;
  }
  return { expected, actual, diff: actual - expected };
}

/** 강화 단계 추이 — 히스토리는 최신순이므로 뒤집어 시간순으로 만든다 */
export function levelTrend(logs: LogLike[], limit = 60): number[] {
  return logs.slice(0, limit).reverse().map((l) => l.to);
}
