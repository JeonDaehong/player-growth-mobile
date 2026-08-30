/**
 * 크리처 러쉬 · 복권 · 쿠지 · 출석 · 아르바이트.
 *
 * `store.ts` 한 파일에 3,600줄이 있던 시절에는 액션 하나를 고치려고 열 때마다
 * 관계없는 스무 개를 지나야 했다. 여기 있는 것들은 **같이 고쳐지는 것끼리** 모았다.
 *
 * 이 파일은 스토어를 만들지 않는다 — 액션 뭉치를 돌려줄 뿐이고, 조립은
 * `store.ts` 가 한다. 그래서 저장·마이그레이션·미들웨어는 여전히 한 곳에만 있다.
 * `get()` 은 **스토어 전체**를 주므로 다른 뭉치의 액션도 그대로 부를 수 있다.
 */
import type { RushLogEntry, RushResult, Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { ScrollId } from '@/core/types';
import { H2H, h2hKey, lastSettleableSlot, matchForSlot, simulate, timingOf } from '@/core/rush';
import { pendingRewards } from '@/core/collection';
import { TitleId, effectsOf } from '@/core/titles';
import { ATTENDANCE_REWARD, dayKey as eventDayKey, isYesterday } from '@/core/events';
import { couponMaterials, couponScrolls, couponSummary, redeemable } from '@/core/coupons';
import { STAMINA_REQUIRED, work } from '@/core/parttime';
import { DAILY_LIMIT, TICKET_PRICE, Ticket, drawKey, nextDrawAt } from '@/core/lottery';
import { BOXES, Prize, boxState, dayKeyOf, draw as drawFromBox } from '@/core/draw';
import { fmtShort, g } from '@/core/currency';
import { MaterialId, materialFor } from '@/core/artisans';
import { kujiByKey, kujiKeyOf } from '@/core/draw';
import { pushMyEvent } from '../live';
import { AVATAR_NAME, AvatarId } from '@/core/avatars';
import { dayKey, selMaxStamina } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type GambleActions = Pick<
  Store,
  'betRush' | 'settleRush' | 'clearRushResult' | 'clearLotteryResult' | 'claimCollection'
  | 'checkAttendance' | 'redeemCoupon' | 'doPartTime' | 'buyTickets' | 'drawBox'
>;

export const createGambleSlice = (
  set: SliceSet,
  get: SliceGet,
): GambleActions => ({
  // ── 크리처 러쉬 ──────────────────────────────────
  betRush: (on, amount) => {
    const st = get();
    const now = Date.now();
    const t = timingOf(now);
    const slot = t.slot;
    if (t.phase !== 'betting') {
      get().toast(
        t.phase === 'fighting' ? '전투 중에는 배팅할 수 없습니다' : '다음 배팅 시간을 기다려주세요',
        'bad',
      );
      return false;
    }
    if (st.rushBet && st.rushBet.slot === slot) { get().toast('이미 이 회차에 배팅했습니다', 'bad'); return false; }
    if (st.money < amount) { get().toast('돈이 부족합니다', 'bad'); return false; }
    const match = matchForSlot(slot, st.creatures, st.rushH2H);
    const odds = on === match.a ? match.oddsA : match.oddsB;
    set({
      money: st.money - amount,
      rushBet: { slot, on, amount, odds },
      stats: { ...st.stats, gambleBet: st.stats.gambleBet + amount },
    });
    get().bumpGuildQuest('gamble', amount);
    return true;
  },

  /**
   * 전투가 끝난 회차를 정산한다 — 전적 갱신 + 배당 지급.
   * 회차 시작이 아니라 **전투 종료** 시점이 기준이다 (배팅 5분 → 전투 2.5분).
   */
  settleRush: (now) => {
    const st = get();
    const last = lastSettleableSlot(now);
    const toSettle: number[] = [];
    for (let s = last - 2; s <= last; s++) {
      if (s >= 0 && !st.rushSettled.includes(s)) toSettle.push(s);
    }
    if (!toSettle.length) return;

    const creatures = { ...st.creatures };
    const h2h: H2H = { ...st.rushH2H };
    let money = st.money;
    let bet = st.rushBet;
    let won = 0;
    let result: RushResult | null = null;
    const log: RushLogEntry[] = [...st.rushLog];

    for (const s of toSettle) {
      // 정산 순서 주의: 전적을 갱신하기 **전**의 전적으로 승자를 뽑아야
      // 플레이어가 중계로 본 결과와 일치한다
      const match = matchForSlot(s, creatures, h2h);
      const { winner } = simulate(match, creatures, h2h);
      const loser = winner === match.a ? match.b : match.a;
      log.push({ slot: s, a: match.a, b: match.b, winner });
      creatures[winner] = { ...creatures[winner], wins: creatures[winner].wins + 1 };
      creatures[loser] = { ...creatures[loser], losses: creatures[loser].losses + 1 };
      h2h[h2hKey(winner, loser)] = (h2h[h2hKey(winner, loser)] ?? 0) + 1;

      if (bet && bet.slot === s) {
        let payout = 0;
        if (bet.on === winner) {
          const mul = match.special ? 2 : 1;
          payout = Math.floor(bet.amount * bet.odds * mul);
          money += payout;
          won += payout - bet.amount;
          pushMyEvent('gamble', `${get().nickname}님이 오락실에서 ${fmtShort(payout)}를 땄습니다`, payout >= 3000000);
        } else {
          won -= bet.amount;
        }
        // 토스트 대신 팝업으로 알린다 — 다른 탭에 있어도 놓치지 않게
        result = { slot: s, on: bet.on, winner, amount: bet.amount, payout, special: match.special };
        bet = null;
      }
    }

    set({
      creatures,
      rushH2H: h2h,
      money,
      rushBet: bet,
      rushSettled: [...st.rushSettled, ...toSettle].slice(-20),
      rushLog: log.slice(-10),
      // 정산은 최근 3회차를 한 번에 처리하므로 저장 시점보다 오래된 슬롯이 들어온다.
      // 기록에 남는 가장 오래된 회차가 1회차가 되도록 기준을 내려 준다.
      rushEpoch: Math.min(st.rushEpoch, ...toSettle),
      stats: won !== 0 ? { ...st.stats, gambleWon: st.stats.gambleWon + won } : st.stats,
      ...(result ? { rushResult: result } : null),
    });
  },

  clearRushResult: () => set({ rushResult: null }),
  clearLotteryResult: () => set({ lotteryResult: null }),

  claimCollection: (id) => {
    const st = get();
    const reg = new Set(st.collection);
    const pend = pendingRewards(reg, st.collectionClaimed);
    const target = pend.find((p) => p.id === id);
    if (!target) return;
    const claimed = { ...st.collectionClaimed, claimedKinds: [...st.collectionClaimed.claimedKinds] };
    if (id.startsWith('kind:')) claimed.claimedKinds.push(id.slice(5));
    else if (id === 'allWeapons') claimed.claimedAllWeapons = true;
    else if (id === 'artisanSet') claimed.claimedArtisanSet = true;
    else if (id === 'fullBook') claimed.claimedFullBook = true;
    set({ money: st.money + target.amount, collectionClaimed: claimed });
    if (target.title) get().grantTitle(target.title as TitleId);
    get().toast(`${target.label} 보상 수령`, 'good');
  },

  // ── 출석체크 (이벤트) ────────────────────────────
  checkAttendance: () => {
    const st = get();
    const now = Date.now();
    const today = eventDayKey(now);
    if (st.attendance.lastDay === today) {
      get().toast('오늘은 이미 출석했습니다', 'bad');
      return false;
    }
    // 어제 출석했으면 연속, 아니면 1일부터 다시
    const streak = isYesterday(st.attendance.lastDay, now) ? st.attendance.streak + 1 : 1;
    const aEff = effectsOf(st.equippedTitle);
    const reward = Math.round(ATTENDANCE_REWARD * aEff.attendanceMul);
    set({
      money: st.money + reward,
      attendance: { lastDay: today, streak, total: st.attendance.total + 1 },
      stats: { ...st.stats, attendanceTotal: st.stats.attendanceTotal + 1 },
    });
    get().toast(`출석 완료 — ${fmtShort(reward)} 지급 (${streak}일 연속)`, 'good');
    return true;
  },

  // ── 아르바이트 ──────────────────────────────────

  redeemCoupon: (raw) => {
    const st = get();
    const { result, coupon } = redeemable(raw, st.coupons);
    switch (result) {
      case 'empty':
        get().toast('쿠폰 코드를 입력하세요', 'bad');
        return result;
      case 'unknown':
        get().toast('존재하지 않는 쿠폰입니다', 'bad');
        return result;
      case 'used':
        get().toast('이미 사용한 쿠폰입니다', 'bad');
        return result;
    }
    const c = coupon!;
    // 주문서는 기존 보유량에 더한다 (덮어쓰면 갖고 있던 게 날아간다)
    const gained = couponScrolls(c);
    const scrolls = { ...st.scrolls };
    for (const [k, n] of Object.entries(gained)) {
      scrolls[k as ScrollId] = (scrolls[k as ScrollId] ?? 0) + (n ?? 0);
    }
    // 재료도 기존 보유량에 더한다
    const gainedMat = couponMaterials(c);
    const materials = { ...st.materials };
    for (const [k, n] of Object.entries(gainedMat)) {
      materials[k as MaterialId] = (materials[k as MaterialId] ?? 0) + (n ?? 0);
    }
    set({
      money: st.money + (c.money ?? 0),
      scrolls,
      materials,
      /*
        다시 쓸 수 있는 쿠폰은 **기록하지 않는다.**

        판정이 어차피 이 목록을 안 보므로 (core/coupons 의 `repeatable`) 남길 이유가
        없고, 남기면 쓸 때마다 배열이 한 칸씩 늘어난다. 시험용 쿠폰은 수십 번씩
        쓰는 물건이라 그게 그대로 저장본 크기가 되고, 저장본은 매번 디스크에 쓰이고
        서버로도 올라간다.
      */
      coupons: c.repeatable ? st.coupons : [...st.coupons, c.code],
    });
    get().toast(`쿠폰 등록 — ${couponSummary(c)} 지급`, 'good');
    return result;
  },

  doPartTime: () => {
    const st = get();
    // 최대 소모치만큼은 남아 있어야 받는다 — 굴린 뒤에 막히면 억울하다
    if (st.stamina < STAMINA_REQUIRED) {
      get().toast(`체력이 ${STAMINA_REQUIRED} 이상 필요합니다`, 'bad');
      return null;
    }
    const res = work();
    set({
      stamina: st.stamina - res.stamina,
      staminaAt: st.stamina >= selMaxStamina(st) ? Date.now() : st.staminaAt,
      money: st.money + res.pay,
      stats: {
        ...st.stats,
        partTimeCount: st.stats.partTimeCount + 1,
        partTimeEarned: st.stats.partTimeEarned + res.pay,
      },
    });
    return res;
  },

  // ── 복권 구매 ───────────────────────────────────
  buyTickets: (n) => {
    const st = get();
    const now = Date.now();
    const key = drawKey(now);
    const owned = st.lottery.tickets.filter((t) => t.drawKey === key).length;
    const room = DAILY_LIMIT - owned;
    if (n <= 0) return false;
    if (room <= 0) { get().toast(`이번 회차는 ${DAILY_LIMIT}장까지입니다`, 'bad'); return false; }
    if (n > room) { get().toast(`이번 회차에 ${room}장만 더 살 수 있습니다`, 'bad'); return false; }
    const total = TICKET_PRICE * n;
    if (st.money < total) { get().toast('돈이 부족합니다', 'bad'); return false; }

    const drawAt = nextDrawAt(now);
    const tickets: Ticket[] = [];
    for (let i = 0; i < n; i++) {
      const serial = st.lottery.serial + i + 1;
      tickets.push({ id: `lt-${key}-${serial}`, serial, drawKey: key, drawAt, boughtAt: now });
    }
    set({
      money: st.money - total,
      lottery: {
        ...st.lottery,
        serial: st.lottery.serial + n,
        tickets: [...st.lottery.tickets, ...tickets],
      },
      stats: { ...st.stats, lotteryBought: st.stats.lotteryBought + n },
    });
    get().toast(`복권 ${n}장 구매 — 추첨은 오후 8시`, 'plain');
    return true;
  },

  // ── 쿠지 · 가챠 ─────────────────────────────────
  drawBox: (box, n, kind) => {
    const st = get();
    const now = Date.now();
    /*
      쿠지는 종류를 **화면이 골라 넘긴다** (core/draw 의 KUJI_KINDS).
      예전엔 사이클마다 종류가 돌아가서 원하는 걸 뽑으려면 회차를 기다려야 했다.
    */
    const spec = box === 'kuji' ? kujiByKey(kind ?? '') : BOXES[box];
    /* 재고·한도도 종류마다 따로 센다 — 하나로 세면 한 종류만 뽑아도 전부 잠긴다 */
    const key = box === 'kuji' ? kujiKeyOf(spec) : box;
    const today = dayKeyOf(now);

    // 날짜가 바뀌었으면 오늘치 소비를 0으로 (박스도 자정에 리셋된다)
    const rec = st.draws[key] ?? { dayKey: '', today: 0, cycleKey: '', inCycle: 0 };
    const todayCount = rec.dayKey === today ? rec.today : 0;
    const bs = boxState(spec, now, todayCount);
    const inCycle = rec.cycleKey === bs.cycleKey ? rec.inCycle : 0;

    const room = spec.perUserLimit - inCycle;
    if (n <= 0) return null;
    if (room <= 0) {
      get().toast(`이번 회차는 ${spec.perUserLimit}회까지입니다`, 'bad');
      return null;
    }
    if (n > room) {
      get().toast(`이번 회차에 ${room}회만 더 뽑을 수 있습니다`, 'bad');
      return null;
    }
    const kEff = effectsOf(st.equippedTitle);
    const unitPrice = box === 'kuji'
      ? Math.max(1, Math.floor(spec.price * (1 - kEff.kujiDiscount)))
      : spec.price;
    const cost = unitPrice * n;
    if (st.money < cost) { get().toast('돈이 부족합니다', 'bad'); return null; }

    const results = drawFromBox(spec, now, todayCount, inCycle, n);

    // 상품 적용
    let money = st.money - cost;
    const scrolls = { ...st.scrolls };
    const materials = { ...st.materials };
    const stones = { ...st.stones };
    /*
      로고는 **계정에 한 장**뿐이다. 이미 있으면 값어치만큼 돈으로 바꿔 준다 —
      500칸에 한 칸짜리를 뽑고서 아무 일도 안 일어나면 버그로 읽힌다.
    */
    const AVATAR_REFUND = g(50);
    const owned = new Set(st.ownedAvatars);
    const gotAvatars: AvatarId[] = [];
    let refunded = 0;

    const apply = (p: Prize) => {
      if (p.kind === 'money') money += p.amount;
      else if (p.kind === 'scroll') scrolls[p.id] = (scrolls[p.id] ?? 0) + p.qty;
      else if (p.kind === 'stone') stones[p.id] = (stones[p.id] ?? 0) + p.qty;
      else if (p.kind === 'avatar') {
        if (owned.has(p.id)) { money += AVATAR_REFUND; refunded += 1; }
        else { owned.add(p.id); gotAvatars.push(p.id); }
      }
      // 가챠의 재료 상품은 계열 중 하나로 들어간다
      else materials[materialFor(p.part)] = (materials[materialFor(p.part)] ?? 0) + p.qty;
    };
    for (const r of results) {
      apply(r.prize);
      if (r.lastOne) apply(r.lastOne.prize);
    }

    // 뽑은 뒤의 사이클 키로 갱신 (도중에 사이클이 넘어갈 수 있다)
    const after = boxState(spec, now, todayCount + n);
    set({
      money,
      scrolls,
      materials,
      stones,
      ownedAvatars: gotAvatars.length ? [...owned] : st.ownedAvatars,
      draws: {
        ...st.draws,
        [key]: {
          dayKey: today,
          today: todayCount + n,
          cycleKey: after.cycleKey,
          inCycle: after.cycleKey === bs.cycleKey ? inCycle + n : 0,
        },
      },
    });

    // 상위 등급은 실시간 피드로 자랑한다
    for (const r of results) {
      const rank = spec.grades.findIndex((x) => x.id === r.gradeId);
      if (rank <= 1) {
        pushMyEvent('gamble', `${get().nickname}님이 ${spec.name} ${r.label}(${r.prizeLabel})을 뽑았습니다`, true);
      }
      if (r.lastOne) {
        pushMyEvent('gamble', `${get().nickname}님이 ${spec.name} 라스트원상을 가져갔습니다`, true);
      }
    }
    for (const id of gotAvatars) {
      get().toast(`로고 "${AVATAR_NAME[id]}"을(를) 얻었습니다`, 'good');
      pushMyEvent('gamble', `${get().nickname}님이 쿠지에서 "${AVATAR_NAME[id]}" 로고를 얻었습니다`, true);
    }
    if (refunded > 0) {
      get().toast(`이미 가진 로고 — ${fmtShort(AVATAR_REFUND * refunded)}로 바꿨습니다`, 'plain');
    }

    // A상(최상위 등급)을 뽑았으면 "행운의 손"
    if (box === 'kuji' && results.some((r) => spec.grades[0]?.id === r.gradeId)) {
      set({ titleTrack: { ...get().titleTrack, kujiA: true } });
    }
    get().checkTitles();
    return results;
  },
});
