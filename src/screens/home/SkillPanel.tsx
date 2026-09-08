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
import React, { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  CHARS, DMG_NAME, NO_ARMOR, OwnedChar, SkillDef, blowOf, skillNeeds, skillOpen,
  skillsFor, statOf, swingMs, targetName,
} from '@/core/chars';
import { PassiveDef, passiveOf } from '@/core/passives';
import { nodeOn } from '@/core/skillTree';
import { Party, allyAtk, members } from '@/core/party';
import { skillBase, strikeFor } from '@/core/autoBattle';
import {
  CLEANSE_OPTS, CleanseOpt, OPT_DESC, OPT_NAME, cleanseOptOf,
} from '@/core/skillOpt';
import { HEX_TICK_MS, StatusId, hexText } from '@/core/status';
import { KV, ListItem, Row, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { SkillDemo } from './SkillDemo';
import { Sprite } from '@/ui/Sprite';
import { BLACK, BORDER, FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';

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
  /*
    **코스트 + 1 이다.** 기술이 나가는 스윙은 평타가 아니라 칸을 안 채우므로
    (`core/chars` 의 `swingPlan`), 한 바퀴는 평타 `cost` 번에 기술 한 번이다 —
    코스트 4 면 다섯 스윙마다 한 번이다.

    여태 `cost` 만 곱했다. 그때는 기술이 네 번째 평타를 **잡아먹고** 나갔으므로
    맞는 값이었는데, 그 차례를 고치면서 여기도 한 칸 늘어난다.
  */
  return (swingMs(statOf(c).spd) * (sk.cost + 1)) / 1000;
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

/**
 * 펴 놓은 것이 **패시브**임을 나타내는 열쇠.
 *
 * 기술 이름과 같은 칸을 쓰므로 (`open`) 이름과 안 겹치는 값이어야 한다 —
 * 기술 이름에 대괄호가 들어갈 일은 없다.
 */
const PV_KEY = '[passive]';

/**
 * ── 기술 한 칸 ── 칸 모드에서만 쓴다 (`SkillPanel` 의 `grid`).
 *
 * **이름이 맨 위, 그 아래 액자에 로고, 그 아래 값** — 받은 시안 그대로다
 * (`assets/2026-09-06/123123.jpg`).
 *
 * 이름을 위로 올린 이유가 있다. 로고는 아직 그림이 안 온 것도 있어서 빈
 * 자리가 나는데, 이름이 아래에 있으면 그때 칸이 **위가 텅 빈 상자**로
 * 보인다. 이름이 위에 있으면 로고가 없어도 칸이 무엇인지 읽힌다.
 *
 * 로고를 액자에 넣는 것도 같은 이유다 — 액자가 있으면 "여기 그림이 들어간다"
 * 가 보이고, 없으면 그냥 여백이다.
 *
 * 그 셋뿐이다. 칸이 셋씩 서므로 폭이 화면의 3분의 1 이고, 거기에 피해 종류
 * 까지 넣으면 이름이 잘린다. 자세한 것은 누르면 아래에 펴진다.
 *
 * 고른 칸은 테두리가 밝아지고 면이 한 단 올라온다. 흑백에서 "지금 이걸
 * 보고 있다" 를 말하는 제일 조용한 방법이다.
 */
function SkCard({ set, art, name, tag, on, off, onPress }: {
  set: string;
  art: string;
  name: string;
  tag: string;
  /** 지금 펼쳐 놓은 칸인가 */
  on: boolean;
  /** 아직 못 쓰거나 꺼진 것 — 지우지 않고 흐리게 남긴다 */
  off?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        BORDER,
        {
          /* 셋이 한 줄 — 넷째가 있으면 다음 줄로 넘어간다 */
          flexGrow: 1,
          flexBasis: '30%',
          minWidth: 84,
          paddingVertical: SP.sm,
          paddingHorizontal: SP.xs,
          alignItems: 'center',
          gap: 3,
          borderColor: on ? LINE.hi : LINE.mid,
          backgroundColor: on || pressed ? SURF.up : 'transparent',
          opacity: off ? O.dim : 1,
        },
      ]}
    >
      <T size={FS.tiny} bold center numberOfLines={1}>{name}</T>
      {/* 액자 — 로고가 아직 없어도 "여기 그림이 들어간다" 가 보인다 */}
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: R.sm,
          borderWidth: 1,
          borderColor: LINE.low,
          backgroundColor: SURF.down,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sprite set={set} name={art} size={24} />
      </View>
      <T size={9} dim="dim" numberOfLines={1}>{tag}</T>
    </Pressable>
  );
}

