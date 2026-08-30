import React, { useCallback, useState } from 'react';
import { Image, Pressable, TextInput, View, ViewStyle } from 'react-native';
import { useGame } from '@/state/store';
import { GoogleProfile, googleRedirectUri, useGoogleSignIn } from '@/state/googleAuth';
import { NICKNAME_MAX, NICKNAME_MIN } from '@/core/cash';
import { AVATAR_IDS } from '@/core/avatars';
import { Btn, Panel, Row, Screen, Sep, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { TitleVerse } from '@/ui/TitleVerse';
import { sprite } from '@/ui/spriteAssets';
import { BORDER, C, MONO, O, SP, WHITE } from '@/ui/theme';

/**
 * 로그인 · 회원가입.
 *
 * 앱을 켜면 가장 먼저 뜬다. 구글 로그인이 기본이고, 아직 SDK 를 붙이지 않아
 * **버튼은 살아 있되 실제 인증은 게스트로 대체**한다 — 흐름을 먼저 확정해 두면
 * 나중에 이 자리에 SDK 응답만 꽂으면 된다.
 */
const AUTH_HERO = sprite('auth', 'hero');

/**
 * 구글 공식 로고.
 *
 * 화면 전체가 흑백 2색이지만 **이것만 원색 그대로** 쓴다 — 구글 브랜드 지침이
 * 로고 변형(단색화·색 교체)을 금지한다. 흰 버튼 위에 원색 G 를 얹는 게 지침이
 * 규정한 형태이기도 하다. 그래서 tint 를 걸지 않는다.
 */
const GOOGLE_LOGO = require('../../assets/google-logo.png');

/**
 * 로그인 버튼 — 아이콘을 왼쪽에 두고 글자를 가운데 둔다.
 * Btn 에 아이콘 슬롯을 뚫으면 앱 전체 버튼이 흔들리므로 이 화면 안에서만 쓴다.
 */
function AuthBtn({
  icon, label, fill, style, disabled, onPress,
}: {
  /** 'google' 이면 원색 공식 로고, 아니면 auth 스프라이트 이름 */
  icon: string; label: string; fill?: boolean; style?: ViewStyle;
  disabled?: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        BORDER,
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: SP.md,
          backgroundColor: fill ? C.bgInv : 'transparent',
          borderWidth: pressed && !disabled ? 2 : 1,
          opacity: disabled ? O.dim : 1,
        },
        style,
      ]}
    >
      {icon === 'google' ? (
        <Image source={GOOGLE_LOGO} resizeMode="contain" style={{ width: 22, height: 22 }} />
      ) : (
        <Sprite set="auth" name={icon} size={22} tint={fill ? C.fgInv : WHITE} />
      )}
      <T size={14} bold center style={{ flex: 1, color: fill ? C.fgInv : WHITE }}>{label}</T>
      {/* 아이콘 폭만큼 오른쪽을 비워 글자가 진짜 가운데 오게 한다 */}
      <View style={{ width: 22 }} />
    </Pressable>
  );
}

