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

1. **UI 문 아이콘 · 위 띠 여섯** — 6칸 → `nav_top`
2. **UI 문 아이콘 · 아래 띠 다섯** — 5칸 → `nav_bot`
3. **보물 상자와 다이아** — 2칸 → `coin_ui`
4. **별 셋 — 빈 별 · 찬 별 · 각성한 별** — 3칸 → `growth`
5. **등급 표식 다섯 — 일반부터 신화까지** — 5칸 → `rarity`
6. **조각과 강성의 영약** — 2칸 → `growth`
7. **거미줄 고치 — 25판 포식의 거미줄** — 5칸 → `bfx_cocoon`
8. **30판 우두머리 바알 — 다시 뽑습니다 (시트가 이미 있지만 프롬프트를 고쳤습니다)** — 5칸 → `b30_baal`
9. **스킬 로고 · 이졸데 트리 다섯** — 5칸 → `skill_icon`
10. **스킬 로고 · 비앙카 트리 셋** — 3칸 → `skill_icon`
11. **스킬 로고 · 리안느 트리 넷** — 4칸 → `skill_icon`
12. **스킬 로고 · 아녜스 트리 넷** — 4칸 → `skill_icon`
13. **상태 로고 넷 — 집중 · 보호 · 흡혈 · 요정** — 4칸 → `status_icon`
14. **이졸데 세 번째 동작 — 성검 발현** — 3칸 → `knightgirl`
15. **비앙카 세 번째 동작 — 불굴의 의지** — 3칸 → `bunnyaxe`
16. **리안느 세 번째 동작 — 거대 화살** — 3칸 → `elfarcher`
17. **용 모양 거대 화살** — 3칸 → `elfarcher_dragon`

---
## 1. UI 문 아이콘 · 위 띠 여섯

| | |
|---|---|
| 칸 | 6 |
| 폴더 | `assets/sprites/nav_top/` |
| 원본 | `docs/UI_SHELL_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 6 ICONS in ONE row, left to right. Six cells.
Not seven, not five, and not two rows. Do not repeat an icon anywhere on the sheet
and do not add variants of one.

The 6 cells, in this exact order:

Cell 1 — A TROPHY CUP, outlined. A wide bowl with a flat straight top rim,
narrowing downward to a short stem that sits on a wide flat base bar. From each
side of the bowl a HANDLE loops outward — a small squared-off C shape standing
clear of the body with black between it and the bowl. It is the only icon with
parts sticking out to the left and right. Squint test: a cup with two ears.

Cell 2 — A CALENDAR, outlined. An upright rounded-square frame filling the cell,
with TWO SHORT POSTS standing up from its top edge (the rings), and one horizontal
rule across the frame a quarter of the way down separating the header from the
body. Inside the body, TWO rows of two short dashes each — the dates. It is the
only icon with two small posts standing on top of it. Squint test: a box with two
little legs on its head.

Cell 3 — A WIDE ENVELOPE lying on its side, outlined. A rectangle spanning the
full width of the cell and about two thirds of its height, with a V-shaped fold
line drawn INSIDE it running from the two top corners down to the middle of the
body — the flap, drawn as a line, not as a cut. It is the only icon clearly wider
than it is tall. Squint test: a flat rectangle with a V inside its top.

Cell 4 — A GIFT BOX, outlined. A square box, one horizontal rule across it a third
of the way down (the lid seam), and one vertical rule from that seam to the bottom
edge (the ribbon). Standing up from the top edge are TWO short angled ears — the
bow, drawn as two small open triangles, not loops. It is the only icon with two
ears leaning apart at the top. Squint test: a box with a cross on it and two ears.

Cell 5 — A DOCUMENT, outlined. An upright rounded-rectangle frame filling the
cell, with THREE horizontal rules inside it, evenly spaced, each running most of
the width — except the LAST one, which is only half as long. It is the only icon
whose inside is nothing but horizontal lines. Squint test: a page of writing.

Cell 6 — A GEAR, outlined. A thick RING with an EMPTY BLACK hole in the middle a
third of the cell wide, and EIGHT square teeth standing out from its rim, evenly
spaced, each a seventh of the cell wide and sticking out a twelfth of the cell.
The teeth are chunky blocks, not spikes. It is the only icon with a bumpy outer
edge. Squint test: a lumpy ring with a hole.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in solid pure white.
- NEVER put a white or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no borders around the whole image.

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 18 TO 24 PIXELS. Everything below follows from that one fact.

- ONE SHAPE. The whole icon reads as a single silhouette at a glance.
- FILL THE CELL. The shape nearly touches all four sides, with a margin of about
  one twelfth of the cell left empty all the way around.
- OUTLINED, NOT SOLID. Draw the shape as a BAND of solid white about one eighth
  of the cell wide, with EMPTY BLACK inside it. This is the rule that makes the
  eleven look like one set. A filled shape at this size is a black-and-white blob;
  an outline keeps its form.
- THE STROKE IS THE SAME WIDTH EVERYWHERE, on every icon in the sheet. Do not
  taper, do not thin a line to fit — if a shape needs a thinner line to work,
  simplify the shape instead.
- INTERIOR MARKS ONLY WHERE THEY MEAN SOMETHING. The helmet's eye slit, the
  castle's gate, the envelope's fold, the document's three text rules. At most
  three, each at least a sixth of the cell long. No rivets, no shading, no
  highlights, no texture.
- STRAIGHT AND CHUNKY. Hard angles, flat ends. Curves only where the object is
  genuinely round.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright. These sit in a row of six and a tilted one looks broken.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

THEY ALL WEIGH THE SAME. Same stroke width, same amount of white on screen.
Nothing in the drawing says which is important — the interface says that with
brightness and size, not with the artwork.

THEY MUST NOT BE CONFUSABLE. Put the 6 finished icons side by side and squint until
they blur. If any two have a similar outline, redraw the weaker one.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 6 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right.
- Do not add extra rows of variants. Exactly 1 row, exactly 6 cells.
- EVERY CELL MUST BE SQUARE. With a 6x1 grid that means the whole sheet is
  6:1 — output it at 3072x512.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "nav_top", "expect": [6, 1],
  "labels": ["rank", "event", "mail", "gift", "mission", "config"] }
```

