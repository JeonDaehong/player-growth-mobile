/**
 * 밸런스 시뮬레이터. UI 없이 순수 로직만 10만 번 돌려 기획서 §13 의 설계 원칙이
 * 실제 수치로 지켜지는지 확인한다.
 *   실행: bun src/core/__sim__.ts
 */
import { newItem, TIERS, itemLevel } from './tiers';
import { tryEnhance, enhanceCost, canPromote, promoteCost, promote } from './enhance';
import { sellPrice } from './economy';
import { fmt } from './currency';
import { Item } from './types';

const N = 20000;

function line(s = '') { console.log(s); }
function pct(x: number) { return (x * 100).toFixed(1) + '%'; }

/** 티어 t 의 +0 장비를 +15 까지 올리는 데 드는 총비용 / 파괴 횟수 */
function runToFifteen(tier: number) {
  let cost = 0;
  let destroyed = 0;
  let item: Item | null = newItem('sword', tier, 0, 100);
  let guard = 0;
  while (item && item.level < 15 && guard++ < 100000) {
    cost += enhanceCost(item, null);
    const r = tryEnhance(item, null);
    item = r.item;
    if (r.outcome === 'destroy') {
      destroyed++;
      item = newItem('sword', tier, 0, 100); // 다시 +0 부터
    }
  }
  return { cost, destroyed, ok: !!item };
}

line('═══ 1. +0 → +15 총비용 (주문서 없음, ' + N + '회 평균) ═══');
line('티어  평균 총비용        중앙값          평균 파괴  판매가(+15)   회수율');
for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  const costs: number[] = [];
  let destroys = 0;
  const runs = t <= 4 ? N : 4000;
  for (let i = 0; i < runs; i++) {
    const r = runToFifteen(t);
    costs.push(r.cost);
    destroys += r.destroyed;
  }
  costs.sort((a, b) => a - b);
  const avg = costs.reduce((a, b) => a + b, 0) / costs.length;
  const med = costs[Math.floor(costs.length / 2)];
  const sp = sellPrice({ ...newItem('sword', t, 15, 100) });
  line(
    String(t).padEnd(5) +
    fmt(Math.round(avg)).padEnd(18) +
    fmt(med).padEnd(16) +
    (destroys / runs).toFixed(2).padEnd(10) +
    fmt(sp).padEnd(14) +
    pct(sp / avg),
  );
}

line();
line('═══ 2. 판매가 / 투자액 비율 (기획서 §13-1: 35~45% 목표) ═══');
line('티어  +0 판매가/승급누적   +15 판매가/총투자');
{
  let cumulativePromote = 0;
  for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    // 이 티어에 도달하기까지의 누적 승급비 + 각 티어 +15 강화비
    const enhance15 = (() => {
      let c = 0;
      const it = newItem('sword', t, 0, 100);
      for (let lv = 0; lv < 15; lv++) c += enhanceCost({ ...it, level: lv }, null);
      return c;
    })();
    const invested = cumulativePromote + enhance15;
    const sp15 = sellPrice(newItem('sword', t, 15, 100));
    const sp0 = sellPrice(newItem('sword', t, 0, 100));
    line(
      String(t).padEnd(5) +
      (cumulativePromote ? pct(sp0 / cumulativePromote) : '—').padEnd(20) +
      pct(sp15 / invested),
    );
    const pc = TIERS[t].promoteCost;
    if (pc) cumulativePromote = invested + pc;
  }
}

line();
line('═══ 3. 단계별 실제 도달 확률 (주문서 없음, 1회 시도 기준) ═══');
line('목표    성공     기대 시도수(파괴 무시)');
for (const lv of [5, 9, 12, 13, 14, 15]) {
  const item = newItem('sword', 5, lv - 1, 100);
  let succ = 0;
  for (let i = 0; i < N; i++) if (tryEnhance(item, null).outcome === 'success') succ++;
  const p = succ / N;
  line(`+${String(lv).padEnd(6)}${pct(p).padEnd(9)}${(1 / p).toFixed(1)}회`);
}

line();
line('═══ 4. 주문서 효율 (+15 시도, 성공률 20% 기준) ═══');
{
  const item = newItem('sword', 8, 14, 100);
  const trials = 40000;
  for (const sc of [null, 'succ_low', 'succ_mid', 'succ_high', 'guard_destroy100'] as const) {
    let succ = 0, destroy = 0, down = 0;
    for (let i = 0; i < trials; i++) {
      const r = tryEnhance(item, sc);
      if (r.outcome === 'success') succ++;
      else if (r.outcome === 'destroy') destroy++;
      else if (r.outcome === 'downgrade') down++;
    }
    line(
      (sc ?? '없음').padEnd(20) +
      `성공 ${pct(succ / trials).padEnd(8)} 하락 ${pct(down / trials).padEnd(8)} 파괴 ${pct(destroy / trials)}`,
    );
  }
}

