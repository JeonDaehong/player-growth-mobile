#!/usr/bin/env python3
"""
캐릭터 한 명분 그림 프롬프트 생성기.

  python tools/gen-char.py

`docs/character-art/<id>.md` 를 한 명당 한 장씩 쓴다.

## 왜 예전 gen-char-prompts.py 를 안 쓰나

그건 게임이 **정면 로고 + 전신샷** 이던 시절에 맞춰 쓴 것이다. 그 뒤로 전투가
2D 횡스크롤 + 쿼터뷰가 되면서 필요한 그림이 완전히 달라졌다.

  · 정면 전신 → **옆모습 전투 8프레임** (게임이 실제로 넘기는 그림)
  · 평면 정측면 → **살짝 위에서 내려다본 쿼터뷰** (바닥이 평면이라)

옛 문서의 §P 시트를 그대로 받으면 지금 엔진에 안 맞는다. 그래서 새로 쓴다.

## 한 명씩 만든다

열둘을 한 번에 뽑으면 첫 장이 마음에 안 들 때 열두 장이 같이 버려진다.
한 명을 끝까지 만들어서 게임에 붙여 보고, 그 결과로 다음 사람의 지시를
고치는 편이 낫다. `CHARS` 에 한 항목을 더하고 다시 돌리면 그 사람 문서가 나온다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# 스타일 규칙은 적 프롬프트와 **같은 것**을 쓴다 (`tools/artstyle.py`)
from artstyle import (  # noqa: E402
    ILLUST_STYLE, MOE, NL, NOTEXT, NO_CLIP_HEAD, NO_GROUND, PIXEL_STYLE, PORTRAIT,
    QUARTER, READABLE, SAME_PERSON, block, grid, labels_of, rows_of, table_of,
)

OUT_DIR = 'docs/character-art'

# ══ 동작 묶음 (MOTIONS) ══════════════════════════════════════
#
# 여덟 프레임과 §D·§E 는 처음에 **대검 하나를 전제로** 쓰여 있었다 (blade,
# greatsword, 내려베기). 그런데 활잡이와 사제는 애초에 베지를 않는다. 그 문장을
# 그대로 주면 활을 칼처럼 휘두르는 그림이 나온다 — 실제로 그렇게 나온다.
#
# 그래서 무기마다 한 벌씩 둔다. 캐릭터는 `motion` 한 줄로 묶음을 고른다.
#
# 한 묶음에 들어가는 것:
#   frames  §A 여덟 칸        noclip  §A 의 "안 잘리게" 규칙 (무기 길이에 달렸다)
#   slash   §D 세 칸          dHead   §D 프롬프트 머리말      dRules  §D 크기 규칙
#   skill   §E-1 세 칸        eHead   §E-1 머리말             eRules  §E-1 크기 규칙
#   wave    §E-2 세 칸        wHead   §E-2 머리말             wRules  §E-2 규칙
#   그리고 문서에 쓸 우리말 이름들 (dName · eName · dIntro · eIntro …)
#
# **왜 무기마다 프레임을 다시 쓰나** — 자세는 무기가 정한다. 도끼는 무거워서
# 되돌아오는 칸이 길고, 활은 당기는 칸이 곧 힘을 모으는 칸이며, 향로는 사슬에
# 매달려 있어 궤적이 몸에서 멀어졌다 돌아온다. 같은 여덟 칸이지만 같은 그림이
# 아니다.

MOTIONS = {}

# ── 대검 ─────────────────────────────────────────────────────

MOTIONS['blade'] = {
    'weapon': 'greatsword',
    'dName': '베기', 'eName': '횡베기', 'wName': '검기',

    'noclip': """THE ONE RULE THAT PREVENTS THIS: **the blade never leaves her body's own footprint by
more than half a body height.** Read the eight pose descriptions again — none of them
raises the blade overhead, none points it straight back, none holds it out
horizontally. It is always low, planted, or laid across her shoulder.

That is deliberate. Her weapon is as long as she is tall, so any pose that extends it
fully needs twice her body height of room in that direction, and the direction changes
every frame. Three earlier attempts were thrown away for exactly this — clipped at the
top, then at the side. The poses were redesigned so the problem cannot happen.""",

    'frames': [
        ('guard', '대기',
         'standing at rest and ready. Weight settled on both feet, head level, watching.'
         + NL +
         '  THE BLADE RESTS LOW AND DIAGONAL ACROSS THE FRONT OF HER BODY, tip angled down '
         'toward the ground ahead of her front foot, both hands on the grip. She is not '
         'holding it up. This is the pose she holds most of the time, so it must look '
         'settled and heavy rather than tense.'),

        ('windup', '치켜듦',
         'winding up. Torso twisted back and away from the target, front foot planted, '
         'shoulders coiled.' + NL +
         '  THE BLADE IS LAID BACK ACROSS HER OWN SHOULDER, running diagonally over the far '
         'shoulder and down behind her back — foreshortened, hugging the body, NOT sticking '
         'out into open space. Think of a batter loading a swing with the bat resting on '
         'the shoulder. Only the last third of the blade is past her outline.'),

        ('strike', '내려침',
         'the strike landing. Body extended forward past the front foot, both hands driving '
         'the blade through.' + NL +
         '  THE BLADE ENDS LOW, pointing DOWN-FORWARD at about 45 degrees, tip near the '
         'ground in front of her. Not horizontal, not raised. A downward diagonal uses the '
         'corner of the cell, which is the longest line available.' + NL +
         '  One or two short straight speed lines follow the arc. The lines are part of the '
         'drawing and must also stay inside the cell.'),

        ('recover', '되돌아옴',
         'recovering. Shoulders squaring back toward the resting pose, weight shifting onto '
         'the rear foot.' + NL +
         '  THE BLADE HAS SWUNG THROUGH AND NOW HANGS ALONGSIDE HER, tip down and close to '
         'her rear heel — pulled IN toward the body, not trailing far out behind her. '
         'Halfway between the strike and the guard, and the most compact frame of the '
         'three.'),

        ('hit', '피격',
         'taking a hit. Head snapped back, torso recoiled, one foot skidding. The blade '
         'drops and swings low across her body, tip toward the ground — she is losing '
         'control of it, not raising it.'),

        ('stagger', '휘청',
         'staggering. Doubled forward over the blade, which is planted point-down in the '
         'ground in front of her and taking her weight. One knee buckling, free hand '
         'gripping the guard, hair fallen across the face. Still standing, barely.'),

        ('win', '승리',
         'victory. Facing the viewer square-on rather than to the side, feet planted wide, '
         'chin up.' + NL +
         '  THE BLADE IS PLANTED POINT-DOWN IN THE GROUND IN FRONT OF HER, both hands '
         'resting on the pommel, the guard at about chest height. NOT raised overhead — a '
         'raised blade needs twice the cell height and gets cut off, and a greatsword '
         'planted in the earth reads as a stronger victory anyway.'),

        ('lose', '패배',
         'defeated. Down on one knee, head bowed, blade planted point-down in the ground '
         'beside her and used as a prop by one hand. Still side-on, facing right.'),
    ],

    'dHead': 'SUBJECT: a 3-frame animation of ONE single character performing ONE downward '
             'sword cut, left to right. The character IS in every cell — this is not an '
             'effect-only sheet.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'THE SWING: she cuts DOWNWARD, from her far shoulder down and forward past '
             'her front foot. The blade never goes above her head and never points straight '
             'back — it travels through the front-lower quarter of the cell.' + NL + NL
             + 'THE TRAIL IS DRAWN INTO THESE FRAMES, not supplied separately. It is a white '
             'crescent following the path the blade has already swept: absent in cell 1, '
             'biggest and boldest in cell 2, breaking into fragments in cell 3.',

    'slash': [
        ('cut_1', '1 당김',
         'the wind-up. Torso coiled back and away from the target, front foot planted, '
         'the blade drawn back, laid across her far shoulder, both hands on the grip, '
         'tip pointing back and down behind her. NO trail yet — nothing has moved.'),
        ('cut_2', '2 벰',
         'the cut at its fastest, sweeping down past the front of her body, pointing '
         'down-forward at about 45 degrees, arms extended, hips driving through.' + NL +
         '  A BOLD WHITE CRESCENT sweeps with it, tracing the whole path the blade has '
         'travelled, from her shoulder down past the tip. This is the frame the player '
         'actually sees land, so it must be the boldest of the three.'),
        ('cut_3', '3 멈춤',
         'the swing finished. The blade has come to rest low and diagonal near the ground '
         'in front of her, arms extended down, shoulders square.' + NL +
         '  The crescent has broken into three separate fragments with gaps between them, '
         'fading behind the blade.'),
    ],

    'dRules': '- The trail is part of the drawing. It must stay inside its cell exactly like '
              'the blade does — an arc running off the edge is the same failure as a clipped '
              'sword.' + NL
              + '- Cell 2 is the widest and reaches furthest. Size the whole sheet from that '
              'one, then draw the other two at the same scale.' + NL
              + '- Her body fills about 55% of the cell height. She stands slightly LEFT of '
              'centre because she swings forward to the RIGHT.',

    'eHead': 'SUBJECT: a 3-frame animation of ONE single character performing ONE '
             'HORIZONTAL sword sweep, left to right. The character IS in every cell.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'THIS IS A SIDEWAYS CUT, NOT A DOWNWARD ONE. The blade stays LEVEL at waist '
             'height through the whole motion and sweeps across the front of her body. Do '
             'not raise it, do not chop downward — that is her normal attack and this must '
             'look different from it at a glance.',

    'skill': [
        ('sk_1', '1 당김',
         'winding up for a horizontal cut. The blade is pulled back HORIZONTALLY at waist '
         'height, held level behind her, both hands on the grip, torso twisted away. '
         'Knees bent, weight on the back foot. NO effect yet.'),
        ('sk_2', '2 베기',
         'the horizontal cut at full speed. The blade sweeps LEVEL across the front of her '
         'body at waist height, arms extended, torso snapped around, front foot planted '
         'hard. Hair and cape thrown sideways by the turn.' + NL +
         '  A THICK HORIZONTAL WHITE STREAK follows the blade across her body — this is '
         'where the wave is born. It is still touching the blade, not yet separated.'),
        ('sk_3', '3 놓음',
         'the follow-through. The blade has finished its sweep and points forward and '
         'slightly down, arms extended, shoulders squared to the target. She is watching '
         'what she just released.' + NL +
         '  The streak has DETACHED from the blade and is drifting off the right edge of '
         'her reach — only its trailing end is still near the tip.'),
    ],

    'eRules': '- A level blade held out sideways is the WIDEST thing this character ever '
              'does. Cell 2 is the widest of the three — size the whole sheet from it.' + NL
              + '- Her body fills about 50% of the cell height. Lower than the other sheets, '
              'because the blade needs horizontal room on both sides.' + NL
              + '- She stands in the MIDDLE of her cell here, not off to one side — the blade '
              'reaches back on the left and forward on the right.',

    'wHead': 'SUBJECT: 3 cells. A flying sword wave (a crescent-shaped blade of energy) '
             'animating over 3 frames, left to right. There is NO character, NO weapon, '
             'NO ground — only the wave.' + NL + NL
             + 'It was thrown from a greatsword as tall as its wielder, so it is BIG and '
             'HEAVY — a wall of edge, not a thin flick. It travels to the RIGHT; the game '
             'mirrors it in code when it needs to go the other way.',

    'wave': [
        ('wave_1', '1 생성',
         'the wave just released. A tall vertical crescent, thick and solid, its concave '
         'side facing LEFT (back toward the caster). Sharp bright edges, a dithered core.'),
        ('wave_2', '2 비행',
         'the wave in flight. The same crescent, now stretched slightly along its travel '
         'direction and with two or three straight speed lines trailing behind it on the '
         'left. Thinner than frame 1 but still solid.'),
        ('wave_3', '3 소멸',
         'the wave breaking apart. The crescent has split into three or four separate '
         'shards drifting apart, the trailing lines gone, most of the shape already empty.'),
    ],

    'wRules': '- The crescent is TALLER THAN IT IS WIDE — it is a vertical blade of energy '
              'flying sideways, like a thrown scythe blade seen edge-on.',

    'dIntro': """**한 번 내려베는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup → strike →
