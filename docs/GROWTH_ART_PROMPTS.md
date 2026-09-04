# 성장 체계 아트

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 다른 로고 문서
(`ICON_PROMPTS.md` · `STATUS_ICON_PROMPTS.md`)는 게임 수치에서 만들어지는데,
여기 것들은 수치가 아니라 **성장 규칙의 모양**에서 나옵니다
(`src/core/growth.ts`).

캐릭터가 자라는 세 축 — 등급 · 성 · 레벨 — 이 화면에서 쓰는 그림입니다.

| 시트 | 폴더 | 어디에 쓰나 | 칸 |
|---|---|---|---|
| §G1 | `assets/sprites/growth/` | 별 — 몇 성인가 | 3 |
| §G2 | `assets/sprites/rarity/` | 등급 표식 다섯 | 5 |
| §G3 | `assets/sprites/growth/` | 조각과 영약 | 2 |

§G1 과 §G3 은 **같은 폴더**로 들어갑니다. 셀 크기가 달라 시트는 따로지만,
자를 때 `name` 만 다르게 주면 한 폴더에 섞여도 충돌하지 않습니다.

## 지금은 코드 도트가 버티고 있습니다

`ui/sprites` 의 `STARS` 두 칸이 자리표입니다. 별 다섯이 안 보이면 몇 성인지
알 방법이 아예 없어서 임시로 그려 넣은 것이고, **최종 그림이 아닙니다.**
등급과 재료 둘은 아직 글자뿐입니다.

아트가 들어오면 폴더에 넣기만 하면 됩니다 — `Sprite` 가 폴더를 먼저 보고
없을 때만 코드 도트로 떨어지므로(`fallback`), 코드는 한 줄도 안 고칩니다.

## 이 셋을 한 파일에 둔 이유

셋이 **한 화면에 같이 뜹니다.** 캐릭터 창을 열면 이름 옆에 등급 표식이,
그 아래 별 다섯이, 그 아래 합성 단추에 조각이 나란히 섭니다. 따로 요청하면
같은 자리에 서는 것들이 서로 다른 굵기와 여백으로 들어옵니다 — 크리처
프레임에서 이미 겪은 문제입니다.

---

## §G1. 별 셋

### 무엇에 쓰나

캐릭터가 몇 성인지 (`core/growth` 의 `star`). 자리는 늘 **그 등급이 갈 수
있는 만큼** 그립니다 — 3성인 희귀와 3성인 신화는 전혀 다른 상태인데, 가진
만큼만 그리면 화면에서 똑같아 보입니다.

파티 칸에서 **10px**, 캐릭터 창에서 **14px** 로 뜹니다. 다섯 개가 80px 도
안 되는 폭에 나란히 서므로, 이 시트에서 제일 작게 쓰이는 그림입니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 빈 별 | 찬 별 | 각성한 별 |
| id | `star_off` | `star_on` | `star_awake` |

### 셋이 갈리는 방식

| | 가르는 것 |
|---|---|
| 빈 별 | **속이 비었다** — 윤곽선만. "아직 여기까지 안 왔다" |
| 찬 별 | **속이 찼다** — 통짜 흰 덩어리 |
| 각성 별 | 찬 별에 **바깥으로 뻗는 짧은 빛살 넷** |

빈 별을 "찬 별을 흐리게" 로 처리하지 않습니다. 투명도만 다르면 다섯 개가
한 덩어리로 보여서 몇 개인지 안 세어집니다. **모양이 달라야** 셉니다.

각성 별은 코드에서 **푸르게 물들입니다** (`tintColor`). 그림은 다른 둘과
똑같이 흰색으로 그리세요 — 색은 코드가 얹습니다. 대신 색이 안 보이는
자리에서도 갈려야 하므로 빛살로 한 번 더 갈라 둡니다.

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

### 받은 뒤

```json
{ "file": "<§G1 파일명>", "name": "growth", "expect": [1, 3],
  "labels": ["star_off", "star_on", "star_awake"] }
```

`tools/sprites.config.json` 에 넣고 `python tools/slice.py`. 코드는 안
고칩니다 — `ui/atoms` 의 `Stars` 가 이미 `growth` 폴더를 먼저 봅니다.

---

## §G2. 등급 표식 다섯

### 무엇에 쓰나

일반 · 희귀 · 영웅 · 전설 · 신화 (`core/growth` 의 `Rarity`). 지금은
글자 뱃지뿐이라, 캐릭터 목록을 훑을 때 **한글을 읽어야** 등급을 압니다.

