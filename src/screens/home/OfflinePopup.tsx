/**
 * ── 자리를 비운 동안 ── 돌아오면 선술집 점원이 상자를 들고 서 있다.
 *
 * ## 왜 사람이 나오나
 *
 * 오프라인 보상은 화면에서 **아무 일도 안 일어난 시간**에 대한 보상이다.
 * 숫자만 띄우면 "앱을 켰더니 골드가 늘었다" 로 끝나고, 그건 받은 기억이
 * 안 남는다. 사람이 하나 서서 건네주면 그 순간이 장면이 된다.
 *
 * 점원인 이유는 이미 있는 사람이라서다 (`core/npc` 의 선술집 점원, 그림은
 * `assets/sprites/maid/`). 새 인물을 만들면 "저 사람은 누구지" 가 먼저 오고,
 * 그 답이 이 창에는 없다.
 *
 * 부끄러워하는 그림(`shy`)을 쓴다 — 받으라고 내미는 말과 얼굴이 같아야 한다.
 *
 * ## 안 받아도 사라진다
 *
 * 닫으면 그냥 없어진다 (`dismissAway`). 안 없애면 앱을 켤 때마다 같은 상자가
 * 다시 나오고, 그건 닫을 수 없는 팝업이다. 받을지 말지는 한 번만 묻는다.
 */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { killGold } from '@/core/autoBattle';
import { OFFLINE_CAP_MS, OFFLINE_MIN_MS, maxValue, offlineAt } from '@/core/idle';
import { fmtShort } from '@/core/currency';
import { Btn, Row, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { SP } from '@/ui/theme';
import { TreasurePop } from './TreasureFx';

/** `2시간 14분` 처럼 — 초는 안 적는다. 여덟 시간짜리 값에 초는 아무 뜻이 없다 */
function span(ms: number): string {
  const m = Math.floor(Math.max(0, ms) / 60_000);
  const h = Math.floor(m / 60);
  if (h <= 0) return `${m}분`;
  return m % 60 ? `${h}시간 ${m % 60}분` : `${h}시간`;
}

export function OfflinePopup({ active }: { active: boolean }) {
  const awayMs = useGame((s) => s.awayMs);
  const stage = useGame((s) => s.battle.stage);
  const claimAway = useGame((s) => s.claimAway);
  const dismissAway = useGame((s) => s.dismissAway);

  /*
    받고 나서 **바로 안 닫는다.** 터지는 것을 보여 주고 닫는다 — 누른 결과가
    화면에 나기 전에 창이 사라지면 무엇을 받았는지가 토스트 한 줄만 남는다.
  */
  const [pop, setPop] = useState(0);
  const [done, setDone] = useState(false);

  /*
    ── 비운 시간을 **한 번 붙잡아 둔다** ──

    받으면 스토어의 `awayMs` 가 0 이 된다. 그 값을 그대로 보고 그리면 받는
    순간 이 창이 통째로 사라지고, 상자에서 터져 나오는 것이 그릴 자리를 잃는다
    (터지는 데 0.9초가 걸린다 — `TreasureFx`).

    그래서 뜰 때 한 번 베껴 두고, 그 뒤로는 베낀 값으로 그린다. 닫을 때
    비운다 — 다음에 또 자리를 비우면 그때 새로 베낀다.
  */
  const [held, setHeld] = useState<number | null>(null);
  useEffect(() => {
    /* 10분 아래는 안 띄운다 — 잠깐 화면을 내렸다 올릴 때마다 나오면 방해다 */
    if (active && awayMs >= OFFLINE_MIN_MS && held === null) setHeld(awayMs);
  }, [active, awayMs, held]);

  if (held === null) return null;

  const share = offlineAt(held);
  const worth = Math.round(maxValue(killGold(stage, false)) * share);
  const capped = held >= OFFLINE_CAP_MS;

  return (
    <Popup visible title="다녀오셨어요?" onClose={() => { dismissAway(); setHeld(null); }}>
      <View style={{ alignItems: 'center', gap: SP.sm, paddingBottom: SP.sm }}>
        <Sprite set="maid" name="shy" size={120} fallbackSet="maid" fallbackName="portrait" />
        <T size={11} center>
          {`자, 자리 비우신 동안 모아 뒀어요…\n제가 챙긴 건 아니고요, 그냥… 받으세요.`}
        </T>

        <Row gap={SP.sm}>
          <T size={10} dim="sub">비운 시간</T>
          <T size={12} bold>{span(held)}</T>
          {capped && <T size={9} dim="dim">(최대 8시간)</T>}
        </Row>
        <Row gap={SP.sm}>
          <T size={10} dim="sub">모인 것</T>
          <T size={12} bold>{`약 ${fmtShort(worth)}어치`}</T>
        </Row>

        {/*
          여덟 시간에서 멎는다는 것을 **차기 전에** 알려 준다. 다 차고 나서
          알면 그건 안내가 아니라 통보다.
        */}
        {!capped && (
          <T size={9} dim="dim" center>
            여덟 시간까지 쌓입니다 — 가득 차면 온라인 게이지 한 번분입니다.
          </T>
        )}

        <TreasurePop nonce={pop} left={0} bottom={90} size={1.6} />
      </View>

      <Btn
        label={done ? '닫기' : '받기'}
        fill
        onPress={() => {
          if (done) { dismissAway(); setHeld(null); return; }
          setPop((n) => n + 1);
          setDone(true);
          claimAway();
        }}
      />
    </Popup>
  );
}
