import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { AppState, Pressable, StatusBar, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useGame } from '@/state/store';
import { flushStorage } from '@/state/storage';
import { Toasts } from '@/ui/Toasts';
import { ChatPanel } from '@/ui/Chat';
import { CombatFxHost } from '@/ui/CombatFx';
import { TutorialHost, useIntroTutorial } from '@/ui/Tutorial';
import { EventPopupHost } from '@/ui/EventPopup';
import { ArenaAwayPopup } from '@/ui/ArenaAwayPopup';
import { GuidePopup } from '@/ui/GuidePopup';
import { SoonPopupHost } from '@/ui/SoonPopup';
import { OfflinePopup } from '@/screens/home/OfflinePopup';
import { TitleGetPopup } from '@/ui/TitleGetPopup';
import { ClosureNoticePopup } from '@/ui/ClosureNoticePopup';
import { keepBgmAlive, sfx, startBgm, stopBgm } from '@/ui/sfx';
import { useCloudSync } from '@/state/useCloudSync';
import { loadCloudAuthState } from '@/state/googleAuth';
import { RushResultHost } from '@/ui/RushResult';
import { LotteryResultHost } from '@/ui/LotteryResult';
import { connectFeed, useChat } from '@/state/live';
import { connectRoster } from '@/state/useBoard';
import { connectGuilds } from '@/state/useGuilds';
import { useNetSync } from '@/state/useNetSync';
import { BLACK, MONO, WHITE } from '@/ui/theme';
import { applyWebTextRendering } from '@/ui/webText';
import { applyWebViewport } from '@/ui/webViewport';
import { InstallBar } from '@/ui/InstallBar';
import { Crash } from '@/ui/Crash';

import AuthScreen from '@/screens/AuthScreen';
import HomeScreen from '@/screens/HomeScreen';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: WHITE,
    background: BLACK,
    card: BLACK,
    text: WHITE,
    border: WHITE,
    notification: WHITE,
  },
};

/**
 * 뒤로가기 버튼.
 *
 * 기본 버튼은 **검은 화살표 PNG 한 장**을 `tintColor` 로 물들여 그린다. 헤더 배경이
 * 검정이라, 물들이기가 한 단계라도 어긋나면 검정 위의 검정이 된다 — 자리는
 * 잡혀 있어서 눌리기는 하는데 아무것도 안 보인다. 실제로 그렇게 보였다.
 *
 * 그림에 기대지 않고 **글자로 그린다.** 이 게임은 어차피 흑백 모노스페이스라
 * 꺾쇠 하나가 아이콘보다 화면에 더 잘 맞고, 물들이기가 끼어들 자리가 없어
 * 어느 플랫폼에서도 같은 것이 보인다.
 *
 * 글자는 `<` 하나뿐이다. "뒤로" 를 같이 적어 봤더니 헤더 제목과 글자 두 덩어리가
 * 나란히 서서 어느 쪽이 제목인지 흐려졌다. 과녁은 라벨 대신 `hitSlop` 으로 넓힌다 —
 * 보이는 것은 작게, 눌리는 것은 크게.
 */
