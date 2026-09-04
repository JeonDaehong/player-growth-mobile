# -*- coding: utf-8 -*-
"""
세 번째 기술 동작과 거대 화살 — `python tools/gen-motion.py`.

`docs/MOTION_ART_PROMPTS.md` 한 장을 만든다.

## 왜 `gen-char.py` 안이 아닌가

저기는 **캐릭터 한 명당 문서 한 장**을 만든다 (`docs/character-art/<id>.md`).
여기 것들은 셋 중 셋에게만 있고 (아녜스는 안 받는다), 거대 화살은 사람이
아니라 **날아가는 물건**이라 캐릭터 문서에 들어갈 자리가 없다.

한 장에 모아 두면 "스킬 트리 때문에 새로 필요해진 그림" 이 한눈에 보인다.

## 무엇이 필요한가

스킬 트리가 생기면서 기술이 한 명당 넷까지 늘었다 (`core/skillTree`). 동작
시트는 둘뿐이라 (`sk_1..3` · `sk2_1..3`), 새 기술 열여섯이 전부 둘째 것을
빌려 쓴다 — 대부분은 맞는데 셋이 안 맞는다.

  이졸데 성검 발현    도발 동작을 빌린다 — 하늘에서 검이 떨어지는데 외치고 있다
  비앙카 불굴의 의지  화산 동작을 빌린다 — 자기 강화인데 땅을 내리친다
  리안느 거대 화살    숲의 축복 동작을 빌린다 — 큰 화살을 쏘는데 버프 자세다

아녜스는 안 받는다. 신의 심판은 정화 동작(서서 팔을 든다)이 그대로 맞다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    MOE, NL, NOTEXT, NO_GROUND, PIXEL_STYLE, QUARTER, READABLE, SAME_PERSON,
    block, grid, labels_of, rows_of, table_of,
)


# ══ 세 번째 동작 ══════════════════════════════════════════════
#
# 첫 기술 · 둘째 기술과 **또 다른 축으로** 움직여야 한다. 54px 에서 남는
# 것은 몸의 방향뿐이므로, 셋이 같은 방향으로 움직이면 세 벌을 받은 뜻이 없다.
#
#   이졸데   검기 옆으로 벤다 · 도발 위로 젖힌다  → 성검은 **위로 뻗어 올린다**
#   비앙카   강타 날아간다 · 화산 내리찍는다      → 의지는 **제자리에서 부푼다**
#   리안느   화살비 무릎 꿇는다 · 축복 몸을 낮춘다 → 거대 화살은 **옆으로 벌린다**

THIRD = [
    {
        'id': 'knightgirl',
        'who': '이졸데',
        'name': '성검 발현',
        'lock': 'She is a white-armoured knight girl with long pale hair and a '
                'greatsword. Same person in all three cells.',
        'head': 'SUBJECT: a 3-frame animation of ONE single character CALLING DOWN '
                'A SWORD OF LIGHT. She kneels, raises her own sword overhead as a '
                'beacon, and holds. She never swings it and she never leaves the '
                'spot.',
        'frames': [
            ('sk3_1', '1 무릎 꿇음',
             'dropping to one knee. Her front knee is planted on the ground, her '
             'back leg folded under her, and the greatsword is held ACROSS her '
             'body low, point down and to the left, both hands on the grip. Her '
             'head is BOWED. This is the LOWEST and most compact cell of the '
             'sheet.'),
            ('sk3_2', '2 치켜듦',
             'raising the sword as a beacon. Still on one knee, she has thrust the '
             'greatsword STRAIGHT UP above her head, arms fully extended, blade '
             'dead vertical, both hands on the grip. Her head is tipped BACK and '
             'up, following the point. Her back is arched.' + NL
             + '  THE WHOLE SWORD IS INSIDE THE CELL, TIP INCLUDED. Compose the '
             'cell so the point stops with a clear band of empty black above it '
             '— roughly a tenth of the cell height. Kneeling frees that room: '
             'she is low, so the blade has somewhere to go. If the tip touches '
             'or crosses the top edge, the cell is a failure.'),
            ('sk3_3', '3 버팀',
             'holding. Identical stance to cell 2 — still kneeling, sword still '
             'straight up — but her arms have locked and her shoulders have '
             'dropped: she is braced against something pressing down. Her hair and '
             'the hem of her surcoat are lifted straight UP as if by a wind coming '
             'from below. The pose barely differs from cell 2 and that is '
             'deliberate: the change is in the hair and the tension, not the '
             'limbs.'),
        ],
        'rules': '- The sword stays VERTICAL in cells 2 and 3 — it never tilts.'
                 + NL
                 + '- She is KNEELING in all three cells. She never stands up.'
                 + NL
                 + '- THE SWORD POINT IS THE THING MOST LIKELY TO GET CUT OFF. '
                 'Plan the composition around it: place the tip first, leave a '
                 'clear band of black above it, and build her body downward from '
                 'there. Shrinking her a little so the whole blade fits is '
                 'CORRECT; cropping the blade is not.'
                 + NL
                 + '- Draw NO falling sword, NO beam, NO light. The game draws '
                 'what comes down; this sheet is only her body.',
        'intro': '이졸데의 4-2. 스킬 트리에서 검 갈래 끝에 있는 기술입니다 '
                 '(`core/skillTree` 의 `kg4b`).\n\n'
                 '**무릎 꿇은 채 위로 뻗습니다.** 검기(옆으로 벤다)와 도발(위로 '
                 '젖힌다) 둘 다와 다른 축이어야 하는데, 이 사람이 아직 안 쓴 '
                 '것이 "낮게 앉아서 높이 든다" 입니다.\n\n'
                 '**떨어지는 검은 그리지 마세요.** 화면이 그립니다 — 여기는 '
                 '몸만입니다.',
    },
    {
        'id': 'bunnyaxe',
        'who': '비앙카',
        'name': '불굴의 의지',
        'lock': 'She is a bunny-eared girl in a dark performer\'s outfit with a '
                'large axe. Same person in all three cells.',
        'head': 'SUBJECT: a 3-frame animation of ONE single character STEELING '
                'HERSELF — she grips the axe, roars, and swells. She does not '
                'swing, does not jump, and does not move an inch.',
        'frames': [
            ('sk3_1', '1 움켜쥠',
             'gripping down. She has pulled the axe IN against her own chest, haft '
             'held across her body diagonally with both fists, elbows tight to her '
             'ribs. Her chin is tucked and her shoulders are hunched forward. This '
             'is the NARROWEST cell — everything is pulled toward the centre line '
             'of her body.'),
            ('sk3_2', '2 포효',
             'the roar. Her head is thrown back, mouth open, and both arms have '
             'driven DOWN and OUT to her sides, fists clenched, the axe held out '
             'wide in one hand. Feet planted apart. Her chest is thrust forward. '
             'This is the WIDEST cell — the exact opposite of cell 1.'),
            ('sk3_3', '3 부풂',
             'holding the swell. Same wide stance as cell 2 but her head has come '
             'level and forward again, eyes front, and the arms have risen a '
             'little so the axe is now held out at shoulder height. Her ears and '
             'hair are blown BACK. The stance is the same; what changed is that '
             'she is now looking at what she is about to hit.'),
        ],
        'rules': '- She never leaves the spot and the axe never travels above her '
                 'head.' + NL
                 + '- The read is NARROW → WIDE → WIDE-AND-FORWARD. If cells 1 and '
                 '2 have the same silhouette width, the sheet has failed.' + NL
                 + '- Draw NO aura, NO flames, NO glow. The game draws the effect.',
        'intro': '비앙카의 3-2. 5초 동안 공격력이 두 배가 되고 디버프에 안 걸리는 '
                 '기술입니다 (`core/skillTree` 의 `ba3b`).\n\n'
                 '**제자리에서 부풉니다.** 강타(몸이 날아간다)와 화산(내리찍는다) '
                 '둘 다 이동이나 타격인데, 이건 아무 데도 안 가고 아무것도 안 '
                 '때립니다 — 좁아졌다 넓어지는 것 하나로 말해야 합니다.',
    },
    {
        'id': 'elfarcher',
        'who': '리안느',
        'name': '거대 화살',
        'lock': 'She is a slender elf archer with long ears and a wooden bow. '
                'Same person in all three cells.',
        'head': 'SUBJECT: a 3-frame animation of ONE single character DRAWING AND '
                'LOOSING one enormous arrow, HORIZONTALLY, while standing. She '
                'does not kneel and she does not crouch.',
        'frames': [
            ('sk3_1', '1 겨눔',
             'settling into the shot. She stands upright and side-on, feet apart '
             'and braced, the bow held out at FULL ARM\'S LENGTH to the right at '
             'shoulder height, string hand at her cheek. The bow is vertical. '
             'Nothing is nocked yet. This is the calmest, most upright cell.'),
            ('sk3_2', '2 당김',
             'the full draw. Her string hand has been hauled back PAST her ear, '
             'her whole torso has rotated open, and the bow limbs have bent deeply '
             '— the bow is visibly straining, its curve much sharper than in cell '
             '1. Her front arm is locked straight. Both feet are dug in and her '
             'back heel has lifted. This is the WIDEST cell: her arms span nearly '
             'the full width.'),
            ('sk3_3', '3 놓음',
             'the release. Her string hand has flown back and open past her '
             'shoulder, fingers spread, the bow limbs have snapped straight, and '
             'her body has been rocked back a step by the recoil — front shoulder '
             'driven back, chin lifted. Her hair and cloak stream FORWARD past her '
             'in the direction the arrow went. She is the most off-balance she '
             'ever looks.'),
        ],
        'rules': '- She is STANDING in all three cells. The arrow-rain sheet is '
                 'the kneeling one; this must not repeat it.' + NL
                 + '- The bow stays roughly VERTICAL and the shot is HORIZONTAL — '
                 'she is not shooting into the sky.' + NL
                 + '- Draw NO arrow and NO trail. The game draws the projectile '
                 'separately (a huge dragon-shaped shaft) and it would collide '
                 'with anything drawn here.',
        'intro': '리안느의 4-1. 아주 큰 화살을 직선으로 쏘아 길에 선 적을 모두 '
                 '꿰는 기술입니다 (`core/skillTree` 의 `ea4a`).\n\n'
                 '**서서 수평으로 쏩니다.** 화살비는 무릎 꿇고 하늘로 쏘고, 숲의 '
                 '축복은 선 채로 몸을 낮춥니다 — 이건 서서 팔을 좌우로 벌리는 '
                 '것이라 셋이 다 갈립니다.\n\n'
                 '**화살은 그리지 마세요.** 날아가는 것은 따로 받습니다 (아래 '
                 '§P4) — 여기에도 그리면 둘이 겹칩니다.',
    },
]


# ══ 용 모양 거대 화살 ═════════════════════════════════════════

DRAGON = [
    ('shot_1', '1 온전함',
     'AN ARROW, flying LEFT, filling the full width of the cell. Read it as an '
     'arrow first and a dragon second — the outline is a classic arrow and the '
     'dragon is what that arrow is MADE OF.' + NL
     + '  THE ARROW SHAPE, in three parts along one straight horizontal line:' + NL
     + '  (a) HEAD — a sharp triangular arrowhead at the LEFT end, clearly wider '
     'than the shaft, coming to a single hard POINT. Its barbs sweep back. This '
     'wedge is also a dragon skull seen from the side: one eye socket sits in it '
     'and two small horns sweep back from its top, following the barbs rather '
     'than sticking out past them.' + NL
     + '  (b) SHAFT — one long STRAIGHT bar joining head to tail, taking about '
     'two thirds of the width and staying THIN AND EVEN the whole way: no more '
     'than a seventh of the cell height, the same thickness at both ends. It is '
     'segmented into eight or nine short plates with a hairline of black between '
     'them, and a row of very small spines runs along its top edge. The spines '
     'are tiny — they must not make the shaft look lumpy or thick.' + NL
     + '  (c) FLETCHING — at the RIGHT end, TWO stiff fins angled back and out, '
     'one up and one down, forming a shallow V. They are the widest thing after '
     'the head.' + NL
     + '  SQUINT TEST: an arrow. If the first word that comes to mind is '
     '"dragon", "snake", "eel" or "fish", the drawing has failed.'),
    ('shot_2', '2 갈라짐',
     'THE SAME ARROW, SPLITTING. Identical outline, identical position, identical '
     'thickness — nothing has moved. Hard black cracks now run across the shaft '
     'between the plates, three or four of them, each a clean straight break. The '
     'plates have shifted only very slightly out of line, so the arrow is still '
     'obviously one straight arrow. The head and the fins are untouched.'),
    ('shot_3', '3 부서짐',
     'THE ARROW COMING APART. The shaft has broken into four or five separate '
     'chunks, still in a straight line along the same axis but with wide black '
     'gaps between them. The arrowhead still leads at the LEFT and is still whole. '
     'The two fins have separated and trail at the RIGHT. Nothing has turned to '
     'dust or smoke — these are hard-edged broken pieces, and the line they sit '
     'on is still perfectly straight.'),
]

DRAGON_RULES = (
    'IT IS AN ARROW. THAT IS THE ONE THING THAT MUST SURVIVE.' + NL
    + '- The read is HEAD / THIN STRAIGHT SHAFT / FLETCHING, in that order along '
    'one horizontal line. The dragon is a texture on that shape, never a '
    'replacement for it.' + NL
    + '- THE SHAFT IS THIN AND EVEN. Do not swell it behind the head, do not '
    'taper it toward the tail, do not curve it. A shaft that bulges reads as a '
    'body and the arrow is gone.' + NL
    + '- IT FLIES TO THE LEFT AND IS DRAWN POINTING LEFT. The game does not '
    'mirror this sheet — an arrow drawn pointing right will fly backwards.' + NL
    + '- DEAD STRAIGHT AND HORIZONTAL. No S-curve, no coil, no diagonal, no '
    'undulation. The long axis runs flat across the cell.' + NL
    + '- IT IS NOT ALIVE. No wings, no legs, no open roaring jaw, no tongue, no '
    'whiskers. The jaw is CLOSED and the horns lie back flat.' + NL
    + '- It must read at 60 pixels wide: one sharp point at the left, one thin '
    'line, one V at the right. Everything else is decoration and must not '
    'thicken the silhouette.'
)

PAGE = """# 스킬 트리가 필요로 하는 그림

