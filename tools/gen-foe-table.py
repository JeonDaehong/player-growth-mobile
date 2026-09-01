# -*- coding: utf-8 -*-
"""
적 수치표 생성기 → `docs/FOE_TABLE.md`.

왜 필요한가: 수치가 `core/autoBattle.ts` 안에 두 군데로 나뉘어 있다 —
**정체**는 종 표(`SLIME`·`PLANT`·`WOOD`)가, **수치**는 `STAGES` 가 든다.
밸런스를 잡으려면 "5판에 뭐가 몇 마리 나오고 각각 얼마나 센가" 를 한 화면에서
봐야 하는데, 그걸 보려면 두 곳을 오가며 눈으로 맞춰야 한다.

**손으로 안 적는다.** `autoBattle.ts` 를 읽어서 뽑는다 — 손으로 옮겨 적은
표는 수치를 고치는 순간 거짓말이 되고, 거짓말인 표는 없는 것보다 나쁘다.

    python tools/gen-foe-table.py

TS 를 정규식으로 읽는다. 파서를 쓸 만큼 복잡한 파일이 아니고, 형식이 바뀌면
**조용히 틀리는 대신 멈추도록** 곳곳에 단정을 걸어 두었다.
"""
import io
import re

SRC = 'src/core/autoBattle.ts'
OUT = 'docs/FOE_TABLE.md'
NL = chr(10)

s = io.open(SRC, encoding='utf-8').read()

DMG_NAME = {'phys': '물리', 'magic': '마법'}


def block(name):
    """`const NAME = { ... } as const;` 의 속을 꺼낸다."""
    m = re.search(r'const %s = \{(.*?)\n\} as const;' % name, s, re.S)
    assert m, '%s 를 못 찾음' % name
    return m.group(1)


def species(name):
    """종 표 한 벌 — 정체만 들어 있다 (그림 · 이름 · 사거리 · 피해 종류)."""
    out = {}
    for m in re.finditer(
            r"(\w+): \{ art: '([^']+)', name: '([^']+)', bg: '[^']*', "
            r"melee: (true|false), dmg: '(\w+)' \}", block(name)):
        key, art, ko, melee, dmg = m.groups()
        out[key] = {'art': art, 'name': ko, 'melee': melee, 'dmg': dmg}
    assert out, '%s 에서 종을 못 읽었다' % name
    return out


# 표마다 따로 들고 있는다. 키가 겹치기 때문이다 — `spore` 는 슬라임에도
# 있고(`sg_spore`) 식물에도 있다(`pf_spore`). 하나로 합치면 뒤에 온 것이
# 앞의 것을 덮어써서, 4판의 포자 슬라임이 홀씨대로 바뀐다.
BY_HELPER = {'g': species('SLIME'), 'p': species('PLANT'), 'w': species('WOOD')}

# ── 스테이지 ──────────────────────────────────────────────
stages_src = s[s.index('export const STAGES'):s.index('/** 그 스테이지의 구성')]

BOSS = (r"boss: \{\s*art: '(?P<art>[^']+)', name: '(?P<name>[^']+)', "
        r"(?:title: '[^']*', )?"
        r"bg: '[^']*', melee: (?P<melee>true|false), dmg: '(?P<dmg>\w+)',\s*"
        r"atk: (?P<atk>\d+), hp: (?P<hp>\d+), spd: (?P<spd>[\d.]+), "
        r"def: (?P<def>\d+), res: (?P<res>\d+),\s*\}")

entries = re.findall(
    r"bg: '(\d+)', zone: '([^']+)',\s*kinds: \[(.*?)\],\s*" + BOSS + r',',
    stages_src, re.S)
assert len(entries) == 20, '판이 20개가 아니다: %d' % len(entries)


