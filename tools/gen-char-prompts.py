#!/usr/bin/env python3
"""
docs/CHARACTER_ART_PROMPTS.md + docs/character-art/*.md 생성기
— 플레이어 캐릭터 · NPC 전용.

  python tools/gen-char-prompts.py

## 왜 장비 프롬프트(gen-prompts.py)와 파일을 나눴나

장비는 "같은 물건의 10티어"가 일관성 단위였다. 캐릭터는 **한 사람**이 일관성 단위다.
장비는 티어마다 달라 보여야 성공이고, 캐릭터는 컷마다 같아 보여야 성공이다.
정반대 규칙을 한 생성기에 넣으면 둘 다 무너진다.

## 이 파일이 지키려는 것 — 일관성

작업자가 제일 걱정하는 게 이거다. "나중에 동작 하나 더 만들면 그림이 딴사람이 된다."
실제로 그렇게 된다. 원인은 매번 **말로 다시 설명**하기 때문이다. 같은 사람을
두 번 묘사하면 두 사람이 나온다.

그래서 이 파일의 핵심은 프롬프트가 아니라 `LOCK` 이다. 캐릭터마다 고정된 영어
묘사 한 덩어리를 두고, 그 캐릭터가 등장하는 **모든** 프롬프트에 글자 하나 안 고치고
그대로 박아 넣는다. 새 동작이 필요하면 여기 ACTIONS 에 한 줄 더하고 다시 돌린다 —
설명을 다시 쓰지 않는다. 그게 유일하게 통하는 방법이다.
"""
import os



# ══ 공통 블록 ════════════════════════════════════════════════

NOTEXT = """ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output."""

# gen-prompts.py 의 STYLE 과 **한 글자도 다르면 안 된다** — 이미 들어온 88개
# 스프라이트 세트가 저 문장으로 만들어졌다. 여기서 살짝 다듬으면 캐릭터만
# 미묘하게 다른 화풍이 되어, 정확히 피하려던 일이 일어난다.
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

# 캐릭터 시트에만 붙는다. 장비에는 필요 없던 규칙 — 장비는 셀마다 달라야 하지만
# 캐릭터는 셀마다 같아야 한다.
SAME_PERSON = """ONE CHARACTER, MANY CELLS — the rule that matters most on this sheet.
- Every cell is THE SAME PERSON. Same face, same hair colour value and hair length,
  same outfit down to every strap, buckle and frill, same props, same body proportions,
  same height relative to the cell.
- ONLY the pose and the facial expression change between cells. Nothing else, ever.
- Do NOT offer variations, alternate outfits, alternate hairstyles, or design options.
  This is a production reference sheet, not a concept exploration.
- ASYMMETRY IS LOCKED. If a braid, scar, pauldron, eyepatch, bandage, satchel or
  hair sweep is on the character's right in one cell, it is on the character's right in
  EVERY cell — including cells where the character is turned to the side or away.
  Mirror the pose if you must, never the character's design.
- Draw all cells in a single pass as one connected character reference sheet. Do not
  draw them as separate independent pictures that happen to share a description."""

"""
모에 화풍 블록.

여섯 명(§P5~P10)에만 붙는다. 처음엔 LOCK 에 "Japanese-anime style" 이라고 한 줄
적어 두는 걸로 됐다고 생각했는데, 그 한 줄로는 **평범한 게임 캐릭터**가 나온다.
예쁘다는 건 취향 문제가 아니라 그리는 규칙 문제라서, 규칙을 적어야 한다.

그리고 이건 **1-bit 64px** 이라는 게 중요하다. 여기서 예쁨은 렌더링이 아니라
세 가지에서 나온다.

  · 눈 크기 — 얼굴 높이의 1/3, 안에 흰 반사광 한 점을 비워 둔다
  · 머리 실루엣 — 트윈테일·리본·아호게처럼 **윤곽선을 깨는 것**
  · 옷 윤곽 — 프릴·레이어드 치마·오버니삭스

속눈썹을 몇 올 그리느냐 같은 건 64px 에서 전부 뭉개진다. 큰 덩어리로만 말한다.
"""
MOE = """MOE / ANIME REGISTER — these are the pretty ones. This is not decoration; it is
the point of this character existing, so it outranks every other styling note here.

- Modern Japanese moe anime style. Soft round face, small pointed chin, and LARGE
  expressive eyes taking up roughly a third of the face height, each with one big
  white catchlight left unfilled. The eyes carry the whole face.
- Nose is one pixel notch or nothing at all. Small mouth. Do not add realistic
  facial structure — no cheekbones, no jaw shading, no nostrils.
- Head slightly large for the body: about a 1:6.5 head-to-body ratio, NOT a realistic
  1:8. Slim waist, soft sloping shoulders, small hands, long legs.
- HAIR IS THE SILHOUETTE. Every one of them has a hair shape nobody else has, with
  loose flowing strands and one stray cowlick (ahoge) standing up from the crown.
  Ribbons, bows, clasps and headbands break the outline at the top of the head.
- Costume must catch the eye in outline: frills, layered skirts with a petticoat
  showing, big ribbons, thigh-high socks, a short cape, trailing sleeves. A plain
  silhouette is a failed design here.
- Charming and appealing, never grim, never grubby, never dishevelled. Even the
  solemn one is soft and radiant.
- They are adults or older teenagers in the ordinary anime game-character register.
  This is a character select portrait — no suggestive framing, no leering camera."""

"""
잘림 방지 블록.

첫 시트에서 검이 잘려 나왔다. 원인은 생성 모델이 아니라 **내가 그렇게 시킨 것**
이었다. 세 군데가 겹쳤다.

  · strike 에 "weapon ... near the right edge" — 가장자리로 밀라고 적어 뒀다
  · guard 에 "between body and the right edge of the cell" — 같은 문제
  · 셀 예산을 "몸이 높이의 88%" 로 잡아 놓고 win 에서 무기를 머리 위로 들라고 했다.
    몸이 88% 면 남은 12% 안에 대검이 들어갈 리가 없다

세 번째가 진짜 원인이다. **셀 예산은 몸이 아니라 그림 전체로 잡아야 한다.**
무기·망토·머리카락까지 다 들어간 폭과 높이가 셀 안에 있어야 하고, 그러면 몸은
자연히 작아진다.

그리고 여덟 칸이 **같은 크기, 같은 바닥선, 같은 윗여백**이어야 한다. 조용한 컷에서
남는 공간을 채우겠다고 확대하면 애니메이션으로 이어 붙일 때 캐릭터가 커졌다
작아졌다 한다. 남는 공간은 남겨 두는 게 맞다.
"""
NO_CLIP = """NOTHING MAY BE CUT OFF — this is the failure this sheet fails at most often.

- Each cell must contain the ENTIRE drawing: the whole body AND the whole weapon from
  tip to pommel, the full swing arc, and every trailing piece of cape, hair, ribbon,
  sleeve and tassel. If any of it touches or crosses a magenta line, that cell has
  failed and the sheet is unusable.
- SIZE THE FIGURE FROM THE BIGGEST POSE, NOT FROM THE BODY. Find the pose that reaches
  furthest (usually the overhead victory pose and the extended strike), make THAT one
  fit inside its cell with room to spare, and then draw every other cell at exactly
  that same scale. The body itself ends up filling only about 60-65% of the cell
  height. That is correct — the empty space is reserved for the weapon.
- Every cell shares one ground line and one top margin. Do NOT zoom in on the calm
  poses to use up their empty space. A smaller figure with air around it is right;
  eight figures at eight different sizes cannot be played back as an animation.
- If a weapon is too long to fit, DRAW THE CHARACTER SMALLER. Never crop the blade,
  never run it off the edge, never fade it out at the boundary, and never re-angle or
  shorten the weapon just to make it fit.
- Leave at least 8px of empty black between the outermost pixel of the drawing and
  every magenta line, on all four sides of every cell."""

READABLE = """READABILITY — these are displayed small.
- Busts are displayed at about 64x64 pixels; full bodies at about 96 pixels tall.
- The silhouette must be identifiable at that size with the details thrown away.
  Give the character one big shape nobody else has: a hat, a huge pack, a mantle,
  a weapon carried at an unusual angle.
- Faces need at most: two eyes, two brows, one mouth line, and a hair shape.
  Do not draw noses as more than a single pixel notch, or nothing at all.
- Do not render fabric texture, individual hair strands, or skin shading detail.
  At this size they become noise. Big shapes, hard edges, wide dither fields."""


def grid(cols, rows, extra=""):
    e = ("\n- " + extra) if extra else ""
    r = "row" if rows == 1 else "rows"
    c = "column" if cols == 1 else "columns"
    return f"""SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: {cols} {c} x {rows} {r}.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Each subject is centered in its cell with at
  least 8px of black padding on all sides.
- Do not add extra rows of variants. Exactly {rows} {r}, exactly {cols*rows} cells.{e}"""


SPLASH = """OUTPUT: a single tall image, 1024 wide x 1536 high. One character, one pose.
No grid, no separator lines, no magenta, no extra panels."""


# ══ 표정 사다리 ══════════════════════════════════════════════
#
# 1-bit 에서 표정은 "슬프게" 같은 말로는 절대 안 나온다. 눈썹이 어디로 가고
# 입이 무슨 모양인지 픽셀 단위로 지시해야 64px 에서 읽힌다.

EMOTIONS = [
    ('calm', '평정',
     'neutral and composed. Eyes open and level, mouth one short straight line, brows '
     'flat, head upright and facing the viewer square-on. This is the default face — '
     'every other cell is a departure from THIS one.'),
    ('amused', '즐거움',
     'amused, teasing. One brow raised higher than the other, eyes narrowed into two '
     'shallow arcs, one corner of the mouth pulled up, head tilted a few degrees, chin '
     'slightly raised.'),
    ('joy', '기쁨',
     'openly delighted. Both eyes squeezed shut into happy upward arcs, mouth open in a '
     'wide smile, both brows raised high, head tilted back a little, shoulders lifted.'),
    ('trust', '신뢰',
     'trusting and steady. Eyes half-lidded and warm, a small closed-mouth smile, brows '
     'relaxed and slightly lowered, chin dipped toward the viewer in a small nod. '
     'Calm, not sleepy.'),
    ('shy', '부끄러움',
     'flustered. Eyes wide, pupils pushed to one side, brows angled up at the inner '
     'ends, mouth a small wavering line, one hand raised near the cheek, head turned '
     'away while the eyes stay on the viewer. Add 1-bit dithered blush hatching across '
     'both cheeks and the bridge of the nose.'),
    ('love', '행복',
     'quietly happy, close to fond. Eyes softened into gentle downward curves, a full '
     'closed-mouth smile, brows tilted up at the inner ends, both hands clasped near the '
     'chest, head tilted. Dithered blush hatching, lighter than the flustered cell.'),
]

# 둔카락스만 3종이다 — 남자 노장인에게 부끄러움·행복 사다리를 붙이면
# 다른 캐릭터가 된다.
SMITH_EMOTIONS = [
    ('gruff', '무뚝뚝',
     'gruff and unimpressed. Heavy brows pulled down flat, eyes narrow slits, mouth a '
     'hard straight line buried in the beard, head level, jaw set.'),
    ('amused', '즐거움',
     'gruffly amused. One brow up, eyes crinkled at the outer corners, a short bark of '
     'a laugh with the mouth open on one side, head tipped back a fraction.'),
    ('trust', '신뢰',
     'approving. Brows relaxed and level, eyes half-closed, a small closed-mouth nod of '
     'a smile, chin dipped once toward the viewer, one hand resting flat on the hammer '
     'head. This is as warm as this man gets.'),
]

