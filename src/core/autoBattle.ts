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
  DEFAULT_FORMATION, FormationId, Party,
  aimWeight, allDown, allyAtk, frontIdsOf, fullHp, hpOf, livingMembers, members, partyStat,
  seatRows,
} from './party';
import {
  Armor, Blow, CHARS, DmgType, NO_ARMOR, NO_PIERCE, OwnedChar, PHYS_BLOW, Role,
  SkillDef, Stat, blowOf, rowMod, skillOf, skillsFor, statOf, swingMs,
} from './chars';
import { rollElixir } from './growth';
import {
  GOOD, Hex, NO_HEX, StatusId, hexOf, mulOf, putHex, tickHex, upOf,
} from './status';
import {
  FADE_MS, allyAtkMul, healMulOf, liveArmor, liveSpd, regenOf,
} from './passives';
import { CleanseOpt, cleanseOptOf, cleansed } from './skillOpt';

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
 * **30 이다.** 서른 판의 잡몹과 배경 그림이 다 들어왔다 — `sg_*`·`sb_*`
 * (슬라임), `pf_*`·`pw_*`·`pb_*`(식물·나무), `sw_*`(벌레), 그리고
 * `bg_chapter/01`~`06`.
 *
 * ⚠ **21~30 의 우두머리 그림은 아직 없다.** `b21_centipeda` 부터 열 벌이
 * 프롬프트만 있는 상태라 (`docs/boss-art/`), 그동안 화면은 대체 그림으로
 * 떨어진다 (`Sprite` 의 `fallbackSet`). 판은 정상으로 돌아가고 우두머리
 * 모습만 임시다 — 시트가 들어오면 코드를 안 고쳐도 바뀐다.
 *
 * 30 을 깨면 넘어갈 곳이 없으므로 `Math.min` 에 걸려 **30 을 다시 돈다** —
 * 그게 지금 있는 마지막 판이다. 우두머리를 잡으면 보상도 클리어 연출도
 * 그대로 나오고, 달라지는 건 다음에 어디로 가느냐뿐이다.
 *
 * 31판을 만들면 여기를 올리거나 `null` 로 바꾸면 된다. `stageOf` 가
 * `STAGES.length` 로 나눠 돌리므로 `null` 이면 1판부터 다시 돈다.
 */
export const STAGE_CAP: number | null = 30;

/**
 * 화면에 동시에 서 있을 수 있는 잡몹 수.
 *
 * 셋이었다가 넷으로 늘렸다. 원거리를 섞으면서(`RANGED_CAP`) 셋으로는 앞줄이
 * 한 마리만 남아, 붙어서 싸우는 그림이 사라졌다. 넷이면 앞뒤가 둘씩이다.
 *
 * 다섯을 넘기지 않는다 — 좁은 무대에서 서로 겹쳐 몇 마리인지 안 보인다.
 * 넷은 좁은 화면에서도 대형을 12px 씩 짜내면 들어간다 (`squeezeFor`).
 */
/* ─────────────────────── 적이 서는 칸 (3 × 3) ─────────────────────── */

/**
 * 적 진영의 **가로줄** 수 — 화면에서는 위아래로 늘어선다.
 *
 * 아군의 `FORM_LANES`(다섯)와 같은 뜻이고 같은 방향이다 (`core/party`).
 * 다섯이 아니라 셋인 것은 적이 무대 **오른쪽 절반**만 쓰기 때문이다 —
 * 다섯 줄을 다 쓰면 맨 뒷줄이 아군 뒷줄과 같은 높이에 서서, 누가 어느
 * 편인지가 높이로는 안 갈린다.
 */
export const FOE_LANES = 3;

/**
 * 적 진영의 **세로줄** 수 — 화면에서는 좌우로 늘어선다.
 *
 * 0 번이 아군과 마주 보는 앞줄이다. 아군의 앞뒤(둘)와 같은 축인데, 이쪽이
 * 셋인 이유는 던지는 놈이 뒤에 두 줄로 설 자리가 있어야 하기 때문이다.
 */
export const FOE_COLS = 3;

/**
 * 적이 설 수 있는 **칸 수** — 3×3 = 아홉.
 *
 * 셋이었다가 넷, 여섯을 거쳐 아홉이다. 이건 **자리의 수**이지 나오는
 * 마릿수가 아니다 — 실제로 몇 마리가 서느냐는 판이 정한다 (`mobCap`).
 *
 * 자리를 나오는 수보다 넉넉히 잡아 두는 이유는 `FoeSlot.pos` 때문이다.
 * 자리 번호는 판 내내 안 바뀌어야 하는데(안 그러면 한 마리 죽을 때마다 줄이
 * 통째로 미끄러진다), 그러려면 **제일 많이 나올 때를 기준으로** 칸을 미리
 * 잡아 둬야 한다.
 */
export const MOB_CAP = FOE_LANES * FOE_COLS;

/**
 * 그 중 원거리가 쓸 수 있는 칸 수 — 앞 세로줄을 뺀 나머지 전부.
 *
 * 앞 세로줄 하나(`FOE_LANES` 칸)는 붙어 싸우는 놈들이 쓴다. 앞이 비면 아군
 * 근접이 허공을 향해 걸어 나가므로, 이 경계는 마릿수와 상관없이 고정이다.
 */
export const RANGED_CAP = MOB_CAP - FOE_LANES;

/**
 * 세로줄 안에서 **어느 가로줄부터 채우나.**
 *
 * 가운데(1) → 아래(0) → 위(2). 번호 순으로 채우면 넷이 나오는 판에서 넷째가
 * 맨 아래 줄에 혼자 붙어 서서 무리가 한쪽으로 쏠린다. 가운데부터 채우면
 * 몇 마리가 나오든 무게중심이 늘 가운데 줄이다.
 *
 * `pos` → 칸은 이 표로 **못 박혀 있다.** 서 있는 마릿수를 보고 다시 짜면
 * 한 마리 죽을 때마다 남은 놈들이 자리를 옮긴다.
 */
const LANE_FILL: readonly number[] = [1, 0, 2];

/** 자리 번호 → 그 칸의 세로줄·가로줄 */
export const foeCell = (pos: number): { col: number; lane: number } => ({
  col: Math.floor(pos / FOE_LANES),
  lane: LANE_FILL[pos % FOE_LANES] ?? 1,
});

/**
 * 이 판에 **몇 마리까지** 서나 (칸 수와 다르다).
 *
 * 1~30 판은 4~6 이다. 난이도가 오를수록 한 마리씩 는다 — 적이 세지는 것과
 * 많아지는 것은 다른 종류의 압박이라, 수치만 올리면 30판이 1판과 같은
 * 그림에 숫자만 커진 판이 된다.
 *
 * 아홉 칸을 다 쓰지는 않는다. 뒷 세로줄은 비워 둔 채로 두는데, 판이 늘 때
 * 화면 코드가 아니라 이 함수만 고치면 되게 하려는 것이다.
 */
export const mobCap = (stage: number): number => (
  stage < 11 ? 4 : stage < 21 ? 5 : 6
);

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
   * 우두머리 자리에 서지만 **작게 그리는** 놈. 안 적으면 1 (그대로).
   *
   * 자리 계산은 안 건드린다 — 줄의 폭과 간격은 판이 정한 하나의 값에서
   * 나오므로 (`BOSS_W`), 마리마다 다르게 하면 배치가 통째로 흔들린다.
   * 그리는 크기만 줄인다.
   *
   * 셋이 쓴다. 반으로 갈라진 지네는 **반 마리**이므로 0.62, 허물을 벗은
   * 분신은 본체보다 옅은 것이라 0.82, 소환된 애벌레는 0.5 다.
   */
  scale?: number;
  /**
   * 이 놈이 쓸 **기본 자세 칸**. 안 적으면 `idle` 이다.
   *
   * 21판 지네가 갈라지면 머리와 꼬리가 같은 시트의 다른 칸을 쓴다
   * (`split_head`·`split_tail`). 23판 고치와 25판 우화도 마찬가지다 —
   * **같은 놈인데 모습만 달라지는** 것이라 시트를 따로 두지 않는다.
   */
  pose?: string;
  /**
   * 이 시트는 **이미 왼쪽을 보고** 그려져 있나.
   *
   * 규칙은 "스프라이트는 전부 오른쪽을 본다" 이고, 그래서 적은 통째로
   * 뒤집어 그린다 (`BattleView` 의 `scaleX: -1`). 그런데 28판 모기만
   * 반대로 들어왔다 — 뒤집으니 아군에게 등을 돌린 채 싸웠다.
   *
   * 시트를 다시 받는 것이 맞지만, 그림 하나 때문에 그럴 일은 아니다.
   * 여기 한 줄로 그 한 마리만 안 뒤집는다.
   */
  faceLeft?: boolean;
  /**
   * 이름 위에 작게 붙는 수식어. 우두머리만 쓴다.
   *
   * `탐식의 거대 슬라임, 젤라투스` 를 한 줄로 넣으면 등장 배너에서 넘친다.
   * 캐릭터가 이미 같은 모양을 쓰고 있어서(`core/chars` 의 `CharDef.title`)
   * 적도 같게 나눴다 — 수식어는 작게 위에, 고유명은 크게 아래.
   */
  title?: string;
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
  /**
   * 우두머리가 늘 달고 있는 성질. 다섯 판마다 하나씩 있다.
   *
   * 기술과 따로 둔 이유는 **도는 방식이 달라서**다. 기술은 몇 번째 공격이냐로
   * 나가고, 성질은 그런 순간이 없다 — 맞을 때마다, 매 틱, 늘 켜져 있다.
   */
  passive?: BossPassive;
}

/**
 * 우두머리 기술이 **걸고 가는 것** 하나.
 *
 * 계수로 적는다 (`tick` 은 공격력의 몇 배). 실제 숫자는 거는 순간 그
 * 우두머리의 공격력을 곱해서 만든다 (`hexFrom`) — 걸린 다음에는 건 놈이
 * 죽어도 그대로 남아야 하므로, `core/status` 의 `Hex` 는 계수가 아니라
 * 숫자를 들고 간다.
 */
export interface HexSpec {
  id: StatusId;
  /** 몇 초 동안 */
  sec: number;
  /** 0.5초마다 **우두머리 공격력의 몇 배**. 지속 피해가 아니면 안 적는다 */
  tick?: number;
  /** 그 지속 피해가 물리인가 마법인가. 안 적으면 기술과 같다 */
  dmg?: DmgType;
  /** 배수형이면 몇 배. 0.5 면 절반으로 깎는다 */
  mul?: number;
  /** 걸릴 확률 (0~1). 안 적으면 반드시 걸린다 */
  odds?: number;
  /** 몇 겹까지 쌓이나. 안 적으면 안 쌓인다 */
  stack?: number;
}

/**
 * 우두머리의 특수 공격 한 가지.
 *
 * **파티 스킬과 같은 규칙이다** (`core/chars` 의 `SkillDef`) — 몇 번째
 * 공격마다(`every`) 나오고, 공격력의 몇 배(`mul`)로, 누구를(`aim`) 치는가.
 * 규칙을 맞춰 둔 이유는 화면이 두 가지를 따로 셀 필요가 없어서다.
 *
 * 사양과 계산해 둔 숫자는 `docs/BOSS_SKILLS.md` 에 있다.
 */
export interface BossPattern {
  /** 그림·연출을 고를 때 쓰는 이름표 */
  id: string;
  /** 화면에 뜨는 이름 — 우두머리 머리 위 말풍선이 이걸 외친다 */
  name: string;
  /**
   * 몇 번째 공격마다 나오나. 4 면 **평타 셋을 친 다음** 네 번째가 이것이다.
   *
   * 둘 이상이 같은 차례에 걸리면 **드문 쪽이 이긴다** (`every` 가 큰 쪽).
   * 자주 나오는 것이 이기면 드문 것은 영영 안 나온다 — 6 과 3 이면 6의
   * 배수는 전부 3의 배수이기도 하다.
   */
  every: number;
  /** 공격력의 몇 배. **0 이면 즉시 피해가 없다** (거는 것만 하는 기술) */
  mul: number;
  /**
   * 누구를 치나.
   *
   *   all    살아 있는 전원
   *   one    자리 확률대로 한 명 (`AIM`)
   *   two    무작위 두 명 — 겹치지 않게
   *   front  맨 앞 한 명 (`core/party` 의 `defenseOrder`)
   *   low    체력이 **비율로** 제일 낮은 한 명
   *   high   **공격력이 제일 높은** 한 명 (25판 포식의 거미줄)
   *   tough  **방어가 제일 두꺼운** 한 명 (28판 치명적 흡혈 침)
   *
   * `high`·`tough` 는 앞의 다섯과 성격이 다르다. 저것들은 자리나 남은 양을
   * 보는데 이 둘은 **파티를 어떻게 짰는지**를 본다 — 제일 세게 때리는 사람을
   * 묶고, 제일 잘 버티는 사람을 뚫는다. 파티 구성을 노리는 기술이라, 늘
   * 같은 사람이 걸리는 것이 오히려 뜻이다.
   *
   * `low` 를 남은 양이 아니라 비율로 재는 이유: 남은 양으로 재면 원래 체력이
   * 적은 사람(리안느 150)이 가득 차 있어도 늘 걸린다. 그러면 "마무리를
   * 노린다" 가 아니라 "제일 약한 사람만 팬다" 가 된다.
   */
  aim: 'all' | 'one' | 'two' | 'front' | 'low' | 'high' | 'tough';
  /** 이 기술이 물리인가 마법인가. 그 우두머리의 평타와 **따로다** */
  dmg: DmgType;
  /** 맞는 사람의 방어 한 겹을 통째로 건너뛰나 (`core/chars` 의 `Pierce`) */
  pierce?: boolean;
  /** 맞은 사람에게 거는 것들 — 전부 건다 (각자 제 확률로) */
  hex?: readonly HexSpec[];
  /**
   * **둘 중 하나만** 건다. 17판 공허한 울림 하나뿐이다.
   *
   * "40% 확률로 기절 또는 약화" 를 `hex` 로는 못 적는다 — 거기 둘을 넣으면
   * 각각 40% 라 둘 다 걸리는 판이 생긴다.
   */
  oneOf?: { odds: number; of: readonly HexSpec[] };
  /** 입힌 피해의 몇 할을 우두머리가 제 체력으로 가져가나 */
  drain?: number;
  /** 맞은 사람의 스킬 게이지를 몇 할 깎나 */
  gauge?: number;
  /**
   * 이 기술이 **기믹을 부르나** (`BOSS_GIMMICK`).
   *
   * 기믹은 대개 체력 문턱에서 저절로 터지는데(`at`), 셋은 기술이 부른다 —
   * 22판이 막을 두르고, 24판이 아군 하나를 돌려세우고, 27판이 빼앗는다.
   *
   * 문턱으로 못 두는 이유는 저 셋이 **몇 번이고 다시 나오는 것**이기
   * 때문이다. 문턱은 한 번뿐이라 (`FoeGim.done`) 거기 두면 판마다 한 번씩만
   * 막을 두른다.
   */
  casts?: 'shield' | 'charm' | 'devour';
  /** `casts: 'charm'` 이 몇 초짜리인가 */
  charmSec?: number;
}

/**
 * 우두머리가 늘 달고 있는 것 — **기술이 아니라 성질.**
 *
 * 다섯 판마다 하나씩 있다 (5 · 10 · 15 · 20). 판이 다섯씩 넘어갈 때
 * "이번 우두머리는 뭔가 다르다" 를 기술 말고 다른 축으로 말하는 자리다.
 */
export interface BossPassive {
  /** 화면에 뜨는 이름 */
  name: string;
  /** 설명에 적는 한 줄 */
  text: string;
  /** 받는 피해 배수 — 0.8 이면 20% 덜 아프다 */
  tough?: number;
  /** 맞으면 때린 사람에게 되돌리는 비율 (물리) */
  reflect?: number;
  /** **평타**에 맞은 사람에게 거는 것 */
  onHit?: HexSpec;
  /**
   * 늘 깔려 있는 오라 — 그 역할의 아군에게 **매 틱 다시 건다.**
   *
   * 다시 거는 이유: 한 번만 걸고 시간이 지나 풀리게 두면 우두머리가 살아
   * 있는데도 오라가 깜빡인다. 매 틱 새로 고치면 우두머리가 죽는 순간
   * 자연히 걷힌다.
   */
  aura?: { role: Role; of: readonly HexSpec[] };
  /** 스스로 회복 — `sec` 초마다 최대 체력의 `pct` */
  regen?: { sec: number; pct: number };
  /** 체력이 `under` 아래면 방어력이 `defMul` 배 */
  last?: { under: number; defMul: number };
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
  { id: 'sweep', name: '휩쓸기', every: 5, mul: 0.9, aim: 'all', dmg: 'phys' },
];

/*
  ── 스무 우두머리의 기술 ──

  사양은 `tools/gen-boss.py` 에 문장으로, 계산해 둔 숫자는
  `docs/BOSS_SKILLS.md` 에 표로 있다. 여기는 **그 표를 코드로 옮긴 것**이고,
  세 벌이 어긋나지 않는지는 `tools/gen-boss-skills.py` 가 검사한다.

  ## 왜 `STAGES` 안이 아니라 여기 따로 있나

  판 하나가 이미 열 줄이 넘는다 (배경 · 지역 · 잡몹 셋 · 우두머리 수치).
  거기에 기술까지 넣으면 한 판이 서른 줄이 되어, 스무 판을 나란히 놓고
  "수치가 고르게 오르나" 를 볼 수 없게 된다. 수치는 수치끼리, 기술은
  기술끼리 모여 있어야 각각을 훑을 수 있다.

  붙이는 일은 `foeOf` 가 한다.
*/
export const BOSS_SKILLS: Record<number, readonly BossPattern[]> = {
  1: [{ id: 'squash', name: '뭉개기', every: 4, mul: 0.90, aim: 'all', dmg: 'phys' }],
  2: [{ id: 'coil', name: '식인 덩굴 휘감기', every: 4, mul: 2.00, aim: 'one', dmg: 'phys' }],
  3: [{
    id: 'spray', name: '맹독 오물 분사', every: 6, mul: 0, aim: 'all', dmg: 'magic',
    hex: [{ id: 'st_poison', sec: 3, tick: 0.10, dmg: 'magic' }],
  }],
  4: [{
    id: 'haze', name: '환각 포자 폭발', every: 6, mul: 0, aim: 'all', dmg: 'magic',
    hex: [{ id: 'st_slow', sec: 5, mul: 0.50 }],
  }],
  5: [{
    id: 'barb', name: '칼날 가시 난사', every: 6, mul: 1.00, aim: 'all', dmg: 'phys',
    hex: [{ id: 'st_bleed', sec: 3, tick: 0.05, dmg: 'phys' }],
  }],
  6: [{
    id: 'rock', name: '암석 낙하', every: 6, mul: 1.30, aim: 'all', dmg: 'phys',
    hex: [{ id: 'st_stun', sec: 3, odds: 0.30 }],
  }],
  7: [{
    id: 'cleave', name: '양단 직격', every: 5, mul: 2.00, aim: 'one', dmg: 'phys',
    hex: [{ id: 'st_bleed', sec: 3, tick: 0.05, dmg: 'phys' }],
  }],
  8: [{
    id: 'melt', name: '강산성 융해 액', every: 6, mul: 0, aim: 'all', dmg: 'magic',
    hex: [{ id: 'st_poison', sec: 5, tick: 0.12, dmg: 'magic' }],
  }],
  9: [{
    id: 'bone', name: '백골 가시 찌르기', every: 3, mul: 2.00, aim: 'one', dmg: 'phys',
    pierce: true,
  }],
  10: [
    {
      id: 'tide', name: '오염된 심연의 해일', every: 3, mul: 1.50, aim: 'all', dmg: 'phys',
      hex: [{ id: 'st_poison', sec: 3, tick: 0.15, dmg: 'magic' }],
    },
    {
      id: 'gulp', name: '포식의 점액', every: 7, mul: 2.00, aim: 'low', dmg: 'magic',
      drain: 0.50,
    },
  ],
  11: [{
    id: 'spike', name: '유해의 가시 찌르기', every: 4, mul: 1.10, aim: 'all', dmg: 'phys',
    pierce: true,
    hex: [{ id: 'st_bleed', sec: 3, tick: 0.05, dmg: 'phys' }],
  }],
  12: [{
    id: 'digest', name: '포식자의 소화액', every: 5, mul: 0, aim: 'one', dmg: 'magic',
    hex: [
      { id: 'st_poison', sec: 3, tick: 0.15, dmg: 'magic' },
      { id: 'st_slow', sec: 5, mul: 0.50 },
    ],
  }],
  13: [{
    id: 'bind', name: '속박의 덩굴 휘감기', every: 5, mul: 1.40, aim: 'two', dmg: 'phys',
    hex: [{ id: 'st_stun', sec: 2 }],
  }],
  14: [{
    id: 'burst', name: '독성 포자 분출', every: 6, mul: 0, aim: 'all', dmg: 'magic',
    hex: [
      { id: 'st_poison', sec: 4, tick: 0.08, dmg: 'magic' },
      { id: 'st_wither', sec: 5, mul: 0.50 },
    ],
  }],
  15: [{
    id: 'stench', name: '부패의 악취', every: 6, mul: 0, aim: 'all', dmg: 'magic',
    hex: [
      { id: 'st_poison', sec: 4, tick: 0.10, dmg: 'magic' },
      { id: 'st_silence', sec: 5 },
    ],
  }],
  16: [{
    id: 'axe', name: '녹슨 도끼의 일격', every: 5, mul: 2.20, aim: 'front', dmg: 'phys',
    hex: [{ id: 'st_break', sec: 5, mul: 0.60 }],
  }],
  17: [{
    id: 'hollow', name: '공허한 울림', every: 6, mul: 1.00, aim: 'all', dmg: 'magic',
    oneOf: {
      odds: 0.40,
      of: [
        { id: 'st_stun', sec: 2 },
        { id: 'st_weak', sec: 5, mul: 0.75 },
      ],
    },
  }],
  18: [{
    id: 'lash', name: '가시 가지 후려치기', every: 5, mul: 1.40, aim: 'all', dmg: 'phys',
    pierce: true,
  }],
  19: [{
    id: 'root', name: '부패한 뿌리 솟구침', every: 6, mul: 1.50, aim: 'all', dmg: 'phys',
  }],
  20: [
    {
      /*
        하늘에서 내리치는 것이라 **맞으면 감전된다** — 30% 확률로 3초.

        기절(`st_stun`)이 아니라 감전(`st_shock`)으로 따로 둔다. 하는 일은
        똑같지만(`core/status` 의 `STUN`) 로고와 몸에 흐르는 전기가 다르고,
        그 둘이 "이건 벼락에 맞은 것" 을 말한다.
      */
      id: 'bolt', name: '태고의 성난 벼락', every: 6, mul: 1.50, aim: 'all', dmg: 'phys',
      gauge: 0.50,
      hex: [{ id: 'st_shock', sec: 3, odds: 0.30 }],
    },
    {
      id: 'blade', name: '자비없는 칼날', every: 5, mul: 2.50, aim: 'low', dmg: 'magic',
    },
  ],
  /*
    ── 21~30 · 우화하는 군체들 ──

    사양은 사용자가 준 문장이고, 여기는 **지금 엔진이 표현할 수 있는 만큼**을
    옮긴 것이다. 못 옮긴 것은 아래 `BOSS_GIMMICK` 에 이름만 적어 두었다 —
    반으로 갈라지거나, 고치를 쓰거나, 죽으면서 넷으로 흩어지는 것들이다.
    저것들은 기술이 아니라 **판의 흐름**이라 새 얼개가 있어야 한다.
  */
  21: [{
    /* 사양: 아군 1명에게 150% 마법 관통 피해 + 5초 중독(0.5초 틱당 8%) */
    id: 'venom', name: '맹독 침', every: 5, mul: 1.50, aim: 'one', dmg: 'magic',
    pierce: true,
    hex: [{ id: 'st_poison', sec: 5, tick: 0.08, dmg: 'magic' }],
  }],
  22: [{
    /*
      사양은 **보호막을 두르고 5초를 캐스팅**하다가, 못 깨면 전원에게 최대
      체력의 50% 와 3초 기절을 주는 기술이다.

      보호막도 캐스팅도 엔진에 없다 (`BOSS_GIMMICK` 의 `shield`). 그때까지는
      "못 깼을 때 벌어지는 일" 만 남긴다 — **깰 기회가 없으므로 반드시
      터진다.** 그래서 배수를 사양(최대 체력의 50%)이 아니라 공격력 기준으로
      낮춰 잡았다. 안 그러면 열 번마다 파티가 반씩 녹는다.
    */
    id: 'veil', name: '여왕의 황금 장막', every: 10, mul: 0, aim: 'all', dmg: 'magic',
    casts: 'shield',
  }],
  23: [{
    /* 사양: 맨 앞 아군에게 250% 물리 + 3초 기절 */
    id: 'gore', name: '짓밟는 무쇠 뿔', every: 5, mul: 2.50, aim: 'front', dmg: 'phys',
    hex: [{ id: 'st_stun', sec: 3 }],
  }],
  24: [{
    /*
      사양은 **혼란** — 4초간 스킬을 못 쓰고 평타로 아군을 친다.

      "아군을 친다" 는 엔진에 없다 (`BOSS_GIMMICK` 의 `charm`). 스킬을 못
      쓰는 쪽만 지금 있는 것으로 옮긴다 (`st_silence`). 반쪽이지만 방향은
      맞다 — 이 기술의 값은 "그 사람이 4초 동안 제 몫을 못 한다" 다.
    */
    id: 'daze', name: '정신 착란', every: 10, mul: 0, aim: 'one', dmg: 'magic',
    casts: 'charm',
    charmSec: 4,
    /* 돌아선 동안은 스킬이 안 나간다 — 로고로도 그렇게 보이게 같이 건다 */
    hex: [{ id: 'st_silence', sec: 4 }],
  }],
  25: [{
    /*
      사양: **공격력이 제일 높은 아군**을 5초 고치로 묶고 매초 10% 를 흡수.

      묶는 것은 기절로(`st_stun`), 흡수는 지속 피해와 `drain` 으로 옮겼다.
      `drain` 은 **그 자리에서 들어간 피해**의 몫만 가져가므로 (`core/autoBattle`
      의 흡혈) 5초에 걸친 흡수가 한 번에 몰린다 — 총량은 비슷하고 박자만
      다르다.
    */
    id: 'cocoon', name: '포식의 거미줄', every: 6, mul: 1.20, aim: 'high', dmg: 'phys',
    drain: 1.00,
    hex: [
      { id: 'st_stun', sec: 5 },
      { id: 'st_poison', sec: 5, tick: 0.10, dmg: 'magic' },
    ],
  }],
  26: [
    {
      /*
        사양: 5초 화상 + **받는 피해 30% 증가**.

        "받는 피해 증가" 는 엔진에 없다. 제일 가까운 것이 방어를 깎는
        것이라(`st_break`) 그쪽으로 옮겼다 — 방어가 뺄셈이라 결과가 똑같지는
        않지만, 둘 다 "그동안 더 아프다" 하나를 말한다.
      */
      id: 'ignite', name: '인화성 분무', every: 5, mul: 0, aim: 'all', dmg: 'magic',
      hex: [
        { id: 'st_break', sec: 5, mul: 0.70 },
        { id: 'st_poison', sec: 5, tick: 0.06, dmg: 'magic' },
      ],
    },
    {
      /* 사양: 전체에 70% 물리. 평타 두 대마다라 **이 장에서 제일 잦다** */
      id: 'jab', name: '날카로운 찌르기', every: 2, mul: 0.70, aim: 'all', dmg: 'phys',
    },
  ],
  27: [{
    /*
      사양은 셋 중 하나를 흡수한다 — 체력 · 스킬 코스트 · 버프.

      셋을 고르는 것도, 버프를 옮겨 오는 것도 엔진에 없다 (`BOSS_GIMMICK` 의
      `devour`). 지금은 **체력을 흡수하는 갈래**만 남겼다 — 셋 중 제일 자주
      나올 것이고, 화면에서도 제일 잘 읽힌다 (우두머리 체력이 오른다).

      코스트를 깎는 것은 `gauge` 로 절반쯤 흉내 낸다. 사양은 "빼앗아 제
      공격속도를 올린다" 인데, 빼앗기는 쪽만 지금 있다.
    */
    id: 'devour', name: '포식', every: 8, mul: 2.00, aim: 'one', dmg: 'phys',
    drain: 1.00, gauge: 0.50, casts: 'devour',
  }],
  28: [{
    /*
      사양: **방어가 제일 두꺼운 아군**에게 관통 200%, 입힌 피해의 300% 회복,
      대상은 5초간 치유량 50% 감소.

      셋 다 그대로 들어간다 — 이 장에서 사양을 통째로 옮길 수 있는 유일한
      기술이다.
    */
    id: 'siphon', name: '치명적 흡혈 침', every: 5, mul: 2.00, aim: 'tough', dmg: 'phys',
    pierce: true,
    drain: 3.00,
    hex: [{ id: 'st_wither', sec: 5, mul: 0.50 }],
  }],
  29: [{
    /*
      사양: 4초 지속 마법 피해 + **평타를 쳐도 코스트가 안 오른다.**

      뒤엣것이 엔진에 없다 (`BOSS_GIMMICK` 의 `numb`). 코스트를 못 모으는 것과
      스킬을 못 쓰는 것은 결과가 거의 같으므로 `st_silence` 로 옮겼다 —
      완전히 같지는 않다. 봉인은 이미 찬 칸을 못 쓰게 하고, 사양은 칸이
      아예 안 차게 한다.
    */
    id: 'numb', name: '신경 마비 포자', every: 6, mul: 0, aim: 'all', dmg: 'magic',
    hex: [
      { id: 'st_poison', sec: 4, tick: 0.09, dmg: 'magic' },
      { id: 'st_silence', sec: 4 },
    ],
  }],
  30: [
    {
      /*
        사양: 체력 50% 에서 허물을 벗어 **분신 하나**를 만든다.

        분신은 엔진에 없다 (`BOSS_GIMMICK` 의 `clone`). 그때까지는 **허물을
        벗는 그 순간**만 기술로 남긴다 — 전원을 한 번 크게 치고 코스트를
        깎는다. 분신이 들어오면 이 칸은 그쪽으로 옮겨 간다.
      */
      id: 'shed', name: '군체의 대염쇄', every: 9, mul: 2.40, aim: 'all', dmg: 'phys',
      pierce: true,
      gauge: 0.50,
    },
    {
      /* 사양: 전체에 180% 마법 + 30% 확률 3초 기절. 그대로 들어간다 */
      id: 'collapse', name: '군주 붕괴파', every: 6, mul: 1.80, aim: 'all', dmg: 'magic',
      hex: [{ id: 'st_stun', sec: 3, odds: 0.30 }],
    },
  ],
};

