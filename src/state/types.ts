/**
 * 게임 상태의 **모양**.
 *
 * 예전에는 이 500줄이 `store.ts` 맨 앞에 있었다. 그래서 "저장되는 값이 뭐가
 * 있더라" 를 보려면 3,600줄짜리 파일을 열어야 했고, 액션 하나를 고치러 들어간
 * 사람이 매번 그 앞을 스크롤로 지나야 했다.
 *
 * 여기에는 **타입만** 둔다 — 실행되는 코드가 없으므로 누가 먼저 불러도 안전하고
 * (순환 import 사고가 원천적으로 안 난다), 저장본에 뭐가 들어가는지를 한 화면에서 읽는다.
 *
 * ⚠ 여기에 필드를 더하면 반드시 두 곳을 같이 고친다.
 *   · `state/initial.ts` — 새 계정의 기본값
 *   · `state/migrate.ts` — 옛 저장본에 그 필드가 없을 때 채울 값
 * 둘 중 하나라도 빠지면 옛 저장본으로 들어온 사람에게 `undefined` 가 새어 나간다
 * (종목을 5→8 로 늘렸을 때 실제로 흰 화면이 났다).
 */

import type {
  Creature,
  Item,
  PartKind,
  Quest,
  RushBet,
  ScrollId,
  SlotId,
} from '@/core/types';
import type { Equipped } from '@/core/tiers';
import type { EnhanceOutcome, tryEnhance } from '@/core/enhance';
import type { Ghost, StaminaKind } from '@/core/combat';
import type { ArenaRecord, OfflineDigest } from '@/core/arena';
import type { H2H } from '@/core/rush';
import type { CollectionRewardState } from '@/core/collection';
import type { StatCounters, TitleId } from '@/core/titles';
import type { Activity, GatherBag, Grade } from '@/core/gathering';
import type { AbyssRun } from '@/core/abyss';
import type { Potion, PotionTier } from '@/core/alchemy';
import type { MinesGame, open as openMine } from '@/core/mines';
import type { GqKey } from '@/core/guildQuest';
import type { MissionScope } from '@/core/missions';
import type { GuildSkillId, SkillLevels } from '@/core/guildSkill';
import type { RaidId, RaidSettleEntry } from '@/core/guildRaid';
import type { dayKey as eventDayKey } from '@/core/events';
import type { CouponResult } from '@/core/coupons';
import type { WorkResult } from '@/core/parttime';
import type { LotteryResult, Ticket } from '@/core/lottery';
import type { BoxId, DrawResult } from '@/core/draw';
import type { DefenseRow } from './net';
import type { MaterialId } from '@/core/artisans';
import type { StoneTier } from '@/core/spiritPreview';
import type { CashItemId, NicknameError } from '@/core/cash';
import type { AutoStop } from '@/core/autoEnhance';
import type { RefillKind } from '@/core/refill';
import type { Spirit } from '@/core/spirit';
import type { AvatarId } from '@/core/avatars';
import type { CharId, OwnedChar } from '@/core/chars';
import type { FormationId, Party } from '@/core/party';
import type { BattleState } from '@/core/autoBattle';

/** 지난 회차 결과 한 줄. 정산할 때 확정되어 기록된다. */
export interface RushLogEntry {
  slot: number;
  a: string;
  b: string;
  winner: string;
}

export interface RushResult {
  slot: number;
  /** 내가 건 크리처 */
  on: string;
  winner: string;
  amount: number;
  /** 적중 시 받은 금액 (낙첨이면 0) */
  payout: number;
  special: boolean;
}

export interface EnhanceLog {
  at: number;
  name: string;
  from: number;
  to: number;
  outcome: EnhanceOutcome;
  cost: number;
  scroll: ScrollId | null;
  guarded: boolean;
  /** 강화 당시 티어 — 확률이 티어에 따라 다르므로 통계에 필요하다 */
  tier: number;
}

export interface Toast {
  id: number;
  text: string;
  tone: 'good' | 'bad' | 'plain';
}

export interface ArenaState {
  points: number;
  badges: number;
  badgeAt: number;
  seasonStartedAt: number;
  seasonBestTier: string;
  /** 최근 전적 (최신순, 최대 10). 내가 건 판과 당한 판이 섞인다 */
  log: ArenaRecord[];
  /**
   * 여기까지의 피격 기록은 이미 반영했다.
   *
   * 남이 나를 지목한 판은 **그 사람 화면에서** 일어난다. 서버는 그 결과만 적어 두고,
   * 내 점수는 내가 다음에 들어올 때 이 시각 이후의 줄을 읽어 반영한다.
   * (남의 프로필을 남이 고칠 수는 없다 — RLS 가 막고, 막는 게 맞다)
   */
  seenAt: number;
  /** 마지막으로 **공짜** 재검색을 쓴 시각 */
  rerollAt: number;
  /** 그 뒤로 돈 내고 다시 뽑은 횟수 (10분이 지나면 0으로 돌아간다) */
  rerolls: number;
}

