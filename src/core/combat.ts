/**
 * 전투 계열 (기획서 §7-3 퀘스트 / §7-4 투기장 / §7-5 탐험 / §7-6 보스의탑 / §9 체력)
 * 전투는 오직 아이템레벨로만 결정된다 (§1) — 시뮬레이션이 아니라 확률 계산이다.
 */
import { ArenaTier, ARENA_TIERS, Quest, QuestDifficulty, Tier } from './types';
import { Rand, rnd, pick, seeded } from './rng';
import { SLOT_COUNT, TIERS, fullSetIlvl, maxSetIlvl, round1, toAvg } from './tiers';
import { s } from './currency';
import { AvatarId } from './avatars';

// ── 체력 (§9) ──────────────────────────────────────────
export const MAX_STAMINA = 100;
/** 10분당 1 자동 회복 */
export const STAMINA_REGEN_MS = 10 * 60_000;

/**
 * 콘텐츠별 체력 소모.
 * 투기장은 여기 없다 — 티켓이 제한을 맡으므로 체력을 겹쳐 걸지 않는다.
 */
export const STAMINA_COST = {
  quest: 10,
  explore: 8,
  tower: 12,
} as const;
export type StaminaKind = keyof typeof STAMINA_COST;

/**
 * 경과 시간만큼 체력을 회복시킨다. 남은 나머지 시간(ms)도 함께 돌려준다.
 * 회복 간격과 최대치는 칭호가 바꿀 수 있으므로 상수를 직접 읽지 않고 인자로 받는다.
 */
export function regenStamina(
  stamina: number, lastAt: number, now: number,
  regenMs = STAMINA_REGEN_MS, max = MAX_STAMINA,
) {
  if (stamina >= max) return { stamina, lastAt: now };
  const elapsed = Math.max(0, now - lastAt);
  const gained = Math.floor(elapsed / regenMs);
  if (gained <= 0) return { stamina, lastAt };
  const next = Math.min(max, stamina + gained);
  return { stamina: next, lastAt: next >= max ? now : lastAt + gained * regenMs };
}

// ── 퀘스트 (§7-3) ──────────────────────────────────────
export const QUEST_DIFFICULTY: Record<QuestDifficulty, {
  label: string; recMul: number; depositMul: number; rewardMul: number;
}> = {
  easy:    { label: '쉬움',      recMul: 0.80, depositMul: 0.15, rewardMul: 1.5 },
  normal:  { label: '보통',      recMul: 1.00, depositMul: 0.30, rewardMul: 2.2 },
  hard:    { label: '어려움',    recMul: 1.15, depositMul: 0.60, rewardMul: 3.5 },
  extreme: { label: '매우 어려움', recMul: 1.30, depositMul: 1.20, rewardMul: 6.0 },
};

/**
 * 퀘스트 성공 확률.
 *
 * ⚠ 기획서 §7-3 의 `50% + (내 템렙 − 추천 템렙) × 0.5%p` 를 그대로 쓰면
 * 추천 템렙이 내 템렙 상대값이라 **모든 난이도가 항상 50% 근처**가 되고,
 * 보상 배수(×1.5~×6.0)와 곱해져 기대값이 1 을 크게 넘는다 (매우 어려움 EV 2.98
 * = 반복하면 무조건 이득인 돈 복사). 후반에는 반대로 5% 클램프에 박혀 죽은 콘텐츠가 된다.
 *
 * 그래서 **보상 배수의 손익분기 승률에서 출발**하도록 바꿨다.
 *   기준 승률 = 하우스 몫 / 보상 배수   → 전 난이도 기대값이 HOUSE_KEEP 으로 통일
 * 여기에 "굴린 시점 대비 지금 내 장비가 얼마나 좋아졌나" 를 비율로 얹는다.
 * 내구도가 닳으면 그만큼 불리해진다 (§10 과 자연히 연결된다).
 */
export const QUEST_HOUSE_KEEP = 0.85;
/** 장비 개선분 반영 가중치. 장비 +20% → 승률 +10%p */
export const QUEST_GEAR_WEIGHT = 0.5;
export const QUEST_GEAR_CAP = 0.20;

/** 난이도별 기준 승률 (보상 배수에서 역산 — 배수를 바꾸면 자동으로 따라온다) */
export function questBaseRate(d: QuestDifficulty): number {
  return QUEST_HOUSE_KEEP / QUEST_DIFFICULTY[d].rewardMul;
}

export function questWinRate(currentIlvl: number, q: Quest): number {
  const base = questBaseRate(q.difficulty);
  const ratio = q.baseIlvl > 0 ? currentIlvl / q.baseIlvl : 1;
  const adj = Math.max(-QUEST_GEAR_CAP, Math.min(QUEST_GEAR_CAP, (ratio - 1) * QUEST_GEAR_WEIGHT));
  return Math.max(0.05, Math.min(0.95, base + adj));
}

