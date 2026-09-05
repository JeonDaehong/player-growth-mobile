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
import {
  FORMATIONS, FORMATION_IDS, FORM_LANES, PARTY_SIZE, formationSeats,
} from '@/core/party';
import type { FormationId } from '@/core/party';
import { Row, T } from '@/ui/atoms';
import { sfx } from '@/ui/sfx';
import { BORDER, BORDER_HI, C, FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';

/**
 * 자리 하나 — **파티 칸 번호를 그 안에 적는다.**
 *
 * ## 왜 번호를 적나
 *
 * 오랫동안 속이 찬 점과 빈 점이었다. 그것으로 말할 수 있는 것은 "앞줄이
 * 몇, 뒷줄이 몇" 까지였고, **누가 거기 서는지**는 화면 어디에도 없었다 —
 * 역할 순서로 저절로 잡히던 시절에는 그게 맞았다 (`core/party` 의
 * `formationSpots` 머리말).
 *
 * 이제 파티 칸 순서가 그대로 자리다. 그러면 이 그림이 **누르기 전에**
 * 답해야 하는 물음이 하나 생긴다: 내 3번 칸 캐릭터는 이 대형에서 어디에
 * 서는가. 번호를 적는 것 말고 그 물음에 답하는 방법이 없다.
 *
 * ## 안 쓰는 자리는 점으로 남긴다
 *
 * 지우면 대형마다 그림의 높이가 달라져서 셋을 나란히 못 견준다. 아주 흐리게
 * 두면 자리는 지키면서 번호가 적힌 칸만 눈에 들어온다.
 */
/**
 * 자리 한 칸의 크기 (px).
 *
 * 9 였다. 테두리 1px 을 빼면 7px 이 남는데 거기 8px 글자를 넣으니 숫자가
 * 상자에 끼여 눌렸다 — 넷을 견주는 그림에서 번호가 안 읽히면 이 그림이
 * 하려던 일이 통째로 안 된다.
 */
const SEAT = 11;

function Seat({ n, front, inv }: { n: number; front: boolean; inv: boolean }) {
  const ink = inv ? C.fgInv : WHITE;
  /* 빈 자리 — 예전의 그 점 그대로다 */
  if (!n) {
    return (
      <View
        style={{
          width: SEAT,
          height: SEAT,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: R.round,
            borderWidth: 1,
            borderColor: ink,
            opacity: 0.16,
          }}
        />
      </View>
    );
  }
  return (
    <View
      style={{
        width: SEAT,
        height: SEAT,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        /*
          **앞줄은 속이 차고 뒷줄은 테두리만.**

          번호를 적어도 이 구분은 남긴다. 왼쪽이 뒤 · 오른쪽이 앞이라는 것은
          가로 자리로만 말하는데, 9px 짜리 칸 여덟 개에서 그 좌우를 세어야
          읽히는 것은 아래 설명 줄(`앞줄 …` · `뒷줄 …`)과 안 이어진다.
        */
        borderWidth: 1,
        borderColor: ink,
        backgroundColor: front ? ink : 'transparent',
      }}
    >
      <T
        size={8}
        bold
        /* 찬 칸 위에서는 글자가 바탕색이어야 읽힌다 */
        style={{ color: front ? (inv ? WHITE : C.bg) : ink, lineHeight: 9 }}
      >
        {String(n)}
      </T>
    </View>
  );
}

/**
 * 대형 미리보기 — 가로가 앞뒤, 세로가 다섯 줄.
 *
 * 위에서 아래로 4→0 번 줄이다. 무대에서 뒤에 선 사람이 위에 그려지므로
 * (`Ground` 의 `depthAt`) 같은 순서로 놓아야 그림과 무대가 겹쳐 읽힌다.
 *
 * **자리는 `core/party` 가 계산해 준다** (`formationSeats`). 여기서 규칙을
 * 다시 쓰면 화면의 번호와 무대의 자리가 조용히 갈릴 수 있다 — 사람이 그
 * 번호를 보고 파티를 짜게 된 뒤로는 제일 나쁜 종류의 어긋남이다.
 */
function Grid({ form, inv }: { form: FormationId; inv: boolean }) {
  const lanes = Array.from({ length: FORM_LANES }, (_v, i) => FORM_LANES - 1 - i);
  /* 자리 → 파티 칸 번호 (1부터). 늘 넷을 다 앉힌다 */
  const at = React.useMemo(() => {
    const out: Record<string, number> = {};
    formationSeats(form, PARTY_SIZE).forEach((sp, i) => {
      out[`${sp.row}:${sp.lane}`] = i + 1;
    });
    return out;
  }, [form]);

  return (
    <Row gap={5} style={{ alignItems: 'center' }}>
      <View style={{ gap: 2 }}>
        {lanes.map((ln) => (
          <Row key={ln} gap={3}>
            <Seat n={at[`back:${ln}`] ?? 0} front={false} inv={inv} />
            <Seat n={at[`front:${ln}`] ?? 0} front inv={inv} />
          </Row>
        ))}
      </View>
      {/*
        적 — 늘 오른쪽 가운데다. 파티 칸과 같은 모양이면 안 되기 때문에
        세로 막대 하나로 둔다. 이게 사람인지 벽인지가 아니라, **어느 쪽이
        적인가**만 말하면 된다.
      */}
      <View
        style={{
          width: 2,
          height: FORM_LANES * SEAT + (FORM_LANES - 1) * 2,
          borderRadius: R.round,
          backgroundColor: inv ? C.fgInv : WHITE,
          opacity: O.dim,
        }}
      />
    </Row>
  );
}

export function FormationPicker() {
  /*
    ── 고른 것과 싸우는 것이 다를 수 있다 ──

    대형은 **다음 판부터** 들어간다 (`state/types` 의 `pendingFormation`).
    여기서는 짜 둔 쪽을 고른 것으로 그린다 — 들어간 쪽을 그리면 방금 누른
    것이 화면에서 튕겨 나가서 안 눌린 것으로 보인다.

    아래에 지금 싸우는 대형을 따로 한 줄 적는다. 둘이 다를 때만 뜬다.
  */
  const form = useGame((s) => s.pendingFormation ?? s.formation);
  const live = useGame((s) => s.formation);
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
              <Grid form={id} inv={false} />
            </Pressable>
          );
        })}
      </Row>

      {/*
        ── 번호가 곧 파티 칸이다 ──

        이 한 줄이 없으면 칸 안의 `1 2 3 4` 가 그냥 자리 번호로 읽힌다.
        그러면 대형을 골라도 **누구를 앞에 세울지**는 여전히 못 정하는 것으로
        보이는데, 지금은 정할 수 있다 (`core/party` 의 `formationSeats`).

        고르는 방법까지 같이 적는다. 파티 칸을 서로 맞바꾸는 것이 그 방법인데
        (`state/slices/roster` 의 `setPartySlot`), 그건 아래 칸에서 하는
        일이라 여기 적어 두지 않으면 이어지지 않는다.
      */}
      <T size={FS.tiny} dim="dim">
        칸 안의 번호가 아래 파티 자리입니다 — 자리를 눌러 서로 바꾸면
        서는 곳도 같이 바뀝니다
      </T>

      {/*
        ── 줄이 몸을 바꾼다 ──

        확률만 적어 두면 대형을 고르는 일이 "누가 덜 맞나" 하나로 보인다.
        실제로는 서는 자리가 스탯도 바꾸므로 (`core/party` 의 `ROW_MOD`)
        그 한 줄이 같이 있어야 고를 수 있다.

        세 칸 아래 한 줄로 둔다 — 칸마다 적으면 세 번 같은 말이 되고, 이건
        대형에 따라 안 바뀌는 규칙이다.
      */}
      {form !== live && (
        <T size={FS.tiny} dim="dim">
          {`지금 판은 ${live} 로 싸우는 중입니다 — 다음 판부터 ${form} 이 들어갑니다`}
        </T>
      )}

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
