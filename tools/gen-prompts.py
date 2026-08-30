#!/usr/bin/env python3
"""
docs/ASSET_PROMPTS.md 생성기.

  python3 tools/gen-prompts.py

프롬프트를 손으로 관리하면 스타일 지시를 고칠 때 수십 곳을 고쳐야 하고,
그래서 데이터 + 생성기로 관리한다.
받아서 슬라이스가 끝난 세트는 목록에서 지운다 — 이 문서는 "지금 필요한 것"만 담는다.
(받은 세트의 현황은 tools/sprites.config.json 과 assets/sprites/ 가 실체다)

병합 원칙
  · 일관성이 필요한 단위 = 한 "행" (같은 크리처의 4프레임 / 같은 부위의 10티어)
  · 서로 무관한 것들은 같은 시트의 다른 행에 넣어도 된다
  · 쪼개는 건 (a) 셀이 70칸을 넘거나 (b) 화면비가 근본적으로 다를 때만
"""
import os

OUT = 'docs/ASSET_PROMPTS.md'

NOTEXT = """ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- If you feel the urge to write what something is, draw one more decorative shape instead.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output."""

STYLE = """STYLE (strict, non-negotiable):
- 1-bit monochrome pixel art. ONLY two colors: pure black #000000 and pure white #FFFFFF.
- NO grayscale, NO anti-aliasing, NO gradients, NO soft edges, NO blur, NO color fringing.
- Shading ONLY via 1-bit checkerboard dithering (alternating black/white pixels).
- Chunky, clearly visible square pixels — every pixel must be a crisp hard-edged square.
- Background: solid pure black. Subjects drawn in pure white outlines and dithered fills.
- NEVER put a white, light, or filled panel behind a subject — the ground is always black.
- Retro handheld / early-1990s monochrome LCD game aesthetic. Think "Downwell", "Minit",
  and the 1-bit look of "Return of the Obra Dinn".
- Flat orthographic side view. No perspective, no cast shadows, no lighting effects.
- No watermarks, no signatures, no sparkle marks in the corners.
- No borders or frames around the whole image."""


def grid(cols, rows, extra=""):
    e = (" " + extra) if extra else ""
    r = "row" if rows == 1 else "rows"
    c = "column" if cols == 1 else "columns"
    return f"""SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: {cols} {c} x {rows} {r}.{e}
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Each subject is centered in its cell with at
  least 8px of black padding on all sides.
- Do not add extra rows of variants. Exactly {rows} {r}."""


SINGLE = "OUTPUT: a single square image, 1024x1024. No grid, no separator lines, no magenta."

ORIENTATION = """ORIENTATION LOCK — the SUBJECT line above states one pose. Use it in ALL 10 cells.
- "angled lower-left to upper-right" / "angled diagonally": the tip or head points at the
  UPPER-RIGHT corner and the grip, handle or shaft end sits at the LOWER-LEFT, at roughly
  45 degrees. This holds for every single cell, including the biggest late-tier versions.
- "standing vertically": every cell is upright.
- "front-facing" / "laid out flat": every cell keeps that same view.
- NEVER rotate an item to make it fit its cell. If a late-tier version is too long for
  the 45-degree diagonal, shorten it — do not stand it up straight.
- Do not mirror, flip, or re-angle any cell. All 10 cells share one identical pose;
  only material, size and ornament change."""

NO_CREATURES = """NO CREATURE PARTS — this is equipment, not a monster.
Nowhere on any item may there be: eyes, eyeballs, pupils, slit eyes, faces, mouths,
maws, jaws, teeth, fangs, tongues, tentacles, flesh, veins, or anything that reads as
a living thing looking back at the viewer. High tiers get their impact from
CRAFTSMANSHIP — precision, symmetry, ornament, ceremonial weight — never from horror."""

