# -*- coding: utf-8 -*-
"""
보스 스킬 계산식 표 → `docs/BOSS_SKILLS.md`.

    python tools/gen-boss-skills.py

## 무엇을 위한 문서인가

"제대로 넣었나" 를 **숫자로** 확인하는 표다. 사양은 계수(공격력의 150%)로
적혀 있고 보스의 공격력은 판마다 다르므로, 둘을 곱해 보기 전에는 그 기술이
실제로 얼마나 아픈지 알 수 없다.

그래서 여기서 두 곳을 이어 붙인다 —

    core/autoBattle.ts  →  판마다의 보스 공격력·공격속도
    tools/gen-boss.py   →  기술의 사양 (누구를, 몇 배로, 몇 대마다)

## 계수는 여기 한 번 더 적혀 있다. 왜인가

`gen-boss.py` 의 기술 설명은 **사람이 읽는 문장**이라 계산에 못 쓴다
("아군 전체에 공격력의 90%만큼 물리 피해"). 계산하려면 구조가 필요하다.

두 벌이 되면 어긋날 수 있으므로, **여기 적은 숫자가 저쪽 문장 안에 그대로
들어 있는지 검사한다** (`check`). 하나라도 안 맞으면 문서를 안 쓰고 멈춘다.
"""
import importlib.util
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

OUT = 'docs/BOSS_SKILLS.md'
NL = chr(10)
SRC = 'src/core/autoBattle.ts'

PARTY = 4          # 파티 인원 — 전체 공격의 총량을 낼 때 쓴다
TICK = 0.5         # 지속 피해가 들어오는 간격 (초)


