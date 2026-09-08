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

**`assets/wallpaper/knightgirl_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, everything covered.
- No cleavage, no underwear, no skin-tight emphasis, no suggestive posing.
- Camera at eye level. No low angles looking up, no close-ups of the body.
- The appeal of this picture is the EXPRESSION and the SITUATION, not the figure.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair past her waist. A slim jewelled circlet with one small gem on her forehead. Full silver plate armour with layered pauldrons and a fitted breastplate over a high-necked underlayer, a long cape with an embroidered hem, armoured boots. A straight longsword at her hip. Calm, slightly tired features.

SCENE — A FORMAL KNIGHT'S GREETING:
Full figure, standing in a vaulted stone hall, facing the viewer but with her eyes lowered — she has not looked up yet. Her right fist is over her heart, her left hand rests on the sword's pommel, and her upper body is bowed a few degrees in a stiff, correct salute. The cape falls straight behind her. Cold light through a tall arched window behind her throws a long shadow forward across the flagstones. Everything about the pose is proper and distant.

RENDERING:
Grayscale only, no colour. Clean confident ink linework with screentone and hatching for shading, the way a monochrome light-novel illustration is drawn — not a painted cover. Soft even lighting with one clear light source, moderate contrast, detailed but calm background. Floating dust motes in the light.
```

**`assets/wallpaper/knightgirl_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict — this is a COMEDY panel, not a fanservice panel):
- Wholesome, all-ages, non-sexualized. NOTHING below the shoulders is visible.
- She is submerged to the neck in an opaque wooden tub and thick steam fills the room; the water surface is drawn as solid white so nothing shows through.
- No cleavage, no bare shoulders, no wet-skin rendering, no suggestive posing.
- Camera at eye level, framed on her HEAD and one throwing arm only.
- The joke is her furious embarrassed face and the flying soap, nothing else.

CHARACTER — ISOLDE, a young knight (off duty):
Very long pale hair, here loose and damp, pinned up messily. No armour, no circlet.

SCENE — THE DOOR OPENED BY MISTAKE:
Framed from the chest of the tub upward. She is in a round wooden bath tub in a small bathhouse, sunk to the neck, thick steam everywhere. The heavy door at the frame's edge has just swung open and a bright shaft of light cuts in. Her eyes are huge, her whole face burning, mouth wide open mid-shout. One arm is thrown back over the tub rim mid-throw — a bar of soap flies toward the viewer with a spray of droplets, and a wooden bucket and a scrubbing brush tumble through the air beside it. Comic, loud, harmless.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, comedic manga energy — bold speed lines behind the thrown soap, a sweat-drop mark, exaggerated open-mouth expression. Strong backlight through the open door, dense white steam. Detailed wooden interior.
```

**`assets/wallpaper/knightgirl_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed and fully armoured.
- No cleavage, no skin-tight emphasis, no suggestive posing, no low angles.
- The appeal is the solemnity of the moment, not the figure.

CHARACTER — ISOLDE, a young knight:
Very long straight pale hair, slim jewelled circlet, full silver plate armour with layered pauldrons over a high-necked underlayer, a long embroidered cape, armoured boots, a straight longsword.

SCENE — THE OATH:
Full figure, kneeling on one knee at the centre of a ruined cathedral floor. Her longsword is driven point-down into the flagstones before her; both hands are folded over the crossguard and her forehead is bowed almost to her hands. Eyes closed. The cape spills across the stone behind her in a wide arc. A single shaft of light from a shattered rose window falls straight down onto her. Petals and ash drift through the beam.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone and crosshatching, monochrome manga illustration style — not a painted cover. One hard vertical light shaft, volumetric dust, detailed gothic ruin, reflective wet floor. Solemn, quiet.
```

**`assets/wallpaper/knightgirl_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed; the armour stays on and closed at the throat.
- No cleavage, no undressing, no suggestive posing, no low angles.
- This is a SHY HAPPY portrait. The appeal is entirely her face.

CHARACTER — ISOLDE, a young knight:
Very long pale hair, slim circlet, silver plate armour — here dented and dusty from a fight, with a smear of dirt on one cheek and a few strands of hair escaped.

SCENE — AFTER THE MISSION, AT SUNSET:
Chest-up, close, facing the viewer. She has just come back from a fight and is smiling — a real, uncontrolled smile she is clearly not used to making. She looks straight at the viewer, but her eyes flick very slightly aside and her cheeks are flushed: happiness and embarrassment at once. One hand is raised just into the bottom of the frame, palm open, as if she had reached out and then thought better of it. Behind her, a low sun over a broken field and heavy backlit clouds.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, monochrome light-novel illustration style. Strong rim light from behind blowing out the edges of her hair, soft shadow on the near side of her face, small lens-flare starbursts, floating particles, softly blurred background.
```