---

## 2. UI 문 아이콘 · 아래 띠 다섯

| | |
|---|---|
| 칸 | 5 |
| 폴더 | `assets/sprites/nav_bot/` |
| 원본 | `docs/UI_SHELL_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 5 ICONS in ONE row, left to right. Five cells.

The 5 cells, in this exact order:

Cell 1 — A HELMET, outlined. A tall dome closed at the bottom into a chin guard,
its outline running: round over the top, straight down both sides, then curving
inward at the bottom to a narrow flat chin. Across the middle, ONE horizontal bar
of SOLID WHITE — the eye slit, the only filled mass in this cell and the thing
that turns the dome into a face. It is the only icon with a solid bar across its
middle. Squint test: a dome with a stripe.

Cell 2 — A BAG, outlined. A rounded rectangle occupying the lower three quarters
of the cell, with a thin ARCH standing on top of it — the handle, an upside-down U
a quarter of the cell tall, open at the bottom, its two feet planted on the top
edge of the body, with black visible through the arch. Inside the body, one short
horizontal dash in the centre — the clasp. No buckles, no pockets, no straps. It
is the only icon with a small open arch standing on a big shape. Squint test: a
bag with a handle.

Cell 3 — A CASTLE, outlined. A wide rectangular wall filling most of the cell,
its TOP EDGE cut into THREE square merlons with two square gaps between them —
battlements. Set into the bottom of the wall, centred, an ARCHED GATE drawn as an
outline: two straight jambs rising to a round top, open to the bottom edge. No
roof, no windows, no flag. It is the only icon whose top edge is a square-toothed
line. Squint test: a wall with three teeth and a doorway.

Cell 4 — A FLAG, outlined. One thick UPRIGHT POLE of SOLID WHITE running the full
height of the cell along the LEFT sixth — the only solid mass in this cell. From
the top of the pole, a banner drawn as an outline reaches RIGHT to the cell edge
and occupies the upper third, its bottom edge stepping back to the pole. The lower
two thirds of the cell hold nothing but the pole. It is the only icon that is
heavy on one side and empty on the other. Squint test: a flag on a pole.

Cell 5 — FOUR SQUARES, outlined. Four identical small square frames in a 2x2
arrangement filling the cell, each about two fifths of the cell wide, hollow, with
a gap of empty black between them a fifth of the cell wide. All four exactly the
same. It is the only icon made of repeated identical parts. Squint test: four
little boxes.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in solid pure white.
- NEVER put a white or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no borders around the whole image.

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 18 TO 24 PIXELS. Everything below follows from that one fact.

- ONE SHAPE. The whole icon reads as a single silhouette at a glance.
- FILL THE CELL. The shape nearly touches all four sides, with a margin of about
  one twelfth of the cell left empty all the way around.
- OUTLINED, NOT SOLID. Draw the shape as a BAND of solid white about one eighth
  of the cell wide, with EMPTY BLACK inside it. This is the rule that makes the
  eleven look like one set. A filled shape at this size is a black-and-white blob;
  an outline keeps its form.
- THE STROKE IS THE SAME WIDTH EVERYWHERE, on every icon in the sheet. Do not
  taper, do not thin a line to fit — if a shape needs a thinner line to work,
  simplify the shape instead.
- INTERIOR MARKS ONLY WHERE THEY MEAN SOMETHING. The helmet's eye slit, the
  castle's gate, the envelope's fold, the document's three text rules. At most
  three, each at least a sixth of the cell long. No rivets, no shading, no
  highlights, no texture.
- STRAIGHT AND CHUNKY. Hard angles, flat ends. Curves only where the object is
  genuinely round.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright. These sit in a row of six and a tilted one looks broken.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

THEY ALL WEIGH THE SAME. Same stroke width, same amount of white on screen.
Nothing in the drawing says which is important — the interface says that with
brightness and size, not with the artwork.

THEY MUST NOT BE CONFUSABLE. Put the 6 finished icons side by side and squint until
they blur. If any two have a similar outline, redraw the weaker one.

THEY MUST NOT BE CONFUSABLE — and they must also not resemble the six top-bar
icons (trophy / calendar / envelope / gift box / document / gear), which appear on
the same screen.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 5 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- EVERY CELL MUST BE SQUARE — the whole sheet is 5:1, output it at 2560x512.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "nav_bot", "expect": [5, 1],
  "labels": ["hero", "item", "main", "guild", "content"] }
```

