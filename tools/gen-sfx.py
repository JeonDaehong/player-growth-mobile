#!/usr/bin/env python3
"""
assets/sfx/*.wav 생성기.

  python3 tools/gen-sfx.py

왜 파일을 받아 오지 않고 합성하는가
  · 이 게임은 흑백 2색 도트다. 시중의 "게임 효과음" 팩은 대부분 밝고 둥근
    아케이드 톤이라 화면과 따로 논다. 원하는 건 **중세 철기방** 이다 —
    모루에 망치가 닿는 소리, 사슬, 가죽, 동전.
  · 합성하면 톤을 한 곳에서 조절할 수 있고, 라이선스 문제가 없고,
    파일이 작다 (전부 합쳐 200KB 안쪽).

톤 규칙
  · **비조화 배음**(inharmonic partials)이 금속의 정체다. 정수배(2f, 3f)로 쌓으면
    악기 소리가 나고, 1.0/2.28/3.35/4.7 처럼 어긋나게 쌓으면 쇠붙이가 된다.
  · 어택은 노이즈 버스트, 몸통은 감쇠 사인. 붙이는 순서가 재질을 만든다.
  · 밝은 종소리(고음 긴 여운)는 쓰지 않는다 — 그게 "게임스러운" 소리의 정체다.
  · 전부 0.1~0.9초. 길면 연타할 때 겹쳐서 지저분해진다.
"""
import math
import os
import random
import struct
import wave

SR = 22050
OUT = 'assets/sfx'

random.seed(1998)  # 재생성해도 같은 소리가 나오도록


# ── 기본 블록 ──────────────────────────────────────────
def silence(dur):
    return [0.0] * int(SR * dur)


def mix(base, add, at=0.0, gain=1.0):
    """base 위에 add 를 at 초 지점부터 얹는다. base 는 제자리에서 늘어난다."""
    off = int(SR * at)
    need = off + len(add)
    if need > len(base):
        base.extend([0.0] * (need - len(base)))
    for i, v in enumerate(add):
        base[off + i] += v * gain
    return base


def env(n, attack, decay, curve=1.0):
    """어택(선형) + 감쇠(지수). curve 가 클수록 뚝 떨어진다."""
    a = max(1, int(SR * attack))
    out = []
    for i in range(n):
        if i < a:
            e = i / a
        else:
            t = (i - a) / max(1e-9, SR * decay)
            e = math.exp(-t * curve)
        out.append(e)
    return out


def partials(dur, base_hz, ratios, gains, attack=0.001, decay=0.18, curve=3.0, detune=0.0):
    """비조화 배음 더미 — 금속의 몸통."""
    n = int(SR * dur)
    e = env(n, attack, decay, curve)
    out = [0.0] * n
    for r, g in zip(ratios, gains):
        f = base_hz * r * (1.0 + random.uniform(-detune, detune))
        w = 2 * math.pi * f / SR
        ph = random.uniform(0, 2 * math.pi)
        # 높은 배음일수록 빨리 죽는다 — 실제 금속이 그렇다
        fast = 1.0 + (r - 1.0) * 0.55
        for i in range(n):
            out[i] += math.sin(ph + w * i) * g * (e[i] ** fast)
    return out


def noise(dur, attack=0.0005, decay=0.03, curve=6.0):
    n = int(SR * dur)
    e = env(n, attack, decay, curve)
    return [random.uniform(-1, 1) * e[i] for i in range(n)]


def lowpass(sig, hz):
    """1극 저역통과 — 노이즈에서 '쇳가루' 를 걷어 내 나무·가죽으로 만든다."""
    a = math.exp(-2 * math.pi * hz / SR)
    y = 0.0
    out = []
    for x in sig:
        y = (1 - a) * x + a * y
        out.append(y)
    return out


def highpass(sig, hz):
    lo = lowpass(sig, hz)
    return [x - l for x, l in zip(sig, lo)]


def sweep(dur, f0, f1, gain=1.0, attack=0.002, decay=0.12, curve=4.0):
    """주파수가 미끄러지는 사인 — 칼날이 공기를 가르는 결."""
    n = int(SR * dur)
    e = env(n, attack, decay, curve)
    out = []
    ph = 0.0
    for i in range(n):
        t = i / n
        f = f0 * math.pow(f1 / f0, t)
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * e[i] * gain)
    return out


