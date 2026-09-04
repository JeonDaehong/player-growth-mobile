/**
 * 캐릭터 — 이 게임이 키우는 것.
 *
 * 예전에는 **한 사람**이 열 칸의 장비를 끼고 다녔다. 그래서 "무엇을 키우나" 의
 * 답이 장비뿐이었고, 얻는 것도 장비뿐이었다. 이제는 **캐릭터를 모으고**, 캐릭터가
 * 태어날 때부터 들고 있는 **고유장비 한 자루**를 키운다.
 *
 * ## 왜 고유장비인가
 *
 * 장비를 캐릭터에서 떼어 낼 수 있게 하면, 결국 제일 센 장비 하나를 제일 센
 * 캐릭터에게 몰아주는 한 가지 정답이 생긴다. 그러면 캐릭터를 모을 이유가
 * "장비 걸이를 늘리려고" 가 되어 버린다.
 *
 * 장비를 캐릭터에 **붙여 두면** 캐릭터를 키우는 일과 장비를 키우는 일이 같은
 * 일이 된다. 바니걸의 검을 +10 까지 올렸다는 말이 곧 바니걸을 키웠다는 말이다.
 * 갈아타려면 처음부터 다시 올려야 하므로, 누구를 키울지 고르는 것 자체가
 * 선택이 된다.
 *
 * ## 세 갈래로 나눈 이유
 *
 * 파티가 네 자리라, 넷을 다 같은 역할로 채우면 고를 것이 없다. 딜러만 넷이면
 * 제일 센 딜러 넷이 정답이고 그게 끝이다. 역할을 셋으로 갈라 두면 "누구를 빼고
 * 누구를 넣나" 가 매번 다른 답을 갖는다.
 *
 *   dealer  — 때린다. 공격이 높고 체력이 낮다
 *   guard   — 버틴다. 체력이 높고 공격이 낮다. 적의 공격을 대신 받는다
 *   support — 거든다. 파티 전체의 공격을 올린다
 *
 * ## 그림
 *
 * `docs/character-art/` 에 열두 명의 프롬프트가 있고, 아직 그림은 안 들어왔다.
 * 그동안은 기존 `assets/sprites/avatar/` 에서 제일 가까운 얼굴을 빌려 쓴다
 * (`art`). 새 그림이 들어오면 이 한 줄씩만 갈아 끼우면 된다.
 */

/**
 * 지금 만들어 둔 사람들.
 *
 * **한 명씩 만든다.** 열두 명 명단을 미리 박아 두고 그림을 채워 넣는 방식으로
 * 해 봤는데, 그러면 게임에는 이름만 있고 그림은 공용 기사인 사람이 열한 명
 * 서 있게 된다 — 도감을 열면 `???` 가 대부분이라 모을 마음이 안 생긴다.
 *
 * 그래서 **다 만든 사람만** 여기 올린다. `docs/character-art/<id>.md` 의 네
 * 장(전투·베기·흉상·일러스트)이 전부 들어온 사람이 기준이다.
 * 다음 사람을 만들면 여기 한 줄, `CHARS` 에 한 덩어리를 더한다.
 */
import type { StatusId } from './status';
import { fixTree } from './skillTree';
import {
  RARITY_GROWTH, Rarity, STAR_CAP,
  canAwaken, lvCap, maxStar, skillSlots,
} from './growth';

export const CHAR_IDS = ['knightgirl', 'bunnyaxe', 'elfarcher', 'nun'] as const;

export type CharId = (typeof CHAR_IDS)[number];

export type Role = 'dealer' | 'guard' | 'support';

export const ROLE_NAME: Record<Role, string> = {
  dealer: '공격',
  guard: '방어',
  support: '보조',
};

/**
 * 화면에 내거는 **전투 타입** 넷.
 *
 * 역할(`Role`)은 셋인데 타입은 넷이다 — 공격이 근접과 원거리로 갈리기
 * 때문이다. 그 둘은 계산에서는 같지만(둘 다 `dealer`) 화면에서는 전혀 다르다:
 * 하나는 걸어 나가 붙고 하나는 뒤에 남아 쏜다. 파티를 짤 때 실제로 보는 것은
 * 그 차이다.
 *
 * **새 필드를 안 만들고 조합해서 뽑는다.** `role` 과 `range` 에 이미 다 들어
 * 있으므로, 넷째 필드를 두면 같은 사실을 두 군데 적어 두고 어긋나기를 기다리는
 * 셈이 된다.
 */
export type BattleType = 'tank' | 'melee' | 'ranged' | 'support';

export const BATTLE_TYPE_NAME: Record<BattleType, string> = {
  tank: '탱커',
  melee: '근접 딜러',
  ranged: '원거리 딜러',
  support: '서포터',
};

/** 아이콘 이름 (`assets/sprites/role_icon/`) — 방패 · 검 · 활 · 십자 */
export const BATTLE_TYPE_ART: Record<BattleType, string> = {
  tank: 'role_tank',
  melee: 'role_melee',
  ranged: 'role_ranged',
  support: 'role_support',
};

export function battleTypeOf(id: string): BattleType {
  const d = (CHARS as Record<string, CharDef | undefined>)[id];
  if (!d) return 'melee';
  if (d.role === 'guard') return 'tank';
  if (d.role === 'support') return 'support';
  return d.range === 'ranged' ? 'ranged' : 'melee';
}

/*
  ── 등급은 `core/growth` 에 산다 ──

  `C·B·A·S` 넷을 **일반·희귀·영웅·전설·신화** 다섯으로 갈아 끼웠다. 넷일
  때는 등급이 강화 성장률 하나만 정했는데, 이제 성 상한(`RARITY_STAR`)과
  각성 여부(`RARITY_AWAKE`)까지 정하므로 규칙이 한 덩이가 됐다. 그 덩이는
  캐릭터 표와 따로 사는 편이 낫다 — 숫자를 고치러 들어갈 때 열두 명의
  설정글을 지나지 않아도 된다.
*/
export type { Rarity } from './growth';
export {
  RARITY_IDS, RARITY_NAME, RARITY_LETTER, RARITY_GROWTH,
  RARITY_STAR, RARITY_AWAKE, STAR_CAP, LV_CAP, AWAKE_LV_CAP,
  AWAKEN_COPIES, AWAKEN_ELIXIR, ELIXIR_NAME,
  canAwaken, isAwakenSlot, lvCap, lvCost, maxStar, skillNeeds, skillSlots, starUpCost,
} from './growth';

/**
 * 피해의 종류.
 *
 * **둘뿐이다.** 속성을 넷 다섯으로 늘리면 파티를 짤 때 "이 판에는 무슨
 * 속성이 나오나" 를 외워야 하고, 흑백 2색 화면에서 그 넷을 구분해 보여 줄
 * 방법도 없다. 둘이면 방어 한 줄과 저항 한 줄로 화면에 다 들어간다.
 *
 *   phys   물리 피해 — **방어력**이 막는다
 *   magic  마법 피해 — **마법저항력**이 막는다
 *
 * 막는 쪽이 서로 다른 스탯이라, 한쪽만 올린 상대에게는 다른 쪽이 통한다.
 * 그게 이 갈래를 두는 유일한 이유다 — 갈라 놓고 둘 다 같은 스탯이 막으면
 * 이름만 둘이다.
 */
export type DmgType = 'phys' | 'magic';

/** 화면에 적는 이름 */
export const DMG_NAME: Record<DmgType, string> = {
  phys: '물리',
  magic: '마법',
};

/**
 * 관통 — **막는 겹을 통째로 건너뛴다.**
 *
 * 비율이 아니라 있고 없고다. 방어가 뺄셈이라(`Armor`) 관통도 뺄셈의 언어로
 * 말해야 읽힌다 — "30% 관통" 은 방어력 5 앞에서 1.5 를 무시한다는 뜻인데,
 * 그 1.5 는 화면에 뜨는 숫자를 하나도 안 바꾼다.
 *
 * 종류마다 따로다. 물리관통은 방어력만, 마법관통은 마법저항력만 건너뛴다 —
 * 물리로 때리는 사람에게 마법관통을 줘 봐야 아무 일도 안 일어난다.
 *
 * **기술에도 붙고 패시브에도 붙는다.** 둘이 겹치면 OR 다 (`blowOf`).
 */
export interface Pierce {
  /** 물리관통 — 상대 방어력을 무시한다 */
  phys: boolean;
  /** 마법관통 — 상대 마법저항력을 무시한다 */
  magic: boolean;
}

/** 아무것도 안 뚫는다 — 지금 대부분이 이것이다 */
export const NO_PIERCE: Pierce = { phys: false, magic: false };

/**
 * 맞는 쪽이 들고 있는 것 — **두 겹의 방어.**
 *
 * `Stat`(파티)과 `Foe`(적)가 둘 다 이 모양이라, 피해 계산은 누가 누구를
 * 때리는지 몰라도 된다 (`autoBattle` 의 `strikeFor`). 예전에는 아군이 적을
 * 때리는 식과 적이 아군을 때리는 식이 따로 있었다.
 */
export interface Armor {
  /** 방어력 — **물리** 피해를 그 수만큼 깎는다 */
  def: number;
  /** 마법저항력 — **마법** 피해를 그 수만큼 깎는다 */
  res: number;
}

/** 아무것도 안 막는다 — 화면이 "맨몸에 몇 들어가나" 를 적을 때 쓴다 */
export const NO_ARMOR: Armor = { def: 0, res: 0 };

/**
 * 때리는 쪽이 들고 나가는 것 — **무슨 피해이고 무엇을 무시하는가.**
 *
 * 한 대를 계산하는 데 필요한 정보가 이 둘뿐이라 한 덩어리로 묶었다. 따로
 * 넘기면 어느 호출에서 종류만 넘기고 관통을 빠뜨리기 쉽다 — 그렇게 빠지면
 * 조용히 안 뚫릴 뿐이라 아무도 모른다.
 */
export interface Blow {
  type: DmgType;
  pierce: Pierce;
}

/** 관통 없는 물리 한 대 — 적 대부분과 옛 계산이 이것이다 */
export const PHYS_BLOW: Blow = { type: 'phys', pierce: NO_PIERCE };

