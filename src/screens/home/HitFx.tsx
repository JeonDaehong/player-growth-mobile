/**
 * 타격 이펙트 — 때릴 때 적 위에서 터지는 것.
 *
 * ## 왜 캐릭터마다 그림을 따로 안 그리나
 *
 * 열두 명에게 각자 화려한 공격 애니메이션을 그려 주면 12 × 16프레임 = 192칸이다.
 * 새 캐릭터를 넣을 때마다 열여섯 칸이 또 필요하고, 한 칸이 잘못 나오면 그 캐릭터
 * 시트를 통째로 다시 뽑아야 한다.
 *
 * 그래서 **몸과 이펙트를 나눈다.** 캐릭터는 짧은 공격 동작만 갖고, 화려함은
 * 공용 이펙트 한 벌에서 온다 (`core/chars` 의 `HitFx`). 격투 게임이 타격
 * 스파크를 캐릭터 전원이 공유하는 것과 같은 방식이다.
 *
 * 개성은 세 가지로 낸다 — **어떤 이펙트를, 어느 각도로, 얼마나 크게.**
 *
 * ## 아직 그림이 안 들어왔다
 *
 * `docs/ASSET_PROMPTS.md` 의 §F1 이 여덟 종 × 5프레임 시트다. 그때까지는
 * 기존 `fx/` (burst·shatter·smoke·glow) 로 버틴다 — 여덟 종을 넷에 겹쳐
 * 매핑해 두었으므로, 새 시트가 들어오면 `SET` 한 줄만 바꾸면 된다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import type { HitFx } from '@/core/chars';
import type { Mark } from '@/core/passives';
import { Sprite } from '@/ui/Sprite';
import { BAD_C, BLACK, GOOD_C, MONO, WHITE } from '@/ui/theme';

/** 이펙트 한 판의 길이 */
export const FX_MS = 260;
/** 프레임 수 — 지금 `fx/` 가 5장짜리다 */
const FRAMES = 5;

/**
 * 이펙트 종류 → 지금 쓸 수 있는 스프라이트.
 *
 * 여덟을 넷에 겹쳐 둔 임시 매핑이다. §F1 시트가 들어오면 여기를
 * `{ set: 'hitfx', name: kind }` 한 줄로 바꾼다.
 */
/**
 * 맞은 쪽에서 터지는 것.
 *
 * 공격 종류(`HitFx`)와 **따로 있다.** 저건 "누가 어떻게 때렸나" 라 사람마다
 * 다르지만, 이건 "맞았다" 라서 아군이든 몬스터든 같아야 한다.
 */
export type HurtFx = 'hurt';

const SET: Record<HitFx | HurtFx, { set: string; name: string; spin: number; scale: number }> = {
  slash: { set: 'fx', name: 'shatter', spin: -25, scale: 1.0 },
  cross: { set: 'fx', name: 'shatter', spin: 40, scale: 0.9 },
  thrust: { set: 'fx', name: 'burst', spin: 0, scale: 0.8 },
  /*
    내려찍기 — `glow` 였다가 바꿨다. 그건 스킬 발동 고리(`SkillAura`)와
    같은 둥근 빛이라 "때렸다" 가 아니라 "뭘 쓴다" 로 읽혔다.
    깨진 조각이 사방으로 튀는 `shatter` 라야 도끼가 박힌 것으로 보인다.
  */
  smash: { set: 'fx', name: 'shatter', spin: 0, scale: 1.45 },
  arcane: { set: 'fx', name: 'glow', spin: 15, scale: 1.0 },
  star: { set: 'fx', name: 'burst', spin: -15, scale: 1.05 },
  holy: { set: 'fx', name: 'burst', spin: 0, scale: 1.2 },
  chaos: { set: 'fx', name: 'smoke', spin: 30, scale: 1.0 },
  /*
    맞았을 때. 몬스터가 맞을 때 터지는 것과 **같은 그림**이다.

    전에는 아군만 `smash`(= `fx/glow`) 를 썼는데, 그건 스킬 발동 고리
    (`SkillAura`) 와 같은 그림이라 "맞았다" 가 아니라 "제가 뭘 쓴다" 로
    읽혔다. 튀는 스파크여야 맞은 것으로 보인다.
  */
  hurt: { set: 'fx', name: 'burst', spin: 0, scale: 1.15 },
};

/**
 * 한 번 터지고 사라지는 이펙트.
 *
 * `nonce` 가 바뀔 때마다 처음부터 다시 돈다. 부모가 이 컴포넌트를 지웠다
 * 다시 만들면 깜빡임이 생기므로, **살려 둔 채 값만 바꾼다.**
 */
export function HitBurst({
  kind, size, nonce,
}: { kind: HitFx | HurtFx; size: number; nonce: number }) {
  const cfg = SET[kind];
  const t = useRef(new Animated.Value(0)).current;
  /* 프레임 번호는 state 로 두면 5칸마다 리렌더가 돈다 — ref 로 들고 강제 갱신만 한다 */
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  /*
    0 이면 아무것도 안 그린다.

    1 로 두면 `nonce` 가 아직 0 인 곳 — 맞기 전의 파티원 — 에서 첫 칸이
    가만히 박혀 있다. 시작은 비워 두고, `nonce` 가 바뀔 때 1 부터 돈다.
  */
  const frame = useRef(0);

  useEffect(() => {
    if (nonce <= 0) return;
    frame.current = 1;
    force();
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1, duration: FX_MS, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
    const step = setInterval(() => {
      frame.current = Math.min(FRAMES, frame.current + 1);
      force();
    }, FX_MS / FRAMES);
    const end = setTimeout(() => { frame.current = 0; force(); }, FX_MS);
    return () => { clearInterval(step); clearTimeout(end); };
  }, [nonce, t]);

  /*
    ── 움직임은 **한 번만** 만든다 ──

    `interpolate` 는 부를 때마다 값에 가지를 하나 단다. 이 컴포넌트의 `t` 는
    **캐릭터가 화면에 서 있는 내내 살아 있다** — 피격 불꽃은 `Fighter` 안에
    붙박이로 들어 있고, 안 터질 때만 `null` 을 돌려줄 뿐 컴포넌트 자체는 안
    사라진다.

    그래서 렌더할 때마다 가지가 쌓였다. 한 번 터질 때 대여섯 번 렌더되고
    (프레임 넘기는 타이머 + 부모 갱신), 파티 넷이 계속 맞으므로 초당 열댓
    개씩 늘어난다. 값이 바뀔 때마다 애니메이션이 그 가지를 전부 훑으므로,
    **켜 둔 시간에 비례해서 느려진다.** 십 분이면 수천 개다.

    화면이 오래 켜져 있을수록 버벅이던 것이 이것이다.
  */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.65, 1], outputRange: [1, 0.9, 0],
  }), [t]);
  const grow = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0.65 * cfg.scale, 1.35 * cfg.scale],
  }), [t, cfg.scale]);

  if (!frame.current) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        opacity: fade,
        transform: [
          { rotate: `${cfg.spin}deg` },
          { scale: grow },
        ],
      }}
    >
      <Sprite set={cfg.set} name={`${cfg.name}_${frame.current}`} size={size} />
    </Animated.View>
  );
}