def softclip(sig):
    return [math.tanh(x * 1.15) for x in sig]


def normalize(sig, peak=0.82):
    m = max((abs(x) for x in sig), default=0.0)
    if m < 1e-9:
        return sig
    k = peak / m
    return [x * k for x in sig]


def fadeout(sig, dur=0.012):
    n = int(SR * dur)
    for i in range(min(n, len(sig))):
        sig[len(sig) - 1 - i] *= i / max(1, n)
    return sig


def write(name, sig):
    sig = fadeout(normalize(softclip(sig)))
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x)) * 32767)) for x in sig))
    print(f'  {path}  {os.path.getsize(path) / 1024:.0f}KB  {len(sig) / SR:.2f}s')


# ── 소리들 ─────────────────────────────────────────────
# 모루 배음비 — 정수배에서 일부러 어긋나 있다
ANVIL = [1.0, 2.31, 3.42, 4.71, 6.15]


def s_tap():
    """버튼 — 가죽 덮인 나무를 툭. 화면에서 가장 자주 나므로 제일 조용하고 짧다."""
    out = silence(0.07)
    mix(out, lowpass(noise(0.05, decay=0.012, curve=9), 1400), 0, 0.5)
    mix(out, partials(0.07, 190, [1.0, 2.1], [0.5, 0.2], decay=0.02, curve=8), 0, 0.6)
    return out


def s_click():
    """선택·토글 — 쇠고리가 걸리는 딸깍."""
    out = silence(0.08)
    mix(out, highpass(noise(0.02, decay=0.006, curve=12), 2200), 0, 0.35)
    mix(out, partials(0.08, 900, [1.0, 2.28, 3.3], [0.4, 0.25, 0.12], decay=0.018, curve=9), 0, 0.7)
    return out


def s_hammer():
    """강화 시도 — 모루 위 한 방. 여운을 짧게 잘라 '작업 중' 의 리듬을 만든다.

    처음 잡은 소리는 기준음이 420Hz 라 '땅' 하고 위로 튀었다 — 화면은 흑백 쇳덩인데
    소리만 가벼웠다. 무게는 세 곳에서 온다:
      · 기준음을 240Hz 로 한 옥타브 가까이 내리고, 높은 배음의 몫을 깎는다
      · 어택의 노이즈를 1.8kHz 로 잘라 '팅' 을 '텅' 으로 바꾼다 (5kHz 는 쇳가루다)
      · 모루 받침(58Hz)을 길게 울리고, 짧은 하강 스윕으로 내려앉는 무게를 붙인다
    여운은 그래도 0.46초 안에서 끝낸다 — 연타할 때 겹치면 다시 지저분해진다.
    """
    out = silence(0.46)
    # 어택 — 고역을 걷어 낸 둔탁한 충돌
    mix(out, lowpass(noise(0.045, decay=0.014, curve=7), 1800), 0, 0.7)
    # 몸통 — 모루의 비조화 배음. 낮은 쪽에 무게를 몰아 준다
    mix(out, partials(0.40, 240, ANVIL, [1.0, 0.42, 0.22, 0.11, 0.05],
                      decay=0.15, curve=3.0, detune=0.004), 0, 0.9)
    # 받침 — 이 저음이 '묵직함' 의 정체다. 위의 배음보다 오래 남는다
    mix(out, partials(0.34, 58, [1.0, 2.0, 3.1], [1.0, 0.30, 0.12],
                      decay=0.16, curve=3.0), 0, 0.95)
    # 망치가 내려앉는 결 — 아주 짧은 하강 스윕
    mix(out, sweep(0.16, 180, 55, 0.8, attack=0.002, decay=0.07, curve=4.0), 0, 0.6)
    return out


def s_success():
    """강화 성공 — 두 번 두드리고 마지막이 길게 운다. 음정이 살짝 올라간다."""
    out = silence(0.95)
    mix(out, s_hammer(), 0.00, 0.75)
    mix(out, lowpass(noise(0.03, decay=0.008, curve=10), 4200), 0.10, 0.5)
    mix(out, partials(0.85, 470, ANVIL, [1.0, 0.55, 0.34, 0.22, 0.14],
                      decay=0.34, curve=1.7, detune=0.003), 0.10, 0.95)
    return out


