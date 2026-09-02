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

/**
 * 크롬이 넘겨준 설치 제안. 잡아 두지 않으면 그 순간 사라진다.
 *
 * 이 이벤트는 **한 번만** 오고, 기본 동작을 막아 두면 브라우저가 제 배너를
 * 안 띄운다. 대신 우리가 원할 때 `prompt()` 를 부를 수 있다.
 */
let offer: (Event & { prompt?: () => void }) | null = null;
/** 설치 제안이 생겼거나 사라졌을 때 알려 줄 곳들 */
const watchers = new Set<() => void>();
let offerBound = false;

const tell = () => { watchers.forEach((f) => f()); };

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
  catchOffer();
}

/**
 * **이미 설치된 채로 실행 중인가.**
 *
 * `display-mode` 는 manifest 가 요청한 값이 아니라 **지금 실제로 그렇게
 * 떠 있는지**를 말한다. 그래서 이게 참이면 시스템 바가 이미 없다.
 *
 * iOS 사파리는 `display-mode` 를 늦게까지 지원 안 했으므로
 * `navigator.standalone` 도 같이 본다.
 */
export function installed(): boolean {
  if (!web() || typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return true;
  }
  return !!(navigator as Navigator & { standalone?: boolean }).standalone;
}

/** 지금 "홈 화면에 추가" 를 띄울 수 있나 */
export const canInstall = (): boolean => !!offer;

/** 설치 제안이 생기거나 사라지면 알려 준다. 끊는 함수를 돌려준다 */
export function watchInstall(fn: () => void): () => void {
  watchers.add(fn);
  return () => { watchers.delete(fn); };
}

/**
 * 설치 창을 띄운다. 잡아 둔 제안은 **한 번만** 쓸 수 있다.
 *
 * 사용자가 거절하든 받아들이든 그 제안은 소모되므로, 부른 뒤에는 버튼을
 * 지운다 — 눌러도 아무 일이 안 나는 버튼이 남아 있으면 그게 더 나쁘다.
 */
export function askInstall() {
  const o = offer;
  if (!o || typeof o.prompt !== 'function') return;
  offer = null;
  tell();
  try {
    o.prompt();
  } catch {
    /* 브라우저가 거절하면 그냥 안 뜬다 — 게임은 그대로 돈다 */
  }
}

/**
 * 크롬의 설치 제안을 잡아 둔다.
 *
 * **기본 동작을 막는다.** 안 막으면 브라우저가 제 위치에 제 배너를 띄우는데,
 * 그건 게임 화면을 가리고 우리가 언제 띄울지 정할 수도 없다.
 *
 * 이 이벤트가 아예 안 오는 경우가 흔하다 — 이미 설치했거나, 사파리이거나,
 * 크롬이 아직 "설치할 만한 페이지" 로 안 봤거나. 그럴 때는 버튼이 안 뜬다.
 */
function catchOffer() {
  if (offerBound || typeof window === 'undefined') return;
  offerBound = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    offer = e as Event & { prompt?: () => void };
    tell();
  });

  /* 설치가 끝나면 버튼을 거둔다 */
  window.addEventListener('appinstalled', () => { offer = null; tell(); });
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
 * 손가락으로 만지는 기기인가.
 *
 * **`(pointer: coarse)` 로 보면 안 된다.** 그건 *주* 입력 장치를 말하는데,
 * S펜이 붙은 갤럭시는 디지타이저가 주 입력으로 잡혀 `fine` 이 나온다.
 * 갤럭시에서 전체 화면이 통째로 안 걸리던 것이 이것이었다 — 손가락 기기가
 * 아니라고 판단하고 리스너를 아예 안 달았다.
 *
 * `maxTouchPoints` 를 먼저 본다. "화면을 손가락으로 만질 수 있나" 라는
 * 질문에 정확히 답하는 값이고, 다른 입력 장치가 뭐가 붙어 있든 안 흔들린다.
 * `any-pointer` 는 그게 없는 옛 브라우저용 대비책이다.
 */
export function touchDevice(): boolean {
  return touchable();
}

function touchable(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number') {
    if (navigator.maxTouchPoints > 0) return true;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    /* `any-pointer` 는 **붙어 있는 것 중 하나라도** 굵으면 참이다 */
    return window.matchMedia('(any-pointer: coarse)').matches;
  }
  return false;
}

/*
  ── 전체 화면으로 시스템 바를 치우던 것을 뺐다 ──

  `armImmersive()` 가 여기 있었다. 손가락 기기에서 **처음 화면을 건드리는
  순간** `requestFullscreen` 을 불러 위아래 시스템 바를 없앴다.

  브라우저는 사용자 입력이 있어야만 전체 화면을 내준다. 그 제약을 지키느라
  "아무 데나 처음 누른 것" 을 입력으로 삼았는데, 거기가 문제였다 — **누른
  사람이 시킨 일이 아니다.** 강화 단추를 누르려던 사람 눈에는 화면이 제멋대로
  넘어간 것으로 보인다.

  게다가 기기마다 달랐다. 아이폰 사파리에는 API 자체가 없어서 아무 일도 안
  일어나고, 안드로이드 크롬에서만 됐다. 같은 게임이 기기에 따라 다르게 열리는
  셈이었다.

  시스템 바를 없애는 것은 애초에 웹이 할 일이 아니다. 앱으로 만들 때
  `expo-navigation-bar` 로 한다 — 거기서는 사용자를 속이지 않고도 된다.

  `manifest` 의 `display: fullscreen` 은 그대로 둔다 (`ui/InstallBar`).
  저건 가로채기가 아니라 **사용자가 홈 화면에 추가하기로 고른 결과**라,
  설치한 사람에게만 적용되고 브라우저 탭에서는 아무 일도 안 한다.
*/
