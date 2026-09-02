/**
 * 우두머리가 무엇을 하는지 **눈에 보이게** 하는 연출들.
 *
 * ## 왜 따로 있나
 *
 * 스무 우두머리가 저마다 기술을 하나씩 갖고 있는데, 화면에서는 스무 개가
 * 전부 같아 보였다 — 머리 위에 이름이 뜨고, 우두머리가 앞으로 한 번 나왔다
 * 들어가고, 아군 머리 위에 숫자가 뜬다. 그게 전부였다.
 *
 * 그래서 **암석 낙하에 암석이 없었고**, 벼락에 벼락이 없었고, 넝쿨에 감기는
 * 것이 없었다. 이름만 다른 같은 기술 스무 개였던 셈이다.
 *
 * ## 세 자리에서 일어난다
 *
 *   boss  우두머리 쪽에서 (휘두르기 · 파동 · 사방으로 퍼지는 가시 · 악취)
 *   shot  우두머리에서 아군에게 **날아가는 것** (곧게 · 포물선 · 터지는 것)
 *   body  맞은 아군 **몸 위에서** (그어짐 · 찍힘 · 감김 · 떨어지는 암석)
 *
 * 셋을 갈라 두는 이유는 하나를 고르는 게 아니라 **섞어 쓰기** 때문이다.
 * 16판 녹슨 도끼는 우두머리가 크게 휘두르고(boss) 맞은 사람이 찍힌다(body).
 * 20판 벼락은 하늘에서 떨어지는 것이라 우두머리 쪽에서는 아무 일도 안 난다.
 *
 * ## 맞는 순간에 아파야 한다
 *
 * `FxPlan.lead` 가 그 값이다 — 연출이 시작되고 **실제로 닿기까지** 걸리는
 * 시간. 화면은 피해 숫자와 붉은 깜빡임을 그만큼 미뤘다가 띄운다.
 *
 * 미루지 않으면 암석이 아직 하늘에 있는데 숫자가 먼저 뜬다. 그러면 암석은
 * 연출이 아니라 **숫자가 뜬 뒤에 떨어지는 장식**이 된다 — 무엇이 무엇을
 * 일으켰는지가 뒤집힌다.
 *
 * 날아가는 것(`shot`)은 표에 적힌 `lead` 를 안 쓴다. 거리가 매번 다르므로
 * 그때 재서(`HitFx` 의 `shotMsOf`) 그 값을 쓴다 — 뒤에 선 사람을 노리면 더
 * 오래 난다.
 *
 * ## 시트가 있는 것은 시트를 쓴다
 *
 * 일곱 벌이 이미 들어와 있었다 (`assets/sprites/bfx_*`,
 * `docs/BOSS_FX_PROMPTS.md`) — 암석 · 가시 · 산성 덩이 · 포자 · 융해 액 ·
 * 부패 · 벼락. 그런데 화면 어디서도 안 불렀다. 프롬프트도 그림도 진작
 * 있었는데 그리는 쪽이 없어서 통째로 놀고 있었다.
 *
 * 나머지 여덟은 도형이다 (그어짐 · 찌르기 · 감김 · 찍힘 · 솟구침 · 휘두름 ·
 * 파동 · 사방으로). `SkillFx` 와 같은 갈림길이다 — **갈라지고 부서지는 것**은
 * 시트라야 하고, "선 하나가 자란다 / 고리가 퍼진다" 는 도형이라야 한다.
 * 뒤엣것은 불투명도와 크기를 연속으로 바꾸는 것이 전부인데 2색 시트에는
 * 옅음이 없다.
 *
 * 하나만 빠져 있다 — **넝쿨.** 받아 둔 일곱은 전부 몸에서 떨어져 나오는
 * 것이라 목록에 없었다. 프롬프트를 새로 적어 뒀고, 들어오면 `Coil` 의 도형만
 * 갈아 끼우면 된다 (표는 안 건드린다).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Sprite } from '@/ui/Sprite';
import { WHITE } from '@/ui/theme';

/** 우두머리 쪽에서 나는 것 */
export type BossKind = 'swing' | 'ripple' | 'spikes' | 'stench';

/** 우두머리가 날리는 것 */
export type ShotKind = 'bolt' | 'lob' | 'bomb' | 'blob';

/** 맞은 아군 몸 위에서 나는 것 */
export type BodyKind =
  | 'slashV' | 'slashD' | 'lance' | 'spore' | 'coil'
  | 'rock' | 'crush' | 'spike' | 'thunder' | 'drip';

/**
 * 한 번의 공격이 화면에서 어떻게 보이나.
 *
 * 전부 없어도 된다 — 그러면 예전처럼 우두머리가 한 번 움찔하고 숫자만 뜬다.
 * 붙어서 치는 놈에게는 그게 맞다.
 */
export interface FxPlan {
  boss?: BossKind;
  shot?: ShotKind;
  body?: BodyKind;
  /**
   * 연출이 시작되고 **실제로 닿기까지** (ms).
   *
   * 피해 숫자와 붉은 깜빡임이 이만큼 늦게 뜬다. 짧게 잡는다 — 길면 체력
   * 막대(상태를 그대로 그린다)와 숫자가 눈에 띄게 갈린다.
   */
  lead: number;
  /** 우두머리가 아군 진영으로 **뛰어들어** 찍나 (1판 뭉개기 하나뿐이다) */
  leap?: boolean;
  /** 무대를 통째로 쓸고 지나가나 (10판 해일 하나뿐이다) */
  tide?: boolean;
}

