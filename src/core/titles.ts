/** 업적 및 칭호 (기획서 §12). 칭호는 1개만 장착 가능. */
import { SLOT_COUNT } from './tiers';

export const TITLE_IDS = [
  // 일반 — 플레이로 얻는다
  'bankrupt_king', 'artisan_path', 'curse13', 'all_in', 'defaulter',
  'gwang38', 'weapon_collector', 'curator', 'tower_conqueror', 'veteran', 'gladiator',
  'rune_smith', 'rune_master', 'set_keeper', 'bernstein_slayer', 'day_trader',
  'coin_believer', 'guild_founder', 'lucky_hand', 'night_owl', 'iron_wallet',
  'gather_king', 'hunter', 'angler', 'polymath', 'abyss_diver', 'alchemist',
  // 희귀 — 선착순. 한 번 나가면 다시 얻을 수 없다
  'first_player', 'first_hundred', 'first_thousand',
  'first_sss', 'first_artisan', 'first_summit',
] as const;
export type TitleId = (typeof TITLE_IDS)[number];

export interface TitleDef {
  id: TitleId;
  name: string;
  cond: string;
  effect: string;
  /** 패널티 칭호 — 자동 장착되며 해제 불가 */
  penalty?: boolean;
  /** 시즌 한정 */
  seasonal?: boolean;
  /**
   * 선착순 칭호 — 전 서버에서 이 인원까지만 받는다.
   * 희귀할수록 화면에서 더 번쩍인다 (rarity).
   */
  limited?: number;
  /**
   * 희소도 0~3. 0 = 일반, 3 = 전설.
   * 이름표가 이 값에 따라 반짝인다 (ui/TitleTag).
   */
  rarity?: 1 | 2 | 3;
  /**
   * 폐지된 칭호 — 지금은 **얻을 수 없다.**
   *
   * 콘텐츠를 없애면서 획득 경로가 사라졌지만, 이미 가진 사람에게서 빼앗지는 않는다.
   * 화면은 이 표시를 보고 "지금은 얻을 수 없습니다" 라고 알린다. 도감·목록에서
   * 아직 못 얻은 사람에게 목표로 내걸면 안 되는 칭호이기도 하다.
   */
  legacy?: boolean;
  /**
   * 가입 순번만으로 결정되는 칭호.
   * limited 만 보고 판정하면 "전 서버 최초 SSS"(limited:1)까지 1번 가입자에게
   * 딸려 나간다 — 자리 수와 획득 조건은 다른 축이다.
   */
  bySignup?: true;
}

