/**
 * 채집 · 수렵 · 낚시.
 *
 * `store.ts` 한 파일에 3,600줄이 있던 시절에는 액션 하나를 고치려고 열 때마다
 * 관계없는 스무 개를 지나야 했다. 여기 있는 것들은 **같이 고쳐지는 것끼리** 모았다.
 *
 * 이 파일은 스토어를 만들지 않는다 — 액션 뭉치를 돌려줄 뿐이고, 조립은
 * `store.ts` 가 한다. 그래서 저장·마이그레이션·미들웨어는 여전히 한 곳에만 있다.
 * `get()` 은 **스토어 전체**를 주므로 다른 뭉치의 액션도 그대로 부를 수 있다.
 */
import type { Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { TitleId, effectsOf } from '@/core/titles';
import {
  ACTIVITY_DEFS,
  GRADES as GATHER_ORDER,
  SPECIES_BY_ID,
  TOOLS,
  YIELD_PRICE,
  catchOne,
  dexRate,
  pendingDexRewards,
  toolBuyable,
  toolName,
  toolResellPrice,
  toolSellable,
} from '@/core/gathering';
import { fmt, g } from '@/core/currency';
import { MATERIALS, MATERIAL_PRICE } from '@/core/artisans';
import { dayKey, selMaxStamina } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type GatherActions = Pick<
  Store,
  'doGather' | 'buyTool' | 'equipTool' | 'sellMaterial' | 'sellYield' | 'sellTool'
  | 'claimDex'
>;

export const createGatherSlice = (
  set: SliceSet,
  get: SliceGet,
): GatherActions => ({
  // ── 채집 · 수렵 · 낚시 ────────────────────────────
  //
  // 이 게임에서 유일하게 안전한 활동이다 — 실패해도 산출물이 0 이 될 뿐
  // 장비도 돈도 잃지 않는다. 그래서 코어 루프(파산)를 건드리지 않는다.

  doGather: (a, score) => {
    const st = get();
    const eff = effectsOf(st.equippedTitle);
    const day = dayKey(Date.now());
    const used = st.gatherDaily.dayKey === day ? st.gatherDaily.used : { gather: 0, hunt: 0, fish: 0 };
    const def = ACTIVITY_DEFS[a];
    const limit = def.dailyLimit + (a === 'fish' ? eff.fishDailyAdd : 0);
    if (used[a] >= limit) {
      get().toast(`오늘 ${def.name}는 ${limit}회까지입니다`, 'bad');
      return null;
    }
    const cost = Math.max(0, def.stamina - eff.gatherStaminaCut);
    if (st.stamina < cost) { get().toast('체력이 부족합니다', 'bad'); return null; }

    const adj = Math.max(0, Math.min(100, score + (a === 'hunt' ? eff.huntScoreAdd : 0)));
    const got = catchOne(a, st.gatherTools[a], adj);

    const bagA = got
      ? { ...st.gatherBag, [got.species.id]: (st.gatherBag[got.species.id] ?? 0) + 1 }
      : st.gatherBag;
    set({
      stamina: st.stamina - cost,
      staminaAt: st.stamina >= selMaxStamina(st) ? Date.now() : st.staminaAt,
      gatherDaily: { dayKey: day, used: { ...used, [a]: used[a] + 1 } },
      gatherBag: bagA,
      gatherDex: got && !st.gatherDex.includes(got.species.id)
        ? [...st.gatherDex, got.species.id]
        : st.gatherDex,
    });
    if (!got) { get().toast('아무것도 얻지 못했습니다', 'plain'); return null; }
    const isNew = !st.gatherDex.includes(got.species.id);
    get().toast(
      `${got.species.name} (${got.grade}급)${isNew ? ' — 도감 신규!' : ''}`,
      isNew ? 'good' : 'plain');
    get().checkTitles();
    return { species: got.species.id, grade: got.grade };
  },

  buyTool: (a, grade) => {
    const st = get();
    const def = TOOLS[grade];
    const rate = dexRate(new Set(st.gatherDex));
    if (st.gatherOwned[a].includes(grade)) {
      get().toast('이미 가지고 있습니다', 'bad');
      return false;
    }
    if (!toolBuyable(grade, rate)) {
      get().toast(
        def.price === null ? '도감 100% 보상으로만 얻을 수 있습니다'
          : `도감 ${Math.round((def.unlockRate ?? 0) * 100)}% 를 채워야 살 수 있습니다`, 'bad');
      return false;
    }
    const price = def.price ?? 0;
    if (st.money < price) { get().toast('돈이 부족합니다', 'bad'); return false; }
    // 산 도구는 보유 목록에만 들어간다. 갈아 끼는 건 현장에서 한다
    set({
      money: st.money - price,
      gatherOwned: { ...st.gatherOwned, [a]: [...st.gatherOwned[a], grade] },
    });
    get().toast(`${toolName(a, grade)} 구매`, 'good');
    return true;
  },

  equipTool: (a, grade) => {
    const st = get();
    if (!st.gatherOwned[a].includes(grade)) {
      get().toast('가지고 있지 않은 도구입니다 — 상점에서 살 수 있습니다', 'bad');
      return false;
    }
    if (st.gatherTools[a] === grade) return false;
    set({ gatherTools: { ...st.gatherTools, [a]: grade } });
    get().toast(`${ACTIVITY_DEFS[a].name} 도구를 ${grade}급으로 바꿨습니다`, 'plain');
    return true;
  },

  sellMaterial: (id, qty = 1) => {
    const st = get();
    const have = st.materials[id] ?? 0;
    const n = Math.min(have, Math.max(1, Math.floor(qty)));
    if (n <= 0) return false;
    const materials = { ...st.materials };
    if (have - n > 0) materials[id] = have - n; else delete materials[id];
    set({ money: st.money + MATERIAL_PRICE * n, materials });
    get().toast(`${MATERIALS[id].name} ${n}개를 ${fmt(MATERIAL_PRICE * n)}에 팔았습니다`, 'good');
    return true;
  },

  sellYield: (species, qty = 1) => {
    const st = get();
    const sp = SPECIES_BY_ID[species];
    if (!sp) return false;
    const have = st.gatherBag[species] ?? 0;
    const n = Math.min(have, Math.max(1, Math.floor(qty)));
    if (n <= 0) return false;
    const bagA = { ...st.gatherBag };
    if (have - n > 0) bagA[species] = have - n; else delete bagA[species];
    set({ money: st.money + YIELD_PRICE[sp.grade] * n, gatherBag: bagA });
    return true;
  },

  /**
   * 도구 되팔기.
   *
   * 쓰던 것을 팔면 맨손이 되면 안 되므로, 팔린 게 끼고 있던 것이면
   * **남은 것 중 가장 좋은 것으로 자동으로 갈아 낀다.** F 는 늘 남아 있다.
   */
  sellTool: (a, grade) => {
    const st = get();
    if (!toolSellable(grade)) {
      get().toast('처음 받은 도구는 팔 수 없습니다', 'bad'); return false;
    }
    if (!st.gatherOwned[a].includes(grade)) return false;
    const rest = st.gatherOwned[a].filter((g) => g !== grade);
    const best = GATHER_ORDER.filter((g) => rest.includes(g)).pop() ?? 'F';
    set({
      money: st.money + toolResellPrice(grade),
      gatherOwned: { ...st.gatherOwned, [a]: rest },
      gatherTools: st.gatherTools[a] === grade
        ? { ...st.gatherTools, [a]: best }
        : st.gatherTools,
    });
    get().toast(`${toolName(a, grade)}을(를) ${fmt(toolResellPrice(grade))}에 팔았습니다`, 'good');
    return true;
  },

  claimDex: (id) => {
    const st = get();
    const pend = pendingDexRewards(new Set(st.gatherDex), st.gatherDexClaimed);
    const r = pend.find((x) => x.id === id);
    if (!r) return false;
    set({
      money: st.money + r.money,
      gatherDexClaimed: [...st.gatherDexClaimed, r.id],
      titles: r.title && !st.titles.includes(r.title as TitleId)
        ? [...st.titles, r.title as TitleId] : st.titles,
    });
    get().toast(`${r.label} 달성${r.title ? ' — 칭호 획득' : ''}`, 'good');
    return true;
  },
});