/** 난이도별 기대값 (보증금 1 당 회수치). 설계 검증용. */
export function questEV(d: QuestDifficulty): number {
  return questBaseRate(d) * QUEST_DIFFICULTY[d].rewardMul;
}

const QUEST_TITLES = [
  '들쥐 소탕', '실종된 광부 수색', '버섯 채집', '무너진 갱도 조사', '늑대 무리 퇴치',
  '상단 호위', '도굴꾼 추적', '폐광 정찰', '약초 배달', '유령 목격담 확인',
  '고블린 야영지 습격', '수상한 상자 회수', '다리 보수 지원', '길 잃은 양 찾기', '밀수품 압수',
];

/**
 * 보증금은 플레이어 아이템레벨에 비례 (기획서 §7-3 주석의 앵커: 템렙 100 → 보통 30실버).
 * 바닥값을 두지 않는 게 중요하다 — 회생 직후(템렙 0) 곧바로 퀘스트를 돌 수 있어야 한다(§7-9).
 */
function questDeposit(myIlvl: number, d: QuestDifficulty): number {
  // 앵커는 '평균 템렙 100' 이므로 합을 평균으로 환산해서 적용한다
  const base = toAvg(myIlvl) * 100; // 평균 100 → 10,000 쿠퍼; ×0.30(보통) = 3,000 = 30실버
  return Math.max(1, Math.floor(base * QUEST_DIFFICULTY[d].depositMul));
}

/** 랜덤 5개, 1시간마다 리셋 — 같은 시간대면 같은 목록 (시드 고정) */
export function rollQuests(myIlvl: number, hourSlot: number): Quest[] {
  const r = seeded('quest', hourSlot, Math.floor(myIlvl / 10));
  const diffs: QuestDifficulty[] = ['easy', 'normal', 'normal', 'hard', 'extreme'];
  return diffs.map((d, i) => {
    const def = QUEST_DIFFICULTY[d];
    /**
     * 기획서 §7-3 표는 추천 템렙을 "내 템렙 대비" 로 정의한다 (−20% / ±0% / +15% / +30%).
     * 절대 하한선을 두면 초반에 "내 템렙 10, 추천 160" 같은 거짓 경고가 뜨므로
     * 하한은 장비 한 점 수준(SLOT_COUNT)까지만 둔다 — 템렙 0 에서 0 으로 나뉘는 것만 막는 용도.
     */
    const recIlvl = Math.max(1, Math.round(Math.max(SLOT_COUNT, myIlvl) * def.recMul));
    const deposit = questDeposit(myIlvl, d);
    return {
      id: `q-${hourSlot}-${i}`,
      title: pick(QUEST_TITLES, r),
      difficulty: d,
      recIlvl,
      baseIlvl: myIlvl,
      deposit,
      reward: Math.floor(deposit * def.rewardMul),
    };
  });
}

// ── 아이템레벨 대결 승률 (§1) ───────────────────────────
/**
 * 탐험·보스의탑·투기장이 **전부 같은 곡선**을 쓴다.
 *
 * 예전에는 각자 "50% + (내 템렙 − 상대 템렙) × 0.3%p" 같은 **차이**식이었다.
 * 차이식은 스케일을 못 따라간다 — 템렙 30 대 60(두 배 차이)이 9%p 밖에 안 벌어지는데
 * 템렙 3,000 대 3,100(3% 차이)은 30%p 가 벌어진다. 초반엔 장비를 올려도 승률이
 * 안 움직이고, 후반엔 한 칸 강화가 승패를 뒤집는다.
 *
 * 그래서 **비율**로 바꿨다. 앵커 세 개만 박아 두고 로그 비율 위의 로지스틱으로 잇는다.
 *   · 같은 템렙        → 50%
 *   · 내가 1.5배 높으면 → 93%
 *   · 내가 1.5배 낮으면 → 20%
 *
 * 위아래가 비대칭(93 vs 20)이라 기울기를 한쪽씩 따로 잡는다. 대칭 로지스틱이면
 * 1.5배 낮을 때가 7% 가 되어 "장비를 덜 갖추면 아예 못 한다"가 된다 —
 * 20% 는 "불리하지만 운이 따르면 뚫린다" 는 자리다.
 */
export const WIN_ANCHOR_RATIO = 1.5;
export const WIN_ANCHOR_HIGH = 0.93;
export const WIN_ANCHOR_LOW = 0.20;
/** 승률 하한·상한 — 어떤 격차에도 판이 완전히 죽지는 않게 둔다 */
export const WIN_MIN = 0.03;
export const WIN_MAX = 0.97;