# 전신 3종 (제안서 6번)
BODY_POSES = [
    ('stand', '일반',
     'standing at rest, facing the viewer square-on, weight evenly on both feet, arms '
     'relaxed at the sides, holding her signature prop in the hand the LOCK specifies. '
     'Calm neutral face.'),
    ('shy', '부끄러움',
     'half-turned away from the viewer, knees pressed together, one hand raised to the '
     'cheek and the other arm crossed low over the body, shoulders drawn in, looking '
     'back at the viewer over the shoulder. Flustered face with dithered blush.'),
    ('joy', '기쁨',
     'leaning forward toward the viewer, both arms raised or thrown out wide, one heel '
     'lifted off the ground mid-bounce, hair and clothing swung by the motion. '
     'Openly delighted face. Both hands, all the swung hair and every trailing sleeve stay inside the cell.'),
]

# 플레이어 캐릭터 전신·전투 8컷
PC_ACTIONS = [
    ('stand', '대기',
     'standing at rest, facing the viewer square-on, weight on both feet, weapon held '
     'low or sheathed, calm confident face.'),
    ('walk', '걷기',
     'mid-stride walking, seen from the side and facing RIGHT, front leg forward and '
     'back heel lifted, opposite arm swung forward, cloak or hair trailing back.'),
    ('guard', '전투 대기',
     'combat ready stance, seen from the side and facing RIGHT, knees bent, weight '
     'back on the rear foot, weapon raised into a guard in front of the chest. The '
     'whole weapon stays well inside the cell with black space beyond its tip.'),
    ('windup', '준비',
     'winding up, seen from the side and facing RIGHT, torso twisted back and away, '
     'weapon drawn back behind the head or hip, front foot planted, coiled. Draw the '
     'figure smaller if that is what it takes to keep the whole raised weapon inside '
     'the cell.'),
    ('strike', '타격',
     'the strike landing, seen from the side and facing RIGHT, body extended forward past the front foot, '
     'the weapon at the end of its arc with its tip and the trailing speed lines all '
     'still inside the cell. One or two straight white speed lines follow the arc. '
     'This is the widest pose on the sheet, so it sets how big the figure can be.'),
    ('hit', '피격',
     'taking a hit, seen from the side and still facing RIGHT, head snapped back, torso '
     'recoiled, both arms flung up and back, one foot skidding, weapon nearly dropped '
     'but still fully drawn inside the cell.'),
    ('win', '승리',
     'victory, facing the viewer square-on, weapon raised overhead in one hand, other '
     'fist clenched at the side, chin up, feet planted wide. The weapon tip and any '
     'pennant or tassel on it stay inside the cell with black space above them — this '
     'is the tallest pose on the sheet, so it sets the headroom for every cell.'),
    ('lose', '패배',
     'defeated, seen from the side and facing RIGHT, down on one knee, head bowed, '
     'weapon planted point-down in the ground and used as a prop by both hands.'),
]


# ══ 플레이어 캐릭터 12종 ═════════════════════════════════════
#
# (id, 한글 이름, 획득처, 계열, LOCK)
#
# 계열은 네 갈래다 — plain(기본 4) · moe(여캐 6) · anime(대공) · comic(광대).
# 예쁨은 취향이 아니라 규칙이라, moe 에만 MOE 블록이 따로 붙는다.
# 톤이 같으면 얻은 티가 안 난다 (avatars.ts 가 12+4 를 가른 것과 같은 이유).

# 계열 — 화풍이 갈리는 단위. 표와 프롬프트가 같은 값을 쓴다
FAM_NAME = {
    'plain': '기본 (거리에서 굴러먹은 얼굴)',
    'moe':   '일본 애니메이션 · 모에',
    'anime': '일본 애니메이션 (남)',
    'comic': '개그',
}
FAM_SHORT = {'plain': '기본', 'moe': '모에', 'anime': '애니풍', 'comic': '개그'}

PCS = [
    ('pc_swordsman', '견습 검사', '기본 (남)', 'plain',
     'A young man in his late teens. Short cropped dark hair with a blunt fringe, '
     'a plain determined face with a small nick of a scar on the chin. He wears a '
     'sleeveless boiled-leather jerkin over a loose linen shirt with the sleeves rolled '
     'to the elbow, a single wide strap running diagonally across his chest from his '
     'LEFT shoulder to his right hip, cloth wraps on both forearms, and heavy laced '
     'boots. A plain straight arming sword with a simple cross guard hangs at his LEFT '
     'hip. No cape, no ornament, no armour plates — he owns nothing that shines.'),

    ('pc_ranger', '떠돌이 사냥꾼', '기본 (남)', 'plain',
     'A broad heavy-set man in his forties, a full head taller than the swordsman. '
     'Thick stubble over a square jaw, deep-set eyes under a heavy brow, hair tied back '
     'in a short stub. He wears a hooded travelling cloak thrown BACK off both shoulders '
     'so the hood hangs empty behind his neck, a fur-trimmed collar, a padded gambeson '
     'belted at the waist, and thick fingerless gloves. A short recurve bow is slung '
     'across his back on his RIGHT side and a quiver rides on his LEFT hip. Mud to the '
     'knee on both boots.'),

    ('pc_spearwoman', '방랑 창잡이', '기본 (여)', 'plain',
     'A tall lean woman in her twenties, the tallest of the four starting characters. '
     'Long dark hair pulled into a high ponytail that swings free, a level unsmiling '
     'face, a thin scar crossing her LEFT cheekbone. She wears a sleeveless knee-length '
     'tunic split at both sides for movement, a half-cuirass of small overlapping scales '
     'over the chest only, a wide sash wound twice around the waist, and leather greaves '
     'laced up the shins. She holds a long spear upright in her RIGHT hand, butt planted '
     'on the ground, the leaf-shaped head above her own head height.'),

    ('pc_scholar', '견습 마도사', '기본 (여)', 'plain',
     'A small slight woman, the shortest of the four starting characters, with a soft '
     'round face. Straight hair cut in a blunt chin-length bob with a straight fringe, '
     'and round-lensed spectacles that catch one flat white highlight. She wears a long '
     'buttoned coat down to the calf over a pleated skirt, a high collar buttoned to the '
     'throat, and flat shoes. A heavy satchel of books hangs from her LEFT shoulder to '
     'her right hip, stuffed so full the flap will not close. She carries a plain '
     'unadorned wooden staff in her RIGHT hand, shorter than she is.'),

    ('pc_bunny', '칼 찬 바니걸', '골드 쿠지', 'moe',
     'A pretty anime young woman with a teasing half-lidded look and one small fang '
     'showing at the corner of her smile. Very long straight hair past the waist with a '
     'blunt fringe, two long side locks framing her face, and one tall stray cowlick '
     '(ahoge) standing up from the crown; the ends are tied with two small ribbons. '
     'A pair of tall upright rabbit ears on a wide headband, the LEFT ear bent over at '
     'the tip. She wears a high-collared sleeveless leotard bodysuit with a short '
     'swallow-tail coat over it, stiff white cuffs on both wrists, a bow tie at the '
     'throat, and sheer thigh-high stockings. A slim straight longsword is worn '
     'diagonally across her BACK with the hilt rising past her RIGHT shoulder. '
     'A round fluffy tail.'),

    ('pc_maidhammer', '망치 든 메이드', '다이아 쿠지', 'moe',
     'A pretty anime young woman, beaming and unreasonably strong, with a wide open '
     'smile and a stray cowlick. Hair in two long low twin tails tied off with big '
     'ribbon bows, plus a frilled maid headband with two trailing ribbons down her back. '
     'She wears a long-sleeved dress under a full frilled apron tied in an enormous bow '
     'at the small of the back, a layered knee-length skirt with a petticoat showing at '
     'the hem, thigh-high socks and buckled shoes. An oversized blacksmith sledgehammer '
     '— the head as big as her own torso — rests on her RIGHT shoulder, held there '
     'one-handed as if it weighed nothing. A soot smudge on her LEFT cheek.'),

    ('pc_witch', '견습 마법소녀', '다이아 구매', 'moe',
     'A pretty anime girl, the youngest-looking of the roster, with huge round eyes and '
     'a delighted open smile. Hair in two very long twin tails held by star-shaped '
     'clasps, a blunt fringe and a stray cowlick. An enormous drooping pointed witch hat '
     'wider than her shoulders, the tip bent over to one side, with a wide ribbon band '
     'and a star charm hanging from it. She wears a short cape clasped at the throat '
     'with a five-pointed star, a layered frilled skirt with a petticoat showing '
     'beneath, striped over-the-knee socks and buckled boots. She holds a wand topped '
     'with a crescent moon in her RIGHT hand. Small star sparks orbit the wand tip.'),

    ('pc_knightgirl', '은빛 백기사', '업적 · 아이템레벨 10,000', 'moe',
     'The most beautiful figure on the roster — she is the reward for the hardest '
     'achievement, so she is the one people want. A pretty anime woman with a serene '
     'face, large calm eyes and a small gentle smile. Very long flowing hair spilling '
     'loose to the waist with two side locks framing her face, and a slender circlet '
     'across her brow with one small gem at the centre. She wears elegant PARTIAL '
     'armour, never a full suit: an ornate fitted breastplate, one pauldron on each '
     'shoulder, and armoured gauntlets — all worn OVER a flowing layered white dress '
     'whose long skirt is split at the front and trails behind her. Thigh-high armoured '
     'boots. A half-cape pinned at the RIGHT shoulder only, hanging to the knee. '
     'A greatsword taller than she is stands planted point-down in front of her, both '
     'hands resting lightly on the pommel. Radiant and graceful, never grim, never '
     'buried in metal.'),

    ('pc_collector', '무기 수집가', '업적 · 무기 전 종류 풀 등록', 'moe',
     'A pretty anime girl, small and bright and thrilled with herself, with a wide open '
     'grin and large sparkling eyes. Long wavy twin tails tied with two enormous ribbon '
     'bows, a blunt fringe and a tall stray cowlick. She wears a short sailor-collared '
     'jacket with an oversized ribbon at the chest, a layered frilled skirt, thigh-high '
     'socks and short boots, and fingerless gloves. SIX WEAPONS FLOAT BEHIND HER — '
     'sword, axe, spear, bow, staff and mace — fanned out in a wide arc like a peacock '
     'tail, each suspended in the air inside its own small glowing ring, NOT strapped to '
     'her body and NOT carried in a pack. That floating fan is her silhouette. She holds '
     'one more sword, far too big for her, propped over her RIGHT shoulder with both '
     'hands.'),

    ('pc_priestess', '사랑받는 무녀', '업적 · NPC 호감도 MAX', 'moe',
     'A pretty anime young woman with a gentle closed-eye smile and a soft blush — the '
     'warmest face on the roster. Very long straight hair tied low with a broad ribbon, '
     'a blunt fringe, a stray cowlick, and a flower ornament above her LEFT ear. She '
     'wears a ceremonial robe with enormous wide hanging sleeves reaching past her '
     'knees, a layered skirt, and a sash of small folded paper charms strung across her '
     'chest from the LEFT shoulder. Wooden clogs over split-toe socks. She holds a bell '
     'staff in her RIGHT hand with rings that hang and sway. One small round spirit orb '
     'with a wisp tail floats beside her LEFT shoulder at all times.'),

    ('pc_archduke', '북부의 대공', '다이아 쿠지', 'anime',
     'A tall imperious man in a Japanese-anime style, the most striking figure on the '
     'roster. Long pale hair swept straight back from a widow\'s peak, a hard handsome '
     'face, and a vertical scar through his LEFT eyebrow. He wears a floor-length '
     'greatcoat with an enormous fur mantle across both shoulders and a high standing '
     'collar that frames his jaw, double-breasted with a row of ornamental clasps, and '
     'tall polished boots. One gloved hand rests permanently on the pommel of a '
     'longsword at his LEFT hip. He never slouches and never grins.'),

    ('pc_clown', '떠돌이 광대', '업적', 'comic',
     'A deliberately comic man with a face twice as long and half as wide as anyone '
     'else\'s — a narrow vertical oval. A long pointed goatee that curls up at the tip, '
     'a tiny upturned moustache, and a permanent enormous grin showing all his teeth. '
     'He wears a huge ruffled clown collar that sits on his shoulders like a plate, a '
     'harlequin motley of large diamond patches, a floppy three-pointed jester cap with '
     'bells on each tip, and shoes with long curled toes. He carries a tiny jester\'s '
     'baton topped with a miniature copy of his own head in his RIGHT hand. His limbs '
     'are too long and too thin.'),
]


