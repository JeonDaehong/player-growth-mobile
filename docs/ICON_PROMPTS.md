# 아이콘 프롬프트

**이 파일은 자동 생성됩니다** — `python tools/gen-icon.py`.
고치려면 생성기의 `ROLES` · `SKILLS` · `TREE_*` 를 고치세요.

두 벌이 들어 있습니다. 둘 다 **한 장짜리 시트**이고 셀 크기가 같아서, 같은
설정으로 자릅니다.

| 벌 | 폴더 | 어디에 쓰나 |
|---|---|---|
| 전투 타입 4종 | `assets/sprites/role_icon/` | 파티 칸 · 캐릭터 창의 이름 옆 |
| 스킬 4종 (첫 기술) | `assets/sprites/skill_icon/` | 캐릭터 창의 스킬 목록 (`SkillPanel`) |
| 스킬 4종 (두 번째 기술) | `assets/sprites/skill_icon/` | 같은 목록의 아래쪽 |
| 스킬 트리 16종 (넷씩 네 장) | `assets/sprites/skill_icon/` | 스킬 트리 화면 (`SkillTreePopup`) |

## 12px 에서는 윤곽뿐입니다

이 아이콘들은 글자보다 작게 붙습니다. 그 크기에서 남는 것은 **바깥 모양
하나**뿐이라, 안쪽에 무엇을 그리든 회색 얼룩이 됩니다.

그래서 넷을 **윤곽으로** 갈랐습니다 —

| | 가르는 것 |
|---|---|
| 방패 | 위가 넓고 **아래가 뾰족하다** |
| 검 | **세로로 길고 좁다** — 넷 중 제일 홀쭉 |
| 활 | **굽었다** — 넷 중 유일한 곡선 |
| 십자 | **좌우위아래가 같다** — 넷 중 유일한 대칭 |

스킬 넷도 같은 식입니다 — 초승달(곡선 하나) · 아래로 꽂히는 쐐기(위아래로
갈린 덩어리) · 나란한 화살 셋(반복) · 십자와 빛살(대칭).

---

## 1. 전투 타입 (`role_icon`)

전투 타입은 넷입니다 — **탱커 · 근접 딜러 · 원거리 딜러 · 서포터**.
코드에서는 역할(`Role`)과 사거리(`Range`) 둘을 조합해 나옵니다
(`core/chars` 의 `battleTypeOf`).

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 탱커 | 근접 딜러 | 원거리 딜러 | 서포터 |
| id | `role_tank` | `role_melee` | `role_ranged` | `role_support` |

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

Cell 1 — A SHIELD. A broad heater shield — flat straight top edge, sides curving down and inward to a POINT at the bottom. It is the only icon that is wide at the top and pointed at the bottom, and that triangle-ish mass is what names it. Solid white, filled. No boss, no rim, no crest, no straps.
Cell 2 — A SWORD, blade upright, point at the TOP. A long straight blade taking about three quarters of the height, a short straight crossguard, and a stubby grip below it. It is the TALLEST AND NARROWEST of the four — that vertical bar is what names it. No fuller, no pommel jewel, no wrapping.
Cell 3 — A BOW, held upright, drawn. A thick C-SHAPED curve opening to the RIGHT, with a straight vertical string closing it, and one arrow lying horizontally across the middle pointing right. It is the only CURVED icon of the four. The curve must be thick enough to survive — draw the limb as a solid crescent, not a line. No nocks, no grip, no fletching detail beyond a single wedge.
Cell 4 — A PLUS SIGN — a thick equal-armed cross with flat ends, filling the cell. It is the only SYMMETRICAL icon of the four: the same left-right and top-bottom. The arms are as thick as a third of their length. Nothing else — no circle behind it, no glow, no rounded ends.

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "role_icon", "expect": [4, 1],
  "labels": ["role_tank", "role_melee", "role_ranged", "role_support"] }
