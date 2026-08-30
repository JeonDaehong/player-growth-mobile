import React, { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BORDER, C, O, SP, WHITE, font } from './theme';
import { sfx, type SfxId } from './sfx';

// ── 텍스트 ─────────────────────────────────────────────
type TProps = { children: ReactNode; size?: number; bold?: boolean; dim?: keyof typeof O; style?: StyleProp<TextStyle>; numberOfLines?: number; center?: boolean; selectable?: boolean };

export function T({ children, size = 13, bold, dim = 'full', style, numberOfLines, center, selectable }: TProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      selectable={selectable}
      style={[font(size, bold ? 'bold' : 'normal'), { opacity: O[dim] }, center && { textAlign: 'center' }, style]}
    >
      {children}
    </Text>
  );
}

// ── 레이아웃 ───────────────────────────────────────────
export function Screen({ children, scroll = true, pad = true }: { children: ReactNode; scroll?: boolean; pad?: boolean }) {
  /**
   * 스크롤 화면은 아래를 넉넉히 비워 둔다 — 마지막 항목이 탭바에 가리면 못 누른다.
   * 스크롤이 없는 화면(지도)은 그럴 일이 없으므로 그 여백이 그대로 빈 공간이 된다.
   */
  const inner = pad ? { padding: SP.md, paddingBottom: scroll ? SP.xl * 2 : SP.md } : undefined;
  return (
    <SafeAreaView style={s.screen} edges={['left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={inner} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, inner]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Row({ children, style, gap = SP.sm, between }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number; between?: boolean }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, between && { justifyContent: 'space-between' }, style]}>
      {children}
    </View>
  );
}

export function Panel({ title, children, style, right }: { title?: string; children?: ReactNode; style?: StyleProp<ViewStyle>; right?: ReactNode }) {
  return (
    <View style={[s.panel, style]}>
      {!!title && (
        <Row between style={s.panelHead}>
          <T size={11} bold dim="sub">{title}</T>
          {right}
        </Row>
      )}
      <View style={{ padding: SP.md }}>{children}</View>
    </View>
  );
}

/** 점선 구분자 — 도트 감성 */
export function Sep({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: WHITE, opacity: O.faint, marginVertical: SP.sm }, style]} />;
}

// ── 버튼 ───────────────────────────────────────────────
type BtnProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** 채워진(반전) 스타일 */
  fill?: boolean;
  sub?: string;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg';
  busy?: boolean;
  /**
   * 라벨 왼쪽 아이콘.
   * 버튼이 반전될 때 아이콘도 검정으로 바뀌어야 하므로 색을 인자로 받는다.
   */
  icon?: (color: string) => ReactNode;
  /**
   * 누를 때 나는 소리. 기본은 'tap' 이다.
   * 돈이 오가는 버튼은 'coin', 강화대는 'hammer' 처럼 **행동에 맞는 소리**를 준다 —
   * 전부 같은 소리면 뭘 눌렀는지 귀로는 구분이 안 된다. `null` 이면 무음.
   */
  sound?: SfxId | null;
};

export function Btn({ label, onPress, disabled, fill, sub, style, size = 'md', busy, icon, sound = 'tap' }: BtnProps) {
  const pad = size === 'sm' ? SP.xs + 2 : size === 'lg' ? SP.md + 2 : SP.sm + 2;
  const fs = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;
  return (
    <Pressable
      /* onPress 가 없는 버튼은 눌리지 않아야 한다 — 소리만 나면 먹통처럼 느껴진다 */
      onPress={disabled || busy || !onPress ? undefined : () => { if (sound) sfx(sound); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          paddingVertical: pad,
          paddingHorizontal: SP.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fill || pressed ? C.bgInv : 'transparent',
          opacity: disabled ? O.dim : 1,
        },
        style,
      ]}
    >
      {({ pressed }: { pressed: boolean }) => {
        const inv = fill || pressed;
        return (
          <>
            {busy ? (
              <ActivityIndicator color={inv ? C.fgInv : C.fg} />
            ) : icon ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SP.sm }}>
                {icon(inv ? C.fgInv : C.fg)}
                <Text style={[font(fs, 'bold'), { color: inv ? C.fgInv : C.fg }]}>{label}</Text>
              </View>
            ) : (
              <Text style={[font(fs, 'bold'), { color: inv ? C.fgInv : C.fg }]}>{label}</Text>
            )}
            {!!sub && !busy && (
              <Text style={[font(10), { color: inv ? C.fgInv : C.fg, opacity: O.sub, marginTop: 2 }]}>{sub}</Text>
            )}
          </>
        );
      }}
    </Pressable>
  );
}

/** 목록 항목 — 누르면 반전 */
export function ListItem({ title, sub, left, right, onPress, disabled, sound = 'tap' }: { title: string; sub?: string; left?: ReactNode; right?: ReactNode; onPress?: () => void; disabled?: boolean; sound?: SfxId | null }) {
  return (
    <Pressable
      onPress={disabled || !onPress ? undefined : () => { if (sound) sfx(sound); onPress(); }}
      style={({ pressed }) => [
        s.item,
        pressed && { backgroundColor: C.bgInv },
        disabled && { opacity: O.dim },
      ]}
    >
      {({ pressed }: { pressed: boolean }) => (
        <Row between>
          {!!left && <View style={{ marginRight: SP.sm }}>{left}</View>}
          <View style={{ flex: 1 }}>
            <Text style={[font(14, 'bold'), { color: pressed ? C.fgInv : C.fg }]}>{title}</Text>
            {!!sub && <Text style={[font(11), { color: pressed ? C.fgInv : C.fg, opacity: O.sub, marginTop: 2 }]}>{sub}</Text>}
          </View>
          {right}
        </Row>
      )}
    </Pressable>
  );
}

// ── 게이지 ─────────────────────────────────────────────
/** 블록으로 채우는 도트식 게이지 */
export function Bar({ value, max = 100, blocks = 20, height = 8 }: { value: number; max?: number; blocks?: number; height?: number }) {
  const filled = Math.round(Math.max(0, Math.min(1, value / max)) * blocks);
  return (
    <View style={{ flexDirection: 'row', gap: 1, flex: 1 }}>
      {Array.from({ length: blocks }, (_, i) => (
        <View
          key={i}
          style={{ flex: 1, height, backgroundColor: WHITE, opacity: i < filled ? O.full : O.faint }}
        />
      ))}
    </View>
  );
}

/** 라벨 + 값 한 줄 */
export function KV({ k, v, dim, warn }: { k: string; v: string; dim?: boolean; warn?: boolean }) {
  return (
    <Row between style={{ paddingVertical: 3 }}>
      <T size={12} dim="sub">{k}</T>
      <T size={12} bold={!dim} dim={warn ? 'full' : dim ? 'sub' : 'full'}>{v}</T>
    </Row>
  );
}

/** 테두리 뱃지 */
export function Tag({ label, fill }: { label: string; fill?: boolean }) {
  return (
    <View style={[BORDER, { paddingHorizontal: 5, paddingVertical: 2, backgroundColor: fill ? C.bgInv : 'transparent' }]}>
      <Text style={[font(10, 'bold'), { color: fill ? C.fgInv : C.fg }]}>{label}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  panel: { ...BORDER, marginBottom: SP.md },
  panelHead: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: WHITE,
  },
  item: {
    ...BORDER,
    padding: SP.md,
    marginBottom: SP.sm,
  },
});
