# -*- coding: utf-8 -*-
"""
상태 효과 로고 프롬프트 생성기 — `docs/STATUS_ICON_PROMPTS.md`.

    python tools/gen-status.py

## 무엇인가

출혈 · 기절 · 침묵처럼 **한동안 걸려 있다가 풀리는 것**들의 로고다. 걸린
사람의 이름표 옆에 12~16px 로 붙는다.

## 왜 보스 패시브 로고와 다른 파일인가

붙는 자리가 다르고 수명이 다르다. 패시브 로고(`gen-boss.py`)는 **보스 하나
에게 싸우는 내내** 화면 위쪽에 떠 있고, 이쪽은 **누구에게든 몇 초씩** 붙었다
사라진다. 그래서 개수도 다르다 — 패시브는 넷이고 이건 열둘이다.

**다만 실루엣은 열여섯이 다 같이 안 겹쳐야 한다.** 한 화면에 동시에 뜨기
때문이다. 아래 `CLASH` 가 그 검사를 대신한다.

## 어디서 오는지는 소스에서 읽는다

"이 상태를 누가 거나" 는 손으로 안 적는다. `gen-boss.py` 의 `BOSSES` 를
그대로 읽어서, 기술 설명에 그 낱말이 들어 있는 우두머리를 찾는다 — 손으로
옮겨 적은 표는 보스 수치를 고치는 순간 거짓말이 된다.
"""
import importlib.util
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    ICON_STYLE, NL, NOTEXT, PIXEL_STYLE, block, grid, labels_of, rows_of,
    table_of,
)

OUT = 'docs/STATUS_ICON_PROMPTS.md'