line();
line('═══ 5. 아이템레벨 곡선 검증 ═══');
line('티어  +0 템렙  +15 템렙  (기획서 대조)');
const EXPECT: Record<number, [number, number]> = {
  1: [10, 25], 2: [30, 60], 3: [60, 105], 4: [100, 175], 5: [150, 255],
  6: [220, 370], 7: [300, 510], 8: [400, 670], 9: [520, 880], 10: [660, 1110],
};
for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  const at0 = itemLevel(newItem('sword', t, 0, 100));
  const at15 = itemLevel(newItem('sword', t, 15, 100));
  const [e0, e15] = EXPECT[t];
  const ok = at0 === e0 && at15 === e15 ? 'OK' : `불일치 (기대 ${e0}/${e15})`;
  line(String(t).padEnd(5) + String(at0).padEnd(9) + String(at15).padEnd(10) + ok);
}

line();
line('═══ 6. 16슬롯 풀세팅 시 플레이어 아이템레벨 (= 합) ═══');
{
  const { SLOT_COUNT, playerIlvl } = require('./tiers') as typeof import('./tiers');
  const { SLOT_IDS, SLOT_ACCEPTS } = require('./types') as typeof import('./types');
  const { exploreRecIlvl, towerRecIlvl, stageWinRate } = require('./combat') as typeof import('./combat');
  /**
   * ⚠ 16칸을 전부 검으로 채우면 안 된다 — 무기 가중치 때문에 실제 구성보다 27% 높게
   * 나오고, 비율식 승률(ilvlWinRate)에서는 그 27% 가 곧바로 82% 승률로 증폭된다.
   * 아래 표가 "티어 10 = 50%" 를 말하려면 칸마다 그 칸의 부위를 넣어야 한다.
   */
  const fullSet = (t: number) => playerIlvl(Object.fromEntries(
    SLOT_IDS.map((sl) => [sl, newItem(sl === 'weapon' ? 'sword' : SLOT_ACCEPTS[sl][0], t as never, 15, 100)]),
  ) as never);
  line('티어  개당 템렙  16슬롯 합    챕터100 승률  탑50층 승률');
  for (const t of [1, 3, 5, 8, 10]) {
    const per = itemLevel(newItem('sword', t, 15, 100));
    const sum = fullSet(t);
    const w100 = stageWinRate(sum, exploreRecIlvl(100));
    const w50 = stageWinRate(sum, towerRecIlvl(50));
    line(
      String(t).padEnd(5) +
      String(per).padEnd(11) +
      Math.round(sum).toLocaleString('en-US').padEnd(13) +
      (pct(w100)).padEnd(14) +
      pct(w50),
    );
  }
  line('');
  line('(기획서 §7-5: 챕터 100 권장 = 용린 +15 풀셋 수준 → 위 표 티어 10 행이 ~50% 여야 정상)');
  line('승률은 비율식이다 — 권장 템렙의 1.5배면 93%, 1.5배 모자라면 20% (combat.ilvlWinRate)');
}


line();
line('═══ 7. 퀘스트 기대값 (§7-3) — 보증금 1 을 걸었을 때 회수 기대치 ═══');
{
  const { rollQuests, questWinRate, questEV, QUEST_DIFFICULTY, QUEST_HOUSE_KEEP } =
    require('./combat') as typeof import('./combat');
  const DIFFS = ['easy', 'normal', 'hard', 'extreme'] as const;

  line('난이도       보상배수  손익분기승률  기준승률  기대값');
  for (const d of DIFFS) {
    const mul = QUEST_DIFFICULTY[d].rewardMul;
    line(
      QUEST_DIFFICULTY[d].label.padEnd(12) +
      ('x' + mul.toFixed(1)).padEnd(10) +
      pct(1 / mul).padEnd(14) +
      pct(QUEST_HOUSE_KEEP / mul).padEnd(10) +
      questEV(d).toFixed(3),
    );
  }
  line('');
  line(`전 난이도 기대값 = ${QUEST_HOUSE_KEEP} (하우스 몫 ${((1 - QUEST_HOUSE_KEEP) * 100).toFixed(0)}%). 1 을 넘으면 돈 복사.`);
  line('');

  line('장비를 갖추면 실제로 쉬워지는가 (보통 난이도, 굴린 시점 대비)');
  line('내 템렙 배율   승률');
  const q = rollQuests(1600, 4242).find((x) => x.difficulty === 'normal')!;
  for (const m of [0.5, 0.8, 1.0, 1.2, 1.5, 2.0]) {
    line(('x' + m.toFixed(1)).padEnd(15) + pct(questWinRate(1600 * m, q)));
  }
}

