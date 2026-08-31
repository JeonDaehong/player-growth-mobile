/**
 * 파티원 한 명 — 제 박자로 **실제로 검을 휘두른다.**
 *
 * ## 처음엔 안 휘둘렀다
 *
 * `strike` 한 장을 계속 띄워 놓고 몸만 앞뒤로 움직였다. 그래서 "휘두르는 것"
 * 이 아니라 "칼 든 사람이 앞뒤로 흔들리는 것" 으로 보였다.
 *
 * `duel/` 네 장이 이미 완결된 스윙이다.
 *
 *   guard   — 서 있다. 검을 내리고 방패를 올린 자세
 *   windup  — 검을 머리 위로 치켜든다
 *   strike  — 앞으로 내디디며 내려친다 (여기서 맞는다)
 *   recover — 자세를 되돌린다
 *
 * 이 넷을 순서대로 넘기면 그게 스윙이다. 프레임을 더 그릴 필요가 없었고,
 * 안 돌리고 있었을 뿐이다.
 *
 * ## 박자
 *
 * 공격 간격(`spd`)의 대부분은 `guard` 로 서 있고, 마지막 320ms 동안만
 * 치켜들고 내려치고 되돌아온다. 스윙이 간격 전체에 퍼지면 늘어져 보인다 —
 * **기다리다 한 번에 빠르게** 가 때리는 느낌을 만든다.
 *
 * ## 계산과 분리돼 있다
 *
 * 실제 피해는 스토어가 0.5초마다 파티 전체를 한 덩어리로 굴린다
 * (`core/autoBattle`). 여기서 하는 건 **보이는 것**뿐이다. 그래서 연출을
 * 아무리 늘려도 수치가 틀어질 자리가 없다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Row } from '@/ui/atoms';
import {
  CHARS, HitFx, OwnedChar, nextSkill, skillOf, skillsOf, statOf, swingMs,
} from '@/core/chars';

import { Sprite } from '@/ui/Sprite';
import { spriteGap } from '@/ui/spriteAssets';
import { StatusId } from '@/core/status';
import { WHITE } from '@/ui/theme';
import { ZOOM, depthAt } from './Ground';
import { DamageNumber, HealMarks, HitBurst, SkillShout } from './HitFx';
import { SwordWave, flyMsOf } from './SwordWave';
import { SkillAura } from './SkillAura';
import { StatusRow } from './StatusRow';

/**
 * 베는 동작 세 칸의 길이 (ms).
 *
 * 셋을 같은 길이로 두면 기계적으로 보인다. **가운데(맞는 순간)가 제일 짧다** —
 * 빠르게 지나가야 세게 친 것처럼 보이고, 앞뒤가 길어야 힘을 모았다 푸는
 * 느낌이 난다.
 */
/** 쓰러진 자세를 그대로 보여 주는 시간 — 읽을 만큼만 */
const FALL_HOLD_MS = 500;
/** 그 뒤 흐려져 사라지는 데 걸리는 시간 */
const FALL_FADE_MS = 600;

const CUT_MS = [120, 70, 100];
export const SWING_MS = CUT_MS.reduce((a, b) => a + b, 0);

/**
 * 베기 네 칸. `<id>_cut` 이 아니라 캐릭터 폴더에 같이 들어간다
 * (`docs/character-art/` §D).
 *
 * 아직 §D 를 안 받은 캐릭터는 §A 의 세 프레임으로 떨어진다 — 넷을 셋에
 * 매핑하므로 동작이 조금 뚝뚝하지만 빠지는 그림은 없다.
 */
const CUT_FRAMES = ['cut_1', 'cut_2', 'cut_3'] as const;
const CUT_FALLBACK: Record<string, string> = {
  cut_1: 'windup', cut_2: 'strike', cut_3: 'recover',
};

/** 맞는 순간 — 검이 몸 앞을 지나는 가운데 칸 */
const HIT_AT = CUT_MS[0];

/**
 * 스킬 세 칸의 길이 (ms) — 당김 · 벰 · 놓음.
 *
 * 당김을 180 → 140 으로 줄이고, 베는 칸을 110 → 150 으로 늘렸다.
 * 검기가 나가는 건 베는 칸이 시작할 때인데, 그 칸이 110ms 밖에 안 되니
 * **검기가 몸에서 벗어나기도 전에 다음 칸으로 넘어갔다.** 그래서 "휘리릭
 * 하고 난 다음에 나간다" 로 보였다.
 *
 * 베는 칸이 길어야 검기가 떠나는 게 그 칸 안에서 보인다.
 */
const SK_MS = [140, 150, 200];

/*
  기술마다 다른 박자는 `core/chars` 의 `SkillDef.beat` 에 있다.

  예전에는 도약 것만 여기 상수로 뒀는데, 기도가 들어오면서 둘이 됐다.
  세 번째가 생기면 또 여기에 상수가 늘고, 어느 기술이 어느 박자를 쓰는지가
  두 파일에 나뉜다. 기술의 성질이므로 기술 쪽에 둔다.
*/

