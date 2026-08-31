# -*- coding: utf-8 -*-
"""
캐릭터 패시브 로고 프롬프트 생성기 — `docs/PASSIVE_ICON_PROMPTS.md`.

    python tools/gen-passive.py

## 무엇인가

파티 캐릭터 넷이 각자 하나씩 가진 **패시브**의 로고다. 캐릭터 창의 스킬
목록 맨 위, 액티브 스킬 바로 위에 22px 로 붙는다 (`screens/home/SkillPanel`).

## 왜 상태 로고를 그냥 안 쓰나

한동안 상태 로고(`status_icon`)를 빌려 썼다. 아녜스는 격노, 이졸데는 재생,
비앙카·리안느는 신속. 규칙이 실제로 그거니까 틀린 표시는 아니었다.

그런데 **읽는 사람이 하는 질문이 다르다.**

  · 상태 로고 — "지금 나한테 무슨 일이 일어나고 있나"
  · 패시브 로고 — "이 사람은 어떤 사람인가"

앞엣것은 왔다 가고 뒤엣것은 안 바뀐다. 같은 그림을 쓰면 캐릭터 창에서 본
재생 표시와 전투 중에 뜬 재생 표시가 같은 것을 뜻하게 되는데, 하나는 이졸데의
성질이고 하나는 누구에게든 걸릴 수 있는 상태다. 그리고 **비앙카와 리안느가
같은 로고**가 되어 버려서, 넷을 나란히 놓으면 둘이 같은 사람으로 보였다.

패시브는 **사람마다 하나**이므로 로고도 사람마다 하나다.

## 전투 중에는 여전히 상태 로고가 뜬다

비앙카가 다쳐서 빨라지고 있을 때 파티 칸에 뜨는 것은 `st_haste` 다. 그 자리가
말하는 것은 "지금 이 사람이 평소보다 빠르다" 이고, 그건 원인이 패시브든
우두머리 기술이든 같은 사실이기 때문이다. 여기 넷은 **창에서만** 쓴다.

## 무엇과 안 겹쳐야 하나

같은 목록에 **액티브 스킬 아이콘 넷**(`skill_icon`)이 바로 아래 줄에 붙는다.
그래서 여덟이 다 갈려야 한다. 아래 `CLASH` 가 그 검사를 대신한다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    ICON_STYLE, NL, NOTEXT, PIXEL_STYLE, block, grid, labels_of, rows_of,
    table_of,
)

OUT = 'docs/PASSIVE_ICON_PROMPTS.md'


# ══ 넷 ════════════════════════════════════════════════════════
#
# 순서는 `core/chars` 의 `CHAR_IDS` 와 같다 — 두 곳을 나란히 놓고 볼 일이
# 생기는데, 순서가 다르면 매번 눈으로 짝을 맞춰야 한다.
#
# 실루엣은 **세로 무게 배치**로 갈랐다. 22px 에서도 남는 것이 그것뿐이다.
#
#   맹세  위가 가늘고 아래에 받침    (세로로 길다)
#   한 곡 위아래가 넓고 허리가 가늘다  (모래시계처럼 잘록하다)
#   박자  가운데가 통통한 뾰족 타원    (덩어리 하나)
#   축복  위에 작은 고리, 아래에 큰 종  (아래가 무겁고 사이가 떠 있다)

PASSIVES = [
    ('pv_oath', '불굴의 맹세', '이졸데', '1초마다 체력 2 회복',
     'A SWORD PLANTED IN A BLOCK. From the bottom edge up: a wide solid '
     'rectangular BASE occupying the bottom quarter of the cell and nearly the '
     'full width; rising out of its centre a straight vertical BLADE a fifth of '
     'the cell wide reaching the top edge; and crossing that blade near the top, '
     'a horizontal GUARD two-thirds of the cell wide and a tenth of the cell '
     'tall. Three solid parts, all touching, all filled. The blade does not '
     'taper and has no point — it runs straight off the top edge. No hands, no '
     'ground line, no rays. Squint test: a tall cross standing on a slab.'),

    ('pv_encore', '최후의 한 곡', '비앙카', '체력이 낮을수록 공격속도 증가',
     'A RAISED GOBLET. Three solid parts stacked, each touching the next: a wide '
     'shallow CUP across the top third — a broad U with thick walls and a flat '
     'bottom, as wide as the cell; a narrow STEM down the centre, a fifth of the '
     'cell wide; and a wide flat FOOT across the bottom, as wide as the cup. The '
     'waist is the point of the icon — wide, thin, wide. Nothing spills, nothing '
     'sparkles, nothing floats above it. Squint test: an hourglass-ish outline '
     'with an open top.'),

    ('pv_tempo', '숲의 박자', '리안느', '아군 전체 공격속도 +0.1',
     'A SINGLE LEAF. One solid pointed oval filling the cell diagonally, its '
     'sharp TIP at the upper right and its other point at the lower left, widest '
     'through the middle where it is half the cell across. A short straight STEM '
     'continues from the lower-left point to the corner. The only cut in the mass '
     'is ONE notch a fifth of the width bitten out of the lower right edge, so '
     'the outline is not a plain ellipse. No veins, no interior lines, no second '
     'leaf, no branch. Squint test: one fat pointed blade of green.'),

    ('pv_ash', '재의 축복', '아녜스', '아군 전체 공격력 +10%',
     'A HANGING CENSER. At the very top of the cell a small solid RING about a '
     'fifth of the cell wide. Below it a clear GAP of empty black, a fifth of the '
     'cell tall — the two parts do not touch, and that gap is the whole point of '
     'the icon. Filling the bottom two-thirds, a wide solid DOME: rounded on top, '
     'flaring outward as it falls, cut off flat along the bottom edge at nearly '
     'the full width of the cell. Bottom-heavy. No chain links, no smoke, no '
     'rays, no cross. Squint test: a bell with a dot floating above it.'),
]


# 같은 목록에 나란히 서는 것들 — 액티브 스킬 아이콘 넷
ACTIVE = [
    ('sk_wave', '한쪽으로 휜 초승달'),
    ('sk_leap', '위 쐐기 + 아래로 퍼지는 폭발'),
    ('sk_rain', '나란한 사선 화살 셋'),
    ('sk_heal', '십자 + 뻗는 빛살'),
]

SHAPES = [
    ('pv_oath', '받침 위에 선 긴 십자'),
    ('pv_encore', '넓다 · 잘록하다 · 넓다'),
    ('pv_tempo', '뾰족한 타원 하나'),
    ('pv_ash', '떠 있는 점 + 아래의 종'),
]

CLASH = [
    ('pv_oath', 'sk_heal', '둘 다 십자가 있다. 맹세는 **아래에 받침**이 있고 '
     '빛살이 없다. 기도는 받침이 없고 사방으로 빛살이 뻗는다'),
    ('pv_encore', 'pv_ash', '둘 다 그릇이다. 잔은 **위가 열려 있고 받침이 '
     '있고**, 향로는 **위가 막힌 덩어리에 점 하나가 떠 있다**. 잔은 허리가 '
     '잘록하고 향로는 아래로 갈수록 퍼진다'),
    ('pv_tempo', 'sk_wave', '둘 다 한쪽으로 휜 덩어리다. 잎은 **속이 꽉 찬 '
     '타원**이고 검기는 **한쪽으로 크게 휜 초승달**이다 — 잎은 양 끝이 다 '
     '뾰족하고 검기는 안쪽이 파여 있다'),
    ('pv_oath', 'pv_encore', '둘 다 세로로 길고 아래에 받침이 있다. 맹세는 '
     '**위가 가늘고**(칼날) 잔은 **위가 제일 넓다**(잔)'),
]


PAGE = """# 캐릭터 패시브 로고

