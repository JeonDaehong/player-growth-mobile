# -*- coding: utf-8 -*-
"""
적 이미지 프롬프트 생성기 — `docs/foe-art/<id>.md`.

    python tools/gen-foe.py

## 캐릭터와 뭐가 다른가

셋이 다르다.

**칸이 셋뿐이다.** 아군은 여덟 프레임을 돌리지만(`Fighter`) 적은 화면에서
`idle` · `attack` · `down` 세 가지만 쓴다 (`BattleView`). 적은 한 화면에
넷이 서 있고 각자 40~52px 이라, 그 크기에서 여덟 가지 자세는 어차피 구분이
안 된다. 셋이면 "서 있다 / 때린다 / 맞았다" 가 다 읽힌다.

**얼굴이 없어도 된다.** 아군은 사람이라 흉상과 일러스트가 따로 필요하지만
적은 전투 화면에만 나온다. 그래서 시트 한 장이 곧 그 적의 전부다.

**대신 실루엣이 더 중요하다.** 넷이 겹쳐 서므로, 근접과 원거리가 한눈에
갈려야 어느 놈이 걸어오는지 알 수 있다. 같은 슬라임이라도 **모양이 달라야**
한다 — 색이나 무늬로는 1-bit 에서 구분이 안 된다.

## 스타일

`tools/artstyle.py` 를 캐릭터 생성기와 같이 쓴다. 같은 화면에 나란히 서는
그림이라 규칙이 갈리면 안 된다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    NL, NOTEXT, NO_GROUND, PIXEL_STYLE, QUARTER, block, grid, labels_of,
    rows_of, table_of,
)

OUT_DIR = 'docs/foe-art'


# ══ 적이 화면에서 쓰는 세 칸 ═════════════════════════════════
#
# `BattleView` 가 이 셋만 부른다. 넷째를 그려도 안 쓴다.

FRAME_IDS = ['idle', 'attack', 'down']


STANDS = """IT STANDS. IT NEVER LIES DOWN.

The floor is a receding quarter-view plane and the sprite is simply composited on
top of it. That works for something STANDING, because the bottom of the shape meets
the floor along one clear line. It cannot work for something LYING FLAT: a wide
shallow pool, a puddle, a slick, a thing spread out across the ground has no such
line, and the floor cannot draw itself around it. It lands on screen as a sticker
glued to the floor, and no amount of drawing inside the sprite will fix it, because
the fix would have to happen in the floor.

So nothing here is drawn as a flat spread pool, a stain, or anything poured out
across a surface, however heavy or liquid it is meant to be. Every creature has real
height. Drips hang in empty black and simply stop; they never pool or spread at the
bottom.

(A creature the description below says FLOATS is the other allowed case, and it is
the opposite of lying down, not an exception to it: it hangs clear of the ground
with empty black beneath it, so there is no contact to sell at all. What is banned
is the middle case — something spread out ON the floor.)

WEIGHT IS SHOWN BY SAGGING, NOT BY LYING. A heavy creature stands and loses the
fight with its own weight: the middle bulges out sideways past the base, the base
spreads and loads, the top slumps and overhangs to one side, and long drips hang off
the underside. That reads as heavy at 45 pixels. Flat does not — flat just reads as
small."""


SILHOUETTE = """SILHOUETTE — this is the whole job.

Four of these stand overlapping on a 138px-tall stage, each about 40-52 pixels
across. At that size there is no colour, no texture, and no face to read. The ONLY
thing that tells one enemy from another is the OUTLINE.

So the shape must be decided, not decorated:
- Pick one bold silhouette and commit to it. State it to yourself in five words.
- The three cells keep that silhouette. Only the pose inside it changes.
- Details that vanish below 50px are wasted ink: a row of twenty small teeth, thin
  antennae, surface speckle. The answer is FEWER AND BIGGER, never NONE — six teeth
  the length of a finger read fine at 45px, while a mouth with no teeth at all reads
  as a pebble.
- Do NOT rely on shading to separate parts. Two shapes that touch must differ in
  outline, not in fill."""


NOT_CUTE = """IT IS A MONSTER. IT IS NOT A MASCOT.

BANNED, all of it:
- Big round sparkly eyes with white catchlights. No cartoon shine dots.
- Any smile, any open happy mouth, any blush, any raised cheeks.
- Symmetrical, tidy, egg-smooth outlines. Nothing that looks moulded.
- Chibi proportions — a huge head on a small body, a face filling half the shape.
- Anything you would put on a sticker.
- Anything that would pass unremarked in a field guide to real animals. If a
  naturalist could label it and move on, it is not a monster yet."""


SLIME = """WHAT A SLIME IS.

"Slime" pulls every model toward a friendly blue blob with big shiny eyes, and that
is the wrong creature entirely.

But the fix is NOT to leave the face out. A featureless blob reads as scenery — as
the weakest, dullest thing on the field — and the player stops seeing it. It needs
a face. It needs the WRONG face. Draw the eyes, and draw the teeth.

IT HAS EYES, AND THEY ARE BIG.
- An eye is the first thing that survives at 40-52 pixels, so every eye is a BIG
  hard shape — a fifth to a quarter of the body width — never a dot.
- LIDLESS, with a narrow slit pupil. No lashes, no eyebrow, no white catchlight, no
  shine dot. A hard black slit in a hard white eye.
- It does not sit in a face. There is no face. It floats in the mass, off-centre,
  wherever the body happens to be thickest.
- ODD NUMBER, ODD PLACES. One large eye, or three of clearly different sizes at
  different heights looking different ways. Two matched eyes side by side is the
  mascot arrangement — if there are two, one is much bigger and much higher.

IT HAS TEETH, AND THERE ARE FEW OF THEM AND THEY ARE HUGE.
- The mouth is a TEAR in the surface, not a drawn line: uneven, wider at one end,
  and it never fully closes.
- FOUR TO SIX TEETH, no more. Each is about as long as an eye is wide, so it still
  reads when the sprite is 45 pixels tall. Twenty small teeth turn to grey mush at
  that size and are the most common failure here.
- Not a tidy row. They grow at different angles out of BOTH rims of the tear, some
  crossing each other, one or two snapped off short. They are the hardest, sharpest
  shapes on an otherwise soft creature — that contrast is the whole point.
- In the attack cell the tear opens WIDER THAN THE BODY IS DEEP and every tooth
  shows.
- Swallowed things (bone, stone, a blade) still drift inside the body, but they are
  extra. They do not replace the teeth.

AND IT SAGS.
- Two or three drips or clots hanging off the underside, and one place where the
  surface has split. A perfect curve reads as a toy.
- ASYMMETRY EVERYWHERE. If the left and right halves match, it is a mascot.

The player should read it as something that dissolves what it catches."""


TWISTED = """IT IS NOT THE ANIMAL IT RESEMBLES.

This is the most common failure for the grassland enemies. Asked for a wolf, every
model draws A WOLF — a handsome, anatomically correct grey wolf that belongs in a
nature documentary. The player then fights wildlife, not monsters, and no amount of
snarling fixes it. A snarling wolf is still a wolf.

The creature named below is only the STARTING SHAPE. Something happened to it. Push
it one clear step past the real animal, and push it in the OUTLINE, because at 40-52
pixels the outline is all that survives — a red eye or a scar is invisible.

APPLY ALL FOUR:

1. ONE THING TOO MANY, OR ONE TOO FEW. An extra jaw, a second pair of horns, a split
   tail, a missing eye where the socket has closed over with hide. Exactly one such
   change, big enough to break the profile.

2. SOMETHING HARD IS COMING THROUGH THE HIDE. Bone, stone or black thorn erupting
   from the spine, shoulder or skull — three or four hard angular shapes on the
   silhouette. Real animals have smooth backs. This is the fastest read of "wrong".

3. THE JAW OPENS PAST WHAT A SKULL ALLOWS. When it attacks, the mouth opens wider
   than the head is deep, or splits in a direction a jaw does not split. Teeth are
   uneven, too long, and not all pointing the same way.

4. IT IS STARVING AND IT IS NOT HEALING. Ribs and hip bones as hard shapes under a
   tight hide. Sunken flanks. Fur, where there is fur, hangs in a few heavy clumps —
   never soft, never drawn as texture.

BANNED: glossy healthy coats, soft fur rendering, correct symmetrical anatomy,
noble or handsome heads, anything that reads as a pet or a mount."""


BOSS = """IT IS A BOSS. IT MUST READ AS ONE BEFORE THE HEALTH BAR DOES.

This is the one enemy the player fights alone, and it has ten times the health of
the mob that was standing there a second earlier. Size alone will not carry that —
a scaled-up mob just looks like a scaled-up mob, and the fight loses its weight.

FIVE THINGS SEPARATE IT FROM THE MOB. Draw all five:

1. IT IS NOT THE SAME SHAPE. Taking the mob's silhouette and enlarging it is a
   failure. The boss has one big structural difference the mob does not have at
   all — it is named in the description above. Protect that difference above
   everything else in the drawing.

2. MORE EYES, UNEVEN. Where the mob has one, the boss has THREE OR MORE, of
   clearly different sizes, at different heights, not all looking the same way.
   The largest is enormous — a quarter to a third of the body width. Nothing says
   "this one is old" faster, and it is legible at any size.

3. THE MOUTH IS TOO BIG FOR THE BODY. Six to eight teeth, each longer and thicker
   than the mob's, and among them two or three hard things it swallowed and never
   dissolved — a blade, a rib, a broken spearhead — standing in the rim as if they
   had grown there. Uneven, several snapped.

4. IT HAS BEEN FOUGHT BEFORE AND IT KEPT GOING. Two or three long healed SPLITS
   across the mass, closed over and holding, and a hard scarred crust across part
   of the surface. The mob is smooth and new; this one is not.

5. IT IS HEAVY. It loads onto its underside, spread and settled, and the top
   overhangs it. Three or four gobbets hang or float torn loose around it, so the
   shape it occupies is bigger than the body. A boss standing upright and neat
   reads as light.

BANNED for bosses: anything that reads as a COSTUME — a crown perched neatly on
the head, a cape, jewellery, armour that looks buckled on rather than grown.
It did not dress up. It got old and it got fed.

