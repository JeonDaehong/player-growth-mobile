# 캐릭터 전신 — 주저앉아 완전히 부끄러워하는 그림

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

[CHAR_SHY_PROMPTS.md](CHAR_SHY_PROMPTS.md) 의 **한 단계 더**입니다. 같은 사람,
같은 옷, 같은 틀 — **서 있던 사람이 주저앉습니다.**

| | |
|---|---|
| 어디에 쓰나 | 영웅 관리의 **숨겨진 반응** — 같은 자리를 1초 안에 열 번 두들겼을 때 |
| 폴더 | `assets/sprites/char_down/` |
| 파일 이름 | `knightgirl.png` · `bunnyaxe.png` · `elfarcher.png` · `nun.png` |
| 모델 | Gemini |
| 요청 | **4번** (한 명당 한 번) |

⚠ **부끄러워하는 그림(`char_shy/<id>.png`)을 레퍼런스로 첨부하세요.** 평소
그림이 아니라 **부끄러운 쪽**입니다 — 얼굴이 거기서 한 단계 더 무너지는
것이라, 평소 얼굴을 기준으로 그리면 두 칸이 건너뛰어집니다.

---

## 넉 장이 한 줄로 이어집니다

| | 무엇이 무너지나 |
|---|---|
| 평소 (`char_full`) | — |
| 부끄러움 (`char_shy`) | 말이 막힌다. **서 있다** |
| 쓰다듬김 (`char_pat`) | 위엄이 무너진다. 여전히 서 있다 |
| **주저앉음 (이 문서)** | **다리가 풀린다.** 서 있는 것을 그만둔다 |

앞의 셋은 얼굴과 팔 하나만 움직였습니다. 이건 **처음으로 몸이 통째로
움직이는 칸**이라, 규칙이 하나 바뀝니다.

---

## ⚠ 이 문서에서 제일 중요한 것: **틀이 안 바뀝니다**

네 그림(`char_full` · `char_shy` · `char_pat` · `char_down`)은 원본에서
**같은 네모 한 칸**으로 오려집니다. 그래야 갈아 끼울 때 인물이 안 튑니다
(까닭과 지난번에 났던 일은 [CHAR_SHY_PROMPTS.md](CHAR_SHY_PROMPTS.md) 에).

### 세로는 **줄어드는 쪽**이라 괜찮습니다

앉으면 머리가 내려옵니다. 틀은 그대로고 그 안에서 사람만 낮아지므로, 화면에서
**같은 자리에 있던 사람이 그대로 주저앉는 것**으로 보입니다. 이게 이 그림이
노리는 전부입니다.

그래서 **발과 엉덩이가 바닥에 닿는 높이가 서 있을 때의 발 높이와 같아야**
합니다. 그림 아래끝이 곧 바닥입니다. 거기서 뜨면 공중에 떠서 앉은 것이 되고,
내려가면 잘립니다.

### 가로는 **거의 여유가 없습니다**

앉으면 무릎이 벌어지고 치맛단이 바닥에 퍼집니다. 그게 이 그림의 함정입니다.

| | 지금 폭 | 넘어도 되는 여유 |
|---|---|---|
| 이졸데 | 243 | **+12px** |
| 비앙카 | 248 | **+7px** |
| 리안느 | 226 | +29px |
| 아녜스 | 175 | +80px |

이 값을 넘으면 화면 상자(153×230)에 세로로 못 맞춰서 **네 그림이 전부 작아
집니다** — 주저앉는 그림 하나 때문에 평소 그림까지 줄어듭니다.

그래서 프롬프트 넷에 **"서 있을 때보다 옆으로 더 나가지 마라"** 를 박아
뒀습니다. 앉되 **모아 앉는** 자세인 까닭이 이것입니다 — 무릎을 모으고, 치맛단은
앞으로 접히고, 팔은 몸에 붙습니다. 마침 그 자세가 이 그림의 감정과도 맞습니다.

