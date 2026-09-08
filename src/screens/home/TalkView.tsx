/**
 * ── 대화 화면 ── 비주얼 노벨 꼴.
 *
 * 창 안에 글줄만 있던 것을 화면으로 키웠다. 대화는 **이 사람과 마주 앉는
 * 일**인데, 테두리 있는 상자 안의 두 줄짜리 글로는 그 말이 안 된다 — 아래
 * 목록으로 돌아갈 단추가 늘 보이는 채로 읽게 되니까.
 *
 * 얼개는 흔한 것 그대로다 (`assets/2026-09-08/maxresdefault.jpg`).
 *
 *   배경     판 그림 한 장을 흐리게 깔고 (`bg_chapter`)
 *   인물     오른쪽에 크게, 아래가 화면 밖으로 잘려 나가게
 *   대사창   아래 3분의 1, 이름 한 줄 + 말 한 줄
 *   선택지   **화면 한가운데** 뜨는 창
 *
 * ## 선택지를 가운데 띄우는 까닭
 *
 * 대사창 안에 넣으면 셋이 세로로 쌓여 그 상자가 화면 절반이 된다. 그러면
 * 인물이 가려지고, 무엇보다 **말과 고르는 것이 한 덩어리**로 보여서 어디까지가
 * 그 사람의 말인지 흐려진다. 가운데로 띄우면 말은 아래에 그대로 남아 있고,
 * 고르는 동안에도 무엇에 답하는 것인지가 보인다.
 *
 * ## 다 쓰면 **한마디만** 한다
 *
 * 하루 두 번을 다 쓰면 고를 것이 없는 대사가 나온다 (`core/lines` 의
 * `linesOf`). 아무 일도 안 일어나게 두면 "말을 걸 수 없다" 와 "오늘은 더 못
 * 쌓는다" 가 화면에서 같아 보인다.
 */
import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId } from '@/core/chars';
import { TALKS, TALK_A_DAY, TalkDef } from '@/core/bond';
import { dayKey } from '@/core/events';
import { linesOf } from '@/core/lines';
import { T } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { spriteLoose } from '@/ui/spriteAssets';
import { sfx } from '@/ui/sfx';
import { useBackClose } from '@/ui/backGuard';
import { BLACK, BORDER, C, FS, LINE, R, SP, SURF, WHITE } from '@/ui/theme';

/** 대사창이 화면 아래 얼마를 먹나 */
const BOX_H = 168;

