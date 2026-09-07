# 캐릭터 전신 — 주저앉아 완전히 부끄러워하는 그림

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

[CHAR_SHY_PROMPTS.md](CHAR_SHY_PROMPTS.md) 의 **한 단계 더**입니다. 같은 사람,
같은 옷, 같은 틀 — **서 있던 사람이 주저앉습니다.**

| | |
|---|---|
| 어디에 쓰나 | 영웅 관리에서 **이미 부끄러운 상태에서 한 번 더** 눌렀을 때 |
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

## 넷이 **다르게 주저앉습니다**

| | 어떻게 무너지나 |
|---|---|
| 이졸데 | 무릎이 꺾인다. **검은 안 놓는다** — 그걸 짚고 버티려다 실패한 자세다 |
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

THIS IS A FOURTH POSE OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her FLUSTERED STANDING pose is attached. Same costume, same
armour, same greatsword, same hair, same circlet, same line weight, same
dithering density. Only the BODY and the FACE change.

THE CHARACTER:
A young woman knight, calm and unhurried, though not right now.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel.

WHAT CHANGES — HER KNEES HAVE GIVEN OUT.
She tried to stay upright, put her weight on the sword, and went down anyway.

SHE IS SITTING ON THE GROUND, SIDE-SADDLE: both legs folded to her LEFT, one
knee crossed over the other, her weight on her left hip. Her skirt has fallen
into a pool AROUND HER AND IN FRONT OF HER — FORWARD, NOT OUTWARD.
- THE GREATSWORD IS STILL PLANTED POINT-DOWN, upright, exactly where it was in
  the reference. HER RIGHT HAND IS STILL ON THE POMMEL — she has slid down the
  length of it without letting go. That one unbroken vertical line is what makes
  this read as "she failed to stay up" rather than "she sat down".
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

HER HEAD IS NOW AT ABOUT 55% OF THE FRAME HEIGHT — she has dropped roughly half
her standing height. The BOTTOM of her — skirt, hip, folded legs — RESTS ON THE
SAME GROUND LINE HER FEET STOOD ON in the reference. Nothing floats.

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

WHAT CHANGES — SHE HAS LANDED ON THE FLOOR.
She is the one who usually laughs first, and she has just run out of ways to.

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

HER HEAD IS NOW AT ABOUT 55% OF THE FRAME HEIGHT. Her hips and the soles of her
boots REST ON THE SAME GROUND LINE her feet stood on in the reference.

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

WHAT CHANGES — SHE HAS CROUCHED DOWN AND MADE HERSELF SMALL.
She does not fall and she does not make a sound. She just folds up, which for her
is the loudest thing she has ever done.

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

HER HEAD IS NOW AT ABOUT 58% OF THE FRAME HEIGHT — she goes lower than the
others because she folds rather than sits. Her heels and hips REST ON THE SAME
GROUND LINE her feet stood on in the reference.

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

WHAT CHANGES — SHE HAS SUNK TO HER KNEES.
This is the posture she takes to pray in, and that is exactly the problem: her
body went to the one place it knows and none of it helps.

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

HER HEAD IS NOW AT ABOUT 55% OF THE FRAME HEIGHT. The hem of the habit RESTS ON
THE SAME GROUND LINE her feet stood on in the reference.

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

## 언제 뜨게 할까 — **한 번 더 눌렀을 때**

이건 그림이 아니라 규칙이라 여기서 정합니다.

**이미 부끄러운 상태에서 가슴을 한 번 더 누르면** 주저앉습니다. 두 번째
누름이라야 하는 까닭:

- 첫 누름에 바로 주저앉으면 서 있는 `char_shy` 를 아무도 못 봅니다. 넉 장을
  그려 놓고 한 장을 못 보는 셈입니다
- 그리고 **주저앉는 것은 끝**이어야 합니다. 세 번째 누름에는 아무 일도 안
  일어납니다 — 계속 누르면 계속 뭔가 나오는 구조가 되면, 그건 성격이 아니라
  보상표가 됩니다 (`core/lines` 머리말에 적어 둔 것과 같은 이유)

머리 쓰다듬기에는 안 붙입니다. 저쪽은 애정이라 주저앉을 일이 아닙니다.

## 받은 다음

1. `assets/<날짜>/char-down-<id>.jpg`
2. `tools/sprites.config.json` 에 **이미 넣어 뒀습니다** — 앞 셋과 같은
   `region` 을 쓰도록 적어 놨으니 파일만 놓으면 됩니다
3. `python3 tools/slice.py char_down`
4. 네 그림의 크기가 앞 셋과 **픽셀까지 같은지** 확인합니다
   (243 · 248 · 226 · 175 × 384). 다르면 옆으로 넘친 것이고, 그때는 넷을
   통째로 다시 오리고 눌리는 자리 표까지 다시 잽니다

## 그림이 없으면 어떻게 되나

**부끄러운 그림으로 떨어집니다.** 대사만 갈리고 얼굴은 그대로입니다 —
눌렀는데 빈자리가 뜨는 것보다 낫습니다.