export interface CharDef {
  id: CharId;
  name: string;
  rarity: Rarity;
  role: Role;
  /** 고유장비 이름 — 캐릭터에서 떼어 낼 수 없다 */
  gear: string;
  /** 고유장비 종류. 스프라이트와 강화 문구에 쓴다 */
  gearKind: string;
  /** 강화 +0 일 때의 공격력 */
  /** 공격력 — 한 대의 밑값. 여기에 배수와 치명타가 곱해진다 */
  atk: number;
  /** 체력 */
  hp: number;
  /**
   * 방어력 — 맞을 때마다 **그 수만큼 깎아서** 받는다.
   *
   * 비율이 아니라 뺄셈이다. 비율이면 키울수록 0 에 수렴해서 전투가 안 끝나고,
   * 뺄셈이면 "작은 공격은 거의 안 아프고 큰 공격은 그대로 아프다" 가 된다 —
   * 방어가 앞에 서는 이유가 거기서 나온다.
   *
   * 아무리 깎여도 **최소 1** 은 들어간다. 0 이 되면 그 적은 영원히 못 이긴다.
   */
  def: number;
  /**
   * 마법저항력 — 맞는 **마법** 피해를 그 수만큼 깎는다.
   *
   * `def` 와 완전히 같은 뺄셈이고, 다른 것은 **무엇을 막느냐** 하나다
   * (`Armor`).
   *
   * 지금은 이졸데만 1 이고 나머지는 0 이다. 흔한 값이 아니어야 하는 스탯
   * 이라서다 — 넷이 다 조금씩 갖고 있으면 "마법 피해" 라는 갈래가 그냥
   * 모두에게 조금 덜 아픈 것이 되고, 누구를 앞에 세울지가 안 갈린다.
   *
   * 여기 적는 것은 **강화 +0 일 때**의 값이다. 강화로 방어와 같은 기울기로
   * 자라지만(`statOf`) 밑값이 작아서 실제로 오르는 폭도 작다 — 1 이 최대
   * 강화에서 2 가 되고, 0 은 영영 0 이다.
   */
  res: number;
  /**
   * **평타**가 무슨 피해인가.
   *
   * 스킬은 제 것을 따로 갖는다 (`SkillDef.dmg`). 갈라 둔 이유는 실제로
   * 갈리기 때문이다 — 아녜스는 평타가 마법이지만 기도는 아무도 안 때리고,
   * 반대로 평타는 물리인데 기술만 마법인 사람이 있을 수 있다.
   */
  dmg: DmgType;
  /**
   * **패시브 관통** — 이 사람의 모든 공격이 늘 들고 나가는 것.
   *
   * 안 적으면 없다. 기술 하나에만 붙는 관통은 `SkillDef.pierce` 쪽이고,
   * 둘이 겹치면 더한다 (`blowOf`).
   *
   * 지금은 아무도 없다. 자리를 미리 파 두는 이유는, 나중에 넣을 때
   * **계산까지 같이 고쳐야 하는 상황**을 안 만들기 위해서다.
   */
  pierce?: Partial<Pierce>;
  /**
   * 공격 속도 — **초당 몇 번 치나.**
   *
   * 예전에는 간격(ms)이었다. 그러면 작을수록 빠른 것이라 숫자를 읽을 때마다
   * 뒤집어 생각해야 했고, 화면에 그대로 내걸 수도 없었다. 1.1 이면 초당 1.1회,
   * 간격은 `1000 / spd` 다.
   */
  spd: number;
  /** 치명타 확률 (0~1). 0.15 면 15% */
  crit: number;
  /**
   * 치명타 피해 배수. 1.5 면 150%, 즉 1.5배다.
   *
   * **스킬에도 걸린다.** 공격력 10 · 스킬 140% · 치명타 200% 면
   * 10 × 1.4 × 2 = 28 이다.
   */
  critDmg: number;
  /**
   * ── 레벨 한 칸이 올려 주는 것 ── **사람마다 다르다.**
   *
   * 한동안 누구나 공격 +2% · 체력 +1.6% 였다 (`core/growth` 의 `LV_GROWTH`).
   * 비율이라 기본치가 큰 쪽이 더 많이 올랐고, 그래서 레벨을 올리는 일이
   * 넷 모두에게 **같은 일**이었다 — 누구를 키울지가 곧 누가 원래 센가였다.
   *
   * 고정값으로 바꾸면 사람마다 자라는 방향이 갈린다.
   *
   *   이졸데  공 2.5  체 41   3레벨마다 방어 +1   ← 앞에서 버틴다
   *   비앙카  공 3.75 체 23   7레벨마다 방어 +1   ← 크게 때리고 잘 죽는다
   *   리안느  공 3.25 체 21   8레벨마다 방어 +1   ← 제일 얇다
   *   아녜스  공 1.25 체 34   5레벨마다 방어 +1   ← 오래 산다
   *
   * 방어를 **칸으로 끊는** 이유: 뺄셈으로 들어가는 값이라 (`Armor`) 매
   * 레벨 올리면 금세 모든 공격이 1 이 된다. 몇 레벨마다 한 칸씩이라야
   * "언제 한 칸 오르나" 를 세는 값이 된다.
   */
  perLv: {
    atk: number;
    hp: number;
    /** 방어력과 마법저항력이 **몇 레벨마다** +1 오르나 */
    armorEvery: number;
  };
  /** 어떻게 얻는가 — 도감에 그대로 적는다 */
  from: string;
  /** 지금 빌려 쓰는 그림 (`assets/sprites/avatar/`) */
  art: string;
  /**
   * 때릴 때 터지는 이펙트 (`assets/sprites/hitfx/`).
   *
   * ## 왜 캐릭터마다 그림을 따로 안 그리나
   *
   * 열두 명에게 각자 화려한 공격 애니메이션을 그려 주면 12 × 16프레임 = 192칸이다.
   * 한 장이 잘못 나오면 그 캐릭터만 다시 뽑아야 하고, 새 캐릭터를 넣을 때마다
   * 열여섯 칸이 또 필요하다.
   *
   * 그래서 **몸과 이펙트를 나눈다.** 캐릭터는 짧은 공격 동작(§P 시트의
   * windup·strike·recover) 만 갖고, 화려함은 **공용 이펙트 한 벌**에서 온다.
   * 개성은 "어떤 이펙트가, 어느 각도로, 얼마나 크게" 로 낸다 — 격투 게임이
   * 타격 스파크를 캐릭터 전원이 공유하는 것과 같은 방식이다.
   *
   * 새 캐릭터를 넣을 때 이 한 줄만 고르면 된다.
   */
  fx: HitFx;
  /**
   * 붙어서 싸우나, 떨어져서 싸우나.
   *
   * 화면에서 **서는 자리**를 정한다. 근접은 무대 가운데로 걸어 나가 적과
   * 맞붙고, 원거리는 뒤에 남는다.
   *
   * 전투 계산에는 안 들어간다. 사거리로 피해까지 갈라 버리면 "원거리는 안
   * 맞으니까 원거리만 넣는다" 가 정답이 되어 파티 구성이 죽는다. 맞는 순서는
   * 지금처럼 **역할**이 정한다 (`core/party` 의 `defenseOrder`) — 방어가 앞에
   * 서는 이유가 사거리가 아니라 역할이어야 파티를 짜는 재미가 남는다.
   */
  range: Range;

  /**
   * **첫 번째** 기술 (`SKILLS`). 자주 나가는 쪽이다.
   *
   * 무기가 정한다 — 대검은 검기를 날리고, 도끼는 뛰어들어 찍고, 활은
   * 하늘로 쏘고, 향로는 아군을 회복시킨다.
   */
  skill: SkillKind;
  /**
   * **두 번째부터** 가진 기술들. 안 적으면 `skill` 하나뿐이다.
   *
   * `skill` 과 합쳐서 이 사람이 가진 전부가 된다 (`skillsOf`). 첫 번째를
   * 여기 안 넣는 이유는, 두 곳에 적히면 서로 어긋날 수 있어서다 — `skill`
   * 은 언제나 첫 번째이고 여기는 언제나 그 뒤다.
   *
   * ## 여럿이면 한 스윙에 하나씩 나간다
   *
   * 값이 서로 달라(`SkillDef.cost`) 같은 차례에 둘이 다 찰 수 있는데,
   * 그때 한꺼번에 안 나간다 — **비싼 쪽을 먼저** 내보내고 나머지는 찬 채로
   * 기다린다 (`readySkill`). 비싼 쪽이 먼저인 이유는, 싼 것이 먼저 나가도
   * 비싼 칸은 안 줄어들기 때문이다 — 순서만 미룰 뿐 손해가 없다.
   *
   * 넷 다 두 번째 기술을 갖는다. 첫 번째는 자주 나가는 것이고, 두 번째는
   * 비싸고 **때가 맞아야** 나간다.
   */
  extra?: readonly SkillKind[];

  /*
    아래 셋은 **다 만든 캐릭터에만** 있다.

    열둘을 한 번에 채워 넣는 대신 하나씩 제대로 만들기로 했다 (여기사가 첫
    번째다). 그래서 선택 항목이다 — 없으면 화면이 이름만 쓰고 넘어간다.
    필수로 두면 아직 손 안 댄 열한 명 때문에 빈 문자열을 채워야 하고,
    그러면 "만든 것" 과 "안 만든 것" 이 구분되지 않는다.
  */
  /** 칭호. 이름 위에 작게 붙는다 */
  title?: string;
  /** 이 사람을 한 줄로 — 도감과 모집 결과에 쓴다 */
  quote?: string;
  /** 고유장비 한 줄 설명 */
  gearNote?: string;
}

/** 붙어서 싸우나 떨어져서 싸우나 */
export type Range = 'melee' | 'ranged';

/**
 * 타격 이펙트 여덟 가지.
 *
 * 무기 종류가 아니라 **때리는 방식**으로 갈랐다. 검과 도는 둘 다 베기고,
 * 창과 화살은 둘 다 찌르기다. 그림이 여덟 장이면 충분하다.
 */
// ── 스킬 ────────────────────────────────────────────────────

/**
 * 스킬의 종류.
 *
 * 한 번 쓰는 데 드는 코스트는 기술이 정한다 (`cost`). 평타 한 번에 1 씩 찬다.
 *
 * 처음에는 전원이 "검기를 날린다" 하나였다. 그런데 그러면 도끼든 활이든
 * 향로든 결국 같은 것이 앞으로 날아가고, 캐릭터를 모을 이유가 숫자 차이밖에
 * 안 남는다. **무기가 하는 짓이 달라야 모을 이유가 생긴다.**
 */
/**
 * 기술이 나갈 때의 큰 연출 (`screens/home/SkillFx`).
 *
 *   roar     쓰는 사람에게서 고리가 퍼진다 (도발)
 *   haste    쓰는 사람에게 잔상과 속도선이 붙는다 (광란)
 *   cleanse  걷힌 사람마다 조각이 위로 떠오른다 (정화)
 *   erupt    맞은 적 발밑에서 불기둥이 솟는다 (화산)
 *
 * 앞의 둘은 **쓰는 사람** 자리에서, 뒤의 둘은 **대상** 자리에서 그린다.
 * 그 차이가 곧 "누구에게 일어나는 일인가" 라서, 한 곳에 몰아 그리면
 * 정화가 아녜스에게 걸린 것처럼 보인다.
 */
export type CastFx = 'roar' | 'haste' | 'cleanse' | 'erupt';

export type SkillKind =
  /* ── 첫 번째 기술 — 넷이 처음부터 갖고 있던 것 ── */
  | 'wave'     // 검기 (이졸데)
  | 'leap'     // 강타 (비앙카)
  | 'rain'     // 화살비 (리안느)
  | 'heal'     // 기도 (아녜스)
  /* ── 두 번째 기술 — 비싸고, 때가 맞아야 나간다 ── */
  | 'taunt'    // 도발 (이졸데)
  | 'volcano'  // 화산 (비앙카)
  | 'frenzy'   // 광란 (리안느)
  | 'purify';  // 정화 (아녜스)

