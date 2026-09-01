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
    ALIVE, NL, NOTEXT, NOT_CUTE, NO_GROUND, PIXEL_STYLE, QUARTER, SILHOUETTE,
    STANDS, block, grid, labels_of, rows_of, table_of,
)

# 챕터마다 폴더를 나눈다 — 한 폴더에 마흔둘이 쌓이면 이름으로만 구분해야 한다
OUT_DIR = 'docs/foe-art'          # 1~10 · 슬라임
OUT_DIR2 = 'docs/foe-art2'        # 11~20 · 식물 · 나무
OUT_DIR3 = 'docs/foe-art3'        # 21~30 · 벌레 · 군체


def out_dir_of(f):
    """이 적의 프롬프트가 놓일 폴더.

    id 앞자리로 정한다 — `family` 와 같은 이유다 (`tag_families`). 항목마다
    폴더를 손으로 적게 하면 언젠가 하나가 엉뚱한 데로 간다.
    """
    if f['id'][:3] == 'sw_':
        return OUT_DIR3
    return OUT_DIR2 if f['id'][:3] in ('pf_', 'pw_', 'pb_') else OUT_DIR


# ══ 적이 화면에서 쓰는 세 칸 ═════════════════════════════════
#
# `BattleView` 가 이 셋만 부른다. 넷째를 그려도 안 쓴다.

FRAME_IDS = ['idle', 'attack', 'down']


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


PLANT = """IT IS A PLANT THAT HUNTS. IT IS NOT A PLANT.

"Plant monster" pulls every model toward a friendly potted thing with a smiling
flower face, or toward a botanically correct drawing of a real weed. Both are wrong,
and they are wrong in opposite directions.

WHAT IS RIGHT: something that grew where a body was left, took what it found, and
kept growing. It is still made of stem and leaf and thorn — but the arrangement is
an animal's, not a plant's.

APPLY ALL FOUR:

1. IT HAS A FRONT. Real plants face every direction at once; this one is aimed. One
   end is clearly the end that catches things — heavier, darker, opening. The rest
   trails behind it. At 45 pixels this is what separates it from scenery.

2. IT REACHES. At least one part is extended toward the player and does not belong
   at that length — a runner, a tendril, a stalk that has stretched twice as far as
   the body is wide. It is caught mid-reach in every cell, never at rest.

3. SOMETHING IT ATE IS STILL IN IT. One hard pale shape held in the tangle: a rib,
   a jawbone, a broken blade, a helm. ONE, not a pile — it reads as evidence, and a
   pile reads as decoration. This is what says the plant is not just growing.

4. THE OPENING IS NOT A FACE. Where it takes things in there is a split, a cup, or a
   throat lined with INWARD-POINTING SPINES — four to six of them, big, uneven, some
   snapped. Never lips, never a drawn smile, never petals arranged in a neat ring.

EYES: MOSTLY NONE. Plants do not have them and the absence is unsettling — a thing
that hunts you without looking at you. Where the description below asks for one, it
is a single hard slit set somewhere wrong (in the stem, under the cup, on the
underside of a leaf), never a pair in a face.

BANNED: smiling flowers, potted plants, tidy symmetrical blooms, botanical accuracy,
googly eyes on a stem, anything that would work as a garden centre logo."""


WOOD = """IT IS OLD WOOD THAT MOVES. IT IS NOT AN ENT.

Two failures to avoid, and the second is the common one.

The first is a friendly tree-person: a trunk with a kind bearded face and two arm
branches, standing straight. That is a storybook character, not an enemy.

The second is a REAL TREE. Asked for a walking tree, every model draws a handsome
oak with roots for feet. The player then fights forestry. A tree with legs is still
a tree.

WHAT IS RIGHT: wood that has been dead a long time and started moving anyway. It
should look like something that fell over years ago and got back up wrong.

APPLY ALL FOUR:

1. IT IS BROKEN AND IT KEPT GOING. The trunk is snapped, split, or hollowed through,
   and it did not heal — it grew around the damage. A hole you can see the black
   through is the single strongest shape in this chapter; use it.

2. IT LEANS. Nothing here stands straight. The mass is off its own centre, held up
   by whatever is under it, so the silhouette is a diagonal rather than a column.
   A straight upright trunk reads as scenery every time.

3. THE ROOTS ARE THE LIMBS. What it moves on came out of the ground and is still
   shaped like roots — thick, splayed, uneven in number, clotted with earth. Not
   legs, not feet, never boots. Three or five, never a tidy pair.

4. THE GRAIN IS TORN, NOT DRAWN. Bark shows as a few big hard splits and one or two
   deep gouges. NEVER as fine parallel lines or surface texture — at 45 pixels that
   turns to grey mush and the shape disappears with it.

EYES: none, or holes. Knots and hollows in the wood do the looking. Where the
description below asks for a light in one, it is a small hard shape deep inside a
hole, not an eye drawn on the surface.

IT IS TALLER THAN EVERYTHING BEFORE IT. This chapter follows the vine wood, where
nothing rose above waist height. Here every mob stands over a person. That change in
the height of the enemy line is how the player knows the chapter turned, and it is
read before any individual creature is.

BANNED: bearded tree faces, neat bark texture, healthy green canopies, symmetrical
branching, anything that would pass in a woodland illustration."""


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


SPECIAL = """THE FOURTH CELL — THE SPECIAL ATTACK.

The boss has two attacks the mobs do not have:
one that hits the WHOLE party at once, and one that hits a single character very
hard. Cell 3 is the pose for those.

It must be readable as "something bigger is happening" from the silhouette alone,
because the player sees it for about a fifth of a second at 60 pixels tall:

- IT IS THE WIDEST OR THE TALLEST CELL. Whatever the creature normally occupies,
  this pose breaks out of it in one direction. If the ordinary attack goes forward,
  this one goes UP and OUT.
- THE WHOLE BODY COMMITS. Not one limb — the mass itself is thrown into it, and the
  parts that normally trail behind are flung wide.
- SOMETHING LEAVES THE BODY. Three or four loose pieces (spores, splinters, thorns,
  clods) in the air around it, clear of the outline. That is what says the attack
  reaches past arm's length.
- The pose is HELD, not mid-swing. It is one frame; a blur reads as nothing.

Do NOT draw impact marks, shockwave rings, or the ground cracking. The game draws
its own effects on top, and a ring drawn into the sprite lands on screen as a white
smear that never goes away."""


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


