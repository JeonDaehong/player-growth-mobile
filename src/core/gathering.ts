/**
 * 채집 · 수렵 · 낚시 (docs/GATHERING_DESIGN.md).
 *
 * 이 게임의 다른 활동은 전부 확률로 결정된다 — 강화, 퀘스트, 탐험, 투기장, 도박.
 * 여기만 **실력이 개입**한다. 미니게임 점수가 산출물 등급을 한 칸 밀어 올리므로,
 * 실력이 도구 한 등급을 대체한다.
 *
 * 실패해도 장비·돈을 잃지 않는 **유일하게 안전한 활동**이라 코어 루프(파산)를 건드리지 않는다.
 */
import { Rand, rnd } from './rng';
import { b, g, s } from './currency';

export const ACTIVITIES = ['gather', 'hunt', 'fish'] as const;
export type Activity = (typeof ACTIVITIES)[number];

export const GRADES = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;
export type Grade = (typeof GRADES)[number];

export interface ActivityDef {
  id: Activity;
  name: string;
  /** 미니게임이 요구하는 손 — 셋이 서로 달라야 스킨만 바꾼 게 아니게 된다 */
  skill: string;
  how: string;
  stamina: number;
  dailyLimit: number;
  place: string;
}

export const ACTIVITY_DEFS: Record<Activity, ActivityDef> = {
  gather: {
    id: 'gather', name: '채집', skill: '정밀',
    how: '좌우로 왕복하는 커서를 중앙의 좁은 구간에서 세 번 멈춥니다',
    stamina: 1, dailyLimit: 10, place: '채집터',
  },
  hunt: {
    id: 'hunt', name: '수렵', skill: '속도',
    how: '짐승이 네 번 자리를 옮깁니다. 나타날 때마다 맞힙니다',
    stamina: 2, dailyLimit: 10, place: '수렵터',
  },
  fish: {
    id: 'fish', name: '낚시', skill: '지속',
    how: '요동치는 게이지를 눌렀다 떼며 마커를 물고기 위에 붙들어 둡니다',
    stamina: 1, dailyLimit: 10, place: '호숫가',
  },
};

// ── 도구 (F ~ S 7등급) ──────────────────────────────────
//
// 정령석과 같은 규칙 — **한 등급 위 도구는 하한과 상한이 함께 오른다.**
// 규칙 하나로 표 전체를 외울 수 있다.

export interface ToolDef {
  grade: Grade;
  /** 등급별 출현 확률(%) — 합 100 */
  odds: Partial<Record<Grade, number>>;
  /** 가격. null 이면 살 수 없다 */
  price: number | null;
  /** 상점에서 못 살 때의 해금 조건 (도감 진척률) */
  unlockRate?: number;
}

export const TOOLS: Record<Grade, ToolDef> = {
  F: { grade: 'F', odds: { F: 55, E: 30, D: 15 }, price: 0 },
  E: { grade: 'E', odds: { F: 40, E: 30, D: 20, C: 10 }, price: g(3) },
  D: { grade: 'D', odds: { E: 40, D: 30, C: 20, B: 10 }, price: g(40) },
  C: { grade: 'C', odds: { D: 40, C: 30, B: 20, A: 10 }, price: g(300) },
  B: { grade: 'B', odds: { C: 40, B: 30, A: 20, S: 10 }, price: g(1000), unlockRate: 0.3 },
  A: { grade: 'A', odds: { B: 45, A: 35, S: 20 }, price: g(2000), unlockRate: 0.6 },
  // 도감 100% 는 **살 자격**을 여는 것이지 공짜로 주는 게 아니다.
  // A(2,000골드) 다음 칸이므로 가격도 그 결을 따라간다.
  S: { grade: 'S', odds: { A: 60, S: 40 }, price: g(5000), unlockRate: 1 },
};

/**
 * 도구를 부르는 이름.
 *
 * 예전엔 ToolDef 에 'E급 도구' 로 박혀 있었는데, 세 활동이 같은 표를 쓰다 보니
 * 낚싯대를 사면서도 "E급 도구" 라고만 떴다. 물건 이름은 활동이 정한다.
 */
