# 캐릭터 전신 — 영웅 관리 화면

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 캐릭터의 다른 그림(전투
8프레임 · 흉상 · 월페이퍼)은 [CHARACTER_ART_PROMPTS.md](CHARACTER_ART_PROMPTS.md)
에서 자동 생성되지만, 이 한 장은 **화면 구조에서 나온 요구**라 읽어 올 소스가
없습니다.

**한 명당 한 장, 따로 뽑습니다.** 네 명이 한 시트에 들어가면 안 됩니다 —
까닭은 바로 아래에 있습니다.

| | |
|---|---|
| 어디에 쓰나 | 영웅 → 영웅 관리, 무대 위에 서는 인물 (`screens/home/HeroManage` 의 `FULL_W`·`FULL_H`) |
| 폴더 | `assets/sprites/char_full/` |
| 파일 이름 | `knightgirl.png` · `bunnyaxe.png` · `elfarcher.png` · `nun.png` |
| 모델 | Gemini |
| 요청 | **4번** (한 명당 한 번) |
| 배경 | 여기 없습니다 — [HERO_BG_PROMPT.md](HERO_BG_PROMPT.md) |

---

## 왜 한 장씩인가 — 시트로 받으면 **짜리몽땅**해집니다

처음에는 4칸 시트 한 장으로 받게 써 뒀습니다. 그게 이 저장소의 기본 방식이라
(로고도 몬스터도 다 시트입니다) 그대로 갔는데, 인물은 다릅니다.

**칸이 좁아집니다.** 4칸을 한 줄로 놓으면 생성기가 내놓는 그림 폭을 넷이
나눠 씁니다. 3072x1024 를 요구해도 실제로는 1024 언저리로 내놓는 일이 잦고,
그러면 한 칸이 256px 입니다. 사람 하나가 서기엔 좁습니다.

**좁으면 생성기가 사람을 접습니다.** 좁고 낮은 칸에 전신을 넣으라고 하면
다리부터 줄입니다. 머리는 원래 크기로 두고 몸을 눌러서, 4~5등신짜리 **짜리몽땅한**
사람이 나옵니다. 지시로 막기 어렵습니다 — 칸 모양이 이미 그렇게 시키고 있어서요.

그래서 **한 명당 한 장, 세로로 긴 틀**입니다. 틀이 세로면 생성기는 사람을
늘립니다. 그리고 아래 프롬프트에는 등신 수를 **숫자로** 박아 두었습니다.

## 왜 흉상으로 안 되나

파티 칸·모집 결과·도감이 전부 흉상을 씁니다 (`avatar`). 46px 짜리 얼굴
하나라서 어디에 박아도 읽힙니다.

영웅 관리는 다릅니다. **한 사람만 세워 놓고 들여다보는 자리**라, 파티 칸에
박히는 것과 같은 그림을 크게만 띄우면 키운 값을 못 합니다 — 조각을 모아 성을
올리고 레벨을 백 번 눌러도 화면에서 달라지는 것이 숫자뿐입니다.

## 넷 다 들어와 있습니다 ✅

`assets/2026-09-06/char-full-*.jpg` 로 받아서 잘랐습니다. 결과는
`assets/sprites/char_full/` 에 있고 화면에 이미 서 있습니다.

| | 잘린 크기 | 세로 비율 |
|---|---|---|
| 이졸데 | 240x384 | 1.60 |
| 비앙카 | 246x384 | 1.56 |
| 리안느 | 224x384 | 1.71 |
| 아녜스 | 142x384 | 2.70 |

넷 다 **높이가 384** 입니다. 트림이 여백을 깎아서 그렇게 됩니다 — 무대가
`contain` 으로 높이를 맞추므로 넷 다 상자를 꽉 채우고, 좁은 사람(아녜스)은
좌우가 빌 뿐입니다.

### 192 가 아니라 384 인 이유 — 그 아래로 줄이면 **깨집니다**

슬라이서 기본 상한은 192 입니다 (`slice.py` 의 `SIZE`). 처음에 그대로 잘랐다가
물렸습니다.

