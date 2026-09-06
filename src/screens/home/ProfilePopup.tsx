/**
 * ── 프로필 ── 위 띠의 로고를 누르면 열린다.
 *
 * 셋을 한 창에서 본다: **로고 · UID · 닉네임.**
 *
 * 셋 다 "남에게 보이는 나" 다. 순위표에도 채팅에도 투기장 상대 화면에도 이
 * 셋이 같이 나간다 — 따로 두면 얼굴을 바꾸러 들어왔다가 이름이 어디 있는지
 * 다시 찾아야 한다.
 *
 * UID 만 못 바꾼다. 그래서 맨 위에 **읽기 전용 한 줄**로 둔다 — 바꿀 수
 * 있는 것들 사이에 끼워 두면 왜 안 눌리는지를 눌러 보고서야 안다.
 *
 * ## 걷어 낸 것들
 *
 * **칭호** — 표째로 다시 짤 것이라 지금은 아무 데도 안 뜬다.
 *
 * **아이템레벨** — 위 띠에서 여기로 내려왔던 값인데, 여기서도 아무 판단에
 * 안 쓰였다. 장비를 보러 가면 거기 있다.
 *
 * **잠긴 로고 목록** — 열여섯 칸 중 열둘이 이 게임 어디에도 안 나오는
 * 낯선 사람이었다. 이제 로고 하나와 **모집한 캐릭터**만 뜬다
 * (`core/avatars` 의 `avatarsFor`) — 얼굴이 곧 "내가 이 사람을 가졌다" 다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useGame } from '@/state/store';
import { AvatarId, avatarsFor } from '@/core/avatars';
import { NICKNAME_MAX } from '@/core/cash';
import { Btn, Row, Sep, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { ICONS } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { BORDER, LINE, MONO, SP, WHITE } from '@/ui/theme';

/** 로고 칸 하나 */
/*
  ── 잠긴 칸이 없어졌다 ──

  안 가진 것을 흐리게 남겨 두던 자리다. 목록이 열여섯일 때는 "특별 넷이
  있다" 를 알리는 값이 있었는데, 이제 목록이 로고 하나와 **모집한 사람들**
  이라 잠긴 칸은 곧 "아직 안 뽑은 캐릭터" 다 — 그건 모집 화면이 할 말이고,
  얼굴 고르는 자리에서 다시 세어 보여 줄 것이 아니다.
*/
function AvatarCell({
  id, on, onPress,
}: { id: AvatarId; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={[
        BORDER,
        {
          padding: 2,
          alignItems: 'center',
          /*
            ── 고른 칸은 **테두리만** 밝다 ──

            흰 바탕으로 뒤집고 있었다. 그러면 그 한 칸이 창에서 제일 밝은
            덩어리가 되는데, 정작 봐야 하는 것은 **그 안의 얼굴**이다 —
            흰 판 위에 얹힌 도트 그림은 바탕과 붙어서 오히려 덜 보였다.

            테두리만 밝히면 "골랐다" 는 그대로 읽히면서 얼굴은 원래 배경
            위에 남는다. 대형 고르는 칸이 같은 이유로 같은 규칙을 쓴다
            (`FormationPicker`).
          */
          borderWidth: on ? 2 : 1,
          borderColor: on ? WHITE : LINE.mid,
        },
      ]}
    >
      {/*
        이름은 안 적는다. 목록이 로고 하나와 **모집한 캐릭터**뿐이라
        (`avatarsFor`) 얼굴이 곧 그 사람이다 — 넷 아래에 이름을 또 적으면
        얼굴을 고르는 자리가 이름표 목록이 된다.
      */}
      <Sprite set="avatar" name={id} size={34} fallback={ICONS.badge} />
    </Pressable>
  );
}

export function ProfilePopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const account = useGame((s) => s.account);
  const nickname = useGame((s) => s.nickname);
  const avatar = useGame((s) => s.avatar);
  const chars = useGame((s) => s.chars);
  const setAvatar = useGame((s) => s.setAvatar);
  const setNickname = useGame((s) => s.setNickname);

  /* 로고 하나 + 모집한 사람들. 새 배열이라 기억해 둔다 */
  const list = useMemo(() => avatarsFor(Object.keys(chars)), [chars]);

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
            <Row gap={4}>
              <T size={9} dim="dim">UID</T>
              <T size={9} dim="sub" style={{ fontFamily: MONO }} selectable>{uid}</T>
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

        {/* ── 로고 ── 게임 로고 하나 + 모집한 사람들 */}
        <T size={10} dim="sub">로고</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SP.xs }}>
          {list.map((id) => (
            <AvatarCell
              key={id}
              id={id}
              on={id === avatar}
              onPress={() => setAvatar(id)}
            />
          ))}
        </View>
      </View>

      {/*
        ── 단추 앞에 한 뼘 ──

        로고 칸 바로 밑에 단추가 붙어 있었다. 마지막 얼굴을 누르려던 손가락이
        그대로 "확인" 에 닿는 거리라, 고르다가 창이 닫힌다.
      */}
      <Btn
        label="확인"
        onPress={onClose}
        fill
        style={{ marginTop: SP.lg }}
      />
    </Popup>
  );
}
