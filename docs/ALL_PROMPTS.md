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
2. **이야기 월페이퍼 · 비앙카 넉 장 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)
3. **이야기 월페이퍼 · 리안느 넉 장 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)
4. **이야기 월페이퍼 · 아녜스 넉 장 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)

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

## 2. 이야기 월페이퍼 · 비앙카 넉 장 (한 장씩 따로 뽑습니다)

| | |
|---|---|
| 자르기 | **없음** |
| 넣는 곳 | assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. 넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요. |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

**`assets/wallpaper/bunnyaxe_awkward.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the tavern behind her is drawn simply and with less contrast.
- Appealing modern anime face with large expressive eyes. Lively comedy manga energy.
- Clean inked linework, cel shading, light screentone. Fun and warm, not cinematic or grim.

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume she wears for work. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO cleavage line drawn as a feature, NO butt or thigh focus, NO low camera angles, NO leaning-forward chest poses.
- Camera at eye level. Wholesome and funny, all-ages. The picture is about her face and the situation.

CHARACTER — BIANCA, a tavern girl who fights:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. She wears a BUNNY-SUIT stage costume: a bunny-ear headband, a black strapless leotard with a small bowtie at the collar, a fluffy round tail, sheer black legwear with one garter strap on the thigh, and tall lace-up heeled boots. Over her right shoulder, strapped on top of the costume, one battered steel PAULDRON — the only piece of armour she owns. She carries an enormous single-bladed woodcutter's axe as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure, seen a little from the side. One boot is planted on a toppled bench and she leans out to jab a finger down at a big drunk man who has fallen backward at the bottom of the frame — seen from behind, hands raised, drawn small and simple. Her other hand rests the axe over her shoulder. She is looking DOWN AT HIM, not at the viewer. Mouth open mid-scold, one eyebrow up, eyes bright: she is telling him off and enjoying it. A tankard and a couple of cards tumble through the air. The tavern behind is a soft suggestion of tables and lamps.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone, a few bold manga action lines. Warm lamplight, simple background, high contrast kept on HER.
```

**`assets/wallpaper/bunnyaxe_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER'S FACE and the glass fill the frame; the bar behind her is simple and low-contrast.
- Appealing modern anime face with large expressive eyes and a big open grin. She is looking RIGHT AT THE VIEWER.
- Clean inked linework, cel shading, light screentone. Cheerful and inviting.

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO cleavage line drawn as a feature, NO butt or thigh focus, NO low camera angles.
- She leans on the bar but it is NOT a chest-forward pose — her weight is on her ELBOWS, the camera is at eye level, and the framing is tight on her face and the glass.

CHARACTER — BIANCA:
Short tousled bob, freckles. BUNNY-SUIT costume: bunny-ear headband, black strapless leotard with a small bowtie at the collar, fluffy round tail, sheer black legwear, tall lace-up heeled boots. One battered steel pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Chest-up, close, both elbows on a wooden bar, pushing a tall glass toward the viewer — the glass is large in the foreground, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge, eyebrows raised in expectation, eyes locked on the viewer, clearly saying "drink it". Her free hand gives a thumbs-up. A few bottles behind her, drawn simply.

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

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume. Draw it accurately but do NOT sexualize it.
- This is a tight FACE shot; almost none of the costume is in frame anyway. NO chest emphasis, NO low angles, NO wet-clothing rendering.

CHARACTER — BIANCA:
Short tousled bob — here messy, the bunny-ear headband knocked crooked — freckles. She has a rough blanket or a coat pulled around her shoulders over the costume, so mostly her face, the crooked ears and the blanket show. Her axe lies on the ground beside her.

SCENE — THANK YOU FOR STAYING:
Chest-up, very close, sitting on the back steps of the tavern at night. She has clearly been crying — eyes and nose red, lashes wet and clumped, a tear track on one cheek — but she has just looked up at the viewer and is smiling through it: a crumpled, grateful, slightly embarrassed smile. One hand wipes her eye with the back of her wrist; the other is half-raised toward the viewer. Warm light from the doorway behind her; the yard beyond is dark and simple.

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

CONTENT RULES (strict — her outfit is a costume, not the subject):
- Her bunny-suit is a stage costume. Draw it accurately but do NOT sexualize it.
- NO chest emphasis, NO butt or thigh focus, NO low camera angles, NO suggestive posing.
- She is turned toward the DOOR, not toward the viewer — the camera catches her from the side.

CHARACTER — BIANCA:
Short tousled bob, freckles. BUNNY-SUIT costume — but tonight it is neat and pressed, the bowtie straightened, her hair brushed, a small ribbon tied to one bunny ear. Sheer black legwear and tall lace-up heeled boots. No pauldron, no axe anywhere: she left the armour behind on purpose.

SCENE — OUTSIDE THE DOOR, ABOUT TO CONFESS:
Full figure seen from the side, standing in a narrow lamp-lit corridor with her back lightly against the wall beside a closed wooden door. She stares at the DOOR, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, eyes squeezed half-shut, mouth caught between a nervous grimace and an enormous helpless smile — she has been standing here a while. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Heavy blush hatching plus two small blush lines, one sweat drop. A single warm lamp, soft falloff, corridor drawn simply.
```

