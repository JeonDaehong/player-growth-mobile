import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Row, T } from './atoms';
import { C, LINE, R, SP, SURF } from './theme';
import { sfx } from './sfx';
import { useBackClose } from './backGuard';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  right?: React.ReactNode;
  /** 팝업 위에 전체화면으로 얹을 연출 (강화 플래시 등). 터치는 통과한다. */
  overlay?: React.ReactNode;
}

/**
 * 액션 팝업.
 *
 * 버튼을 누르면 화면 **아래쪽에 패널이 펼쳐지는** 방식은 스크롤을 내려야 보이고
 * 지금 뭘 하는 중인지도 흐려진다. 액션은 팝업으로 띄운다.
 *
 * 위치는 **화면 가운데**다. 아래에서 올라오는 시트는 손가락이 닿기는 좋지만
 * 시선이 화면 아래로 쏠려 내용을 읽기 불편하다.
 *
 * ⚠ Modal 로 감싸는 게 핵심이다. 화면들이 ScrollView 안이라 그냥 absolute 로 두면
 * 좌표가 스크롤 콘텐츠 기준이 되어 뷰포트 밖에 그려진다.
 */
export function Popup({ visible, title, onClose, children, right, overlay }: Props) {
  // 팝업이 뜨는 순간 가죽 표지가 열리는 소리. 닫을 때는 내지 않는다 —
  // 열고 닫기를 반복할 때 소리가 두 배로 나면 금방 성가시다.
  useEffect(() => {
    if (visible) sfx('open');
  }, [visible]);
  /*
    휴대폰의 뒤로가기로도 닫힌다.

    `Modal` 의 `onRequestClose` 는 안드로이드 네이티브에서만 불린다 — 웹으로
    올린 이 게임에서는 아무도 안 부르고, 뒤로가기가 곧 앱 종료였다.
    `useBackClose` 가 방문 기록을 하나 쌓아서 그 눌림을 받아 낸다.
  */
  useBackClose(visible, onClose);
  if (!visible) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(120)}
        exiting={FadeOut.duration(120)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <View style={[styles.host, { pointerEvents: 'box-none' }]}>
        {/*
          바깥을 눌러도 닫힌다.

          닫기 판정을 배경(backdrop)에만 두면 `pointerEvents: 'box-none'` 이
          제대로 먹는 플랫폼에서만 동작한다 — 한 겹이라도 어긋나면 시트 밖을 눌러도
          아무 일이 안 일어나고, 그러면 ✕ 를 정확히 찍는 수밖에 없다.
          시트와 **같은 층에** 전체화면 닫기 판을 깔아 두면 그 의존이 사라진다.
        */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={ZoomIn.duration(160)}
          exiting={ZoomOut.duration(120)}
          style={styles.sheet}
        >
          <Row between style={styles.head}>
            <T size={14} bold style={{ flex: 1 }} numberOfLines={1}>{title}</T>
            <Row gap={SP.sm}>
              {right}
              <Pressable onPress={onClose} hitSlop={12}>
                <T size={16} bold>✕</T>
              </Pressable>
            </Row>
          </Row>
          <ScrollView
            style={{ maxHeight: '100%' }}
            contentContainerStyle={{ padding: SP.md }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>

      {/* 연출은 시트 위·전체화면. Modal 안이라 좌표가 뷰포트 기준이 된다. */}
      {!!overlay && (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>{overlay}</View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000E0' },
  host: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SP.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '82%',
    backgroundColor: C.bg,
    /*
      2px 순백 테두리에서 1px 로 내렸다. 창은 이미 어두운 판 위에 홀로 떠
      있어서 (`host`) 경계를 굵게 그을 이유가 없었고, 굵은 흰 테두리는
      그 자체로 화면에서 제일 밝은 것이 되어 안에 적힌 내용을 눌렀다.

      모서리를 둥글게 잘라 내므로 (`R.lg`) 안쪽 머리말이 귀로 삐져나오지
      않게 `overflow` 도 같이 준다.
    */
    borderWidth: 1,
    borderColor: LINE.hi,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  head: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    borderBottomWidth: 1,
    /* 머리말 밑줄은 **칸막이**다 — 바깥 테두리와 같은 밝기면 창이 둘로 갈린다 */
    borderBottomColor: LINE.low,
    backgroundColor: SURF.up,
  },
});