def s_fail():
    """강화 실패 — 같은 망치인데 여운이 없다. 죽은 소리가 곧 실패다."""
    out = silence(0.30)
    mix(out, lowpass(noise(0.025, decay=0.007, curve=11), 2600), 0, 0.5)
    mix(out, partials(0.26, 300, [1.0, 2.1, 3.05], [0.9, 0.3, 0.12], decay=0.045, curve=6.5), 0, 0.85)
    mix(out, partials(0.16, 95, [1.0], [0.7], decay=0.05, curve=7), 0, 0.55)
    return out


def s_break():
    """파괴 — 쇠가 갈라지는 균열 + 바닥으로 떨어지는 저음."""
    out = silence(0.75)
    mix(out, highpass(noise(0.09, decay=0.02, curve=7), 1500), 0, 0.85)
    mix(out, partials(0.35, 640, [1.0, 2.4, 3.9, 5.6], [0.8, 0.5, 0.3, 0.2], decay=0.09, curve=4.5), 0, 0.7)
    mix(out, sweep(0.55, 300, 60, 0.9, attack=0.004, decay=0.22, curve=2.6), 0.05, 0.8)
    mix(out, lowpass(noise(0.30, attack=0.01, decay=0.10, curve=4), 700), 0.10, 0.35)  # 파편
    return out


def s_coin():
    """돈 — 작은 동전 세 닢이 어긋나게 부딪친다."""
    out = silence(0.55)
    for at, hz, g in ((0.00, 2100, 1.0), (0.045, 2600, 0.75), (0.10, 1850, 0.6)):
        mix(out, partials(0.40, hz, [1.0, 2.27, 3.31], [0.7, 0.4, 0.22],
                          decay=0.13, curve=3.0, detune=0.01), at, g)
        mix(out, highpass(noise(0.012, decay=0.004, curve=14), 3000), at, 0.25 * g)
    return out


def s_blade():
    """전투 타격 — 칼이 부딪치며 튕긴다."""
    out = silence(0.45)
    mix(out, highpass(noise(0.05, decay=0.012, curve=8), 2500), 0, 0.7)
    mix(out, sweep(0.20, 3200, 1400, 0.6, attack=0.001, decay=0.07, curve=5), 0, 0.7)
    mix(out, partials(0.42, 780, [1.0, 2.33, 3.5, 5.1], [0.9, 0.5, 0.3, 0.16],
                      decay=0.16, curve=3.0, detune=0.005), 0.004, 0.85)
    return out


def s_forge():
    """제련·승급 — 풀무가 불을 먹고, 큰 망치가 한 번 내려온다."""
    out = silence(1.15)
    mix(out, lowpass(noise(0.45, attack=0.14, decay=0.16, curve=2.2), 900), 0, 0.55)   # 풀무
    mix(out, lowpass(noise(0.04, decay=0.010, curve=9), 5200), 0.42, 0.6)
    mix(out, partials(0.72, 340, ANVIL, [1.0, 0.55, 0.35, 0.24, 0.15],
                      decay=0.30, curve=2.0, detune=0.004), 0.42, 1.0)
    mix(out, partials(0.30, 84, [1.0, 2.0], [0.8, 0.25], decay=0.12, curve=4), 0.42, 0.6)
    return out


def s_open():
    """팝업·장부 — 두꺼운 가죽 표지가 열린다. 음정이 없어야 UI 소리로 안 튄다."""
    out = silence(0.36)
    mix(out, lowpass(noise(0.30, attack=0.02, decay=0.10, curve=3.2), 1100), 0, 0.75)
    mix(out, partials(0.18, 140, [1.0, 2.6], [0.35, 0.12], decay=0.06, curve=5), 0.01, 0.4)
    return out


SOUNDS = {
    'tap': s_tap,
    'click': s_click,
    'hammer': s_hammer,
    'success': s_success,
    'fail': s_fail,
    'break': s_break,
    'coin': s_coin,
    'blade': s_blade,
    'forge': s_forge,
    'open': s_open,
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    print(f'{OUT}/ 에 {len(SOUNDS)}개 생성')
    for name, fn in SOUNDS.items():
        write(name, fn())
