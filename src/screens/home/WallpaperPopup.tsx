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
import React from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { WALLPAPERS } from '@/ui/wallpapers';
import { T } from '@/ui/atoms';
import { BLACK, SP, WHITE } from '@/ui/theme';

export function WallpaperPopup({
  charId, name, onClose,
}: {
  /** 볼 사람. `null` 이면 안 뜬다 */
  charId: string | null;
  /** 오른쪽 위에 작게 적는 이름 */
  name?: string;
  onClose: () => void;
}) {
  const src = charId ? WALLPAPERS[charId] : undefined;
  if (!charId || !src) return null;

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
      </Pressable>
    </Modal>
  );
}