def kinds_in(raw):
    """kinds 목록에서 한 판의 적들을 꺼낸다.

    두 가지 꼴이 섞여 있다 — 헬퍼 호출(`g('mud', 12, 80, 0.75, 1, 0)`)과,
    1판에만 있는 인라인 객체다.
    """
    out = []
    for m in re.finditer(
            r"([gpw])\('(\w+)', (\d+), (\d+), ([\d.]+), (\d+), (\d+)\)", raw):
        h, key, atk, hp, spd, dfn, res = m.groups()
        sp = BY_HELPER[h].get(key)
        assert sp, '%s(%s) 를 종 표에서 못 찾음' % (h, key)
        out.append(dict(sp, atk=atk, hp=hp, spd=spd, **{'def': dfn, 'res': res}))
    for m in re.finditer(
            r"\{ art: '([^']+)', name: '([^']+)', bg: '[^']*', "
            r"melee: (true|false), dmg: '(\w+)', atk: (\d+), hp: (\d+), "
            r"spd: ([\d.]+), def: (\d+), res: (\d+) \}", raw):
        art, ko, melee, dmg, atk, hp, spd, dfn, res = m.groups()
        out.append({'art': art, 'name': ko, 'melee': melee, 'dmg': dmg,
                    'atk': atk, 'hp': hp, 'spd': spd, 'def': dfn, 'res': res})
    assert out, '한 판의 kinds 를 못 읽었다: %r' % raw[:80]
    return out


def swing(spd):
    return round(1200 / max(0.05, float(spd)))


def row(d, where):
    return '| %s | `%s` | %s | %s | %s | %s | %s | %s (%dms) | %s | %s |' % (
        where, d['art'], d['name'],
        '근접' if d['melee'] == 'true' else '원거리',
        DMG_NAME[d['dmg']],
        d['atk'], d['hp'], d['spd'], swing(d['spd']), d['def'], d['res'],
    )


HEAD = ('| 판 | 스프라이트 | 이름 | 사거리 | 피해 | 공격력 | 체력 '
        '| 공격속도 | 방어력 | 마법저항력 |'
        + NL + '|---|---|---|---|---|---|---|---|---|---|')

mob_rows, boss_rows, stage_rows = [], [], []
# 같은 종이 판마다 수치가 다르므로 **판마다 한 줄**이다
for i, e in enumerate(entries):
    n = i + 1
    bg, zone, raw = e[0], e[1], e[2]
    boss = dict(zip(['art', 'name', 'melee', 'dmg', 'atk', 'hp', 'spd',
                     'def', 'res'], e[3:]))
    ks = kinds_in(raw)
    for k in ks:
        mob_rows.append(row(k, str(n)))
    boss_rows.append(row(boss, str(n)))
    stage_rows.append('| %d | %s | `%s` | %s | %s |' % (
        n, zone, bg, ' · '.join(k['name'] for k in ks), boss['name']))

# ── 파티 수치 ─────────────────────────────────────────────
cs = io.open('src/core/chars.ts', encoding='utf-8').read()
crows = []
for m in re.finditer(
        r"name: '([^']+)',(?:[^}]*?)atk: (\d+), hp: (\d+), def: (\d+), res: (\d+), "
        r"spd: ([\d.]+), crit: ([\d.]+), critDmg: ([\d.]+)"
        r"(?:[^}]*?)dmg: '(\w+)'", cs):
    nm, atk, hp, dfn, res, spd, crit, cd, dmg = m.groups()
    crows.append('| %s | %s | %s | %s | %s | %s | %s (%dms) | %g%% | %g%% |' % (
        nm, DMG_NAME[dmg], atk, hp, dfn, res, spd, swing(spd),
        float(crit) * 100, float(cd) * 100))
assert crows, '캐릭터 수치를 못 읽었다'