(Something it SWALLOWED and never dissolved is not a costume. A broken crown sunk
half into the mass at a wrong angle is food that stayed, and that is allowed —
encouraged, even. The test is whether it looks worn or looks eaten.)"""


ALIVE = """IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party."""


# ══ 적 ═══════════════════════════════════════════════════════
#
# 여기에 한 항목을 더하고 다시 돌리면 그 적 문서가 나온다.

FOES: list = [
    {
        'id': 'sl_melee',
        'family': 'slime',
        'name': '슬라임',
        'role': '근접 · 1스테이지 주력',
        'job': '걸어와서 몸으로 부딪힌다. 넷 중 둘이 이놈이다.',
        'set': 'sl_melee',

        'lock': (
            'A slime — a low mound of something half-digested that moves on its own.'
            + NL
            + 'BODY: a squat, WIDER THAN IT IS TALL mound with a sagging underside. The '
            'outline is uneven: it bulges further on one side than the other, and two '
            'or three heavy clots hang off the lower edge, mid-drip. No limbs, no neck, '
            'no head — the whole thing is one mass.' + NL
            + 'EYE: ONE. A single large eye with a narrow vertical slit pupil, no lid '
            'and no lashes, set off-centre and low in the mass. It does not blink and '
            'it does not look friendly.' + NL
            + 'MOUTH: a ragged horizontal TEAR across the front of the mound, wider at '
            'one end, and it never closes. FIVE TEETH stand in it — each as long as '
            'the eye is wide, growing out of both rims at different angles, two of '
            'them crossing and one snapped off short. They are the only hard shapes '
            'on the whole creature.' + NL
            + 'INSIDE: one or two dark lumps suspended in the mass, half dissolved. '
            'They are the only solid shapes in it.' + NL
            + 'SILHOUETTE (protect this above all): a low lopsided mound with clots '
            'hanging under it. It is the FLATTEST and LOWEST thing on the field. That '
            'squatness is what separates it from the spitter, which stands tall.'
        ),

        'frames': [
            ('idle', '대기',
             'at rest, slumped wide under its own weight, the mass leaning slightly '
             'forward toward the right. Clots drip from the underside. The eye is open '
             'and fixed on something ahead; the tear-mouth hangs slightly apart.' + NL +
             '  This is the frame the player sees most of the time. It must read as '
             'waiting rather than resting — patient, not peaceful.'),
            ('attack', '공격',
             'lunging. The mass has surged forward and to the right, stretched into a '
             'flattened wedge with the trailing end pulled thin. The leading edge has '
             'burst open — the tear-mouth is gaping, the shards inside it flung wide.'
             + NL +
             '  The eye is stretched with the body, the slit pupil narrowed to a line. '
             'Two or three straight speed lines trail behind the thin end.'),
            ('down', '피격',
             'struck. The mass has been driven DOWN and WIDE, the widest and flattest '
             'cell, the top caved in. Four or five gobbets have been torn loose and '
             'hang in the air behind it.' + NL +
             '  The eye has rolled back so the slit is nearly gone, and the tear-mouth '
             'is wrenched crooked. It is not wincing — it is coming apart.'),
        ],

        'rules': '- The lunging cell (2) is the WIDEST and the squashed cell (3) is the '
                 'SHORTEST. Size the whole sheet from cell 2.' + NL
                 + '- All three cells rest on the same height. The lunge lifts only '
                 'slightly — it is a heavy thing, not a jumper.' + NL
                 + '- It fills about 45% of the cell height. It is SHORT; leave the '
                 'space above it empty.',

        'intro': """1스테이지의 주력입니다. 한 화면에 둘이 서고, 걸어와서 몸으로 부딪힙니다.

**넓적하고 낮아야 합니다.** 같은 스테이지의 뱉는 슬라임이 세로로 길기 때문에,
둘의 차이가 오직 그 비율에서 나옵니다. 40px 로 줄이면 색도 무늬도 안 남고
윤곽만 남습니다.""",
    },

    {
        'id': 'sl_ranged',
        'family': 'slime',
        'name': '뱉는 슬라임',
        'role': '원거리 · 1스테이지',
        'job': '뒤에 서서 산을 뱉는다. 안 걸어오는 대신 무르고 아프다.',
        'set': 'sl_ranged',

        'lock': (
            'A slime grown into a spout — the same rotten material as the common one, '
            'pulled upright by whatever is inside it.' + NL
            + 'BODY: TALL AND NARROW, a standing column that swells at the base and '
            'narrows toward an open vent at the top. Nearly twice as tall as it is '
            'wide. The column is not straight — it leans and bulges, and the surface '
            'is streaked where acid has run down it and eaten in.' + NL
            + 'VENT: the top opening is a ragged hole, its rim uneven and slightly '
            'flared, with residue crusted around it. It is the mouth and it never '
            'closes. FOUR LONG TEETH ring the rim, curving INWARD over the opening '
            'like a trap — thin, uneven, one broken. Everything it throws has to pass '
            'between them.' + NL
            + 'EYE: ONE. A single large eye with a slit pupil, set high on the column '
            'just below the vent and turned to the side, so it seems to be sighting '
            'rather than watching.' + NL
            + 'INSIDE: one dark mass low in the belly — the next shot, being made.'
            + NL
            + 'SILHOUETTE (protect this above all): a tall leaning column with a wide '
            'base and a torn-open top. It is the TALLEST and THINNEST thing on the '
            'field, and that is the whole difference from the common slime.'
        ),

        'frames': [
            ('idle', '대기',
             'standing at rest, the column upright and still, the vent angled up and '
             'slightly to the right. The dark shot sits low in the belly. A thread of '
             'residue drips from the vent rim.' + NL +
             '  It does not lean forward like the common slime — it holds its ground, '
             'and the single eye tracks sideways. That stillness is how the player '
             'learns it will not walk over.'),
            ('attack', '공격',
             'the spit. The base has compressed and the column has kinked back, '
             'whipping the vent forward and to the right. The rim is flared wide.' + NL +
             '  A gobbet of acid is LEAVING the vent — an uneven blob with a ragged '
             'trailing tail, clear of the body with black between them, two short '
             'speed lines behind it. It stops well inside the cell.' + NL +
             '  The eye is wide, the slit pupil blown open.'),
            ('down', '피격',
             'struck. The column has buckled — the upper third folds over to the left '
             'while the base stays planted, so the whole thing reads as a broken stalk. '
             'The vent points down and away, spilling what it was holding.' + NL +
             '  The eye is squeezed to a crease and the surface has split along the '
             'bend.'),
        ],

        'rules': '- Cell 1 is the TALLEST and cell 3 is the most bent. Size the whole '
                 'sheet from cell 1 so the upright column fits with room above it.' + NL
                 + '- The flying blob in cell 2 must END INSIDE the cell. It is a short '
                 'lob, not a beam across the frame.' + NL
                 + '- It fills about 65% of the cell height — noticeably taller than the '
                 'common slime, which fills 45%.',

        'shotName': '산 덩어리',
        'shotHead': 'SUBJECT: 3 cells. ONE blob of acid in flight, animating over 3 '
                    'frames, left to right. There is NO creature, NO ground — only the '
                    'blob.' + NL + NL
                    + 'It was spat from the vent of a standing slime and is crossing the '
                    'field toward its target. It travels to the RIGHT; the game mirrors '
                    'it in code, because this one flies at the player from the right '
                    'side of the screen.' + NL + NL
                    + 'This sheet carries every shot the spitter fires, so it has to read '
                    'as a thrown blob at 26 pixels wide, alone, with nothing around it.',
        'shot': [
            ('shot_1', '1 날아감',
             'the blob at full speed. An uneven lump — fatter at the leading (right) end '
             'and drawn out into a ragged tail at the back, like a drop of syrup thrown '
             'hard. NOT a circle and NOT symmetrical.' + NL +
             '  Two short straight speed lines trail behind it, thinner than the blob and '
             'clearly separate. Two or three small droplets have shaken loose behind the '
             'tail. Solid and bright.'),
            ('shot_2', '2 늘어남',
             'the same blob a moment later, stretched further along its travel direction '
             'so the tail is longer and thinner and has begun to break away from the '
             'head. The leading end is still fat and solid.'),
            ('shot_3', '3 흩어짐',
             'the blob breaking up. The head has thinned and split into two or three '
             'separate specks strung along the path, the tail gone. Most of the cell is '
             'empty.'),
        ],
        'shotRules': '- It flies point-first: **WIDER THAN IT IS TALL**, with the heavy '
                     'end leading. A round ball reads as a bubble, not a thrown thing.'
                     + NL
                     + '- No outline flourishes. At 26 pixels this is a lump and a tail; '
                     'anything finer than that is gone.' + NL
                     + '- Keep it clearly ACIDIC — ragged edge, a couple of drips coming '
                     'off it. It should not look like a rock or a fireball.' + NL
                     + '- It is centred in its cell and stays inside it. The game moves '
                     'it across the screen; do not draw it partly off the edge.',
        'shotIntro': """**뒷줄이 실제로 날리는 것입니다.** 모션만 있고 아무것도 안 날아가면
뒤에서 혼자 꿈틀거리는 것으로 보입니다.

시트가 들어오기 전까지는 `fx/smoke` 로 버팁니다 — `assets/sprites/sl_ranged_shot/`
가 생기는 순간 코드를 안 고치고 바뀝니다.

게임은 **1번 칸만 씁니다.** 26px 로 줄여도 홀로 "날아오는 덩어리" 로 읽혀야
하므로, 앞쪽을 굵게 뒤쪽을 가늘게 그리세요.""",

        'intro': """뒤에 서서 던지는 놈입니다. 안 걸어오는 대신 체력이 낮고 더 아프게 때립니다
(`core/autoBattle` 의 `FOE_MATES`).

**세로로 길어야 합니다.** 주력 슬라임이 넓적하고 낮으므로, 둘을 가르는 것은
오직 그 비율입니다. 한 화면에 넷이 겹쳐 서는데 색도 무늬도 안 남습니다 —
서 있는 기둥과 퍼진 덩어리, 그 차이만 남습니다.""",
    },

    {
        'id': 'sl_boss',
        'family': 'slime',
        'name': '빅 슬라임',
        'role': '우두머리 · 1스테이지',
        'job': '2분이 지나면 혼자 나온다. 체력이 열 배, 공격이 세 배다.',
        'set': 'sl_boss',

        'lock': (
            'A huge slime — the same rot as the common one, grown far past the size it '
            'should be, and now holding a shape on purpose.' + NL
            + 'BODY: a massive mass, TALLER THAN IT IS WIDE, with a heavy sagging skirt '
            'where it meets the ground and a broad top. The outline is lumpy and '
            'lopsided, blistered along one side, with long clots hanging under the '
            'skirt. The surface tension is losing.' + NL
            + 'CROWN OF DROPS: three or four fat gobbets hover just above the top, held '
            'up by whatever holds the rest together. They stay in every cell and they '
            'are the fastest way to know this is the big one.' + NL
            + 'EYES: FOUR, and no two are the same. The main one is enormous — a '
            'third of the width of the body, set HIGH and off-centre, slit pupil, no '
            'lid; at the game\'s size it is most of what the player sees. Three '
            'smaller ones are scattered lower and to the side at different heights, '
            'looking different ways. The mob has one eye. This has four, and that is '
            'read before anything else.' + NL
            + 'MOUTH: a long ragged tear across the lower half, hanging open and far '
            'too big for the body. SEVEN OR EIGHT TEETH, thicker and longer than the '
            'common slime\'s, uneven and several snapped. Among them two things it '
            'swallowed and never dissolved — a broken blade and a rib — standing in '
            'the rim as if they had grown there.' + NL
            + 'INSIDE: several dark lumps suspended through the mass — swallowed, half '
            'gone. Read as remains, not as organs.' + NL
            + 'SILHOUETTE (protect this above all): a tall lumpy mass with a sagging '
            'skirt, a crown of floating gobbets, and one huge eye. Big, top-heavy, slow.'
        ),

        'frames': [
            ('idle', '대기',
             'settled and swelling. The mass sits heavy, the skirt spread wide, the top '
             'leaning slightly forward. The crown of gobbets hangs above it and the '
             'swallowed lumps drift low. The huge eye is open and steady; the tear-mouth '
             'hangs slack.' + NL +
             '  It should look like it is waiting rather than resting. The player sees '
             'this frame while deciding whether the party can take it.'),
            ('attack', '공격',
             'slamming down. The top has risen and pitched forward and the skirt is '
             'thrown outward on both sides, so the whole body is a wide inverted wedge. '
             'The swallowed lumps are flung forward inside the mass.' + NL +
             '  The crown has scattered wide. The eye is stretched with the body and '
             'the tear-mouth is hauled open, shards raised. This is the widest cell.'),
            ('down', '피격',
             'struck. The top has been driven down into the skirt so the whole body '
             'squashes to a broad low heap — much shorter than cell 1. Gobbets are torn '
             'loose all around the upper edge.' + NL +
             '  The huge eye has rolled back to a crescent and the tear-mouth is '
             'wrenched sideways. It is coming apart, not wincing.'),
        ],

        'rules': '- Cell 2 is the widest and cell 3 is the shortest. Size the whole sheet '
                 'from cell 2.' + NL
                 + '- It fills about 80% of the cell height in cell 1. It is drawn LARGER '
                 'in game than the small slimes (78px against 52px), so it can carry a '
                 'little more detail than they can — but not much.' + NL
                 + '- The crown of drops is part of the silhouette. It must stay inside '
                 'the cell in all three frames, including the scattered one.',

        'intro': """2분이 지나 잡몹을 다 잡으면 혼자 걸어 나옵니다. 체력이 열 배, 공격이 세 배라
