# 이졸데 — 서약의 백기사

← [색인으로](../CHARACTER_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-char.py`.
고치려면 생성기의 `CHARS` 를 고치세요.

| | |
|---|---|
| id | `knightgirl` |
| 등급·역할 | 방어 · 근접 · S등급 |
| 고유장비 | 서약검 여명 |
| 파티에서 하는 일 | 파티 맨 앞에 서서 안 비킨다. 뒤에 선 딜러가 그만큼 안 맞는다. |

> 맹세를 지키느라 한 번도 뒤로 물러선 적이 없다.

여섯 장이 필요합니다. **§A 를 먼저 뽑고**, 사람이 나오는 나머지에 그걸
레퍼런스로 첨부하세요 (캐릭터가 안 나오는 순수 이펙트 시트는 예외입니다).

| | 무엇 | 모델 | 어디에 쓰이나 |
|---|---|---|---|
| §A | 전투 8프레임 | Gemini | 홈 전투에서 실제로 넘어가는 그림 |
| §B | 흉상 | Gemini | 파티 칸 · 모집 결과 · 도감 |
| §C | 2D 일러스트 | GPT | 감상용 한 장 |
| §D | 베기 3프레임 | Gemini | 평타. 칠 때 이 셋이 돈다 |
| §E | 스킬 — 횡베기 3 + 검기 3 | Gemini | 자주 나가는 첫 기술 |
| §F | 두 번째 기술 — 도발 3프레임 | Gemini | 코스트가 비싼 기술. 첫 기술과 몸짓이 달라야 한다 |

---

## 잠금 문장 (LOCK)

아래 세 프롬프트에 **이미 들어 있습니다.** 따로 복사할 일은 없고, 사람이 읽을
용도로 둡니다. **고치지 마세요** — 다듬는 순간 그 장만 다른 사람이 됩니다.

```
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron. That contrast is how she is recognised at 54 pixels.
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
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron. That contrast is how she is recognised at 54 pixels.

The 8 cells, in this exact order. Each cell shows her WHOLE body from head to feet, at a consistent height — the ground she stands on is implied and is NEVER drawn:

Cell 1 — standing at rest and ready. Weight settled on both feet, head level, watching.
  THE BLADE RESTS LOW AND DIAGONAL ACROSS THE FRONT OF HER BODY, tip angled down toward the ground ahead of her front foot, both hands on the grip. She is not holding it up. This is the pose she holds most of the time, so it must look settled and heavy rather than tense.
Cell 2 — winding up. Torso twisted back and away from the target, front foot planted, shoulders coiled.
  THE BLADE IS LAID BACK ACROSS HER OWN SHOULDER, running diagonally over the far shoulder and down behind her back — foreshortened, hugging the body, NOT sticking out into open space. Think of a batter loading a swing with the bat resting on the shoulder. Only the last third of the blade is past her outline.
Cell 3 — the strike landing. Body extended forward past the front foot, both hands driving the blade through.
  THE BLADE ENDS LOW, pointing DOWN-FORWARD at about 45 degrees, tip near the ground in front of her. Not horizontal, not raised. A downward diagonal uses the corner of the cell, which is the longest line available.
  One or two short straight speed lines follow the arc. The lines are part of the drawing and must also stay inside the cell.
Cell 4 — recovering. Shoulders squaring back toward the resting pose, weight shifting onto the rear foot.
  THE BLADE HAS SWUNG THROUGH AND NOW HANGS ALONGSIDE HER, tip down and close to her rear heel — pulled IN toward the body, not trailing far out behind her. Halfway between the strike and the guard, and the most compact frame of the three.
Cell 5 — taking a hit. Head snapped back, torso recoiled, one foot skidding. The blade drops and swings low across her body, tip toward the ground — she is losing control of it, not raising it.
Cell 6 — staggering. Doubled forward over the blade, which is planted point-down in the ground in front of her and taking her weight. One knee buckling, free hand gripping the guard, hair fallen across the face. Still standing, barely.
Cell 7 — victory. Facing the viewer square-on rather than to the side, feet planted wide, chin up.
  THE BLADE IS PLANTED POINT-DOWN IN THE GROUND IN FRONT OF HER, both hands resting on the pommel, the guard at about chest height. NOT raised overhead — a raised blade needs twice the cell height and gets cut off, and a greatsword planted in the earth reads as a stronger victory anyway.
Cell 8 — defeated. Down on one knee, head bowed, blade planted point-down in the ground beside her and used as a prop by one hand. Still side-on, facing right.

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

THE ONE RULE THAT PREVENTS THIS: **the blade never leaves her body's own footprint by
more than half a body height.** Read the eight pose descriptions again — none of them
raises the blade overhead, none points it straight back, none holds it out
horizontally. It is always low, planted, or laid across her shoulder.

That is deliberate. Her weapon is as long as she is tall, so any pose that extends it
fully needs twice her body height of room in that direction, and the direction changes
every frame. Three earlier attempts were thrown away for exactly this — clipped at the
top, then at the side. The poses were redesigned so the problem cannot happen.

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
{ "file": "<§A 파일명>", "name": "knightgirl", "expect": [4, 2],
  "labels": ["guard", "windup", "strike", "recover", "hit", "stagger", "win", "lose"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `Fighter` 는 이미 `set={ch.id}` 로
그리고 있고, 폴더가 없는 사람만 `fallbackSet="duel"` 로 떨어집니다 —
**`assets/sprites/knightgirl/` 가 생기는 순간 이 사람만 제 그림으로 바뀝니다.**
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
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron. That contrast is how she is recognised at 54 pixels.

THIS IMAGE: Serene, level gaze straight at the viewer. A small closed-mouth smile that does not quite arrive. Both pauldrons and the top of the breastplate are in frame, and the greatsword hilt rises past her RIGHT shoulder.

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

받으면 `assets/sprites/avatar/knightgirl.png` 로 넣으세요 (슬라이서를 안 태웁니다).

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

`assets/2026-08-29-001/file_0000000066b8820682d6077adf3f81e8.jpg` 가 기준 톤입니다 (가로판이지만 인물과 명암은 그대로 씁니다).

**§A 와 §B 를 레퍼런스로 첨부하세요.** 픽셀 그림이지만 머리 모양·갑옷·좌우
배치를 잡아 주는 데는 충분히 먹습니다.

```
A single monochrome greyscale anime illustration of one woman.

THE CHARACTER:
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron. That contrast is how she is recognised at 54 pixels.

THE SCENE:
A quiet chapel hall at dusk, empty except for her. Tall narrow windows throw long shafts of light across a stone floor. Banners hang still. She kneels on one knee with the greatsword planted point-down in front of her, both hands folded over the pommel, head bowed — the moment before an oath, or just after one. The light falls from a high window onto her shoulders and the top of the blade.

MOOD: Reverent and still. Not a battle image and not a pin-up — this is the quietest moment of her life, and the picture should feel like holding your breath.

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

THREE BANDS, TOP TO BOTTOM. Fill all three; a tall frame fails when one of them is
empty wall.

  TOP THIRD     THE PLACE ABOVE HER — ceiling, sky, canopy, chandeliers, high
                windows, the hole where the roof was. It carries the light source
                and it stays quiet. Her face is never up here.
  MIDDLE THIRD  HER — head, torso, hands, and whatever she is holding. This band
                is the reason for the picture.
  BOTTOM THIRD  THE GROUND, coming TOWARD the viewer — floor, stumps, ash, spilled
                things, her own shadow. It is nearest, so it is largest.

FULL FIGURE, head to foot. Kneeling, sitting and half-turned are all fine — what
matters is that her feet are in frame and that the space above her head is the
PLACE, not blank wall. A tall frame cropped at the chest throws away its own lower
half, which is the only reason to shoot portrait.

TURN EVERY WIDE IDEA INTO A DEEP ONE. The scene below may describe things in
horizontal language — a long table, rows running away, a long shadow thrown across
the floor, a hall stretching out. In a narrow frame none of that fits sideways.
Stage each of them along the DEPTH axis instead:

  "runs away into the distance"    -> it recedes UP the frame and shrinks
  "a long table / a long aisle"    -> it points INTO the picture, not across it
  "throws a long shadow"           -> the shadow reaches DOWN toward the viewer
  "stretches across the floor"     -> the floor itself climbs from the bottom edge

VERTICAL LINES ARE FREE HEIGHT. If she is holding, planting or leaning on something
long — a sword, a bow, a stave, a censer chain — stand it UPRIGHT and let it run
through two of the three bands. One strong vertical is worth more than any amount
of detail in a frame this shape.

KEEP THE TOP AND BOTTOM STRIPS QUIET. A phone puts a clock across the top eighth
and a home bar across the bottom eighth. Nothing that must be read goes there —
her face above all.

Nothing important touches the left or right edge. The frame is narrow, so a prop
running off the side reads as CUT, not as continuing past the edge.

One figure only. No second character, no crowd, no inset panel.

VERTICAL STAGING FOR THIS SCENE — how the three bands are filled here:
TOP: the chapel goes UP. Two or three tall narrow windows rise out of the top of the frame, and one shaft of light comes down through them at a steep angle onto her. Banners hang vertically beside them. The ribbed ceiling is implied at the very top and left dark.
MIDDLE: her, kneeling on one knee, three-quarter view. THE GREATSWORD IS THE SPINE OF THE PICTURE — planted point-down in front of her, it stands upright through the middle band and its pommel reaches to her bowed head. Draw it dead vertical, not angled.
BOTTOM: the stone floor comes toward the viewer. The shaft of light lands as a bright patch that reaches DOWN out of the bottom of the frame, with the flagstone joints running into it. Her trailing skirt and half-cape spread across this band.

CHARACTER CONSISTENCY — if a reference image is attached, match it exactly. Treat the written description above as a checklist against that reference, not as licence to redesign. Keep every asymmetric detail on the stated side: the half-cape is pinned at her RIGHT shoulder and nowhere else.

OUTPUT: one finished illustration, 9:16 PORTRAIT — a tall phone wallpaper, at least 1242 x 2208. It must be taller than it is wide. No grid, no panels, no text anywhere in the image.
```

받으면 `assets/wallpaper/knightgirl.jpg` 로 **덮어쓰세요** (가로판을 대신합니다).
**1-bit 로 만들면 안 됩니다.**

---

## §D. 베기 3프레임 (Gemini)

**한 번 내려베는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup → strike →
recover` 셋을 대신합니다 — 같은 세 칸이지만 **검격 궤적이 들어가고**, 자세도
베기 전용으로 다시 그립니다.

**검격 이펙트가 그림 안에 같이 들어갑니다.** 궤적만 따로 뽑아 겹치는 방법도
있지만, 그러면 검이 지나간 자리와 검이 실제로 있는 자리가 한 픽셀씩 어긋납니다.
같이 그리면 그럴 일이 없습니다.

궤적은 프레임마다 다릅니다 — 1번엔 없고, **2번에 제일 크고**, 3번엔 조각으로
흩어집니다.

**§A 를 레퍼런스로 첨부하세요.** 같은 사람이어야 합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 당김 | 2 벰 | 3 멈춤 |
| id | `cut_1` | `cut_2` | `cut_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character performing ONE downward sword cut, left to right. The character IS in every cell — this is not an effect-only sheet.

THE CHARACTER (this exact person in all 3 cells):
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron. That contrast is how she is recognised at 54 pixels.

THE SWING: she cuts DOWNWARD, from her far shoulder down and forward past her front foot. The blade never goes above her head and never points straight back — it travels through the front-lower quarter of the cell.

THE TRAIL IS DRAWN INTO THESE FRAMES, not supplied separately. It is a white crescent following the path the blade has already swept: absent in cell 1, biggest and boldest in cell 2, breaking into fragments in cell 3.

The 3 cells, in this exact order:

Cell 1 — the wind-up. Torso coiled back and away from the target, front foot planted, the blade drawn back, laid across her far shoulder, both hands on the grip, tip pointing back and down behind her. NO trail yet — nothing has moved.
Cell 2 — the cut at its fastest, sweeping down past the front of her body, pointing down-forward at about 45 degrees, arms extended, hips driving through.
  A BOLD WHITE CRESCENT sweeps with it, tracing the whole path the blade has travelled, from her shoulder down past the tip. This is the frame the player actually sees land, so it must be the boldest of the three.
Cell 3 — the swing finished. The blade has come to rest low and diagonal near the ground in front of her, arms extended down, shoulders square.
  The crescent has broken into three separate fragments with gaps between them, fading behind the blade.

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
- The trail is part of the drawing. It must stay inside its cell exactly like the blade does — an arc running off the edge is the same failure as a clipped sword.
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
{ "file": "<§D 파일명>", "name": "knightgirl", "expect": [3, 1], "append": true,
  "labels": ["cut_1", "cut_2", "cut_3"] }
```

⚠ `"append": true` 가 꼭 필요합니다. §A 와 **같은 폴더**(`knightgirl`)에 넣는 것이라,
없으면 §A 로 만든 여덟 장을 지우고 이 넷만 남깁니다.

---

## §E. 스킬 — 횡베기 + 검기 (Gemini)

네 번째 공격마다 평타 대신 나갑니다 (`SKILL_EVERY`).

평타(§D)가 **내려베기**라면 스킬은 **횡베기**입니다. 한눈에 달라 보여야 해서
칼 각도를 아예 반대로 잡았습니다 — 평타는 위에서 아래로, 스킬은 옆으로 수평.

**두 장으로 나눕니다.** 검기가 몸을 떠나 날아가야 하는데, 한 장에 같이 그리면
검기가 캐릭터에 묶여서 못 움직입니다.

### §E-1. 횡베기 3프레임 (캐릭터)

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 당김 | 2 베기 | 3 놓음 |
| id | `sk_1` | `sk_2` | `sk_3` |

**§A 를 레퍼런스로 첨부하세요.**

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character performing ONE HORIZONTAL sword sweep, left to right. The character IS in every cell.

THE CHARACTER (this exact person in all 3 cells):
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron. That contrast is how she is recognised at 54 pixels.

THIS IS A SIDEWAYS CUT, NOT A DOWNWARD ONE. The blade stays LEVEL at waist height through the whole motion and sweeps across the front of her body. Do not raise it, do not chop downward — that is her normal attack and this must look different from it at a glance.

The 3 cells, in this exact order:

Cell 1 — winding up for a horizontal cut. The blade is pulled back HORIZONTALLY at waist height, held level behind her, both hands on the grip, torso twisted away. Knees bent, weight on the back foot. NO effect yet.
Cell 2 — the horizontal cut at full speed. The blade sweeps LEVEL across the front of her body at waist height, arms extended, torso snapped around, front foot planted hard. Hair and cape thrown sideways by the turn.
  A THICK HORIZONTAL WHITE STREAK follows the blade across her body — this is where the wave is born. It is still touching the blade, not yet separated.
Cell 3 — the follow-through. The blade has finished its sweep and points forward and slightly down, arms extended, shoulders squared to the target. She is watching what she just released.
  The streak has DETACHED from the blade and is drifting off the right edge of her reach — only its trailing end is still near the tip.

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
- A level blade held out sideways is the WIDEST thing this character ever does. Cell 2 is the widest of the three — size the whole sheet from it.
- Her body fills about 50% of the cell height. Lower than the other sheets, because the blade needs horizontal room on both sides.
- She stands in the MIDDLE of her cell here, not off to one side — the blade reaches back on the left and forward on the right.
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
{ "file": "<§E-1 파일명>", "name": "knightgirl", "expect": [3, 1], "append": true,
  "labels": ["sk_1", "sk_2", "sk_3"] }
```

⚠ 여기도 `"append": true` 가 필요합니다 — §A·§D 와 같은 폴더입니다.


### §E-2. 검기 3프레임 (이펙트)

캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 생성 | 2 비행 | 3 소멸 |
| id | `wave_1` | `wave_2` | `wave_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: 3 cells. A flying sword wave (a crescent-shaped blade of energy) animating over 3 frames, left to right. There is NO character, NO weapon, NO ground — only the wave.

It was thrown from a greatsword as tall as its wielder, so it is BIG and HEAVY — a wall of edge, not a thin flick. It travels to the RIGHT; the game mirrors it in code when it needs to go the other way.

The 3 cells, in this exact order:

Cell 1 — the wave just released. A tall vertical crescent, thick and solid, its concave side facing LEFT (back toward the caster). Sharp bright edges, a dithered core.
Cell 2 — the wave in flight. The same crescent, now stretched slightly along its travel direction and with two or three straight speed lines trailing behind it on the left. Thinner than frame 1 but still solid.
Cell 3 — the wave breaking apart. The crescent has split into three or four separate shards drifting apart, the trailing lines gone, most of the shape already empty.

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
- The crescent is TALLER THAN IT IS WIDE — it is a vertical blade of energy flying sideways, like a thrown scythe blade seen edge-on.
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
{ "file": "<§E-2 파일명>", "name": "knightgirl_wave", "expect": [3, 1],
  "labels": ["wave_1", "wave_2", "wave_3"] }
```
