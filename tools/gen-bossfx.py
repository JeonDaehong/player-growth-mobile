# -*- coding: utf-8 -*-
"""
보스 공격 이펙트 프롬프트 생성기 — `docs/BOSS_FX_PROMPTS.md`.

    python tools/gen-bossfx.py

## 무엇인가

보스 기술 중에는 **몸에서 떨어져 나와 따로 그려져야 하는 것**이 있다. 6판
페트로스가 던지는 바위, 3판 아시두스가 뱉는 산성 덩이, 20판 실바누스의 벼락
같은 것들이다.

## 왜 시트에 안 그리나

보스 시트(`gen-boss.py`)에 **못 그린다.** 이유가 둘이다.

**자리가 다르다.** 바위는 보스 위에 있는 게 아니라 **파티 머리 위**에
떨어진다. 스프라이트에 그려 넣으면 보스 옆에 붙어 있는 장식이 되고, 정작
맞는 쪽에는 아무 일도 안 일어난다.

**수명이 다르다.** 보스 시트의 칸은 자세 하나가 멈춰 있는 그림이고, 이건
**나타났다 사라지는 것**이다. 같은 시트에 넣으면 애니메이션 한 벌 안에
수명이 다른 두 가지가 섞인다.

그래서 보스 프롬프트마다 "충격 자국·고리·갈라진 땅을 그리지 마라" 고 못을
박아 두었다. 그것들을 **여기서** 그린다.

## 두 종류뿐이다

    날아가는 것   3칸. 같은 것이 화면을 가로지르다 사라진다
    터지는 것     5칸. 한 자리에서 피었다 진다

보스마다 하나씩 만들면 스무 벌이 되는데, 실제로 필요한 것은 일곱이다 —
가시는 5판과 11판이 같이 쓰고, 포자는 4판과 14판이 같이 쓴다. 12px 짜리
로고와 같은 이유다: 맛이 아니라 **하는 일**로 묶는다.
"""
import importlib.util
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    NL, NOTEXT, NO_GROUND, PIXEL_STYLE, block, grid, labels_of, rows_of,
    table_of,
)

OUT = 'docs/BOSS_FX_PROMPTS.md'


