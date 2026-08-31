# -*- coding: utf-8 -*-
"""
보스 전용 이미지 프롬프트 생성기 — `docs/boss-art/<id>.md`.

    python tools/gen-boss.py

## 잡몹 생성기와 뭐가 다른가

`gen-foe.py` 는 **잡몹**을 만든다. 이 파일은 **우두머리만** 만든다. 나눈
이유는 셋이다.

**칸 수가 다르다.** 잡몹은 대기·공격·피격 셋이면 끝난다. 우두머리는 기술을
가지고 있고 **기술마다 동작이 달라야** 하므로, 기술이 하나면 넷, 둘이면
다섯 칸이다. 한 생성기 안에서 칸 수가 셋·넷·다섯로 갈리면 규칙 블록마다
"우두머리면" 이 붙어 읽을 수가 없다.

**그리는 이유가 다르다.** 잡몹은 실루엣이 서로 안 겹치기만 하면 된다. 넷이
겹쳐 서 있고 각자 45px 이라 그 이상은 안 보인다. 우두머리는 **혼자 서 있고**
칸의 60~80% 를 쓴다. 볼 시간도 길다 — 체력이 500 이라 한 판이 길다. 그래서
잡몹에는 낭비인 것들(아문 상처, 삼킨 것, 눈 여럿)이 여기서는 본론이다.

**동작이 규칙에서 나온다.** 이 우두머리들은 기술의 수치가 먼저 정해져 있다
(`docs/BOSS_SKILLS.md`). 전체를 치는 기술과 한 명을 크게 치는 기술은 화면에서
**달라 보여야** 하고, 그 차이를 만드는 것이 그림이다. 그래서 칸마다 "이
기술은 무엇을 하는가" 를 먼저 적고 자세를 거기서 끌어냈다.

## 스타일

`tools/artstyle.py` 를 잡몹·캐릭터·아이콘 생성기와 같이 쓴다. 같은 화면에
나란히 서는 그림이라 규칙이 갈리면 안 된다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artstyle import (  # noqa: E402
    ALIVE, ICON_STYLE, NL, NOTEXT, NOT_CUTE, NO_GROUND, PIXEL_STYLE, QUARTER,
    SILHOUETTE, STANDS, block, grid, labels_of, rows_of, table_of,
)

OUT_DIR = 'docs/boss-art'


# ══ 우두머리만의 규칙 ═════════════════════════════════════════

BOSS_IS = """IT IS A BOSS. IT MUST READ AS ONE BEFORE THE HEALTH BAR DOES.

This is the one enemy the player fights alone. It has more than ten times the
health of the mob that was standing there a second earlier, and the fight lasts
long enough to look at it. Size alone will not carry that — a scaled-up mob just
looks like a scaled-up mob.

FIVE THINGS SEPARATE IT FROM THE MOB. Draw all five:

1. IT IS NOT THE SAME SHAPE. Taking a mob silhouette and enlarging it is a
   failure. This creature has one big structural difference no mob has at all —
   it is named in the description above. Protect that difference above everything
   else in the drawing.

2. MORE EYES, UNEVEN. Three or more, of clearly different sizes, at different
   heights, not all looking the same way. The largest is enormous — a quarter to
   a third of the body width. Nothing says "this one is old" faster, and it is
   legible at any size.

3. THE MOUTH IS TOO BIG FOR THE BODY. Six to eight teeth, each longer and thicker
   than a mob's, and among them two or three hard things it swallowed and never
   dissolved — a blade, a rib, a broken spearhead — standing in the rim as if they
   had grown there. Uneven, several snapped.

4. IT HAS BEEN FOUGHT BEFORE AND IT KEPT GOING. Two or three long healed SPLITS
   across the mass, closed over and holding, and a hard scarred crust across part
   of the surface. A mob is smooth and new; this one is not.

5. IT IS HEAVY. It loads onto its underside, spread and settled, and the top
   overhangs it. Three or four gobbets hang or float torn loose around it, so the
   shape it occupies is bigger than the body.

BANNED: anything that reads as a COSTUME — a crown perched neatly on the head, a
cape, jewellery, armour that looks buckled on rather than grown. It did not dress
up. It got old and it got fed.

(Something it SWALLOWED and never dissolved is not a costume. A broken crown sunk
half into the mass at a wrong angle is food that stayed, and that is allowed —
encouraged, even. The test is whether it looks worn or looks eaten.)"""


MOTIONS = """EVERY CELL IS A DIFFERENT MOTION. THIS IS THE WHOLE POINT OF THIS SHEET.

The game swaps between these cells during the fight. The player must be able to
tell WHICH ONE is on screen from the silhouette alone, in about a fifth of a
second, at 60 pixels tall. If two cells have similar outlines, the fight looks
like one animation stuck on repeat, and the skills stop meaning anything.

So the cells are separated by DIRECTION and by REACH, not by detail:

- IDLE occupies the creature's ordinary shape. It is the baseline every other
  cell is measured against. It still leans forward — it is waiting, not posing.
- THE ORDINARY ATTACK goes FORWARD and stays SHORT. It hits one character for a
  normal amount. Part of the creature reaches out past the body; the mass stays
  where it is. This is the cell the player sees most often, so it must be the
  most restrained.
- EACH SKILL BREAKS OUT OF THE BODY IN ITS OWN DIRECTION, and that direction is
  decided by what the skill actually does in the game (stated per cell below).
  A skill that hits the whole party goes WIDE or UP and the whole mass commits.
  A skill that hits one character very hard goes LONG and NARROW and aims at one
  point. Those two must never look alike.
- DOWN is struck. Something has failed structurally — split, torn off, buckled.
  It is the only cell where the creature is losing.

TEST: put the cells side by side and squint until they blur. If you cannot say
which is which, redraw. Changing a detail is not enough; change the outline."""


SKILL_CELL = """DRAWING A SKILL CELL.

- IT IS THE WIDEST OR THE TALLEST CELL of the sheet, and which one depends on the
  skill. Whatever the creature normally occupies, this pose breaks out of it in
  ONE clear direction.
- THE WHOLE BODY COMMITS. Not one limb — the mass itself is thrown into it, and
  the parts that normally trail behind are flung wide.
- SOMETHING LEAVES THE BODY. Three or four loose pieces (spores, splinters,
  thorns, clods, drops) in the air around it, clear of the outline. That is what
  says the attack reaches past arm's length.
- THE POSE IS HELD, not mid-swing. It is one frame; a blur reads as nothing. Draw
  the instant of maximum extension, when everything has already been thrown and
  nothing has come back yet.

Do NOT draw impact marks, shockwave rings, motion arcs, or the ground cracking.
The game draws its own effects on top, and a ring drawn into the sprite lands on
screen as a white smear that never goes away."""


NAMED = """THIS ONE HAS A NAME. IT IS AN INDIVIDUAL, NOT A SPECIES.

Every other enemy in this game is one of many — there are eight of that slime
standing in a row. This one is the only one there has ever been, and the player
is told its name when it arrives.

So it must not look like a well-drawn example of its kind. Something about it has
to be an ACCIDENT that happened to this one creature and could not repeat: a
specific thing lodged in it at a specific angle, a specific break healed a
specific wrong way, a growth that went in a direction the others do not go. That
accident is named in the description above. It is the most important shape on the
sheet after the overall silhouette, and it is present and identical in EVERY cell
— it does not appear only when convenient."""


SLIME_BOSS = """WHAT THIS IS: A SLIME, GROWN OLD.

Not a ball of jelly. Not a mascot blob. A body of thick, heavy, semi-solid matter
that holds a shape because it is dense, not because it has bones.

- IT HAS NO SKELETON AND NO LIMBS. Anything that reaches out is the mass itself
  stretched into a shape, thick at the root and thinning as it goes, and it will
  sag under its own weight before it gets far.
- THE OUTLINE IS NEVER CLEAN. It bulges where it is heavy and hangs where it is
  loose. No two spots on the edge curve the same way. A smooth egg is wrong.
- WHAT IT ATE IS STILL INSIDE, and it shows as hard shapes suspended in the mass
  at wrong angles — never arranged, never centred, never symmetrical.
- DRIPS HANG AND STOP. They hang in empty black and end. They never pool, spread,
  or form a puddle on the floor.
- SURFACE: torn, pitted, crusted in patches. Not glossy, not smooth, no highlight
  blobs. The 1-bit palette has no way to draw wet, and trying makes it look like
  plastic."""


GROWTH_BOSS = """WHAT THIS IS: SOMETHING THAT GREW, AND KEPT GROWING AFTER IT SHOULD HAVE STOPPED.

A plant or a tree that hunts. It is not an ent, not a treant, not a person made of
wood. There is no face carved into a trunk and no arms in the shape of arms.

- IT GREW INTO THIS SHAPE. Every part is growth — a stem, a cane, a root, a
  branch — that went where it should not have gone. Nothing is built, jointed, or
  attached.
- IT REACHES BY GROWING, NOT BY SWINGING. What comes at you is longer in the
  attack cells than in the idle cell, because it extended, not because it moved.
- ASYMMETRY IS THE RULE. One side is heavier, longer, more broken. A plant that
  mirrors itself reads as a decoration.
- WHAT IT CAUGHT IS HELD IN THE GROWTH — bone, iron, worked stone — grown around
  and half swallowed, never tied on or balanced on top.
- DEAD AND LIVING TOGETHER: part of it is grey, split and hollow, and new growth
  comes out of the dead part. That contrast is what says it is old."""


PASSIVE_MARK = """IT IS ALWAYS DOING SOMETHING, EVEN STANDING STILL.

This creature has a passive ability that never turns off, and the game shows a
small logo at the top of the screen for the whole fight to say so. The sprite has
to agree with that logo: the thing the passive does must be VISIBLE IN EVERY
CELL, including idle and including down.

It is named in the description above. Draw it as a permanent structural feature,
not as an effect — an effect drawn into the sprite becomes a white smear that
never goes away."""


# ══ 우두머리 ══════════════════════════════════════════════════

def boss(id_, name, latin, stage, family, fill, lock, idle, attack, skills, down,
         intro, passive=None):
    """우두머리 하나.

    `skills` 는 `(칸이름, 한글이름, 게임에서 하는 일, 그림 설명)` 목록이다.
    하나면 넷 칸, 둘이면 다섯 칸짜리 시트가 된다 — 칸 수를 따로 안 적는 이유는
    **적을 수 있으면 어긋날 수 있기 때문**이다. 기술이 몇 개인지가 곧 칸 수다.
    """
    frames = [('idle', '대기', idle), ('attack', '평타', attack)]
    frames += [(sid, ko, art) for sid, ko, _does, art in skills]
    frames += [('down', '피격', down)]
    return {
        'id': id_, 'name': name, 'latin': latin, 'stage': stage,
        'family': family, 'fill': fill, 'lock': lock, 'frames': frames,
        'skills': skills, 'passive': passive, 'intro': intro,
    }


BOSSES = [
    # ══ 01~10 · 오염된 응집체들의 평원 ═══════════════════════════
    boss(
        'b01_gelatus', '탐식의 거대 슬라임', '젤라투스', 1, 'slime', 74,
        'The slime that ate the whole plain and did not stop being hungry.' + NL
        + 'BODY: a VAST LOW DOME, twice as wide as it is tall, sagging hard to one '
        'side under its own weight. The base spreads and loads; the top overhangs '
        'the base on the heavy side. It is the single biggest mass in the chapter.'
        + NL
        + 'THE MOUTH IS THE WHOLE FRONT. A split runs most of the width of the '
        'body, held open, with SEVEN teeth around it — three long ones on the '
        'upper rim, four shorter and snapped below, all different lengths. It is '
        'far too big for anything it could reasonably eat.' + NL
        + 'EYES: FOUR. One enormous, a third of the body width, sunk low and left. '
        'Two small ones high on the right at different heights. One tiny, almost '
        'closed, out on the sagging side. None of them look the same way.' + NL
        + 'THE ACCIDENT — this one only: a CART AXLE with one wheel still on it is '
        'sunk through the body at a steep diagonal, the wheel standing clear above '
        'the top edge on the light side and the axle end emerging below on the '
        'heavy side. It went in whole and stayed. The wheel is the shape you see '
        'first from across the field.' + NL
        + 'ALSO INSIDE, smaller and deeper: two ribs and a broken millstone.' + NL
        + 'SCARS: three long healed splits across the top, closed and ridged.' + NL
        + 'FOUR heavy gobbets hang off the underside and stop in empty black.',
        'settled and enormous, the mouth slack and half open, the cart wheel '
        'standing up off the top. The mass has spread where it sits. Nothing moves '
        'and it is still the widest thing on the field.',
        'the bite. The front third of the mass has surged FORWARD off the base, '
        'stretched into a blunt reaching head with the mouth wide, teeth showing. '
        'The back of the body is dragged after it and thins. It goes forward and '
        'stays low — this is the restrained cell.',
        [('skill1', '뭉개기',
          '아군 전체에 공격력의 90%만큼 물리 피해 (평타 4대마다)',
          'CRUSH — it hits EVERYONE AT ONCE, so it goes UP, not forward. The entire '
          'mass has REARED into a towering column, gathered high and narrow, twice '
          'the height of the idle cell and much narrower, the base pulled in and '
          'barely holding. The cart wheel has been carried up to the very top. It '
          'is the TALLEST cell of the sheet. Everything is about to come down at '
          'once. Six gobbets are flung loose and hang clear around the column.')],
        'struck. The dome has burst along one healed split and the whole heavy side '
        'is collapsing outward, the axle wrenched half free and tipping, the mouth '
        'wrenched open the wrong way. The ribs show through the gash.',
        """1스테이지 우두머리. 이 게임에서 처음 만나는 우두머리입니다.

**처음이라 제일 단순해야 합니다.** 기술이 하나고, 그 하나가 "전원을 친다"
입니다. 그래서 3번 칸은 앞이 아니라 **위**로 갑니다 — 앞으로 가면 2번 칸(평타)
과 구분이 안 되고, 그러면 첫 우두머리에서부터 "기술이 뭔지 모르겠다" 로
시작합니다.

