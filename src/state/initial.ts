/**
 * 새 게임 초기 상태.
 *
 * store.ts 에서 분리한 이유: 마이그레이션(migrate.ts)이 기본값을 알아야 하는데,
 * store.ts 를 import 하면 AsyncStorage·AppState 까지 끌려와 순수 테스트가 불가능해진다.
 * 여기는 core 만 import 한다.
 */
import type { GameState } from './store';
import { SLOT_ACCEPTS, SLOT_IDS, ScrollId } from '@/core/types';
import { MATERIAL_IDS } from '@/core/artisans';
import { Equipped, newItem } from '@/core/tiers';
import { MAX_STAMINA, ARENA_MAX_BADGE } from '@/core/combat';
import { initCreatures, slotOf as rushSlotOf, weekKeyOf } from '@/core/rush';
import { entryKey } from '@/core/collection';
import { INITIAL_STATS } from '@/core/titles';
import { s } from '@/core/currency';
import { COUPON_RESET_SEQ } from '@/core/coupons';
import { DEFAULT_AVATAR, DEFAULT_AVATARS } from '@/core/avatars';
import { STARTING_CHARS, newChar } from '@/core/chars';
import { newBattle } from '@/core/autoBattle';


/**
 * 시작 장비 — 16슬롯 전부 1티어로 채워 착용까지 해 둔다.
 *
 * 빈 칸으로 시작하면 아이템레벨이 10 (검 한 자루)에서 멈춰 있고, 강화해도 숫자가
 * 거의 안 움직여 성장 실감이 없다. 최하위 장비라 값은 1쿠퍼 수준이므로
 * 경제에 주는 영향은 없고, 대신 첫 화면부터 16칸이 다 채워져 보인다.
 * (회생 지원은 별개로 낡은 검 한 자루만 준다 — store.rehab)
 */
export function starterEquip(): Equipped {
  const eq: Equipped = {};
  for (const slot of SLOT_IDS) {
    // 무기 슬롯은 11종을 다 받으므로 검으로 고정, 나머지는 그 칸의 부위
    const kind = slot === 'weapon' ? 'sword' : SLOT_ACCEPTS[slot][0];
    eq[slot] = newItem(kind, 1, 0, 100);
  }
  return eq;
}

/**
 * 시작 도감 — 시작 장비에서 그대로 유도한다.
 *
 * 예전엔 `[entryKey('sword', 1)]` 로 박아 뒀는데, starterEquip() 이 16슬롯을 채우도록
 * 바뀐 뒤로도 그대로여서 **손에 든 11부위 중 검 하나만 도감에 올라갔다.**
 * 목록을 손으로 유지하면 또 어긋나므로 장비에서 뽑는다.
 */
export function starterCollection(eq: Equipped): string[] {
  const out = new Set<string>();
  for (const slot of SLOT_IDS) {
    const it = eq[slot];
    if (it) out.add(entryKey(it.kind, it.tier));
  }
  return [...out];
}

export function emptyScrolls(): Record<ScrollId, number> {
  return {
    succ_low: 0, succ_mid: 0, succ_high: 0,
    guard_down: 0, guard_destroy50: 0, guard_destroy100: 0,
    guarantee: 0,
  };
}

/** 번스타인 재료 3종. 예전엔 부위별 21종이었다 (artisans.materialFor 참고) */
export function emptyMaterials(): Record<string, number> {
  const m: Record<string, number> = {};
  for (const k of MATERIAL_IDS) m[k] = 0;
  return m;
}

/**
 * 주식장 폐쇄 정산 세대.
 *
 * 저장본의 `marketClosed` 가 이보다 작으면 마이그레이션이 **한 번** 청산한다
 * (state/migrate.ts 의 `marketPayout`). 새 계정은 청산할 것이 없으므로 이 값에서
 * 시작한다. 초기값과 마이그레이션이 같은 숫자를 봐야 하므로 여기 하나만 둔다.
 */
