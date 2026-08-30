import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame, fmtIlvl } from '@/state/store';
import {
  selCurIlvl,
  selIlvl,
  selMaxStamina,
  selPenalty,
} from '@/state/selectors';

import { Bar, Row, T } from './atoms';
import { C, O, SP, WHITE } from './theme';
import { Pixel } from './Pixel';
import { ICONS } from './sprites';
import { Money } from './Money';
import { Sprite } from './Sprite';

/** 모든 화면 위에 고정되는 상태 표시줄. 돈·체력·현재 아이템레벨은 언제나 보여야 한다. */
/**
 * 상태 표시줄 최소 상단 여백.
 * SafeAreaView 만 쓰면 inset 이 0 인 환경(웹, 일부 안드로이드)에서 소지금 줄이
 * 시스템 상태바에 붙는다. inset 위에 최소 여백을 항상 얹는다.
 */
const MIN_TOP = 14;

export function Hud() {
  const insets = useSafeAreaInsets();
  const money = useGame((s) => s.money);
  const stamina = useGame((s) => s.stamina);
  const maxSta = useGame(selMaxStamina);
  const ilvl = useGame(selIlvl);
  const cur = useGame(selCurIlvl);
  const penalty = useGame(selPenalty);

  return (
    <View style={{ backgroundColor: C.bg }}>
      <View
        style={{
          paddingTop: Math.max(insets.top, MIN_TOP) + SP.xs,
          paddingLeft: SP.md + insets.left,
          paddingRight: SP.md + insets.right,
          paddingBottom: SP.sm,
          borderBottomWidth: 1,
          borderBottomColor: WHITE,
        }}
      >
        <Row between style={{ alignItems: 'flex-start' }}>
          <View>
            <Row gap={SP.xs}>
              <T size={9} dim="sub">소지금</T>
              <Money amount={money} size={13} coins />
            </Row>
          </View>
          <Row gap={SP.xs}>
            {/* 내구도 보정이 걸리면 반드시 강조 표기 (기획서 §10 UX 필수) */}
            {penalty && <Pixel sprite={ICONS.warn} scale={1.5} />}
            <T size={11} dim="sub">아이템레벨</T>
            <T size={13} bold>{fmtIlvl(cur)}</T>
            {penalty && <T size={10} dim="dim">/{fmtIlvl(ilvl)}</T>}
          </Row>
        </Row>
        <Row gap={SP.sm} style={{ marginTop: 6 }}>
          <Pixel sprite={ICONS.heart} scale={1.3} opacity={O.sub} />
          <Bar value={stamina} max={maxSta} blocks={24} height={5} />
          <T size={10} dim="sub">{stamina}</T>
        </Row>
      </View>
    </View>
  );
}
