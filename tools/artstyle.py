# -*- coding: utf-8 -*-
"""
프롬프트 공용 블록.

캐릭터(`gen-char.py`)와 적(`gen-foe.py`)이 **같은 문장**을 써야 한다. 그림이
같은 게임 안에 나란히 서므로, 스타일 규칙이 한 글자라도 갈리면 그 차이가
화면에서 보인다.

한쪽에 두고 다른 쪽이 복사해 가는 방식은 안 된다. 복사본은 반드시 갈라진다 —
`slice.py` 의 `SRC_DIRS` 가 설정과 따로 놀다가 "원본 없음" 으로 멈춘 적이 있다.
"""

# 프롬프트 안의 줄바꿈. 소스에 백슬래시를 안 남기려고 상수로 둔다
NL = chr(10)


# ══ 공통 블록 ════════════════════════════════════════════════

NOTEXT = """ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output."""

# gen-prompts.py 의 STYLE 과 **한 글자도 다르면 안 된다** — 이미 들어온 스프라이트
# 전부가 저 문장으로 만들어졌다. 여기서 살짝 다듬으면 캐릭터만 미묘하게 다른
# 화풍이 되어, 정확히 피하려던 일이 일어난다.
PIXEL_STYLE = """STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- No watermarks, no signatures, no sparkle marks in the corners.
- No borders or frames around the whole image."""

# 새로 생긴 규칙 — 게임이 쿼터뷰가 되면서 필요해졌다
QUARTER = """CAMERA — SLIGHT HIGH-ANGLE SIDE VIEW (three-quarter). This is not a flat side view.

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
  needs them facing the other way — never draw a left-facing frame."""

NO_GROUND = """NEVER DRAW THE GROUND.

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
never by drawing what is being touched."""


SAME_PERSON = """ONE CHARACTER, MANY FRAMES.

- Every cell is THE SAME PERSON: same face, same hair length and shape, same armour
  and clothing down to every strap and buckle, same weapon, same proportions.
- ONLY the pose changes between cells. Nothing else, ever.
- ASYMMETRY IS LOCKED. Anything the description places on her LEFT or RIGHT stays on
  that side of HER BODY in every frame, including frames where she turns.
- Draw all cells in one pass as a single animation sheet, not as separate drawings
  that happen to share a description.
- Do NOT offer variations, alternate outfits, or design options. This is production
  art, not a concept exploration."""

READABLE = """READABILITY — this is displayed at about 54 pixels tall in game.

- The silhouette must be identifiable at that size with every detail thrown away.
  Her one unmistakable shape is stated in the description — protect it above all else.
- The face needs at most two eyes, two brows, one mouth line and a hair shape.
  A nose is one pixel notch or nothing.
- Do not render fabric texture, individual hair strands, or skin shading. At this
  size they become noise. Big shapes, hard edges, wide dither fields.
- Weapon and cape read as bold solid shapes, not as thin outlines."""

NO_CLIP_HEAD = """NOTHING MAY BE CUT OFF.

@RULE@

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
  line, on all four sides of every cell."""


def grid(cols, rows, extra=""):
    e = ("\n- " + extra) if extra else ""
    r = "row" if rows == 1 else "rows"
    c = "column" if cols == 1 else "columns"
    return f"""SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: {cols} {c} x {rows} {r}.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly {rows} {r}, exactly {cols * rows} cells.
- EVERY CELL MUST BE SQUARE. With a {cols}x{rows} grid that means the whole sheet is
  {cols}:{rows} — output it at {cols * 512}x{rows * 512}.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.{e}"""


ILLUST_STYLE = """STYLE (strict):
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
- She is an adult. Tasteful — no suggestive framing, no leering camera."""

PORTRAIT = """VERTICAL COMPOSITION — this is a PHONE wallpaper, 9:16 portrait (tall).

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

One figure only. No second character, no crowd, no inset panel."""


MOE = """MOE / ANIME REGISTER — she is one of the pretty ones.

- Modern Japanese moe anime style. Soft face with a small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled.
- Nose is one pixel notch or nothing. Small mouth. No realistic facial structure —
  no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, long legs.
- HAIR IS THE SILHOUETTE. Loose flowing strands, and one stray cowlick standing up
  from the crown.
- Charming and appealing, never grim, never grubby. She is solemn, but soft."""


# ══ 문서 ═════════════════════════════════════════════════════

def rows_of(items, head):
    lines = [head, '']
    for i, (_id, _ko, desc) in enumerate(items, 1):
        lines.append('Cell %d — %s' % (i, desc))
    return NL.join(lines)


def table_of(items):
    head = '| 셀 | ' + ' | '.join(str(i) for i in range(1, len(items) + 1)) + ' |' + NL
    head += '|---|' + '---|' * len(items) + NL
    head += '| | ' + ' | '.join(ko for _i, ko, _d in items) + ' |' + NL
    head += '| id | ' + ' | '.join('`%s`' % i for i, _k, _d in items) + ' |' + NL
    return head


def labels_of(items):
    return ', '.join('"%s"' % i for i, _k, _d in items)


def block(*parts):
    return '```\n' + '\n\n'.join(p for p in parts if p) + '\n```\n'

# ══ 생물 ═════════════════════════════════════════════════════
#
# 적 생성기(`gen-foe`)와 보스 생성기(`gen-boss`)가 같이 쓴다. 같은 화면에
# 나란히 서는 그림이라 규칙이 갈리면 안 된다 — 한쪽에만 적어 두면 언젠가
# 한쪽만 고쳐진다.

