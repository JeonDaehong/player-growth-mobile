import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { totalUnread, useChat } from '@/state/live';
import { useGame } from '@/state/store';
import { useMePlayer, useMyGuild } from '@/state/selectors';
import { useRoster } from '@/state/useBoard';
import { board } from '@/core/ranking';
import {
  CHANNELS, CHANNEL_LABEL, CHAT_HISTORY_MAX, CHAT_MAX_LEN, ChatMessage, formatUnread,
} from '@/core/chat';
import { Row, T } from './atoms';
import { Pixel } from './Pixel';
import { BUBBLE } from './sprites';
import { BORDER, C, MONO, O, SP, WHITE } from './theme';

/**
 * 탭바(높이 84) 위로 확실히 띄운다. 이 값이 탭바 높이보다 작으면 버튼이 탭 위에
 * 겹쳐 앉아 탭을 가린다 — 실제로 그랬다.
 */
const FAB_BOTTOM = 100;
const FAB_RIGHT = 20;
/**
 * 뱃지가 튀어나올 여백.
 *
 * 뱃지는 버튼의 오른쪽 위 **모서리 밖**에 앉는다. 예전에는 그걸 `top:-8, right:-8`
 * 로 만들었는데, 그러면 뱃지가 부모 View 의 경계 밖에 그려진다 — 안드로이드는
 * 부모 밖으로 나간 자식을 잘라 내므로 **숫자만 통째로 안 보인다.** 안 읽은 수는
 * 세고 있는데 화면에는 아무것도 안 뜨는, 원인을 찾기 제일 어려운 종류의 버그다.
 *
 * 그래서 부모에 그만큼 안쪽 여백을 주고 뱃지를 **경계 안**에 앉힌다. 버튼이 놓이는
 * 자리는 그대로다 (아래 `right`·`bottom` 에서 같은 값을 빼 준다).
 */
const BADGE_PAD = 10;

// ── 떠 있는 말풍선 버튼 ────────────────────────────────
export function ChatFab() {
  const unread = useChat((s) => s.unread);
  const open = useChat((s) => s.open);
  const setOpen = useChat((s) => s.setOpen);

  if (open) return null;

  // 뱃지는 채널 합계다 — 채널별로 두 개를 띄우면 버튼 하나에 숫자가 둘이 된다
  const badge = formatUnread(totalUnread(unread));

  return (
    <View
      style={{
        pointerEvents: 'box-none',
        position: 'absolute',
        right: FAB_RIGHT - BADGE_PAD,
        bottom: FAB_BOTTOM - BADGE_PAD,
        padding: BADGE_PAD,
      }}
    >
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={({ pressed }) => [
          BORDER,
          {
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            backgroundColor: pressed ? C.bgInv : C.bg,
          },
        ]}
      >
        {({ pressed }: { pressed: boolean }) => (
          <Pixel sprite={BUBBLE} scale={3} color={pressed ? C.fgInv : WHITE} />
        )}
      </Pressable>

      {!!badge && (
        <View
          style={[
            BORDER,
            {
              position: 'absolute',
              /* 부모 안쪽 여백 덕에 좌표가 0 이어도 버튼 모서리 밖에 걸친다 */
              top: 0,
              right: 0,
              minWidth: 22,
              height: 22,
              paddingHorizontal: 4,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.bgInv,
              borderWidth: 2,
            },
          ]}
        >
          <T size={badge.length >= 4 ? 9 : 11} bold style={{ color: C.fgInv }}>
            {badge}
          </T>
        </View>
      )}
    </View>
  );
}