/**
 * ── 21~30 우두머리의 **특수 기믹** ──
 *
 * 기술(`BOSS_SKILLS`)로는 못 적는 것들이다. `BossPattern` 이 할 수 있는 일은
 * 하나뿐이기 때문이다 — **한 번 때리고, 뭔가를 걸고, 얼마쯤 가져간다.**
 *
 * 여기 것들은 그 틀 밖에 있다. 한 마리가 둘이 되고, 죽으면서 넷이 나오고,
 * 체력 절반에서 다른 몸이 되고, 깨야만 넘어가는 막을 두른다.
 *
 * ## 언제 터지나
 *
 * 전부 **문턱 하나**로 정해진다 (`at`) — 체력이 그 비율 아래로 내려가는 순간
 * 한 번. `at: 0` 은 특별하다: 죽는 순간이다.
 *
 * 시간으로 안 재는 이유는, 시간으로 재면 세게 키운 파티가 기믹을 건너뛰기
 * 때문이다. 30초 만에 잡으면 30초짜리 기믹은 안 본다. 체력으로 재면 **누구든
 * 반드시 한 번 겪는다** — 그게 이 열 마리를 앞 스물과 가르는 것이다.
 *
 * ## 한 번만 터진다
 *
 * 터진 기믹은 그 마리의 `gim.done` 에 이름이 남는다. 체력은 문턱 아래에서
 * 계속 오르내리므로 (회복하는 우두머리가 여럿이다) 그것이 없으면 틱마다
 * 다시 갈라진다.
 */
export type BossGimmick = ForkGim | CocoonGim | ImagoGim | ShieldGim | DevourGim;

/** 모든 기믹이 같이 갖는 것 */
interface GimBase {
  /** 화면에 뜨는 이름 */
  name: string;
  /** 무슨 일이 일어나나 — 사양 그대로 */
  text: string;
  /**
   * 체력이 이 비율 **아래로 내려가면** 터진다. `0` 이면 죽는 순간이다.
   *
   * 기술이 거는 것(22판 황금 장막)은 문턱이 없으므로 `null` 이다 — 그건
   * `BOSS_SKILLS` 쪽에서 부른다.
   */
  at: number | null;
}

/**
 * ── 갈라진다 ── 한 마리가 여러 마리가 된다.
 *
 * 셋이 이걸 쓴다. 셋이 서로 꽤 다른데도 한 얼개인 이유는, **결과가 같기
 * 때문**이다 — 줄에 새 놈이 서고, 그놈은 제 능력치를 들고 있다 (`FoeSlot.own`).
 *
 *   21 절단 분열   본체가 사라지고 머리와 꼬리가 남은 체력을 반씩
 *   26 최후의 발악 죽으면서 애벌레 넷 (`at: 0`)
 *   30 군체의 대염쇄 본체는 그대로 있고 분신이 하나 더 (`keep`)
 */
export interface ForkGim extends GimBase {
  kind: 'fork';
  /** 본체가 남나. 안 남으면 그 자리에 조각들만 선다 */
  keep: boolean;
  parts: readonly ForkPart[];
}

/** 갈라져 나온 한 조각 */
export interface ForkPart {
  /** 화면에 뜨는 이름 */
  name: string;
  /**
   * 체력을 얼마나 갖나.
   *
   * `left` 는 **본체에 남아 있던 만큼**의 비율이고 (21판 — 반씩 나눠 갖는다),
   * `max` 는 **본체의 최대 체력**의 비율이다 (26·30판 — 본체가 얼마나 닳았든
   * 같은 크기로 나온다).
   */
  pct: number;
  of: 'left' | 'max';
  /** 쓸 그림 칸. 안 적으면 본체의 `idle` */
  pose?: string;
  /** 다른 시트를 쓰나 (26판 애벌레는 `sw_bomb` 이다) */
  art?: string;
  /** 그리는 크기 배수 (1 이면 우두머리 크기 그대로) */
  scale?: number;
  /** 공격속도 배수 */
  spd?: number;
  /** 평타만 쓰나 — 특수기를 통째로 뗀다 */
  dumb?: boolean;
  /** 자폭까지 (ms). 있으면 그때 스스로 죽으면서 아군 전원을 친다 */
  fuse?: number;
  /** 자폭이 각자 최대 체력의 몇 할을 깎나 (물리 — 방어가 막는다) */
  blast?: number;
}

/**
 * ── 고치 ── 굳어서 안 움직이고, 정해진 횟수를 맞아야 깨진다.
 *
 * 23판 하나뿐이다. **시간이 아니라 타격 수**가 조건인 유일한 기믹이라,
 * 파티가 셋뿐이면 그만큼 오래 걸린다 — 그게 이 기믹의 내용이다.
 */
export interface CocoonGim extends GimBase {
  kind: 'cocoon';
  /** 깨는 데 필요한 타격 수 */
  hits: number;
  /** 1초에 채우는 최대 체력의 비율 */
  regen: number;
  /**
   * 안전장치 (ms) — 이만큼 지나면 못 깨도 풀린다.
   *
   * 사양에 없는 값이다. 없으면 **판이 멈출 수 있다** — 혼자 남은 파티가
   * 초당 두 대씩 치는데 우두머리는 초당 2% 를 채우면, 서른 대를 채우기 전에
   * 체력이 문턱 위로 올라가 영영 안 끝난다.
   */
  cap: number;
  /** 이 동안 쓸 그림 칸 */
  pose: string;
}

/**
 * ── 우화 ── 기를 모았다 터뜨리고, 그 뒤로 다른 몸이 된다.
 *
 * 25판 하나뿐이다. `cocoon` 과 달리 **되돌아오지 않는다** — 한 번 우화하면
 * 판이 끝날 때까지 그 모습이고, 공격력도 영구히 오른다.
 */
export interface ImagoGim extends GimBase {
  kind: 'imago';
  /** 기를 모으는 시간 (ms). 이 동안은 안 때린다 */
  charge: number;
  /** 터질 때 아군 전원이 맞는 공격력 배수 */
  burst: number;
  /** 우화하면서 채우는 최대 체력의 비율 */
  heal: number;
  /** 그 뒤로 공격력에 곱해지는 값 */
  atkUp: number;
  /** 우화 뒤의 그림 칸 */
  pose: string;
  /** 우화하면 꺼지는 상시 효과 — 3초마다 아군 코스트를 한 칸씩 깎던 것 */
  drainCost?: number;
}

/**
 * ── 보호막 ── 정해진 시간 안에 못 깨면 벌칙이 터진다.
 *
 * 둘이 쓴다. 22판은 **기술로** 두르고 (문턱이 없다), 29판은 체력 절반에서
 * 두른다. 벌칙이 다르다 — 하나는 때리고 하나는 아군을 돌려세운다.
 */
export interface ShieldGim extends GimBase {
  kind: 'shield';
  /** 막의 크기 — 제 최대 체력의 비율 */
  pct: number;
  /** 버티는 시간 (ms) */
  ms: number;
  /**
   * 막을 두르는 동안 쓸 **그림 칸.**
   *
   * 22판 벌과 29판 동충하초 둘 다 시트에 `skill1` 이 있다 — 기를 모으는
   * 자세다. 그걸 안 쓰면 막을 둘렀는데 평소처럼 서 있어서, 화면에서
   * 벌어지는 일이 붉은 막대 한 줄뿐이 된다.
   */
  pose?: string;
  /** 못 깼을 때 */
  fail: FailBlast | FailCharm;
}

/** 못 깨면 전원이 맞는다 */
export interface FailBlast {
  kind: 'blast';
  /** 각자 **최대 체력**의 몇 할 (물리 — 방어가 막는다) */
  pct: number;
  /** 같이 거는 기절 (초) */
  stun?: number;
}

/** 못 깨면 아군끼리 싸운다 */
export interface FailCharm {
  kind: 'charm';
  /** 몇 초 동안 */
  sec: number;
}

/**
 * ── 빼앗는다 ── 아군에게 걸린 좋은 것을 떼어 제가 두른다.
 *
 * 27판 하나뿐이다. 문턱이 없다 — 기술(`devour`)이 나갈 때마다 같이 돈다.
 */
export interface DevourGim extends GimBase {
  kind: 'devour';
  /** 빼앗은 것이 우두머리에게 붙어 있는 시간 (ms) */
  ms: number;
}

/**
 * 판마다의 기믹. 없는 판은 아무 일도 안 한다.
 *
 * 30판 부식성 아우라는 여기 없다 — 저건 **평타에 붙는 것**이라 이미 있는
 * 얼개로 적을 수 있었다 (`BossPassive.onHit`, 10판 오염된 점성과 같은 자리).
 * 새 얼개가 필요한 것만 여기 온다.
 */
export const BOSS_GIMMICK: Record<number, readonly BossGimmick[]> = {
  21: [{
    kind: 'fork',
    name: '절단 분열',
    text: '체력 30% 이하가 되는 즉시 그 자리에서 몸통이 반으로 갈라져 머리와 꼬리 '
      + '두 마리가 된다. 남은 체력을 반씩 나눠 갖고, 꼬리는 평타만 쓰되 공격속도가 '
      + '두 배다. 둘 다 우두머리라 둘 다 잡아야 판이 끝난다.',
    /*
      50% 였다. 반이나 남은 채로 갈라지면 **판의 절반이 두 마리 구간**이 되어,
      본체와 싸운 기억보다 조각과 싸운 기억이 길어진다. 30% 면 마무리에
      한 번 뒤집히는 것이 된다.
    */
    at: 0.30,
    keep: false,
    parts: [
      {
        name: '센티페다의 머리', pct: 0.5, of: 'left', pose: 'split_head', scale: 0.62,
      },
      {
        name: '센티페다의 꼬리',
        pct: 0.5,
        of: 'left',
        pose: 'split_tail',
        /* 반 마리씩이다 — 둘 다 본체 크기로 그리면 화면에 안 들어간다 */
        scale: 0.62,
        spd: 2,
        dumb: true,
      },
    ],
  }],
  22: [{
    kind: 'shield',
    name: '여왕의 황금 장막',
    text: '보호막을 두르고 5초를 버틴다. 그 안에 못 깨면 아군 전체가 제 최대 '
      + '체력의 50% 를 잃고 3초간 기절한다.',
    /* 문턱이 없다 — 기술이 부른다 (`BOSS_SKILLS[22]` 의 `veil`) */
    at: null,
    pct: 0.18,
    ms: 5000,
    pose: 'skill1',
    fail: { kind: 'blast', pct: 0.50, stun: 3 },
  }],
  23: [{
    kind: 'cocoon',
    name: '경화 갑각',
    text: '체력 50% 이하에서 고치가 된다. 서른 대를 쳐야 깨지고, 그동안 1초에 '
      + '체력의 2% 를 채운다.',
    at: 0.50,
    hits: 30,
    regen: 0.02,
    cap: 12000,
    pose: 'cocoon',
  }],
  25: [{
    kind: 'imago',
    name: '약육강식',
    text: '체력 50% 이하에서 3초간 기를 모으고 터뜨려 전원에게 공격력만큼 피해를 '
      + '준 뒤 성체로 우화한다. 체력 20% 를 회복하고 공격력이 영구히 30% 오른다. '
      + '우화하면 군체의 지배자가 꺼진다.',
    at: 0.50,
    charge: 3000,
    burst: 1.00,
    heal: 0.20,
    atkUp: 1.30,
    pose: 'imago',
    /* 우화 전까지 3초마다 아군 코스트를 한 칸씩 깎는다 — 군체의 지배자 */
    drainCost: 3000,
  }],
  26: [{
    kind: 'fork',
    name: '최후의 발악',
    text: '죽는 순간 폭탄 애벌레 넷으로 흩어진다. 10초 안에 못 잡으면 자폭해 '
      + '아군 전체가 각자 최대 체력의 25% 를 잃는다. 애벌레의 체력은 피로스의 5% 다.',
    /* 죽는 순간이다 */
    at: 0,
    keep: false,
    parts: [0, 1, 2, 3].map(() => ({
      name: '폭탄 애벌레',
      pct: 0.05,
      of: 'max' as const,
      art: 'sw_bomb',
      scale: 0.5,
      dumb: true,
      /*
        5초였다. 넷이 한꺼번에 나오는데 5초면 **잡을 시간이 아니라 구경할
        시간**밖에 안 된다 — 어차피 다 터지므로 잡으라는 기믹이 아니게 된다.
        10초면 넷 중 둘셋은 잡히고, 남은 것이 터진다.
      */
      fuse: 10000,
      blast: 0.25,
    })),
  }],
  27: [{
    kind: 'devour',
    name: '포식',
    text: '아군 하나에게서 좋은 것을 하나 빼앗아 3초간 제가 두른다.',
    at: null,
    ms: 3000,
  }],
  29: [{
    kind: 'shield',
    name: '포자 감염',
    text: '체력 50% 이하에서 보호막을 두른다. 5초 안에 못 깨면 아군 전체가 5초간 '
      + '광란에 빠져 서로를 친다.',
    at: 0.50,
    pct: 0.15,
    ms: 5000,
    pose: 'skill1',
    fail: { kind: 'charm', sec: 5 },
  }],
  30: [{
    kind: 'fork',
    name: '군체의 대염쇄',
    text: '체력 50% 이하에서 허물을 벗어 제 능력치를 그대로 가진 분신 하나를 '
      + '만든다. 분신의 체력은 25% 이고 군주 붕괴파를 같이 쓴다.',
    at: 0.50,
    /* 본체는 그대로 남는다 — 21판과 다른 점이 이것뿐이다 */
    keep: true,
    parts: [{ name: '환영 분신', pct: 0.25, of: 'max', scale: 0.82 }],
  }],
};

/**
 * ── 기믹 한 틱 ──
 *
 * `battleTick` 안에서 적이 팔을 휘두르기 **전에** 한 번 돈다. 순서가 중요하다 —
 * 갈라지는 것도 고치가 되는 것도 이번 틱의 공격에 곧바로 반영돼야, 화면에서
 * "갈라졌는데 본체가 한 대 더 쳤다" 같은 일이 안 생긴다.
 *
 * ## 왜 상태 덩어리를 받아 고치나
 *
 * 이 함수가 건드리는 것이 열 가지다 — 적 목록 · 아군 체력 · 걸린 것 · 코스트 ·
 * 번호 · 혼란 · 받은 피해 · 쓰러진 사람... 전부 돌려주려면 반환값이 열 칸짜리
 * 객체가 되고, 부르는 쪽에서 그걸 다시 열 줄로 풀어야 한다.
 *
 * `battleTick` 은 이미 저 값들을 `let` 으로 들고 있다. 덩어리로 넘겨 제자리에서
 * 고치는 편이 **풀었다 담는 스무 줄**보다 읽기 쉽다. 이 파일에서 여기 하나만
 * 그렇게 한다.
 */
interface GimCtx {
  stage: number;
  /** 서 있는 적들 — 여기서 갈라지고 늘고 준다 */
  foes: FoeSlot[];
  /** 다음 마리에게 줄 고유 번호 */
  seq: number;
  hp: Record<string, number>;
  hex: Record<string, Hex[]>;
  /** 코스트를 깎으라는 신호 (`BattleState.cut`) */
  cut: Record<string, number>;
  /** 살아 있든 아니든 파티 전원 */
  line: readonly OwnedChar[];
  /** 우두머리가 선 뒤로 흐른 시간 — 3초마다 도는 것이 이걸 본다 */
  bossMs: number;
  /** 아군끼리 싸우는 중인가 */
  charm: Charm | null;
  /** 우두머리가 스스로 채운 양 — 화면이 초록 숫자로 띄운다 */
  foeHeal: { seq: number; amt: number };
  taken: number;
  hurtId: string | null;
  fell: string | null;
  /**
   * **무언가 크게 터진 횟수** (`BattleState.burst`).
   *
   * 막이 못 깨져 터질 때와 우화가 터질 때 하나씩 오른다. 화면은 숫자가
   * 오르는 것만 보고 무대에 파동을 한 번 그린다 — 무엇이 터졌는지는 안
   * 나눈다. 둘 다 "지금 큰 게 왔다" 하나만 말하면 되고, 나누기 시작하면
   * 판마다 다른 연출을 들고 다녀야 한다.
   */
  burst: number;
  /** 이번 틱에 **갈라진** 횟수 — 허물을 벗거나 몸이 쪼개진 것 (`fork`) */
  rip: number;
  rand: () => number;
}

/**
 * 아군 **전원**을 각자 최대 체력의 비율만큼 친다.
 *
 * 22판 장막이 못 깨졌을 때와 26판 애벌레가 터질 때 쓴다.
 *
 * ## 최대 체력 비례인데도 방어가 막는다
 *
 * 사양이 "최대 체력의 50% **물리** 피해" 다. 비율로 양을 정하고, 그 뒤는
 * 평소와 똑같이 방어를 뺀다 (`strikeFor`).
 *
 * 방어를 안 빼면 이 게임에서 **방어가 안 통하는 유일한 자리**가 생기고,
 * 그러면 저 기술 앞에서는 이졸데(방어 33)와 리안느(방어 5)가 똑같아진다 —
 * 파티를 어떻게 짜든 결과가 같은 공격은 파티를 짜는 재미를 지운다.
 */
function blastAll(cx: GimCtx, pct: number, stunSec = 0): void {
  for (const c of cx.line) {
    if ((cx.hp[c.id] ?? 0) <= 0) continue;
    const armor = liveArmor(c, cx.hex[c.id] ?? []);
    const dmg = strikeFor(Math.round(statOf(c).hp * pct), 1, armor, PHYS_BLOW);
    cx.hp[c.id] = Math.max(0, cx.hp[c.id] - dmg);
    cx.taken += dmg;
    cx.hurtId = c.id;
    if (cx.hp[c.id] <= 0) cx.fell = c.id;
    if (stunSec > 0) {
      cx.hex[c.id] = putHex(cx.hex[c.id] ?? [], {
        id: 'st_stun', ms: Math.round(stunSec * 1000), dot: 0, dmg: 'phys', mul: 1, n: 1,
      }, 1);
    }
  }
}

/**
 * 갈라져 나온 조각들을 줄에 세운다.
 *
 * 자리(`pos`)는 앞에서부터 빈 곳을 채운다. 우두머리 판에는 잡몹이 없으므로
 * 네 자리가 통째로 비어 있고 (`MOB_CAP`), 그래서 넷까지는 반드시 들어간다.
 */
function forkInto(cx: GimCtx, src: FoeSlot, kind: Foe, gim: ForkGim): FoeSlot[] {
  const out: FoeSlot[] = [];
  /* 이미 쓰인 자리 — 본체가 사라지면 그 자리는 비는 것으로 친다 */
  const used = new Set(cx.foes.map((f) => f.pos));
  if (!gim.keep) used.delete(src.pos);
  const free = () => {
    for (let i = 0; i < MOB_CAP; i += 1) if (!used.has(i)) { used.add(i); return i; }
    return MOB_CAP - 1;
  };

  for (const part of gim.parts) {
    const base = part.of === 'left' ? Math.max(1, src.hp) : kind.hp;
    const hp = Math.max(1, Math.round(base * part.pct));
    /*
      조각은 **제 능력치를 들고 간다** (`FoeSlot.own`).

      본체 것을 그대로 베끼되 체력과 공격속도만 갈고, 평타만 쓰는 조각은
      기술 목록을 **빈 배열**로 둔다 — `undefined` 로 두면 기본값(휩쓸기)을
      물려받아서 "평타만" 이 안 된다 (`foeOf` 의 `?? BOSS_PATTERNS`).
    */
    const own: Foe = {
      ...kind,
      hp,
      name: part.name,
      spd: kind.spd * (part.spd ?? 1),
      art: part.art ?? kind.art,
      pose: part.pose ?? kind.pose,
      scale: part.scale,
      patterns: part.dumb ? [] : kind.patterns,
      /* 성질은 본체만 갖는다 — 분신까지 반사하고 회복하면 두 배가 된다 */
      passive: undefined,
      title: undefined,
    };
    out.push({
      hp,
      cd: swingMs(own.spd),
      n: 0,
      k: src.k,
      id: cx.seq,
      pos: free(),
      own,
      gim: part.fuse
        ? { fuse: part.fuse, blast: part.blast ?? 0, done: [], born: true }
        : { done: [], born: true },
    });
    cx.seq += 1;
  }
  return out;
}

