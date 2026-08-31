/**
 * 자동 전투 — 홈 화면 위쪽에서 계속 돌아가는 것.
 *
 * ## 스테이지 구조
 *
 * 스테이지마다 **한 종류의 적**이 나온다. 1스테이지는 슬라임이다.
 *
 *   1. **2분 동안** 그 적들이 계속 몰려온다. 한 마리씩이 아니라 여러 마리가
 *      겹쳐 나오고, 죽으면 뒤에서 또 걸어 들어온다
 *   2. 2분이 지나면 더 안 나온다. 남아 있는 놈들을 마저 정리하면
 *   3. **우두머리**가 나온다. 잡으면 다음 스테이지
 *
 * 한 마리씩 순서대로 내보내 봤더니 전투가 아니라 **줄 서기**로 보였다.
 * 여럿이 한꺼번에 있어야 파티가 밀리는지 미는지가 눈에 보인다.
 *
 * 시간으로 끊는 것도 같은 이유다. "몇 마리 잡기" 로 두면 파티가 세질수록 그
 * 구간이 짧아져서 스테이지가 순식간에 지나간다. 2분은 세든 약하든 2분이고,
 * 그동안 **몇 마리를 잡았는지**가 성장의 척도가 된다.
 *
 * ## 왜 순수 함수인가
 *
 * 전투는 0.5초에 한 번 돌고, 그때마다 골드·경험치·스테이지가 같이 바뀐다.
 * 스토어 안에서 조금씩 고치면 "체력은 깎였는데 보상은 안 들어간" 중간 상태가
 * 화면에 비칠 수 있고, 저장이 그 순간에 걸리면 그 상태가 그대로 저장된다.
 *
 * 그래서 여기서는 **한 틱을 통째로 계산해서** 결과만 돌려준다. 스토어는 그걸
 * 한 번의 `set` 으로 반영한다 — 중간이 없다. `core/autoEnhance` 와 같은 태도다.
 *
 * ## 규칙
 *
 * · 파티원은 **각자 체력을 가진다.** 적은 맨 앞 한 명만 때리고, 그 사람이
 *   쓰러지면 다음 사람이 앞으로 나온다 (`core/party` 의 `defenseOrder`).
 *   한 통으로 묶어 봤는데 "누가 맞고 있나" 가 화면에서 사라져서 되돌렸다 —
 *   방어 역할을 넣는 이유가 안 보인다
 * · 파티는 **한 마리만** 때린다. 여럿을 동시에 때리면 몇 마리가 몰려오든
 *   똑같아서, 여럿이 나오는 의미가 없다
 * · 누구를 때리는지는 `target` 이 들고 있다. **잡을 때마다 무작위로 다시 고르고,
 *   고른 뒤에는 그놈이 죽을 때까지 안 바꾼다.** 늘 맨 앞을 때리게 두면 위·가운데·
 *   아래로 나와도 한 자리만 계속 치고, 매 틱 다시 고르면 세 마리를 조금씩
 *   갉아먹어 아무도 안 죽는다 — 둘 다 전투로 안 보인다
 * · **때리는 건 틱이 아니라 휘두름이다** (`applyHit`). 예전에는 0.5초 틱이
 *   파티 전체 딜을 한꺼번에 넣었는데, 화면에서 검을 휘두르는 박자와 따로 놀아서
 *   **안 휘둘렀는데 적 체력이 닳았다.** 지금은 캐릭터가 검을 내려치는 그 순간에
 *   그 사람 공격력만큼 들어간다 — 보이는 것과 계산이 같은 순간에 일어난다
 * · 적은 **살아 있는 전부가** 때린다. 그래서 몰리면 위험하다
 * · **저절로 차는 체력은 없다.** 회복은 사제의 기도 하나뿐이다
 * · 쓰러지면 **그 스테이지를 처음부터** 다시 한다. 스테이지 자체는 안 뺏는다 —
 *   자리를 비운 사이에 10스테이지가 1스테이지가 되어 있으면 아무도 안 켠다.
 *   최고 기록(`best`)도 그대로 남는다
 */
import {
  Party, allDown, fullHp, hpOf, members, partyStat, supportMul,
} from './party';
import {
  Armor, Blow, CHARS, DmgType, NO_ARMOR, NO_PIERCE, OwnedChar, SkillDef, Stat,
  blowOf, skillOf, skillsOf, statOf, swingMs,
} from './chars';

/** 한 틱의 길이 */
export const TICK_MS = 500;

/**
 * 우두머리를 부를 수 있게 되기까지 사냥하는 시간.
 *
 * **지나도 우두머리가 저절로 안 나온다.** 이 시간이 다 흐르면 "우두머리
 * 토벌" 단추가 생기고, 부르는 것은 사람이다 (`BattleState.called`).
 *
 * 예전에는 시간이 되면 잡몹이 끊기고 우두머리가 걸어 나왔다. 그러면 판의
 * 흐름을 사람이 못 정한다 — 아직 약한데 우두머리가 오고, 더 사냥해서
 * 골드를 모으고 싶어도 못 한다. 이제 시간은 **문을 여는 것**까지만 하고,
 * 언제 들어갈지는 사람이 정한다.
 */
export const STAGE_MS = 60_000;

/**
 * 판이 열릴 때 검은 막이 떴다 걷히고 양쪽에서 걸어 들어오기까지 (ms).
 *
 * 이 시간이 다 갈 때까지 **틱이 안 싸운다.** 화면만 재게 하면 막이 덮여
 * 있는 동안에도 뒤에서 전투가 굴러서, 걷혔을 때 이미 누가 죽어 있다.
 *
 * `TICK_MS` 의 배수여야 한다 — 틱마다 빼기 때문이다.
 */
export const OPEN_MS = 2000;

/**
 * 그중 **마지막 한 틱**이 양쪽에서 걸어 들어오는 시간이다.
 *
 * 여기는 **화면이 얼마나 미끄러지느냐**만 정한다. 싸움은 그동안에도 안 돈다 —
 * `openIn` 이 0 이 되고 **다 모인 뒤에** 시작한다.
 *
 * 처음에는 들어오면서 붙게 해 뒀다. 화면에서 보니 어색했다: 몸은 옆으로
 * 미끄러지는데 검기와 화살은 제자리 기준으로 날아가므로, 쏜 자리와 몸이
 * 어긋난 채로 날아간다. 다 서고 나서 치는 편이 훨씬 낫다.
 */
export const OPEN_WALK_MS = TICK_MS;

/** 우두머리를 잡고 나서 `Clear` 가 떴다 어두워지기까지 (ms) */
export const CLEAR_MS = 2000;

/**
 * `< >` 로 판을 옮길 때 화면이 어두워지기까지 (ms).
 *
 * 클리어보다 훨씬 짧다. 클리어는 **보여 줄 것이 있어서**(`Clear` 글씨) 길고,
 * 이건 그냥 가리기만 하면 되기 때문이다. 사용자가 직접 누른 것이라 기다릴
 * 이유도 없다.
 */
export const MOVE_MS = 400;

/**
 * 여기까지만 나아간다. `null` 이면 끝없이.
 *
 * **20 이다.** 스무 판의 적·우두머리·배경 그림이 다 들어왔다 — `assets/
 * sprites/` 의 `sg_*`·`sb_*`(슬라임)와 `pf_*`·`pw_*`·`pb_*`(식물·나무),
 * 그리고 `bg_chapter/01`~`04`.
 *
 * 20 을 깨면 넘어갈 곳이 없으므로 `Math.min` 에 걸려 **20 을 다시 돈다** —
 * 그게 지금 있는 마지막 판이다. 우두머리를 잡으면 보상도 클리어 연출도
 * 그대로 나오고, 달라지는 건 다음에 어디로 가느냐뿐이다.
 *
 * 21판을 만들면 여기를 올리거나 `null` 로 바꾸면 된다. `stageOf` 가
 * `STAGES.length` 로 나눠 돌리므로 `null` 이면 1판부터 다시 돈다.
 */
export const STAGE_CAP: number | null = 20;

/**
 * 화면에 동시에 서 있을 수 있는 잡몹 수.
 *
 * 셋이었다가 넷으로 늘렸다. 원거리를 섞으면서(`RANGED_CAP`) 셋으로는 앞줄이
 * 한 마리만 남아, 붙어서 싸우는 그림이 사라졌다. 넷이면 앞뒤가 둘씩이다.
 *
 * 다섯을 넘기지 않는다 — 좁은 무대에서 서로 겹쳐 몇 마리인지 안 보인다.
 * 넷은 좁은 화면에서도 대형을 12px 씩 짜내면 들어간다 (`squeezeFor`).
 */
export const MOB_CAP = 4;

/**
 * 그 중 원거리가 몇 마리까지.
 *
 * 둘이다. 넷 중 둘이면 앞줄 둘이 붙어 싸우는 동안 뒤에서 둘이 던지는
 * 그림이 되고, 그게 이 화면에서 제일 읽기 쉬운 구도다. 셋을 넘기면 앞이
 * 비어서 아군 근접이 허공을 향해 걸어 나간다.
 */
export const RANGED_CAP = 2;

/**
 * 몇 틱마다 한 마리씩 걸어 들어오는가.
 *
 * 2 였다가 1 로 낮췄다. 파티가 그 스테이지를 압도하면 잡몹이 한 틱에 죽는데,
 * 두 틱마다 하나씩 채우면 **화면에 아무것도 없는 시간이 절반**이 된다.
 * 실제로 "슬라임이 보이지도 않는다" 는 소리를 들었다.
 *
 * 매 틱 채우면 죽는 즉시 다음이 걸어 들어와서, 빨리 잡을수록 빽빽해진다 —
 * 세면 세질수록 화면이 조용해지는 것보다 그쪽이 맞다.
 */
export const SPAWN_TICKS = 1;

/** 쓰러진 뒤 다시 일어설 때까지 (틱) */
export const REVIVE_TICKS = 4;

/**
 * 한 마리 잡을 때마다 돌아오는 체력 — 최대 체력의 8%.
 *
 * 예전에 한 마리씩 나올 때는 25% 였다. 지금은 2분에 수십 마리를 잡으므로
 * 그대로 두면 회복이 피해를 완전히 덮어 아무도 안 죽는다. 마리 수가 늘어난
 * 만큼 한 마리당 회복을 줄인다.
 *
 * 회복이 아예 없으면 파티가 아무리 세도 결국 깎여 죽어서, 벽이 "얼마나 센가"
 * 가 아니라 "몇 판을 버티나" 로만 정해진다. 그건 키울 이유를 없앤다.
 */
/*
  ── 저절로 차는 체력은 없다 ──

  잡을 때마다 파티가 조금씩 회복하던 것이 있었다 (`HEAL_ON_KILL`). 처음엔 8%,
  그다음 2.5% 로 낮췄는데, 낮춰도 문제는 그대로였다 — **아무도 아무것도 안
  했는데 체력이 꾸준히 차오른다.** 화면에서 보면 사제가 기도를 하든 말든
  막대가 비슷하게 움직이므로, 회복을 맡은 사람이 무슨 일을 하는지 알 수 없다.

  회복하는 길을 하나로 모았다. 이제 체력이 차는 것은 사제가 기도했다는 뜻이고,
  사제가 없으면 파티는 버티다 무너진다 — 그게 보조 한 자리를 쓰는 값이다.

  (재 보니 4분 기준으로, 사제가 있으면 앞사람이 340 중 301 아래로 안 내려가고
  없으면 52초에 쓰러진다.)
*/