# ══ NPC ══════════════════════════════════════════════════════
#
# (id, 한글 이름, 장소, 말투, 테마 선물, MAX 혜택, LOCK, 배경묘사)
#
# 장소는 제안서의 지도 재배치를 반영했다 (정령의숲·뒷동산 삭제, 엘프의집·행상인·
# 연금술사 마을로, 채집/수렵/호숫가 외곽으로, 마물의숲·보스의탑 갈라진 땅으로).
# 배치가 바뀌어도 **사람은 그대로**라 그림은 다시 안 뽑아도 된다.

NPCS = [
    ('npc_gather', '약초꾼 소녀', '채집터', '밝고 부지런하다. 말끝을 올린다',
     '고급 채집 재료 · 예쁜 돌', '채집 1회당 결과물 +1 확률 소폭 상승',
     'A cheerful country girl with dirt on her hands. Hair in one short side braid tied '
     'with twine, a smudge of soil on her LEFT cheek. She wears a wide-brimmed straw sun '
     'hat tied under the chin with a cord, a sleeveless linen smock over a long patched '
     'skirt, and short scuffed boots with bare shins. A big woven basket rides on her '
     'BACK, overflowing with herbs and mushrooms so the leaves stick up past her head — '
     'that basket is her silhouette. Small hand trowel tucked in her belt on the RIGHT.',
     'a sunlit forest clearing, moss-covered rocks, herb beds, shafts of light through '
     'the canopy'),

    ('npc_elf', '숲의 엘프', '엘프의 집', '놀리는 누나. 여유롭고 장난스럽다',
     '정령석 · 숲에서 난 것', '룬각인 비용 5% 할인',
     'An elf woman with long sharply pointed ears. Waist-length straight pale hair with '
     'one thin braid falling over her LEFT shoulder, and a circlet of two leaves across '
     'her brow. She wears a sleeveless floor-length robe slit high at both sides over a '
     'wrapped underdress, a wide cloth belt, and no shoes — bare feet with a beaded '
     'anklet on the RIGHT ankle. A single faceted spirit stone floats a hand\'s width '
     'above her open upturned RIGHT palm at all times, never touching it.',
     'the inside of a hollow living tree, spirit stones hanging on cords, roots forming '
     'shelves, soft glow from below'),

    ('npc_fish', '호숫가 낚시꾼', '호숫가', '말이 느리고 무심하다. 문장이 짧다',
     '희귀 물고기 · 좋은 미끼', '낚시 실패 시 미끼 절반 반환',
     'A quiet woman in oversized gear two sizes too big for her. A flat cap pulled low '
     'over her eyes with one thick strand of hair escaping across her RIGHT eye, and a '
     'heavy oilskin coat with the sleeves rolled into fat cuffs. Tall rubber waders up '
     'to the thigh. A long fishing rod rests across her RIGHT shoulder, the line and '
     'float trailing off-cell. A wicker creel hangs at her LEFT hip. She almost never '
     'stands fully upright — a slight permanent slouch.',
     'a still lake at dawn, flat water, reeds in the foreground, a wooden jetty, distant '
     'low hills in mist'),

    ('npc_merchant', '이세계 행상인', '이세계 행상인', '능글맞다. 값을 부르듯 말한다',
     '다른 세계의 물건 · 다이아', '다이아 상품 5% 할인',
     'A travelling merchant woman with a knowing smirk. One very long braid hangs over '
     'her RIGHT shoulder to the waist. Round tinted goggles worn around her neck like a '
     'choker, never over her eyes. She wears a hooded cloak covered in mismatched '
     'stitched-on patches from a dozen places, a bandolier of small pouches across her '
     'chest from the LEFT shoulder, and buckled travel boots. An enormous strapped '
     'merchant pack taller than her own head rides on her BACK, with rolled rugs and odd '
     'trinkets lashed to the outside.',
     'a cluttered market stall under a striped awning at night, hanging lanterns, crates '
     'and unfamiliar wares stacked high'),

    ('npc_gamble', '오락실 딜러', '오락실', '도발적이고 냉정하다. 반말에 가깝다',
     '진귀한 카드 · 행운의 부적', '하루 첫 쿠지 1회 무료',
     'A sharp-eyed dealer with a sleek jaw-length bob and one long side lock falling '
     'past her chin on the LEFT. A dark green dealer\'s visor across her forehead. She '
     'wears a fitted waistcoat over a wing-collar shirt with a loose untied bow tie, '
     'black arm garters above both elbows, and a pocket watch chain at the waistcoat. '
     'She holds a fanned spread of five cards in her RIGHT hand at chest height in every '
     'cell, and her LEFT hand rests flat on a surface or her hip. Never fully smiles '
     'with the eyes.',
     'a dim arcade hall, a felt table edge in the foreground, hanging low lamps, coin '
     'stacks, blurred machines behind'),

    ('npc_lottery', '복권 판매원', '복권상점', '텐션이 과장됐다. 감탄사가 많다',
     '반짝이는 것 · 꽝 복권 수집', '하루 복권 구매 한도 +1장',
     'An over-enthusiastic clerk, always mid-gesture. Hair in two tight curled side buns '
     'with short curls escaping, and a tall round pillbox cap perched at an angle on the '
     'LEFT side of her head. She wears a boxy double-breasted uniform vest with a large '
     'rosette badge pinned over the LEFT chest, a wide sash running from her RIGHT '
     'shoulder to her left hip, and big round hoop earrings. She holds a fan of lottery '
     'tickets spread wide in her RIGHT hand, raised high like a winning hand of cards.',
     'a tiny bright ticket booth, a wall of numbered pigeonholes behind her, a drum of '
     'tickets, streamers'),

    ('npc_office', '사무소 접수원', '모험가사무소', '사무적이지만 은근히 챙긴다',
     '좋은 펜 · 정리된 서류', '퀘스트 보증금 5% 감면',
     'A composed clerk with everything in its place. Hair pulled into a tight low bun '
     'with not one strand loose, and thin round-framed glasses. A pencil is tucked '
     'behind her RIGHT ear at all times. She wears a crisp high-collared blouse under a '
     'fitted vest, black sleeve garters above both elbows, a pencil skirt, and low '
     'heels. She holds a wooden clipboard thick with quest slips against her chest with '
     'her LEFT arm, papers sticking out at every angle.',
     'a guild office, a cork board wall dense with pinned quest notices, a counter, '
     'stacked ledgers, a desk lamp'),

    ('npc_arena', '투기장 진행자', '투기장', '호탕하고 시끄럽다. 외치듯 말한다',
     '싸움 기록 · 좋은 붕대', '투기장 하루 시도 +1회',
     'A loud broad-shouldered fighter-turned-announcer, the most physically powerful '
     'woman on the roster. Very long high ponytail. A single heavy pauldron on her RIGHT '
     'shoulder ONLY — her left shoulder is bare. She wears a short armoured tabard over '
     'a wrapped chest binding, a wide championship belt, and bandage wraps over both '
     'knuckles. A long straight scar across her LEFT cheek. She holds a flared metal '
     'speaking horn in her LEFT hand, and her RIGHT fist is usually raised.',
     'an arena stands at dusk, sand floor, banners, a raised announcer platform, crowd '
     'silhouettes out of focus behind'),

    ('npc_shop', '상점 점원', '상점', '싹싹하다. 존댓말로 빠르게 말한다',
     '잘 팔리는 물건 · 좋은 저울', '하루 무료 물 1회 → 3회',
     'A brisk friendly shopkeeper. Hair in a low side tail over her RIGHT shoulder tied '
     'with a wide ribbon. She wears a long shopkeeper\'s apron over a puff-sleeved '
     'blouse, sleeves buttoned at the wrist, a heavy coin pouch and a pair of shears '
     'hanging from her belt on the RIGHT, and a small price-tag pin on the apron chest. '
     'Her LEFT hand is raised in a welcoming open-palmed wave in almost every '
     'pose, and her '
     'RIGHT hand rests on the counter or her hip.',
     'a general store interior, shelves of jars and rolled scrolls, a wooden counter '
     'with a brass scale, a swinging sign'),

    ('npc_maid', '선술집 점원', '선술집', '붙임성 좋은 소녀. 수다스럽다',
     '맛있는 것 · 팁', '선술집 음식 하루 한도 +1',
     'A young tavern server with freckles across the nose. Two short braids, one on each '
     'side, and a small frilled headdress band. She wears a laced bodice over a '
     'puff-sleeved blouse, a frilled short apron tied at the waist, and a knee-length '
     'skirt. She balances a round serving tray flat on her raised RIGHT hand at shoulder '
     'height, carrying one foaming tankard, whenever her hands are free. A '
     'towel is tucked into her apron string on the LEFT.',
     'a warm crowded tavern, hearth fire, long timber tables, hanging mugs, lamplight '
     'and drifting smoke'),

    ('npc_beastwood', '숲 순찰대원', '마물의숲', '무뚝뚝하고 짧게 말한다',
     '사냥한 것 · 좋은 화살', '탐험 보상 +2%',
     'A terse ranger who never relaxes. Hair braided tight into a crown around her head '
     'so nothing can be grabbed. A bandage strip across the bridge of her nose. She '
     'wears a hooded ranger\'s cloak clasped at the throat with a leaf brooch and worn '
     'UP over the head in almost every pose, wrapped leather bracers on both '
     'forearms, and a '
     'quiet-soled boot laced to the knee. A quiver rides on her RIGHT shoulder and a '
     'hunting knife is strapped to her LEFT thigh.',
     'a dark dense forest, close-packed trunks, low fog between the trees, one shaft of '
     'cold light, undergrowth'),

    ('npc_hunt', '수렵꾼', '수렵터', '야성적이고 직설적이다. 반말',
     '짐승 이빨 · 좋은 가죽', '수렵 매우성공 확률 +2%p',
     'A wild-looking hunter with a wide grin and sharp canines. Shoulder-length unkempt '
     'hair with two feathers braided into the LEFT side. A wolf-pelt hood pushed back so '
     'it hangs behind her neck with the muzzle visible over her RIGHT shoulder. She '
     'wears a fur-collared short jacket left open over a wrapped chest binding, a bare '
     'midriff, a hip wrap of layered hides, and a necklace of beast teeth. She carries a '
     'short broad-headed spear in her RIGHT hand, butt on the ground.',
     'a scrubby hunting ground at dusk, tall dry grass, animal tracks, a distant treeline'),

    ('npc_tower', '탑지기', '보스의탑', '조용하고 신비롭다. 짧은 문장, 긴 여운',
     '오래된 열쇠 · 이상한 시계', '탑 재도전 시 하루 1회 비용 면제',
     'A quiet keeper who seems slightly out of time. Straight waist-length hair, and a '
     'narrow cloth band worn across the FOREHEAD, above the eyes — her eyes are always '
     'visible. She wears a long hooded mantle down to the ankles, closed at the throat '
     'with a brooch shaped like a stopped clock face, over a simple high-necked dress. A '
     'ring of long iron keys hangs from her belt on the RIGHT and chimes when she moves. '
     'She carries a small hooded lantern low in her LEFT hand.',
     'the foot of an immense stone tower, a spiral stair vanishing upward, worn steps, '
     'a heavy iron door, cold light from above'),

    ('npc_abyss', '심연 안내인', '심연', '어둡고 담담하다. 감정을 잘 안 드러낸다',
     '심연에서 건진 것 · 등불 기름', '심연 진입 시 첫 층 건너뛰기',
     'A grave guide who has been down there too many times. Long hair falling forward to '
     'cover her RIGHT eye completely. Her LEFT arm is wrapped shoulder to fingertip in '
     'bandages at all times. She wears a tattered layered shawl over a high-necked '
     'bodysuit, the hem cut into ragged strips that drift, and a coil of rope over her '
     'RIGHT shoulder. A small oil lamp hangs from a hook at her chest, lighting her from '
     'below. Bare feet.',
     'the lip of an enormous black chasm, broken ground, a rope ladder disappearing into '
     'the dark, updraft catching cloth'),

    ('npc_alchemist', '연금술사', '연금술사의 천막', '실없이 명랑한 괴짜. 말이 빠르다',
     '희귀 재료 · 이상한 액체', '연성 실패 시 재료 20% 반환',
     'A manic tinkerer permanently mid-experiment. A huge messy pile of hair with '
     'enormous circular goggles shoved up into it, pushing it further out of shape. She '
     'wears a stained heavy work apron over a shirt with the sleeves rolled past the '
     'elbow, elbow-length rubber gloves on both arms, and a bandolier of glass vials '
     'across her chest from the RIGHT shoulder. She holds a round-bottomed flask of '
     'bubbling liquid up in her RIGHT hand in almost every pose. A scorch mark '
     'blackens her '
     'LEFT sleeve.',
     'a cluttered alchemist tent, hanging bundles of dried matter, a bubbling still, '
     'shelves of vials, canvas walls lit from outside'),
]

