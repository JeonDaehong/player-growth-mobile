import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useGame } from '@/state/store';
import { ATTENDANCE_REWARD, dayKey } from '@/core/events';
import { fmt } from '@/core/currency';
import { Btn, Row, Sep, T, Tag } from './atoms';
import { Sprite } from './Sprite';
import { C, O, SP, WHITE } from './theme';
import { sfx } from './sfx';
import { useTutorialRunning } from './Tutorial';

/**
 * 이벤트 안내 팝업 — 게임을 켜면 한 번 뜬다.
 *
 * 이벤트를 기타 탭 안쪽에만 두면 아무도 모른다. 그렇다고 켤 때마다 띄우면
 * 사흘이면 짜증이 난다. 그래서 두 개의 문을 준다:
 *   · **닫기** — 이번만 안 본다. 다음에 켜면 다시 뜬다.
 *   · **하루동안 보지 않기** — 24시간 동안 안 뜬다.
 *
 * "다시 보지 않기(영구)" 는 일부러 안 만들었다. 이벤트는 바뀌는 물건이라
 * 영구히 끄면 다음 이벤트도 같이 묻힌다.
 *
 * 세션당 한 번만 뜬다 — 탭을 옮길 때마다 다시 뜨면 안 되므로 모듈 변수로 잠근다.
 * (앱을 껐다 켜면 모듈이 다시 로드되어 자연히 풀린다)
 */
let shownThisSession = false;

export function EventPopupHost() {
  const signedUp = useGame((s) => s.signedUp);
  const hideUntil = useGame((s) => s.eventPopupHideUntil);
  const hide = useGame((s) => s.hideEventPopup);
  const attendance = useGame((s) => s.attendance);
  const check = useGame((s) => s.checkAttendance);
  const [open, setOpen] = useState(false);
  const tutorialRunning = useTutorialRunning();

  useEffect(() => {
    if (!signedUp || shownThisSession) return;
    if (Date.now() < hideUntil) return;
    /*
      튜토리얼이 떠 있으면 기다린다. 처음 켠 사람에게는 이벤트보다 조작이 먼저고,
      두 오버레이가 겹치면 뒤에 뜬 쪽이 앞엣것을 통째로 가린다 (실제로 그랬다).
      튜토리얼이 닫히면 이 훅이 다시 돌아 그때 뜬다.
    */
    if (tutorialRunning) return;
    // 첫 화면이 자리를 잡은 뒤에 얹는다
    const t = setTimeout(() => {
      shownThisSession = true;
      setOpen(true);
      sfx('open');
    }, 900);
    return () => clearTimeout(t);
  }, [signedUp, hideUntil, tutorialRunning]);

  if (!open) return null;

  const claimed = attendance.lastDay === dayKey(Date.now());
  const close = (days: number) => {
    sfx('click');
    hide(days);
    setOpen(false);
  };

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => close(0)}>
      <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close(0)} />
      </Animated.View>

      <View style={styles.host} pointerEvents="box-none">
        <Animated.View entering={ZoomIn.duration(180)} style={styles.sheet}>
          <Row between style={styles.head}>
            <T size={10} dim="sub">진행 중인 이벤트</T>
            <Tag label="진행중" fill />
          </Row>

          <View style={{ padding: SP.md }}>
            <Row gap={SP.md} style={{ alignItems: 'flex-start' }}>
              {/* 전용 배너(assets/sprites/event)가 들어오면 자동으로 갈아탄다 */}
              <View style={styles.art}>
                <Sprite
                  set="event"
                  name="attend"
                  size={52}
                  fallbackSet="attend"
                  fallbackName={claimed ? 'stamp_check' : 'cal_today'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <T size={16} bold>출석체크 이벤트</T>
                <T size={11} dim="sub" style={{ marginTop: 2, lineHeight: 16 }}>
                  하루 한 번 출석하면 {fmt(ATTENDANCE_REWARD)}를 드립니다.
                </T>
              </View>
            </Row>

            <Sep />

            <Row between>
              <T size={11} dim="sub">연속 출석</T>
              <T size={11} bold>{attendance.streak}일</T>
            </Row>
            <Row between style={{ marginTop: 2 }}>
              <T size={11} dim="sub">오늘</T>
              <T size={11} bold dim={claimed ? 'sub' : 'full'}>
                {claimed ? '출석 완료' : '아직 안 함'}
              </T>
            </Row>

            {/*
              팝업 안에서 바로 출석하게 둔다. 안내만 하고 "기타 탭으로 가세요" 라고 하면
              절반은 가다가 잊는다 — 알림과 행동 사이에 화면을 끼우지 않는다.
            */}
            <Btn
              label={claimed ? '오늘은 출석 완료' : '지금 출석하기'}
              size="lg"
              fill={!claimed}
              disabled={claimed}
              sound="coin"
              style={{ marginTop: SP.md }}
              onPress={() => { check(); }}
            />
            <T size={9} dim="dim" center style={{ marginTop: SP.xs }}>
              자정이 지나면 다시 출석할 수 있습니다
            </T>

            <Row gap={SP.sm} style={{ marginTop: SP.md }}>
              <Btn label="하루동안 보지 않기" size="sm" sound="click" style={{ flex: 3 }} onPress={() => close(1)} />
              <Btn label="닫기" size="sm" sound="click" style={{ flex: 2 }} onPress={() => close(0)} />
            </Row>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000E6' },
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
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: WHITE,
  },
  head: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: WHITE,
  },
  art: {
    borderWidth: 1,
    borderColor: WHITE,
    padding: SP.sm,
  },
});
