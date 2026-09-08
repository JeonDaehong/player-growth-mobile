# 프롬프트 전부 — 위에서부터 복붙

**이 파일은 자동 생성됩니다** — `python tools/gen-all.py`.
원본을 고치려면 각 덩어리에 적힌 문서를 고치세요. 여기 것은 긁어 온 사본입니다.

아직 **안 들어온 것만** 있습니다. `assets/sprites/` 에 파일이 생기면 그
덩어리는 다음 실행에서 저절로 빠집니다.

## 쓰는 법

1. 아래 코드블록을 **통째로** 복사해서 Gemini 에 넣습니다. 스타일 지시와 시트
   규칙이 블록 안에 다 들어 있으니 앞뒤에 뭘 붙이지 마세요.
2. 받은 이미지를 `assets/new-image/` 에 넣습니다.
3. 그 덩어리의 **자르기** JSON 을 `tools/sprites.config.json` 에 한 줄
   더하고 `python tools/slice.py` 를 돌립니다.
4. 끝입니다. **코드는 안 고칩니다** — 화면이 폴더를 먼저 보고, 없을 때만
   지금의 임시 그림으로 떨어지게 해 뒀습니다.

## 지금 남은 것

1. **인연 대화 배경 한 장 — 세로 9:16** — 1칸 → `bg_talk`
2. **이야기 월페이퍼 — 네 사람 × 네 단계 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)

---
## 1. 인연 대화 배경 한 장 — 세로 9:16

| | |
|---|---|
| 칸 | 1 |
| 폴더 | `assets/sprites/bg_talk/` |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

```
┌─────────────────┐
│                 │  ← 위: 비어도 됨 (달·하늘)
│         ┌───────┤
│  여기만 │ 인물이 │  ← 오른쪽 절반: 사람이 선다. 비워 둘 것
│  보인다 │  선다  │
│         └───────┤
├─────────────────┤
│   대사창이 덮음   │  ← 아래 3분의 1: 무엇을 그려도 안 보인다
└─────────────────┘
```

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- No signature, no watermark, no letters, no numerals, no runes, no fake script.

SUBJECT: a single VERTICAL background plate for a visual-novel dialogue screen. Portrait orientation, 9:16 (for example 1080 x 1920). One image, not a sheet, no panels, no borders.

THE PLACE — a quiet stone terrace at night, at the edge of a keep:
- On the LEFT, a tall pointed ARCHWAY in a stone wall, empty and open, looking out into the dark. Its arch is drawn with two or three concentric lines only.
- Through and beyond the arch, a simple night sky with a large plain MOON, high and to the left, and three or four small stars. No clouds with detail — at most one long thin cloud band crossing the moon.
- Running across the LOWER-MIDDLE, a low stone PARAPET wall about waist height, drawn as two long horizontal lines with a few vertical joints. It reads as the edge of a balcony.
- Growing up the left wall, a sparse trail of IVY — a dozen simple leaf shapes on a thin stem, no more.
- Underfoot, a stone FLOOR suggested by three or four long lines converging slightly toward the centre. No tile grid, no cobbles.