const LN_ANCHOR = Math.log(WIN_ANCHOR_RATIO);
/** 내가 유리한 쪽 기울기 — 1.5배에서 93% 에 닿게 역산 */
const K_UP = -Math.log(1 / WIN_ANCHOR_HIGH - 1) / LN_ANCHOR;
/** 내가 불리한 쪽 기울기 — 1.5배 열세에서 20% 에 닿게 역산 */
const K_DOWN = Math.log(1 / WIN_ANCHOR_LOW - 1) / LN_ANCHOR;

/**
 * 아이템레벨 대결 승률 (0~1).
 * 합/평균 어느 단위로 넣어도 같다 — 비율만 보기 때문이다.
 */
export function ilvlWinRate(mine: number, theirs: number): number {
  if (theirs <= 0) return WIN_MAX;
  if (mine <= 0) return WIN_MIN;
  const x = Math.log(mine / theirs);
  const k = x >= 0 ? K_UP : K_DOWN;
  const p = 1 / (1 + Math.exp(-k * x));
  return Math.max(WIN_MIN, Math.min(WIN_MAX, p));
}

// ── 투기장 (§7-4) ──────────────────────────────────────
/**
 * 투기장은 **체력을 쓰지 않는다.** 티켓이 곧 제한이다.
 *
 * 예전엔 체력 5 + 티켓을 둘 다 먹었다. 잠금이 두 겹이면 둘 중 하나는 반드시
 * 죽은 규칙이 된다 — 실제로는 체력이 먼저 말라서 티켓이 남아도 못 들어갔고,
 * 그러면 "티켓 5개" 라는 표시가 거짓말이 된다. 티켓 하나로 정리했다.
 */
export const ARENA_MAX_BADGE = 5;
/**
 * 티켓 충전 — **1시간에 1개** (칭호 "백전노장"이면 54분).
 *
 * 10분당 1개였다. 그러면 하루에 144번을 돌 수 있어서 티켓이 제한 구실을 못 했다.
 * 5개를 다 채우는 데 5시간 — 아침저녁으로 들르면 딱 비는 속도다.
 */
export const ARENA_BADGE_MS = 60 * 60_000;
/**
 * 한 티어의 폭 — 0 ~ 1000 점.
 *
 * 100 이었다. 승리마다 **무조건 +20** 이었으니 다섯 판이면 한 티어였고,
 * 그 다섯 판은 약한 상대만 골라도 됐다 — 그래서 "너무 금방 올라간다" 가 됐다.
 *
 * 폭을 열 배로 넓히고 점수를 승률로 나눈다 (아래 `arenaPointDelta`).
 * 동률 상대(승률 50%)를 이기면 +100 이라 **열 판에 한 티어**이고, 약한 상대만
 * 골라 잡으면 판당 60점이라 열일곱 판이 든다.
 */
export const ARENA_TIER_POINTS = 1_000;
/** 예전 이름 호환 — 화면들이 아직 이 이름으로 티어 진행도를 그린다 */
export const ARENA_POINTS_PER_TIER = ARENA_TIER_POINTS;

/**
 * 동률(승률 50%) 기준 승리 점수. 다른 모든 점수가 여기서 갈라져 나온다.
 */
export const ARENA_BASE_POINTS = 100;

/**
 * 패배 점수의 비율.
 *
 * 이겼을 때의 절반이다. 같게 두면 승률 50% 인 사람이 영원히 제자리라 사다리가
 * 사다리 구실을 못 하고, 너무 낮추면 지는 게 아무 일도 아니게 되어 도전이
 * 도전이 아니게 된다.
 */
const ARENA_LOSS_RATIO = 0.5;

/**
 * 티어가 오를수록 붙는 보정 — 위로 갈수록 조금 더 벌고 조금 더 잃는다.
 * 한 칸에 5%p 씩. F 에서 S 까지 30%p 차이라 체감은 나되 벽은 아니다.
 */
const ARENA_TIER_STEP = 0.05;

/** 방어(도전을 당한 쪽)의 점수 변동 비율 — 내가 건 싸움이 아니므로 3분의 1만 */
export const ARENA_DEFEND_RATIO = 1 / 3;

