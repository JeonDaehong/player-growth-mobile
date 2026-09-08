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

1. **이야기 월페이퍼 · 비앙카 넉 장 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)
2. **이야기 월페이퍼 · 리안느 넉 장 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)
3. **이야기 월페이퍼 · 아녜스 넉 장 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)

---
## 1. 이야기 월페이퍼 · 비앙카 넉 장 (한 장씩 따로 뽑습니다)

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
- Wholesome all-ages slice-of-life comedy, like a page from a shounen tavern manga.

CHARACTER — BIANCA, a tavern waitress who also fights:
A cheerful young adult woman in her twenties with a short tousled bob and freckles. She works the floor in the tavern's performer uniform: a bunny-ear headband, a neat fitted black waistcoat-style outfit with a small bowtie at the collar, opaque dark tights, and tall lace-up heeled boots. Strapped over her right shoulder on top of it, one battered steel PAULDRON — the only piece of armour she owns. She carries an enormous single-bladed woodcutter's axe as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure, seen a little from the side, camera at eye level. One boot is planted on a toppled bench and she leans out to jab a finger down at a big drunk man who has fallen backward at the bottom of the frame — seen from behind, hands raised, drawn small and simple. Her other hand rests the axe over her shoulder. She is looking DOWN AT HIM, not at the viewer. Mouth open mid-scold, one eyebrow up, eyes bright: she is telling him off and enjoying it. A tankard and a couple of cards tumble through the air. The tavern behind is a soft suggestion of tables and lamps.

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
- Wholesome all-ages slice-of-life comedy.

CHARACTER — BIANCA, a tavern waitress:
A cheerful young adult woman in her twenties, short tousled bob, freckles. FRAMED FROM THE COLLARBONE UP, so all we see of her uniform is the bunny-ear headband, the small bowtie at her collar, and one battered steel pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
A tight head-and-shoulders shot, camera at eye level. She has both elbows on a wooden bar and is pushing a tall glass toward the viewer — the glass is large in the foreground, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge, eyebrows raised in expectation, eyes locked on the viewer, clearly saying "drink it". Her free hand gives a thumbs-up. A few bottles behind her, drawn simply.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Warm lamplight, gentle foreshortening on the glass, a few white highlights on the ice, background kept simple.
```

**`assets/wallpaper/bunnyaxe_trust.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- The CHARACTER fills most of the frame; the corridor is simple and low-contrast.
- Appealing modern anime face with large expressive eyes; heavy blush drawn with manga blush lines.
- Clean inked linework, cel shading, light screentone. Sweet and charming, gently funny.
- Wholesome all-ages slice-of-life comedy.

CHARACTER — BIANCA, a tavern waitress:
A cheerful young adult woman in her twenties, short tousled bob, freckles. She is off shift and has pulled a long coat on over her uniform, buttoned up, so only the bunny-ear headband and her boots show what she does for a living. Tonight her hair is brushed and a small ribbon is tied to one bunny ear. No pauldron, no axe anywhere: she left the armour behind on purpose.

