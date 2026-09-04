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

/* ══════════════════ 디자인 시스템 ══════════════════ */

/**
 * ── 모서리 ── 셋뿐이다.
 *
 * 오랫동안 **0** 이었다 ("도트 감성 — 모서리는 절대 둥글게 하지 않는다").
 * 인물이 도트라 화면도 도트여야 한다고 봤는데, 실제로 굴려 보니 화면 전체가
 * 직각 네모 스무 개로 갈려서 **프로토타입처럼** 보였다. 게임 화면과 UI 가
 * 서로 다른 세계에 있었다.
 *
 * 도트 감성은 **인물과 그림**이 진다 (스프라이트 · `Pixel` · 바닥 격자).
 * 껍데기는 그 그림을 담는 그릇이므로 부드러워도 된다 — 오히려 그래야 그림이
 * 도드라진다.
 *
 * 값이 넷 이상이면 어느 것을 쓸지가 매번 판단이 되고, 판단이 매번이면
 * 결국 제각각이 된다.
 *
 *   sm  4   작은 칸 · 뱃지 안쪽 · 게이지
 *   md  8   기본. 단추 · 패널 · 슬롯
 *   lg  12  큰 판 · 창
 *   round   알약 (뱃지 · 재화 덩이)
 */
export const R = { sm: 4, md: 8, lg: 12, round: 999 } as const;

/**
 * ── 선 ── 굵기가 아니라 **밝기**로 위계를 준다.
 *
 * 여태 테두리가 전부 순백 1px 이었다. 그래서 화면에 있는 모든 네모가 **같은
 * 목소리로** 말했고, 무엇이 중요한지 선으로는 알 수가 없었다.
 *
 * 흑백에서 선을 굵히면 금방 조잡해진다 (2px 이 넘으면 도트 그림과 다투기
 * 시작한다). 밝기는 그런 문제가 없고 단계도 잘게 나눌 수 있다.
 *
 *   hi   눌러야 할 것 · 지금 고른 것
 *   mid  보통 — 여기가 기본이다
 *   low  칸막이. 있는 줄 모르게
 */
export const LINE = {
  hi: '#FFFFFFD9',
  mid: '#FFFFFF52',
  low: '#FFFFFF24',
} as const;

/**
 * ── 면 ── 테두리 **대신** 영역을 가른다.
 *
 * "필요하지 않은 테두리는 제거하고 여백과 배경 명암만으로 영역을 구분한다."
 * 테두리 없이 옅게 밝은 면을 깔면 그 자체가 칸이 된다 — 선이 하나 줄 때마다
 * 화면이 한 조각 덜 갈린다.
 *
 *   up    한 단 올라온 것 (슬롯 · 칸 · 눌리는 것)
 *   down  한 단 들어간 것 (게이지 홈 · 빈 자리)
 *   veil  무대 위에 얹히는 것 — 뒤로 배경이 비쳐야 한다
 */
export const SURF = {
  up: '#FFFFFF12',
  down: '#00000059',
  veil: '#000000A6',
} as const;

/**
 * ── 글자 계단 ── 다섯.
 *
 * 크기를 자유롭게 쓰면 같은 성격의 글자가 화면마다 9 · 10 · 11 로 흩어진다.
 * 다섯 칸으로 묶어 두면 "이건 제목인가 보조인가" 만 정하면 된다.
 *
 * `MIN_FONT`(11) 아래 둘은 **한글이 뭉갠다.** 그래서 저 둘은 숫자와 짧은
 * 라벨에만 쓴다 (`font` 이 어차피 11 로 끌어올린다).
 */
export const FS = { hero: 16, title: 13, body: 12, label: 10, tiny: 9 } as const;

/**
 * 기본 테두리 — **보통 목소리**다.
 *
 * 색이 순백에서 `LINE.mid` 로 내려갔고 모서리가 생겼다. 이 한 줄이 앱 거의
 * 전부에 걸려 있으므로 (`Btn` · `Panel` · `Tag` · `ListItem` · 파티 칸 …)
 * 여기만 고치면 화면 전체의 인상이 같이 바뀐다.
 */
export const BORDER = { borderWidth: 1, borderColor: LINE.mid, borderRadius: R.md } as const;

/** 강조 테두리 — 지금 고른 것, 지금 눌러야 할 것 */
export const BORDER_HI = { borderWidth: 1, borderColor: LINE.hi, borderRadius: R.md } as const;

/** 알약 — 뱃지와 재화 덩이 */
export const PILL = { borderWidth: 1, borderColor: LINE.mid, borderRadius: R.round } as const;

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

/**
 * **적이 두른 막** — 깨야 넘어가는 것 (22 · 29판 우두머리의 보호막).
 *
 * 세 번째 색이다. 위 둘의 규칙("나에게 좋은가 나쁜가")으로는 이걸 못 적는다 —
 * 막은 적에게 좋은 것이자 나에게 나쁜 것인데, 붉게 칠하면 체력 막대 위에서
 * **피해와 같은 색**이 되어 "깎이는 체력" 과 "깎아야 할 막" 이 겹쳐 보인다.
 *
 * 하늘색은 이 게임 어디에도 없던 색이라 뜻이 하나뿐이다: 저 겹은 체력이
 * 아니다.
 */
export const SHIELD_C = '#6FD4FF';

/**
 * **각성한 사람의 별** — 네 번째 색.
 *
 * 사양이 그렇다: "5성 이후 각성이 있고, 별 다섯이 푸른빛을 띈다"
 * (`core/growth`). 흑백에서 각성을 표시할 다른 수단이 마땅치 않다 — 별을
 * 여섯 개로 늘리면 5성과 셈이 헷갈리고, 크기를 키우면 다섯 칸이 안 맞는다.
 *
 * 하늘색(`SHIELD_C`)과 갈라 두었다. 저건 **적의 몸**에만 뜨고 이건 **내
 * 캐릭터 창**에만 뜨므로 한 화면에서 만날 일이 없지만, 같은 값을 쓰면
 * 언젠가 한쪽을 고치다 다른 쪽이 같이 바뀐다.
 */
export const AWAKE_C = '#8FB8FF';
