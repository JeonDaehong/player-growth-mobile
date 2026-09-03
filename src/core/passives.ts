/**
 * 패시브 — **아무것도 안 눌러도 늘 켜져 있는 것.**
 *
 * 캐릭터마다 하나씩이고, 파티에 **서 있고 살아 있는 동안만** 값을 한다.
 * 쓰러지면 그 자리에서 꺼진다 — 그래서 사제가 죽으면 파티 전체의 화력이
 * 같이 떨어진다.
 *
 * ## 왜 여기가 따로 있나
 *
 * 스탯은 `core/chars` 가, 걸렸다 풀리는 것은 `core/status` 가, 파티 자리는
 * `core/party` 가 안다. 패시브는 **셋을 다 봐야** 계산된다 — 누가 서 있는지,
 * 지금 무엇이 걸려 있는지, 원래 수치가 얼마인지.
 *
 * 그 셋 중 아무 데나 넣으면 그 파일이 나머지 둘을 물게 되어 순환이 생긴다
 * (`core/party` 는 이미 `core/chars` 를 문다). 여기는 **세 파일을 물지만
 * 아무도 여기를 안 무는** 자리다 — 전투(`core/autoBattle`)와 화면만 부른다.
 *
 * ## 실제 수치는 여기 한 곳에서만 나온다
 *
 * `liveAtk` · `liveSpd` · `liveArmor` 셋이 창구다. 전투 계산과 화면이 **같은
 * 함수**를 부른다 — 따로 세면 화면에 뜬 공격속도와 실제로 휘두르는 박자가
 * 갈리고, 그건 눈으로 잡을 수 없는 종류의 어긋남이다.
 */
import {
  Armor, CharId, OwnedChar, statOf,
} from './chars';
import {
  BLINK_MS, GOOD, Hex, STATUS_ALT, STATUS_NAME, STATUS_WHAT, StatusId,
  dying, mulOf, upOf,
} from './status';

/**
 * 패시브 하나.
 *
 * 넷이 서로 **다른 축**을 건드린다 — 아군 공격력 · 아군 공격속도 · 자기 회복 ·
 * 자기 공격속도. 같은 축을 둘이 건드리면 둘 중 하나를 넣을 이유가 사라진다.
 */