TIER_LADDER = """TIER PROGRESSION — the 10 cells are the SAME weapon/armour type at 10 escalating
tiers, read left to right then top to bottom.

THE ONE RULE THAT MATTERS: seen as a row of 32px thumbnails, each cell must look
unmistakably MORE POWERFUL AND MORE PRECIOUS than the cell before it. If cells 4 and 7
could be swapped without anyone noticing, the sheet has failed. Do not make the tiers
differ only in shading or material name — at 1-bit those differences are invisible.

Escalate on FOUR axes at once, all monotonically increasing:
 (a) SIZE      — tier 1 fills about 55% of its cell; tier 10 fills about 95%.
                 Growth is gradual and the object stays centered on the same point so it
                 still drops into one inventory slot.
 (b) SILHOUETTE— the outline gains structure: plain -> beveled -> flanged -> crested ->
                 winged. Late tiers may add fins, blade wings, a crown-like crest,
                 hanging tassels or ribbons — all SYMMETRICAL and deliberate.
 (c) DETAIL    — engraved lines, filigree, inlaid gems, layered plates, pierced openwork.
 (d) STATUS    — see the ladder below. This is the axis people actually feel:
                 junk -> soldier's kit -> knight's gear -> royal regalia.

 1 SCRAP        — broken, humble, pitiful. Chipped, notched, bent; asymmetrical and crude;
                  a rag or cord wrapped over a crack. Looks like it might break in one hit.
 2 BRONZE       — plain and honest. Smooth, blunt, no ornament. A tool, not a weapon.
 3 IRON         — thick, heavy, brutal but unrefined. Blunt outline, solid dithered mass.
 4 STEEL        — the first one that looks like a real soldier's gear. Clean bevels,
                  crisp white highlight edge, first sign of symmetry and craft.
 5 SILVER       — knightly and elegant. Engraved scrollwork; a slight flare at the edges;
                  small pointed accents appear.
 6 GOLD         — heroic and ornate. Filigree curls, an inset gem, a flared crest.
                  Clearly a champion's item.
 7 PLATINUM     — cold, exact, ceremonial. Layered geometric plates, hard mirrored
                  symmetry, thin engraved borders. Looks machined by masters.
 8 MITHRIL      — arcane and refined. Openwork cutouts, punched rune circles, slender
                  proportions. Light and impossibly clean.
 9 ORICHALCUM   — radiant and crystalline. Faceted spires along the edges, engraved rays
                  radiating from a central inlaid stone. A relic on display.
10 DRAGON SCALE — IMPERIAL REGALIA. The treasure of a royal house: overlapping
                  dragon-scale plating used as decorative armour panels, a tall symmetrical
                  crest, gilded borders, a large central gem, and a hanging tassel or
                  ribbon. Majestic, ceremonial, dignified — the kind of object carried on a
                  cushion in a coronation, not something that hunts you. Biggest and most
                  ornate cell on the sheet.

Because this is 1-bit black and white, the impression MUST come from the SILHOUETTE and
the density of engraved detail: symmetry, crests, flanges, tassels, radiating lines.

It is still the same kind of object in every cell — a sword stays a sword, a boot stays a
boot. Tier 1 is something scavenged off a corpse; tier 10 is something an emperor
would keep behind glass."""


def rows_block(items, what="item type"):
    lines = [f"Each ROW is one {what}, shown at 10 escalating tiers (10 columns).", ""]
    for i, (_, ko, desc) in enumerate(items, 1):
        lines.append(f"Row {i} — {desc}")
    return "\n".join(lines)


MELEE = [
    ("spear", "창", "a long polearm with a leaf-shaped blade at the tip, angled lower-left to upper-right"),
    ("sword", "검", "a straight double-edged sword with a crossguard and pommel, angled lower-left to upper-right"),
    ("blade", "도", "a single-edged curved sabre with a guarded hilt, angled lower-left to upper-right"),
    ("axe", "부", "a battle axe with a broad crescent head on a shaft, angled diagonally"),
    ("mace", "추", "a mace with a spiked ball head on a short handle, angled diagonally"),
    ("hammer", "망", "a war hammer with a huge rectangular head and short thick handle, angled diagonally"),
]
RANGED = [
    ("bow", "활", "a bow with curved limbs and a taut drawn string, standing vertically"),
    ("crossbow", "노", "a crossbow with horizontal limbs, stock and cranked string, seen slightly from above"),
    ("staff", "봉", "a long wooden staff with a focus stone set at the top, standing vertically"),
    ("rod", "장", "a short ornate wand with a decorated tip, angled diagonally"),
    ("fan", "선", "an open semicircular ribbed folding fan, angled diagonally"),
]
ARMOR = [
    ("shoulder", "견갑", "a single shoulder pauldron of layered overlapping plates, front-facing"),
    ("chest", "흉갑", "a breastplate with a central ridge and shoulder straps, front-facing"),
    ("helm", "투구", "a closed helmet with a narrow horizontal eye slit, front-facing"),
    ("glove", "장갑", "an armored gauntlet with articulated fingers, palm toward the viewer"),
    ("greaves", "각갑", "a pair of leg plates standing side by side, front-facing"),
    ("boot", "신발", "a single armored boot seen from the side, toe pointing right"),
]
ACC = [
    ("ear", "귀걸이", "a single earring: a hook with a hanging pendant drop"),
    ("neck", "목걸이", "a necklace: a chain loop with a large pendant hanging at the bottom"),
    ("ring", "반지", "a ring at a three-quarter angle with a raised setting on top"),
    ("belt", "허리띠", "a waist belt with a buckle, laid out flat and horizontal"),
]

# ── 지금 필요한 것 ─────────────────────────────────────

