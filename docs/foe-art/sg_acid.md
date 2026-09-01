# 산성 슬라임

← [색인으로](../FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.
고치려면 생성기의 `FOES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/sg_acid/` |
| 등장 | 원거리 · 초원 7~10 |
| 하는 일 | 산을 뱉는다. 무르고 아프다. |

7~10 스테이지의 원거리입니다. 붙어 싸우는 놈들 사이에 섞여 뒤에 섭니다.

**몸에 구멍이 뚫려 있습니다.** 여기 여덟 중 유일합니다. 구멍은 **검게 비쳐야**
하고, 어둡게 칠하기만 하면 그냥 무늬가 됩니다.

포자·가시와 달리 **바닥에 붙어 있습니다** — 원거리 셋이 다 뜨면 뒷줄이 전부
공중에 걸린 것처럼 보입니다.

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
A slime that is dissolving everything it touches, including itself.
BODY: a mass with a WIDE OPEN MOUTH taking up its whole front — not a drawn line but a TEAR in the surface, uneven, wider on one side, held open. It sits on the ground; it does not float.
EATEN THROUGH: two or three HOLES go right through the body, so you can see black through them. They are what names this one — nothing else here has holes.
The rim of the mouth and the edges of the holes are RAGGED, as if still being eaten away.
DRIPS: four or five, longer than the other ground slimes'.
EYE: one, set high and to the side, well away from the mouth.
TEETH: FIVE, standing in the ragged rim of the mouth, and they are being EATEN BY ITS OWN ACID — tapered to needles, pitted, two of them dissolved down to stumps. Uneven lengths all round. Nothing else in the set has teeth that are falling apart.

The 3 cells, in this exact order:

Cell 1 — settled, mouth held half open, the holes clearly visible. Something is running out of the mouth already.
Cell 2 — the spit. The body has reared and thrown its front forward, the mouth wide, and a blob of acid is LEAVING it, clear of the body, with two speed lines.
Cell 3 — struck. Split from the top down into the mouth, so the tear and the split have joined into one gash. Two blobs thrown off, one hole torn wide open.

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
- It sits ON the ground in all three cells, unlike the spore and thorn slimes.
- It fills about 44% of the cell height.
- The holes must show BLACK THROUGH THEM, not shading. A hole that is only shaded reads as a spot.
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
{ "file": "<파일명>", "name": "sg_acid", "expect": [3, 1],
  "labels": ["idle", "attack", "down"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `assets/sprites/sg_acid/` 가
생기는 순간 화면이 그걸 씁니다 — 없는 동안은 `creature/slime` 으로 떨어지므로
코드는 안 고쳐도 됩니다.

---

## 투사체 — 산 덩어리 (Gemini)

**뒷줄이 실제로 날리는 것입니다.** 모션만 있고 아무것도 안 날아가면
뒤에서 혼자 꿈틀거리는 것으로 보입니다.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 날아감 | 흩어짐 | 사라짐 |
| id | `shot_1` | `shot_2` | `shot_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: 3 cells. ONE blob of acid in flight, animating over 3 frames, left to right.

The 3 cells, in this exact order:

Cell 1 — a heavy blob travelling nose-first, the front end solid and rounded, the back drawn out into a short tail with two drips falling off it. WIDER THAN IT IS TALL.
Cell 2 — the same blob breaking up — the front still solid, the back half separated into three smaller drops.
Cell 3 — mostly gone. Four small drops spreading apart, thin.

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
- It flies nose-first: **WIDER THAN IT IS TALL**, with the heavy end leading and the tail behind.
- It must read as LIQUID — rounded front, drips falling off it.

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
{ "file": "<투사체 파일명>", "name": "sg_acid_shot", "expect": [3, 1],
  "labels": ["shot_1", "shot_2", "shot_3"] }
```

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
