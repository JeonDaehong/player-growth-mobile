import React from 'react';
import { Row, T } from './atoms';
import { Sprite } from './Sprite';

interface Props {
  amount: number;
  size?: number;
  /** 숫자 앞에 동전 아이콘 (좁은 자리에서는 끈다) */
  coins?: boolean;
}

/**
 * 소지금 한 줄.
 *
 * 단위는 **골드 하나뿐이다** (`core/currency`). 예전에는 골드·실버·쿠퍼를
 * 끊어서 세 덩이로 보여 줬는데, 같은 금액이 화면마다 다른 단위로 나와서
 * 오히려 비교가 안 됐다. 한 숫자면 눈으로 바로 크기가 잡힌다.
 */
export function Money({ amount, size = 13, coins = false }: Props) {
  const neg = amount < 0;

  return (
    <Row gap={coins ? 4 : 3}>
      {coins && <Sprite set="coin" name="gold" size={size} />}
      <T size={size} bold>
        {(neg ? '-' : '') + Math.floor(Math.abs(amount)).toLocaleString('en-US')}
      </T>
      <T size={Math.max(9, size - 4)} dim="sub">골드</T>
    </Row>
  );
}
