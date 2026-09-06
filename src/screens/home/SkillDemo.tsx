/**
 * ── 이 기술이 화면에서 어떻게 생겼나 ── 캐릭터 창의 **예시 한 판.**
 *
 * ## 왜 필요한가
 *
 * 기술을 펴면 수치가 열 줄 나온다 (`SkillPanel`) — 코스트 12, 공격력의
 * 300%, 무작위 1마리, 한 대 428. 다 맞는 말인데 그 열 줄 어디에도 **이
 * 기술이 무엇처럼 보이는지**가 없다. 스킬 트리에서 갈래를 고를 때 실제로
 * 알고 싶은 것 중 하나가 그거다 — 성검 발현과 수호신의 가호 중 어느 쪽을
 * 찍을지는 숫자만으로 안 갈린다.
 *
 * 전투에서 보면 되지 않느냐 하면, 코스트 12짜리는 한 판에 두세 번 나가고
 * 그마저 네 명이 동시에 싸우는 화면 한구석에서 0.5초 만에 지나간다.
 *
 * ## 무대를 통째로 안 가져온다
 *
 * `BattleView` 를 줄여 넣는 방법도 있었는데, 저건 스테이지 · 적 목록 · 틱 ·
 * 상태 · 대형을 다 물고 있는 화면이라 창 안에 넣을 물건이 아니다. 여기는
 * **아무것도 계산하지 않는다** — 피해도 안 들어가고 적도 안 죽는다.
 * 인물 둘과 이펙트를 박자에 맞춰 켜고 끄는 것이 전부다.
 *
 * 그래서 이름이 시연이다. 화면에 뜨는 숫자도 옆 줄에 이미 적혀 있는
 * "한 대" 를 그대로 받아 쓴다 (`hit`) — 여기서 따로 세면 같은 창 안에서
 * 두 숫자가 갈린다.
 *
 * ## 무대가 하는 일까지 여기서 한다
 *
 * 전투에서는 일부러 **인물 밖에서** 그리는 것이 셋 있다.
 *
 *   뛰어들기   `Fighter` 는 몸짓만 하고, 얼마나 뛸지는 무대가 잰다 (`leapTo`)
 *   거대 화살  `SwordWave` 가 스스로 물러난다 (`projMul >= 2` 면 `null`) —
 *              몸에 묶이면 어깨 높이로 나가 제일 가까운 놈 앞에서 멎기 때문에,
 *              무대가 `GiantArrow` 로 따로 그린다
 *   머리 위 글 걸린 것이 무엇인지는 상태(`BattleState.hex`)가 알고, 그건
 *              전투가 도는 동안에만 있다
 *
 * 셋 다 여기서 흉내 낸다. 안 하면 시연이 **그 기술의 알맹이를 빼놓고** 보여
 * 준다 — 강타는 제자리에서 도끼만 휘두르고, 거대 화살은 아무것도 안 나가고,
 * 버프 기술은 아무 일도 안 일어난다.
 *
 * ## 박자는 전투 것을 그대로 쓴다
 *
 * `Fighter` 의 `SK_MS` 와 `landAtOf`, `skFramesOf` 를 그대로 부른다. 여기에
 * 숫자를 새로 두면 창에서 본 동작과 실제로 나가는 동작이 갈리는데, 그러면
 * 이 시연이 하려던 일이 통째로 없어진다.
 *
 * ## 쉬지 않고 돈다
 *
 * 한 번만 보여 주고 멈추면 0.5초짜리 동작을 놓친 사람은 창을 닫았다 다시
 * 열어야 한다. `LOOP_MS` 마다 다시 돈다 — 펴 놓은 동안만이라 (`SkillPanel`
 * 이 접으면 이 컴포넌트가 통째로 사라지고 시계도 같이 걷힌다) 배경에서
 * 도는 시계가 쌓일 일은 없다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import {
  CHARS, OwnedChar, SkillDef, blowOf, projFrame, projSet,
} from '@/core/chars';
import { GOOD, STATUS_WHAT, StatusId } from '@/core/status';
import { Sprite } from '@/ui/Sprite';
import { T } from '@/ui/atoms';
import { BORDER, LINE, R, SP, SURF } from '@/ui/theme';
import {
  CUT_FALLBACK, SK_FALLBACK, SK_MS, landAtOf, skFramesOf,
} from './Fighter';
import { HolySword, SWORD_HIT, SWORD_MS, SkillFx } from './SkillFx';
import { SkillAura } from './SkillAura';
import { SwordWave } from './SwordWave';
import { GiantArrow, PierceAura } from './PierceAura';
import {
  DamageNumber, FallingArrow, HealMarks, HitBurst, StatusNote,
} from './HitFx';

/** 한 바퀴 (ms). 동작이 0.5초라 나머지는 **보고 나서 숨 돌리는 시간**이다 */
const LOOP_MS = 2600;
/** 한 바퀴 안에서 기술이 시작하는 시각 — 앞의 여백이 "가만히 서 있다" 를 만든다 */
const START = 500;