여기가 1스테이지의 벽입니다 (`core/autoBattle` 의 `foeOf`).

화면에서 **78px** 로 그려집니다 — 잡몹(52px)보다 한참 큽니다. 그래서 잡몹보다
조금 더 자세히 그려도 되지만, 여전히 픽셀 그림입니다.

**한눈에 "저건 다른 놈" 이어야 합니다.** 크기만으로는 부족합니다 — 그냥 큰
슬라임은 가까이 온 슬라임과 구분이 안 됩니다. 떠 있는 물방울 왕관과 몸속의
검은 덩어리가 그 역할을 합니다.""",
    },
]


TPL_SHOT = """
---

## 투사체 — %(name)s (Gemini)

%(intro)s

%(table)s
%(block)s
```json
{ "file": "<투사체 파일명>", "name": "%(set)s_shot", "expect": [3, 1],
  "labels": [%(labels)s] }
```
"""



# ══ 초원 (2~10 스테이지) ═════════════════════════════════════
#
# 한 지역을 아홉 판으로 나눠 쓴다. 판마다 두세 종이 섞이고 (`STAGES`),
# 우두머리는 판마다 다르다.
#
# **여덟 종을 나눠 쓰는 이유**는 판마다 새 종을 그리면 아홉 판에 스무 종이
# 넘어가서다. 대신 조합이 바뀐다 — 5판의 늑대+엉겅퀴와 6판의 늑대+들개+
# 엉겅퀴+까마귀는 화면에서 전혀 다른 판으로 보인다.
#
# **실루엣이 겹치지 않게** 여덟을 골랐다. 40~52px 에서 남는 것은 윤곽뿐이라,
# 네발짐승 셋을 넣으면 그 셋이 구분이 안 된다. 그래서 크기(작은 들쥐 / 큰
# 오우거), 다리 수(넷 / 둘 / 없음), 나는가(말벌·까마귀), 식물인가(엉겅퀴)로
# 갈랐다.

def foe(id_, name, role, job, lock, frames, rules, intro, **extra):
    d = {'id': id_, 'name': name, 'role': role, 'job': job, 'set': id_,
         'lock': lock, 'frames': frames, 'rules': rules, 'intro': intro}
    d.update(extra)
    return d


def mob3(id_, name, role, job, lock, idle, attack, down, rules, intro, **extra):
    return foe(id_, name, role, job, lock,
               [('idle', '대기', idle), ('attack', '공격', attack), ('down', '피격', down)],
               rules, intro, **extra)


# ══ 초원의 슬라임들 ═════════════════════════════
#
# 2~10 스테이지가 전부 슬라임이다. 한 종을 아홉 판 돌리면 배경만 바뀌고 싸우는
# 상대는 그대로라, 슬라임 안에서 여덟 갈래로 나눴다 (`core/autoBattle` 의 SLIME).
#
# **가르는 것은 색이 아니라 덩어리의 모양이다.** 40~52px 흑백 도트에서 "초록
# 슬라임 / 파란 슬라임" 은 존재하지 않는다. 그래서 두 축으로 갈랐다 —
#
#   높이   납작하다(풀·진흙) / 보통(돌·산성) / 높다(가시·뼈) / 둘이다(쌍둥이)
#   윤곽   매끈하다 / 각진 것이 박혔다 / 뾰족한 것이 뻗었다 / 갈라졌다
#
# 그리고 셋은 뜨거나 던진다(포자·가시·산성) — 붙어 싸우는 놈만 나오면 뒷줄이
# 늘 비고 파티를 어떻게 세우든 같아진다.

def slimeboss(id_, name, role, job, lock, idle, attack, down, fill, intro):
    """우두머리 한 마리. 잡몹과 프레임 구성은 같다.

    **크기만 다르면 안 된다.** 예전에는 그게 전부였고, 그래서 커진 잡몹으로
    나왔다. `page()` 가 우두머리에게 `BOSS` 블록을 따로 붙여서 눈 개수·입
    크기·아문 상처까지 잡몹과 갈라 놓는다 — `lock` 의 눈 줄도 거기에 맞춰
    적어야 한다. 한쪽만 고치면 더 구체적인 `lock` 이 이긴다.
    """
    return mob3(
        id_, name, role, job, lock, idle, attack, down,
        '- It fills about %d%% of the cell height — it is the biggest thing on the '
        'field and must read as such next to a 45%% mob.' % fill + NL
        + '- Cell 2 is the widest. Size the sheet from it.',
        intro,
    )


FOES += [
    mob3(
        'sg_grass', '풀슬라임', '근접 · 초원 2~3', '걸어와서 몸으로 부딪힌다. 초원의 기본형이다.',
        'A slime that has been living in grass long enough to have grass in it.' + NL
        + 'BODY: LOW AND WIDE — a broad flat mound, about twice as wide as it is tall, '
        'the lowest and simplest silhouette of the eight. Everything else is measured '
        'against this one.' + NL
        + 'GRASS: five or six BLADES OF GRASS stand up out of the top of the mound, '
        'stiff and separate, at different heights and leaning different ways. They are '
        'the only thing breaking the smooth curve, and they are how the player tells it '
        'from the cave slime.' + NL
        + 'A few loose blades and one small stone are suspended INSIDE the body, halfway '
        'down — swallowed and not yet gone.' + NL
        + 'FACE: ONE big eye low at the front, and a TEAR across the front below it '
        'with FIVE TEETH standing in it at broken angles. Blades of grass are caught '
        'between two of them, still uncut. This is the plainest face of the eight — '
        'the others are measured against it.' + NL
        + 'SURFACE: smooth apart from the grass and the tear. Two or three drips '
        'hanging off the underside.',
        'settled and low, leaning slightly forward, the grass blades upright. It has not '
        'moved yet.',
        'the lunge. The whole mound stretched forward and thin, the trailing half pulled '
        'out into a tail behind it, grass blades swept back flat. Two drips flung off '
        'the back.',
        'struck. The mound flattened and spread sideways, a split opening along the top, '
        'three or four blobs thrown off. Grass blades scattered.',
        '- It fills about 40% of the cell height. It is LOW — leave the space above it '
        'empty rather than scaling it up.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """2~3 스테이지의 기본형입니다. 초원 슬라임 여덟의 **기준**이 되는 모양이라,
이것부터 그리고 나머지를 여기에 견주세요.

**제일 낮고 제일 매끈합니다.** 동굴 슬라임과 갈리는 것은 위로 선 풀잎 몇 장뿐
입니다 — 그것 말고는 같은 덩어리여야 합니다. 초원에 들어왔다는 표시입니다.""",
    ),

    mob3(
        'sg_mud', '진흙 슬라임', '근접 · 초원 3~5', '느리게 다가와 짓누른다. 무겁다.',
        'A slime so loaded with wet earth that it barely holds its shape.' + NL
        + 'BODY: HEAVY, AND STANDING. It is about as tall as it is wide — TALLER than '
        'the grass slime, not flatter. It has not spread out on the ground; it is '
        'standing up and LOSING to its own weight, which is a different shape and the '
        'only one that reads.' + NL
        + 'THE SAG IS THE READ: the middle bulges out sideways further than the base, '
        'the top slumps and OVERHANGS on one side, and the whole outline reads as a '
        'wet sack held upright rather than a dome. Nothing about it is a smooth '
        'curve.' + NL
        + 'DRIPPING: SIX OR SEVEN long drips hang off the underside and the sides, '
        'each a different length, the longest reaching well down past the base. The '
        'grass slime has two; this one is dripping everywhere. The drips hang in EMPTY '
        'BLACK and simply stop — they never pool, spread or puddle at the bottom.'
        + NL
        + 'GRIT: hard flecks and three or four small stones scattered through the body, '
        'drawn as small solid shapes, densest near the bottom where they have sunk.' + NL
        + 'FACE: TWO EYES, and they have SLID — one large and high, the other small '
        'and much lower and further back, as if the sag pulled it down. The mouth is a '
        'wide sagging tear along the lowest part of the front, half full of mud, with '
        'FOUR THICK BLUNT TEETH showing above the muck. They are worn down, not '
        'sharp — this one crushes.' + NL
        + 'No grass. Whatever it swallowed has already broken down.',
        'standing slumped and still, the middle bulging, the top overhanging one '
        'side, drips hanging long and straight. It looks heavy even standing still — '
        'and it IS standing.',
        'the drop. It has reared up into a tall lump and is coming DOWN — the top half '
        'thick, the bottom spreading out as it lands. Drips flung outward and up. Three '
        'impact lines under it.',
        'struck. Burst wide and flat, half its mass thrown off to one side in three big '
        'blobs. What is left is a puddle with grit showing.',
        '- It fills about 42% of the cell height, a little more than the grass slime.'
        + NL + '- Cell 2 is the tallest. Size the sheet from it.',
        """3~5 스테이지. 풀슬라임보다 무겁고 느립니다.

**흘러내리는 것으로 가릅니다.** 풀슬라임은 방울이 두어 개고 이놈은 예닐곱
개가 길게 늘어져 있습니다. 그리고 윗면이 봉깃한 게 아니라 가운데가 꺼져 있어서,
40px 에서도 "무너진 자루" 로 읽힙니다.""",
    ),

    mob3(
        'sg_stone', '돌 슬라임', '근접 · 초원 6~7, 10', '단단하다. 잘 안 죽는다.',
        'A slime that has swallowed so much rock it now wears it.' + NL
        + 'BODY: a compact mound, TALLER AND NARROWER than the grass and mud slimes — '
        'about as wide as it is tall. It does not sag anywhere.' + NL
        + 'THE ROCKS: five or six ANGULAR STONE PLATES are embedded in the surface, '
        'half in and half out, on the back and shoulders. They are HARD STRAIGHT-EDGED '
        'shapes on an otherwise curved outline — that contrast is the entire '
        'silhouette. One large plate on the top, the rest smaller and irregular.' + NL
        + 'The largest plate is CRACKED across.' + NL
        + 'FACE: ONE eye, DEEP-SET in a gap between two plates and shadowed by the '
        'big top plate, so it reads as something looking out of a crack. The mouth is '
        'a narrow tear low at the front holding SIX TEETH THAT ARE THE SAME STONE AS '
        'THE PLATES — straight-edged, angular, chipped, three of them broken off '
        'flat. Everything hard on this creature is the same material.' + NL
        + 'SURFACE: tight and smooth between the plates. Only one or two short drips — '
        'this one is not runny.',
        'settled low behind its plates, the big top plate tilted forward like a shield. '
        'Braced, not resting.',
        'the ram. Driven forward with the plated side leading, body compressed short and '
        'thick behind it, two straight speed lines. The plates do not deform.',
        'struck. Rocked back, two plates knocked loose and spinning away, a crack '
        'opening across the body under where they were.',
        '- It fills about 45% of the cell height.' + NL
        + '- The stone plates must stay the SAME SIZE and SHAPE in all three cells. Only '
        'their position changes. They are solid; they do not stretch with the body.',
        """6~7 · 10 스테이지. 단단해서 오래 버팁니다.

**굽은 윤곽에 각진 것이 박혀 있는 게 전부입니다.** 다른 일곱은 전부 곡선이라,
직선 대여섯 개만으로 이놈이 갈립니다.