export const TITLES: Record<TitleId, TitleDef> = {
  bankrupt_king:    { id: 'bankrupt_king',    name: '파산왕',      cond: '회생 10회',                    effect: '회생 지원금 2배' },
  artisan_path:     { id: 'artisan_path',     name: '장인의 길',   cond: '장인의 무구 첫 제련',           effect: '수리비 10% 할인' },
  curse13:          { id: 'curse13',          name: '13강의 저주', cond: '+13 이상에서 장비 파괴 5회',    effect: '파괴 방어 주문서 5% 할인' },
  all_in:           { id: 'all_in',           name: '올인',        cond: '오락실에서 전 재산 배팅 후 승리', effect: '크리처 러쉬 최대 배팅 한도 2배' },
  /* 은행 폐쇄로 폐지 (2026-08) — 위 day_trader 주석과 같은 이유로 목록에는 남긴다 */
  defaulter:        { id: 'defaulter',        name: '채무불이행자', cond: '은행 시절, 3금융 상환 실패',    effect: '없음 (은행 폐쇄)', penalty: true, legacy: true },
  gwang38:          { id: 'gwang38',          name: '한 방',       cond: '크리처 러쉬에서 10배 이상 배당 적중', effect: '오락실 입장 시 전용 연출', rarity: 1 },
  weapon_collector: { id: 'weapon_collector', name: '무기 수집가', cond: '무기 전 종류 도감 등록',        effect: '강화 확률 +0.1%p' },
  curator:          { id: 'curator',          name: '박물관장',    cond: '도감 100%',                    effect: '상점 구매 1% 할인' },
  tower_conqueror:  { id: 'tower_conqueror',  name: '탑의 정복자', cond: '보스의탑 50층 첫 클리어',       effect: '탑 체력 소모 −2' },
  veteran:          { id: 'veteran',          name: '백전노장',    cond: '투기장 100승',                 effect: '뱃지 충전 9분당 1개' },
  gladiator:        { id: 'gladiator',        name: '검투왕',      cond: '시즌 S 티어 달성',              effect: '투기장 승리 보상 +5% (해당 시즌만)', seasonal: true },

  // ── 추가 일반 칭호 ──
  rune_smith:       { id: 'rune_smith',       name: '룬세공사',    cond: '룬각인 10회',                   effect: '정령석 상점 5% 할인' },
  rune_master:      { id: 'rune_master',      name: '룬의 대가',   cond: 'S급 이상 룬각인 획득',           effect: '룬각인 아이템레벨 +2%', rarity: 1 },
  set_keeper:       { id: 'set_keeper',       name: '세트 수호자', cond: '전 부위를 같은 특성으로',        effect: '세트 시너지 +5%', rarity: 2 },
  bernstein_slayer: { id: 'bernstein_slayer', name: '번스타인 사냥꾼', cond: '보스의탑 50층 10회 클리어',  effect: '번스타인 재료 드랍 +10%p', rarity: 1 },
  /*
    ── 폐지된 칭호 ──────────────────────────────────────

    주식장을 없애면서(2026-08) 이 둘은 **더 얻을 수 없다.** 그래도 목록에서 지우지는
    않는다. 지우면 이미 가진 사람의 저장본에서 `titles` 검증에 걸려 조용히 사라지고,
    장착 중이었다면 칭호 칸이 빈다 — 없앤 건 콘텐츠지 그 사람이 한 일이 아니다.

    효과는 뗐다. 붙일 곳(주식 매도가)이 없어졌기 때문이고, 없는 효과를 남겨 두면
    칭호 칸 하나를 아무 이득 없이 차지한다. 대신 `legacy` 로 표시해 화면이
    "지금은 얻을 수 없는 칭호" 라고 말해 준다.
  */
  day_trader:       { id: 'day_trader',       name: '단타왕',      cond: '주식장 시절, 하루 20회 매매',    effect: '없음 (주식장 폐쇄)', legacy: true },
  coin_believer:    { id: 'coin_believer',    name: '존버',        cond: '주식장 시절, 코인 30일 보유',    effect: '없음 (주식장 폐쇄)', legacy: true },
  guild_founder:    { id: 'guild_founder',    name: '길드장',      cond: '길드 창설',                     effect: '상점 구매 2% 할인' },
  lucky_hand:       { id: 'lucky_hand',       name: '행운의 손',   cond: '쿠지 A상 획득',                 effect: '쿠지 가격 20% 할인', rarity: 1 },
  night_owl:        { id: 'night_owl',        name: '야행성',      cond: '새벽 3~5시에 30회 접속',         effect: '체력 회복 9분당 1' },
  iron_wallet:      { id: 'iron_wallet',      name: '철벽 지갑',   cond: '은행 시절, 무대출 10만 골드',   effect: '없음 (은행 폐쇄)', legacy: true },
  gather_king:      { id: 'gather_king',      name: '채집왕',      cond: '채집 도감 24종 완성',           effect: '채집 체력 소모 0' },
  hunter:           { id: 'hunter',           name: '사냥꾼',      cond: '수렵 도감 12종 완성',           effect: '수렵 판정 +5점' },
  angler:           { id: 'angler',           name: '조사',        cond: '낚시 도감 14종 완성',           effect: '낚시 일일 횟수 +5' },
  polymath:         { id: 'polymath',         name: '만물박사',    cond: '채집류 도감 50종 100%',         effect: '연성액 제작비 −20%', rarity: 2 },
  abyss_diver:      { id: 'abyss_diver',      name: '심연 잠수부', cond: '심연 20층 귀환',                effect: '심연 내구도 소모 −0.5%p/층', rarity: 1 },
  alchemist:        { id: 'alchemist',        name: '연금술사',    cond: '상급 연성액 첫 제작',           effect: '연성액 재부여 시 결정 등급 1칸 상승', rarity: 1 },

  // ── 선착순 칭호 ── 한 번 나가면 다시 얻을 수 없다
  first_player:     { id: 'first_player',     name: '창세기',      cond: '전 서버 1번째 가입자',
    effect: '모든 상점 3% 할인', limited: 1, rarity: 3, bySignup: true },
  first_hundred:    { id: 'first_hundred',    name: '개척자',      cond: '전 서버 100번째 안에 가입',
    effect: '체력 최대치 +2', limited: 100, rarity: 2, bySignup: true },
  /*
    ⚠ id 는 `first_thousand` 지만 자리는 **100명**이다.

    1,000명 → 10명 → 100명으로 두 번 움직였다. 1,000은 너무 헐거워 사실상 전원이
    받았고, 10은 너무 빡빡해서 **베타에 들어온 사람 대부분이 못 받는 칭호**가 됐다 —
    희귀한 게 아니라 없는 것에 가까웠다. 100이면 초기 참여자에게 돌아가면서
    개척자(100)와는 효과로 갈린다.

    id 는 저장본(`titles` 배열)에 이미 박혀 있어 바꾸지 않는다 — 이름을 바꾸면
    갖고 있던 사람들의 칭호가 조용히 사라진다.

    ⚠ `first_hundred`(개척자)와 자리 수가 같아졌다. 둘 다 받는 게 맞다 —
    "100번째 안에 들어온 사람" 이라는 사실 하나에 칭호 둘이 붙는 것이고,
    효과(체력 +2 · 출석 +20%)와 로고 보상이 서로 다르다.
  */
  first_thousand:   { id: 'first_thousand',   name: '초기 정착민', cond: '전 서버 100번째 안에 가입',
    effect: '출석 보상 +20% · 전용 로고', limited: 100, rarity: 2, bySignup: true },
  first_sss:        { id: 'first_sss',        name: '태초를 본 자', cond: '전 서버 최초 SSS 룬각인',
    effect: '룬각인 아이템레벨 +5%', limited: 1, rarity: 3 },
  first_artisan:    { id: 'first_artisan',    name: '둔카락스의 벗', cond: '전 서버 최초 장인의 무구 제련',
    effect: '제련 재료 −5개', limited: 1, rarity: 3 },
  first_summit:     { id: 'first_summit',     name: '첫 등정자',   cond: '전 서버 최초 보스의탑 50층 클리어',
    effect: '탑 보상 +10%', limited: 1, rarity: 3 },
};

