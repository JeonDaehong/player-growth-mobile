/**
 * 길드.
 *
 * **아무것도 미리 만들어 두지 않는다.** 예전엔 `guildsFor()` 가 [머리말]+[집단명]
 * 조합으로 280개를 지어내고, 그 안의 길드장과 길드원까지 `randomNick()` 으로
 * 채웠다. 이름은 그럴듯했지만 전부 없는 사람이었다 — 가입 신청서를 열 자 넘게
 * 적어 넣어도 읽는 사람이 없었다.
 *
 * 지금은 목록이 **비어 있는 채로 시작한다.** 누군가 100골드를 내고 만들어야
 * 첫 줄이 생기고, 인원·평균 아이템레벨·주간 기여도는 그 길드에 속한 실제
 * 플레이어들의 프로필을 세서 나온다 (state/useGuilds.ts).
 *
 * 이 파일에 남은 것은 **규칙**뿐이다 — 이름 검사, 신청 검사, 가입 첫날 대기,
 * 창설 비용, 문장 목록. 데이터는 서버에서 온다.
 */
import { hasProfanity } from './profanity';
import { g as gold } from './currency';

export interface Guild {
  /** 서버가 발급한 uuid */
  id: string;
  /** 엠블럼 스프라이트 키 (assets/sprites/guild) */
  emblem: string;
  name: string;
  /** 한 줄 소개 */
  motto: string;
  /** 길드장의 user_id */
  masterId: string;
  /** 길드장 이름 */
  master: string;
  /** 정원 */
  capacity: number;
  /**
   * 구성원 수 — **나를 포함한 실제 인원**이다.
   * (예전에는 "NPC 구성원 수" 라 화면마다 +1 을 해야 했다)
   */
  members: number;
  /** 구성원 평균 아이템레벨 */
  avgIlvl: number;
  /** 주간 기여도 합 */
  weekly: number;
}

/** 길드 구성원 한 줄 — 프로필에서 뽑는다 */
export interface GuildMember {
  /** user_id. 나는 'me' */
  id: string;
  nick: string;
  ilvl: number;
  weekly: number;
  isMaster: boolean;
  isMe?: boolean;
}

/** 길드 엠블럼 후보 — 길드를 만들 때 고른다 (아트: assets/sprites/guild) */
export const GUILD_EMBLEMS = Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0'));

/** 정원. 서버의 guilds.capacity 기본값과 같아야 한다 */
export const GUILD_CAPACITY = 30;

// ── 길드 창설 ──────────────────────────────────────────

/** 창설 비용 */
export const GUILD_CREATE_COST = gold(100);

export const GUILD_NAME_MIN = 2;
export const GUILD_NAME_MAX = 12;
export const GUILD_MOTTO_MAX = 30;

// ── 신입 대기 (가입 첫날) ──────────────────────────────

/*
  ## 가입 대기(첫날 잠금)를 없앴다 (2026-08)

  원래는 가입한 날 하루 동안 출석·레이드·합동사냥을 막았다. 길드를 옮겨 다니며
  하루치를 두 번 먹는 걸 막으려던 것인데, **구멍을 엉뚱한 데서 막고 있었다.**

  진짜 구멍은 가입할 때 `guildCheck`·`guildBoss` 를 **비운다**는 데 있었다.
  비우니까 출석이 다시 열렸고, 그래서 첫날 전체를 잠가야 했다. 그 대가로
  정직하게 들어온 사람이 하루를 통째로 손해 봤다 — 길드에 막 들어온 사람이
  제일 하고 싶은 게 길드 활동인데 그걸 막은 셈이다.

  지금은 가입해도 **하루치 한도를 그대로 들고 간다** (state/slices/guild.ts 의
  `joinGuild`). 오늘 이미 출석했으면 옮겨도 막히므로 구멍이 애초에 없고,
  그러면 잠글 이유도 없다. 새 길드원은 들어오자마자 같이 논다.
*/

/** 가입 신청서 */
export const APPLY_REASON_MIN = 10;
export const APPLY_REASON_MAX = 100;

export type ApplyError = 'empty' | 'short' | 'long' | 'full' | 'profanity' | null;

/**
 * 신청 사유 검사.
 *
 * 한 줄도 안 쓰고 바로 들어가지면 "가입" 이 버튼 하나가 되어 버린다.
 * 최소 10자를 요구해 잠깐이라도 생각하게 만든다.
 *
 * ⚠ 사유를 **읽는 사람이 이제 진짜로 있다.** 길드장이 목록에서 본다.
 */
export function validateApply(raw: string, guild: Guild, myGuildId: string | null): ApplyError {
  if (guild.members >= guild.capacity) return 'full';
  if (myGuildId) return null;
  const t = raw.trim();
  if (!t) return 'empty';
  if (t.length < APPLY_REASON_MIN) return 'short';
  if (t.length > APPLY_REASON_MAX) return 'long';
  // 사유는 길드장 한 사람이 읽는 글이다. 채팅처럼 별표로 덮어 보내면 무슨 말인지
  // 모른 채 수락 여부를 정하게 되므로, 여기서는 고쳐 쓰게 돌려보낸다
  if (hasProfanity(t)) return 'profanity';
  return null;
}