"""
귀걸이 재요청 (§E18-R).

들어온 시트를 열어 보니 10칸 중 5칸이 못 쓴다.

  t1  귀걸이가 아니다 — 깃털인지 발톱인지 모를 형체
  t2  가로로 납작한 칸에 작은 귀걸이가 왼쪽에 치우쳐 떠 있다 (셀 비율이 깨졌다)
  t3  **귀걸이가 두 개** 나란히 그려져 있다
  t5  용 머리 아래 왕관. 아예 다른 물건이다
  t10 고리가 없다. 술이 달린 장식이라 펜던트로 읽힌다

원본 시트(`assets/new-new-image/3e11e44f-….jpeg`)를 열어 보면 원인이 둘이다.

**첫째, 격자가 균등하지 않다.** 맨 오른쪽 칸 하나가 **두 행을 통째로** 차지하고,
윗줄은 6칸 아랫줄은 5칸이다. 슬라이서 설정은 `"grid": [5, 2]` 로 균등 분할을
강제하고 있었다 (마젠타 검출이 아니라). 그래서 자르는 선이 칸 한가운데를 지나갔다.

  · t3 의 "귀걸이 두 개" = 경계가 칸 사이가 아니라 칸 안쪽에 떨어진 결과
  · t5(용 머리 + 왕관)와 t10(솔방울 + 술) = **오른쪽 큰 칸 하나**를 위아래로 자른 조각

**둘째, 그림 자체도 일부 틀렸다.** t1 은 무엇인지 알 수 없는 형체고, 오른쪽 큰
칸의 물건은 애초에 귀걸이가 아니다.

그래서 다시 자르는 걸로는 못 고친다 — 시트를 다시 받아야 한다.

프롬프트에는 "a single earring" 이라고 **한 번** 적어 둔 게 전부였다. 장신구는
원래 쌍으로 파는 물건이라 생성 모델의 기본값이 쌍이고, 한 번 적은 말로는 안
뒤집힌다. 10티어가 고리를 잃은 것도 TIER_LADDER 의 10티어 설명("hanging tassel
or ribbon") 을 따르다 정작 귀에 거는 부분을 잊은 것이다.

아래 EAR_ONE 이 세 가지를 반복해서 못박는다 — **한 짝**, **고리**, **균등 격자**.
그리고 TIER_LADDER 보다 먼저 읽으라고 명시한다 (사다리와 부딪히는 지점이 있다).
"""

EAR_ONE = """EARRING RULES — read these before the tier ladder, they outrank it.

ONE EARRING PER CELL. Not a pair. Not two. Not a matched left and right.
- Jewellery is normally sold in pairs, so the reflex is to draw two. Do not.
  Every cell contains exactly ONE earring, alone, centred.
- Do not draw a second smaller earring beside it, behind it, or mirrored.
- Do not draw the same earring twice at different angles in one cell.
- If a cell contains two hanging objects, that cell has failed.

EVERY CELL HAS AN EAR HOOK. Without it this is a pendant, not an earring.
- Top of the cell: an open C-shaped or J-shaped ear wire, clearly a hook that goes
  through an earlobe. It is present in all 10 cells, including tier 10.
- Below it: the ornament, hanging from the hook by a small ring or bail.
- The hook stays roughly the same size in all 10 cells. Only the ornament grows.
- The whole thing is vertical: hook at the top, ornament straight below it,
  standing upright in the cell. Never lying on its side, never at an angle.

WHAT AN EARRING IS NOT — do not draw any of these:
  a crown, a tiara, a necklace, a pendant on a chain, a brooch, a ring,
  a feather, a claw, a dragon head, a creature of any kind, a tassel with no hook.

CELL SHAPE — a strict 5 x 2 grid of TEN identical rectangles.
- Every cell is TALL: clearly taller than it is wide.
- All 10 cells are exactly the same width and exactly the same height.
- NO cell spans two rows. NO cell is taller or wider than its neighbours. There is no
  large feature cell, no hero panel, no oversized final tier occupying a full column.
- Each row has exactly 5 cells. Not 4, not 6. Both rows have the same 5 column
  boundaries, so the magenta vertical lines run straight from top to bottom of the
  whole sheet without a jog.
- The earring is centred in its cell and fills it top to bottom. No cell is short,
  half empty, or has its subject pushed to one side.
- Tier 10 is the biggest earring, but it lives in the SAME SIZE cell as tier 1. It
  gets its weight from ornament and detail, not from a bigger box."""

"""
스테이지 우두머리 (§B1).

홈 화면이 2D 횡스크롤 자동 전투로 바뀌었다 (`src/screens/home/BattleView.tsx`).
왼쪽에 아군, 오른쪽에 적이 서서 마주 본다.

필요한 것은 대부분 **이미 있었다** — `cr_*` 열 종의 4프레임(idle·windup·attack·
down), `duel` 8프레임(옆모습 전사), `bg_chapter` 배경 10장, `fx` 타격 이펙트.
전부 오른쪽을 보고 그려져 있어서 아군만 뒤집어 쓴다.

**빠진 건 우두머리 하나다.** 지금은 같은 스프라이트를 크게 그려서 쓰는데,
그러면 "슬라임" 과 "슬라임 우두머리" 가 크기만 다른 같은 그림이다. 스테이지의
벽이자 다음 스테이지로 가는 문인데 그게 안 읽힌다.

한 시트에 열 종을 다 넣는다 — 우두머리끼리 **격이 같아 보여야** 하고, 따로
요청하면 어떤 놈은 왕관을 쓰고 어떤 놈은 안 쓴 채로 나온다.
"""

