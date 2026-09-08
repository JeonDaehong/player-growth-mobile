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

1. **이야기 월페이퍼 — 네 사람 × 네 단계 (한 장씩 따로 뽑습니다)** — 낱장 (자르기 없음)

---
## 1. 이야기 월페이퍼 — 네 사람 × 네 단계 (한 장씩 따로 뽑습니다)

| | |
|---|---|
| 자르기 | **없음** |
| 넣는 곳 | assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. 넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요. |
| 원본 | `docs/BOND_ART_PROMPTS.md`  |

### 프롬프트

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
A tall young knight woman with very long straight pale hair falling past her waist. A slim jewelled circlet with a single gem sits on her forehead. She wears ornate layered silver plate armour — segmented pauldrons, a fitted breastplate, armoured thigh-high boots — over a fitted underlayer, with a long flowing cape whose hem is embroidered with a fine pattern. She carries a straight double-edged longsword. Calm, composed features.

SCENE — A FORMAL KNIGHT'S GREETING:
She stands in a vaulted stone hall, full figure, facing the viewer but with her eyes lowered — she has not looked up yet. Her right fist is placed over her heart and her left hand rests on the pommel of her sheathed sword; her upper body is bowed a few degrees in a stiff, correct salute. Her cape falls straight behind her. Cold light falls through a tall arched window behind her, throwing a long shadow forward across polished flagstones. Everything about the pose is proper and distant.

RENDERING:
Black and white only, no colour at all. Rich full tonal range from deep black to pure white, dramatic directional lighting, volumetric light shafts, fine crosshatched detail in the armour and stonework, floating dust motes catching the light. Sharp, clean line work. Highly detailed background, cinematic composition, subject centred and full-length in frame.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
The same knight woman: very long straight pale hair, now loose and soaked, a slim jewelled circlet set aside. Her armour is off; she is in a wooden bathhouse.

SCENE — THE DOOR OPENED BY MISTAKE:
Waist-up, seen from the doorway. She is in a steaming wooden bath tub, water and thick steam covering her to the collarbone and hiding everything below. The heavy door at the frame's edge has just swung open and a shaft of light cuts in. Her eyes are wide, her whole face burning with embarrassment, mouth open in a shout. Her arm is thrown back mid-throw — a bar of soap is flying toward the viewer, caught in the air with a spray of droplets, and a wooden bucket and a scrubbing brush tumble through the air beside it. Wet hair sticks to her cheek. Modest and non-explicit: steam, water and the tub's rim cover her completely.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, strong backlight through the open door, dense volumetric steam, flying water droplets rendered as sharp white specks. Sharp clean line work, detailed wooden interior, cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
The same knight woman: very long straight pale hair, jewelled circlet, ornate layered silver plate armour with segmented pauldrons, a long embroidered cape, armoured thigh-high boots, a straight double-edged longsword.

SCENE — THE OATH:
Full figure, kneeling on one knee at the centre of a ruined cathedral floor. Her longsword is driven point-down into the flagstones in front of her; both hands are folded over the crossguard and her forehead is bowed until it almost touches her hands. Her eyes are closed. The cape spills across the stone behind her in a wide arc. A single shaft of light from a shattered rose window falls straight down onto her. Petals and ash drift through the beam.

RENDERING:
Black and white only, no colour at all. Rich full tonal range from deep black to pure white, a hard vertical light shaft, volumetric dust, fine crosshatching in the armour and the ruined stonework, reflective wet floor. Sharp clean line work, highly detailed gothic background, solemn cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — ISOLDE:
The same knight woman: very long straight pale hair, jewelled circlet, ornate silver plate armour, a long cape. Here the armour is dented and dusty and the collar is unbuckled, the cape torn at the hem.

