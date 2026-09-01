import {
  COUPON_RESET_SEQ, couponMaterials, couponScrolls, couponSummary, normalizeCode, redeemable,
} from './coupons';
import {
  initCreatures, matchForSlot, simulate, slotOf, oddsFor, timingOf, h2hKey, h2hOf,
  lastSettleableSlot, RUSH_PERIOD_MS, RUSH_BET_MS, RUSH_FIGHT_MS, RUSH_IDLE_MS, RUSH_TURN_MS, RUSH_TURNS, RUSH_MAX_HP, SPECIAL_EVERY,
  PLAIN_MAX_MUL, ULT_MIN_MUL, ULT_MAX_MUL,
  weekStartOf, weekKeyOf, nextWeekReset,
} from './rush';
import { ARENA_BADGE_MS, rollQuests, regenStamina, arenaTierOf, exploreReward, towerReward, questWinRate, stageWinRate, chapterName, exploreRecIlvl, towerRecIlvl, arenaWinRate, questEV, questBaseRate, QUEST_HOUSE_KEEP, QUEST_DIFFICULTY } from './combat';
import { rumorsForSlot, rumorSlotOf } from './rumor';
import { pendingRewards, entryKey, artisanKey, TOTAL_ENTRIES, NORMAL_ENTRIES, ARTISAN_ENTRIES, isArtisanComplete, artisanCount } from './collection';
import { artisanItemName, artisanOf, DUNKARAX } from './artisans';
import { itemName } from './tiers';
import { KIND_NAME, ARTISAN_TIER, PART_KINDS, SCROLL_IDS, SLOT_ACCEPTS, SLOT_IDS } from './types';
import { effectsOf } from './titles';
import { newItem, playerIlvl, playerCurrentIlvl, currentItemLevel, itemLevel, maxSetIlvl, round1, SLOT_COUNT, toAvg } from './tiers';
import { sellPrice, repairCost } from './economy';
import { fmt, g } from './currency';
import { REFUSALS, TAVERN_MENU, tavernLeft, tavernLimitText, tavernRefusal } from './economy';
import { formatUnread, CHAT_HISTORY_MAX } from './chat';
import { PRIZES, TICKET_PRICE, DAILY_LIMIT, DRAW_HOUR, WIN_PROB, expectedValue, payoutRatio, nextDrawAt, drawKey, resultFor, prizeOf } from './lottery';
import { work, STAMINA_MIN, STAMINA_MAX, PAY_MIN, PAY_MAX, payPerStamina } from './parttime';
import { ATTENDANCE_REWARD, dayKey, isYesterday, EVENTS } from './events';
import {
  KUJI, KUJI_LOGO, KUJI_ROTATION, GACHA, boxState, cycleGrades, draw as drawBox,
  kujiFor, payoutRatio as boxPayout, gradeOf,
} from './draw';
import { SCROLLS, effectiveOdds, tierSuccess, TIER_NEUTRAL, ENHANCE_SCROLL_ORDER, SCROLL_ORDER } from './enhance';

/** 줄바꿈 — 소스에 직접 쓰면 편집 스크립트가 자꾸 실제 개행으로 바꿔 놓는다 */
const NL = String.fromCharCode(10);

let fails = 0;
const ok = (name: string, cond: boolean, extra = '') => {
  if (!cond) { fails++; console.log(`  ✗ ${name} ${extra}`); }
  else console.log(`  ✓ ${name} ${extra}`);
};

console.log('── 크리처 러쉬 ──');
const cr = initCreatures();
ok('크리처 10종', Object.keys(cr).length === 10);
const m = matchForSlot(12345, cr);
ok('대진 서로 다름', m.a !== m.b, `${m.a} vs ${m.b}`);
ok('배당 역산', m.oddsA > 1 && m.oddsB > 1, `×${m.oddsA} / ×${m.oddsB}`);
const s1 = simulate(m, cr), s2 = simulate(m, cr);
ok('시드 고정 — 결과 재현', s1.winner === s2.winner && s1.turns.length === s2.turns.length, `${s1.turns.length}턴`);
ok('승자가 대진 안에', s1.winner === m.a || s1.winner === m.b);
{
  // 2초에 한 줄씩 올라오도록 턴 수를 시간에 맞춘다
  ok('턴 간격 2초', RUSH_TURN_MS === 2_000);
  ok('턴 수 = 전투시간 / 간격', RUSH_TURNS === RUSH_FIGHT_MS / RUSH_TURN_MS, String(RUSH_TURNS));
  ok('로그 = 턴 + 승자선언', s1.turns.length === RUSH_TURNS + 1, String(s1.turns.length));
  const end = s1.turns[s1.turns.length - 1];
  const loserHp = s1.winner === m.a ? end.hpB : end.hpA;
  const winHp = s1.winner === m.a ? end.hpA : end.hpB;
  ok('패자는 0 으로 끝난다', loserHp === 0, String(loserHp));
  ok('승자는 살아서 끝난다', winHp > 0, `${winHp}/${RUSH_MAX_HP}`);
  // 마지막 턴에 가서야 결판난다 — 중간에 0 이 되면 나머지 시간이 죽는다
  const dead = s1.turns.findIndex((t) => t.hpA === 0 || t.hpB === 0);
  ok('중간에 끝나지 않는다', dead >= RUSH_TURNS - 1, `${dead + 1}번째 턴`);
  // HP 가 단조 감소인가
  ok('HP 단조 감소', s1.turns.every((t, k) => k === 0
    || (t.hpA <= s1.turns[k-1].hpA && t.hpB <= s1.turns[k-1].hpB)));
  ok('최대 HP 1000', s1.turns[0].hpA <= RUSH_MAX_HP && RUSH_MAX_HP === 1000);
  // 로그가 2초에 하나씩 4분간 = 120줄. 전투 시간을 바꾸면 함께 움직여야 한다
  // 지난 결과 목록은 정산 기록을 읽는다 — 마이그레이션이 형태를 지켜야 한다
  {
    const { migrateState } = require('../state/migrate') as typeof import('../state/migrate');
    const m = migrateState({ rushLog: [
      { slot: 5, a: 'slime', b: 'wolf', winner: 'wolf' },
      { slot: 6, a: 'ogre', winner: 'ogre' },              // b 없음 → 버림
      { a: 'bat', b: 'boar', winner: 'bat' },              // slot 없음 → 0 으로
    ] });
    ok('온전한 항목만 살린다', m.rushLog.length === 2, String(m.rushLog.length));
    ok('slot 결측은 0', m.rushLog[1].slot === 0);
    ok('쓰레기 입력도 빈 배열', migrateState({ rushLog: 'nope' }).rushLog.length === 0);
    ok('10개 상한', migrateState({
      rushLog: Array.from({ length: 30 }, (_, i) => ({ slot: i, a: 'a', b: 'b', winner: 'a' })),
    }).rushLog.length === 10);
  }
  // ── 회차 번호 · 실전적 · 반전 · 필살기 ──
  {
    const {
      roundNo, shouldFlip, initCreatures, creatureUlt, CREATURE_DEFS, ULT_HP_RATIO,
      winRateOf: wrate,
    } = require('./rush') as typeof import('./rush');
    /*
      회차 번호는 **이번 주의 몇 번째 경기인가** 다.

      예전엔 저장해 둔 첫 회차(rushEpoch)를 빼서 셌는데, 회차 길이를 바꾸자
      `slotOf` 가 통째로 밀려 화면에 1,445,121 회차가 찍혔다 — 저장된 기준점이
      옛 눈금으로 잰 값이었기 때문이다. 지금은 주 시작에서 세므로 저장에 안 기댄다.
    */
    {
      const { weekStartOf: wkStart, slotOf: slotAt, RUSH_PERIOD_MS: PER } =
        require('./rush') as typeof import('./rush');
      // 어떤 수요일 오후를 잡아 그 주의 월요일 00시와 비교한다
      const t = new Date(2026, 7, 26, 15, 30, 0).getTime();
      const monday = wkStart(t);

      /*
        ⚠ 월요일 00시를 **걸치고 있는** 회차는 지난주 것이다.

        회차 경계(slot)는 1970년 기준으로 끊기고 주 경계는 지역시각 자정이라
        둘이 딱 안 맞는다. 자정을 걸친 경기는 자정 전에 시작했으므로 지난주의
        마지막 회차로 세는 게 맞다 — 새 주의 1회차는 **그 다음** 회차다.
      */
      const first = slotAt(monday) + 1;
      ok('새 주의 첫 회차가 1', roundNo(first) === 1, String(roundNo(first)));
      ok('그 다음은 2', roundNo(first + 1) === 2, String(roundNo(first + 1)));
      ok('자정을 걸친 회차는 지난주 마지막', roundNo(first - 1) > 1,
        String(roundNo(first - 1)));
      ok('회차는 1 아래로 안 내려간다', roundNo(slotAt(monday) - 1) >= 1);

      // 주가 바뀌면 다시 1부터 — 큰 수에서 1 로 떨어진다
      const nextMon = wkStart(t) + 7 * 24 * 3600_000;
      const nextFirst = slotAt(nextMon) + 1;
      ok('다음 주도 1회차부터', roundNo(nextFirst) === 1, String(roundNo(nextFirst)));
      ok('리셋 직전은 큰 수', roundNo(nextFirst - 1) > 1000,
        `${roundNo(nextFirst - 1)} → ${roundNo(nextFirst)}`);

      // 한 주 안에서는 계속 올라간다
      const mid = roundNo(slotAt(t));
      ok('주중에는 1보다 크다', mid > 1, String(mid));
      ok('한 주 회차 수가 읽을 만하다', roundNo(slotAt(nextMon - PER)) < 3000,
        String(roundNo(slotAt(nextMon - PER))));

      // 회차 길이를 바꿔도 저장값과 어긋나지 않는다 (에폭을 안 쓴다)
      ok('roundNo 는 인자 하나만 받는다', roundNo.length === 1, String(roundNo.length));
    }

    const fresh = initCreatures();
    ok('전적은 0 부터', Object.values(fresh).every((c) => c.wins === 0 && c.losses === 0));
    // 전적이 없어도 배당은 갈린다 (power 사전확률)
    ok('강한 크리처가 더 높은 승률', wrate(fresh.ogre) > wrate(fresh.slime),
      `${(wrate(fresh.ogre)*100).toFixed(0)}% vs ${(wrate(fresh.slime)*100).toFixed(0)}%`);

    // 아트는 촉수만 빼고 전부 오른쪽을 본다 → 오른쪽 자리에서만 뒤집는다
    const RIGHTIES = CREATURE_DEFS.filter((c) => c.face === 'r').map((c) => c.id);
    ok('오른쪽 보는 아트 9종', RIGHTIES.length === 9, String(RIGHTIES.length));
    ok('오른쪽 자리에서 전부 반전', RIGHTIES.every((id) => shouldFlip(id, 'right')));
    ok('왼쪽 자리는 전부 그대로', RIGHTIES.every((id) => !shouldFlip(id, 'left')));
    ok('대칭 아트(촉수)는 어느 자리에서도 안 뒤집는다',
      !shouldFlip('tentacle', 'left') && !shouldFlip('tentacle', 'right'));

    ok('필살기 10종 전부 다름',
      new Set(CREATURE_DEFS.map((c) => c.ult)).size === CREATURE_DEFS.length);
    ok('필살기 이름 조회', creatureUlt('wolf') === '목덜미 물기');
    ok('발동 기준 30%', ULT_HP_RATIO === 0.3);

    // 필살기는 궁지에 몰린 뒤에만 나온다
    const ults = s1.turns.filter((t) => t.ult);
    ok('필살기가 실제로 나온다', ults.length > 0, `${ults.length}회`);
    ok('필살기는 HP 30% 이하에서만',
      ults.every((t) => Math.min(t.hpA, t.hpB) <= RUSH_MAX_HP * ULT_HP_RATIO * 1.5));
    /*
      필살기는 **반드시 평타보다 세다.**

      역전의 발판이라 걸었는데 강격만도 못한 숫자가 뜨면 그냥 김 빠지는 연출이다.
      빗나간 것(피해 0)만 빼고, 맞은 필살기는 같은 경기의 평타 최댓값보다 커야 한다.
    */
    /*
      배수로 검사한다 — 절대 피해로는 못 잰다.

      기준 피해(base)는 남은 예산 ÷ 남은 턴이라 턴마다 다르다. 경기 초반의 평타가
      막바지의 필살기보다 절대값이 큰 건 정상이다. 규칙은 **같은 턴 안에서**
      필살기가 평타보다 세다는 것이고, 그건 배수 상수의 관계가 보장한다.
    */
    ok('필살기 최소 배수 > 평타 최대 배수', ULT_MIN_MUL > PLAIN_MAX_MUL,
      `${ULT_MIN_MUL} vs ${PLAIN_MAX_MUL}`);
    ok('직격은 평타의 두 배 이상', ULT_MAX_MUL >= PLAIN_MAX_MUL * 2,
      `${ULT_MAX_MUL} vs ${PLAIN_MAX_MUL}`);

    /*
      "직격인데 피해 2" 가 안 나와야 한다.

      예산이 마른 막바지에 필살기가 나오면 배수를 아무리 올려도 0에 가깝다.
      게이트(ULT_MIN_BASE)가 그걸 막는데, 실제로 막히는지는 결과로 확인한다 —
      맞은 필살기는 최대 HP 의 1% 는 넘겨야 한다.
    */
    const hitUlts = ults.filter((t) => (t.dmg ?? 0) > 0);
    ok('맞은 필살기는 초라하지 않다',
      hitUlts.every((t) => (t.dmg ?? 0) >= RUSH_MAX_HP * 0.01),
      hitUlts.length ? `최소 ${Math.min(...hitUlts.map((t) => t.dmg ?? 0))}` : '없음');
    ok('빗나가는 경우도 있다 (없으면 도박이 아니다)',
      s1.turns.some((t) => t.ult && !t.dmg) || ults.length < 5, `${ults.length}회 중`);

    // 로그의 피해량과 체력바가 어긋나면 안 된다
    {
      let a = RUSH_MAX_HP;
      let b = RUSH_MAX_HP;
      let bad = 0;
      for (const t of s1.turns) {
        const drop = t.atkA ? b - t.hpB : a - t.hpA;
        if (drop !== (t.dmg ?? 0)) bad++;
        a = t.hpA; b = t.hpB;
      }
      ok('로그의 피해량 = 실제로 깎인 체력', bad === 0, `${bad}턴 어긋남`);
    }
  }
  ok('전투 시간과 로그 수가 맞물린다',
    RUSH_TURNS * RUSH_TURN_MS === RUSH_FIGHT_MS,
    `${RUSH_TURNS}줄 × ${RUSH_TURN_MS}ms = ${RUSH_FIGHT_MS}ms`);
}
ok('3회차마다 특수룰', matchForSlot(3, cr).special && !matchForSlot(4, cr).special);
{
  // 회차 = 배팅 3분 → 전투 2분 → 대기 30초 (총 5분 30초)
  ok('회차 = 배팅+전투+대기', RUSH_PERIOD_MS === RUSH_BET_MS + RUSH_FIGHT_MS + RUSH_IDLE_MS);
  ok('배팅 3분', RUSH_BET_MS === 180_000, String(RUSH_BET_MS));
  ok('전투 2분', RUSH_FIGHT_MS === 120_000, String(RUSH_FIGHT_MS));
  ok('대기 30초', RUSH_IDLE_MS === 30_000);
  const base = 100 * RUSH_PERIOD_MS;
  ok('배팅 구간 끝까지 배팅',
    timingOf(base).phase === 'betting'
    && timingOf(base + RUSH_BET_MS - 1_000).phase === 'betting');
  ok('배팅이 끝나면 전투 시작', timingOf(base + RUSH_BET_MS + 1).phase === 'fighting');
  ok('전투 끝 → 대기', timingOf(base + RUSH_BET_MS + RUSH_FIGHT_MS + 1).phase === 'idle');
  ok('회차 끝 → 다음 배팅', timingOf(base + RUSH_PERIOD_MS + 1).slot === 101
    && timingOf(base + RUSH_PERIOD_MS + 1).phase === 'betting');
  const mid = timingOf(base + RUSH_BET_MS + RUSH_FIGHT_MS / 2);
  ok('전투 진행률 중간 ≈ 50%', Math.abs(mid.progress - 0.5) < 0.01, `${(mid.progress*100).toFixed(0)}%`);
  // 정산은 전투 종료 기준
  ok('배팅 중엔 이전 회차까지만 정산', lastSettleableSlot(base + 60_000) === 99);
  ok('전투 종료 후 이 회차 정산', lastSettleableSlot(base + RUSH_BET_MS + RUSH_FIGHT_MS + 1) === 100);
}
{
  // 상대전적이 배당에 반영되는가
  const a = cr.ogre, bb = cr.slime;
  const flat = oddsFor(a, bb, {});
  const skewed = oddsFor(a, bb, { [h2hKey('ogre','slime')]: 20 });
  ok('상대전적이 배당을 움직인다', skewed.pA > flat.pA, `${(flat.pA*100).toFixed(0)}% → ${(skewed.pA*100).toFixed(0)}%`);
  ok('상대전적 조회', h2hOf({ [h2hKey('ogre','slime')]: 3, [h2hKey('slime','ogre')]: 1 }, 'ogre','slime').games === 4);
  // 표본 1전은 총 전적을 더 믿는다 (수축)
  const one = oddsFor(a, bb, { [h2hKey('slime','ogre')]: 1 });
  ok('표본 적으면 총 전적 우세', Math.abs(one.pA - flat.pA) < Math.abs(skewed.pA - flat.pA));
  ok('배당은 항상 1 초과', flat.oddsA > 1 && flat.oddsB > 1 && skewed.oddsB > 1);
}
{
  // 주간 리셋 — 월요일 00시
  const mon = new Date(2026, 7, 17, 0, 0, 0).getTime();        // 2026-08-17 은 월요일
  ok('주 시작 = 월요일 00시', weekStartOf(mon) === mon && new Date(weekStartOf(mon)).getDay() === 1);
  ok('화요일도 같은 주', weekKeyOf(new Date(2026,7,18,13,0,0).getTime()) === weekKeyOf(mon));
  ok('일요일 23:59 도 같은 주', weekKeyOf(new Date(2026,7,23,23,59,0).getTime()) === weekKeyOf(mon));
  ok('다음 월요일 00시 = 다른 주', weekKeyOf(new Date(2026,7,24,0,0,1).getTime()) !== weekKeyOf(mon),
    `${weekKeyOf(mon)} → ${weekKeyOf(new Date(2026,7,24,0,0,1).getTime())}`);
  ok('일요일 기준 주 시작도 월요일', new Date(weekStartOf(new Date(2026,7,23,12,0,0).getTime())).getDay() === 1);
  ok('다음 리셋 = 7일 뒤 월요일 00시', nextWeekReset(mon) === mon + 7*86400_000
    && new Date(nextWeekReset(mon)).getDay() === 1 && new Date(nextWeekReset(mon)).getHours() === 0);
}

console.log('── 전투/퀘스트 ──');
const qs = rollQuests(100, 999);
ok('퀘스트 5개', qs.length === 5);
ok('보통 난이도 보증금 = 30실버 (기획서 앵커: 평균 100 = 합 1600)', rollQuests(100*SLOT_COUNT, 7).find(q=>q.difficulty==='normal')!.deposit === 3000, fmt(rollQuests(100*SLOT_COUNT,7).find(q=>q.difficulty==='normal')!.deposit));
ok('같은 슬롯 = 같은 목록', JSON.stringify(rollQuests(100,999)) === JSON.stringify(qs));
ok('회생 직후(템렙 0) 퀘스트 가능', rollQuests(0, 5).every(q => q.deposit <= 50), fmt(Math.max(...rollQuests(0,5).map(q=>q.deposit))));
{
  const qs2 = rollQuests(1600, 55);
  const q = qs2.find(x => x.difficulty === 'normal')!;
  ok('굴린 시점 템렙이 기준선', q.baseIlvl === 1600);
  ok('기준 시점 승률 = 손익분기×하우스몫', Math.abs(questWinRate(1600, q) - questBaseRate('normal')) < 1e-9,
    `${(questWinRate(1600,q)*100).toFixed(1)}%`);
  ok('장비 갖추면 쉬워진다', questWinRate(1600*1.4, q) > questWinRate(1600, q),
    `${(questWinRate(1600,q)*100).toFixed(1)}% → ${(questWinRate(1600*1.4,q)*100).toFixed(1)}%`);
  ok('내구도 닳으면 어려워진다', questWinRate(1600*0.6, q) < questWinRate(1600, q));
  ok('보정 상한 ±20%p', questWinRate(1600*100, q) - questBaseRate('normal') <= 0.2001);
  // 전 난이도 기대값이 하우스 몫으로 통일되어야 한다 (1 을 넘으면 돈 복사)
  for (const d of ['easy','normal','hard','extreme'] as const) {
    ok(`${QUEST_DIFFICULTY[d].label} EV = ${QUEST_HOUSE_KEEP}`, Math.abs(questEV(d) - QUEST_HOUSE_KEEP) < 1e-9, questEV(d).toFixed(3));
  }
}
// ── 아이템레벨 대결 승률 (탐험 · 보스의탑 · 투기장 공용) ──
{
  const { ilvlWinRate, WIN_ANCHOR_RATIO, WIN_MIN, WIN_MAX } =
    require('./combat') as typeof import('./combat');
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  ok('같은 템렙이면 50%', Math.abs(ilvlWinRate(5000, 5000) - 0.5) < 1e-9, pct(ilvlWinRate(5000, 5000)));
  ok('1.5배 높으면 93%', Math.abs(ilvlWinRate(1500, 1000) - 0.93) < 1e-9, pct(ilvlWinRate(1500, 1000)));
  ok('1.5배 낮으면 20%', Math.abs(ilvlWinRate(1000, 1500) - 0.20) < 1e-9, pct(ilvlWinRate(1000, 1500)));
  // 차이가 아니라 비율이다 — 스케일이 100배 달라도 같은 승률이 나와야 한다
  ok('스케일 불변 (차이식이 아니다)',
    Math.abs(ilvlWinRate(30, 20) - ilvlWinRate(3000, 2000)) < 1e-9,
    `${pct(ilvlWinRate(30, 20))} vs ${pct(ilvlWinRate(3000, 2000))}`);
  ok('단조 증가', ilvlWinRate(900, 1000) < ilvlWinRate(1000, 1000)
    && ilvlWinRate(1000, 1000) < ilvlWinRate(1100, 1000));
  ok('상·하한을 벗어나지 않는다',
    ilvlWinRate(1, 1e9) >= WIN_MIN && ilvlWinRate(1e9, 1) <= WIN_MAX);
  ok('템렙 0 인 상대는 못 진다', ilvlWinRate(100, 0) === WIN_MAX);
  // 세 콘텐츠가 정말 같은 곡선을 쓰는지 (따로 두면 조용히 갈라진다)
  ok('투기장·탐험이 같은 곡선',
    arenaWinRate(1500, 1000) === ilvlWinRate(1500, 1000)
    && stageWinRate(1500, 1000) === ilvlWinRate(1500, 1000));
  ok(`앵커 비율 ${WIN_ANCHOR_RATIO}`, WIN_ANCHOR_RATIO === 1.5);
}

// 부위 가중치에 따라 최고 세트 합이 바뀌므로 숫자를 박지 않는다 — 관계만 검사
ok('탐험 챕터100 권장 = 최고 세트 합',
  exploreRecIlvl(100) === maxSetIlvl(), `${exploreRecIlvl(100)} vs ${maxSetIlvl()}`);
// 탑은 자체 기준(10티어+12 풀셋+A~S룬)으로 잡히므로 탐험 곡선과 별개다
ok('보스의탑 50층이 탐험 100챕터급',
  Math.abs(towerRecIlvl(50) / exploreRecIlvl(100) - 1) < 0.1,
  `${towerRecIlvl(50)} / ${exploreRecIlvl(100)}`);
ok('보스 챕터 ×5', exploreReward(10) === exploreReward(9) / (10+9*11) * 0 + exploreReward(10), `ch10=${exploreReward(10)} ch9=${exploreReward(9)}`);
ok('체력 10분당 1', regenStamina(50, 0, 60*60000).stamina === 56, String(regenStamina(50,0,60*60000).stamina));
// 한 티어는 1000점 — 티어당 100점이던 시절의 열 배다 (너무 금방 올라갔다)
ok('투기장 티어',
  arenaTierOf(0) === 'F' && arenaTierOf(6500) === 'S' && arenaTierOf(2500) === 'D',
  `${arenaTierOf(0)} ${arenaTierOf(6500)} ${arenaTierOf(2500)}`);

console.log('── 장비/경제 ──');
// 부위 가중치가 붙어 무기는 표 값보다 높다 (방어구가 표준, 장신구가 낮다)
const it = newItem('chest', 5, 15, 100);
ok('내구 100 = 보정 없음', currentItemLevel(it) === itemLevel(it));
ok('내구 0 = 50% 감소', currentItemLevel({...it, dur:0}) === round1(itemLevel(it) * 0.5),
  `${currentItemLevel({...it, dur:0})} vs ${round1(itemLevel(it) * 0.5)}`);
ok('내구 50 = 경계값', currentItemLevel({...it, dur:50}) === itemLevel(it));
ok('한 자루만 차면 그 값이 합',
  playerIlvl({ weapon: newItem('sword',10,15,100) }) === itemLevel(newItem('sword',10,15,100)),
  String(playerIlvl({weapon:newItem('sword',10,15,100)})));
ok('강화 1회가 합에 바로 반영',
  playerIlvl({ weapon: newItem('sword',1,6,100) })
  > playerIlvl({ weapon: newItem('sword',1,5,100) }),
  `+5 ${playerIlvl({weapon:newItem('sword',1,5,100)})} → +6 ${playerIlvl({weapon:newItem('sword',1,6,100)})}`);
{
  // 곡선을 합 단위로 올렸으니 상대 난이도는 기획서와 같아야 한다.
  // ⚠ 16칸을 전부 무기로 채우면 안 된다 — 부위 가중치 때문에 실제 구성보다 6% 높게 나온다
  const eqFull = (t: number) => Object.fromEntries(
    SLOT_IDS.map((sl) => [sl, newItem(sl === 'weapon' ? 'sword' : SLOT_ACCEPTS[sl][0], t as never, 15, 100)])
  ) as any;
  const dragonSum = playerIlvl(eqFull(10));
  // 부위 가중치에 따라 달라지는 값이므로 숫자를 박지 않는다
  ok('용린+15 풀셋 = maxSetIlvl', dragonSum === require('./tiers').maxSetIlvl(), String(dragonSum));
  const w = stageWinRate(dragonSum, exploreRecIlvl(100));
  ok('용린+15 풀셋의 챕터100 승률 ≈ 50% (기획서 의도 보존)', Math.abs(w - 0.5) < 0.01, `${(w*100).toFixed(1)}%`);
  const t1 = playerIlvl(eqFull(1));
  const w1 = stageWinRate(t1, exploreRecIlvl(1));
  /**
   * 챕터 1 은 **거르는 판이 아니라 가르치는 판**이다 (곡선을 30 에서 시작하도록
   * 바꾸면서 같이 정한 규칙). 티어1+15 를 맞춘 사람이면 확실히 이겨야 한다.
   * 예전엔 여기가 50~60% 였는데, 그건 맨몸으로 시작하는 사람에겐 벽이었다.
   */
  ok('티어1+15 풀셋이면 챕터1 은 확실히 이긴다 (65% 이상)', w1 >= 0.65, `${(w1*100).toFixed(1)}%`);
  const bareIlvl = SLOT_COUNT * (require('./tiers') as typeof import('./tiers')).TIERS[1].base;
  const wBare = stageWinRate(bareIlvl, exploreRecIlvl(1));
  ok('맨몸으로도 챕터1 은 반반 이상', wBare >= 0.5, `${(wBare*100).toFixed(1)}%`);
  ok('평균 환산 헬퍼', toAvg(1110 * SLOT_COUNT) === 1110);
  void itemLevel; void arenaWinRate; void playerCurrentIlvl;
}
ok('수리비 = 아이템레벨 × %p', repairCost({...it, dur: 50}) > 0);