export interface FoeKind {
  /** 스프라이트 폴더 (`assets/sprites/cr_*`) */
  art: string;
  name: string;
  /** 배경 그림 (`assets/sprites/bg_chapter/`) */
  bg: string;
  /**
   * 붙어서 싸우나, 떨어져서 싸우나.
   *
   * 캐릭터 쪽과 같은 이유로 **화면에서 서는 자리만** 정한다 (`core/chars` 의
   * `Range`). 피해 계산은 안 건드린다.
   */
  melee: boolean;
  /**
   * 1스테이지 기준 수치.
   *
   * 예전에는 공용 밑값 하나에 종마다 배수를 곱했다 (`hpMul`·`atkMul`). 종이
   * 둘일 때는 됐는데 열일곱이 되니, 어느 놈이 실제로 얼마나 센지 알려면 두
   * 군데를 곱해 봐야 했다. **여기에 그대로 적는다.**
   *
   * 스테이지가 올라가면 이 값에 배수가 붙는다 (`foeOf`).
   */
  atk: number;
  hp: number;
  /** 초당 공격 횟수. 아군과 같은 단위다 (`core/chars` 의 `Stat.spd`) */
  spd: number;
  /**
   * 방어력 — 아군과 같은 뺄셈이다.
   *
   * 지금은 전부 0 이다. 슬라임은 무른 것이 설정이고, 0 이 아니면 초반에
   * 아녜스(공격력 10)의 평타가 통째로 최소치로 깎인다.
   */
  def?: number;
  /**
   * 마법저항력 — 맞는 **마법** 피해를 그 수만큼 깎는다. 안 적으면 0.
   *
   * 아군 쪽과 완전히 같은 뺄셈이다 (`core/chars` 의 `Armor`).
   *
   * 지금은 스무 판 전부 0 이다. 파티에서 마법으로 때리는 사람이 아녜스
   * 하나뿐이라(`CharDef.dmg`), 여기에 값을 주는 순간 그 한 사람만 벽에
   * 부딪힌다 — 대답할 방법이 없는 문제는 난이도가 아니라 고장이다.
   * 마법 딜러가 둘 이상 생기면 그때 여는 자리다.
   */
  res?: number;
  /**
   * 이 적의 공격이 무슨 피해인가. 안 적으면 **물리**다.
   *
   * 지금은 스무 판의 잡몹과 우두머리가 전부 물리다. 그래서 아군의
   * 마법저항력(이졸데의 1)은 아직 아무 일도 안 한다 — 스탯과 화면과 계산을
   * 먼저 깔아 두고, 그것을 쓰는 적은 나중에 넣는다.
   *
   * 우두머리 특수기도 이 값을 따른다. 패턴마다 따로 두지 않은 이유는,
   * 한 마리가 평타는 물리로 치고 기술은 마법으로 치는 일이 아직 없어서다 —
   * 자리를 미리 파 두면 두 곳이 어긋날 수 있다.
   */
  dmg?: DmgType;
  /*
    적에게는 **관통이 없다.** 관통은 캐릭터의 기술·패시브에 붙는 것이라
    (`core/chars` 의 `Pierce`) 아군이 적의 방어를 뚫는 방향으로만 쓴다.

    적이 아군의 방어를 뚫기 시작하면 방어력을 올릴 이유가 사라지는데, 지금
    이 게임에서 방어는 "앞에 서는 사람" 의 존재 이유 그 자체다. 필요해지면
    여기에 한 줄 얹고 foeBlow 만 고치면 된다.
  */
  /**
   * 우두머리만 쓰는 특수 패턴. 안 적으면 `BOSS_PATTERNS` 를 쓴다.
   *
   * 빈 배열(`[]`)을 주면 **패턴 없이** 평타만 친다 — "이 우두머리는 단순한
   * 놈" 을 표현할 자리가 필요해서 `undefined` 와 `[]` 를 구분해 둔다.
   */
  patterns?: readonly BossPattern[];
}

/**
 * 우두머리의 특수 공격 한 가지.
 *
 * **파티 스킬과 같은 규칙이다** (`core/chars` 의 `SkillDef`) — 몇 번째
 * 공격마다(`every`) 나오고, 공격력의 몇 배(`mul`)로, 누구를(`aim`) 치는가.
 * 규칙을 맞춰 둔 이유는 화면이 두 가지를 따로 셀 필요가 없어서다.
 */
export interface BossPattern {
  /** 그림·연출을 고를 때 쓰는 이름표 */
  id: string;
  /** 화면에 뜨는 이름 */
  name: string;
  /**
   * 몇 번째 공격마다 나오나. 5 면 **평타 넷을 친 다음** 다섯 번째가 이것이다.
   *
   * 지금은 기술이 하나뿐이지만, 둘 이상이 같은 차례에 걸리면 **드문 쪽이
   * 이긴다** (`every` 가 큰 쪽). 자주 나오는 것이 이기면 드문 것은 영영 안
   * 나온다 — 6 과 3 이면 6의 배수는 전부 3의 배수이기도 하다.
   */
  every: number;
  /** 공격력의 몇 배 */
  mul: number;
  /** 전원인가 한 명인가 */
  aim: 'all' | 'one';
}

/**
 * 우두머리가 쓰는 기술.
 *
 * **하나뿐이다 — 파티 넷을 한꺼번에 친다.** 평타를 넷 치고 나면 다섯 번째가
 * 이것이다 (`every: 5`).
 *
 * 종마다 다르게 주고 싶으면 `FoeKind.patterns` 로 덮어쓴다. 안 적으면 모든
 * 우두머리가 이걸 쓴다 — 잡몹과 똑같이 한 대씩만 치는 우두머리는 체력만
 * 많은 잡몹이라 싸움이 길어지기만 한다.
 *
 * ## 왜 전체 공격인가
 *
 * 이것만이 **앞에 선 사람이 대신 받아 줄 수 없는 공격**이다. 평타는 자리
 * 확률(`AIM`)이 앞을 50% 로 잡아 주므로 앞에 단단한 사람을 세우면 뒤가
 * 안전한데, 이 기술 앞에서는 그 배치가 아무 일도 안 한다. 그래서 회복이
 * 있고 없고가 여기서 갈린다.
 *
 * 한 명당 0.9배라 넷이면 합쳐서 3.6배다. 평타 한 대보다 사람마다는 조금
 * 약하지만 파티 전체로는 훨씬 크다 — "한 명이 아프다" 가 아니라 "판이
 * 통째로 밀린다" 로 읽혀야 하는 자리다.
 *
 * 그림도 다르다. 이 기술이 나가는 동안 우두머리는 시트의 **`special` 칸**을
 * 쓴다 (없는 시트는 `attack` 으로 떨어진다).
 */
export const BOSS_PATTERNS: readonly BossPattern[] = [
  { id: 'sweep', name: '휩쓸기', every: 5, mul: 0.9, aim: 'all' },
];

/**
 * `n` 번째 공격에 나오는 패턴. 없으면 `null` (평타).
 *
 * `n` 은 1부터 센다. 0 번째는 없다 — `n % every === 0` 이 0 에서 참이 되어
 * 첫 공격부터 특수기가 나가면 우두머리가 나오자마자 전원이 맞는다.
 */
export function patternAt(
  n: number, list: readonly BossPattern[] = BOSS_PATTERNS,
): BossPattern | null {
  if (!Number.isFinite(n) || n < 1) return null;
  /* 드문 것이 이긴다 — 자주 나오는 쪽이 이기면 드문 것은 영영 안 나온다 */
  const due = list.filter((p) => p.every > 0 && n % p.every === 0);
  if (!due.length) return null;
  return due.reduce((a, b) => (b.every > a.every ? b : a));
}

/**
 * 스테이지 한 판의 구성.
 *
 * 예전에는 주력 한 종과 원거리 한 종, 딱 둘이었다. 2~10 스테이지를 **초원**
 * 한 지역으로 묶으면서 챕터마다 두세 종이 섞이게 하려니 목록이어야 했다.
 *
 * 첫 칸이 주력이다 — 화면이 "이 스테이지는 무엇이 나오나" 를 한 줄로 적을 때
 * (`kindOf`) 그 한 종을 쓴다.
 */
export interface StageDef {
  /** 배경 그림 (`assets/sprites/bg_chapter/`) */
  bg: string;
  /** 지역 이름 — 화면에 적는다 */
  zone: string;
  /**
   * 나오는 종들. 2~4 개.
   *
   * 붙어 싸우는 놈과 떨어져 던지는 놈이 **둘 다 있어야 한다.** 한쪽만 있으면
   * 화면에서 벌어지는 일이 한 가지뿐이고, 파티 배치도 뜻이 없어진다.
   */
  kinds: FoeKind[];
  /** 2분 뒤에 나오는 우두머리 */
  boss: FoeKind;
}

/** 초원 잡몹 — 2~10 스테이지가 이 여덟 종을 나눠 쓴다 */
/**
 * 초원의 슬라임들.
 *
 * 2~10 스테이지가 전부 슬라임이다. 그런데 **한 종을 아홉 판 돌리면** 배경만
 * 바뀌고 싸우는 상대는 그대로라 올라가는 느낌이 안 난다. 그래서 슬라임 안에서
 * 여덟 갈래로 나눴다.
 *
 * ## 무엇으로 가르나
 *
 * 40~52px 에서 남는 것은 윤곽뿐이라, "초록 슬라임 / 파란 슬라임" 같은 색
 * 구분은 흑백 도트에서 아예 존재하지 않는다. 그래서 **덩어리의 형태**로 가른다 —
 *
 *   풀 · 진흙   낮고 넓적하다 (기본형)
 *   돌 · 뼈     각지고 딱딱한 것이 박혀 있다
 *   가시 · 씨앗 윤곽에서 뾰족한 것이 뻗어 나온다
 *   왕 · 쌍둥이 크거나, 둘로 나뉘어 있다
 *
 * ## 셋은 던진다
 *
 * 붙어 싸우는 놈만 아홉 판 나오면 뒷줄이 늘 비고, 파티를 어떻게 세우든 같다.
 * 던지는 놈은 **무르고 아프다** — 체력이 낮고 공격이 높아서, 두면 아프고
 * 뚫고 들어가면 금방 죽는다.
 */
const SLIME = {
  /* ── 붙어서 싸운다 ── */
  grass: { art: 'sg_grass', name: '풀슬라임', bg: '', melee: true, dmg: 'phys' },
  mud: { art: 'sg_mud', name: '진흙 슬라임', bg: '', melee: true, dmg: 'phys' },
  stone: { art: 'sg_stone', name: '돌 슬라임', bg: '', melee: true, dmg: 'phys' },
  bone: { art: 'sg_bone', name: '뼈 슬라임', bg: '', melee: true, dmg: 'phys' },
  twin: { art: 'sg_twin', name: '쌍둥이 슬라임', bg: '', melee: true, dmg: 'phys' },
  /* ── 떨어져서 던진다 — 무르고 아프다 ── */
  spore: { art: 'sg_spore', name: '포자 슬라임', bg: '', melee: false, dmg: 'phys' },
  thorn: { art: 'sg_thorn', name: '가시 슬라임', bg: '', melee: false, dmg: 'phys' },
  /* 슬라임 중 유일하게 **마법**으로 때린다 — 7판부터 나온다 */
  acid: { art: 'sg_acid', name: '산성 슬라임', bg: '', melee: false, dmg: 'magic' },
} as const;

const g = (
  k: keyof typeof SLIME, atk: number, hp: number, spd: number, def = 0, res = 0,
): FoeKind => ({ ...SLIME[k], atk, hp, spd, def, res });

/**
 * 오염된 잔재들의 숲의 식물들 — 11~15 스테이지.
 *
 * 슬라임 다음 챕터다. 슬라임이 **덩어리 하나**로 갈렸다면 (낮다/높다/
 * 각졌다/둘이다) 식물은 **뻗은 것**으로 갈린다 — 무엇이, 어느 방향으로,
 * 몇 갈래로 뻗어 나왔는가. 40~52px 흑백에서 남는 것이 윤곽뿐인 것은
 * 여기서도 같다.
 *
 *   덩굴손  바닥을 기며 옆으로 길게    (제일 낮고 제일 넓다)
 *   아귀꽃  한 덩이가 위에 크게 얹혔다  (머리가 무겁다)
 *   가시덤불 사방으로 뾰족하다          (윤곽이 다 튄다)
 *   이끼덩이 뭉툭하고 축 늘어졌다        (윤곽이 흐리다)
 *   홀씨대  가늘고 곧게 섰다 · 던진다
 *   진액꽃  고개를 숙였다 · 던진다
 */
const PLANT = {
  /* ── 붙어서 싸운다 ── */
  vine: { art: 'pf_vine', name: '덩굴손', bg: '', melee: true, dmg: 'phys' },
  maw: { art: 'pf_maw', name: '아귀꽃', bg: '', melee: true, dmg: 'phys' },
  bramble: { art: 'pf_bramble', name: '가시덤불', bg: '', melee: true, dmg: 'phys' },
  moss: { art: 'pf_moss', name: '이끼덩이', bg: '', melee: true, dmg: 'phys' },
  /* ── 떨어져서 던진다. 둘 다 **마법**이다 ── */
  spore: { art: 'pf_spore', name: '홀씨대', bg: '', melee: false, dmg: 'magic' },
  sap: { art: 'pf_sap', name: '진액꽃', bg: '', melee: false, dmg: 'magic' },
} as const;

/**
 * 타락한 잔재들의 숲의 나무들 — 16~20 스테이지.
 *
 * 식물 챕터와 **높이로** 갈린다. 식물은 사람 키를 안 넘고 바닥에 붙어
 * 있었는데, 여기는 전부 사람보다 크고 서 있다. 챕터가 넘어간 것을 알리는
 * 가장 싼 방법이 그것이다 — 종을 하나하나 알아보기 전에 **줄의 높이**가
 * 먼저 눈에 들어온다.
 *
 *   그루터기 낮고 두껍다 (이 챕터의 기준)
 *   빈나무   속이 뚫려 있다 (윤곽 안에 구멍)
 *   뿌리덩이 아래로 여러 갈래 (밑이 넓다)
 *   껍질갑옷 딱딱한 판이 덮였다 (잘 안 죽는 놈)
 *   가지창   가늘고 길다 · 던진다
 *   꼬투리   위가 무겁다 · 던진다
 */
