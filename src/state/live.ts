/**
 * 실시간 계층 — 이벤트 피드와 채팅.
 * 게임 스토어와 분리해 둔다. 1~10초마다 갱신되는 소셜 데이터가
 * 게임 화면 전체를 리렌더시키면 안 되기 때문.
 *
 * 예전엔 이 두 가지가 전부 시뮬레이션이었다 (`fakeEvent`, `createMockTransport`).
 * 지금은 **전부 서버를 거친다** (`net.ts`). 규칙은 하나다:
 *
 *   내가 한 일은 **내 화면에 먼저** 올리고, 서버에는 그 다음에 올린다.
 *
 * 왕복 한 번을 기다렸다가 내 강화 성공이 뜨면 내가 한 일 같지 않고, 네트워크가
 * 흔들릴 때 내 화면만 조용해진다. 대신 서버가 그 줄을 다시 밀어 줄 때
 * **내가 보낸 것은 걸러 낸다** — 안 그러면 내 사건만 두 번씩 뜬다.
 */
import { create } from 'zustand';
import {
  CHANNELS, CHAT_HISTORY_MAX, CHAT_MAX_LEN, ChannelId, ChatBadge, ChatMessage, ChatTransport,
  SEND_MSG, SendResult, newMessageId,
} from '@/core/chat';
import { FEED_CAP, FeedEvent, FeedKind, mineEvent } from '@/core/feed';
import { absorb } from '@/core/optimistic';
import { maskProfanity } from '@/core/profanity';
import type { BattleView } from '@/ui/CombatFx';
import {
  fetchChat, fetchFeed, joinPresence, netEnabled, onChat, onFeed, publishChat, publishFeed,
} from './net';
import { lastCloudAuthError } from './googleAuth';
import { startPolling } from './poller';

// ── 이벤트 피드 ────────────────────────────────────────
interface FeedState {
  events: FeedEvent[];
  /** 서버에서 첫 묶음을 받아 왔는가 — 빈 피드와 "아직 안 받음" 은 다른 상태다 */
  loaded: boolean;
  push: (e: FeedEvent) => void;
  /** 서버가 밀어 준 남의 사건 */
  receive: (e: FeedEvent) => void;
  /** 최근 것을 한 번에 채운다 (들어올 때) */
  hydrate: (list: FeedEvent[]) => void;
  clear: () => void;
}

export const useFeed = create<FeedState>()((set) => ({
  events: [],
  loaded: false,
  push: (e) => set((s) => ({ events: [e, ...s.events].slice(0, FEED_CAP) })),
  receive: (e) =>
    set((s) => {
      // 같은 줄이 두 번 오면 무시하고, 내 것이면 먼저 올려 둔 줄을 덮는다
      const next = absorb(s.events, e);
      if (!next) return s;
      return { events: [...next].sort((a, b) => b.at - a.at).slice(0, FEED_CAP) };
    }),
  hydrate: (list) =>
    set((s) => {
      let events = s.events;
      // 오래된 것부터 넣어야 짝짓기(absorb)가 시간 순서대로 맞는다
      for (const e of [...list].sort((a, b) => a.at - b.at)) {
        const next = absorb(events, e);
        if (next) events = next;
      }
      // 바뀐 게 없어도 새 배열로 정렬한다 — 스토어의 배열을 제자리에서 뒤집으면 안 된다
      return { events: [...events].sort((a, b) => b.at - a.at).slice(0, FEED_CAP), loaded: true };
    }),
  clear: () => set({ events: [] }),
}));

/**
 * 게임 스토어에서 내 이벤트를 피드에 올릴 때 쓰는 진입점.
 * 내 화면에 먼저 얹고, 서버로는 뒤따라 보낸다 (실패해도 게임은 계속 간다).
 */
export function pushMyEvent(kind: FeedKind, text: string, hot = false) {
  useFeed.getState().push(mineEvent(kind, text, hot));
  void publishFeed(kind, text, hot);
}

