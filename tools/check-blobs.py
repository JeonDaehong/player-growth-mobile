# -*- coding: utf-8 -*-
"""
**게임 크기에서 안 읽히는** 스프라이트를 찾는다.

    python tools/check-blobs.py            # 적·우두머리 전부
    python tools/check-blobs.py sg_        # 이름에 sg_ 가 든 것만
    python tools/check-blobs.py --sheet    # 게임 크기 대조표를 그려서 저장

## 처음 만든 것은 틀린 것을 재고 있었다

원본 크기(192px)에서 겉넘김과 안쪽 구멍 수를 셌다. 그걸로는 아무것도 안
걸렸는데, 화면에서는 분명히 흰 얼룩으로 보이는 것들이 있었다.

두 가지가 잘못돼 있었다.

**밝기를 쟀다.** 에셋은 흰 픽셀 + 투명이라 불투명한 자리는 전부 밝기 1.0
이다. 실루엣이 얼마나 통짜인지는 **투명한 구멍이 얼마나 남았나**로 재야 한다.

**원본 크기에서 쟀다.** 이게 더 크다. 망점(하프톤)으로 칠한 그림은 192px
에서는 점 사이가 다 뚫려 있어서 "구멍이 백 개" 로 세어진다. 그런데 화면은
그걸 45~110px 로 줄이고, 줄이면 **점이 서로 메워져 통짜 흰색이 된다.**
사람 눈에 보이는 것은 줄인 뒤의 모습이므로, 재는 것도 줄인 뒤여야 한다.

## 그래서 지금 재는 것

화면이 쓰는 크기로 줄인 다음(`Ground` 의 `FOE_W`·`BOSS_W`), 테두리 상자 안에서

    통짜   알파가 200 을 넘는 칸의 비율 — 완전히 찬 자리
    구멍   알파가 60 아래인 칸의 비율 — 뚫린 자리

**통짜가 높고 구멍이 낮으면** 그 크기에서 실루엣 안이 메워졌다는 뜻이다.

## 망하는 길이 **두 가지**다

처음에는 "너무 찼다" 만 찾았다. 그런데 실제로 화면에서 제일 안 읽히던 것은
반대쪽이었다 — 20판 우두머리(`b20_silvanus`)는 통짜가 10% 로 제일 낮은 축인데,
110px 에서 보면 **가는 흰 선이 엉킨 덩어리**라 무엇인지 알 수가 없다.

    너무 통짜 (>40%)   윤곽 안이 메워져 흰 얼룩이 된다. 무엇이든 될 수 있고
                       그래서 아무것도 아니다
    너무 성김 (<20%)   덩어리가 없고 선만 남는다. 줄이면 그 선들이 서로
                       뭉개져서 지저분한 얼룩이 된다

읽히는 자리는 그 사이다. 대략 **24~40%** — 흰 덩어리가 있고 그 안에 검은
구멍이 뚫려 있는 상태다.

## 경고가 곧 "다시 뽑아라" 는 아니다

원래 구멍이 없는 종(슬라임)은 통짜가 높을 수 있고, 마른 나뭇가지는 낮을 수
있다. 이건 **눈으로 볼 순서를 매겨 주는 것**이고, 판단은 `--sheet` 로 대조표를
보고 한다.
"""
import io
import os
import re
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:                                    # pragma: no cover
    print('Pillow 가 없습니다 — pip install pillow')
    sys.exit(0)

ROOT = 'assets/sprites'
OUT_SHEET = 'docs/foe-art/_game-size.png'

#: 화면에서 실제로 그려지는 폭 (`screens/home/Ground` — ZOOM 1.4 를 먹인 값)
FOE_PX = 52
BOSS_PX = 110

#: 이 위로 통짜면 눈으로 볼 것 — 윤곽 안이 메워졌다
SOLID_WARN = 0.40

#: 이 아래로 성기면 눈으로 볼 것 — 덩어리가 없고 선만 남았다
#
# 0.20 으로 뒀다가 0.14 로 내렸다. 0.20 이면 열여덟이 걸리는데, 눈으로 보면
# 그중 태반(마른 나뭇가지 · 가시덤불)은 멀쩡하다. **경고가 스물이면 아무도
# 안 본다** — 확실한 것만 걸리게 조인다.
SPARSE_WARN = 0.14


def is_boss(art):
    return bool(re.match(r'^b\d\d_', art))