const WOOD = {
  /* ── 붙어서 싸운다 ── */
  stump: { art: 'pw_stump', name: '걷는 그루터기', bg: '', melee: true, dmg: 'phys' },
  hollow: { art: 'pw_hollow', name: '속 빈 나무', bg: '', melee: true, dmg: 'phys' },
  root: { art: 'pw_root', name: '뿌리덩이', bg: '', melee: true, dmg: 'phys' },
  bark: { art: 'pw_bark', name: '껍질갑옷', bg: '', melee: true, dmg: 'phys' },
  /* ── 떨어져서 던진다 ── */
  branch: { art: 'pw_branch', name: '가지창', bg: '', melee: false, dmg: 'phys' },
  /* 나무 중 유일하게 **마법**이다 — 18판부터 나온다 */
  pod: { art: 'pw_pod', name: '꼬투리나무', bg: '', melee: false, dmg: 'magic' },
} as const;

const p = (
  k: keyof typeof PLANT, atk: number, hp: number, spd: number, def = 0, res = 0,
): FoeKind => ({ ...PLANT[k], atk, hp, spd, def, res });
const w = (
  k: keyof typeof WOOD, atk: number, hp: number, spd: number, def = 0, res = 0,
): FoeKind => ({ ...WOOD[k], atk, hp, spd, def, res });

/*
  ── 손으로 짠 레벨 디자인 ──

  **수치를 종이 아니라 판이 들고 있다.** 같은 진흙 슬라임이 3판에서 12/80 이고
  5판에서 16/125 다 — 종 표(`SLIME`·`PLANT`·`WOOD`)에는 정체만 남기고(그림 ·
  이름 · 사거리 · 피해 종류) 수치는 여기서 준다.

      g('mud', 12, 80, 0.75, 1)
            공격 ─┘   │    │  └─ 방어력 (마법저항력은 그 뒤, 안 적으면 0)
                 체력 ┘  공격속도

  `STAGE_HP_POW`/`STAGE_ATK_POW` 는 여전히 0 이다. 곱해지는 것이 하나도 없고,
  여기 적힌 값이 화면에 그대로 나온다 (`docs/FOE_TABLE.md`).

  ## 판이 올라가면 무엇이 달라지나

  셋이 같이 오른다 — **수치 · 종 수 · 막는 것**. 1판은 두 종에 방어 0 이고,
  20판은 네 종에 방어 28 이다. 그래서 20판의 껍질갑옷(체력 1500 · 방어 28)은
  1판 슬라임의 서른일곱 배가 아니라 그보다 훨씬 두껍다 — 방어가 뺄셈이라
  약한 공격일수록 많이 깎이기 때문이다 (`core/chars` 의 `Armor`).

  ## 마법으로 때리는 놈이 넷 있다

  산성 슬라임(7판~) · 홀씨대(11판~) · 진액꽃(14판~) · 꼬투리나무(18판~).
  전부 원거리다. 이들이 나오는 판부터 **마법저항력이 값을 갖는다** — 그
  전까지 이졸데의 마저 1 은 아무 일도 안 한다.
*/
/**
 * 스무 스테이지.
 *
 * 지역은 **열 판마다**, 배경은 **다섯 판마다** 바뀐다. 지역 이름이 더 크게
 * 묶는 단위이고, 그 안에서 배경이 한 번 바뀌며 "더 깊이 들어왔다" 를 말한다.
 *
 * 판이 넘어갈 때 **한 종씩만 바뀐다.** 통째로 갈면 매번 처음부터 다시 보게
 * 되고, 안 갈면 넘어간 줄을 모른다. 하나만 바뀌면 "뭔가 새로 왔다" 가
 * 보이면서 나머지는 이미 아는 놈이다.
 */
export const STAGES: StageDef[] = [
  /* ── 1~10 · 오염된 응집체들의 평원 ── */
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [
      { art: 'sl_melee', name: '슬라임', bg: '01', melee: true, dmg: 'phys', atk: 8, hp: 40, spd: 0.8, def: 0, res: 0 },
      { art: 'sl_ranged', name: '뱉는 슬라임', bg: '01', melee: false, dmg: 'phys', atk: 10, hp: 30, spd: 1.0, def: 0, res: 0 },
    ],
    boss: {
      art: 'b01_gelatus', name: '빅 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 20, hp: 500, spd: 0.8, def: 0, res: 0,
    },
  },
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [g('grass', 10, 55, 0.8, 0, 0), g('spore', 12, 40, 1.0, 0, 0)],
    boss: {
      art: 'b02_floratus', name: '풀무더기 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 24, hp: 650, spd: 0.8, def: 1, res: 0,
    },
  },
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [g('mud', 12, 80, 0.75, 1, 0), g('spore', 13, 45, 1.0, 0, 0)],
    boss: {
      art: 'b03_acidus', name: '수렁 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 28, hp: 850, spd: 0.8, def: 2, res: 1,
    },
  },
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [
      g('mud', 14, 100, 0.75, 1, 0),
      g('spore', 15, 50, 1.0, 0, 0),
      g('thorn', 17, 45, 1.0, 0, 0),
    ],
    boss: {
      art: 'b04_sporia', name: '홀씨 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 32, hp: 1050, spd: 0.8, def: 2, res: 3,
    },
  },
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [
      g('mud', 16, 125, 0.75, 2, 0),
      g('stone', 12, 170, 0.65, 5, 0),
      g('thorn', 19, 55, 1.0, 0, 0),
    ],
    boss: {
      art: 'b05_spinatus', name: '가시덩이 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 36, hp: 1300, spd: 0.8, def: 4, res: 2,
    },
  },
  {
    bg: '02', zone: '오염된 응집체들의 평원',
    kinds: [
      g('stone', 14, 200, 0.65, 6, 0),
      g('twin', 17, 105, 0.9, 2, 0),
      g('thorn', 21, 65, 1.0, 0, 0),
    ],
    boss: {
      art: 'b06_petros', name: '바위 슬라임', bg: '02', melee: true, dmg: 'phys',
      atk: 42, hp: 1600, spd: 0.75, def: 8, res: 2,
    },
  },
  {
    bg: '02', zone: '오염된 응집체들의 평원',
    kinds: [
      g('stone', 16, 230, 0.65, 7, 0),
      g('bone', 19, 135, 0.85, 3, 0),
      g('acid', 24, 70, 1.0, 0, 2),
    ],
    boss: {
      art: 'b07_idolatus', name: '가르는 슬라임', bg: '02', melee: true, dmg: 'phys',
      atk: 48, hp: 1900, spd: 0.75, def: 7, res: 3,
    },
  },
  {
    bg: '02', zone: '오염된 응집체들의 평원',
    kinds: [
      g('bone', 21, 165, 0.85, 4, 0),
      g('twin', 20, 125, 0.9, 2, 0),
      g('acid', 27, 80, 1.0, 0, 3),
    ],
    boss: {
      art: 'b08_solvenus', name: '녹이는 슬라임', bg: '02', melee: true, dmg: 'phys',
      atk: 54, hp: 2250, spd: 0.75, def: 5, res: 7,
    },
  },
  {
    bg: '02', zone: '오염된 응집체들의 평원',
    kinds: [
      g('bone', 23, 195, 0.85, 4, 0),
      g('twin', 22, 145, 0.9, 3, 0),
      g('acid', 30, 90, 1.0, 0, 4),
      g('thorn', 27, 75, 1.0, 0, 0),
    ],
    boss: {
      art: 'b09_osseus', name: '뼈무덤 슬라임', bg: '02', melee: true, dmg: 'phys',
      atk: 60, hp: 2650, spd: 0.7, def: 9, res: 5,
    },
  },
  {
    bg: '02', zone: '오염된 응집체들의 평원',
    kinds: [
      g('stone', 20, 300, 0.65, 9, 0),
      g('bone', 25, 220, 0.85, 5, 0),
      g('twin', 24, 170, 0.9, 3, 0),
      g('acid', 33, 100, 1.0, 0, 5),
    ],
    boss: {
      art: 'b10_sludginus', name: '슬라임 군주', bg: '02', melee: true, dmg: 'phys',
      atk: 68, hp: 3200, spd: 0.7, def: 11, res: 8,
    },
  },
  /* ── 11~20 · 타락한 군락의 정원 ── */
  {
    bg: '03', zone: '타락한 군락의 정원',
    kinds: [p('vine', 25, 350, 0.8, 6, 0), p('spore', 32, 160, 1.0, 2, 5)],
    boss: {
      art: 'b11_acanthus', name: '가시덤불 군체', bg: '03', melee: true, dmg: 'phys',
      atk: 75, hp: 3600, spd: 0.7, def: 13, res: 7,
    },
  },
  {
    bg: '03', zone: '타락한 군락의 정원',
    kinds: [
      p('vine', 27, 390, 0.8, 7, 0),
      p('maw', 32, 330, 0.8, 5, 2),
      p('spore', 35, 180, 1.0, 2, 6),
    ],
    boss: {
      art: 'b12_nepenthia', name: '아귀꽃 여왕', bg: '03', melee: true, dmg: 'phys',
      atk: 82, hp: 4000, spd: 0.7, def: 11, res: 10,
    },
  },
  {
    bg: '03', zone: '타락한 군락의 정원',
    kinds: [
      p('maw', 35, 370, 0.8, 6, 2),
      p('bramble', 30, 450, 0.75, 9, 0),
      p('spore', 38, 200, 1.0, 2, 7),
    ],
    boss: {
      art: 'b13_matrona', name: '덩굴 어미', bg: '03', melee: true, dmg: 'phys',
      atk: 90, hp: 4450, spd: 0.65, def: 15, res: 9,
    },
  },
  {
    bg: '03', zone: '타락한 군락의 정원',
    kinds: [
      p('bramble', 33, 500, 0.75, 10, 0),
      p('moss', 29, 570, 0.7, 12, 3),
      p('sap', 42, 210, 1.0, 2, 8),
    ],
    boss: {
      art: 'b14_columna', name: '홀씨 기둥', bg: '03', melee: true, dmg: 'phys',
      atk: 98, hp: 4950, spd: 0.65, def: 12, res: 15,
    },
  },
  {
    bg: '03', zone: '타락한 군락의 정원',
    kinds: [
      p('maw', 38, 430, 0.8, 7, 3),
      p('bramble', 36, 550, 0.75, 11, 0),
      p('moss', 32, 650, 0.7, 13, 4),
      p('sap', 47, 230, 1.0, 2, 9),
    ],
    boss: {
      art: 'b15_cadavera', name: '시체꽃', bg: '03', melee: true, dmg: 'phys',
      atk: 108, hp: 5500, spd: 0.65, def: 16, res: 13,
    },
  },
  {
    bg: '04', zone: '타락한 군락의 정원',
    kinds: [w('stump', 40, 700, 0.75, 14, 2), w('branch', 52, 300, 1.0, 5, 0)],
    boss: {
      art: 'b16_truncus', name: '늙은 그루터기', bg: '04', melee: true, dmg: 'phys',
      atk: 118, hp: 6200, spd: 0.6, def: 20, res: 12,
    },
  },
  {
    bg: '04', zone: '타락한 군락의 정원',
    kinds: [
      w('stump', 43, 760, 0.75, 15, 2),
      w('hollow', 45, 850, 0.7, 17, 3),
      w('branch', 56, 320, 1.0, 5, 0),
    ],
    boss: {
      art: 'b17_cavus', name: '속 빈 거인', bg: '04', melee: true, dmg: 'phys',
      atk: 128, hp: 6900, spd: 0.6, def: 23, res: 14,
    },
  },
  {
    bg: '04', zone: '타락한 군락의 정원',
    kinds: [
      w('hollow', 48, 950, 0.7, 18, 3),
      w('root', 43, 1050, 0.65, 21, 5),
      w('pod', 62, 350, 1.0, 5, 10),
    ],
    boss: {
      art: 'b18_spinosa', name: '가시나무', bg: '04', melee: true, dmg: 'phys',
      atk: 140, hp: 7700, spd: 0.6, def: 26, res: 16,
    },
  },
  {
    bg: '04', zone: '타락한 군락의 정원',
    kinds: [
      w('root', 47, 1150, 0.65, 22, 5),
      w('bark', 42, 1350, 0.6, 26, 8),
      w('branch', 60, 360, 1.0, 6, 0),
      w('pod', 68, 390, 1.0, 5, 11),
    ],
    boss: {
      art: 'b19_putridus', name: '썩은 거목', bg: '04', melee: true, dmg: 'phys',
      atk: 152, hp: 8600, spd: 0.55, def: 29, res: 18,
    },
  },
  {
    bg: '04', zone: '타락한 군락의 정원',
    kinds: [
      w('hollow', 52, 1050, 0.7, 20, 4),
      w('root', 50, 1250, 0.65, 24, 6),
      w('bark', 45, 1500, 0.6, 28, 9),
      w('pod', 75, 420, 1.0, 6, 12),
    ],
    boss: {
      art: 'b20_silvanus', name: '숲의 어른', bg: '04', melee: true, dmg: 'phys',
      atk: 170, hp: 10000, spd: 0.55, def: 33, res: 21,
    },
  },
];

