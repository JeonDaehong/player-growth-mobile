/**
 * 자리를 비운 동안에는 서버를 두들기지 않는다.
 *
 * 이 게임에는 소켓이 놓친 걸 줍는 재확인 타이머가 네 개 있다 — 채팅·피드(25초),
 * 순위표·길드 명부(60초), 투기장 피격(60초). 전부 `setInterval` 이라 **탭을 숨겨도
 * 계속 돌았다.** 사람이 다른 일을 하는 동안에도, 폰을 주머니에 넣은 동안에도,
 * 한 시간이면 수백 번을 왕복한다. 베타 인구가 서른 명이어도 무료 티어에서는
 * 그게 그대로 청구서고, 폰에서는 그대로 배터리다.
 *
 * 그래서 이 파일이 하는 일은 딱 둘이다.
 *
 *   · **안 보이면 멈춘다.** 어차피 아무도 안 보는 화면을 갱신하는 것이다.
 *   · **돌아오면 곧바로 한 번 받는다.** 이게 더 중요하다 — 멈춰 있던 동안 쌓인
 *     것을 다음 타이머까지 최대 60초를 더 기다리게 하면, 아낀 대가로 사람이
 *     느려진 화면을 보게 된다. 돌아온 순간 받으면 **오히려 지금보다 빠르다.**
 *
 * 즉 이건 절약이자 동시에 체감 개선이다. 둘이 안 부딪히는 게 이 설계의 핵심이다.
 */
import { AppState } from 'react-native';

/**
 * 주기적으로 부르되, 앱이 앞에 있을 때만.
 *
 * @param fn       받아 오는 일. 던지면 안 된다 (프라미스는 알아서 삼킨다)
 * @param everyMs  앞에 있을 때의 간격
 * @returns 멈추는 함수. 반드시 불러야 한다 (App 의 정리 단계)
 */
export function startPolling(fn: () => void, everyMs: number): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastRun = 0;
  let stopped = false;

  const run = () => {
    lastRun = Date.now();
    try { fn(); } catch { /* 한 번 실패해도 다음 판이 있다 */ }
  };

  const start = () => {
    if (stopped || timer) return;
    /*
      돌아왔을 때 곧바로 받을지는 **얼마나 비웠는지**로 정한다.
      탭을 잠깐 옮겼다가 바로 오는 사람에게까지 왕복을 시키면, 앱 전환을
      반복하는 것만으로 폴링보다 더 많이 두들기게 된다.
    */
    if (Date.now() - lastRun >= everyMs) run();
    timer = setInterval(run, everyMs);
  };

  const stop = () => {
    if (timer) { clearInterval(timer); timer = null; }
  };

  run();
  timer = setInterval(run, everyMs);

  const sub = AppState.addEventListener('change', (st) => {
    if (st === 'active') start();
    else stop();
  });

  return () => {
    stopped = true;
    stop();
    sub.remove();
  };
}

/**
 * 여러 번 불러도 한 번만 도는 실행기.
 *
 * 길드 명부는 행 하나가 바뀔 때마다 **목록 전체를 다시 받는다**. 길드 다섯 개가
 * 같은 순간에 갱신되면 (레이드 정산 직후에 실제로 그렇다) 같은 200줄을 다섯 번
 * 받아 온다. 마지막 한 번이면 충분하므로 짧게 모았다가 한 번만 부른다.
 */
export function coalesce(fn: () => void, waitMs = 400): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) return;
    timer = setTimeout(() => { timer = null; fn(); }, waitMs);
  };
}
