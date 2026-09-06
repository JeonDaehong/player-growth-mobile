# 캐릭터 전신 — 부끄러워하는 얼굴

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

[CHAR_FULL_PROMPTS.md](CHAR_FULL_PROMPTS.md) 의 **한 벌 더**입니다. 같은 사람,
같은 틀, 같은 크기 — **얼굴과 손만** 다릅니다.

| | |
|---|---|
| 어디에 쓰나 | 영웅 관리에서 인물의 **머리를 눌렀을 때** (`screens/home/HeroManage` 의 `PAT_ZONE`) |
| 폴더 | `assets/sprites/char_shy/` |
| 파일 이름 | `knightgirl.png` · `bunnyaxe.png` · `elfarcher.png` · `nun.png` |
| 모델 | Gemini |
| 요청 | **4번** (한 명당 한 번) |

---

## 무엇을 만지나 — **머리입니다**

가슴을 만지면 반응하는 쪽으로 만들어 달라는 이야기가 있었고, 그건 안 만듭니다.
`CHARACTER_ART_PROMPTS.md` 에 같은 판단이 이미 적혀 있습니다 — 싫다는 반응을
눌러서 얻는 것을 게임 규칙으로 가르치는 꼴이 됩니다.

대상만 바꾸면 하고 싶던 것은 그대로 됩니다. 부끄러워하는 얼굴도, 특별한 대사
셋도, 계속 눌러 보고 싶어지는 것도. 오히려 **넷의 성격이 더 갈립니다** —
이졸데는 갑옷은 뚫려도 이건 못 막고, 리안느는 화살을 쏘겠다고 하고, 아녜스는
기도를 잊어버립니다 (`core/lines` 의 `PAT`).

## 안 와도 굴러갑니다

그림이 없으면 평소 전신 그대로이고 **대사만** 바뀝니다 (`fallbackSet`). 오면
저절로 붙습니다 — 폴더에 넣고 슬라이서만 돌리면 끝입니다.

## 평소 그림과 무엇이 같아야 하나

**전부입니다.** 하나만 다르면 눌렀을 때 사람이 바뀐 것처럼 보입니다.

| | 같아야 하는 것 |
|---|---|
| 틀 | 2:3 세로, 1024x1536 |
| 등신 | 평소와 **같은 수** (비앙카 8, 이졸데 7.5, 리안느·아녜스 7) |
| 카메라 | 정면 눈높이. 평평하고 앞에서 |
| 옷·무기·머리 | 한 올도 안 바뀝니다 |
| 배경 | 검은 바닥에 오려낸 인물 하나 |
| 키 | 화면에서 같은 상자에 들어갑니다 — 발끝에서 정수리까지 평소와 같은 높이 |

**두 장을 겹쳐 놓았을 때 얼굴과 팔만 움직여야 합니다.** 몸이 통째로 돌아가
있으면 눌렀을 때 인물이 홱 튑니다.

그래서 **평소 전신(`char_full/<id>.png`)을 레퍼런스로 꼭 첨부하세요.** 이
문서의 프롬프트는 그 그림이 옆에 있다는 것을 전제로 씁니다.

## 무엇이 달라야 하나

셋입니다.

1. **얼굴** — 뺨에 1-bit 홍조(짧은 빗금 두세 줄), 눈이 살짝 커지거나 옆으로
   비끼고, 눈썹이 안쪽으로 올라갑니다
2. **한쪽 손** — 머리 쪽으로 반쯤 올라갑니다. 막는 것도 아니고 안 막는 것도
   아닌 어정쩡한 높이입니다
3. **자세가 한 뼘 움츠러듭니다** — 어깨가 조금 올라가고 턱이 조금 당겨집니다.
   발은 그대로입니다

**무기는 그대로 듭니다.** 놓거나 떨어뜨리면 다른 장면이 되고, 무엇보다 실루엣이
바뀌어서 두 그림이 다른 사람으로 보입니다.

## 받은 다음

1. `assets/<날짜>/char-shy-<id>.jpg` 로 넣습니다
2. `tools/sprites.config.json` 에 넷을 더합니다 — `char_full` 과 같은 꼴이고
   폴더 이름만 다릅니다