export interface PassiveDef {
  /** 화면에 뜨는 이름 */
  name: string;
  /** 캐릭터 창에 그대로 적는 한 줄 */
  text: string;
  /**
   * 머리 위에 뜨는 **한 마디** (`core/status` 의 `STATUS_WHAT` 과 짝).
   *
   * `text` 를 그대로 쓸 수가 없다 — 저건 캐릭터 창에서 읽는 설명이라
   * 조건과 수치가 다 들어 있어서(`체력이 낮을수록 공격속도 증가 (체력
   * 10%에서 1.5배)`) 인물 하나 폭에 안 들어간다.
   */
  short: string;
  /**
   * 이 사람이 서 있으면 **파티 전원**의 공격력에 더해지는 비율.
   *
   * 자기 자신도 받는다. 본인만 빼면 화면에 적힌 전투력과 실제로 들어가는
   * 피해가 갈린다.
   */
  allyAtk?: number;
  /** 이 사람이 서 있으면 **파티 전원**의 공격속도에 더해지는 값 (초당 횟수) */
  allySpd?: number;
  /**
   * 스스로 1초에 채우는 양 — **최대 체력의 비율.**
   *
   * ## 고정값이었다 (초당 2)
   *
   * 처음에는 그냥 2 였다. 이졸데의 체력이 340 이라 초당 0.6% 였는데, 강화를
   * 올려 체력이 1,500 이 되면 0.13% 가 된다 — 키울수록 패시브가 쓸모없어졌다.
   * 우두머리 한 대가 200 을 깎는 판에서 초당 2 는 없는 것과 같다.
   *
   * 비율이면 **키운 만큼 같이 자란다.** 초당 1% 는 100초에 한 번 완전
   * 회복이라, 맞고 있는 동안에는 여전히 밀리지만 잡몹 사이의 빈 시간에
   * 혼자 일어선다 — 그게 이 패시브가 하려던 일이다.
   */
  regenPct?: number;
  /**
   * 체력이 낮을수록 빨라진다.
   *
   * `at` 까지 내려가면 `mul` 배가 되고, 그 아래로는 더 안 오른다. 가득 차
   * 있을 때가 1배다.
   */
  frenzy?: { at: number; mul: number };
  /**
   * 캐릭터 창에 뜨는 **제 로고** (`assets/sprites/passive_icon/`).
   *
   * 사람마다 하나다. 한동안 상태 로고를 빌려 썼는데
   * (`docs/PASSIVE_ICON_PROMPTS.md` 에 이유를 적어 뒀다) 그러면 비앙카와
   * 리안느가 같은 그림이 되어 넷을 나란히 놓았을 때 둘이 한 사람으로 보였다.
   */
  art: string;
  /**
   * **전투 중에** 뜨는 상태 로고. 없으면 안 뜬다 (`core/status` 의 `StatusId`).
   *
   * 위의 `art` 와 다른 것이다. 저건 "이 사람은 어떤 사람인가" 이고 이건
   * "지금 이 사람에게 무슨 일이 일어나고 있나" 다 — 비앙카가 다쳐서
   * 빨라지고 있을 때 파티 칸에 뜨는 신속은, 원인이 패시브든 우두머리
   * 기술이든 같은 사실이라 같은 그림이어야 한다.
   */
  icon?: StatusId;
}

/**
 * 넷의 패시브.
 *
 * ## 보조 역할 보너스를 이걸로 갈아 끼웠다
 *
 * 예전에는 **역할**이 파티 공격력을 올렸다 (보조 한 명당 12%). 그러면 누가
 * 서 있든 역할만 맞으면 같은 값이라, 새 보조를 만들 때마다 "또 12%" 가 된다.
 *
 * 이제 그 12% 는 사라지고 **아녜스 한 사람의 패시브 10%** 가 그 자리에 있다.
 * 파티에 아녜스가 있으면 전원이 세지고, 아녜스가 쓰러지면 그 순간 꺼진다 —
 * 같은 숫자라도 "역할을 채웠다" 보다 "이 사람이 살아 있다" 가 화면에서 훨씬
 * 잘 읽힌다.
 */
