/**
 * ── 대형 고르기 ── 세 칸.
 *
 * `3-1` · `2-2` · `1-3` (뒷줄-앞줄). 고르는 것으로 정하는 것은 **몇 명이 맞을
 * 자리에 서나**다 — 앞줄이 통째로 70% 를 진다 (`core/party` 의 `FRONT_SHARE`).
 *
 * ## 왜 파티 칸 바로 위인가
 *
 * 대형은 "누가 서나"(파티 칸)와 같은 종류의 결정이다. 무대 위에 두면 전투
 * 조작으로 읽히는데, 이건 전투 중에 누르는 단추가 아니라 **판에 들어가기
 * 전에 정하는 것**이다 (물론 중간에 바꿔도 된다).
 *
 * ## 그림 없이 점으로 그린다
 *
 * 칸마다 다섯 점 두 줄을 그린다 — 찬 점이 사람이 서는 칸이다. 이름
 * (`3-1`)만으로는 어느 쪽이 앞인지 매번 헷갈리는데, 점 두 줄이면 **아래가
 * 앞**이라는 것이 그림으로 보인다 (무대에서도 아래가 앞이다).
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { FORMATIONS, FORMATION_IDS, FORM_COLS, FRONT_SHARE } from '@/core/party';
import { Row, T } from '@/ui/atoms';
import { sfx } from '@/ui/sfx';
import { BORDER, C, SP, WHITE } from '@/ui/theme';

/** 점 하나 — 찬 것과 빈 것 */
function Dot({ on, inv }: { on: boolean; inv: boolean }) {
  return (
    <View
      style={{
        width: 4,
        height: 4,
        borderWidth: 1,
        borderColor: inv ? C.fgInv : WHITE,
        backgroundColor: on ? (inv ? C.fgInv : WHITE) : 'transparent',
        opacity: on ? 1 : 0.35,
      }}
    />
  );
}

function Rows({ back, front, inv }: {
  back: readonly number[]; front: readonly number[]; inv: boolean;
}) {
  const row = (cols: readonly number[]) => (
    <Row gap={2}>
      {Array.from({ length: FORM_COLS }, (_v, i) => (
        <Dot key={i} on={cols.includes(i)} inv={inv} />
      ))}
    </Row>
  );
  return (
    <View style={{ gap: 3, alignItems: 'center' }}>
      {/* 위가 뒷줄, 아래가 앞줄 — 무대와 같은 방향이다 */}
      {row(back)}
      {row(front)}
    </View>
  );
}

export function FormationPicker() {
  const form = useGame((s) => s.formation);
  const setFormation = useGame((s) => s.setFormation);

  return (
    <View style={{ gap: SP.xs }}>
      <Row between>
        <T size={12} bold>대형</T>
        {/*
          지금 고른 대형이 실제로 무엇을 뜻하는지 한 줄. 이름(`2-2`)은 모양을
          말하지 실제 확률을 말하지 않는다.
        */}
        <T size={9} dim="sub">
          {`앞줄이 ${Math.round(FRONT_SHARE * 100)}% 를 받는다 — ${FORMATIONS[form].text}`}
        </T>
      </Row>

      <Row gap={SP.xs}>
        {FORMATION_IDS.map((id) => {
          const def = FORMATIONS[id];
          const on = id === form;
          return (
            <Pressable
              key={id}
              onPress={() => { sfx('tap'); setFormation(id); }}
              style={({ pressed }) => [
                BORDER,
                {
                  flex: 1,
                  paddingVertical: SP.xs,
                  alignItems: 'center',
                  gap: 3,
                  borderWidth: on ? 2 : 1,
                  backgroundColor: on ? C.bgInv : (pressed ? '#FFFFFF33' : 'transparent'),
                },
              ]}
            >
              <T size={11} bold style={on ? { color: C.fgInv } : undefined}>{id}</T>
              <Rows back={def.backCols} front={def.frontCols} inv={on} />
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
}
