/**
 * 월페이퍼 한 장 — **화면을 꽉 채워서** 본다.
 *
 * ## 왜 팝업(`Popup`)을 안 쓰나
 *
 * 이 게임의 다른 창은 테두리와 제목이 있는 상자다 (`ui/Popup`). 그림 한 장을
 * 거기 넣으면 상자 안의 작은 그림이 되어, 월페이퍼를 보는 것이 아니라
 * **썸네일을 보는 것**이 된다. 1672x941 짜리를 받아 놓고 그러면 볼 이유가 없다.
 *
 * 그래서 화면을 통째로 덮는다. 닫는 길은 두 가지 — 아무 데나 누르거나
 * 오른쪽 위의 `×`. 처음 여는 사람도 첫 번째로 나가진다.
 *
 * ## 잘리지 않게 담는다
 *
 * `cover` 로 채우면 세로가 긴 화면에서 좌우가 잘려 나간다. 인물이 가운데
 * 있으리라는 보장이 없으므로 얼굴이 잘릴 수 있다. `contain` 으로 **다 보이게**
 * 담고 남는 자리는 검게 둔다 — 이 게임의 바탕이 어차피 검다.
 */
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { WALLPAPERS } from '@/ui/wallpapers';
import { T } from '@/ui/atoms';
import { BLACK, SP, WHITE } from '@/ui/theme';
import { useBackClose } from '@/ui/backGuard';

export function WallpaperPopup({
  charId, keys, name, onClose,
}: {
  /** 볼 것 하나. `null` 이면 안 뜬다 (`keys` 를 주면 그쪽이 이긴다) */
  charId: string | null;
  /**
   * 여러 장을 넘겨 볼 때의 열쇠들 — 주면 좌우 화살표가 붙는다.
   *
   * 지금은 시험용으로만 쓴다 (`FREE_ENHANCE`). 실제로는 받은 것 하나만
   * 여는 것이 맞다 — 월페이퍼는 이야기를 다 본 값이므로 (`ownedWallpaper`).
   */
  keys?: readonly string[];
  /** 오른쪽 위에 작게 적는 이름 */
  name?: string;
  onClose: () => void;
}) {
  /*
    ── 몇 번째를 보고 있나 ──

    **`charId` 가 바뀌면 처음으로 돌린다.** 안 그러면 넉 장을 보다 닫고
    다른 사람을 열었을 때 세 번째부터 시작한다.
  */
  const [at, setAt] = useState(0);
  useEffect(() => { setAt(0); }, [charId, keys]);

  const list = keys && keys.length ? keys : (charId ? [charId] : []);
  const now = list[Math.min(at, Math.max(0, list.length - 1))] ?? null;
  const src = now ? WALLPAPERS[now] : undefined;
  /*
    뒤로가기로도 닫힌다. 캐릭터 창 **위에** 뜨므로, 한 번 누르면 이것만
    닫히고 캐릭터 창은 남는다 (`useBackClose` 가 열린 순서를 거꾸로 닫는다).

    훅이라 `return null` 보다 **먼저** 불러야 한다 — 조건에 따라 안 부르면
    훅 순서가 렌더마다 달라진다.
  */
  useBackClose(!!charId && !!src, onClose);
  if (!charId || !src || !now) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {/* 아무 데나 눌러도 닫힌다 — 전체 화면이라 나가는 길이 분명해야 한다 */}
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: BLACK, justifyContent: 'center' }}
      >
        <Image
          source={src}
          /*
            `contain` — 잘리는 것보다 남는 게 낫다. 인물이 가운데 있으리라는
            보장이 없어서, `cover` 로 채우면 얼굴이 잘려 나갈 수 있다.
          */
          resizeMode="contain"
          style={{ width: '100%', height: '100%' }}
        />

        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            paddingTop: SP.xl,
            paddingHorizontal: SP.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <T size={11} bold>
            {list.length > 1 ? `${name ?? ''}  ${at + 1}/${list.length}` : (name ?? '')}
          </T>
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
          ── 좌우로 넘긴다 ── 여러 장일 때만 (`keys`).

          **화살표를 화면 가장자리에 크게** 둔다. 그림을 보는 화면이라
          가운데를 가리면 안 되고, 아무 데나 누르면 닫히므로 (`onPress`)
          누르는 자리가 분명해야 한다 — 화살표는 제 눌림을 막는다.
        */}
        {list.length > 1 && (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 월페이퍼"
              onPress={(e) => { e.stopPropagation(); setAt((n) => (n + list.length - 1) % list.length); }}
              hitSlop={{ top: 40, bottom: 40, left: 20, right: 20 }}
              style={({ pressed }) => ({
                position: 'absolute',
                left: SP.md,
                top: '45%',
                opacity: pressed ? 0.5 : 0.85,
              })}
            >
              <T size={34} bold style={{ color: WHITE }}>‹</T>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 월페이퍼"
              onPress={(e) => { e.stopPropagation(); setAt((n) => (n + 1) % list.length); }}
              hitSlop={{ top: 40, bottom: 40, left: 20, right: 20 }}
              style={({ pressed }) => ({
                position: 'absolute',
                right: SP.md,
                top: '45%',
                opacity: pressed ? 0.5 : 0.85,
              })}
            >
              <T size={34} bold style={{ color: WHITE }}>›</T>
            </Pressable>
          </>
        )}
      </Pressable>
    </Modal>
  );
}
