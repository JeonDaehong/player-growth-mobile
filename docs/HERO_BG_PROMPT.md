# 영웅 관리 배경 — 인물이 서는 자리

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 게임 수치가 아니라 **화면
구조**에서 나온 그림이라 읽어 올 소스가 없습니다.

**한 장입니다.**

| | |
|---|---|
| 어디에 쓰나 | 영웅 → 영웅 관리, 인물 뒤에 깔리는 무대 (`screens/home/HeroManage` 의 `STAGE_H`) |
| 폴더 | `assets/sprites/bg_hero/` |
| 파일 이름 | `hall.png` |
| 모델 | Gemini |
| 요청 | **1번** |
| 인물 | 여기 없습니다 — [CHAR_FULL_PROMPTS.md](CHAR_FULL_PROMPTS.md) |

---

## 왜 배경이 필요한가

무대가 그냥 어두운 네모였습니다 (`SURF.down`). 인물이 서 있기는 한데 **어디에**
서 있는지가 없어서, 캐릭터를 크게 띄운 자리가 아니라 그림 하나를 올려 둔 칸으로
보였습니다.

배경이 깔리면 그 칸이 **자리**가 됩니다. 인물의 발밑이 정해지고, 좌우로 넘길 때
바뀌는 것이 사람 하나뿐이라는 것이 분명해집니다.

## 늘 **같은 한 장**입니다

사람마다 다른 곳에 세우지 않습니다. 넘길 때 장소까지 바뀌면 **바뀐 것이
사람인지 화면인지**가 안 갈립니다. 여기는 넷을 견주는 자리라 뒤가 고정이어야
앞이 비교됩니다.

(나중에 코스튬이나 인연이 붙으면 그때 배경을 갈아 끼울 수 있습니다. 그건
"이 사람의 자리" 라는 다른 뜻이 생겼을 때의 이야기입니다.)

## 아주 죽여서 깝니다

화면에서 **불투명도 0.3** 으로 깔립니다 (`HeroManage`). 그림이 원래 흐리게
그려져서가 아니라, 인물도 흰 선이라 배경이 또렷하면 **둘이 같은 밝기로 다투고
그러면 사람이 안 읽히기** 때문입니다.

그래서 그림 쪽에도 같은 요구가 갑니다 — **속이 꽉 찬 흰 덩어리를 만들지
말 것.** 얇은 윤곽선 위주여야 0.3 으로 깔았을 때 형태가 남고, 큰 흰 면은
0.3 이 되어도 인물 뒤에서 얼룩으로 보입니다.

## 가운데 아래가 비어야 합니다

인물이 **가운데, 바닥에 붙어** 섭니다 (`flex-end`). 그 자리에 그림이 있으면
인물과 겹쳐서 둘 다 안 읽힙니다.

```
   ┌──────────────────────────────────┐
   │        위: 아치 · 천장 · 빛        │  ← 여기가 그림의 몸통
   │   ┌────────────┐                  │
   │ 옆 │   비운다   │ 옆              │  ← 인물이 서는 자리
   │ 기둥│  (인물)   │기둥              │
   │────┴────────────┴────────────────│  ← 바닥선 하나
   └──────────────────────────────────┘
```

가로로 가운데 3분의 1, 세로로 아래 3분의 2 — 이 안은 거의 검게 둡니다.
바닥선과 발밑 그림자만 지납니다.

## 받은 다음

1. `assets/new-image/` 에 넣습니다
2. `tools/sprites.config.json` 에 아래를 더합니다

```json
{ "file": "bg-hero.png", "name": "bg_hero", "grid": [1, 1],
  "labels": ["hall"], "allowFilled": true }
```

`grid` 는 "이 그림 전체가 한 칸" 이라는 뜻입니다 — 마젠타 선이 필요 없습니다.
`allowFilled` 는 채움률 경고를 끄는 것입니다: 배경은 원래 화면을 다 쓰는
그림이라 인물 잘라내기 기준으로는 "배경을 그림으로 읽었다" 로 잡힙니다.

3. `python3 tools/slice.py`
4. 화면에서 바로 깔립니다. 코드는 안 건드립니다

