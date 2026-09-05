# 아군 스킬 이펙트

**손으로 쓰는 문서입니다** (자동 생성이 아닙니다).

아군 기술 중 **캐릭터 시트에 못 그리는 것**을 여기에 모읍니다. 보스 쪽과
같은 갈림길입니다 ([`BOSS_FX_PROMPTS.md`](BOSS_FX_PROMPTS.md)) — 자리가 다르고
수명이 다른 것은 인물 시트에 못 넣습니다.

지금 한 장입니다.

| 이펙트 | 무엇 | 칸 | 쓰는 기술 |
|---|---|---|---|
| `sfx_holysword` | 하늘에서 내리꽂히는 빛의 대검 | 5칸 | 이졸데 `성검 발현` (4-2) |

---

## 내리꽂히는 성검 — `sfx_holysword`

| | |
|---|---|
| 스프라이트 폴더 | `assets/sprites/sfx_holysword/` |
| 종류 | 터지는 것 (5칸) |
| 쓰는 기술 | 이졸데 `성검 발현` — 한 명에게 300%, 코스트 12 |

### 왜 필요한가

이 게임에서 **한 대로 제일 센 아군 기술**입니다. 검 갈래의 끝이라 "크게 한
방" 이 아니면 방패 갈래를 고를 이유가 없어집니다.

그런데 지금 화면에 나오는 것은 발밑 마법진(`fx_rune`)과 맞은 자리의 타격
불꽃(`fx/burst`) 둘뿐입니다. 그 둘은 코스트 10짜리 `신의 심판` 도 쓰는
것이라, **12를 모아 쓴 것과 10을 모아 쓴 것이 화면에서 같습니다.**

`SkillDef.desc` 에는 이미 이렇게 적혀 있습니다 — *"적 하나에게 빛과 함께 큰
검이 떨어진다"*. 떨어지는 검이 화면에 없습니다.

### 어떻게 움직이나 (게임이 하는 일)

**칸이 경로가 아니라 수명입니다.** 검이 위에서 아래로 내려오는 것은 게임이
`translateY` 로 합니다 — 시트는 **한자리에서 피었다 지는 다섯 순간**입니다.

맞는 적의 **머리 위**에서 시작해 발밑까지 내려오고, 3번 칸에서 박히고,
4~5번 칸에서 빛이 퍼지며 스러집니다.

### 셀 순서

| 셀 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| | 검이 나타난다 | 내리꽂힌다 | 박혔다 (제일 크다) | 빛이 퍼진다 | 스러진다 |
| id | `1` | `2` | `3` | `4` | `5` |

**3번 칸이 실제로 보이는 그림입니다.** 다섯 칸 시트는 전부 그 규칙입니다
(`bfx_spore` · `bfx_bolt` 와 같습니다).

### 세로로 긴 그림입니다

다른 다섯 칸 시트는 정사각에 가깝지만 이것만 **세로가 가로의 두 배**여야
합니다. 하늘에서 내려오는 것이라 세로로 길어야 "떨어졌다" 가 나옵니다.
칸 안에서 검은 **위아래를 가득** 채우고, 좌우는 넉넉히 비웁니다.

### 프롬프트

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a 5-frame effect sheet in one row, left to right. It is ONE effect shown at 5
moments in time, not 5 different pictures. Each cell is TALL — twice as high as it is wide.

THE EFFECT: a colossal two-handed sword of light plunging down from above, point first,
and driving into the ground. Think of a holy execution blade called down from the sky.

The blade is enormous and straight, with a broad flat fuller running down its center, a
plain straight crossguard, and a simple wrapped grip with a round pommel. It is a WEAPON,
not a beam — it has hard silhouette edges, and you could name every part of it.

The 5 cells, in this exact order:

Cell 1 — APPEARING. The sword hangs high in the cell, point down, occupying only the TOP
THIRD. It is drawn in OUTLINE ONLY — thin white contour lines, hollow inside, as if not
fully arrived. Three or four short straight rays angle down and outward from the pommel.
Nothing at the bottom of the cell yet.

Cell 2 — FALLING. The same sword, now SOLID (white outline with dithered fill), dropping
to fill the MIDDLE of the cell, point down, perfectly vertical. Two long straight streak
lines trail vertically upward from the crossguard to the top edge of the cell — the path
it fell through. The point has not touched anything.

Cell 3 — STRUCK. THE LARGEST CELL CONTENT. The sword is buried point-first: roughly the
lower quarter of the blade is hidden, so what is drawn is the upper blade, crossguard,
grip and pommel, running from the top of the cell down to about three quarters of the
way down. At the buried point, a WIDE FLAT BURST of light spreads left and right — a
low horizontal spray of straight tapered spikes, widest here, wider than the crossguard.
Four or five straight rays also shoot upward alongside the blade.

Cell 4 — SPREADING. The sword is FADING — drawn again in OUTLINE ONLY, thinner than
cell 1, and slightly shorter. The horizontal burst at its base has spread WIDER but
broken into separated shards of clearly different lengths, no two the same, drifting
outward and slightly upward.

Cell 5 — GONE. No sword. Only a sparse scatter of small angular fragments and three or
four short straight rays, spread across the lower half of the cell, no two alike, thin
and few. Nothing solid is left.

COMPOSITION RULES:
- Perfectly vertical. The blade never tilts in any cell.
- The sword is CENTERED horizontally in every cell. It must not drift sideways.
- Leave generous empty black space at the left and right of every cell.
- The burst in cells 3 and 4 is WIDE AND FLAT — it spreads sideways, never into a circle
  or a ring. No circles, no rings, no ellipses anywhere in this sheet.

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
line under the blade.

THE IMPACT IS SOLD BY THE BURST, NOT BY DRAWN GROUND. Where the description says the
sword is "buried point-first" or "driving into the ground", it means: draw the blade
ending at that height with the wide flat burst spreading from it, standing on nothing.
The point simply stops, with pure black beneath it.
```

### 들어오면 붙이는 자리

1. 시트를 `assets/<날짜>/` 에 넣고 `tools/sprites.config.json` 에 다섯 칸
   (`1`~`5`)으로 적습니다.
2. `python tools/slice.py holysword` — `assets/sprites/sfx_holysword/` 와
   `src/ui/spriteAssets.ts` 가 같이 생깁니다.
3. `SkillFx` 에 갈래를 하나 늘리고 (`sfx_erupt` 를 쓰는 `Erupt` 와 같은
   얼개입니다), `core/chars` 의 `holysword` 에 `cast: 'holy'` 를 답니다.

**맞는 적 위에서 그립니다.** 지금 `Erupt` 는 쓰는 사람 발밑에서 나는데
(`SkillDef.cast` 가 인물에 붙어 있어서), 이것은 반대로 맞는 쪽 위에서 나야
합니다 — 붙이는 자리는 `BattleView` 의 `hits` 쪽입니다 (`FallingArrow` 가
이미 그 자리에서 위에서 떨어지는 것을 그립니다).
