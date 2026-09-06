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
 */
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  BATTLE_TYPE_ART, CHARS, CharId, RARITY_NAME,
  battleTypeOf, charPower, maxStar,
} from '@/core/chars';
import { Row, Stars, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, O, SP, SURF } from '@/ui/theme';

/** 한 줄에 둘 — 얼굴이 작아지면 누구인지가 안 보인다 */
const COLS = 2;

export function HeroBook({ onPick }: { onPick: (id: CharId) => void }) {
  const raw = useGame((s) => s.chars);

  /* 표에 적힌 차례 그대로 — 가진 순서로 두면 뽑을 때마다 목록이 뒤섞인다 */
  const all = useMemo(() => Object.keys(CHARS) as CharId[], []);
  const got = all.filter((id) => !!raw[id]).length;

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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SP.xs }}>
        {all.map((id) => {
          const d = CHARS[id];
          const c = raw[id];
          const have = !!c;
          return (
            <Pressable
              key={id}
              disabled={!have}
              onPress={() => { sfx('tap'); onPick(id); }}
              style={({ pressed }) => [
                BORDER,
                {
                  /* 한 줄에 둘 — 사이 간격만큼 빼야 두 칸이 딱 맞는다 */
                  width: `${100 / COLS}%`,
                  flexGrow: 1,
                  flexBasis: 0,
                  minWidth: 120,
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
          );
        })}
      </View>

      <T size={FS.tiny} dim="dim" style={{ marginTop: SP.sm }}>
        가진 사람을 누르면 영웅 관리에서 그 사람이 섭니다.
      </T>
    </View>
  );
}
