/**
 * 채팅 도메인.
 *
 * 예전엔 `createMockTransport` 가 4~11초마다 가짜 플레이어의 말을 지어내
 * 넣었다. 이제 오가는 말은 전부 사람이 친 것이다 — 전송 계층 구현은
 * `state/net.ts` (Supabase Realtime) 하나뿐이고, 여기에는 **모양과 규칙**만 남는다.
 * 인터페이스를 그대로 둔 덕에 UI 는 한 줄도 안 바뀌었다.
 */
import { TitleId } from './titles';

/**
 * 채널.
 *
 * 전체 채팅에 길드 얘기를 하면 아무도 안 읽고, 길드 채팅에 거래 얘기를 하면
 * 볼 사람이 스무 명뿐이다. 방을 나누는 대신 **한 창 안에서 채널만 가른다** —
 * 창을 두 개 만들면 안 읽은 뱃지도 두 개가 되고, 둘 다 안 보게 된다.
 */
export const CHANNELS = ['all', 'guild'] as const;
export type ChannelId = (typeof CHANNELS)[number];

export const CHANNEL_LABEL: Record<ChannelId, string> = {
  all: '전체',
  guild: '길드',
};

export interface ChatMessage {
  id: string;
  at: number;
  /** 어느 채널의 말인가. 없으면 전체로 본다 (옛 메시지 호환) */
  channel?: ChannelId;
  nick: string;
  text: string;
  /** 내가 보낸 메시지 */
  mine?: boolean;
  /** 시스템 공지 */
  system?: boolean;
  /**
   * 말한 사람의 명패 — 닉네임만 있으면 누가 고인물이고 누가 갓 시작한 사람인지
   * 알 수 없다. 둘 다 **보내는 시점의 값**을 그대로 박아 둔다. 나중에 바뀌어도
   * 지난 말풍선은 그때 그대로 남는 게 맞다 (채팅은 기록이지 현재 상태가 아니다).
   */
  title?: TitleId;
  /** 아이템레벨 순위. 1 이 최고 */
  rank?: number;
  /**
   * 서버까지 못 간 말. 내 화면에는 이미 떠 있는데 남에게는 안 갔다 —
   * 그걸 안 알려 주면 아무도 대답을 안 하는 이유를 알 수 없다.
   */
  failed?: boolean;
  /**
   * 내가 방금 쳤고 아직 서버본이 안 돌아온 말 (낙관적 표시).
   *
   * ⚠ 이 표시가 **중복의 열쇠다.** 내 말은 화면에 먼저 올라가고(로컬 id `c…`)
   * 나중에 서버본이 같은 말을 다시 들고 온다(서버 id `s…`). id 가 다르니
   * "같은 말" 인 줄 모르고 두 번 쌓였다. 서버본이 오면 이 표시가 붙은 줄을
   * **덮어쓴다** — 새로 추가하지 않는다.
   */
  pending?: boolean;
}

/** 말한 사람의 명패 — 보내는 쪽이 만들어 넘긴다 */
export type ChatBadge = Pick<ChatMessage, 'title' | 'rank'>;

/** 스크롤백 상한 — 최대 100개까지 거슬러 올라가 볼 수 있다 */
export const CHAT_HISTORY_MAX = 100;
/** 한 번에 보낼 수 있는 길이 */
export const CHAT_MAX_LEN = 200;

/**
 * 안 읽은 개수 뱃지 표기 (카카오톡 방식).
 *   0 → 표시 없음, 1~100 → 그대로, 101 이상 → "100+"
 */
export function formatUnread(n: number): string {
  if (n <= 0) return '';
  if (n > 100) return '100+';
  return String(n);
}

// ── 전송 계층 ──────────────────────────────────────────
/**
 * 내보내는 한 줄.
 *
 * 닉네임과 명패를 **보내는 쪽이 실어 준다.** 전송 계층이 게임 스토어를 읽으면
 * core → state 방향의 의존이 생기고, 순환 import 로 되돌아온다.
 */
export interface OutgoingChat {
  channel: ChannelId;
  text: string;
  nick: string;
  /** 길드 채널일 때 어느 길드인가 */
  guildId: string | null;
  badge: ChatBadge;
}

/**
 * 못 간 이유.
 *
 * "전송 실패" 만 띄우면 고칠 수 있는 사람도 못 고친다. 베타에서 실제로 그랬다 —
 * 서버에 스키마를 아직 안 올려서 표가 없었는데, 화면에는 그냥 실패라고만 떴다.
 */
export type SendResult = 'ok' | 'no-table' | 'denied' | 'no-session' | 'offline' | 'error';

export const SEND_MSG: Record<Exclude<SendResult, 'ok'>, string> = {
  'no-table': '서버에 채팅 표가 아직 없습니다 (supabase/schema.sql 을 실행하세요).',
  denied: '이 채널에 쓸 권한이 없습니다 — 길드 채팅은 길드원만 쓸 수 있습니다.',
  // 구글 로그인은 됐는데 서버 세션이 없는 상태. 겉보기엔 로그인이 돼 있어서 제일 헷갈린다
  'no-session': '서버 세션이 없습니다 — 로그아웃 후 다시 로그인해 주세요 (기타 › 설정 › 클라우드 저장에 사유가 적혀 있습니다).',
  offline: '서버에 연결되어 있지 않습니다.',
  error: '메시지를 보내지 못했습니다.',
};

export interface ChatTransport {
  /** 수신 시작. 정리 함수를 돌려준다. */
  connect(onMessage: (m: ChatMessage) => void, onReady?: (ok: boolean) => void): () => void;
  /** 보냈는가. 실패하면 화면이 그 말풍선을 "안 감" 으로 표시하고 사유를 한 번 알린다 */
  send(msg: OutgoingChat): Promise<SendResult>;
  readonly name: string;
}

let seq = 0;
export const newMessageId = () => `c${Date.now().toString(36)}-${(seq++).toString(36)}`;
