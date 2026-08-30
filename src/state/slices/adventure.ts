/**
 * 심연 · 연금술 · 장인 해방 · 오락실.
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

import { SLOT_IDS } from '@/core/types';
import { playerCurrentIlvl } from '@/core/tiers';
import { effectsOf } from '@/core/titles';
import { chance } from '@/core/rng';
import { ACTIVITY_DEFS, bagGradeCount, takeGrade } from '@/core/gathering';
import {
  ABYSS_DUR_COST,
  ABYSS_STAMINA,
  abyssPass,
  addDrop,
  floorDrop,
  newRun,
} from '@/core/abyss';
import { POTION_DEFS, imbueBlock, roll as rollPotion } from '@/core/alchemy';
import { currentPrize, newGame as newMines, open as openMine } from '@/core/mines';
import { LIBERATION_MSG, liberate, liberationBlock } from '@/core/liberation';
import { fmtShort } from '@/core/currency';
import { selMaxStamina, titleMods } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type AdventureActions = Pick<
  Store,
  'enterAbyss' | 'descend' | 'ascend' | 'brewPotion' | 'imbue' | 'liberateSlot'
  | 'startMines' | 'openMine' | 'cashOutMines'
>;

export const createAdventureSlice = (
  set: SliceSet,
  get: SliceGet,
): AdventureActions => ({
  // ── 심연 ──────────────────────────────────────────
  //
  // 탐험·탑과 달리 **연속 판정 + 자발적 탈출**이다.
  // 귀환하면 누적 보상을 받고, 실패하면 전부 소멸한다.

  enterAbyss: () => {
    const st = get();
    if (st.abyssRun) { get().toast('이미 심연에 들어와 있습니다', 'bad'); return false; }
    if (st.stamina < ABYSS_STAMINA) { get().toast('체력이 부족합니다', 'bad'); return false; }
    set({
      stamina: st.stamina - ABYSS_STAMINA,
      staminaAt: st.stamina >= selMaxStamina(st) ? Date.now() : st.staminaAt,
      abyssRun: newRun(Date.now()),
    });
    return true;
  },

  descend: () => {
    const st = get();
    const run = st.abyssRun;
    if (!run) return { ok: false };
    const floor = run.floor + 1;
    const my = playerCurrentIlvl(st.equipped, titleMods(st).runeIlvlMul);
    const won = chance(abyssPass(my, floor));

    // 내구도는 이기든 지든 닳는다 — 실패한 런의 수리비를 물어야 "귀환할까"가 진짜 고민이 된다
    const eff = effectsOf(st.equippedTitle);
    const cost = Math.max(0, ABYSS_DUR_COST - eff.abyssDurCut);
    const equipped = { ...st.equipped };
    for (const slot of SLOT_IDS) {
      const it = equipped[slot];
      if (it) equipped[slot] = { ...it, dur: Math.max(0, it.dur - cost) };
    }

    if (!won) {
      set({ equipped, abyssRun: null });
      return { ok: true, won: false, floor };
    }
    const drop = floorDrop(floor);
    set({
      equipped,
      abyssRun: { ...run, floor, bag: addDrop(run.bag, drop) },
      abyssBest: Math.max(st.abyssBest, floor),
    });
    return { ok: true, won: true, floor };
  },

  ascend: () => {
    const st = get();
    const run = st.abyssRun;
    if (!run) return false;
    const bagged = run.bag;
    set({
      money: st.money + bagged.money,
      abyssMats: {
        ash: st.abyssMats.ash + bagged.ash,
        shard: st.abyssMats.shard + bagged.shard,
        core: st.abyssMats.core + bagged.core,
      },
      abyssRun: null,
    });
    if (run.floor >= 20) get().grantTitle('abyss_diver');
    get().checkTitles();
    return true;
  },

  // ── 연금술 ────────────────────────────────────────

  brewPotion: (t) => {
    const st = get();
    const def = POTION_DEFS[t];
    const eff = effectsOf(st.equippedTitle);
    const cost = Math.max(1, Math.round(def.cost * (1 - eff.potionDiscount)));
    const bp = def.byproduct;
    const haveBp = bagGradeCount(st.gatherBag, bp.activity, bp.grade);
    if (st.abyssMats.ash < def.ash || st.abyssMats.shard < def.shard || st.abyssMats.core < def.core) {
      get().toast('심연 재료가 부족합니다', 'bad'); return false;
    }
    if (haveBp < bp.qty) {
      get().toast(`${ACTIVITY_DEFS[bp.activity].name} ${bp.grade}급 산물이 부족합니다`, 'bad');
      return false;
    }
    if (st.money < cost) { get().toast('제작비가 부족합니다', 'bad'); return false; }

    const bagA = takeGrade(st.gatherBag, bp.activity, bp.grade, bp.qty);
    if (!bagA) { get().toast('부재료가 부족합니다', 'bad'); return false; }
    set({
      money: st.money - cost,
      abyssMats: {
        ash: st.abyssMats.ash - def.ash,
        shard: st.abyssMats.shard - def.shard,
        core: st.abyssMats.core - def.core,
      },
      gatherBag: bagA,
      potions: { ...st.potions, [t]: st.potions[t] + 1 },
    });
    if (t === 'high') get().grantTitle('alchemist');
    get().toast(`${def.name} 제작 완료`, 'good');
    return true;
  },

  imbue: (slot, t) => {
    const st = get();
    const item = st.equipped[slot];
    if (!item) return null;
    const block = imbueBlock(item);
    if (block) { get().toast(block, 'bad'); return null; }
    if (st.potions[t] <= 0) { get().toast('연성액이 없습니다', 'bad'); return null; }

    // 재부여하면 기존 배수가 사라진다 — 정령석과 같은 구조라 재부여가 도박이 된다
    const p = rollPotion(t);
    set({
      potions: { ...st.potions, [t]: st.potions[t] - 1 },
      equipped: { ...st.equipped, [slot]: { ...item, alch: p.mul } },
      bestMul: Math.max(st.bestMul, p.mul),
    });
    get().toast(`${p.mul.toFixed(2)}배 — ${POTION_DEFS[t].name}`, p.mul >= 1.4 ? 'good' : 'plain');
    return p;
  },

  // ── 장인 무구 해방 ────────────────────────────────

  liberateSlot: (slot) => {
    const st = get();
    const item = st.equipped[slot];
    if (!item) return false;
    const block = liberationBlock(item, st.money);
    if (block) { get().toast(LIBERATION_MSG[block], 'bad'); return false; }
    const res = liberate(item, st.money)!;
    set({
      money: st.money - res.cost,
      equipped: { ...st.equipped, [slot]: res.item },
    });
    get().toast(`봉인 해방 — +${(res.item.freed ?? 0) * 5} 마일스톤이 열렸습니다`, 'good');
    return true;
  },

  // ── 오락실 ────────────────────────────────────────

  startMines: (mines, bet) => {
    const st = get();
    if (st.mines && !st.mines.done) { get().toast('진행 중인 판이 있습니다', 'bad'); return false; }
    if (bet <= 0 || st.money < bet) { get().toast('돈이 부족합니다', 'bad'); return false; }
    /**
     * ⚠ 배팅금을 **판을 시작할 때 즉시** 차감한다.
     * 지뢰를 밟은 뒤 앱을 죽여 손실을 취소할 수 있으면 기대값이 무한이 된다.
     */
    set({
      money: st.money - bet,
      mines: newMines(mines, bet),
      stats: { ...st.stats, gambleBet: st.stats.gambleBet + bet },
    });
    get().bumpGuildQuest('gamble', bet);
    return true;
  },

  openMine: (cell) => {
    const st = get();
    if (!st.mines) return false;
    const next = openMine(st.mines, cell);
    if (next === st.mines) return false;
    set({ mines: next });
    if (next.dead) get().toast('지뢰를 밟았습니다', 'bad');
    else if (next.done) get().toast('여덟 칸을 다 팠습니다 — 자동 정산', 'plain');
    return true;
  },

  cashOutMines: () => {
    const st = get();
    const game = st.mines;
    if (!game || game.dead) { set({ mines: null }); return 0; }
    const prize = currentPrize(game);
    set({
      money: st.money + prize,
      mines: null,
      stats: { ...st.stats, gambleWon: st.stats.gambleWon + Math.max(0, prize - game.bet) },
    });
    if (prize > 0) get().toast(`${fmtShort(prize)} 획득`, 'good');
    return prize;
  },
});