// ── 채팅 ───────────────────────────────────────────────
/**
 * 채널별로 나눠 담는다.
 *
 * 한 배열에 넣고 화면에서 걸러 내면 스크롤백 상한(100개)이 채널끼리 서로를 밀어낸다 —
 * 전체 채팅이 시끄러운 시간대에는 길드 대화가 몇 분 만에 사라진다.
 * 안 읽음도 채널마다 따로 센다. 뱃지는 합계를 쓴다.
 */
type ByChannel<T> = Record<ChannelId, T>;

const emptyBy = <T>(make: (c: ChannelId) => T): ByChannel<T> =>
  Object.fromEntries(CHANNELS.map((c) => [c, make(c)])) as ByChannel<T>;

interface ChatState {
  messages: ByChannel<ChatMessage[]>;
  unread: ByChannel<number>;
  open: boolean;
  /** 지금 보고 있는 채널 */
  channel: ChannelId;
  /** 내 표시 이름 */
  nick: string;
  /** 내 길드 — 길드 채널로 보낼 때 서버가 이 값으로 수신자를 가른다 */
  guildId: string | null;
  transport: ChatTransport;
  /**
   * 소켓이 **실제로** 붙어 있는가.
   *
   * 붙어 있으면 남의 말이 즉시 온다. 안 붙어 있어도 채팅이 죽는 건 아니고
   * 재확인(25초)이 주워 온다 — 그래서 화면에 "끊김" 이 아니라 어느 쪽인지를 적는다.
   */
  connected: boolean;
  /** 지금 켜 두고 있는 사람 수 (Presence) */
  online: number;
  /** 채널마다 첫 묶음을 받았는가 — 첫 묶음만 '안 읽음' 을 안 센다 */
  hydrated: ByChannel<boolean>;

  receive: (m: ChatMessage) => void;
  /** 지난 대화를 한 번에 채운다 — 안 읽음은 건드리지 않는다 */
  hydrate: (channel: ChannelId, list: ChatMessage[]) => void;
  send: (text: string, badge?: ChatBadge) => void;
  setOpen: (open: boolean) => void;
  setChannel: (c: ChannelId) => void;
  /** 내 이름·길드를 알려 준다 (스토어가 바뀔 때 화면이 넘긴다) */
  setIdentity: (nick: string, guildId: string | null) => void;
  /** 시스템 공지 한 줄 (길드 가입·탈퇴 등) */
  system: (channel: ChannelId, text: string) => void;
  /** 전송 실패 사유를 채널에 한 번만 알린다 */
  explain: (channel: ChannelId, reason: Exclude<SendResult, 'ok'>) => void;
  connect: () => () => void;
  setTransport: (t: ChatTransport) => void;
}

/**
 * 소켓이 놓친 것을 주워 오는 간격.
 *
 * 25초다. 이보다 짧으면 소켓이 멀쩡할 때 하는 헛일이 늘고, 길면 소켓이 죽었을 때
 * 대화가 끊긴 것처럼 보인다. 한 번에 서른 줄만 확인하므로 왕복이 가볍다.
 */
const RECHECK_MS = 25_000;

/** 이미 설명한 실패 사유 — 같은 말을 매번 반복하지 않는다 */
const explained = new Set<string>();

const WELCOME: Record<ChannelId, string> = {
  all: '전체 채팅에 입장했습니다. 서로 예의를 지켜주세요.',
  guild: '길드 채팅입니다. 여기 오간 말은 길드원만 봅니다.',
};

/**
 * Supabase Realtime 전송 계층.
 *
 * 자격증명이 없는 빌드에서는 `netEnabled()` 가 false 라 아무것도 안 하고
 * 조용히 물러난다 — 로컬 개발에서 채팅창이 열리긴 하되 나 혼자 있는 방이 된다.
 */
