# -*- coding: utf-8 -*-
"""
아이콘 프롬프트 생성기 — `python tools/gen-icon.py`.

`docs/ICON_PROMPTS.md` 한 장을 만든다. 두 벌이 들어 있다 —

  전투 타입 4종  탱커 · 근접 딜러 · 원거리 딜러 · 서포터
  스킬 4종      검기 · 도약 강타 · 화살비 · 기도

## 왜 캐릭터·적과 따로인가

캐릭터(`gen-char.py`)와 적(`gen-foe.py`)은 **생물**이고, 규칙의 대부분이
"살아 있어 보이게" 에 쓰인다. 아이콘은 반대다 — 생물이면 안 되고, 12~16px 에서
**한 덩어리로** 읽혀야 한다. 같은 스타일 규칙(`artstyle`)을 쓰되 그 위에 얹는
것이 정반대라 파일을 나눴다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    ICON_STYLE, NL, NOTEXT, PIXEL_STYLE, block, grid, labels_of, rows_of,
    table_of,
)


# ══ 아이콘 공통 규칙 ═══════════════════════════════════════════


# ══ 전투 타입 ═════════════════════════════════════════════════
#
# 넷을 가르는 것은 **바깥 윤곽**이다. 12px 에서 안쪽은 없는 것과 같으므로,
# 방패는 아래가 뾰족하고 · 검은 세로로 길고 · 활은 굽었고 · 십자는 대칭이다.
# 넷을 나란히 놓고 실루엣만 봐도 안 헷갈려야 한다.

ROLES = [
    ('role_tank', '탱커', '방패',
     'A SHIELD. A broad heater shield — flat straight top edge, sides curving down '
     'and inward to a POINT at the bottom. It is the only icon that is wide at the '
     'top and pointed at the bottom, and that triangle-ish mass is what names it. '
     'Solid white, filled. No boss, no rim, no crest, no straps.'),
    ('role_melee', '근접 딜러', '검',
     'A SWORD, blade upright, point at the TOP. A long straight blade taking about '
     'three quarters of the height, a short straight crossguard, and a stubby grip '
     'below it. It is the TALLEST AND NARROWEST of the four — that vertical bar is '
     'what names it. No fuller, no pommel jewel, no wrapping.'),
    ('role_ranged', '원거리 딜러', '활',
     'A BOW, held upright, drawn. A thick C-SHAPED curve opening to the RIGHT, with '
     'a straight vertical string closing it, and one arrow lying horizontally across '
     'the middle pointing right. It is the only CURVED icon of the four. The curve '
     'must be thick enough to survive — draw the limb as a solid crescent, not a '
     'line. No nocks, no grip, no fletching detail beyond a single wedge.'),
    ('role_support', '서포터', '십자',
     'A PLUS SIGN — a thick equal-armed cross with flat ends, filling the cell. It '
     'is the only SYMMETRICAL icon of the four: the same left-right and top-bottom. '
     'The arms are as thick as a third of their length. Nothing else — no circle '
     'behind it, no glow, no rounded ends.'),
]


# ══ 스킬 ══════════════════════════════════════════════════════
#
# 기술 아이콘은 **무엇이 일어나는지**를 그린다. 누가 쓰는지가 아니다 —
# 캐릭터는 옆에 이미 그려져 있으므로, 여기에 사람을 그리면 두 번 말하는 것이고
# 12px 에서 사람은 어차피 얼룩이 된다.

SKILLS = [
    ('sk_wave', '검기', '이졸데',
     'A CRESCENT SLASH. One thick curved blade of energy, bulging on the outer edge '
     'and tapering at both tips, opening to the LEFT. It fills the cell corner to '
     'corner diagonally. Solid white. Nothing else in the cell — no sword, no '
     'person, no speed lines.'),
    ('sk_leap', '도약 강타', '비앙카',
     'AN IMPACT. A downward-pointing WEDGE in the upper half — the blow arriving — '
     'and beneath it a wide flat BURST of four or five thick spikes radiating out '
     'and up from a single point at the bottom. The bottom half is wider than the '
     'top. It reads as something landing hard. No axe, no person, no ground line.'),
    ('sk_rain', '화살비', '리안느',
     'ARROWS FALLING. THREE arrows, parallel, pointing DOWN AND RIGHT at the same '
     'angle, evenly spaced across the cell, at three different lengths. Each is a '
     'thick straight shaft with a solid triangular head and a simple wedge for '
     'fletching. It is the only skill icon made of repeated separate shapes. No bow, '
     'no target, no arcs.'),
    ('sk_heal', '기도', '아녜스',
     'LIGHT RISING. A thick PLUS SIGN in the middle, and around it four short '
     'straight rays pointing UP AND OUTWARD from behind it — two on each side, at '
     'different lengths. The rays must not touch the plus. It reads as a cross with '
     'light coming off it. No hands, no person, no circle.'),
]


TPL = """# 아이콘 프롬프트