function HeaderBack() {
  const nav = useNavigation();
  return (
    <Pressable
      onPress={() => { sfx('tap'); nav.goBack(); }}
      /* 글자 하나짜리 과녁이라 손가락이 닿을 자리를 사방으로 넉넉히 넓힌다 */
      hitSlop={{ top: 14, bottom: 14, left: 14, right: 20 }}
      style={({ pressed }) => ({
        paddingVertical: 4,
        /* 화면 왼쪽 끝에 붙어 있으면 눌리지도 않고 보기도 답답하다 */
        paddingLeft: 10,
        paddingRight: 12,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontFamily: MONO, fontSize: 22, fontWeight: 'bold', color: WHITE }}>
        {'<'}
      </Text>
    </Pressable>
  );
}

const stackOptions = {
  headerStyle: { backgroundColor: BLACK },
  headerTintColor: WHITE,
  headerTitleStyle: { fontFamily: MONO, fontSize: 15, fontWeight: 'bold' as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: BLACK },
  /* 기본 버튼은 숨기고 우리 것으로 갈아 끼운다 — 둘 다 켜면 화살표가 두 개가 된다 */
  headerBackVisible: false,
  headerLeft: ({ canGoBack }: { canGoBack?: boolean }) =>
    (canGoBack ? <HeaderBack /> : null),
};

/*
  지금은 화면이 홈 하나다.

  탭 바를 한 칸짜리로 남겨 두면 화면 아래 84px 을 아무 선택지도 없는 막대가
  차지한다. 그래서 탭 대신 **스택 하나**를 쓴다. `NavigationContainer` 는
  그대로 둔다 — 헤더(Hud)와 화면 전환 문맥이 여기 붙어 있어서, 화면을 다시
  붙일 때 이 파일만 고치면 된다.
*/
const RootStack = createNativeStackNavigator();

/** 시간 경과 정산 드라이버. 포그라운드에서 1초마다, 복귀 시 즉시. */
function useTicker() {
  const tick = useGame((s) => s.tick);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = () => {
      if (timer.current) return;
      tick();
      timer.current = setInterval(tick, 1000);
    };
    const stop = () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };

    start();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') start();
      else {
        stop();
        void flushStorage();
      }
    });
    return () => {
      stop();
      sub.remove();
    };
  }, [tick]);
}

/**
 * 배경음 드라이버.
 *
 * 켜고 끄는 판단은 스토어(설정)가 하고, 여기서는 **앱 생명주기**만 본다.
 *   · 포그라운드로 돌아오면 살아 있는지 확인하고 멈춰 있으면 되살린다
 *     (플랫폼이 백그라운드에서 오디오 세션을 회수해 가는 경우가 있다)
 *   · 백그라운드로 가면 멈춘다 — 앱을 껐는데 음악만 계속 나오면 안 된다
 *
 * ⚠ 웹은 사용자가 화면을 한 번 건드리기 전에는 자동재생을 막는다. 그래서 첫 탭에서
 * 한 번 더 시도한다 (효과음이 나는 순간이면 오디오 컨텍스트가 이미 열려 있다).
 */
function useBgm(active: boolean) {
  useEffect(() => {
    if (!active) return;
    startBgm();
    /*
      되살리기 타이머는 **포그라운드일 때만** 돌아야 한다.
      백그라운드에서도 돌면 방금 멈춘 음악을 5초 뒤에 자기가 다시 켜서,
      앱을 껐는데 음악만 계속 나온다 (타이머는 백그라운드에서도 돈다).
    */
    let foreground = AppState.currentState === 'active';
    const sub = AppState.addEventListener('change', (st) => {
      foreground = st === 'active';
      if (foreground) keepBgmAlive();
      else stopBgm();
    });
    // 웹 자동재생 차단 대비 — 첫 입력 뒤에 한 번 더
    const retry = setInterval(() => { if (foreground) keepBgmAlive(); }, 5000);
    return () => {
      sub.remove();
      clearInterval(retry);
      stopBgm();
    };
  }, [active]);
}

/**
 * 실시간 계층 드라이버 — 피드와 채팅을 서버에 붙인다.
 *
 * 예전엔 여기서 2.6~6.2초마다 가짜 사건을 하나씩 지어 넣었다. 지금은
 * **지어내는 게 하나도 없다** — 붙이고, 받고, 떠날 때 끊는 게 전부다.
 *
 * 백그라운드로 가면 끊는다. 소켓을 열어 둔 채 잠들면 배터리를 먹고,
 * 브라우저는 어차피 몇 분 뒤 연결을 회수한다. 돌아오면 다시 붙으면서
 * 그동안 오간 말을 한 번에 받아 온다 (transport 가 최근 대화를 먼저 채운다).
 *
 * @param active 게임에 들어온 뒤인가 — 로그인 화면에서는 붙지 않는다
 */