/**
 * 몸 위 연출이 **켜지고 나서 실제로 닿기까지** (ms).
 *
 * 연출마다 다르다. 그어짐은 선이 다 그어지는 순간이고, 암석은 땅에 닿는
 * 순간이고, 벼락은 줄기가 다 내려온 순간이다.
 *
 * ## 왜 이 표가 따로 있나
 *
 * `FxPlan.lead` 는 **아픈 순간**을 가리킨다. 그런데 연출을 그때 켜면 늦다 —
 * 암석은 떨어지는 데 420ms 가 걸리므로, 아픈 순간에 켜면 아프고 나서 암석이
 * 떨어진다.
 *
 * 그래서 켜는 시각은 `lead - BODY_HIT[kind]` 다. 뒤에서 앞으로 거슬러
 * 잡는다 — **맞춰야 하는 것은 시작이 아니라 닿는 순간**이기 때문이다.
 *
 * 1판 뭉개기가 그 이유를 그대로 보여 준다. 우두머리가 아군 진영까지 뛰어가
 * 내리꽂는 데 274ms 가 걸리는데(`useLeap`), 찍힌 자국을 0 에 켜면 우두머리가
 * 아직 공중에 있는 동안 이미 찍혀 있다.
 *
 * 값을 고치면 아래 컴포넌트의 구간도 같이 고쳐야 한다. 검사가 둘이 맞는지
 * 본다 (`scratchpad/bossfx-test.js`).
 */
export const BODY_HIT: Record<BodyKind, number> = {
  slashV: 144,
  slashD: 144,
  lance: 118,
  coil: 300,
  crush: 92,
  spike: 123,
  /* 시트를 쓰는 넷은 **제일 큰 칸이 뜨는 때**가 닿는 때다 (`useFrames`) */
  spore: 248,
  rock: 418,
  thunder: 208,
  drip: 248,
};

/**
 * 이미 받아 둔 시트 일곱 (`assets/sprites/bfx_*`).
 *
 * ## 있는 줄 모르고 도형으로 그리고 있었다
 *
 * 프롬프트도 그림도 진작 들어와 있었는데 (`docs/BOSS_FX_PROMPTS.md`) 화면
 * 어디서도 안 불렀다. 암석 · 가시 · 산성 덩이 · 포자 · 융해 액 · 부패 ·
 * 벼락 일곱이 그대로 놀고 있었다.
 *
 * 도형으로 흉내 낼 수 있는 것과 아닌 것이 있다. **갈라지고 부서지는 것**이
 * 뒤엣것이다 — 암석이 네 조각으로 깨지는 모양을 사각형 몇 개로는 못 그린다
 * (`SkillFx` 의 화산이 시트인 것과 같은 갈림길이다).
 *
 * 도형으로 남은 것은 그어짐 · 찌르기 · 감김 · 찍힘 · 솟구침 · 휘두름 ·
 * 파동 · 사방으로 여덟이다. 저것들은 전부 "선 하나가 자란다 / 고리가
 * 퍼진다" 라 도형이 오히려 낫다.
 */
export const SHEET: Partial<Record<BodyKind, { set: string; cells: number }>> = {
  /* 3칸짜리는 **경로가 아니라 수명**이다 — 온전함 · 갈라짐 · 부서짐 */
  rock: { set: 'bfx_rock', cells: 3 },
  /* 5칸짜리는 한자리에서 피었다 진다 — 3번 칸이 제일 크다 */
  spore: { set: 'bfx_spore', cells: 5 },
  thunder: { set: 'bfx_bolt', cells: 5 },
  drip: { set: 'bfx_drip', cells: 5 },
};

/** 아무 연출도 없는 평범한 한 대 */
const PLAIN: FxPlan = { lead: 0 };

/**
 * 판마다 **평타**가 어떻게 보이나.
 *
 * 안 적힌 판은 붙어서 친다 (`PLAIN`) — 그림의 `attack` 칸 하나로 충분한
 * 놈들이다. 여기 적힌 것은 "가만히 서서 팔만 까딱하는 것으로 보인다" 는
 * 말을 들은 판들이다.
 */
export const BOSS_BLOW: Record<number, FxPlan> = {
  /* 뱉는 놈인데 아무것도 안 날아갔다 */
  3: { shot: 'blob', lead: 300 },
  /* 무슨 동작인지 알 수 없다는 말을 들었다 — 날리는 것으로 바꾼다 */
  4: { shot: 'bolt', lead: 300 },
  /* 공격처럼 안 보인다 — 크게 한 번 휘두른다 */
  5: { boss: 'swing', lead: 160 },
  14: { shot: 'bolt', lead: 300 },
  /* 포물선으로 던진다. 실제로 닿을 때 아프다 (`lead`) */
  15: { shot: 'lob', lead: 340 },
  /* 휘두르고, 맞은 쪽이 찍힌다 */
  16: { boss: 'swing', body: 'crush', lead: 200 },
  /* 버섯 폭탄 — 날아가서 터진다 */
  17: { shot: 'bomb', lead: 340 },
  /* 가시 한 발 */
  18: { shot: 'bolt', lead: 300 },
  19: { boss: 'swing', lead: 160 },
};

/**
 * 특수기 **이름표마다** 어떻게 보이나 (`BossPattern.id`).
 *
 * 이름(한글)이 아니라 이름표로 고른다 — 화면에 적는 글은 언제든 바뀔 수
 * 있고, 한 글자 고치는 순간 연출이 조용히 사라지면 원인을 찾기 어렵다.
 */