수레바퀴가 이 놈만의 사고입니다. 네 칸 전부에 있어야 하고, 3번 칸에서는
기둥 꼭대기까지 딸려 올라가 있어야 합니다.""",
    ),

    boss(
        'b02_floratus', '수림을 침식한 덩굴 슬라임', '플로라투스', 2, 'slime', 68,
        'A slime that crawled into a thicket and came out with the thicket still '
        'in it.' + NL
        + 'BODY: a heavy upright mass, TALLER THAN WIDE, leaning forward. Running '
        'THROUGH it, entering one side and coming out the other, are FIVE thick '
        'woody VINE CORDS — you can see them as dark solid lines inside the mass '
        'and as loose ends outside it. They are not decoration: they are the '
        'skeleton it should not have.' + NL
        + 'THE LOOSE ENDS: three trail behind and hang; two reach forward past the '
        'body, ending in tight curled hooks. Even at rest it is longer than it '
        'looks.' + NL
        + 'THE MOUTH is a vertical split down the front, narrow, with FIVE inward '
        'teeth — smaller than most bosses, because this one does not bite, it '
        'takes hold.' + NL
        + 'EYES: THREE, all on the upper half, one large and two small, the large '
        'one half grown over by a vine crossing it.' + NL
        + 'THE ACCIDENT — this one only: one vine has grown a full CIRCLE outside '
        'the body, a closed loop as wide as the head, standing clear off the '
        'upper back like a snare already tied and waiting. Nothing else in the '
        'chapter has a closed ring in its outline.' + NL
        + 'SCARS: two healed splits where vines pushed out through the surface, '
        'the mass puckered around them.',
        'standing upright, the two forward vines lowered and curled, the loop '
        'standing clear behind the head. It has not extended yet and that is what '
        'makes the next cell read.',
        'the jab. ONE forward vine has driven out straight ahead, short and '
        'stiff, and the body has leaned after it. The other four stay where they '
        'are. Nothing else changes — the mass barely moves.',
        [('skill1', '식인 덩굴 휘감기',
          '단일 대상에게 공격력의 200%만큼 큰 물리 피해 (평타 4대마다)',
          'CONSTRICT — it hits ONE character very hard, so it goes LONG AND NARROW '
          'and aims at one point. ALL FIVE vines have shot out FORWARD together in '
          'a tight parallel bundle, stretched to three times the width of the body, '
          'reaching almost to the far side of the cell but stopping clear of it, '
          'and the closed loop has been '
          'carried out along them and is snapping shut at the far end. The mass '
          'itself is dragged forward and thin, almost emptied, leaning far past its '
          'own base. It is the WIDEST cell and it is not tall at all — it is a '
          'spear, not a wave. Four torn leaves hang in the air along the bundle.')],
        'struck. Three vines are snapped and springing back, the body split open '
        'along one of the old puckers, the loop broken and hanging by one end. The '
        'mass sags off its own base.',
        """2스테이지 우두머리.

**1스테이지와 정반대 방향으로 커야 합니다.** 젤라투스의 기술은 위로 솟고,
이놈의 기술은 옆으로 뻗습니다 — 하나는 전원을 치고 하나는 한 명을 크게 치기
때문이고, 화면에서 그 둘이 다르게 보이는 것이 이 챕터 전체의 규칙입니다.

닫힌 고리 하나가 이 놈만의 사고입니다. 평소에는 등 뒤에 그냥 서 있다가,
3번 칸에서 덩굴을 타고 저 끝까지 나가서 닫힙니다.""",
    ),

    boss(
        'b03_acidus', '부식을 흩뿌리는 산성 슬라임', '아시두스', 3, 'slime', 66,
        'A slime that dissolves what it touches, including itself.' + NL
        + 'BODY: a rounded mass EATEN THROUGH — the outline is broken by four or '
        'five HOLES that go all the way through, of different sizes, so you can see '
        'black on the far side. The largest is a quarter of the body. It is a body '
        'with gaps in it, and that is the read from across the field.' + NL
        + 'AROUND THE HOLES the edges are ragged and thinned, mid-collapse.' + NL
        + 'THE SURFACE is pitted all over with smaller craters, and TEN long thin '
        'drips hang from the underside and from the lower rims of the holes, each '
        'ending in a hanging bead. They stop in empty black.' + NL
        + 'THE MOUTH is small for a boss and set low — a round puckered vent rather '
        'than a jaw, ringed with SIX short blunt teeth already half dissolved.' + NL
        + 'EYES: FIVE, scattered, all small, none larger than a tenth of the body, '
        'two of them sitting right at the rim of a hole and deformed by it. The '
        'usual "one enormous eye" is deliberately absent here — this one is going.'
        + NL
        + 'THE ACCIDENT — this one only: a bronze BELL, cracked, is jammed in the '
        'largest hole, held by its rim, mouth outward, so the body has a hard '
        'round opening in it that is not a wound. It rings when the thing moves and '
        'it has been half eaten away on the lower edge.' + NL
        + 'SCARS: nothing has healed on this one. It does not close over.',
        'standing still and slowly coming apart, drips hanging long, the bell '
        'sitting in the big hole. The holes are at their smallest here — this is '
        'the most intact the player will see it.',
        'the spit. The mass has clenched inward around the low vent and ONE thick '
        'glob has just left it, hanging in the air ahead of the body, clear of the '
        'outline, with a short thin thread still trailing back to the vent. The '
        'body itself has barely moved forward. One glob, one direction.',
        [('skill1', '맹독 오물 분사',
          '아군 전체에 3초간 지속 마법 피해 (0.5초마다 공격력의 10%) '
          '(평타 6대마다)',
          'SPRAY — it hits EVERYONE and it keeps hurting after it lands, so it is '
          'a WIDE FAN of many separate pieces rather than one mass. The body has '
          'contracted into a hard squat lump, much SMALLER than the idle cell, and '
          'every hole and every crater has become a vent: TWELVE OR MORE separate '
          'globs of different sizes are leaving it at once in a broad fan that '
          'spreads across the full width and height of the cell, clear of the body '
          'on all sides. The bell is ringing outward in the fan. It is the WIDEST '
          'cell, but the creature inside it is the smallest it ever is — the cell '
          'is full of what left, not of the body.')],
        'struck. Two of the holes have torn into each other and the body is coming '
        'apart into an upper and a lower half joined by one thin neck. The bell has '
        'fallen out of its hole and hangs by nothing.',
        """3스테이지 우두머리.

**이놈은 몸이 커지는 게 아니라 작아집니다.** 3번 칸에서 몸을 뭉쳐 작게 만들고
칸을 채우는 것은 **몸에서 나간 것들**입니다 — 지속 피해라 "한 방"이 아니라
"뿌려졌다" 로 읽혀야 하고, 그건 덩어리 하나로는 안 됩니다.

구멍이 뚫린 몸이 실루엣입니다. 눈이 다섯인데 전부 작은 것도 일부러입니다 —
다른 우두머리는 "큰 눈 하나" 규칙을 지키지만 이놈만 안 지킵니다. 녹고 있는
중이라서입니다.""",
    ),

    boss(
        'b04_sporia', '역병을 삼킨 포자 슬라임', '스포리아', 4, 'slime', 70,
        'A slime that swallowed something diseased and became a place for it to '
        'grow.' + NL
        + 'BODY: a heavy mass whose whole upper half is covered in SEVEN SWOLLEN '
        'SACS of different sizes, packed together, each a taut ball on a short '
        'neck. They break the outline into a lumpy crowded ridge — from across the '
        'field the top of this creature is a cluster, not a curve. Three of the '
        'sacs are already SPLIT and gaping.' + NL
        + 'THE LOWER HALF is the actual body, smooth by comparison and sagging, '
        'much smaller than the load it is carrying. It is top-heavy and leaning.'
        + NL
        + 'THE MOUTH is a wide low slit under the sac cluster, almost hidden by it, '
        'with SIX uneven teeth.' + NL
        + 'EYES: THREE, all crowded down into the small lower half because the sacs '
        'have taken everything above. One large, two small, all squinting upward '
        'from under the load.' + NL
        + 'THE ACCIDENT — this one only: a PHYSICIANS MASK, the long-beaked kind, '
        'is sunk into the front of the body beak-first at a downward angle, so the '
        'beak points at the ground and the round eyepieces sit flush in the mass '
        'like two more eyes that do not match the real ones. It is cracked across '
        'one lens.' + NL
        + 'SCARS: two healed splits low on the body, and a hard grey crust spreading '
        'up from where the mask went in.',
        'standing crowded and top-heavy, all seven sacs taut, three of them gaping, '
        'the mask beak angled down at the front. A few loose spores drift down past '
        'the body. It is at its tallest and lumpiest here.',
        'the puff. ONE sac at the front has clenched and fired — a tight narrow '
        'clump of spores is leaving it in a straight line ahead, clear of the body, '
        'with two speed lines. That sac is now visibly deflated and wrinkled while '
        'the other six stay taut. One sac, one direction.',
        [('skill1', '환각 포자 폭발',
          '아군 전체의 공격속도를 5초간 50% 감소 (평타 6대마다)',
          'BURST — it hits EVERYONE and it does no damage at all; it slows them. So '
          'nothing about this cell is sharp or forward. ALL SEVEN SACS HAVE BURST '
          'AT ONCE: the entire cluster has collapsed into torn empty flaps, the top '
          'of the creature has caved in, and the body is now SHORTER AND WIDER than '
          'the idle cell, slumped and emptied. Filling the whole cell around it, '
          'clear of the outline on every side, is a broad even CLOUD of fifteen or '
          'more spore clumps of different sizes — no direction, no spearhead, '
          'spreading equally in all directions including downward. It is the '
          'WIDEST cell. The mask beak is the only hard shape left standing in it.')],
        'struck. The lower body has split and the whole sac cluster is sliding off '
        'sideways, four sacs torn loose and falling. The mask is wrenched half out '
        'and hangs by the beak.',
        """4스테이지 우두머리.

**피해가 0 인 기술입니다.** 공격속도를 깎을 뿐이라, 3번 칸이 날카로우면 안
됩니다 — 앞으로 뻗은 것도, 뾰족한 것도 없어야 합니다. 주머니 일곱이 한꺼번에
터지면서 몸이 **주저앉고**, 칸을 채우는 것은 사방으로 고르게 퍼진 구름입니다.

3스테이지 아시두스와 같은 "몸이 작아지고 나간 것이 칸을 채운다" 구조지만
방향이 다릅니다 — 아시두스는 앞으로 부채꼴이고, 이놈은 **방향이 없습니다.**""",
    ),

    boss(
        'b05_spinatus', '통곡을 부르는 가시 슬라임왕', '스피나투스', 5, 'slime', 76,
        'The thorn slime that everything else in the plain learned not to touch.'
        + NL
        + 'BODY: an upright mass BRISTLING WITH SPINES on every side — thirty or '
        'more hard black spikes pushing out through the surface at every angle, '
        'longest along the top and back, shortest at the base. The outline is '
        'broken everywhere; there is no smooth stretch of edge anywhere on this '
        'creature. From across the field it is a silhouette with no curve in it.'
        + NL
        + 'THE SPINES ARE PART OF THE PASSIVE and must be in every cell, including '
        'down. They are not a pose.' + NL
        + 'THE MOUTH is a hard downturned split, wide, with EIGHT long teeth, the '
        'two outer ones curving up outside the lip.' + NL
        + 'EYES: FOUR, one enormous and low-set, three small and high, two of them '
        'pushed apart by a spine growing between them.' + NL
        + 'THE ACCIDENT — this one only: a BROKEN CROWN, a plain heavy iron band '
        'with three of its five points snapped off, is sunk edge-first into the '
        'upper mass at a crooked angle — nowhere near the top, tilted, half '
        'swallowed, with spines grown up through the gaps where the missing points '
        'were. It was eaten, not worn, and it must never look balanced or placed.'
        + NL
        + 'SCARS: three healed splits, each with spines growing out of the seam.',
        'standing tall and bristling, every spine out, the crown sunk crooked in '
        'the upper mass. It does not need to move; the shape is already a warning.',
        'the drive. The body has leaned hard forward and ONE of the long top '
        'spines has been driven out ahead of the mass, the surrounding surface '
        'bunched behind it to push. The other spines stay exactly as they are. One '
        'spine, forward, short reach.',
        [('skill1', '칼날 가시 난사',
          '아군 전체에 공격력의 100%만큼 물리 피해, 3초간 출혈 '
          '(0.5초마다 공격력의 5%) (평타 6대마다)',
          'VOLLEY — it hits EVERYONE and leaves them bleeding, so the spines LEAVE '
          'THE BODY and go outward in every direction at once. The mass has '
          'CONTRACTED hard into a tight knot, smaller than idle, and TWENTY spines '
          'have launched clear of it — radiating outward on all sides, at every '
          'angle, spread across the full width and height of the cell, none of them '
          'touching the body any more. The surface it left is pocked with the empty '
          'sockets they came out of. Enough spines remain in the body that the '
          'passive still reads. It is the widest and tallest cell, but the creature '
          'is the smallest it ever is.')],
        'struck. The knotted mass has burst along a seam, a third of the spines '
        'snapped off short, the crown wrenched loose and tipping out of the gash.',
        """5스테이지 우두머리. 이 챕터 전반부의 마지막이고, **첫 패시브 보유자**입니다.

패시브 **가시 갑옷**은 맞을 때마다 때린 쪽에 되돌려 주는 것이라, 가시가
"공격할 때 나오는 것" 이면 안 됩니다. **네 칸 전부에**, 피격 칸에도 박혀
있어야 합니다 — 화면 위쪽에 로고가 계속 떠 있는 동안 그림에 가시가 없으면
로고가 거짓말이 됩니다.

