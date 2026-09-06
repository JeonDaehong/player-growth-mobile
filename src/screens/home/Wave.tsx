/**
 * 퍼지는 고리 — 파동 · 충격파가 **함께 쓰는 곡선 한 벌.**
 *
 * ## 왜 모았나
 *
 * 밖으로 퍼지는 고리가 여섯 군데에 따로 적혀 있었다 — 도발(`SkillFx` 의
 * `Roar`) · 우두머리 파동(`BossFx` 의 `Ripple`) · 터짐(`Burst`) · 폭발의
 * 테(`Boom`) · 짓밟기의 발밑(`Stomp`) · 꿰뚫는 기운(`PierceAura`).
 *
 * 여섯이 조금씩 다른 숫자를 쓰고 있었는데, 정작 **다들 같은 이유로**
 * 어색했다. 한 군데를 고치면 나머지 다섯은 그대로 남으므로 곡선을 여기
 * 하나로 모은다. 자리와 색과 크기는 부르는 쪽이 그대로 정한다 — 여기서
 * 정하는 것은 **어떻게 나가고 어떻게 꺼지나** 둘뿐이다.
 *
 * ## 어색했던 이유 넷
 *
 * **1. 선이 나가면서 굵어졌다.** `transform: scale` 은 테두리도 같이
 * 늘린다. 2px 테두리를 3.4배로 키우면 화면에서는 7px 이다 — 실제 충격파는
 * 퍼질수록 **얇아진다.** 그래서 여기 고리들은 제일 커진 순간에 가장 굵고
 * 둔한 도넛이 되어 있었고, 그게 "과하다" 의 정체다.
 *
 * 배율을 native driver 로 돌리는 한 테두리 두께는 못 줄인다 (레이아웃 값이라
 * `useNativeDriver` 가 못 만진다). 그래서 두 가지로 푼다 — 시작 두께를
 * `WAVE_STROKE`(1px) 로 낮추고, **굵어지기 전에 꺼뜨린다** (`fade` 가
 * 수명의 절반쯤에서 거의 다 내려온다).
 *
 * **2. 일정한 속도로 나갔다.** `[0, 1] → [0.1, 2.6]` 은 등속이다. 공기가
 * 밀려 나가는 것은 **터지는 순간이 제일 빠르고 곧 느려진다.** 등속으로
 * 나가면 밀려 나가는 것이 아니라 원이 자라는 것으로 보인다.
 *
 * 여기서는 수명의 앞 4분의 1 에 갈 길의 **절반 넘게** 간다.
 *
 * **3. 너무 컸다.** 몸의 2.6~3.4배까지 벌어졌다. 잡몹 하나가 맞았는데
 * 고리가 옆줄까지 덮으면 누가 맞았는지가 사라진다.
 *
 * **4. 너무 밝고 오래 남았다.** 0.85~0.9 를 수명의 절반 넘게 유지했다.
 * 한 번에 셋이 겹쳐 도니 화면이 흰 고리로 찼다. 최고 밝기를 반쯤으로
 * 내리고, 다 퍼지기 전에 스러지게 한다.
 *
 * ## 고리는 둘이면 된다
 *
 * 여태 셋이었다. 셋을 시차를 두고 내보내면 "퍼진다" 가 아니라 "계속
 * 나온다" 가 된다 — 지나간 자리가 비지를 않는다. 앞선 것 하나와 뒤따르는
 * 메아리 하나면 퍼지는 것으로 읽히고, 화면이 훨씬 조용해진다.
 * (`WAVE_ECHO` 가 그 시차다.)
 */
import { Animated } from 'react-native';

/**
 * 고리 테두리 두께 (px).
 *
 * 2~3 이었다. 배율이 테두리도 같이 늘리므로 (머리말 1번) 다 퍼진 고리는
 * 이 값의 두세 배로 보인다 — 1 이 화면에서 2~3px 이고, 그게 원래 노리던
 * 두께다.
 *
 * 무대만 한 고리(`BossFx` 의 `Burst`)는 예외다. 저건 배율이 1.1 밖에 안
 * 올라가서 1px 이면 그냥 안 보인다.
 */
export const WAVE_STROKE = 1;

/** 뒤따르는 메아리가 얼마나 늦게 나가나 (수명 대비) */
export const WAVE_ECHO = 0.16;

/**
 * 고리 하나가 그리는 곡선.
 *
 * @param t     0 → 1 을 한 번 훑는 시계 (`useOnce` · `useRun` · `useSweep`)
 * @param delay 몇 시쯤에 나가나 (0~1). 메아리는 `WAVE_ECHO`
 * @param from  나갈 때의 배율
 * @param to    다 퍼졌을 때의 배율
 * @param peak  제일 밝을 때의 불투명도
 * @param life  이 고리가 사는 동안 (`t` 대비). 시계보다 짧아야 다음 것과
 *              안 겹친다
 */
export function waveRing(
  t: Animated.Value,
  {
    delay = 0, from, to, peak = 0.5, life = 0.6,
  }: { delay?: number; from: number; to: number; peak?: number; life?: number },
): { scale: Animated.AnimatedInterpolation<number>; fade: Animated.AnimatedInterpolation<number> } {
  /*
    `interpolate` 의 `inputRange` 는 **엄격히 커져야** 한다 — 같은 값이
    둘이면 그 자리에서 던진다. `delay` 가 0 이면 맨 앞의 0 과 겹치므로
    아주 작은 값으로 밀어 둔다.
  */
  const a = Math.max(0.001, Math.min(0.9, delay));
  const len = Math.max(0.05, Math.min(1 - a, life));
  /* 수명 안의 어느 지점(0~1)이 시계로는 몇 시인가 */
  const at = (r: number) => a + len * r;
  const span = to - from;

  return {
    /*
      ── 나가고 곧 느려진다 ──

      앞 25% 에 갈 길의 58%, 절반쯤에 82%. 뒤쪽은 거의 안 움직인다 —
      멎어 가는 그 구간이 "밀려 나간 공기가 잦아든다" 로 읽힌다.
    */
    scale: t.interpolate({
      inputRange: [0, a, at(0.25), at(0.5), at(1)],
      outputRange: [from, from, from + span * 0.58, from + span * 0.82, to],
      extrapolate: 'clamp',
    }),
    /*
      ── 켜지자마자 제일 밝고, 절반에서 거의 다 꺼진다 ──

      끝까지 밝게 끌고 가면 굵어진 테두리가 그대로 보인다 (머리말 1번).
      다 퍼진 고리는 **있는지 없는지 모를 만큼**만 남아야 한다.
    */
    fade: t.interpolate({
      inputRange: [0, a, at(0.08), at(0.42), at(1)],
      outputRange: [0, 0, peak, peak * 0.2, 0],
      extrapolate: 'clamp',
    }),
  };
}

/**
 * 앞선 고리 하나 + 메아리 하나.
 *
 * 부르는 쪽은 이 둘을 그대로 `map` 해서 그린다. 셋을 쓰던 자리를 이걸로
 * 갈면 숫자가 한 벌로 정리된다.
 */
export function wavePair(
  t: Animated.Value,
  opts: { from: number; to: number; peak?: number; life?: number },
) {
  return [
    waveRing(t, { ...opts, delay: 0 }),
    /* 메아리는 조금 덜 가고 훨씬 옅다 — 앞선 것을 따라가는 잔물결이다 */
    waveRing(t, {
      ...opts,
      delay: WAVE_ECHO,
      to: opts.from + (opts.to - opts.from) * 0.78,
      peak: (opts.peak ?? 0.5) * 0.55,
    }),
  ];
}