/**
 * 한 대 맞은 뒤의 그 마리.
 *
 * 두 가지를 여기서 한다 — **막이 있으면 거기부터 깎이고**, 고치를 쓰고
 * 있으면 타격 수를 하나 센다.
 *
 * 부르는 곳이 둘이라 (평타 `applyHit` · 기술 `applySkill`) 함수로 뺐다.
 * 저 둘에 같은 규칙을 두 번 적으면 언젠가 한쪽만 고친다 — 이 파일에서
 * 이미 두 번 겪은 종류의 버그다.
 */
export function biteFoe(f: FoeSlot, dmg: number): FoeSlot {
  const g = f.gim;
  if (!g) return { ...f, hp: f.hp - dmg };

  let gim: FoeGim = g;
  /* 고치는 **맞은 횟수**로 깨진다 — 얼마나 아팠는지는 안 본다 */
  if (g.formHit !== undefined && g.formHit > 0) {
    gim = { ...gim, formHit: g.formHit - 1 };
  }
  /*
    막이 먼저 먹는다. 넘치는 만큼만 체력으로 간다 — 한 대에 막이 깨지면
    그 대의 나머지는 그대로 몸에 들어가야 한다. 안 그러면 막이 얇을수록
    이득이 되는 거꾸로 된 일이 생긴다.
  */
  if ((g.shield ?? 0) > 0) {
    const eat = Math.min(g.shield ?? 0, dmg);
    return { ...f, hp: f.hp - (dmg - eat), gim: { ...gim, shield: (g.shield ?? 0) - eat } };
  }
  return { ...f, hp: f.hp - dmg, gim };
}

/** 이 마리의 남은 체력 비율 */
const leftPct = (f: FoeSlot, kind: Foe): number => (
  kind.hp > 0 ? Math.max(0, f.hp) / kind.hp : 1
);

/**
 * 죽는 순간에 터지는 기믹 — 26판 최후의 발악 하나뿐이다.
 *
 * 다른 기믹과 달리 **틱이 아니라 죽인 자리**에서 부른다 (`applyHit` ·
 * `applySkill`). 우두머리가 죽으면 그 자리에서 판이 끝나 버리므로
 * (`clearIn`), 틱을 기다리면 애벌레가 설 자리가 이미 없다.
 *
 * @returns 죽은 자리에 대신 설 놈들. 없으면 빈 배열
 */
export function onFoeDown(
  st: { stage: number; boss: boolean }, dead: FoeSlot, rest: readonly FoeSlot[], seq: number,
): { born: FoeSlot[]; seq: number } {
  if (!st.boss) return { born: [], seq };
  const gm = gimmicksOf(st.stage)
    .find((x): x is ForkGim => x.kind === 'fork' && x.at === 0);
  if (!gm) return { born: [], seq };
  /* 갈라져 나온 조각이 또 갈라지면 끝이 없다 — 제 것을 든 놈은 건너뛴다 */
  if (dead.own) return { born: [], seq };

  const cx = {
    foes: [...rest], seq,
  } as GimCtx;
  const born = forkInto(cx, dead, foeAt(st, dead), gm);
  /* 죽으면서 갈라지는 것도 갈라지는 것이다 (21 · 26판) */
  cx.rip += 1;
  return { born, seq: cx.seq };
}

function runGim(cx: GimCtx): void {
  const gims = gimmicksOf(cx.stage);
  /* 판에 기믹이 없고 붙어 있는 것도 없으면 아무 일도 안 한다 */
  if (!gims.length && !cx.foes.some((f) => f.gim)) return;

  const at = { stage: cx.stage, boss: true };
  const next: FoeSlot[] = [];

  for (const f0 of cx.foes) {
    let f = f0;
    const kind = foeAt(at, f);
    const g = f.gim ?? {};
    const done = new Set(g.done ?? []);
    let gim: FoeGim = { ...g, done: [...done] };
    let dead = false;
    let born: FoeSlot[] = [];

    /* ── 자폭 시계 ── 26판 애벌레 하나뿐이다 */
    if (gim.fuse !== undefined) {
      const left = gim.fuse - TICK_MS;
      if (left <= 0) {
        blastAll(cx, gim.blast ?? 0);
        dead = true;
        /*
          **터진 것도 터진 것이다.** 막이 못 깨져 터질 때와 우화가 터질 때만
          이 숫자를 올리고 있었다 (`GimCtx.burst`). 그래서 애벌레 넷이 동시에
          자폭하는 26판 마지막이 화면에서는 **그냥 사라지는 것**으로 보였다 —
          숫자만 줄고 아무 소리도 안 났다.
        */
        cx.burst += 1;
      } else {
        gim = { ...gim, fuse: left };
      }
    }

    /* ── 보호막 시계 ── 다 되도록 못 깼으면 벌칙이 터진다 */
    if (!dead && gim.shieldMs !== undefined) {
      const left = gim.shieldMs - TICK_MS;
      if ((gim.shield ?? 0) <= 0) {
        /* 깼다 — 아무 일도 안 일어난다. 그게 상이다 */
        gim = {
          ...gim, shield: undefined, shieldMs: undefined, still: undefined, form: undefined,
        };
      } else if (left <= 0) {
        const sg = gims.find((x): x is ShieldGim => x.kind === 'shield');
        if (sg?.fail.kind === 'blast') blastAll(cx, sg.fail.pct, sg.fail.stun ?? 0);
        if (sg?.fail.kind === 'charm') {
          cx.charm = {
            ms: Math.round(sg.fail.sec * 1000),
            who: cx.line.filter((c) => (cx.hp[c.id] ?? 0) > 0).map((c) => c.id),
          };
        }
        gim = {
          ...gim, shield: undefined, shieldMs: undefined, still: undefined, form: undefined,
        };
        /* 터졌다 — 화면이 이 번호를 보고 파동을 한 번 그린다 */
        cx.burst += 1;
      } else {
        gim = { ...gim, shieldMs: left };
      }
    }

    /* ── 고치 ── 서른 대를 맞아야 깨진다. 그동안 스스로 채운다 */
    if (!dead && gim.form && gim.formHit !== undefined) {
      const cg = gims.find((x): x is CocoonGim => x.kind === 'cocoon');
      const capLeft = (gim.formMs ?? 0) - TICK_MS;
      if (gim.formHit <= 0 || capLeft <= 0) {
        gim = {
          ...gim, form: undefined, formHit: undefined, formMs: undefined, still: undefined,
        };
      } else {
        gim = { ...gim, formMs: capLeft };
        if (cg) {
          const room = kind.hp - f.hp;
          const got = Math.min(room, Math.round(kind.hp * cg.regen * (TICK_MS / 1000)));
          if (got > 0) {
            f = { ...f, hp: f.hp + got };
            cx.foeHeal = { seq: cx.foeHeal.seq + 1, amt: got };
          }
        }
      }
    }

    /* ── 우화 ── 기를 모으고, 다 모으면 터뜨리며 몸이 바뀐다 */
    if (!dead && gim.charge !== undefined) {
      const left = gim.charge - TICK_MS;
      if (left <= 0) {
        const ig = gims.find((x): x is ImagoGim => x.kind === 'imago');
        if (ig) {
          for (const c of cx.line) {
            if ((cx.hp[c.id] ?? 0) <= 0) continue;
            const dmg = strikeFor(
              Math.round(kind.atk * ig.burst), 1,
              liveArmor(c, cx.hex[c.id] ?? []), PHYS_BLOW,
            );
            cx.hp[c.id] = Math.max(0, cx.hp[c.id] - dmg);
            cx.taken += dmg;
            cx.hurtId = c.id;
            if (cx.hp[c.id] <= 0) cx.fell = c.id;
          }
          const got = Math.min(kind.hp - f.hp, Math.round(kind.hp * ig.heal));
          if (got > 0) {
            f = { ...f, hp: f.hp + got };
            cx.foeHeal = { seq: cx.foeHeal.seq + 1, amt: got };
          }
          gim = {
            ...gim, charge: undefined, still: undefined, form: ig.pose, atkMul: ig.atkUp,
          };
          /* 우화도 터지는 것이다 — 막이 터질 때와 같은 파동을 쓴다 */
          cx.burst += 1;
        }
      } else {
        gim = { ...gim, charge: left };
      }
    }

    /*
      ── 상시: 3초마다 아군 코스트 한 칸 ── 25판 군체의 지배자.

      우화하면 꺼진다 (`atkMul` 이 서면 우화한 것이다). 사양이 그렇고,
      화면에서도 "저 놈이 달라졌다" 가 한 가지 더 생겨서 좋다.
    */
    const ig0 = gims.find((x): x is ImagoGim => x.kind === 'imago');
    if (!dead && ig0?.drainCost && !gim.atkMul) {
      const per = Math.max(TICK_MS, ig0.drainCost);
      if (Math.floor(cx.bossMs / per) > Math.floor((cx.bossMs - TICK_MS) / per)) {
        for (const c of cx.line) {
          if ((cx.hp[c.id] ?? 0) > 0) cx.cut[c.id] = (cx.cut[c.id] ?? 0) + 1;
        }
      }
    }

    /*
      ── 문턱 ── 체력이 선 아래로 내려가는 순간 **한 번.**

      갈라져 나온 조각(`own`)은 제 문턱을 안 본다. 머리가 또 갈라지고
      분신이 또 분신을 만들면 끝이 없다.
    */
    if (!dead && !f.own) {
      const pct = leftPct(f, kind);
      for (const gm of gims) {
        if (gm.at === null || gm.at <= 0) continue;
        if (done.has(gm.name) || pct > gm.at) continue;
        done.add(gm.name);
        gim = { ...gim, done: [...done] };

        if (gm.kind === 'fork') {
          born = forkInto(cx, f, kind, gm);
          /* 갈라지는 그 순간 몸에서 파동이 한 번 터진다 (`BattleState.rip`) */
          cx.rip += 1;
          if (!gm.keep) dead = true;
        } else if (gm.kind === 'cocoon') {
          gim = { ...gim, form: gm.pose, formHit: gm.hits, formMs: gm.cap, still: true };
        } else if (gm.kind === 'imago') {
          gim = { ...gim, charge: gm.charge, still: true };
        } else if (gm.kind === 'shield') {
          gim = {
            ...gim,
            shield: Math.max(1, Math.round(kind.hp * gm.pct)),
            shieldMs: gm.ms,
            /* 기를 모으는 자세로 선다 — 화면이 이 칸을 그대로 쓴다 */
            form: gm.pose,
            still: true,
          };
        }
      }
    }

    if (!dead) next.push({ ...f, gim });
    next.push(...born);
  }

  cx.foes.length = 0;
  cx.foes.push(...next);
}

/**
 * 우두머리 줄이 **몇 자리를 잡아야 하나** (1 ~ `MOB_CAP`).
 *
 * 여태 우두머리는 늘 한 마리라 화면이 한 자리만 잡았다. 이제 갈라지고
 * 분신이 생기고 애벌레가 나오므로 미리 자리를 비워 둬야 한다.
 *
 * ## 왜 서 있는 마릿수로 안 재나
 *
 * 그러면 하나 죽을 때마다 줄 폭이 줄어서 **남은 놈들이 통째로 앞으로
 * 당겨진다** — 아무도 안 움직였는데 줄이 미끄러진다. 잡몹 줄에서 이미 겪고
 * `pos` 를 도입한 것과 같은 문제다.
 *
 * 판이 **최대 몇 마리까지 될 수 있나**로 잡으면 처음부터 끝까지 같은 값이다.
 */
/*
  ⚠ 화면은 이제 이걸 안 쓴다.

  자리를 미리 비워 두면 **서 있지도 않은 놈 몫까지 줄이 넓어져서** 우두머리가
  아군 쪽으로 끌려오고 인물이 겹쳤다 (`BattleView` 의 `cap`). 지금은 서 있는
  만큼만 잡는다.

  남겨 두는 이유는 검사가 이걸로 "조각이 네 자리에 들어가나" 를 보기 때문이다
  (`scratchpad/bossfx-test.js`). 다섯으로 갈라지는 우두머리를 적으면 한 마리가
  화면 밖에 서는데, 그건 굴려 보기 전에는 안 보인다.
*/
export function bossRoom(stage: number): number {
  let most = 1;
  for (const g of gimmicksOf(stage)) {
    if (g.kind !== 'fork') continue;
    most = Math.max(most, g.parts.length + (g.keep ? 1 : 0));
  }
  return Math.min(MOB_CAP, most);
}

/** 그 판의 기믹들. 없으면 빈 목록 */
export const gimmicksOf = (stage: number): readonly BossGimmick[] =>
  BOSS_GIMMICK[stage] ?? NO_GIM;

const NO_GIM: readonly BossGimmick[] = [];

/**
 * 다섯 판마다 하나씩 있는 우두머리 성질.
 *
 * 넷이 서로 **다른 축**을 건드린다 — 반사 · 평타에 붙는 것 · 늘 깔린 오라 ·
 * 제 몸 지키기. 같은 축을 둘이 쓰면 뒤엣것이 "더 센 앞엣것" 이 되어 판이
 * 넘어간 느낌이 안 난다.
 */
export const BOSS_PASSIVES: Record<number, BossPassive> = {
  5: {
    name: '가시 갑옷',
    text: '피격 시 공격자에게 받은 피해의 10%만큼 물리 반사',
    reflect: 0.10,
  },
  10: {
    name: '오염된 점성',
    text: '평타에 맞은 아군의 공격속도를 3초간 10% 감소 (최대 3중첩)',
    onHit: { id: 'st_slow', sec: 3, mul: 0.90, stack: 3 },
  },
  15: {
    name: '부패의 오라',
    text: '방어 역할 아군의 방어력을 0으로 만들고 1초마다 공격력의 5%만큼 지속 마법 피해',
    /*
      배수 0 이라 방어가 **통째로** 0 이 된다 (`core/passives` 의 `liveArmor`).

      지속 피해는 사양이 "1초마다 5%" 인데 이 게임의 틱은 0.5초다. 틱당
      2.5% 로 나눠 적는다 — 1초에 한 번만 때리려고 시계를 따로 두면 지속
      피해 시계가 둘이 되고, 둘이면 언젠가 한쪽만 고친다.
    */
    aura: {
      role: 'guard',
      of: [
        { id: 'st_break', sec: 1, mul: 0 },
        { id: 'st_poison', sec: 1, tick: 0.025, dmg: 'magic' },
      ],
    },
  },
  /*
    ── 30판 부식성 아우라 ──

    사양은 "평타에 맞으면 방어력과 마법저항력이 10%씩 누적 감쇄, 판이 끝날
    때까지, 최대 10중첩, 정화로 풀림" 이다.

    **새 얼개가 하나도 안 필요했다.** 10판 오염된 점성이 이미 "평타에 붙는
    것" 이고 (`onHit`), 파쇄(`st_break`)는 방어와 마저를 같이 깎으며
    (`core/passives` 의 `liveArmor`), 겹은 `mulOf` 가 `1 - (1-mul)×n` 으로
    센다 — 0.9 로 열 겹이면 정확히 0 이다.

    "판이 끝날 때까지" 는 999초로 적었다. 걸린 것은 판이 바뀔 때 통째로
    비워지므로 (`enterStage`) 그것으로 충분하고, 새 종류를 만들면 로고와
    이름과 검사가 딸려 온다.
  */
  30: {
    name: '부식성 아우라',
    text: '평타에 맞은 아군의 방어력과 마법저항력을 10% 감소 (최대 10중첩 · 판이 끝날 때까지)',
    onHit: {
      id: 'st_break', sec: 999, mul: 0.90, stack: 10,
    },
  },
  20: {
    name: '세계수의 껍질',
    text: '받는 피해 20% 감소 · 15초마다 최대 체력의 5% 회복 · 체력 30% 이하에서 방어력 50% 증가',
    tough: 0.80,
    regen: { sec: 15, pct: 0.05 },
    /*
      사양은 "체력 30% 이하에서 **10초간** 방어력 50% 증가" 다. 여기서는
      **30% 아래인 동안 계속**으로 뒀다.

      한 번 걸리면 10초 뒤에 풀리는데 그때도 체력은 여전히 30% 아래라
      곧바로 다시 걸린다. 실제로 벌어지는 일은 "체력이 낮으면 단단하다"
      하나뿐이고, 10초 시계는 그 사이 한 틱 깜빡이는 것 말고는 아무 일도
      안 한다. 시계를 하나 덜 두는 쪽을 골랐다.
    */
    last: { under: 0.30, defMul: 1.50 },
  },
};

/**
 * `n` 번째 공격에 나오는 패턴. 없으면 `null` (평타).
 *
 * `n` 은 1부터 센다. 0 번째는 없다 — `n % every === 0` 이 0 에서 참이 되어
 * 첫 공격부터 특수기가 나가면 우두머리가 나오자마자 전원이 맞는다.
 */
/**
 * ── 광폭화 ──
 *
 * 우두머리가 나온 지 2분이 지나면 붉게 변하면서 **공격력과 공격속도가 두
 * 배**가 되고, 초당 최대 체력의 1% 를 채운다.
 *
 * ## 왜 필요한가
 *
 * 우두머리전에는 제한 시간이 없다. 그래서 "이길 수 없지만 지지도 않는" 판이
 * 생긴다 — 이졸데가 초당 1% 를 채우고 우두머리도 안 죽으면 십 분이고 이십
 * 분이고 그대로다. 화면에서는 아무 일도 안 일어나는데 끝나지도 않는다.
 *
 * 2분이 그 판을 **끝낸다.** 넘겼으면 이긴 것이고, 못 넘겼으면 강화가 모자란
 * 것이다. 둘 중 하나로 갈리는 편이 무한히 버티는 것보다 낫다.
 *
 * ## 왜 하필 셋 다인가
 *
 * 공격력만 두 배면 그냥 아파질 뿐이라 방어를 올린 파티는 여전히 버틴다.
 * 회복만 있으면 딜이 모자란 파티만 막힌다. 셋이 같이 걸려야 **어느 쪽으로도
 * 못 버틴다** — 그게 제한 시간이 하는 일이다.
 */
export const RAGE_MS = 120_000;

/** 공격력·공격속도가 몇 배가 되나 */
export const RAGE_MUL = 2;

/** 1초에 최대 체력의 몇 할을 채우나 */
export const RAGE_REGEN = 0.01;

/**
 * 광폭화 중 **한 대마다 더 얹히는 고정 피해** — 맞는 사람 최대 체력의 5%.
 *
 * ## 왜 배수로는 부족했나
 *
 * 공격력 두 배(`RAGE_MUL`)가 화면에서 거의 안 느껴진다는 말을 들었다. 까닭이
 * 있다 — 피해는 `공격력 − 방어력` 이라 (`strikeFor`), 방어를 올린 파티에서는
 * 공격력이 두 배가 돼도 뺄셈 뒤에 남는 것이 두 배가 안 된다. 방어가 두꺼울수록
 * 광폭화가 약해지는, 거꾸로 된 일이었다.
 *
 * 고정 피해는 그 뺄셈을 **안 지난다.** 그리고 최대 체력에 비례하므로 체력을
 * 키운 파티도 같은 속도로 녹는다 — 광폭화는 "이 판을 끝내는 것" 이라
 * (`RAGE_MS`) 어느 쪽으로도 못 버티는 게 맞다.
 *
 * 5% 면 스무 대에 한 명이 쓰러진다. 광폭화 뒤에도 한참 남는 판에서 그 스무
 * 대가 곧 남은 시간이 된다.
 */
export const RAGE_BITE = 0.05;

/**
 * 지금 광폭화 중인가.
 *
 * 우두머리가 서 있는 동안의 시간만 센다 (`BattleState.bossMs`) — 잡몹
 * 구간에서 흘린 시간은 안 들어간다. 사냥을 오래 했다고 우두머리가 화나
 * 있으면 이상하다.
 */
export const raging = (st: { boss: boolean; bossMs: number }): boolean =>
  st.boss && Number.isFinite(st.bossMs) && st.bossMs >= RAGE_MS;

/** 광폭화까지 남은 시간 (ms). 이미 넘었으면 0 */
export const rageIn = (st: { boss: boolean; bossMs: number }): number => (
  st.boss ? Math.max(0, RAGE_MS - (Number.isFinite(st.bossMs) ? st.bossMs : 0)) : RAGE_MS
);

/**
 * ⚠ **테스트용** — 광폭화를 그 자리에서 켜다.
 *
 * 광폭화를 눈으로 보려면 **두 분을 버텀 다음**이어야 한다 (`RAGE_MS`).
 * 그런데 그걸 고치려면 두 분을 또 기다려야 하므로, 고치고 확인하는 한
 * 바퀴가 한 번에 사 분이 된다.
 *
 * 시계를 직접 `RAGE_MS` 로 밀어 놓는다 — `raging` 을 따로 속이는 게
 * 아니라 진짜로 그 시각이 된 것이라, 그다음은 평소와 똑같이 흥러간다.
 *
 * ⚠ **출시 전에 지운다.** `FREE_BOSS` · `FLAT_FOES` 와 같은 스위치다 —
 * 이 함수와 부르는 곳(`BattleView` 의 TEST 단추)을 같이 지운다.
 */
export const forceRage = (st: BattleState): BattleState => (
  st.boss && !raging(st) ? { ...st, bossMs: RAGE_MS } : st
);

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

/**
 * 침식지와 둥지의 벌레들 — 21~30 스테이지.
 *
 * 앞 스무 마리와 **갈래가 다르다.** 1~10 은 슬라임(뼈가 없는 덩어리),
 * 11~20 은 식물과 나무(자라서 그 모양이 된 것)였다. 여기는 **곤충**이다 —
 * 마디로 이어진 단단한 판, 옆으로 열리는 입, 잘못된 방향으로 꺾이는 다리.
 *
 * 40px 흑백에서 남는 것이 윤곽뿐인 것은 여기서도 같은데, 앞 두 장과 달리
 * 그 윤곽이 **반복되는 마디**다. 덩어리도 아니고 가지도 아니라서 한 줄에
 * 섞여 서도 어느 장의 놈인지가 먼저 읽힌다.
 *
 * ## 두 지역이 높이로 갈린다
 *
 *   침식지 21~25  바닥을 기고 구르고 튄다 — 낮다
 *   둥지   26~30  서 있고 날아다닌다     — 높고 길다
 *
 * 슬라임 → 식물에서 "덩어리 → 뻗은 것" 으로 갈랐던 것과 같은 수법이다.
 * 종을 하나하나 알아보기 전에 **줄의 높이**가 먼저 눈에 들어온다.
 *
 * ## 마법으로 때리는 놈이 둘이다
 *
 * 뱉는 노린재(22판~)와 활공하는 잠자리(27판~). 앞 장들과 같은 자리다 —
 * 원거리 중 일부만 마법이라, 그 판부터 마법저항력이 값을 갖는다.
 */
const SWARM = {
  /* ── 침식지 21~25 · 붙어서 싸운다 ── */
  grub: { art: 'sw_grub', name: '갉는 유충', bg: '', melee: true, dmg: 'phys' },
  hopper: { art: 'sw_hopper', name: '뛰는 여치', bg: '', melee: true, dmg: 'phys' },
  roller: { art: 'sw_roller', name: '구르는 쇠똥구리', bg: '', melee: true, dmg: 'phys' },
  /* ── 침식지 · 떨어져서 던진다 ── */
  /* 산을 뱉는다 — 이 장에서 **마법**은 이놈이 먼저다 */
  spitter: { art: 'sw_spitter', name: '뱉는 노린재', bg: '', melee: false, dmg: 'magic' },
  weaver: { art: 'sw_weaver', name: '실 잣는 새끼', bg: '', melee: false, dmg: 'phys' },

  /* ── 둥지 26~30 · 붙어서 싸운다 ── */
  soldier: { art: 'sw_soldier', name: '병정개미', bg: '', melee: true, dmg: 'phys' },
  mantis: { art: 'sw_mantis', name: '기다리는 사마귀', bg: '', melee: true, dmg: 'phys' },
  drone: { art: 'sw_drone', name: '못 깬 일벌', bg: '', melee: true, dmg: 'phys' },
  husk: { art: 'sw_husk', name: '걷는 허물', bg: '', melee: true, dmg: 'phys' },
  /* ── 둥지 · 떨어져서 던진다 ── */
  lancer: { art: 'sw_lancer', name: '쏘는 각다귀', bg: '', melee: false, dmg: 'phys' },
  glider: { art: 'sw_glider', name: '활공하는 잠자리', bg: '', melee: false, dmg: 'magic' },
  /*
    ── 폭탄 애벌레는 여기 없다 ──

    그림은 들어와 있는데 (`assets/sprites/sw_bomb/`) 어느 판의 목록에도 안
    넣었다. 사양이 **"26판 우두머리가 죽으면 넷이 나와서 5초 뒤에 스스로
    터진다"** 인데 (`docs/foe-art3/sw_bomb.md`), 이 게임의 틱에는 그런 것이
    없다 — 잡몹은 판이 정한 종에서 뽑혀 나오고, 시간이 지나면 스스로 죽는
    적도 없다.

    평범한 잡몹으로 끼워 넣을 수는 있다. 그런데 그러면 이름만 폭탄이고
    아무것도 안 터지므로, 화면이 또 거짓말을 한다. 엔진이 그 둘(우두머리가
    죽을 때 소환 · 시간이 지나면 자폭)을 갖게 되는 날 여기에 붙인다.
  */
} as const;

