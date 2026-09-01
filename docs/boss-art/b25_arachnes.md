# 우화의 모체, 여왕 아라크네스, 아라크네스

← [색인으로](../BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 생성기의 `BOSSES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/b25_arachnes/` |
| 등장 | 25스테이지 · 우화하는 군체들의 침식지 |
| 칸 수 | 6칸 |

25스테이지 우두머리. **이 지역의 중간 관문**이고, 지금까지 나온 것 중
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
사이에 **매달려** 있어야 하고, 그래야 40px 에서도 지네·딱정벌레와 안 겹칩니다.

## 이 우두머리가 하는 것

그림의 자세는 전부 여기서 나옵니다. **무엇을 하는 기술인지가 어떤 모양이어야
하는지를 정합니다** — 전원을 치는 기술은 넓거나 높고, 한 명을 크게 치는 기술은
길고 좁습니다.

**패시브 · 군체의 지배자** — 3초마다 아군 전체의 스킬 코스트를 한 칸씩 깎는다 (우화하면 꺼진다)
(싸우는 내내 화면 위쪽에 로고가 떠 있습니다 → [`BOSS_PASSIVE_PROMPTS.md`](../BOSS_PASSIVE_PROMPTS.md))

**평타** — 한 명에게 보통 피해. 시트에서 제일 자주 보이는 칸이라 제일 절제되어야 합니다.

**스킬 1 · 포식의 거미줄** (`skill1` 칸) — 공격력이 가장 높은 아군 1명을 5초간 고치로 묶어 행동 불능으로 만들고 매초 그 대상의 체력 10% 를 흡수 — 코스트 6

**형태 · 우화한 성체 · 대기** (`imago` 칸) — 한순간의 동작이 아니라 **그 뒤로 계속 그 모습**입니다. 자세가 아니라 몸이 바뀐 것으로 그리세요.

**형태 · 우화한 성체 · 포식의 거미줄** (`imago_skill` 칸) — 한순간의 동작이 아니라 **그 뒤로 계속 그 모습**입니다. 자세가 아니라 몸이 바뀐 것으로 그리세요.

---

## 시트 한 장 (Gemini)

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| | 대기 | 평타 | 포식의 거미줄 | 우화한 성체 · 대기 | 우화한 성체 · 포식의 거미줄 | 피격 |
| id | `idle` | `attack` | `skill1` | `imago` | `imago_skill` | `down` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 6-frame animation sheet of ONE single creature, left to right. The creature is in every cell.

THE CREATURE (the same one in all 6 cells):
The one that lays the others. She has not finished growing and she is already the largest thing in the region.
BODY: TWO masses joined at a narrow waist — a compact armoured cephalothorax in front, and behind it an ENORMOUS swollen abdomen, twice its size, hanging low and heavy. The abdomen is not armoured: it is soft, stretched, and banded with strain lines. That contrast is the animal.
THE INFESTATION — this one: the growth has come out through the WAIST, the narrow join between her two masses, packing it like a collar so the front half and the abdomen are held together by the thing in her rather than by her. It is visible from every angle and it is the reason her moult never finished.
THE REPLACED PART: three of the EIGHT EYES are gone. In their sockets sit blind faceted lumps, flat-sided, all three on the same side of the bank — half her face still watches and half of it cannot.
LEGS: FOUR pairs, long, each folding up above the body before coming down — so the knees stand HIGHER THAN THE BACK and the body hangs slung between them. Two legs are shorter than the rest and one ends in a stump. The span of the legs is twice the span of the body.
THE UNFINISHED MOULT — this one only: her whole front half is still half inside the old skin. A split, dry, hollow SHELL is peeled back off the cephalothorax and hangs down behind the head like a torn hood, still attached at the waist. Through the split you can see the new plates underneath, paler and unhardened. She has been interrupted mid-emergence and she stayed like that.
HEAD: a bank of EIGHT eyes in two uneven rows, three of them clouded over. Two hard fangs fold down and inward, each with a groove.
THE SPINNERETS at the tip of the abdomen are four short nozzles, and three thick strands of web already hang from them into empty black.
ON HER BACK, clinging to the abdomen: SIX small young, each a simple round body with four legs, at different sizes, none of them symmetrical with the others.

The 6 cells, in this exact order:

Cell 1 — slung between her legs, abdomen nearly touching the ground, fangs folded, the torn moult hood hanging behind her head. The young cling still. The web strands hang straight down. She is the LARGEST silhouette in the game and she is not doing anything with it yet.
Cell 2 — the bite. The front half has driven forward and down between the front legs, fangs swung out, while the abdomen stays exactly where it was — the waist stretches. Only two of the eight legs have moved. Almost all of her stays put, and that is what makes her look heavy.
Cell 3 — THE FEEDING WEB — she throws and then pulls. The abdomen has swung UP and FORWARD over the cephalothorax, tip pointed at the viewer, and from the four spinnerets a thick BUNDLE of strands has been fired forward and out of the cell edge — draw the bundle leaving as a broad fan of six or seven heavy lines converging to one point beyond the body, stopping short of the magenta line. Her front legs are drawn back and braced to HAUL. This is the only cell where the abdomen is higher than the head.
Cell 4 — THE IMAGO — she has finished. This is a STATE and everything after this cell uses it. The old shell is GONE: no hood, no split, no dry skin anywhere. The cephalothorax is now fully hardened and visibly LARGER than in the idle cell, with three new ridges across it that were not there before. The legs are longer and held higher, the body slung further off the ground. THE SIX YOUNG ARE GONE from her back — that surface is bare and smooth. All eight eyes are clear. Same animal, same broken leg, same eight-eye arrangement, but nothing about her is unfinished any more.
Cell 5 — THE FEEDING WEB, AFTER THE MOULT. The same pose as the skill cell — abdomen swung up and forward, strand bundle fired out, front legs braced to haul — but drawn on the imago body: no hood, no young, bigger front half, longer legs. The strand bundle is THICKER here, nine or ten lines instead of six.
Cell 6 — struck. Three legs have collapsed and the abdomen has dropped hard, splitting one strain band open. The moult hood has torn most of the way off and hangs by a thread. Two of the six young have been thrown clear and are falling. The head is turned away.

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
- In the idle cell it fills about 80% of the cell along its LONGER dimension — the height if it is taller than wide, the WIDTH if it is wider than tall. The other dimension follows from its proportions. It is the only creature on the field and it must read as such.
- Size the sheet from the LARGEST cell, not from idle. The skill cells break out of the body and they must still fit.
- THE GAME DRAWS EACH SPRITE INSIDE A SQUARE BOX and shrinks it to fit. A creature drawn three times wider than it is tall therefore arrives on screen SMALL — the width is what got scaled down, and the height is left empty. Aim for a shape that sits comfortably in a square: at most about half again as wide as it is tall, in every cell.
- THE WIDEST CELL SPANS AT MOST 90% OF THE CELL WIDTH, and the tallest at most 90% of its height. Where a cell says a pose is "three times its idle width" or "twice the height of the idle cell", that is an instruction about the IDLE pose too: draw idle small enough that the big pose still fits. Never solve it by letting the big pose overflow.
- IF IT IS MEANT TO BE VERY LONG, show that by COILING, DOUBLING BACK or STACKING it — never by running it off the edge. Length that leaves the cell does not read as length; it reads as a drawing that got cut, and the slicer cannot find the cell boundary afterwards.
- Every cell holds the WHOLE creature plus every loose piece. If any of it touches a magenta line, that cell has failed.
- Leave at least 8px of empty black between the outermost pixel and every magenta line.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 6 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 6 cells.
- EVERY CELL MUST BE SQUARE. With a 6x1 grid that means the whole sheet is
  6:1 — output it at 3072x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "b25_arachnes", "expect": [6, 1], "floor": true,
  "labels": ["idle", "attack", "skill1", "imago", "imago_skill", "down"] }
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
All 6 cells are the SAME creature — same outline, same size, same eyes,
same markings, same swallowed objects in the same places. Only the pose changes
between them. Redraw them as one animation, not as 6 separate drawings.
```

**너무 작게 그려 나왔을 때**

```
The creature is drawn too small inside its cell. Redraw it filling about 80%
of the cell height, centred, with the empty space distributed around it rather than
below it.
```
