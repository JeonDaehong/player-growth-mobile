/**
 * 파티 칸을 누르면 열리는 창 — 두 가지를 한 자리에서 한다.
 *
 *   · 누구를 세울지 고른다 (가지고 있는 캐릭터 목록)
 *   · 서 있는 캐릭터의 고유장비를 강화한다
 *
 * 둘을 나누지 않은 이유가 있다. 파티 칸을 눌렀을 때 하고 싶은 일은 "이 자리를
 * 어떻게 할까" 하나고, 그 답이 사람을 바꾸는 것일 수도 키우는 것일 수도 있다.
 * 창을 둘로 나누면 누를 때마다 어느 창을 열지 먼저 정해 줘야 한다.
 */
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/state/store';
import {
  AWAKEN_COPIES, AWAKEN_ELIXIR, BATTLE_TYPE_ART, BATTLE_TYPE_NAME, CHARS, CharId,
  DMG_NAME, ELIXIR_NAME, FREE_ENHANCE, MAX_GEAR_LV, RARITY_NAME, STAR_CAP,
  anyPierce, battleTypeOf, blowOf, canAwaken, capOf, charPower, gearCost, gearOdds,
  lvCost, maxStar, starUpCost, statOf, swingMs,
} from '@/core/chars';
import { fmt } from '@/core/currency';
import { Bar, Btn, KV, ListItem, Row, Sep, Stars, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { Money } from '@/ui/Money';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { SkillPanel } from './SkillPanel';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';
import { deltaText, liveArmor, liveAtk, liveSpd } from '@/core/passives';
import { hexOf } from '@/core/status';
import { hpOf, livingMembers, seatRows } from '@/core/party';

export function CharPopup({
  slot, onClose,
}: { slot: number | null; onClose: () => void }) {
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
  const enhanceGear = useGame((s) => s.enhanceGear);
  const setGear = useGame((s) => s.setGear);
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
  const hpMap = useGame((s) => s.battle.hp);
  const hexMap = useGame((s) => s.battle.hex);

  /** 방금 두들긴 결과 — 창을 닫으면 사라진다 */
  const [last, setLast] = useState<'up' | 'fail' | null>(null);
  /** 월페이퍼를 보고 있나 */
  const [paper, setPaper] = useState(false);

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
  const alive = livingMembers(party, chars, hpMap);
  const hex = c ? hexOf(hexMap, c.id) : [];
  const cur = c ? hpOf(c, hpMap) : 0;
  const base = c ? statOf(c) : null;
  const now = c && base && cur > 0 ? {
    atk: Math.round(liveAtk(c, alive, hex)),
    spd: liveSpd(c, cur, alive, hex),
    ...liveArmor(c, hex),
  } : null;

  /*
    아래 목록은 **맨 몸 명부**를 쓴다 (`raw`).

    여기는 캐릭터끼리 견주는 자리다. 파티에 선 넷만 대형 배수가 얹힌 전투력을
    내걸면, 창고에 있는 사람이 실제보다 약해 보인다 — 바꿔 넣는 순간 그쪽도
    같은 배수를 받는데.
  */
  const owned = Object.values(raw);
  const cost = c ? gearCost(c.gearLv) : 0;
  const maxed = !!c && c.gearLv >= MAX_GEAR_LV;
  /* 테스트 모드에서는 비용이 0 이라 돈을 안 본다 (`FREE_ENHANCE`) */
  const canPay = !!c && (FREE_ENHANCE || money >= cost) && !maxed;

  const run = () => {
    if (!c) return;
    const r = enhanceGear(c.id);
    if (r === 'poor') { toast('골드가 부족합니다', 'bad'); return; }
    if (r === 'max') { toast('더 올릴 수 없습니다', 'plain'); return; }
    if (r === 'up' || r === 'fail') {
      setLast(r);
      void Haptics.impactAsync(
        r === 'up' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
    }
  };

  const close = () => { setLast(null); setPaper(false); onClose(); };

  return (
    <>
    <WallpaperPopup
      charId={paper && c ? c.id : null}
      name={d?.name}
      onClose={() => setPaper(false)}
    />
    <Popup
      visible
      title={`${slot + 1}번 자리`}
      onClose={close}
      right={<Money amount={money} size={11} />}
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
                {/* 전투 타입 — 아이콘과 이름을 붙여서 한 덩어리로 */}
                <Row gap={3} style={{ alignItems: 'center' }}>
                  <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={11} />
                  <Tag label={BATTLE_TYPE_NAME[battleTypeOf(c.id)]} />
                </Row>
              </Row>
              <Row gap={SP.xs} style={{ marginTop: 2 }}>
                <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={14} />
                <T size={FS.label} bold>Lv {c.lv}</T>
                <T size={FS.tiny} dim="dim">/ {capOf(c)}</T>
              </Row>
              <T size={FS.tiny} dim="dim">
                {`강화 +${c.gearLv} / ${MAX_GEAR_LV} · 전투력 ${charPower(c).toLocaleString()}`}
              </T>
              {/*
                월페이퍼 — **그림이 있는 사람에게만** 뜬다 (`hasWallpaper`).
                없는 사람에게 눌리지 않는 단추를 남겨 두면, 그게 "아직 안
                나왔다" 인지 "고장" 인지 알 수가 없다.
              */}
              {hasWallpaper(c.id) && (
                <Btn
                  label="월페이퍼 보기"
                  size="sm"
                  style={{ marginTop: SP.xs, alignSelf: 'flex-start' }}
                  onPress={() => setPaper(true)}
                />
              )}
            </View>
          </Row>

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

          <SkillPanel c={c} party={party} chars={chars} />

          <Sep />

          {/*
            강화 진행 — 이 사람에 대해 **자라는 것은 이것 하나**다.

            예전에는 여기에 경험치 막대가 있었다. 전투가 알아서 채우는 값이라
            보고만 있을 뿐 할 수 있는 게 없었고, 그 옆에서 강화만이 실제 선택
            이었다. 레벨을 없애면서 막대도 강화 쪽으로 옮겼다.
          */}
          <Row between style={{ marginTop: SP.sm }}>
            <T size={9} dim="sub">고유장비 강화</T>
            <T size={9} dim="dim">+{c.gearLv} / {MAX_GEAR_LV}</T>
          </Row>
          <Bar value={c.gearLv} max={MAX_GEAR_LV} blocks={20} height={5} />

          <Sep />

          {/* ── 고유장비 ── */}
          <Row between>
            <T size={12} bold>{d.gear}</T>
            <T size={16} bold>+{c.gearLv}</T>
          </Row>
          {!!d.gearNote && <T size={10} dim="sub">{d.gearNote}</T>}
          <T size={9} dim="dim">
            떼어 낼 수 없는 고유장비입니다. 실패해도 부서지거나 내려가지 않습니다.
          </T>

          <View style={{ marginTop: SP.xs }}>
            <Bar value={c.gearLv} max={MAX_GEAR_LV} blocks={20} height={6} />
          </View>

          {last && (
            <View style={[BORDER, { padding: SP.xs, marginTop: SP.sm }]}>
              <T size={12} bold center>
                {last === 'up' ? `강화 성공! +${c.gearLv}` : '실패 — 그대로입니다'}
              </T>
            </View>
          )}

          <Sep />
          {/*
            ── 수치 ──

            방어력과 마법저항력을 **나란히** 놓는다. 둘은 같은 뺄셈이고 막는
            것만 다른데(`core/chars` 의 `Armor`), 떨어뜨려 놓으면 그 대칭이
            안 보여서 마법저항력이 무슨 값인지 따로 배워야 한다.

            평타 옆에 종류를 붙이는 것도 같은 이유다 — "공격력 15" 만 있으면
            그게 어느 쪽 방어에 막히는지 알 길이 없다.
          */}
          {/*
            ── 괄호 안은 **지금 걸려 있는 만큼**이다 ──

            원래 값을 먼저 적고, 패시브와 우두머리가 얹거나 깎은 몫을 괄호로
            붙인다 (`25 (+2)`). 합쳐진 값 하나만 적으면 "왜 창에 적힌 것과
            다르지" 가 되고, 원래 값만 적으면 버프가 화면에서 사라진다.

            안 걸려 있으면 괄호가 아예 안 뜬다 — 넷의 여섯 줄에 `(+0)` 이
            붙어 있으면 정작 달라진 줄이 안 보인다 (`deltaText`).
          */}
          <KV
            k="공격력"
            v={`${statOf(c).atk}${now ? deltaText(statOf(c).atk, now.atk) : ''}`
              + ` (${DMG_NAME[blowOf(c.id).type]})`}
          />
          {/*
            공격속도가 빠져 있었다. 이 게임에서 **스킬 주기까지 정하는 값**이라
            (`SkillDef.every` 가 횟수로 도므로) 없으면 왜 어떤 사람이 기술을
            자주 쓰는지 설명이 안 된다.

            배수만 적으면 "0.8" 이 빠른 건지 느린 건지 알 수 없어서 실제 간격을
            같이 적는다 — `core/chars` 의 `swingMs` 와 같은 값이다.
          */}
          {/*
            간격은 **지금 값으로** 적는다. 저건 "얼마나 자주 휘두르나" 라서,
            원래 간격을 적어 두고 옆에 차이를 붙이면 두 숫자를 나눠야 실제
            박자가 나온다 — 그건 읽는 사람이 할 일이 아니다.
          */}
          <KV
            k="공격속도"
            v={`${statOf(c).spd}${now ? deltaText(statOf(c).spd, now.spd, 1) : ''}`
              + ` (${swingMs(now ? now.spd : statOf(c).spd)}ms 마다)`}
          />
          <KV k="체력" v={`${cur > 0 ? `${Math.ceil(cur)} / ` : ''}${statOf(c).hp}`} />
          <KV
            k="방어력"
            v={`${statOf(c).def}${now ? deltaText(statOf(c).def, now.def) : ''}`
              + ' (물리 피해를 막는다)'}
          />
          <KV
            k="마법저항력"
            v={`${statOf(c).res}${now ? deltaText(statOf(c).res, now.res) : ''}`
              + ' (마법 피해를 막는다)'}
          />
          {statOf(c).crit > 0 && (
            <KV
              k="치명타"
              v={`${Math.round(statOf(c).crit * 100)}% · 피해 ${Math.round(statOf(c).critDmg * 100)}%`}
            />
          )}
          {(() => {
            /* 관통은 **가진 사람에게만** 뜬다 — 0 짜리 줄이 넷에게 다 붙으면 잡음이다 */
            const p = anyPierce(c.id);
            const on: string[] = [];
            if (p.phys) on.push('물리관통');
            if (p.magic) on.push('마법관통');
            return on.length ? <KV k="관통" v={on.join(' · ')} /> : null;
          })()}
          <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
            방어력은 물리 피해를, 마법저항력은 마법 피해를 그 수만큼 깎습니다
            (비율이 아니라 뺄셈이고, 아무리 깎여도 최소 1은 들어갑니다).
            관통이 있으면 그 방어를 통째로 무시합니다.
          </T>
          <T size={9} dim="dim" style={{ marginTop: 2 }}>
            괄호 안의 +- 는 지금 걸려 있는 패시브와 상태 효과가 얹거나 깎은
            몫입니다. 판이 끝나거나 걸린 것이 풀리면 사라집니다.
          </T>
          {/*
            공짜·확실일 때는 확률과 비용 줄을 뺀다 — "100%" 와 "0 골드" 는
            읽는 사람에게 아무것도 안 알려 주면서 자리만 차지한다.
          */}
          {!maxed && !FREE_ENHANCE && (
            <KV k="성공 확률" v={`${Math.round(gearOdds(c.gearLv) * 100)}%`} dim />
          )}
          {!maxed && !FREE_ENHANCE && (
            <KV k="강화 비용" v={fmt(cost)} warn={money < cost} />
          )}

          <Btn
            label={maxed ? '최대 강화' : '강화하기'}
            sub={maxed || FREE_ENHANCE ? undefined : fmt(cost)}
            size="lg"
            fill={canPay}
            disabled={!canPay}
            style={{ marginTop: SP.md }}
            onPress={run}
          />

          {/*
            ── 테스트용 단추 둘 ──

            `FREE_ENHANCE` 가 켜져 있을 때만 나온다 (`core/chars`). 공짜로
            강화해도 +100 까지 백 번을 눌러야 하면 직접 굴려 볼 수가 없어서
            한 번에 올리는 것도 같이 둔다.

            ⚠ 출시 전에 `FREE_ENHANCE` 를 끄면 이 줄은 통째로 사라진다.
          */}
          {FREE_ENHANCE && (
            <>
              <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
                <Btn
                  label={`+${MAX_GEAR_LV} 까지`}
                  size="sm"
                  style={{ flex: 1 }}
                  disabled={maxed}
                  onPress={() => { setGear(c.id, MAX_GEAR_LV); setLast(null); }}
                />
                <Btn
                  label="+0 으로 되돌리기"
                  size="sm"
                  style={{ flex: 1 }}
                  disabled={c.gearLv === 0}
                  onPress={() => { setGear(c.id, 0); setLast(null); }}
                />
              </Row>
              {/*
                성과 레벨도 같은 이유로 건너뛸 수 있어야 한다. 각성 하나를
                보려면 조각 마흔여덟 장(`AWAKEN_COPIES` + 5성까지 열여섯)이
                필요하고, 레벨 140 은 백마흔 번을 눌러야 한다.
              */}
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
            onPress={() => { setPartySlot(slot, null); setLast(null); }}
          />
        </>
      ) : (
        <T size={11} dim="sub">빈 자리입니다. 세울 캐릭터를 고르세요.</T>
      )}

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
            sub={`${o.star}성${o.awake ? '(각성)' : ''} · Lv ${o.lv} · +${o.gearLv}`
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
    </Popup>
    </>
  );
}