export const BOSS_CAST: Record<string, FxPlan> = {
  /* 1판 뭉개기 — 진짜로 아군 쪽으로 뛰어들어 찍는다 */
  squash: { leap: true, body: 'crush', lead: 280 },
  /* 2판 식인 덩굴 휘감기 — 뭘 맞았는지 알 수 없다는 말을 들었다 */
  coil: { body: 'coil', lead: 320 },
  /* 3판 맹독 오물 분사 */
  spray: { shot: 'blob', lead: 300 },
  /* 4판 환각 포자 폭발 — 맞은 사람 몸에서 터진다 */
  haze: { body: 'spore', lead: 300 },
  /* 5판 칼날 가시 난사 — 사방으로 뿌린다 */
  barb: { boss: 'spikes', lead: 260 },
  /* 6판 암석 낙하 — 암석이 없었다 */
  rock: { body: 'rock', lead: 420 },
  /* 7판 양단 직격 — 세로로 샥 */
  cleave: { body: 'slashV', lead: 160 },
  /* 8판 강산성 융해 액 */
  /* 몸에 부어 내리는 것이다 — 날아가는 것이 아니라 (`bfx_drip`) */
  melt: { body: 'drip', lead: 320 },
  /* 9판 백골 가시 찌르기 — 가로로 팍 */
  bone: { body: 'lance', lead: 140 },
  /* 10판 해일 — 무대를 빠르게 휩쓸고 지나간다. 가리지는 않는다 */
  tide: { tide: true, lead: 380 },
  /* 10판 포식의 점액 */
  gulp: { shot: 'blob', lead: 300 },
  /* 11판 유해의 가시 찌르기 */
  spike: { body: 'lance', lead: 140 },
  /* 12판 포식자의 소화액 */
  digest: { shot: 'blob', lead: 300 },
  /* 13판 속박의 덩굴 — 행동 불가라 몸이 감겨야 한다 */
  bind: { body: 'coil', lead: 320 },
  /* 14판 독성 포자 분출 — 맞은 사람마다 터진다 */
  burst: { body: 'spore', lead: 300 },
  /* 15판 부패의 악취 — 스멀스멀 퍼지다 사라진다 */
  stench: { boss: 'stench', lead: 340 },
  /* 16판 녹슨 도끼 — 크게 휘두르고 크게 찍힌다 */
  axe: { boss: 'swing', body: 'crush', lead: 200 },
  /* 17판 공허한 울림 — 파동이 퍼진다 */
  hollow: { boss: 'ripple', lead: 300 },
  /* 18판 가시 가지 후려치기 — 가시가 사방으로 */
  lash: { boss: 'spikes', lead: 260 },
  /* 19판 부패한 뿌리 솟구침 — 발밑에서 솟았다 내려간다 */
  root: { body: 'spike', lead: 160 },
  /* 20판 태고의 성난 벼락 */
  bolt: { body: 'thunder', lead: 240 },
  /* 20판 자비없는 칼날 — 비스듬히 쫙 */
  blade: { body: 'slashD', lead: 160 },
};

/** 그 판 평타의 연출. 안 적힌 판은 그냥 친다 */
export const blowFx = (stage: number): FxPlan => BOSS_BLOW[stage] ?? PLAIN;

/** 그 특수기의 연출. 모르는 이름표면 그냥 친다 */
export const castFx = (id: string | null): FxPlan => (
  id ? BOSS_CAST[id] ?? PLAIN : PLAIN
);

/**
 * 한 번 돌고 스스로 꺼지는 시계.
 *
 * `SkillFx` 의 `useOnce` 와 달리 **번호를 안 받는다.** 여기 것들은 부르는
 * 쪽에서 `key` 로 새로 태우기 때문이다 (`key={nonce}`) — 그 편이 훨씬 단순한
 * 데다, 도는 중에 또 맞아도 앞엣것이 끝까지 돌고 새것이 따로 돈다.
 */
function useRun(ms: number): { t: Animated.Value; on: boolean } {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(true);
  useEffect(() => {
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    /* 멈추면 되돌린다 — `stop()` 은 값을 그 자리에 두고 멈춘다 */
    return () => { alive = false; a.stop(); t.setValue(0); };
  }, [ms, t]);
  return { t, on };
}

/**
 * 시트의 칸을 순서대로 넘긴다.
 *
 * `Animated.Value` 는 화면을 다시 그리지 않고 흐르므로 (그래서 싸다) 칸을
 * 넘기려면 타이머가 따로 있어야 한다. `SkillFx` 의 화산이 쓰는 방법과 같다 —
 * 값을 구독하면 프레임마다 콜백이 돌아 훨씬 비싸다.
 *
 * 칸이 고르게 나뉘므로 **3번 칸이 뜨는 때**는 5칸짜리에서 전체의 40% 다.
 * `BODY_HIT` 의 숫자가 거기서 나온다.
 */
function useFrames(cells: number, ms: number): number {
  const [n, setN] = useState(1);
  useEffect(() => {
    setN(1);
    const ts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 2; i <= cells; i += 1) {
      ts.push(setTimeout(() => setN(i), (ms * (i - 1)) / cells));
    }
    return () => ts.forEach(clearTimeout);
  }, [cells, ms]);
  return n;
}

/**
 * 몸 위에 얹는 층 — 불꽃(38) 위, 숫자(40) 아래.
 *
 * 숫자보다 아래여야 한다. 연출이 숫자를 덮으면 정작 얼마나 아팠는지가
 * 안 보이는데, 그건 연출이 대신 말해 줄 수 있는 종류의 것이 아니다.
 */
const BODY_Z = 39;

