/**
 * 캐릭터 모집.
 *
 * 지금 캐릭터를 얻는 길은 **처음 한 명 고르기** 뿐이라, 파티 네 자리 중 셋이
 * 영영 비어 있다. 자리를 만들어 놓고 채울 방법을 안 주면 그 자리는 기능이
 * 아니라 결함이다.
 *
 * ## 이제 중복이 나온다
 *
 * 한동안 **안 가진 사람 중에서만** 뽑았다. 중복을 쓸 데가 없었기 때문이다 —
 * 이미 가진 사람이 또 나오면 그건 그냥 허탕이었다.
 *
 * 성 체계가 생기면서 쓸 데가 생겼다 (`core/growth`). 같은 사람 둘을 합치면
 * 한 성이 오르고, 성이 오르면 레벨 상한과 기술이 열린다. 그래서 규칙을
 * 바꿨다: **안 가진 사람이 남아 있으면 그쪽을 먼저** 주고, 다 모았으면
 * 조각이 나온다.
 *
 * 순서를 이렇게 둔 이유는 초반이다. 처음부터 섞어 뽑으면 파티 네 자리가
 * 안 채워진 채로 조각만 쌓이는 일이 생기는데, 자리가 빈 파티는 조각이
 * 아무리 많아도 약하다.
 *
 * ## 등급은 확률이지 세기가 아니다
 *
 * 등급이 높다고 지금 당장 세지 않는다 (`core/growth` 의 `RARITY_GROWTH` —
 * 등급은 강화 성장률과 **상한**을 정한다). 그래서 일반을 뽑아도 손해가
 * 아니고, 초반에 파티를 채우는 데는 오히려 그쪽이 낫다.
 *
 * ## 값이 오른다
 *
 * 가진 수에 따라 1.7배씩 오른다. 고정으로 두면 골드가 쌓이는 후반에 열두 명을
 * 한 번에 다 뽑고 끝난다 — 모으는 게임인데 모으는 과정이 사라진다.
 */
import { CHARS, CHAR_IDS, CharId, Rarity } from './chars';
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
 * 신화가 일반의 40분의 1이다. 더 벌리면 신화가 사실상 안 나와서 각성이
 * 없는 규칙이 되고, 좁히면 등급이 있을 이유가 없다.
 */
export const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 100,
  rare: 55,
  epic: 25,
  legendary: 8,
  mythic: 2.5,
};

/**
 * 이번에 뽑을 대상.
 *
 * 안 가진 사람이 남아 있으면 **그 사람들만**, 다 모았으면 전원이다 (그때는
 * 나오는 것이 조각이다 — `drawChar` 를 부르는 쪽이 이미 가진 사람인지 보고
 * 가른다).
 */
export const poolOf = (owned: readonly string[]): CharId[] => {
  const fresh = CHAR_IDS.filter((id) => !owned.includes(id));
  return fresh.length ? fresh : [...CHAR_IDS];
};

/** 이번 뽑기가 **조각**만 나오는 판인가 — 열둘을 다 모았을 때 */
export const allOwned = (owned: readonly string[]): boolean =>
  CHAR_IDS.every((id) => owned.includes(id));

/**
 * 한 명 뽑는다.
 *
 * 등급 가중치로 **사람 하나하나에** 무게를 매긴다. "먼저 등급을 뽑고 그 안에서
 * 고르는" 방식으로 하면, 그 등급에 한 명만 남았을 때 그 사람이 튀어나올 확률이
 * 갑자기 치솟는다. 사람 단위로 재면 남은 구성이 어떻든 확률이 자연스럽다.
 *
 * @returns 뽑힌 사람. 이미 가진 사람이면 **조각 한 장**이다
 */
export function drawChar(owned: readonly string[], rand: Rand = rnd): CharId | null {
  const pool = poolOf(owned);
  if (!pool.length) return null;

  const weights = pool.map((id) => RARITY_WEIGHT[CHARS[id].rarity]);
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
export function rarityOdds(owned: readonly string[]): Partial<Record<Rarity, number>> {
  const pool = poolOf(owned);
  if (!pool.length) return {};
  const total = pool.reduce((a, id) => a + RARITY_WEIGHT[CHARS[id].rarity], 0);
  const out: Partial<Record<Rarity, number>> = {};
  for (const id of pool) {
    const g = CHARS[id].rarity;
    out[g] = (out[g] ?? 0) + RARITY_WEIGHT[g] / total;
  }
  return out;
}
