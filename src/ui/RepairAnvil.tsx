/**
 * 망치질 연출 — "뚱 땅 뚱 땅 뚝딱".
 *
 * 수리는 버튼 한 번에 숫자만 바뀌는 일이라 **아무 일도 안 일어난 것처럼** 느껴진다.
 * 강화에는 게이지가 차고 섬광이 터지는데 수리만 조용하면, 같은 돈을 쓰고도
 * 수리 쪽이 손해 본 기분이 든다. 1.2초짜리 망치질 하나가 그 차이를 메운다.
 *
 * 한 칸 수리(`RepairPopup`)와 전체 수리(`RepairAllPopup`)가 **같은 연출**을 쓴다.
 * 예전에는 한 칸에만 있었다 — 그래서 정작 더 많은 돈을 쓰는 전체 수리가
 * 더 밋밋했다. 두 곳에 각각 복사해 두면 한쪽만 고쳐져 또 갈라지므로 여기 모은다.
 */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Bar, T } from './atoms';
import { Sprite } from './Sprite';
import { WEAPON_SPRITES } from './sprites';
import { SP } from './theme';

/** 망치질 한 판의 길이 */
export const REPAIR_MS = 1200;

/** 한 박자에 한 글자씩 쌓인다 */
export const CLANG = ['뚱', '땅', '뚱', '땅', '뚝딱'];

/**
 * 망치질 박자.
 *
 * `running` 이 true 인 동안만 돈다. 끝나는 시점은 부르는 쪽이 정한다 —
 * 여기서 타이머를 두 개(박자 + 종료) 돌리면 둘이 어긋나 마지막 글자가
 * 안 찍히거나 한 박자 더 찍힌다.
 */
export function useClang(running: boolean): number {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (!running) { setBeat(0); return; }
    setBeat(0);
    const t = setInterval(() => setBeat((v) => v + 1), REPAIR_MS / CLANG.length);
    return () => clearInterval(t);
  }, [running]);
  return beat;
}

/** 망치가 위아래로 내려찍고, 그 아래로 의성어가 쌓인다 */
export function RepairAnvil({ beat, note }: { beat: number; note?: string }) {
  const step = Math.min(CLANG.length, beat + 1);
  return (
    <View style={{ alignItems: 'center', paddingVertical: SP.md }}>
      <Sprite
        set="weapon"
        name="hammer"
        size={44}
        fallback={WEAPON_SPRITES.hammer}
        style={{
          transform: [
            { translateY: beat % 2 === 0 ? -6 : 4 },
            { rotate: beat % 2 === 0 ? '-18deg' : '8deg' },
          ],
        }}
      />
      <T size={20} bold center style={{ marginTop: SP.sm }}>
        {CLANG.slice(0, step).join(' ')}
      </T>
      {!!note && (
        <T size={10} dim="sub" center style={{ marginTop: 2 }}>{note}</T>
      )}
      <View style={{ alignSelf: 'stretch', marginTop: SP.sm }}>
        <Bar value={step} max={CLANG.length} blocks={16} height={6} />
      </View>
    </View>
  );
}