/**
 * ── 이 기술이 **무슨 일을 하나** ── 줄 목록을 데이터에서 짓는다.
 *
 * 여태 창이 손으로 적었다. 그래서 그 자리에 처음 온 기술의 문장이 굳어
 * 버렸고, 종류가 바뀌어도 문장은 안 바뀌었다 — 함성은 공격력을 올리는데
 * `공격속도 1.3배` 라고 떴고, 신의 심판은 적 공격력을 깎는데 `받는 회복량
 * 20% 감소` 라고 떴다.
 *
 * **무슨 뜻인지는 한 곳만 안다** (`core/status` 의 `hexText`). 여기는 그것을
 * 누구에게 · 몇 초 동안 거는지만 붙인다. 새 상태가 생겨도 이 함수는 안 고친다.
 *
 * 값이 없는 칸은 줄이 안 생긴다 — 안 하는 일을 `없음` 으로 적으면 목록이
 * 안 하는 일로 길어진다.
 */
function effectRows(sk: SkillDef): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [];
  const secs = (sec: number, id: StatusId, mul: number) => `${sec}초간 ${hexText(id, mul)}`;

  if (sk.taunt) out.push({ k: '도발', v: `${sk.taunt}초 동안 적 전부가 이 사람만 노립니다` });

  /* 자기에게 — 걸리는 것이 여럿일 수 있다 (비앙카의 불굴의 의지는 셋) */
  const mine = [...(sk.self ? [sk.self] : []), ...(sk.selfAlso ?? [])];
  mine.forEach((h, i) => out.push({
    k: i === 0 ? '자신에게' : ' ',
    v: secs(h.sec, h.id, h.mul)
      + (sk.self && h === sk.self && sk.self.noCharge ? ' (그동안 코스트가 안 찹니다)' : ''),
  }));

  /* 아군 전체에게 */
  const ours = [...(sk.party ? [sk.party] : []), ...(sk.partyAlso ?? [])];
  ours.forEach((h, i) => out.push({
    k: i === 0 ? '아군 전체에게' : '  ',
    v: secs(h.sec, h.id, h.mul),
  }));
  if (sk.partyProc) {
    out.push({
      k: '아군이 때릴 때',
      v: `${sk.partyProc.sec}초간 ${Math.round(sk.partyProc.odds * 100)}% 확률로 `
        + `공격력의 ${Math.round(sk.partyProc.pct * 100)}%가 한 번 더`,
    });
  }

  /* 보호막 — 체력 주머니라 상태가 아니다 (`BattleState.ward`) */
  if (sk.ward) {
    out.push({
      k: '보호막',
      v: `아군 전체에게 내 최대 체력의 ${Math.round(sk.ward.pct * 100)}%`
        + ` (${sk.ward.sec}초, 다 깎이면 사라집니다)`,
    });
    if (sk.ward.def > 0) {
      out.push({ k: '두르고 있는 동안', v: `방어력·마법저항력 +${sk.ward.def}` });
    }
    if (sk.ward.back > 0) {
      out.push({
        k: '막아 낸 만큼',
        v: `${Math.round(sk.ward.back * 100)}%를 때린 적에게 되돌립니다`,
      });
    }
  }

  /* 걷어내기 */
  if (sk.cleanse) {
    out.push({
      k: '정화',
      v: sk.cleanseAll
        ? '아군 전체에게서 걷어냅니다'
        : '한 명에게서 걷어냅니다 (무엇을 걷을지는 아래에서 고릅니다)',
    });
  }
  if (sk.cleanseGift) {
    out.push({ k: '걷어낸 사람에게', v: secs(sk.cleanseGift.sec, sk.cleanseGift.id, sk.cleanseGift.mul) });
  }

  /* 맞은 적에게 — 최대 둘 (`foeHex` · `foeHex2`) */
  const theirs = [sk.foeHex, sk.foeHex2].filter(Boolean) as { id: StatusId; sec: number; mul: number }[];
  theirs.forEach((h, i) => out.push({
    k: i === 0 ? '맞은 적에게' : '   ',
    v: secs(h.sec, h.id, h.mul),
  }));
  if (sk.foeDot) {
    out.push({
      k: '불바다',
      v: `${sk.foeDot.sec}초간 ${(HEX_TICK_MS / 1000).toFixed(1)}초마다 `
        + `공격력의 ${Math.round(sk.foeDot.pct * 100)}%가 ${DMG_NAME[sk.foeDot.dmg]} 피해로`,
    });
  }

  /* 겹쳐서 꽂히나 — 적이 적을 때 남는 발이 어디로 가나 */
  if (sk.stack) {
    out.push({ k: '남는 발', v: '적이 모자라면 같은 적에게 겹쳐서 꽂힙니다' });
  }
  return out;
}

