# 영웅 관리 배경 — 인물이 서는 자리

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 게임 수치가 아니라 **화면
구조**에서 나온 그림이라 읽어 올 소스가 없습니다.

**한 장입니다.**

| | |
|---|---|
| 어디에 쓰나 | 영웅 → 영웅 관리, 무대 뒤 (`screens/home/HeroManage` 의 `STAGE_H`) |
| 폴더 | `assets/sprites/bg_hero/` |
| 파일 이름 | `hall.png` |
| 모델 | Gemini |
| 요청 | **1번** |
| 인물 | 여기 없습니다 — [CHAR_FULL_PROMPTS.md](CHAR_FULL_PROMPTS.md) |

---

## 왜 필요한가

무대가 그냥 어두운 네모였습니다 (`SURF.down`). 인물이 서 있기는 한데 **어디에**
서 있는지가 없어서, 캐릭터를 크게 띄운 자리가 아니라 그림 하나를 올려 둔 칸으로
보였습니다. 시안(`assets/2026-09-06/123123.jpg`)에도 아치가 그려진 홀이 있고,
그것이 이 화면을 "자리" 로 만듭니다.

## 늘 **같은 한 장**입니다

사람마다 다른 곳에 세우지 않습니다. 넘길 때 장소까지 바뀌면 **바뀐 것이
사람인지 화면인지**가 안 갈립니다. 여기는 넷을 견주는 자리라 뒤가 고정이어야
앞이 비교됩니다.

(나중에 코스튬이나 인연이 붙으면 그때 배경을 갈아 끼울 수 있습니다. 그건
"이 사람의 자리" 라는 다른 뜻이 생겼을 때의 이야기입니다.)

## 아주 죽여서 깝니다 — **불투명도 0.22**

이게 이 문서에서 제일 중요한 요구입니다.

1-bit 에서는 **배경도 인물도 같은 흰 선**입니다. 색이 없으니 "뒤에 있는 것" 과
"앞에 있는 것" 을 구분해 줄 것이 밝기밖에 없습니다. 배경을 또렷하게 깔면 둘이
같은 밝기로 다투고, 그러면 인물이 안 읽힙니다.

게다가 이 배경 위에는 **글까지 얹힙니다** — 왼쪽 위에 역할과 패시브, 그 아래
등급과 이름, 오른쪽 위에 단추 셋 (`HeroManage`). 뒤가 밝으면 그 글도 같이
죽습니다.

그래서 그림 쪽에도 같은 요구가 갑니다.

- **속이 꽉 찬 흰 덩어리를 만들지 마세요.** 얇은 윤곽선 위주여야 0.22 로
  깔았을 때 형태가 남습니다. 큰 흰 면은 0.22 가 되어도 인물 뒤에서 얼룩으로
  보입니다.
- **85% 이상 검어야 합니다.** 눈을 가늘게 떴을 때 "불 켜진 방" 이 아니라
  "어둠 속의 밝은 선 몇 개" 로 보여야 합니다.

배경이 할 일은 하나입니다: 인물이 허공이 아니라 **어딘가에** 서 있다는 것.
그건 아주 흐린 윤곽으로도 됩니다.

## 어디를 비워야 하나

무대는 폭을 다 쓰고 높이가 320 입니다. 그 위에 이렇게 얹힙니다.

```
   ┌──────────────────────────────────────┐
   │  [역할]        (문장)         (코스튬)│  ← 위: 글과 단추가 얹힌다
   │  [패시브]                     (인연)  │
   │                               (월페)  │
   │  Epic                                 │
   │  이졸데      ┌────────┐               │
   │  ‹           │  인물  │            ›  │  ← 가운데: 인물
   │              │        │               │
   │──────────────┴────────┴───────────────│  ← 바닥선 하나
   └──────────────────────────────────────┘
```

- **가운데 세로 띠** (가로로 가운데 45%, 세로로 아래 3분의 2): 인물이 섭니다.
  거의 검게 두세요. 바닥선만 뒤로 지나갑니다.