---

## 3. 보물 상자와 다이아

| | |
|---|---|
| 칸 | 2 |
| 폴더 | `assets/sprites/coin_ui/` |
| 원본 | `docs/UI_SHELL_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 2 ICONS in ONE row, left to right.

Cell 1 — A CLOSED TREASURE CHEST, seen straight from the front. A solid rectangular
body filling the lower two thirds of the cell and the full width, and above it a
LID: a slightly wider solid band across the top third with a flat top. One
horizontal line of empty black, a tenth of the cell tall, separates lid from body —
that gap is the seam and it is the whole read. In the middle of the seam sits ONE
small solid square, the lock, a fifth of the cell wide, straddling the gap. Two
short vertical bands of empty black run down the body, a sixth of the cell in from
each side — the iron straps. Nothing else: no keyhole, no nails, no wood grain, no
sparkles. It is CLOSED. Squint test: a box with a lid line and a lock.

Cell 2 — A GEM. One solid shape filling the cell: a flat WIDE TOP edge across the
upper quarter, sides that spread out slightly to the widest point a third of the
way down, then two long straight edges running down to a single POINT at the bottom
edge. It is a cut stone seen head on — wide and blunt at the top, sharp at the
bottom. It must NOT be a symmetric diamond lozenge (that reads as a playing-card
suit) and must NOT have facet lines inside it. Squint test: a blunt-topped,
sharp-bottomed stone.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in solid pure white.
- NEVER put a white or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no borders around the whole image.

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 18 TO 24 PIXELS. Everything below follows from that one fact.

- ONE SHAPE. The whole icon reads as a single silhouette at a glance.
- FILL THE CELL. The shape nearly touches all four sides, with a margin of about
  one twelfth of the cell left empty all the way around.
- OUTLINED, NOT SOLID. Draw the shape as a BAND of solid white about one eighth
  of the cell wide, with EMPTY BLACK inside it. This is the rule that makes the
  eleven look like one set. A filled shape at this size is a black-and-white blob;
  an outline keeps its form.
- THE STROKE IS THE SAME WIDTH EVERYWHERE, on every icon in the sheet. Do not
  taper, do not thin a line to fit — if a shape needs a thinner line to work,
  simplify the shape instead.
- INTERIOR MARKS ONLY WHERE THEY MEAN SOMETHING. The helmet's eye slit, the
  castle's gate, the envelope's fold, the document's three text rules. At most
  three, each at least a sixth of the cell long. No rivets, no shading, no
  highlights, no texture.
- STRAIGHT AND CHUNKY. Hard angles, flat ends. Curves only where the object is
  genuinely round.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright. These sit in a row of six and a tilted one looks broken.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

THEY ALL WEIGH THE SAME. Same stroke width, same amount of white on screen.
Nothing in the drawing says which is important — the interface says that with
brightness and size, not with the artwork.

THEY MUST NOT BE CONFUSABLE. Put the 6 finished icons side by side and squint until
they blur. If any two have a similar outline, redraw the weaker one.

Note on size: these two are shown LARGER than the other eleven (the chest up to
24 pixels, the gem at 10) and they sit next to NUMBERS rather than next to each
other. So these two are the **exception to the outline rule** — draw them SOLID.
A hollow gem beside a gold figure reads as an empty slot; a solid one reads as a
coin. Everything else still follows the icon rules.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 2 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- EVERY CELL MUST BE SQUARE — the whole sheet is 2:1, output it at 1024x512.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "coin_ui", "expect": [2, 1],
  "labels": ["chest", "gem"] }
```