/**
 * ── 기술 하나의 수치 전부 ── 창 둘이 같이 쓴다.
 *
 * 여기 있던 것을 **떼어 냈다.** 여태 기술 목록을 펼친 자리에만 있었는데,
 * 지금은 창에서도 같은 것을 보여야 한다 (영웅 관리에서 기술을 누르면 뜨는
 * 창, 그리고 스킬 트리에서 자리를 누르면 뜨는 창).
 *
 * **한 벌만 둔다.** 같은 표를 두 곳에 그리면 언젠가 한쪽만 고쳐지고, 그러면
 * 창에 적힌 피해와 목록에 적힌 피해가 갈린다 — 화면이 스스로 거짓말하는 것이라
 * 제일 나쁜 종류다.
 *
 * 계산도 여기서 한다. 부르는 쪽이 `hit` 이나 `sec` 을 넘겨주게 두면 그 계산이
 * 부르는 곳마다 하나씩 생긴다.
 */
export function SkillDetail({ c, party, chars, sk, slot, readOnly }: {
  c: OwnedChar;
  party: Party;
  chars: Record<string, OwnedChar>;
  sk: SkillDef;
  /** 몇 번째 기술인가 — 정화의 "언제 쓸까" 가 이 번호를 쓴다 */
  slot: number;
  /** 보기만 하는 창인가 (`SkillPanel` 의 같은 이름) */
  readOnly?: boolean;
}) {
  const st = statOf(c);
  const sec = skillEverySec(c, sk);
  /*
    한 대의 피해를 여기서 셈했었다 (`strikeFor` + `NO_ARMOR`). 그 줄을
    걷으면서 계산도 같이 걷었다 — 아래 `계산` 줄이 식을 그대로 보여 준다.
  */
  const pierce = pierceText(sk, c.id);

  return (
    <>
      {/*
        ── 한 줄 설명은 **여기 없다** ──

        창이 맨 위에서 이미 한 번 적는다 (`SkillPopup` 의 `head`). 여기서도
        적으니 같은 문장이 도는 그림을 사이에 두고 위아래로 두 번 떴다.
      */}
      {/*
        ── 도는 그림은 **여기 없다** ──

        한동안 이 자리에 시연 무대가 있었다 (`SkillDemo`). 걷어서
        스킬 트리로 옮겼다 (`SkillTreePopup`).

        여기는 **지금 쓰는 기술의 수치를 읽는 자리**다. 아래 열 줄이
        전부 숫자이고, 숫자는 견주는 데 쓴다. 반면 그림은 "이걸 찍을까"
        를 정하는 데 쓰는 것이라, 고르는 자리에 있어야 값이 산다 —
        여기서는 이미 고른 것을 볼 뿐이라 고칠 것이 없다.

        그리고 무대가 넷이 한꺼번에 돌고 있었다. 목록을 펼 때마다
        작은 사람이 칼을 휘두르는 상자가 하나씩 붙으니, 정작 읽으러 온
        숫자가 그만큼 아래로 밀렸다.
      */}
      {/*
        괄호 안에 무엇으로 차는지를 적었었다 (`평타 한 번에 1 씩 찹니다`).
        한 번 알면 되는 규칙인데 기술을 열 때마다 네 번 읽게 된다.
      */}
      <KV k="스킬 코스트" v={`${sk.cost}`} />
      {/*
        바로 위에 코스트가 적혀 있으므로 여기서는 **초만** 말한다.
        `코스트 4 마다` 를 한 번 더 적으면 같은 말이 두 줄이다.

        `빨라야 4.0초마다` 였다. 조건이 붙은 기술은 다 차도 안 나가므로
        (정화) 상한이라는 뜻을 담으려던 말인데, 그건 정화 한 자리의 사정이라
        열일곱 줄에 다 붙일 값이 아니었다.
      */}
      <KV k="간격" v={`${sec.toFixed(1)}초마다`} />
      {/*
        누구에게 걸리나 — **`core/chars` 가 안다** (`targetName`).

        여기서 `pick` 을 읽어 적던 시절, 적을 안 고르는 기술 아홉이 전부
        `아군 전체` 로 떴다. 함성은 자기 공격력만 오르고 도발은 적을 끌어
        오는데도.
      */}
      <KV k="대상" v={targetName(sk)} />
      {/*
        ── 때리지도 채우지도 않는 기술들 ──

        도발·정화·버프는 수치가 아니라 **무슨 일이 일어나나**로 적어야
        읽힌다. "공격력의 0%" 를 적어 두면 고장 난 기술로 보인다.

        여기 줄들은 전부 `effectRows` 가 **데이터에서 짓는다.** 손으로 적던
        시절에는 두 줄이 통째로 거짓말을 하고 있었다 —

          이졸데의 함성   격노(공격력 1.3배)인데 `공격속도 1.3배` 로 떴다
          아녜스의 심판   약화(적 공격력 20% 감소)인데 `받는 회복량 20% 감소`

        둘 다 그 자리에 처음 온 기술의 문장을 그대로 두고 종류만 바뀐 것이다.
        상태가 스물둘인데 문장이 하나면 스물한 번 틀린다. 지금은 무슨 뜻인지를
        `core/status` 의 `hexText` 한 곳에서만 안다.
      */}
      {effectRows(sk).map((r) => <KV key={r.k} k={r.k} v={r.v} />)}
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
          <KV k="피해 종류" v={DMG_NAME[sk.dmg]} />
          {!!pierce && <KV k="관통" v={pierce} />}
          {sk.hits > 1 && <KV k="발수" v={`${sk.hits}발`} />}
          {sk.targets > 0 && <KV k="최대 대상" v={`${sk.targets}`} />}
          {/*
            ── `한 대` 와 `치명타` 두 줄을 걷었다 ──

            `한 대` 는 아무것도 안 막는 상대에게 들어가는 값이라 실제로 뜨는
            숫자와 늘 달랐고, 그 차이를 설명하는 꼬리말 세 줄이 뒤따라 붙었다.
            창에서 제일 긴 글이 **화면에서 한 번도 안 맞는 숫자의 변명**이었던
            셈이다.

            `치명타` 는 넷 다 기본 0% 라 늘 `0%` 였다. 올라가는 자리는
            리안느의 정령의 노래 하나뿐이고, 그 이야기는 그 기술 창에서 한다.

            위의 `계산` 줄이 이미 식을 그대로 보여 준다 — 견주는 데는 그것이
            낫다. 맞는 쪽이 얼마나 막는지는 여기서 알 수 있는 값이 아니다.
          */}
        </>
      )}
    </>
  );
}

