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


SWARM_BOSS = """WHAT THIS IS: AN INSECT THAT GREW PAST THE SIZE AN INSECT CAN BE.

Not a bug mascot, not a beetle knight, not armour with legs. A segmented,
chitinous animal that kept moulting and never stopped, and is now the size of a
cart.

- IT IS BUILT IN SEGMENTS. The body is a chain of hard plates that overlap like
  roof tiles, each a little different from the last, with a soft dark gap showing
  between every pair. That repeating rhythm is what says "insect" at 40 pixels —
  protect it above any single detail.
- LEGS COME OUT OF THE SIDES, NOT THE BOTTOM. Three or more pairs, each bending
  the WRONG WAY at the knee (up first, then down), thin and hard, ending in a
  single hook. They are never symmetrical: one or two are shorter, bent, or
  missing entirely, and the stump is healed over.
- THE HEAD IS THE SMALLEST PART AND THE WORST. It is a fraction of the body but
  it holds everything that matters: the mouthparts. Draw them as two or four
  hard PLATES that open SIDEWAYS, not up and down — a jaw that hinges like a
  mouth is a mammal's jaw and it is wrong here.
- IT HAS MOULTED AND THE OLD SKIN IS STILL ON IT. One or two split, hollow
  plates hang off the back or trail behind, empty and dry, the same shape as the
  living plate underneath. That is what says it has done this many times.
- ANTENNAE OR PALPS: two long thin feelers off the head, unequal length, one
  broken short. They are the only soft-looking thing on it.
- NO FACE. No brow, no cheeks, no expression. Eyes are compound: solid domes
  with a coarse grid of pits, or clusters of small round ones. Whatever it is
  thinking, the drawing must not say.

IT HAS BEEN TAKEN, AND IT IS FURTHER GONE THAN THE MOBS.

Every creature in this region carries the same infestation — a breach in the shell
with hard faceted growth pushing out of it, and one body part replaced by that
growth. Draw both on this creature too, in every cell, at the place named above.

ON A BOSS IT GOES FURTHER. Two things separate it from a mob:

- THE BREACH IS BIG ENOUGH TO BE PART OF THE SILHOUETTE. On a mob it is a crack.
  Here it is a wound you could put an arm into, and the black inside it breaks the
  outline of the creature — you can see that the shell is not full.
- IT HAS STOPPED PRETENDING. On a mob the growth is a passenger. Here it is doing
  the work: the replaced part is one the creature FIGHTS with, so what reaches you
  when it attacks is not the animal's own.

THE GROWTH IS HARD, FLAT-SIDED AND ANGULAR — broken mineral forced up through a
crack from underneath. Not fungus, not slime, not flame, not a star of spikes. It
has NO glow, NO aura, NO particles and NO haze; the game draws its own effects and
anything like that baked into the sprite becomes a permanent white smear.

The black inside the breach is part of the shape. Do not fill it in."""""


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
         intro, passive=None, forms=()):
    """우두머리 하나.

    `skills` 는 `(칸이름, 한글이름, 게임에서 하는 일, 그림 설명)` 목록이다.
    하나면 넷 칸, 둘이면 다섯 칸짜리 시트가 된다 — 칸 수를 따로 안 적는 이유는
    **적을 수 있으면 어긋날 수 있기 때문**이다. 기술이 몇 개인지가 곧 칸 수다.

    `forms` 는 **기술이 아닌 다른 모습**이다 — 고치를 쓴 상태, 우화한 뒤의 몸,
    반으로 갈린 뒤의 두 토막. 21판부터 이런 것들이 생겼다.

    기술과 갈라 둔 이유: 기술 칸은 "한 번 하고 원래대로 돌아오는 것" 이고,
    형태 칸은 **그 뒤로 계속 그 모습**이다. 문서에서 둘을 같은 목록에 넣으면
    그리는 사람이 형태 칸도 한순간의 동작으로 그린다.
    """
    frames = [('idle', '대기', idle), ('attack', '평타', attack)]
    frames += [(sid, ko, art) for sid, ko, _does, art in skills]
    frames += list(forms)
    frames += [('down', '피격', down)]
    return {
        'id': id_, 'name': name, 'latin': latin, 'stage': stage,
        'family': family, 'fill': fill, 'lock': lock, 'frames': frames,
        'skills': skills, 'forms': list(forms), 'passive': passive,
        'intro': intro,
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
        'b20_silvanus', '안에서부터 썩은 세계수', '실바누스', 20, 'growth', 86,
        'The tree this whole garden grew out of. Every plant and every stump the '
        'player has fought is a seed of it. Something got inside a long time ago, '
        'and it has been feeding instead of giving ever since.' + NL
        + 'BODY — READ THIS TWICE, IT IS THE WHOLE PROBLEM WITH THIS CREATURE. '
        'The TRUNK is ONE ENORMOUS SOLID FILLED COLUMN of white and it is the '
        'single largest unbroken mass in the entire game. It rises from the bottom '
        'of the cell to two-thirds height, it is AT LEAST A THIRD OF THE CELL WIDE '
        'along its whole length, and it is FILLED — not outlined, not hatched, not '
        'open. If you can see black through the sides of the trunk, the drawing '
        'has failed. Everything else hangs off that column. Draw the column first '
        'and refuse to make it thinner.' + NL
        + 'THE WOUND — this is the creature, and it is the first thing to get '
        'right. Down the FRONT of the trunk, from just under the crown to halfway '
        'to the ground, the wood has SPLIT OPEN into one enormous vertical rift, a '
        'third of the trunk wide, and it is BLACK ALL THE WAY IN. The lips of the '
        'split are thick, curled outward and hardened, ridged where the wood tried '
        'to close over it and failed. It is a hollow, not a scar. The tree is '
        'empty behind that gap and you can tell.' + NL
        + 'WHAT IS IN THE WOUND: EYES. SEVEN of them, deep inside the black, of '
        'clearly different sizes, at different depths — the largest low and near '
        'the front edge, the smallest far back and half lost. They are not on the '
        'tree; they are in the hole where the tree used to be. Nothing else in the '
        'game looks out from inside itself, and that is what says this one is '
        'occupied rather than alive.' + NL
        + 'BELOW THE EYES the rift widens into the MOUTH — the lower third of the '
        'split, edged with NINE heavy teeth of splintered wood, all of them grown '
        'INWARD from the lips like a trap that closed once and stayed shut. The '
        'four longest cross each other across the gap.' + NL
        + 'THE CROWN — IT HAS COME DOWN. This is what separates it from every '
        'other tree in the game, all of which reach up. SIX great boughs leave the '
        'top of the trunk, rise a little, and then CURVE OVER AND DOWN, sweeping '
        'outward and back toward the ground like the ribs of a cage closing around '
        'the trunk. The tips hang at about the height of the mouth. It is a canopy '
        'that FELL IN ON ITSELF and hardened there.' + NL
        + 'They are BOUGHS, NOT BRANCHES: each leaves the trunk AS THICK AS A '
        'QUARTER OF THE TRUNK ITSELF, stays thick through the whole curve, and '
        'only tapers in the last third. SIX AND NO MORE — no twigs, no forks, no '
        'offshoots, no leaves anywhere. The crown must read as six heavy curved '
        'shapes against black sky, not as a thicket. Between them you can see '
        'through to the trunk.' + NL
        + 'HANGING FROM THE BOUGHS — THE SEEDS THAT WENT WRONG. Three heavy PODS, '
        'one per bough on the near side, each the size of the beast skulls in this '
        'chapter, hanging on short thick stalks. Two are closed and swollen; the '
        'third has SPLIT along its length and is empty, and what came out of it is '
        'not shown. Three, not more — five was tried on this creature and the '
        'crown became clutter that vanished at game size.' + NL
        + 'THE PASSIVE — draw it in every cell: the trunk is armoured in HEAVY '
        'OVERLAPPING BARK PLATES. About EIGHT of them from base to crown, each a '
        'BIG SOLID SLAB as tall as a tenth of the trunk, separated by a single '
        'deep black groove, and each one CURLING AWAY from the wound at its inner '
        'edge — the armour is peeling back from the split. EIGHT BIG PLATES, NOT '
        'FIFTY SMALL SCALES; fine scaling turns to grey mush at game size and '
        'takes the trunk down with it. They are grown, not fitted, and they are '
        'never absent, not even in the struck cell.' + NL
        + 'THE BASE — IT IS STILL HOLDING THE GROUND UP. FOUR buttress roots, each '
        'a thick solid wedge as wide at the trunk as the trunk is deep, spread '
        'wide and grip a single broad SLAB OF EARTH that they have lifted clear of '
        'the ground beneath — a disc of packed soil and stone carried on the roots '
        'like a plate. The whole silhouette therefore reads as an hourglass '
        'standing on a heavy foot. This was the thing everything else grew out of, '
        'and it is still carrying the ground it did that on.' + NL
        + 'NO TRAILING ROOT HAIRS, no fibres, no scattered debris. Four heavy '
        'wedges and one slab. Everything thin has been tried on this creature and '
        'it came back as a scribble.',
        'standing at full height, boughs curved down and closed around the trunk, '
        'the three pods hanging still, the rift black and open down its front with '
        'all seven eyes looking out of it. Bark plates layered from base to crown '
        'and peeling back at the wound; the earth slab held up on the roots. '
        'Nothing moves — and the stillness is not waiting. It is a thing that '
        'stopped being one thing a long time ago and has not needed to move since.',
        'the strike. ONE bough has come off the cage — swung out and forward past '
        'the front of the trunk at head height, straightening as it goes, the pod '
        'on it swinging wide. The other five stay exactly where they were and the '
        'trunk has not moved at all. It does not lean, it does not step and it '
        'does not brace: it reaches out the way a root reaches, without hurry and '
        'without shifting its weight.',
        [('skill1', '태고의 성난 벼락',
          '아군 전체에 공격력의 150%만큼 물리 피해, 대상의 스킬 코스트를 '
          '50% 강제 차감, 30% 확률로 3초간 감전 (평타 6대마다)',
          'THE FURY — it hits EVERYONE and strips what they were charging, so the '
          'creature OPENS and takes the whole cell. THE CAGE HAS BEEN THROWN '
          'OPEN: all six boughs have swung UP AND OUT to full spread and '
          'straightened, reaching toward the top and both side edges of the cell '
          'but stopping clear of all three — the canopy that had fallen inward is '
          'flung outward for the only time in the sheet. The trunk has arched back '
          'and THE WOUND HAS PULLED WIDE, twice its idle width, all seven eyes '
          'thrown forward to the front edge of the split. Every bark plate has '
          'LIFTED and separated along its grooves, standing out from the trunk '
          'like a beast raising its hackles. The three pods swing out with the '
          'boughs and one has burst. Ten torn splinters hang in the air around the '
          'crown. It is the TALLEST AND WIDEST cell of the sheet.' + NL
          + '  Draw no lightning, no bolt, no glow — the game draws its own '
          'effects and a bolt in the sprite becomes a permanent white smear.'),
         ('skill2', '자비없는 칼날',
          '아군 중 체력이 가장 낮은 대상에게 공격력의 250%만큼 마법 피해 '
          '(평타 5대마다)',
          'THE EXECUTION — it picks the ONE weakest character and finishes them, '
          'so this cell is the opposite of the fury in every way. The cage stays '
          'CLOSED and still, exactly as in idle, the trunk stays upright, and the '
          'three pods do not even swing.' + NL
          + '  ONE THING HAS COME OUT OF THE WOUND. From the black inside the '
          'rift, a single hard SPIKE OF WOOD has driven straight FORWARD AND '
          'SLIGHTLY DOWN — flattened, straight-edged, tapering along its whole '
          'length, fully extended, reaching almost to the far edge of the cell but '
          'stopping clear of it, ending at one point below head height. It is the '
          'only thing out of place on the creature, and it did not come from a '
          'bough — it came from inside. That is the whole horror of this cell: the '
          'tree did not attack, the thing living in it did.' + NL
          + '  All seven eyes have turned to look along the spike. Nothing has '
          'left the body, nothing hangs in the air, and no bark has lifted. It is '
          'the NARROWEST and STILLEST attacking cell in the game — and it must '
          'read as colder than the fury, not weaker.')],
        'struck. The bark plates have SHATTERED off one whole side of the trunk '
        'and the pale wood beneath is split open, joining the rift so the wound now '
        'runs most of the way round. Two boughs are snapped and hanging by strips '
        'of bark; one pod has been knocked off and is falling. The earth slab has '
        'CRACKED across and half of it is sliding off the roots. For the first time '
        'the trunk is out of vertical — and the seven eyes have pulled back deeper '
        'into the black instead of looking out, which is the only cell where they '
        'retreat.',
        """20스테이지 우두머리. **마지막 적이고, 이 게임에서 제일 큽니다** (86%).

## 타락한 세계수입니다

이 정원이 **자라 나온 나무**입니다. 플레이어가 11판부터 잡아 온 덩굴도
그루터기도 꼬투리도 전부 이놈의 씨앗입니다. 오래전에 뭔가 안으로 들어갔고,
그 뒤로 주는 대신 먹고 있습니다.

한동안 "한 번도 진 적 없는 수호수" 로 그렸습니다. 혼자만 안 썩고 곧게 선
나무였는데, 그러면 **앞의 아홉과 이어지지가 않습니다** — 저것들이 왜 썩었는지,
이놈이 왜 마지막인지가 그림에서 안 나옵니다. 지금은 반대입니다: 앞의 아홉이
썩은 이유가 이놈이고, 이놈이 **제일 먼저 그리고 제일 깊이** 썩었습니다.

## 갈라진 틈이 이 놈의 전부입니다

줄기 앞면이 세로로 쩍 갈라져 있고, 그 안이 **끝까지 검습니다.** 상처가
아니라 **빈 굴**입니다 — 나무 속이 비었고 그게 보입니다.

그리고 **눈 일곱이 그 굴 안에서 밖을 봅니다.** 나무에 눈이 달린 것이 아니라,
나무가 있던 자리에 든 것이 내다보는 것입니다. 이 게임에서 제 속에서 밖을
보는 것은 이놈뿐이고, 그 하나가 "살아 있다" 와 "들어앉았다" 를 가릅니다.

입은 그 틈의 아래쪽입니다. 따로 그리지 마세요 — 틈이 곧 입입니다.

## 왕관이 **내려앉았습니다**

이 게임의 나무는 전부 위로 뻗습니다. 이놈만 **아래로 굽습니다** — 여섯 가지가
조금 솟았다가 바깥으로 휘어 내려와 줄기를 감싸는 **갈비뼈 우리**가 됩니다.
끝은 입 높이쯤에 매달립니다.

무너져 내린 채로 굳은 지붕입니다. 그 실루엣 하나로 앞의 열아홉과 갈립니다.

## 뿌리가 아직 땅을 들고 있습니다

버팀뿌리 넷이 **흙덩이 한 판을 통째로 들어 올린 채** 서 있습니다. 이 정원이
그 위에서 자랐고, 죽어 가면서도 그건 안 놓았습니다. "세계수" 라는 말이
그림에서 나오는 자리가 여기입니다.

## 굵게 그려야 합니다

이 놈은 한 번 **가는 선 뭉치**로 나왔습니다 (게임 크기에서 통짜 10% —
`python tools/check-blobs.py`). 얇은 것을 적어 두면 얇게 옵니다.

| | 규칙 |
|---|---|
| 줄기 | 칸 폭의 **3분의 1 이상**, 속이 꽉 찬 흰 기둥 |
| 가지 | 줄기 굵기의 **4분의 1**로 시작해 끝의 3분의 1에서만 가늘어짐 |
| 껍질 | **큰 판 여덟** — 비늘 쉰 개가 아니라 |
| 꼬투리 | **셋** — 다섯은 이미 해 봤고 게임 크기에서 잡동사니가 됐다 |
| 잔뿌리 | **없음** |

**다섯 칸입니다** (대기 · 평타 · 스킬1 · 스킬2 · 피격). 두 기술이 정반대여야
합니다:

| | 벼락 (스킬1) | 칼날 (스킬2) |
|---|---|---|
| 우리 | 활짝 열림 | **대기 그대로** |
| 움직인 것 | 전부 | 굴에서 나온 가시 하나 |
| 공중에 뜬 것 | 파편 열 개 | **없음** |
| 칸에서 | 제일 크다 | 제일 좁고 고요하다 |

스킬2 의 가시는 **가지에서 안 나옵니다.** 갈라진 굴 속에서 나옵니다 —
나무가 때린 것이 아니라 안에 든 것이 때린 것이고, 그게 이 칸의 전부입니다.

칼날 칸이 "약해 보이면" 실패입니다. 250% 짜리 처형이라 **더 차가워** 보여야
하고, 그건 아무것도 안 움직이는 것으로 만듭니다.

패시브 **세계수의 껍질**은 겹쳐 붙은 두꺼운 껍질판입니다. 여섯 칸 전부에
있어야 하고, 피격 칸에서 **깨져 나가는** 것이 곧 "20% 감소가 뚫렸다" 입니다.

눈 여섯이 **한 줄로 정렬**된 유일한 우두머리입니다. 다른 놈들은 다 흩어져
있습니다 — 이놈만 무언가를 결정한 것처럼 보여야 합니다.""",
        passive=('세계수의 껍질',
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

# ══ 21~30 · 우화하는 군체들의 침식지 ═════════════════════════════
#
# 앞 스무 마리와 **갈래가 다르다.** 1~10 은 슬라임(뼈가 없는 덩어리), 11~20 은
# 식물(자라서 그 모양이 된 것)이었다. 여기는 **곤충**이다 — 마디로 이어진
# 단단한 판, 옆으로 열리는 입, 잘못된 방향으로 꺾이는 다리.
#
# 그래서 실루엣이 앞 스무 마리와 안 겹친다. 덩어리도 아니고 가지도 아니라
# **반복되는 마디**다. 40px 에서 남는 것이 그 리듬이다.
#
# ## 이 장의 주제는 "한 번 더 벗는다" 다
#
# 열 마리 중 여섯이 싸우는 도중에 모습이 바뀐다 — 반으로 갈리고(21), 고치를
# 쓰고(23), 우화하고(25), 죽으면서 흩어지고(26), 허물을 벗어 분신을 만든다(30).
# 그래서 `forms` 칸이 여기서 처음 나온다.
#
# 그리는 쪽에서 지켜야 할 것: **바뀐 뒤에도 같은 놈으로 보여야 한다.** 몸의
# 마디 수, 다리 수, 부러진 자리는 그대로 가고 자세와 껍질만 달라진다.

BOSSES += [
    boss(
        'b21_centipeda', '절단하는 두 갈래 지네', '센티페다', 21, 'swarm', 70,
        'A centipede so long it was cut in half once and both halves kept walking.'
        + NL
        + 'BODY: a LONG segmented tube, held in a wide flat S so the whole length '
        'fits — head low and forward on the left, the middle rising, the tail '
        'doubling back above. TWELVE plates, each overlapping the next, each a '
        'little narrower toward the tail. The plate rhythm is the creature.' + NL
        + 'THE MIDDLE SEAM — this one only: exactly halfway along the body, ONE '
        'plate is not like the others. It is a double plate, thicker than its '
        'neighbours, with a clean straight SPLIT LINE running all the way across '
        'it and a row of five short interlocking hooks along that line, like a '
        'clasp. It is the only straight line on the whole animal and it says the '
        'body comes apart there. It must be visible in EVERY cell.' + NL
        + 'THE INFESTATION — this one: the CLASP SEAM at the middle of the body is not holding by itself any more. The growth has come up through it from inside, packing the gap between the two halves and standing out along the whole clasp line, so the one straight line on the animal is now a ridge of broken mineral. It is what will split, and it looks it.' + NL        + 'THE REPLACED PART: of the two fangs, the LEFT one is not hollow bone — it is a straight faceted shaft with no groove and no curve, and it is longer than the right. What it injects is not its own.' + NL        + 'LEGS: eight pairs down the front half, six down the back, all bending '
        'up then down, all ending in a hook. Three are broken to stumps.' + NL
        + 'HEAD: small, a fifth of the body height. Two hard FANGS curve inward '
        'from the sides, each as long as the head is wide, with a visible groove '
        'running their length — they are hollow and they inject.' + NL
        + 'EYES: a cluster of six small domes on each side of the head, uneven.'
        + NL
        + 'THE TAIL END is not a point: it is a second, blunter head — two shorter '
        'hooks and four tiny eye domes, facing BACKWARD. It has always had two '
        'ends and only one of them bites.' + NL
        + 'SCARS: the old moult skin of three plates hangs off the upper back, '
        'split down the middle and empty.',
        'coiled in its flat S, head low and forward, fangs folded in against the '
        'jaw, the clasp seam plainly visible at the middle of the body. The tail '
        'head is raised slightly and looking the other way. It is the widest thing '
        'on the field and none of it is moving.',
        'the strike. The front third has driven forward and DOWN off the coil, '
        'head first, fangs swung wide apart to their full spread. The back half '
        'has not moved at all — it is still coiled, anchoring. That is what makes '
        'the front look fast.',
        [('skill1', '맹독 침',
          '아군 1명에게 공격력의 150% 마법 관통 피해 + 5초간 중독 (0.5초마다 8%) '
          '— 코스트 5',
          'VENOM STRIKE — one target, and the poison is the point. The head has '
          'REARED nearly vertical, higher than any other cell, and the two fangs '
          'are held straight DOWN and parallel like a pair of nails, at their '
          'fullest length. Three heavy drops hang off the fang tips and stop in '
          'empty black. The body below is gathered into a tight vertical stack of '
          'plates — compressed, not spread. It is the TALLEST and NARROWEST cell '
          'of the sheet.')],
        'struck. The coil has been knocked out of its S into a broken zigzag, four '
        'legs snapped off and hanging by the hook, two plates lifted off their '
        'neighbours so the soft dark gaps show wide. The head is turned away and '
        'one fang is broken off halfway.',
        """21스테이지 우두머리. **다섯째 지역의 첫 우두머리**입니다.

지역이 바뀌었다는 것을 이 한 마리가 말해야 합니다. 앞의 스무 마리는 덩어리
아니면 가지였고, 이놈은 **마디**입니다 — 화면에 뜨는 순간 "다른 것이 나왔다"
가 읽혀야 합니다.

## 가운데 이음매가 이 놈의 전부입니다

체력이 절반이 되면 몸이 그 자리에서 **둘로 갈라집니다** (`split_head` ·
`split_tail`). 그러니까 갈라질 자리가 처음부터 보여야 합니다 — 안 보이면
갈라지는 순간이 "왜 두 마리가 됐지" 가 됩니다.

이음매는 온몸에서 **유일한 직선**입니다. 나머지는 전부 굽었습니다.

## 갈라진 두 토막은 따로 그립니다

`split_head` 와 `split_tail` 은 갈라진 **직후의 모습**이고, 그 뒤로 계속
그 모습입니다. 둘의 마디를 합치면 원래 열둘이어야 합니다 — 머리 쪽 일곱,
꼬리 쪽 다섯. 세어 보면 맞아야 합니다.

꼬리 토막은 평타만 쓰는 대신 두 배로 빠릅니다. 그래서 다리가 더 촘촘하고
몸이 더 짧습니다 — 같은 길이를 반으로 접은 것처럼 보이면 안 됩니다.""",
        forms=[
            ('split_head', '갈린 앞토막',
             'THE FRONT HALF, JUST SEPARATED. The first seven plates only, ending '
             'in a raw open cross-section where the clasp used to be — the ring of '
             'five hooks is still there on the cut edge, standing out, and the '
             'inside of the tube shows as a dark hollow ring. It is HALF THE '
             'LENGTH of the idle cell and it is holding itself up on its remaining '
             'eight pairs of legs, front raised, fangs spread. It looks more '
             'dangerous than the whole animal did.'),
            ('split_tail', '갈린 뒷토막',
             'THE BACK HALF, JUST SEPARATED. The last five plates, the blunt tail '
             'head now leading, the cut end trailing with the same ring of hooks '
             'showing. SHORTER AND STOCKIER than the front half, plates packed '
             'closer together, six pairs of legs bunched under a short body. No '
             'fangs — the tail head has only the four short hooks. It is drawn '
             'LOW and BUNCHED, and that low bunched shape is what says it is the '
             'fast one.'),
        ],
        passive=('절단 분열',
                 '체력 50% 이하가 되는 즉시 몸이 반으로 갈라져 머리와 꼬리 '
                 '두 마리가 된다 (각각 남은 체력의 절반, 꼬리는 평타만 쓰지만 '
                 '공격속도 두 배)'),
    ),

    boss(
        'b22_apis', '황금빛 호위벌', '아피스', 22, 'swarm', 66,
        'A soldier bee that outlived its queen and kept guarding the empty comb.'
        + NL
        + 'BODY: a heavy upright abdomen hanging below a compact thorax — pear '
        'shaped, TALLER THAN WIDE, hanging as if the weight is all at the bottom. '
        'The abdomen is banded in SEVEN thick plates. It does not stand on the '
        'ground; it hangs in the air.' + NL
        + 'THE INFESTATION — this one: the growth has come up through the COMB fused to its shoulders, splitting three of the hexagonal cells open from beneath and filling them with faceted lumps instead of wax. The one thing on this creature that was built has been overrun.' + NL        + 'THE REPLACED PART: the STING is not a barbed spike any more. It is a straight faceted lance, thicker and blunter, growing out of a hardened socket where the abdomen tip split around it.' + NL        + 'WINGS: FOUR, held out and back, thin and hard, each one a flat blade '
        'with a coarse grid of veins showing through. Two are whole. One is torn '
        'to two-thirds. One is a stub. Uneven wings are what stop it looking '
        'decorative.' + NL
        + 'THE STING is the longest hard thing on it — a straight barbed spike '
        'coming down and back from the tip of the abdomen, as long as the abdomen '
        'itself, with three backward barbs along it. It is always pointing down.'
        + NL
        + 'HEAD: small, dominated by two enormous compound domes covering most of '
        'it, each pitted with a coarse grid. Between them, two short mouth plates '
        'opening sideways.' + NL
        + 'THE ACCIDENT — this one only: it is wearing COMB. Four or five broken '
        'HEXAGONAL cells of honeycomb are fused to the top of the thorax and the '
        'shoulders, like a torn piece of armour it grew into. Some cells are '
        'capped, some are open and empty. Nothing else in the game has hexagons '
        'and that is what names it across the field.' + NL
        + 'LEGS: three pairs, folded up tight under the thorax, each carrying a '
        'dense brush of stiff hairs. They are drawn as hard shapes, not fur.' + NL
        + 'SCARS: two abdomen plates are cracked across and healed crooked.',
        'hovering, hanging nose-down at a slight angle, legs folded, the sting '
        'pointing straight down at the ground. The four wings are held out and '
        'still — draw them still, not blurred. The comb on its shoulders is the '
        'brightest mass in the cell.',
        'the jab. The whole body has TIPPED nose-down almost vertical and driven '
        'forward, and the sting has swung UP AND FORWARD past the head, leading '
        'the attack. Legs are out and grasping. The wings have swept back flat '
        'against the body. Compact, committed, and pointed.',
        [('skill1', '여왕의 황금 장막',
          '즉시 자신에게 보호막을 두르고 5초간 시전. 5초 안에 보호막을 못 깨면 '
          '아군 전체가 각자 최대 체력의 50% 피해 + 3초 기절 — 코스트 10',
          'THE GOLDEN VEIL — it stops and armours itself, so this cell is CLOSED, '
          'not reaching. The body has curled into a tight ball, head tucked, sting '
          'folded in under the abdomen, legs drawn in. All four wings have swept '
          'FORWARD and around it, tips nearly meeting, forming a broken shell. '
          'Growing outward from the comb on its shoulders, SIX new hexagon cells '
          'have opened into a ring around the whole body, not touching it, each '
          'one a thick-walled empty hex. It is the ROUNDEST cell of the sheet and '
          'the only one where nothing points outward. The threat is that it is '
          'building something.')],
        'struck. The ball is broken open — three hexes of the ring shattered to '
        'stubs, one whole wing torn free and tumbling clear, the abdomen '
        'wrenched sideways so the plates gape. The sting is bent. It is still '
        'in the air but it has lost its shape.',
        """22스테이지 우두머리.

**시간 제한이 있는 첫 우두머리입니다.** 보호막을 5초 안에 못 깨면 파티가
반쪽이 나고 3초를 못 움직입니다. 그러니까 3번 칸은 "때린다" 가 아니라
**"닫힌다"** 로 읽혀야 합니다 — 다른 칸이 전부 뾰족한데 이 칸만 둥급니다.

## 육각형이 이 놈의 이름표입니다

게임 전체에서 육각형이 있는 것은 이놈 하나입니다. 어깨의 벌집 조각은 네 칸에
다 있어야 하고, 3번 칸에서는 그것이 몸 둘레로 자라 나옵니다.

## 날개는 흐리게 그리지 마세요

1-bit 라 잔상이 안 그려집니다. 흐리게 시도하면 흰 얼룩이 됩니다. 날개는
**멈춘 딱딱한 판**으로 그리고, 움직임은 각도로만 말합니다.""",
    ),

    boss(
        'b23_nucanus', '강철 갑각의 폭군', '누카누스', 23, 'swarm', 72,
        'A beetle that answered every wound by growing another plate.' + NL
        + 'BODY: a MASSIVE low wedge, WIDER THAN TALL, front end high and thick and '
        'tapering back — like a shield dragged along the ground. The whole upper '
        'surface is ONE enormous domed carapace made of five overlapping plates, '
        'each thicker than the last toward the front.' + NL
        + 'THE HORN is the front third of the animal: a single solid IRON-COLOURED '
        'ram, flat on top, blunt at the tip, as wide as the head and reaching '
        'forward past everything else. It is not a spike — it is a wall on the '
        'front of the body. It has three deep dents in it that never healed.' + NL
        + 'THE INFESTATION — this one: the MOULT RIDGE down the middle of the carapace has burst. Between the third and fourth crossbar stitches the shell has torn wide open and a heavy cluster of growth stands up out of it — the seam that is supposed to hold the armour shut is the place the armour failed.' + NL        + 'THE REPLACED PART: the horn is no longer solid bone across its whole width. Its right half is faceted, flat-sided and squared off, and the two halves do not meet cleanly — the ram is half its own and half something else.' + NL        + 'LEGS: three pairs, short and thick, spread wide and braced, each knee '
        'bending up then down, each foot a broad hook that grips. It is built low '
        'and it is built to push.' + NL
        + 'HEAD: almost hidden under the horn. Two small compound domes visible '
        'from the side, and two short mouth plates below.' + NL
        + 'THE MOULT SEAMS — this one only: running down the middle of the '
        'carapace, front to back, is a single raised RIDGE with SIX crossbars over '
        'it, evenly spaced, like stitches holding it shut. That ridge is where the '
        'shell opens when it moults. It is the only regular repeating pattern on '
        'the animal and it must be in every cell.' + NL
        + 'SCARS: the rear two plates are chipped along their edges and one has a '
        'hole punched clean through, healed over from underneath.',
        'braced. All six legs planted wide, body low to the ground, horn levelled '
        'straight forward. Nothing is raised and nothing is reaching. It reads as '
        'weight that has stopped moving, not as an animal at rest.',
        'the shove. The whole mass has driven FORWARD a body length, front legs '
        'off the ground and folded, back legs extended straight behind and still '
        'pushing, horn first. The body is at its LONGEST here — stretched from '
        'horn tip to back foot. Nothing rises.',
        [('skill1', '짓밟는 무쇠 뿔',
          '맨 앞의 아군에게 공격력의 250% 물리 피해 + 3초 기절 — 코스트 5',
          'THE TRAMPLE — one target, all the weight. The front of the body has '
          'REARED up so the horn is held high and angled DOWN, the front two pairs '
          'of legs clawing at nothing above the ground, the whole mass balanced on '
          'the back pair. It is the only cell where this animal leaves the ground, '
          'and it is about to come down on one spot. The carapace ridge is bent '
          'into a curve by the arch of the body.')],
        'struck. Two legs have folded the wrong way and the body has dropped onto '
        'that side, the horn ploughed into nothing and turned aside, and the front '
        'carapace plate has split along the moult ridge showing a hand-width of '
        'soft dark seam. The stitches on that stretch are torn apart.',
        """23스테이지 우두머리.

**때리는 횟수로 푸는 첫 기믹입니다.** 체력이 절반이 되면 고치에 들어가고,
30번을 때려야 깨집니다 — 그 사이 초당 2% 씩 찹니다. 딜이 모자라면 영영 안
깨지므로, 여기가 이 지역의 첫 벽입니다.

## 고치는 기술 칸이 아니라 형태 칸입니다

`cocoon` 은 한순간의 동작이 아니라 **그 뒤로 몇 초 동안 계속 그 모습**입니다.
그래서 동작이 아니라 **덩어리**로 그려야 합니다 — 다리도 뿔도 안 보이고,
공 하나만 남습니다.

깨야 할 곳이 보여야 합니다. 등의 이음매 여섯 바늘이 고치 겉면에도 남아
있어야 하고, 그게 "여기를 치면 된다" 를 말합니다.

## 뿔은 뾰족하면 안 됩니다

창이 아니라 **벽**입니다. 끝이 뾰족해지면 21판 지네의 독니와 겹치고, 무엇보다
250% 짜리 한 방이 "찌른다" 로 읽힙니다 — 이건 짓밟는 기술입니다.""",
        forms=[
            ('cocoon', '단단한 고치',
             'THE COCOON — this is a STATE, not an action. The entire animal has '
             'pulled itself into a single closed OVOID sitting on the ground, '
             'legs folded away underneath and invisible, horn tucked down and '
             'flush so only its blunt outline shows as a ridge on the front. It '
             'is SMOOTH where the animal is jagged — the carapace plates have '
             'clamped shut over everything. It is the only cell with no legs, no '
             'points and no gaps.' + NL
             + '  The six crossbar stitches down the middle ridge are still there '
             'and are now the ONLY detail on the whole shape. Draw them heavier '
             'than anywhere else: that seam is what the player has to break.'),
        ],
        passive=('경화 갑각',
                 '체력 50% 이하가 되면 5초간 단단한 고치 상태. 30번을 때려야 '
                 '깨지고, 그 동안 1초마다 체력 2% 회복'),
    ),

    boss(
        'b24_biblis', '환각 인분을 뿌리는 유령나방', '비블리스', 24, 'swarm', 68,
        'A moth that has been dead long enough that the dust does the flying.' + NL
        + 'BODY: a narrow furred thorax and a short tapering abdomen, small and '
        'almost an afterthought — the WINGS are the animal. The body hangs '
        'vertically, head up.' + NL
        + 'THE INFESTATION — this one: the growth has come through the THORAX between the wing roots, a cluster big enough to force the upper pair apart so they no longer sit level with each other. On a creature that is mostly wings, the thing that holds them has been broken open.' + NL        + 'THE REPLACED PART: one of the two EYE-SPOTS on the upper wings is not a marking. It is a real faceted lump grown through the wing membrane in the shape of the spot, standing proud on both sides, and it is the one that does not match the other.' + NL        + 'WINGS: TWO enormous pairs, spread wide and held FLAT, together three '
        'times the width of the body. They are ragged: the outer edges are eaten '
        'into deep scallops, three holes are punched clean through the upper '
        'pair, and the lower pair is torn to half length on one side. Across each '
        'upper wing is ONE huge EYE-SPOT — a thick ring with a solid centre, as '
        'wide as the thorax. The two eye-spots are DIFFERENT SIZES and sit at '
        'different heights.' + NL
        + 'THE REAL EYES are small, two dull domes on a head half buried in fur, '
        'and they are far less noticeable than the false ones. That mismatch is '
        'the whole idea: the thing looking at you is not looking at you.' + NL
        + 'THE DUST — this one only: fine loose FLAKES are coming off the wing '
        'edges and hanging in the black. Draw them as a scatter of separate small '
        'solid shapes, biggest near the wing and smaller further out, thinning to '
        'nothing. Never as a cloud, never as a gradient. They are in every cell '
        'and they are how the passive shows.' + NL
        + 'ANTENNAE: two wide feathered combs off the head, held back, one broken '
        'to a stub.' + NL
        + 'LEGS: three thin pairs held tucked and useless against the thorax.',
        'hanging in the air, wings spread FLAT and level, both eye-spots facing '
        'front, dust drifting off the lower edges. It is the WIDEST cell of the '
        'sheet and the stillest. Nothing about it says which way it will go.',
        'the brush. The wings have swept DOWN and forward together, curling under '
        'at the tips so the whole span has narrowed by half, and a heavy sheet of '
        'dust has been thrown off the leading edges — twice as many flakes as any '
        'other cell, all travelling one way. The body has barely moved. It '
        'attacks by shedding.',
        [('skill1', '정신 착란',
          '아군 1명에게 4초간 혼란 — 3초간 스킬을 못 쓰고 평타로 아군을 친다 '
          '— 코스트 10',
          'DERANGEMENT — it is not hitting anyone; it is showing them something. '
          'The wings have swung fully FORWARD and OVERLAPPED in front of the body, '
          'facing the viewer square on, so the two eye-spots are now side by side '
          'and centred — a single enormous pair of eyes staring straight out, '
          'nothing else visible behind them. The real head is completely hidden. '
          'This is the ONLY cell that faces the front instead of the side, and '
          'the only one that is symmetrical. Dust hangs thick and still around it '
          'in a wide ring, not travelling anywhere.')],
        'struck. One upper wing is folded backwards at a break halfway along, its '
        'eye-spot creased through the middle, and the body has tipped nose-down '
        'and started to fall. The dust has stopped coming off — the flakes still '
        'in the air are all far from the wings and thinning out.',
        """24스테이지 우두머리.

**아군이 아군을 때리는 첫 기믹입니다.** 혼란에 걸린 사람은 3초간 스킬을 못
쓰고 평타로 아군을 칩니다. 그러니까 3번 칸은 때리는 그림이면 안 됩니다 —
**보여 주는** 그림입니다.

## 눈알 무늬가 진짜 눈보다 커야 합니다

이 놈이 하는 일이 "보게 만드는 것" 이라, 날개의 가짜 눈이 화면에서 제일 큰
덩어리여야 합니다. 진짜 눈은 털에 묻혀 거의 안 보입니다. 그 어긋남이 이
놈의 전부입니다.

## 3번 칸만 정면입니다

넷 중 셋은 옆모습이고 이 칸만 앞을 봅니다. 좌우 대칭인 것도 이 칸뿐입니다.
그 두 가지가 "지금 이건 다른 종류의 일이다" 를 말합니다.

## 인분은 구름이 아닙니다

흑백 2색이라 뿌연 것을 못 그립니다. **낱개의 작은 덩어리**로 흩어 그리고,
날개에서 멀어질수록 작아지다 사라지게 하세요.""",
        passive=('독침',
                 '평타에 맞으면 2초간 중독 — 0.5초마다 최대 체력의 1% 씩, '
                 '최대 3중첩 (중첩마다 1% 씩 늘어 3%)'),
    ),

    boss(
        'b25_arachnes', '우화의 모체, 여왕 아라크네스', '아라크네스', 25, 'swarm', 80,
        'The one that lays the others. She has not finished growing and she is '
        'already the largest thing in the region.' + NL
        + 'BODY: TWO masses joined at a narrow waist — a compact armoured '
        'cephalothorax in front, and behind it an ENORMOUS swollen abdomen, twice '
        'its size, hanging low and heavy. The abdomen is not armoured: it is soft, '
        'stretched, and banded with strain lines. That contrast is the animal.' + NL
        + 'THE INFESTATION — this one: the growth has come out through the WAIST, the narrow join between her two masses, packing it like a collar so the front half and the abdomen are held together by the thing in her rather than by her. It is visible from every angle and it is the reason her moult never finished.' + NL        + 'THE REPLACED PART: three of the EIGHT EYES are gone. In their sockets sit blind faceted lumps, flat-sided, all three on the same side of the bank — half her face still watches and half of it cannot.' + NL        + 'LEGS: FOUR pairs, long, each folding up above the body before coming '
        'down — so the knees stand HIGHER THAN THE BACK and the body hangs slung '
        'between them. Two legs are shorter than the rest and one ends in a stump. '
        'The span of the legs is twice the span of the body.' + NL
        + 'THE UNFINISHED MOULT — this one only: her whole front half is still '
        'half inside the old skin. A split, dry, hollow SHELL is peeled back off '
        'the cephalothorax and hangs down behind the head like a torn hood, still '
        'attached at the waist. Through the split you can see the new plates '
        'underneath, paler and unhardened. She has been interrupted mid-emergence '
        'and she stayed like that.' + NL
        + 'HEAD: a bank of EIGHT eyes in two uneven rows, three of them clouded '
        'over. Two hard fangs fold down and inward, each with a groove.' + NL
        + 'THE SPINNERETS at the tip of the abdomen are four short nozzles, and '
        'three thick strands of web already hang from them into empty black.' + NL
        + 'ON HER BACK, clinging to the abdomen: SIX small young, each a simple '
        'round body with four legs, at different sizes, none of them symmetrical '
        'with the others.',
        'slung between her legs, abdomen nearly touching the ground, fangs folded, '
        'the torn moult hood hanging behind her head. The young cling still. The '
        'web strands hang straight down. She is the LARGEST silhouette in the '
        'game and she is not doing anything with it yet.',
        'the bite. The front half has driven forward and down between the front '
        'legs, fangs swung out, while the abdomen stays exactly where it was — '
        'the waist stretches. Only two of the eight legs have moved. Almost all '
        'of her stays put, and that is what makes her look heavy.',
        [('skill1', '포식의 거미줄',
          '공격력이 가장 높은 아군 1명을 5초간 고치로 묶어 행동 불능으로 만들고 '
          '매초 그 대상의 체력 10% 를 흡수 — 코스트 6',
          'THE FEEDING WEB — she throws and then pulls. The abdomen has swung UP '
          'and FORWARD over the cephalothorax, tip pointed at the viewer, and from '
          'the four spinnerets a thick BUNDLE of strands has been fired forward '
          'and out of the cell edge — draw the bundle leaving as a broad fan of '
          'six or seven heavy lines converging to one point beyond the body, '
          'stopping short of the magenta line. Her front legs are drawn back and '
          'braced to HAUL. This is the only cell where the abdomen is higher than '
          'the head.')],
        'struck. Three legs have collapsed and the abdomen has dropped hard, '
        'splitting one strain band open. The moult hood has torn most of the way '
        'off and hangs by a thread. Two of the six young have been thrown clear '
        'and are falling. The head is turned away.',
        """25스테이지 우두머리. **이 지역의 중간 관문**이고, 지금까지 나온 것 중
제일 큽니다.

## 반쯤 벗다 만 허물이 이 놈의 이름표입니다

"우화의 모체" 라는 이름이 그림에 있어야 합니다. 앞몸은 아직 낡은 껍질 속에
반쯤 들어 있고, 그 껍질이 목덜미 뒤로 찢어져 늘어져 있습니다.

체력이 절반이 되면 **그 껍질을 마저 벗습니다** (`imago`). 그때 몸이 커지고
공격력이 30% 영구히 오릅니다. 그러니까 벗기 전의 모습이 먼저 있어야 합니다 —
`idle` 에서 이미 다 벗고 있으면 우화하는 순간이 아무 뜻이 없습니다.

## 우화 뒤에는 새끼가 없습니다

`idle` 의 등에 붙어 있는 새끼 여섯이 우화 칸에서는 사라집니다. 패시브(군체의
지배자)가 그때 꺼지기 때문입니다 — 화면에서 그 둘이 같이 사라져야 "아, 저것
때문이었구나" 가 읽힙니다.

## 다리 무릎이 등보다 높아야 합니다

거미를 거미로 보이게 하는 것은 다리 수가 아니라 그 실루엣입니다. 몸이 다리
사이에 **매달려** 있어야 하고, 그래야 40px 에서도 지네·딱정벌레와 안 겹칩니다.""",
        forms=[
            ('imago', '우화한 성체 · 대기',
             'THE IMAGO — she has finished. This is a STATE and everything after '
             'this cell uses it. The old shell is GONE: no hood, no split, no dry '
             'skin anywhere. The cephalothorax is now fully hardened and visibly '
             'LARGER than in the idle cell, with three new ridges across it that '
             'were not there before. The legs are longer and held higher, the '
             'body slung further off the ground. THE SIX YOUNG ARE GONE from her '
             'back — that surface is bare and smooth. All eight eyes are clear. '
             'Same animal, same broken leg, same eight-eye arrangement, but '
             'nothing about her is unfinished any more.'),
            ('imago_skill', '우화한 성체 · 포식의 거미줄',
             'THE FEEDING WEB, AFTER THE MOULT. The same pose as the skill cell — '
             'abdomen swung up and forward, strand bundle fired out, front legs '
             'braced to haul — but drawn on the imago body: no hood, no young, '
             'bigger front half, longer legs. The strand bundle is THICKER here, '
             'nine or ten lines instead of six.'),
        ],
        passive=('군체의 지배자',
                 '3초마다 아군 전체의 스킬 코스트를 한 칸씩 깎는다 '
                 '(우화하면 꺼진다)'),
    ),

    boss(
        'b26_pyros', '거대한 발광충, 피로스', '피로스', 26, 'swarm', 66,
        'A firefly that swallowed its own light and has been swelling ever since.'
        + NL
        + 'BODY: a long soft segmented GRUB, TALLER THAN WIDE, held upright and '
        'curved back like a comma — heavy round tail end at the bottom, narrow '
        'head reaching forward at the top. NINE segments, each a fat ring, each '
        'ring divided from the next by a deep pinch.' + NL
        + 'THE LIGHT ORGANS — this one only: the last THREE segments before the '
        'tail are not soft. They are hard, translucent CHAMBERS, drawn as thick '
        'rings with hollow black centres, and each one is packed with a coarse '
        'grid of small cells like a honeycomb seen edge-on. They are the only '
        'hollow shapes on the whole animal, and they are what is about to go off.'
        + NL
        + 'THE SKIN IS TOO TIGHT. Between every pair of segments the surface has '
        'SPLIT into a short crack, four of them, and something pale is showing '
        'through. It is over-full.' + NL
        + 'THE INFESTATION — this one: the growth is INSIDE the three light chambers. Their hollow rings are packed with faceted lumps instead of the honeycomb grid, pressing against the walls from within so the chambers bulge out of round. That is what makes it over-full, and that is what goes off.' + NL        + 'THE REPLACED PART: the last tail segment is not a segment. It is one solid faceted block in roughly the shape of a ring, with no pinch between it and the one before — the body ends in something that did not grow there.' + NL        + 'LEGS: six short pairs down the front half, stubby and hooked, plus four '
        'fleshy prolegs at the back that grip. All small — it barely walks.' + NL
        + 'HEAD: tiny, a hard capsule with two mouth plates opening sideways and '
        'a pair of very short blunt horns. Eyes are four dull dots, almost lost.'
        + NL
        + 'DRIPS: two heavy drops hang off the underside of the tail and stop in '
        'empty black.',
        'upright and curled back, tail heavy on the ground, head lowered and '
        'forward, the three light chambers plainly visible at the base. The four '
        'skin splits are closed to slits. It looks swollen and slow.',
        'the lunge. The curve has straightened — the whole body has whipped '
        'FORWARD and DOWN so head and tail are almost in a line, head plates '
        'spread. It is the LONGEST cell of the sheet. The tail has come off the '
        'ground and the prolegs are trailing.',
        [('skill1', '인화성 분무',
          '아군 전체에 5초간 화상 — 받는 피해 30% 증가 — 코스트 5',
          'THE SPRAY — it goes to EVERYONE, so it goes UP AND OUT, not forward. '
          'The body has REARED into a tall column, tail planted, head thrown back '
          'and up, and the four skin splits have GAPED OPEN into wide gashes along '
          'the whole length. Out of every gash, a fan of separate small solid '
          'flakes is thrown sideways and up — six to eight per gash, biggest near '
          'the body, thinning outward, stopping well inside the cell. It is the '
          'TALLEST cell and the only one throwing anything.'),
         ('skill2', '날카로운 찌르기',
          '아군 전체에 공격력의 70% 물리 피해 — 코스트 2',
          'THE JAB — cheap, quick, and it must NOT look like the spray. The body '
          'has folded into a tight compressed S and the HEAD has shot straight '
          'forward on a stretched neck, the two mouth plates locked together into '
          'a single hard point. Everything else is pulled BACK and small. It is '
          'the NARROWEST cell of the sheet, and nothing leaves the body — no '
          'flakes, no drips, no light. One point, going one way.')],
        'struck. Two of the three light chambers are cracked across and their grid '
        'is broken, the body has slumped sideways off its curve, and two skin '
        'splits have torn wide open along their whole length. The head hangs down '
        'loose. It is still swollen — that is what makes the next thing worse.',
        """26스테이지 우두머리.

**죽은 뒤에 진짜 싸움이 시작되는 첫 우두머리입니다.** 체력이 0 이 되면 죽지
않고 폭탄 애벌레 넷으로 흩어지고, 5초 안에 넷을 못 잡으면 파티가 각자 최대
체력의 25% 를 맞습니다.

## 그래서 몸이 터질 것처럼 보여야 합니다

마디 사이가 네 군데 갈라져 있고, 그 안이 비쳐야 합니다. 죽을 때 그 자리에서
넷이 나오므로, 갈라진 자리가 미리 보여야 "아 저기서 나오는구나" 가 됩니다.

## 발광 기관 셋이 유일한 빈 모양입니다

몸은 전부 꽉 찬 덩어리인데 꼬리 쪽 세 마디만 속이 비어 있습니다. 흑백에서
빛나는 것을 그릴 방법이 그것뿐입니다 — 밝게 하면 그냥 흰 얼룩이 됩니다.

## 기술 둘이 정반대여야 합니다

3번(분무)은 온몸이 벌어져 사방으로 흩고, 4번(찌르기)은 온몸이 오므라들어 한
점으로 나갑니다. 이 둘이 닮으면 코스트 5 짜리와 2 짜리가 화면에서 같아집니다.

폭탄 애벌레는 따로 그립니다 → [`FOE_ART_PROMPTS.md`](../FOE_ART_PROMPTS.md)""",
        passive=('최후의 발악',
                 '체력이 0 이 되면 죽지 않고 폭탄 애벌레 4마리로 분열한다. '
                 '5초 뒤 자폭해 아군 전체에 각자 최대 체력의 25% 피해'),
    ),

    boss(
        'b27_locusta', '대지를 갉아먹는 식탐귀', '로쿠스타', 27, 'swarm', 70,
        'A locust that ate a field, then the fence, then the plough, and did not '
        'stop.' + NL
        + 'BODY: a long armoured trunk held at a low forward angle, WIDER THAN '
        'TALL, front half thick and back half tapering. Six overlapping plates. '
        'The whole thing is built around the front end.' + NL
        + 'THE MOUTH IS THE ANIMAL. It takes up the entire front quarter of the '
        'body: FOUR hard chewing plates arranged around a square opening, opening '
        'SIDEWAYS in two pairs, each plate ridged with a coarse row of grinding '
        'teeth along its inner edge. It is far too big to close properly and it '
        'never does.' + NL
        + 'HIND LEGS: one enormous pair, folded into a tight Z that stands HIGHER '
        'THAN THE BACK — the thigh as thick as the body. Four smaller front legs '
        'below. That folded Z is the second thing you see after the mouth.' + NL
        + 'WHAT IT ATE — this one only: hard things are lodged in the mouth plates '
        'and in the throat behind them, half ground down and never swallowed — a '
        'ploughshare, a bent horseshoe, two broken fence staves. They stand in the '
        'gaps between the plates at wrong angles. Nothing else in the region has '
        'worked metal in it.' + NL
        + 'THE INFESTATION — this one: the growth has come out of the THROAT behind the mouth plates, forcing the two plates behind the head apart so you can see into it. On a creature whose whole read is a mouth, the breach is in the thing it eats with.' + NL        + 'THE REPLACED PART: one of the four chewing plates is a flat faceted slab with no grinding ridge along its inner edge. It does not match the three around it and it cannot chew — it only holds.' + NL        + 'WINGS: a short hard pair folded flat along the back, too small to lift '
        'anything this size, both chipped along the trailing edge.' + NL
        + 'HEAD: two dull compound domes set far apart on the sides, and two short '
        'antennae, one snapped.' + NL
        + 'ABDOMEN: distended and banded, dragging.',
        'settled low and forward, the mouth plates hanging apart, hind legs folded '
        'tight and loaded. The lodged metal is plainly visible in the gaps. It has '
        'stopped moving but the mouth has not closed.',
        'the bite. The front half has driven forward and the four mouth plates '
        'have swung WIDE APART to their full spread — the opening is at its '
        'biggest here, wider than the body. The hind legs have straightened '
        'halfway to push. Everything is about that one opening.',
        [('skill1', '포식',
          '아군 1명에게서 체력 · 스킬 코스트 · 버프 중 하나를 빼앗는다 '
          '(체력이면 최대치의 20% 를 흡수해 회복, 코스트면 뺏은 칸당 공격속도 '
          '10% 5초, 버프면 3초간 그 버프를 제가 쓴다) — 코스트 8',
          'DEVOURING — it takes something and it keeps it. The body has REARED '
          'back and UP onto the hind legs, which are now fully extended and '
          'straight for the first time, lifting the front of the animal clear of '
          'the ground. The mouth plates have clamped SHUT into a single closed '
          'hard block — the only cell where that mouth is closed — and the throat '
          'behind it is visibly SWOLLEN, the two plates behind the head forced '
          'apart by something passing through them. The lodged metal has been '
          'pushed further in. It is the TALLEST cell, and it is the only one where '
          'nothing is open.')],
        'struck. It has come down hard on its side, the loaded hind legs sprawled '
        'and one bent backwards at the Z, two mouth plates broken off at the '
        'hinge and hanging. The ploughshare has been knocked loose and is falling '
        'clear of the mouth.',
        """27스테이지 우두머리.

**뺏는 우두머리입니다.** 체력을 뺏으면 그만큼 회복하고, 스킬 코스트를 뺏으면
빨라지고, 버프를 뺏으면 3초간 그 버프를 제가 씁니다. 그래서 이 놈 앞에서는
"모아 두는 것" 자체가 위험해집니다.

## 입이 닫히는 칸이 하나 있어야 합니다

네 칸 중 셋은 입이 벌어져 있고, 3번 칸에서만 **꽉 닫힙니다.** 삼킨 것이므로
닫혀야 하고, 목이 부풀어 있어야 "지금 뭔가 넘어갔다" 가 보입니다.

## 뒷다리가 몸보다 높아야 합니다

메뚜기를 메뚜기로 만드는 것은 접힌 뒷다리의 Z 자입니다. 그게 등보다 높이
서 있어야 지네(길다)·딱정벌레(낮고 넓다)와 실루엣이 안 겹칩니다.

## 삼킨 쇠붙이가 이 지역에서 유일합니다

21~30 어디에도 사람이 만든 물건이 없습니다. 이 놈만 보습과 편자를 물고
있습니다 — 그게 "대지를 갉아먹었다" 를 말하는 유일한 방법입니다.""",
    ),

    boss(
        'b28_mosquito', '핏빛 가시 입자루', '모스키토', 28, 'swarm', 62,
        'A mosquito that has fed so long it can no longer fly straight.' + NL
        + 'BODY: a thin, LONG, needle-straight abdomen held at a steep angle, '
        'attached to a small hunched thorax. The abdomen is the length of the '
        'whole rest of the animal and it is SWOLLEN in its middle third — a taut '
        'bulge with the segment bands stretched apart around it. Empty at both '
        'ends, full in the middle.' + NL
        + 'THE PROBOSCIS is the point of the creature: a single rigid needle '
        'projecting forward from the head, AS LONG AS THE ABDOMEN, dead straight, '
        'with a hair-fine taper and three tiny backward barbs near the tip. It is '
        'the longest straight line in the region.' + NL
        + 'THE INFESTATION — this one: the growth has come through the SWOLLEN section of the abdomen, splitting one of the two healed punctures open again and standing out of it in a heavy cluster. It is the only thick part of an animal made of lines, and it has been broken into.' + NL        + 'THE REPLACED PART: the base collar of the needle is faceted, and so is the first third of the needle itself — straight, flat-sided, and visibly a different material from the fine taper beyond it. What it drains through is not its own.' + NL        + 'LEGS: three pairs, absurdly long and thin, each bending twice, splayed '
        'wide so the body hangs low between them. One is broken at the second '
        'joint and hangs. They are drawn as hard hairlines with visible joints, '
        'never as smooth curves.' + NL
        + 'WINGS: one pair only, narrow and held back, both scarred with two long '
        'tears each. Too small for the swollen body.' + NL
        + 'HEAD: mostly two compound domes, and between them the base of the '
        'needle, thickened into a hard collar.' + NL
        + 'THE ACCIDENT — this one only: it did not empty. Three heavy DROPS hang '
        'from the underside of the swollen abdomen, and one more is halfway down '
        'the needle. They stop in empty black. It is the only creature in the '
        'region that is visibly carrying something wet.' + NL
        + 'SCARS: the swollen section has two healed punctures in it, ringed and '
        'puckered.',
        'standing high on its splayed legs, body hanging low between them, needle '
        'held level and forward, abdomen angled up and back. The drops hang. It '
        'is the THINNEST silhouette of the region — almost all of it is line.',
        'the settle. The legs have bent and lowered the body until the head is '
        'close to the ground, and the needle has angled DOWN, tip nearly touching. '
        'The abdomen has swung up higher behind. Nothing lunges — it lands and '
        'lowers. Restraint is the point of this cell.',
        [('skill1', '치명적 흡혈 침',
          '방어력이 가장 높은 아군에게 관통 물리 피해 200%, 입힌 피해의 300% '
          '만큼 자신을 회복. 대상은 5초간 치유량 50% 감소 — 코스트 5',
          'THE DRAIN — it is taking, and you can see it arriving. The whole body '
          'has driven forward and the needle is at FULL EXTENSION, angled steeply '
          'DOWN and out past the cell centre, rigid as a spear, legs braced and '
          'splayed to their widest. The swollen abdomen has DOUBLED — it is now '
          'the biggest mass in the cell, the segment bands pulled to thin lines '
          'around it, one healed puncture split open by the stretch. Two fat drops '
          'are being forced off the abdomen tip. It is the WIDEST cell of the '
          'sheet and the only one where the body outweighs the legs.')],
        'struck. The needle has snapped at two-thirds and the broken end hangs by '
        'a shred; three legs have folded and the body has dropped between them '
        'onto the swollen abdomen, which has split along one band and is emptying '
        '— four heavy drops falling clear. The wings are folded the wrong way.',
        """28스테이지 우두머리.

**회복하는 우두머리입니다.** 입힌 피해의 세 배를 스스로 채우므로, 비앙카의
화산(회복량 50% 감소)이 없으면 딜이 안 통합니다 — 이 지역에서 화산이 처음
필수가 되는 자리입니다.

## 방어력이 제일 높은 사람을 노립니다

앞의 우두머리들은 앞에 선 사람이나 체력이 적은 사람을 노렸습니다. 이 놈은
**제일 단단한 사람**을 노립니다 — 관통이라 방어가 소용없고, 그래서 탱커를
세워 두는 것이 오히려 위험합니다.

## 이 놈은 얇아야 합니다

이 지역의 다른 아홉이 전부 두꺼운 마디 덩어리입니다. 이 놈만 **거의 선**
입니다. 다리도 침도 가늘고, 부푼 배 한 곳만 두껍습니다. 그 대비가 40px 에서
이 놈을 알아보게 합니다.

## 물방울은 이 놈만 답니다

21~30 에서 젖은 것을 그리는 것은 이놈뿐입니다. 슬라임 장(1~10)이 이미 물방울을
많이 썼으므로, 여기서 아껴 쓰면 그것만으로 "피를 빨았다" 가 됩니다.""",
    ),

    boss(
        'b29_formica', '신경을 지배하는 동충하초', '포르미카', 29, 'swarm', 74,
        'An ant that died a long time ago. The thing standing there is what grew '
        'out of it.' + NL
        + 'BODY: a hollowed ant — three masses (head, thorax, abdomen) joined at '
        'two narrow waists, held low and forward. The chitin is DRY and cracked; '
        'in three places it has caved in and you can see the shell is empty '
        'behind it. It is a husk being worn.' + NL
        + 'THE STALKS — this one only: growing OUT THROUGH the shell are FIVE '
        'rigid FRUITING BODIES, each a straight stem ending in a swollen club '
        'head covered in a coarse grid of pores. They come out at wrong angles: '
        'two from the back of the thorax, one from the top of the head, one from '
        'the abdomen, one through the joint of a leg. They are TALLER THAN THE '
        'ANT — the tallest stalk doubles its height. Where each stalk emerges, the '
        'shell is cracked open in a star of splits around it.' + NL
        + 'THAT IS THE SILHOUETTE: a low insect body with a crown of five clubs '
        'standing above it, all different heights. Nothing else in the game grows '
        'up out of itself like that.' + NL
        + 'THE INFESTATION — this one is nearly complete, and it is the point of the creature: the ant is a husk and the growth has come through it in FOUR places at once — both waists and two of the caved-in shell panels — so the body is held together more by the mineral than by the chitin. Each breach is a black hole with faceted lumps standing out of it.' + NL        + 'THE REPLACED PART: the MANDIBLES. Both are gone; what is locked half open in their place are two straight faceted shafts, unmatched in length, that cannot close.' + NL        + 'LEGS: three pairs, locked stiff and splayed — the joints have set and '
        'no longer bend properly. One leg is fully rigid and drags.' + NL
        + 'HEAD: mandibles locked half open and they no longer close. The eyes are '
        'gone: both sockets are open and one has a small stalk growing from it.' + NL
        + 'SPORES: a scatter of separate small solid flecks drifts off the club '
        'heads and stops in empty black. Present in every cell — this is what the '
        'passive looks like.',
        'standing rigid on locked legs, head low, the five clubs held upright and '
        'still, spores drifting off the tops. It does not shift its weight. '
        'Nothing about it reads as breathing.',
        'the seize. The body has jerked forward on its stiff legs — a lurch, not a '
        'lunge — and the locked mandibles have driven ahead. The five clubs have '
        'NOT moved with the body; they lag behind, still upright, as if the ant '
        'and the growth are not moving at the same time. That mismatch is the '
        'whole cell.',
        [('skill1', '신경 마비 포자',
          '아군 전체에 4초간 지속 마법 피해 + 평타를 쳐도 스킬 코스트가 안 '
          '차는 신경 마비 — 코스트 6',
          'THE SPORE BURST — it goes to everyone, so it goes UP and OUT. All five '
          'club heads have SPLIT OPEN along their length into four peeled petals '
          'each, and out of every one a fan of separate flecks is thrown up and '
          'outward — the densest scatter of the sheet, biggest at the club and '
          'thinning to nothing well inside the cell. The stalks have straightened '
          'to their full height and spread apart into a wide crown; the ant body '
          'below has SAGGED, legs buckling, head down. The growth is standing up '
          'and the corpse is giving way. It is the TALLEST and WIDEST cell.')],
        'struck. Two stalks have snapped off partway and are falling, their club '
        'heads separate in the air; a third of the shell has caved in completely '
        'along a crack. The body has dropped onto one side but the legs are still '
        'locked in their standing position, sticking out wrong. Nothing about it '
        'looks like pain.',
        """29스테이지 우두머리. **최종 보스 직전**입니다.

**아군끼리 싸우게 만드는 우두머리입니다.** 체력이 절반이 되면 쉴드를 얻고,
5초 안에 못 깨면 파티 전체가 5초간 서로를 칩니다.

## 이 놈은 살아 있으면 안 됩니다

앞의 아홉이 전부 "살아 있는 것" 이었습니다. 이 놈만 **이미 죽은 것**입니다.
껍질은 마르고 갈라졌고 속은 비었고 눈은 없습니다. 움직이는 것은 개미가
아니라 개미에서 자란 것입니다.

그래서 2번 칸(평타)에서 **몸과 버섯대가 따로 움직입니다.** 몸이 앞으로
꺾이는데 대가리 다섯은 그 자리에 남아 있습니다. 그 어긋남 하나가 이 놈이
무엇인지 다 말합니다.

## 버섯대 다섯이 실루엣입니다

몸보다 대가 높아야 합니다. 낮게 깔린 개미 위로 곤봉 다섯이 서로 다른 높이로
서 있는 모양 — 21~30 중에 위로 자라는 것은 이놈뿐입니다.

## 포자도 인분(24판)과 같은 규칙입니다

구름으로 그리지 말고 **낱개 조각**으로. 다만 24판은 날개에서 옆으로 떨어지고
이놈은 **곤봉에서 위로** 솟습니다.""",
        passive=('포자 감염',
                 '체력 50% 이하가 되면 쉴드를 얻는다. 5초 안에 못 깨면 아군 '
                 '전체가 5초간 서로를 공격한다 (그동안 평타만)'),
    ),

    boss(
        'b30_baal', '침식을 완료한 군체의 절대자, 바알', '바알', 30, 'swarm', 84,
        'The last one. It is not one insect — it is what happens when the whole '
        'brood finishes becoming a single thing, and then crowns itself.' + NL
        + 'THIS ONE IS A MONARCH, NOT A PILE. Every other creature in this game '
        'is drawn as a thing that hunts. This one is drawn as a thing that '
        'RULES, and the difference has to survive being shrunk to 84 pixels:' + NL
        + '  - SILHOUETTE FIRST. Squinted at, it is one tall broad-shouldered '
        'TRIANGLE — wide braced base, mass carried high, narrowing to a crowned '
        'point. No other creature in the game has that outline. If the shape '
        'reads as a lumpy mound or a spiky ball, the drawing has failed no '
        'matter how good the detail is.' + NL
        + '  - IT DOES NOT LUNGE. The pose is held, weight square, absolutely '
        'still. Everything else in the game leans and reaches; stillness is what '
        'makes this one read as above them.' + NL
        + '  - IT IS BUILT SYMMETRICALLY, BUT IT IS NOT DRAWN FACING YOU. The '
        'creature is made of matched pairs — the arms match, the wing cases match, '
        'the crown fans evenly. You are seeing that matched body FROM THE SIDE, so '
        'on the page the near half overlaps and hides part of the far half. Draw '
        'the symmetry as a fact about the animal, never as a pose toward the '
        'camera. Exactly ONE thing genuinely breaks the pairing, named below.' + NL
        + '  - IT IS THE TALLEST THING IN THE GAME and it must be drawn to fill '
        'its cell top to bottom.' + NL
        + '  - NOT A FRONT VIEW. THIS IS THE EASIEST WAY TO GET THIS CREATURE '
        'WRONG. A formal, symmetrical, crowned thing invites a head-on heraldic '
        'portrait, and that is exactly what must not happen — it stands on the '
        'right side of a side-scrolling battlefield and has to face the party. '
        'The tells, in every cell:' + NL
        + '      · The head points RIGHT. You see the SIDE of the skull — one eye '
        'bank in view, the far one hidden or barely edged.' + NL
        + '      · The six legs are staggered in DEPTH, not spread in a row: the '
        'near three overlap and partly hide the far three.' + NL
        + '      · The two forelimbs are at DIFFERENT distances from the viewer — '
        'the near one crosses in front of the thorax, the far one is partly '
        'behind it. They are the same limb seen from two depths, not two limbs '
        'laid out flat.' + NL
        + '      · The mantle of wing cases is seen edge-on and swept back to the '
        'LEFT, trailing behind the body.' + NL
        + '      · The crown of spines fans across the head from the viewer, so '
        'the spines are seen at an angle and overlap each other.' + NL
        + '      If the creature is drawn chest-on with both arms mirrored to the '
        'left and right of the page, the cell is a failure no matter how good '
        'it looks.' + NL
        + 'BODY: an upright TOWERING mass, TALLER THAN WIDE, built of segmented '
        'plates that do not all belong to the same animal. Read from the ground '
        'up: a broad braced base of SIX legs planted like the feet of a throne, '
        'none of them a matching pair — one is a beetle\'s thick hook, one a '
        'mantis blade, one a spider\'s long joint, one a centipede\'s row of '
        'small hooks fused into a single limb. Above them a barrel thorax of NINE '
        'overlapping plates, the lowest ones flaring outward into broad shoulder '
        'pauldrons so the mass sits high and wide.' + NL
        + 'THE MANTLE — this is what makes it a monarch. Four long dead WING '
        'CASES hang from behind the shoulders, spread and held stiff, falling '
        'past the thorax like a heavy cloak. They are ragged along their lower '
        'edges and they do not move. They must be clearly BEHIND the arms and '
        'clearly NOT usable — this thing has not flown in a long time.' + NL
        + 'THE CROWN: the head carries a fan of SEVEN hard spines rising from the '
        'skull plate, the middle one tallest, the outer ones stepping down evenly '
        'to each side. Straight tapered spikes, evenly spaced, unmistakably '
        'arranged rather than grown. This is the top of the silhouette and the '
        'single most important shape on the creature.' + NL
        + 'IT IS MADE OF THE OTHERS — this one only, and it is the whole point: '
        'set into the plates of the thorax and the base, half absorbed and still '
        'recognisable, are parts of the creatures from earlier in the region: '
        'ONE hexagon of comb, ONE fruiting-body stalk with a club head, ONE '
        'moth wing with an eye-spot, ONE fang with a groove. Four, no more, '
        'spaced apart, each clearly a foreign shape sunk into the surface. Do not '
        'add a fifth and do not repeat one.' + NL
        + 'THE ARMS: TWO enormous forelimbs raised and held apart, each ending in '
        'a hard splitting blade, both bending the wrong way at the elbow. They '
        'are the only symmetrical thing on it, and they are held wide.' + NL
        + 'THE INFESTATION — this one has finished. The growth is not pushing through the shell any more; it IS the shell in places. Down the whole front of the thorax, four of the nine plates are faceted slabs rather than chitin, flat-sided and squared, and the seams between them and the living plates are black gaps you can see into. The absorbed parts of the earlier creatures are set INTO those faceted plates, not into the living ones — the thing in it is what collected them.' + NL        + 'THE REPLACED PART: the LEFT forelimb blade. Where the right one is a hard organic splitting blade, the left is one straight faceted shaft with a flat squared edge, longer than its twin and completely unmatched. The one thing on this creature that is symmetrical is not.' + NL        + 'HEAD: a hard capsule with a bank of TEN eyes in three rows, and four '
        'mouth plates that open sideways in two pairs. It is a fraction of the '
        'body and it is the darkest, most closed part.' + NL
        + 'THE MOULT: a full split, dry, hollow SHELL of a previous body stands '
        'behind and below it, empty and upright, still holding the shape it was '
        'left in. It is attached at nothing. It is standing there because it never '
        'fell over.' + NL
        + 'SCARS: three plates are punched through and healed from beneath.',
        'enthroned, SEEN FROM THE SIDE AND FACING RIGHT. Standing upright and '
        'braced, six mismatched legs planted and staggered in depth, both blades '
        'raised and held LEVEL like a proclamation — the near blade crossing in '
        'front of the thorax, the far one behind it. The crowned head is UP and '
        'turned to the RIGHT, looking out along the ground rather than down at '
        'prey; you see the side of the skull. The mantle of dead wing cases is '
        'swept back to the LEFT. The empty shell stands behind that. It is the '
        'TALLEST silhouette in the game and it is completely still. Nothing about '
        'this pose is mid-motion, and nothing about it is chest-on to the viewer.',
        'the cut. ONE blade has come down and across in a single diagonal, the '
        'other blade still raised and untouched, the crowned head STILL LEVEL AND '
        'STILL POINTED RIGHT — it does not turn or dip to look at what it is '
        'cutting. The legs have not moved at all and the mantle has not swung: '
        'six planted points and one arm. It attacks without shifting its weight, '
        'and that is what makes it look final.',
        [('skill1', '군체의 대염쇄',
          '체력 50% 이하가 되면 허물을 벗고 본체와 같은 능력치의 환영 분신을 '
          '하나 만든다 (분신은 체력 25% · 스킬 2를 같이 쓴다)',
          'THE SHEDDING — this is the moment it makes the copy. The body has '
          'ARCHED backwards and the thorax has SPLIT OPEN down the middle seam, '
          'the nine plates peeling apart to both sides, and out of that split the '
          'new body is emerging — draw it as a SECOND, PALER outline rising up and '
          'forward out of the old one, head and one blade already clear, still '
          'joined at the waist. Both bodies are in this cell. The old shell that '
          'was standing behind has TOPPLED and lies across the base. It is the '
          'only cell containing two of the creature.'),
         ('skill2', '군주 붕괴파',
          '아군 전체에 공격력의 180% 마법 피해 + 30% 확률로 3초 기절 — 코스트 6',
          'THE COLLAPSE WAVE — everyone at once. BOTH blades have been driven '
          'DOWN and INWARD to meet at a single point in front of the base, and the '
          'whole body has folded over that point — head down, thorax hunched, the '
          'six legs splayed out and skidding. From the meeting point, a broad flat '
          'RING of separate hard shards is thrown outward at ground level, '
          'strongest near the point and thinning outward, stopping well inside the '
          'cell. It is the LOWEST and WIDEST cell of the sheet: everything that '
          'was upright has come down.')],
        'struck. One blade is severed at the elbow and falling; three of the six '
        'mismatched legs have buckled and the tower has begun to lean. Four thorax '
        'plates are lifted off their neighbours and the absorbed parts — the comb '
        'hexagon, the eye-spot wing — are cracked through. The head is turned '
        'away and half the eyes are dulled.',
        """30스테이지 우두머리. **최종 보스입니다.**

## 앞의 아홉이 이 놈 안에 있어야 합니다

이 지역을 다 지나온 사람이 마지막에 봐야 하는 것은 "제일 센 벌레" 가 아니라
**여태 잡은 것들이 하나로 뭉친 것**입니다. 그래서 몸에 넷을 박아 둡니다 —
벌집 육각(22판) · 버섯 곤봉(29판) · 눈알 무늬 날개(24판) · 홈 파인 독니(21판).

**넷입니다. 다섯을 넣지 마세요.** 더 넣으면 잡동사니가 되고, 40px 에서는
그냥 지저분한 표면이 됩니다. 넷이 서로 떨어져 있고 각각 확실히 남의 모양이면
됩니다.

## 다리 여섯이 짝이 안 맞아야 합니다

한 쌍도 같으면 안 됩니다. 딱정벌레 갈고리 · 사마귀 낫 · 거미 관절 · 지네
갈고리 뭉치 — 아래를 보는 것만으로 "여러 마리로 만들어졌다" 가 읽혀야 합니다.

## 5번 칸에는 두 마리가 들어갑니다

허물을 벗으면서 분신이 나오는 칸입니다. 낡은 몸과 새 몸이 허리에서 아직
붙어 있고, 뒤에 서 있던 빈 허물은 그 순간 쓰러집니다. 시트에서 유일하게
같은 놈이 둘 있는 칸입니다.

분신은 별도 시트가 없습니다 — 게임이 같은 그림을 붉게 물들여 씁니다
(`Sprite` 의 `tint`).

## 마지막 칸(피격)이 이 게임의 마지막 그림입니다

쓰러지는 것이 아니라 **기울기 시작하는** 것으로 그리세요. 다 무너진 모습은
화면에 안 뜹니다 — 잡히면 그 자리에서 사라집니다.""",
        passive=('부식성 아우라',
                 '바알의 평타에 맞으면 이번 판이 끝날 때까지 방어력과 '
                 '마법저항력이 10% 씩 누적으로 깎인다 (최대 10중첩 · '
                 '정화로 풀 수 있다)'),
    ),
]

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
    ('bp_split', '절단 분열', 'b21 센티페다',
     'A BAR CUT IN TWO. One thick horizontal bar running the full width of the '
     'cell, a third of its height, SEVERED at the middle by a straight vertical '
     'gap as wide as the bar is tall — two separate solid blocks, left and right, '
     'the same size, with clean square ends facing each other. Nothing joins '
     'them. Squint test: two blocks with a gap.'),
    ('bp_shell', '경화 갑각', 'b23 누카누스',
     'A CLOSED DOME. One solid half-circle sitting on the bottom edge of the '
     'cell, flat side down, filling the full width — and across it, from the flat '
     'base up over the top, THREE straight vertical bars of black cutting it into '
     'four bands. The dome is unbroken at its outline; the bands are inside it. '
     'It is the only ROUND-TOPPED FLAT-BOTTOMED shape in the set. '
     'Squint test: a banded dome.'),
    ('bp_sting', '독침', 'b24 비블리스',
     'A DROP ON A POINT. One long straight NEEDLE running from the top-left '
     'corner down to the bottom-right, a fifth of the cell wide, tapering to a '
     'point at the lower end — and hanging just clear of that point, not '
     'touching, ONE fat round DROP a third of the cell wide. Two shapes, one '
     'long and thin, one small and round. Squint test: a needle and a bead.'),
    ('bp_hive', '군체의 지배자', 'b25 아라크네스',
     'A BIG ONE AND FOUR SMALL. One solid circle filling the middle two-thirds '
     'of the cell, and around it FOUR much smaller solid circles — one at each '
     'corner — each a quarter of its width, none touching it or each other. '
     'Perfectly plain circles, no rings, no dots inside. It is the only icon in '
     'the set made of separate round pieces. Squint test: one big dot, four '
     'small.'),
    ('bp_burst', '최후의 발악', 'b26 피로스',
     'A SHAPE FLYING APART. FOUR thick solid WEDGES, all pointing OUTWARD from '
     'the centre of the cell — up-left, up-right, down-left, down-right — each '
     'with its blunt end toward the middle and its point at a corner, and an '
     'EMPTY BLACK CROSS-SHAPED GAP between them where the centre should be. The '
     'middle of this icon is empty; the mass is at the corners. It is the only '
     'icon that is hollow in the middle. Squint test: four wedges, nothing in '
     'the middle.'),
    ('bp_spore', '포자 감염', 'b29 포르미카',
     'A CLUB ON A STALK. One straight vertical BAR rising from the bottom edge '
     'to two-thirds height, a fifth of the cell wide, topped by one much wider '
     'solid OVAL head that overhangs the bar on both sides and reaches the top '
     'edge. It is a nail seen head-on from the side: thin below, heavy above. '
     'It must not sprout a second stalk — one only. Squint test: a mushroom.'),
    ('bp_corrode', '부식성 아우라', 'b30 바알',
     'A SQUARE BEING EATEN. One solid square filling most of the cell, with its '
     'ENTIRE RIGHT EDGE eaten away into four deep square NOTCHES cut in from the '
     'right, like teeth taken out of it, each notch a fifth of the square deep. '
     'The left, top and bottom edges are perfectly straight and untouched. The '
     'asymmetry is the whole read — solid on one side, chewed on the other. '
     'Squint test: a square with a ragged right edge.'),
    ('bp_ward', '세계수의 껍질', 'b20 실바누스',
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

패시브를 가진 우두머리가 **%(n)d마리**입니다. 패시브는 껐다 켜지는 것이 아니라
싸우는 내내 걸려 있으므로, 화면 위쪽에 로고가 **계속** 떠 있어야 합니다.

이건 생물 그림이 아니라 **아이콘**입니다 — 쿼터뷰가 아니고, 12~16px 에서
읽혀야 하고, 규칙이 통째로 다릅니다.

## 열하나의 윤곽이 전부 겹치면 안 됩니다

12px 에서 안쪽은 없는 것과 같습니다. 그래서 **모양으로** 갈랐습니다 —

| 로고 | 우두머리 | 윤곽 |
|---|---|---|
%(rows)s

**장을 나눠 그리지만 겹침은 전체를 봅니다.** 한 장에 넷씩 그리는 것은 한 번에
열하나를 그리면 뒤로 갈수록 뭉개지기 때문이고, 안 겹쳐야 하는 것은 여전히
열하나 전부입니다 — 같은 화면에 같이 뜹니다.

%(sheets)s

---

## 슬라이서 설정

```json
%(config)s
```
"""


INDEX = """# 보스 이미지 프롬프트

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 `tools/gen-boss.py` 의 `BOSSES` 를 고치세요.

우두머리 **서른 마리**입니다. 잡몹 프롬프트는 따로 있습니다
([`FOE_ART_PROMPTS.md`](FOE_ART_PROMPTS.md)) — 그린 이유가 달라서 생성기를
갈랐습니다.

## 잡몹과 뭐가 다릅니까

**칸 수가 다릅니다.** 잡몹은 대기·공격·피격 셋이면 끝입니다. 우두머리는
기술을 가지고 있고 **기술마다 동작이 달라야** 하므로 칸이 더 필요합니다 —
기술이 하나면 **4칸** (대기 · 평타 · 스킬1 · 피격), 둘이면 **5칸** 입니다.

21판부터는 **형태 칸**이 더 붙습니다. 기술 칸은 "한 번 하고 원래대로 돌아오는
것" 이지만, 형태 칸은 **그 뒤로 계속 그 모습**입니다 — 반으로 갈린 지네, 고치를
쓴 딱정벌레, 우화를 마친 여왕. 그래서 6칸짜리도 있습니다.

형태 칸을 그릴 때 지킬 것: **바뀐 뒤에도 같은 놈으로 보여야 합니다.** 마디 수,
다리 수, 부러진 자리는 그대로 가고 자세와 껍질만 달라집니다.

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


def zone_of(stage):
    """그 판이 속한 지역.

    예전에는 `{True: ..., False: ...}` 한 줄이었다 (10판을 기준으로 둘). 지역이
    셋이 되면서 참·거짓으로는 못 가른다 — 넷째 지역이 생길 때 또 같은 일이
    나지 않게 아예 구간으로 적는다.
    """
    if stage <= 10:
        return '오염된 응집체들의 평원'
    if stage <= 20:
        return '타락한 군락의 정원'
    return '우화하는 군체들의 침식지'

FAMILY_RULE = {'slime': SLIME_BOSS, 'growth': GROWTH_BOSS, 'swarm': SWARM_BOSS}


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
    for sid, ko, _art in b.get('forms', []):
        out.append('**형태 · %s** (`%s` 칸) — 한순간의 동작이 아니라 **그 뒤로 '
                   '계속 그 모습**입니다. 자세가 아니라 몸이 바뀐 것으로 '
                   '그리세요.' % (ko, sid))
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
        'stage': b['stage'], 'zone': zone_of(b['stage']),
        'cells': cells, 'intro': b['intro'], 'does': does_of(b),
        'table': table_of(b['frames']), 'prompt': prompt,
        'labels': labels_of(b['frames']), 'fill': b['fill'],
    }


def passive_page():
    """
    로고가 열하나가 되면서 **장을 나눴다.**

    한 장에 넷씩이다. 한 번에 열하나를 그리라고 하면 뒤로 갈수록 뭉개지고,
    무엇보다 앞의 넷은 이미 들어와 있어서 다시 뽑을 이유가 없다. 새 일곱만
    두 장으로 그려 **덧붙인다** (`append`).

    윤곽이 안 겹쳐야 하는 것은 **장 안이 아니라 열하나 전체**다. 같은 화면에
    같이 뜨기 때문이다. 그래서 겹침 표는 장을 나누기 전과 똑같이 전부를 싣고,
    프롬프트에도 "이미 있는 것들과도 안 겹쳐야 한다" 를 적는다.
    """
    order = ['bp_thorn', 'bp_viscous', 'bp_rot', 'bp_ward',
             'bp_split', 'bp_shell', 'bp_sting', 'bp_hive',
             'bp_burst', 'bp_spore', 'bp_corrode']
    by_id = {i[0]: i for i in PASSIVE_ICONS}
    assert set(order) == set(by_id), '로고 목록과 장 순서가 어긋난다'

    rows = NL.join(
        '| `%s` | %s · %s | %s |'
        % (by_id[i][0], by_id[i][2], by_id[i][1],
           by_id[i][3].split('.')[0].strip())
        for i in order)

    sheets = [order[i:i + 4] for i in range(0, len(order), 4)]
    blocks = []
    cfg = []
    for n, ids in enumerate(sheets):
        cells = [(by_id[i][0], by_id[i][1], by_id[i][3]) for i in ids]
        prompt = block(
            NOTEXT,
            'SUBJECT: a single sheet of %d ICONS in one row, left to right. They '
            'are a matched set — same weight, same fill, same size within their '
            'cells.' % len(cells) + NL + NL
            + rows_of(cells, 'The %d cells, in this exact order:' % len(cells)),
            PIXEL_STYLE,
            ICON_STYLE,
            'THEY MUST NOT BE CONFUSABLE — and not only with each other. These '
            'join %d icons that already exist in the game and appear on the same '
            'screen. Squint at each finished icon and make sure its OUTLINE is '
            'not close to any of the others listed in the table above; the '
            'outline is the only thing that survives at 14 pixels.'
            % (len(order) - len(cells)),
            grid(len(cells), 1),
        )
        blocks.append(SHEET_TPL % {
            'tag': chr(ord('A') + n),
            'n': len(cells),
            'table': table_of(cells),
            'prompt': prompt,
            'done': '이미 들어와 있습니다 — 다시 뽑을 필요가 없습니다.' if n == 0
                    else '아직 안 들어왔습니다.',
        })
        cfg.append(
            '{ "file": "bp-%d.jpg", "name": "boss_passive", "expect": [%d, 1],%s'
            % (n + 1, len(cells), ' "append": true,' if n else '')
            + NL + '  "labels": [%s] }' % labels_of(cells))

    return PASSIVE_PAGE % {
        'n': len(order),
        'rows': rows,
        'sheets': ''.join(blocks),
        'config': (',' + NL).join(cfg),
    }


SHEET_TPL = """

---

## %(tag)s장 — %(n)d칸

%(done)s

### 셀 순서

%(table)s
### 프롬프트

%(prompt)s
"""


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

    from collections import Counter
    per = Counter(len(b['frames']) for b in BOSSES)
    print('우두머리 %d마리 (%s) · 패시브 로고 %d'
          % (len(BOSSES),
             ' · '.join('%d칸 %d' % (k, per[k]) for k in sorted(per)),
             len(PASSIVE_ICONS)))