# 장인의 집 — 유일한 남자 NPC. 호감도 없음.
SMITH = ('npc_dunkarax', '둔카락스', '장인의집', '말이 짧은 노장인. 일로 말한다',
         'A huge barrel-chested old blacksmith, the widest figure in the game. Bald '
         'crown with a leather headband, and a thick braided grey beard reaching the '
         'middle of his chest. Bare heavily muscled arms marked with old burn scars, '
         'the LEFT forearm scarred worse than the right. He wears a heavy leather '
         'blacksmith\'s apron with tool loops over a bare torso, and thick boots. He '
         'holds a forging hammer head-down in his RIGHT fist at all times. A permanent '
         'frown carved into the brow.')

# 홈 안내 요정 — 호감도 없음. 홈 화면을 계속 돌아다닌다.
FAIRY = ('npc_fairy', '안내 요정', '홈 · 튜토리얼',
         'A tiny palm-sized winged fairy girl, drawn as a chibi with a head one third of '
         'her total height. Four thin insect wings, two large and two small, on her '
         'BACK. A short petal-shaped dress, bare feet, and one long curl of hair rising '
         'from the crown of her head like an antenna with a small round bead on the tip. '
         'Oversized eyes. A short trailing wisp of light follows behind her. She is '
         'always airborne — her feet never touch anything.')

FAIRY_FRAMES = [
    ('fly1', '비행 1', 'hovering, wings swept fully UP and back, body upright, arms loose at the sides'),
    ('fly2', '비행 2', 'hovering, wings swept fully DOWN and forward, body risen slightly higher in the '
                       'cell than fly1, hair curl bouncing'),
    ('point', '가리키기', 'hovering, leaning forward with one arm extended out to the RIGHT, index finger '
                          'pointing, other hand cupped at her mouth'),
    ('talk', '말하기', 'hovering, both hands raised palms-up beside her head, mouth open mid-sentence, '
                       'eyes wide'),
    ('happy', '기쁨', 'hovering, eyes squeezed into happy arcs, both arms thrown up, doing a small '
                      'mid-air spin so the dress flares'),
    ('sleep', '졸음', 'hovering low and drooping, eyes closed, head tipped forward, wings half folded, '
                      'one small dithered bubble at the nose'),
    ('surprise', '놀람', 'hovering, jolted upright, wings snapped wide, both arms straight down, eyes '
                         'perfectly round, hair curl standing straight up'),
    ('wave', '인사', 'hovering, one arm raised high in a wave, other hand on hip, head tilted, '
                     'friendly smile'),
]

# 업적 등급 오오라 (제안서 3번) — 캐릭터 뒤에 겹쳐 그리는 오버레이
AURA_GRADES = [
    ('d', 'D', 'no aura at all — an empty cell with only the black background. This cell exists so '
               'the sheet has a baseline and the slicer keeps its grid.'),
    ('c', 'C', 'a thin single ring of small dots arranged in an ellipse, as if orbiting behind the '
               'character\'s feet. Sparse — about twelve dots.'),
    ('b', 'B', 'two crossed elliptical rings of dots plus four small four-pointed sparkles at the '
               'compass points, still sparse and quiet.'),
    ('a', 'A', 'a dense elliptical ring of dots, six large four-pointed sparkles, and short upward '
               'streak lines rising from the base of the ellipse.'),
    ('s', 'S', 'a full halo: a thick dithered ring behind where the head would be, a dense orbiting '
               'ellipse of dots and sparkles, long upward streak lines all around, and radiating '
               'straight rays from the centre. Grand but still leaving the middle of the cell empty '
               'for the character to sit in.'),
]

# 호감도 월페이퍼 사다리 (GPT). 레벨은 3·5·7·10 — 제안서 8번 기준.
#
# 제안서 6번은 "1·5·10 세 장" 이라고 적혀 있고 8번은 "3·5·7·10 네 장" 이라고
# 적혀 있다. 8번을 따랐다 — 대사·말투가 바뀌는 지점과 그림이 풀리는 지점이
# 같아야 "레벨이 올랐다" 가 한 번에 읽힌다. 6번대로 1레벨에 한 장을 주면
# 호감도를 쌓기도 전에 보상이 먼저 나온다.
AFFINITY_LEVELS = [
    (3, '일하는 중', 'at work',
     'She is at work, in the middle of her job, and has just noticed you watching. '
     'Full figure or three-quarter body, in her workplace, surrounded by the tools of '
     'her trade. She is caught mid-task and glancing over at the viewer — pleased to be '
     'noticed but not stopping what she is doing. Professional, warm, a little distant. '
     'Composition: wide, the location is as much the subject as she is.'),
    (5, '일이 끝나고', 'off duty',
     'Off duty at the end of the day. She has loosened or removed one working layer — '
     'an apron untied, a collar opened, a hat set down beside her, hair let down. She is '
     'sitting or leaning somewhere in her own place with the lamps low, relaxed, holding '
     'a drink or resting her chin on one hand, looking directly at the viewer with an '
     'easy unguarded smile. Composition: medium shot, closer than the level 3 image.'),
    (7, '둘만 있을 때', 'alone together',
     'A private moment with nobody else present. She is close to the viewer and knows '
     'it — leaning in across a table, or turned toward the camera from very near, one '
     'hand reaching partly toward the viewer. Soft low light from a single source. Her '
     'expression is fond and a little shy, eyes on the viewer, and she is clearly in the '
     'middle of saying something she would not say in front of others. Composition: '
     'upper body, shallow depth of field, the background dissolved into soft shapes.'),
    (10, '마음을 준 뒤', 'she has decided',
     'She has decided about you. A close, quiet, affectionate portrait — she is turned '
     'fully toward the viewer, very near, her hand resting on the viewer\'s side of the '
     'frame or held out to be taken, her expression open and completely without guard. '
     'The warmest light of the four. This is the reward image, so it is the most '
     'carefully rendered: the most detailed hair, the strongest lighting, the cleanest '
     'composition. Composition: bust to upper body, centred, wallpaper-clean.'),
]

ILLUST_STYLE = """STYLE (strict):
- A single finished illustration in Japanese anime style, rendered entirely in
  MONOCHROME GREYSCALE — pure black, pure white, and the full range of greys between.
  There is no colour anywhere in the image, not even a tint.
- Soft cel shading with airbrushed gradients, deep rich blacks in the shadows, and one
  strong warm light source (lantern, hearth, window, lamp) expressed purely as value.
- Clean confident line art. Detailed rendering of hair strands, fabric folds, and the
  material of the environment. Cinematic shallow depth of field.
- Wallpaper composition: the character is unmistakably the subject, her location is
  readable behind her, and there is quiet negative space where interface could sit.
- No text, no watermark, no signature, no logo, no border, no panel gutters, no
  speech bubbles.
- This is NOT pixel art and NOT 1-bit. It is a fully rendered greyscale illustration.
- Tasteful. Suggestive at most, never explicit. She is an adult."""

ILLUST_LOCK = """CHARACTER CONSISTENCY — this is one image out of a set of four of the SAME woman.
- The four images differ only in setting, framing, lighting and mood. Her face, hair
  length and shape, eye shape, body proportions and signature outfit are identical
  across all four.
- Keep every asymmetric detail on the same side as written below (braids, scars,
  bandages, patches, which shoulder carries what). Do not mirror her.
- If a reference image of this character is attached, match it exactly — treat the
  written description above as a checklist against that reference, not as licence to
  redesign."""


# ══ 문서 조립 ════════════════════════════════════════════════
#
# ## 왜 한 파일이 아니라 서른 몇 개인가
#
# 처음엔 한 파일(540KB)이었다. 편집기가 "너무 커서 서식 편집을 못 한다" 며
# 소스 모드로만 열었다. 읽으라고 만든 문서를 못 읽으면 없는 것과 같다.
#
# 쪼개는 단위는 **한 캐릭터 = 한 파일**이다. 이 문서 전체가 "한 캐릭터를 한 번에
# 다룬다" 는 원칙 위에 서 있으니, 파일도 같은 선을 따라 끊는 게 맞다. 바니걸
# 그림을 손볼 때 여는 파일은 바니걸 파일 하나다.
#
# 규칙·순서·바이블처럼 **여러 캐릭터에 걸치는 것**만 따로 모은다. 그건 한 곳에
# 있어야 하고, 캐릭터 파일마다 복사하면 규칙이 서른 벌로 갈라진다.

import re

OUT_DIR = 'docs/character-art'
INDEX = 'docs/CHARACTER_ART_PROMPTS.md'

_files: list[tuple[str, list[str]]] = []


def page(name: str) -> list[str]:
    """새 파일 하나. 돌려받은 리스트에 줄을 담으면 그 파일이 된다."""
    buf: list[str] = []
    _files.append((name, buf))
    return buf


def slug(s: str) -> str:
    """파일 이름에 쓸 수 있는 형태로. 한글은 그대로 둔다 — 찾기 쉬운 쪽이 낫다"""
    return re.sub(r'[^0-9A-Za-z가-힣_-]+', '-', s).strip('-')


def pixel_prompt(subject, layout, extra_blocks=(), same_person=True, readable=True,
                 moe=False):
    """
    프롬프트 한 덩어리.

    `same_person=False` 는 §P0 로스터 시트 하나뿐이다 — 거기만 열두 명이
    서로 달라야 한다. 두 블록을 다 넣으면 "전부 같은 사람" 과 "열둘이 다른
    사람" 이 한 프롬프트 안에서 싸운다.

    `readable=False` 는 스플래시(§PS)다. READABLE 은 "64px 에서 읽혀야 하니
    디테일을 버려라" 는 지시인데, 스플래시는 이 캐릭터가 가장 크게 그려지는
    자리다. 넣으면 정확히 반대로 시킨다.

    `moe=True` 는 여캐 여섯(§P5~P10)과 그들이 들어 있는 §P0 이다.

    MOE 를 STYLE **뒤, READABLE 앞**에 넣는 순서가 중요하다. READABLE 은
    "작게 보이니 디테일을 버려라" 고 하는데 이게 먼저 오면 큰 눈과 리본까지
    같이 버린다. 모에를 먼저 세우고 그다음에 "단, 작게 보인다" 를 붙여야
    버릴 것과 지킬 것이 갈린다.
    """
    parts = [NOTEXT, subject, PIXEL_STYLE]
    if moe:
        parts.append(MOE)
    if same_person:
        parts.append(SAME_PERSON)
    if readable:
        parts.append(READABLE)
    parts += [*extra_blocks, layout]
    return "```\n" + "\n\n".join(parts) + "\n```\n"


