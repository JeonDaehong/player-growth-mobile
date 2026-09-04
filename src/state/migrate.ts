/**
 * 저장본 스키마 보정.
 *
 * 이 게임은 필드가 계속 늘어난다. 저장본에 새 필드가 없으면 런타임에서 undefined 를
 * 읽고 흰 화면이 된다 (종목 5→8 추가 때 실제로 그랬다).
 *
 * 더 고약한 건 **null** 이다. `NaN` 은 JSON.stringify 에서 null 로 저장되므로
 * `null.toLocaleString()` 같은 곳에서 터진다 (통계 탭이 이 이유로 죽었다).
 * NaN 은 예전에 없던 통계 키를 `undefined + 1` 로 증가시켰을 때 생겼다.
 *
 * 그래서 저장본을 신뢰하지 않는다 — 기본값에서 시작해 **검증된 값만** 덮는다.
 * core 만 import 한다 (RN 없이 테스트 가능해야 한다).
 */
import type { GameState } from './store';
import { BANK_CLOSE_SEQ, MARKET_CLOSE_SEQ, initial } from './initial';
import { initCreatures } from '@/core/rush';
import { COUPON_RESET_SEQ } from '@/core/coupons';
import { MATERIAL_IDS, materialFor } from '@/core/artisans';
import {
  ACTIVITIES, GatherBag, GRADES as GATHER_GRADES, Grade as GatherGrade, SPECIES_BY_ID, TOOLS,
  candidates,
} from '@/core/gathering';
import { BANDS } from '@/core/alchemy';
import { ARTISAN_TIER, LEGACY_SLOT, SLOT_IDS } from '@/core/types';
import { DEFAULT_AVATARS, isAvatarId } from '@/core/avatars';
import { ARENA_LOG_MAX } from '@/core/arena';

/**
 * 투기장 점수 단위 환산 세대.
 *
 * 티어당 100점 → 1000점으로 바꿨다. 이 값보다 낮은 저장본은 한 번 환산한다.
 */
const ARENA_SCALE_SEQ = 1;
import { RAIDS, RAID_LOG_MAX } from '@/core/guildRaid';
import { entryKey } from '@/core/collection';

/** 연성액 배수의 물리적 하한·상한 — 이 밖의 값은 저장본이 망가진 것이다 */
const ALCH_MIN_MUL = BANDS.low.dross[0];
const ALCH_MAX_MUL = BANDS.high.mythic[1];
/** 해방 단계 상한 — 사람이 도달할 수 없는 값이면 저장본이 망가진 것이다 */
const MAX_FREED = 200;
import type { Creature } from '@/core/types';
import {
  CharId, MAX_GEAR_LV, OwnedChar, STARTING_CHARS, fixChar, isCharId, newChar,
} from '@/core/chars';
import { DEFAULT_FORMATION, cleanParty, isFormationId } from '@/core/party';
import { OPEN_MS, STAGE_MS, startFoes } from '@/core/autoBattle';

export const STATE_VERSION = 3;



/**
 * 서버가 발급한 길드 id (uuid) 인가.
 *
 * v2 까지의 저장본은 `g37` · `mine` 을 들고 있었다 (생성 길드 시절).
 * 그 값들은 이제 가리키는 곳이 없으므로 소속을 푼다.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isGuildId = (v: unknown): boolean => typeof v === 'string' && UUID_RE.test(v);

type Bag = Record<string, unknown>;

const isObj = (v: unknown): v is Bag =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** 유한한 숫자만 (null · NaN · Infinity · 문자열 차단) */
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const arr = <T>(v: unknown, d: T[]): T[] => (Array.isArray(v) ? (v as T[]) : d);
const bag = (v: unknown): Bag => (isObj(v) ? v : {});

/** 기본값에 있는 키만, 유한한 숫자만 받는다 */
function numMap<T extends object>(base: T, got: unknown): T {
  const g = bag(got);
  const out: Bag = { ...(base as Bag) };
  for (const k of Object.keys(base)) out[k] = num(g[k], (base as Bag)[k] as number);
  return out as T;
}

/** 문자열 맵 — 문자열만 받는다 */
function strMap(base: Record<string, string>, got: unknown): Record<string, string> {
  const out = { ...base };
  for (const [k, v] of Object.entries(bag(got))) if (typeof v === 'string') out[k] = v;
  return out;
}

/**
 * 시세 보정.
 * 가격은 살리고 없는 필드만 채운다 — 플레이어의 보유 자산 가치가 갑자기 변하면 안 된다.
 * 신규 종목은 기본가로 추가하고, 사라진 종목은 버린다.
 */
/**
 * 주식장을 닫으면서 들고 있던 종목을 **돈으로 돌려준다.**
 *
 * 콘텐츠를 없애는 건 기획의 선택이지만, 그 김에 사람이 모아 둔 재산까지 사라지는 건
 * 다른 얘기다. 주식에 전 재산을 넣어 둔 사람에게는 그게 그냥 전 재산 소멸이다.
 *
 * ## 왜 여기서 계산할 수 있나
 *
 * 저장본이 **가격과 보유 수량을 둘 다** 들고 있다 (`stocks[id].price`, `holdings[id].shares`).
 * 그래서 `core/stock.ts` 가 사라진 뒤에도 정산에 필요한 건 저장본 안에 다 있다 —
 * 이 함수는 지워진 모듈을 하나도 안 부른다. (시세표를 남겨 두려고 죽은 모듈을
 * 붙잡고 있는 것보다 이쪽이 깨끗하다.)
 *
 * ## 무엇을 의심하나
 *
 * 마지막 시세 그대로 쳐준다. 손해도 이익도 만들지 않는 게 제일 덜 억울하다.
 * 다만 저장본은 손댈 수 있으므로 값을 그대로 믿지는 않는다 — 수량·가격 모두
 * 유한한 양수만 세고, 총액에 상한을 둔다. 상한은 "정상적으로는 절대 못 닿는" 자리다.
 */