---

## 4. 별 셋 — 빈 별 · 찬 별 · 각성한 별

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/growth/` |
| 원본 | `docs/GROWTH_ART_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 3 ICONS in ONE row, left to right. Three cells.
Not four, not two, and not two rows. Each cell holds ONE five-pointed star and
nothing else. Do not add a fourth variant.

All three stars are THE SAME STAR at THE SAME SIZE in THE SAME POSITION — one
point straight up, four points spread evenly, centred, filling about 90% of the
cell. They differ ONLY in how they are filled and in cell 3's rays. If the three
stars are different sizes or sit at different heights, the output is a failure:
they are drawn side by side five at a time and any wobble reads as broken.

Make the star FAT. Each arm is at least a third of the star's radius wide where it
meets the body, and the notches between arms are shallow. A thin, spiky,
sharp-pointed star loses its points entirely at 10 pixels.

The 3 cells, in this exact order:

Cell 1 — HOLLOW STAR. The star's outline only, drawn as a band of solid white
about a sixth of the cell wide, with EMPTY BLACK inside. The hole in the middle is
big and obviously black — this cell must read as "empty" from across a room.

Cell 2 — SOLID STAR. The identical star, completely FILLED with solid white. No
inner line, no highlight, no facet, no core. One flat white mass.

Cell 3 — SOLID STAR WITH RAYS. The identical solid white star from cell 2, plus
FOUR short straight rays outside it — one going up-left, up-right, down-left,
down-right, into the four gaps between the star's arms. Each ray is a small
straight bar, half as long as a star arm and a third as thick, separated from the
star body by a thin gap of black so it reads as light coming off it, not as extra
points. Nothing else — no ring, no sparkle dots, no glow.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in solid pure white.
- NEVER put a white or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no borders around the whole image.

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 10 TO 14 PIXELS. Everything below follows from that one fact.

- ONE SHAPE. The whole icon reads as a single silhouette at a glance.
- FILL THE CELL. The shape nearly touches all four sides.
- NO INTERIOR DETAIL. No facets, no shading, no highlights, no gem cuts.
- STRAIGHT AND CHUNKY. Thick arms, hard angles, flat ends.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright. Five of these sit in a row and a tilted one looks broken.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right.
- EVERY CELL MUST BE SQUARE. With a 3x1 grid that means the whole sheet is
  3:1 — output it at 1536x512.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "growth", "expect": [3, 1],
  "labels": ["star_off", "star_on", "star_awake"] }
```

---

## 5. 등급 표식 다섯 — 일반부터 신화까지

| | |
|---|---|
| 칸 | 5 |
| 폴더 | `assets/sprites/rarity/` |
| 원본 | `docs/GROWTH_ART_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- No stars, no pips, no dots used as a counter. A cell containing even one
  letter-like or number-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 5 RANK CRESTS in ONE row, left to right. Five
cells. Not six, not four, and not two rows.

THIS SHEET BREAKS THE USUAL ICON RULE. Normally a set of icons must not resemble
each other. Here the opposite is required: these five are ONE crest that grows
more ornate from left to right, and a viewer must be able to tell which is higher
WITHOUT reading anything. Rank is shown by HOW MUCH IS ADDED, never by size and
never by shading.

THE SHARED BODY, identical in all five cells: a HEATER SHIELD — flat straight top
edge, straight sides going down, then curving inward to a single POINT at the
bottom. It stands upright, dead centre, and occupies the same 70% of every cell.
Drawn as a solid white outline band about a seventh of the shield's width, with
EMPTY BLACK inside. The shield is exactly the same size and position in all five
cells. If it grows or shifts between cells, the output is a failure.

Everything that differs is ADDED AROUND OR INSIDE that identical shield:

Cell 1 — The bare shield. Nothing added. Empty black inside.

Cell 2 — The shield, plus ONE THIN LINE running parallel to its outline just
inside it, following the same shape, separated from the outer band by a gap of
black. Two concentric shield bands. Nothing else.

