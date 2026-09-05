/**
 * 파티원 한 명 — 제 박자로 **실제로 검을 휘두른다.**
 *
 * ## 처음엔 안 휘둘렀다
 *
 * `strike` 한 장을 계속 띄워 놓고 몸만 앞뒤로 움직였다. 그래서 "휘두르는 것"
 * 이 아니라 "칼 든 사람이 앞뒤로 흔들리는 것" 으로 보였다.
 *
 * `duel/` 네 장이 이미 완결된 스윙이다.
 *
 *   guard   — 서 있다. 검을 내리고 방패를 올린 자세
 *   windup  — 검을 머리 위로 치켜든다
 *   strike  — 앞으로 내디디며 내려친다 (여기서 맞는다)
 *   recover — 자세를 되돌린다
 *
 * 이 넷을 순서대로 넘기면 그게 스윙이다. 프레임을 더 그릴 필요가 없었고,
 * 안 돌리고 있었을 뿐이다.
 *
 * ## 박자
 *
 * 공격 간격(`spd`)의 대부분은 `guard` 로 서 있고, 마지막 320ms 동안만
 * 치켜들고 내려치고 되돌아온다. 스윙이 간격 전체에 퍼지면 늘어져 보인다 —
 * **기다리다 한 번에 빠르게** 가 때리는 느낌을 만든다.
 *
 * ## 계산과 분리돼 있다
 *
 * 실제 피해는 스토어가 0.5초마다 파티 전체를 한 덩어리로 굴린다
 * (`core/autoBattle`). 여기서 하는 건 **보이는 것**뿐이다. 그래서 연출을
 * 아무리 늘려도 수치가 틀어질 자리가 없다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Row } from '@/ui/atoms';
import {
  CHARS, HitFx, OwnedChar, SkillDef,
  chargeUp, cutCharge, newCharge, readySkill, skillOf, skillOpen, skillsFor,
  skillsOf, spendCharge, statOf, swingMs,
} from '@/core/chars';

import { Sprite } from '@/ui/Sprite';
import { spriteGap, spriteLoose } from '@/ui/spriteAssets';
import type { Mark } from '@/core/passives';
import { BodyKind, Bound, BossBodyFx, Charmed, Shocked, Veil } from './BossFx';
import { BAD_C, WHITE } from '@/ui/theme';
import { ZOOM, depthAt } from './Ground';
import {
  CcTag, DamageNumber, HealMarks, HitBurst, HurtTint, MarkNotes, SkillShout,
} from './HitFx';
import { SwordWave, flyMsOf } from './SwordWave';
import { SkillAura } from './SkillAura';
import { BodyFlash, SkillFx } from './SkillFx';

/**
 * 베는 동작 세 칸의 길이 (ms).
 *
 * 셋을 같은 길이로 두면 기계적으로 보인다. **가운데(맞는 순간)가 제일 짧다** —
 * 빠르게 지나가야 세게 친 것처럼 보이고, 앞뒤가 길어야 힘을 모았다 푸는
 * 느낌이 난다.
 */
/** 쓰러진 자세를 그대로 보여 주는 시간 — 읽을 만큼만 */
const FALL_HOLD_MS = 500;
/** 그 뒤 흐려져 사라지는 데 걸리는 시간 */
const FALL_FADE_MS = 600;

const CUT_MS = [120, 70, 100];
export const SWING_MS = CUT_MS.reduce((a, b) => a + b, 0);

/**
 * 베기 네 칸. `<id>_cut` 이 아니라 캐릭터 폴더에 같이 들어간다
 * (`docs/character-art/` §D).
 *
 * 아직 §D 를 안 받은 캐릭터는 §A 의 세 프레임으로 떨어진다 — 넷을 셋에
 * 매핑하므로 동작이 조금 뚝뚝하지만 빠지는 그림은 없다.
 */
const CUT_FRAMES = ['cut_1', 'cut_2', 'cut_3'] as const;
const CUT_FALLBACK: Record<string, string> = {
  cut_1: 'windup', cut_2: 'strike', cut_3: 'recover',
};

/** 맞는 순간 — 검이 몸 앞을 지나는 가운데 칸 */
const HIT_AT = CUT_MS[0];

/**
 * 스킬 세 칸의 길이 (ms) — 당김 · 벰 · 놓음.
 *
 * 당김을 180 → 140 으로 줄이고, 베는 칸을 110 → 150 으로 늘렸다.
 * 검기가 나가는 건 베는 칸이 시작할 때인데, 그 칸이 110ms 밖에 안 되니
 * **검기가 몸에서 벗어나기도 전에 다음 칸으로 넘어갔다.** 그래서 "휘리릭
 * 하고 난 다음에 나간다" 로 보였다.
 *
 * 베는 칸이 길어야 검기가 떠나는 게 그 칸 안에서 보인다.
 */
const SK_MS = [140, 150, 200];

/*
  기술마다 다른 박자는 `core/chars` 의 `SkillDef.beat` 에 있다.

  예전에는 도약 것만 여기 상수로 뒀는데, 기도가 들어오면서 둘이 됐다.
  세 번째가 생기면 또 여기에 상수가 늘고, 어느 기술이 어느 박자를 쓰는지가
  두 파일에 나뉜다. 기술의 성질이므로 기술 쪽에 둔다.
*/

/**
 * 얼마나 높이 솟나 (px).
 *
 * 무대가 138px 이고 발이 바닥에서 14px 위에 서 있으므로, 54px 짜리 몸이
 * 52px 을 더 올라가면 머리가 무대 천장 16px 아래까지 간다. 화면 밖으로
 * 나가기 직전까지가 제일 높이 뛴 것으로 보인다.
 */
const LEAP_UP = Math.round(52 * ZOOM);
const SK_FRAMES = ['sk_1', 'sk_2', 'sk_3'] as const;

/**
 * **두 번째 기술**의 동작 칸 (`docs/character-art/` §F).
 *
 * ## 왜 칸을 따로 두나
 *
 * 넷이 기술을 하나씩 가지던 때는 `sk_1..3` 하나면 됐다. 이제 둘씩 가지는데,
 * 같은 칸을 쓰면 **이졸데가 도발할 때 검기와 똑같은 몸짓을 한다** — 코스트가
 * 15 인 기술이 4 짜리와 화면에서 구분이 안 된다.
 *
 * ## 아직 안 받았으면 첫 기술 칸으로 떨어진다
 *
 * 그림은 나눠서 들어온다. `sk2_*` 가 없는 동안에도 게임은 돌아야 하므로
 * `skFramesOf` 가 있는지 보고 고른다 — 도착하는 순간 저절로 바뀐다.
 *
 * `Sprite` 의 `fallbackSet` 으로는 안 된다. 저건 한 단계뿐인데 여기는
 * `sk2_N` → `sk_N` → `duel/cut_N` 로 두 단계가 필요하고, 두 번째 단계는
 * 이미 쓰고 있다.
 */
const SK2_FRAMES = ['sk2_1', 'sk2_2', 'sk2_3'] as const;

/** 셋째 동작 — 스킬 트리가 여는 큰 기술 셋이 쓴다 (`SkillDef.pose`) */
const SK3_FRAMES = ['sk3_1', 'sk3_2', 'sk3_3'] as const;

/**
 * 이 **기술**이 쓸 동작 칸 셋.
 *
 * 여태 **자리 번호**로 골랐다 (0번이면 `sk`, 그 위면 `sk2`). 기술이 한 명당
 * 둘일 때는 같은 말이었는데, 스킬 트리가 생기면서 갈렸다 — 자리 번호가
 * 트리를 어떻게 찍었느냐에 따라 밀리기 때문이다 (`core/chars` 의
 * `SkillDef.pose` 에 그 이야기를 적어 두었다).
 *
 * 시트가 아직 없으면 **한 단계씩 물러난다**: `sk3` → `sk2` → `sk`.
 * `Sprite` 의 `fallbackSet` 으로는 안 된다 — 저건 한 단계뿐이다.
 */
function skFramesOf(id: string, sk: SkillDef): readonly string[] {
  const want = sk.pose ?? 'sk';
  if (want === 'sk3' && SK3_FRAMES.every((f) => spriteLoose(id, f))) return SK3_FRAMES;
  if (want !== 'sk' && SK2_FRAMES.every((f) => spriteLoose(id, f))) return SK2_FRAMES;
  return SK_FRAMES;
}

/**
 * 스킬의 `landOn` 번째 칸이 **시작하는** 시각 (ms).
 *
 * 기술마다 닿는 칸이 다르다 — 검기는 베는 2번 칸에서 떠나고, 도약은 착지하는
 * 3번 칸에서 터진다. 이걸 안 나누면 비앙카가 공중에 뜬 채로 적이 죽는다.
 */
function landAtOf(spans: readonly number[], landOn: number): number {
  let t = 0;
  for (let i = 0; i < landOn - 1; i++) t += spans[i];
  return t;
}

/**
 * 검기가 떠나는 순간 — 두 번째 칸(**베는 칸**)이 시작할 때.
 *
 * 처음엔 그 칸이 **끝날 때** 로 뒀다가 옮겼다. 베는 그림이 다 지나간 뒤에
 * 검기가 나가니, 칼은 이미 멈춰 있는데 뒤늦게 뭔가 튀어나왔다.
 * 검을 휘두르는 그 프레임에 같이 나가야 "베면서 날렸다" 로 보인다.
 */
const WAVE_AT = SK_MS[0];

