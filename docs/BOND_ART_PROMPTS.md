# 인연 — 필요한 그림 전부

인연 기능(`core/bond` · `screens/home/BondScreen`)에 들어가는 그림을 **한 판에**
모았습니다. 아래 순서대로 뽑으면 그날 바로 붙습니다.

| # | 무엇 | 장수 | 지금 | 급함 |
|---|---|---|---|---|
| 1 | 선물 로고 18종 | 2판 (7칸 + 11칸) | 없음 — 빈 액자로 뜸 | **높음** |
| 2 | 경험의 서 로고 3종 | 1판 (3칸) | 없음 | **높음** |
| 3 | 인연 단추 · 하트 | — | 코드 도형으로 그림 | 낮음 |
| 4 | 이야기 월페이퍼 16장 | 16판 | 사람당 1장뿐 | 중간 |

2번은 [`ITEM_ICON_PROMPTS.md`](ITEM_ICON_PROMPTS.md) 에 따로 있습니다.
3번은 안 그려도 됩니다 — 까닭은 아래 §3.

---

## 1. 선물 로고 18종 — `assets/sprites/gift_icon/`

가방의 **기타** 칸과 선물주기 창에 26px 로 붙습니다. **두 판으로 나눠**
뽑습니다 — 한 판에 열여덟을 넣으면 칸이 작아져서 1비트로 가릴 것이 없어집니다.

### 판 A — 얽힌 것 일곱

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

### 판 B — 아무나 줘도 되는 것 열하나

전부 1배입니다. 열하나나 두는 까닭: 좋아하는 것 하나만 있으면 그것을 다
쓰고 난 뒤에 할 일이 없어지는데, 인연은 **매일 조금씩** 쌓는 축이라 그날
줄 것이 늘 있어야 합니다.

| 로고 | 이름 |
|---|---|
| `gf_tea` | 따뜻한 차 |
| `gf_ice` | 아이스 아메리카노 |
| `gf_bread` | 갓 구운 빵 |
| `gf_apple` | 붉은 사과 |
| `gf_honey` | 꿀단지 |
| `gf_cheese` | 치즈 한 덩이 |
| `gf_soup` | 따뜻한 수프 |
| `gf_candy` | 박하사탕 |
| `gf_ribbon` | 비단 리본 |
| `gf_candle` | 밀랍 초 |
| `gf_music` | 오르골 |

**고기는 여기 없습니다.** 비앙카가 싫어하는 것이 토끼 고기라, 고기붙이가
여럿이면 "고기를 싫어한다" 로 읽혀서 그 한 줄이 흐려집니다.

### 열여덟이 다 갈려야 합니다

한 목록 안에 세로로 줄지어 섭니다. **먹는 것이 열둘**이라 그 열둘이 서로
안 헷갈리는 것이 이 판들의 제일 어려운 부분입니다. 26px 에서 남는 윤곽으로
가릅니다.

| 로고 | 26px 윤곽 |
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

### 프롬프트 — 판 A (7칸)

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

### 프롬프트 — 판 B (11칸 + 빈 칸 하나)

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

### 슬라이스

두 판을 따로 넣고 뒤엣것에 `append` 를 답니다 — 같은 폴더에 이어 붙입니다.

```json
{
  "file": "gift-a.jpg",
  "name": "gift_icon",
  "expect": [7, 1],
  "labels": [
    "gf_cookie", "gf_pie", "gf_carrot", "gf_rabbit",
    "gf_flower", "gf_bible", "gf_gong"
  ]
},
{
  "file": "gift-b.jpg",
  "name": "gift_icon",
  "expect": [6, 2],
  "labels": [
    "gf_tea", "gf_ice", "gf_bread", "gf_apple", "gf_honey", "gf_cheese",
    "gf_soup", "gf_candy", "gf_ribbon", "gf_candle", "gf_music", "_skip"
  ],
  "append": true
}
```

빈 열두 번째 칸은 `_skip` 으로 받아 두고 슬라이스 뒤에 지웁니다 — 이름을
안 주면 칸 수가 안 맞아 슬라이스가 멎습니다.

---

## 2. 경험의 서 로고 3종

[`ITEM_ICON_PROMPTS.md`](ITEM_ICON_PROMPTS.md) 에 프롬프트가 있습니다.
**성서(`gf_bible`)와 안 겹치게** — 성서에만 십자가 있습니다.

---

## 3. 하트와 인연 단추 — **안 그려도 됩니다**

하트 게이지는 코드가 그립니다 (`BondScreen` 의 `Heart`) — 45도로 돌린
마름모를 채우거나 비웁니다.

그림으로 안 둔 까닭: 빈 하트와 찬 하트 **두 칸**이 필요한데, 흑백 1비트에서
9~13px 짜리 하트 둘을 테두리만으로 가르는 것이 실제로 잘 안 됩니다. 열 칸이
나란히 서므로 하나만 애매해도 세는 것이 어긋납니다.

