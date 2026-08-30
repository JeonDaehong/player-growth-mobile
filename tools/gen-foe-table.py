# -*- coding: utf-8 -*-
"""
적 수치표 생성기 → `docs/FOE_TABLE.md`.

왜 필요한가: 수치가 `core/autoBattle.ts` 안에 세 군데로 흩어져 있다 —
`SLIME`·`PLANT`·`WOOD` 표(종별 수치)와 `STAGES`(어느 판에 누가 나오나),
그리고 우두머리는 `STAGES` 안에 직접 적혀 있다. 밸런스를 잡으려면 "5판에
뭐가 몇 마리 나오고 각각 얼마나 센가" 를 한 화면에서 봐야 하는데, 그걸
보려면 지금은 세 곳을 오가며 눈으로 맞춰야 한다.

**손으로 안 적는다.** `autoBattle.ts` 를 읽어서 뽑는다 — 손으로 옮겨 적은
표는 수치를 고치는 순간 거짓말이 되고, 거짓말인 표는 없는 것보다 나쁘다.
(`gen-foe.py` 의 `STAGE_TABLE` 이 그렇게 손으로 맞춘 것이라, 그쪽은 판이
늘 때마다 어긋날 위험을 안고 있다.)

    python tools/gen-foe-table.py

TS 를 정규식으로 읽는다. 파서를 쓸 만큼 복잡한 파일이 아니고, 형식이
바뀌면 **조용히 틀리는 대신 멈추도록** 곳곳에 단정을 걸어 두었다.
"""
import io
import re

SRC = 'src/core/autoBattle.ts'
OUT = 'docs/FOE_TABLE.md'
NL = chr(10)

s = io.open(SRC, encoding='utf-8').read()


def block(name):
    """`const NAME = { ... } as const;` 의 속을 꺼낸다."""
    m = re.search(r'const %s = \{(.*?)\n\} as const;' % name, s, re.S)
    assert m, '%s 를 못 찾음' % name
    return m.group(1)


FIELD = (r"art: '(?P<art>[^']+)', name: '(?P<name>[^']+)', bg: '[^']*', "
         r"melee: (?P<melee>true|false) ?, atk: (?P<atk>\d+), hp: (?P<hp>\d+), "
         r"spd: (?P<spd>[\d.]+)(?:, def: (?P<def>\d+))?")


def kinds_of(name):
    out = {}
    for m in re.finditer(r'(\w+): \{ ' + FIELD, block(name)):
        d = m.groupdict()
        out[d['art']] = d
    return out


# 표마다 따로 들고 있는다. 키가 겹치기 때문이다 — `spore` 는 슬라임에도
# 있고(`sg_spore`) 식물에도 있다(`pf_spore`). 하나로 합치면 뒤에 온 것이
# 앞의 것을 덮어써서, 4판의 포자 슬라임이 홀씨대로 바뀐다.
#
# `STAGES` 에서 `g('spore')` 인지 `p('spore')` 인지가 이미 답을 말하고
# 있으므로 그 글자로 고른다.
BY_HELPER = {
    'g': kinds_of('SLIME'),
    'p': kinds_of('PLANT'),
    'w': kinds_of('WOOD'),
}

# 스테이지 — zone / kinds / boss 를 판마다
stages_src = s[s.index('export const STAGES'):s.index('/** 그 스테이지의 구성')]
entries = re.findall(
    r"bg: '(\d+)', zone: '([^']+)',\s*kinds: \[(.*?)\],\s*boss: \{ " + FIELD + r' \},',
    stages_src, re.S)
assert len(entries) == 20, '판이 20개가 아니다: %d' % len(entries)


def kinds_in(raw):
    """kinds 목록에서 종을 꺼낸다 — `p('vine')` 꼴과 인라인 객체 꼴이 섞여 있다."""
    out = []
    for m in re.finditer(r"([gpw])\('(\w+)'\)", raw):
        helper, key = m.group(1), m.group(2)
        table = BY_HELPER[helper]
        hit = [v for v in table.values() if v['art'].endswith('_' + key)]
        assert len(hit) == 1, '%s(%s) 를 못 찾거나 여럿이다' % (key, helper)
        out.append(hit[0])
    for m in re.finditer(r'\{ ' + FIELD + r' \}', raw):
        out.append(m.groupdict())
    return out


def swing(spd):
    return round(1200 / max(0.05, float(spd)))


def row(d, where):
    return '| %s | `%s` | %s | %s | %s | %s | %s (%dms) | %s |' % (
        where, d['art'], d['name'],
        '근접' if d['melee'] == 'true' else '원거리',
        d['atk'], d['hp'], d['spd'], swing(d['spd']),
        d.get('def') or '0',
    )