/**
 * 이 판에서 오르내릴 점수.
 *
 * ## 왜 승률로 나누는가
 *
 * 고정 점수면 **제일 약한 상대만 고르는 게 언제나 최적**이다. 실제로 그랬다 —
 * 이길 확률 90% 짜리를 스무 번 잡는 게 50% 짜리와 겨루는 것보다 빨랐다.
 * 이기기 어려운 상대일수록 많이 주면 그 계산이 뒤집힌다.
 *
 * ## 왜 Elo 를 그대로 쓰지 않았는가
 *
 * Elo 는 **수렴하라고** 만든 식이다. 강한 사람이 약한 상대를 이기면 거의 못 벌고
 * 어쩌다 지면 크게 잃어서, 실력이 늘어도 점수가 제자리에 묶인다. 사다리는
 * 수렴이 아니라 **오르라고** 있는 것이라 양쪽에 바닥을 깔았다:
 *
 *   승리 = BASE × (1.5 − p)        p=0.5 → 100 · p=0.9 → 60 · p=0.2 → 130
 *   패배 = BASE × 0.5 × (0.5 + p)  p=0.5 → 50  · p=0.9 → 70 · p=0.2 → 35
 *
 * 이러면 강한 사람은 판당 조금씩이라도 반드시 오르고, 약한 사람은 어쩌다 이겨도
 * 크게 벌지만 전체로는 내려간다.
 *
 * @param p    내가 이길 확률 (0~1)
 * @param tier 지금 내 티어
 * @param win  이겼는가
 * @param defend 내가 도전을 **당한** 쪽인가 (그러면 3분의 1만)
 * @returns 점수 변화량. 승리는 양수, 패배는 음수
 */
export function arenaPointDelta(
  p: number,
  tier: ArenaTier,
  win: boolean,
  defend = false,
): number {
  const q = Math.max(0, Math.min(1, Number.isFinite(p) ? p : 0.5));
  const idx = ARENA_TIERS.indexOf(tier);
  const raw = win
    ? ARENA_BASE_POINTS * (1.5 - q) * (1 + idx * ARENA_TIER_STEP)
    : -ARENA_BASE_POINTS * ARENA_LOSS_RATIO * (0.5 + q) * (1 + idx * ARENA_TIER_STEP);
  const scaled = raw * (defend ? ARENA_DEFEND_RATIO : 1);
  // 0 점짜리 판은 없다 — 싸웠는데 아무 일도 안 일어나면 싸운 것 같지가 않다
  const n = Math.round(scaled);
  if (win) return Math.max(1, n);
  return Math.min(-1, n);
}

/**
 * 점수를 적용한다 — **승급선에서 한 번 멈춘다.**
 *
 * 950 점에서 100 을 벌면 1050 이 되어 그대로 승급해 버리면, 승급이 어느 판에서
 * 일어났는지가 흐려진다. 티어 끝(1000)에 일단 서고, **그 상태에서 한 판 더
 * 이겨야** 다음 티어로 넘어간다. 승급이 한 판의 사건이 된다.
 *
 * ## 강등 낙폭
 *
 * 티어 바닥에서 더 밀리면 아래 티어로 내려간다. 어디에 앉히느냐가 문제인데,
 * 처음엔 아래 티어의 **한가운데**(500)로 떨어뜨렸다. 그런데 티어 바닥에 서 있는
 * 사람이 30점짜리 한 판을 지면 **500점이 날아갔다** — 30을 잃었는데 대가가 500이다.
 *
 * 지금은 아래 티어의 승급선에서 `DEMOTE_SETBACK`(200)만큼 아래에 앉힌다.
 * 두어 판 이기면 승급선에 돌아오고 거기서 한 판 더 이기면 복귀한다.
 * 999 로 두면 한 판마다 오르내리는 왕복이 되고, 500 은 방금 말한 절벽이 된다.
 * 그 사이다.
 *
 * @returns 적용 후 누적 점수
 */
export function applyArenaPoints(points: number, delta: number): number {
  const cur = Math.max(0, Math.floor(points));
  const idx = Math.min(ARENA_TIERS.length - 1, Math.floor(cur / ARENA_TIER_POINTS));
  const top = ARENA_TIERS.length - 1;

  if (delta >= 0) {
    const promoteLine = (idx + 1) * ARENA_TIER_POINTS;
    // 최고 티어는 승급선이 없다 — 그 안에서만 쌓인다
    if (idx >= top) return Math.min(cur + delta, top * ARENA_TIER_POINTS + ARENA_TIER_POINTS);
    // 승급선에 이미 서 있으면 이번 승리로 넘어간다
    if (cur >= promoteLine) return cur + delta;
    return Math.min(promoteLine, cur + delta);
  }

  const next = cur + delta;
  const floorOfTier = idx * ARENA_TIER_POINTS;
  if (next >= floorOfTier) return next;
  // 티어 아래로 밀렸다 — 아래 티어의 승급선에서 조금 아래로
  if (idx <= 0) return 0;
  return idx * ARENA_TIER_POINTS - DEMOTE_SETBACK;
}

