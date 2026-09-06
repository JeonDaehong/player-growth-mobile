# 캐릭터 전신 — 영웅 관리 화면

**이 파일은 손으로 씁니다** — 생성기가 없습니다. 캐릭터의 다른 그림(전투
8프레임 · 흉상 · 월페이퍼)은 [CHARACTER_ART_PROMPTS.md](CHARACTER_ART_PROMPTS.md)
에서 자동 생성되지만, 이 한 장은 **화면 구조에서 나온 요구**라 읽어 올 소스가
없습니다.

한 장씩 네 명, **시트 하나**로 받습니다.

| | |
|---|---|
| 어디에 쓰나 | 영웅 → 영웅 관리, 인물이 서는 상자 (`screens/home/HeroManage` 의 `FULL_W`·`FULL_H`) |
| 폴더 | `assets/sprites/char_full/` |
| 파일 이름 | `knightgirl.png` · `bunnyaxe.png` · `elfarcher.png` · `nun.png` |
| 모델 | Gemini |
| 요청 | **1번** (4칸 시트 한 장) |

---

## 왜 흉상으로 안 되나

파티 칸·모집 결과·도감이 전부 흉상을 씁니다 (`avatar`). 46px 짜리 얼굴
하나라서 어디에 박아도 읽힙니다.

영웅 관리는 다릅니다. **한 사람만 세워 놓고 들여다보는 자리**라, 파티 칸에
박히는 것과 같은 그림을 크게만 띄우면 키운 값을 못 합니다 — 조각을 모아 성을
올리고 레벨을 백 번 눌러도 화면에서 달라지는 것이 숫자뿐입니다.

전신이면 무기가 보이고, 옷이 보이고, 발밑까지 보입니다. **고를 이유가 그림에
있어야** 좌우로 넘기는 화살표가 값을 합니다.

## 지금은 흉상이 대신 서 있습니다

`char_full` 이 없으면 `avatar` 로 떨어집니다 (`Sprite` 의 `fallbackSet`).
상자 크기(104x132)와 자리는 이미 잡혀 있으므로, 그림이 들어오면 폴더에 넣고
`slice.py` 를 돌리는 것으로 끝입니다. **화면 코드는 안 건드립니다.**

## 받은 다음

1. 마젠타 경계로 잘린 4칸 시트를 `assets/new-image/` 에 넣습니다
2. `tools/sprites.config.json` 에 아래를 더합니다

```json
{
  "file": "<받은 파일 이름>",
  "name": "char_full",
  "expect": [1, 4],
  "labels": ["knightgirl", "bunnyaxe", "elfarcher", "nun"]
}
```

3. `python3 tools/slice.py` — `spriteAssets.ts` 가 다시 생성됩니다
4. 화면에서 바로 바뀝니다. `fallbackSet` 이 밀려나는 것뿐입니다

---

## 네 칸 모두에 걸리는 규칙

**전투 8프레임(§A)과 흉상(§B)을 레퍼런스로 첨부하세요.** 같은 사람이어야
합니다 — 파티 칸의 흉상과 무대 위의 인물과 이 전신이 서로 다른 사람으로
보이면, 셋 다 값을 잃습니다.

세 가지가 전투 시트와 **다릅니다.**

| | 전투 8프레임 | 전신 (이 문서) |
|---|---|---|
| 카메라 | 살짝 내려다보는 측면 (바닥이 쿼터뷰라서) | **정면**. 화면 밖의 나를 본다 |
| 자세 | 스윙 한 번의 네 토막 | 서 있는 한 자세. 안 움직인다 |
| 해상도 | 54px 에서 읽혀야 함 | **104px 폭**. 손·얼굴·무기 장식이 살아난다 |

정면인 이유는 이 화면이 무대가 아니기 때문입니다. 무대에서는 인물이 오른쪽
적을 보고 서지만, 여기서는 **나를 봅니다** — 고르는 자리라 눈이 마주쳐야
합니다.

---

## 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a sheet of EXACTLY 4 STANDING FULL-BODY CHARACTER PORTRAITS in ONE row,
left to right. Four cells, four DIFFERENT women. Do not repeat a character anywhere
on the sheet and do not add variants of one.

EVERY CELL SHOWS THE WHOLE BODY FROM THE TOP OF THE HEAD TO THE SOLES OF THE FEET.
Nothing is cropped — not the feet, not a weapon tip, not an ear, not a hair end.
This is the single most common way this sheet fails.

POSE — THE SAME FOR ALL FOUR:
- Standing still, at rest, facing the viewer nearly straight on (turned no more than
  10 degrees to one side). She is looking OUT of the picture at the person holding
  the phone. Both eyes visible.