**`assets/wallpaper/bunnyaxe_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed in a modest tavern uniform.
- No cleavage, no short skirt emphasis, no thigh focus, no suggestive posing.
- The camera is slightly low to make her look imposing, but it stays on her FACE and the fallen customer — never on her body.

CHARACTER — BIANCA, a tavern server who fights:
A lively young woman with a short tousled bob, freckles, and a wide confident grin. A laced bodice over a long-sleeved blouse, a full apron, a kerchief tied over her hair, sturdy knee-high boots, and one battered steel pauldron strapped over her right shoulder. She carries an enormous single-bladed woodcutter's axe as if it weighed nothing.

SCENE — THROWING OUT A ROWDY CUSTOMER:
Full figure in a crowded candle-lit tavern. One boot planted on a toppled bench, she leans in and jabs a finger down at a big drunk man who has fallen backward off his stool at the bottom of the frame — seen from behind, hands raised. Her other hand rests the axe casually over her shoulder. Mouth open mid-shout, one eyebrow up: furious, completely in control, almost enjoying it. Tankards, spilled ale and scattered cards frozen in the air. Other patrons watch from the shadows.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading and bold manga action lines. Warm candlelight from below and behind, smoke haze, splashing liquid as sharp white arcs. Dense detailed tavern background.
```

**`assets/wallpaper/bunnyaxe_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed in a modest tavern uniform, collar closed.
- She leans on the bar but the pose is NOT a chest-forward pose — her weight is on her elbows and the camera is at eye level, framed on her face and the glass.
- No cleavage, no suggestive posing, no low angles.

CHARACTER — BIANCA:
Short tousled bob, freckles, laced bodice over a long-sleeved blouse, apron, kerchief, one battered pauldron on her right shoulder. Her huge axe leans against the bar behind her, out of the way.

SCENE — HER OWN COCKTAIL:
Waist-up, both elbows on a polished tavern bar, pushing a tall glass right into the foreground — the glass is large in frame, filled with layered liquid, ice, a curl of citrus peel and something dubious floating in it. Her grin is huge, eyebrows raised in expectation, clearly saying "drink it". Her free hand gives a thumbs-up. Bottles and hanging tankards crowd the shelves behind her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, cheerful manga energy. Warm lamplight, wide-angle foreshortening on the glass, condensation droplets picked out in white, bright highlights from bottles behind. Densely detailed bar background.
```

**`assets/wallpaper/bunnyaxe_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, collar closed, apron on.
- No cleavage, no suggestive posing, no low angles, no wet-clothing rendering.
- This is a QUIET EMOTIONAL panel. The appeal is entirely her face.

CHARACTER — BIANCA:
Short tousled bob — here messy, her kerchief slipped off — freckles, laced bodice over a long-sleeved blouse, a dirty apron, one battered pauldron. Her axe lies on the ground beside her.

SCENE — THANK YOU FOR STAYING:
Chest-up, close, sitting on the back steps of the tavern at night. She has clearly been crying — eyes and nose red and wet, lashes clumped, a tear track still on one cheek — but she has just looked up at the viewer and is smiling through it: a crumpled, grateful, slightly embarrassed smile. One hand wipes her eye with the back of her wrist; the other is half-raised toward the viewer. Her shoulders are still hitching. Warm light spills from the doorway behind her; the yard beyond is dark and rainy.

RENDERING:
Grayscale only, no colour. Clean ink linework with fine screentone, gentle monochrome light-novel illustration style. Soft key light from the doorway behind, a cold rim from the night, bright white specular dots in her wet eyes, fine rain streaks, shallow depth of field.
```

**`assets/wallpaper/bunnyaxe_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, neatly dressed, collar closed.
- No cleavage, no suggestive posing, no low angles, no body emphasis.
- The appeal is her nervous happy face and the closed door in front of her.

CHARACTER — BIANCA:
Short tousled bob, freckles — but tonight the apron is off, the bodice is neatly laced over a clean blouse, her hair is brushed and she wears a small ribbon. No axe anywhere.

SCENE — OUTSIDE THE DOOR, ABOUT TO CONFESS:
Full figure, standing in a narrow lamp-lit corridor, back lightly against the wall beside a closed wooden door. She looks at the door, not at the viewer. Both hands are clutched together at her chest around a small wrapped parcel. Her face is bright red, eyes squeezed half-shut, mouth caught between a nervous grimace and an enormous helpless smile — she has been standing here a while. One boot is up on its toe. Her shadow stretches long down the corridor.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading; heavy blush drawn with fine hatching and two small blush lines, manga style. A single warm lamp above and to one side, deep falloff into black down the corridor. Detailed timber-and-plaster interior.
```

