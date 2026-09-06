/**
 * 홈 아래쪽 — 지금 파티에 서 있는 넷.
 *
 * 네 칸이 항상 보인다. 비어 있어도 빈 칸을 그린다 — 자리가 넷이라는 걸
 * 아는 것과 모르는 것은 다르고, 빈 칸이 보여야 채우고 싶어진다.
 *
 * ## 반으로 줄였다 — 폰에서 너무 컸다
 *
 * 칸 하나에 여덟 줄이 있었다: 얼굴 · 이름 · 별 · 레벨 · 체력 막대 · 체력
 * 숫자 · 상태 로고 · 기술 칸(사람마다 최대 셋, 각각 막대와 이름) · 전투
 * 타입. 넷을 나란히 놓으면 165px 짜리 **표**가 되어, 폰에서 무대 다음으로
 * 큰 덩어리가 파티 칸이었다.
 *
 * 여덟 줄 중 **싸우는 동안 실제로 보는 것은 셋**이다.
 *
 *   누가 얼마나 다쳤나   체력 막대 (그리고 막)
 *   무엇이 곧 나가나     기술이 찬 만큼
 *   무엇에 걸려 있나     상태 로고
 *
 * 나머지 다섯(별 · 레벨 상한 · 체력 숫자 · 기술 이름 · 전투 타입)은
 * **견주는 값**이다 — 파티를 짜거나 키울 때 보는 것이지 싸움을 보면서
 * 읽는 것이 아니다. 그건 눌러서 여는 창이 이미 다 하고 있다 (`CharPopup`).
 *
 * 요즘 모바일 게임의 파티 줄이 대개 이 모양이다: **얼굴 하나에 얹힌 막대
 * 몇 줄.** 이름과 레벨은 얼굴 위에 겹치고, 자세한 것은 눌러서 본다.
 *
 * ## 얼굴 위에 겹친다 — 밑에 쌓지 않는다
 *
 * 줄을 밑으로 쌓으면 한 줄이 곧 칸 높이 12px 이다. 레벨과 체력 막대를
 * 얼굴 위에 얹으면 그 둘이 **높이를 안 먹는다** — 44px 짜리 얼굴 안에서
 * 아래쪽 12px 은 어차피 발치라 글자 한 줄과 막대 하나가 들어갈 자리가 있다.
 *
 * ## 칸 높이가 **늘 같다**
 *
 * 사람마다 기술 수가 달라서 (`skillsFor` — 둘에서 넷) 칸 높이가 서로 달랐다.
 * 넷을 `stretch` 로 묶어 두었으므로 겉높이는 같았지만, 남는 자리가 **짧은
 * 칸 아래**에 생기므로 상태 로고 줄이 사람마다 다른 높이에 떴다 — "버프창
 * 위치가 다 제각각" 이 그것이다. 스킬 트리에서 하나를 찍는 순간 파티 줄
 * 전체가 갑자기 길어지기도 했다.
 *
 * 이제 **자리를 미리 잡아 둔다** (`SKILL_ROWS`). 기술이 둘뿐인 사람의 칸에도
 * 네 줄 자리가 있고, 빈 줄은 아무것도 안 그린다. 막 줄도 마찬가지다 —
 * 없어도 자리는 남는다.
 *
 * 몇 px 을 빈 채로 두는 값이다. 그 대신 **아무것도 안 움직인다** — 기술을
 * 찍어도, 막을 둘러도, 넷이 서로 다른 기술 수를 가져도 칸이 그대로다.
 *
 * ## 숫자를 아예 안 적는다
 *
 * 여기 `27679 / 27679` 를 만·억으로 접어 넣는 함수가 있었다 (`short`).
 * 칸 하나가 화면 폭의 4분의 1 이라 다섯 자리 둘이 안 들어갔기 때문인데,
 * 접고 나면 `2.8만 / 2.8만` 이라 **한 대에 얼마씩 닳는지가 안 읽힌다** —
 * 접어야 들어가는 숫자는 애초에 이 자리의 숫자가 아니었다.
 *
 * 막대가 대신 말한다. 정확한 값이 필요하면 창을 연다.
 */
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { useBattleUi } from '@/state/battleUi';
import { CHARS, maxStar, skillOpen, skillsFor, statOf } from '@/core/chars';
import {
  PARTY_SIZE, hpOf, livingMembers, partyPower, seatRows,
} from '@/core/party';
import { fitCharge } from '@/core/chars';
import { hexOf } from '@/core/status';
import { marksOf } from '@/core/passives';
import { Row, Stars, T, Tag } from '@/ui/atoms';
import { StatusRow } from './StatusRow';
import { Sprite } from '@/ui/Sprite';
import { BORDER, FS, LINE, O, R, SHIELD_C, SP, SURF, WHITE } from '@/ui/theme';

