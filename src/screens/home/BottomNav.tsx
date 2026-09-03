/**
 * ── 아래 띠 ── 다섯 칸.
 *
 * ## 왜 파티 **아래**인가
 *
 * "밑에 캐릭터 상태랑, 우리가 누르고 들어가고자 하는 버튼들이 같이 보여야
 * 함" — 한 화면에 둘이 같이 있어야 한다는 말이다.
 *
 * 그래서 이 띠는 **스크롤 밖**에 있다 (`HomeScreen`). 스크롤 안에 두면 파티가
 * 길어지는 날 단추가 화면 밖으로 밀려나고, 그러면 "같이 보인다" 가 깨진다.
 * 위에서 무엇을 보고 있든 다섯 칸은 늘 제자리에 있다.
 *
 * ## 가운데가 솟아 있다
 *
 * 다섯 칸의 한가운데(`main`)가 지금 보고 있는 화면이라 안 눌린다 — 눌러도
 * 아무 데도 안 가는 단추를 준비중 팝업으로 막으면, 이미 여기 있는데 준비중
 * 이라는 말을 듣게 된다.
 *
 * 반전(흰 바탕)만으로 말했었는데, 그러면 **네모 하나가 더 생길 뿐**이다.
 * 지금은 가운데 칸이 띠 위로 솟고 그림도 한 단계 크다 — 흔한 모바일 게임의
 * 아래 띠가 다 그 모양이라, 설명 없이 "여기가 본거리" 로 읽힌다.
 *
 * 나머지 넷은 아직 화면이 없어 준비중이다 (`ui/SoonPopup`). 자리부터 잡는
 * 이유는 저기 적어 두었다.
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/ui/atoms';
import { Pixel } from '@/ui/Pixel';
import { NAV } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { soon } from '@/ui/SoonPopup';
import { C, O, SP, WHITE } from '@/ui/theme';

const TABS: readonly { id: string; label: string; art: keyof typeof NAV }[] = [
  { id: 'hero', label: '영웅', art: 'hero' },
  { id: 'item', label: '아이템', art: 'item' },
  { id: 'main', label: '메인', art: 'main' },
  { id: 'guild', label: '길드', art: 'guild' },
  { id: 'content', label: '컨텐츠', art: 'more' },
];

/**
 * 가운데 칸이 띠 위로 솟는 높이.
 *
 * 이만큼 위로 나가므로 부모가 그 자리를 비워 둬야 한다 (`paddingTop`).
 * 안 비우면 솟은 부분이 파티 칸 위에 얹혀서 파티 마지막 줄을 가린다.
 */
const BUMP = 10;

export function BottomNav() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: WHITE,
        backgroundColor: C.bg,
        /* 솟은 칸이 나갈 자리 */
        paddingTop: BUMP,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {TABS.map((t) => {
        const here = t.id === 'main';
        return (
          <Pressable
            key={t.id}
            disabled={here}
            onPress={() => { sfx('tap'); soon(t.label); }}
            style={({ pressed }) => ({
              flex: 1,
              paddingTop: here ? SP.xs : SP.sm,
              paddingBottom: SP.sm,
              alignItems: 'center',
              gap: 3,
              /* 솟은 만큼 위로 나간다 — 자리는 부모가 비워 두었다 */
              marginTop: here ? -BUMP : 0,
              /*
                지금 있는 칸만 반전. 흑백이라 "여기다" 를 말할 수단이 이것과
                굵기뿐인데, 굵기는 이미 눌림에 쓰고 있다.
              */
              backgroundColor: here ? C.bgInv : (pressed ? '#FFFFFF33' : 'transparent'),
              borderWidth: here ? 1 : 0,
              borderColor: WHITE,
            })}
          >
            <Pixel
              sprite={NAV[t.art]}
              /* 가운데만 한 단계 크다 — 크기가 곧 "여기가 본거리" 다 */
              scale={here ? 2.6 : 2}
              color={here ? C.fgInv : WHITE}
              opacity={here ? 1 : O.sub}
            />
            <T size={10} bold style={{ color: here ? C.fgInv : WHITE }}>{t.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}
