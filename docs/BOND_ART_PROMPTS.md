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

**지금 있는 넉 장과 같은 그림**입니다 — 회색조 아트 일러스트, 세로 9:16,
빛이 세고 배경이 두꺼운 것. 도트가 아닙니다. `assets/wallpaper/` 의 것을
한 번 열어 보고 그 결을 맞추십시오.

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
| 어색한 관계 | **그 사람의 직업.** 아직 나를 안 본다 |
| 우정 | **허물어진 순간.** 웃거나, 당황하거나 |
| 신뢰 | **속을 보인다.** 맹세 · 고마움 · 씁쓸함 |
| 애정 | **나를 본다.** 부끄러움과 행복이 같이 있는 얼굴 |

---

### 이졸데 (`knightgirl_*`)

**`assets/wallpaper/knightgirl_awkward.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
A tall young knight woman with very long straight pale hair falling past her waist. A slim jewelled circlet with a single gem sits on her forehead. She wears ornate layered silver plate armour — segmented pauldrons, a fitted breastplate, armoured thigh-high boots — over a fitted underlayer, with a long flowing cape whose hem is embroidered with a fine pattern. She carries a straight double-edged longsword. Calm, composed features.

SCENE — A FORMAL KNIGHT'S GREETING:
She stands in a vaulted stone hall, full figure, facing the viewer but with her eyes lowered — she has not looked up yet. Her right fist is placed over her heart and her left hand rests on the pommel of her sheathed sword; her upper body is bowed a few degrees in a stiff, correct salute. Her cape falls straight behind her. Cold light falls through a tall arched window behind her, throwing a long shadow forward across polished flagstones. Everything about the pose is proper and distant.

RENDERING:
Black and white only, no colour at all. Rich full tonal range from deep black to pure white, dramatic directional lighting, volumetric light shafts, fine crosshatched detail in the armour and stonework, floating dust motes catching the light. Sharp, clean line work. Highly detailed background, cinematic composition, subject centred and full-length in frame.
```

**`assets/wallpaper/knightgirl_friend.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
The same knight woman: very long straight pale hair, now loose and soaked, a slim jewelled circlet set aside. Her armour is off; she is in a wooden bathhouse.

SCENE — THE DOOR OPENED BY MISTAKE:
Waist-up, seen from the doorway. She is in a steaming wooden bath tub, water and thick steam covering her to the collarbone and hiding everything below. The heavy door at the frame's edge has just swung open and a shaft of light cuts in. Her eyes are wide, her whole face burning with embarrassment, mouth open in a shout. Her arm is thrown back mid-throw — a bar of soap is flying toward the viewer, caught in the air with a spray of droplets, and a wooden bucket and a scrubbing brush tumble through the air beside it. Wet hair sticks to her cheek. Modest and non-explicit: steam, water and the tub's rim cover her completely.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, strong backlight through the open door, dense volumetric steam, flying water droplets rendered as sharp white specks. Sharp clean line work, detailed wooden interior, cinematic composition.
```

**`assets/wallpaper/knightgirl_trust.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
The same knight woman: very long straight pale hair, jewelled circlet, ornate layered silver plate armour with segmented pauldrons, a long embroidered cape, armoured thigh-high boots, a straight double-edged longsword.

SCENE — THE OATH:
Full figure, kneeling on one knee at the centre of a ruined cathedral floor. Her longsword is driven point-down into the flagstones in front of her; both hands are folded over the crossguard and her forehead is bowed until it almost touches her hands. Her eyes are closed. The cape spills across the stone behind her in a wide arc. A single shaft of light from a shattered rose window falls straight down onto her. Petals and ash drift through the beam.

RENDERING:
Black and white only, no colour at all. Rich full tonal range from deep black to pure white, a hard vertical light shaft, volumetric dust, fine crosshatching in the armour and the ruined stonework, reflective wet floor. Sharp clean line work, highly detailed gothic background, solemn cinematic composition.
```

**`assets/wallpaper/knightgirl_love.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
The same knight woman: very long straight pale hair, jewelled circlet, ornate silver plate armour, a long cape. Here the armour is dented and dusty and the collar is unbuckled, the cape torn at the hem.

SCENE — AFTER THE MISSION, AT SUNSET:
Chest-up, very close, facing the viewer. She has just come back from a fight; a smear of dirt is on one cheek and strands of hair have escaped. She is smiling — a real, uncontrolled smile she is clearly not used to making — and looking straight at the viewer, but her eyes flick very slightly aside and her cheeks are flushed, caught between happiness and embarrassment. One hand is raised into the bottom of the frame, palm open, as if she had just reached out and then thought better of it. Behind her, a low sun over a broken field, the sky heavy with backlit clouds.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, strong warm-feeling rim light from behind blowing out the edges of her hair, deep soft shadow on the near side of her face, lens-flare starbursts, floating particles. Sharp clean line work, shallow depth of field with the background softly blurred, intimate cinematic composition.
```

---

### 비앙카 (`bunnyaxe_*`)

