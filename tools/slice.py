"""
마젠타 경계 스프라이트 시트 → 셀 단위 1-bit PNG.

  python3 tools/slice.py            # 전체
  python3 tools/slice.py avatar     # 특정 세트만

처리: 마젠타 격자 검출 → 셀 크롭 → (선택) 글자 제거 → 이진화
      → 검은 여백 트림 → 최근접 보간으로 정사이즈

찢어진(ragged) 시트 다루기 (설정 키):
  region                [x0,y0,x1,y1] 0~1 비율. 이 영역만 잘라 격자를 매긴다.
                        한 시트에 크기가 다른 칸이 섞여 있으면 같은 파일을 여러 항목으로
                        나눠 적고 region 을 달리 준다.
  append                true 면 출력 폴더를 비우지 않는다. 같은 세트를 여러 항목으로
                        채울 때 필수 (없으면 뒤 항목이 앞 결과를 지운다).
  labels 의 원소로 배열  한 셀을 여러 이름으로 저장한다 (예: ["t8","t9"]).
                        10단계가 필요한데 9칸만 나온 시트를 메울 때 쓴다.

격자 검출이 어긋날 때 (설정 키):
  colEdges / rowEdges   칸 경계를 0~1 비율로 직접 준다 (예: [0, 0.17, 0.33, 1]).
                        칸 폭이 불균등한 시트는 균등분할로는 못 맞춘다.
                        마젠타 선 위치를 재서 그대로 적어 주면 된다.
  grid                  [열, 행] 을 주면 검출을 무시하고 **균등 분할**한다.
                        JPEG 잡티나 캡션 때문에 마젠타 선이 하나 더 잡히는 시트용.
                        (마젠타는 휘도 105 로 이진화에서 배경이 되므로 선이 셀에
                        조금 걸려도 무해하다)

글자가 박혀 나온 시트 되살리기 (설정 키):
  cropBottom / cropTop  셀 위·아래를 비율로 잘라낸다 (캡션 띠가 가장자리일 때)
  maskRects             셀 안 임의 사각형을 지운다. [[x0,y0,x1,y1], ...] 0~1 비율
  minPart               가장 큰 덩어리의 이 비율보다 작은 **떨어진 조각**을 버린다.
                        글자는 물체와 붙어 있지 않으므로 0.05 정도면 대개 사라진다.
  killCorner            우하단 워터마크 제거
  auto                  true 면 마젠타 선에서 칸 경계를 자동으로 뽑는다 (불균등 칸 대응)
  allowFilled           꽉 찬 그림이 정상인 세트(카드·배경 등)에서 채움률 경고를 끈다.
  paper                 **흰 종이에 검은 선**으로 그려져 온 시트. invert 로는 못
                        고친다 — 뒤집으면 종이가 검어지는 김에 **몸통도 검어지고**
                        선만 희게 남아서, 화면에서 시커먼 덩어리가 된다.
                        대신 테두리에서 흰색을 타고 번져 들어가 "바깥 종이" 를
                        찾고, 거기만 배경으로 버린다. 윤곽 안쪽의 흰 부분은
                        몸통이라 그대로 흰색으로 남고, 안쪽의 검은 선은 구멍이
                        된다 — 흑백 반전으로 들어온 시트와 결과가 같아진다.
  inset                 셀 네 변을 이 비율만큼 깎는다. 흰 배경 시트를 invert 하면
                        칸 테두리가 흰 액자로 남는데, 그걸 없애는 데 쓴다.
"""
import json, os, re, sys
from PIL import Image
import numpy as np

OUT = 'assets/sprites'
CFG = 'tools/sprites.config.json'