/**
 * 얼마나 높이 솟나 (px).
 *
 * 무대가 138px 이고 발이 바닥에서 14px 위에 서 있으므로, 54px 짜리 몸이
 * 52px 을 더 올라가면 머리가 무대 천장 16px 아래까지 간다. 화면 밖으로
 * 나가기 직전까지가 제일 높이 뛴 것으로 보인다.
 */
const LEAP_UP = Math.round(52 * ZOOM);
const SK_FRAMES = ['sk_1', 'sk_2', 'sk_3'] as const;

/**
 * 스킬의 `landOn` 번째 칸이 **시작하는** 시각 (ms).
 *
 * 기술마다 닿는 칸이 다르다 — 검기는 베는 2번 칸에서 떠나고, 도약은 착지하는
 * 3번 칸에서 터진다. 이걸 안 나누면 비앙카가 공중에 뜬 채로 적이 죽는다.
 */
function landAtOf(spans: readonly number[], landOn: number): number {
  let t = 0;
  for (let i = 0; i < landOn - 1; i++) t += spans[i];
  return t;
}

/**
 * 검기가 떠나는 순간 — 두 번째 칸(**베는 칸**)이 시작할 때.
 *
 * 처음엔 그 칸이 **끝날 때** 로 뒀다가 옮겼다. 베는 그림이 다 지나간 뒤에
 * 검기가 나가니, 칼은 이미 멈춰 있는데 뒤늦게 뭔가 튀어나왔다.
 * 검을 휘두르는 그 프레임에 같이 나가야 "베면서 날렸다" 로 보인다.
 */
const WAVE_AT = SK_MS[0];

/** 스킬을 못 받은 캐릭터는 평타 프레임으로 떨어진다 */
const SK_FALLBACK: Record<string, string> = {
  sk_1: 'cut_1', sk_2: 'cut_2', sk_3: 'cut_3',
};

export interface Swing {
  /** 누가 쳤나 */
  id: string;
  /** 그 캐릭터의 이펙트 */
  fx: HitFx;
  /** 띄울 숫자 */
  dmg: number;
}

/** 아무것도 안 하는 콜백 — 매 렌더마다 새로 만들면 애니메이션이 되감긴다 */
const NOOP = () => {};

type Frame = 'guard' | 'lose'
  | (typeof CUT_FRAMES)[number] | (typeof SK_FRAMES)[number];

