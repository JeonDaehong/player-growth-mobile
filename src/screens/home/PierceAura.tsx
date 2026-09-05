/**
 * ── 꿰뚫는 기운 ── 거대 화살이 지나간 자리에 퍼지는 것.
 *
 * ## 왜 따로 필요했나
 *
 * 거대 화살(`bigshot`)은 **길에 선 적을 전부 꿴다**는 기술인데, 화면에
 * 나오는 것은 화살 한 대와 맞은 놈마다 뜨는 숫자뿐이었다. 그러면 여럿을
 * 친다는 것이 **숫자를 세어야** 읽힌다 — 코스트 12 를 모아 쓰는 궁극기가
 * 평타 한 번과 화면이 같았다.
 *
 * 크게 그리는 것만으로는 안 됐다 (`SkillDef.projMul` 로 몸의 세 배까지
 * 키웠다). 큰 것이 하나 지나가도, 지나간 **자리마다** 무슨 일이 나지 않으면
 * 여전히 "한 놈을 크게 때렸다" 로 보인다. 맞는 놈마다 기운이 터져야
 * "저 줄이 통째로 맞았다" 가 된다.
 *
 * ## 두 조각이다
 *
 *   `PierceAura`  맞는 놈마다 — 고리가 퍼지고 몸을 관통하는 빛줄기가 선다
 *   `PierceBand`  무대를 가로질러 — 화살이 지나간 길에 남는 띠 하나
 *
 * 앞엣것에 `delay` 가 있는 이유가 이 연출의 전부다. **왼쪽부터 차례로**
 * 터뜨리면 기운이 화살을 따라 흘러가는 것으로 보이고, 한꺼번에 터뜨리면
 * 그냥 화면 전체가 한 번 번쩍인다 — 후자는 광역기 아무거나와 구분이 안 된다.
 *
 * ## 흰색이다
 *
 * 우두머리가 퍼뜨리는 것은 붉고(`BossFx` 의 `Burst` — `BAD_C`) 이건 흰색이다.
 * 같은 모양이라도 색이 편을 말한다 — 붉은 고리가 적 줄에서 퍼지면 적이
 * 뭔가를 한 것으로 읽힌다.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { Sprite } from '@/ui/Sprite';
import { WHITE } from '@/ui/theme';

/** 한 자리에서 기운이 퍼졌다 스러지는 데 걸리는 시간 (ms) */
export const PIERCE_MS = 560;

/**
 * 줄 끝까지 번지는 데 쓰는 시간 (ms).
 *
 * 맨 왼쪽과 맨 오른쪽 사이를 이만큼에 걸쳐 나눠 준다 (`pierceDelay`).
 * 화살이 실제로 나는 시간(`flyMsOf`, 최대 260ms)보다 짧게 잡았다 — 이건
 * 화살을 따라가는 것이 아니라 **화살이 지나간 뒤에 번지는 것**이라, 같은
 * 속도로 흐르면 화살에 가려 안 보인다.
 */
export const PIERCE_SWEEP_MS = 180;

/**
 * 이 자리는 몇 ms 뒤에 터지나.
 *
 * @param x    이 놈이 선 가로 자리
 * @param from 제일 왼쪽에 선 놈의 자리 (제일 먼저 맞는다)
 * @param to   제일 오른쪽
 */
export function pierceDelay(x: number, from: number, to: number): number {
  const span = Math.max(1, to - from);
  return Math.round(PIERCE_SWEEP_MS * Math.min(1, Math.max(0, (x - from) / span)));
}

/** 0 → 1 을 한 번 훑고 멈추는 시계. `delay` 만큼 늦게 시작한다 */
function useSweep(delay: number, ms: number): Animated.Value {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(t, {
        toValue: 1, duration: ms, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]);
    a.start();
    /* 멈추면 되돌린다 — `stop()` 은 값을 그 자리에 두고 멈춘다 */
    return () => { a.stop(); t.setValue(0); };
  }, [t, delay, ms]);
  return t;
}

