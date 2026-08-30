/**
 * 채집 · 수렵 · 낚시 미니게임 (docs/GATHERING_DESIGN.md §2).
 *
 * 셋 다 결과가 **0~100 점수 하나**다. 요구하는 손은 서로 다르다 —
 * 채집은 정밀, 수렵은 속도, 낚시는 지속. 같은 게임에 스킨만 바꾸면 하나 만든 것과 같다.
 *
 * ⚠ 프레임 루프는 `requestAnimationFrame` 으로만 돈다.
 * `setInterval(async)` 는 이 프로젝트에서 이미 레이스를 낸 적이 있어 금지다.
 * 타이머·rAF 핸들은 전부 ref 에 담아 언마운트에서 확실히 끊는다.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Btn, Row, T } from '../atoms';
import { BORDER, C, SP, WHITE } from '../theme';

export interface MinigameProps {
  onDone: (score: number) => void;
  onCancel: () => void;
}

/** 값이 0~1 일 때 폭 비율로 그리는 가로 트랙 */
function Track({ children, height = 34 }: { children: React.ReactNode; height?: number }) {
  return (
    <View style={[BORDER, { height, justifyContent: 'center', overflow: 'hidden' }]}>
      {children}
    </View>
  );
}

/** rAF 루프 — 언마운트/재시작에서 확실히 끊는다 */
function useRaf(tick: (dtMs: number) => void, active: boolean) {
  const cb = useRef(tick);
  cb.current = tick;
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  useEffect(() => {
    if (!active) return;
    last.current = Date.now();
    const step = () => {
      const now = Date.now();
      const dt = now - last.current;
      last.current = now;
      cb.current(dt);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [active]);
}

// ── 채집 — 정밀 ─────────────────────────────────────────
//
// 좌우로 왕복하는 커서를 가운데 좁은 구간에서 세 번 멈춘다. 3회 정확도 평균이 점수.

const GATHER_TRIES = 3;
/** 중앙 구간 반폭 (0~0.5). 이 안이면 점수가 붙는다 */
const GATHER_BAND = 0.12;

export function GatherGame({ onDone, onCancel }: MinigameProps) {
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(1);
  const [hits, setHits] = useState<number[]>([]);
  const posRef = useRef(0);
  const dirRef = useRef(1);

  // 회차가 갈수록 빨라진다 — 세 번 다 잘 맞히기 어려워야 실력 축이 생긴다
  const speed = 0.0011 + hits.length * 0.00035;

  useRaf((dt) => {
    let p = posRef.current + dirRef.current * speed * dt;
    let d = dirRef.current;
    if (p > 1) { p = 1; d = -1; }
    if (p < 0) { p = 0; d = 1; }
    posRef.current = p;
    dirRef.current = d;
    setPos(p);
    setDir(d);
  }, hits.length < GATHER_TRIES);

  const tap = () => {
    if (hits.length >= GATHER_TRIES) return;
    const off = Math.abs(posRef.current - 0.5);
    const acc = Math.max(0, 1 - off / GATHER_BAND);
    const next = [...hits, acc];
    setHits(next);
    if (next.length >= GATHER_TRIES) {
      const avg = next.reduce((a, x) => a + x, 0) / next.length;
      onDone(Math.round(avg * 100));
    }
  };

  void dir;
  return (
    <View>
      <T size={11} dim="sub">가운데 눈금에서 멈추세요 · {hits.length} / {GATHER_TRIES}</T>
      <View style={{ marginTop: SP.sm }}>
        <Track>
          {/* 중앙 구간 */}
          <View style={{
            position: 'absolute',
            left: `${(0.5 - GATHER_BAND) * 100}%`,
            width: `${GATHER_BAND * 200}%`,
            top: 0, bottom: 0,
            backgroundColor: WHITE, opacity: 0.18,
          }} />
          <View style={{
            position: 'absolute', left: '50%', width: 2, top: 0, bottom: 0, backgroundColor: WHITE,
          }} />
          <View style={{
            position: 'absolute', left: `${pos * 100}%`, marginLeft: -2,
            width: 4, top: 2, bottom: 2, backgroundColor: WHITE,
          }} />
        </Track>
      </View>
      <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
        {Array.from({ length: GATHER_TRIES }, (_, i) => (
          <View key={i} style={[BORDER, { flex: 1, paddingVertical: 2, alignItems: 'center' }]}>
            <T size={10} dim={hits[i] === undefined ? 'dim' : 'full'}>
              {hits[i] === undefined ? '—' : `${Math.round(hits[i] * 100)}`}
            </T>
          </View>
        ))}
      </Row>
      <Btn label="멈춘다" size="lg" fill style={{ marginTop: SP.md }} onPress={tap} />
      <Btn label="그만두기" size="sm" style={{ marginTop: SP.xs }} onPress={onCancel} />
    </View>
  );
}

// ── 수렵 — 속도 ─────────────────────────────────────────
//
// 짐승이 네 번 자리를 옮긴다. 나타날 때마다 맞힌다. 명중 수 + 반응 속도가 점수.

const HUNT_ROUNDS = 4;
const HUNT_WINDOW = 1100;
const HUNT_GRID = 9;

export function HuntGame({ onDone, onCancel }: MinigameProps) {
  const [round, setRound] = useState(0);
  const [cell, setCell] = useState(-1);
  const [scores, setScores] = useState<number[]>([]);
  /**
   * setScores 의 updater 안에서 next() 를 부르면 안 된다 — updater 는 순수해야 하는데
   * next() 가 다시 상태를 건드려, 렌더 도중 다른 컴포넌트를 갱신했다는 에러가 난다.
   * 진행 중인 점수는 ref 로 들고 다니고 setScores 는 화면 표시용으로만 쓴다.
   */
  const scoresRef = useRef<number[]>([]);
  const shownAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const finish = useCallback((all: number[]) => {
    const avg = all.reduce((a, x) => a + x, 0) / HUNT_ROUNDS;
    onDone(Math.round(avg * 100));
  }, [onDone]);

  const next = useCallback((done: number[]) => {
    if (!alive.current) return;
    if (done.length >= HUNT_ROUNDS) { finish(done); return; }
    setRound(done.length + 1);
    setCell(-1);
    // 언제 나올지 모르게 — 예측하면 반응 속도가 아니라 리듬 게임이 된다
    timer.current = setTimeout(() => {
      if (!alive.current) return;
      setCell(Math.floor(Math.random() * HUNT_GRID));
      shownAt.current = Date.now();
      timer.current = setTimeout(() => {
        if (!alive.current) return;
        setCell(-1);
        const missed = [...scoresRef.current, 0];
        scoresRef.current = missed;
        setScores(missed);
        next(missed);
      }, HUNT_WINDOW);
    }, 400 + Math.random() * 900);
  }, [finish]);

  useEffect(() => {
    alive.current = true;
    scoresRef.current = [];
    next([]);
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
    // 한 번만 시작한다 — next 를 의존성에 넣으면 매 렌더마다 새 판이 시작된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hit = (i: number) => {
    if (i !== cell) return;
    if (timer.current) clearTimeout(timer.current);
    const react = Date.now() - shownAt.current;
    const acc = Math.max(0.35, 1 - react / HUNT_WINDOW);
    setCell(-1);
    const n = [...scoresRef.current, acc];
    scoresRef.current = n;
    setScores(n);
    next(n);
  };

  return (
    <View>
      <T size={11} dim="sub">나타나면 바로 누르세요 · {round} / {HUNT_ROUNDS}</T>
      <View style={{ marginTop: SP.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: HUNT_GRID }, (_, i) => (
          <Pressable
            key={i}
            onPress={() => hit(i)}
            style={[BORDER, {
              width: '32.5%', aspectRatio: 1, margin: '0.4%',
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: cell === i ? C.bgInv : 'transparent',
            }]}
          >
            {cell === i && <T size={20} bold style={{ color: C.fgInv }}>◆</T>}
          </Pressable>
        ))}
      </View>
      <T size={10} dim="dim" style={{ marginTop: SP.xs }}>
        명중 {scores.filter((x) => x > 0).length} / {scores.length}
      </T>
      <Btn label="그만두기" size="sm" style={{ marginTop: SP.sm }} onPress={onCancel} />
    </View>
  );
}

// ── 낚시 — 지속 ─────────────────────────────────────────
//
// 누르면 마커가 올라가고 놓으면 내려간다. 물고기 위에 붙들어 둔 시간 비율이 점수.

const FISH_MS = 9000;
const FISH_ZONE = 0.14;

export function FishGame({ onDone, onCancel }: MinigameProps) {
  const [marker, setMarker] = useState(0.5);
  const [fish, setFish] = useState(0.5);
  const [left, setLeft] = useState(FISH_MS);
  const [held, setHeld] = useState(0);

  const markerRef = useRef(0.5);
  const velRef = useRef(0);
  const fishRef = useRef(0.5);
  const fishVel = useRef(0.0004);
  const leftRef = useRef(FISH_MS);
  const heldRef = useRef(0);
  const pressing = useRef(false);
  const doneRef = useRef(false);

  useRaf((dt) => {
    if (doneRef.current) return;
    const d = Math.min(50, dt);   // 탭 전환 등으로 프레임이 튀면 물리가 폭발한다

    // 마커 — 누르면 위로, 놓으면 중력
    velRef.current += (pressing.current ? -0.000018 : 0.000012) * d;
    velRef.current *= 0.94;
    let m = markerRef.current + velRef.current * d;
    if (m < 0) { m = 0; velRef.current = 0; }
    if (m > 1) { m = 1; velRef.current = 0; }
    markerRef.current = m;

    // 물고기 — 제멋대로 움직인다
    if (Math.random() < 0.02) fishVel.current = (Math.random() - 0.5) * 0.0012;
    let f = fishRef.current + fishVel.current * d;
    if (f < 0.05) { f = 0.05; fishVel.current *= -1; }
    if (f > 0.95) { f = 0.95; fishVel.current *= -1; }
    fishRef.current = f;

    if (Math.abs(m - f) < FISH_ZONE) heldRef.current += d;

    leftRef.current -= d;
    setMarker(m);
    setFish(f);
    setHeld(heldRef.current);
    setLeft(Math.max(0, leftRef.current));

    if (leftRef.current <= 0) {
      doneRef.current = true;
      onDone(Math.round(Math.min(1, heldRef.current / (FISH_MS * 0.7)) * 100));
    }
  }, true);

  const on = Math.abs(marker - fish) < FISH_ZONE;
  return (
    <View>
      <T size={11} dim="sub">
        눌러서 마커를 물고기에 붙들어 두세요 · {(left / 1000).toFixed(1)}초
      </T>
      <Pressable
        onPressIn={() => { pressing.current = true; }}
        onPressOut={() => { pressing.current = false; }}
        style={[BORDER, { height: 220, marginTop: SP.sm, overflow: 'hidden' }]}
      >
        {/* 물고기 */}
        <View style={{
          position: 'absolute', top: `${fish * 100}%`, marginTop: -10,
          left: 0, right: 0, height: 20, alignItems: 'center', justifyContent: 'center',
        }}>
          <T size={16} bold>◄►</T>
        </View>
        {/* 마커 */}
        <View style={{
          position: 'absolute', top: `${marker * 100}%`, marginTop: -14,
          left: 6, width: 12, height: 28,
          backgroundColor: on ? WHITE : 'transparent',
          borderWidth: 1, borderColor: WHITE,
        }} />
      </Pressable>
      <View style={{ marginTop: SP.xs }}>
        <Track height={10}>
          <View style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${Math.min(100, (held / (FISH_MS * 0.7)) * 100)}%`,
            backgroundColor: WHITE, opacity: 0.7,
          }} />
        </Track>
      </View>
      <Btn label="그만두기" size="sm" style={{ marginTop: SP.sm }} onPress={onCancel} />
    </View>
  );
}
