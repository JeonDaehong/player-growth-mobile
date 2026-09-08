/**
 * 월페이퍼 — **화면을 꽉 채워서** 본다. 여러 장이면 손가락으로 넘긴다.
 *
 * ## 왜 팝업(`Popup`)을 안 쓰나
 *
 * 이 게임의 다른 창은 테두리와 제목이 있는 상자다 (`ui/Popup`). 그림 한 장을
 * 거기 넣으면 상자 안의 작은 그림이 되어, 월페이퍼를 보는 것이 아니라
 * **썸네일을 보는 것**이 된다. 1672x941 짜리를 받아 놓고 그러면 볼 이유가 없다.
 *
 * ## 화살표를 걷고 **밀어서** 넘긴다
 *
 * 좌우에 `‹ ›` 를 붙여 두었었다. 그런데 이 화면은 **아무 데나 누르면 닫히는**
 * 화면이라, 화살표를 누르면 넘어가면서 동시에 닫으려 들었다 — 넘어갔다
 * 도로 돌아오는 것처럼 보인 것이 그것이다. 누름이 위로 새는 것을 막아
 * 보려 했지만 그 방법이 자리마다 다르게 먹는다.
 *
 * 그래서 **누르는 일을 하나로 줄였다**: 누르면 닫힌다, 넘기려면 민다.
 * 가로로 굴러가는 판을 한 장씩 물리므로 (`pagingEnabled`) 반쯤 밀면 제자리로
 * 돌아가고 충분히 밀면 다음 장이다 — 손가락이 이미 아는 규칙이다.
 *
 * ## 잘리지 않게 담는다
 *
 * `cover` 로 채우면 세로가 긴 화면에서 좌우가 잘려 나간다. 인물이 가운데
 * 있으리라는 보장이 없으므로 얼굴이 잘릴 수 있다. `contain` 으로 **다 보이게**
 * 담고 남는 자리는 검게 둔다 — 이 게임의 바탕이 어차피 검다.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Image, Modal, Pressable, ScrollView, View, useWindowDimensions,
} from 'react-native';
import { WALLPAPERS } from '@/ui/wallpapers';
import { T } from '@/ui/atoms';
import { sfx } from '@/ui/sfx';
import { BLACK, C, FS, LINE, O, SP, SURF, WHITE } from '@/ui/theme';
import { useBackClose } from '@/ui/backGuard';

export function WallpaperPopup({ charId, keys, name, onClose }: {
  /** 볼 것 하나. `null` 이면 안 뜬다 (`keys` 를 주면 그쪽이 이긴다) */
  charId: string | null;
  /**
   * 여러 장을 넘겨 볼 때의 열쇠들 — 주면 아래에 `스토리 1 2 3 4` 가 붙는다.
   *
   * 지금은 시험용으로만 여럿을 넘긴다 (`FREE_ENHANCE`). 실제로는 받은 것
   * 하나만 여는 것이 맞다 — 월페이퍼는 이야기를 다 본 값이므로
   * (`ui/wallpapers` 의 `ownedWallpaper`).
   */
  keys?: readonly string[];
  /** 위에 작게 적는 이름 */
  name?: string;
  onClose: () => void;
}) {
  const win = useWindowDimensions();
  const roll = useRef<ScrollView | null>(null);
  /** 몇 번째를 보고 있나 */
  const [at, setAt] = useState(0);

  const list = keys && keys.length ? keys : (charId ? [charId] : []);
  const now = list[Math.min(at, Math.max(0, list.length - 1))] ?? null;
  const src = now ? WALLPAPERS[now] : undefined;

  /*
    다른 사람을 열면 처음으로 돌린다. 안 그러면 넉 장을 보다 닫고 다른
    사람을 열었을 때 세 번째부터 시작한다.

    굴림판도 같이 되돌린다 — 값만 0 으로 두면 화면은 그대로 세 번째다.
  */
  useEffect(() => {
    setAt(0);
    roll.current?.scrollTo({ x: 0, animated: false });
  }, [charId]);

  /*
    뒤로가기로도 닫힌다. 캐릭터 창 **위에** 뜨므로, 한 번 누르면 이것만
    닫히고 캐릭터 창은 남는다 (`useBackClose` 가 열린 순서를 거꾸로 닫는다).

    훅이라 `return null` 보다 **먼저** 불러야 한다 — 조건에 따라 안 부르면
    훅 순서가 렌더마다 달라진다.
  */
  useBackClose(!!charId && !!src, onClose);
  if (!charId || !src || !now) return null;

  /** 밑에 이름표가 붙는 만큼 그림이 물러난다 — 여러 장일 때만 */
  const tabH = list.length > 1 ? 52 : 0;
  const pageH = win.height - tabH;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ width: win.width, height: win.height, backgroundColor: BLACK }}>
        <ScrollView
          ref={roll}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          /*
            **다 민 뒤에 한 번만** 센다. 미는 도중에 세면 손가락이 조금만
            흔들려도 아래 이름표가 앞뒤로 튄다.
          */
          onMomentumScrollEnd={(e) => {
            const n = Math.round(e.nativeEvent.contentOffset.x / win.width);
            if (n !== at) { setAt(n); sfx('tap'); }
          }}
          style={{ width: win.width, height: pageH }}
        >
          {list.map((k) => (
            /*
              장마다 **누르면 닫힌다.** 미는 것과 안 부딪힌다 — 밀면 굴림판이
              손가락을 가져가므로 `onPress` 가 안 뜬다.
            */
            <Pressable
              key={k}
              onPress={onClose}
              style={{ width: win.width, height: pageH, justifyContent: 'center' }}
            >
              <Image
                source={WALLPAPERS[k]}
                resizeMode="contain"
                style={{ width: win.width, height: pageH }}
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* 위 — 이름과 나가는 문 */}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingTop: SP.xl,
            paddingHorizontal: SP.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <T size={11} bold>{name ?? ''}</T>
          <Pressable
            onPress={onClose}
            /* 글자 하나짜리 과녁이라 손가락이 닿을 자리를 넓힌다 */
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <T size={20} bold style={{ color: WHITE }}>×</T>
          </Pressable>
        </View>

        {/*
          ── 아래 이름표 ── `스토리 1` … `스토리 4`.

          몇 장인지와 지금 어디인지를 한 줄이 같이 말한다. 점 네 개로 두는
          것보다 낫다 — 점은 "네 장이 있다" 만 말하고 **몇 번째 이야기인지**는
          말하지 않는데, 이 그림들은 이야기마다 하나씩 붙는 것이다.

          눌러서 바로 갈 수도 있다. 세 장을 밀어야 닿는 자리가 한 번에 닿는다.
        */}
        {list.length > 1 && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: tabH,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: SP.xs,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderTopWidth: 1,
              borderTopColor: LINE.low,
            }}
          >
            {list.map((k, i) => {
              const here = i === at;
              return (
                <Pressable
                  key={k}
                  disabled={here}
                  onPress={() => {
                    sfx('tap');
                    setAt(i);
                    roll.current?.scrollTo({ x: i * win.width, animated: true });
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: SP.xs,
                    paddingHorizontal: SP.sm,
                    borderWidth: 1,
                    borderColor: here ? WHITE : LINE.low,
                    backgroundColor: here ? C.bgInv : (pressed ? SURF.up : 'transparent'),
                    opacity: here ? 1 : O.sub,
                  })}
                >
                  <T
                    size={FS.tiny}
                    bold={here}
                    style={here ? { color: C.fgInv } : undefined}
                  >
                    {`스토리 ${i + 1}`}
                  </T>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </Modal>
  );
}
