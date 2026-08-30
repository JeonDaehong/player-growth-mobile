/**
 * 멀티플레이 계층 — 랭킹 · 실시간 피드 · 채팅 · 투기장 상대.
 *
 * 여기까지가 "남이 보이는" 전부다. 게임 판정은 여전히 한 줄도 서버로 안 갔고
 * (server-design/00-ROADMAP.md §2), 서버가 하는 일은 **각자가 올린 것을 모아
 * 나눠 주는 것**뿐이다. 표는 셋이다:
 *
 *   profiles       내 공개 한 줄  → 랭킹 · 투기장 상대 · 채팅 명패
 *   feed_events    내가 한 일     → 홈 화면 실시간 상황
 *   chat_messages  내가 한 말     → 전체 · 길드 채널
 *
 * 규칙
 *   · **이 모듈은 없어도 게임이 돌아야 한다.** 자격증명이 없는 빌드(로컬 개발)나
 *     네트워크가 끊긴 순간에 흰 화면이 나면 안 된다. 모든 함수는 실패해도 던지지
 *     않고 빈 값으로 물러난다 — 다른 사람이 안 보일 뿐이다.
 *   · 실시간은 postgres_changes 를 쓴다. RLS 가 그대로 적용되므로,
 *     길드 채팅은 그 길드 사람에게만 도착한다 (supabase/schema.sql).
 *   · 프로필 업로드는 **throttle 한다.** 주식은 초당 움직이고 순자산은 거기 딸려
 *     움직인다 — 바뀔 때마다 올리면 베타 30명이 무료 티어를 하루에 태운다.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { client, cloudConfigured } from './supabase';
import type { Equipped } from '@/core/tiers';
import type { Item } from '@/core/types';
import { DEFAULT_AVATAR, isAvatarId, type AvatarId } from '@/core/avatars';
import type { ChannelId, ChatMessage, SendResult } from '@/core/chat';
import { maskProfanity } from '@/core/profanity';
import type { FeedEvent, FeedKind } from '@/core/feed';
import type { TitleId } from '@/core/titles';
import { EMPTY_GUILD_STATS, readGuildStats, type GuildStats } from '@/core/guilds';

/** 서버에 실려 있는 남의 프로필 한 줄 */
export interface NetProfile {
  userId: string;
  nick: string;
  avatar: AvatarId;
  ilvl: number;
  /** 내구도가 깎인 뒤의 실효 아이템레벨 — 투기장에서 실제로 붙는 값 */
  curIlvl: number;
  dur: number;
  net: number;
  arenaPoints: number;
  wins: number;
  losses: number;
  gear: Equipped;
  /** 창고에 있는 무기들 — 무기 랭킹이 가진 것 전부를 세운다 */
  weapons: Item[];
  guildId: string | null;
  guildName: string | null;
  title: TitleId | null;
  /** 길드에서 남이 봐야 하는 내 수치 (기여도 · 출석 · 레이드/보스 피해) */
  guildStats: GuildStats;
  updatedAt: number;
}

/** 내가 올리는 것 */
export interface MyProfile {
  nick: string;
  avatar: AvatarId;
  ilvl: number;
  curIlvl: number;
  dur: number;
  net: number;
  arenaPoints: number;
  wins: number;
  losses: number;
  gear: Equipped;
  weapons: Item[];
  guildId: string | null;
  guildName: string | null;
  title: TitleId | null;
  guildStats: GuildStats;
}

/** 이 빌드에서 멀티플레이가 켜져 있는가 (자격증명이 있는가) */
export const netEnabled = cloudConfigured;

// ── 로그인한 나 ────────────────────────────────────────
/**
 * 내 사용자 id 를 한 번만 읽어 들고 있는다.
 *
 * ⚠ `getUser()` 가 아니라 **`getSession()`** 이다.
 *   · `getUser()` 는 매번 서버에 물어본다. 채팅 한 줄 보낼 때마다 왕복이 두 번이 된다.
 *   · 더 나쁜 건 **타이밍**이다. supabase-js 는 저장소(localStorage)에서 세션을
 *     비동기로 복원하는데, 그 전에 `getUser()` 를 부르면 "세션 없음" 이 돌아온다.
 *     앱이 막 켜진 순간이 정확히 그때라, 멀쩡한 세션을 두고도 로그인이 안 된 것처럼
 *     보였다. `getSession()` 은 복원이 끝날 때까지 기다렸다가 답한다.
 *
 * 실패는 캐시하지 않는다 — 세션이 늦게 열려도 다음 호출에서 주워 담는다.
 */