받아 온 그림은 도트가 **크게** 찍혀 있습니다 — 한 칸이 원본 2~3 픽셀입니다.
1024 높이에 2.75px 격자면 실제 도트 격자는 372 칸인데, 192 로 줄이면 격자의
절반을 버리는 셈입니다. 슬라이서가 `NEAREST` 로 줄이므로 (평균이 아니라 한
점을 집습니다) 체크무늬 음영이 무작위로 솎이고, **치마와 수도복이 지저분한
얼룩**이 됐습니다. 선도 군데군데 끊깁니다.

384 면 원본 격자와 거의 1:1 입니다. 그래서 `char_full` 만 `size` 를 따로
줍니다 — 이 옵션은 이 일 때문에 생겼습니다.

```json
{ "file": "...", "name": "char_full", "grid": [1, 1],
  "labels": ["..."], "size": 384, "append": true }
```

**아무 세트에나 올리지 마세요.** 파티 칸에 46px 로 박히는 흉상에는 192 도
넘칩니다. 화면에서 크게 뜨는 것만 올립니다.

### 다섯째 사람이 생기면

1. `assets/<날짜>/char-full-<id>.jpg` 로 넣습니다 (날짜 폴더는 `slice.py` 가
   저절로 찾습니다 — `_src_dirs`)
2. `tools/sprites.config.json` 의 `char_full` 항목 **뒤에** 한 줄 더합니다.
   `append: true` 를 꼭 붙이세요 — 빼면 앞의 넷이 지워집니다

```json
{ "file": "char-full-<id>.jpg", "name": "char_full", "grid": [1, 1],
  "labels": ["<id>"], "size": 384, "append": true }
```

`grid` 는 "이 그림 전체가 한 칸" 이라는 뜻입니다 — **마젠타 선이 필요 없습니다.**
`invert` 도 붙이지 마세요. 검은 바닥에 흰 그림으로 받습니다.

3. `python3 tools/slice.py char_full` — `spriteAssets.ts` 가 다시 생성됩니다
4. 화면에서 바로 바뀝니다. **화면 코드는 안 건드립니다** (`fallbackSet` 이
   밀려나는 것뿐입니다)

### 워터마크는 저절로 사라집니다

Gemini 가 오른쪽 아래에 회색 사각별을 박아 놓습니다. 밝기가 85 인데 이진화
문턱이 128 이라 (`slice.py` 의 `THRESH`) 자를 때 그냥 배경으로 떨어집니다.
`killCorner` 를 쓰지 마세요 — 우하단 13% 를 통째로 지우는 옵션이라 **이졸데의
망토 자락이 같이 잘립니다.**