/** 인물 상자를 꽉 채우는 자리 — 몸 위 연출은 전부 여기서 시작한다 */
const bodyBox = (size: number) => ({
  position: 'absolute' as const,
  left: 0,
  top: 0,
  width: size,
  height: size,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  zIndex: BODY_Z,
});

/** 우두머리 몸에 얹는 층 — 말풍선(46)보다 아래 */
const sideBox = (size: number, shift = 0) => ({
  position: 'absolute' as const,
  left: shift,
  top: 0,
  width: size,
  height: size,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  zIndex: 44,
});

/* ────────────────────────────── 몸 위 ────────────────────────────── */

/**
 * ── 그어짐 ── 몸을 가로지르는 밝은 선 한 줄.
 *
 * 7판 양단 직격은 세로로(`slashV`), 20판 자비없는 칼날은 비스듬히(`slashD`).
 * 둘을 가르는 것은 **각도 하나**다 — 굵기나 색을 바꾸면 "다른 종류의 공격"
 * 으로 보이는데, 실제로는 둘 다 한 번 베는 것이다.
 *
 * 선이 **길이 방향으로 자란다.** 통째로 나타났다 사라지면 그어진 것이 아니라
 * 깜빡인 것으로 보인다. 그은 뒤에는 살짝 벌어진다 (`open`) — 벤 자리가
 * 열리는 것으로 읽힌다.
 */
function Slash({ size, deg }: { size: number; deg: number }) {
  const { t, on } = useRun(360);
  /* 360ms 의 40% 에 다 그어진다 = 144ms — `BODY_HIT.slashV` 와 같은 값이다 */
  const grow = useMemo(() => t.interpolate({
    inputRange: [0, 0.4, 1], outputRange: [0.15, 1, 1], extrapolate: 'clamp',
  }), [t]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.1, 0.35, 1], outputRange: [0, 1, 0.9, 0],
  }), [t]);
  const open = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [1, 2.4],
  }), [t]);

  if (!on) return null;
  return (
    <View pointerEvents="none" style={bodyBox(size)}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 2,
          height: size * 1.25,
          backgroundColor: WHITE,
          opacity: fade,
          transform: [{ rotate: `${deg}deg` }, { scaleY: grow }, { scaleX: open }],
        }}
      />
    </View>
  );
}

/**
 * ── 찌르기 ── 오른쪽(우두머리 쪽)에서 **가로로** 들어와 박혔다 빠진다.
 *
 * 9판 백골 가시와 11판 유해의 가시. 그어짐(`Slash`)과 다른 점은 방향이
 * 아니라 **움직임**이다 — 저건 몸 위에 생기고, 이건 밖에서 들어온다. 찌르는
 * 기술은 어디서 왔는지가 곧 내용이다.
 */
function Lance({ size }: { size: number }) {
  const { t, on } = useRun(420);
  /* 빠르게 들어와서(28%) 잠깐 박혀 있다가(60%) 뽑힌다 */
  const push = useMemo(() => t.interpolate({
    inputRange: [0, 0.28, 0.6, 1],
    outputRange: [size * 1.1, -size * 0.15, -size * 0.15, size * 0.9],
  }), [t, size]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0],
  }), [t]);

  if (!on) return null;
  return (
    <View pointerEvents="none" style={bodyBox(size)}>
      <Animated.View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          alignItems: 'center',
          opacity: fade,
          transform: [{ translateX: push }],
        }}
      >
        {/* 촉이 왼쪽(들어가는 쪽)을 본다 */}
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: 4,
            borderBottomWidth: 4,
            borderRightWidth: 9,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderRightColor: WHITE,
          }}
        />
        <View style={{ width: size * 0.85, height: 2, backgroundColor: WHITE }} />
      </Animated.View>
    </View>
  );
}

/**
 * ── 감김 ── 몸을 두르는 띠 셋이 조여든다.
 *
 * 2판 식인 덩굴과 13판 속박의 덩굴. 13판은 **행동 불가**를 거는 기술이라
 * (`st_stun`) "묶였다" 가 화면에 없으면 왜 안 움직이는지 알 수가 없다.
 *
 * 조여드는 것이 핵심이다 (`grip` 이 1.7 → 0.95). 처음부터 몸에 붙어 있으면
 * 감긴 것이 아니라 원래 거기 있던 무늬로 보인다.
 *
 * ## 여기만 시트가 없다
 *
 * 받아 둔 일곱(`SHEET`) 중에 넝쿨이 없다 — 저것들은 전부 **몸에서 떨어져
 * 나오는 것**이고, 감기는 것은 몸에 붙는 것이라 목록에 안 들어갔다.
 * 프롬프트를 `docs/BOSS_FX_PROMPTS.md` 에 새로 적어 뒀다.
 *
 * 그때까지는 납작한 타원 **테두리** 셋이다. 채우면 인물이 통째로 가려진다.
 */
