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
 *   lavafan  옆으로 펼쳐지는 부채꼴 불  — 쓴 사람에게서 적 쪽으로 간다
 *
 * 방향이 다섯 다 다르다. 54px 짜리 인물 위에서 색도 모양도 못 쓰므로, **어느
 * 쪽으로 움직이나**가 유일하게 남는 구분이다.
 *
 * 화산과 용암 지대는 둘 다 비앙카의 불인데 **정반대로 움직인다** — 하나는
 * 맞은 놈 발밑에서 위로 솟고, 하나는 쓴 사람에게서 옆으로 퍼진다. 둘 다 불이라
 * 모양으로는 못 가르고, 가르는 것은 방향뿐이다.
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
import { WAVE_STROKE, wavePair, waveRing } from './Wave';

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
  /*
    `interpolate` 는 부를 때마다 값에 가지를 단다 — 한 번만 만든다.

    곡선은 `Wave` 에서 온다. 셋을 2.6배까지 등속으로 벌리던 것을 둘로
    줄이고 1.7배까지만 보낸다 — 까닭은 `Wave` 머리말에 있다.
  */
  const rings = useMemo(
    () => wavePair(t, { from: 0.45, to: 1.7, peak: 0.5, life: 0.6 }),
    [t],
  );

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
            borderWidth: WAVE_STROKE,
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

  /*
    ── 몸에서 빛이 쫙 ──

    조각만 떠오르던 것에 이 한 겹을 더했다. "정화가 되는 모션이 있으면
    좋겠음. 뭐 빛이 쫙 몸에서 나오는 효과라거나" 라는 말 그대로다.

    조각(위)만으로는 **걷혔다** 가 아니라 **뭔가 빠져나갔다** 까지만
    읽혔다. 다섯 점이 위로 흘러 올라가는 것은 조용한 그림이라, 정작
    "이 사람이 깨끗해졌다" 는 순간이 화면에 없었다.

    둘로 만든다.

      **살** — 몸에서 여덟 방향으로 뻗었다 사라진다. 처음이 제일 길고
      곧바로 짧아진다 — 터져 나오는 것은 뻗는 순간이 전부다.
      **테** — 그 뒤를 고리 하나가 밖으로 퍼진다.

    초록이다 (`GOOD_C`). 이 게임에서 초록은 "나에게 좋은 것" 하나만
    말하므로 (`ui/theme`), 같은 자리에서 나는 우두머리의 흰 연출과 절대
    안 헷갈린다.
  */
  const rays = useMemo(() => Array.from({ length: 8 }, (_v, i) => {
    const a = (i / 8) * Math.PI * 2;
    return {
      deg: (a * 180) / Math.PI,
      /* 몸 가운데에서 밖으로 */
      x: t.interpolate({
        inputRange: [0, 0.34, 1],
        outputRange: [0, Math.cos(a) * size * 0.52, Math.cos(a) * size * 0.62],
        extrapolate: 'clamp',
      }),
      y: t.interpolate({
        inputRange: [0, 0.34, 1],
        outputRange: [0, Math.sin(a) * size * 0.52, Math.sin(a) * size * 0.62],
        extrapolate: 'clamp',
      }),
      /* 길게 나왔다 짧아진다 */
      len: t.interpolate({
        inputRange: [0, 0.12, 0.4, 1], outputRange: [0.2, 1, 0.45, 0.15],
        extrapolate: 'clamp',
      }),
      o: t.interpolate({
        inputRange: [0, 0.06, 0.34, 0.6], outputRange: [0, 1, 0.6, 0],
        extrapolate: 'clamp',
      }),
    };
  }), [t, size]);

  const halo = useMemo(() => ({
    scale: t.interpolate({
      inputRange: [0, 0.5, 1], outputRange: [0.2, 1.5, 2.1], extrapolate: 'clamp',
    }),
    o: t.interpolate({
      inputRange: [0, 0.08, 0.45, 0.75], outputRange: [0, 0.9, 0.35, 0],
      extrapolate: 'clamp',
    }),
  }), [t]);

  const ring = Math.round(size * 0.62);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 43 }}>
      {/* 빛 — 몸 한가운데를 기준으로 잡는다 */}
      <View
        style={{
          position: 'absolute',
          left: 0, top: 0, width: size, height: size,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: ring, height: ring, borderRadius: ring,
            borderWidth: 2, borderColor: GOOD_C,
            opacity: halo.o,
            transform: [{ scale: halo.scale }],
          }}
        />
        {rays.map((r, i) => (
          <Animated.View
            key={`ray${i}`}
            style={{
              position: 'absolute',
              width: 2,
              height: Math.round(size * 0.42),
              backgroundColor: GOOD_C,
              opacity: r.o,
              transform: [
                { translateX: r.x },
                { translateY: r.y },
                { rotate: `${r.deg + 90}deg` },
                { scaleY: r.len },
              ],
            }}
          />
        ))}
      </View>

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