/**
 * 맞는 놈 하나에게 퍼지는 기운.
 *
 * 부르는 쪽이 그 놈의 상자 좌상단에 놓고, 여기서는 그 상자 한가운데를 축으로
 * 그린다. 상자 밖으로 넘치게 그리므로 (`overflow` 를 안 자른다) 자리 위에
 * 얹기만 하면 된다.
 *
 * @param size  맞는 놈의 몸 길이(px) — 고리 크기의 기준
 * @param delay 몇 ms 뒤에 터질까 (`pierceDelay`)
 */
export function PierceAura({ size, delay }: { size: number; delay: number }) {
  const t = useSweep(delay, PIERCE_MS);

  /*
    ── 고리 셋 ──

    `BossFx` 의 `Burst` 와 같은 식이다. 다른 것은 **납작하다**는 것 —
    가로로 퍼지는 기술이라 동그란 고리가 퍼지면 발밑에서 뭔가 솟은 것처럼
    보인다. 세로를 0.55 로 눌러 놓으면 옆으로 밀려 나가는 것으로 읽힌다.
  */
  const rings = useMemo(() => [0, 0.14, 0.28].map((d) => ({
    scale: t.interpolate({
      inputRange: [0, d, 1], outputRange: [0.15, 0.15, 2.6], extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, d, Math.min(1, d + 0.12), Math.min(1, d + 0.55), 1],
      outputRange: [0, 0, 0.9, 0.15, 0],
      extrapolate: 'clamp',
    }),
  })), [t]);

  /*
    ── 관통선 ──

    몸을 가로지르는 빛줄기 하나. 고리만으로는 "여기서 뭔가 터졌다" 이고,
    이 한 줄이 있어야 **뚫고 지나갔다**가 된다.

    가로로만 늘어난다 (`scaleX`). 세로까지 늘리면 빛이 부푸는 것이라
    폭발이 되고, 이 기술은 터지는 것이 아니라 지나가는 것이다.
  */
  const beamX = useMemo(() => t.interpolate({
    inputRange: [0, 0.18, 1], outputRange: [0.2, 1, 1.6], extrapolate: 'clamp',
  }), [t]);
  const beamFade = useMemo(() => t.interpolate({
    inputRange: [0, 0.1, 0.42, 1], outputRange: [0, 1, 0.5, 0], extrapolate: 'clamp',
  }), [t]);

  /* 몸이 한 번 하얗게 뜬다 — 맞는 순간이 어느 놈인지 이 한 칸이 말한다 */
  const flash = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.3, 1], outputRange: [0, 0.5, 0.12, 0], extrapolate: 'clamp',
  }), [t]);

  const ring = size * 1.6;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 0, top: 0, width: size, height: size,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          backgroundColor: WHITE,
          opacity: flash,
        }}
      />
      {rings.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: size / 2 - ring / 2,
            top: size / 2 - (ring * 0.55) / 2,
            width: ring,
            height: ring * 0.55,
            borderRadius: ring,
            borderWidth: 2,
            borderColor: WHITE,
            opacity: r.fade,
            transform: [{ scale: r.scale }],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: 'absolute',
          left: -size * 0.6,
          top: size * 0.46,
          width: size * 2.2,
          height: Math.max(2, Math.round(size * 0.06)),
          backgroundColor: WHITE,
          opacity: beamFade,
          transform: [{ scaleX: beamX }],
        }}
      />
    </View>
  );
}