/**
 * 강등했을 때 승급선에서 얼마나 아래에 앉히는가.
 *
 * 200 이면 동률 상대 기준 두 판이다 — 미끄러진 것이 느껴지되, 되돌아오는 길이
 * 눈에 보인다.
 */
const DEMOTE_SETBACK = 200;

/** 지금 승급선에 서 있는가 (한 판만 이기면 올라간다) */
export function atPromoteLine(points: number): boolean {
  const cur = Math.max(0, Math.floor(points));
  const idx = Math.floor(cur / ARENA_TIER_POINTS);
  return idx < ARENA_TIERS.length - 1 && cur % ARENA_TIER_POINTS === 0 && cur > 0;
}

/** 시즌 2주 */
export const SEASON_MS = 14 * 24 * 3600_000;

export const SEASON_REWARD: Record<ArenaTier, number> = {
  F: 10000, E: 30000, D: 80000, C: 200000, B: 500000, A: 1200000, S: 3000000,
};

/** 투기장 승률 — 상대의 **현재** 템렙(내구도 반영)과 겨룬다 (§7-4) */
export function arenaWinRate(myCur: number, oppCur: number): number {
  return ilvlWinRate(myCur, oppCur);
}

export function arenaTierOf(points: number): ArenaTier {
  const idx = Math.min(ARENA_TIERS.length - 1, Math.floor(points / ARENA_POINTS_PER_TIER));
  return ARENA_TIERS[Math.max(0, idx)];
}

/**
 * 새 시즌의 시작 티어 — **지난 시즌보다 한 칸 아래.**
 *
 * 예외가 하나 있다. S 는 A 가 아니라 **B** 에서 시작한다. S 는 티어가 아니라
 * 시즌의 결과물이라, 한 칸만 내리면 지난 시즌의 최상위가 그대로 최상위로
 * 이어져 사다리가 새로 짜이지 않는다. 두 칸을 내려 다시 올라오게 한다.
 */
export function seasonStartTier(prev: ArenaTier): ArenaTier {
  const idx = ARENA_TIERS.indexOf(prev);
  const drop = prev === 'S' ? 2 : 1;
  return ARENA_TIERS[Math.max(0, idx - drop)];
}

/** 시즌 종료 시 점수 — 시작 티어의 바닥에서 다시 시작한다 */
export function softResetPoints(points: number): number {
  const next = seasonStartTier(arenaTierOf(points));
  return ARENA_TIERS.indexOf(next) * ARENA_TIER_POINTS;
}

/**
 * 투기장 상대.
 *
 * 이름 그대로 **그림자**다. 상대가 접속해 있을 필요는 없다 — 마지막으로 올린
 * 프로필(장비·내구도)로 붙는다. 예전엔 이 그림자를 내 템렙에 맞춰 지어냈지만
 * (`rollGhost`), 지금은 서버에 올라온 **실제 플레이어의 프로필**에서 온다
 * (state/net.ts 의 `fetchOpponents`, state/useArenaFoes.ts).
 *
 * 그래서 `dur` 도 진짜다. 수리를 안 하고 접속을 끊은 사람은 실제로 만만하다.
 */
export interface Ghost {
  /** 상대의 user_id — 같은 사람이 연속으로 잡히지 않게 걸러 낼 때 쓴다 */
  id: string;
  name: string;
  avatar: AvatarId;
  ilvl: number;
  /** 상대의 내구도 상태 — 수리 안 하고 온 상대를 노리는 심리전 (§7-4) */
  dur: number;
  curIlvl: number;
  /**
   * 상대의 투기장 누적 점수.
   *
   * 매칭이 **티어를 먼저 본다** (`core/arena` 의 `pickFoes`). 서버에 올라온
   * 프로필에 이미 들어 있는 값이라 따로 받아 올 것이 없다. 예전 프로필에는
   * 없을 수 있어 optional 이고, 없으면 0(F 티어)으로 본다.
   */
  points?: number;
  /** 도전 기록을 서버에 남길 때 쓴다 (전적 · 미접속 중 피격) */
  guildName?: string | null;
}

// ── 탐험 (§7-5) / 보스의탑 (§7-6) ──────────────────────
/**
 * 탐험 챕터 수.
 *
 * 130 은 임의의 숫자가 아니다 — 상급 연성액을 16슬롯에 전부 바른 세트(×1.292)의
 * 승률 50% 지점이다 (docs/ABYSS_ALCHEMY_DESIGN.md §5).
 * 곡선이 선형이라 챕터를 덧붙여도 기존 챕터는 움직이지 않는다.
 * ⚠ 같은 이유로 보스의탑은 늘리면 안 된다 — 지수 곡선의 분모라 기존 층이 전부 쉬워진다.
 */
