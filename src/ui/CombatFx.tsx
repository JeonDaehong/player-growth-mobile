import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { WEAPON_MOTION, WeaponKind } from '@/core/types';
import type { AvatarId } from '@/core/avatars';
import { Row, T } from './atoms';
import { Sprite } from './Sprite';
import { ICONS, PLAYER } from './sprites';
import { BORDER, C, O, SP, WHITE } from './theme';
import { useBattle } from '@/state/live';
import { sfx } from './sfx';

/**
 * 상대 표현 — 투기장은 아바타, 스테이지는 배경, 레이드는 보스 아트.
 *
 * `stage` 의 `set` 은 문자열이다. 아트가 아직 안 들어온 세트(`raid_boss`)도
 * 그대로 넘길 수 있어야 하고, 그럴 땐 `fallbackSet` 이 대신 그린다 —
 * 여기서 세트 이름을 유니온으로 묶으면 새 세트마다 이 파일을 고쳐야 한다.
 */
export type Foe =
  | { kind: 'avatar'; avatar: AvatarId; name: string }
  | { kind: 'creature'; id: string; name: string }
  | {
    kind: 'stage';
    set: string;
    sprite: string;
    name: string;
    /** 그 세트에 아직 그림이 없을 때 대신 쓸 세트·이름 */
    fallbackSet?: string;
    fallbackName?: string;
  };

export interface BattleView {
  weapon: WeaponKind;
  foe: Foe;
  win: boolean;
  caption: string;
  /**
   * 결투 연출 — 투기장 전용.
   *
   * 탐험·탑은 "한 방 판정" 이라 짧은 연출이 맞다. 투기장은 **사람과 사람**이
   * 붙는 자리인데 같은 1.9초로 끝내면 상대가 누구였는지도 못 보고 결과만 남는다.
   * 결투는 5초 동안 다섯 합을 주고받고, 체력 게이지가 실제로 깎인다.
   */
  duel?: boolean;
  /**
   * 긴 연출 — 레이드 전용.
   *
   * 탐험·탑은 한 번 휘두르고 끝나는 판정이라 1.9초가 맞다. 레이드는 **길드가
   * 며칠에 걸쳐 깎는 보스**인데 같은 1.9초로 지나가면 숫자만 늘고 만다.
   * 세 번 몰아치고 물러나는 4.2초짜리로 늘려 "때렸다" 가 남게 한다.
   */
  long?: boolean;
  /** 결투에서 내 이름표 (없으면 '나') */
  myName?: string;
  /** 결투 상대 아이템레벨 표시용 */
  myIlvl?: number;
  foeIlvl?: number;
}

interface Props {
  /** null 이면 닫힘 */
  battle: BattleView | null;
  onDone: () => void;
}

/** 앱 루트에 한 번만 두는 호스트. 스토어를 구독한다. */
export function CombatFxHost() {
  const battle = useBattle((s) => s.battle);
  const clear = useBattle((s) => s.clear);
  return <CombatFx battle={battle} onDone={clear} />;
}

type Phase = 'face' | 'a1' | 'a2' | 'a3' | 'result';

/** 프레임 진행 시각 (ms) — 한 방 판정용 (탐험 · 탑 · 레이드) */
const TIMELINE: [Phase, number][] = [
  ['face', 0],
  ['a1', 420],
  ['a2', 580],
  ['a3', 760],
  ['result', 1000],
];
const DONE_AT = 1900;
const STRIKE_AT = 580;

/**
 * 긴 한 방 판정 (레이드).
 *
 * 판정 자체는 그대로 한 번이다 — 늘린 건 **연출뿐**이다. 세 번 몰아치고
 * 마지막이 제일 무겁다. 마지막 타격 뒤 결과를 1초 남짓 세워 둔다.
 */
const LONG_TIMELINE: [Phase, number][] = [
  ['face', 0],
  ['a1', 620], ['a2', 780], ['a3', 960],
  ['a1', 1500], ['a2', 1660], ['a3', 1840],
  ['a1', 2380], ['a2', 2540], ['a3', 2720],
  ['result', 3100],
];
/** 타격이 실제로 꽂히는 순간. 마지막은 무겁게 친다 */
const LONG_STRIKES: [number, boolean][] = [[780, false], [1660, false], [2540, true]];
const LONG_DONE_AT = 4200;