---

## ⚠ 제일 흔한 실패: **그냥 서 있는 채로 나옵니다**

레퍼런스가 서 있는 그림이고 "옷·무기·머리를 그대로" 라고 못을 박아 두므로,
생성기가 **자세까지 그대로 두는** 쪽으로 기웁니다. 특히 앉는 자세와 어긋나는
지시가 하나라도 있으면 거기서 무너집니다.

실제로 이졸데에서 났습니다. **넷 중 이졸데만 안 앉았습니다.**

두 번에 걸쳐 고쳤는데, 첫 번째는 절반만 맞았습니다. 처음 문장이 "손은 검
손잡이에 그대로" 였고, 검이 키만 한 것을 세워 두고 손잡이를 잡으려면 서 있어야
하므로 — 손을 날 아래쪽으로 내렸습니다. 그런데도 계속 섰습니다.

**남은 원인은 검 자체였습니다.** 잘 되는 셋을 다시 보니 셋 다 무기가 **바닥에
누워 있었습니다** (도끼 · 활 · 향로). 이졸데만 제 키만 한 것을 세워 두고
있었고, 그 긴 세로 하나가 그림 전체를 서 있는 구도로 끌어당겼습니다. 옆에 선
것이 있으면 사람도 서게 됩니다.

그래서 검도 눕혔습니다. "검은 안 놓는다" 는 성격은 **쓰러진 검 위에 손을
얹는 것**으로 남겼습니다.

넷에 공통으로 박은 것은 셋입니다.

- **자세를 맨 앞에 씁니다.** 사람 설명보다 **먼저** "바닥에 앉아 있다" 를 못
  박고, "아래 설명은 이 문단을 못 뒤집는다" 를 덧붙입니다
- **무기를 전부 바닥에 눕힙니다.** 서 있어야만 가능한 자세도, 서 있는 물건도
  하나도 안 남깁니다
- **안 되는 것을 적습니다.** `서 있지 않는다 · 무릎만 굽히지 않는다 ·
  기대 서지 않는다`

**나온 그림을 볼 때는 머리 높이만 보세요.** 머리 꼭대기가 그림의 절반 위에
있으면 실패입니다 — 앉으면 반드시 절반 아래로 내려옵니다.

## 넷이 **다르게 주저앉습니다**

| | 어떻게 무너지나 |
|---|---|
| 이졸데 | 무릎이 꺾여 옆으로 앉는다. **검이 옆에 쓰러져 있고** 손은 그 위에 얹혀 있다 — 놓지는 않았다 |
| 비앙카 | 뒤로 털썩. 다리를 뻗고 손으로 뒤를 짚는다. 넷 중 제일 크게 무너진다 |
| 리안느 | 소리 없이 웅크린다. 무릎을 안고 얼굴을 반쯤 묻는다. 제일 작아진다 |
| 아녜스 | 무릎을 꿇는다. 기도하던 자세와 같은데 **이번엔 기도가 아니다** |

무너지는 방식이 곧 그 사람입니다. 넷이 다 똑같이 앉으면 넉 장을 그릴 값이
없습니다.

## 얼굴은 **`char_shy` 에서 한 단계 더**입니다

부끄러움의 방향은 그대로입니다 — 화난 것도 좋아하는 것도 아닙니다. 다만
거기서 **더 무너집니다**.

| | `char_shy` | 이 문서 |
|---|---|---|
| 눈 | 크게 뜨고 옆으로 비낀다 | **감거나 반쯤 감는다.** 더는 못 본다 |
| 입 | 작게 벌어진다 | 그대로거나 **다물린다** |
| 홍조 | 빗금 두세 줄 | **빗금 넷, 귀와 목까지** |
| 몸 | 어깨가 올라간다 | 다리가 풀린다 |