BOSS_RULES = """BOSS RULES — these are the same ten creatures, promoted.

- Each cell is the SAME SPECIES as the ordinary monster of that name, made into its
  leader. A player must recognise it instantly as "that thing, but the boss".
- Do NOT redesign the creature. Same body plan, same silhouette family, same number
  of limbs and eyes. You are adding rank, not inventing a new monster.
- Show rank with THREE things, and use at least two of them in every cell:
    (a) SIZE — the boss fills about 95% of its cell where the ordinary one would
        fill 60%. It is visibly bulkier, not just scaled up.
    (b) A WORN MARK — a crown, a circlet, a broken helm, a bone collar, a torn
        banner strapped on, a ring of spikes. One clear worn object, never two.
    (c) BATTLE HISTORY — chipped horns, a cracked shell, scars, a notched ear,
        one missing claw. It survived things.
- All ten are drawn at the same rank. No cell may look like a mid-boss next to
  another cell's final boss.
- POSE: standing, side view, FACING RIGHT, feet on an implied ground line at the
  bottom of the cell. Identical facing in all ten.
  (Every sprite in this game is drawn facing right and mirrored in code where needed —
  the party stands on the left facing right, the enemies stand on the right and get
  flipped. Draw facing right and nothing else.)
- No background, no ground texture, no cast shadow. Solid black behind the creature.
- NO human characters, NO weapons held in hands, NO armour sets. These are beasts."""

FX_RULES = """EFFECT SHEET RULES — this is not a picture of a thing, it is a flash of motion.

- Each ROW is ONE effect played as 5 frames, read left to right. Frame 1 is the
  effect appearing, frame 5 is it almost gone.
- The 5 frames of a row must READ AS ONE MOTION. Draw the row as a single sweep and
  then cut it into five, not as five separate drawings of the same shape.
- GROWTH THEN FADE: frames 1-2 grow fast and are the brightest and densest;
  frames 3-5 spread wider and break apart into fewer, thinner marks. By frame 5 only
  a few sparse fragments remain. Never fade by drawing the same shape smaller.
- Every effect is CENTRED on the same point in its cell and stays centred. The shape
  expands outward from that point; it does not drift across the cells.
- WHITE ON BLACK, and mostly EMPTY. An effect that fills its cell is a white blob on
  top of the character. Aim for roughly a third of the cell covered at the peak frame.
- Bold, chunky, confident marks — thick tapering strokes, hard-edged shards, straight
  speed lines. NOT fine sparkles, NOT soft glows, NOT dotted mist.
- NO characters, NO weapons, NO creatures, NO ground, NO background. Just the effect.
- These are composited over an enemy sprite at about 40px, so each frame must be
  legible as a silhouette at that size."""