const s = (
  k: keyof typeof SWARM, atk: number, hp: number, spd: number, def = 0, res = 0,
): FoeKind => ({ ...SWARM[k], atk, hp, spd, def, res });

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
      art: 'b01_gelatus', name: '젤라투스', title: '탐식의 거대 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 20, hp: 500, spd: 0.8, def: 0, res: 0,
    },
  },
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [g('grass', 10, 55, 0.8, 0, 0), g('spore', 12, 40, 1.0, 0, 0)],
    boss: {
      art: 'b02_floratus', name: '플로라투스', title: '수림을 침식한 덩굴 슬라임', bg: '01', melee: true, dmg: 'phys',
      atk: 24, hp: 650, spd: 0.8, def: 1, res: 0,
    },
  },
  {
    bg: '01', zone: '오염된 응집체들의 평원',
    kinds: [g('mud', 12, 80, 0.75, 1, 0), g('spore', 13, 45, 1.0, 0, 0)],
    boss: {
      art: 'b03_acidus', name: '아시두스', title: '부식을 흩뿌리는 산성 슬라임', bg: '01', melee: true, dmg: 'phys',
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
      art: 'b04_sporia', name: '스포리아', title: '역병을 삼킨 포자 슬라임', bg: '01', melee: true, dmg: 'phys',
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
      art: 'b05_spinatus', name: '스피나투스', title: '통곡을 부르는 가시 슬라임왕', bg: '01', melee: true, dmg: 'phys',
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
      art: 'b06_petros', name: '페트로스', title: '대지를 짓누르는 암석 슬라임', bg: '02', melee: true, dmg: 'phys',
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
      art: 'b07_idolatus', name: '이돌라투스', title: '고대 우상의 절단 슬라임', bg: '02', melee: true, dmg: 'phys',
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
      art: 'b08_solvenus', name: '솔베누스', title: '만물을 녹이는 융해 슬라임', bg: '02', melee: true, dmg: 'phys',
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
      art: 'b09_osseus', name: '오세우스', title: '백골을 품은 뼈무덤 슬라임', bg: '02', melee: true, dmg: 'phys',
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
      art: 'b10_sludginus', name: '슬러지누스', title: '타락한 심연의 슬라임 로드', bg: '02', melee: true, dmg: 'phys',
      atk: 68, hp: 3200, spd: 0.7, def: 11, res: 8,
    },
  },
  /* ── 11~20 · 타락한 군락의 정원 ── */
  {
    bg: '03', zone: '타락한 군락의 정원',
    kinds: [p('vine', 25, 350, 0.8, 6, 0), p('spore', 32, 160, 1.0, 2, 5)],
    boss: {
      art: 'b11_acanthus', name: '아칸투스', title: '백골을 감싼 가시덤불', bg: '03', melee: true, dmg: 'phys',
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
      art: 'b12_nepenthia', name: '네펜티아', title: '굶주린 아귀꽃 여왕', bg: '03', melee: true, dmg: 'phys',
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
      art: 'b13_matrona', name: '마트로나', title: '대지를 조여오는 덩굴 모체', bg: '03', melee: true, dmg: 'phys',
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
      art: 'b14_columna', name: '콜룸나', title: '백골을 품은 포자 기둥', bg: '03', melee: true, dmg: 'phys',
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
      art: 'b15_cadavera', name: '카다베라', title: '악취를 피워내는 시체꽃', bg: '03', melee: true, dmg: 'phys',
      atk: 108, hp: 5500, spd: 0.65, def: 16, res: 13,
    },
  },
  {
    bg: '04', zone: '타락한 군락의 정원',
    kinds: [w('stump', 40, 700, 0.75, 14, 2), w('branch', 52, 300, 1.0, 5, 0)],
    boss: {
      art: 'b16_truncus', name: '트룽쿠스', title: '원한이 찍힌 그루터기', bg: '04', melee: true, dmg: 'phys',
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
      art: 'b17_cavus', name: '카부스', title: '백골을 품은 고목 거인', bg: '04', melee: true, dmg: 'phys',
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
      art: 'b18_spinosa', name: '스피노사', title: '대지를 찌르는 가시목', bg: '04', melee: true, dmg: 'phys',
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
      art: 'b19_putridus', name: '푸트리두스', title: '부패를 품은 태고의 거목', bg: '04', melee: true, dmg: 'phys',
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
      art: 'b20_silvanus', name: '실바누스', title: '안에서부터 썩은 세계수', bg: '04', melee: true, dmg: 'phys',
      atk: 170, hp: 10000, spd: 0.55, def: 33, res: 21,
    },
  },
  /* ── 21~25 · 우화하는 군체들의 침식지 ── */
  /*
    ## 수치는 20판의 곡선을 그대로 이었다

    앞 스무 판은 손으로 짠 값이고 (`docs/FOE_TABLE.md`) 열 판마다 한 챕터씩
    같은 기울기로 올라간다 — 우두머리 공격력이 판마다 8~11%, 방어가 3~4씩.
    여기 열 판은 그 기울기를 이어서 뽑은 값이다.

    **한 번 굴려 보고 고쳐야 한다.** 앞 스무 판은 실제로 굴려 보며 맞춘
    값이고 이쪽은 아직 아니다. 특히 걷는 허물(방어 45~52)은 방어가 뺄셈이라
    (`core/chars` 의 `Armor`) 곱셈으로 어림한 값과 실제로 아픈 정도가 제일
    많이 갈리는 자리다.

    ## 우두머리 기술은 아직 안 붙였다

    `patterns` 를 안 적으면 기본값(휩쓸기)을 물려받는다 (`BOSS_PATTERNS`).
    사양이 `tools/gen-boss.py` 에 절반만 적혀 있고 (열 중 셋), 숫자로 옮기려면
    세 벌(사양 · 표 · 코드)이 맞아야 한다 (`tools/gen-boss-skills.py`).
    그림이 들어오는 날 한꺼번에 넣는다.
  */
  {
    bg: '05', zone: '우화하는 군체들의 침식지',
    /*
      사양의 21판은 유충과 여치 둘뿐이다 (`docs/FOE_ART_PROMPTS.md`). 거기에
      노린재를 한 종 더 넣었다 — **판마다 붙어 싸우는 놈과 던지는 놈이 다
      있어야 한다.** 원거리가 없으면 뒷줄이 통째로 비어서 대형이 한 줄이 되고,
      그건 이 게임의 배치가 서 있는 전제다 (`rowMelee`).

      한 종 앞당겨 나오는 것뿐이라 22판(유충·쇠똥구리·노린재)은 사양 그대로다.
    */
    kinds: [
      s('grub', 55, 1150, 0.7, 22, 5),
      s('hopper', 60, 900, 0.95, 18, 5),
      s('spitter', 78, 430, 1.0, 8, 14),
    ],
    boss: {
      art: 'b21_centipeda', name: '센티페다', title: '절단하는 두 갈래 지네', bg: '05', melee: true, dmg: 'phys',
      atk: 188, hp: 11200, spd: 0.6, def: 36, res: 23,
    },
  },
  {
    bg: '05', zone: '우화하는 군체들의 침식지',
    kinds: [
      s('grub', 58, 1250, 0.7, 23, 6),
      s('roller', 52, 1750, 0.6, 32, 8),
      s('spitter', 82, 460, 1.0, 8, 15),
    ],
    boss: {
      art: 'b22_apis', name: '아피스', title: '황금빛 호위벌', bg: '05', melee: true, dmg: 'phys',
      atk: 207, hp: 12500, spd: 0.7, def: 39, res: 25,
    },
  },
  {
    bg: '05', zone: '우화하는 군체들의 침식지',
    kinds: [
      s('hopper', 66, 1000, 0.95, 20, 6),
      s('spitter', 86, 490, 1.0, 9, 16),
      s('weaver', 80, 520, 1.05, 9, 7),
    ],
    boss: {
      /* 강철 갑각 — 이 장에서 제일 단단하고 제일 느리다 */
      art: 'b23_nucanus', name: '누카누스', title: '강철 갑각의 폭군', bg: '05', melee: true, dmg: 'phys',
      atk: 228, hp: 14000, spd: 0.55, def: 46, res: 28,
    },
  },
  {
    bg: '05', zone: '우화하는 군체들의 침식지',
    kinds: [
      s('grub', 64, 1400, 0.7, 26, 7),
      s('roller', 58, 1950, 0.6, 35, 9),
      s('weaver', 85, 560, 1.05, 10, 8),
    ],
    boss: {
      /* 스무 마리 통틀어 **평타가 마법인 첫 우두머리**다 — 인분을 뿌린다 */
      art: 'b24_biblis', name: '비블리스', title: '환각 인분을 뿌리는 유령나방', bg: '05', melee: true, dmg: 'magic',
      atk: 251, hp: 15200, spd: 0.7, def: 44, res: 34,
    },
  },
  {
    bg: '05', zone: '우화하는 군체들의 침식지',
    kinds: [
      s('hopper', 72, 1150, 0.95, 22, 7),
      s('roller', 62, 2100, 0.6, 37, 10),
      s('spitter', 94, 540, 1.0, 10, 18),
      s('weaver', 90, 600, 1.05, 10, 9),
    ],
    boss: {
      art: 'b25_arachnes', name: '아라크네스', title: '우화의 모체, 여왕 아라크네스', bg: '05', melee: true, dmg: 'phys',
      atk: 276, hp: 17600, spd: 0.6, def: 51, res: 33,
    },
  },

  /* ── 26~30 · 침식이 끝난 군체의 둥지 ── */
  {
    bg: '06', zone: '침식이 끝난 군체의 둥지',
    /* 21판과 같은 이유로 잠자리를 한 종 앞당겼다 — 뒷줄이 비면 안 된다 */
    kinds: [
      s('soldier', 74, 1600, 0.8, 32, 11),
      s('mantis', 100, 1350, 0.7, 27, 11),
      s('glider', 102, 570, 1.1, 9, 19),
    ],
    boss: {
      art: 'b26_pyros', name: '피로스', title: '거대한 발광충, 피로스', bg: '06', melee: true, dmg: 'magic',
      atk: 304, hp: 19700, spd: 0.6, def: 55, res: 36,
    },
  },
  {
    bg: '06', zone: '침식이 끝난 군체의 둥지',
    kinds: [
      s('soldier', 80, 1750, 0.8, 34, 12),
      s('drone', 84, 1300, 0.85, 26, 10),
      s('glider', 108, 600, 1.1, 10, 20),
    ],
    boss: {
      art: 'b27_locusta', name: '로쿠스타', title: '대지를 갉아먹는 식탐귀', bg: '06', melee: true, dmg: 'phys',
      atk: 334, hp: 22000, spd: 0.65, def: 58, res: 39,
    },
  },
  {
    bg: '06', zone: '침식이 끝난 군체의 둥지',
    kinds: [
      s('mantis', 112, 1550, 0.7, 30, 13),
      s('husk', 66, 2400, 0.55, 45, 15),
      s('lancer', 115, 640, 1.0, 11, 12),
    ],
    boss: {
      /* 모기 — 제 장에서 제일 빠르다. 무르지만 자주 문다 */
      art: 'b28_mosquito', name: '모스키토', title: '핏빛 가시 입자루', bg: '06', melee: true, dmg: 'phys',
      /* 이 시트만 왼쪽을 보고 들어왔다 — 안 뒤집는다 (`faceLeft`) */
      faceLeft: true,
      atk: 368, hp: 23000, spd: 0.8, def: 60, res: 42,
    },
  },
  {
    bg: '06', zone: '침식이 끝난 군체의 둥지',
    kinds: [
      s('soldier', 92, 2000, 0.8, 38, 14),
      s('mantis', 122, 1700, 0.7, 33, 14),
      s('glider', 126, 700, 1.1, 12, 23),
    ],
    boss: {
      art: 'b29_formica', name: '포르미카', title: '신경을 지배하는 동충하초', bg: '06', melee: true, dmg: 'magic',
      atk: 405, hp: 27600, spd: 0.6, def: 70, res: 46,
    },
  },
  {
    bg: '06', zone: '침식이 끝난 군체의 둥지',
    kinds: [
      s('soldier', 100, 2200, 0.8, 41, 15),
      s('husk', 76, 2900, 0.55, 52, 18),
      s('lancer', 135, 760, 1.0, 13, 15),
      s('glider', 140, 780, 1.1, 13, 26),
    ],
    boss: {
      art: 'b30_baal', name: '바알', title: '침식을 완료한 군체의 절대자, 바알', bg: '06', melee: true, dmg: 'phys',
      atk: 460, hp: 34000, spd: 0.55, def: 78, res: 52,
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
  /**
   * **무대에서 서는 자리** (0 ~ `MOB_CAP`-1). 0 이 맨 앞이다.
   *
   * ## 왜 배열 순서로는 안 되나
   *
   * 목록에서의 자리(`foes` 의 인덱스)는 한 마리가 죽으면 **밀린다.** 앞줄이
   * 쓰러지면 뒤에 있던 놈이 0번이 되고, 화면은 그놈을 앞으로 미끄러뜨린다 —
   * 아무도 안 움직였는데 줄이 통째로 앞으로 당겨진다.
   *
   * 자리를 따로 들고 다니면 **죽어도 남은 놈들이 안 움직인다.** 빈자리는
   * 비워 두고, 다음에 걸어 들어오는 놈이 그 자리를 받는다.
   *
   * 앞쪽 몇 자리가 붙어 싸우는 줄인지는 판이 정한다 (`meleeSlots`). 그래서
   * 근접이 뒷줄에 서거나 원거리가 앞줄에 서는 일이 없다.
   */
  pos: number;
  /**
   * **제 능력치를 직접 들고 있는 놈.** 없으면 판 표에서 읽는다 (`k`).
   *
   * ## 왜 필요했나
   *
   * 여태 적의 정체는 자기가 아니라 **판이** 들고 있었다 — `k` 는 그 판의
   * 종 목록 안에서의 자리이고, 능력치도 그림도 거기서 나왔다 (`foeOf`).
   *
   * 21판에서 지네가 반으로 갈라지고, 26판에서 죽으면서 애벌레 넷이 나오고,
   * 30판에서 분신이 생기는 순간 그 틀이 깨진다. **표에 없는 능력치를 가진
   * 개체**가 서 있어야 하기 때문이다 — 꼬리는 본체의 공격속도 두 배이고,
   * 분신은 최대 체력의 25% 다.
   *
   * 그래서 자기 것을 들고 다닐 수 있게 했다. 있으면 그쪽이 이긴다.
   * 읽는 곳은 한 군데다 (`foeAt`) — 두 곳에서 따로 고르면 언젠가 갈린다.
   */
  own?: Foe;
  /** 우두머리 기믹이 이 한 마리에 붙여 둔 것들 (`FoeGim`) */
  gim?: FoeGim;
}

/**
 * 기믹이 **한 마리에** 붙여 두는 값들.
 *
 * `FoeSlot` 에 직접 붙이지 않고 한 겹 싸 두는 이유는, 저기는 **모든 적이
 * 늘 갖는 것**만 있는 자리이기 때문이다 (체력 · 시계 · 자리). 여기 것들은
 * 서른 판 중 아홉 판의 우두머리만 갖는다.
 *
 * 전부 없어도 된다. 없으면 예전과 똑같이 돈다.
 */
export interface FoeGim {
  /**
   * 자폭까지 남은 시간 (ms). 26판 폭탄 애벌레 하나뿐이다.
   *
   * 0 아래로 내려가면 **스스로 죽으면서** 아군 전원에게 각자 최대 체력의
   * 몫만큼 물리 피해를 준다 (`FUSE_PCT`).
   */
  fuse?: number;
  /** 남은 보호막. 이게 있으면 피해가 체력보다 먼저 여기로 간다 */
  shield?: number;
  /** 보호막이 버티는 시간 (ms). 0 이 되도록 못 깨면 벌칙이 터진다 */
  shieldMs?: number;
  /**
   * 지금 어떤 국면인가 (`cocoon` · `imago`).
   *
   * 그림 칸 이름과 같다 — 화면이 이걸 그대로 `Sprite` 에 넘긴다.
   */
  form?: string;
  /** 국면이 깨지기까지 남은 **타격 수** (23판 고치는 서른 대다) */
  formHit?: number;
  /** 국면의 안전장치 — 이만큼 지나면 무조건 깬다 (ms) */
  formMs?: number;
  /** 이미 터진 기믹들. 같은 것이 두 번 터지지 않게 한다 */
  done?: readonly string[];
  /** 공격력에 영구히 곱해지는 값 (25판 우화의 +30%) */
  atkMul?: number;
  /** 자폭이 아군 각자 최대 체력의 몇 할을 깎나 (`ForkPart.blast`) */
  blast?: number;
  /** 우화까지 기를 모으는 중 — 남은 시간 (ms) */
  charge?: number;
  /**
   * 지금 **안 움직인다.**
   *
   * 고치를 쓰고 있거나 기를 모으는 중이거나 막을 두르고 있으면 켜진다.
   * 안 때리는 것이 규칙이라기보다, 저 셋은 전부 "지금 다른 일을 하는 중"
   * 이라 때리면서 하면 화면에서 무슨 국면인지가 안 읽힌다.
   */
  still?: boolean;
  /**
   * **갈라져 나온 조각이다** — 화면 밖에서 걸어 들어오지 않는다.
   *
   * 새 적은 무대 오른쪽 밖에서 제 자리까지 걸어온다 (`BattleView` 의
   * `WALK_IN_MS`). 새로 나타난 놈을 **고유 번호로만** 알아보므로, 갈라져
   * 나온 조각도 새 놈으로 보고 화면 밖에서 걸어 들어오게 했다.
   *
   * 그게 21판에서 그대로 보였다 — 지네가 반으로 갈라지는데 조각 둘이
   * 오른쪽 끝에서 걸어 들어왔다. 갈라진 것은 **그 자리에서 태어나는 것**이라
   * 어디서 걸어오면 안 된다. 26판 애벌레도 같다.
   */
  born?: boolean;
}

/**
 * 아군끼리 싸우는 중 (24판 혼란 · 29판 광란).
 *
 * 걸린 사람은 **평타만** 쓰고, 살아 있는 다른 아군 하나를 무작위로 친다.
 * 스킬은 안 나간다 — 정화가 저를 푸는 그림이 되어 버리고, 화살비가 아군을
 * 셋씩 치면 그 한 판으로 전투가 끝난다.
 */
/** 한 사람이 두른 보호막 하나 */
export interface Ward {
  /** 남은 흡수량. 0 이 되면 사라진다 */
  hp: number;
  /** 남은 시간 (ms). 0 이 되면 사라진다 */
  ms: number;
  /** 걸려 있는 동안 더해지는 방어력 (수호신의 가호 +10) */
  def: number;
  /** **막아 낸 만큼**의 몇 할을 때린 놈에게 되돌리나 (가호 0.1) */
  back: number;
}

export interface Charm {
  /** 남은 시간 (ms) */
  ms: number;
  /** 돌아선 사람들. 24판은 하나, 29판은 전원 */
  who: readonly string[];
}

/**
 * **이 한 마리가 무엇인가** — 능력치 · 그림 · 기술을 읽는 유일한 창구.
 *
 * 제 것을 들고 있으면 (`own`) 그쪽이 이기고, 아니면 판 표에서 읽는다.
 *
 * 여태 부르는 쪽마다 `foeOf(stage, boss, f.k)` 를 직접 썼다. 자리가 여섯이라
 * 분열체가 생기는 순간 여섯 곳을 다 고쳐야 했고, 하나라도 빠뜨리면 **거기서만
 * 본체 수치로 계산된다** — 화면에는 꼬리가 서 있는데 피해는 머리 것으로
 * 들어가는, 눈으로는 못 잡는 종류의 어긋남이다.
 *
 * @param st 지금 판 — `stage` 와 `boss` 만 본다
 */
export const foeAt = (
  st: { stage: number; boss: boolean }, f: FoeSlot,
): Foe => foeInRow(f.own ?? foeOf(st.stage, st.boss, f.k), f.pos, st.boss);

/**
 * 적도 **줄이 몸을 바꾼다** — 아군과 같은 규칙이다 (`core/party` 의 `ROW_MOD`).
 *
 * 격자의 **맨 왼쪽 세로줄**(`col` 0)이 앞줄이다. 거기가 아군과 마주 보는
 * 쪽이고, 실제로 붙어 싸우는 놈들이 서는 자리다 (`meleeSlots`). 나머지 두
 * 세로줄은 뒷줄이라 공격이 1.15배다.
 *
 * ## 우두머리는 줄이 없다
 *
 * 혼자 서므로 앞뒤가 없다. 규칙대로 앞줄로 치면 **모든 우두머리가 아무
 * 대가 없이 방어 1.5배 · 체력 1.1배**가 되는데, 그건 대형이 만드는 선택이
 * 아니라 그냥 난이도가 오른 것이다. 화면에서도 한 칸 띄워 그리며 줄이 아닌
 * 것으로 다룬다 (`BattleView` 의 `BOSS_LIFT`).
 *
 * ## 체력은 두 군데가 같이 봐야 한다
 *
 * 여기서 최대 체력에 1.1 을 곱하면 **갓 선 놈의 남은 체력도** 같은 값으로
 * 시작해야 한다 (`fresh`). 한쪽만 곱하면 앞줄 잡몹이 90% 체력으로 태어난다.
 */
export function foeInRow(f: Foe, pos: number | undefined, boss: boolean): Foe {
  if (boss) return f;
  const m = rowMod(foeCell(pos ?? 0).col === 0 ? 'front' : 'back');
  return {
    ...f,
    hp: Math.max(1, Math.round(f.hp * m.hp)),
    atk: Math.max(1, Math.round(f.atk * m.atk)),
    def: Math.round((f.def ?? 0) * m.def),
    res: Math.round((f.res ?? 0) * m.res),
  };
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
 * 이 판에서 **앞줄이 몇 자리**인가.
 *
 * 앞에서부터 이만큼이 붙어 싸우는 자리이고, 나머지가 던지는 자리다. 누가
 * 서 있든, 몇 마리가 죽었든 **안 바뀐다** — 그래야 자리를 고정할 수 있다
 * (`FoeSlot.pos`).
 *
 * 던지는 종이 없는 판이면 다 앞줄이고, 붙어 싸우는 종이 없으면 앞줄이 아예
 * 없다. 둘 다 있으면 **앞 세로줄 하나**가 앞줄이라 늘 `FOE_LANES`(셋)다.
 */
export function meleeSlots(stage: number): number {
  const m = meleeKinds(stage).length;
  const r = rangedKinds(stage).length;
  if (!m) return 0;
  if (!r) return MOB_CAP;
  /* 앞 세로줄 하나가 통째로 앞줄이다 — 자리 번호가 세로줄 단위로 끊긴다 */
  return FOE_LANES;
}

/**
 * 자리마다 앞줄인가 — 길이가 늘 `MOB_CAP` 이다.
 *
 * 화면이 "이 자리는 얼마나 앞으로 나가 있나" 를 잴 때 쓴다. **비어 있는
 * 자리도 값을 갖는다** — 서 있는 놈만 보고 재면 한 마리 죽을 때마다 줄
 * 전체가 앞뒤로 움직인다.
 */
export const rowMelee = (stage: number): boolean[] => {
  const n = meleeSlots(stage);
  return Array.from({ length: MOB_CAP }, (_v, i) => i < n);
};

/**
 * 이 스테이지의 적 한 마리.
 *
 * ## 곡선
 *
 * 파티가 자랄 수 있는 폭은 정해져 있다. 레벨 50 에 등급 성장률을 다 받아도
 * 기본치의 4~6.4배고, 레벨을 끝까지 올려도 공격이 8.8배쯤에서 멈춘다.
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

/**
 * ⚠ **테스트 모드 — 1~20판 적 수치를 한 값으로 눌러 둔다.**
 *
 * 스무 판을 손으로 굴려 보려면 판마다 다른 체력이 오히려 방해가 된다. 어디가
 * 벽인지 보려는 게 아니라 **기술과 연출이 제대로 도는지**를 보려는 것이라,
 * 모든 판이 같은 두께여야 비교가 된다.
 *
 * ## 표를 안 갈아엎는다
 *
 * `STAGES` 의 수치는 손으로 맞춘 것이고 `docs/FOE_TABLE.md` 가 그 표를 그대로
 * 싣는다. 거기를 직접 고치면 맞춰 둔 값이 사라져서 **되돌릴 수가 없다.**
 * 여기서 읽을 때만 덮어쓰면 표는 그대로 남고, 이 상수 하나를 `null` 로
 * 바꾸는 순간 원래대로 돌아온다.
 *
 * `FREE_ENHANCE`(`core/chars`) · `FREE_BOSS` 와 짝이다 — 셋 다 직접 굴려
 * 보려고 켜 둔 스위치이고, **출시 전에 같이 끈다.**
 */
export const FLAT_FOES: {
  hp: number; atk: number; bossHp: number; bossAtk: number;
} | null = { hp: 2000, atk: 20, bossHp: 30000, bossAtk: 20 };

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
    /*
      테스트 스위치가 켜져 있으면 여기서 눌러 쓴다 (`FLAT_FOES`). 종의 수치도
      판의 배수도 그대로 남고, **읽는 순간에만** 덮인다.
    */
    hp: FLAT_FOES
      ? (boss ? FLAT_FOES.bossHp : FLAT_FOES.hp)
      : Math.max(1, Math.round(kind.hp * Math.pow(s, STAGE_HP_POW))),
    atk: FLAT_FOES
      ? (boss ? FLAT_FOES.bossAtk : FLAT_FOES.atk)
      : Math.max(1, Math.round(kind.atk * Math.pow(s, STAGE_ATK_POW))),
    spd: kind.spd,
    def: kind.def ?? 0,
    res: kind.res ?? 0,
    /*
      **기술과 성질은 판이 붙인다.**

      `STAGES` 의 우두머리 줄에는 수치만 적혀 있다. 기술은 `BOSS_SKILLS`,
      성질은 `BOSS_PASSIVES` 에 따로 모여 있고 (거기 이유를 적어 뒀다),
      둘을 이어 붙이는 곳이 여기 한 군데다.

      종에 `patterns` 가 직접 적혀 있으면 그쪽이 이긴다 — 잡몹에게 패턴을
      줄 일이 생겼을 때를 위한 자리다.
    */
    patterns: boss ? (kind.patterns ?? BOSS_SKILLS[s] ?? BOSS_PATTERNS) : kind.patterns,
    passive: boss ? (kind.passive ?? BOSS_PASSIVES[s]) : undefined,
    boss,
  };
}