**이 파일은 자동 생성됩니다** — `python tools/gen-motion.py`.

스킬 트리가 생기면서 (`core/skillTree`) 기술이 한 명당 넷까지 늘었습니다.
동작 시트는 둘뿐이라 (`sk_1..3` · `sk2_1..3`) 새 기술 열여섯이 전부 둘째
것을 빌려 쓰는데, 대부분은 맞고 **셋이 안 맞습니다.**

| 새 기술 | 지금 빌리는 동작 | 어떤가 |
|---|---|---|
| 이졸데 함성 | 도발 (외치는 자세) | 딱 맞다 |
| 이졸데 수호의 결의 | 도발 (팔 들어올림) | 봐줄 만하다 |
| 비앙카 용암 지대 | 화산 (땅 내리침) | 딱 맞다 |
| 리안느 정령의 노래 · 요정의 축제 | 숲의 축복 | 맞다 |
| 아녜스 신의 심판 | 정화 (팔 든다) | 맞다 |
| **이졸데 성검 발현** | 도발 | ✗ 검이 떨어지는데 외치고 있다 |
| **비앙카 불굴의 의지** | 화산 | ✗ 자기 강화인데 땅을 내리친다 |
| **리안느 거대 화살** | 숲의 축복 | ✗ 큰 화살을 쏘는데 버프 자세다 |

