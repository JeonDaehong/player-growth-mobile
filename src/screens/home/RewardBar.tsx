/**
 * ── 보물 상자와 재화 게이지 ── 위 띠와 무대 사이의 한 줄.
 *
 * ## 이 한 줄이 하는 일
 *
 * 켜 놓고 있는 동안 게이지가 찬다. 가득 차면 **더 안 차고**, 눌러야 받는다
 * (`core/idle`). 그 "눌러야 한다" 가 이 게임에서 사람이 화면을 다시 보는
 * 유일한 이유이므로, 무대 바로 위 — 시선이 늘 지나가는 자리에 둔다.
 *
 * ## 왜 자동으로 안 받나
 *
 * 자동이면 게이지가 없는 것과 같다. 눌러서 받는 것과 저절로 들어오는 것은
 * 받는 양이 같아도 다른 일이다 — 앞엣것은 사람이 한 일이고 뒤엣것은 시간이
 * 한 일이다.
 *
 * 가득 차면 상자가 흔들린다. 흔들림은 이 화면에서 **여기 하나뿐**이라
 * (전투 연출은 무대 안이다) 눈이 반드시 간다.
 *
 * ## 다이아 단추
 *
 * 하루 세 번까지, 다이아를 내고 그 자리에서 채워 받는다 (50 · 100 · 200).
 * 값이 오르는 이유는 `core/refill` 과 같다 — 정액이면 게이지라는 개념을
 * 통째로 살 수 있다.
 *
 * 가득 찼을 때는 이 단추가 사라진다. 그냥 누르면 되는 것에 다이아를 받는
 * 것은 파는 것이 아니라 실수를 파는 것이다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { dayKeyNow } from '@/state/store';
import { killGold } from '@/core/autoBattle';
import { gaugeAt, instantDia, maxValue } from '@/core/idle';
import { fmtShort } from '@/core/currency';
import { T } from '@/ui/atoms';
import { Pixel } from '@/ui/Pixel';
import { ICONS } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { BORDER, C, SP, WHITE } from '@/ui/theme';
import { TreasurePop } from './TreasureFx';

/** 게이지를 몇 초마다 다시 그리나 */
const TICK_MS = 1000;

