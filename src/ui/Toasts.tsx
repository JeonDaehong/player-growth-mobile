import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useGame } from '@/state/store';
import { BORDER, C, SP, WHITE } from './theme';
import { T } from './atoms';

function Item({ id, text, tone }: { id: number; text: string; tone: 'good' | 'bad' | 'plain' }) {
  const dismiss = useGame((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(id), 2600);
    return () => clearTimeout(t);
  }, [id, dismiss]);

  return (
    <Animated.View
      entering={FadeInDown.duration(160)}
      exiting={FadeOut.duration(200)}
      style={[
        BORDER,
        {
          backgroundColor: tone === 'good' ? C.bgInv : C.bg,
          paddingHorizontal: SP.md,
          paddingVertical: SP.sm,
          marginTop: SP.xs,
          borderWidth: tone === 'bad' ? 2 : 1,
        },
      ]}
    >
      <T size={12} bold style={{ color: tone === 'good' ? C.fgInv : WHITE }}>
        {text}
      </T>
    </Animated.View>
  );
}

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <View style={{ pointerEvents: 'none', position: 'absolute', left: SP.md, right: SP.md, bottom: 90 }}>
      {toasts.map((t) => (
        <Item key={t.id} {...t} />
      ))}
    </View>
  );
}
