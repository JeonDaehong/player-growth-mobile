/**
 * 판이 열리고 닫히는 연출 — 검은 막, 판 이름, `Clear`, 양쪽에서 걸어 들어오기.
 *
 * ## 시계는 하나다
 *
 * 연출을 화면에만 두면 시계가 둘이 된다. 검은 막을 2초 띄우는 동안 엔진은
 * 계속 싸우므로, 막이 걷혔을 때 이미 누가 죽어 있다. 그래서 "지금 연출 중"
 * 은 **전투 상태가 들고 있고** (`BattleState` 의 `openIn`/`clearIn`), 틱이
 * 그동안 안 싸운다.
 *
 * 여기는 그 두 숫자를 보고 **그림만** 그린다. 얼마나 오래 하느냐는 엔진이
 * 정하고, 어떻게 보이느냐만 여기서 정한다.
 *
 * ## 그런데 왜 그 숫자를 직접 안 쓰나
 *
 * 엔진은 0.5초에 한 번 움직인다 (`TICK_MS`). 그 값으로 곧장 투명도를 그리면
 * 막이 네 계단으로 뚝뚝 끊겨 들어온다. 그래서 **연출이 시작되는 순간만**
 * 엔진에서 읽고, 그 뒤 2초는 `Animated` 가 부드럽게 끌고 간다 — 길이를 엔진과
 * 같게 맞춰 두었으므로 둘이 같이 끝난다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import {
  BattleState, CLEAR_MS, MOVE_MS, OPEN_MS, OPEN_WALK_MS, stageOf,
} from '@/core/autoBattle';
import { Row, T } from '@/ui/atoms';
import { sfx } from '@/ui/sfx';
import { MONO, SP, WHITE } from '@/ui/theme';

/**
 * 지금 무슨 연출 중인가.
 *
 *   open   판이 열린다 — 막이 걷히고 이름이 뜨고 양쪽에서 걸어 들어온다
 *   clear  우두머리를 잡았다 — `Clear` 가 뜨고 어두워진다
 *   move   `< >` 로 옮긴다 — 아무 말 없이 짧게 어두워진다
 *
 * `clear` 와 `move` 는 **같은 일**을 한다 (덮은 뒤에 판을 옮긴다). 띄우는
 * 글씨와 길이만 다르다 — 클리어는 보여 줄 것이 있어서 길고, 옮기기는
 * 사용자가 방금 누른 일이라 설명할 것이 없어서 짧다.
 */
export type StagePhase = 'none' | 'open' | 'clear' | 'move';

/**
 * 시작 연출 안에서 **글씨가 차지하는 몫**.
 *
 * `OPEN_MS` 의 마지막 한 틱은 걸어 들어오는 시간이라 (`OPEN_WALK_MS`) 막은
 * 그 전에 이미 걷혀 있어야 한다.
 */
const OPEN_VEIL = OPEN_MS - OPEN_WALK_MS;

/** 시작 연출 한 판을 0~1 로 폈을 때 각 대목이 끝나는 지점 */
const IN_DONE = (OPEN_VEIL * 0.34) / OPEN_MS;   // 검게 덮이고 글씨가 뜬다
const HOLD_DONE = (OPEN_VEIL * 0.66) / OPEN_MS; // 읽는 동안
const VEIL_DONE = OPEN_VEIL / OPEN_MS;          // 막이 걷힌다 (여기서부터 걸어옴)
/*
  다 모이는 지점 — 끝(1.0)이 아니라 조금 앞이다.

  엔진은 0.5초 틱으로 `openIn` 을 0 까지 내리고 거기서 싸움을 푼다. 화면의
  애니메이션은 그것과 위상이 안 맞아 최대 반 틱 어긋나므로, 미끄러짐을 정확히
  끝에 맞추면 아직 움직이는 중에 첫 타격이 나갈 수 있다. 먼저 다 서 있는 건
  아무도 눈치 못 채지만, 미끄러지면서 치는 건 바로 보인다.
*/
const WALK_DONE = 0.93;

/**
 * 연출 한 판을 0 → 1 로 끌고 가는 값.
 *
 * `openIn`/`clearIn` 이 0 에서 벗어나는 **그 순간**에만 다시 시작한다.
 * 중간값은 안 본다 — 엔진이 0.5초 계단으로 내려 주는 값을 그대로 그리면
 * 막이 뚝뚝 끊긴다.
 */
