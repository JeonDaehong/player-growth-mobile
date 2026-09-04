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
import io
import os
import re
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

# ══ 두 번째 기술 넷 ═══════════════════════════════════════════
#
# 넷이 **첫 넷과도** 안 겹쳐야 한다. 목록에서 여덟이 세로로 줄지어 뜨므로
# (`SkillPanel`), 위아래로 닮은 것이 하나라도 있으면 목록이 안 읽힌다.
#
#   첫 넷   초승달 · 아래 쐐기와 폭발 · 나란한 화살 셋 · 십자와 빛살
#   이 넷   퍼지는 호 셋 · 위로 솟는 기둥 · 오른쪽 이중 갈매기 · 그릇과 흩어짐
#
# 22px 에 뜨므로(캐릭터 창) 12px 짜리 상태 로고보다는 여유가 있다. 그래도
# 규칙은 같다 — **바깥 모양 하나로** 갈린다.

SKILLS2 = [
    ('sk_taunt', '도발', '이졸데',
     'A SHOUT SPREADING. THREE nested open ARCS, like ripples, all opening to the '
     'RIGHT and sharing one centre just off the left edge — smallest on the left, '
     'largest on the right, each a thick crescent band with a clear black gap '
     'between them. They must be OPEN arcs, not closed rings. It is the only icon '
     'in the set made of repeated curves. No mouth, no face, no horn, no lines.'),
    ('sk_volcano', '화산', '비앙카',
     'AN ERUPTION RISING. A wide flat solid BASE along the bottom edge, and from '
     'its centre one thick COLUMN shooting straight UP to the top of the cell, '
     'splitting near the top into two or three short tongues. The column is narrow '
     'where it leaves the base and swells as it rises. The whole mass grows '
     'UPWARD — nothing radiates sideways or downward. It is the only icon that is '
     'heavy at the bottom and reaching at the top. No mountain outline, no smoke, '
     'no sparks, no axe.'),
    ('sk_frenzy', '광란', '리안느',
     'A DOUBLE CHEVRON. TWO thick V shapes lying on their sides and pointing '
     'RIGHT, one behind the other with a black gap between them, like a fast '
     'forward symbol. Each arm is a quarter of the cell wide with flat square '
     'ends. Both point the same way and they are the same size. It is the only '
     'icon that points sideways. No arrow shaft, no bow, no motion lines.'),
    ('sk_purify', '정화', '아녜스',
     'SOMETHING LIFTED AWAY. A thick open BOWL in the lower half — a half-ring, '
     'flat cut ends pointing up, like a wide U — and above it THREE separate small '
     'solid CHUNKS of different sizes drifting up and apart, none touching the '
     'bowl or each other. It reads as dirt leaving a cupped hand. It is the only '
     'icon with loose floating pieces. No hands, no cross, no sparkle stars.'),
]


