# 캐릭터 전신 — 머리를 쓰다듬길 때

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

[CHAR_SHY_PROMPTS.md](CHAR_SHY_PROMPTS.md) 의 **한 벌 더**입니다. 같은 사람,
같은 틀, 같은 크기 — **얼굴과 한쪽 팔만** 다릅니다.

| | |
|---|---|
| 어디에 쓰나 | 영웅 관리에서 인물의 **머리를 눌렀을 때** (`screens/home/HeroManage` 의 `HEAD`) |
| 폴더 | `assets/sprites/char_pat/` |
| 파일 이름 | `knightgirl.png` · `bunnyaxe.png` · `elfarcher.png` · `nun.png` |
| 모델 | Gemini |
| 요청 | **4번** (한 명당 한 번) |

⚠ **평소 전신(`assets/sprites/char_full/<id>.png`)을 레퍼런스로 꼭 첨부하세요.**
아래 프롬프트는 그 그림이 옆에 있다는 것을 전제로 씁니다.

---

## 부끄러운 그림과 무엇이 다른가

**같은 부끄러움이 아닙니다.** 이게 넉 장을 더 그리는 이유입니다.

| | 무엇이 무너지나 | 얼굴 |
|---|---|---|
| **가슴** ([CHAR_SHY](CHAR_SHY_PROMPTS.md)) | 사고입니다. 무너지는 것은 **말**입니다 | 눈이 **커지고**, 시선이 **비끼고**, 입이 벌어집니다. 웃음은 없습니다 |
| **머리** (이 문서) | 애정입니다. 무너지는 것은 **위엄**입니다 | 눈이 **부드러워지고**, 시선이 **위로** 갑니다. **작은 웃음이 있어야 합니다** |

**웃음이 있어야 한다**는 것이 두 문서의 제일 큰 차이입니다. 가슴 쪽 문서는
"웃지 마라" 를 세 번 반복해서 적어 뒀는데, 이 문서에서는 반대입니다 — 쓰다듬는
것을 싫어하는 얼굴을 그리면 다시 누를 이유가 없어집니다.

## 셋만 지키면 됩니다

### 1. **시선이 위로 갑니다**

넷 다 이것 하나로 "머리 위에 손이 있다" 가 읽힙니다. 손은 안 그리기 때문에,
시선이 아래나 정면이면 그냥 부끄러운 그림이 한 장 더 있는 것이 됩니다.

### 2. **고개는 내려가고 눈은 올라갑니다**

턱을 당기고 고개를 몇 도 숙이는데 눈만 위를 봅니다. 이 어긋남이 곧 "머리에
무게가 얹혀 있다" 입니다. 둘 중 하나만 하면 안 됩니다.

### 3. **손은 안 그립니다**

쓰다듬는 손을 그리면 화면 위쪽에 잘려 들어오는데, 거기는 말풍선 자리입니다.
그리고 손 하나가 실루엣을 통째로 바꿔 놓아서 두 그림이 안 겹칩니다.

## ⚠ 바깥 경계가 **바뀌면 안 됩니다**

이게 이 문서에서 제일 자주 깨질 자리입니다.

세 그림(평소 · 부끄러움 · 쓰다듬김)은 **같은 자리에서 오려냅니다.** 원본에서
잘라낼 네모가 하나이고 그 뒤로는 여백을 안 깎습니다 (`region` + `noTrim`) —
그래야 갈아 끼울 때 인물이 안 튑니다. 까닭과 지난번에 났던 일은
[CHAR_SHY_PROMPTS.md](CHAR_SHY_PROMPTS.md) 의 같은 항목에 있습니다.

그래서 **새 그림이 그 네모 밖으로 나가면 잘립니다.** 특히 이 넷:

| | 나갈 만한 것 |
|---|---|
| 비앙카 | 귀가 지금도 그림 꼭대기에 붙어 있습니다. 더 서면 잘립니다 |
| 아녜스 | 넷 중 제일 좁게 잘려 있습니다 (원본 폭의 59%). **향로가 옆으로 나가면 안 됩니다** — 부끄러운 그림에서 실제로 45px 나갔었습니다 |
| 리안느 | 뾰족한 귀와 꽁지머리 |
| 이졸데 | 올린 팔꿈치 |

그래서 프롬프트 넷에 **팔꿈치를 옆구리에 붙이라**는 문장이 들어 있습니다. 손을
머리 쪽으로 올리되 팔이 옆으로 벌어지지 않게 하는 것이 목적입니다.

받은 뒤에 세 그림의 경계를 다시 합쳐서 재고, 넘치면 넷을 통째로 다시 오립니다
(그때는 과녁 표도 다시 재야 합니다).

## 받은 다음

