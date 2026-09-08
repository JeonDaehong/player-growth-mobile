# 인연 · 아이템 그림

인연 기능(`core/bond` · `screens/home/BondScreen`)과 가방(`core/bag`)에 들어가는
그림의 **원본 프롬프트**입니다.

> **뽑을 때는 이 파일을 안 봐도 됩니다.** `python tools/gen-all.py` 를 돌리면
> [`ALL_PROMPTS.md`](ALL_PROMPTS.md) 에 **아직 안 들어온 것만** 자르기 설정과
> 함께 순서대로 실립니다. 여기는 그 원본이고, 고칠 때만 엽니다.

| 절 | 무엇 | 판 | 폴더 |
|---|---|---|---|
| §B1 | 선물 로고 — 얽힌 것 일곱 | 7칸 1줄 | `gift_icon` |
| §B2 | 선물 로고 — 아무나 줘도 되는 것 열하나 | 6칸 2줄 | `gift_icon` |
| §B3 | 경험의 서 셋 | 3칸 1줄 | `item_icon` |
| §B4 | 이야기 월페이퍼 열여섯 | 낱장 | `assets/wallpaper/` |
| §B5 | 하트와 인연 단추 — **안 그려도 됩니다** | — | — |

---

## §B0 선물 열여덟이 다 갈려야 합니다

두 판으로 나눠 뽑지만 **한 목록 안에 세로로 줄지어 섭니다.** 먹는 것이
열둘이라, 그 열둘이 26px 에서 서로 안 헷갈리는 것이 이 판들의 제일 어려운
부분입니다.

### 얽힌 것 일곱 (§B1)

좋아하거나 싫어하는 사람이 있는 것들입니다. **이 일곱이 제일 급합니다** —
선물이라는 기능의 내용이 여기 다 있습니다.

| 로고 | 이름 | 좋아함 | 싫어함 |
|---|---|---|---|
| `gf_cookie` | 딸기맛 쿠키 | 이졸데 ×2 | — |
| `gf_pie` | 호두 파이 | — | **이졸데** |
| `gf_carrot` | 당근 케이크 | 비앙카 ×2 | — |
| `gf_rabbit` | 토끼 고기 | — | **비앙카** |
| `gf_flower` | 진귀한 꽃 | 리안느 ×2 | — |
| `gf_bible` | 성서 | 아녜스 ×2 | — |
| `gf_gong` | 목탁 | — | **아녜스** |

### 아무나 줘도 되는 것 열하나 (§B2)

전부 1배입니다. 열하나나 두는 까닭: 좋아하는 것 하나만 있으면 그것을 다
쓰고 난 뒤에 할 일이 없어지는데, 인연은 **매일 조금씩** 쌓는 축이라 그날
줄 것이 늘 있어야 합니다.

`gf_tea` 따뜻한 차 · `gf_ice` 아이스 아메리카노 · `gf_bread` 갓 구운 빵 ·
`gf_apple` 붉은 사과 · `gf_honey` 꿀단지 · `gf_cheese` 치즈 한 덩이 ·
`gf_soup` 따뜻한 수프 · `gf_candy` 박하사탕 · `gf_ribbon` 비단 리본 ·
`gf_candle` 밀랍 초 · `gf_music` 오르골

**고기는 여기 없습니다.** 비앙카가 싫어하는 것이 토끼 고기라, 고기붙이가
여럿이면 "고기를 싫어한다" 로 읽혀서 그 한 줄이 흐려집니다.

### 26px 에서 남는 윤곽

| 로고 | 윤곽 |
|---|---|
| `gf_cookie` | **동그라미** + 점 박힘 + 한 입 자국 |
| `gf_pie` | **낮고 넓은 사다리꼴** + 위가 격자 |
| `gf_carrot` | **세로로 선 3층 네모** + 위에 삼각 |
| `gf_rabbit` | **뼈 붙은 다리** — 가늘고 길쭉 |
| `gf_flower` | 줄기 위 **꽃잎 다섯** |
| `gf_bible` | **가로로 넓은 네모** + 세로 십자 |
| `gf_gong` | **둥근 덩어리** + 옆으로 뻗은 막대 |
| `gf_tea` | 낮은 잔 + 받침 + **위에 뜬 곡선 둘** |
| `gf_ice` | **키 큰 세로 컵** + 네모 얼음 + 빨대 |
| `gf_bread` | **길쭉한 타원** + 위에 사선 칼집 셋 |
| `gf_apple` | **동그라미** + 위에 꼭지와 잎 하나 |
| `gf_honey` | **아래가 넓은 항아리** + 목이 잘록 + 뚜껑 |
| `gf_cheese` | **직각삼각형** + 구멍 셋 |
| `gf_soup` | **넓고 납작한 대접** + 위에 뜬 곡선 하나 |
| `gf_candy` | **동그라미** + 양옆 포장 꼬리 |
| `gf_ribbon` | **나비 매듭** — 좌우 고리 둘 |
| `gf_candle` | **세로 막대** + 위에 작은 불꽃 |
| `gf_music` | **낮은 상자** + 옆에 태엽 손잡이 |

