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

1. **선물 로고 · 얽힌 것 일곱 (좋아하거나 싫어하는 사람이 있다)** — 7칸 → `gift_icon`
2. **선물 로고 · 아무나 줘도 되는 것 열하나** — 6×2칸 → `gift_icon`
3. **경험의 서 셋 — 같은 책이 세 단계로 자란다** — 3칸 → `item_icon`
4. **이야기 월페이퍼 — 네 사람 × 네 단계 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)

---
## 1. 선물 로고 · 얽힌 것 일곱 (좋아하거나 싫어하는 사람이 있다)

| | |
|---|---|
| 칸 | 7 |
| 폴더 | `assets/sprites/gift_icon/` |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A book cover with squiggles that read as writing is a failed output.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 7 ICONS in ONE row, left to right. Seven cells. Not eight, not six. Each cell holds a different object; do not repeat an object anywhere on the sheet.

Cell 1 — A ROUND COOKIE. One solid circle filling most of the cell. A BITE is taken out of its upper right edge: a clean crescent notch about a quarter of the circle's width, so the outline is not a plain circle. Scattered across the face, FOUR small solid dots of equal size, none touching the edge. No crumbs, no plate, no steam. Squint test: a circle with one chunk missing.

Cell 2 — A WEDGE OF PIE. A LOW WIDE TRAPEZOID sitting on the bottom edge — twice as wide as it is tall, its top edge slightly narrower than its base. Across the top face only, a LATTICE of three straight lines running one way and three the other, forming a coarse grid. The sides are plain and solid. Nothing above it. Squint test: a flat wide slab with a crosshatched top.

Cell 3 — A SLICE OF CARROT CAKE. A TALL UPRIGHT RECTANGLE, clearly taller than it is wide (about 2 wide to 3 tall), standing on the bottom edge. Across its face, TWO horizontal bands divide it into three layers of equal height. Sitting on top, centred, a small solid TRIANGLE pointing up — about a third of the cell wide — with two short lines rising from its flat top. No plate, no fork, no icing swirls. Squint test: a standing brick in three layers with a tiny cone on top.

Cell 4 — A CUT OF MEAT ON THE BONE. A long shape running diagonally from the lower left to the upper right. The lower two thirds is a THICK ROUNDED MASS. From its upper end a NARROW BONE continues, a fifth as thick as the mass, ending in a small knob at the upper right corner. One thin CURVED line inside the mass follows its edge, the only interior mark. No plate, no flames, no animal. Squint test: fat at one end, a thin stick with a knob at the other.

Cell 5 — A SINGLE FLOWER. Rising from the bottom edge, a straight vertical STEM one sixth of the cell wide, reaching to the middle of the cell. On the stem, one small solid LEAF pointing left. At the top, FIVE rounded PETALS arranged around a small solid centre dot, the whole head about half the cell wide. Exactly five petals, all the same size, evenly spaced. No pot, no sparkles, no second bloom.

Cell 6 — A CLOSED BOOK, FRONT ON, WITH A CROSS. A solid rectangle WIDER than it is tall (about 4 wide to 3 tall), centred. On its face, a plain CROSS: one vertical bar from the top edge to the bottom edge of the cover, a fifth of the cover's width, and one horizontal bar above the middle, half the cover's width. The cover is otherwise blank. A narrow band of PAGE EDGES runs down the right side, a sixth of the width. No clasp, no gem, no rays, no letters.

Cell 7 — A WOODEN HAND-BELL. A large solid ROUNDED MASS filling the lower two thirds of the cell — wider than tall, flattened on the bottom, with a single deep SLIT cut horizontally into its lower right side, a third of the mass wide. From the top of the mass, a straight HANDLE rises diagonally to the upper right corner, a sixth of the cell wide, ending square. No mallet, no sound lines, no rope.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Each icon must survive being shrunk to 16x16: one solid mass, one or two big notches,
  no hairline detail, no line finer than 2 pixels.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.

LAYOUT:
- One row of 7 equal square cells, edge to edge, no gutters, no frames, no borders.
- Each icon centred in its cell with a small margin of pure black around it.
- The sheet is 7 times as wide as it is tall.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "gift_icon", "expect": [7, 1],
  "labels": ["gf_cookie", "gf_pie", "gf_carrot", "gf_rabbit", "gf_flower", "gf_bible", "gf_gong"] }
