# 비앙카 — 연회장의 도끼

← [색인으로](../CHARACTER_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-char.py`.
고치려면 생성기의 `CHARS` 를 고치세요.

| | |
|---|---|
| id | `bunnyaxe` |
| 등급·역할 | 공격 · 근접 · A등급 |
| 고유장비 | 축배의 도끼 |
| 파티에서 하는 일 | 한 번에 크게 때린다. 맞기 전에 끝내는 쪽이라 오래는 못 버틴다. |

> 박수는 나중에 쳐. 아직 한 곡 남았어.

여섯 장이 필요합니다. **§A 를 먼저 뽑고**, 사람이 나오는 나머지에 그걸
레퍼런스로 첨부하세요 (캐릭터가 안 나오는 순수 이펙트 시트는 예외입니다).

| | 무엇 | 모델 | 어디에 쓰이나 |
|---|---|---|---|
| §A | 전투 8프레임 | Gemini | 홈 전투에서 실제로 넘어가는 그림 |
| §B | 흉상 | Gemini | 파티 칸 · 모집 결과 · 도감 |
| §C | 2D 일러스트 | GPT | 감상용 한 장 |
| §D | 내리찍기 3프레임 | Gemini | 평타. 칠 때 이 셋이 돈다 |
| §E | 스킬 — 도약 강타 3 + 폭발 3 | Gemini | 네 번에 한 번 나가는 큰 기술 |

---

## 잠금 문장 (LOCK)

아래 세 프롬프트에 **이미 들어 있습니다.** 따로 복사할 일은 없고, 사람이 읽을
용도로 둡니다. **고치지 마세요** — 다듬는 순간 그 장만 다른 사람이 됩니다.

```
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent in every frame.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block. That is how she is recognised at 54 pixels.
```

---

## §A. 전투 8프레임 (Gemini)

게임이 실제로 넘기는 그림입니다. `guard → windup → strike → recover` 가 한 번의
스윙이고, 그게 0.8~1.5초마다 돕니다 (`src/screens/home/Fighter.tsx`).

**카메라가 정측면이 아닙니다.** 바닥이 쿼터뷰 평면이라 (`Ground.tsx`), 인물도
살짝 위에서 내려다본 각도여야 합니다. 정측면으로 그리면 인물과 바닥이 서로
다른 세계에 있는 것처럼 보입니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| | 대기 | 치켜듦 | 내려침 | 되돌아옴 | 피격 | 휘청 | 승리 | 패배 |
| id | `guard` | `windup` | `strike` | `recover` | `hit` | `stagger` | `win` | `lose` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a battle animation sheet of ONE single character, 8 frames.

THE CHARACTER (this exact person in all 8 cells):
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent in every frame.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block. That is how she is recognised at 54 pixels.

The 8 cells, in this exact order. Each cell shows her WHOLE body from head to feet, at a consistent height — the ground she stands on is implied and is NEVER drawn:

Cell 1 — standing at rest and ready, weight settled, head level, watching.
  THE AXE HEAD RESTS ON THE GROUND beside her front foot, the haft angled up across the front of her body, both hands loose on it. She is leaning on it slightly. This is the pose she holds most of the time — it must look heavy and unbothered, like the weapon is resting rather than being held.
Cell 2 — winding up. Torso twisted back and away from the target, hips coiled, front foot planted.
  THE HAFT IS LAID BACK ACROSS HER FAR SHOULDER with the head hanging down behind that shoulder — hugging her back, foreshortened, NOT sticking out into open space. Like a woodcutter loading a swing with the axe resting on the shoulder.
Cell 3 — the blow landing. Body driven forward past the front foot, both hands hauling the haft down and through.
  THE AXE HEAD ENDS LOW, buried in the air down-forward at about 45 degrees, just above the ground in front of her. Not horizontal, not raised.
  Two or three short straight speed lines follow the arc. They are part of the drawing and must also stay inside the cell.
Cell 4 — being dragged round by the weight. Shoulders square again but the hips still turning, weight fallen onto the rear foot.
  THE HAFT HAS SWUNG THROUGH AND THE HEAD NOW HANGS BEHIND HER at knee height, close to her rear heel, pulled IN toward the body. She is not putting it back — it is carrying her, and she is catching up with it.
Cell 5 — taking a hit. Head snapped back, torso recoiled, one foot skidding. The axe drops and swings low across her body, head toward the ground, one hand nearly off the haft — she is losing hold of it, not raising it.
Cell 6 — staggering. Doubled forward over the axe, whose head is planted in the ground in front of her and taking her weight through the haft. One knee buckling, free hand braced on her thigh, hair fallen across the face. Still standing, barely.
Cell 7 — victory. Facing the viewer square-on rather than to the side, feet planted wide, chin up, grinning.
  THE AXE HEAD IS PLANTED IN THE GROUND IN FRONT OF HER, both hands stacked on the butt of the haft, which stands at about chest height. NOT raised overhead — a raised axe needs twice the cell height and gets cut off, and an axe driven into the earth reads as the stronger victory anyway.
Cell 8 — defeated. Down on one knee, head bowed, the axe planted head-down in the ground beside her, one hand still on the haft using it as a prop. Side-on, facing right.

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

CAMERA — SLIGHT HIGH-ANGLE SIDE VIEW (three-quarter). This is not a flat side view.

- The camera sits a little ABOVE the character and slightly to the side, looking down
  at roughly 15-20 degrees. You can see a little of the top of the shoulders and the
  upper surface of the boots.
- The body is turned about 20 degrees toward the viewer from pure profile — the far
  shoulder is visible behind the near one, and you can see both eyes on the face.
- The FEET sit slightly forward and lower than the torso, as if standing on a floor
  plane that recedes upward into the background. This is the single most important
  part: the game draws a receding floor under this sprite, and a flat side-on figure
  will look like it is standing in a different world from the ground.
- Facing RIGHT. Every frame faces right. The game mirrors sprites in code where it
  needs them facing the other way — never draw a left-facing frame.

NEVER DRAW THE GROUND.

The game draws its own floor under these sprites (a receding quarter-view plane) and
composites the artwork on top of it. Anything floor-like inside a cell lands on the
screen as a white slab sitting in mid-air.

So there is NO ground line, NO horizon, NO floor plane, NO paving, NO grass, NO dirt,
NO rubble, NO cracks, NO drop shadow, and NO dust lying on a surface. Not even a thin
line under the feet.

THE GROUND IS IMPLIED BY THE POSE, NOT DRAWN. Where a description says a weapon is
"planted in the ground", or a knee is "on the floor", or something "bursts out of the
ground", it means: draw the figure and the effect at that height, standing on nothing.
The bottom of the boots, the point of the blade, the base of the burst — they simply
stop, with pure black beneath them.

Contact is sold by the POSE (a bent knee, a braced arm, a low burst opening upward),
never by drawing what is being touched.

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

NOTHING MAY BE CUT OFF.

THE ONE RULE THAT PREVENTS THIS: **the axe never leaves her body's own footprint by
more than half a body height.** Read the eight pose descriptions again — none of them
raises the axe overhead, none swings it out behind her at full extension. The head is
always low, grounded, or resting on a shoulder.

That is deliberate. The haft is nearly as long as she is tall and the head is a broad
slab on the end of it, so any pose that extends the weapon fully needs twice her body
height of room, and the direction changes every frame. An axe raised overhead is the
single most common way this sheet fails.

SO: DRAW THE POSES AS WRITTEN. If a pose in your head is bigger or more extended than
what is written, it is not the pose that was asked for.

SIZE AND PLACEMENT:
- Her body, head to heel, fills about 60% of the cell height.
- She stands slightly BEHIND centre, toward the LEFT of her cell, because she moves
  forward to the RIGHT.
- Her feet sit at the same HEIGHT in every cell, in the bottom third. That height is
  a shared alignment, not a line to draw — see NEVER DRAW THE GROUND.
- Use ONE scale for all eight cells. Never enlarge the calm frames to fill their
  empty space — the frames must play back without the figure jumping or resizing.

- Each cell contains the ENTIRE figure AND the ENTIRE weapon, end to end, plus
  every trailing piece of cloth and hair and every speed line. If any of it touches or
  crosses a magenta line, that cell has failed and the sheet is unusable.
- If something still does not fit, DRAW HER SMALLER. Never crop the weapon, never run
  it off the edge, never fade it out at the boundary.
- Leave at least 8px of empty black between the outermost pixel and every magenta
  line, on all four sides of every cell.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 2 rows.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 2 rows, exactly 8 cells.
- EVERY CELL MUST BE SQUARE. With a 4x2 grid that means the whole sheet is
  4:2 — output it at 2048x1024.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 슬라이서 설정

```json
{ "file": "<§A 파일명>", "name": "bunnyaxe", "expect": [4, 2],
  "labels": ["guard", "windup", "strike", "recover", "hit", "stagger", "win", "lose"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `Fighter` 는 이미 `set={ch.id}` 로
그리고 있고, 폴더가 없는 사람만 `fallbackSet="duel"` 로 떨어집니다 —
**`assets/sprites/bunnyaxe/` 가 생기는 순간 이 사람만 제 그림으로 바뀝니다.**
코드는 안 고쳐도 됩니다.

---

## §B. 흉상 (Gemini)

파티 칸·모집 결과·도감에 뜨는 얼굴입니다. 64px 정도로 작게 나옵니다.

**§A 를 레퍼런스로 첨부하세요.**

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: one bust portrait of a single character — head, shoulders and upper chest only, cropped at roughly nipple height, facing the viewer square-on, centred, filling about 85% of the image height.

THE CHARACTER:
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent in every frame.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block. That is how she is recognised at 54 pixels.

THIS IMAGE: Chin tipped down, looking up at the viewer from under the fringe with a crooked grin — like she is about to say something rude. Both rabbit ears in frame including the bent tip. The bow tie, the collar and the right shoulder guard are visible, and the axe haft crosses the frame behind her LEFT shoulder.

THE ONLY THING THIS CROPS IS THE CHEST. Everything above the shoulders is drawn whole — the top of her head, all her hair, the circlet — with black space above it. A hairstyle sliced off by the top edge is a failed image.

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

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

OUTPUT: a single square image, 512x512. No grid, no separator lines, no magenta.
```

받으면 `assets/sprites/avatar/bunnyaxe.png` 로 넣으세요 (슬라이서를 안 태웁니다).

---

## §C. 2D 일러스트 (GPT)

감상용 한 장입니다. 게임 안에 들어가는 그림이 아니라, 캐릭터 창에서
"월페이퍼 보기" 로 화면을 꽉 채워 보여 주는 쪽입니다
(`screens/home/WallpaperPopup`).

### 세로입니다

처음에는 16:9 가로로 뽑았습니다. 그런데 이 게임을 보는 화면은 **세로로 긴
휴대폰**이라, 가로 그림을 화면에 담으면 위아래로 검은 띠가 절반 가까이
남습니다 — 월페이퍼가 아니라 가운데 낀 띠 하나가 됩니다.

그래서 **9:16 세로**로 다시 뽑습니다. 인물을 무릎 위까지가 아니라 발끝까지
넣고, 머리 위로 장소가 올라가는 구도입니다. 자세한 규칙은 프롬프트 안의
VERTICAL COMPOSITION 에 있습니다.

`assets/wallpaper/knightgirl.jpg` 가 기준 톤입니다 (가로판이지만 인물과 명암은 그대로 씁니다).

**§A 와 §B 를 레퍼런스로 첨부하세요.** 픽셀 그림이지만 머리 모양·갑옷·좌우
배치를 잡아 주는 데는 충분히 먹습니다.

```
A single monochrome greyscale anime illustration of one woman.

THE CHARACTER:
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent in every frame.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block. That is how she is recognised at 54 pixels.

THE SCENE:
A ballroom after everyone has left. Chandeliers still lit, tables overturned, glasses and confetti across a checkered floor. She sits sideways on the edge of a long banquet table with one boot up on it, the axe laid across her lap, holding a glass she has not drunk from. Light comes down hard from the chandeliers and throws her shadow long across the wrecked floor.

MOOD: Loud night, quiet morning. She is grinning but the room behind her is ruined, and the picture should let the viewer decide which of those two things happened first.

STYLE (strict):
- A single finished illustration in Japanese anime style, rendered entirely in
  MONOCHROME GREYSCALE — pure black, pure white, and the full range of greys between.
  There is no colour anywhere in the image, not even a tint.
- Soft cel shading with airbrushed gradients, deep rich blacks in the shadows, and one
  strong light source expressed purely as value.
- Clean confident line art. Detailed rendering of hair strands, fabric folds, armour
  edges and the material of the environment. Cinematic shallow depth of field.
- Wallpaper composition: she is unmistakably the subject, the place is readable behind
  her, and there is quiet negative space where interface could sit.
- No text, no watermark, no signature, no logo, no border, no speech bubbles.
- This is NOT pixel art and NOT 1-bit. It is a fully rendered greyscale illustration.
- She is an adult. Tasteful — no suggestive framing, no leering camera.

VERTICAL COMPOSITION — this is a PHONE wallpaper, 9:16 portrait (tall).

- The frame is TALL, not wide. Build the picture UP AND DOWN. Where the scene
  description says something "runs away into the distance" or "stretches across the
  floor", stage that as DEPTH climbing the frame, never as width crossing it.
- FULL FIGURE, or three-quarter at the very least — head to foot is best. A tall frame
  cropped at the chest throws away its whole lower half, which is the reason to shoot
  portrait in the first place.
- She stands (or kneels, or sits) so that her head sits near the UPPER THIRD line and
  her feet near the bottom. Above her head is the place itself — ceiling, sky, canopy,
  high window — and it stays quiet.
- KEEP THE TOP AND BOTTOM STRIPS QUIET. A phone puts a clock across the top and a home
  bar across the bottom. Nothing that must be read — her face above all — goes there.
- Nothing important touches the left or right edge. The frame is narrow, so a prop
  running off the side reads as CUT, not as continuing past the edge.
- One figure only. No second character, no crowd, no inset panel.

CHARACTER CONSISTENCY — if a reference image is attached, match it exactly. Treat the written description above as a checklist against that reference, not as licence to redesign. Keep every asymmetric detail on the stated side: the cuff on her LEFT wrist is the torn one, and the axe head faces FORWARD (to her right) in every frame.

OUTPUT: one finished illustration, 9:16 PORTRAIT — a tall phone wallpaper, at least 1242 x 2208. It must be taller than it is wide. No grid, no panels, no text anywhere in the image.
```

받으면 `assets/wallpaper/bunnyaxe.jpg` 로 **덮어쓰세요** (가로판을 대신합니다).
**1-bit 로 만들면 안 됩니다.**

---

## §D. 내리찍기 3프레임 (Gemini)

**한 번 내려찍는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup → strike →
recover` 셋을 대신합니다 — 같은 세 칸이지만 **참격 궤적이 들어가고**, 자세도
찍기 전용으로 다시 그립니다.

궤적은 그림 안에 같이 들어갑니다. 따로 뽑아 겹치면 도끼가 지나간 자리와 도끼가
실제로 있는 자리가 한 픽셀씩 어긋납니다.

**도끼 궤적은 검보다 두껍습니다.** 날이 한 뼘 폭이라, 가는 선이 아니라 넓은
띠로 지나갑니다. 이게 대검과 한눈에 구별되는 지점입니다.

**§A 를 레퍼런스로 첨부하세요.** 같은 사람이어야 합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 당김 | 2 찍음 | 3 끌림 |
| id | `cut_1` | `cut_2` | `cut_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character performing ONE downward axe chop, left to right. The character IS in every cell — this is not an effect-only sheet.

THE CHARACTER (this exact person in all 3 cells):
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent in every frame.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block. That is how she is recognised at 54 pixels.

THE SWING: she chops DOWNWARD, from her far shoulder down and forward past her front foot. The axe never goes above her head and never swings out behind her at full stretch — it travels through the front-lower quarter of the cell.

THE TRAIL IS DRAWN INTO THESE FRAMES, not supplied separately. It is a white crescent following the path the head has already swept: absent in cell 1, biggest and boldest in cell 2, breaking into fragments in cell 3.

AN AXE TRAIL IS THICKER THAN A SWORD TRAIL. The cutting edge is a hand-span wide, so the crescent is a broad heavy band, not a thin line.

The 3 cells, in this exact order:

Cell 1 — the wind-up. Torso coiled back and away, front foot planted, the haft laid back across her far shoulder with the head hanging behind it, both hands stacked low on the haft. NO trail yet — nothing has moved.
Cell 2 — the chop at its fastest, the head sweeping down past the front of her body and ending down-forward at about 45 degrees, arms extended, hips driving through, her whole weight behind it.
  A BOLD WIDE WHITE CRESCENT sweeps with it, tracing the whole path the head has travelled from her shoulder down past the edge. Thick and heavy — this is the frame the player sees land, and it must be the boldest of the three.
Cell 3 — the swing finished and still carrying her. The head has come to rest low near the ground in front of her, arms extended down, one shoulder dropped by the weight.
  The crescent has broken into three separate fragments with gaps between them, fading behind the head.

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

CAMERA — SLIGHT HIGH-ANGLE SIDE VIEW (three-quarter). This is not a flat side view.

- The camera sits a little ABOVE the character and slightly to the side, looking down
  at roughly 15-20 degrees. You can see a little of the top of the shoulders and the
  upper surface of the boots.
- The body is turned about 20 degrees toward the viewer from pure profile — the far
  shoulder is visible behind the near one, and you can see both eyes on the face.
- The FEET sit slightly forward and lower than the torso, as if standing on a floor
  plane that recedes upward into the background. This is the single most important
  part: the game draws a receding floor under this sprite, and a flat side-on figure
  will look like it is standing in a different world from the ground.
- Facing RIGHT. Every frame faces right. The game mirrors sprites in code where it
  needs them facing the other way — never draw a left-facing frame.

NEVER DRAW THE GROUND.

The game draws its own floor under these sprites (a receding quarter-view plane) and
composites the artwork on top of it. Anything floor-like inside a cell lands on the
screen as a white slab sitting in mid-air.

So there is NO ground line, NO horizon, NO floor plane, NO paving, NO grass, NO dirt,
NO rubble, NO cracks, NO drop shadow, and NO dust lying on a surface. Not even a thin
line under the feet.

THE GROUND IS IMPLIED BY THE POSE, NOT DRAWN. Where a description says a weapon is
"planted in the ground", or a knee is "on the floor", or something "bursts out of the
ground", it means: draw the figure and the effect at that height, standing on nothing.
The bottom of the boots, the point of the blade, the base of the burst — they simply
stop, with pure black beneath them.

Contact is sold by the POSE (a bent knee, a braced arm, a low burst opening upward),
never by drawing what is being touched.

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

NOTHING MAY BE CUT OFF.
- The trail is part of the drawing and is WIDE. It must stay inside its cell exactly like the axe does — an arc running off the edge is the same failure as a clipped weapon.
- Cell 2 is the widest and reaches furthest. Size the whole sheet from that one, then draw the other two at the same scale.
- Her body fills about 55% of the cell height. She stands slightly LEFT of centre because she swings forward to the RIGHT.
- Her feet sit at the same HEIGHT in all three cells, so the frames play back without the figure jumping. That height is an alignment, not a line to draw.
- Leave at least 8px of empty black between the outermost pixel and every magenta line.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 3 cells.
- EVERY CELL MUST BE SQUARE. With a 3x1 grid that means the whole sheet is
  3:1 — output it at 1536x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

### 슬라이서 설정

```json
{ "file": "<§D 파일명>", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["cut_1", "cut_2", "cut_3"] }
```

⚠ `"append": true` 가 꼭 필요합니다. §A 와 **같은 폴더**(`bunnyaxe`)에 넣는 것이라,
없으면 §A 로 만든 여덟 장을 지우고 이 넷만 남깁니다.

---

## §E. 스킬 — 도약 강타 + 폭발 (Gemini)

네 번째 공격마다 평타 대신 나갑니다 (`SKILL_EVERY`).

평타(§D)가 **서서 내려찍기**라면 스킬은 **뛰어들어 내려찍기**입니다.
적 한가운데로 점프해서, 떨어지는 무게까지 실어 바닥을 쪼갭니다.

한눈에 달라 보이는 지점은 **발**입니다 — 1·2번 칸에서 발이 땅에 없습니다.
3번 칸은 반대로 평소보다 훨씬 낮게 주저앉습니다.

**이 시트에서만 캐릭터 크기가 칸마다 달라집니다.** 1·2번은 작게(칸 높이의
45%), 3번은 평소 크기로 그립니다. 일부러 그렇게 합니다 — 멀리 떠 있다가
가까이 떨어지는 것이라, 크기가 같으면 점프로 안 읽힙니다.

도끼를 머리 위로 드는 곳도 여기 하나뿐입니다. 공중에 작게 떠 있는 칸이라
들어 올려도 안 잘립니다.

**바닥은 그리지 마세요.** 게임이 바닥을 따로 깔고 그 위에 이 그림을 얹습니다
(`Ground.tsx`). 칸 안에 바닥선이나 갈라진 금을 그리면 화면에서는 공중에 뜬
흰 덩어리가 됩니다. 닿았다는 것은 **자세**로 말합니다 — 낮게 주저앉은 것,
좌우로 퍼지는 부채꼴.

**두 장으로 나눕니다.** 터지는 폭발이 몸과 따로 있어야 하는데, 한 장에 같이
그리면 캐릭터에 묶여서 못 움직입니다.

### §E-1. 도약 강타 3프레임 (캐릭터)

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 도약 | 2 낙하 | 3 내리찍음 |
| id | `sk_1` | `sk_2` | `sk_3` |

**§A 를 레퍼런스로 첨부하세요.**

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character LEAPING and slamming her axe down at the end of a jump, left to right. The character IS in every cell.

THE CHARACTER (this exact person in all 3 cells):
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent in every frame.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block. That is how she is recognised at 54 pixels.

SHE LEAVES THE GROUND. Her normal attack is a chop from a standing position; here she jumps forward into the middle of the enemy line and brings the axe down with her whole falling weight. The giveaway must be visible at a glance: HER FEET ARE OFF THE GROUND in cells 1 and 2, and in cell 3 she is in a deep crouch, much lower than she ever stands.

THIS IS THE ONE PLACE THE AXE GOES UP. In cell 1 it is raised — but she is AIRBORNE and drawn small in the upper part of the cell, so the raised axe still fits. Draw her at about 45% of the cell height here, not 60%.

The 3 cells, in this exact order:

Cell 1 — airborne at the top of the jump, high in the UPPER HALF of the cell, small. Body tucked, knees drawn up, both hands hauling the axe back and up over her far shoulder. Ears and tail streaming. Empty black below her — she is high up.
  She is DRAWN SMALLER HERE — about 45% of the cell height — because this is the only frame where the axe is raised, and it must fit above her.
Cell 2 — falling, halfway down, still clear of the ground. Legs snapping straight and out in front of her, both arms driving the axe down ahead of her body, head between her arms.
  Four or five long straight speed lines run vertically behind her. Same scale as cell 1 — she is falling, not growing.
Cell 3 — the landing. Deep crouch, one knee dropped low, both feet planted wide, the axe head stopped at the very bottom of her reach directly in front of her, haft vertical, her weight still coming down through it.
  A BURST OPENS AT THE AXE HEAD: a low wide fan of straight radiating lines and hard chunks thrown outward and UP on BOTH sides of her. This is the frame the player sees land — the burst is the biggest shape in the sheet.
  DRAW NO FLOOR. No ground line, no cracks, no paving, nothing under her boots or under the burst. The fan simply opens outward from the axe head into black. Her crouch is what says she hit something.

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

CAMERA — SLIGHT HIGH-ANGLE SIDE VIEW (three-quarter). This is not a flat side view.

- The camera sits a little ABOVE the character and slightly to the side, looking down
  at roughly 15-20 degrees. You can see a little of the top of the shoulders and the
  upper surface of the boots.
- The body is turned about 20 degrees toward the viewer from pure profile — the far
  shoulder is visible behind the near one, and you can see both eyes on the face.
- The FEET sit slightly forward and lower than the torso, as if standing on a floor
  plane that recedes upward into the background. This is the single most important
  part: the game draws a receding floor under this sprite, and a flat side-on figure
  will look like it is standing in a different world from the ground.
- Facing RIGHT. Every frame faces right. The game mirrors sprites in code where it
  needs them facing the other way — never draw a left-facing frame.

NEVER DRAW THE GROUND.

The game draws its own floor under these sprites (a receding quarter-view plane) and
composites the artwork on top of it. Anything floor-like inside a cell lands on the
screen as a white slab sitting in mid-air.

So there is NO ground line, NO horizon, NO floor plane, NO paving, NO grass, NO dirt,
NO rubble, NO cracks, NO drop shadow, and NO dust lying on a surface. Not even a thin
line under the feet.

THE GROUND IS IMPLIED BY THE POSE, NOT DRAWN. Where a description says a weapon is
"planted in the ground", or a knee is "on the floor", or something "bursts out of the
ground", it means: draw the figure and the effect at that height, standing on nothing.
The bottom of the boots, the point of the blade, the base of the burst — they simply
stop, with pure black beneath them.

Contact is sold by the POSE (a bent knee, a braced arm, a low burst opening upward),
never by drawing what is being touched.

MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft.

ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration.

READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines.

NOTHING MAY BE CUT OFF.
- Cell 3 is the widest — the burst throws out on BOTH sides of her. Size the whole sheet from it.
- Cells 1 and 2 draw her SMALLER (about 45% of the cell) and high up, because that is where the axe is raised. Cell 3 draws her at normal scale but crouched. This is the one sheet where the figure changes size between cells, and it is deliberate — she is far away and then close.
- The three cells do NOT share a ground line, and no ground is drawn in any of them. She is high in cell 1, falling in cell 2, and crouched low in cell 3 — the height alone tells the story.
- She travels LEFT to RIGHT across the three cells: near the left edge in cell 1, centre in cell 2, right of centre in cell 3.
- Her feet sit at the same HEIGHT in all three cells — an alignment, not a drawn line.
- Leave at least 8px of empty black between the outermost pixel and every magenta line.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 3 cells.
- EVERY CELL MUST BE SQUARE. With a 3x1 grid that means the whole sheet is
  3:1 — output it at 1536x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

```json
{ "file": "<§E-1 파일명>", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["sk_1", "sk_2", "sk_3"] }
```

⚠ 여기도 `"append": true` 가 필요합니다 — §A·§D 와 같은 폴더입니다.


### §E-2. 폭발 3프레임 (이펙트)

캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**앞의 것들과 반대입니다.** 검기·화살은 옆으로 날아가지만 이건 **아래에서 위로**
퍼집니다. 그래서 세로로 긴 초승달이 아니라 **가로로 넓은 부채꼴**이고, 칸
가운데가 아니라 **아래쪽**에 붙습니다.

**여기에도 바닥은 없습니다.** 도끼가 멈춘 자리에서 그냥 퍼져 나갈 뿐이고,
아래쪽은 검정입니다.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 터짐 | 2 솟음 | 3 흩어짐 |
| id | `wave_1` | `wave_2` | `wave_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: 3 cells. An impact blast — the burst thrown outward where a heavy axe came down. There is NO character, NO weapon, NO axe, NO ground — only the blast.

It opens UPWARD AND OUTWARD like a fan from a point low in the cell, because that is where the axe head stopped. It does NOT travel sideways; it stays where it was made and dies there.

THERE IS NO FLOOR IN THIS SHEET. Do not draw a ground line, paving, cracks, or dust lying on a surface. The blast opens into pure black.

The 3 cells, in this exact order:

Cell 1 — the moment of impact. A low wide fan of force bursting UP and OUT from a point near the BOTTOM CENTRE of the cell — a solid bright wedge with six or seven straight spikes radiating up and to both sides, and a few hard chunks thrown with them. Widest at the bottom, tapering as it rises. Below the point it came from there is nothing at all — pure black.
Cell 2 — the blast rising. The wedge has lifted and spread wider, its core thinner and more broken, the spikes longer and further apart. The thrown chunks are higher and further out, arcing away from the centre.
Cell 3 — the blast dispersing. Only scattered chunks and short dashes remain, drifting apart and upward. Most of the cell is already empty, and nothing is left sitting along the bottom.

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

NEVER DRAW THE GROUND.

The game draws its own floor under these sprites (a receding quarter-view plane) and
composites the artwork on top of it. Anything floor-like inside a cell lands on the
screen as a white slab sitting in mid-air.

So there is NO ground line, NO horizon, NO floor plane, NO paving, NO grass, NO dirt,
NO rubble, NO cracks, NO drop shadow, and NO dust lying on a surface. Not even a thin
line under the feet.

THE GROUND IS IMPLIED BY THE POSE, NOT DRAWN. Where a description says a weapon is
"planted in the ground", or a knee is "on the floor", or something "bursts out of the
ground", it means: draw the figure and the effect at that height, standing on nothing.
The bottom of the boots, the point of the blade, the base of the burst — they simply
stop, with pure black beneath them.

Contact is sold by the POSE (a bent knee, a braced arm, a low burst opening upward),
never by drawing what is being touched.

EFFECT SHEET RULES — this is a flash of motion, not a picture of an object.
- The 3 frames must READ AS ONE THING travelling and dying. Frame 1 is solid and bright, frame 3 is mostly gone.
- This one is WIDER THAN IT IS TALL and it sits LOW in the cell, because that is where the axe head stopped. Do not centre it vertically.
- No floor, no ground line, no dust layer. It opens into black.
- It is symmetric left-to-right, unlike a travelling arc — it opens both ways from the point of impact.
- Bold chunky shapes with hard edges and dithered fills. NOT a soft glow, NOT fine sparkles.
- WHITE ON BLACK. It is composited over enemies and background, so a filled cell becomes a white blob — at its biggest it covers maybe half the cell.
- It is centred in its cell and stays inside it. The game moves it across the screen; do not draw it partly off the edge.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 3 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 3 cells.
- EVERY CELL MUST BE SQUARE. With a 3x1 grid that means the whole sheet is
  3:1 — output it at 1536x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

```json
{ "file": "<§E-2 파일명>", "name": "bunnyaxe_wave", "expect": [3, 1],
  "labels": ["wave_1", "wave_2", "wave_3"] }
```
