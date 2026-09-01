# 보스 패시브 로고

← [색인으로](BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.

패시브를 가진 우두머리가 **11마리**입니다. 패시브는 껐다 켜지는 것이 아니라
싸우는 내내 걸려 있으므로, 화면 위쪽에 로고가 **계속** 떠 있어야 합니다.

이건 생물 그림이 아니라 **아이콘**입니다 — 쿼터뷰가 아니고, 12~16px 에서
읽혀야 하고, 규칙이 통째로 다릅니다.

## 열하나의 윤곽이 전부 겹치면 안 됩니다

12px 에서 안쪽은 없는 것과 같습니다. 그래서 **모양으로** 갈랐습니다 —

| 로고 | 우두머리 | 윤곽 |
|---|---|---|
| `bp_thorn` | b05 스피나투스 · 가시 갑옷 | A SPIKED BALL |
| `bp_viscous` | b10 슬러지누스 · 오염된 점성 | A HEAVY FALLING DROP |
| `bp_rot` | b15 카다베라 · 부패의 오라 | A RISING PLUME |
| `bp_ward` | b20 실바누스 · 수호수의 가호 | A SHIELD-LEAF |
| `bp_split` | b21 센티페다 · 절단 분열 | A BAR CUT IN TWO |
| `bp_shell` | b23 누카누스 · 경화 갑각 | A CLOSED DOME |
| `bp_sting` | b24 비블리스 · 독침 | A DROP ON A POINT |
| `bp_hive` | b25 아라크네스 · 군체의 지배자 | A BIG ONE AND FOUR SMALL |
| `bp_burst` | b26 피로스 · 최후의 발악 | A SHAPE FLYING APART |
| `bp_spore` | b29 포르미카 · 포자 감염 | A CLUB ON A STALK |
| `bp_corrode` | b30 바알 · 부식성 아우라 | A SQUARE BEING EATEN |

**장을 나눠 그리지만 겹침은 전체를 봅니다.** 한 장에 넷씩 그리는 것은 한 번에
열하나를 그리면 뒤로 갈수록 뭉개지기 때문이고, 안 겹쳐야 하는 것은 여전히
열하나 전부입니다 — 같은 화면에 같이 뜹니다.



---

## A장 — 4칸

이미 들어와 있습니다 — 다시 뽑을 필요가 없습니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 가시 갑옷 | 오염된 점성 | 부패의 오라 | 수호수의 가호 |
| id | `bp_thorn` | `bp_viscous` | `bp_rot` | `bp_ward` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of 4 ICONS in one row, left to right. They are a matched set — same weight, same fill, same size within their cells.

The 4 cells, in this exact order:

Cell 1 — A SPIKED BALL. A solid round core filling the middle of the cell with SIX thick triangular spikes radiating from it — up, down, and four diagonals — each spike as long as the core is wide and wide at its base. The outline is a fat six-pointed star with no thin parts anywhere. Squint test: a star.
Cell 2 — A HEAVY FALLING DROP. One solid teardrop filling most of the cell — a fat round bottom taking two-thirds of the height, narrowing upward into a thick neck that reaches the top edge, plus ONE smaller round drop already separated and sitting just below it in the lower corner. Two solid shapes, one big one small. The outline is smooth and bulging with no points at all. Squint test: a drip.
Cell 3 — A RISING PLUME. A wide solid mound along the bottom third of the cell with THREE thick stalks rising out of it to different heights, each ending in a heavy rounded head, the middle one tallest and reaching the top edge. The stalks are as wide as the gaps between them. Squint test: three stalks on a mound.
Cell 4 — A SHIELD-LEAF. One solid shape combining both: a broad flat straight top edge running the full width of the cell, sides dropping straight down and then curving in to meet at a single point at the bottom. Cut into it from the bottom point, running a third of the way up the middle, is ONE straight notch as wide as a fifth of the shape — the leaf midrib. No other detail. Squint test: a shield.

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

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 12 TO 16 PIXELS. That is smaller than the text next to it.
Everything below follows from that one fact.

- ONE SHAPE. The whole icon must read as a single silhouette at a glance. Not a
  scene, not an object sitting on a background, not two things next to each other.
- FILL THE CELL. The shape touches or nearly touches all four sides of its cell.
  An icon drawn small inside its cell disappears entirely when scaled down.
- SOLID, NOT OUTLINED. Draw it as a filled white mass. A hollow outline at 14px
  becomes a grey smudge, because the outline and the hole merge.
- NO INTERIOR DETAIL. No rivets, no wood grain, no gem facets, no shading, no
  highlights. If you can only see it at full size, it is noise.
- ONE NOTCH OR CUT-OUT AT MOST, and it must be at least a fifth of the width.
  Anything finer closes up.
- STRAIGHT AND CHUNKY. Thick strokes, hard angles, flat ends. Thin tapering lines
  vanish; a 1px point at full size is nothing at icon size.
- NO PERSPECTIVE. Flat and front-on, like a road sign. These are the only images
  in this game that are NOT drawn in three-quarter view.
- CENTRED and upright. Not tilted, not dynamic, not in motion — these sit next to
  text and a tilted icon looks like a mistake.

TEST: squint until the image is a blur. If you can still name it, it is right.
If it becomes a grey blob, the shape is too busy.

THEY MUST NOT BE CONFUSABLE — and not only with each other. These join 7 icons that already exist in the game and appear on the same screen. Squint at each finished icon and make sure its OUTLINE is not close to any of the others listed in the table above; the outline is the only thing that survives at 14 pixels.

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



---

## B장 — 4칸

아직 안 들어왔습니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 절단 분열 | 경화 갑각 | 독침 | 군체의 지배자 |
| id | `bp_split` | `bp_shell` | `bp_sting` | `bp_hive` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of 4 ICONS in one row, left to right. They are a matched set — same weight, same fill, same size within their cells.

The 4 cells, in this exact order:

Cell 1 — A BAR CUT IN TWO. One thick horizontal bar running the full width of the cell, a third of its height, SEVERED at the middle by a straight vertical gap as wide as the bar is tall — two separate solid blocks, left and right, the same size, with clean square ends facing each other. Nothing joins them. Squint test: two blocks with a gap.
Cell 2 — A CLOSED DOME. One solid half-circle sitting on the bottom edge of the cell, flat side down, filling the full width — and across it, from the flat base up over the top, THREE straight vertical bars of black cutting it into four bands. The dome is unbroken at its outline; the bands are inside it. It is the only ROUND-TOPPED FLAT-BOTTOMED shape in the set. Squint test: a banded dome.
Cell 3 — A DROP ON A POINT. One long straight NEEDLE running from the top-left corner down to the bottom-right, a fifth of the cell wide, tapering to a point at the lower end — and hanging just clear of that point, not touching, ONE fat round DROP a third of the cell wide. Two shapes, one long and thin, one small and round. Squint test: a needle and a bead.
Cell 4 — A BIG ONE AND FOUR SMALL. One solid circle filling the middle two-thirds of the cell, and around it FOUR much smaller solid circles — one at each corner — each a quarter of its width, none touching it or each other. Perfectly plain circles, no rings, no dots inside. It is the only icon in the set made of separate round pieces. Squint test: one big dot, four small.

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

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 12 TO 16 PIXELS. That is smaller than the text next to it.
Everything below follows from that one fact.

- ONE SHAPE. The whole icon must read as a single silhouette at a glance. Not a
  scene, not an object sitting on a background, not two things next to each other.
- FILL THE CELL. The shape touches or nearly touches all four sides of its cell.
  An icon drawn small inside its cell disappears entirely when scaled down.
- SOLID, NOT OUTLINED. Draw it as a filled white mass. A hollow outline at 14px
  becomes a grey smudge, because the outline and the hole merge.
- NO INTERIOR DETAIL. No rivets, no wood grain, no gem facets, no shading, no
  highlights. If you can only see it at full size, it is noise.
- ONE NOTCH OR CUT-OUT AT MOST, and it must be at least a fifth of the width.
  Anything finer closes up.
- STRAIGHT AND CHUNKY. Thick strokes, hard angles, flat ends. Thin tapering lines
  vanish; a 1px point at full size is nothing at icon size.
- NO PERSPECTIVE. Flat and front-on, like a road sign. These are the only images
  in this game that are NOT drawn in three-quarter view.
- CENTRED and upright. Not tilted, not dynamic, not in motion — these sit next to
  text and a tilted icon looks like a mistake.

TEST: squint until the image is a blur. If you can still name it, it is right.
If it becomes a grey blob, the shape is too busy.

THEY MUST NOT BE CONFUSABLE — and not only with each other. These join 7 icons that already exist in the game and appear on the same screen. Squint at each finished icon and make sure its OUTLINE is not close to any of the others listed in the table above; the outline is the only thing that survives at 14 pixels.

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



---

## C장 — 3칸

아직 안 들어왔습니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 최후의 발악 | 포자 감염 | 부식성 아우라 |
| id | `bp_burst` | `bp_spore` | `bp_corrode` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of 3 ICONS in one row, left to right. They are a matched set — same weight, same fill, same size within their cells.

The 3 cells, in this exact order:

Cell 1 — A SHAPE FLYING APART. FOUR thick solid WEDGES, all pointing OUTWARD from the centre of the cell — up-left, up-right, down-left, down-right — each with its blunt end toward the middle and its point at a corner, and an EMPTY BLACK CROSS-SHAPED GAP between them where the centre should be. The middle of this icon is empty; the mass is at the corners. It is the only icon that is hollow in the middle. Squint test: four wedges, nothing in the middle.
Cell 2 — A CLUB ON A STALK. One straight vertical BAR rising from the bottom edge to two-thirds height, a fifth of the cell wide, topped by one much wider solid OVAL head that overhangs the bar on both sides and reaches the top edge. It is a nail seen head-on from the side: thin below, heavy above. It must not sprout a second stalk — one only. Squint test: a mushroom.
Cell 3 — A SQUARE BEING EATEN. One solid square filling most of the cell, with its ENTIRE RIGHT EDGE eaten away into four deep square NOTCHES cut in from the right, like teeth taken out of it, each notch a fifth of the square deep. The left, top and bottom edges are perfectly straight and untouched. The asymmetry is the whole read — solid on one side, chewed on the other. Squint test: a square with a ragged right edge.

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

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 12 TO 16 PIXELS. That is smaller than the text next to it.
Everything below follows from that one fact.

- ONE SHAPE. The whole icon must read as a single silhouette at a glance. Not a
  scene, not an object sitting on a background, not two things next to each other.
- FILL THE CELL. The shape touches or nearly touches all four sides of its cell.
  An icon drawn small inside its cell disappears entirely when scaled down.
- SOLID, NOT OUTLINED. Draw it as a filled white mass. A hollow outline at 14px
  becomes a grey smudge, because the outline and the hole merge.
- NO INTERIOR DETAIL. No rivets, no wood grain, no gem facets, no shading, no
  highlights. If you can only see it at full size, it is noise.
- ONE NOTCH OR CUT-OUT AT MOST, and it must be at least a fifth of the width.
  Anything finer closes up.
- STRAIGHT AND CHUNKY. Thick strokes, hard angles, flat ends. Thin tapering lines
  vanish; a 1px point at full size is nothing at icon size.
- NO PERSPECTIVE. Flat and front-on, like a road sign. These are the only images
  in this game that are NOT drawn in three-quarter view.
- CENTRED and upright. Not tilted, not dynamic, not in motion — these sit next to
  text and a tilted icon looks like a mistake.

TEST: squint until the image is a blur. If you can still name it, it is right.
If it becomes a grey blob, the shape is too busy.

THEY MUST NOT BE CONFUSABLE — and not only with each other. These join 8 icons that already exist in the game and appear on the same screen. Squint at each finished icon and make sure its OUTLINE is not close to any of the others listed in the table above; the outline is the only thing that survives at 14 pixels.

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



---

## 슬라이서 설정

```json
{ "file": "bp-1.jpg", "name": "boss_passive", "expect": [4, 1],
  "labels": ["bp_thorn", "bp_viscous", "bp_rot", "bp_ward"] },
{ "file": "bp-2.jpg", "name": "boss_passive", "expect": [4, 1], "append": true,
  "labels": ["bp_split", "bp_shell", "bp_sting", "bp_hive"] },
{ "file": "bp-3.jpg", "name": "boss_passive", "expect": [3, 1], "append": true,
  "labels": ["bp_burst", "bp_spore", "bp_corrode"] }
```