export interface GameState {
  // ── 캐릭터 · 파티 · 자동 전투 ────────────────────────
  /*
    이 게임이 새로 키우는 것. 한 사람의 열 칸 장비 대신, 캐릭터를 모으고
    그 캐릭터를 레벨·성으로 키운다 (`core/chars` · `core/party`).

    아래 `equipped`/`inventory` 는 옛 체계다. 저장된 계정에 아직 들어 있어서
    같이 둔다 — 캐릭터 쪽이 자리를 잡은 뒤에 걷어낸다. 서로 참조하지 않는다.
  */
  /** 가지고 있는 캐릭터. 키는 CharId */
  chars: Record<string, OwnedChar>;
  /**
   * ── 짜 두었지만 아직 안 들어간 편성 ── 없으면 `null`.
   *
   * 파티와 대형을 바꾸면 **그 자리에서 안 바뀐다.** 지금 판이 끝나고 다음
   * 판이 열릴 때 `party`·`formation` 으로 옮겨 간다 (`commitPending`).
   *
   * ## 왜 미루나
   *
   * 여태 그 자리에서 바뀌었다. 그러면 위험할 때마다 방어를 앞으로 끌어오고
   * 우두머리가 나오면 대형을 바꾸는 것이 늘 최선이 되어, **판을 어떻게
   * 짤까**가 아니라 **지금 뭘 눌러야 하나**의 문제가 된다. 자동 전투인데
   * 손이 제일 바쁜 순간이 전투 중인 것은 앞뒤가 안 맞는다.
   *
   * 미루면 편성이 판에 들어가기 **전에** 정하는 것이 되고, 그러면 대형과
   * 파티가 같은 성격의 결정이 된다 (`core/party` 의 `FORMATIONS`).
   *
   * `null` 은 "바꾼 것이 없다" 이지 "빈 파티" 가 아니다 — 빈 파티는
   * `[null,null,null,null]` 이다.
   */
  pendingParty: Party | null;
  pendingFormation: FormationId | null;
  /** 파티 네 자리. 빈 자리는 null */
  party: Party;
  /**
   * 지금 고른 대형 (`core/party` 의 `FORMATIONS`) — `뒷줄-앞줄`.
   *
   * 파티(`party`)가 **누가 서나**라면 이건 **어떻게 서나**다. 둘을 한 칸에
   * 묶을 수도 있었지만, 대형은 파티를 안 바꾸고도 판마다 갈아 끼우는
   * 값이라 따로 둔다.
   */
  formation: FormationId;
  /** 자동 전투 진행 상태 */
  battle: BattleState;
  /**
   * 스킬 설정 — 열쇠는 `<캐릭터>:<기술 자리>` (`core/skillOpt` 의 `optKey`).
   *
   * 지금은 아녜스의 정화 하나가 쓴다. 값이 없으면 기본값으로 읽으므로
   * (`cleanseOptOf`) 여기는 **사람이 실제로 건드린 것만** 들어 있다 —
   * 기본값을 다 적어 두면 나중에 기본값을 바꿔도 아무에게도 안 먹는다.
   */
  skillOpts: Record<string, string>;

  // 기본
  money: number;
  /**
   * 다이아 — **시간을 건너뛰는 데만 쓰는 재화.**
   *
   * ## 한 번 걷어냈다가 되돌렸다
   *
   * 화폐를 골드 하나로 줄이면서 다이아를 없앴다 (`core/currency`). 단위가
   * 셋이면 비교할 때마다 환산을 해야 한다는 이유였는데, 그건 **같은 것을 사는
   * 두 단위**의 이야기였다 (골드/실버/쿠퍼).
   *
   * 이건 다르다. 골드로 사는 것과 다이아로 사는 것이 겹치지 않는다 — 골드는
   * 물건을, 다이아는 **기다림**을 산다 (`core/idle` 의 즉시 수령). 환산할
   * 일이 없으므로 환산의 문제도 없다.
   *
   * 파는 곳은 아직 없다. 미션과 게이지 전리품에서만 나온다.
   */
  dia: number;
  /**
   * **강성의 영약** — 각성에 드는 것 (`core/growth` 의 `AWAKEN_ELIXIR`).
   *
   * 재화가 아니라 **재료**다. 파는 곳이 없고 살 수도 없다 — 10판부터
   * 우두머리를 잡으면 다섯에 하나 꼴로 나온다 (`rollElixir`).
   *
   * 골드·다이아와 나란히 지갑에 두지 않은 이유가 그것이다. 저 둘은 "무엇을
   * 살 수 있나" 를 말하지만 이건 **한 사람을 각성시킬 수 있나** 하나만
   * 말하므로, 그 이야기가 벌어지는 자리(캐릭터 창)에서만 보이면 된다.
   */
  elixir: number;
  /**
   * 온라인 게이지를 **마지막으로 비운 시각** (ms).
   *
   * 쌓인 양을 저장하지 않는다. 시각 하나면 언제 읽어도 같은 답이 나오고,
   * 앱이 꺼져 있는 동안 흐른 시간도 저절로 들어온다 — 체력 회복이
   * `staminaAt` 하나로 도는 것과 같은 얼개다.
   */
  idleAt: number;
  /** 오늘 다이아로 즉시 채운 횟수. 날짜가 다르면 0 으로 본다 (`core/refill` 과 같은 규칙) */
  idleInstant: { dayKey: string; used: number };
  /**
   * **지난번 나간 뒤로 이번에 들어오기까지 비운 시간** (ms).
   *
   * 저장본을 읽을 때 한 번 계산해서 넣는다 (`state/migrate`). 그 뒤로는
   * 아무도 안 늘리고, 받거나 닫으면 0 이 된다.
   *
   * `lastSeenAt` 으로 화면에서 직접 재면 안 된다 — 저건 앱이 떠 있는 동안
   * 1초마다 지금으로 갱신되므로 (`tick`), 화면이 그리는 첫 프레임에는 이미
   * 0 이 되어 있다. 그 한 프레임 차이 때문에 오프라인 보상이 안 뜨는 것이
   * 원인을 찾기 제일 어려운 종류다.
   */
  awayMs: number;
  equipped: Equipped;
  inventory: Item[];
  scrolls: Record<ScrollId, number>;
  stamina: number;
  staminaAt: number;
  materials: Record<string, number>;