export function useStageStaging(battle: BattleState): {
  phase: StagePhase;
  t: Animated.Value;
} {
  const opening = (battle.openIn ?? 0) > 0;
  const shutting = (battle.clearIn ?? 0) > 0;
  const phase: StagePhase = shutting
    ? (battle.clearKind === 'move' ? 'move' : 'clear')
    : opening ? 'open' : 'none';

  /*
    같은 연출이 다시 시작된 것을 알아보려면 "지금 몇 판째 여느냐" 가 있어야
    한다. 10판을 깨고 10판을 다시 여는 경우 `stage` 가 안 바뀌기 때문이다.
    그래서 국면이 `none` 에서 벗어날 때마다 번호를 하나 올린다.
  */
  const [nonce, setNonce] = useState(0);
  const was = useRef<StagePhase>('none');
  /*
    ── "바로 앞이 클리어였나" 를 들고 다니던 것을 없앴다 ──

    앞 국면이 무엇이었나에 따라 시작 투명도를 0 이나 1 로 골랐다 (`fromClear`).
    그런데 그 값이 **상태**라 한 그리기 늦게 도착했다 — 국면이 바뀐 첫
    프레임에는 아직 옛 값이라, 이미 까맣던 화면이 한 프레임 투명해지고 그
    사이로 전투 화면이 번쩍했다.

    이제 시작 연출은 **언제나 까만 채로 연다** (아래 `veil`). 그러면 앞이
    무엇이었는지를 알 필요가 없다. 앱을 처음 켤 때도 검은 화면에서 판 이름이
    떠오르는 것이라 그림이 오히려 낫다.
  */
  useEffect(() => {
    if (phase !== 'none' && was.current !== phase) setNonce((n) => n + 1);
    was.current = phase;
  }, [phase]);

  const t = useRef(new Animated.Value(0)).current;
  /*
    ── 국면이 바뀌면 **그리기 전에** 시계를 되돌린다 ──

    앞 연출은 `t` 를 1 에 두고 끝난다. 갈래(`useEffect`)는 그리고 **난 뒤에**
    도므로, 새 국면의 첫 한 프레임은 앞 연출이 남긴 1 로 그려진다.

    옮기기는 막이 늘 1 이라 아무 일도 없지만, 시작 연출의 막은 t=1 에서
    0(투명)이다 — 그래서 옮기기가 끝나고 시작 연출로 넘어가는 그 한 프레임에
    **전투 화면이 샜다.** 정확히 "전투화면이 한 번 보였다가" 그것이다.

    `Animated.Value` 는 React 상태가 아니라 그리기 중에 건드려도 안전하다.
    갈래가 다시 0 으로 두고 애니메이션을 시작하지만, 같은 값이라 무해하다.
  */
  const seen = useRef<StagePhase>('none');
  if (seen.current !== phase) {
    seen.current = phase;
    t.setValue(0);
  }

  useEffect(() => {
    if (phase === 'none') return undefined;
    t.setValue(0);
    const a = Animated.timing(t, {
      toValue: 1,
      duration: phase === 'clear' ? CLEAR_MS : phase === 'move' ? MOVE_MS : OPEN_MS,
      easing: Easing.linear,
      /* 웹에서는 어차피 JS 로 떨어진다 — 켜 두면 경고만 는다 */
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [nonce, phase, t]);

  return { phase, t };
}

/**
 * 양쪽에서 걸어 들어오는 거리.
 *
 * 시작 연출의 **막이 걷힌 뒤부터** 제자리까지 온다. 아군은 왼쪽에서
 * (`dir: -1`), 적은 오른쪽에서 (`dir: 1`).
 *
 * `none`·`clear` 일 때는 0 을 고정으로 돌려준다 — 값이 아니라 **애니메이션
 * 노드**를 돌려주면, 화면이 살아 있는 내내 노드가 쌓인다 (`HitFx` 에서 한
 * 번 겪었다).
 */
export function walkInX(
  phase: StagePhase, t: Animated.Value, dir: -1 | 1, span: number,
): Animated.AnimatedInterpolation<number> | number {
  if (phase !== 'open') return 0;
  return t.interpolate({
    inputRange: [0, VEIL_DONE, WALK_DONE, 1],
    outputRange: [dir * span, dir * span, 0, 0],
    extrapolate: 'clamp',
  });
}

/**
 * 무대를 덮는 검은 막과 글씨.
 *
 * 무대(`BattleView` 의 `Animated.View`) 안에 **맨 위 층으로** 깐다. 화면
 * 전체가 아니라 무대만 덮는다 — 머리말과 파티 칸까지 어두워지면 게임이
 * 멈춘 것처럼 보인다.
 */
export function StageVeil({
  phase, t, stage,
}: {
  phase: StagePhase;
  t: Animated.Value;
  stage: number;
}) {
  /*
    ── 옮기는 중에는 글씨가 없다 ──

    한동안 여기서도 판 이름을 띄웠다. 그런데 바로 뒤에 시작 연출이 같은
    이름을 다시 띄우므로, **이름이 두 번 떴다** — 떴다가 꺼졌다가 또 뜬다.

    옮기기는 덮기만 하고 이름은 시작 연출 한 곳에서만 띄운다. 판이 무엇인지
    말하는 자리는 하나여야 한다.
  */
  const quiet = phase === 'move';
  /*
    ── 왜 `useMemo` 인가 ──

    `interpolate()` 는 부를 때마다 `t` 에 자식 노드를 하나씩 매단다. `t` 는
    이 컴포넌트가 살아 있는 내내 같은 값이므로, 그리기마다 부르면 노드가
    끝없이 쌓이고 시간에 비례해 느려진다. 전에 `HitBurst` 에서 정확히 이걸로
    렉이 났다.
  */
  const veil = useMemo(() => (phase === 'move'
    /*
      옮기기 — **처음부터 끝까지 까맣다.** 덮는 대목이 아예 없다.

      두 번 고쳤다. 처음엔 400ms 에 걸쳐 서서히 덮었고, 그다음엔 12%(50ms)
      만에 덮게 줄였다. 둘 다 지난 판이 보였다 — 계산은 이미 멈춰 있어서
      (`fightHeld`) 아군도 적도 가만히 선 채라, 50ms 라도 **멀뚱히 서 있는
      한 장**이 눈에 들어온다.

      덮는 것은 연출로 쓸 자리가 아니다. 누른 사람이 보고 싶은 것은 갈 판이지
      떠나는 판이 아니므로, 떠나는 판은 한 프레임도 안 보이는 것이 맞다.
    */
    ? t.interpolate({ inputRange: [0, 1], outputRange: [1, 1] })
    : phase === 'clear'
    /* 클리어 — 글씨가 먼저 뜨고, 그 뒤로 서서히 어두워진다 */
    ? t.interpolate({
      inputRange: [0, 0.35, 1], outputRange: [0, 0.2, 1],
    })
    /* 시작 — 덮였다가 걷힌다 */
    /*
      시작 — **까만 채로 열어서** 걷힌다.

      예전엔 0 에서 덮어 왔다. 앞이 클리어나 옮기기였으면 이미 까만데 거기서
      0 으로 시작하므로, 두 연출 사이에 다음 판의 무대가 한 번 번쩍했다.
      그걸 막으려고 "앞이 무엇이었나" 를 상태로 들고 다녔는데(`fromClear`),
      상태는 한 그리기 늦게 도착해서 정작 그 한 프레임을 못 막았다.

      **늘 1 에서 시작하면 그 질문 자체가 없어진다.** 앱을 처음 켤 때도 검은
      화면에서 판 이름이 떠오르는 것이라 그림이 오히려 낫다.
    */
    : t.interpolate({
      inputRange: [0, IN_DONE, HOLD_DONE, VEIL_DONE, 1],
      outputRange: [1, 1, 1, 0, 0],
    })), [phase, t]);

  const text = useMemo(() => (phase === 'clear'
    ? t.interpolate({
      inputRange: [0, 0.25, 0.72, 1], outputRange: [0, 1, 1, 0],
    })
    : t.interpolate({
      inputRange: [0, IN_DONE, HOLD_DONE, VEIL_DONE, 1],
      outputRange: [0, 1, 1, 0, 0],
    })), [phase, t]);

  /* 글씨가 살짝 다가온다 — 제자리에서 켜지면 자막처럼 보인다 */
  const zoom = useMemo(() => t.interpolate({
    inputRange: [0, phase === 'clear' ? 0.25 : IN_DONE, 1],
    outputRange: [1.3, 1, 1.05],
  }), [phase, t]);

  if (phase === 'none') return null;

  const zone = stageOf(stage).zone;

  return (
    <>
      {/* 막 — 무대만 덮는다 */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: '#000000',
          opacity: veil,
          zIndex: 95,
        }}
      />
      {/* 글씨 — 막보다 위 */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0, right: 0, top: '34%',
          alignItems: 'center',
          zIndex: 96,
          opacity: text,
          transform: [{ scale: zoom }],
        }}
      >
        {quiet ? null : phase === 'clear' ? (
          <Animated.Text
            style={{
              color: WHITE, fontFamily: MONO, fontSize: 22, fontWeight: '700',
              letterSpacing: 6,
            }}
          >
            CLEAR
          </Animated.Text>
        ) : (
          <>
            <Animated.Text
              style={{
                color: WHITE, fontFamily: MONO, fontSize: 9, letterSpacing: 3,
              }}
            >
              {zone}
            </Animated.Text>
            <Animated.Text
              style={{
                color: WHITE, fontFamily: MONO, fontSize: 20, fontWeight: '700',
                marginTop: 3,
              }}
            >
              {stage} 스테이지
            </Animated.Text>
          </>
        )}
      </Animated.View>
    </>
  );
}

/** 한 번 빤짝이는 데 걸리는 시간 (ms) */
const GLOW_MS = 1100;

/**
 * "우두머리 토벌" — 1분을 사냥하면 나오는 단추.
 *
 * **빤짝인다.** 이 화면은 켜 두고 딴 데 보는 화면이라, 가만히 있는 단추는
 * 배경이 된다. 판이 끝없이 굴러가는 중에 "이제 여기서 멈추고 눌러라" 를
 * 말하려면 움직이는 것 하나가 필요하다.
 *
 * 빛은 **테두리와 글씨의 투명도**로만 낸다. 흑백 2색이라 색으로 강조할
 * 방법이 없고, 크기를 흔들면 옆의 진행 막대가 같이 밀린다.
 */
export function BossCallBtn({ onPress }: { onPress: () => void }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /*
      끝없이 왕복한다. `Animated.loop` 은 멈추라고 할 때까지 도는데, 화면을
      떠날 때 안 멈추면 사라진 화면의 값을 계속 건드린다.
    */
    const a = Animated.loop(Animated.sequence([
      Animated.timing(t, {
        toValue: 1, duration: GLOW_MS / 2, easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(t, {
        toValue: 0, duration: GLOW_MS / 2, easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]));
    a.start();
    return () => a.stop();
  }, [t]);

  /*
    `interpolate()` 는 부를 때마다 `t` 에 자식 노드를 매단다. `t` 가 이
    컴포넌트만큼 오래 사는데 그리기마다 부르면 노드가 끝없이 쌓인다
    (`HitBurst` 에서 겪은 그것) — 여기는 계속 도는 값이라 더 위험하다.
  */
  const glow = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0.35, 1],
  }), [t]);

  return (
    <Pressable onPress={() => { sfx('tap'); onPress(); }} style={{ marginTop: SP.sm }}>
      <Animated.View
        style={{
          borderWidth: 1,
          borderColor: WHITE,
          opacity: glow,
          paddingVertical: SP.xs + 2,
          alignItems: 'center',
        }}
      >
        <T size={12} bold>우두머리 토벌</T>
      </Animated.View>
    </Pressable>
  );
}