/** 그 스테이지의 구성 — 열 판을 돌면 한 바퀴 */
export const stageOf = (stage: number): StageDef =>
  STAGES[(Math.max(1, Math.floor(stage)) - 1) % STAGES.length];

/** 이 스테이지에 나오는 종들 — 0 이 주력 */
export const kindsOf = (stage: number): readonly FoeKind[] => stageOf(stage).kinds;

/** 이 스테이지의 주력 (배경 그림은 여기서 나온다) */
export const kindOf = (stage: number): FoeKind => kindsOf(stage)[0];

/**
 * 스테이지 배수까지 먹인 적 한 마리의 실제 수치.
 *
 * `Armor` 를 만족한다 (`def` + `res`) — 아군의 `Stat` 과 같은 모양이라,
 * 피해 계산은 때리는 쪽도 맞는 쪽도 누구인지 몰라도 된다 (`strikeFor`).
 */
/*
  `def`·`res` 를 `Omit` 으로 걷어내고 `Armor` 쪽 것을 쓴다. `FoeKind` 에서는
  둘 다 선택(안 적으면 0)인데 여기서는 이미 채워진 값이라 필수여야 한다 —
  안 걷어내면 두 정의가 부딪혀 `Foe` 를 `Armor` 로 못 넘긴다.
*/
export interface Foe extends Omit<FoeKind, 'def' | 'res'>, Armor {
  hp: number;
  atk: number;
  spd: number;
  boss: boolean;
}

/**
 * 이 적의 한 대가 들고 나가는 것.
 *
 * 아군 쪽 `blowOf` 와 짝이다. **관통은 늘 없다** — 이유는 `FoeKind` 에
 * 적어 두었다. 적에게 관통을 주려면 여기 한 곳만 고치면 된다.
 */
export const foeBlow = (f: FoeKind): Blow => ({
  type: f.dmg ?? 'phys',
  pierce: NO_PIERCE,
});

/**
 * 서 있는 적 한 마리.
 *
 * 예전에는 남은 체력(`number`)만 늘어놓았다. 한 스테이지에 한 종만 나왔으니
 * 그것으로 충분했다. 이제는 근접과 원거리가 섞여 서므로 **어느 종인지**를
 * 같이 들고 다녀야 한다 — 세기도 다르고, 화면에서 걸어 나오는지도 다르다.
 */
export interface FoeSlot {
  /** 남은 체력 */
  hp: number;
  /**
   * 다음 공격까지 남은 시간 (ms).
   *
   * **마리마다 제 시계를 가진다.** 예전에는 0.5초 틱마다 모든 적이 한꺼번에
   * 때렸고, 세기 차이는 공격력에 `TICK_MS/1000` 을 곱해 표현했다. 그러면
   * 종마다 다른 공격속도를 넣을 자리가 없고, 방어력을 뺄셈으로 넣는 순간
   * 0.5 가 곱해진 작은 수에서 빼게 되어 방어 몇 점이 모든 공격을 지운다.
   *
   * 이제 틱마다 이 값을 `TICK_MS` 만큼 줄이고, 0 아래로 내려가면 **제 공격력
   * 그대로** 한 대 친 뒤 `1200 / spd` 만큼 다시 채운다.
   */
  cd: number;
  /**
   * 여태 휘두른 횟수. 1부터 센다.
   *
   * 우두머리의 특수 패턴이 **몇 번째 공격이냐**로 정해지므로 (`patternAt`)
   * 그걸 셀 자리가 필요하다. 시간으로 재지 않는 이유는 파티 스킬과 같다 —
   * 공격속도를 올리면 특수기도 같이 자주 나와야 말이 된다.
   *
   * 잡몹도 세지만 쓰지는 않는다. 마리마다 다르게 굴리면 "이건 우두머리
   * 전용" 이라는 갈래가 하나 더 생기고, 갈래가 둘이면 한쪽만 고치게 된다.
   */
  n: number;
  /** `kindsOf(stage)` 안에서의 자리 — 0 이 주력, 1 이 원거리 */
  k: number;
  /**
   * 이 한 마리의 고유 번호. 죽을 때까지 안 바뀐다.
   *
   * 자리 번호(`foes` 의 인덱스)로는 **누가 새로 온 놈인지 알 수 없다.** 한
   * 마리가 죽거나 근접이 앞에 끼어들면 남은 놈들의 자리가 통째로 밀려서,
   * 화면 입장에서는 전원이 새로 온 것처럼 보인다. 걸어 들어오는 연출을
   * 붙이려면 마리마다 변하지 않는 이름표가 필요하다.
   *
   * 화면의 React 키도 이걸 쓴다 — 자리 번호를 키로 쓰면 한 마리가 죽을
   * 때마다 남은 놈들이 다시 그려져 깜빡인다.
   */
  id: number;
}

/**
 * 이 슬롯이 원거리인가.
 *
 * 예전에는 `k === 1` 이면 원거리였다 — 스테이지마다 종이 딱 둘이라 1번이 늘
 * 원거리였기 때문이다. 초원은 한 판에 넷까지 나오므로 **번호로는 알 수 없고**
 * 그 종을 봐야 한다.
 */
export const isRanged = (f: FoeSlot, stage: number) =>
  !(kindsOf(stage)[f.k] ?? kindsOf(stage)[0]).melee;

/** 그 스테이지에서 붙어 싸우는 종들의 자리 번호 */
const meleeKinds = (stage: number): number[] =>
  kindsOf(stage).map((k, i) => (k.melee ? i : -1)).filter((i) => i >= 0);

/** 떨어져서 던지는 종들의 자리 번호 */
const rangedKinds = (stage: number): number[] =>
  kindsOf(stage).map((k, i) => (k.melee ? -1 : i)).filter((i) => i >= 0);

/**
 * 이 스테이지의 적 한 마리.
 *
 * ## 곡선
 *
 * 파티가 자랄 수 있는 폭은 정해져 있다. 레벨 50 에 등급 성장률을 다 받아도
 * 기본치의 4~6.4배고, 고유장비 +30 을 얹어도 공격이 8.8배쯤에서 멈춘다.
 * 그래서 적 곡선도 그 안에서 놀아야 한다 — 처음에 1.13 제곱으로 뒀다가
 * 20 만에 29배가 되어 파티가 영영 못 따라가는 걸 확인하고 낮췄다.
 *
 * 잡몹은 여럿이 한꺼번에 나오므로 **한 마리는 약하다.** 위험은 마리 수에서
 * 온다. 우두머리는 혼자 나오는 대신 체력이 열 배다 — 거기가 벽이다.
 */
/*
  ── 공용 체력 밑값(`FOE_HP`)은 없앴다 ──

  종마다 다른 체력을 밑값 하나에 배수로 표현하고 있었다. 종이 둘일 때는 됐는데
  열일곱이 되니, 어느 놈이 얼마나 단단한지 알려면 두 군데를 곱해 봐야 했다.
  이제는 `SLIME` 표에 그대로 적혀 있고, 스테이지 배수만 `foeOf` 가 얹는다.
*/


/**
 * 판이 오를 때 적에게 붙는 배수의 지수 — `hp * s^POW`.
 *
 * **지금은 둘 다 0 이다. 즉 배수가 없다.** 어느 판을 가도 적 수치가 1판과
 * 같고, 판마다 달라지는 것은 **어떤 종이 몇 마리 나오느냐**뿐이다.
 *
 * 레벨 디자인을 손으로 하기로 했기 때문이다. 배수가 얹혀 있으면 `SLIME` 표의
 * 숫자를 고쳐도 화면에서 나오는 값이 그것과 달라서, 한 판을 맞춰 놓고 다음
 * 판을 보면 또 어긋난다. 표에 적힌 값이 그대로 나와야 표를 고칠 수 있다.
 *
 * 곡선을 되살릴 때는 예전 값이 **체력 0.85 · 공격 0.35** 였다. 그 값은 강화 0
 * 인 파티가 2판에서 29초에 전멸하던 옛 지수(1.0 / 0.65)를 재서 낮춘 것이다 —
 * 다시 올릴 때 참고가 된다.
 */
export const STAGE_HP_POW = 0;
export const STAGE_ATK_POW = 0;

export function foeOf(stage: number, boss: boolean, k = 0): Foe {
  const s = Math.max(1, Math.floor(stage));
  const st = stageOf(s);
  const kind = boss ? st.boss : st.kinds[k] ?? st.kinds[0];
  return {
    ...kind,
    /* 배경은 스테이지가 정한다 — 같은 종이 여러 지역에 나온다 */
    bg: st.bg,
    name: kind.name,
    /*
      **종이 제 수치를 가지고, 스테이지는 배수만 얹는다.**

      우두머리에 따로 곱하지 않는다 — 우두머리 종의 수치가 이미 크다
      (1스테이지 빅 슬라임은 체력 300 · 공격 20 으로, 잡몹의 다섯 배와 두 배다).
      곱셈을 또 얹으면 그 표가 화면에서 벌어지는 일과 안 맞게 된다.
    */
    /*
      **곡선을 완만하게 잡았다.**

      1스테이지 수치는 손으로 정한 것이고(공 8 / 체 40), 판이 오를 때 여기에
      배수가 붙는다. 예전 지수(체력 1.0 · 공격 0.65)로는 2스테이지에서 공격이
      1.6배가 되는데, 파티는 판을 넘는다고 세지지 않는다 — 자라는 길은 골드로
      사는 강화 하나뿐이다. 재 보니 강화 0 인 파티가 2스테이지에서 29초에
      전멸했다.

      체력은 0.85, 공격은 0.35 로 낮췄다. 체력이 더 가파른 이유는, 오래 걸리는
      쪽은 지루할 뿐이지만 아픈 쪽은 곧바로 벽이 되기 때문이다.
    */
    hp: Math.max(1, Math.round(kind.hp * Math.pow(s, STAGE_HP_POW))),
    atk: Math.max(1, Math.round(kind.atk * Math.pow(s, STAGE_ATK_POW))),
    spd: kind.spd,
    def: kind.def ?? 0,
    res: kind.res ?? 0,
    boss,
  };
}

/** 잡았을 때 주는 골드 */
export function killGold(stage: number, boss: boolean): number {
  const s = Math.max(1, Math.floor(stage));
  return Math.floor(6 * Math.pow(s, 1.05) * (boss ? 20 : 1));
}

/*
  ── 경험치는 없다 ──

  잡으면 골드만 준다. 캐릭터가 자라는 길이 고유장비 강화 하나뿐이므로
  (`core/chars` 의 `statOf`), 그 길에 쓰는 것도 하나여야 한다. 경험치를
  같이 주면 "골드를 써서 올리는 것" 과 "켜 두면 오르는 것" 이 나란히 있게
  되고, 뒤엣것이 언제나 이긴다 — 아무것도 안 하는 쪽이 이기면 고를 것이 없다.
*/