**`assets/wallpaper/bunnyaxe_awkward.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. She wears a tavern server's outfit — a laced bodice over a blouse with rolled sleeves, an apron, a kerchief tied over her hair — with one battered steel pauldron strapped over her right shoulder, and tall lace-up boots. She carries an enormous single-bladed woodcutter's axe with a long grip as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure, low angle, in a crowded candle-lit tavern. She has one boot planted on a toppled bench and is leaning in, jabbing a finger down at a big drunk man who has fallen backward off his stool at the bottom of the frame — we see him from behind, hands raised. Her other hand holds the axe casually over her shoulder. Her mouth is open mid-shout and one eyebrow is up; she is furious and completely in control, almost enjoying it. Tankards, spilled ale and scattered cards are frozen in the air around her. Other patrons watch from the shadows.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, warm candlelight from below and behind, heavy smoke haze, splashing liquid rendered as sharp white arcs. Sharp clean line work, dense detailed tavern background, dynamic cinematic composition.
```

**`assets/wallpaper/bunnyaxe_friend.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
The same woman: short tousled bob, freckles, tavern server's outfit with a laced bodice, apron and kerchief, one battered steel pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Waist-up, leaning across a polished tavern bar toward the viewer, both elbows on the wood. She is pushing a tall glass right into the foreground — the glass is enormous in frame, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge and she is looking straight at the viewer with her eyebrows raised in expectation, clearly saying "drink it". Her free hand is a thumbs-up. Bottles and hanging tankards crowd the shelves behind her.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, warm lamplight, strong wide-angle foreshortening on the glass, condensation droplets picked out in white, bokeh highlights from bottles behind. Sharp clean line work, densely detailed bar background, playful cinematic composition.
```

**`assets/wallpaper/bunnyaxe_trust.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
The same woman: short tousled bob, freckles, tavern server's outfit, one battered pauldron. Here her kerchief has slipped off and her apron is dirty; the axe lies on the ground beside her.

SCENE — THANK YOU FOR STAYING:
Chest-up, close, sitting on the back steps of the tavern at night. She has clearly been crying — her eyes and nose are red and wet, lashes clumped, a tear track still on one cheek — but she has just looked up at the viewer and is smiling through it, a crumpled, grateful, slightly embarrassed smile. One hand is wiping her eye with the back of her wrist; the other is half-raised toward the viewer. Her shoulders are still hitching. Warm light spills from the doorway behind her; the yard beyond is dark and rainy.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, soft warm key light from the doorway behind and a cold rim from the night, wet highlights in her eyes rendered with bright white specular dots, fine rain streaks. Sharp clean line work, quiet intimate cinematic composition, shallow depth of field.
```

**`assets/wallpaper/bunnyaxe_love.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
The same woman: short tousled bob, freckles, tavern server's outfit, one battered pauldron — but tonight the apron is off, the bodice is neatly laced, her hair is brushed and she is wearing a small ribbon. No axe anywhere.

SCENE — OUTSIDE THE DOOR, ABOUT TO CONFESS:
Full figure, standing in a narrow lamp-lit corridor with her back pressed lightly against the wall beside a closed wooden door. She is looking at the door, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, her eyes are squeezed half-shut and her mouth is caught between a nervous grimace and an enormous helpless smile — she has been standing here a while. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, a single warm lamp above and to one side, deep falloff into black down the corridor, heavy blush rendered with fine hatching. Sharp clean line work, detailed timber-and-plaster interior, tense charming cinematic composition.
```

---

### 리안느 (`elfarcher_*`)

**`assets/wallpaper/elfarcher_awkward.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
A slender elf woman with long pointed ears and very long pale hair gathered into a high ponytail with a feather tied at the base. She wears a short-sleeved hooded jerkin over a fitted tunic, a wide belt, leather bracers, a quiver of fletched arrows at her hip and a torn ragged-hemmed cloak, with tall lace-up boots. She carries a longbow taller than she is. Cool, distant expression.

SCENE — LOOKING DOWN FROM THE BRANCH:
Full figure, seen from below at a steep upward angle. She is perched on a thick branch high in an ancient forest, one knee drawn up and the other leg hanging, her bow resting across her lap with an arrow held loosely between two fingers. She is looking straight down at the viewer, chin slightly lowered, expression unreadable and evaluating — not hostile, not welcoming. Her ponytail and the torn cloak hang down past the branch. Shafts of light break through the canopy far above; leaves drift down through the frame.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, strong god-rays from the canopy, deep shadow in the lower canopy, fine detail in bark and leaves, floating pollen motes. Sharp clean line work, dramatic low-angle perspective, highly detailed forest background.
```

**`assets/wallpaper/elfarcher_friend.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
The same elf: long pointed ears, very long pale hair in a high ponytail with a feather, hooded jerkin, bracers, quiver, torn cloak, tall boots. Her longbow is slung across her back here, freeing both hands.

SCENE — THE OFFERED HAND:
Knee-up, standing on a mossy forest path, turned three-quarters toward the viewer. She has extended one hand toward the viewer, palm up, fingers slightly curled — and immediately regretted it: her arm is not fully straight, her shoulders are drawn in, and she has turned her face away and down, looking off to the side with her ears visibly reddened and her lips pressed thin. Her other hand grips her own elbow. The gesture is sincere and awkward at once.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, dappled forest light, soft rim light along her arm and hair, blush on the ear tips rendered with fine hatching. Sharp clean line work, detailed mossy woodland background, shallow depth of field with the offered hand nearest the viewer and sharpest.
```