STANDS = """IT STANDS. IT NEVER LIES DOWN.

The floor is a receding quarter-view plane and the sprite is simply composited on
top of it. That works for something STANDING, because the bottom of the shape meets
the floor along one clear line. It cannot work for something LYING FLAT: a wide
shallow pool, a puddle, a slick, a thing spread out across the ground has no such
line, and the floor cannot draw itself around it. It lands on screen as a sticker
glued to the floor, and no amount of drawing inside the sprite will fix it, because
the fix would have to happen in the floor.

So nothing here is drawn as a flat spread pool, a stain, or anything poured out
across a surface, however heavy or liquid it is meant to be. Every creature has real
height. Drips hang in empty black and simply stop; they never pool or spread at the
bottom.

(A creature the description below says FLOATS is the other allowed case, and it is
the opposite of lying down, not an exception to it: it hangs clear of the ground
with empty black beneath it, so there is no contact to sell at all. What is banned
is the middle case — something spread out ON the floor.)

WEIGHT IS SHOWN BY SAGGING, NOT BY LYING. A heavy creature stands and loses the
fight with its own weight: the middle bulges out sideways past the base, the base
spreads and loads, the top slumps and overhangs to one side, and long drips hang off
the underside. That reads as heavy at 45 pixels. Flat does not — flat just reads as
small."""


SILHOUETTE = """SILHOUETTE — this is the whole job.

Four of these stand overlapping on a 138px-tall stage, each about 40-52 pixels
across. At that size there is no colour, no texture, and no face to read. The ONLY
thing that tells one enemy from another is the OUTLINE.

So the shape must be decided, not decorated:
- Pick one bold silhouette and commit to it. State it to yourself in five words.
- The three cells keep that silhouette. Only the pose inside it changes.
- Details that vanish below 50px are wasted ink: a row of twenty small teeth, thin
  antennae, surface speckle. The answer is FEWER AND BIGGER, never NONE — six teeth
  the length of a finger read fine at 45px, while a mouth with no teeth at all reads
  as a pebble.
- Do NOT rely on shading to separate parts. Two shapes that touch must differ in
  outline, not in fill."""


NOT_CUTE = """IT IS A MONSTER. IT IS NOT A MASCOT.

BANNED, all of it:
- Big round sparkly eyes with white catchlights. No cartoon shine dots.
- Any smile, any open happy mouth, any blush, any raised cheeks.
- Symmetrical, tidy, egg-smooth outlines. Nothing that looks moulded.
- Chibi proportions — a huge head on a small body, a face filling half the shape.
- Anything you would put on a sticker.
- Anything that would pass unremarked in a field guide to real animals. If a
  naturalist could label it and move on, it is not a monster yet."""


ALIVE = """IT IS ALIVE AND IT IS COMING FOR YOU.

Not a prop, not an icon, not a mascot standing to attention. Every cell should read
as a creature that is about to do something. Even the resting frame leans forward.

Facing LEFT is wrong. Draw it facing RIGHT; the game mirrors it in code so it turns
to face the party."""


# ══ 아이콘 ═══════════════════════════════════════════════════
#
# 아이콘 생성기(`gen-icon`)와 보스 생성기(`gen-boss`)가 같이 쓴다.
# 보스 패시브 로고도 화면 위쪽에 12~16px 로 뜨는 같은 종류의 그림이다.

ICON_STYLE = """ICON RULES — this is a symbol, not a picture.

IT WILL BE SHOWN AT 12 TO 16 PIXELS. That is smaller than the text next to it.
Everything below follows from that one fact.

- ONE SHAPE. The whole icon must read as a single silhouette at a glance. Not a
  scene, not an object sitting on a background, not two things next to each other.
- FILL THE CELL. The shape touches or nearly touches all four sides of its cell.
  An icon drawn small inside its cell disappears entirely when scaled down.
- SOLID, NOT OUTLINED. Draw it as a filled white mass. A hollow outline at 14px
  becomes a grey smudge, because the outline and the hole merge.
- NO INTERIOR DETAIL. No rivets, no wood grain, no gem facets, no shading, no
  highlights. If you can only see it at full size, it is noise.
- ONE NOTCH OR CUT-OUT AT MOST, and it must be at least a fifth of the width.
  Anything finer closes up.
- STRAIGHT AND CHUNKY. Thick strokes, hard angles, flat ends. Thin tapering lines
  vanish; a 1px point at full size is nothing at icon size.
- NO PERSPECTIVE. Flat and front-on, like a road sign. These are the only images
  in this game that are NOT drawn in three-quarter view.
- CENTRED and upright. Not tilted, not dynamic, not in motion — these sit next to
  text and a tilted icon looks like a mistake.

OUTPUT A RASTER IMAGE — A PICTURE MADE OF PIXELS.
- Do NOT return SVG, vector paths, or any markup. Do not describe the shape in code.
  The answer is an IMAGE FILE, nothing else.
- Draw it on a COARSE PIXEL GRID: the shape is built from visible square blocks, and
  every diagonal is a hard staircase of those blocks. There are no smooth curves and
  no smooth diagonals anywhere.
- A clean vector-looking symbol is a failed output even when the shape is correct.
  This icon sits beside hand-placed pixel art and a smooth one reads as a sticker
  from another program.

TEST: squint until the image is a blur. If you can still name it, it is right.
If it becomes a grey blob, the shape is too busy."""