**이 파일은 자동 생성됩니다** — `python tools/gen-icon.py`.
고치려면 생성기의 `ROLES` · `SKILLS` 를 고치세요.

두 벌이 들어 있습니다. 둘 다 **한 장짜리 시트**이고 셀 크기가 같아서, 같은
설정으로 자릅니다.

| 벌 | 폴더 | 어디에 쓰나 |
|---|---|---|
| 전투 타입 4종 | `assets/sprites/role_icon/` | 파티 칸 · 캐릭터 창의 이름 옆 |
| 스킬 4종 | `assets/sprites/skill_icon/` | 캐릭터 창의 스킬 목록 (`SkillPanel`) |

## 12px 에서는 윤곽뿐입니다

이 아이콘들은 글자보다 작게 붙습니다. 그 크기에서 남는 것은 **바깥 모양
하나**뿐이라, 안쪽에 무엇을 그리든 회색 얼룩이 됩니다.

그래서 넷을 **윤곽으로** 갈랐습니다 —

| | 가르는 것 |
|---|---|
| 방패 | 위가 넓고 **아래가 뾰족하다** |
| 검 | **세로로 길고 좁다** — 넷 중 제일 홀쭉 |
| 활 | **굽었다** — 넷 중 유일한 곡선 |
| 십자 | **좌우위아래가 같다** — 넷 중 유일한 대칭 |

스킬 넷도 같은 식입니다 — 초승달(곡선 하나) · 아래로 꽂히는 쐐기(위아래로
갈린 덩어리) · 나란한 화살 셋(반복) · 십자와 빛살(대칭).

---

## 1. 전투 타입 (`role_icon`)

전투 타입은 넷입니다 — **탱커 · 근접 딜러 · 원거리 딜러 · 서포터**.
코드에서는 역할(`Role`)과 사거리(`Range`) 둘을 조합해 나옵니다
(`core/chars` 의 `battleTypeOf`).

### 셀 순서

%(role_table)s
### 프롬프트

%(role_prompt)s
### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "role_icon", "expect": [4, 1],
  "labels": [%(role_labels)s] }
```

---

## 2. 스킬 (`skill_icon`)

지금은 넷이지만 **늘어납니다.** 한 명이 기술을 여럿 가지게 되면 목록이 되고,
목록에서는 이름보다 아이콘이 먼저 읽힙니다.

기술 아이콘은 **무엇이 일어나는지**를 그립니다. 누가 쓰는지가 아닙니다 —
캐릭터 얼굴은 이미 옆에 있고, 12px 에서 사람은 얼룩이 됩니다.

### 셀 순서

%(skill_table)s
### 프롬프트

%(skill_prompt)s
### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "skill_icon", "expect": [4, 1],
  "labels": [%(skill_labels)s] }
```

---

## 다시 뽑을 때

**너무 자잘하게 나왔을 때**

```
Too much detail. Redraw each icon as ONE SOLID FILLED SHAPE with no interior lines,
no shading and no small parts. Imagine it printed at 14 pixels wide: anything you
cannot see at that size must be deleted, and the main shape must grow to fill the
cell.
```

**속이 빈 윤곽으로 나왔을 때**

```
The icons are drawn as outlines. Fill them in — each icon is a solid white mass on
black, not a white line around a black interior.
```

**기울어져 나왔을 때**

```
Draw each icon flat, upright and front-on, centred in its cell. No tilt, no
perspective, no motion. These sit next to text.
```
"""


def sheet(items):
    """(id, 이름, 곁들임, 설명) 넷을 프롬프트 한 덩어리로."""
    cells = [(i[0], i[1], i[3]) for i in items]
    return block(
        NOTEXT,
        'SUBJECT: a single sheet of %d ICONS in one row, left to right. They are a '
        'matched set — same weight, same fill, same size within their cells.'
        % len(items) + NL + NL
        + rows_of(cells, 'The %d cells, in this exact order:' % len(items)),
        PIXEL_STYLE,
        ICON_STYLE,
        'THEY MUST NOT BE CONFUSABLE. Put the %d finished icons side by side and '
        'squint. If any two have a similar outline, redraw the weaker one — the '
        'outline is the only thing that survives at 14 pixels.' % len(items),
        grid(len(items), 1),
    )


page = TPL % {
    'role_table': table_of([(i[0], i[1], i[2]) for i in ROLES]),
    'role_prompt': sheet(ROLES),
    'role_labels': labels_of([(i[0], '', '') for i in ROLES]),
    'skill_table': table_of([(i[0], i[1], '%s의 기술' % i[2]) for i in SKILLS]),
    'skill_prompt': sheet(SKILLS),
    'skill_labels': labels_of([(i[0], '', '') for i in SKILLS]),
}

open('docs/ICON_PROMPTS.md', 'w', encoding='utf-8').write(page)
print('아이콘 %d + 스킬 %d → docs/ICON_PROMPTS.md' % (len(ROLES), len(SKILLS)))