function supabaseTransport(): ChatTransport {
  return {
    name: netEnabled() ? 'supabase' : 'off',

    connect(onMessage, onReady) {
      if (!netEnabled()) {
        onReady?.(false);
        return () => {};
      }
      /*
        지난 대화를 먼저 채운다 — 빈 방에 들어온 사람은 아무도 없다고 생각한다.
        ⚠ 이건 `receive` 가 아니라 `hydrate` 로 넣는다. 예순 줄을 receive 로
        밀면 안 읽음이 60 이 되어, 처음 켠 사람이 읽지도 않은 말에 뱃지를 본다.
      */
      for (const ch of CHANNELS) {
        void fetchChat(ch).then((list) => useChat.getState().hydrate(ch, list));
      }
      /*
        내가 보낸 것도 **그대로 받는다.**

        예전엔 여기서 걸러 냈다 — 내 화면에는 이미 올라가 있으니까. 그런데 그러면
        내가 올린 줄이 계속 `pending` 인 채로 남아, 소켓이 놓친 걸 줍는 재확인이
        같은 말을 하나 더 얹었다 (id 가 달라 같은 것인 줄 몰랐다).
        지금은 받아서 **덮는다** — 로컬 줄이 서버 줄로 갈리고, 그때 pending 이 풀린다.
      */
      const off = onChat((m) => onMessage(m), (live) => onReady?.(live));

      /*
        소켓이 전부는 아니다.

        WebSocket 은 조용히 죽는다 — 지하철, 사내 프록시, 절전 상태에서 깨어난
        브라우저. 그때 채팅이 **멈춘 줄도 모르고** 멈춰 있는 게 제일 나쁘다.
        그래서 낮은 빈도로 한 번 더 확인한다. 소켓이 살아 있으면 받아 온 게
        전부 이미 있는 줄이라 아무 일도 안 일어나고(hydrate 가 id 로 거른다),
        죽어 있으면 최대 이 간격만큼만 늦는다.
      */
      const stopPoll = startPolling(() => {
        for (const ch of CHANNELS) {
          void fetchChat(ch, 30).then((list) => useChat.getState().hydrate(ch, list));
        }
      }, RECHECK_MS);

      // 접속자 수는 표를 안 쓰고 Realtime Presence 로 센다
      const offPresence = joinPresence((n) => useChat.setState({ online: n }));

      return () => {
        stopPoll();
        offPresence();
        off();
      };
    },

    send: (msg) => publishChat(msg.channel, msg.text, msg.nick, msg.guildId, msg.badge),
  };
}