/** 저장되는 전투 상태 */
export interface BattleState {
  /** 지금 스테이지 (1부터) */
  stage: number;
  /** 여태 닿은 가장 높은 스테이지 */
  best: number;
  /** 잡몹이 더 나올 때까지 남은 시간(ms). 0 이면 더 안 나온다 */
  msLeft: number;
  /** 우두머리가 나왔나 */
  boss: boolean;
  /**
   * 우두머리를 불렀나 — 사람이 "우두머리 토벌" 을 눌렀나.
   *
   * 누르는 순간 나오지는 않는다. **잡몹이 더 안 나오고**, 서 있던 놈을
   * 마저 잡으면 그때 우두머리가 걸어 나온다. 싸우던 것이 갑자기 사라지면
   * 이긴 건지 도망간 건지 알 수가 없다.
   */
  called: boolean;
  /**
   * 지금 서 있는 적들. **앞에서부터** 순서대로.
   * 우두머리 단계에서는 한 칸뿐이다.
   */
  foes: FoeSlot[];
  /** 이 스테이지에서 잡은 수 (보여 주기용) */
  slain: number;
  /**
   * 지금 노리는 적의 자리 (`foes` 의 인덱스).
   *
   * 잡을 때마다 남은 놈 중에서 **무작위로** 다시 고른다. 고르고 나면 그놈이
   * 죽을 때까지 안 바꾼다 — 매 틱 다시 고르면 셋을 조금씩 갉아먹기만 한다.
   *
   * 범위를 벗어나면(적이 죽어 목록이 줄었다면) 화면과 계산이 알아서 0 으로
   * 떨어뜨린다. 저장본을 믿지 않는 것과 같은 태도다.
   */
  target: number;
  /**
   * 파티원별 남은 체력. 키는 CharId.
   *
   * 기록에 없는 사람은 **가득 찬 것**으로 본다 (`core/party` 의 `hpOf`).
   * 그래서 파티에 새로 들어온 사람이 0 으로 시작하지 않는다.
   */
  hp: Record<string, number>;
  /** 다음에 나올 적에게 줄 번호. 계속 올라가기만 한다 */
  seq: number;
  /** 쓰러져 있는 동안 남은 틱. 0이면 싸우는 중 */
  down: number;
  /** 다음 한 마리가 걸어 들어올 때까지 (틱) */
  spawnIn: number;
  /**
   * 방금 나간 우두머리 특수기의 이름과 번호.
   *
   * `TickEvent.pattern` 은 **그 한 틱에만** 실려 온다. 화면은 스토어가 넣어
   * 준 상태만 보므로(틱 결과를 직접 못 본다) 거기 실린 값은 다음 그리기
   * 전에 사라진다. `BossCall` 이 `battle.boss` 의 거짓→참을 보고 있는 것과
   * 같은 문제라, 같은 방식으로 상태에 남긴다.
   *
   * `patSeq` 는 **같은 이름이 연달아 나와도** 화면이 알아보게 하는 번호다.
   * 이름만 보면 휩쓸기 다음에 또 휩쓸기가 나올 때 안 바뀐 것으로 읽힌다.
   */
  pat: string | null;
  patSeq: number;
  /**
   * 판 시작 연출이 끝나기까지 남은 시간 (ms). 0 이면 평소.
   *
   * `OPEN_WALK_MS` 보다 크면 검은 막이 덮인 채라 **아무것도 안 싸운다.**
   * 그 아래로 내려오면 양쪽에서 걸어 들어오는 중이고, 싸움은 이미 돈다.
   */
  openIn: number;
  /**
   * **화면을 덮는 중**이면 남은 시간 (ms). 0 이면 평소.
   *
   * 판이 바뀌는 길은 둘이다 — 우두머리를 잡거나, `< >` 로 골라 가거나.
   * 둘 다 **바뀌기 전에 먼저 어두워져야 한다.** 그래서 시계 하나를 같이
   * 쓴다: 여기에 시간을 걸어 두고 `goTo` 에 갈 곳을 적어 두면, 다 흐른 뒤에
   * 틱이 옮긴다.
   *
   * 예전에는 우두머리 쪽만 이렇게 하고 `< >` 는 그 자리에서 갈아 치웠다.
   * 그러면 "적이 바뀐다 → 어두워진다 → 밝아진다" 가 되어, 감추려던 순간이
   * 막이 오기 전에 다 보인다.
   */
  clearIn: number;
  /**
   * 덮는 동안 무엇을 띄우나.
   *
   * `boss` 면 `Clear`, `move` 면 아무것도 안 띄우고 그냥 어두워진다.
   * 판을 옮기는 것은 사용자가 방금 누른 일이라 설명할 것이 없다.
   */
  clearKind: 'boss' | 'move' | null;
  /**
   * 다 덮이면 갈 판. `null` 이면 다음 판 (`nextStage`).
   *
   * `< >` 로 뒤로 갈 수도 있으므로 "다음" 으로는 표현이 안 된다.
   */
  goTo: number | null;
}

/**
 * 스테이지를 시작할 때 세워 둘 잡몹들.
 *
 * 한 마리로 시작하면 나머지 둘이 걸어 들어올 때까지 화면이 허전하다.
 * 처음부터 채워 두고, 죽는 만큼 다시 채운다.
 */
/*
  근접을 **앞에**, 원거리를 **뒤에** 세운다.

  `foes[0]` 이 맨 앞(아군과 마주 보는 쪽)이다. 원거리가 앞에 서면 붙어 싸우는
  놈이 그 뒤에서 허우적대는 그림이 된다 — 실제로 그렇게 보였다.
*/
const startFoes = (stage: number, seq = 0): { foes: FoeSlot[]; seq: number } => {
  const foes: FoeSlot[] = [];
  let n = seq;
  const m = meleeKinds(stage);
  const r = rangedKinds(stage);

  /*
    종이 여럿이면 **돌아가며** 세운다.

    무작위로 뽑으면 같은 종만 넷이 서는 판이 나온다. 한 판에 두세 종을 둔
    이유가 화면에서 여러 가지가 동시에 벌어지게 하려는 것이므로, 첫 대형만은
    고르게 섞어 둔다. 그 뒤로 걸어 들어오는 놈은 무작위다.
  */
  const wantMelee = r.length ? MOB_CAP - RANGED_CAP : MOB_CAP;
  for (let i = 0; i < wantMelee && m.length; i++) {
    const k = m[i % m.length];
    foes.push(fresh(stage, k, n++));
  }
  /* 남은 자리를 **먼저 센다** — 안에서 세면 넣을 때마다 목표가 줄어든다 */
  const wantRanged = r.length ? MOB_CAP - foes.length : 0;
  for (let i = 0; i < wantRanged; i++) {
    const k = r[i % r.length];
    foes.push(fresh(stage, k, n++));
  }
  return { foes, seq: n };
};

/**
 * 갓 선 한 마리.
 *
 * 시계를 **제 간격만큼 채운 채로** 시작한다 (0 이 아니다). 0 으로 두면
 * 걸어 들어오는 그 프레임에 바로 한 대 치므로, 화면에서는 아직 화면 끝에
 * 있는데 아군 체력이 닳는다.
 */
function fresh(stage: number, k: number, id: number): FoeSlot {
  const kind = foeOf(stage, false, k);
  return { hp: kind.hp, k, id, cd: swingMs(kind.spd), n: 0 };
}

/**
 * 한 마리를 줄에 끼워 넣는다. **끼운 자리**를 돌려준다.
 *
 * 근접은 원거리 앞에, 원거리는 맨 뒤에. 그냥 뒤에 붙이면 근접이 원거리
 * 뒤에서 나타나고, 그러면 앞줄이 빈 채로 뒤에서만 두 줄이 선다.
 */
function spawnInto(
  foes: FoeSlot[], stage: number, seq: number, rand: () => number = Math.random,
): number {
  const m = meleeKinds(stage);
  const r = rangedKinds(stage);
  const alive = foes.filter((f) => isRanged(f, stage)).length;

  /* 뒷줄이 덜 찼고 앞줄이 이미 섰으면 원거리를, 아니면 근접을 */
  const wantRanged = r.length > 0
    && alive < RANGED_CAP
    && foes.length >= MOB_CAP - RANGED_CAP;
  const pool = wantRanged ? r : (m.length ? m : r);
  const k = pool[Math.floor(rand() * pool.length)] ?? 0;

  const slot: FoeSlot = fresh(stage, k, seq);
  if (wantRanged) { foes.push(slot); return foes.length - 1; }

  /* 근접은 원거리 앞에 — 그냥 뒤에 붙이면 앞줄이 빈 채로 뒤에서만 선다 */
  const at = foes.findIndex((f) => isRanged(f, stage));
  if (at < 0) { foes.push(slot); return foes.length - 1; }
  foes.splice(at, 0, slot);
  return at;
}

export const newBattle = (): BattleState => {
  const first = startFoes(1);
  return {
    stage: 1, best: 1, msLeft: STAGE_MS, boss: false,
    foes: first.foes, seq: first.seq,
    slain: 0, target: 0, hp: {}, down: 0, spawnIn: 0,
    openIn: OPEN_MS, clearIn: 0, clearKind: null, goTo: null,
    called: false, pat: null, patSeq: 0,
  };
};

export { startFoes };

/**
 * 지금 **싸움이 멈춰 있나** — 판 연출 중인가.
 *
 * 검은 막이 덮인 동안(`openIn` 이 걸어 들어오는 몫보다 클 때)과 `Clear` 가
 * 떠 있는 동안(`clearIn`)이다. 걸어 들어오는 마지막 한 틱은 **아니다** —
 * 들어오면서 붙는 것이 판이 시작되는 그림이다.
 *
 * 세 곳이 이걸 본다: 틱(`battleTick`), 평타(`strikeFoe`), 스킬(`skillFoe`).
 * 평타와 스킬은 틱이 아니라 **화면이 제 박자로** 부르기 때문에, 틱만 막으면
 * 막 뒤에서 아군이 계속 휘두른다.
 *
 * 두 칸 다 없는 저장본이 있을 수 있어 `Number.isFinite` 로 거른다 (예전에
 * 적 시계 `cd` 가 NaN 으로 눌러앉아 그 적이 영영 공격을 안 한 적이 있다).
 */
export const fightHeld = (st: BattleState): boolean => (
  (Number.isFinite(st.clearIn) && st.clearIn > 0)
  || (Number.isFinite(st.openIn) && st.openIn > 0)
);

/** 다음 판. `STAGE_CAP` 에 걸리면 그 자리에 머문다 */
export const nextStage = (stage: number): number => (
  STAGE_CAP === null ? stage + 1 : Math.min(STAGE_CAP, stage + 1)
);

/** 골라 갈 수 있는 판인가 — **깬 판과 지금 판까지** */
export const canGoStage = (st: BattleState, stage: number): boolean => (
  Number.isInteger(stage) && stage >= 1 && stage <= Math.max(1, st.best)
);

/**
 * 그 판을 **처음부터** 세운다.
 *
 * 판이 열리는 길은 셋이다 — 우두머리를 잡아 넘어가거나, 전멸하고 다시
 * 서거나, `< >` 로 골라 가거나. 셋이 하는 일은 같은데 세 군데에 흩어져
 * 있었고, 실제로 조금씩 달랐다 (`spawnIn` 을 안 지우는 곳이 있었다).
 *
 * `hp` 는 부르는 쪽이 정한다. 넘어갈 때는 **그대로 넘기고**(잡았다고 차지
 * 않는다), 전멸했을 때는 가득 채운다.
 */
export function enterStage(
  st: BattleState, stage: number, hp: Record<string, number>,
): BattleState {
  const s = Math.max(1, Math.floor(stage));
  const next = startFoes(s, st.seq);
  return {
    ...st,
    stage: s,
    best: Math.max(st.best, s),
    msLeft: STAGE_MS,
    boss: false,
    foes: next.foes,
    seq: next.seq,
    slain: 0,
    target: 0,
    hp,
    down: 0,
    spawnIn: 0,
    openIn: OPEN_MS,
    clearIn: 0,
    clearKind: null,
    goTo: null,
    /* 새 판은 다시 1분을 사냥해야 부를 수 있다 */
    called: false,
    /* 판이 바뀌면 지난 판의 특수기 이름이 남아 있으면 안 된다 */
    pat: null,
  };
}

/** 우두머리를 부를 수 있나 — 사냥 시간이 다 됐고 아직 안 불렀다 */
export const bossReady = (st: BattleState): boolean => (
  !st.boss && !st.called && st.msLeft <= 0 && !fightHeld(st)
);

/**
 * 우두머리를 부른다. 부를 수 없으면 그대로 돌려준다.
 *
 * 여기서 우두머리를 세우지 않는다 — 잡몹이 서 있으면 마저 잡아야 하므로,
 * 표시만 해 두고 실제로 세우는 것은 틱이 한다.
 */
export function callBoss(st: BattleState): BattleState {
  if (!bossReady(st)) return st;
  return { ...st, called: true };
}

/**
 * 판을 옮기기 시작한다 — **바로 안 옮긴다.**
 *
 * 화면을 먼저 덮고(`clearIn`), 다 덮인 뒤에 틱이 `goTo` 로 옮긴다. 그
 * 순서여야 바뀌는 순간이 막 아래에서 일어난다.
 *
 * 갈 수 없는 판이거나 이미 그 판이면 그대로 돌려준다 — 부르는 쪽이
 * 판단하지 않아도 되게.
 */
export function leaveFor(st: BattleState, stage: number): BattleState {
  if (!canGoStage(st, stage) || stage === st.stage) return st;
  return { ...st, clearIn: MOVE_MS, clearKind: 'move', goTo: stage };
}

/**
 * 자리별로 노려지는 확률. 앞에서부터 1·2·3·4번 자리.
 *
 * **앞에 설수록 많이 맞는다.** 그게 줄을 세우는 유일한 이유다 — 누가 앞에
 * 서는지가 아무 차이도 안 만들면 파티를 짤 것도 없다.
 *
 * 예전에는 두 규칙이 서로 달랐다. 아군은 한 놈을 **죽을 때까지 물었고**,
 * 적은 **늘 맨 앞 한 명만** 때렸다. 그래서 화면에서 벌어지는 일이 두 가지
 * 다른 논리로 굴러갔고, 어느 쪽도 "왜 저놈이 맞나" 가 설명되지 않았다.
 *
 * 이제 양쪽이 같다. **평타 한 번마다 다시 굴린다** — 그래서 같은 놈을 연달아
 * 칠 수도 있고 바뀔 수도 있다. 도발처럼 기술이 대상을 정하는 경우만 예외다.
 */
export const AIM = [0.50, 0.25, 0.15, 0.10];

/**
 * 이번에 노릴 자리를 고른다.
 *
 * 서 있는 수가 넷보다 적으면 있는 만큼의 확률만 남겨 다시 나눈다 — 둘뿐이면
 * 50:25 가 아니라 **67:33** 이다. 안 그러면 남은 확률만큼 아무도 안 맞는다.
 */