def cells_block(items, head):
    """
    (id, ko, desc) 목록을 셀 순서 지시로.

    ⚠ **한글 이름을 프롬프트에 넣지 않는다.** 생성 모델은 "이름이 붙은 것들의
    목록" 을 보면 캡션을 그려 넣으려 든다 (`ASSET_PROMPTS.md` 의 "알아두실 점").
    캐릭터 시트에서 특히 심하다. 사람이 볼 셀 번호↔이름 표는 프롬프트 **밖**에
    따로 붙인다 — `cells_table()`.
    """
    lines = [head, ""]
    for i, (_id, _ko, desc) in enumerate(items, 1):
        lines.append(f"Cell {i} — {desc}")
    return "\n".join(lines)


def cells_table(items):
    """사람이 읽을 셀 번호 ↔ 이름 표. 프롬프트 밖에 붙는다."""
    head = "| 셀 | " + " | ".join(str(i) for i in range(1, len(items) + 1)) + " |\n"
    head += "|---|" + "---|" * len(items) + "\n"
    head += "| | " + " | ".join(ko for _id, ko, _d in items) + " |\n"
    head += "| id | " + " | ".join(f"`{i}`" for i, _k, _d in items) + " |\n"
    return head


def cfg_line(sec, name, cols, rows, labels):
    """슬라이서 설정 한 줄. 격자와 라벨 수가 어긋나면 여기서 먼저 터진다"""
    assert cols * rows == len(labels), f'{name}: {cols}x{rows} != {len(labels)} labels'
    return (f'{{ "file": "<§{sec} 파일명>", "name": "{name}", "expect": [{cols}, {rows}],\n'
            f'  "labels": [{", ".join(chr(34) + l + chr(34) for l in labels)}] }}')


n_sheet = 1 + len(PCS) + len(NPCS) * 2 + 3   # §P0 + §P* + §F* + §B* + §S1·§Y1·§X1
n_gemini = n_sheet + len(PCS)                # 시트 + 스플래시
n_gpt = len(NPCS) * len(AFFINITY_LEVELS)

# 슬라이서 설정 46줄을 한 곳에 모은다 (각 파일에도 그 캐릭터 줄만 다시 붙는다)
all_cfg: list[str] = []


# ── 색인 ─────────────────────────────────────────────────────

W = page(INDEX).append

W(f"""# 캐릭터 · NPC 이미지 프롬프트

**이 파일들은 자동 생성됩니다** — `python tools/gen-char-prompts.py`.
프롬프트를 고치려면 생성기의 데이터를 고치세요. 손으로 편집하면 다음 실행에 덮어씁니다.
장비·몬스터·UI 아이콘 프롬프트는 [ASSET_PROMPTS.md](ASSET_PROMPTS.md) 에 따로 있습니다.

`docs/example-proposal.md` 를 기준으로 뽑았습니다. 제안서가 아직 미완성이라 수치나
획득 조건은 바뀔 수 있지만, **그림은 바뀌지 않습니다** — 채집터 NPC 를 마을로 옮겨도
사람은 그대로입니다. 그래서 기획이 흔들려도 이 목록은 그대로 두고 뽑아도 됩니다.

| | 장수 | 모델 |
|---|---|---|
| 1-bit 픽셀 시트 (잘라서 여러 장이 나옴) | {n_sheet}장 | Gemini |
| 대형 스플래시 (한 장 = 한 그림) | {len(PCS)}장 | Gemini |
| 호감도 월페이퍼 (한 장 = 한 그림) | {n_gpt}장 | GPT |
| **요청 횟수 합계** | **{n_gemini + n_gpt}번** | |

---

## 어디부터 여나

**[규칙과 순서](character-art/00-규칙과-순서.md) 를 먼저 읽으세요.** 일관성이 거기서
갈립니다. 그다음은 작업할 캐릭터의 파일 하나만 열면 됩니다 — 그 캐릭터에 필요한
프롬프트가 전부 그 안에 있습니다.

| 파일 | 무엇이 들어 있나 |
|---|---|
| [00. 규칙과 순서](character-art/00-규칙과-순서.md) | 일관성 규칙 5가지 · 뽑는 순서 · 셀 순서 표 · 재요청 문구 |
| [01. 캐릭터 바이블](character-art/01-캐릭터-바이블.md) | 29명의 LOCK 원문. 프롬프트에 이미 박혀 있으니 읽기용 |
| [02. 플레이어 흉상 12칸](character-art/02-플레이어-흉상.md) | §P0 — **제일 먼저 뽑을 것** |
| [98. 둔카락스 · 요정 · 오오라](character-art/98-둔카락스-요정-오오라.md) | §S1 · §Y1 · §X1 |
| [99. 슬라이서와 후처리](character-art/99-슬라이서.md) | 설정 46줄 모음 · 받은 다음 할 일 · Gemini 가 늘 하는 짓 |

### 플레이어 캐릭터 12명 — 한 명당 한 파일
""")
W("| # | 이름 | 획득 | 들어 있는 것 |")
W("|---|---|---|---|")
for i, (pid, ko, src, _f, _l) in enumerate(PCS, 1):
    W(f"| §P{i} | [{ko}](character-art/pc-{i:02d}-{slug(ko)}.md) | {src} "
      f"| 전신·전투 8칸 + 스플래시 |")

W("""
### NPC 15명 — 한 명당 한 파일

장인의 집(둔카락스)과 안내 요정은 호감도가 없어 98번 파일에 같이 있습니다.
""")
W("| # | 이름 | 장소 | 들어 있는 것 |")
W("|---|---|---|---|")
for i, (nid, ko, place, *_r) in enumerate(NPCS, 1):
    W(f"| §F{i}·B{i}·W{i} | [{ko}](character-art/npc-{i:02d}-{slug(ko)}.md) | {place} "
      f"| 표정 6칸 + 전신 3칸 + 월페이퍼 4장 |")

W("""
---

## 이 문서에서 뺀 것

### 가슴 터치 반응 이미지 (제안서 8번 마지막 줄)

**안 만들었습니다.** 거절이 아니라 그 항목만 뺐고, 나머지는 전부 들어 있습니다.

레벨이 오를수록 거부가 수용으로 바뀌는 구조라, 그림으로 만들면 "싫다고 해도 계속
누르면 받아준다" 를 게임 규칙으로 가르치는 셈이 됩니다. 이건 제가 프롬프트를 쓰지
않겠습니다.

호감도 사다리 자체는 각 NPC 파일에 그대로 있고, 놀란 얼굴·부끄러운 얼굴은 표정
시트의 `shy` 와 `love` 칸에 이미 있어서 **다른 인터랙션에 붙이는 건 가능합니다.**
터치 반응을 꼭 넣고 싶다면 대상을 바꾸는 쪽을 권합니다 — 머리를 쓰다듬거나,
손을 잡거나, 어깨를 툭 치는 반응이면 지금 있는 표정 6종으로 바로 됩니다.

### 범위 밖

요청하신 범위가 **플레이어 캐릭터와 NPC** 라 아래는 뺐습니다. 필요하면 말씀해
주세요.

- 레이드 보스 전투 프레임 (제안서 길드 7번) — 캐릭터가 아니라 크리처입니다
- 장비 효과 3종 (제안서 7번) · 티어별 장비 이펙트 (홈 10번) — 장비 오버레이
- 채집·낚시·수렵 미니게임 그림 (지도 2번) — 배경·도구
- 장소 배경 (지도 5번)

이건 [ASSET_PROMPTS.md](ASSET_PROMPTS.md) 쪽 생성기(`tools/gen-prompts.py`)에
넣는 게 맞습니다. 캐릭터 일관성 규칙이 필요 없는 것들이라 여기 섞으면 규칙만
복잡해집니다.
""")


# ── 00. 규칙과 순서 ──────────────────────────────────────────

W = page(f'{OUT_DIR}/00-규칙과-순서.md').append

W("""# 00. 규칙과 순서

← [색인으로](../CHARACTER_ART_PROMPTS.md)

**한 장이라도 뽑기 전에 이 파일을 읽으세요.** 일관성은 여기서 갈립니다.

## 일관성을 어떻게 지키는가

걱정하신 게 정확히 이겁니다. **"나중에 동작 하나 더 만들면 딴사람이 된다."**
실제로 그렇게 됩니다. 원인은 매번 말로 다시 설명하기 때문입니다. 같은 사람을 두 번
묘사하면 두 사람이 나옵니다.

그래서 이 문서의 핵심은 프롬프트가 아니라 **잠금 문장(LOCK)** 입니다.

### 규칙 1 — LOCK 은 글자 하나도 고치지 않는다

캐릭터마다 고정된 영어 묘사가 [01. 캐릭터 바이블](01-캐릭터-바이블.md) 에 있습니다.
그 캐릭터가 나오는 모든 프롬프트에 **그대로** 들어갑니다. 다듬고 싶어도 다듬지
마세요. "긴 머리" 를 "허리까지 오는 머리" 로 바꾸는 순간 그 컷만 다른 사람이 됩니다.

새 동작이 필요하면 프롬프트를 새로 쓰지 말고, `tools/gen-char-prompts.py` 의
`PC_ACTIONS` / `BODY_POSES` / `EMOTIONS` 에 **한 줄만** 더하고 다시 돌리세요.

### 규칙 2 — 한 캐릭터의 한 시트는 반드시 한 번에 뽑는다

컷을 나눠서 요청하면 반드시 갈라집니다. 표정 6종을 여섯 번 요청하면 여섯 명이
나옵니다. 마음에 안 드는 칸이 하나 있어도 **시트 전체를 다시** 뽑으세요. 한 칸만
다시 뽑아 붙이면 그 칸만 이질적으로 남습니다.

파일을 캐릭터별로 쪼갠 것도 같은 이유입니다 — 한 캐릭터를 손볼 때 여는 파일은
하나고, 그 안에 그 캐릭터에 필요한 게 전부 들어 있습니다.

### 규칙 3 — 좌우는 잠긴다

땋은 머리, 흉터, 견갑, 붕대, 가방끈이 어느 쪽에 있는지를 LOCK 에 **LEFT /
RIGHT 대문자로** 박아 뒀습니다. 옆모습이든 뒷모습이든 같은 쪽입니다. 자세를
뒤집는 건 되고, 캐릭터를 뒤집는 건 안 됩니다. 이걸 안 잠그면 걷기 프레임에서
가방이 반대쪽으로 넘어갑니다.

### 규칙 4 — 기준 시트를 먼저 뽑고, 나머지는 그걸 첨부한다

캐릭터마다 **가장 먼저 뽑는 시트**가 정해져 있습니다. 그게 그 캐릭터의 정답입니다.
이후 모든 요청에는 그 이미지를 **레퍼런스로 첨부**하고 "match this character exactly"
를 붙이세요. 프롬프트만으로는 한계가 있고, 레퍼런스가 붙으면 확 좋아집니다.

| 대상 | 기준 시트 | 그다음 |
|---|---|---|
| 플레이어 12종 | [§P0 흉상 12칸](02-플레이어-흉상.md) (한 장에 전부) | 각 캐릭터 파일의 전신·전투 |
| 여자 NPC 15명 | 각 NPC 파일의 §F 표정 6칸 | 같은 파일의 §B 전신 → §W 월페이퍼 |
| 둔카락스 · 요정 | [§S1 · §Y1](98-둔카락스-요정-오오라.md) | — |

플레이어 흉상을 **한 장에 12칸 다 넣은 이유**가 이겁니다. 12명이 서로 한 가족처럼
보여야 하는데, 12번 따로 요청하면 12개 화풍이 나옵니다. 한 번에 뽑으면 강제로
같은 붓으로 그려집니다. 지금 `assets/sprites/avatar/` 도 그렇게 만들어졌습니다.

### 규칙 5 — 화풍은 두 개뿐이다. 세 번째를 만들지 않는다

| 레지스터 | 쓰는 곳 | 모델 |
|---|---|---|
| **1-bit 픽셀** | 게임 안에 들어가는 전부 — 로고 · 전신 · 전투 · 표정 · 스플래시 | Gemini |
| **흑백 애니 일러스트** | 호감도 보상 월페이퍼 **only** | GPT |

이 경계가 흐려지면 안 됩니다. 게임 화면 안에서는 100% 픽셀이고, 일러스트는 보상으로
받아 화면 밖(월페이퍼)에서만 봅니다. 그래서 두 화풍이 한 화면에서 부딪칠 일이
없습니다 — **모델이 둘로 갈리는 게 오히려 안전한 구조**입니다.

> 캐릭터 클릭 시 나오는 전신샷(제안서 홈 2번)도 픽셀 레지스터로 뽑습니다.
> 여기만 일러스트로 하면 홈 화면 한가운데에 세 번째 화풍이 생깁니다.

### 재요청할 때 쓸 한 줄

```
Same sheet, same character, same style, same grid. Redo it with this one change: (바꿀 것).
Everything else must be pixel-identical to the previous output.
```

---

## 뽑는 순서

의존 관계가 있어서 순서를 지켜야 합니다. 뒤엣것이 앞엣것을 레퍼런스로 씁니다.

```
1) 플레이어 흉상 12칸        <- 여기서 12명의 얼굴이 확정된다
2) 캐릭터별 전신·전투 8칸      (1 첨부)
3) 캐릭터별 스플래시          (1 + 2 첨부)
4) NPC 표정 6칸              <- 여기서 NPC 얼굴이 확정된다
5) NPC 전신 3칸              (4 첨부)
6) 둔카락스 · 요정 · 등급 오오라
7) 호감도 월페이퍼 60장        (4 + 5 첨부, GPT)
```

3·5·7 단계는 서로 독립이라 순서를 바꿔도 됩니다. **1과 4를 건너뛰면 안 됩니다.**

---

## 셀 순서 — 잘라 낸 뒤에 뭐가 뭔지

프롬프트 안에는 **한글이 한 글자도 없습니다.** 생성 모델은 "이름이 붙은 것들의
목록" 을 보면 칸마다 이름표를 그려 넣으려 듭니다. 캐릭터 시트에서 특히 심합니다.
그래서 셀 번호 ↔ 이름은 여기 한 번만 적어 둡니다. 슬라이서 `labels` 도 이 순서입니다.

**플레이어 전신·전투 8칸**

""" + cells_table(PC_ACTIONS) + """
**NPC 표정 6칸**

""" + cells_table(EMOTIONS) + """
**NPC 전신 3칸**

""" + cells_table(BODY_POSES) + """
**둔카락스** — `gruff` · `amused` · `trust` · `stand`

**요정 8프레임**

""" + cells_table(FAIRY_FRAMES) + """
**등급 오오라 5칸** — `d` · `c` · `b` · `a` · `s`
""")