**`assets/wallpaper/elfarcher_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed; her tunic reaches mid-thigh and she wears leggings and tall boots.
- The camera looks UP at her because she is in a tree, but it frames her FACE and the branch — never up her clothing. No thigh focus, no suggestive posing.

CHARACTER — RIANNE, an elf archer:
A slender elf with long pointed ears and very long pale hair in a high ponytail tied with a feather. A short-sleeved hooded jerkin over a fitted tunic, a wide belt, leather bracers, a quiver of fletched arrows at her hip, a torn ragged-hemmed cloak, leggings and tall lace-up boots. A longbow taller than she is. Cool, distant expression.

SCENE — LOOKING DOWN FROM THE BRANCH:
Full figure, seen from below. She is perched on a thick branch high in an ancient forest, one knee drawn up and the other leg hanging, her bow across her lap and an arrow held loosely between two fingers. She looks straight down at the viewer, chin lowered, expression unreadable and evaluating — not hostile, not welcoming. Her ponytail and torn cloak hang down past the branch. Shafts of light break through the canopy far above; leaves drift down through the frame.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, monochrome light-novel illustration style. Strong god-rays through the canopy, deep shadow below, fine detail in bark and leaves, floating pollen motes.
```

**`assets/wallpaper/elfarcher_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, leggings and tall boots.
- No cleavage, no thigh focus, no suggestive posing, no low angles.
- The appeal is the awkward sincerity of the gesture and her reddened ears.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair in a high ponytail with a feather, hooded jerkin over a fitted tunic, bracers, quiver, torn cloak, leggings, tall boots. Her longbow is slung across her back, freeing both hands.

SCENE — THE OFFERED HAND:
Knee-up, standing on a mossy forest path, turned three-quarters toward the viewer. She has extended one hand toward the viewer, palm up, fingers slightly curled — and immediately regretted it: the arm is not fully straight, her shoulders are drawn in, and she has turned her face away and down, looking off to the side with her ear tips visibly reddened and her lips pressed thin. Her other hand grips her own elbow.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading. Dappled forest light, soft rim light along her arm and hair, blush on the ear tips drawn with fine hatching. Detailed mossy woodland, shallow depth of field with the offered hand nearest and sharpest.
```

**`assets/wallpaper/elfarcher_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully clothed, cloak wrapped around her shoulders.
- No cleavage, no thigh focus, no suggestive posing, no low angles.
- The joke is her total loss of composure in front of a grilled fish.

CHARACTER — RIANNE:
Long pointed ears, long pale hair in a high ponytail with a feather, hooded jerkin, bracers, quiver, leggings, tall boots. Her torn cloak is pulled around her shoulders like a blanket; her bow leans against the wall.

SCENE — GRILLING A FISH IN THE DUNGEON:
Waist-up, crouched on her heels beside a small campfire in a cramped stone dungeon chamber. She holds a stick over the flames with a whole fish skewered on it, leaning so far forward that her face is almost in the fire. Her eyes are huge and locked on the fish, her mouth open, very obviously about to drool; one hand hovers as if to grab it early. All her usual composure is gone. Firelight throws her shadow enormous on the wet brick wall behind; her pack and a discarded arrow lie beside her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading and comedic manga marks — a small sweat drop, sparkle highlights on the fish. The fire is the single hard light source lighting her from below, deep black beyond it, sparks and smoke rising. Detailed damp stonework.
```

**`assets/wallpaper/elfarcher_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully clothed, tunic to mid-thigh, leggings and tall boots.
- Hands behind the back is a SHY fidget, NOT a chest-forward pose — keep her shoulders rounded and slightly hunched, weight shifted, head tucked down.
- No cleavage, no chest emphasis, no thigh focus, no low angles.
- The appeal is her embarrassed pleased face and her red ear tips.

CHARACTER — RIANNE:
Long pointed ears, very long pale hair — here loose and unbound rather than tied up — hooded jerkin, bracers, leggings, tall boots. No bow, no quiver.

SCENE — HANDS BEHIND HER BACK, FIDGETING:
Knee-up, standing in a sunlit forest clearing, facing the viewer. Both hands are clasped behind her back and she is rocking slightly on her heels; one boot is turned inward on its toe. Her shoulders are drawn up and in, her chin is tucked down, and she looks at the viewer through her lashes with her ears bright red and a small helpless pleased smile she cannot get rid of. Loose strands of hair fall across her face. Petals and light drift around her.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading, gentle monochrome light-novel illustration style. Soft backlight through leaves haloing her hair, gentle bloom, blush drawn with fine hatching on the ears and cheeks, softly blurred forest background.
```

