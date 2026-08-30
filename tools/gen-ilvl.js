/*
  아이템레벨 표(docs/ITEM_LEVEL_TABLE.md)를 **실제 코드에서** 뽑는다.

  손으로 적으면 공식이 바뀌는 순간 문서가 조용히 거짓말을 한다. 이 표는 티어 표,
  부위 계수, 마일스톤, 정령석 값, 연성 밴드, 세트 단계, 착용 칸 수를 전부
  참조하는데 그중 하나만 바뀌어도 표 전체가 틀어진다 — 실제로 슬롯을 10칸으로
  줄이면서 세트 단계가 같이 움직였다.

  ## 왜 풀셋 기준인가

  이 게임의 아이템레벨은 **합**이다. 장비 한 점이 아니라 열 칸의 합이 캐릭터의
  힘이고, 승률도 탐험·탑의 권장 곡선도 전부 그 합을 본다. 한 점짜리 숫자는
  어디서도 그대로 쓰이지 않는다.

  세트 시너지까지 얹는다. 정령석을 열 칸에 같은 특성으로 맞추면 개별 값과 별개로
  세트 보너스가 붙는데(`SET_STEPS`), 그게 화면의 "내 정보" 에 실제로 뜨는 값이다.

  ## 쓰는 법

      npx tsc -p <스모크 tsconfig>            # src/**.ts 를 CommonJS 로 컴파일
      node tools/gen-ilvl.js <컴파일된 src 경로>
*/
const path = require('path');
const Module = require('module');
const fs = require('fs');

const ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', '..', 'smoke2', 'src');
const orig = Module._resolveFilename;
Module._resolveFilename = function (r, ...a) {
  if (r.startsWith('@/')) r = path.join(ROOT, r.slice(2));
  return orig.call(this, r, ...a);
};

const T = require(path.join(ROOT, 'core', 'tiers.js'));
const TY = require(path.join(ROOT, 'core', 'types.js'));
const AL = require(path.join(ROOT, 'core', 'alchemy.js'));
const SPV = require(path.join(ROOT, 'core', 'spiritPreview.js'));
const SPI = require(path.join(ROOT, 'core', 'spirit.js'));

const { TIERS, newItem, playerIlvl, kindWeight, KIND_ILVL_WEIGHT, SLOT_COUNT } = T;
const { SLOT_IDS, SLOT_ACCEPTS, ARTISAN_TIER: ART } = TY;

/** 칭호가 없을 때의 보정 — 표는 맨 상태를 기준으로 한다 */
const NO_TITLE = { runeIlvlMul: 1, setSynergyMul: 1 };

/** 그 칸에 낄 수 있는 대표 부위 */
const kindOf = (slot) => (slot === 'weapon' ? 'sword' : SLOT_ACCEPTS[slot][0]);

/** 열 칸을 같은 티어·강화로 채운 풀셋 */
function fullSet(tier, level, opt) {
  const { freed = 0, grade = null, alch = 1 } = opt || {};
  const eq = {};
  for (const sl of SLOT_IDS) {
    const it = newItem(kindOf(sl), tier, level, 100);
    eq[sl] = Object.assign({}, it, { freed });
    if (grade) eq[sl].spirit = { grade, trait: '라스타의 손길' };
    if (alch !== 1) eq[sl].alch = alch;
  }
  return eq;
}

/**
 * 화면의 "내 정보" 와 같은 값 — 장비 합 + 세트 시너지.
 *
 * `state/selectors.ts` 의 `selIlvl` 과 같은 식이다. 개별 정령석 값은 이미 각 장비의
 * `itemLevel` 안에 들어 있으므로, 세트 몫만 따로 더한다.
 */
function totalIlvl(eq) {
  const base = playerIlvl(eq);
  const t = SPI.spiritTotal(eq, NO_TITLE);
  let individual = 0;
  for (const sl of SLOT_IDS) {
    const sp = eq[sl] && eq[sl].spirit;
    if (sp) individual += SPV.GRADE_INFO[sp.grade].ilvl;
  }
  return Math.round((base + (t.ilvl - individual)) * 10) / 10;
}

const n1 = (v) => (Math.round(v * 10) / 10).toLocaleString('en-US');
const md = [];
const P = (s) => md.push(s === undefined ? '' : s);

/* 풀셋 구성 — 무기 n + 방어구 n + 장신구 n */
const comp = {};
for (const sl of SLOT_IDS) {
  const w = kindWeight(kindOf(sl));
  const grp = w === KIND_ILVL_WEIGHT.weapon ? '무기'
    : w === KIND_ILVL_WEIGHT.armor ? '방어구' : '장신구';
  comp[grp] = (comp[grp] || 0) + 1;
}