# ── 01. 캐릭터 바이블 ────────────────────────────────────────

W = page(f'{OUT_DIR}/01-캐릭터-바이블.md').append

W("""# 01. 캐릭터 바이블

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)

여기 적힌 영어 문장이 **그 캐릭터의 정의**입니다. 각 캐릭터 파일의 프롬프트에 이
문장이 그대로 들어가 있으니 따로 복사할 일은 없습니다. 사람이 읽을 용도로 둡니다.

## 플레이어 캐릭터 12종

| # | id | 이름 | 획득 | 계열 |
|---|---|---|---|---|""")
for i, (pid, ko, src, fam, _lock) in enumerate(PCS, 1):
    W(f"| §P{i} | `{pid}` | [{ko}](pc-{i:02d}-{slug(ko)}.md) | {src} "
      f"| {FAM_SHORT[fam]} |")

W("""
### 계열이 셋인 이유

**기본 4종**은 처음부터 열려 있습니다. 거리에서 굴러먹은 사람 얼굴이라 예쁘지
않아도 됩니다 — 오히려 예쁘면 안 됩니다.

**모에 6종**은 사거나 어렵게 얻는 것들입니다. 톤을 기본 4종에 맞추면 **얻은 티가
안 납니다** — 4종 사이에 5번째 낡은 얼굴이 하나 더 늘 뿐입니다. 그래서 이 여섯만
[MOE 블록](00-규칙과-순서.md)이 따로 붙습니다. 큰 눈, 리본, 프릴, 트윈테일 —
1-bit 64px 에서 "예쁘다" 를 만드는 건 이 세 가지(눈 크기·머리 실루엣·옷 윤곽)
뿐이고, 나머지는 다 뭉개집니다.

한 줄로 "Japanese-anime style" 이라고만 적어 두면 **그냥 평범한 게임 캐릭터**가
나옵니다. 예쁜 건 취향 문제가 아니라 그리는 규칙 문제라서, 규칙을 적어야 합니다.

**남캐 2종**은 애니메이션풍이지만 모에가 아닙니다. 대공은 차갑고 잘생긴 성인
남자고, 광대는 일부러 못생긴 개그 캐릭터입니다. 여기에 모에를 붙이면 대공은
느끼해지고 광대는 안 웃깁니다.

지금 `src/core/avatars.ts` 도 같은 이유로 12+4 를 갈라 놨습니다.

### LOCK 원문 12개
""")
for pid, ko, src, _fam, lock in PCS:
    W(f"\n**{ko}** (`{pid}` · {src})\n\n```\n{lock}\n```\n")

W("""
---

## NPC 17명

장소 16곳에 한 명씩, 장인의 집만 남자(둔카락스)이고 나머지는 전부 여자입니다.
여기에 호감도가 없는 안내 요정이 하나 더 붙습니다.

| # | id | 이름 | 장소 | 말투 | 선물 테마 | 호감도 MAX 혜택 |
|---|---|---|---|---|---|---|""")
for i, (nid, ko, place, tone, gift, perk, _lock, _bg) in enumerate(NPCS, 1):
    W(f"| §{i} | `{nid}` | [{ko}](npc-{i:02d}-{slug(ko)}.md) | {place} | {tone} "
      f"| {gift} | {perk} |")
W(f"| §S1 | `{SMITH[0]}` | [{SMITH[1]}](98-둔카락스-요정-오오라.md) | {SMITH[2]} "
  f"| {SMITH[3]} | — | 호감도 없음 |")
W(f"| §Y1 | `{FAIRY[0]}` | [{FAIRY[1]}](98-둔카락스-요정-오오라.md) | {FAIRY[2]} "
  f"| 도와주는 요정 | — | 호감도 없음 |")

W("""
MAX 혜택은 전부 **하루 한 번짜리 편의**로 잡았습니다. 제안서가 "아~주 약간의 혜택"
이라고 못박은 게 맞습니다 — 여기에 전투력이 붙는 순간 호감도가 연애가 아니라
숙제가 됩니다. 15명을 다 찍어야 하는 육성 루트가 하나 더 생기는 겁니다.

### LOCK 원문 17개
""")
for nid, ko, place, _t, _g, _p, lock, _bg in NPCS:
    W(f"\n**{ko}** (`{nid}` · {place})\n\n```\n{lock}\n```\n")
W(f"\n**{SMITH[1]}** (`{SMITH[0]}` · {SMITH[2]})\n\n```\n{SMITH[4]}\n```\n")
W(f"\n**{FAIRY[1]}** (`{FAIRY[0]}` · {FAIRY[2]})\n\n```\n{FAIRY[3]}\n```\n")


# ── 02. 플레이어 흉상 ────────────────────────────────────────

W = page(f'{OUT_DIR}/02-플레이어-흉상.md').append
_cfg = cfg_line('P0', 'pc_face', 4, 3, [p[0][3:] for p in PCS])
all_cfg.append(_cfg)

W("""# 02. §P0 — 플레이어 흉상 12칸

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)

**모든 것의 처음입니다.** 12명을 한 장에 넣습니다. 이 한 장이 12명의 얼굴을
확정하고, 이후 모든 캐릭터 프롬프트가 이걸 레퍼런스로 첨부합니다. 마음에 안 드는
얼굴이 있으면 **지금** 다시 뽑으세요 — 뒤로 갈수록 되돌리는 비용이 커집니다.

## 셀 순서
""")
W("| 셀 | " + " | ".join(str(i) for i in range(1, len(PCS) + 1)) + " |")
W("|---|" + "---|" * len(PCS))
W("| | " + " | ".join(p[1] for p in PCS) + " |")
W("| id | " + " | ".join(f"`{p[0][3:]}`" for p in PCS) + " |\n")

roster = "\n\n".join(
    f"Cell {i} — {lock}" for i, (_pid, _ko, _s, _f, lock) in enumerate(PCS, 1))

W("## 프롬프트 (Gemini)\n")
W(pixel_prompt(
    "SUBJECT: a character roster sheet of 12 DIFFERENT people, one per cell.\n"
    "Each cell is a bust portrait: head, shoulders and upper chest only, cropped at "
    "roughly nipple height, facing the viewer square-on, centred in the cell, filling "
    "about 85% of the cell height. Neutral confident expression on every one of them.\n"
    "Each character's weapon or signature prop rises past one shoulder into frame so "
    "the bust is not a floating head.\n\n"
    "THE ONLY THING THIS SHEET CROPS IS THE CHEST. This is a portrait crop: the body "
    "stops at the bottom edge and a weapon hilt may pass out of the bottom or side of "
    "the cell the way it does in any bust portrait. Everything ABOVE the shoulders is "
    "drawn whole — the top of the head, all hair, every ear, horn, hat, hat brim, "
    "ribbon, ahoge and headdress sits inside the cell with black space above it. A "
    "flattened hat or a hairstyle sliced off by the top edge is a failed cell.\n\n"
    "The 12 characters, in this exact order:\n\n" + roster,
    grid(4, 3,
         "Reading order is left to right, then top to bottom. Cell 1 is top-left, "
         "cell 12 is bottom-right."),
    extra_blocks=(
        "TWELVE DIFFERENT PEOPLE, THREE REGISTERS — this sheet is the exception to the "
        "usual rule.\n"
        "- Cells 1 to 4 are grounded, worn-in, ordinary people. Realistic proportions, "
        "plain clothing, no gloss. They look like they have jobs.\n"
        "- CELLS 5 TO 10 ARE THE PRETTY ONES. Follow the MOE / ANIME REGISTER block "
        "above for these six and nothing else. They are the paid and hard-earned "
        "characters, so they must be visibly the most attractive faces on the sheet — "
        "if a player cannot tell at a glance which six are the prizes, this sheet has "
        "failed. Big eyes, elaborate hair, ribbons, frills.\n"
        "- Cells 11 and 12 are anime too but NOT moe: cell 11 is a tall, cold, handsome "
        "adult man; cell 12 is a deliberately ugly comic gag character with distorted "
        "proportions. Do not soften cell 12 or prettify cell 11 into a moe face.\n"
        "- Despite the split, ALL 12 are drawn by the same hand with the same line "
        "weight, the same dither patterns and the same crop rules. One sheet, three "
        "registers, one artist.\n"
        "- No two of the 12 may share a hairstyle or a headwear shape.\n"
        "- Each cell is nonetheless a LOCKED design, not a sketch: draw each person "
        "exactly as written, offer no alternates, and never let a detail from one cell "
        "leak into another. Keep every LEFT/RIGHT placement on the stated side.",
    ),
    same_person=False,
    # 모에 블록을 여기 한 번 넣는다 — 열두 칸 중 여섯 칸에만 적용하라고 위에서 짚는다
    moe=True))

