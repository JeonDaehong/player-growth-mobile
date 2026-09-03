# UI 뼈대 로고

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 다른 로고 문서(`ICON_PROMPTS.md` ·
`STATUS_ICON_PROMPTS.md`)는 게임 수치에서 만들어지는데, 이 열셋은 수치가 아니라
**화면 구조**에서 나오므로 읽어 올 소스가 없습니다.

새 뼈대의 단추 열하나와 재화 둘입니다 (`screens/home/TopBar` ·
`BottomNav` · `RewardBar`).

| 시트 | 폴더 | 어디에 쓰나 | 칸 |
|---|---|---|---|
| A | `assets/sprites/nav_top/` | 위 띠의 문 여섯 | 6 |
| B | `assets/sprites/nav_bot/` | 아래 띠의 다섯 칸 | 5 |
| C | `assets/sprites/coin_ui/` | 보물 상자와 다이아 | 2 |

## 지금은 10x10 도트로 서 있습니다

한 번 **한글 두 글자**로 뒀다가 물렸습니다. 자리를 잡는 것이 먼저였고 자리는
글자로도 잡히지만, 다 세워 놓고 보니 열한 칸에 두 글자씩 적힌 화면은 띠가
아니라 **표**였습니다.

그래서 `ui/sprites` 의 `NAV` 에 열하나를 10x10 도트로 그려 넣었습니다. 아래
표의 "가르는 것" 을 그대로 지킨 것들입니다 — 트로피 · 별 · 봉투 · 리본 상자 ·
두루마리 · 톱니 · 투구 · 가방 · 성 · 깃발 · 격자.

**이 문서는 여전히 유효합니다.** 10x10 은 획이 두 칸뿐이라 안쪽 무늬를 거의
못 넣습니다 (트로피의 손잡이와 잔이 같은 굵기입니다). 아래 프롬프트로 받은
그림이 들어오면 `GATES` · `TABS` 의 `art` 가 가리키는 곳만 `Sprite` 로 갈면
되고, 자리와 크기는 안 건드려도 됩니다.

상자와 다이아는 8x8 도트입니다 (`ICONS.chest` · `ICONS.gem`). 저 둘은 **상자가
흔들리고 다이아가 값 옆에 붙는** 자리라 더 급했습니다.

## 열하나가 서로 안 닮아야 합니다

같은 띠에 여섯이 나란히 서고, 아래 띠의 다섯도 마찬가지입니다. 12~16px 에서
남는 것은 바깥 모양 하나뿐이라, 둘이 닮으면 **둘 다 못 읽습니다.**

| | 가르는 것 |
|---|---|
| 랭킹 | 높이가 다른 세 기둥 — 유일하게 **여러 덩어리가 나란히** |
| 이벤트 | 별 하나 — 유일하게 **뾰족한 갈래 다섯** |
| 우편 | 가로로 누운 봉투 — 유일하게 **가로로 긴 사각** |
| 선물 | 리본 묶인 상자 — 유일하게 **정사각을 십자가 가른다** |
| 미션 | 체크 표시 — 유일하게 **한 획으로 꺾인 선** |
| 설정 | 톱니바퀴 — 유일하게 **테두리가 오돌토돌** |
| 영웅 | 사람 흉상 — 유일하게 **동그라미 위 · 사다리꼴 아래** |
| 아이템 | 배낭 — 유일하게 **위에 손잡이가 달린 덩어리** |
| 메인 | 집 — 유일하게 **삼각 지붕 + 사각 몸통** |
| 길드 | 깃발 — 유일하게 **한쪽으로만 뻗은 천** |
| 컨텐츠 | 사각 넷 (2x2) — 유일하게 **똑같은 덩어리 넷** |

---

## A장 — 위 띠 여섯

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| | 랭킹 | 이벤트 | 우편 | 선물 | 미션 | 설정 |
| id | `rank` | `event` | `mail` | `gift` | `mission` | `config` |

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

