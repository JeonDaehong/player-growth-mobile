/**
 * ── 보물이 펑 ── 재화를 받는 그 순간 터져 나오는 것.
 *
 * 두 자리에서 같은 것을 쓴다: 게이지를 받을 때(`RewardBar`)와 자리를 비운
 * 몫을 받을 때(`OfflinePopup`). "재화를 누르면 보물이 펑 터져 나오는 느낌을
 * 줘야 함" 이 둘 다에 붙은 말이라, 둘이 달라 보이면 같은 일이 두 가지로
 * 읽힌다.
 *
 * ## 셋이 겹친다
 *
 *   **번쩍** — 흰 원이 확 부풀었다 곧 꺼진다. 터지는 순간이다
 *   **동전** — 열두 개가 위로 솟았다 떨어진다. 포물선이라야 튀어나온 것이 된다
 *   **테**   — 고리 하나가 밖으로 퍼진다
 *
 * 동전이 **포물선**인 것이 핵심이다. 곧게 퍼지면 폭발이고 (그건 우두머리
 * 것이다 — `BossFx` 의 `Boom`), 위로 솟았다 떨어져야 상자에서 쏟아진 것이 된다.
 * 그래서 가로는 일정하게 가고 세로만 중력을 탄다.
 *
 * ## 자리를 밖에서 받는다
 *
 * 상자 위에서도 나고 팝업 한가운데에서도 난다. 안에서 자리를 잡으면 부르는
 * 쪽마다 감싸는 상자를 하나씩 더 만들게 된다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Pixel } from '@/ui/Pixel';
import { ICONS } from '@/ui/sprites';
import { WHITE } from '@/ui/theme';

/** 한 번 터지는 데 걸리는 시간 (ms) */
const MS = 900;

/** 몇 개가 튀어나오나 */
const COINS = 12;

export function TreasurePop({
  nonce, left, bottom, size = 1,
}: {
  /** 오를 때마다 한 번 터진다. 0 이면 아무것도 안 한다 */
  nonce: number;
  /** 터지는 자리 — 감싸는 상자 기준 */
  left: number;
  bottom: number;
  /** 크기 배수. 팝업에서는 크게, 줄에서는 작게 */
  size?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (nonce <= 0) return undefined;
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [nonce, t]);

  const flash = useMemo(() => ({
    scale: t.interpolate({ inputRange: [0, 0.12, 0.4], outputRange: [0.2, 1.6, 2.2], extrapolate: 'clamp' }),
    o: t.interpolate({ inputRange: [0, 0.06, 0.28], outputRange: [0, 0.9, 0], extrapolate: 'clamp' }),
  }), [t]);

  const ring = useMemo(() => ({
    scale: t.interpolate({ inputRange: [0, 0.6], outputRange: [0.2, 3.2], extrapolate: 'clamp' }),
    o: t.interpolate({ inputRange: [0, 0.08, 0.5], outputRange: [0, 0.8, 0], extrapolate: 'clamp' }),
  }), [t]);

  const coins = useMemo(() => Array.from({ length: COINS }, (_v, i) => {
    /*
      부채꼴로 흩어진다 — **위쪽 절반만** 쓴다 (0.15π ~ 0.85π).

      아래로도 뿌리면 상자 밑으로 파고들어서, 튀어나온 것이 아니라 쏟아진
      것이 된다. 쏟아지는 것은 상자가 이미 열렸을 때의 그림이다.
    */
    const a = Math.PI * (0.15 + (0.7 * i) / Math.max(1, COINS - 1));
    const far = (34 + (i % 3) * 10) * size;
    const up = (26 + (i % 4) * 8) * size;
    return {
      /* 가로는 일정하게 — 중력은 세로에만 걸린다 */
      x: t.interpolate({ inputRange: [0, 1], outputRange: [0, -Math.cos(a) * far] }),
      /*
        세로는 위로 갔다 아래로. 0.42 에서 꼭대기다 — 절반보다 조금 앞이라
        올라가는 것이 짧고 떨어지는 것이 길다. 그래야 무게가 느껴진다.
      */
      y: t.interpolate({
        inputRange: [0, 0.42, 1],
        outputRange: [0, -up, up * 0.9],
      }),
      spin: t.interpolate({
        inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 ? 1 : -1) * 420}deg`],
      }),
      o: t.interpolate({
        inputRange: [0, 0.05, 0.7, 1], outputRange: [0, 1, 1, 0],
      }),
    };
  }), [t, size]);

  if (!on) return null;
  const w = Math.round(26 * size);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute', left, bottom, width: 0, height: 0, zIndex: 80,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: w, height: w, borderRadius: w,
          backgroundColor: WHITE,
          opacity: flash.o,
          transform: [{ scale: flash.scale }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: w, height: w, borderRadius: w,
          borderWidth: 2, borderColor: WHITE,
          opacity: ring.o,
          transform: [{ scale: ring.scale }],
        }}
      />
      {coins.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            opacity: c.o,
            transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: c.spin }],
          }}
        >
          {/* 동전과 보석을 섞는다 — 열두 개가 다 같으면 동전 무더기가 된다 */}
          <Pixel sprite={i % 3 === 0 ? ICONS.gem : ICONS.coin} scale={1.4 * size} />
        </Animated.View>
      ))}
    </View>
  );
}