export function RewardBar() {
  const idleAt = useGame((s) => s.idleAt);
  const idleInstant = useGame((s) => s.idleInstant);
  const dia = useGame((s) => s.dia);
  const stage = useGame((s) => s.battle.stage);
  const claimIdle = useGame((s) => s.claimIdle);
  const instantIdle = useGame((s) => s.instantIdle);

  /*
    시계는 여기서 따로 돈다.

    스토어에 "지금 몇 시" 를 넣고 1초마다 갱신하면 그 값을 읽는 화면이 전부
    다시 그려진다 — 무대와 파티 넷까지. 게이지 하나 때문에 그럴 이유가 없다.
  */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(t);
  }, []);

  const at = gaugeAt(now - idleAt);
  const full = at >= 1;
  const used = idleInstant.dayKey === dayKeyNow() ? idleInstant.used : 0;
  const price = instantDia(used);

  /** 받으면 상자에서 튀어나오는 것 (`TreasureFx`) */
  const [pop, setPop] = useState(0);

  /*
    ── 가득 찼을 때 상자가 흔들린다 ──

    가득 차기 전에는 아무것도 안 한다. 늘 흔들리면 그건 흔들림이 아니라
    무늬이고, 무늬는 아무 말도 안 한다.
  */
  const wob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!full) { wob.setValue(0); return undefined; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(wob, {
        toValue: 1, duration: 110, easing: Easing.linear, useNativeDriver: true,
      }),
      Animated.timing(wob, {
        toValue: -1, duration: 110, easing: Easing.linear, useNativeDriver: true,
      }),
      Animated.timing(wob, {
        toValue: 0, duration: 110, easing: Easing.linear, useNativeDriver: true,
      }),
      /* 세 번 떨고 한참 쉰다 — 쉬지 않으면 계속 떠는 상자가 된다 */
      Animated.delay(900),
    ]));
    loop.start();
    return () => { loop.stop(); wob.setValue(0); };
  }, [full, wob]);

  const tilt = wob.interpolate({ inputRange: [-1, 1], outputRange: ['-9deg', '9deg'] });

  /** 가득 찬 한 번이 얼마어치인가 — 사람이 "누를 값어치가 있나" 를 물을 때 쓴다 */
  const worth = maxValue(killGold(stage, false));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SP.xs, marginBottom: SP.xs }}>
      {/* ── 상자 ── */}
      <Pressable
        onPress={() => {
          if (!full) { sfx('tap'); return; }
          if (claimIdle()) { setPop((n) => n + 1); }
        }}
        hitSlop={6}
        style={({ pressed }) => [
          BORDER,
          {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: full ? 2 : 1,
            backgroundColor: pressed && full ? C.bgInv : 'transparent',
          },
        ]}
      >
        {({ pressed }: { pressed: boolean }) => (
          <Animated.View style={{ transform: [{ rotate: tilt }] }}>
            <Pixel
              sprite={ICONS.chest}
              scale={3}
              color={pressed && full ? C.fgInv : WHITE}
              opacity={full ? 1 : 0.45}
            />
          </Animated.View>
        )}
      </Pressable>

      {/* ── 게이지 ── */}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={9} dim="sub">{full ? '가득 찼습니다 — 상자를 누르세요' : '재화 게이지'}</T>
          <T size={9} dim="dim">{`${Math.floor(at * 100)}%`}</T>
        </View>
        {/*
          `ui/atoms` 의 `Bar` 를 안 쓴다 — 저건 칸을 나눈 블록 막대라 몇 %
          찼는지가 칸 단위로 튄다. 여기 값은 1초마다 조금씩 오르는 것이라
          이어진 막대여야 "차고 있다" 가 보인다.
        */}
        <View style={[BORDER, { height: 8, padding: 1 }]}>
          <View
            style={{
              width: `${Math.max(0, Math.min(1, at)) * 100}%`,
              height: '100%',
              backgroundColor: WHITE,
            }}
          />
        </View>
        <T size={8} dim="dim" numberOfLines={1}>
          {`가득 차면 약 ${fmtShort(worth)}어치`}
        </T>
      </View>

      {/* ── 다이아로 즉시 ── */}
      {!full && (
        <Pressable
          onPress={() => { if (instantIdle()) setPop((n) => n + 1); }}
          hitSlop={4}
          disabled={price === null}
          style={({ pressed }) => [
            BORDER,
            {
              paddingHorizontal: SP.xs,
              paddingVertical: 4,
              alignItems: 'center',
              opacity: price === null ? 0.35 : 1,
              backgroundColor: pressed ? C.bgInv : 'transparent',
            },
          ]}
        >
          {({ pressed }: { pressed: boolean }) => (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Pixel sprite={ICONS.gem} scale={1.2} color={pressed ? C.fgInv : WHITE} />
                <T size={10} bold style={{ color: pressed ? C.fgInv : WHITE }}>
                  {price === null ? '—' : String(price)}
                </T>
              </View>
              {/*
                남은 횟수를 같이 적는다. 값만 있으면 왜 어제는 50 이었는지가
                설명되지 않는다.
              */}
              <T size={8} dim="dim" style={pressed ? { color: C.fgInv } : undefined}>
                {price === null ? '오늘 끝' : `${3 - used}회 남음`}
              </T>
            </>
          )}
        </Pressable>
      )}

      {/* 받는 순간 상자에서 터져 나오는 것 — 자리는 상자 위다 */}
      <TreasurePop nonce={pop} left={20} bottom={20} />

      {/* 다이아가 모자라면 값이 회색이어야 하는데, 그 판단은 스토어가 한다 */}
      {price !== null && dia < price && !full && (
        <View style={{ position: 'absolute', right: 0, bottom: -10 }}>
          <T size={8} dim="dim">다이아 부족</T>
        </View>
      )}
    </View>
  );
}
