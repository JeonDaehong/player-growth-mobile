"""마젠타 경계 검출 검증용."""
import sys, os
from PIL import Image
import numpy as np

def magenta_mask(a):
    r, g, b = a[:,:,0].astype(int), a[:,:,1].astype(int), a[:,:,2].astype(int)
    return (r > 150) & (b > 150) & (g < 110) & (r - g > 60) & (b - g > 60)

def bands(mask_1d, min_len=2):
    """True 구간을 (start, end) 리스트로."""
    out, s = [], None
    for i, v in enumerate(mask_1d):
        if v and s is None: s = i
        elif not v and s is not None:
            if i - s >= min_len: out.append((s, i))
            s = None
    if s is not None and len(mask_1d) - s >= min_len: out.append((s, len(mask_1d)))
    return out

def grid(path, frac=0.55):
    im = Image.open(path).convert('RGB')
    a = np.array(im)
    m = magenta_mask(a)
    h, w = m.shape
    rows = m.mean(axis=1) > frac       # 가로로 쭉 뻗은 마젠타 = 수평 구분선
    cols = m.mean(axis=0) > frac
    hb, vb = bands(rows), bands(cols)
    # 구분선 사이 = 셀
    def spans(bs, total):
        out = []
        prev = 0
        for s, e in bs:
            if s - prev > total * 0.02: out.append((prev, s))
            prev = e
        if total - prev > total * 0.02: out.append((prev, total))
        return out
    return im, spans(hb, h), spans(vb, w), m.mean()

if __name__ == '__main__':
    SRC = 'assets/lending-image'
    for f in sorted(os.listdir(SRC)):
        if f.startswith('.'): continue
        p = os.path.join(SRC, f)
        try:
            im, rs, cs, cov = grid(p)
            print(f"{f[:46]:48s} {im.width:5d}x{im.height:<5d} 격자 {len(cs)}열 x {len(rs)}행  마젠타 {cov*100:.1f}%")
        except Exception as e:
            print(f"{f[:46]:48s} ERROR {e}")