부러진 왕관은 **쓴 게 아니라 먹은 것**입니다. 머리 꼭대기에 반듯하게 얹히면
실패입니다 — 비스듬히 박혀 있고, 빠진 뿔 자리로 가시가 자라 나와야 합니다.""",
        passive=('가시 갑옷',
                 '피격 시 공격자에게 보스가 받은 피해의 10%만큼 물리 반사 피해'),
    ),

    boss(
        'b06_petros', '대지를 짓누르는 암석 슬라임', '페트로스', 6, 'slime', 72,
        'A slime that has been swallowing the plain itself for a very long time.'
        + NL
        + 'BODY: a broad low mass with SIX LARGE ANGULAR BOULDERS embedded in it at '
        'different depths and angles — three breaking the top edge as hard straight '
        'facets, two half sunk in the sides, one nearly swallowed and showing only '
        'a corner. The silhouette is therefore made of FLAT STRAIGHT SEGMENTS and '
        'sharp corners where the rock is, and soft sagging curves only in the gaps '
        'between. Nothing else in the chapter has straight lines in its outline.'
        + NL
        + 'THE LARGEST BOULDER sits forward on one side, bigger than the head of '
        'any mob, and the mass around it has stretched thin holding it.' + NL
        + 'THE MOUTH is a broad horizontal split low at the front, with SEVEN teeth '
        'that are themselves broken stone chips, not tapered points.' + NL
        + 'EYES: THREE, one enormous and set deep in a gap between two boulders so '
        'the rock overhangs it like a brow, two small and low.' + NL
        + 'THE ACCIDENT — this one only: a MILESTONE, a squared worked pillar with '
        'a chamfered top, is standing UPRIGHT and unbroken right through the middle '
        'of the mass, taller than the body, sunk to half its length. Everything '
        'else it ate is rubble; this one thing is straight and made by hands, and '
        'it has not been dissolved at all.' + NL
        + 'SCARS: two healed splits running between boulders, ridged and grey.',
        'settled low and wide under the load, the milestone standing upright out of '
        'the middle, boulders still. It looks like a piece of the ground that has '
        'not moved in years.',
        'the swing. The mass has heaved to one side and the LARGEST BOULDER has '
        'been thrown forward on a thick stretched neck of jelly, out past the body, '
        'like a head on the end of a flail. The rest of the mass is dragged after '
        'it and thins. One rock, forward, at the end of a short reach.',
        [('skill1', '암석 낙하',
          '아군 전체에 공격력의 130%만큼 물리 피해, 맞은 대상 30% 확률로 '
          '3초간 기절 (평타 6대마다)',
          'ROCKFALL — it hits EVERYONE from above and can stun, so the rocks GO UP '
          'and the creature is looking up under them. The whole mass has REARED '
          'BACK and arched, the base braced wide and flat, and FIVE of the six '
          'boulders have been thrown clear UPWARD — they hang in the air above the '
          'body, spread across the top third of the cell at different heights, none '
          'touching it. The body below them is left soft, emptied and pocked with '
          'the sockets they came out of, and the milestone is still standing '
          'upright in it, the only hard thing left. It is the TALLEST cell, and the '
          'top half of it is empty black with rocks in it.')],
        'struck. The mass has split under the weight and two boulders are sinking '
        'through the gash, the milestone tipping hard out of vertical for the first '
        'time. The overhanging brow of rock has broken off the big eye.',
        """6스테이지 우두머리. 배경이 바뀌는 지점입니다.

**윤곽에 직선이 있는 유일한 놈입니다.** 슬라임은 전부 곡선인데 이놈만 바위
때문에 각이 집니다 — 그게 실루엣이고, 후반부가 시작됐다는 신호입니다.

3번 칸에서 바위가 **위로** 갑니다. 젤라투스의 기둥도 위로 가지만 그건 몸이
올라가는 것이고, 이놈은 **몸은 남고 바위만** 올라갑니다. 칸의 위쪽 3분의 1은
검은 하늘에 바위만 떠 있어야 합니다.

이정표는 절대 안 녹습니다. 5번 칸(피격)에서 처음으로 기울어집니다.""",
    ),

    boss(
        'b07_idolatus', '고대 우상의 절단 슬라임', '이돌라투스', 7, 'slime', 70,
        'A slime that swallowed a temple idol and took its shape from what it ate.'
        + NL
        + 'BODY: an upright mass built around ONE HUGE PIECE OF CARVED STONE — the '
        'upper half of a broken idol, a squared torso with one intact STONE ARM, '
        'sunk into the jelly from the waist down so the stone shoulder and arm '
        'stand clear above the mass. The creature is jelly below and statue above, '
        'and the join is a ragged line, not a seam.' + NL
        + 'THE STONE ARM ends not in a hand but in a broad flat CHOPPING EDGE, '
        'worn and chipped, as long as the mass is wide. It hangs at rest. This is '
        'the shape the whole silhouette is built on.' + NL
        + 'THE IDOL HAS NO HEAD — it was broken off long before. The stump of the '
        'neck is a rough flat break.' + NL
        + 'THE MOUTH is in the jelly, low and to one side of the stone, a long '
        'slit with SIX teeth.' + NL
        + 'EYES: FOUR, all in the jelly, none on the stone. One enormous at the '
        'base of the stone torso, looking up along it. Three small and scattered.'
        + NL
        + 'THE ACCIDENT — this one only: the idol is sunk in CROOKED, tilted well '
        'off vertical, and the jelly has had to grow up one side to hold it, so the '
        'whole creature leans and one side is much heavier than the other. It has '
        'been off balance for centuries.' + NL
        + 'SCARS: two healed splits in the jelly radiating from where the stone '
        'entered.',
        'standing crooked under the leaning idol, the stone arm hanging down and '
        'across the body, the chopping edge near the ground. Everything waits on '
        'that arm.',
        'the chop. The stone arm has come forward and down in a short arc, the '
        'edge out past the front of the body at chest height, the jelly bunched to '
        'drive it. The idol itself has hardly turned. Short, forward, one arm.',
        [('skill1', '양단 직격',
          '단일 대상에게 공격력의 200%만큼 큰 물리 피해, 3초간 출혈 '
          '(0.5초마다 공격력의 5%) (평타 5대마다)',
          'CLEAVE — it hits ONE character very hard, so it goes UP and comes down '
          'on a single point, not outward. The stone arm has been RAISED TO FULL '
          'EXTENSION straight above the idol, the edge at the very top of the cell, '
          'and the entire jelly body has been hauled up and stretched under it into '
          'a taut column to lift that weight. The whole creature is a single '
          'vertical line from the raised edge to the narrowed base. It is by far '
          'the TALLEST and NARROWEST cell of the sheet — it must not spread. Four '
          'stone chips fly loose from the edge.')],
        'struck. The jelly has torn away from the stone down one side and the idol '
        'is tipping out of it, the arm dropping. Two of the small eyes are gone '
        'with the torn jelly.',
        """7스테이지 우두머리.

**칸이 좁아야 하는 유일한 기술입니다.** 한 명에게 200% 를 꽂는 기술이라
3번 칸은 넓으면 안 됩니다 — 위로 길고 **좁은 세로 한 줄**이어야 합니다.
페트로스(6판)가 바로 앞에서 넓게 뿌리므로, 연달아 보면 차이가 확실합니다.

돌팔은 네 칸 전부에서 같은 팔입니다. 길이도 두께도 안 변하고, **각도만**
바뀝니다.""",
    ),

    boss(
        'b08_solvenus', '만물을 녹이는 융해 슬라임', '솔베누스', 8, 'slime', 64,
        'A slime that is dissolving everything around it, and is most of the way '
        'through dissolving itself.' + NL
        + 'BODY: a mass that has LOST ITS TOP — the upper third has slumped over '
        'and hangs down one side in a heavy fold, like a wave that broke and never '
        'came back. The high point is therefore not in the middle but off to one '
        'side, and the fold overhangs the base by a wide margin. It stands, but it '
        'is losing.' + NL
        + 'FROM THE FOLD hang TWELVE long drips of very different lengths, the '
        'longest reaching two-thirds of the way down, each ending in a hanging '
        'bead. They hang in empty black and stop. NO POOL, NO PUDDLE, NO SPREAD ON '
        'THE FLOOR.' + NL
        + 'THINGS HALF DISSOLVED are suspended through the mass at all depths — a '
        'sword eaten down to a stub, a helm with one side gone, a wheel rim, a '
        'jawbone. Six or seven, each clearly PARTLY gone, thinned and holed. This '
        'is the read: everything inside is halfway to nothing.' + NL
        + 'THE MOUTH is a wide soft opening in the underside of the fold, with only '
        'FOUR teeth left and all four blunted to stumps.' + NL
        + 'EYES: THREE, one enormous and sagging out of round, two small, all of '
        'them low because the upper mass has slid away from them.' + NL
        + 'THE ACCIDENT — this one only: a CHURCH BELL CLAPPER, a long iron rod '
        'with a heavy round head, hangs point-down out of the underside of the fold '
        'with its top still gripped in the mass, swinging free. It is the only '
        'thing in the body that is not being dissolved, and it hangs lower than '
        'every drip.' + NL
        + 'SCARS: the surface does not heal here either — three open splits, thin '
        'and stretched.',
        'standing slumped with the fold hanging over, drips long and still, the '
        'clapper hanging lowest. The high side is at its highest here.',
        'the smear. The fold has swung forward and one thick arm of the mass has '
        'reached out ahead, ALREADY DISSOLVING as it goes — it is thick at the '
        'root and comes apart into four separate drips before it ends, so it does '
        'not arrive as one shape. The body behind barely moves.',
        [('skill1', '강산성 융해 액',
          '아군 전체에 5초간 지속 마법 피해 (0.5초마다 공격력의 12%) '
          '(평타 6대마다)',
          'CURTAIN — it hits EVERYONE for a long time, so it is a WALL OF FALLING '
          'LIQUID, not a throw. The creature has REARED the fold up and over into a '
          'tall breaking crest that arches across the entire width of the cell, and '
          'from the whole length of that crest a CURTAIN of twenty-odd drips of '
          'different lengths is falling — a continuous hanging sheet, evenly spread '
          'across the cell, none of it reaching the bottom edge and none of it '
          'pooling. The body is a narrow braced stalk under the crest, holding it '
          'up. It is the TALLEST AND WIDEST cell. The clapper has been carried up '
          'and swings out at the crest.')],
        'struck. The crest has fallen — the fold has torn clean off the body and is '
        'sliding away, the stalk buckling under nothing. The half dissolved sword '
        'and helm are falling out through the tear.',
        """8스테이지 우두머리.

**눕지 않으면서 액체로 보여야 합니다.** 쿼터뷰 바닥이 누운 것을 못 받쳐
주므로(`STANDS`) 웅덩이도 번짐도 안 됩니다. 대신 **접힌 윗부분이 옆으로
넘어가 있고** 거기서 물방울이 길게 떨어지다 검은 허공에서 그냥 끊깁니다.

3번 칸은 파도의 마루입니다. 아시두스(3판)가 부채꼴로 뿌리고 이놈은 **커튼**
처럼 내립니다 — 둘 다 전체 지속 피해지만 하나는 날아가고 하나는 떨어집니다.

종추 하나만 안 녹습니다. 언제나 제일 아래에 있어야 합니다.""",
    ),

    boss(
        'b09_osseus', '백골을 품은 뼈무덤 슬라임', '오세우스', 9, 'slime', 68,
        'A slime that has been feeding at the same place for so long that one of '
        'the dead never came apart.' + NL
        + 'BODY: a heavy upright mass, fairly clean of outline compared to the rest '
        'of this chapter, because almost everything it swallowed HAS dissolved. '
        'It is smoother and darker than its neighbours and that is the point.' + NL
        + 'INSIDE IT, ONE SKULL. Large — a fifth of the body — half dissolved down '
        'one side so the cheek and jaw on that side are gone to nothing while the '
        'other side is intact. It sits high in the mass, tilted back, looking '
        'upward. IT IS THE ONLY WHOLE BONE IN THE BODY.' + NL
        + 'BREAKING THE OUTLINE, exactly TWO long bones protrude — one femur '
        'pushing out through the upper back at a steep angle, one rib curving out '
        'of the front low down. Only two. The rest of the skeleton is gone.' + NL
        + 'DO NOT FILL IT WITH BONES. A body packed with bones reads as a bone pile '
        'and stops reading as a slime. One skull, two protrusions, nothing else.'
        + NL
        + 'THE MOUTH is a narrow vertical slit set low, with SIX long thin teeth, '
        'the longest two crossing each other.' + NL
        + 'EYES: THREE, the slime\'s own, all on the lower half and well away from '
        'the skull so they are never mistaken for its sockets. One large, two '
        'small.' + NL
        + 'THE ACCIDENT — this one only: the skull is BITTEN THROUGH — a clean '
        'round hole the size of an eye socket punched through the top of the '
        'cranium, with the edge of the hole rolled inward. Something ate it before '
        'the slime did.' + NL
        + 'SCARS: two healed splits, one running right past the skull.',
        'standing still, the skull tilted back and looking up out of the mass, the '
        'femur and rib breaking the outline. Nothing about it is in a hurry.',
        'the jab. The rib low at the front has been driven forward on a short '
        'stretched neck of jelly, out past the body, point first. The skull and the '
        'femur have not moved. Short, low, one point.',
        [('skill1', '백골 가시 찌르기',
          '방어력을 무시하고 단일 대상에게 공격력의 200%만큼 강한 물리 피해 '
          '(평타 3대마다)',
          'PIERCE — it ignores armour entirely and hits ONE character, so it is the '
          'THINNEST, STRAIGHTEST shape on the sheet. The mass has thrown itself '
          'forward and stretched into ONE long horizontal spear reaching almost to '
          'the far edge of the cell but stopping clear of it, three times the '
          'width of the idle body and no '
          'thicker than the skull at any point along it. THE SKULL HAS BEEN DRIVEN '
          'TO THE TIP and leads the spear, the bitten hole facing forward, with the '
          'femur running alongside it as the point. The back end of the creature is '
          'a thin drawn-out tail, nearly empty. It is the WIDEST cell and by far '
          'the lowest — it must not rise. Two chips of bone hang loose behind.')],
        'struck. The spear has collapsed back into a heap, the femur snapped off at '
        'the surface, and the skull has come loose and is falling out of the mass '
        'through a burst split, still tilted back.',
        """9스테이지 우두머리.

**뼈를 많이 넣으면 실패입니다.** 예전에 이 자리의 우두머리가 뼈로 가득 차
있었는데, 그러면 뼈 무더기로 보이고 슬라임으로 안 보입니다. **두개골 하나 ·
튀어나온 뼈 둘**, 그게 전부입니다. 나머지는 다 녹았습니다.

방어를 무시하는 기술이라 3번 칸은 **가늘고 곧고 낮습니다.** 이 챕터에서 제일
얇은 실루엣이어야 하고, 두개골이 창끝에 가 있어야 합니다.

