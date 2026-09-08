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
# **칸 수는 숫자 하나이거나 (가로, 세로) 다.** 한 줄짜리가 대부분이라 숫자
# 하나로 두었는데, 선물 열여덟처럼 두 줄로 뽑는 시트가 생겼다.
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
    # 한 칸짜리다. 20판 벼락이 거는 감전 — 아직 신경 마비를 빌려 쓴다
    # (`core/status` 의 `STATUS_ALT`).
    ('status_icon_f', 1, '상태 로고 · 감전 한 칸',
     'STATUS_ICON_PROMPTS.md', r'^## F장',
     ['st_shock']),

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

    ('gift_icon', 7, '선물 로고 · 얽힌 것 일곱 (좋아하거나 싫어하는 사람이 있다)',
     'BOND_ART_PROMPTS.md', r'^## §B1',
     ['gf_cookie', 'gf_pie', 'gf_carrot', 'gf_rabbit',
      'gf_flower', 'gf_bible', 'gf_gong']),
    # 6×2 격자에 열하나 — 마지막 칸은 비워 두고 `_skip` 으로 받는다
    ('gift_icon2', (6, 2), '선물 로고 · 아무나 줘도 되는 것 열하나',
     'BOND_ART_PROMPTS.md', r'^## §B2',
     ['gf_tea', 'gf_ice', 'gf_bread', 'gf_apple', 'gf_honey', 'gf_cheese',
      'gf_soup', 'gf_candy', 'gf_ribbon', 'gf_candle', 'gf_music', '_skip']),
    ('item_icon', 3, '경험의 서 셋 — 같은 책이 세 단계로 자란다',
     'BOND_ART_PROMPTS.md', r'^## §B3',
     ['book_old', 'book_fine', 'book_prime']),
    # 세로 한 장짜리 배경. 자르기는 `grid: [1, 1]` 이고 `size` 를 따로 준다 —
    # 아래 자동 JSON 대신 문서에 적힌 것을 쓰는 편이 낫다 (§B6 에 있다).
    ('bg_talk', 1, '인연 대화 배경 한 장 — 세로 9:16',
     'BOND_ART_PROMPTS.md', r'^## §B6',
     ['night']),
]

# ══ 자르지 않는 것들 ═══════════════════════════════════════
#
# 시트가 아니라 **낱장 그림**이다. 슬라이서를 안 타므로 `ITEMS` 와 같은 틀로
# 못 싣는다 — 자르기 JSON 자리에 넣을 것이 없고, 들어왔는지도 스프라이트
# 폴더가 아니라 딴 데서 봐야 한다.
#
# (검사할 파일 경로, 제목, 문서, 헤딩 정규식, 어디에 넣나)
#
# 월페이퍼는 **사람마다 넉 장**이라 사람 단위로 센다. 넷 다 한 덩어리로 두면
# 이졸데 넉 장이 들어온 순간 나머지 열두 장까지 목록에서 사라진다 — 실제로
# 그랬다.
#
# 검사는 그 사람의 `_love` 한 장으로 한다. 넷 중 마지막에 그리는 것이라,
# 그것이 있으면 나머지 셋도 있다고 봐도 된다.
WALL_WHERE = ('assets/wallpaper/<사람>_<단계>.jpg — 자르지 않습니다. '
              '넣은 뒤 `src/ui/wallpapers.ts` 에 줄을 더하세요.')

LOOSE = [
    (os.path.join('assets', 'wallpaper', '%s_love.jpg' % who),
     '이야기 월페이퍼 · %s 넉 장 (한 장씩 따로 뽑습니다)' % name,
     'BOND_ART_PROMPTS.md', r'^### %s ' % name,
     WALL_WHERE)
    for who, name in (
        ('knightgirl', '이졸데'),
        ('bunnyaxe', '비앙카'),
        ('elfarcher', '리안느'),
        ('nun', '아녜스'),
    )
]

# 폴더 이름이 실제와 다른 것들 — 검사할 때만 쓴다
#
# 스킬 로고 넷과 상태 로고는 **한 폴더에 섞여 들어가므로** 폴더로는 못
# 가른다. 그래서 그 안의 파일 이름으로 본다 (`labels` 의 첫 칸).
REAL = {
    'growth2': 'growth',
    'gift_icon2': 'gift_icon',
    'skill_icon_kg': 'skill_icon', 'skill_icon_ba': 'skill_icon',
    'skill_icon_ea': 'skill_icon', 'skill_icon_nu': 'skill_icon',
    'status_icon_g': 'status_icon', 'status_icon_f': 'status_icon',
    'knightgirl3': 'knightgirl', 'bunnyaxe3': 'bunnyaxe', 'elfarcher3': 'elfarcher',
}


