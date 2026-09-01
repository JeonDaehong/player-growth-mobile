# 숲의 의지를 품은 고대 수호수, 실바누스

← [색인으로](../BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 생성기의 `BOSSES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/b20_silvanus/` |
| 등장 | 20스테이지 · 타락한 군락의 정원 |
| 칸 수 | 5칸 |

20스테이지 우두머리. **마지막 적이고, 이 게임에서 제일 큽니다** (86%).

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
있습니다 — 이놈만 무언가를 결정한 것처럼 보여야 합니다.

## 이 우두머리가 하는 것

그림의 자세는 전부 여기서 나옵니다. **무엇을 하는 기술인지가 어떤 모양이어야
하는지를 정합니다** — 전원을 치는 기술은 넓거나 높고, 한 명을 크게 치는 기술은
길고 좁습니다.

**패시브 · 수호수의 가호** — 받는 모든 피해 20% 감소, 15초마다 최대 체력의 5% 회복, 체력 30% 이하에서 10초간 방어력 50% 증가
(싸우는 내내 화면 위쪽에 로고가 떠 있습니다 → [`BOSS_PASSIVE_PROMPTS.md`](../BOSS_PASSIVE_PROMPTS.md))

**평타** — 한 명에게 보통 피해. 시트에서 제일 자주 보이는 칸이라 제일 절제되어야 합니다.

**스킬 1 · 태고의 성난 벼락** (`skill1` 칸) — 아군 전체에 공격력의 150%만큼 물리 피해, 대상의 스킬 게이지를 50% 강제 차감 (평타 6대마다)

**스킬 2 · 자비없는 칼날** (`skill2` 칸) — 아군 중 체력이 가장 낮은 대상에게 공격력의 250%만큼 마법 피해 (평타 5대마다)

---

## 시트 한 장 (Gemini)

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 대기 | 평타 | 태고의 성난 벼락 | 자비없는 칼날 | 피격 |
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
The oldest thing in the garden. Everything else here answers to it, and the ones that would not are in its roots. It is the last enemy the player meets and it has never lost.
BODY: a COLOSSAL TREE, the largest and tallest silhouette of the entire game, filling nearly its whole cell. A single vast trunk, straight and unbroken, widening into a heavy buttressed base. Unlike every other boss in this chapter IT IS NOT ROTTEN, NOT BROKEN AND NOT LEANING — and that is not peace, it is the reason nothing has ever killed it. Everything else in this garden is coming apart; this one has been WINNING.
THE CROWN — THIS IS WHAT SAYS KING, and it is the first thing to get right. SIX great limbs rise from the top of the trunk and sweep outward and UP into a ring of hard upswept HORNS, each tapering to a spike, each a different length, the longest twice the shortest. Between every horn you can see black sky. There are NO leaves, no twigs and no soft mass anywhere in it. It is a crown of points, not a canopy and not a dome — a thing that could gore, worn by something that grew it. It rises well above the trunk and it is the widest part of the creature.
HELD UP IN THE CROWN — THE SPOILS. Gripped between the horns, one per limb, are FIVE things it beat and never put down: the SNAPPED TRUNK of another tree half its own thickness, held like a stick; a BELL; a SHIELD with a horn driven clean through it; a RIBCAGE; and the SKULL OF A BEAST larger than any mob in the game. They hang at different heights and wrong angles, all of them raised ABOVE the mouth and the eyes. A king puts what it beat where everyone can see it. These are also the scale reference: the beast skull should look small up there.
THE PASSIVE — draw it in every cell: the trunk is armoured in HEAVY OVERLAPPING BARK PLATES, thick slabs with deep hard-edged grooves between them, layered like scales from the base to the crown. They are grown, not fitted. They are what makes it hard to hurt and they are never absent, not even in the struck cell.
THE MOUTH is a wide horizontal rift across the trunk beneath the crown, pulled open and grim, with TWELVE heavy teeth of solid wood — the four longest overshoot the opposite lip and stand outside the mouth even when it is closed. It is the widest mouth in the game and it runs most of the way across the trunk.
EYES: SIX, set in a ring around the trunk at the same level just above the mouth — the only boss whose eyes are ARRANGED rather than scattered, and all six are aimed DOWN AND FORWARD at the same single point. Every other creature in this game looks about; this one has already picked what it is looking at, and that agreement between the six is the whole threat of the face.
THE ACCIDENT — this one only: ONE of the six crown limbs has hardened into a BLADE. It is flattened, straight-edged and tapering to a point along its whole length, clearly different from the other five, and it is the only part of the creature that is not organic in outline.
THE BASE: six buttress roots spread wide and sunk deep — and CAUGHT IN THEM, half swallowed and lifted clear off the ground, are the broken STUMPS OF THREE SMALLER TREES it pulled up whole. Their own roots still trail from them. It does not travel and it never has: it made the others come to it.

The 5 cells, in this exact order:

Cell 1 — standing at full height, the crown of horns raised, the five spoils hung among them, all six eyes aimed down and forward at the same point. Bark plates layered from base to crown, three uprooted stumps in the roots. It is completely still — and the stillness is not waiting, it is a thing that has already decided and is not in a hurry about it.
Cell 2 — the strike. TWO of the crown limbs have swung down and forward together, out past the front of the trunk at head height, horns leading, the crown opened just enough to let them through. The trunk has not moved at all and the base has not shifted. It does not lean, it does not step and it does not brace — it simply reaches down, the way you reach for something on the floor. Short and contemptuous.
Cell 3 — THE FURY — it hits EVERYONE and strips what they were charging, so the creature OPENS UPWARD and takes the whole cell. The crown has been THROWN WIDE: all six limbs have swung up and out to full spread, straightened, reaching almost to the top and to both side edges of the cell but stopping clear of all three, so the ring of horns has become a spread of spears aimed outward. The trunk has arched back and every bark plate has LIFTED and separated along its grooves, standing out from the trunk all down its length like a beast raising its hackles. The five spoils have been flung out with the limbs and swing wide. Ten torn splinters and bark flakes hang in the air around the crown. It is the TALLEST AND WIDEST cell of the sheet, and the one moment the creature looks angry rather than certain. Draw no lightning, no bolt, no glow — the game draws its own effects and a bolt in the sprite becomes a permanent white smear.
Cell 4 — THE EXECUTION — it picks the ONE weakest character and finishes them, so this cell is the opposite of the fury in every way. The crown stays CLOSED and still, exactly as in idle, and the trunk stays upright. ONLY THE BLADE LIMB has moved, and the spoils have not even swung: it has come down and thrust FORWARD AND SLIGHTLY DOWN in one straight line, fully extended, reaching almost to the far edge of the cell but stopping clear of it, at a single point below head height. It is the only thing out of place on the whole creature. Nothing has left the body, nothing hangs in the air, and no bark has lifted. All six eyes have turned to look along the blade. It is the NARROWEST and STILLEST attacking cell in the game — and it must read as colder than the fury, not weaker.
Cell 5 — struck. The bark plates have SHATTERED off one whole side of the trunk and the pale wood beneath is split open, three crown horns snapped and hanging by strips of bark, the blade limb cracked halfway along. Two of the five spoils have fallen out of the crown and one of the uprooted stumps has rolled clear of the roots. For the first time the trunk is out of vertical — and the six eyes are no longer looking the same way, which is the only cell in which they disagree.

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
- In the idle cell it fills about 86% of the cell along its LONGER dimension — the height if it is taller than wide, the WIDTH if it is wider than tall. The other dimension follows from its proportions. It is the only creature on the field and it must read as such.
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
{ "file": "<파일명>", "name": "b20_silvanus", "expect": [5, 1], "floor": true,
  "labels": ["idle", "attack", "skill1", "skill2", "down"] }
```

받으면 `python tools/slice.py` 를 돌리세요.

---

## 다시 뽑을 때

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
The creature is drawn too small inside its cell. Redraw it filling about 86%
of the cell height, centred, with the empty space distributed around it rather than
below it.
```