눈 셋은 슬라임 것이고 두개골 눈구멍과 **멀리 떨어져** 있어야 합니다. 붙어
있으면 두개골이 얼굴로 읽힙니다.""",
    ),

    boss(
        'b10_sludginus', '타락한 심연의 슬라임 로드', '슬러지누스', 10, 'slime', 80,
        'Everything the plain dissolved ran downhill into one place, and this is '
        'what it became. It is the last thing in this chapter and it is the '
        'biggest.' + NL
        + 'BODY: ENORMOUS — it fills more of its cell than anything else in the '
        'game. A deep heavy mass, TALLER THAN WIDE, that narrows to a thick base '
        'and swells outward as it rises, so it overhangs its own footing on every '
        'side. The top is a broad slumped crown that leans forward over everything '
        'below it.' + NL
        + 'THE SURFACE IS LAYERED, not smooth: four or five horizontal ridges run '
        'around the body where it settled and set at different times, like tide '
        'marks. It has been filling up for a long time.' + NL
        + 'THE MOUTH is a huge vertical rift down the whole front, from the crown '
        'nearly to the base, held open, with EIGHT teeth down each side of it and '
        'three swallowed blades standing in the rim among them.' + NL
        + 'EYES: SIX, more than anything else in the game. One vast — a third of '
        'the body width — set high in the crown. Three medium at different heights '
        'down one side. Two small and close together low on the other. No two at '
        'the same height, none looking the same way.' + NL
        + 'THE PASSIVE — draw it in every cell: the whole lower half is HUNG WITH '
        'CLINGING THREADS, thirty or more fine strands that stretch downward and '
        'outward off the body and end in the air. They are what it leaves on '
        'whatever it touches. They are never absent, not even in the struck cell.'
        + NL
        + 'THE ACCIDENT — this one only: a full-height IRON GATE, two bars and a '
        'hinge still joined, is sunk vertically through the middle of the body from '
        'the crown down past the base, bent in the middle. Everything else it ate '
        'is chips; this is a whole structure, and it is bent, which nothing else '
        'in the chapter is.' + NL
        + 'SCARS: four healed splits, the longest running the full height.',
        'standing at full height, crown slumped forward, the great rift half open, '
        'threads hanging from the whole lower half, the bent gate showing through '
        'from crown to base. It is the largest silhouette in the game and it is '
        'not doing anything yet.',
        'the surge. The front of the mass has driven forward off the base, the rift '
        'opened wider, and the crown has come down with it — but the body stays '
        'upright and the reach is short. Only the front commits. The threads swing '
        'back behind it.',
        [('skill1', '오염된 심연의 해일',
          '아군 전체에 대량 물리 피해, 3초간 중독 지속 마법 피해 '
          '(0.5초마다 공격력의 15%) (평타 3대마다)',
          'THE WAVE — it hits EVERYONE with the biggest hit in the chapter and then '
          'poisons them, so it takes the ENTIRE CELL. The whole creature has reared '
          'up and curled FORWARD AND OVER into one huge breaking crest that arches '
          'from the base, up to just under the top edge, and back down across the '
          'full width of the cell without touching any edge — the body itself is the wave. The rift is open along the '
          'whole inside of the curl with every tooth showing. Under the curl the '
          'threads have been dragged out into a hanging fringe and eight loose '
          'gobbets hang in the air. The bent gate is carried up in the crest and is '
          'the highest thing in the cell. It is the WIDEST AND TALLEST cell of the '
          'entire game.'),
         ('skill2', '포식의 점액',
          '체력이 가장 낮은 단일 대상에게 공격력의 200%만큼 큰 마법 피해, '
          '입힌 피해량의 50%만큼 보스 체력 회복 (평타 7대마다)',
          'THE FEED — it picks out ONE weakened character, hits them, and heals '
          'itself with it, so this cell is a REACH AND A PULL, not a wave. The body '
          'stays upright and compact — very close to its idle shape and clearly '
          'smaller than the wave cell — while ONE long tube of sludge has shot out '
          'from the rift, thin and straight, reaching almost to the far edge of '
          'the cell but stopping clear of it, '
          'at head height, ending in a SECOND SMALL MOUTH at the tip, open, with '
          'four teeth of its own. The tube is the only thing that has left the '
          'body. The great eye in the crown has turned to follow it and is the only '
          'eye not looking forward. Nothing else moves; the threads hang straight '
          'down. It is the NARROWEST attacking cell on the sheet.')],
        'struck. The crown has caved in and the body has split down one of the long '
        'healed seams from top to base, the two halves leaning apart. The bent gate '
        'is sliding out through the split. Half the threads are torn away and four '
        'of the six eyes are gone with the collapsed crown.',
        """10스테이지 우두머리. **전반 챕터의 마지막이고, 이 게임에서 제일 큽니다.**

**다섯 칸입니다** (대기 · 평타 · 스킬1 · 스킬2 · 피격) — 기술이 둘이라서입니다. 두 기술이 서로 안 닮는 것이 이
시트에서 제일 어려운 부분입니다:

| | 해일 (스킬1) | 포식 (스킬2) |
|---|---|---|
| 누구를 | 전원 | 체력 제일 낮은 한 명 |
| 몸 | 칸 전체를 채운다 | 대기 칸과 거의 같다 |
| 나가는 것 | 없음 (몸이 곧 파도) | 관 하나 |

패시브 **오염된 점성**은 몸 아래쪽에 매달린 실입니다. 여섯 칸 **전부**에
있어야 합니다 — 피격 칸에도요. 화면 위 로고가 계속 떠 있기 때문입니다.

굽은 철문이 이 놈만의 사고입니다. 이 챕터에서 통째로 삼켜진 구조물은 이것
하나뿐이고, **굽어 있는** 것도 이것뿐입니다.""",
        passive=('오염된 점성',
                 '평타에 맞은 적의 공격속도를 3초간 10% 감소, 최대 3중첩(30%). '
                 '중첩되면 지속시간은 3초로 초기화'),
    ),

    # ══ 11~20 · 타락한 군락의 정원 ═══════════════════════════════
    boss(
        'b11_acanthus', '백골을 감싼 가시덤불', '아칸투스', 11, 'growth', 62,
        'Every bramble in the garden grew into one thing, and it grew around what '
        'was lying there.' + NL
        + 'BODY: a WALL of tangled thorny canes, half again WIDER than it is tall. '
        'It is a hedge, not a bush — you cannot step around it. The top edge is a '
        'ragged three-humped line because three separate thickets fused at the '
        'base and you can still see where they were.' + NL
        + 'THORNS break the outline all the way round, longest along the top, and '
        'they point outward in every direction rather than following the canes.'
        + NL
        + 'THREE OPENINGS, one per hump, at different heights, each a low gap in '
        'the canes lined with inward thorns. They do not line up.' + NL
        + 'HELD IN THE TANGLE, one per hump: a RIBCAGE in the big one, a SKULL in '
        'the middle one, a PELVIS in the small one. Three, spread out.' + NL
        + 'EYES: THREE, deep in the tangle, visible as pale gaps between canes — '
        'one large in the big hump, two small. They are behind the thorns, not on '
        'them.' + NL
        + 'THE ACCIDENT — this one only: one cane has grown straight THROUGH the '
        'eye sockets of the skull and out the back, holding it up off the ground '
        'like a head on a pole, so the skull hangs in the middle of the hedge at '
        'an angle nothing could have placed it at.' + NL
        + 'SCARS: two canes across the front are BURNT BLACK and snapped, grown '
        'around by new growth. Someone tried fire and it did not work.',
        'settled wide and low, all three humps still, the three openings turned '
        'different ways, the skull hanging on its cane. It fills the width of the '
        'field and does not need to move.',
        'the lash. The MIDDLE hump has driven forward and a bundle of canes is '
        'thrown out ahead of the hedge, stretched long and thin, thorns swept back '
        'along it. The outer humps stay exactly where they are — only the middle '
        'one commits.',
        [('skill1', '유해의 가시 찌르기',
          '아군 전체에 공격력의 110%만큼 방어 무시 관통 물리 피해, 3초간 출혈 '
          '(0.5초마다 공격력의 5%) (평타 4대마다)',
          'THE VOLLEY — it ignores armour and hits EVERYONE, so the thorns LEAVE '
          'the hedge and go forward together in a flat spread. Every cane has '
          'straightened and swung to point the same way for the first time, and '
          'FIFTEEN OR MORE thorns have launched clear of the body, spread evenly '
          'across the full width of the cell ahead of it, all travelling in the '
          'same direction, none touching the hedge. The hedge behind them is '
          'stripped and combed flat, much lower and thinner than in idle. The skull '
          'on its cane has been thrust forward with them and leads. It is the '
          'WIDEST cell and it is low — a volley, not a wave.')],
        'struck. The middle hump has burst open and the three thickets are coming '
        'apart at the fused base, canes splayed. The cane through the skull has '
        'snapped and the skull is falling.',
        """11스테이지 우두머리. **후반 챕터의 첫 관문**입니다.

잡몹 가시덤불은 **공** 하나인데 이놈은 **세 덩이가 붙은 울타리**입니다. 키운
게 아니라 다른 모양이어야 합니다.

3번 칸은 **낮고 넓습니다.** 관통 피해라 "위에서 쏟아진다" 가 아니라 "앞으로
꿰뚫는다" 로 읽혀야 하고, 그러려면 가시가 전부 **같은 방향으로** 날아가야
합니다. 사방으로 흩어지면 5판 스피나투스와 같은 그림이 됩니다.""",
    ),

    boss(
        'b12_nepenthia', '굶주린 아귀꽃 여왕', '네펜티아', 12, 'growth', 74,
        'The flower that all the other snapping flowers came off, still hungry.'
        + NL
        + 'BODY: TOP-HEAVY AND HUGE. One thick trunk-like stem carrying a MAIN '
        'PITCHER twice the size of a mob flower — a deep vase-shaped cup with a '
        'heavy overhanging lid, held half open. Around it, FOUR SMALLER PITCHERS '
        'on their own shorter stems from the same base, at different heights, '
        'facing different ways, two closed and two gaping.' + NL
        + 'That crowd of five heads is the read: the mob is one head on one stem; '
        'this is a cluster, and the outline is lumpy and crowded rather than clean.'
        + NL
        + 'INSIDE THE MAIN PITCHER, visible past the lip: EIGHT long inward spines '
        'and the rim of the fluid level, marked as a hard line across the inside.'
        + NL
        + 'THE STEM is thick as a leg, bent hard under the load, with two heavy '
        'leaves low down and a swollen ring where it was cut through once and grew '
        'back.' + NL
        + 'EYES: THREE, set into the outside wall of the main pitcher — one large '
        'near the lip, two small further down. The small pitchers have none.' + NL
        + 'THE ACCIDENT — this one only: a SWORD hangs point-down from the lip of '
        'the main pitcher, gripped between the lid and the rim, most of the blade '
        'eaten away to a ragged stub. It has been hanging there long enough that '
        'the lid has grown around the hilt.' + NL
        + 'ROOTS: a wide splayed knot, lifting clear on one side.',
        'the main pitcher hung forward and down, lid half raised, the four small '
        'pitchers turned outward around it like a watch being kept. The sword hangs '
        'still. Nothing moves and everything is aimed.',
        'the bite. The main pitcher has whipped forward on its stem, thrown out '
        'ahead of the roots, lid snapped wide and every spine showing. The four '
        'small pitchers trail behind, dragged along by the lunge. Forward, short, '
        'one head.',
        [('skill1', '포식자의 소화액',
          '단일 대상에게 3초간 지속 마법 피해 (0.5초마다 공격력의 15%), '
          '5초간 공격속도 50% 감소 (평타 5대마다)',
          'THE POUR — it soaks ONE character and keeps burning them, so this is a '
          'single aimed STREAM, not a spray. The main pitcher has been TIPPED RIGHT '
          'OVER on its stem, mouth down, almost upside down, and a thick continuous '
          'ROPE OF FLUID is pouring out of it in one unbroken arc, down and forward '
          'to a single point just inside the low corner of the cell. The arc is '
          'the longest '
          'line on the sheet and it does not spread or break up — one stream, one '
          'destination. The stem is bent double under the tipped weight and the '
          'four small pitchers are hanging the wrong way up, unused. The sword has '
          'swung out and hangs clear. It is the TALLEST cell and it is diagonal.')],
        'struck. The main pitcher is wrenched open the wrong way, the lid torn half '
        'off, and two of the small pitchers have snapped off their stems and are '
        'falling. The sword is gone.',
        """12스테이지 우두머리.

**부어야 합니다.** 지속 피해지만 대상이 한 명이라, 3판 아시두스처럼 사방으로
뿌리면 안 됩니다 — 항아리를 **뒤집어서** 한 줄기로 한 점에 쏟아야 합니다.
시트에서 제일 긴 선이고, 대각선입니다.