DOC = """# 적 수치표

**이 파일은 자동 생성됩니다** — `python tools/gen-foe-table.py`.
수치를 고치려면 `src/core/autoBattle.ts` 의 `STAGES` 를 고치고 다시 돌리세요.
여기를 고치면 다음 생성 때 지워집니다.

## 읽는 법

- **수치는 종이 아니라 판이 듭니다.** 같은 진흙 슬라임이 3판에서 12/80 이고
  5판에서 16/125 입니다. 그래서 잡몹 표는 종마다 한 줄이 아니라
  **판마다 한 줄**입니다.
- **공격속도** 는 배수입니다. 1.0 이 기준이고, 괄호 안이 실제 간격입니다
  (`1200 / 배수` ms — `core/chars` 의 `ATTACK_BASE_MS`).
- **피해에 두 종류가 있습니다** — 물리와 마법. 막는 스탯이 서로 다릅니다.
  - **방어력** 은 **물리** 피해만 깎습니다.
  - **마법저항력** 은 **마법** 피해만 깎습니다.
  - 둘 다 뺄셈입니다. 비율이 아니라서 약한 공격일수록 많이 깎입니다
    (최소 1 은 들어갑니다).
  - 관통이 있는 공격은 그 방어를 **통째로 무시**합니다.
- **곱해지는 것이 없습니다.** `STAGE_HP_POW`/`STAGE_ATK_POW` 가 둘 다 0 이라
  여기 적힌 값이 화면에 그대로 나옵니다.
- 우두머리는 사냥 1분 뒤에 생기는 **"우두머리 토벌"** 단추를 눌러야 나옵니다.

> ⚠ **지금 이 표대로 안 싸웁니다.** `core/autoBattle` 의 `FLAT_FOES` 가 켜져
> 있어서, 1~20판 잡몹은 전부 체력 2000 · 공격력 20 이고 우두머리는 전부
> 체력 30000 · 공격력 20 입니다 — 스무 판을 손으로 굴려 보려고 켜 둔
> 스위치입니다.
>
> 아래 표는 **맞춰 둔 원래 값**이고 그대로 남아 있습니다. 스위치를 `null` 로
> 바꾸면 이 표대로 돌아옵니다. `FREE_ENHANCE`(`core/chars`) · `FREE_BOSS` 와
> 짝이고, **출시 전에 셋을 같이 끕니다.**

## 마법으로 때리는 적

넷뿐이고 전부 원거리입니다 — **산성 슬라임**(7판~) · **홀씨대**(11판~) ·
**진액꽃**(14판~) · **꼬투리나무**(18판~). 이들이 나오는 판부터 파티의
마법저항력이 값을 갖습니다. 그 전까지 이졸데의 마저 1 은 아무 일도 안 합니다.

## 스테이지 구성

지역은 **열 판마다**, 배경은 **다섯 판마다** 바뀝니다.

| 판 | 지역 | 배경 | 나오는 잡몹 | 우두머리 |
|---|---|---|---|---|
%(stages)s

## 잡몹

%(head)s
%(mobs)s

## 우두머리

판마다 하나씩입니다. 잡몹과 달리 **기술을 씁니다** — 지금 계산에 들어 있는
것은 평타 넷마다 나가는 전체 공격 하나뿐이고(`core/autoBattle` 의
`BOSS_PATTERNS`), 스무 마리 각자의 기술은 아직 그림과 사양만 있습니다
([`BOSS_SKILLS.md`](BOSS_SKILLS.md)).

기술이 나가는 동안에는 시트의 `skill1` 칸을 씁니다.

%(head)s
%(bosses)s

## 파티 쪽 수치

비교용입니다. `core/chars` 의 `CHARS` 가 원본입니다.

| 이름 | 평타 | 공격력 | 체력 | 방어력 | 마법저항력 | 공격속도 | 치명타 | 치명타 피해 |
|---|---|---|---|---|---|---|---|---|
%(chars)s
"""

io.open(OUT, 'w', encoding='utf-8').write(DOC % {
    'stages': NL.join(stage_rows),
    'head': HEAD,
    'mobs': NL.join(mob_rows),
    'bosses': NL.join(boss_rows),
    'chars': NL.join(crows),
})
print('%s — 판 %d · 잡몹 줄 %d · 우두머리 %d · 파티 %d명'
      % (OUT, len(entries), len(mob_rows), len(boss_rows), len(crows)))
