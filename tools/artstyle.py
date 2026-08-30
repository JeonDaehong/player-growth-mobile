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
