/*
 * 서비스 워커 — 홈 화면에 깔린 뒤의 두 번째 실행부터가 진짜다.
 *
 * 이 게임의 정적 파일은 11MB 다. 지하철에서 켜면 그게 매번 다시 내려온다.
 * 여기서 하는 일은 딱 둘이다:
 *
 *   1. 해시가 붙은 파일(/_expo/static/*, /assets/*, /icons/*)은 **한 번 받으면 영원히**
 *      캐시에서 준다. 파일 이름 자체가 내용이라, 내용이 바뀌면 이름이 바뀐다 —
 *      낡은 걸 줄 위험이 없다.
 *   2. index.html 은 **네트워크를 먼저** 본다. 여기를 캐시하면 새 빌드를 올려도
 *      테스터가 옛 번들을 계속 받는다 (베타에서 제일 흔한 "고쳤는데 그대로예요").
 *      네트워크가 죽어 있을 때만 캐시본을 꺼내 준다.
 *
 * 건드리지 않는 것
 *   · 다른 출처(Supabase, 구글 OAuth)는 손대지 않는다. 인증 요청을 가로채면
 *     조용히 로그인이 깨지는데, 그건 캐시로 얻는 것보다 훨씬 비싸다.
 *   · GET 이 아닌 요청도 손대지 않는다.
 */
const VERSION = 'v3';
const STATIC = `pg-static-${VERSION}`;
const PAGES = `pg-pages-${VERSION}`;

/** 내용이 곧 이름인 경로 — 영원히 캐시해도 안전하다 */
const IMMUTABLE = [/^\/_expo\/static\//, /^\/assets\//, /^\/icons\//];

self.addEventListener('install', (event) => {
  // 새 워커를 기다리게 두면 탭을 다 닫기 전엔 새 빌드가 안 걸린다
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES).then((c) => c.addAll(['/']).catch(() => {})),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 지난 판의 캐시를 버린다 — 안 그러면 브라우저 저장 공간에 계속 쌓인다
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 남의 출처는 그대로 흘려보낸다 (Supabase · 구글 로그인)
  if (url.origin !== self.location.origin) return;

  // ── 화면 진입 (index.html) — 네트워크 우선 ──────────
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(PAGES);
          void cache.put('/', fresh.clone());
          return fresh;
        } catch {
          // 오프라인 — 마지막으로 성공한 화면을 준다
          const cached = await caches.match('/', { cacheName: PAGES });
          return cached ?? Response.error();
        }
      })(),
    );
    return;
  }

  // ── 해시 붙은 정적 파일 — 캐시 우선 ────────────────
  if (IMMUTABLE.some((re) => re.test(url.pathname))) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req, { cacheName: STATIC });
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          // 206(부분 응답)은 캐시에 못 넣는다 — 오디오 스트리밍이 이걸로 온다
          if (fresh.ok && fresh.status === 200) {
            const cache = await caches.open(STATIC);
            void cache.put(req, fresh.clone());
          }
          return fresh;
        } catch {
          return Response.error();
        }
      })(),
    );
  }
});
