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
| §B6 | 대화 배경 한 장 | 세로 1장 | `bg_talk` |

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

**자르지 않습니다.** `assets/wallpaper/<사람>_<단계>.jpg` 로 넣고
`src/ui/wallpapers.ts` 에 줄을 더합니다 — 번들러가 `require` 를 정적으로
읽으므로 손으로 적어야 합니다 (그 파일 머리말에 까닭이 있습니다). 아직 안
온 단계는 지금 있는 한 장으로 떨어지므로 (`wallpaperOf`), **한 장씩 들어와도
그때그때 붙습니다.**

| 파일 | 장면 |
|---|---|
| `knightgirl_awkward` | 기사답게 인사한다 |
| `knightgirl_friend` | 목욕 중에 문이 열려 비누를 던진다 |
| `knightgirl_trust` | 엣헴— 하고 자랑한다 |
| `knightgirl_love` | 임무를 끝내고 노을 아래 웃는다 |
| `bunnyaxe_awkward` | 술집에서 진상 손님을 혼낸다 |
| `bunnyaxe_friend` | 제 특제 칵테일을 먹어 보라고 내민다 |
| `bunnyaxe_trust` | 고백하려 방문 앞에 서 있다 |
| `bunnyaxe_love` | 손을 꼼지락거리며 부끄럽게 웃는다 |
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

### 두 번 고쳐서 지금 모양이 됐습니다

**첫 번째 — 성인물처럼 나왔다.** 모델이 "흑백 · 미소녀 · 극적인 조명" 을
그쪽으로 읽습니다. 그래서 `CONTENT RULES` 문단을 따로 두고, 표지(`cover`)가
아니라 **삽화**(`interior illustration`)라고 부르고, 카메라를 눈높이로
못 박았습니다.

**두 번째 — 너무 경건하게 나왔다.** 이번엔 반대로 갔습니다. `cinematic` ·
`volumetric light shafts` · `solemn` · `dramatic` 같은 말을 넣어 두었더니
**미술관에 걸린 그림**이 나왔습니다 — 인물은 작고 건축은 거대하고 빛은
장엄한. 라이트노벨 삽화는 그 반대입니다.

그래서 모든 프롬프트에 `ART DIRECTION` 문단을 넣고 셋을 못 박았습니다.

1. **인물이 주인공이다.** 화면의 대부분을 인물이 차지하고, 배경은 그보다
   **흐리고 덜 자세하게** 그립니다 — 배경이 인물보다 공들여 그려지면
   그때부터 풍경화가 됩니다
2. **얼굴이 예뻐야 한다.** 큰 눈에 밝은 하이라이트, 작은 코와 입, 부드러운
   볼. 감정은 조명이 아니라 **얼굴에서** 나옵니다
3. **장엄한 말은 다 뺐습니다.** `cinematic` · `volumetric` · `epic` ·
   `solemn` 대신 `warm` · `inviting` · `charming` 을 씁니다. 진지한 장면도
   무겁게가 아니라 **조용하게** 그립니다

---

### 이졸데 (`knightgirl_*`)

**`assets/wallpaper/knightgirl_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION (this is the look we want):
- The CHARACTER is the subject and fills most of the frame. The background supports her and is drawn SOFTER, simpler and with less contrast than she has.
- Appealing modern anime face: large expressive eyes with bright highlights, small nose and mouth, soft cheeks, fine strands of hair.
- Clean confident inked linework with cel-style shading plus light screentone. Not a painted gallery piece.
- Warm and inviting. NO grand cinematic mood, NO thick volumetric god-rays, NO epic architecture dwarfing her, NO museum-painting solemnity.
- The emotion comes from her FACE, not from the lighting.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, everything covered.
- No cleavage, no underwear, no skin-tight emphasis, no suggestive posing.
- Camera at eye level. No low angles looking up.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair past her waist. A slim jewelled circlet with one small gem on her forehead. Silver plate armour with layered pauldrons and a fitted breastplate over a high-necked underlayer, a cape with an embroidered hem. Calm, polite, faintly tired features. Pretty and approachable, not stern.

SCENE — A FORMAL KNIGHT'S GREETING:
Knee-up, close enough that her face reads clearly. She stands in a stone hall, angled three-quarters toward the viewer, her right fist over her heart and her left hand resting on her sword's pommel, upper body bowed a few degrees in a correct, slightly stiff salute. Her eyes are lowered — she has not looked up yet — and her mouth is a small polite line. She is being proper because she does not yet know what else to be. The hall behind her is drawn lightly: a suggestion of arches and one window, soft and out of focus.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. One gentle light source from the window behind, soft falloff, a few floating motes. Background kept simple and low-contrast so she stands out.
```

