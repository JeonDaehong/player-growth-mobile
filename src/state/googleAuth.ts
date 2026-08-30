/**
 * 구글 로그인.
 *
 * OAuth 인가 코드 흐름을 expo-auth-session 이 대신 돌린다. 받아 온 액세스 토큰으로
 * 구글의 userinfo 를 한 번 읽어 계정 식별자(`sub`)와 이메일을 가져오고, 그걸
 * 게임 계정 id 로 쓴다.
 *
 * ⚠ **이건 보안 경계가 아니다.** 지금은 서버가 없어 토큰을 클라이언트에서 그대로
 * 믿는다. 결제·서버 저장이 붙는 순간 id_token 을 서버로 넘겨 구글 공개키로
 * 검증해야 한다 — 그러기 전까지 이 id 는 "기기 간 이어쓰기용 식별자" 이상으로
 * 취급하면 안 된다.
 *
 * 클라이언트 ID 는 app.json 의 `expo.extra.googleAuth` 에서 읽는다. 플랫폼마다
 * 다른 ID 를 쓰므로(구글 콘솔이 그렇게 발급한다) 세 칸을 따로 둔다.
 */
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client, cloudConfigured } from './supabase';

/** 브라우저로 다녀온 뒤 팝업/탭을 닫아 준다. 웹에서 이게 없으면 창이 남는다 */
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthConfig {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
}

export function googleAuthConfig(): GoogleAuthConfig {
  const extra = (Constants.expoConfig?.extra ?? {}) as { googleAuth?: GoogleAuthConfig };
  return extra.googleAuth ?? {};
}

/** 지금 이 플랫폼에서 쓸 클라이언트 ID 가 채워져 있는가 */
export function googleConfigured(): boolean {
  const c = googleAuthConfig();
  const id = Platform.select({
    ios: c.iosClientId,
    android: c.androidClientId,
    default: c.webClientId,
  });
  // 웹 ID 는 네이티브에서도 대체로 쓸 수 있으므로 둘 중 하나라도 있으면 연다
  return !!(id || c.webClientId);
}

/**
 * 구글 콘솔의 "승인된 리디렉션 URI" 에 **정확히 이 문자열**이 들어가야 한다.
 * 끝의 슬래시 하나만 달라도 redirect_uri_mismatch 로 막힌다. 설정 화면에
 * 그대로 띄워 주는 이유다 — 눈으로 맞추는 것보다 복사가 확실하다.
 */
export function googleRedirectUri(): string {
  try {
    return makeRedirectUri({});
  } catch {
    return '(확인 불가)';
  }
}

export interface GoogleProfile {
  id: string;
  email?: string;
  name?: string;
}

/**
 * id_token 의 payload 를 읽는다.
 *
 * ⚠ **서명을 검증하지 않는다.** 여기서 꺼내는 값은 화면에 이름을 띄우고 로컬
 * 계정을 잇는 용도일 뿐이다. 신뢰가 필요한 경계는 Supabase 쪽이다 — 거기서는
 * 같은 토큰을 구글 공개키로 검증한 뒤에야 세션을 내준다.
 *
 * `atob` 는 RN(Hermes)에 없다. 의존성을 하나 더 붙이느니 base64url 만
 * 직접 푼다 — JWT payload 는 UTF-8 JSON 이라 이걸로 충분하다.
 */
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const bytes: number[] = [];
    let buf = 0;
    let bits = 0;
    for (const ch of b64) {
      const v = B64.indexOf(ch);
      if (v < 0) continue;           // '=' 패딩과 잡문자는 건너뛴다
      buf = (buf << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((buf >> bits) & 0xff);
      }
    }
    /*
      UTF-8 디코드. 이름에 한글이 들어오면 바이트를 그대로 charCode 로 읽는
      방식은 깨진다 (실제로 깨졌다). decodeURIComponent 로 제대로 푼다.
    */
    const pct = bytes.map((b) => '%' + b.toString(16).padStart(2, '0')).join('');
    return JSON.parse(decodeURIComponent(pct)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);

