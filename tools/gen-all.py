# -*- coding: utf-8 -*-
"""
프롬프트 한 장으로 — `python tools/gen-all.py`.

`docs/ALL_PROMPTS.md` 를 만든다. **위에서부터 복붙만 하면 되는 파일**이다.

## 왜 필요한가

프롬프트 문서가 열 개가 넘는다. 뽑는 사람이 "그래서 지금 뭘 뽑아야 하지" 를
알려면 목차(`ART_REQUESTS.md`)를 보고, 거기서 문서를 찾아 열고, 그 안에서
해당 절을 찾아야 한다 — 열다섯 장을 뽑으려면 그 짓을 열다섯 번 한다.

여기는 **아직 안 들어온 것만** 순서대로 늘어놓는다. 각 덩어리에 붙는 것은
셋뿐이다: 무엇인지 · 어디로 자를지 · 프롬프트.

## 원본은 그대로 둔다

프롬프트 본문을 여기 적지 않는다. 원래 문서에서 **긁어 온다** — 두 곳에 같은
글이 있으면 반드시 갈라지고, 갈라진 쪽을 아무도 안 고친다.

원본이 자동 생성이든(`gen-icon` · `gen-status` · `gen-boss`) 손으로 쓴
것이든(`UI_SHELL` · `GROWTH`) 상관없다. 여기서는 헤딩과 코드블록만 본다.

## 들어온 것은 빠진다

`assets/sprites/<폴더>/` 에 파일이 있으면 그 덩어리를 안 싣는다. 그래서
그림이 들어올 때마다 이 파일이 저절로 짧아지고, 비면 "다 받았습니다" 만
남는다.
"""
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'ALL_PROMPTS.md')


# ══ 무엇을 어디서 긁어 오나 ═══════════════════════════════════
#
# (폴더, 칸 수, 제목, 문서, 헤딩 정규식, 자를 때 쓸 이름표)
#
# **폴더가 곧 검사다** — `assets/sprites/<폴더>` 에 png 가 있으면 들어온
# 것으로 보고 뺀다. 폴더 이름이 슬라이서 설정의 `name` 과 같으므로
# (`tools/sprites.config.json`) 따로 적을 것이 없다.

