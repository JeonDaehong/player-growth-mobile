/**
 * ── 자리 하나를 고치는 창 ── 편성의 1~4번 칸을 누르면 뜬다.
 *
 * 여기서 캐릭터 창이 통째로 열렸다 (`CharPopup`). 그 창은 **한 사람을 보는
 * 자리**라 수치와 기술과 키우는 단추가 다 들어 있는데, 편성에서 칸을 누른
 * 사람이 하려던 일은 "이 자리에 누굴 세울까" 하나다. 창을 열면 그 하나를
 * 하려고 스무 줄을 지나가야 했고, 정작 바꾸는 단추는 그 아래에 있었다.
 *
 * 그래서 이 창은 **두 가지만** 말한다.
 *
 *   지금 이 자리에 누가 서 있나
 *   바꿔 세울 수 있는 사람은 누구인가
 *
 * 골드도 안 뜬다. 자리를 바꾸는 데 드는 것이 없으므로 지갑을 볼 일이 없다.
 *
 * ## 이미 다른 자리에 선 사람은 **보이되 안 눌린다**
 *
 * 목록에서 빼 버릴 수도 있었다. 그러면 "얘가 왜 없지" 가 되고, 안 보이는
 * 것과 못 고르는 것을 구분할 방법이 화면에 없다.
 *
 * 남겨 두고 **몇 번에 서 있는지**를 띠로 적는다. 그러면 그 사람을 이리로
 * 데려오려면 저 번호를 비워야 한다는 것이 한눈에 읽힌다.
 *
 * 자리를 맞바꾸지 않는 것은 일부러다 (`setPartySlot` 은 맞바꿀 줄 안다).
 * 맞바꾸면 누른 한 번에 **두 자리**가 바뀌는데, 이 창은 한 자리를 고치러
 * 들어온 자리다 — 다른 칸이 같이 움직이면 그건 여기서 한 일이 아니다.
 */
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId, capOf, maxStar } from '@/core/chars';
import { Btn, Row, Stars, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, BORDER_HI, C, FS, LINE, O, R, SP, SURF } from '@/ui/theme';

/** 목록의 초상 한 칸 — 셋이 한 줄 */
function Face({ id, at, here, onPress }: {
  id: CharId;
  /** 다른 자리에 서 있으면 그 번호 (1~4), 아니면 0 */
  at: number;
  /** 지금 이 자리에 선 사람인가 */
  here: boolean;
  onPress: () => void;
}) {
  const chars = useGame((s) => s.chars);
  const c = chars[id];
  const d = CHARS[id];
  if (!c || !d) return null;
  /* 다른 자리에 서 있으면 못 고른다 — 까닭은 머리말에 */
  const busy = at > 0 && !here;

  return (
    <View style={{ width: '33.333%', paddingHorizontal: SP.xs / 2, marginBottom: SP.xs }}>
      <Pressable
        disabled={busy}
        onPress={() => { sfx('tap'); onPress(); }}
        style={({ pressed }) => [
          here ? BORDER_HI : BORDER,
          {
            paddingTop: SP.sm,
            alignItems: 'center',
            gap: 2,
            overflow: 'hidden',
            backgroundColor: here || (pressed && !busy) ? SURF.up : 'transparent',
            borderColor: here ? LINE.hi : LINE.low,
            /* 못 고르는 칸은 흐리게 — 지우지 않고 남긴다 */
            opacity: busy ? O.dim : 1,
          },
        ]}
      >
        <Sprite set="avatar" name={d.art} size={40} />
        <T size={FS.tiny} bold center numberOfLines={1}>{d.name}</T>
        <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={8} />
        <T size={8} dim="dim">{`Lv ${c.lv} / ${capOf(c)}`}</T>
        {/*
          ── 띠 ── 칸 아래에 꽉 차게 붙는다.

          **자리를 늘 지킨다.** 띠가 있는 칸만 키가 커지면 격자가 들쭉날쭉해
          지므로, 없을 때는 빈 띠가 그 높이를 잡고 있는다 (도감의 `출정` 띠와
          같은 규칙이다).
        */}
        <View
          style={{
            height: 14,
            width: '100%',
            marginTop: 3,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: here ? C.bgInv : (busy ? SURF.up : 'transparent'),
          }}
        >
          {here && <T size={9} bold style={{ color: C.fgInv }}>이 자리</T>}
          {busy && <T size={9} dim="sub">{`${at}번 출전중`}</T>}
        </View>
      </Pressable>
    </View>
  );
}

