import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { create } from 'zustand';
import { useGame } from '@/state/store';
import { INTRO_KEY, type TutorialDef, type TutorialStep, tutorialOf } from '@/core/tutorial';
import { Btn, Row, T } from './atoms';
import { Sprite } from './Sprite';
import { C, O, SP, WHITE } from './theme';
import { sfx } from './sfx';
import { useBackClose } from './backGuard';

/**
 * 튜토리얼 오버레이.
 *
 * 문구는 core/tutorial.ts 가, **띄울지 말지와 어떻게 보일지**는 여기가 정한다.
 *
 * 설계에서 제일 고민한 건 "무엇을 가리킬까" 다. 화면마다 ref 를 심어 좌표를 재는
 * 방식이 제일 예쁘지만, 화면이 서른 장이라 전부 손보면 그 자체가 부채가 된다.
 * 그래서 **앵커는 선택 사항**으로 만들었다:
 *   · `<TutorialAnchor id="home-slots">` 로 감싼 곳은 실제로 그 자리에 구멍이 뚫리고
 *     설명 카드가 그 옆에 붙는다.
 *   · 앵커가 없거나 아직 안 그려졌으면 조용히 **가운데 카드**로 떨어진다.
 * 화면을 고치다 앵커가 사라져도 튜토리얼이 깨지지 않는다 — 덜 예뻐질 뿐이다.
 */

// ── 진행 상태 ──────────────────────────────────────────
interface RunState {
  /** 지금 돌고 있는 튜토리얼 키 (null = 없음) */
  key: string | null;
  step: number;
  open: (key: string) => void;
  next: () => void;
  close: () => void;
}

const useRun = create<RunState>()((set) => ({
  key: null,
  step: 0,
  open: (key) => set({ key, step: 0 }),
  next: () => set((s) => ({ step: s.step + 1 })),
  close: () => set({ key: null, step: 0 }),
}));

// ── 앵커 등록소 ────────────────────────────────────────
export interface Rect { x: number; y: number; w: number; h: number }

interface AnchorState {
  rects: Record<string, Rect>;
  put: (id: string, r: Rect) => void;
  drop: (id: string) => void;
}

/**
 * 앵커 좌표는 게임 상태가 아니다 — 저장하지 않고, 화면이 사라지면 같이 사라진다.
 * 별도 스토어로 둔 이유는 튜토리얼이 열려 있지 않아도 등록이 일어나기 때문이다.
 */
const useAnchors = create<AnchorState>()((set) => ({
  rects: {},
  put: (id, r) => set((s) => ({ rects: { ...s.rects, [id]: r } })),
  drop: (id) => set((s) => {
    const next = { ...s.rects };
    delete next[id];
    return { rects: next };
  }),
}));

/**
 * 튜토리얼이 가리킬 수 있는 영역.
 *
 * 감싸기만 하면 된다 — 레이아웃에 영향을 주지 않는다(`onLayout` 만 붙인다).
 * ⚠ `measureInWindow` 를 쓴다. `onLayout` 의 좌표는 **부모 기준**이라
 * ScrollView 안에서는 화면 좌표와 어긋난다.
 */
export function TutorialAnchor({ id, children, style }: { id: string; children: React.ReactNode; style?: object }) {
  const put = useAnchors((s) => s.put);
  const drop = useAnchors((s) => s.drop);
  const running = useRun((s) => s.key);
  const step = useRun((s) => s.step);
  const ref = useRef<View>(null);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, w, h) => {
      if (w > 0 && h > 0) put(id, { x, y, w, h });
    });
  }, [id, put]);

  useEffect(() => () => drop(id), [id, drop]);

  const onLayout = useCallback((_e: LayoutChangeEvent) => {
    // 다음 프레임에 재야 스크롤 위치까지 반영된 좌표가 나온다
    requestAnimationFrame(measure);
  }, [measure]);

  /*
    onLayout 한 번으로는 부족하다. 첫 레이아웃 때 잰 좌표는 그 위의 패널들이
    아직 자리를 못 잡은 상태라 실제보다 위로 밀려 있고, 그 틀린 좌표로 구멍이
    뚫리면 엉뚱한 데가 밝아진다 (실측: 85px 어긋났다).
    그래서 **튜토리얼이 열리는 순간 다시 잰다** — 그때는 화면이 다 그려져 있다.
  */
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  }, [running, step, measure]);

  return <View ref={ref} style={style} onLayout={onLayout} collapsable={false}>{children}</View>;
}

