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
 *
 * **영웅 관리에서는 그 괄호를 안 붙인다** (`deltas`). 까닭은 그 이름표에.
 *
 * ## 두 칸으로 선다 (`cols`)
 *
 * 한 칸으로 늘어놓으면 여덟 줄이 세로를 여덟 줄만큼 먹는다. 영웅 관리는 그
 * 아래에 키우는 상자가 더 오는 자리라, 수치가 길면 **레벨업 단추가 화면
 * 밖으로 밀린다.**
 *
 * 두 칸이 되면 문제가 하나 생긴다 — 왼쪽에 한글 넉 자짜리 이름이 여덟 개
 * 나란히 서서, 훑어서는 어느 것이 어느 것인지 안 갈린다. 그래서 이름 앞에
 * 8x8 로고를 세운다 (`ui/sprites` 의 `STAT`). 눈이 글자를 안 읽고도 줄을
 * 찾는다.
 *
 * 캐릭터 창은 좁고 위아래로 긴 자리라 한 칸 그대로다.
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
import { Row, T } from '@/ui/atoms';
import { Pixel } from '@/ui/Pixel';
import { STAT } from '@/ui/sprites';
import { BAD_C, GOOD_C, LINE, SP } from '@/ui/theme';

/** 로고 한 변 — 11px 글자 옆에 서므로 그보다 작아야 한다 (머리말) */
const IC = 9;

/**
 * 수치 한 줄 — 로고 · 이름 · 값 · 차이.
 *
 * `KV` 를 안 쓴다. 저건 왼쪽이 글자 하나뿐인 줄을 위한 것이라 로고 자리가
 * 없고, 12px 로 그려서 두 칸에 넣으면 값이 잘린다.
 */
function StatRow({ art, k, v, delta, tail }: {
  art: keyof typeof STAT;
  k: string;
  v: string;
  /** 지금 얼마나 오르내렸나 — `+` 로 시작하면 초록, 아니면 붉은색 */
  delta?: string;
  tail?: string;
}) {
  return (
    <Row between style={{ alignItems: 'baseline', paddingVertical: 3 }}>
      <Row gap={4} style={{ alignItems: 'center', flexShrink: 1 }}>
        <Pixel sprite={STAT[art]} scale={IC / 8} />
        <T size={11} dim="sub" numberOfLines={1}>{k}</T>
      </Row>
      {/* `baseline` 이라야 크기가 다른 조각들의 밑줄이 맞는다 */}
      <Row gap={3} style={{ alignItems: 'baseline', flexShrink: 1 }}>
        <T size={11} bold numberOfLines={1}>{v}</T>
        {!!delta && (
          <T size={10} bold style={{ color: delta.includes('+') ? GOOD_C : BAD_C }}>
            {delta}
          </T>
        )}
        {!!tail && <T size={9} dim="dim" numberOfLines={1}>{tail}</T>}
      </Row>
    </Row>
  );
}

