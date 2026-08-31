/**
 * 웹에서만 필요한 화면 설정 — **확대 금지**와 **전체 화면.**
 *
 * `webText` 와 같은 자리의 파일이다. Expo Router 를 안 쓰는 프로젝트라
 * (`index.ts` 가 `registerRootComponent` 를 직접 부른다) `<head>` 를 짜는
 * 지점이 없고, `expo export` 가 제 템플릿으로 `index.html` 을 만들어 낸다.
 * 그래서 필요한 것만 **뜬 뒤에 얹는다.**
 *
 * 빌드 결과물에는 `tools/pwa.mjs` 가 같은 값을 미리 박아 둔다. 여기 것은
 * 개발 서버(`expo start --web`)와, Expo 판올림에서 템플릿이 바뀌었을 때를
 * 위한 것이다 — 둘 중 하나만 두면 어느 한쪽에서 조용히 빠진다.
 *
 * 네이티브(iOS·안드로이드)에서는 아무것도 안 한다. 거기서는 확대라는 게
 * 없고, 시스템 바는 `app.json` 이 정한다.
 */
import { Platform } from 'react-native';

/**
 * 확대를 막는 viewport.
 *
 * `user-scalable=no` 는 **안드로이드에서만** 듣는다. iOS 사파리는 10 부터
 * 접근성을 이유로 이 값을 통째로 무시하므로, 거기서는 아래 `blockPinch` 가
 * 실제로 막는 쪽이다.
 *
 * `maximum-scale` 과 `minimum-scale` 을 같이 1 로 박는다 — `user-scalable`
 * 을 무시하는 브라우저도 배율 범위는 대개 지킨다.
 */
const VIEWPORT = 'width=device-width, initial-scale=1, minimum-scale=1, '
  + 'maximum-scale=1, user-scalable=no, shrink-to-fit=no';

const STYLE_ID = 'pg-viewport';

/** 리스너를 두 번 달지 않기 위한 표시 — 이 함수들은 렌더마다 불린다 */
let styled = false;
let pinchBlocked = false;
let armed = false;

const web = () => Platform.OS === 'web' && typeof document !== 'undefined';

/**
 * 확대를 막는다 — viewport, 더블탭, 두 손가락.
 *
 * 세 가지를 다 해야 한다. 셋이 서로 다른 길로 들어오기 때문이다.
 *
 *   viewport            핀치 확대 (안드로이드)
 *   touch-action        더블탭 확대 (전 기기)
 *   gesture* / touchmove  핀치 확대 (iOS 사파리 — viewport 를 무시한다)
 *
 * 여러 번 불러도 안전하다.
 */
export function applyWebViewport() {
  if (!web()) return;

  /*
    이미 박혀 있으면 안 건드린다. 같은 값을 다시 써도 브라우저는 viewport 를
    다시 계산하므로, 렌더마다 부르면 그때마다 레이아웃이 한 번씩 흔들린다.
  */
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    document.head.appendChild(meta);
  }
  if (meta.getAttribute('content') !== VIEWPORT) {
    meta.setAttribute('content', VIEWPORT);
  }

  if (!styled) {
    styled = true;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      html, body, #root {
        /*
          더블탭 확대를 없앤다.

          'manipulation' 은 스크롤과 핀치는 그대로 두고 **더블탭만** 끄는
          값이다. 'none' 으로 두면 스크롤까지 죽어서, 목록이 있는 팝업이
          손가락에 안 따라온다.

          곁다리로 300ms 탭 지연도 같이 사라진다 — 브라우저가 "두 번째
          탭이 올까" 를 기다릴 이유가 없어지기 때문이다. 연타로 노는
          게임이라 이게 체감으로 제일 크다.
        */
        touch-action: manipulation;
        /* 가로 모드나 큰 글씨 설정에서 브라우저가 글자만 키우는 것을 막는다 */
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
    `;
    document.head.appendChild(el);
  }

  blockPinch();
}

/**
 * iOS 사파리의 핀치 확대를 막는다.
 *
 * 사파리는 `user-scalable=no` 를 무시하지만, 확대가 시작될 때 `gesturestart`
 * 를 쏘고 그걸 막으면 확대가 안 일어난다. 표준 이벤트가 아니라 사파리에만
 * 있고, 다른 브라우저에서는 영영 안 불리는 리스너가 하나 얹힐 뿐이다.
 *
 * `touchmove` 는 그 백업이다 — **손가락이 둘 이상일 때만** 막으므로 한
 * 손가락으로 하는 스크롤·드래그는 그대로 지나간다.
 */
function blockPinch() {
  if (pinchBlocked) return;
  pinchBlocked = true;

  const stop = (e: Event) => { e.preventDefault(); };
  for (const name of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(name, stop);
  }

  document.addEventListener('touchmove', (e) => {
    if ((e as TouchEvent).touches.length > 1) e.preventDefault();
  }, { passive: false });
}

/**
 * **전체 화면** — 위아래 시스템 바를 치운다.
 *
 * ## 왜 첫 탭을 기다리나
 *
 * 전체 화면은 사용자가 뭔가를 눌러야만 들어갈 수 있다. 브라우저가 그렇게
 * 정해 놓았다 — 안 그러면 어느 페이지든 열자마자 화면을 통째로 가져갈 수
 * 있게 된다. 그래서 여는 순간에는 못 하고, **첫 탭에 얹어서** 들어간다.
 *
 * 한 번만 시도한다 (`once`). 나갔다면 그건 사용자가 나간 것이므로, 다음
 * 탭에 다시 밀어 넣으면 끄려는 사람과 켜려는 코드가 싸운다.
 *
 * ## 어디서 듣나
 *
 *   안드로이드 크롬   주소창과 아래 네비게이션 바가 같이 사라진다
 *   홈 화면에 추가    `manifest` 의 `display: fullscreen` 이 이미 해 준다
 *   아이폰 사파리     **안 된다** — 아이폰에는 전체 화면 API 자체가 없다.
 *                     거기서 바를 없애려면 "홈 화면에 추가" 뿐이다
 *
 * 손가락으로 만지는 기기에서만 건다. 데스크톱에서 아무 데나 눌렀다고
 * 브라우저가 전체 화면이 되면 그건 고장으로 보인다.
 */
export function armImmersive() {
  if (!web() || armed) return;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };
  const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
  /* 아이폰 사파리 — API 가 아예 없다. 리스너도 달지 않는다 */
  if (typeof req !== 'function') return;

  armed = true;
  document.addEventListener('click', () => {
    if (document.fullscreenElement) return;
    try {
      /* 막혀도 게임은 그대로 돈다 — 바가 남아 있을 뿐이다 */
      void Promise.resolve(req.call(el)).catch(() => {});
    } catch {
      /* 위와 같다 */
    }
  }, { once: true });
}
