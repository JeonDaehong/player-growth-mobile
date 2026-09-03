/**
 * 스킬 설정 — **언제 쓸지를 사람이 고른다.**
 *
 * 지금은 아녜스의 정화 하나뿐이다 (`core/chars` 의 `SkillDef.opt`).
 *
 * ## 왜 고르게 하나
 *
 * 이 게임의 전투는 사람이 안 누른다. 그러면 "언제 쓰느냐" 를 정하는 것이 곧
 * 조작이고, 그 판단이 하나뿐이면 전투에서 사람이 할 일이 아예 없어진다.
 *
 * 정화는 특히 그렇다. 걷어낼 것이 **기절**일 때와 **출혈**일 때 값이 전혀
 * 다르다 — 기절은 그 사람이 아무것도 못 하는 것이라 즉시 걷어야 하고, 출혈은
 * 아프기만 할 뿐 5초 뒤에 저절로 풀린다. 코스트 20 을 어느 쪽에 쓸지는
 * 파티에 따라 다르고, 그건 사람이 정할 일이다.
 *
 * ## 걷을 것이 없으면 안 쓴다
 *
 * 켜 두었어도 대상이 없으면 **코스트가 꽉 찬 채로 기다린다**
 * (`core/chars` 의 `readySkill` 이 `allow` 로 물어본다). 스무 번을 모아서
 * 아무것도 안 걷어내면 그건 스무 번을 버린 것이다.
 */
import { CharId, OwnedChar } from './chars';
import { Party, hpOf, members } from './party';
import { GOOD, Hex, StatusId, hexOf } from './status';

/** 정화를 언제 쓰나 */
export type CleanseOpt =
  | 'all'     // 나쁜 것이면 뭐든
  | 'cc'      // 못 움직이게 하는 것만
  | 'debuff'  // 못 움직이게 하는 것을 뺀 나머지만
  | 'off';    // 안 쓴다

export const CLEANSE_OPTS: readonly CleanseOpt[] = ['all', 'cc', 'debuff', 'off'];

export const OPT_NAME: Record<CleanseOpt, string> = {
  all: '전부',
  cc: '행동불가만',
  debuff: '약화만',
  off: '끔',
};

export const OPT_DESC: Record<CleanseOpt, string> = {
  all: '나쁜 것이 하나라도 걸려 있으면 씁니다',
  cc: '기절·침묵처럼 못 움직이게 하는 것에만 씁니다',
  debuff: '출혈·둔화처럼 약해지는 것에만 씁니다',
  off: '쓰지 않습니다. 코스트는 계속 차 있습니다',
};

/** 안 고른 사람의 기본값 — 켜 둔다. 꺼져 있으면 기술이 있는 줄도 모른다 */
export const DEFAULT_CLEANSE: CleanseOpt = 'all';

/**
 * 못 움직이게 하는 것들 (CC).
 *
 * 셋뿐이다 — 기절과 감전은 아무것도 못 하고, 침묵은 기술을 못 쓴다. 둔화는
 * 여기 안 넣는다: 느려질 뿐 하던 일은 계속 한다.
 *
 * 도발(`st_taunt`)은 **적에게** 걸리는 것이라 아군 정화의 대상이 아니다.
 */
export const CC: ReadonlySet<StatusId> = new Set<StatusId>([
  'st_stun', 'st_shock', 'st_silence',
]);

/** 이 설정이 이 상태를 걷어내나 */
export function cleanses(opt: CleanseOpt, id: StatusId): boolean {
  if (opt === 'off') return false;
  /* 좋은 것은 절대 안 걷는다 — 걷어 봐야 손해다 */
  if (GOOD.has(id)) return false;
  if (opt === 'cc') return CC.has(id);
  if (opt === 'debuff') return !CC.has(id);
  return true;
}

/** 이 사람에게 지금 걷어낼 것이 있나 */
export function hasCleansable(opt: CleanseOpt, hex: readonly Hex[]): boolean {
  return hex.some((h) => h.ms > 0 && cleanses(opt, h.id));
}

/**
 * 지금 정화가 걸릴 사람들 (CharId).
 *
 * **쓰러진 사람은 뺀다.** 시체에 걸린 출혈을 걷어내려고 코스트 20 을 쓰면
 * 아무 일도 안 일어난다.
 *
 * 자기 자신도 들어간다 — 나쁜 것이 다 CC 는 아니라서, 침묵에 안 걸린 채로
 * 제 몸의 출혈을 걷는 일은 얼마든지 있다. 기절·침묵이면 기술 자체가 안
 * 나가므로 (`Fighter`) 여기서 따로 막을 것이 없다.
 */
export function cleanseTargets(
  opt: CleanseOpt,
  party: Party,
  chars: Record<string, OwnedChar>,
  hp: Record<string, number>,
  hex: Record<string, Hex[]> | undefined,
): CharId[] {
  if (opt === 'off') return [];
  const out: CharId[] = [];
  for (const c of members(party, chars)) {
    if (hpOf(c, hp) <= 0) continue;
    if (hasCleansable(opt, hexOf(hex, c.id))) out.push(c.id);
  }
  return out;
}

/**
 * 걷어낸 뒤의 목록. 걷을 것이 없으면 **원본을 그대로** 돌려준다.
 *
 * 같은 배열을 돌려주는 것이 중요하다. 새 배열을 만들면 상태가 안 바뀌었는데도
 * 바뀐 것으로 보여서, 0.5초마다 화면이 통째로 다시 그려진다
 * (`state/slices/roster` 의 `battleTickOnce` 가 통째로 비교한다).
 */
export function cleansed(opt: CleanseOpt, hex: readonly Hex[]): readonly Hex[] {
  if (!hasCleansable(opt, hex)) return hex;
  return hex.filter((h) => !(h.ms > 0 && cleanses(opt, h.id)));
}

/**
 * 설정을 저장하는 열쇠 — `<캐릭터>:<기술 자리>`.
 *
 * 자리 번호를 같이 넣는 이유는 한 사람이 설정 달린 기술을 둘 이상 가질 수
 * 있어서다. 지금은 아녜스의 1번 자리 하나뿐이지만, 이름으로 잡아 두면 기술
 * 이름을 고치는 순간 사람들의 설정이 조용히 초기화된다.
 */
export const optKey = (who: string, slot: number): string => `${who}:${slot}`;

/** 저장된 설정을 믿지 않고 읽는다 — 모르는 값이면 기본값 */
export function cleanseOptOf(
  map: Record<string, string> | undefined, who: string, slot: number,
): CleanseOpt {
  const v = map?.[optKey(who, slot)];
  return (CLEANSE_OPTS as readonly string[]).includes(v ?? '')
    ? (v as CleanseOpt)
    : DEFAULT_CLEANSE;
}
