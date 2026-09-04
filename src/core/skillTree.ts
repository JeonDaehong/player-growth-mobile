/**
 * 스킬 트리 — **넷이 각자 다른 사람이 되는 자리.**
 *
 * 성이 오르면 기술이 하나씩 열린다 (`core/growth` 의 `skillSlots`). 여태
 * 무엇이 열릴지는 정해져 있었다 — 2성이면 이 기술, 3성이면 저 기술. 그래서
 * 같은 캐릭터를 키운 두 사람의 이졸데가 완전히 같았고, 키우는 일이
 * "정해진 것을 따라가는 일" 이었다.
 *
 * 이제 3단계와 4단계에서 **갈래**가 나온다. 한쪽을 찍으면 다른 쪽은 영영
 * 못 찍는다 (되돌리기 전까지). 그래서 이졸데를 방패로 키울 수도 있고 검으로
 * 키울 수도 있다.
 *
 * ## 갈래는 **다음 갈래를 잠근다**
 *
 * 3-1 을 찍으면 4-1 만 열린다. 3-2 를 찍으면 4-2 만 열린다. 갈래마다 따로
 * 고르게 하면 조합이 넷이 되는데, 그러면 "수호의 결의는 안 찍고 수호신의
 * 가호만 찍은" 같은 말이 안 되는 상태가 생긴다 — 뒤엣것이 앞엣것을 두 배로
 * 만드는 것이므로.
 *
 * 한 줄기로 묶으면 고르는 일이 **한 번**이 되고, 그 한 번이 "이 사람을
 * 어떤 사람으로 키울까" 가 된다.
 *
 * ## 안 갈리는 단계도 있다
 *
 * 비앙카의 화산격(2단계)과 과열(4단계), 리안느의 숲의 축복(2단계)은 갈래가
 * 없다. 성이 되면 그냥 열린다.
 *
 * 넷 다 모든 단계를 갈래로 두지 않은 이유: 갈래가 넷이면 고를 것이 열여섯
 * 가지가 되는데, 그 열여섯을 서로 다르게 만들 만한 내용이 없다. 갈래는
 * **내용이 실제로 갈리는 자리에만** 둔다.
 *
 * ## 이 파일은 규칙만 안다
 *
 * 무엇을 찍었는지는 세이브에 있고 (`OwnedChar.tree`), 그 결과가 전투에서
 * 어떻게 움직이는지는 여기 없다.
 *
 *   기술 **수치**를 손보는 갈래  →  `core/chars` 의 `skillsFor`
 *   패시브를 끄는 갈래           →  `core/passives`
 *   새 효과를 만드는 갈래        →  아직 없다 (`TreeNode.live` 가 `false`)
 *
 * `live` 가 붙은 자리만 실제로 전투에 들어가 있다. 화면이 그 칸을 보고
 * "준비중" 을 붙인다 — 찍었는데 아무 일도 안 일어나는 것을 말 안 해 주면
 * 고장으로 읽힌다.
 */
import type { CharId } from './chars';

/** 트리 자리 하나의 이름표 */
export type NodeId = string;

export interface TreeNode {
  id: NodeId;
  who: CharId;
  /**
   * 몇 번째 단계인가 (1~4). **그 성이 되어야 열린다** — 3단계는 3성부터다
   * (`core/growth` 의 `skillSlots`).
   */
  tier: number;
  name: string;
  /** 눌러서 쓰나(액티브), 늘 걸려 있나(패시브) */
  kind: 'active' | 'passive';
  /**
   * 같이 못 고르는 짝. 없으면 **갈래가 아니라 그냥 열리는 자리**다.
   *
   * 이 칸이 있느냐 없느냐가 곧 "찍어야 하는 자리인가" 다 — 짝이 없으면
   * 성만 되면 저절로 열린다 (`granted`).
   */
  rival?: NodeId;
  /** 이걸 찍으려면 먼저 찍혀 있어야 하는 자리 */
  needs?: NodeId;
  /** 평타 몇 대를 모아야 나가나. 패시브는 없다 (`SkillDef.cost`) */
  cost?: number;
  /** 화면에 적는 한 줄 */
  desc: string;
  /** 그림 (`assets/sprites/skill_icon/`). 아직 없으면 빈 자리로 뜬다 */
  art: string;
  /**
   * 이 자리가 **이미 전투에 들어갔나.**
   *
   * 트리는 먼저 세우고 효과는 하나씩 붙인다. 그 사이에 찍히기만 하고 아무
   * 일도 안 일어나는 자리가 생기는데, 그걸 화면이 말해 주지 않으면 고장으로
   * 읽힌다 — 찍었는데 숫자가 안 변하니까.
   *
   * 붙는 대로 `true` 로 바꾼다.
   */
  live?: boolean;
}