/**
 * ── 기술 하나를 열어 본 창 ── 도는 그림과 수치 전부.
 *
 * 두 곳이 같이 쓴다.
 *
 *   영웅 관리   `현재 채용중인 스킬` 칸을 누를 때 (`SkillPanel` 의 `grid`)
 *   스킬 트리   자리를 누를 때 (`SkillTreePopup` 의 `NodePopup`)
 *
 * 다른 것은 **아래에 무엇이 붙느냐** 하나다. 트리에서는 적용·취소가 붙고,
 * 영웅 관리에서는 붙지 않는다 — 거기는 이미 쓰고 있는 기술을 보는 자리라
 * 적용할 것이 없다. 그래서 그 자리를 `footer` 로 비워 두었다.
 *
 * 창을 쓰는 까닭: 여태 칸 아래에 펼쳐 붙였는데, 그러면 도는 그림과 수치
 * 열 줄이 화면을 밀어내서 **누른 칸이 화면 밖으로 나갔다.** 무엇을 눌렀는지
 * 안 보이는 채로 그 설명을 읽게 된다.
 */
export function SkillPopup({
  c, party, chars, sk, slot, title, desc, about, onClose, footer,
}: {
  c: OwnedChar;
  party: Party;
  chars: Record<string, OwnedChar>;
  /** 보여 줄 기술. 없으면 그림도 수치도 없이 설명과 `footer` 만 뜬다 */
  sk: SkillDef | null;
  slot: number;
  title: string;
  /**
   * 맨 윗줄을 **갈아 끼운다.** 없으면 기술 제 설명(`sk.desc`)이 온다.
   *
   * 패시브 자리 때문에 생겼다. 저기서 `sk` 는 **이 자리가 손보는 기술**이지
   * 이 자리 자신이 아니다 — 수호신의 가호를 눌렀는데 맨 위에 수호의 결의
   * 설명이 적혀 있으면, 창의 제목과 첫 줄이 서로 다른 것을 말한다.
   */
  desc?: string;
  /**
   * 아래 그림과 수치가 **딴것의 것**임을 밝힌다 — 손보는 기술의 이름.
   *
   * 패시브 자리에서만 온다. 밝히지 않으면 저 수치가 이 패시브의 수치로
   * 읽히는데, 패시브에는 코스트도 대상도 없다.
   */
  about?: string;
  onClose: () => void;
  /** 창 아래에 붙일 것 — 트리의 적용·취소 */
  footer?: ReactNode;
}) {
  /* 갈아 끼운 것이 먼저다 — 없을 때만 기술 제 설명을 쓴다 */
  const head = desc ?? sk?.desc ?? '';
  return (
    <Popup visible title={title} onClose={onClose}>
      {!!head && (
        <T size={FS.body} dim="sub" style={{ marginBottom: SP.sm }}>{head}</T>
      )}
      {!!sk && (
        <>
          {/*
            ── 여기서부터는 **딴것의 이야기** ── 패시브 자리에서만 붙는다.

            줄 하나를 긋고 이름을 적는다. 안 그으면 위의 설명과 아래의 수치가
            한 덩어리로 읽혀서, 코스트 10 이 이 패시브의 코스트로 보인다.
          */}
          {!!about && (
            <View style={{ marginBottom: SP.sm }}>
              <View style={{ height: 1, backgroundColor: LINE.low, marginBottom: SP.sm }} />
              <T size={FS.tiny} bold>{`손보는 기술 — ${about}`}</T>
              <T size={9} dim="dim">
                {`아래 그림과 수치는 이 자리를 찍은 뒤의 ${about} 입니다.`}
              </T>
            </View>
          )}
          {/*
            ── 무엇처럼 생겼나가 먼저 ──

            아래 열 줄은 전부 숫자다. 숫자는 견주는 데 쓰고 그림은 "이게
            무슨 기술인가" 를 아는 데 쓰는데, 뒤엣것이 먼저다.
          */}
          <SkillDemo c={c} sk={sk} hit={0} />
          <SkillDetail c={c} party={party} chars={chars} sk={sk} slot={slot} readOnly />
        </>
      )}
      {footer}
    </Popup>
  );
}

