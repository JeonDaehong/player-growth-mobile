# 상태 효과 로고

**이 파일은 자동 생성됩니다** — `python tools/gen-status.py`.

걸린 사람의 파티 칸에 붙는 작은 로고 **22개**입니다. 출혈처럼 한동안
걸려 있다가 풀리는 것들입니다. 몇은 **적에게** 걸립니다 (도발 · 보호막 ·
시듦) — 그때는 적 머리 위에 뜹니다.

보스 패시브 로고는 따로 있습니다
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
| `st_poison` | 중독 | 나쁜 | 마법 지속 피해 (맹독·산성·포자·부패 전부) | 3·8·10·12·14·15·21·24·29판 우두머리 |
| `st_stun` | 기절 | 나쁜 | 행동 불가 | 6·13·17·22·23·30판 우두머리 |
| `st_silence` | 침묵 | 나쁜 | 스킬 사용 불가 | 15판 우두머리 |
| `st_slow` | 둔화 | 나쁜 | 공격속도 감소 | 4·10·12판 우두머리 |
| `st_weak` | 약화 | 나쁜 | 공격력 감소 | 17판 우두머리 |
| `st_break` | 파쇄 | 나쁜 | 방어력 감소 (0으로 만드는 것 포함) | 15·16·30판 우두머리 |
| `st_wither` | 시듦 | 나쁜 | 받는 치유량 감소 | 14·28판 우두머리 · 비앙카의 화산 (적에게 걸린다) |
| `st_taunt` | 도발 | 나쁜 | 건 사람만 노리게 된다 (적에게 걸린다) | 이졸데의 도발 (`SKILLS.taunt`) — 적에게 걸린다 |
| `st_shield` | 보호막 | 나쁜 | 깨야 하는 껍질 — 시간 안에 못 깨면 큰일이 난다 (적에게 걸린다) | 22·23·29판 우두머리 |
| `st_confuse` | 혼란 | 나쁜 | 스킬을 못 쓰고 아군을 친다 | 24·29판 우두머리 |
| `st_burn` | 화상 | 나쁜 | 받는 피해 증가 | 26판 우두머리 |
| `st_numb` | 신경 마비 | 나쁜 | 평타를 쳐도 스킬 코스트가 안 찬다 | 25·29판 우두머리 |
| `st_shock` | 감전 | 나쁜 | 행동 불가 + 몸에 전기가 흐른다 | 20판 우두머리 |
| `st_rage` | 격노 | 좋은 | 공격력 증가 | 아직 없음 — 약화의 짝으로 자리만 열어 둡니다 |
| `st_guard` | 견고 | 좋은 | 방어력 증가 | 20판 우두머리 |
| `st_regen` | 재생 | 좋은 | 지속 회복 | 20판 우두머리 |
| `st_haste` | 신속 | 좋은 | 공격속도 증가 | 리안느의 광란 (`core/chars` 의 `SKILLS.frenzy`) |
| `st_focus` | 집중 | 좋은 | 치명타 확률 증가 | — |
| `st_ward` | 보호 | 좋은 | 새로 걸리는 나쁜 것을 막는다 | — |
| `st_leech` | 흡혈 | 좋은 | 입힌 피해의 일부만큼 회복한다 | — |
| `st_fey` | 요정 | 좋은 | 때릴 때마다 미니 화살이 한 번 더 날아간다 | — |

## 안 만든 것

- **관통 · 방어 무시** (9·11·18판 우두머리) — **지속이 없습니다.** 그 한 대가
  방어를 뚫고 끝나므로 걸려 있을 것이 없고, 걸려 있지 않은 것에 로고를 붙이면
  플레이어가 "언제 풀리나" 를 기다리게 됩니다. 파쇄(`st_break`)는 한동안
  방어력이 깎여 있는 것만입니다 (15·16판).
- **스킬 게이지 차감** (20판 실바누스) — 이것도 한 번에 끝납니다. 게이지가
  줄어드는 것은 게이지 막대가 이미 말합니다.
- **보스가 받는 피해 20% 감소** (20판) — 패시브라 상태가 아니라 보스 로고
  쪽입니다 ([`BOSS_PASSIVE_PROMPTS.md`](BOSS_PASSIVE_PROMPTS.md) 의 `bp_ward`).

## 좋고 나쁨은 그림이 아니라 **테두리**가 말합니다