  // 금융

  // 진행
  arena: ArenaState;
  exploreCleared: number;
  towerCleared: number;
  dailyBonus: Record<string, string>;   // 'explore' | 'tower' | 'water' → dayKey
  /** 1시간마다 새로 굴리는 퀘스트 게시판. 굴린 시점의 템렙이 승률 기준선이 된다. */
  questBoard: { slot: number; list: Quest[] };
  questsDone: string[];

  /*
    주식장은 없앴다 (2026-08).

    남은 두 필드는 **폐쇄 정산의 흔적**이다. 들고 있던 종목은 마지막 시세로
    돈으로 바꿔 소지금에 넣었고 (state/migrate.ts 의 `marketPayout`), 그 일을
    두 번 하지 않으려면 했다는 사실이 저장본에 남아 있어야 한다.

    ⚠ `marketClosed` 는 지우면 안 된다. 지우면 옛 저장본이 다시 "아직 정산 안 함"
    으로 보여 켤 때마다 보유액이 소지금에 얹힌다.
  */
  /** 폐쇄 정산을 마친 세대 (state/migrate.ts 의 MARKET_CLOSE_SEQ) */
  marketClosed: number;
  /** 돌려받은 금액. 화면이 한 번 알리고 null 로 지운다 */
  marketPayout: number | null;

  /*
    은행도 없앴다 (2026-08).

    담보로 잡혀 있던 장비는 창고로 돌려보냈고, 남은 빚은 탕감했다
    (state/migrate.ts 의 `loanCollateral`). 여기 남은 둘은 그 흔적이다.

    ⚠ `bankClosed` 는 지우면 안 된다. 지우면 옛 저장본이 다시 "아직 정산 안 함"
    으로 보여, 켤 때마다 담보가 창고에 하나씩 복제된다.
  */
  /** 폐쇄 정산을 마친 세대 (state/initial.ts 의 BANK_CLOSE_SEQ) */
  bankClosed: number;
  /** 돌려받은 담보 개수. 화면이 한 번 알리고 0 으로 지운다 */
  bankReturned: number;

  // 도박
  creatures: Record<string, Creature>;
  /** 상대전적 — `a:b` = a 가 b 를 이긴 횟수 */
  rushH2H: H2H;
  /** 전적이 집계된 주 (월요일 00시 기준). 바뀌면 전적을 초기화한다 */
  rushWeek: string;
  rushBet: RushBet | null;
  rushSettled: number[];

  // 이벤트 / 부수입
  attendance: { lastDay: string; streak: number; total: number };
  /**
   * 장비 가루 — 파괴된 장비가 남긴 것.
   * 장인의 집에서 그 티어의 0강 장비로 되돌릴 수 있다 (core/dust).
   */
  dust: number;
  /** 이미 사용한 쿠폰 코드 (정규화된 형태) */
  coupons: string[];
  /** 적용된 쿠폰 초기화 세대 (COUPON_RESET_SEQ) */
  /** 투기장 점수 단위 환산 세대 (state/migrate 의 ARENA_SCALE_SEQ) */
  arenaScale: number;
  couponSeq: number;
  /** 선술집 하루 섭취량. 날이 바뀌면 리셋된다. */
  tavern: { dayKey: string; used: Record<string, number> };
  /** 남의 길드에 낸 가입 신청 사유 (내 길드 소개란에 보인다) */
  guildApplyReason: string;
  /**
   * 지금 길드에 들어온 시각.
   * **가입한 그 날은 아무것도 못 한다** (guilds.inProbation) — 길드를 옮겨 다니며
   * 하루치 콘텐츠만 빼먹는 걸 막는다. 나가면 0 으로 되돌린다.
   */
  guildJoinedAt: number;
  /** 보유 정령석 (하급·중급·상급) */
  stones: Record<string, number>;