**`assets/wallpaper/knightgirl_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the bathhouse behind her is soft and simple.
- Appealing modern anime face with large expressive eyes. Comedy manga energy — this panel should make the reader smile.
- Clean inked linework, cel shading, light screentone. Warm and endearing, never grand or dramatic.

CONTENT RULES (a classic manga bath gag — comedic, not sexual):
- Her BARE SHOULDERS, COLLARBONES and the tops of her arms ARE visible above the water. This is a normal bath scene and she should read as actually bathing, not as a floating head.
- The WATERLINE sits across her upper chest, just below the collarbones. Everything from there down is hidden by opaque white water and steam — draw the water surface as solid white with no transparency.
- Do NOT draw a cleavage line, breasts, nipples, or any chest contour. Do NOT angle the camera down into the tub. Do NOT render glistening wet skin as a feature.
- Camera at eye level, framed from just below her shoulders upward. Wholesome and funny, all-ages.

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
Framed from just below her shoulders upward. She is in a round wooden bath tub in a small bathhouse, sitting up with her shoulders and collarbones above the waterline, steam everywhere. The door at the frame's edge has just swung open and light spills in. One arm is up in a hasty, uncoordinated throw — a bar of soap tumbles toward the viewer with a few droplets, and a wooden bucket wobbles through the air beside it. The throw is a reflex of panic, weak and badly aimed, not an attack. Her other forearm is drawn up flat across her upper chest in a hasty attempt to cover herself — the arm reads as the cover, so nothing needs to be shown.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. A couple of small motion arcs behind the soap, one sweat drop, heavy blush hatching. Backlight through the open door, white steam. Wooden interior kept simple.
```

**`assets/wallpaper/knightgirl_trust.jpg`**

> 4번(애정)과 **겹치면 안 됩니다.** 둘 다 웃는 얼굴이라 자칫 같은 그림이
> 되는데, 다섯 가지를 갈라 두었습니다 — 거리(무릎 위 ↔ 가슴 위) · 시선(눈을
> 감았다 ↔ 눈을 맞춘다) · 감정(자랑 ↔ 부끄러움) · 시간(한낮 ↔ 노을) ·
> 옷(멀쩡하다 ↔ 너덜너덜하다).

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the background is drawn LIGHTLY and softly, with much less contrast than she has.
- Appealing modern anime face, slightly rounded and cute proportions. Comedy manga energy — this panel should make the reader grin.
- Clean inked linework, cel shading, light screentone.
- Bright, sunny, playful. NO cinematic mood, NO god-rays, NO epic architecture, NO solemnity of any kind.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed and fully armoured, collar closed.
- No cleavage, no skin-tight emphasis, no suggestive posing, no low angles.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair, a slim jewelled circlet, silver plate armour with layered pauldrons over a high-necked underlayer, a cape with an embroidered hem. Her armour is CLEAN and INTACT here — at most one small scuff on a pauldron. Pretty and approachable, not stern.

POSE AND EXPRESSION — THIS IS THE WHOLE PICTURE:
She is DOING A LITTLE "AHEM!" — puffed up with pride and openly showing off, and it is adorable rather than arrogant.
- Standing straight and tall, chest puffed out, chin lifted high, back arched slightly backward. She is making herself as big as possible.
- BOTH FISTS PLANTED ON HER HIPS, elbows out wide. Classic proud pose.
- EYES CLOSED in a smug, self-satisfied curve (^ ^ shapes), eyebrows raised high, a big pleased grin with the corners pulled up.
- A light blush across the cheeks — she knows she is bragging and is enjoying it.
- Her cape flares out behind her as if she flicked it on purpose.
- Read her as "엣헴—! 어때요, 제가 해냈다니까요?" — boastful, cute, completely harmless. Do NOT make her look modest, tearful, shy, or solemn.

