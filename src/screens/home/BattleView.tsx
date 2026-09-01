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
 * 적은 한 마리씩이 아니라 최대 셋이 겹쳐 선다 (`core/autoBattle` 의 `MOB_CAP`).
 * 한 마리씩 내보내면 전투가 아니라 **줄 서기**로 보인다.
 *
 * 파티도 넷이 겹쳐 선다. 가로로 나란히 놓으면 좁은 화면에서 한 명이 30px 밖에
 * 안 되어 누가 누군지 안 보인다. 조금씩 어긋나게 겹치면 넷이 있다는 건
 * 보이면서 앞의 한 명은 크게 보인다 — 앞에 서는 건 방어 역할이다
 * (`core/party` 의 `frontOf`).
 *
 * ## 상태를 안 들고 있다
 *
 * 전투는 `state/slices/roster` 의 `battleTickOnce` 가 굴리고, 여기는 그 결과를
 * 비추기만 한다. 화면이 전투를 굴리면 화면을 떠날 때 전투가 멈춘다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useGame } from '@/state/store';
import { useBattleUi } from '@/state/battleUi';
import {
  MOB_CAP, STAGE_MS, bossReady, fightHeld, foeHexOf, foeOf, healPlan, pickAim,
  raging, rowMelee, skillDamage,
  skillTargets, stageOf, targetOf,
} from '@/core/autoBattle';
import { CHARS, projFrame, projSet, skillOf, skillsOf } from '@/core/chars';
import { hpOf, livingMembers, members, partyStat } from '@/core/party';
import { hasHex, hexOf } from '@/core/status';
import { foeMarksOf, liveSpd } from '@/core/passives';
import { cleanseOptOf, cleanseTargets } from '@/core/skillOpt';
import { Bar, Row, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { SPRITE_RATIO, spriteGap } from '@/ui/spriteAssets';
import { BAD_C, BORDER, SP, WHITE } from '@/ui/theme';
import { FoeMarks } from './StatusRow';
import { SkillFx } from './SkillFx';
import {
  BossCall, DamageNumber, FallingArrow, FOE_SHOT_MS, FoeShot, HitBurst, SkillShout,
  useShake,
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
 * 바닥판(`GROUND_H`)의 앞쪽 30% 지점에서 **한 칸(`DEPTH_LIFT`) 더 내려온다.**
 *
 * 30% 만 쓸 때는 맨 앞줄이 바닥판 한가운데쯤에 서서, 앞에 남는 바닥이 뒤보다
 * 넓었다 — 서 있는 자리가 평면의 앞쪽이 아니라 가운데로 읽힌다. 한 칸 내리면
 * 맨 앞줄이 바닥판 앞쪽에 서고, 뒷줄 셋이 그 위로 차례로 물러난다.
 *
 * **자리 간격과 같은 단위로 내린다.** 다른 값으로 내리면 네 줄의 간격만
 * 어긋나고, "한 칸" 이 화면에서 한 칸이 아니게 된다.
 */
const FLOOR = Math.round(GROUND_H * 0.30) - DEPTH_LIFT;

/**
 * 배경 그림의 세로 비율 (높이 ÷ 폭).
 *
 * 그림마다 다르다 — 잘라 낸 아래 빈 곳이 그림마다 달라서다. 폭을 무대에 맞춰
 * 늘릴 때 이 비율로 높이를 잡아야 안 찌그러진다. 모르는 그림은 4:3 으로 둔다.
 */
const bgRatio = (bg: string) => SPRITE_RATIO[`bg_chapter/${bg}`] ?? 0.75;
/** 양쪽 벽에서 띄우는 거리 — 붙으면 잘린 것처럼 보인다 */


/** 맨 앞 아군 스프라이트 폭. 뒤로 갈수록 `depthAt` 이 줄인다 */

/** 아군끼리 겹치는 폭 (`Fighter` 의 marginLeft) */
const PARTY_LAP = Math.round(16 * ZOOM);
/** 맨 앞 적 스프라이트 폭 */


/** 적끼리 겹치는 폭 */
const FOE_LAP = Math.round(14 * ZOOM);

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
 * 스킬로 셋을 한꺼번에 베면 **옆 놈끼리도** 겹친다. 적은 서로 `FOE_LAP`
 * 만큼 파고들어 서 있어서, 이웃 사이가 24px 밖에 안 되기 때문이다 —
 * 두세 자리 숫자 한 개가 딱 그만한 폭이다.
 *
 * 그래서 기준을 이웃 간격보다 넓게(28px) 잡는다. 옆 놈과도 줄이 갈린다.
 */
const NUM_GAP = Math.round(28 * ZOOM);

function rowFor(live: readonly { x: number }[], x: number): number {
  return live.filter((h) => Math.abs(h.x - x) < NUM_GAP).length;
}

/**
 * 무대 폭에 맞춰 대형을 얼마나 줄일까 (0~1).
 *
 * 무대를 1.4배로 키웠더니(`Ground` 의 `ZOOM`) 좁은 기기에서 두 줄이 화면을
 * 넘었다. 넷 대 넷이면 줄 둘만으로 461px 인데 260px 짜리 화면도 있다.
 *
 * 겹쳐 세우는 것(`squeezeFor`)만으로는 그만큼을 못 짜낸다 — 짜낼수록 몇인지
 * 안 보이므로 한계가 있다. 그래서 **먼저 통째로 줄이고**, 남는 어긋남만
 * 겹치기로 마무리한다.
 *
 * 치수가 전부 배율에 **정비례**하므로 필요한 폭도 정비례한다. 그래서 한 번
 * 나누면 답이 나온다 — 크기마다 따로 계산할 것이 없다.
 */
function fitOf(stageWidth: number, partyCount: number, foeCount: number): number {
  if (stageWidth <= 0) return 1;
  const need = rowWidth(foeCount, FOE_W, FOE_LAP)
    + rowWidth(partyCount, PARTY_W, PARTY_LAP)
    + EDGE * 2 + MIN_GAP;
  /* 짜내기로 메울 수 있는 만큼(약 15%)은 남겨 둔다 — 다 줄이면 늘 최소 크기다 */
  return Math.min(1, (stageWidth * 1.15) / Math.max(1, need));
}

function rowWidth(count: number, front: number, lap: number): number {
  if (count <= 0) return 0;
  let w = Math.round(front * depthAt(0).scale);
  for (let b = 1; b < count; b++) w += Math.round(front * depthAt(b).scale) - lap;
  return w;
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

/** 뒷줄일수록 덜 나간다 — 같은 줄이 한 점에 겹치지 않게 */
const DEPTH_STEP = Math.round(8 * ZOOM);

/**
 * 줄에 선 사람들이 각자 상대 쪽으로 나와 있는 거리(px). 앞에서부터.
 *
 * **줄 전체를 한 번에 계산한다.** 한 명씩 따로 재면 뒤에 선 근접이 앞에 선
 * 원거리를 앞질러 버린다 — 원거리는 `RANGED_BACK` 만큼 덜 나가는데 자리
 * 차이는 `DEPTH_STEP` 뿐이라, 그 차이가 뒤집힌다. 실제로 사제가 궁수를
 * 지나쳐 둘이 겹쳐 섰다.
 *
 * 그래서 **앞사람보다 더 나가지 못하게** 막는다. 줄의 앞뒤가 무슨 일이 있어도
 * 안 뒤집힌다.
 *
 * **아군과 적이 같은 식을 쓴다.** 그리고 화면에 그릴 때(`transform`)와 자리를
 * 잴 때(`spotOf`)도 같은 식이어야 한다 — 예전에 둘이 갈라져서, 이펙트가 서
 * 있는 자리와 다른 데서 터졌다.
 *
 * @param melee 앞에서부터 각 자리가 붙어 싸우는 종인가
 */
function advanceRow(melee: readonly boolean[], closeIn: number): number[] {
  const out: number[] = [];
  for (let b = 0; b < melee.length; b++) {
    const raw = Math.max(0, Math.round(
      closeIn - b * DEPTH_STEP - (melee[b] ? 0 : RANGED_BACK),
    ));
    out.push(b === 0 ? raw : Math.min(raw, out[b - 1]));
  }
  return out;
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
 * ## 적 수는 **실제 수가 아니라 상한**을 쓴다
 *
 * 처음엔 지금 서 있는 적 수를 넣었다. 그랬더니 슬라임이 한 마리 죽을 때마다
 * 줄 폭이 줄고, 그만큼 아군이 앞으로 **순간이동**했다. 0.5초마다 마리 수가
 * 바뀌니 파티가 계속 튀었다.
 *
 * 그래서 `MOB_CAP`(꽉 찼을 때)으로 잰다. 자리는 스테이지 내내 고정이고,
 * 적이 줄면 그냥 틈이 넓어질 뿐이다 — 아무도 안 움직인다.
 */
function closeInFor(
  stageWidth: number, partyCount: number, foeCount: number, boss: boolean,
): number {
  if (stageWidth <= 0) return 0;
  const f = fitOf(stageWidth, partyCount, foeCount);
  const gapNow = stageWidth
    - EDGE * f - rowWidth(foeCount, (boss ? BOSS_W : FOE_W) * f, FOE_LAP * f)
    - EDGE * f - rowWidth(partyCount, PARTY_W * f, PARTY_LAP * f);
  return Math.max(0, Math.round((gapNow - CLASH_GAP * f) / 2));
}

/**
 * 좁은 화면에서 대형을 얼마나 더 좁힐까 (px).
 *
 * 아주 좁은 기기에서는 **줄 두 개만으로 이미 화면을 넘는다.** 아군 넷(142px)에
 * 적 셋(116px)이면 벽여백까지 294px 인데, 무대가 260px 이면 앞으로 한 발도
 * 안 나가도 34px 이 겹친다. `closeInFor` 를 0 으로 막아도 소용이 없다.
 *
 * 그때는 같은 편끼리 **더 겹쳐 세운다.** 대형이 촘촘해질 뿐 아무도 잘리거나
 * 사라지지 않고, 넓은 화면에서는 0 이라 아무 일도 없다.
 *
 * @returns 한 명당 추가로 겹칠 폭
 */
function squeezeFor(
  stageWidth: number, partyCount: number, foeCount: number, boss: boolean,
): number {
  if (stageWidth <= 0) return 0;
  const f = fitOf(stageWidth, partyCount, foeCount);
  const rows = rowWidth(foeCount, (boss ? BOSS_W : FOE_W) * f, FOE_LAP * f)
    + rowWidth(partyCount, PARTY_W * f, PARTY_LAP * f);
  /* 줄 둘 + 벽여백 + 최소한의 틈이 들어가야 한다 */
  const need = rows + EDGE * 2 + MIN_GAP;
  if (need <= stageWidth) return 0;
  /* 겹칠 수 있는 자리는 (사람 수 − 1) 곱하기 둘 */
  const seams = Math.max(1, (partyCount - 1) + (foeCount - 1));
  void f;
  /*
    짜내는 폭에도 한계가 있다 — 너무 겹치면 몇인지 안 보인다.

    무대를 키우면 줄도 같이 넓어지므로 이 한계도 같이 커져야 한다. 안 그러면
    좁은 기기에서 대형이 화면을 넘는다.
  */
  return Math.min(Math.round(14 * ZOOM), Math.ceil((need - stageWidth) / seams));
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

export function BattleView() {
  const battle = useGame((s) => s.battle);
  const party = useGame((s) => s.party);
  const chars = useGame((s) => s.chars);
  const strikeFoe = useGame((s) => s.strikeFoe);
  const skillFoe = useGame((s) => s.skillFoe);
  const skillOpts = useGame((s) => s.skillOpts);
  const goStage = useGame((s) => s.goStage);
  const callBossNow = useGame((s) => s.callBossNow);

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
    const sk = skillsOf(id)[slot];
    if (!sk) return false;
    if (sk.cleanse) {
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
    직접 정한 것이라(오른쪽 벽에서 `EDGE`, 서로 `FOE_LAP` 만큼 겹침) 그대로
    되짚으면 정확한 자리가 나온다 — 측정이 필요 없다.
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
    squeeze: 0, closeIn: 0, base: FOE_W, edge: EDGE, lap: FOE_LAP,
    /** 목록 자리 → 무대 자리 */
    pos: [] as number[],
    /** 자리별 근접 여부 — 원거리는 안 걸어 나온다 */
    melee: [] as boolean[],
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
    { key: number; art: string; x: number; y: number; size: number; dist: number }[]
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
    판이 열리고 닫히는 연출 (`StageIntro`).

    얼마나 오래 하느냐는 **엔진이** 정한다 (`battle.openIn`/`clearIn`) —
    그동안 틱이 안 싸우기 때문이다. 여기서는 그림만 그린다.
  */
  const staging = useStageStaging(battle);

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
    /* 치우고 나간다 — 화면을 떠난 뒤에 상태를 건드리면 안 된다 */
    const off = setTimeout(() => setPatShown(false), FOE_BEAT_MS + 300);
    return () => clearTimeout(off);
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
    if (!who.length) return;
    setStruck((old) => {
      const next = { ...old };
      for (const id of who) next[id] = (next[id] ?? 0) + 1;
      return next;
    });
  }, [battle.patSeq, battle.struck]);

  /*
    ── 우두머리가 스스로 채웠다 ──

    초록 `+N` 이 머리 위에 뜬다 (`DamageNumber` 의 `good`). 흰 숫자로 뜨면
    피해와 구분이 안 돼서, 20판에서 15초마다 일어나던 회복을 아무도 회복인
    줄 몰랐다.
  */
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

  const [bossCall, setBossCall] = useState(0);
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
   * 그 자리의 적이 지금 화면 어디에 있나 (무대 왼쪽·위 기준).
   *
   * 줄은 오른쪽 벽에서 `EDGE` 만큼 띄우고, 뒤에 선 놈부터 왼쪽에 세운 뒤
   * `FOE_LAP` 만큼 서로 겹친다. 여기서는 그 배치를 그대로 되짚는다.
   */
  /**
   * 그 **자리**가 무대 어디인가 (목록 순서가 아니라 `FoeSlot.pos`).
   *
   * 자리 수(`cap`)로 잰다 — 서 있는 마릿수로 재면 한 마리 죽을 때마다 줄
   * 폭이 줄어서 남은 놈들이 통째로 앞으로 당겨진다.
   */
  const spotOf = React.useCallback((back: number) => {
    const a = foeAt.current;
    const n = Math.max(1, a.cap);
    /* 줄 전체의 전진 거리 — 앞지르기가 막힌 값이다 */
    const adv = advanceRow(a.melee.length ? a.melee : [true], a.closeIn);
    const lap = a.lap + a.squeeze;
    const sizeOf = (b: number) => Math.round(a.base * depthAt(b).scale);
    const size = sizeOf(back);

    /* 맨 앞이 왼쪽 끝이고, 뒤엣놈일수록 오른쪽으로 물러나며 작아진다 */
    let width = 0;
    for (let k = 0; k < n; k++) width += sizeOf(k) - (k ? lap : 0);

    let off = 0;
    for (let k = 0; k < back; k++) off += sizeOf(k) - lap;

    /* 적은 아군 쪽으로 나와 있다 — `transform` 이라 배치에는 안 잡힌다 */
    const out = -(adv[back] ?? 0);

    return {
      x: a.stageW - a.edge - width + off + out,
      /* 줄은 바닥에서 `FLOOR` 만큼 떠 있고, 뒤엣놈은 `lift` 만큼 더 올라간다 */
      y: STAGE_H - FLOOR - depthAt(back).lift - size,
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
    strikeFoe(sw.id, at);

    const key = hitSeq.current++;
    /* 같은 자리에서 터지면 여러 개가 하나로 보인다 — 조금씩 흩는다 */
    setHits((old) => {
      const live = old.slice(-7);
      return [...live, {
        ...sw, key, ...spot, blast: false, arrow: '', erupt: false,
        row: rowFor(live, spot.x), born: Date.now(),
        dx: -14 + Math.random() * 24, dy: -6 + Math.random() * 20,
      }];
    });
    shake.fire(0.55);
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
    const sk = skillsOf(me.id)[slot] ?? skillOf(me.id);

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
    ── 특수기가 나가면 무대가 통째로 움직인다 ──

    한동안 특수기와 평타가 화면에서 **거의 같아 보였다.** 말풍선이 하나 뜨고,
    같은 크기로 팔을 한 번 휘두르는 것이 전부였다. 우두머리가 2배짜리 기술을
    써도 잡몹이 때리는 것과 인상이 다르지 않았다.

    세 가지를 한꺼번에 건다:

      돌진   우두머리가 아군 쪽으로 크게 나왔다 돌아온다. 몸이 커지므로
             (`scale`) 화면에서 차지하는 자리도 잠깐 늘어난다
      암전   무대 전체가 한 번 어두워졌다 밝아진다 — 다음에 일어날 일에
             눈이 가게 만드는, 제일 싼 방법이다
      흔들   평타(0.55)보다 훨씬 세게 (2.2)

    셋 다 400ms 안에 끝난다. 길게 끌면 그 사이에 다음 평타가 겹쳐서 무슨
    동작인지 알 수 없게 된다.
  */
  const rush = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!patCall) return undefined;
    shake.fire(2.2);
    const a = Animated.parallel([
      Animated.sequence([
        Animated.timing(rush, {
          toValue: 1, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(rush, {
          toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
    ]);
    a.start();
    return () => a.stop();
  }, [patCall, rush, flash, shake]);

  /* `interpolate` 는 한 번만 만든다 — 렌더마다 부르면 가지가 쌓인다 */
  const rushX = useMemo(() => rush.interpolate({
    inputRange: [0, 1], outputRange: [0, -Math.round(34 * ZOOM)],
  }), [rush]);
  const rushScale = useMemo(() => rush.interpolate({
    inputRange: [0, 1], outputRange: [1, 1.18],
  }), [rush]);
  const flashOn = useMemo(() => flash.interpolate({
    inputRange: [0, 1], outputRange: [0, 0.55],
  }), [flash]);

  useEffect(() => {
    /*
      **체력이 실제로 닳은 그 순간**에 전부 한다 — 숫자 · 적의 휘두르기 ·
      날아오는 것. 예전에는 여기서 모아만 두고 따로 도는 1.1초 박자가 띄웠는데,
      그러면 막대가 먼저 내려가고 숫자가 나중에 떴다.

      기록은 **연출을 안 하는 때에도** 남긴다 (전멸·빈 파티). 안 그러면 다시
      싸울 때 그동안의 변화가 통째로 "방금 맞은 것" 으로 뜬다.
    */
    const hurt: [string, number][] = [];
    for (const c of members(party, chars)) {
      const now = hpOf(c, battle.hp);
      const was = prevHp.current[c.id];
      if (was !== undefined && now < was) hurt.push([c.id, Math.round(was - now)]);
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

    if (empty || down || !hurt.length) return undefined;

    const late: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => { late.push(setTimeout(fn, ms)); };

    /* 적이 팔을 휘두른다 */
    if (swung) {
      setFoeSwing(true);
      after(200, () => setFoeSwing(false));
    }

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

    const made = hurt.map(([id, v]) => ({ key: seq.current++, who: id, text: `-${v}` }));
    setPops((old) => [...old.slice(-4), ...made]);
    after(750, () => {
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
        return {
          key: hitSeq.current++,
          art: foeOf(battle.stage, battle.boss, f.k).art,
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
  const cap = cur.boss ? 1 : MOB_CAP;
  const closeIn = closeInFor(stageW, line.length, cap, cur.boss);
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
  const allyRightOf = (back: number) => {
    const n = Math.max(1, line.length);
    const lap = pLap + squeeze;
    const sizeOf = (b: number) => Math.round(partyW * depthAt(b).scale);

    /* 아군 줄 — 왼쪽 벽에서 EDGE, 맨 앞만 빼고 서로 파고든다 */
    let left = edge;
    for (let k = 0; k < n - 1 - back; k++) {
      const b = n - 1 - k;
      left += sizeOf(b) - (b === 0 ? 0 : lap);
    }
    if (back !== 0) left -= lap;
    return left + sizeOf(back) + (allyAdv[back] ?? 0);
  };

  /*
    스윙 콜백이 쓸 값을 렌더가 끝날 때마다 최신으로 둔다 (`foeAt` 과 같은 이유).

    `onAim` 은 `Fighter` 의 타이머 안에서 불리므로, 콜백을 매 렌더 새로
    만들어 넘기면 그 타이머가 리셋되어 아무도 공격을 못 한다. 그래서 함수는
    한 번만 만들고, 바뀌는 값은 ref 로 건넨다.
  */
  allyRightRef.current = (back: number) => allyRightOf(back);
  backRef.current = Object.fromEntries(
    line.map((c, i) => [c.id, line.length - 1 - i]),
  );

  const leapToOf = (back: number) => {
    const n = Math.max(1, line.length);
    const lap = pLap + squeeze;
    const sizeOf = (b: number) => Math.round(partyW * depthAt(b).scale);
    const myRight = allyRightOf(back) - (allyAdv[back] ?? 0);

    /* 적 줄 — 오른쪽 벽에서 EDGE, **앞줄이 왼쪽 끝** */
    /* 자리 수로 잰다 — 마릿수로 재면 한 마리 죽을 때마다 도약 거리가 튄다 */
    const fn = Math.max(1, cap);
    const fbase = foeW;
    const flap = fLap + squeeze;
    const fsize = (b: number) => Math.round(fbase * depthAt(b).scale);
    let fwidth = 0;
    for (let k = 0; k < fn; k++) fwidth += fsize(k) - (k ? flap : 0);

    const foeLeft = stageW - edge - fwidth - (foeAdv[0] ?? 0);

    return Math.max(0, Math.round(foeLeft - (myRight + (allyAdv[back] ?? 0)) + 8));
  };

  /*
    무대가 좁으면 대형을 통째로 줄인다. 넓으면 1 이라 아무 일도 안 일어난다.

    크기와 간격이 **다 같은 값을 탄다** — 하나만 줄이면 겹치거나 벌어진다.
  */
  const fit = fitOf(stageW, line.length, cap);
  const partyW = PARTY_W * fit;
  const foeW = (cur.boss ? BOSS_W : FOE_W) * fit;
  const edge = EDGE * fit;
  const pLap = PARTY_LAP * fit;
  const fLap = FOE_LAP * fit;

  /* 좁은 화면에서만 0 보다 커진다 */
  const squeeze = squeezeFor(stageW, line.length, cap, cur.boss);

  /*
    각 줄이 앞으로 나와 있는 거리 — 앞뒤가 안 뒤집히게 줄 단위로 잰다.

    **누가 서 있는지가 아니라 자리가 정한다** (`rowMelee`). 서 있는 놈을
    보고 재면, 앞줄이 죽어 원거리가 0번 자리에 오는 순간 줄 전체의 전진
    거리가 다시 계산되어 남은 놈들이 앞뒤로 미끄러진다.
  */
  const foeMelee = cur.boss ? [true] : rowMelee(battle.stage);
  const foeAdv = advanceRow(foeMelee, closeIn);
  const allyAdv = advanceRow(
    line.map((c) => CHARS[c.id].range === 'melee'),
    closeIn,
  );
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
    for (const { id } of battle.foes) {
      if (walked.has(id)) continue;
      walked.add(id);
      walk.set(id, new Animated.Value(1));
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
    squeeze,
    melee: foeMelee,
    closeIn,
    base: foeW,
    edge,
    lap: fLap,
  };

  return (
    <View style={[BORDER, { padding: SP.sm }]}>
      {/* ── 머리말 ── */}
      <Row between>
        <Row gap={SP.xs}>
          {/*
            판을 골라 간다. **깬 판과 지금 판까지만** — 안 가 본 데를
            건너뛸 수 있으면 판을 차례로 여는 것 자체가 뜻을 잃는다.
          */}
          <StagePicker stage={battle.stage} best={battle.best} onGo={goStage} />
          {/*
            **지역 이름**을 스테이지 옆에. 나오는 놈 이름이 아니다.

            예전에는 주력 종의 이름을 적었다 (`cur.name`). 그런데 한 판에 두세
            종이 섞여 서므로 그중 하나만 적으면 나머지는 없는 셈이 되고, 판이
            넘어가도 같은 종이 남아 있으면 글자가 안 바뀌어 **올라간 티가 안
            난다.** 지역 이름은 다섯 판마다 한 번 바뀌므로 어디쯤 왔는지가 읽힌다.
          */}
          <T size={10} dim="sub">{stageOf(battle.stage).zone}</T>
          {/*
            우두머리 꼬리표를 뗐다. 우두머리가 나오면 화면 한가운데에 이름이
            크게 떴다 사라지고(`BossCall`), 덩치도 잡몹의 1.5배다 — 머리말에
            글자로 한 번 더 적을 이유가 없다.
          */}
        </Row>
        <T size={9} dim="dim">최고 {battle.best}</T>
      </Row>

      {/* ── 무대 ── */}
      <Animated.View
        style={[{
          height: STAGE_H,
          marginTop: SP.xs,
          borderWidth: 1,
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
                position: 'absolute', left: edge, bottom: FLOOR,
                flexDirection: 'row', alignItems: 'flex-end',
                /*
                  판이 열릴 때 **왼쪽 밖에서 들어온다.** 막이 걷히는 순간부터
                  제자리까지 오고, 그동안 싸움은 이미 돌고 있다 — 다 들어와서
                  멈춘 뒤에 시작하면 한 박자가 빈다.
                */
                transform: [{ translateX: walkInX(staging.phase, staging.t, -1, stageW * 0.6) }],
              }}
            >
              {/*
                뒤에 선 사람부터 그린다 — 뒤에 있는 사람이 먼저 그려져야
                앞사람에게 가려진다. `line[0]` 이 앞이라 역순으로 돈다.
                아군은 왼쪽에 있으므로 **오른쪽 끝이 앞**이다.
              */}
              {[...line].reverse().map((c, i) => (
                <View key={c.id}>
                  <Fighter
                    ch={c}
                    back={line.length - 1 - i}
                    squeeze={squeeze}
                    /* 무대가 좁으면 사람도 같이 줄어든다 */
                    width={partyW}
                    lap={pLap}
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
                    stun={hasHex(hexOf(battle.hex, c.id), 'st_stun')}
                    silent={hasHex(hexOf(battle.hex, c.id), 'st_silence')}
                    cut={battle.cut?.[c.id] ?? 0}
                    /*
                      판 연출 중에는 몸도 멈춘다. 계산은 이미 막혀 있지만
                      (`fightHeld`) 몸이 계속 휘두르면 막이 걷히는 순간 검기가
                      화면을 가로지른다 (`Fighter` 의 `held`).
                    */
                    held={held}
                    /* 광란이 켜져 있는 동안은 코스트가 안 찬다 */
                    noCharge={skillsOf(c.id).some(
                      (sk) => !!sk.self?.noCharge
                        && hasHex(hexOf(battle.hex, c.id), sk.self.id),
                    )}
                    canCast={canCast}
                    costSeq={battle.costSeq ?? 0}
                    struck={struck[c.id] ?? 0}
                    struckName={battle.pat ?? ''}
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
                    advance={allyAdv[line.length - 1 - i] ?? 0}
                    /*
                      뛰어드는 기술이 적 앞줄까지 가는 데 남은 거리.

                      평소 나가 있는 만큼(`advance`)은 이미 갔으니 빼고, 앞줄
                      적의 왼쪽 끝에 어깨가 닿는 데까지만 간다. 두 줄의 배치를
                      아는 건 여기뿐이라 여기서 잰다.
                    */
                    leapTo={leapToOf(line.length - 1 - i)}
                    onAim={onAim}
                    onSwing={onSwing}
                    onSkill={onSkill}
                  />
                </View>
              ))}
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
                position: 'absolute', right: edge, bottom: FLOOR,
                flexDirection: 'row', alignItems: 'flex-end',
                /* 맞고 밀리는 것 위에 **오른쪽 밖에서 들어오는 것**을 얹는다 */
                transform: [
                  { translateX: knockX },
                  { translateX: walkInX(staging.phase, staging.t, 1, stageW * 0.6) },
                ],
              }}
            >
              {/*
                맨 앞 적이 **왼쪽 끝**이다 (아군과 마주 보는 쪽).

                오랫동안 반대로 그리고 있었다. 아군 줄을 그리는 코드를 그대로
                복사해 왔는데, 아군은 왼쪽에 서므로 **오른쪽 끝이 앞**이고 적은
                오른쪽에 서므로 **왼쪽 끝이 앞**이다. 역순으로 돌린 채 두었더니
                제일 크고 제일 앞이어야 할 놈이 아군에서 제일 먼 자리에 섰다.

                눈에 잘 안 띄었던 건 무리가 뭉쳐 보이기 때문이다. 그런데 실제로
                때리는 놈(`foes[0]`)이 저 끝에 있어서, 붙어 싸우라고 걸어 나가도
                가운데가 90px 씩 비었다.

                깊이는 `zIndex` 가 맡으므로 그리는 차례는 자리 순서면 된다.

                ── **목록이 아니라 자리로 돈다** ──

                예전에는 `battle.foes` 를 그대로 돌렸다. 그러면 한 마리가
                죽어 목록이 줄어들 때 뒤에 있던 놈들의 번호가 통째로 밀려서,
                아무도 안 움직였는데 줄이 왼쪽으로 당겨졌다.

                지금은 **자리 넷을 늘 그린다.** 비어 있는 자리는 폭만
                차지하는 빈 칸이라(`flexDirection: 'row'` 라 폭이 곧 자리다),
                옆에 선 놈들은 아무 영향을 안 받는다.
              */}
              {Array.from({ length: cap }, (_v, back) => {
                const f = battle.foes.find((x) => (x.pos ?? 0) === back);
                if (!f) {
                  /*
                    빈자리 — **폭만 남긴다.**

                    안 그리면 뒤에 선 놈들이 그만큼 앞으로 당겨진다. 자리를
                    고정하는 일의 절반이 여기다.
                  */
                  return (
                    <View
                      key={`gap${back}`}
                      style={{
                        width: Math.round(foeW * depthAt(back).scale),
                        height: 1,
                        marginLeft: back === 0 ? 0 : -(fLap + squeeze),
                        marginBottom: depthAt(back).lift,
                      }}
                    />
                  );
                }
                /*
                  한 줄에 **여러 종이 섞여** 선다 (`kindsOf`). 앞줄은 붙어서
                  싸우는 놈, 뒷줄은 떨어져서 던지는 놈이라 그림도 세기도
                  다르다 — 그래서 마리마다 제 종을 읽는다.
                */
                const kf = foeOf(battle.stage, battle.boss, f.k);
                /* 아직 걸어 들어오는 중이면 그 값 — 다 걸었으면 undefined */
                const walking = walk.get(f.id);
                const foeSize = Math.round(foeW * depthAt(back).scale);
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
                const foeFrame = flinch.includes(back) && !down ? 'down'
                  : foeSwing ? (battle.boss && patShown ? 'skill1' : 'attack')
                    : 'idle';
                const bossOne = battle.boss && back === 0;
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
                      marginLeft: back === 0 ? 0 : -(fLap + squeeze),
                      /* 뒤에 선 놈은 바닥판 안쪽이라 위로 올라간다 (`Ground`) */
                      marginBottom: depthAt(back).lift,
                      /*
                        뒤에 서도 흐려지지 않는다. 아군과 같은 이유다 —
                        54px 1-bit 그림에서 흐림은 깊이가 아니라 덜 그려진
                        것으로 보인다. 깊이는 크기와 높이가 말한다.
                      */
                      opacity: 1,
                      zIndex: back,
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
                        ...(bossOne ? [{ translateX: rushX }, { scale: rushScale }] : []),
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
                          bottom: foeSize + 6,
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
                    <FoeMarks
                      status={foeMarksOf(
                        foeHexOf(battle.foeHex, f.id),
                        !!battle.taunt && battle.taunt.ms > 0,
                        battle.taunt?.ms ?? 0,
                      )}
                    />

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
                          bottom: foeSize + 20 + hi * 12,
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
                    {bossOne && rage && (
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          bottom: -18,
                          left: -14,
                          right: -14,
                          alignItems: 'center',
                          zIndex: 41,
                        }}
                      >
                        <View style={{ borderWidth: 1, borderColor: BAD_C, paddingHorizontal: 3 }}>
                          <T size={9} bold style={{ color: BAD_C }}>광폭화</T>
                        </View>
                      </View>
                    )}

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
                    </View>

                    <Sprite
                      set={kf.art}
                      /* 맞은 놈만 자세가 무너진다 — 나머지는 계속 서 있다 */
                      name={foeFrame}
                      /* 멀수록 작다 — 크기와 높이가 같이 가야 평면 위에 선다 */
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
                      */
                      style={{
                        transform: [
                          { scaleX: -1 },
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
              left: sh.x + sh.size * 0.1,
              top: sh.y + sh.size * 0.25,
              zIndex: 50,
            }}
          >
            <FoeShot art={sh.art} size={sh.size} dist={sh.dist} />
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
                style={{ position: 'absolute', left: h.x, top: h.y, zIndex: 58 }}
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
                  top: h.y - 11 - h.row * 12,
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

        {/* 우두머리 등장 — 무대 한가운데. 전멸 안내보다 아래에 둔다 */}
        {!down && <BossCall nonce={bossCall} name={cur.name} title={cur.title} />}

        {/*
          ── 특수기 이름은 이제 우두머리 머리 위에 뜬다 ──

          예전에는 무대 위쪽에 자막처럼 걸었다. 자리가 비어 있어서 걸기는
          쉬웠는데, **누가 쓴 건지**가 안 붙어 있었다. 파티 기술은 이미
          쓴 사람 머리 위에서 외치고 있었으므로(`SkillShout`) 우두머리만
          자막인 것도 규칙이 둘인 셈이었다.

          지금은 적 줄 안에서 그린다 (아래 `foes.map`).
        */}

        {/*
          ── 특수기 암전 ──

          우두머리 특수기가 나가는 순간 무대가 한 번 어두워졌다 밝아진다.

          평타와 특수기가 화면에서 거의 같아 보이던 것을 가르는 셋 중 하나다
          (나머지는 돌진과 흔들림 — `rush` 주석). 어둡게 하는 쪽을 고른 이유는
          이 게임이 흰 그림에 검은 배경이라, **밝히면 그림이 묻히고 어둡게
          하면 그림이 남기** 때문이다.

          `pointerEvents="none"` 이라 단추를 안 가린다. `StageVeil` 보다
          아래층이라 판이 열리는 막과 다투지 않는다.
        */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: BAD_C,
            opacity: flashOn,
            zIndex: 60,
          }}
        />

        {/*
          판이 열리고 닫히는 막 — 무대 안의 맨 위 층.

          화면 전체가 아니라 **무대만** 덮는다. 머리말과 파티 칸까지
          어두워지면 게임이 멈춘 것처럼 보인다.
        */}
        <StageVeil
          phase={staging.phase}
          t={staging.t}
          stage={battle.stage}
          fromClear={staging.fromClear}
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
      </Animated.View>

      {/*
        ── 아래 요약은 없앴다 ──

        맨 앞 적 체력, 파티 합계 체력, 처치 수와 초당 딜이 여기 있었다. 전부
        **무대 위에서 이미 보이는 것**이다 — 적은 머리 위에 막대가 있고, 파티는
        머리 위 막대와 아래 파티 칸에 숫자까지 있다. 같은 값을 두 번 적으면
        어느 쪽을 봐야 하는지가 흐려지고, 무대가 그만큼 눌린다.

        남긴 것은 **우두머리까지 남은 시간** 하나다. 그건 화면 어디에도 없다.
      */}

      {/* ── 스테이지 진행 ── */}
      <Row between style={{ marginTop: SP.sm }}>
        <T size={9} dim="sub">
          {battle.boss
            ? '우두머리와 싸우는 중'
            : battle.called
              ? '남은 적을 정리하면 우두머리가 나온다'
              : battle.msLeft > 0
                ? `우두머리 토벌까지 ${secLeft}초`
                : '우두머리를 부를 수 있다'}
        </T>
      </Row>
      <Bar
        value={STAGE_MS - battle.msLeft}
        max={STAGE_MS}
        blocks={MOB_CAP * 8}
        height={5}
      />

      {/*
        ── 우두머리 토벌 ──

        1분을 사냥하면 나온다 (`bossReady`). **저절로 안 나온다** — 언제
        들어갈지는 사람이 정한다. 더 사냥해서 골드를 모으고 들어가도 되고,
        바로 눌러도 된다.

        자리를 미리 안 비워 둔다. 안 보일 때 빈 칸이 남아 있으면 화면 아래가
        늘 허전하고, 나타났을 때 "생겼다" 가 안 읽힌다.
      */}
      {bossReady(battle) && <BossCallBtn onPress={callBossNow} />}

      {/*
        ── "1스테이지부터 시작" 단추는 없앴다 ──

        머리말의 `< >` 로 한 판씩 옮기는 길이 이미 있고, 그것 말고 한 번에
        1판으로 가는 길을 따로 두니 무대 아래에 단추가 둘이 되었다. 판을
        옮기는 방법이 두 가지면 어느 쪽을 봐야 하는지가 흐려진다.

        `goStage` 는 그대로 있으므로 필요하면 다시 달면 된다.
      */}
    </View>
  );
}
