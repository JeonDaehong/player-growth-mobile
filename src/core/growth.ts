/**
 * 캐릭터가 자라는 **세 축** — 등급 · 성 · 레벨.
 *
 * 한동안 축이 하나였다 (고유장비 강화 `gearLv`). 축이 하나면 "누구를 키울까"
 * 만 남고 "이 사람을 어떻게 키울까" 가 없다 — 골드를 붓는 것 말고 할 일이
 * 없으니, 캐릭터를 모으는 게임인데 모은 것으로 하는 일이 없었다.
 *
 * 세 축은 하는 일이 서로 다르다. 겹치면 축이 아니라 이름만 셋이다.
 *
 *   **등급** `Rarity`  — 얼마나 구하기 어렵나. 강화 성장률과 **상한**을 정한다
 *   **성**   `star`    — 몇 성이나. 레벨 상한과 **스킬 해금**을 정한다
 *   **레벨** `lv`      — 꾸준히 오르는 값. 공격과 체력이 조금씩 는다
 *
 * ## 등급이 상한이다
 *
 * 등급은 지금 당장의 세기가 아니라 **어디까지 갈 수 있나**다. 일반은 1성에서
 * 멈추고 신화만 각성까지 간다. 그래서 갓 뽑은 일반이 당장 쓸모없지는 않지만
 * (레벨 35 까지는 간다) 끝까지 데려갈 사람은 아니다.
 *
 *   일반 Common      1성      Lv 35
 *   희귀 Rare        3성      Lv 75
 *   영웅 Epic        4성      Lv 100
 *   전설 Legendary   5성      Lv 120
 *   신화 Mythic      각성     Lv 140
 *
 * ## 성은 같은 사람을 겹쳐 만든다
 *
 * 같은 캐릭터 둘을 합치면 한 성이 오른다. 그래서 1성 하나를 5성으로 만들려면
 * **1성 열여섯 장**이 든다 (`starUpCost` 를 다 더하면 15 + 본인 1). 각성은
 * 5성 셋이 필요하므로 거기서 서른둘이 더 든다 (`AWAKEN_COPIES`).
 *
 * 이 숫자가 커야 하는 이유가 있다. 성이 올려 주는 것은 스탯이 아니라
 * **레벨 상한과 스킬**이라, 한 번 오를 때마다 그 사람이 하는 일이 바뀐다.
 * 싸게 오르면 모든 캐릭터가 며칠 만에 스킬 다섯을 다 갖고, 그러면 캐릭터끼리
 * 다른 점이 없어진다.
 *
 * ## 이 파일은 아무것도 안 가져온다
 *
 * `chars` 를 안 읽는다 (`chars` 가 여기를 읽는다). 규칙만 있고 사람은 없으므로
 * 숫자를 고치려고 여기 들어올 때 캐릭터 표를 지나지 않아도 된다.
 */

/** 등급 — 낮은 것부터 */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const RARITY_IDS: readonly Rarity[] =
  ['common', 'rare', 'epic', 'legendary', 'mythic'] as const;

export const RARITY_NAME: Record<Rarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
  mythic: '신화',
};

/** 좁은 자리에 넣는 한 글자 — 파티 칸처럼 이름이 안 들어가는 곳 */
export const RARITY_LETTER: Record<Rarity, string> = {
  common: '일',
  rare: '희',
  epic: '영',
  legendary: '전',
  mythic: '신',
};

/**
 * 강화 한 단계가 올려 주는 비율 (`core/chars` 의 `statOf`).
 *
 * 등급이 스탯을 직접 안 올리고 **기울기만** 올린다. +0 에서는 일반과 신화가
 * 거의 같고, 키울수록 벌어진다 — 처음 얻은 일반이 곧바로 짐이 되면 초반이
 * 성립하지 않는다.
 */
export const RARITY_GROWTH: Record<Rarity, number> = {
  common: 0.06,
  rare: 0.075,
  epic: 0.09,
  legendary: 0.105,
  mythic: 0.12,
};

/** 별은 다섯까지. 그 위는 성이 아니라 **각성**이다 */
export const STAR_CAP = 5;

/** 그 등급이 갈 수 있는 마지막 성 */
export const RARITY_STAR: Record<Rarity, number> = {
  common: 1,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 5,
};

/** 각성까지 가는 등급 — **신화뿐이다** */
export const RARITY_AWAKE: Record<Rarity, boolean> = {
  common: false,
  rare: false,
  epic: false,
  legendary: false,
  mythic: true,
};

/**
 * 성마다의 레벨 상한 — 자리 0 이 1성이다.
 *
 * 35 · 50 · 75 · 100 · 120, 각성은 140.
 *
 * 간격이 뒤로 갈수록 넓다 (15 · 25 · 25 · 20 · 20). 앞쪽을 좁게 둔 것은
 * 1성에서 2성으로 가는 것이 **제일 자주 일어나는 일**이기 때문이다 —
 * 거기서 상한이 확 열리면 다음 합성까지의 시간이 텅 빈다.
 */
export const LV_CAP: readonly number[] = [35, 50, 75, 100, 120];

/** 각성한 사람의 레벨 상한 */
export const AWAKE_LV_CAP = 140;

