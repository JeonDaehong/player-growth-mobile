# 용암 지대 — 휘두르는 몸짓과 부채꼴 불꽃

**이 파일은 손으로 씁니다** — 생성기가 없습니다.

비앙카의 3단계 갈래 하나(`core/skillTree` 의 `ba3a`)입니다. 지금은 화산격의
몸짓을 빌려 쓰고 있는데, 저건 **내려찍는** 그림이라 "적 전체에 불이 퍼진다" 와
어긋납니다.

| | |
|---|---|
| 요청 | **2번** (몸짓 시트 하나 + 불꽃 시트 하나) |
| 모델 | Gemini |
| 넣을 곳 | `assets/<날짜>/yongam-jidae-motion.jpg` · `assets/<날짜>/yongam-jidae-fx.jpg` |
| 자르기 | `tools/sprites.config.json` 에 **이미 적어 뒀습니다.** 파일만 넣고 `python3 tools/slice.py bunnyaxe` · `python3 tools/slice.py sfx_lavafan` |

---

## 화산격 그림은 안 건드립니다

둘 다 비앙카의 불이고 여태 **같은 동작 칸(`sk2`)을 나눠 쓰고 있었습니다.**
용암 지대만 옆으로 훑는 그림으로 바꾸려면 그 칸을 갈아야 하는데, 그러면
화산격에 맞춰 그린 그림이 사라집니다.

그래서 **넷째 칸(`sk4`)을 새로 텄습니다.** 화산격은 지금 그림 그대로 두고,
용암 지대만 새 몸짓을 씁니다. 새 그림이 들어오기 전까지는 여태처럼 화산격
몸짓으로 떨어집니다 (`Fighter` 의 `skFramesOf`).

## 두 장이 **같은 순간**을 나눠 그립니다

| | 무엇 | 어디에 |
|---|---|---|
| 몸짓 | 비앙카가 도끼를 **횡으로** 휘두른다 | 비앙카 자리 |
| 불꽃 | 그 궤적에서 **부채꼴로** 퍼져 나간다 | 적들 쪽 |

**서로 겹쳐 그리면 안 됩니다.** 몸짓 시트에는 불꽃을 그리지 않고, 불꽃 시트에는
비앙카를 그리지 않습니다 — 화면에서 둘이 겹쳐 놓이므로, 양쪽에 다 있으면 불꽃이
두 겹으로 보입니다.

## 두 장 다 **3칸 가로 시트**입니다

이 프로젝트의 시트 규격입니다.

