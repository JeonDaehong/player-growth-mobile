# 백엔드 설계 — API · DB · 캐시 · 디스크

> 실측 기준: **후반 저장본 37KB**, DAU 1,000 전체 **36MB**.
> 디스크는 문제가 아니고 **쓰기 빈도**가 문제입니다. 설계 전체가 거기서 나옵니다.

---

## 1. 규모 계산부터 (이게 모든 결정의 근거)

저장본을 후반 상태로 채워서 실측했습니다 (인벤 80점 + 히스토리 300 + 러쉬로그 100 + 도감 231 + 완료 퀘스트 500):

| 항목 | 값 |
|---|---|
| 후반 저장본 1인 | **37KB** |
| DAU 1,000 전체 저장본 | **36MB** ← 무해 |
| 클라이언트 저장 주기 (현재) | **2초 디바운스** (`state/storage.ts` `WRITE_INTERVAL = 2000`) |
| 그대로 서버에 보내면 | 하루 20회 × 1,000명 = **723MB/일**, 초당 231 writes |

**2초 디바운스를 그대로 서버로 보내면 안 됩니다.** 로컬 디스크는 공짜지만 네트워크·DB 는 아닙니다.

### 서버 저장 트리거 (재설계)

| 트리거 | 이유 |
|---|---|
| **앱 백그라운드 진입** | `storage.ts` 가 이미 `AppState` 로 flush 한다 — 같은 훅에 얹으면 된다 |
| **5분 주기** (포그라운드) | 앱을 강제 종료해도 5분 이상 안 잃는다 |
| **중요 이벤트 직후** | 결제 · 해방 · 승급 · 장인 제련 — 되돌리면 클레임이 되는 것들 |
| 로그아웃 · 계정 전환 | |

→ 하루 **3~5회**. DAU 1,000 이면 **일 5,000 writes (초당 0.06)**. 무료 티어로 갑니다.

> 로컬 저장(2초 디바운스)은 **그대로 둡니다.** 로컬은 즉시성이 중요하고 비용이 0 입니다.
> 서버는 "백업"이지 "진실"이 아닙니다 (단일 디바이스 전제 — §5).

---

## 2. 저장은 오브젝트 스토리지, 인덱스만 DB

**저장본을 Postgres `jsonb` 에 넣지 마세요.** 37KB 문서를 통째로 UPDATE 하면
WAL·autovacuum 부담이 쓰기량의 몇 배가 됩니다. 그리고 조회 패턴이 **항상 PK 단건**입니다
— 관계형이 필요한 이유가 없습니다.

```
R2 / S3            saves/{userId}.json          ← 저장본 원본 (37KB)
Postgres           users, profiles, guilds, …   ← 인덱스 · 랭킹 · 소유권
Redis (또는 KV)    랭킹 캐시 · 쿠지 재고 · 채팅  ← 휘발성 · 원자성
```

### 테이블 (최소)

```sql
-- 계정. store.ts 의 account 필드와 1:1
users (
  id            uuid pk,
  provider      text,            -- 'google' | 'guest'
  provider_sub  text unique,     -- Google sub
  email         text,
  created_at    timestamptz,
  save_rev      bigint,          -- 저장본 리비전 (단조 증가)
  save_at       timestamptz,
  banned        boolean
)

-- 랭킹·길드·투기장 매칭이 읽는 요약. 저장본을 스캔하면 안 된다.
profiles (
  user_id       uuid pk,
  nickname      text unique,
  avatar        text,
  ilvl          int,             -- 랭킹 정렬 키
  arena_score   int,
  arena_tier    text,
  guild_id      uuid null,
  networth      bigint,
  rank_eligible boolean,         -- 이상 증가율 감지 시 false (계정은 유지)
  updated_at    timestamptz
)

guilds ( id uuid pk, name text unique, emblem text, motto text,
         master_id uuid, capacity int default 30, created_at timestamptz )

guild_members ( guild_id uuid, user_id uuid pk, joined_at timestamptz,
                weekly_contrib bigint )

-- 결제. 클라이언트 저장본의 diamonds/cashItems 는 표시용이고 진실은 여기다.
purchases ( id uuid pk, user_id uuid, product_id text,
            store text, order_id text unique,   -- 영수증 중복 차단
            verified_at timestamptz, granted boolean )

entitlements ( user_id uuid, key text, value bigint, primary key (user_id, key) )
```

- `profiles` 가 **저장본과 분리된 요약본**이라는 게 핵심입니다. 랭킹 100명을 뽑을 때
  37KB × 100 을 읽으면 안 됩니다. `profiles` 는 한 행이 200바이트 미만입니다.
- 저장 업로드 시 `profiles` 를 같이 갱신합니다 (같은 트랜잭션).

---

## 3. API

