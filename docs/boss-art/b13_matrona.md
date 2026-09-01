# 대지를 조여오는 덩굴 모체, 마트로나

← [색인으로](../BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 생성기의 `BOSSES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/b13_matrona/` |
| 등장 | 13스테이지 · 타락한 군락의 정원 |
| 칸 수 | 4칸 |

13스테이지 우두머리. **길이로 크지만, 칸을 안 벗어납니다.**

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
곧 읽는 것입니다. 나머지 덩굴 넷은 낮게 빼서 둘이 묻히지 않게 합니다.

## 이 우두머리가 하는 것

그림의 자세는 전부 여기서 나옵니다. **무엇을 하는 기술인지가 어떤 모양이어야
하는지를 정합니다** — 전원을 치는 기술은 넓거나 높고, 한 명을 크게 치는 기술은
길고 좁습니다.

**평타** — 한 명에게 보통 피해. 시트에서 제일 자주 보이는 칸이라 제일 절제되어야 합니다.

**스킬 1 · 속박의 덩굴 휘감기** (`skill1` 칸) — 무작위 2명에게 공격력의 140%만큼 물리 피해, 2초간 기절 (평타 5대마다)

---

## 시트 한 장 (Gemini)

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 대기 | 평타 | 속박의 덩굴 휘감기 | 피격 |
| id | `idle` | `attack` | `skill1` | `down` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 4-frame animation sheet of ONE single creature, left to right. The creature is in every cell.

THE CREATURE (the same one in all 4 cells):
The mother root that every vine in this garden is a branch of.
IT IS A PLANT. NOT A ROPE, NOT A SNAKE, NOT A CABLE. That is the single easiest thing to get wrong here, because the body is long and coiled, and a long coiled thing with a smooth even surface is a rope no matter what else the description says. Everything in the next three paragraphs exists to stop that.
BODY: ONE ENORMOUS WOODY STEM, COILED. It is far longer than the cell is wide and it shows that by DOUBLING BACK ON ITSELF — four heavy overlapping coils, each as thick as a mob is tall, stacked and crossing over one another and piling up in the lower two-thirds of the cell. The pile is slightly wider than it is tall, not three times wider.
THE STEM IS NOT AN EVEN TUBE. It SWELLS AT NODES — a hard knuckled thickening every stem-width or so along its whole length, half again as thick as the stem between them, so the outline of every coil is lumpy and jointed rather than smooth. A rope is the same width from end to end; this is not, and that is the difference you see first. Deep grooves run LENGTHWISE along the stem between the nodes (a rope's twist runs diagonally — these do not).
LEAVES — the strongest thing that says plant, so do not leave them out. FIVE big heavy leaves grow off the coils at different points, each as long as the stem is thick, on short stiff stalks, angled every which way. They BREAK THE OUTLINE of the pile so the silhouette is not a smooth coil but a coil with leaves sticking out of it. Two are torn, one is curled shut, one is a hard grey dead one still hanging on.
FROM THE NODES sprout EIGHT young SIDE-SHOOTS, thin new growth a quarter the thickness of the main stem, going in eight different directions with two small leaves each. They are what a cut vine puts out, and nothing else in this creature is thin.
NEITHER END IS VISIBLE. Both ends run UNDER the coils of its own body and do not come out again, so there is no terminus anywhere in the drawing. That is the point — a mob vine is a stem you can see all of, and this one is not.
LENGTH IS SHOWN BY COILING, NEVER BY LEAVING THE CELL. The stem must not touch or cross the edge of its cell at any point. Growth that runs off the edge does not read as long; it reads as a drawing that got cut.
THE TOPMOST COIL swells into a thick knotted MASS off to one side, rising clear above the pile. That swelling is the part that is awake, and it is the highest point of the body.
FROM THE SWELLING rise SIX TENDRILS, far thicker and longer than a mob has, curling up and forward at different heights. Two are as tall as the swelling is wide. EVERY TENDRIL ENDS IN A TIGHT SPIRAL COIL, wound two or three turns like a spring — that spiral is a thing only a plant does, and it is the second-strongest plant signal on the sheet after the leaves.
THE OPENING is a long split down the TOP of the swelling, held apart, lined with SEVEN inward spines. It runs lengthwise, not across.
EYES: FOUR, in a row along the swelling at different heights, one large and three small, all looking along the length of the body rather than out at you.
CAUGHT IN THE COILS, spaced far apart on different loops: a SKULL on the lowest coil, a RIBCAGE in the swelling, a BOOT still laced on a middle coil. The stem has GROWN AROUND each of them — swollen lips of wood closed over the edges, new side-shoots coming out right beside them — so they were caught years ago and grown over, not tied on. They mark how much stem there is.
THE ACCIDENT — this one only: on the front-most coil the stem is SEVERED CLEAN and has grown back across the gap in a knotted burl twice the thickness of the stem, with a spray of six young shoots bursting out of the join — the way a cut vine answers being cut. One loop of the pile has that swollen scarred joint and none of the others do. Someone cut it and it did not stop.

The 4 cells, in this exact order:

Cell 1 — coiled and still, the four loops settled and overlapping, leaves hanging off the pile at their own angles, the six tendrils raised off the swelling with their spirals loose, the split along the swelling half open. It reads as undergrowth that has not noticed you yet.
Cell 2 — the whip. TWO tendrils have lashed forward together, stretched thin and long out ahead of the swelling with their end spirals pulled almost straight, and the topmost coil has been dragged after them so the pile is pulled off centre. Three leaves have been torn back flat against the stem by the movement. The coils stay stacked and the whole body stays inside the cell.
Cell 3 — THE SNARE — it takes EXACTLY TWO characters and holds them, so the cell must show TWO of something, clearly countable. Two of the six tendrils have shot out and UP, far higher and further than anything else on the sheet, and each has curled its tip into a CLOSED LOOP — two separate nooses, hanging at different heights on opposite sides of the cell, both drawn tight and empty, both well inside the edges. The other four tendrils are pulled back and low, out of the way, so nothing competes with the two. The coiled pile beneath has drawn in TIGHTER and taller to brace for the pull, so the body is narrower here than in the idle cell, and every leaf on it has been pulled up and back like hair in wind. It is the TALLEST cell, and the two nooses are the only closed shapes on the whole sheet — the player counts them without meaning to.
Cell 4 — struck. The swelling has split open along the top and three tendrils are torn off, their spirals gone. The coils have LOOSENED and slumped apart, the pile collapsing to about half its height, and for the first time you can see between the loops. Leaves are stripped and falling, two of them clear of the body. The ribcage shows through the gash and the boot has come loose.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.
- No borders or frames around the whole image.

CAMERA — SLIGHT HIGH-ANGLE SIDE VIEW (three-quarter). This is not a flat side view.

- The camera sits a little ABOVE the character and slightly to the side, looking down
  at roughly 15-20 degrees. You can see a little of the top of the shoulders and the
  upper surface of the boots.
- The body is turned about 20 degrees toward the viewer from pure profile — the far
  shoulder is visible behind the near one, and you can see both eyes on the face.
- The FEET sit slightly forward and lower than the torso, as if standing on a floor
  plane that recedes upward into the background. This is the single most important
  part: the game draws a receding floor under this sprite, and a flat side-on figure
  will look like it is standing in a different world from the ground.
- Facing RIGHT. Every frame faces right. The game mirrors sprites in code where it
  needs them facing the other way — never draw a left-facing frame.

NEVER DRAW THE GROUND.

The game draws its own floor under these sprites (a receding quarter-view plane) and
composites the artwork on top of it. Anything floor-like inside a cell lands on the
screen as a white slab sitting in mid-air.

So there is NO ground line, NO horizon, NO floor plane, NO paving, NO grass, NO dirt,
NO rubble, NO cracks, NO drop shadow, and NO dust lying on a surface. Not even a thin
line under the feet.

THE GROUND IS IMPLIED BY THE POSE, NOT DRAWN. Where a description says a weapon is
"planted in the ground", or a knee is "on the floor", or something "bursts out of the
ground", it means: draw the figure and the effect at that height, standing on nothing.
The bottom of the boots, the point of the blade, the base of the burst — they simply
stop, with pure black beneath them.

Contact is sold by the POSE (a bent knee, a braced arm, a low burst opening upward),
never by drawing what is being touched.

IT STANDS. IT NEVER LIES DOWN.

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
small.

SILHOUETTE — this is the whole job.

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
  outline, not in fill.

IT IS A MONSTER. IT IS NOT A MASCOT.

BANNED, all of it:
- Big round sparkly eyes with white catchlights. No cartoon shine dots.
- Any smile, any open happy mouth, any blush, any raised cheeks.
- Symmetrical, tidy, egg-smooth outlines. Nothing that looks moulded.
- Chibi proportions — a huge head on a small body, a face filling half the shape.
- Anything you would put on a sticker.
- Anything that would pass unremarked in a field guide to real animals. If a
  naturalist could label it and move on, it is not a monster yet.

WHAT THIS IS: SOMETHING THAT GREW, AND KEPT GROWING AFTER IT SHOULD HAVE STOPPED.

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
  comes out of the dead part. That contrast is what says it is old.

IT IS A BOSS. IT MUST READ AS ONE BEFORE THE HEALTH BAR DOES.

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
encouraged, even. The test is whether it looks worn or looks eaten.)

THIS ONE HAS A NAME. IT IS AN INDIVIDUAL, NOT A SPECIES.

Every other enemy in this game is one of many — there are eight of that slime
standing in a row. This one is the only one there has ever been, and the player
is told its name when it arrives.

So it must not look like a well-drawn example of its kind. Something about it has
to be an ACCIDENT that happened to this one creature and could not repeat: a
specific thing lodged in it at a specific angle, a specific break healed a
specific wrong way, a growth that went in a direction the others do not go. That
accident is named in the description above. It is the most important shape on the
sheet after the overall silhouette, and it is present and identical in EVERY cell
— it does not appear only when convenient.

EVERY CELL IS A DIFFERENT MOTION. THIS IS THE WHOLE POINT OF THIS SHEET.

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
which is which, redraw. Changing a detail is not enough; change the outline.

DRAWING A SKILL CELL.

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
screen as a white smear that never goes away.

IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party.

NOTHING MAY BE CUT OFF, AND NOTHING MAY LEAVE ITS CELL.
- In the idle cell it fills about 72% of the cell along its LONGER dimension — the height if it is taller than wide, the WIDTH if it is wider than tall. The other dimension follows from its proportions. It is the only creature on the field and it must read as such.
- Size the sheet from the LARGEST cell, not from idle. The skill cells break out of the body and they must still fit.
- THE GAME DRAWS EACH SPRITE INSIDE A SQUARE BOX and shrinks it to fit. A creature drawn three times wider than it is tall therefore arrives on screen SMALL — the width is what got scaled down, and the height is left empty. Aim for a shape that sits comfortably in a square: at most about half again as wide as it is tall, in every cell.
- THE WIDEST CELL SPANS AT MOST 90% OF THE CELL WIDTH, and the tallest at most 90% of its height. Where a cell says a pose is "three times its idle width" or "twice the height of the idle cell", that is an instruction about the IDLE pose too: draw idle small enough that the big pose still fits. Never solve it by letting the big pose overflow.
- IF IT IS MEANT TO BE VERY LONG, show that by COILING, DOUBLING BACK or STACKING it — never by running it off the edge. Length that leaves the cell does not read as length; it reads as a drawing that got cut, and the slicer cannot find the cell boundary afterwards.
- Every cell holds the WHOLE creature plus every loose piece. If any of it touches a magenta line, that cell has failed.
- Leave at least 8px of empty black between the outermost pixel and every magenta line.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL MUST BE SQUARE. With a 4x1 grid that means the whole sheet is
  4:1 — output it at 2048x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "b13_matrona", "expect": [4, 1], "floor": true,
  "labels": ["idle", "attack", "skill1", "down"] }
```

받으면 `python tools/slice.py` 를 돌리세요.

---

## 다시 뽑을 때

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
All 4 cells are the SAME creature — same outline, same size, same eyes,
same markings, same swallowed objects in the same places. Only the pose changes
between them. Redraw them as one animation, not as 4 separate drawings.
```

**너무 작게 그려 나왔을 때**

```
The creature is drawn too small inside its cell. Redraw it filling about 72%
of the cell height, centred, with the empty space distributed around it rather than
below it.
```