export const APPLY_MSG: Record<Exclude<ApplyError, null>, string> = {
  empty: '신청 사유를 적어 주세요',
  short: `사유는 ${APPLY_REASON_MIN}자 이상 적어 주세요`,
  long: `사유는 ${APPLY_REASON_MAX}자까지입니다`,
  full: '정원이 찼습니다',
  profanity: '사용할 수 없는 단어가 들어 있습니다',
};

export type GuildNameError = 'empty' | 'short' | 'long' | 'taken' | 'profanity' | null;

/** 공백·대소문자를 무시한 이름 — 서버의 유니크 인덱스와 같은 규칙이다 */
export const normGuildName = (x: string) => x.replace(/\s+/g, '').toLowerCase();

/**
 * 이름 검사.
 *
 * 같은 이름이 둘이면 목록에 같은 줄이 두 번 뜨고, 랭킹에서 어느 쪽이 내 길드인지
 * 알 수 없다. 공백만 다른 이름도 같은 이름으로 본다.
 *
 * `existing` 은 지금 서버에 있는 길드 이름들이다. **최종 판정은 서버가 한다**
 * (유니크 인덱스) — 여기서 거르는 건 100골드를 내기 전에 알려 주기 위해서다.
 * 두 사람이 같은 순간에 같은 이름을 내면 늦은 쪽이 서버에서 막힌다.
 */
export function validateGuildName(raw: string, existing: readonly string[] = []): GuildNameError {
  const name = raw.trim();
  if (!name) return 'empty';
  if (name.length < GUILD_NAME_MIN) return 'short';
  if (name.length > GUILD_NAME_MAX) return 'long';
  // 길드 이름은 목록·랭킹·채팅 머리에 계속 붙어 다닌다 — 닉네임과 같은 잣대로 막는다
  if (hasProfanity(name)) return 'profanity';
  if (existing.some((n) => normGuildName(n) === normGuildName(name))) return 'taken';
  return null;
}

export const GUILD_NAME_MSG: Record<Exclude<GuildNameError, null>, string> = {
  empty: '길드 이름을 입력하세요',
  short: `이름은 ${GUILD_NAME_MIN}자 이상이어야 합니다`,
  long: `이름은 ${GUILD_NAME_MAX}자까지입니다`,
  taken: '이미 있는 길드 이름입니다',
  profanity: '사용할 수 없는 단어가 들어 있습니다',
};

// ── 길드에서 남이 보는 내 수치 ─────────────────────────

/**
 * 프로필에 실려 가는 길드 수치 한 덩어리 (`profiles.guild_stats`).
 *
 * 레이드·보스의 **총 피해는 길드원들이 각자 올린 값의 합**이다. 예전엔 없는
 * 사람들의 피해를 `npcDamage()` 로 지어내 더했다. 지금은 같은 길드의 프로필을
 * 모아 더하기만 한다 — 서버가 판정할 게 없으니 표 하나로 끝난다.
 */
export interface GuildStats {
  /** 주간 기여도 */
  weekly: number;
  joinedAt: number;
  /** 마지막으로 출석한 날 (dayKey) */
  attendDay: string;
  /** 이번 보스 주간 내 누적 피해 */
  boss: { key: string; dmg: number };
  /** 레이드 — 일일 / 주간 */
  raidD: { key: string; dmg: number };
  raidW: { key: string; dmg: number };
  /**
   * 이번 주 길드 퀘스트에 내가 채운 몫 (축별).
   * 키는 `GqKey` 지만 여기서 그 타입을 import 하면 guildQuest ↔ guilds 가 서로를
   * 물어 순환이 된다. 값은 어차피 숫자뿐이라 느슨하게 둔다.
   */
  quest: { key: string; counts: Record<string, number> };
}

export const EMPTY_GUILD_STATS: GuildStats = {
  weekly: 0,
  joinedAt: 0,
  attendDay: '',
  boss: { key: '', dmg: 0 },
  raidD: { key: '', dmg: 0 },
  raidW: { key: '', dmg: 0 },
  quest: { key: '', counts: {} },
};

/** 서버에서 온 값은 남이 올린 것이다 — 모양이 틀려도 화면이 깨지면 안 된다 */
export function readGuildStats(raw: unknown): GuildStats {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : 0);
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const pair = (v: unknown) => {
    const p = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    return { key: s(p.key), dmg: n(p.dmg) };
  };
  return {
    weekly: n(o.weekly),
    joinedAt: n(o.joinedAt),
    attendDay: s(o.attendDay),
    boss: pair(o.boss),
    raidD: pair(o.raidD),
    raidW: pair(o.raidW),
    quest: (() => {
      const q = (o.quest && typeof o.quest === 'object' ? o.quest : {}) as Record<string, unknown>;
      const c = (q.counts && typeof q.counts === 'object' ? q.counts : {}) as Record<string, unknown>;
      return {
        key: s(q.key),
        counts: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, n(v)])),
      };
    })(),
  };
}