P('# 아이템레벨 표 — 풀셋 ' + SLOT_COUNT + '칸 기준');
P();
P('> 이 문서는 `tools/gen-ilvl.js` 가 **실제 코드에서 뽑아** 씁니다.');
P('> 손으로 고치지 마세요 — 공식이 바뀌면 다시 돌리면 됩니다.');
P();
P('이 게임의 아이템레벨은 **합**입니다. 장비 한 점이 아니라 **' + SLOT_COUNT + '칸의 합**이');
P('캐릭터의 힘이고, 승률도 탐험·탑의 권장 곡선도 전부 그 합을 봅니다.');
P('그래서 아래 표는 전부 **풀셋 총합**입니다.');
P();
P('**풀셋 구성**: '
  + Object.keys(comp).map((k) => k + ' ' + comp[k] + '칸').join(' + ')
  + ' = ' + SLOT_COUNT + '칸');
P();
P('```');
P('한 점 = (티어 기본값 + 티어 상승치 × 부위계수 × 강화수치 + 마일스톤 + 정령석) × 연성배수');
P('풀셋  = 열 칸의 합 + 세트 시너지');
P('```');
P();
P('| 값 | 뜻 |');
P('|---|---|');
P('| 티어 기본값 | 강화 +0 에서 그냥 주어지는 값 (`TIERS[t].base`) |');
P('| 티어 상승치 | +1 당 오르는 값 (`TIERS[t].inc`) |');
P('| 부위계수 | 무기 ' + KIND_ILVL_WEIGHT.weapon + ' · 방어구 ' + KIND_ILVL_WEIGHT.armor
  + ' · 장신구 ' + KIND_ILVL_WEIGHT.acc + ' |');
P('| 마일스톤 | +5 마다 붙는 덤. 3회분에서 상한 |');
P('| 세트 시너지 | 같은 특성 정령석을 여러 칸에 모았을 때 (맨 아래 참고) |');
P();
P('---');
P();
P('## 티어별 풀셋 총합 (+0 ~ +15)');
P();

let head = '| 티어 | +0 |';
let sep = '|---|---|';
for (let l = 1; l <= 15; l += 1) { head += ' +' + l + ' |'; sep += '---|'; }
P(head);
P(sep);
for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  let row = '| **' + t + '티어** ' + TIERS[t].prefix + ' |';
  for (let l = 0; l <= 15; l += 1) row += ' ' + n1(playerIlvl(fullSet(t, l))) + ' |';
  P(row);
}
let artRow = '| **장인** ★ |';
for (let l = 0; l <= 15; l += 1) {
  artRow += ' ' + n1(playerIlvl(fullSet(ART, l, { freed: 99 }))) + ' |';
}
P(artRow);
P();
P('> 장인 줄은 **마일스톤을 전부 해방한** 기준입니다 (아래 참고).');
P();

const start = playerIlvl(fullSet(1, 0));
const top10 = playerIlvl(fullSet(10, 15));
P('맨 처음(1티어 +0) **' + n1(start) + '** 에서 일반 최고(10티어 +15) **' + n1(top10) + '** 까지,');
P('약 **' + Math.round(top10 / start) + '배** 입니다.');
P();
P('---');
P();
P('## 장인 풀셋 — +100 까지');
P();
P('장인 무구는 상한이 없습니다 (`maxLevel: Infinity`). 다만 마일스톤(+5 마다 붙는 덤)이');
P('**잠겨 있어서** 해방(`core/liberation`)으로 하나씩 열어야 합니다.');
P('안 열면 강화 수치만 오르고 마일스톤은 0 입니다.');
P();
P('| 강화 | 해방 X | 해방 O | 차이 |');
P('|---|---|---|---|');
for (const l of [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100]) {
  const no = playerIlvl(fullSet(ART, l, { freed: 0 }));
  const yes = playerIlvl(fullSet(ART, l, { freed: 99 }));
  P('| **+' + l + '** | ' + n1(no) + ' | ' + n1(yes) + ' | +' + n1(yes - no)
    + ' (' + Math.round((yes / no - 1) * 100) + '%) |');
}
P();

const art100 = playerIlvl(fullSet(ART, 100, { freed: 99 }));
const art15 = playerIlvl(fullSet(ART, 15, { freed: 99 }));
P('- 장인 +100 풀셋 = **' + n1(art100) + '** — 10티어 +15 풀셋(' + n1(top10) + ') 의 약 **'
  + (art100 / top10).toFixed(1) + '배**');
P('- 장인 +15 → +100 사이에서 ' + n1(art15) + ' → ' + n1(art100) + ' 로 약 **'
  + (art100 / art15).toFixed(1) + '배**');
P();
P('---');
P();
P('## 룬(정령석)·연성을 얹으면');
P();
P('둘은 붙는 방식이 다릅니다.');
P();
P('- **정령석(룬각인)** 은 등급별 **고정값을 더합니다.** 3티어 이상에만 새길 수 있습니다.');
P('  풀셋으로 같은 특성을 맞추면 **세트 시너지**가 개별 값과 별도로 한 번 더 붙습니다.');
P('- **연성액** 은 마지막에 **배수**로 곱합니다 — 정령석으로 더해진 값에도 곱해집니다.');
P('  그래서 좋은 룬을 새길수록 연성액의 효과도 같이 커집니다.');
P();
P('### 정령석 등급별 값 (칸마다)');
P();