const MARKET_PAYOUT_CAP = 1_000_000_000_000;

/**
 * 은행을 닫으면서 **담보로 잡혀 있던 장비를 돌려준다.**
 *
 * 대출은 담보를 맡기고 돈을 빌리는 것이라, 은행을 없애면 그 장비가 갈 곳이 없다.
 * 그냥 두면 저장본에만 남고 화면 어디에도 안 나오는 유령이 된다 — 사람 입장에서는
 * **장비가 사라진 것**이다. 그것도 제일 아끼는 것이었을 확률이 높다
 * (담보로 잡히는 건 비싼 물건이다).
 *
 * ## 빚은 탕감한다
 *
 * 갚을 창구가 없어졌으니 갚으라고 할 수 없다. 원금을 도로 걷어 가는 것도 방법이지만
 * 그 돈은 이미 강화에 썼을 것이고, 그러면 소지금이 음수가 되거나 장비를 팔아야 한다 —
 * **우리가 없앤 콘텐츠 때문에** 사람이 손해를 보는 건 앞뒤가 안 맞는다.
 * 유리한 쪽으로 잘못하는 편이 낫다.
 */
function loanCollateral(loansRaw: unknown): unknown[] {
  if (!Array.isArray(loansRaw)) return [];
  return loansRaw
    .map((l) => bag(l).collateral)
    .filter((c) => isObj(c));
}

function marketPayout(stocksRaw: unknown, holdingsRaw: unknown): number {
  const st = bag(stocksRaw);
  const hd = bag(holdingsRaw);
  let total = 0;
  for (const id of Object.keys(hd)) {
    const h = bag(hd[id]);
    const shares = Math.floor(num(h.shares, 0));
    if (!(shares > 0)) continue;
    const price = num(bag(st[id]).price, 0);
    if (!(price > 0)) continue;
    total += shares * price;
  }
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(MARKET_PAYOUT_CAP, Math.round(total));
}

function fixCreatures(got: unknown): Record<string, Creature> {
  const fresh = initCreatures();
  const g = bag(got);
  const out: Record<string, Creature> = {};
  for (const [id, c] of Object.entries(fresh)) {
    const p = bag(g[id]);
    out[id] = { id, name: c.name, wins: num(p.wins, c.wins), losses: num(p.losses, c.losses) };
  }
  return out;
}