ITEMS = [
    ('nav_top', 6, 'UI 문 아이콘 · 위 띠 여섯',
     'UI_SHELL_PROMPTS.md', r'^## A장',
     ['rank', 'event', 'mail', 'gift', 'mission', 'config']),
    ('nav_bot', 5, 'UI 문 아이콘 · 아래 띠 다섯',
     'UI_SHELL_PROMPTS.md', r'^## B장',
     ['hero', 'item', 'main', 'guild', 'content']),
    ('coin_ui', 2, '보물 상자와 다이아',
     'UI_SHELL_PROMPTS.md', r'^## C장',
     ['chest', 'gem']),

    ('growth', 3, '별 셋 — 빈 별 · 찬 별 · 각성한 별',
     'GROWTH_ART_PROMPTS.md', r'^## §G1',
     ['star_off', 'star_on', 'star_awake']),
    ('rarity', 5, '등급 표식 다섯 — 일반부터 신화까지',
     'GROWTH_ART_PROMPTS.md', r'^## §G2',
     ['common', 'rare', 'epic', 'legendary', 'mythic']),
    ('growth2', 2, '조각과 강성의 영약',
     'GROWTH_ART_PROMPTS.md', r'^## §G3',
     ['shard', 'elixir']),

    ('bfx_cocoon', 5, '거미줄 고치 — 25판 포식의 거미줄',
     'BOSS_FX_PROMPTS.md', r'^## 몸을 감는 거미줄 고치',
     ['1', '2', '3', '4', '5']),
    ('b30_baal', 5, '30판 우두머리 바알 — 다시 뽑습니다 (시트가 이미 있지만 프롬프트를 고쳤습니다)',
     os.path.join('boss-art', 'b30_baal.md'), r'^## 시트 한 장',
     ['idle', 'attack', 'skill1', 'skill2', 'down']),

    ('skill_icon_kg', 5, '스킬 로고 · 이졸데 트리 다섯',
     'ICON_PROMPTS.md', r'^## 이졸데 의 트리',
     ['sk_shout', 'sk_ward', 'sk_breaker', 'sk_aegis', 'sk_holysword']),
    ('skill_icon_ba', 3, '스킬 로고 · 비앙카 트리 셋',
     'ICON_PROMPTS.md', r'^## 비앙카 의 트리',
     ['sk_lava', 'sk_resolve', 'sk_overheat']),
    ('skill_icon_ea', 4, '스킬 로고 · 리안느 트리 넷',
     'ICON_PROMPTS.md', r'^## 리안느 의 트리',
     ['sk_sharparrow', 'sk_spiritsong', 'sk_bigshot', 'sk_fey']),
    ('skill_icon_nu', 4, '스킬 로고 · 아녜스 트리 넷',
     'ICON_PROMPTS.md', r'^## 아녜스 의 트리',
     ['sk_judge', 'sk_gentle', 'sk_wrath', 'sk_radiance']),

    ('status_icon_g', 4, '상태 로고 넷 — 집중 · 보호 · 흡혈 · 요정',
     'STATUS_ICON_PROMPTS.md', r'^## G장',
     ['st_focus', 'st_ward', 'st_leech', 'st_fey']),

    ('knightgirl3', 3, '이졸데 세 번째 동작 — 성검 발현',
     'MOTION_ART_PROMPTS.md', r'^## §P3-KN',
     ['sk3_1', 'sk3_2', 'sk3_3']),
    ('bunnyaxe3', 3, '비앙카 세 번째 동작 — 불굴의 의지',
     'MOTION_ART_PROMPTS.md', r'^## §P3-BU',
     ['sk3_1', 'sk3_2', 'sk3_3']),
    ('elfarcher3', 3, '리안느 세 번째 동작 — 거대 화살',
     'MOTION_ART_PROMPTS.md', r'^## §P3-EL',
     ['sk3_1', 'sk3_2', 'sk3_3']),
    ('elfarcher_dragon', 3, '용 모양 거대 화살',
     'MOTION_ART_PROMPTS.md', r'^## §P4',
     ['shot_1', 'shot_2', 'shot_3']),
]

# 폴더 이름이 실제와 다른 것들 — 검사할 때만 쓴다
#
# 스킬 로고 넷과 상태 로고는 **한 폴더에 섞여 들어가므로** 폴더로는 못
# 가른다. 그래서 그 안의 파일 이름으로 본다 (`labels` 의 첫 칸).
REAL = {
    'growth2': 'growth',
    'skill_icon_kg': 'skill_icon', 'skill_icon_ba': 'skill_icon',
    'skill_icon_ea': 'skill_icon', 'skill_icon_nu': 'skill_icon',
    'status_icon_g': 'status_icon',
    'knightgirl3': 'knightgirl', 'bunnyaxe3': 'bunnyaxe', 'elfarcher3': 'elfarcher',
}


# **그림이 있어도 다시 받아야 하는 것들.**
#
# 30판 바알은 시트가 이미 있는데 프롬프트를 고쳐서 다시 뽑는 중이다 —
# "있으면 끝" 규칙을 그대로 쓰면 정작 다시 받아야 할 것이 목록에서 빠진다.
REDO = {'b30_baal'}


def done(key, labels):
    """이 덩어리는 이미 들어왔나 — 첫 칸이 있으면 들어온 것으로 본다."""
    if key in REDO:
        return False
    folder = REAL.get(key, key)
    return os.path.exists(
        os.path.join(ROOT, 'assets', 'sprites', folder, labels[0] + '.png'),
    )