/**
 * 마지막 Supabase 세션 실패 사유. 설정 화면이 읽어 간다.
 *
 * 모듈 변수에 둔다 — 상태로 만들면 로그인 화면이 사라진 뒤에 못 읽는다.
 */
let lastAuthError: string | null = null;
export const lastCloudAuthError = () => lastAuthError;

/**
 * 세션을 열려고 **시도한 적이 있는가**.
 *
 * 오류가 없는 것과 아직 안 해 본 것은 완전히 다른 상태인데, 화면에는 둘 다
 * "연결 안 됨" 으로만 보인다. 이미 로그인해 둔 사람은 로그인 흐름을 다시 안
 * 타므로 **한 번도 시도된 적이 없는** 쪽이고, 그 사람에게 필요한 말은
 * "오류를 확인하세요" 가 아니라 "버튼을 누르세요" 다.
 */
let attempted = false;
export const cloudAuthAttempted = () => attempted;

/**
 * 시도 기록은 **페이지를 넘어가도 남아야 한다.**
 *
 * 리디렉션 방식은 브라우저가 통째로 구글로 갔다가 돌아온다 — 그 사이에 모듈
 * 변수는 전부 초기화된다. 돌아왔는데 "아직 시도한 적 없습니다" 가 다시 떠 있으면
 * 방금 한 일이 없던 일이 되고, 사람은 같은 버튼을 또 누른다.
 */
const ATTEMPT_KEY = 'player-growth/cloud-auth';

interface Attempt { at: number; error: string | null; aud: string | null }

async function saveAttempt(a: Attempt) {
  try { await AsyncStorage.setItem(ATTEMPT_KEY, JSON.stringify(a)); } catch { /* 무시 */ }
}

/**
 * 앱이 켜질 때 한 번 — 지난 시도의 결과를 되살린다.
 *
 * 여러 곳에서 불러도 한 번만 읽는다. 자동 복구가 이 값으로 "이미 해 봤는가" 를
 * 판단하는데, 각자 따로 읽으면 순서에 따라 답이 달라진다.
 */
let loading: Promise<void> | null = null;
export function loadCloudAuthState(): Promise<void> {
  if (!loading) loading = readAttempt();
  return loading;
}

async function readAttempt(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(ATTEMPT_KEY);
    if (!raw) return;
    const a = JSON.parse(raw) as Attempt;
    attempted = true;
    lastAuthError = typeof a.error === 'string' ? a.error : null;
    lastAudience = typeof a.aud === 'string' ? a.aud : null;
  } catch {
    /* 무시 */
  }
}

/**
 * 세션이 없으면 **한 번만** 스스로 리디렉션으로 열어 본다.
 *
 * 왜 자동인가
 *   이 게임은 로그인 = 게임 계정이고, 서버 세션은 그것과 별개로 열린다.
 *   그 두 번째 단계가 조용히 실패하면 사람은 자기가 뭘 잘못했는지 알 수 없고,
 *   랭킹·채팅·길드·클라우드 저장이 전부 죽은 채로 게임을 하게 된다.
 *   **고칠 수 있는 문제를 사람에게 떠넘기면 안 된다.**
 *
 * 왜 한 번뿐인가
 *   리디렉션은 페이지를 통째로 갈아 끼운다. 돌아왔는데 여전히 세션이 없으면
 *   조건이 그대로라 **무한 왕복**이 된다. 그래서 떠나기 전에 시도 기록을
 *   남기고(saveAttempt), 기록이 있으면 다시는 자동으로 안 간다 —
 *   그 다음부터는 설정 화면의 버튼과 진단이 맡는다.
 *
 * @returns 리디렉션을 시작했는가
 */
export async function autoOpenSessionOnce(): Promise<boolean> {
  if (!cloudConfigured()) return false;
  await loadCloudAuthState();
  if (attempted) return false;          // 이미 해 봤다 — 사람이 판단할 차례다
  const c = client();
  if (!c) return false;
  try {
    const { data } = await c.auth.getSession();
    if (data.session) return false;     // 멀쩡하다
  } catch {
    return false;
  }
  await openCloudSessionByRedirect();
  return true;
}