recover` 셋을 대신합니다 — 같은 세 칸이지만 **검격 궤적이 들어가고**, 자세도
베기 전용으로 다시 그립니다.

**검격 이펙트가 그림 안에 같이 들어갑니다.** 궤적만 따로 뽑아 겹치는 방법도
있지만, 그러면 검이 지나간 자리와 검이 실제로 있는 자리가 한 픽셀씩 어긋납니다.
같이 그리면 그럴 일이 없습니다.

궤적은 프레임마다 다릅니다 — 1번엔 없고, **2번에 제일 크고**, 3번엔 조각으로
흩어집니다.""",

    'eIntro': """평타(§D)가 **내려베기**라면 스킬은 **횡베기**입니다. 한눈에 달라 보여야 해서
칼 각도를 아예 반대로 잡았습니다 — 평타는 위에서 아래로, 스킬은 옆으로 수평.

**두 장으로 나눕니다.** 검기가 몸을 떠나 날아가야 하는데, 한 장에 같이 그리면
검기가 캐릭터에 묶여서 못 움직입니다.""",

    'wIntro': '캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.',
}


# ── 도끼 ─────────────────────────────────────────────────────
#
# 대검과 제일 다른 것은 **무게중심**이다. 대검은 무게가 손 근처에 고루 퍼져
# 있어서 멈추려면 힘을 주면 되는데, 도끼는 머리에 다 몰려 있어서 한 번 돌면
# 제 무게로 계속 돈다. 그래서 되돌아오는 칸이 "거둔다" 가 아니라 "끌려간다" 다.

MOTIONS['axe'] = {
    'weapon': 'battle axe',
    'dName': '내리찍기', 'eName': '도약 강타', 'wName': '폭발',

    'noclip': """THE ONE RULE THAT PREVENTS THIS: **the axe never leaves her body's own footprint by
more than half a body height.** Read the eight pose descriptions again — none of them
raises the axe overhead, none swings it out behind her at full extension. The head is
always low, grounded, or resting on a shoulder.

That is deliberate. The haft is nearly as long as she is tall and the head is a broad
slab on the end of it, so any pose that extends the weapon fully needs twice her body
height of room, and the direction changes every frame. An axe raised overhead is the
single most common way this sheet fails.""",

    'frames': [
        ('guard', '대기',
         'standing at rest and ready, weight settled, head level, watching.' + NL +
         '  THE AXE HEAD RESTS ON THE GROUND beside her front foot, the haft angled up '
         'across the front of her body, both hands loose on it. She is leaning on it '
         'slightly. This is the pose she holds most of the time — it must look heavy and '
         'unbothered, like the weapon is resting rather than being held.'),

        ('windup', '치켜듦',
         'winding up. Torso twisted back and away from the target, hips coiled, front foot '
         'planted.' + NL +
         '  THE HAFT IS LAID BACK ACROSS HER FAR SHOULDER with the head hanging down behind '
         'that shoulder — hugging her back, foreshortened, NOT sticking out into open '
         'space. Like a woodcutter loading a swing with the axe resting on the shoulder.'),

        ('strike', '내려침',
         'the blow landing. Body driven forward past the front foot, both hands hauling the '
         'haft down and through.' + NL +
         '  THE AXE HEAD ENDS LOW, buried in the air down-forward at about 45 degrees, just '
         'above the ground in front of her. Not horizontal, not raised.' + NL +
         '  Two or three short straight speed lines follow the arc. They are part of the '
         'drawing and must also stay inside the cell.'),

        ('recover', '되돌아옴',
         'being dragged round by the weight. Shoulders square again but the hips still '
         'turning, weight fallen onto the rear foot.' + NL +
         '  THE HAFT HAS SWUNG THROUGH AND THE HEAD NOW HANGS BEHIND HER at knee height, '
         'close to her rear heel, pulled IN toward the body. She is not putting it back — '
         'it is carrying her, and she is catching up with it.'),

        ('hit', '피격',
         'taking a hit. Head snapped back, torso recoiled, one foot skidding. The axe drops '
         'and swings low across her body, head toward the ground, one hand nearly off the '
         'haft — she is losing hold of it, not raising it.'),

        ('stagger', '휘청',
         'staggering. Doubled forward over the axe, whose head is planted in the ground in '
         'front of her and taking her weight through the haft. One knee buckling, free hand '
         'braced on her thigh, hair fallen across the face. Still standing, barely.'),

        ('win', '승리',
         'victory. Facing the viewer square-on rather than to the side, feet planted wide, '
         'chin up, grinning.' + NL +
         '  THE AXE HEAD IS PLANTED IN THE GROUND IN FRONT OF HER, both hands stacked on the '
         'butt of the haft, which stands at about chest height. NOT raised overhead — a '
         'raised axe needs twice the cell height and gets cut off, and an axe driven into '
         'the earth reads as the stronger victory anyway.'),

        ('lose', '패배',
         'defeated. Down on one knee, head bowed, the axe planted head-down in the ground '
         'beside her, one hand still on the haft using it as a prop. Side-on, facing right.'),
    ],

    'dHead': 'SUBJECT: a 3-frame animation of ONE single character performing ONE downward '
             'axe chop, left to right. The character IS in every cell — this is not an '
             'effect-only sheet.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'THE SWING: she chops DOWNWARD, from her far shoulder down and forward past '
             'her front foot. The axe never goes above her head and never swings out behind '
             'her at full stretch — it travels through the front-lower quarter of the cell.'
             + NL + NL
             + 'THE TRAIL IS DRAWN INTO THESE FRAMES, not supplied separately. It is a white '
             'crescent following the path the head has already swept: absent in cell 1, '
             'biggest and boldest in cell 2, breaking into fragments in cell 3.' + NL + NL
             + 'AN AXE TRAIL IS THICKER THAN A SWORD TRAIL. The cutting edge is a hand-span '
             'wide, so the crescent is a broad heavy band, not a thin line.',

    'slash': [
        ('cut_1', '1 당김',
         'the wind-up. Torso coiled back and away, front foot planted, the haft laid back '
         'across her far shoulder with the head hanging behind it, both hands stacked low '
         'on the haft. NO trail yet — nothing has moved.'),
        ('cut_2', '2 찍음',
         'the chop at its fastest, the head sweeping down past the front of her body and '
         'ending down-forward at about 45 degrees, arms extended, hips driving through, '
         'her whole weight behind it.' + NL +
         '  A BOLD WIDE WHITE CRESCENT sweeps with it, tracing the whole path the head has '
         'travelled from her shoulder down past the edge. Thick and heavy — this is the '
         'frame the player sees land, and it must be the boldest of the three.'),
        ('cut_3', '3 끌림',
         'the swing finished and still carrying her. The head has come to rest low near the '
         'ground in front of her, arms extended down, one shoulder dropped by the weight.'
         + NL +
         '  The crescent has broken into three separate fragments with gaps between them, '
         'fading behind the head.'),
    ],

    'dRules': '- The trail is part of the drawing and is WIDE. It must stay inside its cell '
              'exactly like the axe does — an arc running off the edge is the same failure '
              'as a clipped weapon.' + NL
              + '- Cell 2 is the widest and reaches furthest. Size the whole sheet from that '
              'one, then draw the other two at the same scale.' + NL
              + '- Her body fills about 55% of the cell height. She stands slightly LEFT of '
              'centre because she swings forward to the RIGHT.',

    'eHead': 'SUBJECT: a 3-frame animation of ONE single character LEAPING and slamming '
             'her axe down at the end of a jump, left to right. The character IS in every cell.'
             + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'SHE LEAVES THE GROUND. Her normal attack is a chop from a standing '
             'position; here she jumps forward into the middle of the enemy line and '
             'brings the axe down with her whole falling weight. The giveaway must be '
             'visible at a glance: HER FEET ARE OFF THE GROUND in cells 1 and 2, and in '
             'cell 3 she is in a deep crouch, much lower than she ever stands.' + NL + NL
             + 'THIS IS THE ONE PLACE THE AXE GOES UP. In cell 1 it is raised — but she is '
             'AIRBORNE and drawn small in the upper part of the cell, so the raised axe '
             'still fits. Draw her at about 45% of the cell height here, not 60%.',

    'skill': [
        ('sk_1', '1 도약',
         'airborne at the top of the jump, high in the UPPER HALF of the cell, small. Body '
         'tucked, knees drawn up, both hands hauling the axe back and up over her far '
         'shoulder. Ears and tail streaming. Empty black below her — she is high up.' + NL +
         '  She is DRAWN SMALLER HERE — about 45% of the cell height — because this is the '
         'only frame where the axe is raised, and it must fit above her.'),
        ('sk_2', '2 낙하',
         'falling, halfway down, still clear of the ground. Legs snapping straight and out '
         'in front of her, both arms driving the axe down ahead of her body, head between '
         'her arms.' + NL +
         '  Four or five long straight speed lines run vertically behind her. Same scale as '
         'cell 1 — she is falling, not growing.'),
        ('sk_3', '3 내리찍음',
         'the landing. Deep crouch, one knee dropped low, both feet planted wide, the axe '
         'head stopped at the very bottom of her reach directly in front of her, haft '
         'vertical, her weight still coming down through it.' + NL +
         '  A BURST OPENS AT THE AXE HEAD: a low wide fan of straight radiating lines and '
         'hard chunks thrown outward and UP on BOTH sides of her. This is the frame the '
         'player sees land — the burst is the biggest shape in the sheet.' + NL +
         '  DRAW NO FLOOR. No ground line, no cracks, no paving, nothing under her boots '
         'or under the burst. The fan simply opens outward from the axe head into black. '
         'Her crouch is what says she hit something.'),
    ],

    'eRules': '- Cell 3 is the widest — the burst throws out on BOTH sides of her. '
              'Size the whole sheet from it.' + NL
              + '- Cells 1 and 2 draw her SMALLER (about 45% of the cell) and high up, '
              'because that is where the axe is raised. Cell 3 draws her at normal scale '
              'but crouched. This is the one sheet where the figure changes size between '
              'cells, and it is deliberate — she is far away and then close.' + NL
              + '- The three cells do NOT share a ground line, and no ground is drawn in '
              'any of them. She is high in cell 1, falling in cell 2, and crouched low in '
              'cell 3 — the height alone tells the story.' + NL
              + '- She travels LEFT to RIGHT across the three cells: near the left edge in '
              'cell 1, centre in cell 2, right of centre in cell 3.',

    'wHead': 'SUBJECT: 3 cells. An impact blast — the burst thrown outward where a heavy '
             'axe came down. There is NO character, NO weapon, NO axe, NO ground — only '
             'the blast.' + NL + NL
             + 'It opens UPWARD AND OUTWARD like a fan from a point low in the cell, because '
             'that is where the axe head stopped. It does NOT travel sideways; it stays '
             'where it was made and dies there.' + NL + NL
             + 'THERE IS NO FLOOR IN THIS SHEET. Do not draw a ground line, paving, cracks, '
             'or dust lying on a surface. The blast opens into pure black.',

    'wave': [
        ('wave_1', '1 터짐',
         'the moment of impact. A low wide fan of force bursting UP and OUT from a point '
         'near the BOTTOM CENTRE of the cell — a solid bright wedge with six or seven '
         'straight spikes radiating up and to both sides, and a few hard chunks thrown '
         'with them. Widest at the bottom, tapering as it rises. Below the point it came '
         'from there is nothing at all — pure black.'),
        ('wave_2', '2 솟음',
         'the blast rising. The wedge has lifted and spread wider, its core thinner and '
         'more broken, the spikes longer and further apart. The thrown chunks are higher '
         'and further out, arcing away from the centre.'),
        ('wave_3', '3 흩어짐',
         'the blast dispersing. Only scattered chunks and short dashes remain, drifting '
         'apart and upward. Most of the cell is already empty, and nothing is left sitting '
         'along the bottom.'),
    ],

    'wRules': '- This one is WIDER THAN IT IS TALL and it sits LOW in the cell, because '
              'that is where the axe head stopped. Do not centre it vertically.' + NL
              + '- No floor, no ground line, no dust layer. It opens into black.' + NL
              + '- It is symmetric left-to-right, unlike a travelling arc — it opens both '
              'ways from the point of impact.',

    'dIntro': """**한 번 내려찍는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup → strike →
recover` 셋을 대신합니다 — 같은 세 칸이지만 **참격 궤적이 들어가고**, 자세도
찍기 전용으로 다시 그립니다.