"""
원본 시트를 찾을 폴더 — **새것부터.**

## 스스로 찾는다

`assets/` 아래 **날짜로 시작하는 폴더**를 전부 집는다 (`2026-09-05`,
`2026-09-02-001` …). 설정의 `_srcDirs` 도 계속 읽지만 이제는 덤이다 —
그림을 받아 넣는 날마다 사람이 목록에 한 줄을 더해야 하는 구조였고, 그걸
빠뜨리면 슬라이서는 **아무 말 없이 옛 그림을 계속 쓴다.**

## 순서가 규칙이다 — 새 폴더가 이긴다

같은 이름의 시트가 여러 폴더에 있으면 **제일 새 폴더 것**을 쓴다
(`sorted(..., reverse=True)` — 폴더 이름이 ISO 날짜로 시작하므로 글자
순서가 곧 날짜 순서다).

여태는 설정에 적힌 **순서대로** 뒤져서 처음 찾은 것을 썼다. 그래서
`2026-09-02-001/30-boss.jpg` 가 목록 앞쪽에 있는 한, 그 뒤 어느 폴더에 새
시트를 넣어도 영영 안 쓰였다 — 30판 우두머리가 몇 번을 다시 그려 넣어도
정면을 보고 서 있던 것이 이것이다. 슬라이서는 매번 "5칸 잘랐다" 고 말했고,
결과 파일은 늘 같았다.

같은 시트를 여러 날에 걸쳐 다시 받는 일이 이 프로젝트의 기본 흐름이므로
(프롬프트를 고쳐 다시 뽑는다), **새것이 이기는 쪽**이 유일하게 맞는 규칙이다.

없는 폴더는 걸러 낸다. 지운 폴더가 목록에 남아 있어도 그냥 넘어가면 되고,
그것 때문에 멈출 이유가 없다.
"""


def _src_dirs():
    dirs = []
    try:
        cfg = json.load(open(CFG, encoding='utf-8'))
        dirs += [os.path.normpath(d) for d in cfg.get('_srcDirs', []) if os.path.isdir(d)]
    except Exception:
        pass
    if os.path.isdir('assets'):
        for name in sorted(os.listdir('assets')):
            path = os.path.join('assets', name)
            if os.path.isdir(path) and re.match(r'^\d{4}-\d{2}-\d{2}', name):
                dirs.append(os.path.normpath(path))
    # 새 폴더가 앞에 오게 — 폴더 이름이 날짜라 글자 순서가 곧 날짜 순서다
    return sorted(set(dirs), key=os.path.basename, reverse=True)


SRC_DIRS = _src_dirs()
SIZE = 192          # 출력 한 변 상한 (nearest)
THRESH = 128        # 이진화 임계값
CORNER = 0.13       # killCorner: 우하단 이 비율만큼 지움 (Gemini 워터마크)


def magenta_mask(a):
    r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
    return (r > 150) & (b > 150) & (g < 110) & (r - g > 60) & (b - g > 60)


