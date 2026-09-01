# -*- coding: utf-8 -*-
"""
**하얀 덩어리**로 나온 스프라이트를 찾는다 — `python tools/check-blobs.py`.

## 무엇을 재나

에셋은 1-bit 다: 흰 픽셀 + 투명 배경. 잘 나온 그림은 실루엣 **안쪽에도**
검은(투명) 구멍이 있다 — 눈, 다리 사이, 몸의 골, 벌린 입. 그 구멍이 곧
"무엇인지" 를 말한다.

이진화가 잘못 걸리면 그 구멍이 전부 메워져서 **윤곽만 남은 하얀 덩어리**가
된다. 화면에서는 종이 뭐든 똑같은 흰 얼룩으로 보인다.

그래서 두 가지를 잰다.

  겉넘김(fill)   바깥 테두리 상자 안에서 흰 픽셀이 차지하는 비율.
                 높을수록 덩어리에 가깝다.
  구멍(holes)    실루엣 **안쪽에** 갇힌 투명 영역의 수.
                 0 이면 안쪽이 통째로 메워졌다는 뜻이다.

둘을 같이 보는 이유: 슬라임처럼 원래 구멍이 없는 종은 구멍이 0 이어도
정상이다. 반대로 골격처럼 원래 성긴 종은 겉넘김이 낮아야 한다. **둘 다
나쁠 때**만 의심한다.

경고는 "다시 뽑아라" 가 아니라 "눈으로 봐라" 다.
"""
import io
import os
import sys

try:
    from PIL import Image
except ImportError:                                    # pragma: no cover
    print('Pillow 가 없습니다 — pip install pillow')
    sys.exit(0)

ROOT = 'assets/sprites'

#: 이 위로 차 있으면 덩어리로 의심한다 (테두리 상자 대비)
FILL_BAD = 0.80
#: 이 위면 거의 확실하다
FILL_AWFUL = 0.92


def stats(path):
    """(겉넘김, 안쪽 구멍 수, 폭, 높이). 못 읽으면 None."""
    try:
        im = Image.open(path).convert('RGBA')
    except Exception:
        return None
    w, h = im.size
    if w * h == 0:
        return None
    px = im.load()

    #: 불투명하고 밝은 픽셀만 실루엣으로 친다
    on = [[False] * w for _ in range(h)]
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            v = a > 40 and (r + g + b) > 200
            on[y][x] = v
            if v:
                if x < minx:
                    minx = x
                if x > maxx:
                    maxx = x
                if y < miny:
                    miny = y
                if y > maxy:
                    maxy = y
    if maxx < 0:
        return (0.0, 0, w, h)

    bw = maxx - minx + 1
    bh = maxy - miny + 1
    lit = sum(1 for y in range(miny, maxy + 1) for x in range(minx, maxx + 1) if on[y][x])
    fill = lit / float(bw * bh)

    """
    안쪽 구멍 = 바깥에서 못 닿는 빈 곳.

    테두리에서 채우기(flood fill)를 돌려 바깥 빈 곳을 지우고, 남은 빈 곳을
    센다. 아주 작은 것(3px 미만)은 잡티라 안 센다.
    """
    seen = [[False] * w for _ in range(h)]
    stack = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x] or on[y][x]:
            continue
        seen[y][x] = True
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    holes = 0
    for y0 in range(miny, maxy + 1):
        for x0 in range(minx, maxx + 1):
            if on[y0][x0] or seen[y0][x0]:
                continue
            n = 0
            st = [(x0, y0)]
            while st:
                x, y = st.pop()
                if x < 0 or y < 0 or x >= w or y >= h or seen[y][x] or on[y][x]:
                    continue
                seen[y][x] = True
                n += 1
                st.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
            if n >= 3:
                holes += 1
    return (fill, holes, bw, bh)


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else ''
    rows = []
    for name in sorted(os.listdir(ROOT)):
        d = os.path.join(ROOT, name)
        if not os.path.isdir(d):
            continue
        if only and only not in name:
            continue
        fills = []
        holes = []
        for f in sorted(os.listdir(d)):
            if not f.endswith('.png'):
                continue
            s = stats(os.path.join(d, f))
            if not s:
                continue
            fills.append(s[0])
            holes.append(s[1])
        if not fills:
            continue
        rows.append((name, sum(fills) / len(fills), sum(holes) / float(len(holes)), len(fills)))

    bad = [r for r in rows if r[1] >= FILL_BAD and r[2] < 1.0]
    rows.sort(key=lambda r: -r[1])

    print('%-22s %6s %6s %s' % ('세트', '겉넘김', '구멍', '칸'))
    for name, fill, hole, n in rows[:40]:
        mark = '  <-- 덩어리 의심' if (fill >= FILL_BAD and hole < 1.0) else ''
        if fill >= FILL_AWFUL and hole < 1.0:
            mark = '  <-- 거의 확실'
        print('%-22s %5.0f%% %6.1f %3d%s' % (name, fill * 100, hole, n, mark))

    print()
    if bad:
        print('덩어리로 의심되는 세트 %d개:' % len(bad))
        for name, fill, hole, _n in bad:
            print('  %s (겉넘김 %.0f%%, 안쪽 구멍 %.1f개)' % (name, fill * 100, hole))
        print()
        print('겉넘김이 높고 안쪽에 구멍이 없다는 것은, 실루엣 안이 통째로')
        print('메워졌다는 뜻입니다 — 화면에서 흰 얼룩으로 보입니다.')
    else:
        print('덩어리로 의심되는 세트 없음')


if __name__ == '__main__':
    main()