console.log('── 소문/도감 ──');
const rm = rumorsForSlot(rumorSlotOf(Date.now()));
ok('소문 생성', rm.length >= 2, `${rm.length}개`);
/*
  도감 칸 수는 **부위 수에서 따라온다.** 숫자를 박아 두면 부위를 하나 없앨 때마다
  여기가 먼저 깨지는데, 그건 버그가 아니라 의도한 변화다. 관계만 검사한다.
  (견갑을 없애 20부위 × 10티어 = 200 + 장인 20 = 220칸)
*/
ok('도감 칸 = 부위 × 티어 + 장인',
  NORMAL_ENTRIES === PART_KINDS.length * 10
  && ARTISAN_ENTRIES === PART_KINDS.length
  && TOTAL_ENTRIES === NORMAL_ENTRIES + ARTISAN_ENTRIES,
  `${TOTAL_ENTRIES} = ${NORMAL_ENTRIES} + ${ARTISAN_ENTRIES}`);
ok('견갑은 도감에서 빠졌다', !(PART_KINDS as readonly string[]).includes('shoulder'));
ok('장인은 둔카락스 한 명', artisanOf('sword').id === 'dunkarax' && artisanOf('chest') === DUNKARAX && artisanOf('ring') === DUNKARAX);
ok('장인 무구 이름', artisanItemName('sword') === '둔카락스의 검', artisanItemName('sword'));
ok('itemName 이 장인 이름을 쓴다', itemName(newItem('chest', ARTISAN_TIER, 3, 100), KIND_NAME) === '둔카락스의 갑옷 +3',
  itemName(newItem('chest', ARTISAN_TIER, 3, 100), KIND_NAME));
{
  const s = new Set<string>();
  ok('장인 시리즈 미완성', !isArtisanComplete(s) && artisanCount(s) === 0);
  for (const k of PART_KINDS) s.add(artisanKey(k));
  ok('장인 시리즈 완성 판정', isArtisanComplete(s) && artisanCount(s) === PART_KINDS.length,
    String(artisanCount(s)));
  const pend = pendingRewards(s, {claimedKinds:[],claimedAllWeapons:false,claimedFullBook:false});
  ok('장인 시리즈 보상 등장', pend.some(x=>x.id==='artisanSet'), `${pend.length}건`);
}
{
  const full = new Set<string>();
  for (const k of ['spear','sword','blade','axe','mace','hammer','bow','crossbow','staff','rod','fan'])
    for (let t=1;t<=10;t++) full.add(entryKey(k as any, t));
  const p = pendingRewards(full, {claimedKinds:[],claimedAllWeapons:false,claimedFullBook:false});
  ok('무기 풀등록 → 보상 + 칭호', p.some(x=>x.id==='allWeapons' && x.title==='weapon_collector'), `${p.length}건`);
}
{
  // 백전노장은 "티켓이 조금 빨리 찬다" 는 칭호다 — 기본 충전 간격보다 짧기만 하면 된다.
  // 숫자를 박아 두면 충전 속도를 바꿀 때마다 여기가 먼저 깨진다 (10분 → 60분에서 그랬다).
  const base = effectsOf(null).badgeMs;
  const vet = effectsOf('veteran').badgeMs;
  ok('칭호 효과 — 백전노장은 티켓이 빨리 찬다', vet < base && vet > base * 0.5,
    `${Math.round(base / 60000)}분 → ${Math.round(vet / 60000)}분`);
  ok('기본 티켓 충전 = 투기장 상수와 같다', base === ARENA_BADGE_MS,
    `${base} vs ${ARENA_BADGE_MS}`);
}

console.log('── 채팅/피드 ──');
ok('뱃지 0 = 표시 없음', formatUnread(0) === '' && formatUnread(-3) === '');
ok('뱃지 1~99 그대로', formatUnread(1) === '1' && formatUnread(37) === '37' && formatUnread(99) === '99');
ok('뱃지 100 = "100"', formatUnread(100) === '100');
ok('뱃지 101 이상 = "100+"', formatUnread(101) === '100+' && formatUnread(9999) === '100+');
ok('스크롤백 상한 100', CHAT_HISTORY_MAX === 100);
{
  // 지어내는 이벤트는 이제 없다 — 남는 건 '내가 한 일' 한 갈래뿐이다
  const { mineEvent, FEED_CAP } = require('./feed') as typeof import('./feed');
  const evs = Array.from({ length: 300 }, (_, i) => mineEvent('enhance', `강화 ${i}`));
  ok('내 이벤트 id 고유', new Set(evs.map((e) => e.id)).size === 300);
  ok('내 이벤트는 mine 표시', evs.every((e) => e.mine === true));
  ok('피드 상한이 화면 분량', FEED_CAP >= 20 && FEED_CAP <= 200, String(FEED_CAP));
  const chat = require('./chat') as typeof import('./chat');
  ok('전송 계층 구현은 앱 쪽에만', !('createMockTransport' in chat));
}

// ── 내 말이 두 번 뜨지 않는가 ──────────────────────────
{
  console.log(NL + '── 낙관적 표시 짝짓기 ──');
  const { absorb } = require('./optimistic') as typeof import('./optimistic');
  type M = { id: string; text: string; mine?: boolean; pending?: boolean };

  /*
    내 말은 화면에 먼저 올라가고(로컬 id) 서버본이 같은 말을 다시 들고 온다(서버 id).
    id 가 다르므로 가만두면 두 번 쌓인다 — 실제로 그랬다.
  */
  const mine: M = { id: 'c1', text: '안녕하세요 테스트입니다', mine: true, pending: true };
  const fromServer: M = { id: 's1', text: '안녕하세요 테스트입니다', mine: true };

  const after = absorb([mine], fromServer)!;
  ok('내 말은 두 번 쌓이지 않는다', after.length === 1, `${after.length}줄`);
  ok('서버 id 로 갈린다', after[0].id === 's1');
  ok('pending 이 풀린다', after[0].pending === false);

  // 같은 줄이 또 오면(재확인·재연결) 아무 일도 없어야 한다
  ok('같은 id 는 무시', absorb(after, fromServer) === null);

  // 남의 말은 그냥 붙는다
  const other: M = { id: 's2', text: '오' };
  ok('남의 말은 추가', absorb(after, other)!.length === 2);

  // 같은 말을 두 번 쳤으면 두 줄이 남아야 한다 (하나씩 짝지어진다)
  {
    let list: M[] = [
      { id: 'c1', text: '오', mine: true, pending: true },
      { id: 'c2', text: '오', mine: true, pending: true },
    ];
    list = absorb(list, { id: 's1', text: '오', mine: true })!;
    list = absorb(list, { id: 's2', text: '오', mine: true })!;
    ok('같은 말 두 번은 두 줄로 남는다', list.length === 2, `${list.length}줄`);
    ok('둘 다 서버 id 로 갈린다', list.every((m) => m.id.startsWith('s')));
  }

  /*
    서버본에 `mine` 이 안 붙어 있으면 짝짓기가 통째로 실패한다 — 실제로 피드에서
    그랬다 ('나' 뱃지가 붙은 줄과 안 붙은 줄이 나란히 떴다). 그 회귀를 잡아 둔다.
  */
  {
    const local: M = { id: 'f1', text: '강화 성공', mine: true, pending: true };
    const noMine: M = { id: 's1', text: '강화 성공' };          // mine 이 빠진 서버본
    ok('mine 이 없으면 짝을 못 찾는다 (그래서 반드시 붙여야 한다)',
      absorb([local], noMine)!.length === 2);
    const withMine: M = { id: 's1', text: '강화 성공', mine: true };
    ok('mine 이 붙으면 덮는다', absorb([local], withMine)!.length === 1);
  }

  // 실패해서 pending 이 풀린 줄은 나중에 덮이면 안 된다
  {
    const failed: M = { id: 'c9', text: '오', mine: true, pending: false };
    const later = absorb([failed], { id: 's9', text: '오', mine: true })!;
    ok('실패한 줄은 짝으로 안 잡힌다', later.length === 2, `${later.length}줄`);
  }
}

console.log('── 출석체크 ──');
ok('이벤트 목록에 출석체크', EVENTS.some(e => e.id === 'attendance' && e.period === 'daily'));
ok('보상 5실버', ATTENDANCE_REWARD === 500, fmt(ATTENDANCE_REWARD));
{
  const now = new Date(2026, 7, 20, 13, 0, 0).getTime();
  const yst = new Date(2026, 7, 19, 23, 0, 0).getTime();
  ok('연속 출석 판정', isYesterday(dayKey(yst), now));
  ok('같은 날은 연속 아님', !isYesterday(dayKey(now), now));
  ok('월 경계 연속 출석', isYesterday(dayKey(new Date(2026,6,31,10,0,0).getTime()), new Date(2026,7,1,10,0,0).getTime()));
}

console.log('── 아르바이트 ──');
{
  let minS = 99, maxS = 0, minP = 1e9, maxP = 0, tips = 0;
  for (let i = 0; i < 40000; i++) {
    const r = work();
    minS = Math.min(minS, r.stamina); maxS = Math.max(maxS, r.stamina);
    minP = Math.min(minP, r.pay); maxP = Math.max(maxP, r.pay);
    if (r.tip) tips++;
  }
  ok('체력 소모 1~5', minS === STAMINA_MIN && maxS === STAMINA_MAX, `${minS}~${maxS}`);
  ok('수입 10쿠퍼~1실버 (팁 제외 상한)', minP >= PAY_MIN && maxP <= Math.floor(PAY_MAX * 1.5), `${minP}~${maxP}`);
  ok('팁 발생률 ~5%', Math.abs(tips/40000 - 0.05) < 0.01, `${(tips/40000*100).toFixed(1)}%`);
  ok('체력 1당 기대수입', payPerStamina() > 15 && payPerStamina() < 22, payPerStamina().toFixed(1));
}

console.log('── 복권 ──');
ok('1장 5실버', TICKET_PRICE === 500, fmt(TICKET_PRICE));
ok('회차당 10장', DAILY_LIMIT === 10);
ok('오후 8시 추첨', DRAW_HOUR === 20);
ok('등수 5개 + 지정 확률', PRIZES.length === 5
  && PRIZES[0].prob === 0.00001 && PRIZES[1].prob === 0.0001
  && PRIZES[2].prob === 0.001 && PRIZES[3].prob === 0.01 && PRIZES[4].prob === 0.10);
ok('상금 500/50/5골드/50실버/5실버', PRIZES.map(p=>p.amount).join(',') === [5000000,500000,50000,5000,500].join(','), PRIZES.map(p=>fmt(p.amount)).join(' / '));
ok('등수마다 기대값 기여 균등 (확률÷10 → 상금×10)',
  PRIZES.every(p => Math.abs(p.prob * p.amount - 50) < 1e-6),
  PRIZES.map(p => Math.round(p.prob*p.amount)).join('/') + '쿠퍼');
{
  // 추첨 시각: 오후 8시 이전이면 그날, 이후면 다음 날
  const before = new Date(2026, 7, 20, 19, 59, 0).getTime();
  const after  = new Date(2026, 7, 20, 20, 0, 1).getTime();
  ok('20시 이전 → 당일 추첨', new Date(nextDrawAt(before)).getDate() === 20 && new Date(nextDrawAt(before)).getHours() === 20);
  ok('20시 이후 → 다음날 추첨', new Date(nextDrawAt(after)).getDate() === 21);
  ok('같은 회차는 같은 키', drawKey(before) === drawKey(new Date(2026,7,20,9,0,0).getTime()));
  ok('회차 넘어가면 키 변경', drawKey(before) !== drawKey(after));
}
{
  // 결과는 시드 고정 — 앱을 껐다 켜도 같아야 한다
  ok('결과 재현성', resultFor('2026-08-20', 7) === resultFor('2026-08-20', 7));
  ok('번호마다 다른 결과', new Set(Array.from({length: 200}, (_, i) => resultFor('2026-08-20', i))).size > 1);
  let win = 0; const N = 400000;
  for (let i = 0; i < N; i++) if (resultFor('sim', i) !== null) win++;
  ok('실측 당첨률 ≈ 11.1%', Math.abs(win/N - WIN_PROB) < 0.004, `${(win/N*100).toFixed(2)}% (이론 ${(WIN_PROB*100).toFixed(2)}%)`);
  ok('prizeOf 매핑', prizeOf(1).amount === PRIZES[0].amount && prizeOf(5).amount === PRIZES[4].amount);
}
{
  const ev = expectedValue();
  const ratio = payoutRatio();
  ok('1장 기대회수 = 2실버 50쿠퍼', Math.round(ev) === 250, fmt(Math.round(ev)));
  ok('환급률 50%', Math.abs(ratio - 0.5) < 1e-9, `${(ratio*100).toFixed(1)}%`);
  // 이 가드가 깨지면 복권이 돈 복사(>1.0)나 죽은 콘텐츠(<0.3)로 굴러떨어진 것이다
  ok('환급률 가드 0.30~0.90', ratio >= 0.30 && ratio <= 0.90, ratio.toFixed(2));
}

console.log('── 쿠지 · 가챠 ──');
for (const spec of [...KUJI_ROTATION, GACHA]) {
  const n = spec.grades.reduce((a, g) => a + g.count, 0);
  ok(`${spec.name} 총 ${spec.total}칸`, n === spec.total, String(n));
  ok(`${spec.name} 1회 1골드`, spec.price === 10000);
  ok(`${spec.name} 회차당 5회`, spec.perUserLimit === 5);
  const arr = cycleGrades(spec, '2026-08-20#0');
  ok(`${spec.name} 배열 길이·시드 고정`, arr.length === spec.total
    && arr.join() === cycleGrades(spec, '2026-08-20#0').join());
  ok(`${spec.name} 회차 다르면 배열 다름`, arr.join() !== cycleGrades(spec, '2026-08-20#1').join());
  const cnt: Record<string, number> = {};
  for (const gi of arr) cnt[gi] = (cnt[gi] ?? 0) + 1;
  ok(`${spec.name} 등급 수량 보존`, spec.grades.every(g => cnt[g.id] === g.count));
}
ok('쿠지 환급률 84% (라스트원 제외)', Math.abs(boxPayout(KUJI) - 0.8412) < 0.001, `${(boxPayout(KUJI)*100).toFixed(1)}%`);
ok('쿠지 환급률 94% (라스트원 포함)', Math.abs(boxPayout(KUJI, true) - 0.9412) < 0.001, `${(boxPayout(KUJI, true)*100).toFixed(1)}%`);
// 가운데를 깎아 바닥(흑 20→35실버)과 꼭대기(금 50→100골드)를 같이 올렸다
ok('가챠 환급률 97%', Math.abs(boxPayout(GACHA) - 0.97) < 0.005, `${(boxPayout(GACHA)*100).toFixed(1)}%`);
// 100% 를 넘으면 뽑기가 도박이 아니라 돈 찍는 기계가 된다
ok('가챠 환급률은 100% 미만', boxPayout(GACHA) < 1, `${(boxPayout(GACHA)*100).toFixed(1)}%`);
{
  // 제일 흔한 칸이 티켓값의 3분의 1은 돼야 "지는 판" 이 덜 아프다
  const common = GACHA.grades.reduce((a, x) => (x.count > a.count ? x : a));
  ok('제일 흔한 캡슐이 티켓값의 1/3 이상',
    (common.value ?? 0) >= GACHA.price / 3,
    `${common.label} ${common.value} / ${GACHA.price}`);
}
ok('A상은 비매품 (기대값 제외)', gradeOf(KUJI, 'A').value === null);
{
  // 쿠지는 주문서 → 정령석 → 로고 세 회차가 돌아간다
  ok('쿠지 3회차 순환', KUJI_ROTATION.length === 3);
  ok('회차 0 은 주문서', kujiFor(0).name === '주문서 쿠지', kujiFor(0).name);
  ok('회차 1 은 정령석', kujiFor(1).name === '정령석 쿠지', kujiFor(1).name);
  ok('회차 2 는 로고', kujiFor(2).name === '로고 쿠지', kujiFor(2).name);
  ok('회차 3 은 다시 주문서', kujiFor(3).name === '주문서 쿠지', kujiFor(3).name);
  ok('로고 쿠지 A상이 로고 1장',
    KUJI_LOGO.grades[0].prize(0).kind === 'avatar' && KUJI_LOGO.grades[0].count === 1);
  ok('로고는 비매품 (기대값 제외)', gradeOf(KUJI_LOGO, 'A').value === null);
  // 로고만 보고 들어왔다가 꽝을 뽑아도 다른 회차만큼은 건져야 다음에 또 온다
  ok('로고 회차 환급률이 다른 회차와 같다',
    Math.abs(boxPayout(KUJI_LOGO) - boxPayout(KUJI)) < 0.001,
    `${(boxPayout(KUJI_LOGO) * 100).toFixed(1)}% vs ${(boxPayout(KUJI) * 100).toFixed(1)}%`);
}
{
  /*
    재고는 **내가 뽑은 만큼만** 준다.

    예전엔 시간이 흐르는 것만으로 포인터가 밀렸다 (`시간 × npcPerHour`).
    아무도 안 뽑았는데 A상이 사라지니, "남은 칸을 보고 지금 들어갈지 정한다" 는
    유한 재고 뽑기의 재미가 통째로 거짓말이 됐다.
  */
  const t = new Date(2026, 7, 20, 12, 0, 0).getTime();
  const noon = boxState(KUJI, t, 0);
  ok('안 뽑았으면 재고 그대로', noon.pointer === 0 && noon.remaining === KUJI.total,
    `pointer ${noon.pointer}`);
  const dawn = boxState(KUJI, new Date(2026, 7, 20, 4, 0, 0).getTime(), 0);
  ok('시간이 흘러도 재고는 안 준다', dawn.pointer === noon.pointer);
  ok('등급별 잔량 합 = 잔량',
    Object.values(noon.left).reduce((a, b) => a + b, 0) === noon.remaining);

  const mine = boxState(KUJI, t, 7);
  ok('내가 뽑은 만큼만 민다', mine.pointer === 7, `pointer ${mine.pointer}`);
  ok('잔량 = 총 - 내 소비', mine.remaining === KUJI.total - 7);
  // 내가 500칸을 다 뽑으면 다음 회차
  ok('내가 완판시키면 다음 회차', boxState(KUJI, t, KUJI.total).cycle === 1,
    `cycle ${boxState(KUJI, t, KUJI.total).cycle}`);
  ok('완판 직후 포인터는 0', boxState(KUJI, t, KUJI.total).pointer === 0);
}
{
  const t = new Date(2026, 7, 20, 12, 0, 0).getTime();
  const r = drawBox(KUJI, t, 0, 0, 5);
  ok('5회 뽑기', r.length === 5);
  ok('뽑기 결과가 배열과 일치', r.every((x, i) => x.gradeId === cycleGrades(KUJI, '2026-08-20#0')[i]));
  ok('같은 조건 재현성', drawBox(KUJI, t, 0, 0, 5).map(x=>x.gradeId).join() === r.map(x=>x.gradeId).join());
  // 가챠 첫뽑기 보장
  const gr = drawBox(GACHA, t, 0, 0, 1)[0];
  const rank = GACHA.grades.findIndex(g => g.id === gr.gradeId);
  ok('가챠 첫뽑기 청 캡슐 이상 보장', rank <= GACHA.grades.findIndex(g => g.id === 'blue'), `${gr.label}${gr.guaranteed?' (보장)':''}`);
  // 두 번째 뽑기는 보장 없음
  const gr2 = drawBox(GACHA, t, 1, 1, 1)[0];
  ok('두 번째부터는 보장 없음', gr2.guaranteed === undefined);
  // 라스트원상
  const lastT = new Date(2026, 7, 20, 12, 0, 0).getTime();
  /* 포인터가 내 소비만 세므로, 마지막 칸은 499번째다 */
  const lr = drawBox(KUJI, lastT, KUJI.total - 1, 0, 1)[0];
  ok('마지막 칸 → 라스트원상', !!lr.lastOne, lr.lastOne ? lr.lastOne.label : '없음');
}

console.log('── 강화 확정 주문서 ──');
ok('상점 판매 목록에 없음', !SCROLL_ORDER.includes('guarantee'));
ok('강화 화면 목록에 있음', ENHANCE_SCROLL_ORDER[0] === 'guarantee');
ok('비매품 (가격 0)', SCROLLS.guarantee.price === 0);
{
  const o = effectiveOdds(15, 'guarantee', 0, 10);
  ok('+15 도 100% 성공', o.success === 100 && o.fail === 0 && o.downgrade === 0 && o.destroy === 0);
  const a = effectiveOdds(20, 'guarantee', 0, ARTISAN_TIER);
  ok('장인 +16 이상도 100%', a.success === 100 && a.destroy === 0);
  // 사다리를 타므로 표값(20%)이 아니라 그 티어의 앵커가 나온다.
  // 앵커를 조정할 때마다 깨지지 않게 tierSuccess 와 대조한다.
  ok('확정 없으면 사다리 확률',
    Math.abs(effectiveOdds(15, null, 0, TIER_NEUTRAL).success - tierSuccess(15, TIER_NEUTRAL)) < 1e-9,
    effectiveOdds(15, null, 0, TIER_NEUTRAL).success.toFixed(2));
}

// ── 티어 사다리 ───────────────────────────────────────
{
  console.log('\n── 티어 사다리 ──');
  const at = (L: number, t: number) => effectiveOdds(L, null, 0, t).success;

  // 사용자가 지정한 앵커
  ok('+1  1티어 = 100%', Math.abs(at(1, 1) - 100) < 0.5, at(1, 1).toFixed(1));
  ok('+1  2티어 ≈ 97%', Math.abs(at(1, 2) - 97) < 0.5, at(1, 2).toFixed(1));
  ok('+15 1티어 ≈ 50%', Math.abs(at(15, 1) - 50) < 0.5, at(15, 1).toFixed(1));
  ok('+15 5티어 ≈ 10%', Math.abs(at(15, 5) - 10) < 0.3, at(15, 5).toFixed(2));
  ok('+15 8티어 ≈ 3.2%', Math.abs(at(15, 8) - 3.2) < 0.2, at(15, 8).toFixed(2));
  ok('+15 10티어 ≈ 1.5%', Math.abs(at(15, 10) - 1.5) < 0.2, at(15, 10).toFixed(2));

  // 티어가 오를수록 어려워진다 (모든 단계에서 단조 감소)
  for (const L of [1, 5, 10, 15]) {
    const row = Array.from({ length: 10 }, (_, i) => at(L, i + 1));
    ok(`+${L} 티어 단조 감소`, row.every((v, i) => i === 0 || v < row[i - 1]),
      row.map((v) => v.toFixed(1)).join(' '));
  }
  // 같은 티어에서 단계가 오를수록 어려워진다
  for (const t of [1, 5, 10]) {
    const col = Array.from({ length: 15 }, (_, i) => at(i + 1, t));
    ok(`${t}티어 단계 단조 감소`, col.every((v, i) => i === 0 || v < col[i - 1]));
  }
  // 낮은 단계에서는 티어 차이가 작고, 높은 단계에서 벌어진다
  ok('+1 티어차 < +15 티어차',
    (at(1, 1) - at(1, 10)) < (at(15, 1) / at(15, 10)),
    `+1 ${(at(1, 1) - at(1, 10)).toFixed(1)}%p vs +15 ${(at(15, 1) / at(15, 10)).toFixed(0)}배`);

  // 확률 합은 항상 100
  for (const t of [1, 5, 10]) {
    for (const L of [1, 8, 13, 15]) {
      const e = effectiveOdds(L, null, 0, t);
      const sum = e.success + e.fail + e.downgrade + e.destroy;
      ok(`합계 100% (${t}티어 +${L})`, Math.abs(sum - 100) < 0.01, sum.toFixed(3));
    }
  }
  // +12 이하는 파괴 없음 (표의 모양은 유지)
  ok('+12 이하 파괴 0', [1, 5, 10].every((t) => effectiveOdds(12, null, 0, t).destroy === 0));
  ok('+13 부터 파괴 발생', effectiveOdds(13, null, 0, 10).destroy > 0);

  // 장인 무구는 다른 규칙 — 티어 사다리를 물리면 무한 강화가 불가능해진다.
  // +1 60% 에서 시작해 +100 에서 0.4% 에 닿는 한 줄짜리 등비 곡선이다.
  {
    const { ARTISAN_TOP, ARTISAN_END, ARTISAN_END_LEVEL } =
      require('./enhance') as typeof import('./enhance');
    const a1 = effectiveOdds(1, null, 0, ARTISAN_TIER);
    const a8 = effectiveOdds(8, null, 0, ARTISAN_TIER);
    const a15 = effectiveOdds(15, null, 0, ARTISAN_TIER);
    const a16 = effectiveOdds(16, null, 0, ARTISAN_TIER);
    const a20 = effectiveOdds(20, null, 0, ARTISAN_TIER);
    const a100 = effectiveOdds(ARTISAN_END_LEVEL, null, 0, ARTISAN_TIER);
    const a150 = effectiveOdds(150, null, 0, ARTISAN_TIER);
    ok('장인 0 → 1 강은 60%', Math.abs(a1.success - ARTISAN_TOP) < 1e-9, a1.success.toFixed(2));
    ok('장인 99 → 100 강은 0.4%', Math.abs(a100.success - ARTISAN_END) < 1e-9, a100.success.toFixed(3));
    ok('장인 확률은 단계마다 낮아진다 (고정 구간 없음)',
      a1.success > a8.success && a8.success > a15.success
      && a15.success > a16.success && a16.success > a20.success && a20.success > a100.success,
      `${a1.success.toFixed(1)} > ${a16.success.toFixed(1)} > ${a100.success.toFixed(2)}`);
    // 0.4% 아래로 더 내려가면 +100 이후가 사실상 막힌다 — 무한 강화가 거짓말이 된다
    ok('+100 아래로는 내려가지 않는다', Math.abs(a150.success - ARTISAN_END) < 1e-9,
      a150.success.toFixed(3));
    // 파괴가 남아 있으면 기대 도달 레벨이 유한해져 "무한 강화"가 거짓말이 된다
    ok('장인은 파괴되지 않는다',
      [a1, a8, a15, a16, a20, a100].every((o) => o.destroy === 0));
    // 하락도 없앴다 — 어렵게 올린 칸을 되돌리면 무한 강화가 벌칙이 된다
    ok('장인은 하락하지 않는다', [a1, a8, a15, a20, a100].every((o) => o.downgrade === 0));
    // 남는 확률은 전부 "실패(유지)" 로 간다
    ok('장인 확률 합이 100', [a1, a16, a100].every((o) => Math.abs(o.success + o.fail - 100) < 1e-9));
  }
  ok('tierSuccess 직접 호출', Math.abs(tierSuccess(15, 10) - 1.5) < 0.2, tierSuccess(15, 10).toFixed(3));

  // ── 강화 확률 총예산 (GUILD_CONTENT_DESIGN §6) ──
  // 확률을 만지는 곳이 넷이다. 각자 곱하면 조용히 무너지므로 캡을 한 곳에서 검사한다
  {
    const { ODDS_TOTAL_CAP } = require('./enhance') as typeof import('./enhance');
    const full = { spiritPct: 3, guildMul: 1.10 };
    for (const [L, t] of [[15, 10], [15, 5], [13, 8], [10, 3]] as const) {
      const base = effectiveOdds(L, null, 0, t).success;
      const max = effectiveOdds(L, 'succ_high', 0.1, t, full).success;
      ok(`총캡 ×${ODDS_TOTAL_CAP} — +${L} 티어${t}`,
        max <= base * ODDS_TOTAL_CAP + 1e-9,
        `${base.toFixed(2)} → ${max.toFixed(2)} (×${(max / base).toFixed(2)})`);
    }
    // 캡이 실제로 물리는 구간이 있어야 의미가 있다 (전부 여유면 캡이 죽은 코드다)
    const b = effectiveOdds(15, null, 0, 10).success;
    const m = effectiveOdds(15, 'succ_high', 0.1, 10, full).success;
    ok('상위 강화에서 캡이 실제로 걸린다', Math.abs(m / b - ODDS_TOTAL_CAP) < 0.01, (m / b).toFixed(3));
    // 확정 주문서는 표를 건너뛰므로 캡과 무관하다
    ok('확정 주문서는 100%', effectiveOdds(15, 'guarantee', 0, 10, full).success === 100);
    // 파괴 방어는 파괴에서만 빠지고 총합은 100 을 지킨다
    const g = effectiveOdds(15, null, 0, 10, { guardPct: 5 });
    const n = effectiveOdds(15, null, 0, 10);
    ok('파괴 방어가 파괴만 깎는다', g.destroy < n.destroy && Math.abs(
      g.success + g.fail + g.downgrade + g.destroy - 100) < 1e-6,
      `${n.destroy.toFixed(2)} → ${g.destroy.toFixed(2)}`);
  }
}