인연 단추(`hero_ui/bond`)도 이미 코드 도트가 있습니다. **그리고 싶으면**
아래 조건만 지키면 됩니다 — 30px 원 안, 흰 선, 다른 단추(`paper` 월페이퍼)와
윤곽이 안 겹칠 것.

---

## 4. 이야기 월페이퍼 — 16장

단계마다 한 장씩, 네 사람 × 네 단계입니다. **이야기를 다 보면 그 장면의
월페이퍼를 받습니다** (`readStory`).

지금은 사람당 한 장뿐이라 (`ui/wallpapers`) 어느 단계를 봐도 같은 그림이
뜹니다. 넉 장이 오는 날 `WALLPAPERS` 를 `<사람>_<단계>` 로 가릅니다.

### 파일 이름

```
assets/wallpaper/knightgirl_awkward.jpg   이졸데 · 어색한 관계
assets/wallpaper/knightgirl_friend.jpg    이졸데 · 우정
assets/wallpaper/knightgirl_trust.jpg     이졸데 · 신뢰
assets/wallpaper/knightgirl_love.jpg      이졸데 · 애정
… bunnyaxe_* · elfarcher_* · nun_* 도 같은 넷씩
```

### 단계가 **장면으로** 갈려야 합니다

넷이 다 "예쁘게 서 있는 그림" 이면 단계를 올린 값이 안 보입니다. 거리로
가릅니다 — 멀리서, 옆에서, 나란히, 가까이.

| 단계 | 장면 | 거리 | 시선 |
|---|---|---|---|
| 어색한 관계 | 각자 제 일을 하고 있다 | 전신, 멀리 | **안 마주친다** |
| 우정 | 같은 것을 보며 웃는다 | 무릎 위 | 옆을 본다 |
| 신뢰 | 등을 맡기고 서 있다 | 허리 위 | 정면, 담담 |
| 애정 | 한 사람만, 아주 가까이 | 가슴 위 | **정면, 눈을 맞춘다** |

### 프롬프트 — 이졸데 예시

나머지 셋은 아래 `CHARACTER` 문단만 갈아 끼웁니다. 인물 묘사는
[`CHARACTER_ART_PROMPTS.md`](CHARACTER_ART_PROMPTS.md) 의 것을 그대로 쓰십시오 —
거기와 다르게 적으면 얼굴이 딴사람이 됩니다.

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- No caption bar, no name plate, no banner, no signature, no watermark.
- This includes English, Korean, numerals, runes, and fake alien script.

FORMAT: one single illustration, landscape, 16:9, filling the frame edge to edge.

CHARACTER — ISOLDE, the knight:
A young woman in worn plate armour over a padded gambeson, a long surcoat to
the knee, hair tied back, a plain kite shield on her left arm and a straight
sword at her hip. Her face is calm and a little tired. No helmet.

SCENE — pick ONE of the four below:
(A) AWKWARD — Full figure, seen from far off across a training yard at dusk.
    She is checking the straps of her shield, turned three-quarters away.
    A second figure is implied only by a long shadow entering from the frame's
    edge. She is NOT looking toward it. Wide empty ground between them.
(B) FRIENDSHIP — Knee-up, seen from the side. She is laughing quietly with her
    head turned to the left, looking at something outside the frame. Her shield
    is set down against her leg. Warm interior — a tavern hearth behind her.
(C) TRUST — Waist-up, facing the viewer straight on, standing at ease with her
    sword point resting on the ground and both hands folded over the pommel.
    Behind her shoulder, the back of another figure's head and shoulder is
    visible at the frame's edge — they are standing back to back. Steady, level
    gaze. Night, a low fire lighting her from below.
(D) LOVE — Chest-up portrait, very close. She looks directly at the viewer,
    armour half unbuckled at the collar, hair loosened. One hand is raised
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

### 나머지 셋의 `CHARACTER` 문단

```
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
```

### 16장이 부담이면

**애정(D) 넷만 먼저** 뽑으십시오. 지금 있는 사람당 한 장을 애정 자리에 놓고,
나머지 셋은 그 한 장을 계속 쓰게 두면 됩니다 (지금 코드가 그렇게 돕니다).
값이 제일 큰 자리가 제일 먼저 갈리는 편이 낫습니다.

---

## 붙이는 차례

1. `gift-a.jpg` (7칸) · `gift-b.jpg` (12칸) → `tools/sprites.config.json` 에
   위 블록을 더하고 `python tools/slice.py`
2. `book.jpg` (3칸) → 같은 방법 ([`ITEM_ICON_PROMPTS.md`](ITEM_ICON_PROMPTS.md))
3. 월페이퍼는 `assets/wallpaper/` 에 그대로 넣고 `src/ui/wallpapers.ts` 에
   줄을 더합니다 (번들러가 `require` 를 정적으로 읽으므로 **손으로** 적어야
   합니다 — 그 파일 머리말에 까닭이 있습니다)