/**
 * 화면에서 부르는 훅 — 한 줄이면 끝난다.
 *
 *   export default function ShopScreen() {
 *     useTutorial('shop');
 *     ...
 *
 * 처음 들어왔을 때만, 튜토리얼을 끄지 않았을 때만 뜬다.
 * 다른 튜토리얼이 이미 떠 있으면 끼어들지 않는다 (첫 진입 안내가 최우선이다).
 */
export function useTutorial(key: string) {
  const seen = useGame((s) => s.tutorialSeen);
  const off = useGame((s) => s.tutorialOff);
  const signedUp = useGame((s) => s.signedUp);
  const running = useRun((s) => s.key);
  const open = useRun((s) => s.open);

  useEffect(() => {
    if (off || !signedUp) return;
    if (seen.includes(key)) return;
    if (running) return;
    if (!tutorialOf(key)) return;
    /*
      첫 진입 안내가 항상 먼저다.
      인트로는 App(Root)이, 화면 안내는 그 화면이 예약하는데 둘 다 같은 순간에 마운트된다.
      React 는 자식 이펙트를 부모보다 먼저 돌리므로, 그냥 두면 **홈 안내가 인트로를
      이겨 버린다** (실측). 아직 인트로를 안 본 사람에게는 다른 안내를 아예 예약하지
      않는다 — 인트로를 다 보면 `seen` 이 바뀌어 이 훅이 다시 돌고, 그때 열린다.
    */
    if (key !== INTRO_KEY && !seen.includes(INTRO_KEY)) return;
    /*
      화면 전환 애니메이션이 끝난 뒤에 띄운다. 바로 띄우면 아직 안 그려진 앵커를
      가리키게 되고, 화면이 미끄러져 들어오는 중에 오버레이가 얹혀 어지럽다.
    */
    const t = setTimeout(() => open(key), 420);
    return () => clearTimeout(t);
  }, [key, seen, off, signedUp, running, open]);
}

/** 첫 진입 안내를 예약한다 (회원가입 직후 App 이 부른다) */
export const useIntroTutorial = () => useTutorial(INTRO_KEY);

/**
 * 지금 튜토리얼이 떠 있는가.
 * 다른 오버레이(이벤트 팝업)가 **순서를 양보**하기 위해 본다 —
 * 처음 켠 사람은 이벤트보다 조작을 먼저 배워야 한다.
 */
export const useTutorialRunning = () => useRun((s) => s.key !== null);

// ── 오버레이 ───────────────────────────────────────────
/** 구멍 둘레 여백 */
const HOLE_PAD = 6;

/** 설명 카드가 눌리지 않고 들어가려면 최소 이만큼은 비어 있어야 한다 */
const MIN_CARD_ROOM = 180;

/**
 * 이 앵커를 정말 가리켜도 되는가.
 *
 * 앵커 좌표는 화면이 다 그려지기 전이나 스크롤 중에도 등록된다. 그래서 그냥
 * 믿고 쓰면 구멍이 엉뚱한 데 뚫린다. 실제로 본 세 가지:
 *
 *   · **화면 밖** — 스크롤을 내려 앵커가 위로 빠져나가면 `y` 가 음수가 된다.
 *     그 좌표로 카드를 붙이면 `bottom` 이 화면 높이를 넘어 카드가 위로 잘려 나간다.
 *   · **화면을 거의 다 덮음** — `town-map` 은 `flex: 1` 이라 지도 전체가 앵커다.
 *     그걸 가리키면 스크림에 뚫을 곳이 안 남아서 "아무것도 안 밝은" 화면이 되고,
 *     카드는 남은 몇 픽셀 틈에 끼어 이상한 자리에 뜬다.
 *   · **너무 작음** — 아직 안 그려진 뷰가 1~2px 로 잠깐 잡힌다.
 *
 * 셋 다 답은 같다: **가리키지 않는다.** 앵커가 없을 때와 똑같이 가운데 카드로
 * 떨어진다 — 덜 예쁠 뿐, 어긋난 곳을 가리키는 것보다 낫다.
 */
