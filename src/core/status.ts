/**
 * 상태 효과 — **한동안 걸려 있다가 풀리는 것.**
 *
 * 출혈 · 중독 · 기절 · 침묵처럼 걸린 사람에게 몇 초씩 붙는 것들이다. 걸린
 * 사람의 파티 칸에 작은 로고로 뜬다 (`screens/home/StatusRow`).
 *
 * ## 이 파일은 낱말만 안다
 *
 * 무엇이 있는지(`StatusId`), 걸린 것 하나가 어떻게 생겼는지(`Hex`), 시간이
 * 흐르면 어떻게 되는지(`tickHex`)까지다. **누가 거는지도, 누구에게 걸리는지도
 * 모른다** — 그건 우두머리 기술(`core/autoBattle`)과 패시브(`core/passives`)
 * 가 안다.
 *
 * 그렇게 갈라 둔 이유는 순환 때문이다. 파티를 알면 `core/party` 를 물어야
 * 하고, 저쪽은 이미 `core/chars` 를 문다 — 낱말 파일이 그 사슬에 끼면 어디서든
 * 못 부르는 파일이 된다. 여기는 아무것도 안 물게 두고(피해 종류 하나뿐),
 * 조립은 위에서 한다.
 *
 * ## 좋고 나쁨은 테두리 색이 말한다
 *
 * 오랫동안 흑백 2색이라 자리로만 갈랐다 — 좋은 것을 왼쪽에, 나쁜 것을
 * 오른쪽에. 그런데 넷이 나란히 선 파티 칸에서 로고가 한둘씩만 뜨면 그 자리가
 * 어느 쪽인지 알 수 없어서, 결국 그림을 외운 사람만 읽을 수 있었다.
 *
 * 이제 **테두리에만** 색을 쓴다 (`ui/theme` 의 `GOOD_C`·`BAD_C`). 초록이면
 * 도움이 되는 것, 빨강이면 나쁜 것이다. 안쪽 그림은 그대로 흑백이라 팔레트가
 * 무너지지 않는다 — 색이 말하는 것은 "좋은가 나쁜가" 한 가지뿐이다.
 *
 * ## 꺼지기 전에 깜빡인다
 *
 * 남은 시간이 `BLINK_MS` 아래로 내려가면 화면이 그 칸을 깜빡인다. 로고는
 * 붙어 있다가 **어느 순간 그냥 없어지는데**, 그러면 "언제 풀렸지" 를 알 수가
 * 없다 — 특히 기절처럼 풀리는 순간에 맞춰 뭘 해야 하는 것이 그렇다.
 */
import { DmgType } from './chars';

/** 상태 하나. 값은 곧 스프라이트 칸 이름이다 (`assets/sprites/status_icon/`) */
export type StatusId =
  /* ── 나쁜 것 ── */
  | 'st_bleed'    // 출혈 — 물리 지속 피해
  | 'st_poison'   // 중독 — 마법 지속 피해 (맹독·산성·포자·부패 전부)
  | 'st_stun'     // 기절 — 행동 불가
  | 'st_silence'  // 침묵 — 스킬 사용 불가
  | 'st_slow'     // 둔화 — 공격속도 감소
  | 'st_weak'     // 약화 — 공격력 감소
  | 'st_break'    // 파쇄 — 방어력 감소
  | 'st_wither'   // 시듦 — 받는 치유량 감소
  | 'st_taunt'    // 도발 — 건 사람만 노리게 된다 (적에게 걸린다)
  /* ── 좋은 것 ── */
  | 'st_rage'     // 격노 — 공격력 증가
  | 'st_guard'    // 견고 — 방어력 증가
  | 'st_regen'    // 재생 — 지속 회복
  | 'st_haste';   // 신속 — 공격속도 증가

/** 화면에 적는 이름 */
export const STATUS_NAME: Record<StatusId, string> = {
  st_bleed: '출혈',
  st_poison: '중독',
  st_stun: '기절',
  st_silence: '침묵',
  st_slow: '둔화',
  st_weak: '약화',
  st_break: '파쇄',
  st_wither: '시듦',
  st_taunt: '도발',
  st_rage: '격노',
  st_guard: '견고',
  st_regen: '재생',
  st_haste: '신속',
};

