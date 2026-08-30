/**
 * 효과음.
 *
 * 소리는 `tools/gen-sfx.py` 가 합성한다 (assets/sfx/*.wav). 톤은 **중세 철기방**이다 —
 * 모루·망치·사슬·가죽·동전. 밝고 둥근 아케이드 톤은 흑백 도트 화면과 따로 논다.
 *
 * 설계 규칙
 *   · 호출부는 `sfx('tap')` 한 줄이면 끝난다. 실패해도 절대 던지지 않는다 —
 *     소리가 안 난다고 강화가 막히면 안 된다.
 *   · 플레이어는 **소리마다 하나씩** 만들어 재사용한다. 매번 만들면 첫 재생이
 *     늦어 손가락과 소리가 어긋난다 (버튼 소리는 20ms 만 늦어도 티가 난다).
 *   · 음소거는 이 모듈의 모듈 변수로 둔다. 스토어를 import 하면 core → ui 방향의
 *     의존이 꼬이고, 소리 하나 내려고 리렌더를 구독하게 된다.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type SfxId =
  | 'tap'      // 버튼 — 가장 자주 난다. 제일 조용하고 짧다
  | 'click'    // 선택·토글
  | 'hammer'   // 강화 시도
  | 'success'  // 강화 성공
  | 'fail'     // 강화 실패
  | 'break'    // 장비 파괴
  | 'coin'     // 사고 팔고 받고
  | 'blade'    // 전투 타격
  | 'forge'    // 제련·승급·해방
  | 'open';    // 팝업·장부

/**
 * ⚠ require 는 정적이어야 한다 — 메트로 번들러는 변수를 넣은 require 를 못 따라간다.
 * 그래서 map 을 손으로 적는다.
 */
const SOURCES: Record<SfxId, number> = {
  tap: require('../../assets/sfx/tap.wav'),
  click: require('../../assets/sfx/click.wav'),
  hammer: require('../../assets/sfx/hammer.wav'),
  success: require('../../assets/sfx/success.wav'),
  fail: require('../../assets/sfx/fail.wav'),
  break: require('../../assets/sfx/break.wav'),
  coin: require('../../assets/sfx/coin.wav'),
  blade: require('../../assets/sfx/blade.wav'),
  forge: require('../../assets/sfx/forge.wav'),
  open: require('../../assets/sfx/open.wav'),
};

/**
 * 소리별 음량.
 *
 * 전부 같은 크기로 내면 버튼 소리가 강화 성공만큼 크게 들려서 금방 피곤해진다.
 * **자주 나는 소리일수록 작게** — 그래야 가끔 나는 소리가 사건처럼 들린다.
 *
 * 처음 잡은 값(tap 0.28 ~ break 0.9)은 전반적으로 너무 컸다. 배경음까지 깔리면
 * 버튼 소리가 음악을 뚫고 튀어나온다. 전 구간을 **절반 아래로** 내렸는데,
 * 이번엔 폰 스피커에서 잘 안 들린다는 말이 나왔다. 비율은 그대로 두고
 * 전 구간에 같은 배율(×1.5)만 곱해 올린다 — 비율을 손대면 위에 적은
 * "자주 나는 소리일수록 작게" 가 무너진다.
 */
const GAIN: Record<SfxId, number> = {
  tap: 0.15, click: 0.20, hammer: 0.45, success: 0.54, fail: 0.36,
  break: 0.57, coin: 0.30, blade: 0.42, forge: 0.54, open: 0.22,
};

let enabled = true;
let modeSet = false;
const players: Partial<Record<SfxId, AudioPlayer>> = {};

/**
 * 사용자 음량 (0~1).
 *
 * 위의 `GAIN` 표에 **곱해진다.** 표를 직접 갈아치우지 않는 게 핵심이다 —
 * 표는 "자주 나는 소리일수록 작게" 라는 균형이고, 사용자가 조절하는 건
 * 그 균형을 유지한 채 전체를 올리고 내리는 손잡이다. 표를 건드리면 볼륨을
 * 반으로 줄였을 때 균형까지 같이 무너진다.
 *
 * 0 이면 꺼진 것과 같지만 `enabled` 와는 별개로 둔다 — 껐다 켰을 때
 * 맞춰 둔 음량이 그대로 돌아와야 한다.
 */
let sfxVol = 1;
let bgmVol = 1;

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1);

/** 음소거 상태를 바꾼다. 스토어(설정 화면)가 부른다 */
export function setSfxEnabled(on: boolean) {
  enabled = on;
}

export function isSfxEnabled() {
  return enabled;
}

/**
 * 효과음 음량. 이미 만들어 둔 플레이어들의 음량도 그 자리에서 갱신한다 —
 * 안 그러면 슬라이더를 움직여도 **다음에 처음 나는 소리부터** 반영돼,
 * 조절하는 동안에는 아무 변화가 없는 것처럼 느껴진다.
 */