1. `assets/<날짜>/char-pat-<id>.jpg` 로 넣습니다
2. `tools/sprites.config.json` 에 넷이 **이미 들어가 있습니다** — 부끄러운
   그림과 같은 `region` 을 쓰도록 미리 적어 뒀습니다

```json
{ "file": "char-pat-nun.jpg", "name": "char_pat", "grid": [1, 1],
  "labels": ["nun"], "size": 384, "append": true,
  "region": [0.2751, 0.0381, 0.8617, 0.9697], "noTrim": true }
```

3. `python3 tools/slice.py char_pat`
4. 네 그림의 크기가 부끄러운 쪽과 **픽셀까지 같은지** 확인합니다
   (243x384 · 248x384 · 226x384 · 162x384). 다르면 경계가 넘친 것입니다

`size: 384` 를 꼭 두세요. 까닭은 `CHAR_FULL_PROMPTS.md` 의 "192 가 아니라 384 인
이유" 에 있습니다 — 기본 상한으로 줄이면 도트 격자가 반토막 나서 치마와 수도복이
얼룩이 됩니다.

## 아직 없어도 화면은 돕니다

머리 그림이 없으면 **부끄러운 그림으로 떨어집니다** (`HeroManage` 의 `pose`).
대사와 몸짓만 갈리고 얼굴은 가슴 쪽과 같습니다 — 눌렀는데 빈자리가 뜨는 것보다
낫습니다.

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

WHAT CHANGES — SOMEONE IS PATTING HER ON THE HEAD, RIGHT NOW.
A hand is resting on her crown. THE HAND IS NOT DRAWN — only her reaction to it.

SHE IS EMBARRASSED AND SHE DOES NOT ACTUALLY MIND. This is the important part and
it is what separates this drawing from her flustered one: she is being treated
like a child in front of everyone, her dignity is gone, and some part of her is
enjoying it anyway. A SMALL RELUCTANT ALMOST-SMILE IS WANTED HERE.

SHE IS NOT ANGRY, NOT ALARMED, NOT SHOUTING. Nothing is startling her. The blush
is not panic; it is being caught liking something.
- HER FACE: eyes open but SOFTER than usual — the lids relax, they do NOT go wide
  with alarm and they do NOT narrow into a glare. She is LOOKING UP AND SLIGHTLY
  TO ONE SIDE, toward whatever is above her head. THIS UPWARD GAZE IS THE SINGLE
  MOST IMPORTANT THING IN THE DRAWING: it is what tells the viewer there is a
  hand up there.
  Eyebrows UP AT THE INNER ENDS, the worried slant.
  Mouth SMALL AND CLOSED, with ONE CORNER PULLED VERY SLIGHTLY HIGHER — the start
  of a smile she is trying to suppress and failing to.
  TWO SHORT DIAGONAL HATCH LINES across each cheekbone — this is how a blush is
  drawn in 1-bit. Not a filled patch, not a circle: two or three clean strokes.
- HER HEAD TILTS DOWN a few degrees and HER CHIN TUCKS, as if under a light weight
  resting on the crown. The eyes go up while the head goes down. That combination
  IS the gesture.
- HER LEFT HAND comes up to her own circlet, fingertips just touching it, as if
  checking whether her hair is still in order. THE ELBOW STAYS TUCKED IN AGAINST
  HER RIBS — the arm does not swing outward.
- HER RIGHT HAND stays on the pommel. THE GREATSWORD STAYS PLANTED POINT-DOWN
  exactly where it is in the reference. She does not let go of it.
- HER SHOULDERS rise slightly. Her feet do not move.
Everything else is identical to the reference. The armour and the dress are drawn
exactly as before: nothing is loosened, displaced, opened, or removed.

THE OUTER EDGES OF THE DRAWING MUST NOT CHANGE. Nothing reaches further up, down,
left or right than it does in the reference — not the circlet, not the raised
elbow, not the cape, not one strand of hair. The two images get cropped from the
same rectangle, so anything that sticks out further gets cut off.

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

WHAT CHANGES — SOMEONE IS PATTING HER ON THE HEAD, RIGHT NOW.
A hand is resting on her head, between the ears. THE HAND IS NOT DRAWN — only her
reaction to it.

SHE IS EMBARRASSED AND SHE LIKES IT AND SHE HATES THAT SHE LIKES IT. Unlike her
flustered drawing, A SMALL CROOKED SMILE IS WANTED HERE — she is the one who
usually does the teasing and she has just lost that job. She is the oldest of the
four and is being handled like the youngest.