/** 적이 날린 것이 아군에게 닿기까지 (ms) */
export const FOE_SHOT_MS = 420;

/**
 * 적이 날린 것이 그 거리를 가는 데 걸리는 시간 (ms).
 *
 * 아군 쪽도 같은 이유로 속도를 고정한다 (`SwordWave` 의 `flyMsOf`). 적이
 * 자리별 확률로 고르게 된 뒤로는(`core/autoBattle` 의 `AIM`) 맨 앞을 맞힐
 * 때와 맨 뒤를 맞힐 때의 거리가 배 가까이 차이 난다 — 시간을 붙박아 두면
 * 뒤엣사람을 노린 것만 눈에 띄게 빨라진다.
 *
 * 위쪽 상한은 `FOE_SHOT_MS` 다. 치우는 타이머가 그 값을 쓰므로
 * (`BattleView`), 그보다 오래 날면 다 가기 전에 치워진다.
 */
export function shotMsOf(dist: number): number {
  /* 아군 쪽과 같은 속도다 (`SwordWave` 의 `WAVE_SPEED`) — 한쪽만 느리면 안 된다 */
  return Math.round(Math.min(FOE_SHOT_MS, Math.max(90, Math.abs(dist) / 1.24)));
}

/**
 * 원거리 적이 날리는 것.
 *
 * 뒷줄의 뱉는 슬라임은 제자리에서 뱉는 동작만 하고 아무것도 안 날아갔다.
 * 그러면 화면에서 **뭘 하는지 알 수 없다** — 앞줄이 때리는 사이에 뒤에서
 * 혼자 꿈틀거리는 것으로 보인다. 날아가는 것이 있어야 "저놈도 때리고
 * 있구나" 가 읽힌다.
 *
 * 아군의 검기·화살(`SwordWave`)과 같은 구조인데 **방향이 반대**다. 적은
 * 오른쪽에 서므로 왼쪽으로 간다.
 *
 * 그림은 `<적 세트>_shot` 을 쓰고, 아직 없으면 `fx/smoke_1` 로 떨어진다 —
 * 시트가 들어오는 순간 코드를 안 고치고 바뀐다.
 */
export function FoeShot({
  art, size, dist,
}: { art: string; size: number; dist: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(true);

  useEffect(() => {
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1,
      duration: shotMsOf(dist),
      /*
        **등속으로 간다.**

        예전에는 `Easing.out(quad)` 이라 뱉는 순간이 제일 빠르고 갈수록
        느려졌다. 끝점이 아무 데도 아니었을 때는 그게 "힘이 빠진다" 로
        읽혔지만, 지금은 끝점이 맞을 사람이 선 자리다 — 거기서 느려지면
        **닿기 직전에 멎어 미끄러져 들어가는 것**으로 보인다.
      */
      easing: Easing.linear,
      useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [t, dist]);

  /* 한 번만 만든다 — 렌더마다 부르면 값에 가지가 쌓인다 (`HitBurst` 참고) */
  const flyX = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0, -dist],
  }), [t, dist]);
  const flyY = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0, size * 0.22],
  }), [t, size]);
  const shrink = useMemo(() => t.interpolate({
    inputRange: [0, 0.8, 1], outputRange: [0.8, 1, 0.7],
  }), [t]);
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0],
  }), [t]);

  if (!on) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        transform: [
          /* 왼쪽으로 — 아군은 왼쪽에 있다 */
          { translateX: flyX },
          /* 살짝 아래로 떨어지며 간다 */
          { translateY: flyY },
          { scale: shrink },
        ],
        opacity: fade,
      }}
    >
      <Sprite
        set={`${art}_shot`}
        name="shot_1"
        size={size * 0.5}
        fallbackSet="fx"
        fallbackName="smoke_1"
        flip
      />
    </Animated.View>
  );
}

/** 우두머리 이름이 떴다 사라지기까지 (ms) */
const CALL_MS = 2200;

/**
 * 우두머리 등장 — 무대 한가운데에 이름이 떴다 사라진다.
 *
 * 2분을 싸우다 갑자기 큰 놈이 걸어 들어오는데, 화면에는 그냥 적이 하나로
 * 줄어든 것처럼 보인다. 잡몹이 다 정리되고 나서야 나오므로 **아무 일도 안
 * 일어난 순간**이 잠깐 생기고, 그 사이에 판이 바뀌었다는 걸 알려 줄 것이
 * 없다.
 *
 * 글씨는 뜨는 동안 무대를 가리므로 오래 두면 안 된다. 흐리게 들어와서
 * 잠깐 머물고 흐리게 나간다 — 2.2초면 읽고도 남는다.
 */