export function setSfxVolume(v: number) {
  sfxVol = clamp01(v);
  for (const id of Object.keys(players) as SfxId[]) {
    const p = players[id];
    if (!p) continue;
    try { p.volume = GAIN[id] * sfxVol; } catch { /* 무시 */ }
  }
}

export const getSfxVolume = () => sfxVol;

/** 배경음 음량 */
export function setBgmVolume(v: number) {
  bgmVol = clamp01(v);
  try { if (bgm) bgm.volume = BGM_GAIN * bgmVol; } catch { /* 무시 */ }
}

export const getBgmVolume = () => bgmVol;

function playerFor(id: SfxId): AudioPlayer | null {
  const cached = players[id];
  if (cached) return cached;
  try {
    const p = createAudioPlayer(SOURCES[id]);
    p.volume = GAIN[id] * sfxVol;
    players[id] = p;
    return p;
  } catch {
    return null;
  }
}

/**
 * 효과음 한 번.
 *
 * 이미 울리는 중이면 처음으로 되감아 다시 낸다 — 연타할 때 소리가 안 나면
 * 버튼이 안 눌린 것처럼 느껴진다.
 */
export function sfx(id: SfxId) {
  if (!enabled) return;
  try {
    /**
     * 다른 앱의 음악을 끊지 않는다. 이 게임은 소리가 주인공이 아니라서,
     * 음악을 들으며 하는 사람의 재생을 멈추면 그냥 민폐다.
     * (iOS 무음 스위치도 존중한다 — playsInSilentMode 를 켜지 않는다)
     */
    if (!modeSet) {
      modeSet = true;
      void setAudioModeAsync({ shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' })
        .catch(() => {});
    }
    const p = playerFor(id);
    if (!p) return;
    // 음량 0 은 "안 들린다" 가 아니라 **재생하지 않는다** 로 처리한다.
    // 0 짜리 소리를 계속 틀면 기기에 따라 오디오 세션만 붙잡고 있게 된다
    if (sfxVol <= 0) return;
    void p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // 소리는 부가 기능이다 — 어떤 이유로든 실패해도 게임은 계속된다
  }
}

// ── 배경음 ─────────────────────────────────────────────
/**
 * 배경음.
 *
 * 음량이 이 기능의 전부다. 게임 음악은 **있는 줄 모르게** 깔려야 한다 —
 * 존재감이 생기는 순간 끄고 싶어진다. 효과음(0.15~0.57)보다 낮게 두어
 * 망치질이 음악을 뚫고 나오게 한다. 0.085 는 폰 스피커에서 거의 안 들려
 * 0.14 로 올렸다 — 그래도 제일 조용한 효과음(tap 0.15)보다 아래다.
 *
 * 끝나면 처음부터 다시 돈다 (`loop`). 어떤 이유로든 멈춰 있으면
 * 다음 확인 때 되살린다 — 백그라운드 전환·오디오 세션 뺏김 뒤에도
 * 조용해진 채로 남지 않게.
 */
const BGM_GAIN = 0.14;

let bgm: AudioPlayer | null = null;
let bgmOn = true;

function bgmPlayer(): AudioPlayer | null {
  if (bgm) return bgm;
  try {
    const p = createAudioPlayer(require('../../assets/bgm.mp3'));
    p.loop = true;
    p.volume = BGM_GAIN * bgmVol;
    bgm = p;
    return p;
  } catch {
    return null;
  }
}

/** 배경음 시작/재개. 이미 돌고 있으면 아무 일도 하지 않는다 */
export function startBgm() {
  if (!bgmOn) return;
  try {
    const p = bgmPlayer();
    if (!p) return;
    if (!p.playing) p.play();
  } catch {
    // 음악은 부가 기능이다
  }
}

export function stopBgm() {
  try {
    bgm?.pause();
  } catch { /* 무시 */ }
}

export function setBgmEnabled(on: boolean) {
  bgmOn = on;
  if (on) startBgm();
  else stopBgm();
}

export const isBgmEnabled = () => bgmOn;

/**
 * 살아 있는지 확인하고, 멈춰 있으면 되살린다.
 * 앱이 포그라운드로 돌아올 때마다 부른다 — 어떤 플랫폼은 백그라운드에서
 * 오디오 세션을 회수하고 돌려주지 않는다.
 */
export function keepBgmAlive() {
  if (!bgmOn) return;
  try {
    if (!bgm) return startBgm();
    if (!bgm.playing) bgm.play();
  } catch { /* 무시 */ }
}

/**
 * 강화 결과를 소리로 옮긴다.
 * 화면(EnhanceFx)과 스토어가 각자 매핑을 들고 있으면 조용히 갈라진다.
 */
export function sfxForOutcome(outcome: 'success' | 'fail' | 'downgrade' | 'destroy') {
  if (outcome === 'success') return sfx('success');
  if (outcome === 'destroy') return sfx('break');
  // 하락은 실패보다 무겁다 — 파괴 소리를 쓰면 장비가 날아간 줄 안다
  return sfx('fail');
}