export function pickAim(count: number, rand: () => number = Math.random): number {
  const n = Math.max(0, Math.floor(count));
  if (n <= 1) return 0;
  const w = AIM.slice(0, n);
  const total = w.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < w.length; i++) {
    r -= w[i];
    if (r < 0) return i;
  }
  return w.length - 1;
}

/**
 * 다음에 노릴 자리를 고른다.
 *
 * 남아 있는 놈 중 **아무나**. 늘 맨 앞을 고르면 적이 위·가운데·아래로 나와도
 * 한 자리만 계속 때려서, 여럿이 나오는 의미가 없어진다.
 *
 * @param rand 검사에서 결과를 재현하려고 밖에서 넣을 수 있게 열어 둔다
 */
export function pickTarget(count: number, rand: () => number = Math.random): number {
  if (count <= 1) return 0;
  return Math.min(count - 1, Math.floor(rand() * count));
}

/**
 * 지금 실제로 노리고 있는 자리.
 *
 * 저장된 `target` 이 범위를 벗어나 있을 수 있다 (적이 줄었거나 저장본이
 * 낡았거나). 그럴 때는 0 으로 떨어뜨린다 — 화면과 계산이 같은 답을 봐야
 * "때리는 놈" 과 "체력이 닳는 놈" 이 갈리지 않는다.
 */
export const targetOf = (st: BattleState): number =>
  st.foes.length ? Math.min(Math.max(0, Math.floor(st.target)), st.foes.length - 1) : 0;

/** 한 틱에 일어난 일 — 화면이 연출로 쓴다 */
export interface TickEvent {
  /** 파티가 넣은 피해 */
  hit: number;
  /** 파티가 받은 피해 */
  taken: number;
  /** 그 피해를 받은 사람 (CharId). 아무도 안 맞았으면 null */
  hurt: string | null;
  /** 이번 틱에 쓰러진 사람 */
  fell: string | null;
  /** 이번 틱에 잡은 수 */
  killed: number;
  /** 우두머리를 잡아 스테이지를 넘겼나 */
  cleared: boolean;
  /** 우두머리가 방금 나타났나 */
  bossCame: boolean;
  wiped: boolean;
  gold: number;
  /** 이번에 회복한 총량 (사제의 기도) */
  healed: number;
  /**
   * 이번 틱에 나간 우두머리 특수기의 이름. 안 나갔으면 `null`.
   *
   * 화면이 이걸 보고 이름을 띄운다. 이름이 없으면 전원이 한꺼번에 맞는
   * 순간이 그냥 "숫자가 여러 개 뜬 것" 으로만 보여서, 무엇 때문에 아팠는지를
   * 알 수가 없다.
   */
  pattern: string | null;
}

export interface TickResult {
  battle: BattleState;
  ev: TickEvent;
}

const NOTHING: TickEvent = {
  hit: 0, taken: 0, hurt: null, fell: null, killed: 0, cleared: false,
  bossCame: false, wiped: false, gold: 0, healed: 0, pattern: null,
};

/**
 * 한 틱.
 *
 * @param st    지금 전투 상태
 * @param party 파티 자리
 * @param chars 가지고 있는 캐릭터들
 */
export function battleTick(
  st: BattleState,
  party: Party,
  chars: Record<string, OwnedChar>,
  rand: () => number = Math.random,
): TickResult {
  const ps = partyStat(party, chars);

  // 아무도 없으면 아무 일도 안 일어난다 — 빈 파티로 스테이지가 오르면 안 된다
  if (ps.count === 0 || ps.dps <= 0) {
    return { battle: { ...st, hp: {}, down: 0 }, ev: NOTHING };
  }

  /*
    ── 연출 중에는 안 싸운다 ──

    `clearIn`/`openIn` 이 저장본에 없을 수 있다 (이 두 칸이 생기기 전의
    저장본). `undefined - TICK_MS` 는 NaN 이고 `NaN > 0` 은 거짓이라 그냥
    지나가긴 하지만, 그 NaN 이 상태에 눌러앉으면 영영 안 없어진다. 예전에
    적 시계(`cd`)에서 똑같이 당했으므로 읽을 때 한 번 걸러 둔다.
  */
  const clearIn = Number.isFinite(st.clearIn) ? st.clearIn : 0;
  if (clearIn > 0) {
    const left = clearIn - TICK_MS;
    if (left > 0) return { battle: { ...st, clearIn: left }, ev: NOTHING };
    /*
      다 어두워졌다 — 이제 옮긴다.

      `goTo` 가 있으면 거기로 (`< >` 로 고른 판), 없으면 다음 판으로
      (우두머리를 잡았을 때). 체력은 그대로 간다 — 판을 옮겼다고 회복시키면
      위험할 때마다 한 판 갔다 오는 것이 제일 싼 회복 수단이 된다.
    */
    const to = Number.isFinite(st.goTo) && st.goTo ? st.goTo : nextStage(st.stage);
    return { battle: enterStage(st, to, st.hp), ev: NOTHING };
  }

  const openIn = Number.isFinite(st.openIn) ? st.openIn : 0;
  if (openIn > 0) {
    /*
      막이 덮여 있거나 걸어 들어오는 중이다 — **시간만 흐른다.**

      다 모일 때까지 아무도 안 친다. 들어오면서 치게 해 봤는데, 몸은 옆으로
      미끄러지고 투사체는 제자리 기준으로 날아가서 쏜 자리와 몸이 어긋났다.
    */
    return { battle: { ...st, openIn: Math.max(0, openIn - TICK_MS) }, ev: NOTHING };
  }

  const mob = foeOf(st.stage, false);
  const bossFoe = foeOf(st.stage, true);

  // 쓰러져 있는 동안은 시간만 흐른다
  if (st.down > 0) {
    const down = st.down - 1;
    if (down > 0) return { battle: { ...st, down }, ev: NOTHING };
    // 다시 일어선다 — 그 스테이지를 처음부터, 시작 연출도 다시
    return {
      battle: enterStage(st, st.stage, fullHp(party, chars)),
      ev: NOTHING,
    };
  }

  /*
    체력 기록을 다듬는다.

    파티가 바뀌었을 수 있다. 빠진 사람의 기록은 버리고, 새로 들어온 사람은
    `hpOf` 가 가득 찬 것으로 읽는다. 최대치를 넘은 값도 여기서 깎인다 —
    안 그러면 강한 파티에서 약한 파티로 바꿀 때 그만큼 공짜 체력이 된다.
  */
  const hp: Record<string, number> = {};
  for (const c of members(party, chars)) hp[c.id] = hpOf(c, st.hp);

  let foes = [...st.foes];
  let { msLeft, slain, spawnIn, target, seq } = st;
  let isBoss = st.boss;
  let bossCame = false;

  // ── 시간이 흐른다 ──
  if (!isBoss) msLeft = Math.max(0, msLeft - TICK_MS);

  /*
    ── 잡몹이 걸어 들어온다 ──

    **시간이 다 돼도 계속 나온다.** 예전에는 `msLeft > 0` 일 때만 채웠다 —
    시간이 되면 잡몹이 끊기고 우두머리가 저절로 나오는 흐름이었기 때문이다.
    이제 우두머리는 사람이 부르므로, 부르기 전까지는 사냥이 이어져야 한다.
    안 그러면 단추를 안 누른 사람 앞에서 화면이 텅 빈 채로 멈춘다.

    부르고 나면(`called`) 그때부터 안 채운다. 서 있던 놈을 마저 잡으면
    자리가 비고, 그 자리에 우두머리가 걸어 나온다.
  */
  if (!isBoss && !st.called) {
    spawnIn -= 1;
    if (spawnIn <= 0 && foes.length < MOB_CAP) {
      /*
        근접은 원거리 **앞에** 끼워 넣는다. 그래서 자리가 밀릴 수 있고,
        노리던 놈의 번호도 같이 밀어 줘야 한다 — 안 그러면 때리던 놈이
        아니라 방금 걸어 들어온 놈을 때린다.
      */
      const at = spawnInto(foes, st.stage, seq);
      seq += 1;
      if (at <= target) target += 1;
      spawnIn = SPAWN_TICKS;
    }
  }

  /*
    시간이 다 됐고 남은 잡몹도 정리했으면 **우두머리가 걸어 나온다.**

    시간이 되는 순간 잡몹을 지워 버리지 않는다. 싸우던 것이 갑자기 사라지면
    이긴 건지 도망간 건지 알 수 없다 — 마저 잡게 두고, 다 잡히면 그때 나온다.
  */
  if (!isBoss && st.called && foes.length === 0) {
    isBoss = true;
    bossCame = true;
    foes = [{ hp: bossFoe.hp, k: 0, id: seq, cd: swingMs(bossFoe.spd), n: 0 }];
    seq += 1;
  }

  /*
    파티 공격은 여기서 **안 한다.**

    예전에는 이 틱이 파티 전체 딜을 한꺼번에 넣었다. 그런데 화면에서 검을
    휘두르는 박자는 캐릭터마다 다르고 (`Fighter`), 그 둘이 따로 놀아서
    **안 휘둘렀는데 적 체력이 닳았다.**

    지금은 `applyHit` 이 휘두르는 그 순간에 한 명분 피해를 넣는다.
    이 틱이 하는 일은 시간·등장·적 공격뿐이다.
  */
  const hit = 0;
  const killed = 0;
  const gold = 0;

  // ── 살아 있는 적 전부가 때린다 ──
  /*
    방어 역할이 앞에서 받으면 피해가 줄어든다.

    줄이는 폭을 방어 캐릭터의 체력에 비례시키지 않고 **고정 35%** 로 뒀다.
    체력에 비례시키면 방어를 키울수록 받는 피해가 0 에 수렴해서 전투가
    끝나지 않는다. 고정이면 방어는 "한 판을 더 버티게" 해 줄 뿐이다.
  */
  /*
    적도 **자리별 확률로** 고른다 (`AIM`). 아군이 적을 고르는 규칙과 같다.

    예전에는 맨 앞 한 명만 때렸다. 한 명씩 무너지는 그림은 좋았지만, 그러면
    뒤에 선 셋은 앞이 쓰러지기 전까지 한 대도 안 맞아서 자리에 뜻이 없었다.
    앞이 절반을 받고 뒤로 갈수록 덜 받는 지금이 "앞에 세운다" 를 실제로 만든다.

    **마리마다 제 박자로 친다.** 틱마다 시계를 줄이고, 다 된 놈만 한 대 친다.
    그래서 느린 놈(진흙 0.6)과 빠른 놈(산성 1.0)이 화면에서도 다르게 때린다 —
    예전처럼 전원이 0.5초마다 같이 때리면 공격속도를 적어 둘 자리가 없다.

    **방어력은 맞는 사람 것을 뺀다.** 비율이 아니라 뺄셈이라, 이졸데(방어 5)는
    슬라임의 10 을 5 로 받고 리안느(방어 1)는 9 로 받는다. 예전의 "방어 역할이면
    35% 감소" 를 대신한다 — 역할이 아니라 **수치**가 정하는 쪽이 맞다.
  */
  const line = members(party, chars).filter((c) => hp[c.id] > 0);

  let fell: string | null = null;
  let taken = 0;
  let hurtId: string | null = null;

  /* 시계가 줄어든 새 목록 — 원본을 안 건드린다 */
  const ticked = foes.map((f) => {
    /*
      **우두머리는 우두머리의 수치로 읽는다.**

      `false` 로 박혀 있었다. 지금은 열 판 수치를 다 같게 맞춰 둬서 눈에
      안 띄지만, 우두머리 공격속도를 따로 잡는 순간 우두머리가 잡몹 박자로
      치게 된다 — 그리고 그건 표를 아무리 들여다봐도 안 보인다.
    */
    const kind = foeOf(st.stage, isBoss, f.k);
    /*
      **없는 시계는 0 으로 친다.**

      `cd` 는 나중에 생긴 칸이라, 그 전에 저장된 판을 이어서 켜면 `undefined`
      가 들어온다. 그대로 빼면 NaN 이 되고 `NaN <= 0` 은 거짓이라 **그 적은
      영원히 공격하지 않는다** — 화면에서는 적이 가만히 서 있고 아군은 안전한,
      전투가 아닌 것이 된다.
    */
    let cd = (Number.isFinite(f.cd) ? f.cd : 0) - TICK_MS;
    /* `n` 도 나중에 생긴 칸이다 — `cd` 와 같은 이유로 걸러서 읽는다 */
    let n = Number.isFinite(f.n) ? f.n : 0;
    let swings = 0;
    /* 한 틱 안에 두 번 칠 수도 있다 (아주 빠른 적) */
    const at: (BossPattern | null)[] = [];
    while (cd <= 0 && swings < 4) {
      swings += 1;
      n += 1;
      cd += swingMs(kind.spd);
      /*
        **우두머리만** 패턴을 쓴다. 잡몹도 횟수는 세지만(갈래를 안 늘리려고)
        고르지는 않는다 — 잡몹 넷이 각자 특수기를 쓰면 화면이 읽히지 않는다.
      */
      at.push(isBoss ? patternAt(n, kind.patterns ?? BOSS_PATTERNS) : null);
    }
    return { slot: { ...f, cd, n }, atk: kind.atk, blow: foeBlow(kind), swings, at };
  });
  /* 줄어든 시계를 실제로 들고 나간다 — 안 그러면 시계가 영영 안 준다 */
  foes = ticked.map((t) => t.slot);

  /*
    친 만큼 한 대씩 늘어놓는다. 한 대마다 **어떤 공격이었는지**를 달고 간다.

    우두머리와 잡몹을 갈라 놓았었다 (`isBoss` 면 `bossFoe.atk`). 이제 위에서
    제 종을 제대로 읽으므로 `t.atk` 하나면 된다 — 갈래가 둘이면 한쪽만 고치는
    일이 생기고, 실제로 시계는 잡몹 것을 쓰면서 공격력만 우두머리 것을 쓰고
    있었다.
  */
  const hits: { atk: number; blow: Blow; pat: BossPattern | null }[] = [];
  for (const t of ticked) {
    for (let i = 0; i < t.swings; i++) {
      /* 무슨 피해인지도 한 대마다 달고 간다 — 종마다 다를 수 있다 (`FoeKind.dmg`) */
      hits.push({ atk: t.atk, blow: t.blow, pat: t.at[i] ?? null });
    }
  }

  /* 이번 틱에 나간 특수기 — 화면이 이름을 띄운다. 여럿이면 마지막 것 */
  let pattern: string | null = null;

  for (const h of hits) {
    const alive = line.filter((c) => hp[c.id] > 0);
    if (!alive.length) break;

    /*
      **누구를 때리나.**

      평타와 `one` 은 자리 확률대로 한 명 (`AIM`). `all` 은 살아 있는 전원이다 —
      앞에 세운 사람이 대신 받아 줄 수 없는 유일한 공격이라, 여기서만 회복이
      유일한 대답이 된다.
    */
    const marks = h.pat && h.pat.aim === 'all'
      ? alive
      : [alive[pickAim(alive.length, rand)]];

    for (const who2 of marks) {
      /*
        배수는 **방어력을 빼기 전에** 곱한다. 뺀 뒤에 곱하면 방어가 배수만큼
        같이 커져서, 세게 치는 공격일수록 방어가 잘 먹는 거꾸로 된 일이 된다.
      */
      /*
        맞는 사람의 **두 겹**을 통째로 넘긴다 (`Stat` 이 `Armor` 다). 어느
        겹이 걸릴지는 h.blow 가 정한다 — 지금 적은 전부 물리라 늘 방어력
        쪽이지만, 마법으로 때리는 적이 생기면 여기는 안 고쳐도 된다.
      */
      const dmg = strikeFor(
        Math.round(h.atk * (h.pat ? h.pat.mul : 1)), 1, statOf(who2), h.blow,
      );
      hp[who2.id] = Math.max(0, hp[who2.id] - dmg);
      taken += dmg;
      hurtId = who2.id;
      if (hp[who2.id] <= 0) fell = who2.id;
    }
    if (h.pat) pattern = h.pat.name;
  }

  if (allDown(party, chars, hp)) {
    const restart = startFoes(st.stage, seq);
    return {
      battle: {
        ...st,
        msLeft: STAGE_MS,
        boss: false,
        foes: restart.foes,
        seq: restart.seq,
        slain: 0,
        target: 0,
        hp,
        down: REVIVE_TICKS,
        spawnIn: 0,
        pat: null,
      },
      ev: {
        hit, taken, hurt: hurtId, fell, pattern,
        killed, cleared: false, bossCame, wiped: true, gold, healed: 0,
      },
    };
  }

  return {
    battle: {
      ...st,
      msLeft, boss: isBoss, foes, slain, target, seq,
      hp, down: 0, spawnIn,
      /*
        나간 특수기를 상태에 남긴다 — 화면은 틱 결과를 못 보고 상태만 본다.
        번호를 같이 올려서, 휩쓸기 다음에 또 휩쓸기가 나와도 화면이 "새로
        나갔다" 를 알아보게 한다.
      */
      pat: pattern ?? st.pat ?? null,
      patSeq: pattern ? (Number.isFinite(st.patSeq) ? st.patSeq : 0) + 1 : (st.patSeq ?? 0),
    },
    ev: {
      hit, taken, hurt: hurtId, fell, pattern,
      killed, cleared: false, bossCame, wiped: false, gold, healed: 0,
    },
  };
}

