# 상태 효과 로고

**이 파일은 자동 생성됩니다** — `python tools/gen-status.py`.

걸린 사람의 이름표 옆에 붙는 작은 로고 **열둘**입니다. 출혈처럼 한동안
걸려 있다가 풀리는 것들입니다.

보스 패시브 로고 넷은 따로 있습니다
([`BOSS_PASSIVE_PROMPTS.md`](BOSS_PASSIVE_PROMPTS.md)) — 저건 보스 하나에게
싸우는 내내 붙어 있고, 이건 누구에게든 몇 초씩 붙었다 사라집니다.

## 맛이 아니라 규칙으로 묶었습니다

맹독 · 강산성 · 독성 포자 · 부패의 악취 · 소화액은 이름이 다섯인데 규칙은
하나입니다 — 0.5초마다 마법 피해. 12px 에서 그 다섯을 갈라 그릴 방법이
없고, 갈라 봐야 플레이어가 알아야 할 것("지금 마법으로 갉이고 있다")은
같습니다. 그래서 **규칙 하나에 로고 하나**입니다.

물리 지속 피해(출혈)만 따로 뒀습니다. 저건 **막는 스탯이 달라서**
(`core/chars` 의 `Armor`) 실제로 다른 규칙입니다.

## 목록

| 로고 | 이름 | 좋고 나쁨 | 뜻 | 거는 곳 |
|---|---|---|---|---|
| `st_bleed` | 출혈 | 나쁜 | 물리 지속 피해 | 5·7·11판 우두머리 |
| `st_poison` | 중독 | 나쁜 | 마법 지속 피해 (맹독·산성·포자·부패 전부) | 3·8·10·12·14·15판 우두머리 |
| `st_stun` | 기절 | 나쁜 | 행동 불가 | 6·13·17판 우두머리 |
| `st_silence` | 침묵 | 나쁜 | 스킬 사용 불가 | 15판 우두머리 |
| `st_slow` | 둔화 | 나쁜 | 공격속도 감소 | 4·10·12판 우두머리 |
| `st_weak` | 약화 | 나쁜 | 공격력 감소 | 17판 우두머리 |
| `st_break` | 파쇄 | 나쁜 | 방어력 감소 (0으로 만드는 것 포함) | 15·16판 우두머리 |
| `st_wither` | 시듦 | 나쁜 | 받는 치유량 감소 | 14판 우두머리 |
| `st_rage` | 격노 | 좋은 | 공격력 증가 | 보조가 곁에 섰을 때 (`core/party` 의 `supportMul`) |
| `st_guard` | 견고 | 좋은 | 방어력 증가 | 20판 우두머리 |
| `st_regen` | 재생 | 좋은 | 지속 회복 | 20판 우두머리 |
| `st_haste` | 신속 | 좋은 | 공격속도 증가 | 아직 없음 — 둔화의 짝으로 자리만 열어 둡니다 |

## 안 만든 것

- **관통 · 방어 무시** (9·11·18판 우두머리) — **지속이 없습니다.** 그 한 대가
  방어를 뚫고 끝나므로 걸려 있을 것이 없고, 걸려 있지 않은 것에 로고를 붙이면
  플레이어가 "언제 풀리나" 를 기다리게 됩니다. 파쇄(`st_break`)는 한동안
  방어력이 깎여 있는 것만입니다 (15·16판).
- **스킬 게이지 차감** (20판 실바누스) — 이것도 한 번에 끝납니다. 게이지가
  줄어드는 것은 게이지 막대가 이미 말합니다.
- **보스가 받는 피해 20% 감소** (20판) — 패시브라 상태가 아니라 보스 로고
  쪽입니다 ([`BOSS_PASSIVE_PROMPTS.md`](BOSS_PASSIVE_PROMPTS.md) 의 `bp_ward`).

## 좋고 나쁨은 그림이 아니라 화면이 말합니다

흑백 2색이라 초록 테두리·빨간 테두리를 쓸 수가 없습니다. 그래서 로고는
**무엇인지만** 말하고, 좋은 것인지 나쁜 것인지는 화면이 자리로 말합니다 —
좋은 것은 이름표 왼쪽, 나쁜 것은 오른쪽 같은 식입니다.

그래서 로고를 그릴 때 "나쁜 것이니까 어둡게" 같은 것을 하면 안 됩니다.
열둘이 **같은 무게, 같은 채움**이어야 합니다.

## 열여섯이 다 갈려야 합니다

상태 로고 열둘과 보스 패시브 로고 넷이 **한 화면에 같이 뜹니다.**