Cell 1 — THREE UPRIGHT BARS of different heights standing side by side on the
bottom edge, each a quarter of the cell wide with a gap between them. The MIDDLE
bar is tallest and reaches the top edge; the left is medium; the right is shortest.
Flat square tops. It is the only icon in the set made of several separate masses
standing in a row. Squint test: three bars, tall one in the middle.

Cell 2 — A FIVE-POINTED STAR, solid, filling the cell, one point straight up and
the other four spread evenly. The arms are thick — a third of the star's radius at
their base — so nothing tapers to a hair. It is the only icon with radiating
points. Squint test: a star.

Cell 3 — A WIDE ENVELOPE lying on its side. One solid rectangle spanning the full
width of the cell and about two thirds of its height, with a single V-shaped notch
cut down from the TOP edge to the middle — the flap. Nothing else. It is the only
icon that is clearly wider than it is tall. Squint test: a flat rectangle with a V
in its top.

Cell 4 — A GIFT BOX. One solid square filling the cell, CUT by a vertical band and
a horizontal band of empty black, each a fifth of the cell wide, crossing at the
centre — the ribbon, drawn as gaps rather than lines. No bow, no loops. It is the
only icon that is a square divided into four equal parts. Squint test: a square
split by a cross.

Cell 5 — A CHECK MARK. One thick stroke, a fifth of the cell wide, going down and
right from the upper left to the low centre, then sharply up and right to the upper
right corner, ending well above where it started. Flat cut ends. Nothing around it,
no box, no circle. It is the only icon that is a single bent line. Squint test: a
tick.

Cell 6 — A GEAR. One thick ring filling the cell with an EMPTY BLACK hole in the
middle a third of the cell wide, and SIX square teeth standing out from its rim,
evenly spaced, each a sixth of the cell wide and sticking out a tenth of the cell.
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

IT WILL BE SHOWN AT 12 TO 16 PIXELS. Everything below follows from that one fact.

- ONE SHAPE. The whole icon reads as a single silhouette at a glance.
- FILL THE CELL. The shape touches or nearly touches all four sides.
- SOLID, NOT OUTLINED. A hollow outline at 14px becomes a grey smudge.
- NO INTERIOR DETAIL. No rivets, no facets, no shading, no highlights.
- ONE NOTCH OR CUT-OUT AT MOST, and it must be at least a fifth of the width.
- STRAIGHT AND CHUNKY. Thick strokes, hard angles, flat ends.
- NO PERSPECTIVE. Flat and front-on, like a road sign.
- CENTRED and upright. These sit in a row of six and a tilted one looks broken.

NO DITHERING. NO CHECKERBOARD. NO STIPPLING. Every edge is a HARD STEP between
solid white and solid black.

THEY ALL WEIGH THE SAME. Same stroke weight, same solid fill. Nothing in the
drawing says which is important.

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

---

## B장 — 아래 띠 다섯

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 영웅 | 아이템 | 메인 | 길드 | 컨텐츠 |
| id | `hero` | `item` | `main` | `guild` | `content` |

**A장과도 안 닮아야 합니다** — 같은 화면의 위아래에 같이 뜹니다.

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
(위 A장과 같습니다. 그대로 옮겨 붙이세요.)

SUBJECT: a single sheet of EXACTLY 5 ICONS in ONE row, left to right. Five cells.

The 5 cells, in this exact order:

Cell 1 — A BUST. One solid CIRCLE in the upper half of the cell (the head, a third
of the cell wide) with a wide solid TRAPEZOID below it (the shoulders), flat on the
bottom edge, narrow at the top, spanning most of the cell's width. A gap of empty
black separates head from shoulders. It is the only icon made of a round mass above
a flat mass. Squint test: a person's head and shoulders.

Cell 2 — A BACKPACK. One solid rounded rectangle filling most of the cell, with a
thin ARCH standing on top of it — a strap, an upside-down U a quarter of the cell
tall, open at the bottom, its two feet planted on the top edge of the body. No
buckles, no pockets. It is the only icon with a small handle standing on a big
mass. Squint test: a bag with a handle.