특히 헷갈리기 쉬운 짝:

- **쿠키 ↔ 사과 ↔ 사탕** — 셋 다 동그라미다. 쿠키는 **점이 박히고 한 입
  베어져** 있고, 사과는 **위에 꼭지와 잎**이 있고, 사탕은 **양옆으로 꼬리**가
  뻗는다. 하나만 다시 뽑을 때도 이 셋을 나란히 놓고 보십시오
- **쿠키 ↔ 목탁** — 목탁은 **매끈하고 옆으로 막대가 뻗는다**
- **차 ↔ 수프** — 차는 **키가 있고 받침이 있고 김이 둘**, 수프는 **납작하고
  넓고 받침이 없고 김이 하나**다
- **아이스 아메리카노 ↔ 꿀단지 ↔ 초** — 셋 다 세로로 길다. 컵은 **위가
  넓고 빨대가 삐져나오고**, 항아리는 **목이 잘록하고 아래가 제일 넓고**,
  초는 **폭이 일정하고 위에 불꽃**이 있다
- **파이 ↔ 케이크 ↔ 치즈** — 파이는 **눕고 넓다**(4:2), 케이크는 **서고
  좁다**(2:3), 치즈는 **직각삼각형**이다
- **성서 ↔ 경험의 서** — 성서는 **표지에 세로 십자**, 경험의 서는 **왼쪽에
  책등 줄**. 십자는 경험의 서 셋 중 어디에도 넣지 마십시오

---

## §B1 선물 로고 · 얽힌 것 일곱

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

---

## §B2 선물 로고 · 아무나 줘도 되는 것 열하나

마지막 열두 번째 칸은 **비워 둡니다.** 6×2 격자라 열하나가 딱 안 떨어지는데,
칸 수를 줄이면 슬라이서가 격자를 못 잡습니다.

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

---

## §B3 경험의 서 셋

가방의 **소비** 칸과 레벨업 창(`LevelUpPopup`)에 붙습니다. 값이 10배씩
벌어지므로 (120 · 1,200 · 12,000) 그림도 **같은 책이 자라는 것**으로 그립니다 —
셋을 서로 다른 물건으로 그리면 (두루마리 · 책 · 석판) 값의 순서가 그림에서
안 읽혀서 숫자로만 알게 됩니다.

| 로고 | 이름 | 값 | 겹 | 표시 |
|---|---|---|---|---|
| `book_old` | 낡은 경험의 서 | 120 | 얇다 | 없음 — 맨 책 |
| `book_fine` | 온전한 경험의 서 | 1,200 | 보통 | 잠금쇠 하나 |
| `book_prime` | 명품 경험의 서 | 12,000 | 두껍다 | 잠금쇠 + 뜬 보석 |

레벨업 창에서 **16px** 로 붙습니다. 낡은 것과 온전한 것의 차이가 잠금쇠
하나뿐이므로, 그 잠금쇠가 3~4픽셀은 되어야 합니다. 책등의 결이나 종이 낱장은
그리지 마십시오 — 16px 에서 뭉개져 얼룩이 됩니다.

성서(`gf_bible`)와 안 겹쳐야 합니다: **십자는 성서에만** 있습니다.

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

---

## §B4 이야기 월페이퍼 열여섯

인연 이야기를 처음 끝까지 보면 그 장면의 월페이퍼를 받습니다 (`readStory`).
네 사람 × 네 단계 = 열여섯 장입니다.

**지금 있는 넉 장과 같은 결**입니다 — 회색조 라이트노벨 삽화, 세로 9:16.
도트가 아닙니다. `assets/wallpaper/` 의 것을 한 번 열어 보고 맞추십시오.