function Coil({ size }: { size: number }) {
  const { t, on } = useRun(900);
  const bands = useMemo(() => [-0.18, 0.02, 0.22].map((at, i) => ({
    at,
    grip: t.interpolate({
      inputRange: [0, 0.3 + i * 0.06, 1],
      outputRange: [1.7, 0.95, 0.95],
      extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, 0.1 + i * 0.05, 0.72, 1], outputRange: [0, 1, 1, 0],
    }),
  })), [t]);

  if (!on) return null;
  const w = size * 0.86;
  return (
    <View pointerEvents="none" style={bodyBox(size)}>
      {bands.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: w,
            height: w * 0.30,
            borderRadius: w,
            borderWidth: 2,
            borderColor: WHITE,
            top: size * (0.44 + b.at),
            opacity: b.fade,
            transform: [{ scaleX: b.grip }, { scaleY: b.grip }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * ── 시트를 그대로 트는 몸 위 연출 ──
 *
 * 포자 · 암석 · 벼락 · 융해 액 넷이 이 하나를 같이 쓴다 (`SHEET`).
 *
 * 넷이 하는 일이 같기 때문이다 — **칸을 순서대로 넘기면서 옅어진다.** 다른
 * 것은 그림뿐이라, 넷을 따로 쓰면 같은 열다섯 줄이 네 벌 생긴다.
 *
 * 암석만 여기에 **떨어지는 움직임**을 얹는다 (`drop`). 시트 셋은 온전함 ·
 * 갈라짐 · 부서짐이라 수명은 그리는데 높이는 안 그린다 — 위에서 오는 것은
 * 실제로 내려와야 위에서 온 것이 된다.
 */
function Sheeted({ kind, size }: { kind: BodyKind; size: number }) {
  const art = SHEET[kind];
  const ms = kind === 'rock' ? 580 : 620;
  const { t, on } = useRun(ms);
  const n = useFrames(art?.cells ?? 3, ms);

  /*
    암석만 하늘에서 내려온다. 나머지 셋은 제자리에서 피었다 진다.

    떨어지는 동안 가속한다 (구간을 뒤로 몰았다) — 등속으로 내려오면 무게가
    없다. 72% 에 땅에 닿고, 그 순간이 곧 아픈 순간이다 (`BODY_HIT.rock`).
  */
  const drop = useMemo(() => t.interpolate({
    inputRange: [0, 0.4, 0.72, 1],
    outputRange: kind === 'rock'
      ? [-size * 1.9, -size * 0.75, 0, 0]
      : [0, 0, 0, 0],
  }), [t, kind, size]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.78, 1], outputRange: [0, 1, 1, 0],
  }), [t]);

  if (!on || !art) return null;
  return (
    <View pointerEvents="none" style={bodyBox(size)}>
      <Animated.View
        style={{
          position: 'absolute',
          opacity: fade,
          transform: [{ translateY: drop }],
        }}
      >
        <Sprite set={art.set} name={String(n)} size={Math.round(size * 1.1)} />
      </Animated.View>
    </View>
  );
}


/**
 * ── 찍힘 ── 위에서 짓눌린 자국.
 *
 * 1판 뭉개기(우두머리가 뛰어들어 찍는다)와 16판 녹슨 도끼. 둘 다 **무게로
 * 누르는** 기술이라, 베이는 것(`Slash`)과 달리 자국이 가로로 퍼져야 한다.
 *
 * 밖에서 안으로 조여든다 (1.8 → 1). 안에서 밖으로 퍼지면 그건 터진 것이다.
 */
function Crush({ size }: { size: number }) {
  const { t, on } = useRun(420);
  const snap = useMemo(() => t.interpolate({
    inputRange: [0, 0.22, 1], outputRange: [1.8, 1, 1.12], extrapolate: 'clamp',
  }), [t]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.12, 0.4, 1], outputRange: [0, 1, 0.85, 0],
  }), [t]);
  /* 발밑으로 퍼지는 충격 — 눌린 것이 땅까지 갔다 */
  const wave = useMemo(() => t.interpolate({
    inputRange: [0, 0.2, 1], outputRange: [0.2, 0.6, 2.2],
  }), [t]);
  const waveFade = useMemo(() => t.interpolate({
    inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 0.7, 0.15, 0],
  }), [t]);

  if (!on) return null;
  const w = size * 0.9;
  return (
    <View pointerEvents="none" style={bodyBox(size)}>
      {[-24, 24].map((deg) => (
        <Animated.View
          key={deg}
          style={{
            position: 'absolute',
            width: w,
            height: 3,
            backgroundColor: WHITE,
            opacity: fade,
            transform: [{ rotate: `${deg}deg` }, { scaleX: snap }],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          width: w,
          height: w * 0.3,
          borderRadius: w,
          borderWidth: 2,
          borderColor: WHITE,
          opacity: waveFade,
          transform: [{ scale: wave }],
        }}
      />
    </View>
  );
}

/**
 * ── 솟구침 ── 발밑에서 가시가 올라왔다 내려간다.
 *
 * 19판 부패한 뿌리. 위에서 오는 것(`Rock`)과 짝을 이룬다 — 같은 "한 방"
 * 이지만 **어디서 오느냐**가 반대라 화면에서 안 헷갈린다.
 *
 * 올라오는 것은 빠르고(22%) 내려가는 것은 느리다. 반대로 하면 솟은 것이
 * 아니라 튕겨 나간 것으로 보인다.
 */
function GroundSpike({ size }: { size: number }) {
  const { t, on } = useRun(560);
  const rise = useMemo(() => t.interpolate({
    inputRange: [0, 0.22, 0.55, 1],
    outputRange: [size * 0.55, -size * 0.1, -size * 0.1, size * 0.6],
  }), [t, size]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0],
  }), [t]);

  if (!on) return null;
  const w = Math.round(size * 0.30);
  return (
    <View pointerEvents="none" style={bodyBox(size)}>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          alignItems: 'center',
          opacity: fade,
          transform: [{ translateY: rise }],
        }}
      >
        {/* 위가 뾰족한 삼각형 — 테두리 셋으로 만든다 */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: w / 2,
            borderRightWidth: w / 2,
            borderBottomWidth: size * 0.62,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: WHITE,
          }}
        />
      </Animated.View>
    </View>
  );
}