**눈을 감는 것이 이 칸의 신호입니다.** 서 있는 그림에서는 다 눈을 뜨고
있으므로, 감긴 눈 하나로 "여기가 끝이다" 가 읽힙니다.

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

THE POSE — READ THIS FIRST, BEFORE THE CHARACTER DESCRIPTION.
SHE IS SITTING ON THE FLOOR. Both legs are folded to one side underneath her —
the ordinary anime "side sit". HER HIPS AND ONE THIGH ARE FLAT ON THE GROUND.
Her greatsword is NOT in her hands: IT IS LYING ON THE GROUND BESIDE HER.
Everything below describes who she is; none of it overrides this paragraph.

THIS IS A FOURTH POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her FLUSTERED STANDING pose is attached. Same costume, same
armour, same greatsword, same hair, same circlet, same line weight, same
dithering density. THE POSE IS THE ONE THING THAT DOES NOT CARRY OVER — she was
standing there and she is sitting here.

THE CHARACTER:
A young woman knight, calm and unhurried, though not right now.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel.

WHAT CHANGES — SHE IS ON THE GROUND. SHE IS NOT STANDING.

READ THIS PARAGRAPH BEFORE ANYTHING ELSE. In the attached reference she is
standing on her feet. IN THIS DRAWING SHE IS NOT. Her knees have given out and
she has gone all the way down. She is NOT standing, NOT half-standing, NOT
merely bending her knees, NOT crouching on her toes, and NOT leaning against
her sword while upright. HER HIPS ARE ON THE GROUND. If her head is anywhere
in the upper half of the picture, the drawing is wrong.

SHE IS SITTING ON THE GROUND IN A SIDE SIT: both legs folded to her LEFT and
tucked under her, one knee just in front of the other, her weight resting on her
left hip and thigh. Her skirt has fallen into a pool AROUND HER AND IN FRONT OF
HER — FORWARD, NOT OUTWARD.

- ⚠ THE GREATSWORD IS ON THE GROUND. She is not holding it up, not planting it,
  not leaning on it, not resting her hand on a raised pommel. IT HAS FALLEN AND
  IT IS LYING FLAT.
  It lies BESIDE HER, ON HER RIGHT, running FORWARD AND BACK (its length going
  toward and away from the viewer) so that it is FORESHORTENED and does not
  stretch out sideways across the picture.
  THIS IS THE MOST IMPORTANT LINE IN THIS PROMPT. A tall sword held upright drags
  the whole drawing back onto its feet: if the sword is standing, she ends up
  standing. It has to be down before she can be.
- HER RIGHT HAND rests loosely on the fallen grip — she went down and it went
  down with her, and she still has not really let go.
- HER LEFT ARM is folded across her chest, hand gripping her own right elbow.
- HER FACE: EYES CLOSED, or barely open. Head turned down and away, chin tucked
  hard toward her collarbone. Eyebrows UP AT THE INNER ENDS. Mouth closed in a
  thin line — she has stopped trying to speak.
  FOUR SHORT DIAGONAL HATCH LINES across each cheekbone, and MORE ON THE EAR AND
  THE SIDE OF THE NECK. This is how a blush is drawn in 1-bit: clean strokes,
  never a filled patch.
- HER SHOULDERS are drawn up and IN, not back.
Everything else is identical to the reference. The armour and the dress are drawn
exactly as before: nothing is loosened, displaced, opened, or removed.

HEIGHT CHECK — THE SINGLE EASIEST WAY TO TELL THIS DRAWING IS RIGHT.
HER HEAD IS AT ABOUT 55% OF THE FRAME HEIGHT, measured from the top: the crown of
her head sits BELOW THE VERTICAL MIDDLE OF THE PICTURE. Standing, her head was
near the top. She has lost roughly half her height. The BOTTOM of her — skirt,
hip, folded legs — RESTS ON THE SAME GROUND LINE HER FEET STOOD ON in the
reference. Nothing floats.