```
GET  /time                          → { now }                  무인증. Phase 1
GET  /seeds/{dayKey}                → { stock, rush, rumor, … } 무인증. CDN 캐시 24h

POST /auth/google                   → { token, userId }
GET  /save                          → { rev, url }  (R2 presigned GET)
PUT  /save        { rev, state }    → { rev }        409 if stale
POST /profile     { ilvl, arena, … } → {}            (저장과 함께)

GET  /ranking?scope=global&day=…    → 캐시된 100행     CDN 캐시 1h
GET  /guilds                        → 목록             캐시 5m
POST /guilds/{id}/apply
POST /guilds       { name, emblem, motto }
GET  /guilds/mine                   → 구성원 · 주간 기여도

POST /draw/{kuji|gacha}             → { grade, prize, remaining }   원자적
GET  /draw/{box}/stock              → { remaining, cycleKey }       캐시 10s

GET  /arena/opponents?ilvl=…        → 실플레이어 스냅샷 N개
WS   /chat                          → ChatTransport 구현체가 붙는 곳

POST /iap/verify  { store, receipt } → { granted }
```

### `PUT /save` 가 이 백엔드의 핵심입니다

```ts
// 서버 (Node)
import { migrateState } from '../src/state/migrate';   // ← 클라이언트 코드 그대로 재사용

const clean = migrateState(body.state);        // 신뢰 안 함. 기본값 + 검증된 값만
if (body.rev !== row.save_rev) return 409;     // 낙관적 락
if (!sane(clean, row)) markRankIneligible();   // §4 무결성 — 거부하지 않고 랭킹만 제외
await r2.put(`saves/${uid}.json`, JSON.stringify(clean));
await db.update({ save_rev: body.rev + 1, ...summary(clean) });
```

**`migrate.ts` 를 서버에서 그대로 import 하는 게 이 설계의 제일 좋은 부분입니다.**
주석이 이미 *"저장본을 신뢰하지 않는다 — 기본값에서 시작해 검증된 값만 덮는다.
core 만 import 한다 (RN 없이 테스트 가능해야 한다)"* 라고 선언하고 있어서
Node 에서 수정 없이 돌아갑니다. 검증기를 두 벌 유지하는 최악의 상황을 피합니다.

⚠ 그러려면 서버가 이 리포의 `src/core` + `src/state/migrate.ts` 를 공유해야 합니다.
모노레포로 두거나, `core` 를 별도 패키지로 뽑으세요. **복사 붙여넣기는 절대 하지 마세요** —
두 벌이 갈라지는 순간 저장본이 깨집니다.

---

## 4. 무결성 — 거부하지 말고 랭킹에서 빼세요

```ts
function sane(next: GameState, prev: Row): boolean {
  const dt = (Date.now() - prev.save_at) / 1000;
  return next.stats.enhanceCount - prev.enhance_count <= dt / 0.5   // 0.5초에 1회 상한
      && next.money - prev.money <= maxEarnRate * dt
      && playerIlvl(next.equipped) <= theoreticalMax(next);          // maxSetIlvl 기반
}
```

- **위반 시 저장을 거부하지 않습니다.** 거부하면 정상 유저가 버그로 계정을 잃습니다.
  `profiles.rank_eligible = false` 로 두고 랭킹·길드 기여도에서만 제외합니다.
- 실제로 막아야 하는 건 랭킹뿐입니다 (`00-ROADMAP.md` §4 치트 정책).
- `theoreticalMax` 는 `maxSetIlvl()` + 정령석 캡 + 연성액 상한으로 계산합니다.
  **상수로 박지 마세요** — `docs/ENHANCE_MILESTONE_DESIGN.md` 가 곡선을 흔듭니다.

---

## 5. 캐시 + 디스크 전략 (요청하신 부분)

읽기 패턴이 **극단적으로 캐시 친화적**입니다. 게임 설계가 이미 그렇게 되어 있습니다.

| 데이터 | 갱신 주기 | 캐시 | 근거 |
|---|---|---|---|
| **시드** (`/seeds/{day}`) | 하루 1회 | **CDN 24h, immutable** | 날짜별 불변. 100% 히트 |
| **랭킹** | 하루 1회 | **CDN 1h + Redis** | `ranking.ts` 가 "하루 단위 고정" 설계 |
| **길드 목록** | 주 1회 스냅샷 | Redis 5m | `guildsFor(weekKey)` 와 같은 리듬 |
| 내 길드 구성원 | 가입/탈퇴 시 | Redis 1m, 변경 시 무효화 | |
| **쿠지 재고** | 실시간 | Redis 원자 카운터 (캐시 아님) | 유한 재고 — 정확성이 전부 |
| 투기장 상대 풀 | 하루 1회 | 스냅샷 테이블 + Redis | 고스트라 최신일 필요 없음 |
| **저장본** | 사용자별 | **캐시 금지** | 단건 조회 + 쓰기. R2 직접 |
| 채팅 | 실시간 | Redis list, `LTRIM 100`, TTL 1h | `CHAT_HISTORY_MAX = 100` 과 일치 |
| **주식 시세** | 초당 | **서버에 없음** | 클라이언트가 시드로 계산 ← 가장 큰 절약 |