  // ── 채집 · 수렵 · 낚시 ──
  /** 활동별 **사용 중인** 도구 등급 */
  gatherTools: Record<Activity, Grade>;
  /**
   * 활동별 **보유한** 도구들.
   * 구매는 상점에서, 교체는 현장에서 한다 — 사는 곳과 쓰는 곳을 나눠야
   * "장비를 사러 마을에 간다" 는 동선이 생긴다.
   */
  gatherOwned: Record<Activity, Grade[]>;
  /** 잡은 것의 재고 — **종 id → 개수**. 연성액 부재료로도 쓴다 */
  gatherBag: GatherBag;
  /** 별도 도감 50종 */
  gatherDex: string[];
  gatherDexClaimed: string[];
  /** 오늘 활동 횟수 */
  gatherDaily: { dayKey: string; used: Record<Activity, number> };

  // ── 심연 · 연금술 ──
  /** 심연 재료 */
  abyssMats: { ash: number; shard: number; core: number };
  /** 진행 중인 하강. 앱을 껐다 켜도 이어진다 — 안 그러면 강제 종료로 실패를 취소할 수 있다 */
  abyssRun: AbyssRun | null;
  abyssBest: number;
  /** 만들어 둔 연성액 */
  potions: Record<PotionTier, number>;
  /** 여태 본 최고 배수 (기록 한 줄) */
  bestMul: number;

  // ── 오락실 ──
  /** 진행 중인 지뢰밭. 배팅금은 판을 시작할 때 이미 차감됐다 */
  mines: MinesGame | null;

  // ── 길드 콘텐츠 ──
  guildPoints: number;
  guildSkills: SkillLevels;
  /** 이번 주 내가 채운 길드 퀘스트 몫 */
  guildQuest: { weekKey: string; mine: Record<GqKey, number> };
  /**
   * 개인 일일 · 주간 미션.
   * 진행도는 길드 퀘스트와 같은 이벤트로 오르고, 수령 여부만 따로 기록한다.
   * dayKey / weekKey 가 지금과 다르면 그 기간은 통째로 비어 있는 것으로 본다 —
   * 리셋을 위한 별도 타이머가 필요 없다.
   */
  missions: {
    dayKey: string;
    weekKey: string;
    day: Record<GqKey, number>;
    week: Record<GqKey, number>;
    claimedDay: string[];
    claimedWeek: string[];
  };
  /** 합동 보스 — 주간 누적 딜과 오늘 참여 횟수 */
  guildBoss: { weekKey: string; damage: number; tries: number; dayKey: string; today: number; claimed: boolean };
  /**
   * 레이드 3종의 내 기록.
   * periodKey 가 지금 주기와 다르면 그 주기는 통째로 비어 있는 것으로 본다 —
   * 리셋 타이머가 따로 필요 없다.
   */
  raids: Record<RaidId, {
    periodKey: string;
    damage: number;
    tries: number;
    dayKey: string;
    today: number;
    claimed: boolean;
  }>;
  /** 길드 누적 경험치 — 출석과 자정 정산에서 오른다 */
  guildExp: number;
  /** 길드 출석 — 하루 한 번. 날짜 키가 오늘과 다르면 아직 안 한 것이다 */
  guildCheck: { dayKey: string; total: number };
  /**
   * 지난 정산 기록 (최근 RAID_LOG_MAX 건).
   * 정산은 자정에 저절로 돌아가므로, 자고 일어난 사람이 "그래서 얼마 받았나" 를
   * 되짚을 자리가 없으면 보상을 받은 줄도 모른다.
   */
  raidLog: RaidSettleEntry[];
  /** 마지막으로 정산한 주기 키 (레이드별) — 같은 주기를 두 번 정산하지 않는다 */
  raidSettled: Record<RaidId, string>;
  /** 마지막으로 배당을 받은 날 */
  dividendDay: string;