/** 스킬을 못 받은 캐릭터는 평타 프레임으로 떨어진다 */
const SK_FALLBACK: Record<string, string> = {
  sk_1: 'cut_1', sk_2: 'cut_2', sk_3: 'cut_3',
  /* §F 를 아직 안 받았으면 여기까지 안 온다 (`skFramesOf`) — 그래도 적어 둔다 */
  sk2_1: 'cut_1', sk2_2: 'cut_2', sk2_3: 'cut_3',
  sk3_1: 'cut_1', sk3_2: 'cut_2', sk3_3: 'cut_3',
};

export interface Swing {
  /** 누가 쳤나 */
  id: string;
  /** 그 캐릭터의 이펙트 */
  fx: HitFx;
  /** 띄울 숫자 */
  dmg: number;
  /**
   * 이 한 대의 배수 — 기본은 1 (`core/autoBattle` 의 `applyHit`).
   *
   * 비앙카의 과열이 쓴다: 세 번째 평타마다 두 번 치는데 둘째 대가 150% 다.
   */
  mul?: number;
  /** 크게 터지나 — 과열의 둘째 대 */
  blast?: boolean;
}

/** 과열의 둘째 대가 몇 배인가 (`core/skillTree` 의 `ba4`) */
const HEAT_MUL = 1.5;

/** 아무것도 안 하는 콜백 — 매 렌더마다 새로 만들면 애니메이션이 되감긴다 */
const NOOP = () => {};

type Frame = 'guard' | 'lose'
  | (typeof CUT_FRAMES)[number]
  | (typeof SK_FRAMES)[number]
  | (typeof SK2_FRAMES)[number];

