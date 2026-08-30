/**
 * 상점 · 선술집.
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

import { newItem } from '@/core/tiers';
import { SCROLLS } from '@/core/enhance';
import { SHOP_T1_PRICE, TAVERN_MENU, tavernLeft, tavernRefusal } from '@/core/economy';
import { entryKey } from '@/core/collection';
import { effectsOf } from '@/core/titles';
import { STONES } from '@/core/spiritPreview';
import { GRADES, engraveBlock, roll as rollSpirit } from '@/core/spirit';
import { pushMyEvent } from '../live';
import { dayKey, selMaxStamina } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type TownActions = Pick<Store, 'buyStone' | 'engrave' | 'buyT1' | 'buyScroll' | 'eat'>;

export const createTownSlice = (
  set: SliceSet,
  get: SliceGet,
): TownActions => ({
  // ── 상점 / 선술집 ────────────────────────────────
  buyStone: (id, qty = 1) => {
    const st = get();
    const def = STONES.find((s2) => s2.id === id);
    if (!def || def.price === null) { get().toast('여기서 파는 물건이 아닙니다', 'bad'); return false; }
    const eff = effectsOf(st.equippedTitle);
    // 정령석은 상점 할인과 별개로 룬세공사 할인이 따로 붙는다 (둘 다 적용)
    const unit = Math.max(1, Math.floor(def.price * (1 - eff.stoneDiscount - eff.shopDiscount)));
    const total = unit * qty;
    if (st.money < total) { get().toast('돈이 부족합니다', 'bad'); return false; }
    set({ money: st.money - total, stones: { ...st.stones, [id]: (st.stones[id] ?? 0) + qty } });
    get().toast(`${def.name} ${qty}개 구매`, 'good');
    return true;
  },

  engrave: (slot, stone) => {
    const st = get();
    const item = st.equipped[slot];
    if (!item) return null;
    const block = engraveBlock(item);
    if (block) { get().toast(block, 'bad'); return null; }
    if ((st.stones[stone] ?? 0) <= 0) { get().toast('정령석이 없습니다', 'bad'); return null; }

    // 새로 새기면 기존 각인은 사라진다 (설계 §6) — 그래서 재부여가 도박이 된다
    const sp = rollSpirit(stone);
    set({
      stones: { ...st.stones, [stone]: st.stones[stone] - 1 },
      equipped: { ...st.equipped, [slot]: { ...item, spirit: sp } },
      titleTrack: {
        ...st.titleTrack,
        engraves: st.titleTrack.engraves + 1,
        // 최고 등급은 지금 낀 것이 아니라 "여태 뽑아 본 것" 이다.
        // 덮어써서 사라져도 기록은 남아야 룬의 대가가 취소되지 않는다.
        bestRuneRank: Math.max(st.titleTrack.bestRuneRank, GRADES.indexOf(sp.grade)),
      },
    });
    get().toast(`${sp.grade}급 — ${sp.trait}`, sp.grade === 'F' || sp.grade === 'E' ? 'plain' : 'good');
    if (sp.grade === 'SS' || sp.grade === 'SSS') {
      pushMyEvent('artisan', `${get().nickname}님이 ${sp.grade}급 룬각인 "${sp.trait}"을(를) 새겼습니다`, true);
    }
    get().checkTitles();
    return sp;
  },

  buyT1: (kind) => {
    const st = get();
    const eff = effectsOf(st.equippedTitle);
    const price = Math.max(1, Math.floor(SHOP_T1_PRICE * (1 - eff.shopDiscount)));
    if (st.money < price) { get().toast('돈이 부족합니다', 'bad'); return false; }
    const item = newItem(kind, 1, 0, 100);
    const key = entryKey(kind, 1);
    set({
      money: st.money - price,
      inventory: [...st.inventory, item],
      collection: st.collection.includes(key) ? st.collection : [...st.collection, key],
    });
    return true;
  },

  buyScroll: (id, qty = 1) => {
    const st = get();
    const eff = effectsOf(st.equippedTitle);
    const def = SCROLLS[id];
    let unit = def.price * (1 - eff.shopDiscount);
    if (def.destroyGuard) unit *= 1 - eff.destroyScrollDiscount;
    const total = Math.ceil(unit) * qty;
    if (st.money < total) { get().toast('돈이 부족합니다', 'bad'); return false; }
    set({ money: st.money - total, scrolls: { ...st.scrolls, [id]: st.scrolls[id] + qty } });
    return true;
  },

  eat: (menuId) => {
    const st = get();
    const now = Date.now();
    const m = TAVERN_MENU.find((x) => x.id === menuId);
    if (!m) return false;

    // 날이 바뀌면 섭취량은 0 부터. 저장된 dayKey 를 믿지 말고 매번 비교한다.
    const today = dayKey(now);
    const used = st.tavern.dayKey === today ? st.tavern.used : {};

    if (tavernLeft(m, used) <= 0) {
      get().toast(tavernRefusal(m), 'bad');
      return false;
    }
    if (!m.dailyFree && st.money < m.price) {
      get().toast('돈이 부족합니다', 'bad');
      return false;
    }
    set({
      money: m.dailyFree ? st.money : st.money - m.price,
      stamina: Math.min(selMaxStamina(st), st.stamina + m.heal),
      staminaAt: st.stamina >= selMaxStamina(st) ? now : st.staminaAt,
      tavern: { dayKey: today, used: { ...used, [m.id]: (used[m.id] ?? 0) + 1 } },
    });
    const left = tavernLeft(m, { ...used, [m.id]: (used[m.id] ?? 0) + 1 });
    get().toast(`${m.name} — 체력 +${m.heal} (오늘 ${left}개 남음)`, 'good');
    return true;
  },
});