export interface SkillDef {
  /** 화면에 적는 이름 */
  name: string;
  /**
   * 아이콘 이름 (`assets/sprites/skill_icon/`).
   *
   * 기술이 한 명당 여러 개가 되면 목록이 되고, 목록에서는 이름보다 아이콘이
   * 먼저 읽힌다. 그림이 아직 없으면 빈 자리로 남을 뿐 목록은 그대로 돈다.
   */
  art: string;
  /**
   * 한 번 쓸 때 몇 번 나가나.
   *
   * 화살비만 여럿이다 — 한 발씩 따로 떨어지고, 떨어질 때마다 그 시점에
   * 살아 있는 놈 중에서 다시 고른다.
   */
  hits: number;
  /**
   * 누구를 때리나.
   *
   *   all     지나가는 길에 있는 **전부** — 검기가 줄을 훑고 지나간다
   *   kind    맞은 놈과 **같은 자리의 무리** — 근접을 찍으면 근접만,
   *           원거리를 찍으면 원거리만. 도약은 한 지점에 떨어지는 것이라
   *           거기 모여 있는 놈들만 휩쓴다
   *   random  아무나 `targets` 마리 — 화살비는 어디에 떨어질지 모른다
   *   none    적을 안 건드린다 (회복형)
   *
   * 세 가지가 서로 다른 상황에서 세다. 검기는 줄이 길수록, 도약은 한 무리가
   * 뭉쳐 있을수록, 화살비는 무리가 갈려 있어도 고르게 들어간다.
   */
  pick: 'all' | 'kind' | 'random' | 'none';
  /**
   * **최대 몇에게 들어가나.** 0 이면 제한 없다.
   *
   * `random` 에서는 몇을 뽑을지이고, `all`·`kind` 에서는 고른 것 중 앞에서부터
   * 몇까지 자를지다. 예전에는 `random` 에서만 쓰는 값이었는데, 기술마다
   * "최대 몇" 이 제각각이 되면서 모두에게 걸리는 값이 됐다.
   */
  targets: number;
  /**
   * 이 기술이 무슨 피해인가.
   *
   * 쓰는 사람의 평타 종류(`CharDef.dmg`)와 **따로다.** 물리로 베는 사람이
   * 마법 기술을 쓸 수도 있고, 그 반대도 된다 — 갈라 두지 않으면 캐릭터
   * 하나가 한 종류에 묶인다.
   *
   * 회복형(`pick: 'none'`)에게도 값이 있다. 아무도 안 때리므로 쓰이지
   * 않지만, 선택으로 두면 "이 기술은 무슨 피해지?" 를 물을 때마다 회복형
   * 인지 아닌지를 먼저 봐야 한다.
   */
  dmg: DmgType;
  /**
   * 이 기술만의 관통. 안 적으면 없다.
   *
   * 쓰는 사람의 패시브 관통(`CharDef.pierce`)과 **더해진다** (`blowOf`).
   */
  pierce?: Partial<Pierce>;
  /** 한 번당 **공격력**에 걸리는 배수 */
  mul: number;
  /**
   * 한 번당 **방어력**에 걸리는 배수.
   *
   * 이졸데의 검기는 공격력의 140% 에 방어력의 100% 를 더한다. 방어를 올리면
   * 버티기만 하던 것이 **공격으로도 돌아온다** — 탱커를 키우는 이유가 "안
   * 죽는다" 하나뿐이면 키울 마음이 잘 안 생긴다.
   *
   * 기본은 0 이다. 대부분의 기술은 공격력만 본다.
   */
  defMul: number;
  /**
   * 회복형만 — **시전자 공격력의 몇 배**를 채우나 (한 명당).
   *
   * `healPct` 와 **더해서** 쓴다.
   */
  heal: number;
  /**
   * 회복형만 — **받는 사람 최대 체력의 몇 할**을 채우나.
   *
   * 둘을 더하는 이유가 있다. 공격력만 보면 사제를 키워야 회복이 늘지만, 파티가
   * 자라 체력이 두 배가 되면 같은 회복량이 절반의 가치가 된다 — 뒤로 갈수록
   * 사제가 쓸모없어진다. 체력 비율만 보면 반대로 사제를 키울 이유가 없다.
   *
   * 섞으면 둘 다 산다: 비율이 **뒤처지지 않게** 받쳐 주고, 공격력이 **키운
   * 만큼** 얹힌다.
   */
  healPct: number;
  /**
   * 무작위로 고를 때 **같은 놈을 두 번 이상 맞혀도 되나.**
   *
   * 평소에는 안 된다 — 화살 셋이 한 놈에게 몰리면 세 대가 한 대가 된다
   * (`skillTargets`). 그런데 적이 하나뿐이면 그 규칙 때문에 셋 중 둘이
   * 허공으로 사라진다.
   *
   * 켜 두면 뽑을 놈이 떨어졌을 때 목록을 다시 채운다. 적이 하나면 네 발이
   * 다 그 하나에게 가고, 넷이면 넷에게 하나씩 간다.
   *
   * 리안느의 강화된 화살이 이걸 켠다 (`core/skillTree` 의 `ea3a`).
   */
  stack?: boolean;
  /**
   * 몸을 떠나 날아가는 것이 있나.
   *
   * 검기와 화살은 날아간다 — 별도 이펙트 시트(`<id>_wave`)를 받아 화면이
   * 따로 움직인다. 도약과 기도는 안 날아간다. 비앙카의 폭발은 `sk_3` 그림
   * 안에 이미 그려져 있어서, 날려 보낼 것이 아예 없다.
   */
  flies: boolean;
  /**
   * 한 번 쓰는 데 드는 **스킬 코스트.**
   *
   * ## 예전에는 "몇 번째 공격마다" 였다 (`every`)
   *
   * 하는 일은 똑같다 — 평타 한 번에 코스트가 1 씩 차고, 다 차면 나가고,
   * 나가면 그만큼 빠진다. 4 짜리는 여전히 네 번에 한 번 나간다.
   *
   * 이름을 바꾼 이유는 **기술이 하나씩이 아니게 됐기 때문**이다. "4번째마다"
   * 는 기술이 하나일 때만 말이 되는 표현이라, 4 짜리와 20 짜리를 같이 가진
   * 사람에게는 "20번째마다" 가 실제로 안 맞는다 (4 짜리가 중간에 나가도
   * 20 짜리 칸은 그대로 차 있어야 한다).
   *
   * 칸을 **기술마다 따로** 센다 (`Charge`). 그래서 값이 큰 기술은 오래
   * 모아야 하고, 조건이 안 맞아 못 쓰면 **찬 채로 기다린다.**
   */
  cost: number;
  /**
   * 걸려 있는 나쁜 것을 걷어내나 — 아녜스의 정화 하나뿐이다.
   *
   * 무엇을 걷을지는 사람이 고른다 (`core/skillOpt`). 여기서는 "이 기술이
   * 그런 종류다" 만 말한다.
   */
  cleanse?: boolean;
  /**
   * 적 전부를 몇 초 동안 **쓰는 사람에게만** 달려들게 하나.
   *
   * 이졸데의 도발 하나다. 걸려 있는 동안 적의 자리 확률(`AIM`)이 통째로
   * 무시되고 전부 이 사람을 노린다 (`core/autoBattle` 의 `aimOf`).
   */
  taunt?: number;
  /**
   * 쓰는 사람 **스스로에게** 거는 것.
   *
   * 리안느의 광란 하나다 — 5초 동안 제 공격속도가 두 배가 된다.
   */
  self?: {
    id: StatusId;
    sec: number;
    /** 배수. 1 보다 크면 좋아지는 쪽이다 (`core/status` 의 `upOf`) */
    mul: number;
    /**
     * 걸려 있는 동안 **코스트가 안 차나.**
     *
     * 이게 없으면 광란이 스스로를 되먹인다 — 두 배로 때리니 코스트도 두 배로
     * 차고, 5초가 끝나기 전에 다시 켤 만큼 모인다. 그러면 켜 두는 것이
     * 기본값이 되어 고를 것이 없어진다.
     */
    noCharge?: boolean;
  };
  /**
   * 맞은 **적에게** 거는 것.
   *
   * 비앙카의 화산 하나다 — 5초 동안 그놈이 받는 회복이 절반이 된다.
   */
  foeHex?: { id: StatusId; sec: number; mul: number };
  /**
   * 켜고 끄는 것을 사람이 고를 수 있나 (`core/skillOpt`).
   *
   * 정화 하나뿐이다. 나머지는 차면 나간다 — 고를 것이 없는 기술에 설정을
   * 달아 두면 창만 복잡해진다.
   */
  opt?: boolean;
  /**
   * 나갈 때 화면에서 터지는 **큰 연출** (`screens/home/SkillFx`).
   *
   * 발밑 표시(`aura`)와 다른 것이다. 저건 "지금 기술을 쓰는 중" 을 말하는
   * 작은 고리이고, 이건 **그 기술이 무슨 일을 하는가**를 그린다.
   *
   * ## 왜 새로 필요했나
   *
   * 두 번째 기술 넷 중 셋이 **아무도 안 때린다** (도발·광란·정화). 때리는
   * 기술은 맞은 자리에서 불꽃이 터지고 숫자가 뜨므로 화면이 알아서 설명되는데,
   * 이쪽은 몸짓 말고는 아무 일도 안 일어난다 — 코스트 20 을 모아 쓴 정화가
   * 화면에서는 "잠깐 무릎 꿇었다" 로 끝난다.
   *
   * **그림을 안 받는다.** 넷 다 도형과 움직임으로만 그린다 (`SkillFx`) —
   * 퍼지는 고리, 잔상, 위로 걷혀 올라가는 조각, 솟는 불기둥. 1-bit 흑백에서
   * 이런 것은 시트로 받으면 오히려 흰 얼룩이 된다.
   */
  cast?: CastFx;
  /**
   * 맞은 자리에서 터지는 그림.
   *
   * 캐릭터의 평타 이펙트(`CharDef.fx`)와 **따로 둔다.** 같이 쓰면 큰 기술을
   * 썼는데 화면에서는 평타와 똑같이 보인다 — 실제로 궁수가 그랬다. 평타도
   * 화살비도 `thrust`(터지는 빛) 라서, 다섯 발을 흩뿌려도 평소와 구분이
   * 안 됐다.
   *
   * 없으면 평타 것을 쓴다.
   */
  fx?: HitFx;
  /**
   * 몸이 통째로 적진까지 날아가나.
   *
   * **유추하지 않는다.** 한동안 "가로로 안 날아가고 적을 때리는 기술" 이면
   * 뛰어드는 것으로 쳤는데, 화살비를 그 조건에 맞게 고치자마자 활잡이가
   * 도끼처럼 뛰어올라 찍었다. 두 기술이 우연히 같은 모양의 조건을 만족했을
   * 뿐이고 실제로 공통점은 없다.
   */
  leaps: boolean;
  /**
   * 쓰는 동안 몸에서 나는 표시 (`SkillAura`).
   *
   *   none  없음 — 도약은 몸이 화면을 가로질러 날아가므로 표시가 필요 없다.
   *         오히려 뭐가 더 붙으면 정작 봐야 할 착지 폭발이 묻힌다
   *   ring  발밑에 퍼지는 고리 — 서서 휘두르는 기술
   *   rune  발밑에 그려졌다 터지는 마법진 — 자리를 잡고 쏘는 기술
   *   ash   발밑에서 피어오르는 재 — 향로를 흔드는 기술
   *
   * **넷이 다 달라야 한다.** 몸짓이 달라도 발밑이 같으면 54px 에서는 같은
   * 기술로 보인다. 새 캐릭터를 넣을 때 여기가 겹치는지부터 본다.
   */
  aura: 'none' | 'ring' | 'rune' | 'ash';
  /**
   * 스킬 세 칸을 각각 몇 ms 씩 보여 주나. 없으면 기본 박자.
   *
   * 기술마다 "읽히는 데 걸리는 시간" 이 다르다. 베기는 순간이라 짧아도 되지만,
   * 뛰어올랐다 떨어지는 것은 **떠 있는 시간이 곧 높이**라 길어야 하고, 무릎
   * 꿇고 기도하는 것은 서두르면 기도로 안 보인다.
   */
  beat?: readonly [number, number, number];
  /**
   * 몇 번째 칸에서 피해(또는 회복)가 들어가나. 1부터 센다.
   *
   * 스킬 그림은 세 칸인데 **닿는 칸이 기술마다 다르다.** 검기는 베는 2번
   * 칸에서 떠나고, 도약은 착지하는 3번 칸에서 터진다. 여기를 안 나누면
   * 비앙카가 공중에 뜬 채로 적이 죽는다.
   */
  landOn: 1 | 2 | 3;
  /** 한 줄 설명 */
  desc: string;
}