그래서 **셋에게만** 세 번째 동작(`sk3_1..3`)을 받습니다. 아녜스는 안 받습니다.

거기에 거대 화살이 **날아가는 그림**이 하나 더 필요합니다. 리안느의 기본
투사체(`elfarcher_shot`)는 손가락만 한 화살인데, 이 기술은 길에 선 적을 모두
꿰는 것이라 그 그림으로는 무엇이 지나갔는지가 안 보입니다.

## 안 들어와도 게임은 돕니다

동작은 `sk3` → `sk2` → `sk` 로 한 단계씩 물러나고 (`Fighter` 의 `skFramesOf`),
투사체는 기본 화살로 떨어집니다 (`Sprite` 의 `fallbackSet`). 들어오는 순간
저절로 갈립니다 — 코드는 안 고칩니다.

## 잘리지 않게 — 특히 이졸데

한 번 "칼날이 셀 맨 위 끝까지 닿아야 한다" 고 썼다가 물렸습니다. 바로 아래
규칙이 "가장자리에서 8px 띄워라" 라 앞뒤가 안 맞았고, 실제로 칼끝이 계속
잘려 나왔습니다.

**뾰족하게 위로 뻗는 것은 반드시 안쪽에서 끝나야 합니다.** 게임은 이 그림을
정사각 상자에 비율을 지켜 넣으므로 (`contain`), 조금 작게 그려서 다 들어가는
쪽이 언제나 맞습니다 — 잘린 칼은 되살릴 방법이 없지만 작은 칼은 그냥 작을
뿐입니다.