def load_bosses():
    """`gen-boss.py` 에서 우두머리 목록만 꺼낸다."""
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location(
        'genboss', os.path.join(here, 'gen-boss.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.BOSSES


def load_stats():
    """`STAGES` 에서 판마다의 우두머리 수치를 읽는다."""
    s = io.open(SRC, encoding='utf-8').read()
    part = s[s.index('export const STAGES'):s.index('/** 그 스테이지의 구성')]
    out = []
    for m in re.finditer(
            r"boss: \{\s*art: '[^']+', name: '([^']+)', bg: '[^']*', "
            r"melee: \w+, dmg: '\w+',\s*atk: (\d+), hp: (\d+), spd: ([\d.]+), "
            r"def: (\d+), res: (\d+),\s*\}", part):
        nm, atk, hp, spd, dfn, res = m.groups()
        out.append({'name': nm, 'atk': int(atk), 'hp': int(hp),
                    'spd': float(spd), 'def': int(dfn), 'res': int(res)})
    assert len(out) == 20, '우두머리 수치를 20개 못 읽었다: %d' % len(out)
    return out


# ══ 기술의 구조 ═══════════════════════════════════════════════
#
# (판, 기술번호, 대상, 계수, 피해종류, 평타 몇 대마다, 지속시간, 틱계수, 비고)
#
#   대상   'all' 전체 · 'one' 한 명 · 'two' 무작위 둘 · 'front' 맨 앞
#          'low' 체력이 제일 낮은 하나
#   계수   한 번에 들어가는 것. None 이면 즉시 피해가 없다 (디버프만)
#   틱계수 지속 피해 한 틱당. 없으면 None
#
# `check` 는 이 숫자들이 `gen-boss.py` 의 설명 문장 안에 그대로 있는지 본다.

SKILLS = [
    (1, 1, 'all', 0.90, 'phys', 4, None, None, None, []),
    (2, 1, 'one', 2.00, 'phys', 4, None, None, None, []),
    (3, 1, 'all', None, 'magic', 6, 3.0, 0.10, 'magic', ['중독']),
    (4, 1, 'all', None, None, 6, 5.0, None, None, ['둔화 50%']),
    (5, 1, 'all', 1.00, 'phys', 6, 3.0, 0.05, 'phys', ['출혈']),
    (6, 1, 'all', 1.30, 'phys', 6, 3.0, None, None, ['기절 30% 확률']),
    (7, 1, 'one', 2.00, 'phys', 5, 3.0, 0.05, 'phys', ['출혈']),
    (8, 1, 'all', None, 'magic', 6, 5.0, 0.12, 'magic', ['중독']),
    (9, 1, 'one', 2.00, 'phys', 3, None, None, None, ['방어 무시']),
    (10, 1, 'all', 1.50, 'phys', 3, 3.0, 0.15, 'magic', ['중독']),
    (10, 2, 'low', 2.00, 'magic', 7, None, None, None, ['흡혈 50%']),
    (11, 1, 'all', 1.10, 'phys', 4, 3.0, 0.05, 'phys', ['출혈', '방어 무시']),
    (12, 1, 'one', None, 'magic', 5, 3.0, 0.15, 'magic', ['중독', '둔화 50%']),
    (13, 1, 'two', 1.40, 'phys', 5, 2.0, None, None, ['기절']),
    (14, 1, 'all', None, 'magic', 6, 4.0, 0.08, 'magic', ['중독', '치유 -50%']),
    (15, 1, 'all', None, 'magic', 6, 4.0, 0.10, 'magic', ['중독', '침묵 5초']),
    (16, 1, 'front', 2.20, 'phys', 5, None, None, None, ['방어 -40%']),
    (17, 1, 'all', 1.00, 'magic', 6, None, None, None, ['기절/약화 40% 확률']),
    (18, 1, 'all', 1.40, 'phys', 5, None, None, None, ['방어 무시']),
    (19, 1, 'all', 1.50, 'phys', 6, None, None, None, []),
    (20, 1, 'all', 1.50, 'phys', 6, None, None, None, ['게이지 -50%']),
    (20, 2, 'low', 2.50, 'magic', 5, None, None, None, []),
]

# 사양에 **숫자가 없어서 내가 정한** 계수. 검사에서 빼고, 문서에 표시한다.
#
# 10판 해일은 원문이 "아군 전체 대량 물리피해" 다 — 계수가 없다. 그냥 넘어가면
# 내가 지어낸 1.5 가 사양인 척 표에 앉는다.
GUESSED = {(10, 1): '사양이 "대량 물리피해" 라고만 적혀 있어 1.50 으로 잡았습니다'}

AIM = {
    'all': ('아군 전체', PARTY),
    'one': ('한 명', 1),
    'two': ('무작위 2명', 2),
    'front': ('맨 앞 한 명', 1),
    'low': ('체력이 가장 낮은 한 명', 1),
}
DMG_NAME = {'phys': '물리', 'magic': '마법', None: '—'}


def check(bosses):
    """구조로 적은 숫자가 `gen-boss.py` 의 설명 문장에도 있는지 본다."""
    by = {b['stage']: b for b in bosses}
    bad = []
    for st, no, aim, mul, _dt, every, dur, tick, _tt, _tags in SKILLS:
        b = by.get(st)
        assert b, '%d판 우두머리가 없다' % st
        assert len(b['skills']) >= no, '%d판에 %d번째 기술이 없다' % (st, no)
        does = b['skills'][no - 1][2]
        want = ['평타 %d대마다' % every]
        if mul is not None and (st, no) not in GUESSED:
            want.append('%d%%' % round(mul * 100))
        if tick is not None:
            want.append('%d%%' % round(tick * 100))
        if dur is not None:
            want.append('%g초' % dur)
        for w in want:
            if w not in does:
                bad.append('%d판 스킬%d: "%s" 가 설명에 없다 — %s'
                           % (st, no, w, does))
    assert not bad, ('사양과 계산이 어긋납니다:' + NL + NL.join(bad))


def rows(bosses, stats):
    by = {b['stage']: b for b in bosses}
    out = []
    for st, no, aim, mul, dt, every, dur, tick, tt, tags in SKILLS:
        b = by[st]
        atk = stats[st - 1]['atk']
        spd = stats[st - 1]['spd']
        name = b['skills'][no - 1][1]
        who, cnt = AIM[aim]

        # 쿨타임 — `every` 대마다이므로 실제 초는 공격속도가 정한다
        gap = every * (1200.0 / spd) / 1000.0

        # 즉시 피해
        if mul is None:
            hit, hit_txt = 0, '—'
        else:
            hit = round(atk * mul)
            mark = ' †' if (st, no) in GUESSED else ''
            hit_txt = '%d (%s×%.2f)%s' % (hit, atk, mul, mark)

        # 지속 피해
        if tick is None:
            dot, dot_txt = 0, '—'
        else:
            n = int(round(dur / TICK))
            per = round(atk * tick)
            dot = per * n
            dot_txt = '%d (%d×%d틱)' % (dot, per, n)

        one = hit + dot
        out.append('| %d | %s | %s | %s | %s | %s | %d | **%d** | %.1f초 | %s |'
                   % (st, name, who, DMG_NAME[dt], hit_txt, dot_txt,
                      one, one * cnt, gap, ' · '.join(tags) or '—'))
    return out


def basics(stats):
    out = []
    for i, s in enumerate(stats, 1):
        gap = 1200.0 / s['spd']
        dps = s['atk'] * 1000.0 / gap
        out.append('| %d | %s | %d | %d | %.2f (%.0fms) | %d | %d | %.1f |'
                   % (i, s['name'], s['atk'], s['hp'], s['spd'], gap,
                      s['def'], s['res'], dps))
    return out


PAGE = """# 보스 스킬 계산식

**이 파일은 자동 생성됩니다** — `python tools/gen-boss-skills.py`.

사양(`tools/gen-boss.py`)과 실제 수치(`src/core/autoBattle.ts`)를 곱해서
**숫자로** 보여 주는 표입니다. 계수만 봐서는 그 기술이 얼마나 아픈지 알 수
없어서 만들었습니다.

## 아직 코드에 안 들어갔습니다

지금 계산에 들어 있는 우두머리 기술은 **하나**뿐입니다 — 평타 넷마다 나가는
전체 공격(공격력의 90%%, `core/autoBattle` 의 `BOSS_PATTERNS`). 아래 표의
나머지는 **사양**이고, 지속 피해 · 기절 · 침묵 · 둔화 · 흡혈 · 방어 감소 ·
게이지 차감은 전부 새로 만들어야 하는 장치입니다.

## 읽는 법

- **한 명당** 은 대상 한 명이 받는 총량입니다 (즉시 + 지속 전부).
- **총량** 은 그 기술 한 번으로 파티가 통째로 받는 양입니다. 전체 공격이면
  한 명당의 4배입니다.
- **둘 다 방어를 빼기 전** 값입니다. 실제로는 맞는 사람의 방어력(물리) 또는
  마법저항력(마법)만큼 깎여 들어갑니다 (`core/chars` 의 `Armor`).
  방어 무시가 붙은 것은 안 깎입니다.
- **쿨타임** 은 평타 횟수로 도므로(`평타 N대마다`) 실제 초는 그 우두머리의
  공격속도가 정합니다. 느린 우두머리는 같은 `N` 이라도 더 드물게 씁니다.
- 지속 피해는 전부 **0.5초마다 한 틱**입니다. `3초 / 틱당 10%%` 면 여섯 틱이라
  합쳐서 공격력의 60%% 입니다.

## 우두머리 기본 수치

| 판 | 이름 | 공격력 | 체력 | 공격속도 | 방어력 | 마법저항력 | 평타 초당 |
|---|---|---|---|---|---|---|---|
%(basics)s

## 기술

| 판 | 기술 | 대상 | 피해 | 즉시 | 지속 | 한 명당 | 총량 | 쿨타임 | 붙는 것 |
|---|---|---|---|---|---|---|---|---|---|
%(skills)s

## † 사양에 없어서 제가 정한 값

%(guessed)s

## 눈여겨볼 곳

- **9판 백골 가시 찌르기** — 평타 3대마다입니다. 스무 기술 중 제일 자주
  나가고, 게다가 방어를 무시합니다. 한 명에게 몰리므로 그 한 명이 앞줄이면
  버티고 뒷줄이면 죽습니다.
- **10판 오염된 심연의 해일** — 역시 평타 3대마다인데 **전체**입니다. 총량이
  이 게임에서 제일 큽니다.
- **14판 독성 포자 분출** — 즉시 피해가 0 인데 총량이 큽니다. 지속 피해만으로
  그만큼 나오고, 게다가 치유를 절반으로 깎으므로 회복으로 버티는 파티가
  여기서 막힙니다.
- **4판 환각 포자 폭발** — 피해가 아예 0 입니다. 유일하게 숫자가 안 뜨는
  기술이라, 화면에서 뭔가 일어났다는 걸 그림과 로고로만 말해야 합니다.
- **20판** — 기술이 둘이고 하나는 체력이 가장 낮은 사람을 노립니다. 마무리를
  전담하는 기술이라 총량은 작지만 실제 위험은 표의 숫자보다 큽니다.

## 사양과 어긋나면 멈춥니다

이 파일의 계수는 `tools/gen-boss-skills.py` 에 구조로 한 번 더 적혀 있습니다
(문장은 계산에 못 쓰므로). 두 벌이 되면 어긋날 수 있어서, **여기 적은 숫자가
`gen-boss.py` 의 설명 문장 안에 그대로 있는지 검사합니다** — 하나라도 안 맞으면
문서를 안 쓰고 멈춥니다.
"""


if __name__ == '__main__':
    bosses = load_bosses()
    stats = load_stats()
    check(bosses)
    gl = NL.join('- **%d판 스킬%d** — %s' % (st, no, why)
                 for (st, no), why in sorted(GUESSED.items()))
    io.open(OUT, 'w', encoding='utf-8').write(PAGE % {
        'basics': NL.join(basics(stats)),
        'skills': NL.join(rows(bosses, stats)),
        'guessed': gl or '없습니다.',
    })
    print('%s — 우두머리 %d · 기술 %d' % (OUT, len(stats), len(SKILLS)))