/**
 * **무슨 일이 일어나는가** — 이름 말고 효과.
 *
 * 이름만으로는 안 통했다. `출혈` 도 `중독` 도 `시듦` 도, 처음 보는 사람에게는
 * 그냥 낱말이다 — 로고를 외운 사람만 읽을 수 있는 표시라는 점에서 로고와
 * 다를 게 없다.
 *
 * 그래서 걸리는 순간 머리 위에 이걸 띄운다 (`screens/home/Fighter` 의
 * `StatusNote`). 한 번만 뜨고 사라지므로 화면이 안 붐비고, 그 한 번으로
 * 로고와 뜻이 묶인다.
 *
 * 짧게 적는다. 인물 하나 폭에 한 줄로 들어가야 하고, 자세한 것은 캐릭터
 * 창이 맡는다.
 */
export const STATUS_WHAT: Record<StatusId, string> = {
  st_bleed: '지속 피해',
  st_poison: '지속 피해',
  st_stun: '행동 불가',
  st_silence: '스킬 봉인',
  st_slow: '공격속도 감소',
  st_weak: '공격력 감소',
  st_break: '방어력 감소',
  st_wither: '받는 치유 감소',
  st_taunt: '이쪽만 노린다',
  st_rage: '공격력 증가',
  st_guard: '방어력 증가',
  st_regen: '지속 회복',
  st_haste: '공격속도 증가',
};

/**
 * 좋은 것인가.
 *
 * 화면이 이걸로 **차례를 가른다** — 좋은 것이 먼저, 나쁜 것이 뒤.
 * 흑백에서 색으로 못 가르니 자리로 가른다.
 */
export const GOOD: ReadonlySet<StatusId> = new Set<StatusId>([
  'st_rage', 'st_guard', 'st_regen', 'st_haste',
]);

/**
 * 지속 피해가 들어오는 간격.
 *
 * `core/autoBattle` 의 `TICK_MS` 와 **같아야 한다.** 사양이 전부 "0.5초마다"
 * 로 적혀 있고(`docs/BOSS_SKILLS.md`) 시간을 흘리는 것이 그 틱이라, 다르면
 * 지속 피해가 사양보다 빠르거나 느리게 들어간다.
 *
 * 여기에 따로 적어 두는 이유는 이 파일이 `autoBattle` 을 물면 안 되기
 * 때문이다 — 저쪽이 이쪽을 문다. 대신 검사에서 둘이 같은지 본다.
 */
export const HEX_TICK_MS = 500;

/**
 * 꺼지기 얼마 전부터 깜빡이나 (ms).
 *
 * 2초다. 0.5초 틱이라 네 번 깜빡이고 사라진다 — 한두 번이면 못 보고 지나가고,
 * 열 번이면 그냥 "깜빡이는 로고" 가 되어 곧 꺼진다는 뜻을 잃는다.
 *
 * 버프를 주던 사람이 쓰러졌을 때 그 버프가 남아 있는 시간도 이 값이다
 * (`core/passives` 의 `FADE_MS`). 두 가지가 화면에서 똑같이 보여야 한다 —
 * 어느 쪽이든 "이제 곧 없어진다" 는 같은 뜻이다.
 */
export const BLINK_MS = 2000;

/** 이제 곧 꺼지나 — 화면이 이걸로 깜빡일지 정한다 */
export const dying = (ms: number): boolean =>
  Number.isFinite(ms) && ms > 0 && ms <= BLINK_MS;

/**
 * 지금 걸려 있는 것 하나.
 *
 * ## 왜 종류마다 칸을 따로 안 두나
 *
 * 출혈은 지속 피해, 둔화는 배수, 기절은 아무 값도 없다. 셋을 각각 다른
 * 모양으로 두면 목록이 세 갈래가 되고, 시간을 흘리는 코드도 세 벌이 된다.
 *
 * **한 모양에 다 담고 안 쓰는 칸은 비워 둔다** — 지속 피해가 아니면 `dot` 이
 * 0 이고, 배수가 없으면 `mul` 이 1 이다. 시간을 흘리는 일은 한 곳에서 한 번만
 * 한다 (`tickHex`).
 */
