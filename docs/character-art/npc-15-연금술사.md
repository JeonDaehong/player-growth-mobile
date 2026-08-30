# §15. 연금술사

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)

이전: [심연 안내인](npc-14-심연-안내인.md) · 다음: [둔카락스 · 요정 · 오오라](98-둔카락스-요정-오오라.md)

| | |
|---|---|
| id | `npc_alchemist` |
| 장소 | 연금술사의 천막 |
| 말투 | 실없이 명랑한 괴짜. 말이 빠르다 |
| 선물 테마 | 희귀 재료 · 이상한 액체 |
| 호감도 MAX 혜택 | 연성 실패 시 재료 20% 반환 |

## LOCK

아래 여섯 프롬프트에 **이미 들어 있습니다.** 고치지 마세요.

```
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.
```

---

## §F15. 표정 6칸 (Gemini) — **이 사람의 기준 시트**

제안서 8번의 여섯 감정입니다. 이 시트가 얼굴을 확정하고, 전신도 월페이퍼도 전부
이걸 첨부합니다. **제일 먼저 뽑으세요.**

1-bit 에서 "기쁘게" 같은 지시는 절대 안 먹습니다. 눈썹이 어디로 가고 입이 무슨
모양인지를 픽셀 단위로 적어야 64px 에서 읽힙니다 — 아래 프롬프트가 그렇게 돼
있습니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| | 평정 | 즐거움 | 기쁨 | 신뢰 | 부끄러움 | 행복 |
| id | `calm` | `amused` | `joy` | `trust` | `shy` | `love` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: an expression sheet of ONE single character, 6 bust portraits.

THE CHARACTER (this exact person in all 6 cells):
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.

Each cell is a bust: head, shoulders and upper chest only, cropped at roughly nipple height, centred, filling about 85% of the cell height. The 6 cells, in this exact order:

Cell 1 — neutral and composed. Eyes open and level, mouth one short straight line, brows flat, head upright and facing the viewer square-on. This is the default face — every other cell is a departure from THIS one.
Cell 2 — amused, teasing. One brow raised higher than the other, eyes narrowed into two shallow arcs, one corner of the mouth pulled up, head tilted a few degrees, chin slightly raised.
Cell 3 — openly delighted. Both eyes squeezed shut into happy upward arcs, mouth open in a wide smile, both brows raised high, head tilted back a little, shoulders lifted.
Cell 4 — trusting and steady. Eyes half-lidded and warm, a small closed-mouth smile, brows relaxed and slightly lowered, chin dipped toward the viewer in a small nod. Calm, not sleepy.
Cell 5 — flustered. Eyes wide, pupils pushed to one side, brows angled up at the inner ends, mouth a small wavering line, one hand raised near the cheek, head turned away while the eyes stay on the viewer. Add 1-bit dithered blush hatching across both cheeks and the bridge of the nose.
Cell 6 — quietly happy, close to fond. Eyes softened into gentle downward curves, a full closed-mouth smile, brows tilted up at the inner ends, both hands clasped near the chest, head tilted. Dithered blush hatching, lighter than the flustered cell.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.
- No borders or frames around the whole image.

ONE CHARACTER, MANY CELLS — the rule that matters most on this sheet.
- Every cell is THE SAME PERSON. Same face, same hair colour value and hair length,
  same outfit down to every strap, buckle and frill, same props, same body proportions,
  same height relative to the cell.
- ONLY the pose and the facial expression change between cells. Nothing else, ever.
- Do NOT offer variations, alternate outfits, alternate hairstyles, or design options.
  This is a production reference sheet, not a concept exploration.
- ASYMMETRY IS LOCKED. If a braid, scar, pauldron, eyepatch, bandage, satchel or
  hair sweep is on the character's right in one cell, it is on the character's right in
  EVERY cell — including cells where the character is turned to the side or away.
  Mirror the pose if you must, never the character's design.
- Draw all cells in a single pass as one connected character reference sheet. Do not
  draw them as separate independent pictures that happen to share a description.

READABILITY — these are displayed small.
- Busts are displayed at about 64x64 pixels; full bodies at about 96 pixels tall.
- The silhouette must be identifiable at that size with the details thrown away.
  Give the character one big shape nobody else has: a hat, a huge pack, a mantle,
  a weapon carried at an unusual angle.