// ── 채팅창 ─────────────────────────────────────────────
export function ChatPanel() {
  const open = useChat((s) => s.open);
  const setOpen = useChat((s) => s.setOpen);
  const channel = useChat((s) => s.channel);
  const setChannel = useChat((s) => s.setChannel);
  const messages = useChat((s) => s.messages[s.channel]);
  const unread = useChat((s) => s.unread);
  const send = useChat((s) => s.send);
  const transportName = useChat((s) => s.transport.name);
  const connected = useChat((s) => s.connected);
  const online = useChat((s) => s.online);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const me = useMePlayer();
  const myTitle = useGame((g) => g.equippedTitle);
  const guild = useMyGuild();
  /* 명패의 순위는 지금 서버에 올라와 있는 사람들 기준이다 (구독은 App 이 하나만 건다) */
  const { others } = useRoster();

  /*
    길드 채널은 길드가 있어야 쓴다. 탈퇴한 뒤에도 그 채널에 머물러 있으면
    아무도 없는 방에 대고 말을 걸게 되므로 전체로 돌려보낸다.
  */
  useEffect(() => {
    if (channel === 'guild' && !guild) setChannel('all');
  }, [channel, guild, setChannel]);

  // 새 메시지가 오면 아래로 붙는다 (채널을 바꿀 때도)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length, channel, open]);

  // 명패는 **보내는 쪽**이 만들어 넘긴다. live.ts 에서 useGame 을 읽으면
  // store.ts → live.ts 와 맞물려 순환 import 가 된다.
  const submit = useCallback(() => {
    if (!text.trim()) return;
    send(text, {
      title: myTitle ?? undefined,
      rank: board('ilvl', others, me).myRank,
    });
    setText('');
  }, [text, send, myTitle, me, others]);

  if (!open) return null;

  const locked = channel === 'guild' && !guild;

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(140)}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Pressable style={{ flex: 1, backgroundColor: '#000000CC' }} onPress={() => setOpen(false)} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(220)}
        exiting={SlideOutDown.duration(180)}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '72%',
          backgroundColor: C.bg,
          borderTopWidth: 2,
          borderTopColor: WHITE,
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* 헤더 — 지금 어느 방인지가 제목이다 */}
          <Row
            between
            style={{
              paddingHorizontal: SP.md,
              paddingVertical: SP.sm,
              borderBottomWidth: 1,
              borderBottomColor: WHITE,
            }}
          >
            <Row gap={SP.sm} style={{ flex: 1 }}>
              <Pixel sprite={BUBBLE} scale={2} />
              <T size={13} bold numberOfLines={1} style={{ flex: 1 }}>
                {channel === 'guild' ? (guild?.name ?? '길드 채팅') : '전체 채팅'}
              </T>
              {/*
                지금 실시간인지, 그리고 몇 명이 있는지.

                "접속됨" 이라고만 적었을 때는 그게 참인지 알 길이 없었다 —
                소켓이 한 번도 안 열려도 같은 글자가 떠 있었다. 이제 실제
                구독 상태를 그대로 적는다. 소켓이 없어도 채팅은 도니까
                "끊김" 이 아니라 **얼마나 늦는지**를 적는다.
              */}
              <View style={[BORDER, { paddingHorizontal: 4, paddingVertical: 1 }]}>
                <T size={9} dim="sub">
                  {transportName === 'off' ? '연결 없음' : connected ? '실시간' : '25초마다'}
                </T>
              </View>
              {online > 0 && (
                <View style={[BORDER, { paddingHorizontal: 4, paddingVertical: 1 }]}>
                  <T size={9} dim="sub">{online}명</T>
                </View>
              )}
            </Row>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <T size={16} bold>✕</T>
            </Pressable>
          </Row>

          {/*
            채널 탭.
            창을 두 개로 쪼개는 대신 한 창에서 채널만 가른다 — 안 읽은 개수를
            탭에 그대로 얹어, 안 보고 있는 쪽에 말이 쌓인 걸 여기서 바로 안다.
          */}
          <Row gap={0} style={{ borderBottomWidth: 1, borderBottomColor: WHITE }}>
            {CHANNELS.map((c) => {
              const on = channel === c;
              const n = formatUnread(unread[c]);
              return (
                <Pressable
                  key={c}
                  onPress={() => setChannel(c)}
                  style={{
                    flex: 1,
                    paddingVertical: SP.sm,
                    alignItems: 'center',
                    backgroundColor: on ? C.bgInv : 'transparent',
                  }}
                >
                  <Row gap={SP.xs}>
                    <T size={12} bold style={on ? { color: C.fgInv } : undefined}>
                      {CHANNEL_LABEL[c]}
                    </T>
                    {!!n && !on && (
                      <View style={[BORDER, { paddingHorizontal: 3 }]}>
                        <T size={9} bold>{n}</T>
                      </View>
                    )}
                  </Row>
                </Pressable>
              );
            })}
          </Row>

          {/* 메시지 */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            // 메시지가 적어도 아래에서부터 쌓이게 — 위로 붙으면 빈 채팅방처럼 보인다
            contentContainerStyle={{ padding: SP.md, paddingBottom: SP.sm, flexGrow: 1, justifyContent: 'flex-end' }}
            showsVerticalScrollIndicator={false}
          >
            <T size={9} dim="faint" center style={{ marginBottom: SP.sm }}>
              {channel === 'guild' ? '길드원만 볼 수 있습니다' : '누구나 볼 수 있습니다'}
              {' · '}최근 {CHAT_HISTORY_MAX}개까지 보관
            </T>
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
          </ScrollView>

          {/* 입력 */}
          <Row
            gap={SP.sm}
            style={{
              paddingHorizontal: SP.md,
              paddingVertical: SP.sm,
              borderTopWidth: 1,
              borderTopColor: WHITE,
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={submit}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!locked}
              maxLength={CHAT_MAX_LEN}
              placeholder={locked ? '길드에 가입해야 쓸 수 있습니다' : '메시지를 입력하세요'}
              placeholderTextColor="#FFFFFF55"
              style={[
                BORDER,
                {
                  flex: 1,
                  color: WHITE,
                  fontFamily: MONO,
                  fontSize: 13,
                  opacity: locked ? O.dim : 1,
                  paddingHorizontal: SP.sm,
                  paddingVertical: Platform.OS === 'ios' ? SP.sm : SP.xs,
                },
              ]}
            />
            <Pressable
              onPress={locked ? undefined : submit}
              style={({ pressed }) => [
                BORDER,
                {
                  paddingHorizontal: SP.md,
                  justifyContent: 'center',
                  opacity: locked ? O.dim : 1,
                  backgroundColor: !locked && (pressed || !!text.trim()) ? C.bgInv : 'transparent',
                },
              ]}
            >
              <T size={12} bold style={{ color: !locked && text.trim() ? C.fgInv : WHITE }}>전송</T>
            </Pressable>
          </Row>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  if (msg.system) {
    return (
      <T size={10} dim="dim" center style={{ paddingVertical: SP.xs }}>
        {msg.text}
      </T>
    );
  }
  const mine = !!msg.mine;
  return (
    <View style={{ marginBottom: SP.sm, alignItems: mine ? 'flex-end' : 'flex-start' }}>
      {!mine && (
        <T size={9} dim="dim" style={{ marginBottom: 2 }}>
          {msg.nick}
        </T>
      )}
      <View
        style={[
          BORDER,
          {
            maxWidth: '82%',
            paddingHorizontal: SP.sm,
            paddingVertical: 6,
            backgroundColor: mine ? C.bgInv : 'transparent',
          },
        ]}
      >
        <T size={12} style={{ color: mine ? C.fgInv : WHITE, opacity: mine ? 1 : O.full }}>
          {msg.text}
        </T>
      </View>
      {/* 서버까지 못 간 말 — 아무도 대답 안 하는 이유가 보여야 한다 */}
      {!!msg.failed && (
        <T size={9} dim="dim" style={{ marginTop: 2 }}>전송 실패 · 나만 보입니다</T>
      )}
    </View>
  );
}
