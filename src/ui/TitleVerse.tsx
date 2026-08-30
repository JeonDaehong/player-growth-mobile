/**
 * 타이틀 화면 명구 — RPG 대사창의 호흡.
 *
 * 공지처럼 두 줄을 통째로 띄워 두면 아무도 안 읽는다. 눈이 "안내문"으로 분류하고
 * 넘겨 버리기 때문이다. 그래서 **한 글자씩 찍는다** — 글자가 움직이는 동안에는
 * 시선이 붙들리고, 다 찍힌 문장은 이미 읽은 문장이 된다.
 *
 * 구성 요소는 셋뿐이고 전부 대사창에서 가져왔다.
 *   · 한 글자씩 타이핑 · 줄이 바뀔 때 한 박자 쉼 · 깜박이는 블록 커서
 *
 * 커서는 글자(▌)가 아니라 **배경을 칠한 공백**이다. 안드로이드 monospace 에
 * 블록 문자가 없으면 두부(￭)가 뜨는데, 배경색은 폰트를 안 탄다.
 *
 * 누르면 건너뛴다 — 찍는 중이면 즉시 다 보여주고, 다 찍혔으면 다음 명구로.
 * (대사창을 연타해 본 사람이라면 이 동작을 이미 알고 있다)
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { VERSES, firstVerse, nextVerse } from '@/core/verses';
import { O, SP, WHITE, font } from './theme';

/** 한 글자 찍는 간격. 한글은 정보 밀도가 높아 영문보다 느려야 읽힌다 */
const TYPE_MS = 55;
/** 줄이 바뀌는 자리의 쉼 — 여기서 안 쉬면 두 줄이 한 문장으로 뭉친다 */
const LINE_PAUSE_MS = 420;
/** 다 찍힌 뒤 머무는 시간 — 두 줄을 다시 한 번 훑을 만큼 */
const HOLD_MS = 5200;
const FADE_IN_MS = 420;
const FADE_OUT_MS = 380;
const BLINK_MS = 480;

/** 글자 크기와 줄 높이. 높이를 고정해야 타이핑 중에 아래 버튼이 안 밀린다 */
const SIZE = 12;
const LINE_H = 20;

/** 깜박이는 블록 커서 */
function Caret() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setOn((v) => !v), BLINK_MS);
    return () => clearInterval(iv);
  }, []);
  // 공백 한 칸에 배경을 칠한다 — 폰트에 블록 문자가 없어도 안전하다
  return <Text style={{ backgroundColor: on ? WHITE : 'transparent' }}> </Text>;
}

/** 가운데 마름모를 둔 가는 구분선 — 문구를 "화면의 일부"로 만들어 주는 액자 */
function Rule() {
  const bar = { width: 26, height: 1, backgroundColor: WHITE, opacity: O.faint } as const;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SP.sm }}>
      <View style={bar} />
      <View
        style={{
          width: 5, height: 5, backgroundColor: WHITE,
          opacity: O.dim, transform: [{ rotate: '45deg' }],
        }}
      />
      <View style={bar} />
    </View>
  );
}

export function TitleVerse() {
  const [idx, setIdx] = useState(firstVerse);
  const [shown, setShown] = useState(0);
  const opacity = useSharedValue(0);

  const [l1, l2] = VERSES[idx];
  const total = l1.length + l2.length;

  // 새 명구 — 처음부터 다시 찍고 서서히 들어온다
  useEffect(() => {
    setShown(0);
    opacity.value = withTiming(1, { duration: FADE_IN_MS });
  }, [idx, opacity]);

  // 한 글자씩
  useEffect(() => {
    if (shown >= total) return;
    const gap = shown === l1.length ? LINE_PAUSE_MS : TYPE_MS;
    const t = setTimeout(() => setShown((n) => n + 1), gap);
    return () => clearTimeout(t);
  }, [shown, total, l1.length]);

  // 다 찍혔으면 머물다 사라지고 다음 명구로
  useEffect(() => {
    if (shown < total) return;
    let out: ReturnType<typeof setTimeout> | undefined;
    const hold = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_OUT_MS });
      out = setTimeout(() => setIdx((i) => nextVerse(i)), FADE_OUT_MS);
    }, HOLD_MS);
    return () => { clearTimeout(hold); if (out) clearTimeout(out); };
  }, [shown, total, opacity]);

  const skip = useCallback(() => {
    // 찍는 중이면 즉시 다 보여주고, 이미 다 봤으면 다음 장으로 넘긴다
    if (shown < total) setShown(total);
    else setIdx((i) => nextVerse(i));
  }, [shown, total]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const a = l1.slice(0, Math.min(shown, l1.length));
  const b = l2.slice(0, Math.max(0, shown - l1.length));
  const caretOnFirst = shown < l1.length;

  const line: TextStyle = { ...font(SIZE), lineHeight: LINE_H, textAlign: 'center', opacity: O.sub };

  return (
    <Pressable onPress={skip} style={{ alignItems: 'center', marginTop: SP.md }}>
      <Rule />
      <Animated.View
        style={[
          fade,
          // 두 줄 높이를 미리 잡아 둔다 — 안 그러면 글자가 늘 때마다 버튼이 출렁인다
          { minHeight: LINE_H * 2, justifyContent: 'center', marginTop: SP.sm },
        ]}
      >
        <Text style={line}>{a}{caretOnFirst && <Caret />}</Text>
        <Text style={line}>{b}{!caretOnFirst && <Caret />}</Text>
      </Animated.View>
    </Pressable>
  );
}
