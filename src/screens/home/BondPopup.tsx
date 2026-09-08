/**
 * ── 인연 ── **자리만 잡아 둔 창.**
 *
 * 아직 아무 일도 안 한다. 이야기도 없고 수치도 안 올라간다 — 이 창이 하는
 * 일은 **무엇이 여기 들어올지를 화면으로 정하는 것** 하나다.
 *
 * ## 왜 빈 창을 먼저 만드나
 *
 * 인연은 글이 많은 기능이다. 넷이 서로에 대해 몇 마디씩 하고, 단계마다
 * 이야기가 하나씩 열린다. 그 글을 다 쓰고 나서 화면을 짜면 **글이 화면을
 * 정하게 되는데**, 그러면 어떤 인연은 두 줄이고 어떤 인연은 스무 줄이라
 * 칸 높이가 사람마다 다른 목록이 나온다.
 *
 * 자리를 먼저 정해 두면 글이 그 자리에 맞춰 써진다. 여기서 정하는 것은
 * 그 자리다 — 몇 단계인지, 한 단계에 무엇이 들어가는지, 무엇을 채워야
 * 다음이 열리는지.
 *
 * ## 여기서 정한 것
 *
 *   단계 다섯   나 · 알아감 · 가까움 · 믿음 · 인연.  다섯인 까닭은 아래
 *               `STEPS` 에 적어 두었다
 *   짝          이 사람과 **다른 셋** 각각. 넷이면 여섯 쌍이라, 한 사람
 *               창에서는 셋만 본다
 *   여는 값     같이 싸운 판 수 (`도달` 자리). 실제로 세는 것은 나중에
 *   주는 것     단계마다 한 줄짜리 보상 — 지금은 자리만
 *
 * ## 안 정한 것
 *
 * 이야기 글, 실제 수치, 세는 법. 그것들이 붙을 때 이 파일의 `TODO` 가
 * 하나씩 지워진다.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId } from '@/core/chars';
import { Bar, Row, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { Pressable } from 'react-native';
import { BORDER, BORDER_HI, FS, LINE, O, R, SP, SURF } from '@/ui/theme';

/**
 * 인연의 단계 다섯.
 *
 * **다섯인 까닭**: 셋이면 가운데가 없어서 "조금 친하다" 를 말할 자리가 없고,
 * 열이면 한 칸 오르는 것이 아무 일도 아니게 된다. 다섯은 한 칸이 눈에 보일
 * 만큼 크면서 끝이 멀어 보이지 않는 수다.
 *
 * 이름을 **관계로** 짓는다 (`1단계` 가 아니라 `알아감`). 숫자로 두면 칸이
 * 곧 진도표가 되는데, 인연은 얼마나 갔나가 아니라 **지금 어떤 사이인가**를
 * 말하는 것이라야 이야기가 붙을 자리가 생긴다.
 */
const STEPS: readonly { id: number; name: string; need: number }[] = [
  { id: 0, name: '남', need: 0 },
  { id: 1, name: '알아감', need: 10 },
  { id: 2, name: '가까움', need: 30 },
  { id: 3, name: '믿음', need: 80 },
  { id: 4, name: '인연', need: 200 },
];

/**
 * 짝 하나의 칸.
 *
 * **얼굴 · 이름 · 단계 · 막대** 넷이다. 막대를 넣는 까닭: 단계 이름만
 * 있으면 다음 칸이 코앞인지 한참인지를 알 수가 없어서, 이 화면을 보고
 * 할 수 있는 일이 없다.
 */
