/**
 * ── 흐르는 세 줄 ── 중요한 소식과 채팅이 같이 올라온다.
 *
 * ## 무대 **안** 왼쪽 아래다
 *
 * 무대 밑에 있었다. 그러면 무대와 채팅이 위아래로 나란한 두 상자가 되고,
 * 무대는 그만큼 눌린다. 요즘 게임은 채팅을 화면 구석에 작게 얹어 두는데,
 * 그러면 무대를 한 픽셀도 안 뺏으면서 늘 보인다.
 *
 * 그래서 여기는 **폭이 화면의 절반쯤**이다 (`BattleView` 의 `corner`).
 * 넓으면 세 줄이 무대를 가로질러서, 정작 그 아래 벌어지는 싸움을 덮는다.
 *
 * ## 왜 둘을 섞나
 *
 * 따로 두면 자리가 두 벌 필요하고, 좁은 화면에서 그건 곧 둘 다 두 줄씩이라는
 * 뜻이다. 두 줄짜리 채팅은 채팅이 아니고 두 줄짜리 소식은 소식이 아니다.
 *
 * 섞으면 **세 줄로 둘 다 산다.** 둘이 성격이 달라 헷갈리지도 않는다 — 소식은
 * 남이 한 일이고(`◆`) 채팅은 남이 한 말이다(`말한 사람:`).
 *
 * ## 세 줄인 이유
 *
 * 한 줄이면 방금 지나간 것을 놓친다. 다섯 줄이면 무대를 그만큼 먹는다.
 * 셋은 "지금 것과 방금 것과 그 앞엣것" 이라, 눈을 뗐다 돌아와도 흐름이
 * 이어진다.
 *
 * ## 왼쪽 단추
 *
 * 누르면 채팅창이 열린다 (`ui/Chat` 의 `ChatPanel`). 예전에는 화면 오른쪽
 * 아래에 떠 있는 동그란 단추였는데 (`ChatFab`), 새 뼈대에서는 그 자리를 아래
 * 띠가 쓴다 — 겹치면 둘 중 하나가 안 눌린다.
 *
 * 여기가 더 맞는 자리이기도 하다. **읽는 자리 옆에 쓰는 단추**가 있으면
 * 둘이 한 가지 일로 읽힌다.
 */
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useChat, useFeed } from '@/state/live';
import { totalUnread } from '@/state/live';
import { formatUnread } from '@/core/chat';
import { T } from '@/ui/atoms';
import { Pixel } from '@/ui/Pixel';
import { BUBBLE } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { C, LINE, R, SP, SURF, WHITE } from '@/ui/theme';

/** 몇 줄까지 */
const LINES = 3;

/**
 * 한 줄의 높이 — 셋이 늘 같은 자리를 차지해야 무대가 위아래로 안 흔들린다.
 *
 * 15 에서 13 으로 줄였다. 무대 안으로 들어오면서 이 덩이가 차지하는 높이가
 * 곧 **가려지는 땅**이 되었다.
 */
const ROW_H = 13;

interface Line {
  key: string;
  at: number;
  /** 누가 한 말인가. 소식이면 빈 글자 */
  who: string;
  text: string;
}