**`assets/wallpaper/nun_awkward.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.
- The appeal is the stillness of the moment.

CHARACTER — AGNES, a young nun:
Shoulder-length pale hair framing her face under a white headband and a black veil with a small leaf ornament at the temple. A high-collared black habit with wide bell sleeves, a long pale stole down the front, a sash at the waist, a long plain skirt, simple shoes. She carries a censer on a fine chain. Gentle, downcast features.

SCENE — PRAYING IN THE RUIN:
Full figure, kneeling in the nave of a roofless ruined medieval cathedral. Her hands are clasped at her chest, head bowed, eyes closed. The censer rests on the broken flagstones beside her, a thin line of smoke rising. Shattered pews and fallen masonry stretch away on both sides; above her the ribs of the vault are open to a heavy overcast sky. Ash and paper fragments drift in the still air.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone and crosshatching, monochrome light-novel illustration style. Soft flat overcast light from above with strong local contrast, drifting particles, detailed gothic ruin. Hushed and quiet.
```

**`assets/wallpaper/nun_friend.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict — this is a COMEDY panel):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar, long sleeves.
- No cleavage, no suggestive posing, no low angles.
- The joke is the horrifying pie and her genuine bliss while eating it.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, a high-collared black habit with wide bell sleeves, a pale stole, a sash. No censer here.

SCENE — THE TERRIBLE PIE, ENJOYED:
Waist-up, seated at a plain wooden refectory table, seen from across it. In front of her sits a pie with an entire fish head thrust up through the crust, eyes open, tail sticking out the other side. She has a large forkful raised to her mouth and her eyes are closed in genuine, blissful delight; one cheek is already full and she is smiling around it. Her free hand is pressed to her cheek in appreciation. A second untouched plate sits opposite, pushed slightly away.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone shading and small comedic manga marks — sparkles around her face, a single sweat drop over the fish head. Warm side light from a window, steam rising, bright highlights on the crust and the fish's eye, detailed wood grain. Deadpan and funny.
```

**`assets/wallpaper/nun_trust.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit — high collar, long sleeves, long skirt with NO slit.
- No cleavage, no leg exposure, no suggestive posing, no low angles.
- The appeal is the bitterness behind her smile.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament, high-collared black habit with wide bell sleeves, pale stole, sash, a censer on a chain hanging from one hand.

SCENE — IN THE GRAVEYARD, LOOKING UP:
Waist-up, standing among leaning weathered headstones at dusk, her body turned away but her face tilted up toward a break in the clouds. She is smiling — a small, tired, bitter smile with no happiness in it — and her eyes are open and dry. The censer hangs still at her side, its smoke going straight up. Bare branches reach across the top of the frame; long grass moves around the stones.

RENDERING:
Grayscale only, no colour. Clean ink linework with screentone and crosshatching. Cold light breaking through heavy cloud from above and behind, strong rim light on her cheek and veil, deep shadow across the graves, drifting smoke. Melancholy and still.
```

**`assets/wallpaper/nun_love.jpg`**

```
A black-and-white light-novel INTERIOR ILLUSTRATION (monochrome manga insert art), vertical 9:16. NO TEXT anywhere — no captions, no signatures, no watermarks, no letters or numerals.

CONTENT RULES (strict):
- Wholesome, all-ages, non-sexualized. Fully covered by a heavy habit, high collar closed.
- No cleavage, no undressing, no suggestive posing, no low angles.
- This is a WARM GRATEFUL portrait. The appeal is entirely her smile.

CHARACTER — AGNES:
Shoulder-length pale hair under a white headband and black veil with a leaf ornament — here the veil is pushed slightly back and more of her hair shows — high-collared black habit with wide bell sleeves, pale stole, sash.

SCENE — THANK YOU:
Chest-up, close, facing the viewer straight on. She is smiling openly and fully for the first time — eyes crinkled almost shut with happiness, head tilted a little to one side — and both hands are folded together at her chest. Her cheeks are flushed. She looks directly at the viewer and is clearly saying thank you. Soft light falls from a high window to the left; motes drift through it.

RENDERING:
Grayscale only, no colour. Clean ink linework with fine screentone, gentle monochrome light-novel illustration style. Soft directional key light with gentle falloff, a bright halo of blown-out light behind her head, delicate hatching for the blush, bright highlights in the eyes, softly blurred chapel background.
```