ACTIVE = [
    (
        "F1", "전투 타격 이펙트 8종 × 5프레임", "높음",
        "홈 전투에서 파티원 넷이 **각자 제 박자로** 치고, 칠 때마다 제 이펙트가 적 "
        "위에서 터집니다. 여럿이 어긋나게 겹쳐 터지는 게 \"파바바박\" 의 정체입니다.\n\n"
        "지금 있는 `fx/` 는 burst·shatter·smoke·glow 넷인데 **전부 폭발 계열**이라 "
        "\"때렸다\" 로 안 읽힙니다. 베기·찌르기·충격파가 없습니다.\n\n"
        "**캐릭터마다 공격 애니메이션을 따로 그리지 않습니다.** 열두 명 × 16프레임 = "
        "192칸이 되고, 새 캐릭터마다 열여섯 칸이 또 필요합니다. 대신 **몸과 이펙트를 "
        "나눕니다** — 캐릭터는 짧은 동작(§P 시트)만 갖고, 화려함은 이 공용 한 벌에서 "
        "옵니다. 개성은 `src/core/chars.ts` 의 `fx` 한 줄로 정합니다. 격투 게임이 "
        "타격 스파크를 전원이 공유하는 것과 같은 방식입니다.\n\n"
        "받으면 아래 줄을 `tools/sprites.config.json` 에 넣고 `python tools/slice.py`, "
        "그다음 `src/screens/home/HitFx.tsx` 의 `SET` 을 "
        "`{ set: 'hitfx', name: kind }` 로 바꾸면 끝입니다." + "\n"
        "```json\n"
        '{ "file": "<§F1 파일명>", "name": "hitfx", "expect": [5, 8],' + '\n' +
        '  "labels": [' +
        '"slash_1","slash_2","slash_3","slash_4","slash_5",' + '\n' +
        '             "cross_1","cross_2","cross_3","cross_4","cross_5",' + '\n' +
        '             "thrust_1","thrust_2","thrust_3","thrust_4","thrust_5",' + '\n' +
        '             "smash_1","smash_2","smash_3","smash_4","smash_5",' + '\n' +
        '             "arcane_1","arcane_2","arcane_3","arcane_4","arcane_5",' + '\n' +
        '             "star_1","star_2","star_3","star_4","star_5",' + '\n' +
        '             "holy_1","holy_2","holy_3","holy_4","holy_5",' + '\n' +
        '             "chaos_1","chaos_2","chaos_3","chaos_4","chaos_5"] }' + '\n' +
        '```'
        ,
        "SUBJECT: 8 rows of 5 frames. Each ROW is one impact effect animating over "
        "5 frames, left to right. No characters, no weapons — only the effect.\n\n"
        'Row 1 — SLASH: a single curved sword cut. A thick crescent arc sweeping from upper left to lower right, tapering to a point at both ends. It thins, lengthens and breaks into two or three separate arc fragments.' + '\n' +
        'Row 2 — CROSS: two crescent arcs crossing at right angles in an X. The second arc lands one frame after the first, then both break apart into shards.' + '\n' +
        'Row 3 — THRUST: a straight horizontal spear of speed lines driving to the right, with a small burst of short lines at the impact point. The lines stretch longer and thinner, then scatter.' + '\n' +
        'Row 4 — SMASH: a heavy downward impact. A flattened shockwave ring spreading sideways along the ground plane, with chunky debris shards kicked upward. The ring widens and flattens until only the debris is left.' + '\n' +
        'Row 5 — ARCANE: a magic circle. A ring with straight radial spokes and a smaller inner ring, drawn flat and facing the viewer. It spins wider, the ring cracks, and the spokes fly outward.' + '\n' +
        'Row 6 — STAR: a scatter of bold four-pointed stars bursting outward from the centre, biggest in the middle. They spread apart and shrink to a few small stars at the edges.' + '\n' +
        'Row 7 — HOLY: a vertical pillar of light. A tall narrow column of straight lines rising from the ground, with a horizontal ring of light around its base. The column widens and dissolves upward into separate streaks.' + '\n' +
        'Row 8 — CHAOS: an untidy burst of mismatched shards, short curved slashes and straight lines all at different angles, with no symmetry at all. It scatters outward and thins into scattered specks.' + '\n',
        FX_RULES + '\n\n' +
        grid(5, 8, "Each row is one effect, its 5 frames read left to right. "
                   "Row 1 is at the top, row 8 at the bottom."),
    ),
    (
        "B1", "스테이지 우두머리 10종", "높음",
        "홈이 2D 횡스크롤 자동 전투가 됐습니다 — 왼쪽 아군, 오른쪽 적. 스테이지마다 "
        "잡몹이 **2분 동안 여럿씩 몰려오고**, 시간이 지나면 **우두머리**가 나옵니다. "
        "잡으면 다음 스테이지입니다.\n\n"
        "일반 몹 4프레임(`cr_*`)·전사 8프레임(`duel`)·배경(`bg_chapter`)·타격 "
        "이펙트(`fx`)는 **이미 다 있습니다.** 빠진 건 우두머리뿐입니다. 지금은 같은 "
        "그림을 크게만 그려서, 스테이지의 벽이자 다음 스테이지로 가는 문이라는 게 "
        "전혀 안 읽힙니다.\n\n"
        "열 종을 한 장에 넣습니다 — 따로 요청하면 어떤 놈만 왕관을 쓰고 나옵니다.\n\n"
        "받으면 `tools/sprites.config.json` 에 아래 줄을 넣고 `python tools/slice.py`, "
        "그다음 `src/core/autoBattle.ts` 의 `FOE_KINDS` 에서 우두머리 아트를 "
        "`boss_*` 로 가리키게 하면 됩니다.\n\n"
        "```json\n"
        '{ "file": "<§B1 파일명>", "name": "boss", "expect": [5, 2],\n'
        '  "labels": ["slime","bat","boar","wolf","skeleton","toad","mantis","ogre","golem","tentacle"] }\n'
        "```",
        "SUBJECT: 10 cells, each one BOSS creature standing in side view facing RIGHT.\n"
        "These are the leaders of ten ordinary monster types, in this exact order:\n\n"
        "Cell 1 — a giant slime: a heavy rounded blob with a thick skin fold at the base, "
        "one large eye, and a small crooked crown sunk into the top of its body.\n"
        "Cell 2 — a giant bat: broad ribbed wings spread wide, hooked thumb claws, "
        "tattered wing membrane with holes torn through it, a bone circlet on the brow.\n"
        "Cell 3 — a giant boar: a bulky tusked hog, one tusk snapped short, bristled "
        "ridge along the spine, a heavy studded collar around the neck.\n"
        "Cell 4 — a giant wolf: a heavy-shouldered wolf with hackles raised, a notched "
        "ear, bared fangs, a chain of teeth hung across the chest.\n"
        "Cell 5 — a giant skeleton: a broad-framed skeletal figure, cracked ribs, one "
        "arm bone bound with cord, a broken helm resting on the skull.\n"
        "Cell 6 — a giant toad: a squat wide-mouthed toad, warted back, throat sac "
        "distended, a torn banner strapped over its back.\n"
        "Cell 7 — a giant mantis: a tall thin insect with oversized raptorial forelimbs, "
        "one limb chipped at the edge, a spiked ring around the thorax.\n"
        "Cell 8 — a giant ogre: a hulking brute, sloping shoulders, one broken horn, "
        "a heavy iron ring through the ear, scars across the chest.\n"
        "Cell 9 — a giant golem: a mass of stacked stone slabs, one slab cracked "
        "clean through, a carved circlet band around the head block.\n"
        "Cell 10 — a giant tentacle horror: a thick central trunk with several heavy "
        "tentacles fanning out and down, one tentacle stump severed, a bone crown "
        "ringing the top of the trunk.",
        BOSS_RULES + "\n\n" + NO_CREATURES.replace(
            "NO CREATURE PARTS — this is equipment, not a monster.\n", "").replace(
            "Nowhere on any item may there be: eyes, eyeballs, pupils, slit eyes, faces, mouths,\n"
            "maws, jaws, teeth, fangs, tongues, tentacles, flesh, veins, or anything that reads as\n"
            "a living thing looking back at the viewer. High tiers get their impact from\n"
            "CRAFTSMANSHIP — precision, symmetry, ornament, ceremonial weight — never from horror.",
            "").strip() + "\n\n"
        + grid(5, 2, "Reading order is left to right, then top to bottom: cell 1 is "
                     "top-left, cell 10 is bottom-right. Every cell is the same size."),
    ),
    (
        "E18-R", "귀걸이 10티어 (재요청)", "높음",
        "들어온 시트에서 t1·t2·t3·t5·t10 다섯 칸을 못 씁니다 — 특히 **t3 은 귀걸이가 "
        "두 개** 그려져 있습니다. 귀 칸이 하나로 줄었으니 한 짝만 보여야 합니다.\n\n"
        "원본 시트의 **격자가 균등하지 않은 게 진짜 원인**입니다. 맨 오른쪽 칸 하나가 "
        "두 행을 통째로 차지하는데 5×2 로 강제 분할해서, 자르는 선이 칸 한가운데를 "
        "지나갔습니다. t5(용 머리)와 t10(솔방울)은 그 큰 칸 하나를 위아래로 자른 "
        "조각입니다. 그림 자체도 t1 과 오른쪽 큰 칸은 귀걸이가 아니라서, **다시 자르는 "
        "걸로는 못 고칩니다.**\n\n"
        "칸 하나만 다시 받아도 안 됩니다 — 그 칸만 화풍이 튑니다. "
        "**시트 전체를 다시 뽑으세요.**\n\n"
        "받으면 `tools/sprites.config.json` 의 `eq_ear` 줄에서 `file` 을 새 파일명으로 "
        "바꾸고, `\"grid\": [5, 2]` 를 **`\"expect\": [5, 2]` 로 바꾸세요** — 마젠타 "
        "경계를 실제로 찾아서 자릅니다. 그다음 `python tools/slice.py` 를 돌리면 "
        "지금 t1~t10 을 덮어씁니다. 장인 등급(`t11`)은 §A2 에서 온 것이라 멀쩡하니 "
        "건드리지 않습니다.",
        "SUBJECT: 10 cells. Each cell is ONE single earring, shown alone, standing "
        "upright: an ear hook at the top with an ornament hanging below it. The same "
        "kind of object in all 10 cells, at 10 escalating tiers.",
        EAR_ONE + "\n\n" + NO_CREATURES + "\n\n" + TIER_LADDER + "\n\n"
        + grid(5, 2, "Reading order is left to right, then top to bottom: tier 1 is "
                     "top-left, tier 10 is bottom-right."),
    ),
]