## 셋이 **또 다른 축으로** 움직여야 합니다

54px 에서 남는 것은 몸의 방향뿐입니다. 첫 기술 · 둘째 기술과 같은 방향으로
움직이면 세 벌을 받은 뜻이 없습니다.

| | 첫 기술 | 둘째 기술 | **세 번째** |
|---|---|---|---|
| 이졸데 | 옆으로 벤다 | 위로 젖힌다 | **낮게 앉아 높이 든다** |
| 비앙카 | 몸이 날아간다 | 내리찍는다 | **제자리에서 좁아졌다 넓어진다** |
| 리안느 | 무릎 꿇고 위로 쏜다 | 선 채로 몸을 낮춘다 | **서서 좌우로 벌린다** |

---
%(sections)s
---

## §P4. 용 모양 거대 화살 — `elfarcher_dragon`

리안느의 거대 화살이 날리는 것입니다 (`core/chars` 의 `SkillDef.proj`).

**화살이 먼저고 용이 나중입니다.** 실루엣은 그냥 화살이어야 합니다 —
왼쪽 끝에 뾰족한 촉, 가운데에 **가늘고 곧은** 대, 오른쪽 끝에 V 자 깃.
용은 그 화살이 **무엇으로 만들어졌는가**일 뿐입니다: 촉이 용 머리 모양이고,
대에 비늘 마디가 나 있고, 깃이 지느러미입니다.

