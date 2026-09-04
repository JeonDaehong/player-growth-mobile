# 스킬 트리가 필요로 하는 그림

**이 파일은 자동 생성됩니다** — `python tools/gen-motion.py`.

스킬 트리가 생기면서 (`core/skillTree`) 기술이 한 명당 넷까지 늘었습니다.
동작 시트는 둘뿐이라 (`sk_1..3` · `sk2_1..3`) 새 기술 열여섯이 전부 둘째
것을 빌려 쓰는데, 대부분은 맞고 **셋이 안 맞습니다.**

| 새 기술 | 지금 빌리는 동작 | 어떤가 |
|---|---|---|
| 이졸데 함성 | 도발 (외치는 자세) | 딱 맞다 |
| 이졸데 수호의 결의 | 도발 (팔 들어올림) | 봐줄 만하다 |
| 비앙카 용암 지대 | 화산 (땅 내리침) | 딱 맞다 |
| 리안느 정령의 노래 · 요정의 축제 | 숲의 축복 | 맞다 |
| 아녜스 신의 심판 | 정화 (팔 든다) | 맞다 |
| **이졸데 성검 발현** | 도발 | ✗ 검이 떨어지는데 외치고 있다 |
| **비앙카 불굴의 의지** | 화산 | ✗ 자기 강화인데 땅을 내리친다 |
| **리안느 거대 화살** | 숲의 축복 | ✗ 큰 화살을 쏘는데 버프 자세다 |

그래서 **셋에게만** 세 번째 동작(`sk3_1..3`)을 받습니다. 아녜스는 안 받습니다.

거기에 거대 화살이 **날아가는 그림**이 하나 더 필요합니다. 리안느의 기본
투사체(`elfarcher_shot`)는 손가락만 한 화살인데, 이 기술은 길에 선 적을 모두
꿰는 것이라 그 그림으로는 무엇이 지나갔는지가 안 보입니다.

## 안 들어와도 게임은 돕니다

동작은 `sk3` → `sk2` → `sk` 로 한 단계씩 물러나고 (`Fighter` 의 `skFramesOf`),
투사체는 기본 화살로 떨어집니다 (`Sprite` 의 `fallbackSet`). 들어오는 순간
저절로 갈립니다 — 코드는 안 고칩니다.

## 셋이 **또 다른 축으로** 움직여야 합니다

54px 에서 남는 것은 몸의 방향뿐입니다. 첫 기술 · 둘째 기술과 같은 방향으로
움직이면 세 벌을 받은 뜻이 없습니다.

| | 첫 기술 | 둘째 기술 | **세 번째** |
|---|---|---|---|
| 이졸데 | 옆으로 벤다 | 위로 젖힌다 | **낮게 앉아 높이 든다** |
| 비앙카 | 몸이 날아간다 | 내리찍는다 | **제자리에서 좁아졌다 넓어진다** |
| 리안느 | 무릎 꿇고 위로 쏜다 | 선 채로 몸을 낮춘다 | **서서 좌우로 벌린다** |

---

## §P3-KN. 이졸데 — 성검 발현 동작 (`sk3_1..3`)

이졸데의 4-2. 스킬 트리에서 검 갈래 끝에 있는 기술입니다 (`core/skillTree` 의 `kg4b`).

**무릎 꿇은 채 위로 뻗습니다.** 검기(옆으로 벤다)와 도발(위로 젖힌다) 둘 다와 다른 축이어야 하는데, 이 사람이 아직 안 쓴 것이 "낮게 앉아서 높이 든다" 입니다.