로고 자체는 **무엇인지만** 말합니다. 좋은 것인지 나쁜 것인지는 화면이 칸의
테두리 색으로 말합니다 — 초록이면 도움이 되는 것, 빨강이면 나쁜 것
(`ui/theme` 의 `GOOD_C`·`BAD_C`). 안쪽 그림은 그대로 흰색입니다.

그래서 로고를 그릴 때 "나쁜 것이니까 어둡게" 같은 것을 하면 안 됩니다.
**같은 무게, 같은 채움**이어야 합니다 — 어느 쪽인지는 그림이 말할 일이
아닙니다.

## 전부가 다 갈려야 합니다

상태 로고와 보스 패시브 로고가 **한 화면에 같이 뜹니다.**

| 로고 | 윤곽 |
|---|---|
| `st_bleed` | 사선 막대 둘 |
| `st_poison` | 한쪽 먹힌 원 |
| `st_stun` | 번개(ㄹ 꺾임) |
| `st_silence` | 가로 막대 하나 |
| `st_slow` | 아래 갈매기 하나 |
| `st_haste` | 위 갈매기 둘 |
| `st_rage` | 길쭉한 칼 |
| `st_weak` | 부러진 짧은 칼 |
| `st_taunt` | 가로 쐐기 (왼쪽이 얇다) |
| `st_shield` | 두꺼운 육각 고리 |
| `st_confuse` | 나선 |
| `st_burn` | 불꽃 (아래가 무겁고 위가 셋) |
| `st_numb` | 끊어진 세로 막대 |
| `st_shock` | 뒤집힌 U 자 (다리 둘) |
| `st_guard` | 꽉 찬 사각 |
| `st_break` | 귀퉁이 떨어진 사각 |
| `st_regen` | 십자 |
| `st_wither` | ㅜ 자 |
| `st_focus` | 겹친 네모 둘 + 가운데 점 |
| `st_ward` | 아치 + 아래 가로선 |
| `st_leech` | 거꾸로 선 물방울 |
| `st_fey` | 작은 화살 셋 (제각각 방향) |
| `bp_thorn` | 여섯 갈래 별 (보스 패시브) |
| `bp_viscous` | 물방울 (보스 패시브) |
| `bp_rot` | 세 갈래로 솟은 덩이 (보스 패시브) |
| `bp_ward` | 방패 (보스 패시브) |

### 특히 헷갈리기 쉬운 짝

- **st_rage ↔ st_weak** — 둘 다 칼이다. **높이**로 가른다 — 격노는 칸을 꽉 채우고 약화는 절반까지만 온다
- **st_guard ↔ st_break** — 둘 다 사각이다. **귀퉁이 하나가 통째로 없는가**로 가른다. 물어뜯긴 자리가 전체의 4분의 1 이라 12px 에서도 남는다
- **st_regen ↔ st_wither** — 둘 다 십자다. **위 팔이 있는가**로 가른다. 팔 두께가 칸의 3분의 1 이라 없으면 바로 보인다
- **st_slow ↔ st_haste** — 둘 다 갈매기다. 방향이 반대이고, **개수도 다르다** (하나 / 둘). 방향만으로 갈랐다가 뒤집힌 채로 그려져 오면 알 방법이 없다
- **st_poison ↔ st_break** — 둘 다 한쪽이 크게 떨어져 나간 모양이다. 중독은 **원**이고 파쇄는 **사각**이다 — 그것 하나로 갈린다
- **st_silence ↔ st_bleed** — 둘 다 막대다. 침묵은 **가로 하나**, 출혈은 **사선 둘**이다
- **st_ward ↔ bp_ward** — 둘 다 막는 것이다. 보스 패시브는 **방패**(아래가 뾰족한 덩어리)이고 이건 **아치와 바닥선**(속이 빈 둘)이다 — 채워졌는가로 갈린다
- **st_leech ↔ st_regen** — 둘 다 좋은 것이고 회복을 말한다. 재생은 **십자**, 흡혈은 **거꾸로 선 물방울**이다 — 모양 자체가 다르다
- **st_fey ↔ st_bleed** — 둘 다 여러 개의 비스듬한 조각이다. 출혈은 **나란한 사선 둘**이고 요정은 **제각각 방향을 보는 화살 셋**이다 — 나란한가로 갈린다

## 넷씩 세 장으로 나눕니다

한 시트에 열둘을 달라고 두 번 요청했고 **두 번 다 망가져 왔습니다** — 6x3 에
같은 그림이 두세 번씩 들어 있고, 가장자리는 디더링돼서 14px 에서 회색 얼룩이
됐습니다.

