import React from 'react';
import {
  Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useGame } from '@/state/store';
import { LotteryResult, prizeOf } from '@/core/lottery';
import { Btn, Row, Sep, T } from './atoms';
import { Money } from './Money';
import { Sprite } from './Sprite';
import { C, SP, WHITE } from './theme';

/**
 * 복권 추첨 결과 알림.
 *
 * 추첨은 매일 오후 8시에 저 혼자 일어난다. 사 두고 딴 화면에 있으면 토스트 한 줄로
 * 지나가 버려서, 샀다는 사실조차 잊는다. 러쉬 결과와 같은 무게로 화면 가운데에 세운다.
 * 여러 장이면 옆으로 넘겨 한 장씩 확인한다.
 */
const AUTO_CLOSE_MS = 60_000;
/** 카드 한 장의 폭 — 페이징 계산과 레이아웃이 같은 값을 써야 한다 */
const CARD_W = 300;

export function LotteryResultHost() {
  const results = useGame((s) => s.lotteryResult);
  const close = useGame((s) => s.clearLotteryResult);
  const [page, setPage] = React.useState(0);
  const [left, setLeft] = React.useState(AUTO_CLOSE_MS / 1000);

  const n = results?.length ?? 0;
  const key = results?.[0]?.id;

  React.useEffect(() => {
    if (!n) return;
    setPage(0);
    setLeft(AUTO_CLOSE_MS / 1000);
    const tick = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    const t = setTimeout(close, AUTO_CLOSE_MS);
    return () => { clearInterval(tick); clearTimeout(t); };
    // 같은 배치로 타이머가 재시작되면 영영 안 닫힌다 — 첫 장의 id 로만 묶는다
  }, [key, n, close]);

  if (!results || !results.length) return null;

  const won = results.reduce((a, r) => a + r.prize, 0);
  const hits = results.filter((r) => r.rank !== null).length;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / CARD_W));
  };

  return (
    <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(140)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <View style={[styles.host, { pointerEvents: 'box-none' }]}>
        <Animated.View entering={ZoomIn.duration(220)} style={styles.card}>
          <Row between style={styles.head}>
            <T size={12} bold>복권 추첨 결과</T>
            <T size={10} dim="dim">{n}장 중 {hits}장 당첨</T>
          </Row>

          {n > 1 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScroll}
              /* 페이징은 카드 폭 단위로만 멈춰야 장이 반쯤 걸치지 않는다 */
              snapToInterval={CARD_W}
              decelerationRate="fast"
              style={{ width: CARD_W }}
            >
              {results.map((r) => <TicketCard key={r.id} r={r} />)}
            </ScrollView>
          ) : (
            <TicketCard r={results[0]} />
          )}

          <View style={{ paddingHorizontal: SP.md, paddingBottom: SP.md }}>
            {n > 1 && (
              <>
                <Row gap={4} style={{ justifyContent: 'center', marginBottom: SP.sm }}>
                  {results.map((r, i) => (
                    <View
                      key={r.id}
                      style={{
                        width: 6, height: 6,
                        borderWidth: 1, borderColor: WHITE,
                        backgroundColor: i === page ? WHITE : 'transparent',
                      }}
                    />
                  ))}
                </Row>
                <T size={10} dim="dim" center style={{ marginBottom: SP.xs }}>
                  {page + 1} / {n} · 옆으로 넘겨 보세요
                </T>
                <Sep />
                <Row between style={{ paddingVertical: 3 }}>
                  <T size={13} bold>당첨금 합계</T>
                  <Money amount={won} size={14} />
                </Row>
              </>
            )}
            <Btn label="확인" size="lg" fill style={{ marginTop: SP.sm }} onPress={close} />
            <T size={9} dim="dim" center style={{ marginTop: SP.xs }}>
              {left}초 뒤 자동으로 닫힙니다
            </T>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** 표 한 장 */
function TicketCard({ r }: { r: LotteryResult }) {
  const hit = r.rank !== null;
  return (
    <View style={{ width: CARD_W, padding: SP.md }}>
      <View style={{ alignItems: 'center' }}>
        <Sprite
          set="lottery"
          name={hit ? 'ticket_clover' : 'ticket_plain'}
          fallbackName="ticket_clover"
          size={64}
          opacity={hit ? 1 : 0.45}
        />
        <T size={22} bold center style={{ marginTop: SP.xs }}>
          {hit ? `${prizeOf(r.rank!).label} 당첨!` : '낙첨'}
        </T>
      </View>

      <Sep />
      <Row between style={{ paddingVertical: 3 }}>
        <T size={12} dim="sub">번호</T>
        <T size={12} bold>{r.serial}</T>
      </Row>
      <Row between style={{ paddingVertical: 3 }}>
        <T size={12} dim="sub">회차</T>
        <T size={12}>{r.drawKey}</T>
      </Row>
      <Row between style={{ paddingVertical: 3 }}>
        <T size={12} dim="sub">당첨금</T>
        {hit ? <Money amount={r.prize} size={12} /> : <T size={12} dim="faint">없음</T>}
      </Row>
    </View>
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
  card: { width: CARD_W, backgroundColor: C.bg, borderWidth: 2, borderColor: WHITE },
  head: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: WHITE,
  },
});
