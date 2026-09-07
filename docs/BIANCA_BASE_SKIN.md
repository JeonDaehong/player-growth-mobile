# 비앙카 기본 스킨 — 선술집 점원

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

지금 게임에 있는 바니걸이 스킨이 되고, **이쪽이 기본**이 됩니다.

---

## 먼저: 몇 장이 필요한가

**요청 10번 · 그림 27장**입니다. 한 장에 다 담을 수가 없어서 시트로 나눕니다 —
칸 하나가 200px 인데 스물일곱 칸을 한 그림에 넣으면 얼굴이 안 그려집니다.

| § | 넣을 파일 | 칸 | 뽑히는 것 | 어디에 쓰나 |
|---|---|---|---|---|
| §1 | `base-guard.jpg` | **4×2** | `guard` `windup` `strike` `recover` `hit` `stagger` `win` `lose` | 전투 기본 여덟 자세 |
| §2 | `base-cut.jpg` | 3×1 | `cut_1..3` | 평타 |
| §3 | `base-sk.jpg` | 3×1 | `sk_1..3` | 강타 (뛰어들어 내리찍기) |
| §4 | `base-sk2.jpg` | 3×1 | `sk2_1..3` | 화산격 (발밑에 꽂기) |
| §5 | `base-sk3.jpg` | 3×1 | `sk3_1..3` | 불굴의 의지 (제 몸을 태우기) |
| §6 | `base-sk4.jpg` | 3×1 | `sk4_1..3` | 용암 지대 (횡으로 훑기) |
| §7 | `base-avatar.jpg` | 1장 | `avatar/bunnyaxe` | 파티 칸 · 모집 결과 · 도감 |
| §8 | `base-full.jpg` | 1장 (2:3) | `char_full/bunnyaxe` | 영웅 관리 전신 |
| §9 | `base-shy.jpg` | 1장 (2:3) | `char_shy/bunnyaxe` | 가슴을 눌렀을 때 |
| §10 | `base-pat.jpg` | 1장 (2:3) | `char_pat/bunnyaxe` | 머리를 쓰다듬을 때 |

### 안 만들어도 되는 것

**이펙트는 스킨을 안 탑니다.** 불기둥(`sfx_erupt`)도 부채꼴 불꽃(`sfx_lavafan`)도
사람이 아니라 불이라, 옷을 갈아입어도 같은 불입니다. 넷째 갈래의 폭발도
마찬가지입니다.

**스킬 로고(`skill_icon`)도 그대로입니다.** 기술이 바뀐 게 아니라 입은 옷이
바뀐 것이니까요.

---

## ⚠ 코드가 아직 스킨을 모릅니다

지금은 사람마다 그림이 **한 벌뿐**입니다 (`assets/sprites/bunnyaxe/` 와
`char_full/bunnyaxe.png` 따위). 코스튬 단추는 눌러도 "준비중" 입니다.

그래서 그림이 들어오면 이렇게 합니다.

1. 지금 바니걸 그림을 **`bunnyaxe_bunny/` 로 옮겨 둡니다** — 스킨 화면이
   생기는 날 쓸 것이라 지우면 안 됩니다
2. 새 그림이 `bunnyaxe/` 에 들어가 기본이 됩니다. 이 한 번으로 전투·파티·
   도감·영웅 관리가 전부 새 그림으로 바뀝니다
3. 고르는 화면은 나중에. 그때 `bunnyaxe` 와 `bunnyaxe_bunny` 중 하나를
   고르게 하면 됩니다

**순서가 이래야 하는 이유**: 스킨 체계를 먼저 만들면 고를 것이 하나뿐인
화면이 생깁니다. 그림이 두 벌 있고 나서 고르는 화면을 만드는 편이 낫습니다.

---

## 잠금 문장 (LOCK) — **이게 이 문서의 전부입니다**

아래 열 프롬프트에 **이미 들어 있습니다.** 따로 복사할 일은 없고, 사람이 읽을
용도로 둡니다. **고치지 마세요** — 다듬는 순간 그 장만 다른 사람이 됩니다.

