/**
 * ── 영웅 ── 누가 서고 어떻게 서나.
 *
 * 아래 띠의 첫 칸이 여는 **화면**이다 (`HomeScreen` 의 `tab`).
 *
 * ## 창이 아니라 화면이다
 *
 * 검은 막 위에 뜨는 팝업이었다 (`Popup`). 그러면 뒤에서 무대가 계속 그려진다 —
 * 인물 넷이 휘두르고 이펙트가 돌고 숫자가 뜨는데, 그 위를 막으로 덮어 놓은
 * 셈이라 **안 보이는 것을 그리느라 계속 일한다.**
 *
 * 이제 무대를 아예 **내린다** (`HomeScreen` 이 탭에 따라 갈아 끼운다).
 * 전투는 그대로 돈다 — 계산은 스토어가 하고 (`battleTickOnce`) 그리기만
 * 없어지는 것이라, 여기서 편성을 짜는 동안에도 판은 흐르고 상자는 찬다.
 *
 * 돌아가면 무대가 다시 선다. 그때 인물이 새로 걸어 들어오지는 않는다 —
 * 판 열기 연출은 `openIn` 이 남아 있을 때만 도는 것이라 (`useStageStaging`),
 * 한창인 판으로 돌아가면 그냥 그 자리에 서 있다.
 *
 * ## 왜 홈에서 여기로 옮겼나
 *
 * 대형 고르기가 홈 화면 한가운데, 파티 칸 바로 위에 있었다. 그 자리는
 * **지금 벌어지는 일을 보는 자리**인데 대형은 보는 것이 아니라 정하는
 * 것이라, 볼 때마다 눈에 걸리고 정할 때는 무대 아래로 굴려 내려가야 했다.
 *
 * 편성은 편성끼리 모으는 것이 맞다 — 누가 서나(파티)와 어떻게 서나(대형)는
 * 같은 하나의 결정이다.
 *
 * ## 여기서 고른 것은 **다음 판부터** 들어간다
 *
 * 창을 닫는다고 바뀌지 않는다 (`state/types` 의 `pendingParty`). 지금 판이
 * 끝나야 들어가므로, 그때까지는 이 창이 **짜 둔 것**을 보여 준다.
 *
 * 그래서 화면에 두 가지가 같이 있어야 한다: 짜 둔 편성과, 그것이 아직 안
 * 들어갔다는 사실. 뒤엣것이 없으면 "바꿨는데 왜 그대로지" 가 된다.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, FREE_ENHANCE, capOf, maxStar } from '@/core/chars';
import { PARTY_SIZE } from '@/core/party';
import { Btn, Row, Stars, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { CharPopup } from './CharPopup';
import { FormationPicker } from './FormationPicker';
import { TopBar } from './TopBar';

/** 자리 하나 — 얼굴 · 이름 · 별 · 레벨 */
function Slot({ id, n, onPress }: {
  id: string | null; n: number; onPress: () => void;
}) {
  const chars = useGame((s) => s.chars);
  const c = id ? chars[id] : null;
  const d = c ? CHARS[c.id] : null;
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          flex: 1,
          paddingVertical: SP.sm,
          paddingHorizontal: 2,
          alignItems: 'center',
          gap: 2,
          opacity: pressed ? 0.6 : 1,
          /* 찬 칸은 한 단 올라오고 빈 칸은 파인다 — 파티 칸과 같은 규칙 */
          backgroundColor: c ? SURF.up : SURF.down,
          borderColor: c ? LINE.mid : LINE.low,
          borderStyle: c ? 'solid' : 'dashed',
        },
      ]}
    >
      {c && d ? (
        <>
          <Sprite set="avatar" name={d.art} size={34} />
          <T size={FS.tiny} bold center numberOfLines={1}>{d.name}</T>
          <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={9} />
          <T size={8} dim="dim">Lv {c.lv} / {capOf(c)}</T>
        </>
      ) : (
        <>
          <View
            style={{
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: R.round,
              borderWidth: 1,
              borderColor: LINE.mid,
            }}
          >
            <T size={15} dim="sub">+</T>
          </View>
          <T size={FS.tiny} dim="dim">{n}번</T>
        </>
      )}
    </Pressable>
  );
}

