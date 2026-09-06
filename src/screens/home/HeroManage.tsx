/**
 * ── 영웅 관리 ── 한 사람을 세워 놓고 들여다보고 키운다.
 *
 * 영웅 탭의 첫 갈래다 (`HeroScreen` 의 `sub`).
 *
 * ## 창이 아니라 화면인 이유
 *
 * 이 내용이 여태 **파티 칸을 눌러야 열리는 창**에만 있었다 (`CharPopup`).
 * 그러면 캐릭터를 키우는 길이 "무대 → 파티 칸 → 그 사람" 하나뿐이고, 지금
 * 파티에 안 세운 사람은 **키울 방법이 아예 없다.**
 *
 * 여기서는 가진 사람을 좌우로 넘겨 가며 본다. 파티에 서 있든 아니든 같다.
 *
 * ## 무엇이 한 화면에 있나
 *
 *   누구인가   얼굴 · 이름 · 등급 · 전투 타입 · 별 · 레벨 · 전투력
 *   무엇을 쓰나 패시브와 액티브 (`SkillPanel`)
 *   지금 얼마나 여덟 줄 (`CharStats`)
 *   어떻게 키우나 레벨 · 합성 · 각성 · 스킬 트리
 *
 * 셋 다 **같은 부품**을 쓴다 (`CharStats` · `SkillPanel`). 창과 화면이 각자
 * 그리면 한쪽만 고쳐지고, 그때부터 같은 사람의 공격력이 자리마다 다르게 뜬다.
 *
 * ## 무대 하나에 인물이 선다
 *
 * 얼굴만 띄우던 자리를 **상자 하나**로 바꿨다 (`STAGE_H`). 배경이 깔리고,
 * 그 위에 전신이 서고, 좌우 화살표가 그 위에 얹힌다.
 *
 * 목록 어디에나 뜨는 흉상을 여기서도 썼었다 (`avatar`). 그런데 이 화면은
 * 한 사람만 세워 놓고 들여다보는 자리라, 파티 칸에 46px 로 박히는 것과
 * **같은 그림**이면 크게 띄운 값을 못 한다 — 키운 티가 안 난다.
 *
 * 전신도 배경도 아직 안 왔다. 그동안은 흉상이 대신 서고 배경 자리는 그냥
 * 어둡다 (`fallbackSet` · `SURF.down`) — 상자 크기와 자리는 지금 잡아 두므로,
 * 그림이 들어오면 폴더에 넣는 것으로 끝난다. 프롬프트는
 * `docs/CHAR_FULL_PROMPTS.md` (인물) 와 `docs/HERO_BG_PROMPT.md` (배경) 다.
 *
 * 화살표를 무대 **안**에 얹은 이유는, 밖에 두면 인물이 설 폭이 화살표 둘만큼
 * 좁아지기 때문이다. 배경은 어차피 화면 폭을 다 쓰는 그림이라, 그 위에
 * 얹으면 인물은 넓은 무대를 그대로 쓰고 화살표는 무대 양 끝에 붙는다.
 *
 * ## 코스튬과 인연
 *
 * 아직 화면이 없다 (`ui/SoonPopup`). 자리를 미리 잡아 두는 이유는, 저 둘이
 * 생길 자리가 **이 화면의 어디인지**가 지금 정해져 있어야 나중에 화면을
 * 다시 짜지 않기 때문이다 — 얼굴 옆이다. 얼굴에 붙는 것들이라 그렇다.
 *
 * 셋 다 **로고만** 있다. 글자로 두었더니 얼굴 밑에 여덟 자가 한 줄로 깔려서
 * 이름·별·레벨보다 무거웠다 — 자세한 까닭은 `ui/sprites` 의 `HERO_ACT` 에.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  AWAKEN_COPIES, AWAKEN_ELIXIR, BATTLE_TYPE_ART, CHARS, CharId, ELIXIR_NAME,
  FREE_ENHANCE, RARITY_NAME,
  battleTypeOf, canAwaken, capOf, charPower, lvCost, maxStar, starUpCost,
} from '@/core/chars';
import { HERO_ACT } from '@/ui/sprites';
import { seatRows } from '@/core/party';
import { openPicks } from '@/core/skillTree';
import { Bar, Btn, Row, Sep, Stars, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { soon } from '@/ui/SoonPopup';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { CharStats } from './CharStats';
import { SkillPanel } from './SkillPanel';
import { SkillTreePopup } from './SkillTreePopup';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';

/**
 * 좌우로 넘기는 화살표.
 *
 * 갈 데가 없으면 흐리게 멎는다 — 지우면 그 순간 얼굴이 좌우로 밀려서,
 * 넘기는 중에 화면이 흔들린다.
 */
