/**
 * 캐릭터 · 파티 · 자동 전투.
 *
 * 이 게임이 새로 가는 방향이다 — 한 사람의 열 칸 장비 대신, 캐릭터를 모으고
 * 그 캐릭터의 고유장비를 키운다 (`core/chars`).
 *
 * 옛 장비 뭉치(`slices/gear`)는 아직 그대로 둔다. 저장된 계정에 장비가 들어
 * 있고, 그걸 지우는 건 캐릭터 쪽이 자리를 잡은 뒤에 해도 늦지 않다.
 * 두 체계가 잠깐 같이 있는 건 괜찮지만, **서로 참조하지는 않는다.**
 */
import {
  CHARS, CharId, MAX_GEAR_LV, OwnedChar,
  gearCost, gearOdds, isCharId, newChar,
} from '@/core/chars';
import { PARTY_SIZE, Party, cleanParty } from '@/core/party';
import { drawChar, poolOf, recruitCost } from '@/core/recruit';
import {
  BattleState, applyHit, applySkill, battleTick, callBoss, fightHeld, leaveFor,
  TICK_MS,
} from '@/core/autoBattle';
import type { SliceGet, SliceSet } from './kit';

export interface RosterActions {
  /** 캐릭터를 얻는다. 이미 있으면 false */
  recruit: (id: CharId) => boolean;
  /** 파티 자리에 넣는다. `id` 가 null 이면 비운다 */
  setPartySlot: (slot: number, id: CharId | null) => void;
  /** 고유장비를 한 번 두들긴다 */
  enhanceGear: (id: CharId) => 'up' | 'fail' | 'max' | 'poor' | 'none';
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
   * 한 명이 검을 내려친 순간. 그 사람 공격력만큼 맨 앞 적에게 들어간다.
   *
   * 화면(`Fighter`)이 부른다 — 틱이 아니라 **휘두름**이 때리는 순간이다.
   */
  /** @param aim 화면이 이미 고른 자리. 없으면 확률대로 여기서 고른다 */
  strikeFoe: (who: string, aim?: number) => void;
  /**
   * 스킬 — 횡으로 베며 검기를 날린다. 앞의 세 마리를 1.5배로 친다.
   *
   * `strikeFoe` 와 같은 자리에서 같은 방식으로 처리한다 — 잡으면 보상과
   * 경험치가 같이 들어간다.
   */
  /**
   * 기술을 쓴다.
   *
   * @param at   맞는 자리들. 화면이 골라서 넘긴다
   * @param slot 기술이 여럿이면 몇 번째 것인가 (`core/chars` 의 `skillsOf`
   *             순서). 안 주면 첫 번째 — 지금은 다들 하나씩이라 늘 0 이다
   */
  skillFoe: (who: string, at?: readonly number[], slot?: number) => void;
  /**
   * 골드로 한 명 모집한다.
   *
   * 안 가진 사람 중에서만 나온다 — 중복을 쓸 데가 없는데 중복을 주면
   * 뽑을수록 허탕이 는다.
   */
  recruitDraw: () => { id: CharId } | 'poor' | 'full';
}