궤적은 그림 안에 같이 들어갑니다. 따로 뽑아 겹치면 도끼가 지나간 자리와 도끼가
실제로 있는 자리가 한 픽셀씩 어긋납니다.

**도끼 궤적은 검보다 두껍습니다.** 날이 한 뼘 폭이라, 가는 선이 아니라 넓은
띠로 지나갑니다. 이게 대검과 한눈에 구별되는 지점입니다.""",

    'eIntro': """평타(§D)가 **서서 내려찍기**라면 스킬은 **뛰어들어 내려찍기**입니다.
적 한가운데로 점프해서, 떨어지는 무게까지 실어 바닥을 쪼갭니다.

한눈에 달라 보이는 지점은 **발**입니다 — 1·2번 칸에서 발이 땅에 없습니다.
3번 칸은 반대로 평소보다 훨씬 낮게 주저앉습니다.

**이 시트에서만 캐릭터 크기가 칸마다 달라집니다.** 1·2번은 작게(칸 높이의
45%), 3번은 평소 크기로 그립니다. 일부러 그렇게 합니다 — 멀리 떠 있다가
가까이 떨어지는 것이라, 크기가 같으면 점프로 안 읽힙니다.

도끼를 머리 위로 드는 곳도 여기 하나뿐입니다. 공중에 작게 떠 있는 칸이라
들어 올려도 안 잘립니다.

**바닥은 그리지 마세요.** 게임이 바닥을 따로 깔고 그 위에 이 그림을 얹습니다
(`Ground.tsx`). 칸 안에 바닥선이나 갈라진 금을 그리면 화면에서는 공중에 뜬
흰 덩어리가 됩니다. 닿았다는 것은 **자세**로 말합니다 — 낮게 주저앉은 것,
좌우로 퍼지는 부채꼴.

**두 장으로 나눕니다.** 터지는 폭발이 몸과 따로 있어야 하는데, 한 장에 같이
그리면 캐릭터에 묶여서 못 움직입니다.""",

    'wIntro': """캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**앞의 것들과 반대입니다.** 검기·화살은 옆으로 날아가지만 이건 **아래에서 위로**
퍼집니다. 그래서 세로로 긴 초승달이 아니라 **가로로 넓은 부채꼴**이고, 칸
가운데가 아니라 **아래쪽**에 붙습니다.

**여기에도 바닥은 없습니다.** 도끼가 멈춘 자리에서 그냥 퍼져 나갈 뿐이고,
아래쪽은 검정입니다.""",
}
# ── 활 ───────────────────────────────────────────────────────
#
# 앞의 둘과 근본이 다르다. **베지 않는다.** 힘을 모으는 칸이 곧 당기는 칸이고,
# 때리는 순간은 몸이 제일 조용한 순간이다 (놓는 손가락만 움직인다).
#
# 활은 짧은 것으로 잡았다. 제 키만 한 장궁은 세로로 반드시 잘린다 — 대검에서
# 세 번 겪은 것과 같은 문제다. 짧은 곡궁이면 어떤 자세에서도 칸 안에 들어간다.

ARROW = """WHAT AN ARROW LOOKS LIKE — READ THIS BEFORE DRAWING ANY OF IT.

The word "arrow" here always means a PHYSICAL PROJECTILE, never a symbol. Every
arrow in this sheet has all three parts, and all three must be visible:

- SHAFT: a long thin straight rod. This is most of the arrow.
- HEAD: a small narrow point at the FRONT. It is barely wider than the shaft —
  a slim leaf or a thin spike, not a big triangle.
- FLETCHING: two or three short angled vanes at the BACK end, like a small feather
  split down the middle. THIS IS THE PART THAT PROVES IT IS AN ARROW. An arrow
  drawn without fletching turns into a symbol.

NEVER DRAW AN ARROW SYMBOL. No navigation arrow, no cursor, no pointer, no chevron,
no dart, no triangle on a line, no "→". No UI glyph of any kind. If the shape you
are about to draw would work as a button icon meaning "next", it is wrong.

A useful test: an arrow seen in flight is mostly EMPTY SPACE and ONE LONG THIN LINE,
with a tiny point at one end and a small ragged feather at the other. The point is
the smallest part of the drawing, not the biggest."""


MOTIONS['bow'] = {
    'weapon': 'recurve shortbow',
    'extra': ARROW,
    'dName': '쏘기', 'eName': '화살비',

    'noclip': """THE ONE RULE THAT PREVENTS THIS: **her bow is SHORT — about half her height, from
her chin to her hip when stood on end.** It is a compact recurve, not a longbow.

This is deliberate. A bow as tall as the archer must be drawn vertically, and a
vertical line that long is the single most reliable way to lose the top of a cell.
A short recurve fits inside her own outline in every pose here.

Nothing else extends far either — read the eight poses again. The bow is held close,
the drawn arrow lies along her cheek, and the loosed arrow is a SHORT streak that
stops well inside the cell. She never holds the bow out at arm's length above her.""",

    'frames': [
        ('guard', '대기',
         'standing at rest and watching. Weight settled on both feet, head level, eyes '
         'ahead.' + NL +
         '  THE BOW HANGS LOW IN HER LEFT HAND at her side, held by the grip, string '
         'slack, the whole bow angled slightly forward and down. Her right hand rests near '
         'the quiver at her hip. NO arrow nocked. This is the pose she holds most of the '
         'time — alert but unhurried.'),

        ('windup', '당김',
         'at full draw. Body turned side-on, front arm straight and steady holding the bow '
         'canted about 30 degrees off vertical, drawing hand back at her cheek, the nocked '
         'arrow running along her jawline.' + NL +
         '  This is where the power is — the whole frame should read as held tension. '
         'Fletching against her cheek, string bent to a sharp angle, front shoulder locked.'),

        ('strike', '쏨',
         'the loose. Everything is nearly identical to the previous frame EXCEPT: the string '
         'has snapped forward straight, the drawing hand has opened and flicked back past '
         'her ear, and the arrow has just left.' + NL +
         '  THE ARROW IS A SHORT WHITE STREAK in front of the bow, about a third of the '
         'cell wide, already clear of the bow but still well inside the cell. Do NOT run it '
         'off the edge. Two short speed lines behind it.' + NL +
         '  Her body barely moves. An archer at the moment of release is the stillest thing '
         'on the field, and that stillness is what makes the arrow read as fast.'),

        ('recover', '재장전',
         'reaching for the next arrow. The bow arm has dropped to about waist height, still '
         'holding the bow, while her right hand reaches back over her shoulder or down to '
         'the quiver at her hip and has just closed on a shaft.' + NL +
         '  Weight shifting back onto the rear foot. The most compact of the four.'),

        ('hit', '피격',
         'taking a hit. Head snapped back, torso recoiled, one foot skidding. The bow arm '
         'flung out and down, string slack, and the arrow she was holding tumbling loose '
         'in the air beside her.'),

        ('stagger', '휘청',
         'staggering. Down on one knee with the bow braced on the ground like a walking '
         'stick, taking her weight through her front arm. Other hand pressed to her side, '
         'head down, hair fallen across the face. Still up, barely.'),

        ('win', '승리',
         'victory. Facing the viewer square-on rather than to the side, feet planted, chin '
         'up.' + NL +
         '  THE BOW IS HELD ACROSS THE FRONT OF HER BODY at chest height in her left hand, '
         'and her right hand holds a single arrow upright beside her face, pinched between '
         'two fingers. NOT raised overhead — nothing goes above the top of her head.'),

        ('lose', '패배',
         'defeated. Down on one knee, head bowed, the bow lying flat on the ground in front '
         'of her with one hand resting on it. Side-on, facing right.'),
    ],

    'dHead': 'SUBJECT: a 3-frame animation of ONE single character firing ONE arrow from a '
             'short recurve bow, left to right. The character IS in every cell — this is not '
             'an effect-only sheet.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'THIS IS A SHOT, NOT A SWING. Almost nothing about her body moves between '
             'the three cells — the change is in the STRING, the DRAWING HAND, and the '
             'ARROW. Do not turn this into a melee animation.' + NL + NL
             + 'DO NOT DRAW THE FLYING ARROW. The arrow that leaves the bow comes from a '
             'SEPARATE sheet and the game moves it across the screen — drawing it here too '
             'would put two arrows on screen at once, one of them stuck to her hands.'
             + NL + NL
             + 'The only arrow in this sheet is the one still ON THE STRING in cell 1. '
             'After the release her hands are empty. What sells the shot is the STRING '
             'snapping straight and the drawing hand flying open, not a projectile.',

    'slash': [
        ('cut_1', '1 당김',
         'at full draw and holding. Side-on, front arm straight, bow canted about 30 degrees '
         'off vertical, drawing hand at her cheek, string bent sharp. The nocked arrow lies '
         'along her jawline with its FLETCHING right at her cheek and its point resting on '
         'the bow — the whole shaft is visible against her face. Nothing has been released. '
         'The frame should feel like held breath.'),
        ('cut_2', '2 놓음',
         'the release. Same stance, but THE STRING HAS SNAPPED FORWARD STRAIGHT, the drawing '
         'hand has flown open past her ear with the fingers spread, and her front shoulder '
         'has taken the recoil. Her hair and the feather in it kick from the snap.' + NL +
         '  NO ARROW ANYWHERE. Her hands are empty and the air in front of the bow is '
         'empty black. This is the frame the player sees land, and it lands because the '
         'string is straight and her hand is open — nothing else is needed.'),
        ('cut_3', '3 잔상',
         'the follow-through. Her drawing hand is still back near her ear, fingers open, '
         'and the bow has begun to drop. She is watching where the shot went.' + NL +
         '  Still NO ARROW. The string is settling, slightly slack. The cell is her and the '
         'bow and nothing else.'),
    ],

    'dRules': '- There is NO flying arrow in this sheet and no speed lines in the air. '
              'Empty black in front of the bow is correct.' + NL
              + '- All three cells are nearly the same width, because she barely moves. '
              'Size the sheet from cell 1, which is the widest at full draw.' + NL
              + '- Her body fills about 55% of the cell height. She stands slightly LEFT of '
              'centre because she shoots to the RIGHT.',

    'shotName': '화살',
    'shotHead': 'SUBJECT: 3 cells. ONE arrow in flight, animating over 3 frames, left to '
                'right. There is NO character, NO bow, NO ground — only the arrow.' + NL + NL
                + 'It was loosed flat from a short recurve bow and is crossing the field. '
                'It travels to the RIGHT; the game mirrors it in code when it needs to go '
                'the other way.' + NL + NL
                + 'This is the sheet that carries every normal shot she fires, so it has to '
                'read as an arrow at 40 pixels wide, alone, with nothing around it.',
    'shot': [
        ('shot_1', '1 날아감',
         'the arrow at full speed, drawn side-on and horizontal, filling most of the cell '
         'width. A long thick shaft, a small narrow point at the RIGHT end no wider than '
         'the shaft, and two short angled fletching vanes at the LEFT end. Three straight '
         'speed lines trail behind it on the left, thinner than the shaft and clearly '
         'separate from it. Solid and bright.'),
        ('shot_2', '2 지나감',
         'the same arrow a moment later, identical in shape but with the speed lines longer '
         'and thinner and beginning to break into dashes. The shaft itself does not change '
         '— it is a solid object, not an effect.'),
        ('shot_3', '3 사라짐',
         'the arrow leaving. The shaft has thinned and broken into two or three dashes, the '
         'point and fletching nearly gone, the speed lines gone. Most of the cell is empty.'),
    ],
    'shotRules': '- The arrow lies FLAT AND HORIZONTAL across the cell — it is WIDER THAN '
                 'IT IS TALL. A vertical or diagonal arrow is a different sheet.' + NL
                 + '- The point is the SMALLEST part of the drawing. If it is a big '
                 'triangle you have drawn a symbol.' + NL
                 + '- The fletching must survive at 40 pixels. Make it two chunky angled '
                 'blocks, not fine feather strands.' + NL
                 + '- The arrow is centred in its cell and stays inside it. The game moves '
                 'it across the screen; do not draw it partly off the edge.',
    'shotIntro': """캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**평타로 쏘는 화살입니다.** §D 에서는 안 그리고 여기서 따로 받습니다 — 화살은
몸을 떠나 화면을 가로질러야 하는데, 캐릭터 그림에 같이 그리면 손에 묶여서 못
움직입니다. 검기(`SwordWave`)와 같은 구조입니다.

게임은 **1번 칸만 씁니다.** 40px 로 줄여도 홀로 "화살" 로 읽혀야 하므로, 자루는
굵고 깃은 뭉툭한 두 덩이로 그리세요.""",

    'eHead': 'SUBJECT: a 3-frame animation of ONE single character firing a volley of '
             'arrows STRAIGHT UP INTO THE SKY, left to right. The character IS in every '
             'cell.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'SHE KNEELS AND SHOOTS AT THE SKY. Her normal attack is a flat shot taken '
             'standing; here she drops onto one knee, plants herself, and points the bow '
             'UP — so the arrows come down somewhere else entirely.' + NL + NL
             + 'TWO GIVEAWAYS, BOTH VISIBLE IN EVERY CELL:' + NL
             + '- SHE IS DOWN ON ONE KNEE. Right knee on the ground, left foot planted flat '
             'in front, body upright above them. Her head sits much lower in the cell than '
             'in any other sheet, and that drop is the pose reading.' + NL
             + '- SHE IS LOOKING UP, not forward, and the bow is tilted up with her.'
             + NL + NL
             + 'Kneeling is what lets her aim so steeply — she is bracing for a shot she '
             'cannot take standing. The bow still never goes above the top of her head; '
             'she tilts it up about 60 degrees, she does not hold it overhead.',

    'skill': [
        ('sk_1', '1 무릎 꿇고 겨눔',
         'down on one knee at full draw, aimed UP. Right knee on the ground, left foot '
         'planted flat in front of her with that knee up, torso upright and squared toward '
         'the viewer rather than side-on. Bow arm raised so the bow points up and to the '
         'right at about 60 degrees, drawing hand at her cheek. Chin lifted, eyes on the '
         'sky. THREE ARROWS are laid across the string, spread apart like a fan — three '
         'separate shafts, three separate points, and three sets of fletching bunched '
         'together in her drawing hand. NO effect yet.'),
        ('sk_2', '2 놓음',
         'the release. Still kneeling in exactly the same place — the knee does not lift — '
         'string snapped forward, drawing hand flung open past her ear, cloak and ponytail '
         'kicked by the snap. THREE ARROWS climb away steeply toward the UPPER RIGHT corner '
         'of the cell, each a thin shaft with a small point at its upper end and fletching '
         'at its lower end, each with one speed line behind it.' + NL +
         '  They are already small and getting smaller — they are leaving, not passing by. '
         'They stop well inside the cell.'),
        ('sk_3', '3 올려다봄',
         'watching them go, still on the knee. The bow has dropped to about chest height, '
         'still angled up, both arms relaxed, head tipped right back to follow them. The '
         'most still frame in the sheet.' + NL +
         '  The arrows have LEFT THE CELL. Three thin broken dashes near the top right '
         'corner are all that is left of their path — no shafts, no points, no feathers.'),
    ],

    'eRules': '- She KNEELS in all three cells, so her head sits noticeably LOWER than in '
              'any other sheet. Do not scale her up to fill the space that opens above '
              'her — that space is where the arrows go.' + NL
              + '- Her knee is in exactly the same place in all three cells. She does not '
              'rise, and she does not travel.' + NL
              + '- Nothing here reaches sideways, so the cells are TALL rather than wide. '
              'Cell 2 reaches highest — size the whole sheet from it.' + NL
              + '- Kneeling, she fills about 45% of the cell height and sits LEFT of '
              'centre, because the arrows climb away to the upper right.' + NL
              + '- The arrows END INSIDE the cell in cell 2. They are climbing out of the '
              'scene, but the drawing still stops at the border.' + NL
              + '- Count the fletching. Three arrows means three little feathers. If they '
              'do not read at this size the arrows are drawn too small — make the shafts '
              'thicker and shorter rather than dropping the vanes.' + NL
              + '- Her feet are in exactly the same place in all three cells — she is '
              'planted, not moving.',

    'dIntro': """**화살 한 대를 쏘는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup → strike →
recover` 셋을 대신합니다.

**앞의 근접 캐릭터들과 근본이 다릅니다.** 베는 캐릭터는 때리는 순간 몸이 제일
크게 움직이는데, 활잡이는 반대입니다 — 놓는 순간이 제일 조용합니다. 움직이는
것은 시위와 놓는 손, 그리고 화살뿐입니다.

그래서 세 칸의 실루엣이 거의 같습니다. 그게 맞습니다. 이걸 "밋밋하다" 고 여겨
몸을 크게 흔들면 활잡이가 아니라 칼잡이가 됩니다.

**날아가는 화살은 여기 없습니다.** §D-2 로 따로 받아서 게임이 움직입니다.
여기에도 그리면 화면에 화살이 둘 나오고, 그 중 하나는 손에 붙어 안 움직입니다.

시위에 걸린 화살은 1번 칸에만 있습니다. 쏘고 나면 손이 빕니다 — **곧게 펴진
시위와 벌어진 손가락**이 쐈다는 것을 말합니다.""",

    'eIntro': """평타(§D)가 **서서 앞으로 한 발**이라면 스킬은 **무릎 꿇고 하늘로**입니다.
겨누지 않습니다. 위로 쏘고, 화살은 딴 데 가서 후두두둑 떨어집니다.

한눈에 달라 보이는 지점이 둘입니다 — **무릎**과 **시선**. 세 칸 내내 한쪽
무릎을 땅에 대고 하늘을 올려다봅니다. 평타에서는 서서 오른쪽을 봅니다.
그렇게 가파르게 겨누려면 몸을 받쳐야 하고, 그게 무릎을 꿇는 이유입니다.

게임에서도 그렇게 굴러갑니다. 이 기술은 다섯 발이 **한 발씩 무작위로**
떨어집니다 (`core/chars` 의 `SKILLS.rain`). 어디에 떨어질지 그녀도 모르는
것이라, 겨누는 그림이면 안 됩니다.

**떨어지는 화살은 §D-2 를 그대로 씁니다.** 따로 뽑지 않습니다 — 화살은 어느
쪽으로 날든 같은 물건이고, 게임이 그 한 장을 여러 개 띄워 기울여 떨어뜨립니다.
그림을 두 벌 받으면 평타 화살과 스킬 화살이 미묘하게 달라져서, 같은 사람이
쏘는 것으로 안 보입니다.

그래서 이 시트에는 **떠나는 순간까지만** 그립니다. 하늘로 올라가는 세 대는
1·2번 칸에서 작아지며 사라지고, 그 뒤는 게임이 맡습니다.""",

    'wIntro': """캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**앞의 것들과 방향이 다릅니다.** 검기는 옆으로 날아가지만 이건 **위에서 아래로**
떨어집니다. 그리고 하나가 아니라 **대여섯 발이 흩어져** 있습니다 — 40px 에서도
"여러 발" 로 읽혀야 하니 자루는 짧고 굵게, 사이는 넓게 그리세요.""",
}