/**
 * 맞은 아군 **몸 위**에 얹는 연출 하나.
 *
 * 부르는 쪽에서 `key` 를 번호로 준다 — 그러면 맞을 때마다 새로 태워지고,
 * 여기서는 "번호가 올랐나" 를 볼 필요가 없다. 도는 중에 또 맞으면 앞엣것이
 * 끝까지 돌고 새것이 따로 돈다.
 */
export function BossBodyFx({ kind, size }: { kind: BodyKind; size: number }) {
  switch (kind) {
    case 'slashV': return <Slash size={size} deg={4} />;
    case 'slashD': return <Slash size={size} deg={38} />;
    case 'lance': return <Lance size={size} />;
    case 'coil': return <Coil size={size} />;
    case 'crush': return <Crush size={size} />;
    case 'spike': return <GroundSpike size={size} />;
    /* 넷은 받아 둔 시트를 그대로 튼다 (`SHEET`) */
    case 'spore':
    case 'rock':
    case 'thunder':
    case 'drip':
      return <Sheeted kind={kind} size={size} />;
    default: return null;
  }
}

/* ──────────────────────────── 우두머리 쪽 ──────────────────────────── */

/**
 * ── 휘두름 ── 우두머리 앞을 쓸고 지나가는 호.
 *
 * 5·16·19판. 셋 다 "때리는 것처럼 안 보인다" 는 말을 들은 놈들이다. 그림의
 * `attack` 칸은 자세만 바뀌므로, **무언가가 지나갔다**를 따로 그려야 한다.
 *
 * 고리의 **위쪽 테두리만** 남긴다 (`borderTopColor` 하나만 흰색). 원 하나를
 * 통째로 그리면 휘두른 것이 아니라 감싼 것이 된다.
 */
function Swing({ size }: { size: number }) {
  const { t, on } = useRun(340);
  const turn = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: ['-70deg', '55deg'],
  }), [t]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.12, 0.6, 1], outputRange: [0, 0.95, 0.7, 0],
  }), [t]);

  if (!on) return null;
  const w = size * 1.25;
  return (
    /* 아군 쪽(왼쪽)으로 반쯤 나가 있다 — 휘두르는 것은 몸 앞에서 일어난다 */
    <View pointerEvents="none" style={sideBox(size, -size * 0.45)}>
      <Animated.View
        style={{
          position: 'absolute',
          width: w,
          height: w,
          borderRadius: w,
          borderWidth: 3,
          borderTopColor: WHITE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          opacity: fade,
          transform: [{ rotate: turn }],
        }}
      />
    </View>
  );
}

/**
 * ── 파동 ── 고리 셋이 밖으로 퍼진다.
 *
 * 17판 공허한 울림. `SkillFx` 의 도발(`Roar`)과 같은 모양인데 **여기 것이
 * 더 크고 느리다** — 저건 한 사람이 지르는 소리고 이건 판 전체에 걸리는
 * 기술이라, 같은 크기면 아군 기술과 구분이 안 된다.
 */
function Ripple({ size }: { size: number }) {
  const { t, on } = useRun(760);
  const rings = useMemo(() => [0, 0.16, 0.32].map((d) => ({
    scale: t.interpolate({
      inputRange: [0, d, 1], outputRange: [0.25, 0.25, 3.4], extrapolate: 'clamp',
    }),
    fade: t.interpolate({
      inputRange: [0, d, Math.min(1, d + 0.1), Math.min(1, d + 0.6), 1],
      outputRange: [0, 0, 0.85, 0.12, 0],
      extrapolate: 'clamp',
    }),
  })), [t]);

  if (!on) return null;
  const w = size * 1.1;
  return (
    <View pointerEvents="none" style={sideBox(size)}>
      {rings.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: w,
            height: w * 0.42,
            borderRadius: w,
            borderWidth: 2,
            borderColor: WHITE,
            opacity: r.fade,
            transform: [{ scale: r.scale }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * ── 사방으로 ── 가시 열둘이 원을 그리며 뻗어 나갔다 사라진다.
 *
 * 5판 칼날 가시 난사와 18판 가시 가지 후려치기. 둘 다 전원기라 **어느 한
 * 사람 쪽으로 날아가면 거짓말**이 된다 — 사방이어야 "전부 맞는다" 가 된다.
 *
 * 가시마다 제 각도로 눕는다 (`rotate`). 안 눕히면 열둘이 다 같은 방향을 본
 * 채로 흩어져서, 퍼지는 것이 아니라 밀려나는 것으로 보인다.
 */
function Spikes({ size }: { size: number }) {
  const { t, on } = useRun(520);
  const spikes = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const far = size * 0.95;
    return {
      deg: (a * 180) / Math.PI + 90,
      x: t.interpolate({
        inputRange: [0, 1],
        outputRange: [Math.cos(a) * size * 0.1, Math.cos(a) * far],
      }),
      y: t.interpolate({
        inputRange: [0, 1],
        outputRange: [Math.sin(a) * size * 0.1, Math.sin(a) * far],
      }),
      o: t.interpolate({
        inputRange: [0, 0.1, 0.55, 1], outputRange: [0, 1, 0.6, 0],
      }),
    };
  }), [t, size]);

  if (!on) return null;
  return (
    <View pointerEvents="none" style={sideBox(size)}>
      {spikes.map((sp, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 3,
            height: Math.round(size * 0.22),
            backgroundColor: WHITE,
            opacity: sp.o,
            transform: [
              { translateX: sp.x }, { translateY: sp.y }, { rotate: `${sp.deg}deg` },
            ],
          }}
        />
      ))}
    </View>
  );
}