/**
 * 리디렉션으로 서버 세션을 연다 — **설정 화면의 "서버 세션 다시 열기" 가 쓰는 길이다.**
 *
 * 팝업(id_token 방식)과 뭐가 다른가
 *   · 팝업은 브라우저가 막으면 **아무 일도 안 일어난 것처럼** 끝난다.
 *     실제로 그 상태에 갇혔다 — 버튼을 눌러도 시도 기록조차 안 남았다.
 *   · 리디렉션은 페이지가 통째로 구글로 간다. 막힐 수가 없고, 잘못됐으면
 *     구글이나 Supabase 가 **오류 화면을 직접 보여 준다** (그것 자체가 진단이다).
 *   · nonce 를 맞출 일도, Supabase 의 "Client IDs"(aud 허용 목록)에 의존할 일도
 *     없다. 서버끼리 코드를 주고받으므로 provider 에 넣어 둔 Client ID/Secret 만
 *     맞으면 된다.
 *
 * 돌아오면 URL 조각(#access_token=...)을 supabase-js 가 주워 세션으로 바꾼다
 * (state/supabase.ts 의 `detectSessionInUrl`).
 */
export async function openCloudSessionByRedirect(): Promise<string | null> {
  const c = client();
  if (!c) {
    const msg = '이 빌드에 Supabase 자격증명이 없습니다';
    attempted = true; lastAuthError = msg;
    await saveAttempt({ at: Date.now(), error: msg, aud: null });
    return msg;
  }
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  // 떠나기 **전에** 기록한다 — 리디렉션이 시작되면 이 아래 줄은 안 돌 수도 있다
  attempted = true;
  await saveAttempt({ at: Date.now(), error: null, aud: lastAudience });
  try {
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (!error) return null;               // 브라우저가 구글로 떠난다
    lastAuthError = error.message;
    await saveAttempt({ at: Date.now(), error: error.message, aud: lastAudience });
    return error.message;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    lastAuthError = msg;
    await saveAttempt({ at: Date.now(), error: msg, aud: lastAudience });
    return msg;
  }
}

/** 토큰의 aud — Supabase 의 "Client IDs" 칸과 **글자 그대로** 같아야 한다 */
let lastAudience: string | null = null;
export const lastTokenAudience = () => lastAudience;

/**
 * 구글 id_token 으로 Supabase 세션을 연다. 성공하면 null, 실패하면 사유.
 *
 * ⚠ **nonce 가 이 흐름에서 제일 잘 깨지는 곳이다.**
 * 구글은 요청에 실은 nonce 를 id_token 의 `nonce` 클레임에 그대로 돌려준다.
 * Supabase(gotrue)는 "둘 다 있거나 둘 다 없어야 한다" 를 요구하는데 —
 * 우리가 `nonce: undefined` 를 넘기면 토큰에는 nonce 가 있고 우리 쪽엔 없어서
 * `Passed nonce and nonce in id_token should either both be present or both be
 * absent` 로 거절당한다. expo 의 request 객체가 nonce 를 안 들고 있을 때가
 * 있어서, 없으면 **토큰 안의 값**을 쓴다 (구글이 방금 돌려준 그 값이다).
 *
 * 그래도 안 되면 nonce 없이 한 번 더 시도한다 — 구글이 nonce 를 안 실은
 * 구성일 수도 있다. 두 번 다 실패하면 그때의 사유를 그대로 돌려준다.
 */