ALL_PARTS = MELEE + RANGED + ARMOR + ACC

# 장비 26장(E1~E26)과 길드 2장(G1·G2)은 **완료**되어 목록에서 뺐습니다.
#   → assets/sprites/eq_*/t1~t10 · assets/sprites/guild, guild_ui
# 다시 뽑아야 할 일이 생기면 git 이력에서 되살리면 됩니다.


# ── 지도 · 정령의 숲 · 정령석 ───────────────────────────

# ── 칭호 ────────────────────────────────────────────────

# ── 새 콘텐츠 (채집 · 심연 · 연금술 · 오락실) ─────────────

# 채집 도구 3장(T1 채집 · T2 수렵 · T3 낚시)은 **완료**되어 목록에서 뺐습니다.
#   → assets/sprites/tool/{gather,hunt,fish}_F ~ _S · sprites.config.json 에 슬라이스 기록 있음
# 다시 뽑아야 할 일이 생기면 git 이력에서 되살리면 됩니다.


# ── 완료되어 목록에서 뺀 것들 ──────────────────────────
#
# §R1·§R2 (레이드 보스 16종) · §U1 (튜토리얼 아이콘 10종) · §U2 (이벤트 배너 6종)
# §U3 (투기장 결투 8프레임) · §E-G (각갑 재요청) — 전부 **납품·슬라이스 완료**되어
# 여기서 뺐습니다.
#   → assets/sprites/{raid_boss, tutorial, event, duel, eq_greaves}
# 다시 뽑을 일이 생기면 git 이력에서 되살리면 됩니다.