SHE IS NOT ANGRY, NOT ALARMED, NOT SHOUTING.
- HER FACE: eyes open and SOFT, not wide with alarm, not narrowed. LOOKING UP AND
  SLIGHTLY TO ONE SIDE, toward whatever is above her head. THIS UPWARD GAZE IS THE
  SINGLE MOST IMPORTANT THING IN THE DRAWING.
  Eyebrows UP AT THE INNER ENDS.
  Mouth SMALL, with ONE CORNER PULLED HIGHER — a crooked half-smile, closed or
  barely open. Not a grin, not a smirk, not teeth.
  TWO OR THREE SHORT DIAGONAL HATCH LINES across each cheekbone, HEAVIER than on
  the others — she blushes harder than anyone. Clean strokes, not a filled patch.
- HER RABBIT EARS: BOTH SNAP STRAIGHT UP, STIFF AND ALERT — the opposite of the
  flattened ears in her flustered drawing. THE ONE BENT TIP IS STILL BENT: that is
  who she is and it never straightens.
  THE EAR TIPS MUST NOT REACH ANY HIGHER IN THE FRAME THAN IN THE REFERENCE. They
  stiffen in place; they do not grow.
- HER LEFT HAND comes off her hip and UP TO THE BASE OF ONE EAR, fingers half
  closed around the headband, as if to move the hand away and not actually doing
  it. THE ELBOW STAYS TUCKED IN — the arm does not swing outward. The torn cuff
  hangs from that wrist.
- HER RIGHT HAND stays up on the haft. THE AXE STAYS SHOULDERED exactly as in the
  reference. She does not drop it.
- HER HEAD TILTS DOWN a few degrees and HER CHIN TUCKS. The eyes go up while the
  head goes down. That combination IS the gesture. Her weight stays cocked on the
  same leg; her feet do not move.
Everything else is identical to the reference. The leotard, collar, bow tie, belt
and stockings are drawn exactly as before: nothing is loosened, displaced, pulled
aside, or made transparent.

THE OUTER EDGES OF THE DRAWING MUST NOT CHANGE. Nothing reaches further up, down,
left or right than it does in the reference — not the ears, not the axe head, not
the raised elbow. The two images get cropped from the same rectangle, so anything
that sticks out further gets cut off.

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

WHAT CHANGES — SOMEONE IS PATTING HER ON THE HEAD, RIGHT NOW.
A hand is resting on her crown. THE HAND IS NOT DRAWN — only her reaction to it.

SHE HAS DECIDED TO ALLOW IT. That decision is the whole drawing. She does not
flinch, she does not step back, she does not say anything — she simply stops and
lets it happen, and her ears give her away.

THIS IS THE ONE PLACE WHERE SHE DOES NOT GO WIDE-EYED. In her flustered drawing
her eyes are wide; here they are the opposite.
- HER FACE: eyes HALF-LIDDED and calm, tilted UP AND SLIGHTLY TO ONE SIDE toward
  whatever is above her head. THIS UPWARD GAZE IS THE SINGLE MOST IMPORTANT THING
  IN THE DRAWING.
  Eyebrows UP AT THE INNER ENDS, faintly.
  Mouth a SMALL FLAT LINE, corners neither up nor down — she is not smiling and
  she is not unhappy. All the feeling is in the eyes and the ears.
  TWO SHORT DIAGONAL HATCH LINES across each cheekbone. Clean strokes only.
- HER LONG ELVEN EARS DROOP — the tips tilt downward and back, the way an animal's
  ears go when it relaxes. This is the loudest thing on her, because those ears
  never move. THE EAR TIPS MUST NOT REACH FURTHER OUT TO THE SIDES than in the
  reference; they tilt down, not outward.
- HER HEAD TILTS DOWN a few degrees and HER CHIN TUCKS. The eyes go up while the
  head goes down. That combination IS the gesture. Her ponytail hangs a little
  further forward over one shoulder.
- HER LEFT HAND comes up and takes hold of one of the thin braids in front of her
  ear, holding it rather than fiddling with it. THE ELBOW STAYS TUCKED IN — the
  arm does not swing outward.
- HER RIGHT HAND stays on the bow. THE BOW STAYS EXACTLY WHERE IT IS in the
  reference, held down at her side. She does not raise it or drop it.
- Her shoulders drop rather than rise — she is not braced. Her feet do not move.
Everything else is identical to the reference. The tunic, bracer, half-cloak,
quiver and leggings are drawn exactly as before: nothing is loosened, displaced,
opened, or removed. The hood stays DOWN.

THE OUTER EDGES OF THE DRAWING MUST NOT CHANGE. Nothing reaches further up, down,
left or right than it does in the reference — not the ears, not the ponytail, not
the bow, not the raised elbow. The two images get cropped from the same rectangle,
so anything that sticks out further gets cut off.

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
on top of each other, ONLY THE FACE AND ONE ARM would move.

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

WHAT CHANGES — SOMEONE IS PATTING HER ON THE HEAD, RIGHT NOW.
A hand is resting on her veil. THE HAND IS NOT DRAWN — only her reaction to it.

