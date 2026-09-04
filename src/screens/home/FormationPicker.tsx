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
import { BORDER, C, O, SP, WHITE } from '@/ui/theme';

/** 점 하나 — 찬 것과 빈 것 */
function Dot({ on, inv }: { on: boolean; inv: boolean }) {
  const ink = inv ? C.fgInv : WHITE;
  return (
    <View
      style={{
        width: 4,
        height: 4,
        borderWidth: 1,
        borderColor: ink,
        backgroundColor: on ? ink : 'transparent',
        opacity: on ? 1 : 0.3,
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
            <Dot on={front.includes(ln)} inv={inv} />
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
          height: FORM_LANES * 4 + (FORM_LANES - 1) * 3,
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
        <T size={12} bold>대형</T>
        {/*
          지금 고른 대형이 실제로 무엇을 뜻하는지 한 줄. 이름(`2-2`)은 모양을
          말하지 확률을 말하지 않는다 (`FormationDef.text`).
        */}
        <T size={9} dim="sub">{FORMATIONS[form].text}</T>
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
              <Grid back={def.backLanes} front={def.frontLanes} inv={on} />
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
}