돌은 몸이 늘어나도 **같이 안 늘어납니다.** 세 칸에서 크기와 모양이 같아야 하고,
그래야 "박힌 것" 으로 보입니다.""",
    ),

    mob3(
        'sg_bone', '뼈 슬라임', '근접 · 초원 7~10', '삼킨 것이 안에서 비친다.',
        'A slime that has been eating for a long time and digests nothing.' + NL
        + 'BODY: a TALL narrow column, clearly the tallest of the ground slimes — '
        'about half again as tall as it is wide. It stands up rather than spreading.'
        + NL
        + 'THE BONES: this is its read. A RIBCAGE and a long-jawed SKULL are suspended '
        'inside the body, upright, showing clearly through the surface. The skull sits '
        'near the top, tilted; the ribs below it, four or five curved bars. They are '
        'drawn as clean hard shapes INSIDE the outline, not on it.' + NL
        + 'One rib and one leg bone POKE OUT through the surface, breaking the outline '
        'at two places.' + NL
        + 'FACE: THE SKULL IS THE MOUTH. Its long jaw hangs open inside the body and '
        'the skull\'s OWN TEETH — five or six long ones, uneven, gapped — are the only '
        'teeth here; they show straight through the thin surface. Above the skull, ONE '
        'EYE of the slime itself floats in the taut membrane, lidless and unrelated to '
        'the sockets, which stay empty. Two sets of eyes, one dead and one not.' + NL
        + 'SURFACE: thin and taut. The bones show because there is not much slime left.',
        'standing tall and still, the skull upright near the top. The stillness reads as '
        'something looking at you through a window.',
        'the swallow. It has surged forward and UP, the column stretched taller, and the '
        'skull has swung to the front of the body with the jaw open. The ribs trail '
        'behind inside.',
        'struck. The column buckled in the middle, the skull knocked sideways and half '
        'out through the surface, two ribs breaking free and falling.',
        '- It fills about 55% of the cell height — the tallest of the eight mobs.' + NL
        + '- The skull and ribs keep the SAME shape in all three cells; only their '
        'position inside the body changes.',
        """7~10 스테이지. 초원 안쪽에서 나옵니다.

**제일 높습니다.** 여덟 중 유일하게 넓적하지 않고 기둥처럼 섭니다.

안에 든 두개골과 갈비뼈가 **윤곽 안쪽**에 그려져야 합니다. 밖에 그리면 뼈를
들고 다니는 놈이 되고, 안에 있어야 "삼켰는데 안 녹는다" 가 됩니다.""",
    ),

    mob3(
        'sg_twin', '쌍둥이 슬라임', '근접 · 초원 6, 8~10', '둘로 나뉘어 다닌다. 하나를 터뜨려도 하나가 남는다.',
        'One slime that never finished splitting in two.' + NL
        + 'BODY: TWO ROUNDED LOBES of different sizes, side by side, joined by a thick '
        'neck of slime in the middle. The bigger lobe is about half again the smaller. '
        'The outline reads as a FIGURE-EIGHT lying down — nothing else on the field '
        'has two masses.' + NL
        + 'The joining neck is thin enough that you expect it to break, and it '
        'stretches and thins when the creature moves.' + NL
        + 'EACH LOBE HAS ITS OWN EYE, and they do not look the same way. The big lobe '
        'has a large one, the small lobe a smaller one, and they are never aligned.'
        + NL
        + 'ONLY THE BIG LOBE HAS A MOUTH: a tear across its front with FIVE LONG '
        'TEETH at broken angles. The small lobe has none — just the eye. It has not '
        'finished becoming a creature yet, and that difference is the story of the '
        'pair.' + NL
        + 'SURFACE: smooth. Two or three drips, mostly from the neck where it sags.',
        'both lobes settled, the neck slack and sagging between them, the two eyes '
        'pointing different ways.',
        'the whip. The big lobe has driven forward and the small one is being DRAGGED '
        'behind, so the neck is stretched long and thin between them. Both eyes forward '
        'for once.',
        'struck. The neck has SNAPPED — the two lobes are flying apart with a broken '
        'strand trailing from each. This is the only cell where they are separate.',
        '- It fills about 42% of the cell height and is the WIDEST of the eight.' + NL
        + '- The two lobes must stay clearly different sizes in every cell. Equal lobes '
        'read as a mistake.',
        """6 · 8~10 스테이지.

**여덟 중 유일하게 덩어리가 둘입니다.** 40px 에서 이건 다른 무엇보다 빨리
읽히는 차이입니다 — 하나냐 둘이냐는 세지 않아도 보입니다.

두 덩이 크기가 **달라야** 합니다. 같으면 실수로 보입니다. 그리고 눈이 하나씩,
서로 다른 데를 봅니다.""",
    ),

    mob3(
        'sg_spore', '포자 슬라임', '원거리 · 초원 2~4', '떠서 홀씨를 뿌린다. 무르고 아프다.',
        'A slime gone light and dry, drifting instead of crawling.' + NL
        + 'BODY: a rounded mass with a RAGGED, FRAYED TOP — the upper third has broken '
        'up into a soft irregular fringe, like a puffball that has begun to open. The '
        'bottom is still smooth and heavy.' + NL
        + 'IT FLOATS. In all three cells there is EMPTY BLACK BENEATH IT — it hangs at '
        'about the height of a standing person. Nothing else in this set floats except '
        'the thorn slime, and that one is spiky where this one is soft.' + NL
        + 'TRAILING: three or four loose spores drift away below and behind it, small '
        'round dots at different sizes.' + NL
        + 'FACE: one eye, set low in the solid half, half hidden by the fringe above. '
        'Below it a narrow VERTICAL slit — not a horizontal tear like the walking '
        'slimes — with FOUR THIN NEEDLE TEETH along its edges, held slightly apart. '
        'The spores come out between them.',
        'hanging still, the fringe spread wide and open, spores drifting slowly below. '
        'It holds its height — that stillness says it will not walk over.',
        'the burst. The body has CLENCHED — pulled in narrow and tall — and a cloud of '
        'spores is leaving the top in a wide spray forward and up. Six or seven dots '
        'clear of the body with short trails.',
        'struck. Torn open along one side, the fringe collapsed and hanging, half the '
        'spores scattering. It has dropped lower but is still off the ground.',
        '- It never touches the ground. In all three cells leave empty black beneath it.'
        + NL + '- It fills about 38% of the cell height and sits in the UPPER half of '
        'the cell.',
        """2~4 스테이지의 원거리입니다. 안 걸어오는 대신 체력이 낮고 더 아프게 때립니다.

**떠 있어야 합니다.** 세 칸 어디에서도 바닥에 안 닿고, 칸의 위쪽 절반에
있습니다. 그게 "쟤는 안 붙는다" 를 말하는 유일한 방법입니다.

가시 슬라임도 뜹니다. 둘은 **부드러운 술 / 뾰족한 가시**로 갈립니다.""",
        shotName='홀씨',
        shotHead='SUBJECT: 3 cells. ONE puff of spores in flight, animating over 3 '
                 'frames, left to right.',
        shot=[('shot_1', '날아감', 'a tight clump of six or seven round spores '
               'travelling together, densest at the front, with three short trails '
               'behind. It is WIDER THAN IT IS TALL.'),
              ('shot_2', '퍼짐', 'the same clump beginning to open — the spores '
               'spread apart, the front ones still solid, the back ones thinning.'),
              ('shot_3', '흩어짐', 'mostly gone. Three or four separate dots '
               'drifting apart with nothing holding them together.')],
        shotRules='- It flies front-first: **WIDER THAN IT IS TALL**, with the dense end '
                  'leading and the loose end trailing.' + NL
                  + '- Draw the spores as SOLID ROUND DOTS of two or three sizes. At '
                  '20px a soft cloud is a smudge; separate dots still read as a cloud.',
        shotIntro="""**뒷줄이 실제로 날리는 것입니다.** 모션만 있고 아무것도 안 날아가면
뒤에서 혼자 꿈틀거리는 것으로 보입니다.""",
    ),

    mob3(
        'sg_thorn', '가시 슬라임', '원거리 · 초원 4~6, 9~10', '가시를 쏜다. 무르고 아프다.',
        'A slime that has grown thorns from the inside out.' + NL
        + 'BODY: a compact mass BRISTLING WITH SPIKES — eight or nine hard straight '
        'thorns pushing out of it in all directions, each a different length, the '
        'longest about half the body width. The outline is spiky all the way round; '
        'nothing else in this set has straight lines coming OUT of it.' + NL
        + 'IT FLOATS, low — closer to the ground than the spore slime but still clear '
        'of it, with empty black beneath.' + NL
        + 'The thorns are DARK and solid where the body is open, so they read even when '
        'they overlap the mass.' + NL
        + 'FACE: one eye, deep in the middle, almost buried between thorns. The mouth '
        'is a small tear beneath it and ITS TEETH ARE THORNS — four of them, the same '
        'hard straight spikes as the body, but these curve INWARD over the opening. '
        'The teeth and the weapon are the same thing.',
        'hovering low, thorns out evenly in all directions, still. It looks like it '
        'would hurt to touch.',
        'the volley. Three thorns have LEFT the body and are in the air ahead of it, '
        'point-first, with speed lines. The body is left with visible GAPS where they '
        'came from, pulled in tight and lopsided.',
        'struck. Knocked back and spinning, four thorns snapped off and tumbling, the '
        'body split down one side.',
        '- It floats LOW — closer to the ground than the spore slime, but still with '
        'empty black beneath it in all three cells.' + NL
        + '- It fills about 40% of the cell height including the thorns.',
        """4~6 · 9~10 스테이지의 원거리입니다.

**뻗어 나온 직선**이 이놈의 전부입니다. 포자 슬라임도 뜨지만 그쪽은 술처럼
부드럽고, 이쪽은 사방으로 뾰족합니다.

쏘고 나면 몸에 **구멍이 남아야** 합니다 — 가시가 어디서 나왔는지가 보여야
"몸에서 뽑아 던졌다" 가 됩니다.""",
        shotName='가시',
        shotHead='SUBJECT: 3 cells. ONE thorn in flight, animating over 3 frames, '
                 'left to right.',
        shot=[('shot_1', '날아감', 'a single hard thorn travelling point-first, '
               'solid and sharp, with two straight speed lines behind it. WIDER THAN IT '
               'IS TALL.'),
              ('shot_2', '박히는 중', 'the same thorn, the point now blunted by '
               'impact and two short chips flying off it.'),
              ('shot_3', '부러짐', 'broken into two pieces drifting apart, both '
               'thinning.')],
        shotRules='- It flies point-first: **WIDER THAN IT IS TALL**, the sharp end '
                  'leading.' + NL
                  + '- It is a straight hard object. No curve, no glow, no trail of dots.',
        shotIntro="""**뒷줄이 실제로 날리는 것입니다.** 몸에서 뽑아 던진 그 가시입니다.""",
    ),

    mob3(
        'sg_acid', '산성 슬라임', '원거리 · 초원 7~10', '산을 뱉는다. 무르고 아프다.',
        'A slime that is dissolving everything it touches, including itself.' + NL
        + 'BODY: a mass with a WIDE OPEN MOUTH taking up its whole front — not a drawn '
        'line but a TEAR in the surface, uneven, wider on one side, held open. It sits '
        'on the ground; it does not float.' + NL
        + 'EATEN THROUGH: two or three HOLES go right through the body, so you can see '
        'black through them. They are what names this one — nothing else here has '
        'holes.' + NL
        + 'The rim of the mouth and the edges of the holes are RAGGED, as if still being '
        'eaten away.' + NL
        + 'DRIPS: four or five, longer than the other ground slimes\'.' + NL
        + 'EYE: one, set high and to the side, well away from the mouth.' + NL
        + 'TEETH: FIVE, standing in the ragged rim of the mouth, and they are being '
        'EATEN BY ITS OWN ACID — tapered to needles, pitted, two of them dissolved '
        'down to stumps. Uneven lengths all round. Nothing else in the set has teeth '
        'that are falling apart.',
        'settled, mouth held half open, the holes clearly visible. Something is running '
        'out of the mouth already.',
        'the spit. The body has reared and thrown its front forward, the mouth wide, and '
        'a blob of acid is LEAVING it, clear of the body, with two speed lines.',
        'struck. Split from the top down into the mouth, so the tear and the split have '
        'joined into one gash. Two blobs thrown off, one hole torn wide open.',
        '- It sits ON the ground in all three cells, unlike the spore and thorn slimes.'
        + NL + '- It fills about 44% of the cell height.' + NL
        + '- The holes must show BLACK THROUGH THEM, not shading. A hole that is only '
        'shaded reads as a spot.',
        """7~10 스테이지의 원거리입니다. 붙어 싸우는 놈들 사이에 섞여 뒤에 섭니다.

