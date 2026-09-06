/**
 * ── 액자 ── 눌리는 칸을 **판때기**로 보이게 하는 한 벌.
 *
 * 받은 시안(`assets/2026-09-06/456456.jpg`)의 화면은 거의 전부가 액자다.
 * 위 띠의 문 여섯, 아래 띠의 다섯 칸, 파티 넷 — 하나같이 테두리를 두르고
 * 한 단 올라온 판 위에 그림과 글이 얹혀 있다. 그 한 가지가 화면 전체의
 * 인상을 정한다.
 *
 * ## 한 번 지웠던 것을 되살린다
 *
 * 아래 띠에서 칸마다 두르던 테두리를 지운 적이 있다 — "다섯이 각자 네모를
 * 두르면 띠 하나가 아니라 **작은 상자 다섯**이 된다" 는 이유였다. 그때는
 * 맞았다. 다섯이 **똑같이 밝은 네모**였기 때문이다.
 *
 * 시안은 그 함정을 다르게 피한다. 네모를 지우는 대신 **하나만 도드라지게**
 * 한다 — 고른 칸은 테두리가 밝고 면이 차 있고, 나머지 넷은 테두리가 거의 안
 * 보인다. 그러면 상자 다섯이 아니라 **눌린 건반 하나가 있는 건반 다섯 줄**로
 * 읽힌다.
 *
 * ## 두 겹이 곧 입체다
 *
 * 1-bit 에는 그림자도 그라디언트도 없다. 그런데 시안의 판때기는 분명히
 * 도톰해 보이는데, 그 인상이 **테두리 두 줄**에서 온다 — 바깥은 또렷하고
 * 안쪽 한 칸 안에 흐린 줄이 하나 더 있다. 눈이 그 사이를 모서리의 경사로
 * 읽는다.
 *
 * 그래서 여기 있는 것도 두 겹이다. 바깥 줄은 부르는 쪽이 `frameStyle` 로
 * 받아 제 상자에 두르고, 안쪽 줄은 `FrameArt` 가 얹는다.
 *
 * ## 모서리 장식은 **있으면 얹고 없으면 만다**
 *
 * `assets/sprites/ui_frame/corner.png` 가 오면 네 귀퉁이에 붙는다. 없으면
 * `Sprite` 가 빈 자리를 그리므로 (`Sprite` 의 대체 처리) 두 겹 테두리만
 * 남는다 — 지금이 그 상태이고, 그것만으로도 판때기로 읽힌다.
 *
 * 한 장을 네 번 쓴다. 좌우상하로 뒤집어서 네 귀퉁이를 만드는데, 이렇게
 * 하면 그림이 한 장이면 되고 무엇보다 **네 귀퉁이가 반드시 대칭**이 된다.
 * 넷을 따로 그리면 한쪽만 굵어지는 일이 생긴다.
 *
 * 프롬프트는 `docs/UI_FRAME_PROMPT.md`.
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Sprite } from './Sprite';
import { LINE, O, R, SURF } from './theme';

/** 모서리 장식 한 변 */
const CORNER = 7;

/** 바깥 줄과 안쪽 줄 사이 — 이 틈이 곧 모서리의 경사다 */
const BEVEL = 2;

export interface FrameLook {
  /** 지금 고른 것 · 지금 눌러야 할 것 — 테두리가 밝고 면이 찬다 */
  hi?: boolean;
  /** 한 단 파인 것 — 빈 자리 · 게이지 홈 */
  sunk?: boolean;
  /** 손가락이 닿아 있나 */
  pressed?: boolean;
}

/**
 * 액자의 **바깥 줄과 면**. 부르는 쪽 상자에 그대로 얹는다.
 *
 * `Pressable` 의 `style` 배열 안에 넣기 좋게 값만 돌려준다 — 감싸는 컴포넌트로
 * 만들면 눌리는 자리와 그려지는 자리가 갈려서, 손가락이 테두리 밖을 짚는다.
 */
export function frameStyle({ hi, sunk, pressed }: FrameLook = {}): ViewStyle {
  return {
    borderWidth: 1,
    borderRadius: R.md,
    borderColor: hi ? LINE.hi : LINE.low,
    backgroundColor: sunk
      ? SURF.down
      : pressed
        ? '#FFFFFF2E'
        : hi
          ? SURF.up
          : SURF.veil,
  };
}

/**
 * 액자의 **안쪽 줄과 모서리 넷**. 상자 안에 겹쳐 얹는다.
 *
 * 손가락을 안 먹는다 (`pointerEvents`). 안 그러면 이 판이 상자를 통째로
 * 덮어서 아래 있는 것들이 안 눌린다.
 */
export function FrameArt({ hi }: { hi?: boolean }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: BEVEL,
        right: BEVEL,
        top: BEVEL,
        bottom: BEVEL,
        borderWidth: 1,
        borderRadius: R.sm,
        borderColor: hi ? LINE.mid : LINE.low,
      }}
    >
      {/*
        네 귀퉁이 — **한 장을 뒤집어 쓴다.**

        `Sprite` 의 `flip` 은 좌우뿐이라 여기서는 안 쓴다. `transform` 을
        직접 주는데, 둘을 같이 주면 뒤엣것이 앞엣것을 통째로 덮으므로
        (`Sprite` 머리말의 경고) 처음부터 배열 하나로 적는다.
      */}
      <Corner x="left" y="top" hi={hi} />
      <Corner x="right" y="top" hi={hi} />
      <Corner x="left" y="bottom" hi={hi} />
      <Corner x="right" y="bottom" hi={hi} />
    </View>
  );
}

function Corner({ x, y, hi }: {
  x: 'left' | 'right'; y: 'top' | 'bottom'; hi?: boolean;
}) {
  return (
    <View style={{ position: 'absolute', [x]: -1, [y]: -1 }}>
      <Sprite
        set="ui_frame"
        name="corner"
        size={CORNER}
        opacity={hi ? 1 : O.sub}
        style={{
          transform: [
            { scaleX: x === 'right' ? -1 : 1 },
            { scaleY: y === 'bottom' ? -1 : 1 },
          ],
        }}
      />
    </View>
  );
}
