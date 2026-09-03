/**
 * ── 쌓이는 보상 ── 게이지를 받고, 다이아로 채우고, 비운 동안의 몫을 받는다.
 *
 * 판단은 전부 `core/idle` 이 한다 (얼마나 찼나 · 얼마어치인가 · 무엇이
 * 나오나). 여기는 **적용**만 한다 — 이 프로젝트의 규칙이다 (`store.ts`).
 *
 * 셋이 같은 함수로 끝난다 (`grant`). 받는 경로가 셋이라고 주는 규칙이 셋이면
 * 어느 하나만 다르게 고치는 날이 오고, 그건 "게이지로 받으면 재료가 안 나온다"
 * 같은 모양으로 나타난다.
 */
import type { Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { killGold } from '@/core/autoBattle';
import {
  INSTANT_DIA, Loot, gaugeFull, instantDia, lootLabel, maxValue, offlineAt, rollLoot,
} from '@/core/idle';
import type { MaterialId } from '@/core/artisans';
import type { ScrollId } from '@/core/types';
import { dayKey } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type IdleActions = Pick<
  Store,
  'claimIdle' | 'instantIdle' | 'claimAway' | 'dismissAway'
>;

/**
 * 전리품을 실제로 넣는다. **한 덩이로 넣는다** — 줄마다 `set` 을 부르면
 * 그 사이 상태로 화면이 한 번씩 그려져서 골드가 먼저 오르고 재료가 나중에
 * 오르는 것이 눈에 보인다.
 */
function grant(set: SliceSet, get: SliceGet, loot: readonly Loot[]): void {
  const st = get();
  let money = st.money;
  let dia = st.dia;
  const materials = { ...st.materials };
  const scrolls = { ...st.scrolls };

  for (const l of loot) {
    if (l.kind === 'gold') money += Math.max(0, Math.round(l.n));
    else if (l.kind === 'dia') dia += Math.max(0, Math.round(l.n));
    else if (l.kind === 'mat') {
      const id: MaterialId = l.id;
      materials[id] = (materials[id] ?? 0) + Math.max(0, Math.round(l.n));
    } else {
      const id: ScrollId = l.id;
      scrolls[id] = (scrolls[id] ?? 0) + Math.max(0, Math.round(l.n));
    }
  }

  set({ money, dia, materials, scrolls });
}

/** 이 판에서 가득 찬 게이지 한 번이 주는 값 */
const valueOf = (stage: number): number => maxValue(killGold(stage, false));

export const createIdleSlice = (
  set: SliceSet,
  get: SliceGet,
): IdleActions => ({
  /**
   * 게이지를 받는다. **가득 찼을 때만.**
   *
   * 반쯤 찬 것을 받게 두면 게이지를 계속 두드리는 것이 최선이 된다 — 그건
   * 방치형이 없애려던 바로 그 일이다.
   */
  claimIdle: () => {
    const st = get();
    const now = Date.now();
    if (!gaugeFull(now - st.idleAt)) {
      get().toast('아직 다 안 찼습니다', 'bad');
      return false;
    }
    const loot = rollLoot(valueOf(st.battle.stage));
    grant(set, get, loot);
    set({ idleAt: now });
    get().toast(loot.map(lootLabel).join(' · '), 'good');
    return true;
  },

  /**
   * 다이아로 **그 자리에서** 가득 채워 받는다. 하루 세 번 (`INSTANT_DIA`).
   *
   * 게이지가 이미 가득 찼으면 안 쓴다 — 그냥 누르면 되는 것에 다이아를
   * 받으면 그건 실수를 파는 것이다.
   */
  instantIdle: () => {
    const st = get();
    const now = Date.now();
    const today = dayKey(now);
    const used = st.idleInstant.dayKey === today ? st.idleInstant.used : 0;
    const price = instantDia(used);

    if (price === null) {
      get().toast(`즉시 수령은 하루 ${INSTANT_DIA.length}번까지입니다`, 'bad');
      return false;
    }
    if (gaugeFull(now - st.idleAt)) {
      get().toast('이미 가득 찼습니다 — 그냥 받으세요', 'bad');
      return false;
    }
    if (st.dia < price) {
      get().toast(`다이아 ${price - st.dia} 부족합니다`, 'bad');
      return false;
    }

    const loot = rollLoot(valueOf(st.battle.stage));
    grant(set, get, loot);
    set({
      dia: get().dia - price,
      idleAt: now,
      idleInstant: { dayKey: today, used: used + 1 },
    });
    get().toast(loot.map(lootLabel).join(' · '), 'good');
    return true;
  },

  /**
   * 자리를 비운 동안의 몫을 받는다.
   *
   * 여덟 시간이 가득 찬 게이지 **한 번분**이다 (`core/idle` 머리말에 이유가
   * 있다). 그 아래는 비례해서 준다 — 두 시간 비웠으면 4분의 1이다.
   */
  claimAway: () => {
    const st = get();
    const share = offlineAt(st.awayMs);
    if (share <= 0) return false;
    const loot = rollLoot(Math.max(1, Math.round(valueOf(st.battle.stage) * share)));
    grant(set, get, loot);
    set({ awayMs: 0 });
    get().toast(loot.map(lootLabel).join(' · '), 'good');
    return true;
  },

  /**
   * 안 받고 닫는다.
   *
   * **그래도 없앤다.** 안 없애면 앱을 켤 때마다 같은 상자가 다시 나오고,
   * 그건 닫을 수 없는 팝업이다. 받을지 말지는 한 번만 묻는다.
   */
  dismissAway: () => set({ awayMs: 0 }),
});
