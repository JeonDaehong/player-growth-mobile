-- 클라우드 세이브 스키마
--
-- Supabase 대시보드 → SQL Editor 에 이 파일을 통째로 붙여 넣고 실행한다.
-- 여러 번 실행해도 안전하다 (전부 IF NOT EXISTS / DROP-CREATE).
--
-- 설계 요지
--   · 저장본은 **행 하나에 JSON 문서 하나**다. 게임 상태를 컬럼으로 펼치지 않는다 —
--     필드가 계속 늘어나는 게임이라 펼치는 순간 마이그레이션이 두 곳(앱·DB)이 된다.
--     검증은 이미 클라이언트의 migrate.ts 가 하고 있고, 서버는 보관만 한다.
--   · `rev` 는 단조 증가한다. 두 기기가 동시에 올리면 낮은 쪽이 거부된다.
--   · RLS 로 **자기 행만** 읽고 쓴다. anon 키는 공개되는 키이므로,
--     이 정책이 유일한 접근 통제다. 절대 끄지 말 것.

create table if not exists public.saves (
  -- auth.users 를 그대로 키로 쓴다. 계정이 지워지면 저장본도 같이 지워진다
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- 저장본 전체 (zustand persist 가 만드는 JSON 그대로)
  doc        jsonb       not null,
  -- 충돌 해결용 단조 증가 번호
  rev        bigint      not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;

-- 자기 행만. select/insert/update 를 각각 건다 (delete 는 안 준다 —
-- 저장본을 지우는 건 실수일 확률이 훨씬 높다. 필요하면 대시보드에서 지운다)
drop policy if exists "saves are private: read"   on public.saves;
drop policy if exists "saves are private: insert" on public.saves;
drop policy if exists "saves are private: update" on public.saves;

create policy "saves are private: read"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "saves are private: insert"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "saves are private: update"
  on public.saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 업로드 ─────────────────────────────────────────────
--
-- 왜 함수인가: "읽고 → 비교하고 → 쓰기" 를 클라이언트에서 하면 그 사이에 다른
-- 기기가 끼어들 수 있다 (lost update). 한 문장으로 묶어 DB 안에서 판정한다.
--
-- 규칙: 올리려는 rev 가 저장된 rev 보다 **커야만** 덮는다.
-- 거부되면 서버의 현재 rev 를 돌려주므로, 클라이언트는 그걸 보고 내려받아 합친다.
create or replace function public.push_save(new_doc jsonb, new_rev bigint)
returns bigint
language plpgsql
security invoker           -- RLS 를 그대로 통과시킨다. definer 로 두면 정책이 무의미해진다
set search_path = public   -- search_path 를 고정하지 않으면 함수 하이재킹 여지가 생긴다
as $$
declare
  current_rev bigint;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select rev into current_rev from public.saves where user_id = auth.uid();

  if current_rev is null then
    insert into public.saves (user_id, doc, rev, updated_at)
    values (auth.uid(), new_doc, new_rev, now());
    return new_rev;
  end if;

  if new_rev <= current_rev then
    -- 거부. 서버가 더 최신이다 — 클라이언트가 이 값을 보고 내려받는다
    return current_rev;
  end if;

  update public.saves
     set doc = new_doc, rev = new_rev, updated_at = now()
   where user_id = auth.uid();

  return new_rev;
end;
$$;


-- ═══════════════════════════════════════════════════════
-- 멀티플레이 — 랭킹 · 실시간 피드 · 채팅 · 투기장 상대
-- ═══════════════════════════════════════════════════════
--
-- 여기부터는 **여러 사람이 같이 보는 데이터**다. 위의 saves 가 "내 저장본을
-- 나만 읽는다" 였다면, 아래 세 표는 "내 것만 쓰고 남의 것도 읽는다" 이다.
--
--   profiles       공개 프로필 한 줄  — 랭킹 · 투기장 상대 · 채팅 명패의 원본
--   feed_events    누가 뭘 했는지     — 홈 화면 실시간 상황
--   chat_messages  오간 말            — 전체 · 길드 채널
--
-- 설계 요지
--   · **쓰기는 언제나 자기 행만.** 남의 점수를 못 쓰게 하는 게 유일한 방어선이다
--     (판정은 여전히 클라이언트에 있으므로 자기 점수는 조작할 수 있다 — 로드맵 §4).
--   · 읽기는 로그인한 사람 전부. anon(비로그인)에게는 아무것도 안 준다.
--   · 실시간은 postgres_changes 로 민다. RLS 가 그대로 적용된다.

-- ── 공개 프로필 ────────────────────────────────────────
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  nick         text        not null,
  avatar       text        not null default 'swordsman',
  -- 아이템레벨. cur_ilvl 은 내구도가 깎인 뒤의 실효값이다 (투기장 상대로 쓸 때 이 값으로 붙는다)
  ilvl         integer     not null default 0,
  cur_ilvl     integer     not null default 0,
  dur          integer     not null default 100,
  net          bigint      not null default 0,
  arena_points integer     not null default 0,
  wins         integer     not null default 0,
  losses       integer     not null default 0,
  -- 착용 장비 스냅샷. 랭킹에서 남의 장비를 들여다볼 때 쓴다
  gear         jsonb       not null default '{}'::jsonb,
  guild_id     text,
  guild_name   text,
  title        text,
  /*
    길드에서 **남이 봐야 하는 내 수치** 한 덩어리.
      { weekly, joinedAt, attendDay, boss:{key,dmg}, raidD:{key,dmg}, raidW:{key,dmg} }

    컬럼으로 펼치지 않는다 — 길드 콘텐츠는 계속 늘어나는데, 펼치면 늘 때마다
    마이그레이션이 앱과 DB 두 곳이 된다. 서버는 이 값으로 정렬하지 않고
    (정렬은 ilvl/net/arena_points 세 컬럼이 한다) 클라이언트가 합만 낸다.
  */
  guild_stats  jsonb       not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- 이미 만들어 둔 프로젝트를 위해 — 없으면 붙인다
alter table public.profiles add column if not exists guild_stats jsonb not null default '{}'::jsonb;

-- 길드원 목록은 이 컬럼으로 뽑는다
create index if not exists profiles_guild_idx on public.profiles (guild_id);

-- 랭킹은 세 가지 기준으로 정렬한다 — 각각 인덱스를 준다
create index if not exists profiles_ilvl_idx  on public.profiles (ilvl desc);
create index if not exists profiles_net_idx   on public.profiles (net desc);
create index if not exists profiles_arena_idx on public.profiles (arena_points desc);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read all"   on public.profiles;
drop policy if exists "profiles: write mine" on public.profiles;
drop policy if exists "profiles: edit mine"  on public.profiles;

-- 랭킹이므로 로그인한 사람은 전부 읽는다
create policy "profiles: read all"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: write mine"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles: edit mine"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 실시간 피드 ────────────────────────────────────────
create table if not exists public.feed_events (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  user_id uuid        not null references auth.users (id) on delete cascade,
  kind    text        not null,
  text    text        not null,
  hot     boolean     not null default false
);

create index if not exists feed_events_at_idx on public.feed_events (at desc);

alter table public.feed_events enable row level security;

drop policy if exists "feed: read all"   on public.feed_events;
drop policy if exists "feed: write mine" on public.feed_events;

create policy "feed: read all"
  on public.feed_events for select
  to authenticated
  using (true);

create policy "feed: write mine"
  on public.feed_events for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ── 채팅 ───────────────────────────────────────────────
create table if not exists public.chat_messages (
  id       bigint generated always as identity primary key,
  at       timestamptz not null default now(),
  channel  text        not null check (channel in ('all', 'guild')),
  -- 길드 채널일 때만 채워진다. 이 값으로 "같은 길드만 읽는다" 를 판정한다
  guild_id text,
  user_id  uuid        not null references auth.users (id) on delete cascade,
  nick     text        not null,
  text     text        not null check (char_length(text) between 1 and 200),
  -- 말한 시점의 명패. 나중에 칭호가 바뀌어도 지난 말풍선은 그대로 남아야 한다
  title    text,
  rank     integer
);

create index if not exists chat_all_idx   on public.chat_messages (at desc) where channel = 'all';
create index if not exists chat_guild_idx on public.chat_messages (guild_id, at desc) where channel = 'guild';

alter table public.chat_messages enable row level security;

drop policy if exists "chat: read"       on public.chat_messages;
drop policy if exists "chat: write mine" on public.chat_messages;

-- 전체 채널은 누구나. 길드 채널은 **그 길드에 속한 사람만** —
-- 아니면 길드 채팅이 전체 채팅의 다른 이름일 뿐이다
create policy "chat: read"
  on public.chat_messages for select
  to authenticated
  using (
    channel = 'all'
    or guild_id = (select p.guild_id from public.profiles p where p.user_id = auth.uid())
  );

-- 보내는 것도 같은 조건. 닉네임까지 자기 프로필의 것으로 강제한다 —
-- 안 그러면 남의 이름을 달고 말할 수 있다
create policy "chat: write mine"
  on public.chat_messages for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      channel = 'all'
      or guild_id = (select p.guild_id from public.profiles p where p.user_id = auth.uid())
    )
  );