# ── 향로 (사제) ──────────────────────────────────────────────
#
# 셋 중 제일 특이하다. **무기가 사슬에 매달려 있다.** 그래서 궤적이 몸에서
# 멀어졌다가 돌아오고, 힘을 주는 칸과 닿는 칸 사이에 시차가 있다.
#
# 그리고 보조 역할이라, 이기고 지는 자세가 앞의 셋과 결이 달라야 한다 —
# 이겨도 주먹을 안 쥔다.

MOTIONS['censer'] = {
    'weapon': 'chained censer',
    'dName': '휘두르기', 'eName': '기도', 'wName': '회복 빛',

    'noclip': """THE ONE RULE THAT PREVENTS THIS: **the chain is SHORT — about a forearm's length.**
The censer swings at the end of it, so at full extension the whole weapon reaches
roughly from her shoulder to her knee and no further.

This is deliberate. A long chain whipping out at full stretch is unpredictable in
length and direction, and that is exactly how a cell gets clipped. Read the eight
poses again: the censer is always within one forearm of her hands, and the chain is
taut or coiled, never streaming across open space.

The light it sheds is also contained — a glow around the censer and a short trail
behind it, never a beam crossing the cell.""",

    'frames': [
        ('guard', '대기',
         'standing at rest, calm and composed. Weight settled, head slightly bowed, eyes '
         'ahead and steady.' + NL +
         '  THE CENSER HANGS STRAIGHT DOWN in front of her at about knee height, its chain '
         'held in both hands at her waist, perfectly still. A thin wisp of smoke rises from '
         'it. This is the pose she holds most of the time, and it should read as prayer '
         'rather than readiness — she is the calmest figure on the field.'),

        ('windup', '끌어올림',
         'drawing back. Torso turned away from the target, both hands lifted to her far '
         'shoulder, the chain taut.' + NL +
         '  THE CENSER IS PULLED BACK AND UP behind that shoulder, hanging close to her '
         'back, NOT swinging out into open space. It glows brighter as she gathers — the '
         'light lives inside the censer at this point, not around her.'),

        ('strike', '휘두름',
         'the swing through. Both hands driving forward and down past her front hip, chain '
         'snapped taut and straight.' + NL +
         '  THE CENSER ENDS LOW, down-forward at about 45 degrees, at knee height in front '
         'of her. A BURST OF LIGHT breaks out of it here — a compact starburst around the '
         'censer with two short streaks trailing back along the path it swept. The light is '
         'the attack; the metal is just what carries it.'),

        ('recover', '되돌아옴',
         'the censer swinging back toward her. Shoulders squaring, weight settling onto the '
         'rear foot, hands drawing the chain in.' + NL +
         '  THE CENSER HANGS ALONGSIDE HER at knee height, close to her rear heel, chain '
         'slack and looping. The light has died back to a faint glow inside it. The most '
         'compact frame of the four.'),

        ('hit', '피격',
         'taking a hit. Head snapped back, torso recoiled, one foot skidding. The chain has '
         'gone slack and the censer swings loose and low across her body, its light guttering '
         'out. One hand has come off the chain.'),

        ('stagger', '휘청',
         'staggering. Down on one knee, both hands pressed to the ground with the censer '
         'lying beside them, its lid fallen open and the last of the light spilling out '
         'across the floor. Head bowed, hair fallen across the face. Still up, barely.'),

        ('win', '승리',
         'victory — but quiet. Facing the viewer square-on, feet together rather than '
         'planted wide, head slightly bowed, eyes closed, a small calm smile.' + NL +
         '  THE CENSER IS HELD IN BOTH HANDS AT CHEST HEIGHT, chain gathered, glowing '
         'steadily. NOT raised overhead and NOT thrust forward. She is not celebrating; '
         'she is giving thanks, and that difference is the whole character.'),

        ('lose', '패배',
         'defeated. Down on one knee, head bowed, both hands folded over the censer resting '
         'on her raised knee, its light nearly out. Side-on, facing right.'),
    ],

    'dHead': 'SUBJECT: a 3-frame animation of ONE single character swinging a chained censer '
             'forward, left to right. The character IS in every cell — this is not an '
             'effect-only sheet.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'THIS IS NOT A BLADE. The censer is a small metal vessel on a short chain. '
             'She does not cut with it — she swings it forward and the LIGHT that breaks out '
             'of it is what lands. Draw the light as the loudest thing in the sheet and the '
             'metal as almost incidental.' + NL + NL
             + 'THE LIGHT IS DRAWN INTO THESE FRAMES, not supplied separately: gathered '
             'inside the censer in cell 1, bursting out of it in cell 2, and scattered into '
             'drifting motes in cell 3.',

    'slash': [
        ('cut_1', '1 모음',
         'gathering. Torso turned away, both hands lifted to her far shoulder, chain taut, '
         'the censer pulled back and up behind that shoulder. It glows hard and white from '
         'INSIDE — the light is contained, nothing has escaped yet. Her eyes are closed.'),
        ('cut_2', '2 터뜨림',
         'the swing through. Both hands driving forward and down past her front hip, chain '
         'snapped straight, the censer down-forward at about 45 degrees at knee height.'
         + NL +
         '  A BOLD STARBURST OF LIGHT breaks out of the censer, with a broad white crescent '
         'trailing back along the path it swept. This is the frame the player sees land, so '
         'the light must be the boldest thing in the sheet — bigger than the censer itself, '
         'bigger than her hands.'),
        ('cut_3', '3 흩어짐',
         'the follow-through. The censer has swung out to hang low in front of her, chain '
         'slack, her hands opening. She is watching where the light went.' + NL +
         '  The burst has broken into six or seven separate motes drifting apart and fading, '
         'the crescent gone.'),
    ],

    'dRules': '- The light is part of the drawing, and it is the BIGGEST part. It must stay '
              'inside its cell exactly like the censer does.' + NL
              + '- Cell 2 is the widest and brightest. Size the whole sheet from that one, '
              'then draw the other two at the same scale.' + NL
              + '- Her body fills about 55% of the cell height. She stands slightly LEFT of '
              'centre because she swings forward to the RIGHT.',

    'eHead': 'SUBJECT: a 3-frame animation of ONE single character KNEELING IN PRAYER and '
             'releasing a soft bloom of healing light, left to right. The character IS in '
             'every cell.' + NL + NL
             + 'THE CHARACTER (this exact person in all 3 cells):' + NL + '@LOCK@' + NL + NL
             + 'SHE IS NOT ATTACKING. This is the one skill in the game that does no damage '
             '— it heals her allies. Nothing here may look like a blow: no swing, no '
             'thrust, no impact, no speed lines anywhere in the sheet.' + NL + NL
             + 'THE GIVEAWAY IS THAT SHE KNEELS. Her normal attack is a standing swing; '
             'here she goes down on one knee, sets the censer on the ground in front of '
             'her, and folds her hands. She faces the VIEWER, not the right.',

    'skill': [
        ('sk_1', '1 무릎 꿇음',
         'going down. She has dropped onto her right knee, facing the viewer square-on, '
         'skirts of the habit pooling around her, and set the censer on the ground just in '
         'front of her knee. Hands coming together at her chest, head bowing, eyes closing. '
         'The censer glows faintly. NO light around her yet.'),
        ('sk_2', '2 기도',
         'the prayer. Same kneeling pose exactly — she does not move — hands now fully '
         'folded at her chest, head bowed low over them, eyes closed.' + NL +
         '  LIGHT BLOOMS UPWARD AND OUTWARD FROM THE CENSER around her: a soft wide dome of '
         'dithered brightness rising past her shoulders, with eight or ten small motes '
         'drifting UP out of it. The light is gentle and rising — it must not read as an '
         'explosion. Her veil and the hem of the habit lift slightly in it.'),
        ('sk_3', '3 일어섬',
         'rising. She is coming back up onto her feet, one hand lifting the censer by its '
         'chain, the other still at her chest, head coming up and eyes opening. Calm.' + NL +
         '  The dome has thinned to a faint ring at her feet and a few last motes still '
         'drifting up past her shoulders.'),
    ],

    'eRules': '- Cell 2 is the widest and brightest — the dome spreads on BOTH sides of '
              'her. Size the whole sheet from it.' + NL
              + '- She is KNEELING in cells 1 and 2, so her head sits noticeably LOWER than '
              'in any other sheet. That drop is the pose reading; do not scale her up to '
              'fill the space.' + NL
              + '- She is in the MIDDLE of her cell, facing the viewer, in all three cells. '
              'She does not travel and she does not turn.' + NL
              + '- NO speed lines and NO sharp radiating spikes anywhere. Every edge of the '
              'light is soft-shaped (still 1-bit dithered, but rounded, not spiked).',

    'wHead': 'SUBJECT: 3 cells. A gentle bloom of healing light rising and fading, '
             'animating over 3 frames, left to right. There is NO character, NO object, NO '
             'ground — only the light.' + NL + NL
             + 'This effect is drawn OVER AN ALLY, not thrown at an enemy. It does not '
             'travel anywhere: it appears around someone, rises, and fades. Nothing about '
             'it may read as an impact.',

    'wave': [
        ('wave_1', '1 감쌈',
         'the light appearing. A soft upright oval of dithered brightness filling the '
         'middle of the cell, densest at the BOTTOM and thinning toward the top, with four '
         'or five small motes just starting to lift out of it. Rounded edges — no spikes, '
         'no rays.'),
        ('wave_2', '2 피어오름',
         'the light rising. The oval has lifted and stretched taller, its dense base '
         'thinning out, and eight or ten motes are now spread up through and above it, the '
         'higher ones smaller. Airier than frame 1.'),
        ('wave_3', '3 사라짐',
         'the light going. The oval is gone; only six or seven motes remain, strung up the '
         'upper half of the cell and fading. Most of the cell is empty.'),
    ],

    'wRules': '- It RISES. Frame 1 is heaviest at the bottom, frame 3 is only motes near '
              'the top. Read the three frames bottom-to-top, not left-to-right.' + NL
              + '- ROUNDED SHAPES ONLY. No spikes, no rays, no straight lines, no crescent. '
              'A spiky version of this reads as damage, which is exactly wrong.' + NL
              + '- It is TALLER THAN IT IS WIDE and centred in its cell — it wraps a person '
              'standing there.',

    'dIntro': """**향로를 한 번 휘두르는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup →
strike → recover` 셋을 대신합니다.

**날붙이가 아닙니다.** 사슬 끝에 매달린 작은 쇠그릇이고, 닿는 것은 쇠가 아니라
거기서 터져 나오는 **빛**입니다. 그래서 이 시트에서 제일 크고 밝게 그려야 하는
것은 향로가 아니라 빛입니다 — 향로 자체는 손보다 작아도 됩니다.

빛은 프레임마다 다릅니다 — 1번엔 향로 **안에** 갇혀 있고, **2번에 터지고**,
3번엔 알갱이로 흩어집니다.""",

    'eIntro': """**이 기술만 적을 안 때립니다.** 아군 전원의 체력을 채웁니다
(`core/chars` 의 `SKILLS.heal`). 보조 캐릭터의 기술이 결국 약한 공격이면 보조를
넣을 이유가 없어서, 넷 중 한 자리를 쓰는 값이 분명하도록 회복으로 잡았습니다.

그래서 **때리는 그림이면 안 됩니다.** 휘두르는 동작도, 속도선도, 터지는 것도
없습니다. 한눈에 달라 보이는 지점은 **무릎**입니다 — 평타는 서서 휘두르고,
스킬은 무릎을 꿇습니다. 그리고 오른쪽이 아니라 **정면**을 봅니다.

**두 장으로 나눕니다.** 회복 빛은 그녀가 아니라 **회복받는 사람 위에** 그려지는
것이라, 처음부터 몸과 따로 있어야 합니다.""",

    'wIntro': """캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**이건 적에게 날아가지 않습니다.** 아군 한 명을 감싸고 위로 피어올랐다
사라집니다. 그래서 옆으로 지나가는 초승달이 아니라 **세로로 선 부드러운 덩어리**
이고, 뾰족한 것이 하나도 없어야 합니다 — 뾰족하면 피해로 읽힙니다.""",
}


