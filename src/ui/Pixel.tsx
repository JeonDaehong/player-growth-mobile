import React, { memo, useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { Sprite } from './sprites';
import { WHITE } from './theme';

interface Props {
  sprite: Sprite;
  /** 픽셀 한 칸의 크기 (dp) */
  scale?: number;
  color?: string;
  style?: ViewStyle;
  opacity?: number;
}

/**
 * 도트 스프라이트 렌더러.
 * Skia 없이 View 만으로 그린다 — 2색 도트라 이걸로 충분하고, Expo Go 에서 그대로 돈다.
 * 연속된 '#' 은 한 개의 View 로 합쳐서(run-length) DOM 노드 수를 줄인다.
 */
export const Pixel = memo(function Pixel({ sprite, scale = 3, color = WHITE, style, opacity = 1 }: Props) {
  const runs = useMemo(
    () =>
      sprite.map((row) => {
        const out: { x: number; w: number }[] = [];
        let x = 0;
        while (x < row.length) {
          if (row[x] === '#') {
            let w = 0;
            while (x + w < row.length && row[x + w] === '#') w++;
            out.push({ x, w });
            x += w;
          } else x++;
        }
        return out;
      }),
    [sprite],
  );

  const w = sprite[0]?.length ?? 0;
  const h = sprite.length;

  return (
    <View style={[{ width: w * scale, height: h * scale, opacity }, style]}>
      {runs.map((row, y) =>
        row.map((r, i) => (
          <View
            key={`${y}-${i}`}
            style={{
              position: 'absolute',
              left: r.x * scale,
              top: y * scale,
              width: r.w * scale,
              height: scale,
              backgroundColor: color,
            }}
          />
        )),
      )}
    </View>
  );
});