export const SKILLS: Record<SkillKind, SkillDef> = {
  /*
    검기 — 횡으로 베며 날린다.

    앞에서부터 셋을 훑는다. 검기가 왼쪽에서 오른쪽으로 지나가므로 맞는 놈도
    앞에서부터여야 한다 — 무작위로 고르면 지나간 자리와 체력이 닳는 놈이
    안 맞는다.
  */
  wave: {
    /* 줄을 가로질러 지나가므로 **길에 있는 전부**가 맞는다 */
    name: '검기', art: 'sk_wave', hits: 1, pick: 'all', targets: 0,
    /* 검으로 벤다 — 날아가도 베는 것이다 */
    dmg: 'phys',
    mul: 1.4, defMul: 1.0, heal: 0, healPct: 0,
    flies: true, landOn: 2, cost: 4, aura: 'ring', leaps: false,
    /* 이졸데의 평타는 `holy`(빛). 스킬은 길게 훑는 베기라 조각이 튄다 */
    fx: 'cross',
    desc: '지나가는 길의 적을 모두 벤다',
  },

  /*
    도약 — 적진 한가운데로 뛰어들어 내리찍는다.

    **한 방이다.** 그래서 우두머리처럼 한 마리만 서 있을 때 제일 세다 —
    나뉘지 않으니까. 대신 뛰어드는 동안은 앞줄을 비운다는 게 설정상의 대가고,
    지금 전투 계산에는 안 들어간다 (맞는 순서는 역할이 정한다).
  */
  leap: {
    /*
      한 지점에 떨어진다. 그래서 **거기 모여 있는 무리**만 휩쓴다 —
      앞줄로 뛰어들면 근접만, 뒷줄로 뛰어들면 원거리만.
    */
    /*
      **둘에서 셋으로.** 앞줄이든 뒷줄이든 한쪽 무리를 통째로 휩쓰는
      기술인데 (`pick: 'kind'`), 둘까지만 맞으면 셋이 선 줄에서 하나가
      늘 남는다 — 휩쓴다는 말이 화면에서 안 맞는다.
    */
    name: '강타', art: 'sk_leap', hits: 1, pick: 'kind', targets: 3, dmg: 'phys',
    mul: 1.5, defMul: 0, heal: 0, healPct: 0,
    flies: false, landOn: 3, cost: 5, aura: 'none', leaps: true,
    /* 솟음 · 낙하 · 착지. 떠 있는 시간이 곧 높이다 */
    beat: [260, 170, 250],
    /* 평타도 `smash` 지만 이쪽은 1.4배로 터진다 (`blast`) — 크기가 구분한다 */
    fx: 'smash',
    desc: '적진으로 뛰어들어 그 자리의 무리를 휩쓴다',
  },

  /*
    화살비 — 하늘로 쏴서 흩뿌린다.

    다섯 발이 **한 발씩 따로**, 그때마다 무작위로 떨어진다. 한 놈에게 몰릴
    수도 있고 고루 퍼질 수도 있다. 이게 검기와 갈리는 지점이다 — 검기는
    어디에 들어갈지 알고, 화살비는 모른다.
  */
  /*
    `flies` 가 false 인 이유 — 화살은 분명히 날아가지만 **가로로 안 간다.**
    하늘로 올라갔다가 딴 데 떨어지므로, 검기처럼 몸에서 오른쪽으로 지나가는
    연출(`SwordWave`)로는 못 그린다. 떨어지는 쪽은 맞는 적 위에서 그린다
    (`BattleView` 의 `arrow`).

    원거리의 **평타**는 가로로 날아간다. 그건 `range` 가 정한다.
  */
  rain: {
    /* 하늘에서 흩어져 떨어진다 — 아무나 셋 */
    name: '화살비', art: 'sk_rain', hits: 3, pick: 'random', targets: 3, dmg: 'phys',
    mul: 1.5, defMul: 0, heal: 0, healPct: 0,
    /* 무릎 꿇고 자리를 잡는 기술이라 발밑에 마법진이 어울린다 */
    flies: false, landOn: 3, cost: 4, aura: 'rune', leaps: false,
    /*
      평타는 `thrust`(정면으로 터지는 빛) — 화살 한 대가 꽂히는 그림이다.
      화살비는 하늘에서 떨어져 땅에 박히는 것이라 **흙먼지**가 맞다.
      다섯 자리에서 동시에 피어오르면 평타와 한눈에 갈린다.
    */
    fx: 'chaos',
    desc: '하늘로 쏜 화살이 세 마리에게 떨어진다',
  },

  /*
    기도 — 아군 전원을 회복시킨다.

    **적을 안 때린다.** 보조 캐릭터의 스킬이 결국 약한 공격이면 보조를 넣을
    이유가 없다. 넷 중 하나를 회복에 쓰는 값이 분명해야 파티를 짜는 선택이
    생긴다.

    쓰러진 사람은 안 일으킨다 — 그건 스테이지를 다시 시작할 때만이다.
    회복이 전멸을 취소해 버리면 아무도 안 죽는다.
  */
  heal: {
    name: '기도', art: 'sk_heal', hits: 1, pick: 'none', targets: 0,
    /* 아무도 안 때리므로 안 쓰이는 값이다. 쓰는 사람을 따라 마법으로 적는다 */
    dmg: 'magic',
    mul: 0, defMul: 0,
    heal: 1.0, healPct: 0.15,
    /*
      **발밑에 아무것도 안 깐다.**

      한동안 재(`ash`)를 피워 뒀는데, 무릎 꿇고 가만히 있는 사람 발밑에서
      연기가 돌면 그게 기도가 아니라 **또 하나의 공격 기술**로 읽힌다.
      이 사람이 화면에서 하는 일은 둘뿐이어야 한다 — 향로를 휘두르는 평타와,
      무릎 꿇는 기도. 기도의 이펙트는 제 발밑이 아니라 **받는 사람 머리 위**
      에서 내려온다 (`BlessGlow`).
    */
    flies: false, landOn: 2, cost: 4, aura: 'none', leaps: false,
    /*
      느리다. 무릎 꿇고 → 기도하고 → 일어선다 를 0.49초에 하면 주저앉았다
      벌떡 일어나는 것으로 보인다. 가운데(기도하는 칸)를 길게 잡는다 —
      멈춰 있는 것이 이 기술의 내용이다.
    */
    beat: [300, 520, 300],
    desc: '아군 전원의 체력을 채운다',
  },

  /*
    ── 두 번째 기술 넷 ──

    첫 넷과 **다른 일을 한다.** 저쪽은 전부 "때리거나 채운다" 였는데, 이쪽은
    도발 · 정화 · 자기 강화 · 회복 차단이다. 같은 축을 하나 더 얹으면 그냥
    센 기술이 되고, 그러면 파티를 짤 때 고를 것이 안 늘어난다.

    코스트가 비싸서 판마다 몇 번 안 나간다 (8 ~ 20). 그래서 **나가는 순간이
    보여야 한다** — 넷 다 몸짓이 크고 발밑 표시가 첫 기술과 다르다.
  */

  /*
    도발 — 크게 포효해 적 전부를 자기 쪽으로 끌어온다.

    맨 앞에 서서 안 비키는 사람의 기술이다. 자리 확률(`AIM`)은 앞에 선
    사람이 절반을 받는다는 뜻이라, 뒤에 선 셋도 나머지 절반을 나눠 맞는다 —
    리안느(체력 150)가 그 절반에 두 번 걸리면 그냥 죽는다.

    10초 동안 그 확률이 **통째로 사라진다.** 이졸데가 다 받는다.
  */
  taunt: {
    name: '도발', art: 'sk_taunt', hits: 1, pick: 'none', targets: 0,
    /* 아무도 안 때린다. 쓰는 사람을 따라 물리로 적는다 */
    dmg: 'phys',
    mul: 0, defMul: 0, heal: 0, healPct: 0,
    flies: false, landOn: 2, cost: 15, aura: 'rune', leaps: false,
    taunt: 10,
    /* 포효라 소리가 퍼지는 그림이다 — 몸에서 고리가 나간다 */
    cast: 'roar',
    /* 숨을 들이켜고 → 외치고 → 자세를 되돌린다. 가운데가 길어야 포효로 보인다 */
    beat: [220, 400, 220],
    desc: '10초간 적 전부가 자신만 노리게 한다',
  },

  /*
    화산 — 제자리에서 땅을 내리치면 적 발밑에서 불길이 솟는다.

    **한 마리만** 맞는다. 강타(둘)보다 좁은 대신 배수가 크고, 무엇보다
    5초 동안 그놈이 받는 회복을 절반으로 깎는다 — 스스로 차는 우두머리
    (10판 흡혈 · 20판 15초 회복 · 광폭화의 초당 1%)를 상대할 유일한 수단이다.

    비앙카가 **안 움직인다.** 강타는 몸이 날아가고 이건 발밑에서 터지므로,
    같은 사람이 쓰는 두 기술이 화면에서 확실히 갈린다.
  */
  volcano: {
    name: '화산', art: 'sk_volcano', hits: 1, pick: 'random', targets: 1,
    /* 도끼로 때리는 사람인데 이건 **불**이다 — 마법저항력이 막는다 */
    dmg: 'magic',
    mul: 2.4, defMul: 0, heal: 0, healPct: 0,
    flies: false, landOn: 3, cost: 8, aura: 'ring', leaps: false,
    /* 회복을 반으로 — 걸리는 쪽이 **적**이다 (`applySkill`) */
    foeHex: { id: 'st_wither', sec: 5, mul: 0.5 },
    /* 맞은 놈 발밑에서 아래서 위로 솟는다 — 비앙카 쪽에서는 아무것도 안 난다 */
    cast: 'erupt',
    /* 평타도 `smash` 지만 이건 불이라 마법진 폭발로 터진다 */
    fx: 'arcane',
    /* 내리치고 → 땅이 갈라지고 → 솟는다. 마지막 칸에서 맞는다 */
    beat: [200, 170, 320],
    desc: '한 마리 발밑에서 불길이 솟는다. 5초간 그 적의 회복량 50% 감소',
  },

  /*
    광란 — 5초 동안 제 공격속도가 두 배.

    **코스트가 안 찬다** (`self.noCharge`). 그게 없으면 두 배로 때리는 동안
    코스트도 두 배로 차서, 5초가 끝나기 전에 다시 켤 만큼 모인다 — 켜 두는
    것이 기본값이 되면 고를 것이 없어진다.

    그래서 실제로는 "화살비를 잠깐 포기하고 평타를 두 배로 쏟는다" 가 된다.
  */
  frenzy: {
    name: '숲의 축복', art: 'sk_frenzy', hits: 1, pick: 'none', targets: 0, dmg: 'phys',
    mul: 0, defMul: 0, heal: 0, healPct: 0,
    flies: false, landOn: 2, cost: 10, aura: 'ash', leaps: false,
    self: { id: 'st_haste', sec: 5, mul: 2, noCharge: true },
    cast: 'haste',
    beat: [180, 260, 180],
    desc: '5초간 자신의 공격속도가 두 배가 된다 (그동안 코스트가 안 찬다)',
  },

  /*
    정화 — 아군에게 걸린 나쁜 것을 걷어낸다.

    ## 걷을 것이 없으면 안 쓴다

    코스트가 꽉 차도 그냥 들고 있는다 (`core/skillOpt` 의 `cleanseTargets`).
    스무 번을 모아서 아무것도 안 걷어내면 그건 스무 번을 버린 것이다.

    ## 본인이 기절해 있으면 못 쓴다

    기절은 몸이 안 움직이는 것이라 기술 자체가 안 나간다 (`Fighter`).
    침묵도 마찬가지다. 대신 **자기 몸에 걸린 것은 스스로 걷을 수 있다** —
    나쁜 것이 다 CC 는 아니기 때문이다.
  */
  purify: {
    name: '정화', art: 'sk_purify', hits: 1, pick: 'none', targets: 0, dmg: 'magic',
    mul: 0, defMul: 0, heal: 0, healPct: 0,
    flies: false, landOn: 2, cost: 20, aura: 'ash', leaps: false,
    cleanse: true, opt: true,
    /* 걷힌 **사람마다** 난다 — 아녜스 자리에서 나면 누가 풀렸는지 안 보인다 */
    cast: 'cleanse',
    /* 기도와 같은 자세라 박자도 비슷하게. 가운데에서 걷힌다 */
    beat: [280, 420, 260],
    desc: '아군에게 걸린 나쁜 것을 걷어낸다',
  },
};

