import React from 'react';
import { View } from 'react-native';
import { Row, T } from './atoms';
import { BORDER, O, SP, WHITE } from './theme';

/** 흑백 2색이라 색 대신 **불투명도 4단계**로 계열을 구분한다 */
export const SERIES = [O.full, O.sub, O.dim, O.faint] as const;

export interface Part {
  label: string;
  value: number;
  /** 0~3 (SERIES 인덱스) */
  tone?: number;
}

/**
 * 누적 가로 막대 + 범례.
 * 비율 비교에 쓴다 (강화 결과 분포, 승패 등).
 */
export function StackBar({ parts, height = 12 }: { parts: Part[]; height?: number }) {
  const total = Math.max(1, parts.reduce((a, p) => a + p.value, 0));
  const shown = parts.filter((p) => p.value > 0);
  return (
    <View>
      <Row gap={1} style={[BORDER, { padding: 1 }]}>
        {shown.length === 0 ? (
          <View style={{ flex: 1, height, backgroundColor: WHITE, opacity: O.faint }} />
        ) : (
          shown.map((p, i) => (
            <View
              key={i}
              style={{
                flex: p.value / total,
                height,
                backgroundColor: WHITE,
                opacity: SERIES[p.tone ?? i % SERIES.length],
              }}
            />
          ))
        )}
      </Row>
      <Row gap={SP.md} style={{ marginTop: 5, flexWrap: 'wrap' }}>
        {parts.map((p, i) => (
          <Row key={i} gap={4}>
            <View style={{ width: 8, height: 8, backgroundColor: WHITE, opacity: SERIES[p.tone ?? i % SERIES.length] }} />
            <T size={9} dim="sub">
              {p.label} {p.value.toLocaleString('en-US')}
              {total > 1 ? ` (${Math.round((p.value / total) * 100)}%)` : ''}
            </T>
          </Row>
        ))}
      </Row>
    </View>
  );
}

/**
 * 세로 막대 그래프.
 * 강화 단계별 시도 횟수처럼 "구간별 분포"에 쓴다.
 */
export function Columns({
  data, height = 70, highlight,
}: { data: { label: string; value: number }[]; height?: number; highlight?: (d: { label: string; value: number }) => boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const empty = data.every((d) => d.value === 0);
  return (
    <View>
      <Row gap={2} style={{ alignItems: 'flex-end', height }}>
        {data.map((d, i) => {
          const hot = highlight?.(d);
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              {d.value > 0 && <T size={7} dim="dim">{d.value}</T>}
              <View
                style={{
                  width: '100%',
                  height: Math.max(d.value > 0 ? 3 : 1, (d.value / max) * (height - 14)),
                  backgroundColor: WHITE,
                  opacity: d.value === 0 ? O.faint : hot ? O.full : O.sub,
                }}
              />
            </View>
          );
        })}
      </Row>
      <Row gap={2} style={{ marginTop: 3 }}>
        {data.map((d, i) => (
          <T key={i} size={8} dim="dim" center style={{ flex: 1 }}>{d.label}</T>
        ))}
      </Row>
      {empty && <T size={9} dim="faint" center style={{ marginTop: 4 }}>아직 기록이 없습니다</T>}
    </View>
  );
}

/**
 * 가로 막대 목록.
 * 항목마다 값의 크기가 크게 달라서 세로 막대로는 안 읽히는 경우에 쓴다 (수입원 비교).
 */
export function HBars({
  data, format,
}: { data: { label: string; value: number; tone?: number }[]; format?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  return (
    <View>
      {data.map((d, i) => (
        <View key={i} style={{ paddingVertical: 3 }}>
          <Row between>
            <T size={11} dim="sub">{d.label}</T>
            <T size={11} bold>{format ? format(d.value) : d.value.toLocaleString('en-US')}</T>
          </Row>
          <View style={{ height: 6, marginTop: 2, backgroundColor: WHITE, opacity: O.faint }}>
            <View
              style={{
                width: `${(Math.abs(d.value) / max) * 100}%`,
                height: 6,
                backgroundColor: WHITE,
                opacity: d.value < 0 ? O.dim : SERIES[d.tone ?? 0],
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/** 진행도 — 값 / 최대값 + 퍼센트 */
export function Progress({
  label, value, max, unit,
}: { label: string; value: number; max: number; unit?: string }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View style={{ paddingVertical: 4 }}>
      <Row between>
        <T size={11} dim="sub">{label}</T>
        <T size={11} bold>
          {value.toLocaleString('en-US')}{unit ?? ''} / {max.toLocaleString('en-US')}{unit ?? ''}
        </T>
      </Row>
      <Row gap={1} style={{ marginTop: 3 }}>
        {Array.from({ length: 24 }, (_, i) => (
          <View
            key={i}
            style={{ flex: 1, height: 6, backgroundColor: WHITE, opacity: i < Math.round(pct * 24) ? O.full : O.faint }}
          />
        ))}
        <T size={9} dim="sub" style={{ width: 32, textAlign: 'right' }}>{Math.round(pct * 100)}%</T>
      </Row>
    </View>
  );
}