TPL = """# 아이콘 프롬프트

**이 파일은 자동 생성됩니다** — `python tools/gen-icon.py`.
고치려면 생성기의 `ROLES` · `SKILLS` · `TREE_*` 를 고치세요.

두 벌이 들어 있습니다. 둘 다 **한 장짜리 시트**이고 셀 크기가 같아서, 같은
설정으로 자릅니다.

| 벌 | 폴더 | 어디에 쓰나 |
|---|---|---|
| 전투 타입 4종 | `assets/sprites/role_icon/` | 파티 칸 · 캐릭터 창의 이름 옆 |
| 스킬 4종 (첫 기술) | `assets/sprites/skill_icon/` | 캐릭터 창의 스킬 목록 (`SkillPanel`) |
| 스킬 4종 (두 번째 기술) | `assets/sprites/skill_icon/` | 같은 목록의 아래쪽 |
| 스킬 트리 16종 (넷씩 네 장) | `assets/sprites/skill_icon/` | 스킬 트리 화면 (`SkillTreePopup`) |

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

## 스킬 아이콘 — 두 번째 기술 넷

넷이 두 번째 기술을 하나씩 갖습니다. 첫 기술은 자주 나가는 것이고, 이쪽은
**비싸고 때가 맞아야** 나갑니다 (`core/chars` 의 `SkillDef.cost`).

**첫 넷과도 안 겹쳐야 합니다.** 목록에서 여덟이 세로로 줄지어 뜨므로, 위아래로
닮은 것이 하나라도 있으면 목록이 안 읽힙니다.

| | 첫 기술 | 두 번째 기술 |
|---|---|---|
| 이졸데 | 검기 — 초승달 | 도발 — **퍼지는 호 셋** |
| 비앙카 | 강타 — 아래 쐐기와 폭발 | 화산 — **위로 솟는 기둥** |
| 리안느 | 화살비 — 나란한 화살 셋 | 광란 — **오른쪽 이중 갈매기** |
| 아녜스 | 기도 — 십자와 빛살 | 정화 — **그릇과 흩어지는 조각** |

### 셀 순서

%(skill2_table)s
### 프롬프트

%(skill2_prompt)s
### 슬라이서 설정

같은 폴더에 **덧붙입니다** (`append`) — 첫 넷을 다시 뽑을 필요가 없습니다.

```json
{ "file": "<파일명>", "name": "skill_icon", "expect": [4, 1], "append": true,
  "labels": [%(skill2_labels)s] }
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


# ══ 스킬 트리가 여는 것들 ═════════════════════════════════════
#
# 열여섯이다 (`core/skillTree`). 넷씩 네 장으로 끊는다 — 한 장에 열여섯을
# 넣으면 셀이 좁아져서 안쪽 무늬가 다 뭉개지고, 한 칸만 잘못 나와도 열여섯을
# 통째로 다시 뽑아야 한다.
#
# **캐릭터별로 묶는다.** 같은 사람의 넷은 한 화면(캐릭터 창)에 같이 뜨므로,
# 그 넷끼리 안 닮는 것이 제일 중요하다. 다른 사람 것과 겹치는 것은 그다음이다.

TREE_KG = [
    ('sk_shout', '함성', '이졸데 2-2',
     'A SHOUT GOING OUT. TWO thick open ARCS opening to the RIGHT, sharing a centre '
     'just off the left edge, with a wide black gap between them — and a short '
     'straight BAR standing at that centre. Fewer arcs than the taunt icon and it '
     'has that bar; taunt has three arcs and nothing at the centre. Squint test: '
     'two curves leaving a post.'),
    ('sk_ward', '수호의 결의', '이졸데 3-1',
     'A DOME OVER SOMETHING. One thick ARC spanning the full width of the cell, '
     'bulging UPWARD, its two ends reaching down to the bottom corners — a shield '
     'bubble seen from the side. Underneath it, centred, ONE small solid square '
     'sitting on the bottom edge, not touching the arc. It is the only icon that is '
     'a big curve sheltering a small mass. Squint test: an umbrella over a block.'),
    ('sk_breaker', '파쇄의 태세', '이졸데 3-2',
     'A CRACKED BLOCK. One solid RECTANGLE filling the middle of the cell, wider '
     'than tall, BROKEN by a single jagged black split running from its top edge to '
     'its bottom edge — three or four hard right-angle turns, no curves. The two '
     'halves are pushed slightly apart. It is the only icon that is one mass cut in '
     'two. Squint test: a brick split down the middle.'),
    ('sk_aegis', '수호신의 가호', '이졸데 4-1',
     'A DOME WITH A THORN RING. The same wide upward-bulging ARC as the ward icon, '
     'spanning the cell — but ABOVE it, following its curve, FIVE short straight '
     'spikes stand outward, evenly spaced, separated from the arc by a thin black '
     'gap. Under the arc, nothing. It is the ward icon plus spikes and minus the '
     'block: the pair must read as "the same dome, now armed". Squint test: a '
     'spiked dome.'),
    ('sk_holysword', '성검 발현', '이졸데 4-2',
     'A SWORD COMING DOWN. One long straight BLADE pointing DOWN, filling the '
     'height of the cell, with a short straight crossguard near the top and a stubby '
     'grip above it. Behind the grip, THREE short straight rays fan upward and '
     'outward. It is the only icon that is a long vertical bar with rays at its '
     'top. Squint test: a downward sword with light behind the hilt.'),
]

TREE_BA = [
    ('sk_lava', '용암 지대', '비앙카 3-1',
     'GROUND SPLIT AND BURNING. A wide flat BAND across the lower third of the cell '
     '— the ground — broken into three chunks by two jagged black cracks. Rising '
     'from each crack, one short thick TONGUE of flame reaching a third of the way '
     'up, each a different height. Nothing above them. It is the only icon whose '
     'mass is a broken horizontal band. Squint test: a cracked floor with flames.'),
    ('sk_resolve', '불굴의 의지', '비앙카 3-2',
     'A FIST HELD UP. One solid BLOCK in the upper half, roughly square with one '
     'corner notched — the fist — and below it a thick straight BAR going down to '
     'the bottom edge, narrower than the block: the forearm. Around the block, '
     'THREE short straight marks standing off it at the top and both sides, not '
     'touching. It is the only icon that is a heavy top on a narrow stem. Squint '
     'test: a raised fist.'),
    ('sk_overheat', '과열', '비앙카 4',
     'TWO STRIKES, THE SECOND BIGGER. TWO crescent slashes side by side, both '
     'opening to the LEFT, parallel, at the same angle — the left one small and '
     'thin, the right one clearly LONGER AND THICKER, reaching further past the '
     'cell centre. A black gap separates them. It is the only icon made of the same '
     'shape twice at two sizes. Squint test: two slashes, one much bigger.'),
]

TREE_EA = [
    ('sk_sharparrow', '강화된 화살', '리안느 3-1',
     'ONE ARROW, HEAVILY BARBED. A single thick straight SHAFT running corner to '
     'corner diagonally, pointing DOWN AND RIGHT, with a large solid triangular '
     'head — and along the shaft, THREE pairs of short barbs angled backward. It '
     'is one arrow, not three: the arrow-rain icon is three thin parallel arrows '
     'with plain shafts, this is one fat arrow with spikes on it. Squint test: a '
     'single barbed arrow.'),
    ('sk_spiritsong', '정령의 노래', '리안느 3-2',
     'NOTES RISING. THREE small solid DIAMONDS in a rising line from the lower left '
     'to the upper right, each a fifth of the cell wide, evenly spaced with clear '
     'black between them — and from the highest one, TWO short straight rays going '
     'up and out. It is the only icon made of separate small shapes climbing a '
     'diagonal. Squint test: three dots going up, sparkling at the top.'),
    ('sk_bigshot', '거대 화살', '리안느 4-1',
     'ONE HUGE ARROW, HORIZONTAL. A very thick straight SHAFT lying across the full '
     'width of the cell pointing LEFT, with a big solid triangular head taking a '
     'third of the length, and a wide double wedge of fletching at the tail. It is '
     'the FATTEST, most horizontal icon in the whole set — it must look heavy. '
     'Squint test: one big arrow lying flat.'),
    ('sk_fey', '요정의 축제', '리안느 4-2',
     'SMALL ARROWS SCATTERING. FOUR tiny arrows, each a short shaft with a small '
     'triangular head, pointing in FOUR different directions and spread to the four '
     'quarters of the cell, none touching. They are small — each about a third of '
     'the cell. It is the only icon whose parts point different ways. Squint test: '
     'four little darts going everywhere.'),
]

TREE_NU = [
    ('sk_judge', '신의 심판', '아녜스 3-1',
     'A WEIGHT COMING DOWN. A wide flat solid BAR across the upper third of the '
     'cell, and from its underside THREE thick straight BEAMS reaching down to the '
     'bottom edge, evenly spaced, the middle one longest. It is the only icon that '
     'is a heavy lid with legs hanging from it. Squint test: a bar with three beams '
     'under it.'),
    ('sk_gentle', '정화의 손길', '아녜스 3-2',
     'AN OPEN HAND. One solid rounded BLOCK in the lower half — the palm — with '
     'THREE short thick FINGERS standing up from its top edge, evenly spaced, the '
     'middle one longest, and a stubby thumb angled off the left side. It is the '
     'only icon that is a mass with short stubs standing on it. Squint test: a '
     'simple hand, palm up.'),
    ('sk_wrath', '신의 천벌', '아녜스 4-1',
     'A BOLT STRIKING DOWN. One thick zigzag running the FULL HEIGHT of the cell '
     'from top edge to bottom edge, with THREE hard right-angle bends — every '
     'segment straight, square-cut ends, no taper and no curve. Nothing else in the '
     'cell. It is the only icon that is a single bent line crossing the whole cell. '
     'Squint test: a lightning bolt.'),
    ('sk_radiance', '찬란한 빛', '아녜스 4-2',
     'A SUN OF STRAIGHT RAYS. One solid CIRCLE at the centre taking a third of the '
     'cell, and EIGHT straight rays radiating from it, evenly spaced all the way '
     'around, each separated from the circle by a thin black gap. All rays the same '
     'length. It is the only icon that is symmetrical in every direction. Squint '
     'test: a sun.'),
]

TREE_SHEETS = [
    ('kg', '이졸데', TREE_KG),
    ('ba', '비앙카', TREE_BA),
    ('ea', '리안느', TREE_EA),
    ('nu', '아녜스', TREE_NU),
]


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


def tree_section(key, who, items):
    return (
        '---' + NL + NL
        + '## %s 의 트리 (`skill_icon`)' % who + NL + NL
        + '스킬 트리가 여는 것들입니다 (`core/skillTree`). 넷이 **한 화면에 같이 '
        '뜨므로**(캐릭터 창) 그 넷끼리 안 닮는 것이 제일 중요합니다.' + NL + NL
        + '### 셀 순서' + NL + NL
        + table_of([(i[0], i[1], i[2]) for i in items]) + NL
        + '### 프롬프트' + NL + NL
        + sheet(items) + NL
        + '### 슬라이서 설정' + NL + NL
        + '```json' + NL
        + '{ "file": "<%s 파일명>", "name": "skill_icon", "expect": [%d, 1],' % (key, len(items)) + NL
        + '  "labels": [%s] }' % labels_of([(i[0], '', '') for i in items]) + NL
        + '```' + NL
    )


page = TPL % {
    'role_table': table_of([(i[0], i[1], i[2]) for i in ROLES]),
    'role_prompt': sheet(ROLES),
    'role_labels': labels_of([(i[0], '', '') for i in ROLES]),
    'skill_table': table_of([(i[0], i[1], '%s의 기술' % i[2]) for i in SKILLS]),
    'skill_prompt': sheet(SKILLS),
    'skill_labels': labels_of([(i[0], '', '') for i in SKILLS]),
    'skill2_table': table_of([(i[0], i[1], '%s의 두 번째 기술' % i[2]) for i in SKILLS2]),
    'skill2_prompt': sheet(SKILLS2),
    'skill2_labels': labels_of([(i[0], '', '') for i in SKILLS2]),
}

page += NL + NL.join(tree_section(k, w, it) for k, w, it in TREE_SHEETS)

open('docs/ICON_PROMPTS.md', 'w', encoding='utf-8').write(page)
print('아이콘 %d + 스킬 %d + 두 번째 기술 %d → docs/ICON_PROMPTS.md'
      % (len(ROLES), len(SKILLS), len(SKILLS2)))

# 코드와 어긋나지 않는지 본다 — 여기 없는 기술이 코드에 있으면 로고가 빈다
_want = {i[0] for i in SKILLS} | {i[0] for i in SKILLS2}
for _k, _w, _it in TREE_SHEETS:
    _want |= {i[0] for i in _it}
# 스킬 표(`chars`)와 트리(`skillTree`) **둘 다** 본다 — 패시브 자리는 기술이
# 아니라 트리에만 있으므로, 한 파일만 보면 그 여섯이 "문서에만 있는 것" 으로 잡힌다.
_src = ''.join(
    io.open(f, encoding='utf-8').read()
    for f in ('src/core/chars.ts', 'src/core/skillTree.ts')
)
_have = set(re.findall(r"art: '(sk_[a-z_]+)'", _src))
assert _have <= _want, '코드에만 있는 스킬 로고: %s' % (_have - _want)
assert _want <= _have, '문서에만 있는 스킬 로고: %s' % (_want - _have)