**떨어지는 검은 그리지 마세요.** 화면이 그립니다 — 여기는 몸만입니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 무릎 꿇음 | 2 치켜듦 | 3 버팀 |
| id | `sk3_1` | `sk3_2` | `sk3_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character CALLING DOWN A SWORD OF LIGHT. She kneels, raises her own sword overhead as a beacon, and holds. She never swings it and she never leaves the spot.

She is a white-armoured knight girl with long pale hair and a greatsword. Same person in all three cells.

The 3 cells, in this exact order:

Cell 1 — dropping to one knee. Her front knee is planted on the ground, her back leg folded under her, and the greatsword is held ACROSS her body low, point down and to the left, both hands on the grip. Her head is BOWED. This is the LOWEST and most compact cell of the sheet.
Cell 2 — raising the sword as a beacon. Still on one knee, she has thrust the greatsword STRAIGHT UP above her head, arms fully extended, blade dead vertical, both hands on the grip. Her head is tipped BACK and up, following the point. Her back is arched. The blade must reach the very top edge of the cell — it is the tallest single line in this character's whole sheet set.
Cell 3 — holding. Identical stance to cell 2 — still kneeling, sword still straight up — but her arms have locked and her shoulders have dropped: she is braced against something pressing down. Her hair and the hem of her surcoat are lifted straight UP as if by a wind coming from below. The pose barely differs from cell 2 and that is deliberate: the change is in the hair and the tension, not the limbs.

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

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

NOTHING MAY BE CUT OFF.
- The sword stays VERTICAL in cells 2 and 3 — it never tilts.
- She is KNEELING in all three cells. She never stands up.
- Draw NO falling sword, NO beam, NO light. The game draws what comes down; this sheet is only her body.
- Her feet sit at the same HEIGHT in all three cells — an alignment, not a drawn line.
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
{ "file": "<성검 발현 파일명>", "name": "knightgirl", "expect": [3, 1],
  "labels": ["sk3_1", "sk3_2", "sk3_3"] }
```

## §P3-BU. 비앙카 — 불굴의 의지 동작 (`sk3_1..3`)

비앙카의 3-2. 5초 동안 공격력이 두 배가 되고 디버프에 안 걸리는 기술입니다 (`core/skillTree` 의 `ba3b`).

**제자리에서 부풉니다.** 강타(몸이 날아간다)와 화산(내리찍는다) 둘 다 이동이나 타격인데, 이건 아무 데도 안 가고 아무것도 안 때립니다 — 좁아졌다 넓어지는 것 하나로 말해야 합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 움켜쥠 | 2 포효 | 3 부풂 |
| id | `sk3_1` | `sk3_2` | `sk3_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character STEELING HERSELF — she grips the axe, roars, and swells. She does not swing, does not jump, and does not move an inch.

She is a bunny-eared girl in a dark performer's outfit with a large axe. Same person in all three cells.

The 3 cells, in this exact order:

Cell 1 — gripping down. She has pulled the axe IN against her own chest, haft held across her body diagonally with both fists, elbows tight to her ribs. Her chin is tucked and her shoulders are hunched forward. This is the NARROWEST cell — everything is pulled toward the centre line of her body.
Cell 2 — the roar. Her head is thrown back, mouth open, and both arms have driven DOWN and OUT to her sides, fists clenched, the axe held out wide in one hand. Feet planted apart. Her chest is thrust forward. This is the WIDEST cell — the exact opposite of cell 1.
Cell 3 — holding the swell. Same wide stance as cell 2 but her head has come level and forward again, eyes front, and the arms have risen a little so the axe is now held out at shoulder height. Her ears and hair are blown BACK. The stance is the same; what changed is that she is now looking at what she is about to hit.

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

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

NOTHING MAY BE CUT OFF.
- She never leaves the spot and the axe never travels above her head.
- The read is NARROW → WIDE → WIDE-AND-FORWARD. If cells 1 and 2 have the same silhouette width, the sheet has failed.
- Draw NO aura, NO flames, NO glow. The game draws the effect.
- Her feet sit at the same HEIGHT in all three cells — an alignment, not a drawn line.
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
{ "file": "<불굴의 의지 파일명>", "name": "bunnyaxe", "expect": [3, 1],
  "labels": ["sk3_1", "sk3_2", "sk3_3"] }
```

## §P3-EL. 리안느 — 거대 화살 동작 (`sk3_1..3`)

리안느의 4-1. 아주 큰 화살을 직선으로 쏘아 길에 선 적을 모두 꿰는 기술입니다 (`core/skillTree` 의 `ea4a`).

**서서 수평으로 쏩니다.** 화살비는 무릎 꿇고 하늘로 쏘고, 숲의 축복은 선 채로 몸을 낮춥니다 — 이건 서서 팔을 좌우로 벌리는 것이라 셋이 다 갈립니다.

