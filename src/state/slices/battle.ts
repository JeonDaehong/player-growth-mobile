/**
 * 의뢰 · 투기장 · 탐험 · 보스의 탑.
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

import { playerCurrentIlvl, toAvg } from '@/core/tiers';
import {
  ARENA_MAX_BADGE,
  ARTISAN_MATERIAL_BONUS,
  ARTISAN_MATERIAL_DROP,
  EXPLORE_CHAPTERS,
  REPEAT_REWARD_RATE,
  STAMINA_COST,
  TOWER_FLOORS,
  applyArenaPoints,
  arenaPointDelta,
  arenaTierOf,
  arenaWinRate,
  exploreRecIlvl,
  exploreReward,
  questWinRate,
  rollQuests,
  stageWinRate,
  towerRecIlvl,
  towerReward,
} from '@/core/combat';
import { ArenaRecord, pushRecord, rerollCost } from '@/core/arena';
import { ARENA_TIERS } from '@/core/types';
import { effectsOf } from '@/core/titles';
import { chance } from '@/core/rng';
import { guildEffects } from '@/core/guildSkill';
import { fmtShort } from '@/core/currency';
import { recordBattle } from '../net';
import { MATERIAL_IDS } from '@/core/artisans';
import { pushMyEvent } from '../live';
import { applyWear, dayKey, selMaxStamina, stageBonus, titleMods } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type BattleActions = Pick<
  Store,
  'spend' | 'refreshQuests' | 'runQuest' | 'runArena' | 'applyDefenses' | 'payReroll'
  | 'runExplore' | 'runTower'
>;

export const createBattleSlice = (
  set: SliceSet,
  get: SliceGet,
): BattleActions => ({
  // ── 전투 공통 ────────────────────────────────────
  spend: (kind) => {
    const st = get();
    const eff = effectsOf(st.equippedTitle);
    let cost: number = STAMINA_COST[kind];
    if (kind === 'tower') cost = Math.max(1, cost - eff.towerStaminaCut);
    if (st.stamina < cost) { get().toast('체력이 부족합니다', 'bad'); return false; }
    set({ stamina: st.stamina - cost, staminaAt: st.stamina >= selMaxStamina(st) ? Date.now() : st.staminaAt });
    return true;
  },

  /** 시간대가 바뀌었으면 퀘스트를 새로 굴린다 (§7-3 1시간마다 리셋) */
  refreshQuests: () => {
    const st = get();
    const slot = Math.floor(Date.now() / 3600_000);
    if (st.questBoard.slot === slot && st.questBoard.list.length) return;
    set({
      questBoard: { slot, list: rollQuests(playerCurrentIlvl(st.equipped, titleMods(st).runeIlvlMul), slot) },
      questsDone: [],
    });
  },

  runQuest: (q) => {
    const st = get();
    const now = Date.now();
    if (st.questsDone.includes(q.id)) { get().toast('이미 완료한 퀘스트입니다', 'bad'); return { ok: false }; }
    if (st.money < q.deposit) { get().toast('보증금이 부족합니다', 'bad'); return { ok: false }; }
    if (!get().spend('quest')) return { ok: false };

    const my = playerCurrentIlvl(get().equipped, titleMods(get()).runeIlvlMul);
    const win = chance(questWinRate(my, q));
    const after = get();
    const gain = win ? q.reward : 0;
    set({
      money: after.money - q.deposit + gain,
      questsDone: [...after.questsDone, q.id],
      stats: { ...after.stats, questsDone: after.stats.questsDone + (win ? 1 : 0) },
    });
    applyWear(set, get);
    if (win && q.difficulty === 'extreme') {
      pushMyEvent('quest', `${get().nickname}님이 매우 어려움 퀘스트를 성공했습니다`);
    }
    return { ok: true, win, gain: win ? gain - q.deposit : -q.deposit };
  },

  runArena: (ghost) => {
    const st = get();
    const now = Date.now();
    if (st.arena.badges <= 0) { get().toast('전투 참여 티켓이 없습니다', 'bad'); return { ok: false }; }
    // 투기장은 체력을 쓰지 않는다 (core/combat.ts) — 티켓 하나로 제한한다

    const eff = effectsOf(st.equippedTitle);
    const my = playerCurrentIlvl(get().equipped, titleMods(get()).runeIlvlMul);
    /*
      승률은 **점수 계산에도 그대로 쓴다.**

      이길 확률이 곧 그 판의 값어치다 — 어려운 상대를 이기면 많이 벌고,
      쉬운 상대를 이기면 조금 번다 (core/combat 의 arenaPointDelta).
      예전엔 승패 판정에만 쓰고 점수는 +20/-15 고정이라, 제일 약한 상대만
      골라 잡는 게 언제나 최적이었다.
    */
    const p = arenaWinRate(my, ghost.curIlvl);
    const win = chance(p);
    const after = get();

    const beforeTier = arenaTierOf(after.arena.points);
    const delta = arenaPointDelta(p, beforeTier, win);
    const points = applyArenaPoints(after.arena.points, delta);
    const tier = arenaTierOf(points);
    const move = tier === beforeTier
      ? undefined
      : (ARENA_TIERS.indexOf(tier) > ARENA_TIERS.indexOf(beforeTier) ? 'up' as const : 'down' as const);

    // 보상 계수도 기획서의 평균 기준 — 합을 그대로 쓰면 16배가 된다
    const reward = win ? Math.floor(toAvg(my) * 30 * eff.arenaRewardMul) : 0;

    const rec: ArenaRecord = {
      id: `a${now.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
      at: now,
      attack: true,
      foeNick: ghost.name,
      foeAvatar: ghost.avatar,
      win,
      delta: points - after.arena.points,
      tier,
      move,
    };

    set({
      money: after.money + reward,
      arena: {
        ...after.arena,
        points,
        badges: after.arena.badges - 1,
        badgeAt: after.arena.badges >= ARENA_MAX_BADGE ? now : after.arena.badgeAt,
        log: pushRecord(after.arena.log, rec),
      },
      stats: {
        ...after.stats,
        arenaWins: after.stats.arenaWins + (win ? 1 : 0),
        arenaLosses: after.stats.arenaLosses + (win ? 0 : 1),
      },
    });

    /*
      상대에게도 이 판을 남긴다.

      그 사람은 지금 접속해 있지 않을 수 있다. 서버에 줄 하나를 적어 두면
      다음에 들어올 때 자기 몫의 점수를 반영하고 팝업으로 확인한다
      (state/net.ts 의 `recordBattle`, useArenaDefense.ts).
      실패해도 내 판정에는 영향이 없다 — 그래서 기다리지 않는다.
    */
    void recordBattle({
      foeId: ghost.id,
      foeNick: ghost.name,
      myNick: get().nickname,
      myAvatar: get().avatar,
      attackerWon: win,
      /* 방어 쪽 점수는 3분의 1 — 내가 건 싸움이 아니다 */
      defenderDelta: arenaPointDelta(1 - p, arenaTierOf(ghost.points ?? 0), !win, true),
    });

    if (move === 'up') get().toast(`승급! ${beforeTier} → ${tier} 티어`, 'good');
    if (move === 'down') get().toast(`강등… ${beforeTier} → ${tier} 티어`, 'bad');
    if (tier === 'S') get().grantTitle('gladiator');
    if (win) get().bumpGuildQuest('arena');
    get().checkTitles();
    applyWear(set, get);
    if (win) pushMyEvent('arena', `${get().nickname}님이 투기장에서 ${ghost.name}을(를) 꺾었습니다`);
    return { ok: true, win, gain: reward };
  },

  /**
   * 내가 **당한** 판들을 반영한다 — 접속하지 않은 사이에 일어난 것들.
   *
   * 공격한 쪽이 서버에 줄을 남겨 두면(`recordBattle`) 여기서 읽어 온다.
   * 남의 점수를 남이 고칠 수는 없으므로(RLS), 방어자의 점수는 **방어자가
   * 스스로** 반영한다. 그래서 이 함수가 곧 "그동안 무슨 일이 있었나" 다.
   *
   * 오래된 것부터 차례로 적용한다 — 순서를 지켜야 승급·강등이 실제로 일어난
   * 순서대로 잡힌다. 한 번에 합쳐 더하면 중간에 넘었어야 할 승급선을 건너뛴다.
   *
   * @returns 반영한 판이 있으면 그 요약, 없으면 null
   */
  applyDefenses: (rows) => {
    const st = get();
    const fresh = rows.filter((r) => r.at > st.arena.seenAt);
    if (!fresh.length) {
      if (rows.length) set({ arena: { ...st.arena, seenAt: Date.now() } });
      return null;
    }

    const from = arenaTierOf(st.arena.points);
    let points = st.arena.points;
    let log = st.arena.log;
    let wins = 0;
    let seen = st.arena.seenAt;

    for (const r of fresh) {
      const before = arenaTierOf(points);
      const next = applyArenaPoints(points, r.delta);
      const tier = arenaTierOf(next);
      /* 내가 이긴 건 공격자가 진 것 */
      const iWon = !r.attackerWon;
      if (iWon) wins += 1;
      log = pushRecord(log, {
        id: r.id,
        at: r.at,
        attack: false,
        foeNick: r.attackerNick,
        foeAvatar: r.attackerAvatar,
        win: iWon,
        delta: next - points,
        tier,
        move: tier === before
          ? undefined
          : (ARENA_TIERS.indexOf(tier) > ARENA_TIERS.indexOf(before) ? 'up' : 'down'),
      });
      points = next;
      seen = Math.max(seen, r.at);
    }

    const to = arenaTierOf(points);
    set({
      arena: { ...st.arena, points, log, seenAt: Math.max(seen, st.arena.seenAt) },
      stats: {
        ...st.stats,
        arenaWins: st.stats.arenaWins + wins,
        arenaLosses: st.stats.arenaLosses + (fresh.length - wins),
      },
    });
    return {
      count: fresh.length,
      wins,
      losses: fresh.length - wins,
      delta: points - st.arena.points,
      from,
      to,
    };
  },

  /**
   * 상대 다시 찾기 값을 치른다.
   *
   * 10분에 한 번은 공짜다. 그 안에서 또 누르면 1실버 → 10실버 → 1골드 →
   * 10골드 → (계속 10골드). 값을 매기는 건 돈을 벌려는 게 아니라 **연타를
   * 막으려는 것**이다 — 마음에 드는 상대가 나올 때까지 버튼만 두들기면
   * 다섯을 늘어놓은 의미가 없다.
   *
   * @returns 치른 값. 못 치렀으면 null
   */
  payReroll: () => {
    const st = get();
    const now = Date.now();
    const cost = rerollCost(now, st.arena.rerollAt, st.arena.rerolls);
    if (cost === 0) {
      set({ arena: { ...st.arena, rerollAt: now, rerolls: 0 } });
      return 0;
    }
    if (st.money < cost) {
      get().toast(`다시 찾으려면 ${fmtShort(cost)}이 필요합니다`, 'bad');
      return null;
    }
    set({
      money: st.money - cost,
      arena: { ...st.arena, rerolls: st.arena.rerolls + 1 },
    });
    return cost;
  },

  runExplore: (chapter) => {
    const st = get();
    if (chapter > st.exploreCleared + 1 || chapter > EXPLORE_CHAPTERS) return { ok: false };
    if (!get().spend('explore')) return { ok: false };

    const my = playerCurrentIlvl(get().equipped, titleMods(get()).runeIlvlMul);
    const rec = exploreRecIlvl(chapter);
    const win = chance(stageWinRate(my, rec) + stageBonus(get(), 'explore'));
    const after = get();
    const isFirst = chapter > after.exploreCleared;
    const today = dayKey(Date.now());
    const dailyUsed = after.dailyBonus.explore === today;

    let gain = 0;
    let usedDaily = false;
    if (win) {
      const base = exploreReward(chapter);
      if (isFirst) gain = base;
      else if (!dailyUsed) { gain = base; usedDaily = true; }
      else gain = Math.floor(base * REPEAT_REWARD_RATE);
    }
    if (win) get().bumpGuildQuest('clear');
    set({
      money: after.money + gain,
      exploreCleared: win && isFirst ? chapter : after.exploreCleared,
      dailyBonus: usedDaily ? { ...after.dailyBonus, explore: today } : after.dailyBonus,
      stats: { ...after.stats, exploreBest: Math.max(after.stats.exploreBest, win ? chapter : 0) },
    });
    applyWear(set, get);
    if (win && isFirst) pushMyEvent('explore', `${get().nickname}님이 탐험 ${chapter}챕터를 클리어했습니다`);
    return { ok: true, win, gain, first: isFirst };
  },

  runTower: (floor) => {
    const st = get();
    if (floor > st.towerCleared + 1 || floor > TOWER_FLOORS) return { ok: false };
    if (!get().spend('tower')) return { ok: false };

    const my = playerCurrentIlvl(get().equipped, titleMods(get()).runeIlvlMul);
    const rec = towerRecIlvl(floor);
    const win = chance(stageWinRate(my, rec) + stageBonus(get(), 'tower'));
    const after = get();
    const isFirst = floor > after.towerCleared;
    const today = dayKey(Date.now());
    const dailyUsed = after.dailyBonus.tower === today;

    const tEff = effectsOf(after.equippedTitle);
    let gain = 0;
    let usedDaily = false;
    if (win) {
      const base = Math.round(towerReward(floor) * tEff.towerRewardMul);
      if (isFirst) gain = base;
      else if (!dailyUsed) { gain = base; usedDaily = true; }
      else gain = Math.floor(base * REPEAT_REWARD_RATE);
    }

    /**
     * 50층 = 번스타인. 잡아도 재료가 확정으로 나오지는 않는다 —
     * 15% 로 하나 떨어지고, 떨어졌을 때만 다시 굴려 하나가 더 붙는다.
     */
    let material = false;
    const materials = { ...after.materials };
    if (win && floor === TOWER_FLOORS) {
      // 칭호 + 길드 스킬(탐광)이 드랍률을 함께 올린다
      const dropAdd = tEff.materialDropAdd + guildEffects(st.guildSkills).dropRateAdd;
      if (chance(ARTISAN_MATERIAL_DROP + dropAdd)) {
        material = true;
        const n = 1 + (chance(ARTISAN_MATERIAL_BONUS) ? 1 : 0);
        const mk = MATERIAL_IDS[Math.floor(Math.random() * MATERIAL_IDS.length)];
        materials[mk] = (materials[mk] ?? 0) + n;
      }
    }

    set({
      money: after.money + gain,
      towerCleared: win && isFirst ? floor : after.towerCleared,
      dailyBonus: usedDaily ? { ...after.dailyBonus, tower: today } : after.dailyBonus,
      materials,
      stats: { ...after.stats, towerBest: Math.max(after.stats.towerBest, win ? floor : 0) },
    });
    if (win) get().bumpGuildQuest('clear');
    if (win && floor === TOWER_FLOORS) {
      const tt = get().titleTrack;
      set({ titleTrack: { ...tt, tower50: tt.tower50 + 1 } });
    }
    get().checkTitles();
    applyWear(set, get);
    if (win) {
      pushMyEvent(
        'tower',
        floor === TOWER_FLOORS
          ? `${get().nickname}님이 보스의탑 50층을 정복했습니다`
          : `${get().nickname}님이 보스의탑 ${floor}층을 클리어했습니다`,
        floor === TOWER_FLOORS,
      );
    }
    return { ok: true, win, gain, first: isFirst, material };
  },
});
