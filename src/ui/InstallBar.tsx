/**
 * "홈 화면에 추가" 한 줄 — **켜자마자 바 없이 시작하는 유일한 길.**
 *
 * ## 왜 필요한가
 *
 * 브라우저 탭에서는 위아래 시스템 바가 그대로 남는다. 한동안 첫 탭에
 * `requestFullscreen` 을 걸어 치웠는데, 그건 **누른 사람이 시킨 일이
 * 아니어서** 뺐다 (`ui/webViewport` 에 자세히 적어 뒀다).
 *
 * **설치된 앱은 다르다.** `manifest` 의 `display: fullscreen` 은 뜨는
 * 순간부터 적용되므로, 홈 화면 아이콘으로 들어가면 첫 프레임부터 바가 없다.
 * 가로채기가 아니라 **사용자가 그러기로 고른 결과**라는 점이 다르다 — 그게
 * 이 줄이 존재하는 이유 전부다.
 *
 * ## 브라우저가 제안을 안 줘도 뜬다
 *
 * 처음엔 크롬의 `beforeinstallprompt` 가 왔을 때만 띄웠다. 그런데 그 이벤트는
 * **안 오는 경우가 흔하다** — 사파리에는 아예 없고, 크롬도 제 판단으로 안 줄
 * 때가 있다. 그러면 설치가 유일한 답인 상황에서 안내가 통째로 사라진다.
 *
 * 그래서 손가락 기기이고 · 설치된 채가 아니고 · 닫지 않았으면 **언제나**
 * 띄운다. 제안이 잡혀 있으면 단추 한 번으로 끝나고, 없으면 메뉴에서 어떻게
 * 하는지를 적어 준다.
 *
 * ## 언제 안 뜨나
 *
 *   이미 설치해서 실행 중   — 할 일이 끝났다. 바가 이미 없다
 *   손가락 기기가 아니다     — 데스크톱에는 없앨 바가 없다
 *   사용자가 닫았다         — 다시 안 띄운다 (기기에 기억한다)
 */
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  askInstall, canInstall, installed, touchDevice, watchInstall,
} from './webViewport';
import { T } from './atoms';
import { BLACK, SP, WHITE } from './theme';

/**
 * 닫은 것을 기억하는 자리.
 *
 * 게임 저장본에 안 넣는다. 이건 **이 기기의 이 브라우저**에 대한 사실이지
 * 계정에 대한 사실이 아니라서다 — 폰에서 닫았다고 PC 에서도 숨으면 안 된다.
 */
const HIDDEN = 'pg-install-hidden';

const stowed = (): boolean => {
  try {
    return localStorage.getItem(HIDDEN) === '1';
  } catch {
    /* 저장이 막힌 브라우저(시크릿 창 등) — 그냥 안 기억한다 */
    return false;
  }
};

const stow = () => {
  try {
    localStorage.setItem(HIDDEN, '1');
  } catch {
    /* 위와 같다 */
  }
};

export function InstallBar() {
  /*
    설치 제안은 앱이 뜬 뒤 잠깐 있다가 온다. 그래서 처음 그릴 때의 값만 보고
    끝내면 영영 안 뜬다 — 바뀔 때 알려 달라고 걸어 둔다.
  */
  const [can, setCan] = useState(canInstall);
  const [gone, setGone] = useState(stowed);

  useEffect(() => watchInstall(() => setCan(canInstall())), []);

  /*
    설치할 수 있느냐와 **상관없이** 띄운다. 제안이 없으면 메뉴 안내를 적는다 —
    설치가 유일한 답인데 안내가 없으면 사용자는 계속 탭을 한 번씩 하게 된다.
  */
  if (gone || !touchDevice() || installed()) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        /* 게임 위에 얹히지만 조작을 막지는 않는다 */
        zIndex: 300,
        backgroundColor: BLACK,
        borderTopWidth: 1,
        borderTopColor: WHITE,
        paddingVertical: SP.xs,
        paddingHorizontal: SP.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SP.sm,
      }}
    >
      <View style={{ flex: 1 }}>
        <T size={10} bold>홈 화면에 추가</T>
        <T size={9} dim="sub">
          {can
            ? '켜자마자 위아래 바 없이 전체 화면으로 열립니다'
            : '브라우저 메뉴 → "홈 화면에 추가". 그 아이콘으로 열면 바가 없습니다'}
        </T>
      </View>

      {/*
        제안이 잡혀 있을 때만 단추를 낸다. 없는데 단추를 두면 눌러도 아무 일이
        안 일어나고, 그건 안내가 없는 것보다 나쁘다.
      */}
      {can && (
        <Pressable
          onPress={askInstall}
          hitSlop={8}
          style={({ pressed }) => ({
            backgroundColor: WHITE,
            paddingVertical: 5,
            paddingHorizontal: SP.sm,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <T size={10} bold style={{ color: BLACK }}>추가</T>
        </Pressable>
      )}

      <Pressable
        onPress={() => { stow(); setGone(true); }}
        /*
          닫기는 **과녁만 넓힌다.** 글자 하나짜리라 보이는 것은 작아야 하고
          (옆의 `추가` 와 무게가 같아지면 어느 쪽이 본론인지 흐려진다),
          손가락은 커야 한다.
        */
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => ({ paddingHorizontal: 4, opacity: pressed ? 0.5 : 1 })}
      >
        <T size={13} dim="sub">×</T>
      </Pressable>
    </View>
  );
}