const GRADES = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
let gh = '| 등급 |';
let gs = '|---|';
for (const g of GRADES) { gh += ' ' + g + ' |'; gs += '---|'; }
P(gh);
P(gs);
let gr = '| 칸마다 더해지는 값 |';
for (const g of GRADES) gr += ' +' + SPV.GRADE_INFO[g].ilvl + ' |';
P(gr);
P();
P('### 연성액 배수');
P();
P('| 연성액 | 최저 (찌꺼기) | 최고 (신화) |');
P('|---|---|---|');
for (const t of ['low', 'mid', 'high']) {
  const name = { low: '하급', mid: '중급', high: '상급' }[t];
  P('| ' + name + ' | ×' + AL.BANDS[t].dross[0].toFixed(2)
    + ' | ×' + AL.BANDS[t].mythic[1].toFixed(2) + ' |');
}
P();
P('### 풀셋에 다 얹었을 때 — 대략 몇 ~ 몇');
P();
P('열 칸 전부에 같은 특성 정령석을 새기고 연성액을 바른 상태입니다');
P('(세트 시너지 마지막 단계 ×' + SPV.SET_STEPS[SPV.SET_STEPS.length - 1].mul.toFixed(1)
  + ' 까지 들어간 값).');
P();
P('| 풀셋 | 맨몸 | 룬 F + 하급 연성 | 룬 A + 중급 연성 | 룬 SSS + 상급 연성 |');
P('|---|---|---|---|---|');

const CASES = [
  ['3티어 +15', 3, 15, 0],
  ['5티어 +15', 5, 15, 0],
  ['7티어 +15', 7, 15, 0],
  ['10티어 +15', 10, 15, 0],
  ['장인 +15', ART, 15, 99],
  ['장인 +50', ART, 50, 99],
  ['장인 +100', ART, 100, 99],
];
for (const c of CASES) {
  const label = c[0]; const tier = c[1]; const lv = c[2]; const freed = c[3];
  const bare = playerIlvl(fullSet(tier, lv, { freed }));
  const lo = totalIlvl(fullSet(tier, lv, { freed, grade: 'F', alch: AL.BANDS.low.dross[0] }));
  const mid = totalIlvl(fullSet(tier, lv, { freed, grade: 'A', alch: AL.BANDS.mid.ethereal[0] }));
  const hi = totalIlvl(fullSet(tier, lv, { freed, grade: 'SSS', alch: AL.BANDS.high.mythic[1] }));
  P('| **' + label + '** | ' + n1(bare) + ' | ' + n1(lo) + ' | ' + n1(mid) + ' | ' + n1(hi) + ' |');
}
P();

const full10 = totalIlvl(fullSet(10, 15, { grade: 'SSS', alch: 2 }));
const fullArt = totalIlvl(fullSet(ART, 100, { freed: 99, grade: 'SSS', alch: 2 }));
P('- 10티어 +15 풀셋: ' + n1(top10) + ' → **' + n1(full10) + '** (약 '
  + (full10 / top10).toFixed(1) + '배)');
P('- 장인 +100 풀셋: ' + n1(art100) + ' → **' + n1(fullArt) + '** (약 '
  + (fullArt / art100).toFixed(1) + '배)');
P();

const bare3 = playerIlvl(fullSet(3, 15));
const hi3 = totalIlvl(fullSet(3, 15, { grade: 'SSS', alch: 2 }));
P('**낮은 티어일수록 배수가 큽니다.** 정령석이 고정값을 더하는 방식이라 원본이 작을수록');
P('비중이 커지기 때문입니다 — 3티어 +15 풀셋은 ' + n1(bare3) + ' → ' + n1(hi3)
  + ' 로 **' + (hi3 / bare3).toFixed(1) + '배**입니다.');
P('(3티어에 SSS 를 박을 일은 없습니다. 배수의 성질을 보여 주려는 표입니다.)');
P();
P('---');
P();
P('## 세트 시너지');
P();
P('같은 특성의 정령석을 여러 칸에 모으면 개별 값과 **별도로** 한 번 더 붙습니다.');
P();
P('| 같은 특성 칸 수 | 계수 |');
P('|---|---|');
for (const st of SPV.SET_STEPS) P('| ' + st.count + '칸 | ×' + st.mul.toFixed(1) + ' |');
P();
P('마지막 단계는 착용 칸 수(' + SLOT_COUNT + ')와 같습니다 — 전 부위를 같은 특성으로');
P('맞춘 상태입니다. 이 값은 `SLOT_IDS.length` 에서 유도되므로 칸 수가 바뀌면 따라옵니다.');
P();
P('풀셋을 같은 특성으로 맞췄을 때 **세트 시너지만** 떼어 보면:');
P();
P('| 정령석 등급 | 세트 시너지로 붙는 아이템레벨 |');
P('|---|---|');
for (const g of ['F', 'D', 'B', 'A', 'S', 'SS', 'SSS']) {
  const eq = fullSet(10, 15, { grade: g });
  P('| ' + g + ' | +' + n1(totalIlvl(eq) - playerIlvl(eq)) + ' |');
}
P();

fs.writeFileSync('docs/ITEM_LEVEL_TABLE.md', md.join('\n') + '\n', 'utf8');
console.log('docs/ITEM_LEVEL_TABLE.md 작성 — ' + md.length + '줄');