COMPOSITION — this matters as much as the drawing:
- The RIGHT HALF of the image must stay almost EMPTY — flat dark wall or open night sky only. A character will stand there and must not overlap anything.
- The BOTTOM THIRD must stay simple and quiet: a dialogue box will cover it. Put nothing important below that line.
- All the visual interest belongs in the UPPER LEFT two thirds: the arch, the moon, the ivy.
- Leave a generous amount of empty black. This is a backdrop, not a scene.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Drawn as clean WHITE OUTLINES on solid pure black. Shapes are NOT filled in white — the black shows through them.
- Lines are sparse and far apart. Big simple forms only. Do NOT draw individual bricks, roof tiles, cobblestones, wood grain, or dense hatching — white text will be laid over this image and dense texture would swallow it.
- Chunky, clearly visible square pixels — every line a crisp hard-edged 1-2 pixel run.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No characters, no people, no animals, no furniture, no props. The place only.
```

### 자르기

```json
{
  "file": "bg-talk.jpg",
  "name": "bg_talk",
  "grid": [1, 1],
  "labels": ["night"],
  "size": 640,
  "allowFilled": true
}
```

---

## 2. 이야기 월페이퍼 — 네 사람 × 네 단계 (한 장씩 따로 뽑습니다)

| | |
|---|---|
| 자르기 | **없음** |
| 넣는 곳 | assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. 넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요. |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

**`assets/wallpaper/knightgirl_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION (this is the look we want):
- The CHARACTER is the subject and fills most of the frame. The background supports her and is drawn SOFTER, simpler and with less contrast than she has.
- Appealing modern anime face: large expressive eyes with bright highlights, small nose and mouth, soft cheeks, fine strands of hair.
- Clean confident inked linework with cel-style shading plus light screentone. Not a painted gallery piece.
- Warm and inviting. NO grand cinematic mood, NO thick volumetric god-rays, NO epic architecture dwarfing her, NO museum-painting solemnity.
- The emotion comes from her FACE, not from the lighting.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, everything covered.
- No cleavage, no underwear, no skin-tight emphasis, no suggestive posing.
- Camera at eye level. No low angles looking up.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair past her waist. A slim jewelled circlet with one small gem on her forehead. Silver plate armour with layered pauldrons and a fitted breastplate over a high-necked underlayer, a cape with an embroidered hem. Calm, polite, faintly tired features. Pretty and approachable, not stern.

SCENE — A FORMAL KNIGHT'S GREETING:
Knee-up, close enough that her face reads clearly. She stands in a stone hall, angled three-quarters toward the viewer, her right fist over her heart and her left hand resting on her sword's pommel, upper body bowed a few degrees in a correct, slightly stiff salute. Her eyes are lowered — she has not looked up yet — and her mouth is a small polite line. She is being proper because she does not yet know what else to be. The hall behind her is drawn lightly: a suggestion of arches and one window, soft and out of focus.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. One gentle light source from the window behind, soft falloff, a few floating motes. Background kept simple and low-contrast so she stands out.
```

**`assets/wallpaper/knightgirl_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the bathhouse behind her is soft and simple.
- Appealing modern anime face with large expressive eyes. Comedy manga energy — this panel should make the reader smile.
- Clean inked linework, cel shading, light screentone. Warm and endearing, never grand or dramatic.

CONTENT RULES (a classic manga bath gag — comedic, not sexual):
- Her BARE SHOULDERS, COLLARBONES and the tops of her arms ARE visible above the water. This is a normal bath scene and she should read as actually bathing, not as a floating head.
- The WATERLINE sits across her upper chest, just below the collarbones. Everything from there down is hidden by opaque white water and steam — draw the water surface as solid white with no transparency.
- Do NOT draw a cleavage line, breasts, nipples, or any chest contour. Do NOT angle the camera down into the tub. Do NOT render glistening wet skin as a feature.
- Camera at eye level, framed from just below her shoulders upward. Wholesome and funny, all-ages.

EXPRESSION — THIS IS THE MOST IMPORTANT PART:
She is FLUSTERED AND EMBARRASSED, not angry. Do NOT draw a furious face, do NOT draw gritted teeth, sharp glaring eyes, an angry V-shaped brow, or a scowl. She is a composed, dutiful, slightly stiff knight who has never been caught off guard before, and she has no idea what to do.
- Eyebrows raised and pulled together in helpless dismay, not lowered in anger.
- Eyes wide and round and watery, pupils small, looking at the intruder in pure panic.
- Mouth small and open in a wobbly, startled sound — she is stammering, not shouting.
- Face and ears deeply flushed; one or two manga blush lines across the nose.
- Read her as "가, 가지 마세요 — 아니, 나가 주세요!" — mortified, apologetic, overwhelmed. Cute and sympathetic, never scary.

CHARACTER — ISOLDE, a young knight (off duty):
Very long pale hair, here loose and damp, pinned up messily. No armour, no circlet.