**이 파일은 자동 생성됩니다** — `python tools/gen-passive.py`.

파티 캐릭터 넷이 각자 하나씩 가진 **패시브**의 로고 넷입니다. 캐릭터 창의
스킬 목록 맨 위 — 액티브 스킬 바로 위 — 에 22px 로 붙습니다
(`screens/home/SkillPanel`).

## 왜 상태 로고를 안 빌려 쓰나

한동안 상태 로고(`status_icon`)를 빌려 썼습니다. 아녜스는 격노, 이졸데는
재생, 비앙카와 리안느는 신속. 규칙이 실제로 그거라 틀린 표시는 아니었습니다.

그런데 **읽는 사람이 하는 질문이 다릅니다.**

- 상태 로고 — "지금 나한테 무슨 일이 일어나고 있나"
- 패시브 로고 — "이 사람은 어떤 사람인가"

앞엣것은 왔다 가고 뒤엣것은 안 바뀝니다. 그리고 빌려 쓰면 **비앙카와 리안느가
같은 로고**가 되어, 넷을 나란히 놓았을 때 둘이 한 사람으로 보였습니다.
패시브는 사람마다 하나이므로 로고도 사람마다 하나입니다.

전투 중에는 **여전히 상태 로고가 뜹니다.** 비앙카가 다쳐서 빨라지고 있을 때
파티 칸에 뜨는 것은 `st_haste` 입니다 — 그 자리가 말하는 것은 "지금 이 사람이
평소보다 빠르다" 이고, 원인이 패시브든 우두머리 기술이든 같은 사실이기
때문입니다. 여기 넷은 **창에서만** 씁니다.

## 목록

| 로고 | 이름 | 누구 | 무엇을 |
|---|---|---|---|
%(rows)s

## 여덟이 다 갈려야 합니다

