/**
 * 서 있는 사람 하나.
 *
 * 엘프의 집에서 만든 구조를 대장간·선술집이 같이 쓴다 — 패널에 작게 서 있고,
 * 누르면 크게 나오고, 말을 걸거나 물어볼 수 있다. 세 번째로 같은 걸 손으로
 * 베껴 쓰는 대신 여기 하나로 모았다.
 *
 * ## 왜 컴포넌트로 뽑았나
 *
 * 같은 화면 구조를 세 벌 적어 두면 한 곳을 고칠 때 나머지 둘이 남는다. 실제로
 * 엘프에서 "Modal 두 개를 동시에 띄우면 안 된다" 를 고쳤는데, 그걸 베껴 간
 * 화면이 있었다면 거기는 그대로 남았을 것이다.
 *
 * NPC 마다 다른 것은 **대사와 그림뿐**이고, 그건 전부 인자로 받는다.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NpcTopic } from '@/core/npc';
import { nextIndex } from '@/core/npc';
import type { Sprite as AsciiSprite } from './sprites';
import { Btn, ListItem, Panel, Row, Sep, T } from './atoms';
import { Popup } from './Popup';
import { Sprite } from './Sprite';
import { BORDER, SP } from './theme';

export interface NpcPanelProps {
  /** 패널 제목 — "숲의 주인" 처럼 그 사람의 자리 */
  title: string;
  /** 이름 */
  name: string;
  /** 패널에 적는 한 줄 묘사 */
  intro: string;
  /** 스프라이트 세트 이름 (`assets/sprites/<set>`) */
  set: string;
  /** 아트가 아직 없을 때 대신 그릴 코드 스프라이트 */
  fallback: AsciiSprite;
  /** 잡담 */
  lines: readonly string[];
  /** 물어보기 */
  topics: readonly NpcTopic[];
  /** 대화 창 아래에 덧붙일 것 (선술집의 팁 주기 같은 것) */
  extra?: (close: () => void) => React.ReactNode;
  /** 대화 창 옆에 세울 버튼 (엘프의 "룬이란?" 같은 것) */
  action?: { label: string; onPress: () => void };
  /** 이 값이 true 면 대화 창을 내린다 — Modal 을 겹쳐 띄우지 않기 위해 */
  hidden?: boolean;
  /**
   * 이스터에그 — 말을 연달아 걸었을 때 끼어드는 것.
   *
   * `streak` 은 이번이 몇 번째 말 걸기인가(1부터). 끼어들 차례가 아니면 null 을
   * 돌려주면 되고, 그러면 평소 대사가 나온다. 그림도 바꿔 끼울 수 있다.
   */
  secret?: (streak: number) => { text: string; art?: string } | null;
}

export function NpcPanel({
  title, name, intro, set, fallback, lines, topics, extra, action, hidden, secret,
}: NpcPanelProps) {
  const [big, setBig] = useState(false);
  /** 지금 하고 있는 잡담. -1 이면 아직 말을 안 걸었다 */
  const [line, setLine] = useState(-1);
  /** 물어본 것의 답. 잡담과 같은 자리에 뜨므로 둘 중 하나만 살아 있다 */
  const [answer, setAnswer] = useState<string | null>(null);
  /**
   * 연달아 말을 건 횟수.
   *
   * 창을 닫아도 안 지운다 — 들락거리며 말을 거는 것도 "계속 말을 건 것" 이다.
   * 물어보기를 끼워도 안 지운다 (대화의 흐름은 이어진다).
   */
  const [streak, setStreak] = useState(0);
  /** 지금 이스터에그를 보여 주는 중인가 — 그림이 달라진다 */
  const [egg, setEgg] = useState<{ text: string; art?: string } | null>(null);

  const talk = () => {
    setAnswer(null);
    const n = streak + 1;
    setStreak(n);
    const hit = secret?.(n) ?? null;
    if (hit) { setEgg(hit); setLine(-1); return; }
    setEgg(null);
    setLine((prev) => nextIndex(prev, Math.random(), lines.length));
  };
  const reset = () => { setLine(-1); setAnswer(null); setEgg(null); };
  const close = () => { setBig(false); reset(); };

  return (
    <>
      <Panel title={title}>
        <Pressable
          onPress={() => setBig(true)}
          style={({ pressed }) => [
            { flexDirection: 'row', alignItems: 'center', gap: SP.md },
            pressed ? { opacity: 0.7 } : null,
          ]}
        >
          <View style={[BORDER, { padding: SP.xs, borderWidth: 2 }]}>
            <Sprite set={set} name="stand" size={64} fallback={fallback} />
          </View>
          <View style={{ flex: 1 }}>
            <T size={14} bold>{name}</T>
            <T size={11} dim="sub">{intro}</T>
            <T size={10} dim="dim" style={{ marginTop: 3 }}>눌러서 말을 건다</T>
          </View>
        </Pressable>
      </Panel>

      {/*
        ⚠ `hidden` 이면 이 창을 내린다.

        Modal 두 개를 동시에 띄우면 네이티브에서 골치가 아프다. 부르는 쪽이
        다른 팝업을 열 때 이 값을 켜 주면, 상태(`big`)는 그대로 남아 있다가
        그 팝업이 닫히면 하던 대화가 그대로 돌아온다.
      */}
      <Popup visible={big && !hidden} title={name} onClose={close}>
        <View style={[BORDER, { alignItems: 'center', paddingVertical: SP.md, borderWidth: 2 }]}>
          {/* 이스터에그는 그림도 바꿔 끼운다 — 없으면 평소 초상으로 떨어진다 */}
          <Sprite
            set={set}
            name={egg?.art ?? 'portrait'}
            size={150}
            fallback={fallback}
            fallbackSet={set}
            fallbackName="portrait"
          />
        </View>

        {/*
          말풍선 자리는 말을 걸기 전에도 비워 둔다 — 나중에 칸이 생기면
          팝업 높이가 튀어서 버튼이 손가락 아래에서 움직인다.
        */}
        <View style={[BORDER, {
          padding: SP.sm, marginTop: SP.sm, minHeight: 70, justifyContent: 'center',
        }]}>
          {egg !== null ? (
            <T size={13} style={{ lineHeight: 20 }}>{egg.text}</T>
          ) : answer !== null ? (
            <T size={12} style={{ lineHeight: 19 }}>{answer}</T>
          ) : line < 0 ? (
            <T size={11} dim="dim" center>…</T>
          ) : (
            <T size={13} style={{ lineHeight: 20 }}>{lines[line]}</T>
          )}
        </View>

        <Row gap={SP.sm} style={{ marginTop: SP.md }}>
          <Btn label="대화하기" size="lg" fill style={{ flex: 1 }} onPress={talk} />
          {!!action && (
            <Btn label={action.label} size="lg" style={{ flex: 1 }} onPress={action.onPress} />
          )}
        </Row>

        {extra?.(close)}

        <Sep />
        <T size={10} bold dim="sub" style={{ marginBottom: SP.xs }}>물어보기</T>
        {topics.map((t) => (
          <ListItem
            key={t.id}
            title={t.q}
            sound="click"
            onPress={() => { setLine(-1); setEgg(null); setAnswer(t.a); }}
          />
        ))}
      </Popup>
    </>
  );
}
