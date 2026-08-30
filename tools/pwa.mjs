/**
 * 빌드 뒤 한 번 — 내보낸 dist/index.html 을 PWA 로 만든다.
 *
 *   node tools/pwa.mjs
 *
 * 왜 후처리인가
 *   이 프로젝트는 Expo Router 를 안 쓴다 (index.ts 가 registerRootComponent 를
 *   직접 부른다). 그래서 `app/+html.tsx` 같은 <head> 주입 지점이 없고,
 *   `expo export` 가 자기 템플릿으로 index.html 을 만들어 낸다.
 *   그 템플릿을 통째로 대체하는 대신 **필요한 태그만 얹는다** — Expo 를 올릴 때
 *   템플릿이 바뀌어도 이 스크립트는 그대로 돈다.
 *
 * 넣는 것
 *   · manifest 링크 — 이게 없으면 "홈 화면에 추가" 가 그냥 북마크가 된다
 *   · theme-color — 안드로이드 상태바를 검정으로 (흰 띠가 남으면 게임이 잘려 보인다)
 *   · iOS 용 meta — 사파리는 manifest 의 display 를 안 본다. 따로 말해 줘야 한다
 *   · 서비스 워커 등록 한 줄
 *
 * 멱등이다 — 두 번 돌려도 태그가 두 벌 생기지 않는다.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = 'dist';
const HTML = join(DIST, 'index.html');
const MARK = '<!-- pwa -->';

if (!existsSync(HTML)) {
  console.error(`${HTML} 가 없습니다. 먼저 expo export 를 돌리세요.`);
  process.exit(1);
}

/*
  public/ 은 expo export 가 dist 로 복사해 준다. 다만 그건 Expo 의 동작이라
  판올림에서 바뀔 수 있고, 그러면 아이콘 없는 PWA 가 조용히 배포된다.
  없는 것만 직접 채워 확인 사살한다.
*/
function ensure(rel) {
  const from = join('public', rel);
  const to = join(DIST, rel);
  if (!existsSync(from)) return;
  if (existsSync(to)) return;
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log(`  복사 ${rel}`);
}

ensure('manifest.webmanifest');
ensure('sw.js');
if (existsSync('public/icons')) {
  for (const f of readdirSync('public/icons')) ensure(join('icons', f));
}

const TAGS = `${MARK}
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#000000" />
    <meta name="color-scheme" content="dark" />
    <!-- 사파리는 manifest 를 안 본다 — 홈 화면에서 전체 화면으로 열리려면 이 셋이 필요하다 -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="플레이어 키우기" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <script>
      /*
        서비스 워커는 화면이 다 뜬 뒤에 등록한다. 첫 로드의 대역폭을
        번들과 나눠 쓰면 시작이 느려지는데, 캐시는 두 번째 실행부터 쓸모 있다.
      */
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function () {
            /* 워커가 없어도 게임은 그대로 돈다 — 다음에 켤 때 다시 받을 뿐이다 */
          });
        });
      }
    </script>`;

let html = readFileSync(HTML, 'utf8');

if (html.includes(MARK)) {
  // 이미 손댄 파일 — 옛 블록을 걷어 내고 새로 넣는다
  html = html.replace(new RegExp(`${MARK}[\\s\\S]*?</script>`), '').replace(/\n\s*\n\s*<\/head>/, '\n  </head>');
}

if (!html.includes('</head>')) {
  console.error('index.html 에 </head> 가 없습니다 — 템플릿이 바뀌었는지 확인하세요.');
  process.exit(1);
}

html = html.replace('</head>', `    ${TAGS}\n  </head>`);
writeFileSync(HTML, html, 'utf8');

console.log('PWA 태그를 dist/index.html 에 넣었습니다.');
