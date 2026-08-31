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
import { Hex, StatusId, mulOf } from './status';

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
   * 이 사람이 서 있으면 **파티 전원**의 공격력에 더해지는 비율.
   *
   * 자기 자신도 받는다. 본인만 빼면 화면에 적힌 전투력과 실제로 들어가는
   * 피해가 갈린다.
   */
  allyAtk?: number;
  /** 이 사람이 서 있으면 **파티 전원**의 공격속도에 더해지는 값 (초당 횟수) */
  allySpd?: number;
  /** 스스로 1초에 회복하는 양 */
  regen?: number;
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

    초당 2 는 작아 보이지만 이 게임에는 저절로 차는 체력이 아예 없다
    (`core/autoBattle` 머리말). 유일한 회복이 사제의 기도였고, 사제가 없거나
    죽으면 파티는 깎이기만 했다. 이졸데는 그 상황에서도 **혼자서는** 버틴다.
  */
  knightgirl: {
    name: '불굴의 맹세',
    text: '1초마다 체력 2 회복',
    regen: 2,
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

/** 이 사람이 1초에 스스로 채우는 체력 */
export const regenOf = (id: string): number => passiveOf(id)?.regen ?? 0;

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
 *   (원래 + 아군 보너스) × 다칠수록 빨라지는 배수 × 둔화
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
  const mul = frenzyMul(c.id, cur, statOf(c).hp) * mulOf(hex, 'st_slow');
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
 * 화면에 뜨는 것들 — **지금 이 사람에게 실제로 일어나고 있는 일.**
 *
 * ## 늘 켜져 있는 패시브는 안 띄운다
 *
 * 아녜스의 +10% 와 리안느의 +0.1 은 그 사람이 서 있는 내내 켜져 있다. 그걸
 * 로고로 띄우면 네 칸 모두에 격노와 신속이 **판이 끝날 때까지 붙박이로**
 * 앉아서, 정작 우두머리가 건 출혈이 그 뒤로 밀려난다.
 *
 * 파티 구성이 주는 것은 캐릭터 창이 글로 말한다 (`CharPopup` 의 패시브 줄).
 * 이 줄은 **왔다 가는 것**만 맡는다.
 *
 * 비앙카의 것은 예외다. 조건이 붙어 있어서(체력이 낮을 때만) 실제로 켜졌다
 * 꺼지고, 그 순간이 곧 "지금 위험하지만 제일 세다" 라 볼 값이 있다.
 */
export function statusOf(
  who: string,
  cur: number,
  max: number,
  hex: readonly Hex[],
): readonly StatusId[] {
  const bad = hex.filter((h) => h.ms > 0).map((h) => h.id);
  const p = passiveOf(who);
  if (p?.frenzy && p.icon && cur > 0 && frenzyMul(who, cur, max) >= FRENZY_SHOW) {
    return [p.icon, ...bad];
  }
  return bad;
}
