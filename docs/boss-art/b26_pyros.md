# 거대한 발광충, 피로스, 피로스

← [색인으로](../BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 생성기의 `BOSSES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/b26_pyros/` |
| 등장 | 26스테이지 · 우화하는 군체들의 침식지 |
| 칸 수 | 5칸 |

26스테이지 우두머리.

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

폭탄 애벌레는 따로 그립니다 → [`FOE_ART_PROMPTS.md`](../FOE_ART_PROMPTS.md)

## 이 우두머리가 하는 것

그림의 자세는 전부 여기서 나옵니다. **무엇을 하는 기술인지가 어떤 모양이어야
하는지를 정합니다** — 전원을 치는 기술은 넓거나 높고, 한 명을 크게 치는 기술은
길고 좁습니다.

**패시브 · 최후의 발악** — 체력이 0 이 되면 죽지 않고 폭탄 애벌레 4마리로 분열한다. 5초 뒤 자폭해 아군 전체에 각자 최대 체력의 25% 피해
(싸우는 내내 화면 위쪽에 로고가 떠 있습니다 → [`BOSS_PASSIVE_PROMPTS.md`](../BOSS_PASSIVE_PROMPTS.md))

**평타** — 한 명에게 보통 피해. 시트에서 제일 자주 보이는 칸이라 제일 절제되어야 합니다.

**스킬 1 · 인화성 분무** (`skill1` 칸) — 아군 전체에 5초간 화상 — 받는 피해 30% 증가 — 코스트 5

**스킬 2 · 날카로운 찌르기** (`skill2` 칸) — 아군 전체에 공격력의 70% 물리 피해 — 코스트 2

---

## 시트 한 장 (Gemini)

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 대기 | 평타 | 인화성 분무 | 날카로운 찌르기 | 피격 |
| id | `idle` | `attack` | `skill1` | `skill2` | `down` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 5-frame animation sheet of ONE single creature, left to right. The creature is in every cell.

THE CREATURE (the same one in all 5 cells):
A firefly that swallowed its own light and has been swelling ever since.
BODY: a long soft segmented GRUB, TALLER THAN WIDE, held upright and curved back like a comma — heavy round tail end at the bottom, narrow head reaching forward at the top. NINE segments, each a fat ring, each ring divided from the next by a deep pinch.
THE LIGHT ORGANS — this one only: the last THREE segments before the tail are not soft. They are hard, translucent CHAMBERS, drawn as thick rings with hollow black centres, and each one is packed with a coarse grid of small cells like a honeycomb seen edge-on. They are the only hollow shapes on the whole animal, and they are what is about to go off.
THE SKIN IS TOO TIGHT. Between every pair of segments the surface has SPLIT into a short crack, four of them, and something pale is showing through. It is over-full.
THE INFESTATION — this one: the growth is INSIDE the three light chambers. Their hollow rings are packed with faceted lumps instead of the honeycomb grid, pressing against the walls from within so the chambers bulge out of round. That is what makes it over-full, and that is what goes off.
THE REPLACED PART: the last tail segment is not a segment. It is one solid faceted block in roughly the shape of a ring, with no pinch between it and the one before — the body ends in something that did not grow there.
LEGS: six short pairs down the front half, stubby and hooked, plus four fleshy prolegs at the back that grip. All small — it barely walks.
HEAD: tiny, a hard capsule with two mouth plates opening sideways and a pair of very short blunt horns. Eyes are four dull dots, almost lost.
DRIPS: two heavy drops hang off the underside of the tail and stop in empty black.

The 5 cells, in this exact order:

Cell 1 — upright and curled back, tail heavy on the ground, head lowered and forward, the three light chambers plainly visible at the base. The four skin splits are closed to slits. It looks swollen and slow.
Cell 2 — the lunge. The curve has straightened — the whole body has whipped FORWARD and DOWN so head and tail are almost in a line, head plates spread. It is the LONGEST cell of the sheet. The tail has come off the ground and the prolegs are trailing.
Cell 3 — THE SPRAY — it goes to EVERYONE, so it goes UP AND OUT, not forward. The body has REARED into a tall column, tail planted, head thrown back and up, and the four skin splits have GAPED OPEN into wide gashes along the whole length. Out of every gash, a fan of separate small solid flakes is thrown sideways and up — six to eight per gash, biggest near the body, thinning outward, stopping well inside the cell. It is the TALLEST cell and the only one throwing anything.
Cell 4 — THE JAB — cheap, quick, and it must NOT look like the spray. The body has folded into a tight compressed S and the HEAD has shot straight forward on a stretched neck, the two mouth plates locked together into a single hard point. Everything else is pulled BACK and small. It is the NARROWEST cell of the sheet, and nothing leaves the body — no flakes, no drips, no light. One point, going one way.
Cell 5 — struck. Two of the three light chambers are cracked across and their grid is broken, the body has slumped sideways off its curve, and two skin splits have torn wide open along their whole length. The head hangs down loose. It is still swollen — that is what makes the next thing worse.

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

WHAT THIS IS: AN INSECT THAT GREW PAST THE SIZE AN INSECT CAN BE.

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

The black inside the breach is part of the shape. Do not fill it in.

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

IT IS ALWAYS DOING SOMETHING, EVEN STANDING STILL.

This creature has a passive ability that never turns off, and the game shows a
small logo at the top of the screen for the whole fight to say so. The sprite has
to agree with that logo: the thing the passive does must be VISIBLE IN EVERY
CELL, including idle and including down.

It is named in the description above. Draw it as a permanent structural feature,
not as an effect — an effect drawn into the sprite becomes a white smear that
never goes away.

IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party.

NOTHING MAY BE CUT OFF, AND NOTHING MAY LEAVE ITS CELL.
- In the idle cell it fills about 66% of the cell along its LONGER dimension — the height if it is taller than wide, the WIDTH if it is wider than tall. The other dimension follows from its proportions. It is the only creature on the field and it must read as such.
- Size the sheet from the LARGEST cell, not from idle. The skill cells break out of the body and they must still fit.
- THE GAME DRAWS EACH SPRITE INSIDE A SQUARE BOX and shrinks it to fit. A creature drawn three times wider than it is tall therefore arrives on screen SMALL — the width is what got scaled down, and the height is left empty. Aim for a shape that sits comfortably in a square: at most about half again as wide as it is tall, in every cell.
- THE WIDEST CELL SPANS AT MOST 90% OF THE CELL WIDTH, and the tallest at most 90% of its height. Where a cell says a pose is "three times its idle width" or "twice the height of the idle cell", that is an instruction about the IDLE pose too: draw idle small enough that the big pose still fits. Never solve it by letting the big pose overflow.
- IF IT IS MEANT TO BE VERY LONG, show that by COILING, DOUBLING BACK or STACKING it — never by running it off the edge. Length that leaves the cell does not read as length; it reads as a drawing that got cut, and the slicer cannot find the cell boundary afterwards.
- Every cell holds the WHOLE creature plus every loose piece. If any of it touches a magenta line, that cell has failed.
- Leave at least 8px of empty black between the outermost pixel and every magenta line.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 5 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 5 cells.
- EVERY CELL MUST BE SQUARE. With a 5x1 grid that means the whole sheet is
  5:1 — output it at 2560x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "b26_pyros", "expect": [5, 1], "floor": true,
  "labels": ["idle", "attack", "skill1", "skill2", "down"] }
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
All 5 cells are the SAME creature — same outline, same size, same eyes,
same markings, same swallowed objects in the same places. Only the pose changes
between them. Redraw them as one animation, not as 5 separate drawings.
```

**너무 작게 그려 나왔을 때**

```
The creature is drawn too small inside its cell. Redraw it filling about 66%
of the cell height, centred, with the empty space distributed around it rather than
below it.
```