export const EXPLORE_CHAPTERS = 130;
export const TOWER_FLOORS = 50;
/**
 * 재탕 보상 비율.
 *
 * 1/10 이었다. 이미 깬 챕터를 다시 도는 건 이 게임에서 **돈을 버는 주된 방법**인데
 * 원래 보상의 10%면 체력을 쓸 값어치가 안 났다 — 그래서 다들 안 돌았고,
 * 그러면 클리어한 콘텐츠가 통째로 죽은 콘텐츠가 된다.
 *
 * 1/3 이다. 첫 클리어의 무게는 여전히 세 배로 남으면서, 반복 플레이가
 * "할 만한 일" 이 된다.
 */
export const REPEAT_REWARD_RATE = 1 / 3;
/**
 * 보스의탑 50층 장인 재료 드랍률.
 * 잡아도 확정이 아니다 — 15% 로 하나 떨어지고, 떨어졌을 때만 다시 굴려 하나가 더 붙는다.
 *
 * 등반 1회 기대 수급은 0.195개다. 확정 드랍(1.3개) 시절의 1/6.7 이므로,
 * **필요 재료 수를 같은 배율로 내려**(25 → 10) 총 소요를 감당할 선에 맞췄다.
 * 드랍 규칙을 건드려 "확정이 아니다" 를 흐리는 대신, 목표치를 낮추는 쪽을 골랐다.
 */
export const ARTISAN_MATERIAL_DROP = 0.15;
/** 재료가 떨어졌을 때, 하나가 더 붙을 확률 */
export const ARTISAN_MATERIAL_BONUS = 0.3;

/** 등반 1회당 기대 재료 수 */
export const materialPerClimb = () => ARTISAN_MATERIAL_DROP * (1 + ARTISAN_MATERIAL_BONUS);

/**
 * 권장 템렙 곡선 (§7-5, §7-6).
 * 기획서 값은 '슬롯 평균' 기준(챕터 100 = 1,110 = 용린 +15 풀셋 평균)이므로,
 * 아이템레벨을 합으로 바꾼 만큼 곡선도 SLOT_COUNT 배로 올린다.
 * → 챕터 100 = 17,760 = 용린 +15 풀셋 합. 상대 난이도는 기획서와 동일하다.
 */
/**
 * 탐험 권장 곡선.
 *
 * 예전 선형식((10 + n×11) × 16)은 **1챕터가 336** 이었다. 맨몸(빈 칸 16개 = 160)
 * 으로 시작하는 사람에게 첫 챕터부터 두 배를 요구하니, 시작하자마자 벽이었다.
 *
 * 지금은 두 점을 고정하고 그 사이를 잇는다.
 *   · 챕터 1   = 30      — 아무것도 없어도 이긴다. 첫 판은 가르치는 판이지 거르는 판이 아니다
 *   · 챕터 100 = 용린 풀셋 — 끝을 예전과 같은 자리에 둔다 (10티어 풀셋)
 *
 * 잇는 방법은 **제곱 곡선**이다. 지수로 이으면 100 을 넘어가는 구간(101~130)이
 * 폭주하고, 선형으로 이으면 초반이 다시 가팔라진다. 제곱은 앞을 완만하게 깔면서
 * 뒤를 자연스럽게 이어 준다.
 */
const EXPLORE_CH1_ILVL = 30;
/** 이 챕터에서 최고 세트(용린 풀셋)와 만난다 */
const EXPLORE_ANCHOR_CH = 100;
/** 클수록 초반이 완만하다. 2 = 앞 절반에서 최고치의 1/4 만 요구 */
const EXPLORE_CURVE_POW = 2;

export function exploreRecIlvl(ch: number): number {
  const n = Math.max(1, Math.round(ch));
  const span = maxSetIlvl() - EXPLORE_CH1_ILVL;
  const t = (n - 1) / (EXPLORE_ANCHOR_CH - 1);
  /*
    ⚠ 마지막 챕터는 **반올림하지 않고 그대로** 최고 세트 합에 앉힌다.

    이 곡선의 존재 이유가 "챕터 100 = 최고 세트로 반반" 이다. 그런데 세트 합에
    소수가 생기면서(부위 가중치 × inc) 반올림한 값이 한 끗 어긋났고, 그러면
    승률이 정확히 50% 가 아니게 된다. 끝점만은 어림하지 않는다.
  */
  if (n >= EXPLORE_ANCHOR_CH) {
    return round1(EXPLORE_CH1_ILVL + span * Math.pow(t, EXPLORE_CURVE_POW));
  }
  return Math.round(EXPLORE_CH1_ILVL + span * Math.pow(t, EXPLORE_CURVE_POW));
}
/** 층 n 권장 템렙 ≈ n × 22 (평균) → 합 기준 n × 22 × 16 */
/**
 * 보스의탑 50층(번스타인)의 도전 아이템레벨.
 *
 * 기준: **10티어 +12 풀셋 + 전 칸 A~S급 정령석**.
 * 즉 "장비를 거의 다 올리고 룬각인까지 맞춘" 사람이 반반으로 겨루는 벽이다.
 * 정령석 보너스는 A(+90)와 S(+130)의 중간값을 16칸에 얹은 값으로 잡는다.
 */
