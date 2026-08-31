/**
 * 파티 — 네 자리.
 *
 * ## 왜 넷인가
 *
 * 역할이 셋(공격·방어·보조)이라 넷이면 **한 자리가 남는다.** 셋이면 역할마다
 * 한 명씩 박혀서 고를 것이 없고, 다섯이면 남는 자리가 둘이라 아무나 넣어도
 * 표가 안 난다. 넷은 "셋은 정해져 있고 마지막 하나를 고민한다" 가 된다.
 *
 * ## 파티 레벨
 *
 * 파티원 네 명의 **캐릭터 레벨을 그냥 더한 값**이다. 빈 자리는 0 이다.
 *
 * 곱하거나 평균 내지 않는 이유가 있다. 평균이면 약한 캐릭터를 넣는 순간 숫자가
 * 내려가서, 네 번째 자리를 비워 두는 게 이득이 된다 — 파티를 채우라고 만든
 * 자리인데 비우는 게 정답이 되면 안 된다. 더하기면 누구를 넣든 오르고,
 * 그래서 "채우고 나서 누구를 넣을지" 를 고민하게 된다.
 *
 * 상한은 200 이다 (50 × 4). 이 숫자가 콘텐츠 해금 기준이 된다.
 *
 * ## 전투력은 따로다
 *
 * 파티 레벨은 **레벨만** 본다. 고유장비 강화는 파티 레벨에 안 들어간다.
 * 둘을 한 숫자로 뭉치면 "레벨을 올렸는데 왜 그대로지" 같은 일이 생긴다.
 * 레벨은 레벨대로, 전투력은 전투력대로 보여 준다 — 화면에 두 줄이면 충분하다.
 */
import { CharId, MAX_GEAR_LV, OwnedChar, Role, charPower, CHARS, statOf, swingMs } from './chars';
import { allyAtkMul, allySpdAdd } from './passives';

/** 파티 자리 수 */
export const PARTY_SIZE = 4;

/** 파티 레벨의 최대치 */
/** 파티 넷이 다 만렙 강화일 때의 합 — 화면이 "얼마나 남았나" 를 말할 때 쓴다 */
export const MAX_PARTY_GEAR = MAX_GEAR_LV * PARTY_SIZE;

/** 자리 넷. 비어 있으면 null */
export type Party = (CharId | null)[];

export const emptyParty = (): Party => Array(PARTY_SIZE).fill(null);

/**
 * 저장된 파티를 믿지 않고 다듬는다.
 *
 * 길이가 다르거나, 가지고 있지 않은 캐릭터가 들어 있거나, 같은 캐릭터가 두
 * 자리에 있는 경우를 전부 걷어낸다. 세이브는 언제나 틀릴 수 있다고 본다
 * (`state/migrate` 와 같은 태도).
 */
export function cleanParty(raw: unknown, owned: readonly CharId[]): Party {
  const have = new Set(owned);
  const out = emptyParty();
  const used = new Set<CharId>();
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const v = raw[i];
    if (typeof v !== 'string') continue;
    const id = v as CharId;
    if (!have.has(id) || used.has(id)) continue;
    used.add(id);
    out[i] = id;
  }
  return out;
}

/** 파티에 실제로 서 있는 사람들 */
export function members(party: Party, chars: Record<string, OwnedChar>): OwnedChar[] {
  return party
    .map((id) => (id ? chars[id] : null))
    .filter((c): c is OwnedChar => !!c);
}

/** 파티 레벨 = 파티원 레벨의 합 */
export function partyGear(party: Party, chars: Record<string, OwnedChar>): number {
  return members(party, chars).reduce((a, c) => a + c.gearLv, 0);
}

/** 파티 전투력 = 파티원 전투력의 합 */
export function partyPower(party: Party, chars: Record<string, OwnedChar>): number {
  return members(party, chars).reduce((a, c) => a + charPower(c), 0);
}

/** 파티에 어떤 역할이 몇 명 있는가 — 화면이 "보조가 없다" 를 말해 줄 수 있게 */
export function roleCount(party: Party, chars: Record<string, OwnedChar>): Record<Role, number> {
  const n: Record<Role, number> = { dealer: 0, guard: 0, support: 0 };
  for (const c of members(party, chars)) n[CHARS[c.id].role] += 1;
  return n;
}

/**
 * 지금 **살아 있는** 파티원들.
 *
 * 패시브가 이걸 본다 — 쓰러진 사람의 패시브는 꺼져야 하기 때문이다
 * (`core/passives`). `hp` 를 안 주면 전원이 살아 있는 것으로 본다: 화면이
 * "이 파티는 얼마나 센가" 를 적을 때는 아직 아무도 안 맞은 상태가 맞다.
 */
