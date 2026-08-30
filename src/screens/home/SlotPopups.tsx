/**
 * 자동 강화 — 창고 여러 개, 착용 한 자루.
 *
 * `HomeScreen.tsx` 한 파일에 1,700줄이 있던 시절에는 팝업 하나를 고치려고
 * 열 때마다 관계없는 다섯 개를 지나야 했다. 화면은 화면대로, 팝업은 팝업대로 둔다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  KIND_NAME,
  currentItemLevel,
  fmtIlvl,
  itemLevel,
  itemName,
  useGame,
} from '@/state/store';
import { useEffects, useGuildEffects } from '@/state/selectors';
import { SLOT_NAME, SlotId } from '@/core/types';
import { canEnhance, enhanceCost } from '@/core/enhance';
import { repairCost, sellPrice } from '@/core/economy';
import { fmt, fmtShort } from '@/core/currency';
import { SLOT_ACCEPTS } from '@/core/types';
import { Bar, Btn, KV, ListItem, Row, Sep, T, Tag } from '@/ui/atoms';
import { SP } from '@/ui/theme';
import { WEAPON_SPRITES } from '@/ui/sprites';
import { Sprite } from '@/ui/Sprite';
import { equipArt } from '@/ui/equipArt';
import { EnhanceFx } from '@/ui/EnhanceFx';
import { Popup } from '@/ui/Popup';
import { RepairAnvil, REPAIR_MS, useClang } from '@/ui/RepairAnvil';
import { AlchLine, ItemHead, RuneLine } from './parts';

export function SlotActionPopup({
  slot, visible, onClose, onPick,
}: {
  slot: SlotId | null;
  visible: boolean;
  onClose: () => void;
  onPick: (m: 'enhance' | 'repair') => void;
}) {
  const item = useGame((s) => (slot ? s.equipped[slot] : null));
  const money = useGame((s) => s.money);
  const inventory = useGame((s) => s.inventory);
  const equip = useGame((s) => s.equip);
  const unequip = useGame((s) => s.unequip);
  const eff = useEffects();
  // ⚠ 훅은 조기 반환보다 **위**에 있어야 한다. 아래로 내려가면 slot 이 없을 때와
  // 있을 때의 훅 개수가 달라져 "Rendered more hooks" 로 화면이 통째로 죽는다.
  const geff = useGuildEffects();
  if (!slot) return null;

  const rCost = item ? Math.ceil(repairCost(item) * (1 - eff.repairDiscount - geff.repairDiscount)) : 0;
  const maxed = item ? !canEnhance(item) : false;

  /*
    이 칸에 낄 수 있는 창고 장비.

    빈 칸을 눌렀을 때 "집에 가서 끼세요" 라고만 적혀 있었다. 집은 지도 탭 →
    언덕길 → 집이고, 거기서도 아이템을 고른 뒤 **다시 칸을 골라야** 했다.
    칸에서 시작하면 그 두 번째 질문이 아예 없다 — 여기 뜨는 건 이미 이 칸에
    들어갈 수 있는 것들뿐이다.

    좋은 것부터 세운다. 목록 맨 위가 곧 추천이 된다.
  */
  const fits = inventory
    .filter((it) => SLOT_ACCEPTS[slot].includes(it.kind))
    .sort((a, b) => itemLevel(b) - itemLevel(a));

  return (
    <Popup
      visible={visible}
      title={SLOT_NAME[slot]}
      onClose={onClose}
      right={item ? <Tag label={`내구 ${item.dur}%`} fill={item.dur < 50} /> : undefined}
    >
      {!item ? (
        <>
          <T size={12} dim="sub">빈 칸입니다.</T>
          {!fits.length ? (
            <T size={11} dim="dim" style={{ marginTop: SP.xs }}>
              창고에 이 칸에 낄 수 있는 장비가 없습니다 — 마을 &gt; 상점에서 살 수 있습니다.
            </T>
          ) : (
            <>
              <T size={11} bold style={{ marginTop: SP.md, marginBottom: SP.xs }}>
                낄 수 있는 장비 ({fits.length}개)
              </T>
              {fits.map((it) => (
                <ListItem
                  key={it.id}
                  left={<Sprite {...equipArt(it.kind, it.tier)} size={26} />}
                  title={itemName(it, KIND_NAME)}
                  sub={`아이템레벨 ${fmtIlvl(itemLevel(it))} · 내구 ${it.dur}% · 판매가 ${fmtShort(sellPrice(it))}`}
                  onPress={() => { if (equip(it.id, slot)) onClose(); }}
                />
              ))}
            </>
          )}
        </>
      ) : (
        <>
          <ItemHead item={item} />
          <RuneLine item={item} />
          <AlchLine item={item} />
          <Sep />
          <Btn
            label={maxed ? '승 급' : '강 화'}
            sub={maxed ? '+15 도달' : fmt(enhanceCost(item, null))}
            size="lg"
            fill
            icon={(c) => (
              <Sprite set="weapon" name="hammer" size={20} tint={c} fallback={WEAPON_SPRITES.hammer} />
            )}
            onPress={() => onPick('enhance')}
          />
          <Btn
            label="수 리"
            sub={rCost > 0 ? fmt(rCost) : '내구도 100% · 불필요'}
            size="lg"
            style={{ marginTop: SP.sm }}
            disabled={rCost <= 0}
            onPress={() => onPick('repair')}
          />
          {rCost > 0 && money < rCost && (
            <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>
              수리비가 부족합니다
            </T>
          )}

          {/*
            교체·해제.

            강화·수리와 무게를 갈라 놓는다 — 위 둘은 이 장비를 **키우는** 일이고,
            아래 둘은 이 칸에서 **빼는** 일이다. 실수로 누르면 아까우니 작게 둔다.
          */}
          <Sep />
          <Row gap={SP.sm}>
            <Btn
              label="해제"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => { unequip(slot); onClose(); }}
            />
            <Btn
              label={fits.length ? `교체 (창고 ${fits.length}개)` : '교체할 장비 없음'}
              size="sm"
              style={{ flex: 2 }}
              disabled={!fits.length}
              /* 해제만 하면 이 칸이 비고, 그 자리에서 다시 열면 목록이 뜬다 */
              onPress={() => { unequip(slot); }}
            />
          </Row>
          <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
            해제한 장비는 창고로 들어갑니다. 교체를 누르면 이 칸이 비면서 낄 수 있는 목록이 뜹니다.
          </T>
        </>
      )}
    </Popup>
  );
}