function FighterView({
  ch, back, down, hp, spd, stun, silent, held, noCharge, canCast, costSeq,
  struck, purify, cut, onCharge, damage, bless, advance, leapTo, marks, markKey,
  live, hitNo, hitKind, cc, bound, boundWeb, charmed, warded, shock, turn,
  x, width, onAim, onSwing, onSkill,
}: {
  ch: OwnedChar;
  /**
   * 줄 깊이 — **0 이 앞줄, 1 이 뒷줄** (`core/party` 의 `FORMATIONS`).
   *
   * 예전에는 파티 자리 번호였다 (0~3). 넷이 한 줄로 물러나며 섰기 때문인데,
   * 이제 두 줄이라 깊이는 둘뿐이다. 그 값으로 얼마나 올라가고 작아질지가
   * 나온다 (`Ground` 의 `depthAt`).
   */
  back: number;
  /**
   * 아군 구역 **왼쪽 끝에서 몇 px** 에 서나.
   *
   * 예전에는 가로줄 안에서 서로 겹쳐 세웠다 (`marginLeft` 에 음수). 대형이
   * 생기면서 자리가 **칸**으로 정해지므로 (다섯 칸 중 하나), 겹침으로는
   * 표현할 수가 없다 — `2-2` 는 ②④ 를 쓰고 그 사이 ③ 은 비어 있어야 한다.
   *
   * 그래서 자리를 밖에서 받아 절대 좌표로 선다. 무대가 대형과 화면 폭을
   * 다 알고 있으므로 (`BattleView`) 재는 곳도 거기다.
   */
  x: number;
  /** 파티 전체가 쓰러졌나 */
  down: boolean;
  /** 이 사람의 남은 체력 */
  hp: number;
  /**
   * **지금 실제로** 초당 몇 번 휘두르나.
   *
   * 원래 수치(`statOf`)가 아니다. 파티 패시브(리안느의 +0.1), 다칠수록
   * 빨라지는 것(비앙카), 둔화가 다 얹힌 값이다 (`core/passives` 의 `liveSpd`).
   *
   * 여기서 직접 안 재는 이유: 파티에 누가 살아 있는지와 지금 무엇이 걸려
   * 있는지를 알아야 하는데, 그건 무대(`BattleView`)가 아는 것이다. 계산과
   * 화면이 **같은 함수**를 써야 박자와 피해가 안 갈린다.
   */
  spd: number;
  /**
   * 기절했나 — 걸려 있으면 **아무것도 안 한다.**
   *
   * 쓰러진 것(`hp <= 0`)과 다르다. 서 있고 맞기도 하지만 못 움직인다.
   */
  stun: boolean;
  /** 침묵인가 — 기술을 못 쓴다. 평타는 그대로 나간다 */
  silent: boolean;
  /**
   * 판 연출 중인가 (`core/autoBattle` 의 `fightHeld`).
   *
   * ## 판이 열릴 때 검기가 날아오던 것
   *
   * 계산은 이미 막혀 있었다 (`strikeFoe`/`skillFoe` 가 `fightHeld` 를 본다).
   * 그런데 **몸은 계속 휘둘렀다.** 검은 막 뒤에서 스윙 순환이 돌다가, 막이
   * 걷히는 순간 이미 날아가고 있던 검기가 화면을 가로질렀다 — 아무도 아직
   * 안 싸우는데 검기만 지나갔다.
   *
   * 여기서 막으면 몸도 같이 멈춘다. 다시 풀릴 때 순환이 처음부터 시작하므로
   * (각자 다른 순간에) 판이 열리는 순간은 언제나 조용하다.
   */
  held: boolean;
  /**
   * 지금 스킬 코스트가 **안 차나** (리안느의 광란).
   *
   * 켜져 있는 동안 평타를 아무리 쳐도 칸이 안 오른다. 그게 없으면 광란이
   * 스스로를 되먹여서 늘 켜 두는 것이 정답이 된다 (`SKILLS.frenzy`).
   */
  noCharge: boolean;
  /**
   * 이 자리 기술을 **지금 실제로 쓸 수 있나.**
   *
   * 코스트가 다 차도 여기서 거절하면 안 나가고 **찬 채로 기다린다.** 정화가
   * "걷어낼 것이 없으면 안 쓴다" 를 이걸로 말한다 (`core/skillOpt`).
   *
   * 무대가 넘긴다 — 파티 전체에 무엇이 걸려 있는지는 저쪽이 안다.
   */
  canCast: (id: string, slot: number) => boolean;
  /**
   * 판이 바뀐 횟수 (`BattleState.costSeq`).
   *
   * 오를 때마다 코스트를 **0 으로** 되돌린다. 판을 넘나들며 모아 두는 것을
   * 막는다 — 앞 판에서 스무 번 때려 정화를 채워 놓고 우두머리 앞에서 꺼내는
   * 식이 되면, 코스트가 뜻하는 바가 사라진다.
   */
  costSeq: number;
  /**
   * 이 사람이 우두머리 특수기에 맞은 횟수 (`BattleState.struck`).
   *
   * 오를 때마다 몸이 **길게 세 번** 붉게 깜빡인다 (`HurtTint`). 평타로 맞는
   * 짧은 한 번과 세기가 달라서, 넷이 다 깜빡이면 전원기고 하나만 깜빡이면
   * 그 사람만 맞은 것으로 읽힌다.
   *
   * 맞은 기술의 **이름은 여기 안 붙는다.** 우두머리 머리 위에서 이미 외치고
   * 있어서, 맞은 사람 발밑에 또 달면 같은 말이 두 번 나온다.
   */
  struck: number;
  /**
   * 지금 이 사람에게 걸려 있는 것들 (`core/passives` 의 `marksOf`).
   *
   * 화면에 늘 그리는 것은 파티 칸이 맡는다 (`StatusRow`). 여기서는 **새로
   * 걸린 것만** 골라서 머리 위에 한 줄 띄운다.
   */
  marks: readonly Mark[];
  /**
   * 그 목록의 **열쇠만 이어 붙인 글자** — `passive_icon:pv_ash,status_icon:st_poison`.
   *
   * 배열은 매 렌더마다 새로 만들어지므로 참조로는 "바뀌었나" 를 물을 수가
   * 없다. 열쇠가 같으면 걸려 있는 것도 같다.
   */
  markKey: string;
  /**
   * 지금 실제로 싸우는 중인가 (`core/autoBattle` 의 `fightHeld` 를 뒤집은 값).
   *
   * 머리 위에 뜨는 한 줄이 이걸 본다 (`MarkNotes`). 검은 막이 걸려 있는 동안은
   * 아무 말도 안 하고, 막이 걷혀 제자리에 서는 그 순간에 지금 걸려 있는 것을
   * 통째로 알린다 — 판마다 패시브가 새로 붙는 것처럼 보인다.
   */
  live: boolean;
  /**
   * 우두머리에게 맞은 횟수 — 오를 때마다 몸 위에서 연출이 한 번 도다.
   *
   * 붉은 깜빡임(`HurtTint`)과 따로 둔다. 저건 "맞았다" 하나만 말하고
   * 어느 판에서든 같은데, 이건 **무엇에** 맞았는지를 말한다 — 암석이
   * 떨어졌는지 덩쿨에 감겼는지 베였는지.
   */
  hitNo: number;
  /** 그 연출이 무엇인가 (`BossFx` 의 표). 없으면 안 그린다 */
  hitKind: BodyKind | null;
  /**
   * 지금 **못 움직이게 하는 것**이 걸려 있으면 그 딱지 (`core/status` 의 `CC`).
   *
   * `💫기절` 처럼 걸려 있는 **내내** 머리 위에 붙어 있는다. 빈 글자면 안 붙는다.
   *
   * 다른 상태처럼 걸리는 순간에 한 번만 말하고 말 수가 없다 — 기절의 결과는
   * **아무 일도 안 일어나는 것**이라, 걸린 사람과 적이 멀어서 아직 못 치는
   * 사람이 화면에서 똑같아 보인다.
   */
  cc: string;
  /**
   * **묶여 있나** — 13판 속박의 덩굴 · 25판 포식의 거미줄.
   *
   * 켜져 있는 동안 몸 위에 감긴 그림이 계속 얹힌다 (`BossFx` 의 `Bound`).
   *
   * 기절(`stun`)과 따로 두는 이유: 기절은 암석에 맞아서일 수도, 벼락에
   * 맞아서일 수도 있다. 감긴 그림은 **묶는 기술에 맞았을 때만** 맞는 말이라,
   * 기절 하나로 뭉치면 6판 암석에 맞고 덩굴에 감겨 있는 그림이 나온다.
   *
   * 무대가 판단해서 넘긴다 — 어느 기술에 맞았는지는 저쪽이 안다
   * (`BossFx` 의 `FxPlan.bind`).
   */
  bound: boolean;
  /**
   * 묶은 것이 **거미줄인가** (25판 포식의 거미줄).
   *
   * 덩굴(13판)과 갈라 두는 이유: 둘은 같은 "못 움직인다" 지만 서로 다른
   * 놈이 거는 다른 것이다. 같은 그림이면 25판이 13판을 다시 하는 것으로
   * 보인다.
   */
  boundWeb?: boolean;
  /** 지금 돌아서 있나 (24 · 29판) — 몸이 붉게 일렁인다 */
  charmed?: boolean;
  /**
   * 지금 보호막을 두르고 있나 (`BattleState.ward` — 이졸데의 수호의 결의).
   *
   * 파티 칸에 하늘색 줄로도 뜨지만 (`PartyBar`), 저건 **얼마나 남았나**를
   * 말한다. 무대에서 필요한 것은 **누가 덮여 있나**라서 몸에 한 겹 얹는다 —
   * 넷 중 누가 막을 받았는지는 막대를 세 번 읽어야 알 수 있다.
   */
  warded?: boolean;
  /**
   * **감전됐나** (`core/status` 의 `st_shock`).
   *
   * 몸 둘레에서 전기가 지지직 튄다 (`BossFx` 의 `Shocked`). 몸도 아주
   * 미세하게 떤다 — 그건 여기서 한다 (`buzz`).
   */
  shock: boolean;
  /**
   * **돌아서 있나** — 혼란에 걸려 아군을 치는 중 (24판 · 29판).
   *
   * 아군은 전부 오른쪽(적)을 보고 서 있다. 그런데 혼란에 걸리면 실제로
   * 치는 것은 **왼쪽에 선 아군**이라 (`core/autoBattle` 의 `applyHit`),
   * 그대로 두면 적을 보면서 아군을 때린다 — 화면이 계산과 정반대를 말한다.
   *
   * 켜지면 그림을 뒤집고 내딛는 걸음도 반대로 간다.
   */
  turn: boolean;
  /**
   * 이 사람에게서 **나쁜 것이 걷힌** 횟수 (아녜스의 정화).
   *
   * 오를 때마다 몸에서 조각이 위로 떠오른다 (`SkillFx` 의 `cleanse`).
   * 쓰는 사람이 아니라 **걷힌 사람** 자리에서 나야 누가 풀렸는지가 보인다 —
   * 아녜스 쪽에서 나면 아녜스가 뭔가 한 것까지만 읽힌다.
   */
  purify: number;
  /**
   * 스킬 코스트를 강제로 깎인 횟수 (`BattleState.cut`).
   *
   * 숫자가 올라갈 때마다 여기서 한 번 깎는다. 코스트를 세는 것은 이
   * 안이라(스윙마다) 밖에서는 못 깎고, 그래서 **신호만** 받는다.
   */
  cut: number;
  /**
   * 코스트가 바뀔 때마다 밀어 넣는다 — 파티 칸이 이걸 그린다
   * (`state/battleUi`).
   *
   * 세는 곳과 그리는 곳을 갈라 놓되, **세는 곳은 하나**다. 한동안 여기서
   * 스윙을 세고 스토어에서도 따로 세다가 둘이 어긋났다.
   */
  onCharge: (id: string, on: readonly number[]) => void;
  /**
   * 이 사람 머리 위에 띄울 피해 숫자들.
   *
   * 바깥에서 그리다가 여기로 옮겼다. 밖에서는 감싸는 View 의 크기가 0 이라
   * 자리가 안 잡혀 화면 어딘가로 새 나갔다 — 체력 막대는 여기서 잘 뜨니
   * 숫자도 같은 자리에서 그리는 게 확실하다.
   */
  damage: { key: number; text: string }[];
  /**
   * 회복을 받은 횟수.
   *
   * 늘어날 때마다 몸 위에서 빛이 한 번 퍼진다. 사제의 기도는 적을 안
   * 때리므로, 화면에서 **아무 일도 안 일어난 것처럼** 보이기 쉽다 —
   * 체력 막대가 조금 차는 것만으로는 뭘 했는지 알 수 없다.
   */
  bless: number;

  /**
   * 이 사람이 차지하는 폭 (맨 앞 기준).
   *
   * `Ground` 의 `PARTY_W` 를 그대로 쓰다가 받아 쓰게 바꿨다. 무대가 좁으면
   * 대형을 통째로 줄이는데(`fitOf`), 사람만 원래 크기로 남으면 줄이 화면을
   * 넘는다. **줄 계산과 같은 값**을 써야 한다.
   */
  width: number;
  /**
   * 적 쪽으로 나가 있는 거리(px).
   *
   * 근접이면 무대 가운데까지 걸어 나가 붙고, 원거리면 0 이라 제자리에 남는다.
   * 이게 없으면 창잡이도 마법사도 같은 자리에 서서 허공에 휘두른다.
   */
  advance: number;
  /**
   * 뛰어드는 기술이 적진까지 가려면 몇 px 을 더 가야 하나.
   *
   * `advance` 는 평소에 나가 있는 거리이고, 이건 **그 자리에서 적 앞줄까지**
   * 남은 거리다. `BattleView` 가 두 줄의 배치를 알고 있으므로 거기서 잰다 —
   * 여기서 어림잡으면 화면이 넓든 좁든 늘 같은 거리를 뛰어서, 어떤 때는
   * 적 앞에서 멈추고 어떤 때는 적을 지나쳐 버린다.
   */
  leapTo: number;
  /**
   * 대상을 정한다. **쏘는 순간** 불리고, 그 대상까지의 거리(px)를 돌려준다.
   *
   * 피해는 날아간 것이 **닿을 때** 들어가지만, 어디로 날릴지는 손을 떠나는
   * 순간 정해져야 한다. 그래서 정하는 일과 때리는 일을 나눴다 — 정한 자리는
   * 화면이 들고 있다가, 닿는 순간(`onSwing`) 그대로 쓴다.
   */
  onAim: (id: string, skill: boolean) => number;
  onSwing: (s: Swing) => void;
  /**
   * 스킬을 쓸 때 — 검기가 떠나는 순간에 불린다.
   *
   * @param slot 이번에 나간 기술의 자리 (`core/chars` 의 `skillsOf` 순서).
   *             여기서 정해서 넘기는 이유는, 기술이 여럿일 때 무엇이 나갈지를
   *             아는 건 스윙 순환을 돌리는 여기뿐이기 때문이다 — 밖에서 다시
   *             고르면 그린 기술과 들어간 기술이 갈린다.
   */
  onSkill: (id: string, slot: number) => void;
}) {
  const d = CHARS[ch.id];
  const st = statOf(ch);
  const [frame, setFrame] = useState<Frame>('guard');
  /** 몇 번째 스킬인지 — 바뀔 때마다 검기가 새로 날아간다 */
  const [castNo, setCastNo] = useState(0);
  /**
   * 지금 외치고 있는 것 — 몇 번째 외침인지와 무슨 기술인지.
   *
   * `castNo` 와 따로 센다. 저건 **날아가는 것**이 있을 때만 올라가서
   * (`throwing`), 도약과 기도에서는 영영 0 이다. 외치는 건 기술 넷 다 한다.
   *
   * 번호와 이름을 **한 덩어리로** 들고 있다. 따로 두면 둘이 어긋나는 순간이
   * 생기고 — 기술이 여럿인 사람이라면 — 검기를 쓰면서 강타를 외친다.
   */
  const [shout, setShout] = useState<{ no: number; name: string }>({ no: 0, name: '' });
  /**
   * 지금 몸이 하고 있는 기술의 **자리**. 평타 중이면 -1.
   *
   * 발밑 표시(`SkillAura`)가 이걸 본다 — 기술마다 표시가 다른데
   * (`SkillDef.aura`), 늘 첫 번째 기술 것을 그리면 두 번째 기술을 쓸 때
   * 엉뚱한 것이 깔린다.
   */
  const [casting, setCasting] = useState(-1);
  /** 이번에 날린 것이 가야 할 거리 — 쏘는 순간 정해진다 */
  const [fly, setFly] = useState(0);

  /** 내디디는 발 — strike 에서만 앞으로 */
  const step = useRef(new Animated.Value(0)).current;
  /** 서 있을 때의 숨쉬기 */
  const bob = useRef(new Animated.Value(0)).current;

  /* 콜백이 바뀌어도 타이머를 다시 걸지 않는다 — 걸면 박자가 리셋된다 */
  const cb = useRef(onSwing);
  cb.current = onSwing;
  /*
    ── 과열 ── 비앙카 4단계 (`core/skillTree` 의 `ba4`).

    **세 번째 평타마다 두 번 친다.** 둘째 대는 150% 이고 폭발로 그려진다.
    그래서 세 번 휘두르면 네 대가 나가고 코스트도 네 칸이 찬다.

    세는 것은 여기다 — 스윙 순환을 돌리는 곳이 여기뿐이라, 계산 쪽에서
    세면 "몇 번째 평타인가" 를 두 곳에서 따로 세게 된다.

    `ref` 로 드는 이유는 `canCast` 와 같다: 아래 타이머 안의 닫힘이라
    그냥 읽으면 합성 직후에도 한동안 옛 트리를 본다.
  */
  const heatRef = useRef(false);
  heatRef.current = (ch.tree ?? []).includes('ba4');
  /** 여태 휘두른 평타 수 — 3의 배수마다 한 대가 더 나간다 */
  const swings = useRef(0);
  const cbAim = useRef(onAim);
  cbAim.current = onAim;
  const cbSkill = useRef(onSkill);
  cbSkill.current = onSkill;

  /** 이 사람이 쓰러졌나 — 파티 전멸과 별개다 */
  const fallen = hp <= 0;

  /*
    ── 박자와 세기는 **ref 로 흘린다** ──

    아래 스윙 고리는 `useEffect` 안에서 타이머를 이어 건다. 공격속도를 의존성에
    두면 값이 바뀔 때마다 고리가 통째로 다시 시작한다 — 그런데 지금은 공격속도가
    **계속 바뀐다.** 비앙카는 체력이 1 깎일 때마다 빨라지고, 둔화는 5초 동안
    걸렸다 풀린다. 의존성에 두면 그 사람은 휘두르다 말고 처음으로 돌아가기를
    반복하다가 **영영 한 대도 못 친다.**

    그래서 값은 ref 로 넣고, 고리는 다음 스윙을 예약할 때 최신 값을 읽는다.
    빨라지면 다음 스윙부터 빨라진다 — 지금 휘두르던 것은 끝까지 휘두른다.
  */
  const spdRef = useRef(spd);
  spdRef.current = spd;
  const atkRef = useRef(st.atk);
  atkRef.current = st.atk;
  /** 침묵도 같은 이유로 ref 다 — 5초짜리라 고리를 두 번 끊는다 */
  const silentRef = useRef(silent);
  silentRef.current = silent;
  /* 광란이 켜졌다 꺼지는 동안 고리를 끊으면 안 된다 — 같은 이유로 ref */
  const noChargeRef = useRef(noCharge);
  noChargeRef.current = noCharge;
  const canCastRef = useRef(canCast);
  canCastRef.current = canCast;
  /*
    ── 아직 안 열린 기술은 고르지 않는다 ──

    성이 기술을 연다 (`core/growth` 의 `skillSlots`). 2성이 되기 전의 사람은
    스킬2 를 못 쓰는데, 코스트는 자리마다 따로 차므로 (`Charge`) 막지 않으면
    **잠긴 기술이 그대로 나간다.**

    `ref` 로 드는 이유는 `canCast` 와 같다 — 아래 `allow` 는 스윙 타이머 안의
    닫힘이라, 그냥 `ch` 를 읽으면 합성 직후에도 한동안 옛 성을 본다.

    잠긴 자리도 코스트는 계속 찬다. 그래야 합성한 그 순간부터 쓸 수 있다.
  */
  const openRef = useRef(ch);
  openRef.current = ch;
  const onChargeRef = useRef(onCharge);
  onChargeRef.current = onCharge;

  /**
   * ── 스킬 코스트 ── **기술 자리마다 하나씩** (`core/chars` 의 `Charge`).
   *
   * 고리 밖에 둔다. 고리 안의 지역 변수였을 때는 고리가 다시 시작할 때마다
   * 0 으로 돌아가서, 기절이 한 번 걸렸다 풀릴 때마다 모아 둔 것이 통째로
   * 사라졌다. 밖에 두면 멈췄다 이어져도 세던 것을 이어 센다.
   *
   * ## 왜 화면이 세나
   *
   * 코스트는 **평타 한 번에 1** 이고, 평타의 박자는 캐릭터마다 다르며
   * 0.5초 틱과 아무 관계가 없다 (`swingMs`). 엔진이 세려면 네 사람의 스윙
   * 시각을 따로 흉내 내야 하는데, 그러면 화면이 실제로 휘두르는 순간과
   * 어긋난다 — 예전에 피해 계산에서 똑같이 겪었다 (`applyHit` 머리말).
   */
  const chargeRef = useRef<number[]>(newCharge(ch));
  /** 바뀐 칸을 파티 칸으로 밀어 넣는다 (`state/battleUi`) */
  const pushCharge = () => onChargeRef.current(ch.id, chargeRef.current);

  /*
    코스트를 깎으라는 신호가 왔다 (20판 태고의 성난 벼락).

    **절반으로 되돌린다.** 0 으로 만들면 기술이 갓 나간 직후에 맞았을 때
    아무 일도 안 일어난 것과 같아서, 맞은 사람 입장에서는 뭘 잃었는지 모른다.
  */
  const cutRef = useRef(cut);
  useEffect(() => {
    if (cut === cutRef.current) return;
    cutRef.current = cut;
    chargeRef.current = cutCharge(ch, chargeRef.current);
    pushCharge();
    /* `pushCharge` 는 ref 만 읽으므로 의존성이 아니다 */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cut, ch.id]);

  /*
    판이 바뀌었다 — **처음부터 모은다** (`BattleState.costSeq`).

    쓰러졌다 일어설 때도 오른다. 다시 서는 판은 새 판과 같아야 한다 —
    죽기 직전에 채워 둔 정화를 들고 일어서면, 죽는 것이 이득인 순간이 생긴다.
  */
  const costSeqRef = useRef(costSeq);
  useEffect(() => {
    if (costSeq === costSeqRef.current) return;
    costSeqRef.current = costSeq;
    chargeRef.current = newCharge(ch);
    pushCharge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costSeq, ch.id]);

  /**
   * 쓰러진 뒤의 사라짐.
   *
   * 예전에는 쓰러진 자세를 **불투명도 0.3 으로 계속** 띄웠다. 그러면 죽은
   * 사람이 무대에 계속 누워 있어서, 넷 중 둘이 죽으면 화면이 시체로 붐빈다 —
   * 살아 있는 둘이 어느 쪽인지 한눈에 안 들어온다.
   *
   * 쓰러지는 자세를 **잠깐 보여 주고 지운다.** 죽은 것은 한 번 보면 되는
   * 정보이고, 그 뒤로는 자리를 비워 주는 편이 낫다. 되살아나면 즉시 돌아온다.
   */
  const gone = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!fallen) {
      /* 되살아났다 — 기다리지 않고 바로 돌려놓는다 */
      gone.setValue(1);
      setHidden(false);
      return undefined;
    }
    let alive = true;
    setHidden(false);
    gone.setValue(1);
    const a = Animated.sequence([
      /* 쓰러진 자세를 읽을 시간 */
      Animated.delay(FALL_HOLD_MS),
      Animated.timing(gone, {
        toValue: 0, duration: FALL_FADE_MS, useNativeDriver: true,
      }),
    ]);
    a.start(() => { if (alive) setHidden(true); });
    return () => { alive = false; a.stop(); };
  }, [fallen, gone]);

  /*
    맞은 횟수. 늘어날 때마다 몸 위에서 불꽃이 한 번 터진다.

    새 숫자가 뜬 사람이 곧 맞은 사람이므로(`damage` 는 사람별 체력 감소에서
    나온다) 이걸 세는 것만으로 이펙트가 정확한 사람에게 간다. 값 자체는
    `HitBurst` 의 `nonce` 로만 쓰이고, 0 이면 아무것도 안 터진다.
  */
  const [hurtNo, setHurtNo] = useState(0);
  const lastDmg = useRef(-1);
  const hurt = useRef(new Animated.Value(0)).current;
  /*
    도약을 **가로와 세로로 나눠** 굴린다.

    하나로 굴리면 x 와 y 가 같은 시계를 쓰게 되어 반드시 포물선이 된다.
    그런데 이 기술은 포물선이 아니다 — 높이 솟아 적 위에 자리를 잡고,
    거기서 **수직으로** 내리꽂는다. 가로는 올라가는 동안에 다 끝내고,
    떨어지는 동안에는 한 발짝도 안 움직여야 그렇게 보인다.
  */
  const leapX = useRef(new Animated.Value(0)).current;
  const leapY = useRef(new Animated.Value(0)).current;
  const top = damage.length ? damage[damage.length - 1].key : -1;

  useEffect(() => {
    if (top === lastDmg.current) return;
    lastDmg.current = top;
    if (top < 0 || fallen) return;
    setHurtNo((n) => n + 1);
    /* 뒤로 한 번 밀린다 — 불꽃만 터지면 서서 맞는 것처럼 보인다 */
    const a = Animated.sequence([
      Animated.timing(hurt, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(hurt, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [top, fallen, hurt]);

  /*
    화면을 떠날 때 이 사람의 움직임을 전부 멈춘다.

    스윙 루프는 타이머를 치우지만, 그 타이머가 이미 걸어 놓은 애니메이션은
    제 갈 길을 간다 — 내딛는 걸음, 뛰어오르기, 맞고 밀리기. 하나하나 짧지만
    파티가 넷이고 화면을 오갈 때마다 남으므로 여기서 한 번에 정리한다.
  */
  useEffect(() => () => {
    for (const v of [step, hurt, leapX, leapY, bob]) v.stopAnimation();
  }, [step, hurt, leapX, leapY, bob]);

  // ── 숨쉬기 (계속) ──
  useEffect(() => {
    if (down || fallen) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bob, down, fallen]);

  /*
    ── 스윙 ──

    평타와 스킬을 **한 루프에서** 돌린다. 몇 번째 스윙이 스킬이 되는지는 기술이 정한다
    (`SkillDef.every`). 예전에는 스킬이 제 타이머로 따로 돌았는데, 평타 중간에
    끼어들어 프레임을 덮어써서 휘두르다 말고 다른 동작으로 튀었다.
  */
  useEffect(() => {
    /*
      쓰러진 사람은 안 휘두른다.

      전투 계산에서도 쓰러진 사람은 딜을 안 넣는 게 맞겠지만, 지금은 파티
      전체 딜을 한 덩어리로 굴린다 (`core/autoBattle`). 그래서 여기서는
      **보이는 것만** 멈춘다 — 누워 있는 사람이 검을 휘두르면 안 되니까.
    */
    if (down || fallen) { setFrame('lose'); return; }
    /*
      판 연출 중 — **아무것도 안 한다.**

      검은 막 뒤에서 계속 휘두르면, 막이 걷히는 순간 이미 날아가고 있던
      검기가 화면을 가로지른다 (`held` 주석). 계산은 이미 막혀 있으므로
      그 검기는 아무도 안 때리는, 설명할 수 없는 그림이었다.
    */
    if (held) { setFrame('guard'); return; }
    /*
      기절 · 감전 — **쓰러진 자세로 굳는다.**

      한동안 `guard`(막는 자세)를 썼다. 쓰러진 것과 다르니 눕히지 말자는
      것이었는데, 화면에서는 그게 **아무 표시가 아니었다** — 막고 서 있는
      자세는 스윙과 스윙 사이의 평소 자세와 같은 칸이라, 기절한 사람과
      그냥 다음 스윙을 기다리는 사람이 완전히 똑같아 보였다.

      `lose` 는 다르다. 넷 중 하나만 그 자세면 한눈에 튄다. 진짜로 쓰러진
      것과 헷갈릴 걱정은 안 해도 된다 — 저쪽은 흐려지다 사라지고(`gone`)
      발밑 체력 막대도 지워진다.
    */
    if (stun) { setFrame('lose'); return; }
    setFrame('guard');

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => { if (alive) fn(); }, ms));
    };

    /*
      간격에서 스윙에 안 쓰는 나머지 — 그동안은 서서 기다린다.

      `spd` 는 **간격이 아니라 배수**다 (`ATTACK_BASE_MS`). 한동안 여기서
      그걸 그대로 ms 로 썼는데, 0.8 에서 290 을 빼면 음수라 하한 120ms 에
      걸려서 **모두가 초당 두 번 넘게** 휘둘렀다.
    */
    /** 지금 이 순간의 간격 — 스윙을 예약할 때마다 다시 읽는다 */
    const beatNow = () => swingMs(spdRef.current);

    const cycle = () => {
      if (!alive) return;
      const list = skillsFor(ch);

      /*
        ── 코스트가 찬다 ──

        평타 한 번에 모든 칸이 1 씩. 광란이 켜져 있으면 안 찬다 (`noCharge`).
      */
      if (!noChargeRef.current) chargeRef.current = chargeUp(ch, chargeRef.current);

      /**
       * 이번 스윙에 나갈 기술의 자리. -1 이면 평타다.
       *
       * **침묵이면 아예 안 고른다.** 고르고 나서 막으면 그 기술은 코스트를
       * 쓴 채로 사라진다 — 15판 부패의 악취가 5초를 거는데, 그동안 모은 것이
       * 통째로 없어지면 침묵이 풀린 뒤에도 한참 기술이 안 나간다.
       *
       * 다 찼어도 **지금 쓸 수 있는지**를 한 번 더 묻는다 (`canCast`). 정화가
       * 걷어낼 것이 없으면 여기서 거절당하고, 코스트는 그대로 남는다.
       */
      const slot = silentRef.current
        ? -1
        : readySkill(ch, chargeRef.current, (i) => (
          skillOpen(openRef.current, i) && canCastRef.current(ch.id, i)
        ));
      const skill = slot >= 0;
      if (skill) chargeRef.current = spendCharge(ch, chargeRef.current, slot);
      pushCharge();
      const sk = list[Math.max(0, slot)] ?? skillOf(ch.id);
      setCasting(slot);

      /*
        **이름은 동작이 시작될 때 외친다.**

        맞는 칸(`landAt`)까지 기다리면 이미 다 휘두른 뒤에 말풍선이 뜬다 —
        기도처럼 0.3초를 모으는 기술에서는 특히 늦어서, "뭘 하려는 거지" 가
        지나간 다음에야 답이 나온다. 치켜드는 순간에 외쳐야 순서가 맞다.
      */
      if (skill) setShout((v) => ({ no: v.no + 1, name: sk.name }));

      /* 몸이 통째로 날아가는 기술은 박자가 따로다 — 떠 있는 시간이 곧 높이다 */
      const leaping = skill && sk.leaps;

      /* 기술마다 제 동작 칸을 쓴다 — 없으면 첫 기술 것으로 떨어진다 */
      const frames: readonly string[] = skill ? skFramesOf(ch.id, sk) : CUT_FRAMES;
      const spans = skill ? (sk.beat ?? SK_MS) : CUT_MS;
      const span = spans.reduce((a, b) => a + b, 0);
      /* 평타는 검이 몸 앞을 지날 때, 스킬은 그 기술이 닿는 칸에서 */
      const landAt = skill ? landAtOf(spans, sk.landOn) : HIT_AT;

      /*
        뛰어드는 기술은 **적 쪽으로 크게 나갔다** 돌아온다.

        그림 안에서 점프는 이미 보이지만, 제자리에서 뛰면 "적진으로 뛰어들었다"
        가 아니라 "제자리 점프" 로 읽힌다. 화면에서 실제로 거리를 좁혀야 한다.
      */
      if (leaping) {
        /* 가로 — 솟는 동안에 거리를 다 끝낸다. 떨어질 때는 제자리다 */
        Animated.sequence([
          Animated.timing(leapX, {
            toValue: 1,
            duration: spans[0],
            /* 땅을 차고 나갈 때 제일 빠르고, 꼭대기에서 멎는다 */
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          /* 착지한 자리에 머문다 — 바로 돌아오면 폭발을 볼 새가 없다 */
          Animated.delay(spans[1] + spans[2] + 120),
          Animated.timing(leapX, {
            toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
        ]).start();

        /* 세로 — 올라갔다가, **곧게 가속하며** 떨어진다 */
        Animated.sequence([
          Animated.timing(leapY, {
            toValue: 1, duration: spans[0], easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          Animated.timing(leapY, {
            toValue: 0,
            duration: spans[1],
            /* 떨어질수록 빨라진다 — 이게 "쾅" 을 만든다 */
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }

      /* 칸을 차례로 넘긴다 */
      let t = 0;
      frames.forEach((f, i) => {
        at(t, () => setFrame(f as Frame));
        t += spans[i];
      });

      /*
        피해는 **그림이 닿는 칸**에서 들어간다. 스윙을 시작할 때 알리면
        검이 아직 어깨에 있는데 적이 맞는다.
      */
      /*
        원거리는 **평타도** 날린다.

        활잡이의 화살은 몸을 떠나 적까지 가야 하므로, 검기와 같은 길을 쓴다
        (`SwordWave` → `projSet`). 그래서 피해도 놓는 순간이 아니라 **닿는
        순간**에 들어간다 — 안 그러면 화살이 아직 활 옆에 있는데 적이 죽는다.
      */
      const shooting = !skill && d.range === 'ranged';
      /** 이번 스윙이 뭔가를 날리나 — 화살이든 검기든 */
      const throwing = shooting || (skill && sk.flies);

      /*
        **날릴 것이 있으면 여기서 대상을 정한다.**

        스윙이 시작할 때 정해야 하는 이유는, 날아갈 거리가 곧 날아가는 시간이고
        (`flyMsOf`) 그 시간을 알아야 **닿는 순간**에 피해 타이머를 걸 수 있기
        때문이다. 놓는 순간에 정하면 거리를 모르는 채로 시간을 잡아야 한다.
      */
      const dist = throwing ? cbAim.current(ch.id, skill) : 0;
      /* 멀리 있는 놈을 노렸으면 그만큼 오래 날아간다 — 속도가 고정이다 */
      const reach = flyMsOf(dist);

      if (throwing) at(landAt + reach, () => {
        if (skill) cbSkill.current(ch.id, slot);
        else cb.current({ id: ch.id, fx: d.fx, dmg: atkRef.current });
      });

      at(landAt, () => {
        if (throwing) { setFly(dist); setCastNo((c) => c + 1); }
        else if (skill) {
          /*
            여기 오는 것은 **날아갈 것이 없는 기술**(도약·기도)뿐이다.
            닿는 칸이 곧 맞는 순간이므로 바로 넣는다.

            날아가는 기술은 위(`throwing`)에서 이미 놓았고, 피해는 그것이
            적에게 닿을 때 들어간다 — 놓자마자 깎으면 검기가 아직 칼 옆에
            있는데 저 끝의 적이 먼저 죽는다.
          */
          cbSkill.current(ch.id, slot);
        } else {
          cb.current({ id: ch.id, fx: d.fx, dmg: atkRef.current });
          /*
            ── 과열의 둘째 대 ──

            같은 순간에 한 번 더 친다. 시간을 벌려 두지 않는 이유: 이건
            "두 번 휘두른다" 가 아니라 **한 번 휘두른 것이 두 번 맞는다**
            이므로 (도끼가 돌아 나오며 한 번 더 걸린다), 벌려 놓으면
            공격속도가 빨라진 것으로 보인다.

            `blast` 를 켜면 화면이 크게 그린다 — 평타와 같은 그림이면
            네 대 중 어느 것이 150% 인지 알 수가 없다.
          */
          swings.current += 1;
          if (heatRef.current && swings.current % 3 === 0) {
            cb.current({
              id: ch.id, fx: d.fx, dmg: Math.round(atkRef.current * HEAT_MUL),
              mul: HEAT_MUL, blast: true,
            });
            /* 그 한 대도 코스트를 채운다 — 세 번 치면 네 칸이다 */
            if (!noChargeRef.current) chargeRef.current = chargeUp(ch, chargeRef.current);
            pushCharge();
          }
        }
        /*
          내디디는 걸음.

          **제자리에서 쓰는 기술은 뺀다.** 도약은 이미 화면을 가로질러
          날아왔으니 한 번 더 밀면 미끄러지고, 기도는 무릎을 꿇고 있는데
          앞으로 나가면 무릎으로 미끄러진다. 발이 움직이는 기술만 내딛는다.
        */
        const steps = !leaping && !(skill && sk.pick === 'none');
        if (steps) {
          Animated.sequence([
            Animated.timing(step, { toValue: 1, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(step, { toValue: 0, duration: Math.max(70, span - landAt - 70), easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]).start();
        }
      });

      at(span, () => setFrame('guard'));
      /*
        다음 스윙은 **지금 박자로** 잡는다.

        간격에서 스윙에 안 쓰는 나머지가 쉬는 시간이다. 매번 다시 읽으므로
        중간에 빨라지거나 느려져도 다음 스윙부터 반영된다.
      */
      at(span + Math.max(120, beatNow() - SWING_MS), cycle);
    };

    /*
      각자 다른 순간에 시작한다.

      간격이 같은 두 캐릭터를 동시에 시작시키면 영영 같이 움직여서 합창단이
      된다. 처음 한 번만 무작위로 어긋내면 그 뒤로는 알아서 흩어진 채로 돈다.
    */
    at(Math.random() * beatNow(), cycle);

    return () => { alive = false; timers.forEach(clearTimeout); };
    /*
      공격속도와 공격력은 **의존성이 아니다** — ref 로 흘린다 (위에 이유).
      여기 남은 것들은 실제로 고리를 다시 세워야 하는 것들뿐이다: 사람이
      바뀌었거나, 쓰러졌거나, 기절했거나.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch.id, d.fx, down, fallen, stun, held, step, leapX, leapY]);

  /*
    쿼터뷰 깊이.

    뒤에 선 사람은 바닥판 안쪽에 서 있으므로 **위로 올라가고 작아진다**
    (`Ground` 의 `depthAt`). 예전엔 크기만 두 단계로 나눴는데, 그러면
    같은 자리에 선 작은 사람으로 보였다.
  */
  /*
    움직임을 **한 번만** 만든다.

    `interpolate` 는 부를 때마다 값에 가지를 하나 단다. 아래 다섯은 이 사람이
    화면에 서 있는 내내 살아 있는 값이라, 렌더마다 새로 부르면 가지가 끝없이
    쌓인다 — 전투는 0.5초마다 돌고 파티는 넷이므로 한 시간이면 수만 개다.
    화면이 오래 켜져 있을수록 느려지는 것이 이 형태로 나타난다.

    자리(`advance`·`leapTo`)가 실제로 바뀔 때만 다시 만든다. 그건 화면 폭이나
    파티 인원이 바뀔 때뿐이라, 대개 판이 끝날 때까지 한 번이다.
  */
  const stepX = useMemo(() => step.interpolate({
    inputRange: [0, 1],
    /*
      붙어 있는 만큼 이미 나가 있고, 칠 때 조금 더 내디딘다.

      **돌아섰으면 반대로 내딛는다** (`turn`). 나가 있는 자리(`advance`)는
      그대로다 — 혼란은 4초짜리라, 그동안 줄에서 빠져나오면 풀린 뒤에 제자리로
      돌아오는 길이 또 필요하다.
    */
    outputRange: [advance, advance + (turn ? -8 : (advance > 0 ? 10 : 6))],
  }), [step, advance, turn]);

  /*
    ── 감전된 동안의 떨림 ──

    "아~~주 미세하게" 라는 말 그대로 1px 이다. 3px 만 되어도 맞고 밀리는
    동작(`hurtX`)과 세기가 비슷해져서, 감전된 사람이 계속 맞고 있는 것으로
    보인다.

    빠르다 (한 번 왕복에 90ms). 느리면 떠는 것이 아니라 흔들리는 것이 된다.
  */
  const buzz = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!shock) { buzz.setValue(0); return undefined; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(buzz, {
        toValue: 1, duration: 45, easing: Easing.linear, useNativeDriver: true,
      }),
      Animated.timing(buzz, {
        toValue: -1, duration: 45, easing: Easing.linear, useNativeDriver: true,
      }),
    ]));
    loop.start();
    return () => { loop.stop(); buzz.setValue(0); };
  }, [shock, buzz]);
  const buzzX = useMemo(() => buzz.interpolate({
    inputRange: [-1, 1], outputRange: [-1, 1],
  }), [buzz]);

  const hurtX = useMemo(() => hurt.interpolate({
    inputRange: [0, 1], outputRange: [0, -6],
  }), [hurt]);

  const leapDX = useMemo(() => leapX.interpolate({
    inputRange: [0, 1], outputRange: [0, leapTo],
  }), [leapX, leapTo]);

  const leapDY = useMemo(() => leapY.interpolate({
    inputRange: [0, 1], outputRange: [0, -LEAP_UP],
  }), [leapY]);

  const bobY = useMemo(() => bob.interpolate({
    inputRange: [0, 1], outputRange: [0, -1.5],
  }), [bob]);

  const { lift, scale } = depthAt(back);
  const size = Math.round(width * scale);
  /*
    ── 다 사라진 사람 ──

    **아무것도 안 그린다.**

    예전에는 같은 폭의 빈 칸을 남겼다. 가로줄 안에서 서로 겹쳐 서던 시절에는
    그래야 했다 — 칸이 없어지면 옆 사람들이 그만큼 미끄러졌다.

    이제 자리를 절대 좌표로 받으므로 (`x`) 하나가 사라져도 아무도 안 움직인다.
    빈 칸이 할 일이 없어졌다.
  */
  if (hidden && fallen) return null;
  /** 지금 나가는 중인 기술 — 평타 중이면 null */
  const castSk = casting >= 0 ? (skillsFor(ch)[casting] ?? null) : null;
  const max = st.hp;
  const ratio = Math.max(0, Math.min(1, hp / Math.max(1, max)));

  return (
    <Animated.View
      style={{
        /*
          아군 구역 안에서 **제 칸에 선다** (`x` · `lift`).

          가로줄 + 음수 여백이었다. 대형이 생기면서 자리가 칸으로 정해지므로
          (`core/party` 의 `FORMATIONS`) 절대 좌표로 바꿨다 — 비는 칸을
          겹침으로는 못 만든다.
        */
        position: 'absolute',
        left: x,
        bottom: lift,
        /*
          쓰러진 사람만 흐리다.

          예전에는 뒤에 설수록 흐리게 했다 (`1 - back * 0.1`). 깊이를 흐림으로
          말하려던 것인데, 54px 짜리 1-bit 그림에서 흐림은 깊이가 아니라
          **덜 그려진 것**으로 보인다. 깊이는 이미 크기와 높이가 말하고 있다
          (`depthAt`) — 거기에 흐림까지 얹을 이유가 없다.
        */
        /*
          쓰러지면 흐려졌다 사라진다 (`gone`). 파티 전멸(`down`)은 다르다 —
          그때는 넷이 다 누워 있고 곧 일어나므로, 흐리게 남겨 둔다.
        */
        opacity: fallen ? gone : (down ? 0.3 : 1),
        zIndex: 10 - back,
        transform: [
          { translateX: stepX },
          /* 맞으면 뒤로(왼쪽으로) 살짝 밀린다 */
          { translateX: hurtX },
          /* 감전된 동안 1px 씩 떤다 — 안 걸렸으면 0 이라 없는 것과 같다 */
          { translateX: buzzX },
          /* 도약 — 적 쪽(오른쪽)으로. 솟는 동안에 거리를 다 간다 */
          { translateX: leapDX },
          /* 높이. 가로와 **따로** 굴러서 포물선이 아니라 ㄱ 자를 그린다 */
          { translateY: leapDY },
          /* 숨쉬기는 서 있을 때만 — 휘두르는 중에 위아래로 흔들리면 어지럽다 */
          {
            translateY: frame === 'guard'
              ? bobY
              : 0,
          },
        ],
      }}
    >
      {/*
        머리 위 체력 막대.

        `ui/atoms` 의 `Bar` 를 안 쓴다 — 저건 칸을 나눈 블록 막대라 20px 폭에서
        칸 하나가 1px 이 되어 뭉갠다. 여기서는 그냥 채워진 길이로 그린다.

        쓰러지면 막대를 지운다. 빈 막대가 남아 있으면 "체력이 없다" 가 아니라
        "막대가 안 보인다" 로 읽힌다.
      */}
      {/*
        ── 머리 위는 비워 둔다 ──

        여기에 스킬 충전 칸이 있었다. 파티 칸으로 옮겼다 (`PartyBar`) — 기술이
        한 명당 여러 개가 되면 점 몇 개로는 무엇이 차고 있는지 말할 수 없고,
        머리 위에 줄을 여럿 쌓으면 그게 곧 벽이 된다.

        이 자리는 앞으로 **버프·디버프 아이콘**이 쓴다. 그건 반대로 무대에
        있어야 하는 종류다 — 지금 이 사람에게 걸려 있는 것이라, 파티 칸에서
        찾아 읽는 게 아니라 맞는 순간 보여야 한다.
      */}

      {/*
        체력 막대 — **발밑에.**

        머리 위에 있었다. 그런데 머리 위는 이미 붐빈다 — 피해 숫자가 뜨고,
        회복 표시가 올라가고, 스킬 칸이 차 있었다. 막대까지 거기 있으니 숫자가
        뜰 때마다 가려졌고, 정작 "지금 몇 남았나" 를 볼 수 없었다.

        발밑은 비어 있고, 줄이 겹쳐 서도 앞사람 발밑이 뒷사람을 안 가린다.
      */}
      {!fallen && (
        <View
          style={{
            position: 'absolute',
            bottom: -7,
            left: size * 0.12,
            width: size * 0.76,
            height: 4,
            borderWidth: 1,
            borderColor: '#FFFFFF88',
            zIndex: 30,
          }}
        >
          <View
            style={{
              width: `${ratio * 100}%`,
              height: '100%',
              backgroundColor: WHITE,
            }}
          />
        </View>
      )}

      {/*
        캐릭터 제 그림이 있으면 그걸 쓰고, 없으면 공용 기사(`duel`)로 떨어진다.

        캐릭터를 한 명씩 만들고 있어서(`docs/character-art/`), 어느 시점에나
        "제 그림이 있는 사람" 과 "아직 없는 사람" 이 섞여 있다. `fallbackSet` 이
        그걸 알아서 처리하므로 **새 시트를 받을 때마다 코드를 고칠 필요가 없다** —
        `assets/sprites/<id>/` 폴더가 생기는 순간 그 사람만 바뀐다.
      */}
      {/*
        피격 — **맞은 사람 몸 위에서** 터진다.

        숫자가 새로 뜬 사람이 곧 맞은 사람이다 (`BattleView` 가 사람별 체력
        감소를 재서 넘긴다). 그래서 여기에 두면 이펙트가 엉뚱한 사람에게
        갈 수가 없다 — 무대 좌표에 고정으로 그리던 때와 다른 점이다.
      */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: size * 0.18,
          top: size * 0.26,
          zIndex: 38,
        }}
      >
        <HitBurst kind="hurt" size={size * 0.7} nonce={hurtNo} />
      </View>

      {/* 회복 — `+` 표시들이 머리 위에서 쏟아진다 */}
      <HealMarks nonce={bless} size={size} />

      {/*
        ── 방금 걸린 것이 무엇인지 ──

        `디버프:지속 피해` 처럼 한 줄이 머리 위에 떴다 사라진다. 걸리는 그
        순간에만 뜨고, 그다음부터는 파티 칸의 로고가 맡는다 (`StatusRow`).

        적 머리 위에도 **같은 부품**이 붙는다 (`BattleView`) — 두 규칙이
        다르면 보는 사람이 규칙을 두 벌 익혀야 한다.
      */}
      <MarkNotes marks={marks} markKey={markKey} live={live} />

      {/*
        ── 기술이 나갈 때의 큰 연출 ──

        두 번째 기술 넷 중 셋이 **아무도 안 때린다** (도발 · 광란 · 정화).
        때리는 기술은 맞은 자리에서 불꽃이 터지고 숫자가 뜨는데, 이쪽은 몸짓
        말고 아무 일도 안 일어난다 — 그림 없이 도형으로만 그린다 (`SkillFx`).

        쓰는 사람 자리에서 나는 것은 둘뿐이다 (포효 · 광란). 정화는 **걷힌
        사람** 자리에서, 화산은 **맞은 적** 자리에서 난다.
      */}
      <SkillFx
        kind={castSk?.cast === 'roar' || castSk?.cast === 'haste' ? castSk.cast : null}
        nonce={shout.no}
        size={size}
      />

      {/*
        ── 몸이 한 번 번쩍인다 ── 리안느의 광란 하나다.

        저 기술은 **아무것도 몸을 안 떠난다** — 화살도 빛도 파동도 없이 5초간
        제 공격속도가 두 배가 될 뿐이라, 그림이 아무리 좋아도 화면에서는
        "자세를 바꿨다" 로 끝났다.

        에셋이 이미 흰 픽셀이라 밝게 할 수가 없다. 대신 **제 실루엣을 한 장
        더 뒤에 깔고 키운다** — 같은 모양이 몸보다 조금 크게 뒤에 있다가
        퍼지며 사라지므로, 가장자리에서 빛이 샌 것으로 읽힌다. 자세가 바뀌면
        그 모양도 같이 바뀌므로 늘 정확히 이 사람의 윤곽이다.
      */}
      <BodyFlash nonce={castSk?.cast === 'haste' ? shout.no : 0} size={size}>
        <Sprite
          set={ch.id}
          name={frame}
          size={size}
          /*
            **돌아서면 좌우를 뒤집는다** (`turn`).

            `Sprite` 의 `flip` 을 못 쓴다 — 저건 style 에 transform 이 있으면
            스스로 물러나므로 (덮어써서 반전이 사라지는 걸 막는 장치다),
            발을 맞추는 `translateY` 와 같이 쓰려면 여기서 직접 합쳐야 한다.
            적 줄이 같은 자리에서 같은 일을 한다 (`BattleView`).
          */
          style={{
            transform: [
              { scaleX: turn ? -1 : 1 },
              { translateY: Math.round(size * spriteGap(ch.id, frame)) },
            ],
          }}
          fallbackSet="duel"
          fallbackName={SK_FALLBACK[frame] ?? CUT_FALLBACK[frame] ?? frame}
        />
      </BodyFlash>
      {/* 정화를 맞은 쪽 — 쓴 사람과 상관없이 걷힌 사람에게서 난다 */}
      <SkillFx kind="cleanse" nonce={purify} size={size} />

      {/*
        ── 우두머리가 무엇으로 쳤나 ──

        번호를 `key` 로 쓴다. 그러면 맞을 때마다 **새로 태워지므로**
        안에서 "번호가 올랐나" 를 볼 필요가 없고, 도는 중에 또 맞으면
        앞엣것이 끝까지 돌고 새것이 따로 돌다.
      */}
      {!!hitKind && hitNo > 0 && (
        <BossBodyFx key={hitNo} kind={hitKind} size={size} />
      )}

      {/*
        ── 못 움직이는 **동안** 계속 붙어 있는 것 둘 ──

        위의 `BossBodyFx` 와 성격이 다르다. 저건 맞는 순간 한 번 돌고 끝나는
        것이고 (그래서 번호를 `key` 로 태운다), 이 둘은 상태가 풀릴 때까지
        켜져 있는다 — 켜고 끄는 판단은 무대가 한다.

        묶임이 먼저, 전기가 나중이다. 둘이 같이 걸릴 일은 지금 없지만
        (13·25판과 20판은 다른 판이다), 순서를 정해 두지 않으면 나중에
        겹치는 날 어느 쪽이 위인지가 우연히 정해진다.
      */}
      {bound && <Bound size={size} web={boundWeb} />}
      {/*
        ── 돌아섰다 ── 24판 정신 착란 · 29판 광란 (`BattleState.charm`).

        여태 머리 위 딱지 하나뿐이었다 (`cc`). 그런데 이 상태의 결과는
        **아군을 친다**는 것이라, 딱지를 안 읽은 사람에게는 "왜 우리 편
        체력이 줄지" 만 남는다.

        몸에서 붉은빛이 천천히 일렁인다. 붉은색은 이 게임에서 "나에게 나쁜
        것" 하나만 말하고 (`ui/theme` 의 `BAD_C`), 돌아선 아군이 정확히
        그것이다. 느리게 도는 이유: 빠르면 맞고 있는 것으로 보인다 —
        맞을 때 몸이 붉게 깜빡이는 것은 이미 다른 뜻으로 쓰고 있다.
      */}
      {charmed && <Charmed size={size} />}
      {/* 보호막이 서 있는 동안 몸을 옅게 감싼다 (`BossFx` 의 `Veil`) */}
      {warded && <Veil size={size} />}
      {shock && <Shocked size={size} />}

      {/* 못 움직이는 동안 계속 붙어 있는 딱지 — `💫기절` */}
      {!!cc && <CcTag text={cc} />}

      {/*
        ── 맞으면 몸이 붉게 깜빡인다 ──

        여기 붉은 네 귀퉁이 표적이 씌워졌었다. 알려 주는 것은 "이 사람이
        맞았다" 하나인데, 54px 짜리 인물 위에 상자를 하나 더 얹느라 화면에서
        차지하는 자리가 그보다 훨씬 컸다.

        같은 그림을 **붉게 한 장 겹치고** 투명도만 굴린다. 자세가 바뀌면
        붉은 쪽도 같이 바뀌므로 늘 정확히 이 사람의 윤곽이고, 자리를 하나도
        더 안 먹는다.

        평타에도 뜬다 — 짧게(240ms) 한 번이라 "늘 붉은 사람" 이 되지 않는다.
        우두머리 특수기(`struck`)만 길게 세 번 깜빡여서, 넷이 다 깜빡이면
        전원기고 하나만 깜빡이면 그 사람만 맞은 것으로 읽힌다.
      */}
      <HurtTint nonce={hurtNo} hard={struck} size={size}>
        <Sprite
          set={ch.id}
          name={frame}
          size={size}
          tint={BAD_C}
          style={{ transform: [{ translateY: Math.round(size * spriteGap(ch.id, frame)) }] }}
          fallbackSet="duel"
          fallbackName={SK_FALLBACK[frame] ?? CUT_FALLBACK[frame] ?? frame}
        />
      </HurtTint>

      {/*
        맞은 숫자 — **머리 바로 위**에서 뜬다.

        -18 에서 시작해 38px 을 더 떠올랐다. 시작 자리도 높고 올라가는 거리도
        길어서, 숫자가 주인과 한참 떨어진 데 떠 있었다.
      */}
      {damage.map((dm, k) => (
        <View
          key={dm.key}
          pointerEvents="none"
          style={{ position: 'absolute', top: -11 - k * 12, left: size * 0.2, zIndex: 40 }}
        >
          {/*
            **붉게 뜬다** (`bad`). 적 위에 뜨는 숫자는 흰색이라, 색만 보고도
            어느 쪽이 깎였는지 안다 — 한 화면에 숫자 여섯 개가 같이 뜨는 일이
            흔하고, 전부 흰색이던 동안은 자리로만 짐작해야 했다.
          */}
          <DamageNumber text={dm.text} dx={0} dy={0} bad onDone={NOOP} />
        </View>
      ))}

      {/*
        기술 이름 — **머리 위 말풍선** (`SkillShout`).

        `bottom: size` 로 다는 이유는 이 상자의 높이가 곧 `size` 이기 때문이다
        (`Sprite` 만 흐름에 있고 나머지는 전부 절대 배치다). 상수로 박아 두면
        무대가 좁아 인물이 줄어들 때(`width`) 말풍선만 제자리에 남는다.

        좌우로 넘치게 두었다 (`left/right: -16`). 이름이 인물보다 넓을 수
        있는데(`화살비!`), 상자 폭에 가두면 가운데 정렬이 그 안에서만
        일어나서 글자가 줄바꿈되거나 잘린다.

        `zIndex` 는 피해 숫자(40)보다 위다. 둘이 겹치는 순간이 있는데,
        그때 가려져야 하는 건 0.9초짜리 외침이 아니라 계속 뜨는 숫자다.
      */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: size + 4,
          left: -16,
          right: -16,
          alignItems: 'center',
          zIndex: 46,
        }}
      >
        <SkillShout nonce={shout.no} name={shout.name} />
      </View>

      {/*
        스킬 이펙트 — 휘두르는 동안 발밑에서 빛이 퍼진다.

        네 번에 한 번뿐인 큰 기술인데 몸짓만 바뀌면 평타와 구분이
        잘 안 된다. 발밑 고리 하나로 "지금 뭔가 다른 걸 한다" 가 읽힌다.
      */}
      <SkillAura
        /*
          **지금 나가는 기술**의 표시를 그린다 (`casting`). `frame` 이 이미
          기술 칸인지를 가려 주므로, 평타 중에는 `casting` 이 -1 이 아니어도
          안 켜진다.
        */
        /*
          기술 동작의 앞 두 칸에서만 켠다. 두 번째 기술은 칸 이름이 다르므로
          (`sk2_*`) 이름을 못 박지 않고 **기술 칸인가 + 마지막이 아닌가**로 본다 —
          못 박아 두면 두 번째 기술에서 발밑이 통째로 안 켜진다.
        */
        on={castSk !== null && castSk.aura !== 'none'
          && /^sk2?_[12]$/.test(frame)}
        kind={castSk?.aura === 'rune' ? 'rune' : 'ring'}
        size={size}
      />

      {/*
        검기 — **검끝에서** 출발한다.

        예전에는 무대 왼쪽 고정 좌표에서 생겼다. 그러면 캐릭터가 앞으로 나가
        있든 뒤에 있든 늘 같은 자리에서 나와서, 검과 따로 놀았다.
        여기(캐릭터 안)에 두면 그 사람이 선 자리에서 자동으로 따라온다.
      */}
      {/*
        날아갈 것이 없는 기술은 여기서 그릴 게 없다. 비앙카의 폭발은
        `sk_3` 그림 안에 이미 들어 있어서, `castNo` 자체가 안 올라간다 —
        이 줄은 그때 `nonce` 가 0 이라 아무것도 안 그린다.
      */}
      {/*
        **하나라도 날아가는 기술이 있으면** 달아 둔다 (`some`).

        지금 쓰는 기술만 보고 달면, 검기가 아직 날아가는 중에 다음 스윙이
        평타로 넘어가면서 이 줄이 통째로 사라진다 — 화면 가운데에서 검기가
        증발한다. 달아 두는 값은 가볍고(`castNo` 가 0 이면 아무것도 안 그린다)
        사라지는 쪽은 눈에 띄므로, 켜 두는 편이 맞다.
      */}
      {(skillsFor(ch).some((sk) => sk.flies) || d.range === 'ranged') && (
        <SwordWave
          charId={ch.id}
          nonce={castNo}
          size={size}
          dist={fly}
          proj={castSk?.proj}
          mul={castSk?.projMul}
        />
      )}

      <Sprite
        set={ch.id}
        name={frame}
        size={size}
        /*
          **발을 상자 바닥에 맞춘다.**

          `Sprite` 는 정사각 상자에 `contain` 으로 그리므로, 가로가 더 긴 칸은
          상자 안에서 위아래 가운데에 놓인다 — 그만큼 발이 떠 있다. 칸마다
          비율이 달라서(비앙카는 `guard` 가 세로형인데 `sk_3` 은 가로형),
          휘두르는 동안 인물이 위아래로 들썩였다.

          `spriteGap` 이 그 뜬 거리를 알려 준다. 아래로 그만큼 밀면 어느 칸에서든
          발이 같은 높이에 놓인다.
        */
        style={{ transform: [{ translateY: Math.round(size * spriteGap(ch.id, frame)) }] }}
        fallbackSet="duel"
        /* §D 를 아직 안 받았으면 §A 의 세 프레임으로 떨어진다 */
        fallbackName={SK_FALLBACK[frame] ?? CUT_FALLBACK[frame] ?? frame}
      />
    </Animated.View>
  );
}

/**
 * **제 것이 바뀔 때만 다시 그린다.**
 *
 * 무대(`BattleView`)는 0.5초 틱마다 다시 그려진다 — 적 체력이 닳고 시간이
 * 줄기 때문이다. 그때마다 파티원 넷까지 통째로 따라 그려지면, 넷의 스프라이트·
 * 불꽃·숫자·회복 표시가 전부 다시 계산된다. 초당 다섯 번씩.
 *
 * 그런데 이 사람에게 실제로 바뀌는 것은 제 체력과 제 머리 위 숫자뿐이다.
 * 콜백은 붙박이로 만들어 두었으므로(`BattleView` 의 `now` ref) 여기서
 * 걸러 내면 대부분의 틱에서 넷 모두 그대로 지나간다.
 *
 * `damage` 만 배열이라 참조로 비교하면 늘 다르다 — 길이와 맨 끝 키만 본다.
 * 숫자는 뒤에 붙고 앞에서 빠지므로 그 둘이 같으면 같은 목록이다.
 */
export const Fighter = React.memo(FighterView, (a, b) => (
  a.ch === b.ch
  && a.back === b.back
  && a.down === b.down
  && a.hp === b.hp
  && a.spd === b.spd
  && a.stun === b.stun
  && a.silent === b.silent
  && a.cut === b.cut
  && a.held === b.held
  && a.noCharge === b.noCharge
  && a.costSeq === b.costSeq
  && a.struck === b.struck
  /* 걸려 있는 것이 바뀌었나 — 배열이 아니라 열쇠로 본다 */
  && a.markKey === b.markKey
  && a.live === b.live
  && a.hitNo === b.hitNo
  && a.hitKind === b.hitKind
  && a.cc === b.cc
  && a.bound === b.bound
  && a.boundWeb === b.boundWeb
  && a.charmed === b.charmed
  && a.warded === b.warded
  && a.shock === b.shock
  && a.turn === b.turn
  && a.purify === b.purify
  && a.canCast === b.canCast
  && a.onCharge === b.onCharge
  && a.bless === b.bless
  && a.x === b.x
  && a.width === b.width
  && a.advance === b.advance
  && a.leapTo === b.leapTo
  && a.onAim === b.onAim
  && a.onSwing === b.onSwing
  && a.onSkill === b.onSkill
  && a.damage.length === b.damage.length
  && a.damage[a.damage.length - 1]?.key === b.damage[b.damage.length - 1]?.key
));