export function migrateState(persisted: unknown): GameState {
  const base = initial();
  if (!isObj(persisted)) return base;
  const p = persisted;

  const { equipped, spilled } = fixEquipped(p.equipped, base.equipped);
  /* 슬롯이 줄면서 낄 데가 없어진 장비는 창고로 — 값을 치른 물건을 조용히 없애지 않는다 */
  /*
    담보로 잡혀 있던 장비를 창고로 돌려보낸다 (은행 폐쇄, 2026-08).
    ⚠ `fixItem` 을 통과시킨다 — 담보라고 더 믿을 이유가 없다. 저장본은 저장본이다.
  */
  const freedCollateral = num(p.bankClosed, 0) < BANK_CLOSE_SEQ
    ? loanCollateral(p.loans).map(fixItem).filter(Boolean)
    : [];

  const inventory = [
    ...arr<unknown>(p.inventory, []).map(fixItem).filter(Boolean),
    ...spilled,
    ...freedCollateral,
  ] as GameState['inventory'];

  /*
    주식장 폐쇄 정산 — **한 번만** 준다.

    `marketClosed` 세대가 이미 올라가 있으면 지난번에 이미 돌려줬다는 뜻이다.
    여기서 세대를 안 보면 게임을 켤 때마다 보유액이 소지금에 얹힌다 (마이그레이션은
    저장본을 읽을 때마다 도는 함수다). 무한 증식은 유실만큼이나 나쁘다.
  */
  const payout = num(p.marketClosed, 0) < MARKET_CLOSE_SEQ
    ? marketPayout(p.stocks, p.holdings)
    : 0;

  /*
    캐릭터 · 파티 · 전투.

    옛 저장본에는 아예 없는 필드라 전부 `base`(빈 상태)로 떨어진다. 그건
    맞는 동작이다 — 캐릭터가 없으면 처음 고르는 화면이 다시 뜬다.

    있는 저장본은 **한 명씩 검사해서** 담는다. 정의에 없는 id(개발 중에 뺀
    캐릭터), 범위를 벗어난 레벨, 소수점 강화 수치를 그대로 믿으면 전투 계산이
    NaN 으로 새고 화면이 통째로 하얘진다 — 종목을 5→8 로 늘렸을 때 실제로 났던 일이다.
  */
  const chars: Record<string, OwnedChar> = {};
  for (const [k, v] of Object.entries(bag(p.chars))) {
    if (!isCharId(k)) continue;
    const c = bag(v);
    /*
      성 · 레벨 · 조각은 **나중에 생긴 칸**이다 (`core/growth`).

      한동안 캐릭터가 자라는 축이 고유장비 강화 하나뿐이라 레벨을 버리고
      있었다. 이제 축이 셋이라 (등급 · 성 · 레벨) 셋 다 담는다.

      없는 값은 `fixChar` 가 채운다 — 옛 저장본은 **2성**부터 시작한다
      (등급이 허락하는 만큼). 넷은 여태 기술을 둘씩 쓰고 있었으므로 1성으로
      내리면 그 둘째 기술이 조용히 사라진다.
    */
    chars[k] = fixChar({
      id: k,
      gearLv: Math.min(MAX_GEAR_LV, Math.max(0, Math.floor(num(c.gearLv, 0)))),
      star: num(c.star, NaN),
      awake: c.awake === true,
      lv: num(c.lv, NaN),
      copies: Math.max(0, Math.floor(num(c.copies, 0))),
    });
  }
  /*
    시작 캐릭터는 **없으면 채워 준다.**

    한 명씩 만들어 늘리는 중이라, 새로 완성한 사람을 시작 인원에 올려도
    이미 하던 사람은 그 사람이 저장본에 없어서 영영 못 받는다. 새로 깐 사람만
    받는 캐릭터가 생기는 셈이라 그건 아니다.

    **덮어쓰지는 않는다** — 이미 있으면 레벨과 강화 수치를 그대로 둔다.
  */
  const granted: CharId[] = [];
  for (const id of STARTING_CHARS) {
    if (chars[id]) continue;
    chars[id] = newChar(id);
    granted.push(id);
  }

  /* 파티는 **가지고 있는 캐릭터만** 통과시킨다 (중복·빈칸도 여기서 걷힌다) */
  const party = cleanParty(p.party, Object.keys(chars) as CharId[]);

  /*
    방금 준 사람만 빈 칸에 세운다.

    이미 가지고 있던 사람은 안 건드린다 — 일부러 뺀 사람을 다시 세우면
    저장본을 불러올 때마다 파티가 제멋대로 바뀐다.
  */
  for (const id of granted) {
    const slot = party.indexOf(null);
    if (slot < 0) break;
    party[slot] = id;
  }

  /*
    전투는 **스테이지 번호와 최고 기록만** 살린다.

    싸우던 중간(남은 시간·서 있던 적들·남은 체력)은 안 믿는다. 그 값들은
    파티가 그대로일 때만 뜻이 있는데, 저장본을 불러온 시점에는 파티가 바뀌어
    있을 수 있다 — 잘못 믿으면 3초짜리 적이 최대 체력으로 서 있거나, 파티
    체력이 최대치를 넘은 채로 시작한다.

    그래서 **그 스테이지를 처음부터** 다시 시작한다. 잃는 건 최대 2분이고,
    얻는 건 어떤 저장본이 와도 값이 성립한다는 보장이다.
  */
  const rawBattle = bag(p.battle);
  const stage = Math.max(1, Math.floor(num(rawBattle.stage, 1)));
  const fresh = startFoes(stage);
  const battle = {
    stage,
    best: Math.max(stage, Math.floor(num(rawBattle.best, stage))),
    msLeft: STAGE_MS,
    boss: false,
    /* 서 있던 적은 안 믿는다 — 그 스테이지의 대형을 새로 세운다 */
    foes: fresh.foes,
    /* 번호는 0 부터 다시 센다 — 화면에서만 쓰는 값이라 이어 붙일 이유가 없다 */
    seq: fresh.seq,
    slain: 0,
    target: 0,
    /* 체력은 안 믿는다 — 비워 두면 다음 틱이 각자 최대치로 채운다 */
    hp: {},
    down: 0,
    spawnIn: 0,
    /*
      들어오면서 판 시작 연출을 한 번 본다. 저장본에서 이어 붙는 것이 대형
      뿐이라 화면이 갑자기 켜지는데, 막이 한 번 걷히면 "여기서부터" 가 된다.
    */
    openIn: OPEN_MS,
    clearIn: 0,
    clearKind: null,
    goTo: null,
    /* 이어서 켜도 우두머리는 다시 불러야 한다 — 1분을 새로 사냥한다 */
    called: false,
    /* 지난 판에 나갔던 특수기 이름을 이어받을 이유가 없다 */
    pat: null,
    patId: null,
    charm: null,
    burst: 0,
    /* 나중에 생긴 칸 — 갈라진 횟수 (`BattleState.rip`) */
    rip: 0,
    patSeq: 0,
    /*
      걸려 있던 것도 안 믿는다.

      대형과 체력을 새로 세우면서(위) 출혈만 이어받으면, 켜자마자 아무도
      안 때렸는데 체력이 줄어든다. 판을 새로 여는 것과 같은 태도다.
    */
    hex: {},
    cut: {},
    bossMs: 0,
    swingSeq: 0,
    /*
      나중에 생긴 칸들. 저장본에 있어도 안 읽는다 — 위와 같은 이유로 판은
      늘 처음부터 다시 선다.
    */
    fade: {},
    taunt: null,
    foeHex: {},
    foeHeal: { seq: 0, amt: 0 },
    struck: [],
    /* 코스트도 0 부터다. 켜자마자 정화가 나가면 어디서 찼는지 알 수 없다 */
    costSeq: 0,
  };

  return {
    ...base,
    chars,
    party,
    battle,
    /*
      스킬 설정은 **이어받는다.** 판은 처음부터 다시 서지만 설정은 사람이
      고른 것이라, 껐다 켜면 사라지는 종류의 값이 아니다.

      값을 검사하지 않는다 — 읽는 쪽이 모르는 값이면 기본값으로 떨어뜨린다
      (`core/skillOpt` 의 `cleanseOptOf`). 저장본을 믿지 않는 일을 한 곳에서만
      한다.
    */
    skillOpts: (p.skillOpts && typeof p.skillOpts === 'object'
      ? p.skillOpts : {}) as Record<string, string>,

    // 원시값
    /*
      주식장이 닫히면서 돌려받은 돈이 여기 얹힌다.
      `payout` 은 이미 정산했으면 0 이다 (marketClosed 세대로 잠근다).
    */
    money: Math.max(0, Math.floor(num(p.money, base.money))) + payout,
    dia: Math.max(0, Math.floor(num(p.dia, 0))),
    /* 나중에 생긴 칸 — 없으면 0 (`core/growth` 의 `rollElixir` 로만 는다) */
    elixir: Math.max(0, Math.floor(num(p.elixir, 0))),
    /* 대형이 없던 저장본은 기본 대형으로 — 모르는 이름이 들어와도 마찬가지다 */
    formation: isFormationId(p.formation) ? p.formation : DEFAULT_FORMATION,
    /*
      짜 두었지만 아직 안 들어간 편성 (`pendingParty`).

      **살려 둔다.** 앱을 껐다 켜면 사라지게 두면, 편성을 짜 놓고 판이
      끝나기를 기다리는 동안 켜 둘 수가 없다 — 미루는 것이 규칙인데 미룬
      것이 안 남으면 규칙이 벌칙이 된다.

      `party` 와 같은 문으로 다듬는다 (`cleanParty`) — 그 사이에 없어진
      캐릭터가 편성표에 남아 있으면 안 된다.
    */
    pendingParty: p.pendingParty == null ? null : cleanParty(p.pendingParty, Object.keys(chars) as CharId[]),
    pendingFormation: isFormationId(p.pendingFormation) ? p.pendingFormation : null,
    /*
      게이지 시각이 없는 저장본(이 칸이 생기기 전)은 **지금부터** 센다.
      0 으로 두면 1970년부터 흐른 것이 되어 켜자마자 가득 차 있다.
    */
    idleAt: num(p.idleAt, base.idleAt),
    idleInstant: (p.idleInstant && typeof p.idleInstant === 'object'
      ? {
        dayKey: str((p.idleInstant as Record<string, unknown>).dayKey, ''),
        used: Math.max(0, Math.floor(num((p.idleInstant as Record<string, unknown>).used, 0))),
      }
      : { dayKey: '', used: 0 }),
    /*
      ── 비운 시간은 **여기서 한 번만** 잰다 ──

      저장본의 `lastSeenAt` 은 지난번에 앱이 마지막으로 살아 있던 시각이다.
      화면이 뜨고 나면 1초 타이머가 그 값을 지금으로 갈아 버리므로
      (`slices/core` 의 `tick`), 재려면 **읽는 이 순간**밖에 없다.

      상한은 안 건다 — 얼마를 비웠든 값은 여덟 시간에서 멎으므로
      (`core/idle` 의 `offlineAt`) 여기서 또 자르면 규칙이 두 곳에 생긴다.
    */
    awayMs: Math.max(0, Date.now() - num(p.lastSeenAt, Date.now())),
    stamina: num(p.stamina, base.stamina),
    staminaAt: num(p.staminaAt, base.staminaAt),
    exploreCleared: num(p.exploreCleared, 0),
    towerCleared: num(p.towerCleared, 0),
    rushWeek: str(p.rushWeek, base.rushWeek),
    lastSeenAt: num(p.lastSeenAt, base.lastSeenAt),
    bootedAt: num(p.bootedAt, base.bootedAt),
    nickname: str(p.nickname, base.nickname),
    avatar: str(p.avatar, base.avatar) as GameState['avatar'],
    /*
      가진 로고.

      기본 12종은 **언제나 들어 있다.** 저장본에 없더라도(이 필드가 생기기 전의
      저장본이 그렇다) 채워 넣는다 — 안 그러면 예전부터 하던 사람이 자기 로고를
      전부 잃는다. 실재하지 않는 id 는 버린다 (로고를 지웠거나 저장본이 망가진 경우).
    */
    ownedAvatars: (() => {
      const got = arr<unknown>(p.ownedAvatars, [])
        .filter((v): v is string => typeof v === 'string' && isAvatarId(v));
      /*
        '초기 정착민' 칭호를 이미 가진 사람에게 전용 로고를 **소급 지급**한다.

        로고는 칭호보다 나중에 붙었다. 그래서 칭호가 생긴 뒤에 로고가 열리는
        경로(`checkTitles`)만으로는 **이미 칭호를 받아 둔 사람**이 영영 못 받는다 —
        칭호는 한 번 지급되면 `titles` 에 남고 다시 지급 판정을 타지 않기 때문이다.
        선착순 자리라 놓치면 되찾을 방법이 없으므로 여기서 채워 넣는다.
      */
      const titles = arr<unknown>(p.titles, []);
      if (titles.includes('first_thousand')) got.push('knightgirl');
      return [...new Set([...DEFAULT_AVATARS, ...got])] as GameState['ownedAvatars'];
    })(),

    /*
      오늘 충전한 횟수.

      날짜 키가 오늘이 아니면 어차피 0으로 읽히므로(`usedToday`) 여기서는 값이
      성한지만 본다. 음수나 NaN 이 들어오면 값 사다리의 인덱스가 되어 엉뚱한
      가격이 나온다.
    */
    refills: (() => {
      const r = bag(p.refills);
      return {
        dayKey: str(r.dayKey, ''),
        stamina: Math.max(0, Math.floor(num(r.stamina, 0))),
        ticket: Math.max(0, Math.floor(num(r.ticket, 0))),
      };
    })(),
    /*
      길드 소속.

      ⚠ 옛 저장본의 `guildId` 는 **생성 길드의 번호**(`g37`)이거나 내가 만든
      길드를 뜻하는 `mine` 이었다. 그 길드들은 이제 존재하지 않는다 —
      들고 있어 봐야 없는 방의 채팅 권한을 요구하고 목록에도 안 뜬다.
      서버 길드 id 는 uuid 이므로, 그 모양이 아닌 값은 여기서 놓아준다.
    */
    guildId: isGuildId(p.guildId) ? (p.guildId as string) : null,
    equippedTitle: typeof p.equippedTitle === 'string'
      ? (p.equippedTitle as GameState['equippedTitle']) : null,

    // 숫자 맵
    scrolls: numMap(base.scrolls, p.scrolls),
    /**
     * 재료 체계가 부위 21종 → 번스타인 3계열로 바뀌었다.
     * 옛 저장본의 부위별 재고를 계열로 합산해 옮긴다 (그냥 버리면 모은 게 사라진다).
     */
    materials: (() => {
      const out = { ...base.materials };
      const got = bag(p.materials);
      for (const [k, v] of Object.entries(got)) {
        const n = Math.max(0, Math.floor(num(v, 0)));
        if (!n) continue;
        const key = (MATERIAL_IDS as string[]).includes(k)
          ? k
          : materialFor(k as never);
        out[key] = (out[key] ?? 0) + n;
      }
      return out;
    })(),
    stats: numMap(base.stats, p.stats),
    dailyBonus: strMap(base.dailyBonus, p.dailyBonus),

    // 구조체
    equipped,
    arena: {
      /*
        ⚠ 점수 단위가 바뀌었다 (티어당 100 → 1000).

        옛 저장본의 점수를 그대로 두면 500점이던 사람(B 티어)이 F 티어 500점이 된다.
        티어를 유지하는 쪽으로 환산한다 — 티어는 그 사람이 쌓아 온 결과라
        숫자보다 티어를 지키는 게 맞다. 티어 안 진행도는 버린다 (되살릴 근거가 없다).
      */
      points: (() => {
        const raw = num(bag(p.arena).points, base.arena.points);
        if (num(p.arenaScale, 0) >= ARENA_SCALE_SEQ) return raw;
        return Math.min(6, Math.floor(raw / 100)) * 1000;
      })(),
      badges: num(bag(p.arena).badges, base.arena.badges),
      badgeAt: num(bag(p.arena).badgeAt, base.arena.badgeAt),
      seasonStartedAt: num(bag(p.arena).seasonStartedAt, base.arena.seasonStartedAt),
      seasonBestTier: str(bag(p.arena).seasonBestTier, base.arena.seasonBestTier),
      /* 전적은 성한 줄만 살린다 — 한 줄이 깨져도 화면 전체가 죽으면 안 된다 */
      log: (Array.isArray(bag(p.arena).log) ? bag(p.arena).log as unknown[] : [])
        .map((e) => bag(e))
        .filter((e) => typeof e.id === 'string' && typeof e.at === 'number'
          && typeof e.foeNick === 'string' && typeof e.win === 'boolean')
        .slice(0, ARENA_LOG_MAX) as unknown as GameState['arena']['log'],
      seenAt: num(bag(p.arena).seenAt, base.arena.seenAt),
      rerollAt: num(bag(p.arena).rerollAt, 0),
      rerolls: Math.max(0, Math.floor(num(bag(p.arena).rerolls, 0))),
    },
    /* 점수 단위 환산을 이미 했는가 (위 arena.points 주석) */
    arenaScale: ARENA_SCALE_SEQ,
    // 문자열 배열만 통과시킨다 — 저장을 손댔거나 스키마가 바뀌어도 안전하게.
    // 초기화 세대가 올라갔으면 사용 기록을 딱 한 번 비운다 (재사용 허용).
    coupons: num(p.couponSeq, 0) < COUPON_RESET_SEQ
      ? []
      : Array.isArray(p.coupons) ? p.coupons.filter((c): c is string => typeof c === 'string') : [],
    couponSeq: COUPON_RESET_SEQ,
    tavern: {
      dayKey: str(bag(p.tavern).dayKey, ''),
      // 개수만 통과 — 음수·소수·NaN 은 0 으로
      used: Object.fromEntries(
        Object.entries(bag(bag(p.tavern).used)).map(([k, v]) => [k, Math.max(0, Math.floor(num(v, 0)))]),
      ),
    },
    attendance: {
      lastDay: str(bag(p.attendance).lastDay, ''),
      streak: num(bag(p.attendance).streak, 0),
      total: num(bag(p.attendance).total, 0),
    },
    lottery: {
      tickets: arr(bag(p.lottery).tickets, []),
      results: arr(bag(p.lottery).results, []),
      serial: num(bag(p.lottery).serial, 0),
    },
    collectionClaimed: {
      claimedKinds: arr<string>(bag(p.collectionClaimed).claimedKinds, []),
      claimedAllWeapons: !!bag(p.collectionClaimed).claimedAllWeapons,
      claimedFullBook: !!bag(p.collectionClaimed).claimedFullBook,
      claimedArtisanSet: !!bag(p.collectionClaimed).claimedArtisanSet,
    },
    questBoard: {
      slot: num(bag(p.questBoard).slot, -1),
      list: arr(bag(p.questBoard).list, []),
    },
    /*
      키가 자유롭다 — 가챠는 'gacha', 쿠지는 종류 이름이다.
      옛 저장본의 'kuji' 한 덩어리는 그대로 살려 둔다 (안 읽힐 뿐 해가 없다).
    */
    draws: {
      ...Object.fromEntries(Object.entries(bag(p.draws))
        .map(([k, v]) => [k, numStrDraw(v)])),
      gacha: numStrDraw(bag(p.draws).gacha),
    },
    // ── 새 콘텐츠 (채집·심연·연금술·오락실·길드) ──
    // 저장본을 믿지 않는다 — 형태가 안 맞으면 기본값으로 되돌린다
    gatherTools: (() => {
      const t = bag(p.gatherTools);
      const pick = (k: string) => {
        const v = t[k];
        return (typeof v === 'string' && v in TOOLS ? v : 'F') as GatherGrade;
      };
      return { gather: pick('gather'), hunt: pick('hunt'), fish: pick('fish') };
    })(),
    gatherOwned: (() => {
      const src = bag(p.gatherOwned);
      const equippedNow = bag(p.gatherTools);
      const one = (k: string) => {
        const got = arr<string>(src[k], []).filter((x) => typeof x === 'string' && x in TOOLS);
        // F 급은 첫 방문 때 무료로 주므로 항상 들고 있다 — 없으면 활동 자체를 못 한다.
        // 쓰고 있던 도구도 반드시 넣는다 — 보유 목록에 없으면 "가진 적 없는 도구를 쓰는 중"이 된다
        const worn = equippedNow[k];
        const keep = typeof worn === 'string' && worn in TOOLS ? [worn] : [];
        return Array.from(new Set(['F', ...keep, ...got])) as GatherGrade[];
      };
      return { gather: one('gather'), hunt: one('hunt'), fish: one('fish') };
    })(),
    gatherBag: fixBag(p.gatherBag),
    gatherDex: arr<string>(p.gatherDex, []).filter((x) => typeof x === 'string' && x in SPECIES_BY_ID),
    gatherDexClaimed: arr<string>(p.gatherDexClaimed, []).filter((x) => typeof x === 'string'),
    gatherDaily: (() => {
      const d = bag(p.gatherDaily);
      const u = bag(d.used);
      return {
        dayKey: str(d.dayKey, ''),
        used: { gather: num(u.gather, 0), hunt: num(u.hunt, 0), fish: num(u.fish, 0) },
      };
    })(),
    abyssMats: (() => {
      const m = bag(p.abyssMats);
      return { ash: num(m.ash, 0), shard: num(m.shard, 0), core: num(m.core, 0) };
    })(),
    abyssRun: (() => {
      const r = bag(p.abyssRun);
      if (typeof r.floor !== 'number') return null;
      const b2 = bag(r.bag);
      return {
        floor: Math.max(0, Math.floor(num(r.floor, 0))),
        bag: {
          ash: num(b2.ash, 0), shard: num(b2.shard, 0),
          core: num(b2.core, 0), money: num(b2.money, 0),
        },
        startedAt: num(r.startedAt, base.bootedAt),
      };
    })(),
    abyssBest: num(p.abyssBest, 0),
    potions: (() => {
      const m = bag(p.potions);
      return { low: num(m.low, 0), mid: num(m.mid, 0), high: num(m.high, 0) };
    })(),
    bestMul: num(p.bestMul, 0),
    /**
     * 진행 중인 지뢰밭은 반드시 살려서 돌려준다.
     * 여기서 버리면 지뢰를 밟는 순간 앱을 죽여 손실을 취소하는 어뷰징이 열린다.
     */
    mines: (() => {
      const m = bag(p.mines);
      if (typeof m.mines !== 'number' || typeof m.bet !== 'number') return null;
      const ints = (v: unknown) => arr<number>(v, []).filter((x) => Number.isInteger(x));
      return {
        mines: Math.max(1, Math.min(8, Math.floor(m.mines))),
        bet: Math.max(0, Math.floor(num(m.bet, 0))),
        bombs: ints(m.bombs),
        opened: ints(m.opened),
        dead: m.dead === true,
        done: m.done === true,
      };
    })(),
    guildPoints: Math.max(0, num(p.guildPoints, 0)),
    guildSkills: (() => {
      const src = bag(p.guildSkills);
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(src)) {
        const n = num(v, 0);
        if (n > 0) out[k] = Math.max(0, Math.min(10, Math.floor(n)));
      }
      return out;
    })(),
    guildQuest: (() => {
      const q = bag(p.guildQuest);
      const m = bag(q.mine);
      return {
        weekKey: str(q.weekKey, ''),
        mine: {
          enhance: num(m.enhance, 0), clear: num(m.clear, 0), arena: num(m.arena, 0),
          gamble: num(m.gamble, 0), sell: num(m.sell, 0),
        },
      };
    })(),
    missions: (() => {
      const mm = bag(p.missions);
      const axes = (o: Record<string, unknown>) => ({
        enhance: num(o.enhance, 0), clear: num(o.clear, 0), arena: num(o.arena, 0),
        gamble: num(o.gamble, 0), sell: num(o.sell, 0),
      });
      return {
        dayKey: str(mm.dayKey, ''),
        weekKey: str(mm.weekKey, ''),
        day: axes(bag(mm.day)),
        week: axes(bag(mm.week)),
        claimedDay: arr<string>(mm.claimedDay, []).filter((x) => typeof x === 'string'),
        claimedWeek: arr<string>(mm.claimedWeek, []).filter((x) => typeof x === 'string'),
      };
    })(),
    raids: (() => {
      const all = bag(p.raids);
      const one = (v: unknown) => {
        const o = bag(v);
        return {
          periodKey: str(o.periodKey, ''),
          damage: num(o.damage, 0),
          tries: num(o.tries, 0),
          dayKey: str(o.dayKey, ''),
          today: num(o.today, 0),
          claimed: o.claimed === true,
        };
      };
      return { daily: one(all.daily), weekly: one(all.weekly) };
    })(),
    guildExp: num(p.guildExp, 0),
    guildJoinedAt: Math.max(0, Math.floor(num(p.guildJoinedAt, 0))),
    guildCheck: (() => {
      const c = bag(p.guildCheck);
      return { dayKey: str(c.dayKey, ''), total: Math.max(0, Math.floor(num(c.total, 0))) };
    })(),
    /** 정산 기록 — 표시 전용이라 한 줄이라도 이상하면 그냥 버린다 */
    raidLog: arr<Record<string, unknown>>(p.raidLog, [])
      .filter((x) => !!x && typeof x === 'object')
      .slice(0, RAID_LOG_MAX)
      .filter((x) => (RAIDS as readonly string[]).includes(str(x.id, '')))
      .map((x) => ({
        id: str(x.id, 'daily') as GameState['raidLog'][number]['id'],
        periodKey: str(x.periodKey, ''),
        at: num(x.at, 0),
        damage: Math.max(0, num(x.damage, 0)),
        money: Math.max(0, num(x.money, 0)),
        gp: Math.max(0, num(x.gp, 0)),
        exp: Math.max(0, num(x.exp, 0)),
        killed: x.killed === true,
      })),
    raidSettled: (() => {
      const o = bag(p.raidSettled);
      return { daily: str(o.daily, ''), weekly: str(o.weekly, '') };
    })(),
    guildBoss: (() => {
      const b2 = bag(p.guildBoss);
      return {
        weekKey: str(b2.weekKey, ''), damage: num(b2.damage, 0), tries: num(b2.tries, 0),
        dayKey: str(b2.dayKey, ''), today: num(b2.today, 0), claimed: b2.claimed === true,
      };
    })(),
    dividendDay: str(p.dividendDay, ''),

    titleTrack: (() => {
      const t = bag(p.titleTrack);
      const b = base.titleTrack;
      return {
        engraves: num(t.engraves, b.engraves),
        bestRuneRank: num(t.bestRuneRank, b.bestRuneRank),
        tower50: num(t.tower50, b.tower50),
        kujiA: t.kujiA === true,
        nightVisits: num(t.nightVisits, b.nightVisits),
        nightDayKey: str(t.nightDayKey, b.nightDayKey),
        tradesDayKey: str(t.tradesDayKey, b.tradesDayKey),
        tradesToday: num(t.tradesToday, b.tradesToday),
        signupNo: num(t.signupNo, b.signupNo),
      };
    })(),

    /* 주식장 폐쇄 — 정산했음을 남긴다. 다시 들어와도 두 번 주지 않는다 */
    marketClosed: MARKET_CLOSE_SEQ,
    /*
      은행 폐쇄 — 담보를 돌려줬음을 남긴다.
      ⚠ 이 세대를 안 남기면 켤 때마다 담보가 창고에 하나씩 복제된다.
    */
    bankClosed: BANK_CLOSE_SEQ,
    /* 돌려받은 담보 개수. 화면이 한 번 알리고 0 으로 지운다 */
    bankReturned: freedCollateral.length,
    /* 돌려받은 금액. 화면이 한 번 알리고 지운다 (0 이면 알릴 것이 없다) */
    marketPayout: payout > 0 ? payout : null,

    // 맵·배열
    creatures: fixCreatures(p.creatures),
    rushH2H: numOnlyMap(p.rushH2H),
    rushBet: fixRushBet(p.rushBet),
    rushSettled: arr<number>(p.rushSettled, []).filter((x) => Number.isFinite(x)),
    inventory,
    // 가진 물건은 도감에 있어야 한다. 시작 장비 11부위가 도감에 안 올라가던
    // 시절의 저장본을 여기서 메운다 (initial.starterCollection 참고).
    collection: withOwned(
      arr<string>(p.collection, base.collection).filter((x) => typeof x === 'string'),
      equipped, inventory,
    ),
    titles: arr(p.titles, []),
    history: arr(p.history, []),
    questsDone: arr<string>(p.questsDone, []),

    // 저장하지 않는 값
    toasts: [],
    // 지난 실행의 배팅 결과 팝업이 다시 뜨면 안 된다
    rushResult: null,
    lotteryResult: null,
    // 문자열 3개가 온전한 항목만 살린다
    rushLog: (Array.isArray(p.rushLog) ? p.rushLog : [])
      .map((e) => bag(e))
      .filter((e) => typeof e.a === 'string' && typeof e.b === 'string' && typeof e.winner === 'string')
      .map((e) => ({
        slot: Math.max(0, Math.floor(num(e.slot, 0))),
        a: String(e.a), b: String(e.b), winner: String(e.winner),
      }))
      .slice(-10),
    stones: numMap(base.stones, p.stones),
    // 계정은 provider 가 온전할 때만 살린다 (반쪽 계정이면 로그인 화면으로 돌아간다)
    account: (() => {
      const a = bag(p.account);
      const prov = str(a.provider, '');
      if (prov !== 'google' && prov !== 'guest') return null;
      return { provider: prov, id: str(a.id, ''), email: str(a.email, '') || undefined };
    })(),
    signedUp: p.signedUp === true,
    cashItems: numMap(base.cashItems, p.cashItems),
    nicknameChangedAt: Math.max(0, Math.floor(num(p.nicknameChangedAt, 0))),
    guildApplyReason: str(p.guildApplyReason, '').slice(0, 100),
    rushEpoch: Math.max(0, Math.floor(num(p.rushEpoch, base.rushEpoch))),

    // 온보딩 — 없던 필드다. 저장본에 없으면 "아직 아무것도 안 봤다" 로 시작한다
    eventPopupHideUntil: Math.max(0, num(p.eventPopupHideUntil, 0)),
    tutorialSeen: arr<unknown>(p.tutorialSeen, []).filter((k): k is string => typeof k === 'string'),
    tutorialOff: p.tutorialOff === true,
    // ⚠ `=== true` 로 쓰면 안 된다 — 저장본에 없는 사람 전원이 음소거로 시작한다
    guidesSeen: arr<unknown>(p.guidesSeen, [])
      .filter((v): v is string => typeof v === 'string'),
    /* 알림 대기열 — 성한 줄만 살린다. 못 보여 줘도 칭호 자체는 titles 에 남아 있다 */
    titleQueue: arr<unknown>(p.titleQueue, [])
      .map((e) => bag(e))
      .filter((e) => typeof e.id === 'string')
      .map((e) => ({
        id: e.id as string,
        avatar: typeof e.avatar === 'string' && isAvatarId(e.avatar) ? e.avatar : null,
      })) as unknown as GameState['titleQueue'],
    dust: Math.max(0, Math.floor(num(p.dust, 0))),
    sfxOn: p.sfxOn !== false,
    bgmOn: p.bgmOn !== false,
    // 음량은 0~1 밖으로 나가면 안 된다 — 저장본이 망가졌으면 최대로 되돌린다
    sfxVol: Math.max(0, Math.min(1, num(p.sfxVol, 1))),
    bgmVol: Math.max(0, Math.min(1, num(p.bgmVol, 1))),
  };
}