/**
 * 시연 무대의 높이 (px).
 *
 * 인물 키(62)의 두 배 반이다. 무대(423px)만큼 여유를 줄 수는 없지만, 이
 * 정도는 있어야 **하늘에서 내려오는 것**이 내려오는 동안 보이고 **뛰어오른
 * 사람**이 천장에 안 닿는다.
 */
const H = 156;
/** 바닥선이 상자 밑에서 얼마나 떠 있나 */
const FLOOR = 12;
/** 쓰는 사람의 몸 길이 */
const ME_W = 62;
/** 맞는 사람의 몸 길이 — 잡몹이라 조금 작다 (무대에서도 그렇다) */
const FOE_W = 52;
/** 좌우 여백 */
const PAD = 16;
/**
 * 둘 사이 거리 (px).
 *
 * 상자 폭은 창에 따라 달라지는데 (`Popup` 안이다) 날아가는 것은 **못 박힌
 * 거리**를 받는다 (`SwordWave` 의 `dist`). 재서 넘기려면 `onLayout` 이
 * 필요하고, 그러면 첫 바퀴는 폭이 0 이라 검기가 제자리에서 사라진다.
 *
 * 좁은 폰(320px)에서도 상자 안에 들어가는 값으로 못 박는다. 넓은 화면에서는
 * 오른쪽이 조금 남는데, 둘이 붙어 서 있는 편이 멀리 떨어져 있는 것보다 이
 * 크기에서 잘 읽힌다.
 */
const SPAN = 150;

/**
 * 시연에 세우는 적.
 *
 * **판과 무관하게 늘 같은 놈**이다. 지금 몇 판인지에 따라 바뀌게 두면 같은
 * 기술을 30판에서 보면 다른 그림이 되는데, 여기는 "이 기술이 어떻게
 * 생겼나" 를 보는 자리지 "지금 누구와 싸우나" 를 보는 자리가 아니다.
 *
 * 제일 처음 만나는 놈으로 둔다 — 누구나 본 적이 있는 몸이라 크기를 가늠할
 * 자가 된다.
 */
const DUMMY = { set: 'cr_slime', name: 'idle' } as const;

/**
 * 성검을 그릴 때 넘기는 몸 길이.
 *
 * `HolySword` 는 받은 길이의 **3.4배**로 검을 그린다 (그쪽 머리말). 적
 * 몸(52)을 그대로 넘기면 177px 짜리 검이 되어 156px 상자를 통째로 넘는다.
 *
 * 무대에서의 비율을 맞춘다 — 저기서는 검이 무대 높이의 0.6배쯤이다
 * (73 × 3.4 = 248, 무대 423). 여기서 같은 비율이면 94 이므로 28 을 넘긴다.
 *
 * 검은 **받은 길이의 상자 안에서 가운데 정렬**을 하므로 (`left`), 적 몸이
 * 아니라 이 길이짜리 상자를 따로 만들어 그 안에 넣는다 — 적 몸을 그대로
 * 넘기면서 길이만 줄이면 검이 왼쪽으로 치우친다.
 */
