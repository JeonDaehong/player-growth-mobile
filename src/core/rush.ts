/**
 * 크리처 러쉬 (기획서 §7-1)
 * 5분마다 개최. 10종 중 2마리 랜덤 매칭 → 턴제 전투.
 * 배당률은 크리처 총 전적 + 상대전적으로 산출한다.
 */
import { Creature, RushMatch } from './types';
import { seeded } from './rng';
import { g, s } from './currency';

/**
 * 한 회차 5분 30초 = 배팅 3분 → 전투 2분 → 다음 배팅까지 대기 30초.
 * 전투 중에는 배팅할 수 없다 (결과가 정해진 뒤 배팅하면 도박이 아니다).
 * 전투는 마지막 턴에 한쪽이 쓰러지면서 끝나고, 곧바로 대기로 넘어간다.
 */
/** 배팅 창 */
export const RUSH_BET_MS = 3 * 60_000;
/**
 * 전투 진행 시간.
 *
 * 4분에서 **2분으로 줄였다.** 판돈을 걸고 나면 할 수 있는 게 로그가 올라오는 걸
 * 보는 것뿐인데, 4분은 그 상태로 앉아 있기엔 너무 길었다 — 대부분 화면을 나갔다가
 * 결과만 보러 돌아왔고, 그러면 전투 연출이 있으나 마나가 된다.
 *
 * 턴 간격(2초)은 그대로라 턴 수만 120 → 60 으로 준다. 로그가 올라오는 속도는
 * 같고 경기만 짧아진다.
 */
export const RUSH_FIGHT_MS = 2 * 60_000;
/** 전투 종료 후 다음 배팅까지 */
export const RUSH_IDLE_MS = 30_000;
export const RUSH_PERIOD_MS = RUSH_BET_MS + RUSH_FIGHT_MS + RUSH_IDLE_MS;
/** 3회차마다 특수룰: 배당금 2배, 대신 최소 배팅 1골드 */
export const SPECIAL_EVERY = 3;
export const RUSH_MIN_BET = s(1);
export const RUSH_SPECIAL_MIN_BET = g(1);
export const RUSH_MAX_BET = g(50);

/**
 * face = 아트가 바라보는 방향. 'r' 오른쪽 · 'l' 왼쪽 · 'c' 대칭(뒤집지 않는다).
 * ult  = HP 30% 이하에서 쓰는 고유 필살기.
 */
/** 지금은 'l' 이 없지만 왼쪽 보는 아트가 들어올 수 있다 */
export type Facing = 'r' | 'l' | 'c';
export const CREATURE_DEFS = [
  { id: 'slime',   name: '외눈 슬라임',   power: 42, face: 'r', ult: '점액 분출' },
  { id: 'wolf',    name: '이빨 늑대',     power: 55, face: 'r', ult: '목덜미 물기' },
  { id: 'golem',   name: '돌주먹 골렘',   power: 62, face: 'r', ult: '대지 내려찍기' },
  { id: 'bat',     name: '그림자 박쥐',   power: 48, face: 'r', ult: '초음파 절규' },
  { id: 'boar',    name: '가시 멧돼지',   power: 52, face: 'r', ult: '가시 돌진' },
  { id: 'skeleton',name: '해골 검사',     power: 58, face: 'r', ult: '백골 연격' },
  { id: 'toad',    name: '독안개 두꺼비', power: 45, face: 'r', ult: '독무 분사' },
  { id: 'mantis',  name: '강철 사마귀',   power: 60, face: 'r', ult: '쌍낫 참격' },
  { id: 'ogre',    name: '외뿔 오우거',   power: 68, face: 'r', ult: '외뿔 박치기' },
  // 촉수는 얼굴이 없고 좌우 대칭이라 뒤집을 필요가 없다
  { id: 'tentacle',name: '심연의 촉수',   power: 65, face: 'c', ult: '심연 포박' },
] as const;

const DEF_OF = (id: string) =>
  CREATURE_DEFS.find((c) => c.id === id) as
    | { id: string; name: string; power: number; face: Facing; ult: string }
    | undefined;

/** 필살기 이름 */
export const creatureUlt = (id: string) => DEF_OF(id)?.ult ?? '필살기';

