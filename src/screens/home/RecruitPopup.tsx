/**
 * 캐릭터 모집.
 *
 * 파티는 네 자리인데 캐릭터를 얻는 길이 "처음 한 명 고르기" 뿐이었다.
 * 자리를 만들어 놓고 채울 방법을 안 주면 그 자리는 기능이 아니라 결함이다.
 *
 * ## 뽑은 뒤에 창을 안 닫는다
 *
 * 뽑자마자 닫히면 누가 나왔는지 보기도 전에 사라진다. 결과를 그 자리에
 * 크게 띄우고, 다음 값도 같이 보여 준다 — 한 번 더 뽑을지를 창을 다시 열지
 * 않고 정할 수 있어야 한다.
 *
 * ## 도감을 겸한다
 *
 * 아래에 열두 명이 다 보인다. 안 가진 사람은 이름과 등급만 보이고 얼굴이
 * 흐리다. 무엇이 남았는지 모르면 뽑을 이유가 안 생긴다.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/state/store';
import { CHARS, CHAR_LIST, CharId, ROLE_NAME } from '@/core/chars';
import { GRADE_WEIGHT, gradeOdds, poolOf, recruitCost } from '@/core/recruit';
import { fmt } from '@/core/currency';
import { Btn, KV, Row, Sep, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { Money } from '@/ui/Money';
import { BORDER, SP } from '@/ui/theme';

export function RecruitPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const chars = useGame((s) => s.chars);
  const money = useGame((s) => s.money);
  const draw = useGame((s) => s.recruitDraw);
  const toast = useGame((s) => s.toast);

  /** 방금 뽑힌 사람 — 창을 닫으면 지운다 */
  const [got, setGot] = useState<CharId | null>(null);

  const owned = Object.keys(chars);
  const pool = poolOf(owned);
  const cost = recruitCost(owned.length);
  const odds = gradeOdds(owned);
  const canPay = money >= cost && pool.length > 0;

  const run = () => {
    const r = draw();
    if (r === 'poor') { toast('골드가 부족합니다', 'bad'); return; }
    if (r === 'full') { toast('모든 캐릭터를 모았습니다', 'plain'); return; }
    setGot(r.id);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const close = () => { setGot(null); onClose(); };

  if (!visible) return null;

  const gd = got ? CHARS[got] : null;

  return (
    <Popup
      visible
      title="캐릭터 모집"
      onClose={close}
      right={<Money amount={money} size={11} />}
    >
      {gd ? (
        <View style={[BORDER, { padding: SP.md, alignItems: 'center', borderWidth: 2 }]}>
          <Sprite set="avatar" name={gd.art} size={56} />
          {/* 칭호는 아직 다 만든 캐릭터에만 있다 (`core/chars`) */}
          {!!gd.title && <T size={9} dim="dim" style={{ marginTop: SP.xs }}>{gd.title}</T>}
          <Row gap={SP.xs} style={{ marginTop: gd.title ? 0 : SP.xs }}>
            <T size={16} bold>{gd.name}</T>
            <Tag label={gd.grade} fill={gd.grade === 'S' || gd.grade === 'A'} />
          </Row>
          <T size={10} dim="sub">{ROLE_NAME[gd.role]} · {gd.gear}</T>
          {!!gd.quote && (
            <T size={10} dim="sub" center style={{ marginTop: SP.xs }}>{gd.quote}</T>
          )}
          <T size={10} dim="dim" style={{ marginTop: 2 }}>파티에 자리가 있으면 바로 섭니다</T>
        </View>
      ) : (
        <T size={11} dim="sub">
          아직 없는 캐릭터 중에서 한 명이 나옵니다. 중복은 나오지 않습니다.
        </T>
      )}

      <Sep />

      {pool.length === 0 ? (
        <T size={12} bold center>열두 명을 전부 모았습니다</T>
      ) : (
        <>
          <KV k="모집 비용" v={fmt(cost)} warn={money < cost} />
          <KV k="남은 캐릭터" v={`${pool.length}명`} dim />
          <Row gap={SP.xs} style={{ marginTop: SP.xs, flexWrap: 'wrap' }}>
            {(['S', 'A', 'B', 'C'] as const).map((g) => (
              odds[g] ? (
                <Tag key={g} label={`${g} ${Math.round(odds[g]! * 100)}%`} fill={g === 'S'} />
              ) : null
            ))}
          </Row>
          <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
            등급은 **얼마나 세냐**가 아니라 강화 한 칸당 성장률입니다.
            C 를 뽑아도 초반 파티를 채우는 데는 손해가 없습니다.
          </T>
          <Btn
            label={got ? '한 번 더' : '모집하기'}
            sub={fmt(cost)}
            size="lg"
            fill={canPay}
            disabled={!canPay}
            style={{ marginTop: SP.md }}
            onPress={run}
          />
          {money < cost && (
            <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>
              {fmt(cost - money)} 더 필요합니다 — 전투로 모입니다
            </T>
          )}
        </>
      )}

      <Sep />
      <T size={11} bold style={{ marginBottom: SP.xs }}>
        도감 {owned.length} / {CHAR_LIST.length}
      </T>
      <Row gap={SP.xs} style={{ flexWrap: 'wrap' }}>
        {CHAR_LIST.map((d) => {
          const have = !!chars[d.id];
          return (
            <View
              key={d.id}
              style={[
                BORDER,
                {
                  width: '23%',
                  paddingVertical: SP.xs,
                  alignItems: 'center',
                  borderStyle: have ? 'solid' : 'dashed',
                  opacity: have ? 1 : 0.4,
                },
              ]}
            >
              <Sprite set="avatar" name={d.art} size={26} opacity={have ? 1 : 0.5} />
              <T size={8} center numberOfLines={1} style={{ marginTop: 2 }}>
                {have ? d.name : '???'}
              </T>
              <T size={8} dim="dim">{d.grade}</T>
            </View>
          );
        })}
      </Row>
    </Popup>
  );
}