- **왼쪽 위 4분의 1**: 글이 얹힙니다. 여기도 조용해야 합니다 — 세로 기둥
  하나가 지나가는 정도까지는 괜찮고, 무늬나 글씨 비슷한 것은 안 됩니다.
- **오른쪽 위 모서리**: 동그란 단추 셋이 얹힙니다. 같습니다.
- **위쪽 가운데**: 등급 문장이 앉습니다. 아치의 꼭대기가 여기 오면 문장과
  겹치므로, 아치는 문장보다 **아래에서** 시작하는 편이 낫습니다.

정리하면 **디테일이 살 자리는 좌우 가장자리와 바닥**뿐입니다.

## 들어와 있습니다 ✅

`assets/2026-09-06/bg.jpg` (1024x765) 로 받아서 잘랐습니다. 결과는
`assets/sprites/bg_hero/hall.png` (512x374, 4.2KB) 이고 화면에 이미 깔려
있습니다.

받은 그림이 요구를 그대로 지켰습니다 — **흰 픽셀이 9.8%** 라 "85% 이상 검게"
를 훌쩍 넘겼고, 선이 3~7px 두께의 순수 윤곽선이라 절반으로 줄여도 안 끊겼습니다.
가운데는 아치 안쪽까지 통째로 비어 있어서 인물이 설 자리가 그대로 남습니다.

워터마크는 손댈 것이 없었습니다. Gemini 의 회색 사각별이 이진화 문턱(128)
아래라 자를 때 배경으로 떨어집니다.

### 다시 받거나 갈아 끼울 때

1. `assets/<날짜>/bg.jpg` 로 넣습니다 (날짜 폴더는 `slice.py` 가 저절로
   찾습니다 — `_src_dirs`)
2. `tools/sprites.config.json` 의 `bg_hero` 항목은 이미 있습니다

```json
{ "file": "bg.jpg", "name": "bg_hero", "grid": [1, 1],
  "labels": ["hall"], "size": 512, "allowFilled": true }
```

- `grid` 는 "이 그림 전체가 한 칸" 이라는 뜻입니다 — **마젠타 선이 필요
  없습니다.** `invert` 도 붙이지 마세요 (검은 바닥에 흰 그림).
- `allowFilled` 는 채움률 경고를 끕니다. 배경은 화면을 다 쓰는 그림이라 인물
  잘라내기 기준으로는 "배경을 그림으로 읽었다" 로 잡힙니다.
- `size` 는 **꼭 넣으세요.** 기본 상한이 192 인데 (`slice.py` 의 `SIZE`), 화면
  폭이 366 이라 그대로 두면 두 배로 늘어나면서 도트가 뭉갭니다. 전신에서
  겪었던 것과 같은 문제입니다 (`CHAR_FULL_PROMPTS.md` 의 "192 가 아니라 384").

  512 보다 더 줄이지 마세요. 이 그림의 선은 3~7px 이라 절반(512)까지는
  1.5~3.5px 로 남지만, 그 아래로 가면 **1px 아래로 떨어져서 선이 군데군데
  사라집니다** — `NEAREST` 는 평균이 아니라 한 점을 집으니까요.

3. `python3 tools/slice.py bg_hero`
4. 화면에서 바로 깔립니다. **코드는 안 건드립니다** — 자리는 이미 잡혀 있고,
   그림이 없는 동안은 그냥 어두웠을 뿐입니다

---

## 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE. Nothing is written above, below, or beside it.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single image, 4 wide by 3 tall. Output at 1024x768.
This is NOT a sheet: no cells, no grid, no dividing lines, no variants.

SUBJECT: an EMPTY stone hall, seen straight on — the kind of quiet room a person
would be brought into to be looked at properly. THERE IS NO PERSON IN THIS IMAGE.
No figure, no silhouette, no statue of a person, no suit of armour on a stand,
no ghost. It is empty and waiting.

