/**
 * 직접 입력한 숫자 한 칸을 해석하는 규칙.
 *
 * 화면 컴포넌트가 아니라 **규칙만** 여기 둔다. 이 규칙이 틀리면 돈이 틀리기
 * 때문이다 — 상점에서는 몇 장을 사는지가, 자동 강화에서는 어디까지 두들기는지가
 * 이 함수 하나로 정해진다. 화면을 띄우지 않고 직접 확인할 수 있어야 한다.
 *
 * 규칙 셋:
 *  · 숫자가 아닌 글자는 버린다 (붙여넣기 · 소수점 · 마이너스)
 *  · 다 지우면 값은 그대로 두고 칸만 비운다 — 여기서 최솟값으로 되돌리면
 *    지우고 새로 칠 수가 없다
 *  · 상한을 넘기면 상한으로 깎고, 깎였다고 알린다
 *
 * 두 화면(`QtyPicker` · 자동 강화 목표)이 같이 쓴다. 복사해 두면 한쪽만
 * 고쳐져 갈라진다 — 이 저장소에서 이미 여러 번 겪은 일이다.
 */

/** 입력 한 글자를 해석한 결과 */
export interface Typed {
  /** 칸에 되비칠 글자. 빈 문자열은 "지우는 중" 이다 */
  text: string;
  /** 확정된 값. `null` 이면 아직 바꾸지 않는다 (지우는 중) */
  value: number | null;
  /** 상한에 걸려 깎였나 */
  capped: boolean;
}

export function parseTyped(text: string, max: number, min = 1): Typed {
  const lo = Math.max(0, Math.floor(min));
  const hi = Math.max(lo, Math.floor(max));
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return { text: '', value: null, capped: false };
  // 자릿수가 많으면 Number 가 부정확해지지만, 어차피 상한으로 깎이므로 상관없다
  const asked = Number(digits);
  const value = Math.min(hi, Math.max(lo, asked));
  return { text: String(value), value, capped: asked > hi };
}