export const MARKET_CLOSE_SEQ = 1;

/**
 * 은행 폐쇄 정산 세대.
 *
 * 저장본의 `bankClosed` 가 이보다 작으면 마이그레이션이 **한 번** 담보를 돌려준다
 * (state/migrate.ts 의 `loanCollateral`). 새 계정은 돌려줄 것이 없으므로 이 값에서
 * 시작한다. 세대를 안 보면 켤 때마다 담보가 창고에 하나씩 복제된다.
 */
export const BANK_CLOSE_SEQ = 1;

export const initial = (): GameState => {
  const now = Date.now();
  const eq = starterEquip();
  return {
    /*
      시작 캐릭터를 **바로 준다.**

      예전에는 넷 중 하나를 고르는 화면을 앞에 세웠다. 지금은 만들어 둔 사람이
      하나뿐이라 고를 것이 없어서 그냥 준다 — 선택지가 하나인 선택 화면은
      장식이고, 처음 켠 사람에게 누를 필요 없는 버튼을 하나 더 보여 줄 뿐이다.
      사람이 늘면 그때 고르는 화면을 되살린다.
    */
    chars: Object.fromEntries(STARTING_CHARS.map((id) => [id, newChar(id)])),
    /* 준 순서 그대로 앞에서부터 세운다. 남는 칸은 비워 둔다 */
    party: [
      STARTING_CHARS[0] ?? null,
      STARTING_CHARS[1] ?? null,
      STARTING_CHARS[2] ?? null,
      STARTING_CHARS[3] ?? null,
    ],
    battle: newBattle(),
    /* 아무도 안 건드린 상태 — 읽을 때 기본값으로 떨어진다 (`cleanseOptOf`) */
    skillOpts: {},

    // 시작 장비를 16슬롯 다 채우면 아이템레벨이 10 → 160 으로 뛴다.
    // 퀘스트 보증금은 아이템레벨에 비례하므로(§7-3) 소지금 50쿠퍼로는 가장 쉬운
    // 퀘스트조차 못 받는다. 예전 비율(소지금 ≈ 쉬움 보증금 ×5)을 그대로 맞춘다.
    money: s(8),
    /* 다이아는 0 부터. 파는 곳이 아직 없으므로 미션과 게이지에서만 들어온다 */
    dia: 0,
    /* 처음 켜는 사람의 게이지는 **빈 채로** 시작한다 — 켜자마자 가득이면 게이지가 아니다 */
    idleAt: now,
    idleInstant: { dayKey: '', used: 0 },
    /* 새 저장본은 비운 시간이 없다 */
    awayMs: 0,
    equipped: eq,
    inventory: [],
    scrolls: emptyScrolls(),
    stamina: MAX_STAMINA,
    staminaAt: now,
    materials: emptyMaterials(),
    arena: {
      points: 0, badges: ARENA_MAX_BADGE, badgeAt: now, seasonStartedAt: now, seasonBestTier: 'F',
      log: [], seenAt: now, rerollAt: 0, rerolls: 0,
    },
    exploreCleared: 0,
    towerCleared: 0,
    dailyBonus: {},
    questBoard: { slot: -1, list: [] },
    questsDone: [],
    /*
      주식장은 없앴다. 새 계정은 폐쇄 정산을 이미 마친 것으로 시작한다 —
      들고 있던 게 없으니 돌려줄 것도 없고, 세대를 올려 두어야 마이그레이션이
      이 계정을 "아직 정산 안 한 옛 저장본" 으로 잘못 보지 않는다.
    */
    marketClosed: MARKET_CLOSE_SEQ,
    bankClosed: BANK_CLOSE_SEQ,
    bankReturned: 0,
    marketPayout: null,
    creatures: initCreatures(),
    rushH2H: {},
    rushWeek: weekKeyOf(now),
    rushBet: null,
    rushSettled: [],
    attendance: { lastDay: '', streak: 0, total: 0 },
    eventPopupHideUntil: 0,
    tutorialSeen: [],
    tutorialOff: false,
    guidesSeen: [],
    titleQueue: [],
    sfxOn: true,
    bgmOn: true,
    sfxVol: 1,
    bgmVol: 1,
    coupons: [],
    arenaScale: 1,
    dust: 0,
    couponSeq: COUPON_RESET_SEQ,
    tavern: { dayKey: '', used: {} },
    guildApplyReason: '',
    guildJoinedAt: 0,
    stones: { low: 0, mid: 0, high: 0 },
    account: null,
    signedUp: false,
    cashItems: { nick_ticket: 0 },
    nicknameChangedAt: 0,
    rushResult: null,
    lotteryResult: null,
    rushLog: [],
    // 지금 회차를 1회차로 삼는다 (slot 은 1970 기준이라 그대로 쓰면 35,000회차가 된다)
    rushEpoch: rushSlotOf(now),
    /*
      뽑기 소비 기록 — 종류마다 따로. 없는 키는 스토어가 빈 값으로 본다
      (쿠지 종류가 늘어도 여기를 고칠 필요가 없다).
    */
    draws: {
      gacha: { dayKey: '', today: 0, cycleKey: '', inCycle: 0 },
    },
    lottery: { tickets: [], results: [], serial: 0 },
    collection: starterCollection(eq),
    collectionClaimed: { claimedKinds: [], claimedAllWeapons: false, claimedFullBook: false, claimedArtisanSet: false },
    // ── 채집 · 수렵 · 낚시 ──
    // 도구는 첫 방문 때 F급을 무료로 준다 (도구가 없으면 활동 자체를 못 한다)
    gatherTools: { gather: 'F', hunt: 'F', fish: 'F' },
    gatherOwned: { gather: ['F'], hunt: ['F'], fish: ['F'] },
    gatherBag: {},
    gatherDex: [],
    gatherDexClaimed: [],
    gatherDaily: { dayKey: '', used: { gather: 0, hunt: 0, fish: 0 } },

    // ── 심연 · 연금술 ──
    abyssMats: { ash: 0, shard: 0, core: 0 },
    abyssRun: null,
    abyssBest: 0,
    potions: { low: 0, mid: 0, high: 0 },
    bestMul: 0,

    // ── 오락실 ──
    mines: null,

    // ── 길드 콘텐츠 ──
    guildPoints: 0,
    guildSkills: {},
    guildQuest: { weekKey: '', mine: { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 } },
    missions: {
      dayKey: '', weekKey: '',
      day: { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 },
      week: { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 },
      claimedDay: [], claimedWeek: [],
    },
    raids: {
      daily:  { periodKey: '', damage: 0, tries: 0, dayKey: '', today: 0, claimed: false },
      weekly: { periodKey: '', damage: 0, tries: 0, dayKey: '', today: 0, claimed: false },
    },
    guildExp: 0,
    guildCheck: { dayKey: '', total: 0 },
    raidLog: [],
    raidSettled: { daily: '', weekly: '' },
    guildBoss: { weekKey: '', damage: 0, tries: 0, dayKey: '', today: 0, claimed: false },
    dividendDay: '',

    titles: [],
    equippedTitle: null,
    titleTrack: {
      engraves: 0, bestRuneRank: -1, tower50: 0, kujiA: false,
      nightVisits: 0, nightDayKey: '', tradesDayKey: '', tradesToday: 0, signupNo: 0,
    },
    stats: { ...INITIAL_STATS },
    history: [],
    toasts: [],
    lastSeenAt: now,
    bootedAt: now,
    nickname: '나',
    avatar: DEFAULT_AVATAR,
    // 기본 12종은 처음부터 열려 있다. 특별 로고만 여기 쌓인다
    ownedAvatars: [...DEFAULT_AVATARS],
    refills: { dayKey: '', stamina: 0, ticket: 0 },
    guildId: null,
  };
};