export const PASSIVES: Partial<Record<CharId, PassiveDef>> = {
  /*
    앞에 서서 안 비키는 사람이라, 패시브도 **버티는 쪽**이다.

    초당 1% 는 작아 보이지만 이 게임에는 저절로 차는 체력이 아예 없다
    (`core/autoBattle` 머리말). 유일한 회복이 사제의 기도였고, 사제가 없거나
    죽으면 파티는 깎이기만 했다. 이졸데는 그 상황에서도 **혼자서는** 버틴다.
  */
  knightgirl: {
    name: '불굴의 맹세',
    text: '1초마다 최대 체력의 1% 회복',
    short: '지속 회복',
    regenPct: 0.01,
    art: 'pv_oath',
    icon: 'st_regen',
  },

  /*
    다칠수록 세지는 쪽.

    체력이 넷 중 두 번째로 낮은 사람에게 준 것이 핵심이다 — 잘 죽는 사람이
    죽기 직전에 제일 세지므로, 살릴지 밀어붙일지가 매 판 갈린다. 이졸데(안
    죽는다)에게 줬으면 그냥 공짜 공격속도였다.

    10% 에서 1.5배다. 그 아래로는 더 안 오른다 — 0 에 가까울수록 무한히
    빨라지면 마지막 한 칸에서 갑자기 딴 게임이 된다.
  */
  bunnyaxe: {
    name: '최후의 한 곡',
    text: '체력이 낮을수록 공격속도 증가 (체력 10%에서 1.5배)',
    short: '공격속도 증가',
    frenzy: { at: 0.10, mul: 1.5 },
    art: 'pv_encore',
    icon: 'st_haste',
  },

  /*
    파티 전원의 공격속도 +0.1.

    **배수가 아니라 덧셈이다.** 배수면 원래 빠른 사람(리안느 1.1)이 제일 많이
    받아서, 활잡이를 넣는 이유가 활잡이 자신이 된다. 덧셈이면 느린 사람일수록
    비율로는 많이 받는다 — 아녜스(0.5)는 20% 가 오르고 리안느 본인은 9% 다.
  */
  elfarcher: {
    name: '숲의 박자',
    text: '아군 전체 공격속도 +0.1',
    short: '공격속도 증가',
    allySpd: 0.1,
    art: 'pv_tempo',
    icon: 'st_haste',
  },

  /*
    파티 전원의 공격력 +10%.

    혼자서는 아무것도 못 하는 사람의 존재 이유다. 공격력이 넷 중 제일 낮고
    (10) 기술은 적을 아예 안 때리는데, 이 한 줄 때문에 한 자리를 쓴다.
  */
  nun: {
    name: '재의 축복',
    text: '아군 전체 공격력 +10%',
    short: '공격력 증가',
    allyAtk: 0.10,
    art: 'pv_ash',
    icon: 'st_rage',
  },
};

export const passiveOf = (id: string): PassiveDef | null =>
  PASSIVES[id as CharId] ?? null;

/**
 * 지금 서 있는 사람들이 만들어 내는 **파티 전체 공격력 배수**.
 *
 * @param alive 살아 있는 파티원들. 쓰러진 사람은 빼고 넘긴다
 */
export function allyAtkMul(alive: readonly OwnedChar[]): number {
  let out = 1;
  for (const c of alive) out += passiveOf(c.id)?.allyAtk ?? 0;
  return out;
}

/** 파티 전체 공격속도에 더해지는 값 */
export function allySpdAdd(alive: readonly OwnedChar[]): number {
  let out = 0;
  for (const c of alive) out += passiveOf(c.id)?.allySpd ?? 0;
  return out;
}

/** 이 사람이 1초에 스스로 채우는 **비율** (0 이면 그런 패시브가 없다) */
export const regenPctOf = (id: string): number => passiveOf(id)?.regenPct ?? 0;

/**
 * 이 사람이 1초에 스스로 채우는 **양.**
 *
 * 비율에 제 최대 체력을 곱한다. 최소 1 이다 — 반올림해서 0 이 되면 패시브가
 * 켜져 있는데 아무 일도 안 일어난다.
 */
export function regenOf(c: OwnedChar): number {
  const pct = regenPctOf(c.id);
  return pct > 0 ? Math.max(1, statOf(c).hp * pct) : 0;
}

/**
 * 다칠수록 빨라지는 배수. 그런 패시브가 없으면 늘 1.
 *
 * 가득 차 있으면 1배, `at` 아래로는 `mul` 배에서 멈춘다. 그 사이는 곧게
 * 이어진다 — 구간을 나누면 어느 칸에서 갑자기 빨라지는 것으로 보인다.
 */
export function frenzyMul(id: string, cur: number, max: number): number {
  const p = passiveOf(id)?.frenzy;
  if (!p || max <= 0) return 1;
  const r = Math.max(0, Math.min(1, cur / max));
  /* 가득(1) → 0, `at` 이하 → 1 */
  const t = Math.max(0, Math.min(1, (1 - r) / Math.max(0.01, 1 - p.at)));
  return 1 + (p.mul - 1) * t;
}