-- ── 실시간 전송 ────────────────────────────────────────
-- postgres_changes 로 밀어 준다. 이미 들어 있으면 에러가 나므로 조용히 넘긴다
do $$
begin
  begin
    alter publication supabase_realtime add table public.chat_messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.feed_events;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.profiles;
  exception when duplicate_object then null;
  end;
end $$;

-- ── 청소 ───────────────────────────────────────────────
-- 피드와 채팅은 계속 쌓인다. 화면이 보여 주는 것보다 훨씬 많이 남을 이유가 없다.
-- 새 글이 들어올 때마다 오래된 것을 걷어 낸다 (베타 규모에서는 이걸로 충분하다 —
-- 스케줄러를 붙이면 무료 티어에서 확장이 하나 더 늘고 관리할 것도 늘어난다).
create or replace function public.trim_history()
returns trigger
language plpgsql
security definer          -- 남의 행을 지우는 일이라 RLS 를 넘어야 한다
set search_path = public
as $$
begin
  if tg_table_name = 'feed_events' then
    delete from public.feed_events
     where at < now() - interval '2 days';
  else
    delete from public.chat_messages
     where at < now() - interval '7 days';
  end if;
  return null;
end;
$$;

drop trigger if exists feed_trim on public.feed_events;
drop trigger if exists chat_trim on public.chat_messages;