**슬라이서가 긴 변을 384px 로 줄입니다** (이 세트만 — 위 "192 가 아니라
384 인 이유"). 화면에서는 200px 높이로 뜨므로 두 배쯤 여유가 있습니다.
휴대폰은 화면 배율이 2~3배라 그 여유가 그대로 선명함이 됩니다.

그리고 **투명한 여백을 잘라냅니다** (`trim`). 그래서 그림 안에서 인물이
위아래로 어디에 있든 상관없고, 네 명의 키 차이도 여기서 사라집니다.
살아남는 것은 **인물 안의 비율**뿐입니다 — 등신 수가 그토록 중요한 이유가
이것입니다.

---

## 네 장 모두에 걸리는 것

**전투 8프레임(§A)과 흉상(§B)을 레퍼런스로 첨부하세요.** 같은 사람이어야
합니다 — 파티 칸의 흉상과 무대 위의 인물과 이 전신이 서로 다른 사람으로
보이면 셋 다 값을 잃습니다.

세 가지가 전투 시트와 **다릅니다.**

| | 전투 8프레임 | 전신 (이 문서) |
|---|---|---|
| 카메라 | 살짝 내려다보는 측면 (바닥이 쿼터뷰라서) | **정면 눈높이**. 화면 밖의 나를 본다 |
| 자세 | 스윙 한 번의 네 토막 | 서 있는 한 자세. 안 움직인다 |
| 크기 | 54px 에서 읽혀야 함 | **200px 높이**. 손·얼굴·무기 장식이 살아난다 |

정면인 이유는 이 화면이 무대가 아니기 때문입니다. 무대에서는 인물이 오른쪽
적을 보고 서지만, 여기서는 **나를 봅니다** — 고르는 자리라 눈이 마주쳐야
합니다.

### 이 그림에는 배경을 그리지 않습니다

**검은 바닥에 오려낸 인물 하나입니다.** 뒤에 그림이 붙어 오면 못 씁니다.

뒤에 깔 배경은 **따로 받습니다** ([HERO_BG_PROMPT.md](HERO_BG_PROMPT.md)).
화면이 그 한 장을 아주 죽여서 깔고 (0.22) 그 위에 이 인물을 세웁니다 — 인물에
배경이 붙어 오면 배경이 둘이 됩니다.

무엇보다 이 그림에서 **배경이 곧 여백**입니다. 인물 주위가 검게 비어 있어야
슬라이서가 그 여백을 잘라내고 (`trim`), 잘라낸 만큼 인물이 상자를 꽉 채웁니다.
배경이 붙어 오면 잘라낼 것이 없어서 인물이 작게 박힙니다.

---

## §1. 이졸데 — `knightgirl.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE. Nothing is written above, below, or beside it.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
There is ONE character in this image. This is NOT a sheet: no cells, no grid,
no dividing lines, no variants, no turnaround, no second view of her.

SUBJECT: one woman, standing at rest, seen from the front, full body.

THE CHARACTER:
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron.

PROPORTIONS — THIS IS THE MOST IMPORTANT RULE ON THIS PAGE.
She is SEVEN AND A HALF HEADS TALL. Measure it: the height of her head from crown
to chin fits into her total height from crown to sole seven and a half times.
- Her HIPS sit at the exact vertical MIDPOINT of the figure. Everything below the
  hips is leg, and the legs are HALF her whole height.
- Her head is SMALL. Her shoulders are about two head-widths across.
- Her neck is visible. The head does not sit straight on the shoulders.
- NOT chibi. NOT super-deformed. NOT a mascot. NOT a cute 4-head figure.
  NOT stubby, NOT squat, NOT compressed. If the legs look short, it is wrong.
- She is an adult woman standing at her full height, drawn the way a character
  select screen draws a person — long, upright, and slender.

HER POSE:
- Standing still and at rest, facing the viewer nearly straight on (turned no more
  than 10 degrees). She is looking OUT of the picture at the person holding the
  phone. Both eyes visible.
- Weight settled on both feet, feet about shoulder width apart, flat on the ground.
  Not walking, not lunging, not mid-swing.
- The greatsword is PLANTED POINT-DOWN in front of her, centred, both hands folded
  over the ring pommel at about waist height. She stands square behind it. The blade
  runs straight down the middle of the image.
- Calm and unhurried. This is a character-select portrait, not an action shot.

FILL THE TALL FRAME. The top of her head sits about one twelfth of the image height
below the top edge, and the soles of her boots sit about one twelfth above the
bottom edge. NOTHING IS CROPPED — not the feet, not the blade tip, not a hair end,
not the trailing skirt. Cropped feet is the single most common way this fails.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, like a standing photograph.
No high angle, no low hero angle, no perspective distortion. This is DIFFERENT from
her battle sprites, which are drawn at a slight high angle from the side.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no ground
  line, no room, no glow, no frame, no decorative panel behind her. She is cut out
  on black.
- Subject drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind her — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners, no border.
- She is an adult. Tasteful — no suggestive framing, no leering camera.

RESOLUTION — THIS IS BIGGER THAN THE BATTLE SPRITES.
Her battle sprites are read at 54 pixels tall and are built from very few pixels.
This one is read at about 200 pixels tall. Use the extra room:
- Her face has actual features — eyes, brow, mouth — not two dots.
- Her hands are drawn as hands on the pommel, with separated fingers where they wrap.
- Armour edges, the fall of the split skirt, the cross guard and ring pommel all
  get their own pixels.
- Dithering is used for form (the round of a pauldron, the drape of the cape), not
  sprinkled as texture.
Do NOT upscale a small sprite. Draw it at this size.
```

---

## §2. 비앙카 — `bunnyaxe.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE. Nothing is written above, below, or beside it.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
There is ONE character in this image. This is NOT a sheet: no cells, no grid,
no dividing lines, no variants, no turnaround, no second view of her.

SUBJECT: one woman, standing at rest, seen from the front, full body.

THE CHARACTER:
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block.

PROPORTIONS — THIS IS THE MOST IMPORTANT RULE ON THIS PAGE.
She is EIGHT HEADS TALL — the tallest and longest-limbed of the four. Measure it:
the height of her head from crown to chin fits into her total height from crown to
sole eight times. (Her rabbit ears are NOT part of that measurement — they stand
above the crown and are extra.)
- Her HIPS sit at the exact vertical MIDPOINT of the figure. Everything below the
  hips is leg, and the legs are HALF her whole height. Her legs are the feature.
- Her head is SMALL. Her shoulders are about two head-widths across.
- Her neck is visible and long.
- NOT chibi. NOT super-deformed. NOT a mascot. NOT a cute 4-head figure.
  NOT stubby, NOT squat, NOT compressed. If the legs look short, it is wrong.
- She is an adult woman standing at her full height, drawn the way a character
  select screen draws a person — long, upright, and slender.

HER POSE:
- Standing still and at rest, facing the viewer nearly straight on (turned no more
  than 10 degrees). She is looking OUT of the picture at the person holding the
  phone. Both eyes visible, grinning very slightly.
- The axe is SHOULDERED — the haft resting across her RIGHT shoulder with the huge
  head hanging behind and above that shoulder, her right hand up on the haft, her
  left hand on her hip. Weight cocked onto one leg, the other knee slightly relaxed.
- Not walking, not lunging, not mid-swing. This is a character-select portrait.

FILL THE TALL FRAME. The tips of her rabbit ears sit about one twelfth of the image
height below the top edge, and the heels of her boots sit about one twelfth above
the bottom edge. NOTHING IS CROPPED — not the feet, not the axe head, and above all
NOT THE EAR TIPS. If the ears will not fit, make the whole figure smaller in the
frame; do NOT bend, shorten, or lay down the ears to make room. Only the ONE ear
is bent, and only near its tip — the other stays straight.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, like a standing photograph.
No high angle, no low hero angle, no perspective distortion. This is DIFFERENT from
her battle sprites, which are drawn at a slight high angle from the side.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no ground
  line, no room, no glow, no frame, no decorative panel behind her. She is cut out
  on black.
- Subject drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind her — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners, no border.
- She is an adult. Tasteful — no suggestive framing, no leering camera. The outfit
  is a costume she wears to work and the drawing treats it as workwear.

RESOLUTION — THIS IS BIGGER THAN THE BATTLE SPRITES.
Her battle sprites are read at 54 pixels tall and are built from very few pixels.
This one is read at about 200 pixels tall. Use the extra room:
- Her face has actual features — eyes, brow, the small grin — not two dots.
- Her hand is drawn as a hand on the haft, with separated fingers where they wrap.
- The cord wrap on the grip, the spike on the back of the axe head, the torn left
  cuff and the studs on the belt all get their own pixels.
- Dithering is used for form (the sheer stockings, the round of the shoulder guard),
  not sprinkled as texture.
Do NOT upscale a small sprite. Draw it at this size.
```

---

## §3. 리안느 — `elfarcher.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE. Nothing is written above, below, or beside it.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
There is ONE character in this image. This is NOT a sheet: no cells, no grid,
no dividing lines, no variants, no turnaround, no second view of her.

SUBJECT: one elf woman, standing at rest, seen from the front, full body.

THE CHARACTER:
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere.

PROPORTIONS — THIS IS THE MOST IMPORTANT RULE ON THIS PAGE.
She is SEVEN HEADS TALL. Measure it: the height of her head from crown to chin fits
into her total height from crown to sole seven times. She is SLIGHT — narrow through
the shoulders and hips — but she is NOT short-legged and she is NOT a child.
- Her HIPS sit at the exact vertical MIDPOINT of the figure. Everything below the
  hips is leg, and the legs are HALF her whole height.
- Her head is SMALL. Her shoulders are about one and three quarter head-widths across.
- Her neck is visible and slender.
- NOT chibi. NOT super-deformed. NOT a mascot. NOT a cute 4-head figure.
  NOT stubby, NOT squat, NOT compressed. If the legs look short, it is wrong.
  "Slight" means NARROW, never SHORT-LIMBED.
- She is an adult woman standing at her full height, drawn the way a character
  select screen draws a person — long, upright, and slender.

HER POSE:
- Standing still and at rest, facing the viewer nearly straight on (turned no more
  than 10 degrees). She is looking OUT of the picture at the person holding the
  phone. Both eyes visible, expression level and watchful.
- The bow hangs in her LEFT hand, down at her side, its lower limb near her boot,
  the arm relaxed and straight. Her right hand rests on the quiver at her hip.
- Not walking, not drawing the bow, not aiming. This is a character-select portrait.

FILL THE TALL FRAME. The top of her head sits about one twelfth of the image height
below the top edge, and the soles of her boots sit about one twelfth above the
bottom edge. NOTHING IS CROPPED — not the feet, not the ear tips, not the end of
the ponytail, not the lower limb of the bow.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, like a standing photograph.
No high angle, no low hero angle, no perspective distortion. This is DIFFERENT from
her battle sprites, which are drawn at a slight high angle from the side.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no ground
  line, no forest, no glow, no frame, no decorative panel behind her. She is cut out
  on black.
- Subject drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind her — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners, no border.
- She is an adult. Tasteful — no suggestive framing, no leering camera.

RESOLUTION — THIS IS BIGGER THAN THE BATTLE SPRITES.
Her battle sprites are read at 54 pixels tall and are built from very few pixels.
This one is read at about 200 pixels tall. Use the extra room:
- Her face has actual features — eyes, brow, mouth — not two dots.
- Her hand is drawn as a hand on the bow grip, with separated fingers.
- The double curve of the bow, the binding on its grip, the fletching standing out
  of the quiver, the lacing on the bracer and boots all get their own pixels.
- Dithering is used for form (the fall of the half-cloak, the wrap of the leggings),
  not sprinkled as texture.
Do NOT upscale a small sprite. Draw it at this size.
```

---

## §4. 아녜스 — `nun.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE. Nothing is written above, below, or beside it.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
There is ONE character in this image. This is NOT a sheet: no cells, no grid,
no dividing lines, no variants, no turnaround, no second view of her.

SUBJECT: one nun, standing at rest, seen from the front, full body.

THE CHARACTER:
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — but IN THIS PICTURE SHE IS LOOKING UP AND STRAIGHT AT THE VIEWER, direct and level.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point hanging at the end of a short chain. Almost all of her is one dark shape with a single bright spark.

PROPORTIONS — THIS IS THE MOST IMPORTANT RULE ON THIS PAGE.
She is SEVEN HEADS TALL. Measure it: the height of her head from crown to chin fits
into her total height from crown to the hem of the habit seven times.
- Her WAIST — where the sash cinches — sits a little above the vertical midpoint,
  and the habit below it falls in ONE LONG UNBROKEN LINE to the floor. That long
  fall is more than half the figure. Her feet are hidden under the hem.
- The habit is a TALL NARROW BELL, not a wide cone. Its hem is about two and a half
  head-widths across, no more. A wide skirt makes her look short and squat.
- Her head is SMALL. Her shoulders are about two head-widths across.
- NOT chibi. NOT super-deformed. NOT a mascot. NOT a cute 4-head figure.
  NOT stubby, NOT squat, NOT compressed. If she looks like a bell with a big head
  on it, it is wrong.
- She is an adult woman standing at her full height, drawn the way a character
  select screen draws a person — long, upright, and still.

HER POSE:
- Standing still and at rest, facing the viewer straight on. She is looking OUT of
  the picture at the person holding the phone — chin level, eyes direct. Both eyes
  visible.
- Both hands held together at chest height, the censer hanging from them on its
  slack chain just below her waist. One thin ribbon of smoke rises past her shoulder.
- Not walking, not swinging the censer. This is a character-select portrait.

FILL THE TALL FRAME. The top of her veil sits about one twelfth of the image height
below the top edge, and the HEM OF THE HABIT sits about one twelfth above the bottom
edge. NOTHING IS CROPPED — the hem is the bottom of her silhouette and must be whole,
and the ribbon of smoke must end inside the frame rather than running off the top.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, like a standing photograph.
No high angle, no low hero angle, no perspective distortion. This is DIFFERENT from
her battle sprites, which are drawn at a slight high angle from the side.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no ground
  line, no chapel, no glow, no frame, no decorative panel behind her. She is cut out
  on black.
- Subject drawn in pure white outlines and dithered fills. HER HABIT IS DARK, so it
  is drawn mostly as OUTLINE with sparse dithering inside — do not fill it solid
  white, and do not leave it so empty that she disappears into the background. The
  outline of the bell, the fold lines of the sleeves, and the pale scapular are what
  carry her shape.
- NEVER put a white, light, or filled panel behind her — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners, no border.
- She is an adult. Tasteful — no suggestive framing, no leering camera.

RESOLUTION — THIS IS BIGGER THAN THE BATTLE SPRITES.
Her battle sprites are read at 54 pixels tall and are built from very few pixels.
This one is read at about 200 pixels tall. Use the extra room:
- Her face has actual features — eyes, brow, mouth — not two dots.
- Her hands are drawn as hands, with the chain wound visibly twice around the right one.
- The pierced holes in the censer, the pin of the veil on her left side, the scorched
  fray at the hem and the links of the short chain all get their own pixels.
- Dithering is used for form (the drape of the bell sleeves, the fall of the habit),
  not sprinkled as texture.
Do NOT upscale a small sprite. Draw it at this size.
```

---

## Gemini 가 늘 하는 짓

받은 다음 이 다섯부터 확인하세요.

**사람을 접습니다.** 그림이 세로로 길어도 인물을 5등신으로 그려 놓는 일이
있습니다. 확인하는 법이 하나뿐입니다 — **엉덩이가 그림의 정확히 절반에
있는지** 보세요. 위에 있으면 다리가 짧은 것이고, 그러면 다시 받습니다.
"짜리몽땅하다" 는 늘 이 한 가지입니다.

**발을 자릅니다.** 인물을 크게 그리려다 아래 끝에서 발이 잘립니다. 특히
아녜스의 치맛단과 비앙카의 굽. 무대가 인물을 바닥에 붙여 세우므로
(`HeroManage` 의 `flex-end`), 발이 잘린 그림은 잘린 면이 바닥선처럼 보입니다.

**토끼 귀를 눕힙니다.** 위 여백에 안 들어가면 눕히거나 접습니다. 귀 하나가
굽은 것은 설정이지만 **둘 다 굽으면 다른 사람**입니다. 안 들어가면 인물을
작게 그리라고 다시 시키세요.

**배경을 깝니다.** "character-select portrait" 라는 말을 들으면 뒤에 방이나
빛무리를 넣으려 합니다. 검은 바닥에 오려낸 것이어야 합니다 — 뒤에 깔 그림은
따로 오고 (`bg_hero`), 이 그림에서는 배경이 곧 여백이라 여백이 없으면
슬라이서가 잘라낼 것이 없어서 인물이 작게 박힙니다.

**아녜스를 종으로 만듭니다.** 치마를 넓게 퍼뜨려 놓으면 그 자체로 짜리몽땅
해집니다. 좁고 긴 종이어야 합니다 — 밑단 폭이 머리 두 개 반을 넘으면 다시.