그런데 이 프로젝트에서 **4칸 시트는 늘 한 번에 나왔습니다** — `role_icon` ·
`skill_icon` · `boss_passive` 전부 그랬습니다. 열둘이 문제였지 아이콘이 문제가
아니었습니다.

**짝은 같은 장에 뒀습니다.** 부러진 칼/온전한 칼처럼 일부러 닮게 그리고 한
가지로만 가르는 것들은, 다른 장에서 따로 그리면 둘이 안 닮습니다.

파일 이름은 `status-1.jpg` · `status-2.jpg` · `status-3.jpg` 입니다.

## A장 — 지속 피해와 행동 불가

넷 다 서로 안 닮았습니다. 짝이 없으므로 각자 제 모양이면 됩니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 출혈 | 중독 | 기절 | 침묵 |
| id | `st_bleed` | `st_poison` | `st_stun` | `st_silence` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. 4 cells. Not more, not fewer, and not two rows — 4 cells in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 4 cells, in this exact order:

Cell 1 — TWO PARALLEL SLASHES. Two thick straight bars running corner to corner diagonally across the cell, top-right to bottom-left, each a fifth of the cell wide, with a gap of the same width between them. The upper one is longer and runs the full diagonal; the lower one is two-thirds as long. Both ends of both bars are cut flat and square, not tapered to points. Nothing else in the cell. Squint test: two slashes.
Cell 2 — AN EATEN DISC. One solid circle filling the whole cell, with a single enormous BITE taken out of its upper right — the bite is a third of the diameter deep and reaches nearly to the centre, with a coarse edge of three big rounded scallops. Everything else is solid fill and the shape still reads as a circle. It is ROUND where the break icon is SQUARE, and that is what separates the two. Squint test: a circle with a chunk gone.
Cell 3 — A THICK BOLT. One solid zigzag running top to bottom: a wide bar coming down from the top edge to the middle, jogging hard sideways by half the cell width, then continuing down to the bottom edge. The bar is a quarter of the cell wide along its whole length and the corners at the jog are sharp right angles, not curves. It touches the top and bottom edges. Squint test: a bolt.
Cell 4 — ONE HEAVY BAR. A single solid horizontal bar across the middle of the cell, running the FULL width edge to edge, a third of the cell tall, with flat square ends. There is nothing above it and nothing below it — the rest of the cell is empty. It is the simplest icon of the set and it must stay that way: a mouth stopped. Squint test: a bar.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL MUST BE SQUARE. With a 4x1 grid that means the whole sheet is
  4:1 — output it at 2048x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## B장 — 공격과 방어

**두 쌍입니다.** 1·2번이 같은 칼(부러진 것 / 온전한 것), 3·4번이 같은 사각(귀퉁이가 없는 것 / 꽉 찬 것). 짝끼리는 닮아야 하고 **한 가지로만** 갈려야 합니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 약화 | 격노 | 파쇄 | 견고 |
| id | `st_weak` | `st_rage` | `st_break` | `st_guard` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. 4 cells. Not more, not fewer, and not two rows — 4 cells in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 4 cells, in this exact order:

Cell 1 — A SNAPPED BLADE. A short stubby wedge standing upright in the lower half of the cell — wide and flat at the bottom, narrowing as it rises, but CUT OFF FLAT halfway up with a coarse jagged break of three big teeth across the top. It reaches only halfway up the cell and it has no point. It is the short broken twin of the rage icon and the difference in HEIGHT is the whole read. Squint test: a broken stump.
Cell 2 — A WHOLE BLADE. A tall narrow wedge standing upright and filling the FULL height of the cell — wide and flat at the bottom edge, tapering evenly all the way up to a single sharp point at the top edge. No crossguard, no hilt, no notch, nothing but the wedge. It is the tall whole twin of the weak icon and the difference in HEIGHT is the whole read. Squint test: a blade.
Cell 3 — A BROKEN BLOCK. A solid rectangle filling the whole cell, with ONE horizontal groove across the middle a tenth of the cell tall — and the entire TOP RIGHT QUARTER of the rectangle is missing, bitten away in a coarse stepped break of three big square steps. The bite is a quarter of the whole shape, so it is impossible to miss. It is the broken twin of the guard icon. Squint test: a block with a corner gone.
Cell 4 — A WHOLE BLOCK. A solid rectangle filling the whole cell edge to edge, with ONE horizontal groove across the middle a tenth of the cell tall, dividing it into two equal courses. Every corner is square and present. It is the whole twin of the break icon. Squint test: a solid block.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL MUST BE SQUARE. With a 4x1 grid that means the whole sheet is
  4:1 — output it at 2048x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## C장 — 속도와 회복

