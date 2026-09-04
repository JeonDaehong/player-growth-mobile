# 침식을 완료한 군체의 절대자, 바알, 바알

← [색인으로](../BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.
고치려면 생성기의 `BOSSES` 를 고치세요.

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/b30_baal/` |
| 등장 | 30스테이지 · 우화하는 군체들의 침식지 |
| 칸 수 | 5칸 |

30스테이지 우두머리. **최종 보스입니다.**

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
화면에 안 뜹니다 — 잡히면 그 자리에서 사라집니다.

## 이 우두머리가 하는 것

그림의 자세는 전부 여기서 나옵니다. **무엇을 하는 기술인지가 어떤 모양이어야
하는지를 정합니다** — 전원을 치는 기술은 넓거나 높고, 한 명을 크게 치는 기술은
길고 좁습니다.

**패시브 · 부식성 아우라** — 바알의 평타에 맞으면 이번 판이 끝날 때까지 방어력과 마법저항력이 10% 씩 누적으로 깎인다 (최대 10중첩 · 정화로 풀 수 있다)
(싸우는 내내 화면 위쪽에 로고가 떠 있습니다 → [`BOSS_PASSIVE_PROMPTS.md`](../BOSS_PASSIVE_PROMPTS.md))

**평타** — 한 명에게 보통 피해. 시트에서 제일 자주 보이는 칸이라 제일 절제되어야 합니다.

**스킬 1 · 군체의 대염쇄** (`skill1` 칸) — 체력 50% 이하가 되면 허물을 벗고 본체와 같은 능력치의 환영 분신을 하나 만든다 (분신은 체력 25% · 스킬 2를 같이 쓴다)

**스킬 2 · 군주 붕괴파** (`skill2` 칸) — 아군 전체에 공격력의 180% 마법 피해 + 30% 확률로 3초 기절 — 코스트 6

---

## 시트 한 장 (Gemini)

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 대기 | 평타 | 군체의 대염쇄 | 군주 붕괴파 | 피격 |
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
The last one. It is not one insect — it is what happens when the whole brood finishes becoming a single thing, and then crowns itself.
THIS ONE IS A MONARCH, NOT A PILE. Every other creature in this game is drawn as a thing that hunts. This one is drawn as a thing that RULES, and the difference has to survive being shrunk to 84 pixels:
  - SILHOUETTE FIRST. Squinted at, it is one tall broad-shouldered TRIANGLE — wide braced base, mass carried high, narrowing to a crowned point. No other creature in the game has that outline. If the shape reads as a lumpy mound or a spiky ball, the drawing has failed no matter how good the detail is.
  - IT DOES NOT LUNGE. The pose is held, weight square, absolutely still. Everything else in the game leans and reaches; stillness is what makes this one read as above them.
  - SYMMETRY IS THE AUTHORITY. Left and right match — deliberately, formally, like a heraldic device. Exactly ONE thing breaks it, named below, and that single break is what makes the symmetry look chosen rather than accidental.
  - IT IS THE TALLEST THING IN THE GAME and it must be drawn to fill its cell top to bottom.
BODY: an upright TOWERING mass, TALLER THAN WIDE, built of segmented plates that do not all belong to the same animal. Read from the ground up: a broad braced base of SIX legs planted like the feet of a throne, none of them a matching pair — one is a beetle's thick hook, one a mantis blade, one a spider's long joint, one a centipede's row of small hooks fused into a single limb. Above them a barrel thorax of NINE overlapping plates, the lowest ones flaring outward into broad shoulder pauldrons so the mass sits high and wide.
THE MANTLE — this is what makes it a monarch. Four long dead WING CASES hang from behind the shoulders, spread and held stiff, falling past the thorax like a heavy cloak. They are ragged along their lower edges and they do not move. They must be clearly BEHIND the arms and clearly NOT usable — this thing has not flown in a long time.
THE CROWN: the head carries a fan of SEVEN hard spines rising from the skull plate, the middle one tallest, the outer ones stepping down evenly to each side. Straight tapered spikes, evenly spaced, unmistakably arranged rather than grown. This is the top of the silhouette and the single most important shape on the creature.
IT IS MADE OF THE OTHERS — this one only, and it is the whole point: set into the plates of the thorax and the base, half absorbed and still recognisable, are parts of the creatures from earlier in the region: ONE hexagon of comb, ONE fruiting-body stalk with a club head, ONE moth wing with an eye-spot, ONE fang with a groove. Four, no more, spaced apart, each clearly a foreign shape sunk into the surface. Do not add a fifth and do not repeat one.
THE ARMS: TWO enormous forelimbs raised and held apart, each ending in a hard splitting blade, both bending the wrong way at the elbow. They are the only symmetrical thing on it, and they are held wide.
THE INFESTATION — this one has finished. The growth is not pushing through the shell any more; it IS the shell in places. Down the whole front of the thorax, four of the nine plates are faceted slabs rather than chitin, flat-sided and squared, and the seams between them and the living plates are black gaps you can see into. The absorbed parts of the earlier creatures are set INTO those faceted plates, not into the living ones — the thing in it is what collected them.
THE REPLACED PART: the LEFT forelimb blade. Where the right one is a hard organic splitting blade, the left is one straight faceted shaft with a flat squared edge, longer than its twin and completely unmatched. The one thing on this creature that is symmetrical is not.
HEAD: a hard capsule with a bank of TEN eyes in three rows, and four mouth plates that open sideways in two pairs. It is a fraction of the body and it is the darkest, most closed part.
THE MOULT: a full split, dry, hollow SHELL of a previous body stands behind and below it, empty and upright, still holding the shape it was left in. It is attached at nothing. It is standing there because it never fell over.
SCARS: three plates are punched through and healed from beneath.

The 5 cells, in this exact order:

Cell 1 — enthroned. Standing upright and braced, six mismatched legs planted square, both blades raised and held wide and LEVEL like a proclamation, the crowned head UP and facing out rather than lowered at prey, the mantle of dead wing cases spread behind. The empty shell stands behind that. It is the TALLEST silhouette in the game, it is perfectly symmetrical apart from the replaced blade, and it is completely still. Nothing about this pose is mid-motion.
Cell 2 — the cut. ONE blade has come down and across in a single diagonal, the other blade still raised and untouched, the crowned head STILL FACING FORWARD — it does not turn to look at what it is cutting. The legs have not moved at all and the mantle has not swung: six planted points and one arm. It attacks without shifting its weight, and that is what makes it look final.
Cell 3 — THE SHEDDING — this is the moment it makes the copy. The body has ARCHED backwards and the thorax has SPLIT OPEN down the middle seam, the nine plates peeling apart to both sides, and out of that split the new body is emerging — draw it as a SECOND, PALER outline rising up and forward out of the old one, head and one blade already clear, still joined at the waist. Both bodies are in this cell. The old shell that was standing behind has TOPPLED and lies across the base. It is the only cell containing two of the creature.
Cell 4 — THE COLLAPSE WAVE — everyone at once. BOTH blades have been driven DOWN and INWARD to meet at a single point in front of the base, and the whole body has folded over that point — head down, thorax hunched, the six legs splayed out and skidding. From the meeting point, a broad flat RING of separate hard shards is thrown outward at ground level, strongest near the point and thinning outward, stopping well inside the cell. It is the LOWEST and WIDEST cell of the sheet: everything that was upright has come down.
Cell 5 — struck. One blade is severed at the elbow and falling; three of the six mismatched legs have buckled and the tower has begun to lean. Four thorax plates are lifted off their neighbours and the absorbed parts — the comb hexagon, the eye-spot wing — are cracked through. The head is turned away and half the eyes are dulled.

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
- In the idle cell it fills about 84% of the cell along its LONGER dimension — the height if it is taller than wide, the WIDTH if it is wider than tall. The other dimension follows from its proportions. It is the only creature on the field and it must read as such.
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
{ "file": "<파일명>", "name": "b30_baal", "expect": [5, 1], "floor": true,
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
The creature is drawn too small inside its cell. Redraw it filling about 84%
of the cell height, centred, with the empty space distributed around it rather than
below it.
```
