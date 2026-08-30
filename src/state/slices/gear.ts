/**
 * 장비 · 강화.
 *
 * `store.ts` 한 파일에 3,600줄이 있던 시절에는 액션 하나를 고치려고 열 때마다
 * 관계없는 스무 개를 지나야 했다. 여기 있는 것들은 **같이 고쳐지는 것끼리** 모았다.
 *
 * 이 파일은 스토어를 만들지 않는다 — 액션 뭉치를 돌려줄 뿐이고, 조립은
 * `store.ts` 가 한다. 그래서 저장·마이그레이션·미들웨어는 여전히 한 곳에만 있다.
 * `get()` 은 **스토어 전체**를 주므로 다른 뭉치의 액션도 그대로 부를 수 있다.
 */
import type { EnhanceLog, Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { ARTISAN_TIER, Item, KIND_NAME, SLOT_ACCEPTS, SLOT_IDS, SlotId } from '@/core/types';
import { Equipped, TIERS, itemName, newItem } from '@/core/tiers';
import {
  ARTISAN_FORGE_COST,
  ARTISAN_FORGE_MATERIALS,
  canEnhance,
  canPromote,
  enhanceCost,
  promote,
  promoteCost,
  tryEnhance,
} from '@/core/enhance';
import { repairCost, sellPrice } from '@/core/economy';
import { artisanKey, entryKey } from '@/core/collection';
import { StatCounters, effectsOf } from '@/core/titles';
import { guildEffects } from '@/core/guildSkill';
import { MATERIALS, materialFor } from '@/core/artisans';
import { dustFromBreak } from '@/core/dust';
import { nextTarget } from '@/core/autoEnhance';
import { spiritTotal } from '@/core/spirit';
import { pushMyEvent } from '../live';
import { titleMods } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type GearActions = Pick<
  Store,
  'equip' | 'unequip' | 'sell' | 'repair' | 'repairAll' | 'doEnhance' | 'autoEnhanceStep'
  | 'doPromote' | 'forgeArtisan'
>;

export const createGearSlice = (
  set: SliceSet,
  get: SliceGet,
): GearActions => ({
  // ── 장비 ────────────────────────────────────────
  equip: (itemId, slot) => {
    const st = get();
    const item = st.inventory.find((i) => i.id === itemId);
    if (!item) return false;
    if (!SLOT_ACCEPTS[slot].includes(item.kind)) {
      get().toast(`${KIND_NAME[item.kind]}은(는) 그 칸에 넣을 수 없습니다`, 'bad');
      return false;
    }
    const prev = st.equipped[slot];
    const inv = st.inventory.filter((i) => i.id !== itemId);
    if (prev) inv.push(prev);
    set({ equipped: { ...st.equipped, [slot]: item }, inventory: inv });
    return true;
  },

  unequip: (slot) => {
    const st = get();
    const item = st.equipped[slot];
    if (!item) return;
    const eq = { ...st.equipped };
    delete eq[slot];
    set({ equipped: eq, inventory: [...st.inventory, item] });
  },

  sell: (itemId) => {
    const st = get();
    const item = st.inventory.find((i) => i.id === itemId);
    if (!item) return;
    const geff = guildEffects(st.guildSkills);
    const price = Math.round(sellPrice(item) * (1 + geff.sellBonus));
    set({
      inventory: st.inventory.filter((i) => i.id !== itemId),
      money: st.money + price,
    });
    get().bumpGuildQuest('sell');
    get().toast(`${itemName(item, KIND_NAME)} 판매 — +${price}쿠퍼`, 'plain');
  },

  repair: (itemId) => {
    const st = get();
    const eff = effectsOf(st.equippedTitle);
    const find = (): [Item, SlotId | null] | null => {
      for (const sl of SLOT_IDS) {
        const it = st.equipped[sl];
        if (it?.id === itemId) return [it, sl];
      }
      const inv = st.inventory.find((i) => i.id === itemId);
      return inv ? [inv, null] : null;
    };
    const found = find();
    if (!found) return;
    const [item, slot] = found;
    const cost = Math.ceil(repairCost(item) * (1 - eff.repairDiscount - guildEffects(st.guildSkills).repairDiscount));
    if (cost <= 0) return;
    if (st.money < cost) { get().toast('수리비가 부족합니다', 'bad'); return; }
    const fixed = { ...item, dur: 100 };
    if (slot) set({ money: st.money - cost, equipped: { ...st.equipped, [slot]: fixed } });
    else set({ money: st.money - cost, inventory: st.inventory.map((i) => (i.id === itemId ? fixed : i)) });
    get().toast(`수리 완료 — -${cost}쿠퍼`, 'plain');
  },

  repairAll: () => {
    const st = get();
    const eff = effectsOf(st.equippedTitle);
    /*
      ⚠ 길드 할인을 여기서도 빼야 한다.

      한 칸 수리(`repair`)는 칭호 할인과 길드 할인을 둘 다 빼는데 전체 수리는
      칭호 할인만 뺐다. 그래서 홈 화면이 미리 보여 주는 금액(둘 다 뺀 값)보다
      실제로 더 많이 나갔다 — 화면과 계산이 갈라진 자리다.
    */
    const gd = guildEffects(st.guildSkills).repairDiscount;
    let total = 0;
    for (const sl of SLOT_IDS) {
      const it = st.equipped[sl];
      if (it) total += Math.ceil(repairCost(it) * (1 - eff.repairDiscount - gd));
    }
    if (total <= 0) { get().toast('수리할 장비가 없습니다', 'plain'); return; }
    if (st.money < total) { get().toast(`전체 수리비 ${total}쿠퍼가 부족합니다`, 'bad'); return; }
    const eq: Equipped = { ...st.equipped };
    for (const sl of SLOT_IDS) if (eq[sl]) eq[sl] = { ...eq[sl]!, dur: 100 };
    set({ money: st.money - total, equipped: eq });
    get().toast(`전체 수리 완료 — -${total}쿠퍼`, 'good');
  },

  // ── 강화 ────────────────────────────────────────
  doEnhance: (slot, scroll) => {
    const st = get();
    const item = st.equipped[slot];
    if (!item) { get().toast('착용 중인 장비만 강화할 수 있습니다', 'bad'); return null; }
    if (!canEnhance(item)) { get().toast('더 이상 강화할 수 없습니다 (승급 필요)', 'bad'); return null; }
    if (scroll && st.scrolls[scroll] <= 0) { get().toast('주문서가 없습니다', 'bad'); return null; }

    // 주문서 값은 상점에서 이미 지불했으므로 여기서는 순수 강화비만 받는다
    const pure = enhanceCost(item, null);
    if (st.money < pure) { get().toast('강화 비용이 부족합니다', 'bad'); return null; }

    const eff = effectsOf(st.equippedTitle);
    // 확률 출처가 넷이다 (주문서·칭호·정령석·길드). 합산은 effectiveOdds 한 곳에서만 한다
    const rune = spiritTotal(st.equipped, titleMods(st));
    const geff = guildEffects(st.guildSkills);
    const res = tryEnhance(item, scroll, Math.random, eff.enhanceBonusPct, {
      spiritPct: rune.bonus.enhance_rate ?? 0,
      guildMul: geff.enhanceMul,
      guardPct: (rune.bonus.enhance_guard ?? 0) + geff.guardAdd,
    });

    const eq: Equipped = { ...st.equipped };
    if (res.item) eq[slot] = res.item;
    else delete eq[slot];

    const scrolls = { ...st.scrolls };
    if (scroll) scrolls[scroll] = Math.max(0, scrolls[scroll] - 1);

    const to = res.item ? res.item.level : item.level;
    const stats: StatCounters = {
      ...st.stats,
      enhanceAttempts: st.stats.enhanceAttempts + 1,
      enhanceSuccess: st.stats.enhanceSuccess + (res.outcome === 'success' ? 1 : 0),
      destroyed: st.stats.destroyed + (res.outcome === 'destroy' ? 1 : 0),
      destroyedHigh: st.stats.destroyedHigh + (res.outcome === 'destroy' && item.level >= 13 ? 1 : 0),
      goldSpentOnEnhance: st.stats.goldSpentOnEnhance + pure,
    };

    const log: EnhanceLog = {
      at: Date.now(),
      name: itemName(item, KIND_NAME),
      from: item.level,
      to,
      outcome: res.outcome,
      cost: pure,
      scroll: scroll ?? null,
      guarded: res.guarded,
      tier: item.tier,
    };

    const materials = { ...st.materials };
    if (res.refundMaterials) {
      const mk = materialFor(item.kind);
      materials[mk] = (materials[mk] ?? 0) + res.refundMaterials;
    }

    /*
      파괴는 아무것도 안 남기던 사건이었다. 가루를 남긴다 —
      잃은 것을 돌려주지는 않지만, 다음에 할 일이 생긴다 (core/dust).
    */
    const gotDust = res.outcome === 'destroy' ? dustFromBreak(item.tier, item.level) : 0;

    set({
      money: st.money - pure,
      equipped: eq,
      scrolls,
      stats,
      materials,
      dust: st.dust + gotDust,
      history: [log, ...st.history].slice(0, 200),
    });
    if (gotDust > 0) get().toast(`장비 가루 ${gotDust}개를 주웠습니다`, 'plain');

    get().checkTitles();

    // 내 이벤트도 같은 피드에 올린다 — 남의 소식만 흐르면 남 얘기처럼 느껴진다
    const shownName = itemName(item, KIND_NAME);
    if (res.outcome === 'success') {
      get().bumpGuildQuest('enhance');
      pushMyEvent('enhance', `${get().nickname}님이 ${shownName.replace(/ \+\d+$/, '')} +${to} 강화에 성공했습니다`, to >= 13);
    } else if (res.outcome === 'destroy') {
      pushMyEvent('destroy', `${get().nickname}님의 ${shownName}이(가) 산산조각 났습니다`, item.level >= 13);
    }
    return res;
  },

  /**
   * 자동 강화 **한 대**.
   *
   * 화면이 이 함수를 일정 간격으로 반복 호출한다. 여러 장비를 동시에 올리는
   * 것처럼 보이지만, 실제로 두들기는 건 언제나 하나다 — 그래야 소지금이
   * 한 곳에서만 줄어든다 (`core/autoEnhance` 의 동시성 주석 참고).
   *
   * ⚠ **읽기와 쓰기 사이에 아무것도 끼지 않게** 한 번의 `set` 으로 끝낸다.
   * `doEnhance` 를 불러 쓰면 그 안에서 토스트·피드·칭호 판정이 돌면서
   * 상태를 여러 번 읽고 쓰는데, 그러면 한 틱에 두 대가 겹칠 때 잔고가 어긋난다.
   *
   * @returns 무엇이 일어났는가. 더 칠 게 없거나 못 치면 `stop` 이 채워진다
   */
  autoEnhanceStep: (ids, goal, scroll) => {
    const st = get();

    /*
      대상은 **아이템 id 로** 찾는다 — 착용 칸이든 창고든 상관없이.

      예전엔 슬롯 이름만 받아서 착용 중인 것밖에 못 돌렸다. 그런데 자동 강화가
      제일 필요한 건 **창고에 쌓아 둔 여벌**이다 (끼고 있는 건 어차피 눈으로
      보면서 하나씩 두들긴다). id 로 찾으면 두 자리를 같은 코드로 다룬다.
    */
    const find = (id: string): { item: Item; slot: SlotId | null } | null => {
      for (const sl of SLOT_IDS) {
        const it = st.equipped[sl];
        if (it?.id === id) return { item: it, slot: sl };
      }
      const inv = st.inventory.find((i) => i.id === id);
      return inv ? { item: inv, slot: null } : null;
    };

    const found = ids.map(find);
    const items = found.map((f) => f?.item ?? null);
    const targets = ids.map((id, i) => ({
      slot: id, goal, from: 0, broken: !found[i],
    }));

    const idx = nextTarget(items, targets);
    if (idx < 0) return { stop: 'done' as const };

    const hit = found[idx]!;
    const item = hit.item;
    /*
      ⚠ **순수 강화비만** 받는다 (`doEnhance` 와 같은 규칙).

      `enhanceCost(item, scroll)` 은 주문서의 **상점 가격**을 얹어서 돌려준다.
      그런데 주문서는 상점에서 이미 사서 들고 있는 물건이라, 여기서 또 받으면
      **한 장을 두 번 사는 것**이 된다. 자동 강화는 그걸 매 시도마다 반복하므로
      비싼 주문서를 끼우는 순간 비용이 몇 배로 뛰었다.

      손으로 하는 강화는 처음부터 `null` 을 넘겼는데 자동만 `scroll` 을 넘겼다 —
      같은 일을 하는 두 경로가 갈라져 있던 자리다.
    */
    const cost = enhanceCost(item, null);
    if (st.money < cost) return { stop: 'money' as const };
    if (scroll && (st.scrolls[scroll] ?? 0) <= 0) {
      /* 주문서가 떨어지면 주문서 없이 계속 간다 — 멈추는 것보다 낫다 */
      return get().autoEnhanceStep(ids, goal, null);
    }

    const eff = effectsOf(st.equippedTitle);
    const rune = spiritTotal(st.equipped, titleMods(st));
    const geff = guildEffects(st.guildSkills);
    const res = tryEnhance(item, scroll, Math.random, eff.enhanceBonusPct, {
      spiritPct: rune.bonus.enhance_rate ?? 0,
      guildMul: geff.enhanceMul,
      guardPct: (rune.bonus.enhance_guard ?? 0) + geff.guardAdd,
    });

    /* 착용 칸이면 칸을, 창고면 창고 줄을 갈아 끼운다 */
    const eq: Equipped = { ...st.equipped };
    let inventory = st.inventory;
    if (hit.slot) {
      if (res.item) eq[hit.slot] = res.item;
      else delete eq[hit.slot];
    } else if (res.item) {
      inventory = st.inventory.map((i) => (i.id === item.id ? res.item! : i));
    } else {
      inventory = st.inventory.filter((i) => i.id !== item.id);
    }

    const scrolls = { ...st.scrolls };
    if (scroll) scrolls[scroll] = Math.max(0, (scrolls[scroll] ?? 0) - 1);

    const materials = { ...st.materials };
    if (res.refundMaterials) {
      const mk = materialFor(item.kind);
      materials[mk] = (materials[mk] ?? 0) + res.refundMaterials;
    }
    const gotDust = res.outcome === 'destroy' ? dustFromBreak(item.tier, item.level) : 0;

    const to = res.item ? res.item.level : item.level;
    set({
      money: st.money - cost,
      equipped: eq,
      inventory,
      scrolls,
      materials,
      dust: st.dust + gotDust,
      stats: {
        ...st.stats,
        enhanceAttempts: st.stats.enhanceAttempts + 1,
        enhanceSuccess: st.stats.enhanceSuccess + (res.outcome === 'success' ? 1 : 0),
        destroyed: st.stats.destroyed + (res.outcome === 'destroy' ? 1 : 0),
        destroyedHigh: st.stats.destroyedHigh
          + (res.outcome === 'destroy' && item.level >= 13 ? 1 : 0),
        goldSpentOnEnhance: st.stats.goldSpentOnEnhance + cost,
      },
      history: [{
        at: Date.now(),
        name: itemName(item, KIND_NAME),
        from: item.level,
        to,
        outcome: res.outcome,
        cost,
        scroll: scroll ?? null,
        guarded: res.guarded,
        tier: item.tier,
      }, ...st.history].slice(0, 200),
    });

    /*
      자랑과 판정은 결과를 반영한 뒤에. 자동 강화는 초당 몇 번씩 도는데
      성공마다 피드를 올리면 피드가 내 강화 기록으로 도배된다 — 손으로 할 때와
      같은 기준(+13 이상)만 올린다.
    */
    if (res.outcome === 'success') {
      get().bumpGuildQuest('enhance');
      if (to >= 13) {
        pushMyEvent('enhance',
          `${get().nickname}님이 ${itemName(item, KIND_NAME).replace(/ \+\d+$/, '')} +${to} 강화에 성공했습니다`,
          true);
      }
    } else if (res.outcome === 'destroy') {
      pushMyEvent('destroy', `${get().nickname}님의 ${itemName(item, KIND_NAME)}이(가) 산산조각 났습니다`,
        item.level >= 13);
    }
    get().checkTitles();

    return {
      id: item.id,
      name: itemName(item, KIND_NAME),
      outcome: res.outcome,
      from: item.level,
      to,
      cost,
      dust: gotDust,
    };
  },

  doPromote: (slot) => {
    const st = get();
    const item = st.equipped[slot];
    if (!item || !canPromote(item)) return false;
    const cost = promoteCost(item)!;
    if (st.money < cost) { get().toast('승급 비용이 부족합니다', 'bad'); return false; }
    const next = promote(item);
    set({
      money: st.money - cost,
      equipped: { ...st.equipped, [slot]: next },
      collection: st.collection.includes(entryKey(next.kind, next.tier))
        ? st.collection
        : [...st.collection, entryKey(next.kind, next.tier)],
    });
    get().toast(`${TIERS[next.tier].prefix} ${KIND_NAME[next.kind]} 로 승급!`, 'good');
    pushMyEvent('promote', `${get().nickname}님이 ${TIERS[next.tier].prefix} ${KIND_NAME[next.kind]}(으)로 승급했습니다`, next.tier >= 9);
    return true;
  },

  forgeArtisan: (kind) => {
    const st = get();
    const mat = materialFor(kind);
    const fEff = effectsOf(st.equippedTitle);
    const need = Math.max(1, ARTISAN_FORGE_MATERIALS - fEff.forgeMaterialCut);
    if ((st.materials[mat] ?? 0) < need) {
      get().toast(`${MATERIALS[mat].name} 부족 (${st.materials[mat] ?? 0}/${need})`, 'bad');
      return false;
    }
    if (st.money < ARTISAN_FORGE_COST) { get().toast('제련 비용 500골드가 부족합니다', 'bad'); return false; }
    const item = newItem(kind, ARTISAN_TIER, 0, 100);
    // 제련한 장인 무구도 도감에 등록된다 (예전엔 빠져 있었다)
    const aKey = artisanKey(kind);
    set({
      money: st.money - ARTISAN_FORGE_COST,
      materials: { ...st.materials, [mat]: st.materials[mat] - need },
      inventory: [...st.inventory, item],
      collection: st.collection.includes(aKey) ? st.collection : [...st.collection, aKey],
      stats: { ...st.stats, artisanForged: st.stats.artisanForged + 1 },
    });
    get().checkTitles();
    get().toast(`장인의 ${KIND_NAME[kind]} 제련 완료!`, 'good');
    pushMyEvent('artisan', `${get().nickname}님이 장인의 ${KIND_NAME[kind]}을(를) 제련했습니다`, true);
    return true;
  },
});
