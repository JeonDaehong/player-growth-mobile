/**
 * 홈 아래쪽 — 지금 파티에 서 있는 넷.
 *
 * 네 칸이 항상 보인다. 비어 있어도 빈 칸을 그린다 — 자리가 넷이라는 걸
 * 아는 것과 모르는 것은 다르고, 빈 칸이 보여야 채우고 싶어진다.
 *
 * 칸 하나에 들어가는 것은 넷뿐이다: 얼굴 · 이름 · 레벨 · 고유장비 강화 수치.
 * 여기서 스탯까지 보여 주면 네 칸이 표가 되고, 표는 위쪽 전투에서 시선을 뺏는다.
 * 자세한 건 눌러서 여는 창(`CharPopup`)이 맡는다.
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
  MAX_PARTY_GEAR, PARTY_SIZE, hpOf, livingMembers, partyGear, partyPower, seatRows,
} from '@/core/party';
import { fitCharge } from '@/core/chars';
import { hexOf } from '@/core/status';
import { marksOf } from '@/core/passives';
import { Bar, Row, Stars, T, Tag } from '@/ui/atoms';
import { StatusRow } from './StatusRow';
import { Sprite } from '@/ui/Sprite';
import { BORDER, FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';

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
    살아 있는 사람들 — **패시브가 이걸 본다.**

    아녜스가 쓰러지면 네 칸에서 `pv_ash` 가 한꺼번에 사라진다. 그게 곧
    "화력이 떨어졌다" 는 신호다 (`core/passives` 의 `marksOf`).
  */
  const alive = livingMembers(party, chars, hpMap, fadeMap);

  const gear = partyGear(party, chars);
  const power = partyPower(party, chars);

  return (
    <View>
      <Row between style={{ marginBottom: SP.xs }}>
        <Row gap={SP.sm}>
          <T size={FS.title} bold>파티</T>
          <T size={FS.tiny} dim="dim">강화 {gear} / {MAX_PARTY_GEAR}</T>
        </Row>
        {/*
          전투력은 이 줄에서 **제일 중요한 숫자**다 — 파티를 고친 결과가
          여기 하나로 돌아온다. 그래서 이 줄에서 유일하게 크고 진하다.
        */}
        <T size={FS.body} bold>전투력 {power.toLocaleString()}</T>
      </Row>

      <Row gap={SP.xs}>
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
                    ── 레벨과 강화 ──

                    자라는 축이 셋이 되면서 (등급 · 성 · 레벨 + 강화) 칸에
                    적을 것이 늘었다. 셋을 세 줄로 늘어놓으면 파티 칸이 표가
                    되므로, **레벨을 크게 · 나머지를 그 옆에 작게** 붙여 한
                    줄로 묶는다.

                    레벨이 앞인 이유: 상한이 성에 걸려 있어 (`capOf`) "얼마나
                    더 올릴 수 있나" 가 곧 이 사람을 얼마나 키웠나다. 강화는
                    골드만 있으면 늘 오른다.
                  */}
                  <Row gap={3} style={{ marginTop: 1 }}>
                    <T size={FS.label} bold>Lv {c.lv}</T>
                    <T size={8} dim="dim">/{capOf(c)}</T>
                    <T size={8} dim="dim">+{c.gearLv}</T>
                  </Row>

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
                    <T
                      size={8}
                      center
                      dim={hpOf(c, hpMap) <= 0 ? 'dim' : 'sub'}
                      style={{ marginTop: 1 }}
                    >
                      {hpOf(c, hpMap) <= 0
                        ? '쓰러짐'
                        : `${Math.ceil(hpOf(c, hpMap))} / ${statOf(c).hp}`}
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
                        <T
                          size={8}
                          center
                          numberOfLines={1}
                          dim={full ? 'full' : 'dim'}
                          style={{ marginTop: 1 }}
                        >
                          {!open
                            ? `${sk.name} ${si + 1}성`
                            : full ? `${sk.name} 준비` : `${sk.name} ${on}/${sk.cost}`}
                        </T>
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