/**
 * 무대를 가로지르는 띠 하나 — 화살이 지나간 길.
 *
 * 자리마다 터지는 고리(`PierceAura`)가 "누가 맞았나" 를 말한다면, 이건
 * **어디를 지나갔나**를 말한다. 둘 중 하나만 있으면 각각 "여럿이 맞았다" 와
 * "뭔가 지나갔다" 로 끝나고, 둘이 같이 있어야 "지나가면서 저것들을 꿰었다"
 * 가 된다.
 *
 * 무대 폭을 다 쓰지만 **아주 얇고 금방 스러진다.** 화면을 덮는 연출은 안
 * 쓴다는 이 게임의 규칙이 여기서도 산다 — 두꺼우면 적이 통째로 가려진다.
 *
 * @param w 무대 폭
 * @param y 띠가 설 높이 (무대 위쪽 기준)
 * @param h 띠 두께의 기준이 되는 몸 길이
 */
export function PierceBand({ w, y, h }: { w: number; y: number; h: number }) {
  const t = useSweep(0, PIERCE_MS);

  /* 왼쪽에서 오른쪽으로 늘어난다 — 화살이 가는 쪽이다 */
  const stretch = useMemo(() => t.interpolate({
    inputRange: [0, 0.3, 1], outputRange: [0.05, 1, 1], extrapolate: 'clamp',
  }), [t]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.12, 0.4, 1], outputRange: [0, 0.75, 0.3, 0], extrapolate: 'clamp',
  }), [t]);
  /* 두께가 줄면서 스러진다 — 그냥 흐려지기만 하면 안개처럼 보인다 */
  const thin = useMemo(() => t.interpolate({
    inputRange: [0, 0.25, 1], outputRange: [0.4, 1, 0.15], extrapolate: 'clamp',
  }), [t]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: y,
        width: w,
        height: Math.max(2, Math.round(h * 0.08)),
        backgroundColor: WHITE,
        opacity: fade,
        zIndex: 45,
        transform: [{ translateX: -w / 2 }, { scaleX: stretch }, { translateX: w / 2 },
          { scaleY: thin }],
      }}
    />
  );
}

/**
 * 거대 화살이 **무대를 가로지르는** 데 걸리는 시간 (ms).
 *
 * ## 왜 몸에서 안 그리나
 *
 * 다른 날아가는 것들은 인물 안에서 그린다 (`SwordWave`) — 그 사람이 선
 * 자리에서 나가야 검과 따로 놀지 않기 때문이다. 그 대신 **날아가는 높이가
 * 검끝 높이로 묶이고**, 거리도 노린 놈까지다.
 *
 * 거대 화살은 그 둘이 다 안 맞았다. 화살은 리안느 어깨 높이에서 나가 제일
 * 가까운 놈 앞에서 멎었고, 길에 선 것을 전부 꿴다는 기술인데 화면에서는
 * **줄의 앞부분만 지나갔다.** 크기를 세 배로 키워도(`SkillDef.projMul`)
 * 지나간 거리가 짧으면 "가로질렀다" 가 안 된다.
 *
 * 그래서 이것만 **무대가 직접 그린다.** 무대 왼쪽 밖에서 들어와 오른쪽 밖으로
 * 나가고, 높이는 화면 한가운데다 — 인물 위치와 상관없는 한 줄이라 어느
 * 대형에서 쏘든 같은 길을 지난다.
 *
 * 460ms 다. 화살 한 대가 가는 시간(`SwordWave` 의 `WAVE_MAX_MS` — 260ms)보다
 * 길게 잡았다. 저건 눈으로 좇을 필요가 없는 물건이지만 이건 **좇으라고**
 * 그리는 것이라, 화면 폭을 지나가는 것이 눈에 남아야 한다.
 */
export const CROSS_MS = 460;

/**
 * 무대 가로 자리 `x` 를 화살촉이 지나가는 시각 (ms).
 *
 * @param from 화살촉이 출발하는 자리 — **쏘는 사람의 활** (`GiantArrow` 의 `from`)
 * @param to   화살촉이 도착하는 자리 — 무대 오른쪽 밖
 *
 * 맞는 놈마다 터지는 고리가 이 시각에 맞춰 열려야 (`PierceAura` 의 `delay`)
 * 기운이 **화살을 따라** 번지는 것으로 보인다 — 한꺼번에 터뜨리면 그냥
 * 화면이 한 번 번쩍인다.
 */