  // ── 계정 · 캐시 ──
  /** 로그인한 계정. null 이면 로그인 화면이 뜬다 */
  account: { provider: 'google' | 'guest'; id: string; email?: string } | null;
  /** 회원가입을 마쳤는가 (닉네임까지 정했는가) */
  signedUp: boolean;
  /** 캐시 재화 */
  /** 캐시 아이템 보유량 */
  cashItems: Record<string, number>;
  /** 마지막 닉네임 변경 시각 (0 = 한 번도 안 바꿈) */
  nicknameChangedAt: number;
  /**
   * 가진 로고.
   *
   * 기본 12종은 늘 들어 있다 (저장본이 비어 있어도 migrate 가 채운다). 특별 4종만
   * 여기 실제로 쌓인다 — 사고, 뽑고, 칭호로 받는다 (`core/avatars` 의 AVATAR_SOURCE).
   */
  ownedAvatars: AvatarId[];
  /**
   * 오늘 다이아로 충전한 횟수 (체력 · 투기장 티켓).
   * 날짜 키가 오늘이 아니면 0으로 본다 — 자정 리셋을 타이머 없이 처리한다.
   */
  refills: { dayKey: string; stamina: number; ticket: number };
  /**
   * 크리처 러쉬 배팅 결과 알림.
   * 배팅해 놓고 다른 탭에 있어도 결과를 놓치지 않게, 정산 시점에 여기 채워 두고
   * 앱 루트에서 팝업으로 띄운다. 저장에는 남기지 않는다 (다음 실행에 옛 결과가 뜨면 안 된다).
   */
  rushResult: RushResult | null;
  /**
   * 복권 추첨 결과 알림. 러쉬와 같은 이유로 둔다 —
   * 추첨은 오후 8시에 저 혼자 일어나므로, 어느 화면에 있든 결과를 들이밀어야 한다.
   * 산 표가 여러 장이면 전부 담아 옆으로 넘겨 보게 한다. 저장에는 남기지 않는다.
   */
  lotteryResult: LotteryResult[] | null;
  /**
   * 지난 회차 결과 (최근 10회).
   * 화면에서 매번 다시 시뮬레이션하면 전적이 바뀔 때 과거 승자까지 달라진다 —
   * 정산 시점에 확정된 값을 남겨 둔다.
   */
  rushLog: RushLogEntry[];
  /** 이 저장에서 1회차로 셀 기준 슬롯. 화면의 회차 번호는 여기서 센다. */
  rushEpoch: number;
  /**
   * 쿠지 · 가챠. 재고는 시간 기반으로 공유 시뮬레이션되므로 여기엔 "내가 얼마나
   * 뽑았는지"만 저장한다. dayKey 가 바뀌면 오늘치를, cycleKey 가 바뀌면 사이클치를 리셋.
   */
  /**
   * 뽑기 소비 기록 — **종류마다 따로** 센다.
   *
   * 키는 가챠면 `'gacha'`, 쿠지면 종류 이름(`'주문서 쿠지'` 등)이다.
   * 쿠지가 여러 종류를 동시에 진열하게 되면서(core/draw 의 KUJI_KINDS) 하나로
   * 세면 주문서를 다섯 번 뽑았다고 로고 쿠지가 잠긴다.
   */
  draws: Record<string, { dayKey: string; today: number; cycleKey: string; inCycle: number }>;
  lottery: { tickets: Ticket[]; results: LotteryResult[]; serial: number };

  // 수집
  collection: string[];
  collectionClaimed: CollectionRewardState;
  titles: TitleId[];
  equippedTitle: TitleId | null;
  /**
   * 칭호 판정용 관측값. 스탯 카운터로 표현되지 않는 것만 모아 둔다
   * (스탯은 화면에 보여 주는 값이라 아무거나 끼워 넣으면 통계 화면이 지저분해진다).
   */
  titleTrack: {
    engraves: number;
    bestRuneRank: number;
    tower50: number;
    kujiA: boolean;
    nightVisits: number;
    /** 새벽 접속은 하루 1회만 센다 */
    nightDayKey: string;
    tradesDayKey: string;
    tradesToday: number;
    /** 전 서버 가입 순번. 계정 id 에서 한 번 뽑아 고정한다 */
    signupNo: number;
  };

  // 기록
  stats: StatCounters;
  history: EnhanceLog[];
  toasts: Toast[];
  lastSeenAt: number;
  bootedAt: number;
  /** 피드·채팅에 표시되는 내 이름 */
  nickname: string;
  /** 투기장 로고 — 앞으로 실제 PvP 에서 상대 화면에 뜨는 얼굴 */
  avatar: AvatarId;
  /** 가입한 길드 (없으면 null) */
  guildId: string | null;

  // 온보딩 · 환경설정
  /**
   * 이 시각까지는 이벤트 팝업을 띄우지 않는다 ("하루동안 보지 않기").
   * 불리언이 아니라 시각인 게 핵심이다 — 불리언이면 언제 다시 켤지를 또 정해야 한다.
   */
  eventPopupHideUntil: number;
  /** 이미 본 튜토리얼 키 (core/tutorial.ts) */
  tutorialSeen: string[];
  /** 튜토리얼 전체 끄기 — 한 번이라도 "전부 끄기" 를 누른 사람 */
  tutorialOff: boolean;
  /** 이미 본 해금 안내 (core/unlock 의 GUIDES.id). 한 번만 뜬다 */
  guidesSeen: string[];
  /**
   * 아직 안 보여 준 칭호 획득 알림.
   *
   * 한 번의 판정에서 칭호가 둘 이상 열릴 수 있어(가입 순번이 그렇다) 대기열이다.
   * 화면이 하나씩 꺼내 팝업으로 띄운다 — 저장에 남으므로 앱을 껐다 켜도 안 놓친다.
   */
  titleQueue: { id: TitleId; avatar: AvatarId | null }[];
  /** 효과음 켜짐 */
  sfxOn: boolean;
  /** 배경음 켜짐 */
  bgmOn: boolean;
  /**
   * 음량 0~1. 켜짐/꺼짐과 **따로** 둔다 — 껐다 켜도 맞춰 둔 음량이 그대로 돌아와야
   * 한다. 소리 계층(ui/sfx)이 이 값을 소리별 기본 음량에 곱한다.
   */
  sfxVol: number;
  bgmVol: number;
}