line();
line('═══ 8. 복권 환급률 (§복권상점) ═══');
{
  const { PRIZES, TICKET_PRICE, expectedValue, payoutRatio, DAILY_LIMIT } =
    require('./lottery') as typeof import('./lottery');
  line('등수   확률       상금              기대값 기여');
  for (const p of PRIZES) {
    line(
      p.label.padEnd(7) +
      ((p.prob * 100).toFixed(3) + '%').padEnd(11) +
      fmt(p.amount).padEnd(18) +
      fmt(Math.round(p.prob * p.amount)),
    );
  }
  line('');
  line(`가격 ${fmt(TICKET_PRICE)} · 1장 기대회수 ${fmt(Math.round(expectedValue()))} · 환급률 ${pct(payoutRatio())}`);
  line(`하루 ${DAILY_LIMIT}장 구매 시 기대 손익 ${fmt(Math.round((expectedValue() - TICKET_PRICE) * DAILY_LIMIT))}`);
  line('환급률 1.00 을 넘으면 사면 살수록 이득 = 돈 복사. 실제 복권은 0.50 수준.');
}

line();
line('═══ 9. 채집 · 수렵 · 낚시 (GATHERING_DESIGN §8) ═══');
{
  const ga = require('./gathering') as typeof import('./gathering');
  const cb = require('./combat') as typeof import('./combat');

  const dailyRuns = 30;   // 3활동 × 10회
  line('도구  회당 기대     하루 30회        체력/일  체력당');
  const stam = ga.ACTIVITIES.reduce(
    (a, x) => a + ga.ACTIVITY_DEFS[x].stamina * ga.ACTIVITY_DEFS[x].dailyLimit, 0);
  for (const t of ga.GRADES) {
    const per = ga.expectedValue(t);
    const day = per * dailyRuns;
    line(
      t.padEnd(6) + fmt(per).padEnd(14) + fmt(day).padEnd(17)
      + String(stam).padEnd(9) + fmt(Math.round(day / stam)),
    );
  }
  line('');
  // 탐험을 죽이지 않는가 — 이 문서에서 가장 위험한 숫자
  const runs = Math.floor((cb.MAX_STAMINA + 144) / cb.STAMINA_COST.explore);
  const explore = Math.floor(cb.exploreReward(cb.EXPLORE_CHAPTERS) * cb.REPEAT_REWARD_RATE) * runs;
  const exStam = runs * cb.STAMINA_COST.explore;
  line(`탐험 챕터${cb.EXPLORE_CHAPTERS} 재탕 ${runs}회 = ${fmt(explore)} (체력 ${exStam}, 체력당 ${fmt(Math.round(explore / exStam))})`);
  const best = ga.expectedValue('S') * dailyRuns;
  line(`채집류 S 도구 전량 판매 = ${fmt(best)} — 탐험의 ${((best / explore) * 100).toFixed(0)}%`);
  line(`체력 효율로는 ${(((best / stam) / (explore / exStam)) * 100).toFixed(0)}%`);
  line('총액으로는 한참 아래, 체력당으로는 비슷 — 체력이 남는 만큼 곁들이는 부수입이면 맞다.');
}

line();
line('═══ 10. 심연 — 층별 최적 귀환 지점 (ABYSS §10) ═══');
{
  const ab = require('./abyss') as typeof import('./abyss');
  const ti = require('./tiers') as typeof import('./tiers');

  line('세트                 1층    10층   20층   완주    기대 깊이');
  for (const [label, ilvl] of [
    ['티어 6 +15 풀셋', ti.fullSetIlvl(6, 15)],
    ['티어 8 +15 풀셋', ti.fullSetIlvl(8, 15)],
    ['티어 10 +15 풀셋', ti.maxSetIlvl()],
    ['+ 상급 연성액', Math.round(ti.maxSetIlvl() * 1.292)],
  ] as const) {
    let alive = 1;
    let depth = 0;
    for (let n = 1; n <= 40; n++) {
      alive *= ab.abyssPass(ilvl, n);
      depth += alive;
    }
    let full = 1;
    for (let n = 1; n <= 20; n++) full *= ab.abyssPass(ilvl, n);
    line(
      label.padEnd(20)
      + pct(ab.abyssPass(ilvl, 1)).padEnd(7)
      + pct(ab.abyssPass(ilvl, 10)).padEnd(7)
      + pct(ab.abyssPass(ilvl, 20)).padEnd(7)
      + pct(full).padEnd(8)
      + depth.toFixed(1) + '층',
    );
  }
  line('');
  line('"기대 깊이" = 계속 내려갈 때 통과하는 층수의 기댓값. 실제 플레이어는 여기보다 일찍 귀환한다.');
  // 핵 수급 속도 — 상급 연성액 풀셋까지 며칠인가
  let full20 = 1;
  for (let n = 1; n <= 20; n++) full20 *= ab.abyssPass(ti.maxSetIlvl(), n);
  const perRun = full20 * 1;
  const runsPerDay = Math.floor((cbStamina() ) / ab.ABYSS_STAMINA);
  line(`용린 +15 풀셋 기준 런당 핵 ${perRun.toFixed(3)}개 · 하루 ${runsPerDay}런 → 16슬롯(핵 32개)까지 약 ${Math.ceil(32 / (perRun * runsPerDay))}일`);
}