// ── 결투 (투기장) ──────────────────────────────────────
/** 양쪽 체력 칸 수. 다섯 합이면 눈으로 셀 수 있고, 5초 안에 들어간다 */
const DUEL_BLOCKS = 5;
/** 합과 합 사이 */
const DUEL_GAP = 700;
/** 첫 합이 나가기 전, 서로를 확인하는 시간 */
const DUEL_LEAD = 700;
const DUEL_EXCHANGES = 5;
const DUEL_FINISH_AT = DUEL_LEAD + DUEL_EXCHANGES * DUEL_GAP;   // 4,200ms — 마지막 일격
const DUEL_RESULT_AT = DUEL_FINISH_AT + 400;                    // 4,600ms
const DUEL_DONE_AT = DUEL_RESULT_AT + 900;                      // 5,500ms

/** 결투 한 합 — 누가 때렸는가 */
type Blow = { at: number; by: 'me' | 'foe'; finish?: boolean };

/**
 * 다섯 합의 각본.
 *
 * 결과는 이미 확률로 정해져 있다(§1). 그래서 각본은 **결과를 향해 짜여 있다** —
 * 이긴 쪽이 세 대를 먼저 넣고 마지막 일격으로 끝낸다. 진 쪽도 두 대는 넣는다.
 * 일방적으로 맞기만 하면 "졌다" 가 아니라 "버그" 로 읽힌다.
 */
function duelScript(win: boolean): Blow[] {
  const winner: 'me' | 'foe' = win ? 'me' : 'foe';
  const loser: 'me' | 'foe' = win ? 'foe' : 'me';
  return [
    { at: DUEL_LEAD + DUEL_GAP * 0, by: winner },
    { at: DUEL_LEAD + DUEL_GAP * 1, by: loser },
    { at: DUEL_LEAD + DUEL_GAP * 2, by: winner },
    { at: DUEL_LEAD + DUEL_GAP * 3, by: loser },
    { at: DUEL_LEAD + DUEL_GAP * 4, by: winner },
    { at: DUEL_FINISH_AT, by: winner, finish: true },
  ];
}

/**
 * 전투 연출 (기획서 §1 — 무기 종류에 따라 공격 모션이 달라진다).
 * 전투 자체는 확률 계산이라 결과는 이미 정해져 있다. 이 오버레이는 그 결과에
 * 도달하는 과정을 보여주는 연출이며, 아무 때나 눌러서 건너뛸 수 있다.
 */