export function BossCall({
  nonce, name, title,
}: {
  nonce: number;
  name: string;
  /** 이름 위에 작게 붙는 수식어 (`FoeKind.title`). 없으면 이름만 뜬다 */
  title?: string;
}) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (nonce <= 0) return;
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: CALL_MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [nonce, t]);

  /* 흐리게 들어와서 머물고 흐리게 나간다 */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.16, 0.72, 1], outputRange: [0, 1, 1, 0],
  }), [t]);
  /* 살짝 다가오면서 나타난다 — 제자리에서 켜지면 자막처럼 보인다 */
  const zoom = useMemo(() => t.interpolate({
    inputRange: [0, 0.16, 1], outputRange: [1.35, 1, 1.06],
  }), [t]);

  if (!on) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '32%',
        zIndex: 90,
        alignItems: 'center',
        opacity: fade,
        transform: [{ scale: zoom }],
      }}
    >
      <Animated.Text
        style={{
          color: WHITE, fontFamily: MONO, fontSize: 9, letterSpacing: 3,
        }}
      >
        {title || '우 두 머 리'}
      </Animated.Text>
      <Animated.Text
        style={{
          color: WHITE, fontFamily: MONO, fontSize: 17, fontWeight: '700',
          marginTop: 2,
        }}
      >
        {name}
      </Animated.Text>
    </Animated.View>
  );
}

/** 특수기 이름이 떴다 사라지기까지 (ms) */
const PAT_MS = 950;

/**
 * 우두머리 특수기 이름 — 무대 위쪽에 짧게.
 *
 * `BossCall` 과 자리도 방식도 닮았지만 **훨씬 짧고 작다.** 등장은 판에 한 번
 * 뿐이라 2.2초를 써도 되지만, 특수기는 세 번에 한 번씩 나오므로 그만큼
 * 머무르면 화면이 글씨로 덮인다.
 *
 * 무대 **위쪽**에 둔다. `BossCall` 이 쓰는 34% 자리에 겹쳐 두면 우두머리가
 * 나오는 순간 둘이 포개진다.
 */
export function PatternCall({ nonce, name }: { nonce: number; name: string }) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (nonce <= 0 || !name) return undefined;
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: PAT_MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [nonce, name, t]);

  /*
    `interpolate()` 는 부를 때마다 `t` 에 자식 노드를 매단다. `t` 는 이
    컴포넌트가 살아 있는 내내 같은 값이라, 그리기마다 부르면 노드가 쌓여
    시간에 비례해 느려진다 (`HitBurst` 에서 겪은 그것).
  */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.18, 0.62, 1], outputRange: [0, 1, 1, 0],
  }), [t]);
  /* 위로 살짝 밀려 올라간다 — 제자리에서 켜지면 자막처럼 보인다 */
  const rise = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [6, -4],
  }), [t]);

  if (!on) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0, right: 0, top: 8,
        alignItems: 'center',
        zIndex: 92,
        opacity: fade,
        transform: [{ translateY: rise }],
      }}
    >
      <Animated.Text
        style={{
          color: WHITE, fontFamily: MONO, fontSize: 12, fontWeight: '700',
          letterSpacing: 2,
        }}
      >
        {name}
      </Animated.Text>
    </Animated.View>
  );
}

/** 말풍선이 떴다 사라지기까지 (ms) */
const SHOUT_MS = 900;

/**
 * 기술 이름 — **쓴 사람 머리 위 말풍선.**
 *
 * ## 왜 무대 가운데가 아닌가
 *
 * `PatternCall` 과 하는 일은 같은데 자리가 다르다. 저건 **우두머리 하나**가
 * 쓰는 것이라 무대 위쪽 한가운데에 걸어도 누가 쓴 건지 헷갈릴 일이 없다.
 *
 * 이건 넷이 **각자 제 박자로** 쓴다 (`SkillDef.every` 가 4 와 5 라 주기가
 * 어긋난다). 가운데에 걸면 두셋이 같은 순간에 겹쳐 뜨고, 그러면 이름은
 * 보이는데 **누가 썼는지가 사라진다.** 말풍선은 꼬리가 주인을 가리키므로
 * 넷이 동시에 외쳐도 각자의 것으로 읽힌다.
 *
 * ## 흰 바탕에 검은 글씨
 *
 * 화면에서 유일하게 **반전된** 덩어리다. 무대는 검은 바탕에 흰 선뿐이라
 * (`ui/theme`), 흰 글씨를 그냥 얹으면 인물·이펙트·피해 숫자와 색도 굵기도
 * 같아서 섞여 버린다. 통째로 뒤집으면 40px 짜리 인물 위에서도 한눈에
 * 떨어져 나온다 — 만화 말풍선이 원래 흰 이유다.
 *
 * 모서리는 안 둥글린다 (`ui/theme` 의 `BORDER`). 꼬리도 삼각형이 아니라
 * **계단 세 칸**이다 — 도트 화면에서 매끈한 빗변은 그 자리만 해상도가 다른
 * 것처럼 보인다.
 *
 * ## 길이
 *
 * 0.9초다. 기술 동작 자체가 0.5초 남짓이고(`SK_MS`), 제일 빠른 사람은 네
 * 번에 한 번씩 쓴다. 이보다 길게 두면 다음 것이 뜨기 전에 안 사라져서
 * 말풍선이 상시 켜져 있는 것이 된다.
 */
/**
 * 말풍선 가장자리의 **뾰족한 것들**.
 *
 * 우두머리 기술은 파티 기술보다 세다는 것이 한눈에 보여야 해서, 같은 말풍선을
 * 만화의 **폭발형**으로 바꾼다. 도형을 그릴 수단이 사각형뿐이라(SVG 를 안
 * 쓴다) 작은 사각을 45도로 돌려 반쯤 상자 뒤로 숨긴다 — 밖으로 나온 절반이
 * 삼각형이 된다.
 *
 * 상자보다 **먼저** 그린다. 나중에 그린 것이 위에 오므로, 상자가 안쪽 절반을
 * 덮어 준다.
 */