def blocks_under(doc, head):
    """그 헤딩 아래, 다음 `## ` 전까지의 코드블록 전부."""
    path = os.path.join(ROOT, 'docs', doc)
    text = io.open(path, encoding='utf-8').read()
    lines = text.split('\n')
    at = next((i for i, l in enumerate(lines) if re.match(head, l)), None)
    if at is None:
        raise SystemExit('못 찾음: %s 의 %s' % (doc, head))
    end = next(
        (i for i in range(at + 1, len(lines)) if lines[i].startswith('## ')),
        len(lines),
    )
    out, buf, on = [], [], False
    for l in lines[at + 1:end]:
        if l.startswith('```'):
            if on:
                out.append('\n'.join(buf))
                buf = []
            on = not on
            continue
        if on:
            buf.append(l)
    # 프롬프트 말고 **자르기 설정**도 코드블록으로 들어 있다. 여기서는 자르기를
    # 아래에서 따로 적으므로 (`one`), 그 블록까지 실으면 같은 JSON 이 두 번
    # 나온다 — 복붙하는 사람이 어느 쪽을 쓸지 고민하게 된다.
    #
    # 첫 글자가 `{` 나 `[` 면 설정으로 본다. 프롬프트는 늘 영어 문장이다.
    return [b for b in out if not b.lstrip().startswith(('{', '['))]


HEAD = """# 프롬프트 전부 — 위에서부터 복붙

**이 파일은 자동 생성됩니다** — `python tools/gen-all.py`.
원본을 고치려면 각 덩어리에 적힌 문서를 고치세요. 여기 것은 긁어 온 사본입니다.

아직 **안 들어온 것만** 있습니다. `assets/sprites/` 에 파일이 생기면 그
덩어리는 다음 실행에서 저절로 빠집니다.

## 쓰는 법

1. 아래 코드블록을 **통째로** 복사해서 Gemini 에 넣습니다. 스타일 지시와 시트
   규칙이 블록 안에 다 들어 있으니 앞뒤에 뭘 붙이지 마세요.
2. 받은 이미지를 `assets/new-image/` 에 넣습니다.
3. 그 덩어리의 **자르기** JSON 을 `tools/sprites.config.json` 에 한 줄
   더하고 `python tools/slice.py` 를 돌립니다.
4. 끝입니다. **코드는 안 고칩니다** — 화면이 폴더를 먼저 보고, 없을 때만
   지금의 임시 그림으로 떨어지게 해 뒀습니다.

## 지금 남은 것

%(index)s

---
"""


def one(n, key, cells, title, doc, head, labels):
    body = blocks_under(doc, head)
    if not body:
        raise SystemExit('코드블록 없음: %s 의 %s' % (doc, head))
    folder = REAL.get(key, key)
    parts = [
        '## %d. %s' % (n, title),
        '',
        '| | |',
        '|---|---|',
        '| 칸 | %d |' % cells,
        '| 폴더 | `assets/sprites/%s/` |' % folder,
        '| 원본 | `docs/%s`  |' % doc.replace('\\', '/'),
        '',
        '### 프롬프트',
        '',
    ]
    for b in body:
        parts += ['```', b, '```', '']
    parts += [
        '### 자르기',
        '',
        '```json',
        '{ "file": "<받은 파일명>", "name": "%s", "expect": [%d, 1],' % (folder, cells),
        '  "labels": [%s] }' % ', '.join('"%s"' % l for l in labels),
        '```',
        '',
    ]
    return '\n'.join(parts)


if __name__ == '__main__':
    todo = [i for i in ITEMS if not done(i[0], i[5])]
    if not todo:
        io.open(OUT, 'w', encoding='utf-8').write(
            '# 프롬프트 전부\n\n**다 받았습니다.** 지금 필요한 그림이 없습니다.\n',
        )
        print('%s — 남은 것 없음' % OUT)
        raise SystemExit(0)

    index = '\n'.join(
        '%d. **%s** — %d칸 → `%s`' % (n, t, c, REAL.get(k, k))
        for n, (k, c, t, _d, _h, _l) in enumerate(todo, 1)
    )
    page = HEAD % {'index': index}
    page += '\n---\n\n'.join(
        one(n, *it) for n, it in enumerate(todo, 1)
    )
    io.open(OUT, 'w', encoding='utf-8').write(page)
    print('%s — %d 덩어리 (전체 %d 중)' % (OUT, len(todo), len(ITEMS)))