/*
  ── 이졸데 ── 방패로 갈까 검으로 갈까.

  2단계에서 이미 갈린다. 넷 중 유일하게 2단계가 갈래인 이유는, 이 사람의
  기본 패시브(불굴의 맹세)가 "앞에서 버틴다" 하나를 못 박고 있어서 —
  거기서 벗어나는 길을 일찍 열어 주지 않으면 3단계에서 갈라 봐야 이미
  방패 쪽으로 굳어 있다.

  검 쪽 끝(파쇄의 태세)이 그 패시브를 **꺼 버리는** 것이 이 갈래의 값이다.
*/
const ISOLDE: readonly TreeNode[] = [
  {
    id: 'kg1', who: 'knightgirl', tier: 1, name: '검기', kind: 'active', cost: 4,
    desc: '적 전체를 벤다.', art: 'sk_wave', live: true,
  },
  {
    id: 'kg2a', who: 'knightgirl', tier: 2, name: '도발', kind: 'active', cost: 6,
    rival: 'kg2b',
    desc: '전장의 적 전체가 이졸데만 노린다.', art: 'sk_taunt', live: true,
  },
  {
    id: 'kg2b', who: 'knightgirl', tier: 2, name: '함성', kind: 'active', cost: 8,
    rival: 'kg2a',
    desc: '5초간 자신의 공격력이 1.3배가 된다.', art: 'sk_shout', live: true,
  },
  {
    id: 'kg3a', who: 'knightgirl', tier: 3, name: '수호의 결의', kind: 'active', cost: 10,
    rival: 'kg3b', needs: 'kg2a',
    desc: '아군 전체에 최대체력의 12%만큼 보호막. 다 깎이거나 8초가 지나면 사라진다.',
    art: 'sk_ward', live: true,
  },
  {
    id: 'kg3b', who: 'knightgirl', tier: 3, name: '파쇄의 태세', kind: 'passive',
    rival: 'kg3a', needs: 'kg2b',
    desc: '검기가 방어를 관통하고, 코스트가 1 줄고, 피해가 1.5배가 된다. '
      + '대신 불굴의 맹세가 꺼진다.',
    art: 'sk_breaker', live: true,
  },
  {
    id: 'kg4a', who: 'knightgirl', tier: 4, name: '수호신의 가호', kind: 'passive',
    rival: 'kg4b', needs: 'kg3a',
    desc: '수호의 결의가 두 배가 되고, 보호막이 있는 동안 방어력 +10. '
      + '보호막을 두른 아군이 맞으면 그 피해의 10%를 적에게 되돌린다.',
    art: 'sk_aegis', live: true,
  },
  {
    id: 'kg4b', who: 'knightgirl', tier: 4, name: '성검 발현', kind: 'active', cost: 12,
    rival: 'kg4a', needs: 'kg3b',
    desc: '적 하나에게 빛과 함께 큰 검을 떨어뜨려 공격력의 300% 물리 피해.',
    art: 'sk_holysword', live: true,
  },
];

/*
  ── 비앙카 ── 갈래가 3단계 하나뿐이다.

  불을 넓게 펴는 쪽(용암 지대)과 제 몸으로 밀어붙이는 쪽(불굴의 의지).
  둘 다 액티브라 4단계는 갈래를 안 둔다 — 과열은 어느 쪽으로 가든 평타를
  더 치게 하는 것이라 양쪽에 다 맞는다.
*/
const BIANCA: readonly TreeNode[] = [
  {
    id: 'ba1', who: 'bunnyaxe', tier: 1, name: '강타', kind: 'active', cost: 5,
    desc: '앞줄이나 뒷줄 한쪽만 골라 최대 셋을 내리찍는다.', art: 'sk_leap', live: true,
  },
  {
    id: 'ba2', who: 'bunnyaxe', tier: 2, name: '화산격', kind: 'active', cost: 8,
    desc: '맞은 적 발밑에서 불기둥이 솟는다.', art: 'sk_volcano', live: true,
  },
  {
    id: 'ba3a', who: 'bunnyaxe', tier: 3, name: '용암 지대', kind: 'active', cost: 10,
    rival: 'ba3b',
    desc: '적 전체에 공격력의 130% 물리 피해. 5초간 [지옥불] — 0.5초마다 '
      + '공격력의 20%가 화염 피해로 들어간다.',
    art: 'sk_lava',
  },
  {
    id: 'ba3b', who: 'bunnyaxe', tier: 3, name: '불굴의 의지', kind: 'active', cost: 13,
    rival: 'ba3a',
    desc: '5초간 모든 디버프에 안 걸리고 공격력이 두 배가 된다. '
      + '그동안 입힌 피해의 7%만큼 체력을 회복한다.',
    art: 'sk_resolve',
  },
  {
    id: 'ba4', who: 'bunnyaxe', tier: 4, name: '과열', kind: 'passive',
    desc: '세 번째 평타마다 두 번 친다. 둘째 대는 공격력의 150%로 터진다 '
      + '(세 번 치면 네 대, 코스트는 네 칸).',
    art: 'sk_overheat',
  },
];