function Spikes({ side, n }: { side: 'top' | 'bottom' | 'left' | 'right'; n: number }) {
  const across = side === 'top' || side === 'bottom';
  return (
    <View
      style={{
        position: 'absolute',
        ...(across
          ? { left: 2, right: 2, [side]: -4, flexDirection: 'row' }
          : { top: 1, bottom: 1, [side]: -4, flexDirection: 'column' }),
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {Array.from({ length: n }, (_v, i) => (
        <View
          key={i}
          style={{
            width: 8, height: 8, backgroundColor: WHITE,
            transform: [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

export function SkillShout({
  nonce, name, burst = false,
}: {
  nonce: number;
  name: string;
  /**
   * 폭발형인가 — 우두머리 기술에만 쓴다.
   *
   * 파티 기술과 **같은 자리에 같은 크기로** 뜨는데 세기가 다르다. 크기로
   * 가르면 우두머리 것이 화면을 덮고, 색으로는 못 가른다 (흑백 2색).
   * 가장자리 모양으로 가르는 것이 제일 싸다.
   */
  burst?: boolean;
}) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (nonce <= 0 || !name) return undefined;
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: SHOUT_MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [nonce, name, t]);

  /*
    `interpolate()` 는 부를 때마다 `t` 에 자식 노드를 매단다 — 그리기마다
    부르면 노드가 쌓여 시간에 비례해 느려진다 (`PatternCall` 과 같은 이유).
  */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0],
  }), [t]);
  /* 작게 시작해 한 번 넘겼다 제자리로 — "툭 튀어나온다" 가 곧 외치는 것이다 */
  const pop = useMemo(() => t.interpolate({
    inputRange: [0, 0.09, 0.2, 1], outputRange: [0.55, 1.18, 1, 1],
  }), [t]);
  /* 뜬 뒤로는 천천히 떠오른다 — 제자리에 붙어 있으면 라벨로 보인다 */
  const rise = useMemo(() => t.interpolate({
    inputRange: [0, 0.2, 1], outputRange: [3, 0, -6],
  }), [t]);

  if (!on) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        alignItems: 'center',
        opacity: fade,
        transform: [{ translateY: rise }, { scale: pop }],
      }}
    >
      <View>
        {/* 뾰족한 것들이 먼저 — 상자가 안쪽 절반을 덮는다 */}
        {burst && (
          <>
            <Spikes side="top" n={5} />
            <Spikes side="bottom" n={5} />
            <Spikes side="left" n={2} />
            <Spikes side="right" n={2} />
          </>
        )}
        <View style={{ backgroundColor: WHITE, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text
            numberOfLines={1}
            style={{
              color: BLACK, fontFamily: MONO, fontSize: 10, fontWeight: '700',
              includeFontPadding: false,
            }}
          >
            {name}!
          </Text>
        </View>
      </View>
      {/* 꼬리 — 아래로 좁아지는 계단 세 칸. 이게 주인을 가리킨다 */}
      <View style={{ width: 6, height: 2, backgroundColor: WHITE }} />
      <View style={{ width: 4, height: 2, backgroundColor: WHITE }} />
      <View style={{ width: 2, height: 2, backgroundColor: WHITE }} />
    </Animated.View>
  );
}

/** 회복 표시의 색 — 흑백 화면에서 유일하게 색을 쓰는 자리 */
const HEAL_GREEN = '#7CFF9B';

/** 회복 표시가 다 내려오기까지 (ms) */
const HEAL_MS = 760;

/** 몇 개가 내려오나 */
const HEAL_MARKS = 3;

/**
 * 회복을 받은 사람에게서 **떠오르는 `+` 표시들**.
 *
 * 처음엔 사제의 `<id>_wave` 그림을 한 장 내려보냈다. 그런데 그건 터지는
 * 덩어리라 **맞은 것처럼** 보였다 — 회복인지 피해인지가 그림으로 안 갈렸다.
 * `+` 는 뜻이 하나뿐이라 헷갈릴 자리가 없다.
 *
 * 하나가 아니라 **여럿이 시차를 두고** 올라온다. 하나면 피해 숫자와 똑같은
 * 움직임이라 또 헷갈리고, 여럿이 흩어져 떠오르면 "차오른다" 가 된다.
 *
 * `nonce` 가 0 이면 아무것도 안 그린다 — 아직 한 번도 안 받은 사람이다.
 */
export function HealMarks({ nonce, size }: { nonce: number; size: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (nonce <= 0) return;
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1, duration: HEAL_MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [nonce, t]);

  /*
    표시 하나하나의 움직임.

    애니메이션은 **하나만** 돌리고, 시차는 각자의 입력 구간을 밀어서 낸다.
    셋을 따로 돌리면 값도 셋이고 타이머도 셋이다.
  */
  const marks = useMemo(() => Array.from({ length: HEAL_MARKS }, (_v, i) => {
    const from = i * 0.18;              // 시차
    const till = from + 0.55;           // 내려오는 데 쓰는 구간
    return {
      key: i,
      /* 가운데를 두고 좌우로 흩는다 */
      left: size * (0.16 + i * 0.22),
      /* 발밑에서 머리 위로 — 피해 숫자와 같은 방향이지만 뜻이 반대라 안 헷갈린다 */
      translateY: t.interpolate({
        inputRange: [from, till],
        outputRange: [size * 0.1, -size * 0.95],
        extrapolate: 'clamp',
      }),
      opacity: t.interpolate({
        inputRange: [from, from + 0.1, till - 0.12, till],
        outputRange: [0, 1, 1, 0],
        extrapolate: 'clamp',
      }),
      /* 가운데 것이 제일 크다 — 셋이 나란하면 눈금처럼 보인다 */
      size: i === 1 ? 15 : 11,
    };
  }), [t, size]);

  if (!on) return null;

  return (
    <>
      {marks.map((m) => (
        <Animated.Text
          key={m.key}
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: m.left,
            zIndex: 37,
            /*
              **회복만 색이 있다.**

              이 게임은 흑백이라 색이 곧 강조다. 그래서 색을 쓰는 자리를 하나만
              둔다 — 체력이 차는 순간. 피해 숫자와 방향(위로)이 같아도 색이
              다르면 안 헷갈린다.
            */
            color: HEAL_GREEN,
            fontFamily: MONO,
            fontSize: m.size,
            fontWeight: '700',
            opacity: m.opacity,
            transform: [{ translateY: m.translateY }],
          }}
        >
          +
        </Animated.Text>
      ))}
    </>
  );
}

/**
 * 화살이 하늘에서 떨어져 꽂히기까지 (ms).
 *
 * 200 에서 절반으로 줄였다. 떨어지는 거리가 몸 두 개 남짓(≈120px)이라
 * 200ms 면 0.6px/ms 인데, 그건 화살이 아니라 **떨어지는 나뭇잎** 속도다.
 * 옆으로 나가는 것(`SwordWave` 의 `WAVE_SPEED`)과 같은 속도로 맞춘다 —
 * 같은 화살이 방향에 따라 다른 속도로 날면 안 된다.
 */
export const DROP_MS = 100;

/** 꽂힌 채로 남아 있는 시간 (ms) — 이게 있어야 '박혔다' 로 보인다 */
const STICK_MS = 160;

/** 떨어지는 각도 — 왼쪽 위에서 오른쪽 아래로 */
const DROP_DEG = 60;

/*
  ── 촉이 상자 안 어디에 오나 ──

  `Sprite` 는 **정사각 상자**에 `contain` 으로 그린다. 화살 그림은 192x24 라
  상자 안에서 가로로 누워 세로 한가운데를 지난다 — 촉은 오른쪽 끝, 즉 상자
  기준 (1.0, 0.5) 이다.

  이걸 60° 돌리면 촉이 상자 **왼쪽 위가 아니라 오른쪽 아래**로 간다. 중심에서
  촉까지가 (0.5, 0) 이고, 돌리면 (0.5·cos60, 0.5·sin60) = (0.25, 0.433) 이므로
  상자 좌상단 기준으로 (0.75, 0.933) 이다.

  **상자 좌상단을 적 몸에 맞춰 놓고 있었다.** 그러면 촉은 거기서 몸 하나만큼
  더 내려간 곳에 꽂힌다 — 재 보니 발밑으로 몸의 19% 아래, 그러니까 땅이었다.
  화살이 적을 뚫고 바닥까지 이어져 보이던 게 이것이다.

  그래서 여기서 **촉을 원점으로** 끌어올린다. 부르는 쪽은 꽂힐 자리만 잡으면
  되고, 각도가 바뀌어도 이 파일만 고치면 된다.
*/
const TIP_X = 0.5 + 0.5 * Math.cos((DROP_DEG * Math.PI) / 180);
const TIP_Y = 0.5 + 0.5 * Math.sin((DROP_DEG * Math.PI) / 180);

/**
 * 떨어지는 화살 한 대.
 *
 * 화살비(`SKILLS.rain`)는 하늘로 쐈다가 딴 데 떨어진다. 올라가는 쪽은 캐릭터
 * 그림 안에 있고(§E-1), **떨어지는 쪽이 여기다** — 맞는 적 위에서 그린다.
 *
 * 그림은 평타로 쏘는 화살과 **같은 시트**를 쓴다 (`projSet`). 화살은 어느
 * 쪽으로 날든 같은 물건이고, 두 벌을 받으면 같은 사람이 쏘는 것으로 안 보인다.
 * 옆으로 날아가게 그려진 것을 여기서 **기울여** 떨어뜨린다.
 */
export function FallingArrow({
  set, name, size,
}: { set: string; name: string; size: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(true);

  useEffect(() => {
    /*
      떨어지고, **꽂힌 채로 잠깐 서 있다가**, 사라진다.

      예전에는 떨어지는 내내 서서히 흐려지다 도착과 함께 없어졌다. 그러면
      땅에 닿기도 전에 반쯤 지워져서, 꽂힌 게 아니라 도중에 증발한 것으로
      보였다. 끝까지 또렷하게 내려와서 멈춰야 "박혔다" 가 된다.
    */
    let alive = true;
    const a = Animated.sequence([
      Animated.timing(t, {
        toValue: 1,
        duration: DROP_MS,
        /* 떨어질수록 빨라진다 — 꽂히는 순간이 제일 빨라야 한다 */
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(STICK_MS),
    ]);
    /* 다 떨어지기 전에 화면에서 빠질 수 있다 — 그때 없는 것을 건드리지 않게 */
    a.start(() => { if (alive) setOn(false); });
    return () => { alive = false; a.stop(); };
  }, [t]);

  /* 한 번만 만든다 (`HitBurst` 참고) */
  const dropX = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [-size * 1.1, 0],
  }), [t, size]);
  const dropY = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [-size * 2.2, 0],
  }), [t, size]);

  if (!on) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        /* **촉을 원점으로 끌어올린다** — 부르는 쪽이 잡은 자리에 촉이 꽂힌다 */
        left: -size * TIP_X,
        top: -size * TIP_Y,
        transform: [
          /* **왼쪽 위에서 오른쪽 아래로.** 아군이 왼쪽에서 쐈으니 그쪽에서 온다 */
          { translateX: dropX },
          { translateY: dropY },
          /*
            시트는 오른쪽을 보고 누워 있다. 오른쪽 아래로 향하려면 시계 방향
            으로 60도 — 내려오는 방향과 촉이 같은 곳을 봐야 꽂힌 것으로 보인다.
          */
          { rotate: `${DROP_DEG}deg` },
        ],
        /* 도착할 때까지 또렷하다. 꽂힌 뒤에만 사라진다 */
        opacity: 1,
      }}
    >
      <Sprite set={set} name={name} size={size} />
    </Animated.View>
  );
}