/**
 * 이 배수부터 로고를 띄운다.
 *
 * 한 대만 맞아도 배수는 1 을 넘는다. 그걸 그대로 띄우면 로고가 사실상 늘
 * 켜져 있어서, 파티 칸에서 **아무것도 안 알려 주면서 자리만 차지**한다
 * (`core/status` 머리말과 같은 이유).
 *
 * 10% 부터다. 체력 82% 쯤인데, 거기서부터는 실제로 눈에 띄게 빨라진다.
 */
export const FRENZY_SHOW = 1.10;

/**
 * 버프를 주던 사람이 쓰러진 뒤 **그 버프가 남아 있는 시간** (ms).
 *
 * ## 왜 그 자리에서 안 끄나
 *
 * 아녜스가 죽는 순간 넷의 공격력이 10% 떨어지는데, 예전에는 화면에서 그
 * 일이 **아무 표시 없이** 일어났다. 로고 네 개가 한 프레임에 사라지므로
 * 눈으로 좇을 수가 없고, 사라진 뒤에는 원래 없었던 것과 구분이 안 된다.
 *
 * 2초를 더 살려 두고 그동안 **깜빡인다** (`core/status` 의 `BLINK_MS`).
 * 네 번 깜빡이는 동안 "아녜스가 죽었고, 곧 이 버프가 없어진다" 가 읽힌다.
 *
 * 값을 `BLINK_MS` 와 같게 두는 것이 중요하다. 깜빡이는 동안에도 버프가
 * 실제로 걸려 있어야 로고가 거짓말을 안 한다 — 깜빡임이 끝나는 순간과
 * 효과가 꺼지는 순간이 같은 순간이다.
 */
export const FADE_MS = BLINK_MS;

/**
 * 쓰러졌지만 아직 버프가 남아 있나 (`FADE_MS`).
 *
 * @param fade 사람별 남은 시간 (ms). `BattleState.fade`
 */
export const fadingOut = (
  fade: Record<string, number> | undefined, who: string,
): boolean => (fade?.[who] ?? 0) > 0;

/**
 * 지금 이 사람의 **실제 공격력**.
 *
 * 원래 공격력 × 파티 배수 × 약화.
 *
 * 순서가 중요하다. 약화를 제일 마지막에 곱해야 "파티 버프까지 포함해서 25%
 * 가 깎인다" 가 되고, 그게 사양이 말하는 감소다.
 */
export function liveAtk(
  c: OwnedChar, alive: readonly OwnedChar[], hex: readonly Hex[],
): number {
  return statOf(c).atk * allyAtkMul(alive) * mulOf(hex, 'st_weak');
}

/**
 * 지금 이 사람의 **실제 공격속도** (초당 횟수).
 *
 *   (원래 + 아군 보너스) × 다칠수록 빨라지는 배수 × 둔화 × 신속
 *
 * 아군 보너스가 **덧셈이라 제일 먼저** 들어간다. 나중에 더하면 둔화가 그
 * 보너스를 안 깎아서, 둔화에 걸린 채로도 원래보다 빠른 일이 생긴다.
 *
 * 0 아래로는 안 내려간다 — `swingMs` 가 0 을 받으면 나눗셈이 무한대가 되고,
 * 그 사람은 영영 안 휘두른다.
 */
export function liveSpd(
  c: OwnedChar,
  cur: number,
  alive: readonly OwnedChar[],
  hex: readonly Hex[],
): number {
  const base = statOf(c).spd + allySpdAdd(alive);
  /*
    셋이 다 곱해진다 — 다칠수록 빨라지는 것(비앙카), 둔화, 신속.

    신속은 **올려 주는 쪽**이라 `upOf` 로 읽는다 (`core/status`). 리안느의
    광란이 거는 2배가 여기 들어온다. 둔화에 걸린 채로 광란을 쓰면 1.8 배가
    되는데, 그게 맞다 — 둘 다 실제로 걸려 있다.
  */
  const mul = frenzyMul(c.id, cur, statOf(c).hp)
    * mulOf(hex, 'st_slow') * upOf(hex, 'st_haste');
  return Math.max(0.05, base * mul);
}