- Faces need at most: two eyes, two brows, one mouth line, and a hair shape.
  Do not draw noses as more than a single pixel notch, or nothing at all.
- Do not render fabric texture, individual hair strands, or skin shading detail.
  At this size they become noise. Big shapes, hard edges, wide dither fields.

EXPRESSION IS THE ONLY VARIABLE.
- The crop, the camera distance, the shoulder line and the lighting are identical in all 6 cells. Only brows, eyes, mouth, head tilt and the position of the hands change.
- Do not change her hairstyle between cells to suit the mood. Hair may swing with a head tilt; it may not restyle.
- Cell 1 is the baseline. Draw cell 1 first and derive the other five from it by moving features, not by redrawing the face.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 2 rows.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Each subject is centered in its cell with at
  least 8px of black padding on all sides.
- Do not add extra rows of variants. Exactly 2 rows, exactly 6 cells.
- Reading order is left to right, then top to bottom.
```

### 슬라이서 설정

```json
{ "file": "<§F15 파일명>", "name": "npc_alchemist", "expect": [3, 2],
  "labels": ["calm", "amused", "joy", "trust", "shy", "love"] }
```

---

## §B15. 전신 3칸 (Gemini)

제안서 6번의 전신 3종입니다. 화면비가 흉상과 근본적으로 달라서(세로로 길다) 표정
시트와 한 장에 못 묶습니다 — 묶으면 셀이 정사각형이 되고 전신이 뭉개집니다.

**위 §F15 시트를 레퍼런스로 첨부하세요.**

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 일반 | 부끄러움 | 기쁨 |
| id | `stand` | `shy` | `joy` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a full-body pose sheet of ONE single character, 3 poses.

THE CHARACTER (this exact person in all 3 cells):
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.

Each cell shows the WHOLE body from head to feet, standing on an implied ground line. The body fills about 75% of the tall cell's height, leaving room for raised arms, swung hair and trailing sleeves. The 3 cells, in this exact order:

Cell 1 — standing at rest, facing the viewer square-on, weight evenly on both feet, arms relaxed at the sides, holding her signature prop in the hand the LOCK specifies. Calm neutral face.
Cell 2 — half-turned away from the viewer, knees pressed together, one hand raised to the cheek and the other arm crossed low over the body, shoulders drawn in, looking back at the viewer over the shoulder. Flustered face with dithered blush.
Cell 3 — leaning forward toward the viewer, both arms raised or thrown out wide, one heel lifted off the ground mid-bounce, hair and clothing swung by the motion. Openly delighted face. Both hands, all the swung hair and every trailing sleeve stay inside the cell.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.
- No borders or frames around the whole image.

ONE CHARACTER, MANY CELLS — the rule that matters most on this sheet.
- Every cell is THE SAME PERSON. Same face, same hair colour value and hair length,
  same outfit down to every strap, buckle and frill, same props, same body proportions,
  same height relative to the cell.
- ONLY the pose and the facial expression change between cells. Nothing else, ever.
- Do NOT offer variations, alternate outfits, alternate hairstyles, or design options.
  This is a production reference sheet, not a concept exploration.
- ASYMMETRY IS LOCKED. If a braid, scar, pauldron, eyepatch, bandage, satchel or
  hair sweep is on the character's right in one cell, it is on the character's right in
  EVERY cell — including cells where the character is turned to the side or away.
  Mirror the pose if you must, never the character's design.
- Draw all cells in a single pass as one connected character reference sheet. Do not
  draw them as separate independent pictures that happen to share a description.

READABILITY — these are displayed small.
- Busts are displayed at about 64x64 pixels; full bodies at about 96 pixels tall.
- The silhouette must be identifiable at that size with the details thrown away.
  Give the character one big shape nobody else has: a hat, a huge pack, a mantle,
  a weapon carried at an unusual angle.
- Faces need at most: two eyes, two brows, one mouth line, and a hair shape.
  Do not draw noses as more than a single pixel notch, or nothing at all.
- Do not render fabric texture, individual hair strands, or skin shading detail.
  At this size they become noise. Big shapes, hard edges, wide dither fields.

SAME BODY, SAME SCALE.
- Her head sits at the same height in all three cells and her feet rest on the same ground line, so the three can be swapped in place without her appearing to grow or shrink.
- Cell 1 is the baseline standing pose. It must match the character in the attached expression sheet exactly — same outfit, same props, same side for every asymmetric detail.

NOTHING MAY BE CUT OFF — this is the failure this sheet fails at most often.

- Each cell must contain the ENTIRE drawing: the whole body AND the whole weapon from
  tip to pommel, the full swing arc, and every trailing piece of cape, hair, ribbon,
  sleeve and tassel. If any of it touches or crosses a magenta line, that cell has
  failed and the sheet is unusable.
- SIZE THE FIGURE FROM THE BIGGEST POSE, NOT FROM THE BODY. Find the pose that reaches
  furthest (usually the overhead victory pose and the extended strike), make THAT one
  fit inside its cell with room to spare, and then draw every other cell at exactly
  that same scale. The body itself ends up filling only about 60-65% of the cell
  height. That is correct — the empty space is reserved for the weapon.
- Every cell shares one ground line and one top margin. Do NOT zoom in on the calm
  poses to use up their empty space. A smaller figure with air around it is right;
  eight figures at eight different sizes cannot be played back as an animation.
- If a weapon is too long to fit, DRAW THE CHARACTER SMALLER. Never crop the blade,
  never run it off the edge, never fade it out at the boundary, and never re-angle or
  shorten the weapon just to make it fit.
- Leave at least 8px of empty black between the outermost pixel of the drawing and
  every magenta line, on all four sides of every cell.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Each subject is centered in its cell with at
  least 8px of black padding on all sides.
- Do not add extra rows of variants. Exactly 1 row, exactly 3 cells.
- Each cell is TALL — roughly twice as high as it is wide. This is a wide short sheet of three tall cells side by side.
```