SCENE — THE DOOR OPENED BY MISTAKE:
Framed from just below her shoulders upward. She is in a round wooden bath tub in a small bathhouse, sitting up with her shoulders and collarbones above the waterline, steam everywhere. The door at the frame's edge has just swung open and light spills in. One arm is up in a hasty, uncoordinated throw — a bar of soap tumbles toward the viewer with a few droplets, and a wooden bucket wobbles through the air beside it. The throw is a reflex of panic, weak and badly aimed, not an attack. Her other forearm is drawn up flat across her upper chest in a hasty attempt to cover herself — the arm reads as the cover, so nothing needs to be shown.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. A couple of small motion arcs behind the soap, one sweat drop, heavy blush hatching. Backlight through the open door, white steam. Wooden interior kept simple.
```

**`assets/wallpaper/knightgirl_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the background is drawn LIGHTLY and softly, with much less contrast than she has.
- Appealing modern anime face, slightly rounded and cute proportions. Comedy manga energy — this panel should make the reader grin.
- Clean inked linework, cel shading, light screentone.
- Bright, sunny, playful. NO cinematic mood, NO god-rays, NO epic architecture, NO solemnity of any kind.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed and fully armoured, collar closed.
- No cleavage, no skin-tight emphasis, no suggestive posing, no low angles.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair, a slim jewelled circlet, silver plate armour with layered pauldrons over a high-necked underlayer, a cape with an embroidered hem. Her armour is CLEAN and INTACT here — at most one small scuff on a pauldron. Pretty and approachable, not stern.

POSE AND EXPRESSION — THIS IS THE WHOLE PICTURE:
She is DOING A LITTLE "AHEM!" — puffed up with pride and openly showing off, and it is adorable rather than arrogant.
- Standing straight and tall, chest puffed out, chin lifted high, back arched slightly backward. She is making herself as big as possible.
- BOTH FISTS PLANTED ON HER HIPS, elbows out wide. Classic proud pose.
- EYES CLOSED in a smug, self-satisfied curve (^ ^ shapes), eyebrows raised high, a big pleased grin with the corners pulled up.
- A light blush across the cheeks — she knows she is bragging and is enjoying it.
- Her cape flares out behind her as if she flicked it on purpose.
- Read her as "엣헴—! 어때요, 제가 해냈다니까요?" — boastful, cute, completely harmless. Do NOT make her look modest, tearful, shy, or solemn.

SCENE — SHOWING OFF, IN BROAD DAYLIGHT:
Knee-up, seen straight on from a little distance so her whole proud stance reads — NOT a tight face close-up. She stands in the middle of the frame in bright midday light. Her sword is sheathed at her hip, untouched. Behind her, a simple sunny courtyard: a low wall and one tree, drawn softly and lightly. A few small manga sparkle marks pop around her head and shoulders.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Bright even daylight, minimal shadows, a couple of small speed lines under the cape flare, sparkle marks. Background low-contrast and simple.
```

**`assets/wallpaper/knightgirl_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- Close character portrait. Her face is the whole picture; the sunset field behind her is soft, blurred and low-contrast.
- Appealing modern anime face: large expressive eyes with bright highlights, soft cheeks, fine hair strands.
- Clean inked linework, cel shading, light screentone. Warm, sweet, charming.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. The battle damage is to her ARMOUR AND CLOAK, not to her modesty — the underlayer stays intact and closed at the throat.
- No cleavage, no exposed chest, no torn clothing revealing skin below the collarbone, no suggestive posing, no low angles.

CHARACTER — ISOLDE, a young knight, straight out of a hard fight:
Very long pale hair, now loose and dishevelled with strands stuck to her cheek; the circlet is knocked slightly crooked. Her armour has taken a beating — one pauldron is gone entirely, the breastplate is dented and scored with deep scratches, a buckle hangs loose. The cape is badly torn: the hem is ripped into long ragged tatters and a wide tear runs up one side, so it hangs in strips. Her sleeve is shredded at the forearm and the wrapping underneath has come loose and trails. Soot and dust on the armour, a smear of dirt across one cheek, a small bandage on her temple. Everything is ruined EXCEPT that the high-necked underlayer beneath the breastplate is whole and closed.

SCENE — AFTER THE MISSION, AT SUNSET:
Chest-up, close, facing the viewer. She has just come back and is smiling — a real, uncontrolled smile she is clearly not used to making. She looks straight at the viewer, but her eyes flick very slightly aside and her cheeks are flushed: happiness and embarrassment at once. One hand is raised just into the bottom of the frame, palm open, as if she had reached out and then thought better of it. Torn cloak strips and dust drift in the wind around her. A low sun and a soft field behind her, drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft rim light from behind catching the edges of her hair and the ragged cloth, gentle bloom, blush hatching on the cheeks, background softly blurred.
```

**`assets/wallpaper/bunnyaxe_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the tavern behind her is drawn simply and with less contrast.
- Appealing modern anime face with large expressive eyes. Lively comedy manga energy.
- Clean inked linework, cel shading, light screentone. Fun and warm, not cinematic or grim.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed in a modest tavern uniform.
- No cleavage, no short-skirt or thigh emphasis, no suggestive posing.
- Camera stays on her FACE and the fallen customer, never on her body.

