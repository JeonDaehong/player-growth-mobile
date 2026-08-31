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
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import {
  CHARS, DMG_NAME, NO_ARMOR, OwnedChar, SkillDef, blowOf, skillsOf, statOf, swingMs,
} from '@/core/chars';
import { Party, members, supportMul } from '@/core/party';
import { skillBase, strikeFor } from '@/core/autoBattle';
import { KV, ListItem, Row, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { BORDER, SP } from '@/ui/theme';

/**
 * 이 기술이 몇 초마다 나가나.
 *
 * 쿨타임이 **초로 잡혀 있지 않다.** `every` 번째 공격마다 평타 대신 나가므로,
 * 실제 간격은 그 사람의 공격 속도에 걸려 있다 — 빠른 사람은 같은 `every` 라도
 * 더 자주 쓴다. 화면에는 초로 적어야 비교가 되므로 여기서 환산한다.
 *
 * (그래서 강화로 공격력이 올라도 이 값은 안 변한다. `spd` 는 안 자란다.)
 */
export function skillEverySec(c: OwnedChar, sk: SkillDef): number {
  return (swingMs(statOf(c).spd) * sk.every) / 1000;
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

  const list = skillsOf(c.id);
  const st = statOf(c);
  /* 보조가 곁에 있으면 기술도 같이 오른다 — 전투가 쓰는 것과 같은 값이다 */
  const sup = supportMul(party, chars);

  return (
    <>
      <Row between style={{ marginBottom: SP.xs }}>
        <T size={11} bold>스킬</T>
        <T size={9} dim="dim">눌러서 자세히</T>
      </Row>

      {list.map((sk) => {
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
          <View key={sk.name}>
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
              right={(
                <Row gap={3}>
                  {sk.pick !== 'none' && <Tag label={DMG_NAME[sk.dmg]} />}
                  <Tag label={`${sec.toFixed(1)}초`} />
                </Row>
              )}
              onPress={() => setOpen(on ? null : sk.name)}
            />
            {on && (
              <View style={[BORDER, { padding: SP.sm, marginBottom: SP.xs }]}>
                <KV k="쿨타임" v={`${sec.toFixed(1)}초 (공격 ${sk.every}회마다)`} />
                <KV k="대상" v={targetText(sk)} />
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
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}