export function crossDelay(x: number, from: number, to: number): number {
  const span = Math.max(1, to - from);
  return Math.round(CROSS_MS * Math.min(1, Math.max(0, (x - from) / span)));
}

/**
 * ── 무대를 가로지르는 거대 화살 ──
 *
 * 한 장을 등속으로 민다. `SwordWave` 와 같은 태도다 — 시트에 세 칸이 있지만
 * 40px 로 줄여 지나가면 프레임이 안 읽히고, 이 크기에서는 **한 장을 잘
 * 움직이는 쪽**이 낫다.
 *
 * @param y  화살촉이 지나가는 높이 (무대 좌표). 상자를 이 줄에 **가운데로**
 *           맞춘다 — `Sprite` 가 정사각 상자에 비율을 지켜 넣으므로
 *           (`contain`) 그림은 상자 한가운데에 놓인다
 */
export function GiantArrow({ set, name, size, from, to, y }: {
  set: string;
  name: string;
  /** 몇 px 짜리로 그릴까 — 몸의 세 배다 (`SkillDef.projMul`) */
  size: number;
  /**
   * 화살촉이 출발하는 무대 자리 — **쏘는 사람의 활 끝**이다.
   *
   * 무대 왼쪽 밖(0)에서 시작했었다. "가로지른다" 는 그걸로 되지만, 화살이
   * 리안느와 아무 상관 없는 데서 튀어나와 **누가 쐈는지가 화면에 없었다.**
   * 쏘는 동작과 나가는 자리가 이어져야 한 사람이 한 일로 보인다.
   */
  from: number;
  /** 화살촉이 도착하는 자리 — 무대 오른쪽 밖 */
  to: number;
  y: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    t.setValue(0);
    const a = Animated.timing(t, {
      toValue: 1,
      duration: CROSS_MS,
      /* 날아가는 물체는 등속이다 (`SwordWave` 에 같은 이야기가 있다) */
      easing: Easing.linear,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [t]);

  /*
    촉이 활 끝에 선 데서 시작해 오른쪽 밖으로 나간다.

    상자는 정사각이고 그림이 그 안에 가로로 꽉 차므로 (`contain`), **촉은
    상자의 오른쪽 끝**이다 — 그래서 상자를 `size` 만큼 왼쪽으로 물려 놓아야
    촉이 `from` 에 선다.
  */
  const fly = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [from - size, to - size],
  }), [t, size, from, to]);
  /*
    **나갈 때만 스러진다.**

    가는 도중에 옅어지면 무대 한가운데에서 증발한 것으로 보인다. 마지막
    한 뼘에서만 꺼진다 — 그 구간은 이미 화면 밖이라 "지나갔다" 로 읽힌다.
  */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.86, 1], outputRange: [1, 1, 0],
  }), [t]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: Math.round(y - size / 2),
        width: size,
        height: size,
        /* 맞는 놈마다 터지는 고리(46)보다 위 — 지나가는 것이 앞장서야 한다 */
        zIndex: 47,
        opacity: fade,
        transform: [{ translateX: fly }],
      }}
    >
      {/*
        ── 이 그림만 뒤집는다 ──

        `elfarcher_dragon` 시트가 **촉이 왼쪽을 보고** 들어왔다. 평소 화살
        (`elfarcher_shot`)은 오른쪽을 보고 있어서 `SwordWave` 는 원거리
        것을 안 뒤집는데, 이 한 장만 반대다.

        여기서 뒤집는 이유는 이 부품이 **거대 화살 하나만** 그리기 때문이다
        (`SkillDef.projMul >= 2`). 시트를 다시 자르거나 `SwordWave` 의
        규칙을 건드리면 평타 화살과 검기까지 같이 돌아눕는다.
      */}
      <Sprite set={set} name={name} size={size} flip />
    </Animated.View>
  );
}