**몸에 구멍이 뚫려 있습니다.** 여기 여덟 중 유일합니다. 구멍은 **검게 비쳐야**
하고, 어둡게 칠하기만 하면 그냥 무늬가 됩니다.

포자·가시와 달리 **바닥에 붙어 있습니다** — 원거리 셋이 다 뜨면 뒷줄이 전부
공중에 걸린 것처럼 보입니다.""",
        shotName='산 덩어리',
        shotHead='SUBJECT: 3 cells. ONE blob of acid in flight, animating over 3 '
                 'frames, left to right.',
        shot=[('shot_1', '날아감', 'a heavy blob travelling nose-first, the front '
               'end solid and rounded, the back drawn out into a short tail with two '
               'drips falling off it. WIDER THAN IT IS TALL.'),
              ('shot_2', '흩어짐', 'the same blob breaking up — the front still '
               'solid, the back half separated into three smaller drops.'),
              ('shot_3', '사라짐', 'mostly gone. Four small drops spreading apart, '
               'thin.')],
        shotRules='- It flies nose-first: **WIDER THAN IT IS TALL**, with the heavy end '
                  'leading and the tail behind.' + NL
                  + '- It must read as LIQUID — rounded front, drips falling off it.',
        shotIntro="""**뒷줄이 실제로 날리는 것입니다.** 모션만 있고 아무것도 안 날아가면
뒤에서 혼자 꿈틀거리는 것으로 보입니다.""",
    ),
]

# ── 우두머리 아홉 ──
#
# 잡몹을 그냥 키운 것으로 보이면 안 된다 (1스테이지에서 겪었다). 저마다
# **잡몹에 없는 요소**를 하나씩 가진다 — 덮어썼다 · 퍼졌다 · 덩굴이 달렸다 ·
# 지붕을 였다 · 셋이다 · 그물이다 · 두개골이 셋이다 · 왕관을 썼다.

FOES += [
    slimeboss(
        'sb_grass', '풀무더기 슬라임', '우두머리 · 2스테이지', '풀을 통째로 뒤집어썼다.',
        'A grass slime that kept eating grass until the grass won.' + NL
        + 'BODY: a big low mound, but you can barely see it — it is BURIED UNDER A '
        'THICKET. Twenty or more grass blades and three or four whole tufts, roots and '
        'all, stand out of its back in a dense mass half as tall again as the body.'
        + NL
        + 'THE MOUND ITSELF is smooth and wide beneath all that, and only the front '
        'quarter of it is clear of grass.' + NL
        + 'FACE: THREE EYES of different sizes. One large in the bare front quarter, '
        'and two smaller ones higher up, PEERING OUT FROM BETWEEN THE GRASS ROOTS at '
        'different heights — you find them a moment after the first. Below the big '
        'eye, a wide tear with SEVEN TEETH at broken angles, whole tufts of grass '
        'still jammed between them, and one flint blade standing among them like a '
        'tooth it grew.' + NL
        + 'SCARS: two long healed splits across the bare front, closed over and '
        'holding.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: the mob has five or six separate blades. This '
        'has a whole thicket, tall enough to change the silhouette from a dome into a '
        'shaggy hill.',
        'settled under its thicket, the grass standing up straight, the big eye showing '
        'at the front and the two small ones between the roots. Mouth held slightly '
        'apart.',
        'the roll. It has thrown itself forward and the whole thicket is sweeping down '
        'and forward with it, blades flattened ahead of the body. Torn grass in the air '
        'behind.',
        'struck. Flattened wide, half the thicket torn out and scattering, roots and '
        'clods flying. The bare mound shows through where the grass has gone.',
        62,
        """2스테이지 우두머리.

잡몹 풀슬라임은 풀잎이 대여섯 장이고, 이놈은 **덤불을 통째로 이고 있습니다.**
그래서 실루엣이 돔이 아니라 **덥수룩한 언덕**이 됩니다 — 키운 게 아니라 다른
모양이어야 합니다.""",
    ),

    slimeboss(
        'sb_mud', '수렁 슬라임', '우두머리 · 3스테이지', '넓게 퍼져 발목을 잡는다.',
        'A bog that stood up.' + NL
        + 'BODY: THE WIDEST OF THE NINE, and it still STANDS. About half again as wide '
        'as it is tall — broad and squat and enormously heavy, but a standing mass '
        'with a top and a bottom, never a pool spread out on the floor.' + NL
        + 'IT IS LOSING TO ITS OWN WEIGHT, and that is the read: the base is spread '
        'and loaded flat, the middle bulges out past it on both sides, and the top '
        'SLUMPS OVER to one side and overhangs. The edge is uneven and lobed all the '
        'way round, like something that keeps almost falling and catching itself.'
        + NL
        + 'RISING FROM IT: three thick ARMS OF MUD reach UP out of the shoulders and '
        'the top, high above the mass, like things trying to climb out of it. They are '
        'the tallest shapes on the creature and they lean different ways. They are '
        'what stops a wide heavy boss from reading as small.' + NL
        + 'SUNK INSIDE: stones, a broken branch and one long bone hang half-submerged '
        'in the mass at different depths, drawn as hard shapes.' + NL
        + 'FOUR EYES, scattered right across the width of the mass at different '
        'sizes and depths, some half sunk in the mud — not a face, just four places '
        'where it is watching, and you cannot take them all in at once. Below them a '
        'long sagging tear runs across the front with SEVEN THICK BLUNT TEETH rising '
        'out of the muck, worn flat, one snapped. A rusted spearhead stands among '
        'them.' + NL
        + 'CRUST: part of the surface has hardened into a scarred grey skin, cracked '
        'across. It has been here a long time.' + NL
        + 'DRIPS: heavy ones all round the underside, hanging in empty black and '
        'simply stopping. It never puddles.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: the mob is one slumped sack. This one is THREE '
        'TIMES the bulk, wide enough to fill its cell side to side, and it has arms '
        'reaching up out of it.',
        'standing broad and still, slumped over to one side, the three arms raised '
        'high and motionless, the sunk things showing through. It reads as something '
        'that has been standing there a long time.',
        'the grab. All three arms have swung FORWARD and are reaching out ahead of the '
        'mass, stretched thin and long, fingers of mud splayed. The whole body has '
        'leaned after them and the far side has been hauled up off its base.',
        'struck. The arms collapsed back into the mass, a wide crater punched into the '
        'top, the body buckled sideways, mud thrown out in a ring of blobs.',
        70,
        """3스테이지 우두머리. **아홉 중 제일 넓습니다.**

다만 **눕히면 안 됩니다.** 예전 설명은 "서지 않는다, 눕는다 — 제일 납작한
놈" 이었는데, 화면 바닥이 뒤로 물러나는 쿼터뷰 평면이라 납작하게 퍼진
그림은 접지가 안 되고 바닥에 붙인 스티커처럼 보입니다. 무게는 **낮이가
아니라 늘어짐**으로 말해야 합니다.

그래서 **넓고 육중하되 서 있습니다.** 가로가 세로의 한 배 반이고, 밑이
퍼져 눌리고 가운데가 옆으로 불거지고 윗부분이 한쪽으로 흘러내려 덮칩니다.
위로 뻗은 **진흙 팔 셋**이 키를 만들어 줘서, 넓적한데도 작아 보이지
않습니다.""",
    ),

    slimeboss(
        'sb_spore', '홀씨 슬라임', '우두머리 · 4스테이지', '떠서 홀씨를 흩뿌린다.',
        'A spore slime swollen to bursting and still rising.' + NL
        + 'BODY: a huge ROUND floating mass, and unlike the mob it is round ALL THE WAY '
        '— the fringe has spread from the top around the whole circumference, so the '
        'outline is a shaggy circle. It is the only round boss.' + NL
        + 'IT FLOATS HIGH, well clear of the ground, with a wide space of empty black '
        'beneath it.' + NL
        + 'HANGING BENEATH: five or six long tendrils trail down from the underside at '
        'different lengths, swaying. They double its height and they are how it reads '
        'as floating rather than sitting.' + NL
        + 'INSIDE: a dense knot of packed spores shows through the middle, darker than '
        'the rest.' + NL
        + 'FACE: FOUR EYES — one large near the top, three much smaller ones spread '
        'through the fringe below it at different heights, all looking different ways. '
        'Beneath them a VERTICAL slit runs down the front, held apart, with SIX LONG '
        'NEEDLE TEETH along its edges. The spores pour out between them.' + NL
        + 'SCARS: two healed splits across the solid lower half.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: tendrils, and a fringe all the way round.',
        'hanging high and still, fringe spread evenly, tendrils hanging straight down. '
        'A few spores drifting off.',
        'the burst. The body has SPLIT OPEN across the front and spores are pouring out '
        'in a wide fan forward and down — twenty or more dots at three sizes. The '
        'tendrils are flung back.',
        'struck. Torn open down one side, half deflated and sagging, tendrils tangled, '
        'spores escaping in a stream from the wound.',
        70,
        """4스테이지 우두머리. 원거리라 뒤에 섭니다.

**유일하게 둥근 우두머리**이고, 밑으로 늘어진 덩굴이 키를 두 배로 만듭니다.
잡몹 포자 슬라임은 윗부분만 술이 났는데 이놈은 **빙 둘러** 났습니다.""",
    ),

    slimeboss(
        'sb_thorn', '가시덩이 슬라임', '우두머리 · 5스테이지', '가시를 사방으로 쏜다.',
        'A thorn slime that became mostly thorn.' + NL
        + 'BODY: a mass you can hardly see for the SPIKES. Twenty or more hard thorns '
        'radiate out of it, the longest as long as the body is wide, so the silhouette '
        'is a STAR or a burr — the sharpest outline in the whole set.' + NL
        + 'The thorns are of three clear lengths, not all the same, and they point in '
        'every direction including down.' + NL
        + 'IT FLOATS LOW, just clear of the ground, with the lowest thorns nearly '
        'touching it.' + NL
        + 'AT THE CORE: a small dense body, much smaller than you expect, dark and '
        'tight, with THREE EYES crammed into it — one large and two small, at '
        'different depths in the gaps between spines, so they appear as you look. '
        'Below them a small mouth held wide, far wider than the visible body, with '
        'SEVEN INWARD-CURVING THORNS for teeth. The teeth and the weapon are the same '
        'thing, and here there are more of both.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: the mob has eight or nine thorns and a visible '
        'body. This is a ball of spines with a body somewhere inside.',
        'hanging low and still, thorns out evenly in a full circle. Nothing about it '
        'suggests a soft creature.',
        'the volley. It has PULLED IN tight and eight thorns have left it at once, '
        'flying out in a fan ahead, each with speed lines. The body is left with a '
        'ragged half-empty side.',
        'struck. Knocked spinning, a dozen thorns snapped and tumbling, the small core '
        'body split open and exposed for the first time.',
        68,
        """5스테이지 우두머리. **가시로 뒤덮인 별 모양**입니다.