/**
 * ── 기본 패시브를 열어 본 창 ── 칸 모드에서만 쓴다 (`SkillPanel` 의 `grid`).
 *
 * 여태 칸 아래에 펼쳐 붙었다. 그런데 **같은 줄의 액티브 칸들은 창을 연다** —
 * 하나는 아래로 펴지고 하나는 창이 뜨면, 같은 격자 안에서 누르는 법을 두 번
 * 배워야 한다. 셋 중 하나만 다르게 움직이는 것이 규칙일 리가 없으니 그건
 * 고장으로 읽힌다.
 *
 * 창이 하는 일이 하나 더 있다. 펼쳐 붙일 때는 설명 위에 이름이 없었다 —
 * 누른 칸이 어느 것이었는지는 **격자를 다시 봐야** 알았다. 창은 제목으로
 * 그것을 들고 있는다.
 *
 * 그림도 수치도 없다. 패시브는 코스트도 대상도 없어서 적을 수가 없고, 도는
 * 그림은 더더욱 없다 — 저건 누를 때 일어나는 일이 아니라 **늘 그런 사람**이다.
 */
function PassivePopup({ pv, off, onClose }: {
  pv: PassiveDef;
  /** 파쇄의 태세가 껐나 (`core/passives` 의 `regenOf`) */
  off: boolean;
  onClose: () => void;
}) {
  return (
    <Popup visible title={pv.name} onClose={onClose}>
      <Row gap={SP.sm} style={{ alignItems: 'flex-start' }}>
        {/* 액자 — 그림이 아직 없어도 "여기 그림이 들어간다" 가 보인다 (`SkCard` 와 같다) */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: R.sm,
            borderWidth: 1,
            borderColor: LINE.low,
            backgroundColor: SURF.down,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprite set="passive_icon" name={pv.art} size={28} />
        </View>
        <View style={{ flex: 1 }}>
          <Row gap={4} style={{ marginBottom: SP.xs }}>
            <Tag label={off ? '꺼짐' : '패시브'} />
          </Row>
          <T size={FS.body} dim="sub">{pv.text}</T>
        </View>
      </Row>
      {/*
        꺼진 것은 **이유를 적는다.** 저건 규칙이 아니라 지금 이 사람에게
        일어난 일이라, 안 적으면 설명만 읽고 걸려 있는 줄 안다.
      */}
      {off && (
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.md }}>
          파쇄의 태세를 찍어서 꺼졌습니다. 되돌리면 다시 걸립니다.
        </T>
      )}
    </Popup>
  );
}

