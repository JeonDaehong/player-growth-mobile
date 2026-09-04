# UI 뼈대 로고

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

**세 프롬프트가 각자 온전합니다.** 한동안 B·C 장이 "위 A장과 같습니다" 로
스타일 지시를 참조하고 있었는데, 그러면 복사할 때 두 군데를 오려 붙여야 하고
한쪽만 붙이면 조용히 다른 화풍이 나옵니다. 다른 로고 문서(`ICON_PROMPTS.md` ·
`STATUS_ICON_PROMPTS.md`)는 게임 수치에서 만들어지는데, 이 열셋은 수치가 아니라
**화면 구조**에서 나오므로 읽어 올 소스가 없습니다.

새 뼈대의 단추 열하나와 재화 둘입니다 (`screens/home/TopBar` ·
`BottomNav` · `RewardBar`).

| 시트 | 폴더 | 어디에 쓰나 | 칸 |
|---|---|---|---|
| A | `assets/sprites/nav_top/` | 위 띠의 문 여섯 | 6 |
| B | `assets/sprites/nav_bot/` | 아래 띠의 다섯 칸 | 5 |
| C | `assets/sprites/coin_ui/` | 보물 상자와 다이아 | 2 |

## 지금은 12x12 윤곽선 도트로 서 있습니다

한 번 **한글 두 글자**로 뒀다가 물렸습니다. 자리를 잡는 것이 먼저였고 자리는
글자로도 잡히지만, 다 세워 놓고 보니 열한 칸에 두 글자씩 적힌 화면은 띠가
아니라 **표**였습니다.

그래서 `ui/sprites` 의 `NAV` 에 열하나를 도트로 그려 넣었습니다. 아래 표의
"가르는 것" 을 그대로 지킨 것들입니다 — 트로피 · 달력 · 봉투 · 리본 상자 ·
문서 · 톱니 · 투구 · 가방 · 성 · 깃발 · 격자.

처음엔 10x10 짜리 **꽉 찬 덩어리**였습니다. 하나씩 그렸으므로 굵기도 여백도
제각각이었고, 나란히 놓으면 여섯이 서로 다른 게임에서 온 것처럼 보였습니다.
지금은 규칙이 셋입니다.

1. **12x12** 격자, 바깥 한 칸은 늘 비웁니다
2. **속을 비웁니다** — 1px 윤곽선이고, 안쪽은 뜻이 있는 것만 채웁니다
   (투구의 눈구멍 · 성문 · 편지의 접힘선)
3. **한 아이콘에 하나의 실루엣** — 곁다리를 안 붙입니다

**이 문서는 여전히 유효합니다.** 아래 프롬프트로 받은 그림이 들어오면
`GATES` · `TABS` 의 `art` 가 가리키는 곳만 `Sprite` 로 갈면 되고, 자리와
크기는 안 건드려도 됩니다. 다만 **위 셋은 그림에도 그대로 요구하십시오** —
그리는 사람이 달라도 한 벌로 보여야 합니다.

상자와 다이아는 8x8 도트입니다 (`ICONS.chest` · `ICONS.gem`). 저 둘은 **상자가
흔들리고 다이아가 값 옆에 붙는** 자리라 더 급했습니다.

## 열하나가 서로 안 닮아야 합니다

같은 띠에 여섯이 나란히 서고, 아래 띠의 다섯도 마찬가지입니다. 12~16px 에서
남는 것은 바깥 모양 하나뿐이라, 둘이 닮으면 **둘 다 못 읽습니다.**

| | 가르는 것 |
|---|---|
| 랭킹 | 트로피 — 유일하게 **옆으로 뻗은 손잡이 둘** |
| 이벤트 | 달력 — 유일하게 **위로 솟은 고리 둘** |
| 우편 | 가로로 누운 봉투 — 유일하게 **가로로 긴 사각** |
| 선물 | 리본 묶인 상자 — 유일하게 **위로 솟은 리본 귀 둘** |
| 미션 | 문서 — 유일하게 **안쪽에 가로 글줄 셋** |
| 설정 | 톱니바퀴 — 유일하게 **테두리가 오돌토돌** |
| 영웅 | 투구 — 유일하게 **가로로 뚫린 눈구멍** |
| 아이템 | 가방 — 유일하게 **위에 손잡이 아치** |
| 메인 | 성 — 유일하게 **위가 성가퀴로 들쭉날쭉** |
| 길드 | 깃발 — 유일하게 **한쪽으로만 쏠린 것** |
| 컨텐츠 | 네모 넷 (2x2) — 유일하게 **똑같은 덩어리 넷** |

별 · 체크 · 흉상 · 집 · 배낭이었던 다섯을 갈아 끼웠습니다. 이유는 아래
"속을 비웁니다" 에 있습니다 — 윤곽선으로 그리기로 하고 나니, 별과 체크처럼
**안쪽이 없는 모양**은 속을 비울 것이 없어서 이 벌에서 혼자 겉돌았습니다.

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