export const useChat = create<ChatState>()((set, get) => ({
  /*
    안내 한 줄. `at: 0` 이다 — 메시지는 서버 시각으로 정렬하는데, 지난 대화를
    받아 오면 그게 지금보다 옛날이라 안내문이 맨 아래로 밀린다.
  */
  messages: emptyBy((c) => [
    { id: newMessageId(), at: 0, channel: c, nick: '', text: WELCOME[c], system: true },
  ]),
  unread: emptyBy(() => 0),
  hydrated: emptyBy(() => false),
  online: 0,
  open: false,
  channel: 'all',
  nick: '나',
  guildId: null,
  transport: supabaseTransport(),
  connected: false,

  receive: (m) =>
    set((s) => {
      const ch: ChannelId = m.channel ?? 'all';
      // 서버가 같은 줄을 두 번 밀어도(재연결) 한 번만 남긴다.
      // 내 말이면 먼저 올려 둔 줄을 덮는다 (absorb)
      const merged = absorb(s.messages[ch], m);
      if (!merged) return s;
      // 열려 있어도 **보고 있는 채널이 아니면** 안 읽음으로 센다
      const seen = s.open && s.channel === ch;
      return {
        messages: {
          ...s.messages,
          // 서버 시각 기준으로 줄을 세운다 — 늦게 도착한 옛 말이 맨 아래 붙으면 안 된다
          [ch]: merged.sort((a, b) => a.at - b.at).slice(-CHAT_HISTORY_MAX),
        },
        unread: { ...s.unread, [ch]: seen || m.mine ? s.unread[ch] : s.unread[ch] + 1 },
      };
    }),

  send: (text, badge) => {
    /*
      욕은 **막지 않고 가린다.**

      전송을 막으면 왜 안 갔는지 알 수 없어 같은 말을 세 번 치게 되고, 그 사이
      대화는 이미 다른 데로 가 있다. 별표로 덮어서 보내면 말은 흐르고, 친 사람도
      자기 화면에서 별표를 보고 무엇이 걸렸는지 바로 안다.
      가린 뒤에 길이를 자른다 — 자르고 가리면 끝에 걸친 욕이 반 토막 나서 빠져나간다.
    */
    const t = maskProfanity(text.trim()).slice(0, CHAT_MAX_LEN);
    if (!t) return;
    const { transport, nick, channel, guildId, receive } = get();
    // 내 명패도 남들과 같은 규칙으로 붙인다 — 내 말풍선만 맨몸이면 어색하다.
    // ⚠ 여기서 useGame 을 직접 읽으면 안 된다 — store.ts 가 이 파일을 import
    //   하고 있어 순환이 된다. 그래서 부르는 쪽(Chat)이 명패를 넘긴다.
    const id = newMessageId();
    const msg: ChatMessage = {
      id, at: Date.now(), channel, nick, text: t, mine: true, pending: true, ...badge,
    };
    receive(msg);
    void transport
      .send({ channel, text: t, nick, guildId, badge: badge ?? {} })
      .then((res) => {
        if (res === 'ok') return;
        // 못 갔으면 그 말풍선에 표시를 남긴다 — 아무도 대답 안 하는 이유가 보여야 한다
        set((s) => ({
          messages: {
            ...s.messages,
            /*
              못 갔으니 pending 도 푼다 — 안 그러면 나중에 내가 같은 말을 다시
              쳤을 때 서버본이 **이 실패한 줄**을 짝으로 잡아 덮어 버린다.
            */
            [channel]: s.messages[channel].map(
              (m) => (m.id === id ? { ...m, failed: true, pending: false } : m)),
          },
        }));
        /*
          그리고 **왜** 못 갔는지를 한 번 말한다.

          "전송 실패" 만 뜨면 고칠 수 있는 사람도 못 고친다 — 스키마를 아직 안
          올려서 표가 없는 경우가 실제로 있었다. 같은 사유를 매번 반복하면
          그것대로 시끄러우니, 사유별로 한 번씩만 남긴다.
        */
        get().explain(channel, res);
      });
  },

  hydrate: (channel, list) =>
    set((s) => {
      const first = !s.hydrated[channel];
      let msgs = s.messages[channel];
      let added = 0;
      // 오래된 것부터 — 짝짓기가 시간 순서대로 맞아야 한다
      for (const m of [...list].sort((a, b) => a.at - b.at)) {
        const next = absorb(msgs, m);
        if (!next) continue;
        // 내 말을 덮어쓴 경우는 '새로 온 말' 이 아니다 (길이가 안 는다)
        if (next.length > msgs.length && !m.mine && !m.system) added += 1;
        msgs = next;
      }
      // 바뀐 게 하나도 없으면 상태를 새로 만들지 않는다 (불필요한 리렌더)
      if (msgs === s.messages[channel]) {
        return first ? { hydrated: { ...s.hydrated, [channel]: true } } : s;
      }
      /*
        첫 묶음(들어올 때 받는 지난 대화)은 안 읽음으로 세지 않는다 — 예순 줄이
        그대로 뱃지가 되면 처음 켠 사람이 읽지도 않은 말에 60 을 본다.
        그 뒤의 묶음은 **소켓이 놓친 새 말**이므로 평소처럼 센다.
      */
      const looking = s.open && s.channel === channel;
      const unseen = first || looking ? 0 : added;
      return {
        hydrated: { ...s.hydrated, [channel]: true },
        messages: { ...s.messages, [channel]: msgs.sort((a, b) => a.at - b.at).slice(-CHAT_HISTORY_MAX) },
        unread: { ...s.unread, [channel]: s.unread[channel] + unseen },
      };
    }),

  setOpen: (open) =>
    set((s) => (open ? { open, unread: { ...s.unread, [s.channel]: 0 } } : { open })),

  setChannel: (c) => set((s) => ({ channel: c, unread: { ...s.unread, [c]: 0 } })),

  setIdentity: (nick, guildId) =>
    set((s) => (s.nick === nick && s.guildId === guildId ? s : { nick, guildId })),

  system: (channel, text) =>
    get().receive({
      id: newMessageId(), at: Date.now(), channel, nick: '', text, system: true,
    }),

  explain: (channel, reason) => {
    if (explained.has(reason)) return;
    explained.add(reason);
    // 세션 문제는 사유가 따로 기록돼 있다 — 설정 화면까지 안 가도 보이게 붙여 준다
    const detail = reason === 'no-session' ? lastCloudAuthError() : null;
    get().system(channel, detail ? `${SEND_MSG[reason]} (${detail})` : SEND_MSG[reason]);
  },

  /** 전송 계층 연결. 정리 함수를 돌려준다. */
  connect: () => {
    const { transport, receive } = get();
    const off = transport.connect(receive, (ok) => set({ connected: ok }));
    return () => {
      off();
      set({ connected: false });
    };
  },

  setTransport: (t) => set({ transport: t }),
}));

