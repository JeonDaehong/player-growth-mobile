# 보스 공격 이펙트

**이 파일은 자동 생성됩니다** — `python tools/gen-bossfx.py`.

보스 기술 중 **보스 시트에 못 그리는 것** 여덟입니다. 6판 페트로스가 던지는
바위, 3판 아시두스가 뱉는 산성 덩이, 20판 실바누스의 벼락 같은 것들입니다.

일곱은 몸에서 **떨어져 나오는** 것이고, 마지막 하나(`bfx_bind`)만 반대로
**아군 몸에 감기는** 것입니다.

## 왜 보스 시트에 안 그립니까

**자리가 다릅니다.** 바위는 보스 위가 아니라 **파티 머리 위**에 떨어집니다.
보스 스프라이트에 그려 넣으면 보스 옆에 붙은 장식이 되고, 정작 맞는 쪽에는
아무 일도 안 일어납니다.

**수명이 다릅니다.** 보스 시트의 칸은 자세 하나가 멈춰 있는 그림이고, 이건
나타났다 사라지는 것입니다. 한 시트에 섞으면 애니메이션 한 벌 안에 수명이
다른 두 가지가 들어갑니다.

그래서 보스 프롬프트마다 *"충격 자국·고리·갈라진 땅을 그리지 마라"* 고 못을
박아 두었습니다 ([`BOSS_ART_PROMPTS.md`](BOSS_ART_PROMPTS.md)). 그것들을
여기서 그립니다.

## 여덟뿐입니다

보스마다 하나씩 만들면 스무 벌인데, 실제로 필요한 것은 여덟입니다 — 가시는
5판과 11판이 같이 쓰고, 포자는 4판과 14판이 같이 씁니다. 상태 로고와 같은
이유입니다: **맛이 아니라 하는 일로 묶습니다.**

나머지 열둘은 시트를 안 받습니다. 그어짐 · 찌르기 · 찍힘 · 솟구침 · 휘두름 ·
파동 · 사방으로 퍼지는 가시 · 해일이 그것인데, 전부 **"선 하나가 자란다 /
고리가 퍼진다"** 가 본질이라 도형이 오히려 낫습니다 — 2색 시트에는 옅음이
없어서 저것들을 그리면 흰 얼룩 몇 장이 됩니다
(`screens/home/BossFx` 머리말에 같은 이야기가 있습니다).

| 이펙트 | 무엇 | 칸 | 쓰는 보스 |
|---|---|---|---|
| `bfx_rock` | 떨어지는 암석 | 3칸 | 6판 페트로스 |
| `bfx_thorn` | 날아가는 가시 | 3칸 | 5판 스피나투스 · 11판 아칸투스 |
| `bfx_glob` | 날아가는 산성 덩이 | 3칸 | 3판 아시두스 |
| `bfx_spore` | 퍼지는 포자 | 5칸 | 4판 스포리아 · 14판 콜룸나 |
| `bfx_drip` | 내리는 융해 액 | 5칸 | 8판 솔베누스 · 12판 네펜티아 |
| `bfx_miasma` | 피어오르는 부패 | 5칸 | 15판 카다베라 |
| `bfx_bolt` | 내리치는 벼락 | 5칸 | 20판 실바누스 |
| `bfx_bind` | 몸을 감는 덩굴 | 5칸 | 2판 플로라투스 · 13판 마트로나 |
| `bfx_cocoon` | 몸을 감는 거미줄 고치 | 5칸 | 25판 아라크네스 |

## 두 종류뿐입니다

| 종류 | 칸 | 무엇 |
|---|---|---|
| 날아가는 것 | 3칸 | 같은 것이 화면을 가로지르다 사라집니다. 움직이는 것은 게임이 합니다 — 세 칸은 **경로가 아니라 수명**입니다 |
| 터지는 것 | 5칸 | 한 자리에서 피었다 집니다. 3번 칸이 제일 크고, 그 칸이 실제로 보이는 그림입니다 |

`bfx_bind` 만 **터지는 것인데 속이 비어 있어야** 합니다. 다른 일곱은 빈 곳에
뜨지만 저건 아군 몸 **위에** 뜨므로, 가운데가 찬 그림이면 감긴 사람이 안
보입니다. 프롬프트에 그 한 줄을 따로 박아 뒀습니다.

## 안 만든 것