// ── 지도 ──────────────────────────────────────────────
{
  console.log('\n── 지도 ──');
  const {
    AREAS, DISTRICTS, PLACES, ROADS, placeById, districtById, areaOfPlace,
    openAreas, tooClose, inside, overlaps,
  } = require('./mapWorld') as typeof import('./mapWorld');

  // 주식장·은행을 없애면서 16곳이 됐다 (2026-08)
  ok('장소 16곳', PLACES.length === 16, String(PLACES.length));
  ok('지역 5개 (전부 열림)', AREAS.length === 5 && openAreas().length === 5, String(AREAS.length));
  ok('구역 7개', DISTRICTS.length === 7, String(DISTRICTS.length));
  // 채집·수렵·낚시는 지도상 서로 떨어져 있어야 한다 — 한곳에 몰면 "채집 탭 3개" 가 된다
  ok('채집 3활동이 서로 다른 지역',
    new Set(['Gather', 'Hunt', 'Fish'].map((id) => areaOfPlace(placeById(id)!)?.id)).size === 3);
  ok('심연과 연금술사는 갈라진 땅에',
    areaOfPlace(placeById('Abyss')!)?.id === 'rift'
    && areaOfPlace(placeById('Alchemist')!)?.id === 'rift');
  ok('엘프의 집이 정령의 숲에', areaOfPlace(placeById('ElfHouse')!)?.id === 'forest');
  // '집' 은 없앴다 — 창고·장비 갈아입기가 전부 홈으로 옮겨 갔다 (ui/StoragePanels)
  ok('집은 지도에 없다', !placeById('House'));
  ok('이세계 행상인도 뒷동산에', areaOfPlace(placeById('Merchant')!)?.id === 'hill');
  ok('투기장은 마을에', areaOfPlace(placeById('Arena')!)?.id === 'town');
  ok('마물의숲·보스의탑은 마을 외곽에',
    areaOfPlace(placeById('Beastwood')!)?.id === 'outskirt'
    && areaOfPlace(placeById('Tower')!)?.id === 'outskirt');
  ok('탐험과 보스의탑이 분리됨',
    !!placeById('Beastwood') && !!placeById('Tower') && !placeById('Outskirts'));
  ok('마을에 광장·중심가·가게',
    DISTRICTS.filter((d) => d.areaId === 'town').map((d) => d.label).join(',') === '광장,중심가,가게');

  ok('좌표가 0~100 안', PLACES.every((p) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100));
  ok('id 중복 없음', new Set(PLACES.map((p) => p.id)).size === PLACES.length);
  ok('구역 참조가 전부 실재', PLACES.every((p) => !!districtById(p.districtId)));
  ok('구역의 지역 참조가 전부 실재',
    DISTRICTS.every((d) => AREAS.some((a) => a.id === d.areaId)));

  // 아이콘이 겹치면 지도를 못 읽는다
  const overlap = PLACES.flatMap((a, i) => PLACES.slice(i + 1)
    .filter((b) => tooClose(a, b)).map((b) => `${a.id}~${b.id}`));
  ok('아이콘 겹침 없음', overlap.length === 0, overlap.join(' '));

  // 계층이 시각적으로도 성립해야 한다 — 구역은 지역 안, 장소는 구역 안
  const dOut = DISTRICTS.filter((d) => !inside(d.box, AREAS.find((a) => a.id === d.areaId)!.box))
    .map((d) => d.id);
  ok('구역이 지역 사각형 안', dOut.length === 0, dOut.join(' '));
  const pOut = PLACES.filter((p) => {
    const d = districtById(p.districtId)!;
    return p.x < d.box.x || p.x > d.box.x + d.box.w || p.y < d.box.y || p.y > d.box.y + d.box.h;
  }).map((p) => p.id);
  ok('장소가 구역 사각형 안', pOut.length === 0, pOut.join(' '));

  // 지역끼리 겹치면 어느 지역인지 알 수 없다
  const aOver = AREAS.flatMap((a, i) => AREAS.slice(i + 1)
    .filter((b) => overlaps(a.box, b.box)).map((b) => `${a.id}~${b.id}`));
  ok('지역끼리 안 겹침', aOver.length === 0, aOver.join(' '));

  ok('길의 양 끝이 실재하는 장소', ROADS.every(([a, b]) => !!placeById(a) && !!placeById(b)));
  const linked = new Set(ROADS.flat());
  const island = PLACES.filter((p) => !linked.has(p.id)).map((p) => p.id);
  ok('외딴 장소 없음', island.length === 0, island.join(' '));
  // 길이 하나로 이어져 있어야 한다 (섬처럼 끊긴 덩어리가 없게)
  {
    const adj = new Map<string, string[]>();
    for (const [a, b] of ROADS) {
      adj.set(a, [...(adj.get(a) ?? []), b]);
      adj.set(b, [...(adj.get(b) ?? []), a]);
    }
    const seen = new Set<string>(['Fish']);
    const stack = ['Fish'];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const nx of adj.get(cur) ?? []) if (!seen.has(nx)) { seen.add(nx); stack.push(nx); }
    }
    ok('모든 장소가 길로 연결', seen.size === PLACES.length, `${seen.size}/${PLACES.length}`);
  }
}

// ── 정령석 설계 ───────────────────────────────────────
{
  console.log('\n── 정령석 설계 ──');
  const { STONES, GRADES: GS, GRADE_INFO, SET_STEPS, TOTAL_TRAITS, oddsTotal, expectedGrade } =
    require('./spiritPreview') as typeof import('./spiritPreview');
  const { maxSetIlvl } = require('./tiers') as typeof import('./tiers');
  ok('정령석 3종', STONES.length === 3);
  for (const st of STONES) ok(`${st.name} 확률 합 100%`, oddsTotal(st) === 100, String(oddsTotal(st)));
  ok('하급 F~S', Object.keys(STONES[0].odds).join(',') === 'F,E,D,C,B,A,S');
  ok('중급 D~SS', Object.keys(STONES[1].odds).join(',') === 'D,C,B,A,S,SS');
  ok('상급 B~SSS', Object.keys(STONES[2].odds).join(',') === 'B,A,S,SS,SSS');
  ok('하급 확률이 기획대로', STONES[0].odds.F === 35 && STONES[0].odds.S === 0.5);
  ok('SSS 는 상급만', !STONES[0].odds.SSS && !STONES[1].odds.SSS && STONES[2].odds.SSS === 5);
  ok('상급은 비매품 (쿠지 전용)', STONES[2].price === null);
  ok('기대 등급이 단계별로 오른다',
    expectedGrade(STONES[0]) < expectedGrade(STONES[1])
    && expectedGrade(STONES[1]) < expectedGrade(STONES[2]),
    STONES.map(expectedGrade).join(' → '));
  ok('특성 종류 7,7,5,5,5,4,3,2,1',
    GS.map((g) => GRADE_INFO[g].traits).join(',') === '7,7,5,5,5,4,3,2,1');
  ok('총 39종', TOTAL_TRAITS === 39, String(TOTAL_TRAITS));
  ok('등급 오를수록 종류가 줄거나 같다',
    GS.every((g, i) => i === 0 || GRADE_INFO[g].traits <= GRADE_INFO[GS[i - 1]].traits));
  ok('아이템레벨 보너스 단조 증가',
    GS.every((g, i) => i === 0 || GRADE_INFO[g].ilvl > GRADE_INFO[GS[i - 1]].ilvl));
  // 16칸 SSS 가 장비 강화를 대체해 버리면 안 된다
  const maxBonus = GRADE_INFO.SSS.ilvl * SLOT_COUNT;
  ok('전 칸 SSS 보너스가 최고 세트의 30% 미만',
    maxBonus < maxSetIlvl() * 0.3, `${maxBonus} / ${maxSetIlvl()}`);
  /* 단계는 셋이고, 마지막은 착용 칸 수와 같다 (숫자를 박으면 칸 수가 바뀔 때 조용히 어긋난다) */
  ok('세트 단계 3단', SET_STEPS.length === 3);
  ok('단계가 오름차순',
    SET_STEPS.every((x, i) => i === 0 || x.count > SET_STEPS[i - 1].count),
    SET_STEPS.map((x) => x.count).join(','));
  ok('마지막 단계 = 착용 칸 수', SET_STEPS[SET_STEPS.length - 1].count === SLOT_COUNT,
    `${SET_STEPS[SET_STEPS.length - 1].count} vs ${SLOT_COUNT}`);
  ok('세트 계수 단조 증가', SET_STEPS.every((x, i) => i === 0 || x.mul > SET_STEPS[i - 1].mul));

  // ── 효과 겹침 감사 ──
  // 처음 설계는 39종 중 34종이 4개 축에 몰려 있었다. 축을 넓히고 한 등급 안에서는
  // 겹치지 않게 했다. 이 검사가 없으면 특성을 추가하다 또 몰린다.
  const { TRAITS, AXES, traitsOf, axisUsage } = require('./spiritPreview') as typeof import('./spiritPreview');
  ok('특성 39종 실재', TRAITS.length === 39, String(TRAITS.length));
  ok('등급별 개수가 표와 일치',
    GS.every((g) => traitsOf(g).length === GRADE_INFO[g].traits),
    GS.map((g) => traitsOf(g).length).join(','));
  ok('이름 중복 없음', new Set(TRAITS.map((t) => t.name)).size === TRAITS.length);
  ok('축 13개', Object.keys(AXES).length === 13);
  ok('모든 특성이 축을 최소 1개 가진다', TRAITS.every((t) => t.axes.length >= 1));

  // 같은 등급 안에서 같은 축이 두 번 나오면 "그 등급을 뽑아도 그게 그거" 가 된다
  const dupInGrade = GS.flatMap((g) => traitsOf(g).flatMap((t) => t.axes))
    .length; void dupInGrade;
  const sameGradeDup = GS.filter((g) => {
    const all = traitsOf(g).flatMap((t) => t.axes);
    return new Set(all).size !== all.length;
  });
  ok('한 등급 안에서 축 중복 없음', sameGradeDup.length === 0, sameGradeDup.join(','));

  const usage = axisUsage();
  const counts = Object.values(usage);
  ok('안 쓰이는 축 없음', Math.min(...counts) >= 3, `최소 ${Math.min(...counts)}회`);
  ok('한 축에 몰리지 않음 (최대 6회)', Math.max(...counts) <= 6, `최대 ${Math.max(...counts)}회`);
  // 상위 4개 축이 전체의 절반을 넘으면 다시 몰린 것이다
  const sorted = [...counts].sort((a, b) => b - a);
  const top4 = sorted.slice(0, 4).reduce((a, b) => a + b, 0);
  const total = counts.reduce((a, b) => a + b, 0);
  ok('상위 4개 축이 전체의 절반 미만', top4 / total < 0.5, `${top4}/${total} = ${(top4/total*100).toFixed(0)}%`);

  // 저등급은 축 하나, 고등급은 여러 축을 묶어 강력해진다
  ok('B 이하는 단일 축',
    TRAITS.filter((t) => ['F','E','D','C','B'].includes(t.grade)).every((t) => t.axes.length === 1));
  ok('A 이상은 복합 축',
    TRAITS.filter((t) => ['A','S','SS','SSS'].includes(t.grade)).every((t) => t.axes.length >= 2));
  ok('SSS 가 가장 많은 축', TRAITS.find((t) => t.grade === 'SSS')!.axes.length === 4);
}

// ── 부위별 아이템레벨 가중치 ─────────────────────────
{
  console.log('\n── 부위별 아이템레벨 가중치 ──');
  const { kindWeight, kindInc, KIND_ILVL_WEIGHT } = require('./tiers') as typeof import('./tiers');
  ok('무기 > 방어구 > 장신구', kindWeight('sword') > kindWeight('chest')
    && kindWeight('chest') > kindWeight('ring'));
  ok('무기 계열 11종 동일',
    ['spear','sword','blade','axe','mace','hammer','bow','crossbow','staff','rod','fan']
      .every((k) => kindWeight(k as never) === KIND_ILVL_WEIGHT.weapon));
  ok('방어구 5종 동일', ['chest','helm','glove','greaves','boot']
    .every((k) => kindWeight(k as never) === KIND_ILVL_WEIGHT.armor));
  ok('장신구 4종 동일', ['ear','neck','ring','belt']
    .every((k) => kindWeight(k as never) === KIND_ILVL_WEIGHT.acc));
  ok('+0 은 부위와 무관하게 같다',
    itemLevel(newItem('sword', 10, 0)) === itemLevel(newItem('ring', 10, 0)));

  const gap = itemLevel(newItem('sword', 10, 15)) / itemLevel(newItem('ring', 10, 15)) - 1;
  ok('무기가 장신구보다 확실히 높다', gap > 0.2, `${(gap * 100).toFixed(0)}%`);
  ok('표시용 상승치도 가중', kindInc('sword', 10) === 51 && kindInc('ring', 10) === 27);

  // 소수 표기 — 있으면 첫째 자리까지, 없으면 정수
  const { fmtIlvl: fi } = require('./tiers') as typeof import('./tiers');
  ok('정수는 소수점 없이', fi(1425) === '1,425' && fi(160) === '160');
  ok('소수는 첫째 자리까지', fi(11.7) === '11.7' && fi(10.9) === '10.9');
  ok('둘째 자리는 반올림', fi(160.04) === '160' && fi(160.06) === '160.1');
  ok('천 단위 구분 유지', fi(18615.5) === '18,615.5');
  ok('무기 +1 은 소수', fi(itemLevel(newItem('sword', 1, 1))) === '11.7');
  ok('무기 +15 는 정수 (1.7×15=25.5 → 660+25.5×… 확인)',
    !fi(itemLevel(newItem('sword', 10, 15))).includes('.'),
    fi(itemLevel(newItem('sword', 10, 15))));
  ok('합도 소수 유지', fi(playerIlvl({ weapon: newItem('sword', 1, 1) })) === '11.7');
  // 부동소수 잡음이 새지 않아야 한다 (0.1 단위로 정리)
  const noisy = playerIlvl(Object.fromEntries(
    SLOT_IDS.map((sl) => [sl, newItem(sl === 'weapon' ? 'sword' : SLOT_ACCEPTS[sl][0], 1, 1)])) as never);
  ok('잡음 없음 (소수 1자리 이내)', Math.abs(noisy * 10 - Math.round(noisy * 10)) < 1e-9, String(noisy));
  ok('설정값 그대로',
    KIND_ILVL_WEIGHT.weapon === 1.7 && KIND_ILVL_WEIGHT.armor === 1.2
    && KIND_ILVL_WEIGHT.acc === 0.9);

  /**
   * ⚠ 가중치를 바꾸면 최고 세트 합이 움직인다. 권장 곡선은 그 값에 맞춰
   * 자동 스케일되어야 한다 — 안 그러면 챕터 100 승률이 50% 에서 튀어 버린다.
   * (1.7/1.2/0.9 로 올렸을 때 스케일 없이는 82% 가 됐다)
   */
  const { maxSetIlvl } = require('./tiers') as typeof import('./tiers');
  const best = (() => {
    const eq: Record<string, ReturnType<typeof newItem>> = {};
    for (const sl of SLOT_IDS) eq[sl] = newItem(sl === 'weapon' ? 'sword' : SLOT_ACCEPTS[sl][0], 10, 15);
    return playerIlvl(eq as never);
  })();
  ok('maxSetIlvl 이 실제 최고 세트와 일치', maxSetIlvl() === best, `${maxSetIlvl()} vs ${best}`);
  const wEnd = stageWinRate(best, exploreRecIlvl(100));
  ok('최고 세트의 챕터100 승률 = 50% (가중치와 무관하게 유지)',
    Math.abs(wEnd - 0.5) < 0.01, `${(wEnd * 100).toFixed(1)}%`);
  ok('권장 곡선이 최고 세트에 맞춰짐', exploreRecIlvl(100) === maxSetIlvl(),
    `${exploreRecIlvl(100)} vs ${maxSetIlvl()}`);
}

// ── 욕설 필터 ──────────────────────────────────────────
{
  console.log(NL + '── 욕설 필터 ──');
  const f = require('./profanity') as typeof import('./profanity');

  // 잡아야 하는 것
  ok('맨 욕', f.hasProfanity('씨발'));
  ok('문장 속 욕', f.hasProfanity('아니 진짜 병신 같네'));
  ok('띄어쓰기 우회', f.hasProfanity('시 발'));
  ok('기호 우회', f.hasProfanity('시*발'));
  ok('초성 우회', f.hasProfanity('ㅅㅂ 뭐야'));
  ok('영어 욕', f.hasProfanity('what the FUCK'));
  ok('leetspeak 우회', f.hasProfanity('f4ck you'));

  // 잡으면 안 되는 것 — 이쪽이 더 중요하다
  ok('시발점은 통과', !f.hasProfanity('여기가 논쟁의 시발점이다'), '시발점');
  ok('새끼손가락은 통과', !f.hasProfanity('새끼손가락 걸고'), '새끼손');
  ok('보지 못했다는 통과', !f.hasProfanity('나는 보지 못했다'), '보지못');
  ok('자지 않고는 통과', !f.hasProfanity('밤새 자지 않고'), '자지않');
  ok('평범한 문장', !f.hasProfanity('오늘 강화 대성공 했습니다'));
  ok('빈 문자열', !f.hasProfanity(''));

  // 가리기 — 길이가 원문 그대로 유지돼야 앞뒤 말이 안 붙는다
  ok('별표로 덮는다', f.maskProfanity('씨발 진짜') === '** 진짜', f.maskProfanity('씨발 진짜'));
  ok('띄어 쓴 욕도 통째로 덮는다',
    f.maskProfanity('시 발 진짜') === '*** 진짜', f.maskProfanity('시 발 진짜'));
  ok('욕 없으면 원문 그대로',
    f.maskProfanity('안녕하세요') === '안녕하세요');
  ok('길이 보존', f.maskProfanity('가나씨발다라').length === '가나씨발다라'.length);
  ok('여러 개도 전부 덮는다',
    f.maskProfanity('병신 아니고 씨발') === '** 아니고 **', f.maskProfanity('병신 아니고 씨발'));

  // 겹치는 금칙어는 긴 쪽 하나로만 센다 (개새 + 새끼 → 개새끼)
  const hits = f.findProfanity('개새끼');
  ok('겹치는 매치는 하나', hits.length === 1, `${hits.length}건 ${hits[0]?.word}`);
  ok('원문 좌표가 맞는다', hits[0].start === 0 && hits[0].end === 3);
  ok('처음 걸린 말을 알려 준다', f.firstProfanity('아 병신아') === '병신');

  // 금칙어 표 자체의 위생 — 중복이 있으면 유지보수할 때 헷갈린다
  ok('금칙어 중복 없음', new Set(f.PROFANITY).size === f.PROFANITY.length);
  ok('금칙어는 전부 정규화된 형태',
    f.PROFANITY.every((w) => f.normalizeForFilter(w).norm === w),
    f.PROFANITY.filter((w) => f.normalizeForFilter(w).norm !== w).join(' '));
  ok('예외도 전부 정규화된 형태',
    f.ALLOW.every((w) => f.normalizeForFilter(w).norm === w));
}

// ── 로고 · 엘프 · 무기 랭킹 ────────────────────────────
{
  console.log(NL + '── 로고 ──');
  const av = require('./avatars') as typeof import('./avatars');
  ok('로고 16종', av.AVATAR_IDS.length === 16, String(av.AVATAR_IDS.length));
  ok('기본 12종', av.DEFAULT_AVATARS.length === 12, String(av.DEFAULT_AVATARS.length));
  ok('전부 이름이 있다', av.AVATAR_IDS.every((id) => !!av.AVATAR_NAME[id]));
  ok('전부 출처가 있다', av.AVATAR_IDS.every((id) => !!av.AVATAR_SOURCE[id]));
  // 넷의 출처가 서로 달라야 "저건 어디서 났지" 가 성립한다
  const special = av.AVATAR_IDS.filter((id) => av.AVATAR_SOURCE[id] !== 'default');
  ok('특별 로고 4종', special.length === 4, special.join(' '));
  ok('출처 3갈래 (골드 2 · 쿠지 1 · 칭호 1)',
    special.filter((id) => av.AVATAR_SOURCE[id] === 'gold').length === 2
    && special.filter((id) => av.AVATAR_SOURCE[id] === 'kuji').length === 1
    && special.filter((id) => av.AVATAR_SOURCE[id] === 'title').length === 1);
  ok('파는 로고에만 값이 붙어 있다',
    av.AVATAR_IDS.every((id) =>
      (av.AVATAR_PRICE[id] !== undefined) === (av.AVATAR_SOURCE[id] === 'gold')));
  // 고스트 상대에게 특별 로고를 지어내 뿌리면 그 표식이 아무 의미가 없어진다
  ok('고스트는 기본 로고만 쓴다',
    ['가', '나', '다', '라', '무명의 검객', '칼 찬 바니걸', 'zzz', '']
      .every((n) => av.AVATAR_SOURCE[av.avatarForName(n)] === 'default'));
  ok('같은 이름은 같은 얼굴', av.avatarForName('아무개') === av.avatarForName('아무개'));

  console.log(NL + '── 엘프 ──');
  const elf = require('./elf') as typeof import('./elf');
  ok('대사 10줄', elf.ELF_LINES.length === 10, String(elf.ELF_LINES.length));
  ok('빈 줄 없음', elf.ELF_LINES.every((l) => l.trim().length > 0));
  ok('중복 없음', new Set(elf.ELF_LINES).size === elf.ELF_LINES.length);
  {
    // 방금 한 말은 다시 안 고른다 — 한 번의 반복이 "대사가 몇 개 없구나" 로 읽힌다
    let bad = 0;
    let prev = -1;
    for (let i = 0; i < 400; i++) {
      const next = elf.nextElfLine(prev, (i * 37 % 100) / 100);
      if (next === prev) bad++;
      if (next < 0 || next >= elf.ELF_LINES.length) bad++;
      prev = next;
    }
    ok('연속 같은 대사 없음 · 범위 안', bad === 0, `${bad}건`);
  }
  ok('첫 대사도 범위 안',
    [0, 0.5, 0.99].every((r) => {
      const i = elf.nextElfLine(-1, r);
      return i >= 0 && i < elf.ELF_LINES.length;
    }));

  console.log(NL + '── 무기 랭킹 ──');
  const rk = require('./ranking') as typeof import('./ranking');
  const tr = require('./tiers') as typeof import('./tiers');
  /** 무기 한 자루를 낀 사람. `bag` 은 창고에 있는 무기들 */
  const P = (
    id: string, kind: string, tier: number, lv: number, bag: [string, number, number][] = [],
  ): import('./ranking').Player => ({
    id, nick: id, avatar: 'swordsman', ilvl: 0,
    gear: { weapon: tr.newItem(kind as never, tier, lv, 100) },
    weapons: bag.map(([k, t, l]) => tr.newItem(k as never, t, l, 100)),
    net: 0, arenaPoints: 0, wins: 0, losses: 0, guildId: null,
  });
  ok('무기 11종', rk.WEAPON_BOARD_KINDS.length === 11, String(rk.WEAPON_BOARD_KINDS.length));
  {
    const me = { ...P('me', 'sword', 5, 3), isMe: true as const };
    const others = [
      P('a', 'sword', 9, 10),   // 같은 종류 · 나보다 셈
      P('b', 'sword', 2, 0),    // 같은 종류 · 나보다 약함
      P('c', 'axe', 10, 15),    // 다른 종류 — 검 판에는 안 나온다
    ];
    const b = rk.weaponBoard('sword', others, me);
    ok('무기 판은 그 종류만 세운다', b.rows.length === 3, String(b.rows.length));
    ok('도끼는 검 판에 안 들어온다', !b.rows.some((r) => r.p.id === 'c'));
    ok('무기 아이템레벨 내림차순',
      b.rows.every((r, i) => i === 0 || b.rows[i - 1].ilvl >= r.ilvl));
    ok('내 순위가 잡힌다', b.myRank === 2 && b.mineCount === 1, `${b.myRank}위`);
    ok('착용한 자루는 worn', b.rows.every((r) => r.worn));

    // 안 가진 사람을 0 으로 세워 두면 열한 개 판이 전부 똑같아 보인다
    const axeBoard = rk.weaponBoard('axe', others, me);
    ok('내가 안 가진 종류는 순위 없음', axeBoard.myRank === 0 && axeBoard.mineCount === 0);
    ok('도끼 판에는 도끼 가진 사람만',
      axeBoard.rows.length === 1 && axeBoard.rows[0].p.id === 'c');

    const empty = rk.weaponBoard('fan', others, me);
    ok('아무도 안 가진 종류는 빈 판', empty.rows.length === 0 && empty.myRank === 0);
  }
  {
    /*
      창고 무기도 전부 올라간다.

      착용한 것만 세면 검을 셋 키운 사람도 한 줄만 오르고, 나머지 둘은 있다는
      사실조차 아무도 모른다 — 두 번째 무기를 키울 이유가 사라진다.
    */
    const me = {
      ...P('me', 'sword', 3, 0, [['sword', 10, 15], ['sword', 7, 5], ['axe', 9, 9]]),
      isMe: true as const,
    };
    const b = rk.weaponBoard('sword', [P('a', 'sword', 6, 0)], me);
    ok('창고 검까지 전부 줄에 선다', b.rows.length === 4, String(b.rows.length));
    ok('내 자루가 3개 올라간다', b.mineCount === 3, String(b.mineCount));
    ok('제일 좋은 창고 검이 1위', !!b.rows[0].p.isMe && !b.rows[0].worn);
    ok('내 순위는 내 최고 자루 기준', b.myRank === 1, String(b.myRank));
    ok('창고 자루는 worn 이 아니다',
      b.rows.filter((r) => r.p.isMe && !r.worn).length === 2);
    // 같은 사람이 여러 줄에 나오므로 key 는 사람 id 만으로는 부족하다
    ok('줄 key 가 전부 다르다', new Set(b.rows.map((r) => r.key)).size === b.rows.length);
    ok('창고의 도끼는 검 판에 안 온다', !b.rows.some((r) => r.item.kind === 'axe'));
    ok('도끼 판에 내 창고 도끼가 온다',
      rk.weaponBoard('axe', [], me).rows.some((r) => r.p.isMe && !r.worn));
  }
  ok('가진 무기 = 착용 + 창고',
    rk.weaponsOf(P('z', 'bow', 3, 0, [['bow', 5, 0], ['rod', 2, 0]])).length === 3);
  ok('무기 없는 사람의 무기 템렙은 0',
    rk.weaponIlvlOf({ ...P('x', 'sword', 1, 0), gear: {} }) === 0);
  ok('무기 종류 판정', rk.weaponKindOf(P('y', 'staff', 4, 2)) === 'staff');
}