- Weight settled on both feet, feet about shoulder width apart and flat on the ground.
  Not walking, not lunging, not mid-swing.
- Her weapon is held in a resting carry — down at her side, planted, or shouldered.
  It is fully inside the cell.
- Calm and unhurried. This is a character-select portrait, not an action shot.
- She fills the cell vertically: the top of her head sits about one twelfth of the
  cell height below the top edge, and her feet sit about one twelfth above the bottom.

CAMERA — STRAIGHT-ON, EYE LEVEL. Flat and frontal, like a standing photograph.
No high angle, no low hero angle, no perspective distortion. This is DIFFERENT from
the battle sprites of these same characters, which are drawn at a slight high angle
from the side — here the camera is level and in front.

The 4 cells, in this exact order:

Cell 1 — ISOLDE.
A young woman knight, calm and unhurried. She is the most striking figure in the game and she knows it, but she never postures.
HAIR: very long and straight, falling past the waist, with two heavy side locks framing her face. A slender circlet crosses her brow with one small gem at the centre. She never wears a helm.
ARMOUR — PARTIAL, NEVER A FULL SUIT: an ornate fitted breastplate, one pauldron on each shoulder, and articulated gauntlets to the elbow. All of it worn OVER a flowing layered dress whose long skirt is split up the front and trails behind her. Thigh-high armoured boots.
CAPE: a half-cape pinned at her RIGHT shoulder only, hanging to the knee.
WEAPON: a greatsword as tall as she is, straight double-edged blade, plain cross guard, a ring pommel. No gems, no engraving — it is a working sword.
SILHOUETTE (protect this above all): the long split skirt below hard armoured shoulders, plus the tall straight greatsword. Half soft, half iron.
HER STANDING POSE: the greatsword is PLANTED POINT-DOWN in front of her, centred, both hands folded over the ring pommel at about waist height. She stands square behind it. The blade runs straight down the middle of the cell.

Cell 2 — BIANCA.
A tall young woman in a bunny-girl outfit, swinging a battle axe that has no business being in the same room as that outfit. She finds this funny. That gap — cocktail costume, butcher weapon — is the entire character.
HAIR: short and choppy, cut around the jaw, with a blunt fringe. Two long rabbit ears stand up from a headband, one of them bent over near the tip and it stays bent.
OUTFIT: a fitted strapless leotard with a small bow tie at the throat, a stiff collar, and cuffs on both wrists. Over it, worn like an afterthought: a single heavy shoulder guard strapped to her RIGHT shoulder, and a thick studded belt slung across her hips. Sheer stockings and heeled boots, one boot laced higher than the other. A round powder-puff tail.
THE CUFF ON HER LEFT WRIST IS TORN and hangs loose. The right one is intact.
WEAPON: a single-bit battle axe on a haft nearly as long as she is tall. The head is a broad heavy slab with a wide curved edge and a short spike on the back. The haft is wrapped in cord at the grip. It is scratched and working, not ceremonial.
SILHOUETTE (protect this above all): tall rabbit ears with one bent tip, a bare narrow figure, and the enormous slab-headed axe. Two thin lines and one huge block.
HER STANDING POSE: the axe is SHOULDERED — the haft resting across her RIGHT shoulder with the huge head hanging behind and above that shoulder, her right hand up on the haft, her left hand on her hip. Weight cocked onto one leg. She is grinning slightly. Her rabbit ears must not be cut by the top edge.

Cell 3 — LIANNE.
A slight elf woman, watchful and economical — she never makes a movement she does not need. She is the last of something and does not talk about it.
EARS: long and swept back, clearly elven, and they are the first thing anyone notices.
HAIR: gathered into a long high ponytail that falls to her waist, with two thin braids hanging in front of her ears. A single feather is tied into the gather of the ponytail.
CLOTHING — LIGHT, NOTHING RIGID: a short hooded tunic belted at the waist, worn over a fitted long-sleeved underlayer. The hood is DOWN. A single leather bracer laced on her LEFT forearm (the bow arm), a half-cloak hanging behind her right shoulder, wrapped leggings and soft boots laced to the knee. No plate anywhere.
QUIVER: a slim quiver worn low on her RIGHT hip, not on her back, with four or five fletched shafts standing out of it.
WEAPON: a SHORT recurve bow, about half her height — chin to hip when stood on end. Pale dry wood with a pronounced double curve and bound grip. It is small, and that is the point.
SILHOUETTE (protect this above all): long swept ears and a long high ponytail above a small light figure, plus the compact double-curved bow. Fast and thin, nothing heavy anywhere.
HER STANDING POSE: the bow held UNSTRUNG-CALM in her LEFT hand, down at her side, its lower limb near her boot, arm relaxed. Her right hand rests on the quiver at her hip. She is the smallest of the four and must be drawn noticeably shorter than Cell 2 — do not scale her up to fill the cell; give her the same headroom and let the empty space above her read as her being small.