export const TOOL_NOUN: Record<Activity, string> = {
  gather: '채집 도구', hunt: '수렵 도구', fish: '낚싯대',
};

export const toolName = (a: Activity, grade: Grade) => `${grade}급 ${TOOL_NOUN[a]}`;

/** 되팔 때 돌려받는 비율 */
export const TOOL_RESELL_RATE = 0.7;

/** 되팔기 값. F 는 그냥 주는 것이라 값이 없다 */
export function toolResellPrice(grade: Grade): number {
  const p = TOOLS[grade].price;
  return p ? Math.floor(p * TOOL_RESELL_RATE) : 0;
}

/** 되팔 수 있는가 — 공짜로 받은 F 는 팔 것이 못 된다 */
export const toolSellable = (grade: Grade) => toolResellPrice(grade) > 0;

/** 도구를 살 수 있는가 — B 이상은 골드가 아니라 **도감 진척도**가 게이팅한다 */
export function toolBuyable(grade: Grade, dexRate: number): boolean {
  const t = TOOLS[grade];
  if (t.price === null) return false;
  return dexRate >= (t.unlockRate ?? 0);
}

// ── 점수 → 등급 보정 ────────────────────────────────────

/** 미니게임 점수(0~100)가 출현표를 한 칸 밀어 올리거나 내린다 */
export function shiftedGrade(tool: Grade, score: number): Grade | null {
  if (score <= 0) return null;               // 산출물 없음
  const i = GRADES.indexOf(tool);
  if (score >= 85) return GRADES[Math.min(GRADES.length - 1, i + 1)];
  if (score < 40) return GRADES[Math.max(0, i - 1)];
  return tool;
}

/** 산출물 등급 하나를 뽑는다. score 0 이면 null */
export function rollYield(tool: Grade, score: number, r: Rand = rnd): Grade | null {
  const eff = shiftedGrade(tool, score);
  if (!eff) return null;
  const odds = TOOLS[eff].odds;
  let x = r() * 100;
  for (const grade of GRADES) {
    const p = odds[grade] ?? 0;
    if (p <= 0) continue;
    x -= p;
    if (x < 0) return grade;
  }
  // 부동소수 잔차 — 확률이 있는 등급 중 마지막으로 떨어진다
  return GRADES.filter((gr) => (odds[gr] ?? 0) > 0).pop() ?? 'F';
}

// ── 산출물 ──────────────────────────────────────────────

/**
 * 등급별 판매가.
 *
 * B·A·S 는 연성액 부재료이기도 하다 — 팔면 오늘 돈이 되고, 쟁이면 나중에 장비 배수가 된다.
 * **돈이 급하면 재료를 팔고 나중에 후회한다**. 이 게임 전체가 그 이야기다.
 */
export const YIELD_PRICE: Record<Grade, number> = {
  F: b(20), E: b(80), D: s(3), C: s(15), B: g(2), A: g(8), S: g(15),
};

/** 연성액 부재료로 쓰이는 등급 */
export const POTION_GRADES: Grade[] = ['B', 'A', 'S'];

/** 그 도구의 회당 기대 판매가 */
export function expectedValue(tool: Grade, score = 60): number {
  const eff = shiftedGrade(tool, score);
  if (!eff) return 0;
  const odds = TOOLS[eff].odds;
  let sum = 0;
  for (const grade of GRADES) sum += (odds[grade] ?? 0) / 100 * YIELD_PRICE[grade];
  return Math.round(sum);
}

// ── 도감 50종 ───────────────────────────────────────────

export interface Species {
  id: string;
  name: string;
  activity: Activity;
  /** 계열 (약초/광물/버섯/짐승/물고기) */
  family: string;
  grade: Grade;
}

const sp = (id: string, name: string, activity: Activity, family: string, grade: Grade): Species =>
  ({ id, name, activity, family, grade });

