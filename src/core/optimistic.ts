/**
 * 낙관적 표시 짝짓기.
 *
 * 내가 한 일(채팅 한 줄, 강화 성공)은 **내 화면에 먼저** 올라간다. 왕복 한 번을
 * 기다렸다가 뜨면 내가 한 일 같지가 않기 때문이다. 그런데 그러면 같은 것이 두 벌
 * 존재하게 된다 — 내가 만든 로컬 줄(id `c…`/`f…`)과, 서버가 돌려주는 같은 줄
 * (id `s…`). **id 가 다르니 같은 것인 줄 모른다.**
 *
 * 실시간 소켓만 있을 때는 "내가 보낸 것" 을 걸러 내는 것으로 넘어갔다. 하지만
 * 소켓이 놓친 걸 줍는 재확인(폴링)에는 그 필터가 없어서, 내 말만 두 번씩 떴다.
 * 그리고 걸러 내는 방식은 로컬 줄이 영영 `pending` 으로 남는 문제도 있었다.
 *
 * 그래서 거르지 않고 **짝을 맞춘다**: 서버본이 내 것이면, 아직 짝을 못 찾은
 * `pending` 줄 중 같은 내용인 첫 번째를 찾아 그 자리를 갈아 끼운다.
 * 같은 말을 두 번 쳤어도 하나씩 차례로 짝지어지므로 개수가 맞는다.
 */
export interface Optimistic {
  id: string;
  text: string;
  /** 내가 만든 것인가 */
  mine?: boolean;
  /** 아직 서버본이 안 돌아온 줄 */
  pending?: boolean;
}

/**
 * 서버본을 목록에 들인다.
 *
 * @returns 새 목록. **아무것도 안 바뀌면 null** (이미 있는 줄이 또 온 경우) —
 *          부르는 쪽이 그때 상태를 새로 만들지 않게 한다.
 */
export function absorb<T extends Optimistic>(list: T[], incoming: T): T[] | null {
  // 같은 줄이 두 번 오면(재연결·재확인) 무시한다
  if (list.some((m) => m.id === incoming.id)) return null;
  if (!incoming.mine) return [...list, incoming];

  const at = list.findIndex((m) => m.pending && m.text === incoming.text);
  if (at < 0) return [...list, incoming];

  const next = [...list];
  next[at] = { ...incoming, pending: false };
  return next;
}
