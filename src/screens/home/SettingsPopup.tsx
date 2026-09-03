/**
 * ── 설정 ── 소리 두 개.
 *
 * 위 띠의 문 여섯 중 **이것만 실제로 열린다** (나머지는 준비중이다). 이유는
 * 하나: 배경음 스위치가 예전에 홈 화면 머리말에 붙어 있었고, 새 뼈대에서 그
 * 머리말이 통째로 사라졌다. 갈 데가 없는 스위치를 없애 버리면 켠 사람이 끌
 * 방법이 없다.
 *
 * 나중에 진짜 설정 화면이 들어오면 이 파일은 그쪽으로 옮겨 가면 된다.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { Btn, Row, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { startBgm } from '@/ui/sfx';
import { SP } from '@/ui/theme';

export function SettingsPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const bgmOn = useGame((s) => s.bgmOn);
  const setBgmOn = useGame((s) => s.setBgmOn);
  const sfxOn = useGame((s) => s.sfxOn);
  const setSfxOn = useGame((s) => s.setSfxOn);

  return (
    <Popup visible={visible} title="설정" onClose={onClose}>
      <View style={{ gap: SP.sm, paddingBottom: SP.sm }}>
        <Row between>
          <T size={12}>배경음</T>
          {/*
            **끄고 켜는 것 말고 `startBgm()` 을 한 번 더 부른다.**

            브라우저는 사람이 직접 누르기 전에는 소리를 못 내게 막는다. 앱이
            뜨자마자 부르는 `startBgm()` 은 그래서 조용히 실패하고, 그 뒤로는
            상태만 "켜짐" 이라 아무리 기다려도 안 나온다. 이 단추를 누르는
            것이 곧 그 "직접 누름" 이므로 여기서 한 번 더 건다.
          */}
          <Btn
            label={bgmOn ? '켜짐' : '꺼짐'}
            size="sm"
            fill={bgmOn}
            onPress={() => { setBgmOn(!bgmOn); if (!bgmOn) startBgm(); }}
          />
        </Row>
        <Row between>
          <T size={12}>효과음</T>
          <Btn
            label={sfxOn ? '켜짐' : '꺼짐'}
            size="sm"
            fill={sfxOn}
            onPress={() => setSfxOn(!sfxOn)}
          />
        </Row>
      </View>
      <Btn label="닫기" onPress={onClose} fill />
    </Popup>
  );
}