/**
 * 칭호와 함께 들어오는 로고.
 *
 * 지금까지 스토어 안에 `if (id === 'first_thousand') grantAvatar('knightgirl')` 로
 * 한 줄 박혀 있었다. 표로 빼는 이유는 두 가지다 — 보상이 늘 때 스토어를 안 고쳐도
 * 되고, **화면이 "무엇이 같이 들어오는지" 를 미리 알 수 있다.**
 * (칭호 획득 팝업이 이 표를 읽어 "로고도 함께 열렸습니다" 를 적는다)
 */
export const TITLE_AVATAR: Partial<Record<TitleId, string>> = {
  first_thousand: 'knightgirl',
};

/** 선착순 칭호만 */
export const LIMITED_TITLES = TITLE_IDS.filter((id) => TITLES[id].limited !== undefined);
/** 그중 가입 순번으로 결정되는 것만 */
export const SIGNUP_TITLES = TITLE_IDS.filter((id) => TITLES[id].bySignup);

/**
 * 희소도 → 반짝임 세기.
 * 0 은 반짝이지 않는다. 전부 반짝이면 아무것도 안 반짝이는 것과 같다.
 */
export const rarityOf = (id: TitleId) => TITLES[id].rarity ?? 0;

export const TITLE_ORDER: TitleId[] = [...TITLE_IDS];