**자르지 않습니다.** `assets/wallpaper/<사람>_<단계>.jpg` 로 넣고
`src/ui/wallpapers.ts` 에 줄을 더합니다 — 번들러가 `require` 를 정적으로
읽으므로 손으로 적어야 합니다 (그 파일 머리말에 까닭이 있습니다). 아직 안
온 단계는 지금 있는 한 장으로 떨어지므로 (`wallpaperOf`), **한 장씩 들어와도
그때그때 붙습니다.**

| 파일 | 장면 |
|---|---|
| `knightgirl_awkward` | 기사답게 인사한다 |
| `knightgirl_friend` | 목욕 중에 문이 열려 비누를 던진다 |
| `knightgirl_trust` | 검을 땅에 꽂고 맹세한다 |
| `knightgirl_love` | 임무를 끝내고 노을 아래 웃는다 |
| `bunnyaxe_awkward` | 술집에서 진상 손님을 혼낸다 |
| `bunnyaxe_friend` | 제 특제 칵테일을 먹어 보라고 내민다 |
| `bunnyaxe_trust` | 울던 자신을 달래 준 것이 고맙다 |
| `bunnyaxe_love` | 고백 직전, 방문 앞에 서 있다 |
| `elfarcher_awkward` | 나무 위에서 내려다본다 |
| `elfarcher_friend` | 쑥스러워하며 손을 내민다 |
| `elfarcher_trust` | 던전에서 물고기를 구우며 배고파한다 |
| `elfarcher_love` | 팔을 뒤로 하고 몸을 배배 꼰다 |
| `nun_awkward` | 폐허에서 기도한다 |
| `nun_friend` | 물고기 머리가 올라간 괴식 파이를 맛있게 먹는다 |
| `nun_trust` | 묘지에서 하늘을 보며 씁쓸하게 웃는다 |
| `nun_love` | 고맙다며 행복하게 미소짓는다 |

### 단계가 **표정으로** 갈립니다

넷이 다 "예쁘게 서 있는 그림" 이면 단계를 올린 값이 안 보입니다.

| 단계 | 무엇을 보여 주나 |
|---|---|
| 어색 | **그 사람의 직업.** 아직 나를 안 본다 |
| 우정 | **허물어진 순간.** 웃거나, 당황하거나 |
| 신뢰 | **속을 보인다.** 맹세 · 고마움 · 씁쓸함 |
| 애정 | **나를 본다.** 부끄러움과 행복이 같이 있는 얼굴 |

### 야하게 안 나오게 — 프롬프트에 **못 박아 둔 것**

한 번 뽑아 보니 성인물처럼 나왔습니다. 모델이 "흑백 · 미소녀 · 극적인
조명" 을 그쪽으로 읽습니다. 그래서 아래 프롬프트에는 세 가지를 넣어
두었습니다.

1. **삽화라고 부릅니다.** `light-novel cover` 가 아니라
   `light-novel interior illustration` 입니다 — 표지는 인물을 팔게 그리고,
   삽화는 장면을 설명하게 그립니다
2. **`CONTENT RULES` 문단**을 따로 뒀습니다. 옷을 다 입고, 가슴골·속옷·
   올려다보는 앵글·몸을 강조하는 포즈가 없고, **보는 것은 표정과 상황**이라고
   못 박습니다
3. **카메라를 정해 줍니다.** 눈높이, 가슴 위 또는 무릎 위. 아래에서 올려다보는
   컷은 비앙카의 술집 장면 하나뿐이고 거기서도 얼굴을 봅니다

목욕 장면은 그 셋을 다 걸고 **어깨 위만** 보이게, 김으로 다 가리고, 웃기게
그리도록 적었습니다.

---

### 이졸데 (`knightgirl_*`)

**`assets/wallpaper/knightgirl_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, everything covered.
- No cleavage, no underwear, no skin-tight emphasis, no suggestive posing.
- Camera at eye level. No low angles looking up, no close-ups of the body.
- The appeal of this picture is the EXPRESSION and the SITUATION, not the figure.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair past her waist. A slim jewelled circlet with one small gem on her forehead. Full silver plate armour with layered pauldrons and a fitted breastplate over a high-necked underlayer, a long cape with an embroidered hem, armoured boots. A straight longsword at her hip. Calm, slightly tired features.

SCENE — A FORMAL KNIGHT'S GREETING:
Full figure, standing in a vaulted stone hall, facing the viewer but with her eyes lowered — she has not looked up yet. Her right fist is over her heart, her left hand rests on the sword's pommel, and her upper body is bowed a few degrees in a stiff, correct salute. The cape falls straight behind her. Cold light through a tall arched window behind her throws a long shadow forward across the flagstones. Everything about the pose is proper and distant.

RENDERING:
Grayscale only, no colour. Clean confident ink linework with screentone and hatching for shading, the way a monochrome light-novel illustration is drawn — not a painted cover. Soft even lighting with one clear light source, moderate contrast, detailed but calm background. Floating dust motes in the light.
```

