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
 * ## 여기가 제일 자주 눌린다
 *
 * 화면에서 손이 제일 자주 닿는 자리이므로, 완성도를 여기부터 맞춘다.
 *
 * 한 번은 가운데 칸을 **띠 위로 솟게** 만들었다. 흔한 모바일 게임이 다 그
 * 모양이라 "여기가 본거리" 로 읽힐 줄 알았는데, 실제로는 솟은 네모가 파티
 * 칸 위에 얹혀서 화면을 한 번 더 갈랐다. 흑백이라 솟은 것과 얹힌 것을
 * 그림자로 이을 수가 없어서, 그냥 **떠 있는 네모**가 됐다.
 *
 * ## 다시 액자를 두른다 — 다만 **하나만 밝게**
 *
 * 그다음에는 반대로 갔다. 테두리를 통째로 지우고 고른 칸에만 알약을 깔았다.
 * 이유는 "다섯이 각자 네모를 두르면 띠 하나가 아니라 **작은 상자 다섯**이
 * 된다" 였고, 그때는 맞았다 — 다섯이 **똑같이 밝은 네모**였기 때문이다.
 *
 * 받은 시안(`assets/2026-09-06/456456.jpg`)은 그 함정을 다르게 피한다.
 * 네모를 지우는 대신 **하나만 도드라지게** 한다. 고른 칸은 테두리가 밝고
 * 면이 차 있고 그림이 크고, 나머지 넷은 테두리가 거의 안 보인다. 그러면
 * 상자 다섯이 아니라 **눌린 건반 하나가 있는 건반 다섯 줄**로 읽힌다.
 *
 * 액자는 두 겹이다 (`ui/Frame`) — 바깥 줄과 그 한 칸 안의 흐린 줄. 1-bit
 * 에는 그림자가 없으므로, 그 틈을 눈이 모서리의 경사로 읽는 것이 여기서
 * 낼 수 있는 유일한 입체감이다.
 *
 * 넷을 흐리게 두는 규칙은 그대로다.
 *
 *   1. **액자** — 고른 칸만 테두리가 밝고 면이 찬다 (`frameStyle`)
 *   2. **밝기** — 안 고른 칸은 그림도 글자도 흐리다 (`O.dim`)
 *   3. **크기** — 고른 칸의 그림만 한 단계 크다
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { NAV } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { soon } from '@/ui/SoonPopup';
import { FrameArt, frameStyle } from '@/ui/Frame';
import { C, FS, LINE, O, SP } from '@/ui/theme';

/** 아래 띠가 여는 화면들 — 지금 실제로 있는 것은 둘이다 */
export type TabId = 'main' | 'hero';

const TABS: readonly { id: string; label: string; art: keyof typeof NAV }[] = [
  { id: 'hero', label: '영웅', art: 'hero' },
  { id: 'item', label: '아이템', art: 'item' },
  { id: 'main', label: '메인', art: 'main' },
  { id: 'guild', label: '길드', art: 'guild' },
  { id: 'content', label: '컨텐츠', art: 'more' },
];

/**
 * ── 아래 띠 ──
 *
 * **어느 칸인지는 밖에서 정한다** (`tab`). 여기 상태로 들고 있으면 띠가
 * 화면을 여는 셈이 되는데, 실제로 화면을 갈아 끼우는 것은 그 위(`HomeScreen`)
 * 라서 두 곳이 같은 것을 따로 기억하게 된다.
 *
 * 영웅과 메인만 실제로 있다. 나머지 셋은 아직 화면이 없어 준비중이다 —
 * 눌러도 탭은 안 바뀌고 안내만 뜬다 (`soon`).
 */
export function BottomNav({ tab, onTab }: { tab: TabId; onTab: (t: TabId) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        /*
          **테두리가 아니라 밝은 실선 하나**다. 순백 1px 을 두르면 이 띠가
          화면에서 잘려 나온 네모가 되는데, 여기는 화면의 바닥이라 위쪽
          경계 하나만 있으면 된다.
        */
        borderTopWidth: 1,
        borderTopColor: LINE.low,
        backgroundColor: C.bg,
        paddingTop: SP.xs + 2,
        paddingBottom: insets.bottom + SP.xs,
        paddingHorizontal: SP.xs + insets.left,
        /* 액자끼리 붙으면 테두리가 두 줄로 겹쳐 보인다 */
        gap: SP.xs,
      }}
    >
      {TABS.map((t) => {
        const here = t.id === tab;
        return (
          <Pressable
            key={t.id}
            disabled={here}
            onPress={() => {
              sfx('tap');
              if (t.id === 'hero' || t.id === 'main') { onTab(t.id as TabId); return; }
              soon(t.label);
            }}
            style={({ pressed }) => [
              frameStyle({ hi: here, pressed }),
              {
                /* 다섯이 **정확히 같은 폭**이다 — 라벨 길이가 자리를 못 바꾼다 */
                flex: 1,
                paddingVertical: SP.xs + 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              },
            ]}
          >
            <FrameArt hi={here} />
            {/*
              `assets/sprites/nav_bot/` 이 있으면 그것을, 없으면 코드 도트를
              그린다 (`Sprite` 의 `fallback`). `NAV` 는 아트가 올 때까지
              버티는 자리표다 — 프롬프트는 `docs/UI_SHELL_PROMPTS.md`.
            */}
            <Sprite
              set="nav_bot"
              name={t.art}
              /* 고른 칸만 한 단계 크다 — 크기가 곧 "여기가 본거리" 다 */
              size={here ? 24 : 20}
              fallback={NAV[t.art]}
              opacity={here ? 1 : O.dim}
            />
            <T
              size={FS.tiny}
              bold={here}
              /* 안 고른 칸은 글자도 같이 물러난다 — 그림만 흐리면 줄이 어긋나 보인다 */
              dim={here ? 'full' : 'dim'}
            >
              {t.label}
            </T>
          </Pressable>
        );
      })}
      </View>
  );
}
