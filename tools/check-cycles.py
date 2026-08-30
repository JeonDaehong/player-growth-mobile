# -*- coding: utf-8 -*-
"""
순환 import 검사기.

왜 필요한가: 순환 import 는 **타입 검사도 빌드도 통과한다.** 터지는 건 실행할 때,
그것도 "둘 중 먼저 로드된 쪽에서 상대 모듈의 값이 undefined" 라는 형태로 터진다.
화면이 통째로 안 뜨는데 스택은 엉뚱한 곳을 가리킨다.

상태 계층을 store.ts 한 덩어리에서 types / helpers / slices / selectors 로 쪼갤 때
가장 큰 위험이 이것이었다. 쪼갠 뒤에도 안 생겼는지를 사람이 눈으로 볼 수는 없어서
기계가 본다.

`import type` 만 있는 줄은 세지 않는다 — 컴파일에서 지워지므로 순환이 안 된다.
그래서 타입이 서로를 가리키는 것은 얼마든지 괜찮다.

    python tools/check-cycles.py      # 순환이 있으면 종료코드 1

"""
import io,re,glob,os,sys
from collections import defaultdict
files={}
for p in glob.glob('src/**/*.ts',recursive=True)+glob.glob('src/**/*.tsx',recursive=True)+['App.tsx']:
    files[p.replace(os.sep,'/')]=io.open(p,encoding='utf-8').read()

def resolve(frm, spec):
    if spec.startswith('@/'): base='src/'+spec[2:]
    elif spec.startswith('.'): base=os.path.normpath(os.path.join(os.path.dirname(frm),spec)).replace(os.sep,'/')
    else: return None
    for c in (base+'.ts', base+'.tsx', base+'/index.ts', base+'/index.tsx'):
        if c in files: return c
    return None

# 값 import 만 본다 — `import type` 은 컴파일에서 지워져 순환이 안 된다
g=defaultdict(set)
for p,s in files.items():
    for m in re.finditer(r'^import\s+(type\s+)?([^;]*?)\s*from\s*[\'"]([^\'"]+)[\'"];', s, flags=re.M|re.S):
        if m.group(1): continue
        clause=m.group(2)
        # `import { type A, type B }` 처럼 전부 타입이면 건너뛴다
        inner=re.search(r'\{([^}]*)\}', clause, flags=re.S)
        if inner and not re.sub(r'\s','',clause).startswith(('*','')) is None: pass
        if inner:
            names=[n.strip() for n in inner.group(1).replace('\n',' ').split(',') if n.strip()]
            if names and all(n.startswith('type ') for n in names) and not clause.strip().startswith(('*','')) : 
                pass
            if names and all(n.startswith('type ') for n in names) and re.sub(r'\s','',clause).startswith('{'):
                continue
        t=resolve(p, m.group(3))
        if t and t!=p: g[p].add(t)

color={}; stack=[]; cycles=[]
def dfs(u):
    color[u]=1; stack.append(u)
    for v in sorted(g[u]):
        if color.get(v,0)==0: dfs(v)
        elif color.get(v)==1:
            i=stack.index(v); cycles.append(stack[i:]+[v])
    stack.pop(); color[u]=2
for n in sorted(files): 
    if color.get(n,0)==0: dfs(n)
if not cycles: print('순환 없음 ('+str(len(files))+' 파일 검사)')
else:
    print(len(cycles),'개 순환')
    for c in cycles[:12]: print('  ' + ' -> '.join(x.replace('src/','') for x in c))
    sys.exit(1)
