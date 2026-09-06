# 액자 모서리 — 판때기 넷의 귀퉁이

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 게임 수치가 아니라 **화면
구조**에서 나온 그림이라 읽어 올 소스가 없습니다.

**한 장, 두 칸입니다.**

| | |
|---|---|
| 어디에 쓰나 | 위 띠의 문 여섯 · 지갑 · 아래 띠의 다섯 칸 · 파티 넷 (`ui/Frame`) |
| 폴더 | `assets/sprites/ui_frame/` |
| 파일 이름 | `corner.png` · `corner_hi.png` |
| 모델 | Gemini |
| 요청 | **1번** (2칸 시트 한 장) |

---

## 무엇이 없어서 필요한가

받은 시안(`assets/2026-09-06/456456.jpg`)의 화면은 거의 전부가 **판때기**
입니다. 문도 재화도 파티 칸도 아래 띠도, 하나같이 테두리를 두르고 한 단
올라온 판 위에 그림과 글이 얹혀 있습니다. 그 한 가지가 화면 전체의 인상을
정합니다.

지금은 그 판때기를 **코드로만** 그리고 있습니다 (`ui/Frame`). 테두리 두
줄이고, 바깥은 또렷하고 안쪽 한 칸 안에 흐린 줄이 하나 더 있습니다. 1-bit
에는 그림자가 없으므로 그 틈을 눈이 모서리의 경사로 읽는 것이 지금 낼 수
있는 유일한 입체감입니다.

**그것만으로도 판때기로 읽힙니다.** 이 그림은 거기에 한 겹을 더 얹는
것이고, 없어도 화면은 굴러갑니다 — 오면 저절로 붙습니다.

## 무엇을 그리나

**네 귀퉁이가 아니라 한 귀퉁이만** 그립니다. 왼쪽 위 것 하나입니다.

화면이 그 한 장을 좌우·상하로 뒤집어서 네 귀퉁이를 만듭니다 (`ui/Frame` 의
`Corner`). 그래야 그림이 한 장이면 되고, 무엇보다 **네 귀퉁이가 반드시
대칭**이 됩니다 — 넷을 따로 그리면 한쪽만 굵어지는 일이 생깁니다.

두 칸인 이유는 상태가 둘이기 때문입니다.

| 칸 | id | 언제 |
|---|---|---|
| 1 | `corner` | 보통. 위 띠의 문, 아래 띠의 안 고른 칸 |
| 2 | `corner_hi` | 지금 고른 것 · 지금 눌러야 할 것. 아래 띠의 고른 칸, 파티의 찬 칸 |

**둘은 같은 모양이어야 합니다.** 다른 그림이 아니라 **같은 그림의 두 밝기**
입니다 — 고른 칸에서 모서리가 갑자기 다른 모양이 되면, 눌렀을 때 판이
바뀐 것처럼 보입니다. 2번은 1번보다 한 겹 더 두껍고 한 칸 더 뻗을 뿐입니다.

## 크기가 이 문서의 전부입니다

**7x7 픽셀로 뜹니다** (`ui/Frame` 의 `CORNER`). 파티 칸 하나가 화면에서
80px 남짓이라, 그보다 크면 모서리가 칸을 잡아먹습니다.

7px 에서 살아남는 것은 **선 두세 개**뿐입니다. 그래서 요구가 짧습니다.

- 꺾쇠 하나. 가로로 한 줄, 세로로 한 줄, 모서리에서 만납니다
- 그 안쪽에 짧은 선 하나 더 (`corner_hi` 는 여기가 한 칸 더 깁니다)
- 그 이상은 안 됩니다. 소용돌이도, 못머리도, 보석도 7px 에서는 얼룩입니다

## 들어와 있습니다 ✅

`assets/2026-09-06/ui-frame.jpg` (1024x506) 로 받아서 잘랐습니다. 결과는
`assets/sprites/ui_frame/corner.png` · `corner_hi.png` (각 23x23) 이고 화면에
이미 붙어 있습니다.

### 한 가지 손질했습니다 — **팔이 칸 끝까지 뻗어 있었습니다**

프롬프트에 "팔은 칸의 절반쯤" 이라고 적었는데, 받은 그림은 바깥 L 의 팔이
칸을 가로질러 끝까지 갑니다. 그림 자체는 멀쩡한데 **크기 관계**가 어긋납니다:
팔 두께가 칸의 5% 라, 9px 로 줄이면 0.4px 이 되어 **선이 통째로 사라집니다.**
실제로 처음 자른 것은 화면에서 점 몇 개로만 남았습니다.

그림을 다시 받는 대신 슬라이서에서 **꺾쇠가 있는 왼쪽 위만 남기고 지웠습니다**
(`maskRects`). 트림이 칸마다 알아서 좁히므로 (`trim`) 결과는 꺾쇠에 딱 맞는
23x23 이 되고, 팔 두께가 칸의 13% 가 되어 9px 에서도 살아남습니다.

**다시 받을 일이 있으면** 프롬프트의 "팔은 칸의 절반" 을 지키게 하세요. 그러면
`maskRects` 없이 됩니다.