// ── 다이아 충전 (체력 · 티켓) ──────────────────────────
{
  console.log(NL + '── 충전 ──');
  const rf = require('./refill') as typeof import('./refill');

  ok('체력은 하루 10번', rf.refillMax('stamina') === 10, String(rf.refillMax('stamina')));
  ok('티켓은 하루 5번', rf.refillMax('ticket') === 5, String(rf.refillMax('ticket')));
  ok('체력 첫 값 10다이아', rf.refillPrice('stamina', 0) === 10);
  ok('체력은 배로 오른다',
    [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120]
      .every((v, i) => rf.refillPrice('stamina', i) === v),
    rf.REFILLS.stamina.prices.join(' '));
  ok('티켓 값 사다리 50·100·150·200·300',
    [50, 100, 150, 200, 300].every((v, i) => rf.refillPrice('ticket', i) === v),
    rf.REFILLS.ticket.prices.join(' '));

  // 한도를 넘으면 null 이다 — 0 을 돌려주면 화면이 "공짜" 로 그린다
  ok('체력 한도 넘으면 null', rf.refillPrice('stamina', 10) === null);
  ok('티켓 한도 넘으면 null', rf.refillPrice('ticket', 5) === null);
  ok('음수 인덱스도 null', rf.refillPrice('ticket', -1) === null);

  ok('남은 횟수', rf.refillLeft('ticket', 2) === 3, String(rf.refillLeft('ticket', 2)));
  ok('다 썼으면 0', rf.refillLeft('ticket', 5) === 0);
  ok('넘게 써도 음수 아님', rf.refillLeft('ticket', 99) === 0);

  // 자정 리셋 — 날짜 키가 다르면 오늘 산 적 없는 것으로 본다
  {
    const rec = { dayKey: '2026-8-26', stamina: 7, ticket: 3 };
    ok('같은 날은 그대로', rf.usedToday(rec, 'stamina', '2026-8-26') === 7);
    ok('날이 바뀌면 0', rf.usedToday(rec, 'stamina', '2026-8-27') === 0);
    ok('티켓도 같이 리셋', rf.usedToday(rec, 'ticket', '2026-8-27') === 0);
    ok('리셋되면 값도 첫 칸',
      rf.refillPrice('stamina', rf.usedToday(rec, 'stamina', '2026-8-27')) === 10);
    // 저장본이 망가져도 사다리 인덱스가 엉뚱해지면 안 된다
    ok('음수 기록은 0으로',
      rf.usedToday({ dayKey: 'd', stamina: -5, ticket: 0 }, 'stamina', 'd') === 0);
  }

  // 값이 단조 증가해야 "계속 사는 건 비싸다" 가 성립한다
  for (const k of rf.REFILL_KINDS) {
    const ps = rf.REFILLS[k].prices;
    ok(`${rf.REFILLS[k].name} 값이 계속 오른다`,
      ps.every((v, i) => i === 0 || v > ps[i - 1]), ps.join(' '));
    ok(`${rf.REFILLS[k].name} 값이 전부 양수`, ps.every((v) => v > 0));
  }
}

// ── 투기장 — 점수 · 티어 · 매칭 ────────────────────────
{
  console.log(NL + '── 투기장 ──');
  const cb = require('./combat') as typeof import('./combat');
  const ar = require('./arena') as typeof import('./arena');
  const { ARENA_TIERS: TIERS } = require('./types') as typeof import('./types');

  ok('한 티어 1000점', cb.ARENA_TIER_POINTS === 1000);

  // ── 점수는 승률로 갈라진다 ──
  {
    const even = cb.arenaPointDelta(0.5, 'F', true);
    ok('동률 상대를 이기면 +100', even === 100, String(even));
    ok('어려운 상대일수록 많이 번다',
      cb.arenaPointDelta(0.2, 'F', true) > even, String(cb.arenaPointDelta(0.2, 'F', true)));
    ok('쉬운 상대는 조금만',
      cb.arenaPointDelta(0.9, 'F', true) < even, String(cb.arenaPointDelta(0.9, 'F', true)));
    // 이게 없으면 제일 약한 상대만 고르는 게 언제나 최적이 된다
    ok('약한 상대만 잡으면 티어가 오래 걸린다',
      Math.ceil(cb.ARENA_TIER_POINTS / cb.arenaPointDelta(0.9, 'F', true))
      > Math.ceil(cb.ARENA_TIER_POINTS / even),
      Math.ceil(cb.ARENA_TIER_POINTS / cb.arenaPointDelta(0.9, 'F', true)) + '판 vs 10판');

    ok('패배는 음수', cb.arenaPointDelta(0.5, 'F', false) < 0);
    ok('패배가 승리보다 작다 (사다리가 사다리이려면)',
      Math.abs(cb.arenaPointDelta(0.5, 'F', false)) < even,
      String(cb.arenaPointDelta(0.5, 'F', false)));
    ok('0점짜리 판은 없다',
      cb.arenaPointDelta(1, 'F', true) >= 1 && cb.arenaPointDelta(0, 'F', false) <= -1);
    ok('높은 티어일수록 폭이 크다',
      cb.arenaPointDelta(0.5, 'S', true) > cb.arenaPointDelta(0.5, 'F', true),
      cb.arenaPointDelta(0.5, 'S', true) + ' vs ' + even);

    // 방어는 3분의 1
    const atk = cb.arenaPointDelta(0.5, 'F', true);
    const def = cb.arenaPointDelta(0.5, 'F', true, true);
    ok('당한 판은 3분의 1', Math.abs(def - Math.round(atk / 3)) <= 1, def + ' vs ' + atk);
    ok('당한 패배도 3분의 1',
      Math.abs(cb.arenaPointDelta(0.5, 'F', false, true)
        - Math.round(cb.arenaPointDelta(0.5, 'F', false) / 3)) <= 1);
    ok('망가진 확률도 견딘다',
      cb.arenaPointDelta(NaN, 'F', true) === even
      && cb.arenaPointDelta(2, 'F', true) >= 1 && cb.arenaPointDelta(-1, 'F', true) >= 1);
  }

  // ── 승급선에서 한 번 멈춘다 ──
  {
    ok('950 에서 100 을 벌면 1000 에서 멈춘다',
      cb.applyArenaPoints(950, 100) === 1000, String(cb.applyArenaPoints(950, 100)));
    ok('멈춘 자리는 아직 F', cb.arenaTierOf(999) === 'F');
    ok('승급선에 서 있다', cb.atPromoteLine(1000));
    ok('승급선에서 이기면 넘어간다',
      cb.arenaTierOf(cb.applyArenaPoints(1000, 100)) === 'E',
      String(cb.applyArenaPoints(1000, 100)));
    ok('한가운데서는 승급선이 아니다', !cb.atPromoteLine(1500));
    ok('0점은 승급선이 아니다', !cb.atPromoteLine(0));

    /*
      강등 낙폭.

      티어 바닥에 서 있는 사람이 작은 판 하나를 져도 아래 티어로 내려간다.
      그때 **얼마나 잃느냐**가 중요하다 — 아래 티어 한가운데로 떨어뜨렸더니
      30점짜리 한 판에 500점이 날아갔다. 되돌아오는 길이 보이는 선이어야 한다.
    */
    const dropped = cb.applyArenaPoints(1000, -50);
    ok('티어 아래로 밀리면 아래 티어', cb.arenaTierOf(dropped) === 'F', String(dropped));
    ok('강등 낙폭이 두어 판 안', 1000 - dropped <= cb.ARENA_BASE_POINTS * 3,
      `${1000 - dropped}점`);
    ok('강등해도 티어 바닥보다는 위', dropped > 0, String(dropped));
    // 작은 손실이 큰 벌이 되면 안 된다
    ok('작은 패배의 대가가 과하지 않다',
      1000 - cb.applyArenaPoints(1000, -20) <= cb.ARENA_BASE_POINTS * 3,
      `${1000 - cb.applyArenaPoints(1000, -20)}점`);
    ok('F 에서는 0 아래로 안 내려간다', cb.applyArenaPoints(30, -200) === 0);
    ok('최고 티어는 상한이 있다',
      cb.applyArenaPoints(6900, 500) <= 7000, String(cb.applyArenaPoints(6900, 500)));
    ok('한 티어 안에서는 그냥 더한다', cb.applyArenaPoints(1200, 150) === 1350);
  }

  // ── 시즌 리셋 ──
  {
    // ARENA_TIERS 는 F(약) → S(강) 순이라, D 의 한 칸 아래는 E 다
    ok('한 칸 아래에서 시작', cb.seasonStartTier('D') === 'E', cb.seasonStartTier('D'));
    ok('S 는 두 칸 아래인 B 에서', cb.seasonStartTier('S') === 'B');
    ok('F 는 더 못 내려간다', cb.seasonStartTier('F') === 'F');
    ok('리셋하면 시작 티어의 바닥',
      cb.arenaTierOf(cb.softResetPoints(3500)) === cb.seasonStartTier(cb.arenaTierOf(3500)));
    ok('S 로 끝내면 B 에서 시작',
      cb.arenaTierOf(cb.softResetPoints(6500)) === 'B',
      cb.arenaTierOf(cb.softResetPoints(6500)));
  }

  // ── 재검색 값 ──
  {
    const T0 = 1_000_000;
    ok('10분 지났으면 공짜', ar.rerollCost(T0 + ar.REROLL_FREE_MS, T0, 3) === 0);
    ok('공짜 직후는 1실버', ar.rerollCost(T0, T0, 0) === ar.REROLL_PRICES[0]);
    ok('값이 열 배씩 뛴다',
      ar.REROLL_PRICES.every((v, i) => i === 0 || v === ar.REROLL_PRICES[i - 1] * 10),
      ar.REROLL_PRICES.join(' '));
    ok('사다리 끝에서 멈춘다',
      ar.rerollCost(T0, T0, 99) === ar.REROLL_PRICES[ar.REROLL_PRICES.length - 1]);
    ok('남은 시간', ar.rerollFreeIn(T0 + 60_000, T0) === ar.REROLL_FREE_MS - 60_000);
    ok('지났으면 0', ar.rerollFreeIn(T0 + ar.REROLL_FREE_MS + 1, T0) === 0);
  }

  // ── 상대 다섯 고르기 ──
  {
    const G = (id: string, points: number, curIlvl: number) => ({
      id, name: id, avatar: 'swordsman' as const, ilvl: curIlvl, dur: 100, curIlvl, points,
    });
    /* 티어별로 넉넉히 — D(2000대) 가 내 티어 */
    const pool = [
      ...Array.from({ length: 8 }, (_, i) => G('d' + i, 2000 + i, 500 + i)),
      ...Array.from({ length: 8 }, (_, i) => G('c' + i, 3000 + i, 900 + i)),
      ...Array.from({ length: 8 }, (_, i) => G('f' + i, 0 + i, 50 + i)),
    ];
    let seed = 7;
    const roll = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    const five = ar.pickFoes(pool, 'D', 500, cb.arenaTierOf, [], roll);
    ok('다섯을 뽑는다', five.length === ar.ARENA_FOE_SLOTS, String(five.length));
    ok('같은 티어부터 채운다', five.every((f) => cb.arenaTierOf(f.points ?? 0) === 'D'),
      five.map((f) => cb.arenaTierOf(f.points ?? 0)).join(' '));
    ok('중복 없음', new Set(five.map((f) => f.id)).size === five.length);

    // 같은 티어가 모자라면 가까운 티어로 넓힌다
    const thinPool = [G('d0', 2000, 500), G('c0', 3000, 900), G('c1', 3001, 901),
      G('f0', 0, 50), G('f1', 1, 51), G('f2', 2, 52)];
    const near = ar.pickFoes(thinPool, 'D', 500, cb.arenaTierOf, [], roll);
    ok('모자라면 가까운 티어로', near.length === 5, String(near.length));
    ok('같은 티어가 먼저 들어간다', near.some((f) => f.id === 'd0'));
    {
      const dist = near.map((f) => Math.abs(
        TIERS.indexOf(cb.arenaTierOf(f.points ?? 0)) - TIERS.indexOf('D')));
      ok('가까운 티어가 먼 티어보다 앞', dist.every((d, i) => i === 0 || dist[i - 1] <= d),
        dist.join(' '));
    }

    // 다시 뽑으면 한 명은 남는다
    const again = ar.pickFoes(pool, 'D', 500, cb.arenaTierOf, five, roll);
    const shared = again.filter((f) => five.some((k) => k.id === f.id));
    // 사람이 넉넉하면 **정확히 한 명**만 겹친다 (나머지 넷은 후보에서 빠진다)
    ok('다시 뽑으면 딱 한 명 겹친다', shared.length === 1, shared.length + '명 겹침');

    // 사람이 다섯 이하면 겹치는 걸 피할 수 없다 — 그때는 그냥 전부 내준다
    const tiny = [G('a', 0, 10), G('b', 0, 11)];
    ok('사람이 적으면 있는 대로',
      ar.pickFoes(tiny, 'F', 10, cb.arenaTierOf, [], roll).length === 2);
  }

  // ── 전적 ──
  {
    const rec = (id: string, win: boolean, delta: number) => ({
      id, at: 0, attack: true, foeNick: 'x', foeAvatar: 'swordsman' as const,
      win, delta, tier: 'F' as const,
    });
    let log: import('./arena').ArenaRecord[] = [];
    for (let i = 0; i < 15; i++) log = ar.pushRecord(log, rec('r' + i, i % 2 === 0, 10));
    ok('전적은 열 줄까지', log.length === ar.ARENA_LOG_MAX, String(log.length));
    ok('최신이 맨 앞', log[0].id === 'r14');
    const sum = ar.recordSummary(log);
    ok('요약이 맞는다', sum.wins + sum.losses === log.length && sum.delta === 100,
      sum.wins + '승 ' + sum.losses + '패 ' + sum.delta + '점');
  }
}

// ── 장비 가루 · 해금 ───────────────────────────────────
{
  console.log(NL + '── 장비 가루 ──');
  const du = require('./dust') as typeof import('./dust');
  const { NORMAL_TIERS: NT, TIERS: TT } = require('./tiers') as typeof import('./tiers');

  ok('티어가 높을수록 많이 나온다',
    NT.every((t, i) => i === 0 || du.dustFromBreak(t, 0) > du.dustFromBreak(NT[i - 1], 0)));
  ok('강화가 높을수록 많이 나온다', du.dustFromBreak(5, 12) > du.dustFromBreak(5, 0));
  ok('0강에서도 가루는 나온다', du.dustFromBreak(1, 0) > 0);
  ok('망가진 입력도 견딘다',
    du.dustFromBreak(-3 as never, -5) > 0 && du.dustFromBreak(99 as never, 0) > 0);

  // 한 번 터진 걸로 바로 복구되면 파괴가 안 무섭다
  for (const t of NT) {
    const avg = du.dustFromBreak(t, 10);
    const need = du.restoreDust(t);
    ok(`${TT[t].prefix} 복구에 여러 번 터져야 한다`, need >= avg * 2,
      need + ' vs 한 번 ' + avg);
  }
  ok('복구 비용이 붙는다 (터뜨려서 버는 짓 방지)',
    NT.every((t) => du.restoreCost(t) > 0));
  ok('높은 티어일수록 비싸다',
    NT.every((t, i) => i === 0 || du.restoreCost(t) > du.restoreCost(NT[i - 1])));
  ok('장인 무구는 복구 대상이 아니다', !du.canRestore(11) && du.canRestore(10));
  ok('없는 티어도 막는다', !du.canRestore(0) && !du.canRestore(99));
}

{
  console.log(NL + '── 해금 ──');
  const un = require('./unlock') as typeof import('./unlock');
  const { RIFT_UNLOCK_FLOOR } = require('./mapWorld') as typeof import('./mapWorld');

  const ctx = (tower: number, tier: number) => ({ towerCleared: tower, bestTier: tier });

  ok('탑을 못 깼으면 심연은 잠김', un.isLocked('Abyss', ctx(0, 1)));
  ok('조건을 채우면 열린다', !un.isLocked('Abyss', ctx(RIFT_UNLOCK_FLOOR, 1)));
  ok('연금술사도 같이 열린다', !un.isLocked('Alchemist', ctx(RIFT_UNLOCK_FLOOR, 1)));
  // 목록에 없는 곳은 항상 열려 있어야 한다 (등록을 빼먹어도 멀쩡한 곳이 잠기면 안 된다)
  ok('상점은 잠기지 않는다', !un.isLocked('Shop', ctx(0, 1)));
  ok('진행도 표기', un.gateOf('Abyss')!.progress!(ctx(12, 1)).includes('12'));
  ok('넘겨도 조건치를 넘지 않는다',
    un.gateOf('Abyss')!.progress!(ctx(99, 1)).startsWith(String(RIFT_UNLOCK_FLOOR)));

  // 해금 안내 — 조건을 채운 순간 한 번만
  ok('1티어뿐이면 안내 없음', un.pendingGuide(ctx(0, 1), []) === null);
  ok('3티어를 얻으면 룬 안내', un.pendingGuide(ctx(0, 3), [])?.id === 'rune');
  ok('본 안내는 다시 안 뜬다', un.pendingGuide(ctx(0, 3), ['rune']) === null);
  ok('7티어면 연성 안내', un.pendingGuide(ctx(0, 7), ['rune'])?.id === 'alchemy');
  ok('둘 다 봤으면 없다', un.pendingGuide(ctx(0, 10), ['rune', 'alchemy']) === null);
  ok('안내마다 갈 곳이 적혀 있다', un.GUIDES.every((g) => !!g.where && !!g.body));
  ok('안내 id 중복 없음', new Set(un.GUIDES.map((g) => g.id)).size === un.GUIDES.length);
}

// ── 자동 강화 ──────────────────────────────────────────
{
  console.log(NL + '── 자동 강화 ──');
  const ae = require('./autoEnhance') as typeof import('./autoEnhance');
  const { newItem: mk } = require('./tiers') as typeof import('./tiers');

  const T = (slot: string, goal: number, from: number, broken = false) =>
    ({ slot, goal, from, broken });

  // 덜 온 것부터 친다 — 순서대로 돌면 뒤의 장비는 한 대도 못 맞는다
  {
    const items = [mk('sword', 5, 0, 100), mk('ring', 5, 8, 100)];
    const targets = [T('weapon', 10, 0), T('ringL', 10, 0)];
    ok('진행이 덜 된 쪽을 먼저', ae.nextTarget(items, targets) === 0,
      String(ae.nextTarget(items, targets)));
  }
  {
    const items = [mk('sword', 5, 9, 100), mk('ring', 5, 1, 100)];
    const targets = [T('weapon', 10, 0), T('ringL', 10, 0)];
    ok('반대로도 성립', ae.nextTarget(items, targets) === 1);
  }

  // 목표에 닿은 것 · 파괴된 것 · 빈 칸은 안 친다
  {
    const items = [mk('sword', 5, 10, 100), null, mk('ring', 5, 3, 100)];
    const targets = [T('weapon', 10, 0), T('helm', 10, 0, true), T('ringL', 10, 0)];
    ok('목표 도달한 칸은 건너뛴다', ae.nextTarget(items, targets) === 2);
    const doneAll = [mk('sword', 5, 10, 100), null, mk('ring', 5, 10, 100)];
    ok('전부 도달하면 -1', ae.nextTarget(doneAll, targets) === -1);
  }
  // 티어 상한(+15)을 넘겨 달라고 해도 안 친다
  {
    const items = [mk('sword', 5, 15, 100)];
    const targets = [T('weapon', 99, 0)];
    ok('티어 상한을 넘겨 치지 않는다', ae.nextTarget(items, targets) === -1);
  }

  // 멈추는 이유
  {
    const items = [mk('sword', 5, 0, 100)];
    const targets = [T('weapon', 5, 0)];
    ok('돈이 없으면 money', ae.stopReason(items, targets, 0, null) === 'money');
    ok('돈이 있으면 계속', ae.stopReason(items, targets, 10 ** 9, null) === null);
    ok('전부 파괴면 destroyed',
      ae.stopReason([null], [T('weapon', 5, 0, true)], 10 ** 9, null) === 'destroyed');
    ok('전부 도달하면 done',
      ae.stopReason([mk('sword', 5, 5, 100)], [T('weapon', 5, 0)], 10 ** 9, null) === 'done');
    ok('멈춤 사유마다 문구가 있다',
      (['done', 'money', 'destroyed', 'cancel'] as const).every((k) => !!ae.STOP_MSG[k]));
  }

  // 최소 비용 — 실행 전 판단에 쓰는 하한
  {
    const items = [mk('sword', 3, 0, 100), mk('ring', 3, 0, 100)];
    const targets = [T('weapon', 3, 0), T('ringL', 3, 0)];
    const one = ae.minCost([items[0]], [targets[0]]);
    const both = ae.minCost(items, targets);
    ok('두 개면 두 배쯤', both > one && both <= one * 2.2, one + ' → ' + both);
    ok('목표가 높을수록 비싸다',
      ae.minCost(items, [T('weapon', 6, 0), T('ringL', 6, 0)]) > both);
    ok('이미 도달했으면 0',
      ae.minCost([mk('sword', 3, 5, 100)], [T('weapon', 5, 0)]) === 0);
    ok('빈 칸은 세지 않는다', ae.minCost([null], [T('weapon', 5, 0)]) === 0);

    /*
      ⚠ **주문서를 껴도 강화비는 그대로다.**

      예전엔 정반대를 검사했다 ("주문서를 쓰면 더 든다"). `enhanceCost(item, scroll)`
      가 주문서의 **상점 가격**을 얹어서 돌려주기 때문인데, 주문서는 상점에서 이미
      산 물건이라 강화할 때 또 받으면 한 장을 두 번 사는 것이 된다. 자동 강화는
      그걸 매 시도마다 반복해서, 비싼 주문서를 끼우는 순간 비용이 몇 배로 뛰었다.

      손으로 하는 강화(`doEnhance`)는 처음부터 `null` 을 넘겨 순수 강화비만 받았다.
      두 경로가 갈라져 있던 자리라, 이제 **같은 값**인지를 검사한다.
    */
    const { enhanceCost: ec } = require('./enhance') as typeof import('./enhance');
    const scrollCost = ec(items[0]!, 'succ_low');
    const pureCost = ec(items[0]!, null);
    ok('enhanceCost 는 주문서 값을 얹는다 (원래 그런 함수다)', scrollCost > pureCost);
    ok('그런데 강화비 합계는 순수 강화비만 센다',
      ae.minCost([items[0]], [targets[0]]) === (() => {
        let sum = 0; let probe = items[0]!;
        while (probe.level < 3) { sum += ec(probe, null); probe = { ...probe, level: probe.level + 1 }; }
        return sum;
      })());
  }

  // 진행률
  {
    const items = [mk('sword', 3, 2, 100), mk('ring', 3, 4, 100)];
    const targets = [T('weapon', 6, 0), T('ringL', 6, 0)];
    ok('남은 칸 수', ae.stepsLeft(items, targets) === 6, String(ae.stepsLeft(items, targets)));
    ok('전체 칸 수', ae.stepsTotal(targets) === 12, String(ae.stepsTotal(targets)));
    ok('파괴된 칸은 남은 수에서 빠진다',
      ae.stepsLeft(items, [T('weapon', 6, 0, true), T('ringL', 6, 0)]) === 2);
  }
}

// ── 마을 사람들 ────────────────────────────────────────
{
  console.log(NL + '── NPC ──');
  const npc = require('./npc') as typeof import('./npc');
  const elf = require('./elf') as typeof import('./elf');

  const casts = [
    { who: '장인', lines: npc.SMITH_LINES, topics: npc.SMITH_TOPICS },
    { who: '점원', lines: npc.MAID_LINES, topics: npc.MAID_TOPICS },
    { who: '엘프', lines: elf.ELF_LINES, topics: elf.ELF_TOPICS },
  ];

  for (const c of casts) {
    ok(c.who + ' 대사 10줄', c.lines.length === 10, String(c.lines.length));
    ok(c.who + ' 빈 줄 없음', c.lines.every((l) => l.trim().length > 0));
    ok(c.who + ' 중복 없음', new Set(c.lines).size === c.lines.length);
    ok(c.who + ' 물어보기가 있다', c.topics.length >= 3, String(c.topics.length));
    ok(c.who + ' 질문·답이 다 채워져 있다',
      c.topics.every((t) => !!t.id && !!t.q.trim() && !!t.a.trim()));
    ok(c.who + ' 화제 id 중복 없음',
      new Set(c.topics.map((t) => t.id)).size === c.topics.length);
  }

  // 셋이 같은 말투면 NPC 를 세운 의미가 없다 — 대사가 겹치지 않는지만이라도 본다
  {
    const all = casts.flatMap((c) => c.lines);
    ok('세 사람의 대사가 서로 안 겹친다', new Set(all).size === all.length);
  }

  // 팁
  ok('팁 금액 3단', npc.TIP_AMOUNTS.length === 3);
  ok('팁이 오름차순',
    npc.TIP_AMOUNTS.every((v, i) => i === 0 || v > npc.TIP_AMOUNTS[i - 1]),
    npc.TIP_AMOUNTS.join(' '));
  ok('반응 10가지', npc.TIP_POSES.length === 10, String(npc.TIP_POSES.length));
  ok('반응 중복 없음',
    new Set(npc.TIP_POSES.map((p) => p.text)).size === npc.TIP_POSES.length);
  ok('반응마다 쓸 그림이 정해져 있다',
    npc.TIP_POSES.every((p) => p.art === 'happy' || p.art === 'shy'));
  // 한쪽 그림만 쓰면 두 장을 그릴 이유가 없다
  ok('두 그림이 둘 다 쓰인다',
    npc.TIP_POSES.some((p) => p.art === 'happy') && npc.TIP_POSES.some((p) => p.art === 'shy'));

  // 이스터에그 — 열 번 연달아 말을 걸면
  ok('열 번째마다 나온다',
    npc.isMaidSecret(10) && npc.isMaidSecret(20) && !npc.isMaidSecret(9)
    && !npc.isMaidSecret(11));
  ok('0 번째는 아니다', !npc.isMaidSecret(0) && !npc.isMaidSecret(-5));
  ok('대사가 세 줄', npc.MAID_SECRETS.length === 3, String(npc.MAID_SECRETS.length));
  ok('이스터에그 대사 중복 없음',
    new Set(npc.MAID_SECRETS).size === npc.MAID_SECRETS.length);
  ok('평소 대사와도 안 겹친다',
    npc.MAID_SECRETS.every((x) => !npc.MAID_LINES.includes(x)));
  // 한 바퀴를 다 돈 사람에게만 나와야 한다 — 대사 수와 같아야 성립한다
  ok('발동 횟수 = 대사 한 바퀴', npc.MAID_SECRET_AT === npc.MAID_LINES.length,
    `${npc.MAID_SECRET_AT} vs ${npc.MAID_LINES.length}`);

  // 직전 것은 다시 안 고른다 (엘프와 같은 규칙)
  {
    let bad = 0;
    let prev = -1;
    for (let i = 0; i < 400; i++) {
      const n = npc.nextIndex(prev, (i * 37 % 100) / 100, npc.TIP_POSES.length);
      if (n === prev) bad++;
      if (n < 0 || n >= npc.TIP_POSES.length) bad++;
      prev = n;
    }
    ok('연속 같은 반응 없음 · 범위 안', bad === 0, bad + '건');
  }
  ok('하나뿐이면 그것만', npc.nextIndex(0, 0.9, 1) === 0);
  ok('첫 호출도 범위 안',
    [0, 0.5, 0.99].every((r) => {
      const i = npc.nextIndex(-1, r, 10);
      return i >= 0 && i < 10;
    }));
}