def plantboss(id_, name, role, job, chapter, lock, idle, attack, special, down,
              fill, intro):
    """식물·나무 우두머리 한 마리. **네 칸**이다.

    잡몹은 대기·공격·피격 셋인데, 우두머리는 그 사이에 **특수 동작**이 하나
    더 들어간다 (`core/autoBattle` 의 `BOSS_PATTERNS`). 전원을 휩쓸거나 한
    명을 내려찍을 때 쓰는 그림이다.

    슬라임 우두머리(`slimeboss`)는 세 칸으로 남겨 둔다. 화면이 없는 칸을
    같은 시트의 `attack` 으로 떨어뜨리므로, 이미 받은 시트를 다시 그릴
    이유가 없다.
    """
    return foe(
        id_, name, role, job, lock,
        [('idle', '대기', idle), ('attack', '공격', attack),
         ('special', '특수', special), ('down', '피격', down)],
        '- It fills about %d%% of the cell height — it is the biggest thing on the '
        'field and must read as such next to a 45%% mob.' % fill + NL
        + '- Cell 3 (the special attack) is the widest or the tallest. Size the '
        'sheet from it.',
        intro,
        chapter=chapter,
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

# ══ 오염된 잔재들의 숲 ═══════════════════════════════════════════════════
#
# 11~15 스테이지. 슬라임 다음 챕터다.
#
# **가르는 축이 바뀐다.** 슬라임은 덩어리 하나였으므로 높이와 윤곽으로
# 갈랐는데, 식물은 **무엇이 어느 방향으로 뻗었나**로 갈린다 —
#
#   덩굴손   옆으로 길다 (기준)      아귀꽃   위가 무겁다
#   가시덤불 사방으로 뾰족하다        이끼덩이 윤곽이 부드럽다
#   홀씨대   곧게 서서 던진다        진액꽃   고개를 숙이고 던진다
#
# 여섯 중 넷은 붙어 싸우고 둘은 던진다. 붙는 놈만 나오면 뒷줄이 늘 비고
# 파티를 어떻게 세우든 같아진다.

FOES += [
    mob3(
        'pf_vine', '덩굴손', '근접 · 오염된 잔재들의 숲 11~13', '바닥을 기어 와서 휘감는다. 이 지역의 기본형이다.',
        'A creeper that learned to move toward warmth.' + NL
        + 'BODY: LOW AND LONG — it lies along the ground and reaches forward, about three times as long as it is tall. It is the flattest thing in this chapter and every other plant here is measured against it.' + NL
        + 'THE MASS is a tangle of four or five thick runners twisted together into one rope, thicker at the back and fraying into separate strands at the front.' + NL
        + 'THE FRONT: the strands separate into three or four TENDRILS that lift clear of the ground and curl forward at different heights. That is the end that catches things, and it is where the eye goes.' + NL
        + 'CAUGHT IN THE TANGLE, about a third of the way back: ONE PALE RIB, held crosswise, half wrapped. One. Not a pile.' + NL
        + 'THE OPENING is where the runners meet at the front — a split in the rope lined with FOUR INWARD-POINTING SPINES, held slightly apart. No face, no eyes.' + NL
        + 'LEAVES: five or six, small and hard-edged, all along the length, curling different ways.',
        'gathered and low, the tendrils lifted and curling, the rope of runners drawn back behind them like something about to be let go.',
        'the whip. The whole rope has snapped forward and straightened, the tendrils thrown out ahead at full length, the back end lifted off the ground by the pull. Two torn leaves in the air behind.',
        'struck. The rope has buckled in the middle and the strands have come apart, three tendrils flung wide and one torn off entirely. The rib has come loose.',
        '- It fills about 34% of the cell height. It is LOW — leave the space above it empty rather than scaling it up.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """11~13 스테이지의 기본형입니다. 오염된 잔재들의 숲 여섯의 **기준**이 되는 모양이라,
이것부터 그리고 나머지를 여기에 견주세요.

**제일 낮고 제일 깁니다.** 슬라임 챕터가 덩어리로 갈렸다면 이 챕터는 **뻗은
것**으로 갈립니다 — 이놈은 옆으로, 아귀꽃은 위로, 가시덤불은 사방으로.""",
    ),

    mob3(
        'pf_maw', '아귀꽃', '근접 · 오염된 잔재들의 숲 12~13, 15', '고개를 숙였다가 통째로 문다.',
        'A flower that stopped waiting for insects.' + NL
        + 'BODY: TOP-HEAVY. A single thick stem, about as tall as a person\'s waist, carrying a HEAD far too big for it — the head is nearly half the whole height and visibly drags the stem over to one side. Nothing else in this chapter is top-heavy; that is its read.' + NL
        + 'THE HEAD is a deep CUP, not a bloom. Four heavy petal-lobes fold around an opening, and they are thick and leathery, not thin. The rim is ragged.' + NL
        + 'INSIDE THE CUP: SIX INWARD-POINTING SPINES, long and uneven, two of them crossing. They show even when the cup is only half open.' + NL
        + 'A BROKEN BLADE is caught between two of the outer lobes, rusted, pointing down. It has been there a while.' + NL
        + 'THE STEM is thick and fibrous with two or three small hard leaves low down, and it BENDS — never straight.' + NL
        + 'ROOTS: a knot of short roots at the base, out of the ground, splayed. It walks on them.',
        'the head hung forward and down, the cup half open and aimed at the ground ahead, the stem bowed under the weight. It is waiting for something to step under it.',
        'the bite. The stem has whipped forward and the head is thrown out ahead of the roots, the cup opened WIDER THAN THE HEAD IS DEEP with every spine showing. The stem is stretched into a long shallow curve.',
        'struck. The stem has snapped back and the head is thrown up and over, the cup wrenched open the wrong way, two lobes torn. The blade has come loose.',
        '- It fills about 62% of the cell height. It is TALL and top-heavy.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """**위가 무겁습니다.** 이 챕터에서 유일하게 머리가 큰 놈이라, 줄에 섞여
서 있어도 그것만으로 구분됩니다.

꽃처럼 예쁘게 그리면 실패입니다. 꽃잎은 얇지 않고 **가죽처럼 두껍고**, 안에는
안으로 굽은 가시가 여섯 있습니다.""",
    ),

    mob3(
        'pf_bramble', '가시덤불', '근접 · 오염된 잔재들의 숲 13~15', '굴러와서 몸으로 긁는다. 만지면 아프다.',
        'A thicket that rolled over something and kept the shape.' + NL
        + 'BODY: a rough BALL of tangled thorny canes, about as wide as it is tall. The outline is spiky ALL THE WAY ROUND — twenty or more thorn tips break the silhouette in every direction. Nothing else in this chapter is spiky on every side.' + NL
        + 'THE CANES are dark and hard where they cross, so the mass reads as dense at the centre and open at the edges.' + NL
        + 'THE FRONT is where the canes have been forced apart into a low opening, lined with FIVE THORNS TURNED INWARD. That is the end that catches things.' + NL
        + 'HELD IN THE CENTRE, visible through the tangle: ONE PALE JAWBONE. It does not move when the ball does.' + NL
        + 'It has no eyes and no face at all.',
        'settled, the canes bristling evenly, the front opening turned toward you. It is not still — one or two canes are flexing.',
        'the roll. It has thrown itself forward and the whole ball is stretched into an oval along the direction of travel, the trailing canes swept back flat. Three broken thorns in the air behind.',
        'struck. The ball has burst open on one side, canes splayed outward in a fan, six or seven thorns snapped off and flying. The jawbone shows through the gap.',
        '- It fills about 46% of the cell height.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """**사방이 뾰족합니다.** 오염된 잔재들의 숲 여섯 중 유일하게 윤곽이 전 방향으로 튀는
놈이라, 46px 로 줄여도 혼자만 실루엣이 다릅니다.

가시 슬라임(`sg_thorn`)과 헷갈리면 안 됩니다. 그쪽은 **뜨고**, 가시가 몸에서
곧게 뻗어 나옵니다. 이쪽은 **바닥에 있고**, 가시가 얽힌 줄기에 달려 있습니다.""",
    ),

    mob3(
        'pf_moss', '이끼덩이', '근접 · 오염된 잔재들의 숲 14~15', '느리게 다가와 짓누른다. 축축하다.',
        'A mound of wet moss with something underneath holding it up.' + NL
        + 'BODY: HEAVY AND SHAGGY, about as tall as it is wide, standing but losing to its own weight — the middle bulges out past the base and the top slumps over to one side.' + NL
        + 'THE SURFACE is the read: the whole outline is FURRED with short ragged tufts, so the edge is soft and broken everywhere. Nothing else in this chapter has a soft outline — the others are all hard tendrils and thorns.' + NL
        + 'HANGING OFF IT: five or six long wet strands from the underside and the slumped side, each a different length. They hang in empty black and simply stop.' + NL
        + 'SHOWING THROUGH the moss on the front, where the tufts are thin: A HAND-SHAPED ARRANGEMENT OF PALE BONES, still gripping. Only that much of whatever is under there is visible.' + NL
        + 'THE OPENING is a wet horizontal split low on the front, held apart, with FOUR BLUNT WORN SPINES inside. No eyes.',
        'standing slumped and still, the top overhanging one side, strands hanging long and straight. It looks heavy even standing still.',
        'the fall. It has toppled FORWARD to land on something, the mass stretched long as it goes, the tufts swept back and the strands flung out ahead. The bone hand is thrown forward with it.',
        'struck. The mound has buckled sideways and split across the top, wet clumps thrown off in a spray, the tufts torn away in patches so the bones underneath show.',
        '- It fills about 50% of the cell height.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """**윤곽이 부드러운 유일한 놈**입니다. 나머지 다섯은 전부 덩굴이나 가시라
가장자리가 딱딱한데, 이놈만 술이 나 있어 흐릿합니다.

무게는 **낮이가 아니라 늘어짐**으로 말합니다 (`STANDS` 규칙). 서 있되 제
무게에 못 이겨 주저앉는 모양입니다.""",
    ),

    mob3(
        'pf_spore', '홀씨대', '원거리 · 오염된 잔재들의 숲 11~13', '멀리서 홀씨를 쏜다. 무르고 아프다.',
        'A stalk that grew straight up out of a body and started aiming.' + NL
        + 'BODY: TALL AND THIN — a single stalk, three or four times as tall as it is wide, the narrowest silhouette in this chapter. It stands and does not lean much.' + NL
        + 'THE HEAD is a hard closed POD at the top, blunt and heavy, with four seams down its sides. It is the only wide part and it sits right at the top.' + NL
        + 'THE SEAMS open when it fires; closed, they read as four dark lines.' + NL
        + 'THE BASE: three stiff roots out of the ground, splayed like a tripod. It braces rather than walks — that stillness is how the player learns it will not come over.' + NL
        + 'LOW ON THE STALK, grown into it: ONE PALE RIB, held sideways, the stalk swollen around where it entered.' + NL
        + 'EYE: ONE, a hard slit set in the STALK halfway up — nowhere near the pod. A thing that watches you from the wrong part of itself.',
        'standing braced and still, the pod closed and turned toward you, the tripod set. It holds its ground.',
        'the burst. The pod has SPLIT along all four seams and opened wide like a hand, and a tight clump of spores is LEAVING it, clear of the body, with two speed lines. The stalk is bowed back from the recoil.',
        'struck. The stalk has snapped partway up and folded over, the pod hanging upside down, spores spilling loose. One root has torn out of the ground.',
        '- It fills about 58% of the cell height and stands on the ground.' + NL
        + '- Cell 2 is the widest. Size the sheet from it.',
        """11~13 스테이지의 원거리입니다. 안 걸어오는 대신 체력이 낮고 더 아프게
때립니다.

**제일 가늡니다.** 덩굴손이 가로로 길다면 이놈은 세로로 깁니다 — 한 화면에
둘이 같이 서면 그 대비만으로 갈립니다.

포자 슬라임(`sg_spore`)과 달리 **뜨지 않습니다.** 삼발이 뿌리로 땅을 딛고
버팁니다.""",
    ),

    mob3(
        'pf_sap', '진액꽃', '원거리 · 오염된 잔재들의 숲 14~15', '멀리서 진액을 뱉는다. 닿으면 녹는다.',
        'A bloom that fills with something and spits it.' + NL
        + 'BODY: a stalk of medium height that BENDS OVER at the top, so the head hangs forward and down — the silhouette is a hook. The spore stalk stands straight; this one is bent, and that is how the two ranged plants are told apart.' + NL
        + 'THE HEAD is a heavy drooping SAC, wider than it is tall, sagging under what is inside it. Two or three thick drips hang off its underside and stop in empty black.' + NL
        + 'THE MOUTH is at the low front of the sac: a round puckered opening ringed with FIVE SHORT INWARD SPINES, wet and never fully closed.' + NL
        + 'THE STALK below is streaked where sap has run down it and eaten in — drawn as two or three hard gouges, not as texture.' + NL
        + 'AT THE BASE, half dissolved and sunk into the ground it stands on: A HELM, pitted through. One object, clearly a helm.' + NL
        + 'It has no eyes.',
        'the head hung low and heavy, the sac full and sagging, drips hanging long. Nothing about it is moving and that is what makes it read as loaded.',
        'the spit. The stalk has SNAPPED UPRIGHT and thrown the head back and up, the sac clenched narrow, and a blob of sap is LEAVING the mouth, clear of the body, with two speed lines.',
        'struck. The sac has burst along one side and is collapsing, sap thrown out in a spray of four or five blobs, the stalk folded over double.',
        '- It fills about 54% of the cell height and stands on the ground.' + NL
        + '- Cell 2 is the tallest. Size the sheet from it.',
        """14~15 스테이지의 원거리입니다.

**홀씨대와 갈리는 것은 오직 기울기입니다.** 홀씨대는 곧게 서고 이놈은 고개를
숙입니다 — 흑백 도트에서 둘을 가르는 것이 그것뿐이므로, 굽은 정도를 확실히
그려야 합니다.""",
    ),
]


# ══ 타락한 잔재들의 숲 ══════════════════════════════════════════════
#
# 16~20 스테이지. 식물 챕터의 **높이를 올린 것**이 이 챕터의 정체다.
#
# 앞 챕터는 전부 사람 허리 아래였다. 여기는 제일 낮은 놈(그루터기)조차 앞
# 챕터의 무엇보다 크다. 종을 하나하나 알아보기 전에 **줄의 높이**가 먼저
# 눈에 들어오고, 그게 챕터가 넘어간 것을 말하는 제일 싼 방법이다.
#
#   그루터기 낮고 두껍다 (기준)      속빈나무 윤곽 안이 뚫렸다
#   뿌리덩이 밑이 넓다               껍질갑옷 각진 판이 덮였다
#   가지창   가늘고 직선이 뻗는다     꼬투리   위가 무겁다

FOES += [
    mob3(
        'pw_stump', '걷는 그루터기', '근접 · 타락한 잔재들의 숲 16~17', '느리게 걸어와서 짓밟는다. 이 지역의 기본형이다.',
        'What is left after a tree was felled, walking on the roots it was cut from.' + NL
        + 'BODY: LOW, THICK AND WIDE — a broad drum of trunk, cut off flat across the top, wider than it is tall. It is the shortest thing in this chapter and every other tree here is measured against it. Even so it stands taller than any plant from the chapter before.' + NL
        + 'THE CUT TOP is the read: a flat disc, tilted, with the rings showing as THREE OR FOUR concentric hard lines — no more. Twenty rings turn to grey mush at this size.' + NL
        + 'THE AXE IS STILL IN IT. A rusted axe head buried in the edge of the cut, haft snapped off short. One object, unmistakable.' + NL
        + 'IT LEANS. The drum sits off its own centre, held up by what is under it.' + NL
        + 'THE ROOTS ARE THE LIMBS: FIVE thick roots out of the ground, splayed unevenly, clotted with earth, different lengths. Never a tidy pair, never feet.' + NL
        + 'EYES: none. A single deep KNOT-HOLE low on the front of the trunk, black all the way through, does the looking.',
        'standing heavy and tilted, roots set wide, the cut top angled toward you. It has not moved yet and it does not look like it will move fast.',
        'the stamp. It has heaved its whole mass UP and forward onto two front roots, the drum thrown ahead of the base, the back roots dragged off the ground. Clods of earth in the air below.',
        'struck. The drum has split from the cut top downward, the crack running deep, two roots torn out and the whole thing folding sideways. Splinters thrown off.',
        '- It fills about 52% of the cell height. It is LOW AND WIDE for this chapter.' + NL
        + '- Cell 2 is the tallest. Size the sheet from it.',
        """16~17 스테이지의 기본형입니다. 타락한 잔재들의 숲 여섯의 **기준**이 되는 모양이라,
이것부터 그리고 나머지를 여기에 견주세요.

**이 챕터에서 제일 낮은 놈인데도 앞 챕터의 무엇보다 큽니다.** 그 높이 차이가
"챕터가 넘어갔다" 를 말하는 제일 빠른 방법입니다 — 종을 알아보기 전에 줄의
높이가 먼저 보입니다.""",
    ),

    mob3(
        'pw_hollow', '속 빈 나무', '근접 · 타락한 잔재들의 숲 17~18, 20', '가운데가 뚫려 있다. 거기로 문다.',
        'A trunk that rotted through the middle and did not fall.' + NL
        + 'BODY: TALL AND LEANING — half again as tall as it is wide, and the whole mass is tipped well off vertical.' + NL
        + 'THE HOLE IS THE READ. A large opening goes CLEAN THROUGH the trunk at chest height — you can see black sky through it. It is nearly a third of the width of the body and it breaks the silhouette from the inside. Nothing else in this set has a hole through it; protect this above everything.' + NL
        + 'THE RIM of the hole is ragged and splintered inward, and FIVE LONG SPLINTERS point in toward the middle of the opening like teeth. That is where it takes things in.' + NL
        + 'CAUGHT ON THE LOWER RIM, hanging half inside: A RIBCAGE, pale, one side broken away.' + NL
        + 'THE TOP is snapped off at an angle, not rounded, with three or four hard splinters standing up.' + NL
        + 'ROOTS: three thick ones, splayed, one much longer than the others.' + NL
        + 'EYES: none. Two smaller knot-holes above the big hole, uneven, black.',
        'standing tilted and still, the hole facing you, the ribcage hanging in it. The stillness is what makes it read as waiting.',
        'the lunge. The whole trunk has swung forward from the roots like a falling post, the hole thrown ahead and its splinters closing inward. The ribcage swings out.',
        'struck. The trunk has cracked across at the hole, the opening torn wide and crooked, the upper half folding over. Splinters and the broken ribcage flying.',
        '- It fills about 66% of the cell height.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """**뚫린 구멍이 전부입니다.** 몸통 한가운데를 관통해서 검은 배경이 그대로
비쳐 보여야 합니다 — 이 챕터에서 윤곽 **안쪽**이 뚫린 유일한 놈이라, 66px 로
줄여도 혼자만 다르게 읽힙니다.

구멍을 표면에 그린 어두운 자국으로 그리면 실패입니다. 진짜로 뚫려야 합니다.""",
    ),

    mob3(
        'pw_root', '뿌리덩이', '근접 · 타락한 잔재들의 숲 18~20', '아래가 넓다. 뿌리로 후려친다.',
        'A root ball that came up out of the ground and left the tree behind.' + NL
        + 'BODY: BOTTOM-HEAVY — a wide splayed knot of roots at the base narrowing to a short broken stub at the top. The silhouette is a triangle standing on its wide edge, and it is the only one in this set that is widest at the bottom.' + NL
        + 'THE ROOTS: EIGHT OR NINE of them, thick and uneven, spreading out and down in every direction, clotted with hanging earth. Three of them are lifted clear of the ground and reaching forward — those are the ones it hits with.' + NL
        + 'THE STUB at the top is snapped off jagged, no branches, no leaves. There is no tree left.' + NL
        + 'HELD IN THE KNOT, gripped by two roots that grew around it: A SKULL, upside down. One.' + NL
        + 'EARTH: clods hang off the underside of the ball at different lengths and stop in empty black.' + NL
        + 'EYES: none anywhere.',
        'settled wide and low on its root mass, three front roots lifted and curled back, the stub tilted. Braced, not resting.',
        'the sweep. The three lifted roots have lashed FORWARD together, stretched out long and low ahead of the mass, and the whole ball has leaned after them. Clods flung off.',
        'struck. The knot has burst open from the top, roots splayed outward in a fan, four of them snapped short. The skull has come free and is falling.',
        '- It fills about 56% of the cell height. It is WIDEST AT THE BOTTOM.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """**밑이 넓은 유일한 놈**입니다. 나머지는 전부 위로 서거나 균일한데, 이놈만
아래로 퍼진 삼각형이라 줄에 섞여도 바로 갈립니다.

나무가 남아 있으면 안 됩니다. 위쪽은 부러진 그루터기뿐이고 가지도 잎도
없습니다 — 뿌리만 남아서 돌아다니는 것이 이놈의 전부입니다.""",
    ),

    mob3(
        'pw_bark', '껍질갑옷', '근접 · 타락한 잔재들의 숲 19~20', '두껍다. 잘 안 죽는다.',
        'A tree that answered being cut by growing armour.' + NL
        + 'BODY: a THICK COLUMN, taller than wide, leaning but massive — the heaviest silhouette in this chapter.' + NL
        + 'THE PLATES ARE THE READ: SIX OR SEVEN slabs of bark, hard and STRAIGHT-EDGED, standing proud of the trunk and overlapping each other down the front and one shoulder. They are angular shapes on an otherwise round outline, and that contrast is the whole silhouette. One large plate at the top, the rest smaller and irregular.' + NL
        + 'THE LARGEST PLATE IS SPLIT across, and has been GROWN BACK TOGETHER — a hard ridge along the join.' + NL
        + 'BETWEEN TWO PLATES on the front, wedged where it could not be pushed out: A SPEARHEAD, snapped off at the socket.' + NL
        + 'THE GAPS between plates show soft dark rot underneath. That is the only soft part of it.' + NL
        + 'THE OPENING is a horizontal split between the two lowest plates, held apart, with FOUR HARD SPLINTERS inside.' + NL
        + 'ROOTS: four, short and thick, barely clear of the ground. It does not move far.' + NL
        + 'EYES: none. One knot-hole high on the trunk, half hidden behind the top plate.',
        'standing braced behind its plates, the top plate tilted forward like a shield, leaning into it. Immovable rather than resting.',
        'the shove. Driven forward with the plated side leading, the column compressed short and thick behind it, two straight speed lines. The plates do not deform.',
        'struck. Two plates have been knocked loose and are spinning away, the rot underneath torn open, the column buckled at the gap.',
        '- It fills about 64% of the cell height.' + NL
        + '- Cell 2 is the widest. Size the sheet from it.',
        """**딱딱한 판이 곡선 위에 얹힌 대비**가 실루엣의 전부입니다. 돌 슬라임
(`sg_stone`)과 같은 원리인데, 이쪽은 돌이 아니라 **나무껍질**이고 훨씬
큽니다.

판 사이 틈으로 물러 썩은 속이 보여야 합니다. 그게 이놈의 유일한 무른
부분이고, 갑옷이 통째가 아니라 **덧댄 것**이라는 표시입니다.""",
    ),

    mob3(
        'pw_branch', '가지창', '원거리 · 타락한 잔재들의 숲 16~17, 19', '멀리서 가지를 던진다. 무르고 아프다.',
        'A thin dead tree that throws its own branches.' + NL
        + 'BODY: TALL AND NARROW — the thinnest silhouette in this chapter, four times as tall as it is wide, standing nearly straight with only a slight lean.' + NL
        + 'THE BRANCHES ARE THE READ: SIX OR SEVEN long bare branches, no leaves, angled sharply UPWARD and back from the upper half of the trunk, all at different heights. They are straight hard lines coming out of the outline — the only thing in this chapter with straight lines radiating from it.' + NL
        + 'TWO OF THE BRANCHES are already broken off short, leaving pale stubs. It has been throwing them.' + NL
        + 'ONE BRANCH, the longest, is held FORWARD and level rather than up — cocked, ready to go.' + NL
        + 'LOW ON THE TRUNK, grown around and half swallowed: AN ARROW, snapped, only the fletching showing.' + NL
        + 'ROOTS: three stiff ones, braced. It stands its ground and does not walk over.' + NL
        + 'EYES: none. One narrow vertical crack high on the trunk.',
        'standing braced and still, branches raised and spread, the long one held forward and level. It holds its height — that stillness says it will not come over.',
        'the throw. The cocked branch HAS LEFT THE TRUNK and is in the air ahead of it, point-first, with two speed lines, and the trunk is bowed back from the recoil with a pale stub where the branch was.',
        'struck. The trunk has snapped partway up and folded over, three branches breaking loose and scattering, the roots half torn out.',
        '- It fills about 70% of the cell height and stands on the ground.' + NL
        + '- Cell 2 is the widest. Size the sheet from it.',
        """16~17 스테이지의 원거리입니다. 안 걸어오는 대신 체력이 낮고 더 아프게
때립니다.

**이 챕터에서 유일하게 직선이 뻗어 나오는 놈**입니다. 나머지는 두껍거나
뭉툭한데 이놈만 가늘고, 위로 뻗은 가지가 실루엣을 만듭니다.

가지 두 개는 **이미 부러져 있어야** 합니다 — 던지고 있다는 표시입니다.""",
    ),

    mob3(
        'pw_pod', '꼬투리나무', '원거리 · 타락한 잔재들의 숲 18~20', '멀리서 씨앗을 쏜다. 위가 무겁다.',
        'A tree that grew heavy seed pods and learned to aim them.' + NL
        + 'BODY: TOP-HEAVY. A medium trunk carrying a dense CLUSTER OF PODS at the top that is wider than the trunk is tall — it drags the whole thing over to one side.' + NL
        + 'THE PODS: SEVEN OR EIGHT, big and hard, hanging in a heavy bunch, each a different size. Two have already SPLIT OPEN and hang empty and gaping. The branch-thrower is narrow and straight; this one is wide and heavy at the top, and that is how the two ranged trees are told apart.' + NL
        + 'THE TRUNK below is bare and BENT under the load, curving away from the cluster.' + NL
        + 'CAUGHT IN THE CLUSTER, hanging among the pods where it was left: A CRACKED HELM, upside down. From a distance it reads as one more pod, which is the idea.' + NL
        + 'ROOTS: four, splayed and braced against the lean.' + NL
        + 'EYES: none.',
        'the cluster hung heavy and low to one side, pods still, the trunk bowed under them. The two empty pods gape.',
        'the volley. Three seeds HAVE LEFT the cluster and are in the air ahead of it, travelling together with speed lines, and the pods they came from hang split and swinging. The trunk has whipped back.',
        'struck. The cluster has burst apart, four pods torn loose and spinning away, seeds scattering, the trunk cracked at the bend.',
        '- It fills about 62% of the cell height and stands on the ground.' + NL
        + '- Cell 2 is the widest. Size the sheet from it.',
        """18~20 스테이지의 원거리입니다.

**가지창과 갈리는 것은 위쪽 무게입니다.** 가지창은 가늘고 곧고, 이놈은 위가
무겁고 기울어 있습니다 — 흑백 도트에서 둘을 가르는 것이 그것뿐입니다.

꼬투리 두 개는 **이미 벌어져 있어야** 합니다. 쏘고 있다는 표시입니다.""",
    ),
]


# ══ 식물 · 나무 우두머리 열 ════════════════════════════════════
#
# 11~20 스테이지. 판마다 하나씩이다.
#
# **네 칸짜리다.** 잡몹은 대기·공격·피격 셋인데 우두머리는 그 사이에 특수
# 동작이 하나 더 들어간다 — 전원을 휩쓸거나 한 명을 내려찍을 때 쓰는 그림
# (`core/autoBattle` 의 `BOSS_PATTERNS`). 슬라임 우두머리는 세 칸 그대로
# 두고, 없는 칸은 화면이 같은 시트의 `attack` 으로 떨어뜨린다.
#
# 잡몹과 갈리는 규칙은 `BOSS` 블록이 못 박는다 — 크기만 키우면 실패다.

FOES += [
    plantboss(
        'pb_bramble', '가시덤불 군체', '우두머리 · 11스테이지', '덤불 여럿이 하나로 뭉쳤다.', 'plant',
        'Every bramble in the clearing grew into one thing.' + NL
        + 'BODY: a WALL of tangled thorny canes, much WIDER than it is tall — half again as wide. The mob bramble is a ball you could step around; this one is a hedge you cannot.' + NL
        + 'IT IS MADE OF THREE LUMPS fused together at the base, each a different size, so the top edge is a jagged three-humped line rather than one dome. You can still see where the separate bushes were.' + NL
        + 'THORNS break the outline all the way round, longest along the top.' + NL
        + 'THREE OPENINGS, one per lump, at different heights — each a low gap in the canes lined with inward thorns. Where the mob has one mouth this has three, and they do not line up.' + NL
        + 'HELD IN THE TANGLE: a RIBCAGE in the big lump, a SKULL in the middle one, and a BROKEN SPEAR through the small one. Three things, one per lump — that is what says it ate three times over.' + NL
        + 'SCARS: two canes across the front are BURNT BLACK and snapped, grown around by new growth. Someone tried fire.',
        'settled wide and low, all three lumps still, the three openings turned different ways. It fills the width of the field and does not need to move.',
        'the lash. The middle lump has driven forward and a mass of canes is thrown out ahead of the hedge, stretched long and thin, thorns swept back. The outer lumps stay put — only the middle one commits.',
        'THE SWEEP. All three lumps rear UP together and the entire hedge unfolds into a wide arc that reaches across the whole cell, canes fanned out like a net thrown open. It is the widest cell by far. Six or seven broken thorns hang in the air clear of the outline.',
        'struck. The middle lump has burst open and the three are coming apart at the fused base, canes splayed, the skull knocked loose and falling.',
        58,
        """11스테이지 우두머리. 오염된 잔재들의 숲의 첫 관문입니다.

잡몹 가시덤불은 **공** 하나인데, 이놈은 **세 덩이가 붙은 울타리**입니다.
키운 게 아니라 다른 모양이어야 합니다 — 위 가장자리가 세 봉우리로 울퉁불퉁
해야 하고, 폭이 높이의 한 배 반입니다.

3번 칸(특수)이 제일 넓습니다. 세 덩이가 **한꺼번에 일어나 부챗살처럼**
펼쳐지는 순간이고, 그게 파티 전원을 한 번에 치는 그림입니다.""",
    ),

    plantboss(
        'pb_bloom', '아귀꽃 여왕', '우두머리 · 12스테이지', '꽃 여럿을 달고 다닌다.', 'plant',
        'The flower that all the other snapping flowers came off.' + NL
        + 'BODY: TOP-HEAVY AND HUGE. One thick trunk-like stem carrying a MAIN HEAD twice the size of a mob flower, and around it FOUR SMALLER HEADS on their own shorter stems, all growing from the same base.' + NL
        + 'THE MAIN HEAD is a deep cup of six heavy leathery lobes with EIGHT INWARD SPINES inside, long and uneven. The four small heads are the same shape, closed or half open, at different heights and facing different ways.' + NL
        + 'That cluster of five is the read: the mob is one head on one stem, this is a crowd of heads on one body, and the outline is lumpy and crowded rather than clean.' + NL
        + 'THE STEM is thick as a leg, bent hard under the load, with two heavy leaves low down.' + NL
        + 'HANGING FROM THE MAIN HEAD, gripped by two lobes: A SWORD, point down, most of the blade gone.' + NL
        + 'SCARS: the stem has been CUT THROUGH once and grown back — a thick swollen ring around the join.' + NL
        + 'ROOTS: a wide knot, splayed, lifting clear of the ground on one side.',
        'the main head hung forward and down, the four small heads turned outward around it like a watch being kept. Nothing moves and everything is aimed.',
        'the bite. The main head has whipped forward on its stem, thrown out ahead of the roots with the cup wide open and every spine showing. The four small heads trail behind, dragged along by the lunge.',
        'THE VOLLEY. The stem has REARED UP to full height and all five heads have opened at once, facing five different directions, the whole cluster spread wide like a hand. It is the tallest cell. Torn petals and one broken spine hang in the air.',
        'struck. The main head is wrenched open the wrong way, two lobes torn, and two of the small heads have snapped off their stems and are falling. The sword is gone.',
        72,
        """12스테이지 우두머리.

잡몹 아귀꽃은 **머리 하나**인데, 이놈은 **다섯**입니다. 큰 것 하나에 작은
것 넷이 같은 밑동에서 나옵니다 — 윤곽이 깔끔한 하나가 아니라 울퉁불퉁한
덩어리가 되어야 합니다.

3번 칸(특수)이 제일 높습니다. 다섯 머리가 **한꺼번에 벌어지는** 순간이라,
전원이 맞는 공격으로 읽힙니다.""",
    ),

    plantboss(
        'pb_creeper', '덩굴 어미', '우두머리 · 13스테이지', '길다. 끝이 안 보인다.', 'plant',
        'The root that every vine in this wood is a branch of.' + NL
        + 'BODY: ENORMOUSLY LONG AND LOW — it crosses the entire width of the cell and both ends run off past the edges. It has no visible start or end, which is the point: the mob vine is a rope you can see all of, and this one is not.' + NL
        + 'THE VISIBLE MIDDLE swells into a thick knotted MASS about a third of the way along, higher than the rest — that swelling is the part that is awake.' + NL
        + 'FROM THE SWELLING rise SIX TENDRILS, much thicker and far longer than a mob has, curling up and forward at different heights. Two are as tall as the swelling is wide.' + NL
        + 'THE OPENING is a long split down the top of the swelling, held apart, lined with SEVEN INWARD SPINES. It runs lengthwise, not across.' + NL
        + 'CAUGHT ALONG THE LENGTH, spaced out: A SKULL near one edge, a RIBCAGE in the swelling, and A BOOT still laced, further along. Three, spread out — they mark how far it reaches.' + NL
        + 'SCARS: the rope is SEVERED CLEAN just before the left edge and has grown back across the gap in a knotted lump. Someone cut it and it did not stop.',
        'lying long and still across the field, the six tendrils raised and curling slowly, the split along the swelling half open. It reads as ground that has not noticed you yet.',
        'the whip. Two tendrils have lashed forward together, stretched thin and long out ahead of the swelling, and the whole rope has been dragged after them so the swelling is off centre.',
        'THE CAGE. All six tendrils have shot UP AND OUTWARD at once, arching high and curving inward at the tips, so the creature encloses the whole width and height of the cell. It is by far the widest and tallest cell. Torn leaves and two snapped tendril tips hang clear in the air.',
        'struck. The swelling has split open along the top and three tendrils are torn off, the rope buckled into a kink. The ribcage shows through the gash.',
        54,
        """13스테이지 우두머리. **높이가 아니라 길이로 큽니다.**

칸의 높이를 54%만 쓰지만 **가로는 칸을 넘어갑니다** — 양쪽 끝이 칸 밖으로
빠져나가서 어디서 시작하고 끝나는지 안 보여야 합니다. 잡몹 덩굴손은 전부
보이는 밧줄이고, 이놈은 안 보입니다.

3번 칸(특수)에서 덩굴손 여섯이 **위로 솟아 우리처럼 감쌉니다.** 칸 전체를
씁니다.""",
    ),

    plantboss(
        'pb_spore', '홀씨 기둥', '우두머리 · 14스테이지', '높다. 사방으로 홀씨를 뿌린다.', 'plant',
        'A spore stalk that never stopped growing upward.' + NL
        + 'BODY: A TOWER. Far taller than anything else in this chapter — a single thick column, straight and vertical, with the pod cluster at the very top. It is the tallest silhouette in the set and that alone identifies it.' + NL
        + 'THE CROWN: not one pod but SEVEN, packed into a heavy head at the top, each a different size, three already split open and gaping. The mob has one pod; this has a head full of them.' + NL
        + 'THE COLUMN is ringed at three heights by collars of dead frayed growth, like places it stopped and started again.' + NL
        + 'GROWN INTO THE COLUMN at eye height, the wood swollen around it: A SKULL, facing out, half absorbed.' + NL
        + 'SCARS: one long split runs a third of the way up the column, closed over and ridged.' + NL
        + 'THE BASE: five stiff roots braced wide. IT DOES NOT WALK — it stands and throws, and the width of that base is what says so.' + NL
        + 'EYE: ONE, a hard slit set low in the column, far below the crown.',
        'standing tall and straight, the crown still, three split pods gaping. A few loose spores drift down past the column. It has not moved and it does not need to.',
        'the burst. The crown has CLENCHED — pulled in narrow — and a tight clump of spores is LEAVING it, clear of the body, with two speed lines. The column is bowed slightly back.',
        'THE FALL. The entire column has BENT OVER FORWARD from the base like a felled tree, the crown swung down and out to the far side of the cell, and every one of the seven pods has burst at once — eight or nine loose spore clumps hang in the air along the arc. It is the widest cell.',
        'struck. The column has snapped a third of the way up and folded, the crown hanging upside down, four pods torn loose and spilling.',
        88,
        """14스테이지 우두머리. **세트에서 제일 높습니다.**

칸 높이의 88%를 씁니다. 다른 무엇보다 높다는 것 하나로 알아볼 수 있어야
합니다 — 잡몹 홀씨대를 그대로 키운 게 아니라, 꼭대기에 **꼬투리 일곱**이
뭉친 머리가 얹혀 있습니다.

3번 칸(특수)에서 **기둥이 통째로 앞으로 넘어갑니다.** 서 있던 것이 쓰러지는
그림이라 높이 차이가 그대로 위력이 됩니다.""",
    ),

    plantboss(
        'pb_carrion', '시체꽃', '우두머리 · 15스테이지', '오염된 잔재들의 숲의 끝. 이 숲이 먹은 것이 전부 여기 있다.', 'plant',
        'The bloom this whole wood was feeding.' + NL
        + 'BODY: a single ENORMOUS FLOWER opened flat and facing forward — the widest thing in this chapter, nearly filling the cell. Five heavy lobes spread open around a deep dark centre.' + NL
        + 'IT IS THE ONLY THING HERE THAT FACES YOU. Every other plant in the wood is seen from the side; this one has turned to look, and the flat open disc of it is a shape nothing else in the set has.' + NL
        + 'THE CENTRE is a deep pit ringed with NINE INWARD SPINES, long and uneven, three snapped. You cannot see the bottom of it.' + NL
        + 'THE LOBES are ragged at the edges and sag under their own weight, the lower two drooping almost to the ground.' + NL
        + 'AROUND THE RIM, held between the lobes where they meet: A SKULL, A HELM, and A SWORD HILT — evenly spaced, like things set out. This is the one place in the set where more than one is allowed; it is the end of the chapter and it has eaten all of it.' + NL
        + 'SCARS: two lobes have been CUT THROUGH and grown back, thick ridges across them.' + NL
        + 'THE STEM behind is short and thick, and the ROOTS spread wide and low.' + NL
        + 'EYES: none. It does not need them.',
        'opened flat and facing you, lobes spread and sagging, the pit black and still. Nothing moves. That stillness, at this size, is the whole idea.',
        'the snap. The five lobes have FOLDED IN toward the centre like a closing hand, the whole flower pulled into a fist half its open width, the spines meshed together. It has caught something.',
        'THE BLOOM. Every lobe thrown back FLAT AND WIDE past where they should go, the pit opened to its full depth and every spine standing out from the rim, so the creature is a huge open ring filling the cell edge to edge. It is the widest cell. A cloud of loose spores hangs clear all round it.',
        'struck. Three lobes torn half off and curling back, the rim broken open on one side, the helm and the sword hilt knocked loose and falling.',
        80,
        """15스테이지 우두머리. **오염된 잔재들의 숲의 끝**입니다.

**정면을 보는 유일한 놈**입니다. 이 챕터의 나머지는 전부 옆에서 본 모습인데
이놈만 몸을 돌려 이쪽을 봅니다 — 활짝 벌어진 원반은 세트의 다른 무엇과도
안 겹치는 실루엣입니다.

삼킨 것을 **셋** 둡니다. 다른 놈들은 하나뿐인데(더 두면 장식처럼 보여서),
챕터의 끝이고 이 숲이 먹은 것을 전부 안고 있다는 뜻이라 여기서만 예외입니다.

3번 칸(특수)에서 꽃잎이 **뒤로 완전히 젖혀지며** 칸을 가득 채웁니다.""",
    ),

    plantboss(
        'pb_stump', '늙은 그루터기', '우두머리 · 16스테이지', '아주 오래됐다. 아주 두껍다.', 'wood',
        'The stump of a tree that was old before the wood was.' + NL
        + 'BODY: a MASSIVE drum of cut trunk, three times the width of a mob stump and half again as tall, cut flat across the top and TILTED hard to one side.' + NL
        + 'THE CUT TOP shows FOUR concentric rings — no more; at this size more turns to grey mush.' + NL
        + 'THREE AXES ARE IN IT, not one: buried at different points around the cut edge, all rusted, all with their hafts snapped off. Three separate attempts, none of them enough.' + NL
        + 'GROWING OUT OF THE CUT TOP: five or six thin dead SHOOTS, bare, at odd angles. It tried to come back.' + NL
        + 'SCARS: one deep vertical split down the front, closed over and ridged.' + NL
        + 'ROOTS: SEVEN, enormous, splayed far wider than the drum, clotted with earth, two of them lifted and reaching forward.' + NL
        + 'EYES: none. THREE knot-holes across the front at different heights, black through.',
        'standing heavy and tilted, roots set wide, the three axe heads catching along the rim. It has not moved yet and it does not look like it will move fast.',
        'the stamp. It has heaved forward onto two front roots, the drum thrown ahead of the base, the back roots dragged clear of the ground. Clods in the air below.',
        'THE QUAKE. It has REARED UP onto its back roots so the whole drum is lifted high and tipped forward, all the front roots raised and spread, about to come down. It is the tallest cell by a long way. Six or seven clods and two broken shoots hang in the air beneath it.',
        'struck. The drum has split from the cut top down through the front knot-hole, the crack running deep, three roots torn out, one axe knocked free.',
        62,
        """16스테이지 우두머리. 타락한 잔재들의 숲, 그 첫 관문입니다.

잡몹 그루터기에 도끼가 **하나** 박혀 있다면 이놈에게는 **셋**입니다. 세 번
시도했고 세 번 다 모자랐다는 뜻입니다.

3번 칸(특수)에서 **뒷뿌리로 곧추서서 몸통을 들어 올립니다.** 내려찍기 직전의
자세이고, 이 칸이 제일 높습니다.""",
    ),

    plantboss(
        'pb_hollow', '속 빈 거인', '우두머리 · 17스테이지', '구멍이 사람만 하다.', 'wood',
        'A hollow tree big enough to walk into, that walks instead.' + NL
        + 'BODY: a HUGE leaning trunk, twice the height of a mob and much thicker, tipped well off vertical.' + NL
        + 'THE HOLE IS THE READ, and it is enormous — it goes CLEAN THROUGH the trunk and is nearly HALF the width of the body, tall enough for a person. Black shows through it. This is the strongest shape in the chapter; protect it above everything.' + NL
        + 'THE RIM is splintered inward all the way round with EIGHT LONG SPLINTERS pointing in toward the middle, uneven, three snapped.' + NL
        + 'INSIDE THE HOLE, wedged across it and filling part of the gap: A WHOLE RIBCAGE, upright, one side broken away. It hangs there in every cell.' + NL
        + 'THE TOP is snapped off at a hard angle with four splinters standing up.' + NL
        + 'SCARS: a second, smaller hole low on the trunk has been GROWN OVER — a puckered ring of scar wood where a hole used to be.' + NL
        + 'ROOTS: five, splayed and uneven, one far longer and reaching forward.' + NL
        + 'EYES: none. Four knot-holes above the big hole, uneven, black.',
        'standing tilted and still, the great hole facing you with the ribcage in it. The stillness at this size is what makes it read as waiting.',
        'the swing. The whole trunk has come forward from the roots like a falling post, the hole thrown ahead and its splinters closing inward across the gap.',
        'THE ROAR. The trunk has arched BACK and OPENED — the hole is stretched wide and round, every splinter flared outward from the rim like a mouth thrown open, and the ribcage inside is pushed forward. It is the widest cell. Six splinters and a cloud of dust hang clear in the air around it.',
        'struck. The trunk has cracked across at the hole, the opening torn into a crooked gash, the upper half folding over. The ribcage is falling out.',
        78,
        """17스테이지 우두머리.

잡몹 속 빈 나무의 구멍이 몸통의 3분의 1이라면, 이놈은 **절반**입니다.
사람이 걸어 들어갈 만한 크기라야 하고, 그 안에 **갈비뼈 한 벌이 통째로**
걸려 있습니다.

3번 칸(특수)에서 구멍이 **넓게 벌어지며 가시가 사방으로 젖혀집니다** — 입을
벌린 것처럼 보여야 합니다. 이 칸이 제일 넓습니다.""",
    ),

    plantboss(
        'pb_thornwood', '가시나무', '우두머리 · 18스테이지', '가지가 전부 창이다.', 'wood',
        'A dead tree whose every branch sharpened itself.' + NL
        + 'BODY: a tall trunk leaning hard, carrying TWELVE OR MORE long bare branches that radiate out in every direction — up, out and DOWN. The mob branch-thrower has six and they all point up; this one is a star of spikes and the outline breaks in every direction.' + NL
        + 'EVERY BRANCH TAPERS TO A POINT. They are straight hard lines, different lengths, the longest as long as the trunk is tall.' + NL
        + 'FOUR ARE ALREADY BROKEN, leaving pale stubs on the trunk.' + NL
        + 'THREE ARE HELD FORWARD AND LEVEL, cocked together — that is the read of what it does.' + NL
        + 'IMPALED ON ONE OF THE LOWER BRANCHES, slid halfway down it: A SKULL. It has been there long enough that the wood has grown through the eye socket.' + NL
        + 'SCARS: the trunk has been split lengthwise and bound back together by its own growth, a ridge running its height.' + NL
        + 'ROOTS: four, braced. It stands its ground.' + NL
        + 'EYES: none. One long vertical crack up the trunk.',
        'standing braced and still, branches out in every direction, the three cocked ones held level and forward. The skull hangs where it always hangs.',
        'the throw. One cocked branch HAS LEFT the trunk and is in the air ahead, point-first with two speed lines, and the trunk is bowed back with a fresh pale stub where it was.',
        'THE VOLLEY. SIX branches have left at once and are in the air spread across the whole cell in a fan, all point-first, all at different angles, and the trunk is bent hard back from the recoil with six pale stubs on it. It is the widest cell and most of it is the branches in flight.',
        'struck. The trunk has snapped partway up and folded over, five branches breaking loose and scattering. The skull has slid off its branch and is falling.',
        74,
        """18스테이지 우두머리.

잡몹 가지창은 가지가 여섯이고 전부 위를 향하는데, 이놈은 **열둘 이상이
사방으로** 뻗습니다 — 위·옆·아래 전부입니다. 별처럼 보여야 합니다.

3번 칸(특수)에서 **여섯 개가 한꺼번에 날아갑니다.** 칸의 대부분이 날아가는
가지이고, 그게 전원을 치는 공격으로 읽힙니다.""",
    ),

    plantboss(
        'pb_rot', '썩은 거목', '우두머리 · 19스테이지', '거의 다 썩었다. 그래서 더 크다.', 'wood',
        'A great tree so far gone that the rot is holding it together.' + NL
        + 'BODY: ENORMOUS AND SAGGING — the widest and heaviest thing in the chapter, a bloated trunk that bulges out at the middle past its own base and slumps over to one side at the top.' + NL
        + 'IT IS FALLING APART AND STILL STANDING. Three deep SPLITS run down it at different angles, wide enough to see black through, and the wood between them is soft and swollen rather than hard.' + NL
        + 'HANGING OFF IT: six or more long strands of rotted fibre from the underside and the slumped side, different lengths, stopping in empty black.' + NL
        + 'MUSHROOM SHELVES: five hard flat brackets growing out of the trunk at different heights, the only straight-edged shapes on it. They stand out from the outline.' + NL
        + 'SUNK INTO THE SOFT WOOD, half swallowed and clearly visible: A HELM. One.' + NL
        + 'SCARS: the largest split has been GROWN ACROSS by a thick rope of new wood, holding the two halves together like a stitch.' + NL
        + 'ROOTS: six, splayed and half rotted, two collapsed under the weight.' + NL
        + 'EYES: none. Two deep holes where brackets fell off.',
        'standing bloated and slumped, strands hanging long and still, the brackets catching along its side. It looks like it should have fallen already.',
        'the fall. It has toppled FORWARD from the base, the whole mass stretched long as it goes, strands and two brackets flung out ahead of it.',
        'THE BURST. The trunk has swollen and SPLIT OPEN along all three cracks at once, the halves forced apart so the creature is much wider than it stands, and a cloud of rot and eight or nine loose fragments hangs clear in the air around it. It is the widest cell.',
        'struck. The bloated middle has burst and collapsed inward, two brackets snapped off, the top half folding over sideways. The helm is falling out.',
        84,
        """19스테이지 우두머리. **제일 넓고 제일 무겁습니다.**

`STANDS` 규칙대로 **서 있되 제 무게에 지고 있어야** 합니다 — 가운데가 밑보다
옆으로 불거지고 위가 한쪽으로 흘러내립니다. 눕히면 안 됩니다.

세로로 갈라진 틈 셋으로 검은 배경이 비쳐야 하고, 그중 제일 큰 것은 새 나무가
**꿰맨 것처럼** 가로질러 붙잡고 있습니다.

3번 칸(특수)에서 그 틈 셋이 **한꺼번에 벌어집니다.**""",
    ),

    plantboss(
        'pb_elder', '숲의 어른', '우두머리 · 20스테이지', '이 숲이 자란 자리에 원래 있던 것.', 'wood',
        'The thing the whole forest grew out from.' + NL
        + 'BODY: the LARGEST creature in the game so far — a vast trunk filling most of the cell, leaning, its top broken off flat above the frame so you cannot see where it ends.' + NL
        + 'IT CONTAINS THE CHAPTER. Grown into the trunk at different heights and clearly visible: A SMALLER STUMP, A BRACKET OF MUSHROOMS, A KNOT OF THORN BRANCHES, and A HOLLOW WITH A RIBCAGE IN IT. Each recognisable as one of the mobs, absorbed into it. This is the one place more than one is allowed — it is the end of the chapter.' + NL
        + 'THE FACE, AND IT IS NOT A FACE: a single vast HOLLOW low on the front, wider than a person, ringed with TEN LONG SPLINTERS pointing inward. Everything it took went in there.' + NL
        + 'DEEP INSIDE THE HOLLOW, small and hard and far back: ONE PALE LIGHT. That is the only thing in this chapter that could be called an eye, and it is barely one.' + NL
        + 'THE ROOTS: NINE, enormous, splayed across the whole base and lifting the trunk clear of the ground at the front. Earth and stones hang off them.' + NL
        + 'SCARS: four long healed splits up the flanks, each closed over and ridged. Everything in this wood has already tried.',
        'standing vast and leaning, the great hollow turned toward you, the pale light deep inside it. Nothing moves. It has been here longer than the forest.',
        'the reach. Three front roots have torn UP out of the ground and lashed forward ahead of the trunk, stretched long, earth falling from them, and the whole mass has leaned after them.',
        'THE WAKING. The trunk has straightened to its full height for the first time and ALL NINE ROOTS have come up out of the ground at once, spread wide beneath it, so the creature is lifted clear and fills the cell corner to corner. The hollow is stretched open and the pale light inside it is bright. It is by far the largest cell. A dozen clods, stones and splinters hang clear in the air.',
        'struck. The trunk has cracked from the hollow upward, the split running out of frame, four roots torn away and the whole mass tipping sideways. The absorbed stump has broken loose.',
        92,
        """20스테이지 우두머리. **지금까지 중 제일 큽니다.**

칸 높이의 92%를 쓰고, 위쪽은 **잘려 나가도 됩니다** — 어디서 끝나는지 안
보이는 편이 더 큽니다.

**챕터를 통째로 안고 있습니다.** 그루터기 하나, 버섯 선반, 가시가지 뭉치,
갈비뼈가 든 구멍 — 넷이 몸에 박혀서 각각 알아볼 수 있어야 합니다. 삼킨 것을
하나만 두는 규칙의 유일한 예외가 시체꽃과 이놈입니다.

**눈이라 할 만한 것이 이 챕터에 딱 하나 있는데** 그게 이놈의 구멍 깊숙한
곳에 있는 창백한 빛입니다.

3번 칸(특수)에서 **뿌리 아홉이 전부 땅에서 올라오고** 몸통이 처음으로
곧게 섭니다. 칸을 모서리까지 채웁니다.""",
    ),
]


# ══ 21~30 · 벌레 · 군체 ═══════════════════════════════════════
#
# 앞의 두 챕터와 **가르는 축이 다르다.** 슬라임은 덩어리의 모양으로, 식물·나무는
# 어디가 뻗었나로 갈랐다. 여기는 **몸이 어느 쪽으로 길고 다리가 어디에 있나**다.
#
#   낮고 길다              갉는 유충 · 걷는 허물
#   뒷다리가 등보다 높다    뛰는 여치
#   넓적한 판이 덮였다      뱉는 노린재 · 병정개미
#   다리가 몸보다 길다      실 잣는 새끼 · 쏘는 각다귀
#   날개가 몸보다 넓다      못 깬 일벌
#
# 다섯 축에 아홉이라 둘씩 겹치는 자리가 있는데, 겹치는 둘은 **다른 챕터**에
# 둔다 (유충은 21~25, 허물은 26~30). 한 화면에 같이 서지 않으면 안 헷갈린다.

FOES += [
    mob3(
        'sw_grub', '갉는 유충', '근접 · 침식지 21~25',
        '기어와서 입판으로 갉는다. 이 지역의 기본형이다.',
        'A grub that has been eating since before anything else here hatched.' + NL
        + 'BODY: LOW AND LONG — it lies along the ground and reaches forward, about '
        'two and a half times as long as it is tall. It is the FLATTEST silhouette '
        'of this chapter and every other insect here is measured against it.' + NL
        + 'SEGMENTS: EIGHT fat rings, each pinched deeply from the next so the '
        'outline is a row of bumps along the top and the bottom. That bumpy edge is '
        'the whole read — nothing else in the chapter has a repeating scalloped '
        'outline.' + NL
        + 'THE BREACH — this one: between the FOURTH and FIFTH segment rings on the upper side, the two plates have been forced apart and the growth has come up between them, lifting the fifth ring visibly higher than the fourth so the row of bumps along the back has a WRONG STEP in it.' + NL
        + 'THE REPLACED PART: the rear pair of prolegs is gone. In its place, one straight angular shaft comes down from the body and ends flat on the ground — it does not grip and it does not bend.' + NL
        + 'LEGS: six tiny hooked pairs bunched under the front third, and four '
        'fleshy prolegs gripping at the back. All of them are short — it drags more '
        'than it walks.' + NL
        + 'HEAD: a small hard capsule at the front, with TWO mouth plates opening '
        'SIDEWAYS, each ridged with four grinding teeth. The head is the only hard '
        'part and it is a fifth of the body.' + NL
        + 'EYES: four dull dots in a row on each side, tiny and almost lost in the '
        'plate.' + NL
        + 'THE OLD SKIN: one split hollow ring hangs off the third segment, dry and '
        'empty, dragging behind.' + NL
        + 'SILHOUETTE (protect this): a long low row of bumps with a small hard '
        'head at one end. Flat, segmented, and going one way.',
        'at rest, stretched along the ground, head lowered and mouth plates apart. '
        'The rear segments are bunched up slightly, as if it stopped mid-crawl. The '
        'old skin ring trails. Nothing is raised.',
        'the gnaw. The front third has HUMPED UP off the ground and driven forward, '
        'mouth plates swung to their widest, while the back half stays flat and '
        'anchored. It is a caterpillar\'s push — the body shortens and the head goes '
        'out. Two prolegs have come off the ground.',
        'struck. The body has been knocked into a broken curve, three segments '
        'crushed narrower than their neighbours, two prolegs torn away. The head is '
        'twisted onto its side and one mouth plate hangs loose. The old skin ring '
        'has been ripped off and is falling clear.',
        '- It fills about 45% of the cell height. It is the LOWEST and LONGEST of '
        'this chapter.' + NL
        + '- Cell 2 is the tallest (the humped push). Size the sheet from it.',
        """이 지역의 첫 잡몹이자 기본형입니다. 나머지 넷이 전부 이놈과의 차이로
설명됩니다 — 여치는 뒷다리가 높고, 노린재는 넓적하고, 새끼거미는 다리가
깁니다.

**마디 여덟의 오돌토돌한 윤곽이 전부입니다.** 45px 에서 남는 것이 그것뿐이고,
그 반복이 "벌레" 를 말합니다. 매끈하게 그리면 슬라임(1~10)과 겹칩니다.

물기가 있으면 안 됩니다. 방울도 흘러내림도 그리지 마세요 — 그건 슬라임 장의
것입니다. 이쪽은 마르고 딱딱하고 먼지가 납니다.""",
    ),

    mob3(
        'sw_hopper', '뛰는 여치', '근접 · 침식지 21~25',
        '접힌 뒷다리로 튀어 들어와 부딪힌다.',
        'A bush cricket that stopped being able to land quietly.' + NL
        + 'BODY: a compact trunk held at a forward slant, not much longer than it is '
        'tall — the SMALLEST body of the chapter. Everything about this creature is '
        'in its legs.' + NL
        + 'HIND LEGS: ONE enormous pair, folded into a tight Z that stands HIGHER '
        'THAN ITS OWN BACK, the thigh as thick as the whole trunk. This is the read '
        'and it must be unmistakable at 45 pixels: a small body with two big folded '
        'triangles standing above it.' + NL
        + 'FRONT LEGS: two small hooked pairs under the chest, almost incidental.' + NL
        + 'WINGS: a short hard pair folded flat along the back, reaching only '
        'halfway down the body, one torn at the tip. Too small to fly on.' + NL
        + 'THE BREACH — this one: the left hind thigh, the thickest part of the animal, has split down its outer face and the growth fills the crack along its whole length, so that leg reads as CRUSTED where the right one is smooth.' + NL
        + 'THE REPLACED PART: one of the two long antennae is not a feeler any more — it is a straight rigid rod of the same faceted material, unbending, sticking out at the wrong angle while the real one trails back.' + NL        + 'HEAD: angled down, with two mouth plates opening sideways and two very '
        'long thin ANTENNAE swept back over the body, together longer than the '
        'creature is. One is snapped to half length.' + NL
        + 'EYES: two compound domes on the sides of the head, pitted with a coarse '
        'grid, the larger one clouded.' + NL
        + 'SILHOUETTE (protect this): a small body with two folded Z-shaped legs '
        'towering over it and two long feelers trailing back.',
        'crouched and loaded. The hind legs are folded to their tightest, knees at '
        'their highest point, body low between them and tilted forward. The antennae '
        'are laid back flat. It has not moved and it is entirely about to.',
        'the leap, at its start. The hind legs have SNAPPED STRAIGHT — both fully '
        'extended down and back, longer than the body twice over — and the trunk has '
        'been thrown UP AND FORWARD off the ground, head first, front legs reaching. '
        'The antennae have whipped forward past the head. It is the TALLEST cell of '
        'the sheet and the creature is clear of the ground.',
        'struck in mid-air. The trunk has been knocked sideways and is tumbling, one '
        'hind leg snapped backwards at the knee and hanging by the joint, the other '
        'still half extended. Both wings are folded the wrong way. One antenna is '
        'gone entirely.',
        '- It fills about 48% of the cell height in the idle cell — measured to the '
        'top of the FOLDED KNEES, which are the highest point.' + NL
        + '- Cell 2 is much taller. Size the sheet from it.',
        """이 지역에서 **유일하게 땅을 떠나는 잡몹**입니다.

접힌 뒷다리의 Z 자가 등보다 높이 서 있어야 합니다. 그 하나로 유충(낮고 길다)
· 노린재(넓적하다)와 갈립니다.

2번 칸에서는 다리가 완전히 펴져 몸이 공중에 떠 있어야 합니다. 접힌 것과 펴진
것의 차이가 이 놈이 하는 일 전부입니다 — 애매하게 반쯤 펴면 두 칸이 같아
보입니다.""",
    ),

    mob3(
        'sw_spitter', '뱉는 노린재', '원거리 · 침식지 21~25',
        '뒷줄에 서서 산을 뱉는다. 앞으로 안 나온다.',
        'A shield bug that solved every problem by spraying it.' + NL
        + 'BODY: a broad flat SHIELD — a wide rounded triangle seen from above and '
        'behind, WIDER THAN TALL, coming to a blunt point at the tail. The whole '
        'upper surface is ONE hard plate with a raised ridge down the middle and '
        'two shallow ridges either side of it. It is the WIDEST and FLATTEST '
        'silhouette of the chapter.' + NL
        + 'THE PLATE IS THE READ. Nothing else here is a single broad slab; the '
        'others are chains of segments. Keep the outline of that slab clean and '
        'unbroken — the legs stick out from under it, they never break its edge.' + NL
        + 'THE BREACH — this one: a wedge has been broken out of the rim of the shield plate on the right side, and the growth has come up through the hole and stands above the plate — the only thing that breaks that clean slab outline anywhere.' + NL
        + 'THE REPLACED PART: one of the two eye domes at the front corners is a blind faceted lump. The other is a normal pitted dome. They do not match and that mismatch is on the side you see first.' + NL        + 'LEGS: three pairs, short and splayed, poking out from beneath the plate '
        'at the sides. One is a healed stump.' + NL
        + 'HEAD: small and mostly hidden under the front of the plate. From it, a '
        'short thick ROSTRUM — a hard downward-pointing beak, blunt, a third of the '
        'body length, hinged where it meets the head so it can swing forward.' + NL
        + 'EYES: two small domes at the front corners of the plate, wide apart.' + NL
        + 'ANTENNAE: two short segmented feelers held forward and down.' + NL
        + 'SCARS: the plate has two chips out of its rim and one puncture near the '
        'tail, healed from beneath.',
        'settled flat, plate level, legs splayed and gripping, rostrum folded back '
        'under the head. It looks like a stone with legs. Nothing about it says it '
        'can reach you.',
        'the spray. The front of the plate has TIPPED UP so the body stands at a '
        'steep angle, and the rostrum has swung FORWARD and levelled — pointing out '
        'of the cell, not down. From its tip, a fan of six or seven separate small '
        'solid flecks is thrown forward and up, biggest near the tip, thinning '
        'outward, stopping well inside the cell. The back legs are braced.',
        'struck. The plate has been split from the rim inward along one of its side '
        'ridges and the halves have lifted apart, showing a hand-width of soft dark '
        'seam. The body has flipped onto its edge; three legs claw at nothing. The '
        'rostrum is bent off to one side.',
        '- It fills about 42% of the cell height and is the WIDEST of the chapter — '
        'about half again as wide as it is tall.' + NL
        + '- Cell 2 is the tallest (the tipped-up spray). Size the sheet from it.'
        + NL
        + '- The thrown flecks are separate solid shapes with black between them. '
        'Never a cloud, never a gradient, never a connected stream.',
        """이 지역의 **첫 원거리**입니다. 뒷줄에 서서 앞으로 안 나옵니다.

**넓적한 판 하나가 이 놈의 전부입니다.** 다른 벌레들은 마디가 이어진 사슬인데
이놈만 한 장짜리 슬래브입니다. 다리는 판 아래에서 삐져나오고 판의 윤곽을 절대
안 건드립니다 — 건드리면 그 대비가 사라집니다.

뱉는 것은 낱개 조각으로 그립니다. 이어진 물줄기로 그리면 흑백에서 흰 막대가
되고, 뱉는 것인지 찌르는 것인지 알 수 없습니다.""",
    ),

    mob3(
        'sw_weaver', '실 잣는 새끼', '원거리 · 침식지 21~25',
        '뒷줄에서 실을 던진다. 아라크네스가 낳은 것들이다.',
        'One of the queen\'s brood, hatched early and already too big.' + NL
        + 'BODY: TINY compared to its legs — two small masses at a narrow waist, '
        'together no more than a third of the creature\'s span. The abdomen is a '
        'plain rounded sac; the front is a small hard plate.' + NL
        + 'THE BREACH — this one: the abdomen sac has split across its underside and the growth hangs out of it in a heavy cluster, dragging the whole body lower between the legs than it should hang.' + NL
        + 'THE REPLACED PART: one of the eight legs is a straight angular shaft from the knee down, with no second bend and no hook. It is the only straight line in a creature made of curves.' + NL        + 'LEGS: FOUR pairs, LONG — each one two to three times the length of the '
        'body, folding UP above the body before coming down, so the knees stand '
        'well HIGHER THAN THE BACK and the body hangs slung between them. The leg '
        'span is the silhouette; the body is almost an afterthought. Two legs are '
        'shorter than the others and one ends in a stump.' + NL
        + 'THAT IS THE READ: a wide cage of thin bent lines with a small heavy blob '
        'hanging in the middle of it. Nothing else in the chapter is mostly empty '
        'space.' + NL
        + 'HEAD: a bank of SIX eyes in two uneven rows, all the same dull dome, '
        'taking up most of the front plate. Two short fangs fold down and inward.' + NL
        + 'SPINNERETS: three short nozzles at the abdomen tip, with TWO thick '
        'strands already hanging from them into empty black and ending there.' + NL
        + 'IT IS A JUVENILE: the plates are thin and the joints are pale where they '
        'have not hardened. One old skin, split down the back, hangs off the '
        'abdomen.',
        'standing high on its folded legs, body slung low between them, fangs '
        'folded, the two strands hanging straight down. It is the widest EMPTY '
        'silhouette of the chapter — mostly black between the legs.',
        'the throw. The abdomen has swung UP and FORWARD over the front plate, the '
        'spinnerets aimed out of the cell, and from them a BUNDLE of four heavy '
        'strands has been fired forward as a narrow fan converging to a point '
        'beyond the body — stopping well short of the cell edge. Two front legs are '
        'raised and reaching; the back four are braced wide.',
        'struck. Three legs have folded the wrong way at the knee and the body has '
        'dropped between them onto the ground, abdomen split along one side. The '
        'strands have gone slack and are falling in loose curls. Two eyes are '
        'dulled over.',
        '- It fills about 50% of the cell height measured to the top of the KNEES, '
        'which stand above the body.' + NL
        + '- Its span is wide but MOSTLY EMPTY — the black between the legs is part '
        'of the shape and must be preserved, not filled in.' + NL
        + '- Cell 2 is the tallest. Size the sheet from it.',
        """25판 우두머리(아라크네스)가 낳은 것들입니다. 그 놈의 등에 붙어 있는
새끼 여섯과 **같은 생김새**여야 합니다 — 여기서 미리 만나 두면 우두머리 등에
붙은 것이 무엇인지 바로 압니다.

**다리 사이의 검은 부분이 그림의 일부입니다.** 이 놈은 이 지역에서 유일하게
속이 비어 있습니다. 채우면 그냥 덩어리가 되고, 45px 에서 노린재와 안 갈립니다.

새끼라는 것이 보여야 합니다 — 판이 얇고 관절이 아직 안 굳었습니다.""",
    ),

    mob3(
        'sw_soldier', '병정개미', '근접 · 둥지 26~30',
        '턱으로 물어 끊는다. 둥지의 기본형이다.',
        'A soldier caste bred for one job, kept long after the job ended.' + NL
        + 'BODY: THREE hard masses joined at two narrow waists — head, thorax, '
        'abdomen — held low and forward. The waists are the read: two places where '
        'the outline pinches almost to nothing. Nothing else in the region has that.'
        + NL
        + 'THE HEAD IS TOO BIG. It is nearly the size of the abdomen and it is '
        'armoured heavier than the rest — a broad squared capsule that carries TWO '
        'enormous MANDIBLES, each as long as the head itself, curved and toothed '
        'along the inner edge, opening SIDEWAYS to a spread wider than the body. '
        'The head and jaws together are half the creature.' + NL
        + 'THE BREACH — this one: the FRONT WAIST, the narrowest point of the animal, has split all the way round and the growth fills that gap like a collar — the head and the thorax are no longer joined by the animal, they are joined by the thing in it.' + NL
        + 'THE REPLACED PART: the broken left mandible has not healed. Its missing tip has been replaced by a straight faceted point, longer and thinner than the right mandible\'s curve, and it does not close against it.' + NL        + 'LEGS: three pairs, thick and short, braced wide, each bending up then '
        'down, each ending in a two-part hook. Built to hold ground.' + NL
        + 'EYES: two small dull domes far back on the head, almost vestigial — this '
        'one works by touch.' + NL
        + 'ANTENNAE: two elbowed feelers, bent sharply at their midpoint, held '
        'forward. One is snapped past the elbow.' + NL
        + 'SCARS: the left mandible has its tip broken square off. The thorax has '
        'three punctures healed over.',
        'braced low, all six legs planted, mandibles held half open and level, head '
        'lowered. The two waists show clearly. It is not moving and it is not '
        'relaxed.',
        'the bite. The head has driven FORWARD on a stretched front waist and the '
        'mandibles have swung to their FULL spread, wider than the body — the widest '
        'opening in the chapter. The thorax and abdomen have barely moved; only the '
        'front third is committed. Two front legs are off the ground.',
        'struck. The front waist has been crushed and the head has dropped and '
        'turned aside, one mandible torn off at the base and falling. Two legs have '
        'buckled. The abdomen is split along one band and the plates gape.',
        '- It fills about 46% of the cell height.' + NL
        + '- Cell 2 is the widest (the full mandible spread). Size the sheet from it.',
        """26~30 의 기본형입니다.

**허리 두 군데가 잘록한 것**이 이 지역에서 이놈만의 것입니다 — 몸이 셋으로
끊어져 보여야 합니다. 그 하나로 일벌(날개가 넓다) · 각다귀(가늘고 길다) ·
허물(속이 비었다)과 갈립니다.

머리가 배만큼 커야 합니다. 병정개미를 병정으로 만드는 것은 몸집이 아니라
**턱이 몸의 절반**이라는 비율입니다.

눈은 거의 퇴화했습니다 — 크게 그리면 24판 나방의 눈알 무늬와 인상이 겹칩니다.""",
    ),

    mob3(
        'sw_drone', '못 깬 일벌', '근접 · 둥지 26~30',
        '반쯤 부화한 채로 날아와 부딪힌다.',
        'A worker that was pulled out of the comb before it finished.' + NL
        + 'BODY: a compact thorax with a short banded abdomen hanging below it, held '
        'nose-down in the air. The body is small; the WINGS are what you see.' + NL
        + 'WINGS: TWO pairs, held out flat and wide, together more than TWICE the '
        'width of the body — the widest wing span in the region. They are thin hard '
        'blades with a coarse grid of veins. THREE of the four are still CRUMPLED — '
        'folded and creased along their length as if they never inflated — and only '
        'one has opened properly. That mismatch is the read.' + NL
        + 'THE HALF-SHELL — this one only: a broken piece of hexagonal COMB CAP is '
        'still stuck to its back and one shoulder, a jagged fragment with two whole '
        'hex cells in it. It never got all the way out.' + NL
        + 'THE BREACH — this one: the growth has come up through the ROOT of the one whole wing, wedged into the joint, so that wing is held at a fixed wrong angle and cannot fold with the others.' + NL
        + 'THE REPLACED PART: the sting is not a barb any more — it is a straight faceted spike, thicker and blunter than a sting, and the abdomen tip has hardened around where it comes out.' + NL        + 'LEGS: three pairs, folded up tight under the thorax, thin and hooked.' + NL
        + 'HEAD: two large compound domes covering most of it, and two short mouth '
        'plates below. One dome is caved in.' + NL
        + 'STING: a short straight barb at the abdomen tip, half the length of the '
        'abdomen — much shorter than a soldier bee\'s.',
        'hovering nose-down at a slight angle, legs folded, sting pointing down. The '
        'wings are held out and STILL — draw them still, not blurred. Three are '
        'visibly crumpled. The comb fragment sits on its back.',
        'the ram. The whole body has TIPPED nose-down to near vertical and driven '
        'forward, wings swept back flat against the body so the span has collapsed '
        'to almost nothing, legs out and grasping. It attacks by falling at you. '
        'This is the NARROWEST cell of the sheet.',
        'struck. The one whole wing has torn free and is tumbling clear; the body '
        'has flipped and is falling abdomen-first. The comb fragment has cracked '
        'across and half of it is gone. The sting is bent flat against the abdomen.',
        '- It fills about 44% of the cell height. Its WIDTH in the idle cell (wing '
        'span) is about half again its height.' + NL
        + '- Cell 1 is the widest, cell 2 the narrowest. Size the sheet from cell 1.'
        + NL
        + '- WINGS ARE DRAWN STILL AND HARD. There is no way to draw a blur in two '
        'colours; every attempt becomes a white smear. Movement is said with the '
        'ANGLE of the wing, never with motion lines.',
        """22판 우두머리(아피스)와 **같은 종족**입니다 — 저쪽은 다 자란 호위벌이고
이쪽은 못 깬 일벌입니다. 그래서 육각형 벌집 조각을 둘 다 답니다. 다만 아피스는
어깨에 갑옷처럼 붙어 있고, 이놈은 **아직 못 벗은 뚜껑**이 등에 붙어 있습니다.

**날개 넷 중 셋이 쭈글쭈글해야 합니다.** 그게 "못 깼다" 를 말하는 유일한
방법이고, 다 편 날개 하나와의 대비가 45px 에서도 보입니다.

날개는 멈춘 딱딱한 판으로 그립니다. 흑백 2색에서 잔상은 흰 얼룩이 됩니다.""",
    ),

    mob3(
        'sw_lancer', '쏘는 각다귀', '원거리 · 둥지 26~30',
        '뒷줄에서 긴 침을 쏜다.',
        'A crane fly grown into a delivery system for one needle.' + NL
        + 'BODY: THIN. A narrow straight abdomen held at a steep angle off a small '
        'hunched thorax, the whole body no thicker than one of its own legs at the '
        'knee. It is the THINNEST silhouette in the region — almost all of this '
        'creature is line.' + NL
        + 'THE NEEDLE: a single rigid PROBOSCIS projecting forward from the head, as '
        'long as the abdomen, dead straight, tapering to a hair point. It is the '
        'longest straight line in the chapter.' + NL
        + 'THE BREACH — this one: the thorax, the only thick part of this creature, has split on top and carries a cluster of growth that is nearly as big as the thorax itself — a heavy lump on an animal made of lines.' + NL
        + 'THE REPLACED PART: one of the two compound domes is a blind faceted block with flat sides. On a head that is mostly eyes, half of the head is gone.' + NL        + 'LEGS: three pairs, absurdly long and thin, each bending TWICE, splayed so '
        'wide that the body hangs low in the middle of them. TWO are broken — one at '
        'the first joint, one at the second — and hang uselessly. Draw them as hard '
        'hairlines with visible joints, never as smooth curves.' + NL
        + 'WINGS: one narrow pair held back and slightly apart, each with a long '
        'tear.' + NL
        + 'HEAD: two small compound domes and, between them, the thickened collar '
        'where the needle joins.' + NL
        + 'IT IS EMPTY: unlike the mosquito boss it carries nothing. No drops '
        'anywhere on it. That is the difference between a mob and 28판 — this one '
        'has not fed.',
        'standing high on its splayed broken legs, body hanging low between them, '
        'needle held level and forward. It is mostly empty space and thin lines. '
        'Nothing about it looks solid.',
        'the shot. The body has PIVOTED so the needle points forward and slightly '
        'down out of the cell, and the two whole legs have straightened to drive the '
        'head out — the body is at its LONGEST here, stretched from needle tip to '
        'back foot. Off the needle tip, THREE separate small solid flecks travel '
        'ahead of it and stop well inside the cell.',
        'struck. The needle has snapped at two thirds and the broken end hangs by a '
        'shred. Four legs have collapsed and the body is on the ground between them. '
        'One wing is torn off entirely.',
        '- It fills about 50% of the cell height measured to the top of the KNEES.'
        + NL
        + '- It is MOSTLY EMPTY BLACK. The gaps between the legs are part of the '
        'shape and must not be filled in.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.',
        """28판 우두머리(모스키토)와 같은 갈래지만 **다른 놈**입니다. 저쪽은 배가
부풀어 있고 물방울을 달고 있습니다. 이놈은 **아직 안 먹었습니다** — 물방울이
하나도 없고 배가 비어 있습니다.

그 차이 하나로 우두머리가 나왔을 때 "저건 배가 불렀다" 가 읽힙니다.

**이 놈은 얇아야 합니다.** 둥지 넷 중 셋이 두꺼운 마디 덩어리라, 이 놈만
선으로 그리면 뒷줄에 서 있어도 누군지 압니다.""",
    ),

    mob3(
        'sw_husk', '걷는 허물', '근접 · 둥지 26~30',
        '속이 빈 껍데기가 걸어온다.',
        'A moulted skin that never noticed the animal had left.' + NL
        + 'BODY: LOW AND LONG, a chain of NINE segment plates — but they are HOLLOW. '
        'Along the back, the whole length has SPLIT OPEN in one straight seam, the '
        'edges peeled apart, and through the gap you can see the inside of the far '
        'wall: the shell is a shell. Two of the nine plates have collapsed inward '
        'and lost their round.' + NL
        + 'THE BREACH — this one is different and it is the point: the split down the back is not a breach, it is where the animal LEFT. The growth is INSIDE the empty shell instead, filling the middle three rings from within and pressing outward against them so those rings bulge while the rest stay hollow. Through the back seam you can see it packed in there.' + NL
        + 'THE REPLACED PART: the whole head-case is a solid faceted block in the shape of a head, with no eye rings and no mouth opening — the one part of this shell that is not hollow.' + NL        + 'THAT IS THE READ: a long low insect with a black canyon down its back. '
        'Nothing else in the region is open along its length.' + NL
        + 'LEGS: five pairs, thin and hard and hooked, but three of them are hollow '
        'tubes with the ends open, and one is missing below the knee. They are dry '
        'and they are the same colour as everything else on it.' + NL
        + 'HEAD: a hard capsule with the face-plate cracked off and gone, leaving an '
        'OPEN OVAL where the mouthparts were — a hole clean through into black. The '
        'antennae sockets are empty.' + NL
        + 'EYES: NONE. Both eye domes are empty rings with black inside. This is the '
        'only creature in the game with no eyes at all, and that is what makes it '
        'read as not alive.' + NL
        + 'IT IS DRY: the surface is crazed with fine cracks, and three flakes have '
        'lifted off the plates and are hanging by one edge.',
        'standing low on its five pairs, back seam gaping, empty head lowered. It '
        'holds a walking pose exactly — nothing about the posture sags. That is what '
        'is wrong with it.',
        'the fall. The whole shell has PITCHED FORWARD onto the target head first, '
        'the front three plates driven ahead, the back half lifting off the ground '
        'behind. The back seam has gaped wider with the bend and one loose flake has '
        'come off. It does not strike — it topples onto you.',
        'struck. Four plates have shattered into separate curved pieces that are '
        'still falling; the back seam has torn all the way through so the front and '
        'back halves are joined by almost nothing. Two hollow legs are snapped off '
        'and lying under it. The empty head has come away and is tipping.',
        '- It fills about 44% of the cell height. It is LOW AND LONG.' + NL
        + '- THE BLACK INSIDE IT IS THE POINT. The split along the back and the hole '
        'in the face must stay open black, never shaded, never filled. If the '
        'silhouette closes up, this creature becomes the grub from the chapter '
        'before.' + NL
        + '- Cell 2 is the tallest. Size the sheet from it.',
        """**이 지역에서 유일하게 눈이 없습니다.** 그 하나로 "살아 있지 않다" 가
읽힙니다.

## 등이 갈라져 속이 보여야 합니다

21~25 의 갉는 유충과 실루엣이 비슷합니다 (낮고 길다). 그래서 두 챕터를 갈라
놓았고, **등의 검은 골짜기**로 다시 한 번 가릅니다. 그 검은 부분이 메워지면
그냥 유충이 됩니다.

## 자세가 안 처져야 합니다

껍데기인데 걷는 자세를 정확히 잡고 있습니다. 축 늘어지게 그리면 "죽은 것" 이
되고, 그러면 걸어온다는 것이 이상해집니다. 멀쩡한 자세로 서 있는 빈 껍질이라
무서운 것입니다.""",
    ),

    mob3(
        'sw_bomb', '폭탄 애벌레', '특수 · 26판 우두머리가 죽으면 넷이 나온다',
        '5초 뒤 스스로 터진다. 그 전에 잡아야 한다.',
        'A piece of the firefly that is still counting.' + NL
        + 'BODY: a SHORT fat grub, almost as tall as it is long — the ROUNDEST '
        'silhouette in the region. FOUR segments only, each one swollen past the '
        'next, the last one biggest. It is over-full and it looks it.' + NL
        + 'THE LIGHT CHAMBER — this one only: the whole rear segment is a hard '
        'HOLLOW chamber, drawn as a thick ring with a black centre packed with a '
        'coarse grid of small cells. It is more than a third of the whole creature '
        'and it is the only hollow shape on it. That is the part that goes off.' + NL
        + 'THE SKIN IS SPLITTING: between every pair of segments the surface has '
        'cracked open into a short gash — three of them — and pale edges show.' + NL
        + 'THE BREACH — this one: the growth has come up through the torn front cross-section, packing the open ring where it separated from the parent so the wound is plugged with something that is not flesh.' + NL
        + 'THE REPLACED PART: the light chamber is no longer the creature\'s own. Its hollow ring is filled with faceted lumps instead of the honeycomb grid, and they press against the walls from inside.' + NL        + 'LEGS: four tiny hooked pairs bunched under the front, barely reaching the '
        'ground. It waddles.' + NL
        + 'HEAD: very small, a hard capsule with two short mouth plates and two dull '
        'dots for eyes. It is a fraction of the body and it does not matter.' + NL
        + 'IT IS A PIECE OF SOMETHING BIGGER: the front end is not a proper head '
        'end — it is a torn CROSS-SECTION, a ragged open ring where it separated '
        'from the parent, with the plate edges standing out around it.',
        'squat and swollen, barely off the ground, the light chamber plainly '
        'visible at the back, the three gashes closed to slits. The torn front '
        'section faces forward. It is the SMALLEST and ROUNDEST thing on the field.',
        'about to go. The body has REARED up onto the back segment, front end lifted '
        'clear of the ground, and all three gashes have GAPED into wide openings '
        'along the whole length. The light chamber has swelled to half again its '
        'size and its inner grid is broken apart. Nothing has left the body yet — '
        'that is the point. It is the moment before.',
        'struck. The light chamber is cracked across and its grid is scattered; two '
        'segments have burst along their gashes and the body has flattened sideways. '
        'The torn front ring is crushed out of round. It is coming apart harmlessly, '
        'which is exactly what the player wanted.',
        '- It fills about 34% of the cell height — the SMALLEST creature in the '
        'game. Four of them stand where one boss stood.' + NL
        + '- Cell 2 is the tallest. Size the sheet from it.',
        """26판 우두머리(피로스)가 죽으면 넷이 나옵니다. 5초 안에 못 잡으면 각자
터져서 파티가 최대 체력의 25% 씩 맞습니다.

## 피로스의 조각으로 보여야 합니다

마디 넷, 갈라진 살갗, 속 빈 발광 기관 — 셋 다 피로스에게 있던 것입니다.
앞쪽 끝이 **찢어진 단면**인 것이 결정적입니다: 머리가 아니라 잘려 나온
자리입니다.

## 제일 작아야 합니다

게임에서 제일 작은 생물입니다 (34%). 우두머리 하나가 서 있던 자리에 넷이
서므로, 작지 않으면 자리가 안 납니다.

## 2번 칸은 터지기 **직전**입니다

터지는 그림이 아닙니다. 아무것도 몸을 안 떠났고, 갈라진 자리만 활짝 벌어져
있습니다. 터진 것을 그리면 화면에서는 이미 늦은 것으로 보입니다.""",
    ),
]

FOES += [
    #
    # ── 나중에 더한 셋 ────────────────────────────────────────
    #
    # 21~25 와 26~30 이 넷씩이었다. 슬라임 장은 여덟, 식물·나무 장은 여섯인데
    # 여기만 넷이라, 한 판에 세 종이 서면 **거의 매 판 같은 셋**이 섰다.
    #
    # 셋 다 이미 있는 축과 안 겹치는 실루엣을 골랐다 —
    #
    #   공 + 낮은 몸          쇠똥구리  (게임에서 유일하게 딸린 물건이 있다)
    #   위로 세운 낫 둘        사마귀    (유일하게 몸 위로 무기가 선다)
    #   가로로 뻗은 X 자 날개  잠자리    (유일하게 날개가 좌우로 곧다)

    mob3(
        'sw_roller', '구르는 쇠똥구리', '근접 · 침식지 21~25',
        '제 몸만 한 공을 밀고 온다. 공이 먼저 닿는다.',
        'A dung beetle that has been rolling the same ball since before this place '
        'was eaten.' + NL
        + 'BODY: a low armoured wedge, WIDER THAN TALL, head down and rear high — '
        'the whole animal is angled forward and down as if permanently pushing. It '
        'is the second smallest thing on the field; THE BALL IS THE BIG SHAPE.' + NL
        + 'THE BALL — this one only, and it is the silhouette: a solid ROUND mass '
        'in front of the beetle, AS TALL AS THE BEETLE IS LONG, packed and crusted, '
        'with three or four hard things half sunk into its surface at wrong angles '
        '(a rib, a shard of comb, a broken plate). It touches the ground and it '
        'touches the beetle\'s front legs. It is the only PERFECT ROUND SHAPE in '
        'the region and the only thing any creature in this game is carrying.' + NL
        + 'THE BREACH — this one: the growth has come through the shovel-plate of the head, splitting its notched front edge in two so the rake is broken in the middle.' + NL
        + 'THE REPLACED PART: the short horn is gone. What curves up off the head instead is a faceted shard, flat-sided and too straight, and it is longer than the horn ever was.' + NL        + 'THAT IS THE READ: a big circle with a small wedge braced behind it. '
        'Nothing else in the game is a circle plus a body.' + NL
        + 'LEGS: three pairs. The FRONT pair is up on the ball, flattened and '
        'spread against it. The middle and back pairs are planted wide and driving, '
        'each bending up then down, each ending in a broad rake of four short '
        'spines. One back leg is a healed stump and it still pushes.' + NL
        + 'HEAD: a broad flat shovel-shaped plate, notched along its front edge '
        'like a rake, tucked down under the front of the body. Two small compound '
        'domes sit far apart on its corners.' + NL
        + 'HORN: one short blunt horn curving up off the head, chipped at the tip.'
        + NL
        + 'THE OLD SKIN: one split hollow plate hangs off the rear, dry and empty.',
        'braced against the ball, head down, front legs flat on it, back legs '
        'planted. Neither the beetle nor the ball is moving and the whole pose is '
        'load. The ball is the tallest thing in the cell.',
        'the shove. The back legs have driven straight and the body has dropped '
        'lower and longer, and THE BALL HAS ROLLED FORWARD a quarter turn — the '
        'hard things sunk in it have moved round with it, so you can tell it '
        'turned rather than slid. The gap between ball and beetle has closed to '
        'nothing. It attacks by putting the ball into you.',
        'struck. The ball has been knocked off its line and is rolling away, and '
        'for the first time the beetle is separated from it — front legs still '
        'reaching after it, body sprawled on its side, two legs folded wrong. '
        'Without the ball it looks small, which is the point.',
        '- The BALL fills about 42% of the cell height; the beetle itself about '
        '30%. Together they are the widest mob of this chapter.' + NL
        + '- Cell 2 is the longest. Size the sheet from it.' + NL
        + '- The ball must stay a ROUND SOLID MASS with a hard outline — not a '
        'scribble of debris. What is stuck in it breaks the edge in three or four '
        'places and no more.',
        """이 지역에서 **유일하게 물건을 들고 다니는** 놈입니다. 게임 전체를 봐도
없습니다.

## 공이 실루엣입니다

벌레는 작고 공이 큽니다. 45px 에서 남는 것은 **큰 원 + 뒤에 붙은 작은 쐐기**
이고, 그 조합은 이 게임에 하나뿐이라 그것만으로 알아봅니다.

공을 잡동사니 뭉치로 그리면 안 됩니다 — **단단한 윤곽의 둥근 덩어리**여야
하고, 박힌 것이 그 윤곽을 서너 군데만 깹니다.

## 3번 칸에서 공이 떨어져 나갑니다

맞으면 공이 굴러가 버리고, 그제야 이 놈이 얼마나 작은지가 보입니다. 세 칸
중 유일하게 벌레와 공이 떨어져 있는 칸입니다.""",
    ),

    mob3(
        'sw_mantis', '기다리는 사마귀', '근접 · 둥지 26~30',
        '가만히 서 있다가 낫을 접었다 편다.',
        'A mantis that has not moved from this spot in a very long time and is '
        'still not finished waiting.' + NL
        + 'BODY: an UPRIGHT narrow trunk, TALLER THAN WIDE, standing almost '
        'vertical on the back four legs with the front third of the body raised '
        'clear off the ground. It is the only mob in the region that stands up.'
        + NL
        + 'THE SCYTHES — this one only, and it is the silhouette: TWO enormous '
        'forelimbs held FOLDED and RAISED in front of the chest, each folded into '
        'a tight Z whose upper edge stands HIGHER THAN THE HEAD. Each blade is a '
        'flat hard hook lined with SIX inward spines along its inner edge, and the '
        'two are held slightly apart so you can see black between them.' + NL
        + 'THE BREACH — this one: the growth has come out through the joint of the LEFT scythe where it folds, so that arm cannot close all the way and is held a little more open than the right one. On a creature whose whole read is two matched hooks, one that will not shut is the first thing you see.' + NL
        + 'THE REPLACED PART: three of the six inward spines on that same left blade are not spines — they are flat faceted teeth, squarer and duller than the others.' + NL        + 'THAT IS THE READ: two hooks standing above a thin upright body. Nothing '
        'else in this game holds a weapon above itself — everything else reaches '
        'forward or hangs down.' + NL
        + 'HEAD: a small hard triangle turned to face the viewer while the body '
        'faces sideways — the only creature in the game whose head is turned '
        'against its own body. Two large compound domes fill the upper corners; '
        'between them two short mouth plates opening sideways.' + NL
        + 'ANTENNAE: two long thin feelers swept back, one broken to half.' + NL
        + 'ABDOMEN: long, segmented in SEVEN plates, curving up and back behind '
        'the trunk to counterbalance the raised front. It is dry and one plate has '
        'a hole punched through it, healed.' + NL
        + 'WINGS: a short hard pair folded flat down the back, too small to lift '
        'it, both frayed along the trailing edge.' + NL
        + 'THE OLD SKIN: one split hollow forelimb — an empty scythe, the same '
        'shape as the living ones — hangs off the back of the trunk. It has done '
        'this before.',
        'standing motionless, upright, both scythes folded and raised in front of '
        'the chest, head turned to the viewer, abdomen curved up behind. NOTHING '
        'in this cell suggests movement — it is the stillest idle in the game, and '
        'that stillness is what it does.',
        'the snap. BOTH scythes have shot straight out and FORWARD in one line, '
        'fully unfolded, spines forward, reaching further than the body is long — '
        'and the body itself has not moved a hair. Head, trunk, abdomen and all '
        'four standing legs are exactly where they were in cell 1. Only the arms '
        'changed, and they changed completely. It is the WIDEST cell of the sheet.',
        'struck. The trunk has been knocked off vertical and is toppling '
        'sideways; one scythe is snapped at the elbow and hanging by the joint, '
        'the other still half raised. Two standing legs have folded. The abdomen '
        'has dropped and uncurled. The empty moult skin has been torn loose and '
        'is falling with it.',
        '- It fills about 50% of the cell height in the idle cell, measured to the '
        'TOP OF THE RAISED SCYTHES — which stand above the head.' + NL
        + '- Cell 2 is much wider than it is tall. Size the sheet from it.' + NL
        + '- The two scythes must be THICK — each blade at least a fifth of the '
        'trunk height. Thin scythes vanish at 45 pixels and this creature becomes '
        'a stick.',
        """이 지역에서 **유일하게 서 있는** 잡몹입니다. 나머지는 전부 기거나 낮게
깔립니다.

## 낫이 머리보다 높아야 합니다

이 게임에서 무기를 **몸 위로 세우는** 것은 이놈뿐입니다. 나머지는 앞으로
뻗거나 아래로 늘어집니다. 그 하나로 45px 에서 병정개미(허리 둘)·각다귀(가늘다)
와 갈립니다.

낫은 **두꺼워야** 합니다. 가늘게 그리면 사라지고 막대기 하나가 남습니다.

## 1번과 2번의 차이가 팔뿐이어야 합니다

몸통·머리·다리·배가 두 칸에서 **한 픽셀도 안 움직입니다.** 팔만 접혔다
펴집니다. 그 대비가 "기다리다 낚아챈다" 를 만들고, 몸까지 같이 움직이면
그냥 달려드는 벌레가 됩니다.

## 머리가 몸과 다른 쪽을 봅니다

몸은 옆을 보는데 머리만 정면을 봅니다. 게임에서 이러는 것은 이놈뿐이고,
그것만으로 "보고 있다" 가 읽힙니다.""",
    ),

    mob3(
        'sw_glider', '활공하는 잠자리', '원거리 · 둥지 26~30',
        '뒷줄에서 미끄러지듯 떠 있다가 쏜다.',
        'A dragonfly that stopped needing to land.' + NL
        + 'BODY: a LONG straight rod of an abdomen, held dead horizontal, eight '
        'segments, tapering evenly from a compact thorax to a blunt tip. It does '
        'not curve and it does not hang — it is the straightest shape in the '
        'region.' + NL
        + 'THE WINGS — this one only, and it is the silhouette: FOUR long narrow '
        'blades held out FLAT and STRAIGHT, two forward and two back, spread into '
        'a wide X across the body. Each is more than the length of the abdomen, '
        'each a hard flat plane with a coarse grid of veins showing through, each '
        'ending in a blunt square tip. They are held rigid and level — this animal '
        'glides, it does not beat.' + NL
        + 'THE BREACH — this one: the growth has come through the underside of the abdomen at the fourth segment, a cluster hanging below the otherwise dead-straight rod, and it is the only thing that breaks that straight line anywhere on the animal.' + NL
        + 'THE REPLACED PART: the wing that is cut square off at two-thirds does not end in a tear — it ends in a flat faceted edge, as if the missing third had been replaced by a straight cut of the same material.' + NL        + 'THAT IS THE READ: a long horizontal rod with a wide X across it. '
        'Nothing else in the game is a cross.' + NL
        + 'THE WINGS ARE DAMAGED, UNEVENLY: one is whole; one has a long tear from '
        'the tip inward; one is cut square off at two-thirds; one has three round '
        'holes punched through it. Matched wings read as an ornament.' + NL
        + 'HEAD: almost entirely TWO enormous compound domes that meet in the '
        'middle, together wider than the thorax and pitted with a coarse grid. '
        'They are the largest eyes in the game relative to the body. Below them, '
        'two short mouth plates.' + NL
        + 'LEGS: six, thin and hooked, folded up tight against the thorax in a '
        'basket and never used for standing.' + NL
        + 'THE OLD SKIN: a split hollow head-case, the same shape as the living '
        'head, hangs under the thorax on a strand.',
        'hanging level in the air, abdomen horizontal, all four wings held out '
        'flat and still — draw them still, not blurred. The huge eyes face '
        'forward. It is the WIDEST silhouette of the chapter and the most '
        'symmetrical shape in it.',
        'the shot. The abdomen has CURLED down and forward under the body, tip '
        'aimed ahead, and the four wings have swept BACK and angled so the X has '
        'narrowed to a shallow V — the whole animal has gone from a cross to an '
        'arrowhead. Off the abdomen tip, THREE separate small solid flecks travel '
        'ahead of it and stop well inside the cell.',
        'struck. Two wings have torn free at the root and are tumbling away '
        'separately; the abdomen has snapped at the fourth segment and hangs at an '
        'angle. The body has rolled and is falling eyes-down. The folded legs have '
        'come loose and splayed.',
        '- It fills about 40% of the cell height but is the WIDEST mob of the '
        'chapter — the wing span is about twice its height.' + NL
        + '- Cell 1 is the widest, cell 2 the narrowest. Size the sheet from cell 1.'
        + NL
        + '- WINGS ARE DRAWN STILL AND HARD. There is no way to draw a blur in two '
        'colours; every attempt becomes a white smear. Movement is said with the '
        'ANGLE of the wing, never with motion lines.',
        """26~30 의 두 번째 원거리입니다. 쏘는 각다귀와 같은 줄에 서지만 실루엣이
정반대입니다 — 각다귀는 **선**이고 이놈은 **면**입니다.

## X 자가 실루엣입니다

곧은 몸통 하나에 날개 넷이 가로로 넓게 벌어져 십자를 만듭니다. 이 게임에
십자 모양은 이놈뿐이라, 뒷줄에 서 있어도 누군지 압니다.

## 날개 넷이 저마다 다르게 상했습니다

하나는 멀쩡하고, 하나는 끝에서 찢어졌고, 하나는 3분의 2에서 잘렸고, 하나는
구멍 셋이 뚫렸습니다. 넷이 똑같으면 장식으로 보입니다.

## 1번과 2번이 십자와 화살촉입니다

떠 있을 때는 넓은 십자, 쏠 때는 날개가 뒤로 젖혀지며 좁은 화살촉이 됩니다.
그 폭 차이가 "쐈다" 를 만듭니다.

날개는 멈춘 딱딱한 판으로 그립니다. 흑백 2색에서 잔상은 흰 얼룩이 됩니다.""",
    ),
]


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
    {
        'id': '03', 'name': '오염된 잔재들의 숲', 'stages': '11~15',
        'scene':
            'A wood that grew up through the wreck of something, seen from OUTSIDE '
            'and from a long way off, looking across at the tree line. The horizon '
            'runs the WHOLE WIDTH along the very bottom edge.' + NL
            + 'UPPER HALF — sky, but LESS of it than the plain had. Two cloud banks '
            'only, high and thin, and the top of the wood eats up into this half. '
            'The plain was open; this is closing in, and that closing is the first '
            'thing that separates this wood from the plain behind it.' + NL
            + 'LOWER HALF — a line of TREES along the bottom edge across the full '
            'width: eight or ten trunks in silhouette at different thicknesses and '
            'spacings, standing about half the height of the strip. They lean at '
            'slightly different angles; none is straight.' + NL
            + 'THE REMNANTS — this is what names the place, and it is the whole job '
            'of this image. STANDING AMONG THE TRUNKS, not part of them, are the '
            'silhouettes of things people made and left: a leaning WATCHTOWER frame '
            'with its top gone, two upright STANDING STONES, a broken CART on its '
            'side, and a run of low WALL. They are spread across the width, mixed in '
            'with the trees, all the same flat far-off silhouette. You should read '
            'the line as "trees AND something else" before you read either one.' + NL
            + 'THE POLLUTION: a low band of heavy dithered HAZE lies among the bases '
            'of the trunks and the wreckage, thickest in the gaps, thinning as it '
            'rises. It never reaches the sky. That haze is the only thing here that '
            'is not a hard silhouette.' + NL
            + 'The remnants still stand APART from the wood — leaning on it, sunk in '
            'it, but separate. In the next chapter they will not be.' + NL
            + 'No ground, no path, no undergrowth in front. The floor between you and '
            'the tree line is not in this image — the game draws it.',
    },
    {
        'id': '04', 'name': '타락한 잔재들의 숲', 'stages': '16~20',
        'scene':
            'The same wood, five stages deeper, where the trees have finished eating '
            'what was left here. Seen from a long way off, looking through.' + NL
            + 'UPPER HALF — almost no sky. A CANOPY presses down across the full '
            'width from the top edge, drawn as a heavy dark irregular mass with three '
            'or four ragged gaps where pale light comes through. The chapter before '
            'had two thin clouds and open air; this has a lid. That closing-over is '
            'the first thing that says the chapter turned.' + NL
            + 'LOWER HALF — six or seven ENORMOUS trunks in silhouette, far thicker '
            'and further apart than before, running from the bottom edge up into the '
            'canopy so they cross both halves. Two are BROKEN OFF partway up, snapped '
            'at an angle.' + NL
            + 'THE REMNANTS ARE INSIDE THE TREES NOW. This is the one difference that '
            'matters, and it is what the chapter name means. In the chapter before, '
            'the wreckage stood among the trunks; here it has been GROWN OVER and is '
            'part of them — a tower frame swallowed into one trunk with only its '
            'crossbeams still showing, a standing stone half absorbed into another, a '
            'cartwheel held in the fork of a third, a length of wall running INTO a '
            'trunk and stopping. Each one reads as one shape, tree and thing together, '
            'not two shapes side by side.' + NL
            + 'THE HAZE IS GONE. Where the last chapter had a band of pollution lying '
            'among the trunks, here there is none — it has all gone into the wood. '
            'Everything is hard silhouette.' + NL
            + 'Along the bottom edge, small and far: three or four leaning dead stumps.'
            + NL
            + 'No ground, no path, no leaf litter in front — the game draws the floor.',
    },
]

BACKGROUNDS += [
    {
        'id': '05', 'name': '우화하는 군체들의 침식지', 'stages': '21~25',
        'scene':
            'A land where something laid eggs in everything and then left. What you '
            'see looking ACROSS it to the far edge, from a long way off.' + NL
            + 'UPPER HALF — a low, close sky. Two or three heavy cloud banks pressed '
            'flat and wide across the whole width, and BELOW them, hanging between '
            'the clouds and the horizon, a scatter of small separate dark specks — '
            'far-off flying things, dozens of them, biggest near the middle and '
            'thinning to nothing at the edges. Draw them as loose dots, never as a '
            'cloud or a smear. That drift is what names this chapter.' + NL
            + 'LOWER HALF — the horizon is BROKEN by hanging shapes. Along the bottom '
            'edge, spread across the whole width and no taller than a third of the '
            'strip: five or six bare dead trees with SACS slung between their '
            'branches — heavy teardrop bundles, two or three per tree, at different '
            'heights, some split open and empty. Between the trees, two low mounds '
            'crusted with a coarse honeycomb texture.' + NL
            + 'This must not read as a forest. The trees are bare, far apart, and '
            'stripped — what fills the space between them is what is hanging.' + NL
            + 'Draw no ground and no path. The image ends at the bottom edge.',
    },
    {
        'id': '06', 'name': '침식이 끝난 군체의 둥지', 'stages': '26~30',
        'scene':
            'The same land at its centre, where the nest finished eating it. Seen '
            'from OUTSIDE and far off.' + NL
            + 'UPPER HALF — the sky is nearly gone. It has been ROOFED OVER: a coarse '
            'honeycomb lattice spans the top of the strip corner to corner, made of '
            'irregular six-sided cells of very different sizes, thick-walled, some '
            'capped solid and some open to black. It is heaviest at the top edge and '
            'breaks up as it comes down, ending in ragged torn cells about a third of '
            'the way down. Through the gaps, two thin strips of pale sky.' + NL
            + 'LOWER HALF — a horizon of MOUNDS instead of trees. Along the bottom '
            'edge and across the whole width: four or five rounded heaps of packed '
            'comb, no taller than a third of the strip, each pierced with two or '
            'three round tunnel mouths that read as solid black holes. Between them, '
            'the stumps of the dead trees from the chapter before, snapped short and '
            'grown over.' + NL
            + 'THE READ IS ENCLOSURE. The first chapter of this region is open sky '
            'with things drifting in it; this one has a ceiling. That contrast is how '
            'the player knows they went deeper.' + NL
            + 'Draw no ground and no path. The image ends at the bottom edge.',
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

**색이 반전돼 나왔을 때** (바탕이 희고 그림이 검음)

```
The values are inverted. In this image the creature has come out as DARK shapes
sitting on a LIGHT ground — or as a light-filled panel with the creature drawn
into it in black.

It must be the other way round. THE GROUND IS PURE BLACK AND IT IS EMPTY. The
creature is drawn in PURE WHITE on top of it: a white filled silhouette, with its
interior detail — eyes, mouth, seams, the gaps between limbs — cut back OUT of that
white as black holes.

There is no light background, no panel, no card, no frame, no vignette and no white
rectangle anywhere. If you flood-fill the corner of a cell it must run all the way
around the creature without meeting a wall.

Keep the design, the pose and the proportions exactly as they are. Only the values
swap.
```

**선만 남았을 때** (덩어리 없이 가는 획이 엉킴)

```
The creature has come out as a tangle of thin white strokes with no solid mass
anywhere. At game size those strokes merge into each other and it reads as a
smudge, not a creature.

It needs a BODY. Find the single largest part of it — the trunk, the abdomen, the
head, the main mound — and draw that as ONE SOLID FILLED WHITE MASS at least a
third of the creature's height, with hard unbroken edges. Everything thin (limbs,
vines, branches, tendrils, antennae) grows OUT of that mass and must be at least
three pixels thick where it leaves it.

Fewer, thicker parts. Delete half the thin strokes; make the survivors twice as
thick. Keep the pose and the identity exactly as they are.
```

**흰 덩어리로 나왔을 때** (실루엣 안이 통째로 메워짐)

```
The creature has come out as a solid white silhouette with no interior detail. At
game size it reads as a white blob and nothing else.

The palette is two colours: white and transparent. Depth and detail are drawn as
BLACK GAPS INSIDE the white mass, not as shading. Redraw with real holes: the gap
between the legs, the dark seam between every pair of plates, the hollow of the
open mouth, the black centre of each eye socket, the space under an overhanging
part. At least a fifth of the area inside the outline must be black.

Keep the outline and the poses exactly as they are. Only open up the inside.
```

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


# 종류 → 그 종류에만 주는 규칙. 없는 종류는 짐승 규칙을 받는다.
#
# 항목마다 손으로 적게 두면 꼭 빠진다 — 실제로 초원의 열일곱이 전부 빠져서
# 슬라임에게 "굶주린 짐승의 갈비뼈" 가 나갔다. 그래서 id 앞자리로 건다
# (`BACKGROUNDS` 앞의 반복문).
SWARM = """WHAT THESE ARE.

Insects that grew past the size an insect can be. Not bug mascots, not armoured
knights with antennae. Segmented, chitinous animals built out of hard plates.

- THE BODY IS A CHAIN OF PLATES. They overlap like roof tiles, each a little
  different from the last, with a soft dark gap between every pair. That repeating
  rhythm is what says "insect" at 45 pixels. Protect it above any single detail.
- LEGS COME OUT OF THE SIDES, NOT THE BOTTOM, and they bend the WRONG WAY at the
  knee — up first, then down. They are thin, hard, and end in a single hook.
- THEY ARE NEVER SYMMETRICAL. One leg is shorter, one antenna is snapped, one
  plate is chipped. A mirrored insect reads as an ornament.
- MOUTHPARTS OPEN SIDEWAYS. Two or four hard plates hinging left and right. A jaw
  that hinges up and down is a mammal's jaw and it is wrong here.
- NO FACE AND NO EXPRESSION. Eyes are compound: solid domes pitted with a coarse
  grid, or clusters of small round ones. Never a pupil, never a brow.
- THE OLD SKIN IS STILL ON IT. One split hollow plate hangs off the back, empty
  and dry, the same shape as the living plate beneath it.

THEY ARE NOT WET. The slime chapter owns drips; do not borrow them. These are dry,
hard and dusty.

THE INFESTATION — EVERY CREATURE IN THIS REGION HAS IT, AND IT IS WHAT MAKES THEM
DIFFERENT FROM INSECTS.

These are not bugs. They are bugs that something got into. The earlier chapters
each carry a mark like this — the slimes hold what they swallowed, the plants grow
new wood out of their own dead — and this chapter was drawn without one, which is
exactly why the first attempts came back looking like ordinary entomology. Draw
BOTH of the following on every creature, in every cell.

1. THE BREACH. Somewhere on the body the chitin has SPLIT OPEN — a hard-edged
   crack with the plate lifted and curled back around it, and the gap behind it
   BLACK. Pushing out through that gap is GROWTH that does not belong to the
   animal: three to five hard FACETED lumps, flat-sided and angular like broken
   mineral, of clearly different sizes, packed together and standing proud of the
   shell.
   - It is HARD AND FLAT-SIDED. Not fungus, not slime, not fur, not smoke, not
     flame, and not a star of crystal spikes. Think broken stone forced up through
     a crack from underneath.
   - It has NO glow, NO aura, NO particles, NO haze. Two colours cannot draw any
     of those and every attempt becomes a white smear that never goes away.
   - It is the SAME material on every creature in the region. Only the PLACE
     changes, and the place is named in the description above.
   - The black of the gap is part of the shape. Do not fill it in.

2. THE PART THAT IS NO LONGER ITS OWN. One piece of the animal has been REPLACED
   by that same growth — an eye socket filled with a blind faceted lump, a leg
   whose lower half is a straight angular shaft instead of a joint, one jaw plate
   grown over solid. It is grown roughly into the shape of the missing part but it
   is WRONG: too straight, too angular, and it does not match its pair on the
   other side.
   - This is NOT a healed injury. A stump that closed over says the animal
     survived something. This says the animal LOST that part and something else
     is using the space.
   - Exactly ONE part per creature. Two makes it a pile of rocks.

THE ASYMMETRY IS THE READ. At game size nobody will see facets. What they will see
is that ONE SIDE OF THE CREATURE IS WRONG — a dark hole with something jagged in
it, and a limb that does not match its twin. Make that difference big enough to
survive the size."""


FAMILY_RULE = {
    'slime': lambda: SLIME,
    'plant': lambda: PLANT,
    'wood': lambda: WOOD,
    'swarm': lambda: SWARM,
}


def page(f):
    cells = len(f['frames'])
    prompt = block(
        NOTEXT,
        'SUBJECT: a %d-frame animation sheet of ONE single creature, left to right. '
        'The creature is in every cell.' % cells + NL + NL
        + 'THE CREATURE (the same one in all %d cells):' % cells + NL + f['lock']
        + (NL + NL + 'MONSTER MARK — this is the one thing that makes it not an '
           'animal. Draw it in every cell:' + NL + MARKS[f['id']]
           if f['id'] in MARKS else '') + NL + NL
        + rows_of(f['frames'], 'The %d cells, in this exact order:' % cells),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        # 쿼터뷰 바닥은 누운 것을 못 받쳐 준다 — 눕지 말라고 따로 말해야 한다
        STANDS,
        SILHOUETTE,
        NOT_CUTE,
        # 종류에 맞는 규칙만 붙인다 — 슬라임에게 "굶주린 짐승" 을 시키면 안 된다
        FAMILY_RULE.get(f.get('family'), lambda: TWISTED)(),
        # 우두머리는 "잡몹을 키운 것" 으로 나오기 쉽다 — 뭐가 다른지 못 박는다
        BOSS if f.get('boss') else '',
        # 특수 동작 칸이 있는 우두머리에게만 — 그 칸을 어떻게 그리는지
        SPECIAL if cells > 3 else '',
        ALIVE,
        'NOTHING MAY BE CUT OFF.' + NL + f['rules'] + NL
        + '- Every cell holds the WHOLE creature plus every loose droplet and speed '
        'line. If any of it touches a magenta line, that cell has failed.' + NL
        + '- Leave at least 8px of empty black between the outermost pixel and every '
        'magenta line.',
        grid(cells, 1),
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

[배경 프롬프트는 따로 있습니다](FOE_BG_PROMPTS.md) — 네 장으로 스무 판을 돌립니다.

프롬프트는 **챕터별로 폴더가 나뉘어 있습니다.**

| 폴더 | 챕터 |
|---|---|
| `docs/foe-art/` | 1~10 · 슬라임 |
| `docs/foe-art2/` | 11~20 · 식물 · 나무 |
| `docs/foe-art3/` | 21~30 · 벌레 · 군체 |

## 스테이지 구성

`core/autoBattle` 의 `STAGES` 가 이 표 그대로입니다. 판마다 두세 종이 섞이고,
우두머리는 판마다 다릅니다.

%(stages)s

## 목록 — 1~10 · 슬라임 (`docs/foe-art/`)

%(rows1)s

## 목록 — 11~20 · 식물 · 나무 (`docs/foe-art2/`)

우두머리는 **네 칸**입니다. 잡몹의 대기·공격·피격에 더해 **특수 동작** 칸이
하나 더 있습니다 — 전원을 휩쓸거나 한 명을 내려찍을 때 쓰는 그림입니다
(`core/autoBattle` 의 `BOSS_PATTERNS`). 슬라임 우두머리는 세 칸 그대로 두고,
없는 칸은 화면이 같은 시트의 `attack` 으로 떨어뜨립니다.

%(rows2)s

## 목록 — 21~30 · 벌레 · 군체 (`docs/foe-art3/`)

앞의 두 챕터와 **갈래가 다릅니다.** 1~10 은 뼈 없는 덩어리, 11~20 은 자라서
그 모양이 된 것이었습니다. 여기는 **마디**입니다 — 겹친 판, 옆으로 열리는 입,
잘못된 방향으로 꺾이는 다리.

우두머리는 여기 없습니다. 스물한 판부터의 우두머리는 칸이 넷~여섯이라 따로
있습니다 → [`BOSS_ART_PROMPTS.md`](BOSS_ART_PROMPTS.md).

%(rows3)s

## 실루엣이 겹치면 안 된다

한 화면에 넷이 40~52px 로 겹쳐 섭니다. 그 크기에서 남는 것은 **윤곽뿐**이라,
색도 무늬도 도움이 안 됩니다. 그래서 챕터마다 **가르는 축을 하나 정하고**
그 축 위에서 갈라 놓았습니다.

| 챕터 | 가르는 축 | 갈래 |
|---|---|---|
| 슬라임 | 덩어리의 **모양** | 낮다 / 각진 것이 박혔다 / 뾰족한 것이 뻗었다 / 둘이다 |
| 식물 | **무엇이 어느 쪽으로 뻗었나** | 옆으로 길다 / 위가 무겁다 / 사방이 뾰족하다 / 윤곽이 부드럽다 |
| 나무 | **어디가 부러졌나** | 낮고 두껍다 / 안이 뚫렸다 / 밑이 넓다 / 각진 판이 덮였다 |
| 벌레 | **몸이 어느 쪽으로 길고 다리가 어디에 있나** | 낮고 길다 / 뒷다리가 등보다 높다 / 넓적한 판이 덮였다 / 다리가 몸보다 길다 / 공을 밀고 있다 / 낫이 머리보다 높다 / 날개가 가로로 십자다 |

챕터끼리도 겹치면 안 됩니다. 식물은 전부 사람 허리 아래, 나무는 전부 사람보다
큽니다 — 종을 하나하나 알아보기 전에 **줄의 높이**가 먼저 눈에 들어오고, 그게
챕터가 넘어간 것을 말하는 제일 싼 방법입니다.

우두머리도 같은 규칙입니다. 잡몹을 키운 것으로 보이면 체력 열 배가 아무 뜻이
없으므로 (1스테이지에서 겪었습니다) 저마다 **잡몹에 없는 구조**를 하나씩
가집니다 — 덤불을 이고 있다 · 팔이 솟았다 · 셋으로 나뉘었다 · 해골이 셋이다 ·
왕관을 삼켰다 · 세 덩이가 붙었다 · 머리가 다섯이다 · 끝이 안 보인다 ·
정면을 본다 · 도끼가 셋이다 · 구멍이 사람만 하다 · 가지가 열둘이다 ·
갈라져도 서 있다 · 챕터를 통째로 안았다.
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
    ('오염된 잔재들의 숲', ['덩굴손', '홀씨대'], '가시덤불 군체'),
    ('오염된 잔재들의 숲', ['덩굴손', '아귀꽃', '홀씨대'], '아귀꽃 여왕'),
    ('오염된 잔재들의 숲', ['아귀꽃', '가시덤불', '홀씨대'], '덩굴 어미'),
    ('오염된 잔재들의 숲', ['가시덤불', '이끼덩이', '진액꽃'], '홀씨 기둥'),
    ('오염된 잔재들의 숲', ['아귀꽃', '가시덤불', '이끼덩이', '진액꽃'], '시체꽃'),
    ('타락한 잔재들의 숲', ['걷는 그루터기', '가지창'], '늙은 그루터기'),
    ('타락한 잔재들의 숲', ['걷는 그루터기', '속 빈 나무', '가지창'], '속 빈 거인'),
    ('타락한 잔재들의 숲', ['속 빈 나무', '뿌리덩이', '꼬투리나무'], '가시나무'),
    ('타락한 잔재들의 숲', ['뿌리덩이', '껍질갑옷', '가지창', '꼬투리나무'], '썩은 거목'),
    ('타락한 잔재들의 숲', ['속 빈 나무', '뿌리덩이', '껍질갑옷', '꼬투리나무'], '숲의 어른'),
    ('우화하는 군체들의 침식지', ['갉는 유충', '뛰는 여치'], '센티페다'),
    ('우화하는 군체들의 침식지', ['갉는 유충', '구르는 쇠똥구리', '뱉는 노린재'], '아피스'),
    ('우화하는 군체들의 침식지', ['뛰는 여치', '뱉는 노린재', '실 잣는 새끼'], '누카누스'),
    ('우화하는 군체들의 침식지', ['갉는 유충', '구르는 쇠똥구리', '실 잣는 새끼'], '비블리스'),
    ('우화하는 군체들의 침식지', ['뛰는 여치', '구르는 쇠똥구리', '뱉는 노린재', '실 잣는 새끼'], '아라크네스'),
    ('침식이 끝난 군체의 둥지', ['병정개미', '기다리는 사마귀'], '피로스'),
    ('침식이 끝난 군체의 둥지', ['병정개미', '못 깬 일벌', '활공하는 잠자리'], '로쿠스타'),
    ('침식이 끝난 군체의 둥지', ['기다리는 사마귀', '쏘는 각다귀', '걷는 허물'], '모스키토'),
    ('침식이 끝난 군체의 둥지', ['병정개미', '기다리는 사마귀', '활공하는 잠자리'], '포르미카'),
    ('침식이 끝난 군체의 둥지', ['병정개미', '걷는 허물', '쏘는 각다귀', '활공하는 잠자리'], '바알'),
]

def tag_families():
    """id 앞자리를 보고 종류와 우두머리 여부를 건다.

    ## 왜 손으로 안 적나

    항목마다 `family` 를 적게 해 뒀더니 꼭 빠진다. 초원의 열일곱이 전부
    빠져서 슬라임이 `TWISTED`(짐승) 규칙을 받았고 — "굶주린 짐승의 갈비뼈",
    "털은 뭉쳐서 늘어진다" — 눈도 이빨도 없는 맨 덩어리가 나왔다. id 앞자리가
    이미 종류를 말하고 있으니 그걸 쓴다.

    ## 왜 함수인가

    처음엔 모듈 맨 위에서 한 번 도는 반복문이었다. 그러면 그 아래에
    `FOES += [...]` 를 하나 더 붙이는 순간 새 항목들은 안 걸린다 — 식물·나무
    스물둘을 넣자마자 그대로 당했다.

    반복문을 목록 아래로 옮기는 것은 "다음 사람도 아래에 붙이겠지" 에
    기대는 것이라 또 터진다. **쓰기 직전에 부르면** 목록에 뭘 언제 더하든
    상관없어진다.
    """
    for f in FOES:
        head = f['id'][:3]
        if head in ('sl_', 'sg_', 'sb_'):
            f['family'] = 'slime'
        elif head == 'pf_':
            f['family'] = 'plant'
        elif head == 'pw_':
            f['family'] = 'wood'
        elif head == 'pb_':
            # 식물 우두머리(11~15)는 식물 규칙, 나무 우두머리(16~20)는 나무 규칙
            f['family'] = f.get('chapter', 'wood')
        elif head == 'sw_':
            f['family'] = 'swarm'
        if head in ('sb_', 'pb_') or f['id'] == 'sl_boss':
            f['boss'] = True


os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(OUT_DIR2, exist_ok=True)
os.makedirs(OUT_DIR3, exist_ok=True)
tag_families()

# 챕터별로 나눠 적는다 — 색인의 표도 그 순서 그대로다
rows = {OUT_DIR: [], OUT_DIR2: [], OUT_DIR3: []}
for _f in FOES:
    _dir = out_dir_of(_f)
    _p = os.path.join(_dir, _f['id'] + '.md')
    open(_p, 'w', encoding='utf-8').write(page(_f))
    print('%s (%s)' % (_p, _f['name']))
    _done = os.path.isdir(os.path.join('assets/sprites', _f['set']))
    rows[_dir].append(
        '| [%s](%s/%s.md) | %s | %s | %s |'
        % (_f['name'], os.path.basename(_dir), _f['id'], _f['name'], _f['role'],
           '들어옴' if _done else '프롬프트만'))

# 옮기기 전에 있던 파일이 옛 폴더에 남아 있으면 지운다 — 두 벌이 갈라진다
for _stale in os.listdir(OUT_DIR):
    if _stale[:3] in ('pf_', 'pw_', 'pb_'):
        os.remove(os.path.join(OUT_DIR, _stale))
        print('옛 자리에서 지움: %s/%s' % (OUT_DIR, _stale))

HEAD = '| 파일 | 이름 | 등장 | 상태 |' + NL + '|---|---|---|---|'
open('docs/FOE_ART_PROMPTS.md', 'w', encoding='utf-8').write(
    INDEX % {
        'rows1': HEAD + NL + NL.join(rows[OUT_DIR]),
        'rows2': HEAD + NL + NL.join(rows[OUT_DIR2]),
        'rows3': HEAD + NL + NL.join(rows[OUT_DIR3]),
        'stages': stage_table(),
    })
open('docs/FOE_BG_PROMPTS.md', 'w', encoding='utf-8').write(bg_page())
print('배경 %d장 · docs/FOE_BG_PROMPTS.md' % len(BACKGROUNDS))
print('%d종 (%s)· docs/FOE_ART_PROMPTS.md'
      % (len(FOES),
         ' · '.join('%s %d' % (d, len(rows[d]))
                    for d in (OUT_DIR, OUT_DIR2, OUT_DIR3))))
