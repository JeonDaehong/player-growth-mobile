/**
 * 정령석 — **설계 미리보기용 표만** 담은 모듈.
 *
 * 전체 설계는 docs/SPIRIT_STONE_DESIGN.md 에 있고, 실제 부여 로직은 아직 없다.
 * 엘프의 집에서 "무엇이 열릴지" 를 보여주기 위해 확률·종류 표만 먼저 옮겨 둔다.
 * 구현할 때 이 파일을 src/core/spirit.ts 로 키우면 된다.
 */
import { SLOT_IDS } from './types';

export const GRADES = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'] as const;
export type Grade = (typeof GRADES)[number];

export type StoneTier = 'low' | 'mid' | 'high';

export interface StoneDef {
  id: StoneTier;
  name: string;
  /** 가격 (쿠퍼). null = 상점 판매 안 함 */
  price: number | null;
  from: string;
  /** 등급 → 확률(%) */
  odds: Partial<Record<Grade, number>>;
}

export const STONES: StoneDef[] = [
  {
    id: 'low', name: '하급 정령석', price: 500, from: '엘프의 집',
    odds: { F: 35, E: 30, D: 15, C: 9.5, B: 6.5, A: 3.5, S: 0.5 },
  },
  {
    id: 'mid', name: '중급 정령석', price: 30_000, from: '엘프의 집',
    odds: { D: 35, C: 30, B: 15, A: 9.5, S: 6.5, SS: 4 },
  },
  {
    id: 'high', name: '상급 정령석', price: null, from: '쿠지 A상 · 가챠 최상위',
    odds: { B: 35, A: 30, S: 18, SS: 12, SSS: 5 },
  },
];

/** 등급별 특성 종류 수와 아이템레벨 보너스 */
export const GRADE_INFO: Record<Grade, { traits: number; ilvl: number }> = {
  F: { traits: 7, ilvl: 7 },
  E: { traits: 7, ilvl: 14 },
  D: { traits: 5, ilvl: 25 },
  C: { traits: 5, ilvl: 40 },
  B: { traits: 5, ilvl: 60 },
  A: { traits: 4, ilvl: 90 },
  S: { traits: 3, ilvl: 130 },
  SS: { traits: 2, ilvl: 190 },
  SSS: { traits: 1, ilvl: 280 },
};

/**
 * 효과 축 13개.
 *
 * 처음 설계는 39종 중 34종이 4개 축(탐험 통과·내구도·투기장·탐험 보상)에 몰려 있었다.
 * 축을 13개로 늘리고 **한 등급 안에서는 축이 겹치지 않게** 배치했다.
 * 축이 여러 등급에 걸쳐 3~6회 나오는 것은 의도다 — 같은 축의 상위 특성이 있어야
 * "이 방향으로 더 올린다" 는 길이 생긴다.
 */
export const AXES = {
  explore_rate: '탐험 통과 확률',
  explore_reward: '탐험 보상',
  tower_rate: '보스의탑 통과 확률',
  arena: '투기장 승률',
  durability: '내구도 소모 감소',
  repair: '수리비 감소',
  enhance_rate: '강화 성공 확률',
  enhance_guard: '강화 하락·파괴 방어',
  quest_rate: '퀘스트 성공 확률',
  quest_reward: '퀘스트 보상',
  parttime: '아르바이트 수익',
  sell: '판매가',
  shop: '상점 가격 할인',
} as const;
export type Axis = keyof typeof AXES;

export interface Trait {
  grade: Grade;
  name: string;
  /** 이 특성이 건드리는 축. 상위 등급은 2~4개를 겹쳐 강력해진다 */
  axes: Axis[];
}

