# 배경

← [색인으로](FOE_ART_PROMPTS.md)

**이 파일은 자동 생성됩니다** — `python tools/gen-foe.py`.

무대 뒤에 깔리는 그림입니다 (`src/screens/home/BattleView.tsx`).
**20% 로 흐려서** 깔리므로, 큰 덩어리만으로 읽혀야 합니다 — 가는 선은 두 번
사라집니다. 한 번은 축소로, 한 번은 흐려서.

## 땅을 그리면 안 됩니다

이 게임은 2D 횡스크롤이 아니라 **약간의 쿼터뷰**입니다. 바닥은 코드가 그립니다 —
뒤로 갈수록 좁아지는 사다리꼴 평면(`Ground`)이고, 인물은 그 위에 섭니다.

그래서 배경이 맡는 것은 **지평선 너머**뿐입니다. 배경에도 땅을 그리면 바닥이
두 겹이 되고, 그림 속 땅은 정면인데 코드가 그린 바닥은 비스듬해서 두 평면이
서로 어긋난 채 겹칩니다. 화면에서는 "땅이 너무 크다" 로 보입니다.

**지평선을 그림 맨 아래 모서리에 둡니다.** 그 위로는 전부 멀리 있는 것이고,
아래로는 아무것도 없습니다.

## 가로로 긴 띠입니다 (1024x256)

화면에서 배경이 차지하는 자리는 바닥판 위의 **가로로 긴 띠**입니다 — 높이가
129px 뿐이고 폭은 기기에 따라 330~900px 이라, 대략 2.6:1 에서 7:1 사이입니다.
그래서 그림을 **띠에 늘려서 꽉 채웁니다.** 비율을 지키면 위가 잘려 구름이
사라지거나 양옆이 비는데, 화면 폭이 기기마다 달라서 어느 한쪽으로 맞춰 둘 수도
없습니다. 먼 풍경이 20% 로 흐려져 깔리므로 조금 늘어나는 건 안 보입니다.

**그래서 4:3 으로 그리면 세로로 눌립니다.** 처음부터 4:1 안에서 구도를 잡아야
하고, 위쪽 절반은 구름으로 채워야 합니다 — 비워 두면 화면에서도 비어 보입니다.


| 스테이지 | 지역 | 파일 |
|---|---|---|
| 1~5 | 슬라임초원 | `bg_chapter/01` |
| 11~15 | 덩굴 숲 | `bg_chapter/03` |
| 16~20 | 썩은 고목 숲 | `bg_chapter/04` |
| 6~10 | 슬라임 초원 깊숙한 곳 | `bg_chapter/02` |

두 장으로 열 판을 돌립니다. 판마다 그리면 그릴 것이 너무 많고, 한 장으로 열 판을
돌리면 어디까지 왔는지 알 수 없습니다.

---

## 01. 슬라임초원 — 1~5 스테이지

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single background image of 슬라임초원.

What you see looking ACROSS an open plain to its far edge, from a long way off. A dead flat horizon runs the WHOLE WIDTH of the strip along the very bottom edge.
UPPER HALF — sky. Three or four long flat cloud banks stacked at different heights, spread right across the width, each one a long shallow shape in coarse dither. This half must not be empty.
LOWER HALF — distance. Above the horizon line, small and far: four or five lone trees bent by wind, spaced far apart across the width, and two or three low patches of scrub between them. They stand no taller than a quarter of the strip.
No grass, no field, no path. The plain between you and the horizon is not in this image — the game draws it.

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

BACKGROUND RULES — this is scenery, not a subject.

DRAW NO GROUND. THIS IS THE WHOLE POINT.

The game is NOT a 2D side-scroller. It draws its own floor as a receding
quarter-view plane, and the fighters stand ON that plane. Your image supplies ONLY
WHAT LIES BEYOND IT — the far side of the horizon and the sky above it.

So: put the HORIZON LINE ON THE VERY BOTTOM EDGE of the image — the last few rows
of pixels, not higher. Everything you draw sits ABOVE that line and is FAR AWAY.
Do not leave empty space below it; the game's floor starts exactly where your image
ends, and any gap you leave shows up as a black band between the sky and the ground.

FILL THE WHOLE FRAME, TOP TO BOTTOM. The game stretches this image to a short wide
band and shows ALL of it — nothing is cropped, so nothing may be wasted either. If
the top third is empty black, the player sees an empty third. Put CLOUDS across the
upper half so that band is doing something.