머리 다섯이 실루엣입니다. 잡몹 아귀꽃은 하나고 이놈은 다섯이라, 윤곽이
깔끔한 하나가 아니라 울퉁불퉁한 덩어리여야 합니다.""",
    ),

    boss(
        'b13_matrona', '대지를 조여오는 덩굴 모체', '마트로나', 13, 'growth', 72,
        'The mother root that every vine in this garden is a branch of.' + NL
        + 'IT IS A PLANT. NOT A ROPE, NOT A SNAKE, NOT A CABLE. That is the single '
        'easiest thing to get wrong here, because the body is long and coiled, and '
        'a long coiled thing with a smooth even surface is a rope no matter what '
        'else the description says. Everything in the next three paragraphs exists '
        'to stop that.' + NL
        + 'BODY: ONE ENORMOUS WOODY STEM, COILED. It is far longer than the cell is '
        'wide and it shows that by DOUBLING BACK ON ITSELF — four heavy overlapping '
        'coils, each as thick as a mob is tall, stacked and crossing over one '
        'another and piling up in the lower two-thirds of the cell. The pile is '
        'slightly wider than it is tall, not three times wider.' + NL
        + 'THE STEM IS NOT AN EVEN TUBE. It SWELLS AT NODES — a hard knuckled '
        'thickening every stem-width or so along its whole length, half again as '
        'thick as the stem between them, so the outline of every coil is lumpy and '
        'jointed rather than smooth. A rope is the same width from end to end; this '
        'is not, and that is the difference you see first. Deep grooves run '
        'LENGTHWISE along the stem between the nodes (a rope\'s twist runs '
        'diagonally — these do not).' + NL
        + 'LEAVES — the strongest thing that says plant, so do not leave them out. '
        'FIVE big heavy leaves grow off the coils at different points, each as long '
        'as the stem is thick, on short stiff stalks, angled every which way. They '
        'BREAK THE OUTLINE of the pile so the silhouette is not a smooth coil but a '
        'coil with leaves sticking out of it. Two are torn, one is curled shut, one '
        'is a hard grey dead one still hanging on.' + NL
        + 'FROM THE NODES sprout EIGHT young SIDE-SHOOTS, thin new growth a '
        'quarter the thickness of the main stem, going in eight different '
        'directions with two small leaves each. They are what a cut vine puts out, '
        'and nothing else in this creature is thin.' + NL
        + 'NEITHER END IS VISIBLE. Both ends run UNDER the coils of its own body '
        'and do not come out again, so there is no terminus anywhere in the '
        'drawing. That is the point — a mob vine is a stem you can see all of, and '
        'this one is not.' + NL
        + 'LENGTH IS SHOWN BY COILING, NEVER BY LEAVING THE CELL. The stem must not '
        'touch or cross the edge of its cell at any point. Growth that runs off the '
        'edge does not read as long; it reads as a drawing that got cut.' + NL
        + 'THE TOPMOST COIL swells into a thick knotted MASS off to one side, '
        'rising clear above the pile. That swelling is the part that is awake, and '
        'it is the highest point of the body.' + NL
        + 'FROM THE SWELLING rise SIX TENDRILS, far thicker and longer than a mob '
        'has, curling up and forward at different heights. Two are as tall as the '
        'swelling is wide. EVERY TENDRIL ENDS IN A TIGHT SPIRAL COIL, wound two or '
        'three turns like a spring — that spiral is a thing only a plant does, and '
        'it is the second-strongest plant signal on the sheet after the leaves.'
        + NL
        + 'THE OPENING is a long split down the TOP of the swelling, held apart, '
        'lined with SEVEN inward spines. It runs lengthwise, not across.' + NL
        + 'EYES: FOUR, in a row along the swelling at different heights, one large '
        'and three small, all looking along the length of the body rather than out '
        'at you.' + NL
        + 'CAUGHT IN THE COILS, spaced far apart on different loops: a SKULL on '
        'the lowest coil, a RIBCAGE in the swelling, a BOOT still laced on a '
        'middle coil. The stem has GROWN AROUND each of them — swollen lips of '
        'wood closed over the edges, new side-shoots coming out right beside them '
        '— so they were caught years ago and grown over, not tied on. They mark '
        'how much stem there is.' + NL
        + 'THE ACCIDENT — this one only: on the front-most coil the stem is SEVERED '
        'CLEAN and has grown back across the gap in a knotted burl twice the '
        'thickness of the stem, with a spray of six young shoots bursting out of '
        'the join — the way a cut vine answers being cut. One loop of the pile has '
        'that swollen scarred joint and none of the others do. Someone cut it and '
        'it did not stop.',
        'coiled and still, the four loops settled and overlapping, leaves hanging '
        'off the pile at their own angles, the six tendrils raised off the swelling '
        'with their spirals loose, the split along the swelling half open. It reads '
        'as undergrowth that has not noticed you yet.',
        'the whip. TWO tendrils have lashed forward together, stretched thin and '
        'long out ahead of the swelling with their end spirals pulled almost '
        'straight, and the topmost coil has been dragged after them so the pile is '
        'pulled off centre. Three leaves have been torn back flat against the stem '
        'by the movement. The coils stay stacked and the whole body stays inside '
        'the cell.',
        [('skill1', '속박의 덩굴 휘감기',
          '무작위 2명에게 공격력의 140%만큼 물리 피해, 2초간 기절 '
          '(평타 5대마다)',
          'THE SNARE — it takes EXACTLY TWO characters and holds them, so the cell '
          'must show TWO of something, clearly countable. Two of the six tendrils '
          'have shot out and UP, far higher and further than anything else on the '
          'sheet, and each has curled its tip into a CLOSED LOOP — two separate '
          'nooses, hanging at different heights on opposite sides of the cell, both '
          'drawn tight and empty, both well inside the edges. The other four '
          'tendrils are pulled back and low, out of the way, so nothing competes '
          'with the two. The coiled pile beneath has drawn in TIGHTER and taller to '
          'brace for the pull, so the body is narrower here than in the idle cell, '
          'and every leaf on it has been pulled up and back like hair in wind. '
          'It is the TALLEST cell, and the two nooses are the only closed shapes on '
          'the whole sheet — the player counts them without meaning to.')],
        'struck. The swelling has split open along the top and three tendrils are '
        'torn off, their spirals gone. The coils have LOOSENED and slumped apart, '
        'the pile collapsing to about half its height, and for the first time you '
        'can see between the loops. Leaves are stripped and falling, two of them '
        'clear of the body. The ribcage shows through the gash and the boot has '
        'come loose.',
        """13스테이지 우두머리. **길이로 크지만, 칸을 안 벗어납니다.**

처음엔 "양쪽 끝이 칸 밖으로 빠져나간다" 고 적었습니다. 그런데 같은 프롬프트
끝에는 "어느 것도 잘리면 안 되고 자석선에서 8px 을 띄우라" 고 적혀 있습니다 —
**서로 반대되는 지시**라 어느 쪽도 못 지키고, 그래서 잘린 채로 나왔습니다.

길이는 **감아서** 보여 줍니다. 밧줄이 제 몸 위로 네 겹 감겨 쌓이고 양쪽 끝이
그 아래로 들어가 안 나오면, 어디서 시작하고 끝나는지 안 보이면서도 칸 안에
다 들어갑니다. `STANDS` 가 "무게는 눕는 게 아니라 처지는 것으로" 라고 말하는
것과 같은 자리입니다.

**가로로 길면 화면에서 오히려 작아집니다.** `Sprite` 가 정사각 상자에
`contain` 으로 그리므로, 가로가 세로의 세 배면 가로에 맞춰 줄어들고 세로가
텅 빕니다. 그래서 쌓인 더미는 **가로세로가 비슷해야** 합니다.

## 밧줄로 나오면 안 됩니다

감으라고만 했더니 밧줄이 나왔습니다. 길고 감긴 것에 표면까지 매끈하면 그건
규칙을 뭐라고 적든 밧줄입니다. 식물로 되돌리는 것 넷을 넣었습니다 —

| | 무엇 |
|---|---|
| **잎** | 제일 셉니다. 큼직한 것 다섯이 **윤곽 밖으로** 나옵니다. 밧줄에는 잎이 안 달립니다 |
| **마디** | 줄기가 일정 간격으로 부풀어 울퉁불퉁합니다. 밧줄은 처음부터 끝까지 굵기가 같습니다 |
| **곁순** | 마디마다 돋은 어린 덩굴 여덟. 이 생물에서 유일하게 가는 것들입니다 |
| **덩굴손 끝** | 용수철처럼 두세 바퀴 **말립니다.** 식물만 하는 짓입니다 |

세로로 파인 골도 넣었습니다 — 밧줄은 꼬임이 **비스듬하고** 줄기의 결은
**세로**입니다.

3번 칸에 **고리가 정확히 둘**입니다. 대상이 2명인 유일한 기술이라, 세는 것이
곧 읽는 것입니다. 나머지 덩굴 넷은 낮게 빼서 둘이 묻히지 않게 합니다.""",
    ),

    boss(
        'b14_columna', '백골을 품은 포자 기둥', '콜룸나', 14, 'growth', 82,
        'A spore stalk that never stopped growing upward.' + NL
        + 'BODY: A TOWER. Far taller than anything else in this chapter — a single '
        'thick column, straight and vertical, rising the full height of the cell '
        'with the pod cluster at the very top. It is the tallest silhouette in the '
        'set and that alone identifies it.' + NL
        + 'THE CROWN: not one pod but SEVEN, packed into a heavy head at the top, '
        'each a different size, three already split open and gaping.' + NL
        + 'THE COLUMN is ringed at THREE heights by collars of dead frayed growth, '
        'like places it stopped and started again. Each collar is a hard horizontal '
        'break in the outline.' + NL
        + 'GROWN INTO THE COLUMN at head height, the wood swollen shut around it: a '
        'SKULL, facing out, half absorbed, only the front half showing.' + NL
        + 'EYES: TWO ONLY, and both are hard slits set low in the column, far below '
        'the crown and well away from the skull. This is the one boss in the '
        'chapter with fewer than three — everything about it points up, and eyes '
        'scattered up the column would fight that.' + NL
        + 'THE ACCIDENT — this one only: the column is not straight all the way. A '
        'third of the way up it has a hard KINK — it grew sideways for a span and '
        'then corrected, so there is a permanent dog-leg in an otherwise vertical '
        'shape, with a collar of scar growth at the bend.' + NL
        + 'THE BASE: five stiff roots braced wide. IT DOES NOT WALK — it stands and '
        'it throws, and the width of that base is what says so.',
        'standing tall and straight, the crown still, three split pods gaping, a '
        'few loose spores drifting down past the column. It has not moved and it '
        'does not need to.',
        'the burst. The crown has CLENCHED — pulled in narrow — and a tight clump '
        'of spores is LEAVING it in one direction, clear of the body, with two '
        'speed lines. The column is bowed slightly back. One clump, one direction.',
        [('skill1', '독성 포자 분출',
          '아군 전체에 4초간 지속 마법 피해 (0.5초마다 공격력의 8%), '
          '5초간 받는 치유량 50% 감소 (평타 6대마다)',
          'THE PLUME — it hits EVERYONE for a long time and shuts off their '
          'healing, so it rises and hangs rather than flying at anyone. All seven '
          'pods have SPLIT WIDE at once and the column has swelled visibly thicker '
          'along its whole length, and a dense COLUMN OF SPORES is rising straight '
          'UP out of the crown and spreading outward as it goes — narrow at the '
          'crown, wide at the top edge of the cell, filling the entire upper third '
          'like a canopy. More spores are venting sideways from all three collars '
          'in horizontal bands. Nothing travels forward. It is the TALLEST cell, '
          'and it is a mushroom shape: a thin vertical stem of a creature under a '
          'wide spreading head of spores.')],
        'struck. The column has snapped at the kink and the whole top half is '
        'tipping over sideways, four pods torn loose and falling. The skull is '
        'exposed where the wood split away from it.',
        """14스테이지 우두머리. **시트에서 제일 높습니다** (82%).

3번 칸이 **버섯 모양**이어야 합니다 — 가느다란 기둥 위에 넓게 퍼진 포자
머리. 앞으로 날아가는 것이 하나도 없어야 하고, 그게 "전체에 오래 간다" 를
말합니다.

눈이 둘뿐인 유일한 우두머리입니다. 다른 놈은 셋 이상인데 이놈만 예외인 것은,
모든 것이 위를 향하는 실루엣에 눈이 흩어지면 그 방향이 깨지기 때문입니다.

기둥 중간의 꺾임이 이 놈만의 사고입니다. 5번 칸(피격)에서 **바로 그 자리가**
부러집니다.""",
    ),

    boss(
        'b15_cadavera', '악취를 피워내는 시체꽃', '카다베라', 15, 'growth', 70,
        'A single flower the size of a cart, and the smell arrived before it did.'
        + NL
        + 'BODY: ONE ENORMOUS BLOOM and almost nothing else. Five heavy leathery '
        'petals, thick as doors, curving up and outward from a deep central well, '
        'held HALF CLOSED so the bloom reads as a fat closed fist of petals rather '
        'than an open flower. Two petals are torn at the edge and one has folded '
        'over on itself and stuck.' + NL
        + 'THE STEM is short and thick and barely visible under the bloom — the '
        'flower sits almost on its own root knot. It is squat, not tall.' + NL
        + 'THE CENTRAL WELL, visible down between the petals, holds a thick pale '
        'COLUMN rising from the middle, blunt-tipped, ringed with fine hairs.' + NL
        + 'THE PASSIVE — draw it in every cell: the outer surface of every petal is '
        'ROTTING. Dark sunken patches with ragged holes eaten through them, edges '
        'curling black, and SIX heavy hanging strands of decayed matter trailing '
        'off the petal rims into empty black. The rot is structural and permanent, '
        'never an effect and never absent — not even in the struck cell.' + NL
        + 'EYES: FOUR, set into the outer faces of four different petals, one large '
        'and three small, all at different heights so they never read as a face.'
        + NL
        + 'THE ACCIDENT — this one only: a full RIBCAGE is caught upside down '
        'between two petals at the rim, held by the petals having grown through '
        'the gaps between the ribs, so it cannot be pulled out. It hangs half '
        'outside the bloom.' + NL
        + 'ROOTS: a broad low knot, splayed, more of it above ground than below.',
        'the bloom held half closed and hanging slightly forward, petals still, '
        'strands of rot hanging, the ribcage caught at the rim. The smallest '
        'silhouette it ever has.',
        'the snap. Two of the five petals have swung forward and closed on '
        'something ahead of the bloom, thrown out past the root knot, the pale '
        'column driven forward between them. The other three petals stay where they '
        'are. Two petals, forward, short.',
        [('skill1', '부패의 악취',
          '아군 전체에 4초간 지속 마법 피해 (0.5초마다 공격력의 10%), '
          '5초간 침묵 (스킬 사용 불가) (평타 6대마다)',
          'THE OPENING — it hits EVERYONE and silences them, and it is not a strike '
          'at all: it is the flower opening. All five petals have swung FULLY BACK '
          'AND FLAT, spread out level like a plate, so the bloom has gone from a '
          'closed fist to the widest flat shape on the sheet — three times its idle '
          'width, and much LOWER, because opening flattened it. The central column '
          'stands fully exposed and upright in the middle, the only vertical thing '
          'left. Rising off the whole open face, TWELVE heavy clumps of rot are '
          'lifting away in every direction, evenly spread, with no direction of '
          'travel. The ribcage has swung out flat with its petal. It is the WIDEST '
          'and FLATTEST cell on the sheet — and note this is the one boss whose '
          'skill makes it SHORTER than its idle pose.')],
        'struck. Three petals are split from rim to base and folding down, the '
        'central column snapped over halfway up, the bloom collapsing in on itself. '
        'The ribcage has torn free of the petals it was caught in.',
        """15스테이지 우두머리. 후반 챕터 전반부의 마지막이고, **패시브 보유자**입니다.