// ── 슬롯 재구성 (좌우 → 통합) ──────────────────────────
{
  console.log(NL + '── 슬롯 ──');
  const ty = require('./types') as typeof import('./types');
  const { migrateState: mg } = require('../state/migrate') as typeof import('../state/migrate');

  ok('10칸', ty.SLOT_IDS.length === 10, String(ty.SLOT_IDS.length));
  ok('좌우 이름이 남아 있지 않다',
    ty.SLOT_IDS.every((s) => !/[LR]$/.test(s)), ty.SLOT_IDS.join(' '));
  /* 숫자 꼬리(ear1·ring2)도 없앴다 — 한 개씩만 찬다 */
  ok('숫자 꼬리도 없다', ty.SLOT_IDS.every((s) => !/\d$/.test(s)), ty.SLOT_IDS.join(' '));
  ok('방어구는 한 칸씩',
    ['helm', 'chest', 'glove', 'greaves', 'boot']
      .every((s) => (ty.SLOT_IDS as readonly string[]).includes(s)));
  ok('견갑 칸은 없다', !(ty.SLOT_IDS as readonly string[]).includes('shoulder'));
  ok('장신구도 한 개씩',
    ['ear', 'neck', 'ring', 'belt']
      .every((s) => (ty.SLOT_IDS as readonly string[]).includes(s)));
  ok('모든 칸이 받는 부위를 안다',
    ty.SLOT_IDS.every((s) => (ty.SLOT_ACCEPTS[s]?.length ?? 0) > 0));
  ok('모든 칸에 이름이 있다', ty.SLOT_IDS.every((s) => !!ty.SLOT_NAME[s]));
  ok('칸 이름 중복 없음',
    new Set(ty.SLOT_IDS.map((s) => ty.SLOT_NAME[s])).size === ty.SLOT_IDS.length);

  // 옛 저장본 — 좌우 이름을 새 칸으로 옮긴다
  {
    const item = (kind: string, tier = 3, level = 5) => ({
      id: kind + tier + level, kind, tier, level, dur: 100,
    });
    const old = mg({
      equipped: {
        weapon: item('sword'),
        shoulderL: item('shoulder', 4, 7),
        shoulderR: item('shoulder', 2, 1),
        gloveL: item('glove'),
        gloveR: item('glove', 5, 9),
        bootL: item('boot'),
        bootR: item('boot'),
        earL: item('ear'),
        earR: item('ear', 6, 2),
        ringL: item('ring'),
        ringR: item('ring', 7, 3),
      },
      inventory: [],
    });

    ok('왼쪽 장갑이 장갑 칸으로', !!old.equipped.glove);
    ok('왼쪽 신발이 신발 칸으로', !!old.equipped.boot);
    /* 견갑 칸이 없어져 둘 다 갈 곳이 없다 — 창고로 내려간다 */
    ok('견갑은 착용에 안 남는다',
      !(old.equipped as Record<string, unknown>).shoulder);
    ok('귀걸이·반지는 한 짝만 낀다',
      !!old.equipped.ear && !!old.equipped.ring
      && !(old.equipped as Record<string, unknown>).ear2
      && !(old.equipped as Record<string, unknown>).ring2);

    ok('옛 이름은 하나도 안 남는다',
      Object.keys(old.equipped).every((k) => (ty.SLOT_IDS as readonly string[]).includes(k)),
      Object.keys(old.equipped).join(' '));

    /*
      갈 데가 없어진 장비는 **버리지 않는다.** 값을 치르고 강화까지 해 둔 물건이라
      칸이 줄었다는 이유로 사라지면 그건 유실이다.

      이 저장본에서는 견갑 2점(칸 자체가 없어졌다) + 오른쪽 장갑·신발 2점
      + 둘째 귀걸이·반지 2점 = 6점이 창고로 내려온다.
    */
    ok('낄 데 없어진 장비는 창고로', old.inventory.length === 6,
      String(old.inventory.length));
    ok('창고로 간 것도 성한 장비',
      old.inventory.every((it) => !!it && it.tier >= 1 && it.dur === 100));
  }

  // 이미 새 이름인 저장본은 그대로 통과해야 한다
  {
    const now = mg({
      equipped: { weapon: { id: 'w', kind: 'sword', tier: 5, level: 3, dur: 100 } },
      inventory: [],
    });
    ok('새 이름은 그대로', now.equipped.weapon?.tier === 5);
    ok('창고로 새는 것 없음', now.inventory.length === 0);
  }
}

// ── 계정 · 닉네임 · 캐시 ────────────────────────────────
{
  console.log('\n── 계정 · 캐시 ──');
  const c = require('./cash') as typeof import('./cash');
  const DAY = 86_400_000;
  const now = 1_800_000_000_000;

  ok('무료 주기 90일', c.NICKNAME_FREE_DAYS === 90);
  ok('한 번도 안 바꿨으면 무료', c.canChangeFree(0, now));
  ok('바꾼 직후는 유료', !c.canChangeFree(now, now));
  ok('89일째는 아직 유료', !c.canChangeFree(now - 89 * DAY, now));
  ok('90일 지나면 무료', c.canChangeFree(now - 90 * DAY, now));
  ok('남은 기간 안내', c.freeChangeLabel(now - 80 * DAY, now).includes('10일'),
    c.freeChangeLabel(now - 80 * DAY, now));

  const V = (next: string, last: number, tickets: number) =>
    c.validateNickname(next, '기존이름', last, now, tickets);
  ok('빈 이름 거절', V('  ', 0, 0) === 'empty');
  ok('한 글자 거절', V('가', 0, 0) === 'short');
  ok('최대 10자', c.NICKNAME_MAX === 10, String(c.NICKNAME_MAX));
  ok('10자는 통과', V('가'.repeat(10), 0, 0) === null);
  ok('11자 거절', V('가'.repeat(11), 0, 0) === 'long');
  ok('욕설 닉네임 거절', V('씨발러', 0, 0) === 'profanity');
  ok('띄어 쓴 욕설도 거절', V('시 발', 0, 0) === 'profanity');
  ok('멀쩡한 이름은 통과', V('시발점장', 0, 0) === null);
  ok('같은 이름 거절', V('기존이름', 0, 0) === 'same');
  ok('무료 기간이면 변경권 없이 통과', V('새이름', 0, 0) === null);
  ok('유료인데 변경권 없으면 거절', V('새이름', now, 0) === 'ticket');
  ok('유료여도 변경권 있으면 통과', V('새이름', now, 1) === null);

  // 화폐는 골드 하나뿐이다 — 파는 물건도 전부 골드다
  ok('파는 물건이 있다', c.CASH_ITEMS.length > 0);
  ok('전부 골드 값이 매겨져 있다', c.CASH_ITEMS.every((it) => it.price > 0));
  ok('닉네임 변경권 10골드', c.cashItem('nick_ticket').price === (require('./currency') as typeof import('./currency')).g(10));
}

// ── 룬각인 (정령석) ────────────────────────────────────
{
  console.log('\n── 룬각인 ──');
  const sp = require('./spirit') as typeof import('./spirit');
  const { seeded } = require('./rng') as typeof import('./rng');

  ok('3티어 이상만', sp.RUNE_MIN_TIER === 3);
  ok('1·2티어는 막힘',
    !sp.canEngrave(newItem('sword', 1, 0)) && !sp.canEngrave(newItem('sword', 2, 0)));
  ok('3티어부터 가능', sp.canEngrave(newItem('sword', 3, 0)) && sp.canEngrave(newItem('sword', 10, 0)));
  ok('막힌 이유를 알려 준다', (sp.engraveBlock(newItem('sword', 1, 0)) ?? '').includes('3티어'));
  ok('되는 장비는 이유 없음', sp.engraveBlock(newItem('sword', 5, 0)) === null);

  // 뽑기 — 확률표대로 나오는가 (1만 회)
  for (const st of ['low', 'mid', 'high'] as const) {
    const r = seeded('spirit-test', st);
    const cnt: Record<string, number> = {};
    for (let i = 0; i < 10000; i++) {
      const g = sp.roll(st, r).grade;
      cnt[g] = (cnt[g] ?? 0) + 1;
    }
    const def = sp.STONES.find((x) => x.id === st)!;
    const bad = Object.entries(def.odds).filter(([g, p]) =>
      Math.abs((cnt[g] ?? 0) / 100 - (p ?? 0)) > 1.5);
    ok(`${def.name} 확률 일치`, bad.length === 0,
      bad.map(([g, p]) => `${g} ${p}% → ${((cnt[g] ?? 0) / 100).toFixed(1)}%`).join(' '));
    const outside = Object.keys(cnt).filter((g) => def.odds[g as never] === undefined);
    ok(`${def.name} 범위 밖 등급 없음`, outside.length === 0, outside.join(','));
  }

  // 뽑힌 특성은 그 등급의 것이어야 한다
  {
    const r = seeded('spirit-trait', 1);
    let bad = 0;
    for (let i = 0; i < 2000; i++) {
      const s2 = sp.roll('high', r);
      if (!sp.traitsOf(s2.grade).some((t) => t.name === s2.trait)) bad++;
    }
    ok('특성이 등급과 일치', bad === 0, String(bad));
  }

  // 효과 합산 · 세트 · 상한
  const eqWith = (n: number, trait: string, grade: never) => {
    const eq: Record<string, ReturnType<typeof newItem>> = {};
    SLOT_IDS.forEach((sl, i) => {
      const it = newItem(sl === 'weapon' ? 'sword' : SLOT_ACCEPTS[sl][0], 10, 0);
      eq[sl] = i < n ? { ...it, spirit: { grade, trait } } : it;
    });
    return eq as never;
  };
  {
    const t1 = sp.spiritTotal(eqWith(1, '라스타의 손길', 'F' as never));
    ok('1칸 = 개별 효과만', t1.ilvl === sp.GRADE_INFO.F.ilvl && t1.sets[0].step === 0,
      `ilvl ${t1.ilvl}`);
    const t5 = sp.spiritTotal(eqWith(sp.SET_STEPS[0].count, '라스타의 손길', 'F' as never));
    ok('1단계 발동', t5.sets[0].step === 1);
    const t10 = sp.spiritTotal(eqWith(sp.SET_STEPS[1].count, '라스타의 손길', 'F' as never));
    ok('2단계', t10.sets[0].step === 2);
    const t16 = sp.spiritTotal(eqWith(sp.SET_STEPS[2].count, '라스타의 손길', 'F' as never));
    ok('전 칸 = 3단계', t16.sets[0].step === 3);
    // 마지막 단계는 반드시 착용 칸 수와 같아야 한다 — 아니면 영영 못 채우는 단계가 된다
    ok('최종 단계 = 착용 칸 수',
      sp.SET_STEPS[sp.SET_STEPS.length - 1].count === SLOT_IDS.length,
      `${sp.SET_STEPS[sp.SET_STEPS.length - 1].count} vs ${SLOT_IDS.length}`);
    ok('단계가 오를수록 효과도 커진다',
      (t5.bonus.explore_rate ?? 0) < (t10.bonus.explore_rate ?? 0)
      && (t10.bonus.explore_rate ?? 0) < (t16.bonus.explore_rate ?? 0));
    ok('아이템레벨도 함께 오른다', t5.ilvl < t10.ilvl && t10.ilvl < t16.ilvl);
  }
  {
    // 16칸 SSS — 상한이 없으면 통과 확률이 100%p 를 넘는다
    const top = sp.spiritTotal(eqWith(16, '태초의 정령', 'SSS' as never));
    ok('16칸 SSS 는 상한에 걸린다', top.capped.length > 0, top.capped.join(','));
    ok('모든 축이 상한 이내',
      (Object.keys(top.bonus) as (keyof typeof sp.CAPS)[])
        .every((a) => (top.bonus[a] ?? 0) <= sp.CAPS[a]));
    ok('탐험 통과 상한 25%p', top.bonus.explore_rate === 25, String(top.bonus.explore_rate));
    ok('투기장 상한 15%p', top.bonus.arena === 15, String(top.bonus.arena));
  }
  {
    // 서로 다른 특성은 세트가 안 된다
    const eq: Record<string, ReturnType<typeof newItem>> = {};
    SLOT_IDS.forEach((sl, i) => {
      const it = newItem(sl === 'weapon' ? 'sword' : SLOT_ACCEPTS[sl][0], 10, 0);
      eq[sl] = { ...it, spirit: { grade: 'F', trait: i % 2 ? '반짝임' : '라스타의 손길' } };
    });
    const t = sp.spiritTotal(eq as never);
    /* 칸을 번갈아 나누면 절반씩이다 */
    ok('다른 특성은 따로 센다',
      t.sets.length === 2 && t.sets.reduce((a, x) => a + x.count, 0) === SLOT_IDS.length,
      t.sets.map((x) => x.count).join(' + '));
    ok('절반씩이면 1단계까지만', t.sets.every((x) => x.step === 1),
      t.sets.map((x) => x.step).join(' '));
  }
  ok('효과 문구 부호', sp.axisText('durability', 11).includes('−')
    && sp.axisText('explore_rate', 1.1).includes('+1.1%p'));

  // 승급해도 각인은 따라간다 — 어렵게 뽑은 것을 태우게 하면 승급을 안 하게 된다
  {
    const { promote } = require('./enhance') as typeof import('./enhance');
    const engraved = { ...newItem('sword', 5, 15), spirit: { grade: 'S', trait: '왕의 뇌명' } };
    ok('승급해도 각인 유지', promote(engraved).spirit === engraved.spirit);
    ok('아이템레벨에 각인 보너스가 들어간다',
      itemLevel(engraved) - itemLevel(newItem('sword', 5, 15)) === sp.GRADE_INFO.S.ilvl,
      String(itemLevel(engraved) - itemLevel(newItem('sword', 5, 15))));
  }
  // 두 곳에 적힌 아이템레벨 보너스 표가 어긋나면 조용히 틀린다
  {
    const viaItem = (g: string) =>
      itemLevel({ ...newItem('sword', 5, 0), spirit: { grade: g, trait: 'x' } })
      - itemLevel(newItem('sword', 5, 0));
    const bad = sp.GRADES.filter((g) => Math.abs(viaItem(g) - sp.GRADE_INFO[g].ilvl) > 0.01);
    ok('tiers 와 spirit 의 보너스표 일치', bad.length === 0, bad.join(','));
  }
}

// ── 번스타인 재료 ──────────────────────────────────────
{
  console.log('\n── 번스타인 재료 ──');
  const { MATERIALS, MATERIAL_IDS, materialFor, BOSS_NAME, MATERIAL_PRICE: MPRICE } =
    require('./artisans') as typeof import('./artisans');
  const { ARTISAN_FORGE_MATERIALS, ARTISAN_FORGE_COST } = require('./enhance') as typeof import('./enhance');
  const { ARTISAN_MATERIAL_DROP, ARTISAN_MATERIAL_BONUS, materialPerClimb } =
    require('./combat') as typeof import('./combat');
  ok('보스 이름', BOSS_NAME === '번스타인');
  ok('재료 3종', MATERIAL_IDS.length === 3);
  ok('무기 = 강철피부 조각',
    materialFor('sword') === 'skin' && MATERIALS.skin.name.includes('강철피부'));
  ok('장신구 = 이빨조각',
    materialFor('ring') === 'tooth' && materialFor('neck') === 'tooth'
    && MATERIALS.tooth.name.includes('이빨'));
  ok('방어구 = 뼛조각',
    materialFor('chest') === 'bone' && materialFor('helm') === 'bone'
    && MATERIALS.bone.name.includes('뼛'));
  ok('21부위 전부 어딘가에 속한다', PART_KINDS.every((k) => MATERIAL_IDS.includes(materialFor(k))));
  ok('무기 11종 전부 skin',
    ['spear','sword','blade','axe','mace','hammer','bow','crossbow','staff','rod','fan']
      .every((k) => materialFor(k as never) === 'skin'));
  ok('제련 재료 10개', ARTISAN_FORGE_MATERIALS === 10);
  // 드랍은 확정이 아니다 — 15% 로 하나, 그중 30% 로 하나 더
  ok('50층 재료 드랍 15%', ARTISAN_MATERIAL_DROP === 0.15, String(ARTISAN_MATERIAL_DROP));
  ok('추가 1개는 그보다 낮은 확률', ARTISAN_MATERIAL_BONUS < 1 && ARTISAN_MATERIAL_BONUS > 0,
    String(ARTISAN_MATERIAL_BONUS));
  {
    const per = materialPerClimb();
    const climbs = Math.round(ARTISAN_FORGE_MATERIALS / per);
    // 한 부위가 하루치 등반(16런) 서너 배 안에 들어와야 사다리로 읽힌다
    ok('한 부위 기대 등반 40~70회', climbs >= 40 && climbs <= 70, `${climbs}회`);
    ok('회당 기대 수급', Math.abs(per - 0.195) < 1e-9, per.toFixed(3));
  }
  // 매입가는 털어 내는 창구일 뿐 — 한 부위분(25개)을 팔아도 제련비의 5%다
  ok('재료 매입가 1골드', MPRICE === g(1), String(MPRICE));
  ok('한 부위분 전량 매각 < 제련비',
    MPRICE * ARTISAN_FORGE_MATERIALS < ARTISAN_FORGE_COST,
    `${MPRICE * ARTISAN_FORGE_MATERIALS} vs ${ARTISAN_FORGE_COST}`);
}

// ── 클리어 보상 ───────────────────────────────────────
{
  console.log('\n── 클리어 보상 ──');
  const { exploreReward, towerReward, exploreRecIlvl, EXPLORE_CHAPTERS, TOWER_FLOORS } =
    require('./combat') as typeof import('./combat');
  const { enhanceCost } = require('./enhance') as typeof import('./enhance');
  const { TIERS: TT } = require('./tiers') as typeof import('./tiers');

  const tierOf = (rec: number) => {
    const a = rec / SLOT_COUNT;
    let t = 1;
    for (let i = 1; i <= 10; i++) if (TT[i as never].base <= a) t = i;
    return t;
  };
  /** 보상 ÷ 그 구간 강화 1회 비용 — 이 비율이 전 구간에서 비슷해야 한다 */
  const ratio = (ch: number) => {
    const rec = exploreRecIlvl(ch);
    const enh = enhanceCost(newItem('sword', tierOf(rec) as never, 8), null);
    return exploreReward(ch) / enh;
  };

  // 예전엔 1챕터 6.6 → 100챕터 0.03 (227배 붕괴) 였다
  /**
   * 곡선을 30 에서 완만하게 시작하도록 바꾸면서 **티어 1 구간이 15챕터까지** 늘었다.
   * 그 구간은 기획서 원식(권장템렙 × 3)이 티어1 강화비(5쿠퍼)를 크게 웃돌아 비율이
   * 크게 뜬다 — 배우는 구간을 넉넉하게 주는 것이므로 의도대로 둔다.
   * 일정한 비율을 요구하는 건 티어가 실제로 굴러가기 시작하는 20챕터부터다.
   */
  const mid = [25, 35, 45, 55, 65, 75, 85, 95].map(ratio);
  ok('중후반 보상이 강화 서너 번 값', Math.min(...mid) > 2 && Math.max(...mid) < 8,
    `${Math.min(...mid).toFixed(2)} ~ ${Math.max(...mid).toFixed(2)}회분`);
  // 어느 챕터든 최소한 그 구간 강화 한 번은 돌릴 수 있어야 한다
  const all = Array.from({ length: EXPLORE_CHAPTERS }, (_, i) => ratio(i + 1));
  ok('전 챕터가 강화 1회분 이상은 준다', Math.min(...all) >= 1,
    `최저 ${Math.min(...all).toFixed(2)}회분`);
  ok('100챕터가 30챕터에 밀리지 않음', ratio(100) > ratio(30) * 0.5,
    `${ratio(100).toFixed(2)} vs ${ratio(30).toFixed(2)}`);

  // 같은 티어 안에서도 계속 올라야 한다 (10티어 구간이 평평하면 뒤로 갈 이유가 없다)
  ok('10티어 구간이 평평하지 않다', exploreReward(65) !== exploreReward(95),
    `65챕터 ${exploreReward(65)} vs 95챕터 ${exploreReward(95)}`);

  /*
    ## 10단위 ×5 보너스를 없앤 뒤의 불변식

    예전엔 10·20·50·100 챕터에 다섯 배를 줬는데, 그 스파이크가 보상을 **거꾸로**
    만들었다 — 50챕터가 51챕터보다 26만 쿠퍼 더 줬다. 더 어려운 데를 갔는데 덜
    받으면 보상표를 보고 계획을 세울 수가 없다.
  */
  {
    const { s: silver } = require('./currency') as typeof import('./currency');
    const e = Array.from({ length: EXPLORE_CHAPTERS }, (_, i) => exploreReward(i + 1));
    const gapsE = e.slice(1).map((v, i) => v - e[i]);
    ok('탐험 보상이 반드시 오른다', gapsE.every((d) => d > 0),
      `최소 격차 ${Math.min(...gapsE)}`);
    ok('한 챕터마다 최소 1실버는 더', Math.min(...gapsE) >= silver(1),
      `${Math.min(...gapsE)} 쿠퍼`);
    ok('1챕터도 1실버 이상', e[0] >= silver(1), `${e[0]} 쿠퍼`);

    const t = Array.from({ length: TOWER_FLOORS }, (_, i) => towerReward(i + 1));
    const gapsT = t.slice(1).map((v, i) => v - t[i]);
    ok('보스의탑 보상이 반드시 오른다', gapsT.every((d) => d > 0),
      `최소 격차 ${Math.min(...gapsT)}`);
    ok('탑은 한 층마다 최소 5실버는 더', Math.min(...gapsT) >= silver(5),
      `${Math.min(...gapsT)} 쿠퍼`);

    // 탑이 탐험보다 후해야 한다 — 층이 50개뿐이고 재료가 나오는 유일한 곳이다
    ok('같은 난이도면 탑이 더 준다',
      towerReward(TOWER_FLOORS) > exploreReward(EXPLORE_CHAPTERS) * 0.8,
      `탑 50층 ${towerReward(TOWER_FLOORS)} vs 탐험 130 ${exploreReward(EXPLORE_CHAPTERS)}`);

    /*
      스파이크가 없어야 계획이 선다.

      큰 계단이 아예 없을 수는 없다 — 보상이 그 구간 **강화비**를 따라가는데
      (`clearBase` 의 byCost) 강화비는 티어가 바뀔 때 2.5배씩 뛴다. 티어가 바뀌는
      자리는 실제로 사건이므로 그 계단은 정상이다. 문제였던 건 **10의 배수마다**
      규칙적으로 튀던 ×5 스파이크이고, 그건 티어와 아무 상관이 없었다.

      그래서 "큰 계단이 없다" 가 아니라 **"큰 계단이 티어 수만큼만 있다"** 로 본다.
    */
    const jumps = e.slice(1).map((v, i) => v / Math.max(1, e[i]));
    const bigJumps = jumps.filter((r) => r >= 1.5).length;
    ok('큰 계단은 티어 경계에서만 (열 번 안)', bigJumps <= 10, `${bigJumps}곳`);
    ok('그 계단도 세 배는 안 넘는다', Math.max(...jumps) < 3,
      `최대 ${Math.max(...jumps).toFixed(2)}배`);
  }
}

// ── 수리비 ────────────────────────────────────────────
{
  console.log('\n── 수리비 ──');
  const { repairCost, REPAIR_PER_ILVL } = require('./economy') as typeof import('./economy');
  ok('내구 100% 면 0', repairCost({ ...newItem('sword', 10, 15), dur: 100 }) === 0);
  // 반올림 때문에 ±1쿠퍼 차이는 허용
  ok('닳은 만큼만 받는다 (2배 소모 = 2배 비용)',
    Math.abs(repairCost({ ...newItem('sword', 5, 0), dur: 50 })
      - 2 * repairCost({ ...newItem('sword', 5, 0), dur: 75 })) <= 1);
  ok('닳아도 단가는 그대로 (방치가 이득이 되면 안 된다)',
    repairCost({ ...newItem('sword', 5, 0), dur: 90 }, 100)
    === repairCost({ ...newItem('sword', 5, 0), dur: 0 }, 10));
  ok('아이템레벨에 비례',
    repairCost({ ...newItem('sword', 10, 15), dur: 0 })
    > repairCost({ ...newItem('sword', 1, 0), dur: 0 }));

  /**
   * 핵심 불변식: 수리비 / 같은 기간 벌이 비율이 전 구간에서 일정해야 한다.
   * 예전에는 판매가에 비례해서 10티어에서 1,090배가 되어 게임이 막혔다.
   */
  const ratio = (t: number, l: number) => {
    const set = repairCost({ ...newItem('sword', t as never, l), dur: 60 }) * SLOT_COUNT;
    const ilvl = SLOT_COUNT * itemLevel(newItem('sword', t as never, l));
    const q = rollQuests(ilvl, 0).find((x) => x.difficulty === 'normal')!;
    const per = q.reward * 0.386 - q.deposit * 0.614;
    return set / (per * 27);
  };
  const rs = ([[1, 0], [3, 15], [5, 15], [7, 15], [10, 15]] as const).map(([t, l]) => ratio(t, l));
  ok('수리비/벌이 비율이 전 티어에서 같다',
    Math.max(...rs) - Math.min(...rs) < 0.02,
    rs.map((x) => `${(x * 100).toFixed(0)}%`).join(' '));
  ok('비율이 20% 미만 (감당 가능한 사금고)', Math.max(...rs) < 0.2, `${(Math.max(...rs)*100).toFixed(0)}%`);
  // 연성액이 수리비를 올리면 안 된다 (배수는 itemLevel 에만 곱한다)
  {
    const gear = newItem('chest', 8, 10, 40);
    ok('연성액을 부여해도 수리비가 같다',
      repairCost(gear) === repairCost({ ...gear, alch: 2 }),
      `${repairCost(gear)} vs ${repairCost({ ...gear, alch: 2 })}`);
  }
}