def line_edges(dens, n):
    """
    마젠타 선 위치 → 칸 경계 (0~1 비율).

    선 하나가 여러 픽셀 두께라 그룹의 중심을 경계로 쓴다. JPEG 잡티로 선이
    두 개로 갈라지는 경우가 있어, 중앙 간격의 40% 보다 가까운 경계는 하나로
    합친다 (안 합치면 폭 0 에 가까운 유령 칸이 생긴다).
    """
    idx = np.where(dens > 0.5)[0]
    if len(idx) == 0:
        return [0.0, 1.0]
    groups, s0, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - prev > 1:
            groups.append((s0 + prev) / 2)
            s0 = i
        prev = i
    groups.append((s0 + prev) / 2)
    e = [g / n for g in groups]
    if e[0] > 0.02:
        e.insert(0, 0.0)
    if e[-1] < 0.98:
        e.append(1.0)
    gaps = sorted(e[i + 1] - e[i] for i in range(len(e) - 1))
    med = gaps[len(gaps) // 2]
    out = [e[0]]
    for x in e[1:]:
        if x - out[-1] < med * 0.4:
            out[-1] = (out[-1] + x) / 2      # 갈라진 선 병합
        else:
            out.append(x)
    return out


def bands(flags, min_len=2):
    out, s = [], None
    for i, v in enumerate(flags):
        if v and s is None:
            s = i
        elif not v and s is not None:
            if i - s >= min_len:
                out.append((s, i))
            s = None
    if s is not None and len(flags) - s >= min_len:
        out.append((s, len(flags)))
    return out


def spans(bs, total):
    out, prev = [], 0
    for s, e in bs:
        if s - prev > total * 0.02:
            out.append((prev, s))
        prev = e
    if total - prev > total * 0.02:
        out.append((prev, total))
    return out


def detect(im):
    a = np.array(im)
    m = magenta_mask(a)
    h, w = m.shape
    if m.mean() < 0.005:
        return [(0, h)], [(0, w)]
    return spans(bands(m.mean(axis=1) > 0.55), h), spans(bands(m.mean(axis=0) > 0.55), w)


def binarize(cell, thresh=None):
    """
    회색을 흑백으로.

    `thresh` 를 시트마다 따로 줄 수 있다. 같은 캐릭터인데 시트마다 밝기가
    다르게 그려져 오는 일이 있다 — 사제는 §A 에서 수도복이 검고 §D·§E 에서는
    회색이라, 같은 임계값으로 자르면 **공격할 때만 하얘졌다.**
    """
    g = np.array(cell.convert('L'))
    return (g >= (THRESH if thresh is None else thresh))


def drop_small_parts(mask, min_frac):
    """
    떨어져 있는 작은 덩어리를 버린다 (8-이웃 연결 성분).

    시트에 박혀 나온 글자·캡션·서명을 지우는 데 쓴다. 글자는 물체에 붙어 있지
    않으므로 별개 성분이 되고, 물체보다 훨씬 작다. 반대로 미스릴 티어의 '떠 있는
    조각' 처럼 의도된 분리 부품은 비율이 커서 살아남는다 — 그래서 절대 픽셀 수가
    아니라 **가장 큰 성분 대비 비율**로 자른다.
    """
    if min_frac <= 0 or not mask.any():
        return mask
    h, w = mask.shape
    lab = np.zeros((h, w), dtype=np.int32)
    sizes = [0]
    cur = 0
    ys, xs = np.nonzero(mask)
    for sy, sx in zip(ys, xs):
        if lab[sy, sx]:
            continue
        cur += 1
        stack = [(sy, sx)]
        lab[sy, sx] = cur
        cnt = 0
        while stack:
            y, x = stack.pop()
            cnt += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = cur
                        stack.append((ny, nx))
        sizes.append(cnt)
    if cur <= 1:
        return mask
    biggest = max(sizes)
    keep = {i for i, c in enumerate(sizes) if i > 0 and c >= biggest * min_frac}
    out = np.zeros_like(mask)
    for i in keep:
        out |= (lab == i)
    return out


def drop_floor(mask):
    """
    칸에 그려져 들어온 **바닥선**을 지운다.

    게임은 쿼터뷰 바닥판을 따로 깔고 그 위에 스프라이트를 얹는다
    (`src/screens/home/Ground.tsx`). 그래서 그림 안에 바닥이 있으면 화면에서는
    공중에 뜬 흰 줄이 된다. 프롬프트로 막고 있지만 (§ NEVER DRAW THE GROUND)
    그래도 종종 들어오고, 한 칸만 들어와도 그 프레임에서 줄이 깜빡인다.

    ## 어떻게 찾나

    바닥선은 **얇고 넓고 갑자기 나타난다.** 발밑 어딘가에서 폭의 30% 이상을
    가로지르는 줄이 서너 줄 두께로 있고, 그 바로 위는 거의 비어 있다 (다리
    두 개와 무기 자루뿐). 이 세 조건이 같이 맞는 띠를 찾는다.

    ## 발까지 지우지 않으려면

    띠 안이라고 다 지우면 부츠 바닥이 잘려 나간다. 그래서 **띠 바로 위가
    비어 있는 열만** 지운다 — 다리·자루가 내려오는 열은 위에도 흰색이 있으니
    살아남고, 허공에서 갑자기 시작하는 줄만 사라진다.
    """
    h, w = mask.shape
    if h < 12 or w < 12:
        return mask

    cover = mask.sum(axis=1) / w
    top = int(h * 0.80)                      # 아래 20% 안에서만 찾는다

    for r in range(h - 1, top - 1, -1):
        if cover[r] < 0.30:
            continue
        # 띠의 위쪽 끝 — 넓은 줄이 이어지는 데까지
        a = r
        while a > top and cover[a - 1] >= 0.30:
            a -= 1
        if r - a + 1 > 4:                    # 너무 두꺼우면 바닥이 아니라 몸이다
            continue
        # 위가 갑자기 비면 바닥선, 서서히 좁아지면 치맛단이다.
        #
        # 처음엔 "위가 12% 미만" 으로만 봤다. 그런데 무릎 꿇은 자세는 바닥선
        # 바로 위에도 다리·부츠·도끼가 넓게 깔려 있어서 그 문을 못 넘었다.
        # 절대값이 아니라 **띠 대비 비율**로 본다 — 치맛단은 한 줄 위도 거의
        # 같은 폭이라 통과하지 못하고, 허공에서 시작하는 줄만 걸린다.
        if a == 0 or cover[a - 1] > max(0.12, cover[r] * 0.45):
            continue

        above = mask[a - 1]
        out = mask.copy()
        for c in range(w):
            if not above[c]:                 # 위가 비어 있는 열만 — 다리와 자루는 남는다
                out[a:r + 1, c] = False
        return out

    return mask


def trim(mask):
    """흰 픽셀이 있는 최소 사각형. 없으면 None."""
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    if not len(rows) or not len(cols):
        return None
    return rows[0], rows[-1] + 1, cols[0], cols[-1] + 1


def on_paper(mask, rgb):
    """흰 종이에 그려진 선화를 흑백 반전 시트와 같은 모양으로 바꾼다.

    `invert` 로는 안 된다. 뒤집으면 종이가 검어지면서 **몸통도 같이** 검어지고
    선만 희게 남는다 — 화면에서 시커먼 덩어리가 된다 (6판 우두머리가 그랬다).

    바깥 종이는 **테두리에 닿아 있는 흰 덩어리**다. 거기서 흰색을 타고 번져
    들어가 표시하고, 그것만 버린다. 윤곽선이 닫혀 있으면 안쪽 흰 부분은 안
    닿으므로 몸통으로 남는다.

    `mask` 는 흰 픽셀이 True 다 (`binarize`). 돌려주는 것도 같은 뜻이라,
    이 뒤의 처리(`inset`·`floor`·`minPart`)가 그대로 이어진다.
    """
    h, w = mask.shape
    # 마젠타 구분선은 종이도 그림도 아니다 — 번지기 전에 흰색으로 쳐서
    # 테두리와 이어 준다. 안 그러면 선이 벽이 되어 종이를 못 찾는다
    start = mask | magenta_mask(rgb)

    outside = np.zeros((h, w), dtype=bool)
    stack = []
    for x in range(w):
        for y in (0, h - 1):
            if start[y, x]:
                stack.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if start[y, x]:
                stack.append((y, x))

    # 재귀 대신 스택 — 셀이 512px 이라 재귀로는 파이썬 한계를 넘는다
    while stack:
        y, x = stack.pop()
        if outside[y, x] or not start[y, x]:
            continue
        outside[y, x] = True
        if y > 0:
            stack.append((y - 1, x))
        if y < h - 1:
            stack.append((y + 1, x))
        if x > 0:
            stack.append((y, x - 1))
        if x < w - 1:
            stack.append((y, x + 1))

    return mask & ~outside


def to_png(mask):
    """True=흰색, False=투명. RN 에서 어떤 배경 위에도 올릴 수 있게 알파를 쓴다."""
    h, w = mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[mask] = [255, 255, 255, 255]
    im = Image.fromarray(rgba, 'RGBA')
    scale = min(SIZE / max(w, h), 1.0)
    if scale < 1.0:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.NEAREST)
    return im


