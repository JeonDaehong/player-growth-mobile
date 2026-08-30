/**
 * 없앤 콘텐츠의 뒷정리 안내 — 주식장 · 은행.
 *
 * 콘텐츠를 없애는 건 기획의 선택이지만, 그 김에 사람이 모아 둔 재산까지 조용히
 * 사라지는 건 다른 얘기다. 주식에 전 재산을 넣어 둔 사람에게는 그게 그냥
 * **전 재산 소멸**이고, 아무도 설명해 주지 않으면 버그로 읽힌다.
 *
 * 그래서 두 가지를 한다.
 *   · 들고 있던 종목은 **마지막 시세로 돈으로 바꿔** 소지금에 넣는다
 *     (state/migrate.ts 의 `marketPayout`). 손해도 이익도 만들지 않는다.
 *   · 그 사실을 **닫아야 사라지는 팝업**으로 알린다. 토스트로 스쳐 지나가면
 *     "돈이 왜 늘었지" 가 되고, 그건 알린 게 아니다.
 *
 * 한 번만 뜬다. 확인을 누르면 `marketPayout` 이 null 이 되고 (그 값만 지운다),
 * 정산 세대(`marketClosed`)는 그대로라 다시 정산되지도, 다시 뜨지도 않는다.
 *
 * 주식을 안 하던 사람에게는 아예 안 뜬다 — 돌려받을 게 없으면 알릴 것도 없다.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { fmt } from '@/core/currency';
import { Btn, KV, Sep, T } from './atoms';
import { Popup } from './Popup';
import { BORDER, SP } from './theme';

export function ClosureNoticePopup({ active }: { active: boolean }) {
  const payout = useGame((s) => s.marketPayout);
  const money = useGame((s) => s.money);
  const clear = useGame((s) => s.clearMarketPayout);
  const returned = useGame((s) => s.bankReturned);
  const clearBank = useGame((s) => s.clearBankNotice);

  /*
    둘이 겹칠 수 있다 (주식도 하고 대출도 있던 사람). 한 번에 하나씩 보여 준다 —
    두 안내를 한 창에 욱여넣으면 어느 쪽 숫자인지 헷갈린다. 주식 쪽을 먼저 닫으면
    은행 쪽이 이어서 뜬다.
  */
  if (active && (!payout || payout <= 0) && returned > 0) {
    return (
      <Popup visible title="은행이 문을 닫았습니다" onClose={clearBank}>
        <T size={12} style={{ lineHeight: 18 }}>
          은행은 없어졌습니다. 대출 담보로 잡혀 있던 장비는 창고로 돌려보냈고,
          남아 있던 빚은 갚지 않으셔도 됩니다.
        </T>

        <View style={[BORDER, { padding: SP.md, marginTop: SP.md, alignItems: 'center' }]}>
          <T size={10} dim="sub">돌려받은 담보</T>
          <T size={22} bold center style={{ marginTop: 2 }}>{returned}개</T>
        </View>

        <Sep />
        <T size={10} dim="dim" style={{ lineHeight: 15 }}>
          창고에서 확인하실 수 있습니다. 갚을 곳이 없어진 빚을 갚으라고 할 수는 없어
          그대로 지웠습니다 — 없앤 건 저희 쪽 사정이니까요.
        </T>
        <T size={10} dim="dim" style={{ marginTop: SP.xs, lineHeight: 15 }}>
          철벽 지갑 · 채무불이행자 칭호는 그대로 두었습니다. 지금은 얻을 수 없는
          칭호가 되었지만, 이미 하신 일까지 되돌릴 이유는 없어서입니다.
        </T>

        <Btn label="확인" size="lg" fill style={{ marginTop: SP.md }} onPress={clearBank} />
      </Popup>
    );
  }

  if (!active || !payout || payout <= 0) return null;

  return (
    <Popup visible title="주식장이 문을 닫았습니다" onClose={clear}>
      <T size={12} style={{ lineHeight: 18 }}>
        주식장은 없어졌습니다. 가지고 계시던 종목은 마지막 시세 그대로 정산해
        소지금에 넣어 드렸습니다.
      </T>

      <View style={[BORDER, { padding: SP.md, marginTop: SP.md, alignItems: 'center' }]}>
        <T size={10} dim="sub">정산 금액</T>
        <T size={22} bold center style={{ marginTop: 2 }}>{fmt(payout)}</T>
      </View>

      <Sep />
      <KV k="지금 소지금" v={fmt(money)} />
      <T size={10} dim="dim" style={{ marginTop: SP.xs, lineHeight: 15 }}>
        팔지 못하고 잃은 돈은 없습니다. 손해도 이익도 없이 마지막 가격으로만 계산했습니다.
      </T>
      <T size={10} dim="dim" style={{ marginTop: SP.xs, lineHeight: 15 }}>
        단타왕 · 존버 칭호는 그대로 두었습니다. 지금은 얻을 수 없는 칭호가 되었지만,
        이미 하신 일까지 되돌릴 이유는 없어서입니다.
      </T>

      <Btn label="확인" size="lg" fill style={{ marginTop: SP.md }} onPress={clear} />
    </Popup>
  );
}