패시브 **부패의 오라**는 탱커의 방어력을 0 으로 만들고 계속 태웁니다. 그림
쪽에서는 **꽃잎 바깥면이 썩어 있는 것**이 그것이고, 다섯 칸 전부에 있어야
합니다 — 피격 칸에도요.

3번 칸은 **이 시트에서 유일하게 대기보다 낮습니다.** 꽃이 활짝 열리면서
납작해지기 때문입니다. 다른 우두머리는 기술을 쓸 때 커지는데 이놈만 반대라,
연달아 보면 그것만으로 구분됩니다.

**때리는 그림이 아닙니다.** 열리는 그림입니다.""",
        passive=('부패의 오라',
                 '탱커 아군의 방어력을 0으로 만들고, 1초마다 공격력의 5%만큼 '
                 '지속 마법 피해'),
    ),

    boss(
        'b16_truncus', '원한이 찍힌 그루터기', '트룽쿠스', 16, 'growth', 60,
        'A stump that everyone who passed took a swing at, and none of them '
        'finished.' + NL
        + 'BODY: a WIDE LOW STUMP, much broader than tall, with a ragged flat top '
        'where the trunk was felled. The cut is old and the growth rings are '
        'visible as concentric ridges. It is squat and heavy and sits close to the '
        'ground — the lowest silhouette in this chapter.' + NL
        + 'BURIED IN IT, FIVE AXES AND A WEDGE, each driven in at a different angle '
        'and depth, some to the haft, some barely bitten in, all rusted and all '
        'grown around by swollen bark so they cannot come out. The hafts stick out '
        'in five directions and they ARE the silhouette — without them this is a '
        'log.' + NL
        + 'THE MOUTH is the split of the old felling cut across the top, held open, '
        'lined with SIX splintered wooden teeth that are torn grain, not carved '
        'points.' + NL
        + 'EYES: THREE, knot-holes in the bark at different heights around the '
        'body, one large and low, two small and high, each ringed by swollen wood.'
        + NL
        + 'THE ACCIDENT — this one only: ONE of the five axes is not rusted. It is '
        'clean and bright and driven in deepest, dead centre of the top, and the '
        'wood around it is BLACK and dead in a spreading ring, while everything '
        'around the other four is swollen and alive. That one hurt.' + NL
        + 'ROOTS: four thick roots spread out from the base, two lifted clear of '
        'the ground and bent, so it can drag itself.',
        'settled low and wide, all five axe hafts jutting at their angles, the '
        'felling cut half open. The clean axe stands dead centre. It looks like '
        'something left behind.',
        'the stomp. One of the lifted roots has swung forward and come down out '
        'past the front of the stump, and the whole body has heaved after it and '
        'tipped. The axes have not moved. Low, forward, one root.',
        [('skill1', '녹슨 도끼의 일격',
          '아군 중 맨 앞 대상에게 공격력의 220%만큼 강한 물리 피해, '
          '5초간 방어력 40% 감소 (평타 5대마다)',
          'THE SWING — it hits the ONE character standing at the front, harder than '
          'anything else in the chapter, so it goes UP and comes down on one point. '
          'The stump has WRENCHED ONE RUSTED AXE OUT OF ITSELF: a thick root has '
          'wrapped the haft and raised it to the full height of the cell, blade up '
          'and back, and the whole stump has reared onto its back roots and arched '
          'to lift it. The socket it came out of is a raw black hole in the top. '
          'The clean axe stays where it is, untouched. It is the TALLEST cell and '
          'it is NARROW — a single vertical line from the raised blade down through '
          'the leaning body. Four chips of rotten wood fly loose from the socket.')],
        'struck. The stump has split from the felling cut down through one side, '
        'two axes dropping out of the widening crack, and the lifted roots have '
        'buckled so the whole body has dropped and tipped forward.',
        """16스테이지 우두머리. **배경이 다시 바뀌는 지점**입니다.

도끼 다섯이 실루엣입니다. 빼면 그냥 통나무이고, 그래서 **네 칸 전부에** 같은
각도로 박혀 있어야 합니다.

3번 칸에서 **녹슨 도끼 하나만** 뽑습니다. 깨끗한 도끼는 안 건드립니다 — 그건
이 놈만의 사고고, 뽑을 수 있었으면 진작 뽑았을 것이기 때문입니다. 뽑힌 자리에
검은 구멍이 남아야 합니다.

7판 이돌라투스와 같은 "위로 들어 한 명에게" 구조입니다. 다른 챕터라 나란히
놓일 일은 없지만, 둘 다 **좁고 높아야** 합니다.""",
    ),

    boss(
        'b17_cavus', '백골을 품은 고목 거인', '카부스', 17, 'growth', 84,
        'A dead tree that stood up. Most of it is missing and it does not need it.'
        + NL
        + 'BODY: a TOWERING HOLLOW TRUNK, the tallest thing in the chapter, leaning '
        'well off vertical. Its defining feature is a PERSON-SIZED HOLE straight '
        'through the middle of the trunk — you can see black sky through the '
        'creature. Nothing else in the game has a hole you can see through, and at '
        '60 pixels that hole is what identifies it.' + NL
        + 'THE HOLE has ragged inward-pointing splinters all round its rim, and '
        'the trunk is only a shell of wood a hand thick around it.' + NL
        + 'TWO HEAVY LIMBS come off the upper trunk, both on the same side, both '
        'bare of leaves, one much longer than the other and ending in a splintered '
        'break rather than twigs.' + NL
        + 'INSIDE THE HOLLOW, wedged where the hole narrows: a SKULL and part of a '
        'SPINE, visible through the hole from the front, held in the shell.' + NL
        + 'EYES: THREE, all set in the shell AROUND the hole at different heights '
        '— one large above it, two small on either side below. They must never be '
        'mistaken for the hole itself, so the hole is far larger than any of them.'
        + NL
        + 'THE ACCIDENT — this one only: the trunk has been STRUCK BY LIGHTNING '
        'once. A single hard-edged scar runs the full height of the trunk in a '
        'jagged line from the crown to the base, the wood on either side of it '
        'curled outward and black. It passes right beside the hole without meeting '
        'it.' + NL
        + 'THE BASE: three roots, splayed and lifted, far too small for the trunk '
        'they carry — it is top-heavy and looks it.',
        'standing tall and leaning, both limbs hanging, the hole open and black '
        'through the middle, the skull just visible in it. Slow and enormous and '
        'not yet interested.',
        'the sweep. The LONGER limb has swung forward and across, out past the '
        'trunk at head height, the splintered end leading. The trunk has barely '
        'turned and the hole is still visible. One limb, forward, at a leaning '
        'angle.',
        [('skill1', '공허한 울림',
          '아군 전체에 공격력의 100%만큼 마법 피해, 40% 확률로 2초간 기절 '
          '또는 5초간 공격력 25% 감소 (평타 6대마다)',
          'THE TOLL — it hits EVERYONE with sound, and nothing physical travels, so '
          'the cell must read as the creature ITSELF being the source. The trunk '
          'has ARCHED FAR BACK from the base like a bell being pulled, both limbs '
          'flung wide and up to their full spread on either side, and THE HOLE HAS '
          'OPENED — the shell around it has split and drawn apart so the hole is '
          'now three times its idle size, a vast black gap taking a third of the '
          'body, with the skull inside it fully exposed at the centre. The opened '
          'hole is the subject of the cell. Splinters of the torn rim hang in the '
          'air all round it, and loose bark is lifting off the whole trunk. It is '
          'the TALLEST cell and the most OPEN — more empty black inside the '
          'creature than in any other cell of the game.')],
        'struck. The shell has failed at the lightning scar and the trunk is '
        'buckling sideways along it, the hole torn open into the split so the top '
        'half is nearly severed. Both limbs have dropped and the skull is falling '
        'out through the bottom of the hollow.',
        """17스테이지 우두머리. **시트에서 제일 높습니다** (84%).

**몸에 뚫린 구멍이 실루엣입니다.** 이 게임에서 뒤가 비쳐 보이는 유일한
생물이고, 60px 에서 이놈을 알아보게 하는 것이 그 구멍입니다.

3번 칸은 **때리는 그림이 아닙니다.** 소리로 전원을 치는 기술이라 날아가는
것이 없고, 대신 **구멍이 세 배로 벌어집니다.** 몸 안의 검은 부분이 이 게임의
어느 칸보다 넓어야 합니다.

눈 셋은 구멍 **주변**에 있고 구멍보다 훨씬 작아야 합니다. 비슷해지면 구멍이
눈으로 읽히고 그러면 얼굴이 됩니다.

벼락 자국이 이 놈만의 사고입니다. 5번 칸에서 **정확히 거기가** 무너집니다.""",
    ),

    boss(
        'b18_spinosa', '대지를 찌르는 가시목', '스피노사', 18, 'growth', 72,
        'A tree that put everything it had into thorns.' + NL
        + 'BODY: a short thick trunk carrying TWELVE LONG BARE BRANCHES that '
        'radiate outward and upward in every direction, each one straight, stiff '
        'and tapering to a hard point. There are no leaves, no twigs and no curve '
        'anywhere — the whole silhouette is a burst of straight lines from a small '
        'centre, like a caltrop the size of a house.' + NL
        + 'EVERY BRANCH IS THORNED along its whole length, thorns getting longer '
        'toward the tip, so each line is serrated rather than smooth.' + NL
        + 'THE TRUNK is small for the branches it carries — barely a third of the '
        'height — and heavily scarred, with a wide split up the front lined with '
        'SEVEN thorn teeth.' + NL
        + 'EYES: FOUR, set into the trunk only, never on the branches. One large '
        'above the split, three small around it.' + NL
        + 'IMPALED ON THE BRANCHES, held at different heights well away from the '
        'trunk: a SKULL on one, a rusted HELM on another, a RIBCAGE on a third. '
        'They are threaded on like beads and they mark how long the branches are.'
        + NL
        + 'THE ACCIDENT — this one only: THREE of the twelve branches have grown '
        'together at their tips into a single fused CLAW, curved inward, the only '
        'curved shape on the whole creature. It hangs on the heavy side and drags.'
        + NL
        + 'ROOTS: a tight knot, small, barely wider than the trunk. It should look '
        'like it could tip over.',
        'standing with all twelve branches spread evenly in every direction, the '
        'fused claw hanging low on one side, the impaled skull and helm still. A '
        'ball of spikes with a small angry trunk in the middle.',
        'the swipe. ONE branch has swung down and forward across the front, out '
        'past the spread of the others, its thorns leading. The other eleven stay '
        'exactly where they were, so the even spread is broken in exactly one '
        'place. That is the whole difference and it must be obvious.',
        [('skill1', '가시 가지 후려치기',
          '아군 전체에 공격력의 140%만큼 관통 물리 피해 (평타 5대마다)',
          'THE RAKE — it ignores armour and hits EVERYONE with one physical sweep, '
          'so ALL TWELVE BRANCHES HAVE SWUNG THE SAME WAY AT ONCE. The even radial '
          'burst of the idle cell has been combed flat into a single direction: '
          'every branch now lies roughly parallel, swept hard to one side, '
          'stretched out and bent under the speed, reaching almost to the far edge '
          'of the cell but stopping clear of it. The small trunk is dragged over with them and leans almost '
          'horizontal on its knot of roots. The impaled skull, helm and ribcage '
          'have swung out to the far end and lead. It is the WIDEST cell by a long '
          'way and it is LOW — this is a rake across the whole party, not an '
          'overhead blow. Six broken thorns hang in the air behind the sweep.')],
        'struck. Five branches are snapped off short and the trunk has split from '
        'the mouth down to the roots, leaning hard. The fused claw has broken apart '
        'into its three branches again. The helm has fallen off its branch.',
        """18스테이지 우두머리.

**대기 칸과 기술 칸이 정반대입니다.** 평소에는 가지 열둘이 사방으로 고르게
퍼져 있고(성게), 기술을 쓰면 **전부 한쪽으로 빗질된 것처럼** 눕습니다. 같은
열두 개인데 배치만 뒤집히는 것이고, 흐릿하게 봐도 그 차이는 보입니다.

2번 칸(평타)은 **가지 하나만** 움직입니다. 나머지 열하나가 제자리에 있어야
"하나만 움직였다" 가 읽힙니다.

붙어서 갈고리가 된 가지 셋이 이 놈만의 사고입니다. 이 생물에서 **유일하게
곡선인 부분**이라 눈에 띕니다.""",
    ),

    boss(
        'b19_putridus', '부패를 품은 태고의 거목', '푸트리두스', 19, 'growth', 78,
        'A tree old enough that the rot inside it is older than the garden.' + NL
        + 'BODY: a MASSIVE TRUNK, far thicker than anything else in the chapter, '
        'swelling outward as it rises rather than tapering — it is wider at the '
        'shoulder than at the base and looks ready to fall forward. The bark is '
        'split into great plates with dark gaps between them, and along the gaps '
        'the wood beneath is visibly soft and sunken.' + NL
        + 'THE CROWN is broken off flat and hollow, a wide open bowl of rotted wood '
        'at the top, with three broken limb stubs around its rim pointing in '
        'different directions. Nothing grows out of it.' + NL
        + 'THE ROOTS ARE THE FEATURE. Eight enormous roots, as thick as the limbs '
        'of any other boss, are TORN FREE OF THE GROUND and held in the air around '
        'and beneath the trunk, curling and reaching, none of them touching '
        'anything and none of them suggesting a floor. They occupy more of the '
        'silhouette than the trunk does.' + NL
        + 'THE MOUTH is a long vertical split up the front of the trunk between two '
        'bark plates, held open, with EIGHT soft splintered teeth.' + NL
        + 'EYES: FIVE, sunk deep in the gaps between bark plates at different '
        'heights up the trunk, one enormous low down and four small scattered '
        'above. They look like rot holes that happen to be watching.' + NL
        + 'THE ACCIDENT — this one only: a full-grown SECOND TREE, dead and bare '
        'and about a third its size, has grown out of the rotted crown bowl at an '
        'angle and died there. It is still standing in the bowl, roots and all, '
        'and it doubles the height of the silhouette.',
        'standing swollen and leaning, the eight roots curled and hanging in the '
        'air, the dead second tree standing up out of the broken crown. The split '
        'is half open. It is enormous and completely still.',
        'the lean. The whole trunk has tipped forward and ONE root has swung up and '
        'out ahead of the body, thick and blunt, reaching past the front. The other '
        'seven stay curled. The dead tree in the crown has swung forward with the '
        'trunk and stayed upright in the bowl.',
        [('skill1', '부패한 뿌리 솟구침',
          '아군 전체에 공격력의 150%만큼 물리 피해 (평타 6대마다)',
          'THE ERUPTION — it hits EVERYONE with one heavy physical blow, so ALL '
          'EIGHT ROOTS have been driven UP AND FORWARD at once. They have '
          'straightened out of their curls and now radiate up and out ahead of the '
          'trunk in a wide fan, each one straight, rigid and ending in a hard '
          'splintered point, spread across the full width and height of the cell '
          'and stopping just short of its edges. THEY ARE ALL IN THE AIR — clear '
          'of one '
          'another and clear of any surface. Do not draw ground, a floor line, or '
          'anything for them to have come out of; they are simply thrust. The trunk '
          'behind them has reared back and is nearly hidden by its own roots. It is '
          'the WIDEST cell and the fan takes almost all of it. Six clods of rotted '
          'wood hang loose among the roots.')],
        'struck. The trunk has split from the mouth up to the crown bowl and is '
        'opening apart, four roots snapped and dropping. The dead second tree has '
        'toppled out of the bowl and is falling across the trunk.',
        """19스테이지 우두머리.