export interface Hex {
  /** 무엇이 걸렸나. 화면 로고이자 곧 종류다 */
  id: StatusId;
  /** 남은 시간 (ms). 0 이하면 풀린다 */
  ms: number;
  /**
   * 한 틱(0.5초)에 깎이는 양 — **이미 계산된 값**이다.
   *
   * 계수(공격력의 10%)가 아니라 실제 숫자를 담는다. 건 놈이 죽고 나서도
   * 지속 피해는 남는데, 계수만 들고 있으면 그때 공격력을 어디서 읽을지가
   * 없어진다.
   */
  dot: number;
  /** 그 지속 피해가 물리인가 마법인가 — 맞는 사람의 어느 겹이 막을지를 정한다 */
  dmg: DmgType;
  /**
   * 한 겹당 배수. 1 이면 배수가 없다.
   *
   * 무엇에 곱하는지는 `id` 가 정한다 — 둔화는 공격속도, 약화는 공격력,
   * 파쇄는 방어력, 시듦은 받는 치유량이다.
   *
   * **겹치면 곱이 아니라 합이다** (`mulOf`). 0.9 가 세 겹이면 0.729 가 아니라
   * 0.7 이다 — 사양이 "최대 3중첩(30%)" 이라고 적혀 있고, 곱으로 쌓으면
   * 겹수를 늘릴수록 표에 적은 숫자와 벌어진다.
   */
  mul: number;
  /** 몇 겹인가. 겹치지 않는 것은 늘 1 */
  n: number;
}

/** 아무것도 안 걸린 상태 — 매번 새 배열을 만들면 화면이 계속 다시 그려진다 */
export const NO_HEX: readonly Hex[] = [];

/** 이 사람에게 걸려 있는 것들 (기록에 없으면 없는 것) */
export const hexOf = (
  map: Record<string, Hex[]> | undefined, who: string,
): readonly Hex[] => map?.[who] ?? NO_HEX;

/** 이게 걸려 있나 */
export const hasHex = (list: readonly Hex[], id: StatusId): boolean =>
  list.some((h) => h.id === id && h.ms > 0);

/**
 * 이 종류가 지금 거는 배수. 안 걸려 있으면 1.
 *
 * 겹은 **합으로** 센다 — 0.9 가 세 겹이면 1 - 0.1×3 = 0.7 이다. 0 아래로는
 * 안 내려간다 (방어력이 음수가 되면 맞을수록 덜 아파진다).
 *
 * 같은 종류가 두 줄로 들어 있으면 **더 센 쪽**을 쓴다. 그런 일은 `putHex` 가
 * 막지만, 저장본이 낡았거나 손으로 만든 상태일 수 있다.
 */
export function mulOf(list: readonly Hex[], id: StatusId): number {
  let out = 1;
  for (const h of list) {
    if (h.id !== id || h.ms <= 0) continue;
    const v = Math.max(0, 1 - (1 - h.mul) * Math.max(1, h.n));
    if (v < out) out = v;
  }
  return out;
}

/**
 * 이 종류가 지금 거는 **올려 주는** 배수. 안 걸려 있으면 1.
 *
 * `mulOf` 와 짝이고 방향만 반대다. 저쪽은 깎는 것(둔화·약화·파쇄)을 위해
 * **제일 작은 값**을 고르고, 이쪽은 올리는 것(신속)을 위해 **제일 큰 값**을
 * 고른다.
 *
 * 하나로 합칠 수도 있었지만 그러면 "1 에서 멀어진 쪽" 같은 규칙이 필요해지고,
 * 둔화 0.9 와 신속 2.0 이 같이 걸렸을 때 어느 쪽이 이기는지가 애매해진다.
 * 지금은 둘 다 살아서 곱해진다 — 둔화에 걸린 채로 광란을 쓰면 1.8 배다.
 *
 * 겹은 안 센다. 올려 주는 것은 지금 리안느의 광란 하나뿐이고, 같은 것을 두
 * 번 걸면 `putHex` 가 더 센 쪽으로 새로 고친다.
 */