const TOWER_TOP_TIER: Tier = 10;
const TOWER_TOP_LEVEL = 12;
const TOWER_TOP_RUNE = ((90 + 130) / 2) * SLOT_COUNT;
export const towerTopIlvl = () => fullSetIlvl(TOWER_TOP_TIER, TOWER_TOP_LEVEL) + TOWER_TOP_RUNE;

/**
 * 1~50층 곡선.
 *
 * 선형(n × 22 × 16)이면 초반이 지나치게 가팔라 1층부터 막힌다.
 * 1층을 시작 장비 수준(160)에 맞추고 50층을 위 기준에 맞춘 뒤,
 * 그 사이를 **지수**로 잇는다 — 티어가 오르는 속도와 결이 같다.
 */
const TOWER_FLOOR1 = 340;
export function towerRecIlvl(fl: number): number {
  const f = Math.min(TOWER_FLOORS, Math.max(1, Math.round(fl)));
  const top = towerTopIlvl();
  const t = (f - 1) / (TOWER_FLOORS - 1);
  return Math.round(TOWER_FLOOR1 * Math.pow(top / TOWER_FLOOR1, t));
}

/**
 * 첫 클리어 보상 ≈ 권장 템렙 × 3쿠퍼, 10단위 보스 챕터는 ×5 (§7-5)
 * 여기서도 기획서 계수는 평균 기준이다 — 합을 그대로 쓰면 보상이 16배가 되어
 * 경제가 무너진다.
 */
/**
 * 이 권장 아이템레벨에 어울리는 티어.
 * 보상을 그 티어의 **강화 비용**에 맞추기 위한 다리다.
 */
function tierForIlvl(sumIlvl: number): Tier {
  const avg = toAvg(sumIlvl);
  let t: Tier = 1;
  for (let i = 1; i <= 10; i++) if (TIERS[i as Tier].base <= avg) t = i as Tier;
  return t;
}

/**
 * 클리어 보상은 **그 구간 강화 비용의 배수**로 준다.
 *
 * 기획서 §7-5 는 "권장 템렙 × 3쿠퍼" 인데, 아이템레벨은 티어마다 1.35배씩 오르는
 * 반면 강화 비용은 2.5배씩 오른다. 그대로 두면 격차가 벌어져서 실측하면
 *   1챕터 = 강화 6.6회분 · 30챕터 = 0.13회분 · 100챕터 = 0.03회분
 * 이 된다 — 227배 붕괴다. 뒤로 갈수록 "이걸 왜 하지" 가 된다.
 *
 * 초반 보상은 이미 후하므로 **둘 중 큰 쪽**을 쓴다 (초반은 그대로, 후반만 올라간다).
 */
/**
 * 클리어 보상의 강화비 배수.
 *
 * 3 이었다. 그런데 10단위 ×5 보너스를 걷어내면서 **사람들이 실제로 기억하는
 * 보상**(10·20·50·100챕터)이 5분의 1로 줄었다 — 곡선은 그대로인데 체감은 폭락이다.
 * 스파이크를 없앤 만큼 곡선 자체를 올린다. 6 이면 스파이크 없던 구간 기준으로
 * 예전의 두 배이고, 스파이크가 있던 구간과 비교해도 40% 선이라 급락으로 안 읽힌다.
 */
const CLEAR_ENHANCE_MUL = 6;

function clearBase(recIlvl: number): number {
  const linear = toAvg(recIlvl) * 3;                       // 기획서 원식
  const t = tierForIlvl(recIlvl);
  /**
   * 티어 안에서도 계속 올라야 한다. 티어만 보면 10티어 구간(61~100챕터)이
   * 전부 같은 보상이 되어 뒤로 갈 이유가 없어진다.
   * 그 티어가 시작되는 아이템레벨 대비 얼마나 더 왔는지를 곱한다.
   */
  const floor = TIERS[t].base * SLOT_COUNT;
  const within = Math.max(1, recIlvl / floor);
  const byCost = TIERS[t].enhanceBase * CLEAR_ENHANCE_MUL * within;
  return Math.max(linear, byCost);
}