/**
 * 이 자리에 세울 때 아트를 뒤집어야 하는가.
 *
 * 서로 마주 봐야 하므로 왼쪽 자리는 오른쪽을, 오른쪽 자리는 왼쪽을 봐야 한다.
 * 정면(c) 아트는 뒤집으면 오히려 어색하므로 건드리지 않는다.
 */
export function shouldFlip(id: string, side: 'left' | 'right'): boolean {
  const f: Facing = DEF_OF(id)?.face ?? 'c';
  if (f === 'c') return false;
  return side === 'right' ? f === 'r' : f === 'l';
}

export type CreatureId = (typeof CREATURE_DEFS)[number]['id'];

export const creatureName = (id: string) =>
  CREATURE_DEFS.find((c) => c.id === id)?.name ?? id;

/**
 * 전적은 **실제로 치른 경기만** 쌓는다. 예전에는 20전을 미리 넣어 두었는데,
 * 아직 한 경기도 안 했는데 "12승 8패" 가 떠 있으면 전적을 믿을 수 없게 된다.
 * 대신 배당은 power 를 사전확률로 써서 첫 경기부터 의미 있게 갈린다 (winRateOf).
 */
export function initCreatures(): Record<string, Creature> {
  const out: Record<string, Creature> = {};
  for (const c of CREATURE_DEFS) {
    out[c.id] = { id: c.id, name: c.name, wins: 0, losses: 0 };
  }
  return out;
}

export const slotOf = (now: number) => Math.floor(now / RUSH_PERIOD_MS);

/**
 * 화면에 보여줄 회차 번호 — **이번 주의 몇 번째 경기인가.**
 *
 * `slot` 은 1970년 기준이라 그대로 쓰면 5,415,000 같은 숫자가 나온다.
 *
 * 예전엔 저장해 둔 첫 회차(`rushEpoch`)를 1 로 삼아 뺐다. 그런데 그 값은
 * **그때의 회차 길이로 계산된 것**이라, 전투 시간을 4분에서 2분으로 줄이자
 * `slotOf` 가 통째로 밀리면서 화면에 1,445,121 회차가 찍혔다. 저장된 기준점과
 * 지금의 눈금이 서로 다른 자를 쓰고 있었던 것이다.
 *
 * 지금은 **주 시작(월요일 00시)에서 세어 계산한다.** 저장에 기대지 않으므로
 * 회차 길이를 또 바꿔도 스스로 맞고, 월요일 00시가 되면 다시 1회차로 돌아간다.
 * 한 주는 1,800회차 안팎이라 숫자도 읽을 만하다.
 */
export function roundNo(slot: number): number {
  const t = slot * RUSH_PERIOD_MS;
  return Math.floor((t - weekStartOf(t)) / RUSH_PERIOD_MS) + 1;
}

// ── 주간 리셋 (월요일 00시) ────────────────────────────
/** 이번 주(월요일 00시) 시작 시각 */
export function weekStartOf(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0=일 … 6=토. 월요일을 주 시작으로 삼는다
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return d.getTime();
}

