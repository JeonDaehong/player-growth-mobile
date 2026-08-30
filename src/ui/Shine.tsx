import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { WHITE } from './theme';

/**
 * 빛줄기가 훑고 지나가는 래퍼.
 *
 * 장인의 무구처럼 "여기까지 온 사람만 가진 것"에 붙인다. 흑백 2색이라 색으로는
 * 특별함을 못 만든다 — 움직임이 유일하게 남은 수단이다.
 *
 * 아무 데나 붙이면 화면이 시끄러워지므로 **가장 귀한 것 한 종류에만** 쓴다.
 * (칭호 이름표는 자기 등급 체계가 따로 있어 TitleTag 안에서 처리한다)
 */
export function Shine({
  children, size, active = true, period = 2800, delay = 0, style,
}: {
  children: React.ReactNode;
  /** 훑는 폭 계산에 쓴다. 칸 한 변 길이 */
  size: number;
  active?: boolean;
  period?: number;
  /** 여러 칸이 동시에 번쩍이면 깜빡임처럼 보인다 — 칸마다 어긋나게 준다 */
  delay?: number;
  style?: ViewStyle;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    t.value = 0;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: period * 0.22, easing: Easing.out(Easing.quad) }),
          // 훑고 나면 한참 쉰다. 쉬는 시간이 없으면 반짝임이 아니라 점멸이다
          withTiming(1, { duration: period * 0.78 }),
        ),
        -1,
        false,
      ),
    );
  }, [active, period, delay, t]);

  /**
   * 굵고 진한 막대는 반짝임이 아니라 **깨진 그림처럼** 보인다.
   * 얇게(칸의 7%) · 옅게(0.45) 지나가야 "빛이 스쳤다" 로 읽힌다.
   */
  const sweep = useAnimatedStyle(() => ({
    opacity: t.value > 0 && t.value < 1 ? 0.45 : 0,
    transform: [{ translateX: -size * 0.6 + t.value * size * 1.8 }, { rotate: '20deg' }],
  }));

  /**
   * ⚠ 꺼져 있을 때도 **같은 컨테이너**를 그린다.
   * 예전에는 `<>{children}</>` 로 빠져나가서, 반짝이지 않는 장비만 가운데 정렬이
   * 사라지고 아트가 칸 왼쪽 위에 붙었다 (장인 장비만 멀쩡해 보였다).
   * 켜고 끄는 것으로 레이아웃이 달라지면 안 된다.
   */
  return (
    <View style={[{ overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
      {active && (
        <Animated.View
          style={[{ pointerEvents: 'none' },
            {
              position: 'absolute',
              top: -size,
              bottom: -size,
              width: Math.max(2, size * 0.07),
              backgroundColor: WHITE,
            },
            sweep,
          ]}
        />
      )}
    </View>
  );
}

/** 같은 화면의 여러 칸이 한꺼번에 번쩍이지 않게 흩뜨리는 지연값 */
export const shineDelay = (i: number) => (i * 370) % 2400;
