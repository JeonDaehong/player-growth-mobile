/** 판매가 / 수리비 / 대출 (기획서 §3-3, §7-7, §7-8, §10) */
import { Item } from './types';
import { TIERS, baseItemLevel, itemLevel } from './tiers';
import { g } from './currency';

/** 판매가 (§3-3). 투자액의 35~45% 수준으로 설계됨. */
export function sellPrice(item: Item): number {
  const t = TIERS[item.tier];
  const full = t.sellBase + t.sellPerLevel * item.level;
  // 내구도가 닳은 장비는 그만큼 값이 떨어진다 (50% 미만부터 최대 -25%)
  const durMul = item.dur >= 50 ? 1 : 1 - ((50 - item.dur) / 100) * 0.5;
  return Math.max(1, Math.floor(full * durMul));
}

/**
 * 수리 비용 = 아이템레벨 × 내구 1%p 당 단가.
 *
 * 기획서 §10 은 "판매가의 1% × 회복 %p" 인데, 판매가는 티어마다 2.4배씩
 * 뛰는 반면 벌이(퀘스트 보상·탐험 보상)는 아이템레벨에 비례해 훨씬 천천히 오른다.
 * 그래서 실측하면 전량 수리비가 같은 기간 수익의 **5티어 43배 · 10티어 1,090배**가
 * 되어 중반부터 수리 자체가 불가능했다.
 *
 * 벌이와 같은 축(아이템레벨)에 비례시키면 비율이 전 구간에서 일정해진다.
 * 지금 값은 "전량 40%p 수리 = 같은 기간 퀘스트 수익의 약 12%".
 */
/**
 * 아이템레벨 1당 내구도 1%p 수리비.
 *
 * 마일스톤(ENHANCE_MILESTONE_DESIGN)이 +15 아이템레벨을 약 21% 올렸는데 벌이는
 * 그대로라, 실질을 유지하려고 0.035 → 0.029 로 낮췄다.
 */
export const REPAIR_PER_ILVL = 0.029;

export function repairCost(item: Item, toDur = 100): number {
  const pts = Math.max(0, Math.min(100, toDur) - item.dur);
  if (pts <= 0) return 0;
  // 수리비는 "닳지 않았을 때의 값" 기준 — 닳을수록 싸지면 방치가 이득이 되어버린다
  // ⚠ **연성액 배수를 뺀** 원본 아이템레벨을 쓴다. 연성액은 장비를 세게 만들 뿐
  //    비싸게 만들면 안 된다 (배수를 그대로 쓰면 수리비가 최대 2배가 된다).
  return Math.max(1, Math.round(baseItemLevel({ ...item, dur: 100 }) * REPAIR_PER_ILVL * pts));
}

/** 전투 1회당 착용 장비 내구도 −1~2% (§10) */
export function wearDurability(item: Item, r: () => number = Math.random): Item {
  const loss = r() < 0.5 ? 1 : 2;
  return { ...item, dur: Math.max(0, item.dur - loss) };
}

// ── 상점 (§8-1) ────────────────────────────────────────
/** 최하급(티어 1) 장비: 부위당 1골드 */
export const SHOP_T1_PRICE = 1;

// ── 선술집 (§8-2) ──────────────────────────────────────
export interface TavernMenu {
  id: string;
  name: string;
  price: number;
  heal: number;
  /** 값이 0 (무료) */
  dailyFree?: boolean;
  /** 하루에 먹을 수 있는 개수. 체력을 돈으로 무한히 사면 체력 자체가 의미를 잃는다. */
  dailyLimit: number;
  /** 한도를 넘겨 눌렀을 때 어떤 투로 거절할지 */
  refuse: RefuseKind;
  /** 아트 키 (assets/sprites/food) */
  art: string;
  /** 아트가 오기 전 대체용 코드 스프라이트 키 (src/ui/sprites ICONS) */
  glyph: string;
}

export type RefuseKind = 'water' | 'food' | 'booze';

/**
 * ⚠ **테스트 기간 한정** — 독한 술을 한도 없이 판다.
 *
 * 평소에는 하루 한 잔이다. 체력을 돈으로 무한히 사면 체력이라는 자원 자체가
 * 의미를 잃기 때문이다 (100골드에 체력 100 = 사실상 무한 사냥).
 *
 * 지금 푸는 이유는 밸런스가 아니라 **시험**이다. 체력 때문에 콘텐츠 하나를
 * 돌아보는 데 며칠이 걸리면 피드백을 받을 수가 없다.
 *
 * 베타가 끝나면 `false` 로 되돌린다. 이 상수 하나만 바꾸면 된다 —
 * 한도 로직을 따로 손대지 않았다.
 */
export const UNLIMITED_BOOZE = true;