**두 쌍입니다.** 1·2번이 같은 십자(위 팔이 없는 것 / 있는 것), 3·4번이 같은 갈매기(아래 하나 / 위 둘).

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 시듦 | 재생 | 둔화 | 신속 |
| id | `st_wither` | `st_regen` | `st_slow` | `st_haste` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. 4 cells. Not more, not fewer, and not two rows — 4 cells in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 4 cells, in this exact order:

Cell 1 — A CROSS WITH NO TOP. A thick upright bar standing in the middle of the cell from the bottom edge up to two-thirds height, crossed near its top by a thick horizontal bar running the full width — a T shape, arms a third of the cell wide. There is NO arm above the crossbar. It is the regen cross with the top broken off, and that missing arm is the whole read. Squint test: a T.
Cell 2 — A THICK CROSS. A plus sign filling the whole cell — a vertical bar from the top edge to the bottom edge and a horizontal bar from the left edge to the right edge, both a third of the cell wide, crossing at the centre. All four arms are the same length and all four ends are cut flat. Squint test: a plus.
Cell 3 — ONE DOWNWARD CHEVRON. A single thick V shape pointing DOWN, filling the middle of the cell — two heavy arms meeting at a point at the bottom, each arm a quarter of the cell wide, the open ends reaching the upper left and upper right corners. One chevron only. Squint test: a down arrowhead.
Cell 4 — TWO UPWARD CHEVRONS. Two thick chevrons pointing UP, stacked one above the other with a gap between them — each two heavy arms meeting at a point at the top, each arm a fifth of the cell wide. The lower one is wider and reaches both side edges; the upper one is narrower and sits above it. TWO of them, and that count is what separates this from the slow icon as much as the direction does. Squint test: two up arrowheads.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL MUST BE SQUARE. With a 4x1 grid that means the whole sheet is
  4:1 — output it at 2048x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## D장 — 도발

**한 칸짜리입니다.** 이졸데의 도발이 생기면서 하나만 늘었습니다 — 앞의 열둘을 다시 뽑을 이유가 없으므로 이 한 장만 그려서 덧붙입니다. 이건 **적 머리 위에** 뜨는 유일한 로고이고, 열셋 중 유일하게 좌우가 다릅니다.

### 셀 순서

| 셀 | 1 |
|---|---|
| | 도발 |
| id | `st_taunt` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 1 ICON in ONE row, left to right. One cell. Not more, not fewer, and not two rows — 1 cell in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 1 cell, in this exact order:

Cell 1 — A HORN LYING SIDEWAYS. One solid TRAPEZOID spanning the full width of the cell — narrow at the LEFT edge (about a fifth of the cell tall) and widening evenly all the way to the RIGHT edge (about three quarters of the cell tall), both ends cut flat and vertical. It is a megaphone seen from the side, filled solid. It is the only icon in the whole set that is ASYMMETRIC LEFT TO RIGHT — thin on one side, thick on the other — and that wedge is the entire read. No mouth, no face, no sound lines, no rim. Squint test: a sideways wedge, thin left, thick right.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

IT MUST NOT LOOK LIKE THE OTHERS. This icon joins twelve that already exist; squint at it and make sure its outline is not close to any of them.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 1 column x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 1 cells.
- EVERY CELL MUST BE SQUARE. With a 1x1 grid that means the whole sheet is
  1:1 — output it at 512x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## E장 — 군체가 거는 것들 (21~30)

**21~30판에서 새로 생긴 넷입니다.** 앞의 열셋과도 윤곽이 안 겹쳐야 합니다 — 같은 화면에 같이 뜹니다. 넷은 각각 육각 고리 · 나선 · 불꽃 · 끊어진 세로 막대이고, 이 중 나선과 육각은 이 게임에 아직 없던 모양입니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 보호막 | 혼란 | 화상 | 신경 마비 |
| id | `st_shield` | `st_confuse` | `st_burn` | `st_numb` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. 4 cells. Not more, not fewer, and not two rows — 4 cells in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 4 cells, in this exact order:

Cell 1 — A HEXAGON. One solid six-sided shape filling the cell, flat on top and bottom, points at left and right, its walls a quarter of the cell thick and its centre EMPTY BLACK — a thick-walled ring with six straight sides. It is the only icon in the set with straight sides meeting at angles, and the only six-sided one. Squint test: a thick hexagonal ring.
Cell 2 — A SPIRAL. One thick continuous band winding from the centre of the cell outward through one and a half turns, ending with a flat cut edge at the upper right. The band and the black gap between its turns are the same width. It is the ONLY curved-and-winding shape in the set — everything else is bars, blocks or single arcs. Squint test: a spiral.
Cell 3 — A FLAME. A wide solid base sitting on the bottom edge of the cell, rising and narrowing into a single body that SPLITS near the top into THREE tongues of different heights, the middle one tallest and reaching the top edge, all leaning the same way. It is heavy at the bottom and torn at the top. It is the only icon that ends in several points at one end and a solid mass at the other. Squint test: a flame.
Cell 4 — A BROKEN UPRIGHT BAR. One solid vertical bar running the full height of the cell, a third of its width — CUT THROUGH at the middle by a horizontal gap as tall as the bar is wide, leaving two blocks, one above and one below, with flat square ends facing each other. It is the silence bar stood on end and snapped, and the two things it says are related: one stops the skill, the other stops the skill from charging. Squint test: a standing bar with a gap in it.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL MUST BE SQUARE. With a 4x1 grid that means the whole sheet is
  4:1 — output it at 2048x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## F장 — 감전

**한 칸짜리입니다.** 20판 벼락이 30% 확률로 3초간 겁니다 — 하는 일은 기절과 똑같고 (`core/status` 의 `STUN`), 그래서 **윤곽이 기절과 제일 멀어야** 합니다. 기절이 이미 번개라 감전을 번개로 그리면 같은 파티 칸에 뜬 둘을 아무도 못 가릅니다. 뒤집힌 U 자(플러그의 두 다리)로 갑니다.

그림이 들어오기 전까지는 신경 마비(`st_numb`)로 버팁니다 (`core/status` 의 `STATUS_ALT`).

### 셀 순서

| 셀 | 1 |
|---|---|
| | 감전 |
| id | `st_shock` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 1 ICON in ONE row, left to right. One cell. Not more, not fewer, and not two rows — 1 cell in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 1 cell, in this exact order:

Cell 1 — AN UPSIDE-DOWN U. One thick arch touching the TOP edge of the cell and curving down into TWO STRAIGHT LEGS that run all the way to the BOTTOM edge, the legs a quarter of the cell wide and the black gap between them a third of the cell wide. Flat square feet. It is a staple stood on its head, or the two prongs of a plug. It is the ONLY closed-at-one-end, open-at-the-other shape in the whole set — everything else is a bar, a wedge, a ring or a zigzag. It must NOT be a lightning bolt: the stun icon already is one, and these two appear on the same party slots. Squint test: an upside-down U with two legs.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

IT MUST NOT LOOK LIKE THE OTHERS. This icon joins twelve that already exist; squint at it and make sure its outline is not close to any of them.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 1 column x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 1 cells.
- EVERY CELL MUST BE SQUARE. With a 1x1 grid that means the whole sheet is
  1:1 — output it at 512x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## G장 — 스킬 트리가 거는 것들

**캐릭터 스킬 트리에서 생긴 넷입니다** (`core/skillTree`). 앞의 것들과 다른 점이 하나 있습니다 — 저것들은 대부분 **적이 아군에게** 거는 것이고 이 넷은 전부 **아군이 아군에게** 거는 것입니다. 그래서 넷 다 좋은 것이고, 파티 칸에 초록 테두리로 뜹니다.

리안느의 정령의 노래(집중) · 이졸데의 수호의 결의와 아녜스의 찬란한 빛(보호) · 비앙카의 불굴의 의지(흡혈) · 리안느의 요정의 축제(요정)가 겁니다.

그림이 들어오기 전까지는 제일 가까운 것으로 버팁니다 (`core/status` 의 `STATUS_ALT` — 집중은 격노, 보호는 견고, 흡혈은 재생, 요정은 신속).

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| | 집중 | 보호 | 흡혈 | 요정 |
| id | `st_focus` | `st_ward` | `st_leech` | `st_fey` |

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single sheet of EXACTLY 4 ICONS in ONE row, left to right. 4 cells. Not more, not fewer, and not two rows — 4 cells in one row, each a different icon. Do not repeat an icon anywhere on the sheet and do not add variants of one.

The 4 cells, in this exact order:

Cell 1 — A NARROWING TARGET. TWO concentric SQUARE frames, one inside the other, both hollow, each frame a sixth of the cell wide, with a clear black gap between them — and at the exact centre one small SOLID square, a fifth of the cell. Nothing touches anything. It is the only icon made of nested frames. Squint test: a square target with a dot in it.
Cell 2 — A DOME OVER A LINE. One thick ARC spanning the full width of the cell, bulging UPWARD, its ends coming down to the left and right edges at mid-height — and beneath it, one straight horizontal BAR running the full width along the bottom third, not touching the arc. Empty black between them. It is the only icon that is a curve resting over a straight line. Squint test: an arch over a floor.
Cell 3 — A DROP GOING UP. One solid TEARDROP shape — round and fat at the BOTTOM, tapering to a point at the TOP — filling most of the cell, and above its point TWO short straight rays angled up and outward, not touching it. It is upside down compared to any normal droplet, and that is the whole read: something is being drawn upward. Squint test: an upward teardrop.
Cell 4 — THREE TINY DARTS. THREE very small arrows, each a short thick shaft with a solid triangular head, arranged around the cell pointing in three DIFFERENT directions — one up-right, one down-right, one left — none touching, each about a third of the cell long. It is the only status icon whose parts point different ways. Squint test: three little darts scattering.

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

NO DITHERING. NO CHECKERBOARD. NO STIPPLING.
- Every edge is a HARD STEP between solid white and solid black. Do not soften, feather or anti-alias anything, and do not fake a grey by alternating black and white pixels along an edge.
- A checkerboard border turns into grey fuzz at 14 pixels and the shape loses its outline, which is the only thing that identifies it. An earlier attempt came back with dithered edges and half the icons were unreadable.
- Two colours exist in this image: pure white and pure black. Nothing in between, anywhere.

THEY ALL WEIGH THE SAME.
- Some of these are bad things and some are good, but NOTHING in the drawing may say which is which. No icon is darker, thinner, spikier or gloomier than another. The game says good or bad by where it puts them on screen; the icon only says WHAT.
- Every icon uses the same stroke weight and the same solid fill.

THEY MUST NOT BE CONFUSABLE. Put the 4 finished icons side by side and squint until they blur. If any two have a similar outline, redraw the weaker one — the outline is the only thing that survives at 14 pixels.

SHEET LAYOUT:
- Arrange the cells in an exact uniform grid: 4 columns x 1 row.
- Separate every cell with 4px-wide solid MAGENTA (#FF00FF) lines, including a magenta
  border around the outer edge of the whole sheet.
- Magenta appears ONLY on these separator lines, never inside a cell.
- Every cell is exactly the same size. Reading order is left to right, then top to
  bottom.
- Do not add extra rows of variants. Exactly 1 row, exactly 4 cells.
- EVERY CELL MUST BE SQUARE. With a 4x1 grid that means the whole sheet is
  4:1 — output it at 2048x512.
  A square cell is required. A tall narrow cell cannot hold a weapon swung forward,
  and a short wide cell cannot hold one raised. Both have been tried and both
  clipped.
```

## 슬라이서 설정

세 장을 **한 세트로 이어 붙입니다** (`append`). 그래야
`assets/sprites/status_icon/` 하나에 열둘이 다 들어갑니다.

```json
{ "file": "status-1.jpg", "name": "status_icon", "expect": [4, 1],
  "labels": ["st_bleed", "st_poison", "st_stun", "st_silence"] },
{ "file": "status-2.jpg", "name": "status_icon", "expect": [4, 1], "append": true,
  "labels": ["st_weak", "st_rage", "st_break", "st_guard"] },
{ "file": "status-3.jpg", "name": "status_icon", "expect": [4, 1], "append": true,
  "labels": ["st_wither", "st_regen", "st_slow", "st_haste"] },
{ "file": "status-4.jpg", "name": "status_icon", "expect": [1, 1], "append": true,
  "labels": ["st_taunt"] },
{ "file": "status-5.jpg", "name": "status_icon", "expect": [4, 1], "append": true,
  "labels": ["st_shield", "st_confuse", "st_burn", "st_numb"] },
{ "file": "status-6.jpg", "name": "status_icon", "expect": [1, 1], "append": true,
  "labels": ["st_shock"] },
{ "file": "status-7.jpg", "name": "status_icon", "expect": [4, 1], "append": true,
  "labels": ["st_focus", "st_ward", "st_leech", "st_fey"] }
```

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
