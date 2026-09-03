/**
 * ── 프로필 ── 위 띠의 로고를 누르면 열린다.
 *
 * 네 가지를 한 창에서 본다: **로고 · UID · 닉네임 · 칭호.**
 *
 * ## 왜 넷을 같이 두나
 *
 * 넷 다 "남에게 보이는 나" 다. 순위표에도 채팅에도 투기장 상대 화면에도 이
 * 넷이 같이 나간다 — 따로 두면 얼굴을 바꾸러 들어왔다가 칭호가 어디 있는지
 * 다시 찾아야 한다.
 *
 * UID 만 못 바꾼다. 그래서 맨 위에 **읽기 전용 한 줄**로 둔다 — 바꿀 수
 * 있는 것들 사이에 끼워 두면 왜 안 눌리는지를 눌러 보고서야 안다.
 *
 * ## 잠긴 로고도 보여 준다
 *
 * 가진 것만 그리면 열여섯 칸이 열두 칸이 되어, 특별 넷이 있다는 것 자체를
 * 모른다. 잠긴 칸은 흐리게 두고 **어디서 나는지**를 적는다
 * (`core/avatars` 의 `AVATAR_FROM`).
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useGame, fmtIlvl } from '@/state/store';
import { selCurIlvl, selIlvl, selPenalty } from '@/state/selectors';
import {
  AVATAR_FROM, AVATAR_IDS, AVATAR_NAME, AVATAR_SOURCE, AvatarId,
} from '@/core/avatars';
import { NICKNAME_MAX } from '@/core/cash';
import { TITLES } from '@/core/titles';
import { Btn, Row, Sep, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { TitleTag } from '@/ui/TitleTag';
import { ICONS } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { BORDER, C, MONO, SP, WHITE } from '@/ui/theme';

/** 로고 칸 하나 */
function AvatarCell({
  id, on, owned, onPress,
}: { id: AvatarId; on: boolean; owned: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { if (owned) { sfx('tap'); onPress(); } }}
      style={[
        BORDER,
        {
          padding: 2,
          /* 고른 것만 굵은 테두리 — 흑백이라 굵기가 곧 강조다 */
          borderWidth: on ? 2 : 1,
          opacity: owned ? 1 : 0.3,
          backgroundColor: on ? C.bgInv : 'transparent',
        },
      ]}
    >
      <Sprite set="avatar" name={id} size={34} fallback={ICONS.badge} />
    </Pressable>
  );
}