/**
 * ── 악취 ── 부패가 피어올랐다 스러진다.
 *
 * 15판 부패의 악취. 시트가 이 우두머리 하나를 위해 있다 (`bfx_miasma`) —
 * 다섯 칸이 한자리에서 피었다 진다.
 *
 * **다른 것보다 흐리다** (0.55). 나머지는 전부 "한 번에 일어나는 일" 이라
 * 진하게 켜지는데, 냄새는 진하게 켜지는 종류가 아니다. 흐릿하게 번지다
 * 사라지는 것이 곧 냄새다.
 *
 * 그리고 **길다** (1200ms). 다른 연출의 두 배다 — 스멀스멀이 짧으면
 * 스멀스멀이 아니다.
 */
function Stench({ size }: { size: number }) {
  const MS = 1200;
  const { t, on } = useRun(MS);
  const n = useFrames(5, MS);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.15, 0.6, 1], outputRange: [0, 0.55, 0.45, 0],
  }), [t]);
  /* 피어오르는 동안 조금씩 뜬다 — 멈춰 있으면 그림 다섯 장이 갈리는 것으로 보인다 */
  const rise = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0, -size * 0.3],
  }), [t, size]);

  if (!on) return null;
  return (
    <View pointerEvents="none" style={sideBox(size)}>
      <Animated.View
        style={{
          position: 'absolute',
          opacity: fade,
          transform: [{ translateY: rise }],
        }}
      >
        <Sprite set="bfx_miasma" name={String(n)} size={Math.round(size * 1.3)} />
      </Animated.View>
    </View>
  );
}

/** 우두머리 몸 자리에 얹는 연출 하나 (해일만은 무대 것이라 여기 없다) */
export function BossSideFx({ kind, size }: { kind: BossKind; size: number }) {
  switch (kind) {
    case 'swing': return <Swing size={size} />;
    case 'ripple': return <Ripple size={size} />;
    case 'spikes': return <Spikes size={size} />;
    case 'stench': return <Stench size={size} />;
    default: return null;
  }
}

/* ───────────────────────────── 무대 전체 ───────────────────────────── */

/** 해일이 무대를 건너는 데 걸리는 시간 (ms) */
export const TIDE_MS = 620;

/**
 * ── 해일 ── 무대를 오른쪽에서 왼쪽으로 **빠르게** 쓸고 지나간다.
 *
 * 10판. 화면을 덮는 연출은 이 게임에서 안 쓰기로 했는데(`BattleView` 의 붉은
 * 막 이야기), 해일은 그 규칙과 부딪히는 유일한 기술이다 — 휩쓰는 것이 곧
 * 내용이라 좁은 자리에서는 그릴 수가 없다.
 *
 * 셋으로 타협했다.
 *
 *   **아래 절반만** 쓴다 (무대 높이의 55%). 인물의 머리와 그 위의 숫자 ·
 *   말풍선은 안 가린다 — 가려지면 안 되는 것이 정확히 거기 있다.
 *
 *   **흐리다** (0.3). 뒤가 다 비쳐 보인다.
 *
 *   **빠르다** (620ms). 지나간 뒤에는 아무것도 안 남는다.
 *
 * 마루는 타원 셋을 겹쳐 만든다. 곧은 띠는 물이 아니라 벽으로 보인다.
 */
export function Tide({ w, h }: { w: number; h: number }) {
  const { t, on } = useRun(TIDE_MS);
  const sweep = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [w, -w * 1.15],
  }), [t, w]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.12, 0.75, 1], outputRange: [0, 0.3, 0.3, 0],
  }), [t]);

  if (!on) return null;
  const band = Math.round(h * 0.55);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: w,
        height: band,
        opacity: fade,
        transform: [{ translateX: sweep }],
        zIndex: 44,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: band * 0.32,
          backgroundColor: WHITE,
        }}
      />
      {/* 마루 — 타원 셋이 겹쳐 물결이 된다 */}
      {[0.12, 0.42, 0.72].map((at, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: w * at,
            top: 0,
            width: w * 0.34,
            height: band * 0.7,
            borderRadius: w,
            backgroundColor: WHITE,
          }}
        />
      ))}
    </Animated.View>
  );
}

/* ──────────────────────────── 날아가는 것 ──────────────────────────── */

/**
 * ── 우두머리가 날리는 것 ──
 *
 * 뒷줄 잡몹이 뱉는 것(`HitFx` 의 `FoeShot`)과 갈라 뒀다. 저건 **제 그림을
 * 작게 줄여** 날리는데, 우두머리가 그러면 우두머리가 하나 더 날아간다.
 *
 * 넷이 서로 다른 축을 쓴다.
 *
 *   bolt  곧게 간다        — 쏘는 것 (4·14·18판)
 *   lob   포물선을 그린다  — 던지는 것 (15판)
 *   bomb  가서 터진다      — 폭탄 (17판)
 *   blob  흔들리며 간다    — 액체 (3·8·10·12판)
 *
 * **닿는 순간이 곧 아픈 순간이다.** 부르는 쪽이 이 시간(`ms`)만큼 피해
 * 숫자를 미뤄 뒀다가 띄운다 (`BattleView`).
 */
/**
 * 날아가는 것도 받아 둔 시트를 쓴다.
 *
 * 가시(`bfx_thorn`)와 산성 덩이(`bfx_glob`) 둘뿐인데, 넷을 이 둘로 나눈다 —
 * **쏘는 것과 던지는 것.** 폭탄까지 따로 그림을 받을 만한 차이가 아니다
 * (덩이가 부풀며 터지는 것으로 충분하고, 그건 시트가 아니라 크기가 한다).
 */