SCENE — SHOWING OFF, IN BROAD DAYLIGHT:
Knee-up, seen straight on from a little distance so her whole proud stance reads — NOT a tight face close-up. She stands in the middle of the frame in bright midday light. Her sword is sheathed at her hip, untouched. Behind her, a simple sunny courtyard: a low wall and one tree, drawn softly and lightly. A few small manga sparkle marks pop around her head and shoulders.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Bright even daylight, minimal shadows, a couple of small speed lines under the cape flare, sparkle marks. Background low-contrast and simple.
```

**`assets/wallpaper/knightgirl_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- Close character portrait. Her face is the whole picture; the sunset field behind her is soft, blurred and low-contrast.
- Appealing modern anime face: large expressive eyes with bright highlights, soft cheeks, fine hair strands.
- Clean inked linework, cel shading, light screentone. Warm, sweet, charming.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. The battle damage is to her ARMOUR AND CLOAK, not to her modesty — the underlayer stays intact and closed at the throat.
- No cleavage, no exposed chest, no torn clothing revealing skin below the collarbone, no suggestive posing, no low angles.

CHARACTER — ISOLDE, a young knight, straight out of a hard fight:
Very long pale hair, now loose and dishevelled with strands stuck to her cheek; the circlet is knocked slightly crooked. Her armour has taken a beating — one pauldron is gone entirely, the breastplate is dented and scored with deep scratches, a buckle hangs loose. The cape is badly torn: the hem is ripped into long ragged tatters and a wide tear runs up one side, so it hangs in strips. Her sleeve is shredded at the forearm and the wrapping underneath has come loose and trails. Soot and dust on the armour, a smear of dirt across one cheek, a small bandage on her temple. Everything is ruined EXCEPT that the high-necked underlayer beneath the breastplate is whole and closed.

SCENE — AFTER THE MISSION, AT SUNSET:
Chest-up, close, facing the viewer. She has just come back and is smiling — a real, uncontrolled smile she is clearly not used to making. She looks straight at the viewer, but her eyes flick very slightly aside and her cheeks are flushed: happiness and embarrassment at once. One hand is raised just into the bottom of the frame, palm open, as if she had reached out and then thought better of it. Torn cloak strips and dust drift in the wind around her. A low sun and a soft field behind her, drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft rim light from behind catching the edges of her hair and the ragged cloth, gentle bloom, blush hatching on the cheeks, background softly blurred.
```

---

### 비앙카 (`bunnyaxe_*`)

> **옷을 잘못 적어 두었습니다.** `선술집 점원복 + 두건` 으로 썼는데, 그건
> 만들려다 접은 기본 스킨입니다 (`docs/BIANCA_BASE_SKIN.md` — 한 벌에 그림이
> 스물일곱 장이라 걷었습니다). 게임 안의 비앙카는 **바니걸**입니다 —
> 전투 도트도 도감 초상도 다 그것입니다.
>
> 아래 넷은 다 바니걸로 고쳤습니다. 옷이 옷이니만큼 `CONTENT RULES` 에
> **가슴·엉덩이·허벅지를 강조하지 말 것**을 따로 적어 두었습니다 — 그 옷을
> 입은 채로도 얼굴이 주인공이어야 합니다.

> 넷이 안 겹치게 갈라 둔 것: 1번은 **옆을 보고**(손님) 전신, 2번은 **눈을
> 맞추고** 잔을 들이밀며 가슴 위, 3번은 **문을 보고** 있어 시선이 아예 없는
> 전신, 4번은 **눈을 맞추고** 손을 꼼지락거리는 가슴 위입니다.
>
> 2번과 4번이 둘 다 눈을 맞추지만, 2번은 **잔이 주인공**이고 활짝 웃는
> 얼굴이며 4번은 **손이 주인공**이고 참으려다 새어 나오는 웃음입니다.

**`assets/wallpaper/bunnyaxe_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the tavern behind her is drawn simply and with less contrast.
- Appealing modern anime face with large expressive eyes. Lively comedy manga energy.
- Clean inked linework, cel shading, light screentone. Fun and warm, not cinematic or grim.

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume she wears for work. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO cleavage line drawn as a feature, NO butt or thigh focus, NO low camera angles, NO leaning-forward chest poses.
- Camera at eye level. Wholesome and funny, all-ages. The picture is about her face and the situation.

