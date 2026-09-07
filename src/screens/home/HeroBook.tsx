/**
 * ── 도감 ── 이 게임에 누가 있나.
 *
 * 영웅 탭의 셋째 갈래다 (`HeroScreen` 의 `sub`).
 *
 * ## 안 가진 사람도 **자리를 잡고 있다**
 *
 * 가진 사람만 늘어놓으면 그건 도감이 아니라 창고 목록이다. 도감이 하는 말은
 * "이 게임에 이런 사람들이 있다" 이고, 그중 **내가 몇을 가졌나**가 곧 진행
 * 상황이다 — 빈 칸이 보여야 그게 읽힌다.
 *
 * 안 가진 칸은 얼굴을 검게 눌러 놓는다 (`tint` + 흐림). 지우거나 물음표로
 * 바꾸면 누구인지가 사라져서 "저 사람을 뽑고 싶다" 가 안 생긴다 — 실루엣은
 * 남기고 색만 뺀다.
 *
 * ## 누르면 관리로 넘어간다
 *
 * 가진 사람을 누르면 영웅 관리에서 그 사람이 선다 (`onPick`). 도감에서 보고
 * 키우고 싶어지는 것이 자연스러운 순서인데, 거기서 다시 좌우로 넘겨 찾게
 * 하면 방금 고른 것을 한 번 더 고르는 셈이다.
 *
 * 안 가진 사람은 안 눌린다. 갈 데가 없다 — 모집은 다른 화면이다.
 *
 * ## 갈래와 차례
 *
 * 위에 **역할 갈래 다섯**(전체 · 탱커 · 근접 딜러 · 원거리 딜러 · 서포터)과
 * **차례 셋**(등급 · 성 · 레벨)이 있다.
 *
 * 둘이 다른 일을 한다. 갈래는 **무엇을 볼까**이고 차례는 **무엇을 먼저
 * 볼까**다. 그래서 갈래를 바꿔도 차례는 안 바뀌고 그 반대도 그렇다 — 탱커만
 * 레벨 순으로 보는 것이 자연스러운 물음이다.
 *
 * 차례의 기본은 **등급**이다. 도감을 여는 이유가 대개 "뭐가 더 있나" 라서,
 * 좋은 것이 위에 있어야 한다. 성과 레벨은 **내가 키운 순서**라 안 가진 사람이
 * 전부 바닥으로 밀리는데, 그건 도감이 하려는 말과 반대다.
 *
 * 세 차례 모두 **같은 값이면 표에 적힌 차례**로 떨어진다 (`CHAR_IDS`). 안
 * 그러면 성이 같은 둘의 앞뒤가 볼 때마다 달라져서, 목록이 가만히 있질 않는다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  BATTLE_TYPE_ART, BattleType, CHARS, CharId, RARITY_IDS, RARITY_NAME,
  battleTypeOf, charPower, maxStar,
} from '@/core/chars';
import { Row, Stars, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { FrameArt, frameStyle } from '@/ui/Frame';
import { BORDER, FS, LINE, O, SP, SURF } from '@/ui/theme';

/** 한 줄에 둘 — 얼굴이 작아지면 누구인지가 안 보인다 */
const COLS = 2;

/**
 * 칸 사이 틈.
 *
 * 늘어놓는 상자의 `gap` 으로 주면 안 된다. 폭이 `100 / COLS` % 인 칸 둘에
 * 틈이 더해져 한 줄을 넘고, 그러면 둘째 칸이 다음 줄로 떨어져 **한 줄에
 * 하나씩** 늘어선다. 카드 바깥에 `margin` 을 물려도 같은 일이 난다.
 *
 * 그래서 **자리와 카드를 나눈다.** 자리는 정확히 절반을 차지하고 (`50%`),
 * 틈은 그 자리의 **안쪽 여백**이며, 카드는 남은 만큼을 채운다. 더해지는
 * 것이 없으니 둘이 늘 한 줄에 든다.
 */