/**
 * ── 부채꼴 불 ── 용암 지대 (`core/skillTree` 의 `ba3a`).
 *
 * 도끼를 옆으로 훑으면 (`bunnyaxe/sk4_*`) 그 궤적에서 불이 펼쳐져 적 쪽으로
 * 간다. 그림 셋이 **펴지고 · 다 펴지고 · 흩어진다** 를 그리고, 여기서는
 * 그것이 옆으로 조금 흐르게만 한다.
 *
 * ## 자리를 손으로 맞춘다
 *
 * 부챗살이 모이는 꼭짓점이 그림의 왼쪽 중간쯤(`APEX`)에 있다. 그 점을 비앙카의
 * 도끼가 지나는 자리(`HAND`)에 얹어야 "저 손에서 나왔다" 가 된다. 가운데
 * 맞추기로는 안 된다 — 부채는 한쪽으로만 자라는 모양이라 가운데가 뜻이 없다.
 *
 * 세 칸이 **같은 상자로 잘려 있다** (`noTrim` + `grid`). 각자 여백을 깎으면
 * 칸마다 꼭짓점 자리가 달라져서, 펴지는 동안 부채가 좌우로 튄다.
 *
 * ## 상자 밖으로 나간다
 *
 * 인물 상자(`size`)의 두 배 반을 옆으로 뻗는다. 적이 저기 서 있으므로 그
 * 앞까지 닿아야 "전체에 퍼졌다" 가 되고, 상자 안에 가두면 발밑에서 뭔가
 * 반짝이다 마는 것이 된다.
 */
const FAN_MS = 520;

/** 그림 안에서 부챗살이 모이는 점 (가로, 세로 비율) */
const APEX = { x: 0.11, y: 0.52 };
/** 인물 상자 안에서 도끼가 지나는 자리 — 여기에 `APEX` 를 얹는다 */
const HAND = { x: 0.62, y: 0.55 };
/**
 * 부채 폭이 인물 상자의 몇 배인가.
 *
 * **적 진영 끝까지 닿아야 한다.** 적 전체를 때리는 기술인데 (`pick: 'all'`)
 * 불이 앞줄에서 멎으면 뒷줄은 왜 닳는지가 화면에 없다.
 *
 * 무대를 재서 나온 값이다. 폭 360 짜리 화면에서 아군 격자가 왼쪽 25~162 를
 * 쓰고 적 격자가 171~335 를 쓴다 (`BattleView` 의 `fitOf`·`foeLayout`). 제일
 * 나쁜 경우는 비앙카가 **앞줄 왼쪽 끝**에 설 때인데, 그때 꼭짓점이 72 쯤에
 * 서므로 263px 을 더 가야 한다. 부채는 꼭짓점이 그림의 11% 지점이라 (`APEX`)
 * 쓸 수 있는 길이가 폭의 89% 다 — 263 / 0.89 / 76 ≒ 3.9.
 *
 * 4.2 는 거기에 조금 더 준 값이다. 넘치는 만큼은 화면 밖으로 나갈 뿐이고,
 * 모자라면 뒷줄 적 위가 비어 보인다.
 */