function Arrow({ on, label, onPress }: {
  on: boolean; label: string; onPress: () => void;
}) {
  return (
    <Pressable
      hitSlop={10}
      disabled={!on}
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => ({
        paddingHorizontal: SP.sm,
        paddingVertical: SP.xs,
        opacity: on ? (pressed ? 0.5 : 1) : 0.22,
      })}
    >
      <T size={18} bold>{label}</T>
    </Pressable>
  );
}

/**
 * 무대 — 배경이 깔리고 인물이 서는 상자. 폭은 화면을 다 쓴다.
 *
 * 그림이 오기 전에도 자리는 이 크기다. 높이를 값으로 박아 두는 이유는,
 * 인물마다 그림 비율이 달라도 **무대가 안 움직여야** 하기 때문이다 — 좌우로
 * 넘길 때 상자가 늘었다 줄면 아래 이름·별·레벨이 통째로 오르내린다.
 */
const STAGE_H = 176;

/** 무대 위 인물 — 발밑에 조금 남겨 배경 바닥이 보이게 한다 */
const FULL_W = 110;
const FULL_H = 140;

/**
 * 얼굴 옆의 작은 단추 — 코스튬 · 인연 · 월페이퍼.
 *
 * **로고만 있다.** 글자를 안 쓰는 까닭은 머리말에 적어 두었다. 대신 `label`
 * 을 읽어 주는 이름으로 넘긴다 — 눈으로 못 읽는 사람에게는 로고가 아무 말도
 * 안 하므로, 화면에서 지운 글자는 여기로 옮겨야 한다.
 */
function ActBtn({ art, label, onPress }: {
  art: keyof typeof HERO_ACT; label: string; onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          /* 손가락이 닿는 최소한 — 로고는 20 이지만 상자는 그보다 커야 한다 */
          width: 38,
          height: 38,
          borderRadius: R.md,
          backgroundColor: pressed ? SURF.up : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {/*
        `assets/sprites/hero_ui/` 가 있으면 그것을, 없으면 코드 도트를 그린다.
        아래 띠와 같은 방식이다 (`BottomNav`).
      */}
      <Sprite set="hero_ui" name={art} size={20} fallback={HERO_ACT[art]} />
    </Pressable>
  );
}

