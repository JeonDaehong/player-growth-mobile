/**
 * 자동 강화 — 창고 여러 개, 착용 한 자루.
 *
 * `HomeScreen.tsx` 한 파일에 1,700줄이 있던 시절에는 팝업 하나를 고치려고
 * 열 때마다 관계없는 다섯 개를 지나야 했다. 화면은 화면대로, 팝업은 팝업대로 둔다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { KIND_NAME, TIERS, fmtIlvl, itemLevel, itemName, useGame } from '@/state/store';
import { selRuneGuard, selRuneRate, useEffects, useGuildEffects } from '@/state/selectors';
import { isArtisan } from '@/core/tiers';
import { SLOT_NAME, ScrollId, SlotId } from '@/core/types';
import {
  ENHANCE_SCROLL_ORDER,
  SCROLLS,
  canEnhance,
  canPromote,
  effectiveOdds,
  enhanceCost,
  promoteCost,
} from '@/core/enhance';
import { fmt, fmtShort } from '@/core/currency';
import { Btn, KV, ListItem, Row, Sep, T, Tag } from '@/ui/atoms';
import { BORDER, SP } from '@/ui/theme';
import { WEAPON_SPRITES } from '@/ui/sprites';
import { Sprite } from '@/ui/Sprite';
import { ChargeGauge, EnhanceFx, FxKind } from '@/ui/EnhanceFx';
import { Popup } from '@/ui/Popup';
import { sfx } from '@/ui/sfx';
import { AutoOnePopup } from './AutoEnhance';
import { ItemHead, MilestoneLine, OddsCell, PromoteWarning } from './parts';

export function EnhancePopup({
  slot, visible, onBack, onClose,
}: {
  slot: SlotId | null;
  visible: boolean;
  onBack: () => void;
  onClose: () => void;
}) {
  const item = useGame((s) => (slot ? s.equipped[slot] : null));
  const money = useGame((s) => s.money);
  const scrolls = useGame((s) => s.scrolls);
  const eff = useEffects();
  const doEnhance = useGame((s) => s.doEnhance);
  const doPromote = useGame((s) => s.doPromote);

  const [scroll, setScroll] = useState<ScrollId | null>(null);
  const [charging, setCharging] = useState(false);
  const [fx, setFx] = useState<FxKind>(null);
  const [last, setLast] = useState<string | null>(null);
  /**
   * 자동 강화 창을 겹쳐 띄웠는가.
   *
   * 띄우는 동안 이 창은 **숨긴다** (닫지 않는다 — 닫으면 고른 주문서가 날아간다).
   * 팝업 위에 팝업이 겹쳐 보이면 어느 쪽 버튼이 살아 있는지 알 수 없다.
   */
  const [autoOpen, setAutoOpen] = useState(false);
  /** 승급 성공 직후 결과 화면. 이름을 미리 담아 둔다 (승급하면 아이템이 바뀐다) */
  const [promoted, setPromoted] = useState<string | null>(null);
  /**
   * 파괴 결과 화면. 파괴되는 순간 아이템이 사라지므로 무엇을 잃었는지 미리 담아 둔다.
   * 예전에는 파괴되면 팝업이 그대로 닫혀서, 연출도 설명도 못 보고 장비만 없어졌다.
   */
  const [destroyed, setDestroyed] = useState<
    { name: string; hadSpirit: boolean; hadAlch: boolean } | null
  >(null);
  const nonce = useRef(0);

  const target = item ? item.level + 1 : 1;
  /**
   * 화면에 보이는 확률은 실제로 굴리는 확률과 **같은 인자**로 계산해야 한다.
   * 정령석·길드를 여기서 빼먹으면 "40%라더니 안 되네" 가 된다.
   */
  const runeRate = useGame(selRuneRate);
  const runeGuard = useGame(selRuneGuard);
  const gmul = useGuildEffects();
  const odds = useMemo(
    () => effectiveOdds(target, scroll, eff.enhanceBonusPct, item?.tier ?? 1, {
      spiritPct: runeRate,
      guildMul: gmul.enhanceMul,
      guardPct: runeGuard + gmul.guardAdd,
    }),
    [target, scroll, eff.enhanceBonusPct, item?.tier, runeRate, runeGuard, gmul],
  );

  // 팝업을 닫으면 결과 화면도 치운다 — 다음에 열었을 때 지난 승급 결과가 남아 있으면 안 된다
  React.useEffect(() => {
    if (!visible) {
      setPromoted(null);
      setDestroyed(null);
      setLast(null);
      setAutoOpen(false);
    }
  }, [visible]);

  /*
    장비가 사라졌는데 파괴 결과 화면도 없다면 (예: 판매·회생) 강화 창을 닫는다.
    파괴로 사라진 경우에는 결과 화면을 먼저 보여 주고, 확인을 눌러야 닫는다.
  */
  const gone = visible && !!slot && !item && !destroyed;
  React.useEffect(() => {
    if (gone) onClose();
  }, [gone, onClose]);

  // ── 파괴 결과 ──
  if (slot && destroyed) {
    const closeDestroyed = () => { setDestroyed(null); onClose(); };
    return (
      <Popup
        visible={visible}
        title={`파괴 — ${SLOT_NAME[slot]}`}
        onClose={closeDestroyed}
        overlay={<EnhanceFx kind={fx} nonce={nonce.current} />}
      >
        <View style={{ alignItems: 'center' }}>
          <View style={[BORDER, { padding: SP.md, alignItems: 'center', alignSelf: 'stretch' }]}>
            <T size={22} bold center>산산조각</T>
            <T size={13} bold center style={{ marginTop: SP.xs }}>{destroyed.name}</T>
          </View>
          <T size={12} center style={{ marginTop: SP.md }}>
            강화에 실패해 장비가 부서졌습니다.
          </T>
          <T size={11} dim="sub" center style={{ marginTop: SP.xs }}>
            되돌릴 수 없습니다. 강화 비용도 돌아오지 않습니다.
          </T>
          {(destroyed.hadSpirit || destroyed.hadAlch) && (
            <T size={11} dim="sub" center style={{ marginTop: SP.xs }}>
              새겨 둔 {[destroyed.hadSpirit && '정령석', destroyed.hadAlch && '연성']
                .filter(Boolean).join('·')}도 함께 사라졌습니다.
            </T>
          )}
          <T size={10} dim="dim" center style={{ marginTop: SP.sm }}>
            파괴가 무서우면 파괴 방어 주문서를 함께 쓰세요. 장인의 무구는 파괴되지 않습니다.
          </T>
          <Btn
            label="확인"
            size="lg"
            fill
            style={{ marginTop: SP.md, alignSelf: 'stretch' }}
            onPress={closeDestroyed}
          />
        </View>
      </Popup>
    );
  }

  if (!slot || !item) return null;

  const cost = enhanceCost(item, null);
  const maxed = !canEnhance(item);
  const promoteAble = canPromote(item);
  const pCost = promoteCost(item);

  /**
   * 승급 — 강화와 같은 연출을 태운다.
   * 100% 성공이지만 티어가 바뀌는 가장 큰 사건이라, 조용히 끝나면 허무하다.
   */
  const runPromote = () => {
    if (charging || !item) return;
    const next = pCost !== null ? `${TIERS[item.tier + 1].prefix} ${KIND_NAME[item.kind]}` : '';
    setCharging(true);
    setLast(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      const ok = doPromote(slot);
      setCharging(false);
      if (!ok) return;
      nonce.current += 1;
      setFx('promote');
      setTimeout(() => setFx(null), 1100);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPromoted(next);
    }, 1150);
  };

  const run = () => {
    if (charging) return;
    if (scroll && scrolls[scroll] <= 0) {
      useGame.getState().toast('그 주문서가 없습니다 — 상점에서 구매하세요', 'bad');
      return;
    }
    if (money < cost) {
      useGame.getState().toast('강화 비용이 부족합니다', 'bad');
      return;
    }
    setCharging(true);
    setFx(null);
    setLast(null);
    // 게이지가 차는 동안 망치질 소리 — 결과 소리는 EnhanceFx 가 낸다
    sfx('hammer');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 게이지가 다 찬 뒤에 결과를 깐다 — 연출이 곧 게임성이다
    setTimeout(() => {
      const res = doEnhance(slot, scroll);
      setCharging(false);
      if (!res) return;
      nonce.current += 1;
      setFx(res.outcome);
      // 파괴는 결과 화면이 함께 뜨므로 파편이 다 흩어질 때까지 둔다
      setTimeout(() => setFx(null), res.outcome === 'destroy' ? 1600 : 900);

      switch (res.outcome) {
        case 'success': {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const to = item.level + 1;
          /*
            장인 무구의 **+15 너머**는 강화가 아니라 기록이다.

            장인은 상한이 없어서(maxLevel Infinity) +16 부터는 아무도 안 가 본
            구간으로 들어간다. 그런데 연출은 +3 을 올릴 때와 똑같았다 — 이 게임에서
            제일 어려운 일을 해냈는데 화면이 아무 말도 안 했다.
            섬광을 승급급으로 올리고 한 줄 남긴다. 과하지 않게, 대신 확실히.
          */
          if (isArtisan(item.tier) && to > 15) {
            nonce.current += 1;
            setFx('promote');
            setTimeout(() => setFx(null), 1200);
            setLast(`+${to} 도달 — 여기서부터는 기록입니다`);
          } else {
            setLast(`성공! +${to}`);
          }
          break;
        }
        case 'fail':
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setLast(res.guarded ? '주문서가 막아냈다 — 유지' : '실패 — 강화 단계 유지');
          break;
        case 'downgrade':
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setLast(`등급 하락… +${Math.max(0, item.level - 1)}`);
          break;
        case 'destroy':
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setLast(null);
          setDestroyed({
            name: itemName(item, KIND_NAME),
            hadSpirit: !!item.spirit,
            hadAlch: !!item.alch,
          });
          break;
      }
      if (res.outcome !== 'destroy') setScroll((sc) => (sc && scrolls[sc] <= 1 ? null : sc));
      else setScroll(null);
    }, 1150);
  };

  return (
    <>
    <Popup
      visible={visible && !autoOpen}
      title={`${promoted ? '승급 완료' : maxed ? '승급' : '강화'} — ${SLOT_NAME[slot]}`}
      onClose={onBack}
      /*
        머리에는 내구도만 둔다.

        한때 여기에 보유금도 박아 뒀다 — 창을 열면 위쪽 HUD 가 가려져 "한 번 더
        될까" 를 판단할 수 없었기 때문이다. 지금은 그럴 필요가 없다: 같은 값이
        아래 "보유 골드" 줄에 이미 있고, 거기엔 몇 번 더 되는지까지 적힌다.
        좁은 머리줄에 같은 숫자를 두 번 세우면 정작 내구도가 안 읽힌다.
      */
      right={<Tag label={`내구 ${item.dur}%`} fill={item.dur < 50} />}
      overlay={<EnhanceFx kind={fx} nonce={nonce.current} />}
    >
      <ItemHead item={item} />
      {!maxed && (
        <>
          <T size={11} bold style={{ marginTop: SP.sm }}>
            성공 시 아이템레벨 {fmtIlvl(itemLevel(item))} → {fmtIlvl(itemLevel({ ...item, level: item.level + 1 }))}
            {'  '}(+{fmtIlvl(itemLevel({ ...item, level: item.level + 1 }) - itemLevel(item))})
          </T>
          <MilestoneLine item={item} />
        </>
      )}

      <Sep />

      {promoted ? (
        /* 승급 성공 화면 — 티어가 바뀌면 아래 분기가 강화 UI 로 넘어가 버리므로
           확인을 누를 때까지 결과를 붙잡아 둔다 */
        <View style={{ alignItems: 'center' }}>
          <T size={20} bold center>승급 성공!</T>
          <T size={13} bold center style={{ marginTop: SP.xs }}>{promoted}</T>
          {/*
            승급의 값어치는 **지금 숫자**가 아니라 이 티어의 천장이다.

            강화가 +0 으로 돌아가므로 승급 직후 아이템레벨은 떨어진다 (core/tiers 의
            "승급 골짜기" 주석). 그 사실만 남기면 승급이 손해로만 읽히므로,
            이 티어를 끝까지 올렸을 때 어디까지 가는지를 같이 세운다 —
            그게 방금 산 것이다.
          */}
          <View style={[BORDER, { padding: SP.sm, marginTop: SP.sm, alignSelf: 'stretch' }]}>
            <KV k="지금" v={fmtIlvl(itemLevel(item))} />
            <KV
              k={`${TIERS[item.tier].prefix} +15 까지 올리면`}
              v={fmtIlvl(itemLevel({ ...item, level: 15 }))}
            />
            <T size={9} dim="dim" style={{ marginTop: 2 }}>
              한 티어 위의 천장이 그만큼 높아졌습니다.
            </T>
          </View>
          <T size={11} dim="sub" center style={{ marginTop: SP.sm }}>
            강화 단계는 +0 부터 다시 시작합니다.
          </T>
          <Btn
            label="확인"
            size="lg"
            fill
            style={{ marginTop: SP.md, alignSelf: 'stretch' }}
            onPress={() => {
              setPromoted(null);
              onBack();
            }}
          />
        </View>
      ) : maxed ? (
        <View>
          <T size={12} bold>+15 도달 — 승급 가능</T>
          <T size={11} dim="sub" style={{ marginTop: 2 }}>
            승급은 100% 성공하지만 비용이 큽니다.
          </T>
          {pCost !== null && (
            <>
              <KV k="승급 비용" v={fmt(pCost)} />
              <KV k="보유 골드" v={fmt(money)} dim={money >= pCost} warn={money < pCost} />
              {money < pCost && (
                <T size={10} dim="dim">{fmtShort(pCost - money)} 부족합니다</T>
              )}
            </>
          )}
          <PromoteWarning item={item} />
          <View style={{ marginTop: SP.md }}>
            <ChargeGauge running={charging} />
          </View>
          <Btn
            label={charging ? '승급 중…' : pCost ? `${TIERS[item.tier + 1].prefix} ${KIND_NAME[item.kind]} 로 승급` : '최고 티어'}
            sub={pCost ? fmt(pCost) : undefined}
            size="lg"
            busy={charging}
            disabled={!promoteAble || (pCost !== null && money < pCost)}
            fill={promoteAble && pCost !== null && money >= pCost}
            style={{ marginTop: SP.sm }}
            icon={(c) => (
              <Sprite set="weapon" name="hammer" size={20} tint={c} fallback={WEAPON_SPRITES.hammer} />
            )}
            onPress={runPromote}
          />
        </View>
      ) : (
        <>
          {/* 확률 표시 */}
          <T size={10} dim="sub">+{item.level} → +{target} 확률</T>
          <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
            <OddsCell label="성공" v={odds.success} strong />
            <OddsCell label="유지" v={odds.fail} />
            <OddsCell label="하락" v={odds.downgrade} />
            <OddsCell label="파괴" v={odds.destroy} />
          </Row>

          <View style={{ marginTop: SP.md }}>
            <ChargeGauge running={charging} />
          </View>

          {!!last && <T size={13} bold center style={{ marginTop: SP.sm }}>{last}</T>}

          <Sep />
          <KV k="강화 비용" v={fmt(cost)} />
          <KV k="보유 골드" v={fmt(money)} dim={money >= cost} warn={money < cost} />
          {/*
            "몇 번 더 되는가" 를 세어 준다. 강화는 한 번 눌러 끝나는 일이 아니라
            연달아 두들기는 일이라, 남은 돈보다 **남은 횟수**가 실제로 쓰는 값이다.
            (비용은 강화 단계가 오를수록 커지므로 지금 단계 기준의 어림수다)
          */}
          <T size={10} dim="dim">
            {money >= cost
              ? `지금 비용으로 약 ${Math.floor(money / Math.max(1, cost))}번 더 시도할 수 있습니다`
              : `${fmtShort(cost - money)} 부족합니다`}
          </T>
          {!!scroll && (
            <KV k="주문서" v={`${SCROLLS[scroll].name} · 보유 ${scrolls[scroll]}장`} dim />
          )}
          <Btn
            label={charging ? '강화 중…' : '강 화'}
            size="lg"
            fill
            busy={charging}
            disabled={money < cost}
            style={{ marginTop: SP.sm }}
            // 흑백 2색이라 반전 배경 위에서는 아이콘도 검정으로 뒤집힌다
            icon={(c) => (
              <Sprite set="weapon" name="hammer" size={20} tint={c} fallback={WEAPON_SPRITES.hammer} />
            )}
            onPress={run}
          />
          {/*
            손으로 두들기는 것과 **같은 강화**를 자동으로 돌린다.
            확률도 연출도 그대로고, 손가락만 안 쓴다.
          */}
          <Btn
            label="목표까지 자동으로"
            size="md"
            style={{ marginTop: SP.xs }}
            onPress={() => setAutoOpen(true)}
          />

          {/* 주문서 — 1회 1장만 (§4-3) */}
          <Sep />
          <T size={11} bold style={{ marginBottom: SP.xs }}>강화 주문서 (1회 1장만 적용)</T>
          <ListItem
            title="사용 안 함"
            sub="주문서 없이 강화"
            right={scroll === null ? <Tag label="선택" fill /> : undefined}
            onPress={() => setScroll(null)}
          />
          {ENHANCE_SCROLL_ORDER.map((id) => {
            const d = SCROLLS[id];
            const have = scrolls[id];
            return (
              <ListItem
                key={id}
                title={d.name}
                sub={`${d.desc} · 보유 ${have}장`}
                left={<Sprite set="scroll" name={id} size={28} opacity={have > 0 ? 1 : 0.3} />}
                disabled={have <= 0}
                right={scroll === id ? <Tag label="선택" fill /> : <T size={10} dim="dim">{have}</T>}
                onPress={() => setScroll(scroll === id ? null : id)}
              />
            );
          })}
        </>
      )}
    </Popup>
    {/* 자동 강화에서 나가면 강화 창까지 **아예** 닫는다 (팝업은 한 겹으로 느껴져야 한다) */}
    <AutoOnePopup
      item={item}
      visible={visible && autoOpen}
      onClose={() => { setAutoOpen(false); onClose(); }}
    />
    </>
  );
}