const GUT = SP.xs;

/** 알약 줄 왼쪽 이름표의 폭 — 두 줄의 알약이 같은 자리에서 시작하게 */
const LABEL_W = 26;

/** 역할 갈래 — `null` 이 전체다 */
const KINDS: readonly { id: BattleType | null; label: string }[] = [
  { id: null, label: '전체' },
  { id: 'tank', label: '탱커' },
  { id: 'melee', label: '근접' },
  { id: 'ranged', label: '원거리' },
  { id: 'support', label: '서포터' },
];

type SortId = 'rarity' | 'star' | 'lv';

const SORTS: readonly { id: SortId; label: string }[] = [
  /*
    ── `높은 순` 을 이름에 안 적는다 ──

    셋 다 높은 것이 위로 온다. `등급 높은 순` 처럼 적으면 알약 셋이 다
    같은 꼬리를 달게 되고, 그러면 폭이 세 배로 늘면서 정작 다른 부분인
    앞 두 글자가 묻힌다. 줄 이름표(`정렬`)가 이미 "줄 세우는 말" 이라고
    말하고 있으므로, 알약에는 **무엇으로** 만 적는다.
  */
  { id: 'rarity', label: '등급' },
  { id: 'star', label: '성' },
  { id: 'lv', label: '레벨' },
];

/**
 * 갈래와 차례를 고르는 알약 한 줄.
 *
 * 두 줄이 같은 모양이다. 하는 일이 다르므로 (무엇을 볼까 · 무엇을 먼저 볼까)
 * 갈라 그리고 싶어지는데, **둘 다 "이 목록을 어떻게 볼까"** 라서 같은 손짓이다
 * — 모양을 다르게 하면 둘 중 하나는 다른 종류의 단추로 읽힌다.
 *
 * 고른 것만 반전된다. 흑백에서 "지금 이것" 을 말하는 제일 짧은 방법이다.
 */
function PickRow<T extends string | null>({ label, items, at, onGo }: {
  /**
   * 줄 왼쪽의 이름표 — **이 줄이 무엇을 고르는 줄인가.**
   *
   * 없이도 돌아갔지만, 같은 모양의 알약 줄이 둘 겹쳐 있으니 아래 줄이
   * 차례를 고르는 줄이라는 것이 화면에 없었다. `등급 · 성 · 레벨` 만
   * 놓고 보면 그게 거르는 말인지 줄 세우는 말인지 알 길이 없다 —
   * 바로 위에 `전체 · 탱커 · 근접` 이 거르는 말로 있으니 더 그렇다.
   *
   * 폭을 박아 둔다 (`LABEL_W`). 두 줄의 알약이 같은 자리에서 시작해야
   * 이름표만 다르고 나머지는 같은 줄이라는 것이 보인다.
   */
  label: string;
  items: readonly { id: T; label: string }[];
  at: T;
  onGo: (v: T) => void;
}) {
  return (
    <Row gap={3} style={{ marginBottom: SP.xs }}>
      <T size={FS.tiny} dim="dim" style={{ width: LABEL_W }}>{label}</T>
      {items.map((it) => {
        const here = it.id === at;
        return (
          <Pressable
            key={String(it.id)}
            disabled={here}
            onPress={() => { sfx('tap'); onGo(it.id); }}
            style={({ pressed }) => [
              frameStyle({ hi: here, pressed }),
              { flex: 1, alignItems: 'center', paddingVertical: 4 },
            ]}
          >
            <FrameArt hi={here} />
            <T size={FS.tiny} bold={here} dim={here ? 'full' : 'dim'} numberOfLines={1}>
              {it.label}
            </T>
          </Pressable>
        );
      })}
    </Row>
  );
}