| 로고 | 윤곽 |
|---|---|
| `st_bleed` | 사선 막대 둘 |
| `st_poison` | 물방울 |
| `st_stun` | 번개(ㄹ 꺾임) |
| `st_silence` | 가로 막대 하나 |
| `st_slow` | 아래 갈매기 하나 |
| `st_haste` | 위 갈매기 둘 |
| `st_rage` | 길쭉한 칼 |
| `st_weak` | 부러진 짧은 칼 |
| `st_guard` | 꽉 찬 사각 |
| `st_break` | 귀퉁이 떨어진 사각 |
| `st_regen` | 십자 |
| `st_wither` | ㅜ 자 |
| `bp_thorn` | 여섯 갈래 별 (보스 패시브) |
| `bp_viscous` | 늘어진 가닥 셋 (보스 패시브) |
| `bp_rot` | 한쪽 먹힌 원 (보스 패시브) |
| `bp_ward` | 방패 (보스 패시브) |

### 특히 헷갈리기 쉬운 짝

- **st_rage ↔ st_weak** — 둘 다 칼이다. **높이**로 가른다 — 격노는 칸을 꽉 채우고 약화는 절반까지만 온다
- **st_guard ↔ st_break** — 둘 다 사각이다. **귀퉁이 하나가 통째로 없는가**로 가른다. 물어뜯긴 자리가 전체의 4분의 1 이라 12px 에서도 남는다
- **st_regen ↔ st_wither** — 둘 다 십자다. **위 팔이 있는가**로 가른다. 팔 두께가 칸의 3분의 1 이라 없으면 바로 보인다
- **st_slow ↔ st_haste** — 둘 다 갈매기다. 방향이 반대이고, **개수도 다르다** (하나 / 둘). 방향만으로 갈랐다가 뒤집힌 채로 그려져 오면 알 방법이 없다
- **st_poison ↔ bp_viscous** — 둘 다 흘러내리는 것이다. 중독은 **떨어져 나온 방울 하나**이고, 점성은 **위에 매달린 가닥 셋**이다
- **st_silence ↔ st_bleed** — 둘 다 막대다. 침묵은 **가로 하나**, 출혈은 **사선 둘**이다

## 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | 출혈 | 중독 | 기절 | 침묵 | 둔화 | 약화 | 파쇄 | 시듦 | 격노 | 견고 | 재생 | 신속 |
| id | `st_bleed` | `st_poison` | `st_stun` | `st_silence` | `st_slow` | `st_weak` | `st_break` | `st_wither` | `st_rage` | `st_guard` | `st_regen` | `st_haste` |

## 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of 12 ICONS in one row, left to right. They are a matched set — same weight, same fill, same size within their cells, drawn by the same hand on the same day.

The 12 cells, in this exact order:

Cell 1 — TWO PARALLEL SLASHES. Two thick straight bars running corner to corner diagonally across the cell, top-right to bottom-left, each a fifth of the cell wide, with a gap of the same width between them. The upper one is longer and runs the full diagonal; the lower one is two-thirds as long. Both ends of both bars are cut flat and square, not tapered to points. Nothing else in the cell. Squint test: two slashes.
Cell 2 — ONE FALLING DROP. A single solid teardrop filling the whole cell — a fat round bottom taking two-thirds of the height, narrowing upward into a thick neck that ends in a blunt point at the top edge. The widest part is at the bottom. It is one smooth bulging mass with no notch, no cut and no second shape. Squint test: a drop.
Cell 3 — A THICK BOLT. One solid zigzag running top to bottom: a wide bar coming down from the top edge to the middle, jogging hard sideways by half the cell width, then continuing down to the bottom edge. The bar is a quarter of the cell wide along its whole length and the corners at the jog are sharp right angles, not curves. It touches the top and bottom edges. Squint test: a bolt.
Cell 4 — ONE HEAVY BAR. A single solid horizontal bar across the middle of the cell, running the FULL width edge to edge, a third of the cell tall, with flat square ends. There is nothing above it and nothing below it — the rest of the cell is empty. It is the simplest icon of the set and it must stay that way: a mouth stopped. Squint test: a bar.
Cell 5 — ONE DOWNWARD CHEVRON. A single thick V shape pointing DOWN, filling the middle of the cell — two heavy arms meeting at a point at the bottom, each arm a quarter of the cell wide, the open ends reaching the upper left and upper right corners. One chevron only. Squint test: a down arrowhead.
Cell 6 — A SNAPPED BLADE. A short stubby wedge standing upright in the lower half of the cell — wide and flat at the bottom, narrowing as it rises, but CUT OFF FLAT halfway up with a coarse jagged break of three big teeth across the top. It reaches only halfway up the cell and it has no point. It is the short broken twin of the rage icon and the difference in HEIGHT is the whole read. Squint test: a broken stump.
Cell 7 — A BROKEN BLOCK. A solid rectangle filling the whole cell, with ONE horizontal groove across the middle a tenth of the cell tall — and the entire TOP RIGHT QUARTER of the rectangle is missing, bitten away in a coarse stepped break of three big square steps. The bite is a quarter of the whole shape, so it is impossible to miss. It is the broken twin of the guard icon. Squint test: a block with a corner gone.
Cell 8 — A CROSS WITH NO TOP. A thick upright bar standing in the middle of the cell from the bottom edge up to two-thirds height, crossed near its top by a thick horizontal bar running the full width — a T shape, arms a third of the cell wide. There is NO arm above the crossbar. It is the regen cross with the top broken off, and that missing arm is the whole read. Squint test: a T.
Cell 9 — A WHOLE BLADE. A tall narrow wedge standing upright and filling the FULL height of the cell — wide and flat at the bottom edge, tapering evenly all the way up to a single sharp point at the top edge. No crossguard, no hilt, no notch, nothing but the wedge. It is the tall whole twin of the weak icon and the difference in HEIGHT is the whole read. Squint test: a blade.
Cell 10 — A WHOLE BLOCK. A solid rectangle filling the whole cell edge to edge, with ONE horizontal groove across the middle a tenth of the cell tall, dividing it into two equal courses. Every corner is square and present. It is the whole twin of the break icon. Squint test: a solid block.
Cell 11 — A THICK CROSS. A plus sign filling the whole cell — a vertical bar from the top edge to the bottom edge and a horizontal bar from the left edge to the right edge, both a third of the cell wide, crossing at the centre. All four arms are the same length and all four ends are cut flat. Squint test: a plus.
Cell 12 — TWO UPWARD CHEVRONS. Two thick chevrons pointing UP, stacked one above the other with a gap between them — each two heavy arms meeting at a point at the top, each arm a fifth of the cell wide. The lower one is wider and reaches both side edges; the upper one is narrower and sits above it. TWO of them, and that count is what separates this from the slow icon as much as the direction does. Squint test: two up arrowheads.

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