/**
 * 이 사람이 쓰는 기술.
 *
 * 표를 직접 뒤지지 않고 여기를 지난다. 명단에 없는 id 가 들어오면 검기로
 * 떨어뜨린다 — 캐릭터를 한 명씩 늘리는 중이라, 저장본에 남아 있는 옛 id 나
 * 시험용으로 끼워 넣은 사람 때문에 전투가 통째로 멈추면 안 된다.
 */
/**
 * 이 사람이 날려 보내는 것의 스프라이트 세트.
 *
 * 근접은 검기(`<id>_wave`), 원거리는 화살(`<id>_shot`)이다.
 *
 * 이름을 갈라 두는 이유는 **활잡이가 한 장으로 다 쓰기 때문**이다. 평타로 쏘는
 * 화살과 스킬로 떨어지는 화살이 같은 그림이라 시트가 하나뿐이고, 그걸 검기와
 * 같은 이름으로 부르면 "검기 시트가 없는데 검기를 쏜다" 가 된다.
 *
 * 화살을 두 벌 받지 않는 것은 그림의 문제이기도 하다 — 평타 화살과 스킬 화살이
 * 미묘하게 달라지면 같은 사람이 쏘는 것으로 안 보인다.
 */
export function projSet(id: string): string {
  const def = (CHARS as Record<string, CharDef | undefined>)[id];
  return `${id}_${def?.range === 'ranged' ? 'shot' : 'wave'}`;
}

/** 떨어져서 싸우는 사람인가. 명단에 없는 id 는 근접으로 본다 */
export function isRangedChar(id: string): boolean {
  return (CHARS as Record<string, CharDef | undefined>)[id]?.range === 'ranged';
}

/** 그 세트 안에서 화면이 실제로 쓰는 칸 — 어느 쪽이든 첫 칸 하나다 */
export function projFrame(id: string): string {
  const def = (CHARS as Record<string, CharDef | undefined>)[id];
  return def?.range === 'ranged' ? 'shot_1' : 'wave_1';
}

export function skillOf(id: string): SkillDef {
  const def = (CHARS as Record<string, CharDef | undefined>)[id];
  return SKILLS[def?.skill ?? 'wave'];
}

/**
 * 그 캐릭터가 가진 기술 **전부**.
 *
 * **순서가 곧 자리 번호다.** 0 번이 `skill`, 그다음이 `extra` 순서 그대로다.
 * 화면과 계산이 "몇 번째 기술" 로 서로 말을 맞추므로(`applySkill` 의 `slot`),
 * 이 순서가 흔들리면 그린 기술과 들어간 기술이 갈린다.
 *
 * 지금은 넷 다 하나씩이라 늘 한 칸짜리다.
 */
export function skillsOf(id: string): SkillDef[] {
  const d = (CHARS as Record<string, CharDef | undefined>)[id];
  /* 첫 번째는 늘 `skill` 이고, 나머지가 `extra` 다 — 순서가 곧 자리 번호다 */
  return [skillOf(id), ...(d?.extra ?? []).map((k) => SKILLS[k])];
}

/**
 * ── 스킬 트리가 손본 기술 목록 ──
 *
 * `skillsOf` 는 **표에 적힌 그대로**를 준다. 이건 거기에 찍어 둔 갈래를
 * 얹은 것이다 (`core/skillTree` 의 `OwnedChar.tree`).
 *
 * ## 왜 표를 안 고치고 여기서 얹나
 *
 * 표(`SKILLS`)는 **모두가 함께 쓰는 것**이다. 거기서 정화의 코스트를 15 로
 * 내리면 아녜스를 안 키운 사람의 정화도 같이 싸진다.
 *
 * ## 이름으로 찾는다 — 자리 번호가 아니라
 *
 * `skillsOf` 의 순서가 곧 자리 번호이지만 (`Charge`), 여기서는 종류로
 * 찾는다. 자리 번호로 짜 두면 나중에 기술을 하나 끼워 넣는 날 갈래가
 * 조용히 엉뚱한 기술에 붙는다 — 그건 화면 어디에도 안 나온다.
 *
 * ## 안 찍은 사람은 같은 배열을 돌려받는다
 *
 * 찍은 것이 없으면 `skillsOf` 의 결과를 그대로 준다. 이 함수는 스윙마다
 * 불리므로 (`Fighter`), 아무것도 안 바꿀 때는 아무것도 안 만들어야 한다.
 */
export function skillsFor(c: OwnedChar): SkillDef[] {
  const base = skillsOf(c.id);
  const on = c.tree;
  if (!on || !on.length) return base;
  const has = (id: string) => on.includes(id);

  return base.map((sk) => {
    /*
      ── 파쇄의 태세 ── 이졸데가 방패를 버리고 검을 든다.

      검기가 방어를 뚫고, 싸지고, 1.5배가 된다. 대신 불굴의 맹세가 꺼진다 —
      그 갈래는 `core/passives` 에서 본다.
    */
    if (has('kg3b') && sk.name === '검기') {
      return {
        ...sk,
        cost: Math.max(1, sk.cost - 1),
        mul: sk.mul * 1.5,
        /* 물리 관통 — 검기는 베는 것이라 마법 쪽은 건드릴 것이 없다 */
        pierce: { phys: true, magic: false },
      };
    }
    /*
      ── 강화된 화살 ── 셋에서 넷으로, 그리고 싸게.

      `hits` 도 같이 올린다. 저건 화면이 화살을 몇 발 그리나이므로
      (`BattleView`), 대상만 넷으로 늘리면 네 놈에게 세 발이 떨어진다.
    */
    if (has('ea3a') && sk.name === '화살비') {
      return {
        ...sk,
        cost: Math.max(1, sk.cost - 1),
        hits: 4,
        targets: 4,
        /* 적이 하나면 네 발이 다 그 하나에게 (`SkillDef.stack`) */
        stack: true,
      };
    }
    /* ── 정화의 손길 ── 20 → 15 */
    if (has('nu3b') && sk.name === '정화') {
      return { ...sk, cost: Math.max(1, Math.round(sk.cost * 0.75)) };
    }
    return sk;
  });
}

/**
 * ── 스킬 코스트 ──
 *
 * 사람마다 **기술 수만큼의 칸**을 들고 있다. 평타를 한 번 칠 때마다 모든
 * 칸이 1 씩 차고, 어떤 기술이 나가면 **그 칸에서만** 그 기술의 값을 뺀다.
 *
 * ## 왜 칸을 따로 두나
 *
 * 예전에는 스윙 횟수 하나만 세고 `n % every === 0` 으로 봤다. 기술이 하나일
 * 때는 같은 말이지만, 4 짜리와 20 짜리를 같이 가지면 어긋난다 — 4 짜리가
 * 나갔다고 20 짜리 칸까지 0 이 되면 20 짜리는 영영 안 나간다.
 *
 * 칸이 따로면 **비싼 것은 오래 모으고, 싼 것은 그 사이에 계속 나간다.**
 * 그게 코스트라는 말이 실제로 뜻하는 바다.
 *
 * ## 다 차도 안 쓸 수 있다
 *
 * 정화는 걷어낼 것이 없으면 **찬 채로 기다린다** (`readySkill` 의 `allow`).
 * 다 찼다고 무조건 쓰면 스무 번 모은 것을 아무 일 없이 버린다.
 */
export type Charge = readonly number[];

/** 갓 시작한 사람의 칸들 — 전부 0 */
export const newCharge = (c: OwnedChar): number[] => skillsFor(c).map(() => 0);

/**
 * 저장된(또는 파티가 바뀌어 길이가 안 맞는) 칸을 다듬는다.
 *
 * 기술 수가 바뀌면 길이가 안 맞는다. 짧으면 0 으로 채우고, 길면 자른다 —
 * 없는 자리를 읽어 `undefined` 로 비교하면 그 기술이 영영 안 나간다.
 */
export function fitCharge(c: OwnedChar, on: Charge | undefined): number[] {
  const list = skillsFor(c);
  return list.map((sk, i) => {
    const v = on?.[i];
    return Number.isFinite(v) ? Math.max(0, Math.min(sk.cost, v as number)) : 0;
  });
}

/**
 * 평타 한 번 — 모든 칸이 `by` 만큼 찬다.
 *
 * **제 값에서 멈춘다.** 넘치게 두면 못 쓰는 동안 쌓였다가 조건이 맞는
 * 순간에 두세 번이 연달아 나간다 — 코스트가 20 인 뜻이 사라진다.
 */
export function chargeUp(c: OwnedChar, on: Charge, by = 1): number[] {
  const list = skillsFor(c);
  return list.map((sk, i) => Math.min(sk.cost, (on[i] ?? 0) + by));
}