**`assets/wallpaper/elfarcher_trust.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
The same elf: long pointed ears, long pale hair in a high ponytail with a feather, hooded jerkin, bracers, quiver, torn cloak, tall boots. Her cloak is pulled around her shoulders like a blanket here and her bow leans against the wall.

SCENE — GRILLING A FISH IN THE DUNGEON:
Waist-up, crouched on her heels beside a small campfire in a cramped stone dungeon chamber. She is holding a stick over the flames with a whole fish skewered on it, leaning so far forward that her face is almost in the fire. Her eyes are huge and fixed on the fish, her mouth is open and she is very obviously about to drool; one hand hovers as if to grab it early. All her usual composure is gone. Firelight throws her shadow enormous on the wet brick wall behind; her pack and a discarded arrow lie beside her.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, the fire as the single hard light source lighting her from below, deep black beyond the firelight, sparks and smoke rising, glistening highlights on the fish. Sharp clean line work, detailed damp stonework, warm and comic cinematic composition.
```

**`assets/wallpaper/elfarcher_love.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
The same elf: long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin loosened at the collar, bracers, torn cloak, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, SQUIRMING:
Knee-up, standing in a sunlit forest clearing, facing the viewer. Both hands are clasped behind her back, which pushes her shoulders back and makes her sway — one boot is turned inward on its toe and her hips are twisted, her whole body making a soft S-curve of embarrassment. She is looking at the viewer through her lashes with her chin tucked down, ears bright red, and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. Petals and light drift around her.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, soft backlight through leaves haloing her hair, gentle bloom, blush rendered with fine hatching on the ears and cheeks. Sharp clean line work, softly blurred forest background, warm intimate cinematic composition.
```

---

### 아녜스 (`nun_*`)

**`assets/wallpaper/nun_awkward.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
A young nun with shoulder-length pale hair framing her face, wearing a black habit: a white headband under a black veil with a small leaf ornament at the temple, a high-collared black dress with wide bell sleeves, a long pale stole down the front, a sash at the waist, and a long skirt with a high slit over heeled shoes. She carries a censer on a fine chain. Gentle, downcast features.

SCENE — PRAYING IN THE RUIN:
Full figure, kneeling in the nave of a roofless ruined medieval cathedral. Her hands are clasped at her chest and her head is bowed, eyes closed. The censer rests on the broken flagstones beside her, a thin line of smoke rising from it. Shattered pews and fallen masonry stretch away on both sides; above her the ribs of the vault are open to a heavy overcast sky. Ash and paper fragments drift in the still air.

RENDERING:
Black and white only, no colour at all. Rich full tonal range from deep black to pure white, soft flat overcast light from above with strong local contrast, drifting particles, fine crosshatched detail in the fabric and the ruined stonework. Sharp clean line work, highly detailed gothic ruin background, hushed cinematic composition.
```

**`assets/wallpaper/nun_friend.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
The same nun: shoulder-length pale hair, white headband under a black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a plain wooden refectory table, seen from across it. In front of her is a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side. She has a large forkful raised to her mouth and her eyes are closed in genuine, blissful delight; one cheek is already full and she is smiling around it. Her free hand is pressed to her cheek in appreciation. Everything about her says this is delicious. A second untouched plate sits opposite, pushed slightly away.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, warm side light from a window, steam rising from the pie, glistening highlights on the crust and the fish's eye, fine detail in the wood grain. Sharp clean line work, detailed monastery interior, deadpan comic cinematic composition.
```

**`assets/wallpaper/nun_trust.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
The same nun: shoulder-length pale hair, white headband under a black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash, censer on a chain hanging from one hand.

SCENE — IN THE GRAVEYARD, LOOKING UP:
Waist-up, standing among leaning weathered headstones at dusk, her body turned away but her face tilted up toward a break in the clouds. She is smiling — a small, tired, bitter smile with no happiness in it — and her eyes are open and dry. The censer hangs still at her side, its smoke going straight up. Bare branches reach across the top of the frame; long grass moves around the stones.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, cold light breaking through heavy cloud from above and behind, strong rim light on her cheek and veil, deep shadow across the graves, drifting smoke. Sharp clean line work, highly detailed graveyard background, melancholy cinematic composition.
```

**`assets/wallpaper/nun_love.jpg`**

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
The same nun: shoulder-length pale hair, white headband under a black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash. Here the veil is pushed slightly back and more of her hair shows.

SCENE — THANK YOU:
Chest-up, very close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She is looking directly at the viewer and clearly saying thank you. Soft light falls from a high window to the left; motes drift through it.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, soft directional key light with gentle falloff, a bright halo of blown-out light behind her head, delicate hatching for the blush, glistening highlights in the eyes. Sharp clean line work, softly blurred chapel background, warm intimate cinematic composition.
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