CHARACTER — BIANCA, a tavern girl who fights:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. She wears a BUNNY-SUIT stage costume: a bunny-ear headband, a black strapless leotard with a small bowtie at the collar, a fluffy round tail, sheer black legwear with one garter strap on the thigh, and tall lace-up heeled boots. Over her right shoulder, strapped on top of the costume, one battered steel PAULDRON — the only piece of armour she owns. She carries an enormous single-bladed woodcutter's axe as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure, seen a little from the side. One boot is planted on a toppled bench and she leans out to jab a finger down at a big drunk man who has fallen backward at the bottom of the frame — seen from behind, hands raised, drawn small and simple. Her other hand rests the axe over her shoulder. She is looking DOWN AT HIM, not at the viewer. Mouth open mid-scold, one eyebrow up, eyes bright: she is telling him off and enjoying it. A tankard and a couple of cards tumble through the air. The tavern behind is a soft suggestion of tables and lamps.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone, a few bold manga action lines. Warm lamplight, simple background, high contrast kept on HER.
```

**`assets/wallpaper/bunnyaxe_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER'S FACE and the glass fill the frame; the bar behind her is simple and low-contrast.
- Appealing modern anime face with large expressive eyes and a big open grin. She is looking RIGHT AT THE VIEWER.
- Clean inked linework, cel shading, light screentone. Cheerful and inviting.

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO cleavage line drawn as a feature, NO butt or thigh focus, NO low camera angles.
- She leans on the bar but it is NOT a chest-forward pose — her weight is on her ELBOWS, the camera is at eye level, and the framing is tight on her face and the glass.

CHARACTER — BIANCA:
Short tousled bob, freckles. BUNNY-SUIT costume: bunny-ear headband, black strapless leotard with a small bowtie at the collar, fluffy round tail, sheer black legwear, tall lace-up heeled boots. One battered steel pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Chest-up, close, both elbows on a wooden bar, pushing a tall glass toward the viewer — the glass is large in the foreground, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge, eyebrows raised in expectation, eyes locked on the viewer, clearly saying "drink it". Her free hand gives a thumbs-up. A few bottles behind her, drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Warm lamplight, gentle foreshortening on the glass, a few white highlights on the ice, background kept simple.
```

**`assets/wallpaper/bunnyaxe_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the corridor is simple and low-contrast.
- Appealing modern anime face with large expressive eyes; heavy blush drawn with manga blush lines.
- Clean inked linework, cel shading, light screentone. Sweet and charming, gently funny.

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume she wears for work. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO butt or thigh focus, NO low camera angles, NO suggestive posing.
- She is turned toward the DOOR, not toward the viewer — the camera catches her from the side, and she never makes eye contact.

CHARACTER — BIANCA, a tavern girl who fights:
A lively young woman with a short tousled bob and freckles. BUNNY-SUIT stage costume: a bunny-ear headband, a black strapless leotard with a small bowtie at the collar, a fluffy round tail, sheer black legwear, tall lace-up heeled boots — but tonight it is neat and pressed, the bowtie straightened, her hair brushed, a small ribbon tied to one bunny ear. No pauldron, no axe anywhere: she left the armour behind on purpose.