/**
 * 지금 이 사람의 **실제 방어 두 겹**.
 *
 * 파쇄(`st_break`)가 걸려 있으면 그만큼 깎인다. 15판 우두머리의 오라는
 * 배수 0 이라 **통째로 0** 이 된다 — 사양이 "방어력을 0으로 만들고" 다.
 *
 * 마법저항력도 같이 깎는다. 사양의 문구는 "방어력" 이지만, 이 게임에서
 * 방어와 마저는 같은 뺄셈의 두 겹이라(`core/chars` 의 `Armor`) 한쪽만
 * 깎으면 물리 우두머리 앞에서만 아프고 마법 우두머리 앞에서는 아무 일도
 * 안 일어난다.
 */
export function liveArmor(c: OwnedChar, hex: readonly Hex[]): Armor {
  const s = statOf(c);
  const m = mulOf(hex, 'st_break');
  if (m >= 1) return { def: s.def, res: s.res };
  return { def: Math.floor(s.def * m), res: Math.floor(s.res * m) };
}

/** 받는 치유량 배수 — 시듦(`st_wither`)이 걸려 있으면 줄어든다 */
export const healMulOf = (hex: readonly Hex[]): number => mulOf(hex, 'st_wither');

/**
 * 로고 줄에 뜨는 칸 하나 (`screens/home/StatusRow`).
 *
 * **세트를 같이 들고 다닌다.** 예전에는 `StatusId` 만 돌려주고 화면이
 * `status_icon` 으로 못 박아 그렸는데, 패시브가 제 로고를 갖게 되면서
 * (`passive_icon`) 한 줄에 두 세트가 섞이게 됐다.
 */
export interface Mark {
  /** 어느 스프라이트 폴더에서 (`assets/sprites/`) */
  set: 'status_icon' | 'passive_icon';
  /** 그 안의 칸 이름 */
  name: string;
  /** 좋은 것인가 — 화면이 이걸로 차례를 가른다 */
  good: boolean;
  /** 사람이 읽는 이름 — 캐릭터 창과 검사에서 쓴다 */
  label: string;
  /**
   * **무슨 일이 일어나는가** 한 마디 (`core/status` 의 `STATUS_WHAT`).
   *
   * 걸리는 순간 머리 위에 뜨는 글이 이것이다 (`screens/home/Fighter`).
   * 이름(`label`)이 아니라 효과인 이유는, 로고를 외운 사람만 읽을 수 있는
   * 표시를 하나 더 만들어 봐야 소용이 없기 때문이다.
   */
  what: string;
  /**
   * 이제 곧 꺼지나 — 화면이 이 칸을 깜빡인다 (`screens/home/StatusRow`).
   *
   * 두 경우에 켜진다. 걸린 것이 `BLINK_MS` 안에 풀릴 때, 그리고 버프를 주던
   * 사람이 쓰러져 그 버프가 사그라드는 중일 때 (`FADE_MS`). 둘 다 뜻이
   * 같으므로 화면에서도 같아야 한다 — **곧 없어진다.**
   */
  blink: boolean;
  /**
   * **그림이 아직 없을 때 대신 쓸 칸** (`core/status` 의 `STATUS_ALT`).
   *
   * 낱말이 그림보다 먼저 들어오는 일이 있다 — 감전(`st_shock`)이 지금
   * 그렇다. 빈 칸으로 두면 파티 칸에 테두리만 남은 빈 상자가 뜨는데, 그건
   * "무언가 걸렸다" 는 말조차 못 한다.
   *
   * 그림이 들어오면 표에서 그 줄만 지우면 된다 — 여기도 화면도 안 고친다.
   */
  alt?: string;
}

