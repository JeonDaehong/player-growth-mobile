/**
 * 홈 위쪽 — 2D 횡스크롤 자동 전투.
 *
 * ## 배치
 *
 *   왼쪽 = 아군,  오른쪽 = 적.  둘 다 서로를 마주 본다.
 *
 * 스프라이트가 전부 **오른쪽을 보고 그려져 있어서**(`ui/Sprite` 의 `flip` 주석),
 * 아군은 그대로 두고 적만 뒤집는다. 반대로 하면 둘이 같은 방향을 본다.
 *
 * 양쪽 다 벽에서 `EDGE` 만큼 떨어뜨린다. 화면 끝에 딱 붙으면 잘린 것처럼
 * 보이고, 치고 빠지는 동작이 테두리를 넘어가 잘려 나간다.
 *
 * ## 여럿이 나온다
 *
 * 적은 한 마리씩이 아니라 **3×3 격자**로 선다 (`core/autoBattle` 의 `foeCell`).
 * 판마다 4~6 마리가 그중 앞쪽 칸부터 채운다 (`mobCap`). 한 마리씩 내보내면
 * 전투가 아니라 **줄 서기**로 보인다.
 *
 * 파티도 격자다 (`core/party` 의 `FORMATIONS`). 가로줄 다섯이 화면 위아래로
 * 늘어서고, **앞줄·뒷줄은 좌우**다 — 아군이 오른쪽을 보고 서므로 앞줄이
 * 오른쪽, 곧 적 쪽이다. 앞줄에 선 사람이 공격의 70% 를 받으므로
 * (`FRONT_SHARE`), 어느 줄에 서 있나가 화면에서 바로 읽혀야 한다.
 *
 * 위아래는 두 진영이 같은 뜻이다: **뒤로 갈수록 위에, 작게** (`Ground` 의
 * `depthAt`). 그게 이 무대가 평면으로 읽히는 이유다.
 *
 * 넷이 한 줄로 겹쳐 서던 시절에는 "앞에 서는 건 방어 역할" 하나였다. 지금은
 * 대형이 **몇 명이 그 자리에 서나**를 정한다.
 *
 * ## 상태를 안 들고 있다
 *
 * 전투는 `state/slices/roster` 의 `battleTickOnce` 가 굴리고, 여기는 그 결과를
 * 비추기만 한다. 화면이 전투를 굴리면 화면을 떠날 때 전투가 멈춘다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { useBattleUi } from '@/state/battleUi';
import {
  BOSS_SKILLS, MOB_CAP, STAGE_MS, bossReady, fightHeld, foeAt as kindAt, foeCell,
  foeHexOf, foeOf, healPlan, mobCap, pickAim,
  RAGE_MS, rageIn, raging, rowMelee, skillDamage,
  skillTargets, stageOf, targetOf,
} from '@/core/autoBattle';
import { CHARS, projFrame, projSet, skillOf, skillsFor, statOf } from '@/core/chars';
import {
  FORMATIONS, FormSpot, formationSpots, hpOf, livingMembers, members, partyStat, seatRows,
} from '@/core/party';
import {
  CC, Hex, STATUS_MARK, STATUS_NAME, STUN, hasHex, hexOf, stunned,
} from '@/core/status';
import { Mark, NO_MARK, foeMarksOf, liveSpd, marksOf } from '@/core/passives';
import { cleanseOptOf, cleanseTargets } from '@/core/skillOpt';
import { Bar, Row, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { SPRITE_RATIO, spriteGap } from '@/ui/spriteAssets';
import { BAD_C, C, FS, R, SHIELD_C, SP, SURF, WHITE } from '@/ui/theme';
import { FoeMarks } from './StatusRow';
import { SkillFx } from './SkillFx';
import {
  BODY_HIT, BodyKind, BossKind, BossShot, BossSideFx, Burst, Charging, Fuse, FxPlan,
  ShotKind, Tide, blowFx, castFx, useLeap,
} from './BossFx';
import {
  BossCall, DamageNumber, FallingArrow, FOE_SHOT_MS, FoeShot, HitBurst, MarkNotes,
  RageCall, SkillShout, shotMsOf, useShake,
} from './HitFx';
import { Fighter, Swing } from './Fighter';
import {
  BOSS_W, DEPTH_LIFT, EDGE, FOE_W, GROUND_H, Ground, PARTY_W, STAGE_H, ZOOM, depthAt,
} from './Ground';
import {
  BossCallBtn, StagePicker, StageVeil, useStageStaging, walkInX,
} from './StageIntro';

/** 무대 높이 */
/** 아무것도 안 하는 콜백 — 매 렌더마다 새로 만들면 애니메이션이 되감긴다 */
const NOOP = () => {};

/* 무대 치수는 `Ground` 에 모여 있다 — 배율 한 줄로 같이 커진다 */
/**
 * 맨 앞줄의 발이 놓이는 높이.
 *
 * 바닥판(`GROUND_H` = 185px)의 **앞쪽 34%** 지점, 곧 63px 이다.
 *
 * 30% 였다가 올렸다. 무대 왼쪽 아래에 채팅이 얹히면서 (`Ticker`) 바닥의
 * 아래 53px 이 가려졌는데, 예전 값이면 맨 앞줄의 발이 그 안에 들어가서
 * **파티가 무릎까지 채팅에 묻혔다.**
 *
 * 34% 면 앞줄 발밑에 63px 이 남아 채팅(53px)이 통째로 들어간다. 그러고도
 * 위로 다섯 줄이 다 선다: `63 + 4 × DEPTH_LIFT` = 159 ≤ 185.
 *
 * 예전에 여기서 한 칸(`DEPTH_LIFT`)을 빼고 있었다. 자리 간격이 11 에서 20 으로
 * 커지면서 그 뺄셈이 바닥의 12% 나 되어 버렸으므로, 비율 하나로 합쳤다.
 */
const FLOOR = Math.round(GROUND_H * 0.34);

/**
 * 배경 그림의 세로 비율 (높이 ÷ 폭).
 *
 * 그림마다 다르다 — 잘라 낸 아래 빈 곳이 그림마다 달라서다. 폭을 무대에 맞춰
 * 늘릴 때 이 비율로 높이를 잡아야 안 찌그러진다. 모르는 그림은 4:3 으로 둔다.
 */
const bgRatio = (bg: string) => SPRITE_RATIO[`bg_chapter/${bg}`] ?? 0.75;
/** 양쪽 벽에서 띄우는 거리 — 붙으면 잘린 것처럼 보인다 */


/** 맨 앞 아군 스프라이트 폭. 뒤로 갈수록 `depthAt` 이 줄인다 */

/**
 * 앞줄이 뒷줄보다 **얼마나 오른쪽에** 서나 — 인물 폭의 몇 할.
 *
 * 앞뒤는 화면 위아래가 아니라 **적을 바라본 좌우**다 (`core/party` 의 대형
 * 설명). 아군이 왼쪽에서 오른쪽을 보므로 앞줄이 오른쪽이다.
 *
 * 0.80 이다. 인물이 76px 이니 61px 쯤 벌어진다 — 칸이 76px 이므로 9px 이
 * 겹치는데, 스프라이트가 정사각 칸 안에 `contain` 으로 들어가 실제 그림은
 * 칸보다 좁으므로 (`ui/Sprite`) 화면에서는 딱 붙어 선 정도로 보인다.
 *
 * 0.62 로 시작했다가 올렸다. 그때는 두 줄이 23px 씩 파고들어서 `2-2` 의
 * 네 사람이 두 덩어리로 뭉쳤다. 반대로 1.0 이면 두 줄 사이에 사람 하나가
 * 통째로 들어갈 틈이 생겨 파티가 둘로 갈려 보인다.
 *
 * 이 값이 곧 아군 구역의 폭이다 (`formLayout`). 넓으면 대형 전체가 통째로
 * 줄어든다 (`fitOf`) — 적도 격자로 서므로 (`foeLayout`) 둘이 폭을 나눠 쓴다.
 */
const ROW_RATIO = 0.80;

/**
 * 한 줄 물러날 때마다 **오른쪽으로** 비끼는 폭 — 인물 폭의 몇 할.
 *
 * 다섯 가로줄을 x 가 같은 자리에 세우면 넷이 한 줄로 위로 쌓인다. 바닥은
 * 위로 갈수록 좁아지는 사다리꼴인데 (`Ground` 의 `BACK_W`) 인물만 수직으로
 * 서면 뒤에 선 사람이 바닥 밖으로 나간 것처럼 보인다.
 *
 * 0.10 이면 네 줄에 걸쳐 30px 쯤 기운다. 바닥 기울기를 따라가면서도, 뒷줄이
 * 앞줄을 앞지를 만큼은 아니다 (`ROW_RATIO` 가 그 여섯 배다).
 */
const LANE_SKEW = 0.10;

/**
 * 적 세로줄 하나가 옆 줄과 벌어지는 거리 — 적 폭의 몇 할.
 *
 * 적도 아군처럼 **격자**로 선다 (`core/autoBattle` 의 `foeCell`). 세로줄이
 * 좌우, 가로줄이 위아래다.
 *
 * 0.62 다. 아군의 `ROW_RATIO`(0.80)보다 좁은데, 적은 세로줄이 셋이라 같은
 * 값을 쓰면 줄 세 개가 무대 절반을 먹는다. 0.62 면 옆 줄과 조금 겹치는데,
 * 그게 오히려 **무리**로 보인다 — 뚝 떨어져 서면 각자 다른 데 있는 놈이 된다.
 */
const FOE_COL_RATIO = 0.62;

/**
 * 적 가로줄 하나가 **몇 칸씩** 물러나나 (`Ground` 의 `depthAt`).
 *
 * 1 이 아니라 2 다. 1 이면 세 줄이 24px 씩만 벌어지는데 (`DEPTH_LIFT`) 잡몹이
 * 95px 쯤 되므로, 한 세로줄에 선 셋이 거의 다 포개져서 **한 마리로 보였다.**
 *
 * 2 면 48px 씩이라 세 줄이 96px 에 걸쳐 선다. 아군의 `3-1`·`1-3` 이 ①③⑤ 를
 * 쓸 때와 정확히 같은 간격이라 (`core/party` 의 `FORM_LANES`), 두 진영의
 * 위아래 리듬이 맞는다.
 *
 * 땅에 다 들어간다: `FLOOR + 2 × 2 × DEPTH_LIFT` = 159 ≤ `GROUND_H`(185).
 */
const FOE_LANE_STEP = 2;

/**
 * 그 자리가 **몇 칸 물러나 있나** — 크기와 높이가 다 이 값에서 나온다.
 *
 * 혼자 서는 놈은 예외로 맨 앞줄이다. 자리 채우기는 가운데 줄부터 시작하는데
 * (`LANE_FILL`) 우두머리는 늘 그 한 자리만 쓰므로, 규칙대로면 **혼자인데도
 * 48px 떠서 16% 작게** 그려진다. 우두머리 크기(`BOSS_W`)는 제 몸으로 잰
 * 값이라 거기서 더 줄면 잡몹과의 차이가 흐려진다.
 *
 * 흩어질 상대가 없으면 흩어질 이유도 없다.
 */
const foeDepth = (pos: number, cap: number) => (
  cap <= 1 ? 0 : foeCell(pos).lane * FOE_LANE_STEP
);

/**
 * 혼자 선 놈(= 우두머리)을 바닥에서 얼마나 더 띄우나.
 *
 * "보스가 너무 아래에 있다 — 한 칸만 위로." 우두머리는 `foeDepth` 가 0 이라
 * 땅의 맨 앞줄, 곧 **`FLOOR` 바로 위**에 선다. 그 자리는 화면 아래 끝에서
 * 63px 인데 채팅이 그 아래 53px 을 쓰므로 (`Ticker`), 132px 짜리 몸이
 * 발밑까지 꽉 차 보였다.
 *
 * ## 크기는 안 줄인다
 *
 * `foeDepth` 를 1 로 올리면 될 것 같지만 그러면 `depthAt` 이 **8% 작게도**
 * 그린다. 우두머리 크기는 잡몹과의 차이를 만들려고 잰 값이라 (`BOSS_W`),
 * 뒤로 물러났다고 줄이면 그 차이가 흐려진다.
 *
 * 원근을 어기는 셈이지만 어길 것이 없다 — 저쪽 편에 다른 것이 하나도 없어서
 * 크기를 견줄 대상이 아예 없다. 잡몹 격자에는 그대로 원근이 산다
 * (`FOE_LANE_STEP`).
 */
const BOSS_LIFT = DEPTH_LIFT;

/**
 * 근접끼리 맞붙었을 때 남기는 틈.
 *
 * 이 한 값이 "얼마나 붙어서 싸우나" 를 정한다. 세 번 조정했다.
 *
 *   틈 104 (나가는 거리 고정 40) — 허공에 휘두르는 것으로 보였다
 *   틈  22                        — 너무 붙어서 한 덩어리로 뭉쳤다
 *   틈  60                        — 지금
 */
/**
 * 맞붙은 두 사람 사이에 남길 틈(px).
 *
 * **오랫동안 이 값이 화면에 안 나타났다.** 적 줄의 앞뒤가 뒤집혀 있어서, 여기서
 * 60 을 남겨도 실제로 싸우는 둘 사이는 150px 쯤 벌어져 있었다 — 적 줄 나머지가
 * 통째로 그 사이에 끼어 있었기 때문이다. 줄을 바로잡고 나니 이 값이 곧 화면에
 * 보이는 틈이 되었고, 그래서 36 으로 다시 잡았다.
 *
 * 스프라이트가 52~54px 이므로 36px 이면 서로 팔이 닿는 거리다. 0 으로 두면
 * 겹쳐서 몇 마리인지 안 보인다.
 */
const CLASH_GAP = Math.round(36 * ZOOM);

/**
 * 겹치지만 않으면 되는 최소 틈.
 *
 * `CLASH_GAP` 은 "이만큼 떨어져 보이면 좋겠다" 이고, 이건 "이보다 가까우면
 * 서로 파고든다" 다. 좁은 화면에서는 앞의 것을 포기하고 이것만 지킨다.
 */
const MIN_GAP = Math.round(12 * ZOOM);

/**
 * 한 줄이 차지하는 가로 폭.
 *
 * 앞사람은 제 크기 그대로고, 뒤로 갈수록 `depthAt` 이 줄이면서 서로 겹친다.
 * 이걸 안 세면 "앞사람이 어디까지 나와 있나" 를 알 수 없다.
 */
/**
 * 이 자리에 이미 떠 있는 숫자가 몇 개인가 — 그만큼 위로 올린다.
 *
 * 두 가지를 같이 푼다. 같은 적을 연달아 때리면 숫자가 한자리에 포개지고,
 * 스킬로 셋을 한꺼번에 베면 **옆 놈끼리도** 겹친다. 적은 세로줄 간격이
 * 45px 인데다 같은 세로줄에 셋이 위아래로 서므로 (`foeLayout`), 이웃 사이가
 * 숫자 한 개 폭밖에 안 되기 때문이다.
 *
 * 그래서 기준을 이웃 간격보다 넓게(28px) 잡는다. 옆 놈과도 줄이 갈린다.
 */
const NUM_GAP = Math.round(28 * ZOOM);

function rowFor(live: readonly { x: number }[], x: number): number {
  return live.filter((h) => Math.abs(h.x - x) < NUM_GAP).length;
}

/**
 * 못 움직이게 하는 것이 걸려 있으면 그 딱지 (`💫기절`). 없으면 빈 글자.
 *
 * **하나만 돌려준다.** 기절과 침묵이 같이 걸릴 수 있는데, 둘을 다 붙이면
 * 40px 인물 위에 딱지가 두 줄이 되어 정작 인물이 안 보인다. 몸을 못 쓰는
 * 쪽이 이긴다 (`core/status` 의 `STUN`) — 그러면 어차피 스킬도 못 쓰므로
 * 침묵은 그 안에 들어 있다.
 */
function ccOf(hex: readonly Hex[]): string {
  const on = hex.filter((h) => h.ms > 0 && CC.has(h.id));
  if (!on.length) return '';
  const pick = on.find((h) => STUN.has(h.id)) ?? on[0];
  return `${STATUS_MARK[pick.id] ?? ''}${STATUS_NAME[pick.id]}`;
}

/**
 * 도화선이 붙은 놈만 깜빡이게 감싼다 (`BossFx` 의 `Fuse`).
 *
 * 껍데기 하나를 더 두는 이유: `Fuse` 는 `Animated.View` 를 만들고 그 안에서
 * 시계를 돌린다. 서른 판 중 26판의 애벌레 넷만 도화선이 있는데, 조건 없이
 * 감싸면 **모든 적이** 아무 일도 안 하는 시계를 하나씩 들고 서 있게 된다.
 *
 * 갈래를 컴포넌트로 뺀 것은 훅 규칙 때문이다 — 그리는 자리에서 `ms` 가
 * 있을 때만 `Fuse` 를 부르면 그 갈래가 렌더마다 훅 개수를 바꾼다.
 */
function FuseWrap(
  { ms, children }: { ms?: number; children: React.ReactNode },
) {
  if (ms === undefined || !Number.isFinite(ms)) return <>{children}</>;
  return <Fuse ms={ms}>{children}</Fuse>;
}

/** 한 줄이 먹는 높이 */
const NUM_STEP = 12;
/**
 * 숫자가 **스스로 떠오르는** 높이 (`HitFx` 의 `DamageNumber`).
 *
 * 놓인 자리에서 위로 20px 을 더 간다. 그러니 놓는 자리가 그보다 낮으면
 * 떠오르는 동안 무대 밖으로 나가고, 거기는 잘린다 (`overflow: hidden`).
 */
const NUM_RISE = 22;

/**
 * 피해 숫자를 **어느 높이에** 놓을까.
 *
 * ## 우두머리가 커지면서 잘렸다
 *
 * 숫자는 늘 머리 위로 쌓았다. 겹치는 것마다 12px 씩 더 위로 — 잡몹은 몸이
 * 73px 이라 머리 위에 100px 가까이 남으므로 일곱 줄을 쌓아도 남는다.
 *
 * 우두머리는 132px 이다. 머리가 무대 천장에서 49px 아래에 있고, 숫자는
 * 놓인 자리에서 22px 을 더 떠오른다. **두 줄이면 천장에 닿는다.** 셋째
 * 줄부터는 무대 밖에 놓여서 통째로 안 보였다 — 파티 넷이 한 놈을 치면
 * 늘 그렇게 된다.
 *
 * ## 자리가 없으면 방향을 바꾼다
 *
 * 위로 쌓을 수 있는 줄 수를 먼저 센다. 그 안에 드는 줄은 그대로 머리 위로,
 * 넘치는 줄은 **머리 아래로** 내려 쌓는다 — 우두머리는 몸이 크므로 그
 * 자리가 곧 제 몸 위다.
 *
 * 몸 위에 놓인 흰 숫자가 흰 그림에 묻히지 않는 것은 숫자 쪽이 검은 그림자를
 * 지고 있기 때문이다 (`DamageNumber`).
 *
 * 잡몹은 이 함수가 있으나 마나다 — `fits` 가 일곱이라 늘 첫째 갈래로 간다.
 * 우두머리에게만 필요한 규칙을 우두머리라고 적지 않은 이유는, **몸 크기가
 * 정하는 일**이라서다. 우두머리를 더 키우거나 잡몹을 키워도 따라온다.
 */
function numTop(y: number, row: number): number {
  const head = y - 11;
  const fits = Math.max(1, Math.floor((head - NUM_RISE) / NUM_STEP) + 1);
  return row < fits
    ? head - row * NUM_STEP
    : head + (row - fits + 1) * NUM_STEP;
}

/**
 * 무대 폭에 맞춰 양쪽 대형을 얼마나 줄일까 (0~1).
 *
 * 무대를 1.4배로 키웠더니(`Ground` 의 `ZOOM`) 좁은 기기에서 두 무리가 화면을
 * 넘었다. 260px 짜리 화면도 있다.
 *
 * 치수가 전부 배율에 **정비례**하므로 필요한 폭도 정비례한다. 그래서 한 번
 * 나누면 답이 나온다 — 크기마다 따로 계산할 것이 없다.
 *
 * 두 무리가 다 격자로 서면서(`formLayout` · `foeLayout`) 이 값이 거의 늘 1 이
 * 되었다. 예전에는 적 여섯이 한 줄로 251px 을 먹었는데, 세로줄 둘이면
 * 118px 이다 — 겹쳐 짜내는 장치(`squeezeFor`)를 통째로 지운 것이 그래서다.
 *
 * @param allyW 배율 1 기준 아군 격자의 폭
 * @param foeW  배율 1 기준 적 격자의 폭
 */
function fitOf(stageWidth: number, allyW: number, foeW: number): number {
  if (stageWidth <= 0) return 1;
  const need = allyW + foeW + EDGE * 2 + MIN_GAP;
  return Math.min(1, stageWidth / Math.max(1, need));
}

/**
 * 대형의 **자리와 폭** (배율 1 기준으로도, 실제 배율로도 같은 식을 쓴다).
 *
 * ## 앞뒤는 좌우다
 *
 * 한 번 **위아래**로 그렸다가 통째로 뒤집었다. 그때는 다섯 칸이 가로였고
 * 앞뒤가 세로였는데, 그러면 앞줄과 뒷줄이 적에게서 **같은 거리**에 서 있게
 * 된다 — 앞에 세워 막는다는 말이 화면에서 아무것도 뜻하지 않았다.
 *
 * 지금은 반대다. 다섯 줄(`lane`)이 화면 위아래로 늘어서고, 앞뒤가 좌우다.
 * 아군은 왼쪽에서 오른쪽을 보므로 **앞줄이 오른쪽**, 곧 적 쪽이다.
 *
 * ## 뒤로 갈수록 오른쪽으로 기운다
 *
 * `LANE_SKEW` 만큼씩. 바닥이 위로 갈수록 좁아지므로 (`Ground`) 수직으로
 * 쌓으면 위에 선 사람이 땅 밖으로 나간 것처럼 보인다.
 *
 * ## 자리를 0 에서 시작하게 민다
 *
 * 통째로 밀어서 제일 왼쪽 사람이 0 에 오게 맞춘다 — 그래야 아군 구역의
 * 폭이 곧 대형의 폭이고, 그 폭으로 배율을 잰다 (`fitOf`).
 */