def load_bosses():
    """`gen-boss.py` 에서 우두머리 목록만 꺼낸다.

    파일 이름에 붙임표가 있어 그냥 `import` 가 안 된다. 그리고 저 파일은
    `__main__` 일 때만 문서를 쓰므로, 이렇게 불러와도 파일이 안 만들어진다.
    """
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location(
        'genboss', os.path.join(here, 'gen-boss.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.BOSSES


# ══ 상태 효과 ═════════════════════════════════════════════════
#
# **뜻으로 묶었지 맛으로 안 묶었다.**
#
# 맹독 · 강산성 · 독성 포자 · 부패의 악취 · 소화액은 이름이 다섯인데 규칙은
# 하나다 — 0.5초마다 마법 피해. 12px 에서 그 다섯을 갈라 그릴 방법이 없고,
# 갈라 봐야 플레이어가 알아야 할 것("지금 마법으로 갉이고 있다")은 같다.
# 그래서 로고는 **규칙 하나에 하나**다.
#
# 물리 지속 피해(출혈)만 따로 둔다. 저건 막는 스탯이 달라서
# (`core/chars` 의 `Armor`) 실제로 다른 규칙이다.

STATUS = [
    # ── 디버프 ──────────────────────────────────────────────
    ('st_bleed', '출혈', '나쁜', '물리 지속 피해', r'출혈',
     'TWO PARALLEL SLASHES. Two thick straight bars running corner to corner '
     'diagonally across the cell, top-right to bottom-left, each a fifth of the '
     'cell wide, with a gap of the same width between them. The upper one is '
     'longer and runs the full diagonal; the lower one is two-thirds as long. Both '
     'ends of both bars are cut flat and square, not tapered to points. Nothing '
     'else in the cell. Squint test: two slashes.'),

    ('st_poison', '중독', '나쁜', '마법 지속 피해 (맹독·산성·포자·부패 전부)',
     r'지속 마법 피해',
     'ONE FALLING DROP. A single solid teardrop filling the whole cell — a fat '
     'round bottom taking two-thirds of the height, narrowing upward into a thick '
     'neck that ends in a blunt point at the top edge. The widest part is at the '
     'bottom. It is one smooth bulging mass with no notch, no cut and no second '
     'shape. Squint test: a drop.'),

    ('st_stun', '기절', '나쁜', '행동 불가', r'기절',
     'A THICK BOLT. One solid zigzag running top to bottom: a wide bar coming down '
     'from the top edge to the middle, jogging hard sideways by half the cell '
     'width, then continuing down to the bottom edge. The bar is a quarter of the '
     'cell wide along its whole length and the corners at the jog are sharp right '
     'angles, not curves. It touches the top and bottom edges. Squint test: a bolt.'),

    ('st_silence', '침묵', '나쁜', '스킬 사용 불가', r'침묵',
     'ONE HEAVY BAR. A single solid horizontal bar across the middle of the cell, '
     'running the FULL width edge to edge, a third of the cell tall, with flat '
     'square ends. There is nothing above it and nothing below it — the rest of '
     'the cell is empty. It is the simplest icon of the set and it must stay that '
     'way: a mouth stopped. Squint test: a bar.'),

    ('st_slow', '둔화', '나쁜', '공격속도 감소', r'공격속도[^,)]*감소',
     'ONE DOWNWARD CHEVRON. A single thick V shape pointing DOWN, filling the '
     'middle of the cell — two heavy arms meeting at a point at the bottom, each '
     'arm a quarter of the cell wide, the open ends reaching the upper left and '
     'upper right corners. One chevron only. Squint test: a down arrowhead.'),

    ('st_weak', '약화', '나쁜', '공격력 감소', r'공격력 \d+% 감소',
     'A SNAPPED BLADE. A short stubby wedge standing upright in the lower half of '
     'the cell — wide and flat at the bottom, narrowing as it rises, but CUT OFF '
     'FLAT halfway up with a coarse jagged break of three big teeth across the '
     'top. It reaches only halfway up the cell and it has no point. It is the '
     'short broken twin of the rage icon and the difference in HEIGHT is the '
     'whole read. Squint test: a broken stump.'),

    ('st_break', '파쇄', '나쁜', '방어력 감소 (0으로 만드는 것 포함)',
     r'방어력[^,)]*(?:감소|0으로)',
     'A BROKEN BLOCK. A solid rectangle filling the whole cell, with ONE '
     'horizontal groove across the middle a tenth of the cell tall — and the '
     'entire TOP RIGHT QUARTER of the rectangle is missing, bitten away in a '
     'coarse stepped break of three big square steps. The bite is a quarter of the '
     'whole shape, so it is impossible to miss. It is the broken twin of the guard '
     'icon. Squint test: a block with a corner gone.'),

    ('st_wither', '시듦', '나쁜', '받는 치유량 감소', r'치유량[^,)]*감소',
     'A CROSS WITH NO TOP. A thick upright bar standing in the middle of the cell '
     'from the bottom edge up to two-thirds height, crossed near its top by a '
     'thick horizontal bar running the full width — a T shape, arms a third of the '
     'cell wide. There is NO arm above the crossbar. It is the regen cross with '
     'the top broken off, and that missing arm is the whole read. Squint test: a T.'),

    # ── 버프 ────────────────────────────────────────────────
    ('st_rage', '격노', '좋은', '공격력 증가', None,
     'A WHOLE BLADE. A tall narrow wedge standing upright and filling the FULL '
     'height of the cell — wide and flat at the bottom edge, tapering evenly all '
     'the way up to a single sharp point at the top edge. No crossguard, no hilt, '
     'no notch, nothing but the wedge. It is the tall whole twin of the weak icon '
     'and the difference in HEIGHT is the whole read. Squint test: a blade.'),

    ('st_guard', '견고', '좋은', '방어력 증가', r'방어력[^,)]*증가',
     'A WHOLE BLOCK. A solid rectangle filling the whole cell edge to edge, with '
     'ONE horizontal groove across the middle a tenth of the cell tall, dividing '
     'it into two equal courses. Every corner is square and present. It is the '
     'whole twin of the break icon. Squint test: a solid block.'),

    ('st_regen', '재생', '좋은', '지속 회복', r'최대 체력의[^,)]*회복',
     'A THICK CROSS. A plus sign filling the whole cell — a vertical bar from the '
     'top edge to the bottom edge and a horizontal bar from the left edge to the '
     'right edge, both a third of the cell wide, crossing at the centre. All four '
     'arms are the same length and all four ends are cut flat. Squint test: a '
     'plus.'),

    ('st_haste', '신속', '좋은', '공격속도 증가', None,
     'TWO UPWARD CHEVRONS. Two thick chevrons pointing UP, stacked one above the '
     'other with a gap between them — each two heavy arms meeting at a point at '
     'the top, each arm a fifth of the cell wide. The lower one is wider and '
     'reaches both side edges; the upper one is narrower and sits above it. TWO of '
     'them, and that count is what separates this from the slow icon as much as '
     'the direction does. Squint test: two up arrowheads.'),
]


# ══ 실루엣이 겹치면 안 된다 ═══════════════════════════════════
#
# 상태 로고 열둘과 보스 패시브 로고 넷이 **한 화면에 같이 뜬다.** 그래서
# 열여섯의 윤곽이 다 갈려야 한다. 아래 표가 그 검사다 — 프롬프트에 그대로
# 들어가고, 새 로고를 넣을 때 여기에 한 줄이 안 들어가면 그건 아직 안 갈린
# 것이다.

SHAPES = [
    ('st_bleed', '사선 막대 둘'), ('st_poison', '한쪽 먹힌 원'),
    ('st_stun', '번개(ㄹ 꺾임)'), ('st_silence', '가로 막대 하나'),
    ('st_slow', '아래 갈매기 하나'), ('st_haste', '위 갈매기 둘'),
    ('st_rage', '길쭉한 칼'), ('st_weak', '부러진 짧은 칼'),
    ('st_guard', '꽉 찬 사각'), ('st_break', '귀퉁이 떨어진 사각'),
    ('st_regen', '십자'), ('st_wither', 'ㅜ 자'),
    ('bp_thorn', '여섯 갈래 별 (보스 패시브)'),
    ('bp_viscous', '물방울 (보스 패시브)'),
    ('bp_rot', '세 갈래로 솟은 덩이 (보스 패시브)'),
    ('bp_ward', '방패 (보스 패시브)'),
]

# 서로 제일 헷갈리기 쉬운 짝. 프롬프트에 못을 박아 둔다
CLASH = [
    ('st_rage', 'st_weak', '둘 다 칼이다. **높이**로 가른다 — 격노는 칸을 꽉 '
     '채우고 약화는 절반까지만 온다'),
    ('st_guard', 'st_break', '둘 다 사각이다. **귀퉁이 하나가 통째로 없는가**로 '
     '가른다. 물어뜯긴 자리가 전체의 4분의 1 이라 12px 에서도 남는다'),
    ('st_regen', 'st_wither', '둘 다 십자다. **위 팔이 있는가**로 가른다. 팔 '
     '두께가 칸의 3분의 1 이라 없으면 바로 보인다'),
    ('st_slow', 'st_haste', '둘 다 갈매기다. 방향이 반대이고, **개수도 다르다** '
     '(하나 / 둘). 방향만으로 갈랐다가 뒤집힌 채로 그려져 오면 알 방법이 없다'),
    ('st_poison', 'st_break', '둘 다 한쪽이 크게 떨어져 나간 모양이다. 중독은 '
     '**원**이고 파쇄는 **사각**이다 — 그것 하나로 갈린다'),
    ('st_silence', 'st_bleed', '둘 다 막대다. 침묵은 **가로 하나**, 출혈은 '
     '**사선 둘**이다'),
]


# 몇 판이 걸어야 하는지. **찾은 것과 이게 다르면 문서를 안 쓴다.**
#
# 자동으로 찾는 것만으로는 부족하다. 식이 조금 어긋나도 그럴듯한 답이 나오기
# 때문이다 — 실제로 처음엔 약화가 여섯 판(정답 하나)으로, 파쇄가 없는 것
# (정답 둘)으로 나왔고 표는 멀쩡해 보였다. 답을 따로 적어 두고 맞춰 본다.
EXPECT = {
    'st_bleed': [5, 7, 11],
    'st_poison': [3, 8, 10, 12, 14, 15],
    'st_stun': [6, 13, 17],
    'st_silence': [15],
    'st_slow': [4, 10, 12],
    'st_weak': [17],
    'st_break': [15, 16],
    'st_wither': [14],
    'st_guard': [20],
    'st_regen': [20],
}


def sources(bosses):
    """각 상태를 거는 우두머리를 소스에서 찾는다.

    `gen-boss.py` 의 기술·패시브 설명을 그대로 읽는다. 손으로 옮겨 적은 표는
    보스 수치를 고치는 순간 거짓말이 되기 때문이다.

    **낱말이 아니라 식으로 찾는다.** 낱말만 보면 "공격력의 200%" 의 '공격력'
    과 "공격속도 50% 감소" 의 '감소' 가 만나서 약화가 아닌 것을 약화로 잡는다.
    """
    out = {}
    for sid, _ko, _side, _mean, pat, _art in STATUS:
        if not pat:
            out[sid] = []
            continue
        hit = []
        for b in bosses:
            texts = [does for _s, _k, does, _a in b['skills']]
            if b['passive']:
                texts.append(b['passive'][1])
            if any(re.search(pat, t) for t in texts):
                hit.append(b['stage'])
        out[sid] = sorted(set(hit))

    # 어긋나면 멈춘다 — 틀린 표는 없는 것보다 나쁘다
    bad = {k: (v, out.get(k)) for k, v in EXPECT.items() if out.get(k) != v}
    assert not bad, ('거는 곳이 기대와 다릅니다. gen-boss 의 기술 설명이 '
                     '바뀌었으면 EXPECT 를 같이 고치세요: %r' % bad)
    return out


PAGE = """# 상태 효과 로고

**이 파일은 자동 생성됩니다** — `python tools/gen-status.py`.

걸린 사람의 이름표 옆에 붙는 작은 로고 **열둘**입니다. 출혈처럼 한동안
걸려 있다가 풀리는 것들입니다.

보스 패시브 로고 넷은 따로 있습니다
([`BOSS_PASSIVE_PROMPTS.md`](BOSS_PASSIVE_PROMPTS.md)) — 저건 보스 하나에게
싸우는 내내 붙어 있고, 이건 누구에게든 몇 초씩 붙었다 사라집니다.

## 맛이 아니라 규칙으로 묶었습니다

맹독 · 강산성 · 독성 포자 · 부패의 악취 · 소화액은 이름이 다섯인데 규칙은
하나입니다 — 0.5초마다 마법 피해. 12px 에서 그 다섯을 갈라 그릴 방법이
없고, 갈라 봐야 플레이어가 알아야 할 것("지금 마법으로 갉이고 있다")은
같습니다. 그래서 **규칙 하나에 로고 하나**입니다.

물리 지속 피해(출혈)만 따로 뒀습니다. 저건 **막는 스탯이 달라서**
(`core/chars` 의 `Armor`) 실제로 다른 규칙입니다.

## 목록

| 로고 | 이름 | 좋고 나쁨 | 뜻 | 거는 곳 |
|---|---|---|---|---|
%(rows)s

## 안 만든 것

- **관통 · 방어 무시** (9·11·18판 우두머리) — **지속이 없습니다.** 그 한 대가
  방어를 뚫고 끝나므로 걸려 있을 것이 없고, 걸려 있지 않은 것에 로고를 붙이면
  플레이어가 "언제 풀리나" 를 기다리게 됩니다. 파쇄(`st_break`)는 한동안
  방어력이 깎여 있는 것만입니다 (15·16판).
- **스킬 게이지 차감** (20판 실바누스) — 이것도 한 번에 끝납니다. 게이지가
  줄어드는 것은 게이지 막대가 이미 말합니다.
- **보스가 받는 피해 20%% 감소** (20판) — 패시브라 상태가 아니라 보스 로고
  쪽입니다 ([`BOSS_PASSIVE_PROMPTS.md`](BOSS_PASSIVE_PROMPTS.md) 의 `bp_ward`).

## 좋고 나쁨은 그림이 아니라 화면이 말합니다

흑백 2색이라 초록 테두리·빨간 테두리를 쓸 수가 없습니다. 그래서 로고는
**무엇인지만** 말하고, 좋은 것인지 나쁜 것인지는 화면이 자리로 말합니다 —
좋은 것은 이름표 왼쪽, 나쁜 것은 오른쪽 같은 식입니다.

그래서 로고를 그릴 때 "나쁜 것이니까 어둡게" 같은 것을 하면 안 됩니다.
열둘이 **같은 무게, 같은 채움**이어야 합니다.

## 열여섯이 다 갈려야 합니다

상태 로고 열둘과 보스 패시브 로고 넷이 **한 화면에 같이 뜹니다.**

| 로고 | 윤곽 |
|---|---|
%(shapes)s

### 특히 헷갈리기 쉬운 짝

%(clash)s
## 셀 순서

%(table)s
## 프롬프트

%(prompt)s
## 슬라이서 설정

```json
{ "file": "<파일명>", "name": "status_icon", "expect": [12, 1],
  "labels": [%(labels)s] }
```

한 줄에 열둘이면 셀 하나가 512px 이라 시트가 6144x512 입니다. 너무 길면
**여섯씩 두 줄**로 받아도 됩니다 — 그때는 `"expect": [6, 2]` 로 바꾸고
프롬프트의 마지막 문단(SHEET LAYOUT)을 `6 columns x 2 rows` 로 고치세요.
읽는 차례는 왼쪽에서 오른쪽, 그다음 아래 줄입니다.

## 다시 뽑을 때

**둘이 비슷하게 나왔을 때**

```
Two of these icons have become confusable at small size. They will be shown at 12
to 16 pixels, where only the OUTLINE survives. Redraw the weaker one so that its
outline differs from the other in overall shape, not in interior detail. Keep every
other cell exactly as it is.
```

**속이 비어서 나왔을 때** (제일 자주 납니다)

```
The icons are drawn as hollow outlines. At 14 pixels an outline and the hole inside
it merge into a grey smudge. Redraw every icon as a SOLID FILLED WHITE MASS on pure
black, with at most one notch cut into it, and that notch at least a fifth of the
width.
```

**칸 안에서 작게 나왔을 때**

```
The icons are drawn small inside their cells with empty margins. Each shape must
touch or nearly touch all four sides of its own cell. Redraw them larger.
```
"""


def build():
    bosses = load_bosses()
    src = sources(bosses)

    rows = []
    for sid, ko, side, mean, _keys, _art in STATUS:
        who = src.get(sid) or []
        where = ('%s판 우두머리' % '·'.join(str(s) for s in who)) if who else '—'
        if sid == 'st_rage':
            where = '보조가 곁에 섰을 때 (`core/party` 의 `supportMul`)'
        if sid == 'st_haste':
            where = '아직 없음 — 둔화의 짝으로 자리만 열어 둡니다'
        rows.append('| `%s` | %s | %s | %s | %s |' % (sid, ko, side, mean, where))

    cells = [(sid, ko, art) for sid, ko, _s, _m, _k, art in STATUS]

    clash = NL.join(
        '- **%s ↔ %s** — %s' % (a, b, why) for a, b, why in CLASH) + NL

    prompt = block(
        NOTEXT,
        'SUBJECT: a single sheet of %d ICONS in one row, left to right. They are a '
        'matched set — same weight, same fill, same size within their cells, drawn '
        'by the same hand on the same day.' % len(STATUS) + NL + NL
        + rows_of(cells, 'The %d cells, in this exact order:' % len(STATUS)),
        PIXEL_STYLE,
        ICON_STYLE,
        'THEY ALL WEIGH THE SAME.' + NL
        + '- Half of these are bad things and half are good things, but NOTHING in '
        'the drawing may say which is which. No icon is darker, thinner, spikier '
        'or gloomier than another. The game says good or bad by where it puts '
        'them on screen; the icon only says WHAT.' + NL
        + '- Every icon uses the same stroke weight and the same solid fill.',
        'THEY MUST NOT BE CONFUSABLE. Put all %d finished icons side by side and '
        'squint until they blur. If any two have a similar outline, redraw the '
        'weaker one — the outline is the only thing that survives at 14 pixels.'
        % len(STATUS) + NL + NL
        + 'FOUR PAIRS ARE DELIBERATELY RELATED AND MUST STILL SEPARATE:' + NL
        + '- Cell 9 (whole blade, full height) vs cell 6 (snapped blade, half '
        'height) — separated by HEIGHT.' + NL
        + '- Cell 10 (whole block) vs cell 7 (block with a quarter bitten out) — '
        'separated by the MISSING CORNER.' + NL
        + '- Cell 11 (four-armed cross) vs cell 8 (three-armed T) — separated by '
        'the MISSING TOP ARM.' + NL
        + '- Cell 5 (one chevron, pointing down) vs cell 12 (two chevrons, '
        'pointing up) — separated by DIRECTION and by COUNT.',
        grid(len(STATUS), 1),
    )

    return PAGE % {
        'rows': NL.join(rows),
        'shapes': NL.join('| `%s` | %s |' % (i, s) for i, s in SHAPES),
        'clash': clash,
        'table': table_of(cells),
        'prompt': prompt,
        'labels': labels_of(cells),
    }


if __name__ == '__main__':
    open(OUT, 'w', encoding='utf-8').write(build())
    bad = sum(1 for s in STATUS if s[2] == '나쁜')
    print('%s — 상태 로고 %d개 (나쁜 %d · 좋은 %d)'
          % (OUT, len(STATUS), bad, len(STATUS) - bad))