/**
 * 수리 팝업.
 *
 * 누르자마자 끝나면 돈만 빠져나간 느낌이라, 망치질을 잠깐 보여 준다.
 * 강화의 게이지와 같은 무게는 아니고 — 짧게 뚱땅거리고 끝난다.
 */
/* 망치질 연출은 전체 수리와 함께 쓴다 — ui/RepairAnvil.tsx */

export function RepairPopup({
  slot, visible, onBack,
}: {
  slot: SlotId | null;
  visible: boolean;
  onBack: () => void;
}) {
  const item = useGame((s) => (slot ? s.equipped[slot] : null));
  const money = useGame((s) => s.money);
  const eff = useEffects();
  const repair = useGame((s) => s.repair);

  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const beat = useClang(working);
  const nonce = useRef(0);

  // 팝업을 닫으면 연출 상태도 치운다 — 다시 열었을 때 "완료" 가 남아 있으면 안 된다
  React.useEffect(() => {
    if (!visible) { setWorking(false); setDone(false); }
  }, [visible]);

  // ⚠ 조기 반환 위에서 부른다 — 아래로 내려가면 훅 개수가 달라진다 (SlotActionPopup 과 같은 사고)
  const geff = useGuildEffects();
  if (!slot || !item) return null;

  const cost = Math.ceil(repairCost(item) * (1 - eff.repairDiscount - geff.repairDiscount));

  const run = () => {
    if (working || money < cost) return;
    setWorking(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // 망치질이 끝난 뒤에 실제로 고친다 — 먼저 고치면 숫자가 튀어 연출이 무의미해진다
    setTimeout(() => {
      repair(item.id);
      nonce.current += 1;
      setWorking(false);
      setDone(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, REPAIR_MS);
  };

  return (
    <Popup
      visible={visible}
      title={`수리 — ${SLOT_NAME[slot]}`}
      onClose={onBack}
      overlay={done ? <EnhanceFx kind="success" nonce={nonce.current} /> : undefined}
    >
      <ItemHead item={item} />
      <Sep />

      {done ? (
        <View style={{ alignItems: 'center' }}>
          <Sprite set="weapon" name="hammer" size={44} fallback={WEAPON_SPRITES.hammer} />
          <T size={18} bold center style={{ marginTop: SP.xs }}>수리 완료!</T>
          <T size={11} dim="sub" center style={{ marginTop: 2 }}>
            내구도 100% — 아이템레벨 {fmtIlvl(itemLevel(item))}
          </T>
          <Btn
            label="확인"
            size="lg"
            fill
            style={{ marginTop: SP.md, alignSelf: 'stretch' }}
            onPress={onBack}
          />
        </View>
      ) : working ? (
        <RepairAnvil beat={beat} />
      ) : (
        <>
          <KV k="현재 내구도" v={`${item.dur}%`} />
          <KV k="수리 후" v="100%" />
          {item.dur < 50 && (
            <KV k="아이템레벨" v={`${fmtIlvl(currentItemLevel(item))} → ${fmtIlvl(itemLevel(item))}`} />
          )}
          <Sep />
          <KV k="수리 비용" v={fmt(cost)} />
          {eff.repairDiscount > 0 && (
            <T size={10} dim="dim">숙련 대장장이 효과 -{Math.round(eff.repairDiscount * 100)}% 적용</T>
          )}
          <Btn
            label="수리하기"
            size="lg"
            fill
            style={{ marginTop: SP.md }}
            icon={(c) => (
              <Sprite set="weapon" name="hammer" size={20} tint={c} fallback={WEAPON_SPRITES.hammer} />
            )}
            disabled={cost <= 0 || money < cost}
            onPress={run}
          />
          {money < cost && (
            <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>보유금액이 부족합니다</T>
          )}
        </>
      )}
    </Popup>
  );
}

/**
 * 마일스톤 안내 — +5칸마다 계단이 있다는 걸 화면이 알려 줘야 목표가 생긴다.
 * 계단을 막 밟은 직후에는 **하락이 3~4배 아프다**는 것도 같이 말해 준다.
 */