/**
 * 한 번 휘두른 결과 — **화면에서 검을 내려치는 그 순간** 불린다.
 *
 * ## 왜 틱이 아니라 휘두름인가
 *
 * 예전에는 `battleTick` 이 0.5초마다 파티 전체 딜을 한꺼번에 넣었다. 계산은
 * 맞았지만 화면과 어긋났다 — 캐릭터는 1.3초에 한 번 휘두르는데 체력은
 * 0.5초마다 줄었으니, **안 휘둘렀는데 적이 맞고** 휘둘렀는데 아무 일도
 * 안 일어나는 순간이 생겼다.
 *
 * 지금은 `Fighter` 가 `cut_2`(검이 몸 앞을 지나는 칸)에 닿을 때 이걸 부른다.
 * 보이는 것과 계산이 같은 순간에 일어난다.
 *
 * ## 세기는 그대로다
 *
 * 한 번에 `공격력 × 보조배수` 가 들어가고, 그걸 `spd` 마다 한 번씩 하므로
 * 초당 피해는 예전 `partyStat().dps` 와 같다. 곡선을 다시 잡을 필요가 없었다.
 *
 * @param who 휘두른 사람. 파티에 없거나 쓰러졌으면 아무 일도 안 일어난다
 */
export function applyHit(
  st: BattleState,
  who: string,
  party: Party,
  chars: Record<string, OwnedChar>,
  rand: () => number = Math.random,
  /** 화면이 이미 고른 자리. 없으면 여기서 고른다 (시험·서버용) */
  aim?: number,
): TickResult {
  const me = chars[who];
  /* 쓰러져 있거나, 파티에 없거나, 적이 없으면 헛스윙이다 */
  if (!me || !party.includes(who as never) || st.down > 0 || !st.foes.length) {
    return { battle: st, ev: NOTHING };
  }
  if (hpOf(me, st.hp) <= 0) return { battle: st, ev: NOTHING };

  const mine = statOf(me);
  const foes = [...st.foes];
  /*
    **한 번 칠 때마다 다시 고른다.**

    예전에는 `target` 을 물고 그놈이 죽을 때까지 놓지 않았다. 그러면 뒤에 선
    놈은 앞이 다 죽기 전까지 한 번도 안 맞는데, 자리마다 맞을 확률을 둔 지금은
    그 자리가 뜻이 없어진다.

    화면이 이미 골랐으면 그대로 쓴다 — 불꽃이 튀는 놈과 체력이 닳는 놈을
    어긋나게 하지 않으려면 한쪽이 골라 넘겨야 한다.
  */
  /*
    화면이 넘긴 자리는 **줄 길이로 한 번 조인다.**

    날아가는 것이 있는 공격은 손을 떠날 때 자리가 정해지고 닿을 때 피해가
    들어간다 (`Fighter` 의 `onAim` → `onSwing`). 그 사이 300ms 쯤에 앞줄이
    죽어 줄이 짧아졌을 수 있다 — 조이지 않으면 없는 놈을 때린다.
  */
  const at = Math.min(aim ?? pickAim(foes.length, rand), Math.max(0, foes.length - 1));
  /*
    맞는 놈이 들고 있는 만큼 깎인다 — 종마다 다르다.

    `foeOf` 가 돌려주는 것이 곧 `Armor` 라 그대로 넘긴다. 어느 겹이 걸릴지는
    때리는 사람의 평타 종류가 정한다 (`blowOf` — 아녜스만 마법이다).
  */
  const dmg = strikeFor(
    mine.atk * supportMul(party, chars), rollCrit(mine, rand),
    foeOf(st.stage, st.boss, foes[at].k), blowOf(me.id),
  );
  foes[at] = { ...foes[at], hp: foes[at].hp - dmg };

  if (foes[at].hp > 0) {
    return {
      battle: { ...st, foes, target: at },
      ev: { ...NOTHING, hit: dmg },
    };
  }

  // ── 잡았다 ──
  foes.splice(at, 1);
  const gold = killGold(st.stage, st.boss);

  /*
    회복은 **살아 있는 사람에게만**, 각자 제 최대치의 비율로.

    쓰러진 사람까지 채워 주면 잡을 때마다 전멸이 취소되어 아무도 안 죽는다.
    일어나는 건 스테이지를 다시 시작할 때뿐이다.
  */

  // 우두머리를 잡았다 — 다음 스테이지
  if (st.boss) {
    /*
      **바로 안 넘어간다.** `clearIn` 을 걸어 두면 틱이 그 시간을 흘려보낸
      뒤에 넘긴다 (`battleTick` 위쪽). 그 사이 화면은 `Clear` 를 띄우고
      어두워진다.

      보상과 `cleared` 는 지금 준다 — 잡은 건 잡은 것이고, 연출이 끝나기
      전에 앱을 닫아도 받은 것이 사라지면 안 된다.
    */
    return {
      battle: {
        ...st,
        foes,
        slain: st.slain + 1,
        target: 0,
        clearIn: CLEAR_MS,
        clearKind: 'boss',
        goTo: nextStage(st.stage),
      },
      ev: {
        ...NOTHING, hit: dmg, killed: 1, cleared: true, gold,
      },
    };
  }

  /* 다음 놈은 **무작위로** 고른다 — 늘 맨 앞이면 한 자리만 계속 때린다 */
  return {
    battle: {
      ...st, foes, slain: st.slain + 1, target: pickTarget(foes.length),
    },
    ev: { ...NOTHING, hit: dmg, killed: 1, gold },
  };
}

// ══ 스킬 ═════════════════════════════════════════════════════

/**
 * 스킬은 **공격 횟수**로 돈다 — 몇 번째인지는 기술마다 다르다
 * (`core/chars` 의 `SkillDef.every`).
 *
 * 초 단위 쿨타임을 따로 두면 평타 루프와 겹쳐 프레임을 서로 덮어썼고,
 * 무엇보다 "휘두르는 중에 갑자기 다른 동작으로 튄다" 로 보였다. 횟수로 세면
 * 겹칠 일이 없고, 공격이 빠른 사람이 스킬도 자주 쓴다 — 공격 속도가 값을
 * 하는 편이 읽기 쉽다.
 *
 * 옛 이름을 남겨 둔다. 지금은 **기본값**일 뿐이고, 실제로는 각 기술의
 * `every` 가 이긴다.
 */
export const SKILL_EVERY = 4;

/**
 * 스킬 한 방의 피해.
 *
 * 화면에 띄우는 숫자(`BattleView`)와 실제로 깎는 값이 **같은 식에서** 나와야
 * 한다. 둘을 따로 쓰면 언젠가 한쪽만 고쳐지고, 그때부터 화면이 거짓말을 한다.
 */
/**
 * 이번 한 대가 치명타인가 — 터졌으면 배수를, 아니면 1 을 돌려준다.
 *
 * **스킬에도 걸린다.** 공격력 10 · 스킬 140% · 치명타 200% 면
 * 10 × 1.4 × 2 = 28 이다. 평타와 스킬을 다르게 두면 "치명타가 터졌는데
 * 큰 기술에는 안 실린다" 가 되어, 제일 보고 싶은 순간이 빠진다.
 */
export function rollCrit(st: Stat, rand: () => number = Math.random): number {
  return rand() < st.crit ? st.critDmg : 1;
}

/**
 * 한 대가 실제로 깎는 양.
 *
 * ## 순서가 뜻을 정한다
 *
 *   (공격력 × 배수 × 치명타) − 막는 겹
 *
 * **막는 겹이 둘이다.** 물리 피해는 방어력이, 마법 피해는 마법저항력이
 * 막는다 (`core/chars` 의 `Armor`·`Blow`). 한 대는 둘 중 하나이므로 한
 * 번에 한 겹만 걸린다.
 *
 * 방어를 **맨 마지막에** 뺀다. 곱하기 전에 빼면 방어력이 배수만큼 부풀어서,
 * 2배짜리 기술 앞에서 방어 5 가 10 처럼 작동한다 — 큰 기술일수록 잘 막히는
 * 셈이라 거꾸로다. 나중에 빼야 "큰 공격은 그대로 아프다" 가 된다.
 *
 * ## 0 으로는 안 내려간다
 *
 * 아무리 깎여도 **최소 1** 이다. 0 을 허용하면 방어가 공격력보다 높은 순간
 * 그 상대는 영원히 못 이기고, 화면에서는 아무 일도 안 일어난 채로 판이
 * 끝나기만 기다리게 된다.
 */
