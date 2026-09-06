/**
 * ── 캐릭터 수치 절 ── 창에서도 화면에서도 같은 것을 그린다.
 *
 * 캐릭터 창 안에 박혀 있었다 (`CharPopup`). 영웅 관리 화면이 같은 수치를
 * 보여 주게 되면서 (`HeroManage`) 떼어 냈다 — 두 벌로 두면 한쪽만 고쳐지고,
 * 그때부터 같은 사람의 공격력이 화면마다 다르게 뜬다.
 *
 * ## 기준은 **맨 몸**이다
 *
 * `c` 는 대형에 앉힌 몸일 수 있다 (`seatRows`). 그러면 `statOf(c)` 에 줄
 * 배수가 이미 얹혀 있어서 **대형이 준 몫이 화면에서 통째로 사라진다** —
 * 뒷줄에 세워 공격력이 오르는데 창에 뜨는 숫자는 그냥 그 숫자다.
 *
 * 줄을 떼어 낸 몸을 기준으로 두고, 줄이 준 몫부터 지금 걸린 것까지를 전부
 * 괄호 하나에 담는다 (`deltaText`) — 초록은 오른 것, 붉은색은 깎인 것이다.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import {
  DMG_NAME, OwnedChar, anyPierce, blowOf, statOf,
} from '@/core/chars';
import { Party, hpOf, livingMembers } from '@/core/party';
import { critOf, deltaText, liveArmor, liveAtk, liveSpd } from '@/core/passives';
import { hexOf } from '@/core/status';
import { KV } from '@/ui/atoms';

export function CharStats({ c, party, chars }: {
  c: OwnedChar;
  party: Party;
  chars: Record<string, OwnedChar>;
}) {
  /*
    지금 남은 체력과 걸려 있는 것들.

    수치 옆에 **지금 얼마나 오르내렸나**를 적으려면 둘 다 필요하다. 비앙카의
    공격속도는 남은 체력이 정하고(`frenzy`), 둔화·약화·파쇄는 걸려 있는 것이
    정한다.
  */
  const hpMap = useGame((s) => s.battle.hp);
  const hexMap = useGame((s) => s.battle.hex);

  const alive = livingMembers(party, chars, hpMap);
  const hex = hexOf(hexMap, c.id);
  const cur = hpOf(c, hpMap);
  /* 줄을 떼어 낸 몸 — 괄호가 대형이 준 몫까지 말하게 (머리말) */
  const base = statOf({ ...c, row: undefined });
  /* 대형까지 얹은 몸 — 체력 막대의 최대치가 이것이다 (전투가 보는 값) */
  const seat = statOf(c);
  const now = cur > 0 ? {
    atk: Math.round(liveAtk(c, alive, hex)),
    spd: liveSpd(c, cur, alive, hex),
    ...liveArmor(c, hex),
  } : null;
  /* 집중이 올려 준 몫까지 — 굴리는 쪽과 같은 함수다 (`rollCrit`) */
  const critNow = critOf(base.crit, hex);

  return (
    <View>
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
      {/*
        ── 종류는 **라벨 쪽**에 붙는다 ──

        값 뒤에 있었다 (`152 (+28) (물리)`). 그러면 오른쪽 끝이 숫자 ·
        차이 · 종류 셋으로 길어지고, 정작 눈이 먼저 가야 하는 숫자가
        가운데에 끼인다.

        왼쪽은 **안 변하는 쪽**이다. 이 사람이 물리로 때리는지 마법으로
        때리는지는 판이 도는 동안 안 바뀌므로 이름 옆이 맞고, 그 자리에
        있으면 아래 방어력 · 마법저항력 두 줄과 세로로 이어져 읽힌다.
      */}
      <KV
        k={`공격력 (${DMG_NAME[blowOf(c.id).type]})`}
        v={`${base.atk}`}
        delta={now ? deltaText(base.atk, now.atk) : ''}
      />
      {/*
        공격속도가 빠져 있었다. 이 게임에서 **스킬 주기까지 정하는 값**이라
        (`SkillDef.every` 가 횟수로 도므로) 없으면 왜 어떤 사람이 기술을
        자주 쓰는지 설명이 안 된다.

        **실제 간격(`1333ms 마다`)은 뺐다.** 배수만으로는 0.8 이 빠른지
        느린지 모른다고 봤는데, 이 줄에서 견주는 것은 애초에 **넷끼리**다 —
        리안느 1.1 과 아녜스 0.5 를 나란히 보면 그걸로 충분하고, ms 는
        그 판단에 아무것도 안 보태면서 줄만 길게 만들었다.
        (`core/chars` 의 `swingMs` 는 그대로 있다.)
      */}
      <KV
        k="공격속도"
        v={`${base.spd}`}
        delta={now ? deltaText(base.spd, now.spd, 1) : ''}
      />
      {/*
        체력은 **대형이 올린 것까지가 최대치**다 (`seat`). 전투가 그 값을
        최대로 보므로 (`hpOf`), 여기서 맨 몸 수치를 최대로 적으면 앞줄에
        선 사람이 가득 찬 채로도 넘쳐 보인다.
      */}
      <KV
        k="체력"
        v={`${cur > 0 ? `${Math.ceil(cur)} / ` : ''}${seat.hp}`}
        delta={deltaText(base.hp, seat.hp)}
      />
      <KV
        k="방어력"
        v={`${base.def}`}
        delta={now ? deltaText(base.def, now.def) : ''}
      />
      <KV
        k="마법저항력"
        v={`${base.res}`}
        delta={now ? deltaText(base.res, now.res) : ''}
      />
      {/*
        ── 치명타 두 줄은 **늘 뜬다** ──

        여태 `crit > 0` 일 때만 뜨게 해 뒀다. 그런데 넷 다 기본 확률이
        0 이라 (`core/chars` 의 `CHARS`) 이 줄은 **아무에게도 안 떴다** —
        치명타라는 것이 이 게임에 있는지조차 창에서 알 수 없었다.

        0% 인 것과 줄이 없는 것은 다른 말이다. 앞엣것은 "지금은 안
        터진다, 올리면 터진다" 이고 뒤엣것은 아무 말도 아니다. 리안느의
        정령의 노래가 거는 집중이 확률을 올려 주므로 (`st_focus`),
        **올릴 수 있는 축**이라는 것이 보여야 한다.

        두 줄로 나눈다. `30% · 피해 200%` 한 줄이면 두 숫자가 서로
        다른 것을 재는데 (하나는 얼마나 자주, 하나는 얼마나 세게) 한
        덩어리로 읽힌다.

        확률에는 집중이 **더해진다** (배수가 아니다 — `rollCrit` 참고).
        그래서 여기 괄호도 지금 실제로 굴리는 확률과 같은 값이다.
      */}
      <KV
        k="치명타 확률"
        v={`${Math.round(base.crit * 100)}%`}
        delta={now ? deltaText(base.crit * 100, critNow * 100) : ''}
      />
      <KV
        k="치명타 피해"
        v={`${Math.round(base.critDmg * 100)}%`}
      />
      {(() => {
        /* 관통은 **가진 사람에게만** 뜬다 — 0 짜리 줄이 넷에게 다 붙으면 잡음이다 */
        const p = anyPierce(c.id);
        const on: string[] = [];
        if (p.phys) on.push('물리관통');
        if (p.magic) on.push('마법관통');
        return on.length ? <KV k="관통" v={on.join(' · ')} /> : null;
      })()}
      {/*
        ── 여기 있던 설명 두 문단을 걷었다 ──

        "방어력은 물리 피해를 그 수만큼 깎습니다…" 와 "초록 (+) 과 붉은
        (−) 은…" 이었다. 둘 다 맞는 말인데, 이 절은 **넷을 견주려고
        여는 자리**다 — 수치 여덟 줄을 보러 와서 다섯 줄짜리 설명을
        두 번 지나야 했다.

        규칙은 한 번 알면 되는 것이고, 알 자리는 여기가 아니다.
        (`core/chars` 의 `Armor`·`Blow` 에 그대로 적혀 있다.)

        대신 화면이 스스로 말하게 뒀다 — 공격력 옆의 `(물리)`·`(마법)`
        이 방어력·마법저항력 두 줄과 이어지고, 아래 "지금 걸려 있는 것"
        이 초록·붉은 괄호가 어디서 왔는지를 이름으로 말한다. 저건 설명이
        아니라 **지금 실제로 일어나는 일**이라 남긴다.
      */}
      {/*
        ── 여기 "지금 걸려 있는 것" 상자가 있었다 ──

        `앞줄 (체력 +10% · 방어 +50%) · 리안느의 숲의 노래 · 아녜스의
        헌신 · 신속` 처럼 켜져 있는 것을 전부 이름으로 늘어놓았다.
        괄호 안의 숫자가 **얼마나**만 말하고 **왜**는 말하지 않으니
        채워 주려던 것인데, 넷이 서 있으면 늘 서너 줄이라 수치 절보다
        길었다.

        초록·붉은 괄호는 그 자체로 "지금 뭔가 걸려 있다" 를 말한다.
        무엇이 걸렸는지는 파티 칸의 로고 줄이 이미 그리고 있고
        (`StatusRow`), 거기가 그걸 보는 자리다.
      */}
    </View>
  );
}