- NO ground plane, NO field in front, NO path, NO foreground grass, NO rocks or
  rubble at the bottom, NO shadow cast toward the viewer. If a shape in your image
  reads as "the ground the characters are standing on", the image is wrong.
- The bottom edge is where the far land meets the sky. Keep the lowest tenth to a
  quiet band — the bases of distant things. Nothing tall starts down there.
- The UPPER HALF is sky and it must not be empty. Two to four long flat cloud banks,
  spread across the full width, drawn in coarse dither. They are the only thing in
  the top half, so if they are missing the top half is missing.
- EVERYTHING IS DISTANT. Think of it as seen across two kilometres of open country.
  Distant things are small, low in the frame, and drawn in fine dither; there is no
  near layer at all.
- NO CREATURES, NO PEOPLE, NO ITEMS. Only far land and sky.
- It is drawn BEHIND the fighters and the game fades it to 20% opacity. So it must
  read at a glance from big shapes alone; anything fine disappears twice over.
- Depth comes from DITHER DENSITY, not from line weight: the far land is fine
  dither, the sky is mostly empty black.
- Nothing may draw the eye. If a shape in the background is more interesting than a
  monster standing in front of it, it is wrong.

OUTPUT: a single image, a WIDE SHORT STRIP, 1024x256 (4:1). This shape is not a suggestion — the game shows a band four times as wide as it is tall, and it stretches your image to fit it exactly. A 4:3 or square image will be squashed to a quarter of its height and everything in it will look flattened. COMPOSE INSIDE A 4:1 STRIP: clouds across the top half, the horizon on the bottom edge, and the distant shapes spread along the full width rather than clustered in the middle. No grid, no separator lines, no magenta.
```

받으면 `assets/sprites/bg_chapter/01.png` 로 넣으세요. **슬라이서를 안
태웁니다** — 한 장짜리 그림이라 자를 것이 없습니다.


---

## 03. 덩굴 숲 — 11~15 스테이지

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single background image of 덩굴 숲.

The edge of a wood seen from OUTSIDE it, from a long way off, looking across at the tree line. The horizon runs the WHOLE WIDTH along the very bottom edge.
UPPER HALF — sky, but LESS of it than the plain had. Two cloud banks only, high and thin, and the top of the wood eats into the lower part of this half. The plain was open; this is closing in, and that is the whole difference between the two chapters.
LOWER HALF — a WALL OF WOOD along the bottom edge, spread across the full width: eight or ten trunks in silhouette at different thicknesses and spacings, close enough together that you cannot see between them. They stand about half the height of the strip — much taller than the lone trees of the plain.
STRUNG BETWEEN THEM, and this is what names the place: four or five long sagging VINE ROPES hanging from trunk to trunk at different heights, and two hanging straight down. Draw them as clean hanging curves, not as texture.
No ground, no path, no undergrowth in front. The floor between you and the tree line is not in this image — the game draws it.

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

BACKGROUND RULES — this is scenery, not a subject.

DRAW NO GROUND. THIS IS THE WHOLE POINT.

The game is NOT a 2D side-scroller. It draws its own floor as a receding
quarter-view plane, and the fighters stand ON that plane. Your image supplies ONLY
WHAT LIES BEYOND IT — the far side of the horizon and the sky above it.

So: put the HORIZON LINE ON THE VERY BOTTOM EDGE of the image — the last few rows
of pixels, not higher. Everything you draw sits ABOVE that line and is FAR AWAY.
Do not leave empty space below it; the game's floor starts exactly where your image
ends, and any gap you leave shows up as a black band between the sky and the ground.

FILL THE WHOLE FRAME, TOP TO BOTTOM. The game stretches this image to a short wide
band and shows ALL of it — nothing is cropped, so nothing may be wasted either. If
the top third is empty black, the player sees an empty third. Put CLOUDS across the
upper half so that band is doing something.

- NO ground plane, NO field in front, NO path, NO foreground grass, NO rocks or
  rubble at the bottom, NO shadow cast toward the viewer. If a shape in your image
  reads as "the ground the characters are standing on", the image is wrong.
- The bottom edge is where the far land meets the sky. Keep the lowest tenth to a
  quiet band — the bases of distant things. Nothing tall starts down there.
- The UPPER HALF is sky and it must not be empty. Two to four long flat cloud banks,
  spread across the full width, drawn in coarse dither. They are the only thing in
  the top half, so if they are missing the top half is missing.
- EVERYTHING IS DISTANT. Think of it as seen across two kilometres of open country.
  Distant things are small, low in the frame, and drawn in fine dither; there is no
  near layer at all.
- NO CREATURES, NO PEOPLE, NO ITEMS. Only far land and sky.
- It is drawn BEHIND the fighters and the game fades it to 20% opacity. So it must
  read at a glance from big shapes alone; anything fine disappears twice over.
- Depth comes from DITHER DENSITY, not from line weight: the far land is fine
  dither, the sky is mostly empty black.
- Nothing may draw the eye. If a shape in the background is more interesting than a
  monster standing in front of it, it is wrong.

OUTPUT: a single image, a WIDE SHORT STRIP, 1024x256 (4:1). This shape is not a suggestion — the game shows a band four times as wide as it is tall, and it stretches your image to fit it exactly. A 4:3 or square image will be squashed to a quarter of its height and everything in it will look flattened. COMPOSE INSIDE A 4:1 STRIP: clouds across the top half, the horizon on the bottom edge, and the distant shapes spread along the full width rather than clustered in the middle. No grid, no separator lines, no magenta.
```