export const SPECIES: Species[] = [
  // 채집 24 — 약초 8 · 광물 8 · 버섯 8
  sp('dewgrass', '이슬풀', 'gather', '약초', 'F'),
  sp('bitterleaf', '쓴잎', 'gather', '약초', 'F'),
  sp('bandagemoss', '붕대이끼', 'gather', '약초', 'E'),
  sp('silverleaf', '은엽초', 'gather', '약초', 'E'),
  sp('moonflower', '달맞이꽃', 'gather', '약초', 'D'),
  sp('spiritherb', '정령초', 'gather', '약초', 'C'),
  sp('frostlily', '서리백합', 'gather', '약초', 'B'),
  sp('dragonblood', '용혈초', 'gather', '약초', 'A'),
  sp('pebble', '자갈', 'gather', '광물', 'F'),
  sp('quartz', '규석', 'gather', '광물', 'F'),
  sp('copperore', '구리광석', 'gather', '광물', 'E'),
  sp('ironore', '철광석', 'gather', '광물', 'E'),
  sp('silverore', '은광석', 'gather', '광물', 'D'),
  sp('goldore', '금광석', 'gather', '광물', 'C'),
  sp('mithrilbit', '미스릴 조각', 'gather', '광물', 'B'),
  sp('orichalcum', '오리할콘 원석', 'gather', '광물', 'A'),
  sp('dirtcap', '흙버섯', 'gather', '버섯', 'F'),
  sp('moldcap', '곰팡버섯', 'gather', '버섯', 'F'),
  sp('lampcap', '등불버섯', 'gather', '버섯', 'E'),
  sp('poisonbrolly', '독우산', 'gather', '버섯', 'E'),
  sp('dreamcap', '취몽버섯', 'gather', '버섯', 'D'),
  sp('spiritcap', '정령갓', 'gather', '버섯', 'C'),
  sp('abyssspore', '심연포자', 'gather', '버섯', 'B'),
  sp('panaceacap', '만병초갓', 'gather', '버섯', 'S'),

  // 수렵 12
  sp('fieldrat', '들쥐', 'hunt', '짐승', 'F'),
  sp('hare', '산토끼', 'hunt', '짐승', 'F'),
  sp('hornlessdeer', '뿔없는사슴', 'hunt', '짐승', 'E'),
  sp('greywolf', '회색늑대', 'hunt', '짐승', 'E'),
  sp('boar', '멧돼지', 'hunt', '짐승', 'D'),
  sp('spinytoad', '가시두꺼비', 'hunt', '짐승', 'D'),
  sp('blackbear', '검은곰', 'hunt', '짐승', 'C'),
  sp('oneeyedowl', '외눈올빼미', 'hunt', '짐승', 'C'),
  sp('icefox', '얼음여우', 'hunt', '짐승', 'B'),
  // 크리처 러쉬 10종과 일부러 겹친다 — 돈 걸고 보던 짐승을 직접 잡게 된다
  sp('steelmantis', '강철사마귀', 'hunt', '짐승', 'B'),
  sp('onehornogre', '외뿔오우거', 'hunt', '짐승', 'A'),
  sp('shadowpanther', '그림자표범', 'hunt', '짐승', 'S'),

  // 낚시 14
  sp('minnow', '잔챙이', 'fish', '물고기', 'F'),
  sp('mudcarp', '진흙붕어', 'fish', '물고기', 'F'),
  sp('silverscale', '은비늘피시', 'fish', '물고기', 'E'),
  sp('whiskercat', '수염메기', 'fish', '물고기', 'E'),
  sp('riverpike', '강꼬치', 'fish', '물고기', 'D'),
  sp('icetrout', '얼음송어', 'fish', '물고기', 'D'),
  sp('lampangler', '등불아귀', 'fish', '물고기', 'C'),
  sp('ironcarp', '무쇠잉어', 'fish', '물고기', 'C'),
  sp('moonray', '달빛가오리', 'fish', '물고기', 'B'),
  sp('abysseel', '심연장어', 'fish', '물고기', 'B'),
  sp('centuryturtle', '백년거북', 'fish', '물고기', 'A'),
  sp('whirltuna', '소용돌이참치', 'fish', '물고기', 'A'),
  sp('spiritwhale', '정령고래', 'fish', '물고기', 'S'),
  sp('dragonsturgeon', '용비늘철갑상어', 'fish', '물고기', 'S'),
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((x) => [x.id, x]),
);