export const SHOT_ART: Record<ShotKind, string> = {
  bolt: 'bfx_thorn',
  lob: 'bfx_glob',
  bomb: 'bfx_glob',
  blob: 'bfx_glob',
};

export function BossShot({
  kind, dist, ms, size,
}: { kind: ShotKind; dist: number; ms: number; size: number }) {
  const { t, on } = useRun(ms);
  /* 셋 다 3칸짜리다 — 온전함 · 갈라짐 · 부서짐. **경로가 아니라 수명**이다 */
  const n = useFrames(3, ms);

  const fly = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0, -dist],
  }), [t, dist]);
  /* 포물선 — 가운데서 제일 높다. 곧은 것은 0 이라 같은 식을 그대로 쓴다 */
  const arc = useMemo(() => t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: kind === 'lob' ? [0, -size * 0.85, 0] : [0, 0, 0],
  }), [t, kind, size]);
  /* 액체는 좌우로 흔들린다 — 곧게 가면 돌멩이다 */
  const wob = useMemo(() => t.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: kind === 'blob' ? [0, -4, 3, -3, 0] : [0, 0, 0, 0, 0],
  }), [t, kind]);
  /* 폭탄만 끝에서 부푼다 — 그게 터지는 것이다 */
  const grow = useMemo(() => t.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: kind === 'bomb' ? [0.9, 1, 2.4] : [0.9, 1, 1],
  }), [t, kind]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.1, kind === 'bomb' ? 0.86 : 0.92, 1],
    outputRange: [0, 1, 1, 0],
  }), [t, kind]);
  /* 던진 것은 돈다 — 쏜 것은 안 돈다 (촉이 앞을 봐야 한다) */
  const spin = useMemo(() => t.interpolate({
    inputRange: [0, 1],
    outputRange: kind === 'lob' ? ['0deg', '260deg'] : ['0deg', '0deg'],
  }), [t, kind]);

  if (!on) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        opacity: fade,
        transform: [
          { translateX: fly }, { translateY: arc }, { translateY: wob },
          { rotate: spin }, { scale: grow },
        ],
      }}
    >
      {/*
        **왼쪽으로 뒤집는다.** 적은 오른쪽에 서서 왼쪽으로 날리는데, 그림은
        오른쪽을 보고 그려졌다 (적 몸통과 같은 이유로 `scaleX: -1`).

        가시만 그렇다. 덩이는 좌우가 없다.
      */}
      <Sprite
        set={SHOT_ART[kind]}
        name={String(n)}
        size={size}
        style={kind === 'bolt' ? { transform: [{ scaleX: -1 }] } : undefined}
      />
    </Animated.View>
  );
}

/* ─────────────────────────── 뛰어들어 찍기 ─────────────────────────── */

/** 뛰어들었다 돌아오는 데 걸리는 시간 (ms) */
export const LEAP_MS = 760;

/**
 * ── 1판 뭉개기 ── 우두머리가 **아군 진영까지 뛰어가** 찍고 돌아온다.
 *
 * 예전에는 다른 열아홉과 똑같이 앞으로 34px 나왔다 들어갔다. 이름이 뭉개기고
 * 전원을 때리는 기술인데, 화면에서는 나머지 열아홉과 구분이 안 됐다.
 *
 * 넷으로 나뉜다.
 *
 *   0    → 0.22  솟는다      — 위로 뜨면서 아군 쪽으로 간다
 *   0.22 → 0.36  내리꽂는다  — **수직으로.** 여기가 닿는 순간이다 (`lead`)
 *   0.36 → 0.5   머문다      — 찍은 자세를 읽을 시간
 *   0.5  → 1     돌아온다    — 낮게, 천천히
 *
 * 아군의 도약 기술과 같은 얼개다 (`Fighter` 의 `leapX`/`leapY`) — 가로와
 * 세로를 **따로** 굴린다. 하나로 굴리면 반드시 포물선이 되는데, 내리꽂는
 * 동안에는 가로로 한 발짝도 안 움직여야 찍는 것으로 보인다.
 *
 * @param span 아군 진영까지의 거리 (px). 무대 폭에서 나온다
 */
export function useLeap(nonce: number, span: number): {
  x: Animated.AnimatedInterpolation<number>;
  y: Animated.AnimatedInterpolation<number>;
  s: Animated.AnimatedInterpolation<number>;
} {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (nonce <= 0) return undefined;
    t.setValue(0);
    const a = Animated.timing(t, {
      toValue: 1, duration: LEAP_MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start();
    /* 멈추면 제자리로 — 안 그러면 우두머리가 아군 진영에 굳는다 */
    return () => { a.stop(); t.setValue(0); };
  }, [nonce, t]);

  const x = useMemo(() => t.interpolate({
    inputRange: [0, 0.22, 0.36, 0.5, 1],
    outputRange: [0, -span, -span, -span, 0],
  }), [t, span]);
  const y = useMemo(() => t.interpolate({
    inputRange: [0, 0.22, 0.36, 0.5, 0.72, 1],
    outputRange: [0, -span * 0.42, 0, 0, -span * 0.18, 0],
  }), [t, span]);
  /* 뛰어오르면 커지고 내려앉으면 눌린다 — 무게가 실린다 */
  const s = useMemo(() => t.interpolate({
    inputRange: [0, 0.22, 0.36, 0.44, 0.5, 1],
    outputRange: [1, 1.14, 1.14, 0.88, 1, 1],
  }), [t]);

  return { x, y, s };
}