def arts_in_use():
    """`core/autoBattle` 이 실제로 부르는 종들 — 등장 순서 그대로."""
    src = io.open('src/core/autoBattle.ts', encoding='utf-8').read()
    out = []
    for a in re.findall(r"art:\s*'([a-z0-9_]+)'", src):
        if a not in out:
            out.append(a)
    return out


def shrunk(art, frame='idle'):
    """그 종의 칸 하나를 **화면 크기로 줄여서** 돌려준다."""
    p = os.path.join(ROOT, art, frame + '.png')
    if not os.path.exists(p):
        return None
    im = Image.open(p).convert('RGBA')
    g = BOSS_PX if is_boss(art) else FOE_PX
    im.thumbnail((g, g), Image.LANCZOS)
    return im


def score(im):
    """(통짜, 구멍). 테두리 상자 안에서만 잰다 — 바깥 여백은 셈에 안 넣는다."""
    al = im.getchannel('A')
    bb = al.getbbox()
    if not bb:
        return (0.0, 0.0)
    px = list(al.crop(bb).tobytes())
    n = len(px)
    solid = sum(1 for v in px if v > 200) / n
    hole = sum(1 for v in px if v < 60) / n
    return (solid, hole)


def sheet(arts, path):
    """게임 크기 대조표 — 숫자보다 이게 빠르다."""
    cell = 124
    cols = 8
    rows = (len(arts) + cols - 1) // cols
    out = Image.new('RGB', (cell * cols, (cell + 14) * rows), (0, 0, 0))
    dr = ImageDraw.Draw(out)
    for i, a in enumerate(arts):
        x = (i % cols) * cell
        y = (i // cols) * (cell + 14)
        dr.rectangle([x, y, x + cell - 1, y + cell + 12], outline=(60, 60, 60))
        im = shrunk(a)
        if im:
            """
            게임 크기로 줄인 **그 결과를** 최근접으로 키워 붙인다.

            부드럽게 키우면 뭉갠 것이 도로 매끈해져서, 정작 보려던 것(줄일 때
            뭉개진 정도)이 사라진다.
            """
            big = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
            big.thumbnail((cell - 8, cell - 8), Image.NEAREST)
            out.paste(big, (x + (cell - big.width) // 2,
                            y + (cell - big.height) // 2), big)
        dr.text((x + 3, y + cell), a, fill=(180, 180, 180))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out.save(path)
    return out.size


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    want_sheet = '--sheet' in sys.argv
    only = args[0] if args else ''

    arts = [a for a in arts_in_use() if not only or only in a]
    rows = []
    for a in arts:
        im = shrunk(a)
        if not im:
            print('%-16s 그림 없음' % a)
            continue
        s, h = score(im)
        rows.append((a, s, h))

    rows.sort(key=lambda r: -r[1])
    print('%-16s %6s %6s   (화면 크기 %dpx / 우두머리 %dpx)'
          % ('종', '통짜', '구멍', FOE_PX, BOSS_PX))
    for a, s, h in rows:
        mark = ''
        if s >= SOLID_WARN:
            mark = '  <-- 너무 통짜 (흰 얼룩)'
        elif s <= SPARSE_WARN:
            mark = '  <-- 너무 성김 (선만 남음)'
        print('%-16s %5.0f%% %5.0f%%%s' % (a, s * 100, h * 100, mark))

    solid = [r for r in rows if r[1] >= SOLID_WARN]
    sparse = [r for r in rows if r[1] <= SPARSE_WARN]
    print()
    if solid:
        print('■ 너무 통짜 %d개 — 윤곽 안이 메워져 흰 얼룩으로 보입니다:' % len(solid))
        for a, s, _h in solid:
            print('    %-16s %.0f%%' % (a, s * 100))
    if sparse:
        print('□ 너무 성김 %d개 — 덩어리가 없고 선만 남아 엉킨 얼룩이 됩니다:'
              % len(sparse))
        for a, s, _h in sparse:
            print('    %-16s %.0f%%' % (a, s * 100))
    if not solid and not sparse:
        print('%d~%d%% 밖으로 나간 것 없음' % (SPARSE_WARN * 100, SOLID_WARN * 100))
    else:
        print()
        print('숫자만으로는 못 정합니다 — 마른 나뭇가지는 원래 성기고,')
        print('슬라임은 원래 통짜입니다. --sheet 로 대조표를 뽑아 눈으로 보세요.')

    if want_sheet:
        size = sheet(arts, OUT_SHEET)
        print()
        print('대조표 → %s %s' % (OUT_SHEET, size))


if __name__ == '__main__':
    main()