**화살은 그리지 마세요.** 날아가는 것은 따로 받습니다 (아래 §P4) — 여기에도 그리면 둘이 겹칩니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 겨눔 | 2 당김 | 3 놓음 |
| id | `sk3_1` | `sk3_2` | `sk3_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character DRAWING AND LOOSING one enormous arrow, HORIZONTALLY, while standing. She does not kneel and she does not crouch.

She is a slender elf archer with long ears and a wooden bow. Same person in all three cells.

The 3 cells, in this exact order:

Cell 1 — settling into the shot. She stands upright and side-on, feet apart and braced, the bow held out at FULL ARM'S LENGTH to the right at shoulder height, string hand at her cheek. The bow is vertical. Nothing is nocked yet. This is the calmest, most upright cell.
Cell 2 — the full draw. Her string hand has been hauled back PAST her ear, her whole torso has rotated open, and the bow limbs have bent deeply — the bow is visibly straining, its curve much sharper than in cell 1. Her front arm is locked straight. Both feet are dug in and her back heel has lifted. This is the WIDEST cell: her arms span nearly the full width.
Cell 3 — the release. Her string hand has flown back and open past her shoulder, fingers spread, the bow limbs have snapped straight, and her body has been rocked back a step by the recoil — front shoulder driven back, chin lifted. Her hair and cloak stream FORWARD past her in the direction the arrow went. She is the most off-balance she ever looks.

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

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

NOTHING MAY BE CUT OFF.
- She is STANDING in all three cells. The arrow-rain sheet is the kneeling one; this must not repeat it.
- The bow stays roughly VERTICAL and the shot is HORIZONTAL — she is not shooting into the sky.
- Draw NO arrow and NO trail. The game draws the projectile separately (a huge dragon-shaped shaft) and it would collide with anything drawn here.
- Her feet sit at the same HEIGHT in all three cells — an alignment, not a drawn line.
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
{ "file": "<거대 화살 파일명>", "name": "elfarcher", "expect": [3, 1],
  "labels": ["sk3_1", "sk3_2", "sk3_3"] }
```

---

## §P4. 용 모양 거대 화살 — `elfarcher_dragon`

리안느의 거대 화살이 날리는 것입니다 (`core/chars` 의 `SkillDef.proj`).

**용처럼 생긴 화살이지, 날아가는 용이 아닙니다.** 몸이 곧고 뻣뻣해야 하고,
날개도 다리도 없어야 합니다 — 화살촉 자리에 용 머리가 있고 화살깃 자리에
꼬리 지느러미가 있는 **하나의 단단한 물건**입니다.

### 셀 순서

세 칸은 **경로가 아니라 수명**입니다 — 날아가는 동안 온전했다가 갈라지고
부서집니다 (`bfx_rock` 과 같은 규칙입니다).

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 온전함 | 2 갈라짐 | 3 부서짐 |
| id | `shot_1` | `shot_2` | `shot_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 3 CELLS in ONE row, left to right — the same enormous arrow at three moments of its flight.

The 3 cells, in this exact order:

Cell 1 — THE WHOLE ARROW, flying LEFT. One enormous arrow seen from the side, filling the full width of the cell. From the front: a DRAGON'S HEAD forms the arrowhead — a long narrow wedge-shaped skull with a closed jaw, one visible eye socket, and TWO horns swept back along the shaft. Behind the head the shaft is a segmented BODY of eight or nine plates, thickest just behind the skull and tapering toward the tail. Along its back runs a low ridge of short spines. At the tail, THREE stiff fins spread out as fletching. It reads as one solid object, not a creature in flight: the body is straight and rigid, never coiled or S-curved.
Cell 2 — THE SAME ARROW, SPLITTING. Identical shape and position, but hard black cracks now run between the body plates — three or four of them, each a clean straight break across the shaft. The plates have shifted slightly out of line with each other. The head and the fins are still whole and still in place.
Cell 3 — THE ARROW COMING APART. The shaft has broken into four or five separate chunks still roughly in line but with wide black gaps between them, drifting apart. The dragon head is still recognisable and still leads. The tail fins have separated and trail behind. Nothing has turned to dust or smoke — these are hard-edged broken pieces.

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

IT FLIES TO THE LEFT AND IT IS DRAWN POINTING LEFT.
- The game does not mirror this sheet. An arrow drawn pointing right will fly backwards on screen.
- HORIZONTAL. The long axis runs across the cell, not diagonally. It is the widest, flattest thing in this project.
- It is NOT alive. No wings, no legs, no coiling, no open roaring mouth. A dragon SHAPED like an arrow, not a dragon flying.
- It must read at 60 pixels wide. That means: one long mass, a clearly different head end, a clearly different tail end, and nothing else.

NO DITHERING. NO CHECKERBOARD. Every edge is a HARD STEP between solid white and solid black.

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
{ "file": "<§P4 파일명>", "name": "elfarcher_dragon", "expect": [3, 1],
  "labels": ["shot_1", "shot_2", "shot_3"] }
```