```
A tall young woman working the floor of a tavern, carrying a battle axe she never puts down. She has the same grin she has always had: she knows exactly how absurd it is to take drink orders with that thing on her shoulder, and she likes it.
HEAD: a cloth kerchief tied over her hair, knotted at the back so that TWO SHORT STIFF KNOT-TAILS STAND UP from the crown. Under it her hair is short and choppy, cut around the jaw, with a blunt fringe. A few strands escape at the temples.
OUTFIT: a loose linen blouse with a wide neckline, worn under a laced bodice that ends at the ribs. A long heavy skirt to mid-calf. Over all of it a work apron tied at the waist, hanging straight down the front, ITS HEM STAINED AND SINGED. Thick stockings and flat working boots.
HER RIGHT SLEEVE IS ROLLED TO THE ELBOW AND HER LEFT ONLY TO THE FOREARM. That mismatch is hers and it stays in every frame.
A folded serving cloth is tucked through the apron string at her LEFT hip.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial. THIS IS THE SAME AXE SHE ALWAYS CARRIES — do not redesign it.
SILHOUETTE (protect this above all): the two stiff knot-tails standing up from the kerchief, the straight flat line of the apron, and the enormous slab-headed axe. Two little spikes, one straight plane, one huge block. That is how she is recognised at 54 pixels.
SHE IS EIGHT HEADS TALL, the tallest of the four. Hips at the exact vertical midpoint. NOT chibi, NOT stubby, NOT squat.
```

### 왜 이렇게 잡았나

**두건 매듭 둘이 토끼 귀 자리를 대신합니다.** 바니걸의 실루엣은 "귀 둘 + 마른
몸 + 거대한 도끼" 였고, 그중 귀가 이 스킨에서 사라집니다. 54px 에서 사람을
가르는 것은 **머리 위로 뻗은 것**이라, 그 자리를 비우면 옷만 다른 아무개가
됩니다. 매듭 둘은 귀보다 짧고 뻣뻣해서 헷갈리지도 않습니다.

**앞치마가 두 번째 표식입니다.** 바니걸은 몸이 드러나 실루엣이 잘록한데, 이쪽은
앞치마 때문에 앞면이 **평평한 한 판**입니다. 실루엣만 봐도 두 스킨이 갈립니다.

**소매 짝짝이가 찢어진 커프스 자리입니다.** 원래 왼쪽 커프스만 찢어져 있었는데,
그런 비대칭 하나가 "이 사람은 대충 산다" 를 말합니다. 없애면 단정해집니다.

**도끼는 절대 다시 그리지 않습니다.** 스킨이 갈려도 무기는 같아야 합니다 —
저게 이 캐릭터가 무엇을 하는 사람인지를 말하는 유일한 물건이고, 전투 그림에서
제일 큰 덩어리라 모양이 바뀌면 다른 사람이 됩니다.

---

## 열 장 모두에 들어가는 규칙

### 시트 규격 (§1~§6)

