# 아녜스 — 재를 뿌리는 사제

← [색인으로](../CHARACTER_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-char.py`.
고치려면 생성기의 `CHARS` 를 고치세요.

| | |
|---|---|
| id | `nun` |
| 등급·역할 | 보조 · 근접 · S등급 |
| 고유장비 | 잿빛 종 향로 |
| 파티에서 하는 일 | 파티 전체의 공격을 올린다. 혼자서는 아무것도 못 한다. |

> 다치는 건 상관없어요. 혼자 다치지만 않으면.

여섯 장이 필요합니다. **§A 를 먼저 뽑고**, 사람이 나오는 나머지에 그걸
레퍼런스로 첨부하세요 (캐릭터가 안 나오는 순수 이펙트 시트는 예외입니다).

| | 무엇 | 모델 | 어디에 쓰이나 |
|---|---|---|---|
| §A | 전투 8프레임 | Gemini | 홈 전투에서 실제로 넘어가는 그림 |
| §B | 흉상 | Gemini | 파티 칸 · 모집 결과 · 도감 |
| §C | 2D 일러스트 | GPT | 감상용 한 장 |
| §D | 휘두르기 3프레임 | Gemini | 평타. 칠 때 이 셋이 돈다 |
| §E | 스킬 — 기도 3 + 회복 빛 3 | Gemini | 자주 나가는 첫 기술 |
| §F | 두 번째 기술 — 정화 3프레임 | Gemini | 코스트가 비싼 기술. 첫 기술과 몸짓이 달라야 한다 |

---

## 잠금 문장 (LOCK)

아래 세 프롬프트에 **이미 들어 있습니다.** 따로 복사할 일은 없고, 사람이 읽을
용도로 둡니다. **고치지 마세요** — 다듬는 순간 그 장만 다른 사람이 됩니다.

```
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.
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
| | 대기 | 끌어올림 | 휘두름 | 되돌아옴 | 피격 | 휘청 | 승리 | 패배 |
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
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.

The 8 cells, in this exact order. Each cell shows her WHOLE body from head to feet, at a consistent height — the ground she stands on is implied and is NEVER drawn:

Cell 1 — standing at rest, calm and composed. Weight settled, head slightly bowed, eyes ahead and steady.
  THE CENSER HANGS STRAIGHT DOWN in front of her at about knee height, its chain held in both hands at her waist, perfectly still. A thin wisp of smoke rises from it. This is the pose she holds most of the time, and it should read as prayer rather than readiness — she is the calmest figure on the field.
Cell 2 — drawing back. Torso turned away from the target, both hands lifted to her far shoulder, the chain taut.
  THE CENSER IS PULLED BACK AND UP behind that shoulder, hanging close to her back, NOT swinging out into open space. It glows brighter as she gathers — the light lives inside the censer at this point, not around her.
Cell 3 — the swing through. Both hands driving forward and down past her front hip, chain snapped taut and straight.
  THE CENSER ENDS LOW, down-forward at about 45 degrees, at knee height in front of her. A BURST OF LIGHT breaks out of it here — a compact starburst around the censer with two short streaks trailing back along the path it swept. The light is the attack; the metal is just what carries it.
Cell 4 — the censer swinging back toward her. Shoulders squaring, weight settling onto the rear foot, hands drawing the chain in.
  THE CENSER HANGS ALONGSIDE HER at knee height, close to her rear heel, chain slack and looping. The light has died back to a faint glow inside it. The most compact frame of the four.
Cell 5 — taking a hit. Head snapped back, torso recoiled, one foot skidding. The chain has gone slack and the censer swings loose and low across her body, its light guttering out. One hand has come off the chain.
Cell 6 — staggering. Down on one knee, both hands pressed to the ground with the censer lying beside them, its lid fallen open and the last of the light spilling out across the floor. Head bowed, hair fallen across the face. Still up, barely.
Cell 7 — victory — but quiet. Facing the viewer square-on, feet together rather than planted wide, head slightly bowed, eyes closed, a small calm smile.
  THE CENSER IS HELD IN BOTH HANDS AT CHEST HEIGHT, chain gathered, glowing steadily. NOT raised overhead and NOT thrust forward. She is not celebrating; she is giving thanks, and that difference is the whole character.
Cell 8 — defeated. Down on one knee, head bowed, both hands folded over the censer resting on her raised knee, its light nearly out. Side-on, facing right.

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

THE ONE RULE THAT PREVENTS THIS: **the chain is SHORT — about a forearm's length.**
The censer swings at the end of it, so at full extension the whole weapon reaches
roughly from her shoulder to her knee and no further.

This is deliberate. A long chain whipping out at full stretch is unpredictable in
length and direction, and that is exactly how a cell gets clipped. Read the eight
poses again: the censer is always within one forearm of her hands, and the chain is
taut or coiled, never streaming across open space.

The light it sheds is also contained — a glow around the censer and a short trail
behind it, never a beam crossing the cell.

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
{ "file": "<§A 파일명>", "name": "nun", "expect": [4, 2],
  "labels": ["guard", "windup", "strike", "recover", "hit", "stagger", "win", "lose"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `Fighter` 는 이미 `set={ch.id}` 로
그리고 있고, 폴더가 없는 사람만 `fallbackSet="duel"` 로 떨어집니다 —
**`assets/sprites/nun/` 가 생기는 순간 이 사람만 제 그림으로 바뀝니다.**
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
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.

THIS IMAGE: Eyes lowered, head slightly bowed, a calm closed mouth — then, because the viewer is close, one eye lifted to meet them. The veil, its pin on her LEFT side, the scapular and the throat pendant are all in frame, and the censer chain crosses the bottom of the frame in her right hand.

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

받으면 `assets/sprites/avatar/nun.png` 로 넣으세요 (슬라이서를 안 태웁니다).

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
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.

THE SCENE:
A burnt-out chapel, roof gone, open to a grey sky. Ash lies over the pews like snow and drifts in the air. She walks up the centre aisle away from the viewer, half-turned to look back over her shoulder, swinging the censer at her side so that a bright arc of light hangs in the ash behind her. Everything is grey except that arc.

MOOD: Gentle and slightly frightening at once. She is the only source of light in a building that burned, and the picture should not settle on whether she is consoling it or finishing it.

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
TOP: the missing roof — open grey sky between broken rafters, with ash drifting up into it. This band is the brightest thing in the picture apart from the censer arc, and it is empty on purpose.
MIDDLE: her, walking away up the aisle, half-turned to look back over her shoulder at the viewer. Behind and beside her the swung censer leaves ONE bright arc hanging in the ash — the only white in the frame. The censer chain hangs vertically from her hand.
BOTTOM: THE AISLE COMES TOWARD THE VIEWER. It runs from her feet down and out of the bottom edge, widening as it comes, with burnt pews flanking it — nearest ones large and cut by the frame, far ones small. Ash lies over them like snow.

CHARACTER CONSISTENCY — if a reference image is attached, match it exactly. Treat the written description above as a checklist against that reference, not as licence to redesign. Keep every asymmetric detail on the stated side: the veil is pinned back on her LEFT side only, and the censer chain is wound around her RIGHT hand.

OUTPUT: one finished illustration, 9:16 PORTRAIT — a tall phone wallpaper, at least 1242 x 2208. It must be taller than it is wide. No grid, no panels, no text anywhere in the image.
```

받으면 `assets/wallpaper/nun.jpg` 로 **덮어쓰세요** (가로판을 대신합니다).
**1-bit 로 만들면 안 됩니다.**

---

## §D. 휘두르기 3프레임 (Gemini)

**향로를 한 번 휘두르는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup →
strike → recover` 셋을 대신합니다.

**날붙이가 아닙니다.** 사슬 끝에 매달린 작은 쇠그릇이고, 닿는 것은 쇠가 아니라
거기서 터져 나오는 **빛**입니다. 그래서 이 시트에서 제일 크고 밝게 그려야 하는
것은 향로가 아니라 빛입니다 — 향로 자체는 손보다 작아도 됩니다.

빛은 프레임마다 다릅니다 — 1번엔 향로 **안에** 갇혀 있고, **2번에 터지고**,
3번엔 알갱이로 흩어집니다.

**§A 를 레퍼런스로 첨부하세요.** 같은 사람이어야 합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 모음 | 2 터뜨림 | 3 흩어짐 |
| id | `cut_1` | `cut_2` | `cut_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character swinging a chained censer forward, left to right. The character IS in every cell — this is not an effect-only sheet.

THE CHARACTER (this exact person in all 3 cells):
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.

THIS IS NOT A BLADE. The censer is a small metal vessel on a short chain. She does not cut with it — she swings it forward and the LIGHT that breaks out of it is what lands. Draw the light as the loudest thing in the sheet and the metal as almost incidental.

THE LIGHT IS DRAWN INTO THESE FRAMES, not supplied separately: gathered inside the censer in cell 1, bursting out of it in cell 2, and scattered into drifting motes in cell 3.

The 3 cells, in this exact order:

Cell 1 — gathering. Torso turned away, both hands lifted to her far shoulder, chain taut, the censer pulled back and up behind that shoulder. It glows hard and white from INSIDE — the light is contained, nothing has escaped yet. Her eyes are closed.
Cell 2 — the swing through. Both hands driving forward and down past her front hip, chain snapped straight, the censer down-forward at about 45 degrees at knee height.
  A BOLD STARBURST OF LIGHT breaks out of the censer, with a broad white crescent trailing back along the path it swept. This is the frame the player sees land, so the light must be the boldest thing in the sheet — bigger than the censer itself, bigger than her hands.
Cell 3 — the follow-through. The censer has swung out to hang low in front of her, chain slack, her hands opening. She is watching where the light went.
  The burst has broken into six or seven separate motes drifting apart and fading, the crescent gone.

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
- The light is part of the drawing, and it is the BIGGEST part. It must stay inside its cell exactly like the censer does.
- Cell 2 is the widest and brightest. Size the whole sheet from that one, then draw the other two at the same scale.
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
{ "file": "<§D 파일명>", "name": "nun", "expect": [3, 1], "append": true,
  "labels": ["cut_1", "cut_2", "cut_3"] }
```

⚠ `"append": true` 가 꼭 필요합니다. §A 와 **같은 폴더**(`nun`)에 넣는 것이라,
없으면 §A 로 만든 여덟 장을 지우고 이 넷만 남깁니다.

---

## §E. 스킬 — 기도 + 회복 빛 (Gemini)

네 번째 공격마다 평타 대신 나갑니다 (`SKILL_EVERY`).

**이 기술만 적을 안 때립니다.** 아군 전원의 체력을 채웁니다
(`core/chars` 의 `SKILLS.heal`). 보조 캐릭터의 기술이 결국 약한 공격이면 보조를
넣을 이유가 없어서, 넷 중 한 자리를 쓰는 값이 분명하도록 회복으로 잡았습니다.

그래서 **때리는 그림이면 안 됩니다.** 휘두르는 동작도, 속도선도, 터지는 것도
없습니다. 한눈에 달라 보이는 지점은 **무릎**입니다 — 평타는 서서 휘두르고,
스킬은 무릎을 꿇습니다. 그리고 오른쪽이 아니라 **정면**을 봅니다.

**두 장으로 나눕니다.** 회복 빛은 그녀가 아니라 **회복받는 사람 위에** 그려지는
것이라, 처음부터 몸과 따로 있어야 합니다.

### §E-1. 기도 3프레임 (캐릭터)

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 무릎 꿇음 | 2 기도 | 3 일어섬 |
| id | `sk_1` | `sk_2` | `sk_3` |

**§A 를 레퍼런스로 첨부하세요.**

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character KNEELING IN PRAYER and releasing a soft bloom of healing light, left to right. The character IS in every cell.

THE CHARACTER (this exact person in all 3 cells):
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.

SHE IS NOT ATTACKING. This is the one skill in the game that does no damage — it heals her allies. Nothing here may look like a blow: no swing, no thrust, no impact, no speed lines anywhere in the sheet.

THE GIVEAWAY IS THAT SHE KNEELS. Her normal attack is a standing swing; here she goes down on one knee, sets the censer on the ground in front of her, and folds her hands. She faces the VIEWER, not the right.

The 3 cells, in this exact order:

Cell 1 — going down. She has dropped onto her right knee, facing the viewer square-on, skirts of the habit pooling around her, and set the censer on the ground just in front of her knee. Hands coming together at her chest, head bowing, eyes closing. The censer glows faintly. NO light around her yet.
Cell 2 — the prayer. Same kneeling pose exactly — she does not move — hands now fully folded at her chest, head bowed low over them, eyes closed.
  LIGHT BLOOMS UPWARD AND OUTWARD FROM THE CENSER around her: a soft wide dome of dithered brightness rising past her shoulders, with eight or ten small motes drifting UP out of it. The light is gentle and rising — it must not read as an explosion. Her veil and the hem of the habit lift slightly in it.
Cell 3 — rising. She is coming back up onto her feet, one hand lifting the censer by its chain, the other still at her chest, head coming up and eyes opening. Calm.
  The dome has thinned to a faint ring at her feet and a few last motes still drifting up past her shoulders.

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
- Cell 2 is the widest and brightest — the dome spreads on BOTH sides of her. Size the whole sheet from it.
- She is KNEELING in cells 1 and 2, so her head sits noticeably LOWER than in any other sheet. That drop is the pose reading; do not scale her up to fill the space.
- She is in the MIDDLE of her cell, facing the viewer, in all three cells. She does not travel and she does not turn.
- NO speed lines and NO sharp radiating spikes anywhere. Every edge of the light is soft-shaped (still 1-bit dithered, but rounded, not spiked).
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
{ "file": "<§E-1 파일명>", "name": "nun", "expect": [3, 1], "append": true,
  "labels": ["sk_1", "sk_2", "sk_3"] }
```

⚠ 여기도 `"append": true` 가 필요합니다 — §A·§D 와 같은 폴더입니다.


### §E-2. 회복 빛 3프레임 (이펙트)

캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**이건 적에게 날아가지 않습니다.** 아군 한 명을 감싸고 위로 피어올랐다
사라집니다. 그래서 옆으로 지나가는 초승달이 아니라 **세로로 선 부드러운 덩어리**
이고, 뾰족한 것이 하나도 없어야 합니다 — 뾰족하면 피해로 읽힙니다.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 감쌈 | 2 피어오름 | 3 사라짐 |
| id | `wave_1` | `wave_2` | `wave_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: 3 cells. A gentle bloom of healing light rising and fading, animating over 3 frames, left to right. There is NO character, NO object, NO ground — only the light.

This effect is drawn OVER AN ALLY, not thrown at an enemy. It does not travel anywhere: it appears around someone, rises, and fades. Nothing about it may read as an impact.

The 3 cells, in this exact order:

Cell 1 — the light appearing. A soft upright oval of dithered brightness filling the middle of the cell, densest at the BOTTOM and thinning toward the top, with four or five small motes just starting to lift out of it. Rounded edges — no spikes, no rays.
Cell 2 — the light rising. The oval has lifted and stretched taller, its dense base thinning out, and eight or ten motes are now spread up through and above it, the higher ones smaller. Airier than frame 1.
Cell 3 — the light going. The oval is gone; only six or seven motes remain, strung up the upper half of the cell and fading. Most of the cell is empty.

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
- It RISES. Frame 1 is heaviest at the bottom, frame 3 is only motes near the top. Read the three frames bottom-to-top, not left-to-right.
- ROUNDED SHAPES ONLY. No spikes, no rays, no straight lines, no crescent. A spiky version of this reads as damage, which is exactly wrong.
- It is TALLER THAN IT IS WIDE and centred in its cell — it wraps a person standing there.
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
{ "file": "<§E-2 파일명>", "name": "nun_wave", "expect": [3, 1],
  "labels": ["wave_1", "wave_2", "wave_3"] }
```


---

## §F. 두 번째 기술 — 정화 3프레임 (Gemini)

**§E 는 무릎을 꿇고 이건 서 있습니다.** 기도는 주저앉아 멈추는 기술이고,
정화는 서서 향로를 **머리 위로** 드는 기술입니다. 그 둘이 54px 에서 갈리는
것은 "앉았나 섰나" 하나뿐입니다.

향로가 머리 위로 올라가야 합니다. §E 에서는 몸 앞 낮은 데 있습니다.

걷혀 올라가는 조각은 **안 그립니다.** 그건 걷힌 **아군 몸**에서 나고, 화면이
도형으로 그립니다 (`screens/home/SkillFx` 의 `cleanse`).

### 왜 칸을 따로 받나

넷이 기술을 하나씩 가지던 때는 `sk_1..3` 한 벌이면 됐습니다. 이제 **둘씩**
가지는데, 같은 칸을 쓰면 코스트 15~20 짜리 기술이 4~5 짜리와 화면에서
똑같아 보입니다.

아직 안 들어온 동안에는 §E 칸으로 떨어지므로 게임은 그대로 돌아갑니다
(`screens/home/Fighter` 의 `skFramesOf`) — 도착하는 순간 저절로 바뀝니다.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 거둠 | 2 들어올림 | 3 내림 |
| id | `sk2_1` | `sk2_2` | `sk2_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character RAISING the censer and holding it up. She stands throughout and she does not kneel.

A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — when she does look up it is direct and it lands.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point swinging at the end of a short chain. Almost all of her is one dark shape with a single moving spark. That is how she is recognised at 54 pixels.

The 3 cells, in this exact order:

Cell 1 — drawing in. She stands upright and has pulled the censer in against her chest with both hands cupped around it, head bowed over it, elbows tucked. The chain hangs straight down and is still. Compact and closed.
Cell 2 — raising it. Standing, she has lifted the censer straight UP above her head at the full stretch of one arm, the other arm held out and open to the side, head tilted back to look up at it. The chain hangs vertically below the censer. Her robe and veil are lifted by the rise.
  This is the TALLEST cell of the sheet, and her arm is the only thing above her head.
Cell 3 — lowering. The censer has come back down to shoulder height, still in one hand, the chain swinging slightly. Her head is level and she is looking ahead, not at the censer. Her other hand is lowered and open, palm forward.

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
- SHE STANDS IN ALL THREE CELLS. The §E sheet has her kneeling with her head bowed; if she kneels here the two read the same.
- The censer goes UP, above her head. In §E it stays low in front of her.
- Her body fills about 56% of the cell height. Cell 2 is the tallest — size the sheet from it, and leave room above her raised hand.
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
{ "file": "<§F 파일명>", "name": "nun", "expect": [3, 1], "append": true,
  "labels": ["sk2_1", "sk2_2", "sk2_3"] }
```

`append` 입니다 — 같은 폴더에 **덧붙입니다.** 빼면 §A 여덟 칸이 지워집니다.