CHARACTER — BIANCA, a tavern server who fights:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. A laced bodice over a long-sleeved blouse, a full apron, a kerchief tied over her hair, knee-high boots, one battered steel pauldron on her right shoulder. She carries an enormous single-bladed woodcutter's axe as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Knee-up, close. One boot planted on a toppled bench, she leans in and jabs a finger down at a big drunk man who has fallen backward at the bottom of the frame — seen from behind, hands raised, drawn small and simple. Her other hand rests the axe over her shoulder. Mouth open mid-scold, one eyebrow up, eyes bright: she is telling him off and enjoying it. A tankard and a couple of cards tumble through the air. The tavern behind is a soft suggestion of tables and lamps.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone, a few bold manga action lines. Warm lamplight, simple background, high contrast kept on HER.
```

**`assets/wallpaper/bunnyaxe_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER and the glass fill the frame; the bar behind her is simple and low-contrast.
- Appealing modern anime face with large expressive eyes and a big open grin.
- Clean inked linework, cel shading, light screentone. Cheerful and inviting.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, collar closed.
- She leans on the bar but it is NOT a chest-forward pose — her weight is on her elbows, camera at eye level, framed on her face and the glass.
- No cleavage, no suggestive posing, no low angles.

CHARACTER — BIANCA:
Short tousled bob, freckles, laced bodice over a long-sleeved blouse, apron, kerchief, one battered pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Waist-up, both elbows on a wooden bar, pushing a tall glass toward the viewer — the glass is large in frame, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge, eyebrows raised in expectation, clearly saying "drink it". Her free hand gives a thumbs-up. A few bottles behind her, drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Warm lamplight, gentle foreshortening on the glass, a few white highlights on the ice, background kept simple.
```

**`assets/wallpaper/bunnyaxe_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- Close character portrait. Her face is the whole picture; the doorway and rainy yard behind are soft and simple.
- Appealing modern anime face: large watery eyes with bright highlights, soft cheeks.
- Clean inked linework, cel shading, light screentone. Tender and warm — quiet, not dramatic.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, collar closed, apron on.
- No cleavage, no suggestive posing, no low angles, no wet-clothing rendering.

CHARACTER — BIANCA:
Short tousled bob — here messy, her kerchief slipped off — freckles, laced bodice over a long-sleeved blouse, a dirty apron, one battered pauldron. Her axe lies on the ground beside her.

SCENE — THANK YOU FOR STAYING:
Chest-up, close, sitting on the back steps of the tavern at night. She has clearly been crying — eyes and nose red, lashes wet and clumped, a tear track on one cheek — but she has just looked up at the viewer and is smiling through it: a crumpled, grateful, slightly embarrassed smile. One hand wipes her eye with the back of her wrist; the other is half-raised toward the viewer. Warm light from the doorway behind her; the yard beyond is dark and simple.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, fine screentone. Soft key light from behind, bright white specular dots in her wet eyes, a few fine rain streaks, background softly blurred.
```

**`assets/wallpaper/bunnyaxe_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the corridor is simple and low-contrast.
- Appealing modern anime face with large expressive eyes; heavy blush drawn with manga blush lines.
- Clean inked linework, cel shading, light screentone. Sweet and charming, gently funny.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, neatly dressed, collar closed.
- No cleavage, no suggestive posing, no low angles, no body emphasis.

CHARACTER — BIANCA:
Short tousled bob, freckles — but tonight the apron is off, the bodice is neatly laced over a clean blouse, her hair is brushed and she wears a small ribbon. No axe anywhere.