/** 주 식별 키 — 이 값이 바뀌면 전적을 초기화한다 */
export function weekKeyOf(t: number): string {
  const d = new Date(weekStartOf(t));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 다음 리셋 시각 (다음 월요일 00시) */
export function nextWeekReset(t: number): number {
  const d = new Date(weekStartOf(t));
  d.setDate(d.getDate() + 7);
  return d.getTime();
}

export type RushPhase = 'betting' | 'fighting' | 'idle';

export interface RushTiming {
  slot: number;
  phase: RushPhase;
  slotStart: number;
  /** 배팅 마감 = 전투 시작 */
  fightStartsAt: number;
  fightEndsAt: number;
  /** 다음 배팅 시작 */
  nextBetAt: number;
  /** 현재 페이즈가 끝날 때까지 남은 ms */
  remain: number;
  /** 전투 진행률 0~1 (fighting 일 때만 의미 있음) */
  progress: number;
}

/** 지금 몇 회차 어느 단계인가 */
export function timingOf(now: number): RushTiming {
  const slot = slotOf(now);
  const slotStart = slot * RUSH_PERIOD_MS;
  const fightStartsAt = slotStart + RUSH_BET_MS;
  const fightEndsAt = fightStartsAt + RUSH_FIGHT_MS;
  const nextBetAt = slotStart + RUSH_PERIOD_MS;

  if (now < fightStartsAt) {
    return { slot, phase: 'betting', slotStart, fightStartsAt, fightEndsAt, nextBetAt,
      remain: fightStartsAt - now, progress: 0 };
  }
  if (now < fightEndsAt) {
    return { slot, phase: 'fighting', slotStart, fightStartsAt, fightEndsAt, nextBetAt,
      remain: fightEndsAt - now, progress: (now - fightStartsAt) / RUSH_FIGHT_MS };
  }
  return { slot, phase: 'idle', slotStart, fightStartsAt, fightEndsAt, nextBetAt,
    remain: nextBetAt - now, progress: 1 };
}

/** 이 회차의 전투가 끝났는가 (정산 가능) */
export const fightEndedAt = (slot: number) =>
  slot * RUSH_PERIOD_MS + RUSH_BET_MS + RUSH_FIGHT_MS;

/** now 기준으로 정산 가능한 가장 최근 회차 */
export function lastSettleableSlot(now: number): number {
  const slot = slotOf(now);
  return now >= fightEndedAt(slot) ? slot : slot - 1;
}

/** power(40~70) → 사전 승률 0.35~0.65 */
function priorRate(id: string): number {
  const p = DEF_OF(id)?.power ?? 50;
  return Math.max(0.2, Math.min(0.8, 0.35 + ((p - 40) / 30) * 0.3));
}

/** 사전확률과 실전적을 섞을 때, 경기 수 이만큼에서 반반이 된다 */
const RATE_SHRINK = 8;

/**
 * 승률 추정.
 *
 * 전적이 0 이면 power 사전확률을, 경기가 쌓이면 실제 전적 쪽으로 옮겨 간다.
 * (전적을 조작하지 않고도 첫 경기부터 배당이 갈리게 하는 방법)
 */
export function winRateOf(c: Creature): number {
  const games = c.wins + c.losses;
  const actual = (c.wins + 1) / (games + 2);
  const k = games / (games + RATE_SHRINK);
  return priorRate(c.id) * (1 - k) + actual * k;
}

// ── 상대전적 ───────────────────────────────────────────
/** `a:b` = a 가 b 를 이긴 횟수 */
export type H2H = Record<string, number>;

export const h2hKey = (a: string, b: string) => `${a}:${b}`;

export interface H2HRecord {
  aWins: number;
  bWins: number;
  games: number;
}

export function h2hOf(h2h: H2H, a: string, b: string): H2HRecord {
  const aWins = h2h[h2hKey(a, b)] ?? 0;
  const bWins = h2h[h2hKey(b, a)] ?? 0;
  return { aWins, bWins, games: aWins + bWins };
}

/** 상대전적 표본이 이만큼 쌓여야 총 전적과 반반으로 섞인다 */
const H2H_SHRINK = 6;

/**
 * 배당률 = 1 / 승률 을 기준으로 하우스 마진(8%)을 뗀다.
 * 승률 60% → 약 1.53배, 40% → 약 2.3배. (기획서 예시와 동일한 역산 구조)
 *
 * 승률은 **총 전적 + 상대전적**을 섞는다 (기획서 §7-1).
 * 상대전적은 표본이 적으면 요동치므로, 경기 수에 따라 총 전적 쪽으로 수축시킨다
 * (k = n / (n + 6) — 6전째에 반반, 그 전에는 총 전적이 우세).
 */
const HOUSE_EDGE = 0.92;

export function oddsFor(
  a: Creature,
  b: Creature,
  h2h: H2H = {},
): { oddsA: number; oddsB: number; pA: number; h2h: H2HRecord } {
  const wa = winRateOf(a);
  const wb = winRateOf(b);
  const overall = wa / (wa + wb);

  const rec = h2hOf(h2h, a.id, b.id);
  const direct = (rec.aWins + 1) / (rec.games + 2);
  const k = rec.games / (rec.games + H2H_SHRINK);
  const pA = Math.max(0.08, Math.min(0.92, overall * (1 - k) + direct * k));

  const round2 = (x: number) => Math.max(1.05, Math.round(x * 100) / 100);
  return { oddsA: round2(HOUSE_EDGE / pA), oddsB: round2(HOUSE_EDGE / (1 - pA)), pA, h2h: rec };
}

/** 해당 슬롯의 매치 — 시드 고정이라 앱을 껐다 켜도 같은 대진 */
export function matchForSlot(slot: number, creatures: Record<string, Creature>, h2h: H2H = {}): RushMatch {
  const r = seeded('rush', slot);
  const ids = CREATURE_DEFS.map((c) => c.id);
  const i = Math.floor(r() * ids.length);
  let j = Math.floor(r() * (ids.length - 1));
  if (j >= i) j += 1;
  const a = ids[i];
  const b = ids[j];
  const { oddsA, oddsB } = oddsFor(creatures[a], creatures[b], h2h);
  return {
    slot,
    a,
    b,
    special: slot % SPECIAL_EVERY === 0,
    oddsA,
    oddsB,
    startsAt: slot * RUSH_PERIOD_MS + RUSH_BET_MS,
    endsAt: fightEndedAt(slot),
  };
}

// ── 턴제 전투 로그 ─────────────────────────────────────
export interface RushTurn {
  text: string;
  /** 관중 반응 */
  crowd?: string;
  hpA: number;
  hpB: number;
  /** 이 턴에 들어간 피해 (방어면 없음) */
  dmg?: number;
  /** A 가 공격한 턴인가 */
  atkA?: boolean;
  /** 필살기 턴인가 (연출 강조용) */
  ult?: boolean;
}

const ACTIONS = ['공격', '방어', '스킬'] as const;
const CROWD = ['우와아아!', '야유가 쏟아진다', '함성!', '탄식...', '박수갈채', '휘파람 소리'];

/** 로그 한 줄이 올라오는 간격 */
export const RUSH_TURN_MS = 2_000;
/** 한 경기의 턴 수 — 전투 시간을 간격으로 나눈 값 (2분 / 2초 = 60) */
export const RUSH_TURNS = Math.max(1, Math.floor(RUSH_FIGHT_MS / RUSH_TURN_MS));
/** 크리처 최대 HP. 턴이 75 회나 되므로 100 이면 한 방에 다 깎인다. */
export const RUSH_MAX_HP = 1_000;
/** 승자가 남기는 대략적인 HP 비율 — 0 에 가까우면 아슬아슬해 보이지만 역전 보정이 잦아진다 */
const WINNER_END_RATIO = 0.28;
/** 이 비율 이하로 몰리면 고유 필살기를 꺼낸다 */
export const ULT_HP_RATIO = 0.3;
/** 궁지에 몰린 턴에 필살기가 나올 확률 */
const ULT_CHANCE = 0.35;

/**
 * 피해 배수 — 필살기와 평타의 관계가 여기서 정해진다.
 *
 * **필살기의 최소 배수가 평타의 최대 배수보다 크다.** 같은 턴에서 필살기가
 * 평타만도 못한 숫자를 내는 일이 원천적으로 없다는 뜻이고, 이게 "역전의 발판"
 * 이라는 말이 성립하는 유일한 조건이다.
 */
export const PLAIN_MAX_MUL = 2.3;   // 강격 상한 (1.3 + 1.0)
export const ULT_MIN_MUL = 2.4;     // 막힌 필살기 하한
export const ULT_MAX_MUL = 6.0;     // 직격 상한

/**
 * 필살기를 꺼낼 최소 기준 피해.
 *
 * 기준 피해(`base`)는 **남은 예산을 남은 턴으로 나눈 값**이라 경기 막바지에는
 * 1~2 까지 떨어진다. 그때 필살기가 나오면 "직격 — 판이 뒤집힌다" 라는 문구와 함께
 * 피해 2 가 찍힌다. 배수를 아무리 올려도 0에 가까운 수에 곱하면 0이다.
 * 그래서 **의미 있게 때릴 수 있을 때만** 꺼낸다.
 */
const ULT_MIN_BASE = RUSH_MAX_HP * 0.012;

/**
 * 승부는 시드로 고정 — 배팅이 끝난 뒤 결과가 바뀌면 안 된다.
 * 전투 로그는 그 결과에 도달하도록 생성되는 "연출"이다.
 *
 * 턴 수를 먼저 정하고(RUSH_TURNS) 그 안에 패자의 HP 가 정확히 0 이 되도록
 * **매 턴 기준 피해량을 역산**한다. 예전에는 HP 100 을 랜덤하게 깎아서 10턴 안에
 * 끝나 버렸고, 그걸 2분30초에 펴 놓으니 15초에 한 줄씩 올라왔다.
 */
export function simulate(match: RushMatch, creatures: Record<string, Creature>, h2h: H2H = {}) {
  const r = seeded('rush-fight', match.slot);
  const { pA } = oddsFor(creatures[match.a], creatures[match.b], h2h);
  const winner = r() < pA ? match.a : match.b;
  const aWins = winner === match.a;

  const nameA = creatureName(match.a);
  const nameB = creatureName(match.b);
  const turns: RushTurn[] = [];
  let hpA = RUSH_MAX_HP;
  let hpB = RUSH_MAX_HP;

  // 승자가 공격을 쥐는 비율. 실제로 피해가 들어가는 건 3분의 2 (방어는 0)
  const WIN_SHARE = 0.62;
  const DMG_SHARE = 2 / 3;
  const winnerFloor = Math.round(RUSH_MAX_HP * WINNER_END_RATIO);

  for (let t = 0; t < RUSH_TURNS; t++) {
    const last = t === RUSH_TURNS - 1;
    const remain = RUSH_TURNS - t;
    const attackerIsA = last ? aWins : r() < (aWins ? WIN_SHARE : 1 - WIN_SHARE);
    const winnerAttacks = attackerIsA === aWins;
    const act = last ? '스킬' : ACTIONS[Math.floor(r() * ACTIONS.length)];
    const atkName = attackerIsA ? nameA : nameB;
    const defName = attackerIsA ? nameB : nameA;

    /**
     * 기준 피해 — 남은 턴 안에 목표 HP 까지 정확히 내려가도록 역산한다.
     * 승자가 때릴 때는 패자를 0 으로, 패자가 때릴 때는 승자를 하한까지만.
     */
    const loserHp = aWins ? hpB : hpA;
    const winHp = aWins ? hpA : hpB;
    const budget = winnerAttacks
      ? loserHp
      : Math.max(0, winHp - winnerFloor);
    const share = winnerAttacks ? WIN_SHARE : 1 - WIN_SHARE;
    const base = budget / Math.max(1, remain * share * DMG_SHARE);

    /**
     * 궁지에 몰리면(자기 HP 30% 이하) 고유 필살기.
     * 피해가 크지만 상대가 피하거나 반만 맞을 수 있어, 몰린 쪽의 마지막 도박이 된다.
     */
    const atkHp = attackerIsA ? hpA : hpB;
    const cornered = atkHp <= RUSH_MAX_HP * ULT_HP_RATIO;
    /* 예산이 말라 있으면 안 꺼낸다 — 위 ULT_MIN_BASE 주석 참고 */
    const useUlt = cornered && !last && base >= ULT_MIN_BASE && r() < ULT_CHANCE;

    let dmg = 0;
    let text = '';
    if (useUlt) {
      /*
        필살기는 **반드시 일반 공격보다 세다.**

        예전엔 빗맞은 필살기(base×0.8~1.4)가 강격(base×1.3~2.3)보다 약했다.
        궁지에 몰린 쪽이 마지막 도박을 걸었는데 평타만도 못한 숫자가 뜨면
        역전의 발판이 아니라 그냥 김 빠지는 연출이다.

        지금은 세 갈래 전부 강격의 상한(base×2.3) 위에서 논다:
          빗나감  — 피해 0. 대신 확률을 15% → 10% 로 낮춰 헛방을 줄였다
          반피격  — base×2.4~3.2 (강격 상한보다 위)
          직격    — base×4.0~6.0 (평타의 대여섯 배. 이게 역전의 발판이다)
      */
      const ult = creatureUlt(attackerIsA ? match.a : match.b);
      const roll = r();
      if (roll < 0.10) {
        text = `${atkName}의 ${ult}! — ${defName}가 몸을 비틀어 완전히 피했다`;
      } else if (roll < 0.35) {
        dmg = Math.round(base * (ULT_MIN_MUL + r() * 0.8));
        text = `${atkName}의 ${ult}! — ${defName}가 팔로 막았지만 밀려났다`;
      } else {
        dmg = Math.round(base * (4.0 + r() * (ULT_MAX_MUL - 4.0)));
        text = `${atkName}의 ${ult}! ${defName}에게 직격 — 판이 뒤집힌다`;
      }
    } else if (act === '방어') {
      text = `${atkName}, 몸을 웅크리고 방어 자세`;
    } else if (act === '스킬') {
      dmg = Math.round(base * (1.3 + r() * (PLAIN_MAX_MUL - 1.3)));
      text = `${atkName}의 강격! ${defName}에게 큰 타격`;
    } else {
      dmg = Math.round(base * (0.6 + r() * 0.8));
      text = `${atkName}가 ${defName}를 가격`;
    }

    /*
      넘어짐 → 추가타.

      ⚠ 추가타까지 더한 값도 **평타 상한을 넘지 않는다.** 안 넘기면 운 좋은 평타가
      막힌 필살기보다 세지고, "필살기가 제일 세다" 가 무너진다.
    */
    if (dmg > 0 && !useUlt && r() < 0.12) {
      const cap = Math.round(base * PLAIN_MAX_MUL);
      const extra = Math.min(Math.round(base * (0.3 + r() * 0.5)), Math.max(0, cap - dmg));
      if (extra > 0) {
        dmg += extra;
        text += ` — ${defName} 넘어졌다! 추가타 ${extra}`;
      }
    }
    if (last) {
      // 마지막 턴은 확실히 눕힌다
      dmg = Math.max(dmg, loserHp);
      text = `${atkName}의 마지막 일격! ${defName} 쓰러졌다`;
    }

    /**
     * 하한 두 개.
     *  · 승자는 winnerFloor 아래로 내려가지 않는다 (먼저 눕는 연출은 안 된다)
     *  · 패자도 **마지막 턴 전까지는 1** 이 하한이다. 필살기가 예산을 넘겨
     *    114턴째에 눕히면 남은 12초가 죽은 화면이 된다.
     */
    const loserFloor = last ? 0 : 1;
    /*
      로그에는 **실제로 깎인 만큼**을 적는다.

      하한에 걸려 HP 가 안 움직였는데 "300 피해" 라고 적히면, 체력바는 그대로인데
      숫자만 큰 화면이 된다. 필살기 배수를 올린 뒤로는 이게 자주 일어난다.
    */
    const before = attackerIsA ? hpB : hpA;
    if (attackerIsA) {
      hpB = aWins ? Math.max(loserFloor, hpB - dmg) : Math.max(winnerFloor, hpB - dmg);
    } else {
      hpA = aWins ? Math.max(winnerFloor, hpA - dmg) : Math.max(loserFloor, hpA - dmg);
    }
    dmg = before - (attackerIsA ? hpB : hpA);

    turns.push({
      text,
      crowd: r() < 0.3 ? CROWD[Math.floor(r() * CROWD.length)] : undefined,
      hpA,
      hpB,
      dmg: dmg || undefined,
      atkA: attackerIsA,
      ult: useUlt || undefined,
    });
  }

  /**
   * 시간 안에 결판이 안 났으면 HP 가 더 많은 쪽이 이긴다 (판정승).
   * 위 루프는 마지막 턴에 패자를 눕히도록 되어 있지만, 상수를 조정하다 어긋나면
   * 승자와 화면의 HP 가 모순되므로 규칙으로 못 박아 둔다.
   */
  let finalWinner = winner;
  if (hpA > 0 && hpB > 0) {
    finalWinner = hpA === hpB ? winner : (hpA > hpB ? match.a : match.b);
    turns.push({
      text: `시간 종료 — 판정승 ${creatureName(finalWinner)} (HP ${Math.max(hpA, hpB)} vs ${Math.min(hpA, hpB)})`,
      crowd: '심판이 손을 들었다',
      hpA,
      hpB,
    });
  }

  turns.push({ text: `승자 — ${creatureName(finalWinner)}`, crowd: '와아아아아!', hpA, hpB });
  return { winner: finalWinner, turns };
}
