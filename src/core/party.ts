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
  /**
   * 쓰러졌지만 **버프가 아직 사그라드는 중인** 사람들 (`BattleState.fade`).
   *
   * 여기 든 사람은 살아 있는 것으로 친다. 아녜스가 죽는 순간 넷의 공격력이
   * 아무 표시 없이 10% 떨어지던 것을, 2초 동안 깜빡이며 사그라들게 바꿨다
   * (`core/passives` 의 `FADE_MS`). 깜빡이는 동안에는 **실제로도 걸려
   * 있어야** 로고가 거짓말을 안 한다.
   */
  fade?: Record<string, number>,
): OwnedChar[] {
  const ms = members(party, chars);
  if (!hp) return ms;
  return ms.filter((c) => hpOf(c, hp) > 0 || (fade?.[c.id] ?? 0) > 0);
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
 * @param hp   주면 쓰러진 사람의 패시브를 뺀다. 안 주면 전원이 살아 있는 것으로
 * @param fade 쓰러졌지만 아직 사그라드는 중인 사람들 (`BattleState.fade`) —
 *             그 2초 동안은 버프가 실제로 걸려 있다 (`core/passives` 의 `FADE_MS`)
 */
export function allyAtk(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp?: Record<string, number>,
  fade?: Record<string, number>,
): number {
  return allyAtkMul(livingMembers(party, chars, hp, fade));
}

/** 파티 전체 공격속도에 더해지는 값 — 리안느의 +0.1 */
export function allySpd(
  party: Party,
  chars: Record<string, OwnedChar>,
  hp?: Record<string, number>,
  fade?: Record<string, number>,
): number {
  return allySpdAdd(livingMembers(party, chars, hp, fade));
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

/* ────────────────────────────── 대형 ────────────────────────────── */

/**
 * ── 앞줄과 뒷줄 ──
 *
 * 넷이 한 줄로 서던 것을 **두 줄**로 나눈다. 이름은 `뒷줄-앞줄` 이다:
 * `3-1` 이면 뒤에 셋, 앞에 하나다.
 *
 * ## 앞뒤는 **적을 바라본 쪽**이다
 *
 * 화면 위아래가 아니다. 아군은 무대 왼쪽에서 오른쪽을 보고 서므로,
 * **앞줄은 오른쪽 · 뒷줄은 왼쪽**이다. 앞에 선다는 것은 적에게 더 가까이
 * 선다는 뜻이고, 그래서 앞줄이 먼저 맞는다 (`FRONT_SHARE`).
 *
 * 한 번 위아래로 그렸다가 고쳤다. 위아래로 두면 뒷줄이 적과 같은 거리에
 * 서 있게 되어, "앞에 세워 막는다" 는 말이 화면에서 아무 뜻도 갖지 못한다.
 *
 * ## 왜 자리가 다섯 줄인가
 *
 * 줄마다 **가로줄 다섯**(`FORM_LANES`)이 있고 대형은 그중 몇 줄을 쓴다.
 * 화면에서 이 다섯은 위아래로 늘어선다 — 쿼터뷰라 뒤로 갈수록 위로 올라가고
 * 작아진다 (`Ground` 의 `depthAt`).
 *
 * 인원수만으로 자리를 잡으면 `2-2` 일 때 넷이 위에서부터 차곡차곡 붙어 서서
 * 대형이 아니라 그냥 줄이 된다. 줄을 정해 두면 **가운데를 기준으로
 * 정갈하게** 모인다.
 *
 *   3-1  뒤 ①③⑤ · 앞 ③      뒤 셋이 위아래로 퍼지고 그 오른쪽에 하나가 선다
 *   2-2  뒤 ②④  · 앞 ②④     넷이 가운데 두 줄에 네모로 모인다
 *   1-3  뒤 ③   · 앞 ①③⑤    앞 셋이 위아래로 퍼지고 그 왼쪽에 하나가 선다
 *
 * ## 앞에 서는 사람은 누구인가
 *
 * 고르게 하지 않는다. **막는 순서**가 그대로 앞줄이다 (`defenseOrder` — 방어가
 * 먼저, 그다음 공격, 마지막이 보조). 사람이 자리까지 고르게 하면 최적해가
 * 하나로 굳고, 그러면 대형을 고르는 일이 그 하나를 찾는 일이 된다.
 *
 * 대형을 고르는 것으로 정하는 것은 **몇 명이 맞을 자리에 서나**다. 그게
 * 이 선택의 내용이다.
 */
export type FormationId = '3-1' | '2-2' | '1-3';

export const FORMATION_IDS: readonly FormationId[] = ['3-1', '2-2', '1-3'];

/**
 * 가로줄 수 — 화면에서는 **위아래**로 늘어선다.
 *
 * 0 이 맨 앞(화면 아래, 제일 크게 보이는 자리)이고 4 가 맨 뒤(화면 위)다.
 * 이 방향은 무대의 깊이와 같다 (`Ground` 의 `depthAt`).
 */
export const FORM_LANES = 5;

export interface FormationDef {
  id: FormationId;
  /** 뒷줄 인원 */
  back: number;
  /** 앞줄 인원 */
  front: number;
  /** 뒷줄이 쓰는 가로줄 (0 이 화면 아래 끝, 4 가 위 끝) */
  backLanes: readonly number[];
  /** 앞줄이 쓰는 가로줄 */
  frontLanes: readonly number[];
  /** 화면에 적는 한 줄 */
  text: string;
}

export const FORMATIONS: Record<FormationId, FormationDef> = {
  '3-1': {
    id: '3-1',
    back: 3,
    front: 1,
    backLanes: [0, 2, 4],
    frontLanes: [2],
    text: '앞 하나가 70% 를 혼자 받는다',
  },
  '2-2': {
    id: '2-2',
    back: 2,
    front: 2,
    backLanes: [1, 3],
    frontLanes: [1, 3],
    text: '앞 둘이 35% 씩 나눠 받는다',
  },
  '1-3': {
    id: '1-3',
    back: 1,
    front: 3,
    backLanes: [2],
    frontLanes: [0, 2, 4],
    text: '앞 셋이 23% 씩 나눠 받는다',
  },
};

export const DEFAULT_FORMATION: FormationId = '2-2';

export const isFormationId = (v: unknown): v is FormationId =>
  typeof v === 'string' && (FORMATION_IDS as readonly string[]).includes(v);

/**
 * **앞줄이 통째로 받는 몫.**
 *
 * 나머지 30% 를 뒷줄이 나눠 갖는다. 줄 안에서는 고르게 나눈다 — 2-2 면
 * 앞 둘이 35% 씩, 뒤 둘이 15% 씩이다.
 *
 * ## 왜 70 인가
 *
 * 50 이면 앞뒤가 반반이라 대형을 고를 이유가 없다. 90 이면 앞에 선 사람이
 * 혼자 다 맞고 죽으므로 `3-1` 이 절대 안 나온다.
 *
 * 70 은 `3-1` 에서 앞 하나가 70% 를 지고 뒤 셋이 10% 씩 나눠 갖는 자리다.
 * 그 10% 가 중요하다 — 0 이면 뒷줄이 안전지대가 되어 전열이 무너질 때까지
 * 아무 일도 안 일어난다.
 */
export const FRONT_SHARE = 0.70;

/** 대형에 따라 자리를 잡은 사람 하나 */
export interface FormSpot {
  c: OwnedChar;
  /** 적에게 가까운 쪽이 `front` — 화면에서는 오른쪽이다 */
  row: 'front' | 'back';
  /** 다섯 가로줄 중 몇 번째 (0 이 화면 아래, 4 가 위) */
  lane: number;
}

/**
 * 지금 파티를 대형에 앉힌다.
 *
 * **앞줄부터 채운다** (`defenseOrder` 순서로). 파티가 덜 찼으면 뒷줄이 먼저
 * 빈다 — 둘뿐인 파티가 `3-1` 을 고르면 앞 하나 · 뒤 하나가 된다. 앞을 비우면
 * 뒷줄이 곧 앞줄이 되어 대형이 뜻을 잃는다.
 *
 * 줄이 인원보다 많으면 **가운데부터** 쓴다. `1-3` 을 골랐는데 앞에 둘뿐이면
 * ①③⑤ 중 ①⑤ 처럼 벌어지는 것이 아니라 — 가운데를 낀 두 줄을 골라 정갈하게
 * 모인다.
 */
export function formationSpots(
  party: Party,
  chars: Record<string, OwnedChar>,
  form: FormationId,
  /** 주면 쓰러진 사람을 빼고 앉힌다. 화면은 안 준다 (죽어도 자리는 그대로다) */
  hp?: Record<string, number>,
): FormSpot[] {
  const def = FORMATIONS[form] ?? FORMATIONS[DEFAULT_FORMATION];
  let line = defenseOrder(party, chars);
  if (hp) line = line.filter((c) => hpOf(c, hp) > 0);

  const nFront = Math.min(def.front, line.length);
  const front = line.slice(0, nFront);
  const back = line.slice(nFront);

  const seat = (list: readonly OwnedChar[], lanes: readonly number[], row: 'front' | 'back') => {
    /*
      쓸 줄이 인원보다 많으면 가운데를 낀 만큼만 골라 쓴다.

      `[0,2,4]` 에 둘이면 `[0,2]` 가 아니라 **가운데 둘**(`[2,4]` 도 아니고)
      — 목록의 한가운데를 기준으로 잘라 낸다. 그래야 어느 대형에서도 파티가
      화면 한가운데에 선다.
    */
    const take = Math.min(list.length, lanes.length);
    const from = Math.floor((lanes.length - take) / 2);
    const use = lanes.slice(from, from + take);
    return list.slice(0, take).map((c, i) => ({ c, row, lane: use[i] ?? 2 }));
  };

  return [...seat(front, def.frontLanes, 'front'), ...seat(back, def.backLanes, 'back')];
}

/** 지금 앞줄에 선 사람들의 이름표 — 전투가 이걸로 맞을 확률을 가른다 */
export function frontIdsOf(
  party: Party,
  chars: Record<string, OwnedChar>,
  form: FormationId,
): Set<string> {
  return new Set(
    formationSpots(party, chars, form)
      .filter((s) => s.row === 'front')
      .map((s) => s.c.id),
  );
}

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