/**
 * 지금 나갈 수 있는 기술의 자리 — 없으면 -1 (평타).
 *
 * **비싼 것이 먼저다.** 둘이 같이 찼을 때 싼 것을 먼저 내보내면 비싼 칸은
 * 그대로 차 있으므로 다음 스윙에 나간다 — 순서만 미룰 뿐 손해가 없다.
 * 반대로 하면 비싼 것이 나가는 동안 싼 것이 계속 밀린다.
 *
 * @param allow 그 자리를 지금 실제로 쓸 수 있나. 안 주면 다 쓸 수 있다.
 *              정화가 이걸로 "걷을 것이 없으면 안 쓴다" 를 말한다
 */
export function readySkill(
  c: OwnedChar, on: Charge, allow?: (slot: number) => boolean,
): number {
  const list = skillsFor(c);
  let best = -1;
  let bestCost = -1;
  for (let i = 0; i < list.length; i++) {
    const sk = list[i];
    /* 값이 0 이하면 안 도는 기술이다 — 늘 차 있는 셈이라 매 스윙 나간다 */
    if (sk.cost <= 0) continue;
    if ((on[i] ?? 0) < sk.cost) continue;
    if (allow && !allow(i)) continue;
    if (sk.cost > bestCost) { best = i; bestCost = sk.cost; }
  }
  return best;
}

/** 그 기술을 썼다 — **그 칸에서만** 값을 뺀다 */
export function spendCharge(c: OwnedChar, on: Charge, slot: number): number[] {
  const list = skillsFor(c);
  return list.map((sk, i) => (
    i === slot ? Math.max(0, (on[i] ?? 0) - sk.cost) : Math.min(sk.cost, on[i] ?? 0)
  ));
}

/**
 * 강제로 깎인다 — 20판 태고의 성난 벼락.
 *
 * **절반으로 되돌린다.** 0 으로 만들면 기술이 갓 나간 직후에 맞았을 때
 * 아무 일도 안 일어난 것과 같아서, 맞은 사람은 뭘 잃었는지 모른다.
 */
export function cutCharge(c: OwnedChar, on: Charge, ratio = 0.5): number[] {
  return skillsFor(c).map((_sk, i) => Math.floor((on[i] ?? 0) * ratio));
}

/** 그 자리 기술의 코스트 (없는 자리는 0) */
export const costOf = (c: OwnedChar, slot: number): number =>
  skillsFor(c)[slot]?.cost ?? 0;

export type HitFx =
  | 'slash'    // 한 번 베기 — 검
  | 'cross'    // 열십자 베기 — 빠른 연타
  | 'thrust'   // 찌르기 직선 — 창·화살
  | 'smash'    // 내려찍기 충격파 — 망치·도끼
  | 'arcane'   // 마법진 폭발 — 지팡이
  | 'star'     // 별가루 — 마법소녀
  | 'holy'     // 빛기둥 — 무녀·기사
  | 'chaos';   // 어지러운 파편 — 광대·수집가

export const HIT_FX_LIST: HitFx[] =
  ['slash', 'cross', 'thrust', 'smash', 'arcane', 'star', 'holy', 'chaos'];

/*
  숫자를 읽는 법.

  · 공격 × (1000 / 간격) 이 초당 딜이다. 딜러는 대략 12~15, 방어는 4~6,
    보조는 6~8 에 맞춰 뒀다. 보조는 스스로 때리는 대신 파티를 올린다.
  · 체력은 방어가 딜러의 두 배쯤이다. 방어가 앞에서 다 받으므로
    (`autoBattle` 의 `frontOf`) 그만큼 두꺼워야 한 웨이브를 버틴다.
  · 기본 4종은 등급이 C 라 성장률이 낮은 대신 기본치를 조금 높게 줬다.
    처음 고른 캐릭터가 열 웨이브 만에 짐이 되면 안 된다.
*/
export const CHARS: Record<CharId, CharDef> = {
  /*
    ── 여기사 ── 처음으로 제대로 만든 캐릭터.

    파티에서 하는 일이 분명해야 한다. 이 사람은 **맨 앞에 서서 안 비킨다** —
    `defenseOrder` 가 방어를 제일 앞에 세우므로, 파티에 넣는 순간 뒤에 선
    딜러가 그만큼 안 맞는다. 그게 S 등급인 이유고, 체력이 340 인 이유다.

    공격도 14 로 낮지 않다. 방어를 순수한 샌드백으로 만들면 "넣으면 오래
    버티는데 진행은 느려지는" 물건이 되어, 넣을지 말지가 계산 문제가 된다.
    앞에 서면서 자기 몫도 하게 두는 편이 고르는 재미가 있다.
  */
  knightgirl: {
    id: 'knightgirl', name: '이졸데', title: '서약의 백기사',
    rarity: 'epic', role: 'guard',
    quote: '맹세를 지키느라 한 번도 뒤로 물러선 적이 없다.',
    gear: '서약검 여명', gearKind: 'sword',
    gearNote: '무릎 꿇고 받은 검. 날에 새긴 맹세가 아직 지워지지 않았다.',
    /*
      **넷 중 유일하게 마법저항력이 있다** (1). 방어력 5 와 나란히 두면
      "앞에 서는 사람" 이 물리만 받아 주는 게 아니라는 뜻이 된다.

      1 인 것이 적어 보이지만 뺄셈이라 그렇지 않다 (`Armor`) — 마법 평타
      한 대가 8 이면 8분의 1 이 늘 깎인다. 지금 마법으로 때리는 적이
      없으므로 실제로는 아직 아무 일도 안 한다 (`docs/FOE_TABLE.md`).
    */
    atk: 15, hp: 300, def: 5, res: 1, spd: 0.8, crit: 0, critDmg: 1.5,
    perLv: { atk: 2.5, hp: 41, armorEvery: 3 },
    /* 검으로 벤다 */
    dmg: 'phys',
    from: '업적 · 파티 강화 합계 60 달성', fx: 'holy', range: 'melee', skill: 'wave',
    extra: ['taunt'], art: 'knightgirl',
  },

  /*
    이졸데와 정반대로 세운다.

    이졸데는 앞에서 버티느라 공격이 낮고, 비앙카는 크게 때리는 대신 잘 죽는다
    (체력이 이졸데의 절반 남짓). 그래서 둘이 같이 서면 각자 할 일이 생긴다 —
    첫 두 사람이 같은 방향이면 파티를 짤 게 없다.

    공격 간격이 제일 느리다. 도끼는 한 번 돌면 제 무게로 계속 돌아서 되돌아
    오는 데 시간이 걸린다는 설정이고, 스킬이 **공격 횟수**로 도는 지금 구조
    에서는 그게 곧 "스킬이 드물다" 가 된다. 도약 강타는 거기에 더해 다섯 번에
    코스트가 5 라(`SKILLS.leap.cost`), 한 방이 센 대신 정말 가끔 나간다.
  */
  bunnyaxe: {
    id: 'bunnyaxe', name: '비앙카', title: '연회장의 도끼',
    rarity: 'epic', role: 'dealer',
    quote: '박수는 나중에 쳐. 아직 한 곡 남았어.',
    gear: '축배의 도끼', gearKind: 'axe',
    gearNote: '연회장에서 집어 온 것. 무엇을 자르려고 만든 물건인지는 안 물었다.',
    atk: 25, hp: 200, def: 2, res: 0, spd: 0.7, crit: 0, critDmg: 2.0,
    perLv: { atk: 3.75, hp: 23, armorEvery: 7 },
    /* 도끼로 찍는다 */
    dmg: 'phys',
    from: '모집', fx: 'smash', range: 'melee', skill: 'leap',
    extra: ['volcano'], art: 'bunnyaxe',
  },

  /*
    셋 중 유일한 원거리.

    사거리는 **서는 자리만** 정한다 (`Range`). 그래서 뒤에 남는 대신, 맞는
    순서는 역할이 정하므로 이졸데가 앞에 선다 — 리안느가 안전한 건 사거리
    덕이 아니라 앞에 방어가 있어서다. 그게 파티를 짜는 이유가 된다.

    공격 간격이 제일 짧다. 활은 한 번 당겼다 놓으면 끝이라 되돌아올 무게가
    없다. 스킬이 평타 횟수로 차는 구조라(`SkillDef.cost`) 그만큼 화살비도
    자주 나간다 — 한 방은 약한 대신 자주 흩뿌리는 쪽이다.
  */
  elfarcher: {
    id: 'elfarcher', name: '리안느', title: '숲의 마지막 활',
    rarity: 'epic', role: 'dealer',
    quote: '나무는 다 베어 갔어. 활은 아직 여기 있고.',
    gear: '마른가지 곡궁', gearKind: 'bow',
    gearNote: '베어 나간 숲에서 하나 남은 가지로 깎았다. 아직 마르는 중이다.',
    atk: 20, hp: 150, def: 1, res: 0, spd: 1.1, crit: 0, critDmg: 2.0,
    perLv: { atk: 3.25, hp: 21, armorEvery: 8 },
    /* 화살이다 */
    dmg: 'phys',
    from: '모집', fx: 'thrust', range: 'ranged', skill: 'rain',
    extra: ['frenzy'], art: 'elfarcher',
  },

  /*
    넷 중 유일한 보조.

    혼자서는 아무것도 못 한다 — 공격이 넷 중 제일 낮고, 기술은 적을 아예
    안 때린다. 대신 **파티 전체의 공격을 올리고**(`supportMul`) 체력을
    채운다. 그래서 이 사람을 넣는다는 것은 한 자리를 공격에 안 쓰겠다는
    선택이 되고, 거기서 파티를 짜는 재미가 생긴다.

    체력은 두 번째로 높다. 앞에서 버티지는 않지만 오래 살아 있어야 값을
    한다 — 회복이 한 번 끊기면 파티가 통째로 무너진다.
  */
  nun: {
    id: 'nun', name: '아녜스', title: '재를 뿌리는 사제',
    rarity: 'epic', role: 'support',
    quote: '다치는 건 상관없어요. 혼자 다치지만 않으면.',
    gear: '잿빛 종 향로', gearKind: 'censer',
    gearNote: '불타는 예배당에서 하나 건져 나왔다. 아직 재 냄새가 난다.',
    atk: 10, hp: 150, def: 1, res: 0, spd: 0.5, crit: 0, critDmg: 1.5,
    perLv: { atk: 1.25, hp: 34, armorEvery: 5 },
    /*
      **넷 중 유일하게 평타가 마법이다.**

      향로를 흔드는 사람이 칼처럼 때릴 수는 없다는 설정이기도 하지만,
      규칙 쪽 이유가 더 크다 — 물리를 막는 적이 나올 때 파티에 대답이
      하나는 있어야 한다. 공격력이 넷 중 제일 낮은(10) 사람에게 그 자리를
      준 것은, 이 사람을 넣는 이유가 "세다" 가 아니라 "다르다" 여야 하기
      때문이다.
    */
    dmg: 'magic',
    from: '모집', fx: 'arcane', range: 'melee', skill: 'heal',
    extra: ['purify'], art: 'nun',
  },
};

export const CHAR_LIST: CharDef[] = CHAR_IDS.map((id) => CHARS[id]);

/**
 * 게임을 시작할 때 주는 사람들. **서 있는 순서 그대로**다.
 *
 * 예전에는 넷 중 하나를 고르게 했다. 지금은 그냥 준다 — 선택지가 하나뿐인
 * 선택 화면은 장식이었다.
 *
 * 둘로 늘린 이유는 **역할이 갈리는 게 보여야 해서**다. 이졸데 혼자면 방어
 * 하나뿐이라 파티가 왜 넷인지, 역할이 왜 셋인지 알 길이 없다. 앞에서 버티는
 * 사람과 크게 때리는 사람이 같이 서 있어야 그 구조가 첫 화면에서 읽힌다.
 *
 * 여기 올린 사람은 **옛 저장본에도 채워 준다** (`state/migrate`). 안 그러면
 * 이미 하던 사람은 영영 못 받는다.
 */
