/**
 * 클라우드 세이브.
 *
 * 웹에서 저장은 localStorage 다. 브라우저 데이터를 지우면, 시크릿 창을 닫으면,
 * 폰에서 열면 — 며칠 키운 캐릭터가 없다. 베타 테스터에게 그게 한 번 일어나면
 * 그 사람은 다시 안 들어오고, 받으려던 밸런스 피드백도 같이 사라진다.
 *
 * 그래서 하는 일은 딱 하나다: **저장본 JSON 을 계정에 묶어 올리고 내린다.**
 * 게임 로직은 서버로 한 줄도 옮기지 않는다 (server-design/00-ROADMAP.md §2).
 *
 * 충돌
 *   `rev` 를 단조 증가시킨다. 올릴 때 서버 rev 보다 커야 덮이고, 작으면 거부된
 *   채로 서버 rev 가 돌아온다. 그때는 **서버 것이 이긴다** — 두 기기에서 번갈아
 *   한 사람의 베타에서, 자동 병합이 틀리면 어느 쪽이 사라졌는지 아무도 모른다.
 *   지는 쪽은 덮이기 전에 로컬 백업을 남긴다 (`BACKUP_KEY`).
 *
 * 신뢰
 *   내려받은 문서는 `migrateState` 를 통과시킨다. 로컬 저장본과 **똑같이**
 *   의심한다 — 서버를 거쳤다고 더 믿을 이유가 없다 (거기 올린 것도 클라이언트다).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debouncedStorage, dropPending, flushStorage } from './storage';
import { client, cloudConfigured } from './supabase';
import { STATE_VERSION, migrateState } from './migrate';
import type { GameState } from './store';

/** zustand persist 가 쓰는 키와 같아야 한다 (store.ts 의 `name`) */
export const SAVE_KEY = 'player-growth/v1';

/** 서버본에 덮이기 직전의 로컬 저장본을 여기 남긴다 */
const BACKUP_KEY = 'player-growth/v1.overwritten';

/** rev 는 저장본 바깥에 둔다 — 게임 상태가 아니라 동기화 살림살이다 */
const REV_KEY = 'player-growth/rev';

export type SyncResult =
  | { kind: 'off' }                              // 이 빌드에 클라우드가 없다
  | { kind: 'signed-out' }                        // 로그인 안 함
  | { kind: 'pushed'; rev: number }               // 내 것을 올렸다
  | { kind: 'pulled'; rev: number }               // 서버 것을 받았다 (앱 재시작 필요)
  | { kind: 'in-sync'; rev: number }              // 할 일 없음
  | { kind: 'error'; message: string };