W(f"""## 슬라이서 설정

```json
{_cfg}
```

받은 다음 할 일은 [99. 슬라이서](99-슬라이서.md) 에 있습니다.
""")


# ── 플레이어 캐릭터 12파일 ───────────────────────────────────

for i, (pid, ko, src, fam, lock) in enumerate(PCS, 1):
    W = page(f'{OUT_DIR}/pc-{i:02d}-{slug(ko)}.md').append
    is_moe = fam == 'moe'
    _cfg = cfg_line(f'P{i}', pid, 4, 2, [a[0] for a in PC_ACTIONS])
    all_cfg.append(_cfg)
    prev = f'[{PCS[i-2][1]}](pc-{i-1:02d}-{slug(PCS[i-2][1])}.md)' if i > 1 else '—'
    nxt = (f'[{PCS[i][1]}](pc-{i+1:02d}-{slug(PCS[i][1])}.md)'
           if i < len(PCS) else '[NPC 1번](npc-01-' + slug(NPCS[0][1]) + '.md)')

    W(f"""# §P{i}. {ko}

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)
· [흉상 시트](02-플레이어-흉상.md)

이전: {prev} · 다음: {nxt}

| | |
|---|---|
| id | `{pid}` |
| 획득 | {src} |
| 계열 | {FAM_NAME[fam]} |

## LOCK

이 문장은 아래 두 프롬프트에 **이미 들어 있습니다.** 고치지 마세요 — 고치는 순간
그 컷만 다른 사람이 됩니다.

```
{lock}
```

---

## §P{i}. 전신 · 전투 8컷 (Gemini)

**[§P0](02-플레이어-흉상.md) 의 {i}번 칸을 레퍼런스로 첨부하세요.**

### 셀 순서

""" + cells_table(PC_ACTIONS) + "\n### 프롬프트\n")

    W(pixel_prompt(
        f"SUBJECT: a full-body action sheet of ONE single character, 8 poses.\n\n"
        f"THE CHARACTER (this exact person in all 8 cells):\n{lock}\n\n"
        + cells_block(PC_ACTIONS,
                      "The 8 cells, in this exact order. Each cell shows the WHOLE body "
                      "from head to feet, standing on an implied ground line. The body "
                      "fills about 60-65% of the cell height — the rest of the cell is "
                      "deliberately left empty so the weapon, cape and hair never reach "
                      "an edge:"),
        grid(4, 2, "Reading order is left to right, then top to bottom."),
        extra_blocks=(
            "FACING LOCK — the combat cells all face RIGHT.\n"
            "- Cells 2 to 6 and cell 8 are side or three-quarter views facing the RIGHT "
            "edge of their cell. Cells 1 and 7 face the viewer.\n"
            "- Facing right does NOT mean mirroring the character. Every LEFT/RIGHT "
            "detail in the description above stays on the same side of her or his body; "
            "when the body turns right, the character's left side is the far side.\n"
            "- The character stands on the same ground line height in every cell so the "
            "frames can be played back as an animation without the feet jumping.",
            NO_CLIP,
        ), moe=is_moe))

    W(f"""### 슬라이서 설정

```json
{_cfg}
```

---

## §PS{i}. 스플래시 (Gemini)

홈에서 아이콘을 누르면 뜨는 전신입니다 (제안서 홈 2번). 픽셀 레지스터를 유지합니다 —
여기만 일러스트로 뽑으면 홈 화면 한가운데에 세 번째 화풍이 생깁니다.

시트가 아니라 **한 장짜리 세로 이미지**입니다. 슬라이서를 안 태우고
`assets/sprites/pc_splash/{pid}.png` 로 바로 넣으세요.

**[§P0](02-플레이어-흉상.md) 의 {i}번 칸과 위 §P{i} 시트를 레퍼런스로 첨부하세요.**
""")
    W(pixel_prompt(
        f"SUBJECT: one single large full-body hero illustration of ONE character, "
        f"standing, facing the viewer at a slight three-quarter angle, filling the "
        f"full height of the tall canvas from head to feet.\n\n"
        f"THE CHARACTER:\n{lock}\n\n"
        "POSE: a confident standing hero pose — weight on one leg, weapon or signature "
        "prop held clearly so its whole shape is visible, cloak or hair caught by a "
        "light wind. Looking straight out at the viewer.\n\n"
        "This is the largest this character will ever be drawn, so it carries the most "
        "detail: individual armour plates, buckle shapes, weave in the dither fills, "
        "and the full length of every trailing piece of cloth.\n\n"
        "NOTHING IS CUT OFF. The entire figure and the entire weapon — tip to pommel — "
        "sit inside the canvas with empty black on all four sides. If the weapon is too "
        "long, draw the character smaller. Never crop it, never run it off the edge, "
        "never shorten or re-angle it to make it fit.\n\n"
        "This must be recognisably the SAME person as the attached reference: same "
        "face, same hair, same outfit down to every strap and buckle, and every "
        "LEFT/RIGHT placement above on the stated side. Do not redesign anything, "
        "do not offer alternates.",
        SPLASH, same_person=False, readable=False, moe=is_moe))


# ── NPC 15파일 ───────────────────────────────────────────────

for i, (nid, ko, place, tone, gift, perk, lock, bg) in enumerate(NPCS, 1):
    W = page(f'{OUT_DIR}/npc-{i:02d}-{slug(ko)}.md').append
    cfg_f = cfg_line(f'F{i}', nid, 3, 2, [e[0] for e in EMOTIONS])
    cfg_b = cfg_line(f'B{i}', nid + '_body', 3, 1, [b[0] for b in BODY_POSES])
    all_cfg += [cfg_f, cfg_b]
    prev = (f'[{NPCS[i-2][1]}](npc-{i-1:02d}-{slug(NPCS[i-2][1])}.md)' if i > 1
            else f'[{PCS[-1][1]}](pc-{len(PCS):02d}-{slug(PCS[-1][1])}.md)')
    nxt = (f'[{NPCS[i][1]}](npc-{i+1:02d}-{slug(NPCS[i][1])}.md)' if i < len(NPCS)
           else '[둔카락스 · 요정 · 오오라](98-둔카락스-요정-오오라.md)')

    W(f"""# §{i}. {ko}

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)

이전: {prev} · 다음: {nxt}

| | |
|---|---|
| id | `{nid}` |
| 장소 | {place} |
| 말투 | {tone} |
| 선물 테마 | {gift} |
| 호감도 MAX 혜택 | {perk} |

## LOCK

아래 여섯 프롬프트에 **이미 들어 있습니다.** 고치지 마세요.

```
{lock}
```

---

## §F{i}. 표정 6칸 (Gemini) — **이 사람의 기준 시트**

제안서 8번의 여섯 감정입니다. 이 시트가 얼굴을 확정하고, 전신도 월페이퍼도 전부
이걸 첨부합니다. **제일 먼저 뽑으세요.**

1-bit 에서 "기쁘게" 같은 지시는 절대 안 먹습니다. 눈썹이 어디로 가고 입이 무슨
모양인지를 픽셀 단위로 적어야 64px 에서 읽힙니다 — 아래 프롬프트가 그렇게 돼
있습니다.

### 셀 순서

""" + cells_table(EMOTIONS) + "\n### 프롬프트\n")

    W(pixel_prompt(
        f"SUBJECT: an expression sheet of ONE single character, 6 bust portraits.\n\n"
        f"THE CHARACTER (this exact person in all 6 cells):\n{lock}\n\n"
        + cells_block(EMOTIONS,
                      "Each cell is a bust: head, shoulders and upper chest only, "
                      "cropped at roughly nipple height, centred, filling about 85% of "
                      "the cell height. The 6 cells, in this exact order:"),
        grid(3, 2, "Reading order is left to right, then top to bottom."),
        extra_blocks=(
            "EXPRESSION IS THE ONLY VARIABLE.\n"
            "- The crop, the camera distance, the shoulder line and the lighting are "
            "identical in all 6 cells. Only brows, eyes, mouth, head tilt and the "
            "position of the hands change.\n"
            "- Do not change her hairstyle between cells to suit the mood. Hair may "
            "swing with a head tilt; it may not restyle.\n"
            "- Cell 1 is the baseline. Draw cell 1 first and derive the other five "
            "from it by moving features, not by redrawing the face.",
        )))

    W(f"""### 슬라이서 설정

```json
{cfg_f}
```

---

## §B{i}. 전신 3칸 (Gemini)

제안서 6번의 전신 3종입니다. 화면비가 흉상과 근본적으로 달라서(세로로 길다) 표정
시트와 한 장에 못 묶습니다 — 묶으면 셀이 정사각형이 되고 전신이 뭉개집니다.

**위 §F{i} 시트를 레퍼런스로 첨부하세요.**

### 셀 순서

""" + cells_table(BODY_POSES) + "\n### 프롬프트\n")

    W(pixel_prompt(
        f"SUBJECT: a full-body pose sheet of ONE single character, 3 poses.\n\n"
        f"THE CHARACTER (this exact person in all 3 cells):\n{lock}\n\n"
        + cells_block(BODY_POSES,
                      "Each cell shows the WHOLE body from head to feet, standing on an "
                      "implied ground line. The body fills about 75% of the tall cell's "
                      "height, leaving room for raised arms, swung hair and trailing "
                      "sleeves. The 3 cells, in this exact order:"),
        grid(3, 1,
             "Each cell is TALL — roughly twice as high as it is wide. This is a "
             "wide short sheet of three tall cells side by side."),
        extra_blocks=(
            "SAME BODY, SAME SCALE.\n"
            "- Her head sits at the same height in all three cells and her feet rest on "
            "the same ground line, so the three can be swapped in place without her "
            "appearing to grow or shrink.\n"
            "- Cell 1 is the baseline standing pose. It must match the character in the "
            "attached expression sheet exactly — same outfit, same props, same side "
            "for every asymmetric detail.",
            NO_CLIP,
        )))

    W(f"""### 슬라이서 설정

```json
{cfg_b}
```

---

## §W{i}. 호감도 보상 월페이퍼 4장 (GPT)

여기만 다른 레지스터입니다. 게임 안에 들어가는 그림이 아니라, 호감도를 올리면
**받아서 화면 밖에서 보는** 흑백 애니 일러스트입니다.
`assets/2026-08-29-001/file_0000000066b8820682d6077adf3f81e8.jpg` 가 기준 톤입니다.

슬라이서를 태우지 않습니다 — 원본 그대로 `assets/wallpaper/{nid}/lv3.jpg` 처럼
넣으세요. 1-bit 로 만들면 안 됩니다.

### 레벨은 3 · 5 · 7 · 10 입니다

제안서 6번은 "1·5·10 세 장", 8번은 "3·5·7·10 네 장" 으로 서로 다릅니다.
**8번을 따랐습니다** — 말투가 바뀌는 지점과 그림이 풀리는 지점이 같아야 "레벨이
올랐다" 가 한 번에 읽힙니다. 6번대로 Lv1 에 한 장을 주면 호감도를 쌓기도 전에
보상이 먼저 나와서, 나머지 아홉 레벨이 심심해집니다.

### 뽑을 때

1. **위 §F{i} 와 §B{i} 시트를 레퍼런스로 첨부하세요.** 픽셀 그림이지만 머리 모양·
   복장·소품·좌우 배치를 잡아 주는 데는 충분히 먹습니다.
2. 네 장을 **연달아 한 대화 안에서** 뽑으세요. 세션을 나누면 사람이 바뀝니다.
3. Lv3 을 먼저 뽑고, 그 결과를 Lv5·7·10 요청에 다시 첨부하세요.
""")

    for lv, lvko, lven, ladder in AFFINITY_LEVELS:
        W(f"\n### §W{i}-{lv} · 호감도 Lv{lv} — {lvko}\n")
        W("```\n" + "\n\n".join([
            "A single monochrome greyscale anime illustration of one woman.",
            f"THE CHARACTER (identical across all four images in this set):\n{lock}",
            f"THE SETTING: {bg}.",
            f"THIS IMAGE — affinity level {lv} of 10, \"{lven}\":\n{ladder}",
            ILLUST_STYLE,
            ILLUST_LOCK,
            "OUTPUT: one finished illustration, 16:9 landscape, wallpaper resolution. "
            "No grid, no panels, no text anywhere in the image.",
        ]) + "\n```\n")