- 가로로 **셋**, 세로로 하나. 칸과 칸 사이를 **순수 마젠타(#FF00FF) 선**으로
  가릅니다 (슬라이서가 그 선을 찾아서 자릅니다)
- 칸 안은 **순수 검정 바탕**에 흰 그림 하나. 회색·반투명·그림자 없음
- 세 칸이 **같은 크기**이고, 인물이나 불꽃이 칸마다 **같은 자리**에 섭니다.
  칸마다 확대율이 다르면 재생할 때 그림이 들썩입니다

---

## §1. 휘두르는 몸짓 — `yongam-jidae-motion.jpg`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE wide image containing a ROW OF EXACTLY THREE CELLS, side by side,
left to right. The cells are separated by THIN VERTICAL LINES OF PURE MAGENTA
(#FF00FF) and nothing else. No other dividers, no borders around the outside,
no numbers, no labels.
All three cells are THE SAME SIZE. Output roughly 1536x640.

THIS IS AN ANIMATION OF A CHARACTER YOU HAVE ALREADY DRAWN.
A reference image of her is attached. Match it exactly: same costume, same axe,
same ears, same hair, same proportions, same line weight, same dithering density.
She is the SAME SIZE IN ALL THREE CELLS and her FEET STAY ON THE SAME LINE in
all three — the ground line does not move between cells.

THE CHARACTER:
A tall young woman in a bunny-girl outfit swinging a battle axe that has no
business being in the same room as that outfit.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit
ears stand up from a headband, ONE OF THEM BENT OVER NEAR THE TIP.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff
collar, cuffs on both wrists (THE LEFT CUFF IS TORN and hangs loose). A single
heavy shoulder guard strapped to her RIGHT shoulder, a thick studded belt slung
across her hips. Sheer stockings and heeled boots, one laced higher than the
other. A round powder-puff tail.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall, a broad
slab head with a wide curved edge and a short spike on the back.
SHE FACES RIGHT. She is swinging at enemies who stand off the right edge.

THE MOTION — ONE FLAT HORIZONTAL SWEEP, WAIST HEIGHT.
This is NOT an overhead chop and NOT a downward slam. The axe travels SIDEWAYS,
parallel to the ground, at about the height of her own waist. That flatness is
the entire point of these three cells.

CELL 1 — WOUND UP.
She has turned her shoulders AWAY from the enemies, twisting back over her LEFT
hip. Both hands are on the haft and the axe head is drawn back BEHIND HER, low
and to her left, HELD LEVEL — the flat of the blade parallel to the ground. Her
weight is entirely on her back foot. Her knees are bent. Her chin is over her
leading shoulder and her eyes are already on the target: she is looking RIGHT
while her body still points LEFT. Her ears stream back with the wind-up. No
flames yet, nothing glowing.

CELL 2 — THE SWEEP, AT ITS FASTEST.
The axe is now DIRECTLY IN FRONT OF HER AND FULLY EXTENDED TO HER RIGHT, still
LEVEL, still at waist height, arms straight. Her hips have snapped through and
her shoulders now face the enemies. Her back heel has come up off the ground.
BEHIND THE BLADE, A LONG FLAT ARC OF MOTION TRAIL: a horizontal white streak
that follows the path the axe just travelled, wide and thin, hugging the ground
line. It is a MOTION TRAIL, not fire — clean 1-bit streak lines and a few
trailing dashes, no flames, no smoke, no sparks.
Her ears are thrown out sideways by the speed. Her hair is pushed off her face.
THIS CELL IS THE ONE PEOPLE WILL SEE. Make it read at a glance.

CELL 3 — FOLLOW-THROUGH.
The swing has carried past. Her shoulders have over-rotated to her RIGHT, the
axe head is now low and behind her on that side, the haft crossing her body. Her
weight is fully on her front foot and her back leg trails. She has NOT recovered
to a standing pose — she is still leaning into the direction of the swing, and
she is grinning at what she just did. A last thin remnant of the trail hangs in
the air behind the blade, breaking apart.

CAMERA — STRAIGHT-ON, EYE LEVEL, flat and frontal. The same camera in all three
cells; it does not pan, zoom, or tilt between them.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF,
  plus the pure magenta of the two divider lines.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur.
- Shading ONLY via 1-bit checkerboard dithering, at the same density as the reference.
- Chunky, clearly visible square pixels.
- Background in every cell: solid pure black and completely EMPTY. No floor, no
  cast shadow, no ground line drawn, no glow, no sparkles.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.
- She is an adult. Tasteful — no suggestive framing, no leering camera. The
  costume does not shift, tear further, or come loose during the swing.

RESOLUTION: each cell reads at about 200 pixels tall. Draw at this size; do not
upscale a small sprite.
```

---

## §2. 부채꼴로 날아가는 불꽃 — `yongam-jidae-fx.jpg`

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- An image containing even one letter-like mark is a failed output.

FRAME: ONE wide image containing a ROW OF EXACTLY THREE CELLS, side by side,
left to right, separated by THIN VERTICAL LINES OF PURE MAGENTA (#FF00FF) and
nothing else. All three cells are THE SAME SIZE. Output roughly 1536x640.

THERE IS NO CHARACTER IN THIS IMAGE. Do not draw a person, a hand, an axe, or
any part of one. This is the effect only — it gets drawn on top of the
characters by the game.

WHAT THIS IS: a FAN OF FIRE thrown sideways along the ground by a horizontal axe
swing. It leaves from a point at the LOWER LEFT of the cell and spreads out to
the RIGHT, widening as it goes, like a hand of cards opening.

THE SHAPE — A FAN, NOT A BALL AND NOT A WALL.
- The ORIGIN is a single point at the LOWER LEFT CORNER AREA of the cell, at
  about one fifth of the way in from the left and one quarter up from the bottom.
  In all three cells the fan opens FROM THAT SAME POINT.
- FIVE OR SIX SEPARATE TONGUES OF FLAME radiate from it toward the right, like
  the ribs of a fan. The bottom tongue runs almost flat along the ground. The top
  tongue rises at roughly thirty degrees. The rest are spaced evenly between.
  THE TONGUES DO NOT TOUCH EACH OTHER except near the origin — the black gaps
  between them are what makes this read as a fan.
- Each tongue is a LONG THIN FLAME: narrow at the origin, swelling in the middle,
  splitting into two or three flickering points at its far end.
- The whole fan is WIDER THAN IT IS TALL. It stays low. This is fire travelling
  ACROSS THE GROUND, not a fireball and not a rising column.

CELL 1 — JUST LEFT THE BLADE.
The fan is SHORT and TIGHT. The tongues reach only about one third of the way
across the cell and are still bunched close to each other, barely separated. A
few loose sparks fly ahead of the tips. Blunt, dense, compact.

CELL 2 — FULLY OPEN. THE BIGGEST CELL OF THE THREE.
The tongues now reach ALL THE WAY TO THE RIGHT EDGE of the cell and are spread to
their full spacing. This is the widest and brightest the effect ever gets. The
flames are solid white with 1-bit checkerboard dithering along their inner edges
so they read as fire rather than as plain shapes. Small embers are scattered in
the black gaps between the tongues.

CELL 3 — BURNING OUT.
The tongues have BROKEN APART into disconnected patches along the same fan lines
— the shape is still readable but it is coming apart. The origin end has gone out
entirely and the black has come back there; what remains burns at the far ends
and along the ground. Loose embers drift upward. Nothing is drawn where the fan
started.

DIRECTION AND ANCHOR — THIS MATTERS MORE THAN THE DETAIL.
The fan must open from LOWER LEFT toward the RIGHT in all three cells, from the
SAME origin point, along the SAME lines. The three cells are three moments of one
fan, not three different fans. If cell 3's shape does not lie on top of cell 2's,
the animation will jump.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY pure black #000000 and pure white #FFFFFF,
  plus the pure magenta of the two divider lines.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO glow.
- Volume ONLY via 1-bit checkerboard dithering.
- Chunky, clearly visible square pixels. The flames are BOLD — thin wispy
  filigree disappears at final size.
- Background in every cell: solid pure black and completely EMPTY.
- Retro handheld / early-1990s monochrome LCD game aesthetic.
- No watermarks, no signatures, no borders.

RESOLUTION: each cell reads at about 200 pixels tall and is drawn at this size.
Whatever survives at 200px is all that exists — draw the fan with that in mind.
```

---

## 받은 다음

1. `assets/<날짜>/yongam-jidae-motion.jpg` · `assets/<날짜>/yongam-jidae-fx.jpg`
2. `python3 tools/slice.py bunnyaxe` → `assets/sprites/bunnyaxe/sk4_1..3.png`
3. `python3 tools/slice.py sfx_lavafan` → `assets/sprites/sfx_lavafan/1..3.png`

몸짓은 여기까지면 화면에 바로 나옵니다 (`skFramesOf` 가 `sk4` 를 먼저 찾습니다).

**불꽃은 붙이는 일이 남습니다.** 부채꼴이 비앙카에게서 떠나 적들 쪽으로
퍼지는 것이라, 화산격(발밑에서 솟는 것)과 놓이는 자리가 다릅니다 — 얼마나
멀리 가고 언제 사라지는지는 그림을 보고 맞추는 편이 낫습니다. 그림이 들어오면
그때 답니다.

⚠ 우하단 반짝이(Gemini 워터마크)가 밝게 오면 `dimRects` 를 답니다 —
[CHAR_PAT_PROMPTS.md](CHAR_PAT_PROMPTS.md) 에 그 이야기가 있습니다.