한 번 "용 모양" 을 앞세워 요청했다가 물렸습니다. 그러면 몸통이 굵어지고
휘어져서 뱀이나 장어가 나옵니다 — 화살대는 **처음부터 끝까지 같은 굵기로
가늘어야** 합니다. 눈을 가늘게 떴을 때 제일 먼저 떠오르는 낱말이 "용" 이면
실패입니다.

### 셀 순서

세 칸은 **경로가 아니라 수명**입니다 — 날아가는 동안 온전했다가 갈라지고
부서집니다 (`bfx_rock` 과 같은 규칙입니다).

%(dragon_table)s
### 프롬프트

%(dragon_prompt)s
### 슬라이서 설정

```json
{ "file": "<§P4 파일명>", "name": "elfarcher_dragon", "expect": [3, 1],
  "labels": [%(dragon_labels)s] }
```
"""


def one(c):
    return (
        NL + '## §P3-%s. %s — %s 동작 (`sk3_1..3`)' % (
            c['id'][:2].upper(), c['who'], c['name']) + NL + NL
        + c['intro'] + NL + NL
        + '### 셀 순서' + NL + NL
        + table_of(c['frames']) + NL
        + '### 프롬프트' + NL + NL
        + block(
            NOTEXT,
            c['head'] + NL + NL + c['lock'],
            rows_of(c['frames'], 'The 3 cells, in this exact order:'),
            PIXEL_STYLE,
            QUARTER,
            NO_GROUND,
            MOE,
            SAME_PERSON,
            READABLE,
            'NOTHING MAY BE CUT OFF.' + NL + c['rules'] + NL
            + '- Her feet sit at the same HEIGHT in all three cells — an '
            'alignment, not a drawn line.' + NL
            + '- Leave at least 8px of empty black between the outermost pixel '
            'and every magenta line.',
            grid(3, 1),
        ) + NL
        + '### 슬라이서 설정' + NL + NL
        + '```json' + NL
        + '{ "file": "<%s 파일명>", "name": "%s", "expect": [3, 1],' % (
            c['name'], c['id']) + NL
        + '  "labels": [%s] }' % labels_of(c['frames']) + NL
        + '```' + NL
    )


if __name__ == '__main__':
    page = PAGE % {
        'sections': ''.join(one(c) for c in THIRD),
        'dragon_table': table_of(DRAGON),
        'dragon_prompt': block(
            NOTEXT,
            'SUBJECT: a single sheet of EXACTLY 3 CELLS in ONE row, left to right '
            '— the same enormous arrow at three moments of its flight.' + NL + NL
            + rows_of(DRAGON, 'The 3 cells, in this exact order:'),
            PIXEL_STYLE,
            DRAGON_RULES,
            'NO DITHERING. NO CHECKERBOARD. Every edge is a HARD STEP between '
            'solid white and solid black.',
            grid(3, 1),
        ),
        'dragon_labels': labels_of(DRAGON),
    }
    open('docs/MOTION_ART_PROMPTS.md', 'w', encoding='utf-8').write(page)
    print('docs/MOTION_ART_PROMPTS.md — 동작 %d벌 + 투사체 1벌' % len(THIRD))