export function ProfilePopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const account = useGame((s) => s.account);
  const nickname = useGame((s) => s.nickname);
  const avatar = useGame((s) => s.avatar);
  const owned = useGame((s) => s.ownedAvatars);
  const titles = useGame((s) => s.titles);
  const equipped = useGame((s) => s.equippedTitle);
  const setAvatar = useGame((s) => s.setAvatar);
  const setNickname = useGame((s) => s.setNickname);
  const equipTitle = useGame((s) => s.equipTitle);

  const cur = useGame(selCurIlvl);
  const ilvl = useGame(selIlvl);
  const penalty = useGame(selPenalty);

  const [draft, setDraft] = useState(nickname);

  /*
    UID 는 계정 id 를 **앞 열두 자만** 보여 준다.

    구글 id 는 스물한 자리 숫자이고 손님 계정은 더 길다. 통째로 적으면 한
    줄을 넘어 접히는데, 이 값이 하는 일은 문의할 때 불러 주는 것 하나라
    앞자리만 있어도 서로를 가른다.
  */
  const uid = (account?.id ?? '').slice(0, 12) || '—';

  return (
    <Popup visible={visible} title="프로필" onClose={onClose}>
      <View style={{ gap: SP.sm }}>
        {/* ── 지금 얼굴 ── */}
        <Row gap={SP.sm}>
          <View style={[BORDER, { padding: 2, borderWidth: 2 }]}>
            <Sprite set="avatar" name={avatar} size={48} fallback={ICONS.badge} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T size={13} bold numberOfLines={1}>{nickname || '이름 없음'}</T>
            <T size={10} dim="sub">{AVATAR_NAME[avatar] ?? ''}</T>
            <Row gap={4}>
              <T size={9} dim="dim">UID</T>
              <T size={9} dim="sub" style={{ fontFamily: MONO }} selectable>{uid}</T>
            </Row>
            {/*
              아이템레벨은 위 띠에서 여기로 내려왔다. **파는 것도 쓰는 것도
              아닌 값**이라 늘 보일 이유가 없고, 남에게 보이는 나의 일부라
              이 창이 맞는 자리다.

              내구도 보정이 걸려 있으면 원래 값을 같이 적는다 — 지금 값만
              보면 왜 낮은지가 화면에 없다.
            */}
            <Row gap={4}>
              <T size={9} dim="dim">아이템레벨</T>
              <T size={9} dim="sub">{fmtIlvl(cur)}</T>
              {penalty && <T size={9} dim="dim">{`/ ${fmtIlvl(ilvl)}`}</T>}
            </Row>
          </View>
        </Row>

        <Sep />

        {/* ── 닉네임 ── */}
        <T size={10} dim="sub">닉네임</T>
        <Row gap={SP.xs}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            maxLength={NICKNAME_MAX}
            placeholder="닉네임"
            placeholderTextColor="#FFFFFF55"
            style={[
              BORDER,
              {
                flex: 1,
                color: WHITE,
                fontFamily: MONO,
                fontSize: 13,
                paddingHorizontal: SP.xs,
                paddingVertical: 5,
              },
            ]}
          />
          <Btn
            label="변경"
            size="sm"
            /*
              눌러도 안 바뀌는 경우가 여럿이다 (90일이 안 지났거나, 같은
              이름이거나, 금칙어거나). **판단은 스토어가 한다** — 여기서
              한 번 더 세면 규칙이 두 곳에 생기고, 토스트로 이유를 말하는
              것도 저쪽이다 (`slices/account`).
            */
            onPress={() => { if (setNickname(draft) === 'ok') onClose(); }}
          />
        </Row>

        <Sep />

        {/* ── 로고 ── */}
        <T size={10} dim="sub">로고</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SP.xs }}>
          {AVATAR_IDS.map((id) => (
            <AvatarCell
              key={id}
              id={id}
              on={id === avatar}
              owned={owned.includes(id)}
              onPress={() => setAvatar(id)}
            />
          ))}
        </View>
        {/*
          안 가진 로고 중 **하나만** 어디서 나는지 적는다. 넷을 다 적으면
          네 줄이 되어 창이 로고 안내문이 된다 — 하나면 "저건 어디서 나나" 에
          답하면서 나머지도 같은 식으로 난다는 것을 알린다.
        */}
        {(() => {
          const locked = AVATAR_IDS.find((id) => !owned.includes(id));
          const from = locked ? AVATAR_FROM[AVATAR_SOURCE[locked]] : '';
          return from
            ? <T size={9} dim="dim">{`${AVATAR_NAME[locked as AvatarId]} — ${from}`}</T>
            : null;
        })()}

        <Sep />

        {/* ── 칭호 ── */}
        <T size={10} dim="sub">칭호</T>
        {!titles.length ? (
          <T size={10} dim="dim">아직 받은 칭호가 없습니다.</T>
        ) : (
          <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: SP.xs }}>
              {/*
                "떼기" 도 한 칸이다. 칭호를 하나 달고 나면 **다시 떼는 길이
                없어서** 마음에 안 드는 것이 영영 붙어 있었다.
              */}
              <Pressable onPress={() => { sfx('tap'); equipTitle(null); }}>
                <Row gap={SP.xs}>
                  <T size={11} bold={equipped === null}>
                    {equipped === null ? '● 안 달기' : '○ 안 달기'}
                  </T>
                </Row>
              </Pressable>
              {titles.map((t) => (
                <Pressable key={t} onPress={() => { sfx('tap'); equipTitle(t); }}>
                  <Row gap={SP.xs}>
                    <T size={11}>{equipped === t ? '●' : '○'}</T>
                    <TitleTag id={t} size={10} />
                    <T size={9} dim="dim" numberOfLines={1}>{TITLES[t]?.effect ?? ''}</T>
                  </Row>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <Btn label="닫기" onPress={onClose} fill />
    </Popup>
  );
}
