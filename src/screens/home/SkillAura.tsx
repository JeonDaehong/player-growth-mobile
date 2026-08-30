/**
 * 스킬 이펙트 — 기술을 쓰는 동안 발밑에서 빛이 퍼진다.
 *
 * ## 왜 필요한가
 *
 * 스킬은 네 번에 한 번뿐인 큰 기술인데, 몸짓만 바뀌면 평타와 구분이 잘 안 된다.
 * 특히 54px 로 줄여 놓으면 "내려베기" 와 "횡베기" 의 차이가 한눈에 안 들어온다.
 *
 * 발밑에 고리 하나만 깔아도 **지금 뭔가 다른 걸 한다**가 읽힌다. 인물 위에
 * 겹치는 게 아니라 아래에 깔리므로 캐릭터를 안 가린다.
 *
 * ## 기존 이펙트를 쓴다
 *
 * 새 그림을 안 받고 `fx/` 와 `fx_rune/` 에 있는 것을 쓴다.
 *
 *   ring  `fx/glow_1~5`  — 퍼지는 타원 고리
 *   rune  `fx_rune/1~5`  — 그려졌다 터지는 마법진
 *
 * **둘로 나눈 이유**는 전원이 고리 하나를 쓰고 있었기 때문이다. 이졸데의
 * 횡베기와 리안느의 화살비는 몸짓이 전혀 다른데, 발밑이 같으니 54px 에서는
 * 같은 기술로 보였다. 발밑이 갈리면 그것만으로 구분된다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Sprite } from '@/ui/Sprite';

/** 프레임 수 — `fx/glow_1..5` */
const FRAMES = 5;
/** 한 바퀴 도는 데 걸리는 시간 */
const LOOP_MS = 380;

/** 종류마다 어느 그림을, 얼마나 크게, 어디에 */
const LOOK = {
  ring: { set: 'fx', name: 'glow_', size: 1.45, drop: 0.12, side: 0.22 },
  /* 마법진은 원이라 더 넓게 깔리고, 발밑에 더 붙는다 */
  rune: { set: 'fx_rune', name: '', size: 1.7, drop: 0.04, side: 0.35 },
  /*
    재. "재를 뿌리는 사제" 라는 이름 그대로 발밑에서 피어오른다.
    고리도 아니고 원도 아니라, 세 사람 중 유일하게 **가장자리가 없다** —
    54px 로 줄여도 앞의 둘과 안 헷갈린다.
  */
  ash: { set: 'fx', name: 'smoke_', size: 1.5, drop: 0.18, side: 0.24 },
} as const;

export type AuraKind = keyof typeof LOOK;

export function SkillAura({
  on, kind, size,
}: { on: boolean; kind: AuraKind; size: number }) {
  const look = LOOK[kind];
  const [frame, setFrame] = useState(0);
  const at = useRef(0);

  useEffect(() => {
    if (!on) { setFrame(0); at.current = 0; return; }
    /*
      켜져 있는 동안 계속 돈다. 한 번만 재생하고 멈추면 스킬 동작(510ms)이
      끝나기 전에 이펙트가 먼저 사라져서, 마지막 프레임이 밋밋해진다.
    */
    at.current = 1;
    setFrame(1);
    const t = setInterval(() => {
      at.current = (at.current % FRAMES) + 1;
      setFrame(at.current);
    }, LOOP_MS / FRAMES);
    return () => clearInterval(t);
  }, [on]);

  if (!frame) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        /* 발밑 — 인물 아래에 깔리도록 zIndex 를 낮게 */
        bottom: -size * look.drop,
        left: -size * look.side,
        zIndex: 1,
      }}
    >
      <Sprite set={look.set} name={`${look.name}${frame}`} size={size * look.size} />
    </View>
  );
}