Cell 3 — Everything in cell 2, plus TWO SHORT HORNS standing up from the shield's
top corners, angled outward, each about a fifth of the shield's height. Straight
tapered blocks, not curls.

Cell 4 — Everything in cell 3, plus A PAIR OF WINGS, one on each side, spreading
outward from the shield's upper flanks to the left and right cell edges. Draw each
wing as THREE stacked straight feather blocks stepping downward and outward — no
soft curves, no feather detail, no more than three blocks per side.

Cell 5 — Everything in cell 4, plus A CROWN OF RAYS above the horns: FIVE straight
spikes fanning upward and outward from the shield's top edge, the middle one
vertical and tallest, the outer ones shorter and slanted. Straight tapered bars,
evenly spaced. Nothing else — no orb, no halo ring, no gemstone.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in solid pure white.
- NEVER put a white or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no borders around the whole image.

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 11 TO 14 PIXELS. Everything below follows from that one fact.

- FILL THE CELL. Including its wings and rays, cell 5 nearly touches all four sides.
- NO INTERIOR DETAIL beyond what is listed. No rivets, no heraldry, no crosses,
  no shading, no highlights.
- STRAIGHT AND CHUNKY. Every added part is a thick straight block with flat ends.
  Nothing tapers to a hair — a one-pixel line disappears at this size.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 5 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right.
- EVERY CELL MUST BE SQUARE. With a 5x1 grid that means the whole sheet is
  5:1 — output it at 2560x512.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "rarity", "expect": [5, 1],
  "labels": ["common", "rare", "epic", "legendary", "mythic"] }
```

---

## 6. 조각과 강성의 영약

| | |
|---|---|
| 칸 | 2 |
| 폴더 | `assets/sprites/growth/` |
| 원본 | `docs/GROWTH_ART_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 2 ICONS in ONE row, left to right. Two cells.
Not three, not one, and not two rows.

The 2 cells, in this exact order:

Cell 1 — A SHARD OF CRYSTAL. One solid white IRREGULAR polygon, roughly a
lopsided triangle standing on one corner, taller than it is wide, with five or six
straight edges of clearly different lengths and no two angles alike. It leans
slightly. It is deliberately ASYMMETRICAL — that crooked outline is what says
"a piece broken off something bigger". One straight line of empty black cuts across
its upper third, a fifth of the shard wide, as a single facet. Nothing else — no
sparkle, no second piece, no glow.

Cell 2 — A POTION FLASK. A round-bottomed bulb filling the lower two thirds of the
cell, a straight NARROW NECK rising from it a third as wide as the bulb, and a flat
STOPPER block sitting on top wider than the neck. The bulb is filled solid white;
the neck and stopper are solid white too. One horizontal line of empty black
crosses the bulb near its top, a fifth of the bulb wide — the liquid line. It is
the only icon in this set that is narrow at the top and round at the bottom.
Nothing else — no bubbles, no cork texture, no label, no shine mark.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in solid pure white.
- NEVER put a white or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no borders around the whole image.

ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 11 PIXELS. Everything below follows from that one fact.

- ONE SHAPE. The whole icon reads as a single silhouette at a glance.
- FILL THE CELL. The shape nearly touches all four sides.
- SOLID, NOT OUTLINED. A hollow outline at 11px becomes a grey smudge.
- ONE CUT-OUT AT MOST, and it must be at least a fifth of the width.
- STRAIGHT AND CHUNKY. Thick strokes, hard angles, flat ends.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 2 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right.
- EVERY CELL MUST BE SQUARE. With a 2x1 grid that means the whole sheet is
  2:1 — output it at 1024x512.
```

### 자르기

```json
{ "file": "<받은 파일명>", "name": "growth", "expect": [2, 1],
  "labels": ["shard", "elixir"] }
```

---

## 7. 거미줄 고치 — 25판 포식의 거미줄

| | |
|---|---|
| 칸 | 5 |
| 폴더 | `assets/sprites/bfx_cocoon/` |
| 원본 | `docs/BOSS_FX_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 5-frame effect sheet in one row, left to right. It is ONE effect shown at 5 moments in time, not 5 different pictures.

The 5 cells, in this exact order:

Cell 1 — A few loose STRANDS of silk drifting in from the RIGHT edge — four or five straight thin lines, not parallel, crossing each other at shallow angles near the right side of the cell. They enclose nothing yet. Straight lines only: silk does not hang in curves the way a vine does.
Cell 2 — The strands have been thrown across the whole cell and caught on each other, forming an open irregular MESH of straight segments with wide gaps. A rough vertical oval is beginning to show in the middle where the strands are densest, but you can still see straight through it everywhere.
Cell 3 — THE FULL COCOON. One tall VERTICAL OVAL filling most of the cell, built entirely from straight silk segments crossing at angles — never a smooth outline, never a curve: the oval is described by dozens of short chords, so its edge is faceted and slightly ragged. The mesh is DENSE at the top and bottom ends of the oval and OPEN across the middle third. THE CENTRE OF THE OVAL IS EMPTY: this effect is drawn over a character, so a filled middle hides the person inside it. Anchor lines run from the four corners of the cell to the oval and are pulled taut. It must not look like the vine effect: no coils, no rings, no barbs, no wrapping bands going around — this is a net pulled tight into a shape.
Cell 4 — The mesh has torn. A ragged split runs down the middle of the oval, the two halves sagging outward, and half the anchor lines have snapped and hang loose. The oval no longer closes at the top.
Cell 5 — Four or five broken strands left, drifting apart and downward, each still straight. Nothing encloses anything.

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

IT IS NOT A CREATURE. IT IS A THING THAT HAPPENS.

Everything else drawn for this game is alive. This is not — it has no eyes, no
mouth, no face, and nothing that could be read as one. If any cell could be
mistaken for a small monster, it is wrong.

- WHITE ON PURE BLACK, 1-bit, no greys. The game composites this over the stage
  and the black becomes transparent.
- IT IS SEEN FOR ABOUT A THIRD OF A SECOND at roughly 40 to 60 pixels. Detail
  below that size is not merely wasted, it turns into grain that flickers.
- ONE SHAPE PER CELL, or a few clearly separated pieces. Not a spray of dots.
- NO GROUND, NO SHADOW, NO IMPACT RING, NO SPEED ARCS DRAWN AS SWOOSHES. If it
  is travelling, say so with the SHAPE — leaning, stretched, with two or three
  straight trailing lines at most.
- NO TEXT, NO FRAME, NO BORDER.

THE 5 CELLS ARE ONE EVENT PLAYING OUT IN ONE PLACE.

This does not travel. It appears where the party is standing, does its work, and
goes. The five cells are the whole of it, in order, and they are drawn at the same
scale from the same viewpoint.

- Cell 1 — the start. SMALL and tight. Whatever is coming has only just begun.
- Cell 2 — growing fast, still dense.
- Cell 3 — the largest and heaviest cell. This is the one the player actually
  sees, so it carries the whole read.
- Cell 4 — spreading and thinning, wider than cell 3 but far less solid.
- Cell 5 — nearly gone. Two or three faint remnants, well spread.

The centre of the event stays in the same place in all five cells. If it drifts,
the effect looks like it is sliding off the character it is supposed to be on.

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "bfx_cocoon", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---

## 8. 30판 우두머리 바알 — 다시 뽑습니다 (시트가 이미 있지만 프롬프트를 고쳤습니다)

| | |
|---|---|
| 칸 | 5 |
| 폴더 | `assets/sprites/b30_baal/` |
| 원본 | `docs/boss-art/b30_baal.md`  |

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "b30_baal", "expect": [5, 1],
  "labels": ["idle", "attack", "skill1", "skill2", "down"] }
```

---

## 9. 스킬 로고 · 이졸데 트리 다섯

| | |
|---|---|
| 칸 | 5 |
| 폴더 | `assets/sprites/skill_icon/` |
| 원본 | `docs/ICON_PROMPTS.md`  |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of 5 ICONS in one row, left to right. They are a matched set — same weight, same fill, same size within their cells.

The 5 cells, in this exact order:

Cell 1 — A SHOUT GOING OUT. TWO thick open ARCS opening to the RIGHT, sharing a centre just off the left edge, with a wide black gap between them — and a short straight BAR standing at that centre. Fewer arcs than the taunt icon and it has that bar; taunt has three arcs and nothing at the centre. Squint test: two curves leaving a post.
Cell 2 — A DOME OVER SOMETHING. One thick ARC spanning the full width of the cell, bulging UPWARD, its two ends reaching down to the bottom corners — a shield bubble seen from the side. Underneath it, centred, ONE small solid square sitting on the bottom edge, not touching the arc. It is the only icon that is a big curve sheltering a small mass. Squint test: an umbrella over a block.
Cell 3 — A CRACKED BLOCK. One solid RECTANGLE filling the middle of the cell, wider than tall, BROKEN by a single jagged black split running from its top edge to its bottom edge — three or four hard right-angle turns, no curves. The two halves are pushed slightly apart. It is the only icon that is one mass cut in two. Squint test: a brick split down the middle.
Cell 4 — A DOME WITH A THORN RING. The same wide upward-bulging ARC as the ward icon, spanning the cell — but ABOVE it, following its curve, FIVE short straight spikes stand outward, evenly spaced, separated from the arc by a thin black gap. Under the arc, nothing. It is the ward icon plus spikes and minus the block: the pair must read as "the same dome, now armed". Squint test: a spiked dome.
Cell 5 — A SWORD COMING DOWN. One long straight BLADE pointing DOWN, filling the height of the cell, with a short straight crossguard near the top and a stubby grip above it. Behind the grip, THREE short straight rays fan upward and outward. It is the only icon that is a long vertical bar with rays at its top. Squint test: a downward sword with light behind the hilt.

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

THEY MUST NOT BE CONFUSABLE. Put the 5 finished icons side by side and squint. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "skill_icon", "expect": [5, 1],
  "labels": ["sk_shout", "sk_ward", "sk_breaker", "sk_aegis", "sk_holysword"] }
```

