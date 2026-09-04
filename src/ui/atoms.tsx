import React, { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AWAKE_C, BORDER, BORDER_HI, C, FS, LINE, O, PILL, R, SP, SURF, WHITE, font,
} from './theme';
import { Pixel } from './Pixel';
import { STARS } from './sprites';
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
        /*
          ── 지금 눌러야 할 단추는 선이 밝다 ──

          채워진 단추(`fill`)는 이 화면에서 할 일 그 자체라 테두리도 강조로
          간다 (`BORDER_HI`). 나머지는 보통 선이고, 안쪽에 옅은 면을 깔아
          **선이 없어도 단추로 보이게** 한다 — 그래야 화면에 남는 선이 준다.
        */
        fill ? BORDER_HI : BORDER,
        {
          paddingVertical: pad,
          paddingHorizontal: SP.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fill || pressed ? C.bgInv : SURF.up,
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
    /*
      **홈이 파여 있다** (`SURF.down`).

      여태 안 찬 칸을 옅은 흰색으로 그렸는데, 그러면 다 안 찬 막대가 검은
      바탕 위에 떠 있는 회색 줄무늬가 된다 — 게이지인지 무늬인지 모른다.
      바닥을 어둡게 파고 그 안을 채우면, 안 찬 만큼이 "아직 비었다" 로 읽힌다.
    */
    <View
      style={{
        flexDirection: 'row',
        gap: 1,
        flex: 1,
        padding: 1,
        backgroundColor: SURF.down,
        borderRadius: R.sm,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: blocks }, (_, i) => (
        <View
          key={i}
          style={{ flex: 1, height, backgroundColor: WHITE, opacity: i < filled ? O.full : 0.09 }}
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

/**
 * 뱃지 — **알약**이다.
 *
 * 네모로 두면 화면의 다른 네모(단추 · 칸 · 패널)와 같은 모양이 되어, 눌리는
 * 것인지 그냥 표시인지 알 수가 없다. 알약은 이 화면에서 **안 눌리는 표시**
 * 하나만 뜻한다.
 */
export function Tag({ label, fill }: { label: string; fill?: boolean }) {
  return (
    <View
      style={[
        PILL,
        {
          paddingHorizontal: 7,
          paddingVertical: 2,
          backgroundColor: fill ? C.bgInv : SURF.up,
          borderColor: fill ? C.bgInv : LINE.mid,
        },
      ]}
    >
      <Text style={[font(FS.tiny, 'bold'), { color: fill ? C.fgInv : C.fg }]}>{label}</Text>
    </View>
  );
}

/**
 * ── 별 ── 이 사람이 몇 성인가 (`core/growth`).
 *
 * **자리는 늘 그 등급이 갈 수 있는 만큼**이다. 가진 만큼만 그리면 3성인
 * 희귀와 3성인 신화가 화면에서 똑같아 보이는데, 둘은 전혀 다르다 — 하나는
 * 다 큰 것이고 하나는 이제 절반이다.
 *
 * 각성하면 다섯이 **푸르게** 물든다 (`AWAKE_C`). 별을 여섯 개로 늘리지
 * 않는다 — 사양이 "별 다섯이 푸른빛을 띈다" 이고, 여섯 개면 5성과 셈이
 * 헷갈린다.
 */
export function Stars({ star, max, awake, scale = 1.6 }: {
  star: number; max: number; awake?: boolean; scale?: number;
}) {
  const ink = awake ? AWAKE_C : WHITE;
  return (
    <Row gap={1}>
      {Array.from({ length: Math.max(1, max) }, (_v, i) => (
        <Pixel
          key={i}
          sprite={i < star ? STARS.on : STARS.off}
          scale={scale}
          color={ink}
          /* 안 찬 별은 흐리다 — 지우면 앞으로 몇 칸 남았는지가 안 보인다 */
          opacity={i < star ? 1 : O.dim}
        />
      ))}
    </Row>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  /* 모서리가 둥글어졌으므로 안쪽 내용도 같이 잘라 낸다 — 안 그러면 귀가 삐져나온다 */
  panel: { ...BORDER, borderRadius: R.lg, overflow: 'hidden', marginBottom: SP.md },
  panelHead: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 2,
    borderBottomWidth: 1,
    /* 머리말 밑줄은 칸막이다 — 바깥 테두리와 같은 밝기면 판이 둘로 갈려 보인다 */
    borderBottomColor: LINE.low,
    backgroundColor: SURF.up,
  },
  item: {
    ...BORDER,
    backgroundColor: SURF.up,
    padding: SP.md,
    marginBottom: SP.sm,
  },
});