### 슬라이서 설정

```json
{ "file": "<§B15 파일명>", "name": "npc_alchemist_body", "expect": [3, 1],
  "labels": ["stand", "shy", "joy"] }
```

---

## §W15. 호감도 보상 월페이퍼 4장 (GPT)

여기만 다른 레지스터입니다. 게임 안에 들어가는 그림이 아니라, 호감도를 올리면
**받아서 화면 밖에서 보는** 흑백 애니 일러스트입니다.
`assets/2026-08-29-001/file_0000000066b8820682d6077adf3f81e8.jpg` 가 기준 톤입니다.

슬라이서를 태우지 않습니다 — 원본 그대로 `assets/wallpaper/npc_alchemist/lv3.jpg` 처럼
넣으세요. 1-bit 로 만들면 안 됩니다.

### 레벨은 3 · 5 · 7 · 10 입니다

제안서 6번은 "1·5·10 세 장", 8번은 "3·5·7·10 네 장" 으로 서로 다릅니다.
**8번을 따랐습니다** — 말투가 바뀌는 지점과 그림이 풀리는 지점이 같아야 "레벨이
올랐다" 가 한 번에 읽힙니다. 6번대로 Lv1 에 한 장을 주면 호감도를 쌓기도 전에
보상이 먼저 나와서, 나머지 아홉 레벨이 심심해집니다.

### 뽑을 때

1. **위 §F15 와 §B15 시트를 레퍼런스로 첨부하세요.** 픽셀 그림이지만 머리 모양·
   복장·소품·좌우 배치를 잡아 주는 데는 충분히 먹습니다.
2. 네 장을 **연달아 한 대화 안에서** 뽑으세요. 세션을 나누면 사람이 바뀝니다.
3. Lv3 을 먼저 뽑고, 그 결과를 Lv5·7·10 요청에 다시 첨부하세요.


### §W15-3 · 호감도 Lv3 — 일하는 중