export function CharStats({ c, party, chars, cols = 1, live = true }: {
  c: OwnedChar;
  party: Party;
  chars: Record<string, OwnedChar>;
  /** 한 줄에 몇 칸. 영웅 관리는 2, 캐릭터 창은 1 (머리말) */
  cols?: 1 | 2;
  /**
   * **지금 판 이야기를 같이 적나.**
   *
   * 두 가지가 여기 걸린다.
   *
   *   초록·붉은 괄호   `(+11)` · `(-3)` — 지금 걸려 있는 것이 얹거나 깎은 몫
   *   남은 체력        `1234 / 3000` 의 앞엣것
   *
   * 영웅 관리는 끈다. 거기는 판을 보는 자리가 아니라 **키우는 자리**다 —
   * 레벨을 올릴까 성을 올릴까를 정하려고 보는 숫자 옆에서 저쪽 무대의
   * 함성이 얹은 몫과 방금 맞은 피가 오르내리면, 어느 것이 이 사람의 값인지가
   * 흐려진다. 무엇보다 **레벨을 올려도 저 둘은 안 바뀐다** — 방금 누른 것과
   * 상관없는 숫자가 옆에서 움직인다.
   *
   * 캐릭터 창은 켜 둔다. 거기는 싸움을 보다 "쟤 왜 저러지" 로 여는 자리라
   * 지금 걸려 있는 것이 곧 답이다.
   */
  live?: boolean;
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

  /* 관통은 **가진 사람에게만** — 0 짜리 줄이 넷에게 다 붙으면 잡음이다 */
  const p = anyPierce(c.id);
  const pierces: string[] = [];
  if (p.phys) pierces.push('물리');
  if (p.magic) pierces.push('마법');

  /*
    ── 줄 차례 ──

    **짝이 가로로 붙게** 늘어놓았다. 두 칸으로 서면 1·2 번이 한 줄, 3·4 번이
    다음 줄이 되므로, 짝지어 봐야 하는 것끼리 이웃에 두면 눈이 안 움직인다.

      공격력 · 공격속도      때리는 쪽 둘
      체력 · 방어력          맞는 쪽으로 넘어가는 자리
      마법저항력 · 치명타확률
      치명타피해 · 관통

    방어력과 마법저항력이 갈라진 것이 아쉽지만, 그 둘은 로고가 짝(찬 방패 ·
    빈 방패)이라 떨어져 있어도 이어진다 (`STAT`).

    평타 종류를 이름 쪽에 붙이는 것은 예전 그대로다 — "공격력 15" 만 있으면
    그게 어느 쪽 방어에 막히는지 알 길이 없다. 값 뒤에 두면 오른쪽 끝이 숫자 ·
    차이 · 종류 셋으로 길어져서 정작 눈이 갈 숫자가 가운데 끼인다.
  */
  const rows: React.ReactNode[] = [
    <StatRow
      key="atk"
      art="atk"
      k={`공격력 (${DMG_NAME[blowOf(c.id).type]})`}
      v={`${base.atk}`}
      delta={live && now ? deltaText(base.atk, now.atk) : ''}
    />,
    /*
      **실제 간격(`1333ms 마다`)은 안 적는다.** 배수만으로는 0.8 이 빠른지
      느린지 모른다고 봤는데, 이 줄에서 견주는 것은 애초에 넷끼리다 — 리안느
      1.1 과 아녜스 0.5 를 나란히 보면 그걸로 충분하다.
    */
    <StatRow
      key="spd"
      art="spd"
      k="공격속도"
      v={`${base.spd}`}
      delta={live && now ? deltaText(base.spd, now.spd, 1) : ''}
    />,
    /*
      체력은 **대형이 올린 것까지가 최대치**다 (`seat`). 전투가 그 값을
      최대로 보므로 (`hpOf`), 여기서 맨 몸 수치를 최대로 적으면 앞줄에 선
      사람이 가득 찬 채로도 넘쳐 보인다.

      남은 체력(`1234 / 3000` 의 앞엣것)은 **판을 보는 자리에서만** 붙는다
      (`live`). 키우는 자리에서는 최대치 하나다 — 거기서 견주는 것은 "이
      사람이 얼마나 단단한가" 이지 "지금 얼마나 깎였나" 가 아니고, 무대는
      그 옆에서 계속 도므로 볼 때마다 다른 숫자가 뜬다.
    */
    <StatRow
      key="hp"
      art="hp"
      k="체력"
      v={`${live && cur > 0 ? `${Math.ceil(cur)} / ` : ''}${seat.hp}`}
      delta={live ? deltaText(base.hp, seat.hp) : ''}
    />,
    <StatRow
      key="def"
      art="def"
      k="방어력"
      v={`${base.def}`}
      delta={live && now ? deltaText(base.def, now.def) : ''}
    />,
    <StatRow
      key="res"
      art="res"
      k="마법저항력"
      v={`${base.res}`}
      delta={live && now ? deltaText(base.res, now.res) : ''}
    />,
    /*
      ── 치명타 두 줄은 **늘 뜬다** ──

      여태 `crit > 0` 일 때만 뜨게 해 뒀다. 그런데 넷 다 기본 확률이 0 이라
      (`core/chars` 의 `CHARS`) 이 줄은 **아무에게도 안 떴다** — 치명타라는
      것이 이 게임에 있는지조차 창에서 알 수 없었다.

      0% 인 것과 줄이 없는 것은 다른 말이다. 앞엣것은 "지금은 안 터진다,
      올리면 터진다" 이고 뒤엣것은 아무 말도 아니다. 리안느의 정령의 노래가
      거는 집중이 확률을 올려 주므로 (`st_focus`), **올릴 수 있는 축**이라는
      것이 보여야 한다.

      두 줄로 나눈다. `30% · 피해 200%` 한 줄이면 두 숫자가 서로 다른 것을
      재는데 (하나는 얼마나 자주, 하나는 얼마나 세게) 한 덩어리로 읽힌다.

      확률에는 집중이 **더해진다** (배수가 아니다 — `rollCrit` 참고).
    */
    <StatRow
      key="crit"
      art="crit"
      k="치명타 확률"
      v={`${Math.round(base.crit * 100)}%`}
      delta={live && now ? deltaText(base.crit * 100, critNow * 100) : ''}
    />,
    <StatRow
      key="cdmg"
      art="cdmg"
      k="치명타 피해"
      v={`${Math.round(base.critDmg * 100)}%`}
    />,
  ];

  if (pierces.length) {
    rows.push(
      <StatRow key="pierce" art="pierce" k="관통" v={pierces.join(' · ')} />,
    );
  }

  /*
    ── 여기 있던 설명 두 문단을 걷었다 ──

    "방어력은 물리 피해를 그 수만큼 깎습니다…" 와 "초록 (+) 과 붉은 (−)
    은…" 이었다. 둘 다 맞는 말인데, 이 절은 **넷을 견주려고 여는 자리**다 —
    수치 여덟 줄을 보러 와서 다섯 줄짜리 설명을 두 번 지나야 했다.

    대신 화면이 스스로 말하게 뒀다 — 공격력 옆의 `(물리)`·`(마법)` 이
    방어력·마법저항력 두 줄과 이어지고, 로고가 그 셋을 짝으로 묶는다.

    "지금 걸려 있는 것" 상자도 같이 걷었다. 초록·붉은 괄호가 그 자체로 "지금
    뭔가 걸려 있다" 를 말하고, 무엇이 걸렸는지는 파티 칸의 로고 줄이 이미
    그리고 있다 (`StatusRow`).
  */
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {/*
        ── 두 칸 사이의 세로줄 ──

        왼쪽 값의 오른쪽 끝과 오른쪽 이름의 왼쪽 끝이 맞닿아 있어서, 훑을 때
        `1127 방어력` 이 한 덩어리로 읽혔다. 줄 하나면 그 눈길이 끊긴다.

        **제일 옅은 선**이다 (`LINE.low`). 이건 가르는 것이지 무엇을 말하는
        것이 아니라, 보이는 줄 모르게 있어야 맞다.

        칸이 하나일 때는 안 그린다 — 가를 것이 없다.
      */}
      {cols === 2 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '50%',
            top: 2,
            bottom: 2,
            width: 1,
            backgroundColor: LINE.low,
          }}
        />
      )}
      {rows.map((node, i) => (
        <View
          key={i}
          style={{
            width: cols === 2 ? '50%' : '100%',
            /* 두 칸일 때만 사이를 벌린다 — 한 칸이면 오른쪽 끝이 안으로 밀린다 */
            paddingRight: cols === 2 && i % 2 === 0 ? SP.sm : 0,
          }}
        >
          {node}
        </View>
      ))}
    </View>
  );
}