NOTHING IN THIS PICTURE STANDS UPRIGHT. Not her, not the sword. The tallest
thing in the frame is her own bowed head. If some tall vertical shape reaches the
top of the picture, something has gone wrong — go back and put the sword down.

⚠ SHE MUST NOT GET WIDER. Draw the whole figure INSIDE THE SAME LEFT AND RIGHT
LIMITS as the standing reference — measure it. Knees together, skirt folded
FORWARD toward the viewer rather than spread sideways, cape gathered against her
back, elbows tucked. If any part of her reaches further left or right than in the
reference, the drawing is unusable.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, same as the reference. Do not
tilt down at her; the camera does not move just because she did.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY. No floor, no shadow, no
  ground line, no glow, no frame, no sparkles, no floating hearts.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera, no
  upskirt angle. She is overwhelmed, not undressed: nothing about the costume
  changes.

RESOLUTION: read at about 200 pixels tall. Draw at this size; do not upscale a
small sprite.
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

THIS IS A FOURTH POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her FLUSTERED STANDING pose is attached. Same outfit, same
axe, same ears, same hair, same line weight, same dithering density. Only the
BODY and the FACE change.

THE CHARACTER:
A tall young woman in a bunny-girl outfit who normally finds everything funny.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, ONE OF THEM BENT OVER NEAR THE TIP.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. A single heavy shoulder guard strapped to her RIGHT shoulder, a thick studded belt slung across her hips. Sheer stockings and heeled boots, one laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall, a broad slab head with a wide curved edge and a short spike on the back.

WHAT CHANGES — SHE IS ON THE GROUND. SHE IS NOT STANDING.

READ THIS PARAGRAPH BEFORE ANYTHING ELSE. In the attached reference she is
standing on her feet. IN THIS DRAWING SHE IS NOT. She is NOT standing, NOT
half-standing, NOT merely bending her knees, NOT leaning on anything while
upright. HER HIPS ARE ON THE GROUND. If her head is anywhere in the upper half
of the picture, the drawing is wrong.

She has landed on the floor. She is the one who usually laughs first, and she
has just run out of ways to.

SHE IS SITTING FLAT ON THE GROUND, dropped straight down: KNEES UP AND PRESSED
TOGETHER in front of her, both feet flat, heels close to her hips. Her arms wrap
around her own shins and PULL HER KNEES IN AGAINST HER CHEST.
- THE AXE HAS COME DOWN WITH HER — laid flat on the ground BESIDE HER RIGHT HIP,
  the haft running FORWARD AND BACK (toward and away from the viewer), NOT
  sideways across the frame. She is not holding it any more; her hands are busy.
  IT MUST NOT STICK OUT PAST HER OWN SILHOUETTE.
- HER RABBIT EARS ARE BOTH FOLDED FLAT BACK AND DOWN, laid along her head the
  way a rabbit flattens them. THE ONE BENT TIP IS STILL BENT.
- HER FACE: EYES SQUEEZED SHUT. Head tipped down so her fringe hides her brow,
  face half buried behind her own knees. Eyebrows UP AT THE INNER ENDS. Mouth
  small and shut.
  FOUR SHORT DIAGONAL HATCH LINES across each cheekbone, HEAVIER than on the
  others, AND MORE ALONG THE EARS AND THE BACK OF THE NECK — she blushes harder
  than anyone. Clean strokes, never a filled patch.
Everything else is identical to the reference. The leotard, collar, bow tie, belt
and stockings are drawn exactly as before: nothing is loosened, displaced, pulled
aside, or made transparent.

HEIGHT CHECK — THE SINGLE EASIEST WAY TO TELL THIS DRAWING IS RIGHT.
The crown of her head sits BELOW THE VERTICAL MIDDLE OF THE PICTURE. Standing,
her head was near the top; she has lost roughly half her height.
HER HEAD IS AT ABOUT 55% OF THE FRAME HEIGHT. Her hips and the soles of her
boots REST ON THE SAME GROUND LINE her feet stood on in the reference.