Cell 3 — A HOUSE. One solid TRIANGLE roof across the top of the cell, wider than
the body below it, sitting on a solid SQUARE that reaches the bottom edge. No door,
no windows, no chimney. It is the only icon that is a triangle stacked on a square.
Squint test: a house.

Cell 4 — A FLAG. One thick UPRIGHT POLE running the full height of the cell along
the LEFT third, and a solid mass of cloth attached to it reaching RIGHT to the cell
edge and occupying the upper half, its right side cut with one V notch. Everything
hangs to one side. It is the only icon that is heavy on one side and empty on the
other. Squint test: a flag on a pole.

Cell 5 — FOUR SQUARES. Four identical solid squares in a 2x2 arrangement filling
the cell, each a two-fifths of the cell wide, with a gap of empty black between
them a fifth of the cell wide. All four exactly the same. It is the only icon made
of repeated identical parts. Squint test: four blocks.

STYLE / ICON RULES / NO DITHERING / THEY ALL WEIGH THE SAME:
(위 A장과 같습니다. 그대로 옮겨 붙이세요.)

THEY MUST NOT BE CONFUSABLE — and they must also not resemble the six top-bar icons
(three bars / star / envelope / gift box / check / gear), which appear on the same
screen.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 5 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- EVERY CELL MUST BE SQUARE — the whole sheet is 5:1, output it at 2560x512.
```

---

## C장 — 보물 상자와 다이아

**이 둘만 크게 씁니다.** 상자는 40px 짜리 단추 안에서 흔들리고
(`RewardBar`), 다이아는 값 옆에 12px 로 붙습니다. 그래서 상자는 **닫힌
그림 하나**로 충분하고 (여는 연출은 화면이 도형으로 그립니다 —
`TreasureFx`), 다이아는 나머지 로고들과 같은 규칙을 탑니다.

### 셀 순서

| 셀 | 1 | 2 |
|---|---|---|
| | 보물 상자 | 다이아 |
| id | `chest` | `gem` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
(위 A장과 같습니다.)

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

STYLE / ICON RULES / NO DITHERING:
(위 A장과 같습니다.)

Note on size: these two are shown LARGER than the other eleven (up to 32 pixels),
so ONE interior gap each is allowed — the chest's seam and lock. Everything else
still follows the icon rules.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 2 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- EVERY CELL MUST BE SQUARE — the whole sheet is 2:1, output it at 1024x512.
```

## 슬라이서 설정

```json
{ "file": "nav-top.jpg", "name": "nav_top", "expect": [6, 1],
  "labels": ["rank", "event", "mail", "gift", "mission", "config"] },
{ "file": "nav-bot.jpg", "name": "nav_bot", "expect": [5, 1],
  "labels": ["hero", "item", "main", "guild", "content"] },
{ "file": "coin-ui.jpg", "name": "coin_ui", "expect": [2, 1],
  "labels": ["chest", "gem"] }
```

## 안 만든 것

- **X 자 베기** (20판 자비없는 칼날) — 도형 두 줄로 그렸습니다
  (`screens/home/BossFx` 의 `SlashX`). 베는 것은 "선이 자란다" 가 본질이라
  2색 시트로는 못 그립니다 — 시트로 받으면 X 표시가 켜졌다 꺼집니다.
- **하늘에서 내리치는 벼락** (20판) — 같은 이유로 도형입니다 (`Thunder`).
  이미 있는 `bfx_bolt` 시트가 **맞은 자리에서 터지는 것**을 맡고, 하늘에서
  내려오는 줄기만 도형으로 얹었습니다.
- **폭발** (23·26판) — `Boom` 도 도형입니다. 속이 부풀고 테가 퍼지고 조각이
  튀는 셋이 **서로 다른 속도로** 움직여야 하는데, 시트는 한 속도뿐입니다.
- **주점 아가씨** — 이미 있습니다 (`assets/sprites/maid/shy.png`).
  오프라인 보상 창이 그걸 그대로 씁니다 (`screens/home/OfflinePopup`).
