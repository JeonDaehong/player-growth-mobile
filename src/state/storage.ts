/**
 * AsyncStorage 디바운스 래퍼.
 *
 * 주식 시세 때문에 상태가 1초마다 바뀌는데 그때마다 디스크에 쓰면 저장이 병목이
 * 된다. 그래서 쓰기를 모아서 한다. 다만 **모아 두는 동안은 그 값이 오직 메모리에만
 * 있다** — 이 파일의 규칙은 전부 그 창을 좁히거나, 그 창에서 잃지 않게 하는 것이다.
 *
 * ## 지키는 것
 *
 * 1. **읽으면 최신이 나온다.** 아직 디스크에 안 간 값이라도 `getItem` 이 그걸 준다.
 *    안 그러면 클라우드 업로드가 최대 2초 낡은 저장본을 올린다.
 * 2. **쓰기가 실패해도 안 버린다.** 예전에는 `pending` 을 먼저 비우고 썼기 때문에
 *    한 번 실패하면 그 값이 증발했다 — 마지막 쓰기가 실패하면 그대로 유실이다.
 *    지금은 실패하면 되돌려 놓고 다음 flush 가 다시 시도한다.
 * 3. **늦게 끝난 쓰기가 최신을 덮지 않는다.** flush 두 개가 겹치면 먼저 시작한
 *    것이 나중에 끝나면서 옛 값을 얹을 수 있다. flush 는 한 번에 하나만 돈다.
 * 4. **탭을 닫아도 남는다.** `pagehide` 는 브라우저가 탭을 버리기 직전 마지막으로
 *    보장해 주는 신호다 (iOS 사파리는 `beforeunload` 를 안 준다). 웹의
 *    AsyncStorage 는 localStorage 를 **동기로** 두들기므로 여기서 부르면 실제로 남는다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const WRITE_INTERVAL = 2000;

/** 아직 디스크에 못 간 값들 */
const pending = new Map<string, string>();
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * 지금 돌고 있는 flush.
 *
 * 겹쳐 부르면 이걸 기다렸다가 이어서 한 번 더 돈다 — 동시에 두 개가 디스크를
 * 두들기면 끝나는 순서가 뒤집혀 옛 값이 새 값을 덮는다.
 */
let inFlight: Promise<void> | null = null;

async function writeOnce(): Promise<void> {
  if (!pending.size) return;
  const entries = [...pending.entries()];
  /*
    보내는 것만 지운다. 지운 뒤 새로 들어온 값은 다음 판에서 나간다.
    (여기서 `pending.clear()` 를 하면 이 await 사이에 들어온 최신 값이 사라진다)
  */
  for (const [k] of entries) pending.delete(k);
  try {
    await AsyncStorage.multiSet(entries);
  } catch (e) {
    /*
      되돌려 놓는다 — 다음 flush 가 다시 시도한다.
      ⚠ 그 사이에 더 새 값이 들어왔으면 그건 건드리지 않는다. 실패한 옛 값으로
      최신을 덮으면 고치려던 유실을 스스로 만드는 꼴이다.
    */
    for (const [k, v] of entries) if (!pending.has(k)) pending.set(k, v);
    console.warn('[storage] flush failed — 다음 저장에서 다시 시도합니다', e);
    schedule();
  }
}

function schedule() {
  if (!timer) timer = setTimeout(() => { timer = null; void flushStorage(); }, WRITE_INTERVAL);
}

/**
 * 밀린 쓰기를 전부 디스크로 내린다.
 *
 * 이미 돌고 있으면 그게 끝난 뒤 한 번 더 돈다 — 그래야 "flush 가 끝났다" 가
 * "내가 방금 쓴 것도 디스크에 있다" 를 뜻한다.
 */
export async function flushStorage(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  while (inFlight) {
    await inFlight;
    if (!pending.size) return;
  }
  if (!pending.size) return;
  inFlight = writeOnce();
  try { await inFlight; } finally { inFlight = null; }
}

/**
 * 밀린 쓰기를 **버린다** (디스크에 안 쓴다).
 *
 * 딱 한 군데서 쓴다: 클라우드에서 받아온 저장본을 디스크에 깔 때
 * (`cloudSave.pull`). 그때 이 키의 pending 은 "서버본을 받기 전의 로컬 상태" 라
 * 남겨 두면 2초 뒤에 방금 받아온 캐릭터를 덮어 버린다.
 *
 * ⚠ 다른 데서 부르면 그게 곧 유실이다. 부를 자리가 하나 더 생기면
 * "왜 버려도 되는가" 를 먼저 여기에 적을 것.
 */
export function dropPending(key: string): void {
  pending.delete(key);
}

/** 이 키의 최신 값이 아직 메모리에만 있는가 (테스트·진단용) */
export const hasPending = (key: string): boolean => pending.has(key);

export const debouncedStorage: StateStorage = {
  getItem: async (name) => {
    // 밀린 값이 진실이다 — 디스크는 최대 2초 뒤처져 있다
    if (pending.has(name)) return pending.get(name)!;
    return AsyncStorage.getItem(name);
  },
  setItem: async (name, value) => {
    pending.set(name, value);
    schedule();
  },
  removeItem: async (name) => {
    pending.delete(name);
    await AsyncStorage.removeItem(name);
  },
};

/* ── 자리를 뜰 때 ──────────────────────────────────────── */

AppState.addEventListener('change', (st) => {
  if (st !== 'active') void flushStorage();
});

/*
  웹에서 탭을 닫는 순간.

  `AppState` 는 `visibilitychange` 만 보는데, 그것만으로는 부족하다 — 탭을 닫을 때
  hidden 이 먼저 오긴 하지만 보장이 아니고, 모바일 사파리에서는 앱 전환에서
  누락되는 경우가 있다. `pagehide` 는 그 마지막 한 칸을 메운다.

  여기서는 **await 하지 않는다.** 웹 AsyncStorage 는 localStorage 를 동기로
  두들기고 프라미스는 그걸 감싸기만 하므로, 부르는 순간 이미 디스크에 남는다.
*/
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => { void flushStorage(); });
}