export interface GameActions {
  tick: () => void;

  // ── 캐릭터 · 파티 · 자동 전투 (slices/roster) ────────
  /** 캐릭터를 얻는다. 이미 있으면 false */
  recruit: (id: CharId) => boolean;
  /** 파티 자리에 넣는다. null 이면 비운다. 이미 선 사람은 자리를 맞바꾼다 */
  setPartySlot: (slot: number, id: CharId | null) => void;
  /**
   * 짜 둔 편성을 **지금 당장** 되돌린다 — 아직 안 들어간 것만 버린다.
   *
   * 편성은 다음 판부터 들어가므로 (`pendingParty`), 잘못 짰을 때 판이
   * 끝나기를 기다렸다가 다시 고칠 수는 없어야 한다.
   */
  clearPending: () => void;
  /** 스킬 설정을 바꾼다 (`core/skillOpt`) */
  setSkillOpt: (who: CharId, slot: number, opt: string) => void;
  /** 자동 전투 한 틱 — 시간·등장·적 공격 */
  battleTickOnce: () => void;
  /**
   * 판을 골라 간다. **깬 판과 지금 판까지만** (`canGoStage`).
   *
   * 돌아가면 그 판을 처음부터 다시 돈다 — 시작 연출도 다시 탄다. 체력은
   * 그대로 가져간다: 판을 옮겼다고 회복시키면 위험할 때마다 한 판 갔다
   * 오는 것이 회복 수단이 된다.
   */
  goStage: (stage: number) => boolean;
  /**
   * 우두머리를 부른다 — "우두머리 토벌" 단추.
   *
   * 1분을 사냥해야 부를 수 있다 (`bossReady`). 누르는 순간 나오지는 않고,
   * 서 있던 잡몹을 마저 잡으면 그때 걸어 나온다.
   */
  callBossNow: () => boolean;
  /**
   * ⚠ **테스트용** — 광폭화를 그 자리에서 켜다 (`core/autoBattle` 의 `forceRage`).
   *
   * 우두머리와 싸우는 중이 아니거나 이미 광폭화였으면 아무 일도 안 하고
   * `false` 를 돌려준다. ⚠ 출시 전에 이 갈래를 통째로 지운다.
   */
  rageNow: () => boolean;
  /** 한 명이 검을 내려친 순간. 화면이 부른다 */
  /** @param aim 화면이 이미 고른 자리. 없으면 확률대로 고른다 */
  /** @param mul 이 한 대의 배수 — 비앙카의 과열이 둘째 대에 1.5 를 준다 */
  /**
   * 한 대 친다. **요정의 화살이 터진 만큼**을 돌려준다 (`TickEvent.fey`).
   *
   * 돌려주는 이유는 화면이 그릴 것이 있어서다 — 그 한 대만 작은 화살로
   * 따로 그린다 (`BattleView` 의 `FeyDart`). 안 터졌으면 0.
   */
  strikeFoe: (who: string, aim?: number, mul?: number, ally?: string | null) => number;
  /** 스킬 — 앞의 세 마리를 1.5배로. 5초마다 */
  /** @param at 화면이 이미 고른 자리들. 없으면 스킬 규칙대로 여기서 고른다 */
  /**
   * 기술을 쓴다.
   *
   * @param at   맞는 자리들. 화면이 골라서 넘긴다
   * @param slot 기술이 여럿이면 몇 번째 것인가 (`core/chars` 의 `skillsOf`
   *             순서). 안 주면 첫 번째 — 지금은 다들 하나씩이라 늘 0 이다
   */
  skillFoe: (who: string, at?: readonly number[], slot?: number) => void;
  /** 골드로 한 명 모집. 안 가진 사람 중에서만 나온다 */
  recruitDraw: () => { id: CharId; dup: boolean } | 'poor' | 'full';
  /**
   * 레벨 한 칸. 골드를 쓰고 **실패하지 않는다** (`core/growth` 의 `lvCost`).
   *
   * 강화는 확률로 시간을 먹고 레벨은 값으로 먹는다 — 둘 다 확률이면 골드를
   * 어디에 쓸지가 그냥 운이 된다.
   */
  levelUp: (id: CharId) => 'up' | 'max' | 'poor' | 'none';
  /** 조각을 합쳐 한 성 올린다 (`starUpCost`) */
  starUp: (id: CharId) => 'up' | 'max' | 'short' | 'none';
  /** 5성 위의 한 단계 — 조각 서른둘과 영약 하나 (`AWAKEN_COPIES`) */
  awaken: (id: CharId) => 'ok' | 'no' | 'short' | 'none';
  /**
   * ⚠ **테스트용** — 조각과 레벨을 그 자리에서 정한다.
   *
   * 각성 하나를 보려면 조각 마흔여덟 장이 필요하고 (`AWAKEN_COPIES`) 레벨
   * 140 은 백마흔 번을 눌러야 한다. 직접 굴려 보려면 그 앞을 건너뛸 수단이
   * 있어야 한다 — 그래서 `FREE_ENHANCE` 스위치를 탄다.
   *
   * ⚠ `FREE_ENHANCE` 가 꺼져 있으면 아무 일도 안 한다.
   */
  setGrowth: (id: CharId, at: { copies?: number; lv?: number; star?: number }) => void;
  /** 스킬 트리의 갈래 하나를 찍는다 — 못 찍으면 이유를 돌려준다 */
  pickSkill: (id: CharId, node: string) => string | null;
  /** 찍은 것을 전부 되돌린다 (공짜) */
  resetSkills: (id: CharId) => void;