### 디스크

- **저장본은 R2/S3.** 37KB × 사용자 수. DAU 1,000 → 36MB, 10만 명 → 3.6GB.
  R2 는 10GB 무료라 사실상 무료입니다.
- **버전 보관**: 최근 3개만 (`saves/{uid}.json`, `.1`, `.2`). 롤백 요청·클레임 대응용.
  전체 히스토리는 필요 없습니다.
- **Postgres 는 작게 유지**. `profiles` 1,000행 = 200KB. 인덱스는 `(ilvl DESC)`,
  `(arena_score DESC)`, `(guild_id)` 3개면 충분합니다.
- **채팅은 디스크에 안 남깁니다.** 스크롤백 100개 = Redis 로 충분하고, 영구 보관은
  신고 처리용 로그만 별도로 남기세요 (개인정보 보관 기간 정책 필요).

### 랭킹 배치

```
매일 00:00 (KST) Cron
  → profiles ORDER BY ilvl DESC LIMIT 100
  → 실플레이어 + 빈 구간을 결정론 NPC 로 채움 (01 문서 §3-1)
  → JSON 으로 직렬화 → CDN 에 올림
```

**실시간 랭킹을 만들지 마세요.** `ranking.ts` 가 이미 "하루 단위로 고정되어 앱을 껐다 켜도
같은 순위표가 보이고, 자정이 지나면 갱신된다" 로 설계되어 있습니다. 그 계약을 지키면
랭킹 조회가 **DB 를 한 번도 안 건드립니다.**

---

## 6. 실패 모드와 대응

| 상황 | 대응 |
|---|---|
| 서버 다운 | **게임은 계속 돌아간다.** 로컬 저장 + `offset = 0`. 복구 시 동기화. 이 게임이 싱글이라 가능한 사치다 |
| `PUT /save` 409 (다른 기기가 먼저 씀) | 사용자에게 **"어느 쪽을 쓸지" 묻는다.** 자동 병합 금지 — 골드·장비를 자동 병합하면 복사 버그가 된다 |
| 시간 오프셋 실패 | `offset = 0` 진행 + `offlineSince` 기록. 다음 접속에서 어긋난 구간의 시간 보상(체력 회복) 절삭 |
| 쿠지 재고 경합 | Redis 원자 연산으로 애초에 발생 안 함. 실패 시 **배팅금 즉시 환불** |
| 결제 후 지급 실패 | `purchases.granted = false` 로 남기고 재시도 큐. `order_id` unique 로 중복 지급 차단 |

---

## 7. 스택 추천 (개인 개발자 기준)

| 역할 | 선택 | 이유 |
|---|---|---|
| API | **Cloudflare Workers** | 무료 티어 넉넉, 콜드스타트 없음, `/time`·`/seeds` 가 엣지에서 끝남 |
| 저장본 | **R2** | 10GB 무료, 이그레스 무료 |
| DB | **Neon** 또는 **Supabase** Postgres | 무료 티어. Supabase 는 Google OAuth 가 딸려 온다 |
| 캐시·카운터 | **Cloudflare KV** (느슨) + **Durable Objects** (원자적·채팅) | Redis 를 따로 안 띄워도 된다 |
| 배치 | Workers **Cron Triggers** | 무료 |

> **모노레포로 두세요.** `packages/core` 를 앱과 서버가 공유해야 `migrate.ts` 재사용이 성립합니다.
> 이게 이 설계에서 가장 중요한 구조 결정입니다.

---

## 8. 착수 순서 (Phase 1~2 만)

1. `packages/core` 로 `src/core` + `src/state/migrate.ts` 를 분리 (앱은 그대로 동작해야 함)
2. Worker 하나 — `GET /time`, `GET /seeds/{day}`
3. `src/core/clock.ts` 추가 → `Date.now()` 전수 치환 → `now()`
   - **스모크에 "시계 치환 누락 검사"를 넣으세요**: `src/core`, `src/state` 에서
     `Date.now()` 를 grep 해 0건인지 단언 (`__smoke__.ts` 에 한 줄)
4. Google OAuth → `users` · `profiles`
5. `PUT /save` + `GET /save` (`migrate.ts` 재사용, `rev` 낙관적 락)
6. 저장 트리거 재배치 (§1) — 백그라운드 · 5분 · 중요 이벤트
7. `sane()` 무결성 + `rank_eligible`

**여기까지가 "다른 사람들과 같이 즐기기"의 최소선입니다.**
랭킹·길드·채팅(Phase 3)은 그 다음이고, 없어도 웹 베타는 돌아갑니다.