/** 진행 중 배팅 — 네 필드가 다 성립해야 살린다 */
function fixRushBet(got: unknown): GameState['rushBet'] {
  const g = bag(got);
  const slot = num(g.slot, -1);
  const amount = num(g.amount, 0);
  const odds = num(g.odds, 0);
  if (slot < 0 || amount <= 0 || odds <= 0 || typeof g.on !== 'string') return null;
  return { slot, on: g.on, amount, odds };
}

/**
 * 장비 한 점 정리.
 *
 * `alch` 는 아이템레벨에 **곱해지므로** 저장본을 그대로 믿으면 999배짜리 장비가 들어온다.
 * 밴드 밖 값은 통째로 버린다 (없는 게 이상한 값보다 낫다).
 */
/** 저장된 도감에 실제로 가진 장비를 합친다 */
function withOwned(
  registered: string[],
  equipped: GameState['equipped'],
  inventory: GameState['inventory'],
): string[] {
  const out = new Set(registered);
  const own = [...SLOT_IDS.map((slot) => equipped[slot]), ...inventory];
  for (const it of own) if (it) out.add(entryKey(it.kind, it.tier));
  return [...out];
}

/**
 * 채집물 재고.
 *
 * 예전 저장본은 활동+등급으로만 셌다 (`{ hunt: { F: 3 } }`) — 무엇을 잡았는지가
 * 없다. 버리면 남의 창고를 비우는 셈이라, **그 등급의 대표 종으로 환산해** 옮긴다.
 * 개수도 값어치도 그대로 보존된다.
 */
