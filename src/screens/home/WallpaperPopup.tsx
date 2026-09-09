/**
 * 월페이퍼 — **화면을 꽉 채워서** 본다. 여러 장이면 아래 단추로 고른다.
 *
 * ## 왜 팝업(`Popup`)을 안 쓰나
 *
 * 이 게임의 다른 창은 테두리와 제목이 있는 상자다 (`ui/Popup`). 그림 한 장을
 * 거기 넣으면 상자 안의 작은 그림이 되어, 월페이퍼를 보는 것이 아니라
 * **썸네일을 보는 것**이 된다. 1672x941 짜리를 받아 놓고 그러면 볼 이유가 없다.
 *
 * ## 미는 것을 걷었다 — **단추만 남긴다**
 *
 * 두 번 고쳤다. 처음엔 좌우 화살표였는데, 이 화면은 아무 데나 누르면 닫히는
 * 화면이라 화살표를 누르면 넘어가면서 동시에 닫으려 들었다. 그래서 가로로
 * 미는 판으로 바꿨더니 이번엔 관성이 살아서 한 번에 두세 장씩 지나쳤다 —
 * `disableIntervalMomentum` 까지 걸어도 웹에서는 미덥지 않았다.
 *
 * 세 번째는 **미는 일을 아예 없앤다.** 그림은 한 장만 그리고, 넘기는 것은
 * 아래 단추가 한다. 손가락이 그림 위에서 할 수 있는 일이 "닫기" 하나뿐이라
 * 부딪힐 것이 없고, 어느 장으로 갈지도 한 번에 고른다 — 세 장을 밀어야
 * 닿던 자리가 한 번에 닿는다.
 *
 * ## 잘리지 않게 담는다
 *
 * `cover` 로 채우면 세로가 긴 화면에서 좌우가 잘려 나간다. 인물이 가운데
 * 있으리라는 보장이 없으므로 얼굴이 잘릴 수 있다. `contain` 으로 **다 보이게**
 * 담고 남는 자리는 검게 둔다 — 이 게임의 바탕이 어차피 검다.
 */
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { WALLPAPERS } from '@/ui/wallpapers';
import { BOND_STEPS } from '@/core/bond';
import { T } from '@/ui/atoms';
import { sfx } from '@/ui/sfx';
import { BLACK, C, FS, LINE, O, SP, SURF, WHITE } from '@/ui/theme';
import { useBackClose } from '@/ui/backGuard';

/** 위 띠의 높이 — 그림이 그만큼 물러난다 */
const BAR_H = 46;

/**
 * 이 열쇠가 무슨 장면인가 — `knightgirl_love` → `애정`.
 *
 * 단계 이름을 `core/bond` 에서 가져온다. 여기 또 적으면 인연 화면의 이름과
 * 이 띠의 이름이 갈릴 수 있는데, 같은 것을 두 이름으로 부르는 셈이 된다.
 */
const stepName = (key: string): string => {
  const tail = key.split('_')[1] ?? '';
  return BOND_STEPS.find((s) => s.id === tail)?.name ?? '';
};

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
  /** 위 띠에 적는 사람 이름 */
  name?: string;
  onClose: () => void;
}) {
  const win = useWindowDimensions();
  /** 몇 번째를 보고 있나 */
  const [at, setAt] = useState(0);

  const list = keys && keys.length ? keys : (charId ? [charId] : []);
  const now = list[Math.min(at, Math.max(0, list.length - 1))] ?? null;
  const src = now ? WALLPAPERS[now] : undefined;

  /*
    다른 사람을 열면 처음으로 돌린다. 안 그러면 넉 장을 보다 닫고 다른
    사람을 열었을 때 세 번째부터 시작한다.
  */
  useEffect(() => { setAt(0); }, [charId]);

  /*
    뒤로가기로도 닫힌다. 캐릭터 창 **위에** 뜨므로, 한 번 누르면 이것만
    닫히고 캐릭터 창은 남는다 (`useBackClose` 가 열린 순서를 거꾸로 닫는다).

    훅이라 `return null` 보다 **먼저** 불러야 한다 — 조건에 따라 안 부르면
    훅 순서가 렌더마다 달라진다.
  */
  useBackClose(!!charId && !!src, onClose);
  if (!charId || !src || !now) return null;

  /** 아래 단추 줄이 붙는 만큼 그림이 또 물러난다 — 여러 장일 때만 */
  const tabH = list.length > 1 ? 52 : 0;
  const step = stepName(now);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ width: win.width, height: win.height, backgroundColor: BLACK }}>
        {/*
          ── 위 띠 ── 누구의 어느 장면인가.

          그림 **위에 얹지 않고 자리를 차지한다.** 얹으면 세로로 긴 그림의
          머리 위에 글씨가 겹치는데, 이 그림들은 대개 얼굴이 위쪽에 있다.
        */}
        <View
          style={{
            height: BAR_H,
            paddingHorizontal: SP.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: LINE.low,
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <View style={{ flex: 1 }}>
            <T size={FS.body} bold numberOfLines={1}>
              {step ? `${name ?? ''} · ${step}` : (name ?? '')}
            </T>
            {list.length > 1 && (
              <T size={9} dim="dim">{`${at + 1} / ${list.length}`}</T>
            )}
          </View>
          <Pressable
            onPress={() => { sfx('tap'); onClose(); }}
            /* 글자 하나짜리 과녁이라 손가락이 닿을 자리를 넓힌다 */
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <T size={20} bold style={{ color: WHITE }}>×</T>
          </Pressable>
        </View>

        {/*
          ── 그림 한 장 ── 누르면 닫힌다.

          손가락이 여기서 할 수 있는 일이 하나뿐이라 (머리말), 미는 것과
          부딪힐 것이 없다.
        */}
        <Pressable
          onPress={onClose}
          style={{
            width: win.width,
            height: win.height - BAR_H - tabH,
            justifyContent: 'center',
          }}
        >
          <Image
            source={src}
            resizeMode="contain"
            style={{ width: win.width, height: win.height - BAR_H - tabH }}
          />
        </Pressable>

        {/*
          ── 아래 단추 ── `스토리 1` … `스토리 4`.

          몇 장인지와 지금 어디인지를 한 줄이 같이 말한다. 점 네 개로 두는
          것보다 낫다 — 점은 "네 장이 있다" 만 말하고 **몇 번째 이야기인지**는
          말하지 않는데, 이 그림들은 이야기마다 하나씩 붙는 것이다.
        */}
        {list.length > 1 && (
          <View
            style={{
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
                  onPress={() => { sfx('tap'); setAt(i); }}
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