export function HeroScreen() {
  /*
    ── 짜 둔 것을 보여 준다 ──

    아직 안 들어갔어도 여기서는 그것이 지금의 편성이다. 들어간 것(`party`)을
    보여 주면 방금 바꾼 것이 화면에서 사라져서, 눌리기는 했는데 아무 일도
    안 일어난 것처럼 보인다.
  */
  const party = useGame((s) => s.pendingParty ?? s.party);
  const pendingParty = useGame((s) => s.pendingParty);
  const pendingForm = useGame((s) => s.pendingFormation);
  const clearPending = useGame((s) => s.clearPending);
  const applyPending = useGame((s) => s.applyPending);
  const stage = useGame((s) => s.battle.stage);
  /* ⚠ 테스트용 — 아래 성 맞추기 단추가 쓴다. 출시 전에 같이 지운다 */
  const chars = useGame((s) => s.chars);
  const setGrowth = useGame((s) => s.setGrowth);
  const toast = useGame((s) => s.toast);

  const [slot, setSlot] = useState<number | null>(null);
  /* 저장을 누르면 뜨는 확인 창 — 판이 다시 서는 것은 되돌릴 수 없다 */
  const [asking, setAsking] = useState(false);

  /* 짜 두었지만 아직 안 들어간 것이 있나 */
  const waiting = pendingParty !== null || pendingForm !== null;

  return (
    <>
      {/*
        화면 하나를 통째로 쓴다. 아래 띠는 밖에 있으므로 (`HomeScreen`)
        여기서는 굴러가는 몸통만 그린다.
      */}
      {/*
        ── 위 띠는 **여기에도 있다** ──

        무대 안에 얹혀 있던 것이라 (`BattleView` 의 `top`) 탭을 옮기면 같이
        사라졌다. 그런데 저 띠에 있는 것 — 지갑 · 프로필 · 설정 — 은 무대에
        딸린 것이 아니라 **어느 화면에서나 있어야 하는 것**이다. 영웅에서
        캐릭터를 키우는 동안 골드가 안 보이면, 얼마나 남았는지 보려고 메인에
        갔다 와야 한다.

        굴러가는 몸통 **밖**이다. 안에 넣으면 내리는 순간 지갑이 위로
        사라진다.

        위쪽 안전영역도 이 띠가 제 안에서 준다 (`TopBar` 의 `MIN_TOP`) —
        홈이 위 여백을 안 빼는 것과 같은 까닭이다 (`HomeScreen` 의 `edges`).
      */}
      {/*
        **문 여섯은 안 그린다** (`gates`). 저 줄은 "무대에서 어디로 갈까" 를
        말하는 것이라, 이미 들어와 있는 화면에서 또 보이면 여기가 무엇을
        하는 자리인지가 흐려진다. 이름과 지갑만 남는다.
      */}
      <TopBar gates={false} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/*
          제목 한 줄. 아래 띠가 어느 탭인지 이미 말하지만, 굴려 내려가면
          띠는 화면 밖이라 **여기가 어디인지**를 맨 위에서 한 번 말한다.
        */}
        <T size={FS.hero} bold style={{ marginBottom: SP.sm }}>영웅</T>
        {/*
          ── 언제 들어가나 ──

          이 한 줄이 이 창에서 제일 중요하다. 편성이 미뤄진다는 것을 모르면
          "바꿨는데 왜 그대로지" 가 되고, 그건 고장으로 읽힌다.
        */}
        <View
          style={{
            padding: SP.sm,
            borderRadius: R.md,
            backgroundColor: waiting ? SURF.up : 'transparent',
            borderWidth: waiting ? 1 : 0,
            borderColor: LINE.hi,
          }}
        >
          <T size={FS.body} bold={waiting}>
            {waiting
              ? '저장해야 들어갑니다'
              : '편성을 바꾸면 저장을 눌러야 들어갑니다'}
          </T>
          <T size={FS.tiny} dim="dim" style={{ marginTop: 2 }}>
            {waiting
              ? `지금 ${stage}판은 바꾸기 전 편성 그대로 싸웁니다. 저장하면 ${stage}판을 처음부터 다시 시작합니다.`
              : '판이 도는 중에는 저절로 안 바뀝니다 — 판을 어떻게 짤까를 정하는 자리이지, 지금 뭘 누를까를 정하는 자리가 아닙니다.'}
          </T>
          {waiting && (
            <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
              {/*
                ── 저장 ── **누르면 그 자리에서 들어간다.**

                예약은 판이 바뀔 때 저절로 들어가지만 (`commitPending`), 그때가
                언제인지가 사람 쪽에서는 안 보인다 — 마지막 판을 도는 사람은
                판 번호가 안 바뀌므로 한참을 기다려야 하고, 기다리는 동안
                "안 눌린 건가" 를 알 방법이 없다.

                값은 **판을 다시 세우는 것**이다. 그래서 묻고 넣는다 —
                한창 우두머리를 깎는 중에 눌러 놓고 나중에 알면 늦다.
              */}
              <Btn
                label="저장"
                size="sm"
                fill
                style={{ flex: 1 }}
                onPress={() => { sfx('tap'); setAsking(true); }}
              />
              <Btn
                label="짜 둔 편성 버리기"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => { sfx('tap'); clearPending(); }}
              />
            </Row>
          )}
        </View>

        <T size={FS.title} bold style={{ marginTop: SP.md, marginBottom: SP.xs }}>
          누가 서나
        </T>
        <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
          {Array.from({ length: PARTY_SIZE }, (_v, i) => (
            <Slot key={i} id={party[i] ?? null} n={i + 1} onPress={() => setSlot(i)} />
          ))}
        </Row>
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
          칸을 누르면 세울 사람을 고르고, 그 사람을 키울 수도 있습니다.
        </T>

        <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.md }} />

        {/* 어떻게 서나 — 대형 (`FormationPicker`) */}
        <FormationPicker />

        {/*
          ── ⚠ 테스트 단추 ── 출시 전에 통째로 지운다 (`FREE_ENHANCE`)

          **가진 사람 전부**의 성을 한 번에 맞춘다. 캐릭터 창에도 같은 것이
          있지만 (`CharPopup`) 거기는 한 명씩이라, 넷을 4성으로 올려 놓고
          트리를 짜 보려면 창을 네 번 열었다 닫아야 한다.

          등급 상한은 지킨다 — 넷 다 영웅이라 4성이 끝이다 (`maxStar`).
          등급이 낮은 사람이 생기면 그 사람만 제 상한에서 멈춘다.
        */}
        {FREE_ENHANCE && (
          <>
            <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.md }} />
            <Row between style={{ marginBottom: SP.xs }}>
              <T size={FS.tiny} bold>TEST · 전원 성 맞추기</T>
              <T size={FS.tiny} dim="dim">레벨 상한도 같이 따라옵니다</T>
            </Row>
            <Row gap={SP.xs}>
              {[1, 2, 3, 4].map((n) => (
                <Btn
                  key={n}
                  label={`${n}성`}
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={() => {
                    for (const c of Object.values(chars)) setGrowth(c.id, { star: n });
                    toast(`전원 ${n}성`, 'plain');
                  }}
                />
              ))}
            </Row>
            <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
              <Btn
                label="전원 Lv 최대"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => {
                  for (const c of Object.values(chars)) setGrowth(c.id, { lv: 999 });
                  toast('전원 레벨 최대', 'plain');
                }}
              />
              <Btn
                label="전원 조각 +48"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => {
                  for (const c of Object.values(chars)) {
                    setGrowth(c.id, { copies: c.copies + 48 });
                  }
                  toast('전원 조각 +48', 'plain');
                }}
              />
            </Row>
          </>
        )}
      </ScrollView>

      {/* 칸을 누르면 그 위에 겹쳐 열린다 */}
      <CharPopup slot={slot} onClose={() => setSlot(null)} />

      {/*
        ── 저장 확인 ──

        묻는 이유는 하나다: **지금 판이 처음부터 다시 선다.** 되돌릴 수
        없고, 우두머리를 반쯤 깎아 놓은 판이었다면 그 몫이 통째로 사라진다.

        되돌릴 수 없는 것은 묻고 한다 — 이 게임에서 그 규칙을 지키는
        자리가 여럿이다 (강화·정리).
      */}
      <Popup visible={asking} title="편성 저장" onClose={() => setAsking(false)}>
        <T size={FS.body} bold>변경이 적용되고 해당 스테이지는 재시작됩니다</T>
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
          {`지금 ${stage}판을 처음부터 다시 시작합니다. 모아 둔 스킬 코스트와 걸려 있던 것은 사라지고, 쓰러진 사람은 다시 일어섭니다.`}
        </T>
        <Row gap={SP.xs} style={{ marginTop: SP.md }}>
          <Btn
            label="취소"
            size="lg"
            style={{ flex: 1 }}
            onPress={() => { sfx('tap'); setAsking(false); }}
          />
          <Btn
            label="확인"
            size="lg"
            fill
            style={{ flex: 1 }}
            onPress={() => {
              sfx('tap');
              applyPending();
              setAsking(false);
              /*
                여기서 화면을 안 떠난다.

                창이던 시절에는 닫았다 — 판이 다시 서는 것을 봐야 눌린 것이
                보이기 때문이다. 이제는 탭이라 떠나는 것이 **아래 띠를 누르는
                일**이고, 그건 사람이 정한다. 저장한 뒤에 대형을 마저 만지는
                일이 흔한데 거기서 화면이 튕겨 나가면 다시 들어와야 한다.
              */
            }}
          />
        </Row>
      </Popup>
    </>
  );
}