function fixBag(got: unknown): GatherBag {
  const src = bag(got);
  const out: GatherBag = {};
  const add = (id: string, n: number) => {
    if (n > 0) out[id] = (out[id] ?? 0) + Math.floor(n);
  };

  // 새 형식 — 종 id → 개수
  for (const [k, v] of Object.entries(src)) {
    if (k in SPECIES_BY_ID) add(k, num(v, 0));
  }

  // 옛 형식 — 활동 › 등급 › 개수
  for (const a of ACTIVITIES) {
    const m = bag(src[a]);
    for (const gr of GATHER_GRADES) {
      const n = num(m[gr], 0);
      if (n <= 0) continue;
      // 그 등급에 종이 없으면 catchOne 과 같은 규칙으로 한 칸씩 내려간다
      for (let i = GATHER_GRADES.indexOf(gr); i >= 0; i--) {
        const pool = candidates(a, GATHER_GRADES[i]);
        if (pool.length) { add(pool[0].id, n); break; }
      }
    }
  }
  return out;
}

function fixItem(v: unknown): unknown {
  if (!isObj(v)) return null;
  const it = v as Record<string, unknown>;
  if (typeof it.id !== 'string' || typeof it.kind !== 'string') return null;
  const out: Record<string, unknown> = {
    id: it.id,
    kind: it.kind,
    tier: Math.max(1, Math.min(ARTISAN_TIER, Math.floor(num(it.tier, 1)))),
    level: Math.max(0, Math.floor(num(it.level, 0))),
    dur: Math.max(0, Math.min(100, num(it.dur, 100))),
  };
  const sp = bag(it.spirit);
  if (typeof sp.grade === 'string' && typeof sp.trait === 'string') {
    out.spirit = { grade: sp.grade, trait: sp.trait };
  }
  const alch = num(it.alch, 0);
  if (alch >= ALCH_MIN_MUL && alch <= ALCH_MAX_MUL) out.alch = alch;
  const freed = num(it.freed, 0);
  if (freed > 0) out.freed = Math.min(MAX_FREED, Math.floor(freed));
  return out;
}

