/**
 * 투기장 — 상대 고르기 · 재검색 값 · 전적.
 *
 * 판정(승률·점수)은 `combat.ts` 에 있다. 여기 있는 것은 **누구와 붙을지 고르는
 * 규칙**과 그 주변이다. 나눠 둔 이유는 combat.ts 가 이미 탐험·탑·퀘스트까지
 * 안고 있어서, 투기장 매칭까지 들어가면 무엇이 어디 있는지 아무도 못 찾는다.
 */
import { ArenaTier, ARENA_TIERS } from './types';
import { AvatarId } from './avatars';
import { g, s } from './currency';
import type { Ghost } from './combat';

// ── 상대 고르기 ────────────────────────────────────────

/**
 * 한 번에 보여 줄 상대 수.
 *
 * 하나만 보여 주고 "다른 상대" 를 누르게 했더니, 마음에 드는 상대가 나올 때까지
 * 버튼만 두들기는 화면이 됐다. 다섯을 늘어놓으면 **고르는 화면**이 된다 —
 * 승률과 내구도를 나란히 놓고 비교할 수 있고, 그게 투기장에서 할 일이다.
 */
export const ARENA_FOE_SLOTS = 5;

/**
 * 재검색을 다시 공짜로 만들어 주는 주기.
 *
 * 10분이면 티켓 한 장이 차는 시간(1시간)의 6분의 1이다. 티켓을 다 쓰고 나가
 * 있는 사람에게는 어차피 의미가 없고, 지금 붙고 있는 사람에게는
 * "한 번은 그냥 다시 뽑아도 된다" 가 된다.
 */
export const REROLL_FREE_MS = 10 * 60_000;

/**
 * 공짜를 쓴 뒤의 값 사다리.
 *
 * 1실버 → 10실버 → 1골드 → 10골드 → 그 뒤로는 계속 10골드.
 * 열 배씩 뛰는 건 **연타를 막으려는 것**이지 돈을 벌려는 게 아니다. 두세 번까지는
 * 부담 없이 다시 뽑고, 그 뒤로는 지금 목록에서 고르는 게 낫다는 판단이 서야 한다.
 * 무한히 올리지 않고 10골드에서 멈추는 건, 상한이 없으면 부자가 아니라
 * **오래 앉아 있는 사람**이 벌을 받기 때문이다.
 */
export const REROLL_PRICES: readonly number[] = [s(1), s(10), g(1), g(10)];

/** 이번 재검색의 값. 0 이면 공짜 */
export function rerollCost(now: number, lastFreeAt: number, paid: number): number {
  if (now - lastFreeAt >= REROLL_FREE_MS) return 0;
  const i = Math.max(0, Math.min(REROLL_PRICES.length - 1, Math.floor(paid)));
  return REROLL_PRICES[i];
}

/** 다음 공짜까지 남은 ms. 0 이면 지금 공짜 */
export const rerollFreeIn = (now: number, lastFreeAt: number) =>
  Math.max(0, lastFreeAt + REROLL_FREE_MS - now);

/**
 * 상대 다섯을 고른다.
 *
 * ## 순서
 *
 * 1. **같은 티어부터.** 투기장은 티어 사다리라, 붙어서 의미가 있는 건 같은 칸에
 *    있는 사람이다. 여기서 다섯이 채워지면 거기서 끝난다.
 * 2. 모자라면 **가까운 티어**로 넓힌다 (한 칸 위아래 → 두 칸 → …).
 * 3. 그래도 모자라면 **아이템레벨이 가까운 순**으로 채운다. 베타처럼 사람이 열
 *    명뿐인 서버에서는 여기까지 내려온다 — 그때는 티어를 맞출 수가 없다.
 *
 * ## 재검색에서 한 명은 남긴다
 *
 * `keep` 에 지난 목록을 넘기면 그중 하나를 그대로 둔다. 다섯이 통째로 갈리면
 * "아까 그 사람 괜찮았는데" 를 되찾을 방법이 없다 — 되돌리기 버튼을 따로 만드는
 * 대신 한 자리를 남긴다. 사람이 부족해 어차피 겹칠 수밖에 없으면 이 규칙은
 * 저절로 무의미해진다.
 *
 * @param pool    후보 전부 (서버에서 받아 온 프로필들)
 * @param myTier  내 티어
 * @param myIlvl  내 실효 아이템레벨
 * @param tierOf  상대의 티어를 구하는 함수 (combat.arenaTierOf 를 넘긴다)
 * @param keep    직전 목록. 이 중 하나를 남긴다
 * @param roll    0~1 난수 생성기 (테스트에서 고정해 넣는다)
 */