```
A single monochrome greyscale anime illustration of one woman.

THE CHARACTER (identical across all four images in this set):
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.

THE SETTING: a cluttered alchemist tent, hanging bundles of dried matter, a bubbling still, shelves of vials, canvas walls lit from outside.

THIS IMAGE — affinity level 3 of 10, "at work":
She is at work, in the middle of her job, and has just noticed you watching. Full figure or three-quarter body, in her workplace, surrounded by the tools of her trade. She is caught mid-task and glancing over at the viewer — pleased to be noticed but not stopping what she is doing. Professional, warm, a little distant. Composition: wide, the location is as much the subject as she is.

STYLE (strict):
- A single finished illustration in Japanese anime style, rendered entirely in
  MONOCHROME GREYSCALE — pure black, pure white, and the full range of greys between.
  There is no colour anywhere in the image, not even a tint.
- Soft cel shading with airbrushed gradients, deep rich blacks in the shadows, and one
  strong warm light source (lantern, hearth, window, lamp) expressed purely as value.
- Clean confident line art. Detailed rendering of hair strands, fabric folds, and the
  material of the environment. Cinematic shallow depth of field.
- Wallpaper composition: the character is unmistakably the subject, her location is
  readable behind her, and there is quiet negative space where interface could sit.
- No text, no watermark, no signature, no logo, no border, no panel gutters, no
  speech bubbles.
- This is NOT pixel art and NOT 1-bit. It is a fully rendered greyscale illustration.
- Tasteful. Suggestive at most, never explicit. She is an adult.

CHARACTER CONSISTENCY — this is one image out of a set of four of the SAME woman.
- The four images differ only in setting, framing, lighting and mood. Her face, hair
  length and shape, eye shape, body proportions and signature outfit are identical
  across all four.
- Keep every asymmetric detail on the same side as written below (braids, scars,
  bandages, patches, which shoulder carries what). Do not mirror her.
- If a reference image of this character is attached, match it exactly — treat the
  written description above as a checklist against that reference, not as licence to
  redesign.

OUTPUT: one finished illustration, 16:9 landscape, wallpaper resolution. No grid, no panels, no text anywhere in the image.
```


### §W15-5 · 호감도 Lv5 — 일이 끝나고

```
A single monochrome greyscale anime illustration of one woman.

THE CHARACTER (identical across all four images in this set):
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.

THE SETTING: a cluttered alchemist tent, hanging bundles of dried matter, a bubbling still, shelves of vials, canvas walls lit from outside.

THIS IMAGE — affinity level 5 of 10, "off duty":
Off duty at the end of the day. She has loosened or removed one working layer — an apron untied, a collar opened, a hat set down beside her, hair let down. She is sitting or leaning somewhere in her own place with the lamps low, relaxed, holding a drink or resting her chin on one hand, looking directly at the viewer with an easy unguarded smile. Composition: medium shot, closer than the level 3 image.

STYLE (strict):
- A single finished illustration in Japanese anime style, rendered entirely in
  MONOCHROME GREYSCALE — pure black, pure white, and the full range of greys between.
  There is no colour anywhere in the image, not even a tint.
- Soft cel shading with airbrushed gradients, deep rich blacks in the shadows, and one
  strong warm light source (lantern, hearth, window, lamp) expressed purely as value.
- Clean confident line art. Detailed rendering of hair strands, fabric folds, and the
  material of the environment. Cinematic shallow depth of field.
- Wallpaper composition: the character is unmistakably the subject, her location is
  readable behind her, and there is quiet negative space where interface could sit.
- No text, no watermark, no signature, no logo, no border, no panel gutters, no
  speech bubbles.
- This is NOT pixel art and NOT 1-bit. It is a fully rendered greyscale illustration.
- Tasteful. Suggestive at most, never explicit. She is an adult.

CHARACTER CONSISTENCY — this is one image out of a set of four of the SAME woman.
- The four images differ only in setting, framing, lighting and mood. Her face, hair
  length and shape, eye shape, body proportions and signature outfit are identical
  across all four.
- Keep every asymmetric detail on the same side as written below (braids, scars,
  bandages, patches, which shoulder carries what). Do not mirror her.
- If a reference image of this character is attached, match it exactly — treat the
  written description above as a checklist against that reference, not as licence to
  redesign.

OUTPUT: one finished illustration, 16:9 landscape, wallpaper resolution. No grid, no panels, no text anywhere in the image.
```


### §W15-7 · 호감도 Lv7 — 둘만 있을 때