THE AXE, laid on the ground, is the only thing still at her old scale — it is
nearly as long as she was tall, and now she is folded up beside it.

⚠ SHE MUST NOT GET WIDER. She has the LEAST ROOM OF THE FOUR — draw the whole
figure, the axe included, INSIDE THE SAME LEFT AND RIGHT LIMITS as the standing
reference. Knees together, arms wrapped tight, ears folded back rather than out,
axe laid front-to-back rather than across. If any part reaches further left or
right than in the reference, the drawing is unusable.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal. The camera does not move.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera, no
  upskirt angle. Knees together, and the pose reads as folding up, not opening.
  She is overwhelmed, not undressed.

RESOLUTION: read at about 200 pixels tall.
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

THIS IS A FOURTH POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her FLUSTERED STANDING pose is attached. Same clothing, same
bow, same quiver, same ears, same hair, same line weight, same dithering density.
Only the BODY and the FACE change.

THE CHARACTER:
A slight elf woman, watchful and economical, who says as little as possible.
EARS: long and swept back, clearly elven.
HAIR: a long high ponytail falling to her waist, two thin braids in front of her ears, a single feather tied into the gather.
CLOTHING: a short hooded tunic belted at the waist over a fitted long-sleeved underlayer. The hood is DOWN. A leather bracer on her LEFT forearm, a half-cloak behind her right shoulder, wrapped leggings, soft boots laced to the knee.
QUIVER: slim, worn low on her RIGHT hip.
WEAPON: a SHORT recurve bow, about half her height, pale dry wood with a bound grip.

WHAT CHANGES — SHE IS ON THE GROUND. SHE IS NOT STANDING.

READ THIS PARAGRAPH BEFORE ANYTHING ELSE. In the attached reference she is
standing on her feet. IN THIS DRAWING SHE IS NOT. She is NOT standing, NOT
half-standing, NOT merely bending her knees, NOT leaning on anything while
upright. HER HIPS ARE ON THE GROUND. If her head is anywhere in the upper half
of the picture, the drawing is wrong.

She has crouched all the way down and made herself small. She does not fall and
she does not make a sound. She just folds up, which for her is the loudest thing
she has ever done.

SHE IS CROUCHING ON HER HEELS, knees drawn all the way up to her chest and
PRESSED TOGETHER, feet flat, arms wrapped around her own shins. Her back is
rounded. SHE IS THE SMALLEST SHAPE OF THE FOUR — a single tucked bundle.
- HER FACE IS HALF BURIED behind her own knees. Only her eyes and above are
  clear of them.
- HER FACE: EYES CLOSED. Eyebrows UP AT THE INNER ENDS, faintly. Mouth hidden.
  FOUR SHORT DIAGONAL HATCH LINES across each cheekbone AND ALONG BOTH LONG EARS.
  Clean strokes, never a filled patch.
- HER LONG ELVEN EARS DROOP HARD, tips tilted down and back along her head.
  THEY MUST NOT REACH FURTHER OUT TO THE SIDES than in the reference.
- HER PONYTAIL has fallen forward over one shoulder and pools beside her.
- THE BOW is laid on the ground beside her, FORWARD-AND-BACK relative to the
  viewer, not across the frame. The quiver is still on her hip.
Everything else is identical to the reference. The tunic, bracer, half-cloak and
leggings are drawn exactly as before. The hood stays DOWN.

HEIGHT CHECK — THE SINGLE EASIEST WAY TO TELL THIS DRAWING IS RIGHT.
The crown of her head sits BELOW THE VERTICAL MIDDLE OF THE PICTURE. Standing,
her head was near the top; she has lost roughly half her height.
HER HEAD IS AT ABOUT 58% OF THE FRAME HEIGHT — she goes lower than the others
because she folds rather than sits. Her heels and hips REST ON THE SAME GROUND
LINE her feet stood on in the reference.