받으면 `assets/sprites/bg_chapter/03.png` 로 넣으세요. **슬라이서를 안
태웁니다** — 한 장짜리 그림이라 자를 것이 없습니다.


---

## 04. 썩은 고목 숲 — 16~20 스테이지

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single background image of 썩은 고목 숲.

Deep inside the same wood, where the trees are far older and mostly dead. Seen from a long way off, looking through.
UPPER HALF — almost no sky. A CANOPY presses down across the full width from the top edge, drawn as a heavy dark irregular mass with three or four ragged gaps where pale light comes through. Where the vine wood had two clouds, this has a lid. That closing-over is how the player knows the chapter turned.
LOWER HALF — six or seven ENORMOUS trunks in silhouette, far thicker and further apart than the vine wood, running from the bottom edge up into the canopy so they cross both halves. Two of them are BROKEN OFF partway up, snapped at an angle, and one has a large hole through it.
Between and behind them, small and far: three or four leaning dead stumps along the bottom edge.
No ground, no path, no leaf litter in front — the game draws the floor.

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

BACKGROUND RULES — this is scenery, not a subject.

DRAW NO GROUND. THIS IS THE WHOLE POINT.

The game is NOT a 2D side-scroller. It draws its own floor as a receding
quarter-view plane, and the fighters stand ON that plane. Your image supplies ONLY
WHAT LIES BEYOND IT — the far side of the horizon and the sky above it.

So: put the HORIZON LINE ON THE VERY BOTTOM EDGE of the image — the last few rows
of pixels, not higher. Everything you draw sits ABOVE that line and is FAR AWAY.
Do not leave empty space below it; the game's floor starts exactly where your image
ends, and any gap you leave shows up as a black band between the sky and the ground.

FILL THE WHOLE FRAME, TOP TO BOTTOM. The game stretches this image to a short wide
band and shows ALL of it — nothing is cropped, so nothing may be wasted either. If
the top third is empty black, the player sees an empty third. Put CLOUDS across the
upper half so that band is doing something.

- NO ground plane, NO field in front, NO path, NO foreground grass, NO rocks or
  rubble at the bottom, NO shadow cast toward the viewer. If a shape in your image
  reads as "the ground the characters are standing on", the image is wrong.
- The bottom edge is where the far land meets the sky. Keep the lowest tenth to a
  quiet band — the bases of distant things. Nothing tall starts down there.
- The UPPER HALF is sky and it must not be empty. Two to four long flat cloud banks,
  spread across the full width, drawn in coarse dither. They are the only thing in
  the top half, so if they are missing the top half is missing.
- EVERYTHING IS DISTANT. Think of it as seen across two kilometres of open country.
  Distant things are small, low in the frame, and drawn in fine dither; there is no
  near layer at all.
- NO CREATURES, NO PEOPLE, NO ITEMS. Only far land and sky.
- It is drawn BEHIND the fighters and the game fades it to 20% opacity. So it must
  read at a glance from big shapes alone; anything fine disappears twice over.
- Depth comes from DITHER DENSITY, not from line weight: the far land is fine
  dither, the sky is mostly empty black.
- Nothing may draw the eye. If a shape in the background is more interesting than a
  monster standing in front of it, it is wrong.