function cbAll() {
  return require('./combat') as typeof import('./combat');
}

function cbStamina() {
  const cb = require('./combat') as typeof import('./combat');
  return cb.MAX_STAMINA + 144;
}

line();
line('═══ 11. 마일스톤 — 투자/회수 (ENHANCE_MILESTONE §8) ═══');
{
  const ti = require('./tiers') as typeof import('./tiers');
  const ec = require('./economy') as typeof import('./economy');
  const en = require('./enhance') as typeof import('./enhance');

  line('티어  +15 템렙    +15 판매가     누적 강화비(기대)  회수율');
  for (const t of [1, 3, 5, 7, 10] as const) {
    const it = ti.newItem('chest', t, 15, 100);
    const sell = ec.sellPrice(it);
    // +0 → +15 기대 비용 (성공률 역수만큼 반복)
    let cost = 0;
    for (let lv = 1; lv <= 15; lv++) {
      const o = en.effectiveOdds(lv, null, 0, t);
      cost += en.enhanceCost(ti.newItem('chest', t, lv - 1, 100)) / (o.success / 100);
    }
    line(
      String(t).padEnd(6)
      + ti.fmtIlvl(ti.itemLevel(it)).padEnd(12)
      + fmt(sell).padEnd(15)
      + fmt(Math.round(cost)).padEnd(19)
      + pct(sell / cost),
    );
  }
  line('');
  line('판매가는 아이템레벨을 안 쓰므로(sellBase + sellPerLevel×level) 마일스톤이 회수율을 바꾸지 않는다.');
  line('의도한 것 — 판매가가 오르면 손절이 쉬워져 파산 루프가 약해진다.');

  line('');
  line('수리비 실질 (마일스톤 반영 후)');
  /**
   * ⚠ 강화비로 나누면 안 된다 — 강화비는 티어당 2.4배씩, 아이템레벨은 1.35배씩 오르므로
   * 그 비율은 티어가 오를수록 저절로 0 에 수렴한다 (수리비가 싸진 게 아니다).
   * 비교 기준은 **그 구간의 벌이**여야 한다. 스모크가 이 비율을 잠근다.
   */
  line('티어  +15 수리비(전량)  그 구간 하루 벌이   비율');
  for (const t of [1, 3, 5, 7, 10] as const) {
    const it = ti.newItem('chest', t, 15, 60);
    const rep = ec.repairCost(it) * 16;
    // 그 티어를 쓰는 구간의 탐험 재탕 수익 (티어 t ≈ 챕터 t×13)
    const ch = Math.max(1, Math.min(cbAll().EXPLORE_CHAPTERS, t * 13));
    const runs = Math.floor((cbStamina()) / cbAll().STAMINA_COST.explore);
    const income = Math.floor(cbAll().exploreReward(ch) * cbAll().REPEAT_REWARD_RATE) * runs;
    line(
      String(t).padEnd(6) + fmt(Math.round(rep)).padEnd(18)
      + fmt(income).padEnd(20) + pct(rep / income),
    );
  }
}

line();
line('═══ 12. 지뢰밭 — 전략 무관 EV (ARCADE §2-3) ═══');
{
  const mn = require('./mines') as typeof import('./mines');
  line('지뢰  칸  성공확률    배당       EV');
  for (const [m, k] of [[1, 5], [3, 8], [5, 3], [8, 8], [8, 1]] as const) {
    line(
      String(m).padEnd(6) + String(k).padEnd(4)
      + pct(mn.safeProb(m, k)).padEnd(12)
      + ('×' + mn.payout(m, k).toFixed(2)).padEnd(11)
      + mn.expectedValue(m, k).toFixed(4),
    );
  }
  line('');
  line(`어떤 조합을 골라도 EV = ${mn.MINES_HOUSE}. 최적 전략이 존재하지 않는다 — 수식이 보장한다.`);
}
