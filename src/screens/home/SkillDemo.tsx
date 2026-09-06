/**
 * ── 이 기술이 화면에서 어떻게 생겼나 ── 캐릭터 창의 **예시 한 판.**
 *
 * ## 왜 필요한가
 *
 * 기술을 펴면 수치가 열 줄 나온다 (`SkillPanel`) — 코스트 12, 공격력의
 * 300%, 무작위 1마리, 한 대 428. 다 맞는 말인데 그 열 줄 어디에도 **이
 * 기술이 무엇처럼 보이는지**가 없다. 스킬 트리에서 갈래를 고를 때 실제로
 * 알고 싶은 것 중 하나가 그거다 — 성검 발현과 수호신의 가호 중 어느 쪽을
 * 찍을지는 숫자만으로 안 갈린다.
 *
 * 전투에서 보면 되지 않느냐 하면, 코스트 12짜리는 한 판에 두세 번 나가고
 * 그마저 네 명이 동시에 싸우는 화면 한구석에서 0.5초 만에 지나간다.
 *
 * ## 무대를 통째로 안 가져온다
 *
 * `BattleView` 를 줄여 넣는 방법도 있었는데, 저건 스테이지 · 적 목록 · 틱 ·
 * 상태 · 대형을 다 물고 있는 화면이라 창 안에 넣을 물건이 아니다. 여기는
 * **아무것도 계산하지 않는다** — 피해도 안 들어가고 적도 안 죽는다.
 * 인물 둘과 이펙트를 박자에 맞춰 켜고 끄는 것이 전부다.
 *
 * 그래서 이름이 시연이다. 화면에 뜨는 숫자도 옆 줄에 이미 적혀 있는
 * "한 대" 를 그대로 받아 쓴다 (`hit`) — 여기서 따로 세면 같은 창 안에서
 * 두 숫자가 갈린다.
 *
 * ## 박자는 전투 것을 그대로 쓴다
 *
 * `Fighter` 의 `SK_MS` 와 `landAtOf`, `skFramesOf` 를 그대로 부른다. 여기에
 * 숫자를 새로 두면 창에서 본 동작과 실제로 나가는 동작이 갈리는데, 그러면
 * 이 시연이 하려던 일이 통째로 없어진다.
 *
 * ## 쉬지 않고 돈다
 *
 * 한 번만 보여 주고 멈추면 0.5초짜리 동작을 놓친 사람은 창을 닫았다 다시
 * 열어야 한다. `LOOP_MS` 마다 다시 돈다 — 펴 놓은 동안만이라 (`SkillPanel`
 * 이 접으면 이 컴포넌트가 통째로 사라지고 시계도 같이 걷힌다) 배경에서
 * 도는 시계가 쌓일 일은 없다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  CHARS, OwnedChar, SkillDef, blowOf, projFrame, projSet,
} from '@/core/chars';
import { Sprite } from '@/ui/Sprite';
import { T } from '@/ui/atoms';
import { BORDER, LINE, R, SP, SURF } from '@/ui/theme';
import {
  CUT_FALLBACK, SK_FALLBACK, SK_MS, landAtOf, skFramesOf,
} from './Fighter';
import { HolySword, SWORD_HIT, SWORD_MS, SkillFx } from './SkillFx';
import { SkillAura } from './SkillAura';
import { SwordWave } from './SwordWave';
import { DamageNumber, FallingArrow, HealMarks, HitBurst } from './HitFx';

/** 한 바퀴 (ms). 동작이 0.5초라 나머지는 **보고 나서 숨 돌리는 시간**이다 */
const LOOP_MS = 2400;
/** 한 바퀴 안에서 기술이 시작하는 시각 — 앞의 여백이 "가만히 서 있다" 를 만든다 */
const START = 500;

/**
 * 시연 무대의 높이 (px).
 *
 * 인물 키(62)의 두 배 반이다. 무대(423px)만큼 여유를 줄 수는 없지만, 이
 * 정도는 있어야 **하늘에서 내려오는 것**이 내려오는 동안 보인다 — 상자가
 * 인물 키만 하면 성검이 화면 밖에서 한 프레임 만에 박힌다.
 */
