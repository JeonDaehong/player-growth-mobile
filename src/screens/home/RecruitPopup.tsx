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
 *
 * ## 다 모아도 안 닫힌다
 *
 * 예전에는 열둘을 다 모으면 모집이 닫혔다. 중복이 허탕이었기 때문이다.
 *
 * 성 체계가 생기면서 (`core/growth`) 이미 가진 사람이 나오는 것이 **조각
 * 한 장**이 되었다 — 조각 둘이면 한 성이고, 성이 오르면 레벨 상한과 기술이
 * 열린다. 그래서 다 모은 뒤가 오히려 진짜 시작이다.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/state/store';
import {
  CHARS, CHAR_LIST, CharId, RARITY_IDS, RARITY_NAME, ROLE_NAME,
  maxStar as maxStarOf,
} from '@/core/chars';
import { allOwned, rarityOdds, poolOf, recruitCost } from '@/core/recruit';
import { fmt } from '@/core/currency';
import { Btn, KV, Row, Sep, Stars, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { Money } from '@/ui/Money';
import { BORDER, BORDER_HI, FS, LINE, R, SP, SURF } from '@/ui/theme';

export function RecruitPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const chars = useGame((s) => s.chars);
  const money = useGame((s) => s.money);
  const draw = useGame((s) => s.recruitDraw);
  const toast = useGame((s) => s.toast);

  /** 방금 뽑힌 사람 — 창을 닫으면 지운다 */
  const [got, setGot] = useState<CharId | null>(null);
  /** 방금 것이 **조각**이었나 (이미 가진 사람) */
  const [dup, setDup] = useState(false);

  const owned = Object.keys(chars);
  const pool = poolOf(owned);
  const cost = recruitCost(owned.length);
  const odds = rarityOdds(owned);
  /*
    다 모았으면 이제부터는 조각만 나온다 (`core/recruit` 의 `allOwned`).
    그래도 뽑을 수 있으므로 값만 보고 막는다.
  */
  const shards = allOwned(owned);
  const canPay = money >= cost;

  const run = () => {
    const r = draw();
    if (r === 'poor') { toast('골드가 부족합니다', 'bad'); return; }
    if (r === 'full') { toast('뽑을 수 있는 캐릭터가 없습니다', 'plain'); return; }
    setGot(r.id);
    setDup(r.dup);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const close = () => { setGot(null); setDup(false); onClose(); };

  if (!visible) return null;

  const gd = got ? CHARS[got] : null;

  return (
    <Popup
      visible
      title="캐릭터 모집"
      onClose={close}
      right={<Money amount={money} size={11} />}
    >
      {gd && got ? (
        <View
          style={[
            BORDER_HI,
            {
              padding: SP.md,
              alignItems: 'center',
              borderRadius: R.lg,
              backgroundColor: SURF.up,
            },
          ]}
        >
          <Sprite set="avatar" name={gd.art} size={56} />
          {/* 칭호는 아직 다 만든 캐릭터에만 있다 (`core/chars`) */}
          {!!gd.title && <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>{gd.title}</T>}
          <Row gap={SP.xs} style={{ marginTop: gd.title ? 0 : SP.xs }}>
            <T size={FS.hero} bold>{gd.name}</T>
            <Tag
              label={RARITY_NAME[gd.rarity]}
              fill={gd.rarity === 'mythic' || gd.rarity === 'legendary'}
            />
          </Row>
          <T size={FS.label} dim="sub">{ROLE_NAME[gd.role]} · {gd.gear}</T>
          {!!gd.quote && (
            <T size={FS.label} dim="sub" center style={{ marginTop: SP.xs }}>{gd.quote}</T>
          )}
          {/*
            **조각과 새 사람을 확실히 갈라 적는다.**

            둘 다 같은 얼굴이 뜨므로, 한 줄이 없으면 이미 가진 사람이 또
            나온 것을 "왜 도감이 안 늘지" 로 읽게 된다. 지금 가진 조각 수를
            같이 적어 두면 그 한 장이 어디에 쌓였는지가 보인다.
          */}
          <T size={FS.label} bold style={{ marginTop: SP.xs }}>
            {dup
              ? `조각 한 장 — 지금 ${chars[got]?.copies ?? 0}장`
              : '파티에 자리가 있으면 바로 섭니다'}
          </T>
        </View>
      ) : (
        <T size={FS.body} dim="sub">
          {shards
            ? '열둘을 다 모았습니다. 이제부터는 이미 가진 사람의 조각이 나옵니다 — 둘이면 한 성입니다.'
            : '아직 없는 캐릭터 중에서 한 명이 나옵니다. 다 모으면 그때부터 조각이 나옵니다.'}
        </T>
      )}

      <Sep />

      <KV k="모집 비용" v={fmt(cost)} warn={money < cost} />
      <KV k={shards ? '나오는 것' : '남은 캐릭터'} v={shards ? '조각 1장' : `${pool.length}명`} dim />
      <Row gap={SP.xs} style={{ marginTop: SP.xs, flexWrap: 'wrap' }}>
        {/* 높은 등급부터 — 사람이 궁금해하는 순서다 */}
        {[...RARITY_IDS].reverse().map((g) => (
          odds[g] ? (
            <Tag
              key={g}
              label={`${RARITY_NAME[g]} ${Math.round(odds[g]! * 100)}%`}
              fill={g === 'mythic'}
            />
          ) : null
        ))}
      </Row>
      <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
        등급은 지금 당장의 세기가 아니라 **어디까지 가느냐**입니다 — 갈 수 있는
        성과 강화 성장률을 정합니다. 일반은 1성, 신화는 각성까지 갑니다.
      </T>
      <Btn
        label={got ? '한 번 더' : shards ? '조각 뽑기' : '모집하기'}
        sub={fmt(cost)}
        size="lg"
        fill={canPay}
        disabled={!canPay}
        style={{ marginTop: SP.md }}
        onPress={run}
      />
      {money < cost && (
        <T size={FS.label} dim="dim" center style={{ marginTop: SP.xs }}>
          {fmt(cost - money)} 더 필요합니다 — 전투로 모입니다
        </T>
      )}

      <Sep />
      <T size={11} bold style={{ marginBottom: SP.xs }}>
        도감 {owned.length} / {CHAR_LIST.length}
      </T>
      <Row gap={SP.xs} style={{ flexWrap: 'wrap' }}>
        {CHAR_LIST.map((d) => {
          const mine = chars[d.id];
          const have = !!mine;
          return (
            <View
              key={d.id}
              style={[
                BORDER,
                {
                  width: '23%',
                  paddingVertical: SP.xs,
                  alignItems: 'center',
                  gap: 1,
                  borderStyle: have ? 'solid' : 'dashed',
                  borderColor: have ? LINE.mid : LINE.low,
                  backgroundColor: have ? SURF.up : SURF.down,
                  opacity: have ? 1 : 0.45,
                },
              ]}
            >
              <Sprite set="avatar" name={d.art} size={26} opacity={have ? 1 : 0.5} />
              <T size={8} center numberOfLines={1} style={{ marginTop: 2 }}>
                {have ? d.name : '???'}
              </T>
              {/*
                가진 사람은 **별**을, 안 가진 사람은 등급 이름을 적는다.
                가진 사람에게 궁금한 것은 등급이 아니라 얼마나 키웠나다.
              */}
              {mine
                ? <Stars star={mine.star} max={maxStarOf(d.rarity)} awake={mine.awake} scale={1.2} />
                : <T size={8} dim="dim">{RARITY_NAME[d.rarity]}</T>}
            </View>
          );
        })}
      </Row>
    </Popup>
  );
}