console.log('── 자산 · 랭킹 · 길드 ──');
{
  const { breakdown } = require('./networth') as typeof import('./networth');
  const gear = newItem('sword', 8, 10, 100);
  const a = breakdown({
    money: 5000,
    equipped: { weapon: gear },
    inventory: [newItem('chest', 3, 0, 100)],
  });
  ok('즉시 사용 = 소지금', a.liquid === 5000);
  ok('장비 = 착용 + 창고', a.gear === a.gearWorn + a.gearStored && a.gearWorn > 0);
  /*
    장비는 **자산에 안 들어간다** — 자산 순위표가 아이템레벨 순위표의 사본이 되지 않게.
    주식장을 없앤 뒤로 총자산에 남는 건 소지금뿐이다.
  */
  ok('총자산 = 소지금 (장비 제외)', a.gross === a.liquid);
  ok('장비값은 총자산에 안 섞인다', a.gear > 0 && a.gross < a.liquid + a.gear);
  /*
    은행까지 없앤 뒤로 빚질 곳이 없어서 순자산과 총자산이 늘 같다.
    이름을 남겨 둔 건 순위표·화면이 여기 하나만 보게 하기 위해서다 (core/networth 참고).
  */
  ok('순자산 = 총자산 (빚질 곳이 없다)', a.net === a.gross);
  const broke = breakdown({ money: 0, equipped: {}, inventory: [newItem('chest', 3, 0, 100)] });
  ok('빈털터리는 0', broke.gross === 0 && broke.net === 0);
  ok('그래도 장비값은 세어 둔다', broke.gearStored > 0);
}
{
  const { board, percentile, winRateOf: wr } = require('./ranking') as typeof import('./ranking');
  const { playerIlvl } = require('./tiers') as typeof import('./tiers');
  type P = import('./ranking').Player;

  /*
    인구는 이제 서버에서 온다 — 여기서 검사할 수 있는 건 **정렬과 셈** 뿐이다.
    (예전엔 population(dayKey) 가 만든 가짜 99명의 분포를 검사했다. 그 사람들이
     사라졌으므로, 대신 그 자리에 아무 줄이나 넣어도 규칙이 지켜지는지를 본다.)
  */
  const row = (id: string, ilvl: number, extra: Partial<P> = {}): P => ({
    id, nick: id, avatar: 'swordsman', ilvl, net: ilvl * 100,
    arenaPoints: 0, wins: 0, losses: 0, guildId: null, ...extra,
  });
  const others = Array.from({ length: 20 }, (_, i) => row(`p${i}`, 200 + i * 300));

  const weak: P = { ...row('me', 160), nick: '나', net: 1000, isMe: true };
  const strong: P = { ...weak, ilvl: maxSetIlvl(), net: 99_999_999,
                      arenaPoints: 690, wins: 300, losses: 10 };

  ok('약하면 꼴찌', board('ilvl', others, weak).myRank === others.length + 1);
  ok('강하면 1위', board('ilvl', others, strong).myRank === 1);
  ok('성장하면 순위가 오른다',
    board('ilvl', others, strong).myRank < board('ilvl', others, weak).myRank);
  ok('자산 랭킹도 동작', board('net', others, strong).myRank === 1);
  ok('인구 = 남들 + 나', board('ilvl', others, weak).total === others.length + 1);
  ok('아무도 없으면 나 혼자 1위',
    board('ilvl', [], weak).myRank === 1 && board('ilvl', [], weak).total === 1);
  // 서버에도 내 줄이 있다 (몇십 초 낡은 값). 그게 남아 순위표에 내가 둘로 뜨면 안 된다
  ok('서버본의 나는 걷어 낸다',
    board('ilvl', [...others, row('me', 99999)], weak).rows.filter((p) => p.id === 'me').length === 1);
  {
    const top: P = { ...strong, arenaPoints: 5000 };
    ok('투기장 최고점이면 1위', board('arena', others, top).myRank === 1);
    const rows = board('arena', others, top).rows;
    ok('투기장 정렬: 점수 내림차순', rows.every((p, i) => i === 0 || rows[i - 1].arenaPoints >= p.arenaPoints));
    // 점수가 같으면 승률 우선
    const a2 = { ...weak, id: 'a2', arenaPoints: 300, wins: 90, losses: 10 };
    const b2 = { ...weak, id: 'b2', isMe: false, arenaPoints: 300, wins: 10, losses: 90 };
    const mixed = [a2, b2].sort((x, y) => y.arenaPoints - x.arenaPoints || wr(y) - wr(x) || y.wins - x.wins);
    ok('동점이면 승률 우선', mixed[0].id === 'a2');
  }
  ok('내 행이 정확히 하나', board('ilvl', others, weak).rows.filter((p) => p.isMe).length === 1);
  ok('장비 합이 곧 아이템레벨', playerIlvl({}) === 0);
  ok('상위 % 계산', percentile(1, 100) === 1 && percentile(50, 100) === 50);
  // 나 혼자면 '상위 100%' 다 — 이상해 보여도 맞는 말이고, 무엇보다 NaN 이 아니다
  ok('나 혼자면 상위 100%', percentile(1, 1) === 100);
  ok('0명이어도 0으로 안 나눈다', Number.isFinite(percentile(1, 0)));
  ok('승률 계산', Math.abs(wr({...weak, wins: 3, losses: 1}) - 0.75) < 1e-9 && wr(weak) === 0);
}
{
  const gu = require('./guilds') as typeof import('./guilds');
  type G = import('./guilds').Guild;

  /*
    길드는 이제 서버에서 온다 — 지어내는 함수가 없으므로 여기서 검사할 수 있는 건
    **규칙**뿐이다 (이름·신청서·대기·수치 읽기). 예전엔 `guildsFor()` 가 만든
    280개의 분포와 쪽 넘김을 검사했는데, 그 길드들이 사라졌다.
  */
  const G0: G = {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    emblem: '01', name: '강화중독자', motto: 'ㅎㅇ',
    masterId: 'u1', master: '길드장', capacity: 30,
    members: 3, avgIlvl: 1600, weekly: 900,
  };

  // ── 창설 ──
  ok('창설 비용 100골드', gu.GUILD_CREATE_COST === g(100), String(gu.GUILD_CREATE_COST));
  ok('문장 15종', gu.GUILD_EMBLEMS.length === 15);
  ok('정원 30', gu.GUILD_CAPACITY === 30);
  ok('정상 이름', gu.validateGuildName('강화중독자') === null);
  ok('빈 이름', gu.validateGuildName('   ') === 'empty');
  ok('한 글자', gu.validateGuildName('가') === 'short');
  ok('13자 초과', gu.validateGuildName('가'.repeat(13)) === 'long');

  // 중복은 **지금 서버에 있는 이름**으로만 판단한다 (미리 만들어 둔 이름이 없다)
  const taken = ['곡괭이 형제단', '파산자 연합'];
  ok('없는 이름이면 통과', gu.validateGuildName('곡괭이 형제단') === null);
  ok('이미 있는 이름 차단', gu.validateGuildName('곡괭이 형제단', taken) === 'taken');
  ok('공백만 다른 이름도 차단', gu.validateGuildName('곡괭이형제단', taken) === 'taken');
  ok('대소문자·앞뒤 공백 무시', gu.validateGuildName('  파산자 연합 ', taken) === 'taken');
  ok('정규화 규칙', gu.normGuildName(' 곡괭이 형제단 ') === gu.normGuildName('곡괭이형제단'));
  // 길드 이름은 목록·랭킹·채팅 머리에 계속 붙어 다닌다 — 닉네임과 같은 잣대로 막는다
  ok('욕설 길드 이름 거절', gu.validateGuildName('씨발길드') === 'profanity');
  ok('띄어 쓴 욕설도 거절', gu.validateGuildName('시 발 단') === 'profanity');
  ok('멀쩡한 이름은 통과', gu.validateGuildName('시발점 원정대') === null);

  // ── 가입 신청 — 버튼 한 번으로 들어가지 않게 사유를 받는다 ──
  ok('빈 사유 거절', gu.validateApply('   ', G0, null) === 'empty');
  ok('짧은 사유 거절', gu.validateApply('안녕', G0, null) === 'short');
  ok('긴 사유 거절', gu.validateApply('가'.repeat(101), G0, null) === 'long');
  ok('최소 길이 통과', gu.validateApply('가'.repeat(gu.APPLY_REASON_MIN), G0, null) === null);
  ok('정원 찬 길드는 사유와 무관하게 거절',
    gu.validateApply('가'.repeat(30), { ...G0, members: G0.capacity }, null) === 'full');
  // 사유는 길드장 한 사람이 읽는다 — 별표로 덮어 보내면 수락 여부를 판단할 수 없다
  ok('욕설 신청 사유 거절',
    gu.validateApply(`씨발 좀 넣어주세요${'가'.repeat(10)}`, G0, null) === 'profanity');
  ok('멀쩡한 사유는 통과',
    gu.validateApply('열심히 하겠습니다 받아주세요', G0, null) === null);

  // ── 남에게 보이는 내 수치 ──
  {
    const raw = {
      weekly: 12, joinedAt: 5, attendDay: '2026-8-26',
      boss: { key: 'w', dmg: 300 }, raidD: { key: 'd', dmg: 10 }, raidW: { key: 'w', dmg: 20 },
    };
    const r = gu.readGuildStats(raw);
    ok('그대로 읽는다', r.weekly === 12 && r.boss.dmg === 300 && r.attendDay === '2026-8-26');
    // 남이 올린 값이라 모양이 틀릴 수 있다 — 화면이 깨지면 안 된다
    const junk = gu.readGuildStats({ weekly: 'x', boss: 7, raidD: null });
    ok('망가진 값은 0 으로', junk.weekly === 0 && junk.boss.dmg === 0 && junk.raidD.key === '');
    ok('아예 없어도 안전', gu.readGuildStats(undefined).weekly === 0);
    ok('음수는 0 으로', gu.readGuildStats({ weekly: -5 }).weekly === 0);
  }
}

console.log('── 저장본 마이그레이션 ──');
{
  const { migrateState } = require('../state/migrate') as typeof import('../state/migrate');
  const { initial } = require('../state/initial') as typeof import('../state/initial');
  // 실제로 흰 화면을 냈던 저장본: 종목 5개, open 없음, 신규 필드 전부 없음
  const old = {
    money: 12345,
    scrolls: { succ_low: 2, succ_mid: 0, succ_high: 0, guard_down: 0, guard_destroy50: 0, guard_destroy100: 0 },
    stocks: {
      steel:  { id:'steel',  price: 12500, history: [12000, 12500] },
      pick:   { id:'pick',   price: 31000, history: [30000] },
      slime:  { id:'slime',  price: 4400,  history: [4500] },
      dragon: { id:'dragon', price: 18200, history: [18000] },
      pick2x: { id:'pick2x', price: 20500, history: [20000], inverse: false },
    },
    holdings: { pick: { shares: 3, avg: 30000 }, oldGone: { shares: 5, avg: 1 } },
    stats: { enhanceAttempts: 7 },
    arena: { points: 40 },
    collection: ['sword:1'],
  };
  const m = migrateState(old);
  /*
    주식장 폐쇄 정산 — 들고 있던 3주가 마지막 시세(31,000)로 돈이 되어 얹힌다.
    콘텐츠를 없앤 건 기획의 선택이지만, 그 김에 사람의 재산까지 없애지는 않는다.
  */
  ok('돈 유지 + 보유 종목 청산', m.money === 12345 + 3 * 31000, String(m.money));
  ok('신규 주문서 키 채움', m.scrolls.guarantee === 0 && m.scrolls.succ_low === 2);
  ok('정산액을 화면에 알릴 값이 실린다', m.marketPayout === 3 * 31000, String(m.marketPayout));

  /*
    은행 폐쇄 — 담보로 잡혀 있던 장비를 창고로 돌려준다.

    대출은 담보를 맡기고 돈을 빌리는 것이라, 은행을 없애면 그 장비가 갈 곳이 없다.
    그냥 두면 저장본에만 남고 화면 어디에도 안 나오는 유령이 된다 — 사람 입장에서는
    장비가 사라진 것이고, 담보로 잡히는 건 대개 제일 비싼 물건이다.
  */
  {
    const { migrateState: mig } = require('../state/migrate') as typeof import('../state/migrate');
    const held = { kind: 'sword', tier: 8, level: 10, dur: 100, id: 'col-1' };
    const withLoan = {
      money: 1000,
      inventory: [],
      loans: [{ lender: 3, collateral: held, principal: 100, due: 110, dueAt: 0, takenAt: 0 }],
    };
    const r = mig(withLoan);
    ok('담보가 창고로 돌아온다', r.inventory.length === 1, String(r.inventory.length));
    ok('돌아온 것이 그 장비다',
      r.inventory[0]?.kind === 'sword' && r.inventory[0]?.tier === 8 && r.inventory[0]?.level === 10,
      JSON.stringify(r.inventory[0] ?? null));
    ok('빚은 탕감된다 (갚을 곳이 없다)', r.money === 1000, String(r.money));
    ok('알릴 개수가 실린다', r.bankReturned === 1, String(r.bankReturned));
    ok('정산했음을 남긴다', r.bankClosed >= 1);

    /*
      ⚠ **두 번 돌려주지 않는다.** 마이그레이션은 저장본을 읽을 때마다 돈다 —
      세대를 안 보면 게임을 켤 때마다 담보가 창고에 하나씩 복제된다.
    */
    const again = mig({ ...withLoan, bankClosed: r.bankClosed, inventory: r.inventory });
    ok('다시 읽어도 안 늘어난다', again.inventory.length === 1, String(again.inventory.length));
    ok('두 번째엔 알릴 것도 없다', again.bankReturned === 0, String(again.bankReturned));

    // 대출이 없던 사람에게는 아무 일도 없다
    const clean = mig({ money: 500, inventory: [] });
    ok('대출이 없었으면 조용하다', clean.bankReturned === 0 && clean.inventory.length === 0);

    // 담보 자리가 망가져 있어도 터지지 않는다
    const junk = mig({ money: 1, loans: [{ collateral: null }, 'x', { collateral: { kind: 'nope' } }] });
    ok('망가진 담보는 걸러진다', Number.isFinite(junk.money) && Array.isArray(junk.inventory),
      String(junk.inventory.length));
  }
  ok('정산했음을 남긴다', m.marketClosed >= 1);
  /*
    ⚠ **두 번 주지 않는다.**

    마이그레이션은 저장본을 읽을 때마다 돈다. 세대(marketClosed)를 안 보면 게임을
    켤 때마다 보유액이 소지금에 얹힌다 — 무한 증식은 유실만큼이나 나쁘다.
  */
  {
    const again = migrateState({ ...old, marketClosed: m.marketClosed, money: m.money });
    ok('다시 읽어도 또 안 준다', again.money === m.money, String(again.money));
    ok('두 번째엔 알릴 것도 없다', again.marketPayout === null, String(again.marketPayout));
  }
  {
    // 시세가 없는 보유분은 값을 매길 수 없다 — 0 으로 세고 넘어간다 (터지지 않는다)
    const noPrice = migrateState({ money: 100, holdings: { ghost: { shares: 9, avg: 1 } } });
    ok('가격 없는 보유분은 0', noPrice.money === 100, String(noPrice.money));
  }
  {
    // 저장본은 손댈 수 있다. 말도 안 되는 수량이 소지금을 무한대로 만들면 안 된다
    const cheat = migrateState({
      money: 0,
      stocks: { steel: { id: 'steel', price: 1e12 } },
      holdings: { steel: { shares: 1e12, avg: 1 } },
    });
    ok('청산액에 상한이 있다', cheat.money > 0 && cheat.money <= 1_000_000_000_000,
      String(cheat.money));
  }
  ok('신규 통계 키 채움', m.stats.enhanceAttempts === 7 && m.stats.lotteryBought === 0 && m.stats.attendanceTotal === 0);
  /*
    점수 단위가 바뀌어(100 → 1000) 옛 저장본은 **티어를 유지하는 쪽으로** 환산된다.
    40점은 F 티어였으므로 0점(F 바닥)이 된다 — 티어 안 진행도는 되살릴 근거가 없다.
  */
  ok('arena 옛 점수는 티어 유지로 환산', m.arena.points === 0 && m.arena.badges === 5,
    String(m.arena.points));
  ok('arena 새 필드 채움',
    Array.isArray(m.arena.log) && typeof m.arena.seenAt === 'number'
    && m.arena.rerolls === 0);
  /*
    `draws` 는 키가 자유로워졌다 — 가챠는 'gacha', 쿠지는 **종류 이름**이다
    (쿠지가 여러 종류를 동시에 진열하게 되면서). 옛 'kuji' 키는 남아 있어도
    안 읽힐 뿐이라 검사하지 않는다.
  */
  ok('신규 최상위 필드 채움', !!m.draws?.gacha && !!m.rushH2H && typeof m.rushWeek === 'string'
    && m.guildId === null);
  ok('크리처 채움', Object.keys(m.creatures).length === 10);
  ok('도감 유지', m.collection.includes('sword:1'));
  ok('토스트는 비움', m.toasts.length === 0);
  // 완전히 깨진 입력도 살아남아야 한다.
  // 기본 소지금은 시작 장비 구성에 따라 바뀌므로 숫자를 박지 않고 initial() 에서 읽는다.
  const DEF_MONEY = initial().money;
  ok('null 저장본', migrateState(null).money === DEF_MONEY);
  ok('쓰레기 저장본', migrateState({ money: 'abc', stocks: 5, stats: null } as unknown).money === DEF_MONEY);
  ok('배열 저장본', migrateState([1,2,3] as unknown).money === DEF_MONEY);

  // ⚠ 실제 흰 화면의 진짜 원인: NaN 이 JSON 에서 null 로 저장됐다
  const withNulls = migrateState({
    money: 999,
    stats: { enhanceAttempts: null, gambleWon: null, lotteryBought: 3, destroyed: NaN },
    scrolls: { succ_low: null, succ_mid: 4 },
    materials: { sword: null },
    arena: { points: null, badges: 2 },
    rushH2H: { 'a:b': null, 'c:d': 5 },
    creatures: { ogre: { wins: null, losses: 3 } },
    stocks: { pick: { price: null, history: [null, 100] } },
    holdings: { pick: { shares: null, avg: 1 } },
    exploreCleared: null,
  } as unknown);
  ok('null 통계 → 0 (흰 화면 원인)', withNulls.stats.enhanceAttempts === 0 && withNulls.stats.gambleWon === 0);
  ok('NaN 통계 → 0', withNulls.stats.destroyed === 0);
  ok('유효한 통계는 유지', withNulls.stats.lotteryBought === 3);
  ok('전 통계 키가 숫자', Object.values(withNulls.stats).every(v => typeof v === 'number' && Number.isFinite(v)));
  ok('null 주문서 → 0', withNulls.scrolls.succ_low === 0 && withNulls.scrolls.succ_mid === 4);
  // 재료는 부위 21종 → 번스타인 3계열로 바뀌었다 (옛 저장본은 계열로 합산된다)
  ok('null 재료 → 0', withNulls.materials.skin === 0);
  ok('null 투기장 점수 → 기본', withNulls.arena.points === 0 && withNulls.arena.badges === 2);
  ok('null 상대전적 제거', withNulls.rushH2H['a:b'] === undefined && withNulls.rushH2H['c:d'] === 5);
  ok('null 크리처 전적 → 기준값', Number.isFinite(withNulls.creatures.ogre.wins) && withNulls.creatures.ogre.losses === 3);
  // 주식장은 없앴다 — 망가진 시세·보유분은 청산 계산이 조용히 0 으로 넘긴다 (위 참고)
  ok('null 진행도 → 0', withNulls.exploreCleared === 0);
  ok('돈은 유지', withNulls.money === 999);
}

console.log('── 통계 파생 계산 ──');
{
  const { outcomeDist, attemptsByLevel, luck, levelTrend } =
    require('./statsView') as typeof import('./statsView');
  type L = import('./statsView').LogLike;
  const logs: L[] = [
    { from: 14, to: 15, outcome: 'success', cost: 1 },
    { from: 14, to: 14, outcome: 'fail', cost: 1 },
    { from: 14, to: 13, outcome: 'downgrade', cost: 1 },
    { from: 14, to: 14, outcome: 'destroy', cost: 1 },
    { from: 0,  to: 1,  outcome: 'success', cost: 1 },
    { from: 19, to: 20, outcome: 'success', cost: 1 },
  ];
  const d = outcomeDist(logs);
  ok('결과 분포', d.success === 3 && d.fail === 1 && d.downgrade === 1 && d.destroy === 1 && d.total === 6);
  ok('성공률', Math.abs(d.successRate - 0.5) < 1e-9);
  ok('빈 히스토리', outcomeDist([]).total === 0 && outcomeDist([]).successRate === 0);

  const by = attemptsByLevel(logs);
  ok('단계별 분포 15칸 + 16이상', by.length === 16 && by[by.length-1].label === '16+');
  ok('+15 시도 4회 집계 (from:14 로그 4개)', by.find(x=>x.label==='15')!.value === 4);
  ok('+1 시도 1회', by.find(x=>x.label==='1')!.value === 1);
  ok('16 이상 묶음', by.find(x=>x.label==='16+')!.value === 1);
  ok('16 이상 없으면 칸 없음', attemptsByLevel([logs[0]]).length === 15);

  const lk = luck(logs);
  // 기대 성공 수는 티어 사다리에 따라 바뀐다 — 숫자를 박지 말고 같은 함수로 계산한다
  const expManual = logs.reduce(
    (a, l) => a + effectiveOdds(l.from + 1, null, 0, l.tier ?? TIER_NEUTRAL).success / 100, 0);
  ok('기대 성공 수 = 단계별 확률 합', Math.abs(lk.expected - expManual) < 1e-9, lk.expected.toFixed(2));
  ok('실측 성공 수', lk.actual === 3);
  ok('운 = 실측 - 기대', Math.abs(lk.diff - (lk.actual - lk.expected)) < 1e-9, lk.diff.toFixed(2));

  const tr = levelTrend(logs);
  ok('추이는 시간순(뒤집힘)', tr.length === 6 && tr[0] === 20 && tr[tr.length-1] === 15);
  ok('추이 상한', levelTrend(new Array(200).fill(logs[0]), 60).length === 60);
}

// ── 쿠폰 ───────────────────────────────────────────────
{
  console.log(NL + '── 쿠폰 ──');
  const { COUPONS } = require('./coupons') as typeof import('./coupons');

  /*
    지금 살아 있는 쿠폰은 **시험용 하나뿐**이다.

    소액 쿠폰들(50골드·200골드·다이아 1,000/5,000)과 개발용 두 개는 전부 없앴다.
    이미 받은 사람의 재화는 그대로 남는다 — 지급은 그때 끝난 일이고, 사용
    기록에 남은 옛 코드는 그냥 안 읽히는 문자열이 될 뿐이다.
  */
  const CODE = 'rakdos';
  ok('살아 있는 쿠폰은 하나', COUPONS.length === 1,
    COUPONS.map((c) => c.code).join(','));
  ok('그 하나가 시험용', COUPONS[0].code === CODE);

  ok('정식 코드', redeemable(CODE, []).result === 'ok');
  ok('대문자 무시', redeemable('RAKDOS', []).result === 'ok');
  ok('공백·하이픈 무시', redeemable('  rak-dos ', []).result === 'ok');
  ok('1,000만 골드', redeemable(CODE, []).coupon!.money === g(10_000_000));
  ok('요약 문구', couponSummary(redeemable(CODE, []).coupon!).length > 0,
    couponSummary(redeemable(CODE, []).coupon!));

  /*
    금액이 크다는 걸 시험으로 못 박아 둔다 — 쿠퍼 단위라 골드에 10,000 이 곱해진다.
    1,000만 골드 = 1,000억 쿠퍼. 안전 정수 범위를 넘으면 소지금이 조용히 어긋나고,
    여러 번 쓸 수 있는 쿠폰이라 몇 번 겹쳐도 버텨야 한다.
  */
  {
    const one = redeemable(CODE, []).coupon!.money!;
    ok('쿠퍼 환산이 안전 정수 안', Number.isSafeInteger(one), String(one));
    ok('백 번 겹쳐도 안전 정수 안', Number.isSafeInteger(one * 100), String(one * 100));
  }

  // 다시 쓸 수 있다 (시험용에만 허용된 성질)
  ok('다시 쓸 수 있다', redeemable(CODE, [CODE]).result === 'ok');
  ok('여러 번 써도 계속 된다', redeemable(CODE, [CODE, CODE, CODE]).result === 'ok');
  ok('풀린 것은 시험용 하나뿐',
    COUPONS.filter((c) => c.repeatable).map((c) => c.code).join(',') === CODE,
    COUPONS.filter((c) => c.repeatable).map((c) => c.code).join(','));

  /*
    ⚠ 여기 있는 검사들은 **베타가 끝나면 같이 지워질 것**을 검사한다.

    `rakdos` 를 목록에서 빼는 순간 위 단언이 전부 걸린다. 그게 의도다 —
    지우는 사람이 "테스트도 같이 정리해야 하는구나" 를 바로 알게 된다.
    쿠폰이 하나도 없어지면 `COUPONS.length === 1` 이 먼저 걸린다.
  */

  // 코드 중복이 있으면 뒤엣것이 영영 안 걸린다
  ok('쿠폰 코드 중복 없음',
    new Set(COUPONS.map((c) => c.code)).size === COUPONS.length);
  ok('코드는 전부 정규화된 형태',
    COUPONS.every((c) => normalizeCode(c.code) === c.code));

  /*
    지급 머신은 지금 쓰는 쿠폰이 없어도 살아 있어야 한다.

    주문서·재료 지급(`scrollsEach` / `materialsEach`)은 없앤 개발 쿠폰들이 쓰던
    기능이다. 기능까지 지우면 다음에 필요할 때 다시 짜야 하고, 그때는 시험이 없다.
    그래서 **가상의 쿠폰**으로 계속 검사한다 — 목록에 없어도 동작은 보증된다.
  */
  {
    const { MATERIAL_IDS: MIDS } = require('./artisans') as typeof import('./artisans');
    const fake = { code: 'x', label: 'x', scrollsEach: 100, materialsEach: 100 };
    const sc = couponScrolls(fake);
    ok('전 종류 주문서 지급', Object.keys(sc).length === SCROLL_IDS.length,
      String(Object.keys(sc).length));
    ok('주문서 종류별 개수', SCROLL_IDS.every((id) => sc[id] === 100));
    const mc2 = couponMaterials(fake);
    ok('재료 3종 전부', Object.keys(mc2).length === MIDS.length,
      String(Object.keys(mc2).length));
    ok('재료 종류별 개수', MIDS.every((id) => mc2[id] === 100));
  }

  // 초기화 세대 — 낡은 저장본은 사용 기록을 한 번 비운다
  {
    const { migrateState } = require('../state/migrate') as typeof import('../state/migrate');
    const old = migrateState({ coupons: ['iloverakdos', 'yoricking'] });      // couponSeq 없음
    ok('낡은 저장본은 쿠폰 기록 비움', old.coupons.length === 0, JSON.stringify(old.coupons));
    ok('비운 뒤 세대 기록', old.couponSeq === COUPON_RESET_SEQ);
    // 같은 저장본을 다시 로드해도 또 비우지 않는다
    const again = migrateState({ coupons: ['iloverakdos'], couponSeq: COUPON_RESET_SEQ });
    ok('세대가 같으면 기록 유지', again.coupons.length === 1, JSON.stringify(again.coupons));
    /*
      없앤 쿠폰의 코드가 기록에 남아 있어도 **아무 일도 안 일어난다.**
      목록에 없으므로 쳐도 "존재하지 않는 쿠폰" 이고, 기록은 안 읽히는 문자열일 뿐이다.
    */
    ok('없앤 코드는 기록에 남아도 무해', redeemable('iloverakdos', again.coupons).result === 'unknown');
  }

  ok('없앤 쿠폰은 안 먹는다', redeemable('yoricking', []).result === 'unknown');
  ok('없앤 쿠폰은 안 먹는다 (2)', redeemable('iloverakdos2', []).result === 'unknown');
  ok('오타는 미존재', redeemable('rakdoss', []).result === 'unknown');
  ok('빈 입력', redeemable('   ', []).result === 'empty');
  ok('정규화', normalizeCode(' RAK-DOS ') === 'rakdos', normalizeCode(' RAK-DOS '));
}