const FAN_W = 4.2;
/** 그림 비율 (높이 ÷ 폭) — 세 칸이 같다 */
const FAN_RATIO = 256 / 207;

function LavaFan({ t, size }: { t: Animated.Value; size: number }) {
  const [frame, setFrame] = useState(1);

  /* 세 칸을 순서대로 — 까닭은 `Erupt` 에 적어 두었다 */
  useEffect(() => {
    setFrame(1);
    const a = setTimeout(() => setFrame(2), FAN_MS / 3);
    const b = setTimeout(() => setFrame(3), (FAN_MS * 2) / 3);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [t]);

  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0],
  }), [t]);
  /*
    펴지는 동안 **옆으로 조금 흐른다.**

    그림이 이미 펴지는 것을 그리므로 많이 움직일 필요가 없다. 크게 밀면
    날아가는 물체가 되어 화살이나 검기와 같은 것이 되는데, 이건 던지는 것이
    아니라 **번지는 것**이다.
  */
  const slide = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0, size * 0.45],
  }), [t, size]);

  const w = size * FAN_W;
  const h = w * FAN_RATIO;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: size * HAND.x - w * APEX.x,
        top: size * HAND.y - h * APEX.y,
        width: w,
        opacity: fade,
        transform: [{ translateX: slide }],
        zIndex: 45,
      }}
    >
      <Sprite set="sfx_lavafan" name={String(frame)} size={w} />
    </Animated.View>
  );
}

/** 폭발 세 칸이 도는 시간 — `FX_MS` 보다 짧다. 터지는 것은 빨라야 한다 */
const ERUPT_MS = 420;

/**
 * ── 성검이 도는 시간 (ms) ──
 *
 * 화산(420ms)보다 한참 길다. 저건 **한 번 터지고 마는 것**이고 이건
 * 하늘에서 내려와 박히는 것이라, 내려오는 동안이 눈에 남아야 "떨어졌다" 가
 * 된다. 코스트 12 짜리라 한 판에 두어 번 나오므로 길어도 지겹지 않다.
 */
export const SWORD_MS = 900;

/**
 * 검이 **박히는 순간**이 수명의 어디쯤인가 (0~1).
 *
 * 시트의 3번 칸이 시작하는 시각이다. 떨어지는 거리도, 착탄 빛도, 무대가
 * 흔들리는 시각도(`BattleView`) 전부 이 하나를 본다 — 셋이 각자 숫자를
 * 들고 있으면 검이 닿기 전에 땅이 흔들린다.
 */
export const SWORD_HIT = 0.3;

/** 어느 칸이 몇 시에 나오나 — 나타남 · 낙하 · **박힘(길게)** · 퍼짐 · 스러짐 */
const SWORD_CUE = [0.14, SWORD_HIT, 0.62, 0.82];

/**
 * 칸 안에서 **칼끝이 어느 높이인가** (0 = 칸 위, 1 = 칸 아래).
 *
 * 받은 시트를 픽셀로 재서 넣은 값이다. 다섯 칸의 칼끝이 제각각이라
 * (0.69 · 0.89 · 0.75 · 0.77 · 0.83) 칸을 그냥 겹쳐 두면 **칼끝이 프레임마다
 * 위아래로 튄다** — 박히는 칸으로 넘어가는 순간 검이 33px 뛰어오른다.
 *
 * 그리고 칸 아래쪽이 비어 있다는 것이 더 큰 문제였다. 상자 바닥을 적의 발
 * 높이에 맞춰 두었으니 (`bottom: 0`) 그 빈 자리만큼 **검이 허공에서 멎었다**
 * — 3번 칸은 4분의 1 이 비어 있어서, 248px 짜리로 키우면 칼끝이 발보다
 * 62px 위에 박혔다. 커질수록 더 떠오르는 셈이라 크기를 올린 것이 오히려
 * 어긋남을 키웠다.
 *
 * 그래서 상자를 **칼끝으로** 매단다 (`bottom: -h * (1 - foot)`). 어느 칸이든
 * 칼끝이 정확히 발 높이에 오고, 칸이 넘어가도 그 점이 안 움직인다.
 */