/** 잡았을 때 주는 골드 */
/**
 * **표에 적힌 그대로**의 수치 — 테스트 스위치를 안 탄다 (`FLAT_FOES`).
 *
 * `foeOf` 는 스위치가 켜져 있으면 눌러 쓴 값을 준다. 그건 실제로 싸울 때
 * 맞는 값이라 그래야 하지만, **곡선을 보는 검사**는 그걸 보면 안 된다 —
 * "판이 오를수록 두꺼워지나" 를 물었는데 스위치 때문에 전부 같으면, 검사가
 * 잡아야 할 것(표가 망가졌다)과 잡지 말아야 할 것(스위치가 켜져 있다)을
 * 구분 못 한다.
 *
 * 그래서 표를 직접 읽는 창구를 하나 연다. 여기는 언제나 진짜 값이다.
 */
export function foeSpec(
  stage: number, boss: boolean, k = 0,
): { hp: number; atk: number; spd: number; melee: boolean } {
  const s = Math.max(1, Math.floor(stage));
  const st = stageOf(s);
  const kind = boss ? st.boss : st.kinds[k] ?? st.kinds[0];
  return {
    hp: Math.max(1, Math.round(kind.hp * Math.pow(s, STAGE_HP_POW))),
    atk: Math.max(1, Math.round(kind.atk * Math.pow(s, STAGE_ATK_POW))),
    spd: kind.spd,
    /* 붙어 싸우나 — 스위치와 상관없는 표의 성질이라 여기서도 그대로 준다 */
    melee: kind.melee,
  };
}

export function killGold(stage: number, boss: boolean): number {
  const s = Math.max(1, Math.floor(stage));
  return Math.floor(6 * Math.pow(s, 1.05) * (boss ? 20 : 1));
}

/*
  ── 경험치는 없다 ──

  잡으면 골드만 준다. 캐릭터가 자라는 길이 골드를 쓰는 레벨 올리기이므로
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
  /**
   * 그 특수기의 **변하지 않는 이름표** (`BossPattern.id`).
   *
   * 이름(`pat`)과 따로 둔다. 저건 화면에 적는 글이라 언제든 바뀔 수
   * 있고, 실제로 `뻐개기` 같은 한글을 문자열로 비교해 연출을 고르면 이름
   * 한 글자 고치는 순간 연출이 조용히 사라진다.
   *
   * 화면은 이걸로 **무슨 연출을 할지**를 고른다 (`screens/home/BossFx`).
   */
  patId: string | null;
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
  /**
   * 아군에게 걸려 있는 것들. 키는 CharId (`core/status` 의 `Hex`).
   *
   * 우두머리 기술이 걸고, 매 틱 시간이 흐른다 (`tickHex`). 판이 바뀌거나
   * 전멸하면 통째로 비운다 — 다음 판까지 출혈을 들고 가면 "왜 체력이 줄지"
   * 를 설명할 화면이 없다.
   */
  hex: Record<string, Hex[]>;
  /**
   * 스킬 게이지를 강제로 깎인 횟수. 키는 CharId.
   *
   * 게이지 자체는 화면이 센다 (`Fighter` 안의 스윙 횟수). 여기서 셀 수가
   * 없다 — 휘두르는 박자는 캐릭터마다 다르고 틱과 무관하기 때문이다.
   * 그래서 **깎으라는 신호만** 여기 남기고, 얼마나 깎을지는 화면이 안다.
   *
   * 숫자가 올라간 것을 보면 화면이 한 번 깎는다. 20판 태고의 성난 벼락
   * 하나가 쓴다.
   */
  cut: Record<string, number>;
  /**
   * **무언가 크게 터진 횟수.**
   *
   * 22·29판의 막이 못 깨져 터질 때와 25판이 우화하며 터질 때 하나씩 오른다.
   * 화면은 숫자가 오르는 것만 보고 무대에 파동을 한 번 그린다 (`BattleView`).
   *
   * `patSeq` 와 같은 얼개다 — 틱 결과는 다음 그리기 전에 사라지므로, 화면이
   * 놓치지 않게 **상태에 번호로** 남긴다.
   */
  burst: number;
  /**
   * **갈라진 횟수** — 계속 올라가기만 한다.
   *
   * 허물을 벗어 분신을 만들거나(30판), 몸이 쪼개지거나(21판), 애벌레 넷으로
   * 흩어지는(26판) 그 순간이다. 화면이 이 번호가 오르면 갈라진 몸에서
   * 파동을 한 번 터뜨린다 (`BattleView` 의 `Burst`).
   *
   * ## 왜 `burst` 를 안 쓰나
   *
   * 저건 **아군 전원이 실제로 맞는** 일이다 (막이 안 깨졌거나 자폭했을 때).
   * 그래서 화면이 저 번호를 보고 살아 있는 사람 몸마다 폭발을 하나씩
   * 터뜨리고 무대를 크게 흔든다.
   *
   * 갈라지는 것은 아무도 안 아프다. 같은 번호를 쓰면 분신이 나올 때마다
   * 파티가 얻어맞는 것처럼 보인다.
   */
  rip: number;
  /**
   * 아군끼리 싸우는 중인가 (`Charm`). 아니면 `null`.
   *
   * 24판 정신 착란과 29판 포자 감염이 건다. 걸린 사람은 평타로 **다른
   * 아군**을 친다 (`applyHit`).
   */
  charm: Charm | null;
  /**
   * ── 아군이 두른 보호막 ── 이졸데의 수호의 결의 (`SkillDef.ward`).
   *
   * 상태 효과(`hex`)와 갈라 둔다. 저것들은 **시간이 흐르면 풀리는** 것이라
   * 남은 시간 하나면 되는데, 보호막은 **깎여서 없어지기도** 한다 — 남은
   * 양이라는 칸이 하나 더 필요하고, 그 칸이 있으면 `Hex` 가 아니다.
   *
   * 없는 사람은 키 자체가 없다.
   */
  ward: Record<string, Ward>;
  /**
   * 우두머리가 나온 뒤로 흐른 시간 (ms). 잡몹 구간에서는 0.
   *
   * 20판의 "15초마다 회복" 이 이걸 본다. 시계를 우두머리 슬롯에 두지 않은
   * 이유는, 슬롯은 죽으면 사라지는데 저 성질은 그 우두머리가 서 있는 동안의
   * 것이라 판 상태에 두는 편이 자연스러워서다.
   */
  bossMs: number;
  /**
   * 적이 **실제로 한 대 친** 횟수.
   *
   * 화면이 "지금 적이 팔을 휘둘렀나" 를 이걸로 안다. 체력이 줄어든 것만
   * 보면 지속 피해가 들어올 때마다 적이 허공에 팔을 휘두른다 — 5초짜리
   * 중독이면 열 번이다.
   */
  swingSeq: number;
  /**
   * 쓰러진 사람의 버프가 **사그라들기까지** 남은 시간 (ms). 키는 CharId.
   *
   * 아녜스가 죽으면 여기에 2초가 적히고, 그동안 네 칸의 `pv_ash` 가 깜빡이며
   * 버프도 실제로 계속 걸려 있다 (`core/passives` 의 `FADE_MS`). 다 흐르면
   * 키가 사라지고 그때 공격력이 떨어진다.
   *
   * 다시 일어서면(판을 다시 시작하면) 통째로 비워진다.
   */
  fade: Record<string, number>;
  /**
   * 지금 도발이 걸려 있나 — 누구에게, 몇 ms 남았나, **누구를 걸었나.**
   *
   * 이졸데의 도발 하나가 쓴다. 걸린 놈은 자리 확률(`AIM`)을 무시하고 그
   * 사람만 노린다 (`aimOf`).
   *
   * ## 쓰는 순간 서 있던 놈들에게만 걸린다
   *
   * `foes` 에 그때의 고유 번호(`FoeSlot.id`)를 찍어 둔다. 한동안 이 칸이
   * 없어서 **10초 안에 걸어 들어온 놈까지 도발에 걸렸다** — 포효를 한 번
   * 지르면 그 뒤에 온 무리도 알아서 탱커에게 달려드는 셈이라, 잡몹 구간에서
   * 도발이 사실상 영구 방벽이 됐다.
   *
   * 소리는 그 자리에 있던 놈만 듣는다. 나중에 온 놈은 못 들었다.
   *
   * ## 판이 들고 있는 이유
   *
   * 마리마다 들고 있으면 `foes` 배열을 갈아 끼우는 열 군데를 다 고쳐야 한다.
   * 한 곳만 빠뜨려도 조용히 사라진다 — 실제로 `foeHex` 를 그렇게 만들려다
   * 그만뒀다.
   */
  taunt: { who: string; ms: number; foes: readonly number[] } | null;
  /**
   * 적에게 걸려 있는 것들. 키는 **마리의 고유 번호** (`FoeSlot.id`).
   *
   * 자리 번호로 잡으면 한 마리가 죽는 순간 남은 놈들의 번호가 밀려서, 걸려
   * 있던 것이 엉뚱한 놈에게 옮겨 간다. 고유 번호는 죽을 때까지 안 바뀐다.
   *
   * 지금 여기 들어오는 것은 비앙카의 화산이 거는 시듦 하나다.
   */
  foeHex: Record<number, Hex[]>;
  /**
   * 적이 **회복한** 마지막 한 번 — 번호와 양.
   *
   * 화면이 우두머리 머리 위에 초록 `+N` 을 띄운다. 번호를 같이 두는 이유는
   * 같은 양을 연달아 회복할 때 화면이 못 알아보기 때문이다 (`patSeq` 와
   * 같은 얼개).
   */
  foeHeal: { seq: number; amt: number };
  /**
   * 이번 틱에 우두머리 특수기를 **맞은 사람들** (CharId).
   *
   * 화면이 이걸 보고 맞은 사람에게 표적을 씌운다. 예전에는 피해 숫자만 떴는데,
   * 전원기(`aim: 'all'`)와 한 명기(`aim: 'one'`)가 화면에서 똑같이 보였다 —
   * 누가 맞았는지도, 몇이 맞았는지도 알 수 없었다.
   *
   * `patSeq` 와 같이 움직인다. 특수기가 안 나간 틱에는 빈 배열이다.
   */
  struck: readonly string[];
  /**
   * 판이 바뀐 횟수 — 계속 올라가기만 한다.
   *
   * 화면이 이 숫자가 오르면 **스킬 코스트를 0 으로** 되돌린다 (`Fighter`).
   * 코스트를 세는 것이 화면이라(휘두르는 박자가 캐릭터마다 달라 틱과 무관
   * 하다) 여기서는 신호만 남긴다 — `cut` 과 같은 얼개다.
   */
  costSeq: number;
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
  /*
    **칸 수가 아니라 마릿수로 막는다** (`mobCap`).

    아홉 칸이 있어도 1판에 아홉이 서지는 않는다. 앞 세로줄부터 채우다가
    이 판의 마릿수에서 멈추므로, 넷이면 앞줄 셋에 뒷줄 하나가 된다.
  */
  const room = mobCap(stage);
  const wantMelee = Math.min(meleeSlots(stage), room);
  for (let i = 0; i < wantMelee && m.length; i++) {
    const k = m[i % m.length];
    /* 자리 번호가 곧 배열 순서다 — 처음 한 번은 빈자리 없이 채운다 */
    foes.push(fresh(stage, k, n++, foes.length));
  }
  /* 남은 자리를 **먼저 센다** — 안에서 세면 넣을 때마다 목표가 줄어든다 */
  const wantRanged = r.length ? room - foes.length : 0;
  for (let i = 0; i < wantRanged; i++) {
    const k = r[i % r.length];
    foes.push(fresh(stage, k, n++, foes.length));
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
function fresh(stage: number, k: number, id: number, pos: number): FoeSlot {
  /* 서는 자리가 몸을 바꾼다 — 최대 체력이 그만큼 크면 시작 체력도 그만큼이다 */
  const kind = foeInRow(foeOf(stage, false, k), pos, false);
  return { hp: kind.hp, k, id, cd: swingMs(kind.spd), n: 0, pos };
}

/**
 * 한 마리를 **빈자리에** 세운다. 배열에서 끼운 자리를 돌려준다 (없으면 -1).
 *
 * ## 자리를 새로 짜지 않는다
 *
 * 예전에는 근접을 원거리 **앞에 끼워 넣었다.** 그러면 뒤에 서 있던 놈들의
 * 번호가 통째로 밀리고, 화면에서는 아무도 안 움직였는데 줄이 한 칸씩 뒤로
 * 물러났다. 죽을 때도 같은 일이 반대로 일어났다.
 *
 * 지금은 자리마다 번호가 박혀 있으므로 (`FoeSlot.pos`) **비어 있는 번호를
 * 찾아 그 자리에 세운다.** 앞줄 자리가 비면 근접이, 뒷줄 자리가 비면
 * 원거리가 온다 — 서 있는 놈들은 아무 영향을 안 받는다.
 *
 * 배열은 **자리 번호 순으로** 유지한다. 노리는 확률(`AIM`)이 배열 순서를
 * 앞줄로 읽으므로, 어긋나면 뒤에 선 놈이 앞줄 확률을 받는다.
 */
function spawnInto(
  foes: FoeSlot[], stage: number, seq: number, rand: () => number = Math.random,
): number {
  const m = meleeKinds(stage);
  const r = rangedKinds(stage);
  const front = meleeSlots(stage);
  const used = new Set(foes.map((f) => f.pos));
  const freeIn = (from: number, to: number): number => {
    for (let i = from; i < to; i++) if (!used.has(i)) return i;
    return -1;
  };

  const mFree = m.length ? freeIn(0, front) : -1;
  /*
    던지는 놈은 앞줄 **다음 칸부터**, 이 판의 마릿수까지만 쓴다.

    칸 수(`MOB_CAP`)까지 열어 두면 넷짜리 판에서 넷째가 아홉째 칸에 가서
    선다 — 앞이 셋뿐인데 뒤로 두 줄 건너 혼자 서 있는 그림이 된다.
  */
  const rFree = r.length ? freeIn(front, Math.max(front + 1, mobCap(stage))) : -1;
  /* 앞줄부터 채운다 — 앞이 빈 채로 뒤에서만 두 줄이 서면 싸움으로 안 보인다 */
  const pos = mFree >= 0 ? mFree : rFree;
  if (pos < 0) return -1;
  const pool = mFree >= 0 ? m : r;

  const k = pool[Math.floor(rand() * pool.length)] ?? 0;
  const slot: FoeSlot = fresh(stage, k, seq, pos);

  const at = foes.findIndex((f) => f.pos > pos);
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
    called: false, pat: null, patId: null, patSeq: 0, charm: null, burst: 0, rip: 0,
    ward: {},
    hex: {}, cut: {}, bossMs: 0, swingSeq: 0,
    fade: {}, taunt: null, foeHex: {}, foeHeal: { seq: 0, amt: 0 },
    struck: [], costSeq: 0,
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
    patId: null,
    /* 돌아섰던 아군도 판과 함께 제정신으로 돌아온다 */
    charm: null,
    /*
      보호막도 판과 함께 걷힌다.

      `...st` 로 시작하므로 **여기서 안 지우면 넘어간다.** 8초짜리를 다음
      판까지 들고 가면, 판이 바뀌는 순간에 맞춰 쓰는 것이 늘 최선이 된다.
    */
    ward: {},
    /*
      걸려 있던 것도 **판과 함께 걷힌다.**

      출혈을 들고 다음 판으로 넘어가면, 화면에 그걸 건 놈이 없는데 체력만
      줄어든다 — 무엇 때문인지 알 방법이 없다. 우두머리를 잡은 보상으로
      읽히기도 한다.
    */
    hex: {},
    cut: {},
    bossMs: 0,
    /*
      ── 판이 바뀌면 처음부터다 ──

      쓰러졌던 사람이 일어서고, 체력이 가득 차고 (`hp` 는 부르는 쪽이
      가득 채워 넘긴다), 스킬 코스트가 0 이 된다.

      코스트를 안 지우면 판을 넘나드는 것이 **모아 두는 수단**이 된다 —
      앞 판에서 스무 번 때려 정화를 채워 놓고 우두머리 앞에서 꺼내는 식이다.
      판이 바뀌면 다시 모아야 한다.
    */
    fade: {},
    taunt: null,
    foeHex: {},
    struck: [],
    costSeq: (Number.isFinite(st.costSeq) ? st.costSeq : 0) + 1,
  };
}

/** 우두머리를 부를 수 있나 — 사냥 시간이 다 됐고 아직 안 불렀다 */
/**
 * **테스트 모드 — 사냥 시간을 안 기다리고 우두머리를 부를 수 있다.**
 *
 * 평소에는 1분을 사냥해야 단추가 생긴다 (`STAGE_MS`). 스무 판을 손으로 굴려
 * 보려면 그 1분이 판마다 붙어서 스무 번이면 20분이다.
 *
 * ⚠ **출시 전에 false 로 되돌린다.** `core/chars` 의 `FREE_ENHANCE` 와 짝이다 —
 * 둘 다 직접 굴려 보려고 켜 둔 스위치다.
 */
export const FREE_BOSS = true;

export const bossReady = (st: BattleState): boolean => (
  !st.boss && !st.called && (FREE_BOSS || st.msLeft <= 0) && !fightHeld(st)
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
 * ── 아군을 고를 때는 **줄**이 정한다 ──
 *
 * `AIM` 은 이제 **적을 고를 때만** 쓴다 (`BattleView` 의 `onAim`). 적 줄은
 * 여전히 한 줄로 서고, 앞에 선 놈일수록 많이 맞는다.
 *
 * 아군은 두 줄로 선다 (`core/party` 의 `FORMATIONS`). 그래서 "몇 번째 자리
 * 인가" 가 아니라 **"앞줄인가 뒷줄인가"** 가 확률을 정한다.
 *
 *   3-1  앞 하나 40% · 뒤 셋 20% 씩
 *   2-2  앞 둘 35% 씩 · 뒤 둘 15% 씩
 *   1-3  앞 셋 30% 씩 · 뒤 하나 10%
 *
 * ## 무게로 굴린다
 *
 * 예전에는 **줄을 먼저 뽑고** 그 안에서 고르게 골랐다 (앞줄 70% 고정). 줄
 * 몫이 고정이면 앞에 적게 설수록 그 한 명이 더 맞으므로, `3-1` 의 앞 하나가
 * 70% 를 혼자 졌다.
 *
 * 지금은 **사람마다 무게를 매겨** 한 번에 굴린다 (`aimWeight`). 쓰러진 사람은
 * 목록에서 빠지고 남은 무게로 다시 나뉘므로, 앞줄이 전멸하면 뒷줄 셋이
 * 자기들끼리 나눠 가진다 — "아무도 안 맞는" 자리가 생기지 않는다.
 *
 * @param form 지금 대형. 사람마다 무게가 여기서 나온다
 */
function pickRow(
  alive: readonly OwnedChar[], front: ReadonlySet<string>,
  form: FormationId, rand: () => number,
): OwnedChar {
  const w = alive.map((c) => aimWeight(form, front.has(c.id) ? 'front' : 'back'));
  const total = w.reduce((a, v) => a + v, 0);
  /* 무게가 다 0 이면(있을 수 없지만) 고르게 — 아무도 안 맞는 것보다 낫다 */
  if (!(total > 0)) return alive[Math.floor(rand() * alive.length)] ?? alive[0];
  let r = rand() * total;
  for (let i = 0; i < alive.length; i++) {
    r -= w[i];
    if (r < 0) return alive[i];
  }
  return alive[alive.length - 1];
}

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

/**
 * 사양(`HexSpec`)을 **실제로 걸리는 것**(`Hex`)으로 바꾼다.
 *
 * 계수에 그 우두머리의 공격력을 곱해 숫자로 굳힌다. 굳히는 이유는 걸린
 * 다음에 우두머리가 죽어도 지속 피해가 남기 때문이다 — 계수만 들고 있으면
 * 그때 공격력을 어디서 읽을지가 없어진다.
 *
 * @param atk 건 우두머리의 공격력
 * @param dmg 기술의 피해 종류. `HexSpec.dmg` 가 없으면 이걸 쓴다
 */
export function hexFrom(spec: HexSpec, atk: number, dmg: DmgType): Hex {
  return {
    id: spec.id,
    ms: Math.max(0, Math.round(spec.sec * 1000)),
    /* 지속 피해는 **최소 1** 이다 — 반올림해서 0 이 되면 걸린 티가 안 난다 */
    dot: spec.tick ? Math.max(1, Math.round(atk * spec.tick)) : 0,
    dmg: spec.dmg ?? dmg,
    mul: spec.mul ?? 1,
    n: 1,
  };
}

/**
 * 이 기술이 이 사람에게 **실제로 거는 것들**. 확률은 여기서 굴린다.
 *
 * 사람마다 따로 굴린다 — 6판 암석 낙하의 "30% 확률로 기절" 은 넷 중 한둘만
 * 걸려야 한다. 한 번 굴려 넷에 다 먹이면 "전원 기절" 과 "아무도 안 걸림" 만
 * 남아서, 30% 라는 숫자가 뜻하는 바가 사라진다.
 */
function hexRoll(
  p: BossPattern, atk: number, rand: () => number,
): Hex[] {
  const out: Hex[] = [];
  for (const spec of p.hex ?? []) {
    if (spec.odds !== undefined && rand() >= spec.odds) continue;
    out.push(hexFrom(spec, atk, p.dmg));
  }
  if (p.oneOf && rand() < p.oneOf.odds) {
    const of = p.oneOf.of;
    const pick = of[Math.min(of.length - 1, Math.floor(rand() * of.length))];
    if (pick) out.push(hexFrom(pick, atk, p.dmg));
  }
  return out;
}

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
  /**
   * 이번에 떨어진 **강성의 영약** (`core/growth` 의 `rollElixir`).
   *
   * 우두머리를 잡을 때만, 10판부터 다섯에 하나 꼴이다. 각성에 드는 유일한
   * 재료라 (`AWAKEN_ELIXIR`) 다른 곳에서는 안 나온다.
   *
   * 골드(`gold`)와 나란히 두는 이유: 셋 있는 처치 자리(`battleTick` 의
   * 우화 · `applyHit` · `applySkill`)가 전부 이 한 칸을 채우므로, 받는 쪽은
   * 어디서 잡았는지 몰라도 된다.
   */
  elixir: number;
  /** 우두머리가 방금 나타났나 */
  bossCame: boolean;
  wiped: boolean;
  gold: number;
  /** 이번에 회복한 총량 (사제의 기도) */
  healed: number;
  /**
   * ── 요정의 화살이 터졌나 ── 터진 만큼 (`feyShot`). 안 터졌으면 0.
   *
   * `hit` 안에 이미 더해져 있다. 그런데도 따로 내보내는 이유는 **화면이
   * 그릴 것이 있기 때문**이다 — 여태 이 한 대가 숫자 하나에 조용히 섞여
   * 들어가서, 40% 로 터지는 그 순간이 화면 어디에도 안 나왔다. 코스트 15
   * 짜리 기술의 절반이 눈에 안 보이는 셈이었다.
   *
   * 숫자로 내보낸다 (참·거짓이 아니라) — 화면이 그 값을 그대로 띄운다.
   */
  fey: number;
  /**
   * 이번 틱에 나간 우두머리 특수기의 이름. 안 나갔으면 `null`.
   *
   * 화면이 이걸 보고 이름을 띄운다. 이름이 없으면 전원이 한꺼번에 맞는
   * 순간이 그냥 "숫자가 여러 개 뜬 것" 으로만 보여서, 무엇 때문에 아팠는지를
   * 알 수가 없다.
   */
  pattern: string | null;
  /**
   * 피해도 회복도 없지만 **상태는 바뀌었나.**
   *
   * 도발 · 광란 · 정화가 그렇다. 부르는 쪽은 `hit <= 0 && healed <= 0` 이면
   * 아무 일도 안 일어난 것으로 보고 저장을 건너뛰는데 (`state/slices/roster`),
   * 그러면 이 셋이 계산은 되고 저장은 안 되어 **아무 일도 안 일어난다.**
   *
   * 예전에 회복형에서 똑같이 당했다 — `ev.hit` 만 보고 있어서 기도가 통째로
   * 사라졌다. 갈래가 늘 때마다 그 조건에 항을 더하는 대신, "바뀌었다" 를
   * 한 칸으로 말한다.
   */
  applied: boolean;
}