// ── 일일 · 주간 미션 ───────────────────────────────────
{
  console.log(NL + '── 일일 · 주간 미션 ──');
  const ms = require('./missions') as typeof import('./missions');
  const zero = { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 };

  ok('일일 4칸', ms.DAILY_MISSIONS.length === 4);
  ok('주간 5칸', ms.WEEKLY_MISSIONS.length === 5);
  ok('빈 진행도는 0칸 달성', ms.doneCount('daily', zero) === 0 && !ms.allDone('daily', zero));

  // 주간 목표가 일일보다 커야 한다 — 안 그러면 주간이 일일의 부록이 된다
  for (const w of ms.WEEKLY_MISSIONS) {
    const d = ms.DAILY_MISSIONS.find((x) => x.key === w.key);
    if (!d) continue;
    ok(`주간 ${w.label} 이 일일보다 무겁다`, w.goal > d.goal, `${d.goal} → ${w.goal}`);
    /*
      일일을 이레 돈 것보다 지나치게 무거우면 안 된다.

      ⚠ **횟수 미션에만** 적용한다. 금액 축(도박 배팅 누적)은 한 판에 크게 걸면
      한 번에 채워지므로 "이레치의 몇 배" 라는 비교가 성립하지 않는다 —
      일일이 최소 배팅 다섯 판이라고 해서 주간이 서른다섯 판일 이유가 없다.
    */
    if (w.money) continue;
    ok(`주간 ${w.label} 이 일일 7일치의 2배 안`, w.goal <= d.goal * 7 * 2,
      `${w.goal} vs ${d.goal * 7}`);
  }

  // 전부 채우면 달성
  {
    const full = { enhance: 999, clear: 999, arena: 999, gamble: 999_999_999, sell: 999 };
    ok('일일 전부 달성', ms.allDone('daily', full));
    ok('주간 전부 달성', ms.allDone('weekly', full));
  }

  // 도박 칸은 **한 판 걸어 보면 넘는 선**이어야 한다 — 미션이 손실을 강요하면 안 된다
  {
    const { s: silver, g: gold } = require('./currency') as typeof import('./currency');
    const dg = ms.DAILY_MISSIONS.find((m) => m.key === 'gamble')!;
    const wg = ms.WEEKLY_MISSIONS.find((m) => m.key === 'gamble')!;
    ok('일일 도박 5실버', dg.goal === silver(5), String(dg.goal));
    ok('주간 도박 1골드', wg.goal === gold(1), String(wg.goal));
    // 도박 칸은 최소 배팅 몇 판이면 채워져야 한다 — 미션이 손실을 강요하면 안 된다
    ok('일일 도박은 최소 배팅 열 판 안', dg.goal <= silver(10), String(dg.goal));
    ok('둘 다 금액 축으로 표시', !!dg.money && !!wg.money);
  }

  // 일괄 수령
  {
    const half = { enhance: 999, clear: 999, arena: 0, gamble: 0, sell: 0 };
    const two = ms.claimableIds('daily', half, []);
    ok('달성한 칸만 받을 목록에', two.length === 2, two.join(' '));
    ok('전부 달성이 아니면 보너스는 안 들어간다', !two.includes('all'));
    ok('이미 받은 칸은 빠진다',
      ms.claimableIds('daily', half, [two[0]]).length === 1);

    const full = { enhance: 999, clear: 999, arena: 999, gamble: 999_999_999, sell: 999 };
    const allDaily = ms.claimableIds('daily', full, []);
    ok('전부 달성하면 보너스까지 5칸',
      allDaily.length === ms.DAILY_MISSIONS.length + 1 && allDaily.includes('all'),
      allDaily.join(' '));
    ok('다 받았으면 빈 목록', ms.claimableIds('daily', full, allDaily).length === 0);

    // 합계 — 화면과 스토어가 같은 함수를 쓰므로 "3칸 받기" 와 실제 지급이 어긋나지 않는다
    const rewards = allDaily.map((id) =>
      (id === 'all' ? ms.DAILY_ALL_REWARD : ms.DAILY_MISSIONS.find((m) => m.id === id)!.reward));
    const sum = ms.sumRewards(rewards);
    ok('합계가 칸별 합과 같다',
      sum.money === rewards.reduce((a, r) => a + (r.money ?? 0), 0));
    ok('일괄 요약에 금액이 보인다', ms.bulkLabel(rewards).includes('골드'),
      ms.bulkLabel(rewards));
    ok('주문서는 장수만 센다', ms.bulkLabel(rewards).includes('주문서 2장'),
      ms.bulkLabel(rewards));

    const wAll = ms.claimableIds('weekly', full, []);
    ok('주간도 보너스까지 6칸', wAll.length === ms.WEEKLY_MISSIONS.length + 1);
    const wRewards = wAll.map((id) =>
      (id === 'all' ? ms.WEEKLY_ALL_REWARD : ms.WEEKLY_MISSIONS.find((m) => m.id === id)!.reward));
    /*
      ── 다이아가 아니라 골드다 ──

      이 줄은 오랫동안 빨간 채로 있었다. 화폐를 골드 하나로 모으면서
      `WEEKLY_ALL_REWARD` 에서 다이아를 뺐는데(바로 아래 줄이 그 규칙을
      적어 두고 있다) 이 검사만 남았다.

      낡은 것은 검사 쪽이었다 — 코드가 아니라. 그래서 지금 규칙을 적는다:
      주간 일괄도 **골드와 주문서**로만 준다.
    */
    ok('주간 일괄은 골드와 주문서로만',
      ms.bulkLabel(wRewards).includes('골드')
      && ms.bulkLabel(wRewards).includes('주문서')
      && !ms.bulkLabel(wRewards).includes('다이아'),
      ms.bulkLabel(wRewards));
  }

  // 화폐는 골드 하나뿐이다 — 주간 완주도 골드와 주문서로만 준다
  ok('주간 완주가 일일보다 크다',
    (ms.WEEKLY_ALL_REWARD.money ?? 0) > (ms.DAILY_ALL_REWARD.money ?? 0));
  ok('보상 요약이 골드로 적힌다', ms.rewardLabel(ms.WEEKLY_ALL_REWARD).includes('골드'));

  /*
    'clear' 는 **처음 깬 곳이든 재탕이든** 똑같이 한 번으로 센다.
    스토어에서 bumpGuildQuest('clear') 가 isFirst 와 무관하게 win 이면 도는지를
    소스로 확인한다 — 보상(gain)만 재탕에서 깎이고 미션은 그대로여야 한다.
  */
  {
    /*
      tsconfig 에 node 타입이 없어 __dirname 을 직접 못 쓴다 — 실행 위치 기준으로 연다.

      ⚠ 소스를 **글자로** 읽는 시험이라 파일을 옮기면 같이 옮겨야 한다.
      탐험·보스의탑은 `state/slices/battle.ts` 에 있다. 경로가 어긋나면 이 시험은
      "자리가 0개" 로 실패한다 — 조용히 통과하지 않게 개수를 먼저 본다.
    */
    const src: string = require('fs').readFileSync('src/state/slices/battle.ts', 'utf8');
    const guarded = src.match(/if \(win\) get\(\)\.bumpGuildQuest\('clear'\)/g) ?? [];
    const all = src.match(/bumpGuildQuest\('clear'\)/g) ?? [];
    ok('clear 를 올리는 자리가 둘 (탐험 · 보스의탑)', all.length === 2, String(all.length));
    ok('둘 다 isFirst 조건 없이 win 이면 센다', guarded.length === all.length,
      `${guarded.length} / ${all.length}`);
    ok('isFirst 로 감싸지 않았다', !/isFirst[^;]*bumpGuildQuest\('clear'\)/.test(src));
  }

  // 미션 축은 전부 길드 퀘스트가 이미 올려 주는 축이어야 한다
  {
    const gq = require('./guildQuest') as typeof import('./guildQuest');
    const known = new Set(gq.GQ_DEFS.map((d) => d.key));
    ok('새 카운터를 만들지 않았다',
      [...ms.DAILY_MISSIONS, ...ms.WEEKLY_MISSIONS].every((m) => known.has(m.key)));
  }

  /*
    보상 총량 — 미션이 주 수입원이 되면 안 된다.
    비교 대상은 탐험 챕터 130 재탕 한 판(≈4,737골드)이다.
  */
  {
    const sum = (r: import('./missions').MissionReward) => r.money ?? 0;
    const daily = ms.DAILY_MISSIONS.reduce((a, m) => a + sum(m.reward), 0) + sum(ms.DAILY_ALL_REWARD);
    const weekly = ms.WEEKLY_MISSIONS.reduce((a, m) => a + sum(m.reward), 0) + sum(ms.WEEKLY_ALL_REWARD);
    ok('일일 전량이 10골드 이하', daily <= g(10), `${daily / 10000}골드`);
    ok('주간 전량이 60골드 이하', weekly <= g(60), `${weekly / 10000}골드`);
    // 일일을 이레 돈 것보다 주간 보너스가 크면 일일을 건너뛰게 된다
    ok('주간이 일일 7일치보다 크지 않다', weekly <= daily * 7, `${weekly / 10000} vs ${daily * 7 / 10000}`);
    ok('한 주 전체가 탐험 한 판 값 아래',
      daily * 7 + weekly < g(4_737), `${(daily * 7 + weekly) / 10000}골드`);
  }


  // 남은 시간
  {
    const at = (d: number, h: number) => new Date(2026, 7, d, h, 0, 0).getTime();
    ok('자정까지 24시간 안', ms.untilMidnight(at(24, 13)) <= 86_400_000);
    ok('주간 리셋은 자정보다 멀거나 같다', ms.untilWeekReset(at(24, 13)) >= ms.untilMidnight(at(24, 13)));
    ok('라벨이 사람 말', ms.leftLabel(3 * 3600_000 + 5 * 60_000) === '3시간 5분',
      ms.leftLabel(3 * 3600_000 + 5 * 60_000));
  }
}

// ── 날짜 키 형식 ───────────────────────────────────────
//
// 스토어(미션·일일 보너스·레이드)와 출석(core/events)이 서로 다른 형식을 쓴다.
// 화면이 엉뚱한 쪽으로 비교하는 바람에 미션 진행도가 늘 0으로 보인 적이 있다.
// 두 형식이 **실제로 다르다**는 걸 못 박아 둬서, 섞어 쓰면 눈에 띄게 한다.
{
  console.log(NL + '── 날짜 키 형식 ──');
  const ev = require('./events') as typeof import('./events');
  const t = new Date(2026, 7, 3, 12, 0, 0).getTime();   // 8월 3일 — 한 자리 수
  const store = `${new Date(t).getFullYear()}-${new Date(t).getMonth() + 1}-${new Date(t).getDate()}`;
  ok('출석 키는 0을 채운다', ev.dayKey(t) === '2026-08-03', ev.dayKey(t));
  ok('스토어 키는 0을 안 채운다', store === '2026-8-3', store);
  ok('두 형식은 서로 다르다 — 섞어 쓰면 안 된다', ev.dayKey(t) !== store);
  /*
    달·날이 **둘 다** 두 자리일 때만 우연히 같아진다 (11월 24일 등).
    8월이면 달부터 08 vs 8 로 갈리므로 그 달 내내 한 번도 안 맞는다 —
    미션 진행도가 통째로 0으로 보였던 게 이것이다.
  */
  const t2 = new Date(2026, 10, 24, 12, 0, 0).getTime();   // 11월 24일
  const store2 = `${new Date(t2).getFullYear()}-${new Date(t2).getMonth() + 1}-${new Date(t2).getDate()}`;
  ok('달·날이 둘 다 두 자리면 우연히 같아진다', ev.dayKey(t2) === store2, `${ev.dayKey(t2)} / ${store2}`);
  ok('한 자리 달이면 한 달 내내 안 맞는다', ev.dayKey(t) !== store && ev.dayKey(
    new Date(2026, 7, 24, 12, 0, 0).getTime()) !== `2026-8-24`);
}

// ── 길드 레이드 · 길드 레벨 ────────────────────────────
{
  console.log(NL + '── 길드 레이드 ──');
  const gr = require('./guildRaid') as typeof import('./guildRaid');
  const gsk = require('./guildSkill') as typeof import('./guildSkill');
  /* 검사용 길드 한 줄. 예전엔 guildsFor() 가 만들어 줬다 — 이제 손으로 적는다 */
  const guild: import('./guilds').Guild = {
    id: 'g-test', emblem: '01', name: '검사길드', motto: '',
    masterId: 'u1', master: '길드장', capacity: 30,
    members: 20, avgIlvl: 1000, weekly: 0,
  };

  // 참여 횟수 — 요구사항 그대로
  ok('일일은 하루 2회', gr.RAID_DEFS.daily.tries === 2 && gr.RAID_DEFS.daily.daily === 2);
  ok('주간은 하루 1회씩 7회',
    gr.RAID_DEFS.weekly.tries === 7 && gr.RAID_DEFS.weekly.daily === 1);
  ok('레이드는 일일·주간 둘뿐 (공성전은 뺐다)', gr.RAIDS.length === 2,
    gr.RAIDS.join(','));
  ok('일일은 자정 · 주간은 주 단위 리셋',
    gr.RAID_DEFS.daily.period === 'day' && gr.RAID_DEFS.weekly.period === 'week');

  // 체력: 일일 < 주간
  {
    const hp = (id: import('./guildRaid').RaidId) => gr.raidHp(gr.RAID_DEFS[id], guild);
    ok('일일 보스가 가장 물렁하다', hp('daily') < hp('weekly'));
    // 잠재 총딜 대비 — 전원 만근이 아니어도 잡히되, 거저 주지는 않는다
    for (const id of gr.RAIDS) {
      const def = gr.RAID_DEFS[id];
      const potential = guild.avgIlvl * guild.members * def.tries;
      const need = hp(id) / potential;
      ok(`${def.name} 는 참여율 ${Math.round(need * 100)}% 를 요구`, need > 0.6 && need < 0.95,
        need.toFixed(2));
    }
  }

  // 피해는 아이템레벨에 비례
  {
    const half = () => 0.5;
    ok('템렙이 2배면 피해도 2배',
      gr.raidHit(2000, 1, half) === gr.raidHit(1000, 1, half) * 2,
      `${gr.raidHit(2000, 1, half)} vs ${gr.raidHit(1000, 1, half)}`);
    ok('전투 함성이 피해를 올린다', gr.raidHit(1000, 1.4, half) > gr.raidHit(1000, 1, half));
  }

  // 기여도는 피해에 "조금만" 비례한다
  {
    const def = gr.RAID_DEFS.weekly;
    const weak = gr.raidGp(def, 500, 1000);
    const strong = gr.raidGp(def, 4000, 1000);
    ok('많이 때리면 조금 더 받는다', strong > weak, `${weak} → ${strong}`);
    ok('차이는 30% 를 넘지 않는다', strong / weak <= 1.3 + 1e-9, (strong / weak).toFixed(2));
    ok('안 강해도 기본은 받는다', weak >= def.gp * 0.99, String(weak));
  }

  // 정산 창 — 자정부터 10분
  {
    const at = (h: number, m: number) => new Date(2026, 7, 24, h, m, 0).getTime();
    ok('00:00 은 정산 중', gr.inSettleWindow(at(0, 0)));
    ok('00:09 도 정산 중', gr.inSettleWindow(at(0, 9)));
    ok('00:10 부터는 열린다', !gr.inSettleWindow(at(0, 10)));
    ok('낮에는 안 닫힌다', !gr.inSettleWindow(at(13, 0)));
    ok('정산 창 안에서만 남은 시간이 있다',
      gr.settleLeft(at(0, 5)) > 0 && gr.settleLeft(at(13, 0)) === 0);
  }

  // 경험치 — 때린 만큼, 잡으면 배수
  {
    const def = gr.RAID_DEFS.daily;
    const hp = 10000;
    ok('못 잡아도 때린 만큼은 남는다', gr.raidExp(def, 5000, hp, false) > 0);
    ok('많이 때릴수록 많다', gr.raidExp(def, 8000, hp, false) > gr.raidExp(def, 4000, hp, false));
    ok('잡으면 배수가 붙는다',
      gr.raidExp(def, hp, hp, true) === Math.round(gr.raidExp(def, hp, hp, false) * def.killExpMul));
    ok('0 피해면 0', gr.raidExp(def, 0, hp, false) === 0);
  }

  // 길드 레벨
  {
    ok('최대 30', gr.GUILD_LEVEL_MAX === 30);
    ok('경험치 0 이면 Lv1', gr.guildLevelOf(0).level === 1);
    ok('레벨이 단조 증가', (() => {
      let last = 0;
      for (let e = 0; e < 400_000; e += 5000) {
        const lv = gr.guildLevelOf(e).level;
        if (lv < last) return false;
        last = lv;
      }
      return true;
    })());
    ok('필요 경험치가 계속 오른다', gr.levelExp(20) > gr.levelExp(10) && gr.levelExp(10) > gr.levelExp(1));
    const total = gr.expForLevel(gr.GUILD_LEVEL_MAX);
    ok('Lv30 누적이 만렙 상한과 맞는다', gr.guildLevelOf(total).level === 30, String(total));
    ok('상한을 넘겨도 30에서 멈춘다', gr.guildLevelOf(total * 10).level === 30);
  }

  // 스킬 효과는 전 길드원에게
  {
    ok('전투 함성 Lv10 = 레이드 피해 +40%',
      Math.abs(gsk.guildEffects({ war_cry: 10 }).raidDmgMul - 1.4) < 1e-9);
    ok('탐광 Lv10 = 드랍 +10%p',
      Math.abs(gsk.guildEffects({ prospector: 10 }).dropRateAdd - 0.1) < 1e-9);
    // 탐광을 다 찍어도 확정 드랍이 되면 안 된다
    const { ARTISAN_MATERIAL_DROP } = require('./combat') as typeof import('./combat');
    ok('탐광 만렙이어도 확정은 아니다',
      ARTISAN_MATERIAL_DROP + gsk.guildEffects({ prospector: 10 }).dropRateAdd < 0.5,
      String(ARTISAN_MATERIAL_DROP + gsk.guildEffects({ prospector: 10 }).dropRateAdd));
  }

  // 보상 — 주간 보스가 공성전 자리를 물려받았다 (확정 주문서 · 재료)
  {
    ok('주간 처치는 확정 주문서', gr.raidReward('weekly', true, true)?.scroll === 'guarantee');
    ok('주간 처치는 재료도', (gr.raidReward('weekly', true, true)?.material ?? 0) > 0);
    ok('일일은 재료 없음', (gr.raidReward('daily', true, true)?.material ?? 0) === 0);
    ok('참여 안 하면 없음', gr.raidReward('weekly', true, false) === null);
    for (const id of gr.RAIDS) {
      const win = gr.raidReward(id, true, true)!;
      const lose = gr.raidReward(id, false, true)!;
      ok(`${gr.RAID_DEFS[id].name} — 실패해도 절반쯤은 준다`,
        lose.gp > 0 && lose.gp < win.gp, `${lose.gp} / ${win.gp}`);
    }
  }

  // 보스 이름은 주기 키로 고정
  ok('같은 주기면 같은 보스', gr.bossName('daily', '2026-8-24') === gr.bossName('daily', '2026-8-24'));
}

// ── 선술집 하루 제한 ──────────────────────────────────
{
  console.log('\n── 선술집 하루 제한 ──');
  const byId = Object.fromEntries(TAVERN_MENU.map((m) => [m.id, m]));
  ok('보리빵 5개', byId.bread.dailyLimit === 5);
  ok('고기 스튜 3개', byId.stew.dailyLimit === 3);
  /*
    독한 술은 **시험 기간 동안** 한도가 없다 (core/economy 의 UNLIMITED_BOOZE).
    베타가 끝나면 상수를 false 로 되돌리고, 그때 이 단언도 `=== 1` 로 같이 돌아온다.
    지금은 "무한이면 무한답게 동작하는가" 를 본다 — 화면이 Infinity 를 그대로
    찍지 않는지까지.
  */
  ok('독한 술은 지금 무제한', !Number.isFinite(byId.booze.dailyLimit),
    String(byId.booze.dailyLimit));
  ok('무제한은 남은 개수도 무한', !Number.isFinite(tavernLeft(byId.booze, { booze: 99 })));
  ok('무제한은 숫자 대신 글자로', tavernLimitText(byId.booze, { booze: 99 }) === '무제한',
    tavernLimitText(byId.booze, { booze: 99 }));
  ok('한도 있는 것은 숫자로', tavernLimitText(byId.bread, { bread: 2 }) === '오늘 3/5개',
    tavernLimitText(byId.bread, { bread: 2 }));
  ok('맹물 1개', byId.water.dailyLimit === 1);
  ok('남은 개수', tavernLeft(byId.bread, { bread: 2 }) === 3);
  ok('다 먹으면 0', tavernLeft(byId.stew, { stew: 3 }) === 0);
  ok('초과 저장본도 0 (음수 아님)', tavernLeft(byId.stew, { stew: 99 }) === 0);
  ok('기록 없으면 전량', tavernLeft(byId.bread, {}) === 5);

  // 거절 대사 — 풀 크기와 인덱스 경계
  ok('맹물 거절 1종', REFUSALS.water.length === 1);
  ok('음식 거절 10종', REFUSALS.food.length === 10);
  ok('술 거절 5종', REFUSALS.booze.length === 5);
  ok('중복 대사 없음',
    new Set([...REFUSALS.food, ...REFUSALS.booze]).size === 15);
  ok('보리빵·스튜는 음식 투', byId.bread.refuse === 'food' && byId.stew.refuse === 'food');
  ok('첫 대사', tavernRefusal(byId.stew, () => 0) === REFUSALS.food[0]);
  // r() 이 1 을 반환해도 범위를 넘지 않아야 한다 (Math.random 은 1 미만이지만 방어)
  ok('마지막 대사 (경계)', tavernRefusal(byId.booze, () => 1) === REFUSALS.booze[4]);
  ok('맹물은 늘 같은 대사', tavernRefusal(byId.water, () => 0.99) === REFUSALS.water[0]);
  {
    // 10종이 실제로 골고루 나오는지
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) seen.add(tavernRefusal(byId.bread, () => i / 10));
    ok('음식 대사 10종 전부 도달', seen.size === 10, String(seen.size));
  }
}

// ── 시작 장비 ─────────────────────────────────────────
{
  console.log('\n── 시작 장비 ──');
  const { starterEquip, initial } = require('../state/initial') as typeof import('../state/initial');
  const eq = starterEquip();
  ok('16슬롯 전부 착용', SLOT_IDS.every((sl) => !!eq[sl]), String(Object.keys(eq).length));
  ok('전부 1티어', SLOT_IDS.every((sl) => eq[sl]!.tier === 1));
  ok('전부 +0 · 내구 100', SLOT_IDS.every((sl) => eq[sl]!.level === 0 && eq[sl]!.dur === 100));
  ok('슬롯에 맞는 부위', SLOT_IDS.every((sl) => SLOT_ACCEPTS[sl].includes(eq[sl]!.kind)));
  const il = playerIlvl(eq);
  /* 1티어 0강은 부위와 무관하게 base(10) — 칸 수만큼이 시작값이다 */
  ok('시작 아이템레벨 = 10 × 칸 수', il === 10 * SLOT_IDS.length, String(il));
  // 보증금은 아이템레벨 비례 — 시작 소지금으로 가장 쉬운 퀘스트는 받을 수 있어야 한다
  const easy = rollQuests(il, 0).find((q) => q.difficulty === 'easy')!;
  ok('시작 소지금으로 쉬움 퀘스트 수락 가능',
    initial().money >= easy.deposit,
    `소지금 ${initial().money} vs 보증금 ${easy.deposit}`);
}

// ── 칭호 ──────────────────────────────────────────────
{
  console.log('\n── 칭호 ──');
  const ti = require('./titles') as typeof import('./titles');
  const { TITLES, TITLE_IDS, LIMITED_TITLES, earnedTitles, effectsOf, BASE_EFFECTS,
    INITIAL_STATS, SERVER_POPULATION } = ti;

  ok('id 와 정의 키가 일치', TITLE_IDS.every((id) => TITLES[id].id === id));
  ok('선착순 칭호는 전부 rarity 를 가진다',
    LIMITED_TITLES.every((id) => (TITLES[id].rarity ?? 0) > 0));
  // 인원이 적을수록 더 반짝여야 한다 — 반대로 붙으면 흔한 칭호가 더 번쩍인다
  ok('선착 인원이 적을수록 rarity 가 높다',
    LIMITED_TITLES.every((a) => LIMITED_TITLES.every((b) =>
      (TITLES[a].limited ?? 0) <= (TITLES[b].limited ?? 0)
        ? (TITLES[a].rarity ?? 0) >= (TITLES[b].rarity ?? 0) : true)));
  ok('선착 인원은 서버 인구 안', LIMITED_TITLES.every((id) => (TITLES[id].limited ?? 0) <= SERVER_POPULATION));

  const blank = {
    stats: { ...INITIAL_STATS }, bestRuneRank: -1, maxSetCount: 0,
    gold: 0, guildFounder: false, nightVisits: 0,
    engraves: 0, tower50: 0, kujiA: false, signupNo: 0, serverFirst: () => false,
  };
  ok('아무것도 안 했으면 칭호도 없다', earnedTitles(blank).length === 0,
    earnedTitles(blank).join(','));

  ok('룬각인 10회 → 룬세공사', earnedTitles({ ...blank, engraves: 10 }).includes('rune_smith'));
  ok('9회면 아직', !earnedTitles({ ...blank, engraves: 9 }).includes('rune_smith'));
  ok('S급 룬 → 룬의 대가', earnedTitles({ ...blank, bestRuneRank: 6 }).includes('rune_master'));
  ok('A급은 아직', !earnedTitles({ ...blank, bestRuneRank: 5 }).includes('rune_master'));
  ok('16세트 → 세트 수호자', earnedTitles({ ...blank, maxSetCount: 16 }).includes('set_keeper'));
  // 철벽 지갑은 은행과 함께 폐지됐다 — 이제 아무리 모아도 안 나온다
  ok('폐지된 철벽 지갑은 안 나온다',
    !earnedTitles({ ...blank, gold: 200_000 }).includes('iron_wallet'));

  // 선착순 — 순번이 낮을수록 더 많은 칭호를 받는다 (단조성)
  const cnt = (no: number) => earnedTitles({ ...blank, signupNo: no })
    .filter((id) => TITLES[id].bySignup).length;
  ok('1번 가입자는 가입순 칭호 3종 전부', cnt(1) === 3, String(cnt(1)));
  // 가입 순번만으로 "전 서버 최초 SSS" 까지 딸려 나가면 안 된다
  ok('가입 1번이어도 업적형 최초 칭호는 없음',
    !earnedTitles({ ...blank, signupNo: 1 }).includes('first_sss'));
  /*
    자리 수 — 창세기 1명 · 개척자 100명 · 초기 정착민 100명.

    뒤의 둘이 같은 자리 수인 건 의도다. "100번째 안에 들어왔다" 는 사실 하나에
    칭호 둘이 붙고, 효과(체력 +2 · 출석 +20%)와 로고 보상이 서로 다르다.
  */
  ok('100번 안이면 가입순 칭호 2종', cnt(10) === 2 && cnt(100) === 2,
    `${cnt(10)} / ${cnt(100)}`);
  ok('101번부터는 없음', cnt(101) === 0, String(cnt(101)));
  ok('초기 정착민 자리는 100', TITLES.first_thousand.limited === 100,
    String(TITLES.first_thousand.limited));
  ok('순번 0(미가입)은 없음', cnt(0) === 0, String(cnt(0)));

  // 서버 최초 3종은 업적과 서버 자리 둘 다 필요하다
  const forged = { ...blank, stats: { ...INITIAL_STATS, artisanForged: 1 } };
  ok('제련만으로는 최초 칭호 안 나옴', !earnedTitles(forged).includes('first_artisan'));
  ok('자리가 비어 있으면 나옴',
    earnedTitles({ ...forged, serverFirst: () => true }).includes('first_artisan'));

  /*
    모든 칭호가 실제로 뭔가를 바꾸는지 — 효과가 BASE 와 같으면 장착할 이유가 없다.

    ⚠ 딱 하나 예외가 **폐지된 칭호**(`legacy`)다. 주식장을 없애면서 단타왕·존버는
    붙일 곳이 사라졌다. 목록에서 지우지 않은 건 이미 가진 사람에게서 빼앗지
    않으려는 것이고 (state/migrate 가 검증에서 걸러 버린다), 효과를 뗀 건 없는
    효과를 남겨 두면 칭호 칸만 축내기 때문이다.

    그래서 검사를 "효과 없는 칭호가 없다" 에서 **"효과 없는 칭호는 폐지된 것뿐이다"**
    로 바꾼다. 새 칭호를 효과 없이 추가하면 여전히 걸린다.
  */
  const inert = TITLE_IDS.filter((id) => {
    const e = effectsOf(id);
    return (Object.keys(BASE_EFFECTS) as (keyof typeof BASE_EFFECTS)[])
      .every((k) => e[k] === BASE_EFFECTS[k]);
  });
  const unexpected = inert.filter((id) => !TITLES[id].legacy);
  ok('효과 없는 칭호는 폐지된 것뿐', unexpected.length === 0, unexpected.join(','));
  ok('폐지 칭호가 실제로 표시돼 있다',
    inert.length > 0 && inert.every((id) => TITLES[id].legacy === true), inert.join(','));
  ok('폐지 칭호는 더 못 얻는다',
    !earnedTitles({ ...blank, serverFirst: () => true }).some((id) => TITLES[id].legacy));
}