function formLayout(spots: readonly FormSpot[], base: number): {
  x: number[]; width: number;
} {
  if (!spots.length) return { x: [], width: 0 };
  const gap = base * ROW_RATIO;
  const skew = base * LANE_SKEW;
  const raw = spots.map((sp) => sp.lane * skew + (sp.row === 'front' ? gap : 0));
  const min = Math.min(...raw);
  const x = raw.map((v) => Math.round(v - min));
  /* 뒤에 선 줄은 작게 그려지므로 (`depthAt`) 오른쪽 끝도 그만큼 덜 나간다 */
  const sizeOf = (sp: FormSpot) => Math.round(base * depthAt(sp.lane).scale);
  return {
    x,
    width: Math.max(...x.map((v, i) => v + sizeOf(spots[i]))),
  };
}

/**
 * 자리마다의 **제 크기 배수** (`FoeKind.scale`). 없는 자리는 1 이다.
 *
 * 26판 폭탄 애벌레가 이걸 만들게 했다. 넷이 우두머리 자리에 서지만 실제로
 * 그려지는 것은 그 절반이다 (`scale: 0.5`). 여태 줄 폭은 **그리는 크기와
 * 상관없이** 우두머리 폭(131px)으로 잡았으므로, 네 자리에 524px 이 필요하다고
 * 셈했다 — 그러면 좁히기가 최대로 걸려서 넷이 한 덩어리로 겹쳤다.
 * "1 2 3 4 위치로 보이는게 아님" 이 그것이다.
 */
type Scales = readonly number[];

/**
 * 적 격자의 **자리 · 높이 · 크기 · 폭** (배율 1 기준으로도, 실제 배율로도 같다).
 *
 * 아군의 `formLayout` 과 짝이다. 다른 점은 칸을 대형이 아니라 자리 번호가
 * 정한다는 것뿐이다 (`core/autoBattle` 의 `foeCell`) — 적은 대형을 안 고른다.
 *
 * ## 한 줄이 아니라 격자다
 *
 * 여태 적은 **한 줄로 비스듬히** 섰다. 여섯 마리면 뒤로 갈수록 작아지며
 * 오른쪽으로 물러나는 줄 하나였는데, 그건 무리가 아니라 **줄 서 있는 것**으로
 * 보였고 폭도 251px 이나 먹었다.
 *
 * 3×3 격자로 바꾸니 세로줄 둘에 118px 이다. 무리로 보이고, 남는 폭은 전부
 * 아군 대형과 둘 사이의 틈으로 간다.
 *
 * @param cap   그릴 자리 수 (서 있는 마릿수가 아니다)
 * @param base  자리 하나의 기준 폭 (`FOE_W` 또는 `BOSS_W`)
 * @param scale 자리별 제 크기 배수 (`FoeKind.scale`)
 */
function foeLayout(cap: number, base: number, scale: Scales): {
  x: number[]; lift: number[]; size: number[]; width: number;
} {
  const n = Math.max(1, cap);
  const step = base * FOE_COL_RATIO;
  const x: number[] = [];
  const lift: number[] = [];
  const size: number[] = [];
  /* 혼자면 우두머리다 — 한 칸 띄우되 크기는 그대로 둔다 (`BOSS_LIFT`) */
  const lone = n <= 1 ? BOSS_LIFT : 0;
  for (let p = 0; p < n; p++) {
    const { col } = foeCell(p);
    /* 가로줄은 한 칸이 아니라 두 칸씩 물러난다 (`FOE_LANE_STEP`) */
    const d = depthAt(foeDepth(p, n));
    x.push(Math.round(col * step));
    lift.push(d.lift + lone);
    size.push(Math.round(base * d.scale * (scale[p] ?? 1)));
  }
  return { x, lift, size, width: Math.max(1, ...x.map((v, i) => v + size[i])) };
}

/**
 * 원거리가 근접보다 **몇 px 뒤에** 서나.
 *
 * 처음엔 "근접이 나가는 거리의 몇 할" 로 뒀다 (절반). 그런데 비율은 화면이
 * 넓어질수록 격차가 같이 벌어진다 — 좁은 화면에서 40px 뒤였던 궁수가 넓은
 * 화면에서는 240px 뒤에 혼자 남았다. 붙어서 싸우는 무리와 뒤에서 쏘는 사람이
 * 아니라, 아예 다른 데 있는 사람으로 보였다.
 *
 * 고정 거리로 두면 화면 폭과 무관하게 늘 같은 만큼만 뒤에 선다.
 */
const RANGED_BACK = Math.round(4 * ZOOM);

/**
 * 우두머리가 날리는 것의 크기 (px).
 *
 * 뜻은 놓의 크기를 안 따른다. 뒷줄 잡몹은 **제 그림을 줄여** 날리므로
 * (`FoeShot`) 몸집이 그대로 따라가는 게 맞는데, 우두머리는 132px 이라 그
 * 비율대로 잡으면 **우두머리만 한 덩어리가 하나 더** 날아간다.
 */
const BOSS_SHOT_W = Math.round(24 * ZOOM);

/** 뒷줄일수록 덜 나간다 — 같은 줄이 한 점에 겹치지 않게 */
const DEPTH_STEP = Math.round(8 * ZOOM);

/**
 * 적이 자리마다 아군 쪽으로 나와 있는 거리(px). 자리 번호 순.
 *
 * **격자가 되면서 아주 단순해졌다.** 예전에는 한 줄로 서므로 뒤엣놈이
 * 앞엣놈을 앞지르지 못하게 막아야 했는데(`advanceRow`, 지웠다), 지금은
 * 세로줄이 좌표로 못 박혀 있어서 (`foeLayout`) 앞지를 수가 없다.
 *
 * 남은 규칙은 하나다: **던지는 놈은 조금 덜 나온다** (`RANGED_BACK`).
 * 세로줄 간격이 45px 이고 이 값은 6px 이라, 줄 순서는 절대 안 뒤집힌다.
 *
 * 화면에 그릴 때(`transform`)와 자리를 잴 때(`spotOf`)가 같은 값을 봐야
 * 한다 — 예전에 둘이 갈라져서, 이펙트가 서 있는 자리와 다른 데서 터졌다.
 *
 * @param melee 자리마다 붙어 싸우는 종인가 (`rowMelee`)
 */
function foeAdvance(melee: readonly boolean[], cap: number, closeIn: number): number[] {
  return Array.from({ length: Math.max(1, cap) }, (_v, p) => Math.max(0, Math.round(
    closeIn - (melee[p] === false ? RANGED_BACK : 0),
  )));
}

/**
 * 근접이 적 쪽으로 걸어 나가는 거리(px).
 *
 * ## 처음 계산이 틀렸다
 *
 * "무대 절반 − 벽여백 − 스프라이트 하나" 로 쟀다. 그런데 **줄에는 여러 명이
 * 선다.** 아군 넷이면 줄이 142px 이고, 맨 앞 사람은 벽에서 142px 떨어진
 * 자리에 이미 서 있다. 그걸 안 빼고 68px 씩 더 걸어 나가게 했으니, 파티가
 * 찰수록 서로 파고들었다 — 넷 대 셋이면 90px 이나 겹쳤다.
 *
 * 그래서 **지금 실제로 벌어져 있는 틈**에서 역산한다.
 *
 *   지금 틈 = (무대폭 − 벽여백 − 적줄폭) − (벽여백 + 아군줄폭)
 *   각자 나갈 거리 = (지금 틈 − 남길 틈) ÷ 2
 *
 * 이러면 사람 수가 몇이든, 화면이 몇 px 이든 틈이 `CLASH_GAP` 으로 일정하다.
 * 이미 그보다 가까우면 0 이라 제자리다 — 좁은 화면에서 억지로 파고들지 않는다.
 *
 * ## 두 무리의 폭은 **격자가 정한다**
 *
 * 서 있는 마릿수로 재면 안 된다. 슬라임이 한 마리 죽을 때마다 폭이 줄고,
 * 그만큼 아군이 앞으로 **순간이동**한다 — 0.5초마다 마리 수가 바뀌므로
 * 파티가 계속 튀었다.
 *
 * 격자의 폭은 **자리 수**에서 나오고 (`foeLayout` · `formLayout`) 자리는
 * 판 내내 고정이다. 적이 줄면 그냥 빈 칸이 생길 뿐 아무도 안 움직인다.
 */
function closeInFor(stageWidth: number, allyW: number, foeW: number): number {
  if (stageWidth <= 0) return 0;
  const f = fitOf(stageWidth, allyW, foeW);
  const gapNow = stageWidth - (EDGE * 2 + foeW + allyW) * f;
  return Math.max(0, Math.round((gapNow - CLASH_GAP * f) / 2));
}
/**
 * 적이 한 번 때리는 간격.
 *
 * 파티원이 800~1500ms 마다 휘두르므로 (`Fighter`), 적도 그 근처여야
 * 주고받는 것처럼 보인다. 이보다 짧으면 다시 숫자 도배가 된다.
 */
const FOE_BEAT_MS = 1100;

/**
 * 적이 화면 밖에서 제 자리까지 걸어오는 데 걸리는 시간 (ms).
 *
 * 새 잡몹이 0.5초마다 들어오므로(`SPAWN_TICKS`) 그보다 길게 잡으면 둘이
 * 겹쳐 걸어온다. 그게 오히려 무리가 몰려오는 것처럼 보여서 그대로 둔다.
 */
const WALK_IN_MS = 620;



/**
 * 파티가 받은 피해 한 줄.
 *
 * 적에게 들어간 피해는 여기 안 온다 — 파티원이 휘두를 때 `onSwing` 이
 * 적 쪽에 직접 띄운다 (`hits`). 둘을 한 곳에서 다루면 한 대에 숫자가
 * 두 번 뜬다.
 */
interface Pop {
  key: number;
  /** 맞은 사람 (CharId) — 그 사람 머리 위에 뜬다 */
  who: string;
  text: string;
}

/**
 * 무대 위에 **얹히는** 것들.
 *
 * 요즘 모바일 게임의 화면이 다 이 모양이다 — 위 띠도 채팅도 배경 그림 위에
 * 떠 있고, 그 뒤로 하늘과 풍경이 그대로 비친다. 띠를 무대 **밖 위**에 두면
 * 화면이 "게임 창 + 정보 창" 두 덩이가 되고, 그러면 게임이 작아 보인다.
 *
 * 무대가 화면에 붙박이라 (`HomeScreen`) 아래를 아무리 굴려도 이것들은
 * 그대로 있다.
 */
interface Props {
  /** 무대 맨 위에 얹히는 것 — 위 띠 (`TopBar`) */
  top?: React.ReactNode;
  /** 무대 왼쪽 아래에 얹히는 것 — 흐르는 세 줄 (`Ticker`) */
  corner?: React.ReactNode;
}