잡몹 가시 슬라임과 갈리는 지점은 비율입니다 — 잡몹은 몸이 보이고 가시가 좀
난 것인데, 이놈은 **가시 뭉치 안에 작은 몸이 들어 있습니다.**""",
    ),

    slimeboss(
        'sb_stone', '바위 슬라임', '우두머리 · 6스테이지', '바위를 걸치고 밀어붙인다.',
        'A stone slime that has armoured itself completely.' + NL
        + 'BODY: a tall heavy mound almost entirely PLATED — twelve or more angular '
        'stone slabs cover the back, top and sides, overlapping like a shell. The '
        'outline is mostly STRAIGHT EDGES AND CORNERS, which no other boss has.' + NL
        + 'ONE HUGE SLAB sits on top like a roof, wider than the body, tilted forward. '
        'It is the single biggest hard shape in the whole set.' + NL
        + 'ONLY THE FRONT UNDERSIDE is bare slime, and that is where the FACE is, low '
        'and half in shadow under the roof slab: THREE EYES of different sizes in a '
        'row that is not straight, and beneath them a wide tear holding EIGHT TEETH OF '
        'THE SAME STONE AS THE SLABS — straight-edged, chipped, three broken off flat, '
        'and a snapped iron blade wedged among them.' + NL
        + 'SCARS: one of the slabs is split clean through and has been GROWN BACK '
        'TOGETHER by the slime beneath, a hard ridge along the join.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: the mob has five or six plates on a curved body. '
        'This one is armoured all over and has a slab for a roof.',
        'settled under its slabs, the roof slab tilted forward, the three eyes and the '
        'stone teeth showing beneath it. Braced and immovable.',
        'the charge. Driven forward with the roof slab leading like a ram, the body '
        'compressed short behind it, dust and two chips thrown up. The slabs do not '
        'deform.',
        'struck. Rocked back, the roof slab cracked in two and sliding off, four smaller '
        'plates knocked loose, bare slime showing through the gaps.',
        72,
        """6스테이지 우두머리. **직선과 모서리로 된 유일한 우두머리**입니다.

머리 위의 큰 판 하나가 이놈을 만듭니다 — 몸보다 넓고 앞으로 기울어 있어서,
40px 에서도 "지붕을 인 바위" 로 읽힙니다.""",
    ),

    slimeboss(
        'sb_twin', '가르는 슬라임', '우두머리 · 7스테이지', '셋으로 나뉘어 에워싼다.',
        'A twin slime that went one further.' + NL
        + 'BODY: THREE lobes, not two — a large one in the middle and two smaller ones '
        'flanking it at different heights, joined by two stretched necks. The outline '
        'reads as a chain of three masses, and it is the widest boss.' + NL
        + 'THE THREE ARE ALL DIFFERENT SIZES and sit at different heights, so the shape '
        'is lopsided and never symmetrical.' + NL
        + 'FIVE EYES, unevenly shared out: the largest lobe has THREE of different '
        'sizes, the middle lobe one, the smallest lobe one — all looking different '
        'ways. The biggest lobe also has the only mouth, a tear far too wide for it, '
        'with SEVEN LONG TEETH at broken angles. The other two lobes are still just '
        'eyes, and that is what makes the big one the dangerous end.' + NL
        + 'THE NECKS are thinner than the twin mob has and clearly under strain, with a '
        'few drips falling from the lowest point of each.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: a third lobe, and necks stretched to their limit.',
        'the three lobes settled at their own heights, necks sagging, the five eyes '
        'pointing every way, the big lobe holding its mouth apart.',
        'the sweep. The outer two lobes have swung FORWARD past the middle one, so the '
        'three now form a curve reaching around ahead — the necks stretched to '
        'threads. It is closing in from both sides.',
        'struck. Both necks snapped, the three lobes flying apart with broken strands '
        'trailing. This is the only cell where they are separate.',
        58,
        """7스테이지 우두머리.

쌍둥이 잡몹이 둘이면 이놈은 **셋**입니다. 셋이 크기도 높이도 다 달라서 늘
기울어져 있고, 공격 칸에서는 바깥 둘이 앞으로 돌아 나가 **감싸는 모양**이
됩니다 — 하나로는 못 만드는 그림입니다.""",
    ),

    slimeboss(
        'sb_acid', '녹이는 슬라임', '우두머리 · 8스테이지', '넓게 산을 뱉는다.',
        'An acid slime that is more hole than body.' + NL
        + 'BODY: a big mass EATEN THROUGH IN SIX OR SEVEN PLACES — large holes of '
        'different sizes go right through it, showing black. In places only thin '
        'strands of slime connect one part to another, so the silhouette is a LATTICE. '
        'Nothing else in the set is see-through.' + NL
        + 'THE MOUTH is enormous, a tear across the entire front, held wide, its rim '
        'ragged and still dissolving.' + NL
        + 'DRIPS: several, and longer than any other creature has — but draw NO '
        'ground beneath them.' + NL
        + 'FOUR EYES in a ragged line along the top edge, above the mouth, at '
        'different sizes — the largest at one end, the smallest almost lost in the '
        'lattice. The TEETH in the huge rim number EIGHT, all being eaten by its own '
        'acid: tapered to needles, pitted, three dissolved down to stumps, no two the '
        'same length. Among them a sword blade, half gone.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: the mob has two or three small holes. This one '
        'is a lattice you can see through.',
        'settled, mouth half open, the holes showing black. Something running from the '
        'mouth already.',
        'the spray. Reared up and thrown forward, the mouth wide, and a WIDE FAN of '
        'acid leaving it — five or six blobs at different sizes, all clear of the '
        'body, spreading as they go.',
        'struck. Two of the connecting strands have torn, so a whole section is coming '
        'away. The mouth and the top split have joined into one gash.',
        66,
        """8스테이지 우두머리. 원거리입니다.

**뚫려서 비쳐 보이는 유일한 놈**입니다. 구멍이 커서 곳곳이 가는 줄기로만
이어져 있고, 그래서 실루엣이 덩어리가 아니라 **그물**이 됩니다.

피격 칸에서는 그 줄기 중 둘이 끊어져 한 덩이가 떨어져 나갑니다.""",
    ),

    slimeboss(
        'sb_bone', '뼈무덤 슬라임', '우두머리 · 9스테이지', '삼킨 것들을 전부 안고 다닌다.',
        'A bone slime that ate a whole graveyard and is still digesting it.' + NL
        + 'IT IS A SLIME FIRST. Read this before anything else: the thing on screen is '
        'a big soft heavy mass of slime. It is NOT a pile of bones, and it is NOT a '
        'skeleton wearing slime. The outline is a slime outline — swollen, sagging, '
        'lopsided, wet — and it stays that way the whole time. Everything hard is '
        'INSIDE it and outnumbered by it.' + NL
        + 'BODY: a TALL, THICK, HEAVY mass, taller than it is wide, the tallest thing '
        'in the set. Swollen and overfull, bulging out at the middle and sagging into '
        'a broad loaded base. Where the mob is thin and taut, this one is GORGED.' + NL
        + 'INSIDE, AND THERE IS ONLY ONE: a SINGLE ENORMOUS SKULL, half the height of '
        'the body, sunk DEEP and low in the mass and tilted back. It is HALF '
        'DISSOLVED — the far side of it has gone soft and blurred into the slime, the '
        'crown of it pitted and thinned, so it reads as something being eaten rather '
        'than something being carried.' + NL
        + 'That is the whole bone content. NO second skull, no ribcages, no scatter of '
        'long bones. The rest of the graveyard is already gone, and that is the point — '
        'this creature is what happens AFTER the bones. Below the big skull, two or '
        'three faint pale smudges are all that is left of them, too far gone to name.'
        + NL
        + 'BREAKING OUT: exactly TWO bones pierce the surface — one long bone low on '
        'one side, one rib high on the other, both at odd angles. Two, not six. The '
        'outline has to stay soft and round everywhere else or it stops being a slime.'
        + NL
        + 'EYES: THREE OF ITS OWN, and they are the biggest thing on the creature '
        'after the skull — one enormous high on the swell, two smaller lower down at '
        'different heights, all lidless with slit pupils, none of them lined up. They '
        'are what says this is alive and not a grave. The skull\'s two empty SOCKETS '
        'sit below them, dark and looking nowhere, so the player reads three live eyes '
        'and two dead holes at once.' + NL
        + 'MOUTH: the skull\'s LONG JAW, hanging open low in the body and showing '
        'through the surface. SEVEN TEETH in it, uneven, gapped, three broken — but '
        'they are FURRED WITH SLIME and half melted at the tips, because the mouth is '
        'being digested along with the rest of it.' + NL
        + 'DRIPS: six or more, long and heavy, hanging off the underside and the '
        'bulge. This one is the wettest of the nine.' + NL
        + 'WHAT THE MOB DOES NOT HAVE: the mob is THIN — barely any slime, so its '
        'bones show hard and clear. This is the opposite creature. It is GORGED, its '
        'one skull is huge and half melted, and the slime is winning.',
        'standing tall and swollen, sagging under its own weight, drips hanging long. '
        'The great skull sits still and low inside it, jaw slack. The three eyes are '
        'open and fixed on you.',
        'the fall. The whole mass has toppled FORWARD to slam down, stretching long as '
        'it goes. The skull has swung heavily to the leading edge with the jaw hauled '
        'wide, and the slime is dragged out behind it in a thick trailing tail. Drips '
        'flung off the back.',
        'struck. The mass buckled and split across the middle, and the split runs '
        'THROUGH the skull — it has cracked and is sliding apart inside the body, not '
        'flying out of it. Four or five heavy blobs thrown off. The eyes rolled back.',
        76,
        """9스테이지 우두머리. **제일 높습니다.**

**뼈를 많이 그리면 실패입니다.** 딱딱한 것이 여럿이면 45px 에서 슬라임이
아니라 뼈무더기로 보입니다. 안에 든 뼈는 **커다란 두개골 하나뿐**이고,
밖으로 삐져나온 것도 **둘뿐**입니다. 나머지 윤곽은 전부 물렁하고 둥글어야
합니다.

잡몹 뼈 슬라임과는 **반대 방향**입니다. 잡몹은 슬라임이 모자라서 뼈가 하나
하나 또렷하게 비칩니다. 이놈은 슬라임이 넘쳐서 **삼킨 것이 녹아 가라앉는
중**입니다 — 두개골 반쪽이 이미 흐려져 있고, 이빨도 슬라임에 덮여 끝이
뭉개졌습니다. "무덤을 통째로 먹었다" 는 뼈를 열 개 그려서가 아니라 **뼈가
거의 안 남았다는 것**으로 말합니다.

눈은 **제 눈 셋**입니다. 두개골의 빈 눈구멍은 그 아래에 따로 있어서, 산 눈
셋과 죽은 구멍 둘이 한 번에 읽힙니다.""",
    ),

    slimeboss(
        'sb_king', '슬라임 군주', '우두머리 · 10스테이지', '초원의 슬라임을 전부 삼켰다.',
        'The thing every other slime on this plain was a piece of.' + NL
        + 'BODY: an enormous mound, the biggest thing in the set, filling most of its '
        'cell. Broad at the base and rising to a rounded peak.' + NL
        + 'A CROWN. Sunk into the top of the mass, half swallowed and tilted, is a '
        'BROKEN IRON CROWN — the only man-made object in the entire set, and the '
        'fastest way to say this one is different from the other eight.' + NL
        + 'INSIDE IT, clearly visible through the surface, are the OTHER SLIMES: a '
        'ribcage, two stone plates, a knot of thorns and a clump of grass, each '
        'recognisable, suspended at different depths. It has eaten the whole chapter.'
        + NL
        + 'ONE ENORMOUS EYE, lidless, set high beneath the crown — a third of the '
        'body width, larger relative to the body than anything else in the set has. '
        'AND FOUR MORE, small and scattered lower in the mass: THEY ARE THE EYES OF '
        'THE SLIMES IT SWALLOWED, still open, still looking, each beside the remains '
        'it belongs to. That is the whole idea of this creature in one detail.' + NL
        + 'THE MOUTH is a tear across the base of the mound, wider than any mob is '
        'tall, with NINE TEETH at broken angles — and among them the stone teeth of '
        'the rock slime and two thorns of the thorn slime, standing in the rim as if '
        'they had grown there.' + NL
        + 'SCARS: three long healed splits up the flanks, closed over and ridged. '
        'Everything on this plain has already tried.' + NL
        + 'DRIPS: eight or more, long and heavy, all round the base.',
        'settled and vast, the crown tilted on top, the swallowed things showing, the '
        'great eye open. It has not moved and that is what makes it frightening.',
        'the collapse. The whole mass has surged forward and is coming down over you, '
        'the front edge stretched out ahead and thinning, the crown sliding forward on '
        'top. Four heavy blobs flung ahead.',
        'struck. A huge crater torn out of one side, the crown knocked askew and half '
        'out, two of the swallowed things spilling loose. It is still standing.',
        88,
        """10스테이지 우두머리. 초원의 끝입니다.