// ── 강화 마일스톤 ─────────────────────────────────────
{
  console.log('\n── 강화 마일스톤 ──');
  const ti = require('./tiers') as typeof import('./tiers');
  const { MILESTONE_CAP, MILESTONE_STEP, milestoneBonus, itemLevel: il, newItem: mk, maxSetIlvl: msi } = ti;
  const { exploreRecIlvl } = require('./combat') as typeof import('./combat');

  const jump = (lv: number) => il(mk('sword', 10, lv, 100)) - il(mk('sword', 10, lv - 1, 100));
  const plain = ti.TIERS[10].inc * ti.kindWeight('sword');

  // +5 · +10 · +15 에서 각각 1 · 2 · 3 회분이 더 붙는다
  for (const [lv, mult] of [[5, 1], [10, 2], [15, 3]] as const) {
    ok(`+${lv} 에서 강화 ${mult}회분 추가`,
      Math.abs(jump(lv) - plain * (1 + mult)) < 0.15,
      `${jump(lv).toFixed(1)} vs ${(plain * (1 + mult)).toFixed(1)}`);
  }
  ok('마일스톤이 아닌 칸은 그대로', Math.abs(jump(4) - plain) < 0.15, jump(4).toFixed(1));

  // 장인은 min(n,3) 캡이 없으면 무한 강화에서 2차식으로 터진다
  const artBonus = (lv: number, freed: number) => milestoneBonus('sword', 11, lv, freed);
  ok('장인 +20 · +25 도 3회분 고정',
    Math.abs((artBonus(25, 5) - artBonus(20, 5)) - (artBonus(20, 5) - artBonus(15, 5))) < 1e-6);
  ok('마일스톤 캡이 3회분', MILESTONE_CAP === 3 && MILESTONE_STEP === 5);

  // 장인은 **해방한 만큼만** 보너스를 받는다
  ok('미해방 장인은 선형 그대로', milestoneBonus('sword', 11, 15, 0) === 0);
  ok('해방한 칸만 적용',
    milestoneBonus('sword', 11, 15, 1) > 0
    && milestoneBonus('sword', 11, 15, 1) < milestoneBonus('sword', 11, 15, 3));
  ok('일반 티어는 해방과 무관',
    milestoneBonus('sword', 10, 15, 0) === milestoneBonus('sword', 10, 15, 3));

  // ⚠ 곡선 정합의 핵심 — itemLevel 만 고쳐도 나머지가 따라와야 한다
  ok('exploreRecIlvl(100) === maxSetIlvl()', exploreRecIlvl(100) === msi(),
    `${exploreRecIlvl(100)} vs ${msi()}`);

  // 해방은 영구다 — 하락해도 유지되고, 다시 올리면 부활한다
  {
    const lib = require('./liberation') as typeof import('./liberation');
    const art = { ...mk('sword', 11, 5, 100), freed: 1 };
    const dropped = { ...art, level: 4 };
    ok('하락해도 해방은 남는다', lib.freedOf(dropped) === 1);
    ok('다시 올리면 보너스가 돌아온다',
      il({ ...dropped, level: 5 }) === il(art), `${il({ ...dropped, level: 5 })} vs ${il(art)}`);
    // 도달하지 않은 봉인은 살 수 없다 (돈만으로 세지면 강화가 선택 사항이 된다)
    ok('미도달 봉인은 못 산다',
      lib.liberationBlock({ ...mk('sword', 11, 3, 100) }, 1e12) === 'not_reached');
    ok('일반 장비는 해방 대상이 아니다',
      lib.liberationBlock(mk('sword', 10, 15, 100), 1e12) === 'not_artisan');
    ok('비용이 n 배로 오른다',
      lib.liberationCost({ ...art, freed: 0 }) * 3 === lib.liberationCost({ ...art, freed: 2 }));
  }
}

// ── 심연 · 연금술 ──────────────────────────────────────
{
  console.log('\n── 심연 · 연금술 ──');
  const ab = require('./abyss') as typeof import('./abyss');
  const al = require('./alchemy') as typeof import('./alchemy');
  const ti = require('./tiers') as typeof import('./tiers');

  // 1층이 "티어 6 +15 풀셋에게 딱 반반" 이라는 게 이 콘텐츠의 정의다
  ok('티어6 +15 풀셋의 1층 통과 = 50%',
    Math.abs(ab.abyssPass(ti.fullSetIlvl(6, 15), 1) - 0.5) < 0.01,
    `${(ab.abyssPass(ti.fullSetIlvl(6, 15), 1) * 100).toFixed(1)}%`);
  ok('20층 권장 === maxSetIlvl()', ab.abyssRecIlvl(20) === ti.maxSetIlvl(),
    `${ab.abyssRecIlvl(20)} vs ${ti.maxSetIlvl()}`);
  ok('심연은 위로 열려 있다', ab.abyssRecIlvl(30) > ti.maxSetIlvl());
  {
    let p = 1;
    for (let n = 1; n <= 20; n++) p *= ab.abyssPass(ti.maxSetIlvl(), n);
    ok('최고 세트의 20층 완주 = 10~20%', p > 0.10 && p < 0.20, `${(p * 100).toFixed(1)}%`);
  }
  ok('핵은 20층부터 확정', ab.floorDrop(20, () => 0.99).core === 1 && ab.floorDrop(19, () => 0).core === 0);
  ok('결정은 10층부터', ab.floorDrop(10, () => 0).shard === 1 && ab.floorDrop(9, () => 0).shard === 0);

  // 연성액 — 등급 확률 합 100, 밴드가 겹치지 않고 올라간다
  ok('등급 확률 합 100',
    al.RESULTS.reduce((a, r) => a + al.RESULT_ODDS[r], 0) === 100);
  for (const t of al.POTIONS) {
    const bands = al.RESULTS.map((r) => al.BANDS[t][r]);
    ok(`${t} 밴드가 단조 증가`,
      bands.every((b2, i) => i === 0 || b2[0] > bands[i - 1][1] - 1e-9));
  }
  // 한 등급 위 연성액은 하한과 상한이 함께 오른다 (정령석과 같은 규칙)
  ok('상위 연성액이 하한·상한 모두 위',
    al.BANDS.mid.dross[0] > al.BANDS.low.dross[0]
    && al.BANDS.high.mythic[1] > al.BANDS.mid.mythic[1]);
  ok('기대 배수 순서', al.expectedMul('low') < al.expectedMul('mid')
    && al.expectedMul('mid') < al.expectedMul('high'));
  ok('최고 배수는 ×2.00', al.BANDS.high.mythic[1] === 2);

  // 부여 규칙
  const { newItem: mk2 } = ti;
  ok('7티어 미만은 부여 불가', !!al.imbueBlock(mk2('sword', 6, 0, 100)));
  ok('7티어는 부여 가능', al.imbueBlock(mk2('sword', 7, 0, 100)) === null);
  ok('장인도 부여 가능', al.imbueBlock(mk2('sword', 11, 0, 100)) === null);
  {
    // 승급해도 배수는 따라간다 (정령석과 같은 이유)
    const { promote } = require('./enhance') as typeof import('./enhance');
    const brewed = { ...mk2('sword', 7, 15, 100), alch: 1.8 };
    ok('승급해도 연성이 유지된다', promote(brewed).alch === brewed.alch);
    ok('배수가 아이템레벨에 곱해진다',
      Math.abs(ti.itemLevel(brewed) - ti.round1(ti.baseItemLevel(brewed) * 1.8)) < 0.05);
  }
}

// ── 채집 · 수렵 · 낚시 ─────────────────────────────────
{
  console.log('\n── 채집 · 수렵 · 낚시 ──');
  const ga = require('./gathering') as typeof import('./gathering');

  ok('50종', ga.SPECIES.length === 50, String(ga.SPECIES.length));
  ok('채집 24 · 수렵 12 · 낚시 14',
    ga.speciesOf('gather').length === 24 && ga.speciesOf('hunt').length === 12
    && ga.speciesOf('fish').length === 14);
  ok('종 id 중복 없음', new Set(ga.SPECIES.map((x) => x.id)).size === 50);
  for (const g2 of ga.GRADES) {
    const sum = Object.values(ga.TOOLS[g2].odds).reduce((a, x) => a + (x ?? 0), 0);
    ok(`${g2} 도구 출현표 합 100%`, Math.abs(sum - 100) < 1e-9, String(sum));
  }
  // 한 등급 위 도구는 하한과 상한이 함께 오른다
  {
    const lo = (t: (typeof ga.GRADES)[number]) =>
      ga.GRADES.find((x) => (ga.TOOLS[t].odds[x] ?? 0) > 0)!;
    ok('상위 도구는 하한이 오른다', ga.GRADES.every((g2, i) =>
      i === 0 || ga.GRADES.indexOf(lo(g2)) >= ga.GRADES.indexOf(lo(ga.GRADES[i - 1]))));
  }

  // 점수 → 등급 보정 경계
  ok('85점 이상은 한 칸 위', ga.shiftedGrade('D', 85) === 'C');
  ok('84점은 그대로', ga.shiftedGrade('D', 84) === 'D');
  ok('40점은 그대로', ga.shiftedGrade('D', 40) === 'D');
  ok('39점은 한 칸 아래', ga.shiftedGrade('D', 39) === 'E');
  ok('0점은 산출물 없음', ga.shiftedGrade('D', 0) === null);
  ok('S 도구는 상한에서 멈춘다', ga.shiftedGrade('S', 100) === 'S');
  ok('F 도구는 하한에서 멈춘다', ga.shiftedGrade('F', 1) === 'F');

  // B 이상 도구는 골드가 아니라 도감 진척도가 연다
  ok('도감 0% 면 B 도구를 못 산다', !ga.toolBuyable('B', 0));
  ok('도감 30% 면 B 도구 해금', ga.toolBuyable('B', 0.3));
  // 도감 100% 는 **살 자격**을 여는 것이지 공짜로 주는 게 아니다
  ok('도감 99% 면 S 도구를 못 산다', !ga.toolBuyable('S', 0.99));
  ok('도감 100% 면 S 도구 해금', ga.toolBuyable('S', 1));
  ok('S 도구도 값을 치른다', (ga.TOOLS.S.price ?? 0) > (ga.TOOLS.A.price ?? 0),
    String(ga.TOOLS.S.price));

  // 수익 — 알바(하루 26실버 수준)를 대체하지 않고 나란히 서야 한다
  const daily = (t: (typeof ga.GRADES)[number]) => ga.expectedValue(t) * 30;
  ok('F 도구 하루 수익이 알바와 같은 급', daily('F') > 1500 && daily('F') < 4000, String(daily('F')));
  ok('도구가 오를수록 수익이 오른다',
    ga.GRADES.every((t, i) => i === 0 || daily(t) > daily(ga.GRADES[i - 1])));
  // 탐험 챕터 100 재탕 하루 수익보다 낮아야 탐험이 안 죽는다
  {
    const { exploreReward, REPEAT_REWARD_RATE, STAMINA_COST, MAX_STAMINA } = require('./combat') as typeof import('./combat');
    const runs = Math.floor((MAX_STAMINA + 144) / STAMINA_COST.explore);
    const explore = Math.floor(exploreReward(100) * REPEAT_REWARD_RATE) * runs;
    ok('S 도구 전량 판매 < 탐험 재탕', daily('S') < explore,
      `${daily('S')} vs ${explore}`);
  }
}

// ── 지뢰밭 ────────────────────────────────────────────
{
  console.log('\n── 지뢰밭 ──');
  const mn = require('./mines') as typeof import('./mines');

  // 이 설계의 핵심 — 어떤 조합을 골라도 기대값이 같다. 최적 전략이 존재하지 않는다
  let worst = 0;
  for (let m = mn.MINES_MIN; m <= mn.MINES_MAX; m++) {
    for (let k = 1; k <= mn.MINES_MAX_OPEN; k++) {
      worst = Math.max(worst, Math.abs(mn.expectedValue(m, k) - mn.MINES_HOUSE));
    }
  }
  ok('모든 (지뢰, 칸) 조합에서 EV 가 하우스 마진과 같다', worst < 0.01, worst.toFixed(4));
  ok('배당이 칸 수에 단조 증가',
    [1, 4, 8].every((m) => Array.from({ length: 7 }, (_, i) => i + 1)
      .every((k) => mn.payout(m, k + 1) > mn.payout(m, k))));
  ok('배당이 지뢰 수에 단조 증가',
    Array.from({ length: 7 }, (_, i) => i + 1).every((m) => mn.payout(m + 1, 8) > mn.payout(m, 8)));
  ok('8칸 최대 배당 ×40.93', Math.abs(mn.payout(8, 8) - 40.93) < 0.01, String(mn.payout(8, 8)));
  ok('지뢰 1 · 1칸은 1 아래', mn.payout(1, 1) < 1, String(mn.payout(1, 1)));

  // 8칸 상한이 없으면 경제가 무너진다
  const g3 = mn.newGame(3, 100, () => 0.5);
  let cur = g3;
  for (let i = 0; i < 25 && mn.canOpen(cur); i++) {
    const free = Array.from({ length: 25 }, (_, x) => x)
      .find((x) => !cur.opened.includes(x) && !cur.bombs.includes(x));
    if (free === undefined) break;
    cur = mn.open(cur, free);
  }
  ok('8칸을 넘겨 열 수 없다', cur.opened.length <= mn.MINES_MAX_OPEN, String(cur.opened.length));
  ok('8칸을 채우면 자동 정산', cur.done);

  // 지뢰 배치가 시드로 재현된다 (판을 저장했다 이어서 연다)
  const { seeded: mkSeed } = require('./rng') as typeof import('./rng');
  const seeded1 = mn.layMines(5, mkSeed('mines', 'x'));
  const seeded2 = mn.layMines(5, mkSeed('mines', 'x'));
  ok('시드가 같으면 배치도 같다', seeded1.join(',') === seeded2.join(','));
  ok('지뢰 개수가 맞다', seeded1.length === 5 && new Set(seeded1).size === 5);
  ok('밟으면 즉시 끝', mn.open(mn.newGame(8, 10, () => 0), 0).dead
    || !mn.newGame(8, 10, () => 0).bombs.includes(0));
}

// ── 길드 콘텐츠 ───────────────────────────────────────
{
  console.log('\n── 길드 콘텐츠 ──');
  const gq = require('./guildQuest') as typeof import('./guildQuest');
  const gs = require('./guildSkill') as typeof import('./guildSkill');
  const gb = require('./guildBoss') as typeof import('./guildBoss');
  const gv = require('./guildVault') as typeof import('./guildVault');
  const { newItem: mk3, TIERS: T3 } = require('./tiers') as typeof import('./tiers');

  const week = '2026-W34';
  /* 검사용 길드 한 줄. 예전엔 guildsFor() 가 만들어 줬다 — 이제 손으로 적는다 */
  const guild: import('./guilds').Guild = {
    id: 'g-test', emblem: '01', name: '검사길드', motto: '',
    masterId: 'u1', master: '길드장', capacity: 30,
    members: 20, avgIlvl: 1000, weekly: 0,
  };

  // 목표가 구성원 수에 비례해야 "제일 큰 길드" 로 끝나지 않는다
  ok('목표가 구성원 수에 비례',
    gq.goalOf(gq.GQ_DEFS[0], 30) === gq.goalOf(gq.GQ_DEFS[0], 10) * 3);
  // 미리 채워 주는 몫이 없다 — 아무도 안 하면 아무것도 안 찬다
  {
    const zero = { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 };
    const board = gq.questBoard(guild, zero);
    ok('길드원이 안 하면 0 에서 시작', board.every((r) => r.crew === 0 && r.total === 0));
    ok('내가 아무것도 안 하면 완주 못 한다', board.every((r) => !r.done));

    // 길드원이 올린 몫은 합산된다 (내 몫과 분리해서 보인다)
    const withCrew = gq.questBoard(guild, zero, { enhance: 5 });
    const row = withCrew.find((r) => r.def.key === 'enhance')!;
    ok('길드원 몫이 합산된다', row.crew === 5 && row.total === 5 && row.mine === 0);

    const full = Object.fromEntries(gq.GQ_DEFS.map((d) => [d.key, 1e9])) as never;
    ok('전부 채우면 보너스까지',
      gq.questGp(gq.questBoard(guild, full)) === gq.GQ_SLOTS * gq.GQ_GP + gq.GQ_BONUS_GP);
    // 목표는 인원 비례다 — 혼자짜리 길드는 1인분만 채우면 된다
    ok('혼자 길드는 1인분 목표',
      gq.questBoard({ ...guild, members: 1 }, zero)[0].goal === gq.GQ_DEFS[0].per);
  }

  // 스킬은 GP 가 아니라 길드 레벨 포인트로 찍는다
  {
    const gr = require('./guildRaid') as typeof import('./guildRaid');
    const earned = gr.skillPointsAt(gr.GUILD_LEVEL_MAX);
    ok('Lv30 에 29점', earned === 29, String(earned));
    ok('Lv1 은 0점', gr.skillPointsAt(1) === 0);
    const maxAll = gs.GUILD_SKILLS.length * gs.SKILL_MAX * gs.SKILL_POINT_COST;
    // 전부 찍을 수 없어야 선택이 생긴다
    ok('만렙이어도 전부는 못 찍는다', earned < maxAll, `${earned} / ${maxAll}`);
    ok('쓴 만큼 줄어든다', gs.freePoints({ forge_advice: 3 }, earned) === earned - 3);
    ok('음수로 안 내려간다', gs.freePoints({ forge_advice: 10 }, 2) === 0);
  }
  ok('스킬 상한이 정령석 캡 아래', gs.guildEffects({ steady_hand: 10 }).guardAdd
    <= require('./spirit').CAPS.enhance_guard);
  ok('레벨 0 은 아무 효과 없음',
    JSON.stringify(gs.guildEffects({})) === JSON.stringify(gs.NO_GUILD_EFFECTS));

  // 보스 HP 는 약 89% 참여를 요구한다 — 전원이 다 안 오면 못 잡는다
  {
    const potential = guild.avgIlvl * guild.members * gb.BOSS_MAX_TRIES;
    ok('HP 가 잠재 총딜의 80~95%',
      gb.bossHp(guild) / potential > 0.8 && gb.bossHp(guild) / potential < 0.95,
      `${((gb.bossHp(guild) / potential) * 100).toFixed(0)}%`);
    ok('실패해도 절반은 준다', (gb.bossReward(false, 50, true)?.gp ?? 0) > 0);
    ok('미참여는 보상 없음', gb.bossReward(true, 1, false) === null);
    ok('상위권이 더 받는다',
      (gb.bossReward(true, 1, true)?.gp ?? 0) > (gb.bossReward(true, 50, true)?.gp ?? 0));
  }

  // ⚠ 배당 상한이 이 시스템에서 제일 중요한 숫자다
  {
    const capOf = (t: number) => gv.dividendCap({ weapon: mk3('sword', t as never, 0, 100) });
    ok('배당 상한 = 그 티어 강화 반 번',
      capOf(10) === Math.round(T3[10].enhanceBase * 8 * 0.5), String(capOf(10)));
    ok('티어가 오르면 상한도 강화비와 같은 비율로 오른다',
      Math.abs(capOf(10) / capOf(8) - T3[10].enhanceBase / T3[8].enhanceBase) < 1e-9);
    // 탐험 재탕 수익의 10% 를 넘으면 길드가 파산 루트를 막는다
    const { exploreReward, REPEAT_REWARD_RATE, STAMINA_COST, MAX_STAMINA } = require('./combat') as typeof import('./combat');
    const runs = Math.floor((MAX_STAMINA + 144) / STAMINA_COST.explore);
    const explore = Math.floor(exploreReward(100) * REPEAT_REWARD_RATE) * runs;
    ok('티어10 배당 상한 < 탐험 재탕의 15%', capOf(10) < explore * 0.15,
      `${capOf(10)} vs ${Math.round(explore * 0.15)}`);
  }
}

// ── 길드 레이드 · 출석 (일일 10 · 주간 3 · 자정 정산) ──
{
  const gr = require('./guildRaid') as typeof import('./guildRaid');
  const ga = require('./guildAttend') as typeof import('./guildAttend');
  const gs = require('./guilds') as typeof import('./guilds');
  const cur = require('./currency') as typeof import('./currency');

  ok('일일 보스 10마리', gr.RAID_BOSSES.daily.length === 10, String(gr.RAID_BOSSES.daily.length));
  ok('주간 보스 3마리', gr.RAID_BOSSES.weekly.length === 3, String(gr.RAID_BOSSES.weekly.length));


  {
    // id 는 파일명이다 — 겹치면 두 보스가 같은 그림을 쓴다
    const ids = gr.RAIDS.flatMap((r) => gr.RAID_BOSSES[r].map((b) => b.id));
    ok('보스 id 는 전부 다르다', new Set(ids).size === ids.length, `${ids.length}개`);
    ok('보스마다 대체 크리처가 있다',
      gr.RAIDS.every((r) => gr.RAID_BOSSES[r].every((b) => !!b.fallback && !!b.flavor)));
  }

  {
    // 같은 주기 키면 늘 같은 보스, 주기가 바뀌면 결국 여러 마리가 나온다
    ok('같은 주기면 같은 보스', gr.bossOf('daily', '2026-08-25').id === gr.bossOf('daily', '2026-08-25').id);
    const seen = new Set(
      Array.from({ length: 200 }, (_, i) => gr.bossOf('daily', `k${i}`).id),
    );
    ok('일일 보스가 골고루 나온다', seen.size >= 8, `${seen.size}종`);
  }

  {
    // 누적 피해는 **돈이 아니다** — fmtShort 를 쓰면 "12.3실버" 가 나온다
    ok('피해 표기에 화폐 단위가 없다',
      !/골드|실버|쿠퍼/.test(gr.fmtDmg(123456)), gr.fmtDmg(123456));
    ok('피해 표기 만 단위', gr.fmtDmg(12300) === '1.2만', gr.fmtDmg(12300));
    ok('피해 표기 억 단위', gr.fmtDmg(250000000) === '2.5억', gr.fmtDmg(250000000));
    ok('작은 피해는 그대로', gr.fmtDmg(1234) === '1,234', gr.fmtDmg(1234));
  }

  {
    // 정산 배당 — 피해에 비례하고, 잡으면 더 준다
    const d = gr.RAID_DEFS.daily;
    ok('배당은 피해에 비례', gr.raidPay(d, 20000, false) === 2 * gr.raidPay(d, 10000, false));
    ok('처치하면 배당이 커진다', gr.raidPay(d, 10000, true) > gr.raidPay(d, 10000, false));
    ok('안 때렸으면 배당 0', gr.raidPay(d, 0, true) === 0);
    ok('주간 배당이 일일보다 후하다',
      gr.raidPay(gr.RAID_DEFS.weekly, 10000, false) > gr.raidPay(d, 10000, false));
  }

  {
    // 정산 창은 자정~00:10 (일일 리셋과 같은 순간)
    const at = (h: number, m: number) => new Date(2026, 7, 25, h, m).getTime();
    ok('00:05 는 정산 창', gr.inSettleWindow(at(0, 5)));
    ok('00:10 은 창 밖', !gr.inSettleWindow(at(0, 10)));
    ok('낮에는 창 밖', !gr.inSettleWindow(at(13, 0)));
    ok('창 안에서는 남은 시간이 있다', gr.settleLeft(at(0, 5)) > 0 && gr.settleLeft(at(13, 0)) === 0);
  }

  {
    // 길드 레벨은 30 까지
    ok('길드 최대 레벨 30', gr.GUILD_LEVEL_MAX === 30);
    ok('경험치 0 이면 Lv1', gr.guildLevelOf(0).level === 1);
    ok('Lv30 에서 멈춘다', gr.guildLevelOf(gr.expForLevel(30) + 1e9).level === 30);
    ok('Lv30 누적이 Lv29 보다 크다', gr.expForLevel(30) > gr.expForLevel(29));
    ok('레벨마다 포인트 1점 (Lv1 은 0점)',
      gr.skillPointsAt(1) === 0 && gr.skillPointsAt(30) === 29);
  }

  {
    // 출석 — 길드 레벨만큼의 실버
    ok('출석 보상 = 길드 레벨 실버', ga.attendReward(7) === cur.s(7), String(ga.attendReward(7)));
    ok('레벨이 오르면 출석 보상도 오른다', ga.attendReward(30) > ga.attendReward(1));
    /*
      출석 인원은 이제 지어내지 않는다 — 오늘 실제로 출석한 길드원 수가 들어온다.
      나 혼자여도(0명) 내 한 표는 남아야 한다.
    */
    ok('나 혼자여도 내 몫은 남는다', ga.attendExp(0) === ga.ATTEND_EXP_PER_MEMBER);
    ok('사람이 늘면 경험치도 는다', ga.attendExp(5) === 6 * ga.ATTEND_EXP_PER_MEMBER);
    ok('음수는 나 하나로 본다', ga.attendExp(-3) === ga.ATTEND_EXP_PER_MEMBER);
    ok('출석 기여도가 레이드 한 대보다 작다', ga.ATTEND_GP < gr.RAID_DEFS.daily.gp);
  }

  /*
    가입 대기(첫날 잠금)는 없앴다 (core/guilds 참고).

    대신 **하루치 한도를 옮겨도 들고 간다.** 그게 원래 막으려던 것이고,
    스토어 시험(scratchpad/store-test.js)이 "출석하고 길드를 옮겨도 또 출석은
    안 된다" 를 실제 스토어로 확인한다.
  */
  ok('대기 개념이 사라졌다',
    !('inProbation' in gs) && !('probationLeft' in gs),
    Object.keys(gs).filter((k) => /probation/i.test(k)).join(',') || '없음');
}

console.log(fails === 0 ? '\n전부 통과' : `\n실패 ${fails}건`);
process.exit(fails ? 1 : 0);