- **관통 · 방어 무시** 자체 — 그림이 없습니다. 방어를 뚫는다는 것은 숫자에만
  있는 일이라 그릴 것이 없고, 9판 오세우스와 18판 스피노사는 몸이 직접 뻗는
  기술이라 날아가는 것도 없습니다. (11판 아칸투스는 가시가 실제로 날아가므로
  `bfx_thorn` 을 씁니다.)
- **17판 카부스의 공허한 울림** — 소리라 형체가 없습니다. 기존 `fx/glow_1~5`
  (퍼지는 고리)를 쓰면 됩니다.
- **1·7·10·16·18·19판** — 전부 몸이 직접 닿는 기술이라 따로 날아가는 것이
  없습니다. 화면에서는 도형으로 그립니다 (`screens/home/BossFx`).

`2·13판`은 이 목록에서 빠져 있었는데, 저 둘은 날아가는 것이 없는 대신
**아군 몸에 감기는** 것이 있어야 했습니다 — 13판 속박의 덩굴은 행동 불가를
거는 기술이라, 묶인 그림이 없으면 왜 안 움직이는지가 화면에서 설명되지
않습니다. `bfx_bind` 가 그 자리입니다.

---

## 떨어지는 암석 — `bfx_rock`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_rock/` |
| 종류 | 날아가는 것 (3칸) |
| 쓰는 보스 | 6판 페트로스 |

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 나감 | 갈라짐 | 사라짐 |
| id | `1` | `2` | `3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame effect sheet in one row, left to right. It is ONE effect shown at 3 moments in time, not 3 different pictures.

The 3 cells, in this exact order:

Cell 1 — A FALLING BOULDER — angular, not round. One solid rock with six or seven FLAT STRAIGHT FACETS meeting at hard corners, clearly wider than it is tall, tilted well off level so it reads as tumbling rather than sitting. Two short straight lines trail from its upper corners.
Cell 2 — The same boulder, still whole and the same size, now steeper in its tilt, with TWO small chips broken off its trailing edge and hanging just behind it.
Cell 3 — Broken. FOUR angular fragments of clearly different sizes, spread wider than the original boulder was, no two the same shape, none of them round. The largest is a third of the original. Nothing whole is left.

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

THE 3 CELLS ARE ONE THING TRAVELLING AND DYING.

The game moves this across the screen itself; the three cells are its LIFE, not
its path. Do not draw the same picture three times and do not draw three
different objects.

- Cell 1 — whole, solid, at its densest. This is what it looks like the moment it
  leaves the boss.
- Cell 2 — the same object, still clearly the same shape and size, but beginning
  to come apart: one or two pieces have separated and trail behind it.
- Cell 3 — mostly gone. A third of the mass at most, broken into three or four
  separate fragments, spread wider than the original outline.

The silhouette in cell 1 is the one the player actually reads. Make that one
count.

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
{ "file": "<파일명>", "name": "bfx_rock", "expect": [3, 1],
  "labels": ["1", "2", "3"] }
```

---

## 날아가는 가시 — `bfx_thorn`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_thorn/` |
| 종류 | 날아가는 것 (3칸) |
| 쓰는 보스 | 5판 스피나투스 · 11판 아칸투스 |

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 나감 | 갈라짐 | 사라짐 |
| id | `1` | `2` | `3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame effect sheet in one row, left to right. It is ONE effect shown at 3 moments in time, not 3 different pictures.

The 3 cells, in this exact order:

Cell 1 — A THROWN SPIKE. One long straight thorn, thick at the base and tapering to a hard point, three times as long as it is wide, lying at a shallow angle with the point leading. It is one clean solid wedge with no barbs and no curve.
Cell 2 — The same spike, same length, now with a HAIRLINE SPLIT running back from the base and one small sliver separated and trailing behind it.
Cell 3 — Shattered. THREE short slivers of different lengths, all still pointed, spread apart and no longer aligned with each other. Together they are half the mass of cell 1.

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

THE 3 CELLS ARE ONE THING TRAVELLING AND DYING.

The game moves this across the screen itself; the three cells are its LIFE, not
its path. Do not draw the same picture three times and do not draw three
different objects.

- Cell 1 — whole, solid, at its densest. This is what it looks like the moment it
  leaves the boss.
- Cell 2 — the same object, still clearly the same shape and size, but beginning
  to come apart: one or two pieces have separated and trail behind it.
- Cell 3 — mostly gone. A third of the mass at most, broken into three or four
  separate fragments, spread wider than the original outline.

The silhouette in cell 1 is the one the player actually reads. Make that one
count.

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
{ "file": "<파일명>", "name": "bfx_thorn", "expect": [3, 1],
  "labels": ["1", "2", "3"] }
```