/**
 * 떠오르는 피해 숫자 하나.
 *
 * 메이플식으로 **툭 튀어 올랐다가** 천천히 떠오르며 사라진다. 시작하자마자
 * 1.4배로 커졌다 제 크기로 돌아오는 게 "맞았다" 를 만드는 부분이다 —
 * 그냥 위로 흐르기만 하면 숫자가 지나가는 자막처럼 보인다.
 *
 * 자리는 부르는 쪽(`BattleView`)이 잡는다. 여기서는 뜨는 동작만 한다.
 */
export function DamageNumber({
  text, dx, dy, big, good, bad, onDone,
}: {
  text: string;
  dx: number;
  dy: number;
  big?: boolean;
  /**
   * 회복인가 — **초록으로** 뜬다 (`ui/theme` 의 `GOOD_C`).
   *
   * 우두머리가 스스로 채울 때 쓴다. 흰 숫자로 뜨면 피해와 구분이 안 돼서,
   * 화면에서는 "왜 때렸는데 체력이 오르지" 가 된다 — 실제로 20판에서
   * 15초마다 그런 순간이 있었고 아무도 그게 회복인 줄 몰랐다.
   */
  good?: boolean;
  /**
   * **아군이** 깎인 숫자인가 — 붉게 뜬다 (`ui/theme` 의 `BAD_C`).
   *
   * 아군과 적의 피해 숫자가 둘 다 흰색이었다. 한 화면에서 여섯 개가 동시에
   * 뜨는 일이 흔한데 전부 같은 흰 숫자라, **어느 쪽이 맞은 건지**를 숫자가
   * 뜬 자리로만 짐작해야 했다. 색으로 가르면 안 헷갈린다.
   *
   * `good` 과 같이 오면 회복이 이긴다 — 초록이 붉은 것보다 드물고, 드문
   * 쪽을 살려야 정보가 남는다.
   */
  bad?: boolean;
  onDone: () => void;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.timing(t, {
      toValue: 1, duration: 720, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    a.start(onDone);
    /* 숫자가 다 뜨기 전에 화면에서 빠질 수 있다 */
    return () => a.stop();
  }, [t, onDone]);

  /* 한 번만 만든다 (`HitBurst` 참고) */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.55, 1], outputRange: [1, 1, 0],
  }), [t]);
  const rise = useMemo(() => t.interpolate({
    inputRange: [0, 0.2, 1], outputRange: [0, -9, -20],
  }), [t]);
  const pop = useMemo(() => t.interpolate({
    inputRange: [0, 0.15, 0.35, 1], outputRange: [0.6, 1.4, 1, 1],
  }), [t]);

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: dx,
        top: dy,
        color: good ? GOOD_C : (bad ? BAD_C : WHITE),
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: big ? 20 : 15,
        /*
          ── 검은 그림자를 지고 다닌다 ──

          흰 숫자가 **흰 그림 위에** 놓이는 일이 생겼다. 우두머리는 몸이
          커서 머리 위에 두 줄밖에 안 들어가고, 넘치는 줄은 제 몸 위로
          내려 쌓기 때문이다 (`BattleView` 의 `numTop`).

          그림자가 없으면 그 줄들은 흰 데 흰 것이라 통째로 안 보인다.
          배경이 밝은 판에서도 같은 일이 있었다.
        */
        textShadowColor: BLACK,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        opacity: fade,
        transform: [
          /* 처음 20% 에서 확 튀어 오르고, 나머지는 천천히 떠오른다 */
          {
            /*
              **조금만 떠오른다.**

              38px 까지 올라갔었다. 캐릭터가 54px 이니 머리 한참 위, 거의 몸
              하나만큼 떨어진 자리에서 대부분의 시간을 보냈다 — 누가 맞았는지
              가 안 읽힌다. 20px 이면 머리 위에서 뜨는 것으로 보이면서도
              숫자끼리 겹치지 않는다.
            */
            translateY: rise,
          },
          { scale: pop },
        ],
      }}
    >
      {text}
    </Animated.Text>
  );
}

