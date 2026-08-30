import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useGame } from '@/state/store';
import { creatureName } from '@/core/rush';
import { Btn, Row, Sep, T } from './atoms';
import { Money } from './Money';
import { Sprite } from './Sprite';
import { CREATURE_SPRITES } from './sprites';
import { C, SP, WHITE } from './theme';

/**
 * 크리처 러쉬 배팅 결과 알림.
 *
 * 배팅은 5분, 전투는 4분이라 결과가 나올 때 플레이어는 딴 화면에 있기 마련이다.
 * 토스트로는 놓치니 **화면 가운데**에 세운다. 앱 루트에 두어야 어느 탭에서도 뜬다.
 */
/** 아무것도 누르지 않아도 이만큼 뒤에 스스로 닫힌다 */
const AUTO_CLOSE_MS = 30_000;

export function RushResultHost() {
  const r = useGame((s) => s.rushResult);
  const close = useGame((s) => s.clearRushResult);
  const [left, setLeft] = React.useState(AUTO_CLOSE_MS / 1000);

  // 팝업이 뜬 순간부터 카운트. 화면을 가리고 있으므로 스스로 비켜 줘야 한다.
  React.useEffect(() => {
    if (!r) return;
    setLeft(AUTO_CLOSE_MS / 1000);
    const tick = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    const t = setTimeout(close, AUTO_CLOSE_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(t);
    };
    // r.slot 이 바뀔 때만 다시 잡는다 (같은 결과로 타이머가 재시작되면 안 닫힌다)
  }, [r?.slot, close]);

  if (!r) return null;

  const hit = r.on === r.winner;
  const net = r.payout - r.amount;

  return (
    <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(140)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <View style={[styles.host, { pointerEvents: 'box-none' }]}>
        <Animated.View entering={ZoomIn.duration(220)} style={styles.card}>
          <Row between style={styles.head}>
            <T size={12} bold>크리처 러쉬 결과</T>
            <T size={10} dim="dim">{r.special ? '특수 회차 (배당 2배)' : `${r.slot}회차`}</T>
          </Row>

          <View style={{ padding: SP.md }}>
            <T size={10} dim="sub" center>승자</T>
            <View style={{ alignItems: 'center', marginVertical: SP.xs }}>
              <Sprite set="creature" name={r.winner} size={72} fallback={CREATURE_SPRITES[r.winner]} />
              <T size={16} bold>{creatureName(r.winner)}</T>
            </View>

            <Sep />
            <T size={20} bold center>{hit ? '적중!' : '낙첨'}</T>
            <T size={11} dim="sub" center style={{ marginTop: 2 }}>
              {hit ? `${creatureName(r.on)}에 걸었습니다` : `${creatureName(r.on)}에 걸었습니다`}
            </T>

            <Sep />
            <Row between style={{ paddingVertical: 3 }}>
              <T size={12} dim="sub">배팅액</T>
              <Money amount={r.amount} size={12} />
            </Row>
            <Row between style={{ paddingVertical: 3 }}>
              <T size={12} dim="sub">{hit ? '받은 금액' : '잃은 금액'}</T>
              <Money amount={hit ? r.payout : r.amount} size={12} />
            </Row>
            <Sep />
            <Row between>
              <T size={13} bold>손익</T>
              <Row gap={SP.xs}>
                <T size={15} bold>{net >= 0 ? '+' : '-'}</T>
                <Money amount={Math.abs(net)} size={14} />
              </Row>
            </Row>

            <Btn label="확인" size="lg" fill style={{ marginTop: SP.md }} onPress={close} />
            <T size={9} dim="dim" center style={{ marginTop: SP.xs }}>
              {left}초 뒤 자동으로 닫힙니다
            </T>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000E8' },
  host: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SP.lg,
  },
  card: { width: '100%', maxWidth: 340, backgroundColor: C.bg, borderWidth: 2, borderColor: WHITE },
  head: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: WHITE,
  },
});