function BondRow({ who, step, at, need, on, onPress }: {
  who: CharId;
  step: string;
  /** 지금 값 */
  at: number;
  /** 다음 칸까지 */
  need: number;
  /** 펼쳐 놓은 칸인가 */
  on: boolean;
  onPress: () => void;
}) {
  const d = CHARS[who];
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        on ? BORDER_HI : BORDER,
        {
          padding: SP.sm,
          marginBottom: SP.xs,
          backgroundColor: on || pressed ? SURF.up : 'transparent',
        },
      ]}
    >
      <Row gap={SP.sm}>
        {/* 얼굴 액자 — 도감·파티 칸과 같은 모양이라 같은 사람으로 읽힌다 */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: R.sm,
            borderWidth: 1,
            borderColor: LINE.low,
            backgroundColor: SURF.down,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprite set="avatar" name={d?.art ?? who} size={34} />
        </View>
        <View style={{ flex: 1 }}>
          <Row between>
            <T size={FS.body} bold numberOfLines={1}>{d?.name ?? who}</T>
            <Tag label={step} />
          </Row>
          <View style={{ marginTop: 3 }}>
            <Bar value={at} max={Math.max(1, need)} blocks={16} />
          </View>
        </View>
      </Row>
      {on && (
        /*
          펼친 자리 — **이야기가 들어올 칸**이다.

          지금은 무엇이 들어올지만 적어 둔다. 빈 상자로 두면 고장으로
          읽히고, `준비중` 한 마디만 두면 무엇이 준비중인지 모른다.
        */
        <View style={{ marginTop: SP.sm, gap: SP.xs }}>
          {STEPS.slice(1).map((s) => (
            <Row key={s.id} gap={SP.sm} style={{ alignItems: 'flex-start' }}>
              <View style={{ width: 52 }}>
                <T size={FS.tiny} bold dim={at >= s.need ? 'full' : 'dim'}>{s.name}</T>
                <T size={9} dim="dim">{`${s.need}판`}</T>
              </View>
              <View style={{ flex: 1, opacity: at >= s.need ? 1 : O.dim }}>
                <T size={FS.tiny} dim="sub">
                  {at >= s.need ? '이야기가 열립니다 (준비중)' : '아직 잠겨 있습니다'}
                </T>
              </View>
            </Row>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export function BondPopup({ who, onClose }: { who: CharId | null; onClose: () => void }) {
  const chars = useGame((s) => s.chars);
  const [open, setOpen] = useState<CharId | null>(null);

  if (!who) return null;
  const d = CHARS[who];

  /*
    짝은 **가진 사람 중 나 말고 전부**다.

    안 가진 사람도 보여 줄까 고민했는데, 그러면 이 창이 도감이 된다 —
    인연은 같이 싸워야 쌓이는 것이라 (`도달` 이 판 수다) 없는 사람과는
    쌓을 것이 아예 없다.
  */
  const mates = (Object.keys(chars) as CharId[]).filter((k) => k !== who && !!CHARS[k]);

  return (
    <Popup visible title={`${d?.name ?? who} · 인연`} onClose={onClose}>
      {/*
        ── 아직 안 도는 기능이라고 **맨 위에서** 말한다 ──

        아래 칸들이 다 0 이라 안 말하면 "내가 아직 안 쌓은 것" 으로 읽힌다.
        저건 고장이 아니라 아직 안 만든 것이고, 둘은 다른 말이다.
      */}
      <View
        style={[BORDER, { padding: SP.sm, marginBottom: SP.sm, backgroundColor: SURF.up }]}
      >
        <T size={FS.body} bold>준비중입니다</T>
        <T size={FS.tiny} dim="sub" style={{ marginTop: 3 }}>
          자리만 잡아 두었습니다. 같이 싸운 판이 쌓이면 단계가 오르고,
          단계마다 둘 사이의 이야기가 하나씩 열립니다. 아직 세지 않습니다.
        </T>
      </View>

      <T size={FS.title} bold style={{ marginBottom: SP.xs }}>함께 싸운 사이</T>
      {mates.length === 0 ? (
        <T size={FS.body} dim="dim">아직 다른 영웅이 없습니다.</T>
      ) : (
        mates.map((k) => (
          <BondRow
            key={k}
            who={k}
            step={STEPS[0].name}
            at={0}
            need={STEPS[1].need}
            on={open === k}
            onPress={() => setOpen(open === k ? null : k)}
          />
        ))
      )}
    </Popup>
  );
}
