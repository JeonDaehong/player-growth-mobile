import React, { useMemo } from 'react';
import { View } from 'react-native';
import { BORDER, O, WHITE } from './theme';
import { T } from './atoms';

interface Props {
  data: number[];
  height?: number;
  /** 기준선 (없으면 첫 값). 이 선 위/아래로 상승·하락이 보인다. */
  baseline?: number;
  /** 고가/저가 눈금 표시 */
  showScale?: boolean;
}

/**
 * 주식용 라인 차트.
 *
 * SVG/Skia 없이 View 만으로 그린다 — 인접한 두 점을 잇는 세로 막대를 이어 붙이면
 * 흑백 도트 화면에서는 연결된 선으로 읽힌다. 막대 그래프와 달리 **추세**가 보인다.
 */
export function LineChart({ data, height = 64, baseline, showScale = true }: Props) {
  const pts = data.length > 240 ? data.slice(-240) : data;

  const geo = useMemo(() => {
    if (pts.length < 2) return null;
    const lo = Math.min(...pts);
    const hi = Math.max(...pts);
    // 위아래로 8% 여유를 둬야 선이 테두리에 붙지 않는다
    const pad = Math.max(1e-9, (hi - lo) * 0.08);
    const min = lo - pad;
    const max = hi + pad;
    const span = Math.max(1e-9, max - min);
    const y = (v: number) => (1 - (v - min) / span) * height;
    return { lo, hi, min, max, y };
  }, [pts, height]);

  if (!geo) return <View style={[BORDER, { height }]} />;

  const base = baseline ?? pts[0];
  const baseY = geo.y(base);
  const last = pts[pts.length - 1];
  const up = last >= base;

  return (
    <View style={[BORDER, { height, overflow: 'hidden' }]}>
      {/* 기준선 — 시작가. 점선으로 깔아 상승·하락을 한눈에 */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: baseY, flexDirection: 'row' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 1, backgroundColor: WHITE, opacity: i % 2 ? 0 : O.faint }} />
        ))}
      </View>

      <Segments pts={pts} y={geo.y} height={height} baseY={baseY} />

      {showScale && (
        <>
          <T size={8} dim="dim" style={{ position: 'absolute', right: 3, top: 1 }}>
            {fmtTick(geo.hi)}
          </T>
          <T size={8} dim="dim" style={{ position: 'absolute', right: 3, bottom: 1 }}>
            {fmtTick(geo.lo)}
          </T>
        </>
      )}

      {/* 최근값 마커 */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: Math.max(0, Math.min(height - 4, geo.y(last) - 2)),
          width: 4,
          height: 4,
          backgroundColor: WHITE,
          opacity: up ? 1 : O.sub,
        }}
      />
    </View>
  );
}

/** 인접 두 점을 잇는 세로 막대 + 선 아래 옅은 채움 */
function Segments({
  pts, y, height, baseY,
}: { pts: number[]; y: (v: number) => number; height: number; baseY: number }) {
  const n = pts.length;
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {pts.slice(0, -1).map((v, i) => {
        const y1 = y(v);
        const y2 = y(pts[i + 1]);
        const top = Math.min(y1, y2);
        const h = Math.max(1.5, Math.abs(y2 - y1));
        const lineBottom = top + h;
        return (
          <View key={i} style={{ flex: 1 }}>
            {/* 선 아래 채움 — 면적 차트 느낌으로 추세가 더 잘 읽힌다 */}
            <View
              style={{
                position: 'absolute',
                left: 0, right: 0,
                top: lineBottom,
                height: Math.max(0, height - lineBottom),
                backgroundColor: WHITE,
                opacity: O.faint,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 0, right: 0,
                top,
                height: h,
                backgroundColor: WHITE,
                opacity: top <= baseY ? O.full : O.sub,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

function fmtTick(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}골`;
  if (v >= 100) return `${Math.round(v / 100)}실`;
  return `${Math.round(v)}`;
}
