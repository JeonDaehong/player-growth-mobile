/**
 * 내가 없는 사이 당한 투기장 판을 주워 온다.
 *
 * 투기장은 **그림자**와 붙는 곳이다 — 상대가 접속해 있을 필요가 없다. 뒤집으면
 * 나도 접속해 있지 않을 때 두들겨 맞는다는 뜻인데, 지금까지는 그 사실 자체가
 * 어디에도 안 남았다. 점수도 안 움직이고, 누가 나를 골랐는지도 몰랐다.
 *
 * 공격한 쪽이 서버에 줄을 남기고(`recordBattle`), 이 훅이 들어올 때 그걸 읽어
 * 스토어에 반영한다(`applyDefenses`). 방어자의 점수를 방어자가 스스로 반영하는
 * 구조인 이유는 RLS 다 — 남의 프로필 줄은 남이 못 고치고, 못 고치는 게 맞다.
 *
 * ## 들어올 때 한 번, 그 뒤로는 뜸하게
 *
 * 처음엔 마운트 때 한 번만 읽었다. 그런데 그러면 **게임을 켜 둔 채로 맞은 판이
 * 전적에 안 올라온다** — 투기장 전적 탭을 아무리 새로고침해도 안 뜨고, 앱을
 * 껐다 켜야 나타난다. "도전당한 게 반영이 안 된다" 로 보이는 게 당연하다.
 *
 * 그래서 주기적으로 한 번 더 본다. 간격은 넉넉하게 잡는다 — 실시간일 필요가 없고,
 * 팝업이 게임 중에 튀어나오는 것도 원하는 그림이 아니다. 대신 **팝업은 처음
 * 한 번만** 띄우고, 그 뒤로 들어온 판은 조용히 전적에만 쌓는다.
 */
import { useEffect, useState } from 'react';
import { useGame } from './store';
import { fetchDefenses, netEnabled } from './net';
import { startPolling } from './poller';
import type { OfflineDigest } from '@/core/arena';

/**
 * 다시 확인하는 간격.
 *
 * 60초다. 남이 나를 때리는 건 자주 있는 일이 아니라 더 자주 볼 이유가 없고,
 * 전적 탭을 열어 둔 채 기다리는 사람에게는 1분이면 충분히 "곧 뜬다" 로 느껴진다.
 */
const DEFENSE_RECHECK_MS = 60_000;

/**
 * @param active 게임에 들어온 뒤인가 (로그인·회원가입을 마쳤는가)
 * @returns 알려 줄 요약. 확인을 누르면 `clear` 로 지운다
 */
export function useArenaDefense(active: boolean): {
  digest: OfflineDigest | null;
  clear: () => void;
} {
  const [digest, setDigest] = useState<OfflineDigest | null>(null);
  const apply = useGame((s) => s.applyDefenses);

  useEffect(() => {
    if (!active || !netEnabled()) return;
    let alive = true;
    /** 팝업은 들어올 때 한 번만. 그 뒤는 전적에만 조용히 쌓는다 */
    let firstPass = true;

    const check = () => {
      /*
        마지막으로 본 시각은 스토어가 들고 있다. 훅 안에서 구독하지 않고 그때그때
        읽는다 — 구독하면 반영 직후 seenAt 이 바뀌면서 이 효과가 다시 돌고,
        같은 줄을 두 번 읽는 왕복이 생긴다.
      */
      const since = useGame.getState().arena.seenAt;
      void fetchDefenses(since).then((rows) => {
        if (!alive || !rows.length) return;
        const d = apply(rows);
        if (d && firstPass) setDigest(d);
        firstPass = false;
      });
    };

    // 탭이 숨겨져 있는 동안은 쉰다 — 돌아오면 곧바로 한 번 본다 (state/poller.ts)
    const stopPoll = startPolling(check, DEFENSE_RECHECK_MS);
    return () => { alive = false; stopPoll(); };
  }, [active, apply]);

  return { digest, clear: () => setDigest(null) };
}