WHAT IS IN IT:
- A tall POINTED ARCH standing in the middle of the frame, seen straight on. Two
  plain columns hold it up, one on each side, and they stand well apart — the gap
  between them is about half the image width.
- BEHIND the arch opening: NOTHING. Solid black, edge to edge inside the opening.
  This is deliberate. It is the darkness a person will be standing in front of.
- To the LEFT and RIGHT of the arch, outside its columns: a low stone wall with one
  narrow slit window, and a long still drape hanging down from above. One of each
  per side, mirrored.
- ACROSS THE BOTTOM: one horizontal FLOOR LINE running the full width, with three
  or four short parallel lines below it suggesting flagstones. Nothing else down
  there.
- ABOVE the arch, near the top edge: two or three arcs of ceiling ribbing. They
  stay in the top eighth of the image and they are the faintest thing in it.

COMPOSITION — THE EMPTY PARTS ARE THE POINT.
Interface is drawn on top of this image and every bright mark under it is noise.

  - MIDDLE COLUMN — the centre 45% of the width, from the top edge down to the
    bottom: a character stands here. It must be ESSENTIALLY EMPTY BLACK. Only the
    arch's own opening and the floor line cross it, and the opening is black anyway.
  - TOP-LEFT QUARTER and TOP-RIGHT CORNER: text and round buttons sit here. Keep
    them quiet — a single vertical column edge passing through is fine, patterns
    and ornament are not.
  - TOP CENTRE: an emblem is placed here, so the crown of the arch must sit BELOW
    the top eighth of the image, not touching the top edge.

  Detail belongs at the LEFT and RIGHT EDGES and along the BOTTOM. Nowhere else.

The image is SYMMETRICAL left to right. The arch is centred. A lopsided background
pulls the eye off the character who will stand in the middle.

BRIGHTNESS — THIS IS THE RULE THAT MATTERS MOST.
This image is laid down at 22% opacity underneath a white character and white text,
so it must be DARK AND SPARSE.
- Draw it as THIN WHITE OUTLINES on black. Lines about one two-hundredth of the
  image width. Every surface is an outline with black inside it.
- NO LARGE FILLED WHITE AREAS. Not the walls, not the floor, not the drapes, not
  the ceiling, not the columns. A big white shape survives 22% opacity as a grey
  smear behind the character's legs.
- NO bright accent, no lamp, no glow, no light shaft, no god rays. Nothing in this
  picture is a light source.
- Overall the image must be MORE THAN 85% BLACK. Squint at it: you should see a few
  bright lines in the dark, never a lit room.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- NO DITHERING ANYWHERE. A checkerboard reads as grey at full size but turns into
  a crawling texture once it is dimmed and stretched. Outlines only.
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

**사람을 넣습니다.** "a person would be brought into" 를 읽고 기어이 실루엣을
그려 넣습니다. 하나라도 있으면 다시 받으세요 — 인물은 따로 오고, 겹치면 둘 다
안 읽힙니다.

**환하게 그립니다.** 배경이라고 하면 벽을 흰색으로 칠합니다. 0.22 로 깔았을 때
인물 뒤가 뿌옇게 뜨면 그것입니다. 검은 바탕에 흰 선이지, 흰 바탕에 검은 선이
아닙니다.

**빛을 넣습니다.** "hall" 을 들으면 창으로 들어오는 빛줄기를 그리고 싶어 합니다.
이 그림에 광원은 없습니다 — 빛줄기는 늘 큰 흰 면이라 0.22 에서도 얼룩입니다.

**가운데를 채웁니다.** 아치 안쪽에 창살이나 문양을 넣으려 합니다. 그 자리는
인물이 설 자리라 비어 있어야 합니다.

**한쪽으로 기울입니다.** 극적으로 보이려고 아치를 비스듬히 놓습니다. 인물이
정가운데 서므로 배경도 좌우가 같아야 합니다.

**아치를 위 끝까지 올립니다.** 꼭대기가 잘리거나 등급 문장과 겹칩니다. 위
8분의 1 은 비워야 합니다.
