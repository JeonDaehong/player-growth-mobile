/**
 * 흑백 2색 (기획서 §1). 회색은 쓰지 않고 **불투명도**로만 강약을 준다 —
 * 팔레트를 문자 그대로 2색으로 유지하기 위해서.
 */
import { Platform, TextStyle } from 'react-native';

export const BLACK = '#000000';
export const WHITE = '#FFFFFF';

export const C = {
  bg: BLACK,
  fg: WHITE,
  /** 반전 (선택/강조 시) */
  bgInv: WHITE,
  fgInv: BLACK,
} as const;

/** 불투명도 단계 — 도트 감성에 맞게 단계를 성기게 */
export const O = {
  full: 1,
  sub: 0.62,
  dim: 0.38,
  faint: 0.18,
} as const;

export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
})!;

/**
 * 읽히는 최소 크기.
 *
 * 8~10px 는 한글에서 자모가 뭉개진다 — 특히 지도처럼 그림 위에 얹히는 라벨은
 * 배경 대비까지 겹쳐 사실상 안 보인다. 강약은 크기가 아니라 `O` 의 불투명도로
 * 주기로 했으므로, 작은 쪽은 여기서 끌어올려도 위계가 무너지지 않는다.
 */
export const MIN_FONT = 11;

export const font = (size: number, weight: TextStyle['fontWeight'] = 'normal'): TextStyle => ({
  fontFamily: MONO,
  fontSize: Math.max(size, MIN_FONT),
  fontWeight: weight,
  color: WHITE,
  includeFontPadding: false,
} as TextStyle);

export const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

/** 도트 감성 — 모서리는 절대 둥글게 하지 않는다 */
export const BORDER = { borderWidth: 1, borderColor: WHITE, borderRadius: 0 } as const;

/**
 * ── 딱 두 가지 색 ──
 *
 * 팔레트는 여전히 흑백 2색이다 (기획서 §1). 이 둘은 **글자와 그림에는 절대
 * 안 쓴다** — 상태 로고의 테두리와, 회복량 숫자 하나에만 쓴다.
 *
 * 예외를 둔 이유가 있다. 걸려 있는 것이 좋은 것인지 나쁜 것인지는 한눈에
 * 갈려야 하는데, 흑백에서는 **자리로만** 갈랐다 (좋은 것을 왼쪽에). 그런데
 * 파티 칸에 로고가 하나만 뜨면 그게 어느 쪽 자리인지 알 방법이 없다 —
 * 결국 열두 그림을 다 외운 사람만 읽을 수 있는 표시가 됐다.
 *
 * 색이 말하는 것은 **한 가지뿐**이다: 초록이면 나에게 좋은 것, 빨강이면
 * 나쁜 것. 그 이상은 안 말한다. 안쪽 그림은 그대로 흰색이라 화면의 인상은
 * 안 바뀐다 — 1px 테두리만 물든다.
 */
export const GOOD_C = '#5CE07A';
export const BAD_C = '#FF5C5C';