---

## 날아가는 산성 덩이 — `bfx_glob`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_glob/` |
| 종류 | 날아가는 것 (3칸) |
| 쓰는 보스 | 3판 아시두스 |

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 나감 | 갈라짐 | 사라짐 |
| id | `1` | `2` | `3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame effect sheet in one row, left to right. It is ONE effect shown at 3 moments in time, not 3 different pictures.

The 3 cells, in this exact order:

Cell 1 — A THROWN GLOB. One heavy blob, wider at the front than the back and drawn out into a short tail behind — the shape of something thrown hard. Its outline BULGES unevenly, no two curves the same, and TWO small beads have already separated and hang just behind the tail.
Cell 2 — The same glob, same size, now sagging out of shape: the front has flattened and spread sideways, and FOUR beads trail behind it in a loose line.
Cell 3 — Coming apart. FIVE separate beads of different sizes with no main mass left at all, spread across a width twice the original glob. This is the only one of the three travelling effects that ends as many small round pieces rather than sharp fragments.

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

THE 3 CELLS ARE ONE THING TRAVELLING AND DYING.

The game moves this across the screen itself; the three cells are its LIFE, not
its path. Do not draw the same picture three times and do not draw three
different objects.

- Cell 1 — whole, solid, at its densest. This is what it looks like the moment it
  leaves the boss.
- Cell 2 — the same object, still clearly the same shape and size, but beginning
  to come apart: one or two pieces have separated and trail behind it.
- Cell 3 — mostly gone. A third of the mass at most, broken into three or four
  separate fragments, spread wider than the original outline.

The silhouette in cell 1 is the one the player actually reads. Make that one
count.

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
{ "file": "<파일명>", "name": "bfx_glob", "expect": [3, 1],
  "labels": ["1", "2", "3"] }
```

---

## 퍼지는 포자 — `bfx_spore`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_spore/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 보스 | 4판 스포리아 · 14판 콜룸나 |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 시작 | 커짐 | 절정 | 옅어짐 | 끝 |
| id | `1` | `2` | `3` | `4` | `5` |

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

Cell 1 — A tight knot of eight small round spores packed close together, no wider than a fist, all touching.
Cell 2 — The knot has opened to about twice that width. Around twenty spores now, still dense in the middle, a few beginning to separate at the edges.
Cell 3 — THE FULL BLOOM. A broad even CLOUD of forty or more round spores of two or three different sizes, filling most of the cell, densest at the centre and thinning evenly in every direction. It has NO direction of travel and NO edge you could draw a line along — a cloud, not a puff aimed anywhere.
Cell 4 — Wider than cell 3 but much thinner. Around twenty-five spores, the middle now nearly empty so the cloud reads as a loose ring rather than a mass.
Cell 5 — Six spores left, far apart, near the outer edge of where the cloud was.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "bfx_spore", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---

## 내리는 융해 액 — `bfx_drip`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_drip/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 보스 | 8판 솔베누스 · 12판 네펜티아 |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 시작 | 커짐 | 절정 | 옅어짐 | 끝 |
| id | `1` | `2` | `3` | `4` | `5` |

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

Cell 1 — Three short heavy drops hanging at the TOP of the cell, each with a rounded bottom and a thick neck, not yet fallen.
Cell 2 — The three have stretched down into long streaks reaching a third of the way down, each still ending in a heavy bead, and three more drops have formed above them.
Cell 3 — THE FULL CURTAIN. Nine or ten streaks of clearly different lengths hanging from the top of the cell to different depths — the longest reaching four-fifths of the way down, the shortest a quarter — each one thick, straight and ending in a heavy rounded bead. They are evenly spaced across the full width. NOTHING reaches the bottom edge and nothing pools: this is liquid in the air, never liquid on a floor.
Cell 4 — The streaks have broken. Their upper halves are gone and what is left is twelve separate beads of different sizes at different heights, still roughly in the columns the streaks came down.
Cell 5 — Four beads left, low in the cell, well apart, small.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "bfx_drip", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---