---

## 10. 스킬 로고 · 비앙카 트리 셋

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/skill_icon/` |
| 원본 | `docs/ICON_PROMPTS.md`  |

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

Cell 1 — GROUND SPLIT AND BURNING. A wide flat BAND across the lower third of the cell — the ground — broken into three chunks by two jagged black cracks. Rising from each crack, one short thick TONGUE of flame reaching a third of the way up, each a different height. Nothing above them. It is the only icon whose mass is a broken horizontal band. Squint test: a cracked floor with flames.
Cell 2 — A FIST HELD UP. One solid BLOCK in the upper half, roughly square with one corner notched — the fist — and below it a thick straight BAR going down to the bottom edge, narrower than the block: the forearm. Around the block, THREE short straight marks standing off it at the top and both sides, not touching. It is the only icon that is a heavy top on a narrow stem. Squint test: a raised fist.
Cell 3 — TWO STRIKES, THE SECOND BIGGER. TWO crescent slashes side by side, both opening to the LEFT, parallel, at the same angle — the left one small and thin, the right one clearly LONGER AND THICKER, reaching further past the cell centre. A black gap separates them. It is the only icon made of the same shape twice at two sizes. Squint test: two slashes, one much bigger.

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

THEY MUST NOT BE CONFUSABLE. Put the 3 finished icons side by side and squint. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "skill_icon", "expect": [3, 1],
  "labels": ["sk_lava", "sk_resolve", "sk_overheat"] }
```

---

## 11. 스킬 로고 · 리안느 트리 넷

| | |
|---|---|
| 칸 | 4 |
| 폴더 | `assets/sprites/skill_icon/` |
| 원본 | `docs/ICON_PROMPTS.md`  |

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

Cell 1 — ONE ARROW, HEAVILY BARBED. A single thick straight SHAFT running corner to corner diagonally, pointing DOWN AND RIGHT, with a large solid triangular head — and along the shaft, THREE pairs of short barbs angled backward. It is one arrow, not three: the arrow-rain icon is three thin parallel arrows with plain shafts, this is one fat arrow with spikes on it. Squint test: a single barbed arrow.
Cell 2 — NOTES RISING. THREE small solid DIAMONDS in a rising line from the lower left to the upper right, each a fifth of the cell wide, evenly spaced with clear black between them — and from the highest one, TWO short straight rays going up and out. It is the only icon made of separate small shapes climbing a diagonal. Squint test: three dots going up, sparkling at the top.
Cell 3 — ONE HUGE ARROW, HORIZONTAL. A very thick straight SHAFT lying across the full width of the cell pointing LEFT, with a big solid triangular head taking a third of the length, and a wide double wedge of fletching at the tail. It is the FATTEST, most horizontal icon in the whole set — it must look heavy. Squint test: one big arrow lying flat.
Cell 4 — SMALL ARROWS SCATTERING. FOUR tiny arrows, each a short shaft with a small triangular head, pointing in FOUR different directions and spread to the four quarters of the cell, none touching. They are small — each about a third of the cell. It is the only icon whose parts point different ways. Squint test: four little darts going everywhere.

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

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "skill_icon", "expect": [4, 1],
  "labels": ["sk_sharparrow", "sk_spiritsong", "sk_bigshot", "sk_fey"] }