const H = 156;
/** 바닥선이 상자 밑에서 얼마나 떠 있나 */
const FLOOR = 12;
/** 쓰는 사람의 몸 길이 */
const ME_W = 62;
/** 맞는 사람의 몸 길이 — 잡몹이라 조금 작다 (무대에서도 그렇다) */
const FOE_W = 52;
/** 좌우 여백 */
const PAD = 16;
/**
 * 둘 사이 거리 (px).
 *
 * 상자 폭은 창에 따라 달라지는데 (`Popup` 안이다) 날아가는 것은 **못 박힌
 * 거리**를 받는다 (`SwordWave` 의 `dist`). 재서 넘기려면 `onLayout` 이
 * 필요하고, 그러면 첫 바퀴는 폭이 0 이라 검기가 제자리에서 사라진다.
 *
 * 좁은 폰(320px)에서도 상자 안에 들어가는 값으로 못 박는다. 넓은 화면에서는
 * 오른쪽이 조금 남는데, 둘이 붙어 서 있는 편이 멀리 떨어져 있는 것보다 이
 * 크기에서 잘 읽힌다.
 */
const SPAN = 150;

/**
 * 시연에 세우는 적.
 *
 * **판과 무관하게 늘 같은 놈**이다. 지금 몇 판인지에 따라 바뀌게 두면 같은
 * 기술을 30판에서 보면 다른 그림이 되는데, 여기는 "이 기술이 어떻게
 * 생겼나" 를 보는 자리지 "지금 누구와 싸우나" 를 보는 자리가 아니다.
 *
 * 제일 처음 만나는 놈으로 둔다 — 누구나 본 적이 있는 몸이라 크기를 가늠할
 * 자가 된다.
 */
const DUMMY = { set: 'cr_slime', name: 'idle' } as const;

/**
 * 성검을 그릴 때 넘기는 몸 길이.
 *
 * `HolySword` 는 받은 길이의 **3.4배**로 검을 그린다 (그쪽 머리말). 적
 * 몸(52)을 그대로 넘기면 177px 짜리 검이 되어 156px 상자를 통째로 넘는다.
 *
 * 무대에서의 비율을 맞춘다 — 저기서는 검이 무대 높이의 0.6배쯤이다
 * (73 × 3.4 = 248, 무대 423). 여기서 같은 비율이면 94 이므로 28 을 넘긴다.
 *
 * 검은 **받은 길이의 상자 안에서 가운데 정렬**을 하므로 (`left`), 적 몸이
 * 아니라 이 길이짜리 상자를 따로 만들어 그 안에 넣는다 — 적 몸을 그대로
 * 넘기면서 길이만 줄이면 검이 왼쪽으로 치우친다.
 */
const SWORD_W = 28;

/** 매 렌더마다 새로 만들면 숫자가 되감긴다 (`HitFx` 참고) */
const NOOP = () => {};

