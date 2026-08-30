"""
앱 아이콘 세트 생성.
받은 단일 이미지(앱 아이콘 / 스플래시)를 이진화해서 Expo 가 요구하는 파일로 굽는다.
Android 적응형 전경은 아이콘 아트를 캔버스 60% 로 축소해 **직접 합성**한다 —
별도로 생성 요청할 필요가 없다.
"""
import os
from PIL import Image
import numpy as np

SRC = 'assets/lending-image'
ICON = '9da14eb8-35f3-4949-a116-a5fca596e032.jpeg'      # 모루 + 망치
SPLASH = 'b1819632-2033-4360-9f4e-2a8f6c8460d2.jpeg'    # 달 + 검사
OUT = 'assets'
SIZE = 1024
THRESH = 128
CORNER = 0.13   # Gemini 워터마크


def load_bw(name, kill_corner=True):
    im = Image.open(os.path.join(SRC, name)).convert('L')
    a = np.array(im) >= THRESH
    if kill_corner:
        h, w = a.shape
        a[int(h * (1 - CORNER)):, int(w * (1 - CORNER)):] = False
    return a


def trim(mask):
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    return mask[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]


def compose(mask, size=SIZE, fill=1.0, transparent=False):
    """검정 배경(또는 투명) 정사각 캔버스 중앙에 흰 아트를 fill 비율로 배치."""
    art = trim(mask)
    h, w = art.shape
    target = int(size * fill)
    scale = target / max(h, w)
    nh, nw = max(1, int(h * scale)), max(1, int(w * scale))
    src = Image.fromarray((art * 255).astype(np.uint8), 'L').resize((nw, nh), Image.NEAREST)

    if transparent:
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        art_rgba = Image.new('RGBA', (nw, nh), (255, 255, 255, 255))
        art_rgba.putalpha(src)
        canvas.paste(art_rgba, ((size - nw) // 2, (size - nh) // 2), art_rgba)
    else:
        canvas = Image.new('RGB', (size, size), (0, 0, 0))
        white = Image.new('RGB', (nw, nh), (255, 255, 255))
        canvas.paste(white, ((size - nw) // 2, (size - nh) // 2), src)
    return canvas


icon = load_bw(ICON)
splash = load_bw(SPLASH)

jobs = [
    ('icon.png',                      compose(icon, fill=0.92)),
    ('favicon.png',                   compose(icon, size=96, fill=0.92)),
    ('splash-icon.png',               compose(splash, fill=0.70)),
    # 적응형: 마스크로 잘리므로 아트를 60% 로 (외곽 20% 여백)
    ('android-icon-foreground.png',   compose(icon, fill=0.60, transparent=True)),
    ('android-icon-monochrome.png',   compose(icon, fill=0.60, transparent=True)),
    ('android-icon-background.png',   Image.new('RGB', (SIZE, SIZE), (0, 0, 0))),
]
for name, im in jobs:
    p = os.path.join(OUT, name)
    im.save(p)
    print(f'  {name:34s} {im.size[0]}x{im.size[1]} {im.mode}')
print('\n적응형 전경은 아이콘 아트를 60% 로 합성 — 별도 생성 불필요')
