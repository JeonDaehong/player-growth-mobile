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
import React from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { useBattleUi } from '@/state/battleUi';
import {
  BATTLE_TYPE_ART, BATTLE_TYPE_NAME, CHARS, battleTypeOf, skillsOf, statOf,
} from '@/core/chars';
import {
  MAX_PARTY_GEAR, PARTY_SIZE, hpOf, partyGear, partyPower,
} from '@/core/party';
import { Bar, Row, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { BORDER, SP, WHITE } from '@/ui/theme';

export function PartyBar({ onPick }: { onPick: (slot: number) => void }) {
  const party = useGame((s) => s.party);
  const chars = useGame((s) => s.chars);
  /*
    지금 남은 체력.

    무대 위에도 머리 위 막대가 있지만 40px 짜리라 "얼마나 위험한가" 까지는
    안 읽힌다. 여기서 숫자로 한 번 더 보여 준다 — 사제를 넣을지 말지 같은
    판단이 이 숫자에서 나온다.
  */
  const hpMap = useGame((s) => s.battle.hp);
  /*
    스킬이 몇 칸 찼나.

    무대 머리 위에 있던 것을 여기로 옮겼다 (`Fighter`). 머리 위는 앞으로
    버프·디버프 아이콘이 쓸 자리고, 기술이 한 명당 여러 개가 되면 점 몇 줄로는
    무엇이 차고 있는지 말할 수 없다.
  */
  const charge = useBattleUi((s) => s.charge);

  const gear = partyGear(party, chars);
  const power = partyPower(party, chars);

  return (
    <View>
      <Row between style={{ marginBottom: SP.xs }}>
        <Row gap={SP.sm}>
          <T size={12} bold>파티</T>
          <T size={10} dim="sub">
            강화 {gear} / {MAX_PARTY_GEAR}
          </T>
        </Row>
        <T size={11} bold>전투력 {power.toLocaleString()}</T>
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
                  paddingVertical: SP.xs,
                  alignItems: 'center',
                  opacity: pressed ? 0.6 : 1,
                  /* 빈 칸은 흐리게 — 채워야 할 자리라는 게 한눈에 보이게 */
                  borderStyle: c ? 'solid' : 'dashed',
                },
              ]}
            >
              {c && d ? (
                <>
                  <Sprite set="avatar" name={d.art} size={34} />
                  <T size={9} bold center numberOfLines={1} style={{ marginTop: 2 }}>
                    {d.name}
                  </T>
                  {/* 이 사람에 대해 저장되는 값은 강화 수치 하나다 */}
                  <T size={11} bold style={{ marginTop: 1 }}>+{c.gearLv}</T>

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
                      dim={hpOf(c, hpMap) <= 0 ? 'dim' : undefined}
                      style={{ marginTop: 1 }}
                    >
                      {hpOf(c, hpMap) <= 0
                        ? '쓰러짐'
                        : `${Math.ceil(hpOf(c, hpMap))} / ${statOf(c).hp}`}
                    </T>
                  </View>
                  {/*
                    스킬 쿨 — 기술마다 한 줄.

                    칸이 차 가는 것만 보여도 "다음 번이다" 가 읽힌다. 숫자로
                    적지 않는 이유는, 이게 초가 아니라 **평타 횟수**라서다 —
                    그 사람이 얼마나 빨리 치느냐에 걸려 있고, 초로 적으면 실제로
                    나가는 순간과 안 맞는다. 몇 초짜리인지는 창에서 본다
                    (`SkillPanel`).

                    기술이 늘면 줄이 는다. 머리 위에서는 못 하던 것이다.
                  */}
                  {skillsOf(c.id).map((sk) => {
                    const on = charge[c.id] ?? 0;
                    const full = on >= sk.every - 1;
                    return (
                      <View key={sk.name} style={{ alignSelf: 'stretch', marginTop: 3, paddingHorizontal: 3 }}>
                        <Row gap={1}>
                          {Array.from({ length: sk.every }, (_v, k) => (
                            <View
                              key={k}
                              style={{
                                flex: 1,
                                height: 3,
                                /* 다 차면 꽉 찬다 — 마지막 칸이 눈에 띄어야 한다 */
                                backgroundColor: k <= on ? WHITE : 'transparent',
                                borderWidth: 1,
                                borderColor: k <= on ? WHITE : '#FFFFFF55',
                              }}
                            />
                          ))}
                        </Row>
                        <T size={8} center dim={full ? undefined : 'dim'} style={{ marginTop: 1 }}>
                          {full ? `${sk.name} 준비` : sk.name}
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
                  <Row gap={2} style={{ marginTop: 2, alignItems: 'center' }}>
                    <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={9} />
                    <T size={8} dim="dim">{BATTLE_TYPE_NAME[battleTypeOf(c.id)]}</T>
                  </Row>
                </>
              ) : (
                <View style={{ height: 74, justifyContent: 'center' }}>
                  <T size={20} dim="dim" center>+</T>
                  <T size={9} dim="dim" center>빈 자리</T>
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