export function BattleView({ top, corner }: Props = {}) {
  const battle = useGame((s) => s.battle);
  const party = useGame((s) => s.party);
  const rawChars = useGame((s) => s.chars);
  const strikeFoe = useGame((s) => s.strikeFoe);
  const skillFoe = useGame((s) => s.skillFoe);
  const skillOpts = useGame((s) => s.skillOpts);
  /* 앞줄·뒷줄을 나누는 값 — 계산도 화면도 같은 것을 본다 (`core/party`) */
  const form = useGame((s) => s.formation);
  const goStage = useGame((s) => s.goStage);
  const callBossNow = useGame((s) => s.callBossNow);
  /*
    ── 화면도 **앉힌 명부**를 본다 ──

    전투는 대형에 앉힌 몸으로 계산한다 (`core/party` 의 `seatRows` — 앞줄은
    체력 1.1배, 뒷줄은 공격 1.15배). 화면이 맨 몸 수치를 읽으면 **최대 체력이
    두 값으로 갈린다**: 계산은 330 을 최대로 보고 화면은 300 을 최대로 보므로,
    30 을 맞은 사람이 화면에서는 여전히 가득 찬 채로 서 있게 된다.

    `useMemo` 를 안 쓴다. 네 명짜리 명부를 한 번 베끼는 일이라, 기억해 두는
    비용이 다시 만드는 비용보다 크다.

    파티에 없는 사람은 `row` 가 안 붙으므로 (`seatRows`) 창고 목록은 그대로
    맨 몸 수치다 — 캐릭터끼리 견주는 자리에서 대형이 끼어들면 안 된다.
  */
  /*
    ── `useMemo` 가 **반드시** 있어야 한다 ──

    `seatRows` 는 명부를 베껴서 돌려준다 (`{...chars}`). 그냥 부르면 렌더마다
    새 객체이고, 이 값은 아래 갈래의 딸림값에 들어 있다.

    그러면 **갈래가 매 렌더 다시 돈다.** 그 갈래는 정리 함수에서 예약해 둔
    시계를 전부 지우므로 (`late.forEach(clearTimeout)`), 실제로 이런 일이
    일어났다.

      · 피해 숫자와 붉은 깜빡임이 `lead` 만큼 미뤄져 있다가 **취소된다** —
        "맞았는데 데미지가 안 닳거나 타이밍이 이상하게 닳는다"
      · 200ms 뒤에 휘두름을 끄는 시계도 취소된다 — 적이 **공격 자세로
        굳는다** ("몹들이 Idle 상태가 아니라 공격모션 상태다")

    딸림값이 원본 셋(`party` · `rawChars` · `form`)이므로, 저 셋이 안 바뀌면
    같은 객체가 그대로 나온다.
  */
  const chars = React.useMemo(
    () => seatRows(party, rawChars, form),
    [party, rawChars, form],
  );
  /* ⚠ 테스트용 — 아래 TEST 단추가 부른다. 출시 전에 같이 지운다 */
  const rageNow = useGame((s) => s.rageNow);

  const mob = foeOf(battle.stage, false);
  /*
    `cur` 는 **이 스테이지의 주력**이다 — 배경 그림과 대형 계산에 쓴다.
    한 줄에 여러 종이 섞여 서므로, 그림과 체력은 마리마다 제 종을 읽는다.
  */
  const cur = foeOf(battle.stage, battle.boss);
  const ps = partyStat(party, chars);
  const line = members(party, chars);
  /*
    살아 있는 사람들 — **패시브가 이걸 본다.**

    쓰러진 사람의 패시브는 꺼진다 (`core/passives`). 그래서 사제가 죽으면
    남은 셋의 공격력이, 활잡이가 죽으면 넷의 공격속도가 그 자리에서 떨어진다.
  */
  /*
    쓰러졌지만 버프가 아직 사그라드는 중인 사람도 센다 (`FADE_MS`).

    아녜스가 죽어도 2초 동안은 넷의 공격력이 그대로다 — 그동안 로고가
    깜빡이며 "곧 없어진다" 를 말한다. 계산과 화면이 **같은 목록**을 봐야
    깜빡임이 끝나는 순간과 수치가 떨어지는 순간이 같아진다.
  */
  const aliveLine = livingMembers(party, chars, battle.hp, battle.fade);

  /*
    ── 사람마다 지금 걸려 있는 것 ──

    파티 칸도 같은 것을 잰다 (`PartyBar` → `StatusRow`). 저쪽은 **늘 그리는**
    쪽이고 이쪽은 **새로 걸린 것만 골라 한 줄 띄우는** 쪽이라, 같은 목록을
    두 군데서 읽는다.

    한 군데서 재서 넘기지 않는 이유는 두 화면이 형제라서다 — 공통 조상은
    `HomeScreen` 인데 거기까지 올리면 걸린 것 하나 바뀔 때마다 화면 전체가
    다시 그려진다. `marksOf` 는 배열 몇 개를 훑는 것이 전부다.

    **열쇠만 이어 붙인 글자를 같이 만든다.** 배열은 매번 새로 만들어지므로
    참조로는 "바뀌었나" 를 물을 수가 없다 (`Fighter` 의 `markKey`).
  */
  const markOf = React.useMemo(() => {
    const out: Record<string, { marks: readonly Mark[]; key: string }> = {};
    for (const c of members(party, chars)) {
      const marks = marksOf(
        c.id,
        hpOf(c, battle.hp),
        statOf(c).hp,
        hexOf(battle.hex, c.id),
        aliveLine,
        battle.fade,
      );
      out[c.id] = {
        marks,
        key: marks.map((m) => `${m.set}:${m.name}`).join(','),
      };
    }
    return out;
  }, [party, chars, battle.hp, battle.hex, battle.fade, aliveLine]);

  /** 판 연출 중인가 — 그동안은 아무도 안 휘두른다 (`Fighter` 의 `held`) */
  const held = fightHeld(battle);

  const down = battle.down > 0;
  const empty = ps.count === 0;

  const [pops, setPops] = useState<Pop[]>([]);
  const seq = useRef(0);
  /** 지난 틱의 사람별 체력 — 얼마나 깎였는지 재려고 */
  const prevHp = useRef<Record<string, number>>({});
  /** 지난번에 본 "적이 실제로 친 횟수" — 지속 피해와 가르려고 */
  const prevSwing = useRef(0);

  /** 맨 앞 적이 맞고 밀리는 동작 */
  const knock = useRef(new Animated.Value(0)).current;
  /** 무대 전체 흔들기 */
  const shake = useShake();

  /*
    지금 터지고 있는 타격 연출들.

    파티원 넷이 각자 제 박자로 치므로 (`Fighter`), 한 번에 여러 개가 겹친다.
    스토어에 안 담는다 — 저장되는 값이 아니고, 담으면 초당 예닐곱 번 저장
    대상이 바뀐다. 화면이 죽으면 같이 사라지는 게 맞는 종류의 상태다.
  */
  /*
    지금 터지고 있는 타격 연출. **맞은 적의 자리(`at`)를 같이 들고 다닌다.**

    예전에는 맨 앞 적 좌표에 고정으로 그렸다. 그런데 타겟은 무작위라
    (`core/autoBattle` 의 `pickTarget`), 뒤쪽 놈을 때리면 이펙트만 맨 앞에서
    터졌다 — 체력이 닳는 놈과 불꽃이 튀는 놈이 달랐다.
  */
  const [hits, setHits] = useState<
    (Swing & {
      key: number; born: number;
      /** 맞은 자리 — 무대 기준으로 못 박아 둔다 */
      x: number; y: number; size: number;
      /**
       * 위에서 떨어진 화살이 꽂혔나 — 꽂히는 그림을 한 대 얹는다.
       *
       * 빈 문자열이면 안 얹는다. 활잡이의 화살비에서만 붙는다.
       */
      arrow: string;
      /**
       * 몸으로 부딪힌 한 방인가.
       *
       * 날아온 것에 맞은 것과 크기가 달라야 한다 — 도약 강타는 사람이 통째로
       * 떨어진 것이라, 검기 한 줄기와 같은 크기로 터지면 밋밋하다.
       */
      blast: boolean;
      /**
       * 이 자리에서 **아래에서 위로 솟는** 것이 있나 (비앙카의 화산).
       *
       * 맞은 적 자리에서 그린다. 비앙카는 제자리에서 땅을 내리치기만 하므로
       * 그녀 쪽에서 뭔가 나가면 "던졌다" 가 되어 사양과 어긋난다
       * (`core/chars` 의 `SKILLS.volcano`).
       */
      erupt: boolean;
      /**
       * 숫자를 몇 번째 줄에 띄울까.
       *
       * 같은 놈을 연달아 때리면 숫자가 한자리에 겹쳐 한 덩어리로 보인다.
       * 이미 그 자리에 떠 있는 숫자만큼 위로 올린다.
       */
      row: number;
      dx: number; dy: number;
    })[]
  >([]);
  /* 맞고 밀리는 흔들림 — `interpolate` 를 한 번만 만든다 (`Fighter` 와 같은 이유) */
  const knockX = useMemo(() => knock.interpolate({
    inputRange: [0, 1], outputRange: [0, 8],
  }), [knock]);

  /**
   * 지금 상태 — **콜백이 읽는 창구.**
   *
   * `onSwing`·`onSkill` 은 `Fighter` 에게 넘어가는데, 그 안에서 `battle` 을
   * 직접 읽으면 콜백이 매 틱 새로 만들어진다. 그러면 `Fighter` 넷의 props 가
   * 초당 다섯 번 바뀌어 넷이 통째로 다시 그려지고, 그 안의 스프라이트·불꽃·
   * 숫자까지 전부 따라 그려진다.
   *
   * 콜백은 **한 번만** 만들고 (`useCallback(..., [])`) 바뀌는 값은 여기로
   * 건넨다. 렌더가 끝날 때마다 최신으로 갈아 끼우므로, 콜백이 불릴 때 읽는
   * 값은 언제나 방금 렌더의 것이다.
   */
  const now = useRef({ battle, party, chars, skillOpts });
  now.current = { battle, party, chars, skillOpts };

  /**
   * 이 기술을 **지금 실제로 쓸 수 있나** — `Fighter` 가 물어본다.
   *
   * 코스트가 다 차도 여기서 거절하면 안 나가고 찬 채로 기다린다. 파티 전체에
   * 무엇이 걸려 있는지를 아는 것은 여기라, 판단도 여기서 한다.
   *
   * 셋 다 **헛되이 쓰는 것**을 막는다:
   *
   *   정화  걷어낼 것이 없으면 (사람이 고른 조건 기준) 안 쓴다
   *   도발  적이 없거나 이미 걸려 있으면 안 쓴다
   *   광란  이미 켜져 있으면 안 쓴다
   *
   * 도발과 광란은 사양에 없는 조건이지만, 없으면 코스트가 찰 때마다 이미
   * 걸린 것을 덮어써서 화면에는 아무 변화도 없이 코스트만 사라진다.
   */
  const canCast = React.useCallback((id: string, slot: number) => {
    const { battle: b, party: pt, chars: ch, skillOpts: op } = now.current;
    /* 트리가 손본 것으로 본다 — 코스트가 달라지면 쓸 수 있는 때도 달라진다 */
    const me = ch[id];
    const sk = me ? skillsFor(me)[slot] : undefined;
    if (!sk) return false;
    if (sk.cleanse) {
      /*
        ── 찬란한 빛은 걷을 것이 없어도 나간다 ── (`SkillDef.cleanseAll`)

        평소 정화는 걷을 것이 있어야 나간다 — 없으면 스무 칸 모은 것을 아무
        일 없이 버리기 때문이다. 그런데 저 갈래는 걷는 것이 아니라 **3초짜리
        면역을 덮는 것**이라, 아무도 안 걸려 있을 때 미리 쓰는 것이 오히려
        제대로 쓰는 것이다.
      */
      if (sk.cleanseAll) return true;
      return cleanseTargets(cleanseOptOf(op, id, slot), pt, ch, b.hp, b.hex).length > 0;
    }
    if (sk.taunt) return b.foes.length > 0 && !(b.taunt && b.taunt.ms > 0);
    if (sk.self) return !hasHex(hexOf(b.hex, id), sk.self.id);
    return true;
  }, []);

  /**
   * 코스트가 바뀌었다 — 파티 칸이 그린다 (`state/battleUi`).
   *
   * 스토어에서 직접 꺼내 쓴다. `useBattleUi((s) => s.setCharge)` 로 받아
   * 의존성에 넣으면 이 콜백이 다시 만들어질 수 있고, 그러면 `Fighter` 넷이
   * 통째로 다시 그려진다 (`now` ref 와 같은 이유). 액션은 스토어가 사는 동안
   * 안 바뀌므로 그때그때 꺼내는 편이 안전하다.
   */
  const onCharge = React.useCallback((id: string, on: readonly number[]) => {
    useBattleUi.getState().setCharge(id, on);
  }, []);

  const hitSeq = useRef(0);
  /**
   * 사람별로 **골라 둔 적의 자리**.
   *
   * 날릴 것이 있는 공격은 손을 떠날 때 대상이 정해지고(`Fighter` 의 `onAim`),
   * 피해는 그것이 닿을 때 들어간다(`onSwing`). 그 사이의 300ms 쯤을 여기에
   * 담아 둔다 — 그래야 날아가 꽂힌 놈과 체력이 닳는 놈이 같아진다.
   */
  const aimed = useRef<Record<string, number>>({});
  /** 아군 줄의 자리 재는 함수 — 렌더마다 최신으로 갈아 끼운다 (`spotOf` 와 짝) */
  const allyRightRef = useRef<(back: number) => number>(() => 0);
  /** 그 사람이 파티 줄 몇 번째 뒤에 서 있나 */
  const backRef = useRef<Record<string, number>>({});
  /** 이번 박자에 날릴 것들을 재는 함수 — 렌더마다 최신으로 갈아 끼운다 */
  const shotsRef = useRef<(hurt: string[]) => {
    key: number; art: string; x: number; y: number; size: number; dist: number;
  }[]>(() => []);

  /*
    타격 연출을 무대 좌표에 못 박기 위한 값들.

    연출을 적 안에서 그리면 그 적이 죽는 순간 같이 사라진다 — 마지막 일격의
    숫자, 그러니까 제일 보고 싶은 숫자가 안 뜬다. 그래서 맞는 순간의 자리를
    좌표로 떠서 무대에 붙인다.

    **자리는 재지 않고 계산한다.** 처음엔 `onLayout` 으로 쟀는데, 아직 한 번도
    안 불린 놈은 자리를 몰라서 전부 같은 곳에 겹쳐 떴다. 줄 배치는 이 파일이
    직접 정한 것이라(오른쪽 벽에서 `EDGE`, 그 안에서 `foeLayout` 의 격자)
    그대로 되짚으면 정확한 자리가 나온다 — 측정이 필요 없다.
  */
  /*
    걸어 들어오는 중인 적들. 키는 마리의 고유 번호(`FoeSlot.id`).

    값은 1(오른쪽 끝) → 0(제자리) 로 흐른다. 자리 번호가 아니라 고유 번호로
    들고 있어야 한다 — 한 마리가 죽으면 남은 놈들의 자리가 밀리는데, 자리로
    들고 있으면 그때 멀쩡히 서 있던 놈들이 갑자기 다시 걸어 들어온다.
  */
  const walk = useRef(new Map<number, Animated.Value>()).current;
  /** 이미 걸어 들어온 놈들 — 두 번 걷지 않게 */
  const walked = useRef(new Set<number>()).current;
  /** 걸음을 이미 시작시킨 놈들 — 값 만들기와 움직이기가 따로라 따로 센다 */
  const started = useRef(new Set<number>()).current;

  /**
   * 무대 계산이 쓰는 값들 — 렌더가 끝날 때마다 갈아 끼운다.
   *
   * `count` 는 **목록의 길이**(누구를 때릴지 고를 때), `cap` 은 **자리 수**
   * (어디에 그릴지 잴 때)다. 둘을 하나로 묶으면 한 마리 죽을 때마다 남은
   * 놈들이 앞으로 미끄러진다.
   *
   * `pos` 는 목록 자리 → 무대 자리다 (`FoeSlot.pos`).
   */
  const foeAt = useRef({
    stageW: 0, count: 0, cap: MOB_CAP,
    base: FOE_W, edge: EDGE,
    /** 목록 자리 → 무대 자리 */
    pos: [] as number[],
    /** 자리별 나와 있는 거리 (`foeAdvance`) */
    adv: [] as number[],
    /** 자리별 제 크기 배수 (`FoeKind.scale`) — 없는 자리는 1 */
    scale: [] as number[],
  });
  /*
    맞은 직후 잠깐 자세가 무너지는 **적들의 자리**.

    맞은 놈만 `down` 프레임으로 바뀐다 — 메이플에서 몹이 맞을 때 움찔하는
    그것이다. 이게 없으면 적은 계속 `idle` 이라 아무리 때려도 반응이 없는
    허수아비로 보인다. 스킬은 셋을 한꺼번에 베므로 자리도 여럿이다.
  */
  /*
    뒷줄이 날린 것들.

    적 박자(`FOE_BEAT_MS`)에 맞춰 원거리 적 자리마다 하나씩 생긴다. `hits` 와
    같은 방식으로 **무대 좌표에 못 박는다** — 쏜 놈이 그 사이에 죽어도
    날아가던 것은 제 길을 마저 간다.
  */
  const [shots, setShots] = useState<
    {
      key: number; art: string; x: number; y: number; size: number; dist: number;
      /** 마법으로 때리는 놈인가 — 날아오는 모양이 갈린다 (`FoeShot`) */
      magic?: boolean;
      /**
       * 우두머리가 날린 것이면 그 종류 (`BossFx`). 없으면 뒷줄 잡몹이 뱉은
       * 것이라 제 그림을 줄여 날린다 (`FoeShot`).
       */
      kind?: ShotKind;
      /** 그것이 나는 데 걸리는 시간 (ms) — 닿는 순간이 곧 아픈 순간이다 */
      ms?: number;
    }[]
  >([]);

  /*
    사람마다 지금까지 친 평타 수.

    스킬은 `every` 번째 공격에 나간다 (`SkillDef`). 그래서 "쿨" 은 시간이
    아니라 **횟수**이고, 그 횟수를 아는 곳은 때리는 순간을 받는 여기다.
    `Fighter` 안에서 따로 세면 화면과 실제가 어긋날 자리가 생긴다.
  */
  /*
    스킬 충전은 **스토어에 있다.**

    파티 칸(`PartyBar`)이 같은 값을 그린다. 여기 지역 상태로 두면 무대에서만
    보이고, 두 군데서 따로 세면 언젠가 어긋난다.
  */
  /*
    코스트를 **여기서 안 센다.**

    `Fighter` 가 제 스윙 순환 안에서 세고 (`onCharge` 로 밀어 넣는다), 파티
    칸이 그것을 그린다 (`state/battleUi`).

    한동안 두 곳에서 따로 셌다 — `Fighter` 안의 스윙 횟수(실제로 기술을
    내보내는 쪽)와 여기의 충전 칸(그리는 쪽). 같은 규칙을 두 번 구현한 셈이라
    언젠가는 어긋날 수밖에 없었고, 실제로 기절이 걸렸다 풀릴 때 둘이 갈렸다.
  */

  /*
    우두머리가 방금 나왔나.

    `battle.boss` 가 거짓에서 참으로 넘어가는 순간을 본다. 틱이 주는
    `ev.bossCame` 을 쓸 수도 있지만, 그건 그 한 틱에만 실려 오므로 화면이
    그 틱을 놓치면 영영 모른다. 상태의 변화는 몇 번을 다시 그려도 같다.
  */
  /*
    ── 광폭화 알림 ──

    `raging` 이 참으로 넘어가는 그 순간에 번호를 하나 올린다. 무대 한가운데에
    붉은 글씨가 떴다 사라진다 (`HitFx` 의 `RageCall`).
  */
  useEffect(() => {
    const now2 = raging(battle);
    if (now2 && !wasRage.current) setRageCall((n) => n + 1);
    wasRage.current = now2;
  }, [battle]);

  /*
    판이 열리고 닫히는 연출 (`StageIntro`).

    얼마나 오래 하느냐는 **엔진이** 정한다 (`battle.openIn`/`clearIn`) —
    그동안 틱이 안 싸우기 때문이다. 여기서는 그림만 그린다.
  */
  const staging = useStageStaging(battle);

  /*
    ── 우두머리 연출 ──

    스무 우두머리가 화면에서 전부 같아 보였다 — 이름이 뜨고, 앞으로 한 번
    나왔다 들어가고, 숫자가 뜬다. **암석 낙하에 암석이 없었다.**

    무엇을 그릴지는 표가 안다 (`BossFx` 의 `BOSS_BLOW`·`BOSS_CAST`). 여기는
    그 표를 읽어 불을 붙이고, **언제 아프게 할지**를 정한다.
  */
  /** 맞은 사람 몸 위에서 나는 것 — 사람마다 번호를 따로 센다 */
  const [bodyFx, setBodyFx] = useState<Record<string, { no: number; kind: BodyKind }>>({});
  /*
    ── 지금 **묶여 있는** 사람들 ── 13판 속박의 덩굴 · 25판 포식의 거미줄.

    감기는 연출은 900ms 면 끝나는데 속박은 2~5초다 (`BossFx` 의 `Bound`).
    그동안 감긴 그림을 세워 두려면 "누가 묶는 기술에 맞았나" 를 들고 있어야
    한다 — 걸린 것(`st_stun`)만 봐서는 6판 암석에 맞아 기절한 사람과 구분이
    안 되고, 그러면 암석에 맞고 덩굴에 감겨 있는 그림이 나온다.

    **푸는 일은 안 한다.** 화면이 그릴 때 "이 명단에 있고 **지금 못 움직이나**"
    를 같이 물으므로(`bound` prop), 속박이 풀리는 순간 그림도 같이 꺼진다.
    명단에 이름이 남아 있어도 아무 일이 없다.
  */
  const [bindIds, setBindIds] = useState<readonly string[]>([]);
  /*
    ── 돌아선 아군에게 맞았다 ──

    맞은 사람 몸에 할퀸 자국을 낸다 (`Claw`). 여태 숫자만 떴으므로 "우리 편
    체력이 왜 줄지" 가 화면에 없었다 — 우두머리는 저 멀리 서 있는데.

    할퀴기를 쓰는 이유: 아군의 평타는 저마다 다르지만 (검 · 도끼 · 활 · 향로)
    여기서 말해야 하는 것은 **누가 맞았나** 하나다. 무기별로 갈래를 만들면
    갈래만 넷이 늘고 화면에서 달라지는 것은 없다.
  */
  const charmHit = useBattleUi((s) => s.charmHit);
  const lastCharmHit = useRef(0);
  useEffect(() => {
    const no = charmHit?.no ?? 0;
    if (!charmHit || no <= lastCharmHit.current) { lastCharmHit.current = no; return; }
    lastCharmHit.current = no;
    const id = charmHit.id;
    setBodyFx((old) => ({
      ...old,
      [id]: { no: (old[id]?.no ?? 0) + 1, kind: 'claw' as const },
    }));
  }, [charmHit]);

  /**
   * 우두머리 몸 자리에서 나는 것.
   *
   * **어느 판에서 붙인 불인지**를 같이 들고 다닌다 (`stage`). 이유는 아래
   * `useEffect` 에 적어 두었다 — 이 한 칸이 없어서 15판의 연기가 16판
   * 우두머리 등장에 피어올랐다.
   */
  const [bossFx, setBossFx] = useState<
    { no: number; kind: BossKind; stage: number } | null
  >(null);
  /** 무대를 쓸고 지나가는 해일 (10판 하나뿐이다) */
  const [tideNo, setTideNo] = useState(0);
  /** 아군 진영으로 뛰어들어 찍기 (1판 하나뿐이다) — 번호와 건너갈 거리 */
  const [leap, setLeap] = useState({ no: 0, span: 0, rise: 0 });
  /**
   * 뛰어들 거리와 높이를 재는 함수 — 렌더마다 갈아 끼운다.
   *
   * `allyRightRef` 로는 못 잰다. 저건 **지금 나가 있는 자리**의 오른쪽 끝인데,
   * 근접 아군은 싸우는 동안 적 앞까지 걸어 나가 있으므로 (`allyAdvOf`) 그 값으로
   * 재면 둘 사이가 40px 도 안 된다 — 우두머리가 한 발짝 움찔하고 만다.
   * 실제로 그렇게 보였다.
   *
   * 여기서는 **파티가 원래 서는 자리**로 잰다 (나가 있는 만큼을 뺀다). 그리고
   * 맨 앞 아군의 폭만큼 더 간다 — 옆에 서는 것이 아니라 **덮는** 것이라야
   * 뭉개기다.
   */
  const leapRef = useRef<() => { span: number; rise: number }>(
    () => ({ span: 0, rise: 0 }),
  );
  const fxSeq = useRef(0);
  /* 지금 판 — `fireRef` 안에서 읽는다 (저 함수는 렌더 밖에서도 불린다) */
  const stageRef = useRef(battle.stage);
  stageRef.current = battle.stage;

  /*
    ── 판이 바뀌면 켜져 있던 연출을 **전부 쓸어낸다** ──

    ## 무엇이 잘못됐었나

    "15판 첫 스킬때 연기가 안 나오고, 16판 우두머리가 등장할 때 연기가
    나온다." "17판 울림이 18판 등장에 보인다." "29판 가스가 30판 시작할 때
    보인다." 셋 다 같은 한 가지다.

    우두머리 연출은 `bossOne && !!bossFx` 일 때만 그려진다. 그런데 `bossFx` 는
    **불을 붙일 때만 갈아 끼우고 아무도 안 지웠다.** 그래서 우두머리가 쓰러져
    `bossOne` 이 거짓이 되는 순간 그리기가 멈추고, 그 값은 그대로 남는다.
    다음 판 우두머리가 걸어 들어와 `bossOne` 이 다시 참이 되면 — 새 `key` 로
    새로 마운트되면서 **한 판 늦게** 그 연출이 돈다.

    묶인 사람 명단(`bindIds`)도 같은 병이다. 안 지우므로 13판에서 덩굴에
    감겼던 사람이 23판에서 무쇠 뿔에 기절하면 덩굴이 다시 감긴다 — 그 판에는
    덩굴이라는 것 자체가 없는데.

    ## 왜 판이 바뀔 때인가

    "우두머리가 죽을 때" 로 두면 안 된다. 우두머리가 안 나오는 잡몹 구간에도
    `bossFx` 는 남아 있어야 뜻이 없고, 무엇보다 **판을 되돌아갈 때**
    (`goStage`) 도 같이 쓸려야 한다.

    `leap` 과 `tideNo` 는 번호가 0 이면 안 그리므로 같이 0 으로 되돌린다.
    `bodyFx` 는 아군 몸 위 것이라 판이 바뀌면 남아 있을 이유가 없다.
  */
  useEffect(() => {
    setBossFx(null);
    setBindIds([]);
    setBodyFx({});
    setTideNo(0);
    setLeap({ no: 0, span: 0, rise: 0 });
  }, [battle.stage]);
  /*
    치우는 시계들.

    연출은 스스로 꺼지지만 **날아가는 것**은 목록에서 빼 줘야 한다. 갈래의
    정리 함수에 맡길 수가 없다 — 이건 갈래가 아니라 함수 안에서 걸리므로,
    여기 모아 두고 화면을 떠날 때 한꺼번에 끈다.
  */
  const fxT = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { fxT.current.forEach(clearTimeout); fxT.current = []; }, []);

  /**
   * 연출에 불을 붙이고 **닿기까지 걸리는 시간**을 돌려준다.
   *
   * 부르는 쪽은 그 시간만큼 피해 숫자와 붉은 깜빡임을 미룬다. 안 미루면
   * 암석이 아직 하늘에 있는데 숫자가 먼저 떠서, 암석이 원인이 아니라
   * 장식으로 보인다.
   *
   * 갈래가 아니라 **ref 에 갈아 끼우는 함수**다 (`shotsRef` 와 같은 이유) —
   * 자리 재는 함수가 렌더마다 바뀌는데, 그걸 갈래의 딸림값에 넣으면 갈래가
   * 매 렌더 다시 돌아 연출이 두 번씩 난다.
   */
  const fireRef = useRef<(plan: FxPlan, ids: readonly string[]) => number>(() => 0);

  /**
   * 방금 나간 특수기가 **닿기까지** 걸리는 시간 (ms).
   *
   * 특수기 갈래가 먼저 돌면서 여기 적어 두면, 뒤에 도는 갈래들(표적 · 피해
   * 숫자)이 그만큼 미룬다. 갈래 셋이 같은 값을 따로 재면 언젠가 갈린다.
   */
  const castLead = useRef(0);
  /** 이번 특수기가 뛰어드는 것인가 — 그러면 앞으로 나왔다 들어가기(`rush`)를 안 한다 */
  const casting = useRef(false);

  /*
    우두머리 특수기가 방금 나갔나.

    `battle.patSeq` 는 특수기가 나갈 때마다 하나씩 오른다. 이름만 보면
    휩쓸기 다음에 또 휩쓸기가 나올 때 안 바뀐 것으로 읽히므로 번호를 본다 —
    `bossCall` 이 `battle.boss` 의 거짓→참을 보는 것과 같은 얼개다.
  */
  const [patCall, setPatCall] = useState(0);
  /*
    특수기 동작 칸(`skill1`)을 언제까지 쓰나.

    적이 팔을 휘두르는 표시(`foeSwing`)는 피해를 모아 두었다가 제 박자에
    한 번 터뜨린다 (`FOE_BEAT_MS`). 그 박자는 특수기가 나간 틱보다 늦게
    올 수 있으므로, 잠깐(한 박자보다 조금 길게) 켜 두고 그 사이에 오는
    휘두름이 특수 동작을 쓰게 한다.
  */
  const [patShown, setPatShown] = useState(false);
  const lastPat = useRef(battle.patSeq ?? 0);
  useEffect(() => {
    const now2 = battle.patSeq ?? 0;
    if (now2 <= lastPat.current) { lastPat.current = now2; return undefined; }
    lastPat.current = now2;
    setPatCall((n) => n + 1);
    setPatShown(true);
    /*
      ── 여기서 연출에 불을 붙인다 ──

      **체력이 닿는 갈래가 아니라 여기여야 한다.** 열아홉 중 여섯은
      그 자리에서 아무도 안 아프기 때문이다 (즉시 피해 0 — 3·4·8·12·14·15판).
      체력을 보고 그렸다면 저 여섯은 영영 아무 연출도 안 난다.

      누구에게 난지는 `battle.struck` 이 안다 — 저건 피해가 아니라
      **노린 사람**을 담은 명단이라 피해가 0 이어도 채워진다.
    */
    const plan = castFx(battle.patId ?? null);
    casting.current = !!plan.leap;
    /*
      명단이 비어 있으면 **살아 있는 사람 전부**에 건다.

      `struck` 은 특수기가 나간 틱에만 채워지는데, 저장본을 이어서 켠 직후처럼
      아직 못 받은 순간이 있다. 그때 빈 배열을 그대로 넘기면 몸 위 연출이
      한 사람도 안 뜬다 — 판이 시작되고 **첫 특수기만** 아무 일도 안 일어나는
      것이 그것이었다.
    */
    const on = (battle.struck ?? []).length
      ? battle.struck
      : members(party, chars).filter((c) => hpOf(c, battle.hp) > 0).map((c) => c.id);
    castLead.current = fireRef.current(plan, on);
    /* 치우고 나간다 — 화면을 떠난 뒤에 상태를 건드리면 안 된다 */
    const off = setTimeout(() => setPatShown(false), FOE_BEAT_MS + 300);
    return () => clearTimeout(off);
    /*
      `battle.struck` 은 일부러 뺀다. 특수기가 나간 틱에만 채워지므로
      (`core/autoBattle`) 번호(`patSeq`)가 바뀌는 그 순간의 값이 곳 이번 명단이다.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.patSeq]);

  /*
    ── 특수기에 맞은 사람 ──

    `battle.struck` 은 특수기가 나간 틱에만 채워진다. 사람마다 번호를 하나씩
    올려서 `Fighter` 에게 넘기면, 그 사람만 표적이 씌워진다.

    번호를 사람별로 두는 이유는 `patSeq` 하나로는 "누가" 를 못 말하기
    때문이다 — 전원기와 한 명기를 가르는 것이 이 표시의 존재 이유다.
  */
  const [struck, setStruck] = useState<Record<string, number>>({});
  const lastStruck = useRef(battle.patSeq ?? 0);
  useEffect(() => {
    const at = battle.patSeq ?? 0;
    if (at <= lastStruck.current) { lastStruck.current = at; return; }
    lastStruck.current = at;
    const who = battle.struck ?? [];
    if (!who.length) return undefined;
    /*
      **닿는 순간에 씩힌다** (`castLead`).

      암석이 아직 하늘에 있는데 몸이 먼저 붉어지면, 암석은 원인이
      아니라 뒤따라 떨어지는 장식이 된다. 앞 갈래가 재 둔 값을 그대로
      쓴다 — 둘이 따로 재면 언젠가 갈린다.
    */
    const off = setTimeout(() => setStruck((old) => {
      const next = { ...old };
      for (const id of who) next[id] = (next[id] ?? 0) + 1;
      return next;
    }), castLead.current);
    return () => clearTimeout(off);
  }, [battle.patSeq, battle.struck]);

  /*
    ── 우두머리가 스스로 채웠다 ──

    초록 `+N` 이 머리 위에 뜬다 (`DamageNumber` 의 `good`). 흰 숫자로 뜨면
    피해와 구분이 안 돼서, 20판에서 15초마다 일어나던 회복을 아무도 회복인
    줄 몰랐다.
  */
  /*
    ── 크게 터졌다 ── 막이 못 깨졌거나(22 · 29판), 우화했거나(25판),
    폭탄 애벌레가 자폭했을 때(26판).

    여태 무대 한가운데에 고리가 한 번 퍼지는 것뿐이었다 (`Burst`). 그런데
    저 셋은 전부 **아군 전원이 실제로 맞는** 일이라, 맞은 쪽에서 아무 일도
    안 일어나면 "무대에 무언가 퍼졌고 그와 별개로 체력이 줄었다" 로 읽힌다.

    26판이 그게 제일 심했다 — 애벌레 넷이 조용히 사라지고 파티 체력이
    통째로 깎였다. 이제 살아 있는 사람 몸마다 폭발이 하나씩 터진다
    (`BossFx` 의 `Boom`).
  */
  /**
   * 마지막으로 터진 자리 — 고리가 여기서 퍼진다 (`Burst`).
   *
   * 터지는 그 순간에 재서 담아 둔다. 그릴 때 다시 재면 안 된다 — 터뜨린
   * 놈은 그 자리에서 사라지므로 (26판 애벌레), 한 프레임 뒤에는 이미
   * 다른 놈의 자리이거나 아무도 없는 자리다.
   */
  const [burstAt, setBurstAt] = useState({ x: 0, y: 0 });
  const lastBurst = useRef(battle.burst ?? 0);
  useEffect(() => {
    const at = battle.burst ?? 0;
    if (at <= lastBurst.current) { lastBurst.current = at; return; }
    lastBurst.current = at;
    /* 맨 앞에 선 놈의 몸 한가운데 (`spotOf` 는 왼쪽 위 모서리를 준다) */
    const sp = spotOf(0);
    setBurstAt({ x: sp.x + sp.size / 2, y: sp.y + sp.size / 2 });
    const who = members(party, chars)
      .filter((c) => hpOf(c, battle.hp) > 0)
      .map((c) => c.id);
    if (!who.length) return;
    setBodyFx((old) => {
      const next = { ...old };
      for (const id of who) next[id] = { no: (next[id]?.no ?? 0) + 1, kind: 'boom' };
      return next;
    });
    /* 무대도 한 번 크게 흔든다 — 이 게임에서 제일 센 흔들림이다 (평타 0.55) */
    shake.fire(1.6);
    /*
      `battle.hp` 는 일부러 안 본다. 터지는 그 틱에 체력도 같이 줄므로
      번호(`burst`)가 오르는 순간의 명단이 곧 맞은 사람들이다.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.burst, shake]);

  /*
    ── 갈라졌다 ── 허물을 벗거나 몸이 쪼개진 그 순간 (`BattleState.rip`).

    21판이 머리와 꼬리로 갈리고, 26판이 애벌레 넷으로 흩어지고, 30판이
    허물을 벗어 분신을 만든다. 여태 **아무 소리 없이** 한 마리가 둘이 되어
    있었다 — "분열 할 때 펑! 하고 터지면서 분열되게 해줘. 지금 뭔가 밋밋해."

    ## `burst` 와 왜 따로인가

    저 번호는 **아군 전원이 실제로 맞는** 일이다. 그래서 화면이 살아 있는
    사람 몸마다 폭발을 하나씩 얹고 무대를 1.6 으로 흔든다.

    갈라지는 것은 아무도 안 아프다. 같은 번호를 쓰면 분신이 나올 때마다
    파티가 얻어맞는 것처럼 보이고, 26판은 갈라진 직후에 자폭까지 하므로
    두 연출이 서로를 덮는다.

    자리도 따로 담는다 (`ripAt`). 하나에 담으면 몇 초 사이에 둘 다 일어나는
    26판에서 나중 것이 앞엣것의 자리를 지운다.
  */
  const [ripAt, setRipAt] = useState({ x: 0, y: 0 });
  const lastRip = useRef(battle.rip ?? 0);
  useEffect(() => {
    const at = battle.rip ?? 0;
    if (at <= lastRip.current) { lastRip.current = at; return; }
    lastRip.current = at;
    /* 갈라진 몸 한가운데 — 파동이 여기서 나간다 */
    const sp = spotOf(0);
    setRipAt({ x: sp.x + sp.size / 2, y: sp.y + sp.size / 2 });
    /* 작게 흔든다. 크게 터지는 것(1.6)과 같은 세기면 맞은 줄 안다 */
    shake.fire(0.9);
    /* `spotOf` 는 딸림값에 안 넣는다 — 위 `burst` 갈래와 같은 이유다 */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.rip, shake]);

  const [heals, setHeals] = useState<{ key: number; amt: number }[]>([]);
  const lastHeal = useRef(battle.foeHeal?.seq ?? 0);
  useEffect(() => {
    const at = battle.foeHeal?.seq ?? 0;
    if (at <= lastHeal.current) { lastHeal.current = at; return undefined; }
    lastHeal.current = at;
    const amt = battle.foeHeal?.amt ?? 0;
    if (amt <= 0) return undefined;
    const key = hitSeq.current++;
    setHeals((old) => [...old.slice(-3), { key, amt }]);
    const off = setTimeout(() => {
      setHeals((old) => old.filter((h) => h.key !== key));
    }, 760);
    return () => clearTimeout(off);
  }, [battle.foeHeal]);

  /** 지금 광폭화 중인가 — 붉게 물들고 두 배로 때린다 (`core/autoBattle`) */
  const rage = raging(battle);

  /**
   * 방금 나간 기술이 시트의 몇 번째 칸인가 (`skill1` · `skill2`).
   *
   * 기술이 둘인 우두머리가 넷이다 (10 · 20 · 26 · 30판). 시트에도 칸이 둘씩
   * 들어와 있는데 화면이 늘 `skill1` 만 써서, 어느 것을 써도 같은 자세가
   * 나왔다 — 받아 둔 그림이 절반 놀고 있었던 셈이다.
   *
   * 못 찾으면 `skill1` 이다. 없는 칸을 부르면 `Sprite` 가 대체 그림으로
   * 떨어지므로 (`fallbackSet`), 틀리게 부르는 것보다 첫 칸이 낫다.
   */
  const bossSkillFrame = React.useMemo(() => {
    const list = BOSS_SKILLS[battle.stage] ?? [];
    const at = list.findIndex((x) => x.id === battle.patId);
    return at > 0 ? `skill${at + 1}` : 'skill1';
  }, [battle.stage, battle.patId]);

  const [bossCall, setBossCall] = useState(0);
  /*
    ── 방금 광폭화했나 ──

    `raging` 이 거짓에서 참으로 넘어가는 순간을 본다 (`bossCall` 과 같은
    얼개다) — 틱이 주는 신호가 아니라 **상태의 변화**를 보므로, 화면이 한
    프레임을 놓쳐도 다음 렌더에서 잡힌다.

    되돌아가는 일은 없다. 우두머리가 죽거나 판이 바뀌면 `bossMs` 가 0 이
    되면서 거짓으로 돌아가고, 그다음 우두머리가 2분을 버티면 다시 오른다.
  */
  const [rageCall, setRageCall] = useState(0);
  const wasRage = useRef(false);
  const wasBoss = useRef(battle.boss);
  useEffect(() => {
    if (battle.boss && !wasBoss.current) setBossCall((n) => n + 1);
    wasBoss.current = battle.boss;
  }, [battle.boss]);

  /** 회복을 받은 횟수 — 늘 때마다 아군 몸에서 빛이 퍼진다 */
  const [bless, setBless] = useState(0);
  /*
    ── 정화로 나쁜 것이 걷힌 사람들 ──

    사람마다 번호를 따로 센다. `bless`(회복)처럼 하나로 두면 넷이 다 반짝여서
    **누가 풀렸는지**가 사라진다 — 정화는 걸린 사람에게만 걸리는 기술이라
    그게 곧 이 연출의 내용이다.
  */
  const [purified, setPurified] = useState<Record<string, number>>({});
  /** 회복 숫자를 치우는 타이머들 */
  const blessT = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [flinch, setFlinch] = useState<number[]>([]);
  const flinchT = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 그 **자리**가 무대 어디인가 (목록 순서가 아니라 `FoeSlot.pos`).
   *
   * 격자는 오른쪽 벽에서 `EDGE` 만큼 띄우고, 그 안에서 자리마다 좌표가 못
   * 박혀 있다 (`foeLayout`). 여기서는 그리는 코드와 **같은 함수**로 되짚는다 —
   * 예전에 그리는 식과 재는 식이 갈라져서 이펙트가 엉뚱한 데서 터졌다.
   *
   * 자리 수(`cap`)로 잰다 — 서 있는 마릿수로 재면 한 마리 죽을 때마다 격자
   * 폭이 줄어서 남은 놈들이 통째로 앞으로 당겨진다.
   */
  const spotOf = React.useCallback((pos: number) => {
    const a = foeAt.current;
    const L = foeLayout(a.cap, a.base, a.scale);
    const size = L.size[pos] ?? a.base;
    /* 적은 아군 쪽으로 나와 있다 — `transform` 이라 배치에는 안 잡힌다 */
    const out = -(a.adv[pos] ?? 0);

    return {
      x: a.stageW - a.edge - L.width + (L.x[pos] ?? 0) + out,
      /* 격자는 바닥에서 `FLOOR` 만큼 떠 있고, 뒷줄은 `lift` 만큼 더 올라간다 */
      y: STAGE_H - FLOOR - (L.lift[pos] ?? 0) - size,
      size,
    };
  }, []);

  /**
   * 날릴 것이 손을 떠난다 — **대상을 정하고 거기까지의 거리를 돌려준다.**
   *
   * 고른 자리를 `aimed` 에 남긴다. 잠시 뒤 그것이 닿을 때 `onSwing` 이 같은
   * 자리를 꺼내 쓴다 — 양쪽이 따로 굴리면 화살이 꽂힌 놈과 체력이 닳는 놈이
   * 달라진다.
   */
  const onAim = React.useCallback((id: string, skill: boolean) => {
    const foes = Math.max(1, foeAt.current.count);
    /* 목록 자리 → 무대 자리. 죽어도 안 움직이므로 둘이 다르다 */
    const posAt = (i: number) => foeAt.current.pos[i] ?? 0;
    /*
      **기술은 제일 뒤엣놈까지 간다.**

      검기는 줄 전체를 훑는 것이라(`pick: 'all'`) 어느 한 놈에서 멈추면
      뒤엣놈들은 맞았는데 아무것도 안 지나간 게 된다. 평타만 자리를 고른다.
    */
    const at = skill ? foes - 1 : pickAim(foes);
    aimed.current[id] = at;

    const spot = spotOf(posAt(at));
    const back = backRef.current[id] ?? 0;
    /*
      검끝에서 적의 **몸 가운데**까지.

      날아가는 그림은 그 사람의 오른쪽 끝쯤에서 나가므로(`SwordWave` 의
      `TIP_X`) 거기서부터 잰다. 적의 왼쪽 끝이 아니라 가운데를 찍는 이유는,
      끝에서 멈추면 몸에 닿기 전에 꺼져서 **스쳐 지나간 것**으로 보이기 때문이다.
    */
    const from = allyRightRef.current(back);
    return Math.max(24, Math.round(spot.x + spot.size * 0.5 - from));
  }, [spotOf]);

  const onSwing = React.useCallback((sw: Swing) => {
    /*
      판 연출 중이면 아무 일도 안 한다.

      계산은 스토어가 이미 막는다 (`fightHeld`). 여기서 한 번 더 막는 것은
      **충전 칸과 이펙트** 때문이다 — 막 뒤에서 칸이 차 오르면 걷히자마자
      네 명이 동시에 스킬을 쏜다.
    */
    if (fightHeld(now.current.battle)) return;
    /*
      **여기서 실제로 때린다.** 연출만 하고 계산은 틱에 맡겼더니, 안 휘둘렀는데
      적 체력이 닳고 휘둘렀는데 아무 일도 안 일어났다.
    */
    /* 때리기 **전에** 어느 놈을 노리고 있었는지 읽는다 — 때리고 나면 목록이 바뀐다 */
    /*
      **자리를 골라 계산에 넘긴다** — 앞에 설수록 많이 맞는다 (`pickAim`).

      날린 것이 있었으면 이미 골라 둔 자리를 쓴다 (`onAim`). 그래야 화살이
      꽂힌 놈과 체력이 닳는 놈이 같다. 없으면(근접 평타) 여기서 고른다.

      **꺼내면서 지운다.** 남겨 두면 다음 근접 평타가 지난번 화살이 노렸던
      자리를 물려받는다.
    */
    const saved = aimed.current[sw.id];
    delete aimed.current[sw.id];
    const live = now.current.battle.foes.length;
    /* 날아가는 사이에 앞줄이 죽어 줄이 짧아졌을 수 있다 */
    const at = Math.min(saved ?? pickAim(live), Math.max(0, live - 1));
    /* 목록 자리를 무대 자리로 옮긴다 — 그려야 할 곳은 그놈이 서 있는 자리다 */
    const to = foeAt.current.pos[at] ?? 0;
    /* 자리는 **때리기 전에** 잡는다 — 죽으면 목록이 줄어 번호가 밀린다 */
    const spot = spotOf(to);
    /* 이 한 대의 배수 — 비앙카의 과열이 둘째 대에 1.5 를 준다 (`Swing.mul`) */
    strikeFoe(sw.id, at, sw.mul);

    const key = hitSeq.current++;
    /* 같은 자리에서 터지면 여러 개가 하나로 보인다 — 조금씩 흩는다 */
    setHits((old) => {
      const live = old.slice(-7);
      return [...live, {
        /* 과열의 둘째 대는 크게 터진다 — 같은 그림이면 넷 중 어느 것이 150% 인지 모른다 */
        ...sw, key, ...spot, blast: !!sw.blast, arrow: '', erupt: false,
        row: rowFor(live, spot.x), born: Date.now(),
        dx: -14 + Math.random() * 24, dy: -6 + Math.random() * 20,
      }];
    });
    /* 크게 터지는 한 대는 더 흔든다 — 화면이 세기를 말하는 유일한 수단이다 */
    shake.fire(sw.blast ? 0.9 : 0.55);
    /* 움찔하는 것도 **무대 자리**로 적는다 — 그리는 쪽이 그 번호를 본다 */
    setFlinch([to]);
    if (flinchT.current) clearTimeout(flinchT.current);
    flinchT.current = setTimeout(() => setFlinch([]), 130);
    Animated.sequence([
      Animated.timing(knock, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(knock, { toValue: 0, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [knock, shake, strikeFoe, spotOf]);

  // 화면을 떠날 때 남은 타이머를 치운다
  useEffect(() => () => {
    if (flinchT.current) clearTimeout(flinchT.current);
    blessT.current.forEach(clearTimeout);
  }, []);

  /*
    스킬을 쓴 순간. **검기는 여기서 안 그린다** — 검끝에서 나가야 하므로
    `Fighter` 안에서 그린다 (`SwordWave`). 여기서는 피해와 화면 흔들기만.
  */
  const onSkill = React.useCallback((id: string, slot: number) => {
    if (fightHeld(now.current.battle)) return;
    const { battle: b, party: pt, chars: ch, skillOpts: op } = now.current;
    const me = ch[id];
    if (!me) { skillFoe(id, undefined, slot); return; }

    /*
      **어느 기술이 나갔는지는 `Fighter` 가 정해서 넘긴다** (`slot`).

      여기서 다시 고르면 몸이 휘두른 기술과 피해를 넣는 기술이 갈릴 수 있다 —
      자리(`at`)를 화면이 골라 넘기는 것과 똑같은 이유다. 지금은 한 명당
      기술이 하나뿐이라 늘 0 이지만, 규칙은 지금 세워 둔다.
    */
    const sk = skillsFor(me)[slot] ?? skillOf(me.id);

    /*
      회복형은 적 쪽에 그릴 게 없다. 대신 **아군 쪽에** 그린다.

      `healPlan` 으로 사람마다 얼마나 차는지 먼저 받아 둔다 — 계산이 쓰는
      것과 같은 함수라, 뜨는 숫자와 실제로 찬 양이 어긋나지 않는다.
      회복을 넣은 **뒤에** 재면 이미 차 있어서 0 이 나온다.
    */
    if (sk.pick === 'none') {
      /*
        ── 적을 안 건드리는 기술들 ──

        기도 · 도발 · 광란 · 정화가 여기로 온다. 넷이 하는 일이 다 달라서
        연출도 다르다.

        **계산보다 먼저 재 둔다.** 정화가 걷을 사람도, 기도가 채울 양도
        `skillFoe` 가 돌고 나면 이미 사라진 뒤라 0 이 나온다 — 회복에서
        이미 겪은 일이라 같은 자리에서 같이 처리한다.
      */
      const plan = healPlan(sk, pt, ch, b.hp);
      /* 정화는 **걷힐 사람**을 미리 뽑아 둔다 — 걷고 나면 못 찾는다 */
      const washed = sk.cleanse
        ? cleanseTargets(cleanseOptOf(op, id, slot), pt, ch, b.hp, b.hex)
        : [];

      skillFoe(id, undefined, slot);
      /*
        포효는 크게 흔든다. 다른 셋은 조용한 기술이라 그대로 둔다 — 셋이
        같은 세기로 흔들리면 무엇이 큰 기술인지가 화면에서 안 갈린다.
      */
      shake.fire(sk.taunt ? 1.4 : 0.4);

      if (washed.length) {
        setPurified((old) => {
          const next = { ...old };
          for (const who of washed) next[who] = (next[who] ?? 0) + 1;
          return next;
        });
      }
      const made = Object.entries(plan)
        .filter(([, v]) => v > 0)
        .map(([who, v]) => ({ key: seq.current++, who, text: `+${v}` }));
      if (!made.length) return;
      setBless((n) => n + 1);
      setPops((old) => [...old.slice(-4), ...made]);
      blessT.current.push(setTimeout(() => {
        setPops((old) => old.filter((x) => !made.some((m) => m.key === x.key)));
      }, 750));
      return;
    }

    /*
      **여기서 고르고, 고른 것을 계산에 넘긴다.**

      규칙은 `core/autoBattle` 의 `skillTargets` 한 군데에 있다. 예전에는
      화면과 계산이 각자 골랐고, 무작위가 끼는 기술(화살비)에서는 불꽃이
      튀는 놈과 체력이 닳는 놈이 서로 달랐다.
    */
    const idx = skillTargets(sk, b.foes, targetOf(b));

    const dmg = skillDamage(me, pt, ch, slot);
    /* 자리는 **때리기 전에** 다 잡아 둔다 — 죽으면 목록이 줄어 번호가 밀린다 */
    const posAt = (i: number) => foeAt.current.pos[i] ?? 0;
    const spots = idx.map((i) => spotOf(posAt(i)));
    /*
      뛰어드는 기술은 **착지한 자리**에서도 터진다.

      맞은 놈들 위에서만 터뜨렸더니, 도끼가 바닥을 찍는 그 지점에는 아무
      일도 안 일어났다 — 정작 그림에서 제일 힘이 실린 자리가 비었다.
      맞는 놈이 하나뿐일 때는 겹쳐서 티가 안 나지만, 뒷줄로 뛰어들면
      찍은 자리와 맞는 자리가 눈에 띄게 벌어진다.
    */
    const ground = sk.leaps && spots.length
      ? [{ ...spots[0], x: Math.min(...spots.map((sp) => sp.x)) }]
      : [];

    skillFoe(id, idx, slot);
    shake.fire(sk.pick === 'all' || sk.leaps ? 1.2 : 1);

    setHits((old) => {
      const live = old.slice(-6);
      /* 여럿을 한꺼번에 넣으므로 **서로도** 세어 가며 줄을 매긴다 */
      const add: typeof live = [];
      const put = (spot: typeof spots[number], amount: number, big: boolean) => {
        add.push({
          /* 발밑에서 솟는 기술인가 — 지금은 화산 하나다 */
          erupt: sk.cast === 'erupt' && !big,
          /* 기술이 제 그림을 가지고 있으면 그걸 쓴다 — 없으면 평타 것 */
          id, fx: sk.fx ?? CHARS[me.id].fx,
          dmg: amount, key: hitSeq.current++, ...spot,
          blast: big,
          /* 화살비는 맞는 자리마다 화살이 한 대 꽂힌다 */
          arrow: CHARS[me.id].range === 'ranged' ? projSet(me.id) : '',
          row: rowFor([...live, ...add], spot.x), born: Date.now(),
          /* 불꽃만 흩는다 — 숫자는 제 놈 머리 한가운데에 뜬다 */
          dx: -10 + Math.random() * 20, dy: -6 + Math.random() * 20,
        });
      };
      /* 바닥 폭발이 먼저 — 뒤에 오는 숫자가 그 위에 쌓인다 */
      for (const g of ground) put(g, 0, true);
      for (const spot of spots) put(spot, dmg, false);
      return [...live, ...add];
    });
    setFlinch(idx.map(posAt));
    if (flinchT.current) clearTimeout(flinchT.current);
    flinchT.current = setTimeout(() => setFlinch([]), 180);
  }, [skillFoe, shake, spotOf]);

  /*
    타격 연출을 치운다.

    **시간으로 치운다.** 예전에는 피해 숫자가 다 뜨고 나서 스스로 알리게
    (`onDone`) 했는데, 숫자가 없는 연출은 영영 안 지워져 목록에 쌓였다.
    누가 그리든 850ms 뒤에는 사라지는 게 확실하다.
  */
  useEffect(() => {
    if (!hits.length) return;
    const t = setTimeout(() => {
      const cut = Date.now() - 850;
      setHits((old) => {
        const live = old.filter((h) => h.born > cut);
        return live.length === old.length ? old : live;   // 그대로면 그대로 둔다
      });
    }, 300);
    return () => clearTimeout(t);
  }, [hits]);

  /*
    파티가 받은 피해는 **닳는 순간에** 띄운다.

    한동안 1.1초짜리 박자에 모아 뒀다가 한꺼번에 띄웠다. 잡몹 셋이 갉아먹을
    때 `-3 -3 -3 -3` 이 흐르는 게 노이즈였기 때문인데, 그 대가로 **막대가
    먼저 내려가고 숫자가 나중에** 떴다 — 같은 사건을 두 시계로 그린 셈이다.

    수치를 손으로 짜면서 한 대가 20~75 가 됐다 (`docs/FOE_TABLE.md`). 숫자
    하나하나가 뜻을 가지므로 모을 이유가 없어졌고, 모으지 않으니 시계도 하나가
    됐다.
  */
  const [foeSwing, setFoeSwing] = useState(false);
  /**
   * 체력 갈래가 따로 세는 특수기 번호.
   *
   * 특수기 갈래의 `lastPat` 과 같은 값을 보지만 **번호를 공유하면 안
   * 된다** — 먼저 도는 쪽이 값을 올려 버리면 다른 쪽은 영영 "특수기가
   * 나갔다" 를 못 본다.
   */
  const prevPatHp = useRef(battle.patSeq ?? 0);
  /** 무대 폭 — 근접이 얼마나 나갈지 여기서 나온다 */
  const [stageW, setStageW] = useState(0);

  /*
    ── 특수기는 **피해가 없어도** 동작한다 ──

    적이 팔을 휘두르는 표시는 아래에서 **체력이 닳는 순간**에 켠다. 그런데
    우두머리 기술 중 여섯(3·4·8·12·14·15판)은 그 자리에서 아무도 안 아프다 —
    거는 것만 하는 기술이라 즉시 피해가 0 이다 (`docs/BOSS_SKILLS.md`).

    그러면 화면에서는 말풍선만 뜨고 우두머리는 가만히 서 있다. 특히 4판
    환각 포자는 숫자도 안 뜨므로 **정말 아무 일도 안 일어난 것**으로 보인다.

    그래서 기술이 나갔다는 신호(`patSeq`)에도 한 번 휘두르게 한다.
  */
  useEffect(() => {
    if (!patCall) return undefined;
    setFoeSwing(true);
    const off = setTimeout(() => setFoeSwing(false), 320);
    return () => clearTimeout(off);
  }, [patCall]);

  /*
    ── 특수기가 나가면 **우두머리가** 움직인다 (무대가 아니라) ──

    특수기와 평타가 화면에서 거의 같아 보이던 것을 갈라야 했다. 그래서 한때
    셋을 한꺼번에 걸었다 — 돌진 · 화면 흔들기(2.2, 평타의 네 배) · 무대 전체를
    덮는 붉은 막. 그건 실패였고 두 가지 이유로 그렇다.

      **어디를 보라는 말이 아니었다.** 화면이 통째로 흔들리고 통째로 붉어지면
      눈이 갈 곳이 없다. 정작 알아야 할 것 — 누가 맞았나 — 은 그 소란에
      묻혔다. 연출이 세질수록 읽히는 것이 줄었다.

      **화면을 덮는 것은 남는다.** 붉은 막은 `Animated.Value` 하나로 굴렸는데,
      한창 도는 중에 `patCall` 이 바뀌면 정리 함수가 애니메이션을 멈추고
      값은 켜진 채로 남았다. 판을 넘겨도 붉은 채였다.

    남기는 것은 **돌진 하나**다. 우두머리가 아군 쪽으로 크게 나왔다 돌아온다 —
    움직이는 것이 화면이 아니라 **그것**이라 어디서 무슨 일이 나는지가 같이
    읽힌다. 400ms 안에 끝난다: 길게 끌면 다음 평타가 겹친다.

    "누가 맞았나" 는 이제 맞은 사람 쪽에서 말한다 — 표적(`StruckMark`)과
    붉은 피해 숫자다.
  */
  const rush = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!patCall) return undefined;
    /*
      **뛰어드는 판은 이걸 안 한다** (1판 뻐개기).

      저쪽은 아군 진영까지 건너가는 길이라 (`useLeap`), 여기서 34px 를
      더 밀면 두 길이 같은 값을 두고 싸운다 — 돌아오는 길에 한 번 밀리고
      끌에 제자리가 섞인다.
    */
    if (casting.current) return undefined;
    const a = Animated.sequence([
      Animated.timing(rush, {
        toValue: 1, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(rush, {
        toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]);
    a.start();
    /*
      **멈추면 되돌린다.** 붉은 막이 다음 판까지 안 걷히던 것이 정확히 이
      자리의 실수였다 — `stop()` 은 값을 그 자리에 두고 멈출 뿐이라, 한창
      나가 있는 중에 정리되면 우두머리가 앞으로 나온 채 굳는다.
    */
    return () => { a.stop(); rush.setValue(0); };
  }, [patCall, rush]);

  /* `interpolate` 는 한 번만 만든다 — 렌더마다 부르면 가지가 쌓인다 */
  const rushX = useMemo(() => rush.interpolate({
    inputRange: [0, 1], outputRange: [0, -Math.round(34 * ZOOM)],
  }), [rush]);
  const rushScale = useMemo(() => rush.interpolate({
    inputRange: [0, 1], outputRange: [1, 1.18],
  }), [rush]);

  /*
    ── 1판 뻐개기 ── 아군 진영까지 **진짜로 뛰어간다.**

    나머지 열아홉과 똑같이 앞으로 34px 나왔다 들어갔다. 이름이
    뻐개기이고 전원을 때리는 기술인데 화면에서는 구분이 안 됐다.
  */
  const leapAt = useLeap(leap.no, leap.span, leap.rise);

  useEffect(() => {
    /*
      **체력이 실제로 닳은 그 순간**에 전부 한다 — 숫자 · 적의 휘두르기 ·
      날아오는 것. 예전에는 여기서 모아만 두고 따로 도는 1.1초 박자가 띄웠는데,
      그러면 막대가 먼저 내려가고 숫자가 나중에 떴다.

      기록은 **연출을 안 하는 때에도** 남긴다 (전멸·빈 파티). 안 그러면 다시
      싸울 때 그동안의 변화가 통째로 "방금 맞은 것" 으로 뜬다.
    */
    const hurt: [string, number][] = [];
    /* 살아 있는 사람들 — 누가 아팠는지 모를 때 연출을 걸 자리다 */
    const livingIds: string[] = [];
    for (const c of members(party, chars)) {
      const now = hpOf(c, battle.hp);
      const was = prevHp.current[c.id];
      if (was !== undefined && now < was) hurt.push([c.id, Math.round(was - now)]);
      if (now > 0) livingIds.push(c.id);
      prevHp.current[c.id] = now;
    }
    /*
      **때린 것과 지속 피해를 가른다.**

      숫자는 둘 다 띄운다 — 체력이 줄었으면 얼마나 줄었는지는 보여야 한다.
      그런데 **팔을 휘두르는 것과 뭔가를 날리는 것은 실제로 쳤을 때만** 한다.
      체력이 줄어든 것만 보고 연출하면, 5초짜리 중독이 도는 동안 적이 허공에
      팔을 열 번 휘두른다.

      실제로 친 횟수는 계산이 세어 준다 (`BattleState.swingSeq`).
      숫자가 그대로면 이번에 줄어든 것은 걸려 있던 것 때문이다.
    */
    const swung = battle.swingSeq !== prevSwing.current;
    prevSwing.current = battle.swingSeq;

    /*
      **이번 틱에 특수기가 나갔나.**

      나갔으면 연출은 위의 특수기 갈래가 이미 맡았다. 여기서 또
      불을 붙이면 평타 연출과 상 연출이 같은 순간에 겹쳐 난다.

      번호는 따로 들고 있는다. 위에서 쓰는 것을 같이 쓰면 둘 중 먼저
      도는 갈래가 값을 소비해 다른 쪽은 영영 못 본다.
    */
    const patNow = battle.patSeq ?? 0;
    const cast = patNow !== prevPatHp.current;
    prevPatHp.current = patNow;

    if (empty || down) return undefined;

    const late: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => { late.push(setTimeout(fn, ms)); };

    /* 적이 팔을 휘두른다 */
    if (swung) {
      setFoeSwing(true);
      after(200, () => setFoeSwing(false));
    }

    /*
      ── 이번에 아프게 한 것이 무엇인가 ──

      특수기면 위에서 잰 값을 그대로 쓰고, 평타면 여기서 불을 붙인다. 잡몹은
      표가 없으므로 0 이라, 예전처럼 바로 숫자가 뜬다.

      ## 아무도 안 아파도 연출은 한다

      한동안 이 갈래가 **누군가 아팠을 때만** 돌았다 (`!hurt.length` 면 그
      자리에서 돌아섰다). 그런데 우두머리가 휘둘렀는데 아무도 안 아픈 경우가
      실제로 있다 — 전부 빗나갈 만큼 방어가 두껍거나, 맞은 사람이 그 틱에
      회복을 같이 받아 체력이 안 줄었거나, 앱을 막 켜서 **비교할 지난 값이
      없을 때**다. 마지막 것이 "껐다 켜면 첫 공격에 아무것도 안 보인다" 였다.

      연출은 아픈 것과 별개다. 휘둘렀으면 휘두른 것이 보여야 한다.
    */
    const who = hurt.length ? hurt.map(([id]) => id) : livingIds;
    const lead = !battle.boss ? 0
      : cast ? castLead.current
        : (swung ? fireRef.current(blowFx(battle.stage), who) : 0);

    if (!hurt.length) return () => late.forEach(clearTimeout);

    /*
      뒷줄은 **뭔가를 날린다.**

      모션만 있으면 뒤에서 혼자 꿈틀거리는 것으로 보인다. 아군 맨 앞까지의
      거리를 그때 재서 넘긴다 — 자리는 계속 바뀌므로 미리 잡아 둘 수 없다.
    */
    const shot = swung ? shotsRef.current(hurt.map(([id]) => id)) : [];
    if (shot.length) {
      setShots((old) => [...old.slice(-5), ...shot]);
      after(FOE_SHOT_MS + 60, () => {
        setShots((old) => old.filter((x) => !shot.some((m) => m.key === x.key)));
      });
    }

    /*
      ── 숫자는 **닿는 순간**에 뜨곳 ──

      이 숫자가 `Fighter` 의 붉은 깜빡임도 같이 켜므로 (`HurtTint` 가
      `damage` 를 본다) 한 줄만 미루면 둘이 같이 맞추어진다.

      체력 막대는 상태를 그대로 그리므로 그만큼 먼저 줄어든다. `lead`
      를 420ms 아래로 묶어 둔 이유가 그것이다 — 더 미루면 막대가 먼저
      내려가는 것이 눈에 보인다.
    */
    const made = hurt.map(([id, v]) => ({ key: seq.current++, who: id, text: `-${v}` }));
    after(lead, () => setPops((old) => [...old.slice(-4), ...made]));
    after(lead + 750, () => {
      setPops((old) => old.filter((x) => !made.some((m) => m.key === x.key)));
    });

    return () => late.forEach(clearTimeout);
  }, [battle.hp, battle.swingSeq, party, chars, empty, down]);


  /*
    이번 박자에 누가 무엇을 날리나.

    박자 타이머는 한 번만 걸리고 그 안에서 매번 실행되므로, 최신 자리를
    읽으려면 ref 를 거쳐야 한다. 타이머를 매 렌더마다 다시 걸면 박자가
    영영 안 채워진다.
  */
  fireRef.current = (plan, ids) => {
    fxSeq.current += 1;
    const no = fxSeq.current;
    /* 우두머리가 선 자리 — 날리는 것도 뛰는 것도 여기서 출발한다 */
    const from = spotOf(0);

    if (plan.boss) setBossFx({ no, kind: plan.boss, stage: stageRef.current });
    if (plan.tide) setTideNo(no);
    if (plan.leap) {
      /*
        아군 맨 앞까지 간다. 무대 폭으로 어림잡지 않는다 — 근접이 얼마나
        나가 있느냐에 따라 둘 사이가 매번 다르고, 어림잡으면 우두머리가
        아군을 지나쳐 무대 밖까지 뛰어가는 판이 생긴다.
      */
      const { span, rise } = leapRef.current();
      setLeap({ no, span, rise });
    }
    /*
      묶는 기술이면 **맞은 사람 명단을 통째로 갈아 끼운다** (`FxPlan.bind`).

      더하지 않고 갈아 끼우는 이유: 이 기술은 판마다 하나뿐이고, 새로 나갈
      때마다 그때 맞은 사람이 곧 지금 묶인 사람이다. 더하면 앞에서 묶였다
      풀린 사람이 명단에 남아, 나중에 다른 것으로 기절할 때 덩굴이 뜬다.
    */
    if (plan.bind) setBindIds([...ids]);
    if (plan.body) {
      const kind = plan.body;
      /*
        **닿는 순간에서 거꾸로 잡는다.**

        암석은 떨어지는 데 418ms 가 걸린다 (`BODY_HIT`). 아픈 순간(`lead`)에
        켜면 아프고 나서 암석이 떨어진다 — 원인과 결과가 뒤집힌다.

        1판 뭉개기가 이게 왜 필요한지를 그대로 보여 준다. 우두머리가 아군
        진영까지 뛰어가 내리꽂는 데 274ms 가 걸리는데, 찍힌 자국을 0 에 켜면
        우두머리가 아직 공중에 있는 동안 이미 찍혀 있다.
      */
      const at = Math.max(0, plan.lead - BODY_HIT[kind]);
      const put = () => setBodyFx((old) => {
        const next = { ...old };
        for (const id of ids) next[id] = { no: (next[id]?.no ?? 0) + 1, kind };
        return next;
      });
      if (at <= 0) put();
      else fxT.current = [...fxT.current.slice(-40), setTimeout(put, at)];
    }
    if (!plan.shot) return plan.lead;

    /*
      날리는 것 — **맞는 사람마다 한 발.**

      한 발만 날려서 맨 앞에 꽂으면, 뒤엣사람이 맞았을 때 숫자는 뒤에서
      뜨는데 날아온 것은 앞에서 멎는다 (뒷줄 잡몹에서 이미 겪은 그것이다).
    */
    const kind = plan.shot;
    const made = ids.map((id) => {
      const back = backRef.current[id] ?? 0;
      const dist = Math.max(24, Math.round(from.x - allyRightRef.current(back)));
      return {
        key: hitSeq.current++,
        art: '',
        kind,
        ms: shotMsOf(dist),
        /* 아군 쪽(왼쪽) 몸통 높이에서 나간다 */
        x: from.x + 6,
        y: from.y + Math.round(from.size * 0.34),
        size: BOSS_SHOT_W,
        dist,
      };
    });
    if (!made.length) return plan.lead;
    setShots((old) => [...old.slice(-5), ...made]);
    /* 제일 먼 것이 닿을 때까지가 이 공격의 `lead` 다 */
    const reach = Math.max(...made.map((m) => m.ms));
    /*
      **마흔 개까지만 들고 있는다.**

      이미 터진 시계의 번호를 `clearTimeout` 해 봐야 아무 일도 안 하지만,
      목록이 끝없이 자라면 한 시간 켜 둔 판에서 수천 개가 쌓인다. 치우는
      것은 화면을 떠날 때 한 번뿐이라 그때까지 안 준다.
    */
    fxT.current = [...fxT.current.slice(-40), setTimeout(() => {
      setShots((old) => old.filter((x) => !made.some((m) => m.key === x.key)));
    }, reach + 80)];
    return reach;
  };

  shotsRef.current = (hurt: string[]) => {
    /*
      **실제로 맞은 사람에게 날아간다.**

      예전에는 무조건 맨 앞까지의 거리로 날렸다. 적도 자리별 확률로 고르게
      바뀐 지금은(`core/autoBattle` 의 `AIM`) 뒤에 선 사람이 맞는 일이 흔한데,
      그때도 투사체는 앞사람 앞에서 멎어서 **숫자는 뒤에서 뜨는데 날아온 것은
      앞에서 멈췄다.**

      이번 박자에 체력이 닳은 사람들을 받아서 거기로 보낸다. 여럿이면 돌려
      가며 나눠 준다 — 둘이 맞았으면 두 발이 각각 제 사람에게 간다.
      (모아 띄우는 박자와 계산 틱은 주기가 다르므로 발수와 사람 수가 딱
      맞지는 않는다. 맞은 사람 **중 하나**면 충분하다.)
    */
    const marks = hurt
      .map((id) => backRef.current[id])
      .filter((b): b is number => b !== undefined);

    return battle.foes
      .map((f) => ({ f, b: f.pos ?? 0 }))
      .filter(({ b }) => !foeMelee[b])
      .map(({ f, b }, i) => {
        const sp = spotOf(b);
        const to = marks.length ? marks[i % marks.length] : 0;
        const kf = kindAt(battle, f);
        return {
          key: hitSeq.current++,
          art: kf.art,
          /* 마법으로 때리는 놈은 덩이를, 물리는 가시를 날린다 (`FoeShot`) */
          magic: kf.dmg === 'magic',
          x: sp.x, y: sp.y, size: sp.size,
          dist: Math.max(20, Math.round(sp.x - allyRightOf(to))),
        };
      });
  };

  /**
   * 배경 띠의 폭과 높이.
   *
   * 폭은 무대를 꽉 채운다 — 배경이 좌우로 모자라면 검은 띠가 남는다. 높이는
   * 그림의 제 비율대로 따라간다 (`SPRITE_RATIO`). 아직 무대 폭을 모르는 첫
   * 프레임에는 무대 높이의 세 배로 버틴다.
   */
  const bgW = stageW > 0 ? stageW : STAGE_H * 3;
  /**
   * 배경이 보이는 띠의 높이.
   *
   * 무대에서 바닥판을 뺀 만큼이다. 그림 바닥이 곧 지평선이므로(넣을 때 아래
   * 빈 곳을 잘라 냈다) 이 띠를 꽉 채우면 지평선이 바닥판 뒤끝에 정확히 붙는다.
   */
  const bgH = STAGE_H - GROUND_H;

  const secLeft = Math.ceil(battle.msLeft / 1000);
  /**
   * 광폭화까지 남은 초 (`core/autoBattle` 의 `RAGE_MS`).
   *
   * 이건 **어디에도 안 나오던 숫자**였다. 두 분이 지나면 우두머리가
   * 붉어지면서 두 배로 때리는데, 그게 언제 오는지를 모르면 "어느순간
   * 갑자기 진 판" 이 된다. 남은 시간을 알면 그것이 **제한 시간**이
   * 되어, 밀어붙일지 물러날지를 사람이 고를 수 있다.
   */
  const rageSec = Math.ceil(rageIn(battle) / 1000);
  /*
    맨 앞 적이 서 있는 자리 — 이펙트와 숫자가 여기에 붙는다.

    근접인 적은 아군 쪽으로 `CLOSE_IN` 만큼 걸어 나와 있으므로, 이걸 안 더하면
    이펙트만 원래 자리(오른쪽 끝)에서 터져서 **적과 따로 논다.**
  */
  /* 적 수가 아니라 **상한**으로 잰다 — 안 그러면 한 마리 죽을 때마다 아군이 튄다 */
  /**
   * 이 판에 적이 설 **자리 수**. 우두머리 구간은 하나다.
   *
   * 서 있는 마릿수가 아니다. 자리는 판 내내 고정이고, 죽으면 그 자리가
   * 빌 뿐이다 — 그래야 남은 놈들이 안 움직인다 (`core/autoBattle` 의
   * `FoeSlot.pos`).
   */
  /*
    ── 우두머리 줄이 잡는 자리 ──

    한동안 그 판이 **최대 몇 마리까지 될 수 있나**로 잡았다 (`bossRoom`).
    자리가 안 밀린다는 장점은 있었는데, **서 있지도 않은 놈 자리를 미리
    비워 두는** 값이라 21판(둘)과 26판(넷)에서 우두머리가 아군 쪽으로 한참
    끌려와 인물이 통째로 겹쳤다. 132px 짜리 두 자리에 파티 넷을 얹으면
    360px 무대에 137px 이 모자란다.

    지금 **서 있는 만큼**만 잡는다. 갈라지는 순간 줄이 한 번 넓어지지만,
    잡몹처럼 계속 죽고 나는 자리가 아니라 판마다 한두 번뿐이라 눈에 덜
    거슬린다 — 늘 겹쳐 있는 것보다 훨씬 낫다.
  */
  /*
    ── 우두머리 줄이 잡는 자리 수 ──

    `battle.foes.length` 였다. **마릿수와 자리 번호는 다르다** — 넷으로 갈라진
    애벌레 중 1·2번이 먼저 죽으면 남은 것은 둘인데 자리는 0번과 3번이다.
    길이로 잡으면 자리 둘만 그리므로 3번에 선 애벌레가 **아예 안 그려진다.**

    제일 뒤 자리 번호로 잡는다. 그러면 몇이 죽든 서 있는 놈은 전부 그려지고,
    빈자리는 폭만 남는다 (아래 `gap`).
  */
  /*
    잡몹은 **칸 수가 아니라 이 판의 마릿수**로 잡는다 (`mobCap`).

    칸은 아홉인데 1판에 서는 것은 넷이다. 아홉으로 잡으면 세로줄 셋 몫의
    폭을 늘 비워 두게 되어, 넷이 무대 오른쪽 구석으로 몰린다.
  */
  /** 지금 서 있는 놈 중 제일 뒤 자리 번호 + 1 */
  const lastPos = battle.foes.reduce((m, f) => Math.max(m, (f.pos ?? 0) + 1), 0);
  const cap = cur.boss
    ? Math.max(1, lastPos)
    /*
      **마릿수와 실제 자리 중 큰 쪽.**

      보통은 마릿수가 이긴다. 저장해 둔 판을 이어 할 때만 자리가 이기는데,
      칸이 여섯이던 시절의 기록에는 5번 자리에 선 놈이 있을 수 있다 —
      마릿수(넷)로만 자르면 그놈이 **안 그려진 채 살아 있어서** 판이 안
      끝난다.
    */
    : Math.max(mobCap(battle.stage), lastPos);
  /*
    자리마다 **그 놈이 실제로 그려지는 배수** (`Scales`).

    빈자리는 1 이다. 그 편이 안전하다 — 자리가 비면 폭이 조금 넓어질 뿐,
    좁아져서 옆엣놈과 겹치지는 않는다.
  */
  const foeScale: number[] = Array.from({ length: cap }, (_v, b) => {
    const at = battle.foes.find((x) => (x.pos ?? 0) === b);
    return at ? (kindAt(battle, at).scale ?? 1) : 1;
  });
  /*
    ── 대형 ──

    누가 앞줄이고 누가 뒷줄인지, 그리고 다섯 칸 중 어느 칸에 서는지는
    `core/party` 가 정한다 (`FORMATIONS` · `formationSpots`). **계산이 보는
    것과 같은 함수**여야 한다 — 전투도 이걸로 맞을 확률을 가르므로
    (`aimOf` 의 `front`), 따로 재면 화면에서 앞에 선 사람과 실제로 맞는
    사람이 갈린다.

    쓰러진 사람도 자리를 지킨다 (`hp` 를 안 넘긴다). 죽었다고 줄이 다시
    서면 아무도 안 움직였는데 대형이 통째로 바뀐다.
  */
  const spots = React.useMemo(
    () => formationSpots(party, chars, form),
    [party, chars, form],
  );
  /**
   * 대형의 자리와 폭 — **배율 1 기준.**
   *
   * 실제로 그릴 때는 여기에 `fit` 을 곱한다 (아래 `allyXOf`). 배율은 이
   * 폭에서 나오므로 (`fitOf`), 배율을 먹인 값으로 배율을 계산할 수는 없다 —
   * 그래서 한 번은 반드시 1 기준으로 재야 한다.
   */
  const form1 = formLayout(spots, PARTY_W);
  const allyW1 = form1.width;
  /** 적 격자의 자리와 폭 — 같은 이유로 **배율 1 기준**이다 */
  const foeForm1 = foeLayout(cap, cur.boss ? BOSS_W : FOE_W, foeScale);
  const foeW1 = foeForm1.width;

  const closeIn = closeInFor(stageW, allyW1, foeW1);
  /**
   * 그 자리의 아군이 적 앞줄까지 가려면 몇 px 을 더 가야 하나.
   *
   * **이번 렌더 값으로 바로 잰다.** `spotOf` 처럼 ref 를 거치면 첫 프레임에
   * 기본값으로 재게 되는데, 여기서 나온 수는 스윙 콜백이 아니라 화면에 바로
   * 꽂히는 값이라 한 프레임이라도 틀리면 눈에 띈다.
   *
   * 0 밑으로는 안 내려간다 — 이미 붙어 있으면 뒤로 물러설 일이 아니다.
   */
  /**
   * 그 자리의 아군의 **오른쪽 끝**이 무대 어디인가 (나와 있는 만큼 포함).
   *
   * 적 줄의 `spotOf` 와 짝이다. 뛰어드는 거리도, 적이 날린 것이 날아갈
   * 거리도 여기서 나온다.
   */
  /**
   * 그 사람의 **깊이** — 화면 위아래로 몇 번째 줄인가 (`Ground` 의 `depthAt`).
   *
   * 곧 `lane` 이다. 0 이 화면 아래(제일 크게 보이는 자리), 4 가 위다.
   * 앞줄·뒷줄과는 상관이 없다 — 저건 좌우다 (`allyXOf`).
   */
  const depthOf = (i: number) => spots[i]?.lane ?? 0;
  /** 그 사람이 아군 구역 안에서 서는 자리 (왼쪽 끝에서 px) */
  const allyXOf = (i: number) => Math.round((form1.x[i] ?? 0) * fit);
  const allySizeOf = (i: number) => Math.round(partyW * depthAt(depthOf(i)).scale);
  /**
   * 그 사람이 적 쪽으로 나와 있는 거리 (px).
   *
   * **줄로 잰다 — 깊이로 재지 않는다.** 깊이(`lane`)로 재면 위쪽 줄에 선
   * 사람이 44px 이나 덜 나가서, 대형이 통째로 비스듬히 늘어진다. 적에게
   * 가까이 가는 것은 앞줄이 하는 일이지 아래 줄이 하는 일이 아니다.
   *
   * 뒷줄은 `DEPTH_STEP` 만큼 덜 나가고, 던지는 사람은 거기서 `RANGED_BACK`
   * 만큼 더 물러난다 — 앞줄 원거리가 뒷줄 근접보다 뒤에 서지 않도록 두 값의
   * 크기를 벌려 두었다 (6 < 11).
   */
  const allyAdvOf = (i: number) => {
    const sp = spots[i];
    if (!sp) return 0;
    const melee = CHARS[sp.c.id].range === 'melee';
    return Math.max(0, Math.round(
      closeIn - (sp.row === 'back' ? DEPTH_STEP : 0) - (melee ? 0 : RANGED_BACK),
    ));
  };

  /**
   * 그 사람의 **오른쪽 끝**이 무대 어디인가 (나와 있는 만큼 포함).
   *
   * 적 줄의 `spotOf` 와 짝이다. 뛰어드는 거리도, 적이 날린 것이 날아갈
   * 거리도 여기서 나온다.
   */
  const allyRightOf = (i: number) =>
    edge + allyXOf(i) + allySizeOf(i) + allyAdvOf(i);

  /*
    스윙 콜백이 쓸 값을 렌더가 끝날 때마다 최신으로 둔다 (`foeAt` 과 같은 이유).

    `onAim` 은 `Fighter` 의 타이머 안에서 불리므로, 콜백을 매 렌더 새로
    만들어 넘기면 그 타이머가 리셋되어 아무도 공격을 못 한다. 그래서 함수는
    한 번만 만들고, 바뀌는 값은 ref 로 건넨다.
  */
  allyRightRef.current = (back: number) => allyRightOf(back);
  /*
    ── 1판 뭉개기가 건너갈 거리 ──

    ## 아군 옆이 아니라 **파티 한가운데**로 간다

    처음엔 맨 앞 아군의 오른쪽 끝까지로 쟀다. 재 보니 휴대폰 폭(무대 340~390px)
    에서 그 값이 **40px** 이었다 — 앞으로 나왔다 들어가는 평소 동작이 34px 이라,
    뭉개기가 평타와 구분이 안 됐다. 실제로 "안 온다" 는 말을 들었다.

    까닭은 무대가 좁다는 것이다. 360px 무대에 우두머리가 132px, 파티 줄이
    202px 이라 둘 사이에 남는 자리가 거의 없다. **비어 있는 곳으로 뛰면 갈 데가
    없다.**

    그래서 **파티 줄 한가운데**를 찍는다. 전원을 때리는 기술이므로 (`aim: 'all'`)
    넷 위에 내려앉는 것이 규칙과도 맞고, 그 자리는 늘 무대 왼쪽이라 거리가
    넉넉하게 나온다.

    ## 나가 있는 만큼은 뺀다

    `allyRightOf` 는 **지금 서 있는 자리**를 준다. 근접은 싸우는 동안 적 앞까지
    걸어 나가 있으므로 (`allyAdvOf`) 그 값으로 재면 파티가 실제보다 오른쪽에 있는
    것으로 잡힌다. 뛰어드는 목표는 **원래 서는 자리**여야 한다.

    ## 높이는 거리로 안 잰다

    `span * 0.42` 였다. 멀리 뛸수록 높이 뜨는 셈이라, 넓은 화면에서 무대
    천장을 뚫고 머리가 잘렸다 — 무대는 193px 이고 우두머리는 132px 이라
    남는 높이가 49px 뿐이다. 제 몸으로 재면 화면 크기와 상관없이 같다.
  */
  leapRef.current = () => {
    const boss = spotOf(0);
    /* 파티 줄이 원래 차지하는 구간 — 나가 있는 만큼을 뺀 오른쪽 끝까지 */
    const home = allyRightOf(0) - allyAdvOf(0);
    const mid = (edge + home) / 2;
    /* 우두머리 **가운데**가 거기 오게 */
    const want = Math.round(boss.x - (mid - boss.size / 2));
    return {
      /* 무대 왼쪽 벽을 넘지는 않는다 — 넘으면 몸 절반이 잘린다 */
      span: Math.max(60, Math.min(want, Math.round(boss.x))),
      rise: Math.round(boss.size * 0.3),
    };
  };
  /*
    이름표 → **대형 자리 번호** (`spots` 안에서의 순서).

    예전에는 파티 자리 번호였다 (0 이 맨 앞). 대형이 생기면서 자리가
    `spots` 로 옮겨 갔으므로, 자리를 묻는 곳들(`fire` · `shotsRef`)이
    같은 번호를 쓰게 맞춘다.
  */
  backRef.current = Object.fromEntries(spots.map((sp, i) => [sp.c.id, i]));

  const leapToOf = (i: number) => {
    const myRight = allyRightOf(i) - allyAdvOf(i);
    /* 적 격자의 **왼쪽 끝** — 그리는 코드와 같은 값을 본다 (`foeForm`) */
    const foeLeft = stageW - edge - foeForm.width - (foeAdv[0] ?? 0);
    return Math.max(0, Math.round(foeLeft - (myRight + allyAdvOf(i)) + 8));
  };

  /*
    무대가 좁으면 양쪽을 통째로 줄인다. 넓으면 1 이라 아무 일도 안 일어난다.

    크기와 간격이 **다 같은 값을 탄다** — 하나만 줄이면 겹치거나 벌어진다.
  */
  const fit = fitOf(stageW, allyW1, foeW1);
  const partyW = PARTY_W * fit;
  const foeW = (cur.boss ? BOSS_W : FOE_W) * fit;
  const edge = EDGE * fit;
  /** 실제로 그리는 적 격자 — 배율을 먹인 값 */
  const foeForm = foeLayout(cap, foeW, foeScale);

  /*
    자리마다 앞으로 나와 있는 거리.

    **누가 서 있는지가 아니라 자리가 정한다** (`rowMelee`). 서 있는 놈을
    보고 재면, 앞줄이 죽어 원거리가 0번 자리에 오는 순간 전진 거리가 다시
    계산되어 남은 놈들이 앞뒤로 미끄러진다.
  */
  const foeMelee = cur.boss ? [true] : rowMelee(battle.stage);
  const foeAdv = foeAdvance(foeMelee, cap, closeIn);
  /*
    아군은 **사람마다** 잰다 (`allyAdvOf`).

    한 줄로 설 때는 줄 전체를 한 번에 재야 했다 (앞뒤가 뒤집히지 않게).
    두 줄이 된 지금은 깊이가 둘뿐이라 뒤집힐 일이 없고, 대신 같은 줄
    안에서도 근접과 원거리가 다르게 나가야 한다.
  */
  /*
    자리 계산기(`spotOf`)가 쓸 값을 렌더가 끝날 때마다 최신으로 둔다.

    이걸 `spotOf` 의 의존성으로 넣지 않는 이유는, 스윙 콜백이 매 틱마다
    새로 만들어지면 `Fighter` 쪽 타이머가 흔들리기 때문이다. 값은 ref 로
    흘려보내고 콜백은 그대로 둔다.
  */
  /*
    새로 나타난 놈을 걷게 한다.

    화면 밖 오른쪽에서 제 자리까지 온다. `spotOf` 로 그 자리를 알고 있으므로
    "무대 오른쪽 끝까지 남은 거리" 를 그대로 출발점으로 쓴다 — 무대가 넓든
    좁든 늘 화면 가장자리에서 나타난다.
  */
  /*
    **그리기 전에** 값을 만든다.

    effect 에서 만들면 그 프레임은 값 없이 그려진다 — 즉 제자리에 한 번
    나타났다가 오른쪽으로 튀어 돌아온다. 그게 "뿅" 이다. 값을 먼저 1(화면
    밖)로 만들어 두면 첫 그림부터 밖에 있다.

    움직이기 시작하는 것은 effect 에서 한다. 그리는 중에 애니메이션을 걸면
    렌더가 부수 효과를 갖게 된다.
  */
  if (stageW) {
    for (const f of battle.foes) {
      if (walked.has(f.id)) continue;
      walked.add(f.id);
      /*
        **그 자리에서 태어난 놈은 안 걷는다** (`FoeGim.born`).

        21판 지네가 반으로 갈라지는데 조각 둘이 무대 오른쪽 끝에서 걸어
        들어왔다. 갈라진 것은 몸에서 나오는 것이라 어디서 걸어오면 안 되고,
        26판 애벌레도 같다 — 죽은 자리에서 흩어져야 흩어진 것이다.

        값을 아예 안 만든다. 0 으로 만들어 두면 렌더마다 `interpolate` 를
        새로 부르게 되고, 그건 값에 가지를 하나씩 다는 일이다.
      */
      if (f.gim?.born) continue;
      walk.set(f.id, new Animated.Value(1));
    }
  }

  useEffect(() => {
    if (!stageW) return;
    for (const [id, v] of walk) {
      if (started.has(id)) continue;
      started.add(id);
      Animated.timing(v, {
        toValue: 0,
        duration: WALK_IN_MS,
        /* 걸어오다 제자리에서 멎는다 — 미끄러지듯 서면 안 된다 */
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        /*
          다 걸었으면 값을 버린다.

          `walked` 에는 남겨 두므로 두 번 걷지 않는다. 값을 남겨 두면 그놈이
          살아 있는 내내 렌더마다 `interpolate` 를 새로 부르게 되는데, 그건
          부를 때마다 값에 가지를 하나씩 다는 일이다.
        */
        walk.delete(id);
      });
    }
    /* 죽은 놈의 값은 버린다 — 안 지우면 한 판 내내 쌓인다 */
    const alive = new Set(battle.foes.map((f) => f.id));
    for (const id of [...walk.keys()]) if (!alive.has(id)) walk.delete(id);
    for (const id of [...walked]) if (!alive.has(id)) walked.delete(id);
    for (const id of [...started]) if (!alive.has(id)) started.delete(id);
  }, [battle.foes, stageW, walk, walked, started]);

  /* 화면을 떠날 때 걷던 것을 멈춘다 — 안 멈추면 없는 화면을 향해 계속 돈다 */
  useEffect(() => () => {
    for (const v of walk.values()) v.stopAnimation();
    walk.clear();
    walked.clear();
    started.clear();
  }, [walk, walked, started]);

  /*
    자리 계산기가 쓸 값. **그리기 전에** 맞춰 둔다.

    effect 로 두었을 때는 그리고 나서 갱신되어, 새 적이 들어온 첫 프레임에는
    지난 렌더의 마릿수로 자리를 쟀다. 그 한 프레임이 "뿅" 으로 보인다.
    상태가 아니라 계산에 쓰는 값이라 렌더 중에 넣어도 안전하다.
  */
  foeAt.current = {
    stageW,
    count: battle.foes.length,
    cap,
    pos: battle.foes.map((f) => f.pos ?? 0),
    adv: foeAdv,
    base: foeW,
    scale: foeScale,
    edge,
  };

  return (
      /*
        ── 무대 하나뿐이다 ──

        예전에는 이 컴포넌트가 세 덩이였다: 머리말(판·지역·최고) · 무대 ·
        아래 요약(진행 막대와 우두머리 단추). 무대가 화면에 붙박이가 되면서
        (`HomeScreen`) 위아래 둘은 갈 데가 없어졌다 — 붙박이 밖으로 내보내면
        스크롤을 내릴 때 저것들만 따라 올라간다.

        그래서 **셋 다 무대 안으로** 넣었다. 위 띠와 채팅도 같이 얹힌다
        (`top` · `corner`). 요즘 게임 화면이 다 이 모양이고, 그렇게 하면
        배경 그림이 정보 뒤로 그대로 비친다.
      */
      <Animated.View
        style={[{
          height: STAGE_H,
          /*
            **아래로만 줄을 긋는다.** 무대가 화면 폭을 꽉 채우므로 좌우
            테두리는 화면 가장자리에 딱 붙은 선이 되는데, 그건 액자가 아니라
            그냥 화면이 좁아 보이게 만드는 선이다. 위는 화면 끝이라 줄이
            필요 없다.
          */
          borderBottomWidth: 1,
          borderColor: '#FFFFFF33',
          overflow: 'hidden',
          justifyContent: 'flex-end',
        }, shake.style]}
        onLayout={(e) => setStageW(e.nativeEvent.layout.width)}
      >
        {/*
          배경 — **그림의 지평선을 바닥판 뒤끝에 맞춘다.**

          바닥판(`Ground`)은 뒤로 갈수록 좁아지는 평면이고, 그 **위쪽 모서리가
          곧 지평선**이다. 배경 그림은 지평선 위쪽만 그려져 있고(아래 빈 곳은
          넣을 때 잘라 냈다) 그래서 그림 바닥이 곧 지평선이다. 둘을 붙이면
          땅과 먼 풍경이 한 자리에서 만난다.

          예전에는 정사각 상자에 넣고 왼쪽 위 귀퉁이만 보이게 두었다. 상자가
          무대보다 두 배 넘게 커서 **어느 부분이 보이는지가 그림 비율에 따라
          우연히** 정해졌고, 새 그림을 넣을 때마다 달라졌다.

          위로 넘치는 만큼은 잘린다 (`overflow: hidden`). 지평선 바로 위가 늘
          남으므로, 잘리는 것은 언제나 하늘 쪽이다.
        */}
        <View
          style={{
            position: 'absolute',
            left: 0, right: 0, top: 0,
            bottom: GROUND_H,
            opacity: 0.2,
            overflow: 'hidden',
            justifyContent: 'flex-end',
          }}
        >
          <Sprite
            set="bg_chapter"
            name={cur.bg}
            size={bgW}
            /*
              **띠에 꽉 채운다** (`stretch`).

              비율을 지키면(`contain`) 둘 중 하나가 난다 — 그림이 띠보다 세로로
              길면 위가 잘려 **구름이 사라지고**, 짧으면 양옆이 빈다. 화면 폭은
              기기마다 다르므로 어느 한쪽으로 맞춰 둘 수도 없다.

              먼 풍경이고 20% 로 흐려져 있어서 조금 늘어나는 건 안 보인다.
              구름이 통째로 없어지는 것과는 비교가 안 된다.
            */
            fit="stretch"
            style={{ width: bgW, height: bgH }}
          />
        </View>

        {/* 바닥 — 쿼터뷰 평면 (`Ground`) */}
        <Ground width={stageW} />

        {empty ? (
          <T size={11} dim="sub" center style={{ paddingBottom: 48 }}>
            파티가 비어 있습니다 — 아래에서 캐릭터를 세워 주세요
          </T>
        ) : (
          <>
            {/* ── 아군 (왼쪽, 그대로 오른쪽을 본다) ── */}
            <Animated.View
              style={{
                /*
                  아군 구역. 안에서는 **제 자리에 절대 좌표로** 선다
                  (`Fighter` 의 `x` · `back`) — 대형이 비는 줄을 만들 수
                  있으므로 (`2-2` 의 ③), 가로줄로는 자리를 못 잡는다.
                */
                position: 'absolute', left: edge, bottom: FLOOR,
                width: Math.round(allyW1 * fit),
                height: 1,
                /*
                  판이 열릴 때 **왼쪽 밖에서 들어온다.** 막이 걷히는 순간부터
                  제자리까지 오고, 그동안 싸움은 이미 돌고 있다 — 다 들어와서
                  멈춘 뒤에 시작하면 한 박자가 빈다.
                */
                transform: [{ translateX: walkInX(staging.phase, staging.t, -1, stageW * 0.6) }],
              }}
            >
              {/*
                **먼 줄부터 그린다.** 먼저 그려진 것이 아래에 깔리므로, 위쪽
                줄에 선 사람이 아래 줄 사람에게 가려진다.

                같은 줄이면 **뒷줄이 먼저**다. 세 대형이 다 앞뒤로 같은 줄을
                쓰는데 (`2-2` 의 ②④, 나머지 둘의 ③) 그 둘은 `depthAt` 이
                같아서 `zIndex` 로는 안 갈린다 — 그릴 때 순서가 정한다.
              */}
              {[...spots]
                .map((sp, i) => ({ sp, i }))
                .sort((a, b) => (
                  (b.sp.lane - a.sp.lane)
                  || ((a.sp.row === 'back' ? 0 : 1) - (b.sp.row === 'back' ? 0 : 1))
                ))
                .map(({ sp, i }) => {
                  const c = sp.c;
                  return (
                  <Fighter
                    key={c.id}
                    ch={c}
                    back={depthOf(i)}
                    x={allyXOf(i)}
                    /* 무대가 좁으면 사람도 같이 줄어든다 */
                    width={partyW}
                    down={down}
                    hp={hpOf(c, battle.hp)}
                    /*
                      **지금 실제로** 얼마나 빨리 휘두르나.

                      계산과 같은 함수를 쓴다 (`core/passives` 의 `liveSpd`) —
                      리안느의 +0.1, 비앙카의 다칠수록 빨라지는 것, 우두머리가
                      건 둔화가 전부 여기 들어 있다. 따로 재면 화면의 박자와
                      실제 피해가 갈리는데, 그건 눈으로 못 잡는다.
                    */
                    spd={liveSpd(c, hpOf(c, battle.hp), aliveLine, hexOf(battle.hex, c.id))}
                    /* 기절이든 감전이든 못 움직이는 것은 하나다 (`core/status` 의 `STUN`) */
                    stun={stunned(hexOf(battle.hex, c.id))}
                    silent={hasHex(hexOf(battle.hex, c.id), 'st_silence')}
                    /*
                      묶여 있나 — **묶는 기술에 맞았고 아직 못 움직이나.**

                      두 조건이 다 필요하다. 명단만 보면 속박이 풀린 뒤에도
                      덩굴이 남고, 못 움직이는 것만 보면 암석에 맞아 기절한
                      사람에게도 덩굴이 감긴다.
                    */
                    bound={
                      bindIds.includes(c.id) && stunned(hexOf(battle.hex, c.id))
                    }
                    /* 25판만 거미줄 고치다 — 나머지는 덩굴 (`BossFx` 의 `Bound`) */
                    boundWeb={battle.stage === 25}
                    /* 돌아서 있는 동안 몸이 붉게 일렁인다 (`BossFx` 의 `Charmed`) */
                    charmed={!!battle.charm?.who.includes(c.id)}
                    shock={hasHex(hexOf(battle.hex, c.id), 'st_shock')}
                    /*
                      ── 돌아섰나 ──

                      혼란에 걸린 사람은 아군을 친다 (`core/autoBattle` 의
                      `applyHit`). **내 왼쪽에 살아 있는 아군이 있으면**
                      뒤집는다 — 대형이 자리를 좌표로 정하므로 (`allyXOf`)
                      왼쪽인지 오른쪽인지를 그 자리로 바로 물을 수 있다.

                      실제로 누구를 칠지는 계산이 무작위로 고르므로 늘
                      맞지는 않는다. 왼쪽에 아무도 없을 때 안 뒤집는 것만
                      확실하면 "아군이 왼쪽에 있는데 오른쪽을 보며 때린다"
                      는 안 나온다.
                    */
                    turn={
                      !!battle.charm?.who.includes(c.id)
                      && spots.some((o2, oi) => (
                        allyXOf(oi) < allyXOf(i) && hpOf(o2.c, battle.hp) > 0
                      ))
                    }
                    cut={battle.cut?.[c.id] ?? 0}
                    /*
                      판 연출 중에는 몸도 멈춘다. 계산은 이미 막혀 있지만
                      (`fightHeld`) 몸이 계속 휘두르면 막이 걷히는 순간 검기가
                      화면을 가로지른다 (`Fighter` 의 `held`).
                    */
                    held={held}
                    /* 광란이 켜져 있는 동안은 코스트가 안 찬다 */
                    noCharge={skillsFor(c).some(
                      (sk) => !!sk.self?.noCharge
                        && hasHex(hexOf(battle.hex, c.id), sk.self.id),
                    )}
                    canCast={canCast}
                    costSeq={battle.costSeq ?? 0}
                    struck={struck[c.id] ?? 0}
                    /* 새로 걸린 것만 골라 머리 위에 한 줄 띄운다 */
                    marks={markOf[c.id]?.marks ?? NO_MARK}
                    markKey={markOf[c.id]?.key ?? ''}
                    /*
                      머리 위 한 줄은 **싸우는 동안에만** 뜼다.

                      검은 막이 걸려 있는 동안 띄워 봐야 아무도 못 본다 —
                      상시효과를 알리는 줄이 딱 그랬다 (`MarkNotes`).
                    */
                    live={!held && !down}
                    /*
                      우두머리가 **무엇으로** 쳤나 (`BossFx`). 암석이 떨어졌는지
                      덩쿨에 감겼는지 베였는지 — 붉은 깜빡임은 그걸 못 말한다.
                    */
                    hitNo={bodyFx[c.id]?.no ?? 0}
                    hitKind={bodyFx[c.id]?.kind ?? null}
                    /*
                      못 움직이는 동안 머리 위에 붙어 있는 딱지 (`core/status` 의 `CC`).

                      이건 다른 상태처럼 걸리는 순간에 한 번만 말하고 말 수가
                      없다 — 기절의 결과는 **아무 일도 안 일어나는 것**이라, 걸린
                      사람과 적이 멀어서 아직 못 치는 사람이 똑같아 보인다.
                    */
                    cc={battle.charm?.who.includes(c.id)
                      /*
                        돌아선 것이 기절보다 앞선다. 둘 다 "못 쓴다" 인데
                        기절은 가만히 서 있고 이쪽은 **아군을 친다** — 화면에서
                        벌어지는 일이 정반대라, 헷갈리면 왜 우리 편 체력이
                        줄어드는지를 못 읽는다.
                      */
                      ? '\u{1F300}혼란'
                      : ccOf(hexOf(battle.hex, c.id))}
                    /* 정화로 걷힌 사람에게서만 조각이 떠오른다 */
                    purify={purified[c.id] ?? 0}
                    onCharge={onCharge}
                    damage={pops.filter((pp) => pp.who === c.id)}
                    bless={bless}
                    /*
                      근접만 나간다. 뒤에 선 사람은 조금 덜 나가서 앞사람과
                      겹치지 않는다 — 넷이 한 점에 모이면 한 명으로 보인다.
                    */
                    /*
                      원거리도 **따라 나온다.** 예전에는 0 이라 제자리에
                      남았는데, 근접이 화면 절반을 걸어 나가면 뒤에 혼자
                      남아서 같은 파티로 안 보였다. 근접이 선 자리에서
                      `RANGED_BACK` 만큼만 뒤에 선다.
                    */
                    advance={allyAdvOf(i)}
                    /*
                      뛰어드는 기술이 적 앞줄까지 가는 데 남은 거리.

                      평소 나가 있는 만큼(`advance`)은 이미 갔으니 빼고, 앞줄
                      적의 왼쪽 끝에 어깨가 닿는 데까지만 간다. 두 줄의 배치를
                      아는 건 여기뿐이라 여기서 잰다.
                    */
                    leapTo={leapToOf(i)}
                    onAim={onAim}
                    onSwing={onSwing}
                    onSkill={onSkill}
                  />
                  );
                })}
            </Animated.View>

            {/*
              ── 적 (오른쪽, 뒤집어서 왼쪽을 본다) ──

              **전멸하면 아예 안 그린다.** 예전에는 0.35 로 흐리게 남겨
              뒀는데, 그러면 "전멸" 글씨 뒤로 적 실루엣 넷이 비쳐서 판이
              끝난 건지 아직 싸우는 건지가 안 읽혔다. 진 화면에 있어야 할
              것은 졌다는 말 하나다.

              아군은 따로 지울 필요가 없다 — 넷 다 쓰러진 상태라 제 죽는
              연출을 마치고 스스로 사라진다 (`Fighter` 의 `gone`).
            */}
            {!down && (
            <Animated.View
              style={{
                /*
                  ── 적 격자 ── 3×3 (`core/autoBattle` 의 `foeCell`).

                  가로줄로 세우고 음수 여백으로 겹치던 것을 **절대 좌표**로
                  바꿨다. 격자에는 비는 칸이 있는데 (넷이 나오는 판은 다섯
                  칸이 빈다) 가로줄로는 빈 칸을 만들 수가 없다 — 폭만 남기는
                  유령 칸을 하나씩 세워야 했고, 그게 자리를 고정하는 일의
                  절반이었다.
                */
                position: 'absolute', right: edge, bottom: FLOOR,
                width: foeForm.width,
                height: 1,
                /* 맞고 밀리는 것 위에 **오른쪽 밖에서 들어오는 것**을 얹는다 */
                transform: [
                  { translateX: knockX },
                  { translateX: walkInX(staging.phase, staging.t, 1, stageW * 0.6) },
                ],
              }}
            >
              {/*
                **목록이 아니라 자리로 돈다.**

                예전에는 `battle.foes` 를 그대로 돌렸다. 그러면 한 마리가
                죽어 목록이 줄어들 때 뒤에 있던 놈들의 번호가 통째로 밀려서,
                아무도 안 움직였는데 무리가 왼쪽으로 당겨졌다.

                **먼 줄부터 그린다.** 아군과 같은 이유다 (`zIndex` 만으로는
                같은 가로줄에 선 둘이 안 갈린다). 세로줄이 뒤면 뒤일수록 먼저,
                같은 세로줄이면 위 가로줄이 먼저다.
              */}
              {Array.from({ length: cap }, (_v, back) => back)
                .sort((a, b) => (
                  (foeCell(b).lane - foeCell(a).lane)
                  || (foeCell(b).col - foeCell(a).col)
                ))
                .map((back) => {
                const f = battle.foes.find((x) => (x.pos ?? 0) === back);
                /*
                  빈 칸 — **아무것도 안 그린다.**

                  자리가 좌표로 못 박혀 있으므로 (`foeForm`) 비어도 옆엣놈이
                  안 움직인다. 가로줄이던 시절에는 폭만 남기는 칸을 세워야 했다.
                */
                if (!f) return null;
                /*
                  한 줄에 **여러 종이 섞여** 선다 (`kindsOf`). 앞줄은 붙어서
                  싸우는 놈, 뒷줄은 떨어져서 던지는 놈이라 그림도 세기도
                  다르다 — 그래서 마리마다 제 종을 읽는다.
                */
                /* 제 것을 들고 있는 놈(분열체 · 분신 · 애벌레)은 그쪽이 이긴다 */
                const kf = kindAt(battle, f);
                /* 아직 걸어 들어오는 중이면 그 값 — 다 걸었으면 undefined */
                const walking = walk.get(f.id);
                /*
                  **제 크기 배수를 여기서 한 번만 얹는다** (`FoeKind.scale`).

                  여태 자리 폭은 우두머리 폭 그대로 잡고 그림만 줄여 그렸다
                  (`size={foeSize * kf.scale}`). 그러면 26판 애벌레 넷이 그리는
                  것의 두 배씩 자리를 먹어서, 좁히기가 최대로 걸려 넷이 한
                  덩어리로 겹쳤다.

                  이제 자리와 그림이 **같은 값**을 쓴다. 발밑 체력 막대도,
                  머리 위 로고도, 몸에서 나는 연출도 전부 이 값을 타므로
                  줄인 놈에게는 줄인 것들이 붙는다.
                */
                const foeSize = Math.round(
                  foeW * depthAt(foeDepth(back, cap)).scale * (kf.scale ?? 1),
                );
                /*
                  이 마리가 지금 그리는 칸.

                  **한 번만 정한다.** 그림자가 발밑에 붙으려면 그림과 같은 칸을
                  봐야 하는데(칸마다 세로 비율이 다르다), 두 군데서 따로 고르면
                  맞을 이유가 없다.
                */
                /*
                  특수기를 쓰는 중이면 **`skill1` 칸**을 쓴다.

                  시트에 그 칸이 없으면(슬라임 우두머리는 세 칸짜리다)
                  `Sprite` 가 같은 세트의 `attack` 으로 떨어뜨린다 — 챕터마다
                  시트를 다시 그리지 않아도 되도록 아래에 fallback 을 걸어 뒀다.
                */
                /*
                  **다른 몸이 된 놈은 그 칸에서 산다** (`FoeKind.pose`).

                  갈라진 머리와 꼬리, 고치를 쓴 몸, 우화한 몸. 같은 시트의
                  다른 칸이라 (`split_head`·`cocoon`·`imago`) 시트를 따로 안
                  받는다.

                  지금 국면이 있으면(`gim.form`) 그쪽이 이긴다 — 고치는
                  일시적이고 `pose` 는 그 놈의 평소 모습이라, 고치가 풀리면
                  제 모습으로 돌아와야 한다.
                */
                /*
                  ── 기를 모으는 동안은 **기 모으는 그림**이다 ──

                  `idle` 로 떨어지고 있었다. 22판 여왕과 29판 여왕개미는 막을
                  두르고 5초를 버티는데 (`FoeGim.still`), 그 5초 동안 화면에
                  서 있는 것은 평소 자세였다 — 시트에 `skill1` 로 기를 모으는
                  칸이 멀쩡히 들어와 있는데도.

                  국면 그림(`gim.form`)이 있으면 그쪽이 먼저다. 23판이 몸을
                  둥글게 만 것과 25판이 우화한 것은 자세가 아니라 **다른 몸**
                  이라, 기를 모으는 중이어도 그 몸이어야 한다.
                */
                const rest = f.gim?.form
                  ?? (f.gim?.still ? bossSkillFrame : (kf.pose ?? 'idle'));
                /*
                  ── 기술 칸도 **몇 번째 기술이냐**를 따라간다 ──

                  `skill1` 로 못 박혀 있었다. 그런데 26판 피로스와 30판 바알은
                  기술이 둘이고 시트에도 `skill1`·`skill2` 가 다 들어와 있다 —
                  둘 중 어느 것을 써도 같은 자세가 나오고 있었다.

                  우화한 뒤에는 `imago_skill` 이다 (25판). 몸이 통째로 바뀌었는데
                  기술만 옛 몸으로 나가면 그 순간 딴 놈이 된다.
                */
                const swingFrame = f.gim?.form === 'imago' ? 'imago_skill' : bossSkillFrame;
                /*
                  ── 국면 중에는 **맞아도 자세가 안 바뀐다** ──

                  23판이 몸을 둥글게 말면 `cocoon` 칸이 되는데, 그때 맞으면
                  `down` 칸으로 갈아 끼워져서 말았던 몸이 한 프레임 펴졌다
                  다시 말렸다. "원래 피격 이미지가 보이니까 이상하네."

                  말고 있는 동안은 그 그림 그대로 두고 흔들림만 준다 —
                  튕겨 나가는 느낌은 흔들림이 이미 맡고 있다 (`flinch`).
                */
                const foeFrame = flinch.includes(back) && !down && !f.gim?.form ? 'down'
                  /* 고치 · 기 모으기 · 막 두르기 중에는 안 휘두른다 */
                  : (foeSwing && !f.gim?.still)
                    ? (battle.boss && patShown ? swingFrame : 'attack')
                    : rest;
                /**
                 * 이 그림이 **실제로 차지하는 높이** (px).
                 *
                 * `Sprite` 는 정사각 상자에 비율을 지켜 넣으므로(`contain`)
                 * 가로로 넓은 그림은 위아래가 남는다. 발은 상자 바닥에 맞춰
                 * 내려 두었으니 (`spriteGap`), 남는 자리는 전부 **머리 위**다.
                 *
                 * 머리 위에 무언가를 놓는 것들이 이걸 봐야 한다 — 회복 숫자와
                 * 이름 말풍선. 상자 높이로 재면 그림마다 30~50px 씩 떠 버린다.
                 */
                const headH = Math.round(
                  foeSize * Math.min(1, SPRITE_RATIO[`${kf.art}/${foeFrame}`] ?? 1),
                );
                const bossOne = battle.boss && back === 0;
                /*
                  이 마리에게 걸려 있는 것 — **한 번만 재서 둘이 나누어 쓴다.**

                  로고 줄(`FoeMarks`)과 머리 위 한 줄(`MarkNotes`)이 같은 목록을
                  본다. 따로 부르면 둔 것이 갈라질 수 있고, 그러면 로고는 뗴는데
                  설명은 안 뜨는 일이 생긴다.
                */
                const fMarks = foeMarksOf(
                    foeHexOf(battle.foeHex, f.id),
                    /*
                      **이 마리가** 도발에 걸렸을 때만 뜬다.

                      한동안 "도발이 걸려 있나" 만 보고 서 있는 놈 전부에게
                      띄웠다. 그래서 계산은 그때 있던 놈만 끌려오는데
                      (`aimOf`) 화면에는 나중에 걸어 들어온 놈에게도 로고가
                      떴다 — 화면이 계산과 다른 말을 하고 있었다.
                    */
                    !!battle.taunt
                      && battle.taunt.ms > 0
                      && (battle.taunt.foes ?? []).includes(f.id),
                    battle.taunt?.ms ?? 0,
                );
                const fKey = fMarks.map((m) => `${m.set}:${m.name}`).join(',');
                return (
                  <Animated.View
                    /*
                      키는 **그 마리의 고유 번호**다 (`FoeSlot.id`).

                      자리 번호를 쓰면 한 마리가 죽거나 근접이 앞에 끼어들 때
                      남은 놈들의 키가 전부 밀려서, 멀쩡히 서 있던 놈들이
                      다시 그려진다 — 깜빡이고, 걸어 들어오는 연출도 다시 돈다.
                    */
                    key={f.id}
                    style={{
                      /* 격자 안의 제 칸 — 그리는 값과 재는 값이 같다 (`foeForm`) */
                      position: 'absolute',
                      left: foeForm.x[back] ?? 0,
                      bottom: foeForm.lift[back] ?? 0,
                      /*
                        뒤에 서도 흐려지지 않는다. 아군과 같은 이유다 —
                        54px 1-bit 그림에서 흐림은 깊이가 아니라 덜 그려진
                        것으로 보인다. 깊이는 크기와 높이가 말한다.
                      */
                      opacity: 1,
                      /* 아래 가로줄에 선 놈이 위에 그려진다 (아군의 `zIndex` 와 같다) */
                      zIndex: 10 - foeCell(back).lane,
                      /*
                        아군 쪽(왼쪽)으로 나온다. 붙어 싸우는 놈은 끝까지,
                        던지는 놈은 절반만 (`RANGED_STEP`).
                      */
                      transform: [
                        { translateX: -foeAdv[back] },
                        /*
                          걸어 들어오는 **중일 때만** 얹는다.

                          다 걸은 놈은 값이 없다. 늘 얹으면 살아 있는 내내
                          렌더마다 보간을 새로 만들게 된다.
                        */
                        ...(walking ? [{
                          translateX: walking.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, Math.max(0, stageW - spotOf(back).x)],
                          }),
                        }] : []),
                        /*
                          특수기를 쓸 때 아군 쪽으로 크게 나왔다 돌아온다.
                          우두머리에게만 얹는다 — 잡몹은 특수기를 안 쓴다.
                        */
                        /*
                          뛰어드는 판은 그것만, 나머지는 앞으로 나왔다 들어간다.
                          둘을 같이 얹지 않는다 — 같은 값을 둘이 밀면 돌아오는 길에
                          한 번 밀리고 끌에 제자리가 섞인다.
                        */
                        ...(bossOne ? (leap.no > 0 && casting.current
                          ? [{ translateX: leapAt.x }, { translateY: leapAt.y },
                            { scale: leapAt.s }]
                          : [{ translateX: rushX }, { scale: rushScale }]) : []),
                      ],
                    }}
                  >
                    {/*
                      특수기 이름 — **우두머리 머리 위 말풍선.**

                      파티 것과 같은 부품인데 가장자리가 뾰족하다 (`burst`).
                      같은 자리에 같은 크기로 뜨므로 크기로는 못 가르고,
                      흑백이라 색으로도 못 가른다 — 모양으로 가른다.

                      우두머리는 한 마리뿐이라 줄의 어느 자리에 있든 `back` 이
                      0 이다. 그래도 `battle.boss` 를 같이 보는 이유는, 잡몹이
                      특수기를 쓰게 되는 날 조용히 잡몹 머리 위에 뜨지 않게
                      하기 위해서다.
                    */}
                    {bossOne && (
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          /* 회복 숫자와 같은 기준 — 둘 다 머리 위 자리다 (`headH`) */
                          bottom: headH + 16,
                          left: -18,
                          right: -18,
                          alignItems: 'center',
                          zIndex: 46,
                        }}
                      >
                        <SkillShout nonce={patCall} name={battle.pat ?? ''} burst />
                      </View>
                    )}

                    {/*
                      ── 이 마리에게 걸려 있는 것 ──

                      비앙카의 화산이 거는 시듦과, 판 전체에 걸린 도발이 여기
                      뜬다. 안 보이면 걸렸는지 알 방법이 없다 — 회복량이
                      줄어드는 것은 두 판을 비교해야 보인다.
                    */}
                    {/*
                      ── 우두머리 몸 자리에서 나는 것 ──

                      휘두름 · 파동 · 사방으로 퍼지는 가시 · 악취 (`BossFx`).
                      그림의 `attack` 칸은 자세만 바뀌므로, **무언가가 지나갔다**를
                      따로 그려야 때리는 것으로 보인다.
                    */}
                    {/*
                      **이 판에서 붙인 불만** 그린다. 위의 쓸어내기가 이미
                      막아 주지만, 갈래가 도는 순서에 기대지 않는 편이 낫다 —
                      판이 바뀐 프레임과 쓸어내기가 도는 프레임 사이에 한 번
                      그려질 자리가 있다.
                    */}
                    {bossOne && bossFx?.stage === battle.stage && (
                      <BossSideFx
                        key={bossFx.no}
                        kind={bossFx.kind}
                        size={foeSize}
                        /* 호가 몸 높이를 지나가게 (`BossFx` 의 `Swing`) */
                        art={headH}
                      />
                    )}

                    {/*
                      ── 막을 두르고 버티는 중 ── 22 · 29판.

                      다른 연출과 달리 **끝날 때까지 돈다.** 저것들은 한 번
                      터지고 마는 것이라 번호에 맞춰 한 판 돌면 되는데, 이건
                      "지금 이러고 있다" 라 그동안 계속 보여야 한다.
                    */}
                    {/*
                      막을 두르고 있거나(22 · 29판) 몸을 말고 있을 때(23판).

                      `shield` 만 봤었다. 23판은 막이 아니라 몸을 마는 것이라
                      (`FoeGim.form`) 아무 표시도 없었고, 그래서 갑자기 안
                      맞는 것으로 보였다 — "약간의 파동이 보이게 해줘."

                      고리는 **몸 자리에서** 조여든다 (`sideBox`). 29판의
                      "기 모으는 파동이 보스가 중심이 되야 해" 가 그것이다.
                    */}
                    {((f.gim?.shield ?? 0) > 0 || !!f.gim?.still) && (
                      <Charging size={foeSize} />
                    )}

                    <FoeMarks status={fMarks} />

                    {/*
                      ── 방금 걸린 것이 무엇인지 ──

                      아군과 **같은 부품, 같은 규칙이다** (`Fighter`). 화산이 거는
                      시듬과 도발은 걸리는 쪽이 적이라, 이게 없으면 정작 알려야 할
                      것이 화면에 안 나온다 — 적 머리 위에는 로고만 있었고 그건
                      외운 사람만 읽는다.
                    */}
                    <MarkNotes marks={fMarks} markKey={fKey} live={!held && !down} />

                    {/*
                      ── 우두머리가 스스로 채운 양 ──

                      **초록**이다 (`ui/theme` 의 `GOOD_C`). 흰 숫자로 뜨면
                      피해와 구분이 안 돼서, 때렸는데 왜 체력이 오르는지가
                      화면에서 설명되지 않는다.
                    */}
                    {bossOne && heals.map((h, hi) => (
                      <View
                        key={h.key}
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          /*
                            **그림 꼭대기 바로 위** (`headH`).

                            상자 높이(`foeSize`)에서 쟀었다. 그런데 상자는
                            정사각이고 그림은 그 안에 비율대로 들어가므로
                            (`SPRITE_RATIO`), 납작한 우두머리는 상자 위쪽
                            30~40px 이 통째로 빈다 — 거기에 20px 을 더 얹으니
                            `+100` 이 머리에서 50px 넘게 떨어져 떴다.
                            "너무 위에 나옴 안보여" 가 그것이다.
                          */
                          bottom: headH + 4 + hi * 12,
                          left: foeSize * 0.3,
                          zIndex: 48,
                        }}
                      >
                        <DamageNumber text={`+${h.amt}`} dx={0} dy={0} good onDone={NOOP} />
                      </View>
                    ))}

                    {/*
                      ── 광폭화 ──

                      2분이 지나면 붉게 물들고 공격력·공격속도가 두 배가 된다
                      (`core/autoBattle` 의 `RAGE_MS`). 그림은 흰 픽셀이라
                      `tint` 한 줄이면 통째로 붉어진다 — 새 시트를 안 받아도
                      "저놈이 달라졌다" 가 한눈에 보인다.

                      머리 위에 딱지도 붙인다. 색만으로는 흑백 화면에서
                      "빨간 놈" 이 그냥 다른 종처럼 읽힐 수 있다.
                    */}
                    {/*
                      ── 발밑 `광폭화` 딱지는 걷었다 ──

                      두 가지가 걸렸다. 딱지는 걸린 뒤로 계속 붙어 있으므로
                      **언제 그렇게 됐는지**를 못 말하고, 발밑은 체력 막대가
                      쓰는 자리라 9px 짜리 글자가 막대에 겹쳤다.

                      지금은 그 순간 무대 한가운데에 붉은 글씨가 한 번 뜬다
                      (`HitFx` 의 `RageCall`). "지금 광폭화 중" 은 몸이 붉게
                      물드는 것(`tint`)이 계속 말한다 — 둘이 하는 일이 다르다.
                    */}

                    {/*
                      적도 **발밑에** 체력 막대를 단다.

                      아군만 달아 두면 "내가 얼마나 버티나" 는 보이는데 "쟤를
                      얼마나 깎았나" 는 안 보인다.

                      아군과 같은 자리여야 한다. 한쪽은 머리 위, 한쪽은 발밑이면
                      같은 것을 두 규칙으로 읽어야 한다. 그리고 적 머리 위는
                      피해 숫자가 뜨는 자리라 어차피 가려진다.

                      `Bar` 아톰을 안 쓰는 이유는 아군과 같다 — 칸을 나눈 블록
                      막대라 40px 폭에서 뭉갠다.
                    */}
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        bottom: -7,
                        left: foeSize * 0.14,
                        width: foeSize * 0.72,
                        height: 4,
                        borderWidth: 1,
                        borderColor: '#FFFFFF88',
                        zIndex: 30,
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.max(0, Math.min(1, f.hp / Math.max(1, kf.hp))) * 100}%`,
                          height: '100%',
                          backgroundColor: WHITE,
                        }}
                      />
                      {/*
                        ── 보호막 ── 체력 막대 **위에 한 겹** 더 (22 · 29판).

                        따로 그리지 않고 같은 막대에 겹친다. 5초 안에 깨야 하는
                        것이라 **어디까지 깎았나가 곧 남은 시간**인데, 막대가
                        둘이면 어느 쪽을 봐야 하는지가 흐려진다.

                        붉은색이었다. 그런데 이 게임에서 붉은색은 "급하다"
                        하나만 말하는데(`BAD_C`), 그건 **피해**와 같은 색이라
                        깎아야 할 막과 깎이는 체력이 한 색으로 겹쳐 보였다.

                        하늘색으로 갈랐다 (`SHIELD_C`). 막은 이 게임에서
                        유일하게 "적이 두른 좋은 것" 이라 제 색을 하나 쓸
                        값어치가 있고, 흰 체력과도 붉은 무엇과도 안 닮았다.
                      */}
                      {(f.gim?.shield ?? 0) > 0 && (
                        <View
                          pointerEvents="none"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${Math.max(0, Math.min(1,
                              (f.gim?.shield ?? 0) / Math.max(1, kf.hp * 0.2))) * 100}%`,
                            backgroundColor: SHIELD_C,
                          }}
                        />
                      )}
                    </View>

                    <FuseWrap ms={f.gim?.fuse}>
                    <Sprite
                      set={kf.art}
                      /* 맞은 놈만 자세가 무너진다 — 나머지는 계속 서 있다 */
                      name={foeFrame}
                      /*
                        멀수록 작다 — 크기와 높이가 같이 가야 평면 위에 선다.

                        소환물은 한 번 더 줄인다 (`FoeKind.small`). 26판 애벌레는
                        우두머리 자리에 서지만 우두머리가 아니다 — 132px 로
                        그리면 넷이 화면을 덮는다.
                      */
                      size={foeSize}
                      /*
                        **발을 상자 바닥에 맞춘다** (아군과 같은 이유).

                        적은 이게 훨씬 심했다. 종마다 그림 비율이 제각각이라
                        (슬라임 192x128, 뱉는 슬라임 127x192) 한 줄에 섞여 서면
                        발 높이가 서로 다르다 — 슬라임은 제 몸의 17% 만큼 떠
                        있었다. 네 자리가 계단처럼 물러나야 하는데 그 계단이
                        종에 따라 흐트러지니 줄로 안 보였다.

                        뒤집기(`flip`)와 같은 `transform` 에 넣는다. `Sprite` 는
                        style 에 transform 이 있으면 `flip` 을 안 얹으므로
                        (덮어써서 반전이 사라지는 걸 막는 장치다) 여기서 둘을
                        직접 합쳐야 한다.

                        **`faceLeft` 인 놈은 안 뒤집는다.** 28판 모기 시트만
                        왼쪽을 보고 들어와서, 뒤집으니 아군에게 등을 돌린 채
                        싸웠다 (`core/autoBattle` 의 `FoeKind.faceLeft`).
                      */
                      style={{
                        transform: [
                          { scaleX: kf.faceLeft ? 1 : -1 },
                          { translateY: Math.round(foeSize * spriteGap(kf.art, foeFrame)) },
                        ],
                      }}
                      /*
                        **같은 세트의 `attack` 으로 먼저 떨어진다.**

                        `skill1` 칸은 새 우두머리 시트에만 있다. 없는
                        시트에서 곧장 `creature/slime` 으로 떨어지면 우두머리가
                        특수기를 쓸 때만 갑자기 다른 생물이 된다.
                      */
                      fallbackSet={foeFrame === 'skill1' ? kf.art : 'creature'}
                      fallbackName={foeFrame === 'skill1' ? 'attack' : 'slime'}
                      /* 광폭화한 우두머리만 붉다 — 흰 픽셀이라 한 줄로 물든다 */
                      tint={bossOne && rage ? BAD_C : undefined}
                    />
                    </FuseWrap>
                  </Animated.View>
                );
              })}
            </Animated.View>
            )}
          </>
        )}

        {/* 뒷줄이 날린 것 — 무대 좌표에 못 박혀 있어 쏜 놈이 죽어도 간다 */}
        {!down && shots.map((sh) => (
          <View
            key={sh.key}
            pointerEvents="none"
            style={{
              position: 'absolute',
              /*
                우두머리 것은 쓸 때 이미 자리를 잡아 넣는다 (`fireRef`).
                잡몹 것은 제 몸통 높이로 밀어 준다 — 상자 왼쪽 위에서
                나가면 머리 옆 허공에서 나간 것으로 보인다.
              */
              left: sh.x + (sh.kind ? 0 : sh.size * 0.1),
              top: sh.y + (sh.kind ? 0 : sh.size * 0.25),
              zIndex: 50,
            }}
          >
            {sh.kind ? (
              <BossShot
                kind={sh.kind}
                dist={sh.dist}
                ms={sh.ms ?? FOE_SHOT_MS}
                size={sh.size}
              />
            ) : (
              <FoeShot art={sh.art} size={sh.size} dist={sh.dist} magic={sh.magic} />
            )}
          </View>
        ))}

        {/*
          ── 타격 연출 ──

          **적이 아니라 무대에 붙어 있다.** 맞은 그 순간의 자리를 좌표로
          받아 두었으므로(`spotOf`), 그 적이 죽어서 목록에서 빠져도 불꽃과
          숫자는 제자리에 그대로 뜬다. 스킬로 셋을 한꺼번에 잡을 때 정작
          마지막 숫자가 안 뜨던 게 이것 때문이었다.

          연출은 시간이 지나면 스스로 사라진다 (`hits` 청소).
        */}
        {!down && hits.map((h) => (
          <React.Fragment key={h.key}>
            {/*
              ── 발밑에서 솟는 것 ── 비앙카의 화산 하나다.

              맞은 적의 **발 자리**에 붙인다 (`h.y + h.size`가 발밑). 불꽃과
              달리 흩어지지 않으므로 `dx`/`dy` 를 안 얹는다 — 땅에서 나는
              것이 옆으로 밀리면 어디서 났는지가 사라진다.
            */}
            {h.erupt && (
              <View
                pointerEvents="none"
                /*
                  **상자를 적 몸만큼 벌려 둔다.**

                  불기둥은 제 상자 바닥에 발을 맞춘다 (`SkillFx` 의 `bottom: 0`).
                  그런데 여기가 **높이 없는 상자**여서 그 바닥이 곰 적의 머리
                  높이였다 — 발밑에서 솔아야 할 불이 머리 위에서 피어올랐다.
                  `height` 를 주면 그 바닥이 곰 적의 발 높이다.
                */
                style={{
                  position: 'absolute',
                  left: h.x,
                  top: h.y,
                  width: h.size,
                  height: h.size,
                  zIndex: 58,
                }}
              >
                <SkillFx kind="erupt" nonce={h.key} size={h.size} />
              </View>
            )}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: h.x + h.size * (h.blast ? -0.1 : 0.2) + h.dx,
                top: h.y + h.size * (h.blast ? 0.1 : 0.3) + h.dy,
                zIndex: 60,
              }}
            >
              <HitBurst kind={h.fx} size={h.size * (h.blast ? 1.4 : 0.75)} nonce={1} />
            </View>
            {/*
              떨어지는 화살은 **흩지 않는다.**

              불꽃은 같은 자리에서 여러 개가 터지면 한 덩어리로 보이므로 조금씩
              흩어 놓는다 (`dx`·`dy`). 그런데 화살은 "어디에 꽂혔나" 가 곧
              "누가 맞았나" 다 — 몸에서 20px 벗어난 데 꽂히면, 맞은 놈 옆의
              멀쩡한 놈을 맞힌 것처럼 보인다.

              **여기서 잡는 자리는 촉이 꽂힐 점이다.** 그림이 어디에 걸리는지는
              `FallingArrow` 가 알아서 맞춘다 (`TIP_X`·`TIP_Y`) — 예전에는 여기서
              상자 좌상단을 놓았고, 그래서 촉이 발밑 땅에 꽂혔다.

              가슴 높이(0.45)를 찍는다. 한가운데(0.5)보다 조금 위여야 화살이
              몸에 걸쳐 보이고, 더 위면 머리 위 숫자와 겹친다.
            */}
            {!!h.arrow && (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: h.x + h.size * 0.5,
                  top: h.y + h.size * 0.45,
                  zIndex: 61,
                }}
              >
                <FallingArrow
                  set={h.arrow}
                  name={projFrame(h.id)}
                  size={h.size * 0.9}
                />
              </View>
            )}
            {h.dmg > 0 && (
              <View
                pointerEvents="none"
                /* 제 놈 머리 **한가운데**에. 겹치면 한 줄씩 위로 */
                style={{
                  position: 'absolute',
                  left: h.x,
                  width: h.size,
                  alignItems: 'center',
                  /* 적도 머리 바로 위 — 아군과 같은 규칙 */
                  top: numTop(h.y, h.row),
                  zIndex: 70,
                }}
              >
                <DamageNumber
                  text={`-${h.dmg}`}
                  dx={0}
                  dy={0}
                  big={cur.boss}
                  onDone={NOOP}
                />
              </View>
            )}
          </React.Fragment>
        ))}

        {/*
          ── 해일 ── 10판 하나뿐이다.

          화면을 덮는 연출은 안 쓰기로 했는데(붉은 막 이야기가 아래에 있다)
          해일만은 휩쓰는 것이 곧 내용이라 그 규칙과 부딪힌다.

          아래 절반만 쓰고(머리 위 숫자를 안 가린다) 흐리고(0.3) 빠르게
          (620ms) 지나가는 것으로 타협했다 — 지난 뒤에 아무것도 안 남는다.
        */}
        {!down && tideNo > 0 && stageW > 0 && (
          <Tide key={tideNo} w={stageW} h={STAGE_H} />
        )}

        {/*
          ── 크게 터졌다 ── 막을 못 깼거나(22 · 29판), 우화했거나(25판),
          폭탄 애벌레가 자폭했을 때(26판).

          넷 다 **전원이 한꺼번에 당하는 일**이라 어느 한 사람 위에서는 못
          그린다. 속이 빈 테두리뿐이라 화면을 덮지 않는다.

          **터진 몸에서 퍼진다** (`burstAt`). 여태 무대 한가운데였는데, 저
          넷은 전부 저쪽 편에서 벌어지는 일이라 한가운데서 퍼지면 원인이
          화면에서 사라진다 ("이상하게 화면 한 가운데에서 파동이 퍼지네").
        */}
        {/*
          ── 갈라졌다 ── 21 · 26 · 30판.

          몸이 쪼개지는 그 순간에 갈라진 자리에서 파동이 한 번 나간다.
          `burst` 와 **다른 번호를 쓴다** — 저건 아군이 실제로 맞는 일이라
          몸마다 폭발이 하나씩 더 붙고 무대가 크게 흔들린다.
        */}
        {!down && (battle.rip ?? 0) > 0 && stageW > 0 && (
          <Burst
            key={`rip-${battle.rip}`}
            w={stageW}
            h={STAGE_H}
            cx={ripAt.x}
            cy={ripAt.y}
          />
        )}

        {!down && (battle.burst ?? 0) > 0 && stageW > 0 && (
          <Burst
            key={battle.burst}
            w={stageW}
            h={STAGE_H}
            cx={burstAt.x}
            cy={burstAt.y}
          />
        )}

        {/* 우두머리 등장 — 무대 한가운데. 전멸 안내보다 아래에 둔다 */}
        {!down && <BossCall nonce={bossCall} name={cur.name} title={cur.title} />}

        {/*
          ── 광폭화 ── 등장 알림보다 **위에** 둔다.

          둘이 같이 뜰 일은 없다 (등장은 판 시작, 광폭화는 2분 뒤). 그래도
          순서를 정해 두는 이유는, 우두머리를 부르자마자 앞 판의 광폭화
          알림이 아직 사라지는 중일 수 있어서다.
        */}
        {!down && <RageCall nonce={rageCall} />}

        {/*
          ── 특수기 이름은 이제 우두머리 머리 위에 뜬다 ──

          예전에는 무대 위쪽에 자막처럼 걸었다. 자리가 비어 있어서 걸기는
          쉬웠는데, **누가 쓴 건지**가 안 붙어 있었다. 파티 기술은 이미
          쓴 사람 머리 위에서 외치고 있었으므로(`SkillShout`) 우두머리만
          자막인 것도 규칙이 둘인 셈이었다.

          지금은 적 줄 안에서 그린다 (아래 `foes.map`).
        */}

        {/*
          ── 여기 있던 붉은 막은 없앴다 ──

          우두머리 특수기가 나갈 때 무대 전체를 `BAD_C` 로 한 번 덮었다.
          주석에는 "암전" 이라고 적혀 있었지만 실제로 칠한 색은 빨강이었고,
          화면이 통째로 시뻘게졌다. 그리고 정리 함수가 애니메이션을 멈출 때
          값이 켜진 채 남아서 **다음 판까지 붉은 막이 안 걷혔다.**

          화면 전체를 덮는 연출은 이 게임에서 두 번 다시 안 쓴다. 알려야 할
          것은 "뭔가 큰 게 왔다" 가 아니라 **"누가 맞았나"** 이고, 그건 맞은
          사람 위에서만 말할 수 있다 (`StruckMark` · 붉은 피해 숫자).
        */}

        {/*
          판이 열리고 닫히는 막 — 무대 안의 맨 위 층.

          화면 전체가 아니라 **무대만** 덮는다. 머리말과 파티 칸까지
          어두워지면 게임이 멈춘 것처럼 보인다.
        */}
        <StageVeil
          phase={staging.phase}
          t={staging.t}
          /*
            옮기는 중에는 이름을 안 띄우므로 (`StageVeil` 의 `quiet`) 여기서
            갈 판을 따로 넘길 것도 없다. 이름은 다 옮긴 뒤 시작 연출이 한 번만
            띄운다 — 두 곳에서 띄웠더니 실제로 두 번 떴다.
          */
          stage={battle.stage}
        />

        {/*
          ── 진 화면 ──

          무대 한가운데에 이것만 뜬다. 적은 이미 안 그리고 있고(위), 아군은
          죽는 연출을 마치고 스스로 사라진다 — 그래서 여기 남는 것은 배경과
          이 글씨뿐이다.
        */}
        {down && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              alignItems: 'center', justifyContent: 'center',
              zIndex: 70,
            }}
          >
            <T size={13} bold center>전멸</T>
            <T size={10} dim="sub" center style={{ marginTop: 2 }}>
              {battle.stage}스테이지를 처음부터 다시 시작합니다
            </T>
            <T size={9} dim="dim" center>스테이지는 그대로입니다</T>
          </View>
        )}

        {/*
          ══════════ 무대 위에 얹히는 층 ══════════

          여기부터는 싸움이 아니라 **정보**다. 세로로 네 덩이:

            위 띠      나와 재화와 갈 곳 (`top` → `TopBar`)
            판 줄      몇 판 · 어디 · 최고 기록
            (빈 자리)
            아래 줄    왼쪽에 채팅(`corner`), 오른쪽에 진행과 우두머리 단추

          `box-none` 이라 빈 자리로는 손가락이 그냥 통과한다 — 안 그러면
          투명한 판 하나가 무대를 통째로 덮는다.
        */}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            /* 싸움 연출(피해 숫자 40, 막 60, 전멸 70)보다 위다 */
            zIndex: 80,
          }}
        >
          {top}

          {/*
            ── 판 줄 ──

            위 띠의 검은 판(`TopBar` 의 `Fade`)이 여기까지 안 내려오므로, 이
            줄은 제 배경을 스스로 져야 한다. 밝은 챕터에서는 하늘이 거의
            흰색이라 흰 글씨가 통째로 사라졌다.

            **양끝에만** 판을 깐다 — 가운데는 비워 둬야 그 아래 무대가 계속
            보인다. 줄 전체에 깔면 띠가 하나 더 생기고, 그러면 무대가 다시
            "정보 창 밑의 게임 창" 이 된다.
          */}
          <Row between style={{ paddingHorizontal: SP.sm, paddingTop: SP.xs }}>
            <Row
              gap={SP.xs}
              style={{
                paddingHorizontal: SP.xs + 2,
                paddingVertical: 2,
                borderRadius: R.round,
                backgroundColor: SURF.veil,
              }}
            >
              {/*
                판을 골라 간다. **깬 판과 지금 판까지만** — 안 가 본 데를
                건너뛸 수 있으면 판을 차례로 여는 것 자체가 뜻을 잃는다.
              */}
              <StagePicker stage={battle.stage} best={battle.best} onGo={goStage} />
              {/*
                **지역 이름**을 스테이지 옆에. 나오는 놈 이름이 아니다.

                예전에는 주력 종의 이름을 적었다 (`cur.name`). 그런데 한 판에
                두세 종이 섞여 서므로 그중 하나만 적으면 나머지는 없는 셈이
                되고, 판이 넘어가도 같은 종이 남아 있으면 글자가 안 바뀌어
                **올라간 티가 안 난다.** 지역 이름은 다섯 판마다 한 번 바뀌므로
                어디쯤 왔는지가 읽힌다.
              */}
              <T size={FS.tiny} dim="sub">{stageOf(battle.stage).zone}</T>
            </Row>
            <View
              style={{
                paddingHorizontal: SP.xs + 2,
                paddingVertical: 3,
                borderRadius: R.round,
                backgroundColor: SURF.veil,
              }}
            >
              <T size={FS.tiny} dim="sub">최고 {battle.best}</T>
            </View>
          </Row>

          {/* 가운데는 무대가 그대로 보여야 한다 */}
          <View style={{ flex: 1 }} pointerEvents="none" />

          {/* ── 아래 줄 ── 채팅과 진행이 양끝에 선다 */}
          <View
            pointerEvents="box-none"
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              paddingHorizontal: SP.sm,
              paddingBottom: SP.xs,
              gap: SP.sm,
            }}
          >
            {/*
              채팅은 **왼쪽 아래.** 무대 안에 작게 둔다.

              폭을 절반으로 묶는다 — 넓으면 세 줄이 무대를 가로질러서, 정작
              그 아래에서 벌어지는 싸움을 덮는다.
            */}
            <View style={{ flex: 1 }}>{corner}</View>

            {/*
              ── 진행과 우두머리 ──

              채팅과 **같은 모양의 판** 위에 얹는다 (`Ticker` — 어두운 판에
              둥근 모서리, 테두리 없음). 무대 아래 양끝에 선 둘이라 서로
              짝으로 보여야 하는데, 한쪽만 테두리를 두르고 있으면 둘이 다른
              종류의 것으로 읽힌다.
            */}
            <View
              style={{
                width: '38%',
                gap: 3,
                paddingHorizontal: SP.xs + 2,
                paddingVertical: SP.xs,
                borderRadius: R.md,
                backgroundColor: SURF.veil,
              }}
            >
              <T size={FS.tiny} dim="sub" numberOfLines={1}>
                {battle.boss
                  ? (rage ? '광폭화 — 두 배' : `광폭화 ${rageSec}초`)
                  : battle.called
                    ? '남은 적을 정리하면'
                    : battle.msLeft > 0
                      ? `우두머리 ${secLeft}초`
                      : '우두머리를 부를 수 있다'}
              </T>
              {/*
                우두머리 구간에서는 **광폭화까지**를 그린다.

                저 막대는 원래 "우두머리 토벌까지" 만 그렸는데, 우두머리가
                서면 `msLeft` 가 멈춰서 (`battleTick`) 정작 제일 급한 대목에
                막대가 꼼짝 서 있었다. 같은 자리에 지금 도는 시계를 넣는다.
              */}
              <Bar
                value={battle.boss ? RAGE_MS - rageIn(battle) : STAGE_MS - battle.msLeft}
                max={battle.boss ? RAGE_MS : STAGE_MS}
                /*
                  칸 24 개. `MOB_CAP * 8` 이었는데, 저 값은 **적이 설 칸 수**라
                  시계 막대와 아무 관계가 없다 — 우연히 맞아 있던 수다. 무대
                  안으로 들어오면서 막대 폭이 화면의 38% 가 되었으므로 칸도
                  그만큼 줄인다.
                */
                blocks={24}
                height={4}
              />

              {/*
                ── 우두머리 토벌 ──

                1분을 사냥하면 나온다 (`bossReady`). **저절로 안 나온다** —
                언제 들어갈지는 사람이 정한다. 더 사냥해서 골드를 모으고
                들어가도 되고, 바로 눌러도 된다.

                자리를 미리 안 비워 둔다. 안 보일 때 빈 칸이 남아 있으면
                화면이 늘 허전하고, 나타났을 때 "생겼다" 가 안 읽힌다.
              */}
              {bossReady(battle) && <BossCallBtn onPress={callBossNow} />}

              {/*
                ⚠ ── 테스트 단추 ── 출시 전에 통째로 지운다

                광폭화를 보려면 두 분을 버텨야 한다 (`RAGE_MS`). 고치고
                확인하는 한 바퀴가 사 분이라 손이 안 간다.
              */}
              {battle.boss && !rage && (
                <Pressable onPress={rageNow}>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: BAD_C,
                      borderRadius: R.sm,
                      paddingVertical: 2,
                      alignItems: 'center',
                      backgroundColor: C.bg,
                    }}
                  >
                    <T size={8} bold style={{ color: BAD_C }}>TEST · 광폭화</T>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
  );
}