- 칸과 칸 사이를 **순수 마젠타(#FF00FF) 선**으로 가릅니다. 그 선만이 구분선이고
  바깥 테두리는 없습니다
- 칸 안은 **순수 검정 바탕**에 흰 그림 하나. 바닥선도 그림자도 안 그립니다
- **모든 칸에서 발이 같은 줄에 섭니다.** 칸마다 바닥이 오르내리면 재생할 때
  인물이 위아래로 들썩입니다
- **모든 칸에서 같은 크기**입니다. 칸마다 확대율이 다르면 휘두르는 동안 사람이
  커졌다 작아집니다

### 카메라 — **정측면이 아닙니다** (§1~§6)

바닥이 쿼터뷰 평면이라 (`Ground.tsx`), 인물도 **살짝 위에서 내려다본 각도**여야
합니다. 정측면으로 그리면 인물과 바닥이 서로 다른 세계에 있는 것처럼 보입니다.

그림은 **오른쪽을 봅니다.** 적이 그쪽에 섭니다.

### 서 있는 그림 (§8~§10) 은 규칙이 다릅니다

정면·눈높이·평평하게. 2:3 세로 한 장. 셋이 **같은 자리에서 오려집니다** —
자세한 이야기는 [CHAR_SHY_PROMPTS.md](CHAR_SHY_PROMPTS.md) 와
[CHAR_PAT_PROMPTS.md](CHAR_PAT_PROMPTS.md) 에 있고, 요점은 하나입니다:

> **세 장의 바깥 경계가 같아야 합니다.** 어느 한 장에서 팔이나 도끼가 더
> 멀리 뻗으면 셋을 다시 오려야 하고, 그러면 눌리는 자리 표까지 다시 재야
> 합니다. 지난번에 아녜스에서 실제로 났습니다.

### 1-bit 규칙 (열 장 전부)

```
STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF,
  plus the pure magenta of the divider lines where a sheet has them.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering.
- Chunky, clearly visible square pixels.
- Background: solid pure black and completely EMPTY. No floor, no cast shadow,
  no ground line, no glow, no sparkles.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera.

ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- This includes English, Korean, numerals, roman numerals, runes, and fake
  alien script.
- An image containing even one letter-like mark is a failed output.
```

---

# 프롬프트 열 장

각 장은 **[LOCK] 을 붙여서** 쓰세요. 아래 각 §에는 LOCK 이 들어갈 자리를
`[PASTE LOCK HERE]` 로 표시했습니다. §2 이후에는 **§1 에서 받은 시트를
레퍼런스로 첨부**하세요 — 그래야 열 장이 같은 사람이 됩니다.

---

## §1. 전투 여덟 자세 — `base-guard.jpg`

```
FRAME: ONE image containing a GRID OF EXACTLY 4 COLUMNS BY 2 ROWS = 8 CELLS.
Cells are separated by THIN LINES OF PURE MAGENTA (#FF00FF) and nothing else.
All eight cells are THE SAME SIZE. Output roughly 2048x1024.

[PASTE LOCK HERE]

CAMERA: a quarter view from slightly above, as if looking down at a floor that
recedes. NOT a flat side view. She faces RIGHT in every cell.
SHE IS THE SAME SIZE IN ALL EIGHT CELLS and HER FEET STAY ON THE SAME LINE.

THE EIGHT CELLS, left to right, top row then bottom row:

1. GUARD — resting. Weight even, axe held across the body at an angle, blade
   low. Alert but not braced. This is the pose she is in most of the time, so
   it has to read as "waiting", not "posing".
2. WINDUP — the axe swung up and back over her RIGHT shoulder, both hands on
   the haft, torso twisted away, weight on the back foot. Chin over the leading
   shoulder, eyes already on the target.
3. STRIKE — the axe brought DOWN and FORWARD, arms extended, the blade at about
   knee height in front of her. Front foot planted hard, back heel up. This is
   the cell people see; make it read at a glance.
4. RECOVER — the swing has bled out. Axe low and forward, arms loose, shoulders
   dropped, weight settling back toward centre. Not yet back at guard.
5. HIT — struck from the right. Head snapped back, upper body folded slightly,
   ONE HAND COMES OFF THE HAFT, one foot slid back. The axe head dips. Eyes
   screwed shut. Nothing dramatic — she gets hit a lot.
6. STAGGER — worse. Down on ONE KNEE, the axe planted head-down in the ground
   and both hands on the haft holding herself up. Head bowed, kerchief knots
   tipped forward. Still not letting go of the axe.
7. WIN — the axe up over one shoulder, her free hand raised, grinning wide,
   weight on one hip. The pose of someone who was never worried.
8. LOSE — down. Kneeling low, one hand flat on the ground, the axe fallen
   beside her with the haft across the frame. Head down, kerchief knots
   drooping. She is not sprawled out; she is folded up.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: each cell reads at about 200 pixels tall. Draw at this size; do not
upscale a small sprite.
```

**슬라이서 설정**

```json
{ "file": "base-guard.jpg", "name": "bunnyaxe", "expect": [4, 2], "floor": true,
  "labels": ["guard", "windup", "strike", "recover", "hit", "stagger", "win", "lose"] }
```

---

## §2. 평타 — `base-cut.jpg`

```
FRAME: ONE wide image, A ROW OF EXACTLY THREE CELLS, separated by THIN VERTICAL
LINES OF PURE MAGENTA (#FF00FF). All three the same size. Roughly 1536x640.

A reference sheet of this same character is attached. Match it exactly: same
kerchief, same apron, same axe, same proportions, same line weight, same
dithering density.

[PASTE LOCK HERE]

CAMERA: quarter view from slightly above. She faces RIGHT. Same size in all
three cells; feet on the same line.

THE MOTION — A DOWNWARD CHOP. This is her ordinary attack, the one that runs
every second, so it is SHORT AND BLUNT. No flourish.

CELL 1 — the axe up and back over the RIGHT shoulder, both hands, knees bent.
CELL 2 — the axe brought straight DOWN in front of her, arms extended, blade
  near the ground. BEHIND THE BLADE, A CRESCENT MOTION TRAIL following the arc
  it just travelled — clean 1-bit streak, no fire, no sparks.
CELL 3 — followed through. Axe low, shoulders dropped, one foot forward, the
  last thin remnant of the trail breaking apart behind the blade.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: each cell reads at about 200 pixels tall.
```

```json
{ "file": "base-cut.jpg", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["cut_1", "cut_2", "cut_3"], "floor": true }
```

---

## §3. 강타 — `base-sk.jpg`

```
FRAME: ONE wide image, THREE CELLS in a row, PURE MAGENTA (#FF00FF) dividers,
all the same size. Roughly 1536x640. Reference sheet attached — match it.

[PASTE LOCK HERE]

CAMERA: quarter view from slightly above. She faces RIGHT.

THE MOTION — SHE LEAVES THE GROUND. This is the difference from the ordinary
chop: her whole body travels.

CELL 1 — CROUCHED TO SPRING. Knees deeply bent, axe drawn back low behind her,
  head up and looking forward. Both feet still on the ground.
CELL 2 — AIRBORNE. Both feet clear of the ground, body tucked, the axe hauled
  up over her head with both hands. Her skirt and apron lift with the jump; the
  kerchief knots stream back. THE HIGHEST POINT OF THE MOTION.
CELL 3 — LANDED. The axe has come down and buried its edge in the ground in
  front of her, both hands still on the haft, one knee dropped, head lowered.
  Her skirt and apron have fallen back down and settled.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: each cell reads at about 200 pixels tall.
```

```json
{ "file": "base-sk.jpg", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["sk_1", "sk_2", "sk_3"], "floor": true }
```

---

## §4. 화산격 — `base-sk2.jpg`

```
FRAME: THREE CELLS in a row, PURE MAGENTA (#FF00FF) dividers, all the same size.
Roughly 1536x640. Reference sheet attached — match it.

[PASTE LOCK HERE]

CAMERA: quarter view from slightly above. She faces RIGHT.

THE MOTION — SHE STAYS PUT AND DRIVES THE AXE INTO THE GROUND AT HER OWN FEET.
The fire comes up somewhere else; the game draws that separately. She does not
travel and she does not swing wide — that is what separates this from §3.

CELL 1 — the axe hauled up HIGH OVERHEAD with both hands, arms straight, feet
  planted wide and even. Looking down at the ground in front of her.
CELL 2 — the axe DRIVEN STRAIGHT DOWN into the ground right in front of her
  boots, blade half buried, both arms extended down, knees bent, shoulders
  hunched over the impact.
CELL 3 — she is still bent over the planted axe, both hands on the haft, head
  turned up and forward now, mouth open — she is watching what she just set
  off. NOTHING IS BURNING IN THIS CELL. Draw no fire.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: each cell reads at about 200 pixels tall.
```

```json
{ "file": "base-sk2.jpg", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["sk2_1", "sk2_2", "sk2_3"], "floor": true }
```

---

## §5. 불굴의 의지 — `base-sk3.jpg`

```
FRAME: THREE CELLS in a row, PURE MAGENTA (#FF00FF) dividers, all the same size.
Roughly 1536x640. Reference sheet attached — match it.

[PASTE LOCK HERE]

CAMERA: quarter view from slightly above. She faces RIGHT.

THE MOTION — SHE HITS NOBODY. This one turns inward: for five seconds she stops
feeling things and starts swinging twice as hard. Nothing leaves her body, so
the whole cell has to be posture.

CELL 1 — she PLANTS THE AXE head-down in the ground and lets go of it with one
  hand, straightening up to her full height. Chin lifting.
CELL 2 — BOTH FISTS CLENCHED AT HER SIDES, shoulders drawn back, head thrown
  back, mouth open — a shout with nothing thrown. Her skirt, apron and kerchief
  knots all lift as if from a rising heat. The axe stays planted beside her.
CELL 3 — she takes the axe back UP ONTO HER SHOULDER in one hand, head lowered,
  eyes forward under the brow. Not a shout any more: a decision.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: each cell reads at about 200 pixels tall.
```

```json
{ "file": "base-sk3.jpg", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["sk3_1", "sk3_2", "sk3_3"], "floor": true }
```

---

## §6. 용암 지대 — `base-sk4.jpg`

```
FRAME: THREE CELLS in a row, PURE MAGENTA (#FF00FF) dividers, all the same size.
Roughly 1536x640. Reference sheet attached — match it.

[PASTE LOCK HERE]

CAMERA: quarter view from slightly above. She faces RIGHT.

THE MOTION — ONE FLAT HORIZONTAL SWEEP, WAIST HEIGHT.
This is NOT an overhead chop and NOT a downward slam — those are §2 and §4. The
axe travels SIDEWAYS, parallel to the ground, at about the height of her own
waist. That flatness is the entire point of these three cells.

CELL 1 — WOUND UP. Shoulders twisted AWAY from the enemies, back over her LEFT
  hip. Both hands on the haft, axe head drawn back BEHIND HER, low and to her
  left, HELD LEVEL — the flat of the blade parallel to the ground. Weight
  entirely on the back foot. Chin over the leading shoulder, eyes already right.
CELL 2 — THE SWEEP, AT ITS FASTEST. The axe DIRECTLY IN FRONT OF HER, FULLY
  EXTENDED TO HER RIGHT, still LEVEL, still at waist height, arms straight.
  Hips snapped through, back heel up. BEHIND THE BLADE, A LONG FLAT HORIZONTAL
  MOTION TRAIL hugging the ground line — a MOTION TRAIL, not fire. Her apron and
  skirt are thrown out sideways by the speed.
CELL 3 — FOLLOW-THROUGH. Shoulders over-rotated to her RIGHT, axe head low and
  behind her on that side, haft crossing her body. Weight fully on the front
  foot. She has NOT recovered to standing — she is still leaning into it, and
  she is grinning at what she just did.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: each cell reads at about 200 pixels tall.
```

```json
{ "file": "base-sk4.jpg", "name": "bunnyaxe", "expect": [3, 1], "append": true,
  "labels": ["sk4_1", "sk4_2", "sk4_3"], "floor": true }
```

---

## §7. 흉상 — `base-avatar.jpg`

```
FRAME: ONE single image. ONE character. Not a sheet: no cells, no grid, no
dividers, no variants. Roughly 1024x1024.

[PASTE LOCK HERE]

THIS IS A BUST — head, shoulders, and the top of the chest only. Cut off at
about the height of the sternum. Nothing below.

CAMERA: straight on, eye level, facing the viewer. Flat and frontal.

WHAT MUST BE IN FRAME, because this is what identifies her at 40 pixels:
- THE KERCHIEF AND ITS TWO STIFF KNOT-TAILS, whole and uncropped.
- THE BLADE OF THE AXE coming up over her RIGHT shoulder from behind, so that
  the top corner of the slab head is visible beside her face. Only the top
  corner — the haft and the rest of it are out of frame.
- The wide neckline of the blouse and the top edge of the laced bodice.

HER FACE: relaxed and amused, eyes open, ONE CORNER OF THE MOUTH PULLED HIGHER
than the other. This is her default expression everywhere in the game. Not
laughing, not scowling.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: reads at about 190 pixels tall. Her eyes, mouth and the knot-tails
each get their own pixels.
```

```json
{ "file": "base-avatar.jpg", "name": "avatar", "expect": [1, 1], "append": true,
  "labels": ["bunnyaxe"] }
```

---

## §8. 전신 — `base-full.jpg`

```
FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character. Not a sheet: no cells, no grid, no dividing lines, no variants.

[PASTE LOCK HERE]

SHE IS STANDING STILL AND FACING THE VIEWER. Weight cocked onto one hip, the
axe SHOULDERED — the haft resting across her right shoulder, held there with one
hand, the slab head up and back. Her other hand rests on her hip. Feet apart.

PROPORTIONS — THIS IS THE MOST COMMON WAY THIS IMAGE FAILS.
EIGHT HEADS TALL. HER HIPS SIT AT THE EXACT VERTICAL MIDPOINT OF THE IMAGE —
measure it. Legs are half the picture. NOT chibi, NOT stubby, NOT squat.
Crown one twelfth below the top edge, soles one twelfth above the bottom.

HER FACE: relaxed and amused, one corner of the mouth higher than the other.

CAMERA: straight on, eye level. Flat and frontal — no perspective, no foreshortening.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: reads at about 380 pixels tall. Draw at this size; do not upscale a
small sprite. The dithering on the skirt and apron must survive at that size —
keep the checker coarse.
```

```json
{ "file": "base-full.jpg", "name": "char_full", "grid": [1, 1], "append": true,
  "labels": ["bunnyaxe"], "size": 384, "noTrim": true, "region": "받은 뒤에 잽니다" }
```

`region` 은 §8·§9·§10 **세 장의 흰 픽셀 경계를 합쳐서** 정합니다. 받은 뒤에
제가 재서 넣겠습니다.

---

## §9. 부끄러워하는 얼굴 — `base-shy.jpg`

```
FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character, not a sheet.

THIS IS A SECOND POSE OF A CHARACTER YOU HAVE ALREADY DRAWN. The standing image
from §8 is attached. Match it exactly: same height in frame, same proportions,
same camera, same kerchief, same apron, same axe, same line weight, same
dithering density. If the two images were laid on top of each other, ONLY THE
FACE AND ONE ARM would move.

[PASTE LOCK HERE]

WHAT CHANGES — SOMEONE HAS JUST POKED HER IN THE CHEST.
The joke she was about to make does not arrive.

SHE IS EMBARRASSED. Draw the SAME KIND OF FLUSTERED FACE you would draw for any
shy anime girl: wide eyes, worried brows, a small open mouth, a deep blush.

SHE IS NOT ANGRY — not glaring, not scowling, not threatening.
SHE IS NOT AMUSED — NOT GRINNING, NOT SMIRKING, NOT SMILING AT ALL, not winking,
not teasing. THIS IS THE MOST COMMON WAY THIS IMAGE FAILS. In her normal artwork
she is always half-smiling; here that smile is GONE, and its absence is the
entire point.
- HER FACE: eyes WIDE and OPEN — never narrowed — looking off to one side, away
  from the viewer. Eyebrows UP AT THE INNER ENDS, the worried slant. Mouth SMALL
  AND SLIGHTLY OPEN, an ordinary startled "o".
  TWO OR THREE SHORT DIAGONAL HATCH LINES across each cheekbone — this is how a
  blush is drawn in 1-bit. Clean strokes, not a filled patch.
- HER KERCHIEF KNOT-TAILS DROOP, tipping back and down.
- HER LEFT FOREARM comes UP ACROSS THE FRONT OF THE APRON, held flat against
  herself, elbow out.
- HER RIGHT HAND stays on the haft. THE AXE STAYS SHOULDERED exactly as in the
  reference. She does not drop it.
- HER SHOULDERS rise; her weight stays cocked on the same leg. Feet do not move.
Everything else is identical to the reference. The blouse, bodice, skirt and
apron are drawn exactly as before: nothing is loosened, displaced, pulled aside,
or made transparent.

THE OUTER EDGES OF THE DRAWING MUST NOT CHANGE. Nothing reaches further up,
down, left or right than in the reference — not the knot-tails, not the axe
head, not the raised elbow. The images get cropped from the same rectangle, so
anything that sticks out further gets cut off.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: reads at about 380 pixels tall.
```

---

## §10. 쓰다듬길 때 — `base-pat.jpg`

```
FRAME: ONE single tall portrait image, 2 wide by 3 tall. Output at 1024x1536.
ONE character, not a sheet.

THIS IS A THIRD POSE OF A CHARACTER YOU HAVE ALREADY DRAWN. The standing image
from §8 is attached. Match it exactly — same everything. ONLY THE FACE AND ONE
ARM move.

[PASTE LOCK HERE]

WHAT CHANGES — SOMEONE IS PATTING HER ON THE HEAD, RIGHT NOW.
A hand is resting on her kerchief. THE HAND IS NOT DRAWN — only her reaction.

SHE IS EMBARRASSED AND SHE LIKES IT AND SHE HATES THAT SHE LIKES IT. Unlike §9,
A SMALL CROOKED SMILE IS WANTED HERE — she is the one who usually does the
teasing and she has just lost that job. She is the oldest of the four and is
being handled like the youngest.

SHE IS NOT ANGRY, NOT ALARMED, NOT SHOUTING.
- HER FACE: eyes open and SOFT, not wide with alarm, not narrowed. LOOKING UP
  AND SLIGHTLY TO ONE SIDE, toward whatever is above her head. THIS UPWARD GAZE
  IS THE SINGLE MOST IMPORTANT THING IN THE DRAWING — the hand is not drawn, so
  her eyes are the only thing that says it is there.
  Eyebrows UP AT THE INNER ENDS. Mouth SMALL, ONE CORNER PULLED HIGHER — a
  crooked half-smile, closed or barely open. Not a grin, not teeth.
  TWO OR THREE SHORT DIAGONAL HATCH LINES across each cheekbone, HEAVIER than
  usual — she blushes harder than anyone.
- HER KERCHIEF KNOT-TAILS STAND UP STIFF AND ALERT — the opposite of §9, where
  they droop. THE TIPS MUST NOT REACH ANY HIGHER IN THE FRAME than in §8.
- HER HEAD TILTS DOWN a few degrees and HER CHIN TUCKS. The eyes go up while
  the head goes down. That combination IS the gesture.
- HER LEFT HAND comes off her hip and UP TO THE EDGE OF THE KERCHIEF, fingers
  half closed on it, as if to move the hand away and not actually doing it.
  THE ELBOW STAYS TUCKED IN — the arm does not swing outward.
- HER RIGHT HAND stays on the haft. THE AXE STAYS SHOULDERED. She does not drop it.
Everything else is identical to §8.

THE OUTER EDGES OF THE DRAWING MUST NOT CHANGE. Same rectangle as §8 and §9.

[PASTE STYLE + NO TEXT BLOCK HERE]

RESOLUTION: reads at about 380 pixels tall.
```

---

## 받은 다음 (제가 합니다)

1. 지금 바니걸 그림을 `bunnyaxe_bunny/` 로 옮겨 둡니다
2. `assets/<날짜>/base-*.jpg` 열 장을 자릅니다
3. §8·§9·§10 세 장의 경계를 합쳐 `region` 을 정하고 셋을 같은 자리에서 오립니다
4. 눌리는 자리 표를 다시 잽니다 (`HeroManage` 의 `HEAD`·`CHEST`) — 옷이 바뀌면
   가슴과 머리가 그림 안 어디인지도 바뀝니다
5. `spriteGap` 을 다시 봅니다 — 칸마다 세로 비율이 달라지면 발 높이가 어긋납니다

## 한 장씩 받아도 됩니다

열 장을 한 번에 다 받을 필요는 없습니다. **§1 하나만 있어도 전투가 돕니다** —
나머지는 없으면 지금 그림이나 기본 그림으로 떨어지게 되어 있습니다
(`SK_FALLBACK` · `skFramesOf` · `fallbackSet`). 순서를 매긴다면:

**§1 → §8 → §7 → §2 → §6 → §3 → §4 → §5 → §9 → §10**

전투에서 제일 오래 보이는 것(§1)과 영웅 관리에서 제일 크게 보이는 것(§8)이
먼저입니다. 표정 둘(§9·§10)은 맨 나중이어도 지금 것으로 버팁니다.
