/**
 * 홈 아래쪽 — 지금 파티에 서 있는 넷.
 *
 * 네 칸이 항상 보인다. 비어 있어도 빈 칸을 그린다 — 자리가 넷이라는 걸
 * 아는 것과 모르는 것은 다르고, 빈 칸이 보여야 채우고 싶어진다.
 *
 * 칸 하나에 들어가는 것은 얼굴 · 이름 · 별 · 레벨이다. 여기서 스탯까지 보여
 * 주면 네 칸이 표가 되고, 표는 위쪽 전투에서 시선을 뺏는다. 자세한 건 눌러서
 * 여는 창(`CharPopup`)이 맡는다.
 *
 * ## 숫자는 **잘리느니 접는다**
 *
 * 칸 하나가 화면 폭의 4분의 1 이라 좁다. 여기에 큰 수를 그대로 넣으면 두
 * 가지가 일어난다 — 줄이 바뀌어 칸 높이가 넷이 서로 달라지거나, 끝이 잘려
 * 나가 `27679 / 2…` 처럼 읽을 수 없는 것이 남는다.
 *
 * 규칙을 하나로 뒀다. **한 줄에 하나씩, 넘치면 만·억으로 접는다**
 * (`short`). 이름처럼 접을 수 없는 것만 말줄임을 허용하고, 숫자는 절대
 * 안 자른다 — 잘린 숫자는 틀린 숫자다.
 */
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { useBattleUi } from '@/state/battleUi';
import {
  BATTLE_TYPE_ART, BATTLE_TYPE_NAME, CHARS, battleTypeOf, capOf, maxStar,
  skillOpen, skillsFor, statOf,
} from '@/core/chars';
import {
  PARTY_SIZE, hpOf, livingMembers, partyLevel, partyLevelCap, partyPower, seatRows,
} from '@/core/party';
import { fitCharge } from '@/core/chars';
import { hexOf } from '@/core/status';
import { marksOf } from '@/core/passives';
import { Bar, Row, Stars, T, Tag } from '@/ui/atoms';
import { StatusRow } from './StatusRow';
import { Sprite } from '@/ui/Sprite';
import { BORDER, FS, LINE, O, R, SHIELD_C, SP, SURF, WHITE } from '@/ui/theme';

/**
 * 좁은 칸에 들어갈 수 있게 접은 수.
 *
 * 만 미만은 그대로 둔다 — 초반 체력이 `1.2만` 으로 보이면 한 대에 얼마씩
 * 닳는지가 안 읽힌다. 접기 시작하는 자리는 자릿수가 다섯이 되는 지점이고,
 * 그때부터는 어차피 마지막 두어 자리를 눈으로 안 좇는다.
 */
function short(n: number): string {
  const a = Math.max(0, Math.round(n));
  if (a >= 100_000_000) return `${(a / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`;
  if (a >= 10_000) return `${(a / 10_000).toFixed(1).replace(/\.0$/, '')}만`;
  return String(a);
}