# ── 98. 둔카락스 · 요정 · 오오라 ─────────────────────────────

W = page(f'{OUT_DIR}/98-둔카락스-요정-오오라.md').append
cfg_s = cfg_line('S1', SMITH[0], 4, 1, [e[0] for e in SMITH_EMOTIONS] + ['stand'])
cfg_y = cfg_line('Y1', FAIRY[0], 4, 2, [f[0] for f in FAIRY_FRAMES])
cfg_x = cfg_line('X1', 'aura', 5, 1, [g[0] for g in AURA_GRADES])
all_cfg += [cfg_s, cfg_y, cfg_x]

W(f"""# 98. 둔카락스 · 안내 요정 · 등급 오오라

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)

호감도가 없는 둘과, 캐릭터 뒤에 겹쳐 그리는 오버레이 한 장입니다.

---

## §S1. 둔카락스 — 표정 3칸 + 전신 1칸 (Gemini)

장인의 집. **유일한 남자 NPC** 입니다. 제안서대로 감정은 무뚝뚝 · 즐거움 · 신뢰
셋뿐입니다 — 이 노인에게 부끄러움·행복 사다리를 붙이면 다른 캐릭터가 됩니다.

| | |
|---|---|
| id | `{SMITH[0]}` |
| 장소 | {SMITH[2]} |
| 말투 | {SMITH[3]} |

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 무뚝뚝 | 즐거움 | 신뢰 | 전신 |
| id | `gruff` | `amused` | `trust` | `stand` |

### LOCK

```
{SMITH[4]}
```

### 프롬프트
""")

W(pixel_prompt(
    f"SUBJECT: a character sheet of ONE single character: 3 bust portraits and 1 "
    f"full-body pose.\n\n"
    f"THE CHARACTER (this exact person in all 4 cells):\n{SMITH[4]}\n\n"
    + cells_block(SMITH_EMOTIONS,
                  "Cells 1 to 3 are busts: head, shoulders and upper chest only, "
                  "cropped at roughly nipple height, centred, filling about 85% of the "
                  "cell height.")
    + "\n\nCell 4 — the WHOLE body from head to feet, standing square-on to the "
      "viewer, feet planted wide, the forging hammer resting head-down on the ground "
      "beside his RIGHT boot with his hand on the haft. He fills about 70% of the cell "
      "height, and the hammer, his beard and both boots are all completely inside the "
      "cell. Gruff neutral face.",
    grid(4, 1,
         "Cells 1 to 3 are busts and cell 4 is a full body. All four cells are the "
         "same size; the full body is simply drawn smaller within its cell."),
    extra_blocks=(
        "HE IS ENORMOUS. His shoulders are nearly as wide as he is tall, so the bust "
        "cells feel tight and the full-body cell has air around it. That contrast is "
        "the point. Tight does not mean cut off: even in the bust cells his beard, his "
        "headband and the top of his head are fully drawn inside the cell.",
        NO_CLIP,
    )))

W(f"""### 슬라이서 설정

```json
{cfg_s}
```

---

## §Y1. 안내 요정 — 8프레임 (Gemini)

제안서 9번. 홈 안에서 계속 작게 돌아다니고, 누르면 말을 겁니다. 호감도는 없습니다.
`fly1` 과 `fly2` 를 번갈아 재생하면 날갯짓 루프가 됩니다.

### 셀 순서

""" + cells_table(FAIRY_FRAMES) + f"""
### LOCK

```
{FAIRY[3]}
```

### 프롬프트
""")

W(pixel_prompt(
    f"SUBJECT: an animation frame sheet of ONE single tiny character, 8 frames.\n\n"
    f"THE CHARACTER (this exact character in all 8 cells):\n{FAIRY[3]}\n\n"
    + cells_block(FAIRY_FRAMES,
                  "Each cell shows the whole fairy, airborne, centred, filling about "
                  "70% of the cell height with black space all around her so she can "
                  "drift within her cell. The 8 cells, in this exact order:"),
    grid(4, 2, "Reading order is left to right, then top to bottom."),
    extra_blocks=(
        "ANIMATION FRAMES, NOT ILLUSTRATIONS.\n"
        "- Cells 1 and 2 are two halves of one wingbeat loop and differ ONLY in wing "
        "position and vertical offset. Everything else in those two cells is "
        "pixel-identical.\n"
        "- She is tiny on screen — about 32 pixels tall. Her silhouette must survive "
        "that: big head, four clear wing shapes, one antenna curl. Nothing else "
        "will be visible.",
    )))

W(f"""### 슬라이서 설정

```json
{cfg_y}
```

---

## §X1. 업적 등급 오오라 5칸 (Gemini)

제안서 3번. 캐릭터 로고와 전신 **뒤에 겹쳐 그리는 오버레이**입니다. 캐릭터가 아니라
빈 오오라만 뽑아서 코드로 겹칩니다 — 캐릭터마다 오오라를 그려 넣으면 12×5 = 60장이
되고, 등급 기준이 한 번 바뀌면 60장을 다시 뽑아야 합니다.

가운데는 비워 둡니다. 거기 캐릭터가 들어갑니다.

> 제안서가 "너무 눈뽕은 지양" 이라고 적어 뒀고, 이건 지켜야 합니다. 이미 한 번
> 전체 화면 플래시를 다 걷어낸 적이 있습니다 (`src/ui/EnhanceFx.tsx`).
> S 등급도 **깜빡이지 않습니다** — 도는 것과 깜빡이는 것은 다릅니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 등급 | D | C | B | A | S |
| id | `d` | `c` | `b` | `a` | `s` |

### 프롬프트
""")

W(pixel_prompt(
    "SUBJECT: 5 aura overlay effects of escalating grade, one per cell. There is NO "
    "character in any cell — only the effect, drawn around an empty centre where a "
    "character will later be composited.\n\n"
    + cells_block(AURA_GRADES,
                  "Each cell is the same square, with the middle 50% left completely "
                  "empty black. The 5 cells, in this exact order:"),
    grid(5, 1),
    extra_blocks=(
        "OVERLAY RULES.\n"
        "- Every mark is pure white on pure black. The black is transparent later, so "
        "anything you draw WILL appear on top of the character.\n"
        "- Never fill a solid white area larger than a few pixels — a big white blob "
        "becomes a white blob sitting on the character's face.\n"
        "- The escalation is in DENSITY and REACH, not brightness. Cell 5 has more "
        "marks over a wider area than cell 4; it is not a brighter version of it.\n"
        "- No lens flares, no starbursts covering the centre, no full-frame glow.",
    ),
    same_person=False))

W(f"""### 슬라이서 설정

```json
{cfg_x}
```
""")


# ── 99. 슬라이서 ─────────────────────────────────────────────

W = page(f'{OUT_DIR}/99-슬라이서.md').append

W(f"""# 99. 슬라이서와 후처리

← [색인으로](../CHARACTER_ART_PROMPTS.md) · [규칙과 순서](00-규칙과-순서.md)

## 받은 다음

1. 시트를 `assets/` 아래 아무 폴더에나 넣고, 그 폴더를
   `tools/sprites.config.json` 의 `_srcDirs` 에 추가
2. 해당 캐릭터 파일에 적힌 슬라이서 설정 줄을 `sets` 에 붙여넣기 (아래에 모아 뒀습니다)
3. `python tools/slice.py`

슬라이서가 마젠타 경계로 자르고, 1-bit 이진화하고, 투명 배경 PNG 로 만들고,
`src/ui/spriteAssets.ts` 인덱스까지 다시 씁니다.

**스플래시와 월페이퍼는 슬라이서를 안 태웁니다** — 원본 그대로
`assets/sprites/pc_splash/(id).png` · `assets/wallpaper/(npc_id)/lv(레벨).jpg` 로
넣으세요. 월페이퍼를 1-bit 로 만들면 안 됩니다.

## 마젠타 경계선

셀 사이에 `#FF00FF` 선을 넣게 지시합니다. 흑백 팔레트 밖의 색이라 슬라이서가 셀
경계를 100% 정확히 찾아 자를 수 있고, 잘려나가는 픽셀이라 아트에는 영향이 없습니다.

## 설정 {len(all_cfg)}줄 전부

`tools/sprites.config.json` 의 `sets` 에 그대로 붙여넣으면 됩니다. 받은 시트만
골라서 넣으세요 — 없는 파일이 있으면 슬라이서가 그 줄에서 멈춥니다.

```json
""" + ",\n".join(all_cfg) + """
```

## Gemini 가 늘 하는 짓

`ASSET_PROMPTS.md` 에 적어 둔 것과 같습니다. 캐릭터에서 특히 심한 것만 옮깁니다.

- **요청한 행보다 많이 그립니다.** 변형 행을 덧붙입니다. 슬라이서 `pickRows` 로
  쓸 행만 고르면 됩니다 — 잘못 나온 게 아닙니다.
- **캡션을 답니다.** 캐릭터 시트는 특히 심합니다 (이름표를 붙이고 싶어 합니다).
  그래서 모든 프롬프트 맨 앞에 `ABSOLUTE RULE — NO TEXT` 가 따로 들어갑니다.
  이름이 박혀 나오면 `cropBottom` 으로 잘라내세요 — 지금 `avatar` 세트가 그렇게
  처리돼 있습니다 (`cropBottom: 0.15`).
- **좌우를 뒤집습니다.** 옆모습 컷에서 제일 자주 터집니다. LOCK 의 LEFT/RIGHT 를
  대문자로 둔 이유고, 그래도 뒤집히면
  [규칙과 순서](00-규칙과-순서.md) 의 재요청 한 줄을 쓰세요.
- **회색과 안티에일리어싱을 섞습니다.** 못 하게 해도 섞습니다. 슬라이서가
  임계값 128 로 이진화하니 그냥 두면 됩니다.
- **8×8 UI 아이콘은 못 만듭니다.** `src/ui/sprites.ts` 의 코드 스프라이트가
  더 정확합니다.
""")


# ── 쓰기 ─────────────────────────────────────────────────────

os.makedirs(OUT_DIR, exist_ok=True)
# 예전에 한 파일로 만들던 시절의 잔재를 지운다 — 남아 있으면 둘 다 검색에 걸린다
for stale in os.listdir(OUT_DIR):
    if stale.endswith('.md') and os.path.join(OUT_DIR, stale).replace('\\', '/') \
            not in {n for n, _b in _files}:
        os.remove(os.path.join(OUT_DIR, stale))

big = []
for name, buf in _files:
    text = "\n".join(buf)
    os.makedirs(os.path.dirname(name), exist_ok=True)
    open(name, 'w', encoding='utf-8').write(text)
    if len(text) > 200_000:
        big.append((name, len(text)))

total = sum(len("\n".join(b)) for _n, b in _files)
print('%d files, %d KB total, biggest %d KB'
      % (len(_files), total // 1024,
         max(len("\n".join(b)) for _n, b in _files) // 1024))
print('  %d gemini sheets + %d splash + %d gpt wallpapers = %d requests'
      % (n_sheet, len(PCS), n_gpt, n_gemini + n_gpt))
if big:
    print('  !! 서식 편집이 막힐 만큼 큰 파일:', big)