SCENE — OUTSIDE THE DOOR, ABOUT TO CONFESS:
Knee-up, standing in a lamp-lit corridor, her back lightly against the wall beside a closed wooden door. She looks at the door, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, eyes squeezed half-shut, mouth caught between a nervous grimace and an enormous helpless smile — she has been standing here a while. One boot is up on its toe.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Heavy blush hatching plus two small blush lines, one sweat drop. A single warm lamp, soft falloff, corridor drawn simply.
```

**`assets/wallpaper/elfarcher_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the forest is a soft, simple backdrop with much less contrast than she has.
- Appealing modern anime face with large expressive eyes and long pointed ears.
- Clean inked linework, cel shading, light screentone. Cool and pretty, not epic — NO grand god-ray forest cathedral.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed; her tunic reaches mid-thigh and she wears leggings and tall boots.
- The camera is slightly below her because she is in a tree, but it frames her FACE and the branch — never up her clothing. No thigh focus, no suggestive posing.

CHARACTER — RIANNE, an elf archer:
A slender elf with long pointed ears and very long pale hair in a high ponytail tied with a feather. A short-sleeved hooded jerkin over a fitted tunic, a wide belt, leather bracers, a quiver at her hip, a torn ragged-hemmed cloak, leggings and tall lace-up boots. A longbow taller than she is. Cool, distant expression.

SCENE — LOOKING DOWN FROM THE BRANCH:
Waist-up to knee-up, close. She is perched on a thick branch, one knee drawn up, her bow across her lap and an arrow held loosely between two fingers. She looks straight down at the viewer, chin lowered, eyes half-lidded and evaluating — not hostile, not welcoming. Her ponytail and torn cloak hang past the branch. A few leaves drift through the frame. The forest behind is soft and simple.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Gentle light through leaves, a few floating motes, background kept low-contrast.
```

**`assets/wallpaper/elfarcher_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the forest path is soft and simple.
- Appealing modern anime face with large expressive eyes and long pointed ears; the reddened ear tips are the charm of this picture.
- Clean inked linework, cel shading, light screentone. Warm and a little bashful.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, leggings and tall boots.
- No cleavage, no thigh focus, no suggestive posing, no low angles.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair in a high ponytail with a feather, hooded jerkin over a fitted tunic, bracers, quiver, torn cloak, leggings, tall boots. Her longbow is slung across her back, freeing both hands.

SCENE — THE OFFERED HAND:
Waist-up, close, turned three-quarters toward the viewer. She has extended one hand toward the viewer, palm up, fingers slightly curled — and immediately regretted it: the arm is not fully straight, her shoulders are drawn in, and she has turned her face away and down, looking off to the side with her ear tips visibly red and her lips pressed thin. Her other hand grips her own elbow. The hand nearest the viewer is drawn largest and sharpest.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Dappled light, soft rim light along her arm and hair, blush hatching on the ear tips, background softly blurred.
```

**`assets/wallpaper/elfarcher_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER and the fish fill the frame; the dungeon wall behind is simple and dark.
- Appealing modern anime face with huge round eyes locked on the food. Comedy manga energy — this should be funny and cute.
- Clean inked linework, cel shading, light screentone. NOT grim or atmospheric — the dungeon is just a room here.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully clothed, cloak wrapped around her shoulders.
- No cleavage, no thigh focus, no suggestive posing, no low angles.

CHARACTER — RIANNE:
Long pointed ears, long pale hair in a high ponytail with a feather, hooded jerkin, bracers, leggings, tall boots. Her torn cloak is pulled around her shoulders like a blanket; her bow leans against the wall.