export const speciesOf = (a: Activity) => SPECIES.filter((x) => x.activity === a);

/** 그 활동에서 이 등급으로 나올 수 있는 종 */
export const candidates = (a: Activity, grade: Grade) =>
  SPECIES.filter((x) => x.activity === a && x.grade === grade);

/**
 * 실제 획득 — 등급을 뽑고, 그 등급의 종 중 하나를 고른다.
 * 해당 등급에 종이 없으면(예: 채집 S 는 만병초갓 하나뿐) 가장 가까운 아래 등급으로 내린다.
 */
export function catchOne(
  a: Activity, tool: Grade, score: number, r: Rand = rnd,
): { species: Species; grade: Grade } | null {
  const grade = rollYield(tool, score, r);
  if (!grade) return null;
  for (let i = GRADES.indexOf(grade); i >= 0; i--) {
    const pool = candidates(a, GRADES[i]);
    if (pool.length) {
      return { species: pool[Math.floor(r() * pool.length)], grade: GRADES[i] };
    }
  }
  return null;
}

// ── 재고 (종 단위) ──────────────────────────────────────
//
// 예전엔 활동+등급으로만 셌다 (`{ hunt: { F: 3 } }`). 그러면 산토끼를 잡아도
// 창고에는 "수렵 F급 × 3" 만 남아, 무엇을 잡았는지가 사라진다.
// **종 id 로 센다** — 활동도 등급도 종에서 되짚을 수 있으므로 잃는 정보가 없다.

/** 종 id → 개수 */
export type GatherBag = Record<string, number>;

export interface BagRow {
  species: Species;
  n: number;
}

/** 재고를 화면에 늘어놓을 순서 — 활동 › 등급 › 이름 */
export function bagRows(bag: GatherBag): BagRow[] {
  const rows: BagRow[] = [];
  for (const sp of SPECIES) {
    const n = bag[sp.id] ?? 0;
    if (n > 0) rows.push({ species: sp, n });
  }
  return rows;
}

export const bagValue = (bag: GatherBag) =>
  bagRows(bag).reduce((sum, r) => sum + YIELD_PRICE[r.species.grade] * r.n, 0);

export const bagCount = (bag: GatherBag) =>
  bagRows(bag).reduce((sum, r) => sum + r.n, 0);

/** 연성액 부재료는 종이 아니라 **활동+등급**을 요구한다 — 그 조건에 맞는 것을 모두 센다 */
export function bagGradeCount(bag: GatherBag, a: Activity, grade: Grade): number {
  return SPECIES
    .filter((sp) => sp.activity === a && sp.grade === grade)
    .reduce((sum, sp) => sum + (bag[sp.id] ?? 0), 0);
}

/**
 * 그 활동·등급에서 n 개를 덜어낸다. 여러 종에 걸쳐 있으면 앞의 종부터 쓴다.
 * 모자라면 null — 호출부가 부분 소모를 실수로 저지르지 못하게.
 */
export function takeGrade(
  bag: GatherBag, a: Activity, grade: Grade, n: number,
): GatherBag | null {
  if (bagGradeCount(bag, a, grade) < n) return null;
  const out = { ...bag };
  let left = n;
  for (const sp of SPECIES) {
    if (left <= 0) break;
    if (sp.activity !== a || sp.grade !== grade) continue;
    const have = out[sp.id] ?? 0;
    if (have <= 0) continue;
    const take = Math.min(have, left);
    left -= take;
    if (have - take > 0) out[sp.id] = have - take; else delete out[sp.id];
  }
  return out;
}

// ── 도감 완성 보상 ──────────────────────────────────────

export const FAMILIES = ['약초', '광물', '버섯', '짐승', '물고기'] as const;