export function PartyBar({ onPick }: { onPick: (slot: number) => void }) {
  const party = useGame((s) => s.party);
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
  /*
    지금 남은 체력.

    무대 위에도 머리 위 막대가 있지만 40px 짜리라 "얼마나 위험한가" 까지는
    안 읽힌다. 여기서 숫자로 한 번 더 보여 준다 — 사제를 넣을지 말지 같은
    판단이 이 숫자에서 나온다.
  */
  const hpMap = useGame((s) => s.battle.hp);
  /*
    지금 걸려 있는 것들.

    로고 줄이 이걸 그린다 (`StatusRow`). 무대가 아니라 여기서 읽는 이유는
    `core/status` 머리말에 적어 두었다 — 걸려 있는 것은 "지금 이 사람이 어떤
    상태인가" 라서, 남은 체력·스킬 칸과 같은 자리에 모여 있어야 한다.
  */
  const hexMap = useGame((s) => s.battle.hex);
  /*
    스킬 코스트가 얼마나 찼나 — **기술 자리마다 하나씩.**

    무대 머리 위에 있던 것을 여기로 옮겼다 (`Fighter`). 기술이 한 명당 둘이
    되면서 점 한 줄로는 무엇이 차고 있는지 말할 수 없어졌다.

    세는 곳은 `Fighter` 다. 여기는 그 사람이 밀어 넣어 준 것을 그리기만
    한다 (`state/battleUi` 머리말).

    버프·디버프 로고도 같은 이유로 여기로 왔다 (`StatusRow`) — 머리 위는
    피해 숫자와 말풍선이 이미 쓰는 자리다.
  */
  const charge = useBattleUi((s) => s.charge);
  /*
    쓰러졌지만 버프가 아직 사그라드는 중인 사람들.

    아녜스가 죽어도 2초 동안은 `pv_ash` 가 **깜빡이며 남아 있다**
    (`core/passives` 의 `FADE_MS`). 그 2초는 실제로도 버프가 걸려 있는
    시간이다.
  */
  const fadeMap = useGame((s) => s.battle.fade);
  /*
    지금 두르고 있는 보호막 (`core/autoBattle` 의 `Ward`).

    체력 막대 **위에** 얹는다. 옆에 따로 적으면 "체력 120 · 보호막 40" 이
    두 값이 되는데, 실제로는 40 을 다 깎고 나서 120 이 닳으므로 **한 줄로
    이어진 것**이 맞다.
  */
  const wardMap = useGame((s) => s.battle.ward);

  /*
    살아 있는 사람들 — **패시브가 이걸 본다.**

    아녜스가 쓰러지면 네 칸에서 `pv_ash` 가 한꺼번에 사라진다. 그게 곧
    "화력이 떨어졌다" 는 신호다 (`core/passives` 의 `marksOf`).
  */
  const alive = livingMembers(party, chars, hpMap, fadeMap);

  /*
    여기 `partyGear`(파티 넷의 전용무기 강화 합)가 있었다. 전용무기를 없애면서
    **레벨 합**으로 갈아탔다 (`core/party`) — 상한이 사람마다 다르므로
    (성이 정한다) 그것도 같이 센다.
  */
  const lvSum = partyLevel(party, chars);
  const lvCapSum = partyLevelCap(party, chars);
  const power = partyPower(party, chars);

  return (
    <View>
      <Row between style={{ marginBottom: SP.xs }}>
        {/*
          왼쪽이 줄어든다 (`flexShrink`). 좁은 화면에서 두 덩어리가 부딪히면
          **전투력 쪽이 이겨야 한다** — 저건 파티를 고친 결과가 돌아오는
          자리라, 잘리면 고친 보람이 안 보인다.
        */}
        <Row gap={SP.sm} style={{ flexShrink: 1 }}>
          <T size={FS.title} bold>파티</T>
          <T size={FS.tiny} dim="dim" numberOfLines={1}>
            레벨 합 {lvSum} / {lvCapSum}
          </T>
        </Row>
        {/*
          전투력은 이 줄에서 **제일 중요한 숫자**다 — 파티를 고친 결과가
          여기 하나로 돌아온다. 그래서 이 줄에서 유일하게 크고 진하다.
        */}
        <T size={FS.body} bold numberOfLines={1}>
          전투력 {power.toLocaleString()}
        </T>
      </Row>

      {/*
        ── 네 칸의 **위가 맞아야 한다** ──

        `Row` 는 기본이 가운데 정렬이다 (`alignItems: 'center'`). 그런데 칸
        높이가 사람마다 다르다 — 기술이 셋인 리안느의 칸이 둘인 사람보다
        한 줄 더 길다 (`skillsFor`). 가운데로 맞추면 그 한 줄이 **위아래로
        반씩** 갈려서, 긴 칸 하나가 다른 셋보다 위로도 아래로도 튀어나온다.

        `stretch` 로 바꾸면 넷이 제일 긴 칸에 맞춰 같은 높이가 된다. 얼굴 ·
        이름 · 별이 한 줄에 서고, 남는 자리는 짧은 칸 아래에 생긴다 — 튀어
        나온 칸 하나보다 그쪽이 훨씬 조용하다.
      */}
      <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
        {Array.from({ length: PARTY_SIZE }, (_, i) => {
          const id = party[i];
          const c = id ? chars[id] : null;
          const d = c ? CHARS[c.id] : null;
          return (
            <Pressable
              key={i}
              onPress={() => onPick(i)}
              style={({ pressed }) => [
                BORDER,
                {
                  flex: 1,
                  paddingVertical: SP.xs + 1,
                  paddingHorizontal: 2,
                  alignItems: 'center',
                  opacity: pressed ? 0.6 : 1,
                  /*
                    ── 찬 칸과 빈 칸이 다른 **면**이다 ──

                    여태 점선 테두리 하나로 갈랐는데, 흑백에서 실선과 점선의
                    차이는 나란히 놓고 봐야 보인다. 찬 칸은 한 단 **올라오고**
                    (`SURF.up`) 빈 칸은 한 단 **파인다** (`SURF.down`) —
                    파인 자리는 설명 없이 "여기에 넣어라" 로 읽힌다.
                  */
                  borderStyle: c ? 'solid' : 'dashed',
                  borderColor: c ? LINE.mid : LINE.low,
                  backgroundColor: c ? SURF.up : SURF.down,
                },
              ]}
            >
              {c && d ? (
                <>
                  <Sprite set="avatar" name={d.art} size={34} />
                  <T size={FS.tiny} bold center numberOfLines={1} style={{ marginTop: 2 }}>
                    {d.name}
                  </T>
                  {/*
                    ── 별 ── 몇 성인가 (`core/growth`).

                    자리는 늘 그 등급이 갈 수 있는 만큼이다 (`maxStar`) —
                    3성인 희귀와 3성인 신화는 전혀 다른 상태인데, 가진 만큼만
                    그리면 화면에서 똑같아 보인다.
                  */}
                  <View style={{ marginTop: 2 }}>
                    <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={10} />
                  </View>
                  {/*
                    ── 레벨 ──

                    여기 강화 수치(`+100`)가 옆에 붙어 있었다. 전용무기를
                    없애면서 걷었고, 덕분에 **세 조각이 한 조각**이 되었다 —
                    좁은 칸에서 셋이 나란히 서면 마지막 것이 다음 줄로
                    넘어가서 네 칸의 높이가 서로 달라졌다.

                    글자 하나로 그린다. 조각을 나누면 그 사이가 줄바꿈 자리가
                    되는데, 한 덩어리는 통째로만 줄어든다 (`numberOfLines`).

                    상한을 같이 적는 이유: 상한이 성에 걸려 있어 (`capOf`)
                    "얼마나 더 올릴 수 있나" 가 곧 이 사람을 얼마나 키웠나다.
                  */}
                  <T size={FS.label} bold numberOfLines={1} style={{ marginTop: 1 }}>
                    Lv {c.lv} / {capOf(c)}
                  </T>

                  {/*
                    체력 — 막대와 숫자를 같이 둔다.

                    막대만 두면 "반쯤 닳았다" 는 보이지만 얼마나 버티는지는
                    모르고, 숫자만 두면 한눈에 안 들어온다.
                  */}
                  <View style={{ alignSelf: 'stretch', marginTop: 3, paddingHorizontal: 3 }}>
                    <Bar
                      value={Math.max(0, hpOf(c, hpMap))}
                      max={Math.max(1, statOf(c).hp)}
                      blocks={8}
                      height={4}
                    />
                    {/*
                      ── 보호막 ── 체력 막대 바로 아래 가는 하늘색 줄.

                      하늘색은 이 게임에서 **"저 겹은 체력이 아니다"** 하나만
                      말한다 (`ui/theme` 의 `SHIELD_C` — 적이 두른 막에 쓰던
                      색이다). 아군 쪽에도 같은 뜻이라 같은 색이 맞다.

                      막대 안에 섞어 그리지 않는다. 8칸짜리 블록 막대라
                      (`Bar`) 한 칸이 12.5% 인데, 막은 대개 그보다 작아서
                      섞으면 아예 안 보이거나 체력 한 칸을 잡아먹는다.
                    */}
                    {(() => {
                      const w = wardMap?.[c.id];
                      if (!w || w.hp <= 0 || w.ms <= 0) return null;
                      const max = Math.max(1, statOf(c).hp);
                      return (
                        <View
                          style={{
                            height: 3,
                            marginTop: 1,
                            borderRadius: 1,
                            backgroundColor: SURF.down,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${Math.min(100, (w.hp / max) * 100)}%`,
                              height: '100%',
                              backgroundColor: SHIELD_C,
                            }}
                          />
                        </View>
                      );
                    })()}
                    {/*
                      체력 숫자는 **접어서** 넣는다 (`short`). 만렙 근처에서는
                      다섯 자리가 둘이라 (`27679 / 27679`) 칸을 넘겨 잘렸다 —
                      잘린 숫자는 없는 것만 못하다.
                    */}
                    <T
                      size={8}
                      center
                      numberOfLines={1}
                      dim={hpOf(c, hpMap) <= 0 ? 'dim' : 'sub'}
                      style={{ marginTop: 1 }}
                    >
                      {hpOf(c, hpMap) <= 0
                        ? '쓰러짐'
                        : `${short(hpOf(c, hpMap))} / ${short(statOf(c).hp)}`}
                    </T>
                  </View>
                  {/*
                    걸려 있는 것들 — 체력 바로 아래 (`StatusRow`).

                    무대 머리 위에서 여기로 옮겼다. 40~52px 인물 위에 얹으면
                    인물을 가리고 피해 숫자·말풍선과 자리를 다툰다. 파티 칸에는
                    이미 그 사람의 지금 상태가 모여 있으므로(남은 체력, 스킬이
                    몇 칸 찼나) 걸려 있는 것도 같은 자리에 있는 게 맞다.

                    **비어 있어도 높이를 지킨다** — 지우면 상태가 붙었다 풀릴
                    때마다 네 칸이 위아래로 들썩인다.
                  */}
                  <StatusRow
                    status={marksOf(
                      c.id, hpOf(c, hpMap), statOf(c).hp, hexOf(hexMap, c.id),
                      alive, fadeMap,
                      /*
                        **보호막은 안 넘긴다.** 여기는 바로 위에서 체력 막대
                        아래에 하늘색 띠로 이미 그리고 있고, 저건 로고보다
                        많은 말을 한다 — 걸렸나뿐 아니라 얼마나 남았나까지
                        보인다. 로고를 하나 더 얹으면 같은 말이 두 번이다.

                        무대 쪽은 반대라 넘긴다 (`BattleView` 의 `markOf`) —
                        저기는 띠를 그릴 자리가 없어서, 안 넘기면 코스트
                        10짜리 기술이 머리 위에 아무 말도 안 하고 지나간다.
                      */
                    )}
                  />

                  {/*
                    ── 스킬 코스트 — 기술마다 한 줄 ──

                    칸이 차 가는 것만 보여도 "다음 번이다" 가 읽힌다. 초로
                    안 적는 이유는 이게 시간이 아니라 **평타 횟수**라서다 —
                    그 사람이 얼마나 빨리 치느냐에 걸려 있고, 초로 적으면
                    실제로 나가는 순간과 안 맞는다.

                    **칸 수를 코스트만큼 그리지 않는다.** 정화가 20 이라
                    스무 칸을 그리면 한 칸이 1px 이 되어 뭉갠다. 대신 여덟
                    칸으로 나눠 비율로 채운다 — 4 짜리는 여전히 한 번에 두
                    칸씩 차므로 "네 번" 이 그대로 보인다.
                  */}
                  {skillsFor(c).map((sk, si) => {
                    /*
                      ── 기술 한 칸이 말하는 것은 셋 중 하나다 ──

                        잠김    아직 성이 모자라 못 쓴다 (`skillOpen`)
                        차는 중  몇 번 더 치면 나간다
                        준비    다음 스윙에 나간다

                      셋을 **밝기로만** 가른다 (흑백이라 그것뿐이다). 잠긴
                      것은 아예 흐리고, 차는 중이면 홈만 보이고, 준비되면
                      막대가 꽉 찬 채로 글자까지 진해진다.

                      잠긴 것도 지우지 않고 **흐리게 남긴다.** 지우면 칸의
                      높이가 사람마다 달라져서 넷이 들쭉날쭉해지고, 무엇보다
                      "몇 성이 되면 이게 열린다" 가 안 보인다.
                    */
                    const open = skillOpen(c, si);
                    const on = fitCharge(c, charge[c.id])[si] ?? 0;
                    const full = open && on >= sk.cost;
                    /* 스무 칸은 1px 이 되어 뭉갠다 — 여덟 칸에 비율로 채운다 */
                    const cells = Math.min(8, Math.max(1, sk.cost));
                    const lit = open ? Math.round((on / Math.max(1, sk.cost)) * cells) : 0;
                    return (
                      <View
                        key={sk.name}
                        style={{
                          alignSelf: 'stretch',
                          marginTop: 3,
                          paddingHorizontal: 3,
                          opacity: open ? 1 : O.dim,
                        }}
                      >
                        <Row
                          gap={1}
                          style={{
                            padding: 1,
                            borderRadius: R.sm,
                            backgroundColor: SURF.down,
                          }}
                        >
                          {Array.from({ length: cells }, (_v, k) => (
                            <View
                              key={k}
                              style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 1,
                                backgroundColor: WHITE,
                                /* 다 차면 꽉 찬다 — 마지막 칸이 눈에 띄어야 한다 */
                                opacity: k < lit ? (full ? 1 : O.sub) : 0.09,
                              }}
                            />
                          ))}
                        </Row>
                        {/*
                          ── 숫자를 아예 안 적는다 ──

                          `거대 화살 8/12` 였다. 칸이 화면 폭의 4분의 1 이라
                          이름이 긴 기술은 그 숫자 때문에 말줄임으로 잘렸고,
                          잘린 이름은 어느 기술인지조차 말하지 못한다.

                          **막대가 이미 같은 말을 한다.** 바로 위 여덟 칸이
                          찬 만큼 밝아지므로 (`lit`) "얼마나 남았나" 는 그것으로
                          읽힌다 — 8/12 라는 정확한 수는 여기서 아무 판단도
                          바꾸지 않는다. 정확한 값이 필요하면 캐릭터 창이 있다.

                          이름 옆에 남는 것은 **지금 그 칸이 무엇인가** 뿐이다.
                          다 차면 `준비`, 아직 안 열렸으면 몇 성이 필요한지.
                        */}
                        <Row gap={2} style={{ marginTop: 1, justifyContent: 'center' }}>
                          <T
                            size={8}
                            numberOfLines={1}
                            dim={full ? 'full' : 'dim'}
                            style={{ flexShrink: 1 }}
                          >
                            {sk.name}
                          </T>
                          {(!open || full) && (
                            <T size={8} numberOfLines={1} dim={full ? 'full' : 'dim'}>
                              {open ? '준비' : `${si + 1}성`}
                            </T>
                          )}
                        </Row>
                      </View>
                    );
                  })}

                  {/*
                    전투 타입 — 아이콘과 이름.

                    역할(공격·방어·보조) 대신 넷으로 적는다. 공격이 근접과
                    원거리로 갈리는 게 파티를 짤 때 실제로 보는 차이다.

                    아이콘이 아직 없으면 글자만 남는다 (`Sprite` 의 대체 처리) —
                    그림이 도착하는 순간 저절로 붙는다.
                  */}
                  <Row gap={3} style={{ marginTop: 3, alignItems: 'center' }}>
                    <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={9} />
                    <T size={8} dim="dim">{BATTLE_TYPE_NAME[battleTypeOf(c.id)]}</T>
                  </Row>
                </>
              ) : (
                <View style={{ height: 96, justifyContent: 'center', gap: 4 }}>
                  {/*
                    빈 칸의 `+` 는 **동그라미 안에** 넣는다. 글자만 덩그러니
                    있으면 그게 단추인지 그냥 표시인지 모르겠는데, 실제로
                    누를 수 있는 자리이므로 눌러 보여야 맞다.
                  */}
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: R.round,
                      borderWidth: 1,
                      borderColor: LINE.mid,
                    }}
                  >
                    <T size={14} dim="sub">+</T>
                  </View>
                  <T size={FS.tiny} dim="dim" center>빈 자리</T>
                </View>
              )}
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
}

/** 아직 안 세운 캐릭터가 몇 명 있는지 — 홈이 "더 있다" 를 알려 줄 때 쓴다 */
export function BenchTag() {
  const party = useGame((s) => s.party);
  const chars = useGame((s) => s.chars);
  const bench = Object.keys(chars).filter((id) => !party.includes(id as never)).length;
  if (!bench) return null;
  return <Tag label={`대기 ${bench}명`} />;
}