/** 얼굴 한 변 (px) — 34 였다. 줄을 걷어 낸 만큼 얼굴이 커진다 */
const FACE = 46;
/** 체력 막대 두께 */
const HP_H = 4;
/** 막과 기술 칸의 두께 — 체력보다 얇아야 "덤으로 붙은 겹" 으로 읽힌다 */
const THIN = 2;
/**
 * 기술 줄을 **몇 개 자리 잡아 둘까**.
 *
 * 사람마다 기술이 둘에서 넷이다 (`skillsFor` — 트리를 어떻게 찍었느냐가
 * 정한다). 있는 만큼만 그리면 칸 높이가 사람마다 다르고, 하나를 새로 찍는
 * 순간 파티 줄 전체가 길어진다.
 *
 * 넷이다 — 트리가 네 단계라 (`core/skillTree`) 액티브를 다 골라도 넷을
 * 안 넘는다. 남는 줄은 아무것도 안 그린다.
 */
const SKILL_ROWS = 4;
/** 기술 줄 하나의 높이 — 로고가 들어가는 만큼 */
const SK_H = 10;

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

    렌더마다 새 객체를 만들면 이 값을 보는 갈래가 다 헛돈다 (`BattleView` 참고).
  */
  const chars = useMemo(() => seatRows(party, raw, form), [party, raw, form]);
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

    세는 곳은 `Fighter` 다. 여기는 그 사람이 밀어 넣어 준 것을 그리기만
    한다 (`state/battleUi` 머리말).
  */
  const charge = useBattleUi((s) => s.charge);
  /*
    쓰러졌지만 버프가 아직 사그라드는 중인 사람들 (`core/passives` 의 `FADE_MS`).
  */
  const fadeMap = useGame((s) => s.battle.fade);
  /* 지금 두르고 있는 보호막 (`core/autoBattle` 의 `Ward`) */
  const wardMap = useGame((s) => s.battle.ward);

  /*
    살아 있는 사람들 — **패시브가 이걸 본다.**

    아녜스가 쓰러지면 네 칸에서 `pv_ash` 가 한꺼번에 사라진다. 그게 곧
    "화력이 떨어졌다" 는 신호다 (`core/passives` 의 `marksOf`).
  */
  const alive = livingMembers(party, chars, hpMap, fadeMap);
  const power = partyPower(party, chars);

  return (
    <View>
      {/*
        ── 머리말 한 줄 ──

        `파티 · 레벨 합 30/140 · 전투력 12,345` 였다. 셋 중 둘이 **견주는
        값**이라 (레벨 합은 어디에도 안 쓰이고, 상한은 성이 정한다) 싸움을
        보면서 읽을 것이 아니었다.

        전투력만 남긴다 — 파티를 고친 결과가 여기 하나로 돌아온다.
      */}
      <Row between style={{ marginBottom: SP.xs }}>
        <T size={FS.title} bold>파티</T>
        <T size={FS.label} bold numberOfLines={1}>
          전투력 {power.toLocaleString()}
        </T>
      </Row>

      {/*
        ── 네 칸의 **위가 맞아야 한다** ──

        `Row` 는 기본이 가운데 정렬이다. 그런데 칸 높이가 사람마다 다르다 —
        기술이 셋인 사람의 칸이 둘인 사람보다 한 줄 더 길다 (`skillsFor`).
        가운데로 맞추면 그 한 줄이 위아래로 반씩 갈려서 긴 칸 하나가 다른
        셋보다 위로도 아래로도 튀어나온다. `stretch` 면 넷이 제일 긴 칸에
        맞춰 같은 높이가 되고, 남는 자리는 짧은 칸 아래에 생긴다.
      */}
      <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
        {Array.from({ length: PARTY_SIZE }, (_, i) => {
          const id = party[i];
          const c = id ? chars[id] : null;
          const d = c ? CHARS[c.id] : null;
          const hp = c ? hpOf(c, hpMap) : 0;
          const max = c ? Math.max(1, statOf(c).hp) : 1;
          const down = !!c && hp <= 0;
          const w = c ? wardMap?.[c.id] : undefined;
          const ward = w && w.hp > 0 && w.ms > 0 ? Math.min(1, w.hp / max) : 0;
          return (
            <Pressable
              key={i}
              onPress={() => onPick(i)}
              style={({ pressed }) => [
                BORDER,
                {
                  flex: 1,
                  padding: 3,
                  alignItems: 'center',
                  opacity: pressed ? 0.6 : 1,
                  /*
                    ── 찬 칸과 빈 칸이 다른 **면**이다 ──

                    찬 칸은 한 단 **올라오고** (`SURF.up`) 빈 칸은 한 단
                    **파인다** (`SURF.down`) — 파인 자리는 설명 없이 "여기에
                    넣어라" 로 읽힌다.
                  */
                  borderStyle: c ? 'solid' : 'dashed',
                  borderColor: c ? LINE.mid : LINE.low,
                  backgroundColor: c ? SURF.up : SURF.down,
                },
              ]}
            >
              {c && d ? (
                <>
                  {/*
                    ── 얼굴 ── 그 위에 레벨과 체력이 **겹친다.**

                    밑으로 쌓으면 한 줄이 곧 칸 높이 12px 인데, 얼굴 발치의
                    12px 은 어차피 비어 있다. 거기에 얹으면 두 줄이 공짜다.
                  */}
                  <View style={{ width: FACE, height: FACE }}>
                    <Sprite
                      set="avatar"
                      name={d.art}
                      size={FACE}
                      /* 쓰러지면 흐려진다 — 막대만으로는 0 인지 안 보인다 */
                      opacity={down ? O.dim : 1}
                    />
                    {/*
                      ── 별 ── 얼굴 **위쪽에 겹친다.**

                      3성인 희귀와 3성인 신화는 전혀 다른 상태인데 (`maxStar`),
                      가진 만큼만 그리면 화면에서 똑같아 보인다 — 그래서 자리는
                      늘 그 등급이 갈 수 있는 만큼이다.

                      밑으로 쌓으면 한 줄이 곧 칸 높이다. 얼굴 정수리 쪽은
                      대개 비어 있으므로 거기에 얹으면 공짜고, 어두운 판을
                      깔아서 밝은 그림 위에서도 별이 읽히게 한다.
                    */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                        paddingVertical: 1,
                        backgroundColor: SURF.veil,
                      }}
                    >
                      <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={8} />
                    </View>
                    {/*
                      레벨 — 얼굴 **오른쪽 아래**에 작은 판으로.

                      `Lv 40 / 60` 이었다. 상한은 성이 정하는 값이라
                      (`capOf`) "얼마나 더 올릴 수 있나" 를 말하는데, 그건
                      키우러 들어갔을 때 볼 것이지 싸움을 보면서 읽을 것이
                      아니다 — 창에 그대로 있다.
                    */}
                    <View
                      style={{
                        position: 'absolute',
                        right: -2,
                        bottom: HP_H + 1,
                        paddingHorizontal: 3,
                        borderRadius: R.sm,
                        backgroundColor: SURF.veil,
                      }}
                    >
                      <T size={8} bold>{c.lv}</T>
                    </View>
                    {/*
                      ── 체력 ── 얼굴 **발치에 걸친다.**

                      칸을 나눈 블록 막대(`Bar`)를 안 쓴다. 여덟 칸이면 한
                      칸이 12.5% 라, 남은 체력이 그보다 적을 때 **가득 찬 것과
                      빈 것 사이가 통째로 없다** — 죽기 직전이 한 칸으로만
                      보인다. 이어진 길이는 그 문제가 없다.
                    */}
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: HP_H,
                        backgroundColor: SURF.down,
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.max(0, Math.min(1, hp / max)) * 100}%`,
                          height: '100%',
                          backgroundColor: WHITE,
                        }}
                      />
                    </View>
                  </View>

                  {/*
                    ── 보호막 ── 체력 바로 아래 가는 하늘색 줄.

                    하늘색은 이 게임에서 **"저 겹은 체력이 아니다"** 하나만
                    말한다 (`ui/theme` 의 `SHIELD_C`). 무대의 발밑 막대와
                    같은 규칙이다 (`Fighter`).

                    **없어도 자리는 지킨다.** 안 그리면 막을 두르는 순간
                    그 사람 칸만 4px 길어져서 넷이 어긋난다 — 자리만 비워
                    두면 아무것도 안 움직인다.
                  */}
                  <View
                    style={{
                      alignSelf: 'stretch',
                      height: THIN,
                      marginTop: 2,
                      borderRadius: 1,
                      backgroundColor: ward > 0 ? SURF.down : 'transparent',
                      overflow: 'hidden',
                    }}
                  >
                    {ward > 0 && (
                      <View
                        style={{
                          width: `${ward * 100}%`,
                          height: '100%',
                          backgroundColor: SHIELD_C,
                        }}
                      />
                    )}
                  </View>

                  {/*
                    ── 이름 ──

                    얼굴만으로도 넷은 갈리지만, 이름이 있어야 창을 열기 전에
                    "누구를 누를까" 가 정해진다. 한 줄이면 충분하다.
                  */}
                  <T
                    size={FS.tiny}
                    bold
                    center
                    numberOfLines={1}
                    dim={down ? 'dim' : 'full'}
                    style={{ marginTop: 2 }}
                  >
                    {down ? '쓰러짐' : d.name}
                  </T>

                  {/*
                    ── 기술이 찬 만큼 ── 기술마다 가는 줄 하나.

                    ## 이름과 칸 수를 걷었다

                    `[▪▪▪▪░░░░] 용암 지대` 였다. 기술이 셋이면 여섯 줄이고,
                    이름은 칸이 좁아 대개 말줄임으로 잘렸다 — 잘린 이름은
                    어느 기술인지조차 말하지 못한다.

                    **줄 하나가 이미 같은 말을 한다.** 찬 만큼 밝아지고
                    다 차면 꽉 찬다. 무엇이 나가는지는 나가는 순간 무대가
                    말하고 (머리 위 말풍선), 정확한 값은 창에 있다.

                    순서는 그대로다 — 위에서부터 첫째 · 둘째 · 셋째 기술이라,
                    창을 한 번 보면 어느 줄이 무엇인지가 묶인다.
                  */}
                  {Array.from({ length: SKILL_ROWS }, (_v, si) => {
                    const list = skillsFor(c);
                    const sk = list[si];
                    /*
                      ── 없는 줄도 자리를 지킨다 ──

                      사람마다 기술이 둘에서 넷이라, 있는 만큼만 그리면 칸
                      높이가 갈리고 상태 로고 줄이 사람마다 다른 데 뜬다.
                      빈 줄은 아무것도 안 그리고 높이만 차지한다.
                    */
                    if (!sk) return <View key={`e${si}`} style={{ height: SK_H, marginTop: 2 }} />;
                    const open = skillOpen(c, si);
                    const on = fitCharge(c, charge[c.id])[si] ?? 0;
                    const full = open && on >= sk.cost;
                    const at = open ? Math.min(1, on / Math.max(1, sk.cost)) : 0;
                    return (
                      <Row
                        key={sk.name}
                        gap={3}
                        style={{
                          alignSelf: 'stretch',
                          height: SK_H,
                          marginTop: 2,
                          /* 아직 못 쓰는 기술은 흐리다 — 지우면 칸 높이가 갈린다 */
                          opacity: open ? 1 : O.faint,
                        }}
                      >
                        {/*
                          ── 어느 기술인가 ── 막대 **왼쪽에 로고 하나.**

                          이름을 적었다가 걷었다. 칸이 좁아 대개 말줄임으로
                          잘렸고, 잘린 이름은 어느 기술인지조차 말하지 못한다.

                          로고는 **잘리지 않는다.** 10px 짜리 그림 하나라
                          자리를 거의 안 먹으면서, 캐릭터 창에서 본 것과 같은
                          그림이라 (`SkillPanel` 도 `skill_icon` 을 쓴다) 한
                          번 보면 묶인다.

                          그림이 아직 없으면 빈 자리로 남고 막대만 남는다 —
                          `Sprite` 가 그렇게 떨어뜨린다.
                        */}
                        <Sprite set="skill_icon" name={sk.art} size={SK_H} />
                        <View
                          style={{
                            flex: 1,
                            height: THIN,
                            borderRadius: 1,
                            backgroundColor: SURF.down,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${at * 100}%`,
                              height: '100%',
                              backgroundColor: WHITE,
                              /* 다 차면 꽉 찬다 — 그 순간이 눈에 띄어야 한다 */
                              opacity: full ? 1 : O.sub,
                            }}
                          />
                        </View>
                      </Row>
                    );
                  })}

                  {/*
                    걸려 있는 것들 (`StatusRow`).

                    **비어 있어도 높이를 지킨다** — 지우면 상태가 붙었다 풀릴
                    때마다 네 칸이 위아래로 들썩인다.
                  */}
                  <StatusRow
                    status={marksOf(
                      c.id, hp, statOf(c).hp, hexOf(hexMap, c.id), alive, fadeMap,
                      /*
                        **보호막은 안 넘긴다.** 바로 위에 하늘색 띠로 이미
                        그리고 있고, 저건 로고보다 많은 말을 한다 — 걸렸나뿐
                        아니라 얼마나 남았나까지 보인다.
                      */
                    )}
                  />
                </>
              ) : (
                /* 찬 칸과 **같은 높이** — 얼굴 · 이름 · 막 · 기술 넷 · 로고 줄 */
                <View
                  style={{
                    height: FACE + 14 + (THIN + 2) + SKILL_ROWS * (SK_H + 2) + 19,
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
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