export function SkillPanel({
  c, party, chars, readOnly, grid,
}: {
  c: OwnedChar;
  party: Party;
  chars: Record<string, OwnedChar>;
  /**
   * **보기만 하는 창인가** (`CharPopup` 의 같은 이름).
   *
   * 두 가지를 끈다.
   *
   *   · 정화의 "언제 쓸까" 칸. 저건 읽는 것이 아니라 **고르는 것**이라,
   *     보러 연 창에 있으면 무엇을 하는 창인지 흐려진다
   *   · **줄을 눌러 펴는 것.** 홈에서 파티 칸을 눌러 여는 창이라 "지금 누가
   *     서 있나" 를 훑는 자리인데, 거기서 줄을 펴면 수치 열 줄이 쏟아져
   *     창이 길어진다. 자세히 볼 자리는 따로 있다 (영웅 탭 · 스킬 트리)
   *
   * 키우러 들어간 창(영웅 탭)에는 둘 다 그대로 있다.
   */
  readOnly?: boolean;
  /**
   * **칸으로 그리나** — 예시 화면처럼 로고 칸이 가로로 선다.
   *
   * 영웅 관리가 켠다 (`HeroManage`). 캐릭터 창은 좁고 위아래로 긴 자리라
   * 줄이 맞다 — 거기서 칸으로 그리면 한 줄에 둘밖에 안 들어가서, 격자가
   * 아니라 어긋난 목록이 된다.
   */
  grid?: boolean;
}) {
  /**
   * 펴 놓은 것. 하나만 편다 — 둘을 나란히 펴면 비교가 아니라 벽이 된다.
   *
   * 기술은 이름으로, 패시브는 `PV_KEY` 로 잡는다. 같은 칸을 쓰므로 패시브를
   * 펴면 기술이 접히고 그 반대도 그렇다 — 창에 펴진 것은 늘 하나다.
   */
  const [open, setOpen] = useState<string | null>(null);
  const openPv = open === PV_KEY;

  /* 트리가 손본 것을 보여 준다 — 창에 적힌 코스트와 실제 코스트가 같아야 한다 */
  const list = skillsFor(c);
  /*
    파쇄의 태세를 찍으면 불굴의 맹세가 꺼진다 (`core/passives` 의 `regenOf`).
    목록에서 지우지 않고 흐리게 남긴다 — 무엇을 잃었는지가 안 보이면 그
    갈래를 고른 값도 안 보인다.
  */
  /* `tree` 를 직접 뒤지지 않는다 — 까닭은 `core/skillTree` 의 `nodeOn` 에 */
  const passiveOff = nodeOn(c.id, c.star, c.tree ?? [], 'kg3b');
  const st = statOf(c);
  /* 파티 패시브가 기술에도 걸린다 — 전투가 쓰는 것과 같은 값이다 */
  const sup = allyAtk(party, chars);

  const pv = passiveOf(c.id);

  /*
    ── 한 줄에 필요한 것들 ── **계산은 한 곳에서** 한다.

    줄로 그리든 칸으로 그리든 (`grid`) 같은 값을 쓴다. 두 곳에서 따로 세면
    목록의 코스트와 펼친 자리의 코스트가 갈릴 수 있는데, 그건 화면이 스스로
    거짓말하는 것이라 제일 나쁜 종류다.
  */
  const rows = list.map((sk, slot) => ({
    sk,
    slot,
    unlocked: skillOpen(c, slot),
    on: open === sk.name,
    sec: skillEverySec(c, sk),
    /*
      한 대의 피해. **계산과 같은 함수**를 쓴다 — 적어 둔 수와 박히는 수가
      갈리면 안 된다. 맞는 쪽은 안 본다 (`NO_ARMOR`): 적마다 다른 값을 여기서
      정할 수 없으니 "맨몸에 몇 들어가나" 를 적는다.
    */
    hit: strikeFor(skillBase(st, sk, sup), 1, NO_ARMOR, blowOf(c.id, sk)),
    pierce: pierceText(sk, c.id),
  }));

  type SkRow = (typeof rows)[number];

  /** 펼친 자리 — 줄 모드에서는 그 줄 밑에, 칸 모드에서는 칸 전체 밑에 붙는다 */
  const detailOf = ({ sk, slot }: SkRow) => (
    <View style={[BORDER, { padding: SP.sm, marginBottom: SP.xs }]}>
      <SkillDetail c={c} party={party} chars={chars} sk={sk} slot={slot} readOnly={readOnly} />
    </View>
  );

  /*
    ── 칸 모드 ── 예시 화면처럼 로고 칸이 가로로 선다.

    줄로 늘어놓으면 기술 넷이 화면 세로를 그만큼 먹는다. 영웅 관리는 그
    아래에 수치 여덟 줄과 키우는 상자가 더 오는 자리라, 목록이 길면 **키우는
    단추가 화면 밖으로 밀린다** — 이 화면에서 제일 자주 하는 일이 그건데.

    칸은 로고와 이름만 인다. **누르면 창이 뜬다** (`SkillPopup`) — 칸 아래에
    펼쳐 붙이던 것을 걷었다. 도는 그림과 수치 열 줄이 화면을 밀어내서 정작
    누른 칸이 화면 밖으로 나갔는데, 무엇을 눌렀는지 안 보이는 채로 그 설명을
    읽게 된다.

    **패시브도 창이다** (`PassivePopup`). 한 줄짜리라 펼쳐 붙여도 되겠다
    싶었는데, 그러면 셋 중 하나만 다르게 움직인다 — 격자 안에서 누르는 법을
    두 번 배워야 하는 것이라 그건 규칙이 아니라 고장으로 읽힌다.

    패시브가 첫 칸이다 — 늘 켜져 있는 쪽이 먼저다 (머리말).
  */
  if (grid) {
    const openRow = rows.find((r) => r.on);
    return (
      <>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SP.xs }}>
          {!!pv && (
            <SkCard
              set="passive_icon"
              art={pv.art}
              name={pv.name}
              tag={passiveOff ? '꺼짐' : '패시브'}
              on={openPv}
              off={passiveOff}
              onPress={() => setOpen(openPv ? null : PV_KEY)}
            />
          )}
          {rows.map((r) => (
            <SkCard
              key={r.sk.name}
              set="skill_icon"
              art={r.sk.art}
              name={r.sk.name}
              tag={r.unlocked ? `코스트 ${r.sk.cost}` : `${skillNeeds(r.slot)}성`}
              on={r.on}
              off={!r.unlocked}
              onPress={() => setOpen(r.on ? null : r.sk.name)}
            />
          ))}
        </View>

        {/* 패시브도 창이다 — 같은 격자에서 액티브만 창이 뜨면 규칙이 둘이 된다 */}
        {openPv && !!pv && (
          <PassivePopup pv={pv} off={passiveOff} onClose={() => setOpen(null)} />
        )}
        {!!openRow && (
          <SkillPopup
            c={c}
            party={party}
            chars={chars}
            sk={openRow.sk}
            slot={openRow.slot}
            title={openRow.sk.name}
            onClose={() => setOpen(null)}
          />
        )}
      </>
    );
  }

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
          {/*
            오른쪽에 `늘 켜져 있습니다` 가 있었다. 아래 `패시브` 딱지가 같은
            말을 하고 있어서 (`Tag`) 한 줄에 같은 말이 두 번이었다 — 꺼진
            경우에만 이유를 적는다.

            딱지는 한동안 `항상` 이었다. 뜻은 맞지만 **트리와 말이 갈렸다** —
            트리는 같은 것을 `패시브` 라고 부른다 (`SkillTreePopup`). 한 가지를
            두 이름으로 부르면 그 둘이 같은 것인지 화면 어디서도 알 수 없다.
          */}
          <Row between style={{ marginBottom: SP.xs }}>
            <T size={11} bold>패시브</T>
            {passiveOff && <T size={9} dim="dim">파쇄의 태세가 껐습니다</T>}
          </Row>
          {/*
            ── 패시브도 **누르면 편다** ── 액티브 목록과 같은 규칙이다.

            설명이 늘 붙어 있었다 (`체력이 낮을수록 공격속도 증가 (체력
            10%에서 1.5배)`). 한 줄이지만 접혀 있는 목록에서 읽는 것은
            이름이고, 무엇보다 **아래 액티브 목록과 다른 규칙**이면 같은
            창에서 접히는 것과 안 접히는 것을 따로 배워야 한다.
          */}
          <ListItem
            title={pv.name}
            /*
              **제 로고를 쓴다** (`passive_icon`). 상태 로고를 빌려 쓰면
              비앙카와 리안느가 같은 그림이 된다 —
              `docs/PASSIVE_ICON_PROMPTS.md` 에 이유를 적어 뒀다.

              아직 그림이 없으면 빈 자리로 남고, 도착하는 순간 저절로 붙는다.
            */
            left={<Sprite set="passive_icon" name={pv.art} size={22} />}
            right={<Tag label={passiveOff ? '꺼짐' : '패시브'} />}
            /* 보기만 하는 창에서는 안 펴진다 — 까닭은 `readOnly` 에 */
            onPress={readOnly ? undefined : () => setOpen(openPv ? null : PV_KEY)}
          />
          {openPv && (
            <View style={[BORDER, { padding: SP.sm, marginBottom: SP.xs }]}>
              <T size={10} dim="sub">{pv.text}</T>
            </View>
          )}
          {/*
            켜져 있을 때의 한 줄(`파티에 서 있고 살아 있는 동안만…`)을 걷었다.
            패시브가 그렇다는 것은 한 번 알면 되는 규칙인데, 창을 열 때마다
            네 사람 몫으로 네 번 읽게 된다. 꺼진 경우만 이유를 적는다 —
            저건 규칙이 아니라 **지금 이 사람에게 일어난 일**이다.
          */}
          {passiveOff && (
            <T size={9} dim="dim" style={{ marginTop: 2, marginBottom: SP.sm }}>
              파쇄의 태세를 찍어서 꺼졌습니다. 되돌리면 다시 걸립니다.
            </T>
          )}
        </View>
      )}

      {/*
        ── 잠긴 기술도 목록에 남는다 ──

        성이 기술을 연다 (`core/growth` 의 `skillSlots`). 아직 못 쓰는 것을
        목록에서 빼면 "합성하면 무엇이 생기나" 가 어디에도 안 적힌다 — 성을
        올릴 이유가 화면에서 사라지는 셈이다.

        대신 흐리게 두고 몇 성이 필요한지를 오른쪽에 적는다.
      */}
      {/*
        오른쪽에 `4성 — 3개 열림` 이 있었다. 목록이 바로 아래에 있고 잠긴
        것은 흐리게 뜨므로 (`skillOpen`) 세어 볼 것을 미리 세어 준 셈이다.
      */}
      <T size={11} bold style={{ marginBottom: SP.xs }}>액티브 스킬</T>

      {rows.map((r) => (
        <View key={r.sk.name} style={r.unlocked ? undefined : { opacity: O.dim }}>
          <ListItem
            title={r.sk.name}
            left={<Sprite set="skill_icon" name={r.sk.art} size={22} />}
            right={r.unlocked ? (
              <Row gap={3}>
                {r.sk.pick !== 'none' && <Tag label={DMG_NAME[r.sk.dmg]} />}
                <Tag label={`코스트 ${r.sk.cost}`} />
              </Row>
            ) : (
              /* 잠긴 것에는 쿨타임 대신 **열리는 조건**을 적는다 */
              <Tag label={`${skillNeeds(r.slot)}성 필요`} />
            )}
            onPress={readOnly ? undefined : () => setOpen(r.on ? null : r.sk.name)}
          />
          {r.on && detailOf(r)}
        </View>
      ))}
    </>
  );
}