export const TAVERN_MENU: TavernMenu[] = [
  { id: 'water', name: '맹물',      price: 0,   heal: 10,  dailyFree: true, dailyLimit: 1, refuse: 'water', art: 'water', glyph: 'cup' },
  { id: 'bread', name: '보리빵',    price: 5,   heal: 20,  dailyLimit: 5, refuse: 'food', art: 'bread', glyph: 'bread' },
  { id: 'stew',  name: '고기 스튜', price: 30,  heal: 50,  dailyLimit: 3, refuse: 'food', art: 'stew', glyph: 'bowl' },
  { id: 'booze', name: '독한 술',   price: 100, heal: 100, dailyLimit: UNLIMITED_BOOZE ? Infinity : 1, refuse: 'booze', art: 'booze', glyph: 'bottle' },
];

/**
 * 한도 초과 거절 대사.
 *
 * "하루 5개까지입니다" 같은 시스템 문구보다 캐릭터가 투덜대는 편이 낫다 —
 * 같은 벽에 여러 번 부딪히게 되는 자리라 매번 같은 말이면 금방 지겹다.
 */
export const REFUSALS: Record<RefuseKind, string[]> = {
  water: ['오늘 더 이상 받을 수 있는 공짜 물은 없다.'],
  food: [
    '배불러서 더 먹으면 토할 거 같아.',
    '한 입만 더 넣으면 진짜 터진다.',
    '배가 꽉 찼다. 숨 쉬는 것도 버겁다.',
    '더는 안 들어간다. 위가 항의하는 중이다.',
    '그릇을 봐도 이제 군침이 안 돈다.',
    '배를 두드려 보니 북소리가 난다.',
    '이 이상은 음식이 아니라 형벌이다.',
    '허리띠를 풀어야 할 판이다. 오늘은 여기까지.',
    '냄새만 맡아도 배가 부르다.',
    '눈은 먹고 싶은데 배가 거부한다.',
  ],
  booze: [
    '어우, 더 마시면 취할 거 같아.',
    '벌써 술기운이 도는데 여기서 멈추자.',
    '한 잔 더 하면 집을 못 찾아간다.',
    '혀가 꼬이기 시작했다. 오늘은 그만.',
    '천장이 돌기 시작했다. 잔을 내려놓자.',
  ],
};

/** 거절 대사 한 줄 (랜덤). r 을 넘기면 결정적으로 테스트할 수 있다. */
export function tavernRefusal(m: TavernMenu, r: () => number = Math.random): string {
  const pool = REFUSALS[m.refuse];
  return pool[Math.min(pool.length - 1, Math.floor(r() * pool.length))];
}

/** 오늘 남은 개수. 한도가 없으면 `Infinity` — 화면은 그때 "무제한" 이라고 쓴다 */
export function tavernLeft(m: TavernMenu, used: Record<string, number>): number {
  if (!Number.isFinite(m.dailyLimit)) return Infinity;
  return Math.max(0, m.dailyLimit - (used[m.id] ?? 0));
}

/** 한도 표기 — 무한대를 그대로 찍으면 "Infinity개" 가 된다 */
export const tavernLimitText = (m: TavernMenu, used: Record<string, number>): string =>
  Number.isFinite(m.dailyLimit) ? `오늘 ${tavernLeft(m, used)}/${m.dailyLimit}개` : '무제한';

export { g };

/**
 * 한 판에 걸 수 있는 소지금 비율 — **10%**.
 *
 * 이 게임에서 도박은 돈을 잃으라고 있는 자리인데, 상한이 없으면 **전 재산을
 * 한 판에 거는 것**이 가능하다. 그리고 그건 반드시 일어난다 — 몇 시간 모은 돈이
 * 한 번에 사라지고, 그 자리에서 게임을 끈다.
 *
 * 10% 면 열 번을 내리 져야 반이 남는다. 크게 걸어 크게 먹는 재미는 그대로 두면서
 * "한 판에 끝장나는" 경우만 막는다. 주식·코인 매수도 같은 상한을 쓴다 —
 * 시세가 반토막 나는 종목이 있는 이상 그것도 한 판 배팅이다.
 */
export const BET_CAP_RATIO = 0.1;

/**
 * 지금 소지금으로 한 번에 걸 수 있는 최대 금액.
 *
 * `floor` 는 최소 배팅이다 — 상한이 최소 배팅보다 낮으면 아예 못 걸게 되는데,
 * 그러면 돈이 적은 사람은 도박장에 들어갈 수조차 없다. 최소 배팅만큼은 열어 준다
 * (그 돈이 없으면 어차피 화면이 막는다).
 */
export const betCap = (money: number, floor = 0): number =>
  Math.max(floor, Math.floor(Math.max(0, money) * BET_CAP_RATIO));