# ══ 캐릭터 ═══════════════════════════════════════════════════
#
# 여기에 한 항목을 더하고 다시 돌리면 그 사람 문서가 나온다.

CHARS = [
    {
        'id': 'knightgirl',
        'name': '이졸데',
        'title': '서약의 백기사',
        'role': '방어 · 근접 · S등급',
        'motion': 'blade',
        'quote': '맹세를 지키느라 한 번도 뒤로 물러선 적이 없다.',
        'gear': '서약검 여명',
        'job': '파티 맨 앞에 서서 안 비킨다. 뒤에 선 딜러가 그만큼 안 맞는다.',
        'ref': 'assets/2026-08-29-001/file_0000000066b8820682d6077adf3f81e8.jpg',
        'asym': 'the half-cape is pinned at her RIGHT shoulder and nowhere else.',

        # 모든 프롬프트에 **글자 하나 안 고치고** 들어간다
        'lock': (
            'A young woman knight, calm and unhurried. She is the most striking figure '
            'in the game and she knows it, but she never postures.\n'
            'HAIR: very long and straight, falling past the waist, with two heavy side '
            'locks framing her face. A slender circlet crosses her brow with one small '
            'gem at the centre. She never wears a helm.\n'
            'ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one '
            'pauldron on each shoulder, and articulated gauntlets to the elbow. All of '
            'it worn OVER a flowing layered dress whose long skirt is split up the '
            'front and trails behind her. Thigh-high armoured boots.\n'
            'CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.\n'
            'WEAPON: a greatsword as tall as she is, straight double-edged blade, plain '
            'cross guard, a ring pommel. No gems, no engraving — it is a working sword.\n'
            'SILHOUETTE (protect this above all): the long split skirt below hard '
            'armoured shoulders, plus the tall straight greatsword. Half soft, half '
            'iron. That contrast is how she is recognised at 54 pixels.'
        ),

        # 흉상에만 붙는 것
        'bust': (
            'Serene, level gaze straight at the viewer. A small closed-mouth smile that '
            'does not quite arrive. Both pauldrons and the top of the breastplate are '
            'in frame, and the greatsword hilt rises past her RIGHT shoulder.'
        ),

        # GPT 일러스트
        'scene': (
            'A quiet chapel hall at dusk, empty except for her. Tall narrow windows '
            'throw long shafts of light across a stone floor. Banners hang still. '
            'She kneels on one knee with the greatsword planted point-down in front of '
            'her, both hands folded over the pommel, head bowed — the moment before an '
            'oath, or just after one. The light falls from a high window onto her '
            'shoulders and the top of the blade.'
        ),
        'stack': (
            'TOP: the chapel goes UP. Two or three tall narrow windows rise out of '
            'the top of the frame, and one shaft of light comes down through them at '
            'a steep angle onto her. Banners hang vertically beside them. The ribbed '
            'ceiling is implied at the very top and left dark.' + NL
            + 'MIDDLE: her, kneeling on one knee, three-quarter view. THE GREATSWORD '
            'IS THE SPINE OF THE PICTURE — planted point-down in front of her, it '
            'stands upright through the middle band and its pommel reaches to her '
            'bowed head. Draw it dead vertical, not angled.' + NL
            + 'BOTTOM: the stone floor comes toward the viewer. The shaft of light '
            'lands as a bright patch that reaches DOWN out of the bottom of the '
            'frame, with the flagstone joints running into it. Her trailing skirt '
            'and half-cape spread across this band.'
        ),
        'mood': (
            'Reverent and still. Not a battle image and not a pin-up — this is the '
            'quietest moment of her life, and the picture should feel like holding '
            'your breath.'
        ),
    },

    {
        'id': 'bunnyaxe',
        'name': '비앙카',
        'title': '연회장의 도끼',
        'role': '공격 · 근접 · A등급',
        'motion': 'axe',
        'quote': '박수는 나중에 쳐. 아직 한 곡 남았어.',
        'gear': '축배의 도끼',
        'job': '한 번에 크게 때린다. 맞기 전에 끝내는 쪽이라 오래는 못 버틴다.',
        'ref': 'assets/wallpaper/knightgirl.jpg',
        'asym': 'the cuff on her LEFT wrist is the torn one, and the axe head faces '
                'FORWARD (to her right) in every frame.',

        'lock': (
            'A tall young woman in a bunny-girl outfit, swinging a battle axe that has no '
            'business being in the same room as that outfit. She finds this funny. That '
            'gap — cocktail costume, butcher weapon — is the entire character.\n'
            'HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long '
            'rabbit ears stand up from a headband, one of them bent over near the tip and '
            'it stays bent in every frame.\n'
            'OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff '
            'collar, and cuffs on both wrists. Over it, worn like an afterthought: a single '
            'heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt '
            'slung across her hips. Sheer stockings and heeled boots, one boot laced higher '
            'than the other. A round powder-puff tail.\n'
            'THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.\n'
            'WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The '
            'head is a broad heavy slab with a wide curved edge and a short spike on the '
            'back. The haft is wrapped in cord at the grip. It is scratched and working, '
            'not ceremonial.\n'
            'SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare '
            'narrow figure, and the enormous slab-headed axe. Two thin lines and one huge '
            'block. That is how she is recognised at 54 pixels.'
        ),

        'bust': (
            'Chin tipped down, looking up at the viewer from under the fringe with a '
            'crooked grin — like she is about to say something rude. Both rabbit ears in '
            'frame including the bent tip. The bow tie, the collar and the right shoulder '
            'guard are visible, and the axe haft crosses the frame behind her LEFT shoulder.'
        ),

        'scene': (
            'A ballroom after everyone has left. Chandeliers still lit, tables overturned, '
            'glasses and confetti across a checkered floor. She sits sideways on the edge '
            'of a long banquet table with one boot up on it, the axe laid across her lap, '
            'holding a glass she has not drunk from. Light comes down hard from the '
            'chandeliers and throws her shadow long across the wrecked floor.'
        ),
        'stack': (
            'TOP: three or four chandeliers hang DOWN into the frame at different '
            'heights, the nearest largest and cut by the top edge, the furthest small '
            'and high. They are the light and they fill the whole top band.' + NL
            + 'MIDDLE: her, sitting sideways on the near end of the banquet table, '
            'one boot up. THE TABLE POINTS INTO THE PICTURE — it recedes away from '
            'the viewer and narrows as it goes, so it reads as long without crossing '
            'the frame. The axe lies across her lap, its haft angled to echo the '
            'table\'s recession. The raised glass is her one vertical.' + NL
            + 'BOTTOM: the wrecked floor comes toward the viewer — an overturned '
            'chair on its side, glasses, confetti scattered largest at the very '
            'bottom. Her shadow reaches DOWN out of the bottom edge, not sideways.'
        ),
        'mood': (
            'Loud night, quiet morning. She is grinning but the room behind her is ruined, '
            'and the picture should let the viewer decide which of those two things '
            'happened first.'
        ),
    },

    {
        'id': 'elfarcher',
        'name': '리안느',
        'title': '숲의 마지막 활',
        'role': '공격 · 원거리 · A등급',
        'motion': 'bow',
        'quote': '나무는 다 베어 갔어. 활은 아직 여기 있고.',
        'gear': '마른가지 곡궁',
        'job': '뒤에서 쏜다. 앞이 버텨 주는 동안만 제 몫을 한다.',
        'ref': 'assets/wallpaper/knightgirl.jpg',
        'asym': 'she holds the bow in her LEFT hand and draws with her RIGHT in every '
                'frame, and the quiver rides on her RIGHT hip.',

        'lock': (
            'A slight elf woman, watchful and economical — she never makes a movement she '
            'does not need. She is the last of something and does not talk about it.\n'
            'EARS: long and swept back, clearly elven, and they are the first thing anyone '
            'notices.\n'
            'HAIR: gathered into a long high ponytail that falls to her waist, with two '
            'thin braids hanging in front of her ears. A single feather is tied into the '
            'gather of the ponytail.\n'
            'CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn '
            'over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A '
            'single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak '
            'hanging behind her right shoulder, wrapped leggings and soft boots laced to '
            'the knee. No plate anywhere.\n'
            'QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or '
            'five fletched shafts standing out of it.\n'
            'WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on '
            'end. Pale dry wood with a pronounced double curve and bound grip. It is small, '
            'and that is the point.\n'
            'SILHOUETTE (protect this above all): long swept ears and a long high ponytail '
            'above a small light figure, plus the compact double-curved bow. Fast and thin, '
            'nothing heavy anywhere. That is how she is recognised at 54 pixels.'
        ),

        'bust': (
            'Head turned slightly, looking past the viewer rather than at them, as if she '
            'has heard something. Mouth closed, brows level. Both long ears in frame and '
            'the ponytail visible over one shoulder. The bracer on her LEFT forearm shows '
            'at the bottom of the frame as she raises that hand near her chin.'
        ),

        'scene': (
            'A cleared hillside where a forest used to be. Rows of cut stumps run away into '
            'mist, and a few tall trees are still standing at the very back. She stands '
            'among the stumps with the bow held loose at her side, an arrow between her '
            'fingers but not nocked, looking back at the standing trees. Low sun rakes '
            'across the stumps and throws a long grid of shadows.'
        ),
        'stack': (
            'TOP: the few surviving tall trees, small and pale in mist at the top of '
            'the frame, with the low sun behind them. Nothing else — this band is '
            'what she is looking at.' + NL
            + 'MIDDLE: her, standing among the stumps, bow held loose at her side and '
            'turned to look back and up toward the trees. THE BOW STANDS UPRIGHT '
            'beside her, running from the middle band down into the bottom one.' + NL
            + 'BOTTOM: THE STUMPS COME TOWARD THE VIEWER, not across. Rows of cut '
            'stumps recede UP the frame from the bottom edge, smallest and mistiest '
            'near her feet, largest and sharpest at the very bottom where one is cut '
            'by the frame edge. Their shadows all reach DOWN toward the viewer and '
            'lengthen as they come. The empty ground takes more of the picture than '
            'she does.'
        ),
        'mood': (
            'Still and unsentimental. Not grief and not defiance — she is counting what is '
            'left. The empty ground should take up more of the picture than she does.'
        ),
    },

    {
        'id': 'nun',
        'name': '아녜스',
        'title': '재를 뿌리는 사제',
        'role': '보조 · 근접 · S등급',
        'motion': 'censer',
        'quote': '다치는 건 상관없어요. 혼자 다치지만 않으면.',
        'gear': '잿빛 종 향로',
        'job': '파티 전체의 공격을 올린다. 혼자서는 아무것도 못 한다.',
        'ref': 'assets/wallpaper/knightgirl.jpg',
        'asym': 'the veil is pinned back on her LEFT side only, and the censer chain is '
                'wound around her RIGHT hand.',

        'lock': (
            'A young nun, composed and very quiet. She keeps her eyes lowered by habit, not '
            'from timidity — when she does look up it is direct and it lands.\n'
            'HAIR: pale, cut short at the nape, with a few strands escaping at the temples. '
            'Mostly covered.\n'
            'HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale '
            'scapular hanging front and back over it, and a broad cinched sash at the '
            'waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that '
            'the left ear and jaw are exposed and the right stays covered. A simple pendant '
            'at the throat. The hem is scorched and grey at the bottom — she walks through '
            'the fire she starts.\n'
            'HANDS: bare, with a short chain wound twice around her RIGHT hand.\n'
            'WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a '
            'forearm long, held in both hands. Thin smoke rises from it at rest. It is not '
            'a mace and must never look like one: the vessel is small, rounded, and lidded, '
            'and the chain is slack unless she is swinging.\n'
            'SILHOUETTE (protect this above all): the long unbroken bell of the habit, the '
            'asymmetric pinned veil, and one small bright point swinging at the end of a '
            'short chain. Almost all of her is one dark shape with a single moving spark. '
            'That is how she is recognised at 54 pixels.'
        ),

        'bust': (
            'Eyes lowered, head slightly bowed, a calm closed mouth — then, because the '
            'viewer is close, one eye lifted to meet them. The veil, its pin on her LEFT '
            'side, the scapular and the throat pendant are all in frame, and the censer '
            'chain crosses the bottom of the frame in her right hand.'
        ),

        'scene': (
            'A burnt-out chapel, roof gone, open to a grey sky. Ash lies over the pews like '
            'snow and drifts in the air. She walks up the centre aisle away from the '
            'viewer, half-turned to look back over her shoulder, swinging the censer at her '
            'side so that a bright arc of light hangs in the ash behind her. Everything is '
            'grey except that arc.'
        ),
        'stack': (
            'TOP: the missing roof — open grey sky between broken rafters, with ash '
            'drifting up into it. This band is the brightest thing in the picture '
            'apart from the censer arc, and it is empty on purpose.' + NL
            + 'MIDDLE: her, walking away up the aisle, half-turned to look back over '
            'her shoulder at the viewer. Behind and beside her the swung censer '
            'leaves ONE bright arc hanging in the ash — the only white in the frame. '
            'The censer chain hangs vertically from her hand.' + NL
            + 'BOTTOM: THE AISLE COMES TOWARD THE VIEWER. It runs from her feet down '
            'and out of the bottom edge, widening as it comes, with burnt pews '
            'flanking it — nearest ones large and cut by the frame, far ones small. '
            'Ash lies over them like snow.'
        ),
        'mood': (
            'Gentle and slightly frightening at once. She is the only source of light in a '
            'building that burned, and the picture should not settle on whether she is '
            'consoling it or finishing it.'
        ),
    },
]



