/**
 * 실시간 이벤트 피드.
 *
 * 예전엔 여기서 **가짜 플레이어의 사건을 지어냈다** (`fakeEvent`). 이제는 아무것도
 * 지어내지 않는다 — 화면에 뜨는 줄은 전부 실제로 누군가가 한 일이다.
 * 만드는 쪽은 `state/live.ts` 의 `pushMyEvent` 하나뿐이고, 서버(`state/net.ts`)가
 * 그걸 모아 다른 사람에게 나눠 준다.
 *
 * 이 모듈에는 이제 **모양(스키마)과 문구 규칙**만 남는다.
 */
export type FeedKind =
  | 'enhance' | 'destroy' | 'promote' | 'arena' | 'tower' | 'explore'
  | 'gamble' | 'bankrupt' | 'artisan' | 'quest' | 'guild';

export interface FeedEvent {
  id: string;
  at: number;
  kind: FeedKind;
  text: string;
  /** 내 이벤트인가 (강조 표시) */
  mine?: boolean;
  /** 희귀/대형 이벤트 — 반전 강조 */
  hot?: boolean;
  /**
   * 내 화면에 먼저 올린 줄. 서버본이 돌아오면 이 줄을 덮어쓴다.
   * (chat.ts 의 `pending` 과 같은 이유 — 로컬 id 와 서버 id 가 달라서
   *  가만두면 내 사건만 두 번씩 뜬다)
   */
  pending?: boolean;
}

let seq = 0;
const nextId = () => `f${Date.now().toString(36)}-${(seq++).toString(36)}`;

/**
 * 내 이벤트.
 *
 * 서버에 올라가기 전에 **내 화면에는 먼저 올린다** — 강화를 성공했는데 왕복
 * 한 번을 기다렸다가 줄이 뜨면 내가 한 일 같지가 않다. 서버가 되밀어 주는
 * 같은 줄은 live.ts 가 걸러 낸다.
 */
export function mineEvent(kind: FeedKind, text: string, hot = false): FeedEvent {
  return { id: nextId(), at: Date.now(), kind, text, mine: true, hot, pending: true };
}

/** 화면에 들고 있는 최대 줄 수 */
export const FEED_CAP = 60;