# ── 완료되어 목록에서 뺀 것들 (2026-08 추가분) ─────────
#
# §L1 (여캐 로고 4종) · §L2 (엘프 NPC 2컷) — 납품·슬라이스 완료.
#   → assets/sprites/avatar/{bunnyblade,maidhammer,witchgirl,knightgirl}
#   → assets/sprites/elf/{stand,portrait}
# 다시 뽑을 일이 생기면 git 이력에서 되살리면 됩니다.


# ── 완료되어 목록에서 뺀 것들 (마을 사람들) ────────────
#
# §N1 (대장간 장인 2컷) · §N2 (선술집 점원 4컷) — 납품·슬라이스 완료.
#   → assets/sprites/smith/{stand,portrait}
#   → assets/sprites/maid/{stand,portrait,happy,shy}
# 다시 뽑을 일이 생기면 git 이력에서 되살리면 됩니다.


head = f"""# 이미지 생성 프롬프트

**이 파일은 자동 생성됩니다** — `python3 tools/gen-prompts.py`.
프롬프트를 고치려면 생성기의 데이터를 고치세요. 손으로 편집하면 다음 실행에 덮어씁니다.

**사람 그림은 여기 없습니다** — 플레이어 캐릭터와 NPC 는
[CHARACTER_ART_PROMPTS.md](CHARACTER_ART_PROMPTS.md) (`tools/gen-char-prompts.py`) 에
따로 있습니다. 장비는 티어마다 달라 보여야 성공이고 캐릭터는 컷마다 같아 보여야
성공이라, 정반대 규칙을 한 파일에 넣으면 둘 다 무너집니다.

각 코드블록을 **그대로 복사해서** Gemini 에 넣으세요. 스타일 지시와 시트 레이아웃 규칙이
블록 안에 이미 들어 있습니다. 앞뒤에 뭘 붙일 필요 없습니다.

## 지금 필요한 것 — {len(ACTIVE)}장

{"**없습니다.** 코드가 요구하는 스프라이트가 전부 들어와 있습니다. 새 기능을 붙이다"
 " 그림이 필요해지면 `tools/gen-prompts.py` 의 ACTIVE 에 한 항목을 더하고 다시 돌리세요."
 if not ACTIVE else "| # | 내용 | 격자 | 셀 | 우선순위 |"}
{"" if not ACTIVE else "|---|---|---|---|---|"}
"""

rowsmd = []
for pid, title, prio, why, subject, tail in ACTIVE:
    import re
    m = re.search(r'grid: (\d+)', '')
    g = re.search(r'(\d+) (?:column|columns) x (\d+) (?:row|rows)', tail)
    cells = int(g.group(1)) * int(g.group(2)) if g else 1
    gs = f"{g.group(1)}×{g.group(2)}" if g else '단일'
    rowsmd.append(f"| §{pid} | {title} | {gs} | {cells} | {prio} |")

body = [head + "\n".join(rowsmd) + """

### 왜 장비는 부위별로 한 장씩인가

한 번 10열짜리 통합 시트(6부위 × 10티어 = 60칸)로 묶어 봤는데 되돌렸습니다.

- **셀이 좁아집니다.** 10열이면 셀 폭이 5열의 절반입니다. 티어 진화의 핵심인
  필리그리·룬 구멍·결정 돌기·비늘 같은 디테일이 그 크기에서 뭉개집니다.
- **재시도 단위가 커집니다.** 한 부위만 잘못 나와도 60칸을 통째로 다시 뽑아야 합니다.
  부위별로 끊으면 마음에 안 드는 것만 다시 요청하면 됩니다.

같은 이유로 **한 시트 안의 10칸은 반드시 같은 부위**여야 합니다 — 따로 요청하면
같은 부위인데 티어마다 다른 물건이 나옵니다 (크리처 프레임에서 이미 겪은 문제).

§A2 만 예외로 방어구·장신구를 한 장에 묶었습니다 — 10칸뿐이고, 장인 등급은 티어
진화가 없어 한 부위당 한 칸이면 끝나기 때문입니다.

### 마젠타 경계선

셀 사이에 `#FF00FF` 선을 넣게 지시합니다. 흑백 팔레트 밖의 색이라 슬라이서가 셀
경계를 100% 정확히 찾아 자를 수 있고, 잘려나가는 픽셀이라 아트에는 영향이 없습니다.

---
"""]

for pid, title, prio, why, subject, tail in ACTIVE:
    body.append(f"## §{pid}. {title}\n")
    if why:
        body.append(why + "\n")
    body.append("```\n" + NOTEXT + "\n\n" + subject + "\n\n" + STYLE + "\n\n" + tail + "\n```\n")