## 피어오르는 부패 — `bfx_miasma`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_miasma/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 보스 | 15판 카다베라 |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 시작 | 커짐 | 절정 | 옅어짐 | 끝 |
| id | `1` | `2` | `3` | `4` | `5` |

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

Cell 1 — A low flat smear along the BOTTOM of the cell, wide and only a few pixels tall, with a ragged upper edge.
Cell 2 — The smear has swelled upward into three squat lobes of different heights, still connected along the bottom.
Cell 3 — THE FULL HAZE. A heavy irregular mass rising from the bottom edge to three-quarters of the cell height, WIDER AT THE TOP THAN AT THE BOTTOM so it overhangs — the opposite shape to the spore cloud, which is widest in the middle. Its upper edge is broken into five or six rounded billows of different sizes; its interior is solid white with four or five dark holes through it. It never leaves the bottom of the cell.
Cell 4 — The mass has torn into three separate billows that have lifted clear of the bottom edge, each with holes through it, drifting apart.
Cell 5 — Two thin ragged wisps high in the cell, small, mostly holes.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "bfx_miasma", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---

## 내리치는 벼락 — `bfx_bolt`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_bolt/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 보스 | 20판 실바누스 |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 시작 | 커짐 | 절정 | 옅어짐 | 끝 |
| id | `1` | `2` | `3` | `4` | `5` |

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

Cell 1 — A single short jagged spark high at the TOP of the cell, no longer than a fifth of the height, with two hard right-angle bends in it.
Cell 2 — It has grown downward into a zigzag reaching halfway down the cell, one clean line, three bends, no branches yet.
Cell 3 — THE FULL STRIKE. One thick bolt running the ENTIRE height of the cell from top edge to bottom edge, with five or six hard right-angle bends and THREE shorter branches breaking off it at sharp angles — the branches stop in mid air and do not reach any edge. Every segment is straight with square-cut ends; there is no curve, no taper, and no glow anywhere in this effect. It is the brightest and hardest-edged cell in this whole document.
Cell 4 — The main bolt has broken into four separate straight segments still roughly in line, the branches gone, the gaps between segments as wide as the segments themselves.
Cell 5 — Two short straight segments left, far apart, one near the top and one near the bottom of where the bolt was.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "bfx_bolt", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---

## 몸을 감는 덩굴 — `bfx_bind`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_bind/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 보스 | 2판 플로라투스 · 13판 마트로나 |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 시작 | 커짐 | 절정 | 옅어짐 | 끝 |
| id | `1` | `2` | `3` | `4` | `5` |

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

Cell 1 — A single loose vine entering from the RIGHT edge, hanging slack in one wide lazy curve across the middle of the cell, both ends open. It touches nothing and encircles nothing yet.
Cell 2 — The vine has doubled back on itself once, forming ONE open loop in the middle of the cell with the slack pulled most of the way out. Three short barbs now show along its length.
Cell 3 — THE FULL BINDING. THREE horizontal coils stacked one above another, evenly spaced, each a closed flattened ring seen edge-on so it reads as wrapping AROUND something rather than lying flat. They are drawn TAUT — every curve is tight, nothing sags. The middle coil is the widest, the top and bottom ones narrower, so the three together describe a barrel shape. Short hard barbs bristle outward all along them. The CENTRE OF EVERY COIL IS EMPTY: this effect is drawn over a character, so anything filled in the middle hides the person it is binding. This is the only effect in this document that must read as a hollow shape.
Cell 4 — The three coils have gone slack and lost their alignment — each has sagged into a different open curve, no longer stacked, the barrel shape gone. Still three separate lengths of vine.
Cell 5 — Two short curled fragments of vine left, far apart, drifting down and away from where the coils were. No loop closed.

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "bfx_bind", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---

## 몸을 감는 거미줄 고치 — `bfx_cocoon`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/bfx_cocoon/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 보스 | 25판 아라크네스 |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 시작 | 커짐 | 절정 | 옅어짐 | 끝 |
| id | `1` | `2` | `3` | `4` | `5` |

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

### 슬라이서 설정

```json
{ "file": "<파일명>", "name": "bfx_cocoon", "expect": [5, 1],
  "labels": ["1", "2", "3", "4", "5"] }
```

---
