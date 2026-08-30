# -*- coding: utf-8 -*-
"""
자격증명 검사기.

왜 필요한가: 이 저장소는 **공개**다 (github.com/JeonDaehong/player-growth-mobile).
공개 저장소에 키가 한 번 올라가면 지워도 소용이 없다 — 커밋을 되돌려도 이력에
남고, 그 전에 봇이 긁어 간다. 그러니 올리기 **전에** 막아야 한다.

`.gitignore` 만으로는 부족하다. 그건 파일 이름을 막는 물건이라, 키가 엉뚱한
곳에 들어가면 (`app.json` 에 붙여 넣기, 문서에 예시랍시고 진짜 값 적기,
`src/` 어딘가에 임시로 박아 두기) 아무 일도 안 한다. 그래서 이름이 아니라
**값의 모양**으로 찾는다 — 변수 이름은 얼마든지 바뀌지만 JWT 나 개인키
헤더의 모양은 안 바뀐다.

작업 폴더가 아니라 **git 이 들고 있는 것**을 훑는다. 작업 폴더를 보면 무시된
`.env` 가 늘 걸려서 "찾았다" 가 항상 참이 되고, 진짜를 못 가려낸다.

    python tools/check-secrets.py               # 지금 추적 중인 것
    python tools/check-secrets.py origin/main   # 이미 푸시된 것

찾으면 종료코드 1.
"""
import re
import subprocess
import sys

# ── 무엇을 찾나 ─────────────────────────────────────────────
#
# 걸리는 게 다 사고는 아니다. 마지막 규칙("값이 채워진 비밀 변수")은 특히
# 헛방이 많다 — 문서의 예시나 상수 이름에도 걸린다. 그래서 이 검사는
# "지워라" 가 아니라 **"사람이 한 번 봐라"** 를 뜻한다.

RULES = [
    ('JWT — supabase anon/service 키 모양',
     rb'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'),
    ('개인키 파일 내용',
     rb'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
    ('AWS 액세스 키',
     rb'\b(AKIA|ASIA)[0-9A-Z]{16}\b'),
    ('GitHub 토큰',
     rb'\bgh[pousr]_[A-Za-z0-9]{30,}'),
    ('OpenAI/Anthropic 키',
     rb'\b(sk-ant-|sk-proj-|sk-)[A-Za-z0-9_-]{24,}'),
    ('구글 API 키',
     rb'\bAIza[0-9A-Za-z_-]{35}\b'),
    ('슬랙 토큰',
     rb'\bxox[baprs]-[0-9A-Za-z-]{10,}'),
    ('DB 접속 문자열 (비밀번호가 들어 있다)',
     rb'(postgres|postgresql|mysql|mongodb)(\+srv)?://[^\s:@/]+:[^\s:@/]+@'),
    ('supabase 프로젝트 주소 (실제 ref)',
     rb'https://[a-z0-9]{15,}\.supabase\.co'),
    ('값이 채워진 비밀 변수',
     rb'(?i)\b(api[_-]?key|secret|passwd|password|access[_-]?token|'
     rb'private[_-]?key|client[_-]?secret)\b\s*[:=]\s*'
     rb'["\']?[A-Za-z0-9_\-./+]{12,}["\']?'),
]

# 사람이 이미 보고 "이건 예시다" 라고 판단한 것. 늘어나면 규칙을 좁혀야 한다는
# 뜻이므로, 여기 줄이 늘 때마다 규칙 쪽을 먼저 의심한다.
ALLOW = [
    # 문서의 채우기 자리 — 진짜 값이 아니다
    rb'xxxxx\.supabase\.co',
    rb'<[^>]*ref[^>]*>\.supabase\.co',
    # `.env.example` 은 이름만 있고 값이 비어 있다
    rb'EXPO_PUBLIC_SUPABASE_ANON_KEY=\s*$',
]

# 그림·소리는 훑어도 뜻이 없다 (그리고 느리다)
SKIP_EXT = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
            '.wav', '.mp3', '.ogg', '.ttf', '.otf', '.woff', '.woff2',
            '.gz', '.zip', '.pdf')


def run(args):
    return subprocess.run(args, capture_output=True, check=False)


def files_of(ref):
    """훑을 파일 목록. `ref` 가 없으면 추적 중 + 스테이징된 것."""
    if ref:
        out = run(['git', 'ls-tree', '-r', ref, '--name-only'])
        return ref, out.stdout.decode('utf-8', 'replace').splitlines()
    out = run(['git', 'ls-files', '--cached'])
    return None, out.stdout.decode('utf-8', 'replace').splitlines()


def blob_of(ref, path):
    if ref:
        return run(['git', 'show', '%s:%s' % (ref, path)]).stdout
    try:
        return open(path, 'rb').read()
    except OSError:
        return b''


def main():
    ref = sys.argv[1] if len(sys.argv) > 1 else None

    rules = [(n, re.compile(p)) for n, p in RULES]
    allow = [re.compile(p, re.M) for p in ALLOW]

    ref, paths = files_of(ref)
    hits = []
    scanned = 0
    for p in paths:
        if not p or p.lower().endswith(SKIP_EXT):
            continue
        blob = blob_of(ref, p)
        if not blob or b'\x00' in blob[:4096]:
            continue          # 바이너리
        scanned += 1
        for name, rx in rules:
            for m in rx.finditer(blob):
                got = m.group(0)
                if any(a.search(got) for a in allow):
                    continue
                line = blob[:m.start()].count(b'\n') + 1
                hits.append((name, p, line, got.decode('utf-8', 'replace')[:120]))

    where = ref or '작업 트리(추적 중인 파일)'
    print('%s — 텍스트 %d개 훑음 (전체 %d개)' % (where, scanned, len(paths)))
    if not hits:
        print('민감한 값 없음')
        return 0

    print('\n%d건 걸렸다 — 하나씩 눈으로 봐야 한다:\n' % len(hits))
    for name, p, line, got in hits:
        print('  [%s]' % name)
        print('    %s:%d' % (p, line))
        print('    %s\n' % got)
    print('진짜 예시라면 이 파일의 ALLOW 에 좁게 더한다.')
    print('진짜 키라면 **그 키를 먼저 폐기하고** 나서 지운다 — 공개 저장소는')
    print('지워도 이미 읽힌 뒤다.')
    return 1


if __name__ == '__main__':
    sys.exit(main())
