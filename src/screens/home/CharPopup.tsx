/**
 * 파티 칸을 누르면 열리는 창 — 두 가지를 한 자리에서 한다.
 *
 *   · 누구를 세울지 고른다 (가지고 있는 캐릭터 목록)
 *   · 서 있는 캐릭터를 키운다 (레벨 · 성 · 스킬 트리)
 *
 * 둘을 나누지 않은 이유가 있다. 파티 칸을 눌렀을 때 하고 싶은 일은 "이 자리를
 * 어떻게 할까" 하나고, 그 답이 사람을 바꾸는 것일 수도 키우는 것일 수도 있다.
 * 창을 둘로 나누면 누를 때마다 어느 창을 열지 먼저 정해 줘야 한다.
 *
 * ## 다만 **어디서 열었느냐**로 갈린다 (`readOnly`)
 *
 * 이 창을 여는 곳이 둘이다 — 홈의 파티 칸과 영웅 탭.
 *
 * 영웅 탭은 **키우러 들어가는 화면**이다. 거기서는 레벨을 올리고 합성하고
 * 트리를 찍고 자리를 바꾼다.
 *
 * 홈의 파티 칸은 다르다. 싸움을 보다가 "쟤가 누구더라" 로 여는 자리라,
 * 알고 싶은 것은 **누구이고 · 무엇을 쓰고 · 지금 수치가 얼마인가** 셋이다.
 * 거기에 강화 단추와 캐릭터 목록이 같이 있으면 싸움을 보다 눌렀다가 파티가
 * 바뀐다 — 실제로 그럴 자리가 아니다.
 *
 * 그래서 홈에서 열면 **읽기만 한다.** 창 하나에 두 얼굴을 두는 것이,
 * 같은 내용을 두 파일로 나눠 놓고 한쪽만 고치게 두는 것보다 낫다.
 */
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/state/store';
import {
  AWAKEN_COPIES, AWAKEN_ELIXIR, BATTLE_TYPE_ART, BATTLE_TYPE_NAME, CHARS, CharId,
  ELIXIR_NAME, FREE_ENHANCE, RARITY_NAME, STAR_CAP,
  battleTypeOf, canAwaken, capOf, charPower,
  lvCost, maxStar, starUpCost, statOf,
} from '@/core/chars';
import { Bar, Btn, ListItem, Row, Sep, Stars, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { Money } from '@/ui/Money';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { SkillPanel } from './SkillPanel';
import { CharStats } from './CharStats';
import { SkillTreePopup } from './SkillTreePopup';
import { openPicks } from '@/core/skillTree';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';
import { seatRows } from '@/core/party';

export function CharPopup({
  slot, onClose, readOnly,
}: {
  slot: number | null;
  onClose: () => void;
  /**
   * **보기만 하는 창인가** — 홈의 파티 칸에서 열면 참이다.
   *
   * 꺼져 있으면 (영웅 탭) 여태 하던 것을 다 한다. 켜져 있으면 **누르는
   * 것이 전부 사라진다** — 레벨 · 합성 · 각성 · 스킬 트리 · 월페이퍼 ·
   * 자리 비우기 · 캐릭터 바꾸기, 그리고 머리말의 골드까지.
   *
   * 골드를 빼는 이유도 같다. 저건 **쓸 것이 있을 때** 보는 값이라, 아무것도
   * 못 사는 창에 걸려 있으면 무엇을 살 수 있나 찾게 만든다.
   */
  readOnly?: boolean;
}) {
  /*
    ── 짜 둔 편성을 고친다 ──

    자리를 바꾸는 것은 **다음 판부터** 들어가므로 (`state/types` 의
    `pendingParty`), 이 창이 다루는 것은 짜 둔 쪽이다. 들어간 쪽을 보여
    주면 방금 넣은 사람이 칸에서 사라진다.

    바꾼 것이 없으면 둘이 같은 배열이라 (`?? s.party`) 평소에는 아무 차이가
    없다.
  */
  const party = useGame((s) => s.pendingParty ?? s.party);
  const raw = useGame((s) => s.chars);
  const form = useGame((s) => s.formation);
  /*
    ── 화면도 **앉힌 명부**를 본다 ──

    전투는 대형에 앉힌 몸으로 계산한다 (`core/party` 의 `seatRows` — 앞줄은
    체력 1.1배, 뒷줄은 공격 1.15배). 화면이 맨 몸 수치를 읽으면 **최대 체력이
    두 값으로 갈린다**: 계산은 330 을 최대로 보고 화면은 300 을 최대로 보므로,
    30 을 맞은 사람이 화면에서는 여전히 가득 찬 채로 서 있게 된다.

    `useMemo` 를 안 쓴다. 네 명짜리 명부를 한 번 베끼는 일이라, 기억해 두는
    비용이 다시 만드는 비용보다 크다.

    파티에 없는 사람은 `row` 가 안 붙으므로 (`seatRows`) 창고 목록은 그대로
    맨 몸 수치다 — 캐릭터끼리 견주는 자리에서 대형이 끼어들면 안 된다.
  */
  /* 렌더마다 새 객체를 만들면 이 값을 보는 갈래가 다 헛돈다 (`BattleView` 참고) */
  const chars = useMemo(() => seatRows(party, raw, form), [party, raw, form]);
  const money = useGame((s) => s.money);
  const setPartySlot = useGame((s) => s.setPartySlot);
  const toast = useGame((s) => s.toast);
  /* ── 자라는 세 축 (`core/growth`) ── */
  const elixir = useGame((s) => s.elixir);
  const levelUp = useGame((s) => s.levelUp);
  const starUp = useGame((s) => s.starUp);
  const awaken = useGame((s) => s.awaken);
  const setGrowth = useGame((s) => s.setGrowth);
  /*
    지금 남은 체력과 걸려 있는 것들.

    수치 옆에 **지금 얼마나 오르내렸나**를 적으려면 둘 다 필요하다. 비앙카의
    공격속도는 남은 체력이 정하고(`frenzy`), 둔화·약화·파쇄는 걸려 있는 것이
    정한다.
  */

  /** 방금 두들긴 결과 — 창을 닫으면 사라진다 */
  /** 월페이퍼를 보고 있나 */
  const [paper, setPaper] = useState(false);
  /** 스킬 트리를 보고 있나 (`SkillTreePopup`) */
  const [tree, setTree] = useState(false);

  if (slot === null) return null;

  const id = party[slot] ?? null;
  const c = id ? chars[id] : null;
  const d = c ? CHARS[c.id] : null;

  /*
    ── 지금 값과 원래 값 ──

    **계산이 쓰는 것과 같은 함수**를 쓴다 (`core/passives`). 여기서 따로
    세면 창에 적힌 공격력과 실제로 박히는 피해가 갈리는데, 그건 화면만
    봐서는 못 잡는다.

    여기 `c` 는 **파티 자리에 서 있는 사람**이다 (창고 목록은 아래 따로
    있고 거기에는 수치를 안 적는다). 쓰러져 있으면 괄호를 아예 안 붙인다 —
    시체에 붙은 버프는 거짓말이고, 다시 일어서면 그때 다시 계산된다.
  */
  /*
    ── 수치는 부품이 셈한다 ── (`CharStats`)

    여기서 맨 몸과 지금 값을 다 세고 있었다. 영웅 관리 화면이 같은 수치를
    보여 주게 되면서 셈과 그림을 통째로 옮겼다 — 두 벌로 두면 한쪽만
    고쳐진다.
  */

  /*
    아래 목록은 **맨 몸 명부**를 쓴다 (`raw`).

    여기는 캐릭터끼리 견주는 자리다. 파티에 선 넷만 대형 배수가 얹힌 전투력을
    내걸면, 창고에 있는 사람이 실제보다 약해 보인다 — 바꿔 넣는 순간 그쪽도
    같은 배수를 받는데.
  */
  /* 지금 찍을 수 있는 갈래가 몇 개나 (`core/skillTree`) */
  const picks = c ? openPicks(c.id, c.star, c.tree) : 0;

  const owned = Object.values(raw);

  const close = () => { setPaper(false); setTree(false); onClose(); };

  return (
    <>
    {/* 스킬 트리 — 캐릭터 창 위에 겹쳐 뜬다 */}
    <SkillTreePopup who={tree && c ? c.id : null} onClose={() => setTree(false)} />
    <WallpaperPopup
      charId={paper && c ? c.id : null}
      name={d?.name}
      onClose={() => setPaper(false)}
    />
    <Popup
      visible
      title={`${slot + 1}번 자리`}
      onClose={close}
      /* 살 것이 없는 창에는 지갑도 없다 (`readOnly`) */
      right={readOnly ? undefined : <Money amount={money} size={11} />}
    >
      {c && d ? (
        <>
          <Row gap={SP.md}>
            <Sprite set="avatar" name={d.art} size={52} />
            <View style={{ flex: 1 }}>
              {!!d.title && <T size={9} dim="dim">{d.title}</T>}
              <Row gap={SP.xs}>
                <T size={FS.hero} bold>{d.name}</T>
                {/*
                  등급은 **얼마나 세냐가 아니라 어디까지 가느냐**다
                  (`core/growth`). 전설과 신화만 채워 그린다 — 저 둘만 5성과
                  각성까지 간다.
                */}
                <Tag
                  label={RARITY_NAME[d.rarity]}
                  fill={d.rarity === 'mythic' || d.rarity === 'legendary'}
                />
                {/*
                  ── 전투 타입은 **로고만** ──

                  `[로고] 방패` 처럼 이름을 붙여 뒀다. 등급 알약 바로 옆이라
                  한 줄에 딱지가 둘이 되고, 이름 옆이 온통 알약이었다.

                  로고 하나면 된다. 넷뿐이고 (`BATTLE_TYPE_ART`) 모양이 서로
                  다르며, 이름은 창을 처음 여는 몇 번이면 묶인다.
                */}
                <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={13} />
              </Row>
              <Row gap={SP.xs} style={{ marginTop: 2 }}>
                <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={14} />
                <T size={FS.label} bold>Lv {c.lv}</T>
                <T size={FS.tiny} dim="dim">/ {capOf(c)}</T>
              </Row>
              <T size={FS.tiny} dim="dim" numberOfLines={1}>
                {`전투력 ${charPower(c).toLocaleString()}`}
              </T>
              {/*
                월페이퍼 — **그림이 있는 사람에게만** 뜬다 (`hasWallpaper`).
                없는 사람에게 눌리지 않는 단추를 남겨 두면, 그게 "아직 안
                나왔다" 인지 "고장" 인지 알 수가 없다.
              */}
              {hasWallpaper(c.id) && !readOnly && (
                <Btn
                  label="월페이퍼 보기"
                  size="sm"
                  style={{ marginTop: SP.xs, alignSelf: 'flex-start' }}
                  onPress={() => setPaper(true)}
                />
              )}
            </View>
          </Row>

          {/*
            ── 키우는 것은 **영웅 탭에서만** ── (`readOnly`)

            레벨 · 합성 · 각성 · 스킬 트리가 여기 있었다. 홈의 파티 칸에서
            열었을 때는 통째로 안 뜬다 — 싸움을 보다가 "쟤가 누구더라" 로
            연 창에서 강화 단추를 누를 일은 없고, 잘못 눌러 조각을 쓰는
            일은 있다.
          */}
          {!readOnly && (
            <>
          <Sep />

          {/*
            스킬 — **강화보다 먼저 온다.**

            강화는 "얼마나 세게" 고, 스킬은 "무엇을 하는가" 다. 자리에 누구를
            세울지 고르는 창이므로 먼저 알아야 하는 쪽은 뒤엣것이다 — 궁수와
            사제 중 누구를 넣을지는 공격력 숫자로 안 갈린다.
          */}
          {/*
            ── 자라는 세 축 ── 등급 · 성 · 레벨 (`core/growth`).

            **스킬보다 먼저 온다.** 성이 스킬을 여는 축이라 (`skillSlots`),
            아래 기술 목록에서 잠긴 칸을 보기 전에 "왜 잠겼나" 가 여기 있어야
            한다. 순서가 반대면 잠긴 칸을 보고 여기까지 되짚어 내려와야 한다.
          */}
          <View
            style={{
              padding: SP.sm,
              borderRadius: R.md,
              backgroundColor: SURF.up,
              gap: SP.xs,
            }}
          >
            {/* ── 레벨 ── 골드로 오르고 실패가 없다 */}
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

            <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: 2 }} />

            {/*
              ── 성 ── 같은 사람 조각을 합친다 (`starUpCost`).

              한 성 오를 때마다 **1성 조각으로 두 배씩** 든다 (1·2·4·8). 값이
              큰 이유는 성이 올려 주는 것이 스탯이 아니라 레벨 상한과 기술
              이라서다 — 한 번 오를 때마다 그 사람이 하는 일이 바뀐다.
            */}
            <Row between>
              <T size={FS.tiny} dim="sub">성 · 합성</T>
              <T size={FS.tiny} dim="dim">
                {`조각 ${c.copies}장 · ${RARITY_NAME[d.rarity]}는 ${maxStar(d.rarity)}성까지`}
              </T>
            </Row>
            {c.star >= maxStar(d.rarity) ? (
              /*
                다 올린 사람에게는 **단추 대신 다음 이야기**를 보여 준다.
                신화면 각성이 남았고, 아니면 여기가 끝이다.
              */
              canAwaken(d.rarity) && !c.awake ? (
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
                  <T size={FS.tiny} dim="dim">
                    {`가진 것 — 조각 ${c.copies} / ${AWAKEN_COPIES}, ${ELIXIR_NAME} ${elixir} / ${AWAKEN_ELIXIR}`}
                  </T>
                  <T size={FS.tiny} dim="dim">
                    각성하면 별 다섯이 푸르게 물들고, 레벨 상한이 140 이 되며
                    각성 스킬과 각성 패시브가 열립니다. {ELIXIR_NAME}은 10판부터
                    우두머리를 잡으면 가끔 나옵니다.
                  </T>
                </>
              ) : (
                <T size={FS.tiny} dim="dim">
                  {c.awake
                    ? '각성까지 마쳤습니다 — 더 올릴 것이 없습니다.'
                    : `${RARITY_NAME[d.rarity]} 등급이 갈 수 있는 마지막 성입니다.`}
                </T>
              )
            ) : (
              <>
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
                <T size={FS.tiny} dim="dim">
                  {`${c.star + 1}성이 되면 레벨 상한이 ${capOf({ ...c, star: c.star + 1 })} 가 되고 `
                    + `${c.star + 1}번째 기술이 열립니다. 조각은 모집에서 이미 가진 사람이 `
                    + '나오면 쌓입니다.'}
                </T>
              </>
            )}
          </View>

          <Sep />

          {/*
            ── 스킬 트리로 가는 문 ──

            목록(`SkillPanel`)은 "지금 무엇을 쓰나" 를 말하고, 트리는
            "무엇으로 키울까" 를 말한다. 둘이 다른 질문이라 화면도 나눈다 —
            한 자리에 다 넣으면 스킬 넷을 보려고 갈래 여덟을 지나야 한다.
          */}
          {/*
            ── 찍을 것이 남았으면 **눈에 띄어야 한다** ──

            트리가 생기면서 "성만 되면 저절로 열리던" 것이 "골라야 열리는"
            것으로 바뀌었다. 그래서 2성인데 아무것도 안 찍은 사람은 기술이
            하나뿐인데, 그 사실이 화면 어디에도 없으면 기술을 잃은 것으로
            보인다.

            남은 갈래가 있으면 단추가 채워지고 몇 개인지 적는다.
          */}
          <Btn
            label="스킬 트리"
            sub={picks > 0 ? `찍을 것 ${picks}개` : `${c.star}단계까지 열림`}
            size="sm"
            fill={picks > 0}
            style={{ marginBottom: SP.sm }}
            onPress={() => setTree(true)}
          />

            </>
          )}
          <SkillPanel c={c} party={party} chars={chars} readOnly={readOnly} />

          {/*
            여기 **전용무기(고유장비) 강화**가 있었다 — 이름 붙은 무기 한
            자루와 +0~+100 막대 둘, 강화 단추, 성공/실패 알림.

            개념째로 걷었다 (`core/chars` 머리말). 이 창에서 자라는 것은 이제
            위의 레벨 · 성 · 스킬 트리 셋뿐이고, 그게 원래 이 게임이 자란다고
            말하던 것이다 (`core/growth`).
          */}
          <Sep />
          {/*
            ── 수치 ── 영웅 관리 화면과 **같은 부품**이다 (`CharStats`).

            여기 박혀 있던 것을 떼어 냈다. 두 벌로 두면 한쪽만 고쳐지고,
            그때부터 같은 사람의 공격력이 화면마다 다르게 뜬다.
          */}
          <CharStats c={c} party={party} chars={chars} />
          {/*
            ── 테스트용 단추 ──

            `FREE_ENHANCE` 가 켜져 있을 때만 나온다 (`core/chars`).

            ⚠ 출시 전에 `FREE_ENHANCE` 를 끄면 이 줄은 통째로 사라진다.
          */}
          {/*
            ── 여기부터도 **영웅 탭에서만** ── (`readOnly`)

            테스트 단추와 "이 자리 비우기" 다. 둘 다 누르면 파티가 바뀌는
            것이라, 싸움을 보다 연 창에 있으면 안 된다.
          */}
          {!readOnly && (
            <>
          {FREE_ENHANCE && (
            <>
              {/*
                성과 레벨도 같은 이유로 건너뛸 수 있어야 한다. 각성 하나를
                보려면 조각 마흔여덟 장(`AWAKEN_COPIES` + 5성까지 열여섯)이
                필요하고, 레벨 140 은 백마흔 번을 눌러야 한다.
              */}
              {/*
                ── 성을 오르내린다 ──

                합성으로 올리면 조각이 들고, 내릴 방법은 아예 없다. 성이
                여는 것이 레벨 상한과 **스킬 트리 단계**라 (`core/growth`),
                1성과 4성을 오가며 보지 않으면 트리를 확인할 수가 없다.

                레벨은 같이 조여진다 — 4성 Lv100 에서 1성으로 내리면 상한이
                35 이므로 35 가 된다.
              */}
              <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
                <T size={FS.tiny} dim="dim">성</T>
                {Array.from({ length: maxStar(d.rarity) }, (_v, i) => i + 1).map((n) => (
                  <Btn
                    key={n}
                    label={`${n}`}
                    size="sm"
                    fill={c.star === n}
                    style={{ flex: 1 }}
                    onPress={() => setGrowth(c.id, { star: n })}
                  />
                ))}
              </Row>
              <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
                <Btn
                  label="조각 +48"
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={() => setGrowth(c.id, { copies: c.copies + 48 })}
                />
                <Btn
                  label="Lv 최대"
                  size="sm"
                  style={{ flex: 1 }}
                  disabled={c.lv >= capOf(c)}
                  onPress={() => setGrowth(c.id, { lv: capOf(c) })}
                />
                <Btn
                  label="Lv 1 로"
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={() => setGrowth(c.id, { lv: 1 })}
                />
              </Row>
            </>
          )}

          <Btn
            label="이 자리 비우기"
            size="sm"
            style={{ marginTop: SP.xs }}
            onPress={() => setPartySlot(slot, null)}
          />
            </>
          )}
        </>
      ) : (
        <T size={11} dim="sub">빈 자리입니다. 세울 캐릭터를 고르세요.</T>
      )}

      {/*
        ── 누구를 세울까 ── **영웅 탭에서만** (`readOnly`).

        홈의 파티 칸에서 열었을 때는 안 뜬다. 싸움을 보다 "쟤가 누구더라" 로
        연 창 맨 아래에 가진 캐릭터가 전부 늘어서 있으면, 스크롤하다 하나를
        눌러 파티가 통째로 바뀐다.
      */}
      {!readOnly && (
        <>
      <Sep />
      <T size={11} bold style={{ marginBottom: SP.xs }}>
        {c ? '다른 캐릭터로 바꾸기' : '세울 캐릭터'}
      </T>
      {owned.length === 0 && (
        <T size={10} dim="dim">가진 캐릭터가 없습니다.</T>
      )}
      {owned.map((o) => {
        const od = CHARS[o.id];
        /* 다른 자리에 서 있으면 알려 준다 — 고르면 자리를 맞바꾼다 */
        const at = party.indexOf(o.id);
        const here = at === slot;
        return (
          <ListItem
            key={o.id}
            title={od.name}
            sub={`${o.star}성${o.awake ? '(각성)' : ''} · Lv ${o.lv}`
              + ` · ${BATTLE_TYPE_NAME[battleTypeOf(o.id)]} · 전투력 ${charPower(o).toLocaleString()}`}
            left={<Sprite set="avatar" name={od.art} size={26} />}
            right={
              here ? <Tag label="이 자리" fill />
                : at >= 0 ? <Tag label={`${at + 1}번과 교체`} />
                  : <Tag label={RARITY_NAME[od.rarity]} />
            }
            disabled={here}
            onPress={() => setPartySlot(slot, o.id as CharId)}
          />
        );
      })}
        </>
      )}
    </Popup>
    </>
  );
}