function FighterView({
  ch, back, down, hp, damage, bless, advance, leapTo,
  squeeze, width, lap, status, onAim, onSwing, onSkill,
}: {
  ch: OwnedChar;
  /** 0 이 맨 앞 */
  back: number;
  /** 파티 전체가 쓰러졌나 */
  down: boolean;
  /** 이 사람의 남은 체력 */
  hp: number;
  /**
   * 이 사람 머리 위에 띄울 피해 숫자들.
   *
   * 바깥에서 그리다가 여기로 옮겼다. 밖에서는 감싸는 View 의 크기가 0 이라
   * 자리가 안 잡혀 화면 어딘가로 새 나갔다 — 체력 막대는 여기서 잘 뜨니
   * 숫자도 같은 자리에서 그리는 게 확실하다.
   */
  damage: { key: number; text: string }[];
  /**
   * 회복을 받은 횟수.
   *
   * 늘어날 때마다 몸 위에서 빛이 한 번 퍼진다. 사제의 기도는 적을 안
   * 때리므로, 화면에서 **아무 일도 안 일어난 것처럼** 보이기 쉽다 —
   * 체력 막대가 조금 차는 것만으로는 뭘 했는지 알 수 없다.
   */
  bless: number;
  /**
   * 좁은 화면에서 추가로 겹칠 폭(px).
   *
   * 보통은 0 이다. 무대가 좁아 아군 줄과 적 줄이 서로 파고들 때만 커진다
   * (`BattleView` 의 `squeezeFor`).
   */
  squeeze: number;
  /**
   * 이 사람이 차지하는 폭 (맨 앞 기준).
   *
   * `Ground` 의 `PARTY_W` 를 그대로 쓰다가 받아 쓰게 바꿨다. 무대가 좁으면
   * 대형을 통째로 줄이는데(`fitOf`), 사람만 원래 크기로 남으면 줄이 화면을
   * 넘는다. **줄 계산과 같은 값**을 써야 한다.
   */
  width: number;
  /** 앞사람과 겹치는 폭 — 이것도 같은 배율을 탄다 */
  lap: number;
  /**
   * 적 쪽으로 나가 있는 거리(px).
   *
   * 근접이면 무대 가운데까지 걸어 나가 붙고, 원거리면 0 이라 제자리에 남는다.
   * 이게 없으면 창잡이도 마법사도 같은 자리에 서서 허공에 휘두른다.
   */
  advance: number;
  /**
   * 뛰어드는 기술이 적진까지 가려면 몇 px 을 더 가야 하나.
   *
   * `advance` 는 평소에 나가 있는 거리이고, 이건 **그 자리에서 적 앞줄까지**
   * 남은 거리다. `BattleView` 가 두 줄의 배치를 알고 있으므로 거기서 잰다 —
   * 여기서 어림잡으면 화면이 넓든 좁든 늘 같은 거리를 뛰어서, 어떤 때는
   * 적 앞에서 멈추고 어떤 때는 적을 지나쳐 버린다.
   */
  leapTo: number;
  /**
   * 대상을 정한다. **쏘는 순간** 불리고, 그 대상까지의 거리(px)를 돌려준다.
   *
   * 피해는 날아간 것이 **닿을 때** 들어가지만, 어디로 날릴지는 손을 떠나는
   * 순간 정해져야 한다. 그래서 정하는 일과 때리는 일을 나눴다 — 정한 자리는
   * 화면이 들고 있다가, 닿는 순간(`onSwing`) 그대로 쓴다.
   */
  onAim: (id: string, skill: boolean) => number;
  onSwing: (s: Swing) => void;
  /**
   * 지금 이 사람에게 걸려 있는 상태들 (`core/status`).
   *
   * 머리 위에 로고로 뜬다 (`StatusRow`). 빈 배열이면 아무것도 안 그린다.
   */
  status: readonly StatusId[];
  /**
   * 스킬을 쓸 때 — 검기가 떠나는 순간에 불린다.
   *
   * @param slot 이번에 나간 기술의 자리 (`core/chars` 의 `skillsOf` 순서).
   *             여기서 정해서 넘기는 이유는, 기술이 여럿일 때 무엇이 나갈지를
   *             아는 건 스윙 순환을 돌리는 여기뿐이기 때문이다 — 밖에서 다시
   *             고르면 그린 기술과 들어간 기술이 갈린다.
   */
  onSkill: (id: string, slot: number) => void;
}) {
  const d = CHARS[ch.id];
  const st = statOf(ch);
  const [frame, setFrame] = useState<Frame>('guard');
  /** 몇 번째 스킬인지 — 바뀔 때마다 검기가 새로 날아간다 */
  const [castNo, setCastNo] = useState(0);
  /**
   * 지금 외치고 있는 것 — 몇 번째 외침인지와 무슨 기술인지.
   *
   * `castNo` 와 따로 센다. 저건 **날아가는 것**이 있을 때만 올라가서
   * (`throwing`), 도약과 기도에서는 영영 0 이다. 외치는 건 기술 넷 다 한다.
   *
   * 번호와 이름을 **한 덩어리로** 들고 있다. 따로 두면 둘이 어긋나는 순간이
   * 생기고 — 기술이 여럿인 사람이라면 — 검기를 쓰면서 강타를 외친다.
   */
  const [shout, setShout] = useState<{ no: number; name: string }>({ no: 0, name: '' });
  /**
   * 지금 몸이 하고 있는 기술의 **자리**. 평타 중이면 -1.
   *
   * 발밑 표시(`SkillAura`)가 이걸 본다 — 기술마다 표시가 다른데
   * (`SkillDef.aura`), 늘 첫 번째 기술 것을 그리면 두 번째 기술을 쓸 때
   * 엉뚱한 것이 깔린다.
   */
  const [casting, setCasting] = useState(-1);
  /** 이번에 날린 것이 가야 할 거리 — 쏘는 순간 정해진다 */
  const [fly, setFly] = useState(0);

  /** 내디디는 발 — strike 에서만 앞으로 */
  const step = useRef(new Animated.Value(0)).current;
  /** 서 있을 때의 숨쉬기 */
  const bob = useRef(new Animated.Value(0)).current;

  /* 콜백이 바뀌어도 타이머를 다시 걸지 않는다 — 걸면 박자가 리셋된다 */
  const cb = useRef(onSwing);
  cb.current = onSwing;
  const cbAim = useRef(onAim);
  cbAim.current = onAim;
  const cbSkill = useRef(onSkill);
  cbSkill.current = onSkill;

  /** 이 사람이 쓰러졌나 — 파티 전멸과 별개다 */
  const fallen = hp <= 0;

  /**
   * 쓰러진 뒤의 사라짐.
   *
   * 예전에는 쓰러진 자세를 **불투명도 0.3 으로 계속** 띄웠다. 그러면 죽은
   * 사람이 무대에 계속 누워 있어서, 넷 중 둘이 죽으면 화면이 시체로 붐빈다 —
   * 살아 있는 둘이 어느 쪽인지 한눈에 안 들어온다.
   *
   * 쓰러지는 자세를 **잠깐 보여 주고 지운다.** 죽은 것은 한 번 보면 되는
   * 정보이고, 그 뒤로는 자리를 비워 주는 편이 낫다. 되살아나면 즉시 돌아온다.
   */
  const gone = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!fallen) {
      /* 되살아났다 — 기다리지 않고 바로 돌려놓는다 */
      gone.setValue(1);
      setHidden(false);
      return undefined;
    }
    let alive = true;
    setHidden(false);
    gone.setValue(1);
    const a = Animated.sequence([
      /* 쓰러진 자세를 읽을 시간 */
      Animated.delay(FALL_HOLD_MS),
      Animated.timing(gone, {
        toValue: 0, duration: FALL_FADE_MS, useNativeDriver: true,
      }),
    ]);
    a.start(() => { if (alive) setHidden(true); });
    return () => { alive = false; a.stop(); };
  }, [fallen, gone]);

  /*
    맞은 횟수. 늘어날 때마다 몸 위에서 불꽃이 한 번 터진다.

    새 숫자가 뜬 사람이 곧 맞은 사람이므로(`damage` 는 사람별 체력 감소에서
    나온다) 이걸 세는 것만으로 이펙트가 정확한 사람에게 간다. 값 자체는
    `HitBurst` 의 `nonce` 로만 쓰이고, 0 이면 아무것도 안 터진다.
  */
  const [hurtNo, setHurtNo] = useState(0);
  const lastDmg = useRef(-1);
  const hurt = useRef(new Animated.Value(0)).current;
  /*
    도약을 **가로와 세로로 나눠** 굴린다.

    하나로 굴리면 x 와 y 가 같은 시계를 쓰게 되어 반드시 포물선이 된다.
    그런데 이 기술은 포물선이 아니다 — 높이 솟아 적 위에 자리를 잡고,
    거기서 **수직으로** 내리꽂는다. 가로는 올라가는 동안에 다 끝내고,
    떨어지는 동안에는 한 발짝도 안 움직여야 그렇게 보인다.
  */
  const leapX = useRef(new Animated.Value(0)).current;
  const leapY = useRef(new Animated.Value(0)).current;
  const top = damage.length ? damage[damage.length - 1].key : -1;

  useEffect(() => {
    if (top === lastDmg.current) return;
    lastDmg.current = top;
    if (top < 0 || fallen) return;
    setHurtNo((n) => n + 1);
    /* 뒤로 한 번 밀린다 — 불꽃만 터지면 서서 맞는 것처럼 보인다 */
    const a = Animated.sequence([
      Animated.timing(hurt, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(hurt, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [top, fallen, hurt]);

  /*
    화면을 떠날 때 이 사람의 움직임을 전부 멈춘다.

    스윙 루프는 타이머를 치우지만, 그 타이머가 이미 걸어 놓은 애니메이션은
    제 갈 길을 간다 — 내딛는 걸음, 뛰어오르기, 맞고 밀리기. 하나하나 짧지만
    파티가 넷이고 화면을 오갈 때마다 남으므로 여기서 한 번에 정리한다.
  */
  useEffect(() => () => {
    for (const v of [step, hurt, leapX, leapY, bob]) v.stopAnimation();
  }, [step, hurt, leapX, leapY, bob]);

  // ── 숨쉬기 (계속) ──
  useEffect(() => {
    if (down || fallen) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bob, down, fallen]);

  /*
    ── 스윙 ──

    평타와 스킬을 **한 루프에서** 돌린다. 몇 번째 스윙이 스킬이 되는지는 기술이 정한다
    (`SkillDef.every`). 예전에는 스킬이 제 타이머로 따로 돌았는데, 평타 중간에
    끼어들어 프레임을 덮어써서 휘두르다 말고 다른 동작으로 튀었다.
  */
  useEffect(() => {
    /*
      쓰러진 사람은 안 휘두른다.

      전투 계산에서도 쓰러진 사람은 딜을 안 넣는 게 맞겠지만, 지금은 파티
      전체 딜을 한 덩어리로 굴린다 (`core/autoBattle`). 그래서 여기서는
      **보이는 것만** 멈춘다 — 누워 있는 사람이 검을 휘두르면 안 되니까.
    */
    if (down || fallen) { setFrame('lose'); return; }
    setFrame('guard');

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => { if (alive) fn(); }, ms));
    };

    /*
      간격에서 스윙에 안 쓰는 나머지 — 그동안은 서서 기다린다.

      `spd` 는 **간격이 아니라 배수**다 (`ATTACK_BASE_MS`). 한동안 여기서
      그걸 그대로 ms 로 썼는데, 0.8 에서 290 을 빼면 음수라 하한 120ms 에
      걸려서 **모두가 초당 두 번 넘게** 휘둘렀다.
    */
    const beat = swingMs(st.spd);
    const idle = Math.max(120, beat - SWING_MS);

    /** 몇 번째 스윙인가 — `SkillDef.every` 번째마다 평타 대신 기술이 나간다 */
    let n = 0;
    /**
     * 차례가 됐지만 아직 안 나간 기술들의 자리.
     *
     * **한 스윙에 하나만** 나간다 (`nextSkill`). 기술이 여럿인 사람에게
     * 둘 이상이 같은 차례에 걸릴 수 있는데, 한꺼번에 내보내면 그 한 스윙만
     * 피해가 몇 배로 튀고 화면에서는 말풍선과 이펙트가 한 프레임에 겹친다.
     * 밀린 것은 다음 스윙에서 나가므로, 실제 간격은 공격 속도가 정한다.
     *
     * 지금은 한 명당 기술이 하나뿐이라 이 줄은 늘 비어 있다.
     */
    const queue: number[] = [];

    const cycle = () => {
      if (!alive) return;
      n += 1;
      /* 몇 번째마다 나가는지는 기술이 정한다 — 무거운 것일수록 드물다 */
      const list = skillsOf(ch.id);
      /** 이번 스윙에 나갈 기술의 자리. -1 이면 평타다 */
      const slot = nextSkill(ch.id, n, queue);
      const skill = slot >= 0;
      const sk = list[Math.max(0, slot)] ?? skillOf(ch.id);
      setCasting(slot);

      /*
        **이름은 동작이 시작될 때 외친다.**

        맞는 칸(`landAt`)까지 기다리면 이미 다 휘두른 뒤에 말풍선이 뜬다 —
        기도처럼 0.3초를 모으는 기술에서는 특히 늦어서, "뭘 하려는 거지" 가
        지나간 다음에야 답이 나온다. 치켜드는 순간에 외쳐야 순서가 맞다.
      */
      if (skill) setShout((v) => ({ no: v.no + 1, name: sk.name }));

      /* 몸이 통째로 날아가는 기술은 박자가 따로다 — 떠 있는 시간이 곧 높이다 */
      const leaping = skill && sk.leaps;

      const frames: readonly string[] = skill ? SK_FRAMES : CUT_FRAMES;
      const spans = skill ? (sk.beat ?? SK_MS) : CUT_MS;
      const span = spans.reduce((a, b) => a + b, 0);
      /* 평타는 검이 몸 앞을 지날 때, 스킬은 그 기술이 닿는 칸에서 */
      const landAt = skill ? landAtOf(spans, sk.landOn) : HIT_AT;

      /*
        뛰어드는 기술은 **적 쪽으로 크게 나갔다** 돌아온다.

        그림 안에서 점프는 이미 보이지만, 제자리에서 뛰면 "적진으로 뛰어들었다"
        가 아니라 "제자리 점프" 로 읽힌다. 화면에서 실제로 거리를 좁혀야 한다.
      */
      if (leaping) {
        /* 가로 — 솟는 동안에 거리를 다 끝낸다. 떨어질 때는 제자리다 */
        Animated.sequence([
          Animated.timing(leapX, {
            toValue: 1,
            duration: spans[0],
            /* 땅을 차고 나갈 때 제일 빠르고, 꼭대기에서 멎는다 */
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          /* 착지한 자리에 머문다 — 바로 돌아오면 폭발을 볼 새가 없다 */
          Animated.delay(spans[1] + spans[2] + 120),
          Animated.timing(leapX, {
            toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
        ]).start();

        /* 세로 — 올라갔다가, **곧게 가속하며** 떨어진다 */
        Animated.sequence([
          Animated.timing(leapY, {
            toValue: 1, duration: spans[0], easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          Animated.timing(leapY, {
            toValue: 0,
            duration: spans[1],
            /* 떨어질수록 빨라진다 — 이게 "쾅" 을 만든다 */
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }

      /* 칸을 차례로 넘긴다 */
      let t = 0;
      frames.forEach((f, i) => {
        at(t, () => setFrame(f as Frame));
        t += spans[i];
      });

      /*
        피해는 **그림이 닿는 칸**에서 들어간다. 스윙을 시작할 때 알리면
        검이 아직 어깨에 있는데 적이 맞는다.
      */
      /*
        원거리는 **평타도** 날린다.

        활잡이의 화살은 몸을 떠나 적까지 가야 하므로, 검기와 같은 길을 쓴다
        (`SwordWave` → `projSet`). 그래서 피해도 놓는 순간이 아니라 **닿는
        순간**에 들어간다 — 안 그러면 화살이 아직 활 옆에 있는데 적이 죽는다.
      */
      const shooting = !skill && d.range === 'ranged';
      /** 이번 스윙이 뭔가를 날리나 — 화살이든 검기든 */
      const throwing = shooting || (skill && sk.flies);

      /*
        **날릴 것이 있으면 여기서 대상을 정한다.**

        스윙이 시작할 때 정해야 하는 이유는, 날아갈 거리가 곧 날아가는 시간이고
        (`flyMsOf`) 그 시간을 알아야 **닿는 순간**에 피해 타이머를 걸 수 있기
        때문이다. 놓는 순간에 정하면 거리를 모르는 채로 시간을 잡아야 한다.
      */
      const dist = throwing ? cbAim.current(ch.id, skill) : 0;
      /* 멀리 있는 놈을 노렸으면 그만큼 오래 날아간다 — 속도가 고정이다 */
      const reach = flyMsOf(dist);

      if (throwing) at(landAt + reach, () => {
        if (skill) cbSkill.current(ch.id, slot);
        else cb.current({ id: ch.id, fx: d.fx, dmg: st.atk });
      });

      at(landAt, () => {
        if (throwing) { setFly(dist); setCastNo((c) => c + 1); }
        else if (skill) {
          /*
            여기 오는 것은 **날아갈 것이 없는 기술**(도약·기도)뿐이다.
            닿는 칸이 곧 맞는 순간이므로 바로 넣는다.

            날아가는 기술은 위(`throwing`)에서 이미 놓았고, 피해는 그것이
            적에게 닿을 때 들어간다 — 놓자마자 깎으면 검기가 아직 칼 옆에
            있는데 저 끝의 적이 먼저 죽는다.
          */
          cbSkill.current(ch.id, slot);
        } else {
          cb.current({ id: ch.id, fx: d.fx, dmg: st.atk });
        }
        /*
          내디디는 걸음.

          **제자리에서 쓰는 기술은 뺀다.** 도약은 이미 화면을 가로질러
          날아왔으니 한 번 더 밀면 미끄러지고, 기도는 무릎을 꿇고 있는데
          앞으로 나가면 무릎으로 미끄러진다. 발이 움직이는 기술만 내딛는다.
        */
        const steps = !leaping && !(skill && sk.pick === 'none');
        if (steps) {
          Animated.sequence([
            Animated.timing(step, { toValue: 1, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(step, { toValue: 0, duration: Math.max(70, span - landAt - 70), easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]).start();
        }
      });

      at(span, () => setFrame('guard'));
      at(span + idle, cycle);
    };

    /*
      각자 다른 순간에 시작한다.

      간격이 같은 두 캐릭터를 동시에 시작시키면 영영 같이 움직여서 합창단이
      된다. 처음 한 번만 무작위로 어긋내면 그 뒤로는 알아서 흩어진 채로 돈다.
    */
    at(Math.random() * beat, cycle);

    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [ch.id, st.spd, st.atk, d.fx, down, fallen, step, leapX, leapY]);

  /*
    쿼터뷰 깊이.

    뒤에 선 사람은 바닥판 안쪽에 서 있으므로 **위로 올라가고 작아진다**
    (`Ground` 의 `depthAt`). 예전엔 크기만 두 단계로 나눴는데, 그러면
    같은 자리에 선 작은 사람으로 보였다.
  */
  /*
    움직임을 **한 번만** 만든다.

    `interpolate` 는 부를 때마다 값에 가지를 하나 단다. 아래 다섯은 이 사람이
    화면에 서 있는 내내 살아 있는 값이라, 렌더마다 새로 부르면 가지가 끝없이
    쌓인다 — 전투는 0.5초마다 돌고 파티는 넷이므로 한 시간이면 수만 개다.
    화면이 오래 켜져 있을수록 느려지는 것이 이 형태로 나타난다.

    자리(`advance`·`leapTo`)가 실제로 바뀔 때만 다시 만든다. 그건 화면 폭이나
    파티 인원이 바뀔 때뿐이라, 대개 판이 끝날 때까지 한 번이다.
  */
  const stepX = useMemo(() => step.interpolate({
    inputRange: [0, 1],
    /* 붙어 있는 만큼 이미 나가 있고, 칠 때 조금 더 내디딘다 */
    outputRange: [advance, advance + (advance > 0 ? 10 : 6)],
  }), [step, advance]);

  const hurtX = useMemo(() => hurt.interpolate({
    inputRange: [0, 1], outputRange: [0, -6],
  }), [hurt]);

  const leapDX = useMemo(() => leapX.interpolate({
    inputRange: [0, 1], outputRange: [0, leapTo],
  }), [leapX, leapTo]);

  const leapDY = useMemo(() => leapY.interpolate({
    inputRange: [0, 1], outputRange: [0, -LEAP_UP],
  }), [leapY]);

  const bobY = useMemo(() => bob.interpolate({
    inputRange: [0, 1], outputRange: [0, -1.5],
  }), [bob]);

  const { lift, scale } = depthAt(back);
  const size = Math.round(width * scale);
  /* 다 사라진 사람은 아예 안 그린다 — 자리도 안 차지한다 */
  if (hidden && fallen) return null;
  /** 지금 나가는 중인 기술 — 평타 중이면 null */
  const castSk = casting >= 0 ? (skillsOf(ch.id)[casting] ?? null) : null;
  const max = st.hp;
  const ratio = Math.max(0, Math.min(1, hp / Math.max(1, max)));

  return (
    <Animated.View
      style={{
        marginLeft: back === 0 ? 0 : -(16 + squeeze),
        marginBottom: lift,
        /*
          쓰러진 사람만 흐리다.

          예전에는 뒤에 설수록 흐리게 했다 (`1 - back * 0.1`). 깊이를 흐림으로
          말하려던 것인데, 54px 짜리 1-bit 그림에서 흐림은 깊이가 아니라
          **덜 그려진 것**으로 보인다. 깊이는 이미 크기와 높이가 말하고 있다
          (`depthAt`) — 거기에 흐림까지 얹을 이유가 없다.
        */
        /*
          쓰러지면 흐려졌다 사라진다 (`gone`). 파티 전멸(`down`)은 다르다 —
          그때는 넷이 다 누워 있고 곧 일어나므로, 흐리게 남겨 둔다.
        */
        opacity: fallen ? gone : (down ? 0.3 : 1),
        zIndex: 10 - back,
        transform: [
          { translateX: stepX },
          /* 맞으면 뒤로(왼쪽으로) 살짝 밀린다 */
          { translateX: hurtX },
          /* 도약 — 적 쪽(오른쪽)으로. 솟는 동안에 거리를 다 간다 */
          { translateX: leapDX },
          /* 높이. 가로와 **따로** 굴러서 포물선이 아니라 ㄱ 자를 그린다 */
          { translateY: leapDY },
          /* 숨쉬기는 서 있을 때만 — 휘두르는 중에 위아래로 흔들리면 어지럽다 */
          {
            translateY: frame === 'guard'
              ? bobY
              : 0,
          },
        ],
      }}
    >
      {/*
        머리 위 체력 막대.

        `ui/atoms` 의 `Bar` 를 안 쓴다 — 저건 칸을 나눈 블록 막대라 20px 폭에서
        칸 하나가 1px 이 되어 뭉갠다. 여기서는 그냥 채워진 길이로 그린다.

        쓰러지면 막대를 지운다. 빈 막대가 남아 있으면 "체력이 없다" 가 아니라
        "막대가 안 보인다" 로 읽힌다.
      */}
      {/*
        ── 머리 위는 비워 둔다 ──

        여기에 스킬 충전 칸이 있었다. 파티 칸으로 옮겼다 (`PartyBar`) — 기술이
        한 명당 여러 개가 되면 점 몇 개로는 무엇이 차고 있는지 말할 수 없고,
        머리 위에 줄을 여럿 쌓으면 그게 곧 벽이 된다.

        이 자리는 앞으로 **버프·디버프 아이콘**이 쓴다. 그건 반대로 무대에
        있어야 하는 종류다 — 지금 이 사람에게 걸려 있는 것이라, 파티 칸에서
        찾아 읽는 게 아니라 맞는 순간 보여야 한다.
      */}

      {/*
        체력 막대 — **발밑에.**

        머리 위에 있었다. 그런데 머리 위는 이미 붐빈다 — 피해 숫자가 뜨고,
        회복 표시가 올라가고, 스킬 칸이 차 있었다. 막대까지 거기 있으니 숫자가
        뜰 때마다 가려졌고, 정작 "지금 몇 남았나" 를 볼 수 없었다.

        발밑은 비어 있고, 줄이 겹쳐 서도 앞사람 발밑이 뒷사람을 안 가린다.
      */}
      {!fallen && (
        <View
          style={{
            position: 'absolute',
            bottom: -7,
            left: size * 0.12,
            width: size * 0.76,
            height: 4,
            borderWidth: 1,
            borderColor: '#FFFFFF88',
            zIndex: 30,
          }}
        >
          <View
            style={{
              width: `${ratio * 100}%`,
              height: '100%',
              backgroundColor: WHITE,
            }}
          />
        </View>
      )}

      {/*
        캐릭터 제 그림이 있으면 그걸 쓰고, 없으면 공용 기사(`duel`)로 떨어진다.

        캐릭터를 한 명씩 만들고 있어서(`docs/character-art/`), 어느 시점에나
        "제 그림이 있는 사람" 과 "아직 없는 사람" 이 섞여 있다. `fallbackSet` 이
        그걸 알아서 처리하므로 **새 시트를 받을 때마다 코드를 고칠 필요가 없다** —
        `assets/sprites/<id>/` 폴더가 생기는 순간 그 사람만 바뀐다.
      */}
      {/*
        피격 — **맞은 사람 몸 위에서** 터진다.

        숫자가 새로 뜬 사람이 곧 맞은 사람이다 (`BattleView` 가 사람별 체력
        감소를 재서 넘긴다). 그래서 여기에 두면 이펙트가 엉뚱한 사람에게
        갈 수가 없다 — 무대 좌표에 고정으로 그리던 때와 다른 점이다.
      */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: size * 0.18,
          top: size * 0.26,
          zIndex: 38,
        }}
      >
        <HitBurst kind="hurt" size={size * 0.7} nonce={hurtNo} />
      </View>

      {/* 회복 — `+` 표시들이 머리 위에서 쏟아진다 */}
      <HealMarks nonce={bless} size={size} />

      {/*
        맞은 숫자 — **머리 바로 위**에서 뜬다.

        -18 에서 시작해 38px 을 더 떠올랐다. 시작 자리도 높고 올라가는 거리도
        길어서, 숫자가 주인과 한참 떨어진 데 떠 있었다.
      */}
      {damage.map((dm, k) => (
        <View
          key={dm.key}
          pointerEvents="none"
          style={{ position: 'absolute', top: -11 - k * 12, left: size * 0.2, zIndex: 40 }}
        >
          <DamageNumber text={dm.text} dx={0} dy={0} onDone={NOOP} />
        </View>
      ))}

      {/* 걸려 있는 것들 — 머리 바로 위 (`StatusRow`) */}
      <StatusRow status={status} size={size} />

      {/*
        기술 이름 — **머리 위 말풍선** (`SkillShout`).

        `bottom: size` 로 다는 이유는 이 상자의 높이가 곧 `size` 이기 때문이다
        (`Sprite` 만 흐름에 있고 나머지는 전부 절대 배치다). 상수로 박아 두면
        무대가 좁아 인물이 줄어들 때(`width`) 말풍선만 제자리에 남는다.

        좌우로 넘치게 두었다 (`left/right: -16`). 이름이 인물보다 넓을 수
        있는데(`화살비!`), 상자 폭에 가두면 가운데 정렬이 그 안에서만
        일어나서 글자가 줄바꿈되거나 잘린다.

        `zIndex` 는 피해 숫자(40)보다 위다. 둘이 겹치는 순간이 있는데,
        그때 가려져야 하는 건 0.9초짜리 외침이 아니라 계속 뜨는 숫자다.
      */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          /* 상태 로고 줄(`StatusRow`) 위에 앉는다 — 둘이 겹치면 안 된다 */
          bottom: size + 17,
          left: -16,
          right: -16,
          alignItems: 'center',
          zIndex: 46,
        }}
      >
        <SkillShout nonce={shout.no} name={shout.name} />
      </View>

      {/*
        스킬 이펙트 — 휘두르는 동안 발밑에서 빛이 퍼진다.

        네 번에 한 번뿐인 큰 기술인데 몸짓만 바뀌면 평타와 구분이
        잘 안 된다. 발밑 고리 하나로 "지금 뭔가 다른 걸 한다" 가 읽힌다.
      */}
      <SkillAura
        /*
          **지금 나가는 기술**의 표시를 그린다 (`casting`). `frame` 이 이미
          기술 칸인지를 가려 주므로, 평타 중에는 `casting` 이 -1 이 아니어도
          안 켜진다.
        */
        on={castSk !== null && castSk.aura !== 'none' && (frame === 'sk_1' || frame === 'sk_2')}
        kind={castSk?.aura === 'rune' ? 'rune' : 'ring'}
        size={size}
      />

      {/*
        검기 — **검끝에서** 출발한다.

        예전에는 무대 왼쪽 고정 좌표에서 생겼다. 그러면 캐릭터가 앞으로 나가
        있든 뒤에 있든 늘 같은 자리에서 나와서, 검과 따로 놀았다.
        여기(캐릭터 안)에 두면 그 사람이 선 자리에서 자동으로 따라온다.
      */}
      {/*
        날아갈 것이 없는 기술은 여기서 그릴 게 없다. 비앙카의 폭발은
        `sk_3` 그림 안에 이미 들어 있어서, `castNo` 자체가 안 올라간다 —
        이 줄은 그때 `nonce` 가 0 이라 아무것도 안 그린다.
      */}
      {/*
        **하나라도 날아가는 기술이 있으면** 달아 둔다 (`some`).

        지금 쓰는 기술만 보고 달면, 검기가 아직 날아가는 중에 다음 스윙이
        평타로 넘어가면서 이 줄이 통째로 사라진다 — 화면 가운데에서 검기가
        증발한다. 달아 두는 값은 가볍고(`castNo` 가 0 이면 아무것도 안 그린다)
        사라지는 쪽은 눈에 띄므로, 켜 두는 편이 맞다.
      */}
      {(skillsOf(ch.id).some((sk) => sk.flies) || d.range === 'ranged') && (
        <SwordWave charId={ch.id} nonce={castNo} size={size} dist={fly} />
      )}

      <Sprite
        set={ch.id}
        name={frame}
        size={size}
        /*
          **발을 상자 바닥에 맞춘다.**

          `Sprite` 는 정사각 상자에 `contain` 으로 그리므로, 가로가 더 긴 칸은
          상자 안에서 위아래 가운데에 놓인다 — 그만큼 발이 떠 있다. 칸마다
          비율이 달라서(비앙카는 `guard` 가 세로형인데 `sk_3` 은 가로형),
          휘두르는 동안 인물이 위아래로 들썩였다.

          `spriteGap` 이 그 뜬 거리를 알려 준다. 아래로 그만큼 밀면 어느 칸에서든
          발이 같은 높이에 놓인다.
        */
        style={{ transform: [{ translateY: Math.round(size * spriteGap(ch.id, frame)) }] }}
        fallbackSet="duel"
        /* §D 를 아직 안 받았으면 §A 의 세 프레임으로 떨어진다 */
        fallbackName={SK_FALLBACK[frame] ?? CUT_FALLBACK[frame] ?? frame}
      />
    </Animated.View>
  );
}

/**
 * **제 것이 바뀔 때만 다시 그린다.**
 *
 * 무대(`BattleView`)는 0.5초 틱마다 다시 그려진다 — 적 체력이 닳고 시간이
 * 줄기 때문이다. 그때마다 파티원 넷까지 통째로 따라 그려지면, 넷의 스프라이트·
 * 불꽃·숫자·회복 표시가 전부 다시 계산된다. 초당 다섯 번씩.
 *
 * 그런데 이 사람에게 실제로 바뀌는 것은 제 체력과 제 머리 위 숫자뿐이다.
 * 콜백은 붙박이로 만들어 두었으므로(`BattleView` 의 `now` ref) 여기서
 * 걸러 내면 대부분의 틱에서 넷 모두 그대로 지나간다.
 *
 * `damage` 만 배열이라 참조로 비교하면 늘 다르다 — 길이와 맨 끝 키만 본다.
 * 숫자는 뒤에 붙고 앞에서 빠지므로 그 둘이 같으면 같은 목록이다.
 */
export const Fighter = React.memo(FighterView, (a, b) => (
  a.ch === b.ch
  && a.back === b.back
  && a.down === b.down
  && a.hp === b.hp
  && a.bless === b.bless
  /* 배열이라 참조로 비교하면 늘 다르다 — 내용을 이어 붙여 본다 (많아야 넷이다) */
  && a.status.join() === b.status.join()
  && a.squeeze === b.squeeze
  && a.width === b.width
  && a.lap === b.lap
  && a.advance === b.advance
  && a.leapTo === b.leapTo
  && a.onAim === b.onAim
  && a.onSwing === b.onSwing
  && a.onSkill === b.onSkill
  && a.damage.length === b.damage.length
  && a.damage[a.damage.length - 1]?.key === b.damage[b.damage.length - 1]?.key
));