/** 뱃지에 쓰는 전체 안 읽음 수 */
export const totalUnread = (u: Record<ChannelId, number>) =>
  CHANNELS.reduce((a, c) => a + (u[c] ?? 0), 0);

/** 스토어에서 길드 채널에 공지 한 줄 올릴 때 쓰는 진입점 */
export function pushGuildNotice(text: string) {
  useChat.getState().system('guild', text);
}

// ── 피드 연결 ──────────────────────────────────────────
/**
 * 실시간 피드를 서버에 붙인다. App 의 `useLive` 가 부른다.
 * 최근 것을 한 번 받아 채운 뒤, 새로 들어오는 것만 얹는다.
 */
export function connectFeed(): () => void {
  if (!netEnabled()) {
    useFeed.setState({ loaded: true });
    return () => {};
  }
  const pull = () => void fetchFeed().then((list) => useFeed.getState().hydrate(list));
  // 내 사건도 그대로 받는다 — receive 가 먼저 올려 둔 줄을 덮는다 (채팅과 같은 이유)
  const off = onFeed((e) => useFeed.getState().receive(e));
  // 채팅과 같은 이유의 안전망 — 소켓이 죽어도 피드가 멈춘 채로 남지 않게
  const stopPoll = startPolling(pull, RECHECK_MS);
  return () => {
    stopPoll();
    off();
  };
}

// ── 전투 연출 ──────────────────────────────────────────

/**
 * 연출에 필요한 필드는 CombatFx 가 정의한다 (BattleView).
 * 여기서 따로 적어 두면 결투 모드처럼 필드가 늘 때마다 두 곳을 고쳐야 한다.
 */
export type Battle = BattleView;

interface BattleState {
  battle: Battle | null;
  /** 연출이 끝나면 부를 콜백. 화면이 결과 팝업을 여는 자리다 */
  after: (() => void) | null;
  /**
   * 연출을 띄운다. `after` 는 **연출이 끝난 뒤** 부른다 (건너뛰어도 부른다).
   *
   * 결과 팝업은 반드시 이 콜백에서 열어야 한다. 부르는 쪽에서 `show()` 바로
   * 뒤에 팝업을 열면 둘이 같은 프레임에 겹쳐 뜬다 — 레이드에서 실제로 그랬다.
   * 싸우는 걸 보고 나서 얼마나 때렸는지를 본다.
   */
  show: (b: Battle, after?: () => void) => void;
  clear: () => void;
}

/**
 * 전투 연출은 앱 루트에서 렌더한다.
 * 화면의 ScrollView 안에 두면 absolute 좌표가 스크롤 콘텐츠 기준이 되어
 * 스크롤을 내린 상태에서는 화면 밖에 그려진다.
 */
export const useBattle = create<BattleState>()((set, get) => ({
  battle: null,
  after: null,
  show: (b, after) => set({ battle: b, after: after ?? null }),
  /**
   * 연출을 닫는다. 끝까지 본 타이머와 화면을 눌러 건너뛴 손가락이 **둘 다**
   * 여기로 온다. `battle` 이 이미 null 이면 아무것도 안 한다 —
   * 안 그러면 연타했을 때 결과 팝업이 두 번 열린다.
   */
  clear: () => {
    const { battle, after } = get();
    if (!battle) return;
    set({ battle: null, after: null });
    after?.();
  },
}));