export const createRosterSlice = (
  set: SliceSet,
  get: SliceGet,
): RosterActions => ({
  recruit: (id) => {
    if (!isCharId(id)) return false;
    const st = get();
    if (st.chars[id]) return false;
    const chars = { ...st.chars, [id]: newChar(id) };

    /*
      빈 자리가 있으면 **바로 세워 준다.**

      얻자마자 파티에 넣어야 쓸 수 있게 하면, 처음 얻은 사람이 "얻었는데 왜
      아무 일도 안 일어나지" 로 멈춘다. 자리가 다 찼을 때만 직접 고르게 한다.
    */
    const party = [...st.party];
    const empty = party.indexOf(null);
    if (empty >= 0) party[empty] = id;

    set({ chars, party });
    get().toast(`${CHARS[id].name} 합류!`, 'good');
    return true;
  },

  setPartySlot: (slot, id) => {
    if (slot < 0 || slot >= PARTY_SIZE) return;
    const st = get();
    if (id !== null && !st.chars[id]) return;
    const party = [...st.party];
    /*
      이미 다른 자리에 서 있으면 **자리를 맞바꾼다.**

      그냥 넣으면 같은 캐릭터가 두 자리에 서서 전투력이 두 번 세어진다.
      비우고 넣으면 원래 있던 자리가 빈 채로 남아 한 명이 줄어든다.
      바꿔치기가 둘 다 안 생기는 유일한 처리다.
    */
    if (id !== null) {
      const at = party.indexOf(id);
      if (at >= 0) party[at] = party[slot];
    }
    party[slot] = id;
    set({ party });
  },

  enhanceGear: (id) => {
    const st = get();
    const c = st.chars[id];
    if (!c) return 'none';
    if (c.gearLv >= MAX_GEAR_LV) return 'max';
    const cost = gearCost(c.gearLv);
    if (st.money < cost) return 'poor';

    const up = Math.random() < gearOdds(c.gearLv);
    /*
      고유장비는 **부서지지도 내려가지도 않는다** (`core/chars` 참고).
      실패하면 돈만 나간다. 캐릭터 자신인 물건을 잃게 만들 수는 없다.
    */
    const next: OwnedChar = up ? { ...c, gearLv: c.gearLv + 1 } : c;
    set({
      money: st.money - cost,
      chars: { ...st.chars, [id]: next },
    });
    return up ? 'up' : 'fail';
  },

  recruitDraw: () => {
    const st = get();
    const owned = Object.keys(st.chars);
    if (!poolOf(owned).length) return 'full';
    const cost = recruitCost(owned.length);
    if (st.money < cost) return 'poor';

    const id = drawChar(owned);
    if (!id) return 'full';

    /*
      돈은 여기서 뺀다.

      `recruit` 을 부르면 그 안에서 또 `set` 이 돈다. 골드 차감을 그쪽에
      맡기면 "뽑았는데 돈이 안 빠진" 중간 상태가 한 프레임 보인다.
    */
    set({ money: st.money - cost });
    get().recruit(id);
    return { id };
  },

  strikeFoe: (who, aim) => {
    const st = get();
    /* 판 연출 중에는 안 때린다 — 막 뒤에서 적이 녹아 있으면 안 된다 */
    if (fightHeld(st.battle)) return;
    const { battle, ev } = applyHit(st.battle, who, st.party, st.chars, Math.random, aim);
    if (ev.hit <= 0) return;

    if (!ev.killed) {
      set({ battle });
      return;
    }

    /*
      잡았다 — 골드와 경험치가 같이 들어간다.

      넷이 각자 제 박자로 부르지만 `set` 은 동기라 겹칠 자리가 없다.
      `get()` 이 매번 최신 상태를 읽으므로 두 사람이 같은 적을 두 번
      죽이는 일도 안 생긴다 (`autoEnhanceStep` 과 같은 이유).
    */
    /*
      잡으면 **골드만** 들어온다.

      예전에는 여기서 경험치도 나눠 줬다. 캐릭터가 자라는 길을 고유장비 강화
      하나로 모으면서 (`core/chars`) 경험치를 없앴다 — 켜 두면 저절로 오르는
      것과 골드를 써서 올리는 것이 나란히 있으면, 고를 것이 없어진다.
    */
    set({ battle, money: st.money + ev.gold });
  },

  skillFoe: (who, at, slot) => {
    const st = get();
    if (fightHeld(st.battle)) return;
    const { battle, ev } = applySkill(
      st.battle, who, st.party, st.chars, Math.random, at, slot ?? 0,
    );
    /*
      회복형은 피해가 0 이다.

      `ev.hit <= 0` 만 보고 돌아가고 있었다. 그러면 사제가 기도를 해도 채워진
      체력이 저장되지 않는다 — 계산은 맞는데 아무 일도 안 일어난다.
    */
    if (ev.hit <= 0 && ev.healed <= 0) return;
    if (!ev.killed) { set({ battle }); return; }

    /*
      잡으면 **골드만** 들어온다.

      예전에는 여기서 경험치도 나눠 줬다. 캐릭터가 자라는 길을 고유장비 강화
      하나로 모으면서 (`core/chars`) 경험치를 없앴다 — 켜 두면 저절로 오르는
      것과 골드를 써서 올리는 것이 나란히 있으면, 고를 것이 없어진다.
    */
    set({ battle, money: st.money + ev.gold });
  },

  goStage: (stage) => {
    const st = get();
    /*
      **바로 안 옮긴다.** 화면을 먼저 덮고, 다 덮인 뒤에 틱이 옮긴다
      (`leaveFor` → `battleTick`). 그 자리에서 갈아 치우면 적이 바뀌는
      순간이 막이 오기 전에 다 보인다 — 실제로 그렇게 보였다.
    */
    const next = leaveFor(st.battle, stage);
    if (next === st.battle) return false;
    set({ battle: next });
    return true;
  },

  callBossNow: () => {
    const st = get();
    const next = callBoss(st.battle);
    if (next === st.battle) return false;
    set({ battle: next });
    return true;
  },

  battleTickOnce: () => {
    const st = get();
    const { battle, ev } = battleTick(st.battle, st.party, st.chars);

    /*
      아무것도 안 바뀌었으면 `set` 을 부르지 않는다 — 파티가 비어 있을 때
      0.5초마다 리렌더가 돌면 안 된다.

      ── 왜 통째로 비교하나 (우두머리가 공격을 안 하던 버그) ──

      여기는 원래 볼 칸을 **하나씩 나열**하고 있었다. `stage`, `boss`,
      `msLeft`, `hp`, `down`, `slain`, 적의 `hp`/`k`/`id`... 그런데 적 시계
      (`FoeSlot.cd`) 가 빠져 있었다.

      잡몹 구간에서는 안 드러난다. `msLeft` 가 매 틱 줄어들어서 언제나
      "바뀌었다" 가 되기 때문이다. 그런데 **우두머리 구간에서는 시간이
      멈춘다** (`battleTick` 의 `if (!isBoss) msLeft = ...`). 적도 한 마리라
      수가 안 변하고, 체력은 우두머리가 실제로 때려야 변한다.

      그래서 우두머리가 치지 않는 틱에는 바뀌는 것이 `cd` 하나뿐인데, 그걸
      안 보니 "안 바뀌었다" 가 되어 **줄어든 시계가 통째로 버려졌다.** 시계는
      매 틱 1500 에서 1000 으로 줄었다가 1500 으로 되돌아갔고, 영영 0 에
      못 닿았다. 화면에서는 우두머리가 가만히 서 있기만 했다.

      나열해서 비교하는 방식이면 칸을 더할 때마다 여기도 같이 고쳐야 하고,
      안 고쳐도 아무 데서도 안 터진다 — 그냥 그 칸의 변화가 조용히 사라진다.
      그래서 나열을 그만두고 통째로 비교한다. 빠뜨릴 칸이 없다.

      비용은 쟀다: `battle` 은 327바이트고 한 번 비교에 0.0027ms, 0.5초에 한
      번이니 초당 0.005ms 다. 틀리는 방향도 안전하다 — 키 순서가 달라 다르게
      보이면 리렌더가 한 번 더 돌 뿐, 상태를 버리지는 않는다. 반대 방향으로
      틀리는 것(안 바뀐 걸로 보고 버리는 것)이 방금 그 버그였다.
    */
    if (JSON.stringify(battle) === JSON.stringify(st.battle)) return;

    if (!ev.killed) {
      set({ battle });
      return;
    }

    /*
      잡았다 — 골드와 경험치가 같이 들어간다.

      경험치는 **파티에 서 있는 사람에게만** 준다. 가지고 있는 모두에게 주면
      파티를 고를 이유가 없어지고, 창고에 쌓아 둔 열두 명이 저절로 만렙이 된다.
    */
    /*
      잡으면 **골드만** 들어온다.

      예전에는 여기서 경험치도 나눠 줬다. 캐릭터가 자라는 길을 고유장비 강화
      하나로 모으면서 (`core/chars`) 경험치를 없앴다 — 켜 두면 저절로 오르는
      것과 골드를 써서 올리는 것이 나란히 있으면, 고를 것이 없어진다.
    */
    set({ battle, money: st.money + ev.gold });
  },
});

/** 화면이 쓰는 틱 간격 */
export { TICK_MS };
export type { BattleState, Party };
export { cleanParty };