---

## 3. 이야기 월페이퍼 · 리안느 넉 장 (한 장씩 따로 뽑습니다)

| | |
|---|---|
| 자르기 | **없음** |
| 넣는 곳 | assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. 넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요. |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

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

SCENE — THE OFFERED HAND (the HAND is the subject of this picture):
Chest-up, very close, turned mostly AWAY from the viewer. Her open HAND is thrust into the foreground, palm up, fingers slightly curled — it is the biggest, nearest and sharpest thing in the frame, filling the lower third. She has extended it and immediately regretted it: the arm is not fully straight and her shoulders are drawn in. Her FACE is turned away and down over her shoulder, so she is NOT making eye contact with the viewer — we see her in profile, lips pressed thin, one ear tip bright red. Her other hand grips her own elbow. Daylight on a mossy path.

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

SCENE — HANDS BEHIND HER BACK, FIDGETING (her WHOLE BODY is the subject):
Full figure, seen from a little distance so the whole fidgeting stance reads — NOT a face close-up. She faces the viewer squarely in a sunlit clearing and MAKES EYE CONTACT. Both hands are clasped behind her back and she is rocking slightly on her heels; one boot is turned inward on its toe. Her shoulders are drawn up and in, her chin is tucked down, and she looks at the viewer through her lashes with her ears bright red and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. A few petals drift past.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft backlight through leaves haloing her hair, gentle bloom, blush hatching on the ears and cheeks, background softly blurred.
```

---

## 4. 이야기 월페이퍼 · 아녜스 넉 장 (한 장씩 따로 뽑습니다)

| | |
|---|---|
| 자르기 | **없음** |
| 넣는 곳 | assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. 넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요. |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

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
Full figure, seen from the side at a little distance, kneeling. Her hands are clasped at her chest, her head bowed deeply, eyes closed with long lashes drawn clearly. We see her in profile — she is not aware of the viewer at all. The censer rests beside her with a thin line of smoke. A few loose strands of hair have escaped the veil. Ash and paper fragments drift slowly past. The broken chapel is only suggested behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft even light from above, a few drifting particles, background simple and low-contrast.
```

**`assets/wallpaper/nun_friend.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER and the pie fill the frame; the refectory behind is simple.
- Appealing modern anime face with big round EYES OPEN and sparkling, looking straight at the viewer, cheeks full. Comedy manga energy — deadpan and funny.
- Clean inked linework, cel shading, light screentone. Warm and silly.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar, long sleeves.
- No cleavage, no suggestive posing, no low angles.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, a high-collared black habit with wide bell sleeves, a pale stole, a sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a wooden table, seen from across it. In front of her sits a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side — drawn large in the foreground. She has a large forkful raised and is looking STRAIGHT AT THE VIEWER with wide, bright, sparkling eyes, eyebrows up, clearly saying "이거 진짜 맛있어요, 드셔 보세요". One cheek is already full and she is smiling around it. Her free hand pushes a second plate toward the viewer. She has no idea anything is wrong.

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