# ══ §F. 두 번째 기술 ══════════════════════════════════════════
#
# 넷이 기술을 하나씩 가지던 때는 `sk_1..3` 한 벌이면 됐다. 이제 둘씩 가지는데,
# 같은 칸을 쓰면 **이졸데가 도발할 때 검기와 똑같은 몸짓을 한다** — 코스트가
# 15 인 기술이 4 짜리와 화면에서 구분이 안 된다.
#
# 그래서 `sk2_1..3` 한 벌을 더 받는다. 아직 안 들어온 동안에는 첫 기술 칸으로
# 떨어지므로 (`Fighter` 의 `skFramesOf`) 게임은 그대로 돌아간다.
#
# ## 첫 기술과 **다른 축으로** 움직여야 한다
#
#   이졸데   검기는 옆으로 벤다      → 도발은 위로 젖힌다
#   비앙카   강타는 몸이 날아간다    → 화산은 제자리에서 내리찍는다
#   리안느   화살비는 무릎 꿇는다    → 광란은 선 채로 몸을 낮춘다
#   아녜스   기도는 무릎 꿇고 멈춘다 → 정화는 서서 팔을 든다
#
# 54px 에서 남는 것은 **몸의 방향**뿐이다. 무기를 어떻게 잡았는지는 안 보인다.