```json
{ "file": "char-shy-knightgirl.jpg", "name": "char_shy", "grid": [1, 1],
  "labels": ["knightgirl"], "size": 384 },
{ "file": "char-shy-bunnyaxe.jpg", "name": "char_shy", "grid": [1, 1],
  "labels": ["bunnyaxe"], "size": 384, "append": true },
{ "file": "char-shy-elfarcher.jpg", "name": "char_shy", "grid": [1, 1],
  "labels": ["elfarcher"], "size": 384, "append": true },
{ "file": "char-shy-nun.jpg", "name": "char_shy", "grid": [1, 1],
  "labels": ["nun"], "size": 384, "append": true }
```

`size: 384` 를 꼭 넣으세요. 까닭은 `CHAR_FULL_PROMPTS.md` 의 "192 가 아니라
384 인 이유" 에 있습니다 — 기본 상한으로 줄이면 도트 격자가 반토막 나서
치마와 수도복이 얼룩이 됩니다.

3. `python3 tools/slice.py char_shy`

⚠ 슬라이서가 여백을 깎으므로 (`trim`), **평소 그림과 여백이 비슷해야** 두
그림의 인물 크기가 같아집니다. 부끄러운 쪽만 몸을 잔뜩 웅크려 놓으면 트림
뒤에 그쪽이 더 크게 박혀서, 누를 때마다 인물이 커졌다 작아집니다.

---

## 네 장 모두에 들어가는 부분

아래 §1~§4 는 각자 온전합니다. 그대로 복사해 쓰시면 됩니다.

---

## §1. 이졸데 — `knightgirl.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character. Not a sheet: no cells, no grid, no dividing lines, no variants.

THIS IS A SECOND POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her normal standing pose is attached. Match it exactly:
same height in frame, same proportions, same camera, same costume, same weapon,
same hair, same line weight, same dithering density. If the two images were laid
on top of each other, ONLY THE FACE AND ONE ARM would move.

THE CHARACTER:
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword.

PROPORTIONS — UNCHANGED FROM THE REFERENCE.
She is SEVEN AND A HALF HEADS TALL. Her hips sit at the exact vertical midpoint.
NOT chibi, NOT stubby, NOT squat. Same height in the frame as the reference:
crown one twelfth below the top edge, soles one twelfth above the bottom.

WHAT CHANGES — SOMEONE HAS JUST PATTED HER ON THE HEAD.
This is the one thing armour does not stop, and she has no procedure for it.
- HER FACE: eyes wide and cast slightly to one side, not meeting the viewer.
  Eyebrows tilted up at the inner ends. Mouth a small flat line, caught mid-word.
  TWO SHORT DIAGONAL HATCH LINES across each cheekbone — this is how a blush is
  drawn in 1-bit. Not a filled patch, not a circle: two or three clean strokes.
- HER LEFT HAND leaves the pommel and rises HALF WAY toward the top of her head —
  stopped in the air, fingers open, not actually touching the hair. It is the
  gesture of someone who started to block and thought better of it.
- HER RIGHT HAND stays on the pommel. THE GREATSWORD STAYS PLANTED POINT-DOWN
  exactly where it is in the reference. She does not let go of it.
- HER SHOULDERS rise a little and her chin tucks slightly. Her feet do not move.
Everything else is identical to the reference.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, same as the reference.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no
  ground line, no glow, no frame, no sparkles, no floating hearts. She is cut
  out on black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera. She is
  flustered, not undressed: nothing about the costume or the pose changes.

RESOLUTION: read at about 200 pixels tall. Her face has real features — the
widened eyes, the tilted brows, the hatch lines on the cheeks all get their own
pixels. Do NOT upscale a small sprite; draw it at this size.
```

---

## §2. 비앙카 — `bunnyaxe.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character. Not a sheet: no cells, no grid, no dividing lines, no variants.

THIS IS A SECOND POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her normal standing pose is attached. Match it exactly:
same height in frame, same proportions, same camera, same costume, same weapon,
same hair, same line weight, same dithering density. If the two images were laid
on top of each other, ONLY THE FACE, THE EARS AND ONE ARM would move.