export const STARTING_CHARS: readonly CharId[] =
  ['knightgirl', 'bunnyaxe', 'elfarcher', 'nun'];

/** 맨 처음 한 명 — 파티가 어쩌다 통째로 비면 이 사람으로 되돌린다 */
export const STARTING_CHAR: CharId = STARTING_CHARS[0];

export const isCharId = (v: string): v is CharId =>
  (CHAR_IDS as readonly string[]).includes(v);

/** 어느 줄에 섰나. `null` 은 **줄이 없는 것** (혼자 선 우두머리 · 화면의 도감) */
export type Row = 'front' | 'back' | null;

/**
 * ── 줄이 몸을 바꾼다 ──
 *
 * 앞에 서면 단단해지고, 뒤에 서면 세진다. 아군만이 아니라 **적도 똑같다**
 * (`core/autoBattle` 의 `foeAt`).
 *
 *   앞줄  방어력 · 마법저항력 ×1.5, 최대체력 ×1.1
 *   뒷줄  공격력 ×1.15
 *
 * ## 왜 필요한가
 *
 * 확률만으로는 대형이 **손해 보는 쪽을 고르는 일**이 된다. 앞에 서는 대가가
 * "더 맞는다" 뿐이면, 앞줄은 그냥 벌칙이고 최적해는 늘 "제일 안 맞게 서기"
 * 하나다 — 그러면 셋 중 하나가 정답이 되고 나머지 둘은 장식이 된다.
 *
 * 앞에 선 사람이 실제로 **더 잘 버티고**, 뒤에 선 사람이 실제로 **더 세게
 * 치면**, 대형은 "위험을 어디에 둘까" 가 아니라 **"맷집과 화력 중 무엇을
 * 살까"** 가 된다. 그게 고를 만한 선택이다.
 *
 * ## 숫자의 근거
 *
 * 방어는 뺄셈으로 들어가므로 (`Armor`) 1.5배가 체감이 크다. 체력은 곱셈이라
 * 같은 1.5를 주면 앞줄이 통째로 안 죽는 벽이 되므로 1.1 로 눌렀다.
 *
 * 공격 1.15 는 앞줄이 지는 위험(20~30%p 더 맞는다)과 맞바꾸는 값이다. 더
 * 크게 주면 딜러를 뒤에 두는 것이 언제나 정답이 되어, 다시 답이 하나가 된다.
 */
export const ROW_MOD = {
  front: { atk: 1, hp: 1.1, def: 1.5, res: 1.5 },
  back: { atk: 1.15, hp: 1, def: 1, res: 1 },
} as const;

/** 그 줄의 배수들. 줄이 없으면 전부 1 이다 */
export const rowMod = (row: Row | undefined) => (
  row ? ROW_MOD[row] : { atk: 1, hp: 1, def: 1, res: 1 }
);

// ── 가지고 있는 캐릭터 한 명 ────────────────────────────

/** 저장되는 것 — 정의(`CHARS`)는 코드에 있으므로 여기 담지 않는다 */
export interface OwnedChar {
  id: CharId;
  /** 고유장비 강화 수치 */
  gearLv: number;
  /**
   * 몇 성인가 (1 ~ 5). 등급이 상한을 정한다 (`core/growth` 의 `RARITY_STAR`).
   *
   * 스탯을 **직접 올리지는 않는다.** 성이 올려 주는 것은 레벨 상한(`lvCap`)과
   * 기술 해금(`skillSlots`) 둘이다. 셋 다 올리면 성 하나가 다른 두 축을
   * 통째로 삼켜서, 결국 "같은 사람 몇 장 모았나" 만 남는다.
   */
  star: number;
  /**
   * 각성했나 — 5성 **위**의 한 단계. 신화만 간다.
   *
   * 성이 6 이 되는 것이 아니라 따로 둔 이유: 별 다섯이 푸른빛을 띠는 것이지
   * 별이 여섯 개가 되는 것이 아니다. 숫자로 두면 화면이 별 여섯을 그린다.
   */
  awake: boolean;
  /** 레벨 (1 ~ `lvCap`). 오르면 공격과 체력이 조금씩 는다 */
  lv: number;
  /**
   * 가지고 있는 **1성 조각** 수 — 성을 올리는 데 쓴다 (`starUpCost`).
   *
   * 성별로 나눠 세지 않는다. 2성 조각 하나는 언제나 1성 조각 둘과 같은
   * 것이라, 나누면 창고에 줄이 여럿 생기고 사람이 손으로 옮겨야 한다.
   */
  copies: number;
  /**
   * **찍어 둔 스킬 트리 자리들** (`core/skillTree` 의 `NodeId`).
   *
   * 갈래인 자리만 들어간다. 갈래가 아닌 자리는 성만 되면 저절로 열리므로
   * 여기 적을 것이 없다 (`activeNodes`).
   *
   * 순서는 상관없다 — 읽는 쪽이 늘 단계 순서로 다시 쌓는다 (`fixTree`).
   */
  tree: readonly string[];
  /**
   * 지금 어느 줄에 서 있나 — **저장되지 않는다.**
   *
   * 대형이 정하는 값이라 (`core/party` 의 `seatRows`) 세이브에 넣을 것이
   * 아니다. 전투 한 틱이 시작할 때 명부를 통째로 베끼면서 박고, 그 틱이
   * 끝나면 같이 사라진다.
   *
   * `statOf` 가 이 한 칸을 보고 줄 배수를 얹는다 (`core/party` 의 `ROW_MOD`).
   * 스탯을 읽는 창구가 하나뿐이라, 여기 박아 두면 전투의 열댓 군데가 전부
   * 따라온다 — 자리마다 줄을 인자로 흘려보내면 한 곳만 빠뜨려도 조용히
   * 틀린다.
   *
   * 없으면 줄이 없는 것으로 본다: 배수가 전부 1 이라 도감과 파티 칸은 **맨
   * 몸 수치**를 보여 준다. 화면에 적힌 값이 대형에 따라 흔들리면 캐릭터끼리
   * 견줄 수가 없다.
   */
  row?: Row;
}

export const newChar = (id: CharId): OwnedChar => ({
  id, gearLv: 0, star: 1, awake: false, lv: 1, copies: 0, tree: [],
});

/**
 * 저장본을 **믿지 않고** 읽는다.
 *
 * 성 · 레벨 · 조각은 나중에 생긴 칸이라 옛 저장본에 없다. 없는 값을 그대로
 * 계산에 넣으면 `undefined` 가 NaN 이 되어 스탯이 통째로 사라진다 — 화면에는
 * 캐릭터가 서 있는데 공격력이 `NaN` 인, 눈으로는 잡기 어려운 종류의 고장이다.
 *
 * ## 옛 저장본은 몇 성으로 치나
 *
 * **2성**이다 (등급이 허락하는 만큼). 여태 넷은 다들 기술을 둘씩 쓰고 있었고
 * (`CharDef.skill` + `extra`) 1성으로 내리면 그 둘째 기술이 조용히 사라진다.
 * 켜 놓고 보던 사람에게 그건 새 체계가 아니라 **고장**으로 보인다.
 */
export function fixChar(c: OwnedChar): OwnedChar {
  const cap = maxStar(CHARS[c.id]?.rarity ?? 'common');
  const star = Number.isFinite(c.star)
    ? Math.max(1, Math.min(cap, Math.floor(c.star)))
    : Math.min(2, cap);
  const awake = !!c.awake && canAwaken(CHARS[c.id]?.rarity ?? 'common') && star >= STAR_CAP;
  return {
    ...c,
    gearLv: Number.isFinite(c.gearLv) ? Math.max(0, Math.floor(c.gearLv)) : 0,
    star,
    awake,
    lv: Number.isFinite(c.lv) ? Math.max(1, Math.min(lvCap(star, awake), Math.floor(c.lv))) : 1,
    copies: Number.isFinite(c.copies) ? Math.max(0, Math.floor(c.copies)) : 0,
    /* 모르는 이름표와 말이 안 되는 조합을 걷어낸다 (`core/skillTree`) */
    tree: fixTree(c.id, c.tree),
  };
}

/** 이 사람의 지금 레벨 상한 */
export const capOf = (c: OwnedChar): number => lvCap(c.star, c.awake);

/** 이 사람의 등급 */
export const rarityOf = (c: OwnedChar): Rarity => CHARS[c.id].rarity;

/**
 * 지금 **열려 있는 기술의 수.**
 *
 * 성이 기술을 연다 (`core/growth` 의 `skillSlots`). 다만 **가진 것보다 많이
 * 열 수는 없다** — 넷은 아직 기술을 둘씩만 들고 있으므로 (`skillsOf`),
 * 5성이 되어도 셋째 자리는 그릴 것이 없다.
 *
 * 안 막으면 `readySkill` 이 없는 자리를 고르고, 화면은 이름 없는 기술을
 * 띄운다.
 */
export const openSkills = (c: OwnedChar): number =>
  Math.min(skillsOf(c.id).length, skillSlots(c.star, c.awake));

/** 그 자리의 기술이 열려 있나 — 화면이 잠긴 칸을 흐리게 그린다 */
export const skillOpen = (c: OwnedChar, slot: number): boolean => slot < openSkills(c);

/*
  ── 레벨은 없다 ──

  한동안 캐릭터 레벨과 경험치가 있었다. 그런데 이 게임이 키우는 것은 원래
  **캐릭터가 태어날 때부터 들고 있는 고유장비 한 자루**다. 거기에 레벨을
  얹으니 축이 둘이 되었고, 둘 다 시간이 지나면 저절로 오르는 것이라 고르는
  일이 없었다 — 강화는 골드를 쓰고 실패도 하는데, 레벨은 그냥 켜 두면 올랐다.
  그래서 실제 선택은 "누구의 장비를 올릴까" 하나뿐인데 숫자만 둘이었다.

  레벨을 빼면 남는 축이 하나다. 그 하나에 등급이 얹혀서 (`GRADE_GROWTH`),
  같은 +10 이라도 S 등급이 더 크게 오른다 — 누구를 키울지가 곧 선택이 된다.
*/

// ── 고유장비 ────────────────────────────────────────────

/**
 * 고유장비는 **부서지지 않는다.**
 *
 * 예전 장비 강화(`core/enhance`)에는 파괴와 하락이 있었다. 그건 장비가 갈아
 * 끼울 수 있는 소모품이었기 때문에 성립하던 규칙이다. 고유장비는 캐릭터
 * 자신이라, 부서지면 캐릭터가 사라진다. 실패하면 **돈만 잃고 그대로** 둔다.
 *
 * 대신 성공률이 계속 떨어져서 후반이 느려진다 — 위험 대신 시간으로 막는다.
 */