async function readRev(): Promise<number> {
  const raw = await AsyncStorage.getItem(REV_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const writeRev = (rev: number) => AsyncStorage.setItem(REV_KEY, String(rev));

/**
 * 지금 로그인된 Supabase 사용자 id (없으면 null).
 *
 * ⚠ `getUser()` 가 아니라 `getSession()` 이다 — 저장소에서 세션을 복원하는 건
 * 비동기라, 앱이 막 켜진 순간에 `getUser()` 를 부르면 멀쩡한 세션을 두고도
 * "로그인 안 됨" 이 돌아온다. 그 몇 백 밀리초 때문에 첫 동기화가 통째로
 * 건너뛰어졌다 (state/net.ts 의 myUserId 와 같은 이유).
 */
export async function cloudUserId(): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const { data } = await c.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * 로컬 저장본을 서버로 올린다.
 *
 * rev 를 하나 올려 보낸다. 서버가 더 큰 rev 를 들고 있으면 거부하고 자기 rev 를
 * 돌려준다 — 그러면 이번 판은 우리가 늦은 것이므로 `pull()` 이 이어받는다.
 */
export async function push(): Promise<SyncResult> {
  if (!cloudConfigured()) return { kind: 'off' };
  const c = client();
  if (!c) return { kind: 'off' };
  if (!(await cloudUserId())) return { kind: 'signed-out' };

  try {
    /*
      ⚠ `AsyncStorage` 가 아니라 `debouncedStorage` 로 읽는다.

      로컬 쓰기는 2초씩 모였다 나간다. 디스크를 곧장 읽으면 **최대 2초 낡은
      저장본**을 올리게 되고, 그게 rev 를 하나 올려 서버에 박힌다 — 그러면 다른
      기기가 그 낡은 것을 정본으로 받아 간다. 2초라도 잃으면 유실이다.
      `debouncedStorage` 는 아직 못 나간 값을 먼저 본다.
    */
    const raw = await debouncedStorage.getItem(SAVE_KEY);
    if (!raw) return { kind: 'in-sync', rev: await readRev() };

    const nextRev = (await readRev()) + 1;
    const { data, error } = await c.rpc('push_save', {
      new_doc: JSON.parse(raw),
      new_rev: nextRev,
    });
    if (error) return { kind: 'error', message: error.message };

    const serverRev = Number(data);
    if (serverRev !== nextRev) {
      // 거부됐다 — 서버가 더 최신이다
      return pull();
    }
    await writeRev(serverRev);
    return { kind: 'pushed', rev: serverRev };
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : '업로드 실패' };
  }
}

/**
 * 서버 저장본을 내려받아 로컬에 쓴다.
 *
 * ⚠ 이미 돌고 있는 zustand 스토어는 **바꾸지 않는다.** 진행 중인 화면 밑에서
 * 상태를 통째로 갈아끼우면 열려 있던 팝업·애니메이션이 없는 장비를 가리킨다.
 * 디스크만 갈아 두고 재시작에서 반영한다 (`needsReload`).
 */
export async function pull(): Promise<SyncResult> {
  if (!cloudConfigured()) return { kind: 'off' };
  const c = client();
  if (!c) return { kind: 'off' };
  const uid = await cloudUserId();
  if (!uid) return { kind: 'signed-out' };

  try {
    const { data, error } = await c
      .from('saves')
      .select('doc, rev')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) return { kind: 'error', message: error.message };

    // 서버에 아무것도 없다 = 이 계정의 첫 접속. 내 것을 올린다
    if (!data) return push();

    const serverRev = Number(data.rev);
    if (serverRev <= (await readRev())) return { kind: 'in-sync', rev: serverRev };

    // 서버본도 로컬본과 똑같이 의심한다
    const doc = data.doc as { state?: unknown } | null;
    const checked = migrateState((doc?.state ?? doc) as unknown);

    const before = await debouncedStorage.getItem(SAVE_KEY);
    if (before) await AsyncStorage.setItem(BACKUP_KEY, before);

    /*
      ⚠ 서버본을 깔기 전에 **밀린 로컬 쓰기를 버린다.**

      여기까지 오는 데 서버 왕복이 있었고, 그 사이에도 게임은 돌았다 (주식이
      초당 움직이므로 반드시 한 번은 저장이 밀린다). 그 밀린 값은 "서버본을 받기
      전의 나" 라서, 그냥 두면 2초 뒤에 방금 받아온 캐릭터를 통째로 덮는다.
      되읽기(`rehydrate`)도 밀린 값을 먼저 보므로 화면까지 옛것으로 돌아간다.

      실제로 이 경로가 클라우드 세이브의 존재 이유 그 자체다 — 브라우저 데이터를
      지우고 다시 들어온 사람이 여기서 되살아난다. 거기서 유실이 나면 안 된다.
      버리는 값은 방금 BACKUP_KEY 에 남긴 것과 같은 세대다.
    */
    dropPending(SAVE_KEY);

    // persist 가 읽는 봉투 모양 그대로 쓴다 ({ state, version })
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify({ state: checked, version: STATE_VERSION }));
    await writeRev(serverRev);
    return { kind: 'pulled', rev: serverRev };
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : '내려받기 실패' };
  }
}

/**
 * 로그인 직후 한 번 — 서버와 로컬 중 최신을 고른다.
 *
 * 서버가 앞서면 받아 오고(재시작 필요), 아니면 내 것을 올린다.
 */
export async function sync(): Promise<SyncResult> {
  // 올릴 것이든 받을 것이든, 판단은 디스크와 메모리가 같아진 뒤에 한다
  await flushStorage();
  const r = await pull();
  if (r.kind === 'in-sync') return push();
  return r;
}

/** `pulled` 뒤에는 앱을 다시 그려야 새 저장본이 화면에 온다 */
export function needsReload(r: SyncResult): boolean {
  return r.kind === 'pulled';
}

/** 덮이기 전 로컬 저장본 — 뭔가 잘못됐을 때 되살릴 마지막 줄 */
export const readOverwrittenBackup = () => AsyncStorage.getItem(BACKUP_KEY);

/** 게임 상태 타입을 이 모듈 밖으로 새지 않게 묶어 둔다 */
export type { GameState };