SCENE — OUTSIDE THE DOOR, ABOUT TO KNOCK:
Full figure seen from the side, camera at eye level, standing in a narrow lamp-lit corridor with her back lightly against the wall beside a closed wooden door. She stares at the DOOR, not at the viewer, and never makes eye contact. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, eyes squeezed half-shut, mouth caught between a nervous grimace and an enormous helpless smile — she has been standing here a while and cannot make herself knock. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Heavy blush hatching plus two small blush lines, one sweat drop. A single warm lamp, soft falloff, corridor drawn simply.
```

**`assets/wallpaper/bunnyaxe_love.jpg`**

```
A Japanese light-novel INTERIOR ILLUSTRATION in black and white (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

ART DIRECTION:
- A tight portrait. Her FACE and her FIDGETING HANDS are the whole picture; the room behind her is soft, warm and low-contrast.
- Appealing modern anime face: large expressive eyes with bright highlights, soft round cheeks, heavy manga blush.
- Clean inked linework, cel shading, light screentone. Sweet, warm, a little bashful — the reader should want to smile back.
- Wholesome all-ages slice-of-life. This is a shy, sincere moment between friends.

FRAMING (fixed):
- UPPER BODY SHOT, from the middle of her chest upward — head, shoulders, both arms and her fidgeting hands are all in frame. This is NOT a full-body shot and NOT a tight face close-up.
- She LEANS IN toward the viewer so that she fills the frame edge to edge and the background falls away behind her. Camera at eye level, straight on.

CHARACTER — BIANCA, a tavern waitress:
A cheerful young adult woman in her twenties, short tousled bob, freckles. She wears the tavern's performer uniform: a bunny-ear headband and a neat fitted black waistcoat-style outfit buttoned up the front with a small bowtie at the collar — properly covered, tidy, workaday. The bunny ears are drooping slightly, which makes her look even more bashful.

POSE AND EXPRESSION — THIS IS THE WHOLE PICTURE:
She is EMBARRASSED AND QUIETLY HAPPY at the same time, and cannot keep still.
- Both hands are raised in front of her chest, FINGERS FIDGETING — index fingers pressed together and poking at each other, knuckles a little tense. Draw the hands clearly and fairly large; the fidget is half the picture.
- Shoulders drawn up and in, head tilted down a little, so she is looking UP at the viewer through her lashes — she IS making eye contact, shyly.
- Cheeks deeply flushed with manga blush lines across the nose; a tiny sweat drop at the temple.
- Mouth pulled into a small closed-lip smile that keeps escaping into a wider one — she is trying to hold it in and failing.
- Read her as "…뭐, 뭘 봐. 그런 거 아니거든." — flustered, pleased, completely transparent about it. She is normally loud and confident, and that is exactly why this is charming.

SCENE — AFTER CLOSING, IN THE QUIET TAVERN:
She stands in the empty tavern after closing, a lamp behind her throwing a warm glow; chairs are up on the tables, drawn softly and simply, well out of focus. One strand of hair has fallen across her cheek. A couple of small manga sparkle marks near her shoulders.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft warm key light from behind and to one side, gentle bloom, delicate blush hatching, bright highlights in the eyes, background softly blurred.
```

---

## 2. 이야기 월페이퍼 · 리안느 넉 장 (한 장씩 따로 뽑습니다)

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
- She is in a tree, so the camera is a little below her — but it is aimed at her FACE and the branch, and the branch itself blocks everything under it.

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
- Framed from the chest up. She is covered from the neck down in a jerkin, tunic, leggings and boots. Camera at eye level.

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
- Her cloak is wrapped around her shoulders like a blanket, so she is covered. Camera at eye level.

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
- Hands behind the back is a SHY fidget: shoulders rounded and slightly hunched, weight shifted, head tucked down. Camera at eye level, straight on.
- She is covered from the neck down in a jerkin, tunic, leggings and boots.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin, bracers, leggings, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, FIDGETING (her WHOLE BODY is the subject):
Full figure, seen from a little distance so the whole fidgeting stance reads — NOT a face close-up. She faces the viewer squarely in a sunlit clearing and MAKES EYE CONTACT. Both hands are clasped behind her back and she is rocking slightly on her heels; one boot is turned inward on its toe. Her shoulders are drawn up and in, her chin is tucked down, and she looks at the viewer through her lashes with her ears bright red and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. A few petals drift past.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, light screentone. Soft backlight through leaves haloing her hair, gentle bloom, blush hatching on the ears and cheeks, background softly blurred.
```

---

## 3. 이야기 월페이퍼 · 아녜스 넉 장 (한 장씩 따로 뽑습니다)

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
- The habit covers her from the chin to the floor — high collar, long bell sleeves, long plain skirt. Camera at eye level.

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
- The habit covers her from the chin down. Camera at eye level, straight on.

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
- The habit covers her from the chin to the floor — high collar, long bell sleeves, long plain skirt. Camera at eye level.

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
- The habit stays on and closed at the throat. Camera at eye level, straight on.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament — here the veil is pushed slightly back and more of her hair shows — high-collared black habit with wide bell sleeves, pale stole, sash.

SCENE — THANK YOU:
Chest-up, close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She looks directly at the viewer and is clearly saying thank you. Soft light from a high window to the left; a few motes drift through it.

RENDERING:
Grayscale only, no colour. Clean ink linework, cel shading, fine screentone. Soft key light, a bright halo of blown-out light behind her head, delicate blush hatching, bright highlights in the eyes, background softly blurred.
```