/*
  ── 리안느 ── 혼자 세지는 쪽과 파티를 올리는 쪽.

  3-1 은 화살비 자체를 키우고 3-2 는 넷 전부의 치명타를 올린다. 4단계는
  그 갈래를 각자 한 번 더 밀어 준다 — 이 사람만 4단계가 둘 다 패시브인
  이유는, 액티브를 하나 더 얹으면 코스트 칸이 넷이 되어 무엇이 차고 있는지
  파티 칸에서 안 읽히기 때문이다.
*/
const RIANNE: readonly TreeNode[] = [
  {
    id: 'ea1', who: 'elfarcher', tier: 1, name: '화살비', kind: 'active', cost: 4,
    desc: '무작위 적 셋에게 화살을 퍼붓는다.', art: 'sk_rain', live: true,
  },
  {
    id: 'ea2', who: 'elfarcher', tier: 2, name: '숲의 축복', kind: 'active', cost: 10,
    desc: '5초간 제 공격속도가 두 배가 된다.', art: 'sk_frenzy', live: true,
  },
  {
    id: 'ea3a', who: 'elfarcher', tier: 3, name: '강화된 화살', kind: 'passive',
    rival: 'ea3b',
    desc: '화살비 코스트가 1 줄고 화살이 넷이 된다. 적이 하나면 넷 다 그 하나에게.',
    art: 'sk_sharparrow', live: true,
  },
  {
    id: 'ea3b', who: 'elfarcher', tier: 3, name: '정령의 노래', kind: 'active', cost: 10,
    rival: 'ea3a',
    desc: '아군 전체의 치명타 확률이 5초간 30%p 오른다.', art: 'sk_spiritsong', live: true,
  },
  /*
    ── 아래 둘은 **내가 지어낸 것**이다 ──

    사양에 자리만 있고 내용이 비어 있었다. 자리를 비워 두면 3단계를 찍은
    사람이 4단계에서 아무것도 못 찍는데, 그건 트리가 고장난 것으로 보인다.

    각자 제 갈래를 한 번 더 미는 쪽으로 지었다 — 이졸데의 수호신의 가호와
    아녜스의 넷이 다 그 모양이라 결이 맞는다. 바꾸실 것이 있으면 이 두
    덩이만 갈아 끼우면 된다.
  */
  {
    id: 'ea4a', who: 'elfarcher', tier: 4, name: '폭풍의 화살', kind: 'passive',
    rival: 'ea4b', needs: 'ea3a',
    desc: '화살비의 마지막 한 발이 터진다 — 맞은 적 주위 전체에 공격력의 80% 피해. '
      + '(제안: 사양이 비어 있어 지어냈습니다)',
    art: 'sk_stormarrow',
  },
  {
    id: 'ea4b', who: 'elfarcher', tier: 4, name: '숲의 합창', kind: 'passive',
    rival: 'ea4a', needs: 'ea3b',
    desc: '정령의 노래가 치명타 피해도 50%p 올리고 8초까지 간다. '
      + '(제안: 사양이 비어 있어 지어냈습니다)',
    art: 'sk_chorus',
  },
];

/*
  ── 아녜스 ── 적을 깎을까 아군을 지킬까.

  3-1 은 적 전체를 약하게 만들고 3-2 는 정화를 싸게 만든다. 4단계는 각자
  그 하나를 키운다 — 넷 다 패시브라 코스트 칸이 안 늘어난다.
*/
const AGNES: readonly TreeNode[] = [
  {
    id: 'nu1', who: 'nun', tier: 1, name: '기도', kind: 'active', cost: 6,
    desc: '아군 전체의 체력을 채운다.', art: 'sk_heal', live: true,
  },
  {
    id: 'nu2', who: 'nun', tier: 2, name: '정화', kind: 'active', cost: 20,
    desc: '걸려 있는 나쁜 것을 걷어낸다. 무엇을 걷을지는 고를 수 있다.',
    art: 'sk_purify', live: true,
  },
  {
    id: 'nu3a', who: 'nun', tier: 3, name: '신의 심판', kind: 'active', cost: 10,
    rival: 'nu3b',
    desc: '적 전체의 공격력을 5초간 20% 깎는다.', art: 'sk_judge', live: true,
  },
  {
    id: 'nu3b', who: 'nun', tier: 3, name: '정화의 손길', kind: 'passive',
    rival: 'nu3a',
    desc: '정화 코스트가 25% 줄어든다 (20 → 15).', art: 'sk_gentle', live: true,
  },
  {
    id: 'nu4a', who: 'nun', tier: 4, name: '신의 천벌', kind: 'passive',
    rival: 'nu4b', needs: 'nu3a',
    desc: '신의 심판이 적 공격속도도 30% 깎는다.', art: 'sk_wrath', live: true,
  },
  {
    id: 'nu4b', who: 'nun', tier: 4, name: '찬란한 빛', kind: 'passive',
    rival: 'nu4a', needs: 'nu3b',
    desc: '정화가 아군 전체에 걸린다. 걷힌 사람은 3초간 새 디버프에 안 걸린다 '
      + '([정화의 축복]).',
    art: 'sk_radiance',
  },
];