**`assets/wallpaper/knightgirl_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict — this is a GENTLE COMEDY panel, not a fanservice panel):
- Wholesome, all-ages, non-sexualized. NOTHING below the shoulders is visible.
- She is submerged to the neck in an opaque wooden tub and thick steam fills the room; the water surface is drawn as solid white so nothing shows through.
- No cleavage, no bare shoulders, no wet-skin rendering, no suggestive posing.
- Camera at eye level, framed on her HEAD and one raised arm only.

EXPRESSION — THIS IS THE MOST IMPORTANT PART:
She is FLUSTERED AND EMBARRASSED, not angry. Do NOT draw a furious face, do NOT draw gritted teeth, sharp glaring eyes, an angry V-shaped brow, or a scowl. She is a composed, dutiful, slightly stiff knight who has never been caught off guard before, and she has no idea what to do.
- Eyebrows raised and pulled together in helpless dismay, not lowered in anger.
- Eyes wide and round and watery, pupils small, looking at the intruder in pure panic.
- Mouth small and open in a wobbly, startled sound — she is stammering, not shouting.
- Face and ears deeply flushed; one or two manga blush lines across the nose.
- Read her as "가, 가지 마세요 — 아니, 나가 주세요!" — mortified, apologetic, overwhelmed. Cute and sympathetic, never scary.

CHARACTER — ISOLDE, a young knight (off duty):
Very long pale hair, here loose and damp, pinned up messily. No armour, no circlet.

SCENE — THE DOOR OPENED BY MISTAKE:
Framed from the rim of the tub upward. She is in a round wooden bath tub in a small bathhouse, sunk to the neck, thick steam everywhere. The heavy door at the frame's edge has just swung open and a bright shaft of light cuts in. One arm is up in a hasty, uncoordinated throw — a bar of soap tumbles toward the viewer with a spray of droplets, and a wooden bucket and a scrubbing brush wobble through the air beside it. The throw is a reflex of panic, weak and badly aimed, not an attack. Her other hand is pulling the tub rim up toward her chin as if it could hide her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, warm comedic manga energy — a couple of small motion arcs behind the soap, one sweat drop, heavy blush hatching. Strong backlight through the open door, dense white steam. Detailed wooden interior. The whole panel should feel endearing and funny, not aggressive.
```

**`assets/wallpaper/knightgirl_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed and fully armoured.
- No cleavage, no skin-tight emphasis, no suggestive posing, no low angles.
- The appeal is the solemnity of the moment, not the figure.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair, slim jewelled circlet, full silver plate armour with layered pauldrons over a high-necked underlayer, a long embroidered cape, armoured boots, a straight longsword.

SCENE — THE OATH:
Full figure, kneeling on one knee at the centre of a ruined cathedral floor. Her longsword is driven point-down into the flagstones before her; both hands are folded over the crossguard and her forehead is bowed almost to her hands. Eyes closed. The cape spills across the stone behind her in a wide arc. A single shaft of light from a shattered rose window falls straight down onto her. Petals and ash drift through the beam.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone and crosshatching, monochrome manga illustration style — not a painted cover. One hard vertical light shaft, volumetric dust, detailed gothic ruin, reflective wet floor. Solemn, quiet.
```

**`assets/wallpaper/knightgirl_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed; the armour stays on and closed at the throat.
- No cleavage, no undressing, no suggestive posing, no low angles.
- This is a SHY HAPPY portrait. The appeal is entirely her face.

CHARACTER — ISOLDE, a young knight:
Very long pale hair, slim circlet, silver plate armour — here dented and dusty from a fight, with a smear of dirt on one cheek and a few strands of hair escaped.

SCENE — AFTER THE MISSION, AT SUNSET:
Chest-up, close, facing the viewer. She has just come back from a fight and is smiling — a real, uncontrolled smile she is clearly not used to making. She looks straight at the viewer, but her eyes flick very slightly aside and her cheeks are flushed: happiness and embarrassment at once. One hand is raised just into the bottom of the frame, palm open, as if she had reached out and then thought better of it. Behind her, a low sun over a broken field and heavy backlit clouds.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, monochrome light-novel illustration style. Strong rim light from behind blowing out the edges of her hair, soft shadow on the near side of her face, small lens-flare starbursts, floating particles, softly blurred background.
```