export function PartySlotPopup({ slot, onClose }: {
  /** 몇 번째 자리인가 (0~3). `null` 이면 안 뜬다 */
  slot: number | null;
  onClose: () => void;
}) {
  const chars = useGame((s) => s.chars);
  /* 짜 둔 것이 있으면 그것이 지금의 편성이다 (`HeroScreen` 과 같은 규칙) */
  const party = useGame((s) => s.pendingParty ?? s.party);
  const setPartySlot = useGame((s) => s.setPartySlot);

  if (slot === null) return null;
  const now = party[slot] ?? null;
  const d = now ? CHARS[now] : null;
  const c = now ? chars[now] : null;

  /** 이 사람이 몇 번 자리에 서 있나 — 안 서 있으면 0 */
  const seatOf = (id: CharId) => {
    const at = party.indexOf(id);
    return at < 0 ? 0 : at + 1;
  };

  const owned = (Object.keys(chars) as CharId[]).filter((id) => !!CHARS[id]);

  return (
    <Popup visible title={`${slot + 1}번 자리`} onClose={onClose}>
      {/*
        ── 지금 이 자리 ── 창의 맨 위.

        빈 자리도 같은 크기의 상자로 둔다. 비어 있을 때만 상자가 없으면
        아래 목록이 위로 올라와서, 창을 열 때마다 높이가 달라진다.
      */}
      <View
        style={[
          BORDER,
          {
            padding: SP.sm,
            backgroundColor: SURF.up,
            borderColor: c ? LINE.mid : LINE.low,
            borderStyle: c ? 'solid' : 'dashed',
          },
        ]}
      >
        {c && d ? (
          <Row gap={SP.sm}>
            <Sprite set="avatar" name={d.art} size={44} />
            <View style={{ flex: 1 }}>
              <T size={FS.hero} bold numberOfLines={1}>{d.name}</T>
              <Row gap={SP.xs} style={{ marginTop: 2, alignItems: 'center' }}>
                <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={10} />
                <T size={FS.tiny} dim="dim">{`Lv ${c.lv} / ${capOf(c)}`}</T>
              </Row>
            </View>
            {/*
              ── 해지 ── 이 자리를 그냥 비운다.

              바꿔 세우는 것과 **다른 일**이다. 셋이서 도는 편성이 넷보다
              나은 판이 있고 (뒷줄만 남기면 다 안 맞는다), 무엇보다 다른
              자리에 선 사람을 이리로 데려오려면 저기를 먼저 비워야 한다.
            */}
            <Btn
              label="해지"
              size="sm"
              onPress={() => { sfx('tap'); setPartySlot(slot, null); }}
            />
          </Row>
        ) : (
          <T size={FS.body} dim="dim" center>비어 있습니다</T>
        )}
      </View>

      <T size={FS.title} bold style={{ marginTop: SP.md, marginBottom: SP.xs }}>
        바꿔 세우기
      </T>
      <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
        {/*
          셋씩 선다. 칸에 음수 여백을 주지 않고 **바깥에서** 안쪽 여백으로
          벌린다 — 폭이 33.333% 인 칸에 `gap` 을 얹으면 합이 100% 를 넘어
          한 줄에 둘밖에 안 들어간다 (도감에서 겪은 것과 같다).
        */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -SP.xs / 2,
          }}
        >
          {owned.map((id) => (
            <Face
              key={id}
              id={id}
              at={seatOf(id)}
              here={id === now}
              onPress={() => {
                setPartySlot(slot, id);
                onClose();
              }}
            />
          ))}
        </View>
      </ScrollView>

      <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
        다른 번호에 서 있는 영웅은 그 자리를 먼저 비워야 데려올 수 있습니다.
      </T>
    </Popup>
  );
}
