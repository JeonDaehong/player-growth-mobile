/**
 * 두 번째 기술 넷의 **큰 연출.**
 *
 * ## 셋은 도형, 하나는 시트
 *
 * 넷 중 셋이 **아무도 안 때린다** (도발 · 광란 · 정화). 때리는 기술은 맞은
 * 자리에서 불꽃이 터지고 숫자가 뜨므로 화면이 알아서 설명되는데, 이쪽은 몸짓
 * 말고는 아무 일도 안 일어난다 — 코스트 20 을 모아 쓴 정화가 화면에서는
 * "잠깐 무릎 꿇었다" 로 끝난다.
 *
 * 그 셋은 **그림을 안 받는다.** 퍼지는 소리도, 흐르는 잔상도, 떠오르는
 * 조각도 전부 "옅어지며 자란다" 가 본질인데 2색에는 옅음이 없다. 시트로
 * 받으면 흰 얼룩 몇 장이 된다. 도형은 불투명도와 크기를 **연속으로** 바꿀
 * 수 있고, 그게 시트가 못 하는 유일한 것이자 저 셋에 필요한 전부다.
 *
 * 화산만 다르다. 저건 **한 번 터지고 마는 것**이라 세 칸이면 되고, 갈라지는
 * 불꽃과 튀는 조각은 도형으로 흉내 낼 수 있는 종류가 아니다 — 손으로 기둥
 * 셋을 그려 봤다가 받은 시트로 갈았다 (`sfx_erupt`). 타격 이펙트(`fx/`)가
 * 다섯 칸 시트인 것과 같은 갈림길이다.
 *
 * ## 넷이 서로 안 닮아야 한다
 *
 *   roar     밖으로 퍼지는 고리 셋      — 옆으로 자란다
 *   haste    뒤로 흐르는 빗금 넷 + 별빛 — 옆으로 흐른다
 *   cleanse  위로 떠오르는 조각 다섯    — 위로 간다
 *   erupt    발밑에서 솟는 폭발         — 아래서 위로 간다
 *
 * 방향이 넷 다 다르다. 54px 짜리 인물 위에서 색도 모양도 못 쓰므로, **어느
 * 쪽으로 움직이나**가 유일하게 남는 구분이다.
 *
 * ## 흰 그림은 밝게 못 한다
 *
 * `BodyFlash` 가 그 문제를 푼다 — 에셋이 이미 흰 픽셀이라 색을 흰색으로
 * 갈아도 아무 일이 안 일어나므로, 대신 **제 실루엣을 뒤에 깔고 키운다.**
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import type { CastFx } from '@/core/chars';
import { Sprite } from '@/ui/Sprite';
import { GOOD_C, WHITE } from '@/ui/theme';

/** 한 번 도는 데 걸리는 시간 (ms) — 기술 동작(510~700ms)보다 조금 길게 */
const FX_MS = 760;

/**
 * 연출 하나가 도는 동안만 살아 있는 시계.
 *
 * `nonce` 가 오를 때마다 0 에서 1 까지 한 번 흐르고, 끝나면 스스로 꺼진다.
 * 꺼진 동안 `null` 을 돌려주는 것이 중요하다 — 안 그러면 안 쓰는 도형 여남은
 * 개가 파티원 넷의 머리 위에 계속 얹혀 있다.
 */
function useOnce(nonce: number, ms = FX_MS): { t: Animated.Value; on: boolean } {
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

  /*
    시계는 **늘 돌려준다** — 꺼져 있어도.

    `on ? t : null` 로 두면 부르는 쪽에서 `t?.interpolate()` 를 쓰게 되고,
    그 결과는 `undefined` 일 수 있는 타입이라 `transform` 에 못 넣는다.
    훅은 조건부로 못 부르므로 보간을 `if` 뒤로 미룰 수도 없다.

    값과 켜짐을 갈라 두면 보간은 늘 만들어지고(공짜다 — `useMemo` 안이라
    한 번뿐이다) 그릴지 말지만 `on` 이 정한다.
  */
  return { t, on };
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

  /*
    빗금만으로는 **켜진 순간**이 안 보인다. 빗금은 흘러가는 것이라 "빠르다"
    는 말하지만 "지금 켰다" 는 못 말한다.

    그래서 몸 한가운데에서 네 갈래 별빛이 한 번 크게 터졌다 사라진다. 뒤의
    몸 번쩍임(`BodyFlash`)과 같은 순간에 나므로 둘이 한 번의 섬광으로 읽힌다.
  */
  const star = useMemo(() => ({
    fade: t.interpolate({
      inputRange: [0, 0.06, 0.3, 1], outputRange: [0, 1, 0.5, 0],
    }),
    grow: t.interpolate({
      inputRange: [0, 0.25, 1], outputRange: [0.2, 1, 1.5],
    }),
  }), [t]);
  const arm = Math.round(size * 0.62);
  const thick = Math.max(2, Math.round(size * 0.055));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 33 }}>
      {/* 네 갈래 별빛 — 가로 · 세로 두 막대가 겹쳐 십자가 된다 */}
      <Animated.View
        style={{
          position: 'absolute',
          left: size * 0.5 - arm / 2,
          top: size * 0.34,
          width: arm,
          height: arm,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: star.fade,
          transform: [{ scale: star.grow }],
        }}
      >
        <View style={{ position: 'absolute', width: arm, height: thick, backgroundColor: WHITE }} />
        <View style={{ position: 'absolute', width: thick, height: arm, backgroundColor: WHITE }} />
      </Animated.View>
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
 * ── 화산 ── 맞은 적 발밑에서 불기둥이 솟는다.
 *
 * ## 이것만 그림을 쓴다
 *
 * 나머지 셋(포효 · 광란 · 정화)은 도형이다. 저것들은 "옅어지며 자란다" 가
 * 본질이라 2색 시트로는 못 그린다.
 *
 * 폭발은 반대다. **한 번 터지고 마는 것**이라 세 칸이면 충분하고, 손으로
 * 그린 기둥 셋보다 받은 그림이 훨씬 낫다 — 갈라지는 불꽃과 튀는 조각은
 * 도형으로 흉내 낼 수 있는 종류가 아니다. 타격 이펙트(`fx/`)가 다섯 칸
 * 시트인 것과 같은 이유다.
 *
 * ## 발밑에 바닥을 맞춘다
 *
 * 그림이 **아래가 넓고 위로 뻗는** 모양이라, 가운데에 맞추면 땅속에서
 * 절반이 터진다. 상자 아래쪽을 적의 발 높이에 붙인다 (`bottom: 0`).
 */
