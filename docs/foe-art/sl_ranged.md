# 뱉는 슬라임

← [색인으로](../FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.
고치려면 생성기의 `FOES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/sl_ranged/` |
| 등장 | 원거리 · 1스테이지 |
| 하는 일 | 뒤에 서서 산을 뱉는다. 안 걸어오는 대신 무르고 아프다. |

뒤에 서서 던지는 놈입니다. 안 걸어오는 대신 체력이 낮고 더 아프게 때립니다
(`core/autoBattle` 의 `FOE_MATES`).

**세로로 길어야 합니다.** 주력 슬라임이 넓적하고 낮으므로, 둘을 가르는 것은
오직 그 비율입니다. 한 화면에 넷이 겹쳐 서는데 색도 무늬도 안 남습니다 —
서 있는 기둥과 퍼진 덩어리, 그 차이만 남습니다.

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
A slime grown into a spout — the same rotten material as the common one, pulled upright by whatever is inside it.
BODY: TALL AND NARROW, a standing column that swells at the base and narrows toward an open vent at the top. Nearly twice as tall as it is wide. The column is not straight — it leans and bulges, and the surface is streaked where acid has run down it and eaten in.
VENT: the top opening is a ragged hole, its rim uneven and slightly flared, with residue crusted around it. It is the mouth and it never closes. FOUR LONG TEETH ring the rim, curving INWARD over the opening like a trap — thin, uneven, one broken. Everything it throws has to pass between them.
EYE: ONE. A single large eye with a slit pupil, set high on the column just below the vent and turned to the side, so it seems to be sighting rather than watching.
INSIDE: one dark mass low in the belly — the next shot, being made.
SILHOUETTE (protect this above all): a tall leaning column with a wide base and a torn-open top. It is the TALLEST and THINNEST thing on the field, and that is the whole difference from the common slime.

The 3 cells, in this exact order:

Cell 1 — standing at rest, the column upright and still, the vent angled up and slightly to the right. The dark shot sits low in the belly. A thread of residue drips from the vent rim.
  It does not lean forward like the common slime — it holds its ground, and the single eye tracks sideways. That stillness is how the player learns it will not walk over.
Cell 2 — the spit. The base has compressed and the column has kinked back, whipping the vent forward and to the right. The rim is flared wide.
  A gobbet of acid is LEAVING the vent — an uneven blob with a ragged trailing tail, clear of the body with black between them, two short speed lines behind it. It stops well inside the cell.
  The eye is wide, the slit pupil blown open.
Cell 3 — struck. The column has buckled — the upper third folds over to the left while the base stays planted, so the whole thing reads as a broken stalk. The vent points down and away, spilling what it was holding.
  The eye is squeezed to a crease and the surface has split along the bend.

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

WHAT A SLIME IS.

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

The player should read it as something that dissolves what it catches.

IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party.

NOTHING MAY BE CUT OFF.
- Cell 1 is the TALLEST and cell 3 is the most bent. Size the whole sheet from cell 1 so the upright column fits with room above it.
- The flying blob in cell 2 must END INSIDE the cell. It is a short lob, not a beam across the frame.
- It fills about 65% of the cell height — noticeably taller than the common slime, which fills 45%.
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
{ "file": "<파일명>", "name": "sl_ranged", "expect": [3, 1],
  "labels": ["idle", "attack", "down"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `assets/sprites/sl_ranged/` 가
생기는 순간 화면이 그걸 씁니다 — 없는 동안은 `creature/slime` 으로 떨어지므로
코드는 안 고쳐도 됩니다.

---

## 투사체 — 산 덩어리 (Gemini)

**뒷줄이 실제로 날리는 것입니다.** 모션만 있고 아무것도 안 날아가면
뒤에서 혼자 꿈틀거리는 것으로 보입니다.

시트가 들어오기 전까지는 `fx/smoke` 로 버팁니다 — `assets/sprites/sl_ranged_shot/`
가 생기는 순간 코드를 안 고치고 바뀝니다.

게임은 **1번 칸만 씁니다.** 26px 로 줄여도 홀로 "날아오는 덩어리" 로 읽혀야
하므로, 앞쪽을 굵게 뒤쪽을 가늘게 그리세요.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 날아감 | 2 늘어남 | 3 흩어짐 |
| id | `shot_1` | `shot_2` | `shot_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: 3 cells. ONE blob of acid in flight, animating over 3 frames, left to right. There is NO creature, NO ground — only the blob.

It was spat from the vent of a standing slime and is crossing the field toward its target. It travels to the RIGHT; the game mirrors it in code, because this one flies at the player from the right side of the screen.

This sheet carries every shot the spitter fires, so it has to read as a thrown blob at 26 pixels wide, alone, with nothing around it.

The 3 cells, in this exact order:

Cell 1 — the blob at full speed. An uneven lump — fatter at the leading (right) end and drawn out into a ragged tail at the back, like a drop of syrup thrown hard. NOT a circle and NOT symmetrical.
  Two short straight speed lines trail behind it, thinner than the blob and clearly separate. Two or three small droplets have shaken loose behind the tail. Solid and bright.
Cell 2 — the same blob a moment later, stretched further along its travel direction so the tail is longer and thinner and has begun to break away from the head. The leading end is still fat and solid.
Cell 3 — the blob breaking up. The head has thinned and split into two or three separate specks strung along the path, the tail gone. Most of the cell is empty.

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

EFFECT SHEET RULES — this is one thing crossing the screen.
- The 3 frames must READ AS ONE THING travelling and dying. Frame 1 is solid and bright, frame 3 is mostly gone.
- It flies point-first: **WIDER THAN IT IS TALL**, with the heavy end leading. A round ball reads as a bubble, not a thrown thing.
- No outline flourishes. At 26 pixels this is a lump and a tail; anything finer than that is gone.
- Keep it clearly ACIDIC — ragged edge, a couple of drips coming off it. It should not look like a rock or a fireball.
- It is centred in its cell and stays inside it. The game moves it across the screen; do not draw it partly off the edge.

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

```json
{ "file": "<투사체 파일명>", "name": "sl_ranged_shot", "expect": [3, 1],
  "labels": ["shot_1", "shot_2", "shot_3"] }
```

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
The creature is drawn too small inside its cell. Redraw it filling about 65% of
the cell height, centred, with the empty space distributed around it rather than
below it.
```