export interface TickResult {
  battle: BattleState;
  ev: TickEvent;
}

const NOTHING: TickEvent = {
  hit: 0, taken: 0, hurt: null, fell: null, killed: 0, cleared: false, elixir: 0,
  bossCame: false, wiped: false, gold: 0, healed: 0, pattern: null, fey: 0,
  applied: false,
};

/**
 * 이 기술이 **누구를 치나.**
 *
 * 평타(`pat` 이 null)와 `one` 은 자리 확률대로 한 명이다 (`AIM`). 나머지는
 * 기술이 정한다.
 *
 * ## "맨 앞" 은 파티 1번 자리다
 *
 * `core/party` 의 `defenseOrder` 는 역할로 줄을 다시 세운다 (방어가 먼저).
 * 그런데 화면에서 왼쪽에 서는 것은 **파티 자리 순서**이고, 자리 확률(`AIM`)
 * 도 그 순서를 앞줄로 읽는다. 여기서만 역할 순서를 쓰면 "맨 앞을 친다" 는
 * 기술이 화면 한가운데 선 사람을 친다.
 *
 * 그래서 앞은 **살아 있는 사람 중 파티 자리가 가장 앞인 사람**이다.
 */
function aimOf(
  pat: BossPattern | null,
  alive: readonly OwnedChar[],
  hp: Record<string, number>,
  rand: () => number,
  /**
   * 지금 이 마리가 도발에 걸려 있으면 그 사람 (CharId). 아니면 null.
   *
   * **한 명을 고르는 공격만** 여기로 끌려온다 (평타 · `one` · `front` ·
   * `low`). 전원기(`all`)와 둘을 치는 것(`two`)은 그대로다 — 도발은 "나를
   * 노려라" 이지 "저 기술을 나만 맞겠다" 가 아니다. 범위기가 한 명에게만
   * 들어가면 그건 범위기가 아니고, 화면에서도 무슨 기술인지 알 수가 없다.
   */
  taunt: string | null,
  /**
   * 지금 **앞줄에 선 사람들** (`core/party` 의 `frontIdsOf`).
   *
   * 비어 있으면 전원이 뒷줄로 읽히고, `pickRow` 가 그 한 줄에서 고르게
   * 고른다 — 대형이 없던 시절과 결과가 같아진다.
   */
  front: ReadonlySet<string>,
  /** 지금 대형 — 사람마다의 무게가 여기서 나온다 (`pickRow`) */
  form: FormationId,
): OwnedChar[] {
  if (!alive.length) return [];
  /*
    도발은 자리 확률(`AIM`)을 통째로 덮는다. 건 사람이 그 사이에 쓰러졌으면
    안 걸린 것으로 친다 — 시체를 계속 때리면 나머지 셋이 공짜로 논다.
  */
  const bait = taunt ? alive.find((c) => c.id === taunt) : null;
  const one = (): OwnedChar[] => [bait ?? pickRow(alive, front, form, rand)];
  if (!pat || pat.aim === 'one') return one();
  if (pat.aim === 'all') return [...alive];
  /*
    "맨 앞" 은 이제 **앞줄에 선 사람**이다.

    예전에는 파티 자리가 가장 앞인 사람이었다 (그때는 줄이 하나였으므로
    그게 곧 맨 앞이었다). 지금은 대형이 앞줄을 정하므로, 여기서 자리 순서를
    쓰면 `3-1` 에서 앞에 혼자 선 사람을 놔두고 뒤에 선 사람이 맞는다.

    앞줄이 전멸했으면 남은 사람 중 맨 앞이다 — 칠 사람이 없으면 안 된다.
  */
  if (pat.aim === 'front') {
    if (bait) return [bait];
    return [alive.find((c) => front.has(c.id)) ?? alive[0]];
  }
  if (pat.aim === 'low') {
    if (bait) return [bait];
    /*
      **비율로** 잰다. 남은 양으로 재면 원래 체력이 적은 사람(리안느 150)이
      가득 차 있어도 늘 걸려서, "마무리를 노린다" 가 "제일 약한 사람만
      팬다" 가 된다.
    */
    let best = alive[0];
    let low = Infinity;
    for (const c of alive) {
      const r = (hp[c.id] ?? 0) / Math.max(1, statOf(c).hp);
      if (r < low) { low = r; best = c; }
    }
    return [best];
  }
  /*
    ── 파티 구성을 보는 둘 ──

    도발이 걸려 있으면 그쪽이 이긴다. 나머지 한 명짜리와 같은 규칙이다 —
    도발은 "나를 노려라" 이고, 그 말은 고르는 기준을 통째로 덮는다.
  */
  if (pat.aim === 'high' || pat.aim === 'tough') {
    if (bait) return [bait];
    const score = (c: OwnedChar) => (pat.aim === 'high'
      ? statOf(c).atk
      /* 두 겹을 더해서 잰다 — 한쪽만 보면 마법 방어만 두꺼운 사람이 샌다 */
      : statOf(c).def + statOf(c).res);
    let best = alive[0];
    for (const c of alive) if (score(c) > score(best)) best = c;
    return [best];
  }

  /* two — 겹치지 않게 둘. 같은 사람을 두 번 맞히면 한 명분이 사라진다 */
  const pool = [...alive];
  const out: OwnedChar[] = [];
  for (let i = 0; i < 2 && pool.length; i++) {
    out.push(...pool.splice(pickAim(pool.length, rand), 1));
  }
  return out;
}

/**
 * 지금 이 적이 실제로 두르고 있는 방어 두 겹.
 *
 * 20판의 "체력 30% 이하에서 방어력 50% 증가" 하나가 여기를 쓴다
 * (`BossPassive.last`). 나머지는 적어 놓은 값 그대로다.
 */
export function foeArmor(f: Foe, left: number): Armor {
  const last = f.passive?.last;
  if (!last || f.hp <= 0 || left / f.hp > last.under) return { def: f.def, res: f.res };
  return {
    def: Math.round(f.def * last.defMul),
    res: Math.round(f.res * last.defMul),
  };
}

/** 이 적이 받는 피해 배수 — 20판의 "받는 모든 피해 20% 감소" */
export const foeTough = (f: Foe): number => f.passive?.tough ?? 1;

/**
 * 지금 이 적이 실제로 내는 힘과 박자.
 *
 * 광폭화 중이면 둘 다 두 배다 (`RAGE_MUL`). **잡몹은 절대 안 걸린다** —
 * 우두머리가 서 있는 동안만 시계가 도므로 (`bossMs`) 여기서도 `boss` 를
 * 같이 본다.
 *
 * 한 함수에 묶어 둔 이유: 공격력만 올리고 공격속도를 빠뜨리면 화면에서는
 * 평소 박자로 두 배 아픈 것이 되어, "빨라졌다" 가 안 보인다. 실제로 그
 * 갈래를 두 군데에 나눠 뒀다가 한쪽만 고친 적이 있다 (`ticked` 의 `t.atk`).
 */
export function foeNow(f: Foe, rage: boolean): { atk: number; spd: number } {
  /*
    ── 우두머리 것만 걸리던 것을 **서 있는 전부**로 넓혔다 ──

    `rage && f.boss` 였다. 26판이 그 갈래를 드러냈다 — 발광충을 잡으면 애벌레
    넷으로 갈라지는데 (`BOSS_GIMMICK` 의 `split`), 그 넷은 `boss` 가 아니므로
    본체가 광폭화해도 넷은 평소 박자로 쳤다. 화면에서는 "광폭화" 라고 외쳐
    놓고 실제로 서 있는 것들은 아무 변화가 없었다.

    `rage` 는 우두머리와 싸우는 동안에만 참이므로 (`bossMs`), 지금 서 있는
    것은 우두머리이거나 그가 남긴 것뿐이다. 둘 다 걸리는 것이 맞다.
  */
  const on = rage;
  return {
    atk: on ? Math.round(f.atk * RAGE_MUL) : f.atk,
    spd: on ? f.spd * RAGE_MUL : f.spd,
  };
}