function usableRect(rect: Rect | undefined, width: number, height: number): Rect | undefined {
  if (!rect) return undefined;
  if (rect.w < 8 || rect.h < 8) return undefined;
  // 네 변이 모두 화면 안에 있어야 한다 (조금 걸치는 건 봐 준다)
  const SLACK = 4;
  if (rect.x < -SLACK || rect.y < -SLACK) return undefined;
  if (rect.x + rect.w > width + SLACK || rect.y + rect.h > height + SLACK) return undefined;
  // 화면의 3/4 을 넘게 덮으면 가리키는 의미가 없다
  if (rect.w * rect.h > width * height * 0.75) return undefined;
  // 카드가 들어갈 자리가 위아래 어느 쪽에도 없으면 포기한다
  const room = Math.max(rect.y, height - (rect.y + rect.h));
  if (room < MIN_CARD_ROOM) return undefined;
  return rect;
}


/** 앱 루트에 한 번만 둔다 */
export function TutorialHost() {
  const key = useRun((s) => s.key);
  const step = useRun((s) => s.step);
  const next = useRun((s) => s.next);
  const close = useRun((s) => s.close);
  const rects = useAnchors((s) => s.rects);
  const mark = useGame((s) => s.markTutorial);
  const setOff = useGame((s) => s.setTutorialOff);
  const { width, height } = useWindowDimensions();

  const def = key ? tutorialOf(key) : null;
  const cur: TutorialStep | undefined = def?.steps[step];

  // 단계를 다 넘겼으면 본 것으로 기록하고 닫는다
  useEffect(() => {
    if (def && !cur) {
      mark(def.key);
      close();
    }
  }, [def, cur, mark, close]);

  /* 휴대폰의 뒤로가기로도 닫힌다 (`ui/backGuard`) — 훅이라 이른 return 보다 먼저 */
  useBackClose(!!def && !!cur, () => {
    if (!def) return;
    sfx('click');
    mark(def.key);
    close();
  });

  if (!def || !cur) return null;

  const last = step === def.steps.length - 1;
  const rect = usableRect(cur.anchor ? rects[cur.anchor] : undefined, width, height);

  const finish = (all: boolean) => {
    sfx('click');
    mark(def.key);
    if (all) setOff(true);
    close();
  };

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => finish(false)}>
      <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)} style={StyleSheet.absoluteFill}>
        <Scrim rect={rect} width={width} height={height} />
        {!!rect && <Spotlight rect={rect} />}

        <View style={[styles.cardHost, cardPosition(rect, height)]} pointerEvents="box-none">
          <View style={styles.card}>
            <Row between style={styles.cardHead}>
              <Row gap={SP.xs}>
                {/* 화면 어딘가를 가리키는 단계라는 표시. 전용 아이콘이 오면 갈아탄다 */}
                {!!rect && (
                  <Sprite set="tutorial" name="tap" size={14} fallbackSet="map_pin" fallbackName="here" />
                )}
                <T size={10} dim="sub">{def.title}</T>
              </Row>
              <T size={10} dim="dim">{step + 1} / {def.steps.length}</T>
            </Row>

            <View style={{ padding: SP.md }}>
              <Row gap={SP.md} style={{ alignItems: 'flex-start' }}>
                {!!cur.art && (
                  <View style={styles.art}>
                    <Sprite set={cur.art[0] as never} name={cur.art[1]} size={40} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <T size={14} bold>{cur.title}</T>
                  <T size={12} dim="sub" style={{ marginTop: SP.xs, lineHeight: 18 }}>{cur.body}</T>
                </View>
              </Row>

              {/* 진행 점 — 몇 장 남았는지가 숫자보다 먼저 읽힌다 */}
              <Row gap={4} style={{ marginTop: SP.md, justifyContent: 'center' }}>
                {def.steps.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: i === step ? 14 : 6,
                      height: 6,
                      backgroundColor: WHITE,
                      opacity: i === step ? O.full : O.faint,
                    }}
                  />
                ))}
              </Row>

              <Row gap={SP.sm} style={{ marginTop: SP.md }}>
                <Btn
                  label="건너뛰기"
                  size="sm"
                  sound="click"
                  style={{ flex: 1 }}
                  onPress={() => finish(false)}
                />
                <Btn
                  label={last ? '시작하기' : '다음'}
                  size="sm"
                  fill
                  sound="click"
                  style={{ flex: 2 }}
                  onPress={() => (last ? finish(false) : next())}
                />
              </Row>

              {/* 전체 끄기는 첫 진입 안내에서만 — 매 화면마다 물으면 잔소리가 된다 */}
              {def.key === INTRO_KEY && (
                <Pressable onPress={() => finish(true)} style={{ marginTop: SP.sm, alignSelf: 'center' }} hitSlop={8}>
                  <T size={10} dim="dim">튜토리얼 전부 끄기</T>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

/**
 * 어두운 막.
 *
 * 구멍을 뚫어야 하는데 RN 에는 마스크가 없다. 그래서 **네 조각으로 나눠** 구멍
 * 자리만 비운다 (위·아래·왼쪽·오른쪽). 반투명 뷰를 겹치면 겹친 부분만 더 어두워져
 * 격자가 보이므로, 조각끼리 절대 겹치지 않게 자른다.
 */
function Scrim({ rect, width, height }: { rect?: Rect; width: number; height: number }) {
  if (!rect) return <View style={[StyleSheet.absoluteFill, styles.scrim]} />;
  const x = rect.x - HOLE_PAD;
  const y = rect.y - HOLE_PAD;
  const w = rect.w + HOLE_PAD * 2;
  const h = rect.h + HOLE_PAD * 2;
  return (
    <>
      <View style={[styles.scrim, { position: 'absolute', left: 0, top: 0, right: 0, height: Math.max(0, y) }]} />
      <View style={[styles.scrim, { position: 'absolute', left: 0, top: y + h, right: 0, height: Math.max(0, height - y - h) }]} />
      <View style={[styles.scrim, { position: 'absolute', left: 0, top: y, width: Math.max(0, x), height: h }]} />
      <View style={[styles.scrim, { position: 'absolute', left: x + w, top: y, width: Math.max(0, width - x - w), height: h }]} />
    </>
  );
}

/** 구멍 테두리 — 2px 흰 선. 도트 감성이라 모서리는 각지게 둔다 */
function Spotlight({ rect }: { rect: Rect }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: rect.x - HOLE_PAD,
        top: rect.y - HOLE_PAD,
        width: rect.w + HOLE_PAD * 2,
        height: rect.h + HOLE_PAD * 2,
        borderWidth: 2,
        borderColor: WHITE,
      }}
    />
  );
}