캐릭터 창 이름 옆에서 **14px**, 도감 칸에서 **11px**.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 일반 | 희귀 | 영웅 | 전설 | 신화 |
| id | `common` | `rare` | `epic` | `legendary` | `mythic` |

### 순서가 보여야 합니다

이것만은 다른 아이콘 시트와 규칙이 정반대입니다. 보통 아이콘 한 벌은
**서로 안 닮는 것**이 목표인데, 등급은 **다섯이 한 줄기로 자라는 것**이
보여야 합니다 — 어느 것이 위인지 설명 없이 읽혀야 하니까요.

그래서 다섯이 같은 뼈대(아래가 뾰족한 방패)를 쓰고, **테두리의 겹 수**로만
갈립니다. 색이 없는 화면에서 "더 높다" 를 말하는 방법은 **더 겹쳐 있다**
하나뿐입니다.

| | 겹 |
|---|---|
| 일반 | 방패 하나. 아무것도 안 붙는다 |
| 희귀 | 방패 + 안쪽에 선 한 겹 |
| 영웅 | 방패 + 안쪽 한 겹 + 위에 뿔 둘 |
| 전설 | 위와 같고 + 양옆에 날개 한 쌍 |
| 신화 | 위와 같고 + 위에 빛살 왕관 |

크기는 다섯이 **똑같습니다.** 높은 등급이 커지면 목록에서 줄이 들쭉날쭉해
집니다 — 자라는 것은 장식이지 덩치가 아닙니다.

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

### 받은 뒤

```json
{ "file": "<§G2 파일명>", "name": "rarity", "expect": [1, 5],
  "labels": ["common", "rare", "epic", "legendary", "mythic"] }
```

자른 다음 `ui/atoms` 의 `Tag` 대신 쓰는 자리가 셋입니다 — `CharPopup` 의
이름 줄, `RecruitPopup` 의 결과와 도감 칸. 셋 다 `RARITY_NAME` 을 글자로
적고 있으므로, 그림이 오면 **글자 옆에** 붙이는 것부터 해 보고 그림만
남길지는 보고 정합니다. 등급 이름은 다섯 글자라 그림 하나로 대체하기에는
잃는 것이 있습니다.

---

## §G3. 조각과 영약

### 무엇에 쓰나

성을 올리는 데 드는 둘입니다 (`core/growth`).

- **조각** — 같은 캐릭터의 여벌. 둘이면 한 성입니다 (`starUpCost`)
- **강성의 영약** — 각성에 드는 것. 10판부터 우두머리에서 나옵니다

지금은 둘 다 글자뿐입니다 (`조각 12장`). 재료는 숫자 옆에 그림이 붙어야
"모으는 것" 으로 보입니다 — 골드와 다이아가 그런 것처럼.

캐릭터 창의 합성 줄에서 **11px**.

### 셀 순서

| 셀 | 1 | 2 |
|---|---|---|
| | 조각 | 강성의 영약 |
| id | `shard` | `elixir` |

### 둘이 갈리는 방식

| | 가르는 것 |
|---|---|
| 조각 | **깨진 결정 한 조각** — 유일하게 삐뚤빼뚤한 다각형 |
| 영약 | **목이 긴 병** — 유일하게 위가 좁고 아래가 둥근 |

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

### 받은 뒤

```json
{ "file": "<§G3 파일명>", "name": "growth", "expect": [1, 2],
  "labels": ["shard", "elixir"] }
```

§G1 과 같은 `growth` 폴더입니다. 자른 다음 `CharPopup` 의 합성 줄에서
`조각 12장` 앞에 `<Sprite set="growth" name="shard" size={11} />` 을,
각성 줄의 영약 앞에 같은 식으로 `elixir` 를 붙입니다.

---

## 안 만드는 것

**각성 연출.** 별 다섯이 푸르게 물드는 그 순간에 터지는 그림입니다. 지금
코드에 그 연출 자체가 없으므로, 그림만 받아 두면 쓰지도 않는 시트가 한 장
늘어납니다. 연출을 붙일 때 `BOSS_FX_PROMPTS.md` 와 같은 방식으로 프레임을
요청하는 것이 맞습니다.

**레벨 아이콘.** `Lv 42` 는 글자가 정확합니다. 숫자를 읽어야 하는 값에
그림을 붙이면 자리만 먹습니다.