const SWORD_FOOT = [0.687, 0.885, 0.75, 0.771, 0.833];

/**
 * ── 성검 발현 ── 맞는 적 위에서 빛의 대검이 내리꽂힌다.
 *
 * ## `cast` 와 자리가 반대다
 *
 * 포효 · 광란 · 정화 · 화산은 전부 **쓰는 사람** 쪽에서 난다 (`SkillFx`).
 * 이것만 **맞는 놈** 위에서 난다 — 이졸데가 검을 부르고 검은 저쪽에
 * 떨어지므로, 쓰는 사람 발밑에 그리면 정작 아무 일도 안 일어난 자리에
 * 그림이 뜬다. 그래서 부르는 자리도 다르다 (`BattleView` 의 `hits`).
 *
 * ## 내려오는 것은 **코드가 한다**
 *
 * 한동안 시트에 맡겨 두었다. 칸 안에서 검이 위에서 아래로 내려오게 그려
 * 받았으니 자리를 안 옮겨도 된다고 적어 두었는데, 받은 그림을 실제로 재
 * 보니 **1번과 3번의 검 높이가 거의 같았다** (칸 위에서 12px · 18px).
 * 2번만 조금 내려와 있고 그마저 위로 뻗은 궤적 줄기 때문에 상자가 늘어난
 * 것이었다. 곧 화면에서는 **아무것도 안 떨어졌다** — 검이 그 자리에 뜬
 * 채로 그림만 다섯 번 갈아 끼워졌다.
 *
 * 그래서 낙하는 여기서 얹는다 (`drop`). 시트는 "그 순간의 모습" 다섯 장을
 * 맡고, **어디서 어떻게 내려오나**는 코드가 맡는다 — 다른 다섯 칸 시트와
 * 같은 갈림길이다 (`bfx_bolt` 등).
 *
 * ## 떨어지는 것은 **점점 빨라진다**
 *
 * 등속으로 내리면 검이 내려오는 것이 아니라 화면을 타고 미끄러진다.
 * 떨어지는 거리는 시간의 제곱이므로 (`drop` 의 네 마디가 그 곡선이다)
 * 마지막 한 뼘이 제일 빠르고, 그 순간에 박힌다.
 *
 * ## 몸의 세 배 반이다
 *
 * 2.3배였다. 그런데 `Sprite` 는 **정사각 상자에 `contain`** 으로 넣으므로,
 * 세로가 가로의 두 배인 이 그림은 상자 한 변만큼만 높아진다 — 곧 화면에
 * 나오는 검의 키가 곧 `h` 다. 게다가 칸 안에서 검이 실제로 차지하는 높이는
 * 3분의 2 뿐이라, 73px 짜리 잡몹 위에 **113px 짜리 검**이 떴다. 한 대로
 * 제일 센 기술이 화면에서는 평타 위의 작대기였다.
 *
 * 3.4배로 올린다. 상한(260)은 우두머리 때문이다 — 132px 짜리 몸에 배수를
 * 그대로 곱하면 검 하나가 무대 높이(423)를 넘는다.
 *
 * ## 빛난다
 *
 * 에셋이 흰 픽셀이라 밝게 할 수가 없다 (`BodyFlash` 와 같은 문제다).
 * 그래서 **같은 그림을 뒤에 두 장 더 깔고 키운다** — 1.12배와 1.28배가
 * 옅게 겹치면 날 가장자리에서 빛이 번져 나온 것으로 읽힌다. 박히는
 * 순간에 그 둘이 한 번 확 밝아지는 것이 "콰앙" 의 절반이다.
 *
 * 나머지 절반은 발밑이다 (`SwordHit`) — 그리고 무대가 흔들린다
 * (`BattleView` 가 `SWORD_HIT` 에 맞춰 때린다).
 *
 * ## 3번 칸에 오래 머문다
 *
 * 박히는 칸이 이 기술의 그림이다. 다섯을 고르게 나누면 제일 중요한 칸이
 * 다른 넷과 똑같이 스쳐 지나간다.
 */