export function TalkView({ who, onClose }: { who: CharId; onClose: () => void }) {
  /*
    ── 화면 크기를 **직접 잰다** ──

    배경이 세 번 고쳐도 화면 11시에 조그맣게 떴다. `inset: 0` · `absoluteFill` ·
    `절대 상자 + 100%` 를 차례로 해 봤는데 다 같았다 — 셋 다 **부모의 크기를
    물려받는** 방법이라, 부모가 크기를 못 잡으면 셋 다 똑같이 0 이 된다.
    창 안에서 `flex: 1` 이 높이를 못 잡고 있었던 것이다.

    그래서 물려받기를 그만두고 잰다. `useWindowDimensions` 는 화면이 돌거나
    브라우저 창이 바뀌면 다시 알려 주므로, 한 번 박아 넣는 것과 다르다.
  */
  const win = useWindowDimensions();
  const talkBond = useGame((s) => s.talkBond);
  const bonds = useGame((s) => s.bonds);
  const toast = useGame((s) => s.toast);
  const d = CHARS[who];

  const list = TALKS[who] ?? [];
  /*
    ── 어느 대화인지는 **화면을 열 때 한 번** 정한다 ──

    렌더마다 고르면 선택지를 누르는 순간 질문이 바뀐다.
  */
  const pick = useMemo(
    () => Math.floor(Math.random() * Math.max(1, list.length)),
    [list],
  );
  /** 오늘 몫을 다 썼을 때 하는 한마디 — 애정은 안 오른다 */
  const idle = useMemo(() => {
    const all = linesOf(who, d?.quote);
    return all[Math.floor(Math.random() * Math.max(1, all.length))] ?? '';
  }, [who, d]);

  /*
    남은 횟수는 **화면을 열 때 한 번** 읽는다. 고르고 나면 스토어의 값이
    줄어드는데, 그걸 그대로 보면 답을 듣는 도중에 화면이 한마디짜리로
    갈아 끼워진다.
  */
  const canPick = useMemo(() => {
    const b = bonds[who];
    const key = dayKey(Date.now());
    const used = b && b.talkDay === key ? b.talks : 0;
    return used < TALK_A_DAY && list.length > 0;
    /* 열 때 한 번만 — `bonds` 를 갈래에 넣으면 고른 뒤에 다시 센다 */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who]);

  const talk: TalkDef | null = canPick ? list[pick] ?? null : null;
  /** 고르고 난 뒤 — 그 사람의 대답과 오른 값 */
  const [said, setSaid] = useState<{ reply: string; exp: number } | null>(null);
  /** 선택지 창을 띄웠나 */
  const [asking, setAsking] = useState(false);

  useBackClose(true, onClose);
  if (!d) return null;

  /** 지금 대사창에 뜨는 말 */
  const line = said ? said.reply : (talk ? talk.ask : idle);
  /** 아직 고를 것이 남았나 */
  const waiting = !!talk && !said;
  const bg = spriteLoose('bg_chapter', '01');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ width: win.width, height: win.height, backgroundColor: BLACK }}>
        {/*
          ── 배경 ── 판 그림 한 장을 아주 흐리게.

          무대에서 쓰는 것과 같은 그림이다 (`BattleView`). 대화가 **이 게임
          안에서** 일어나는 일로 보이려면 배경이 딴 데서 온 것이면 안 된다.
          흐리게 까는 까닭은 글을 읽는 화면이기 때문이다.

          **잰 크기를 그대로 준다** (`win`). 비율로 주면 부모가 크기를 못
          잡았을 때 0 이 되는데, 그 증상이 바로 11시의 작은 그림이었다.
        */}
        {!!bg && (
          <Image
            source={bg}
            resizeMode="cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: win.width,
              height: win.height,
              opacity: 0.22,
            }}
          />
        )}

        {/* 아무 데나 누르면 넘어간다 — 답을 다 읽었으면 닫힌다 */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => {
            sfx('tap');
            if (waiting) { setAsking(true); return; }
            onClose();
          }}
        >
          {/*
            ── 인물 ── 오른쪽에 크게, **아래가 잘린다.**

            상자 안에 다 담으면 인형이 서 있는 것으로 보인다. 화면 밖으로
            나가야 "여기 있는 사람" 이 된다.
          */}
          <View
            style={{
              position: 'absolute',
              right: -20,
              bottom: BOX_H - 24,
              alignItems: 'flex-end',
            }}
          >
            <Sprite set="char_full" name={who} size={320} fit="contain" />
          </View>
        </Pressable>

        {/* ── 대사창 ── 아래에 붙박이 */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: BOX_H,
            backgroundColor: 'rgba(0,0,0,0.82)',
            borderTopWidth: 1,
            borderTopColor: LINE.mid,
            paddingHorizontal: SP.lg,
            paddingTop: SP.md,
          }}
        >
          {/*
            이름 오른쪽에 `오늘 대화를 다 했습니다` 를 적었었다. 걷은 까닭:
            여기는 **그 사람의 말을 읽는 자리**인데, 그 옆에 남은 횟수를
            적으면 대사와 살림살이가 한 줄에 선다. 남은 횟수는 들어오기
            전에 이미 적혀 있다 (`BondScreen` 의 단추).
          */}
          <T size={FS.title} bold>{d.name}</T>
          <View
            style={{
              height: 1,
              backgroundColor: LINE.low,
              marginTop: SP.xs,
              marginBottom: SP.sm,
            }}
          />
          <T size={FS.body} style={{ lineHeight: 22 }}>{line}</T>

          {/* 다음으로 넘어가는 표시 — 누를 곳이 화면 전체라 안 누르는 사람이 없게 */}
          <T
            size={9}
            dim="dim"
            style={{ position: 'absolute', right: SP.lg, bottom: SP.md }}
          >
            {waiting ? '눌러서 대답하기' : '눌러서 닫기'}
          </T>
        </View>

        {/* 위 오른쪽 나가는 문 — 대사를 안 읽고도 나갈 수 있어야 한다 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대화 닫기"
          onPress={() => { sfx('tap'); onClose(); }}
          style={({ pressed }) => [
            BORDER,
            {
              position: 'absolute',
              top: SP.xl,
              right: SP.md,
              paddingVertical: SP.xs,
              paddingHorizontal: SP.sm,
              backgroundColor: pressed ? SURF.up : 'rgba(0,0,0,0.6)',
            },
          ]}
        >
          <T size={FS.tiny}>닫기</T>
        </Pressable>

        {/*
          ── 선택지 ── **화면 한가운데** (머리말).

          대사창 위에 얹히지 않고 가운데 뜨므로, 무엇에 답하는 것인지가
          아래에 그대로 보인다.
        */}
        {asking && !!talk && (
          <View
            style={{
              /* 여기도 잰 크기다 — 배경과 같은 까닭 (위 `win`) */
              position: 'absolute',
              top: 0,
              left: 0,
              width: win.width,
              height: win.height,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingHorizontal: SP.lg,
            }}
          >
            <View
              style={[
                BORDER,
                {
                  width: '100%',
                  maxWidth: 420,
                  padding: SP.md,
                  backgroundColor: C.bg,
                  borderColor: WHITE,
                  borderRadius: R.md,
                  gap: SP.xs,
                },
              ]}
            >
              <T size={9} dim="dim" style={{ marginBottom: 2 }}>
                무엇이라고 답할까요
              </T>
              {talk.choices.map((ch, i) => (
                <Pressable
                  key={ch.text}
                  onPress={() => {
                    sfx('tap');
                    const r = talkBond(who, pick * talk.choices.length + i);
                    setAsking(false);
                    if (r === 'no') {
                      toast('오늘은 더 말을 걸 수 없습니다', 'plain');
                      onClose();
                      return;
                    }
                    if (r.up > 0) toast(`${d.name}와 더 가까워졌습니다`, 'good');
                    setSaid({ reply: ch.reply, exp: ch.exp });
                  }}
                  style={({ pressed }) => [
                    BORDER,
                    {
                      padding: SP.sm,
                      backgroundColor: pressed ? SURF.up : 'transparent',
                    },
                  ]}
                >
                  <T size={FS.body}>{ch.text}</T>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/*
          ── 고른 뒤의 값 ── 대사창 **위**에 작게 뜬다.

          창으로 띄우면 대답을 읽기 전에 숫자부터 보게 된다. 여기 두면
          그 사람의 말이 먼저고 값이 그 옆에 붙는다.
        */}
        {!!said && (
          <View
            style={[
              BORDER,
              {
                position: 'absolute',
                right: SP.md,
                bottom: BOX_H + SP.xs,
                paddingVertical: SP.xs,
                paddingHorizontal: SP.sm,
                backgroundColor: C.bg,
              },
            ]}
          >
            <T size={FS.body} bold>
              {said.exp >= 0 ? `애정 +${said.exp}` : `애정 ${said.exp}`}
            </T>
          </View>
        )}
      </View>
    </Modal>
  );
}
