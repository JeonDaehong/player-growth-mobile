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
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useGame } from '@/state/store';
import { Btn, Row, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { sfx, startBgm } from '@/ui/sfx';
import { BORDER, C, FS, LINE, SP, SURF } from '@/ui/theme';

export function SettingsPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const bgmOn = useGame((s) => s.bgmOn);
  const setBgmOn = useGame((s) => s.setBgmOn);
  const sfxOn = useGame((s) => s.sfxOn);
  const setSfxOn = useGame((s) => s.setSfxOn);
  const redeemCoupon = useGame((s) => s.redeemCoupon);
  /** 친 코드 — 성공하면 비운다 */
  const [code, setCode] = useState('');

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

      {/*
        ── 쿠폰 ── 설정 안에 둔다.

        따로 화면을 낼 만한 일이 아니다. 한 번 치고 마는 것이고, 그 한 번을
        위해 아래 띠에 칸을 내주면 늘 보이는 자리를 가끔 쓰는 일이 차지한다.

        소리 설정 아래에 줄을 긋고 둔다 — 위와 성격이 다른 일이라 한 덩어리로
        읽히면 안 된다.
      */}
      <View style={{ height: 1, backgroundColor: LINE.low, marginBottom: SP.sm }} />
      <T size={FS.title} bold style={{ marginBottom: SP.xs }}>쿠폰</T>
      <Row gap={SP.xs}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="코드를 입력하세요"
          placeholderTextColor={LINE.mid}
          autoCapitalize="none"
          autoCorrect={false}
          /*
            **엔터로도 넣는다.** 칸에 치고 나면 손가락이 이미 자판에 있으므로,
            거기서 확인 키를 누르는 것이 옆 단추까지 가는 것보다 짧다.
          */
          returnKeyType="done"
          onSubmitEditing={() => { if (redeemCoupon(code) === 'ok') setCode(''); }}
          style={[
            BORDER,
            {
              flex: 1,
              paddingVertical: SP.xs,
              paddingHorizontal: SP.sm,
              color: C.fg,
              fontSize: FS.body,
              backgroundColor: SURF.down,
            },
          ]}
        />
        <Btn
          label="등록"
          size="sm"
          fill
          disabled={!code.trim()}
          onPress={() => {
            sfx('tap');
            if (redeemCoupon(code) === 'ok') setCode('');
          }}
        />
      </Row>
      <T size={9} dim="dim" style={{ marginTop: SP.xs, marginBottom: SP.sm }}>
        대소문자와 띄어쓰기는 가리지 않습니다.
      </T>

      <Btn label="닫기" onPress={onClose} fill />
    </Popup>
  );
}