const SWORD_W = 28;

/**
 * 뛰어드는 기술이 **얼마나 솟나** (px).
 *
 * 무대에서는 인물 키만큼 뛴다 (`Fighter` 의 `LEAP_UP` — 54 × ZOOM = 76,
 * 인물이 76px). 여기 상자가 156px 이고 바닥이 12px 떠 있어서 그 비율대로
 * 뛰면 머리가 천장을 뚫는다. 몸의 절반이면 상자 안에 남으면서도 "땅을 차고
 * 올랐다" 가 읽힌다.
 */
const LEAP_UP = Math.round(ME_W * 0.5);

/** 매 렌더마다 새로 만들면 숫자가 되감긴다 (`HitFx` 참고) */
const NOOP = () => {};

/** 머리 위에 뜰 한 줄 */
interface Note {
  text: string;
  good: boolean;
}

/**
 * 이 기술이 **누구에게 무엇을 거나** — 머리 위에 뜰 글들.
 *
 * ## 왜 표를 다시 안 만드나
 *
 * 낱말은 `core/status` 의 `STATUS_WHAT` 하나에서만 나온다. 전투 중에 실제로
 * 뜨는 것과 같은 글이어야 하기 때문이다 — 여기서 따로 적으면 시연에서 본
 * 문구와 판에서 보는 문구가 갈리고, 그러면 시연이 거짓말이 된다.
 *
 * 좋은지 나쁜지도 마찬가지다 (`GOOD`). 색이 그것 하나로 갈리므로
 * (`StatusNote`) 두 벌로 세면 초록이어야 할 것이 붉게 뜬다.
 *
 * ## 보호막만 낱말이 따로다
 *
 * 보호막은 걸리는 것(`Hex`)이 아니라 따로 세는 체력 주머니라
 * (`BattleState.ward`) `STATUS_WHAT` 에 줄이 없다. 전투에서도 `marksOf` 가
 * 그 자리에서 글자를 박아 넣으므로 (`피해 흡수`), 여기서도 같은 낱말을 쓴다.
 */
function notesOf(sk: SkillDef): { mine: Note[]; theirs: Note[] } {
  const mine: Note[] = [];
  const theirs: Note[] = [];
  const put = (into: Note[], id: StatusId) => {
    const text = STATUS_WHAT[id];
    /* 말 안 하는 것이 있다 (`st_fey`) — 로고만 뜬다 */
    if (text) into.push({ text, good: GOOD.has(id) });
  };

  /* ── 제 몸에 ── */
  if (sk.self) put(mine, sk.self.id);
  for (const m of sk.selfAlso ?? []) put(mine, m.id);
  /* ── 파티에 ── 시연에는 한 사람뿐이라 그 사람 머리 위에 뜬다 */
  if (sk.party) put(mine, sk.party.id);
  for (const m of sk.partyAlso ?? []) put(mine, m.id);
  if (sk.partyProc) put(mine, sk.partyProc.id);
  if (sk.cleanseGift) put(mine, sk.cleanseGift.id);
  if (sk.ward) mine.push({ text: '피해 흡수', good: true });

  /* ── 맞는 놈에게 ── */
  if (sk.taunt) put(theirs, 'st_taunt');
  if (sk.foeHex) put(theirs, sk.foeHex.id);
  if (sk.foeHex2) put(theirs, sk.foeHex2.id);
  if (sk.foeDot) put(theirs, sk.foeDot.id);

  /*
    둘까지만 띄운다 — 전투와 같은 규칙이다 (`HitFx` 의 `MarkNotes` 가
    `slice(-2)` 한다). 셋을 쌓으면 이 작은 상자에서 인물 키만큼 올라간다.
  */
  return { mine: mine.slice(0, 2), theirs: theirs.slice(0, 2) };
}