```

---

## 12. 스킬 로고 · 아녜스 트리 넷

| | |
|---|---|
| 칸 | 4 |
| 폴더 | `assets/sprites/skill_icon/` |
| 원본 | `docs/ICON_PROMPTS.md`  |

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

Cell 1 — A WEIGHT COMING DOWN. A wide flat solid BAR across the upper third of the cell, and from its underside THREE thick straight BEAMS reaching down to the bottom edge, evenly spaced, the middle one longest. It is the only icon that is a heavy lid with legs hanging from it. Squint test: a bar with three beams under it.
Cell 2 — AN OPEN HAND. One solid rounded BLOCK in the lower half — the palm — with THREE short thick FINGERS standing up from its top edge, evenly spaced, the middle one longest, and a stubby thumb angled off the left side. It is the only icon that is a mass with short stubs standing on it. Squint test: a simple hand, palm up.
Cell 3 — A BOLT STRIKING DOWN. One thick zigzag running the FULL HEIGHT of the cell from top edge to bottom edge, with THREE hard right-angle bends — every segment straight, square-cut ends, no taper and no curve. Nothing else in the cell. It is the only icon that is a single bent line crossing the whole cell. Squint test: a lightning bolt.
Cell 4 — A SUN OF STRAIGHT RAYS. One solid CIRCLE at the centre taking a third of the cell, and EIGHT straight rays radiating from it, evenly spaced all the way around, each separated from the circle by a thin black gap. All rays the same length. It is the only icon that is symmetrical in every direction. Squint test: a sun.

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

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "skill_icon", "expect": [4, 1],
  "labels": ["sk_judge", "sk_gentle", "sk_wrath", "sk_radiance"] }
```

---

## 13. 상태 로고 넷 — 집중 · 보호 · 흡혈 · 요정

| | |
|---|---|
| 칸 | 4 |
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

SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. Four cells. Not five, not six, and not two rows — four cells in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 4 cells, in this exact order:

Cell 1 — A NARROWING TARGET. TWO concentric SQUARE frames, one inside the other, both hollow, each frame a sixth of the cell wide, with a clear black gap between them — and at the exact centre one small SOLID square, a fifth of the cell. Nothing touches anything. It is the only icon made of nested frames. Squint test: a square target with a dot in it.
Cell 2 — A DOME OVER A LINE. One thick ARC spanning the full width of the cell, bulging UPWARD, its ends coming down to the left and right edges at mid-height — and beneath it, one straight horizontal BAR running the full width along the bottom third, not touching the arc. Empty black between them. It is the only icon that is a curve resting over a straight line. Squint test: an arch over a floor.
Cell 3 — A DROP GOING UP. One solid TEARDROP shape — round and fat at the BOTTOM, tapering to a point at the TOP — filling most of the cell, and above its point TWO short straight rays angled up and outward, not touching it. It is upside down compared to any normal droplet, and that is the whole read: something is being drawn upward. Squint test: an upward teardrop.
Cell 4 — THREE TINY DARTS. THREE very small arrows, each a short thick shaft with a solid triangular head, arranged around the cell pointing in three DIFFERENT directions — one up-right, one down-right, one left — none touching, each about a third of the cell long. It is the only status icon whose parts point different ways. Squint test: three little darts scattering.

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

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "status_icon", "expect": [4, 1],
  "labels": ["st_focus", "st_ward", "st_leech", "st_fey"] }
```

---

## 14. 이졸데 세 번째 동작 — 성검 발현

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/knightgirl/` |
| 원본 | `docs/MOTION_ART_PROMPTS.md`  |

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "knightgirl", "expect": [3, 1],
  "labels": ["sk3_1", "sk3_2", "sk3_3"] }
```

---

## 15. 비앙카 세 번째 동작 — 불굴의 의지

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/bunnyaxe/` |
| 원본 | `docs/MOTION_ART_PROMPTS.md`  |

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "bunnyaxe", "expect": [3, 1],
  "labels": ["sk3_1", "sk3_2", "sk3_3"] }
```

---

## 16. 리안느 세 번째 동작 — 거대 화살

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/elfarcher/` |
| 원본 | `docs/MOTION_ART_PROMPTS.md`  |

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "elfarcher", "expect": [3, 1],
  "labels": ["sk3_1", "sk3_2", "sk3_3"] }
```

---

## 17. 용 모양 거대 화살

| | |
|---|---|
| 칸 | 3 |
| 폴더 | `assets/sprites/elfarcher_dragon/` |
| 원본 | `docs/MOTION_ART_PROMPTS.md`  |

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

### 자르기

```json
{ "file": "<받은 파일명>", "name": "elfarcher_dragon", "expect": [3, 1],
  "labels": ["shot_1", "shot_2", "shot_3"] }
```