-- statement 트리거 + 확률 게이트 대신, 그냥 매 100번째쯤에만 돌게 두어도 되지만
-- 베타 트래픽에서는 매번 돌려도 인덱스 스캔 한 번이라 그대로 둔다
create trigger feed_trim after insert on public.feed_events
  for each statement execute function public.trim_history();
create trigger chat_trim after insert on public.chat_messages
  for each statement execute function public.trim_history();


-- ── 길드 ───────────────────────────────────────────────
--
-- 길드는 **아무것도 미리 만들어 두지 않는다.** 처음에는 목록이 비어 있고,
-- 누군가 100골드를 내고 만들어야 첫 줄이 생긴다. 예전엔 280개를 생성해서
-- 깔아 뒀는데, 그 안의 길드장·길드원이 전부 없는 사람이었다.
--
-- 인원·평균 아이템레벨·주간 기여도는 **여기 저장하지 않는다.** profiles 를
-- 세면 나오는 값이라, 저장하면 두 곳이 어긋난다 (탈퇴했는데 인원이 그대로인 식).
create table if not exists public.guilds (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null check (char_length(trim(name)) between 2 and 12),
  motto      text        not null default '',
  emblem     text        not null default '01',
  master_id  uuid        not null references auth.users (id) on delete cascade,
  -- 길드장 이름을 같이 둔다 — 목록 한 줄을 그리려고 프로필을 또 조회하지 않게
  master_nick text       not null default '',
  capacity   integer     not null default 30,
  created_at timestamptz not null default now()
);

-- 같은 이름의 길드가 둘이면 랭킹에서 어느 쪽인지 알 수 없다.
-- 공백·대소문자만 다른 것도 같은 이름으로 본다 (클라이언트의 검사와 같은 규칙)
create unique index if not exists guilds_name_uniq
  on public.guilds (lower(regexp_replace(name, '\s+', '', 'g')));

-- 한 사람이 여러 길드의 길드장이 될 수는 없다
create unique index if not exists guilds_master_uniq on public.guilds (master_id);