/**
 * 화면에 뜨는 것들 — **지금 이 사람에게 실제로 일어나고 있는 일.**
 *
 * ## 패시브가 거는 것은 패시브 로고로 뜬다
 *
 * 한동안 상태 로고를 빌려 썼다 (아녜스 → 격노, 리안느 → 신속). 규칙이
 * 실제로 그거라 틀린 표시는 아니었는데, **누가 주고 있는지**가 사라졌다 —
 * 리안느와 비앙카가 둘 다 신속이라 넷의 칸이 다 똑같아 보였다.
 *
 * 이제 패시브가 거는 것은 그 패시브의 제 로고로 뜬다
 * (`docs/PASSIVE_ICON_PROMPTS.md`). 아녜스가 쓰러지면 네 칸에서 `pv_ash` 가
 * 한꺼번에 사라지고, 그게 곧 "화력이 떨어졌다" 는 신호가 된다.
 *
 * 우두머리가 거는 것은 그대로 상태 로고다 — 저건 원인이 여럿이라 (중독을
 * 거는 우두머리가 여섯이다) 원인마다 그림을 두면 열두 가지가 서른 가지가
 * 된다. 상태 로고는 **무슨 일이 일어나는가**를, 패시브 로고는 **누가
 * 그러고 있는가**를 말한다.
 *
 * ## 누구에게 뜨나
 *
 *   아군 전체 패시브 (아녜스 · 리안느)  살아 있는 모두에게
 *   제 몸 패시브 (이졸데 · 비앙카)      그 사람에게만
 *
 * 비앙카의 것은 조건이 붙어 있어(체력이 낮을 때만) 실제로 켜졌다 꺼진다 —
 * 그 순간이 곧 "지금 위험하지만 제일 세다" 다 (`FRENZY_SHOW`).
 *
 * @param alive 지금 살아 있는 파티원들. 쓰러진 사람의 패시브는 안 걸린다
 */
export function marksOf(
  who: string,
  cur: number,
  max: number,
  hex: readonly Hex[],
  alive: readonly OwnedChar[] = [],
  /**
   * 쓰러졌지만 버프가 아직 사그라드는 중인 사람들 (`BattleState.fade`).
   *
   * 여기 들어 있는 사람의 버프는 **깜빡이면서** 뜬다. 안 주면 아무도 안
   * 깜빡인다 — 화면 밖(캐릭터 창 미리보기 같은 곳)에서는 판이 안 돌아가므로
   * 사그라들 것도 없다.
   */
  fade?: Record<string, number>,
): readonly Mark[] {
  /* 쓰러진 사람에게는 아무것도 안 뜬다 — 시체에 붙은 버프는 거짓말이다 */
  if (cur <= 0) return NO_MARK;

  const good: Mark[] = [];
  const mark = (p: PassiveDef, blink: boolean): Mark => ({
    set: 'passive_icon', name: p.art, good: true,
    label: p.name, what: p.short, blink,
  });

  /* 제 것이 먼저 — 이 칸은 이 사람의 칸이다 */
  const mine = passiveOf(who);
  if (mine?.regenPct) good.push(mark(mine, false));
  if (mine?.frenzy && frenzyMul(who, cur, max) >= FRENZY_SHOW) good.push(mark(mine, false));

  /*
    그다음이 남이 주는 것 — 파티 자리 순서라 매번 같은 차례로 뜬다.

    `alive` 에는 **쓰러졌지만 아직 사그라드는 중인 사람**도 들어 있다
    (`core/party` 의 `livingMembers`). 그 사람이 주는 버프는 깜빡인다.
  */
  for (const c of alive) {
    const p = passiveOf(c.id);
    if (!p || !(p.allyAtk || p.allySpd)) continue;
    good.push(mark(p, fadingOut(fade, c.id)));
  }

  const bad: Mark[] = hex
    .filter((h) => h.ms > 0)
    .map((h) => ({
      set: 'status_icon' as const,
      name: h.id,
      /*
        **걸린 것도 좋은 것일 수 있다.** 리안느의 광란이 거는 신속이 그렇다
        — 기술이 건 것이라 상태 로고로 뜨지만, 나쁜 것이 아니다.
      */
      good: GOOD.has(h.id),
      label: STATUS_NAME[h.id],
      what: STATUS_WHAT[h.id],
      /* 풀리기 2초 전부터 깜빡인다 — 언제 풀렸는지 알 수 있게 */
      blink: dying(h.ms),
      alt: STATUS_ALT[h.id],
    }));

  const all = [...good, ...bad.filter((m) => m.good), ...bad.filter((m) => !m.good)];
  if (!all.length) return NO_MARK;
  return all;
}