/**
 * 카드는 구멍을 가리면 안 된다.
 * 구멍이 화면 위쪽이면 카드를 아래로, 아래쪽이면 위로 붙인다.
 */
function cardPosition(rect: Rect | undefined, height: number) {
  if (!rect) return { top: 0, bottom: 0, justifyContent: 'center' as const };
  /*
    구멍의 위아래 중 **넓은 쪽**에 붙인다. 예전엔 "화면 절반보다 위면 아래에"
    였는데, 화면 아래쪽을 길게 차지하는 앵커(목록 전체 같은)에서는 위가 더
    넓은데도 아래에 붙어서 카드가 눌려 찌그러졌다.
  */
  const above = rect.y;
  const below = height - (rect.y + rect.h);
  const gap = HOLE_PAD * 2 + SP.md;
  return below >= above
    ? { top: Math.min(height - MIN_CARD_ROOM, rect.y + rect.h + gap), bottom: 0, justifyContent: 'flex-start' as const }
    : { top: 0, bottom: Math.min(height - MIN_CARD_ROOM, height - rect.y + gap), justifyContent: 'flex-end' as const };
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: '#000000E6' },
  cardHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: SP.md,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: WHITE,
  },
  cardHead: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: WHITE,
  },
  art: {
    borderWidth: 1,
    borderColor: WHITE,
    padding: SP.xs,
  },
});

export type { TutorialDef };