```

---

## 2. 선물 로고 · 아무나 줘도 되는 것 열하나

| | |
|---|---|
| 칸 | 6 × 2 줄 |
| 폴더 | `assets/sprites/gift_icon/` |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 12 CELLS in TWO rows of SIX, left to right, top row first. Eleven of them hold an object; the LAST cell (bottom right) is empty solid black. Each object appears once; do not repeat an object anywhere on the sheet.

TOP ROW, left to right:

Cell 1 — A CUP OF TEA WITH STEAM. On the bottom half, a CUP: a solid U shape with thick walls, wider at the rim than at the base, about half the cell wide, standing on a thin flat SAUCER line slightly wider than the cup. Above the rim, floating clear with a visible GAP of black between them, TWO short WAVY LINES of steam, the taller one on the left. No handle, no leaves.

Cell 2 — A TALL ICED DRINK. A TALL NARROW TUMBLER filling most of the cell's height, straight-sided, slightly wider at the top than at the bottom, about a third of the cell wide. Inside the upper half, THREE small solid SQUARES of ice, tilted at different angles, not touching each other. A straight STRAW rises out of the rim and leans to the upper right, poking clear of the glass by a quarter of the cell. No condensation dots, no coaster.

Cell 3 — A LOAF OF BREAD. One fat solid OVAL lying on its side, wider than tall, its ends rounded. Across the top, THREE short parallel SLASHES cut at a diagonal, evenly spaced, each a fifth of the loaf's length. No basket, no crumbs, no knife.

Cell 4 — AN APPLE. One solid circle filling most of the cell, with a small NOTCH dimpled into the top centre. From that notch a short straight STEM rises, and one small pointed LEAF juts off it to the right. No bite taken out. No dots on the face. Squint test: a circle with a tiny sprout on top.

Cell 5 — A HONEY JAR. A POT that is widest at the bottom, pulls in to a narrow NECK about two thirds of the way up, then flares slightly to the rim. Sitting on the rim, a flat LID slightly wider than the neck, with a small knob on top. On the belly of the pot, ONE thick horizontal BAND. No dipper, no bees, no drips.

Cell 6 — A WEDGE OF CHEESE. A solid RIGHT TRIANGLE with the right angle at the lower left, its flat bottom on the cell's bottom edge and its vertical side on the left, the slope running down to the lower right. THREE round HOLES of different sizes are cut out of the mass, none touching the edges. No board, no knife.

BOTTOM ROW, left to right:

Cell 7 — A BOWL OF SOUP. A WIDE SHALLOW BOWL on the bottom half — much wider than it is deep, a flattened U with thick walls, nearly the full width of the cell. NO saucer under it. Above the rim, floating clear with a gap of black, ONE short WAVY LINE of steam, centred. Squint test: a wide flat dish with one squiggle over it.

Cell 8 — A WRAPPED CANDY. In the centre, one solid circle about half the cell wide. From its left and right sides, two small TWISTED WRAPPER ends flare outward like little triangles with notched outer edges, each a fifth of the cell wide. The three parts touch. Squint test: a bow tie with a fat middle.

Cell 9 — A RIBBON BOW. Two rounded LOOPS meeting at a small solid KNOT in the centre, one loop to the left and one to the right, each a third of the cell wide. Below the knot, two short TAILS hang down and out, ending in notched V tips. No box, no gift underneath.

Cell 10 — A CANDLE. A straight vertical COLUMN of constant width, a quarter of the cell wide, rising from the bottom edge to two thirds of the cell's height, its top cut flat. A short WICK line rises from the centre of that flat top, and above it a small solid TEARDROP FLAME, pointed at the top, about a fifth of the cell wide. The flame touches the wick. No holder, no melted wax runs.

Cell 11 — A MUSIC BOX. A LOW WIDE BOX sitting on the bottom edge, about twice as wide as it is tall, with a thin LID line across its top. On its right side, a small CRANK: a short horizontal arm ending in a round knob, sticking clear of the box by a sixth of the cell. On the lid, ONE small solid square inlay, centred. No notes, no sparkles, no ballerina.

Cell 12 — EMPTY. Solid pure black, nothing drawn at all.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Each icon must survive being shrunk to 16x16: one solid mass, one or two big notches,
  no hairline detail, no line finer than 2 pixels.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.

LAYOUT:
- Two rows of 6 equal square cells, edge to edge, no gutters, no frames, no borders.
- The last cell (bottom right) is empty black.
- Each icon centred in its cell with a small margin of pure black around it.
- The sheet is 3 times as wide as it is tall.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "gift_icon", "expect": [6, 2],
  "labels": ["gf_tea", "gf_ice", "gf_bread", "gf_apple", "gf_honey", "gf_cheese", "gf_soup", "gf_candy", "gf_ribbon", "gf_candle", "gf_music", "_skip"], "append": true }
```

---