# **그림이 있어도 다시 받아야 하는 것들.**
#
# 프롬프트를 고쳐서 다시 뽑는 중인 시트를 여기 넣는다 — "있으면 끝" 규칙을
# 그대로 쓰면 정작 다시 받아야 할 것이 목록에서 빠진다.
#
# 지금은 비어 있다. 30판 바알이 여기 있었고, 정면을 보던 것을 고쳐 받았다.
REDO: set[str] = set()


def done(key, labels):
    """이 덩어리는 이미 들어왔나 — 첫 칸이 있으면 들어온 것으로 본다."""
    if key in REDO:
        return False
    folder = REAL.get(key, key)
    return os.path.exists(
        os.path.join(ROOT, 'assets', 'sprites', folder, labels[0] + '.png'),
    )


def section_end(lines, at):
    """
    그 절이 어디서 끝나나 — **같거나 더 큰 헤딩**이 나오는 줄.

    `## ` 하나로만 끊었었다. 그러면 `### 이졸데` 를 집었을 때 그 아래 비앙카와
    리안느까지 통째로 딸려 온다 — 사람마다 따로 싣게 되면서 걸렸다.

    헤딩의 `#` 개수를 세서 그보다 얕거나 같은 것에서 멎는다.
    """
    depth = len(lines[at]) - len(lines[at].lstrip('#'))
    for i in range(at + 1, len(lines)):
        l = lines[i]
        if not l.startswith('#'):
            continue
        d = len(l) - len(l.lstrip('#'))
        if d <= depth and l[d:d + 1] == ' ':
            return i
    return len(lines)


def blocks_under(doc, head):
    """
    그 헤딩 아래, 다음 `## ` 전까지의 코드블록 전부.

    **바로 위의 굵은 한 줄을 이름표로 같이 가져온다.** 한 절에 블록이 열여섯
    개씩 들어가는 자리가 생겼는데 (월페이퍼), 그냥 이어 붙이면 어느 것이
    어느 파일인지 알 수가 없다. 원본 문서에는 `**assets/...jpg**` 로 적혀
    있으므로 그것을 딸려 보낸다.

    돌려주는 것은 `(이름표 또는 None, 본문)` 짝이다.
    """
    path = os.path.join(ROOT, 'docs', doc)
    text = io.open(path, encoding='utf-8').read()
    lines = text.split('\n')
    at = next((i for i, l in enumerate(lines) if re.match(head, l)), None)
    if at is None:
        raise SystemExit('못 찾음: %s 의 %s' % (doc, head))
    end = section_end(lines, at)
    out, buf, on = [], [], False
    tag = None          # 방금 지나온 굵은 줄 — 다음 블록의 이름표
    for l in lines[at + 1:end]:
        if l.startswith('```'):
            if on:
                out.append((tag, '\n'.join(buf)))
                buf, tag = [], None
            on = not on
            continue
        if on:
            buf.append(l)
            continue
        t = l.strip()
        if t.startswith('**') and t.endswith('**') and len(t) > 4:
            tag = t.strip('*')
    # 프롬프트 말고 **자르기 설정**도 코드블록으로 들어 있다. 여기서는 자르기를
    # 아래에서 따로 적으므로 (`one`), 그 블록까지 실으면 같은 JSON 이 두 번
    # 나온다 — 복붙하는 사람이 어느 쪽을 쓸지 고민하게 된다.
    #
    # 첫 글자가 `{` 나 `[` 면 설정으로 본다. 프롬프트는 늘 영어 문장이다.
    return [(t, b) for t, b in out if not b.lstrip().startswith(('{', '['))]


def slice_under(doc, head):
    """
    그 절에 **손으로 적어 둔 자르기 JSON** — 없으면 `None`.

    보통은 아래 `one` 이 칸 수와 이름표로 자동으로 짓는다. 그런데 그것으로
    안 되는 자리가 있다 — 세로 배경 한 장은 `grid` 와 `size` 와 `allowFilled`
    가 필요한데, 자동으로 짓는 쪽은 `expect` 밖에 모른다.

    문서가 적어 두었으면 문서를 믿는다. 자동이 못 하는 것을 사람이 적어 둔
    것이므로, 여기서 덮어쓰면 그 사람이 적은 이유가 사라진다.
    """
    path = os.path.join(ROOT, 'docs', doc)
    text = io.open(path, encoding='utf-8').read()
    lines = text.split('\n')
    at = next((i for i, l in enumerate(lines) if re.match(head, l)), None)
    if at is None:
        return None
    end = section_end(lines, at)
    buf, on = [], False
    for l in lines[at + 1:end]:
        if l.startswith('```'):
            if on:
                body = '\n'.join(buf)
                if body.lstrip().startswith('{'):
                    return body
                buf = []
            on = not on
            continue
        if on:
            buf.append(l)
    return None


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


def grid(cells):
    """칸 수를 (가로, 세로) 로 편다 — 숫자 하나면 한 줄짜리다."""
    return cells if isinstance(cells, tuple) else (cells, 1)