export function strikeFor(
  base: number,
  critMul: number,
  armor: Armor,
  blow: Blow,
): number {
  /*
    **종류가 맞는 한 겹만 깎는다.**

    물리는 방어력에 걸리고 마법은 마법저항력에 걸린다. 둘을 더해서 빼면
    갈래를 나눈 뜻이 없어진다 — 어느 쪽으로 때리든 결국 같은 양이 막힌다.

    관통이 있으면 그 한 겹을 **통째로** 건너뛴다 (`core/chars` 의 `Pierce`).
    비율이 아니라 있고 없고인 이유도 거기 적어 두었다.
  */
  const shield = blow.type === 'magic'
    ? (blow.pierce.magic ? 0 : armor.res)
    : (blow.pierce.phys ? 0 : armor.def);
  return Math.max(1, Math.round(base * critMul) - Math.max(0, shield));
}

/**
 * 그 기술 한 대의 **밑값** — 치명타와 상대 방어력을 얹기 전.
 *
 *   공격력 × 보조배수 × 배수  +  방어력 × 방어배수
 *
 * 두 번째 항이 대부분 0 이다. 이졸데의 검기만 방어력을 함께 본다 (`defMul`).
 */
export function skillBase(
  st: Stat, sk: SkillDef, sup: number,
): number {
  return st.atk * sup * sk.mul + st.def * sk.defMul;
}

export function skillDamage(
  me: OwnedChar,
  party: Party,
  chars: Record<string, OwnedChar>,
  /** 기술이 여럿이면 몇 번째 것인가 (`core/chars` 의 `skillsOf` 순서) */
  slot = 0,
): number {
  const sk = skillsOf(me.id)[slot] ?? skillOf(me.id);
  const mine = statOf(me);
  /*
    치명타는 안 셈한다 — 화면에 미리 적는 값이라 늘 같아야 한다.

    맞는 쪽도 안 본다 (`NO_ARMOR`). 적마다 다른 값을 여기서 정할 수가
    없어서, "맨몸에 몇 들어가나" 를 적는다. 그래서 관통이 있어도 이 숫자는
    안 바뀐다 — 뚫을 것이 애초에 0 이다.
  */
  return strikeFor(
    skillBase(mine, sk, supportMul(party, chars)), 1, NO_ARMOR, blowOf(me.id, sk),
  );
}

/**
 * 스킬 — 네 번째 공격마다 평타 대신 나간다.
 *
 * ## 네 가지가 다 다르다
 *
 *   검기(wave)   앞에서 세 마리를 한 번에. 어디에 들어갈지 안다
 *   도약(leap)   있는 놈 전부를 한 방에. 한 마리만 남았을 때 제일 세다
 *   화살비(rain) 다섯 발이 한 발씩, 그때마다 무작위로
 *   기도(heal)   적을 안 때린다. 아군 전원을 회복시킨다
 *
 * 처음에는 전원이 검기 하나였다. 그러면 도끼든 활이든 향로든 결국 같은 것이
 * 앞으로 날아가고, 캐릭터를 모을 이유가 숫자 차이밖에 안 남는다.
 *
 * ## 왜 한 번에 다 계산하나
 *
 * 화살비는 다섯 발이지만 **한 번의 호출**로 끝난다. 발마다 스토어를 건드리면
 * 중간 상태(세 발까지 맞은 상태)가 저장될 수 있고, 그 상태로 앱이 꺼지면
 * 남은 두 발은 영영 안 떨어진다. 계산은 여기서 통째로 끝내고, 화면은 그
 * 결과를 다섯 번에 나눠 **보여 주기만** 한다.
 */
/**
 * 이 기술이 **누구를 때리나** — `foes` 안에서의 자리들.
 *
 * 계산(`applySkill`)과 화면(`BattleView`)이 **같은 함수**를 쓴다. 예전에는
 * 양쪽이 따로 골랐고, 무작위가 끼어 있는 기술에서는 불꽃이 튀는 놈과 체력이
 * 닳는 놈이 서로 달랐다.
 */
export function skillTargets(
  sk: SkillDef,
  foes: readonly FoeSlot[],
  target: number,
  rand: () => number = Math.random,
): number[] {
  if (!foes.length || sk.pick === 'none') return [];
  const all = foes.map((_f, i) => i);

  /* `targets` 가 0 이면 제한 없다. 아니면 **앞에서부터** 그만큼만 */
  const cap = (list: number[]) => (sk.targets > 0 ? list.slice(0, sk.targets) : list);

  if (sk.pick === 'all') return cap(all);

  if (sk.pick === 'kind') {
    /* 노리고 있던 놈이 선 자리의 무리 — 근접이면 근접, 원거리면 원거리 */
    const at = Math.min(Math.max(0, target), foes.length - 1);
    const k = foes[at].k;
    return cap(all.filter((i) => foes[i].k === k));
  }

  /*
    random — 겹치지 않게 뽑는다. 같은 놈을 두 번 맞히면 한 대만 든 셈이 된다.

    **뽑는 확률은 평타와 같다** (`pickAim`). 예전에는 여기만 고르게 뽑았다
    (`rand() * pool.length`). 그래서 앞에 선 놈이 절반을 맞는 규칙을 온 게임에
    깔아 놓고도, 화살비만 혼자 뒤엣놈을 앞엣놈만큼 노렸다 — 화면에서는 화살이
    싸우고 있는 자리를 비껴 엉뚱한 데로 떨어지는 것으로 보인다.

    남은 놈들 안에서 다시 고르므로, 한 대가 1번을 맞히면 다음 대에게는 2번이
    1번 자리가 된다. 앞쪽에 몰리되 셋이 한 놈에 겹치지는 않는다.
  */
  const pool = [...all];
  const out: number[] = [];
  const n = Math.min(sk.targets, pool.length);
  for (let i = 0; i < n; i++) {
    out.push(...pool.splice(pickAim(pool.length, rand), 1));
  }
  /* 앞에서부터 정렬한다 — 화면이 이 순서로 줄을 매긴다 */
  return out.sort((a, b) => a - b);
}

/**
 * 회복형 기술이 **사람마다 얼마나** 채우나.
 *
 * 계산과 화면이 같은 값을 써야 한다 — 화면은 이걸로 머리 위에 `+N` 을
 * 띄운다. 둘이 따로 세면 뜨는 숫자와 실제로 찬 양이 어긋난다.
 *
 * 쓰러진 사람은 0 이다. 회복이 전멸을 취소해 버리면 아무도 안 죽는다.
 */
export function healPlan(
  sk: SkillDef,
  party: Party,
  chars: Record<string, OwnedChar>,
  hp: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (sk.heal <= 0 && sk.healPct <= 0) return out;
  /*
    **회복하는 사람의 공격력**으로 정해진다. 받는 사람의 최대 체력이 아니다.

    예전에는 대상 최대 체력의 몇 할이었다. 그러면 사제를 아무리 키워도 회복량이
    그대로고, 대신 탱커를 키우면 사제가 저절로 좋아졌다 — 키울 사람과 좋아지는
    사람이 어긋났다. 지금은 사제도 다른 셋과 같은 축(공격력)에서 자란다.
  */
  /*
    **전부 시전자 기준이다.** 받는 사람의 체력은 안 본다.

    한동안 비율 몫을 받는 사람의 최대 체력에서 뽑았는데, 그러면 탱커를 키울수록
    사제가 저절로 좋아진다 — 키운 사람과 좋아지는 사람이 어긋난다. 시전자에게
    모아 두면 사제를 키워야 회복이 늘고, 넷 모두 같은 양을 받는다.
  */
  const src = chars[healerOf(party, chars, sk) ?? ''];
  if (!src) return out;
  const me = statOf(src);
  const amount = Math.round(me.hp * sk.healPct + me.atk * sk.heal);
  if (amount <= 0) return out;

  for (const c of members(party, chars)) {
    const mx = statOf(c).hp;
    const cur = hpOf(c, hp);
    /* 쓰러진 사람은 안 채운다 — 회복이 전멸을 되돌리면 아무도 안 죽는다 */
    out[c.id] = cur <= 0 ? 0 : Math.min(mx, cur + amount) - cur;
  }
  return out;
}

/** 이 기술을 쓰는 사람을 파티에서 찾는다 */
function healerOf(
  party: Party, chars: Record<string, OwnedChar>, sk: SkillDef,
): string | null {
  /*
    **가진 기술 전부를 본다.** `skillOf` 하나만 보면, 기술이 여럿인 사람의
    두 번째 기술이 회복형일 때 시전자를 못 찾아 회복이 통째로 사라진다.
  */
  for (const c of members(party, chars)) if (skillsOf(c.id).includes(sk)) return c.id;
  return null;
}

export function applySkill(
  st: BattleState,
  who: string,
  party: Party,
  chars: Record<string, OwnedChar>,
  rand: () => number = Math.random,
  /**
   * 이미 고른 자리들. 화면이 연출을 먼저 잡고 그걸 그대로 넘긴다.
   *
   * 안 주면 여기서 고른다 (시험과 서버 계산용).
   */
  at?: readonly number[],
  /**
   * 기술이 여럿이면 **몇 번째 것**인가 (`core/chars` 의 `skillsOf` 순서).
   *
   * 화면이 골라서 넘긴다. 여기서 다시 고르면 화면이 그린 기술과 실제로
   * 들어간 기술이 갈릴 수 있다 — 자리를 고르는 일과 같은 이유로 한쪽이
   * 정해서 넘긴다.
   */
  slot = 0,
): TickResult {
  const me = chars[who];
  if (!me || !party.includes(who as never) || st.down > 0) {
    return { battle: st, ev: NOTHING };
  }
  if (hpOf(me, st.hp) <= 0) return { battle: st, ev: NOTHING };

  const sk = skillsOf(me.id)[slot] ?? skillOf(me.id);

  /* ── 회복형 — 적은 안 건드린다 ── */
  if (sk.heal > 0) {
    const plan = healPlan(sk, party, chars, st.hp);
    const healed = Object.values(plan).reduce((a, v) => a + v, 0);
    /* 다 차 있으면 아무 일도 안 일어난다 — 헛것을 저장하지 않는다 */
    if (!healed) return { battle: st, ev: NOTHING };

    const hp: Record<string, number> = {};
    for (const c of members(party, chars)) {
      hp[c.id] = hpOf(c, st.hp) + (plan[c.id] ?? 0);
    }
    return { battle: { ...st, hp }, ev: { ...NOTHING, healed } };
  }

  if (!st.foes.length) return { battle: st, ev: NOTHING };

  const mine = statOf(me);
  const foes = [...st.foes];
  let hit = 0;
  let killed = 0;

  /* 화면이 이미 골랐으면 그대로 쓴다 — 연출과 계산이 어긋날 자리를 없앤다 */
  const idx = (at ?? skillTargets(sk, foes, targetOf(st), rand))
    .filter((i) => i >= 0 && i < foes.length);

  /*
    **한 놈마다 따로 굴린다** — 치명타도, 방어력도.

    화살비는 세 발이 각각 다른 놈에게 꽂히므로, 한 번만 굴려 셋에 똑같이
    먹이면 "세 발" 이 아니라 "한 발을 셋으로 나눈 것" 이 된다. 그리고 맞는
    놈마다 막는 것이 다르다 (돌 슬라임 방어 3, 나머지 0).
  */
  /* 이 기술 한 대가 들고 나가는 것 — 종류와 관통. 한 번만 만든다 */
  const blow = blowOf(me.id, sk);
  for (const i of idx) {
    const dmg = strikeFor(
      skillBase(mine, sk, supportMul(party, chars)), rollCrit(mine, rand),
      foeOf(st.stage, st.boss, foes[i].k), blow,
    );
    foes[i] = { ...foes[i], hp: foes[i].hp - dmg };
    hit += dmg;
  }

  /* 죽은 놈을 걷어낸다 — 뒤에서부터 지워야 인덱스가 안 밀린다 */
  for (let i = foes.length - 1; i >= 0; i--) {
    if (foes[i].hp <= 0) { foes.splice(i, 1); killed += 1; }
  }

  if (!killed) {
    return { battle: { ...st, foes }, ev: { ...NOTHING, hit } };
  }

  const gold = killGold(st.stage, st.boss) * killed;


  // 우두머리를 잡았다 — 다음 스테이지
  if (st.boss && !foes.length) {
    /*
      **바로 안 넘어간다.** `clearIn` 을 걸어 두면 틱이 그 시간을 흘려보낸
      뒤에 넘긴다 (`battleTick` 위쪽). 그 사이 화면은 `Clear` 를 띄우고
      어두워진다.

      보상과 `cleared` 는 지금 준다 — 잡은 건 잡은 것이고, 연출이 끝나기
      전에 앱을 닫아도 받은 것이 사라지면 안 된다.
    */
    return {
      battle: {
        ...st,
        foes,
        slain: st.slain + killed,
        target: 0,
        clearIn: CLEAR_MS,
        clearKind: 'boss',
        goTo: nextStage(st.stage),
      },
      ev: { ...NOTHING, hit, killed, cleared: true, gold },
    };
  }

  return {
    battle: {
      ...st, foes, slain: st.slain + killed, target: pickTarget(foes.length, rand),
    },
    ev: { ...NOTHING, hit, killed, gold },
  };
}