```

---

## 2. 스킬 (`skill_icon`)

지금은 넷이지만 **늘어납니다.** 한 명이 기술을 여럿 가지게 되면 목록이 되고,
목록에서는 이름보다 아이콘이 먼저 읽힙니다.

기술 아이콘은 **무엇이 일어나는지**를 그립니다. 누가 쓰는지가 아닙니다 —
캐릭터 얼굴은 이미 옆에 있고, 12px 에서 사람은 얼룩이 됩니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 검기 | 도약 강타 | 화살비 | 기도 |
| id | `sk_wave` | `sk_leap` | `sk_rain` | `sk_heal` |

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

Cell 1 — A CRESCENT SLASH. One thick curved blade of energy, bulging on the outer edge and tapering at both tips, opening to the LEFT. It fills the cell corner to corner diagonally. Solid white. Nothing else in the cell — no sword, no person, no speed lines.
Cell 2 — AN IMPACT. A downward-pointing WEDGE in the upper half — the blow arriving — and beneath it a wide flat BURST of four or five thick spikes radiating out and up from a single point at the bottom. The bottom half is wider than the top. It reads as something landing hard. No axe, no person, no ground line.
Cell 3 — ARROWS FALLING. THREE arrows, parallel, pointing DOWN AND RIGHT at the same angle, evenly spaced across the cell, at three different lengths. Each is a thick straight shaft with a solid triangular head and a simple wedge for fletching. It is the only skill icon made of repeated separate shapes. No bow, no target, no arcs.
Cell 4 — LIGHT RISING. A thick PLUS SIGN in the middle, and around it four short straight rays pointing UP AND OUTWARD from behind it — two on each side, at different lengths. The rays must not touch the plus. It reads as a cross with light coming off it. No hands, no person, no circle.

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "skill_icon", "expect": [4, 1],
  "labels": ["sk_wave", "sk_leap", "sk_rain", "sk_heal"] }
```

---

## 스킬 아이콘 — 두 번째 기술 넷

넷이 두 번째 기술을 하나씩 갖습니다. 첫 기술은 자주 나가는 것이고, 이쪽은
**비싸고 때가 맞아야** 나갑니다 (`core/chars` 의 `SkillDef.cost`).

**첫 넷과도 안 겹쳐야 합니다.** 목록에서 여덟이 세로로 줄지어 뜨므로, 위아래로
닮은 것이 하나라도 있으면 목록이 안 읽힙니다.

| | 첫 기술 | 두 번째 기술 |
|---|---|---|
| 이졸데 | 검기 — 초승달 | 도발 — **퍼지는 호 셋** |
| 비앙카 | 강타 — 아래 쐐기와 폭발 | 화산 — **위로 솟는 기둥** |
| 리안느 | 화살비 — 나란한 화살 셋 | 광란 — **오른쪽 이중 갈매기** |
| 아녜스 | 기도 — 십자와 빛살 | 정화 — **그릇과 흩어지는 조각** |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 도발 | 화산 | 광란 | 정화 |
| id | `sk_taunt` | `sk_volcano` | `sk_frenzy` | `sk_purify` |

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

Cell 1 — A SHOUT SPREADING. THREE nested open ARCS, like ripples, all opening to the RIGHT and sharing one centre just off the left edge — smallest on the left, largest on the right, each a thick crescent band with a clear black gap between them. They must be OPEN arcs, not closed rings. It is the only icon in the set made of repeated curves. No mouth, no face, no horn, no lines.
Cell 2 — AN ERUPTION RISING. A wide flat solid BASE along the bottom edge, and from its centre one thick COLUMN shooting straight UP to the top of the cell, splitting near the top into two or three short tongues. The column is narrow where it leaves the base and swells as it rises. The whole mass grows UPWARD — nothing radiates sideways or downward. It is the only icon that is heavy at the bottom and reaching at the top. No mountain outline, no smoke, no sparks, no axe.
Cell 3 — A DOUBLE CHEVRON. TWO thick V shapes lying on their sides and pointing RIGHT, one behind the other with a black gap between them, like a fast forward symbol. Each arm is a quarter of the cell wide with flat square ends. Both point the same way and they are the same size. It is the only icon that points sideways. No arrow shaft, no bow, no motion lines.
Cell 4 — SOMETHING LIFTED AWAY. A thick open BOWL in the lower half — a half-ring, flat cut ends pointing up, like a wide U — and above it THREE separate small solid CHUNKS of different sizes drifting up and apart, none touching the bowl or each other. It reads as dirt leaving a cupped hand. It is the only icon with loose floating pieces. No hands, no cross, no sparkle stars.

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