/**
 * ── 맞으면 몸이 붉어진다 ──
 *
 * ## 여기 있던 표적을 걷어 냈다
 *
 * 붉은 네 귀퉁이가 몸을 감싸고, 칸 안이 옅게 물들고, 기술 이름이 아래
 * 붙었다. "이 사람이, 이 기술에, 방금 맞았다" 를 한 덩어리로 만들려던
 * 것인데 — 54px 짜리 인물 위에 상자 하나를 더 얹은 꼴이었다. 알려 주는
 * 것에 비해 화면에서 차지하는 자리가 너무 컸다.
 *
 * 기술 이름은 어차피 **우두머리 머리 위에서** 이미 외치고 있다. 그러니
 * 여기서 남길 것은 하나뿐이다 — **누가 맞았나.**
 *
 * ## 몸을 물들인다
 *
 * 에셋이 흰 픽셀 + 투명 배경이라 `tintColor` 로 색만 갈아 끼울 수 있다
 * (`ui/Sprite`). 그래서 **같은 그림을 붉게 한 장 더 겹치고** 투명도만
 * 굴린다 — 자세가 바뀌면 붉은 쪽도 같이 바뀌므로 늘 정확히 이 사람의
 * 윤곽이고, 상자처럼 자리를 더 먹지 않는다.
 *
 * 덧대는 방식인 이유는 `tint` 가 그냥 `prop` 이라서다. 본체 색을 직접
 * 갈면 렌더가 돌아야 색이 바뀌는데, 그러면 0.5초 박자에 맞춰 깜빡이는
 * 것이 아니라 **렌더가 도는 대로** 깜빡인다.
 *
 * ## 두 가지 세기
 *
 *   평타   한 번, 240ms. 계속 맞는 것이라 길면 늘 붉은 사람이 된다
 *   특수기  세 번, 780ms. 전원기와 한 명기를 여기서 가른다 —
 *          넷이 다 깜빡이면 전원기고, 하나만 깜빡이면 그 사람만 맞은 것
 */
const SOFT_MS = 240;
const HARD_MS = 780;

export function HurtTint({
  nonce, hard, size, children,
}: {
  /** 맞은 횟수 — 평타든 뭐든 체력이 깎이면 오른다 */
  nonce: number;
  /** 우두머리 특수기에 맞은 횟수 — 이쪽이 오르면 길고 세게 깜빡인다 */
  hard: number;
  size: number;
  /** 이 사람의 그림을 **붉게** 한 장. 부르는 쪽이 `tint` 를 준다 */
  children: React.ReactNode;
}) {
  const t = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(false);
  const [big, setBig] = useState(false);
  /*
    둘 중 **무엇이 올랐는지**를 봐야 한다. 특수기에 맞으면 체력도 같이
    깎이므로 두 숫자가 함께 오르는데, 그때는 센 쪽이 이겨야 한다.
  */
  const seen = useRef({ n: nonce, h: hard });

  useEffect(() => {
    const isHard = hard !== seen.current.h;
    const isHit = nonce !== seen.current.n;
    seen.current = { n: nonce, h: hard };
    if (!isHard && !isHit) return undefined;

    setBig(isHard);
    setOn(true);
    t.setValue(0);
    let alive = true;
    const a = Animated.timing(t, {
      toValue: 1,
      duration: isHard ? HARD_MS : SOFT_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    a.start(() => { if (alive) setOn(false); });
    /* 멈출 때 값을 되돌린다 — `stop()` 은 그 자리에 두고 멈춘다 */
    return () => { alive = false; a.stop(); t.setValue(0); };
  }, [nonce, hard, t]);

  /* `interpolate` 는 한 번만 만든다 — 렌더마다 부르면 값에 가지가 쌓인다 */
  const one = useMemo(() => t.interpolate({
    inputRange: [0, 0.3, 1], outputRange: [0, 0.85, 0],
  }), [t]);
  const three = useMemo(() => t.interpolate({
    inputRange: [0, 0.06, 0.2, 0.34, 0.48, 0.62, 1],
    outputRange: [0, 0.95, 0.1, 0.95, 0.1, 0.95, 0],
  }), [t]);

  if (!on) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        opacity: big ? three : one,
        /*
          몸(기본 층)보다 **앞**이다 — 물들이는 것이라 덮어야 한다.
          불꽃(38)과 숫자(40)보다는 뒤라, 그 둘을 가리지 않는다.
        */
        zIndex: 5,
      }}
    >
      {children}
    </Animated.View>
  );
}

