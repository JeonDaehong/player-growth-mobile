/**
 * 두 번째 기술 넷의 **큰 연출** — 그림 없이 도형으로만.
 *
 * ## 왜 시트를 안 받나
 *
 * 넷 중 셋이 **아무도 안 때린다** (도발 · 광란 · 정화). 때리는 기술은 맞은
 * 자리에서 불꽃이 터지고 숫자가 뜨므로 화면이 알아서 설명되는데, 이쪽은 몸짓
 * 말고는 아무 일도 안 일어난다 — 코스트 20 을 모아 쓴 정화가 화면에서는
 * "잠깐 무릎 꿇었다" 로 끝난다.
 *
 * 그래서 연출이 필요한데, **1-bit 흑백에서 이런 종류는 시트로 받으면 안
 * 된다.** 퍼지는 소리도, 잔상도, 솟는 불기둥도 전부 "반투명하게 옅어지는 것"
 * 이 본질인데 2색에는 옅음이 없다. 시트로 받으면 흰 얼룩 몇 장이 되고, 실제로
 * 타격 이펙트(`fx/`)에서 그 한계를 이미 겪었다 — 저건 **한 번 터지고 마는**
 * 것이라 다섯 장으로 되지만, 이건 몇 백 ms 동안 자라거나 흘러야 한다.
 *
 * 도형은 **불투명도와 크기를 연속으로** 바꿀 수 있다. 그게 시트가 못 하는
 * 유일한 것이고, 마침 이 넷에 필요한 전부다.
 *
 * ## 넷이 서로 안 닮아야 한다
 *
 *   roar     밖으로 퍼지는 고리 셋      — 옆으로 자란다
 *   haste    뒤로 흐르는 빗금 넷        — 옆으로 흐른다
 *   cleanse  위로 떠오르는 조각 다섯    — 위로 간다
 *   erupt    아래서 위로 솟는 기둥 셋   — 아래서 위로 간다
 *
 * 방향이 넷 다 다르다. 54px 짜리 인물 위에서 색도 모양도 못 쓰므로, **어느
 * 쪽으로 움직이나**가 유일하게 남는 구분이다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import type { CastFx } from '@/core/chars';
import { BAD_C, GOOD_C, WHITE } from '@/ui/theme';

/** 한 번 도는 데 걸리는 시간 (ms) — 기술 동작(510~700ms)보다 조금 길게 */
const FX_MS = 760;

/**
 * 연출 하나가 도는 동안만 살아 있는 시계.
 *
 * `nonce` 가 오를 때마다 0 에서 1 까지 한 번 흐르고, 끝나면 스스로 꺼진다.
 * 꺼진 동안 `null` 을 돌려주는 것이 중요하다 — 안 그러면 안 쓰는 도형 여남은
 * 개가 파티원 넷의 머리 위에 계속 얹혀 있다.
 */
function useOnce(nonce: number, ms = FX_MS) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (nonce <= 0) return undefined;
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [nonce, ms, t]);

  return on ? t : null;
}

/**
 * ── 도발 ── 쓰는 사람에게서 고리 셋이 **밖으로** 퍼진다.
 *
 * 고리는 속이 빈 타원 테두리다. 채우면 인물이 통째로 가려진다 — 이 연출이
 * 말해야 하는 것은 "여기서 뭔가 나갔다" 이지 "여기가 밝다" 가 아니다.
 *
 * 셋이 **시차를 두고** 출발한다. 동시에 나가면 두꺼운 고리 하나로 보이고,
 * 그러면 퍼지는 것이 아니라 커지는 것이 된다.
 */