**바닥을 그리면 안 되는데 "뿌리가 솟구친다" 를 그려야 합니다.** 그래서 뿌리는
땅에서 나오는 것이 아니라 **원래 공중에 들려 있습니다** — 대기 칸에서부터 여덟
뿌리가 다 떠 있고, 3번 칸에서 그것이 곧게 펴져 앞으로 뻗을 뿐입니다. 땅에서
튀어나오는 순간을 그리려 하면 반드시 바닥선이 따라 들어옵니다.

죽은 나무가 썩은 우듬지에 서 있는 것이 이 놈만의 사고입니다. 실루엣의 높이를
두 배로 만들고, 5번 칸에서 쓰러집니다.""",
    ),

    boss(
        'b20_silvanus', '숲의 의지를 품은 고대 수호수', '실바누스', 20, 'growth', 86,
        'The oldest thing in the garden. Everything else here answers to it, and '
        'the ones that would not are in its roots. It is the last enemy the player '
        'meets and it has never lost.' + NL
        + 'BODY: a COLOSSAL TREE, the largest and tallest silhouette of the entire '
        'game, filling nearly its whole cell. A single vast trunk, straight and '
        'unbroken, widening into a heavy buttressed base. Unlike every other boss '
        'in this chapter IT IS NOT ROTTEN, NOT BROKEN AND NOT LEANING — and that '
        'is not peace, it is the reason nothing has ever killed it. Everything '
        'else in this garden is coming apart; this one has been WINNING.' + NL
        + 'THE CROWN — THIS IS WHAT SAYS KING, and it is the first thing to get '
        'right. SIX great limbs rise from the top of the trunk and sweep outward '
        'and UP into a ring of hard upswept HORNS, each tapering to a spike, each '
        'a different length, the longest twice the shortest. Between every horn '
        'you can see black sky. There are NO leaves, no twigs and no soft mass '
        'anywhere in it. It is a crown of points, not a canopy and not a dome — a '
        'thing that could gore, worn by something that grew it. It rises well '
        'above the trunk and it is the widest part of the creature.' + NL
        + 'HELD UP IN THE CROWN — THE SPOILS. Gripped between the horns, one per '
        'limb, are FIVE things it beat and never put down: the SNAPPED TRUNK of '
        'another tree half its own thickness, held like a stick; a BELL; a SHIELD '
        'with a horn driven clean through it; a RIBCAGE; and the SKULL OF A BEAST '
        'larger than any mob in the game. They hang at different heights and wrong '
        'angles, all of them raised ABOVE the mouth and the eyes. A king puts what '
        'it beat where everyone can see it. These are also the scale reference: '
        'the beast skull should look small up there.' + NL
        + 'THE PASSIVE — draw it in every cell: the trunk is armoured in HEAVY '
        'OVERLAPPING BARK PLATES, thick slabs with deep hard-edged grooves between '
        'them, layered like scales from the base to the crown. They are grown, not '
        'fitted. They are what makes it hard to hurt and they are never absent, not '
        'even in the struck cell.' + NL
        + 'THE MOUTH is a wide horizontal rift across the trunk beneath the crown, '
        'pulled open and grim, with TWELVE heavy teeth of solid wood — the four '
        'longest overshoot the opposite lip and stand outside the mouth even when '
        'it is closed. It is the widest mouth in the game and it runs most of the '
        'way across the trunk.' + NL
        + 'EYES: SIX, set in a ring around the trunk at the same level just above '
        'the mouth — the only boss whose eyes are ARRANGED rather than scattered, '
        'and all six are aimed DOWN AND FORWARD at the same single point. Every '
        'other creature in this game looks about; this one has already picked what '
        'it is looking at, and that agreement between the six is the whole threat '
        'of the face.' + NL
        + 'THE ACCIDENT — this one only: ONE of the six crown limbs has hardened '
        'into a BLADE. It is flattened, straight-edged and tapering to a point '
        'along its whole length, clearly different from the other five, and it is '
        'the only part of the creature that is not organic in outline.' + NL
        + 'THE BASE: six buttress roots spread wide and sunk deep — and CAUGHT IN '
        'THEM, half swallowed and lifted clear off the ground, are the broken '
        'STUMPS OF THREE SMALLER TREES it pulled up whole. Their own roots still '
        'trail from them. It does not travel and it never has: it made the others '
        'come to it.',
        'standing at full height, the crown of horns raised, the five spoils hung '
        'among them, all six eyes aimed down and forward at the same point. Bark '
        'plates layered from base to crown, three uprooted stumps in the roots. It '
        'is completely still — and the stillness is not waiting, it is a thing that '
        'has already decided and is not in a hurry about it.',
        'the strike. TWO of the crown limbs have swung down and forward together, '
        'out past the front of the trunk at head height, horns leading, the crown '
        'opened just enough to let them through. The trunk has not moved at all and '
        'the base has not shifted. It does not lean, it does not step and it does '
        'not brace — it simply reaches down, the way you reach for something on the '
        'floor. Short and contemptuous.',
        [('skill1', '태고의 성난 벼락',
          '아군 전체에 공격력의 150%만큼 물리 피해, 대상의 스킬 게이지를 '
          '50% 강제 차감 (평타 6대마다)',
          'THE FURY — it hits EVERYONE and strips what they were charging, so the '
          'creature OPENS UPWARD and takes the whole cell. The crown has been '
          'THROWN WIDE: all six limbs have swung up and out to full spread, '
          'straightened, reaching almost to the top and to both side edges of the '
          'cell but stopping clear of all three, so '
          'the ring of horns has become a spread of spears aimed outward. The '
          'trunk has arched back and every bark plate has LIFTED and separated '
          'along its grooves, standing out from the trunk all down its length like '
          'a beast raising its hackles. The five spoils have been flung out with '
          'the limbs and swing wide. Ten torn splinters and bark flakes hang in '
          'the air around the crown. It is the TALLEST AND WIDEST cell of the '
          'sheet, and the one moment the creature looks angry rather than certain. Draw no lightning, no bolt, no '
          'glow — the game draws its own effects and a bolt in the sprite becomes a '
          'permanent white smear.'),
         ('skill2', '자비없는 칼날',
          '아군 중 체력이 가장 낮은 대상에게 공격력의 250%만큼 마법 피해 '
          '(평타 5대마다)',
          'THE EXECUTION — it picks the ONE weakest character and finishes them, so '
          'this cell is the opposite of the fury in every way. The crown stays '
          'CLOSED and still, exactly as in idle, and the trunk stays upright. ONLY '
          'THE BLADE LIMB has moved, and the spoils have not even swung: it has '
          'come down and thrust FORWARD AND '
          'SLIGHTLY DOWN in one straight line, fully extended, reaching almost to '
          'the far edge of the cell but stopping clear of it, at a single point '
          'below head height. It is the only '
          'thing out of place on the whole creature. Nothing has left the body, '
          'nothing hangs in the air, and no bark has lifted. All six eyes have '
          'turned to look along the blade. It is the NARROWEST and STILLEST '
          'attacking cell in the game — and it must read as colder than the fury, '
          'not weaker.')],
        'struck. The bark plates have SHATTERED off one whole side of the trunk and '
        'the pale wood beneath is split open, three crown horns snapped and hanging '
        'by strips of bark, the blade limb cracked halfway along. Two of the five '
        'spoils have fallen out of the crown and one of the uprooted stumps has '
        'rolled clear of the roots. For the first time the trunk is out of vertical '
        '— and the six eyes are no longer looking the same way, which is the only '
        'cell in which they disagree.',
        """20스테이지 우두머리. **마지막 적이고, 이 게임에서 제일 큽니다** (86%).

**혼자만 안 썩었습니다.** 이 챕터의 다른 아홉은 전부 부러지고 기울고 구멍이
났는데 이놈만 곧고 온전합니다. 다만 그 온전함이 **평온으로 읽히면 안 됩니다** —
"그래서 고요하다" 가 아니라 **"그래서 아무도 못 죽였다"** 입니다.

## 왕으로 읽히게 하는 것 셋

| | 무엇 |
|---|---|
| **왕관** | 여섯 가지가 덮는 지붕이 아니라 **위로 솟은 뿔의 고리**입니다. 잎이 없고 뿔 사이로 검은 하늘이 보입니다 |
| **전리품** | 이긴 것을 **머리 위에 걸고** 있습니다 — 뽑아 든 나무 한 그루, 종, 뿔이 꿰뚫은 방패, 갈비뼈, 잡몹보다 큰 짐승 두개골 |
| **발밑** | 다른 나무 **셋을 통째로 뽑아** 뿌리에 물고 있습니다. 다른 열아홉이 썩는 동안 이놈이 뭘 하고 있었는지가 여기서 나옵니다 |

왕관은 **몸에서 자란 것**이라 `BOSS_IS` 가 금지하는 "쓴 것" 이 아닙니다.
얹혀 있으면 실패고, 줄기에서 솟아 있어야 합니다.

짐승 두개골은 크기 잣대이기도 합니다 — 저 위에 걸린 것이 **작아 보여야**
이놈이 얼마나 큰지가 읽힙니다.

입이 이 게임에서 제일 넓고, 이빨 넷은 다물어도 밖으로 나와 있습니다. 눈
여섯은 흩어져 있지 않고 **한 점을 내려다봅니다** — 다른 것들은 두리번거리는데
이놈만 이미 골랐습니다.

**다섯 칸입니다** (대기 · 평타 · 스킬1 · 스킬2 · 피격). 두 기술이 정반대여야
합니다:

| | 벼락 (스킬1) | 칼날 (스킬2) |
|---|---|---|
| 왕관 | 활짝 벌어짐 | **대기 그대로** |
| 움직인 것 | 전부 | 칼날 가지 하나 |
| 공중에 뜬 것 | 파편 열 개 | **없음** |
| 칸에서 | 제일 크다 | 제일 좁고 고요하다 |

칼날 칸이 "약해 보이면" 실패입니다. 250% 짜리 처형이라 **더 차가워** 보여야
하고, 그건 아무것도 안 움직이는 것으로 만듭니다.

패시브 **수호수의 가호**는 겹쳐 붙은 두꺼운 껍질판입니다. 여섯 칸 전부에
있어야 하고, 피격 칸에서 **깨져 나가는** 것이 곧 "20% 감소가 뚫렸다" 입니다.

눈 여섯이 **한 줄로 정렬**된 유일한 우두머리입니다. 다른 놈들은 다 흩어져
있습니다 — 이놈만 무언가를 결정한 것처럼 보여야 합니다.""",
        passive=('수호수의 가호',
                 '받는 모든 피해 20% 감소, 15초마다 최대 체력의 5% 회복, '
                 '체력 30% 이하에서 10초간 방어력 50% 증가'),
    ),
]


# ══ 패시브 로고 ═══════════════════════════════════════════════
#
# 패시브를 가진 우두머리가 넷이고, 싸우는 내내 화면 위쪽에 로고가 떠 있어야
# 한다. 이건 생물 그림이 아니라 **아이콘**이라 규칙이 통째로 다르다 —
# 쿼터뷰도 아니고, 12~16px 에서 읽혀야 한다 (`ICON_STYLE`).
#
# 넷의 **윤곽**이 서로 안 겹치는 것이 전부다: 별 / 물방울 / 세 갈래 / 잎.

PASSIVE_ICONS = [
    ('bp_thorn', '가시 갑옷', 'b05 스피나투스',
     'A SPIKED BALL. A solid round core filling the middle of the cell with SIX '
     'thick triangular spikes radiating from it — up, down, and four diagonals — '
     'each spike as long as the core is wide and wide at its base. The outline is '
     'a fat six-pointed star with no thin parts anywhere. Squint test: a star.'),
    ('bp_viscous', '오염된 점성', 'b10 슬러지누스',
     'A HEAVY FALLING DROP. One solid teardrop filling most of the cell — a fat '
     'round bottom taking two-thirds of the height, narrowing upward into a thick '
     'neck that reaches the top edge, plus ONE smaller round drop already '
     'separated and sitting just below it in the lower corner. Two solid shapes, '
     'one big one small. The outline is smooth and bulging with no points at all. '
     'Squint test: a drip.'),
    ('bp_rot', '부패의 오라', 'b15 카다베라',
     'A RISING PLUME. A wide solid mound along the bottom third of the cell with '
     'THREE thick stalks rising out of it to different heights, each ending in a '
     'heavy rounded head, the middle one tallest and reaching the top edge. The '
     'stalks are as wide as the gaps between them. Squint test: three stalks on a '
     'mound.'),
    ('bp_ward', '수호수의 가호', 'b20 실바누스',
     'A SHIELD-LEAF. One solid shape combining both: a broad flat straight top '
     'edge running the full width of the cell, sides dropping straight down and '
     'then curving in to meet at a single point at the bottom. Cut into it from '
     'the bottom point, running a third of the way up the middle, is ONE straight '
     'notch as wide as a fifth of the shape — the leaf midrib. No other detail. '
     'Squint test: a shield.'),
]


# ══ 문서 ══════════════════════════════════════════════════════

TEMPLATE = """# %(name)s, %(latin)s

