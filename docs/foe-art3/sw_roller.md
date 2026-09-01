# 구르는 쇠똥구리

← [색인으로](../FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.
고치려면 생성기의 `FOES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/sw_roller/` |
| 등장 | 근접 · 침식지 21~25 |
| 하는 일 | 제 몸만 한 공을 밀고 온다. 공이 먼저 닿는다. |

이 지역에서 **유일하게 물건을 들고 다니는** 놈입니다. 게임 전체를 봐도
없습니다.

## 공이 실루엣입니다

벌레는 작고 공이 큽니다. 45px 에서 남는 것은 **큰 원 + 뒤에 붙은 작은 쐐기**
이고, 그 조합은 이 게임에 하나뿐이라 그것만으로 알아봅니다.

공을 잡동사니 뭉치로 그리면 안 됩니다 — **단단한 윤곽의 둥근 덩어리**여야
하고, 박힌 것이 그 윤곽을 서너 군데만 깹니다.

## 3번 칸에서 공이 떨어져 나갑니다

맞으면 공이 굴러가 버리고, 그제야 이 놈이 얼마나 작은지가 보입니다. 세 칸
중 유일하게 벌레와 공이 떨어져 있는 칸입니다.

---

## 시트 한 장 (Gemini)

화면이 쓰는 칸은 **셋뿐**입니다 (`src/screens/home/BattleView.tsx`) —
평소에는 `idle`, 때릴 때 `attack`, 맞았을 때 `down`.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 대기 | 공격 | 피격 |
| id | `idle` | `attack` | `down` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation sheet of ONE single creature, left to right. The creature is in every cell.

THE CREATURE (the same one in all 3 cells):
A dung beetle that has been rolling the same ball since before this place was eaten.
BODY: a low armoured wedge, WIDER THAN TALL, head down and rear high — the whole animal is angled forward and down as if permanently pushing. It is the second smallest thing on the field; THE BALL IS THE BIG SHAPE.
THE BALL — this one only, and it is the silhouette: a solid ROUND mass in front of the beetle, AS TALL AS THE BEETLE IS LONG, packed and crusted, with three or four hard things half sunk into its surface at wrong angles (a rib, a shard of comb, a broken plate). It touches the ground and it touches the beetle's front legs. It is the only PERFECT ROUND SHAPE in the region and the only thing any creature in this game is carrying.
THE BREACH — this one: the growth has come through the shovel-plate of the head, splitting its notched front edge in two so the rake is broken in the middle.
THE REPLACED PART: the short horn is gone. What curves up off the head instead is a faceted shard, flat-sided and too straight, and it is longer than the horn ever was.
THAT IS THE READ: a big circle with a small wedge braced behind it. Nothing else in the game is a circle plus a body.
LEGS: three pairs. The FRONT pair is up on the ball, flattened and spread against it. The middle and back pairs are planted wide and driving, each bending up then down, each ending in a broad rake of four short spines. One back leg is a healed stump and it still pushes.
HEAD: a broad flat shovel-shaped plate, notched along its front edge like a rake, tucked down under the front of the body. Two small compound domes sit far apart on its corners.
HORN: one short blunt horn curving up off the head, chipped at the tip.
THE OLD SKIN: one split hollow plate hangs off the rear, dry and empty.

The 3 cells, in this exact order:

Cell 1 — braced against the ball, head down, front legs flat on it, back legs planted. Neither the beetle nor the ball is moving and the whole pose is load. The ball is the tallest thing in the cell.
Cell 2 — the shove. The back legs have driven straight and the body has dropped lower and longer, and THE BALL HAS ROLLED FORWARD a quarter turn — the hard things sunk in it have moved round with it, so you can tell it turned rather than slid. The gap between ball and beetle has closed to nothing. It attacks by putting the ball into you.
Cell 3 — struck. The ball has been knocked off its line and is rolling away, and for the first time the beetle is separated from it — front legs still reaching after it, body sprawled on its side, two legs folded wrong. Without the ball it looks small, which is the point.

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

WHAT THESE ARE.

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
survive the size.

IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party.

NOTHING MAY BE CUT OFF.
- The BALL fills about 42% of the cell height; the beetle itself about 30%. Together they are the widest mob of this chapter.
- Cell 2 is the longest. Size the sheet from it.
- The ball must stay a ROUND SOLID MASS with a hard outline — not a scribble of debris. What is stuck in it breaks the edge in three or four places and no more.
- Every cell holds the WHOLE creature plus every loose droplet and speed line. If any of it touches a magenta line, that cell has failed.
- Leave at least 8px of empty black between the outermost pixel and every magenta line.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 3 cells.
- EVERY CELL MUST BE SQUARE. With a 3x1 grid that means the whole sheet is
  3:1 — output it at 1536x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "sw_roller", "expect": [3, 1],
  "labels": ["idle", "attack", "down"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `assets/sprites/sw_roller/` 가
생기는 순간 화면이 그걸 씁니다 — 없는 동안은 `creature/slime` 으로 떨어지므로
코드는 안 고쳐도 됩니다.

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
The creature is drawn too small inside its cell. Redraw it filling about 80% of
the cell height, centred, with the empty space distributed around it rather than
below it.
```