/** 장착 중인 칭호에서 파생되는 실제 수치 효과 */
export interface TitleEffects {
  rehabGrantMul: number;
  repairDiscount: number;
  destroyScrollDiscount: number;
  /** 크리처 러쉬 최대 배팅 한도 배수 */
  rushMaxBetMul: number;
  enhanceBonusPct: number;
  shopDiscount: number;
  towerStaminaCut: number;
  badgeMs: number;
  arenaRewardMul: number;
  gambleIntro: boolean;
  /** 정령석 상점 할인 */
  stoneDiscount: number;
  /** 룬각인 아이템레벨 배수 */
  runeIlvlMul: number;
  /** 세트 시너지 배수 */
  setSynergyMul: number;
  /** 번스타인 재료 추가 드랍 확률 */
  materialDropAdd: number;
  /** 체력 최대치 가산 */
  staminaMaxAdd: number;
  /** 체력 회복 간격 */
  staminaRegenMs: number;
  /** 출석 보상 배수 */
  attendanceMul: number;
  /** 탑 보상 배수 */
  towerRewardMul: number;
  /** 제련 재료 감면 */
  forgeMaterialCut: number;
  /** 주식 매도가 보정 (코인 제외) */
  /** 코인 매도가 보정 */
  /** 쿠지 가격 할인 */
  kujiDiscount: number;
  /** 채집·수렵·낚시 체력 소모 감면 */
  gatherStaminaCut: number;
  /** 수렵 미니게임 점수 가산 */
  huntScoreAdd: number;
  /** 낚시 일일 횟수 가산 */
  fishDailyAdd: number;
  /** 연성액 제작비 할인 */
  potionDiscount: number;
  /** 심연 층당 내구도 소모 감면(%p) */
  abyssDurCut: number;
  /** 연성액 결과 등급을 몇 칸 밀어 올리는가 */
  potionGradeUp: number;
}

export const BASE_EFFECTS: TitleEffects = {
  rehabGrantMul: 1,
  repairDiscount: 0,
  destroyScrollDiscount: 0,
  rushMaxBetMul: 1,
  enhanceBonusPct: 0,
  shopDiscount: 0,
  towerStaminaCut: 0,
  badgeMs: 60 * 60_000,
  arenaRewardMul: 1,
  gambleIntro: false,
  stoneDiscount: 0,
  runeIlvlMul: 1,
  setSynergyMul: 1,
  materialDropAdd: 0,
  staminaMaxAdd: 0,
  staminaRegenMs: 10 * 60_000,
  attendanceMul: 1,
  towerRewardMul: 1,
  forgeMaterialCut: 0,
  kujiDiscount: 0,
  gatherStaminaCut: 0,
  huntScoreAdd: 0,
  fishDailyAdd: 0,
  potionDiscount: 0,
  abyssDurCut: 0,
  potionGradeUp: 0,
};

export function effectsOf(equipped: TitleId | null): TitleEffects {
  const e: TitleEffects = { ...BASE_EFFECTS };
  // 채무불이행자는 패널티 칭호 — 24시간 자동 장착이며 다른 칭호와 별개로 항상 적용
  if (!equipped) return e;
  switch (equipped) {
    case 'bankrupt_king':    e.rehabGrantMul = 2; break;
    case 'artisan_path':     e.repairDiscount = 0.10; break;
    case 'curse13':          e.destroyScrollDiscount = 0.05; break;
    case 'all_in':           e.rushMaxBetMul = 2; break;
    case 'gwang38':          e.gambleIntro = true; break;
    case 'weapon_collector': e.enhanceBonusPct = 0.1; break;
    case 'curator':          e.shopDiscount = 0.01; break;
    case 'tower_conqueror':  e.towerStaminaCut = 2; break;
    case 'veteran':          e.badgeMs = 54 * 60_000; break;
    case 'gladiator':        e.arenaRewardMul = 1.05; break;
    case 'rune_smith':       e.stoneDiscount = 0.05; break;
    case 'rune_master':      e.runeIlvlMul = 1.02; break;
    case 'set_keeper':       e.setSynergyMul = 1.05; break;
    case 'bernstein_slayer': e.materialDropAdd = 0.1; break;
    case 'guild_founder':    e.shopDiscount = 0.02; break;
    case 'night_owl':        e.staminaRegenMs = 9 * 60_000; break;
    case 'lucky_hand':       e.kujiDiscount = 0.20; break;
    case 'first_player':     e.shopDiscount = 0.03; break;
    case 'first_hundred':    e.staminaMaxAdd = 2; break;
    case 'first_thousand':   e.attendanceMul = 1.2; break;
    case 'first_sss':        e.runeIlvlMul = 1.05; break;
    case 'first_artisan':    e.forgeMaterialCut = 5; break;
    case 'gather_king':      e.gatherStaminaCut = 99; break;   // 채집 체력 0
    case 'hunter':           e.huntScoreAdd = 5; break;
    case 'angler':           e.fishDailyAdd = 5; break;
    case 'polymath':         e.potionDiscount = 0.2; break;
    case 'abyss_diver':      e.abyssDurCut = 0.5; break;
    case 'alchemist':        e.potionGradeUp = 1; break;
    case 'first_summit':     e.towerRewardMul = 1.1; break;
  }
  return e;
}

