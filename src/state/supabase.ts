/**
 * Supabase 클라이언트 — 클라우드 세이브의 바닥.
 *
 * **이 모듈은 없어도 게임이 돌아가야 한다.** 자격증명이 안 채워진 빌드(로컬 개발,
 * 남의 포크, 키를 아직 안 받은 CI)에서 import 하나 때문에 흰 화면이 나면 안 된다.
 * 그래서 `client()` 는 설정이 없으면 조용히 `null` 을 돌려주고, 클라우드 세이브
 * 전체가 꺼진 채로 로컬 저장만 돈다 — 지금까지와 정확히 같은 동작이다.
 *
 * 키는 `EXPO_PUBLIC_` 접두사로 빌드에 박힌다. anon 키는 **공개돼도 되는 키**다 —
 * 실제 접근 통제는 서버의 RLS 정책이 한다 (`supabase/schema.sql`). 그 정책이
 * 없으면 anon 키만으로 남의 저장본을 읽고 쓸 수 있으니, 스키마를 반드시 먼저 적용한다.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** 이 빌드에 클라우드 세이브가 켜져 있는가 */
export const cloudConfigured = (): boolean => !!(URL && ANON);

let cached: SupabaseClient | null = null;

/**
 * 클라이언트 한 개를 재사용한다.
 *
 * 매번 만들면 세션 갱신 타이머가 겹쳐 쌓이고, 토큰이 만료될 때 서로 다른
 * 인스턴스가 각자 갱신을 시도해 한쪽이 죽은 토큰을 들게 된다.
 */
export function client(): SupabaseClient | null {
  if (cached) return cached;
  if (!URL || !ANON) return null;
  try {
    cached = createClient(URL, ANON, {
      auth: {
        /*
          세션을 AsyncStorage 에 둔다 — 웹에서는 localStorage 다.
          이걸 안 주면 RN 에서 세션이 메모리에만 남아 새로고침마다 로그인이 풀린다.
        */
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        /*
          ⚠ 웹의 OAuth 리디렉션은 URL 조각(#access_token=...)으로 돌아온다.
          그걸 자동으로 주워 세션으로 바꾸게 둔다. 네이티브에는 URL 이 없으므로 끈다.
        */
        detectSessionInUrl: typeof window !== 'undefined',
      },
    });
    return cached;
  } catch {
    // 키가 형식부터 틀린 경우 — 클라우드만 포기하고 게임은 계속 간다
    return null;
  }
}