export function SkillDemo({
  c, sk, hit,
}: {
  c: OwnedChar;
  sk: SkillDef;
  /**
   * 머리 위에 띄울 숫자 — **옆 줄에 이미 적힌 "한 대"** 를 그대로 받는다
   * (`SkillPanel`). 여기서 따로 세면 같은 창 안에서 두 숫자가 갈린다.
   */
  hit: number;
}) {
  /** 지금 몸이 어느 칸인가. `null` 이면 쉬는 자세 */
  const [frame, setFrame] = useState<string | null>(null);
  /*
    이펙트마다 제 시계 — 값이 오를 때마다 한 번 돈다.

    하나로 묶을 수가 없다. 저마다 다른 순간에 켜지고 (몸짓이 시작할 때 ·
    베는 칸에서 · 닿는 칸에서 · 검이 꽂힐 때), 같은 값을 보게 하면 다
    한꺼번에 튄다.
  */
  const [cast, setCast] = useState(0);
  const [fly, setFly] = useState(0);
  const [land, setLand] = useState(0);
  const [drop, setDrop] = useState(0);
  const [heal, setHeal] = useState(0);
  /*
    한 바퀴에 걸어 두는 시계들.

    갈래의 정리 함수에서 한꺼번에 끈다. 한 자리에 하나만 두면 안 된다 —
    한 바퀴에 여섯 개가 동시에 걸려 있다.
  */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /* 뛰어들기 — 가로와 세로가 **따로** 돈다 (`Fighter` 와 같은 이유) */
  const leapX = useRef(new Animated.Value(0)).current;
  const leapY = useRef(new Animated.Value(0)).current;

  const frames = skFramesOf(c.id, sk);
  /* 때리는 기술인가 — 적 쪽에 그릴 것이 있나 */
  const hurts = sk.pick !== 'none' && sk.heal <= 0;
  /*
    ── 몸에서 뭔가 날아가나 ── 검기 · 화살 (`SkillDef.flies`).

    **활잡이라고 다 날아가는 것이 아니다.** `range === 'ranged'` 는 평타가
    날아간다는 뜻이고 (`Fighter` 의 `shooting`), 기술은 제 깃발을 따로
    가진다. 여기서 둘을 합치면 아녜스의 기도가 슬라임에게 날아간다.
  */
  const flies = sk.flies;
  /*
    ── 아주 큰 것은 **무대가 그린다** ── (`SwordWave` 의 `mul >= 2` 갈래)

    거대 화살 하나다. `SwordWave` 는 저 크기를 만나면 스스로 `null` 을
    돌려주므로 (몸에 묶이면 어깨 높이로 나가 코앞에서 멎는다), 여기서도
    무대가 하는 것과 같이 `GiantArrow` 로 따로 그려야 한다 — 안 그리면
    **아무것도 안 나간다.**
  */
  const giant = flies && (sk.projMul ?? 1) >= 2;
  /*
    ── 위에서 떨어지는 화살 ── 리안느의 화살비.

    날아가지 않는 원거리 기술이 그렇다 (`BattleView` 의 `h.arrow` 와 같은
    조건). 이걸 안 그리면 화살비 시연이 "가만히 서 있다가 적이 터진다" 가
    된다 — 이 기술의 내용이 통째로 빠진다.
  */
  const rains = hurts && CHARS[c.id].range === 'ranged' && !sk.flies;
  const notes = useMemo(() => notesOf(sk), [sk]);

  /* 뛰어드는 거리 — 적 앞에서 멎는다 (몸이 겹치면 누가 누군지 안 보인다) */
  const leapTo = SPAN - FOE_W * 0.5;
  const leapDX = useMemo(() => leapX.interpolate({
    inputRange: [0, 1], outputRange: [0, leapTo],
  }), [leapX, leapTo]);
  const leapDY = useMemo(() => leapY.interpolate({
    inputRange: [0, 1], outputRange: [0, -LEAP_UP],
  }), [leapY]);

  useEffect(() => {
    const beats = sk.beat ?? SK_MS;
    const list = skFramesOf(c.id, sk);
    const landAt = START + landAtOf(beats, sk.landOn);
    const at = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };

    const beat = () => {
      at(START, () => { setFrame(list[0]); setCast((n) => n + 1); });
      at(START + beats[0], () => {
        setFrame(list[1]);
        /* 검기는 **베는 칸이 시작할 때** 떠난다 (`Fighter` 의 `WAVE_AT`) */
        if (sk.flies) setFly((n) => n + 1);
      });
      at(START + beats[0] + beats[1], () => setFrame(list[2]));
      /* 닿는 칸 — 기술마다 다르다 (`SkillDef.landOn`) */
      at(landAt, () => {
        if (sk.heal > 0) { setHeal((n) => n + 1); return; }
        /* 하늘에서 내려오는 것은 여기서 **부르기만** 한다 */
        if (sk.drop === 'sword') { setDrop((n) => n + 1); return; }
        setLand((n) => n + 1);
      });
      /* 그리고 **꽂힐 때** 맞는다 (`SkillFx` 의 `SWORD_HIT`) — 무대와 같은 규칙 */
      if (sk.drop === 'sword') {
        at(landAt + Math.round(SWORD_MS * SWORD_HIT), () => setLand((n) => n + 1));
      }
      at(START + beats[0] + beats[1] + beats[2], () => setFrame(null));

      /*
        ── 뛰어드는 기술은 **적 쪽으로 크게 나갔다** 돌아온다 ──

        `Fighter` 의 그것을 그대로 옮겼다. 그림 안에서 점프는 이미 보이지만
        제자리에서 뛰면 "적진으로 뛰어들었다" 가 아니라 "제자리 점프" 다 —
        화면에서 실제로 거리를 좁혀야 한다.

        가로는 솟는 동안에 거리를 다 끝내고, 세로는 올라갔다 곧게 가속하며
        떨어진다. 둘을 한 값으로 굴리면 포물선이 되는데, 내리찍는 기술은
        ㄱ 자로 떨어져야 "쾅" 이 된다.
      */
      if (sk.leaps) {
        at(START, () => {
          Animated.sequence([
            Animated.timing(leapX, {
              toValue: 1,
              duration: beats[0],
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            /* 착지한 자리에 머문다 — 바로 돌아오면 폭발을 볼 새가 없다 */
            Animated.delay(beats[1] + beats[2] + 260),
            Animated.timing(leapX, {
              toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true,
            }),
          ]).start();
          Animated.sequence([
            Animated.timing(leapY, {
              toValue: 1, duration: beats[0], easing: Easing.out(Easing.quad), useNativeDriver: true,
            }),
            Animated.timing(leapY, {
              toValue: 0,
              duration: beats[1],
              /* 떨어질수록 빨라진다 — 이게 "쾅" 을 만든다 */
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    };

    beat();
    const loop = setInterval(beat, LOOP_MS);
    return () => {
      clearInterval(loop);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      leapX.stopAnimation(() => leapX.setValue(0));
      leapY.stopAnimation(() => leapY.setValue(0));
      setFrame(null);
    };
    /*
      기술이 바뀌면 처음부터 다시 돈다. `sk` 자체를 걸면 매 렌더마다 새
      객체라 갈래가 끝없이 돌므로 (`skillsFor` 가 배열을 새로 만든다)
      이름을 열쇠로 쓴다 — 한 사람 안에서 기술 이름은 안 겹친다.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, sk.name]);

  const foeLeft = PAD + ME_W + SPAN - FOE_W;
  /* 인물의 가슴 높이 — 거대 화살이 이 줄로 지나간다 (`GiantArrow` 의 `y`) */
  const chestY = H - FLOOR - ME_W + Math.round(ME_W * 0.33);

  return (
    <View style={{ marginBottom: SP.sm }}>
      <View
        style={[
          BORDER,
          {
            height: H,
            borderRadius: R.md,
            backgroundColor: SURF.down,
            /*
              **넘치는 것은 자른다.** 성검은 몸의 세 배가 넘고 (`SkillFx` 의
              `HolySword`) 거대 화살은 무대 밖까지 나간다 — 창 안에서 그것이
              상자 밖으로 새면 아래 수치 줄 위에 검이 걸린다.
            */
            overflow: 'hidden',
          },
        ]}
      >
        {/* 바닥선 — 둘이 같은 땅을 밟고 있다는 것만 말한다 */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: FLOOR,
            height: 1,
            backgroundColor: LINE.low,
          }}
        />

        {/* ── 쓰는 사람 ── */}
        <Animated.View
          style={{
            position: 'absolute',
            left: PAD,
            bottom: FLOOR,
            width: ME_W,
            height: ME_W,
            /* 뛰어드는 기술만 움직인다 — 아니면 둘 다 0 이라 없는 것과 같다 */
            transform: [{ translateX: leapDX }, { translateY: leapDY }],
          }}
        >
          {/*
            발밑 고리 — 기술 동작의 **앞 두 칸에서만** 켠다 (`Fighter` 와
            같은 규칙). 마지막 칸까지 켜 두면 다 끝난 뒤에도 발밑이 빛난다.
          */}
          <SkillAura
            on={frame !== null && sk.aura !== 'none' && frame !== frames[2]}
            kind={sk.aura === 'rune' ? 'rune' : 'ring'}
            size={ME_W}
          />
          <Sprite
            set={c.id}
            name={frame ?? 'guard'}
            size={ME_W}
            fallbackSet="duel"
            fallbackName={
              frame ? (SK_FALLBACK[frame] ?? CUT_FALLBACK[frame] ?? frame) : 'guard'
            }
          />
          {/*
            쓰는 사람 자리에서 도는 것 — 포효 · 광란 · 정화.

            불기둥(`erupt`)만 빼놓는다. 저건 **맞는 놈 발밑**에서 솟는
            것이라 아래 적 쪽에서 그린다.
          */}
          {sk.cast !== 'erupt' && (
            <SkillFx kind={sk.cast} nonce={cast} size={ME_W} />
          )}
          {sk.heal > 0 && <HealMarks nonce={heal} size={ME_W} />}
          {/*
            날아가는 것 — 검기와 화살. 몸에서 나가 적 앞에서 멎는다.

            거대 화살은 여기서 안 그린다 (`giant`) — `SwordWave` 가 저
            크기를 스스로 물리므로 그려도 아무것도 안 나온다.
          */}
          {flies && !giant && (
            <SwordWave
              charId={c.id}
              nonce={fly}
              size={ME_W}
              dist={SPAN}
              proj={sk.proj}
              mul={sk.projMul}
            />
          )}
          {/*
            ── 제 몸과 파티에 걸리는 것 ── 머리 위 한 줄.

            시연에는 한 사람뿐이므로 파티 전체에 거는 것도 이 사람 머리 위에
            뜬다. 낱말과 색은 전투와 **같은 표**에서 나온다 (`notesOf`).

            `key` 에 시계를 물린다 — `StatusNote` 는 붙는 순간 한 번 돌고
            마는 부품이라, 같은 것을 두면 두 바퀴째에 다시 안 뜬다.
          */}
          {land > 0 && notes.mine.map((n, i) => (
            <StatusNote
              key={`${n.text}${land}`}
              text={n.text}
              good={n.good}
              i={notes.mine.length - 1 - i}
            />
          ))}
        </Animated.View>

        {/*
          ── 거대 화살 ── 무대를 가로지른다 (`PierceAura` 의 `GiantArrow`).

          인물 상자 **밖**이다. 저 부품은 제 부모의 왼쪽 끝(0)을 기준으로
          날아가므로 (`left: 0` + `translateX`), 인물 안에 넣으면 인물이
          움직이는 만큼 같이 끌려간다.

          `key` 로 다시 태운다 — 저 부품은 `nonce` 를 안 받고 **붙는 순간**
          한 번 돈다.
        */}
        {giant && fly > 0 && (
          <GiantArrow
            key={fly}
            set={sk.proj || projSet(c.id)}
            name={projFrame(c.id)}
            size={Math.round(ME_W * (sk.projMul ?? 1))}
            /* 활 끝에서 나가 오른쪽 밖으로 */
            from={PAD + ME_W}
            to={foeLeft + FOE_W + PAD * 3}
            y={chestY}
          />
        )}

        {/* ── 맞는 사람 ── */}
        <View
          style={{
            position: 'absolute',
            left: foeLeft,
            bottom: FLOOR,
            width: FOE_W,
            height: FOE_W,
          }}
        >
          <Sprite set={DUMMY.set} name={DUMMY.name} size={FOE_W} />
          {/* 발밑에서 솟는 것 — 화산 하나다 */}
          {sk.cast === 'erupt' && <SkillFx kind="erupt" nonce={cast} size={FOE_W} />}
          {/* 하늘에서 내려오는 것 — 성검 하나다 (`SWORD_W` 참고) */}
          {sk.drop === 'sword' && (
            <View
              style={{
                position: 'absolute',
                left: Math.round((FOE_W - SWORD_W) / 2),
                /* 이 상자의 밑이 곧 적의 발이다 — 칼끝이 거기 박힌다 */
                bottom: 0,
                width: SWORD_W,
                height: SWORD_W,
              }}
            >
              <HolySword nonce={drop} size={SWORD_W} />
            </View>
          )}
          {hurts && land > 0 && (
            <>
              {/* 꿰뚫린 자리에서 퍼지는 기운 — 거대 화살에만 붙는다 */}
              {giant && (
                /* 상자가 아니라 **열쇠만** 필요하다 — 저 부품은 스스로 절대 배치다 */
                <React.Fragment key={`aura${land}`}>
                  <PierceAura size={FOE_W} delay={0} />
                </React.Fragment>
              )}
              <View style={{ position: 'absolute', left: FOE_W * 0.2, top: FOE_W * 0.3 }}>
                <HitBurst
                  kind={sk.fx ?? CHARS[c.id].fx}
                  size={FOE_W * 0.75}
                  nonce={land}
                />
              </View>
              {/*
                떨어지는 화살은 **가슴 높이**에 꽂는다 — 무대와 같은 값이다
                (`BattleView`). 여기서 잡는 자리는 촉이 꽂힐 점이고, 그림이
                어디에 걸리는지는 `FallingArrow` 가 맞춘다.
              */}
              {rains && (
                <View
                  key={`arrow${land}`}
                  style={{ position: 'absolute', left: FOE_W * 0.5, top: FOE_W * 0.45 }}
                >
                  <FallingArrow
                    set={projSet(c.id)}
                    name={projFrame(c.id)}
                    size={FOE_W * 0.9}
                  />
                </View>
              )}
              {/*
                `key` 에 시계를 물린다 — 숫자는 한 번 뜨고 마는 부품이라
                (`DamageNumber`), 같은 것을 두면 두 바퀴째에 다시 안 뜬다.
              */}
              <View
                key={land}
                style={{
                  position: 'absolute', left: 0, right: 0, top: -13, alignItems: 'center',
                }}
              >
                <DamageNumber text={`-${hit}`} dx={0} dy={0} onDone={NOOP} />
              </View>
            </>
          )}
          {/* ── 맞는 놈에게 걸리는 것 ── 도발 · 시듦 · 지옥불 */}
          {land > 0 && notes.theirs.map((n, i) => (
            <StatusNote
              key={`${n.text}${land}`}
              text={n.text}
              good={n.good}
              i={notes.theirs.length - 1 - i}
            />
          ))}
        </View>
      </View>
      <T size={9} dim="dim" style={{ marginTop: 3 }}>
        {`예시입니다 — 실제로는 ${
          sk.pick === 'none' ? '아군 전체' : '그때 서 있는 적들'
        }에게 걸리고, 숫자는 위의 "한 대" 와 같은 값입니다 (${
          blowOf(c.id, sk).pierce.phys || blowOf(c.id, sk).pierce.magic
            ? '관통이라 상대 방어를 안 탑니다'
            : '실제로는 상대 방어만큼 더 깎입니다'
        }).`}
      </T>
    </View>
  );
}
