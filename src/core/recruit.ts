/**
 * 캐릭터 모집.
 *
 * 지금 캐릭터를 얻는 길은 **처음 한 명 고르기** 뿐이라, 파티 네 자리 중 셋이
 * 영영 비어 있다. 자리를 만들어 놓고 채울 방법을 안 주면 그 자리는 기능이
 * 아니라 결함이다.
 *
 * ## 중복이 안 나온다
 *
 * 열두 명뿐인 게임에서 중복을 주면, 이미 가진 사람이 또 나오는 일이 금방
 * 대부분이 된다. 중복을 쓸 데(합성·돌파)가 있어야 그게 성립하는데 지금은 없다.
 * 그래서 **안 가진 사람 중에서만** 뽑는다. 뽑을 때마다 확실히 하나가 늘고,
 * 열둘을 다 모으면 모집이 닫힌다.
 *
 * ## 등급은 확률이지 세기가 아니다
 *
 * 등급이 높다고 지금 당장 세지 않는다 (`core/chars` 의 `GRADE_GROWTH` —
 * 등급은 레벨당 성장률만 올린다). 그래서 C 를 뽑아도 손해가 아니고, 초반에
 * 파티를 채우는 데는 오히려 그쪽이 낫다. 등급은 **오래 키울 사람**을 가른다.
 *
 * ## 값이 오른다
 *
 * 가진 수에 따라 1.7배씩 오른다. 고정으로 두면 골드가 쌓이는 후반에 열두 명을
 * 한 번에 다 뽑고 끝난다 — 모으는 게임인데 모으는 과정이 사라진다.
 */
import { CHARS, CHAR_IDS, CharId, Grade } from './chars';
import { Rand, rnd } from './rng';

/**
 * 첫 모집 값.
 *
 * 800 으로 뒀다가 낮췄다 — 두 번째 캐릭터가 20분 뒤에 와서, 그동안 파티
 * 네 칸 중 셋이 계속 비어 있었다. 처음 켠 사람에게 그건 "아직 못 채운 것" 이
 * 아니라 "고장난 것" 으로 보인다.
 */
export const RECRUIT_BASE = 450;

/**
 * 한 명 늘 때마다 곱해지는 값.
 *
 * 1.7 로 뒀다가 낮췄다 — 열두 번째가 16만 골드가 되어, 모으는 값이 고유장비
 * 강화보다 훨씬 비싸졌다. 둘이 같은 골드를 놓고 다투는데 한쪽이 압도적으로
 * 비싸면 그쪽은 사실상 잠긴 콘텐츠다.
 */
export const RECRUIT_STEP = 1.55;

/**
 * 다음 모집 비용.
 *
 * @param owned 지금 가지고 있는 수 (처음 고른 한 명 포함)
 */
export function recruitCost(owned: number): number {
  /* 처음 고른 한 명은 공짜였으므로 그만큼 빼고 센다 — 두 번째가 기본값이다 */
  const n = Math.max(0, Math.floor(owned) - 1);
  return Math.floor(RECRUIT_BASE * Math.pow(RECRUIT_STEP, n));
}

/**
 * 등급이 나올 가중치.
 *
 * S 가 A 의 3분의 1쯤이다. 더 벌리면 S 둘(백기사·대공·무녀)이 사실상 안
 * 나오고, 좁히면 등급이 있을 이유가 없다.
 */
export const GRADE_WEIGHT: Record<Grade, number> = {
  C: 100,
  B: 55,
  A: 25,
  S: 8,
};

/** 아직 안 가진 사람들 */
export const poolOf = (owned: readonly string[]): CharId[] =>
  CHAR_IDS.filter((id) => !owned.includes(id));

/**
 * 한 명 뽑는다.
 *
 * 등급 가중치로 **사람 하나하나에** 무게를 매긴다. "먼저 등급을 뽑고 그 안에서
 * 고르는" 방식으로 하면, 그 등급에 한 명만 남았을 때 그 사람이 튀어나올 확률이
 * 갑자기 치솟는다. 사람 단위로 재면 남은 구성이 어떻든 확률이 자연스럽다.
 *
 * @returns 뽑힌 사람. 더 뽑을 사람이 없으면 null
 */
export function drawChar(owned: readonly string[], rand: Rand = rnd): CharId | null {
  const pool = poolOf(owned);
  if (!pool.length) return null;

  const weights = pool.map((id) => GRADE_WEIGHT[CHARS[id].grade]);
  const total = weights.reduce((a, w) => a + w, 0);
  let roll = rand() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  /* 부동소수점 때문에 안 걸리는 경우 — 마지막 사람으로 떨어뜨린다 */
  return pool[pool.length - 1];
}

/** 지금 풀에서 각 등급이 나올 확률 (화면에 적어 준다) */
export function gradeOdds(owned: readonly string[]): Partial<Record<Grade, number>> {
  const pool = poolOf(owned);
  if (!pool.length) return {};
  const total = pool.reduce((a, id) => a + GRADE_WEIGHT[CHARS[id].grade], 0);
  const out: Partial<Record<Grade, number>> = {};
  for (const id of pool) {
    const g = CHARS[id].grade;
    out[g] = (out[g] ?? 0) + GRADE_WEIGHT[g] / total;
  }
  return out;
}
