/**
 * 캐릭터 · 파티 · 자동 전투.
 *
 * 이 게임이 새로 가는 방향이다 — 한 사람의 열 칸 장비 대신, 캐릭터를 모으고
 * 그 캐릭터를 레벨·성으로 키운다 (`core/chars`).
 *
 * 옛 장비 뭉치(`slices/gear`)는 아직 그대로 둔다. 저장된 계정에 장비가 들어
 * 있고, 그걸 지우는 건 캐릭터 쪽이 자리를 잡은 뒤에 해도 늦지 않다.
 * 두 체계가 잠깐 같이 있는 건 괜찮지만, **서로 참조하지는 않는다.**
 */
import {
  AWAKEN_COPIES, AWAKEN_ELIXIR, CHARS, CharId, FREE_ENHANCE, OwnedChar,
  STAR_CAP, canAwaken, capOf, isCharId, lvCost, maxStar, newChar, starUpCost,
} from '@/core/chars';
import { FormationId, PARTY_SIZE, Party, cleanParty, seatRows } from '@/core/party';
import { allOwned, drawChar, poolOf, recruitCost } from '@/core/recruit';
import { whyLocked } from '@/core/skillTree';
import { optKey } from '@/core/skillOpt';
import {
  BattleState, applyHit, applySkill, battleTick, callBoss, fightHeld, forceRage,
  leaveFor, TICK_MS,
} from '@/core/autoBattle';
import { useBattleUi } from '../battleUi';
import type { SliceGet, SliceSet } from './kit';

export interface RosterActions {
  /** 캐릭터를 얻는다. 이미 있으면 false */
  recruit: (id: CharId) => boolean;
  /** 파티 자리에 넣는다. `id` 가 null 이면 비운다 */
  setPartySlot: (slot: number, id: CharId | null) => void;
  /**
   * 대형을 바꾼다 (`core/party` 의 `FORMATIONS`).
   *
   * **다음 판부터 들어간다** (`pendingFormation`). 판 중간에 바뀌던 것을
   * 미루기로 했다 — 이유는 `state/types` 의 `pendingParty` 에 적어 두었다.
   */
  setFormation: (f: FormationId) => void;
  /** 짜 둔 편성을 버린다 — 아직 안 들어간 것만 사라진다 */
  clearPending: () => void;
  /*
    여기 `enhanceGear` 와 `setGear` 가 있었다 — 전용무기(고유장비)를 골드로
    두들기는 것. 개념째로 걷었다 (`core/chars` 참고). 그 자리는 레벨 올리기가
    받는다 (`levelUp`).
  */
  /**
   * 스킬 설정을 바꾼다 (`core/skillOpt`).
   *
   * 기본값과 같은 값을 골라도 그대로 적어 둔다. 지우면 "고른 적 없음" 과
   * 구분이 안 되고, 나중에 기본값을 바꾸면 사람이 골라 둔 것이 조용히 같이
   * 바뀐다.
   */
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
  /**
   * 한 명이 검을 내려친 순간. 그 사람 공격력만큼 맨 앞 적에게 들어간다.
   *
   * 화면(`Fighter`)이 부른다 — 틱이 아니라 **휘두름**이 때리는 순간이다.
   */
  /** @param aim 화면이 이미 고른 자리. 없으면 확률대로 여기서 고른다 */
  /** @param mul 이 한 대의 배수 — 비앙카의 과열이 둘째 대에 1.5 를 준다 */
  /**
   * 한 대 친다. **요정의 화살이 터진 만큼**을 돌려준다 (`TickEvent.fey`).
   *
   * 돌려주는 이유는 화면이 그릴 것이 있어서다 — 그 한 대만 작은 화살로
   * 따로 그린다 (`BattleView` 의 `FeyDart`). 안 터졌으면 0.
   */
  strikeFoe: (who: string, aim?: number, mul?: number, ally?: string | null) => number;
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
  recruitDraw: () => { id: CharId; dup: boolean } | 'poor' | 'full';
  /**
   * ── 캐릭터가 자라는 축 ── (`core/growth`)
   *
   * 레벨은 골드로, 성은 **같은 사람 조각**으로 오른다. 서로 다른 것을
   * 먹으므로 한쪽이 다른 쪽을 대신하지 못한다.
   *
   * 여기 셋째로 강화(`enhanceGear`)가 있었다 — 걷었다. 골드만 있으면 늘
   * 오르는 값이라 레벨과 먹는 것이 같았고, 같은 것을 먹는 축은 축이 아니라
   * 같은 축의 두 번째 이름이다.
   */
  /** 레벨 한 칸. 골드를 쓰고 실패하지 않는다 */
  levelUp: (id: CharId) => 'up' | 'max' | 'poor' | 'none';
  /** 조각을 합쳐 한 성 (`starUpCost` — 1성 조각으로 1·2·4·8장) */
  starUp: (id: CharId) => 'up' | 'max' | 'short' | 'none';
  /** 5성 위의 한 단계 — 조각 서른둘과 강성의 영약 하나. 신화만 */
  awaken: (id: CharId) => 'ok' | 'no' | 'short' | 'none';
  /** ⚠ 테스트용 — 성 · 레벨 · 조각을 그 자리에서 정한다 (`FREE_ENHANCE` 일 때만) */
  setGrowth: (id: CharId, at: { copies?: number; lv?: number; star?: number }) => void;
  /**
   * 스킬 트리의 갈래 하나를 찍는다 (`core/skillTree`).
   *
   * 못 찍는 자리면 아무 일도 안 하고 이유를 돌려준다 — 화면이 그 이유를
   * 그대로 띄운다. 성이 모자란 것과 짝을 이미 찍은 것은 다른 이야기이고,
   * 사람은 그 둘을 알아야 다음에 무엇을 할지 안다.
   */
  pickSkill: (id: CharId, node: string) => string | null;
  /**
   * 찍은 것을 전부 되돌린다.
   *
   * **공짜다.** 갈래가 되돌릴 수 없으면 찍는 것이 곧 되돌릴 수 없는 선택이
   * 되고, 그러면 사람은 위키를 찾아보고 나서야 누른다. 이 게임에서 고르는
   * 재미는 "이번엔 이쪽으로 키워 볼까" 이지 "틀리면 끝" 이 아니다.
   */
  resetSkills: (id: CharId) => void;
}