export function SkillDemo({
  c, sk, hit,
}: {
  c: OwnedChar;
  sk: SkillDef;
  /**
   * 머리 위에 띄울 숫자 — **옆 줄에 이미 적힌 "한 대"** 를 그대로 받는다
   * (`SkillPanel`). 여기서 따로 세면 같은 창 안에서 두 숫자가 갈린다.
   */
  hit: number;
}) {
  /** 지금 몸이 어느 칸인가. `null` 이면 쉬는 자세 */
  const [frame, setFrame] = useState<string | null>(null);
  /*
    이펙트마다 제 시계 — 값이 오를 때마다 한 번 돈다.

    하나로 묶을 수가 없다. 넷이 서로 다른 순간에 켜지고 (몸짓이 시작할 때 ·
    베는 칸에서 · 닿는 칸에서 · 검이 꽂힐 때), 같은 값을 보게 하면 넷이
    한꺼번에 튄다.
  */
  const [cast, setCast] = useState(0);
  const [fly, setFly] = useState(0);
  const [land, setLand] = useState(0);
  const [drop, setDrop] = useState(0);
  const [heal, setHeal] = useState(0);
  /*
    한 바퀴에 걸어 두는 시계들.

    갈래의 정리 함수에서 한꺼번에 끈다. 한 자리에 하나만 두면 안 된다 —
    한 바퀴에 다섯 개가 동시에 걸려 있다.
  */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const frames = skFramesOf(c.id, sk);
  /* 때리는 기술인가 — 적 쪽에 그릴 것이 있나 */
  const hurts = sk.pick !== 'none' && sk.heal <= 0;
  /*
    ── 몸에서 뭔가 날아가나 ── 검기 · 거대 화살 (`SkillDef.flies`).

    **활잡이라고 다 날아가는 것이 아니다.** `range === 'ranged'` 는 평타가
    날아간다는 뜻이고 (`Fighter` 의 `shooting`), 기술은 제 깃발을 따로
    가진다. 여기서 둘을 합치면 아녜스의 기도가 슬라임에게 날아간다.
  */
  const flies = sk.flies;
  /*
    ── 위에서 떨어지는 화살 ── 리안느의 화살비.

    날아가지 않는 원거리 기술이 그렇다 (`BattleView` 의 `h.arrow` 와 같은
    조건). 이걸 안 그리면 화살비 시연이 "가만히 서 있다가 적이 터진다" 가
    된다 — 이 기술의 내용이 통째로 빠진다.
  */
  const rains = hurts && CHARS[c.id].range === 'ranged' && !sk.flies;

  useEffect(() => {
    const beats = sk.beat ?? SK_MS;
    const list = skFramesOf(c.id, sk);
    const landAt = START + landAtOf(beats, sk.landOn);
    const at = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };

    const beat = () => {
      at(START, () => { setFrame(list[0]); setCast((n) => n + 1); });
      at(START + beats[0], () => {
        setFrame(list[1]);
        /* 검기는 **베는 칸이 시작할 때** 떠난다 (`Fighter` 의 `WAVE_AT`) */
        if (sk.flies) setFly((n) => n + 1);
      });
      at(START + beats[0] + beats[1], () => setFrame(list[2]));
      /* 닿는 칸 — 기술마다 다르다 (`SkillDef.landOn`) */
      at(landAt, () => {
        if (sk.heal > 0) { setHeal((n) => n + 1); return; }
        /* 하늘에서 내려오는 것은 여기서 **부르기만** 한다 */
        if (sk.drop === 'sword') { setDrop((n) => n + 1); return; }
        if (sk.pick !== 'none') setLand((n) => n + 1);
      });
      /* 그리고 **꽂힐 때** 맞는다 (`SkillFx` 의 `SWORD_HIT`) — 무대와 같은 규칙 */
      if (sk.drop === 'sword') {
        at(landAt + Math.round(SWORD_MS * SWORD_HIT), () => setLand((n) => n + 1));
      }
      at(START + beats[0] + beats[1] + beats[2], () => setFrame(null));
    };

    beat();
    const loop = setInterval(beat, LOOP_MS);
    return () => {
      clearInterval(loop);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setFrame(null);
    };
    /*
      기술이 바뀌면 처음부터 다시 돈다. `sk` 자체를 걸면 매 렌더마다 새
      객체라 갈래가 끝없이 돌므로 (`skillsFor` 가 배열을 새로 만든다)
      이름을 열쇠로 쓴다 — 한 사람 안에서 기술 이름은 안 겹친다.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, sk.name]);

  const foeLeft = PAD + ME_W + SPAN - FOE_W;

  return (
    <View style={{ marginBottom: SP.sm }}>
      <View
        style={[
          BORDER,
          {
            height: H,
            borderRadius: R.md,
            backgroundColor: SURF.down,
            /*
              **넘치는 것은 자른다.** 성검은 몸의 세 배가 넘고 (`SkillFx` 의
              `HolySword`) 거대 화살은 무대 밖까지 나간다 — 창 안에서 그것이
              상자 밖으로 새면 아래 수치 줄 위에 검이 걸린다.
            */
            overflow: 'hidden',
          },
        ]}
      >
        {/* 바닥선 — 둘이 같은 땅을 밟고 있다는 것만 말한다 */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: FLOOR,
            height: 1,
            backgroundColor: LINE.low,
          }}
        />

        {/* ── 쓰는 사람 ── */}
        <View
          style={{
            position: 'absolute', left: PAD, bottom: FLOOR, width: ME_W, height: ME_W,
          }}
        >
          {/*
            발밑 고리 — 기술 동작의 **앞 두 칸에서만** 켠다 (`Fighter` 와
            같은 규칙). 마지막 칸까지 켜 두면 다 끝난 뒤에도 발밑이 빛난다.
          */}
          <SkillAura
            on={frame !== null && sk.aura !== 'none' && frame !== frames[2]}
            kind={sk.aura === 'rune' ? 'rune' : 'ring'}
            size={ME_W}
          />
          <Sprite
            set={c.id}
            name={frame ?? 'guard'}
            size={ME_W}
            fallbackSet="duel"
            fallbackName={
              frame ? (SK_FALLBACK[frame] ?? CUT_FALLBACK[frame] ?? frame) : 'guard'
            }
          />
          {/*
            쓰는 사람 자리에서 도는 것 — 포효 · 광란 · 정화.

            불기둥(`erupt`)만 빼놓는다. 저건 **맞는 놈 발밑**에서 솟는
            것이라 아래 적 쪽에서 그린다.
          */}
          {sk.cast !== 'erupt' && (
            <SkillFx kind={sk.cast} nonce={cast} size={ME_W} />
          )}
          {sk.heal > 0 && <HealMarks nonce={heal} size={ME_W} />}
          {/* 날아가는 것 — 검기와 화살. 몸에서 나가 적 앞에서 멎는다 */}
          {flies && (
            <SwordWave
              charId={c.id}
              nonce={fly}
              size={ME_W}
              dist={SPAN}
              proj={sk.proj}
              mul={sk.projMul}
            />
          )}
        </View>

        {/* ── 맞는 사람 ── */}
        <View
          style={{
            position: 'absolute',
            left: foeLeft,
            bottom: FLOOR,
            width: FOE_W,
            height: FOE_W,
          }}
        >
          <Sprite set={DUMMY.set} name={DUMMY.name} size={FOE_W} />
          {/* 발밑에서 솟는 것 — 화산 하나다 */}
          {sk.cast === 'erupt' && <SkillFx kind="erupt" nonce={cast} size={FOE_W} />}
          {/* 하늘에서 내려오는 것 — 성검 하나다 (`SWORD_W` 참고) */}
          {sk.drop === 'sword' && (
            <View
              style={{
                position: 'absolute',
                left: Math.round((FOE_W - SWORD_W) / 2),
                /* 이 상자의 밑이 곧 적의 발이다 — 칼끝이 거기 박힌다 */
                bottom: 0,
                width: SWORD_W,
                height: SWORD_W,
              }}
            >
              <HolySword nonce={drop} size={SWORD_W} />
            </View>
          )}
          {hurts && land > 0 && (
            <>
              <View style={{ position: 'absolute', left: FOE_W * 0.2, top: FOE_W * 0.3 }}>
                <HitBurst
                  kind={sk.fx ?? CHARS[c.id].fx}
                  size={FOE_W * 0.75}
                  nonce={land}
                />
              </View>
              {/*
                떨어지는 화살은 **가슴 높이**에 꽂는다 — 무대와 같은 값이다
                (`BattleView`). 여기서 잡는 자리는 촉이 꽂힐 점이고, 그림이
                어디에 걸리는지는 `FallingArrow` 가 맞춘다.
              */}
              {rains && (
                <View
                  key={`arrow${land}`}
                  style={{ position: 'absolute', left: FOE_W * 0.5, top: FOE_W * 0.45 }}
                >
                  <FallingArrow
                    set={projSet(c.id)}
                    name={projFrame(c.id)}
                    size={FOE_W * 0.9}
                  />
                </View>
              )}
              {/*
                `key` 에 시계를 물린다 — 숫자는 한 번 뜨고 마는 부품이라
                (`DamageNumber`), 같은 것을 두면 두 바퀴째에 다시 안 뜬다.
              */}
              <View
                key={land}
                style={{
                  position: 'absolute', left: 0, right: 0, top: -13, alignItems: 'center',
                }}
              >
                <DamageNumber text={`-${hit}`} dx={0} dy={0} onDone={NOOP} />
              </View>
            </>
          )}
        </View>
      </View>
      <T size={9} dim="dim" style={{ marginTop: 3 }}>
        {`예시입니다 — 실제로는 ${
          sk.pick === 'none' ? '아군 전체' : '그때 서 있는 적들'
        }에게 걸리고, 숫자는 위의 "한 대" 와 같은 값입니다 (${
          blowOf(c.id, sk).pierce.phys || blowOf(c.id, sk).pierce.magic
            ? '관통이라 상대 방어를 안 탑니다'
            : '실제로는 상대 방어만큼 더 깎입니다'
        }).`}
      </T>
    </View>
  );
}