ICON RULES — this is a symbol, not a picture.

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

TEST: squint until the image is a blur. If you can still name it, it is right.
If it becomes a grey blob, the shape is too busy.

THEY ALL WEIGH THE SAME.
- Half of these are bad things and half are good things, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

THEY MUST NOT BE CONFUSABLE. Put all 12 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

FOUR PAIRS ARE DELIBERATELY RELATED AND MUST STILL SEPARATE:
- Cell 9 (whole blade, full height) vs cell 6 (snapped blade, half height) — separated by HEIGHT.
- Cell 10 (whole block) vs cell 7 (block with a quarter bitten out) — separated by the MISSING CORNER.
- Cell 11 (four-armed cross) vs cell 8 (three-armed T) — separated by the MISSING TOP ARM.
- Cell 5 (one chevron, pointing down) vs cell 12 (two chevrons, pointing up) — separated by DIRECTION and by COUNT.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 12 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 12 cells.
- EVERY CELL MUST BE SQUARE. With a 12x1 grid that means the whole sheet is
  12:1 — output it at 6144x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## 슬라이서 설정

```json
{ "file": "<파일명>", "name": "status_icon", "expect": [12, 1],
  "labels": ["st_bleed", "st_poison", "st_stun", "st_silence", "st_slow", "st_weak", "st_break", "st_wither", "st_rage", "st_guard", "st_regen", "st_haste"] }
```

한 줄에 열둘이면 셀 하나가 512px 이라 시트가 6144x512 입니다. 너무 길면
**여섯씩 두 줄**로 받아도 됩니다 — 그때는 `"expect": [6, 2]` 로 바꾸고
프롬프트의 마지막 문단(SHEET LAYOUT)을 `6 columns x 2 rows` 로 고치세요.
읽는 차례는 왼쪽에서 오른쪽, 그다음 아래 줄입니다.

## 다시 뽑을 때

**둘이 비슷하게 나왔을 때**

```
Two of these icons have become confusable at small size. They will be shown at 12
to 16 pixels, where only the OUTLINE survives. Redraw the weaker one so that its
outline differs from the other in overall shape, not in interior detail. Keep every
other cell exactly as it is.
```

**속이 비어서 나왔을 때** (제일 자주 납니다)

```
The icons are drawn as hollow outlines. At 14 pixels an outline and the hole inside
it merge into a grey smudge. Redraw every icon as a SOLID FILLED WHITE MASS on pure
black, with at most one notch cut into it, and that notch at least a fifth of the
width.
```

**칸 안에서 작게 나왔을 때**

```
The icons are drawn small inside their cells with empty margins. Each shape must
touch or nearly touch all four sides of its own cell. Redraw them larger.
```