SCENE — OUTSIDE THE DOOR, ABOUT TO KNOCK:
Full figure seen from the side, standing in a narrow lamp-lit corridor with her back lightly against the wall beside a closed wooden door. She stares at the DOOR, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, eyes squeezed half-shut, mouth caught between a nervous grimace and an enormous helpless smile — she has been standing here a while and cannot make herself knock. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Heavy blush hatching plus two small blush lines, one sweat drop. A single warm lamp, soft falloff, corridor drawn simply.
```

**`assets/wallpaper/bunnyaxe_love.jpg`**

> 3번과 안 겹치게: 3번은 **문을 보고** 전신에 긴장, 4번은 **눈을 맞추고**
> 가슴 위로 가까이, 그리고 행복이 새어 나옵니다.

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- Close character portrait. Her FACE and her FIDGETING HANDS are the whole picture; the room behind her is soft, warm and low-contrast.
- Appealing modern anime face: large expressive eyes with bright highlights, soft round cheeks, heavy manga blush.
- Clean inked linework, cel shading, light screentone. Sweet, warm, a little bashful — the reader should want to smile back.

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO butt or thigh focus, NO low camera angles, NO suggestive posing.
- This is a tight chest-up shot — most of the costume is out of frame anyway. The picture is her face and her hands.

CHARACTER — BIANCA:
Short tousled bob, freckles. BUNNY-SUIT costume: bunny-ear headband, black strapless leotard with a small bowtie at the collar. The bunny ears are drooping slightly, which makes her look even more bashful. No pauldron, no axe.

POSE AND EXPRESSION — THIS IS THE WHOLE PICTURE:
She is EMBARRASSED AND QUIETLY HAPPY at the same time, and cannot keep still.
- Both hands are up near her chest, FINGERS FIDGETING — index fingers pressed together and poking at each other, knuckles a little tense. Draw the hands clearly and fairly large; the fidget is half the picture.
- Shoulders drawn up and in, head tilted down a little, so she is looking UP at the viewer through her lashes — she IS making eye contact, shyly.
- Cheeks deeply flushed with manga blush lines across the nose; a tiny sweat drop at the temple.
- Mouth pulled into a small closed-lip smile that keeps escaping into a wider one — she is trying to hold it in and failing.
- Read her as "…뭐, 뭘 봐. 그런 거 아니거든." — flustered, pleased, completely transparent about it. She is normally loud and confident, and that is exactly why this is charming.

SCENE — AFTER, IN THE QUIET TAVERN:
Chest-up, close, facing the viewer. She stands in the empty tavern after closing, a lamp behind her throwing a warm glow; chairs are up on the tables, drawn softly and simply. One strand of hair has fallen across her cheek. A couple of small manga sparkle marks near her shoulders.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft warm key light from behind and to one side, gentle bloom, delicate blush hatching, bright highlights in the eyes, background softly blurred.
```

---

### 리안느 (`elfarcher_*`)

> 2번(우정)과 4번(애정)이 겹쳤습니다 — 둘 다 숲에서 귀가 빨개진 채 수줍어
> 하는 그림이었습니다. 갈랐습니다: **2번은 손이 주인공**이고 얼굴은 돌려
> 있어서 눈이 안 맞고, **4번은 몸 전체가 주인공**이고 눈을 맞춥니다.

**`assets/wallpaper/elfarcher_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the forest is a soft, simple backdrop with much less contrast than she has.
- Appealing modern anime face with large expressive eyes and long pointed ears.
- Clean inked linework, cel shading, light screentone. Cool and pretty, not epic — NO grand god-ray forest cathedral.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed; her tunic reaches mid-thigh and she wears leggings and tall boots.
- The camera is slightly below her because she is in a tree, but it frames her FACE and the branch — never up her clothing. No thigh focus, no suggestive posing.

CHARACTER — RIANNE, an elf archer:
A slender elf with long pointed ears and very long pale hair in a high ponytail tied with a feather. A short-sleeved hooded jerkin over a fitted tunic, a wide belt, leather bracers, a quiver at her hip, a torn ragged-hemmed cloak, leggings and tall lace-up boots. A longbow taller than she is. Cool, distant expression.

SCENE — LOOKING DOWN FROM THE BRANCH:
Waist-up to knee-up, close. She is perched on a thick branch, one knee drawn up, her bow across her lap and an arrow held loosely between two fingers. She looks straight down at the viewer, chin lowered, eyes half-lidded and evaluating — not hostile, not welcoming. Her ponytail and torn cloak hang past the branch. A few leaves drift through the frame. The forest behind is soft and simple.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Gentle light through leaves, a few floating motes, background kept low-contrast.
```