← [색인으로](../BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 생성기의 `BOSSES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/%(set)s/` |
| 등장 | %(stage)d스테이지 · %(zone)s |
| 칸 수 | %(cells)d칸 |

%(intro)s

## 이 우두머리가 하는 것

그림의 자세는 전부 여기서 나옵니다. **무엇을 하는 기술인지가 어떤 모양이어야
하는지를 정합니다** — 전원을 치는 기술은 넓거나 높고, 한 명을 크게 치는 기술은
길고 좁습니다.

%(does)s
---

## 시트 한 장 (Gemini)

### 셀 순서

%(table)s
### 프롬프트

%(prompt)s
### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "%(set)s", "expect": [%(cells)d, 1], "floor": true,
  "labels": [%(labels)s] }
```

받으면 `python tools/slice.py` 를 돌리세요.

---

## 다시 뽑을 때

**칸들이 서로 너무 비슷하게 나왔을 때** (제일 자주 납니다)

```
The cells are too similar to each other. They must be distinguishable from the
SILHOUETTE ALONE at 60 pixels tall. Redraw so that each cell breaks out of the
creature's ordinary shape in a different direction: the ordinary attack reaches
forward and stays short, and each skill cell goes the way its own description
says — wide, or tall, or long and narrow. Do not distinguish them by detail.
```

**잘려 나왔을 때** (칸 경계를 넘었을 때)

```
Part of the creature crosses the magenta separator lines and is cut off. Every
cell must contain the WHOLE creature with at least 8px of empty black between its
outermost pixel and every magenta line. Do not crop the creature to fix this and
do not move the magenta lines — redraw the creature SMALLER inside its cell, and
if it is a long shape, coil it or double it back on itself instead of extending
it. Keep the poses and the proportions the same.
```

**바닥이 그려져 나왔을 때**

```
The ground must not be drawn. Remove the floor line, the shadow, the puddle and any
rubble. Everything below and around the creature is pure black. Keep the poses
exactly as they are — only delete the ground.
```

**칸마다 다른 생물처럼 나왔을 때**

```
All %(cells)d cells are the SAME creature — same outline, same size, same eyes,
same markings, same swallowed objects in the same places. Only the pose changes
between them. Redraw them as one animation, not as %(cells)d separate drawings.
```

**너무 작게 그려 나왔을 때**

```
The creature is drawn too small inside its cell. Redraw it filling about %(fill)d%%
of the cell height, centred, with the empty space distributed around it rather than
below it.
```
"""


PASSIVE_PAGE = """# 보스 패시브 로고

← [색인으로](BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.

패시브를 가진 우두머리가 **넷**입니다. 패시브는 껐다 켜지는 것이 아니라 싸우는
내내 걸려 있으므로, 화면 위쪽에 로고가 **계속** 떠 있어야 합니다.

이건 생물 그림이 아니라 **아이콘**입니다 — 쿼터뷰가 아니고, 12~16px 에서
읽혀야 하고, 규칙이 통째로 다릅니다.

## 넷의 윤곽이 겹치면 안 됩니다

12px 에서 안쪽은 없는 것과 같습니다. 그래서 넷을 **모양으로** 갈랐습니다 —

| 로고 | 우두머리 | 윤곽 |
|---|---|---|
%(rows)s

## 셀 순서

%(table)s
## 프롬프트

%(prompt)s
## 슬라이서 설정

```json
{ "file": "<파일명>", "name": "boss_passive", "expect": [4, 1],
  "labels": [%(labels)s] }
```
"""


INDEX = """# 보스 이미지 프롬프트

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 `tools/gen-boss.py` 의 `BOSSES` 를 고치세요.

우두머리 **스무 마리**입니다. 잡몹 프롬프트는 따로 있습니다
([`FOE_ART_PROMPTS.md`](FOE_ART_PROMPTS.md)) — 그린 이유가 달라서 생성기를
갈랐습니다.

## 잡몹과 뭐가 다릅니까

**칸 수가 다릅니다.** 잡몹은 대기·공격·피격 셋이면 끝입니다. 우두머리는
기술을 가지고 있고 **기술마다 동작이 달라야** 하므로 칸이 더 필요합니다 —
기술이 하나면 **4칸** (대기 · 평타 · 스킬1 · 피격), 둘이면 **5칸** 입니다.
지금 5칸짜리는 둘뿐입니다 (10판 슬러지누스, 20판 실바누스).

**볼 시간이 깁니다.** 잡몹은 넷이 겹쳐 서서 각자 45px 이지만, 우두머리는 혼자
서서 칸의 60~86%% 를 씁니다. 체력이 500 이라 한 판이 깁니다. 그래서 잡몹에는
낭비인 것들 — 아문 상처, 삼킨 것, 눈 여럿 — 이 여기서는 본론입니다.

**저마다 사고가 하나씩 있습니다.** 잡몹은 여럿 중 하나지만 우두머리는 이름이
있는 한 마리입니다. 그래서 스무 마리 각각에 **그 놈에게만 일어난 일**을 하나씩
박아 두었습니다 — 몸을 관통한 수레바퀴, 눈구멍을 뚫고 자란 덩굴, 혼자만 안 녹은
종추. 모든 칸에 있어야 하고, 그게 "이 놈" 을 만듭니다.

## 동작이 규칙에서 나옵니다

수치가 먼저 정해져 있고 그림이 거기서 나왔습니다. **무엇을 하는 기술인지가
어떤 모양이어야 하는지를 정합니다** —

| 기술이 하는 일 | 칸의 모양 |
|---|---|
| 전원을 친다 | **넓거나 높다.** 몸 전체가 실린다 |
| 한 명을 크게 친다 | **길고 좁다.** 한 점을 겨눈다 |
| 오래 아프게 한다 | 몸에서 **여럿이 나간다.** 몸은 오히려 작아진다 |
| 약하게 만든다 (피해 없음) | 날카로운 것이 없다. 몸이 **주저앉는다** |

## 목록

| 스테이지 | 이름 | 칸 | 패시브 | 상태 |
|---|---|---|---|---|
%(rows)s

## 우두머리에 딸린 다른 문서들

| 문서 | 무엇 | 개수 |
|---|---|---|
| [`BOSS_PASSIVE_PROMPTS.md`](BOSS_PASSIVE_PROMPTS.md) | 패시브 로고 — 싸우는 내내 화면 위쪽에 | 4 |
| [`BOSS_FX_PROMPTS.md`](BOSS_FX_PROMPTS.md) | 몸에서 떨어져 나가는 것 — 암석·가시·벼락 | 7 |
| [`STATUS_ICON_PROMPTS.md`](STATUS_ICON_PROMPTS.md) | 상태 로고 — 출혈·기절·침묵 | 12 |

셋 다 12~60px 짜리라 생물 규칙이 아니라 제 규칙으로 그립니다. **로고 열여섯
(상태 12 + 패시브 4)의 윤곽은 서로 안 겹쳐야 합니다** — 한 화면에 같이 뜹니다.

## 지역

| 스테이지 | 지역 | 배경 |
|---|---|---|
| 1~5 | 오염된 응집체들의 평원 | `01` |
| 6~10 | 오염된 응집체들의 평원 | `02` |
| 11~15 | 타락한 군락의 정원 | `03` |
| 16~20 | 타락한 군락의 정원 | `04` |

지역 이름은 열 판마다 바뀌고 배경은 다섯 판마다 바뀝니다. 배경 프롬프트는
[여기](FOE_BG_PROMPTS.md) 있습니다 — 이번에 새로 그리지 않았습니다.

## 아직 안 붙은 것

**수치는 아직 코드에 안 들어갔습니다.** 이 문서의 기술 설명은 그림을 그리기
위한 사양이고, `core/autoBattle` 의 우두머리는 아직 예전 패턴 하나
(휩쓸기)만 씁니다. 지속 피해 · 기절 · 침묵 · 공속 감소 · 반사 · 흡혈 ·
방어 감소 · 게이지 차감은 전부 새로 만들어야 하는 장치입니다.

그림이 먼저인 이유는, 그림이 없으면 기술을 만들어도 화면에서 구분이 안 되기
때문입니다.
"""


ZONE = {True: '오염된 응집체들의 평원', False: '타락한 군락의 정원'}

FAMILY_RULE = {'slime': SLIME_BOSS, 'growth': GROWTH_BOSS}


def does_of(b):
    """"이 우두머리가 하는 것" 절 — 평타 · 기술 · 패시브."""
    out = []
    if b['passive']:
        out.append('**패시브 · %s** — %s' % b['passive'] + NL
                   + '(싸우는 내내 화면 위쪽에 로고가 떠 있습니다 → '
                     '[`BOSS_PASSIVE_PROMPTS.md`](../BOSS_PASSIVE_PROMPTS.md))')
    out.append('**평타** — 한 명에게 보통 피해. 시트에서 제일 자주 보이는 '
               '칸이라 제일 절제되어야 합니다.')
    for i, (sid, ko, does, _art) in enumerate(b['skills'], 1):
        out.append('**스킬 %d · %s** (`%s` 칸) — %s' % (i, ko, sid, does))
    return (NL + NL).join(out) + NL


def page(b):
    cells = len(b['frames'])
    prompt = block(
        NOTEXT,
        'SUBJECT: a %d-frame animation sheet of ONE single creature, left to '
        'right. The creature is in every cell.' % cells + NL + NL
        + 'THE CREATURE (the same one in all %d cells):' % cells + NL + b['lock']
        + NL + NL
        + rows_of(b['frames'], 'The %d cells, in this exact order:' % cells),
        PIXEL_STYLE,
        QUARTER,
        NO_GROUND,
        STANDS,
        SILHOUETTE,
        NOT_CUTE,
        FAMILY_RULE[b['family']],
        BOSS_IS,
        NAMED,
        MOTIONS,
        SKILL_CELL,
        PASSIVE_MARK if b['passive'] else '',
        ALIVE,
        'NOTHING MAY BE CUT OFF, AND NOTHING MAY LEAVE ITS CELL.' + NL
        + '- In the idle cell it fills about %d%% of the cell along its LONGER '
        'dimension — the height if it is taller than wide, the WIDTH if it is '
        'wider than tall. The other dimension follows from its proportions. It is '
        'the only creature on the field and it must read as such.' % b['fill'] + NL
        + '- Size the sheet from the LARGEST cell, not from idle. The skill cells '
        'break out of the body and they must still fit.' + NL
        + '- THE GAME DRAWS EACH SPRITE INSIDE A SQUARE BOX and shrinks it to fit. '
        'A creature drawn three times wider than it is tall therefore arrives on '
        'screen SMALL — the width is what got scaled down, and the height is left '
        'empty. Aim for a shape that sits comfortably in a square: at most about '
        'half again as wide as it is tall, in every cell.' + NL
        + '- THE WIDEST CELL SPANS AT MOST 90% OF THE CELL WIDTH, and the tallest '
        'at most 90% of its height. Where a cell says a pose is "three times its '
        'idle width" or "twice the height of the idle cell", that is an '
        'instruction about the IDLE pose too: draw idle small enough that the big '
        'pose still fits. Never solve it by letting the big pose overflow.' + NL
        + '- IF IT IS MEANT TO BE VERY LONG, show that by COILING, DOUBLING BACK '
        'or STACKING it — never by running it off the edge. Length that leaves the '
        'cell does not read as length; it reads as a drawing that got cut, and the '
        'slicer cannot find the cell boundary afterwards.' + NL
        + '- Every cell holds the WHOLE creature plus every loose piece. If any of '
        'it touches a magenta line, that cell has failed.' + NL
        + '- Leave at least 8px of empty black between the outermost pixel and '
        'every magenta line.',
        grid(cells, 1),
    )
    return TEMPLATE % {
        'name': b['name'], 'latin': b['latin'], 'set': b['id'],
        'stage': b['stage'], 'zone': ZONE[b['stage'] <= 10],
        'cells': cells, 'intro': b['intro'], 'does': does_of(b),
        'table': table_of(b['frames']), 'prompt': prompt,
        'labels': labels_of(b['frames']), 'fill': b['fill'],
    }


def passive_page():
    cells = [(i, ko, art) for i, ko, _who, art in PASSIVE_ICONS]
    rows = NL.join(
        '| `%s` | %s · %s | %s |' % (i, who, ko, art.split('.')[0].strip())
        for i, ko, who, art in PASSIVE_ICONS)
    prompt = block(
        NOTEXT,
        'SUBJECT: a single sheet of 4 ICONS in one row, left to right. They are a '
        'matched set — same weight, same fill, same size within their cells.'
        + NL + NL
        + rows_of(cells, 'The 4 cells, in this exact order:'),
        PIXEL_STYLE,
        ICON_STYLE,
        'THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and '
        'squint. If any two have a similar outline, redraw the weaker one — the '
        'outline is the only thing that survives at 14 pixels. These four are '
        'deliberately a STAR, a DRIP, a THREE-STALK MOUND and a SHIELD; if any of '
        'them '
        'has drifted toward another, pull it back.',
        grid(4, 1),
    )
    return PASSIVE_PAGE % {
        'rows': rows, 'table': table_of(cells), 'prompt': prompt,
        'labels': labels_of(cells),
    }


if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)

    rows = []
    for b in BOSSES:
        p = os.path.join(OUT_DIR, b['id'] + '.md')
        open(p, 'w', encoding='utf-8').write(page(b))
        done = os.path.isdir(os.path.join('assets/sprites', b['id']))
        rows.append('| %d | [%s, %s](boss-art/%s.md) | %d칸 | %s | %s |' % (
            b['stage'], b['name'], b['latin'], b['id'], len(b['frames']),
            b['passive'][0] if b['passive'] else '—',
            '들어옴' if done else '프롬프트만',
        ))
        print('%s (%s)' % (p, b['latin']))

    open('docs/BOSS_ART_PROMPTS.md', 'w', encoding='utf-8').write(
        INDEX % {'rows': NL.join(rows)})
    open('docs/BOSS_PASSIVE_PROMPTS.md', 'w', encoding='utf-8').write(
        passive_page())

    five = sum(1 for b in BOSSES if len(b['frames']) == 5)
    print('우두머리 %d마리 (4칸 %d · 5칸 %d) · 패시브 로고 %d'
          % (len(BOSSES), len(BOSSES) - five, five, len(PASSIVE_ICONS)))
