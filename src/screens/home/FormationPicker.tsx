/**
 * ── 대형 고르기 ── 세 칸.
 *
 * `3-1` · `2-2` · `1-3` (뒷줄-앞줄). 고르는 것으로 정하는 것이 둘이다.
 *
 *   **누가 얼마나 맞나** — 앞에 많이 설수록 한 사람 몫이 준다 (40 → 35 → 30)
 *   **몸이 어떻게 바뀌나** — 앞줄은 방어 1.5배 · 체력 1.1배, 뒷줄은 공격 1.15배
 *
 * 그래서 대형은 "누구를 제물로 세울까" 가 아니라 **맷집과 화력 중 무엇을
 * 살까**가 된다 (`core/party` 의 `FORMATIONS` · `ROW_MOD`).
 *
 * ## 왜 파티 칸 바로 위인가
 *
 * 대형은 "누가 서나"(파티 칸)와 같은 종류의 결정이다. 무대 위에 두면 전투
 * 조작으로 읽히는데, 이건 전투 중에 누르는 단추가 아니라 **판에 들어가기
 * 전에 정하는 것**이다 (물론 중간에 바꿔도 된다).
 *
 * ## 그림 없이 점으로 그린다
 *
 * 무대와 **같은 방향**으로 그린다. 두 세로줄(왼쪽이 뒤 · 오른쪽이 앞)에
 * 다섯 가로줄이고, 오른쪽 끝에 적을 뜻하는 점 하나를 세운다 — 그 점이
 * 있어야 "오른쪽이 앞" 이 설명 없이 읽힌다.
 *
 * 한 번 위아래로 그렸다가 고쳤다. 그때는 위가 뒤 · 아래가 앞이었는데,
 * 화면에서 앞뒤는 **적을 바라본 좌우**다 (`core/party`). 그림과 무대가
 * 다른 방향을 가리키면 둘 중 하나는 반드시 틀리게 읽힌다.
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { FORMATIONS, FORMATION_IDS, FORM_LANES } from '@/core/party';
import { Row, T } from '@/ui/atoms';
import { sfx } from '@/ui/sfx';
import { BORDER, BORDER_HI, C, FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';

/**
 * 점 하나.
 *
 * **앞줄은 속이 찼고 뒷줄은 비었다.** 자리만으로 앞뒤를 말하면 (왼쪽이 뒤,
 * 오른쪽이 앞) 4px 짜리 점 열 개에서 그 좌우를 세어야 하는데, 아래 한 줄로
 * 적어 둔 설명(`앞줄 …` · `뒷줄 …`)과 모양을 맞춰 두면 세지 않아도 읽힌다.
 *
 * 안 쓰는 자리는 아주 흐린 점으로 남긴다. 지우면 대형마다 그림의 높이가
 * 달라져서 셋을 나란히 못 견준다.
 */
function Dot({ on, front, inv }: { on: boolean; front?: boolean; inv: boolean }) {
  const ink = inv ? C.fgInv : WHITE;
  return (
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: R.round,
        borderWidth: 1,
        borderColor: ink,
        backgroundColor: on && front ? ink : 'transparent',
        opacity: on ? 1 : 0.16,
      }}
    />
  );
}

/**
 * 대형 미리보기 — 가로가 앞뒤, 세로가 다섯 줄.
 *
 * 위에서 아래로 4→0 번 줄이다. 무대에서 뒤에 선 사람이 위에 그려지므로
 * (`Ground` 의 `depthAt`) 같은 순서로 놓아야 그림과 무대가 겹쳐 읽힌다.
 */
function Grid({ back, front, inv }: {
  back: readonly number[]; front: readonly number[]; inv: boolean;
}) {
  const lanes = Array.from({ length: FORM_LANES }, (_v, i) => FORM_LANES - 1 - i);
  return (
    <Row gap={5} style={{ alignItems: 'center' }}>
      <View style={{ gap: 3 }}>
        {lanes.map((ln) => (
          <Row key={ln} gap={4}>
            <Dot on={back.includes(ln)} inv={inv} />
            <Dot on={front.includes(ln)} front inv={inv} />
          </Row>
        ))}
      </View>
      {/*
        적 — 늘 오른쪽 가운데다. 세로 막대 하나로 두는 이유는 파티 점과
        같은 모양이면 안 되기 때문이다. 이게 사람인지 벽인지가 아니라,
        **어느 쪽이 적인가**만 말하면 된다.
      */}
      <View
        style={{
          width: 2,
          height: FORM_LANES * 5 + (FORM_LANES - 1) * 3,
          borderRadius: R.round,
          backgroundColor: inv ? C.fgInv : WHITE,
          opacity: O.dim,
        }}
      />
    </Row>
  );
}

export function FormationPicker() {
  const form = useGame((s) => s.formation);
  const setFormation = useGame((s) => s.setFormation);

  return (
    <View style={{ gap: SP.xs }}>
      <Row between>
        <T size={FS.title} bold>대형</T>
        {/*
          지금 고른 대형이 실제로 무엇을 뜻하는지 한 줄. 이름(`2-2`)은 모양을
          말하지 확률을 말하지 않는다 (`FormationDef.text`).
        */}
        <T size={FS.tiny} dim="sub">{FORMATIONS[form].text}</T>
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
                /*
                  고른 칸은 **반전이 아니라 밝은 테두리**다.

                  흰 바탕으로 뒤집으면 그 한 칸이 화면에서 제일 밝은 덩어리가
                  되어, 정작 위에서 벌어지는 싸움보다 눈에 먼저 들어온다.
                  테두리만 밝히면 "골랐다" 는 그대로 읽히면서 화면의 무게는
                  안 옮겨진다.
                */
                on ? BORDER_HI : BORDER,
                {
                  flex: 1,
                  paddingVertical: SP.sm - 2,
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: on || pressed ? SURF.up : 'transparent',
                },
              ]}
            >
              <T size={FS.label} bold dim={on ? 'full' : 'sub'}>{id}</T>
              <Grid back={def.backLanes} front={def.frontLanes} inv={false} />
            </Pressable>
          );
        })}
      </Row>

      {/*
        ── 줄이 몸을 바꾼다 ──

        확률만 적어 두면 대형을 고르는 일이 "누가 덜 맞나" 하나로 보인다.
        실제로는 서는 자리가 스탯도 바꾸므로 (`core/party` 의 `ROW_MOD`)
        그 한 줄이 같이 있어야 고를 수 있다.

        세 칸 아래 한 줄로 둔다 — 칸마다 적으면 세 번 같은 말이 되고, 이건
        대형에 따라 안 바뀌는 규칙이다.
      */}
      <Row gap={SP.xs}>
        <View style={{ flex: 1, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <View style={{ width: 3, height: 3, borderRadius: R.round, backgroundColor: WHITE }} />
          <T size={FS.tiny} dim="dim">앞줄 방어 · 마저 x1.5, 체력 x1.1</T>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <View
            style={{
              width: 3, height: 3, borderRadius: R.round,
              borderWidth: 1, borderColor: LINE.hi,
            }}
          />
          <T size={FS.tiny} dim="dim">뒷줄 공격 x1.15</T>
        </View>
      </Row>
    </View>
  );
}