let uid: string | null = null;

export async function myUserId(): Promise<string | null> {
  if (uid) return uid;
  const c = client();
  if (!c) return null;
  try {
    const { data } = await c.auth.getSession();
    uid = data.session?.user?.id ?? null;
    return uid;
  } catch {
    return null;
  }
}

/** 로그아웃·계정 전환 때 부른다 */
export function forgetUser() {
  uid = null;
}

/**
 * 세션을 새로 연 뒤 캐시를 갱신한다 (설정 화면의 "서버 세션 다시 열기").
 * 성공하면 user_id, 아니면 null.
 */
export async function refreshUserId(): Promise<string | null> {
  forgetUser();
  return myUserId();
}

// ── 프로필 ─────────────────────────────────────────────
type Row = Record<string, unknown>;

const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);

/**
 * 창고 무기를 **`gear` 칸 안에** 실어 보낸다.
 *
 * 칼럼을 새로 만드는 게 정석이지만, 이 게임의 서버 스키마는 각자 자기 Supabase 에
 * 올려 쓰는 것이다. 칼럼을 늘리면 이미 올려 둔 사람은 `alter table` 을 직접 돌려야
 * 하고, **안 돌리면 upsert 가 통째로 실패해 프로필이 조용히 멈춘다** — 랭킹이
 * 얼어붙는데 아무 메시지도 안 뜨는, 제일 찾기 어려운 종류의 고장이다.
 *
 * `gear` 는 이미 이 앱만 읽고 쓰는 자유 형식 jsonb 다. "낀 무기" 옆에 "가진 무기" 를
 * 같은 문서에 두는 건 내용상으로도 어색하지 않다. 읽는 쪽은 슬롯 키만 훑으므로
 * (`SLOT_IDS`) `bag` 키가 섞여 있어도 옛 클라이언트가 깨지지 않는다.
 *
 * ⚠ 대신 **개수를 자른다.** 창고를 수백 개 쌓아 둔 사람의 프로필 한 줄이 수백 KB 가
 * 되면 순위표를 받는 모두가 그걸 내려받게 된다. 좋은 것부터 20자루면 어느 판에서든
 * 순위에 걸릴 것은 다 들어간다.
 */
const BAG_MAX = 20;

type GearPayload = Equipped & { bag?: Item[] };

const readGear = (v: unknown): Equipped => {
  if (!v || typeof v !== 'object') return {};
  const { bag, ...rest } = v as GearPayload;
  void bag;
  return rest as Equipped;
};

const readBag = (v: unknown): Item[] => {
  if (!v || typeof v !== 'object') return [];
  const bag = (v as GearPayload).bag;
  return Array.isArray(bag) ? (bag as Item[]) : [];
};

function toProfile(r: Row): NetProfile {
  return {
    userId: str(r.user_id),
    nick: str(r.nick, '이름없음'),
    // 서버 값은 남이 올린 문자열이다 — 모르는 값이면 스프라이트가 통째로 안 뜬다
    avatar: isAvatarId(str(r.avatar)) ? (r.avatar as AvatarId) : DEFAULT_AVATAR,
    ilvl: num(r.ilvl),
    curIlvl: num(r.cur_ilvl, num(r.ilvl)),
    dur: num(r.dur, 100),
    net: num(r.net),
    arenaPoints: num(r.arena_points),
    wins: num(r.wins),
    losses: num(r.losses),
    gear: readGear(r.gear),
    weapons: readBag(r.gear),
    guildId: typeof r.guild_id === 'string' ? r.guild_id : null,
    guildName: typeof r.guild_name === 'string' ? r.guild_name : null,
    title: typeof r.title === 'string' ? (r.title as TitleId) : null,
    guildStats: readGuildStats(r.guild_stats),
    updatedAt: Date.parse(str(r.updated_at)) || 0,
  };
}