**`assets/wallpaper/elfarcher_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the forest path is soft and simple.
- Appealing modern anime face with large expressive eyes and long pointed ears; the reddened ear tips are the charm of this picture.
- Clean inked linework, cel shading, light screentone. Warm and a little bashful.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, leggings and tall boots.
- No cleavage, no thigh focus, no suggestive posing, no low angles.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair in a high ponytail with a feather, hooded jerkin over a fitted tunic, bracers, quiver, torn cloak, leggings, tall boots. Her longbow is slung across her back, freeing both hands.

SCENE — THE OFFERED HAND (the HAND is the subject of this picture):
Chest-up, very close, turned mostly AWAY from the viewer. Her open HAND is thrust into the foreground, palm up, fingers slightly curled — it is the biggest, nearest and sharpest thing in the frame, filling the lower third. She has extended it and immediately regretted it: the arm is not fully straight and her shoulders are drawn in. Her FACE is turned away and down over her shoulder, so she is NOT making eye contact with the viewer — we see her in profile, lips pressed thin, one ear tip bright red. Her other hand grips her own elbow. Daylight on a mossy path.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Dappled light, soft rim light along her arm and hair, blush hatching on the ear tips, background softly blurred.
```

**`assets/wallpaper/elfarcher_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER and the fish fill the frame; the dungeon wall behind is simple and dark.
- Appealing modern anime face with huge round eyes locked on the food. Comedy manga energy — this should be funny and cute.
- Clean inked linework, cel shading, light screentone. NOT grim or atmospheric — the dungeon is just a room here.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully clothed, cloak wrapped around her shoulders.
- No cleavage, no thigh focus, no suggestive posing, no low angles.

CHARACTER — RIANNE:
Long pointed ears, long pale hair in a high ponytail with a feather, hooded jerkin, bracers, leggings, tall boots. Her torn cloak is pulled around her shoulders like a blanket; her bow leans against the wall.

SCENE — GRILLING A FISH IN THE DUNGEON:
Waist-up, crouched on her heels beside a small campfire. She holds a stick over the flames with a whole fish skewered on it, leaning so far forward that her face is almost in the fire. Her eyes are huge and locked on the fish, her mouth open, very obviously about to drool; one hand hovers as if to grab it early. All her usual composure is gone. Firelight from below; the wall behind is drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Comedic manga marks — a small sweat drop, sparkle highlights on the fish. Warm firelight from below, background dark and simple.
```

**`assets/wallpaper/elfarcher_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the clearing behind is soft, bright and simple.
- Appealing modern anime face with large expressive eyes and long pointed ears; red ear tips and a shy smile are the charm of this picture.
- Clean inked linework, cel shading, light screentone. Sweet, warm, gently romantic.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, tunic to mid-thigh, leggings and tall boots.
- Hands behind the back is a SHY fidget, NOT a chest-forward pose — shoulders rounded and slightly hunched, weight shifted, head tucked down.
- No cleavage, no chest emphasis, no thigh focus, no low angles.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin, bracers, leggings, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, FIDGETING (her WHOLE BODY is the subject):
Full figure, seen from a little distance so the whole fidgeting stance reads — NOT a face close-up. She faces the viewer squarely in a sunlit clearing and MAKES EYE CONTACT. Both hands are clasped behind her back and she is rocking slightly on her heels; one boot is turned inward on its toe. Her shoulders are drawn up and in, her chin is tucked down, and she looks at the viewer through her lashes with her ears bright red and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. A few petals drift past.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft backlight through leaves haloing her hair, gentle bloom, blush hatching on the ears and cheeks, background softly blurred.
```

---

### 아녜스 (`nun_*`)

> 넷 중 셋이 **눈을 감고** 있었습니다 (기도 · 파이 · 감사). 그러면 표정으로
> 단계를 가른다는 규칙이 아녜스에게만 안 먹습니다. 2번을 **눈을 뜨고 정면을
> 보는** 쪽으로 바꿨습니다 — 지금은 감음(1) · 뜸(2) · 위를 봄(3) · 접힌 눈(4)
> 으로 넷이 다 다릅니다.