/** 이 마리에게 걸려 있는 것들 (`BattleState.foeHex`) */
export const foeHexOf = (
  map: Record<number, Hex[]> | undefined, id: number,
): readonly Hex[] => map?.[id] ?? [];

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
  /**
   * 지금 고른 대형 (`core/party` 의 `FORMATIONS`).
   *
   * 기본값을 둔 이유는 저장본과 검사 때문이다 — 이 칸이 생기기 전의
   * 저장본에는 대형이 없고, 검사에서도 대형을 안 주고 부르는 자리가 있다.
   */
  form: FormationId = DEFAULT_FORMATION,
  rand: () => number = Math.random,
): TickResult {
  /*
    ── 여기서 딱 한 번 대형에 앉힌다 ──

    이 아래로는 `chars` 를 읽는 모든 자리가 **줄 배수가 얹힌 몸**을 본다
    (`core/party` 의 `seatRows` → `core/chars` 의 `statOf`). 앞줄은 방어와
    마법저항이 1.5배, 체력이 1.1배고, 뒷줄은 공격이 1.15배다.

    복사본이라 원본 명부(`st.chars`)는 안 바뀐다 — 도감과 파티 칸은 계속
    맨 몸 수치를 보여 준다.

    **`partyStat` 보다 먼저다.** 파티가 비었는지 재는 것도 이 몸으로 재야,
    "화면에 적힌 총 체력" 과 "실제로 닳는 체력" 이 같은 값이 된다.
  */
  chars = seatRows(party, chars, form);
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
      (우두머리를 잡았을 때).

      ── 체력은 가득 차고, 쓰러진 사람은 일어선다 ──

      한동안 체력을 **그대로** 넘겼다. "위험할 때마다 한 판 갔다 오는 것이
      제일 싼 회복 수단이 된다" 는 이유였는데, 실제로 켜 보니 반대쪽이 훨씬
      나빴다: 우두머리를 잡고 다음 판에 넘어가면 셋이 쓰러진 채로 시작해서,
      새 판의 첫 무리에게 그대로 전멸했다. 판을 깬 보상이 **다음 판의 전멸**
      이었다.

      싼 회복 수단이 되는 것도 실제로는 안 된다 — 옮기는 데 `MOVE_MS` 가
      걸리고, 옮긴 판은 사냥 시간이 처음부터라 우두머리를 다시 1분 기다려야
      한다 (`STAGE_MS`). 그 값이 회복보다 크다.
    */
    const to = Number.isFinite(st.goTo) && st.goTo ? st.goTo : nextStage(st.stage);
    return { battle: enterStage(st, to, fullHp(party, chars)), ev: NOTHING };
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
  let bossMs = Number.isFinite(st.bossMs) ? st.bossMs : 0;
  let swingSeq = Number.isFinite(st.swingSeq) ? st.swingSeq : 0;
  const cut = { ...(st.cut ?? {}) };
  /*
    ── 광폭화 ──

    이번 틱의 시계로 본다. `bossMs` 는 아래에서 오르므로, 여기서 읽은 값은
    **이번 틱이 시작할 때**의 것이다 — 넘어서는 그 틱은 아직 평소 수치로
    친다. 한 틱(0.5초) 차이지만, 두 군데(공격력·회복)가 서로 다른 시점을
    보면 회복만 먼저 시작되는 프레임이 생긴다.
  */
  const rage = raging({ boss: st.boss, bossMs });
  let foeHeal = st.foeHeal ?? { seq: 0, amt: 0 };
  /** 이번 틱에 우두머리 특수기를 맞은 사람들 — 화면이 표적을 씌운다 */
  const struck: string[] = [];

  /*
    ── 도발이 흐른다 ──

    건 사람이 쓰러지면 그 자리에서 걷힌다. 시체를 계속 때리면 나머지 셋이
    공짜로 노는 판이 된다.
  */
  let taunt = st.taunt ?? null;
  if (taunt) {
    const left = (Number.isFinite(taunt.ms) ? taunt.ms : 0) - TICK_MS;
    /*
      명단이 없으면 **걷어낸다.**

      `foes` 는 나중에 생긴 칸이라 그 전 저장본에는 없다. 없을 때 "전부에게
      걸린 것" 으로 치면 이 칸을 만든 이유(나중에 온 놈은 안 걸린다)가
      그 판에서만 조용히 사라진다. 10초짜리라 잃어도 손해가 없으므로,
      애매하면 안 거는 쪽이 맞다.
    */
    const ok = Array.isArray(taunt.foes) && left > 0 && (st.hp[taunt.who] ?? 1) > 0;
    taunt = ok ? { ...taunt, ms: left } : null;
  }

  /*
    ── 걸려 있는 것들이 흐른다 ──

    파티에서 빠진 사람의 기록은 여기서 사라진다 (`hp` 와 같은 태도). 남겨
    두면 다시 넣었을 때 판을 떠나 있던 동안의 출혈이 그대로 되살아난다.
  */
  const hex: Record<string, Hex[]> = {};
  let taken = 0;
  let hurtId: string | null = null;
  let fell: string | null = null;

  for (const c of members(party, chars)) {
    const was = hexOf(st.hex, c.id);
    if (!was.length) continue;
    const { left, dot } = tickHex(was, TICK_MS);
    if (left.length) hex[c.id] = left;
    if (hp[c.id] <= 0) continue;

    /*
      지속 피해도 **다른 피해와 같은 문을 지난다** (`strikeFor`) — 물리는
      방어력이, 마법은 마법저항력이 막는다. 뺄셈이 게임에 한 곳만 있어야
      "왜 이 사람은 덜 아픈가" 가 한 가지 이유로 설명된다.

      파쇄가 걸려 있으면 그 깎인 방어로 막는다 (`liveArmor`) — 16판이
      방어를 깎고 나서 출혈을 얹는 순서라, 여기서 원래 방어를 쓰면 깎은
      뜻이 사라진다.
    */
    const armor = liveArmor(c, left);
    let hurt = 0;
    if (dot.phys > 0) {
      hurt += strikeFor(dot.phys, 1, armor, { type: 'phys', pierce: NO_PIERCE });
    }
    if (dot.magic > 0) {
      hurt += strikeFor(dot.magic, 1, armor, { type: 'magic', pierce: NO_PIERCE });
    }
    if (hurt <= 0) continue;
    hp[c.id] = Math.max(0, hp[c.id] - hurt);
    taken += hurt;
    hurtId = c.id;
    if (hp[c.id] <= 0) fell = c.id;
  }

  /*
    ── 스스로 차는 체력 ──

    이졸데의 패시브 하나뿐이다 (`core/passives`). 이 게임에 저절로 차는
    체력이 없다는 규칙은 그대로다 — 저건 저절로가 아니라 **그 사람이 서
    있어서** 차는 것이고, 쓰러지면 멈춘다.

    쓰러진 사람은 안 채운다. 채우면 회복이 전멸을 취소해서 아무도 안 죽는다.
  */
  let healed = 0;
  for (const c of members(party, chars)) {
    /* 최대 체력의 1% 다 — 키운 만큼 같이 자란다 (`core/passives`) */
    const per = regenOf(c);
    if (per <= 0 || hp[c.id] <= 0) continue;
    const max = statOf(c).hp;
    if (hp[c.id] >= max) continue;
    const gain = Math.min(max - hp[c.id], Math.max(1, Math.round(per * TICK_MS / 1000)));
    hp[c.id] += gain;
    healed += gain;
  }

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
    /* 칸 수가 아니라 **이 판의 마릿수**가 상한이다 (`mobCap`) */
    if (spawnIn <= 0 && foes.length < mobCap(st.stage)) {
      /*
        근접은 원거리 **앞에** 끼워 넣는다. 그래서 자리가 밀릴 수 있고,
        노리던 놈의 번호도 같이 밀어 줘야 한다 — 안 그러면 때리던 놈이
        아니라 방금 걸어 들어온 놈을 때린다.
      */
      const at = spawnInto(foes, st.stage, seq);
      if (at >= 0) {
        seq += 1;
        if (at <= target) target += 1;
      }
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
    foes = [{ hp: bossFoe.hp, k: 0, id: seq, cd: swingMs(bossFoe.spd), n: 0, pos: 0 }];
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
  /*
    ── 지금 앞줄에 선 사람들 ──

    **한 번만 잰다.** 적이 한 틱에 여섯 마리까지 치므로 (`MOB_CAP`) 한 대마다
    다시 재면 여섯 번 돈다. 그리고 한 틱 안에서는 대형이 안 바뀌므로 여섯 번
    돌아 봐야 같은 답이다.
  */
  const frontIds = frontIdsOf(party, chars, form);

  /*
    ── 우두머리가 늘 달고 있는 것 ──

    오라는 **매 틱 다시 건다.** 시간이 지나 풀리게 두면 우두머리가 살아
    있는데도 깜빡이고, 매 틱 새로 고치면 우두머리가 죽는 순간 자연히 걷힌다.
  */
  /*
    ── 적에게 걸린 것이 흐른다 ──

    시듦 · 약화 · 둔화, 그리고 **지옥불**이 여기 들어온다 (비앙카의 용암
    지대 — `st_burn`).

    ## 지속 피해가 실제로 깎는다

    오랫동안 `dot` 을 버렸다 — 적에게 거는 지속 피해가 하나도 없었기
    때문이다. 이제 있다.

    아군 쪽과 **같은 문**을 지난다 (`strikeFor`): 적의 방어 두 겹을 빼고,
    아무리 깎여도 최소 1 은 들어간다. 따로 세면 "적에게 들어가는 지속 피해만
    방어를 무시하는" 규칙이 하나 더 생긴다.

    **죽은 놈의 기록은 여기서 사라진다.** 서 있는 놈만 훑으므로, 죽어서
    목록에서 빠지면 그 번호는 다음 판까지 안 돌아온다.
  */
  const foeHex: Record<number, Hex[]> = {};
  for (let i = 0; i < foes.length; i += 1) {
    const f = foes[i];
    const was = foeHexOf(st.foeHex, f.id);
    if (!was.length) continue;
    const { left, dot } = tickHex(was, TICK_MS);
    if (left.length) foeHex[f.id] = left;
    /*
      물리와 마법을 따로 굴린다 — 막는 겹이 다르다 (`Armor`). 둘을 더해서
      한 번에 넣으면 방어가 한 번만 빠져서, 두 종류를 같이 건 놈에게는
      실제보다 아프게 들어간다.
    */
    const kind0 = foeAt({ stage: st.stage, boss: isBoss }, f);
    let burn = 0;
    for (const [type, raw] of [['phys', dot.phys], ['magic', dot.magic]] as const) {
      if (raw <= 0) continue;
      burn += strikeFor(
        raw, 1, foeArmor(kind0, foes[i].hp), { type, pierce: NO_PIERCE },
      );
    }
    if (burn > 0) foes[i] = biteFoe(foes[i], burn);
  }

  /** 이 마리가 지금 받는 회복 배수 — 시듦이 걸려 있으면 깎인다 */
  const foeHealMul = (id: number): number => healMulOf(foeHex[id] ?? []);

  /**
   * 우두머리를 채운다. **실제로 찬 만큼**을 돌려준다.
   *
   * 회복이 세 갈래(흡혈 · 20판의 15초 회복 · 광폭화의 초당 1%)라 한 곳으로
   * 모았다. 갈래마다 따로 쓰면 시듦을 한 군데만 적용하는 일이 생기고,
   * 화면에 띄우는 `+N` 도 갈래마다 빠뜨리게 된다.
   */
  const healBoss = (want: number): number => {
    if (want <= 0 || !foes.length || !isBoss) return 0;
    const b = foes[0];
    if (!b || b.hp <= 0) return 0;
    const amt = Math.round(want * foeHealMul(b.id));
    const gain = Math.min(bossFoe.hp - b.hp, amt);
    if (gain <= 0) return 0;
    foes = [...foes];
    foes[0] = { ...b, hp: b.hp + gain };
    return gain;
  };

  const pas = isBoss ? (bossFoe.passive ?? null) : null;
  if (isBoss) {
    bossMs += TICK_MS;
    /*
      광폭화의 초당 1%.

      **틱마다 나눠서** 넣는다 (0.5초에 0.5%). 1초에 한 번 몰아넣으면 숫자가
      1초 간격으로 툭툭 뜨는데, 그 사이에 우두머리가 죽으면 마지막 몫이 통째로
      사라져 "회복을 하는 놈" 이라는 인상이 안 남는다.
    */
    if (rage) {
      const got = healBoss(bossFoe.hp * RAGE_REGEN * (TICK_MS / 1000));
      if (got > 0) foeHeal = { seq: foeHeal.seq + 1, amt: got };
    }
    if (pas?.aura) {
      for (const c of members(party, chars)) {
        if (hp[c.id] <= 0 || CHARS[c.id].role !== pas.aura.role) continue;
        let list = hex[c.id] ?? [];
        for (const spec of pas.aura.of) {
          list = putHex(list, hexFrom(spec, bossFoe.atk, 'magic'), spec.stack ?? 1);
        }
        hex[c.id] = list;
      }
    }
    /*
      스스로 차는 체력 — 몇 초마다 한 번이다.

      "이번 틱에 그 선을 넘었나" 로 잰다. `bossMs % per === 0` 으로 보면
      틱 길이가 안 맞아떨어질 때 영영 안 걸린다.
    */
    if (pas?.regen && foes.length) {
      const per = Math.max(TICK_MS, pas.regen.sec * 1000);
      if (Math.floor(bossMs / per) > Math.floor((bossMs - TICK_MS) / per)) {
        const got = healBoss(bossFoe.hp * pas.regen.pct);
        if (got > 0) foeHeal = { seq: foeHeal.seq + 1, amt: got };
      }
    }
  } else {
    bossMs = 0;
  }

  /*
    ── 특수 기믹 ── 21~30 우두머리만 갖는다 (`BOSS_GIMMICK`).

    **휘두르기 전에** 돈다. 갈라지는 것도 고치가 되는 것도 이번 틱의 공격에
    곧바로 반영돼야, "갈라졌는데 본체가 한 대 더 쳤다" 가 안 생긴다.
  */
  /*
    ── 보호막 ── 이번 틱 동안 깎이고 시간이 흐른다.

    `hp` 와 같은 얼개다: 위에서 베껴 쓰고 아래에서 그대로 내보낸다.
  */
  const ward: Record<string, Ward> = { ...(st.ward ?? {}) };
  /** 막이 되돌린 피해 — 때린 놈에게 나중에 한 번에 넣는다 (`Ward.back`) */
  const backTo: Record<number, number> = {};
  let charm = st.charm ?? null;
  let burst = Number.isFinite(st.burst) ? st.burst : 0;
  /* 갈라진 횟수 — 화면이 이 번호로 파동을 터뜨린다 (`BattleState.rip`) */
  let rip = Number.isFinite(st.rip) ? st.rip : 0;
  if (isBoss) {
    const cx: GimCtx = {
      stage: st.stage,
      foes,
      seq,
      hp,
      hex,
      cut,
      line,
      bossMs,
      charm,
      rip: st.rip ?? 0,
      foeHeal,
      taken,
      hurtId,
      fell,
      burst,
      rand,
    };
    runGim(cx);
    seq = cx.seq;
    charm = cx.charm;
    foeHeal = cx.foeHeal;
    taken = cx.taken;
    hurtId = cx.hurtId;
    fell = cx.fell;
    burst = cx.burst;
    rip = cx.rip;
  }
  /*
    돌아선 아군도 시간이 지나면 제정신으로 돌아온다.

    적의 상태(`foeHex`)와 달리 여기는 판 전체에 하나뿐이라 (걸린 사람 목록을
    같이 들고 다닌다) 시계도 하나다.
  */
  if (charm) {
    const left = charm.ms - TICK_MS;
    charm = left > 0 ? { ...charm, ms: left } : null;
  }

  /*
    ── 보호막도 시간이 흐른다 ──

    깎여서 없어지는 것은 위에서 처리했고 (`backTo` 바로 앞), 여기서는
    **시간이 다 되어** 없어지는 쪽이다. 8초짜리라 열여섯 틱이다.

    쓰러진 사람의 막도 걷는다. 시체가 막을 두르고 있으면 다시 일어설 때
    (판을 다시 시작할 때) 공짜로 막 하나를 들고 시작한다.
  */
  for (const [id, w] of Object.entries(ward)) {
    const left = w.ms - TICK_MS;
    if (left > 0 && w.hp > 0 && (hp[id] ?? 0) > 0) ward[id] = { ...w, ms: left };
    else delete ward[id];
  }

  /* 시계가 줄어든 새 목록 — 원본을 안 건드린다 */
  const ticked = foes.map((f, i) => {
    /*
      **우두머리는 우두머리의 수치로 읽는다.**

      `false` 로 박혀 있었다. 지금은 열 판 수치를 다 같게 맞춰 둬서 눈에
      안 띄지만, 우두머리 공격속도를 따로 잡는 순간 우두머리가 잡몹 박자로
      치게 된다 — 그리고 그건 표를 아무리 들여다봐도 안 보인다.
    */
    const kind = foeAt({ stage: st.stage, boss: isBoss }, f);
    /* 광폭화 중이면 공격력도 박자도 두 배다 (`foeNow`) */
    const raw = foeNow(kind, rage);
    /*
      우화한 놈은 공격력이 영구히 오른 채다 (`FoeGim.atkMul`, 25판 +30%).

      본체 수치(`kind.atk`)를 안 고치고 여기서 곱한다 — 저건 판 표에서 온
      값이라 고치면 그 판의 **모든** 아라크네스가 세진다.
    */
    const live = f.gim?.atkMul
      ? { ...raw, atk: Math.round(raw.atk * f.gim.atkMul) }
      : raw;
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
    /*
      자리 번호도 나중에 생겼다. 없으면 **배열 순서를 그대로** 쓴다 — 예전
      저장본에서는 배열 순서가 곧 자리였으므로 그게 맞는 값이다.
    */
    const pos = Number.isFinite(f.pos) ? f.pos : i;
    let swings = 0;
    /* 한 틱 안에 두 번 칠 수도 있다 (아주 빠른 적) */
    const at: (BossPattern | null)[] = [];
    /*
      **지금 다른 일을 하는 중이면 안 친다** (`FoeGim.still`).

      고치를 쓰고 있거나, 기를 모으는 중이거나, 막을 두르고 있을 때다.
      시계는 그대로 줄어든다 — 멈춰 두면 풀리는 순간 밀린 만큼 한꺼번에
      네 대가 나간다.
    */
    while (!f.gim?.still && cd <= 0 && swings < 4) {
      swings += 1;
      n += 1;
      cd += swingMs(live.spd);
      /*
        **우두머리만** 패턴을 쓴다. 잡몹도 횟수는 세지만(갈래를 안 늘리려고)
        고르지는 않는다 — 잡몹 넷이 각자 특수기를 쓰면 화면이 읽히지 않는다.
      */
      at.push(isBoss ? patternAt(n, kind.patterns ?? BOSS_PATTERNS) : null);
    }
    return { slot: { ...f, cd, n, pos }, atk: live.atk, blow: foeBlow(kind), swings, at };
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
  const hits: { atk: number; blow: Blow; pat: BossPattern | null; id: number }[] = [];
  for (const t of ticked) {
    for (let i = 0; i < t.swings; i++) {
      /*
        무슨 피해인지도, **어느 마리가 쳤는지도** 한 대마다 달고 간다.

        마리 번호는 도발이 쓴다 — 그때 서 있던 놈만 걸리므로, 치는 순간
        "이놈이 그때 있었나" 를 물어야 한다 (`BattleState.taunt.foes`).
      */
      hits.push({ atk: t.atk, blow: t.blow, pat: t.at[i] ?? null, id: t.slot.id });
    }
  }

  /* 이번 틱에 나간 특수기 — 화면이 이름을 띄운다. 여럿이면 마지막 것 */
  let pattern: string | null = null;
  /* 같은 것의 이름표 — 화면이 연출을 이걸로 고른다 (`patId`) */
  let patId: string | null = null;

  /** 우두머리가 흡혈로 가져간 양 (10판 포식의 점액) */
  let drained = 0;

  for (const h of hits) {
    const alive = line.filter((c) => hp[c.id] > 0);
    if (!alive.length) break;

    /* 실제로 한 대 휘둘렀다 — 화면이 이 숫자로 팔을 움직인다 */
    swingSeq += 1;

    /* 도발은 **쓸 때 서 있던 놈**에게만 걸렸다 — 나중에 온 놈은 못 들었다 */
    const baited = taunt && taunt.foes.includes(h.id) ? taunt.who : null;
    const marks = aimOf(h.pat, alive, hp, rand, baited, frontIds, form);
    /* 특수기에 맞은 사람은 화면이 표적으로 씌운다 (`BattleState.struck`) */
    if (h.pat) for (const m of marks) if (!struck.includes(m.id)) struck.push(m.id);

    /*
      ── 기술이 부르는 기믹 ── 셋뿐이다 (`BossPattern.casts`).

      막을 두르는 것과 아군을 돌려세우는 것은 **몇 번이고 다시 나오는 것**
      이라 체력 문턱에 못 둔다 (문턱은 판마다 한 번뿐이다).
    */
    if (h.pat?.casts === 'shield') {
      const sg = gimmicksOf(st.stage).find((x): x is ShieldGim => x.kind === 'shield');
      const me2 = foes.findIndex((f) => f.id === h.id);
      if (sg && me2 >= 0) {
        const kind2 = foeAt({ stage: st.stage, boss: true }, foes[me2]);
        foes[me2] = {
          ...foes[me2],
          gim: {
            ...(foes[me2].gim ?? {}),
            shield: Math.max(1, Math.round(kind2.hp * sg.pct)),
            shieldMs: sg.ms,
            still: true,
          },
        };
      }
    }
    if (h.pat?.casts === 'charm' && marks.length) {
      /* 맞은 사람 하나만 돌아선다 — 전원기가 아니다 */
      charm = {
        ms: Math.round((h.pat.charmSec ?? 4) * 1000),
        who: [marks[0].id],
      };
    }
    if (h.pat?.casts === 'devour' && marks.length) {
      /*
        ── 빼앗는다 ── 27판 하나뿐이다.

        아군에게 걸린 **좋은 것** 하나를 떼어 우두머리가 두른다. 나쁜 것은
        안 가져간다 — 중독을 빼앗아 제가 중독되는 것은 포식이 아니다.

        패시브가 거는 것은 못 뺏는다. 저건 `hex` 가 아니라 파티 구성에서
        나오므로 (`core/passives`) 뗄 자리가 없고, 떼어도 다음 프레임에
        다시 붙는다.
      */
      const dg = gimmicksOf(st.stage).find((x): x is DevourGim => x.kind === 'devour');
      const from = marks[0];
      const list = hex[from.id] ?? [];
      const at2 = list.findIndex((x) => GOOD.has(x.id) && x.ms > 0);
      if (dg && at2 >= 0) {
        const stolen = list[at2];
        hex[from.id] = list.filter((_x, i) => i !== at2);
        foeHex[h.id] = putHex(foeHexOf(foeHex, h.id), { ...stolen, ms: dg.ms }, 1);
      }
    }

    /*
      기술은 **제 피해 종류와 관통을 따로 갖는다** (`BossPattern.dmg`).
      평타가 물리인 우두머리가 마법 기술을 쓰는 판이 여럿이라(3·8·12·15·17),
      평타 종류를 그대로 쓰면 마법저항력이 통째로 무시된다.
    */
    const blow: Blow = h.pat
      ? {
        type: h.pat.dmg,
        pierce: h.pat.pierce ? { phys: true, magic: true } : NO_PIERCE,
      }
      : h.blow;

    for (const who2 of marks) {
      /*
        배수는 **방어력을 빼기 전에** 곱한다. 뺀 뒤에 곱하면 방어가 배수만큼
        같이 커져서, 세게 치는 공격일수록 방어가 잘 먹는 거꾸로 된 일이 된다.
      */
      /*
        맞는 사람의 **두 겹**을 통째로 넘기되, 지금 깎여 있으면 깎인 값을
        쓴다 (`liveArmor`) — 16판이 방어를 40% 깎고 그 다음 대부터 아프게
        하는 기술이라, 원래 값을 쓰면 깎은 뜻이 없어진다.
      */
      /*
        ── 막이 두르고 있으면 방어가 두꺼워진다 ── (`Ward.def`)

        수호신의 가호가 +10 을 준다. `liveArmor` 안에 넣지 않은 이유: 저
        함수는 걸린 상태만 보는 순수 계산이라 (`core/passives`) 전투 상태를
        모른다. 여기서 얹으면 막이 있는 동안만 두꺼워지는 것이 한눈에 보인다.
      */
      const wd = ward[who2.id];
      const wdOn = !!wd && wd.ms > 0 && wd.hp > 0;
      const armor0 = liveArmor(who2, hex[who2.id] ?? []);
      const armor = wdOn && wd.def > 0
        ? { def: armor0.def + wd.def, res: armor0.res }
        : armor0;
      const base = Math.round(h.atk * (h.pat ? h.pat.mul : 1));
      /*
        배수가 0 인 기술은 **때리지 않는다** — 거는 것만 한다 (3·4·8·12·14·15판).
        `strikeFor` 에 넣으면 최소 1 이 나와서, 피해가 없어야 할 기술에서
        숫자가 뜬다.
      */
      const hit0 = base > 0 ? strikeFor(base, 1, armor, blow) : 0;
      /*
        ── 광폭화의 이빨 ── 맞는 사람 최대 체력의 5% 를 **그대로** 더한다.

        방어를 안 지난다 (`RAGE_BITE` 에 이유가 있다). 그리고 **배수가 0 인
        기술에도 얹힌다** — 사양이 "모든 공격" 이고, 3·4·8·12·14·15판처럼
        거는 것만 하는 기술이 광폭화 중에도 아프지 않으면 그 판들만 광폭화가
        없는 판이 된다.
      */
      const bite = rage ? Math.max(1, Math.round(statOf(who2).hp * RAGE_BITE)) : 0;
      const dmg = hit0 + bite;
      if (dmg > 0) {
        /*
          ── 막이 먼저 받는다 ──

          남은 양만큼만 먹고 나머지가 체력으로 간다. 막이 다 깎이면 그
          자리에서 사라진다 — 시간이 남았어도.

          **막아 낸 만큼**의 일부가 때린 놈에게 돌아간다 (`Ward.back`).
          입은 피해가 아니라 막아 낸 양을 기준으로 하는 이유: 막이 다 깎인
          뒤로는 반격도 없어야 "막이 하는 일" 이 하나로 읽힌다.
        */
        let left = dmg;
        if (wdOn && wd) {
          const eat = Math.min(wd.hp, left);
          left -= eat;
          const rest = wd.hp - eat;
          if (rest > 0) ward[who2.id] = { ...wd, hp: rest };
          else delete ward[who2.id];
          if (wd.back > 0 && eat > 0) {
            backTo[h.id] = (backTo[h.id] ?? 0) + Math.round(eat * wd.back);
          }
        }
        if (left > 0) {
          hp[who2.id] = Math.max(0, hp[who2.id] - left);
          taken += left;
          hurtId = who2.id;
          if (hp[who2.id] <= 0) fell = who2.id;
        }
      }

      /* ── 걸고 가는 것 ── */
      let list = hex[who2.id] ?? [];
      if (h.pat) {
        for (const x of hexRoll(h.pat, h.atk, rand)) list = putHex(list, x, 1);
        /*
          게이지는 **여기서 못 깎는다.** 스킬 게이지를 세는 것은 화면이고
          (`Fighter` 의 스윙 횟수), 그 박자는 틱과 무관하다. 신호만 남긴다.
        */
        if (h.pat.gauge) cut[who2.id] = (cut[who2.id] ?? 0) + 1;
        if (h.pat.drain) drained += Math.round(dmg * h.pat.drain);
      } else if (pas?.onHit) {
        /* 평타에 붙는 것 — 10판 오염된 점성 하나뿐이다. 겹친다 */
        list = putHex(list, hexFrom(pas.onHit, h.atk, 'phys'), pas.onHit.stack ?? 1);
      }
      if (list.length) hex[who2.id] = list;
      else delete hex[who2.id];
    }
    if (h.pat) { pattern = h.pat.name; patId = h.pat.id; }
  }

  /*
    흡혈 — 입힌 만큼 우두머리가 가져간다.

    한 번에 몰아서 더한다. 맞는 사람마다 나눠 더하면 그 사이에 우두머리가
    최대치를 넘었다가 다시 깎이는 중간 상태가 생긴다.
  */
  if (drained > 0) {
    const got = healBoss(drained);
    if (got > 0) foeHeal = { seq: foeHeal.seq + 1, amt: got };
  }

  /*
    ── 막이 되돌린 피해 ── 수호신의 가호 (`Ward.back`).

    **한 번에 몰아서 넣는다.** 맞을 때마다 바로 넣으면, 넷이 한 놈에게
    맞은 틱에서 그놈이 네 번 나뉘어 깎이고 그 사이에 죽어 버릴 수 있다 —
    그러면 남은 셋의 반격이 이미 없는 놈을 때린다.

    **방어를 안 지난다.** 되돌리는 것은 막이 흡수한 피해 그 자체이지 새로
    때리는 것이 아니다. 방어로 또 깎으면 두 번 막는 셈이 된다.
  */
  for (const [fid, amt] of Object.entries(backTo)) {
    if (amt <= 0) continue;
    const at = foes.findIndex((f) => f.id === Number(fid));
    /* 그 사이에 죽었으면 되돌릴 데가 없다 */
    if (at < 0) continue;
    foes[at] = biteFoe(foes[at], amt);
  }

  /*
    ── 쓰러진 사람의 버프가 사그라든다 ──

    **틱이 다 끝난 뒤에** 센다. 위에서 세면 이번 틱에 쓰러진 사람이 빠진다 —
    지속 피해로 죽는 경우가 그렇고, 그건 우두머리전에서 흔한 죽음이다.

    아녜스가 죽은 그 틱에 2초가 적히고, 매 틱 줄어든다. 그동안
    `livingMembers` 가 그 사람을 살아 있는 것으로 세므로 (`core/party`) 버프가
    실제로 계속 걸려 있고, 화면에서는 로고가 깜빡인다
    (`core/passives` 의 `FADE_MS`).

    **다시 일어서면 즉시 사라진다** — 살아 있는 사람에게는 아예 칸을 안 만든다.
  */
  const fade: Record<string, number> = {};
  for (const c of members(party, chars)) {
    if (hp[c.id] > 0) continue;
    const was = st.fade?.[c.id];
    if (was === undefined) {
      /* 이번 틱에 쓰러졌나 — 틱이 시작할 때는 서 있었나로 본다 */
      if (hpOf(c, st.hp) > 0) fade[c.id] = FADE_MS;
      continue;
    }
    const left = (Number.isFinite(was) ? was : 0) - TICK_MS;
    if (left > 0) fade[c.id] = left;
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
        /* 쓰러지면 걸려 있던 것도 같이 걷힌다 — 다시 일어설 때 가지고 가면 안 된다 */
        hex: {},
        cut: {},
        bossMs: 0,
        swingSeq,
        /* 전멸했으면 사그라들 버프도 없다 — 넷이 다 쓰러졌다 */
        fade: {},
        taunt: null,
        foeHex: {},
        foeHeal,
        struck: [],
        /* 다시 일어설 때도 코스트는 0 부터다 (`enterStage` 와 같은 규칙) */
        costSeq: (Number.isFinite(st.costSeq) ? st.costSeq : 0) + 1,
      },
      ev: {
        hit, taken, hurt: hurtId, fell, pattern,
        killed, cleared: false, elixir: 0, bossCame, wiped: true, gold, healed,
        /* 적이 때린 틱이다 — 요정의 화살은 아군이 때릴 때만 터진다 */
        fey: 0,
        applied: true,
      },
    };
  }

  /*
    ── 기믹이 줄을 비웠다 ── 26판 애벌레 넷이 다 터진 그 순간.

    판이 끝나는 판단은 여태 **때린 자리**에만 있었다 (`applyHit`·`applySkill`
    의 "줄이 비면 끝난다"). 그런데 폭탄 애벌레는 아무도 안 때려도 스스로
    죽는다 — 도화선이 다 되면 틱이 목록에서 지운다.

    그래서 넷을 다 잡지 않고 **터지게 두면** 적이 하나도 없는 채로 판이
    멈췄다. 이기지도 지지도 않고, 다음 판으로도 안 넘어갔다. 26판을 "심각한
    버그" 라고 부른 것이 이것이다.

    잡은 것으로 센다. 터뜨린 것도 치운 것이고, 그 대가로 파티는 각자 최대
    체력의 25% 를 넷 몫으로 물었다.
  */
  const gimCleared = isBoss && foes.length === 0;

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
      patId: patId ?? st.patId ?? null,
      patSeq: pattern ? (Number.isFinite(st.patSeq) ? st.patSeq : 0) + 1 : (st.patSeq ?? 0),
      hex, cut, bossMs, swingSeq, charm, burst, rip, ward,
      fade, taunt, foeHex, foeHeal,
      /*
        맞은 사람 명단은 **특수기가 나간 틱에만** 채운다. 안 나간 틱에 지난
        명단을 들고 있으면 표적이 화면에 눌러앉는다.

        빈 배열을 매번 새로 만들면 `battleTickOnce` 의 통째 비교가 늘 "바뀌었다"
        가 되지만, 그건 `JSON.stringify` 비교라 값이 같으면 같다.
      */
      struck: pattern ? struck : [],
      costSeq: Number.isFinite(st.costSeq) ? st.costSeq : 0,
      /*
        **줄이 비었으면 곧 넘어간다.** 바로 안 넘긴다 — `clearIn` 을 걸어
        두면 틱이 그 시간을 흘려보내는 동안 화면이 `Clear` 를 띄운다
        (`applyHit` 의 우두머리 처치와 똑같은 얼개다).
      */
      ...(gimCleared ? {
        slain: slain + 1,
        target: 0,
        clearIn: CLEAR_MS,
        clearKind: 'boss' as const,
        goTo: nextStage(st.stage),
      } : null),
    },
    ev: {
      hit, taken, hurt: hurtId, fell, pattern,
      /* 적이 때린 틱이다 — 요정의 화살은 아군이 때릴 때만 터진다 */
      fey: 0,
      killed: gimCleared ? killed + 1 : killed,
      cleared: gimCleared,
      elixir: gimCleared ? rollElixir(st.stage, rand) : 0,
      bossCame,
      wiped: false,
      gold: gimCleared ? gold + killGold(st.stage, true) : gold,
      healed,
      applied: true,
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
/**
 * ── 요정의 화살 ── 때릴 때마다 확률로 한 번 더 (`st_fey`).
 *
 * 걸려 있지 않으면 0 이다. 리안느의 요정의 축제 하나가 이걸 건다.
 *
 * ## 방어를 지난다
 *
 * 이건 **한 번 더 때리는 것**이지 흡수한 피해를 되돌리는 것이 아니다
 * (`Ward.back` 과 갈리는 지점이다). 그래서 맞는 놈의 방어 두 겹을 그대로
 * 지나야 하고, 아무리 깎여도 최소 1 은 들어간다.
 *
 * 물리로 굳혀 둔다 — 화살이다. 때리는 사람이 아녜스(마법)여도 날아가는
 * 것은 리안느의 화살이므로 그쪽 종류를 따른다.
 *
 * @param armor 맞는 놈이 지금 두르고 있는 두 겹
 */
function feyShot(
  hex: readonly Hex[], armor: Armor, rand: () => number,
): number {
  for (const h of hex) {
    if (h.id !== 'st_fey' || h.ms <= 0 || !h.proc) continue;
    if (rand() >= h.proc.odds) return 0;
    return Math.max(1, strikeFor(h.proc.hit, 1, armor, PHYS_BLOW));
  }
  return 0;
}

/**
 * ── 흡혈 ── 입힌 만큼 제 체력이 찬다 (`st_leech`).
 *
 * 비앙카의 불굴의 의지 하나다. 걸려 있지 않으면 `hp` 를 **그대로 돌려준다** —
 * 새 객체를 안 만든다: 이 함수는 휘두를 때마다 불리고, 걸린 사람은 드물다.
 *
 * ## 최대치를 못 넘는다
 *
 * 넘게 두면 다음 판으로 넘어갈 때 가득 찬 것으로 잘리므로 티가 안 나지만,
 * 그 판 안에서는 "맞아도 안 줄어드는" 구간이 생긴다 — 막대가 안 움직이는데
 * 실제로는 깎이고 있는 셈이라 화면이 거짓말을 한다.
 *
 * @param dealt 이번에 실제로 적에게 들어간 피해
 */
function leech(
  who: string, me: OwnedChar, dealt: number,
  hex: readonly Hex[], hp: Record<string, number>,
): Record<string, number> {
  const pct = Math.max(0, upOf(hex, 'st_leech') - 1);
  if (pct <= 0 || dealt <= 0) return hp;
  const got = Math.max(1, Math.round(dealt * pct));
  const max = statOf(me).hp;
  const cur = hpOf(me, hp);
  /* 쓰러진 사람은 안 찬다 — 회복이 전멸을 취소하면 아무도 안 죽는다 */
  if (cur <= 0) return hp;
  return { ...hp, [who]: Math.min(max, cur + got) };
}

export function applyHit(
  st: BattleState,
  who: string,
  party: Party,
  chars: Record<string, OwnedChar>,
  rand: () => number = Math.random,
  /** 화면이 이미 고른 자리. 없으면 여기서 고른다 (시험·서버용) */
  aim?: number,
  /**
   * 이 한 대의 배수 — 기본은 1.
   *
   * 비앙카의 과열이 쓴다 (`core/skillTree` 의 `ba4`): 세 번째 평타마다 두
   * 번 치는데 **둘째 대만** 150% 다. 같은 함수를 두 번 부르되 두 번째에
   * 1.5 를 넘긴다.
   *
   * 기술의 배수(`SkillDef.mul`)와 자리가 다르다. 저건 표에 적힌 기술의
   * 세기이고 이건 **이번 한 대에만** 붙는 값이라, 같은 칸에 담으면 평타가
   * 기술인 척하게 된다.
   */
  mul = 1,
  /**
   * 혼란일 때 **화면이 이미 고른 아군**.
   *
   * `aim` 과 같은 규칙이다 — 화면과 계산이 각자 굴리면 맞는 놈과 닳는 놈이
   * 갈린다. 다만 이쪽은 그 이유가 하나 더 있다: 돌아선 사람이 **어느 쪽을
   * 보고 서느냐**가 이 값에서 나온다 (`BattleView` 의 `faceLeft`).
   *
   * 여기서 굴리면 대상이 정해지는 순간이 **주먹이 닿는 순간**이라, 화면은
   * 스윙이 다 끝난 뒤에야 누구를 쳤는지 알게 된다. 그래서 뒤에 선 아군을
   * 치면서 앞을 보고 있었다.
   *
   * 살아 있는 다른 파티원이 아니면 무시하고 여기서 고른다 (시험·서버용).
   */
  ally?: string | null,
): TickResult {
  const me = chars[who];
  /* 쓰러져 있거나, 파티에 없거나, 적이 없으면 헛스윙이다 */
  if (!me || !party.includes(who as never) || st.down > 0 || !st.foes.length) {
    return { battle: st, ev: NOTHING };
  }
  if (hpOf(me, st.hp) <= 0) return { battle: st, ev: NOTHING };

  const mine = statOf(me);

  /*
    ── 돌아섰다 ── 적이 아니라 **아군**을 친다 (24판 혼란 · 29판 광란).

    맞은 사람이 아니라 **때리는 사람** 쪽에서 갈래를 튼다. 이쪽이 아니면
    "적을 쳤는데 아군이 아팠다" 가 되어, 화면이 검기를 어디로 날려야 할지도
    피해가 어디서 나왔는지도 설명할 수 없다.

    **평타만, 무작위로 하나.** 스킬은 안 나간다 — 정화가 저를 푸는 그림이
    되고, 화살비가 아군 셋을 치면 그 한 판으로 전투가 끝난다.

    파티 배수(아녜스의 +10%)는 안 얹는다. 저건 "아군을 돕는 값" 이라, 아군을
    치는 데 얹히면 사제가 있을수록 서로를 잘 죽이게 된다.
  */
  if (st.charm && st.charm.ms > 0 && st.charm.who.includes(who)) {
    const mates = members(party, chars)
      .filter((c) => c.id !== who && hpOf(c, st.hp) > 0);
    /* 혼자 남았으면 칠 사람이 없다 — 헛스윙이다 */
    if (!mates.length) return { battle: st, ev: NOTHING };
    /*
      화면이 스윙을 시작할 때 골라 뒀으면 **그 사람**이다 (`ally`).

      그 사이에 쓰러졌으면 (스윙 하나가 300ms 쯤 된다) 여기서 다시 고른다 —
      시체를 때리면 피해가 어디로 갔는지 설명할 수 없다.
    */
    const aimed = ally ? mates.find((c) => c.id === ally) : undefined;
    const it = aimed ?? mates[Math.floor(rand() * mates.length) % mates.length];
    const hurt = Math.max(1, strikeFor(
      mine.atk, rollCrit(mine, rand, hexOf(st.hex, who)),
      liveArmor(it, hexOf(st.hex, it.id)), blowOf(me.id),
    ));
    const left = Math.max(0, hpOf(it, st.hp) - hurt);
    return {
      battle: { ...st, hp: { ...st.hp, [it.id]: left } },
      ev: {
        ...NOTHING, taken: hurt, hurt: it.id, fell: left <= 0 ? it.id : null,
      },
    };
  }

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
  /*
    ── 지금 이 사람이 실제로 내는 힘 ──

    원래 공격력에 **파티 패시브**(아녜스의 +10%)와 **약화**가 같이 걸린다
    (`core/passives`). 쓰러진 사람의 패시브는 안 센다 — 그래서 사제가 죽으면
    남은 셋의 피해가 그 자리에서 떨어진다.
  */
  /* 쓰러졌지만 아직 사그라드는 중인 사람의 버프도 산다 (`FADE_MS`) */
  const alive = livingMembers(party, chars, st.hp, st.fade);
  const mineHex = hexOf(st.hex, who);
  const kind = foeAt(st, foes[at]);
  const dmg = Math.max(1, Math.round(strikeFor(
    mine.atk * allyAtkMul(alive) * mulOf(mineHex, 'st_weak') * mul,
    rollCrit(mine, rand, mineHex),
    /* 20판은 체력이 낮으면 방어가 오른다 (`foeArmor`) */
    foeArmor(kind, foes[at].hp), blowOf(me.id),
  ) * foeTough(kind)));
  /*
    ── 요정의 화살 ── 40% 로 한 번 더 (`feyShot`).

    같은 놈에게 간다. 다른 놈을 노리면 "때릴 때마다 한 번 더" 가 아니라
    별개의 공격이 되고, 화면에서는 아무도 안 쏜 화살이 엉뚱한 데 꽂힌다.
  */
  const fey = feyShot(mineHex, foeArmor(kind, foes[at].hp), rand);
  foes[at] = biteFoe(foes[at], dmg + fey);

  /*
    ── 반사 ──

    5판 가시 갑옷 하나뿐이다. 때린 사람이 받은 피해의 10%를 되돌려 받는다.

    **되돌아오는 것도 물리다** — 때린 사람의 방어력이 막는다. 그냥 체력에서
    빼면 방어를 올린 사람과 안 올린 사람이 똑같이 아파서, 이 게임에서 방어가
    유일하게 안 통하는 자리가 생긴다.
  */
  /* 때린 만큼 찬다 — 불굴의 의지가 켜져 있을 때만 (`leech`) */
  let hp = leech(who, me, dmg, mineHex, st.hp);
  const back = kind.passive?.reflect ?? 0;
  if (back > 0) {
    const bite = strikeFor(
      Math.round(dmg * back), 1, liveArmor(me, mineHex), PHYS_BLOW,
    );
    hp = { ...hp, [who]: Math.max(0, hpOf(me, hp) - bite) };
  }

  if (foes[at].hp > 0) {
    return {
      battle: { ...st, foes, hp, target: at },
      /*
        합쳐서 한 숫자로 보낸다. 다만 요정의 화살 몫은 **따로도** 내보낸다 —
        화면이 그 한 대만 작은 화살로 따로 그린다 (`ev.fey`).
      */
      ev: { ...NOTHING, hit: dmg + fey, fey },
    };
  }

  // ── 잡았다 ──
  const gone = foes[at];
  foes.splice(at, 1);
  /*
    ── 죽으면서 나오는 것 ── 26판 최후의 발악 하나뿐이다.

    **여기서 해야 한다.** 우두머리가 죽으면 그 자리에서 판이 끝나므로
    (`clearIn`), 다음 틱을 기다리면 애벌레가 설 자리가 이미 없다.
  */
  const down = onFoeDown(st, gone, foes, st.seq);
  foes.push(...down.born);
  /*
    ── 우두머리 판의 보상은 **줄이 빌 때 한 번** ──

    21판 지네는 둘로 갈라지고 30판 바알은 분신을 만든다. 마리마다 주면
    갈라지는 우두머리가 안 갈라지는 우두머리보다 두 배를 준다 — 기믹이
    보상이 되어 버린다.

    잡몹은 그대로 마리당이다. 저긴 원래 여러 마리를 잡는 구간이다.
  */
  const gold = st.boss && foes.length ? 0 : killGold(st.stage, st.boss);

  /*
    회복은 **살아 있는 사람에게만**, 각자 제 최대치의 비율로.

    쓰러진 사람까지 채워 주면 잡을 때마다 전멸이 취소되어 아무도 안 죽는다.
    일어나는 건 스테이지를 다시 시작할 때뿐이다.
  */

  /*
    ── 우두머리 판은 **줄이 빌 때** 끝난다 ──

    여태 `st.boss` 하나만 봤다. 우두머리가 늘 한 마리였으므로 "우두머리를
    잡았다 = 줄이 비었다" 가 같은 말이었기 때문이다.

    이제 아니다. 지네는 머리와 꼬리로 갈라지고, 바알은 분신을 만들고,
    피로스는 죽으면서 애벌레 넷을 남긴다. 머리를 잡았다고 판이 끝나면
    꼬리가 서 있는 채로 다음 판으로 넘어간다.
  */
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
        hp,
        seq: down.seq,
        slain: st.slain + 1,
        target: 0,
        clearIn: CLEAR_MS,
        clearKind: 'boss',
        goTo: nextStage(st.stage),
      },
      ev: {
        ...NOTHING, hit: dmg, killed: 1, cleared: true, gold,
        elixir: rollElixir(st.stage, rand),
      },
    };
  }

  /* 다음 놈은 **무작위로** 고른다 — 늘 맨 앞이면 한 자리만 계속 때린다 */
  return {
    battle: {
      ...st,
      foes,
      hp,
      seq: down.seq,
      slain: st.slain + 1,
      target: pickTarget(foes.length),
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
export function rollCrit(
  st: Stat,
  rand: () => number = Math.random,
  /**
   * 이 사람에게 걸려 있는 것들 — 집중(`st_focus`)이 확률을 올린다.
   *
   * **더하기다.** 배수로 두면 넷 중 셋이 치명타 확률 0 이라 아무 일도 안
   * 일어난다 (`upOf` 가 1.30 을 주고 0 × 1.3 은 0 이다). 그래서 여기서는
   * 1 을 뺀 만큼을 확률에 **더한다** — 0.30 을 올리면 0 이던 사람이 30% 가
   * 된다.
   */
  hex: readonly Hex[] = NO_HEX,
): number {
  const up = Math.max(0, upOf(hex, 'st_focus') - 1);
  return rand() < Math.min(1, st.crit + up) ? st.critDmg : 1;
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
  const sk = skillsFor(me)[slot] ?? skillOf(me.id);
  const mine = statOf(me);
  /*
    치명타는 안 셈한다 — 화면에 미리 적는 값이라 늘 같아야 한다.

    맞는 쪽도 안 본다 (`NO_ARMOR`). 적마다 다른 값을 여기서 정할 수가
    없어서, "맨몸에 몇 들어가나" 를 적는다. 그래서 관통이 있어도 이 숫자는
    안 바뀐다 — 뚫을 것이 애초에 0 이다.
  */
  return strikeFor(
    skillBase(mine, sk, allyAtk(party, chars)), 1, NO_ARMOR, blowOf(me.id, sk),
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
  let pool = [...all];
  const out: number[] = [];
  /*
    ── 겹쳐도 되는 기술이 하나 있다 ── (`SkillDef.stack`)

    리안느가 강화된 화살을 찍으면 화살이 넷이 되는데, 적이 하나뿐이면
    겹치기 금지 때문에 셋이 허공으로 사라진다. 그때는 뽑을 놈이 떨어질
    때마다 목록을 **다시 채운다** — 적이 하나면 네 발이 다 그 하나에게,
    넷이면 넷에게 하나씩이다.

    그래서 상한도 달라진다: 평소에는 서 있는 마릿수까지지만, 겹쳐도 되면
    `targets` 만큼 끝까지 뽑는다.
  */
  const n = sk.stack ? sk.targets : Math.min(sk.targets, pool.length);
  for (let i = 0; i < n; i++) {
    if (!pool.length) pool = [...all];
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
  /** 지금 걸려 있는 것들 — 시듦(`st_wither`)이 있으면 받는 양이 깎인다 */
  hex?: Record<string, Hex[]>,
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
    /*
      **받는 쪽이 깎는다.** 14판 독성 포자가 거는 시듦이라, 시전자가 아니라
      맞은 사람에게 걸려 있다 — 사제 한 명에게 걸렸다고 넷의 회복이 다
      깎이면 사양과 다르다.
    */
    const mine = Math.round(amount * healMulOf(hexOf(hex, c.id)));
    /* 쓰러진 사람은 안 채운다 — 회복이 전멸을 되돌리면 아무도 안 죽는다 */
    out[c.id] = cur <= 0 ? 0 : Math.min(mx, cur + mine) - cur;
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
  /*
    **이름으로 찾는다** — 참조가 아니라.

    `skillsFor` 는 트리가 손본 기술을 **새 객체**로 돌려주므로 (`core/chars`),
    참조로 비교하면 갈래를 찍은 사람의 회복 기술만 시전자를 못 찾아 회복이
    통째로 사라진다. 이름은 표에서 오는 값이라 손봐도 안 바뀐다.
  */
  for (const c of members(party, chars)) {
    if (skillsFor(c).some((x) => x.name === sk.name)) return c.id;
  }
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
  /**
   * 사람이 고른 스킬 설정 (`core/skillOpt` 의 `optKey`).
   *
   * 정화 하나가 읽는다. 안 주면 기본값(전부 걷음)으로 본다 — 서버 계산과
   * 검사에서는 설정이 없다.
   */
  opts?: Record<string, string>,
): TickResult {
  const me = chars[who];
  if (!me || !party.includes(who as never) || st.down > 0) {
    return { battle: st, ev: NOTHING };
  }
  if (hpOf(me, st.hp) <= 0) return { battle: st, ev: NOTHING };

  const sk = skillsFor(me)[slot] ?? skillOf(me.id);

  /*
    ── 도발 — 적 전부를 자기 쪽으로 ──

    적을 안 건드리므로 적이 없어도 나간다... 는 아니다. 아무도 안 서 있는데
    포효하면 코스트만 버린다. 서 있는 놈이 있을 때만 건다.
  */
  if (sk.taunt) {
    if (!st.foes.length) return { battle: st, ev: NOTHING };
    return {
      battle: {
        ...st,
        taunt: {
          who,
          ms: Math.round(sk.taunt * 1000),
          /*
            **그 순간 서 있던 놈들**만 적어 둔다.

            안 적어 두면 10초 안에 걸어 들어온 무리까지 걸려서, 포효 한 번이
            잡몹 구간의 영구 방벽이 된다. 소리는 그 자리에 있던 놈만 듣는다.
          */
          foes: st.foes.map((f) => f.id),
        },
      },
      /* 피해도 회복도 0 이라 `ev` 로는 아무 일도 안 일어난 것처럼 보인다.
         부르는 쪽(`state/slices/roster`)이 그걸로 판단하면 안 되므로
         `applied` 를 켜서 "상태는 바뀌었다" 를 알린다 */
      ev: { ...NOTHING, applied: true },
    };
  }

  /*
    ── 자기 강화 — 리안느의 광란 ──

    적이 없어도 나간다. 다음 무리가 걸어 들어오기 직전에 켜 두는 것이
    이상한 일이 아니다.
  */
  /*
    ── 파티 전체에 거는 것 ── 리안느의 정령의 노래 하나다 (`SkillDef.party`).

    `self` 바로 앞에 둔다. 한 기술이 둘 다 갖는 일은 없지만, 앞뒤가 갈리면
    나중에 둘 다 가진 기술이 생겼을 때 어느 쪽이 이기는지가 자리 순서로
    정해진다 — 그건 표에 안 적혀 있는 규칙이다.

    **쓰러진 사람은 안 건다.** 시체에 붙은 버프는 거짓말이고, 다시 일어서는
    길이 판을 다시 시작하는 것뿐이라 그때는 어차피 다 걷힌다.
  */
  /*
    ── 보호막을 씌운다 ── 이졸데의 수호의 결의 (`SkillDef.ward`).

    양은 **쓰는 사람**의 최대 체력에서 나온다. 맞는 사람 기준이면 두꺼운
    사람이 두꺼운 막을 받는데, 그건 이미 두꺼운 쪽을 더 두껍게 만드는
    것이라 얇은 사람이 먼저 죽는 것은 그대로다.

    이미 두르고 있으면 **더 두꺼운 쪽으로 새로 고친다** — 남은 시간도 긴
    쪽이다. 겹쳐 쌓으면 8초 안에 두 번 쓰는 것이 늘 최선이 되고, 얇은 막이
    두꺼운 막을 덮으면 두 번째로 쓴 것이 손해가 된다.
  */
  if (sk.ward) {
    /* `mine` 은 아래에서 잡는다 — 여기서는 쓰는 사람 몸을 직접 읽는다 */
    const amount = Math.max(1, Math.round(statOf(me).hp * sk.ward.pct));
    const ms = Math.round(sk.ward.sec * 1000);
    const ward: Record<string, Ward> = { ...(st.ward ?? {}) };
    for (const c of members(party, chars)) {
      if (hpOf(c, st.hp) <= 0) continue;
      const was = ward[c.id];
      ward[c.id] = {
        hp: Math.max(amount, was?.hp ?? 0),
        ms: Math.max(ms, was?.ms ?? 0),
        def: Math.max(sk.ward.def, was?.def ?? 0),
        back: Math.max(sk.ward.back, was?.back ?? 0),
      };
    }
    return { battle: { ...st, ward }, ev: { ...NOTHING, applied: true } };
  }

  if (sk.party || sk.partyProc) {
    const hex: Record<string, Hex[]> = { ...st.hex };
    /*
      ── 미니 화살의 세기는 **거는 순간** 숫자로 굳는다 ──

      `Hex.dot` 과 같은 이유다. 리안느가 아닌 사람이 때릴 때도 이 값이어야
      하고, 리안느가 그 사이에 쓰러져도 5초는 남는다 — 계수만 들고 있으면
      그때 누구의 공격력을 읽을지가 없어진다.
    */
    const procHit = sk.partyProc
      ? Math.max(1, Math.round(statOf(me).atk * sk.partyProc.pct))
      : 0;
    for (const c of members(party, chars)) {
      if (hpOf(c, st.hp) <= 0) continue;
      let put: Hex[] = [...hexOf(st.hex, c.id)];
      if (sk.party) {
        put = putHex(put, {
          id: sk.party.id,
          ms: Math.round(sk.party.sec * 1000),
          dot: 0, dmg: 'magic', mul: sk.party.mul, n: 1,
        }, 1);
      }
      /* 앞엣것 위에 쌓는다 — 원본을 다시 읽으면 `party` 로 건 것이 사라진다 */
      for (const more of sk.partyAlso ?? []) {
        put = putHex(put, {
          id: more.id,
          ms: Math.round(more.sec * 1000),
          dot: 0, dmg: 'magic', mul: more.mul, n: 1,
        }, 1);
      }
      if (sk.partyProc) {
        put = putHex(put, {
          id: sk.partyProc.id,
          ms: Math.round(sk.partyProc.sec * 1000),
          dot: 0, dmg: 'magic', mul: 1, n: 1,
          proc: { odds: sk.partyProc.odds, hit: procHit },
        }, 1);
      }
      hex[c.id] = put;
    }
    return { battle: { ...st, hex }, ev: { ...NOTHING, applied: true } };
  }

  if (sk.self) {
    let put = putHex(hexOf(st.hex, who), {
      id: sk.self.id,
      ms: Math.round(sk.self.sec * 1000),
      dot: 0,
      dmg: 'magic',
      mul: sk.self.mul,
      n: 1,
    }, 1);
    /*
      한 기술이 여럿을 걸 수 있다 (`SkillDef.selfAlso`) — 비앙카의 불굴의
      의지가 셋을 한꺼번에 건다.

      **앞엣것 위에 쌓는다.** `hexOf(st.hex, who)` 를 다시 읽으면 `self` 로
      건 것이 통째로 사라진다 — 공격력 두 배가 조용히 없어지고 면역만 남는다.
    */
    for (const more of sk.selfAlso ?? []) {
      put = putHex(put, {
        id: more.id,
        ms: Math.round(more.sec * 1000),
        dot: 0,
        dmg: 'magic',
        mul: more.mul,
        n: 1,
      }, 1);
    }
    return {
      battle: { ...st, hex: { ...st.hex, [who]: put } },
      ev: { ...NOTHING, applied: true },
    };
  }

  /*
    ── 정화 — 걸린 나쁜 것을 걷어낸다 ──

    무엇을 걷을지는 사람이 고른 설정이 정한다 (`core/skillOpt`). **걷을 것이
    없으면 아무 일도 안 일어난다** — 그런 상황에서 애초에 안 나가게 막는 것은
    화면 쪽이지만 (`readySkill` 의 `allow`), 여기서도 한 번 더 본다: 손을
    떠나고 닿기까지의 사이에 상태가 바뀔 수 있다.
  */
  if (sk.cleanse) {
    const opt = cleanseOptOf(opts, who, slot);
    const hex: Record<string, Hex[]> = { ...st.hex };
    let any = false;
    /*
      ── 찬란한 빛 ── 아군 전체에 걸리고 축복을 남긴다 (`SkillDef.cleanseAll`).

      평소 정화는 **걷을 것이 있는 사람만** 고른다. 이 갈래는 걷는 것이
      아니라 덮는 것이라, 아무도 안 걸려 있어도 나가야 한다 — 그래야
      "다음 3초 동안 안 걸린다" 를 미리 쓸 수 있다.
    */
    if (sk.cleanseAll && sk.cleanseGift) {
      const gift = sk.cleanseGift;
      for (const c of members(party, chars)) {
        if (hpOf(c, st.hp) <= 0) continue;
        /* 먼저 걷고, 그 위에 축복을 얹는다 — 순서가 반대면 축복이 같이 걷힌다 */
        const swept = cleansed(opt, hexOf(st.hex, c.id));
        hex[c.id] = putHex([...swept], {
          id: gift.id,
          ms: Math.round(gift.sec * 1000),
          dot: 0, dmg: 'magic', mul: gift.mul, n: 1,
        }, 1);
        any = true;
      }
      return { battle: { ...st, hex }, ev: { ...NOTHING, applied: any } };
    }
    for (const c of members(party, chars)) {
      if (hpOf(c, st.hp) <= 0) continue;
      const was = hexOf(st.hex, c.id);
      const now2 = cleansed(opt, was);
      if (now2 === was) continue;
      any = true;
      if (now2.length) hex[c.id] = [...now2];
      else delete hex[c.id];
    }
    if (!any) return { battle: st, ev: NOTHING };
    return { battle: { ...st, hex }, ev: { ...NOTHING, applied: true } };
  }

  /* ── 회복형 — 적은 안 건드린다 ── */
  if (sk.heal > 0) {
    const plan = healPlan(sk, party, chars, st.hp, st.hex);
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
  const alive = livingMembers(party, chars, st.hp, st.fade);
  const mineHex = hexOf(st.hex, who);
  /* 파티 패시브와 약화가 같이 걸린다 — 평타(`applyHit`)와 같은 값이어야 한다 */
  const sup = allyAtkMul(alive) * mulOf(mineHex, 'st_weak');
  let hit = 0;
  let killed = 0;
  /** 5판 가시 갑옷이 되돌려 준 양 */
  let bite = 0;

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
  /*
    맞은 적에게 거는 것 — 비앙카의 화산이 거는 시듦 하나다.

    **마리의 고유 번호로** 적어 둔다 (`BattleState.foeHex`). 자리 번호로
    잡으면 이 스킬로 앞줄이 죽는 순간 남은 놈들의 번호가 밀려서, 방금 건
    시듦이 엉뚱한 놈에게 옮겨 간다.
  */
  const foeHex: Record<number, Hex[]> = { ...(st.foeHex ?? {}) };
  for (const i of idx) {
    const kind = foeAt(st, foes[i]);
    const dmg = Math.max(1, Math.round(strikeFor(
      /* 스킬에도 집중이 걸린다 — 평타만 오르면 "치명타 확률" 이 반쪽이다 */
      skillBase(mine, sk, sup), rollCrit(mine, rand, mineHex),
      foeArmor(kind, foes[i].hp), blow,
    ) * foeTough(kind)));
    /*
      맞은 놈에게 거는 것 — 최대 둘 (`SkillDef.foeHex` · `foeHex2`).

      **이미 건 것 위에 쌓는다.** 둘째를 걸 때 원본(`st.foeHex`)을 다시
      읽으면 첫째가 통째로 사라진다 — 신의 천벌이 둔화만 걸고 약화를
      지우는 셈이 된다.
    */
    /*
      ── 지속 피해를 건다 ── 비앙카의 용암 지대 (`SkillDef.foeDot`).

      **계수가 아니라 실제 숫자**로 바꿔서 담는다 (`Hex.dot`). 건 사람이
      죽고 나서도 불은 계속 타는데, 계수만 들고 있으면 그때 공격력을
      어디서 읽을지가 없어진다.

      쓰는 사람의 지금 공격력을 본다 (`mine.atk` — 파티 배수와 약화가 이미
      얹힌 값이 아니라 맨 공격력이다). 지속 피해까지 파티 배수를 타면
      아녜스가 서 있을 때만 불이 세지는데, 그건 표에 안 적혀 있다.
    */
    if (sk.foeDot) {
      foeHex[foes[i].id] = putHex(
        foeHex[foes[i].id] ?? foeHexOf(st.foeHex, foes[i].id),
        {
          id: sk.foeDot.id,
          ms: Math.round(sk.foeDot.sec * 1000),
          dot: Math.max(1, Math.round(mine.atk * sk.foeDot.pct)),
          dmg: sk.foeDot.dmg,
          mul: 1,
          n: 1,
        },
        1,
      );
    }
    for (const spec of [sk.foeHex, sk.foeHex2]) {
      if (!spec) continue;
      foeHex[foes[i].id] = putHex(
        foeHex[foes[i].id] ?? foeHexOf(st.foeHex, foes[i].id),
        {
          id: spec.id,
          ms: Math.round(spec.sec * 1000),
          dot: 0,
          dmg: 'magic',
          mul: spec.mul,
          n: 1,
        },
        1,
      );
    }
    /* 기술 한 대에도 요정의 화살이 붙는다 — 맞은 놈마다 따로 굴린다 */
    const fey = feyShot(mineHex, foeArmor(kind, foes[i].hp), rand);
    foes[i] = biteFoe(foes[i], dmg + fey);
    hit += dmg + fey;
    /* 여러 마리를 치는 기술은 **친 만큼** 되돌아온다 (`applyHit` 과 같은 규칙) */
    const back = kind.passive?.reflect ?? 0;
    if (back > 0) {
      bite += strikeFor(
        Math.round(dmg * back), 1, liveArmor(me, mineHex), PHYS_BLOW,
      );
    }
  }

  /*
    ── 반사로 받은 것과 흡혈로 채운 것 ──

    **흡혈이 나중이다.** 반사를 먼저 빼야 "이번 한 번에 얼마나 오갔나" 가
    실제 순서와 같다 — 기술이 나가고, 가시에 찔리고, 빤 만큼 찬다.

    `hit` 은 이번 기술이 **적에게 실제로 넣은 합**이라 그걸 기준으로 빤다
    (여러 마리를 치는 기술은 친 만큼 다 빨린다).
  */
  const hurtSelf = bite > 0
    ? { ...st.hp, [who]: Math.max(0, hpOf(me, st.hp) - bite) }
    : st.hp;
  const hp = leech(who, me, hit, mineHex, hurtSelf);

  /* 죽은 놈을 걷어낸다 — 뒤에서부터 지워야 인덱스가 안 밀린다 */
  let seq = st.seq;
  const born: FoeSlot[] = [];
  for (let i = foes.length - 1; i >= 0; i--) {
    if (foes[i].hp > 0) continue;
    /* 죽으면서 나오는 것 (26판) — 평타 쪽과 같은 규칙이다 */
    const down = onFoeDown(st, foes[i], foes, seq);
    seq = down.seq;
    born.push(...down.born);
    foes.splice(i, 1);
    killed += 1;
  }
  foes.push(...born);

  if (!killed) {
    return { battle: { ...st, foes, hp, foeHex }, ev: { ...NOTHING, hit } };
  }
  /* 죽은 놈에게 걸려 있던 것은 같이 지운다 — 번호가 남으면 영영 안 없어진다 */
  for (const id of Object.keys(foeHex)) {
    if (!foes.some((f) => f.id === Number(id))) delete foeHex[Number(id)];
  }

  /* 우두머리 판은 줄이 빌 때 한 번만 준다 (`applyHit` 과 같은 규칙) */
  const gold = st.boss
    ? (foes.length ? 0 : killGold(st.stage, true))
    : killGold(st.stage, false) * killed;


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
        hp,
        seq,
        slain: st.slain + killed,
        target: 0,
        foeHex,
        clearIn: CLEAR_MS,
        clearKind: 'boss',
        goTo: nextStage(st.stage),
      },
      ev: { ...NOTHING, hit, killed, cleared: true, gold, elixir: rollElixir(st.stage, rand) },
    };
  }

  return {
    battle: {
      ...st,
      foes,
      hp,
      seq,
      foeHex,
      slain: st.slain + killed,
      target: pickTarget(foes.length, rand),
    },
    ev: { ...NOTHING, hit, killed, gold },
  };
}