def run(only=None):
    cfg = json.load(open(CFG, encoding='utf-8'))
    total = 0
    report = []
    for s in cfg['sets']:
        name = s['name']
        if only and name != only:
            continue
        path = next((os.path.join(d, s['file']) for d in SRC_DIRS
                     if os.path.exists(os.path.join(d, s['file']))), None)
        if path is None:
            report.append((name, '원본 없음', 0))
            continue
        im = Image.open(path).convert('RGB')
        reg = s.get('region')
        if reg:
            W0, H0 = im.size
            im = im.crop((int(W0 * reg[0]), int(H0 * reg[1]),
                          int(W0 * reg[2]), int(H0 * reg[3])))
        a = np.array(im)
        mg = magenta_mask(a)
        auto_c = line_edges(mg.mean(axis=0), mg.shape[1])
        auto_r = line_edges(mg.mean(axis=1), mg.shape[0])
        ce, re_ = s.get('colEdges'), s.get('rowEdges')
        if s.get('auto'):
            ce, re_ = ce or auto_c, re_ or auto_r
        forced = s.get('grid')
        if ce or re_:
            w, h = im.size
            if ce:
                cs = [(int(w * ce[i]), int(w * ce[i + 1])) for i in range(len(ce) - 1)]
            else:
                cs = detect(im)[1]
            if re_:
                rs = [(int(h * re_[i]), int(h * re_[i + 1])) for i in range(len(re_) - 1)]
            else:
                rs = detect(im)[0]
            ec, er = len(cs), len(rs)
            status = f'경계지정 {ec}x{er}'
        elif forced:
            ec, er = forced
            w, h = im.size
            cs = [(round(i * w / ec), round((i + 1) * w / ec)) for i in range(ec)]
            rs = [(round(j * h / er), round((j + 1) * h / er)) for j in range(er)]
            status = f'균등분할 {ec}x{er}'
        else:
            rs, cs = detect(im)
            ec, er = s.get('expect', [len(cs), len(rs)])
            status = ('OK' if (len(cs), len(rs)) == (ec, er)
                      else f'격자불일치 {len(cs)}x{len(rs)} != {ec}x{er}')

        pick = s.get('pickRows') or list(range(1, len(rs) + 1))
        drop = set(s.get('drop') or [])
        labels = s.get('labels')
        cb = s.get('cropBottom', 0.0)
        ct = s.get('cropTop', 0.0)
        rects = s.get('maskRects') or []
        inset = s.get('inset', 0.0)
        min_part = s.get('minPart', 0.0)

        # 한 시트를 행별로 다른 폴더로 쪼개는 모드
        # (예: 장비 시트 = 한 행이 한 부위, 한 열이 한 티어)
        row_folders = s.get('rowFolders')
        col_labels = s.get('colLabels')

        # 한 칸이 한 폴더로 가는 모드 (장인 무구: eq_{부위}/t11 한 장씩).
        # rowFolders 는 "행=폴더"라 한 부위에 티어가 여러 장일 때 쓰고,
        # 이건 "칸=폴더"라 부위마다 딱 한 장일 때 쓴다.
        cell_folders = s.get('cellFolders')
        cell_name = s.get('cellName', name)

        targets = cell_folders or row_folders or [name]
        for t in targets:
            d = os.path.join(OUT, t)
            os.makedirs(d, exist_ok=True)
            if not s.get('append') and not cell_folders:
                for f in os.listdir(d):
                    os.remove(os.path.join(d, f))
        d = os.path.join(OUT, name)

        n = 0
        fills: list[float] = []
        for ri, (y0, y1) in enumerate(rs, start=1):
            if ri not in pick:
                continue
            for ci, (x0, x1) in enumerate(cs, start=1):
                n += 1
                if n in drop:
                    continue
                cell = im.crop((x0, y0, x1, y1))
                if cb > 0 or ct > 0:
                    cell = cell.crop((0, int(cell.height * ct),
                                      cell.width, int(cell.height * (1 - cb))))
                if inset > 0:
                    iw, ih = int(cell.width * inset), int(cell.height * inset)
                    cell = cell.crop((iw, ih, cell.width - iw, cell.height - ih))
                if s.get('smooth'):
                    # 망점(하프톤)으로 칠한 시트를 위한 것.
                    #
                    # 원본 크기에서 이진화하면 점무늬가 그대로 남고, 그걸
                    # 줄이면 점끼리 간섭해서 **뿌옇고 가장자리가 지저분해진다.**
                    # 먼저 줄이면 점이 뭉개져 고른 회색이 되고, 그다음 이진화가
                    # 그 회색을 통짜 흰색이나 검정으로 떨어뜨린다.
                    #
                    # 사제 시트가 그랬다 — 서 있을 때는 멀쩡한데 옷을 망점으로
                    # 칠한 공격·기도 칸만 뿌옇게 나왔다.
                    g = cell.convert('L')
                    w0, h0 = g.size
                    sc = min(SIZE / max(w0, h0), 1.0)
                    if sc < 1.0:
                        g = g.resize((max(1, int(w0 * sc)), max(1, int(h0 * sc))),
                                     Image.LANCZOS)
                    cell = g
                mask = binarize(cell, s.get('thresh'))
                if s.get('paper'):
                    mask = on_paper(mask, np.array(cell))
                if s.get('invert'):
                    # 흰 배경 + 검은 글리프 시트 → 글리프를 흰색으로.
                    # ⚠ 마젠타는 휘도 105 라 그냥 반전하면 칸 테두리가 흰 액자로 남는다
                    mask = ~mask
                    mask[magenta_mask(np.array(cell))] = False
                for rx0, ry0, rx1, ry1 in rects:
                    ch, cw = mask.shape
                    mask[int(ch * ry0):int(ch * ry1), int(cw * rx0):int(cw * rx1)] = False
                if s.get('mirror'):
                    # 좌우가 뒤집혀 온 시트를 여기서 바로잡는다.
                    #
                    # 화면에서 뒤집는 방법도 있지만, 그러면 시트마다 다른
                    # 규칙을 렌더러가 알고 있어야 한다. 저장할 때 맞춰 두면
                    # "날아가는 그림은 오른쪽을 본다" 한 줄로 끝난다.
                    mask = mask[:, ::-1]
                if s.get('killCorner'):
                    ch, cw = mask.shape
                    mask[int(ch * (1 - CORNER)):, int(cw * (1 - CORNER)):] = False
                # 글자 제거는 트림 **전에** — 글자가 여백 밖에 있으면 트림 기준이 어긋난다
                mask = drop_small_parts(mask, min_part)
                # 바닥선도 트림 전에 — 지우고 나면 그림이 그만큼 작아진다
                if s.get('floor'):
                    mask = drop_floor(mask)
                box = trim(mask)
                if box is None:
                    n -= 1
                    continue
                r0, r1, c0, c1 = box
                out = to_png(mask[r0:r1, c0:c1])
                if cell_folders:
                    idx = n - len([x for x in drop if x < n])
                    if idx > len(cell_folders):
                        n -= 1
                        continue
                    folder = os.path.join(OUT, cell_folders[idx - 1])
                    os.makedirs(folder, exist_ok=True)
                    out.save(os.path.join(folder, f'{cell_name}.png'))
                elif row_folders:
                    fi = ri - 1
                    if fi >= len(row_folders):
                        n -= 1
                        continue
                    folder = os.path.join(OUT, row_folders[fi])
                    label = (col_labels[ci - 1] if col_labels and ci - 1 < len(col_labels)
                             else f'{ci:02d}')
                    out.save(os.path.join(folder, f'{label}.png'))
                else:
                    idx = n - len([x for x in drop if x < n])
                    label = labels[idx - 1] if labels and idx - 1 < len(labels) else f'{idx:02d}'
                    for one in (label if isinstance(label, list) else [label]):
                        out.save(os.path.join(d, f'{one}.png'))
                fills.append(float(mask[r0:r1, c0:c1].mean()))
                total += 1
        cnt = (len(cell_folders) if cell_folders
               else sum(len(os.listdir(os.path.join(OUT, t))) for t in row_folders)
               if row_folders else len(os.listdir(d)))
        """
        잘라낸 그림이 거의 꽉 차 있으면 **배경을 그림으로 읽은 것**이다.

        원인이 둘이고 방향이 반대다 —

          흰 배경 시트인데 `invert` 를 **안 붙였다**
          검은 배경 시트인데 `invert` 가 **남아 있다**

        뒤엣것이 더 고약하다. 반전으로 왔던 시트를 다시 뽑아서 파일 이름만
        갈아 끼우면, 설정에 걸어 뒀던 `invert` 가 그대로 남아 이번엔 반대로
        뒤집힌다 — 고친 것이 다시 망가지는데 설정은 안 건드렸으므로 왜인지
        찾기가 어렵다. 실제로 세 시트에서 한 번에 났다.

        그래서 지금 걸려 있는 `invert` 값을 같이 적는다. 그것만으로 어느
        쪽인지 바로 갈린다.
        """
        if fills and not s.get('allowFilled'):
            fills.sort()
            mid = fills[len(fills) // 2]
            if mid > 0.62:
                now = '켜져 있음' if s.get('invert') else '꺼져 있음'
                status += (f' ⚠ 채움률 {mid*100:.0f}% — 배경을 그림으로 읽었다'
                           f' (지금 invert 는 {now})')
        report.append((name, status, cnt))

    w = max(len(r[0]) for r in report) if report else 10
    for name, status, cnt in report:
        print(f'  {name.ljust(w)}  {str(cnt).rjust(3)}장  {status}')
    print(f'\n총 {total}장 → {OUT}/')
    # 한 세트만 잘랐을 때도 다시 쓴다.
    #
    # 전체 실행일 때만 쓰게 막아 뒀었다. 그런데 인덱스는 **디스크를 읽어서**
    # 만들므로 언제 써도 옳고, 안 쓰면 파일과 인덱스가 갈라진다.
    #
    # 가려 둔 대가가 컸다. `slice.py pb_creeper` 로 칸 구성을 고쳤더니 파일은
    # 바뀌었는데 인덱스는 옛 이름(`05`~`08`)을 그대로 가리켰고, 그게 배포할
    # 때 번들러에서 터졌다 — "Unable to resolve module .../05.png". 자른
    # 자리와 터지는 자리가 멀어서 원인을 찾는 데 시간이 든다.
    emit_index(cfg)


def emit_index(cfg):
    """Metro 는 정적 require 경로만 해석하므로 인덱스 모듈을 생성해 둔다."""
    lines = [
        '/**',
        ' * 스프라이트 에셋 인덱스 — **자동 생성 파일. 직접 수정하지 마세요.**',
        ' *   생성: python3 tools/slice.py',
        ' *   원본: assets/lending-image/, assets/new-image/ (마젠타 경계 시트)',
        ' */',
        '',
    ]
    sets = []
    ratios = {}
    names = []
    # 한 세트를 여러 항목으로 나눠 적을 수 있으므로(찢어진 시트) 이름은 중복 제거한다
    for s in cfg['sets']:
        for n in (s.get('cellFolders') or s.get('rowFolders') or [s['name']]):
            if n not in names:
                names.append(n)
    for name in names:
        d = os.path.join(OUT, name)
        if not os.path.isdir(d):
            continue
        files = sorted(f[:-4] for f in os.listdir(d) if f.endswith('.png'))
        if not files:
            continue
        sets.append((name, files))
        for f in files:
            with Image.open(os.path.join(d, f + '.png')) as im:
                w, h = im.size
            ratios['%s/%s' % (name, f)] = round(h / max(1, w), 4)

    for name, files in sets:
        lines.append(f'export const {name.upper()}_SPRITES = {{')
        for f in files:
            lines.append(f"  '{f}': require('../../assets/sprites/{name}/{f}.png'),")
        lines.append('} as const;')
        lines.append('')

    lines.append('export type SpriteSet = ' + ' | '.join(f"'{n}'" for n, _ in sets) + ';')
    lines.append('')
    lines.append('export const SPRITES: Record<SpriteSet, Record<string, number>> = {')
    for name, _ in sets:
        lines.append(f'  {name}: {name.upper()}_SPRITES,')
    lines.append('};')
    lines.append('')
    lines.append('/** 세트에서 키를 안전하게 꺼낸다. 없으면 undefined — 호출부가 대체 렌더를 하도록. */')
    lines.append('export function sprite(set: SpriteSet, key: string): number | undefined {')
    lines.append('  return SPRITES[set]?.[key];')
    lines.append('}')
    lines.append('')
    lines.append('/**')
    lines.append(' * 아직 없는 폴더를 문자열로 조회한다 (예: 티어별 장비 `eq_sword`).')
    lines.append(' * 아트가 도착하기 전에도 코드를 미리 붙여 둘 수 있게 하는 용도.')
    lines.append(' */')
    lines.append('export function spriteLoose(set: string, key: string): number | undefined {')
    lines.append('  return (SPRITES as Record<string, Record<string, number>>)[set]?.[key];')
    lines.append('}')
    lines.append('')
    lines.append('/**')
    lines.append(' * 그림의 **세로 비율** (높이 ÷ 폭).')
    lines.append(' *')
    lines.append(' * `Sprite` 는 정사각 상자에 `contain` 으로 그린다. 그래서 가로로 긴')
    lines.append(' * 그림은 상자 안에서 **위아래 가운데**에 놓이고, 발밑에 빈 자리가 생긴다 —')
    lines.append(' * 슬라임(192x128)이면 상자 높이의 17% 다.')
    lines.append(' *')
    lines.append(' * 그 빈 자리를 알아야 **발을 같은 높이에 맞출 수 있다.** 그냥 두면 한 줄에')
    lines.append(' * 섞여 선 놈들의 발 높이가 종마다 달라, 네 자리의 계단이 흐트러진다.')
    lines.append(' */')
    lines.append('export const SPRITE_RATIO: Record<string, number> = {')
    for k in sorted(ratios):
        lines.append("  '%s': %s," % (k, ratios[k]))
    lines.append('};')
    lines.append('')
    lines.append('/**')
    lines.append(' * 정사각 상자 안에서 그림 **바닥**이 상자 바닥에서 얼마나 떠 있나 (0~0.5).')
    lines.append(' *')
    lines.append(' * 세로가 더 길면 0 이다 — 높이를 꽉 채우므로 뜰 자리가 없다.')
    lines.append(' * 모르는 그림도 0 으로 둔다. 틀리면 그림자가 조금 낮게 깔릴 뿐이다.')
    lines.append(' */')
    lines.append('export function spriteGap(set: string, key: string): number {')
    lines.append("  const r = SPRITE_RATIO[`${set}/${key}`];")
    lines.append('  if (!r || r >= 1) return 0;')
    lines.append('  return (1 - r) / 2;')
    lines.append('}')
    lines.append('')
    out = 'src/ui/spriteAssets.ts'
    open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
    print(f'인덱스 생성 → {out} ({len(sets)}세트)')


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else None)
