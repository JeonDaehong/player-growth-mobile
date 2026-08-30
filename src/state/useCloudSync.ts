/**
 * 클라우드 세이브 구동부 — 언제 올리고 언제 내릴지.
 *
 * 저장본은 계속 바뀐다(주식이 초당 움직인다). 그렇다고 바뀔 때마다 올리면
 * 베타 30명이 무료 티어를 하루 만에 태운다. 그래서 **사람이 자리를 뜨는 순간**에
 * 맞춘다:
 *   · 로그인 직후 한 번 — 서버와 로컬 중 최신을 고른다
 *   · 앱이 백그라운드로 갈 때 — 브라우저 탭을 닫기 직전이 여기다
 *   · 그 사이에는 5분에 한 번 — 탭을 켜 둔 채 브라우저가 죽는 경우 대비
 *
 * 실패는 조용히 넘어간다. 클라우드가 안 되는 건 불편이지 사고가 아니고,
 * 여기서 토스트를 띄우면 서버가 잠깐 흔들릴 때마다 게임 화면에 오류가 쌓인다.
 * 사람이 상태를 알고 싶을 땐 설정 화면에서 직접 본다 (EtcScreen).
 */
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { cloudConfigured } from './supabase';
import { flushStorage } from './storage';
import { needsReload, push, sync, type SyncResult } from './cloudSave';
import { useGame } from './store';

/** 주기 업로드 간격 */
const PERIOD_MS = 5 * 60_000;

/** 마지막 동기화 결과 — 설정 화면이 읽어 간다 */
let last: SyncResult | null = null;
export const lastSync = () => last;

async function run(fn: () => Promise<SyncResult>) {
  try {
    // 디바운스된 로컬 쓰기를 먼저 비운다 — 안 그러면 최대 2초 낡은 저장본을 올린다
    await flushStorage();
    last = await fn();
  } catch {
    last = { kind: 'error', message: '동기화 실패' };
  }
  return last;
}

/**
 * 디스크에 새로 깔린 저장본을 돌고 있는 스토어에 반영한다.
 *
 * zustand persist 의 `rehydrate()` 를 쓴다. 웹에서 `location.reload()` 로
 * 새로고침해도 되지만, 그러면 네이티브에서 쓸 수 없고 로그인 직후에 화면이
 * 한 번 깜빡인다. 같은 일을 하는 공식 경로가 있으면 그쪽이 낫다.
 */
async function reloadFromDisk() {
  try {
    await useGame.persist.rehydrate();
  } catch {
    // 되읽기에 실패하면 다음 실행에서 어차피 새 저장본을 읽는다
  }
}

/**
 * @param active 게임에 들어온 뒤인가 (로그인·회원가입을 마쳤는가)
 */
export function useCloudSync(active: boolean) {
  /** 겹쳐 도는 걸 막는다 — 백그라운드 전환과 주기 타이머가 같은 순간에 겹친다 */
  const busy = useRef(false);

  useEffect(() => {
    if (!active || !cloudConfigured()) return;

    const once = async (fn: () => Promise<SyncResult>): Promise<SyncResult | null> => {
      if (busy.current) return null;
      busy.current = true;
      try { return await run(fn); } finally { busy.current = false; }
    };

    /*
      들어오자마자 한 번.

      브라우저를 지우고 다시 들어온 사람이 여기서 되살아난다 — 구글 로그인만
      하면 서버본이 내려와 로컬에 깔린다. 다만 그건 **디스크**에 깔린 것이라,
      이미 초기 상태로 그려진 화면은 아직 빈 캐릭터를 들고 있다.
      받아왔으면 저장본을 다시 읽어 화면까지 끌어올린다.
    */
    void once(sync).then((r) => {
      if (r && needsReload(r)) void reloadFromDisk();
    });

    const subscription = AppState.addEventListener('change', (st) => {
      if (st !== 'active') void once(push);
    });
    const timer = setInterval(() => void once(push), PERIOD_MS);

    return () => {
      subscription.remove();
      clearInterval(timer);
      // 화면을 떠나며 마지막으로 한 번 더 (로그아웃·언마운트)
      void once(push);
    };
  }, [active]);
}
