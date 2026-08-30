/**
 * 화폐 — **골드 하나뿐이다.**
 *
 * 예전에는 `1 골드 = 100 실버 = 10,000 쿠퍼` 세 단위를 썼다. 자릿수가 큰
 * 금액을 짧게 읽히게 하려던 것인데, 실제로는 반대로 굴렀다 — 같은 금액이
 * 화면마다 "3실버 20쿠퍼" 와 "0.032골드" 로 달리 나왔고, 강화비 300 이
 * 상점에서는 "3실버" 인데 소지금 옆에서는 "0골드" 로 보였다. 단위가 셋이면
 * **비교하려면 매번 환산을 해야 한다.**
 *
 * 그래서 단위를 하나로 줄였다. 내부 표현은 예전 그대로 **정수 한 종류**이고
 * (부동소수점으로 돈이 새는 걸 막는다), 그 정수를 그냥 골드라고 부른다.
 * 값은 아무것도 안 바뀌었다 — 부르는 이름만 바뀌었다.
 */

/**
 * 옛 단위를 지금 값으로 옮기는 환산기.
 *
 * 기획 수치가 `g(20)`, `s(50)` 처럼 옛 단위로 적혀 있는 곳이 아직 많다.
 * 배수를 그대로 두었으므로 **모든 금액의 상대 관계가 예전과 똑같다.**
 * 새로 쓰는 값은 이걸 거치지 말고 골드 정수를 그대로 적으면 된다.
 */
export const g = (n: number) => Math.round(n * 10000);
export const s = (n: number) => Math.round(n * 100);
export const b = (n: number) => Math.round(n);

const comma = (n: number) => Math.floor(n).toLocaleString('en-US');

/** 전체 표기: "1,234 골드" */
export function fmt(amount: number): string {
  const neg = amount < 0;
  return `${neg ? '-' : ''}${comma(Math.abs(amount))} 골드`;
}

/**
 * 좁은 자리용 축약 — 만·억으로 접는다.
 *
 * 자동 강화처럼 금액이 몇 초마다 바뀌는 자리에서는 열두 자리가 통째로
 * 흔들려서 읽을 수가 없다. 큰 자리만 남기면 "얼마나 큰가" 는 그대로 읽힌다.
 */
export function fmtShort(amount: number): string {
  const neg = amount < 0;
  const a = Math.floor(Math.abs(amount));
  const sign = neg ? '-' : '';

  const fold = (v: number, unit: string) => {
    /* 100 을 넘으면 소수점이 자리만 차지한다 — 1.2억은 쓸모 있고 123.4억은 아니다 */
    const t = v >= 100 ? comma(v) : v.toFixed(1).replace(/\.0$/, '');
    return `${sign}${t}${unit} 골드`;
  };

  if (a >= 100_000_000) return fold(a / 100_000_000, '억');
  if (a >= 10_000) return fold(a / 10_000, '만');
  return `${sign}${comma(a)} 골드`;
}