/** 한 줄이 떴다 사라지기까지 (ms) */
export const NOTE_MS = 1600;

/**
 * ── 걸리는 순간 머리 위에 뜨는 한 줄 ──
 *
 * ## 로고만으로는 안 통했다
 *
 * 걸려 있는 것은 파티 칸에 로고로 뜬다 (`StatusRow`). 테두리 색이 좋고
 * 나쁨을 말하고 자리가 차례를 말하지만, **그 로고가 무슨 뜻인지**는 아무
 * 데도 안 적혀 있었다. 열두 그림을 외운 사람만 읽을 수 있는 표시였다.
 *
 * 그렇다고 로고 옆에 늘 글을 붙이면 파티 칸 넷이 통째로 글자밭이 된다.
 * 86px 짜리 칸에 넷까지 들어가는 자리다.
 *
 * ## 처음 한 번만 말한다
 *
 * 걸리는 **그 순간에만** 머리 위에서 한 줄이 떴다 사라진다. 그때 로고도
 * 같이 켜지므로, 한 번 보면 그림과 뜻이 묶인다 — 그다음부터는 로고만으로
 * 읽힌다. 화면에 남는 것은 결국 로고뿐이라 붐비지 않는다.
 *
 * 상시로 걸리는 것(패시브)은 **판마다 한 번**이다. 판이 바뀔 때마다 다시
 * 붙는 것이라 매번 말하면 잔소리가 되고, 아예 안 하면 판을 넘겨 온 사람은
 * 영영 못 본다.
 *
 * ## 글자만 띄운다
 *
 * 상자도 테두리도 안 두른다. 이 자리는 피해 숫자와 말풍선이 이미 쓰는
 * 자리고, 여기에 상자 하나를 더 얹으면 정작 숫자가 안 보인다. 검은
 * 그림자만 지워서 밝은 배경에서도 읽히게 한다.
 */