THE CHARACTER:
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. A single heavy shoulder guard strapped to her RIGHT shoulder, a thick studded belt slung across her hips. Sheer stockings and heeled boots, one laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall, a broad slab head with a wide curved edge and a short spike on the back.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe.

PROPORTIONS — UNCHANGED FROM THE REFERENCE.
She is EIGHT HEADS TALL, the tallest of the four. Hips at the exact vertical
midpoint. NOT chibi, NOT stubby. Same height in the frame as the reference.

WHAT CHANGES — SOMEONE HAS JUST PATTED HER ON THE HEAD, EARS AND ALL.
She jokes first and it does not work this time.
- HER FACE: eyes wide, one eye slightly more open than the other. Eyebrows up at
  the inner ends. Mouth open in a small startled grin that has gone crooked —
  she is trying to laugh it off and failing.
  TWO OR THREE SHORT DIAGONAL HATCH LINES across each cheekbone. Clean strokes,
  not a filled patch.
- HER RABBIT EARS: BOTH FOLD BACK AND DOWN, flattened against her head the way a
  real rabbit's ears go when startled. THE ONE BENT TIP IS STILL BENT — that is
  who she is. The ears must still fit inside the frame; nothing is cropped.
- HER LEFT HAND comes off her hip and rises toward the top of her head, stopping
  in the air, fingers spread. The torn cuff swings with it.
- HER RIGHT HAND stays up on the haft. THE AXE STAYS SHOULDERED exactly as in
  the reference. She does not drop it.
- HER SHOULDERS rise; her weight stays cocked on the same leg. Her feet do not move.
Everything else is identical to the reference.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, same as the reference.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no
  glow, no sparkles, no floating hearts. She is cut out on black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera. She is
  flustered, not undressed: nothing about the costume or the pose changes.

RESOLUTION: read at about 200 pixels tall. Draw it at this size — do not upscale
a small sprite.
```

---

## §3. 리안느 — `elfarcher.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character. Not a sheet: no cells, no grid, no dividing lines, no variants.

THIS IS A SECOND POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her normal standing pose is attached. Match it exactly:
same height in frame, same proportions, same camera, same clothing, same weapon,
same hair, same line weight, same dithering density. If the two images were laid
on top of each other, ONLY THE FACE, THE EARS AND ONE ARM would move.

THE CHARACTER:
A slight elf woman, watchful and economical — she never makes a movement she does not need.
EARS: long and swept back, clearly elven, the first thing anyone notices.
HAIR: a long high ponytail falling to her waist, two thin braids in front of her ears, a single feather tied into the gather.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist over a fitted long-sleeved underlayer. The hood is DOWN. A leather bracer on her LEFT forearm, a half-cloak behind her right shoulder, wrapped leggings, soft boots laced to the knee.
QUIVER: slim, worn low on her RIGHT hip, four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height, pale dry wood with a bound grip.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow.

PROPORTIONS — UNCHANGED FROM THE REFERENCE.
She is SEVEN HEADS TALL and SLIGHT — narrow, never short-legged, never a child.
Hips at the exact vertical midpoint. Same height in the frame as the reference.

WHAT CHANGES — SOMEONE HAS JUST PATTED HER ON THE HEAD.
She does not have a reaction ready for this and it shows.
- HER FACE: eyes wide and turned sharply to one side, deliberately not looking at
  the viewer. Eyebrows up at the inner ends. Mouth a small tight line — she has
  decided not to say anything and it is costing her.
  TWO SHORT DIAGONAL HATCH LINES across each cheekbone. Clean strokes only.
- HER EARS: the long swept ears DROOP, tilting down and back. This is the loudest
  signal on her, because her ears are the first thing anyone notices.
- HER RIGHT HAND leaves the quiver and rises HALF WAY toward her head, stopping
  in the air, fingers half closed. It does not touch the hair.
- HER LEFT HAND stays down at her side. THE BOW STAYS EXACTLY WHERE IT IS in the
  reference, lower limb near her boot. She does not raise or drop it.