function Erupt({ t, size }: { t: Animated.Value; size: number }) {
  const [frame, setFrame] = useState(1);

  /*
    세 칸을 순서대로 넘긴다.

    `Animated.Value` 는 화면을 다시 그리지 않고 흐르므로, 칸을 넘기려면
    타이머가 따로 있어야 한다. `t` 를 구독(`addListener`)해도 되지만 그건
    프레임마다 콜백이 도는 것이라 훨씬 비싸다 — 셋뿐이니 타이머 둘이면 된다.
  */
  useEffect(() => {
    setFrame(1);
    const a = setTimeout(() => setFrame(2), ERUPT_MS / 3);
    const b = setTimeout(() => setFrame(3), (ERUPT_MS * 2) / 3);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [t]);

  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0],
  }), [t]);
  /* 솟는 동안 조금 커진다 — 멈춰 있으면 그림 세 장이 갈아 끼워지는 것으로 보인다 */
  const grow = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0.9, 1.25],
  }), [t]);

  const w = Math.round(size * 1.5);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        /* 적의 발 높이에 바닥을 맞춘다 — 그림이 아래가 넓고 위로 뻗는다 */
        bottom: 0,
        left: (size - w) / 2,
        width: w,
        opacity: fade,
        transform: [{ scale: grow }],
        zIndex: 45,
      }}
    >
      <Sprite set="sfx_erupt" name={String(frame)} size={w} />
    </Animated.View>
  );
}

/** 폭발 세 칸이 도는 시간 — `FX_MS` 보다 짧다. 터지는 것은 빨라야 한다 */
const ERUPT_MS = 420;

/**
 * ── 몸이 번쩍인다 ──
 *
 * ## 왜 필요했나
 *
 * 리안느의 광란은 **아무것도 몸을 안 떠난다.** 화살도, 빛도, 파동도 없다 —
 * 5초 동안 제 공격속도가 두 배가 될 뿐이다. 그래서 §F 그림이 아무리 좋아도
 * 화면에서는 "활을 든 채 자세를 바꿨다" 로 끝났다. 코스트 10 을 모아 쓴
 * 기술인데.
 *
 * ## 흰 그림 위에서 어떻게 번쩍이나
 *
 * 에셋이 이미 흰 픽셀이라 **밝게 할 수가 없다.** 색을 흰색으로 갈아도
 * (`tint`) 아무 일도 안 일어난다.
 *
 * 그래서 **제 실루엣을 뒤에 한 장 더 깔고 키운다.** 같은 모양이 몸보다
 * 조금 크게 뒤에 있다가 퍼지며 사라지므로, 몸 가장자리에서 빛이 한 번
 * 새어 나온 것으로 읽힌다. 자세가 바뀌면 그 모양도 같이 바뀌므로 늘
 * 정확히 그 사람의 윤곽이다.
 *
 * @param children 그 순간의 몸 그림 — 부르는 쪽이 넘긴다 (`Fighter`)
 */
export function BodyFlash({
  nonce, size, children,
}: { nonce: number; size: number; children: React.ReactNode }) {
  const { t, on } = useOnce(nonce, FLASH_MS);

  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 1], outputRange: [0, 0.85, 0],
  }), [t]);
  const grow = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [1.02, 1.45],
  }), [t]);

  if (!on) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        opacity: fade,
        transform: [{ scale: grow }],
        /* 몸(기본 층)보다 **뒤**다 — 앞에 오면 인물을 덮어 버린다 */
        zIndex: 1,
      }}
    >
      {children}
    </Animated.View>
  );
}

/** 번쩍임이 도는 시간 — 짧아야 번쩍인 것이 된다 */
const FLASH_MS = 420;

/**
 * 기술이 나갈 때 터지는 연출 하나.
 *
 * `nonce` 가 오를 때마다 한 번 돈다. `kind` 가 없으면 아무것도 안 그린다 —
 * 첫 넷(검기·강타·화살비·기도)은 맞은 자리에서 이미 설명되므로 여기 없다.
 */
export function SkillFx({
  kind, nonce, size,
}: { kind: CastFx | null | undefined; nonce: number; size: number }) {
  const { t, on } = useOnce(kind ? nonce : 0);
  if (!kind || !on) return null;
  if (kind === 'roar') return <Roar t={t} size={size} />;
  if (kind === 'haste') return <Haste t={t} size={size} />;
  if (kind === 'cleanse') return <Cleanse t={t} size={size} />;
  return <Erupt t={t} size={size} />;
}