SECOND = {
    'knightgirl': {
        'name': '도발',
        'head': 'SUBJECT: a 3-frame animation of ONE single character ROARING — '
                'filling her lungs, shouting, and settling. She never leaves the '
                'spot and she never swings the sword.' + NL + NL + '@LOCK@',
        'frames': [
            ('sk2_1', '1 들이켬',
             'gathering breath. She has planted BOTH feet wide and driven the '
             'greatsword point-down into the ground in front of her, both hands '
             'still on the grip, arms straight. Her head is DOWN and her shoulders '
             'are drawn up and in — the smallest, most compressed pose she has. '
             'The sword is dead vertical. No effect yet.'),
            ('sk2_2', '2 포효',
             'the shout. Her head is thrown back and UP, mouth open, chest out, '
             'shoulders driven down and back — the most OPEN pose she has. Both '
             'hands stay on the planted sword, arms now braced against it as if it '
             'is holding her up. Hair and cape are blown BACKWARD and UP by the '
             'force coming out of her.' + NL
             + '  This is the TALLEST cell of the sheet. Nothing crosses the frame '
             'sideways — the whole pose goes up.'),
            ('sk2_3', '3 가라앉음',
             'the settle. Her head has come back level and she is looking straight '
             'ahead, chin slightly raised, still braced on the planted sword. Cape '
             'and hair are falling back down. She has not moved her feet once in '
             'the three cells.'),
        ],
        'rules': '- The greatsword is PLANTED POINT-DOWN and vertical in all three '
                 'cells. It never leaves the ground and it is never swung. That is '
                 'the whole difference from the §E sheet, where the blade sweeps '
                 'level across her body.' + NL
                 + '- Her body fills about 58% of the cell height, and cell 2 is '
                 'the tallest — size the sheet from it.' + NL
                 + '- She stays in the SAME spot in all three cells; her feet do '
                 'not move.',
        'intro': """**§E 와 정반대로 움직여야 합니다.** 검기는 칼이 몸 앞을 **옆으로**
지나가고, 도발은 몸이 **위아래로** 접혔다 펴집니다. 그 하나로 54px 에서
두 기술이 갈립니다.

대검은 세 칸 내내 **땅에 꽂혀 있습니다.** 한 번도 안 휘두릅니다 — 휘두르면
그 순간 검기가 되고, 코스트 15 짜리가 4 짜리처럼 보입니다.

발은 세 칸 다 같은 자리입니다. 앞으로 나가지 않습니다.

퍼지는 고리는 **안 그립니다** — 화면이 도형으로 그립니다
(`screens/home/SkillFx` 의 `roar`).""",
    },

    'bunnyaxe': {
        'name': '화산',
        'head': 'SUBJECT: a 3-frame animation of ONE single character SLAMMING an '
                'axe into the GROUND AT HER OWN FEET. She does not jump and she '
                'does not move forward.' + NL + NL + '@LOCK@',
        'frames': [
            ('sk2_1', '1 치켜듦',
             'raising the axe. Both hands have swung the axe head straight UP above '
             'her, arms extended, body arched back, one heel lifted. She is standing '
             'upright and stretched to her full height. This is the TALLEST cell.'),
            ('sk2_2', '2 내리침',
             'the strike landing. The axe head has come DOWN and buried itself in '
             'the ground DIRECTLY IN FRONT OF HER FEET — not out at arm\'s reach. '
             'She has dropped into a deep crouch behind it, knees bent hard, back '
             'rounded over the haft, both hands still on it. Hair is thrown up by '
             'the stop.' + NL
             + '  This is the LOWEST and most COMPRESSED cell of the sheet. All of '
             'her weight has gone into one spot on the ground.'),
            ('sk2_3', '3 버팀',
             'the hold. She is still crouched with the axe buried, but her head has '
             'come UP and she is looking forward, away from the axe, at what is '
             'about to happen out there. One hand has come off the haft. Nothing '
             'about her body has moved forward.'),
        ],
        'rules': '- SHE NEVER LEAVES THE GROUND. The §E sheet has her flying across '
                 'the screen; this one has her rooted to one spot. If her feet come '
                 'off the floor in any cell, the sheet has failed.' + NL
                 + '- The axe lands AT HER FEET, not out in front. What it does '
                 'happens somewhere else entirely.' + NL
                 + '- Her body fills about 55% of the cell height in cell 1 and '
                 'about 40% in cell 2 (she is crouched). Size the sheet from cell 1.',
        'intro': """**§E 와 정반대입니다.** 강타는 몸이 화면을 가로질러 날아가고, 화산은
**한 발짝도 안 움직입니다.** 세 칸 다 발이 땅에 붙어 있어야 합니다.

도끼는 **제 발 앞**에 꽂힙니다. 팔을 뻗어 저 앞을 찍으면 강타가 되고, 그러면
"제자리에서 땅을 내리친다" 는 사양이 화면에서 사라집니다.

솟는 불기둥은 **안 그립니다.** 그건 적 발밑에서 나고, 화면이 도형으로 그립니다
(`screens/home/SkillFx` 의 `erupt`).""",
    },

    'elfarcher': {
        'name': '광란',
        'head': 'SUBJECT: a 3-frame animation of ONE single character WINDING '
                'HERSELF UP — she is not shooting anything. She stands throughout.'
                + NL + NL + '@LOCK@',
        'frames': [
            ('sk2_1', '1 조임',
             'coiling. She has dropped her stance — knees bent, weight low and '
             'centred, bow held horizontally across her body in BOTH hands and '
             'pulled in tight against her chest. Shoulders hunched forward, head '
             'down. Everything is pulled IN. This is the NARROWEST cell.'),
            ('sk2_2', '2 터짐',
             'the release. Her head has snapped UP and both arms have thrown WIDE '
             'and back — bow out in the left hand, right hand open and empty, chest '
             'forward, one foot driven back. The ponytail is thrown straight out '
             'behind her. Everything is pushed OUT. This is the WIDEST cell.'),
            ('sk2_3', '3 다시 겨눔',
             'ready again. She has come back to a shooting stance — side-on, bow '
             'held upright in the left hand, right hand at the string but not '
             'drawing, weight forward on the front foot. She is lower and tighter '
             'than her §A idle: she is going to move fast now.'),
        ],
        'rules': '- SHE STANDS IN ALL THREE CELLS. The §E sheet has her kneeling; '
                 'if she kneels here the two skills read the same at 54 pixels.' + NL
                 + '- No arrow is nocked and none is fired in any cell.' + NL
                 + '- Her body fills about 55% of the cell height. Cell 2 is the '
                 'widest — size the sheet from it.',
        'intro': """**§E 는 무릎을 꿇고 이건 서 있습니다.** 화살비는 자리를 잡고 하늘로
쏘는 기술이고, 광란은 제 몸을 조였다 푸는 기술입니다.

**화살을 안 겁니다.** 세 칸 어디에도 시위에 걸린 화살이 없어야 합니다 —
걸리는 순간 화살비와 같은 기술이 됩니다.

1번은 제일 좁고 2번은 제일 넓습니다. 그 대비가 "터졌다" 를 만듭니다.

속도선과 잔상은 **안 그립니다** — 화면이 도형으로 그립니다
(`screens/home/SkillFx` 의 `haste`).""",
    },

    'nun': {
        'name': '정화',
        'head': 'SUBJECT: a 3-frame animation of ONE single character RAISING the '
                'censer and holding it up. She stands throughout and she does not '
                'kneel.' + NL + NL + '@LOCK@',
        'frames': [
            ('sk2_1', '1 거둠',
             'drawing in. She stands upright and has pulled the censer in against '
             'her chest with both hands cupped around it, head bowed over it, '
             'elbows tucked. The chain hangs straight down and is still. Compact '
             'and closed.'),
            ('sk2_2', '2 들어올림',
             'raising it. Standing, she has lifted the censer straight UP above her '
             'head at the full stretch of one arm, the other arm held out and open '
             'to the side, head tilted back to look up at it. The chain hangs '
             'vertically below the censer. Her robe and veil are lifted by the rise.'
             + NL
             + '  This is the TALLEST cell of the sheet, and her arm is the only '
             'thing above her head.'),
            ('sk2_3', '3 내림',
             'lowering. The censer has come back down to shoulder height, still in '
             'one hand, the chain swinging slightly. Her head is level and she is '
             'looking ahead, not at the censer. Her other hand is lowered and open, '
             'palm forward.'),
        ],
        'rules': '- SHE STANDS IN ALL THREE CELLS. The §E sheet has her kneeling '
                 'with her head bowed; if she kneels here the two read the same.'
                 + NL
                 + '- The censer goes UP, above her head. In §E it stays low in '
                 'front of her.' + NL
                 + '- Her body fills about 56% of the cell height. Cell 2 is the '
                 'tallest — size the sheet from it, and leave room above her '
                 'raised hand.',
        'intro': """**§E 는 무릎을 꿇고 이건 서 있습니다.** 기도는 주저앉아 멈추는 기술이고,
정화는 서서 향로를 **머리 위로** 드는 기술입니다. 그 둘이 54px 에서 갈리는
것은 "앉았나 섰나" 하나뿐입니다.

향로가 머리 위로 올라가야 합니다. §E 에서는 몸 앞 낮은 데 있습니다.

걷혀 올라가는 조각은 **안 그립니다.** 그건 걷힌 **아군 몸**에서 나고, 화면이
도형으로 그립니다 (`screens/home/SkillFx` 의 `cleanse`).""",
    },
}

def no_clip(m):
    """무기 길이에 따라 "안 잘리게" 규칙이 달라진다 — 그 부분만 갈아 끼운다.

    `%` 치환을 안 쓴다. 프롬프트에 "55% of the cell height" 같은 백분율이 널려
    있어서, 치환을 걸면 그게 전부 형식 지정자로 잡힌다.
    """
    return NO_CLIP_HEAD.replace('@RULE@', m['noclip'])


# ══ 문서 ═════════════════════════════════════════════════════
#
# f-string 을 안 쓴다. 파이썬 3.10 은 f-string **식** 안에 백슬래시를 못 넣는데,
# 프롬프트는 온통 개행 문자라 계속 걸린다. 평범한 % 치환과 이어붙이기가 안전하다.

def e2_section(m, c, blk):
    """§E-2 절. 날아갈 것이 없거나 §D-2 로 대신하는 캐릭터에는 빈 문자열이다."""
    if not blk:
        return ''
    return TPL_E2 % {
        'id': c['id'],
        'name': m['wName'],
        'intro': m['wIntro'],
        'table': table_of(m['wave']),
        'block': blk,
        'labels': labels_of(m['wave']),
    }


def d2_section(m, c, blk):
    """§D-2 절. 없는 캐릭터에는 빈 문자열이라 목차에도 안 뜬다."""
    if not blk:
        return ''
    return TPL_D2 % {
        'id': c['id'],
        'name': m['shotName'],
        'intro': m['shotIntro'],
        'table': table_of(m['shot']),
        'block': blk,
        'labels': labels_of(m['shot']),
    }