/*
  ── 레벨 성장은 여기 없다 ──

  한동안 누구나 공격 +2% · 체력 +1.6% 였다 (`LV_GROWTH` · `LV_HP_RATIO`).
  비율이라 기본치가 큰 쪽이 더 많이 올랐고, 그래서 레벨을 올리는 일이 넷
  모두에게 **같은 일**이었다 — 누구를 키울지가 곧 누가 원래 센가였다.

  지금은 **사람마다 다른 고정값**이고 캐릭터 표에 산다 (`core/chars` 의
  `CharDef.perLv`). 이졸데는 체력이, 비앙카는 공격이 빨리 자란다.

  등급이 얹히는 축은 여전히 강화 하나뿐이다 (`RARITY_GROWTH`). 레벨에도
  등급을 얹으면 신화와 일반의 차이가 곱절로 벌어져서, 일반은 뽑는 순간
  버리는 것이 된다.
*/

/** 그 등급이 갈 수 있는 마지막 성 */
export const maxStar = (r: Rarity): number => RARITY_STAR[r] ?? 1;

/** 각성할 수 있나 */
export const canAwaken = (r: Rarity): boolean => RARITY_AWAKE[r] ?? false;

/** 지금 성(과 각성 여부)에서의 레벨 상한 */
export function lvCap(star: number, awake = false): number {
  if (awake) return AWAKE_LV_CAP;
  const s = Math.max(1, Math.min(STAR_CAP, Math.floor(star)));
  return LV_CAP[s - 1] ?? LV_CAP[0];
}

/**
 * `star` 에서 `star+1` 로 가는 데 드는 **1성 조각** 수.
 *
 * 한 성 위는 같은 성 둘을 합친 것이므로, 1성으로 환산하면 두 배씩이다.
 *
 *   1 → 2   조각 1     (합계 2 장)
 *   2 → 3   조각 2     (합계 4 장)
 *   3 → 4   조각 4     (합계 8 장)
 *   4 → 5   조각 8     (합계 16 장)
 *
 * 조각을 성별로 따로 세지 않는다. "2성 조각 하나" 는 언제나 "1성 조각 둘" 과
 * 같은 것이라, 나눠 두면 창고에 두 줄이 생기고 사람은 그 둘을 늘 손으로
 * 옮겨야 한다 — 계산이 하나뿐인데 표시가 둘이면 그건 표시의 잘못이다.
 */
export const starUpCost = (star: number): number =>
  Math.pow(2, Math.max(1, Math.floor(star)) - 1);

/**
 * 각성에 드는 조각 — **5성 둘** 만큼이다.
 *
 * 사양은 "5성 3개" 인데, 그중 하나는 각성시킬 본인이다. 남은 둘이 5성이므로
 * 1성으로 환산해 16 × 2 = 32 장이다.
 */
export const AWAKEN_COPIES = Math.pow(2, STAR_CAP - 1) * 2;

/** 각성에 같이 드는 것 — **강성의 영약** 한 병 */
export const AWAKEN_ELIXIR = 1;

/** 화면에 적는 이름 */
export const ELIXIR_NAME = '강성의 영약';

/**
 * ── 스킬 해금 ──
 *
 * 성 하나가 기술 하나를 연다. 그래서 등급이 곧 **기술을 몇 개나 쓰나**가 된다.
 *
 *   1성   패시브 + 스킬1     일반은 여기서 끝난다
 *   2성   스킬2
 *   3성   스킬3              희귀는 여기까지
 *   4성   스킬4              영웅은 여기까지
 *   5성   스킬5              전설은 여기까지
 *   각성  각성 스킬 + 각성 패시브   신화만
 *
 * 패시브는 성을 안 탄다. 1성부터 걸려 있고, 각성 패시브 하나가 더 붙는다 —
 * 패시브는 "그 사람이 어떤 사람인가" 라서, 성을 올려야 성격이 생기는 것은
 * 이상하다.
 *
 * @returns 열려 있는 **능동 기술의 수** (`core/chars` 의 `skillsOf` 순서)
 */
export function skillSlots(star: number, awake = false): number {
  const s = Math.max(1, Math.min(STAR_CAP, Math.floor(star)));
  return awake ? STAR_CAP + 1 : s;
}

/** 그 자리의 기술이 열리려면 몇 성이어야 하나 (자리 0 = 스킬1 = 1성) */
export const skillNeeds = (slot: number): number => Math.max(1, slot + 1);

/** 그 자리가 **각성 기술**인가 — 다섯 자리 뒤가 각성이다 */
export const isAwakenSlot = (slot: number): boolean => slot >= STAR_CAP;

/**
 * 레벨 한 칸 올리는 값 (골드).
 *
 * 강화와 달리 **실패가 없다.** 강화는 확률로 시간을 먹고, 레벨은 값으로 먹는다 —
 * 둘 다 확률이면 골드를 어디에 쓸지가 그냥 운이 된다.
 */
export function lvCost(lv: number): number {
  return Math.floor(120 * Math.pow(1.075, Math.max(1, Math.floor(lv)) - 1));
}

/**
 * 우두머리를 잡을 때 영약이 나올 확률.
 *
 * 10판부터다. 그 아래에서 나오면 각성이 초반 목표가 되는데, 각성은 조각
 * 서른둘이 같이 필요하므로 (`AWAKEN_COPIES`) 초반에는 절대 못 채운다 —
 * 채울 수 없는 것을 일찍 보여 주면 그건 목표가 아니라 잠긴 문이다.
 */
export const ELIXIR_FROM = 10;
export const ELIXIR_ODDS = 0.2;

export function rollElixir(stage: number, rand: () => number = Math.random): number {
  if (stage < ELIXIR_FROM) return 0;
  return rand() < ELIXIR_ODDS ? 1 : 0;
}