같은 폴더에 **덧붙입니다** (`append`) — 첫 넷을 다시 뽑을 필요가 없습니다.

```json
{ "file": "<파일명>", "name": "skill_icon", "expect": [4, 1], "append": true,
  "labels": ["sk_taunt", "sk_volcano", "sk_frenzy", "sk_purify"] }
```

---

## 다시 뽑을 때

**너무 자잘하게 나왔을 때**

```
Too much detail. Redraw each icon as ONE SOLID FILLED SHAPE with no interior lines,
no shading and no small parts. Imagine it printed at 14 pixels wide: anything you
cannot see at that size must be deleted, and the main shape must grow to fill the
cell.
```

**속이 빈 윤곽으로 나왔을 때**

```
The icons are drawn as outlines. Fill them in — each icon is a solid white mass on
black, not a white line around a black interior.
```

**기울어져 나왔을 때**

```
Draw each icon flat, upright and front-on, centred in its cell. No tilt, no
perspective, no motion. These sit next to text.
```

---

## 이졸데 의 트리 (`skill_icon`)

스킬 트리가 여는 것들입니다 (`core/skillTree`). 넷이 **한 화면에 같이 뜨므로**(캐릭터 창) 그 넷끼리 안 닮는 것이 제일 중요합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 함성 | 수호의 결의 | 파쇄의 태세 | 수호신의 가호 | 성검 발현 |
| id | `sk_shout` | `sk_ward` | `sk_breaker` | `sk_aegis` | `sk_holysword` |

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

```json
{ "file": "<kg 파일명>", "name": "skill_icon", "expect": [5, 1],
  "labels": ["sk_shout", "sk_ward", "sk_breaker", "sk_aegis", "sk_holysword"] }
```

---

## 비앙카 의 트리 (`skill_icon`)

스킬 트리가 여는 것들입니다 (`core/skillTree`). 넷이 **한 화면에 같이 뜨므로**(캐릭터 창) 그 넷끼리 안 닮는 것이 제일 중요합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 용암 지대 | 불굴의 의지 | 과열 |
| id | `sk_lava` | `sk_resolve` | `sk_overheat` |

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

```json
{ "file": "<ba 파일명>", "name": "skill_icon", "expect": [3, 1],
  "labels": ["sk_lava", "sk_resolve", "sk_overheat"] }
```

---

## 리안느 의 트리 (`skill_icon`)

스킬 트리가 여는 것들입니다 (`core/skillTree`). 넷이 **한 화면에 같이 뜨므로**(캐릭터 창) 그 넷끼리 안 닮는 것이 제일 중요합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 강화된 화살 | 정령의 노래 | 거대 화살 | 요정의 축제 |
| id | `sk_sharparrow` | `sk_spiritsong` | `sk_bigshot` | `sk_fey` |

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

```json
{ "file": "<ea 파일명>", "name": "skill_icon", "expect": [4, 1],
  "labels": ["sk_sharparrow", "sk_spiritsong", "sk_bigshot", "sk_fey"] }
```

---

## 아녜스 의 트리 (`skill_icon`)

스킬 트리가 여는 것들입니다 (`core/skillTree`). 넷이 **한 화면에 같이 뜨므로**(캐릭터 창) 그 넷끼리 안 닮는 것이 제일 중요합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 신의 심판 | 정화의 손길 | 신의 천벌 | 찬란한 빛 |
| id | `sk_judge` | `sk_gentle` | `sk_wrath` | `sk_radiance` |

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

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

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

### 슬라이서 설정

```json
{ "file": "<nu 파일명>", "name": "skill_icon", "expect": [4, 1],
  "labels": ["sk_judge", "sk_gentle", "sk_wrath", "sk_radiance"] }
```