⚠ SHE MUST NOT GET WIDER. Draw the whole figure INSIDE THE SAME LEFT AND RIGHT
LIMITS as the standing reference. Knees together, arms wrapped, ears down rather
than out, bow laid front-to-back. If any part reaches further left or right than
in the reference, the drawing is unusable.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal. The camera does not move.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera, no
  upskirt angle. She is overwhelmed, not undressed.

RESOLUTION: read at about 200 pixels tall.
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

THIS IS A FOURTH POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her FLUSTERED STANDING pose is attached. Same habit, same
veil, same censer, same line weight, same dithering density. Only the BODY and
the FACE change.

THE CHARACTER:
A young nun, composed and very quiet, who has entirely run out of composure.
HAIR: pale, cut short at the nape, a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular front and back, a broad cinched sash at the waist. A short veil PINNED BACK ON HER LEFT SIDE ONLY, so the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long.

WHAT CHANGES — SHE IS ON THE GROUND. SHE IS NOT STANDING.

READ THIS PARAGRAPH BEFORE ANYTHING ELSE. In the attached reference she is
standing on her feet. IN THIS DRAWING SHE IS NOT. She is NOT standing, NOT
half-standing, NOT merely bending her knees, NOT leaning on anything while
upright. HER HIPS ARE ON THE GROUND. If her head is anywhere in the upper half
of the picture, the drawing is wrong.

She has sunk all the way down to her knees and sat back on her heels. This is the
posture she takes to pray in, and that is exactly the problem: her body went to
the one place it knows and none of it helps.

SHE IS KNEELING, sitting back on her heels, knees together, back rounded
forward. The long habit has settled into a BELL AROUND HER, folding FORWARD over
her knees toward the viewer rather than spreading sideways.
- BOTH HANDS ARE PRESSED FLAT OVER HER OWN FACE, palms covering her eyes,
  fingertips at her hairline, elbows tucked hard against her ribs. The wide bell
  sleeves have fallen back down her forearms. THE SHORT CHAIN IS STILL WOUND
  TWICE AROUND HER RIGHT HAND.
- THE CENSER lies on the ground beside her right knee, its short chain slack.
  A thin ribbon of smoke still rises from it, STRAIGHT UP, close to her body.
  IT MUST NOT SWING OUT TO THE SIDE.
- HER FACE: mostly hidden behind her hands. What is visible — the brow, the ears,
  the jaw — is where the blush goes: FOUR SHORT DIAGONAL HATCH LINES on each
  visible cheek, MORE ON BOTH EARS AND DOWN THE NECK. Clean strokes, never a
  filled patch. Her eyebrows, where they show above her fingers, are UP AT THE
  INNER ENDS.
- THE VEIL IS STILL PINNED ON HER LEFT SIDE ONLY. A few more pale strands have
  escaped at the temples.
Everything else is identical to the reference. The habit, scapular, sash and veil
are drawn exactly as before: nothing is loosened, displaced, opened, or removed.

HEIGHT CHECK — THE SINGLE EASIEST WAY TO TELL THIS DRAWING IS RIGHT.
The crown of her head sits BELOW THE VERTICAL MIDDLE OF THE PICTURE. Standing,
her head was near the top; she has lost roughly half her height.
HER HEAD IS AT ABOUT 55% OF THE FRAME HEIGHT. The hem of the habit RESTS ON THE
SAME GROUND LINE her feet stood on in the reference.

⚠ SHE MUST NOT GET WIDER. She has the most room of the four, but the habit is the
thing most likely to spread — fold it FORWARD over her knees, not outward. Elbows
in, censer close, smoke rising straight. Stay inside the standing reference's
left and right limits.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal. The camera does not move.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera, no
  upskirt angle. She is overwhelmed, not undressed.