alter table public.guilds enable row level security;

drop policy if exists "guilds: read all"    on public.guilds;
drop policy if exists "guilds: create mine" on public.guilds;
drop policy if exists "guilds: edit mine"   on public.guilds;
drop policy if exists "guilds: drop mine"   on public.guilds;

create policy "guilds: read all"
  on public.guilds for select
  to authenticated
  using (true);

create policy "guilds: create mine"
  on public.guilds for insert
  to authenticated
  with check (auth.uid() = master_id);

-- 길드장만 고치고, 길드장만 해산한다
create policy "guilds: edit mine"
  on public.guilds for update
  to authenticated
  using (auth.uid() = master_id)
  with check (auth.uid() = master_id);

create policy "guilds: drop mine"
  on public.guilds for delete
  to authenticated
  using (auth.uid() = master_id);

do $$
begin
  begin
    alter publication supabase_realtime add table public.guilds;
  exception when duplicate_object then null;
  end;
end $$;

-- 해산한 길드에 남아 있던 사람들을 풀어 준다.
-- 안 하면 프로필의 guild_id 가 없는 길드를 가리킨 채로 남아, 길드 채팅이
-- 아무도 없는 방이 되고 목록에는 안 뜨는 유령 소속이 된다.
create or replace function public.release_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set guild_id = null, guild_name = null
   where guild_id = old.id::text;
  return old;
end;
$$;

drop trigger if exists guild_disband on public.guilds;
create trigger guild_disband after delete on public.guilds
  for each row execute function public.release_members();

-- ── 투기장 전투 기록 ───────────────────────────────────
/*
  한 판의 결과를 **공격한 쪽이** 적는다.

  왜 필요한가: 투기장은 "그림자" 와 붙는다 — 상대는 접속해 있지 않아도 된다.
  그러면 당한 쪽은 자기가 두들겨 맞았다는 사실 자체를 모른다. 점수도 안 움직인다.

  왜 공격한 쪽이 적는가: RLS 는 남의 profiles 줄을 못 고치게 막는다(막는 게 맞다).
  그래서 방어자의 점수를 공격자가 직접 깎을 수는 없다. 대신 여기 줄을 하나 남기고,
  **방어자가 다음에 들어올 때** 자기 몫을 스스로 반영한다 (state/useArenaDefense.ts).
  서버가 판정을 하지 않으므로 공격자가 결과를 지어낼 수 있지만, 이 게임은
  싱글 플레이 감각의 베타라 그 위험을 감수하고 왕복 한 번을 아꼈다.

  이 표가 없어도 앱은 돈다 — insert 가 실패하면 전적이 안 남을 뿐이다.
*/
create table if not exists public.arena_battles (
  id             bigint generated always as identity primary key,
  at             timestamptz not null default now(),
  attacker_id    uuid        not null references auth.users(id) on delete cascade,
  attacker_nick  text        not null,
  attacker_avatar text       not null default 'swordsman',
  defender_id    uuid        not null references auth.users(id) on delete cascade,
  attacker_won   boolean     not null,
  -- 방어자가 자기 화면에서 반영할 점수 (부호 포함). 공격자 몫은 공격자가 이미 반영했다
  defender_delta integer     not null default 0
);

-- 방어자가 "내가 마지막으로 본 시각 이후" 를 뽑는 질의가 이 인덱스를 탄다
create index if not exists arena_battles_def_idx on public.arena_battles (defender_id, at desc);
create index if not exists arena_battles_atk_idx on public.arena_battles (attacker_id, at desc);

alter table public.arena_battles enable row level security;

drop policy if exists "arena: read mine"  on public.arena_battles;
drop policy if exists "arena: write mine" on public.arena_battles;

-- 내가 낀 판만 읽는다 — 남의 전적을 통째로 훑을 이유가 없다
create policy "arena: read mine"
  on public.arena_battles for select
  to authenticated
  using (auth.uid() = attacker_id or auth.uid() = defender_id);

-- 적는 건 공격한 쪽만. 남의 이름으로 기록을 지어낼 수 없다
create policy "arena: write mine"
  on public.arena_battles for insert
  to authenticated
  with check (auth.uid() = attacker_id);
