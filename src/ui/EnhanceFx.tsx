import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { WHITE } from './theme';
import { Sprite } from './Sprite';
import { sprite } from './spriteAssets';
import { sfx } from './sfx';

export type FxKind = 'success' | 'fail' | 'downgrade' | 'destroy' | 'promote' | 'forge' | null;

/**
 * 강화 결과 연출 (기획서 §4-4)
 *  성공·승급·제련 → 터지는 스프라이트 (assets/sprites/fx 의 burst)
 *  파괴          → 화면 흔들림 + 파편
 *  하락          → 짧은 흔들림 + 연기
 * 화면 전체를 덮는 오버레이라 pointerEvents="none" 이 필수다.
 *
 * ## ⚠ 화면 전체를 덮는 백색 플래시는 없앴다
 *
 * 예전에는 결과마다 화면을 하얗게 덮었다 — 성공은 한 번, 승급은 3연속, 제련은
 * 5연속, 파괴는 2연속. **그게 눈뽕이었다.** 한 번은 시원하지만 강화는 연속으로
 * 스무 번씩 하는 일이라, 흰 화면이 계속 번쩍이면 그냥 아프다.
 * (밝기를 0.95 → 0.55 로 낮춰 봤지만 그걸로는 부족했다.)
 *
 * 지금은 **번쩍임 대신 터짐**으로 말한다. 스프라이트가 사건의 크기를 그리고,
 * 흔들림이 무게를 얹고, 소리가 마무리한다 — 화면 밝기는 건드리지 않는다.
 * 결과를 구분하는 정보는 하나도 안 줄었다.
 *
 * 새 연출을 넣을 때도 `StyleSheet.absoluteFill` 을 흰색으로 덮지 말 것.
 */
export function EnhanceFx({ kind, nonce }: { kind: FxKind; nonce: number }) {
  const shake = useSharedValue(0);
  const shard = useSharedValue(0);

  useEffect(() => {
    if (!kind) return;
    /*
      소리는 연출과 같은 자리에서 낸다. 호출부(HomeScreen · 장인의집)마다 따로 부르면
      한 곳을 고칠 때 다른 곳이 조용해진다 — 실제로 화면이 늘 때마다 그랬다.
    */
    sfx(kind === 'success' ? 'success'
      : kind === 'destroy' ? 'break'
        : kind === 'promote' || kind === 'forge' ? 'forge'
          : 'fail');
    /*
      성공·승급은 스프라이트(burst)와 소리만으로 말한다. 화면을 흔들지도 않는다 —
      제일 자주 나는 결과라 여기에 뭘 더 얹으면 그게 바로 피로가 된다.
    */
    if (kind === 'forge') {
      /*
        제련은 이 게임에서 가장 큰 사건이다 — 등반 50여 회를 모아 만든 무구가
        나오는 순간이다. 망치질처럼 짧게 흔들어 "두드려 만든다" 는 감각을 얹는다.
      */
      shake.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 55, easing: Easing.linear }),
          withTiming(5, { duration: 55, easing: Easing.linear }),
        ),
        5,
        true,
      );
    } else if (kind === 'destroy') {
      shake.value = withRepeat(
        withSequence(
          withTiming(-9, { duration: 42, easing: Easing.linear }),
          withTiming(9, { duration: 42, easing: Easing.linear }),
        ),
        7,
        true,
      );
      shard.value = withSequence(withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 }));
    } else if (kind === 'downgrade') {
      shake.value = withRepeat(withSequence(withTiming(-4, { duration: 50 }), withTiming(4, { duration: 50 })), 3, true);
    }
    return () => {
      shake.value = 0;
    };
  }, [kind, nonce, shake, shard]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  // 파편 8조각이 사방으로 튄다
  const shards = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const st = useAnimatedStyle(() => ({
      opacity: shard.value > 0 ? 1 - shard.value : 0,
      transform: [
        { translateX: Math.cos(angle) * 120 * shard.value },
        { translateY: Math.sin(angle) * 120 * shard.value },
        { scale: 1 - shard.value * 0.5 },
      ],
    }));
    return <Animated.View key={i} style={[styles.shard, st]} />;
  });

  if (!kind) return null;

  // 아트가 있으면 프레임 애니메이션을, 없으면 기존 도형 파편으로
  const seq = FX_SEQ[kind];

  return (
    <Animated.View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, shakeStyle]}>
      {seq ? (
        <View style={styles.shardHost}>
          <FxFrames prefix={seq} nonce={nonce} />
        </View>
      ) : (
        kind === 'destroy' && <View style={styles.shardHost}>{shards}</View>
      )}
    </Animated.View>
  );
}

/** 결과 → 이펙트 시퀀스 (assets/sprites/fx). 없으면 undefined */
const FX_SEQ: Partial<Record<Exclude<FxKind, null>, string>> = {
  success: 'burst',
  promote: 'burst',
  forge: 'burst',
  destroy: 'shatter',
  downgrade: 'smoke',
};

/** 5프레임을 순서대로 재생. 마지막 프레임 뒤에는 사라진다. */
function FxFrames({ prefix, nonce }: { prefix: string; nonce: number }) {
  const [i, setI] = React.useState(0);
  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI((v) => v + 1), 90);
    return () => clearInterval(t);
  }, [prefix, nonce]);

  const name = `${prefix}_${i + 1}`;
  if (i >= 5 || !sprite('fx', name)) return null;
  return <Sprite set="fx" name={name} size={220} />;
}

const styles = StyleSheet.create({
  shardHost: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  shard: { position: 'absolute', width: 8, height: 8, backgroundColor: WHITE },
});

/** 차오르다 멈추는 강화 게이지 (§4-4) */
export function ChargeGauge({ running, blocks = 24 }: { running: boolean; blocks?: number }) {
  const p = useSharedValue(0);

  useEffect(() => {
    if (running) {
      // 빠르게 차오르다 → 막판에 느려지며 "멈칫" — 긴장감의 정체
      p.value = 0;
      p.value = withSequence(
        withTiming(0.72, { duration: 380, easing: Easing.out(Easing.cubic) }),
        withTiming(0.86, { duration: 300, easing: Easing.linear }),
        withTiming(1, { duration: 420, easing: Easing.in(Easing.quad) }),
      );
    } else {
      p.value = withTiming(0, { duration: 180 });
    }
  }, [running, p]);

  return (
    <View style={{ flexDirection: 'row', gap: 1, height: 12 }}>
      {Array.from({ length: blocks }, (_, i) => (
        <Block key={i} index={i} total={blocks} progress={p} />
      ))}
    </View>
  );
}

function Block({ index, total, progress }: { index: number; total: number; progress: { value: number } }) {
  const st = useAnimatedStyle(() => ({
    opacity: progress.value * total >= index + 1 ? 1 : 0.18,
  }));
  return <Animated.View style={[{ flex: 1, backgroundColor: WHITE }, st]} />;
}