export function livingMembers(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp?: Record<string, number>,
): OwnedChar[] {
  const ms = members(party, chars);
  return hp ? ms.filter((c) => hpOf(c, hp) > 0) : ms;
}

/**
 * 파티 전체에 걸리는 공격력 배수.
 *
 * ## 역할이 아니라 사람이 정한다
 *
 * 예전에는 **보조 역할 한 명당 12%** 였다 (`SUPPORT_BONUS`). 역할만 맞으면
 * 누구든 같은 값이라, 보조를 새로 만들 때마다 자동으로 12% 가 하나 더
 * 생겼다 — 캐릭터를 고르는 일이 "보조가 몇이냐" 세는 일이 됐다.
 *
 * 지금은 **아녜스의 패시브 10%** 다 (`core/passives` 의 `PASSIVES`). 그
 * 사람이 서 있어야 오르고, 쓰러지면 그 순간 꺼진다.
 *
 * @param hp 주면 쓰러진 사람의 패시브를 뺀다. 안 주면 전원이 살아 있는 것으로
 */
export function allyAtk(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp?: Record<string, number>,
): number {
  return allyAtkMul(livingMembers(party, chars, hp));
}

/** 파티 전체 공격속도에 더해지는 값 — 리안느의 +0.1 */
export function allySpd(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp?: Record<string, number>,
): number {
  return allySpdAdd(livingMembers(party, chars, hp));
}

/**
 * 파티의 총 체력과 초당 딜 — 전투가 쓰는 두 값.
 *
 * 체력을 한 통에 합치는 이유: 네 명이 각자 체력을 갖고 하나씩 쓰러지면,
 * 화면 위쪽 좁은 자리에 체력 막대가 넷 필요하고 누가 죽었는지도 따라가야 한다.
 * 한 통이면 막대 하나로 끝나고, "파티가 버틴다" 는 감각도 그대로다.
 */
export function partyStat(party: Party, chars: Record<string, OwnedChar>) {
  const ms = members(party, chars);
  const mul = allyAtkMul(ms);
  /* 리안느가 서 있으면 넷 다 그만큼 빨라진다 — 초당 딜에 그대로 들어간다 */
  const add = allySpdAdd(ms);
  let hp = 0;
  let dps = 0;
  for (const c of ms) {
    const s = statOf(c);
    hp += s.hp;
    dps += (s.atk * 1000) / swingMs(s.spd + add);
  }
  return { hp: Math.round(hp), dps: Math.round(dps * mul * 10) / 10, count: ms.length };
}

/**
 * 맞는 순서.
 *
 * **방어가 먼저** 서고, 그다음이 공격, 마지막이 보조다. 같은 역할 안에서는
 * 파티 자리 순서를 지킨다.
 *
 * 앞사람이 쓰러지면 다음 사람이 그 자리를 이어받는다. 그래서 방어를 넣는
 * 이유가 "피해를 조금 줄여 준다" 가 아니라 **"내 딜러가 아직 안 맞는다"** 가
 * 된다 — 그게 방어 역할이 실제로 하는 일이다.
 */
const ROLE_ORDER: Record<Role, number> = { guard: 0, dealer: 1, support: 2 };

export function defenseOrder(party: Party, chars: Record<string, OwnedChar>): OwnedChar[] {
  return members(party, chars)
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (ROLE_ORDER[CHARS[a.c.id].role] - ROLE_ORDER[CHARS[b.c.id].role]) || (a.i - b.i))
    .map((x) => x.c);
}

/**
 * 지금 맞고 있는 사람 — 아직 안 쓰러진 사람 중 맨 앞.
 *
 * @param hp 캐릭터별 남은 체력. 없는 키는 아직 안 맞은 것으로 본다
 */
export function frontOf(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp?: Record<string, number>,
): OwnedChar | null {
  const order = defenseOrder(party, chars);
  if (!hp) return order[0] ?? null;
  return order.find((c) => (hp[c.id] ?? statOf(c).hp) > 0) ?? null;
}

/** 이 캐릭터의 남은 체력 (기록에 없으면 가득) */
export const hpOf = (c: OwnedChar, hp: Record<string, number>): number => {
  const max = statOf(c).hp;
  const v = hp[c.id];
  return v === undefined ? max : Math.max(0, Math.min(max, v));
};

/** 파티가 전멸했나 — 아무도 안 남았으면 */
export function allDown(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp: Record<string, number>,
): boolean {
  const ms = members(party, chars);
  return ms.length > 0 && ms.every((c) => hpOf(c, hp) <= 0);
}

/** 캐릭터별 체력을 가득 채운 기록 */
export function fullHp(party: Party, chars: Record<string, OwnedChar>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of members(party, chars)) out[c.id] = statOf(c).hp;
  return out;
}