**왕관이 이 놈의 전부입니다.** 열일곱 마리 중 유일하게 사람이 만든 물건을
가지고 있어서, 그것 하나로 다른 모든 슬라임과 갈립니다.

그리고 몸 안에 **다른 슬라임들이 들어 있습니다** — 갈비뼈 · 돌판 · 가시뭉치 ·
풀무더기. 지금까지 싸운 것들이 다 보여야 합니다.""",
    ),
]


# ══ 배경 ═════════════════════════════════════════════════════

# 슬라임은 슬라임 규칙을, 우두머리는 우두머리 규칙을 받는다.
#
# 항목마다 손으로 적게 두면 꼭 빠진다 — 실제로 초원의 열일곱이 전부 빠져서
# `TWISTED`(짐승) 규칙을 받고 있었다. 슬라임한테 "굶주린 짐승의 갈비뼈" 와
# "털은 뭉쳐서 늘어진다" 를 시켰으니 눈도 이빨도 없는 맨 덩어리가 나온 게
# 당연하다. id 앞자리가 이미 종류를 말하고 있으니 그걸 쓴다.
for _f in FOES:
    if _f['id'][:3] in ('sl_', 'sg_', 'sb_'):
        _f['family'] = 'slime'
    if _f['id'][:3] == 'sb_' or _f['id'] == 'sl_boss':
        _f['boss'] = True


BACKGROUNDS = [
    {
        'id': '01', 'name': '슬라임초원', 'stages': '1~5',
        'scene':
            'What you see looking ACROSS an open plain to its far edge, from a long '
            'way off. A dead flat horizon runs the WHOLE WIDTH of the strip along the '
            'very bottom edge.' + NL
            + 'UPPER HALF — sky. Three or four long flat cloud banks stacked at '
            'different heights, spread right across the width, each one a long '
            'shallow shape in coarse dither. This half must not be empty.' + NL
            + 'LOWER HALF — distance. Above the horizon line, small and far: four or '
            'five lone trees bent by wind, spaced far apart across the width, and two '
            'or three low patches of scrub between them. They stand no taller than a '
            'quarter of the strip.' + NL
            + 'No grass, no field, no path. The plain between you and the horizon is '
            'not in this image — the game draws it.',
    },
    {
        'id': '02', 'name': '슬라임 초원 깊숙한 곳', 'stages': '6~10',
        'scene':
            'The same plain, further in, where a settlement has been swallowed. What '
            'you see looking ACROSS to it from a long way off.' + NL
            + 'UPPER HALF — a heavier sky. Four or five cloud banks, lower and denser '
            'than the open plain, pressing down across the full width. Darker overall.'
            + NL
            + 'LOWER HALF — the horizon is BROKEN by ruins instead of clean, and that '
            'is what separates this one from the first. Along the bottom edge, in '
            'silhouette and spread across the whole width: two leaning doorframes, a '
            'run of broken low wall, a collapsed roof beam, and a crooked fence line. '
            'They stand no taller than a third of the strip.' + NL
            + 'Draw no ground between you and the ruins, and no rubble in front of '
            'them. The ruins sit ON the bottom edge and that is where the image ends.',
    },
]

BG_STYLE = """BACKGROUND RULES — this is scenery, not a subject.

DRAW NO GROUND. THIS IS THE WHOLE POINT.

The game is NOT a 2D side-scroller. It draws its own floor as a receding
quarter-view plane, and the fighters stand ON that plane. Your image supplies ONLY
WHAT LIES BEYOND IT — the far side of the horizon and the sky above it.

So: put the HORIZON LINE ON THE VERY BOTTOM EDGE of the image — the last few rows
of pixels, not higher. Everything you draw sits ABOVE that line and is FAR AWAY.
Do not leave empty space below it; the game's floor starts exactly where your image
ends, and any gap you leave shows up as a black band between the sky and the ground.

FILL THE WHOLE FRAME, TOP TO BOTTOM. The game stretches this image to a short wide
band and shows ALL of it — nothing is cropped, so nothing may be wasted either. If
the top third is empty black, the player sees an empty third. Put CLOUDS across the
upper half so that band is doing something.

- NO ground plane, NO field in front, NO path, NO foreground grass, NO rocks or
  rubble at the bottom, NO shadow cast toward the viewer. If a shape in your image
  reads as "the ground the characters are standing on", the image is wrong.
- The bottom edge is where the far land meets the sky. Keep the lowest tenth to a
  quiet band — the bases of distant things. Nothing tall starts down there.
- The UPPER HALF is sky and it must not be empty. Two to four long flat cloud banks,
  spread across the full width, drawn in coarse dither. They are the only thing in
  the top half, so if they are missing the top half is missing.
- EVERYTHING IS DISTANT. Think of it as seen across two kilometres of open country.
  Distant things are small, low in the frame, and drawn in fine dither; there is no
  near layer at all.
- NO CREATURES, NO PEOPLE, NO ITEMS. Only far land and sky.
- It is drawn BEHIND the fighters and the game fades it to 20% opacity. So it must
  read at a glance from big shapes alone; anything fine disappears twice over.
- Depth comes from DITHER DENSITY, not from line weight: the far land is fine
  dither, the sky is mostly empty black.
- Nothing may draw the eye. If a shape in the background is more interesting than a
  monster standing in front of it, it is wrong."""


TEMPLATE = """# %(name)s

← [색인으로](../FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.
고치려면 생성기의 `FOES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/%(set)s/` |
| 등장 | %(role)s |
| 하는 일 | %(job)s |

%(intro)s

---

## 시트 한 장 (Gemini)

화면이 쓰는 칸은 **셋뿐**입니다 (`src/screens/home/BattleView.tsx`) —
평소에는 `idle`, 때릴 때 `attack`, 맞았을 때 `down`.

### 셀 순서

%(table)s
### 프롬프트

%(prompt)s
### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "%(set)s", "expect": [3, 1],
  "labels": [%(labels)s] }