**`assets/wallpaper/nun_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame. The ruin behind her is drawn LIGHTLY — a few broken arches, low contrast, softly out of focus.
- Appealing modern anime face with large expressive eyes and long lashes; her face must read clearly even with her head bowed.
- Clean inked linework, cel shading, light screentone.
- Quiet, NOT grand. NO cathedral-scale architecture dwarfing her, NO heavy god-rays, NO religious-painting solemnity. She is a girl praying, not an altarpiece.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.

CHARACTER — AGNES, a young nun:
Shoulder-length pale hair framing her face under a white headband and a black veil with a small leaf ornament at the temple. A high-collared black habit with wide bell sleeves, a long pale stole down the front, a sash at the waist, a long plain skirt. She carries a censer on a fine chain. Gentle features.

SCENE — PRAYING IN THE RUIN:
Full figure, seen from the side at a little distance, kneeling. Her hands are clasped at her chest, her head bowed deeply, eyes closed with long lashes drawn clearly. We see her in profile — she is not aware of the viewer at all. The censer rests beside her with a thin line of smoke. A few loose strands of hair have escaped the veil. Ash and paper fragments drift slowly past. The broken chapel is only suggested behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft even light from above, a few drifting particles, background simple and low-contrast.
```

**`assets/wallpaper/nun_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER and the pie fill the frame; the refectory behind is simple.
- Appealing modern anime face with big round EYES OPEN and sparkling, looking straight at the viewer, cheeks full. Comedy manga energy — deadpan and funny.
- Clean inked linework, cel shading, light screentone. Warm and silly.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar, long sleeves.
- No cleavage, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, a high-collared black habit with wide bell sleeves, a pale stole, a sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a wooden table, seen from across it. In front of her sits a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side — drawn large in the foreground. She has a large forkful raised and is looking STRAIGHT AT THE VIEWER with wide, bright, sparkling eyes, eyebrows up, clearly saying "이거 진짜 맛있어요, 드셔 보세요". One cheek is already full and she is smiling around it. Her free hand pushes a second plate toward the viewer. She has no idea anything is wrong.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Small comedic manga marks — sparkles around her face, a single sweat drop over the fish head. Warm side light, steam rising, background simple.
```

**`assets/wallpaper/nun_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the headstones behind are a soft, simple suggestion.
- Appealing modern anime face with large expressive eyes; the bitterness behind her smile is the whole picture.
- Clean inked linework, cel shading, light screentone.
- Quiet and a little sad, NOT epic. NO dramatic storm-lit landscape, NO towering scenery.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash, a censer on a chain hanging from one hand.

SCENE — IN THE GRAVEYARD, LOOKING UP:
Chest-up, close, her body turned away but her face tilted up toward a break in the clouds. She is smiling — a small, tired, bitter smile with no happiness in it — and her eyes are open and dry. A strand of hair moves across her cheek. The censer hangs still at her side. A couple of leaning headstones and bare branches, drawn simply behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft light from above and behind catching her cheek and veil, background low-contrast and simple.
```