/**
 * 착용 장비 — **옛 슬롯 이름을 새 이름으로 옮긴다.**
 *
 * 슬롯이 16 → 13 칸으로 줄었다 (좌우 짝을 없앴다, core/types 참고).
 * 저장본은 아직 `bootL`·`ringR` 같은 이름을 들고 있으므로 여기서 갈아 끼운다.
 *
 * 갈 곳이 없는 짝(오른쪽 견갑·장갑·신발)은 **버리지 않고 두 번째 결과값으로
 * 넘긴다** — 값을 치르고 강화까지 해 둔 물건이라 조용히 없애면 안 된다.
 * 부르는 쪽이 창고에 넣는다.
 */
function fixEquipped(
  v: unknown,
  fallback: GameState['equipped'],
): { equipped: GameState['equipped']; spilled: NonNullable<ReturnType<typeof fixItem>>[] } {
  if (!isObj(v)) return { equipped: fallback, spilled: [] };
  const out: Record<string, unknown> = {};
  const spilled: NonNullable<ReturnType<typeof fixItem>>[] = [];

  for (const [slot, item] of Object.entries(v as Record<string, unknown>)) {
    const fixed = fixItem(item);
    if (!fixed) continue;

    /* 아직 쓰는 이름이면 그대로 */
    if ((SLOT_IDS as readonly string[]).includes(slot)) {
      if (out[slot]) spilled.push(fixed);
      else out[slot] = fixed;
      continue;
    }

    /* 옛 이름 → 새 이름. 갈 곳이 없으면(오른쪽 짝) 창고로 */
    const to = slot in LEGACY_SLOT ? LEGACY_SLOT[slot] : undefined;
    if (to && !out[to]) out[to] = fixed;
    else spilled.push(fixed);
  }
  return { equipped: out as GameState['equipped'], spilled };
}

function numStrDraw(got: unknown) {
  const g = bag(got);
  return {
    dayKey: str(g.dayKey, ''),
    today: num(g.today, 0),
    cycleKey: str(g.cycleKey, ''),
    inCycle: num(g.inCycle, 0),
  };
}

/** 키가 자유로운 숫자 맵 (상대전적) — 유한한 숫자만 남긴다 */
function numOnlyMap(got: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(bag(got))) {
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
  }
  return out;
}
