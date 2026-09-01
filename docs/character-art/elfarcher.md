# 리안느 — 숲의 마지막 활

← [색인으로](../CHARACTER_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-char.py`.
고치려면 생성기의 `CHARS` 를 고치세요.

| | |
|---|---|
| id | `elfarcher` |
| 등급·역할 | 공격 · 원거리 · A등급 |
| 고유장비 | 마른가지 곡궁 |
| 파티에서 하는 일 | 뒤에서 쏜다. 앞이 버텨 주는 동안만 제 몫을 한다. |

> 나무는 다 베어 갔어. 활은 아직 여기 있고.

여섯 장이 필요합니다. **§A 를 먼저 뽑고**, 사람이 나오는 나머지에 그걸
레퍼런스로 첨부하세요 (캐릭터가 안 나오는 순수 이펙트 시트는 예외입니다).

| | 무엇 | 모델 | 어디에 쓰이나 |
|---|---|---|---|
| §A | 전투 8프레임 | Gemini | 홈 전투에서 실제로 넘어가는 그림 |
| §B | 흉상 | Gemini | 파티 칸 · 모집 결과 · 도감 |
| §C | 2D 일러스트 | GPT | 감상용 한 장 |
| §D | 쏘기 3프레임 | Gemini | 평타. 칠 때 이 셋이 돈다 |
| §D-2 | 화살 | Gemini | 평타로 날아가는 것 (캐릭터 없음) |
| §E | 스킬 — 화살비 3 | Gemini | 자주 나가는 첫 기술 |
| §F | 두 번째 기술 — 광란 3프레임 | Gemini | 코스트가 비싼 기술. 첫 기술과 몸짓이 달라야 한다 |

---

## 잠금 문장 (LOCK)

아래 세 프롬프트에 **이미 들어 있습니다.** 따로 복사할 일은 없고, 사람이 읽을
용도로 둡니다. **고치지 마세요** — 다듬는 순간 그 장만 다른 사람이 됩니다.

```
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.
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
| | 대기 | 당김 | 쏨 | 재장전 | 피격 | 휘청 | 승리 | 패배 |
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
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.

The 8 cells, in this exact order. Each cell shows her WHOLE body from head to feet, at a consistent height — the ground she stands on is implied and is NEVER drawn:

Cell 1 — standing at rest and watching. Weight settled on both feet, head level, eyes ahead.
  THE BOW HANGS LOW IN HER LEFT HAND at her side, held by the grip, string slack, the whole bow angled slightly forward and down. Her right hand rests near the quiver at her hip. NO arrow nocked. This is the pose she holds most of the time — alert but unhurried.
Cell 2 — at full draw. Body turned side-on, front arm straight and steady holding the bow canted about 30 degrees off vertical, drawing hand back at her cheek, the nocked arrow running along her jawline.
  This is where the power is — the whole frame should read as held tension. Fletching against her cheek, string bent to a sharp angle, front shoulder locked.
Cell 3 — the loose. Everything is nearly identical to the previous frame EXCEPT: the string has snapped forward straight, the drawing hand has opened and flicked back past her ear, and the arrow has just left.
  THE ARROW IS A SHORT WHITE STREAK in front of the bow, about a third of the cell wide, already clear of the bow but still well inside the cell. Do NOT run it off the edge. Two short speed lines behind it.
  Her body barely moves. An archer at the moment of release is the stillest thing on the field, and that stillness is what makes the arrow read as fast.
Cell 4 — reaching for the next arrow. The bow arm has dropped to about waist height, still holding the bow, while her right hand reaches back over her shoulder or down to the quiver at her hip and has just closed on a shaft.
  Weight shifting back onto the rear foot. The most compact of the four.
Cell 5 — taking a hit. Head snapped back, torso recoiled, one foot skidding. The bow arm flung out and down, string slack, and the arrow she was holding tumbling loose in the air beside her.
Cell 6 — staggering. Down on one knee with the bow braced on the ground like a walking stick, taking her weight through her front arm. Other hand pressed to her side, head down, hair fallen across the face. Still up, barely.
Cell 7 — victory. Facing the viewer square-on rather than to the side, feet planted, chin up.
  THE BOW IS HELD ACROSS THE FRONT OF HER BODY at chest height in her left hand, and her right hand holds a single arrow upright beside her face, pinched between two fingers. NOT raised overhead — nothing goes above the top of her head.
Cell 8 — defeated. Down on one knee, head bowed, the bow lying flat on the ground in front of her with one hand resting on it. Side-on, facing right.

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

THE ONE RULE THAT PREVENTS THIS: **her bow is SHORT — about half her height, from
her chin to her hip when stood on end.** It is a compact recurve, not a longbow.

This is deliberate. A bow as tall as the archer must be drawn vertically, and a
vertical line that long is the single most reliable way to lose the top of a cell.
A short recurve fits inside her own outline in every pose here.

Nothing else extends far either — read the eight poses again. The bow is held close,
the drawn arrow lies along her cheek, and the loosed arrow is a SHORT streak that
stops well inside the cell. She never holds the bow out at arm's length above her.

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
{ "file": "<§A 파일명>", "name": "elfarcher", "expect": [4, 2],
  "labels": ["guard", "windup", "strike", "recover", "hit", "stagger", "win", "lose"] }
```

받으면 `python tools/slice.py` 를 돌리세요. `Fighter` 는 이미 `set={ch.id}` 로
그리고 있고, 폴더가 없는 사람만 `fallbackSet="duel"` 로 떨어집니다 —
**`assets/sprites/elfarcher/` 가 생기는 순간 이 사람만 제 그림으로 바뀝니다.**
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
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.

THIS IMAGE: Head turned slightly, looking past the viewer rather than at them, as if she has heard something. Mouth closed, brows level. Both long ears in frame and the ponytail visible over one shoulder. The bracer on her LEFT forearm shows at the bottom of the frame as she raises that hand near her chin.

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

받으면 `assets/sprites/avatar/elfarcher.png` 로 넣으세요 (슬라이서를 안 태웁니다).

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
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.

THE SCENE:
A cleared hillside where a forest used to be. Rows of cut stumps run away into mist, and a few tall trees are still standing at the very back. She stands among the stumps with the bow held loose at her side, an arrow between her fingers but not nocked, looking back at the standing trees. Low sun rakes across the stumps and throws a long grid of shadows.

MOOD: Still and unsentimental. Not grief and not defiance — she is counting what is left. The empty ground should take up more of the picture than she does.

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
TOP: the few surviving tall trees, small and pale in mist at the top of the frame, with the low sun behind them. Nothing else — this band is what she is looking at.
MIDDLE: her, standing among the stumps, bow held loose at her side and turned to look back and up toward the trees. THE BOW STANDS UPRIGHT beside her, running from the middle band down into the bottom one.
BOTTOM: THE STUMPS COME TOWARD THE VIEWER, not across. Rows of cut stumps recede UP the frame from the bottom edge, smallest and mistiest near her feet, largest and sharpest at the very bottom where one is cut by the frame edge. Their shadows all reach DOWN toward the viewer and lengthen as they come. The empty ground takes more of the picture than she does.

CHARACTER CONSISTENCY — if a reference image is attached, match it exactly. Treat the written description above as a checklist against that reference, not as licence to redesign. Keep every asymmetric detail on the stated side: she holds the bow in her LEFT hand and draws with her RIGHT in every frame, and the quiver rides on her RIGHT hip.

OUTPUT: one finished illustration, 9:16 PORTRAIT — a tall phone wallpaper, at least 1242 x 2208. It must be taller than it is wide. No grid, no panels, no text anywhere in the image.
```

받으면 `assets/wallpaper/elfarcher.jpg` 로 **덮어쓰세요** (가로판을 대신합니다).
**1-bit 로 만들면 안 됩니다.**

---

## §D. 쏘기 3프레임 (Gemini)

**화살 한 대를 쏘는 동작**을 세 칸으로 쪼갠 것입니다. §A 의 `windup → strike →
recover` 셋을 대신합니다.

**앞의 근접 캐릭터들과 근본이 다릅니다.** 베는 캐릭터는 때리는 순간 몸이 제일
크게 움직이는데, 활잡이는 반대입니다 — 놓는 순간이 제일 조용합니다. 움직이는
것은 시위와 놓는 손, 그리고 화살뿐입니다.

그래서 세 칸의 실루엣이 거의 같습니다. 그게 맞습니다. 이걸 "밋밋하다" 고 여겨
몸을 크게 흔들면 활잡이가 아니라 칼잡이가 됩니다.

**날아가는 화살은 여기 없습니다.** §D-2 로 따로 받아서 게임이 움직입니다.
여기에도 그리면 화면에 화살이 둘 나오고, 그 중 하나는 손에 붙어 안 움직입니다.

시위에 걸린 화살은 1번 칸에만 있습니다. 쏘고 나면 손이 빕니다 — **곧게 펴진
시위와 벌어진 손가락**이 쐈다는 것을 말합니다.

**§A 를 레퍼런스로 첨부하세요.** 같은 사람이어야 합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 당김 | 2 놓음 | 3 잔상 |
| id | `cut_1` | `cut_2` | `cut_3` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character firing ONE arrow from a short recurve bow, left to right. The character IS in every cell — this is not an effect-only sheet.

THE CHARACTER (this exact person in all 3 cells):
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.

THIS IS A SHOT, NOT A SWING. Almost nothing about her body moves between the three cells — the change is in the STRING, the DRAWING HAND, and the ARROW. Do not turn this into a melee animation.

DO NOT DRAW THE FLYING ARROW. The arrow that leaves the bow comes from a SEPARATE sheet and the game moves it across the screen — drawing it here too would put two arrows on screen at once, one of them stuck to her hands.

The only arrow in this sheet is the one still ON THE STRING in cell 1. After the release her hands are empty. What sells the shot is the STRING snapping straight and the drawing hand flying open, not a projectile.

WHAT AN ARROW LOOKS LIKE — READ THIS BEFORE DRAWING ANY OF IT.

The word "arrow" here always means a PHYSICAL PROJECTILE, never a symbol. Every
arrow in this sheet has all three parts, and all three must be visible:

- SHAFT: a long thin straight rod. This is most of the arrow.
- HEAD: a small narrow point at the FRONT. It is barely wider than the shaft —
  a slim leaf or a thin spike, not a big triangle.
- FLETCHING: two or three short angled vanes at the BACK end, like a small feather
  split down the middle. THIS IS THE PART THAT PROVES IT IS AN ARROW. An arrow
  drawn without fletching turns into a symbol.

NEVER DRAW AN ARROW SYMBOL. No navigation arrow, no cursor, no pointer, no chevron,
no dart, no triangle on a line, no "→". No UI glyph of any kind. If the shape you
are about to draw would work as a button icon meaning "next", it is wrong.

A useful test: an arrow seen in flight is mostly EMPTY SPACE and ONE LONG THIN LINE,
with a tiny point at one end and a small ragged feather at the other. The point is
the smallest part of the drawing, not the biggest.

The 3 cells, in this exact order:

Cell 1 — at full draw and holding. Side-on, front arm straight, bow canted about 30 degrees off vertical, drawing hand at her cheek, string bent sharp. The nocked arrow lies along her jawline with its FLETCHING right at her cheek and its point resting on the bow — the whole shaft is visible against her face. Nothing has been released. The frame should feel like held breath.
Cell 2 — the release. Same stance, but THE STRING HAS SNAPPED FORWARD STRAIGHT, the drawing hand has flown open past her ear with the fingers spread, and her front shoulder has taken the recoil. Her hair and the feather in it kick from the snap.
  NO ARROW ANYWHERE. Her hands are empty and the air in front of the bow is empty black. This is the frame the player sees land, and it lands because the string is straight and her hand is open — nothing else is needed.
Cell 3 — the follow-through. Her drawing hand is still back near her ear, fingers open, and the bow has begun to drop. She is watching where the shot went.
  Still NO ARROW. The string is settling, slightly slack. The cell is her and the bow and nothing else.

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
- There is NO flying arrow in this sheet and no speed lines in the air. Empty black in front of the bow is correct.
- All three cells are nearly the same width, because she barely moves. Size the sheet from cell 1, which is the widest at full draw.
- Her body fills about 55% of the cell height. She stands slightly LEFT of centre because she shoots to the RIGHT.
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
{ "file": "<§D 파일명>", "name": "elfarcher", "expect": [3, 1], "append": true,
  "labels": ["cut_1", "cut_2", "cut_3"] }
```

⚠ `"append": true` 가 꼭 필요합니다. §A 와 **같은 폴더**(`elfarcher`)에 넣는 것이라,
없으면 §A 로 만든 여덟 장을 지우고 이 넷만 남깁니다.

---

## §D-2. 화살 (Gemini)

캐릭터가 없는 순수 이펙트입니다. §A 를 첨부할 필요가 없습니다.

**평타로 쏘는 화살입니다.** §D 에서는 안 그리고 여기서 따로 받습니다 — 화살은
몸을 떠나 화면을 가로질러야 하는데, 캐릭터 그림에 같이 그리면 손에 묶여서 못
움직입니다. 검기(`SwordWave`)와 같은 구조입니다.

게임은 **1번 칸만 씁니다.** 40px 로 줄여도 홀로 "화살" 로 읽혀야 하므로, 자루는
굵고 깃은 뭉툭한 두 덩이로 그리세요.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 날아감 | 2 지나감 | 3 사라짐 |
| id | `shot_1` | `shot_2` | `shot_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: 3 cells. ONE arrow in flight, animating over 3 frames, left to right. There is NO character, NO bow, NO ground — only the arrow.

It was loosed flat from a short recurve bow and is crossing the field. It travels to the RIGHT; the game mirrors it in code when it needs to go the other way.

This is the sheet that carries every normal shot she fires, so it has to read as an arrow at 40 pixels wide, alone, with nothing around it.

WHAT AN ARROW LOOKS LIKE — READ THIS BEFORE DRAWING ANY OF IT.

The word "arrow" here always means a PHYSICAL PROJECTILE, never a symbol. Every
arrow in this sheet has all three parts, and all three must be visible:

- SHAFT: a long thin straight rod. This is most of the arrow.
- HEAD: a small narrow point at the FRONT. It is barely wider than the shaft —
  a slim leaf or a thin spike, not a big triangle.
- FLETCHING: two or three short angled vanes at the BACK end, like a small feather
  split down the middle. THIS IS THE PART THAT PROVES IT IS AN ARROW. An arrow
  drawn without fletching turns into a symbol.

NEVER DRAW AN ARROW SYMBOL. No navigation arrow, no cursor, no pointer, no chevron,
no dart, no triangle on a line, no "→". No UI glyph of any kind. If the shape you
are about to draw would work as a button icon meaning "next", it is wrong.

A useful test: an arrow seen in flight is mostly EMPTY SPACE and ONE LONG THIN LINE,
with a tiny point at one end and a small ragged feather at the other. The point is
the smallest part of the drawing, not the biggest.

The 3 cells, in this exact order:

Cell 1 — the arrow at full speed, drawn side-on and horizontal, filling most of the cell width. A long thick shaft, a small narrow point at the RIGHT end no wider than the shaft, and two short angled fletching vanes at the LEFT end. Three straight speed lines trail behind it on the left, thinner than the shaft and clearly separate from it. Solid and bright.
Cell 2 — the same arrow a moment later, identical in shape but with the speed lines longer and thinner and beginning to break into dashes. The shaft itself does not change — it is a solid object, not an effect.
Cell 3 — the arrow leaving. The shaft has thinned and broken into two or three dashes, the point and fletching nearly gone, the speed lines gone. Most of the cell is empty.

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

EFFECT SHEET RULES — this is one object crossing the screen.
- The 3 frames must READ AS ONE THING travelling and dying. Frame 1 is solid and bright, frame 3 is mostly gone.
- The arrow lies FLAT AND HORIZONTAL across the cell — it is WIDER THAN IT IS TALL. A vertical or diagonal arrow is a different sheet.
- The point is the SMALLEST part of the drawing. If it is a big triangle you have drawn a symbol.
- The fletching must survive at 40 pixels. Make it two chunky angled blocks, not fine feather strands.
- The arrow is centred in its cell and stays inside it. The game moves it across the screen; do not draw it partly off the edge.

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
{ "file": "<§D-2 파일명>", "name": "elfarcher_shot", "expect": [3, 1],
  "labels": ["shot_1", "shot_2", "shot_3"] }
```

이 한 장이 **이 캐릭터가 날리는 것 전부**입니다 — 평타로 쏘는 화살도, 스킬로
떨어지는 화살도 여기서 나옵니다 (`core/chars` 의 `projSet`).

---

## §E. 스킬 — 화살비 (Gemini)

네 번째 공격마다 평타 대신 나갑니다 (`SKILL_EVERY`).

평타(§D)가 **서서 앞으로 한 발**이라면 스킬은 **무릎 꿇고 하늘로**입니다.
겨누지 않습니다. 위로 쏘고, 화살은 딴 데 가서 후두두둑 떨어집니다.

한눈에 달라 보이는 지점이 둘입니다 — **무릎**과 **시선**. 세 칸 내내 한쪽
무릎을 땅에 대고 하늘을 올려다봅니다. 평타에서는 서서 오른쪽을 봅니다.
그렇게 가파르게 겨누려면 몸을 받쳐야 하고, 그게 무릎을 꿇는 이유입니다.

게임에서도 그렇게 굴러갑니다. 이 기술은 다섯 발이 **한 발씩 무작위로**
떨어집니다 (`core/chars` 의 `SKILLS.rain`). 어디에 떨어질지 그녀도 모르는
것이라, 겨누는 그림이면 안 됩니다.

**떨어지는 화살은 §D-2 를 그대로 씁니다.** 따로 뽑지 않습니다 — 화살은 어느
쪽으로 날든 같은 물건이고, 게임이 그 한 장을 여러 개 띄워 기울여 떨어뜨립니다.
그림을 두 벌 받으면 평타 화살과 스킬 화살이 미묘하게 달라져서, 같은 사람이
쏘는 것으로 안 보입니다.

그래서 이 시트에는 **떠나는 순간까지만** 그립니다. 하늘로 올라가는 세 대는
1·2번 칸에서 작아지며 사라지고, 그 뒤는 게임이 맡습니다.

### §E-1. 화살비 3프레임 (캐릭터)

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 무릎 꿇고 겨눔 | 2 놓음 | 3 올려다봄 |
| id | `sk_1` | `sk_2` | `sk_3` |

**§A 를 레퍼런스로 첨부하세요.**

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character firing a volley of arrows STRAIGHT UP INTO THE SKY, left to right. The character IS in every cell.

THE CHARACTER (this exact person in all 3 cells):
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.

SHE KNEELS AND SHOOTS AT THE SKY. Her normal attack is a flat shot taken standing; here she drops onto one knee, plants herself, and points the bow UP — so the arrows come down somewhere else entirely.

TWO GIVEAWAYS, BOTH VISIBLE IN EVERY CELL:
- SHE IS DOWN ON ONE KNEE. Right knee on the ground, left foot planted flat in front, body upright above them. Her head sits much lower in the cell than in any other sheet, and that drop is the pose reading.
- SHE IS LOOKING UP, not forward, and the bow is tilted up with her.

Kneeling is what lets her aim so steeply — she is bracing for a shot she cannot take standing. The bow still never goes above the top of her head; she tilts it up about 60 degrees, she does not hold it overhead.

WHAT AN ARROW LOOKS LIKE — READ THIS BEFORE DRAWING ANY OF IT.

The word "arrow" here always means a PHYSICAL PROJECTILE, never a symbol. Every
arrow in this sheet has all three parts, and all three must be visible:

- SHAFT: a long thin straight rod. This is most of the arrow.
- HEAD: a small narrow point at the FRONT. It is barely wider than the shaft —
  a slim leaf or a thin spike, not a big triangle.
- FLETCHING: two or three short angled vanes at the BACK end, like a small feather
  split down the middle. THIS IS THE PART THAT PROVES IT IS AN ARROW. An arrow
  drawn without fletching turns into a symbol.

NEVER DRAW AN ARROW SYMBOL. No navigation arrow, no cursor, no pointer, no chevron,
no dart, no triangle on a line, no "→". No UI glyph of any kind. If the shape you
are about to draw would work as a button icon meaning "next", it is wrong.

A useful test: an arrow seen in flight is mostly EMPTY SPACE and ONE LONG THIN LINE,
with a tiny point at one end and a small ragged feather at the other. The point is
the smallest part of the drawing, not the biggest.

The 3 cells, in this exact order:

Cell 1 — down on one knee at full draw, aimed UP. Right knee on the ground, left foot planted flat in front of her with that knee up, torso upright and squared toward the viewer rather than side-on. Bow arm raised so the bow points up and to the right at about 60 degrees, drawing hand at her cheek. Chin lifted, eyes on the sky. THREE ARROWS are laid across the string, spread apart like a fan — three separate shafts, three separate points, and three sets of fletching bunched together in her drawing hand. NO effect yet.
Cell 2 — the release. Still kneeling in exactly the same place — the knee does not lift — string snapped forward, drawing hand flung open past her ear, cloak and ponytail kicked by the snap. THREE ARROWS climb away steeply toward the UPPER RIGHT corner of the cell, each a thin shaft with a small point at its upper end and fletching at its lower end, each with one speed line behind it.
  They are already small and getting smaller — they are leaving, not passing by. They stop well inside the cell.
Cell 3 — watching them go, still on the knee. The bow has dropped to about chest height, still angled up, both arms relaxed, head tipped right back to follow them. The most still frame in the sheet.
  The arrows have LEFT THE CELL. Three thin broken dashes near the top right corner are all that is left of their path — no shafts, no points, no feathers.

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
- She KNEELS in all three cells, so her head sits noticeably LOWER than in any other sheet. Do not scale her up to fill the space that opens above her — that space is where the arrows go.
- Her knee is in exactly the same place in all three cells. She does not rise, and she does not travel.
- Nothing here reaches sideways, so the cells are TALL rather than wide. Cell 2 reaches highest — size the whole sheet from it.
- Kneeling, she fills about 45% of the cell height and sits LEFT of centre, because the arrows climb away to the upper right.
- The arrows END INSIDE the cell in cell 2. They are climbing out of the scene, but the drawing still stops at the border.
- Count the fletching. Three arrows means three little feathers. If they do not read at this size the arrows are drawn too small — make the shafts thicker and shorter rather than dropping the vanes.
- Her feet are in exactly the same place in all three cells — she is planted, not moving.
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
{ "file": "<§E-1 파일명>", "name": "elfarcher", "expect": [3, 1], "append": true,
  "labels": ["sk_1", "sk_2", "sk_3"] }
```

⚠ 여기도 `"append": true` 가 필요합니다 — §A·§D 와 같은 폴더입니다.



---

## §F. 두 번째 기술 — 광란 3프레임 (Gemini)

**기를 모으는 동작입니다.** 쏘는 것도 터뜨리는 것도 아니고, 끌어모아서
참았다가 제 몸에 싣습니다.

## 아무것도 몸을 안 떠납니다

세 칸 어디에도 화살·빛·파동이 나가면 안 됩니다. 나가는 순간 화살비(§E)와
같은 종류의 기술이 되고, "5초간 제 공격속도가 두 배" 라는 것이 화면에서
사라집니다.

## 머리카락과 망토가 연출 전부입니다

흑백 2색에는 오라도 광채도 없습니다. 보이지 않는 힘을 그리는 방법은 **거기
휩쓸리는 것**을 그리는 것뿐입니다 —

| 칸 | 머리카락·망토 |
|---|---|
| 1 끌어모음 | 손 쪽으로 **안으로** 딸려 온다 |
| 2 참음 | 어깨에서 **똑바로 위로** 떠 있다 |
| 3 실림 | 내려오는 중이다 |

2번 칸이 제일 높습니다. 머리 위로 뜬 머리카락이 들어갈 자리를 남기세요.

## §E 는 무릎 꿇고 이건 서 있습니다

화살비는 자리를 잡고 하늘로 쏘는 기술이고, 광란은 선 채로 제 몸을 조이는
기술입니다. 그 하나로 54px 에서 갈립니다.

속도선과 잔상은 **안 그립니다** — 화면이 도형으로 그립니다
(`screens/home/SkillFx` 의 `haste`).

### 왜 칸을 따로 받나

넷이 기술을 하나씩 가지던 때는 `sk_1..3` 한 벌이면 됐습니다. 이제 **둘씩**
가지는데, 같은 칸을 쓰면 코스트 15~20 짜리 기술이 4~5 짜리와 화면에서
똑같아 보입니다.

아직 안 들어온 동안에는 §E 칸으로 떨어지므로 게임은 그대로 돌아갑니다
(`screens/home/Fighter` 의 `skFramesOf`) — 도착하는 순간 저절로 바뀝니다.

| 셀 | 1 | 2 | 3 |
|---|---|---|---|
| | 1 끌어모음 | 2 참음 | 3 실림 |
| id | `sk2_1` | `sk2_2` | `sk2_3` |

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 3-frame animation of ONE single character GATHERING HERSELF — drawing power in, holding it, and letting it settle into her. She is not shooting anything and she stands throughout.

A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN in every frame. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere. That is how she is recognised at 54 pixels.

The 3 cells, in this exact order:

Cell 1 — drawing it in. She stands with feet planted and has brought BOTH hands in to her chest, one closed over the other, elbows tucked tight, shoulders rounded forward, head bowed over her hands. The bow is held vertically in the crook of her left arm, not being used. Her ponytail and half-cloak have been pulled INWARD and forward toward her hands, as if everything loose is being drawn to that one point. This is the NARROWEST and most closed cell.
Cell 2 — the hold. Still standing on the same spot, she has NOT opened yet — this is the cell where she is containing it. Her head has come UP and back, eyes closed, jaw set; her hands are still clasped at her chest but the arms are now RIGID and trembling-tight, elbows pushed down and out. Her back has arched slightly. Ponytail and cloak are lifting STRAIGHT UP off her shoulders, floating, no longer hanging.
  This is the TALLEST cell. Nothing has been released — the whole pose is a body holding something in.
Cell 3 — it has settled into her. She has come back to a shooting stance — side-on, bow now gripped upright in the left hand, right hand at the string but not drawing, weight forward on the front foot, chin down and eyes forward. Lower, tighter and more coiled than her §A idle. The hair and cloak are coming back down but have not settled yet.

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
- SHE STANDS IN ALL THREE CELLS and her feet never move. The §E sheet has her kneeling; if she kneels here the two skills read the same at 54 pixels.
- NOTHING LEAVES HER BODY in any cell. No arrow, no shot, no burst, no thrown light. What she gathers stays in her — that is the difference between this skill and every other one she has.
- No arrow is nocked in any cell.
- The HAIR AND CLOAK carry the whole effect: pulled inward in cell 1, floating straight up in cell 2, falling in cell 3. That is the only way to draw invisible force in two colours.
- Her body fills about 55% of the cell height. Cell 2 is the tallest — size the sheet from it and leave room above her head for the lifted hair.
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
{ "file": "<§F 파일명>", "name": "elfarcher", "expect": [3, 1], "append": true,
  "labels": ["sk2_1", "sk2_2", "sk2_3"] }
```

`append` 입니다 — 같은 폴더에 **덧붙입니다.** 빼면 §A 여덟 칸이 지워집니다.