/**
 * ## 바닥과 계단 (2026-08)
 *
 * 곡선(`clearBase`)만 쓰면 **초반이 통째로 납작하다.** 실측하면 1~5챕터가 전부
 * 15쿠퍼(0.15실버)로 똑같았다 — 다섯 챕터를 밀고 나아가도 보상이 한 푼도 안 늘었다.
 * 곡선이 지수라서 그렇다: 뒤가 커지는 만큼 앞이 0 에 붙는다.
 *
 * 그래서 **바닥과 계단을 깐다.** 1챕터가 최소 이만큼(FLOOR), 한 챕터 나아갈 때마다
 * 최소 이만큼(STEP)은 더 준다. 곡선이 그 위로 올라오면 곡선을 쓴다.
 * 결과적으로 "한 챕터 더 가면 반드시 더 받는다" 가 보장된다.
 */
const EXPLORE_FLOOR = s(1);
const EXPLORE_STEP = s(1);
const TOWER_FLOOR_REWARD = s(5);
const TOWER_STEP = s(5);

/**
 * 보스의탑 배수.
 *
 * 같은 난이도라면 탑이 더 줘야 한다 — 층은 50개뿐이고, 한 층이 탐험 한 챕터보다
 * 무겁고, 여기가 장인 재료가 나오는 유일한 곳이다. 탑을 오를 이유가 재료 하나뿐이면
 * 재료가 필요 없는 사람에게 탑은 없는 콘텐츠가 된다.
 */
const TOWER_REWARD_MUL = 2.5;

/**
 * 클리어 보상.
 *
 * ⚠ **10단위 ×5 보너스를 없앴다.**
 *
 * 10·20·30… 층에 다섯 배를 주던 규칙이 있었는데, 이게 보상을 **거꾸로 만들었다** —
 * 50챕터가 51챕터보다 26만 쿠퍼 더 줬다. 더 어려운 데를 갔는데 덜 받는 것이라,
 * 보상표를 보고 계획을 세우는 게 불가능했다.
 *
 * 지금은 챕터가 오르면 보상도 반드시 오른다. 그것만으로 "다음 챕터" 가 목표가 된다.
 */
export function exploreReward(ch: number): number {
  const n = Math.max(1, Math.round(ch));
  const stair = EXPLORE_FLOOR + (n - 1) * EXPLORE_STEP;
  return Math.floor(Math.max(clearBase(exploreRecIlvl(n)), stair));
}

/**
 * 층 보상은 **1층에서 시작하는 계단**이다.
 *
 * 예전엔 계단이 고정값(5실버)에서 출발했다. 그런데 1층은 템렙 기반 보상이 그보다
 * 커서(850쿠퍼) 1층만 튀어나오고, 2층이 계단(1,000)으로 돌아오면서 **1→2층 격차가
 * 150쿠퍼**로 주저앉았다. "한 층 오르면 5실버는 더" 라는 약속이 그 한 칸에서만 깨진다.
 *
 * 착용 칸을 10칸으로 줄이며 템렙 총합이 내려가자 이 자리가 드러났다 — 칸 수가
 * 바뀔 때마다 다시 어긋나지 않게, 계단의 출발점을 **1층이 실제로 주는 값**에 맞춘다.
 */
export function towerReward(fl: number): number {
  const n = Math.max(1, Math.round(fl));
  const first = Math.max(
    TOWER_FLOOR_REWARD,
    Math.floor(clearBase(towerRecIlvl(1)) * TOWER_REWARD_MUL),
  );
  const stair = first + (n - 1) * TOWER_STEP;
  return Math.floor(Math.max(clearBase(towerRecIlvl(n)) * TOWER_REWARD_MUL, stair));
}

/**
 * 탐험·보스의탑 승률 — 권장 아이템레벨을 "상대" 로 놓고 투기장과 같은 곡선을 쓴다.
 * 권장 템렙에 딱 맞추면 50%, 1.5배면 93%, 1.5배 모자라면 20% 다.
 */
export function stageWinRate(myCur: number, recIlvl: number): number {
  return ilvlWinRate(myCur, recIlvl);
}

export const CHAPTER_NAMES = [
  '변두리 밀밭', '무너진 성문', '늑대 골짜기', '버려진 갱도', '안개 습지',
  '도적 야영지', '고목의 숲', '메마른 협곡', '얼어붙은 호수', '폐허가 된 요새',
];

export function chapterName(ch: number): string {
  return `${CHAPTER_NAMES[(ch - 1) % CHAPTER_NAMES.length]} ${Math.ceil(ch / CHAPTER_NAMES.length)}`;
}