export function CombatFx({ battle, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('face');
  /** 결투에서 지금 때리는 쪽 (null = 대치 중) */
  const [swing, setSwing] = useState<'me' | 'foe' | null>(null);
  const [hp, setHp] = useState({ me: DUEL_BLOCKS, foe: DUEL_BLOCKS });
  const [round, setRound] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shake = useSharedValue(0);
  /** 결투에서 상대가 달려드는 거리 — 아바타는 공격 프레임이 없어 이동으로 표현한다 */
  const lunge = useSharedValue(0);

  const duel = !!battle?.duel;

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!battle) return;
    const push = (fn: () => void, at: number) => timers.current.push(setTimeout(fn, at));

    setPhase('face');
    setSwing(null);
    setRound(0);
    setHp({ me: DUEL_BLOCKS, foe: DUEL_BLOCKS });

    /**
     * 타격 한 번의 화면 반응 — 흔들림 · 소리 · 진동.
     *
     * ⚠ 화면을 하얗게 덮는 플래시는 없앴다. 한 판에 타격이 여러 번 들어가는데
     * 그때마다 화면이 번쩍이면 그건 연출이 아니라 눈뽕이다 (강화 연출도 같은
     * 이유로 뺐다 — ui/EnhanceFx 참고). 흔들림과 소리만으로 충분히 맞은 티가 난다.
     */
    const impact = (heavy: boolean) => {
      shake.value = withRepeat(
        withSequence(
          withTiming(heavy ? -7 : -4, { duration: 40, easing: Easing.linear }),
          withTiming(heavy ? 7 : 4, { duration: 40, easing: Easing.linear }),
        ),
        heavy ? 4 : 2,
        true,
      );
      sfx('blade');
      void Haptics.impactAsync(
        heavy ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
      );
    };

    if (!duel) {
      const long = !!battle.long;
      for (const [p, at] of (long ? LONG_TIMELINE : TIMELINE)) {
        if (at === 0) continue;
        push(() => setPhase(p), at);
      }
      if (long) {
        for (const [at, heavy] of LONG_STRIKES) push(() => impact(heavy), at);
      } else {
        push(() => impact(battle.win), STRIKE_AT);
      }
      push(onDone, long ? LONG_DONE_AT : DONE_AT);
    } else {
      for (const [i, blow] of duelScript(battle.win).entries()) {
        // 준비 자세 → 타격 → 대치 복귀. 사람이 "합" 으로 읽는 최소 단위다
        push(() => {
          setSwing(blow.by);
          setRound(i + 1);
          if (blow.by === 'foe') {
            lunge.value = withSequence(
              withTiming(-26, { duration: 150, easing: Easing.out(Easing.quad) }),
              withTiming(0, { duration: 260 }),
            );
          }
        }, blow.at - 160);
        push(() => {
          impact(!!blow.finish);
          setHp((h) => {
            const hit = blow.by === 'me' ? 'foe' : 'me';
            return { ...h, [hit]: blow.finish ? 0 : Math.max(1, h[hit] - 1) };
          });
        }, blow.at);
        push(() => setSwing(null), blow.at + 220);
      }
      push(() => { setPhase('result'); setSwing(null); }, DUEL_RESULT_AT);
      push(onDone, DUEL_DONE_AT);
    }

    return () => {
      timers.current.forEach(clearTimeout);
      shake.value = 0;
      lunge.value = 0;
    };
  }, [battle, duel, onDone, shake, lunge]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const lungeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: lunge.value }] }));

  if (!battle) return null;
  const { weapon, foe, win, caption } = battle;
  const motion = WEAPON_MOTION[weapon];

  /**
   * 내 그림 고르기.
   * 한 방 판정은 페이즈(a1/a2/a3)가 곧 프레임이고, 결투는 "지금 내가 휘두르는가" 다.
   */
  const myFrame = phase === 'a1' ? 1 : phase === 'a2' ? 2 : 3;
  const meAttacking = duel ? swing === 'me' : phase !== 'face' && phase !== 'result';
  const meSprite = phase === 'result'
    ? { set: 'player', name: win ? 'victory' : 'defeated' }
    : meAttacking
      ? { set: 'pl_attack', name: `${motion}_${duel ? (round % 3) + 1 : myFrame}` }
      : { set: 'player', name: 'idle' };

  return (
    <Animated.View entering={FadeIn.duration(120)} style={styles.host}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDone} />

      <Animated.View style={[{ pointerEvents: 'none' }, styles.stage, shakeStyle]}>
        {duel && (
          <Row between style={{ width: '100%', marginBottom: SP.md }}>
            <T size={10} dim="sub">투기장 결투</T>
            <T size={10} dim={phase === 'result' ? 'full' : 'sub'} bold>
              {phase === 'result' ? '결착' : `${Math.max(1, round)}합`}
            </T>
          </Row>
        )}

        <Row between style={{ width: '100%', alignItems: 'flex-end', minHeight: 130 }}>
          {/* 나 */}
          <View style={{ alignItems: 'center', width: 120 }}>
            <Sprite
              set={meSprite.set as never}
              name={meSprite.name}
              size={meAttacking ? 110 : 96}
              fallback={PLAYER}
              opacity={duel && phase === 'result' && !win ? O.dim : 1}
            />
            <T size={10} dim="sub" numberOfLines={1}>
              {duel ? (battle.myName ?? '나') : MOTION_LABEL[motion]}
            </T>
          </View>

          <T size={13} bold dim={phase === 'result' ? 'full' : 'dim'}>
            {phase === 'result' ? (win ? '승 리' : '패 배') : 'VS'}
          </T>

          {/* 상대 */}
          <Animated.View style={[{ alignItems: 'center', width: 120 }, duel && lungeStyle]}>
            <FoeArt
              foe={foe}
              beaten={phase === 'result' && win}
              duelFrame={duel ? duelFrameOf(phase, swing, win) : undefined}
            />
            <T size={10} dim="sub" numberOfLines={1}>{foe.name}</T>
          </Animated.View>
        </Row>

        {/* 결투는 게이지가 깎이는 게 보여야 "주고받았다" 가 된다 */}
        {duel && (
          <View style={{ width: '100%', marginTop: SP.md }}>
            <DuelGauge label={battle.myName ?? '나'} hp={hp.me} ilvl={battle.myIlvl} />
            <View style={{ height: SP.xs }} />
            <DuelGauge
              label={foe.name}
              hp={hp.foe}
              ilvl={battle.foeIlvl}
              mirror
              /* 싸우는 몸은 실루엣이라 얼굴이 없다 — 누구와 붙는지는 여기서 말한다 */
              avatar={foe.kind === 'avatar' ? foe.avatar : undefined}
            />
          </View>
        )}

        {/* 결과 문구 자리를 미리 비워 둬야 나타날 때 레이아웃이 튀지 않는다 */}
        <View style={{ minHeight: 42, justifyContent: 'center', marginTop: SP.lg }}>
          {phase === 'result' && (
            <View style={[BORDER, { paddingHorizontal: SP.md, paddingVertical: SP.sm }]}>
              <T size={12} bold center>{caption}</T>
            </View>
          )}
        </View>
        <T size={9} dim="faint" style={{ marginTop: SP.sm }}>화면을 누르면 건너뜁니다</T>
      </Animated.View>

    </Animated.View>
  );
}