---

### 비앙카 (`bunnyaxe_*`)

**`assets/wallpaper/bunnyaxe_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed in a modest tavern uniform.
- No cleavage, no short skirt emphasis, no thigh focus, no suggestive posing.
- The camera is slightly low to make her look imposing, but it stays on her FACE and the fallen customer — never on her body.

CHARACTER — BIANCA, a tavern server who fights:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. A laced bodice over a long-sleeved blouse, a full apron, a kerchief tied over her hair, sturdy knee-high boots, and one battered steel pauldron strapped over her right shoulder. She carries an enormous single-bladed woodcutter's axe as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure in a crowded candle-lit tavern. One boot planted on a toppled bench, she leans in and jabs a finger down at a big drunk man who has fallen backward off his stool at the bottom of the frame — seen from behind, hands raised. Her other hand rests the axe casually over her shoulder. Mouth open mid-shout, one eyebrow up: furious, completely in control, almost enjoying it. Tankards, spilled ale and scattered cards frozen in the air. Other patrons watch from the shadows.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading and bold manga action lines. Warm candlelight from below and behind, smoke haze, splashing liquid as sharp white arcs. Dense detailed tavern background.
```

**`assets/wallpaper/bunnyaxe_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed in a modest tavern uniform, collar closed.
- She leans on the bar but the pose is NOT a chest-forward pose — her weight is on her elbows and the camera is at eye level, framed on her face and the glass.
- No cleavage, no suggestive posing, no low angles.

CHARACTER — BIANCA:
Short tousled bob, freckles, laced bodice over a long-sleeved blouse, apron, kerchief, one battered pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Waist-up, both elbows on a polished tavern bar, pushing a tall glass right into the foreground — the glass is large in frame, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge, eyebrows raised in expectation, clearly saying "drink it". Her free hand gives a thumbs-up. Bottles and hanging tankards crowd the shelves behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, cheerful manga energy. Warm lamplight, wide-angle foreshortening on the glass, condensation droplets picked out in white, bright highlights from bottles behind. Densely detailed bar background.
```

**`assets/wallpaper/bunnyaxe_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, collar closed, apron on.
- No cleavage, no suggestive posing, no low angles, no wet-clothing rendering.
- This is a QUIET EMOTIONAL panel. The appeal is entirely her face.

CHARACTER — BIANCA:
Short tousled bob — here messy, her kerchief slipped off — freckles, laced bodice over a long-sleeved blouse, a dirty apron, one battered pauldron. Her axe lies on the ground beside her.

SCENE — THANK YOU FOR STAYING:
Chest-up, close, sitting on the back steps of the tavern at night. She has clearly been crying — eyes and nose red and wet, lashes clumped, a tear track still on one cheek — but she has just looked up at the viewer and is smiling through it: a crumpled, grateful, slightly embarrassed smile. One hand wipes her eye with the back of her wrist; the other is half-raised toward the viewer. Her shoulders are still hitching. Warm light spills from the doorway behind her; the yard beyond is dark and rainy.

RENDERING:
Grayscale only, no colour. Clean ink linework with fine screentone, gentle monochrome light-novel illustration style. Soft key light from the doorway behind, a cold rim from the night, bright white specular dots in her wet eyes, fine rain streaks, shallow depth of field.
```

**`assets/wallpaper/bunnyaxe_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, neatly dressed, collar closed.
- No cleavage, no suggestive posing, no low angles, no body emphasis.
- The appeal is her nervous happy face and the closed door in front of her.

CHARACTER — BIANCA:
Short tousled bob, freckles — but tonight the apron is off, the bodice is neatly laced over a clean blouse, her hair is brushed and she wears a small ribbon. No axe anywhere.

SCENE — OUTSIDE THE DOOR, ABOUT TO CONFESS:
Full figure, standing in a narrow lamp-lit corridor, back lightly against the wall beside a closed wooden door. She looks at the door, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, eyes squeezed half-shut, mouth caught between a nervous grimace and an enormous helpless smile — she has been standing here a while. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading; heavy blush drawn with fine hatching and two small blush lines, manga style. A single warm lamp above and to one side, deep falloff into black down the corridor. Detailed timber-and-plaster interior.
```

