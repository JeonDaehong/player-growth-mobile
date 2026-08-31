/**
 * 휴대폰의 **뒤로가기**로 창을 닫는다.
 *
 * ## 무엇이 문제였나
 *
 * 창이 떠 있는데 뒤로가기를 누르면 **게임이 통째로 꺼졌다.** 웹으로 올라간
 * 앱이라 뒤로가기는 브라우저의 것이고, 브라우저 입장에서 이 게임은 페이지
 * 하나뿐이라 뒤로 갈 곳이 앱 바깥밖에 없다.
 *
 * `Modal` 의 `onRequestClose` 는 안드로이드 네이티브에서만 불린다 — 웹에서는
 * 아무도 안 부른다.
 *
 * ## 어떻게 하나
 *
 * 창이 열릴 때 **가짜 방문 기록을 하나 쌓는다** (`history.pushState`).
 * 그러면 뒤로가기가 앱을 나가는 대신 그 기록을 지우고, 우리는 그 순간을
 * 듣고 있다가 제일 위의 창을 닫는다.
 *
 * ✕ 로 닫혔을 때는 반대로 **우리가 뒤로 간다** — 쌓아 둔 기록을 도로
 * 걷어야 다음 뒤로가기가 한 번 헛돌지 않는다. 그때 오는 `popstate` 는
 * 우리가 만든 것이라 세어 두었다가 무시한다 (`skip`).
 *
 * ## 여럿이 겹쳐 있으면 위엣것부터
 *
 * 캐릭터 창 위에 월페이퍼가 뜨는 식으로 겹칠 수 있다. 목록의 **맨 뒤**가
 * 제일 위에 뜬 창이므로 거기서부터 닫는다 — 뒤로가기 한 번에 하나씩,
 * 열린 순서를 거꾸로.
 *
 * ## 앱으로 감쌌을 때
 *
 * 네이티브에서는 `BackHandler` 가 같은 일을 한다. `true` 를 돌려주면 그
 * 눌림을 우리가 먹은 것이고, 앱은 안 꺼진다. 여러 개가 등록돼 있으면
 * 나중에 등록된 것부터 물어보므로 여기서도 위엣것이 먼저 닫힌다.
 */
import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

interface Entry {
  close: () => void;
}

/** 지금 열려 있는 창들. **맨 뒤가 제일 위** */
const stack: Entry[] = [];

/**
 * 우리가 스스로 뒤로 간 횟수.
 *
 * ✕ 로 닫을 때 쌓아 둔 기록을 걷느라 `history.back()` 을 부르는데, 그것도
 * `popstate` 를 낳는다. 세어 두지 않으면 그 신호가 **밑에 깔린 창까지**
 * 닫는다 — 하나 닫았는데 둘이 닫힌다.
 */
let skip = 0;

/** 듣기를 한 번만 건다 */
let wired = false;

const onWeb = (): boolean => (
  Platform.OS === 'web'
  && typeof window !== 'undefined'
  && typeof window.history?.pushState === 'function'
);

function onPop() {
  if (skip > 0) { skip -= 1; return; }
  const top = stack.pop();
  if (top) top.close();
}

/**
 * 뒤로가기로 이 창을 닫는다.
 *
 * @param visible 지금 떠 있나. 꺼져 있으면 아무 일도 안 한다
 * @param onClose 닫는 방법
 */
export function useBackClose(visible: boolean, onClose: () => void): void {
  /*
    콜백을 **ref 로 받는다.**

    쓰는 쪽은 대개 `onClose={() => setOpen(false)}` 처럼 그 자리에서 만든다.
    그러면 렌더마다 새 함수라, 의존성에 넣으면 **렌더마다 방문 기록이 하나씩
    쌓인다** — 몇 초 만에 수십 개가 되고 뒤로가기를 그만큼 눌러야 나간다.
  */
  const cb = useRef(onClose);
  cb.current = onClose;

  useEffect(() => {
    if (!visible) return undefined;
    const entry: Entry = { close: () => cb.current() };

    if (onWeb()) {
      if (!wired) {
        wired = true;
        window.addEventListener('popstate', onPop);
      }
      stack.push(entry);
      window.history.pushState({ pgModal: stack.length }, '');
      return () => {
        const at = stack.lastIndexOf(entry);
        /* 뒤로가기로 이미 빠졌으면 기록도 이미 걷혔다 — 두 번 걷지 않는다 */
        if (at < 0) return;
        stack.splice(at, 1);
        skip += 1;
        window.history.back();
      };
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      cb.current();
      /* 우리가 먹었다 — 앱은 안 꺼진다 */
      return true;
    });
    return () => sub.remove();
  }, [visible]);
}
