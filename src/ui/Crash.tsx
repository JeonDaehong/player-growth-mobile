/**
 * 그리다 던지면 여기서 받는다.
 *
 * ## 왜 필요했나
 *
 * 싸우다 말고 화면이 통째로 **회색 한 장**이 되는 일이 있었다. 원인은
 * `BossFx` 의 `Ripple` 이 조건부로 끝나면서 훅을 하나 덜 부른 것이었는데
 * (고쳤다), 정작 문제는 그게 아니라 **받아 주는 데가 없다**는 쪽이었다.
 *
 * React 는 그리는 중에 던지면 그 위로 올라가면서 붙잡을 곳을 찾고, 끝까지
 * 없으면 **루트를 통째로 언마운트한다.** 남는 것은 아무것도 안 그려진 빈
 * 화면 — 사용자가 본 회색이 그거다. 콘솔을 열지 않는 한 무슨 일이
 * 일어났는지 알 방법이 없고, 앱을 껐다 켜는 것 말고 할 수 있는 것도 없다.
 *
 * 여기 한 겹을 두면 셋이 달라진다.
 *   · 화면이 비지 않는다 — 무슨 일이 났는지 한 줄이라도 읽힌다
 *   · **다시 켤 수 있다** — 저장본은 멀쩡하므로 다시 그리면 대개 살아난다
 *   · 메시지가 화면에 남는다 — 폰에서 난 것도 사람이 그대로 옮겨 적을 수 있다
 *
 * ## 이게 버그를 덮지는 않는다
 *
 * 여기까지 온 것은 전부 고쳐야 할 것이다. 그래서 조용히 되살리지 않는다 —
 * 무엇이 났는지 적어 두고, 다시 켜는 것은 **사람이 누른다.** 저절로 되살아나면
 * 매 초 던지는 버그가 눈에 안 띄는 깜빡임이 되어 영영 안 고쳐진다.
 */
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BLACK, MONO, WHITE } from './theme';

type Props = { children: React.ReactNode };
type State = { err: Error | null; info: string };

export class Crash extends React.Component<Props, State> {
  state: State = { err: null, info: '' };

  static getDerivedStateFromError(err: Error): Partial<State> {
    return { err };
  }

  /**
   * 어느 컴포넌트에서 났는지가 스택보다 훨씬 쓸모 있다.
   *
   * 배포본은 함수 이름이 뭉개져 있어 자바스크립트 스택만으로는 아무것도
   * 못 읽는다. React 가 따로 주는 컴포넌트 스택은 이름이 살아 있다.
   */
  componentDidCatch(err: Error, info: React.ErrorInfo) {
    this.setState({ info: info.componentStack ?? '' });
    // 콘솔에도 남긴다 — 열어 볼 수 있는 자리에서는 이쪽이 훨씬 자세하다
    console.error('[crash]', err, info.componentStack);
  }

  render() {
    const { err, info } = this.state;
    if (!err) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: BLACK, padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontFamily: MONO, color: WHITE, fontSize: 15, fontWeight: 'bold' }}>
          화면을 그리다 멈췄습니다
        </Text>
        <Text style={{ fontFamily: MONO, color: WHITE, fontSize: 11, opacity: 0.7, marginTop: 8 }}>
          저장된 것은 그대로입니다. 아래를 누르면 다시 그립니다.
        </Text>

        {/*
          메시지와 컴포넌트 스택. 길어서 접어 두지 않고 스크롤로 둔다 —
          접어 두면 아무도 안 편다.
        */}
        <ScrollView
          style={{
            maxHeight: 220,
            marginTop: 14,
            borderWidth: 1,
            borderColor: WHITE,
            padding: 10,
          }}
        >
          <Text selectable style={{ fontFamily: MONO, color: WHITE, fontSize: 10 }}>
            {String(err?.message || err)}
            {info ? `\n${info.trim()}` : ''}
          </Text>
        </ScrollView>

        <Pressable
          onPress={() => this.setState({ err: null, info: '' })}
          style={({ pressed }) => ({
            marginTop: 16,
            borderWidth: 1,
            borderColor: WHITE,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontFamily: MONO, color: WHITE, fontSize: 13, fontWeight: 'bold' }}>
            다시 그리기
          </Text>
        </Pressable>
      </View>
    );
  }
}