### 슬라이서 설정

```json
{ "file": "ui-frame.jpg", "name": "ui_frame", "expect": [2, 1],
  "labels": ["corner", "corner_hi"],
  "maskRects": [[0.65, 0, 1, 1], [0, 0.68, 1, 1]], "size": 24 }
```

- `maskRects` 는 위에 적은 손질입니다. 오른쪽 35% 와 아래 32% 를 지웁니다 —
  넉넉하게 잡아 두면 두 칸 중 팔이 긴 `corner_hi` 도 안 잘립니다.
- `size: 24` 인 이유는 화면에서 9px 로 뜨기 때문입니다 (`ui/Frame` 의
  `CORNER`). 기본 상한 192 로 두면 쓰지도 않을 픽셀을 앱에 넣게 됩니다.

워터마크는 손댈 것이 없었습니다. Gemini 의 회색 사각별이 이진화 문턱(128)
아래라 자를 때 배경으로 떨어집니다.

### 그림이 붙으면 코드가 길을 바꿉니다

`ui/Frame` 이 켤 때 한 번 봅니다 (`HAS_ART`).

  그림이 있으면  바깥 줄 + **네 귀퉁이 꺾쇠**
  없으면        바깥 줄 + 안쪽 흐린 줄 하나

꺾쇠가 이미 두 줄짜리라, 코드로 그리던 안쪽 줄을 같이 그리면 셋이 겹쳐서
귀퉁이가 뭉갭니다. 그래서 둘 중 하나만 그립니다.

---

## 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a sheet of EXACTLY 2 CELLS in ONE row, left to right. Each cell holds ONE
CORNER BRACKET — the TOP-LEFT corner ornament of a rectangular metal frame, and
nothing else. Not a whole frame. Not four corners. One corner, seen head on.

THIS IS DRAWN AT 7 PIXELS. That one fact decides everything below. At that size the
only thing that survives is two or three straight lines meeting at a right angle.
Anything else becomes a smudge.

Cell 1 — THE PLAIN CORNER.
An L-shaped bracket sitting in the TOP-LEFT of the cell. One horizontal bar running
right from the corner, one vertical bar running down from the corner, meeting in a
hard square right angle. Each bar is about half the cell long and about one seventh
of the cell thick. INSIDE the elbow, set one bar-width in from both bars, a SHORT
SECOND L — a smaller bracket echoing the first, each of its bars only a third as
long. Two lines and a hard angle. Nothing else: no curl, no scroll, no rivet, no gem,
no bevel, no diagonal cut across the corner.
The BOTTOM-RIGHT of the cell is EMPTY BLACK. The bracket occupies only the top-left
quarter to third of the cell.

Cell 2 — THE SAME CORNER, HEAVIER.
It must read as the SAME ornament, not a different one. Same L, same right angle,
same position in the cell, same proportions. Only two things change: the bars are
ONE PIXEL-STEP THICKER, and the inner short L extends about half again as far along
both directions. That is the entire difference. Do not add an element that is not in
Cell 1, and do not remove one.
Put the two cells side by side and the pair should look like one bracket drawn at two
weights, the way a font has a regular and a bold.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- NO DITHERING, no checkerboard, no stippling. Every edge is a hard step.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black. The bracket is solid pure white.
- Every line is STRAIGHT and every joint is a SQUARE right angle. There is not one
  curve anywhere on this sheet.
- Flat and front-on, like a road sign. No perspective, no thickness, no shine.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no sparkle marks, no border around the whole image.

ORIENTATION — THIS MATTERS AND IS EASY TO GET WRONG.
Both cells show the TOP-LEFT corner. The bars run RIGHT and DOWN from the angle.
The angle itself is up and to the left. The interface mirrors this one drawing to
make the other three corners, so a corner drawn facing any other way comes out
backwards on three quarters of every frame in the game.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 2 columns x 1 row.
- Separate the cells with a 4px-wide solid MAGENTA (#FF00FF) line, and put a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Both cells are exactly the same size. Reading order is left to right.
- Do not add extra rows of variants. Exactly 1 row, exactly 2 cells.
- EVERY CELL MUST BE SQUARE. With a 2x1 grid that means the whole sheet is
  2:1 — output it at 1024x512.
```

---

## Gemini 가 늘 하는 짓

**액자를 통째로 그립니다.** "corner of a frame" 을 들으면 네모 하나를 다
그려 놓습니다. 한 귀퉁이만 있어야 합니다 — 나머지 셋은 화면이 뒤집어 만듭니다.

**곡선을 넣습니다.** "ornament" 라는 말에 소용돌이가 딸려 옵니다. 7px 에서
소용돌이는 그냥 흰 점입니다.

**방향을 틀립니다.** 오른쪽 아래 모서리를 그려 놓는 일이 잦습니다. 그러면
화면에서 네 귀퉁이가 전부 바깥을 향해 뒤집힙니다.

**두 칸을 다른 그림으로 그립니다.** 2번을 더 화려하게 만들려고 합니다.
같은 글자의 보통체와 굵은체여야 합니다 — 두께만 다릅니다.