/**
 * 대형에 앉힌 명부 — **전투 계산에 들어가는 몸.**
 *
 * 앞줄은 방어가 1.5배, 뒷줄은 공격이 1.15배다 (`core/party` 의 `ROW_MOD`).
 * 한 틱짜리 계산(`battleTick`)은 제 안에서 알아서 앉히지만, 화면이 휘두름
 * 하나마다 부르는 `applyHit`·`applySkill` 은 여기서 앉혀 넣어야 한다 —
 * 안 그러면 **틱은 줄 배수로 계산하고 평타는 맨 몸으로 계산한다.**
 */
const seated = (st: { party: Party; chars: Record<string, OwnedChar>; formation: FormationId }) =>
  seatRows(st.party, st.chars, st.formation);

/**
 * 짜 둔 편성을 **실제로 들여보낸다** — 판이 바뀌는 그 순간에 한 번.
 *
 * 부르는 자리가 둘이다: 판이 저절로 넘어갈 때(`battleTickOnce`)와 사람이
 * 골라 갈 때(`goStage`). 둘 다 "판 번호가 바뀌었다" 가 방아쇠이므로, 그
 * 판단은 부르는 쪽이 하고 여기서는 옮기기만 한다.
 *
 * 파티는 한 번 더 다듬는다 (`cleanParty`) — 짜 두고 판이 끝나기를 기다리는
 * 동안 그 캐릭터가 없어졌을 수 있다.
 *
 * 예약이 없으면 아무 일도 안 한다. `set` 조차 안 부른다 — 판이 넘어갈
 * 때마다 상태를 건드리면 저장이 그만큼 더 돈다.
 */