## 3. 경험의 서 셋 — 같은 책이 세 단계로 자란다

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/item_icon/` |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A book cover with squiggles that read as writing is a failed output.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 3 ICONS in ONE row, left to right. Three cells. Not four, not two, and not two rows — three cells in one row. The three are THE SAME OBJECT AT THREE GRADES: a closed book seen from the front, lying slightly wider than it is tall. Each cell shows that book thicker and more ornate than the one before it. Do not draw three different objects.

Cell 1 — A PLAIN THIN BOOK. A solid rectangle filling the middle of the cell, clearly WIDER than it is tall (about 4 wide to 3 tall). Along its left edge, a narrow vertical SPINE strip one sixth of the width, separated from the cover by one straight vertical line. Along the right edge, a shallow stack of PAGES suggested by TWO short horizontal lines only. One CORNER of the cover — the lower right — is bitten off by a small triangular notch, so the book reads as worn. Nothing else. No clasp, no gem, no straps, no rays. No cross. Squint test: a fat horizontal brick with a stripe down its left side.

Cell 2 — THE SAME BOOK, THICKER, WITH ONE CLASP. Same wide rectangle and same left-edge spine strip, but the page stack on the right is now DEEPER — the body is noticeably taller than in cell 1 and the pages take a fifth of the width. No bitten corner; all four corners are square and whole. Crossing the right edge horizontally at the vertical middle, a small solid CLASP: a short bar that starts on the cover, crosses the page edge, and hooks around it — about a quarter of the cell wide and a tenth of the cell tall. Exactly ONE clasp. No gem, no glow, no cross. Squint test: the same brick, deeper, with one small tab sticking off its right side.

Cell 3 — THE SAME BOOK, THICKEST, WITH CLASP AND A FLOATING GEM. Same wide rectangle, same spine strip, and the deepest page stack of the three — the body fills most of the cell. The horizontal CLASP from cell 2 is there, unchanged, on the right edge. In addition: two short RAISED BANDS cross the spine strip horizontally, near its top and bottom, each a third of the spine's height — the only marks on the spine. Above the book, floating clear of it with a visible GAP of empty black between them, a small solid DIAMOND — a four-pointed rhombus about a sixth of the cell wide, centred over the book. The gap is the point: the gem does not touch the cover. No rays, no sparkles, no stars, no crown, no cross.

CONSISTENCY BETWEEN THE THREE CELLS:
- The book occupies the same footprint and the same centre in all three cells. Only the thickness of the page stack and the added parts change.
- The spine is always on the LEFT and the page edges always on the RIGHT.
- All three read as ONE object growing richer, not as three unrelated items.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Each icon must survive being shrunk to 16x16: one solid mass, one or two big notches,
  no hairline detail, no page lines finer than 2 pixels.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.

LAYOUT:
- One row of 3 equal square cells, edge to edge, no gutters, no frames, no borders.
- Each icon centred in its cell with a small margin of pure black around it.
- The sheet is 3 times as wide as it is tall.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "item_icon", "expect": [3, 1],
  "labels": ["book_old", "book_fine", "book_prime"] }
```

---

## 4. 이야기 월페이퍼 — 네 사람 × 네 단계 (한 장씩 따로 뽑습니다)

| | |
|---|---|
| 자르기 | **없음** |
| 넣는 곳 | assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. 넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요. |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

```
assets/wallpaper/knightgirl_awkward.jpg   이졸데 · 어색한 관계
assets/wallpaper/knightgirl_friend.jpg    이졸데 · 우정
assets/wallpaper/knightgirl_trust.jpg     이졸데 · 신뢰
assets/wallpaper/knightgirl_love.jpg      이졸데 · 애정
… bunnyaxe_* · elfarcher_* · nun_* 도 같은 넷씩
```

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- No caption bar, no name plate, no banner, no signature, no watermark.
- This includes English, Korean, numerals, runes, and fake alien script.

FORMAT: one single illustration, landscape, 16:9, filling the frame edge to edge.

CHARACTER — pick ONE:

ISOLDE, the knight:
A young woman in worn plate armour over a padded gambeson, a long surcoat to
the knee, hair tied back, a plain kite shield on her left arm and a straight
sword at her hip. Her face is calm and a little tired. No helmet.

BIANCA, the axe-wielder:
A cheerful young woman in a tavern server's dress with an apron, a kerchief
over her hair, sturdy boots, carrying a large single-bladed woodcutter's axe
over one shoulder as if it weighed nothing. Freckles. A wide grin.

RIANNE, the elf archer:
A slender elf with long pointed ears and long straight hair, in a light leather
jerkin and a hooded cloak of leaves, a longbow taller than she is in one hand
and a quiver at her hip. Calm, distant expression.

AGNES, the sister:
A young nun in a heavy habit and wimple, a plain wooden prayer-bead cord at her
waist, hands usually folded. No weapon of any kind. Downcast eyes, gentle face.

SCENE — pick ONE:

(A) AWKWARD — Full figure, seen from far off across an open yard at dusk.
    She is busy with her own gear, turned three-quarters away. A second figure
    is implied only by a long shadow entering from the frame's edge. She is
    NOT looking toward it. Wide empty ground between them.
(B) FRIENDSHIP — Knee-up, seen from the side. She is laughing quietly with her
    head turned to the left, looking at something outside the frame. Her weapon
    is set down beside her. Warm interior — a tavern hearth behind her.
(C) TRUST — Waist-up, facing the viewer straight on, standing at ease with her
    hands resting on her weapon. Behind her shoulder, the back of another
    figure's head and shoulder is visible at the frame's edge — they are
    standing back to back. Steady, level gaze. Night, a low fire lighting her
    from below.
(D) LOVE — Chest-up portrait, very close. She looks directly at the viewer,
    her outer layer loosened at the collar, hair let down. One hand is raised
    just into the bottom of the frame, palm open. Soft light from the left.
    Quiet, unguarded expression.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- All shading and all mid-tones done ONLY with 1-bit dithering patterns
  (checkerboard, 25%/50%/75% ordered dither).
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black with dithered forms. Subjects in pure white line and dither.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- The character must read clearly at 400px wide — no hairline detail on the face.
```