**슬라이서가 긴 변을 192px 로 줄입니다** (`SIZE`). 화면에서는 폭을 다 채워
늘어나므로 (`fit="stretch"`) 두 배 남짓 커집니다 — 도트가 굵어지는 것은
의도한 것이고, 이 게임의 다른 배경도 같은 방식입니다 (`bg_forest`).

---

## 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE. Nothing is written above, below, or beside it.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single wide image, 2 wide by 1 tall. Output at 1536x768.
This is NOT a sheet: no cells, no grid, no dividing lines, no variants.

SUBJECT: an EMPTY interior — a quiet stone hall where one person would come to
stand and be looked at. THERE IS NO PERSON IN THIS IMAGE. No figure, no silhouette,
no statue of a person, no armour stand, no ghost. It is empty and waiting.

WHAT IS IN IT:
- A tall POINTED ARCH in the middle of the frame, seen straight on, its opening
  filling most of the image height. Two plain columns hold it up, one on each side.
- BEHIND the arch opening: nothing. Solid black. This is deliberate — it is the
  darkness a person will be standing in front of.
- To the LEFT and RIGHT of the arch, outside its columns: low stone walls with one
  narrow slit window each, and a hanging banner or drape falling from above, still.
- ACROSS THE BOTTOM: one horizontal FLOOR LINE running the full width, with a few
  short parallel lines below it suggesting flagstones. The floor is where everything
  rests. Nothing else is down there.
- ABOVE the arch: the underside of a vaulted ceiling — two or three arcs of ribbing
  converging toward the top edge — and, at the very top centre, a small hanging lamp
  or a shaft of light coming down. This is the only bright thing in the picture.

COMPOSITION — THE MIDDLE IS EMPTY AND THAT IS THE POINT.
A character will be drawn standing in the centre, on the floor, filling roughly the
middle third of the width and the lower two thirds of the height. THAT REGION MUST BE
ESSENTIALLY EMPTY BLACK. Nothing may be drawn inside it except the floor line
crossing behind it. All the detail lives in the top third and along the left and
right edges.

The image is SYMMETRICAL left to right. The arch is centred. A lopsided background
pulls the eye off the character who will stand in the middle.

BRIGHTNESS — THIS IS THE RULE THAT MATTERS MOST.
This image is laid down at 30% opacity underneath a white character, so it must be
DARK AND SPARSE.
- It is drawn as THIN WHITE OUTLINES on black. Lines about one two-hundredth of the
  image width.
- NO LARGE FILLED WHITE AREAS. Not the walls, not the floor, not the banners, not
  the ceiling. Every surface is an outline with black inside it. A big white shape
  survives 30% opacity as a grey smear behind the character's legs.
- At most one small solid-white accent: the lamp or the light source at the top.
- Overall the image should be MORE THAN 85% BLACK. If you squint, you see a few
  bright lines in the dark, not a lit room.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Any shading is 1-bit checkerboard dithering, used sparingly — a dithered band is
  allowed on the ceiling ribs and nowhere else.
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Flat, front-on, one-point view. The arch faces the viewer square. No dramatic
  perspective, no tilted camera, no vanishing point running off to a corner.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks, no border or frame around the image.

MOOD: still and unhurried. A place where someone stands to be looked at properly.
Not a battlefield, not a shrine to be worshipped at, not a throne room. Quiet.
```

---

## Gemini 가 늘 하는 짓

**사람을 넣습니다.** "a person would come to stand" 를 읽고 기어이 실루엣을
그려 넣습니다. 하나라도 있으면 다시 받으세요 — 인물은 따로 오고, 겹치면 둘 다
안 읽힙니다.

**환하게 그립니다.** 배경이라고 하면 벽을 흰색으로 칠합니다. 0.3 으로 깔았을
때 인물 뒤가 뿌옇게 뜨면 그것입니다. 검은 바탕에 흰 선이지, 흰 바탕에 검은
선이 아닙니다.

**가운데를 채웁니다.** 아치 안쪽에 창살이나 문양을 넣으려 합니다. 그 자리는
인물이 설 자리라 비어 있어야 합니다.

**한쪽으로 기울입니다.** 극적으로 보이려고 아치를 비스듬히 놓습니다. 인물이
정가운데 서므로 배경도 좌우가 같아야 합니다.