def load_bosses():
    """`gen-boss.py` 에서 우두머리 목록만 꺼낸다 (`gen-status.py` 와 같은 방법)."""
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location(
        'genboss', os.path.join(here, 'gen-boss.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.BOSSES


# ══ 규칙 ══════════════════════════════════════════════════════

EFFECT = """IT IS NOT A CREATURE. IT IS A THING THAT HAPPENS.

Everything else drawn for this game is alive. This is not — it has no eyes, no
mouth, no face, and nothing that could be read as one. If any cell could be
mistaken for a small monster, it is wrong.

- WHITE ON PURE BLACK, 1-bit, no greys. The game composites this over the stage
  and the black becomes transparent.
- IT IS SEEN FOR ABOUT A THIRD OF A SECOND at roughly 40 to 60 pixels. Detail
  below that size is not merely wasted, it turns into grain that flickers.
- ONE SHAPE PER CELL, or a few clearly separated pieces. Not a spray of dots.
- NO GROUND, NO SHADOW, NO IMPACT RING, NO SPEED ARCS DRAWN AS SWOOSHES. If it
  is travelling, say so with the SHAPE — leaning, stretched, with two or three
  straight trailing lines at most.
- NO TEXT, NO FRAME, NO BORDER."""


TRAVEL = """THE 3 CELLS ARE ONE THING TRAVELLING AND DYING.

The game moves this across the screen itself; the three cells are its LIFE, not
its path. Do not draw the same picture three times and do not draw three
different objects.

- Cell 1 — whole, solid, at its densest. This is what it looks like the moment it
  leaves the boss.
- Cell 2 — the same object, still clearly the same shape and size, but beginning
  to come apart: one or two pieces have separated and trail behind it.
- Cell 3 — mostly gone. A third of the mass at most, broken into three or four
  separate fragments, spread wider than the original outline.

The silhouette in cell 1 is the one the player actually reads. Make that one
count."""


PLAYOUT = """THE 5 CELLS ARE ONE EVENT PLAYING OUT IN ONE PLACE.

This does not travel. It appears where the party is standing, does its work, and
goes. The five cells are the whole of it, in order, and they are drawn at the same
scale from the same viewpoint.

- Cell 1 — the start. SMALL and tight. Whatever is coming has only just begun.
- Cell 2 — growing fast, still dense.
- Cell 3 — the largest and heaviest cell. This is the one the player actually
  sees, so it carries the whole read.
- Cell 4 — spreading and thinning, wider than cell 3 but far less solid.
- Cell 5 — nearly gone. Two or three faint remnants, well spread.

The centre of the event stays in the same place in all five cells. If it drifts,
the effect looks like it is sliding off the character it is supposed to be on."""


# ══ 이펙트 ════════════════════════════════════════════════════
#
# `kind` 가 칸 수를 정한다 — 손으로 적게 하면 언젠가 5칸짜리에 3을 적는다.

FX = [
    # ── 날아가는 것 (3칸) ────────────────────────────────────
    ('bfx_rock', '떨어지는 암석', 'travel', [6],
     'A FALLING BOULDER — angular, not round. One solid rock with six or seven '
     'FLAT STRAIGHT FACETS meeting at hard corners, clearly wider than it is tall, '
     'tilted well off level so it reads as tumbling rather than sitting. Two short '
     'straight lines trail from its upper corners.',
     'The same boulder, still whole and the same size, now steeper in its tilt, '
     'with TWO small chips broken off its trailing edge and hanging just behind '
     'it.',
     'Broken. FOUR angular fragments of clearly different sizes, spread wider than '
     'the original boulder was, no two the same shape, none of them round. The '
     'largest is a third of the original. Nothing whole is left.'),

    ('bfx_thorn', '날아가는 가시', 'travel', [5, 11],
     'A THROWN SPIKE. One long straight thorn, thick at the base and tapering to a '
     'hard point, three times as long as it is wide, lying at a shallow angle with '
     'the point leading. It is one clean solid wedge with no barbs and no curve.',
     'The same spike, same length, now with a HAIRLINE SPLIT running back from the '
     'base and one small sliver separated and trailing behind it.',
     'Shattered. THREE short slivers of different lengths, all still pointed, '
     'spread apart and no longer aligned with each other. Together they are half '
     'the mass of cell 1.'),

    ('bfx_glob', '날아가는 산성 덩이', 'travel', [3],
     'A THROWN GLOB. One heavy blob, wider at the front than the back and drawn '
     'out into a short tail behind — the shape of something thrown hard. Its '
     'outline BULGES unevenly, no two curves the same, and TWO small beads have '
     'already separated and hang just behind the tail.',
     'The same glob, same size, now sagging out of shape: the front has flattened '
     'and spread sideways, and FOUR beads trail behind it in a loose line.',
     'Coming apart. FIVE separate beads of different sizes with no main mass left '
     'at all, spread across a width twice the original glob. This is the only one '
     'of the three travelling effects that ends as many small round pieces rather '
     'than sharp fragments.'),

    # ── 자리에서 터지는 것 (5칸) ─────────────────────────────
    ('bfx_spore', '퍼지는 포자', 'playout', [4, 14],
     'A tight knot of eight small round spores packed close together, no wider '
     'than a fist, all touching.',
     'The knot has opened to about twice that width. Around twenty spores now, '
     'still dense in the middle, a few beginning to separate at the edges.',
     'THE FULL BLOOM. A broad even CLOUD of forty or more round spores of two or '
     'three different sizes, filling most of the cell, densest at the centre and '
     'thinning evenly in every direction. It has NO direction of travel and NO '
     'edge you could draw a line along — a cloud, not a puff aimed anywhere.',
     'Wider than cell 3 but much thinner. Around twenty-five spores, the middle '
     'now nearly empty so the cloud reads as a loose ring rather than a mass.',
     'Six spores left, far apart, near the outer edge of where the cloud was.'),

    ('bfx_drip', '내리는 융해 액', 'playout', [8, 12],
     'Three short heavy drops hanging at the TOP of the cell, each with a rounded '
     'bottom and a thick neck, not yet fallen.',
     'The three have stretched down into long streaks reaching a third of the way '
     'down, each still ending in a heavy bead, and three more drops have formed '
     'above them.',
     'THE FULL CURTAIN. Nine or ten streaks of clearly different lengths hanging '
     'from the top of the cell to different depths — the longest reaching '
     'four-fifths of the way down, the shortest a quarter — each one thick, '
     'straight and ending in a heavy rounded bead. They are evenly spaced across '
     'the full width. NOTHING reaches the bottom edge and nothing pools: this is '
     'liquid in the air, never liquid on a floor.',
     'The streaks have broken. Their upper halves are gone and what is left is '
     'twelve separate beads of different sizes at different heights, still roughly '
     'in the columns the streaks came down.',
     'Four beads left, low in the cell, well apart, small.'),

    ('bfx_miasma', '피어오르는 부패', 'playout', [15],
     'A low flat smear along the BOTTOM of the cell, wide and only a few pixels '
     'tall, with a ragged upper edge.',
     'The smear has swelled upward into three squat lobes of different heights, '
     'still connected along the bottom.',
     'THE FULL HAZE. A heavy irregular mass rising from the bottom edge to '
     'three-quarters of the cell height, WIDER AT THE TOP THAN AT THE BOTTOM so it '
     'overhangs — the opposite shape to the spore cloud, which is widest in the '
     'middle. Its upper edge is broken into five or six rounded billows of '
     'different sizes; its interior is solid white with four or five dark holes '
     'through it. It never leaves the bottom of the cell.',
     'The mass has torn into three separate billows that have lifted clear of the '
     'bottom edge, each with holes through it, drifting apart.',
     'Two thin ragged wisps high in the cell, small, mostly holes.'),

    ('bfx_bolt', '내리치는 벼락', 'playout', [20],
     'A single short jagged spark high at the TOP of the cell, no longer than a '
     'fifth of the height, with two hard right-angle bends in it.',
     'It has grown downward into a zigzag reaching halfway down the cell, one '
     'clean line, three bends, no branches yet.',
     'THE FULL STRIKE. One thick bolt running the ENTIRE height of the cell from '
     'top edge to bottom edge, with five or six hard right-angle bends and THREE '
     'shorter branches breaking off it at sharp angles — the branches stop in mid '
     'air and do not reach any edge. Every segment is straight with square-cut '
     'ends; there is no curve, no taper, and no glow anywhere in this effect. It '
     'is the brightest and hardest-edged cell in this whole document.',
     'The main bolt has broken into four separate straight segments still roughly '
     'in line, the branches gone, the gaps between segments as wide as the '
     'segments themselves.',
     'Two short straight segments left, far apart, one near the top and one near '
     'the bottom of where the bolt was.'),
]

KIND = {
    'travel': (3, '날아가는 것', TRAVEL, ['나감', '갈라짐', '사라짐']),
    'playout': (5, '터지는 것', PLAYOUT, ['시작', '커짐', '절정', '옅어짐', '끝']),
}


PAGE = """# 보스 공격 이펙트

**이 파일은 자동 생성됩니다** — `python tools/gen-bossfx.py`.

보스 기술 중 **몸에서 떨어져 나와 따로 그려져야 하는 것** 일곱입니다.
6판 페트로스가 던지는 바위, 3판 아시두스가 뱉는 산성 덩이, 20판 실바누스의
벼락 같은 것들입니다.

## 왜 보스 시트에 안 그립니까

**자리가 다릅니다.** 바위는 보스 위가 아니라 **파티 머리 위**에 떨어집니다.
보스 스프라이트에 그려 넣으면 보스 옆에 붙은 장식이 되고, 정작 맞는 쪽에는
아무 일도 안 일어납니다.

**수명이 다릅니다.** 보스 시트의 칸은 자세 하나가 멈춰 있는 그림이고, 이건
나타났다 사라지는 것입니다. 한 시트에 섞으면 애니메이션 한 벌 안에 수명이
다른 두 가지가 들어갑니다.

그래서 보스 프롬프트마다 *"충격 자국·고리·갈라진 땅을 그리지 마라"* 고 못을
박아 두었습니다 ([`BOSS_ART_PROMPTS.md`](BOSS_ART_PROMPTS.md)). 그것들을
여기서 그립니다.

## 일곱뿐입니다

보스마다 하나씩 만들면 스무 벌인데, 실제로 필요한 것은 일곱입니다 — 가시는
5판과 11판이 같이 쓰고, 포자는 4판과 14판이 같이 씁니다. 상태 로고와 같은
이유입니다: **맛이 아니라 하는 일로 묶습니다.**

| 이펙트 | 무엇 | 칸 | 쓰는 보스 |
|---|---|---|---|
%(rows)s

## 두 종류뿐입니다

| 종류 | 칸 | 무엇 |
|---|---|---|
| 날아가는 것 | 3칸 | 같은 것이 화면을 가로지르다 사라집니다. 움직이는 것은 게임이 합니다 — 세 칸은 **경로가 아니라 수명**입니다 |
| 터지는 것 | 5칸 | 한 자리에서 피었다 집니다. 3번 칸이 제일 크고, 그 칸이 실제로 보이는 그림입니다 |

## 안 만든 것

- **관통 · 방어 무시** 자체 — 그림이 없습니다. 방어를 뚫는다는 것은 숫자에만
  있는 일이라 그릴 것이 없고, 9판 오세우스와 18판 스피노사는 몸이 직접 뻗는
  기술이라 날아가는 것도 없습니다. (11판 아칸투스는 가시가 실제로 날아가므로
  `bfx_thorn` 을 씁니다.)
- **17판 카부스의 공허한 울림** — 소리라 형체가 없습니다. 기존 `fx/glow_1~5`
  (퍼지는 고리)를 쓰면 됩니다.
- **1·2·7·10·13·16·18·19판** — 전부 몸이 직접 닿는 기술이라 따로 날아가는
  것이 없습니다.

---
%(pages)s"""


SECTION = """
## %(name)s — `%(id)s`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/%(id)s/` |
| 종류 | %(kindko)s (%(cells)d칸) |
| 쓰는 보스 | %(who)s |

### 셀 순서

%(table)s
### 프롬프트

%(prompt)s
### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "%(id)s", "expect": [%(cells)d, 1],
  "labels": [%(labels)s] }
```

---
"""


def section(fx, bosses):
    fid, name, kind, stages, *cells = fx
    n, kindko, rule, kos = KIND[kind]
    assert len(cells) == n, '%s: %d칸이어야 하는데 %d개' % (fid, n, len(cells))

    items = [(str(i + 1), kos[i], c) for i, c in enumerate(cells)]
    by = {b['stage']: b for b in bosses}
    who = ' · '.join(
        '%d판 %s' % (s, by[s]['latin']) for s in stages if s in by)

    prompt = block(
        NOTEXT,
        'SUBJECT: a %d-frame effect sheet in one row, left to right. It is ONE '
        'effect shown at %d moments in time, not %d different pictures.'
        % (n, n, n) + NL + NL
        + rows_of(items, 'The %d cells, in this exact order:' % n),
        PIXEL_STYLE,
        NO_GROUND,
        EFFECT,
        rule,
        grid(n, 1),
    )
    return SECTION % {
        'id': fid, 'name': name, 'kindko': kindko, 'cells': n, 'who': who,
        'table': table_of(items), 'prompt': prompt, 'labels': labels_of(items),
    }


if __name__ == '__main__':
    bosses = load_bosses()
    by = {b['stage']: b for b in bosses}

    rows = []
    for fx in FX:
        fid, name, kind, stages = fx[0], fx[1], fx[2], fx[3]
        n, kindko, _rule, _kos = KIND[kind]
        # 없는 판을 적어 두면 조용히 빠진다 — 여기서 잡는다
        missing = [s for s in stages if s not in by]
        assert not missing, '%s: 없는 스테이지 %r' % (fid, missing)
        rows.append('| `%s` | %s | %d칸 | %s |' % (
            fid, name, n,
            ' · '.join('%d판 %s' % (s, by[s]['latin']) for s in stages)))

    open(OUT, 'w', encoding='utf-8').write(PAGE % {
        'rows': NL.join(rows),
        'pages': ''.join(section(fx, bosses) for fx in FX),
    })

    tr = sum(1 for f in FX if f[2] == 'travel')
    print('%s — 이펙트 %d개 (날아가는 것 %d · 터지는 것 %d)'
          % (OUT, len(FX), tr, len(FX) - tr))