/**
 * 결투 체력 게이지.
 * 회색을 안 쓰므로(§1) 남은 칸은 채우고 잃은 칸은 테두리만 남긴다.
 */
function DuelGauge(
  { label, hp, ilvl, mirror, avatar }:
  { label: string; hp: number; ilvl?: number; mirror?: boolean; avatar?: AvatarId },
) {
  const blocks = Array.from({ length: DUEL_BLOCKS }, (_, i) => (
    <View
      key={i}
      style={{
        flex: 1,
        height: 9,
        borderWidth: 1,
        borderColor: WHITE,
        backgroundColor: i < hp ? WHITE : 'transparent',
        opacity: i < hp ? 1 : O.faint,
      }}
    />
  ));
  return (
    <View>
      <Row between gap={SP.xs}>
        {!!avatar && <Sprite set="avatar" name={avatar} size={14} />}
        <T size={9} dim="sub" numberOfLines={1} style={{ flex: 1 }}>{label}</T>
        {ilvl != null && <T size={9} dim="dim">템렙 {Math.round(ilvl)}</T>}
      </Row>
      <Row gap={2} style={{ marginTop: 2 }}>{mirror ? blocks.reverse() : blocks}</Row>
    </View>
  );
}

type Motion = (typeof WEAPON_MOTION)[WeaponKind];
const MOTION_LABEL: Record<Motion, string> = {
  thrust: '찌르기', slash: '베기', smash: '내려치기', shoot: '사격', cast: '주문',
};

/**
 * 결투에서 상대가 취할 자세.
 *
 * 투기장 상대는 지금까지 **초상화 한 장**이었다. 초상화는 "누구인가" 는 말해도
 * "싸우는 중" 은 못 말한다. 그래서 결투 동안에는 `duel` 세트(방어·휘두름·피격…)로
 * 그린다 — 그 세트가 아직 없으면 조용히 초상화로 떨어진다 (아트가 들어오면 자동 승급).
 */
function duelFrameOf(phase: Phase, swing: 'me' | 'foe' | null, win: boolean): string {
  if (phase === 'result') return win ? 'lose' : 'win';
  if (swing === 'foe') return 'strike';
  if (swing === 'me') return 'hit';
  return 'guard';
}

/**
 * 상대 쪽 그림.
 *
 * ⚠ **좌우를 뒤집는다.**
 *
 * 이 게임의 아트는 전부 오른쪽을 보고 그려져 있다 (아바타 초상, 크리처, 결투
 * 실루엣 모두). 상대는 화면 **오른쪽**에 서므로, 그대로 두면 나에게 등을 보이고
 * 바깥쪽을 바라본 채 싸운다 — 둘이 마주 보지 않으니 결투로 안 읽힌다.
 *
 * 아바타 초상까지 뒤집는다. 얼굴이 좌우로 뒤집히는 게 어색할 것 같지만, 나란히
 * 세워 놓고 보면 **마주 보는 쪽**이 훨씬 자연스럽다 — 둘 다 같은 방향을 보고
 * 있으면 한 명이 도망가는 것처럼 보인다.
 */
function FoeArt({ foe, beaten, duelFrame }: { foe: Foe; beaten: boolean; duelFrame?: string }) {
  const op = beaten ? O.dim : 1;
  if (duelFrame && foe.kind === 'avatar') {
    return (
      <Sprite
        set="duel"
        name={duelFrame}
        size={96}
        opacity={op}
        flip
        fallbackSet="avatar"
        fallbackName={foe.avatar}
      />
    );
  }
  if (foe.kind === 'avatar') {
    return <Sprite set="avatar" name={foe.avatar} size={88} opacity={op} flip />;
  }
  if (foe.kind === 'creature') return <Sprite set="creature" name={foe.id} size={88} opacity={op} flip />;
  return (
    <Sprite
      set={foe.set}
      name={foe.sprite}
      size={88}
      opacity={op}
      flip
      fallbackSet={foe.fallbackSet}
      fallbackName={foe.fallbackName}
      fallback={ICONS.skull}
    />
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    // 완전 불투명 — 반투명이면 아래 패널 글자가 비쳐서 연출이 지저분해진다
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SP.md,
  },
  stage: {
    width: '100%',
    borderWidth: 2,
    borderColor: WHITE,
    paddingVertical: SP.xl,
    paddingHorizontal: SP.md,
    alignItems: 'center',
  },
});