# 장비 시트가 오면 붙일 슬라이서 설정 (복붙용)
_T10 = '["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"]'
EQ_CFG = "```json\n" + ",\n".join(
    f'{{ "file": "<§E{i} {ko} 파일명>", "name": "eq_{folder}", "expect": [5, 2], "labels": {_T10} }}'
    for i, (folder, ko, _d) in enumerate(ALL_PARTS, start=1)
) + "\n```"

body.append("""---

## 장비 시트 붙이는 방법

시트를 받은 만큼만 `tools/sprites.config.json` 의 `sets` 에 추가하고
`python3 tools/slice.py` 를 돌리면 끝입니다. 한 시트 = 한 폴더 = 한 부위입니다.

""" + EQ_CFG + """

코드는 이미 준비돼 있습니다 — `src/ui/equipArt.ts` 가 `eq_{부위}/t{티어}` 를 먼저 찾고,
없으면 지금의 부위 공통 아트로 떨어집니다. **시트가 한 장씩 들어와도 코드 수정이
필요 없습니다.** 티어별 아트가 붙은 칸은 테두리 프레임이 자동으로 빠집니다
(아이템 자체가 티어를 말해주므로 겹치면 시끄럽습니다).

---

## 지금 빠진 아트

`bun tools/missing-art.ts` 로 언제든 다시 셀 수 있습니다.
코드가 요구하는 키를 데이터에서 유도하므로, 새 항목을 추가하면 자동으로 잡힙니다.

**지금은 없습니다.** 코드가 요구하는 스프라이트가 전부 들어와 있습니다.

§N1(대장간 장인) · §N2(선술집 점원) · §L1(여캐 로고 4종) · §L2(엘프 NPC) ·
§R1·§R2(레이드 보스 16종) · §U1(튜토리얼 아이콘 10종) · §U2(이벤트 배너 6종) ·
§U3(투기장 결투 8프레임) · §E-G(각갑 재요청)는 모두 **납품·슬라이스 완료**되어
목록에서 뺐습니다. 채집·수렵·낚시 도구 3종, §N1~§N6(새 장소·갈라진 땅·연성액·
홀로그램·지뢰밭·칭호), §D1~§D4(채집 도감 50종·선술집 음식), 칭호 16종 ·
둔카락스 21종 · 로그인 · 지도 · 정령석 · 쿠지 · 주식 로고, 장비 26장(E1~E26)과
길드 2장도 마찬가지입니다.
다시 뽑을 일이 생기면 git 이력에서 되살리면 됩니다.

**장비 가루**(`ICONS.dust`)처럼 8×8 UI 아이콘은 시트를 안 받습니다 —
생성 모델이 그 크기를 못 만들어서 `src/ui/sprites.ts` 의 코드 스프라이트가
더 정확합니다 (아래 "알아두실 점" 참고).

## 후처리

Gemini 는 아무리 못 하게 해도 회색과 안티에일리어싱을 섞어 내놓습니다.
`tools/slice.py` 가 다음을 자동으로 처리합니다.

1. **마젠타 경계로 셀 자르기** — `#FF00FF` 행/열 검출
2. **1-bit 이진화** — 임계값 128 로 회색 제거
3. **최근접 보간 축소** — 상한 192px (bilinear 로 줄이면 도트가 뭉개짐)
4. `cropBottom` / `invert` / `killCorner` / `drop` / `pickRows` 로 개별 시트 보정
5. **흰 픽셀 + 투명 배경 PNG** → `tintColor` 로 색을 갈아끼울 수 있음
6. `src/ui/spriteAssets.ts` 인덱스 자동 생성 (Metro 가 정적 require 만 해석하므로)

새 시트를 받으면 `tools/sprites.config.json` 에 한 줄 추가하고 `slice.py` 만 돌리면 됩니다.

## 알아두실 점

- Gemini 는 **정확한 픽셀 그리드를 못 맞춥니다.** 크게 뽑아 축소하는 게 유일하게
  통하는 방법입니다. 셀 크기 지정은 참고사항 정도로만 먹습니다.
- **요청한 행보다 많이 그리는 일이 잦습니다** (변형 행을 덧붙임). 그래서 슬라이서에
  `pickRows` 가 있습니다 — 잘못 나온 게 아니니 그냥 쓸 행만 고르면 됩니다.
- **주제가 "이름이 있는 것들의 목록"이면 캡션을 붙입니다.** 그래서 모든 프롬프트 맨
  앞에 `ABSOLUTE RULE — NO TEXT` 블록이 따로 들어갑니다.
- 8×8 UI 아이콘은 생성 모델이 못 만듭니다. `src/ui/sprites.ts` 의 코드 스프라이트가
  더 정확합니다.
- 한글·숫자는 이미지에 넣지 마세요. 전부 깨집니다. 텍스트는 코드가 얹습니다.
""")

os.makedirs('docs', exist_ok=True)
open(OUT, 'w', encoding='utf-8').write("\n".join(body))
# Windows 콘솔(cp949)에서 em dash 가 터진다 — 생성 자체는 끝났는데 오류로 보인다
print('%s written: %d sheets' % (OUT, len(ACTIVE)))
