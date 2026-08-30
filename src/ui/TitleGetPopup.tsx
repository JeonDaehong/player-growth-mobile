/**
 * 칭호 획득 알림.
 *
 * ## 왜 토스트로는 부족했나
 *
 * 칭호는 3초짜리 토스트로 지나갔다. 그런데 칭호는 이 게임에서 손에 꼽게 드문
 * 사건이고, 선착순 칭호는 **로고까지 같이 열린다.** 두 가지가 동시에 토스트로
 * 스쳐 지나가면 "뭔가 지나갔는데 뭐였지" 가 된다 — 실제로 선착순 칭호를 받은
 * 사람이 자기 로고가 열린 걸 모르고 지나갔다.
 *
 * 팝업은 **닫아야 사라진다.** 그게 이 알림에 필요한 성질이다.
 *
 * 대기열은 스토어가 들고 있어(`titleQueue`) 저장에 남는다 — 칭호를 받는 순간
 * 다른 팝업이 떠 있었더라도, 앱을 껐다 켜도 놓치지 않는다.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { TITLES } from '@/core/titles';
import { AVATAR_NAME } from '@/core/avatars';
import { Btn, KV, Row, Sep, T, Tag } from './atoms';
import { Popup } from './Popup';
import { Sprite } from './Sprite';
import { TitleTag, RARITY_LABEL } from './TitleTag';
import { ICONS } from './sprites';
import { BORDER, SP } from './theme';

export function TitleGetPopup({ active }: { active: boolean }) {
  const queue = useGame((s) => s.titleQueue);
  const pop = useGame((s) => s.popTitleNotice);
  const equipTitle = useGame((s) => s.equipTitle);
  const equipped = useGame((s) => s.equippedTitle);

  const head = active ? queue[0] : undefined;
  if (!head) return null;

  const def = TITLES[head.id];
  const rarity = def.rarity ?? 0;

  return (
    <Popup
      visible
      title="칭호 획득"
      onClose={pop}
      right={rarity > 0 ? <Tag label={RARITY_LABEL[rarity]} fill={rarity >= 2} /> : undefined}
    >
      <Row gap={SP.md}>
        <View style={[BORDER, { padding: SP.sm, borderWidth: 2 }]}>
          <Sprite set="title" name={head.id} size={56} fallback={ICONS.badge} />
        </View>
        <View style={{ flex: 1 }}>
          <Row style={{ marginBottom: 4 }}>
            <TitleTag id={head.id} size={13} />
          </Row>
          <T size={10} dim="sub">{def.cond}</T>
        </View>
      </Row>

      <Sep />
      <T size={10} dim="sub">효과</T>
      <View style={[BORDER, { padding: SP.sm, marginTop: SP.xs }]}>
        <T size={13} bold>{def.effect}</T>
      </View>

      {/*
        같이 들어온 로고.

        이게 이 팝업을 만든 이유다 — 칭호와 로고가 함께 열리는데 토스트 두 개가
        연달아 지나가면 뒤엣것은 아무도 못 본다. 그림을 실제로 보여 준다.
      */}
      {!!head.avatar && (
        <>
          <Sep />
          <T size={10} dim="sub">함께 열린 로고</T>
          <Row gap={SP.md} style={{ marginTop: SP.xs }}>
            <View style={[BORDER, { padding: 3, borderWidth: 2 }]}>
              <Sprite set="avatar" name={head.avatar} size={64} />
            </View>
            <View style={{ flex: 1 }}>
              <T size={14} bold>{AVATAR_NAME[head.avatar]}</T>
              <T size={10} dim="sub" style={{ marginTop: 2 }}>
                투기장·랭킹·채팅 명패에 뜹니다. 기타 › 프로필에서 바꿀 수 있습니다.
              </T>
            </View>
          </Row>
        </>
      )}

      {!!def.limited && (
        <>
          <Sep />
          <KV k="선착순" v={`${def.limited.toLocaleString('en-US')}명`} dim />
          <T size={9} dim="dim">한 번 나가면 다시 얻을 수 없는 칭호입니다.</T>
        </>
      )}

      {/*
        바로 낄 수 있게 해 준다. 팝업을 닫고 기타 › 프로필 › 칭호 변경까지
        걸어가야 하면, 방금 받은 것을 그 자리에서 못 쓴다.
        패널티 칭호는 스스로 붙는 것이라 고를 것이 없다.
      */}
      <Row gap={SP.sm} style={{ marginTop: SP.md }}>
        {!def.penalty && equipped !== head.id && (
          <Btn
            label="바로 장착"
            size="lg"
            fill
            style={{ flex: 1 }}
            onPress={() => { equipTitle(head.id); pop(); }}
          />
        )}
        <Btn label="확인" size="lg" fill={def.penalty || equipped === head.id} style={{ flex: 1 }} onPress={pop} />
      </Row>
    </Popup>
  );
}