RESOLUTION: read at about 200 pixels tall.
```

---

## 언제 뜨나 — **숨겨진 반응**

이건 그림이 아니라 규칙이라 여기서 적어 둡니다 (`HeroManage` 의 `touch`).

**같은 자리를 1초 안에 열 번 두들기면** 나옵니다. 가슴이든 머리든 상관없지만
**한 자리로 열 번**이어야 합니다 — 가슴 다섯에 머리 다섯은 안 됩니다.

| | |
|---|---|
| 몇 번 | `RUN_NEED` = **10** |
| 사이 간격 | `RUN_GAP` = **1초**. 넘기면 하나부터 다시 |
| 서 있는 시간 | `HIDDEN_MS` = **5초** |

### 왜 열 번인가

**손이 미끄러져서 나올 수 있는 수가 아니어야** 합니다. 두세 번이면 특별한
반응을 보러 온 사람이 아니라 그냥 만지던 사람에게도 나오고, 그러면 숨겨 둔
값이 사라집니다.

1초 제한이 있어야 "열 번" 이 **연속으로 두들기는 일**이 됩니다. 없으면 하루
종일 열 번 누른 사람도 걸립니다.

### 5초 동안은 눌러도 안 먹힙니다

반응이 끝까지 돌아야 하기 때문입니다 — 눌러서 다음 말로 넘어가 버리면 열 번
두들겨 얻은 것이 반 초 만에 지나갑니다. 잠금 시간과 말풍선 시간이 **같은
값**을 씁니다: 갈리면 눌러도 아무 일이 없는 어정쩡한 틈이 생깁니다.

### 그동안 몸에서 김이 오릅니다

주저앉은 그림 한 장만으로는 멈춰 있습니다. 5초를 서 있어야 하는 자리에 안
움직이는 그림을 두면 셋째 초쯤부터 화면이 멎은 것으로 보입니다 — 뭔가 계속
돌고 있어야 "지금 이 상태다" 가 유지됩니다 (`HeroManage` 의 `Steam`).

통짜(몸 아무 데나)로는 안 열립니다. 좁은 과녁을 열 번 맞히는 것이 이 반응을
찾는 일의 전부인데, 통짜로 열리면 아무나 걸립니다.

## 넷 다 들어와 있습니다 ✅

`assets/2026-09-07/char-down-*.jpg` 로 받아서 잘랐습니다.

| | 크기 (네 벌이 다 같다) | 이 그림에서 |
|---|---|---|
| 이졸데 | 242x384 | **서 있습니다.** 아래 참고 |
| 비앙카 | 252x384 | 무릎을 안고 앉음 |
| 리안느 | 254x384 | 웅크림 |
| 아녜스 | 203x384 | 무릎 꿇고 얼굴을 가림 |

### 세 사람은 네모가 넓어졌습니다

앉으면서 옆으로 나간 만큼 **네 벌을 다 다시 오렸습니다** (비앙카 248→252,
리안느 226→254, 아녜스 175→203). 넓어진 만큼 눌리는 자리 표도 다시 계산했습니다
(`HeroManage` 의 `HEAD`·`CHEST`).

리안느가 제일 많이 늘었습니다 — 활을 바닥에 눕히면서 좌우로 크게 뻗었기
때문입니다. 254 는 상한(255)에 딱 붙는 값이라, **다음에 이 사람 그림을 새로
받을 때는 가로를 더 못 늘립니다.**

### 이졸데만 안 앉았습니다

두 번 고쳐 보냈는데도 서 있는 채로 왔습니다 (까닭은 위 "제일 흔한 실패" 에).
지금은 **서서 얼굴만 붉히는 그림**으로 들어가 있습니다. 반응 자체는 도니까
급하지는 않지만, 다시 뽑으실 생각이면 §1 을 그대로 쓰시면 됩니다 — 검을
눕히라는 못이 지금은 박혀 있습니다.