export function StatusNote({
  text, good, i,
}: {
  text: string;
  /** 좋은 것인가 — 초록과 빨강으로 갈린다 (`ui/theme`) */
  good: boolean;
  /** 몇 번째 줄인가 — 한꺼번에 여럿 걸리면 위로 쌓인다 */
  i: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.timing(t, {
      toValue: 1, duration: NOTE_MS, easing: Easing.linear, useNativeDriver: true,
    });
    a.start();
    /* 멈출 때 되돌린다 — `stop()` 은 그 자리에 두고 멈춘다 */
    return () => { a.stop(); t.setValue(0); };
  }, [t]);

  /*
    **떴다가 머물다 서서히 사라진다.**

    앞 8% 에서 켜지고, 6할까지 그대로 있다가, 남은 4할 동안 스러진다.
    읽는 데 필요한 것은 머무는 시간이라 그쪽을 길게 잡았다.

    `interpolate` 는 한 번만 만든다 — 렌더마다 부르면 값에 가지가 쌓인다.
  */
  const fade = useMemo(() => t.interpolate({
    inputRange: [0, 0.08, 0.6, 1], outputRange: [0, 1, 1, 0],
  }), [t]);
  /* 아주 조금 떠오른다 — 많이 올리면 숫자와 자리를 다툰다 */
  const rise = useMemo(() => t.interpolate({
    inputRange: [0, 1], outputRange: [0, -7],
  }), [t]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        /*
          머리 **한참 위**다. 피해 숫자가 머리 바로 위를 쓰고(`top: -11`)
          말풍선이 그 위를 쓰므로, 셋이 같은 자리를 다투면 제일 급한 숫자가
          가려진다.
        */
        bottom: '100%',
        marginBottom: 16 + i * 12,
        /* 인물보다 넓어도 좋다 — `받는 치유 감소` 는 한 줄이 인물 두 배다 */
        left: -30,
        right: -30,
        alignItems: 'center',
        opacity: fade,
        transform: [{ translateY: rise }],
        zIndex: 48,
      }}
    >
      <Animated.Text
        style={{
          color: good ? GOOD_C : BAD_C,
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: '700',
          /* 배경이 밝은 판에서도 읽히게 (`DamageNumber` 와 같은 이유) */
          textShadowColor: BLACK,
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * ── 새로 걸린 것을 머리 위에 한 줄로 알린다 ──
 *
 * 로고만으로는 뜻이 안 통했다 (`StatusNote` 머리말). 걸리는 그 순간에 한 번만
 * 말하고, 그다음부터는 로고가 맡는다.
 *
 * ## 아군과 적이 같은 부품을 쓴다
 *
 * 예전에는 이 갈래가 `Fighter` 안에만 있어서 **아군에게만** 떴다. 그런데
 * 화산이 거는 시듦이나 도발은 걸리는 쪽이 적이라, 정작 알려야 할 것이 화면에
 * 안 나왔다 — 적 머리 위에는 로고만 있었고 그건 외운 사람만 읽는다.
 *
 * 두 곳에서 같은 규칙으로 뜬다. 아군 것과 적 것이 다른 규칙이면 보는 사람이
 * 규칙을 두 벌 익혀야 한다.
 *
 * ## 기억하는 것 두 가지
 *
 *   `had`   바로 앞 순간에 붙어 있던 것. 여기 없던 것이 곧 **새로 걸린 것**
 *   `told`  이 판에서 이미 말한 **상시효과**. 패시브는 판이 바뀔 때마다 다시
 *           붙으므로 이것이 없으면 잡몹 한 마리 잡을 때마다 말한다
 *
 * ## 판이 끝나면 둘 다 비운다 (`live`)
 *
 * 한동안 `costSeq` 로 판이 바뀐 것을 알아봤다. 숫자는 맞았는데 **시점이
 * 틀렸다** — 그 값은 검은 막이 내려간 뒤에 오르므로, 상시효과를 알리는 줄이
 * 막 아래에서 떴다 사라졌다. 판을 열 때마다 아무도 못 보는 글이 뜨고 있었다.
 *
 * 이제 "지금 실제로 싸우는 중인가" 하나만 본다 (`core/autoBattle` 의
 * `fightHeld` 를 뒤집은 값). 막이 걸리면 비우고, 막이 걷혀 양쪽이 제자리에
 * 서는 그 순간에 지금 걸려 있는 것을 통째로 알린다 — 판마다 패시브가 새로
 * 붙는 것처럼 보이는데, 규칙상으로도 실제로 그렇다.
 */
export function MarkNotes({
  marks, markKey, live,
}: {
  marks: readonly Mark[];
  /**
   * `marks` 를 줄인 열쇠 (`set:name` 을 이어 붙인 것).
   *
   * `marks` 자체를 갈래에 걸 수가 없다 — 매 렌더마다 새 배열이라 끝없이
   * 돈다. 열쇠가 같으면 내용도 같다.
   */
  markKey: string;
  /** 지금 실제로 싸우는 중인가 — 막이 걸려 있으면 아무 말도 안 한다 */
  live: boolean;
}) {
  const [notes, setNotes] = useState<{ key: number; text: string; good: boolean }[]>([]);
  const seq = useRef(0);
  const had = useRef<Set<string>>(new Set());
  const told = useRef<Set<string>>(new Set());
  /*
    줄을 걷는 시계들.

    예전에는 갈래의 정리 함수에서 껐다. 그런데 이 갈래는 상태가 바뀔 때마다
    다시 도므로, `NOTE_MS` 가 지나기 전에 다른 것이 걸리면 **앞 줄을 걷는
    시계가 취소됐다** — 그 줄은 영영 안 사라졌다. 여기 모아 두고 화면을 떠날
    때만 끈다.
  */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (!live) {
      had.current = new Set();
      told.current = new Set();
      /* 이미 떠 있던 줄도 같이 걷는다 — 막 위에 남으면 다음 판까지 따라온다 */
      setNotes((old) => (old.length ? [] : old));
      return;
    }
    const now = new Set<string>();
    const fresh: { key: number; text: string; good: boolean }[] = [];
    for (const m of marks) {
      const k = `${m.set}:${m.name}`;
      now.add(k);
      if (had.current.has(k)) continue;
      /* 상시효과는 판마다 한 번만 — 매번 말하면 잔소리가 된다 */
      if (m.set === 'passive_icon') {
        if (told.current.has(k)) continue;
        told.current.add(k);
      }
      fresh.push({
        key: seq.current++,
        text: `${m.good ? '버프' : '디버프'}:${m.what}`,
        good: m.good,
      });
    }
    had.current = now;
    if (!fresh.length) return;
    /* 한꺼번에 셋 넘게 걸리면 앞엣것부터 버린다 — 넷이 쌓이면 벽이 된다 */
    setNotes((old) => [...old, ...fresh].slice(-3));
    timers.current.push(setTimeout(() => {
      setNotes((old) => old.filter((n) => !fresh.some((f) => f.key === n.key)));
    }, NOTE_MS));
    /*
      `marks` 는 **일부러 뺀다.** 매 렌더마다 새 배열이라 넣으면 이 갈래가
      끊임없이 돈다 (`markKey` 가 그 자리를 대신한다).
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markKey, live]);

  if (!notes.length) return null;
  return (
    <>
      {notes.map((n, k) => (
        <StatusNote key={n.key} text={n.text} good={n.good} i={k} />
      ))}
    </>
  );
}

/**
 * 화면 흔들기 — 무대 전체에 건다.
 *
 * **스타일을 한 번만 만든다.** 예전에는 부르는 쪽이 렌더마다 `shakeStyle(v)`
 * 를 새로 만들었다. `interpolate` 는 부를 때마다 값에 새 가지를 다는 것이라,
 * 0.5초마다 도는 화면에서는 몇 시간이면 가지가 수만 개가 된다.
 */
export function useShake() {
  const v = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  const fire = React.useCallback((power = 1) => {
    anim.current?.stop();
    v.setValue(0);
    anim.current = Animated.sequence([
      Animated.timing(v, { toValue: power, duration: 45, useNativeDriver: true }),
      Animated.timing(v, { toValue: -power * 0.6, duration: 55, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]);
    anim.current.start();
  }, [v]);

  /* 화면을 떠날 때 멈춘다 — 값도 되돌린다. `stop()` 은 그 자리에 두고 멈춘다 */
  useEffect(() => () => { anim.current?.stop(); v.setValue(0); }, [v]);

  const style = useMemo(() => shakeStyle(v), [v]);
  return { v, fire, style };
}

/**
 * 흔들림을 실제 이동으로 (5px 폭).
 *
 * `useShake` 안에서 **한 번만** 부른다. 밖에서 렌더마다 부르면 값에 가지가
 * 계속 달린다 — 그래서 내보내지 않는다.
 */
const shakeStyle = (v: Animated.Value) => ({
  transform: [{ translateX: v.interpolate({ inputRange: [-1, 1], outputRange: [-5, 5] }) }],
});

/** 잔상 — 앞으로 치고 나갈 때 뒤에 남는 흐린 복제 */
export function AfterImage({ children, on }: { children: React.ReactNode; on: Animated.Value }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        opacity: on.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
        transform: [{ translateX: on.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }],
      }}
    >
      <View>{children}</View>
    </Animated.View>
  );
}