**`assets/wallpaper/nun_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- Close character portrait. Her smile is the whole picture; the chapel behind is soft and blurred.
- Appealing modern anime face: large eyes crinkled shut with happiness, soft cheeks, bright highlights.
- Clean inked linework, cel shading, light screentone. Warm, bright, charming.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar closed.
- No cleavage, no undressing, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament — here the veil is pushed slightly back and more of her hair shows — high-collared black habit with wide bell sleeves, pale stole, sash.

SCENE — THANK YOU:
Chest-up, close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She looks directly at the viewer and is clearly saying thank you. Soft light from a high window to the left; a few motes drift through it.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, fine screentone. Soft key light, a bright halo of blown-out light behind her head, delicate blush hatching, bright highlights in the eyes, background softly blurred.
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

---

## §B6 대화 배경 — `assets/sprites/bg_talk/`

대화 화면(`screens/home/TalkView`)이 뒤에 까는 그림입니다. 지금은 판 배경
한 장을 빌려 쓰는데 (`bg_chapter/01`), 저건 **가로로 긴 무대 그림**이라
세로 화면에 늘리면 위아래가 텅 비고 나무 몇 그루만 늘어집니다.

**한 장이면 됩니다.** 네 사람이 다 쓰므로 누구의 방도 아닌 자리여야 합니다.

### 이 그림에는 **비워 둘 자리가 정해져 있습니다**

화면 위에 두 가지가 얹힙니다.

```
┌─────────────────┐
│                 │  ← 위: 비어도 됨 (달·하늘)
│         ┌───────┤
│  여기만 │ 인물이 │  ← 오른쪽 절반: 사람이 선다. 비워 둘 것
│  보인다 │  선다  │
│         └───────┤
├─────────────────┤
│   대사창이 덮음   │  ← 아래 3분의 1: 무엇을 그려도 안 보인다
└─────────────────┘
```

그래서 **볼거리를 왼쪽 위 3분의 2에** 몰아야 합니다. 오른쪽에 탑이나 큰
나무를 세우면 인물과 겹쳐서 둘 다 안 읽힙니다.

### 선이 성글어야 합니다

이 그림 위에 **흰 글씨**가 올라갑니다 (대사창은 반투명 검정이라 완전히
가리지는 않습니다). 벽돌 한 장 한 장까지 그리면 글자가 무늬에 묻힙니다.
`bg_hero/hall` 정도의 성긴 선이 기준입니다 — 큰 형태 몇 개, 선 사이가 넓게.

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- No signature, no watermark, no letters, no numerals, no runes, no fake script.

SUBJECT: a single VERTICAL background plate for a visual-novel dialogue screen. Portrait orientation, 9:16 (for example 1080 x 1920). One image, not a sheet, no panels, no borders.

THE PLACE — a quiet stone terrace at night, at the edge of a keep:
- On the LEFT, a tall pointed ARCHWAY in a stone wall, empty and open, looking out into the dark. Its arch is drawn with two or three concentric lines only.
- Through and beyond the arch, a simple night sky with a large plain MOON, high and to the left, and three or four small stars. No clouds with detail — at most one long thin cloud band crossing the moon.
- Running across the LOWER-MIDDLE, a low stone PARAPET wall about waist height, drawn as two long horizontal lines with a few vertical joints. It reads as the edge of a balcony.
- Growing up the left wall, a sparse trail of IVY — a dozen simple leaf shapes on a thin stem, no more.
- Underfoot, a stone FLOOR suggested by three or four long lines converging slightly toward the centre. No tile grid, no cobbles.

COMPOSITION — this matters as much as the drawing:
- The RIGHT HALF of the image must stay almost EMPTY — flat dark wall or open night sky only. A character will stand there and must not overlap anything.
- The BOTTOM THIRD must stay simple and quiet: a dialogue box will cover it. Put nothing important below that line.
- All the visual interest belongs in the UPPER LEFT two thirds: the arch, the moon, the ivy.
- Leave a generous amount of empty black. This is a backdrop, not a scene.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Drawn as clean WHITE OUTLINES on solid pure black. Shapes are NOT filled in white — the black shows through them.
- Lines are sparse and far apart. Big simple forms only. Do NOT draw individual bricks, roof tiles, cobblestones, wood grain, or dense hatching — white text will be laid over this image and dense texture would swallow it.
- Chunky, clearly visible square pixels — every line a crisp hard-edged 1-2 pixel run.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No characters, no people, no animals, no furniture, no props. The place only.
```

### 슬라이스

```json
{
  "file": "bg-talk.png",
  "name": "bg_talk",
  "grid": [1, 1],
  "labels": ["night"],
  "size": 640,
  "noTrim": true,
  "allowFilled": true
}
```

**`noTrim` 이 중요합니다.** 슬라이서는 기본으로 검은 여백을 깎아 내는데,
이 그림은 오른쪽 절반이 일부러 비어 있으므로 그 절반이 통째로 잘려 나갑니다 —
비율이 9:16 에서 2:3 으로 바뀌고, 화면을 채울 때(`cover`) 왼쪽의 아치와
담쟁이가 잘립니다. 안 깎으면 359×640 으로 나와서 딱 맞습니다.

들어오면 `TalkView` 가 저절로 씁니다 — 없으면 판 배경으로 떨어지게 해
뒀습니다.

---
