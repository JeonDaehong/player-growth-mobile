/**
 * 길드 스킬.
 *
 * **길드 레벨이 오를 때마다 길드장이 1점을 받아 찍는다.** 예전에는 GP 로 샀는데,
 * 그러면 돈이 많은 길드가 전부 찍어 버려 선택이 사라졌다. 포인트로 바꾸면
 * Lv30 까지 모아도 29점이라 9종 × 10레벨(90칸) 중 셋쯤만 채울 수 있다 —
 * "우리 길드는 강화에 몰았다" 같은 색이 생긴다.
 *
 * 효과는 **모든 길드원**에게 간다. 길드장만 이득이면 아무도 안 들어온다.
 * 상한은 **정령석 캡에서 읽어 온다** — 문서 숫자를 복사하면 정령석을 조정할 때 어긋난다.
 */
import { CAPS } from './spirit';

export const GUILD_SKILLS = [
  'forge_advice', 'steady_hand', 'repair_bay', 'expedition', 'guild_trade', 'night_watch', 'vault',
  'war_cry', 'prospector',
] as const;
export type GuildSkillId = (typeof GUILD_SKILLS)[number];

export const SKILL_MAX = 10;

/** 한 레벨을 올리는 데 드는 포인트 — 한 점씩. 값이 계단이면 계산이 어려워진다 */
export const SKILL_POINT_COST = 1;

/** 찍은 레벨 전부를 합쳐 쓴 포인트 */
export const spentPoints = (lv: SkillLevels) =>
  GUILD_SKILLS.reduce((a, id) => a + levelOf(lv, id) * SKILL_POINT_COST, 0);

/** 아직 남은 포인트 */
export const freePoints = (lv: SkillLevels, earned: number) =>
  Math.max(0, earned - spentPoints(lv));

export interface GuildSkillDef {
  id: GuildSkillId;
  name: string;
  desc: string;
  /** 레벨당 효과 크기 */
  per: number;
  /** 표시용 단위 */
  unit: '%' | '%p' | '분';
  /** 상한 근거 — 화면에 그대로 보여 준다 */
  capNote: string;
}

export const SKILL_DEFS: Record<GuildSkillId, GuildSkillDef> = {
  forge_advice: {
    id: 'forge_advice', name: '대장간의 조언', desc: '강화 성공 확률 배수',
    per: 0.01, unit: '%', capNote: '총예산 캡(원확률 ×1.75) 안에서만',
  },
  steady_hand: {
    id: 'steady_hand', name: '견고한 손', desc: '파괴 판정 방어',
    per: 1, unit: '%p', capNote: `정령석 enhance_guard 캡 ${CAPS.enhance_guard}%p 아래`,
  },
  repair_bay: {
    id: 'repair_bay', name: '길드 정비창', desc: '수리비 할인',
    per: 0.01, unit: '%', capNote: '수리 사금고를 없애지 않는 선',
  },
  expedition: {
    id: 'expedition', name: '원정 경험', desc: '탐험 · 탑 통과 확률',
    per: 0.5, unit: '%p', capNote: `정령석 explore_rate 캡 ${CAPS.explore_rate}%p 안`,
  },
  guild_trade: {
    id: 'guild_trade', name: '길드 상회', desc: '장비 판매가',
    per: 0.01, unit: '%', capNote: `정령석 sell 캡 ${CAPS.sell}% 와 별개`,
  },
  night_watch: {
    id: 'night_watch', name: '야간 순찰', desc: '체력 회복 간격 단축',
    per: 0.2, unit: '분', capNote: '10분 → 8분 (하루 체력 144 → 180)',
  },
  vault: {
    id: 'vault', name: '금고 관리', desc: '일일 배당',
    per: 0.05, unit: '%', capNote: '배당 상한 자체는 강화비에 묶여 있다',
  },
  war_cry: {
    id: 'war_cry', name: '전투 함성', desc: '레이드 피해',
    per: 0.04, unit: '%', capNote: 'Lv10 에 +40% — 인원 부족을 메우는 선까지만',
  },
  prospector: {
    id: 'prospector', name: '탐광', desc: '장인 재료 드랍률',
    per: 0.01, unit: '%p', capNote: 'Lv10 에 +10%p (15% → 25%)',
  },
};

export type SkillLevels = Partial<Record<GuildSkillId, number>>;

export const levelOf = (lv: SkillLevels, id: GuildSkillId) =>
  Math.max(0, Math.min(SKILL_MAX, lv[id] ?? 0));

export interface GuildEffects {
  /** 레이드 피해 배수 */
  raidDmgMul: number;
  /** 장인 재료 드랍 %p 가산 */
  dropRateAdd: number;
  /** 강화 성공 확률 배수 */
  enhanceMul: number;
  /** 파괴 방어 %p */
  guardAdd: number;
  repairDiscount: number;
  /** 탐험·탑 통과 확률 %p */
  stageRateAdd: number;
  sellBonus: number;
  /** 체력 회복 간격 (ms) */
  staminaRegenMs: number;
  dividendMul: number;
}

export const NO_GUILD_EFFECTS: GuildEffects = {
  raidDmgMul: 1, dropRateAdd: 0,
  enhanceMul: 1, guardAdd: 0, repairDiscount: 0, stageRateAdd: 0,
  sellBonus: 0, staminaRegenMs: 10 * 60_000, dividendMul: 1,
};

export function guildEffects(lv: SkillLevels): GuildEffects {
  const L = (id: GuildSkillId) => levelOf(lv, id);
  return {
    raidDmgMul: 1 + L('war_cry') * 0.04,
    dropRateAdd: L('prospector') * 0.01,
    enhanceMul: 1 + L('forge_advice') * 0.01,
    guardAdd: Math.min(CAPS.enhance_guard, L('steady_hand') * 1),
    repairDiscount: L('repair_bay') * 0.01,
    stageRateAdd: Math.min(CAPS.explore_rate, L('expedition') * 0.5),
    sellBonus: L('guild_trade') * 0.01,
    staminaRegenMs: Math.round((10 - L('night_watch') * 0.2) * 60_000),
    dividendMul: 1 + L('vault') * 0.05,
  };
}

/** 한 줄 효과 설명 (현재 레벨 기준) */
export function skillText(id: GuildSkillId, level: number): string {
  const d = SKILL_DEFS[id];
  const v = d.per * level;
  if (d.unit === '분') return `체력 회복 ${(10 - v).toFixed(1)}분당 1`;
  if (d.unit === '%p') return `${d.desc} +${v.toFixed(1)}%p`;
  return `${d.desc} +${Math.round(v * 100)}%`;
}