/** 계열 → 코드 스프라이트 키 (src/ui/sprites ICONS). 아트가 오기 전 대체용 */
export const FAMILY_GLYPH: Record<string, string> = {
  약초: 'herb', 광물: 'ore', 버섯: 'mush', 짐승: 'beast', 물고기: 'fish',
};

/** 계열 → 아이콘 키 (assets/sprites/family) */
export const FAMILY_ART: Record<string, string> = {
  약초: 'herb', 광물: 'ore', 버섯: 'mushroom', 짐승: 'beast', 물고기: 'fish',
};

/** 활동 → 도구 아이콘 키 (assets/sprites/tool) */
export const TOOL_ART: Record<Activity, string> = {
  gather: 'gather', hunt: 'hunt', fish: 'fish',
};

/**
 * 등급별 도구 아트 (`assets/sprites/tool/{활동}_{등급}`).
 *
 * F 급 낫과 S 급 낫이 같은 그림이면 등급을 올린 보람이 없다 — 등급마다 다른
 * 물건을 그린다. 아직 안 들어온 등급은 호출부가 `fallbackName` 으로 기존
 * 단일 아트에 떨어지므로, 시트가 활동별로 하나씩 와도 코드는 그대로다.
 */
export const toolArt = (a: Activity, grade: Grade) => `${TOOL_ART[a]}_${grade}`;

/** 도구 아트가 오기 전 대체 글리프 (src/ui/sprites ICONS) */
export const TOOL_GLYPH: Record<Activity, string> = {
  gather: 'sickle', hunt: 'snare', fish: 'rod',
};

/**
 * 종 → 아트 (assets/sprites/sp_{계열}/{id}).
 * 계열마다 시트 한 장이라 폴더가 갈린다 — 장비를 부위별로 한 장씩 뽑는 것과 같은 이유다.
 * 아트가 오기 전에는 계열 아이콘으로 대신 그린다.
 */
export function speciesArt(sp: Species): { set: string; name: string } {
  return { set: `sp_${FAMILY_ART[sp.family] ?? 'herb'}`, name: sp.id };
}

/** 도감에서 종을 잡을 때 쓰는 한 줄 설명 */
export function speciesHint(sp: Species): string {
  const a = ACTIVITY_DEFS[sp.activity];
  return `${a.place}에서 ${sp.grade}급으로 나옵니다`;
}

/** 그 종이 나올 수 있는 최소 도구 등급 (출현표에 그 등급이 있는 가장 낮은 도구) */
export function minToolFor(sp: Species): Grade {
  for (const t of GRADES) if ((TOOLS[t].odds[sp.grade] ?? 0) > 0) return t;
  return 'S';
}

export interface DexReward {
  id: string;
  label: string;
  /** 이 조건을 만족하는 종 id 집합 */
  need: (dex: Set<string>) => boolean;
  money: number;
  title?: string;
}

const familyDone = (family: string) => (dex: Set<string>) =>
  SPECIES.filter((x) => x.family === family).every((x) => dex.has(x.id));

const activityDone = (a: Activity) => (dex: Set<string>) =>
  speciesOf(a).every((x) => dex.has(x.id));

export const DEX_REWARDS: DexReward[] = [
  ...FAMILIES.map((f) => ({
    id: `family_${f}`, label: `${f} 계열 완성`, need: familyDone(f), money: g(20),
  })),
  { id: 'gather_all', label: '채집 24종', need: activityDone('gather'), money: 0, title: 'gather_king' },
  { id: 'hunt_all', label: '수렵 12종', need: activityDone('hunt'), money: 0, title: 'hunter' },
  { id: 'fish_all', label: '낚시 14종', need: activityDone('fish'), money: 0, title: 'angler' },
  {
    id: 'dex_all', label: '50종 100%', money: 0, title: 'polymath',
    need: (dex) => SPECIES.every((x) => dex.has(x.id)),
  },
];

export const dexRate = (dex: Set<string>) => dex.size / SPECIES.length;

/** 아직 수령하지 않은 완성 보상 */
export const pendingDexRewards = (dex: Set<string>, claimed: string[]) =>
  DEX_REWARDS.filter((r) => !claimed.includes(r.id) && r.need(dex));