export function HolySword({ nonce, size }: { nonce: number; size: number }) {
  const { t, on } = useOnce(nonce, SWORD_MS);
  const [frame, setFrame] = useState(1);

  /* 화면에 나오는 검의 키 (px) — 머리말 "몸의 세 배 반" */
  const h = Math.round(Math.min(size * 3.4, 260));
  /*
    얼마나 위에서 떨어지나.

    검 키의 4분의 3 이다. 이만큼이면 칼끝이 하늘 한가운데(무대 위에서
    170px 쯤)에서 출발해 적의 발까지 온다 — 적의 키가 73px 이니 머리보다
    100px 넘게 위다. 더 올리면 위 띠(`TopBar`)에 가려 출발점이 안 보이고,
    더 내리면 머리 옆에서 생겨난 것이 된다.
  */
  const far = h * 0.75;

  useEffect(() => {
    if (nonce <= 0) return undefined;
    setFrame(1);
    const ts = SWORD_CUE.map(
      (r, i) => setTimeout(() => setFrame(i + 2), Math.round(SWORD_MS * r)),
    );
    return () => ts.forEach(clearTimeout);
  }, [nonce]);

  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 1, 1, 0],
  }), [t]);

  /*
    ── 떨어진다 ──

    `SWORD_HIT` 에 정확히 0 이 되고 그 뒤로는 안 움직인다. 네 마디가
    거리 = 시간² 이다 (4분의 1 지점에서 16분의 1 만 왔고, 절반에서 4분의 1,
    4분의 3 지점에서 16분의 9). 마지막 한 뼘이 제일 빠르다.
  */
  const drop = useMemo(() => t.interpolate({
    inputRange: [
      0, SWORD_HIT * 0.25, SWORD_HIT * 0.5, SWORD_HIT * 0.75, SWORD_HIT, 1,
    ],
    outputRange: [-far, -far * 0.94, -far * 0.75, -far * 0.44, 0, 0],
    extrapolate: 'clamp',
  }), [t, far]);

  /*
    ── 빛무리 두 겹 ──

    내려오는 동안은 옅게 감싸고 (0.16), 박히는 순간에 세 배로 터졌다가
    (0.5) 잦아든다. 이 한 번의 봉우리가 없으면 검이 그냥 내려앉는다.

    바깥 겹은 안쪽의 절반이 안 된다. 빛은 멀어질수록 옅어지는 것이라,
    두 겹이 같은 밝기면 윤곽선이 두 줄 그어진 것으로 보인다.
  */
  const halo = useMemo(() => [1, 0.42].map((mul) => t.interpolate({
    inputRange: [0, 0.05, SWORD_HIT - 0.02, SWORD_HIT + 0.05, 0.6, 1],
    outputRange: [0, 0.16, 0.22, 0.5, 0.18, 0].map((v) => v * mul),
    extrapolate: 'clamp',
  })), [t]);

  if (!on) return null;

  const left = Math.round((size - h) / 2);
  return (
    <>
      {/*
        발밑의 착탄 — **떨어지는 상자 밖에** 있다. 안에 넣으면 빛도 같이
        내려와서, 검이 닿기도 전에 땅이 빛난다.
      */}
      <SwordHit t={t} size={size} h={h} />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          /*
            **칼끝을** 적의 발 높이에 맞춘다 (`SWORD_FOOT`). 칸 바닥을
            맞추던 것을 고쳤다 — 칸 아래가 비어 있어서 검이 허공에 박혔다.
          */
          bottom: -Math.round(h * (1 - (SWORD_FOOT[frame - 1] ?? 0.75))),
          left,
          width: h,
          height: h,
          opacity: fade,
          transform: [{ translateY: drop }],
          /* 맞은 놈 위에 뜨되 피해 숫자(60)보다는 아래 */
          zIndex: 47,
        }}
      >
        {/* 빛무리 두 겹 — 뒤에 깔리므로 검보다 **먼저** 그린다 */}
        {[1.12, 1.28].map((s, i) => (
          <Animated.View
            key={s}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              /* 바깥쪽일수록 옅다 — 그래야 번져 나가는 것으로 보인다 */
              opacity: halo[i],
              transform: [{ scale: s }],
            }}
          >
            <Sprite set="sfx_holysword" name={String(frame)} size={h} />
          </Animated.View>
        ))}
        <Sprite set="sfx_holysword" name={String(frame)} size={h} />
      </Animated.View>
    </>
  );
}