export default function AuthScreen() {
  const account = useGame((s) => s.account);
  const signedUp = useGame((s) => s.signedUp);
  const signIn = useGame((s) => s.signIn);
  const complete = useGame((s) => s.completeSignUp);
  const setAvatar = useGame((s) => s.setAvatar);
  const avatar = useGame((s) => s.avatar);

  const [nick, setNick] = useState('');
  const needNick = !!account && !signedUp;

  // 구글이 준 `sub` 를 계정 id 로 쓴다 — 기기를 바꿔도 같은 값이라 이어쓸 수 있다
  const onGoogle = useCallback(
    (p: GoogleProfile) => signIn('google', p.id, p.email),
    [signIn],
  );
  const { ready: googleReady, busy, error: googleError, signIn: signInWithGoogle } =
    useGoogleSignIn(onGoogle);

  return (
    /* 로그인 화면은 내용이 적다 — 위에 붙이지 말고 세로 가운데로 모은다 */
    <Screen scroll={!!needNick}>
      <View style={{ flex: needNick ? undefined : 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', paddingBottom: SP.lg }}>
        {/* 가로로 넓은 원화라 정사각 Sprite 대신 비율을 지켜 깔아 준다 */}
        <Image
          source={AUTH_HERO}
          resizeMode="contain"
          style={{ width: '100%', height: 150, opacity: 0.9 }}
        />
        <T size={22} bold style={{ marginTop: SP.md }}>플레이어 키우기</T>
        {/* 명구는 로그인 단계에서만 — 회원가입은 입력할 게 많아 더 얹으면 시끄럽다 */}
        {!needNick && <TitleVerse />}
      </View>

      {!needNick ? (
        <Panel title="로그인">
          <AuthBtn
            icon="google"
            label={busy ? '구글 계정 확인 중…' : '구글로 계속하기'}
            fill
            disabled={busy || !googleReady}
            style={{ marginTop: SP.md }}
            onPress={signInWithGoogle}
          />
          {!googleReady && (
            <>
              <Sep />
              <View style={[BORDER, { padding: SP.xs }]}>
                <T size={11} bold>구글 클라이언트 ID 가 설정되지 않았습니다</T>
                <T size={11} dim="sub" style={{ marginTop: 2 }}>
                  app.json 의 expo.extra.googleAuth 에 클라이언트 ID 를 넣어 주세요.
                </T>
                <T size={11} dim="dim" style={{ marginTop: SP.xs }}>승인된 리디렉션 URI</T>
                <T size={11} selectable>{googleRedirectUri()}</T>
              </View>
            </>
          )}
          {!!googleError && (
            <>
              <Sep />
              <View style={[BORDER, { padding: SP.xs }]}>
                <T size={11} bold>로그인하지 못했습니다</T>
                <T size={11} dim="sub" style={{ marginTop: 2 }}>{googleError}</T>
              </View>
            </>
          )}
        </Panel>
      ) : (
        <Panel title="회원가입" right={<Tag label={account?.provider === 'google' ? '구글' : '게스트'} fill />}>
          <Row gap={SP.sm}>
            <Sprite set="auth" name="quill" size={30} />
            <T size={11} dim="sub" style={{ flex: 1 }}>
              쓸 이름을 정해 주세요. 실시간 피드와 채팅, 랭킹에 이 이름이 보입니다.
            </T>
          </Row>

          <Sep />
          <Row between>
            <T size={11} bold>닉네임</T>
            <T size={9} dim="dim">{nick.trim().length} / {NICKNAME_MAX}자</T>
          </Row>
          <TextInput
            value={nick}
            onChangeText={setNick}
            maxLength={NICKNAME_MAX}
            placeholder={`${NICKNAME_MIN}~${NICKNAME_MAX}자`}
            placeholderTextColor={`${WHITE}55`}
            style={[
              BORDER,
              {
                color: WHITE, fontFamily: MONO, fontSize: 16,
                paddingHorizontal: SP.sm, paddingVertical: SP.sm, marginTop: SP.xs,
              },
            ]}
          />
          <T size={9} dim="dim" style={{ marginTop: 3 }}>
            닉네임은 90일에 한 번 무료로 바꿀 수 있습니다.
          </T>

          <Sep />
          <T size={11} bold style={{ marginBottom: SP.xs }}>로고</T>
          <Row gap={SP.xs} style={{ flexWrap: 'wrap' }}>
            {AVATAR_IDS.slice(0, 8).map((id) => (
              <Btn
                key={id}
                label=""
                size="sm"
                fill={avatar === id}
                style={{ width: '23%', marginBottom: SP.xs, paddingVertical: SP.xs }}
                icon={(c) => <Sprite set="avatar" name={id} size={34} tint={c} />}
                onPress={() => setAvatar(id)}
              />
            ))}
          </Row>
          <T size={9} dim="dim">로고는 나중에 프로필에서 언제든 바꿀 수 있습니다.</T>

          <Btn
            label="시작하기"
            size="lg"
            fill
            style={{ marginTop: SP.md }}
            disabled={nick.trim().length < NICKNAME_MIN}
            onPress={() => complete(nick)}
          />
        </Panel>
      )}
      </View>
    </Screen>
  );
}
