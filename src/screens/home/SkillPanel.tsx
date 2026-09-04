/**
 * 캐릭터 창의 스킬 절 — 가진 기술과 쿨타임, 누르면 자세한 수치.
 *
 * ## 왜 프로필로 옮겼나
 *
 * 원래는 전투 화면에서 머리 위 칸이 차는 것만 보였다 (`Fighter` 의 charge).
 * 칸 하나로 "다음 번이다" 는 읽히지만, 그 기술이 **무엇을 얼마나** 하는지는
 * 어디에도 없었다 — 도약이 평타의 두 배인지, 화살비가 몇 마리를 노리는지.
 *
 * 그리고 기술은 한 명당 하나가 아니게 된다. 머리 위 칸은 하나일 때만 되는
 * 표시라, 둘이 되는 순간 무엇이 차고 있는지 알 수 없다. 목록이 들어갈 자리는
 * 전투 화면이 아니라 이 창이다.
 *
 * ## 접어 둔다
 *
 * 처음부터 다 펴 놓으면 강화 버튼이 화면 밖으로 밀린다 — 이 창에서 제일 자주
 * 하는 일이 그건데. 이름과 쿨타임만 보이고, 궁금할 때 눌러서 편다.
 *
 * ## 패시브가 맨 위다
 *
 * 한동안 패시브를 **수치 절 안쪽**에 뒀다 (방어력·마법저항력 다음). 거기
 * 있으면 스킬 목록과 한참 떨어져서, 이 사람이 무엇을 하는지 알려면 창을
 * 두 군데 봐야 했다.
 *
 * 패시브도 스킬이다 — 다른 것은 **누르지 않아도 켜져 있다**는 것뿐이다.
 * 그러니 스킬 목록의 일부여야 하고, 늘 켜져 있는 쪽이 먼저다: 액티브는
 * "가끔 일어나는 일" 이고 패시브는 "늘 그런 사람" 이라 뒤엣것이 배경이 된다.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  CHARS, DMG_NAME, NO_ARMOR, OwnedChar, SkillDef, blowOf, skillNeeds, skillOpen,
  skillsFor, statOf, swingMs,
} from '@/core/chars';
import { passiveOf } from '@/core/passives';
import { Party, allyAtk, members } from '@/core/party';
import { skillBase, strikeFor } from '@/core/autoBattle';
import {
  CLEANSE_OPTS, CleanseOpt, OPT_DESC, OPT_NAME, cleanseOptOf,
} from '@/core/skillOpt';
import { KV, ListItem, Row, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { BLACK, BORDER, O, SP, WHITE } from '@/ui/theme';

/**
 * 이 기술이 **빨라야 몇 초마다** 나가나.
 *
 * 쿨타임이 초로 잡혀 있지 않다. 평타 한 번에 코스트가 1 씩 차므로
 * (`SkillDef.cost`), 실제 간격은 그 사람의 공격 속도에 걸려 있다 — 빠른
 * 사람은 같은 코스트라도 더 자주 쓴다. 화면에는 초로 적어야 비교가 되므로
 * 여기서 환산한다.
 *
 * **"빨라야" 인 이유**: 조건이 붙은 기술은 다 차도 안 나갈 수 있다 (정화는
 * 걷어낼 것이 없으면 기다린다). 그래서 이 값은 상한이지 약속이 아니다.
 *
 * (강화로 공격력이 올라도 이 값은 안 변한다. `spd` 는 안 자란다.)
 */
export function skillEverySec(c: OwnedChar, sk: SkillDef): number {
  return (swingMs(statOf(c).spd) * sk.cost) / 1000;
}

/**
 * ── 정화를 언제 쓸까 ── 네 갈래 중 하나를 고른다 (`core/skillOpt`).
 *
 * ## 왜 설정이 붙나
 *
 * 이 게임의 전투는 사람이 안 누른다. 그러면 "언제 쓰느냐" 를 정하는 것이 곧
 * 조작이고, 그 판단이 하나도 없으면 전투에서 사람이 할 일이 없다.
 *
 * 정화가 특히 그렇다 — 코스트 20 을 **기절**에 쓸지 **출혈**에 쓸지는 파티에
 * 따라 다르다. 기절은 그 사람이 아무것도 못 하는 것이라 즉시 걷어야 하고,
 * 출혈은 아프기만 할 뿐 5초 뒤에 저절로 풀린다.
 *
 * 네 칸을 가로로 늘어놓고, 고른 것만 반전시킨다. 드롭다운이 아니라 칸으로
 * 둔 이유는 **넷을 한눈에 비교해야** 고를 수 있어서다.
 */