바로 아래 줄에 **액티브 스킬 아이콘 넷**이 붙습니다 (`skill_icon`,
[`ICON_PROMPTS.md`](ICON_PROMPTS.md)). 같은 목록 안에서 위아래로 나란히
보이므로, 넷끼리만 갈려서는 부족합니다.

| 로고 | 윤곽 |
|---|---|
%(shapes)s
%(active)s

### 특히 헷갈리기 쉬운 짝

%(clash)s
## 22px 입니다

상태 로고(12~16px)보다 큽니다. 그래도 규칙은 같습니다 — **속이 꽉 찬 덩어리**
하나에 큼직한 홈이 하나. 22px 이라고 결을 넣기 시작하면 12px 짜리 상태 로고
옆에서 혼자 지저분해 보이고, 둘이 같은 줄에 뜨는 화면이 실제로 있습니다.

## 프롬프트

### 셀 순서

%(table)s
### 프롬프트

%(prompt)s

## 슬라이서 설정

```json
%(config)s
```

파일 이름은 `passive.jpg` 입니다. 넷이라 **한 장**이면 됩니다 — 이 프로젝트에서
4칸 시트는 늘 한 번에 나왔습니다 (`role_icon` · `skill_icon` · `boss_passive`).

## 다시 뽑을 때

**둘이 비슷하게 나왔을 때**

```
Two of these icons have become confusable. They sit in one list, one under the other,
at 22 pixels. Redraw the weaker one so that its OUTLINE differs from the other in
overall shape and in where its weight sits, not in interior detail. Keep every other
cell exactly as it is.
```

**속이 비어서 나왔을 때**

```
The icons are drawn as hollow outlines. Redraw every icon as a SOLID FILLED WHITE MASS
on pure black, with at most one notch cut into it, and that notch at least a fifth of
the width.
```

**칸 안에서 작게 나왔을 때**

```
The icons are drawn small inside their cells with empty margins. Each shape must touch
or nearly touch all four sides of its own cell. Redraw them larger.
```
"""


def build():
    cells = [(i, ko, art) for i, ko, _who, _what, art in PASSIVES]

    rows = NL.join(
        '| `%s` | %s | %s | %s |' % (i, ko, who, what)
        for i, ko, who, what, _art in PASSIVES)

    shapes = NL.join('| `%s` | %s |' % (i, sh) for i, sh in SHAPES)
    active = (NL + NL + '나란히 서는 액티브 스킬 아이콘 넷 (이미 있는 것들):'
              + NL + NL + '| 로고 | 윤곽 |' + NL + '|---|---|' + NL
              + NL.join('| `%s` | %s |' % (i, sh) for i, sh in ACTIVE))

    clash = NL.join(
        '- **%s ↔ %s** — %s' % (a, b, why) for a, b, why in CLASH) + NL

    prompt = block(
        NOTEXT,
        'SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. '
        'Four cells. Not five, not six, and not two rows — four cells in one '
        'row, each a different icon. Do not repeat an icon anywhere on the sheet '
        'and do not add variants of one.' + NL + NL
        + rows_of(cells, 'The 4 cells, in this exact order:'),
        PIXEL_STYLE,
        ICON_STYLE,
        'NO DITHERING. NO CHECKERBOARD. NO STIPPLING.' + NL
        + '- Every edge is a HARD STEP between solid white and solid black. Do '
        'not soften, feather or anti-alias anything, and do not fake a grey by '
        'alternating black and white pixels along an edge.' + NL
        + '- Two colours exist in this image: pure white and pure black. Nothing '
        'in between, anywhere.',
        'THEY ALL WEIGH THE SAME.' + NL
        + '- These four belong to four different characters, but NOTHING in the '
        'drawing may say who is stronger or who is kinder. No icon is spikier, '
        'softer, darker or busier than another.' + NL
        + '- Every icon uses the same stroke weight and the same solid fill.',
        'THEY MUST NOT BE CONFUSABLE — and not only with each other.' + NL
        + '- These four appear in a list directly ABOVE four existing skill '
        'icons: a crescent slash, a downward wedge over a burst, three parallel '
        'falling arrows, and a plus sign with rays. None of the four you draw '
        'may resemble any of those.' + NL
        + '- Put your 4 finished icons side by side and squint until they blur. '
        'If any two share an outline, redraw the weaker one — the outline is the '
        'only thing that survives.',
        grid(4, 1),
    )

    cfg = ('{ "file": "passive.jpg", "name": "passive_icon", "expect": [4, 1],'
           + NL + '  "labels": [%s] }' % labels_of(cells))

    return PAGE % {
        'rows': rows,
        'shapes': shapes,
        'active': active,
        'clash': clash,
        'table': table_of(cells),
        'prompt': prompt,
        'config': cfg,
    }


if __name__ == '__main__':
    open(OUT, 'w', encoding='utf-8').write(build())
    print('%s — 패시브 로고 %d개' % (OUT, len(PASSIVES)))