- HER SHOULDERS rise slightly and her chin tucks. Her feet do not move.
Everything else is identical to the reference.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, same as the reference.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no
  forest, no glow, no sparkles, no floating hearts. She is cut out on black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera. She is
  flustered, not undressed: nothing about the clothing or the pose changes.

RESOLUTION: read at about 200 pixels tall. Draw it at this size — do not upscale
a small sprite.
```

---

## §4. 아녜스 — `nun.png`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- The image is artwork EDGE TO EDGE.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character. Not a sheet: no cells, no grid, no dividing lines, no variants.

THIS IS A SECOND POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her normal standing pose is attached. Match it exactly:
same height in frame, same proportions, same camera, same habit, same censer,
same veil, same line weight, same dithering density. If the two images were laid
on top of each other, ONLY THE FACE, THE VEIL AND ONE ARM would move.

THE CHARACTER:
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity.
HAIR: pale, cut short at the nape, a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular front and back, a broad cinched sash at the waist. A short veil PINNED BACK ON HER LEFT SIDE ONLY, so the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long. Thin smoke rises from it at rest. It is not a mace.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point on a short chain.

PROPORTIONS — UNCHANGED FROM THE REFERENCE.
She is SEVEN HEADS TALL. The habit is a TALL NARROW BELL, hem no more than two
and a half head-widths across — a wide skirt makes her look squat. Same height
in the frame as the reference; the hem is the bottom of her silhouette.

WHAT CHANGES — SOMEONE HAS JUST PATTED HER ON THE HEAD, OVER THE VEIL.
She was in the middle of something and has entirely lost it.
- HER FACE: eyes wide and looking up and away, which is the opposite of her usual
  lowered gaze — that reversal is the whole point. Eyebrows up at the inner ends.
  Mouth small and open, a word that did not finish.
  TWO SHORT DIAGONAL HATCH LINES across each cheekbone. Clean strokes only.
- HER VEIL: pushed slightly askew, one edge lifted where the hand touched it, a
  few more pale strands escaping at the temples than in the reference. THE PIN
  IS STILL ON HER LEFT SIDE ONLY.
- HER RIGHT HAND comes up from the censer toward the veil, stopping in the air
  beside her head, fingers half open. The short chain is still wound twice
  around it.
- HER LEFT HAND still holds the censer, now hanging lower and swinging slightly.
  The ribbon of smoke bends with it. THE CENSER STAYS IN HER HAND.
- HER SHOULDERS rise a little and her chin tucks. The hem does not move.
Everything else is identical to the reference.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, same as the reference.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the
  reference. Her habit is dark: mostly OUTLINE with sparse dithering inside, not
  filled solid white.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no
  chapel, no glow, no sparkles, no floating hearts. She is cut out on black.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera. She is
  flustered, not undressed: nothing about the habit or the pose changes.

RESOLUTION: read at about 200 pixels tall. Draw it at this size — do not upscale
a small sprite.
```

---

## Gemini 가 늘 하는 짓

**다른 사람을 그립니다.** 표정만 바꾸라고 해도 자세와 옷을 같이 손봅니다.
평소 전신을 나란히 놓고 보세요 — 발 위치와 어깨 높이가 다르면 다시 받습니다.
누를 때마다 인물이 홱 튑니다.

**무기를 놓습니다.** "부끄러워한다" 를 읽고 손을 둘 다 얼굴로 올려 버립니다.
한 손은 반드시 무기에 남아 있어야 실루엣이 지켜집니다.

**하트와 반짝이를 뿌립니다.** 얼굴 옆에 ♥ 나 별을 넣으려 합니다. 검은 바닥에
인물 하나뿐이어야 하고, 그래야 슬라이서가 여백을 제대로 깎습니다.

**홍조를 덩어리로 칠합니다.** 1-bit 에서 뺨을 흰 덩어리로 채우면 얼굴에 구멍이
난 것처럼 보입니다. 짧은 빗금 두세 줄입니다.

**웅크립니다.** 잔뜩 움츠린 자세로 그려 놓으면 트림 뒤에 인물이 평소보다 크게
박혀서, 누를 때마다 크기가 바뀝니다. 어깨가 조금 올라가는 정도입니다.