/**
 * `< 3 >` — 판을 골라 가는 단추.
 *
 * **깬 판과 지금 판까지만** 간다 (`canGoStage`). 안 가는 쪽은 지우지 않고
 * 흐리게 둔다 — 사라지면 화살표 자리가 밀려서 남은 하나가 어느 쪽인지
 * 매번 다시 봐야 한다.
 */
export function StagePicker({
  stage, best, onGo,
}: {
  stage: number;
  best: number;
  onGo: (stage: number) => void;
}) {
  const canBack = stage > 1;
  const canNext = stage < Math.max(1, best);

  const arrow = (on: boolean, label: string, to: number) => (
    <Pressable
      /* 글자 하나는 손가락에 너무 작다 — 닿는 면만 넓힌다 */
      hitSlop={8}
      style={{ paddingHorizontal: 5, paddingVertical: 2, opacity: on ? 1 : 0.22 }}
      onPress={on ? () => { sfx('tap'); onGo(to); } : undefined}
    >
      <T size={13} bold>{label}</T>
    </Pressable>
  );

  return (
    <Row gap={0}>
      {arrow(canBack, '<', stage - 1)}
      {/*
        폭을 고정한다. 한 자리에서 두 자리로 넘어갈 때 폭이 변하면 화살표가
        좌우로 흔들려서, 누르려던 자리가 눌린 뒤에 옮겨 간다.
      */}
      <View style={{ minWidth: 54, alignItems: 'center' }}>
        <T size={12} bold>{stage}스테이지</T>
      </View>
      {arrow(canNext, '>', stage + 1)}
    </Row>
  );
}