export function Ticker() {
  const events = useFeed((s) => s.events);
  /*
    채팅은 **전체 채널만** 본다.

    길드 말까지 섞으면 길드에 든 사람과 안 든 사람이 다른 것을 보게 되고,
    그러면 이 세 줄이 "모두가 보는 자리" 가 아니게 된다. 길드 말은 창을
    열어야 보인다.
  */
  const chat = useChat((s) => s.messages.all);
  const unread = useChat((s) => s.unread);
  const setOpen = useChat((s) => s.setOpen);

  /*
    둘을 시각으로 섞어 **새것 셋**만 남긴다.

    `useMemo` 로 묶는다 — 전투가 0.5초마다 이 화면을 다시 그리는데, 그때마다
    두 목록을 이어 붙여 정렬하면 초당 두 번씩 스무 줄을 정렬하게 된다.
  */
  const lines = useMemo<Line[]>(() => {
    const all: Line[] = [
      ...events.map((e) => ({ key: `f${e.id}`, at: e.at, who: '', text: e.text })),
      ...(chat ?? []).map((m) => ({ key: `c${m.id}`, at: m.at, who: m.nick, text: m.text })),
    ];
    all.sort((a, b) => b.at - a.at);
    return all.slice(0, LINES);
  }, [events, chat]);

  const badge = formatUnread(totalUnread(unread));

  return (
    /*
      **한 덩이다 — 두 개의 상자가 아니다.**

      예전에는 단추와 세 줄이 각자 네모를 두르고 4px 떨어져 있었다. 그러면
      한 가지 일(읽고 쓰기)이 두 덩이로 갈려 보인다.

      무대 위에 얹히므로 (`BattleView` 의 `corner`) 뒤에 **반투명 검은 판**을
      깐다. 배경이 밝은 챕터에서는 흰 글씨가 그냥은 안 읽힌다. 완전히 검게
      깔지 않는 이유는, 여기가 무대의 일부라는 것이 보여야 하기 때문이다.
    */
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: SURF.veil,
        /*
          테두리를 지우고 **모서리만** 남겼다. 무대 위에 얹히는 것에 흰 선을
          두르면 그 선이 곧 "여기부터는 게임이 아니다" 가 되어, 채팅이 무대
          안에 있다는 인상이 깨진다. 어두운 판 하나면 글씨는 읽히고 무대는
          안 갈린다.
        */
        borderRadius: R.md,
        overflow: 'hidden',
      }}
    >
      {/* ── 말하는 단추 ── */}
      <Pressable
        onPress={() => { sfx('tap'); setOpen(true); }}
        hitSlop={6}
        style={({ pressed }) => ({
          width: 30,
          /* 세 줄과 키를 맞춘다 — 낮으면 글 옆에 떠 있는 것으로 보인다 */
          height: ROW_H * LINES + SP.xs * 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderRightWidth: 1,
          borderRightColor: LINE.low,
          backgroundColor: pressed ? C.bgInv : 'transparent',
        })}
      >
        {({ pressed }: { pressed: boolean }) => (
          <Pixel sprite={BUBBLE} scale={1.6} color={pressed ? C.fgInv : WHITE} />
        )}
      </Pressable>

      {/*
        안 읽은 수는 단추 **위**가 아니라 옆에 붙인다. 위에 얹으면 부모 밖으로
        나가고, 안드로이드는 부모 밖 자식을 잘라 낸다 (`ui/Chat` 에 그 이야기가
        있다). 여기는 자리가 넉넉하므로 그 수를 안 쓴다.
      */}
      {!!badge && (
        <View
          style={{
            position: 'absolute',
            left: 20,
            top: 2,
            minWidth: 16,
            paddingHorizontal: 4,
            alignItems: 'center',
            borderRadius: R.round,
            backgroundColor: C.bgInv,
            zIndex: 2,
          }}
        >
          <T size={8} bold style={{ color: C.fgInv }}>{badge}</T>
        </View>
      )}

      {/* ── 세 줄 ── */}
      <View
        style={{
          flex: 1,
          height: ROW_H * LINES + SP.xs * 2,
          paddingHorizontal: SP.xs,
          paddingVertical: SP.xs,
          justifyContent: 'flex-start',
          /* 넘치면 자른다 — 줄이 길어져도 무대 높이는 안 흔들린다 */
          overflow: 'hidden',
        }}
      >
        {!lines.length && (
          <T size={9} dim="dim" numberOfLines={1} style={{ lineHeight: ROW_H }}>
            아직 아무 소식도 없습니다.
          </T>
        )}
        {lines.map((l) => (
          <T key={l.key} size={9} numberOfLines={1} style={{ lineHeight: ROW_H }}>
            {l.who ? `${l.who}: ${l.text}` : `◆ ${l.text}`}
          </T>
        ))}
      </View>
    </View>
  );
}