NOBODY HAS EVER DONE THIS TO HER AND SHE DOES NOT KNOW WHAT IT IS. She is not
frightened and she is not offended; she has simply run out of procedure. The
smallest, most tentative pleasure is showing on her face and she does not know
it is showing.

SHE IS NOT ALARMED AND SHE IS NOT SCANDALISED INTO STERNNESS.
- HER FACE: eyes OPEN AND ROUND AND SOFT — not wide with shock, not narrowed —
  looking STRAIGHT UP, directly at what is above her. Her habit is to keep her
  eyes lowered, so this straight-up gaze is a reversal, AND IT IS THE SINGLE MOST
  IMPORTANT THING IN THE DRAWING.
  Eyebrows UP AT THE INNER ENDS.
  Mouth SMALL AND CLOSED, corners lifted the tiniest amount — the very beginning
  of a smile she is not aware of.
  TWO SHORT DIAGONAL HATCH LINES across each cheekbone. Clean strokes only.
- HER HEAD TILTS DOWN a few degrees and HER CHIN TUCKS under the weight on her
  veil, while her eyes go up. That combination IS the gesture.
- HER RIGHT HAND comes up and touches the PINNED EDGE OF THE VEIL on her left
  side, fingertips only, steadying it. The wide bell sleeve falls back a little.
  The short chain is still wound twice around that hand. THE ELBOW STAYS TUCKED
  IN AGAINST HER RIBS — the arm does not swing outward.
- HER LEFT HAND still holds the censer AND THE CENSER DOES NOT MOVE. It hangs
  exactly where it hangs in the reference, and the ribbon of smoke rises exactly
  as before. IT MUST NOT SWING OUT TO THE SIDE.
- A few more pale strands escape at the temples. THE VEIL IS STILL PINNED ON HER
  LEFT SIDE ONLY. The hem does not move.
Everything else is identical to the reference. The habit, scapular, sash and veil
are drawn exactly as before: nothing is loosened, displaced, opened, or removed.

THE OUTER EDGES OF THE DRAWING MUST NOT CHANGE. Nothing reaches further up, down,
left or right than it does in the reference — and THE CENSER ESPECIALLY MUST NOT
SWING OUTWARD. Hers is the narrowest crop of the four; anything that sticks out
further gets cut off.

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

**무기를 놓습니다.** "부끄러워한다" 를 읽고 팔을 둘 다 올려 버립니다. 한
손은 반드시 무기에 남아 있어야 실루엣이 지켜집니다 — 움직이는 팔은 하나입니다.

**옷을 손봅니다.** 이 대목을 읽으면 옷깃을 벌리거나 끈을 흘러내리게 하려
합니다. 옷은 평소 그림과 **한 올도 같아야** 합니다. 달라진 것은 얼굴과 팔
하나뿐이고, 그래야 두 장이 겹쳐집니다.

**화난 얼굴을 그립니다.** 이게 제일 자주 납니다. 눈꼬리가 올라가고 눈이
가늘어지고 입이 일자로 굳으면 그건 노려보는 얼굴입니다 — 부끄러운 얼굴은
눈이 **커지고** 눈썹 안쪽이 **올라갑니다**. 눈썹이 팔자인지부터 보세요.

**비앙카만 웃깁니다.** 평소 그림에서 늘 웃고 있는 사람이라, 레퍼런스를 붙이면
그 웃음을 그대로 옮겨 놓습니다. 그러면 부끄러운 게 아니라 **받아 주는 얼굴**이
되어 넷 중 혼자 겉돕니다. 이 칸에서 웃음은 **없어야** 하고, 없어진 것이 곧
신호입니다 — 입은 나머지 셋과 똑같이 작고 살짝 벌어진 모양입니다.

**좋아하는 얼굴을 그립니다.** 반대쪽 실패입니다. 눈웃음이나 유혹하는 표정으로
가면 이 그림이 "계속 누르라" 가 됩니다. 노리는 자리는 그 둘 사이입니다.

**하트와 반짝이를 뿌립니다.** 얼굴 옆에 ♥ 나 별을 넣으려 합니다. 검은 바닥에
인물 하나뿐이어야 하고, 그래야 슬라이서가 여백을 제대로 깎습니다.

**홍조를 덩어리로 칠합니다.** 1-bit 에서 뺨을 흰 덩어리로 채우면 얼굴에 구멍이
난 것처럼 보입니다. 짧은 빗금 두세 줄입니다.

**웅크립니다.** 잔뜩 움츠린 자세로 그려 놓으면 트림 뒤에 인물이 평소보다 크게
박혀서, 누를 때마다 크기가 바뀝니다. 어깨가 조금 올라가는 정도입니다.