SCENE — AFTER THE MISSION, AT SUNSET:
Chest-up, very close, facing the viewer. She has just come back from a fight; a smear of dirt is on one cheek and strands of hair have escaped. She is smiling — a real, uncontrolled smile she is clearly not used to making — and looking straight at the viewer, but her eyes flick very slightly aside and her cheeks are flushed, caught between happiness and embarrassment. One hand is raised into the bottom of the frame, palm open, as if she had just reached out and then thought better of it. Behind her, a low sun over a broken field, the sky heavy with backlit clouds.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, strong warm-feeling rim light from behind blowing out the edges of her hair, deep soft shadow on the near side of her face, lens-flare starbursts, floating particles. Sharp clean line work, shallow depth of field with the background softly blurred, intimate cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. She wears a tavern server's outfit — a laced bodice over a blouse with rolled sleeves, an apron, a kerchief tied over her hair — with one battered steel pauldron strapped over her right shoulder, and tall lace-up boots. She carries an enormous single-bladed woodcutter's axe with a long grip as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure, low angle, in a crowded candle-lit tavern. She has one boot planted on a toppled bench and is leaning in, jabbing a finger down at a big drunk man who has fallen backward off his stool at the bottom of the frame — we see him from behind, hands raised. Her other hand holds the axe casually over her shoulder. Her mouth is open mid-shout and one eyebrow is up; she is furious and completely in control, almost enjoying it. Tankards, spilled ale and scattered cards are frozen in the air around her. Other patrons watch from the shadows.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, warm candlelight from below and behind, heavy smoke haze, splashing liquid rendered as sharp white arcs. Sharp clean line work, dense detailed tavern background, dynamic cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
The same woman: short tousled bob, freckles, tavern server's outfit with a laced bodice, apron and kerchief, one battered steel pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Waist-up, leaning across a polished tavern bar toward the viewer, both elbows on the wood. She is pushing a tall glass right into the foreground — the glass is enormous in frame, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge and she is looking straight at the viewer with her eyebrows raised in expectation, clearly saying "drink it". Her free hand is a thumbs-up. Bottles and hanging tankards crowd the shelves behind her.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, warm lamplight, strong wide-angle foreshortening on the glass, condensation droplets picked out in white, bokeh highlights from bottles behind. Sharp clean line work, densely detailed bar background, playful cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
The same woman: short tousled bob, freckles, tavern server's outfit, one battered pauldron. Here her kerchief has slipped off and her apron is dirty; the axe lies on the ground beside her.

SCENE — THANK YOU FOR STAYING:
Chest-up, close, sitting on the back steps of the tavern at night. She has clearly been crying — her eyes and nose are red and wet, lashes clumped, a tear track still on one cheek — but she has just looked up at the viewer and is smiling through it, a crumpled, grateful, slightly embarrassed smile. One hand is wiping her eye with the back of her wrist; the other is half-raised toward the viewer. Her shoulders are still hitching. Warm light spills from the doorway behind her; the yard beyond is dark and rainy.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, soft warm key light from the doorway behind and a cold rim from the night, wet highlights in her eyes rendered with bright white specular dots, fine rain streaks. Sharp clean line work, quiet intimate cinematic composition, shallow depth of field.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — BIANCA:
The same woman: short tousled bob, freckles, tavern server's outfit, one battered pauldron — but tonight the apron is off, the bodice is neatly laced, her hair is brushed and she is wearing a small ribbon. No axe anywhere.

SCENE — OUTSIDE THE DOOR, ABOUT TO CONFESS:
Full figure, standing in a narrow lamp-lit corridor with her back pressed lightly against the wall beside a closed wooden door. She is looking at the door, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, her eyes are squeezed half-shut and her mouth is caught between a nervous grimace and an enormous helpless smile — she has been standing here a while. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, a single warm lamp above and to one side, deep falloff into black down the corridor, heavy blush rendered with fine hatching. Sharp clean line work, detailed timber-and-plaster interior, tense charming cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
A slender elf woman with long pointed ears and very long pale hair gathered into a high ponytail with a feather tied at the base. She wears a short-sleeved hooded jerkin over a fitted tunic, a wide belt, leather bracers, a quiver of fletched arrows at her hip and a torn ragged-hemmed cloak, with tall lace-up boots. She carries a longbow taller than she is. Cool, distant expression.

SCENE — LOOKING DOWN FROM THE BRANCH:
Full figure, seen from below at a steep upward angle. She is perched on a thick branch high in an ancient forest, one knee drawn up and the other leg hanging, her bow resting across her lap with an arrow held loosely between two fingers. She is looking straight down at the viewer, chin slightly lowered, expression unreadable and evaluating — not hostile, not welcoming. Her ponytail and the torn cloak hang down past the branch. Shafts of light break through the canopy far above; leaves drift down through the frame.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, strong god-rays from the canopy, deep shadow in the lower canopy, fine detail in bark and leaves, floating pollen motes. Sharp clean line work, dramatic low-angle perspective, highly detailed forest background.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
The same elf: long pointed ears, very long pale hair in a high ponytail with a feather, hooded jerkin, bracers, quiver, torn cloak, tall boots. Her longbow is slung across her back here, freeing both hands.

SCENE — THE OFFERED HAND:
Knee-up, standing on a mossy forest path, turned three-quarters toward the viewer. She has extended one hand toward the viewer, palm up, fingers slightly curled — and immediately regretted it: her arm is not fully straight, her shoulders are drawn in, and she has turned her face away and down, looking off to the side with her ears visibly reddened and her lips pressed thin. Her other hand grips her own elbow. The gesture is sincere and awkward at once.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, dappled forest light, soft rim light along her arm and hair, blush on the ear tips rendered with fine hatching. Sharp clean line work, detailed mossy woodland background, shallow depth of field with the offered hand nearest the viewer and sharpest.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
The same elf: long pointed ears, long pale hair in a high ponytail with a feather, hooded jerkin, bracers, quiver, torn cloak, tall boots. Her cloak is pulled around her shoulders like a blanket here and her bow leans against the wall.