/**
 * ── 성검이 박히는 자리 ── 발밑에서 한 번 터지는 빛.
 *
 * 시트의 3·4번 칸이 이미 옆으로 뻗는 빛살을 그리고 있다. 여기서 더하는
 * 것은 **땅에 닿았다** 하나다 — 칸 그림은 검을 따라 위에 떠 있고, 닿은
 * 자리는 그 아래 발 높이다.
 *
 * 둘로 만든다.
 *
 *   **속** — 납작한 흰 타원이 확 퍼졌다 곧 꺼진다 (120ms 남짓)
 *   **테** — 그 뒤를 고리 하나가 낮게 따라 나간다 (`Wave` 의 곡선)
 *
 * 속이 먼저 꺼지고 테가 남는 순서다 (`BossFx` 의 `Boom` 과 같다). 반대로
 * 하면 터진 것이 아니라 부풀어 오른 것이 된다.
 *
 * 납작하다. 쿼터뷰라 땅에 닿은 힘은 바닥을 따라 옆으로 퍼진다 — 동그란
 * 고리가 서면 발밑에서 뭔가 솟은 것으로 보인다.
 */
function SwordHit({ t, size, h }: { t: Animated.Value; size: number; h: number }) {
  /*
    검 폭에 맞춘다 — `Sprite` 가 정사각 상자에 담으므로 그림 폭은 키의
    절반이다. 거기서 더 좁힌다: 3번 칸이 이미 옆으로 넓게 뻗는 빛살을
    그리고 있어서, 같은 폭으로 한 번 더 깔면 두 겹이 겹쳐 **적이 통째로
    흰 판에 덮인다.** 여기서 더할 것은 닿은 자리 한 점이다.
  */
  const w = Math.round(h * 0.42);

  const core = useMemo(() => ({
    scale: t.interpolate({
      inputRange: [0, SWORD_HIT, SWORD_HIT + 0.05, SWORD_HIT + 0.14],
      outputRange: [0.25, 0.25, 1, 1.35],
      extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, SWORD_HIT, SWORD_HIT + 0.03, SWORD_HIT + 0.14],
      outputRange: [0, 0, 0.75, 0],
      extrapolate: 'clamp',
    }),
  }), [t]);
  const ring = useMemo(
    () => waveRing(t, {
      delay: SWORD_HIT + 0.02, from: 0.4, to: 1.6, peak: 0.5, life: 0.42,
    }),
    [t],
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: Math.round((size - w) / 2),
        width: w,
        height: Math.round(w * 0.34),
        alignItems: 'center',
        justifyContent: 'center',
        /* 검(47)보다 **아래** — 빛이 날을 덮으면 검이 사라진다 */
        zIndex: 46,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: w,
          height: Math.round(w * 0.3),
          borderRadius: w,
          backgroundColor: WHITE,
          opacity: core.fade,
          transform: [{ scale: core.scale }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: w,
          height: Math.round(w * 0.34),
          borderRadius: w,
          borderWidth: WAVE_STROKE,
          borderColor: WHITE,
          opacity: ring.fade,
          transform: [{ scale: ring.scale }],
        }}
      />
    </View>
  );
}

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
  if (kind === 'lavafan') return <LavaFan t={t} size={size} />;
  return <Erupt t={t} size={size} />;
}