OUTPUT: a single image, a WIDE SHORT STRIP, 1024x256 (4:1). This shape is not a suggestion — the game shows a band four times as wide as it is tall, and it stretches your image to fit it exactly. A 4:3 or square image will be squashed to a quarter of its height and everything in it will look flattened. COMPOSE INSIDE A 4:1 STRIP: clouds across the top half, the horizon on the bottom edge, and the distant shapes spread along the full width rather than clustered in the middle. No grid, no separator lines, no magenta.
```

받으면 `assets/sprites/bg_chapter/04.png` 로 넣으세요. **슬라이서를 안
태웁니다** — 한 장짜리 그림이라 자를 것이 없습니다.


---

## 02. 슬라임 초원 깊숙한 곳 — 6~10 스테이지

```
ABSOLUTE RULE — NO TEXT OF ANY KIND:
- Do NOT write, print, label, caption, title, name, or number ANYTHING.
- There is NO caption area, NO name plate, NO banner, NO scroll of text, NO signature.
- Every cell is artwork EDGE TO EDGE. Nothing is written above, below, or beside the art.
- This includes English, Korean, numerals, roman numerals, runes, and fake alien script.
- A cell containing even one letter-like mark is a failed output.

SUBJECT: a single background image of 슬라임 초원 깊숙한 곳.

The same plain, further in, where a settlement has been swallowed. What you see looking ACROSS to it from a long way off.
UPPER HALF — a heavier sky. Four or five cloud banks, lower and denser than the open plain, pressing down across the full width. Darker overall.
LOWER HALF — the horizon is BROKEN by ruins instead of clean, and that is what separates this one from the first. Along the bottom edge, in silhouette and spread across the whole width: two leaning doorframes, a run of broken low wall, a collapsed roof beam, and a crooked fence line. They stand no taller than a third of the strip.
Draw no ground between you and the ruins, and no rubble in front of them. The ruins sit ON the bottom edge and that is where the image ends.

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

BACKGROUND RULES — this is scenery, not a subject.

DRAW NO GROUND. THIS IS THE WHOLE POINT.

The game is NOT a 2D side-scroller. It draws its own floor as a receding
quarter-view plane, and the fighters stand ON that plane. Your image supplies ONLY
WHAT LIES BEYOND IT — the far side of the horizon and the sky above it.

So: put the HORIZON LINE ON THE VERY BOTTOM EDGE of the image — the last few rows
of pixels, not higher. Everything you draw sits ABOVE that line and is FAR AWAY.
Do not leave empty space below it; the game's floor starts exactly where your image
ends, and any gap you leave shows up as a black band between the sky and the ground.

FILL THE WHOLE FRAME, TOP TO BOTTOM. The game stretches this image to a short wide
band and shows ALL of it — nothing is cropped, so nothing may be wasted either. If
the top third is empty black, the player sees an empty third. Put CLOUDS across the
upper half so that band is doing something.

- NO ground plane, NO field in front, NO path, NO foreground grass, NO rocks or
  rubble at the bottom, NO shadow cast toward the viewer. If a shape in your image
  reads as "the ground the characters are standing on", the image is wrong.
- The bottom edge is where the far land meets the sky. Keep the lowest tenth to a
  quiet band — the bases of distant things. Nothing tall starts down there.
- The UPPER HALF is sky and it must not be empty. Two to four long flat cloud banks,
  spread across the full width, drawn in coarse dither. They are the only thing in
  the top half, so if they are missing the top half is missing.
- EVERYTHING IS DISTANT. Think of it as seen across two kilometres of open country.
  Distant things are small, low in the frame, and drawn in fine dither; there is no
  near layer at all.
- NO CREATURES, NO PEOPLE, NO ITEMS. Only far land and sky.
- It is drawn BEHIND the fighters and the game fades it to 20% opacity. So it must
  read at a glance from big shapes alone; anything fine disappears twice over.
- Depth comes from DITHER DENSITY, not from line weight: the far land is fine
  dither, the sky is mostly empty black.
- Nothing may draw the eye. If a shape in the background is more interesting than a
  monster standing in front of it, it is wrong.

OUTPUT: a single image, a WIDE SHORT STRIP, 1024x256 (4:1). This shape is not a suggestion — the game shows a band four times as wide as it is tall, and it stretches your image to fit it exactly. A 4:3 or square image will be squashed to a quarter of its height and everything in it will look flattened. COMPOSE INSIDE A 4:1 STRIP: clouds across the top half, the horizon on the bottom edge, and the distant shapes spread along the full width rather than clustered in the middle. No grid, no separator lines, no magenta.
```

받으면 `assets/sprites/bg_chapter/02.png` 로 넣으세요. **슬라이서를 안
태웁니다** — 한 장짜리 그림이라 자를 것이 없습니다.