  toast: (text: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;

  // 장비
  equip: (itemId: string, slot: SlotId) => boolean;
  unequip: (slot: SlotId) => void;
  sell: (itemId: string) => void;
  repair: (itemId: string) => void;
  /** 대가 없이 돈을 쓴다 (선술집 팁 등). 잔고가 모자라면 false */
  spendMoney: (n: number) => boolean;
  /** 장비 가루로 그 티어의 0강 장비를 복구한다 */
  restoreFromDust: (tier: number, kind: PartKind) => boolean;
  /**
   * 자동 강화 한 대. 화면이 반복 호출한다.
   * 더 칠 게 없거나 못 치면 `stop` 이 채워져 돌아온다.
   */
  autoEnhanceStep: (
    ids: string[],
    goal: number,
    scroll: ScrollId | null,
  ) => {
    stop?: AutoStop;
    /** 이번에 두들긴 장비 */
    id?: string;
    name?: string;
    outcome?: EnhanceOutcome;
    from?: number;
    to?: number;
    cost?: number;
    dust?: number;
  };
  repairAll: () => void;

  // 강화
  doEnhance: (slot: SlotId, scroll: ScrollId | null) => ReturnType<typeof tryEnhance> | null;
  doPromote: (slot: SlotId) => boolean;
  forgeArtisan: (kind: PartKind) => boolean;
  buyStone: (id: StoneTier, qty?: number) => boolean;
  /** 장비에 정령석을 새긴다. 성공하면 새 정령석을 돌려준다 */
  engrave: (slot: SlotId, stone: StoneTier) => Spirit | null;

  // 상점
  buyT1: (kind: PartKind) => boolean;
  buyScroll: (id: ScrollId, qty?: number) => boolean;
  eat: (menuId: string) => boolean;

  // 전투
  spend: (kind: StaminaKind) => boolean;
  refreshQuests: () => void;
  runQuest: (q: Quest) => { ok: boolean; win?: boolean; gain?: number } ;
  runArena: (ghost: Ghost) => { ok: boolean; win?: boolean; gain?: number };
  /** 상대 다시 찾기 값을 치른다. 치른 금액(0=공짜) 또는 null(못 치름) */
  payReroll: () => number | null;
  /** 내가 당한 판들을 반영한다. 새로 반영한 게 있으면 요약을 돌려준다 */
  applyDefenses: (rows: DefenseRow[]) => OfflineDigest | null;
  runExplore: (chapter: number) => { ok: boolean; win?: boolean; gain?: number; first?: boolean };
  runTower: (floor: number) => { ok: boolean; win?: boolean; gain?: number; first?: boolean; material?: boolean };

  // 금융
  /** 은행 폐쇄 안내를 봤다 — 돌려받은 담보 표시를 지운다 */
  clearBankNotice: () => void;

  // 시장
  /** 주식장 폐쇄 안내를 봤다 — 돌려받은 금액 표시를 지운다 */
  clearMarketPayout: () => void;

  // 도박
  betRush: (on: string, amount: number) => boolean;
  settleRush: (now: number) => void;
  clearRushResult: () => void;
  clearLotteryResult: () => void;
  addMoney: (n: number) => void;
  takeMoney: (n: number) => boolean;
  bumpStat: (k: keyof StatCounters, by?: number) => void;
  grantTitle: (t: TitleId) => void;
  /** 조건을 만족한 칭호를 한꺼번에 지급한다. 지급된 것만 돌려준다 */
  checkTitles: () => TitleId[];

  // ── 채집 · 수렵 · 낚시 ──
  /** 미니게임 점수(0~100)로 한 번 수확한다. 실패해도 잃는 것은 없다 */
  doGather: (a: Activity, score: number) => { species: string; grade: Grade } | null;
  /** 상점에서 도구를 산다 (보유 목록에 추가) */
  buyTool: (a: Activity, grade: Grade) => boolean;
  /** 현장에서 보유한 도구로 갈아 낀다 */
  equipTool: (a: Activity, grade: Grade) => boolean;
  sellYield: (species: string, qty?: number) => boolean;
  /** 번스타인 재료 판매 — 개당 MATERIAL_PRICE */
  sellMaterial: (id: MaterialId, qty?: number) => boolean;
  /** 가진 도구를 되판다 (정가의 70%) */
  sellTool: (a: Activity, grade: Grade) => boolean;
  claimDex: (id: string) => boolean;

  // ── 심연 ──
  enterAbyss: () => boolean;
  descend: () => { ok: boolean; won?: boolean; floor?: number };
  ascend: () => boolean;

  // ── 연금술 ──
  brewPotion: (t: PotionTier) => boolean;
  imbue: (slot: SlotId, t: PotionTier) => Potion | null;

  // ── 오락실 ──
  startMines: (mines: number, bet: number) => boolean;
  openMine: (cell: number) => boolean;
  cashOutMines: () => number;

  // ── 길드 콘텐츠 ──
  bumpGuildQuest: (k: GqKey, by?: number) => void;
  /** 끝난 미션 한 칸(또는 'all' 보너스)의 보상을 받는다 */
  claimMission: (scope: MissionScope, id: string) => boolean;
  /** 지금 받을 수 있는 미션 보상을 한 번에. 받은 칸 수를 돌려준다 */
  claimAllMissions: (scope: MissionScope) => number;
  levelSkill: (id: GuildSkillId) => boolean;
  /** 레이드 한 대 때린다 */
  joinRaid: (id: RaidId) => { ok: boolean; damage?: number; killed?: boolean; boss?: string };
  /** 길드 출석 — 하루 한 번. 실버·기여도·길드 경험치를 남긴다 */
  guildAttend: () => { ok: boolean; money?: number; exp?: number; gp?: number; mates?: number };
  joinBoss: () => { ok: boolean; damage?: number };
  claimBoss: () => boolean;
  claimDividend: () => boolean;

  /** 장인 무구의 다음 마일스톤을 해방한다 */
  liberateSlot: (slot: SlotId) => boolean;
  equipTitle: (t: TitleId | null) => void;
  /** 대형을 바꾼다 (`core/party` 의 `FORMATIONS`) */
  setFormation: (f: FormationId) => void;
  /** 짜 둔 편성을 그 자리에서 들여보낸다 — 지금 판은 처음부터 다시 선다 */
  applyPending: () => boolean;
  /** 가득 찬 게이지를 받는다 (`core/idle`) */
  claimIdle: () => boolean;
  /** 다이아로 게이지를 그 자리에서 채워 받는다 — 하루 세 번 */
  instantIdle: () => boolean;
  /** 자리를 비운 동안의 몫을 받는다 */
  claimAway: () => boolean;
  /** 안 받고 닫는다 — 다시 안 묻는다 */
  dismissAway: () => void;
  claimCollection: (id: string) => void;

  // 이벤트 / 부수입
  checkAttendance: () => boolean;
  redeemCoupon: (raw: string) => CouponResult;
  doPartTime: () => WorkResult | null;
  buyTickets: (n: number) => boolean;
  /** @param kind 쿠지 종류 이름 (가챠는 무시된다) */
  drawBox: (box: BoxId, n: number, kind?: string) => DrawResult[] | null;

  /** 닉네임 변경 — 무료 기간이 아니면 변경권을 쓴다. 실패 이유를 돌려준다 */
  setNickname: (n: string) => NicknameError | 'ok';
  signIn: (provider: 'google' | 'guest', id: string, email?: string) => void;
  completeSignUp: (nickname: string) => boolean;
  signOut: () => void;
  buyCashItem: (id: CashItemId, qty?: number) => boolean;
  setAvatar: (a: AvatarId) => void;
  grantAvatar: (id: AvatarId) => boolean;
  buyAvatar: (id: AvatarId) => boolean;
  buyRefill: (kind: RefillKind) => boolean;

  // 온보딩 · 환경설정
  /** 이벤트 팝업 닫기. days 를 주면 그만큼 다시 안 뜬다 */
  hideEventPopup: (days?: number) => void;
  /** 이 화면 튜토리얼을 봤다고 기록 */
  markTutorial: (key: string) => void;
  /** 튜토리얼 전체 끄기/켜기 */
  setTutorialOff: (off: boolean) => void;
  /** 해금 안내를 봤다고 표시한다 (다시 안 뜬다) */
  markGuide: (id: string) => void;
  /** 칭호 획득 알림을 하나 치운다 (팝업을 닫을 때) */
  popTitleNotice: () => void;
  /** 처음부터 다시 보기 — 본 기록을 지운다 */
  resetTutorials: () => void;
  setSfxOn: (on: boolean) => void;
  setSfxVol: (v: number) => void;
  setBgmVol: (v: number) => void;
  setBgmOn: (on: boolean) => void;
  joinGuild: (id: string, reason: string) => boolean;
  leaveGuild: () => void;
  /**
   * 길드 창설 — 서버에 줄을 만든다. 이름이 겹치면 **돈을 빼기 전에** 실패한다.
   * (예전엔 로컬 상태만 바꾸면 됐으므로 동기 함수였다)
   */
  createGuild: (name: string, motto: string, emblem: string) => Promise<boolean>;
  disbandGuild: () => void;
  reset: () => void;
}

export type Store = GameState & GameActions;
