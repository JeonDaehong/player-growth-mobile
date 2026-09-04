# 프롬프트 전부 — 위에서부터 복붙

**이 파일은 자동 생성됩니다** — `python tools/gen-all.py`.
원본을 고치려면 각 덩어리에 적힌 문서를 고치세요. 여기 것은 긁어 온 사본입니다.

아직 **안 들어온 것만** 있습니다. `assets/sprites/` 에 파일이 생기면 그
덩어리는 다음 실행에서 저절로 빠집니다.

## 쓰는 법

1. 아래 코드블록을 **통째로** 복사해서 Gemini 에 넣습니다. 스타일 지시와 시트
   규칙이 블록 안에 다 들어 있으니 앞뒤에 뭘 붙이지 마세요.
2. 받은 이미지를 `assets/new-image/` 에 넣습니다.
3. 그 덩어리의 **자르기** JSON 을 `tools/sprites.config.json` 에 한 줄
   더하고 `python tools/slice.py` 를 돌립니다.
4. 끝입니다. **코드는 안 고칩니다** — 화면이 폴더를 먼저 보고, 없을 때만
   지금의 임시 그림으로 떨어지게 해 뒀습니다.

## 지금 남은 것

1. **상태 로고 · 감전 한 칸** — 1칸 → `status_icon`

---
## 1. 상태 로고 · 감전 한 칸

| | |
|---|---|
| 칸 | 1 |
| 폴더 | `assets/sprites/status_icon/` |
| 원본 | `docs/STATUS_ICON_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 1 ICON in ONE row, left to right. One cell. Not more, not fewer, and not two rows — 1 cell in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 1 cell, in this exact order:

Cell 1 — AN UPSIDE-DOWN U. One thick arch touching the TOP edge of the cell and curving down into TWO STRAIGHT LEGS that run all the way to the BOTTOM edge, the legs a quarter of the cell wide and the black gap between them a third of the cell wide. Flat square feet. It is a staple stood on its head, or the two prongs of a plug. It is the ONLY closed-at-one-end, open-at-the-other shape in the whole set — everything else is a bar, a wedge, a ring or a zigzag. It must NOT be a lightning bolt: the stun icon already is one, and these two appear on the same party slots. Squint test: an upside-down U with two legs.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

IT MUST NOT LOOK LIKE THE OTHERS. This icon joins twelve that already exist; squint at it and make sure its outline is not close to any of them.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 1 column x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 1 cells.
- EVERY CELL MUST BE SQUARE. With a 1x1 grid that means the whole sheet is
  1:1 — output it at 512x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "status_icon", "expect": [1, 1],
  "labels": ["st_shock"] }
```
