/**
 * 공통 · 시간 경과 정산.
 *
 * `store.ts` 한 파일에 3,600줄이 있던 시절에는 액션 하나를 고치려고 열 때마다
 * 관계없는 스무 개를 지나야 했다. 여기 있는 것들은 **같이 고쳐지는 것끼리** 모았다.
 *
 * 이 파일은 스토어를 만들지 않는다 — 액션 뭉치를 돌려줄 뿐이고, 조립은
 * `store.ts` 가 한다. 그래서 저장·마이그레이션·미들웨어는 여전히 한 곳에만 있다.
 * `get()` 은 **스토어 전체**를 주므로 다른 뭉치의 액션도 그대로 부를 수 있다.
 */
import type { GameState, Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { KIND_NAME } from '@/core/types';
import { itemName, newItem } from '@/core/tiers';
import {
  ARENA_MAX_BADGE,
  MAX_STAMINA,
  SEASON_MS,
  SEASON_REWARD,
  arenaTierOf,
  regenStamina,
  seasonStartTier,
  softResetPoints,
} from '@/core/combat';
import { initCreatures, weekKeyOf } from '@/core/rush';
import { SERVER_FIRST_ODDS, earnedTitles, effectsOf } from '@/core/titles';
import { seeded } from '@/core/rng';
import { guildEffects } from '@/core/guildSkill';
import {
  RAIDS,
  RAID_DEFS,
  RAID_LOG_MAX,
  RaidSettleEntry,
  guildLevelOf,
  raidExp,
  raidHp,
  raidPay,
  raidReward,
} from '@/core/guildRaid';
import { LotteryResult, drawKey, prizeOf, resultFor } from '@/core/lottery';
import { fmtShort } from '@/core/currency';
import { matesDamage } from '../useGuilds';
import { rosterMeId } from '../useBoard';
import { MATERIAL_IDS } from '@/core/artisans';
import { canRestore, restoreCost, restoreDust } from '@/core/dust';
import { setCounts } from '@/core/spirit';
import { pushMyEvent } from '../live';
import { AvatarId, isAvatarId } from '@/core/avatars';
import { TITLE_AVATAR } from '@/core/titles';
import { currentGuild, dayKey, guildOf } from '../helpers';

/**
 * 토스트 일련번호.
 *
 * 모듈 스코프다 — 저장본에 넣을 값이 아니고 (다시 켜면 0부터여도 아무 문제가 없다),
 * 상태에 넣으면 토스트 하나 띄울 때마다 저장이 한 번 더 돈다.
 */
let toastSeq = 0;

/** tick 안에서 칭호를 마지막으로 훑은 시각. 매초 훑을 필요가 없어 1분에 한 번만 본다 */
let lastTitleScan = 0;

/** 이 뭉치가 맡는 액션들 */
export type CoreActions = Pick<
  Store,
  'toast' | 'dismissToast' | 'addMoney' | 'takeMoney' | 'bumpStat' | 'grantTitle'
  | 'equipTitle' | 'checkTitles' | 'spendMoney' | 'restoreFromDust' | 'tick'
>;

export const createCoreSlice = (
  set: SliceSet,
  get: SliceGet,
): CoreActions => ({
  // ── 공통 ────────────────────────────────────────
  toast: (text, tone = 'plain') =>
    set((st) => ({ toasts: [...st.toasts, { id: ++toastSeq, text, tone }].slice(-4) })),
  dismissToast: (id) => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),

  addMoney: (n) => set((st) => ({ money: Math.max(0, st.money + Math.floor(n)) })),
  takeMoney: (n) => {
    const st = get();
    if (st.money < n) return false;
    set({ money: st.money - Math.floor(n) });
    return true;
  },
  /**
   * 통계 증가.
   * NaN 을 만들지 않는 게 중요하다 — JSON.stringify 가 NaN 을 null 로 저장하고,
   * 다음 실행에서 `null.toLocaleString()` 으로 화면이 죽는다 (실제로 겪었다).
   */
  bumpStat: (k, by = 1) =>
    set((st) => {
      const cur = st.stats[k];
      const add = Number.isFinite(by) ? by : 0;
      const base = Number.isFinite(cur as number) ? (cur as number) : 0;
      return { stats: { ...st.stats, [k]: base + add } };
    }),

  /**
   * 칭호 하나를 바로 준다 (조건 판정을 안 거치는 것들 — 검투왕·행운의 손 등).
   *
   * ⚠ 알림 대기열에도 넣는다. 여기로 들어온 칭호만 조용히 지급되면
   * "언제 받았는지 모르는 칭호" 가 생긴다 — 실제로 그랬다.
   * 딸린 로고도 `checkTitles` 와 같은 표(`TITLE_AVATAR`)를 읽어 함께 연다.
   */
  grantTitle: (t) => {
    const st = get();
    if (st.titles.includes(t)) return;
    const av = TITLE_AVATAR[t];
    const gotAvatar = !!av && isAvatarId(av) && get().grantAvatar(av);
    set({
      titles: [...get().titles, t],
      titleQueue: [
        ...get().titleQueue,
        { id: t, avatar: gotAvatar ? (av as AvatarId) : null },
      ],
    });
  },
  equipTitle: (t) => set({ equippedTitle: t }),

  /**
   * 칭호 조건을 한 번에 훑는다. tick 과 주요 액션 뒤에서 부른다.
   *
   * 액션마다 직접 지급하지 않는 이유: 조건이 여러 값에 걸쳐 있는 칭호
   * (대출 없이 10만 골드, 같은 특성 16세트)는 "어느 액션 뒤"라고 짚을 수 없다.
   */
  checkTitles: () => {
    const st = get();
    const tt = st.titleTrack;
    const eq = st.equipped;
    const maxSet = setCounts(eq).reduce((m, c) => Math.max(m, c.count), 0);
    const now = Date.now();
    const got = earnedTitles({
      stats: st.stats,
      bestRuneRank: tt.bestRuneRank,
      maxSetCount: maxSet,
      gold: st.money,
      guildFounder: !!st.guildId && currentGuild(st)?.masterId === rosterMeId(),
      nightVisits: tt.nightVisits,
      engraves: tt.engraves,
      tower50: tt.tower50,
      kujiA: tt.kujiA,
      signupNo: tt.signupNo,
      serverFirst: (key) =>
        !!st.account && seeded(st.account.id, 'server-first', key)() < SERVER_FIRST_ODDS,
    });

    const fresh = got.filter((id) => !st.titles.includes(id));
    if (!fresh.length) return [];
    set({ titles: [...st.titles, ...fresh] });

    /*
      칭호에 딸린 로고를 같이 연다 (`core/titles` 의 TITLE_AVATAR).

      선착순 칭호는 이름표만으로는 티가 잘 안 난다 — 채팅에서 이름 옆 작은
      글씨 하나다. 로고는 투기장·랭킹·명패에 **그림으로** 뜨므로 멀리서도
      읽힌다. 이게 선착순 칭호에 실제 무게를 주는 방법이다.

      ⚠ 이미 가진 로고여도 상관없다 — `grantAvatar` 가 알아서 걸러 낸다.
    */
    const gotAvatars: AvatarId[] = [];
    for (const id of fresh) {
      const av = TITLE_AVATAR[id];
      if (av && isAvatarId(av) && get().grantAvatar(av)) gotAvatars.push(av);
    }

    /*
      알림은 **토스트가 아니라 팝업**이다.

      토스트는 3초 뒤에 사라진다. 칭호는 이 게임에서 손에 꼽게 드문 사건이고,
      로고까지 같이 들어오면 "뭔가 지나갔는데 뭐였지" 가 된다 — 실제로
      선착순 칭호를 받은 사람이 자기 로고가 열린 걸 몰랐다.
      화면(ui/TitleGetPopup)이 이 대기열을 읽어 하나씩 띄운다.
    */
    set({
      titleQueue: [
        ...get().titleQueue,
        ...fresh.map((id) => ({
          id,
          avatar: TITLE_AVATAR[id] && gotAvatars.includes(TITLE_AVATAR[id] as AvatarId)
            ? (TITLE_AVATAR[id] as AvatarId)
            : null,
        })),
      ],
    });
    return fresh;
  },

  /**
   * 장비 가루로 그 티어의 **0강 장비**를 되찾는다 (장인의 집).
   *
   * 되돌아오는 건 맨몸 장비뿐이다 — 강화 단계도, 각인도, 연성도 안 돌아온다.
   * 파괴를 없던 일로 만들면 강화 도박이 도박이 아니게 된다. 여기서 주는 건
   * "다시 시작할 물건" 이고, 그게 가루의 전부다.
   */
  /**
   * 돈을 쓴다 — 아무 대가 없이.
   *
   * 선술집 팁처럼 **게임 수치에 아무 영향이 없는** 지출에 쓴다.
   * 그런 자리마다 소지금을 직접 set 하면 잔고 검사를 빠뜨리기 쉽다.
   */
  spendMoney: (n) => {
    const st = get();
    const cost = Math.max(0, Math.floor(n));
    if (st.money < cost) { get().toast('돈이 부족합니다', 'bad'); return false; }
    set({ money: st.money - cost });
    return true;
  },

  restoreFromDust: (tier, kind) => {
    const st = get();
    if (!canRestore(tier)) { get().toast('복구할 수 없는 티어입니다', 'bad'); return false; }
    const need = restoreDust(tier);
    const cost = restoreCost(tier);
    if (st.dust < need) {
      get().toast(`장비 가루가 ${need - st.dust}개 부족합니다`, 'bad');
      return false;
    }
    if (st.money < cost) {
      get().toast(`복구 비용 ${fmtShort(cost)}이 부족합니다`, 'bad');
      return false;
    }
    const made = newItem(kind, tier, 0, 100);
    set({
      dust: st.dust - need,
      money: st.money - cost,
      inventory: [...st.inventory, made],
    });
    get().toast(`${itemName(made, KIND_NAME)} 복구 — 창고에 넣었습니다`, 'good');
    return true;
  },

  /**
   * 시간 경과 정산. 앱 복귀/포커스/주기 타이머에서 호출.
   * 체력·투기장 뱃지·주식 시세·대출 만기·시즌 종료를 한 번에 처리한다.
   */
  tick: () => {
    const now = Date.now();
    const st = get();
    const patch: Partial<GameState> = { lastSeenAt: now };

    // 칭호 조건은 여러 값에 걸쳐 있어 액션 훅만으로는 다 못 잡는다.
    // 매 초 훑을 필요는 없으므로 1분에 한 번만 본다.
    if (now - lastTitleScan >= 60_000) {
      lastTitleScan = now;
      queueMicrotask(() => get().checkTitles());
    }

    // 체력 회복 — 회복 간격·최대치는 칭호가 바꾼다 (야행성 / 개척자)
    const effNow = effectsOf(st.equippedTitle);
    const sr = regenStamina(
      st.stamina, st.staminaAt, now,
      Math.min(effNow.staminaRegenMs, guildEffects(st.guildSkills).staminaRegenMs),
      MAX_STAMINA + effNow.staminaMaxAdd,
    );
    if (sr.stamina !== st.stamina || sr.lastAt !== st.staminaAt) {
      patch.stamina = sr.stamina;
      patch.staminaAt = sr.lastAt;
    }

    // 새벽 3~5 시 접속은 하루 1회만 센다 (야행성)
    const hour = new Date(now).getHours();
    const dk = dayKey(now);
    if (hour >= 3 && hour < 5 && st.titleTrack.nightDayKey !== dk) {
      patch.titleTrack = {
        ...st.titleTrack,
        nightDayKey: dk,
        nightVisits: st.titleTrack.nightVisits + 1,
      };
    }

    // 투기장 뱃지 충전
    const eff = effNow;
    if (st.arena.badges < ARENA_MAX_BADGE) {
      const gained = Math.floor((now - st.arena.badgeAt) / eff.badgeMs);
      if (gained > 0) {
        const badges = Math.min(ARENA_MAX_BADGE, st.arena.badges + gained);
        patch.arena = {
          ...st.arena,
          badges,
          badgeAt: badges >= ARENA_MAX_BADGE ? now : st.arena.badgeAt + gained * eff.badgeMs,
        };
      }
    }

    // 시즌 종료 (2주)
    const arenaNow = patch.arena ?? st.arena;
    if (now - arenaNow.seasonStartedAt >= SEASON_MS) {
      const tier = arenaTierOf(arenaNow.points);
      const reward = SEASON_REWARD[tier];
      /* 새 시즌은 한 칸 아래에서 (S 는 두 칸 아래인 B 에서) — core/combat 참고 */
      const startTier = seasonStartTier(tier);
      patch.money = (patch.money ?? st.money) + reward;
      patch.arena = {
        ...arenaNow,
        points: softResetPoints(arenaNow.points),
        seasonStartedAt: now,
        seasonBestTier: 'F',
        /* 지난 시즌의 전적은 지난 시즌 것이다 — 새 판이 시작되면 비운다 */
        log: [],
      };
      if (tier === 'S') get().grantTitle('gladiator');
      get().toast(
        `시즌 종료 — ${tier}티어 보상 지급 · 새 시즌은 ${startTier}티어에서 시작합니다`,
        'good');
    }

    /*
      레이드 정산 — 일일은 매일 00:00~00:10, 주간은 월요일 00:00~00:10.

      그 10분 동안 지난 주기가 통째로 정산된다.
        · 내가 넣은 피해만큼 **돈**을 받는다 (raidPay)
        · 참여·처치 보상(기여도·주문서·재료·다이아)을 받는다
        · 길드가 넣은 총 피해가 **길드 경험치**가 된다

      ⚠ 잠금은 주기 키(raidSettled)로 건다. 시간 창으로 잠그면 그 10분에 앱을
      안 켠 사람은 한 주기치 보상을 통째로 잃는다 — 자고 일어나면 받을 게 없다.
      창은 "때릴 수 없는 시간"이고, 정산은 "지난 주기를 아직 안 닫았으면" 돈다.
    */
    if (st.guildId) {
      const { guild, mates } = guildOf(st);
      if (guild) {
        let gained = 0;
        let paid = 0;
        let gp = 0;
        const scrolls = { ...st.scrolls };
        const materials = { ...st.materials };
        const settled = { ...st.raidSettled };
        const raids = { ...st.raids };
        const logs: RaidSettleEntry[] = [];

        for (const rid of RAIDS) {
          const def = RAID_DEFS[rid];
          const key = def.period === 'day' ? dayKey(now) : weekKeyOf(now);
          const rec = st.raids[rid];
          // 아직 안 끝난 주기이거나, 이미 정산한 주기면 건너뛴다
          if (!rec.periodKey || rec.periodKey === key) continue;
          if (settled[rid] === rec.periodKey) continue;
          settled[rid] = rec.periodKey;

          const hp = raidHp(def, guild);
          // 길드원들이 그 주기에 실제로 넣은 피해의 합 (지어내지 않는다)
          const total = rec.damage
            + matesDamage(mates, def.period === 'day' ? 'raidD' : 'raidW', rec.periodKey);
          const killed = total >= hp;
          const exp = raidExp(def, Math.min(total, hp), hp, killed);
          gained += exp;

          // 한 대도 안 때렸으면 길드 경험치만 오르고 내 몫은 없다
          if (rec.tries <= 0) continue;
          const money = raidPay(def, rec.damage, killed);
          const rw = raidReward(rid, killed, true);
          paid += money;
          gp += rw?.gp ?? 0;
          if (rw?.scroll) scrolls[rw.scroll] = (scrolls[rw.scroll] ?? 0) + 1;
          if (rw?.material) {
            materials[MATERIAL_IDS[0]] = (materials[MATERIAL_IDS[0]] ?? 0) + rw.material;
          }
          raids[rid] = { ...rec, claimed: true };
          logs.push({
            id: rid, periodKey: rec.periodKey, at: now, damage: rec.damage,
            money, gp: rw?.gp ?? 0, exp, killed,
          });
        }

        if (gained > 0 || logs.length) {
          const before = guildLevelOf(st.guildExp).level;
          const after = guildLevelOf(st.guildExp + gained).level;
          patch.guildExp = st.guildExp + gained;
          patch.raidSettled = settled;
          if (logs.length) {
            patch.money = (patch.money ?? st.money) + paid;
            patch.guildPoints = st.guildPoints + gp;
            patch.scrolls = scrolls;
            patch.materials = materials;
            patch.raids = raids;
            patch.raidLog = [...logs, ...st.raidLog].slice(0, RAID_LOG_MAX);
            for (const l of logs) {
              get().toast(
                `${RAID_DEFS[l.id].name} 정산 — ${fmtShort(l.money)} · 기여도 +${l.gp}`,
                l.killed ? 'good' : 'plain',
              );
            }
          }
          get().toast(`길드 정산 — 길드 경험치 +${gained}`, 'good');
          if (after > before) {
            get().toast(`길드 레벨 ${after} 달성 — 스킬 포인트 +${after - before}`, 'good');
          }
        } else if (JSON.stringify(settled) !== JSON.stringify(st.raidSettled)) {
          patch.raidSettled = settled;
        }
      }
    }

    // 복권 추첨 (오후 8시) — 지난 회차 표를 정산한다
    if (st.lottery.tickets.length) {
      const due = st.lottery.tickets.filter((t) => t.drawAt <= now);
      if (due.length) {
        const rest = st.lottery.tickets.filter((t) => t.drawAt > now);
        const results: LotteryResult[] = [];
        let won = 0;
        let best: number | null = null;
        for (const t of due) {
          const rank = resultFor(t.drawKey, t.serial);
          const prize = rank ? prizeOf(rank).amount : 0;
          won += prize;
          if (rank && (best === null || rank < best)) best = rank;
          results.push({ id: t.id, serial: t.serial, drawKey: t.drawKey, rank, prize, at: now });
        }
        patch.money = (patch.money ?? st.money) + won;
        patch.lottery = {
          ...st.lottery,
          tickets: rest,
          results: [...results, ...st.lottery.results].slice(0, 60),
        };
        // 산 번호 순으로 넘겨 보게 한다
        patch.lotteryResult = [...results].sort((a, b) => a.serial - b.serial);
        patch.stats = {
          ...(patch.stats ?? st.stats),
          lotteryWon: (patch.stats ?? st.stats).lotteryWon + won,
        };
        if (won > 0) {
          get().toast(`복권 추첨 — ${due.length}장 중 당첨금 ${fmtShort(won)}`, 'good');
          if (best !== null && best <= 3) {
            pushMyEvent('gamble', `${st.nickname}님이 복권 ${best}등에 당첨되었습니다 (${fmtShort(won)})`, true);
          }
        } else {
          get().toast(`복권 추첨 — ${due.length}장 모두 낙첨`, 'plain');
        }
      }
    }

    // 크리처 러쉬 정산
    set(patch as GameState);
    get().settleRush(now);

    // 주간 리셋 (월요일 00시) — 정산을 먼저 끝낸 뒤 전적을 초기화한다.
    // 순서가 바뀌면 진행 중이던 배팅이 새 전적으로 정산되어 중계와 어긋난다.
    const week = weekKeyOf(now);
    if (get().rushWeek !== week) {
      set({
        creatures: initCreatures(),
        rushH2H: {},
        rushSettled: [],
        rushWeek: week,
      });
      get().toast('크리처 전적이 주간 리셋되었습니다', 'plain');
    }

    get().refreshQuests();
  },
});