export function HeroBook({ onPick }: { onPick: (id: CharId) => void }) {
  const raw = useGame((s) => s.chars);

  /** 어느 역할만 볼까 — `null` 이면 전부 */
  const [kind, setKind] = useState<BattleType | null>(null);
  /** 무엇을 먼저 볼까. 기본은 등급 (머리말) */
  const [sort, setSort] = useState<SortId>('rarity');

  /* 표에 적힌 차례 그대로 — 가진 순서로 두면 뽑을 때마다 목록이 뒤섞인다 */
  const all = useMemo(() => Object.keys(CHARS) as CharId[], []);
  const got = all.filter((id) => !!raw[id]).length;

  /*
    ── 갈래로 거르고 차례로 세운다 ──

    세는 숫자(`got / all`)는 **거르기 전 값**이다. 저건 "이 게임의 몇을
    모았나" 이지 "지금 보이는 것 중 몇" 이 아니다 — 탱커만 보고 있다고
    도감의 진행률이 바뀌면 안 된다.

    안 가진 사람은 성도 레벨도 없으므로 0 으로 친다. 그러면 성·레벨 차례에서
    바닥으로 모이는데, 그게 맞다: 저 둘은 **내가 키운 순서**를 보는 자다.
  */
  const list = useMemo(() => {
    const seen = kind ? all.filter((id) => battleTypeOf(id) === kind) : all.slice();
    const rank = (id: CharId) => {
      const c = raw[id];
      if (sort === 'star') return c ? c.star : 0;
      if (sort === 'lv') return c ? c.lv : 0;
      /* 등급은 표에 적힌 차례가 곧 세기 순이다 (`RARITY_IDS`) */
      return RARITY_IDS.indexOf(CHARS[id].rarity);
    };
    /* 같은 값이면 표 차례로 — 안 그러면 볼 때마다 앞뒤가 달라진다 */
    const home = new Map(all.map((id, i) => [id, i]));
    return seen.sort((a, b) => (rank(b) - rank(a)) || (home.get(a)! - home.get(b)!));
  }, [all, raw, kind, sort]);

  return (
    <View>
      <Row between style={{ marginBottom: SP.sm }}>
        <T size={FS.title} bold>도감</T>
        {/*
          몇을 모았나. 도감에서 이 숫자가 제일 큰 말을 한다 — 아래 칸들이
          그것을 그림으로 다시 말하는 셈이다.
        */}
        <T size={FS.label} bold>{`${got} / ${all.length}`}</T>
      </Row>

      {/* 무엇을 볼까 */}
      <PickRow label="역할" items={KINDS} at={kind} onGo={setKind} />
      {/* 무엇을 먼저 볼까 — 셋 다 **높은 것이 위**다 */}
      <PickRow label="정렬" items={SORTS} at={sort} onGo={setSort} />

      {/*
        ── 늘어나지 않는 격자 ──

        한동안 카드에 `flexGrow: 1` 과 `flexBasis: 0` 을 같이 줬다. 그러면 폭이
        **남는 자리를 나눠 갖는 값**이 되어, 적어 둔 `50%` 는 아무 일도 안 한다.

        둘이 겹쳐서 이렇게 됐다.

          · 줄이 넘치는지를 `flexBasis` 로 재는데 그게 0 이라, 화면이 넓으면
            한 줄에 셋도 넷도 들어갔다 (`minWidth: 120` 이 겨우 막고 있었다)
          · 마지막 줄에 하나만 남으면 그 하나가 **줄 전체로 벌어졌다** —
            같은 카드가 서는 자리에 따라 크기가 달랐다

        이제 폭 하나로 못을 박는다 (`flexGrow: 0`). 자리는 어디서든 화면의
        절반이고, 마지막 줄에 하나만 남으면 왼쪽에 절반짜리로 선다 — 그게
        격자가 뜻하는 바다.
      */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          /* 자리가 사방으로 물고 있는 여백을 격자 바깥쪽에서만 도로 뺀다 */
          marginHorizontal: -GUT / 2,
          marginTop: -GUT,
        }}
      >
        {list.map((id) => {
          const d = CHARS[id];
          const c = raw[id];
          const have = !!c;
          return (
            <View
              key={id}
              style={{
                width: `${100 / COLS}%`,
                paddingHorizontal: GUT / 2,
                paddingTop: GUT,
              }}
            >
              <Pressable
                disabled={!have}
                onPress={() => { sfx('tap'); onPick(id); }}
                style={({ pressed }) => [
                  BORDER,
                  {
                    /* 자리를 꽉 채운다 — 틈은 자리가 이미 물고 있다 */
                    width: '100%',
                    /*
                      한 줄에 선 둘의 **키를 맞춘다.** 자리는 줄에서 제일 큰
                      것만큼 늘어나므로 (`alignItems` 기본값), 카드가 그 자리를
                      세로로 마저 채우게 둔다. 안 그러면 소개 글이 두 줄인
                      카드 옆의 한 줄짜리가 짧아져 아래가 비어 보인다.
                    */
                    flexGrow: 1,
                    padding: SP.sm,
                    alignItems: 'center',
                    borderColor: have ? LINE.mid : LINE.low,
                    borderStyle: have ? 'solid' : 'dashed',
                    backgroundColor: have ? (pressed ? SURF.up : 'transparent') : SURF.down,
                  },
                ]}
              >
                {/*
                  안 가진 사람은 **실루엣만** 남는다. 지우거나 물음표로 바꾸면
                  누구인지가 사라져서 뽑고 싶어지지도 않는다.
                */}
                <Sprite
                  set="avatar"
                  name={d.art}
                  size={52}
                  tint={have ? undefined : '#000000'}
                  opacity={have ? 1 : O.dim}
                />
                <T
                  size={FS.label}
                  bold
                  numberOfLines={1}
                  dim={have ? 'full' : 'dim'}
                  style={{ marginTop: SP.xs }}
                >
                  {have ? d.name : '???'}
                </T>
                <Row gap={3} style={{ marginTop: 2, alignItems: 'center' }}>
                  <Tag
                    label={RARITY_NAME[d.rarity]}
                    fill={have && (d.rarity === 'mythic' || d.rarity === 'legendary')}
                  />
                  <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(id)]} size={11} />
                </Row>
                {have ? (
                  <>
                    <View style={{ marginTop: 3 }}>
                      <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={9} />
                    </View>
                    <T size={FS.tiny} dim="dim" numberOfLines={1} style={{ marginTop: 2 }}>
                      {`Lv ${c.lv} · 전투력 ${charPower(c).toLocaleString()}`}
                    </T>
                  </>
                ) : (
                  /*
                    안 가진 칸도 **같은 높이**를 지킨다. 지우면 가진 칸과 안
                    가진 칸의 키가 달라져서 격자가 들쭉날쭉해진다.
                  */
                  <View style={{ height: 9 + 3 + 2 + 12, justifyContent: 'center' }}>
                    <T size={FS.tiny} dim="dim">모집에서 나옵니다</T>
                  </View>
                )}
                {/*
                  한 줄 소개. 도감에서만 적는다 — 관리 화면은 수치를 보는
                  자리라 이런 글이 들어가면 숫자가 밀린다.
                */}
                <T
                  size={FS.tiny}
                  dim="dim"
                  center
                  numberOfLines={2}
                  style={{ marginTop: SP.xs, minHeight: 26 }}
                >
                  {have ? d.title : ''}
                </T>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* 갈래를 좁혀 아무도 안 남는 일이 있다 — 빈 화면은 고장으로 읽힌다 */}
      {!list.length && (
        <View style={{ paddingVertical: SP.xl, alignItems: 'center', width: '100%' }}>
          <T size={11} dim="sub">이 역할은 아직 없습니다.</T>
        </View>
      )}

      <T size={FS.tiny} dim="dim" style={{ marginTop: SP.sm }}>
        가진 사람을 누르면 영웅 관리에서 그 사람이 섭니다.
      </T>
    </View>
  );
}