export const TREE: Record<CharId, readonly TreeNode[]> = {
  knightgirl: ISOLDE,
  bunnyaxe: BIANCA,
  elfarcher: RIANNE,
  nun: AGNES,
};

/** 그 사람의 트리 전부 */
export const treeOf = (who: CharId): readonly TreeNode[] => TREE[who] ?? [];

/** 이름표로 찾는다 — 모르는 이름표면 `null` (옛 세이브가 들고 있을 수 있다) */
export function nodeOf(who: CharId, id: NodeId): TreeNode | null {
  return treeOf(who).find((n) => n.id === id) ?? null;
}

/** 이 자리가 **갈래인가** — 짝이 있으면 찍어야 하고, 없으면 저절로 열린다 */
export const isPick = (n: TreeNode): boolean => !!n.rival;

/**
 * 지금 **실제로 걸려 있는** 자리들.
 *
 * 갈래가 아닌 자리는 성만 되면 들어간다. 갈래인 자리는 찍은 것만 들어가고,
 * 그마저도 성이 모자라면 빠진다 — 성이 내려갈 일은 없지만, 옛 세이브가
 * 4성짜리 자리를 찍어 둔 채로 2성일 수는 있다.
 */
export function activeNodes(
  who: CharId, star: number, picked: readonly NodeId[],
): TreeNode[] {
  const on = new Set(picked);
  return treeOf(who).filter((n) => (
    n.tier <= star && (isPick(n) ? on.has(n.id) : true)
  ));
}

/** 왜 못 찍나 — 찍을 수 있으면 `null` */
export function whyLocked(
  who: CharId, star: number, picked: readonly NodeId[], id: NodeId,
): string | null {
  const n = nodeOf(who, id);
  if (!n) return '없는 자리입니다';
  if (!isPick(n)) return '저절로 열리는 자리입니다';
  const on = new Set(picked);
  if (on.has(id)) return '이미 찍었습니다';
  if (star < n.tier) return `${n.tier}성이 되어야 합니다`;
  if (n.rival && on.has(n.rival)) {
    return `${nodeOf(who, n.rival)?.name ?? '다른 쪽'}을 찍어서 잠겼습니다`;
  }
  if (n.needs && !on.has(n.needs)) {
    return `${nodeOf(who, n.needs)?.name ?? '앞 단계'}를 먼저 찍어야 합니다`;
  }
  return null;
}

export const canPick = (
  who: CharId, star: number, picked: readonly NodeId[], id: NodeId,
): boolean => whyLocked(who, star, picked, id) === null;

/**
 * 저장된 것을 **믿지 않고** 다듬는다.
 *
 * 모르는 이름표 · 짝을 둘 다 찍은 것 · 앞 단계 없이 찍힌 것을 걷어낸다.
 * 단계 순서대로 다시 쌓으므로, 중간이 빠져 있으면 그 뒤가 통째로 빠진다 —
 * 트리를 고치는 날 옛 세이브가 말이 안 되는 상태로 남지 않게 한다.
 *
 * 성은 안 본다. 성이 모자란 것은 `activeNodes` 가 걸러 내고, 여기서 지우면
 * 성을 올리는 순간 다시 찍어야 한다.
 */
export function fixTree(who: CharId, raw: unknown): NodeId[] {
  const want = new Set(Array.isArray(raw) ? raw.filter((v) => typeof v === 'string') : []);
  const out: NodeId[] = [];
  const on = new Set<NodeId>();
  for (const n of treeOf(who)) {
    if (!isPick(n) || !want.has(n.id)) continue;
    if (n.rival && on.has(n.rival)) continue;
    if (n.needs && !on.has(n.needs)) continue;
    on.add(n.id);
    out.push(n.id);
  }
  return out;
}

/** 아직 안 찍은 갈래가 몇 개나 남았나 — 화면이 "찍을 것이 있다" 를 알릴 때 */
export function openPicks(who: CharId, star: number, picked: readonly NodeId[]): number {
  return treeOf(who).filter((n) => canPick(who, star, picked, n.id)).length;
}