---

### 리안느 (`elfarcher_*`)

**`assets/wallpaper/elfarcher_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed; her tunic reaches mid-thigh and she wears leggings and tall boots.
- The camera looks UP at her because she is in a tree, but it frames her FACE and the branch — never up her clothing. No thigh focus, no suggestive posing.

CHARACTER — RIANNE, an elf archer:
A slender elf with long pointed ears and very long pale hair in a high ponytail tied with a feather. A short-sleeved hooded jerkin over a fitted tunic, a wide belt, leather bracers, a quiver of fletched arrows at her hip, a torn ragged-hemmed cloak, leggings and tall lace-up boots. A longbow taller than she is. Cool, distant expression.

SCENE — LOOKING DOWN FROM THE BRANCH:
Full figure, seen from below. She is perched on a thick branch high in an ancient forest, one knee drawn up and the other leg hanging, her bow across her lap and an arrow held loosely between two fingers. She looks straight down at the viewer, chin lowered, expression unreadable and evaluating — not hostile, not welcoming. Her ponytail and torn cloak hang down past the branch. Shafts of light break through the canopy far above; leaves drift down through the frame.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, monochrome light-novel illustration style. Strong god-rays through the canopy, deep shadow below, fine detail in bark and leaves, floating pollen motes.
```

**`assets/wallpaper/elfarcher_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, leggings and tall boots.
- No cleavage, no thigh focus, no suggestive posing, no low angles.
- The appeal is the awkward sincerity of the gesture and her reddened ears.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair in a high ponytail with a feather, hooded jerkin over a fitted tunic, bracers, quiver, torn cloak, leggings, tall boots. Her longbow is slung across her back, freeing both hands.

SCENE — THE OFFERED HAND:
Knee-up, standing on a mossy forest path, turned three-quarters toward the viewer. She has extended one hand toward the viewer, palm up, fingers slightly curled — and immediately regretted it: the arm is not fully straight, her shoulders are drawn in, and she has turned her face away and down, looking off to the side with her ear tips visibly reddened and her lips pressed thin. Her other hand grips her own elbow.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading. Dappled forest light, soft rim light along her arm and hair, blush on the ear tips drawn with fine hatching. Detailed mossy woodland, shallow depth of field with the offered hand nearest and sharpest.
```

**`assets/wallpaper/elfarcher_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully clothed, cloak wrapped around her shoulders.
- No cleavage, no thigh focus, no suggestive posing, no low angles.
- The joke is her total loss of composure in front of a grilled fish.

CHARACTER — RIANNE:
Long pointed ears, long pale hair in a high ponytail with a feather, hooded jerkin, bracers, quiver, leggings, tall boots. Her torn cloak is pulled around her shoulders like a blanket; her bow leans against the wall.

SCENE — GRILLING A FISH IN THE DUNGEON:
Waist-up, crouched on her heels beside a small campfire in a cramped stone dungeon chamber. She holds a stick over the flames with a whole fish skewered on it, leaning so far forward that her face is almost in the fire. Her eyes are huge and locked on the fish, her mouth open, very obviously about to drool; one hand hovers as if to grab it early. All her usual composure is gone. Firelight throws her shadow enormous on the wet brick wall behind; her pack and a discarded arrow lie beside her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading and comedic manga marks — a small sweat drop, sparkle highlights on the fish. The fire is the single hard light source lighting her from below, deep black beyond it, sparks and smoke rising. Detailed damp stonework.
```

**`assets/wallpaper/elfarcher_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, tunic to mid-thigh, leggings and tall boots.
- Hands behind the back is a SHY fidget, NOT a chest-forward pose — keep her shoulders rounded and slightly hunched, weight shifted, head tucked down.
- No cleavage, no chest emphasis, no thigh focus, no low angles.
- The appeal is her embarrassed pleased face and her red ear tips.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin, bracers, leggings, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, FIDGETING:
Knee-up, standing in a sunlit forest clearing, facing the viewer. Both hands are clasped behind her back and she is rocking slightly on her heels; one boot is turned inward on its toe. Her shoulders are drawn up and in, her chin is tucked down, and she looks at the viewer through her lashes with her ears bright red and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. Petals and light drift around her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, gentle monochrome light-novel illustration style. Soft backlight through leaves haloing her hair, gentle bloom, blush drawn with fine hatching on the ears and cheeks, softly blurred forest background.
```