SCENE — GRILLING A FISH IN THE DUNGEON:
Waist-up, crouched on her heels beside a small campfire. She holds a stick over the flames with a whole fish skewered on it, leaning so far forward that her face is almost in the fire. Her eyes are huge and locked on the fish, her mouth open, very obviously about to drool; one hand hovers as if to grab it early. All her usual composure is gone. Firelight from below; the wall behind is drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Comedic manga marks — a small sweat drop, sparkle highlights on the fish. Warm firelight from below, background dark and simple.
```

**`assets/wallpaper/elfarcher_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the clearing behind is soft, bright and simple.
- Appealing modern anime face with large expressive eyes and long pointed ears; red ear tips and a shy smile are the charm of this picture.
- Clean inked linework, cel shading, light screentone. Sweet, warm, gently romantic.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, tunic to mid-thigh, leggings and tall boots.
- Hands behind the back is a SHY fidget, NOT a chest-forward pose — shoulders rounded and slightly hunched, weight shifted, head tucked down.
- No cleavage, no chest emphasis, no thigh focus, no low angles.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin, bracers, leggings, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, FIDGETING:
Waist-up to knee-up, close, facing the viewer in a sunlit clearing. Both hands are clasped behind her back and she is rocking slightly on her heels; one boot is turned inward on its toe. Her shoulders are drawn up and in, her chin is tucked down, and she looks at the viewer through her lashes with her ears bright red and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. A few petals drift past.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft backlight through leaves haloing her hair, gentle bloom, blush hatching on the ears and cheeks, background softly blurred.
```

**`assets/wallpaper/nun_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame. The ruin behind her is drawn LIGHTLY — a few broken arches, low contrast, softly out of focus.
- Appealing modern anime face with large expressive eyes and long lashes; her face must read clearly even with her head bowed.
- Clean inked linework, cel shading, light screentone.
- Quiet, NOT grand. NO cathedral-scale architecture dwarfing her, NO heavy god-rays, NO religious-painting solemnity. She is a girl praying, not an altarpiece.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.

CHARACTER — AGNES, a young nun:
Shoulder-length pale hair framing her face under a white headband and a black veil with a small leaf ornament at the temple. A high-collared black habit with wide bell sleeves, a long pale stole down the front, a sash at the waist, a long plain skirt. She carries a censer on a fine chain. Gentle features.

SCENE — PRAYING IN THE RUIN:
Waist-up, close, kneeling. Her hands are clasped at her chest, her head bowed a little, eyes closed with long lashes drawn clearly. The censer rests beside her with a thin line of smoke. A few loose strands of hair have escaped the veil. Ash and paper fragments drift slowly past. The broken chapel is only suggested behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft even light from above, a few drifting particles, background simple and low-contrast.
```

**`assets/wallpaper/nun_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER and the pie fill the frame; the refectory behind is simple.
- Appealing modern anime face, eyes closed in bliss, cheeks full. Comedy manga energy — deadpan and funny.
- Clean inked linework, cel shading, light screentone. Warm and silly.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar, long sleeves.
- No cleavage, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, a high-collared black habit with wide bell sleeves, a pale stole, a sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a wooden table, seen from across it. In front of her sits a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side. She has a large forkful raised to her mouth and her eyes are closed in genuine, blissful delight; one cheek is already full and she is smiling around it. Her free hand is pressed to her cheek in appreciation.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Small comedic manga marks — sparkles around her face, a single sweat drop over the fish head. Warm side light, steam rising, background simple.
```

**`assets/wallpaper/nun_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the headstones behind are a soft, simple suggestion.
- Appealing modern anime face with large expressive eyes; the bitterness behind her smile is the whole picture.
- Clean inked linework, cel shading, light screentone.
- Quiet and a little sad, NOT epic. NO dramatic storm-lit landscape, NO towering scenery.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash, a censer on a chain hanging from one hand.

SCENE — IN THE GRAVEYARD, LOOKING UP:
Chest-up, close, her body turned away but her face tilted up toward a break in the clouds. She is smiling — a small, tired, bitter smile with no happiness in it — and her eyes are open and dry. A strand of hair moves across her cheek. The censer hangs still at her side. A couple of leaning headstones and bare branches, drawn simply behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft light from above and behind catching her cheek and veil, background low-contrast and simple.
```

**`assets/wallpaper/nun_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- Close character portrait. Her smile is the whole picture; the chapel behind is soft and blurred.
- Appealing modern anime face: large eyes crinkled shut with happiness, soft cheeks, bright highlights.
- Clean inked linework, cel shading, light screentone. Warm, bright, charming.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar closed.
- No cleavage, no undressing, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament — here the veil is pushed slightly back and more of her hair shows — high-collared black habit with wide bell sleeves, pale stole, sash.

SCENE — THANK YOU:
Chest-up, close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She looks directly at the viewer and is clearly saying thank you. Soft light from a high window to the left; a few motes drift through it.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, fine screentone. Soft key light, a bright halo of blown-out light behind her head, delicate blush hatching, bright highlights in the eyes, background softly blurred.
```
