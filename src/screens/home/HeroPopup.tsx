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
import { CHARS, CharId, capOf, maxStar } from '@/core/chars';
import { PARTY_SIZE } from '@/core/party';
import { Btn, Row, Stars, T } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, C, FS, LINE, R, SP, SURF, WHITE } from '@/ui/theme';
import { SubTabs } from './BottomNav';
import { PartySlotPopup } from './PartySlotPopup';
import { HeroManage } from './HeroManage';
import { HeroBook } from './HeroBook';
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
      {/*
        ── 번호는 **늘 있다** ──

        빈 칸에만 `1번` 이 떴다. 그래서 넷이 다 차 있으면 자리 번호가 화면에서
        통째로 사라졌는데, 대형이 앞줄·뒷줄을 자리 번호로 정하고 (`FORMATIONS`)
        자리마다 맞는 확률도 다르다 (`AIM` — 1번이 절반을 받는다). 번호가
        안 보이면 그 둘을 읽을 방법이 없다.
      */}
      <T size={8} dim="dim">{n}번</T>
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
          <T size={FS.tiny} dim="dim">비었음</T>
        </>
      )}
    </Pressable>
  );
}

/** 영웅 탭 안의 갈래 셋 */
type Sub = 'manage' | 'party' | 'book';

const SUBS: readonly { id: Sub; label: string }[] = [
  { id: 'manage', label: '영웅 관리' },
  { id: 'party', label: '편성' },
  { id: 'book', label: '도감' },
];

export function HeroScreen() {
  /** 어느 갈래를 보고 있나 */
  const [at, setAt] = useState<Sub>('manage');
  /**
   * 영웅 관리에서 세워 놓은 사람.
   *
   * **화면이 들고 있는다.** 관리 안에 두면 도감에서 하나를 눌러 넘어가도
   * 그쪽이 그 값을 모르므로, 넘어가자마자 다시 첫 사람이 선다.
   */
  const [pick, setPick] = useState<CharId | null>(null);
  /*
    ── 짜 둔 것을 보여 준다 ──

    아직 안 들어갔어도 여기서는 그것이 지금의 편성이다. 들어간 것(`party`)을
    보여 주면 방금 바꾼 것이 화면에서 사라져서, 눌리기는 했는데 아무 일도
    안 일어난 것처럼 보인다.
  */
  const party = useGame((s) => s.pendingParty ?? s.party);

  const [slot, setSlot] = useState<number | null>(null);
  /* 저장을 누르면 뜨는 확인 창 — 판이 다시 서는 것은 되돌릴 수 없다 */

  /* 짜 두었지만 아직 안 들어간 것이 있나 */

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

          갈래 이름(`영웅 관리` · `편성` · `도감`)은 여기 안 적는다 — 그건
          맨 아래 줄이 늘 켜 놓고 있다 (`SubTabs`).
        */}
        <T size={FS.hero} bold style={{ marginBottom: SP.sm }}>영웅</T>

        {at === 'manage' && <HeroManage pick={pick} onPick={setPick} />}
        {at === 'book' && (
          <HeroBook
            onPick={(id) => { setPick(id); setAt('manage'); }}
          />
        )}
        {at === 'party' && (
          <>
        {/*
          ── 저장 단추는 여기 없다 ──

          `저장` 과 `변경사항 되돌리기` 두 칸이 이 자리에 있었다. 걷은 까닭:
          **이 화면에서 할 일이 아니었다.** 편성을 만지러 들어온 사람은
          만지고 나가는데, 나가기 전에 아래로 굴려 내려와 단추를 한 번 더
          눌러야 실제로 들어갔다. 안 누르고 나가면 아무 일도 안 일어났고,
          그것을 알려 주는 것도 이 화면 안의 글줄뿐이었다 — 이미 떠난 사람은
          못 읽는다.

          지금은 **나가려 할 때** 묻는다 (`HomeScreen` 의 `ApplyPopup`).
          나가는 길목이 곧 정하는 자리이므로 못 보고 지나칠 수가 없고,
          되돌리기도 거기 같이 있다.
        */}
        <T size={FS.title} bold style={{ marginTop: SP.md, marginBottom: SP.xs }}>
          영웅 출전
        </T>
        <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
          {Array.from({ length: PARTY_SIZE }, (_v, i) => (
            <Slot key={i} id={party[i] ?? null} n={i + 1} onPress={() => setSlot(i)} />
          ))}
        </Row>
        {/*
          여기 `칸을 누르면 세울 사람을 고르고, 그 사람을 키울 수도 있습니다`
          가 있었다. 빈 칸에 `+` 가 그려져 있고 (`Slot`) 찬 칸은 누르면
          열리므로, 눌러 보면 아는 것을 미리 적어 둔 셈이었다.
        */}

        <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.md }} />

        {/* 어떻게 서나 — 대형 (`FormationPicker`) */}
        <FormationPicker />

        {/*
          여기 `TEST · 전원 성 맞추기` 가 있었다 (성 넷 · 레벨 최대 · 조각
          +48). 트리를 짜 보려면 넷을 4성으로 올려야 해서 둔 것인데, 출시
          전에 지워야 하는 것이 화면에 늘어나기만 했다 — 무대 위의
          `TEST · 광폭화` 와 같은 이유로 걷는다.

          한 명씩 올리는 것은 캐릭터 창에 그대로 있다 (`CharPopup` 의
          `FREE_ENHANCE`).
        */}
          </>
        )}
      </ScrollView>

      {/*
        ── 갈래 줄은 **맨 아래** ── 다섯 칸 띠 바로 위.

        굴러가는 몸통 밖이라 어디까지 내렸든 늘 제자리에 있다. 왜 위가 아니라
        아래인지, 왜 다섯 칸 띠와 다른 모양인지는 `SubTabs` 에 적어 두었다.
      */}
      <SubTabs at={at} tabs={SUBS} onGo={setAt} />

      {/* 칸을 누르면 그 위에 겹쳐 열린다 */}
      {/*
        ── 자리를 누르면 **자리 창**이 뜬다 ── (`PartySlotPopup`)

        여기서 캐릭터 창이 통째로 열렸다. 그 창은 한 사람을 보는 자리라
        수치와 기술과 키우는 단추가 다 들어 있는데, 편성에서 칸을 누른
        사람이 하려던 일은 "이 자리에 누굴 세울까" 하나다.

        한 사람을 자세히 보는 것은 영웅 관리가 맡는다.
      */}
      <PartySlotPopup slot={slot} onClose={() => setSlot(null)} />

    </>
  );
}