function useLive(active: boolean) {
  const connect = useChat((s) => s.connect);

  useEffect(() => {
    if (!active) return;
    let offChat: (() => void) | null = null;
    let offFeed: (() => void) | null = null;
    let offRoster: (() => void) | null = null;
    let offGuilds: (() => void) | null = null;

    const start = () => {
      if (!offChat) offChat = connect();
      if (!offFeed) offFeed = connectFeed();
      // 순위표도 여기서 한 번만 붙인다 — 화면마다 붙으면 소켓이 여러 개가 된다
      if (!offRoster) offRoster = connectRoster();
      // 길드 명부. 인원·평균 템렙은 위의 순위표(프로필)에서 나온다
      if (!offGuilds) offGuilds = connectGuilds();
    };
    const stop = () => {
      offChat?.(); offChat = null;
      offFeed?.(); offFeed = null;
      offRoster?.(); offRoster = null;
      offGuilds?.(); offGuilds = null;
    };

    start();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') start();
      else stop();
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [active, connect]);
}

export default function App() {
  applyWebTextRendering();
  /*
    확대 금지. 웹에서만 하는 일이고, 여러 번 불려도 안전하다
    (`ui/webViewport`).

    ── 전체 화면 가로채기는 뺐다 ──

    첫 탭에 `requestFullscreen` 을 걸어 시스템 바를 치우고 있었다. 브라우저가
    사용자 입력 없이는 전체 화면을 안 내주므로 **아무 데나 처음 누른 것**을
    그 입력으로 썼는데, 그건 누른 사람이 시킨 일이 아니다 — 단추를 누르려던
    사람에게 화면이 통째로 넘어간다.

    시스템 바를 없애는 것은 웹이 할 일이 아니다. 앱으로 만들 때 Expo 쪽에서
    한다 (`expo-navigation-bar`).
  */
  applyWebViewport();
  /*
    지난 세션 시도의 결과를 되살린다. 리디렉션으로 구글에 다녀오면 이 앱은
    통째로 새로 뜨므로, 안 되살리면 방금 한 시도가 없던 일이 된다.
  */
  useEffect(() => { void loadCloudAuthState(); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BLACK }}>
      <SafeAreaProvider>
        {/*
          그리다 던진 것을 받는 한 겹 (`ui/Crash`).

          `SafeAreaProvider` **안**에 둔다 — 잡는 화면도 노치를 피해 그려야
          하고, 밖에 두면 붙잡는 순간 provider 까지 같이 날아가서 잡는
          화면이 화면 맨 위에 걸린다.
        */}
        <Crash>
          <Root />
        </Crash>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/*
  SafeAreaProvider 안쪽이어야 화면들이 inset 을 읽을 수 있어서 한 겹 내려 둔다.
  (탭 바가 있던 시절에는 여기서 직접 읽어 바 높이에 더했다)
*/
function Root() {
  useTicker();
  /*
    첫 진입 안내. 회원가입 전(!signedUp)에는 훅 안에서 스스로 물러나므로
    로그인 화면에서 튀어나오지 않는다.
  */
  useIntroTutorial();
  const account = useGame((s) => s.account);
  const signedUp = useGame((s) => s.signedUp);
  // 로그인 화면은 조용하게 둔다 — 음악은 게임에 들어온 뒤부터
  useBgm(!!account && signedUp);
  // 저장본을 계정에 묶어 올린다. 자격증명이 없는 빌드에서는 스스로 물러난다
  useCloudSync(!!account && signedUp);
  /*
    남에게 보이는 것들. 저장본과 따로 간다 —
    올리는 것(내 공개 한 줄)과 받는 것(피드·채팅)이 서로 다른 표를 쓴다.
  */
  useNetSync(!!account && signedUp);
  useLive(!!account && signedUp);

  /**
   * 로그인·회원가입을 마치기 전에는 게임 화면을 보여주지 않는다.
   * 탭 네비게이션 자체를 걸지 않아야 뒤로가기로 새어 들어가지 않는다.
   */
  if (!account || !signedUp) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={BLACK} translucent={false} />
        <View style={{ flex: 1, backgroundColor: BLACK }}>
          <AuthScreen />
          <Toasts />
        </View>
      </>
    );
  }

  return (
    <>
        {/* 안드로이드에서 translucent 면 상태바 아래로 콘텐츠가 파고들어
            inset 계산이 흔들린다. 불투명하게 고정한다. */}
        <StatusBar barStyle="light-content" backgroundColor={BLACK} translucent={false} />
      <View style={{ flex: 1, backgroundColor: BLACK }}>
        <NavigationContainer theme={navTheme}>
          {/*
            ── 머리말을 아예 안 그린다 ──

            `header: () => <TopBar />` 였다. 위 띠가 무대 **안으로** 들어가면서
            (`HomeScreen` 이 `BattleView` 의 `top` 으로 넘긴다) 여기서 한 번 더
            그리면 같은 띠가 두 개 뜬다.

            내비게이터를 안 지우는 이유는 화면이 늘 것이기 때문이다 — 지금은
            홈 하나뿐이라 머리말만 끈다.
          */}
          <RootStack.Navigator
            screenOptions={{ ...stackOptions, headerShown: false }}
          >
            <RootStack.Screen name="홈" component={HomeScreen} />
          </RootStack.Navigator>
        </NavigationContainer>
          {/*
            ── 떠 있던 말풍선 단추는 걷었다 ──

            화면 오른쪽 아래에 떠 있었는데, 새 뼈대에서는 그 자리를 아래 띠가
            쓴다 (`screens/home/BottomNav`) — 겹치면 둘 중 하나가 안 눌린다.

            채팅을 여는 단추는 흐르는 세 줄 왼쪽으로 갔다 (`Ticker`). 읽는
            자리 옆에 쓰는 단추가 있는 편이 맞기도 하다.
          */}
          <ChatPanel />
          <CombatFxHost />
          <RushResultHost />
          <LotteryResultHost />
          {/* 튜토리얼이 이벤트 팝업보다 위에 온다 — 처음 켠 사람은 조작부터 배워야 한다 */}
          <EventPopupHost />
          {/* 자리를 비운 사이 당한 투기장 판 — 어느 탭으로 들어오든 한 번은 봐야 한다 */}
          <ArenaAwayPopup active={!!account && signedUp} />
          {/* 새로 열린 콘텐츠 안내 — 열린 줄 모르는 콘텐츠는 없는 콘텐츠다 */}
          <GuidePopup active={!!account && signedUp} />
          {/* 칭호 획득 — 로고가 같이 열리는 경우가 있어 토스트로는 놓친다 */}
          <TitleGetPopup active={!!account && signedUp} />
          {/* 없앤 콘텐츠 뒷정리 — 종목은 돈으로, 담보는 창고로 돌려줬다는 안내 (한 번만) */}
          <ClosureNoticePopup active={!!account && signedUp} />
          {/* 자리를 비운 동안 쌓인 것 — 돌아오면 선술집 점원이 들고 서 있다 */}
          <OfflinePopup active={!!account && signedUp} />
          {/* 아직 없는 화면으로 가는 단추가 하는 말. 문은 하나만 둔다 */}
          <SoonPopupHost />
          <TutorialHost />
          <Toasts />
          {/*
            "홈 화면에 추가" 한 줄. 대개 안 뜬다 (`ui/InstallBar`) — 설치할 수
            있을 때만, 그리고 닫기 전까지만.

            토스트보다 **뒤에** 둔다. 둘이 겹치면 방금 한 행동의 결과가
            먼저 보여야 한다.
          */}
          <InstallBar />
      </View>
    </>
  );
}