function CleanseOption({ who, slot }: { who: string; slot: number }) {
  const opts = useGame((s) => s.skillOpts);
  const setSkillOpt = useGame((s) => s.setSkillOpt);
  const cur: CleanseOpt = cleanseOptOf(opts, who, slot);

  return (
    <View style={{ marginTop: SP.sm }}>
      <T size={10} bold>언제 쓸까</T>
      <Row gap={3} style={{ marginTop: SP.xs }}>
        {CLEANSE_OPTS.map((o) => {
          const picked = o === cur;
          return (
            <Pressable
              key={o}
              onPress={() => setSkillOpt(who as never, slot, o)}
              style={({ pressed }) => [
                BORDER,
                {
                  flex: 1,
                  paddingVertical: 3,
                  alignItems: 'center',
                  /* 고른 것만 반전 — 흑백에서 "켜짐" 을 말하는 방법이다 */
                  backgroundColor: picked ? WHITE : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <T size={9} bold={picked} style={picked ? { color: BLACK } : undefined}>
                {OPT_NAME[o]}
              </T>
            </Pressable>
          );
        })}
      </Row>
      <T size={9} dim="dim" style={{ marginTop: 3 }}>{OPT_DESC[cur]}</T>
      <T size={9} dim="dim" style={{ marginTop: 2 }}>
        걸어 둔 조건에 맞는 대상이 없으면 코스트가 꽉 차도 안 씁니다 — 모아 둔
        스무 번을 아무 일 없이 버리지 않습니다. 본인이 기절·침묵에 걸려 있으면
        기술 자체가 안 나갑니다.
      </T>
    </View>
  );
}

/**
 * 관통을 사람 말로. 없으면 빈 문자열.
 *
 * 두 종류를 다 뚫는 기술이 아직 없지만, 생기면 한 줄에 같이 적는다 —
 * 줄을 둘로 나누면 하나만 가진 흔한 경우가 괜히 목록처럼 보인다.
 */
function pierceText(sk: SkillDef, id: string): string {
  const p = blowOf(id, sk).pierce;
  const on: string[] = [];
  if (p.phys) on.push('방어력 무시');
  if (p.magic) on.push('마법저항력 무시');
  return on.join(' · ');
}

/** 누구를 때리나 — `pick` 을 사람 말로 */
function targetText(sk: SkillDef): string {
  if (sk.pick === 'none') return '아군 전체';
  if (sk.pick === 'all') return '지나가는 길의 적 전부';
  if (sk.pick === 'kind') return '떨어진 자리의 무리';
  return `무작위 ${sk.targets}마리`;
}

export function SkillPanel({
  c, party, chars,
}: {
  c: OwnedChar;
  party: Party;
  chars: Record<string, OwnedChar>;
}) {
  /** 펴 놓은 기술. 하나만 편다 — 둘을 나란히 펴면 비교가 아니라 벽이 된다 */
  const [open, setOpen] = useState<string | null>(null);

  /* 트리가 손본 것을 보여 준다 — 창에 적힌 코스트와 실제 코스트가 같아야 한다 */
  const list = skillsFor(c);
  /*
    파쇄의 태세를 찍으면 불굴의 맹세가 꺼진다 (`core/passives` 의 `regenOf`).
    목록에서 지우지 않고 흐리게 남긴다 — 무엇을 잃었는지가 안 보이면 그
    갈래를 고른 값도 안 보인다.
  */
  const passiveOff = c.tree?.includes('kg3b') ?? false;
  /* 지금 몇 개가 열려 있나 — 머리말이 이걸 적는다 (`core/chars` 의 `openSkills`) */
  const openCount = list.filter((_sk, i) => skillOpen(c, i)).length;
  const st = statOf(c);
  /* 파티 패시브가 기술에도 걸린다 — 전투가 쓰는 것과 같은 값이다 */
  const sup = allyAtk(party, chars);

  const pv = passiveOf(c.id);

  return (
    <>
      {/*
        ── 패시브 ──

        액티브보다 **먼저** 온다. 액티브는 가끔 일어나는 일이고 패시브는 늘
        그런 사람이라, 뒤엣것을 알고 나서 앞엣것을 읽어야 말이 된다 —
        "아녜스를 넣으면 넷이 다 세진다" 를 모르고 기도의 회복량만 보면
        이 사람을 넣을 이유가 반밖에 안 보인다.

        접지 않는다. 한 줄이면 다 적히므로 접을 것이 없다.
      */}
      {!!pv && (
        <View style={passiveOff ? { opacity: O.dim } : undefined}>
          <Row between style={{ marginBottom: SP.xs }}>
            <T size={11} bold>패시브</T>
            <T size={9} dim="dim">
              {passiveOff ? '파쇄의 태세가 껐습니다' : '늘 켜져 있습니다'}
            </T>
          </Row>
          <ListItem
            title={pv.name}
            sub={pv.text}
            /*
              **제 로고를 쓴다** (`passive_icon`). 상태 로고를 빌려 쓰면
              비앙카와 리안느가 같은 그림이 된다 —
              `docs/PASSIVE_ICON_PROMPTS.md` 에 이유를 적어 뒀다.

              아직 그림이 없으면 빈 자리로 남고, 도착하는 순간 저절로 붙는다.
            */
            left={<Sprite set="passive_icon" name={pv.art} size={22} />}
            right={<Tag label={passiveOff ? '꺼짐' : '항상'} />}
          />
          <T size={9} dim="dim" style={{ marginTop: 2, marginBottom: SP.sm }}>
            {passiveOff
              ? '파쇄의 태세를 찍어서 꺼졌습니다. 되돌리면 다시 걸립니다.'
              : '파티에 서 있고 살아 있는 동안만 걸립니다 — 쓰러지면 그 자리에서 꺼집니다.'}
          </T>
        </View>
      )}

      {/*
        ── 잠긴 기술도 목록에 남는다 ──

        성이 기술을 연다 (`core/growth` 의 `skillSlots`). 아직 못 쓰는 것을
        목록에서 빼면 "합성하면 무엇이 생기나" 가 어디에도 안 적힌다 — 성을
        올릴 이유가 화면에서 사라지는 셈이다.

        대신 흐리게 두고 몇 성이 필요한지를 오른쪽에 적는다.
      */}
      <Row between style={{ marginBottom: SP.xs }}>
        <T size={11} bold>액티브 스킬</T>
        <T size={9} dim="dim">{`${c.star}성 — ${openCount}개 열림`}</T>
      </Row>

      {list.map((sk, slot) => {
        const unlocked = skillOpen(c, slot);
        const on = open === sk.name;
        const sec = skillEverySec(c, sk);
        /* 한 대의 피해. **계산과 같은 함수**를 쓴다 — 적어 둔 수와 박히는 수가 갈리면 안 된다 */
        /*
          맞는 쪽은 안 본다 (`NO_ARMOR`) — 적마다 다른 값을 여기서 정할 수
          없으니 "맨몸에 몇 들어가나" 를 적는다. 계산 쪽 `skillDamage` 와
          같은 값이다.
        */
        const hit = strikeFor(skillBase(st, sk, sup), 1, NO_ARMOR, blowOf(c.id, sk));
        const pierce = pierceText(sk, c.id);
        return (
          <View key={sk.name} style={unlocked ? undefined : { opacity: O.dim }}>
            <ListItem
              title={sk.name}
              sub={sk.desc}
              /*
                아이콘은 `SkillDef.art` 를 쓴다. 아직 그림이 없으면 빈 자리로
                남고(`Sprite` 의 대체 처리) 목록은 그대로 읽힌다 — 그림이
                도착하는 순간 저절로 붙는다.
              */
              left={<Sprite set="skill_icon" name={sk.art} size={22} />}
              /*
                쿨타임 옆에 **피해 종류**를 붙인다. 회복형은 아무도 안 때리므로
                뺀다 — 거기 "마법" 이 붙으면 마법으로 때리는 기술로 읽힌다.
              */
              right={unlocked ? (
                <Row gap={3}>
                  {sk.pick !== 'none' && <Tag label={DMG_NAME[sk.dmg]} />}
                  {/*
                    ── 초가 아니라 **평타 몇 대**다 ──

                    쿨타임이라는 것이 이 게임에 없다. 기술은 평타를 쳐서
                    코스트를 모아 나가므로 (`SkillDef.cost`), 실제 간격은
                    그 사람이 얼마나 빨리 치느냐에 걸려 있다.

                    초로 적으면 "5.4초" 같은 숫자가 뜨는데, 둔화에 걸리거나
                    신속이 붙는 순간 그 숫자가 거짓말이 된다. 평타 대수는
                    무엇이 걸리든 안 변한다.
                  */}
                  <Tag label={`평타 ${sk.cost}대`} />
                </Row>
              ) : (
                /* 잠긴 것에는 쿨타임 대신 **열리는 조건**을 적는다 */
                <Tag label={`${skillNeeds(slot)}성 필요`} />
              )}
              onPress={() => setOpen(on ? null : sk.name)}
            />
            {on && (
              <View style={[BORDER, { padding: SP.sm, marginBottom: SP.xs }]}>
                <KV
                  k="스킬 코스트"
                  v={`${sk.cost} (평타 한 번에 1 씩 찹니다)`}
                />
                <KV k="빨라야" v={`평타 ${sk.cost}대마다 (지금 ${sec.toFixed(1)}초)`} />
                <KV k="대상" v={targetText(sk)} />
                {/*
                  ── 때리지도 채우지도 않는 기술들 ──

                  도발·광란·정화는 수치가 아니라 **무슨 일이 일어나나**로
                  적어야 읽힌다. "공격력의 0%" 를 적어 두면 고장 난 기술로
                  보인다.
                */}
                {!!sk.taunt && (
                  <KV k="지속" v={`${sk.taunt}초 동안 적 전부가 이 사람만 노립니다`} />
                )}
                {!!sk.self && (
                  <KV
                    k="자기 강화"
                    v={`${sk.self.sec}초간 공격속도 ${sk.self.mul}배`
                      + (sk.self.noCharge ? ' (그동안 코스트가 안 찹니다)' : '')}
                  />
                )}
                {!!sk.foeHex && (
                  <KV
                    k="맞은 적에게"
                    v={`${sk.foeHex.sec}초간 받는 회복량 `
                      + `${Math.round((1 - sk.foeHex.mul) * 100)}% 감소`}
                  />
                )}
                {sk.heal > 0 ? (
                  <>
                    <KV
                      k="회복량"
                      v={`내 최대 체력의 ${Math.round(sk.healPct * 100)}% + 내 공격력의 ${Math.round(sk.heal * 100)}%`}
                    />
                    <KV k="한 명당" v={`+${Math.round(st.hp * sk.healPct + st.atk * sk.heal)}`} />
                    <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
                      쓰러진 사람은 안 채웁니다 — 회복이 전멸을 되돌리면 아무도
                      죽지 않습니다.
                    </T>
                  </>
                ) : (
                  <>
                    {/*
                      식을 그대로 보여 준다. "평타의 몇 배" 로만 적으면 방어력이
                      섞이는 기술(이졸데의 검기)에서 수가 안 맞는다.
                    */}
                    <KV
                      k="계산"
                      v={sk.defMul > 0
                        ? `공격력의 ${Math.round(sk.mul * 100)}% + 방어력의 ${Math.round(sk.defMul * 100)}%`
                        : `공격력의 ${Math.round(sk.mul * 100)}%`}
                    />
                    <KV k="피해 종류" v={`(${DMG_NAME[sk.dmg]})`} />
                    {!!pierce && <KV k="관통" v={pierce} />}
                    <KV k="한 대" v={`${hit}`} />
                    {sk.hits > 1 && <KV k="발수" v={`${sk.hits}발`} />}
                    {sk.targets > 0 && <KV k="최대 대상" v={`${sk.targets}`} />}
                    {st.crit > 0 && (
                      <KV k="치명타" v={`${Math.round(st.crit * 100)}% · ${Math.round(st.critDmg * 100)}%`} />
                    )}
                    {/*
                      별표를 쓰면 안 된다 — 여기는 마크다운이 아니라 화면이라
                      `**...**` 가 글자 그대로 뜬다. 강조는 문장 순서로 낸다.
                    */}
                    <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
                      {`곁에 선 보조까지 셈한 값이고, 아무것도 안 막는 상대 기준입니다. `
                        + `실제로는 상대의 ${sk.dmg === 'magic' ? '마법저항력' : '방어력'}만큼 `
                        + '깎여서 들어가고, 총합은 그때 서 있는 적 수에 따라 달라집니다.'}
                    </T>
                  </>
                )}
                {sk.opt && <CleanseOption who={c.id} slot={slot} />}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}
