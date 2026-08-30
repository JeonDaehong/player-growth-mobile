import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useFeed } from '@/state/live';
import type { FeedEvent } from '@/core/feed';
import { Panel, Row, T } from './atoms';
import { C, O, SP, WHITE } from './theme';

const SHOWN = 8;

function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 10) return '방금';
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  return `${Math.floor(m / 60)}시간 전`;
}

/**
 * 살아 있다는 신호 — **천천히 숨쉬는** 점.
 *
 * 예전엔 0.9초마다 1 ↔ 0.15 로 깜빡였다. 홈 화면에 늘 떠 있는 것이라 끊임없이
 * 시야 구석에서 점멸했고, 그게 피로로 쌓였다 (플래시 연출과 같은 지적을 받았다).
 *
 * 지금은 1 ↔ 0.55 로 두 배 느리게 오간다. "멈춰 있지 않다" 는 신호는 그대로지만
 * 시선을 잡아채지는 않는다 — 이 점이 하는 일은 알림이 아니라 안심이다.
 */
function LiveDot() {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.55, { duration: 1800 }), -1, true);
  }, [o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 6, height: 6, backgroundColor: WHITE }, st]} />;
}

export function EventFeed() {
  const events = useFeed((s) => s.events);
  const loaded = useFeed((s) => s.loaded);
  const [now, setNow] = React.useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <Panel
      title="실시간"
      right={
        <Row gap={SP.xs}>
          <LiveDot />
          <T size={10} dim="sub">LIVE</T>
        </Row>
      }
    >
      {/*
        빈 피드에 "잠시 후 올라옵니다" 라고 적어 두면 거짓말이 된다 —
        지어내는 게 없으니 아무도 아무것도 안 하면 정말로 아무것도 안 올라온다.
      */}
      {!events.length && (
        <T size={11} dim="dim">
          {loaded
            ? '아직 아무 일도 없었습니다. 누가 강화에 성공하면 여기 뜹니다.'
            : '소식을 받아오는 중…'}
        </T>
      )}
      {events.slice(0, SHOWN).map((e, i) => (
        <FeedRow key={e.id} event={e} now={now} fresh={i === 0} />
      ))}
    </Panel>
  );
}

function FeedRow({ event, now, fresh }: { event: FeedEvent; now: number; fresh: boolean }) {
  const inverted = event.hot;
  return (
    <Animated.View
      entering={fresh ? FadeInDown.duration(220) : undefined}
      style={{
        paddingVertical: 5,
        paddingHorizontal: inverted ? 6 : 0,
        marginBottom: 2,
        backgroundColor: inverted ? C.bgInv : 'transparent',
      }}
    >
      <Row between gap={SP.sm}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {event.mine && (
            <View style={{ borderWidth: 1, borderColor: inverted ? C.fgInv : WHITE, paddingHorizontal: 3 }}>
              <T size={8} bold style={{ color: inverted ? C.fgInv : WHITE }}>나</T>
            </View>
          )}
          <T
            size={11}
            numberOfLines={2}
            style={{ color: inverted ? C.fgInv : WHITE, opacity: inverted ? 1 : O.sub, flex: 1 }}
          >
            {event.text}
          </T>
        </View>
        <T size={9} style={{ color: inverted ? C.fgInv : WHITE, opacity: inverted ? 0.7 : O.dim }}>
          {timeAgo(event.at, now)}
        </T>
      </Row>
    </Animated.View>
  );
}
