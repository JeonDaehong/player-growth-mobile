/**
 * 살 개수 고르기.
 *
 * ## 왜 "1 · 5 · 10" 이 아니라 "+1 · +5 · +10" 인가
 *
 * 예전 버튼은 누르는 순간 수량이 **그 숫자로 갈아치워졌다.** 그래서 12개를 사려면
 * 10을 누르고 1을 두 번 누르면 될 것 같지만, 10 다음에 1을 누르면 그냥 1개가 됐다.
 * 세 값 중 하나만 고를 수 있는 건 수량 선택이 아니라 프리셋이고, 그 사이의 숫자는
 * **아예 살 수 없었다.**
 *
 * 더하기로 바꾸면 아무 숫자나 만들 수 있다. 대신 되돌릴 길이 있어야 한다 —
 * 더하기만 있으면 넘겼을 때 창을 닫았다 다시 여는 수밖에 없다. 그래서 −1 과
 * 초기화를 같이 둔다.
 *
 * ## 그래도 직접 입력이 필요하다
 *
 * 더하기로 아무 숫자나 만들 수는 있지만, 200장을 사려면 +10 을 스무 번 눌러야 한다.
 * 수량이 커지는 건 소지금이 커질 때고, 그때가 이 창을 제일 자주 쓰는 때다.
 * 그래서 숫자 칸을 그대로 입력란으로 만들었다 — 보던 자리에서 고쳐 쓴다.
 *
 * 세 방법이 **같은 값 하나**를 만진다. 눌러서 올리다 이어서 타이핑해도 되고,
 * 타이핑하다 +5 를 눌러도 된다.
 *
 * ## 살 수 없는 숫자는 만들 수 없다
 *
 * 소지금으로 감당 못 하는 수량까지 세어 올릴 수 있으면, "구매하기" 가 꺼져 있는
 * 이유를 화면 어디서도 알 수 없다. 상한(`max`)에 닿으면 버튼이 먼저 잠긴다.
 *
 * 직접 입력도 **같은 상한을 쓴다.** 타이핑은 버튼과 달리 한 번에 상한을 훌쩍
 * 넘겨 버릴 수 있어서, 입력하는 즉시 상한으로 깎는다 (`ui/numberField`).
 * 깎였다는 걸 알려 주지 않으면 "왜 100을 쳤는데 50이 됐지" 가 되므로
 * 그때만 줄 하나가 붙는다.
 *
 * 깎고 나서 `setQty` 로 **바로 올려보내는 게 중요하다.** 입력 중인 값을 이 안에만
 * 들고 있으면, 고쳐 쓰다 말고 구매를 누른 사람이 화면에 보이는 것과 다른 수량을
 * 사게 된다.
 *
 * 상점(주문서)과 엘프의 집(정령석)이 이 한 벌을 같이 쓴다. 복사해 두면 한쪽만
 * 고쳐져 또 갈라진다 — 이 화면들이 실제로 그랬다.
 */
import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { Btn, Row, T } from './atoms';
import { parseTyped } from './numberField';
import { BORDER, MONO, SP, WHITE } from './theme';

/** 한 번에 더할 수 있는 폭 */
const STEPS = [1, 5, 10];

export function QtyPicker({
  qty, setQty, max, unit = '개', label = '수량',
}: {
  qty: number;
  setQty: (next: number) => void;
  /** 살 수 있는 최대 개수. 보통 소지금 ÷ 단가 */
  max: number;
  /** 단위 — 주문서는 '장', 정령석은 '개' */
  unit?: string;
  label?: string;
}) {
  /* 상한이 0 이면 버튼이 전부 죽어 아무것도 못 만진다 — 최소 1은 세어 둔다 */
  const cap = Math.max(1, Math.floor(max));
  const clamp = (n: number) => Math.min(cap, Math.max(1, n));

  /*
    입력 중인 글자.

    `null` 이면 만지지 않는 중이라는 뜻이고, 그때는 `qty` 를 그대로 비춘다.
    이게 없으면 다 지웠을 때(`''`) 곧바로 1이 튀어나와 지울 수가 없다.
  */
  const [typing, setTyping] = useState<string | null>(null);
  /** 방금 입력이 상한에 걸려 깎였나 */
  const [capped, setCapped] = useState(false);

  const shown = typing ?? String(qty);

  /** 버튼으로 만질 때는 입력 중이던 글자를 버린다 — 두 값이 같이 보이면 안 된다 */
  const set = (n: number) => {
    setTyping(null);
    setCapped(false);
    setQty(clamp(n));
  };

  const onType = (text: string) => {
    const r = parseTyped(text, cap);
    setTyping(r.text);
    setCapped(r.capped);
    if (r.value !== null) setQty(r.value);
  };

  return (
    <>
      <Row between>
        <T size={12} dim="sub">{label}</T>
        <Row gap={SP.sm}>
          <TextInput
            value={shown}
            onChangeText={onType}
            // 칸을 떠나면 비어 있던 자리를 실제 값으로 되돌린다
            onBlur={() => { setTyping(null); setCapped(false); }}
            keyboardType="number-pad"
            inputMode="numeric"
            selectTextOnFocus
            // 상한보다 긴 숫자는 애초에 못 친다
            maxLength={String(cap).length}
            style={[
              BORDER,
              {
                color: WHITE,
                fontFamily: MONO,
                fontSize: 18,
                fontWeight: 'bold',
                minWidth: 72,
                textAlign: 'right',
                paddingHorizontal: SP.sm,
                paddingVertical: 2,
              },
            ]}
          />
          <T size={18} bold>{unit}</T>
          {qty > 1 && <Btn label="초기화" size="sm" onPress={() => set(1)} />}
        </Row>
      </Row>
      <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
        <Btn
          label="−1"
          size="sm"
          style={{ flex: 1 }}
          disabled={qty <= 1}
          onPress={() => set(qty - 1)}
        />
        {STEPS.map((n) => (
          <Btn
            key={n}
            label={`+${n}`}
            size="sm"
            style={{ flex: 1 }}
            disabled={qty + n > cap}
            onPress={() => set(qty + n)}
          />
        ))}
      </Row>
      {capped && (
        <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
          소지금으로는 {cap}{unit}까지입니다
        </T>
      )}
    </>
  );
}