/**
 * **적** 머리 위에 뜨는 것들.
 *
 * 아군 쪽(`marksOf`)보다 훨씬 단순하다 — 적에게는 패시브가 없으므로 전부
 * 상태 로고이고, 좋은 것도 없다 (걸리는 것이 다 아군이 건 것이다).
 *
 * ## 왜 적에게도 띄우나
 *
 * 비앙카의 화산이 5초 동안 회복을 반으로 깎는데, 그게 화면 어디에도 안 나오면
 * **걸렸는지 안 걸렸는지 알 수가 없다.** 우두머리가 회복하는 순간에 숫자가
 * 작아지는 것으로 짐작하는 수밖에 없는데, 그건 두 판을 비교해야 보인다.
 *
 * 도발도 여기 뜬다. 그건 적 하나하나에 걸린 것이 아니라 판 전체에 걸린
 * 것이지만 (`BattleState.taunt`), 보는 사람 입장에서는 "저놈들이 지금 이졸데만
 * 노린다" 라서 적 머리 위가 맞는 자리다.
 *
 * @param taunted 지금 도발에 걸려 있나 (`BattleState.taunt`)
 */
export function foeMarksOf(
  hex: readonly Hex[], taunted: boolean, tauntMs = 0,
): readonly Mark[] {
  const out: Mark[] = [];
  if (taunted) {
    out.push({
      set: 'status_icon', name: 'st_taunt', good: false,
      label: STATUS_NAME.st_taunt, what: STATUS_WHAT.st_taunt,
      blink: dying(tauntMs),
      alt: STATUS_ALT.st_taunt,
    });
  }
  for (const h of hex) {
    if (h.ms <= 0) continue;
    out.push({
      set: 'status_icon', name: h.id, good: GOOD.has(h.id),
      label: STATUS_NAME[h.id], what: STATUS_WHAT[h.id],
      blink: dying(h.ms),
      alt: STATUS_ALT[h.id],
    });
  }
  return out.length ? out : NO_MARK;
}

/** 아무것도 안 걸린 상태 — 매번 새 배열을 만들면 화면이 계속 다시 그려진다 */
export const NO_MARK: readonly Mark[] = [];

/**
 * 원래 값 옆에 붙는 **차이** — `10 (+2)` 의 괄호 안.
 *
 * 같으면 빈 문자열이다. 0 을 적으면 안 걸린 것과 걸렸는데 상쇄된 것이
 * 구분은 되지만, 넷의 여섯 줄에 `(+0)` 이 붙어 있으면 정작 실제로 바뀐
 * 줄이 안 보인다 — 화면에서 눈에 띄어야 하는 것은 **달라진 것**이다.
 *
 * 부호를 늘 적는다. `(2)` 는 오른 건지 내린 건지 알 수 없다.
 *
 * @param dec 소수 몇 자리까지. 공격속도만 1 이고 나머지는 0 이다
 */
export function deltaText(base: number, now: number, dec = 0): string {
  const d = now - base;
  /* 반올림해서 0 이 되면 안 적는다 — 화면에 안 보이는 차이다 */
  const shown = Number(d.toFixed(dec));
  if (!shown) return '';
  return ` (${shown > 0 ? '+' : ''}${shown.toFixed(dec)})`;
}