```
A single monochrome greyscale anime illustration of one woman.

THE CHARACTER (identical across all four images in this set):
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.

THE SETTING: a cluttered alchemist tent, hanging bundles of dried matter, a bubbling still, shelves of vials, canvas walls lit from outside.

THIS IMAGE — affinity level 7 of 10, "alone together":
A private moment with nobody else present. She is close to the viewer and knows it — leaning in across a table, or turned toward the camera from very near, one hand reaching partly toward the viewer. Soft low light from a single source. Her expression is fond and a little shy, eyes on the viewer, and she is clearly in the middle of saying something she would not say in front of others. Composition: upper body, shallow depth of field, the background dissolved into soft shapes.

STYLE (strict):
- A single finished illustration in Japanese anime style, rendered entirely in
  MONOCHROME GREYSCALE — pure black, pure white, and the full range of greys between.
  There is no colour anywhere in the image, not even a tint.
- Soft cel shading with airbrushed gradients, deep rich blacks in the shadows, and one
  strong warm light source (lantern, hearth, window, lamp) expressed purely as value.
- Clean confident line art. Detailed rendering of hair strands, fabric folds, and the
  material of the environment. Cinematic shallow depth of field.
- Wallpaper composition: the character is unmistakably the subject, her location is
  readable behind her, and there is quiet negative space where interface could sit.
- No text, no watermark, no signature, no logo, no border, no panel gutters, no
  speech bubbles.
- This is NOT pixel art and NOT 1-bit. It is a fully rendered greyscale illustration.
- Tasteful. Suggestive at most, never explicit. She is an adult.

CHARACTER CONSISTENCY — this is one image out of a set of four of the SAME woman.
- The four images differ only in setting, framing, lighting and mood. Her face, hair
  length and shape, eye shape, body proportions and signature outfit are identical
  across all four.
- Keep every asymmetric detail on the same side as written below (braids, scars,
  bandages, patches, which shoulder carries what). Do not mirror her.
- If a reference image of this character is attached, match it exactly — treat the
  written description above as a checklist against that reference, not as licence to
  redesign.

OUTPUT: one finished illustration, 16:9 landscape, wallpaper resolution. No grid, no panels, no text anywhere in the image.
```


### §W15-10 · 호감도 Lv10 — 마음을 준 뒤

```
A single monochrome greyscale anime illustration of one woman.

THE CHARACTER (identical across all four images in this set):
A manic tinkerer permanently mid-experiment. A huge messy pile of hair with enormous circular goggles shoved up into it, pushing it further out of shape. She wears a stained heavy work apron over a shirt with the sleeves rolled past the elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials across her chest from the RIGHT shoulder. She holds a round-bottomed flask of bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark blackens her LEFT sleeve.

THE SETTING: a cluttered alchemist tent, hanging bundles of dried matter, a bubbling still, shelves of vials, canvas walls lit from outside.

THIS IMAGE — affinity level 10 of 10, "she has decided":
She has decided about you. A close, quiet, affectionate portrait — she is turned fully toward the viewer, very near, her hand resting on the viewer's side of the frame or held out to be taken, her expression open and completely without guard. The warmest light of the four. This is the reward image, so it is the most carefully rendered: the most detailed hair, the strongest lighting, the cleanest composition. Composition: bust to upper body, centred, wallpaper-clean.

STYLE (strict):
- A single finished illustration in Japanese anime style, rendered entirely in
  MONOCHROME GREYSCALE — pure black, pure white, and the full range of greys between.
  There is no colour anywhere in the image, not even a tint.
- Soft cel shading with airbrushed gradients, deep rich blacks in the shadows, and one
  strong warm light source (lantern, hearth, window, lamp) expressed purely as value.
- Clean confident line art. Detailed rendering of hair strands, fabric folds, and the
  material of the environment. Cinematic shallow depth of field.
- Wallpaper composition: the character is unmistakably the subject, her location is
  readable behind her, and there is quiet negative space where interface could sit.
- No text, no watermark, no signature, no logo, no border, no panel gutters, no
  speech bubbles.
- This is NOT pixel art and NOT 1-bit. It is a fully rendered greyscale illustration.
- Tasteful. Suggestive at most, never explicit. She is an adult.

CHARACTER CONSISTENCY — this is one image out of a set of four of the SAME woman.
- The four images differ only in setting, framing, lighting and mood. Her face, hair
  length and shape, eye shape, body proportions and signature outfit are identical
  across all four.
- Keep every asymmetric detail on the same side as written below (braids, scars,
  bandages, patches, which shoulder carries what). Do not mirror her.
- If a reference image of this character is attached, match it exactly — treat the
  written description above as a checklist against that reference, not as licence to
  redesign.

OUTPUT: one finished illustration, 16:9 landscape, wallpaper resolution. No grid, no panels, no text anywhere in the image.
```
