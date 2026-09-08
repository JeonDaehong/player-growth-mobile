# 아이템 로고

가방 화면(`screens/home/ItemScreen`)과 레벨업 창(`LevelUpPopup`)에 붙는
아이템 로고입니다. **셋이 필요합니다** — 경험의 서 세 가지.

강성의 영약은 이미 있습니다 (`growth/elixir`). 이 셋만 그리면 지금 게임에
있는 아이템 전부에 그림이 붙습니다.

## 목록

| 로고 | 이름 | 값 | 쓰는 곳 |
|---|---|---|---|
| `book_old` | 낡은 경험의 서 | 120 exp | 영웅 관리 · 레벨업 |
| `book_fine` | 온전한 경험의 서 | 1,200 exp | 〃 |
| `book_prime` | 명품 경험의 서 | 12,000 exp | 〃 |

폴더는 `assets/sprites/item_icon/` 입니다 (아직 없습니다 — 슬라이스가 만듭니다).

## 셋이 **한눈에 등급으로 읽혀야** 합니다

이 셋은 나란히 섭니다. 레벨업 창에서는 세 줄이 위아래로 붙어 있고
(`BookRow`), 가방에서는 한 목록 안에 셋이 연달아 옵니다. 그러니까 셋을
가르는 것이 **모양이 아니라 값의 크기**여야 합니다 — 사람이 물어보는 것은
"이게 무슨 책이지" 가 아니라 "이게 비싼 거였나" 입니다.

값이 10배씩 벌어지므로 (120 · 1,200 · 12,000) 그림도 세 단계로 자랍니다.

| 로고 | 겹 | 표시 |
|---|---|---|
| `book_old` | 얇다 | 없음 — 맨 책 |
| `book_fine` | 보통 | 잠금쇠 하나 |
| `book_prime` | 두껍다 | 잠금쇠 + 위에 뜬 보석 |

**같은 책이 자라는 것**으로 보여야 합니다. 셋을 서로 다른 물건으로 그리면
(두루마리 · 책 · 석판) 값의 순서가 그림에서 안 읽혀서, 어느 것이 비싼지를
숫자로만 알게 됩니다.

## 16~28px 입니다

가방 목록에서 26px, 레벨업 창에서 16px 로 붙습니다. **16px 에서 살아남는
것이 기준**입니다 — 낡은 것과 온전한 것의 차이가 잠금쇠 하나뿐이므로, 그
잠금쇠가 3~4픽셀은 되어야 합니다.

책등의 결이나 종이 낱장을 그리지 마십시오. 16px 에서 뭉개져 얼룩이 됩니다.
**속이 꽉 찬 덩어리 하나에 큼직한 홈 하나** — 다른 로고들과 같은 규칙입니다
([`PASSIVE_ICON_PROMPTS.md`](PASSIVE_ICON_PROMPTS.md)).

## 이미 있는 것들과 안 겹쳐야 합니다

가방의 재료 칸에 `growth/elixir`(영약 병)가 있고, 같은 화면의 갈래 줄
바로 아래에 아래 띠의 로고 다섯이 있습니다.

- **책 ↔ 영약 병** — 병은 **위가 좁고 아래가 둥근** 세로 덩어리입니다.
  책은 **가로가 더 넓은 네모**여야 합니다. 셋 다 눕힌 비율로 그리십시오
- **책 ↔ `pv_oath`(받침 위의 십자)** — 십자는 세로로 길고 책은 가로로
  넓습니다. 책에 십자 무늬를 넣지 마십시오

## 슬라이스

받은 그림을 `assets/2026-XX-XX/book.jpg` 로 넣고 `tools/sprites.config.json`
에 아래를 더한 뒤 `python tools/slice.py` 를 돌립니다.

```json
{
  "file": "book.jpg",
  "name": "item_icon",
  "expect": [3, 1],
  "labels": ["book_old", "book_fine", "book_prime"]
}
```

## 프롬프트

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 낡은 경험의 서 | 온전한 경험의 서 | 명품 경험의 서 |
| id | `book_old` | `book_fine` | `book_prime` |

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

The 3 cells, in this exact order:

Cell 1 — A PLAIN THIN BOOK. A solid rectangle filling the middle of the cell, clearly WIDER than it is tall (about 4 wide to 3 tall). Along its left edge, a narrow vertical SPINE strip one sixth of the width, separated from the cover by one straight vertical line. Along the right edge, a shallow stack of PAGES suggested by TWO short horizontal lines only. One CORNER of the cover — the lower right — is bitten off by a small triangular notch, so the book reads as worn. Nothing else. No clasp, no gem, no straps, no rays. Squint test: a fat horizontal brick with a stripe down its left side.

Cell 2 — THE SAME BOOK, THICKER, WITH ONE CLASP. Same wide rectangle and same left-edge spine strip, but the page stack on the right is now DEEPER — the body is noticeably taller than in cell 1 and the pages take a fifth of the width. No bitten corner; all four corners are square and whole. Crossing the right edge horizontally at the vertical middle, a small solid CLASP: a short bar that starts on the cover, crosses the page edge, and hooks around it — about a quarter of the cell wide and a tenth of the cell tall. Exactly ONE clasp. No gem, no glow. Squint test: the same brick, deeper, with one small tab sticking off its right side.

Cell 3 — THE SAME BOOK, THICKEST, WITH CLASP AND A FLOATING GEM. Same wide rectangle, same spine strip, and the deepest page stack of the three — the body fills most of the cell. The horizontal CLASP from cell 2 is there, unchanged, on the right edge. In addition: two short RAISED BANDS cross the spine strip horizontally, near its top and bottom, each a third of the spine's height — the only marks on the spine. Above the book, floating clear of it with a visible GAP of empty black between them, a small solid DIAMOND — a four-pointed rhombus about a sixth of the cell wide, centred over the book. The gap is the point: the gem does not touch the cover. No rays, no sparkles, no stars, no crown. Squint test: a deep brick with a small diamond hovering above it.

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

## 앞으로 늘어날 것

가방에 갈래가 넷인데 (`core/bag` 의 `BAG_TABS`) 지금 채워진 것은 소비와
재료 둘뿐입니다. 장비와 기타가 생기는 날 이 파일에 그 목록이 붙습니다 —
그때도 규칙은 같습니다: **한 판에 다 그려서 나란히 놓고 보고**, 16px 에서
서로 안 헷갈리는지부터 봅니다.