// ── 통계형 업적 (§12 하단) ─────────────────────────────
export interface StatsDef {
  key: keyof StatCounters;
  label: string;
  unit?: 'money' | 'count';
}

export interface StatCounters {
  enhanceAttempts: number;
  enhanceSuccess: number;
  destroyed: number;
  destroyedHigh: number;   // +13 이상에서 파괴
  goldSpentOnEnhance: number;
  gambleBet: number;
  gambleWon: number;
  loanTaken: number;
  loanDefaulted: number;
  rehabCount: number;
  arenaWins: number;
  arenaLosses: number;
  questsDone: number;
  towerBest: number;
  exploreBest: number;
  artisanForged: number;
  partTimeCount: number;
  partTimeEarned: number;
  lotteryBought: number;
  lotteryWon: number;
  attendanceTotal: number;
}

export const INITIAL_STATS: StatCounters = {
  enhanceAttempts: 0, enhanceSuccess: 0, destroyed: 0, destroyedHigh: 0,
  goldSpentOnEnhance: 0, gambleBet: 0, gambleWon: 0,
  loanTaken: 0, loanDefaulted: 0, rehabCount: 0, arenaWins: 0, arenaLosses: 0,
  questsDone: 0, towerBest: 0, exploreBest: 0, artisanForged: 0,
  partTimeCount: 0, partTimeEarned: 0, lotteryBought: 0, lotteryWon: 0,
  attendanceTotal: 0,
};

export const STAT_LIST: StatsDef[] = [
  { key: 'enhanceAttempts', label: '누적 강화 시도' },
  { key: 'enhanceSuccess', label: '누적 강화 성공' },
  { key: 'destroyed', label: '장비 파괴 횟수' },
  { key: 'goldSpentOnEnhance', label: '강화에 갈아넣은 금액', unit: 'money' },
  { key: 'gambleBet', label: '누적 도박 배팅액', unit: 'money' },
  { key: 'gambleWon', label: '누적 도박 수익', unit: 'money' },
  { key: 'loanTaken', label: '누적 대출액', unit: 'money' },
  { key: 'loanDefaulted', label: '대출 상환 실패', unit: 'count' },
  { key: 'rehabCount', label: '회생 횟수' },
  { key: 'arenaWins', label: '투기장 승리' },
  { key: 'arenaLosses', label: '투기장 패배' },
  { key: 'questsDone', label: '퀘스트 성공' },
  { key: 'exploreBest', label: '탐험 최고 챕터' },
  { key: 'towerBest', label: '보스의탑 최고 층' },
  { key: 'partTimeCount', label: '아르바이트 횟수' },
  { key: 'partTimeEarned', label: '아르바이트 총수입', unit: 'money' },
  { key: 'lotteryBought', label: '복권 구매 장수' },
  { key: 'lotteryWon', label: '복권 당첨금', unit: 'money' },
  { key: 'attendanceTotal', label: '누적 출석' },
];

// ── 칭호 획득 판정 ─────────────────────────────────────
//
// 예전에는 각 액션이 자기 자리에서 grantTitle 을 직접 불렀다. 조건이 20개를 넘자
// "이 칭호는 어디서 주더라?" 를 매번 grep 해야 했고, 새 칭호를 추가하면 주는 곳을
// 빼먹기 쉬웠다. 판정을 한 곳에 모아 두면 목록과 지급이 같은 파일에서 갈라지지 않는다.