/**
 * 내 프로필을 올린다.
 *
 * 같은 내용이면 보내지 않고, 너무 자주 부르면 마지막 것만 남겨 뒤로 미룬다.
 * 랭킹은 초 단위로 정확할 필요가 없다 — "몇 분 전의 저 사람" 이면 충분하다.
 */
const PUBLISH_MIN_GAP = 20_000;

let lastPublishAt = 0;
let lastPublished = '';
let pending: MyProfile | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

export async function publishProfile(p: MyProfile, force = false): Promise<void> {
  if (!cloudConfigured()) return;
  const body = JSON.stringify(p);
  if (!force && body === lastPublished) return;

  const now = Date.now();
  const wait = force ? 0 : PUBLISH_MIN_GAP - (now - lastPublishAt);
  if (wait > 0) {
    // 지금은 이르다 — 마지막 상태만 들고 있다가 시간이 되면 그것만 올린다
    pending = p;
    if (!pendingTimer) {
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        const next = pending;
        pending = null;
        if (next) void publishProfile(next);
      }, wait);
    }
    return;
  }

  const c = client();
  const id = await myUserId();
  if (!c || !id) return;

  lastPublishAt = Date.now();
  lastPublished = body;
  try {
    await c.from('profiles').upsert(
      {
        user_id: id,
        nick: p.nick,
        avatar: p.avatar,
        ilvl: Math.round(p.ilvl),
        cur_ilvl: Math.round(p.curIlvl),
        dur: Math.round(p.dur),
        net: Math.round(p.net),
        arena_points: Math.round(p.arenaPoints),
        wins: Math.round(p.wins),
        losses: Math.round(p.losses),
        gear: { ...p.gear, bag: p.weapons.slice(0, BAG_MAX) } satisfies GearPayload,
        guild_id: p.guildId,
        guild_name: p.guildName,
        title: p.title,
        guild_stats: p.guildStats ?? EMPTY_GUILD_STATS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
  } catch {
    // 랭킹에 몇 분 늦게 올라갈 뿐이다. 다음 호출이 다시 시도한다
    lastPublished = '';
  }
}

/** 랭킹 정렬 기준 → profiles 의 컬럼 */
const ORDER: Record<'ilvl' | 'net' | 'arena', string> = {
  ilvl: 'ilvl',
  net: 'net',
  arena: 'arena_points',
};

/**
 * 랭킹 한 판.
 *
 * 세 판을 각각 서버에서 정렬해 받는 대신 **한 번에 다 받아 클라이언트에서 정렬한다.**
 * 베타 인구는 수십 명이고, 그래야 탭을 옮길 때마다 왕복하지 않는다.
 * 인구가 수천을 넘으면 그때 `ORDER` 로 쪼개면 된다.
 */
export async function fetchProfiles(limit = 500): Promise<NetProfile[]> {
  const c = client();
  if (!c) return [];
  try {
    const { data, error } = await c
      .from('profiles')
      .select('*')
      .order(ORDER.ilvl, { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Row[]).map(toProfile);
  } catch {
    return [];
  }
}

/** 프로필이 바뀔 때마다 알려 준다 (랭킹 화면이 켜져 있는 동안만 붙인다) */
export function onProfiles(cb: (p: NetProfile) => void): () => void {
  return subscribe('profiles', '*', (row) => cb(toProfile(row)));
}

// ── 투기장 상대 ────────────────────────────────────────
/**
 * 붙을 만한 상대를 모아 온다.
 *
 * 내 실효 템렙의 ±40% 안에서 고른다. 전 인구에서 무작위로 뽑으면 갓 시작한
 * 사람이 +15 랭커를 만나 승률 2% 를 보게 된다 — 그건 대전이 아니라 벌이다.
 * 그 구간에 아무도 없으면(베타 초기) 범위를 풀어 아무나 데려온다 —
 * "상대 없음" 보다는 어려운 상대가 낫다.
 */
export async function fetchOpponents(myCurIlvl: number, limit = 40): Promise<NetProfile[]> {
  const c = client();
  const id = await myUserId();
  if (!c) return [];
  try {
    const lo = Math.floor(myCurIlvl * 0.6);
    const hi = Math.ceil(myCurIlvl * 1.4) + 50;
    const base = () => {
      const q = c.from('profiles').select('*').limit(limit);
      return id ? q.neq('user_id', id) : q;
    };
    const near = await base().gte('cur_ilvl', lo).lte('cur_ilvl', hi);
    const rows = (near.data as Row[] | null) ?? [];
    if (rows.length) return rows.map(toProfile);
    const any = await base();
    return ((any.data as Row[] | null) ?? []).map(toProfile);
  } catch {
    return [];
  }
}

// ── 실시간 피드 ────────────────────────────────────────
function toFeed(r: Row): FeedEvent {
  return {
    id: `s${String(r.id)}`,
    at: Date.parse(str(r.at)) || Date.now(),
    kind: str(r.kind, 'quest') as FeedKind,
    text: str(r.text),
    hot: r.hot === true,
    /*
      ⚠ `mine` 을 반드시 붙인다.

      이게 빠져 있어서 내 사건이 두 줄로 떴다 — 하나는 '나' 뱃지가 붙은 로컬 줄,
      하나는 뱃지 없는 서버 줄. 짝짓기(core/optimistic)는 `mine` 이 참일 때만
      먼저 올려 둔 줄을 덮으므로, 이 한 칸이 비면 서버본이 남의 것으로 취급돼
      그냥 얹힌다. 채팅(toChat)에는 처음부터 있었고 그래서 채팅만 멀쩡했다.
    */
    mine: str(r.user_id) === uid,
  };
}

/** 최근 피드 — 들어오자마자 화면을 채운다 (빈 피드는 죽은 게임처럼 보인다) */
export async function fetchFeed(limit = 40): Promise<FeedEvent[]> {
  const c = client();
  if (!c) return [];
  await myUserId();
  try {
    const { data, error } = await c
      .from('feed_events')
      .select('*')
      .order('at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Row[]).map(toFeed);
  } catch {
    return [];
  }
}

/**
 * 내가 한 일을 올린다.
 *
 * 실패는 조용히 넘긴다 — 남들에게 안 보일 뿐, 내 화면에는 이미 올라가 있다
 * (live.ts 가 낙관적으로 먼저 넣는다).
 */
export async function publishFeed(kind: FeedKind, text: string, hot: boolean): Promise<void> {
  if (!cloudConfigured()) return;
  const c = client();
  const id = await myUserId();
  if (!c || !id) return;
  try {
    await c.from('feed_events').insert({ user_id: id, kind, text, hot });
  } catch {
    /* 무시 */
  }
}

/** 새 피드가 들어올 때마다 (내 것은 이미 화면에 있으므로 걸러 낸다) */
export function onFeed(cb: (e: FeedEvent, fromMe: boolean) => void): () => void {
  return subscribe('feed_events', 'INSERT', (row) => {
    cb(toFeed(row), str(row.user_id) === uid);
  });
}

// ── 채팅 ───────────────────────────────────────────────
/**
 * 서버 줄 → 화면 줄.
 *
 * 욕설은 **보낼 때 한 번, 받을 때 또 한 번** 가린다. 보내는 쪽만 믿으면
 * 필터가 없던 시절의 옛 줄과, 앱을 거치지 않고 표에 바로 꽂은 줄이 그대로
 * 뜬다. 서버가 못 막는 건 받는 쪽에서 막는 수밖에 없다.
 */
function toChat(r: Row): ChatMessage {
  return {
    id: `s${String(r.id)}`,
    at: Date.parse(str(r.at)) || Date.now(),
    channel: (str(r.channel, 'all') as ChannelId),
    nick: maskProfanity(str(r.nick, '이름없음')),
    text: maskProfanity(str(r.text)),
    title: typeof r.title === 'string' ? (r.title as TitleId) : undefined,
    rank: typeof r.rank === 'number' ? r.rank : undefined,
    mine: str(r.user_id) === uid,
  };
}

/** 최근 대화 — 채널마다 따로 받는다 */
export async function fetchChat(channel: ChannelId, limit = 60): Promise<ChatMessage[]> {
  const c = client();
  if (!c) return [];
  // ⚠ 내 id 를 먼저 확정한다 — 없으면 내가 지난번에 한 말이 **남의 말풍선**으로 그려진다
  await myUserId();
  try {
    // 최신 것부터 받아서 뒤집는다 — 오래된 것부터 limit 개를 받으면 옛날 대화만 온다
    const { data, error } = await c
      .from('chat_messages')
      .select('*')
      .eq('channel', channel)
      .order('at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Row[]).map(toChat).reverse();
  } catch {
    return [];
  }
}

/**
 * 실패 사유를 가려낸다.
 *
 * PostgREST 와 Postgres 가 서로 다른 코드 체계를 쓴다:
 *   PGRST205 / PGRST202  스키마 캐시에 그 표가 없다 → 스키마를 아직 안 올렸다
 *   42P01                표가 없다 (Postgres 쪽 표현)
 *   42501 / PGRST301     RLS 가 막았다 (권한 없음)
 */
function sendReason(code?: string, message?: string): Exclude<SendResult, 'ok'> {
  const c = code ?? '';
  if (c === 'PGRST205' || c === 'PGRST202' || c === '42P01') return 'no-table';
  if (c === '42501' || c === 'PGRST301') return 'denied';
  if (/row-level security/i.test(message ?? '')) return 'denied';
  if (/schema cache|does not exist/i.test(message ?? '')) return 'no-table';
  return 'error';
}

export async function publishChat(
  channel: ChannelId,
  text: string,
  nick: string,
  guildId: string | null,
  badge: { title?: TitleId; rank?: number },
): Promise<SendResult> {
  const c = client();
  if (!c) return 'offline';
  const id = await myUserId();
  // 자격증명은 있는데 세션이 없다 — 구글 로그인이 Supabase 까지 못 간 경우다
  if (!id) return 'no-session';
  try {
    const { error } = await c.from('chat_messages').insert({
      user_id: id,
      channel,
      // 프로필에 올린 것과 **정확히 같은 값**이어야 한다 — RLS 가 둘을 대조한다
      guild_id: channel === 'guild' ? guildId : null,
      nick,
      text,
      title: badge.title ?? null,
      rank: badge.rank ?? null,
    });
    if (!error) return 'ok';
    return sendReason(error.code, error.message);
  } catch {
    return 'error';
  }
}

/** 새 메시지. `onLive` 로 소켓이 실제로 붙었는지를 알려 준다 */
export function onChat(
  cb: (m: ChatMessage, fromMe: boolean) => void,
  onLive?: (live: boolean) => void,
): () => void {
  return subscribe('chat_messages', 'INSERT', (row) => {
    cb(toChat(row), str(row.user_id) === uid);
  }, onLive);
}

// ── 실시간 구독 공통 ───────────────────────────────────
/**
 * postgres_changes 한 줄.
 *
 * 채널 이름을 표마다 다르게 준다 — 같은 이름으로 두 번 붙으면 supabase-js 가
 * 앞의 구독을 조용히 갈아치운다 (채팅이 열려 있는 동안 피드가 죽는 식으로).
 */
function subscribe(
  table: string,
  event: 'INSERT' | '*',
  onRow: (row: Row) => void,
  onLive?: (live: boolean) => void,
): () => void {
  const c = client();
  if (!c) { onLive?.(false); return () => {}; }
  let ch: RealtimeChannel | null = null;
  try {
    ch = c
      .channel(`live:${table}:${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes' as never,
        { event, schema: 'public', table } as never,
        (payload: { new?: Row }) => {
          if (payload.new) onRow(payload.new);
        },
      )
      /*
        ⚠ 붙었는지를 **실제 상태로** 알린다.

        예전엔 `.subscribe()` 를 부르자마자 화면에 "접속됨" 을 띄웠다. 그건
        "요청했다" 이지 "붙었다" 가 아니다 — 소켓이 한 번도 안 열려도 똑같이
        접속됨이라고 적혀 있었다. 실시간인지 아닌지가 이 기능의 전부인데
        그 표시가 거짓이면 아무것도 확인할 수 없다.
      */
      .subscribe((status) => onLive?.(status === 'SUBSCRIBED'));
  } catch {
    onLive?.(false);
    return () => {};
  }
  return () => {
    onLive?.(false);
    try {
      if (ch) void c.removeChannel(ch);
    } catch {
      /* 무시 */
    }
  };
}

// ── 접속자 수 ──────────────────────────────────────────
/**
 * 지금 몇 명이 켜 두고 있는가.
 *
 * Realtime 의 **Presence** 를 쓴다 — 표를 하나도 안 쓴다. 각자 채널에 자기
 * 존재를 등록해 두면 서버가 그 목록을 모두에게 뿌려 주고, 탭을 닫으면 알아서
 * 빠진다. "마지막 접속 시각" 컬럼을 두고 폴링하는 방식과 달리 유령이 안 남는다.
 *
 * 키를 user_id 로 잡는다 — 같은 사람이 탭을 세 개 열어도 한 명으로 센다.
 */
export function joinPresence(onCount: (n: number) => void): () => void {
  const c = client();
  if (!c) return () => {};
  let ch: RealtimeChannel | null = null;
  let dead = false;

  void myUserId().then((id) => {
    if (dead) return;
    try {
      const key = id ?? `guest-${Math.random().toString(36).slice(2, 10)}`;
      ch = c.channel('presence:lobby', { config: { presence: { key } } });
      const count = () => {
        try {
          onCount(Object.keys(ch?.presenceState() ?? {}).length);
        } catch {
          onCount(0);
        }
      };
      ch.on('presence', { event: 'sync' } as never, count);
      ch.on('presence', { event: 'join' } as never, count);
      ch.on('presence', { event: 'leave' } as never, count);
      ch.subscribe((status) => {
        if (status === 'SUBSCRIBED') void ch?.track({ at: Date.now() });
        else onCount(0);
      });
    } catch {
      onCount(0);
    }
  });

  return () => {
    dead = true;
    onCount(0);
    try {
      if (ch) void c.removeChannel(ch);
    } catch {
      /* 무시 */
    }
  };
}

// ── 길드 ───────────────────────────────────────────────
/**
 * 서버에 있는 길드 한 줄.
 *
 * 인원·평균 아이템레벨·주간 기여도는 **여기 없다.** 그건 profiles 를 세면
 * 나오는 값이라 저장하면 두 곳이 어긋난다 (탈퇴했는데 인원이 그대로인 식).
 * 합치는 일은 화면 쪽(state/useGuilds.ts)이 한다.
 */
export interface GuildRow {
  id: string;
  name: string;
  motto: string;
  emblem: string;
  masterId: string;
  masterNick: string;
  capacity: number;
  createdAt: number;
}

function toGuildRow(r: Row): GuildRow {
  return {
    id: str(r.id),
    name: str(r.name, '이름없음'),
    motto: str(r.motto),
    emblem: str(r.emblem, '01'),
    masterId: str(r.master_id),
    masterNick: str(r.master_nick, '이름없음'),
    capacity: num(r.capacity, 30),
    createdAt: Date.parse(str(r.created_at)) || 0,
  };
}

export async function fetchGuilds(limit = 200): Promise<GuildRow[]> {
  const c = client();
  if (!c) return [];
  try {
    const { data, error } = await c
      .from('guilds')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    return (data as Row[]).map(toGuildRow);
  } catch {
    return [];
  }
}

/** 길드가 생기거나 사라질 때마다 */
export function onGuilds(cb: () => void): () => void {
  return subscribe('guilds', '*', () => cb());
}

export type CreateGuildResult =
  | { ok: true; guild: GuildRow }
  | { ok: false; reason: 'taken' | 'already-master' | 'offline' | 'error' };

/**
 * 길드를 만든다.
 *
 * 이름 중복의 **최종 판정은 서버**다 (유니크 인덱스). 화면에서도 미리 거르지만,
 * 두 사람이 같은 순간에 같은 이름을 내면 늦은 쪽은 여기서만 막힌다 —
 * 그때 100골드를 이미 냈으면 안 되므로, 스토어는 **서버가 성공을 돌려준 뒤에**
 * 돈을 뺀다.
 */
export async function createGuildRow(
  name: string, motto: string, emblem: string, masterNick: string,
): Promise<CreateGuildResult> {
  const c = client();
  const id = await myUserId();
  if (!c || !id) return { ok: false, reason: 'offline' };
  try {
    const { data, error } = await c
      .from('guilds')
      .insert({
        name: name.trim(),
        motto: motto.trim(),
        emblem,
        master_id: id,
        master_nick: masterNick,
      })
      .select()
      .single();
    if (error) {
      // 23505 = unique_violation. 이름이 겹쳤거나, 이미 다른 길드의 길드장이거나
      if (error.code === '23505') {
        return { ok: false, reason: error.message.includes('master') ? 'already-master' : 'taken' };
      }
      return { ok: false, reason: 'error' };
    }
    return { ok: true, guild: toGuildRow(data as Row) };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/**
 * 길드를 해산한다. 길드장만 된다 (RLS).
 * 남아 있던 길드원의 소속은 서버의 트리거가 풀어 준다 (schema.sql).
 */
export async function deleteGuildRow(guildId: string): Promise<boolean> {
  const c = client();
  const id = await myUserId();
  if (!c || !id) return false;
  try {
    const { error } = await c.from('guilds').delete().eq('id', guildId).eq('master_id', id);
    return !error;
  } catch {
    return false;
  }
}

/** 길드장이 이름을 바꾸면 목록의 표기도 따라가야 한다 */
export async function syncMasterNick(guildId: string, nick: string): Promise<void> {
  const c = client();
  const id = await myUserId();
  if (!c || !id) return;
  try {
    await c.from('guilds').update({ master_nick: nick }).eq('id', guildId).eq('master_id', id);
  } catch {
    /* 무시 */
  }
}

// ── 투기장 전투 기록 ───────────────────────────────────
/**
 * 한 판의 결과를 남긴다 — **공격한 쪽이 적는다.**
 *
 * 투기장은 그림자와 붙는다. 상대가 접속해 있지 않으면 자기가 두들겨 맞은 사실도,
 * 점수가 깎인 것도 모른다. 여기 줄을 하나 남겨 두면 그 사람이 다음에 들어올 때
 * 자기 몫을 반영한다 (`fetchDefenses`).
 *
 * ⚠ **기다리지 않는다.** 실패해도 내 판정에는 아무 영향이 없다 —
 * 표가 아직 없는 프로젝트(schema.sql 을 안 돌린 경우)에서도 투기장은 그대로 돈다.
 */
export interface BattleReport {
  foeId: string;
  foeNick: string;
  myNick: string;
  myAvatar: AvatarId;
  attackerWon: boolean;
  defenderDelta: number;
}

export async function recordBattle(r: BattleReport): Promise<void> {
  const c = client();
  if (!c) return;
  const id = await myUserId();
  if (!id || !r.foeId || r.foeId === id) return;
  try {
    await c.from('arena_battles').insert({
      attacker_id: id,
      attacker_nick: r.myNick,
      attacker_avatar: r.myAvatar,
      defender_id: r.foeId,
      attacker_won: r.attackerWon,
      defender_delta: Math.round(r.defenderDelta),
    });
  } catch {
    // 전적이 안 남을 뿐이다 — 판정은 이미 내 화면에서 끝났다
  }
}

/** 내가 **당한** 판 한 줄 */
export interface DefenseRow {
  id: string;
  at: number;
  attackerNick: string;
  attackerAvatar: AvatarId;
  /** 공격자가 이겼는가 — 내가 진 것이다 */
  attackerWon: boolean;
  delta: number;
}

/**
 * `since` 이후에 내가 당한 판들 (오래된 것부터).
 *
 * 오래된 것부터 돌려주는 게 중요하다 — 점수를 순서대로 반영해야 승급·강등이
 * 실제로 일어난 순서대로 잡힌다.
 */
export async function fetchDefenses(since: number, limit = 30): Promise<DefenseRow[]> {
  const c = client();
  if (!c) return [];
  const id = await myUserId();
  if (!id) return [];
  try {
    const { data, error } = await c
      .from('arena_battles')
      .select('*')
      .eq('defender_id', id)
      .gt('at', new Date(Math.max(0, since)).toISOString())
      .order('at', { ascending: true })
      .limit(limit);
    if (error) return [];
    return ((data as Row[] | null) ?? []).map((r) => ({
      id: `b${String(r.id)}`,
      at: Date.parse(str(r.at)) || Date.now(),
      attackerNick: maskProfanity(str(r.attacker_nick, '이름없음')),
      attackerAvatar: isAvatarId(str(r.attacker_avatar))
        ? (r.attacker_avatar as AvatarId) : DEFAULT_AVATAR,
      attackerWon: r.attacker_won === true,
      delta: num(r.defender_delta),
    }));
  } catch {
    return [];
  }
}