/** 39종. 저등급은 축 하나만, 고등급은 여러 축을 묶는다 */
export const TRAITS: Trait[] = [
  // F — 경제 축이 많다 (초반에 체감되는 것들)
  { grade: 'F', name: '라스타의 손길',   axes: ['explore_rate'] },
  { grade: 'F', name: '이끼의 인내',     axes: ['durability'] },
  { grade: 'F', name: '흙의 기억',       axes: ['repair'] },
  { grade: 'F', name: '잔바람의 속삭임', axes: ['parttime'] },
  { grade: 'F', name: '반짝임',          axes: ['sell'] },
  { grade: 'F', name: '땅꾼의 눈썰미',   axes: ['shop'] },
  { grade: 'F', name: '마른 뿌리',       axes: ['quest_rate'] },
  // E
  { grade: 'E', name: '광부의 노래',     axes: ['explore_reward'] },
  { grade: 'E', name: '탑의 속삭임',     axes: ['tower_rate'] },
  { grade: 'E', name: '회오리',          axes: ['arena'] },
  { grade: 'E', name: '첫눈의 결정',     axes: ['enhance_rate'] },
  { grade: 'E', name: '룬 조각',         axes: ['enhance_guard'] },
  { grade: 'E', name: '굳은 뿌리',       axes: ['quest_reward'] },
  { grade: 'E', name: '산들바람',        axes: ['parttime'] },
  // D
  { grade: 'D', name: '숲의 비호',       axes: ['explore_rate'] },
  { grade: 'D', name: '이끼갑',          axes: ['durability'] },
  { grade: 'D', name: '다진 흙',         axes: ['repair'] },
  { grade: 'D', name: '은빛 티끌',       axes: ['sell'] },
  { grade: 'D', name: '상인의 셈',       axes: ['shop'] },
  // C
  { grade: 'C', name: '감정가의 눈',     axes: ['explore_reward'] },
  { grade: 'C', name: '돌풍',            axes: ['arena'] },
  { grade: 'C', name: '서릿결',          axes: ['enhance_rate'] },
  { grade: 'C', name: '사냥꾼의 직감',   axes: ['quest_rate'] },
  { grade: 'C', name: '원정대의 계약',   axes: ['quest_reward'] },
  // B
  { grade: 'B', name: '정령의 비호',     axes: ['explore_rate'] },
  { grade: 'B', name: '탑의 메아리',     axes: ['tower_rate'] },
  { grade: 'B', name: '세계수 껍질',     axes: ['durability'] },
  { grade: 'B', name: '룬 문양',         axes: ['enhance_guard'] },
  { grade: 'B', name: '보석상의 안목',   axes: ['sell'] },
  // A — 여기서부터 축을 묶는다
  { grade: 'A', name: '정령왕의 시선',   axes: ['explore_rate', 'tower_rate'] },
  { grade: 'A', name: '뇌명',            axes: ['arena', 'enhance_rate'] },
  { grade: 'A', name: '불멸의 껍질',     axes: ['durability', 'repair'] },
  { grade: 'A', name: '원정대의 인장',   axes: ['quest_rate', 'quest_reward'] },
  // S
  { grade: 'S', name: '왕의 뇌명',       axes: ['arena', 'explore_reward'] },
  { grade: 'S', name: '불멸의 몸',       axes: ['durability', 'enhance_guard'] },
  { grade: 'S', name: '상인의 저울',     axes: ['parttime', 'shop'] },
  // SS
  { grade: 'SS', name: '세계수의 축복',  axes: ['explore_rate', 'tower_rate', 'durability'] },
  { grade: 'SS', name: '심연의 계약',    axes: ['arena', 'explore_reward', 'quest_reward'] },
  // SSS
  { grade: 'SSS', name: '태초의 정령',   axes: ['explore_rate', 'arena', 'explore_reward', 'tower_rate'] },
];

export const traitsOf = (g: Grade) => TRAITS.filter((t) => t.grade === g);

/** 축이 전체에서 몇 번 쓰였는가 (겹침 감사용) */
export function axisUsage(): Record<Axis, number> {
  const out = {} as Record<Axis, number>;
  for (const a of Object.keys(AXES) as Axis[]) out[a] = 0;
  for (const t of TRAITS) for (const a of t.axes) out[a] += 1;
  return out;
}

/**
 * 세트 단계 — 같은 특성을 몇 칸 모았을 때 효과가 몇 배가 되는가.
 *
 * ⚠ 마지막 칸은 **착용 슬롯 수와 같아야 한다.** 그보다 크면 영영 못 채우는
 * 단계가 되어 세트의 마지막 보상이 사라진다.
 *
 * 이 게임은 칸 수가 두 번 줄었다 (16 → 13 → 10). 그때마다 여기 숫자만 그대로
 * 남아 죽은 단계가 생겼고, 두 번 다 스모크가 잡았다. 그래서 **숫자를 안 적는다** —
 * 슬롯 수에서 유도한다. 비율은 그대로다: 전체의 3할 · 6할 · 전부.
 */
const SET_SLOTS = SLOT_IDS.length;
export const SET_STEPS = [
  { count: Math.max(1, Math.round(SET_SLOTS * 0.3)), mul: 1.0 },
  { count: Math.max(2, Math.round(SET_SLOTS * 0.6)), mul: 1.6 },
  { count: SET_SLOTS, mul: 3.0 },
] as const;

/** 기대 등급 (F=0 … SSS=8) — 정령석 등급 간 격차를 한 숫자로 보여준다 */
export function expectedGrade(s: StoneDef): number {
  let sum = 0;
  for (const [g, p] of Object.entries(s.odds)) {
    sum += GRADES.indexOf(g as Grade) * (p ?? 0) / 100;
  }
  return Math.round(sum * 100) / 100;
}

/** 확률 합 (검증용 — 100 이어야 한다) */
export const oddsTotal = (s: StoneDef) =>
  Math.round(Object.values(s.odds).reduce((a, b) => a + (b ?? 0), 0) * 10) / 10;

/** 전체 특성 종류 수 */
export const TOTAL_TRAITS = GRADES.reduce((a, g) => a + GRADE_INFO[g].traits, 0);
