# 시체꽃

← [색인으로](../FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.
고치려면 생성기의 `FOES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/pb_carrion/` |
| 등장 | 우두머리 · 15스테이지 |
| 하는 일 | 오염된 잔재들의 숲의 끝. 이 숲이 먹은 것이 전부 여기 있다. |

15스테이지 우두머리. **오염된 잔재들의 숲의 끝**입니다.

**정면을 보는 유일한 놈**입니다. 이 챕터의 나머지는 전부 옆에서 본 모습인데
이놈만 몸을 돌려 이쪽을 봅니다 — 활짝 벌어진 원반은 세트의 다른 무엇과도
안 겹치는 실루엣입니다.

삼킨 것을 **셋** 둡니다. 다른 놈들은 하나뿐인데(더 두면 장식처럼 보여서),
챕터의 끝이고 이 숲이 먹은 것을 전부 안고 있다는 뜻이라 여기서만 예외입니다.

3번 칸(특수)에서 꽃잎이 **뒤로 완전히 젖혀지며** 칸을 가득 채웁니다.

---

## 시트 한 장 (Gemini)

화면이 쓰는 칸은 **셋뿐**입니다 (`src/screens/home/BattleView.tsx`) —
평소에는 `idle`, 때릴 때 `attack`, 맞았을 때 `down`.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 대기 | 공격 | 특수 | 피격 |
| id | `idle` | `attack` | `special` | `down` |

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
The bloom this whole wood was feeding.
BODY: a single ENORMOUS FLOWER opened flat and facing forward — the widest thing in this chapter, nearly filling the cell. Five heavy lobes spread open around a deep dark centre.
IT IS THE ONLY THING HERE THAT FACES YOU. Every other plant in the wood is seen from the side; this one has turned to look, and the flat open disc of it is a shape nothing else in the set has.
THE CENTRE is a deep pit ringed with NINE INWARD SPINES, long and uneven, three snapped. You cannot see the bottom of it.
THE LOBES are ragged at the edges and sag under their own weight, the lower two drooping almost to the ground.
AROUND THE RIM, held between the lobes where they meet: A SKULL, A HELM, and A SWORD HILT — evenly spaced, like things set out. This is the one place in the set where more than one is allowed; it is the end of the chapter and it has eaten all of it.
SCARS: two lobes have been CUT THROUGH and grown back, thick ridges across them.
THE STEM behind is short and thick, and the ROOTS spread wide and low.
EYES: none. It does not need them.

The 4 cells, in this exact order:

Cell 1 — opened flat and facing you, lobes spread and sagging, the pit black and still. Nothing moves. That stillness, at this size, is the whole idea.
Cell 2 — the snap. The five lobes have FOLDED IN toward the centre like a closing hand, the whole flower pulled into a fist half its open width, the spines meshed together. It has caught something.
Cell 3 — THE BLOOM. Every lobe thrown back FLAT AND WIDE past where they should go, the pit opened to its full depth and every spine standing out from the rim, so the creature is a huge open ring filling the cell edge to edge. It is the widest cell. A cloud of loose spores hangs clear all round it.
Cell 4 — struck. Three lobes torn half off and curling back, the rim broken open on one side, the helm and the sword hilt knocked loose and falling.

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

IT IS A PLANT THAT HUNTS. IT IS NOT A PLANT.

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
googly eyes on a stem, anything that would work as a garden centre logo.

IT IS A BOSS. IT MUST READ AS ONE BEFORE THE HEALTH BAR DOES.

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
encouraged, even. The test is whether it looks worn or looks eaten.)

THE FOURTH CELL — THE SPECIAL ATTACK.

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
smear that never goes away.

IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party.

NOTHING MAY BE CUT OFF.
- It fills about 80% of the cell height — it is the biggest thing on the field and must read as such next to a 45% mob.
- Cell 3 (the special attack) is the widest or the tallest. Size the sheet from it.
- Every cell holds the WHOLE creature plus every loose droplet and speed line. If any of it touches a magenta line, that cell has failed.
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
{ "file": "<파일명>", "name": "pb_carrion", "expect": [3, 1],
  "labels": ["idle", "attack", "special", "down"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `assets/sprites/pb_carrion/` 가
생기는 순간 화면이 그걸 씁니다 — 없는 동안은 `creature/slime` 으로 떨어지므로
코드는 안 고쳐도 됩니다.

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
The creature is drawn too small inside its cell. Redraw it filling about 80% of
the cell height, centred, with the empty space distributed around it rather than
below it.
```