export function HeroManage({ pick, onPick }: {
  /** 지금 보고 있는 사람. 없으면 첫 사람 */
  pick: CharId | null;
  onPick: (id: CharId) => void;
}) {
  const raw = useGame((s) => s.chars);
  const party = useGame((s) => s.pendingParty ?? s.party);
  const form = useGame((s) => s.formation);
  const money = useGame((s) => s.money);
  const elixir = useGame((s) => s.elixir);
  const levelUp = useGame((s) => s.levelUp);
  const starUp = useGame((s) => s.starUp);
  const awaken = useGame((s) => s.awaken);
  const toast = useGame((s) => s.toast);

  /*
    ── 대형에 앉힌 명부를 쓴다 ──

    파티에 서 있는 사람은 줄 배수를 받는다 (`seatRows`). 수치 절이 그걸
    괄호로 말하므로 (`CharStats`) 여기서도 같은 몸을 넘겨야 한다 — 맨 몸을
    넘기면 앞줄에 선 사람의 방어력이 창에서만 낮게 뜬다.
  */
  const chars = useMemo(() => seatRows(party, raw, form), [party, raw, form]);

  /** 스킬 트리를 보고 있나 */
  const [tree, setTree] = useState(false);
  /** 월페이퍼를 보고 있나 */
  const [paper, setPaper] = useState(false);

  /*
    가진 순서 — 표에 적힌 차례 그대로다 (`CHARS`). 가진 순서로 두면 새로
    뽑을 때마다 목록이 뒤섞여서, 어제 세 번째였던 사람이 오늘 첫 번째가 된다.
  */
  const owned = useMemo(
    () => (Object.keys(CHARS) as CharId[]).filter((id) => !!raw[id]),
    [raw],
  );

  const at = Math.max(0, owned.indexOf((pick ?? owned[0]) as CharId));
  const id = owned[at];
  const c = id ? chars[id] : null;
  const d = c ? CHARS[c.id] : null;

  if (!c || !d) {
    return (
      <View style={{ paddingVertical: SP.xl, alignItems: 'center' }}>
        <T size={11} dim="sub">아직 가진 캐릭터가 없습니다.</T>
      </View>
    );
  }

  const picks = openPicks(c.id, c.star, c.tree);

  /*
    성을 올리는 칸 — **올릴 데가 있을 때만** 생긴다.

    셋 중 하나다: 성이 남았으면 합성, 성은 다 채웠고 각성이 남았으면 각성,
    둘 다 끝났으면 `null` 이다. 마지막 경우에 글로 알리지 않는 까닭은 저
    아래 상자에 적어 두었다.
  */
  const maxed = c.star >= maxStar(d.rarity);
  const starNode = !maxed ? (
    <Btn
      label={`${c.star + 1}성으로 — 조각 ${starUpCost(c.star)}장`}
      size="sm"
      fill={c.copies >= starUpCost(c.star)}
      disabled={c.copies < starUpCost(c.star)}
      onPress={() => {
        const r = starUp(c.id);
        if (r === 'short') toast('조각이 부족합니다', 'bad');
        if (r === 'up') toast(`${d.name} ${c.star + 1}성!`, 'good');
      }}
    />
  ) : canAwaken(d.rarity) && !c.awake ? (
    <>
      <Btn
        label={`각성 — 조각 ${AWAKEN_COPIES} · ${ELIXIR_NAME} ${AWAKEN_ELIXIR}`}
        size="sm"
        fill={c.copies >= AWAKEN_COPIES && elixir >= AWAKEN_ELIXIR}
        disabled={c.copies < AWAKEN_COPIES || elixir < AWAKEN_ELIXIR}
        onPress={() => {
          const r = awaken(c.id);
          if (r === 'short') toast('조각이나 영약이 부족합니다', 'bad');
          if (r === 'ok') toast(`${d.name} 각성!`, 'good');
        }}
      />
      {/* 이건 남는다 — 무엇이 얼마나 모자란지는 단추만 봐서는 모른다 */}
      <T size={FS.tiny} dim="dim">
        {`가진 것 — 조각 ${c.copies} / ${AWAKEN_COPIES}, `
          + `${ELIXIR_NAME} ${elixir} / ${AWAKEN_ELIXIR}`}
      </T>
    </>
  ) : null;

  return (
    <>
      <SkillTreePopup who={tree ? c.id : null} onClose={() => setTree(false)} />
      <WallpaperPopup
        charId={paper ? c.id : null}
        name={d.name}
        onClose={() => setPaper(false)}
      />

      {/*
        ── 무대 ── 배경 · 인물 · 화살표가 이 상자 하나 안에 겹쳐 있다.

        목록에서 고르는 것보다 좌우로 넘기는 쪽이 맞다. 가진 사람이 넷
        안팎이라 목록을 따로 둘 만큼 많지 않고, 넘기는 동안 **바로 앞뒤
        사람과 견주게** 된다 — 누구를 키울까가 원래 그런 비교다.

        인물은 바닥에 붙여 세운다 (`flex-end`). 전신은 발이 아래에 있는
        그림이라 가운데로 맞추면 사람마다 발 높이가 달라지고, 좌우로 넘길
        때마다 인물이 위아래로 흔들린다.
      */}
      <View
        style={{
          height: STAGE_H,
          borderRadius: R.md,
          overflow: 'hidden',
          backgroundColor: SURF.down,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {/*
          ── 배경 ──

          **늘 같은 한 장**이다. 사람마다 다른 곳에 세우면 넘길 때 장소가
          바뀌어서, 바뀐 것이 사람인지 화면인지가 안 갈린다. 여기는 인물을
          견주는 자리라 뒤가 고정이어야 앞이 비교된다.

          `stretch` 로 늘린다 — 배경은 상자에 빈틈없이 들어차야 하고, 먼
          풍경은 조금 늘어나도 안 보인다 (`Sprite` 의 `fit`).

          많이 죽여서 깐다. 인물도 흰 선이라, 배경이 또렷하면 둘이 같은
          밝기로 다투고 그러면 **사람이 안 읽힌다.** 배경은 여기가 어디인지만
          말하면 된다.
        */}
        <Sprite
          set="bg_hero"
          name="hall"
          size={STAGE_H}
          fit="stretch"
          opacity={0.3}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' }}
        />

        {/*
          아직 그림이 없어 흉상이 대신 선다 (`fallbackSet`). 상자를 먼저
          잡아 두는 이유는 머리말에 있다 — 그림이 와도 자리는 안 움직인다.
        */}
        <Sprite
          set="char_full"
          name={d.art}
          fallbackSet="avatar"
          size={FULL_W}
          style={{ width: FULL_W, height: FULL_H, marginBottom: SP.sm }}
        />

        {/*
          ── 화살표는 무대 **위에** 얹힌다 ──

          밖에 두면 인물이 설 폭이 화살표 둘만큼 좁아진다. 양 끝에 붙여
          두면 배경 위를 밟고 서는 셈이라 무대는 폭을 다 쓴다.
        */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Arrow on={at > 0} label="‹" onPress={() => onPick(owned[at - 1])} />
          <Arrow on={at < owned.length - 1} label="›" onPress={() => onPick(owned[at + 1])} />
        </View>
      </View>

      {/* ── 누구인가 ── 무대 바로 아래. 이름 · 등급 · 역할 · 별 · 레벨 */}
      <View style={{ alignItems: 'center' }}>
        <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
          <T size={FS.hero} bold>{d.name}</T>
          <Tag
            label={RARITY_NAME[d.rarity]}
            fill={d.rarity === 'mythic' || d.rarity === 'legendary'}
          />
          <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={13} />
        </Row>
        <View style={{ marginTop: 3 }}>
          <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={13} />
        </View>

        {/*
          ── 레벨과 전투력은 **다른 줄**이다 ──

          `Lv 27 / 50   전투력 51,770` 이 한 줄에 있었다. 숫자가 넷이라
          어디까지가 레벨이고 어디부터가 전투력인지 한눈에 안 갈렸다 —
          특히 `/ 50` 과 `51,770` 이 붙어 있으면 한 덩어리로 읽힌다.

          줄을 나누고, 전투력에는 이름표를 붙여 앞에 세운다.
        */}
        <T size={FS.label} bold style={{ marginTop: SP.xs }}>
          {`Lv ${c.lv} / ${capOf(c)}`}
        </T>
        <Row gap={SP.xs} style={{ marginTop: 2, alignItems: 'baseline' }}>
          <T size={FS.tiny} dim="sub">전투력</T>
          <T size={FS.label} bold>{charPower(c).toLocaleString()}</T>
        </Row>
      </View>

      {/*
        ── 얼굴에 붙는 것들 ──

        코스튬과 인연은 아직 화면이 없다 (`soon`). 자리를 미리 잡는 이유는
        머리말에 적어 두었다 — 생길 자리가 정해져 있어야 나중에 화면을 다시
        안 짠다.

        월페이퍼는 **그림이 있는 사람에게만** 뜬다 (`hasWallpaper`). 없는
        사람에게 안 눌리는 단추를 남겨 두면, 그게 "아직 안 나왔다" 인지
        "고장" 인지 알 수가 없다.
      */}
      <Row gap={SP.xs} style={{ marginTop: SP.sm, justifyContent: 'center' }}>
        <ActBtn art="costume" label="코스튬" onPress={() => soon('코스튬')} />
        <ActBtn art="bond" label="인연" onPress={() => soon('인연')} />
        {hasWallpaper(c.id) && (
          <ActBtn art="paper" label="월페이퍼" onPress={() => setPaper(true)} />
        )}
      </Row>

      {/*
        ── 무엇을 쓰나 ── 예시 화면처럼 로고 칸이 가로로 선다 (`grid`).

        줄로 늘어놓으면 기술 넷이 세로를 그만큼 먹고, 그만큼 아래 수치와
        키우는 상자가 밀린다. 자세한 것은 칸을 누르면 아래에 펴진다.
      */}
      <SkillPanel c={c} party={party} chars={chars} grid />

      <Sep />

      {/*
        ── 지금 얼마나 ── 두 칸으로 선다 (`cols`).

        여덟 줄이 한 칸으로 서면 세로를 여덟 줄만큼 먹는다. 두 칸이면 넷이고,
        그 차이가 곧 아래 키우는 단추가 화면 안에 있느냐 밖에 있느냐다.
      */}
      <CharStats c={c} party={party} chars={chars} cols={2} deltas={false} />
      <Sep />

      {/*
        ── 자라는 축 ── 레벨 · 성 · 각성 (`core/growth`).

        **맨 아래다.** 한동안 스킬보다 위에 뒀다 — 성이 스킬을 여는 축이라
        (`skillSlots`) 잠긴 칸을 보기 전에 "왜 잠겼나" 가 먼저여야 한다고
        봤다. 그런데 그러면 화면을 열자마자 **단추 세 개**부터 마주치고,
        이 사람이 누구이고 무엇을 하는지는 그 아래로 밀린다.

        받은 예시 화면도 같은 차례다: 인물 · 기술 · 수치를 다 보여 준 다음
        맨 밑에 승급과 레벨업이 있다. **보는 것이 먼저고 하는 것이 나중**인데,
        키우는 단추는 손이 닿아야 하는 것이라 아래쪽이 오히려 맞다.

        잠긴 칸은 제 자리에서 몇 성이 필요한지를 말하므로 (`skillNeeds`)
        위아래가 바뀌어도 길이 끊기지 않는다.
      */}
      <View
        style={{
          padding: SP.sm,
          borderRadius: R.md,
          backgroundColor: SURF.up,
          gap: SP.xs,
        }}
      >
        <Row between>
          <T size={FS.tiny} dim="sub">레벨</T>
          <T size={FS.tiny} dim="dim">
            {c.lv >= capOf(c)
              ? `${c.star}성 상한 — 합성해야 더 오른다`
              : `다음 ${(FREE_ENHANCE ? 0 : lvCost(c.lv)).toLocaleString()} 골드`}
          </T>
        </Row>
        <Row gap={SP.xs}>
          <Bar value={c.lv} max={capOf(c)} blocks={20} height={5} />
          <T size={FS.label} bold>{c.lv} / {capOf(c)}</T>
        </Row>
        <Btn
          label="레벨 올리기"
          size="sm"
          fill={c.lv < capOf(c) && (FREE_ENHANCE || money >= lvCost(c.lv))}
          disabled={c.lv >= capOf(c) || (!FREE_ENHANCE && money < lvCost(c.lv))}
          onPress={() => {
            const r = levelUp(c.id);
            if (r === 'poor') toast('골드가 부족합니다', 'bad');
            if (r === 'max') toast('지금 성의 상한입니다', 'plain');
          }}
        />

        {/*
          ── 성 · 합성 ── **누를 것이 있을 때만 있다.**

          위에 이름표 줄이 있었다 (`성 · 합성` · `조각 0장 · Epic는 4성까지`).
          아래 단추가 이미 `3성으로 — 조각 8장` 이라고 말하므로 조각 수는 두
          번 적힌 셈이었고, 갈 수 있는 마지막 성은 별 넷이 이미 그려 놓았다.

          다 올린 사람에게는 `Epic 등급이 갈 수 있는 마지막 성입니다` 가 떴다.
          맞는 말인데 **아무것도 시키지 않는 말**이라, 키우는 상자 안에 못
          키운다는 안내만 남았다. 지금은 칸막이째 사라진다 — 없는 것이 곧 더
          올릴 데가 없다는 뜻이다.
        */}
        {starNode && (
          <>
            <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: 2 }} />
            {starNode}
          </>
        )}
      </View>

      {/*
        ── 스킬 트리로 가는 문 ──

        목록(`SkillPanel`)은 "지금 무엇을 쓰나" 를, 트리는 "무엇으로 키울까"
        를 말한다. 둘이 다른 질문이라 화면도 나눈다.

        찍을 것이 남았으면 채워진다 — 성만 되면 저절로 열리던 것이 골라야
        열리는 것으로 바뀌었으므로, 안 찍은 사람은 기술을 잃은 것으로 보인다.
      */}
      <Btn
        label="스킬 트리"
        sub={picks > 0 ? `찍을 것 ${picks}개` : `${c.star}단계까지 열림`}
        size="sm"
        fill={picks > 0}
        style={{ marginTop: SP.sm, marginBottom: SP.sm }}
        onPress={() => setTree(true)}
      />
    </>
  );
}