const commitPending = (set: SliceSet, get: SliceGet) => {
  const st = get();
  if (st.pendingParty == null && st.pendingFormation == null) return;
  set({
    ...(st.pendingParty == null ? null : {
      party: cleanParty(st.pendingParty, Object.keys(st.chars) as CharId[]),
    }),
    ...(st.pendingFormation == null ? null : { formation: st.pendingFormation }),
    pendingParty: null,
    pendingFormation: null,
  });
};

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

  /*
    ── 편성은 **예약**이다 ──

    바꾼 것이 그 자리에서 안 들어간다. `pendingParty`·`pendingFormation` 에
    적어 두었다가 다음 판이 열릴 때 옮겨 간다 (`commitPending`).

    이유는 `state/types` 의 `pendingParty` 에 적어 두었다 — 요약하면, 판
    중간에 바뀌면 "위험할 때마다 대형을 바꾸는 것" 이 늘 최선이 되어
    자동 전투인데 손이 제일 바쁜 순간이 전투 중이 된다.

    **같은 값을 골라도 예약으로 남긴다.** 지우면 "안 바꿈" 과 "원래대로
    되돌림" 이 구분이 안 되는데, 뒤엣것은 사람이 방금 한 일이다.
  */
  setFormation: (f) => set({ pendingFormation: f }),

  clearPending: () => set({ pendingParty: null, pendingFormation: null }),

  setPartySlot: (slot, id) => {
    if (slot < 0 || slot >= PARTY_SIZE) return;
    const st = get();
    if (id !== null && !st.chars[id]) return;
    /* 이미 짜 둔 것이 있으면 그 위에, 없으면 지금 서 있는 넷에서 시작한다 */
    const party = [...(st.pendingParty ?? st.party)];
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
    set({ pendingParty: party });
  },

  setSkillOpt: (who, slot, opt) => {
    const st = get();
    const key = optKey(who, slot);
    if (st.skillOpts[key] === opt) return;
    set({ skillOpts: { ...st.skillOpts, [key]: opt } });
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
      ── 이미 가진 사람이면 **조각 한 장** ──

      열둘을 다 모으면 그때부터 나오는 것이 조각이다 (`core/recruit` 의
      `allOwned`). 예전에는 여기서 `'full'` 을 돌려주고 모집이 닫혔는데,
      성 체계가 생기면서 (`core/growth`) 조각이 쓸 데가 생겼다.

      값은 그대로다 (`recruitCost` 는 가진 **사람 수**로 오른다). 다 모은
      뒤로는 값이 더 안 오르므로, 조각은 늘 같은 값에 한 장씩 쌓인다.
    */
    const dup = !!st.chars[id];

    /*
      돈은 여기서 뺀다.

      `recruit` 을 부르면 그 안에서 또 `set` 이 돈다. 골드 차감을 그쪽에
      맡기면 "뽑았는데 돈이 안 빠진" 중간 상태가 한 프레임 보인다.
    */
    set({ money: st.money - cost });
    if (dup) {
      const c = get().chars[id];
      set({ chars: { ...get().chars, [id]: { ...c, copies: c.copies + 1 } } });
    } else {
      get().recruit(id);
    }
    return { id, dup };
  },

  levelUp: (id) => {
    const st = get();
    const c = st.chars[id];
    if (!c) return 'none';
    if (c.lv >= capOf(c)) return 'max';
    /* 강화와 같은 스위치를 탄다 — 시험 중에는 둘 다 공짜여야 짝이 맞는다 */
    const cost = FREE_ENHANCE ? 0 : lvCost(c.lv);
    if (st.money < cost) return 'poor';
    set({
      money: st.money - cost,
      chars: { ...st.chars, [id]: { ...c, lv: c.lv + 1 } },
    });
    return 'up';
  },

  starUp: (id) => {
    const st = get();
    const c = st.chars[id];
    if (!c) return 'none';
    /* 등급이 상한이다 — 일반은 1성에서, 희귀는 3성에서 멈춘다 */
    if (c.star >= maxStar(CHARS[id].rarity)) return 'max';
    const need = starUpCost(c.star);
    if (c.copies < need) return 'short';
    /*
      **레벨은 안 건드린다.** 성이 올려 주는 것은 상한이지 지금 값이 아니다
      (`core/growth`). 올라간 상한만큼은 골드로 따로 올려야 한다.
    */
    set({
      chars: { ...st.chars, [id]: { ...c, star: c.star + 1, copies: c.copies - need } },
    });
    return 'up';
  },

  setGrowth: (id, at) => {
    /* 테스트 스위치가 꺼져 있으면 없는 기능이다 (`FREE_ENHANCE`) */
    if (!FREE_ENHANCE) return;
    const st = get();
    const c = st.chars[id];
    if (!c) return;
    const next = { ...c };
    if (at.copies !== undefined) next.copies = Math.max(0, Math.floor(at.copies));
    /*
      ── 성을 오르내린다 ──

      등급 상한은 지킨다 (`maxStar`). 시험이라고 희귀를 5성으로 만들면
      "등급이 상한을 정한다" 는 규칙 자체를 못 보게 된다.

      **레벨을 같이 조인다.** 4성 Lv100 에서 1성으로 내리면 상한이 35 인데
      레벨이 100 으로 남아, 화면에는 `Lv 100 / 35` 가 뜨고 스탯은 100 짜리로
      계산된다.

      찍어 둔 트리는 **안 지운다.** 성이 모자란 자리는 어차피 안 걸리고
      (`activeNodes`), 다시 올리면 그대로 돌아온다 — 성을 오르내리며 보는
      것이 이 단추의 용도인데 그때마다 다시 찍게 하면 못 쓴다.
    */
    if (at.star !== undefined) {
      next.star = Math.max(1, Math.min(maxStar(CHARS[id].rarity), Math.floor(at.star)));
      next.awake = next.awake && next.star >= STAR_CAP;
      next.lv = Math.min(next.lv, capOf(next));
    }
    /* 레벨은 지금 성의 상한을 넘길 수 없다 — 시험이라고 규칙을 어기면 안 본다 */
    if (at.lv !== undefined) next.lv = Math.max(1, Math.min(capOf(next), Math.floor(at.lv)));
    set({ chars: { ...st.chars, [id]: next } });
  },

  pickSkill: (id, node) => {
    const st = get();
    const c = st.chars[id];
    if (!c) return '없는 캐릭터입니다';
    const why = whyLocked(id, c.star, c.tree, node);
    if (why) return why;
    set({ chars: { ...st.chars, [id]: { ...c, tree: [...c.tree, node] } } });
    return null;
  },

  resetSkills: (id) => {
    const st = get();
    const c = st.chars[id];
    if (!c || !c.tree.length) return;
    set({ chars: { ...st.chars, [id]: { ...c, tree: [] } } });
  },

  awaken: (id) => {
    const st = get();
    const c = st.chars[id];
    if (!c) return 'none';
    /* 신화만, 그리고 5성을 다 채운 뒤에만 */
    if (!canAwaken(CHARS[id].rarity) || c.star < STAR_CAP || c.awake) return 'no';
    if (c.copies < AWAKEN_COPIES || st.elixir < AWAKEN_ELIXIR) return 'short';
    set({
      elixir: st.elixir - AWAKEN_ELIXIR,
      chars: {
        ...st.chars,
        [id]: { ...c, awake: true, copies: c.copies - AWAKEN_COPIES },
      },
    });
    return 'ok';
  },

  strikeFoe: (who, aim, mul, ally) => {
    const st = get();
    /* 판 연출 중에는 안 때린다 — 막 뒤에서 적이 녹아 있으면 안 된다 */
    if (fightHeld(st.battle)) return 0;
    const { battle, ev } = applyHit(
      st.battle, who, st.party, seated(st), Math.random, aim, mul, ally,
    );
    /*
      ── 돌아서서 아군을 쳤나 ──

      혼란에 걸린 사람은 적이 아니라 아군을 친다 (`core/autoBattle` 의
      `applyHit`). 그때는 `ev.hit` 이 0 이고 `ev.taken` 에 값이 들어간다 —
      **적에게 들어간 피해가 아니기 때문**이다.

      무대는 체력 기록만 보므로 그 한 대가 우두머리 것인지 우리 편 것인지
      못 가른다. 여기서 알려 준다 (`state/battleUi`) — 계산을 부른 쪽만
      "누가 쳐서 누가 맞았나" 를 둘 다 안다.
    */
    if (ev.taken > 0 && ev.hurt) {
      useBattleUi.getState().hitByAlly(who, ev.hurt);
      set({ battle });
      return 0;
    }
    if (ev.hit <= 0) return 0;

    if (!ev.killed) {
      set({ battle });
      return ev.fey;
    }

    /*
      잡았다 — 골드와 경험치가 같이 들어간다.

      넷이 각자 제 박자로 부르지만 `set` 은 동기라 겹칠 자리가 없다.
      `get()` 이 매번 최신 상태를 읽으므로 두 사람이 같은 적을 두 번
      죽이는 일도 안 생긴다 (`autoEnhanceStep` 과 같은 이유).
    */
    /*
      잡으면 **골드만** 들어온다.

      예전에는 여기서 경험치도 나눠 줬다. 캐릭터가 자라는 길을 강화
      하나로 모으면서 (`core/chars`) 경험치를 없앴다 — 켜 두면 저절로 오르는
      것과 골드를 써서 올리는 것이 나란히 있으면, 고를 것이 없어진다.
    */
    set({ battle, money: st.money + ev.gold, elixir: st.elixir + ev.elixir });
    /* 요정의 화살이 터진 만큼 — 화면이 그 한 대만 따로 그린다 (`ev.fey`) */
    return ev.fey;
  },

  skillFoe: (who, at, slot) => {
    const st = get();
    if (fightHeld(st.battle)) return;
    const { battle, ev } = applySkill(
      st.battle, who, st.party, seated(st), Math.random, at, slot ?? 0, st.skillOpts,
    );
    /*
      ── 아무 일도 안 일어났나 ──

      `ev.hit <= 0` 만 보고 돌아가고 있었다. 그러면 사제가 기도를 해도 채워진
      체력이 저장되지 않는다 — 계산은 맞는데 아무 일도 안 일어난다. 그래서
      회복을 조건에 더했고, 도발·광란·정화가 생기면서 또 같은 일이 났다.

      이제 **엔진이 "바뀌었다" 를 말한다** (`TickEvent.applied`). 갈래가 늘
      때마다 여기에 항을 더하는 방식은 늘 뒤늦게 고쳐진다.
    */
    if (!ev.applied && ev.hit <= 0 && ev.healed <= 0) return;
    if (!ev.killed) { set({ battle }); return; }

    /*
      잡으면 **골드만** 들어온다.

      예전에는 여기서 경험치도 나눠 줬다. 캐릭터가 자라는 길을 강화
      하나로 모으면서 (`core/chars`) 경험치를 없앴다 — 켜 두면 저절로 오르는
      것과 골드를 써서 올리는 것이 나란히 있으면, 고를 것이 없어진다.
    */
    set({ battle, money: st.money + ev.gold, elixir: st.elixir + ev.elixir });
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
    /* 판을 옮겼으니 짜 둔 편성이 여기서 들어간다 (`commitPending`) */
    commitPending(set, get);
    return true;
  },

  callBossNow: () => {
    const st = get();
    const next = callBoss(st.battle);
    if (next === st.battle) return false;
    set({ battle: next });
    return true;
  },

  /* ⚠ 테스트용 — 두 분을 기다리지 않고 광폭화를 본다 (`forceRage`) */
  rageNow: () => {
    const st = get();
    const next = forceRage(st.battle);
    if (next === st.battle) return false;
    set({ battle: next });
    return true;
  },

  battleTickOnce: () => {
    const st = get();
    const { battle, ev } = battleTick(st.battle, st.party, st.chars, st.formation);

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

    /*
      ── 판이 **다시 열리면** 짜 둔 편성이 들어간다 ──

      한동안 `battle.stage` 가 바뀌는 것만 봤다. 그런데 판 번호는 마지막
      판에서 안 바뀐다 — `nextStage` 가 `STAGE_CAP` 에 걸려 제자리에
      머물기 때문이다 (지금은 30판). 그래서 **마지막 판을 도는 사람은
      대형을 바꿔도 영영 안 들어갔다.** 눌리기는 눌리고 (`pendingFormation`
      에 남는다) 무대에서는 아무 일도 안 일어나는, 화면에 아무 표시도 없는
      고장이었다.

      이제 `costSeq` 를 본다. 저건 **판이 처음부터 세워질 때마다** 오르는
      번호이고 (`core/autoBattle` 의 `openStage`), 그게 곧 "지금 편성을
      갈아 끼워도 되는 순간" 이다 — 판을 넘어가든, 같은 판을 다시 돌든,
      전멸해서 다시 서든 셋 다 여기를 지난다.

      판 번호도 같이 본다. 둘 중 하나만으로 충분해 보이지만, 저 번호는
      낡은 저장본에서 없을 수 있어 `Number.isFinite` 로 걸러진 뒤 0 으로
      눌러앉을 수 있다.

      `set({ battle })` **앞에** 부른다. 뒤에 부르면 새 판의 첫 틱이 옛
      파티로 한 번 돌고, 그 한 틱에 맞은 사람은 편성표에 없는 사람이다.
    */
    if (
      battle.stage !== st.battle.stage
      || battle.costSeq !== st.battle.costSeq
    ) commitPending(set, get);

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

      예전에는 여기서 경험치도 나눠 줬다. 캐릭터가 자라는 길을 강화
      하나로 모으면서 (`core/chars`) 경험치를 없앴다 — 켜 두면 저절로 오르는
      것과 골드를 써서 올리는 것이 나란히 있으면, 고를 것이 없어진다.
    */
    set({ battle, money: st.money + ev.gold, elixir: st.elixir + ev.elixir });
  },
});

/** 화면이 쓰는 틱 간격 */
export { TICK_MS };
export type { BattleState, Party };
export { cleanParty };