def page(c):
    m = MOTIONS[c['motion']]
    lock = c['lock']

    a_block = block(
        NOTEXT,
        'SUBJECT: a battle animation sheet of ONE single character, 8 frames.\n\n'
        'THE CHARACTER (this exact person in all 8 cells):\n' + lock + '\n\n'
        + rows_of(m['frames'], 'The 8 cells, in this exact order. Each cell shows her '
                  'WHOLE body from head to feet, at a consistent height — the ground '
                  'she stands on is implied and is NEVER drawn:'),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        MOE,
        SAME_PERSON,
        READABLE,
        no_clip(m),
        grid(4, 2),
    )

    b_block = block(
        NOTEXT,
        'SUBJECT: one bust portrait of a single character — head, shoulders and upper '
        'chest only, cropped at roughly nipple height, facing the viewer square-on, '
        'centred, filling about 85% of the image height.\n\n'
        'THE CHARACTER:\n' + c['lock'] + '\n\n'
        'THIS IMAGE: ' + c['bust'] + '\n\n'
        'THE ONLY THING THIS CROPS IS THE CHEST. Everything above the shoulders is '
        'drawn whole — the top of her head, all her hair, the circlet — with black '
        'space above it. A hairstyle sliced off by the top edge is a failed image.',
        PIXEL_STYLE,
        MOE,
        READABLE,
        'OUTPUT: a single square image, 512x512. No grid, no separator lines, no magenta.',
    )

    d_block = block(
        NOTEXT,
        m['dHead'].replace('@LOCK@', lock),
        m.get('extra'),
        rows_of(m['slash'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        MOE,
        SAME_PERSON,
        READABLE,
        'NOTHING MAY BE CUT OFF.' + NL + m['dRules'] + NL
        + '- Her feet sit at the same HEIGHT in all three cells, so the frames play back '
        'without the figure jumping. That height is an alignment, not a line to draw.' + NL
        + '- Leave at least 8px of empty black between the outermost pixel and every '
        'magenta line.',
        grid(3, 1),
    )

    # §D-2 — 평타로 날아가는 것.
    #
    # 묶음에 `shot` 이 있는 캐릭터만 받는다. 검을 휘두르는 사람은 평타가
    # 몸에서 끝나므로 필요 없고, 활잡이만 몸을 떠나는 것이 있다.
    d2_block = None if not m.get('shot') else block(
        NOTEXT,
        m['shotHead'],
        m.get('extra'),
        rows_of(m['shot'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        NO_GROUND,
        'EFFECT SHEET RULES — this is one object crossing the screen.' + NL
        + '- The 3 frames must READ AS ONE THING travelling and dying. Frame 1 is '
        'solid and bright, frame 3 is mostly gone.' + NL
        + m['shotRules'],
        grid(3, 1),
    )

    e_swing = block(
        NOTEXT,
        m['eHead'].replace('@LOCK@', lock),
        m.get('extra'),
        rows_of(m['skill'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        MOE,
        SAME_PERSON,
        READABLE,
        'NOTHING MAY BE CUT OFF.' + NL + m['eRules'] + NL
        + '- Her feet sit at the same HEIGHT in all three cells — an alignment, not a drawn '
        'line.' + NL
        + '- Leave at least 8px of empty black between the outermost pixel and every '
        'magenta line.',
        grid(3, 1),
    )

    e_wave = None if not m.get('wave') else block(
        NOTEXT,
        # 한글 이름을 프롬프트에 넣지 않는다 - 캡션으로 그려 넣으려 든다
        m['wHead'],
        m.get('extra'),
        rows_of(m['wave'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        NO_GROUND,
        'EFFECT SHEET RULES — this is a flash of motion, not a picture of an object.' + NL
        + '- The 3 frames must READ AS ONE THING travelling and dying. Frame 1 is '
        'solid and bright, frame 3 is mostly gone.' + NL
        + m['wRules'] + NL
        + '- Bold chunky shapes with hard edges and dithered fills. NOT a soft glow, '
        'NOT fine sparkles.' + NL
        + '- WHITE ON BLACK. It is composited over enemies and background, so a filled '
        'cell becomes a white blob — at its biggest it covers maybe half the cell.' + NL
        + '- It is centred in its cell and stays inside it. The game moves it across '
        'the screen; do not draw it partly off the edge.',
        grid(3, 1),
    )

    c_block = block(
        'A single monochrome greyscale anime illustration of one woman.',
        'THE CHARACTER:\n' + c['lock'],
        'THE SCENE:\n' + c['scene'],
        'MOOD: ' + c['mood'],
        ILLUST_STYLE,
        PORTRAIT,
        'VERTICAL STAGING FOR THIS SCENE — how the three bands are filled here:\n'
        + c['stack'],
        'CHARACTER CONSISTENCY — if a reference image is attached, match it exactly. '
        'Treat the written description above as a checklist against that reference, '
        'not as licence to redesign. Keep every asymmetric detail on the stated side: '
        + c['asym'],
        'OUTPUT: one finished illustration, 9:16 PORTRAIT — a tall phone wallpaper, '
        'at least 1242 x 2208. It must be taller than it is wide. '
        'No grid, no panels, no text anywhere in the image.',
    )

    two = SECOND.get(c['id'])
    f_block = block(
        NOTEXT,
        two['head'].replace('@LOCK@', lock),
        rows_of(two['frames'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        MOE,
        SAME_PERSON,
        READABLE,
        'NOTHING MAY BE CUT OFF.' + NL + two['rules'] + NL
        + '- Her feet sit at the same HEIGHT in all three cells — an alignment, '
        'not a drawn line.' + NL
        + '- Leave at least 8px of empty black between the outermost pixel and '
        'every magenta line.',
        grid(3, 1),
    ) if two else ''

    return TEMPLATE % {
        'f': (TPL_F % {
            'name': two['name'], 'id': c['id'], 'intro': two['intro'],
            'table': table_of(two['frames']), 'block': f_block,
            'labels': labels_of(two['frames']),
        }) if two else '',
        'fRow': ('\n| §F | 두 번째 기술 — %s 3프레임 | Gemini | 코스트가 비싼 '
                 '기술. 첫 기술과 몸짓이 달라야 한다 |' % two['name']) if two else '',
        'name': c['name'], 'title': c['title'], 'id': c['id'],
        'role': c['role'], 'gear': c['gear'], 'job': c['job'], 'quote': c['quote'],
        'lock': c['lock'],
        'table': table_of(m['frames']),
        'slashTable': table_of(m['slash']),
        'eSwing': e_swing, 'eWave': e_wave or '',
        'eSwingTable': table_of(m['skill']),
        'eWaveTable': table_of(m['wave']) if m.get('wave') else '',
        'skillLabels': labels_of(m['skill']),
        'waveLabels': labels_of(m['wave']) if m.get('wave') else '',
        'a': a_block, 'b': b_block, 'c': c_block, 'd': d_block,
        'slashLabels': labels_of(m['slash']),
        'labels': labels_of(m['frames']),
        'dName': m['dName'], 'eName': m['eName'], 'wName': m.get('wName', ''),
        'dIntro': m['dIntro'], 'eIntro': m['eIntro'],
        'wIntro': m.get('wIntro', ''),
        'e2': e2_section(m, c, e_wave),
        'wRow': (' + ' + m['wName'] + ' 3') if e_wave else '',
        'eTitle': (m['eName'] + ' + ' + m['wName']) if e_wave else m['eName'],
        'ref': c['ref'],
        'd2': d2_section(m, c, d2_block),
        'd2Row': ('' if not d2_block else NL
                  + '| §D-2 | ' + m['shotName']
                  + ' | Gemini | 평타로 날아가는 것 (캐릭터 없음) |'),
        # §A·§B·§C·§D·§E-1 은 늘 있고, §D-2 와 §E-2 는 캐릭터마다 다르다
        'sheets': {4: '넷', 5: '다섯', 6: '여섯', 7: '일곱'}[
            5 + (1 if d2_block else 0) + (1 if e_wave else 0)
        ],
    }


TPL_F = """
---

## §F. 두 번째 기술 — %(name)s 3프레임 (Gemini)

%(intro)s

### 왜 칸을 따로 받나

넷이 기술을 하나씩 가지던 때는 `sk_1..3` 한 벌이면 됐습니다. 이제 **둘씩**
가지는데, 같은 칸을 쓰면 코스트 15~20 짜리 기술이 4~5 짜리와 화면에서
똑같아 보입니다.

아직 안 들어온 동안에는 §E 칸으로 떨어지므로 게임은 그대로 돌아갑니다
(`screens/home/Fighter` 의 `skFramesOf`) — 도착하는 순간 저절로 바뀝니다.

%(table)s
%(block)s
```json
{ "file": "<§F 파일명>", "name": "%(id)s", "expect": [3, 1], "append": true,
  "labels": [%(labels)s] }
```

`append` 입니다 — 같은 폴더에 **덧붙입니다.** 빼면 §A 여덟 칸이 지워집니다.
"""


TPL_E2 = """
### §E-2. %(name)s 3프레임 (이펙트)

%(intro)s

%(table)s
%(block)s
```json
{ "file": "<§E-2 파일명>", "name": "%(id)s_wave", "expect": [3, 1],
  "labels": [%(labels)s] }
```
"""


TPL_D2 = """
---

## §D-2. %(name)s (Gemini)

%(intro)s

%(table)s
%(block)s
```json
{ "file": "<§D-2 파일명>", "name": "%(id)s_shot", "expect": [3, 1],
  "labels": [%(labels)s] }
```

이 한 장이 **이 캐릭터가 날리는 것 전부**입니다 — 평타로 쏘는 화살도, 스킬로
떨어지는 화살도 여기서 나옵니다 (`core/chars` 의 `projSet`).
"""


TEMPLATE = """# %(name)s — %(title)s""" + """

← [색인으로](../CHARACTER_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-char.py`.
고치려면 생성기의 `CHARS` 를 고치세요.

| | |
|---|---|
| id | `%(id)s` |
| 등급·역할 | %(role)s |
| 고유장비 | %(gear)s |
| 파티에서 하는 일 | %(job)s |

> %(quote)s

%(sheets)s 장이 필요합니다. **§A 를 먼저 뽑고**, 사람이 나오는 나머지에 그걸
레퍼런스로 첨부하세요 (캐릭터가 안 나오는 순수 이펙트 시트는 예외입니다).

| | 무엇 | 모델 | 어디에 쓰이나 |
|---|---|---|---|
| §A | 전투 8프레임 | Gemini | 홈 전투에서 실제로 넘어가는 그림 |
| §B | 흉상 | Gemini | 파티 칸 · 모집 결과 · 도감 |
| §C | 2D 일러스트 | GPT | 감상용 한 장 |
| §D | %(dName)s 3프레임 | Gemini | 평타. 칠 때 이 셋이 돈다 |%(d2Row)s
| §E | 스킬 — %(eName)s 3%(wRow)s | Gemini | 자주 나가는 첫 기술 |%(fRow)s

---

## 잠금 문장 (LOCK)

아래 세 프롬프트에 **이미 들어 있습니다.** 따로 복사할 일은 없고, 사람이 읽을
용도로 둡니다. **고치지 마세요** — 다듬는 순간 그 장만 다른 사람이 됩니다.

```
%(lock)s
```

---

## §A. 전투 8프레임 (Gemini)

게임이 실제로 넘기는 그림입니다. `guard → windup → strike → recover` 가 한 번의
스윙이고, 그게 0.8~1.5초마다 돕니다 (`src/screens/home/Fighter.tsx`).

**카메라가 정측면이 아닙니다.** 바닥이 쿼터뷰 평면이라 (`Ground.tsx`), 인물도
살짝 위에서 내려다본 각도여야 합니다. 정측면으로 그리면 인물과 바닥이 서로
다른 세계에 있는 것처럼 보입니다.

### 셀 순서

%(table)s
### 프롬프트

%(a)s
### 슬라이서 설정

```json
{ "file": "<§A 파일명>", "name": "%(id)s", "expect": [4, 2],
  "labels": [%(labels)s] }
```

받으면 `python tools/slice.py` 를 돌리세요. `Fighter` 는 이미 `set={ch.id}` 로
그리고 있고, 폴더가 없는 사람만 `fallbackSet="duel"` 로 떨어집니다 —
**`assets/sprites/%(id)s/` 가 생기는 순간 이 사람만 제 그림으로 바뀝니다.**
코드는 안 고쳐도 됩니다.

---

## §B. 흉상 (Gemini)

파티 칸·모집 결과·도감에 뜨는 얼굴입니다. 64px 정도로 작게 나옵니다.

**§A 를 레퍼런스로 첨부하세요.**

%(b)s
받으면 `assets/sprites/avatar/%(id)s.png` 로 넣으세요 (슬라이서를 안 태웁니다).

---

## §C. 2D 일러스트 (GPT)

감상용 한 장입니다. 게임 안에 들어가는 그림이 아니라, 캐릭터 창에서
"월페이퍼 보기" 로 화면을 꽉 채워 보여 주는 쪽입니다
(`screens/home/WallpaperPopup`).

### 세로입니다

처음에는 16:9 가로로 뽑았습니다. 그런데 이 게임을 보는 화면은 **세로로 긴
휴대폰**이라, 가로 그림을 화면에 담으면 위아래로 검은 띠가 절반 가까이
남습니다 — 월페이퍼가 아니라 가운데 낀 띠 하나가 됩니다.

그래서 **9:16 세로**로 다시 뽑습니다. 인물을 무릎 위까지가 아니라 발끝까지
넣고, 머리 위로 장소가 올라가는 구도입니다. 자세한 규칙은 프롬프트 안의
VERTICAL COMPOSITION 에 있습니다.

`%(ref)s` 가 기준 톤입니다 (가로판이지만 인물과 명암은 그대로 씁니다).

**§A 와 §B 를 레퍼런스로 첨부하세요.** 픽셀 그림이지만 머리 모양·갑옷·좌우
배치를 잡아 주는 데는 충분히 먹습니다.

%(c)s
받으면 `assets/wallpaper/%(id)s.jpg` 로 **덮어쓰세요** (가로판을 대신합니다).
**1-bit 로 만들면 안 됩니다.**

---

## §D. %(dName)s 3프레임 (Gemini)

%(dIntro)s

**§A 를 레퍼런스로 첨부하세요.** 같은 사람이어야 합니다.

### 셀 순서

%(slashTable)s
### 프롬프트

%(d)s
### 슬라이서 설정

```json
{ "file": "<§D 파일명>", "name": "%(id)s", "expect": [3, 1], "append": true,
  "labels": [%(slashLabels)s] }
```

⚠ `"append": true` 가 꼭 필요합니다. §A 와 **같은 폴더**(`%(id)s`)에 넣는 것이라,
없으면 §A 로 만든 여덟 장을 지우고 이 넷만 남깁니다.
%(d2)s
---

## §E. 스킬 — %(eTitle)s (Gemini)

네 번째 공격마다 평타 대신 나갑니다 (`SKILL_EVERY`).

%(eIntro)s

### §E-1. %(eName)s 3프레임 (캐릭터)

%(eSwingTable)s
**§A 를 레퍼런스로 첨부하세요.**

%(eSwing)s
```json
{ "file": "<§E-1 파일명>", "name": "%(id)s", "expect": [3, 1], "append": true,
  "labels": [%(skillLabels)s] }
```

⚠ 여기도 `"append": true` 가 필요합니다 — §A·§D 와 같은 폴더입니다.

%(e2)s"""


os.makedirs(OUT_DIR, exist_ok=True)
for _c in CHARS:
    _path = os.path.join(OUT_DIR, _c['id'] + '.md')
    open(_path, 'w', encoding='utf-8').write(page(_c))
    print('%s (%s)' % (_path, _c['name']))
print('%d명' % len(CHARS))