/**
 * 고유장비 강화의 상한.
 *
 * **30 에서 100 으로 올렸다.** 적은 1판에서 20판까지 체력이 250배가 되는데
 * (`docs/FOE_TABLE.md`) 파티가 자랄 길은 이 강화 하나뿐이다. 30 이 상한이면
 * 최대로 키운 파티도 공격력이 3.7배에 그쳐서, 재 보니 12판에서 막혔다.
 *
 * 100 이면 등급 성장률 0.11 로 12배까지 간다 (`GRADE_GROWTH`).
 */
export const MAX_GEAR_LV = 100;

/**
 * **테스트 모드 — 강화가 공짜이고 반드시 성공한다.**
 *
 * 직접 굴려 보려고 켜 둔 스위치다. 켜져 있으면 `gearCost` 가 0 이고
 * `gearOdds` 가 1 이라, 누르는 대로 올라간다.
 *
 * ⚠ **출시 전에 false 로 되돌린다.** 끄는 자리를 여기 하나로 모아 둔 이유가
 * 그것이다 — 확률과 비용을 각자 고쳐 놓으면 하나를 빠뜨린다.
 */
export const FREE_ENHANCE = true;

/** +n 에서 +n+1 로 갈 확률 */
export function gearOdds(gearLv: number): number {
  if (gearLv >= MAX_GEAR_LV) return 0;
  if (FREE_ENHANCE) return 1;
  /*
    +0→+1 은 95%, 그 뒤로 한 칸마다 3%p 씩 떨어지고 12% 에서 바닥을 친다.
    상한이 100 이 되면서 대부분의 구간이 바닥(12%)이다 — 상한을 올릴 때
    곡선도 같이 다시 잡아야 한다.
  */
  return Math.max(0.12, 0.95 - gearLv * 0.03);
}

/** +n 에서 +n+1 로 갈 때 드는 골드 */
export function gearCost(gearLv: number): number {
  if (FREE_ENHANCE) return 0;
  return Math.floor(300 * Math.pow(1.28, Math.max(0, gearLv)));
}

// ── 스탯 ────────────────────────────────────────────────

/**
 * 공격속도 **1.0** 일 때의 공격 간격 (ms).
 *
 * 속도는 배수다 — 1.0 이 기준이고 1.1 이면 그만큼 빠르다. 간격은
 * `ATTACK_BASE_MS / spd` 이므로 0.5 면 두 배 느리다.
 *
 * **여기 한 줄이 게임 전체의 박자다.** 넷의 속도는 서로의 비율로만 정해져
 * 있고, 절대 속도는 이 값이 정한다. 전투가 통째로 빠르거나 느리면 캐릭터
 * 넷을 건드릴 게 아니라 이 값을 옮긴다.
 */
export const ATTACK_BASE_MS = 1200;

/** 이 속도로는 몇 ms 마다 한 대인가 */
export function swingMs(spd: number): number {
  return Math.round(ATTACK_BASE_MS / Math.max(0.05, spd));
}

/**
 * 지금 이 캐릭터의 수치.
 *
 * `Armor` 를 만족한다 (`def` + `res`). 그래서 피해 계산에 이 값을 **그대로**
 * 넘길 수 있고, 적(`Foe`)도 같은 모양이라 계산 쪽은 아군인지 적인지 몰라도
 * 된다 (`autoBattle` 의 `strikeFor`).
 */
export interface Stat extends Armor {
  atk: number;
  hp: number;
  /** 초당 공격 횟수 */
  spd: number;
  /** 치명타 확률 (0~1) */
  crit: number;
  /** 치명타 피해 배수 (1.5 = 150%) */
  critDmg: number;
}

/**
 * 지금 이 캐릭터의 스탯.
 *
 * 축이 **하나**다 — 고유장비 강화 수치. 등급이 그 한 축의 기울기를 정한다
 * (`GRADE_GROWTH`).
 *
 *   공격 — 기본치 × (1 + 등급 성장률 × 강화 수치)
 *   체력 — 기본치 × (1 + 등급 성장률 × 강화 수치 × 0.6)
 *
 * **체력도 같이 오른다.** 예전에는 장비가 공격만 올리고 체력은 레벨이 맡았다.
 * 레벨이 없어진 지금 장비가 공격만 올리면 체력이 영영 그대로라, 스테이지를
 * 올릴수록 파티가 한 대에 무너진다.
 *
 * 체력을 공격보다 천천히(0.6배) 올린다. 같은 속도로 올리면 서로 상쇄되어
 * 강화해도 판이 그대로인 것처럼 느껴진다.
 */
export function statOf(c: OwnedChar): Stat {
  const d = CHARS[c.id];
  const g = RARITY_GROWTH[d.rarity] * Math.max(0, c.gearLv);
  /*
    ── 서 있는 줄이 몸을 바꾼다 ──

    앞줄은 단단해지고 뒷줄은 세진다 (`ROW_MOD`). `c.row` 는 전투가 한 틱
    시작할 때 박아 주는 값이고 (`core/party` 의 `seatRows`), 없으면 전부
    1 이라 도감과 파티 칸은 맨 몸 수치를 본다.

    **맨 끝에 곱한다.** 강화 성장률(`g`) 안에 섞어 넣으면 "앞에 서면 성장이
    빨라진다" 가 되어, 강화 0 인 사람에게는 아무 일도 안 일어난다.
  */
  const m = rowMod(c.row);
  /*
    ── 레벨은 등급을 안 탄다 ──

    강화(`g`)에는 등급이 붙지만 (`RARITY_GROWTH`) 레벨은 누구나 한 칸에 2%
    다. 두 축에 다 등급을 얹으면 신화와 일반의 차이가 곱절로 벌어져서, 일반은
    뽑는 순간 버리는 것이 된다.

    없는 레벨은 1 로 읽는다 — 옛 저장본에는 이 칸이 없고 (`fixChar` 가
    채우지만 여기까지 안 들른 길이 있을 수 있다), `undefined - 1` 은 NaN 이라
    한 번 새면 스탯이 통째로 사라진다.
  */
  const lv = Math.max(0, (Number.isFinite(c.lv) ? c.lv : 1) - 1);
  /*
    ── 레벨은 **더하고**, 강화는 **곱한다** ──

    레벨 성장이 사람마다 다른 고정값이 되면서 (`CharDef.perLv`) 순서가
    중요해졌다. 더한 뒤에 곱한다 — 그래야 레벨을 올린 만큼도 강화 배수를
    같이 받는다. 반대로 하면 레벨이 강화를 안 타서, 만렙에 가까울수록
    강화가 무의미해진다.
  */
  const lvAtk = d.atk + d.perLv.atk * lv;
  const lvHp = d.hp + d.perLv.hp * lv;
  /* 방어는 몇 레벨마다 한 칸씩 — 뺄셈이라 매 레벨 올리면 금세 다 막힌다 */
  const lvArmor = Math.floor(lv / Math.max(1, d.perLv.armorEvery));
  return {
    atk: Math.round(lvAtk * (1 + g) * m.atk),
    hp: Math.round(lvHp * (1 + g * 0.6) * m.hp),
    /*
      방어도 자란다. 다만 **제일 천천히** — 뺄셈으로 들어가는 값이라 조금만
      올라도 효과가 크고, 공격력과 같은 기울기로 키우면 어느 지점부터 맞는
      피해가 통째로 1 이 된다.
    */
    def: Math.round((d.def + lvArmor) * (1 + g * 0.4) * m.def),
    /*
      마법저항력도 방어와 **같은 기울기**로 자란다. 하는 일이 똑같고
      (`Armor`) 막는 것만 다르므로, 기울기를 다르게 둘 이유가 없다.

      기본값이 0 이거나 1 이라 실제로 오르는 폭이 아주 작다 — 이졸데의 1 은
      최대 강화(+20, S등급)에서 2 가 된다. 0 인 사람은 아무리 강화해도 0 이다.
      이 스탯은 **키우는 축이 아니라 갖고 있고 없고**로 두었기 때문이고,
      의도한 것이다.
    */
    res: Math.round(((d.res ?? 0) + lvArmor) * (1 + g * 0.4) * m.res),
    /* 속도와 치명타는 강화로 안 자란다 — 자라는 축은 하나여야 한다 */
    spd: d.spd,
    crit: d.crit,
    critDmg: d.critDmg,
  };
}

/**
 * 한 명의 전투력.
 *
 * 초당 딜과 체력을 한 숫자로 묶는다. 화면에 하나만 적을 수 있는 자리(파티 칸)가
 * 있어서, 비교할 수 있는 단일 숫자가 필요하다.
 */
export function charPower(c: OwnedChar): number {
  const s = statOf(c);
  /* 초당 피해 — 치명타까지 셈한 기댓값 */
  const dps = (s.atk * 1000 / swingMs(s.spd)) * (1 + s.crit * (s.critDmg - 1));
  /*
    방어는 **체력처럼** 센다. 맞을 때마다 그만큼 덜 닳으므로 실제로 버티는
    양이 늘어나는 것이고, 한 판에 예순 대쯤 맞는다고 보고 60 을 곱한다.
  */
  /*
    **마법저항력은 안 센다.**

    지금 마법으로 때리는 적이 하나도 없어서다 (`docs/FOE_TABLE.md` — 전부
    물리다). 방어와 같은 무게로 얹으면 이졸데의 전투력만 삼십 남짓 오르는데,
    그 삼십은 화면 어디에서도 실제 이득으로 돌아오지 않는다. 비교하라고
    내건 숫자가 비교를 틀리게 만드는 셈이다.

    마법을 쓰는 적이 생기는 날 `+ s.res * 60 * 0.6` 을 얹으면 된다.
  */
  return Math.round(dps * 8 + s.hp * 0.6 + s.def * 60 * 0.6);
}

/**
 * 이 사람의 한 대가 들고 나가는 것 — **종류와 관통.**
 *
 * `sk` 를 주면 그 기술의 한 대이고, 안 주면 평타다.
 *
 * ## 관통은 더한다
 *
 * 패시브(`CharDef.pierce`)와 기술(`SkillDef.pierce`)이 겹치면 둘 다 산다.
 * 어느 한쪽이 이기게 두면 "패시브로 물리관통을 가진 사람이 마법관통 기술을
 * 쓰면 물리관통이 사라지는" 식의 규칙이 생기는데, 그건 설명할 수가 없다.
 *
 * 종류는 반대로 **덮어쓴다.** 한 대는 물리이거나 마법이거나 둘 중 하나이지
 * 둘 다일 수 없어서, 더할 수가 없다.
 */
export function blowOf(id: string, sk?: SkillDef): Blow {
  const d = (CHARS as Record<string, CharDef | undefined>)[id];
  const pass = d?.pierce;
  return {
    type: sk ? sk.dmg : (d?.dmg ?? 'phys'),
    pierce: {
      phys: !!pass?.phys || !!sk?.pierce?.phys,
      magic: !!pass?.magic || !!sk?.pierce?.magic,
    },
  };
}

/**
 * 이 사람이 **한 번이라도** 관통을 들고 나가나 — 화면에 표시할지 판단용.
 *
 * 패시브와 모든 기술을 다 훑는다. 하나라도 있으면 캐릭터 창이 그 줄을
 * 내건다 (`CharPopup`).
 */
export function anyPierce(id: string): Pierce {
  const all = [blowOf(id), ...skillsOf(id).map((sk) => blowOf(id, sk))];
  return {
    phys: all.some((b) => b.pierce.phys),
    magic: all.some((b) => b.pierce.magic),
  };
}