async function openSession(
  idToken: string,
  claims: Record<string, unknown> | null,
  request: unknown,
): Promise<string | null> {
  const c = client();
  attempted = true;
  lastAudience = str(claims?.aud) ?? null;
  if (!c) return '이 빌드에 Supabase 자격증명이 없습니다';
  const remember = (err: string | null) =>
    void saveAttempt({ at: Date.now(), error: err, aud: lastAudience });

  const fromRequest = (request as { nonce?: string } | null)?.nonce;
  const fromToken = str(claims?.nonce);
  const candidates: (string | undefined)[] = [];
  for (const n of [fromRequest, fromToken, undefined]) {
    if (!candidates.includes(n)) candidates.push(n);
  }

  let last = '세션을 열지 못했습니다';
  for (const nonce of candidates) {
    try {
      const { data, error } = await c.auth.signInWithIdToken({
        provider: 'google', token: idToken, nonce,
      });
      if (!error && data?.session) { remember(null); return null; }
      if (error) last = error.message;
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
  }
  remember(last);
  return last;
}

interface UseGoogleSignIn {
  /** 클라이언트 ID 가 있고 요청 객체가 준비됐는가 */
  ready: boolean;
  /** 인증 창이 떠 있거나 프로필을 읽는 중 */
  busy: boolean;
  /** 실패 사유 (사용자가 취소하면 null 로 둔다 — 취소는 오류가 아니다) */
  error: string | null;
  signIn: () => void;
}

/**
 * @param onSuccess 프로필을 받아 계정을 만드는 콜백.
 */
export function useGoogleSignIn(onSuccess: (p: GoogleProfile) => void): UseGoogleSignIn {
  const cfg = googleAuthConfig();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
    액세스 토큰이 아니라 **id_token** 을 받는다.
    이유는 Supabase 다 — `signInWithIdToken` 이 이 토큰을 구글 공개키로 검증하고
    세션을 내주며, 그 세션이 있어야 저장본 테이블의 RLS(`auth.uid()`)가 성립한다.
    프로필(이름·이메일)도 이 토큰 안에 들어 있어서 userinfo 를 따로 부를 일이 없다.
  */
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: cfg.webClientId,
    webClientId: cfg.webClientId,
    iosClientId: cfg.iosClientId,
    androidClientId: cfg.androidClientId,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'dismiss' || response.type === 'cancel') {
      setBusy(false);
      return;
    }
    if (response.type === 'error') {
      setBusy(false);
      setError(response.error?.message ?? '구글 인증에 실패했습니다');
      return;
    }
    if (response.type !== 'success') {
      setBusy(false);
      return;
    }

    const idToken = response.params?.id_token ?? response.authentication?.idToken;
    if (!idToken) {
      setBusy(false);
      setError('구글이 토큰을 주지 않았습니다');
      return;
    }

    let alive = true;
    (async () => {
      const claims = decodeJwtPayload(idToken);
      const sub = str(claims?.sub);
      if (!sub) {
        if (!alive) return;
        setBusy(false);
        setError('구글 계정 식별자가 없습니다');
        return;
      }

      /*
        Supabase 세션을 연다. **실패해도 로그인은 계속 진행한다** — 클라우드가
        안 붙은 빌드에서도, 잠깐 서버가 죽었을 때도 게임은 들어가져야 한다.
        그때는 로컬 저장만 도는 상태가 되고, 다음 실행에서 다시 시도한다.

        ⚠ 다만 **조용히 실패하면 안 된다.** 예전 코드는 try/catch 로 감싸 두고
        아무것도 안 했는데, `signInWithIdToken` 은 실패해도 **던지지 않는다** —
        `{ data, error }` 를 돌려준다. 그래서 catch 가 한 번도 안 걸렸고,
        세션이 없는 채로 게임만 들어가졌다. 겉보기엔 로그인이 된 것 같은데
        랭킹·채팅·클라우드 저장이 전부 "서버에 연결되어 있지 않습니다" 로 죽는,
        원인을 짚을 수 없는 상태가 그렇게 만들어졌다.
      */
      if (cloudConfigured()) {
        lastAuthError = await openSession(idToken, claims, request);
      }

      if (!alive) return;
      setBusy(false);
      onSuccess({ id: sub, email: str(claims?.email), name: str(claims?.name) });
    })();
    return () => { alive = false; };
  }, [response, onSuccess, request]);

  const signIn = useCallback(() => {
    if (!request) return;
    setError(null);
    setBusy(true);
    // 창이 안 뜨고 즉시 실패하는 경우가 있어(팝업 차단 등) 여기서도 busy 를 푼다
    promptAsync().catch((e: unknown) => {
      setBusy(false);
      setError(e instanceof Error ? e.message : '구글 인증 창을 열지 못했습니다');
    });
  }, [request, promptAsync]);

  return { ready: !!request && googleConfigured(), busy, error, signIn };
}
