# 보스 패시브 로고

← [색인으로](BOSS_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-boss.py`.

패시브를 가진 우두머리가 **넷**입니다. 패시브는 껐다 켜지는 것이 아니라 싸우는
내내 걸려 있으므로, 화면 위쪽에 로고가 **계속** 떠 있어야 합니다.

이건 생물 그림이 아니라 **아이콘**입니다 — 쿼터뷰가 아니고, 12~16px 에서
읽혀야 하고, 규칙이 통째로 다릅니다.

## 넷의 윤곽이 겹치면 안 됩니다

12px 에서 안쪽은 없는 것과 같습니다. 그래서 넷을 **모양으로** 갈랐습니다 —

| 로고 | 우두머리 | 윤곽 |
|---|---|---|
| `bp_thorn` | b05 스피나투스 · 가시 갑옷 | A SPIKED BALL |
| `bp_viscous` | b10 슬러지누스 · 오염된 점성 | A HANGING FRINGE |
| `bp_rot` | b15 카다베라 · 부패의 오라 | A ROTTED THROUGH DISC |
| `bp_ward` | b20 실바누스 · 수호수의 가호 | A SHIELD-LEAF |

## 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 가시 갑옷 | 오염된 점성 | 부패의 오라 | 수호수의 가호 |
| id | `bp_thorn` | `bp_viscous` | `bp_rot` | `bp_ward` |

## 프롬프트

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
Cell 2 — A HANGING FRINGE. One solid horizontal bar across the TOP of the cell, full width and a fifth of the height, with THREE thick strands hanging straight down from it to different depths — the middle one reaching the bottom edge, the outer two stopping short at different heights. Each strand is as wide as the gaps between them and ends in a blunt flat cut, not a point. The whole thing is one connected solid mass hanging from the top. Squint test: a comb.
Cell 3 — A ROTTED THROUGH DISC. One solid circle filling the whole cell, with a single enormous ragged BITE eaten out of its right side — the bite is a third of the diameter deep and reaches nearly to the centre, with a coarse uneven edge of three or four big rounded scallops (not a clean crescent, and not fine serration). Everything else is solid fill. The circle must still read as a circle. Squint test: a circle with a chunk gone.
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

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels. These four are deliberately a STAR, a COMB, a BITTEN CIRCLE and a SHIELD; if any of them has drifted toward another, pull it back.

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

## 슬라이서 설정

```json
{ "file": "<파일명>", "name": "boss_passive", "expect": [4, 1],
  "labels": ["bp_thorn", "bp_viscous", "bp_rot", "bp_ward"] }
```