export function pickFoes(
  pool: Ghost[],
  myTier: ArenaTier,
  myIlvl: number,
  tierOf: (points: number) => ArenaTier,
  keep: Ghost[] = [],
  roll: () => number = Math.random,
): Ghost[] {
  if (pool.length <= ARENA_FOE_SLOTS) return [...pool];

  const myIdx = ARENA_TIERS.indexOf(myTier);
  const out: Ghost[] = [];
  const used = new Set<string>();

  /* 1) 지난 목록에서 한 명 — 남아 있는 후보 중에서만 고른다 */
  const alive = keep.filter((k) => pool.some((p) => p.id === k.id));
  if (alive.length) {
    const k = alive[Math.floor(roll() * alive.length) % alive.length];
    out.push(k);
    used.add(k.id);
  }

  /*
    지난 목록의 나머지는 **후보에서 뺀다.**

    "한 명은 겹치고 넷은 갈린다" 가 규칙인데, 그냥 다시 뽑으면 방금 본 다섯 중
    셋이 또 나오는 일이 흔하다 (같은 티어에 사람이 여덟이면 확률이 꽤 높다).
    다만 뺐더니 다섯이 안 차면 도로 넣는다 — 사람이 부족한 서버에서는 겹치는 걸
    피할 방법이 없고, 그때는 빈칸보다 겹치는 편이 낫다.
  */
  const stale = new Set(keep.map((k) => k.id).filter((id) => !used.has(id)));
  const enough = pool.filter((p) => !used.has(p.id) && !stale.has(p.id)).length
    >= ARENA_FOE_SLOTS - out.length;

  /** 티어 거리별로 담아 둔다 — 0 이 같은 티어 */
  const byDistance = new Map<number, Ghost[]>();
  for (const p of pool) {
    if (used.has(p.id)) continue;
    if (enough && stale.has(p.id)) continue;
    const d = Math.abs(ARENA_TIERS.indexOf(tierOf(p.points ?? 0)) - myIdx);
    const list = byDistance.get(d) ?? [];
    list.push(p);
    byDistance.set(d, list);
  }

  /* 2) 가까운 티어부터 — 같은 거리 안에서는 섞어서 (늘 같은 얼굴이 나오면 안 된다) */
  const distances = [...byDistance.keys()].sort((a, b) => a - b);
  for (const d of distances) {
    if (out.length >= ARENA_FOE_SLOTS) break;
    const bucket = shuffle(byDistance.get(d)!, roll);
    for (const p of bucket) {
      if (out.length >= ARENA_FOE_SLOTS) break;
      out.push(p);
      used.add(p.id);
    }
  }

  /* 3) 그래도 모자라면 아이템레벨이 가까운 순 */
  if (out.length < ARENA_FOE_SLOTS) {
    const rest = pool
      .filter((p) => !used.has(p.id))
      .sort((a, b) => Math.abs(a.curIlvl - myIlvl) - Math.abs(b.curIlvl - myIlvl));
    for (const p of rest) {
      if (out.length >= ARENA_FOE_SLOTS) break;
      out.push(p);
      used.add(p.id);
    }
  }

  return out.slice(0, ARENA_FOE_SLOTS);
}

function shuffle<T>(list: T[], roll: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(roll() * (i + 1)) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 전적 ───────────────────────────────────────────────

/**
 * 전적 한 줄.
 *
 * 내가 건 싸움과 **당한 싸움**이 같은 목록에 섞인다. 갈라 놓으면 "오늘 나한테
 * 무슨 일이 있었나" 를 두 번 봐야 하고, 사실 그건 한 가지 질문이다.
 */
export interface ArenaRecord {
  id: string;
  at: number;
  /** 내가 걸었는가. false 면 당한 것 */
  attack: boolean;
  foeNick: string;
  foeAvatar: AvatarId;
  /** 내가 이겼는가 */
  win: boolean;
  /** 이 판의 점수 변화 (부호 포함) */
  delta: number;
  /** 판이 끝난 뒤의 티어 */
  tier: ArenaTier;
  /** 이 판으로 티어가 움직였는가 */
  move?: 'up' | 'down';
}

/** 전적은 열 줄까지만 — 그 아래는 아무도 안 내려본다 */
export const ARENA_LOG_MAX = 10;

/** 새 줄을 맨 앞에 넣고 상한을 지킨다 */
export const pushRecord = (log: ArenaRecord[], rec: ArenaRecord): ArenaRecord[] =>
  [rec, ...log].slice(0, ARENA_LOG_MAX);

/** 목록 요약 — 전적 탭 머리에 쓴다 */
export function recordSummary(log: readonly ArenaRecord[]) {
  const wins = log.filter((r) => r.win).length;
  const attacked = log.filter((r) => !r.attack).length;
  const delta = log.reduce((a, r) => a + r.delta, 0);
  return { wins, losses: log.length - wins, attacked, delta };
}

/**
 * 미접속 중 당한 싸움 묶음 — 들어올 때 한 번 알려 준다.
 *
 * 개별 줄을 열 개 띄우면 팝업이 아니라 목록이 된다. **몇 번 당했고 점수가 어떻게
 * 됐는지**만 말하고, 자세한 건 전적 탭이 이미 들고 있다.
 */
export interface OfflineDigest {
  count: number;
  wins: number;
  losses: number;
  delta: number;
  from: ArenaTier;
  to: ArenaTier;
}
