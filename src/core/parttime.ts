/**
 * 아르바이트.
 * 도박도 전투도 아닌 확실한 수입. 다만 체력만 갈아 넣는 저효율 노동이라
 * 후반에는 탐험/탑이 압도한다 (의도된 초반용 안전판).
 */
import { Rand, rnd, pick, randInt } from './rng';
import { s } from './currency';

/** 1회당 체력 소모 범위 */
export const STAMINA_MIN = 1;
export const STAMINA_MAX = 5;
/** 최대 소모치만큼은 남아 있어야 일을 받는다 — 굴리고 나서 막히면 억울하다 */
export const STAMINA_REQUIRED = STAMINA_MAX;

/** 1회당 수익 범위 (쿠퍼) */
export const PAY_MIN = 10;
export const PAY_MAX = s(1); // 1실버 = 100쿠퍼

const JOBS = [
  '마구간 청소', '전단지 배포', '하수구 뚫기', '광산 수레 밀기', '어시장 얼음 나르기',
  '성벽 이끼 제거', '선술집 설거지', '양털 깎기 보조', '묘지 낙엽 쓸기', '대장간 풀무질',
  '우물 두레박 감기', '빨래터 물 나르기', '도랑 파기', '지붕 이엉 갈기', '가축 여물 주기',
];

/** 작업명 → 도구 스프라이트 키 (assets/sprites/job) */
export const JOB_SPRITE_FOR: Record<string, string> = {
  '마구간 청소': 'broom', '전단지 배포': 'flyer', '하수구 뚫기': 'shovel',
  '광산 수레 밀기': 'cart', '어시장 얼음 나르기': 'ice', '성벽 이끼 제거': 'broom',
  '선술집 설거지': 'bucket', '양털 깎기 보조': 'hay', '묘지 낙엽 쓸기': 'broom',
  '대장간 풀무질': 'bellows', '우물 두레박 감기': 'bucket', '빨래터 물 나르기': 'bucket',
  '도랑 파기': 'shovel', '지붕 이엉 갈기': 'hay', '가축 여물 주기': 'hay',
};

export interface WorkResult {
  job: string;
  stamina: number;
  pay: number;
  /** 운 좋게 팁을 받았는가 (연출용) */
  tip: boolean;
}

export function work(r: Rand = rnd): WorkResult {
  const job = pick(JOBS, r);
  const stamina = randInt(STAMINA_MIN, STAMINA_MAX, r);
  let pay = randInt(PAY_MIN, PAY_MAX, r);
  // 5% 확률로 팁 — 같은 버튼을 계속 누르는 행위에 작은 변주를 준다
  const tip = r() < 0.05;
  if (tip) pay = Math.floor(pay * 1.5);
  return { job, stamina, pay, tip };
}

/** 체력 1당 기대 수익 (쿠퍼) — 다른 수입원과 비교용 */
export function payPerStamina(): number {
  const avgPay = (PAY_MIN + PAY_MAX) / 2 * (1 + 0.05 * 0.5);
  const avgStamina = (STAMINA_MIN + STAMINA_MAX) / 2;
  return avgPay / avgStamina;
}