SCENE — GRILLING A FISH IN THE DUNGEON:
Waist-up, crouched on her heels beside a small campfire in a cramped stone dungeon chamber. She is holding a stick over the flames with a whole fish skewered on it, leaning so far forward that her face is almost in the fire. Her eyes are huge and fixed on the fish, her mouth is open and she is very obviously about to drool; one hand hovers as if to grab it early. All her usual composure is gone. Firelight throws her shadow enormous on the wet brick wall behind; her pack and a discarded arrow lie beside her.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, the fire as the single hard light source lighting her from below, deep black beyond the firelight, sparks and smoke rising, glistening highlights on the fish. Sharp clean line work, detailed damp stonework, warm and comic cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — RIANNE:
The same elf: long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin loosened at the collar, bracers, torn cloak, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, SQUIRMING:
Knee-up, standing in a sunlit forest clearing, facing the viewer. Both hands are clasped behind her back, which pushes her shoulders back and makes her sway — one boot is turned inward on its toe and her hips are twisted, her whole body making a soft S-curve of embarrassment. She is looking at the viewer through her lashes with her chin tucked down, ears bright red, and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. Petals and light drift around her.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, soft backlight through leaves haloing her hair, gentle bloom, blush rendered with fine hatching on the ears and cheeks. Sharp clean line work, softly blurred forest background, warm intimate cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
A young nun with shoulder-length pale hair framing her face, wearing a black habit: a white headband under a black veil with a small leaf ornament at the temple, a high-collared black dress with wide bell sleeves, a long pale stole down the front, a sash at the waist, and a long skirt with a high slit over heeled shoes. She carries a censer on a fine chain. Gentle, downcast features.

SCENE — PRAYING IN THE RUIN:
Full figure, kneeling in the nave of a roofless ruined medieval cathedral. Her hands are clasped at her chest and her head is bowed, eyes closed. The censer rests on the broken flagstones beside her, a thin line of smoke rising from it. Shattered pews and fallen masonry stretch away on both sides; above her the ribs of the vault are open to a heavy overcast sky. Ash and paper fragments drift in the still air.

RENDERING:
Black and white only, no colour at all. Rich full tonal range from deep black to pure white, soft flat overcast light from above with strong local contrast, drifting particles, fine crosshatched detail in the fabric and the ruined stonework. Sharp clean line work, highly detailed gothic ruin background, hushed cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
The same nun: shoulder-length pale hair, white headband under a black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a plain wooden refectory table, seen from across it. In front of her is a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side. She has a large forkful raised to her mouth and her eyes are closed in genuine, blissful delight; one cheek is already full and she is smiling around it. Her free hand is pressed to her cheek in appreciation. Everything about her says this is delicious. A second untouched plate sits opposite, pushed slightly away.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, warm side light from a window, steam rising from the pie, glistening highlights on the crust and the fish's eye, fine detail in the wood grain. Sharp clean line work, detailed monastery interior, deadpan comic cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
The same nun: shoulder-length pale hair, white headband under a black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash, censer on a chain hanging from one hand.

SCENE — IN THE GRAVEYARD, LOOKING UP:
Waist-up, standing among leaning weathered headstones at dusk, her body turned away but her face tilted up toward a break in the clouds. She is smiling — a small, tired, bitter smile with no happiness in it — and her eyes are open and dry. The censer hangs still at her side, its smoke going straight up. Bare branches reach across the top of the frame; long grass moves around the stones.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, cold light breaking through heavy cloud from above and behind, strong rim light on her cheek and veil, deep shadow across the graves, drifting smoke. Sharp clean line work, highly detailed graveyard background, melancholy cinematic composition.
```

```
A monochrome grayscale anime illustration, vertical 9:16 portrait, in the style of a high-detail black-and-white light-novel cover. NO TEXT of any kind anywhere in the image — no captions, no signatures, no watermarks, no letters or numerals.

CHARACTER — AGNES:
The same nun: shoulder-length pale hair, white headband under a black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash. Here the veil is pushed slightly back and more of her hair shows.

SCENE — THANK YOU:
Chest-up, very close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She is looking directly at the viewer and clearly saying thank you. Soft light falls from a high window to the left; motes drift through it.

RENDERING:
Black and white only, no colour at all. Rich full tonal range, soft directional key light with gentle falloff, a bright halo of blown-out light behind her head, delicate hatching for the blush, glistening highlights in the eyes. Sharp clean line work, softly blurred chapel background, warm intimate cinematic composition.
```