HEAD = ('| 스테이지 | 스프라이트 | 이름 | 사거리 | 공격력 | 체력 | 공격속도 | 방어력 |'
        + NL + '|---|---|---|---|---|---|---|---|')

mob_rows, boss_rows, stage_rows = [], [], []
seen = {}
for i, e in enumerate(entries):
    n = i + 1
    bg, zone, raw = e[0], e[1], e[2]
    boss = dict(zip(
        ['art', 'name', 'melee', 'atk', 'hp', 'spd', 'def'], e[3:]))
    ks = kinds_in(raw)
    for k in ks:
        seen.setdefault(k['art'], (k, []))[1].append(n)
    boss_rows.append(row(boss, '%d' % n))
    stage_rows.append('| %d | %s | `%s` | %s | %s |' % (
        n, zone, bg, ' · '.join(k['name'] for k in ks), boss['name']))

for art, (k, ns) in seen.items():
    rng = ','.join(str(x) for x in ns)
    mob_rows.append(row(k, rng))

# 파티 수치는 chars.ts 에서 — 서식을 한 번만 돌리려고 먼저 만든다
cs = io.open('src/core/chars.ts', encoding='utf-8').read()
crows = []
for m in re.finditer(
        r"name: '([^']+)',(?:[^}]*?)atk: (\d+), hp: (\d+), def: (\d+), "
        r"spd: ([\d.]+), crit: ([\d.]+), critDmg: ([\d.]+)", cs):
    nm, atk, hp, dfn, spd, crit, cd = m.groups()
    crows.append('| %s | %s | %s | %s | %s (%dms) | %g%% | %g%% |' % (
        nm, atk, hp, dfn, spd, swing(spd), float(crit) * 100, float(cd) * 100))
assert crows, '캐릭터 수치를 못 읽었다'

DOC = """# 적 수치표

**이 파일은 자동 생성됩니다** — `python tools/gen-foe-table.py`.
수치를 고치려면 `src/core/autoBattle.ts` 의 `SLIME`/`PLANT`/`WOOD` 표와
`STAGES` 를 고치고 다시 돌리세요. 여기를 고치면 다음 생성 때 지워집니다.

## 읽는 법

- **공격속도** 는 배수입니다. 1.0 이 기준이고, 괄호 안이 실제 간격입니다
  (`1200 / 배수` ms — `core/chars` 의 `ATTACK_BASE_MS`).
- **방어력** 은 뺄셈입니다. 3 이면 들어오는 피해에서 3 을 뺍니다. 비율이
  아니라서 약한 공격일수록 많이 깎입니다 (최소 1 은 들어갑니다).
- 판이 올라가도 **수치는 안 세집니다.** `STAGE_HP_POW`/`STAGE_ATK_POW` 가
  둘 다 0 이라 표에 적힌 값이 화면에 그대로 나옵니다. 판을 가르는 것은
  수치가 아니라 **어떤 종이 몇 종 나오느냐**입니다.
- 우두머리는 사냥 1분 뒤에 생기는 **"우두머리 토벌"** 단추를 눌러야 나옵니다.
  시간이 지나도 저절로 안 나옵니다.

## 스테이지 구성

| 판 | 지역 | 배경 | 나오는 잡몹 | 우두머리 |
|---|---|---|---|---|
%(stages)s

## 잡몹

한 판에 두세 종이 섞여 나옵니다. 같은 종이 여러 판에 걸쳐 나오므로
"스테이지" 칸에 나오는 판을 전부 적었습니다.

%(head)s
%(mobs)s

## 우두머리

판마다 하나씩입니다. **전부 체력 500** 이고, 잡몹과 달리 **기술을 하나**
씁니다 — 평타를 넷 친 다음 다섯 번째에 **파티 넷을 한꺼번에** 칩니다
(`core/autoBattle` 의 `BOSS_PATTERNS`, 한 명당 공격력의 90%%).

그때는 시트의 `special` 칸을 씁니다. 그 칸이 없는 슬라임 우두머리(1~10판)는
`attack` 칸으로 떨어집니다.

%(head)s
%(bosses)s

## 파티 쪽 수치

비교용입니다. `core/chars` 의 `CHARS` 가 원본입니다.

| 이름 | 공격력 | 체력 | 방어력 | 공격속도 | 치명타 | 치명타 피해 |
|---|---|---|---|---|---|---|
%(chars)s
"""

io.open(OUT, 'w', encoding='utf-8').write(DOC % {
    'stages': NL.join(stage_rows),
    'head': HEAD,
    'mobs': NL.join(mob_rows),
    'bosses': NL.join(boss_rows),
    'chars': NL.join(crows),
})
print('%s — 판 %d · 잡몹 %d종 · 우두머리 %d · 파티 %d명'
      % (OUT, len(entries), len(mob_rows), len(boss_rows), len(crows)))
