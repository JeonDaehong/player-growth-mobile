import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { KV, Row, Sep, T, Tag } from './atoms';
import { BORDER, C, O, SP, WHITE } from './theme';

interface Props {
  visible: boolean;
  title: string;
  /** 우측 상단 뱃지 (예: "미획득") */
  badge?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** 꼬리 방향 — 눌린 칸이 위쪽이면 'up' */
  tail?: 'up' | 'down';
}

/**
 * 말풍선 팝업.
 * 화면 중앙에 띄우고 바깥을 누르면 닫힌다. 꼬리를 달아 "무언가를 눌러서 나온 설명"
 * 이라는 걸 시각적으로 알린다.
 *
 * ⚠ Modal 로 감싸는 게 핵심이다. 화면들이 ScrollView 안이라 그냥 absolute 로 두면
 * 좌표가 **스크롤 콘텐츠 기준**이 되어 뷰포트 밖(콘텐츠 중앙)에 그려진다.
 * Modal 은 스크롤 트리 밖의 오버레이에 렌더된다.
 */
export function InfoBubble({ visible, title, badge, onClose, children, tail = 'up' }: Props) {
  if (!visible) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <View style={[styles.host, { pointerEvents: 'box-none' }]}>
        <Animated.View entering={ZoomIn.duration(150)} style={styles.bubbleWrap}>
          {tail === 'up' && <View style={styles.tailUp} />}
          <View style={styles.bubble}>
            <Row between style={styles.head}>
              <T size={13} bold style={{ flex: 1 }} numberOfLines={1}>{title}</T>
              <Row gap={SP.sm}>
                {!!badge && <Tag label={badge} />}
                <Pressable onPress={onClose} hitSlop={12}>
                  <T size={15} bold>✕</T>
                </Pressable>
              </Row>
            </Row>
            <View style={{ padding: SP.md }}>{children}</View>
          </View>
          {tail === 'down' && <View style={styles.tailDown} />}
        </Animated.View>
      </View>
    </Modal>
  );
}

/** 팝업 안에서 쓰는 단계 목록 */
export function Steps({ items, doneFirst }: { items: string[]; doneFirst?: boolean }) {
  return (
    <View>
      {items.map((s, i) => (
        <Row key={i} gap={SP.sm} style={{ paddingVertical: 3, alignItems: 'flex-start' }}>
          <View
            style={[
              BORDER,
              {
                width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
                backgroundColor: doneFirst && i === 0 ? C.bgInv : 'transparent',
              },
            ]}
          >
            <T size={9} bold style={{ color: doneFirst && i === 0 ? C.fgInv : WHITE }}>{i + 1}</T>
          </View>
          <T size={11} dim="sub" style={{ flex: 1 }}>{s}</T>
        </Row>
      ))}
    </View>
  );
}

export { KV, Sep };

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000D9' },
  host: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SP.lg,
  },
  bubbleWrap: { width: '100%', maxWidth: 360, alignItems: 'center' },
  bubble: {
    width: '100%',
    borderWidth: 2,
    borderColor: WHITE,
    backgroundColor: C.bg,
  },
  head: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: WHITE,
  },
  // 도트 감성에 맞춰 삼각형 대신 계단식 사각형 두 개로 꼬리를 만든다
  tailUp: {
    width: 18, height: 9, backgroundColor: C.bg,
    borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: WHITE,
    marginBottom: -2,
  },
  tailDown: {
    width: 18, height: 9, backgroundColor: C.bg,
    borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: WHITE,
    marginTop: -2,
  },
});