/** 칭호 판정에 필요한 관측값. 스토어가 채워 넣는다. */
export interface TitleCtx {
  stats: StatCounters;
  /** 지금까지 새긴 룬 최고 등급의 순위 (GRADES 인덱스). 없으면 -1 */
  bestRuneRank: number;
  /** 같은 특성으로 묶인 최대 세트 수 */
  maxSetCount: number;
  /** 현재 소지금 (골드 환산) */
  gold: number;
  guildFounder: boolean;
  /** 새벽 3~5시 접속 횟수 */
  nightVisits: number;
  /** 룬각인 횟수 */
  engraves: number;
  /** 보스의탑 50층 클리어 횟수 */
  tower50: number;
  /** 쿠지 A상 획득 여부 */
  kujiA: boolean;
  /** 전 서버 가입 순번 (0 이면 아직 없음) */
  signupNo: number;
  /** 서버 최초 기록을 이 계정이 가졌는가 */
  serverFirst: (key: 'sss' | 'artisan' | 'summit') => boolean;
}

/** S급 이상 = GRADES 에서 'S' 의 위치 이상 */
const S_RANK = 6;   // ['F','E','D','C','B','A','S',...]
const GRADE_SSS = 8;   // GRADES.indexOf('SSS')

/** 지금 조건을 만족하는 칭호 전부. 이미 가진 것도 그대로 나온다 (스토어가 걸러 낸다). */
export function earnedTitles(c: TitleCtx): TitleId[] {
  const s = c.stats;
  const out: TitleId[] = [];
  const add = (ok: boolean, id: TitleId) => { if (ok) out.push(id); };

  add(s.rehabCount >= 10, 'bankrupt_king');
  add(s.artisanForged >= 1, 'artisan_path');
  add(s.destroyedHigh >= 5, 'curse13');
  add(s.arenaWins >= 100, 'veteran');
  add(s.towerBest >= 50, 'tower_conqueror');

  add(c.engraves >= 10, 'rune_smith');
  add(c.bestRuneRank >= S_RANK, 'rune_master');
  /*
    ⚠ 기준을 **지금 슬롯 수**로 잡는다.

    예전엔 `>= 16` 이었다. 슬롯이 16칸이던 시절의 숫자인데, 좌우를 없애며 13칸이
    되고 다시 10칸이 되는 동안 이 줄만 그대로였다 — 세트는 아무리 맞춰도 슬롯
    수를 못 넘으므로 **달성 자체가 불가능한 칭호**였다. 숫자를 박아 두면 이렇게
    조용히 죽는다.
  */
  add(c.maxSetCount >= SLOT_COUNT, 'set_keeper');
  add(c.tower50 >= 10, 'bernstein_slayer');
  add(c.guildFounder, 'guild_founder');
  add(c.kujiA, 'lucky_hand');
  add(c.nightVisits >= 30, 'night_owl');

  // 선착순 — 가입 순번은 되돌릴 수 없으므로 조건이 아니라 사실이다
  if (c.signupNo > 0) {
    for (const id of SIGNUP_TITLES) {
      if (c.signupNo <= (TITLES[id].limited ?? 0)) out.push(id);
    }
  }
  // 서버 최초 3종은 "업적 달성 + 아직 아무도 안 가져감" 두 조건이 함께여야 한다
  add(c.bestRuneRank >= GRADE_SSS && c.serverFirst('sss'), 'first_sss');
  add(s.artisanForged >= 1 && c.serverFirst('artisan'), 'first_artisan');
  add(s.towerBest >= 50 && c.serverFirst('summit'), 'first_summit');

  return out;
}

/**
 * 서버 최초 기록이 아직 비어 있는지 — 서버가 없으므로 계정 id 로 결정한다.
 * 매번 다시 굴리면 껐다 켤 때마다 결과가 바뀌므로 반드시 시드 고정이어야 한다.
 */
export const SERVER_FIRST_ODDS = 0.02;

/** 가입 순번도 같은 이유로 계정 id 에서 한 번 뽑아 고정한다. */
export const SERVER_POPULATION = 3000;