---

### 아녜스 (`nun_*`)

**`assets/wallpaper/nun_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.
- The appeal is the stillness of the moment.

CHARACTER — AGNES, a young nun:
Shoulder-length pale hair framing her face under a white headband and a black veil with a small leaf ornament at the temple. A high-collared black habit with wide bell sleeves, a long pale stole down the front, a sash at the waist, a long plain skirt, simple shoes. She carries a censer on a fine chain. Gentle, downcast features.

SCENE — PRAYING IN THE RUIN:
Full figure, kneeling in the nave of a roofless ruined medieval cathedral. Her hands are clasped at her chest, head bowed, eyes closed. The censer rests on the broken flagstones beside her, a thin line of smoke rising. Shattered pews and fallen masonry stretch away on both sides; above her the ribs of the vault are open to a heavy overcast sky. Ash and paper fragments drift in the still air.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone and crosshatching, monochrome light-novel illustration style. Soft flat overcast light from above with strong local contrast, drifting particles, detailed gothic ruin. Hushed and quiet.
```

**`assets/wallpaper/nun_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar, long sleeves.
- No cleavage, no suggestive posing, no low angles.
- The joke is the horrifying pie and her genuine bliss while eating it.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, a high-collared black habit with wide bell sleeves, a pale stole, a sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a plain wooden refectory table, seen from across it. In front of her sits a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side. She has a large forkful raised to her mouth and her eyes are closed in genuine, blissful delight; one cheek is already full and she is smiling around it. Her free hand is pressed to her cheek in appreciation. A second untouched plate sits opposite, pushed slightly away.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading and small comedic manga marks — sparkles around her face, a single sweat drop over the fish head. Warm side light from a window, steam rising, bright highlights on the crust and the fish's eye, detailed wood grain. Deadpan and funny.
```

**`assets/wallpaper/nun_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.
- The appeal is the bitterness behind her smile.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash, a censer on a chain hanging from one hand.

SCENE — IN THE GRAVEYARD, LOOKING UP:
Waist-up, standing among leaning weathered headstones at dusk, her body turned away but her face tilted up toward a break in the clouds. She is smiling — a small, tired, bitter smile with no happiness in it — and her eyes are open and dry. The censer hangs still at her side, its smoke going straight up. Bare branches reach across the top of the frame; long grass moves around the stones.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone and crosshatching. Cold light breaking through heavy cloud from above and behind, strong rim light on her cheek and veil, deep shadow across the graves, drifting smoke. Melancholy and still.
```

**`assets/wallpaper/nun_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar closed.
- No cleavage, no undressing, no suggestive posing, no low angles.
- This is a WARM GRATEFUL portrait. The appeal is entirely her smile.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament — here the veil is pushed slightly back and more of her hair shows — high-collared black habit with wide bell sleeves, pale stole, sash.

SCENE — THANK YOU:
Chest-up, close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She looks directly at the viewer and is clearly saying thank you. Soft light falls from a high window to the left; motes drift through it.

RENDERING:
Grayscale only, no colour. Clean ink linework with fine screentone, gentle monochrome light-novel illustration style. Soft directional key light with gentle falloff, a bright halo of blown-out light behind her head, delicate hatching for the blush, bright highlights in the eyes, softly blurred chapel background.
```

---

## §B5 하트와 인연 단추 — **안 그려도 됩니다**

하트 게이지는 코드가 그립니다 (`BondScreen` 의 `Heart`) — 45도로 돌린
마름모를 채우거나 비웁니다.

그림으로 안 둔 까닭: 빈 하트와 찬 하트 **두 칸**이 필요한데, 흑백 1비트에서
9~13px 짜리 하트 둘을 테두리만으로 가르는 것이 실제로 잘 안 됩니다. 열 칸이
나란히 서므로 하나만 애매해도 세는 것이 어긋납니다.

인연 단추(`hero_ui/bond`)도 이미 코드 도트가 있습니다. **그리고 싶으면**
30px 원 안에 흰 선으로, 월페이퍼 단추(`paper`)와 윤곽이 안 겹치게만
그리면 됩니다.