def loose(n, path, title, doc, head, where):
    """자르지 않는 낱장 — 프롬프트와 넣을 자리만 적는다."""
    body = blocks_under(doc, head)
    if not body:
        raise SystemExit('코드블록 없음: %s 의 %s' % (doc, head))
    parts = [
        '## %d. %s' % (n, title),
        '',
        '| | |',
        '|---|---|',
        '| 자르기 | **없음** |',
        '| 넣는 곳 | %s |' % where,
        "| 원본 | `docs/%s`  |" % doc.replace(chr(92), '/'),
        '',
        '### 프롬프트',
        '',
    ]
    for t, b in body:
        """
        이름표가 **이미 들어온 파일**을 가리키면 그 덩어리는 안 싣는다.

        낱장은 사람 단위로 세는데 (`LOOSE`), 그러면 아녜스처럼 한 장만
        들어온 사람은 넉 장이 다 다시 실린다. 이름표가 곧 파일 이름이므로
        (`**assets/wallpaper/nun_awkward.jpg**`) 그것으로 하나씩 거른다.
        """
        got = re.search(r'`([^`]+\.(?:jpg|png))`', t or '')
        if got and os.path.exists(os.path.join(ROOT, got.group(1))):
            continue
        if t:
            parts += ['**%s**' % t, '']
        parts += ['```', b, '```', '']
    return '\n'.join(parts)


def one(n, key, cells, title, doc, head, labels, append=False):
    """
    시트 한 덩어리.

    `append` 는 **같은 폴더에 두 번째로 들어가는 시트**에 붙는다. 슬라이서는
    세트마다 그 폴더를 비우고 시작하므로, 안 붙이면 먼저 넣은 시트가 통째로
    사라진다 (`docs/ART_REQUESTS.md` 에 실제로 그렇게 잃은 기록이 있다).

    사람이 붙이는 것으로 두지 않는다 — 목록을 보고 "이건 두 번째인가" 를
    매번 세어야 하는데, 그 셈을 여기서 이미 하고 있다.
    """
    body = blocks_under(doc, head)
    if not body:
        raise SystemExit('코드블록 없음: %s 의 %s' % (doc, head))
    folder = REAL.get(key, key)
    cols, rows = grid(cells)
    parts = [
        '## %d. %s' % (n, title),
        '',
        '| | |',
        '|---|---|',
        "| 칸 | %s |" % ('%d × %d 줄' % (cols, rows) if rows > 1 else str(cols)),
        '| 폴더 | `assets/sprites/%s/` |' % folder,
        '| 원본 | `docs/%s`  |' % doc.replace('\\', '/'),
        '',
        '### 프롬프트',
        '',
    ]
    for t, b in body:
        if t:
            parts += ['**%s**' % t, '']
        parts += ['```', b, '```', '']
    hand = slice_under(doc, head)
    parts += ['### 자르기', '', '```json']
    if hand:
        # 문서가 적어 둔 것이 있으면 그것을 쓴다 (`slice_under`)
        parts += [hand]
    else:
        parts += [
            '{ "file": "<받은 파일명>", "name": "%s", "expect": [%d, %d],'
            % (folder, cols, rows),
            '  "labels": [%s]%s }'
            % (', '.join('"%s"' % l for l in labels),
               ', "append": true' if append else ''),
        ]
    parts += ['```', '']
    return '\n'.join(parts)


if __name__ == '__main__':
    todo = [i for i in ITEMS if not done(i[0], i[5])]
    left = [x for x in LOOSE if not os.path.exists(os.path.join(ROOT, x[0]))]
    if not todo and not left:
        io.open(OUT, 'w', encoding='utf-8').write(
            '# 프롬프트 전부\n\n**다 받았습니다.** 지금 필요한 그림이 없습니다.\n',
        )
        print('%s - nothing left' % OUT)
        raise SystemExit(0)

    rows = ['%d. **%s** — %s칸 → `%s`' % (
        n, t,
        ('%d×%d' % grid(c)) if isinstance(c, tuple) else str(c),
        REAL.get(k, k),
    ) for n, (k, c, t, _d, _h, _l) in enumerate(todo, 1)]
    rows += ['%d. **%s** — 낱장 (자르기 없음)' % (len(todo) + n, x[1])
             for n, x in enumerate(left, 1)]

    page = HEAD % {'index': '\n'.join(rows)}
    # 같은 폴더가 두 번 나오면 뒤엣것부터 `append` 다 (`one` 머리말)
    seen = set()
    sheets = []
    for n, it in enumerate(todo, 1):
        folder = REAL.get(it[0], it[0])
        sheets.append(one(n, *it, append=folder in seen))
        seen.add(folder)

    page += '\n---\n\n'.join(
        sheets + [loose(len(todo) + n, *x) for n, x in enumerate(left, 1)],
    )
    io.open(OUT, 'w', encoding='utf-8').write(page)
    print('%s - %d blocks + %d loose (of %d)'
          % (OUT, len(todo), len(left), len(ITEMS) + len(LOOSE)))