Cell 4 — AGNES.
A young nun, composed and very quiet. She keeps her eyes lowered by habit, not from timidity — but IN THIS PICTURE SHE IS LOOKING UP AND STRAIGHT AT THE VIEWER, direct and level.
HAIR: pale, cut short at the nape, with a few strands escaping at the temples. Mostly covered.
HABIT: a long dark layered habit to the ankle with wide bell sleeves, a pale scapular hanging front and back over it, and a broad cinched sash at the waist. A short veil over the head, PINNED BACK ON HER LEFT SIDE ONLY so that the left ear and jaw are exposed and the right stays covered. A simple pendant at the throat. The hem is scorched and grey at the bottom — she walks through the fire she starts.
HANDS: bare, with a short chain wound twice around her RIGHT hand.
WEAPON: a censer — a small pierced metal vessel on a SHORT chain about a forearm long, held in both hands. Thin smoke rises from it at rest. It is not a mace and must never look like one: the vessel is small, rounded, and lidded, and the chain is slack unless she is swinging.
SILHOUETTE (protect this above all): the long unbroken bell of the habit, the asymmetric pinned veil, and one small bright point hanging at the end of a short chain. Almost all of her is one dark shape with a single bright spark.
HER STANDING POSE: both hands held together at chest height, the censer hanging from them on its slack chain just below her waist, a thin ribbon of smoke rising past her shoulder. Feet hidden under the hem — the hem itself is the bottom of her silhouette and must not be cropped.

STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel a crisp hard-edged square.
- Background: solid pure black, completely EMPTY. No floor, no shadow, no ground line,
  no room, no glow, no frame, no decorative panel behind her. She is cut out on black.
- Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.
- These are adults. Tasteful — no suggestive framing, no leering camera.

RESOLUTION — THIS IS BIGGER THAN THE BATTLE SPRITES.
The battle sprites of these same women are read at 54 pixels tall, so they are built
from very few pixels. THIS sheet is read at about 130 pixels tall, which is more than
twice that. Use the extra room:
- Faces have actual features — eyes, brow, mouth — not two dots.
- Hands are drawn as hands on the grip, with separated fingers where they wrap.
- Armour edges, fabric folds, the cord wrap on a haft, the fletching in a quiver,
  the pierced holes in a censer all get their own pixels.
- Dithering is used for form (the round of a pauldron, the fall of a skirt), not
  sprinkled as texture.
Do NOT simply upscale a small sprite. Draw it at this size.

THEY MUST STAND TOGETHER. Put the 4 finished cells side by side. They are four women
from ONE game who stand in ONE party: same line weight, same amount of white on screen,
same dithering density, same eye level, same headroom. Nothing in the drawing says
which is strongest — the interface says that with numbers, not with the artwork.
Their HEIGHTS, however, differ and must differ: Bianca is the tallest, then Isolde,
then Agnes, then Lianne is clearly the shortest.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a
  magenta border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL IS A TALL PORTRAIT, 3 wide by 4 tall. With a 4x1 grid that means the
  whole sheet is 3:1 — output it at 3072x1024.
```

---

## Gemini 가 늘 하는 짓

받은 다음 이 넷부터 확인하세요.

**발을 자릅니다.** 인물을 크게 그리려다 셀 아래 끝에서 발이 잘립니다. 특히
아녜스의 치맛단과 비앙카의 굽. 잘렸으면 그 칸만 다시 받으세요 — 상자가
`flex-end` 로 바닥에 붙여 세우므로 (`HeroManage`), 발이 잘린 그림은 잘린 면이
바닥선처럼 보입니다.

**토끼 귀를 눕힙니다.** 비앙카의 귀가 위 여백에 안 들어가면 눕히거나 접어서
넣습니다. 귀 하나가 굽은 것은 설정이지만 **둘 다 굽으면 다른 사람**입니다.

**배경을 깝니다.** "character-select portrait" 라는 말을 들으면 뒤에 방이나
빛무리를 넣으려 합니다. 검은 바닥에 오려낸 것이어야 합니다 — 상자 안에 옅은
면이 이미 깔려 있어서 (`SURF.down`), 그림에 배경이 있으면 면이 둘이 됩니다.

**리안느를 키웁니다.** 네 칸이 같은 크기라 작은 사람도 칸을 채우려 듭니다.
키 차이는 넷을 나란히 놓았을 때만 보이는 것이라, 여기서 무너지면 되살릴 데가
없습니다.
