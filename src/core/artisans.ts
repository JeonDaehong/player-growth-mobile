/**
 * 장인 (기획서 §5 — 장인의 무구).
 *
 * 기획서는 "장인의 무구"로만 부르지만, 도감에 장인 시리즈를 넣으려면 이름이 있어야
 * 물건에 애착이 생깁니다. 세상에 장인은 **둔카락스 한 명**이고, 무기·방어구·장신구를
 * 전부 그가 만듭니다.
 */
import { g } from './currency';
import { ACC_KINDS, ARMOR_KINDS, KIND_NAME, PartKind, WEAPON_KINDS } from './types';

export interface Artisan {
  id: 'dunkarax';
  /** "둔카락스" */
  name: string;
  /** "마지막 장인" */
  title: string;
  flavor: string;
}

export const DUNKARAX: Artisan = {
  id: 'dunkarax',
  name: '둔카락스',
  title: '마지막 장인',
  flavor:
    '탑 아래 대장간에서 백 년째 홀로 두드린다는 노인. 검이든 갑옷이든 반지든 제 손으로만 만들고, '
    + '한 번 넘긴 물건은 부러지기 전까지 다시 손대지 않는다.',
};

/** 부위를 맡은 장인 — 전부 둔카락스다 */
export function artisanOf(_kind: PartKind): Artisan {
  return DUNKARAX;
}

/** "둔카락스의 검" */
export function artisanItemName(kind: PartKind): string {
  return `${DUNKARAX.name}의 ${KIND_NAME[kind]}`;
}

/** 도감 표시용 부위 묶음 (장인은 한 명이라 부위군으로 나눈다) */
/**
 * 보스의탑 50층의 주인.
 * 장인의 무구 재료는 전부 이 녀석에게서 나온다.
 */
export const BOSS_NAME = '번스타인';

/** 재료 3종 — 부위 계열마다 필요한 것이 다르다 */
export type MaterialId = 'skin' | 'tooth' | 'bone';

export const MATERIALS: Record<
  MaterialId,
  { id: MaterialId; name: string; forKind: string; /** 아트가 오기 전 대체 글리프 */ glyph: string }
> = {
  skin:  { id: 'skin',  name: '번스타인의 강철피부 조각', forKind: '무기',   glyph: 'hide' },
  tooth: { id: 'tooth', name: '번스타인의 이빨조각',      forKind: '장신구', glyph: 'fang' },
  bone:  { id: 'bone',  name: '번스타인의 뼛조각',        forKind: '방어구', glyph: 'bonefr' },
};
export const MATERIAL_IDS: MaterialId[] = ['skin', 'tooth', 'bone'];

/**
 * 재료 하나의 매입가 — 1골드.
 * 제련에 25개가 들어가므로 한 부위를 포기하면 25골드다. 팔아서 돈을 버는 물건이
 * 아니라, 계열이 안 맞아 쌓인 재료를 털어 내는 창구다.
 */
export const MATERIAL_PRICE = g(1);

/**
 * 이 부위를 제련하려면 어떤 재료가 필요한가.
 *
 * 예전에는 **부위마다** 따로 재료를 모으게 되어 있었다 (21종 × 100개).
 * 부채 하나 만들려고 "부채 재료" 만 100개 모으는 건 사실상 불가능하다.
 * 계열 3종으로 묶어 모으는 맛이 나게 했다.
 */
export function materialFor(kind: PartKind): MaterialId {
  if ((WEAPON_KINDS as readonly string[]).includes(kind)) return 'skin';
  if ((ACC_KINDS as readonly string[]).includes(kind)) return 'tooth';
  return 'bone';
}

export const ARTISAN_PART_GROUPS = [
  { label: '무기', kinds: WEAPON_KINDS as readonly PartKind[] },
  { label: '방어구', kinds: ARMOR_KINDS as readonly PartKind[] },
  { label: '장신구', kinds: ACC_KINDS as readonly PartKind[] },
] as const;