export function upOf(list: readonly Hex[], id: StatusId): number {
  let out = 1;
  for (const h of list) {
    if (h.id !== id || h.ms <= 0) continue;
    if (h.mul > out) out = h.mul;
  }
  return out;
}

/**
 * 하나를 건다. **새 목록을 돌려준다** — 원본은 안 건드린다.
 *
 * 같은 것이 이미 걸려 있으면 겹치지 않고 **새로 고친다**: 남은 시간은 둘 중
 * 긴 쪽, 세기는 둘 중 센 쪽이다. 그러지 않으면 같은 기술을 두 번 맞았을 때
 * 3초짜리가 1초 남은 것으로 덮여 오히려 짧아진다.
 *
 * @param stack 몇 겹까지 쌓이나. 1 이면 안 쌓인다 (대부분).
 *              쌓이는 것은 10판 우두머리의 오염된 점성 하나뿐이다.
 */
export function putHex(
  list: readonly Hex[], next: Hex, stack = 1,
): Hex[] {
  const out = list.filter((h) => h.ms > 0);
  const at = out.findIndex((h) => h.id === next.id);
  if (at < 0) {
    out.push({ ...next, n: 1 });
    return out;
  }
  const was = out[at];
  out[at] = {
    ...next,
    ms: Math.max(was.ms, next.ms),
    dot: Math.max(was.dot, next.dot),
    /* 배수는 **작을수록 세다** (0.5 가 0.9 보다 아프다) */
    mul: Math.min(was.mul, next.mul),
    n: Math.min(Math.max(1, stack), was.n + (stack > 1 ? 1 : 0)),
  };
  return out;
}

/** 한 틱만큼 흐른 뒤의 목록과, 그동안 들어온 지속 피해 */
export interface HexTick {
  /** 아직 안 풀린 것들 */
  left: Hex[];
  /** 이번 틱의 지속 피해 — 종류별로 나눠서 */
  dot: { phys: number; magic: number };
}

/**
 * 시간을 흘린다.
 *
 * 지속 피해를 **여기서 깎지 않는다.** 얼마가 들어올지만 세어서 돌려주고,
 * 방어를 빼고 체력에서 덜어내는 일은 부르는 쪽이 한다 (`core/autoBattle`) —
 * 맞는 사람의 방어력을 아는 것은 저쪽이고, 그 뺄셈이 게임에 한 곳(`strikeFor`)
 * 밖에 없어야 한다.
 *
 * 물리와 마법을 **따로 센다.** 한 사람에게 출혈과 중독이 같이 걸릴 수 있는데,
 * 합쳐 버리면 어느 겹으로 막을지가 사라진다.
 */
export function tickHex(list: readonly Hex[], ms: number): HexTick {
  const left: Hex[] = [];
  const dot = { phys: 0, magic: 0 };
  for (const h of list) {
    /* 낡은 저장본에서 NaN 이 들어오면 영원히 안 풀린다 — 읽을 때 거른다 */
    const was = Number.isFinite(h.ms) ? h.ms : 0;
    if (was <= 0) continue;
    /*
      **깎기 전에 먼저 때린다.**

      3초짜리를 0.5초마다 흘리면 여섯 번이 나와야 한다 (`docs/BOSS_SKILLS.md`
      의 "3초 / 틱당 10% 면 여섯 틱"). 줄이고 나서 0 이 아닌지 보면 마지막
      한 틱이 빠져 다섯 번이 된다.
    */
    if (h.dot > 0) dot[h.dmg] += h.dot * Math.max(1, h.n);
    const now = was - ms;
    if (now > 0) left.push({ ...h, ms: now });
  }
  return { left, dot };
}