```

받으면 `python tools/slice.py` 를 돌리세요. `assets/sprites/%(set)s/` 가
생기는 순간 화면이 그걸 씁니다 — 없는 동안은 `creature/slime` 으로 떨어지므로
코드는 안 고쳐도 됩니다.
%(shot)s
---

## 다시 뽑을 때

**바닥이 그려져 나왔을 때**

```
The ground must not be drawn. Remove the floor line, the shadow, the puddle and any
rubble. Everything below the creature is pure black. Keep the poses exactly as they
are — only delete the ground.
```

**세 칸이 서로 다른 생물처럼 나왔을 때**

```
All three cells are the SAME creature — same outline, same size, same eyes, same
markings. Only the pose changes between them. Redraw them as one animation, not as
three separate drawings.
```

**너무 작게 그려 나왔을 때**

```
The creature is drawn too small inside its cell. Redraw it filling about %(fill)s of
the cell height, centred, with the empty space distributed around it rather than
below it.
```
"""


def shot_section(f):
    """투사체 절. 날리는 적에게만 붙는다."""
    if not f.get('shot'):
        return ''
    blk = block(
        NOTEXT,
        f['shotHead'],
        rows_of(f['shot'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        NO_GROUND,
        'EFFECT SHEET RULES — this is one thing crossing the screen.' + NL
        + '- The 3 frames must READ AS ONE THING travelling and dying. Frame 1 is '
        'solid and bright, frame 3 is mostly gone.' + NL
        + f['shotRules'],
        grid(3, 1),
    )
    return TPL_SHOT % {
        'set': f['set'], 'name': f['shotName'], 'intro': f['shotIntro'],
        'table': table_of(f['shot']), 'block': blk, 'labels': labels_of(f['shot']),
    }


# ══ 마물 표식 ═════════════════════════════════════════════════
#
# `TWISTED` 가 "실제 동물에서 한 걸음 밀어라" 라고 말하고, 여기가 **어느 쪽으로**
# 미는지를 정한다. 규칙만 주고 맡기면 여덟 마리가 다 같은 방향으로 밀린다 —
# 전부 등에 가시가 돋고 갈비뼈가 드러난 것이 되어, 마물답기는 한데 서로 구분이
# 안 된다. 실루엣을 가르려고 여덟을 골랐는데 그걸 도로 뭉개는 셈이다.
#
# 그래서 **밀 방향을 하나씩 다르게** 못 박는다. 셋을 지킨다 —
#
#   1. 윤곽이 바뀌어야 한다. 40px 에서 붉은 눈과 흉터는 안 보인다
#   2. 그 종을 가르던 특징(들쥐의 낮음, 오우거의 두 발)을 안 지운다
#   3. 우두머리 아홉의 표식과 안 겹친다 (뿔 하나 · 눈이 멂 · 왕관 · 두개골 …)

MARKS = {
    'gr_rat':
        'THE TAIL SPLITS. Halfway down, the bare tail forks into TWO tails that '
        'move apart. Nothing with a forked tail is a rat any more, and the fork '
        'reads at 40 pixels because it doubles the shape trailing behind it.',
    'gr_boar':
        'THE HUMP IS BREAKING OPEN. The bristle ridge is gone; in its place four or '
        'five BONE PLATES have pushed up through the hide of the shoulder hump, hard '
        'and angular, each a different length. And there is a THIRD TUSK — a short '
        'one growing straight up out of the top of the snout, between the eyes.',
    'gr_wolf':
        'THE LOWER JAW IS SPLIT IN TWO lengthwise. Closed, it looks like a deep crack '
        'down the muzzle. Open, the two halves swing APART SIDEWAYS like pincers, so '
        'the mouth is a wide V seen from the side, far wider than the skull. This is '
        'the whole silhouette of the attack frame.',
    'gr_hound':
        'IT HAS TOO MANY EYES. A SECOND PAIR sits above the first, higher on the '
        'skull and larger, so the head reads as four hard dots stacked two and two. '
        'And the collar is not worn — the hide has GROWN OVER it, swallowing the '
        'strap so only the buckle and the broken chain still stand clear.',
    'gr_ogre':
        'ONE ARM IS FAR TOO BIG. The right arm is twice the bulk of the left, plated '
        'in bone from shoulder to knuckle, and so heavy it hangs to the ground and '
        'drags. The left arm is thin and short. Nothing about it is symmetrical, and '
        'the lopsidedness is visible before anything else.',
    'gr_wasp':
        'THE STING IS AS LONG AS THE BODY. It trails behind like a needle, barbed '
        'along its last third, and it does not fold away. And there are THREE WINGS, '
        'not four — two on one side, one on the other, so the creature is visibly '
        'unbalanced in the air.',
    'gr_crow':
        'THE HEAD IS BARE BONE. From the neck up there are no feathers at all — just '
        'a long skull with the beak as part of it, and the eye sockets empty and '
        'open. Feathers start abruptly at the shoulders in a hard ragged line. The '
        'beak is too long for the skull and hangs slightly open.',
    'gr_thistle':
        'THE FLOWER IS A MOUTH. Where a thistle head should be there is a vertical '
        'slit ringed with inward-pointing spines, held slightly apart. It is the only '
        'soft dark shape on an otherwise all-thorn silhouette, and the eye goes to '
        'it. No eyes anywhere — this thing does not look at you.',
}


def page(f):
    prompt = block(
        NOTEXT,
        'SUBJECT: a 3-frame animation sheet of ONE single creature, left to right. '
        'The creature is in every cell.' + NL + NL
        + 'THE CREATURE (the same one in all 3 cells):' + NL + f['lock']
        + (NL + NL + 'MONSTER MARK — this is the one thing that makes it not an '
           'animal. Draw it in every cell:' + NL + MARKS[f['id']]
           if f['id'] in MARKS else '') + NL + NL
        + rows_of(f['frames'], 'The 3 cells, in this exact order:'),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        # 쿼터뷰 바닥은 누운 것을 못 받쳐 준다 — 눕지 말라고 따로 말해야 한다
        STANDS,
        SILHOUETTE,
        NOT_CUTE,
        # 종류에 맞는 규칙만 붙인다 — 슬라임에게 "굶주린 짐승" 을 시키면 안 된다
        SLIME if f.get('family') == 'slime' else TWISTED,
        # 우두머리는 "잡몹을 키운 것" 으로 나오기 쉽다 — 뭐가 다른지 못 박는다
        BOSS if f.get('boss') else '',
        ALIVE,
        'NOTHING MAY BE CUT OFF.' + NL + f['rules'] + NL
        + '- Every cell holds the WHOLE creature plus every loose droplet and speed '
        'line. If any of it touches a magenta line, that cell has failed.' + NL
        + '- Leave at least 8px of empty black between the outermost pixel and every '
        'magenta line.',
        grid(3, 1),
    )
    fill = ('45%' if f['id'] == 'sl_melee'
            else '65%' if f['id'] == 'sl_ranged' else '80%')
    return TEMPLATE % {
        'name': f['name'], 'set': f['set'], 'role': f['role'], 'job': f['job'],
        'intro': f['intro'],
        'table': table_of(f['frames']),
        'prompt': prompt,
        'labels': labels_of(f['frames']),
        'fill': fill,
        'shot': shot_section(f),
    }


BG_TPL = """
---

## %(id)s. %(name)s — %(stages)s 스테이지

%(block)s
받으면 `assets/sprites/bg_chapter/%(id)s.png` 로 넣으세요. **슬라이서를 안
태웁니다** — 한 장짜리 그림이라 자를 것이 없습니다.
"""


BG_PAGE = """# 배경

← [색인으로](FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.

무대 뒤에 깔리는 그림입니다 (`src/screens/home/BattleView.tsx`).
**20%% 로 흐려서** 깔리므로, 큰 덩어리만으로 읽혀야 합니다 — 가는 선은 두 번
사라집니다. 한 번은 축소로, 한 번은 흐려서.

## 땅을 그리면 안 됩니다

이 게임은 2D 횡스크롤이 아니라 **약간의 쿼터뷰**입니다. 바닥은 코드가 그립니다 —
뒤로 갈수록 좁아지는 사다리꼴 평면(`Ground`)이고, 인물은 그 위에 섭니다.

그래서 배경이 맡는 것은 **지평선 너머**뿐입니다. 배경에도 땅을 그리면 바닥이
두 겹이 되고, 그림 속 땅은 정면인데 코드가 그린 바닥은 비스듬해서 두 평면이
서로 어긋난 채 겹칩니다. 화면에서는 "땅이 너무 크다" 로 보입니다.

**지평선을 그림 맨 아래 모서리에 둡니다.** 그 위로는 전부 멀리 있는 것이고,
아래로는 아무것도 없습니다.

## 가로로 긴 띠입니다 (1024x256)

화면에서 배경이 차지하는 자리는 바닥판 위의 **가로로 긴 띠**입니다 — 높이가
129px 뿐이고 폭은 기기에 따라 330~900px 이라, 대략 2.6:1 에서 7:1 사이입니다.
그래서 그림을 **띠에 늘려서 꽉 채웁니다.** 비율을 지키면 위가 잘려 구름이
사라지거나 양옆이 비는데, 화면 폭이 기기마다 달라서 어느 한쪽으로 맞춰 둘 수도
없습니다. 먼 풍경이 20%% 로 흐려져 깔리므로 조금 늘어나는 건 안 보입니다.

**그래서 4:3 으로 그리면 세로로 눌립니다.** 처음부터 4:1 안에서 구도를 잡아야
하고, 위쪽 절반은 구름으로 채워야 합니다 — 비워 두면 화면에서도 비어 보입니다.


| 스테이지 | 지역 | 파일 |
|---|---|---|
%(rows)s

두 장으로 열 판을 돌립니다. 판마다 그리면 그릴 것이 너무 많고, 한 장으로 열 판을
돌리면 어디까지 왔는지 알 수 없습니다.
%(pages)s"""


INDEX = """# 적 이미지 프롬프트

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.

적은 캐릭터와 달리 **시트 한 장이 전부**입니다. 흉상도 일러스트도 없고,
화면이 쓰는 칸도 `idle` · `attack` · `down` 셋뿐입니다 —
한 화면에 넷이 40~52px 로 겹쳐 서므로 그 크기에서 여덟 가지 자세는
어차피 구분이 안 됩니다.

스타일 규칙은 캐릭터 쪽과 **같은 것**을 씁니다 (`tools/artstyle.py`).
같은 화면에 나란히 서는 그림이라 규칙이 갈리면 그 차이가 보입니다.

[배경 프롬프트는 따로 있습니다](FOE_BG_PROMPTS.md) — 세 장으로 아홉 판을 돌립니다.

## 스테이지 구성

`core/autoBattle` 의 `STAGES` 가 이 표 그대로입니다. 판마다 두세 종이 섞이고,
우두머리는 판마다 다릅니다.

%(stages)s

## 목록

| 파일 | 이름 | 등장 | 상태 |
|---|---|---|---|
%(rows)s

## 실루엣이 겹치면 안 된다

한 화면에 넷이 40~52px 로 겹쳐 섭니다. 그 크기에서 남는 것은 **윤곽뿐**이라,
색도 무늬도 도움이 안 됩니다. 그래서 여덟 잡몹을 이렇게 갈랐습니다 —

| | 가르는 것 |
|---|---|
| 들쥐 · 멧돼지 · 늑대 | 네발이지만 **높이가 다르다** (기고 / 머리 숙이고 / 서고) |
| 들개 | 짐승 위에 **사람이 만든 것** (목줄과 끊어진 사슬) |
| 초원 오우거 | **두 발로 선다** — 잡몹 중 유일하다 |
| 말벌 · 까마귀 | 둘 다 뜨지만 **기울어진 덩어리**와 **수평 십자꼴** |
| 엉겅퀴 | 짐승이 아니다. **뿌리내려 안 움직인다** |

우두머리 아홉도 같은 규칙입니다. 잡몹을 키운 것으로 보이면 안 되므로
(1스테이지에서 겪었습니다) 저마다 **잡몹에 없는 요소**를 하나씩 가집니다 —
업고 있다 · 뿔이 하나다 · 알을 달았다 · 눈이 멀었다 · 덤불이다 · 갑옷을 입었다 ·
왕관을 썼다 · 두개골을 썼다 · 나무가 되었다.
"""


def bg_page():
    pages = []
    rows = []
    for b in BACKGROUNDS:
        blk = block(
            NOTEXT,
            'SUBJECT: a single background image of ' + b['name'] + '.' + NL + NL
            + b['scene'],
            PIXEL_STYLE,
            BG_STYLE,
            'OUTPUT: a single image, a WIDE SHORT STRIP, 1024x256 (4:1). '
            'This shape is not a suggestion — the game shows a band four times as '
            'wide as it is tall, and it stretches your image to fit it exactly. '
            'A 4:3 or square image will be squashed to a quarter of its height and '
            'everything in it will look flattened. COMPOSE INSIDE A 4:1 STRIP: '
            'clouds across the top half, the horizon on the bottom edge, and the '
            'distant shapes spread along the full width rather than clustered in '
            'the middle. No grid, no separator lines, no magenta.',
        )
        pages.append(BG_TPL % {
            'id': b['id'], 'name': b['name'], 'stages': b['stages'], 'block': blk,
        })
        rows.append('| %s | %s | `bg_chapter/%s` |' % (b['stages'], b['name'], b['id']))
    return BG_PAGE % {'rows': NL.join(rows), 'pages': NL.join(pages)}


def stage_table():
    rows = ['| 스테이지 | 지역 | 나오는 것 | 우두머리 |', '|---|---|---|---|']
    for i, st in enumerate(STAGE_TABLE, 1):
        rows.append('| %d | %s | %s | %s |'
                    % (i, st[0], ' · '.join(st[1]), st[2]))
    return NL.join(rows)


# `core/autoBattle` 의 STAGES 와 같은 표. 손으로 맞춘 것이라 어긋나면 여기를 고친다
STAGE_TABLE = [
    ('슬라임초원', ['슬라임', '뱉는 슬라임'], '빅 슬라임'),
    ('슬라임초원', ['풀슬라임', '포자 슬라임'], '풀무더기 슬라임'),
    ('슬라임초원', ['풀슬라임', '진흙 슬라임', '포자 슬라임'], '수렁 슬라임'),
    ('슬라임초원', ['진흙 슬라임', '포자 슬라임', '가시 슬라임'], '홀씨 슬라임'),
    ('슬라임초원', ['진흙 슬라임', '돌 슬라임', '가시 슬라임'], '가시덩이 슬라임'),
    ('슬라임 초원 깊숙한 곳', ['돌 슬라임', '쌍둥이 슬라임', '가시 슬라임'], '바위 슬라임'),
    ('슬라임 초원 깊숙한 곳', ['돌 슬라임', '뼈 슬라임', '산성 슬라임'], '가르는 슬라임'),
    ('슬라임 초원 깊숙한 곳', ['뼈 슬라임', '쌍둥이 슬라임', '산성 슬라임'], '녹이는 슬라임'),
    ('슬라임 초원 깊숙한 곳', ['뼈 슬라임', '쌍둥이 슬라임', '산성 슬라임', '가시 슬라임'], '뼈무덤 슬라임'),
    ('슬라임 초원 깊숙한 곳', ['돌 슬라임', '뼈 슬라임', '쌍둥이 슬라임', '산성 슬라임'], '슬라임 군주'),
]

os.makedirs(OUT_DIR, exist_ok=True)
rows = []
for _f in FOES:
    _p = os.path.join(OUT_DIR, _f['id'] + '.md')
    open(_p, 'w', encoding='utf-8').write(page(_f))
    print('%s (%s)' % (_p, _f['name']))
    _done = os.path.isdir(os.path.join('assets/sprites', _f['set']))
    rows.append('| [%s](foe-art/%s.md) | %s | %s | %s |'
                % (_f['name'], _f['id'], _f['name'], _f['role'],
                   '들어옴' if _done else '프롬프트만'))
open('docs/FOE_ART_PROMPTS.md', 'w', encoding='utf-8').write(
    INDEX % {'rows': NL.join(rows), 'stages': stage_table()})
open('docs/FOE_BG_PROMPTS.md', 'w', encoding='utf-8').write(bg_page())
print('배경 %d장 · docs/FOE_BG_PROMPTS.md' % len(BACKGROUNDS))
print('%d종 · docs/FOE_ART_PROMPTS.md' % len(FOES))
