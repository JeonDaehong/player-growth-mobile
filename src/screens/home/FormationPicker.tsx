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
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  FORMATIONS, FORMATION_IDS, FORM_LANES, PARTY_SIZE, formationSeats,
} from '@/core/party';
import type { FormationId } from '@/core/party';
import { ROW_MOD } from '@/core/chars';
import { Btn, Row, Sep, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { sfx } from '@/ui/sfx';
import { BORDER, BORDER_HI, C, FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';

/**
 * 자리 한 칸의 크기 (px).
 *
 * 9 였다. 테두리 1px 을 빼면 7px 이 남는데 거기 8px 글자를 넣으니 숫자가
 * 상자에 끼여 눌렸다 — 넷을 견주는 그림에서 번호가 안 읽히면 이 그림이
 * 하려던 일이 통째로 안 된다.
 */
const SEAT = 11;

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
 * ## 안 쓰는 자리는 **아무것도 안 그린다**
 *
 * 여기 아주 흐린 점이 있었다. 자리를 지키려던 것인데, 열 칸 중 여섯이
 * 빈자리라 그림의 대부분이 **아무 뜻도 없는 점**이었다 — 정작 봐야 하는
 * 번호 넷보다 점이 더 많았다.
 *
 * 자리는 점이 아니라 **빈 상자**가 지킨다. 크기가 같은 것을 그리지 않은
 * 채로 두면 셋을 나란히 견주는 것은 그대로 되고, 화면에는 실제로 사람이
 * 서는 넷만 남는다.
 *
 * 없어져서 아쉬운 것도 없다. 저 점이 말하던 "여기도 설 수 있는 자리다" 는
 * 세 대형을 나란히 놓은 것 자체가 이미 말하고 있다.
 */
function Seat({ n, front, inv }: { n: number; front: boolean; inv: boolean }) {
  const ink = inv ? C.fgInv : WHITE;
  /*
    빈 자리 — **자리만 지키고 아무것도 안 그린다.**

    지우면 (아예 안 그리면) 대형마다 그림의 폭과 높이가 달라져서 셋을
    나란히 못 견준다. 크기가 같은 빈 상자면 그 문제가 없다.
  */
  if (!n) return <View style={{ width: SEAT, height: SEAT }} />;
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
/** 이 대형이 **실제로 쓰는 가로줄들** — 위에서 아래로 (4 → 0) */
function usedLanes(form: FormationId): number[] {
  const on = new Set(formationSeats(form, PARTY_SIZE).map((sp) => sp.lane));
  return Array.from({ length: FORM_LANES }, (_v, i) => FORM_LANES - 1 - i)
    .filter((ln) => on.has(ln));
}

/**
 * 그림이 쓰는 줄 수 — **셋 중 제일 많은 것**에 맞춘다.
 *
 * 대형마다 쓰는 줄이 다르다 (`3-1`·`1-3` 은 셋, `2-2` 는 둘). 있는 만큼만
 * 그리면 세 칸의 높이가 서로 달라져서, 나란히 놓은 단추 셋이 들쭉날쭉해진다.
 * 제일 큰 것에 맞춰 두고 가운데로 모으면 셋이 같은 높이다.
 */
const GRID_ROWS = Math.max(...FORMATION_IDS.map((id) => usedLanes(id).length));
const GRID_H = GRID_ROWS * SEAT + (GRID_ROWS - 1) * 2;

/**
 * 대형 미리보기 — **빈 줄은 안 그린다.**
 *
 * 무대에는 다섯 가로줄이 있고 대형은 그중 몇 줄만 쓴다 (`FORM_LANES`).
 * 여태 다섯 줄을 다 그리고 안 쓰는 줄은 빈 칸으로 뒀는데, 그러면 번호와
 * 번호 사이가 한 칸씩 벌어져서 **셋이 흩어져 서 있는 것**으로 보였다.
 *
 * 무대에서 실제로 벌어져 서는 것은 맞다. 그런데 이 그림이 하는 말은 "누가
 * 앞이고 누가 뒤인가" 이지 **얼마나 떨어져 서는가**가 아니다 — 간격까지
 * 그리려다 정작 앞뒤가 안 읽혔다.

 * 쓰는 줄만 붙여 그린다. 위아래 차례는 그대로라 (뒤에 선 사람이 위에)
 * 무대와 겹쳐 읽히는 것은 안 깨진다.
 */
function Grid({ form, inv }: { form: FormationId; inv: boolean }) {
  const lanes = React.useMemo(() => usedLanes(form), [form]);
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
      {/* 높이를 못 박고 가운데로 모은다 — 세 칸이 같은 키여야 한다 */}
      <View style={{ height: GRID_H, gap: 2, justifyContent: 'center' }}>
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
          height: GRID_H,
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
  const setFormation = useGame((s) => s.setFormation);
  /** 규칙을 펴 놓았나 (`FormationHelp`) */
  const [help, setHelp] = useState(false);

  return (
    <View style={{ gap: SP.xs }}>
      <Row between>
        <Row gap={SP.xs}>
          <T size={FS.title} bold>대형</T>
          {/*
            ── 규칙은 **물어봐야 나온다** ──

            앞줄이 뭘 받고 뒷줄이 뭘 받는지, 어느 자리가 얼마나 맞는지를
            아래에 늘 적어 두었다. 다 맞는 말인데 네 줄이라 대형 칸 셋보다
            길었고, **한 번 읽으면 다시 안 읽는 종류**다.

            물음표 하나로 접는다. 처음 고를 때 한 번 열어 보면 되고, 그
            뒤로는 칸 셋만 남는다.
          */}
          <Pressable
            hitSlop={8}
            onPress={() => { sfx('tap'); setHelp(true); }}
            style={({ pressed }) => ({
              width: 16,
              height: 16,
              borderRadius: R.round,
              borderWidth: 1,
              borderColor: LINE.mid,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <T size={9} bold dim="sub">?</T>
          </Pressable>
        </Row>
        {/*
          여기 `앞 하나 40% · 뒤 셋 20% 씩` 이 있었다 (`FormationDef.text`).
          고른 대형 것만 한 줄 뜨는데, 저건 **셋을 나란히 놓아야 견줄 수 있는
          값**이라 하나씩 보여 주면 세 번 눌러 가며 외워야 했다. 물음표 안에
          셋을 같이 적으면서 여기서는 걷었다 (`FormationHelp`).
        */}
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
              {/*
                ── 이름이 위, 번호가 아래 ──

                여태 `3-1` 하나만 적었다. 저건 앞뒤 인원을 말하는 것이라
                정확하지만, 고르는 사람이 알고 싶은 것은 인원이 아니라
                **그래서 무엇이 되나** 다 (`core/party` 의 `FormationDef.name`).

                번호도 지우지 않는다. 아래 그림이 그 배치를 그리고 있으므로,
                번호가 그림과 이름 사이를 잇는다.
              */}
              <T size={FS.label} bold dim={on ? 'full' : 'sub'}>
                {FORMATIONS[id].name}
              </T>
              <T size={9} dim="dim">{id}</T>
              <Grid form={id} inv={false} />
            </Pressable>
          );
        })}
      </Row>

      {/*
        ── 여기 설명 네 줄이 있었다 ──

        번호가 곧 파티 자리라는 것, 앞줄이 받는 것, 뒷줄이 받는 것. 다 맞는
        말인데 **한 번 읽으면 다시 안 읽는 종류**라, 대형 칸 셋보다 긴 글이
        늘 밑에 붙어 있었다. 위 물음표로 옮겼다 (`FormationHelp`).

        지금 판과 다르다는 줄도 걷었다. 언제 들어가는지는 **나갈 때 묻는
        창**이 말한다 (`ApplyPopup`) — 거기서 적용을 누르면 그 자리에서 판이
        다시 서므로, 여기서 미리 알려 줄 것이 없어졌다. 남겨 두면 두 곳이
        같은 말을 하는데 한쪽은 이미 틀린 말이다.
      */}

      <FormationHelp visible={help} onClose={() => setHelp(false)} />
    </View>
  );
}

/**
 * ── 대형 규칙 ── 물음표를 누르면 열린다.
 *
 * 세 가지를 한자리에 적는다.
 *
 *   **번호가 곧 파티 자리다** — 이걸 모르면 대형을 골라도 누구를 앞에
 *   세울지는 여전히 못 정하는 것으로 보인다. 바꾸는 방법(자리끼리 맞바꾸기)
 *   까지 같이 적어야 이어진다
 *
 *   **줄이 몸을 바꾼다** — 확률만 알면 대형 고르기가 "누가 덜 맞나" 하나가
 *   된다. 앞에 서면 실제로 더 단단해지므로 (`core/chars` 의 `ROW_MOD`)
 *   그게 있어야 맷집과 화력 중 무엇을 살까가 된다
 *
 *   **대형마다 맞는 확률** — 여태 고른 대형 것만 한 줄 떴다
 *   (`FormationDef.text`). 셋을 나란히 놓아야 견줄 수 있는 값인데 하나씩
 *   보여 주면 세 번 눌러 가며 외워야 했다.
 *
 * 숫자는 표에서 그대로 읽는다 (`FORMATIONS` · `ROW_MOD`) — 여기 손으로
 * 적어 두면 값을 고칠 때 이 창만 옛말이 된다.
 */
function FormationHelp({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Popup visible={visible} title="대형" onClose={onClose}>
      <T size={11} dim="sub">
        칸 안의 번호가 파티 자리입니다 — 자리를 눌러 서로 바꾸면 서는 곳도
        같이 바뀝니다.
      </T>

      <Sep />

      <T size={11} bold style={{ marginBottom: SP.xs }}>줄이 몸을 바꾼다</T>
      <Row gap={SP.xs} style={{ alignItems: 'center', marginBottom: 3 }}>
        <View style={{ width: 5, height: 5, borderRadius: R.round, backgroundColor: WHITE }} />
        <T size={11} dim="sub">
          {`앞줄 — 방어 · 마법저항 ×${ROW_MOD.front.def}, 최대 체력 ×${ROW_MOD.front.hp}`}
        </T>
      </Row>
      <Row gap={SP.xs} style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 5, height: 5, borderRadius: R.round,
            borderWidth: 1, borderColor: LINE.hi,
          }}
        />
        <T size={11} dim="sub">{`뒷줄 — 공격력 ×${ROW_MOD.back.atk}`}</T>
      </Row>

      <Sep />

      {/*
        ── 대형마다 **한 사람이** 맞을 확률 ──

        합이 아니라 한 사람 몫이다 (`FormationDef.frontAim`·`backAim`).
        앞에 많이 설수록 한 사람이 덜 맞는데, 그게 곧 앞줄을 늘리는 값이다.
      */}
      <T size={11} bold style={{ marginBottom: SP.xs }}>맞을 확률 (한 사람당)</T>
      {FORMATION_IDS.map((id) => {
        const d = FORMATIONS[id];
        return (
          <Row key={id} between style={{ paddingVertical: 2 }}>
            <T size={11} bold>{`${d.name} (${id})`}</T>
            <T size={10} dim="sub">
              {`앞 ${d.front}명 ${Math.round(d.frontAim * 100)}% · `
                + `뒤 ${PARTY_SIZE - d.front}명 ${Math.round(d.backAim * 100)}%`}
            </T>
          </Row>
        );
      })}
      <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
        합이 아니라 한 사람 몫입니다. 쓰러진 사람 몫은 남은 사람들이 원래
        비율대로 나눠 갖습니다.
      </T>

      <Btn label="확인" fill style={{ marginTop: SP.md }} onPress={onClose} />
    </Popup>
  );
}
