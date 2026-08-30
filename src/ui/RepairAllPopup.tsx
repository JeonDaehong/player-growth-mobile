/**
 * 전체 수리 — 한 칸 수리와 **같은 연출**로.
 *
 * 예전에는 버튼을 누르면 그 자리에서 돈이 빠지고 토스트 한 줄이 지나갔다.
 * 한 칸 수리에는 망치질이 있는데 (`RepairPopup`), 정작 열 몇 칸을 한꺼번에 고치는
 * — 그래서 훨씬 많은 돈이 나가는 — 쪽이 더 조용했다. 큰일일수록 조용한 건 거꾸로다.
 *
 * ## 미리 담아 두는 값들
 *
 * 수리가 끝나면 닳은 칸이 하나도 없어지므로, 결과 화면에 쓸 값(몇 칸, 얼마)은
 * **누르기 전에** 담아 둔다. 끝난 뒤에 세면 언제나 "0칸 수리 완료" 가 된다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/state/store';
import { useEffects, useGuildEffects } from '@/state/selectors';
import { SLOT_IDS, SLOT_NAME, type Item, type SlotId } from '@/core/types';
import { repairCost } from '@/core/economy';
import { fmt, fmtShort } from '@/core/currency';
import { Btn, KV, Row, Sep, T, Tag } from './atoms';
import { Popup } from './Popup';
import { EnhanceFx } from './EnhanceFx';
import { RepairAnvil, REPAIR_MS, useClang } from './RepairAnvil';
import { Sprite } from './Sprite';
import { WEAPON_SPRITES } from './sprites';
import { BORDER, SP } from './theme';

export function RepairAllPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const equipped = useGame((s) => s.equipped);
  const money = useGame((s) => s.money);
  const repairAll = useGame((s) => s.repairAll);
  const eff = useEffects();
  const geff = useGuildEffects();

  const [working, setWorking] = useState(false);
  /** 끝난 판의 요약. 수리하고 나면 셀 수 없는 값이라 미리 담는다 */
  const [done, setDone] = useState<{ slots: number; cost: number; hurt: number } | null>(null);
  const beat = useClang(working);
  const nonce = useRef(0);

  // 창을 닫으면 연출도 치운다 — 다시 열었을 때 지난 "완료" 가 남아 있으면 안 된다
  useEffect(() => {
    if (!visible) { setWorking(false); setDone(null); }
  }, [visible]);

  /*
    닳은 칸과 비용.

    ⚠ 스토어의 `repairAll` 과 **같은 식**이어야 한다 (칭호 할인 + 길드 할인).
    갈라지면 화면이 거짓말을 한다 — 예전에 전체 수리가 길드 할인을 안 빼서
    미리 보여 준 금액보다 실제로 더 나간 적이 있다.
  */
  const cut = eff.repairDiscount + geff.repairDiscount;
  const rows = SLOT_IDS
    .map((sl) => ({ sl, it: equipped[sl] }))
    .filter((r): r is { sl: SlotId; it: Item } => !!r.it && r.it.dur < 100)
    .map((r) => ({ ...r, cost: Math.ceil(repairCost(r.it) * (1 - cut)) }))
    .filter((r) => r.cost > 0)
    .sort((a, b) => a.it.dur - b.it.dur);

  const total = rows.reduce((a, r) => a + r.cost, 0);
  const hurt = rows.filter((r) => r.it.dur < 50).length;

  const run = () => {
    if (working || !rows.length || money < total) return;
    // 끝난 뒤에는 셀 수 없다 — 지금 담는다
    setDone(null);
    setWorking(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const summary = { slots: rows.length, cost: total, hurt };
    // 망치질이 끝난 뒤에 실제로 고친다 — 먼저 고치면 숫자가 튀어 연출이 무의미해진다
    setTimeout(() => {
      repairAll();
      nonce.current += 1;
      setWorking(false);
      setDone(summary);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, REPAIR_MS);
  };

  if (!visible) return null;

  return (
    <Popup
      visible={visible}
      title="전체 수리"
      onClose={() => { if (!working) onClose(); }}
      right={working ? <Tag label="수리 중" fill /> : undefined}
      overlay={done ? <EnhanceFx kind="success" nonce={nonce.current} /> : undefined}
    >
      {done ? (
        <View style={{ alignItems: 'center' }}>
          <Sprite set="weapon" name="hammer" size={44} fallback={WEAPON_SPRITES.hammer} />
          <T size={18} bold center style={{ marginTop: SP.xs }}>수리 완료!</T>
          <T size={12} bold center style={{ marginTop: 2 }}>{done.slots}칸 · 내구도 100%</T>
          <View style={[BORDER, { padding: SP.sm, marginTop: SP.md, alignSelf: 'stretch' }]}>
            <KV k="고친 칸" v={`${done.slots}칸`} />
            <KV k="쓴 돈" v={fmt(done.cost)} />
            {done.hurt > 0 && (
              <T size={10} dim="sub" style={{ marginTop: 2 }}>
                깎여 있던 {done.hurt}칸의 아이템레벨이 돌아왔습니다
              </T>
            )}
          </View>
          <Btn
            label="확인"
            size="lg"
            fill
            style={{ marginTop: SP.md, alignSelf: 'stretch' }}
            onPress={() => { setDone(null); onClose(); }}
          />
        </View>
      ) : working ? (
        <RepairAnvil beat={beat} note={`${rows.length}칸을 두들기는 중`} />
      ) : (
        <>
          <T size={11} dim="sub">
            닳은 칸을 한 번에 고칩니다. 낱개로 고칠 때와 값은 같습니다.
          </T>

          {hurt > 0 && (
            <View style={[BORDER, { padding: SP.xs, marginTop: SP.sm }]}>
              <T size={10} bold>
                {hurt}칸이 내구 50% 아래입니다 — 지금 아이템레벨이 깎여 있습니다
              </T>
            </View>
          )}

          <Sep />
          {/* 어느 칸이 얼마나 닳았는지 — 많이 닳은 것부터 */}
          {rows.slice(0, 8).map(({ sl, it, cost }) => (
            <Row between key={sl} style={{ paddingVertical: 2 }}>
              <T size={11} bold={it.dur < 50}>{SLOT_NAME[sl]}</T>
              <Row gap={SP.sm}>
                <T size={10} dim={it.dur < 50 ? undefined : 'dim'}>내구 {it.dur}%</T>
                <T size={10} dim="sub">{fmtShort(cost)}</T>
              </Row>
            </Row>
          ))}
          {rows.length > 8 && (
            <T size={10} dim="dim" style={{ marginTop: 2 }}>… 외 {rows.length - 8}칸</T>
          )}

          <Sep />
          <KV k="고칠 칸" v={`${rows.length}칸`} />
          <KV k="전체 수리비" v={fmt(total)} warn={money < total} />
          <KV k="보유 골드" v={fmt(money)} dim={money >= total} />

          <Btn
            label={`전체 수리 (${rows.length}칸)`}
            sub={fmt(total)}
            size="lg"
            fill={money >= total}
            disabled={!rows.length || money < total}
            style={{ marginTop: SP.md }}
            icon={(c) => (
              <Sprite set="weapon" name="hammer" size={20} tint={c} fallback={WEAPON_SPRITES.hammer} />
            )}
            onPress={run}
          />
          {money < total && (
            <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>
              {fmtShort(total - money)} 부족합니다 — 칸별로는 고칠 수 있습니다
            </T>
          )}
        </>
      )}
    </Popup>
  );
}