function Roar({ t, size }: { t: Animated.Value; size: number }) {
  /* `interpolate` 는 부를 때마다 값에 가지를 단다 — 한 번만 만든다 */
  const rings = useMemo(() => [0, 0.18, 0.36].map((delay) => ({
    delay,
    scale: t.interpolate({
      inputRange: [0, delay, 1],
      outputRange: [0.2, 0.2, 2.6],
      extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      /* 나가자마자 진하고, 커지면서 사라진다 */
      inputRange: [0, delay, Math.min(1, delay + 0.12), Math.min(1, delay + 0.55), 1],
      outputRange: [0, 0, 0.9, 0.15, 0],
      extrapolate: 'clamp',
    }),
  })), [t]);

  const w = size * 1.1;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 34 }}>
      {rings.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: w,
            /* 납작한 타원 — 쿼터뷰라 소리도 바닥을 따라 퍼진다 */
            height: w * 0.42,
            borderRadius: w,
            borderWidth: 2,
            borderColor: WHITE,
            opacity: r.fade,
            transform: [{ scale: r.scale }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * ── 광란 ── 쓰는 사람 뒤로 빗금 넷이 **흘러 지나간다.**
 *
 * 잔상을 그리려면 몸을 반투명하게 복제해야 하는데, 그러면 프레임마다 스프라이트
 * 를 한 장 더 그리게 된다 (파티가 넷이고 5초짜리다). 빗금은 도형 넷이라 거의
 * 공짜이고, 읽히는 것은 같다 — **빨라졌다.**
 *
 * 뒤로(왼쪽으로) 흐른다. 아군은 오른쪽을 보고 서 있으므로, 몸을 스쳐 뒤로
 * 가는 것이 앞으로 나아가는 것으로 읽힌다.
 */
function Haste({ t, size }: { t: Animated.Value; size: number }) {
  const bars = useMemo(() => [0, 0.12, 0.24, 0.36].map((delay, i) => ({
    top: size * (0.16 + i * 0.18),
    len: size * (0.5 + (i % 2) * 0.25),
    x: t.interpolate({
      inputRange: [0, delay, Math.min(1, delay + 0.4), 1],
      outputRange: [size * 0.5, size * 0.5, -size * 0.75, -size * 0.75],
      extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, delay, Math.min(1, delay + 0.08), Math.min(1, delay + 0.34), Math.min(1, delay + 0.4), 1],
      outputRange: [0, 0, 0.85, 0.5, 0, 0],
      extrapolate: 'clamp',
    }),
  })), [t, size]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 33 }}>
      {bars.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            left: 0,
            width: b.len,
            height: 2,
            backgroundColor: WHITE,
            opacity: b.fade,
            transform: [{ translateX: b.x }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * ── 정화 ── 걷힌 사람에게서 조각 다섯이 **위로 떠오른다.**
 *
 * 걷어낸 것이 몸을 떠나는 그림이다. 그래서 아래에서 위로 가고, 올라가면서
 * **작아진다** — 커지면 뭔가 도착하는 것으로 보인다.
 *
 * 초록이다 (`ui/theme` 의 `GOOD_C`). 이 게임에서 색을 쓰는 자리는 상태 로고
 * 테두리와 회복 숫자뿐인데, 여기도 같은 뜻이다 — 좋은 일이 일어났다.
 * 흰색으로 두면 맞아서 튄 조각과 구분이 안 된다.
 */
function Cleanse({ t, size }: { t: Animated.Value; size: number }) {
  const bits = useMemo(() => [0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => ({
    left: size * (0.12 + (i * 0.19)),
    box: 3 + (i % 2),
    y: t.interpolate({
      inputRange: [0, delay, 1],
      outputRange: [size * 0.75, size * 0.75, -size * 0.35],
      extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, delay, Math.min(1, delay + 0.1), Math.min(1, delay + 0.45), 1],
      outputRange: [0, 0, 1, 0, 0],
      extrapolate: 'clamp',
    }),
    /* 올라가면서 작아진다 — 몸을 떠나 멀어지는 것 */
    scale: t.interpolate({
      inputRange: [0, delay, 1], outputRange: [1.3, 1.3, 0.4], extrapolate: 'clamp',
    }),
  })), [t, size]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 43 }}>
      {bits.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: b.left,
            top: 0,
            width: b.box,
            height: b.box,
            backgroundColor: GOOD_C,
            opacity: b.fade,
            transform: [{ translateY: b.y }, { scale: b.scale }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * ── 화산 ── 맞은 적 발밑에서 기둥 셋이 **아래에서 위로** 솟는다.
 *
 * 이 하나만 **적 자리**에서 그린다. 비앙카는 제자리에서 땅을 내리치기만
 * 하므로, 그녀 쪽에서 뭔가 나가면 "던졌다" 가 되어 사양과 어긋난다.
 *
 * 자라는 방식이 중요하다. `scaleY` 를 아래 모서리에 고정해서 **바닥에서
 * 위로 뻗게** 한다 — 가운데에서 자라면 위아래로 동시에 늘어나 폭발로 보인다.
 * 솟았다가 꼭대기부터 흩어진다.
 */
function Erupt({ t, size }: { t: Animated.Value; size: number }) {
  const cols = useMemo(() => [0, 0.1, 0.2].map((delay, i) => ({
    left: size * (0.28 + i * 0.2),
    w: Math.max(3, Math.round(size * (i === 1 ? 0.16 : 0.1))),
    h: size * (i === 1 ? 1.15 : 0.8),
    grow: t.interpolate({
      inputRange: [0, delay, Math.min(1, delay + 0.22), Math.min(1, delay + 0.6), 1],
      outputRange: [0, 0, 1, 1, 0.15],
      extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, delay, Math.min(1, delay + 0.1), Math.min(1, delay + 0.45), Math.min(1, delay + 0.7), 1],
      outputRange: [0, 0, 1, 0.8, 0, 0],
      extrapolate: 'clamp',
    }),
  })), [t, size]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, zIndex: 45 }}>
      {cols.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: c.left,
            /* 발밑에 바닥을 맞춘다 — 여기가 0 이어야 위로만 자란다 */
            bottom: 0,
            width: c.w,
            height: c.h,
            backgroundColor: WHITE,
            opacity: c.fade,
            transform: [
              /*
                `scaleY` 는 **가운데**를 기준으로 늘어난다. 아래 모서리에서
                자라게 하려면 늘어난 만큼의 절반을 다시 내려 줘야 한다 —
                안 그러면 기둥이 땅을 뚫고 아래로도 자란다.
              */
              { translateY: Animated.multiply(c.grow, (c.h / 2)) },
              { scaleY: c.grow },
            ],
          }}
        />
      ))}
      {/* 솟은 자리에 남는 잔불 — 기둥이 꺼진 뒤에도 잠깐 */}
      <Animated.View
        style={{
          position: 'absolute',
          left: size * 0.22,
          bottom: -2,
          width: size * 0.5,
          height: 3,
          backgroundColor: BAD_C,
          opacity: t.interpolate({
            inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.9, 0.6, 0],
          }),
        }}
      />
    </View>
  );
}

/**
 * 기술이 나갈 때 터지는 연출 하나.
 *
 * `nonce` 가 오를 때마다 한 번 돈다. `kind` 가 없으면 아무것도 안 그린다 —
 * 첫 넷(검기·강타·화살비·기도)은 맞은 자리에서 이미 설명되므로 여기 없다.
 */
export function SkillFx({
  kind, nonce, size,
}: { kind: CastFx | null | undefined; nonce: number; size: number }) {
  const t = useOnce(kind ? nonce : 0);
  if (!kind || !t) return null;
  if (kind === 'roar') return <Roar t={t} size={size} />;
  if (kind === 'haste') return <Haste t={t} size={size} />;
  if (kind === 'cleanse') return <Cleanse t={t} size={size} />;
  return <Erupt t={t} size={size} />;
}
