/**
 * 잠긴 콘텐츠와 해금 안내.
 *
 * ## 문제
 *
 * 잠금 판정이 **각 화면 안에** 흩어져 있었다. 심연은 들어가야만 "탑 30층을 깨야
 * 합니다" 를 알려 주고, 룬각인은 칸을 눌러야 "3티어 이상만" 이라고 말한다.
 * 그래서 두 가지가 동시에 안 됐다:
 *
 *   · 지도에서 **잠긴 곳인지 알 수 없다** — 걸어 들어가야 안다
 *   · 조건을 채워도 **아무도 안 알려 준다** — 3티어 무기를 처음 만든 사람은
 *     룬각인이라는 게 생겼다는 사실 자체를 모른다
 *
 * ## 여기 모아 둔 것
 *
 * 조건을 한 곳에 적어 두고 지도(잠금 표시)와 안내(해금 알림)가 같은 표를 읽는다.
 * 판정에 필요한 값은 스토어가 `UnlockCtx` 로 넘긴다 — core 는 스토어를 모른다.
 */
import type { TownStackParams } from './mapRoutes';
import { RIFT_UNLOCK_FLOOR } from './mapWorld';
import { RUNE_MIN_TIER } from './spirit';
import { ALCH_MIN_TIER } from './alchemy';

/** 잠금·해금 판정에 필요한 관측값. 스토어가 채워 넣는다 */
export interface UnlockCtx {
  /** 보스의탑 최고 클리어 층 */
  towerCleared: number;
  /** 가진 장비(착용 + 창고) 중 가장 높은 티어 */
  bestTier: number;
}

export type PlaceId = keyof TownStackParams;

export interface Gate {
  /** 잠기는 장소 */
  place: PlaceId;
  /** 한 줄 조건 */
  cond: string;
  /** 열리면 무엇을 할 수 있는가 */
  reward: string;
  open: (c: UnlockCtx) => boolean;
  /** "12 / 30층" 처럼 지금 어디까지 왔는지 */
  progress?: (c: UnlockCtx) => string;
}

/**
 * 잠긴 장소.
 *
 * 여기 없는 장소는 항상 열려 있다. 목록을 "잠긴 것만" 으로 두는 게 중요하다 —
 * 전부 적어 두면 새 장소를 추가할 때 여기 등록하는 걸 빼먹고, 그러면 멀쩡한
 * 장소가 조용히 잠긴다.
 */
export const GATES: Gate[] = [
  {
    place: 'Abyss',
    cond: `보스의탑 ${RIFT_UNLOCK_FLOOR}층 클리어`,
    reward: '갈라진 땅이 열립니다 — 심연에 내려가 연성 재료를 건져 올 수 있습니다.',
    open: (c) => c.towerCleared >= RIFT_UNLOCK_FLOOR,
    progress: (c) => `${Math.min(c.towerCleared, RIFT_UNLOCK_FLOOR)} / ${RIFT_UNLOCK_FLOOR}층`,
  },
  {
    place: 'Alchemist',
    cond: `보스의탑 ${RIFT_UNLOCK_FLOOR}층 클리어`,
    reward: '연금술사가 심연에서 건진 재료를 연성액으로 녹여 줍니다.',
    open: (c) => c.towerCleared >= RIFT_UNLOCK_FLOOR,
    progress: (c) => `${Math.min(c.towerCleared, RIFT_UNLOCK_FLOOR)} / ${RIFT_UNLOCK_FLOOR}층`,
  },
];

export const gateOf = (place: string): Gate | null =>
  GATES.find((g) => g.place === place) ?? null;

/** 이 장소가 지금 잠겨 있는가 */
export function isLocked(place: string, c: UnlockCtx): boolean {
  const g = gateOf(place);
  return !!g && !g.open(c);
}

// ── 해금 안내 ──────────────────────────────────────────

/**
 * "이제 이걸 할 수 있습니다" 안내.
 *
 * 장소 잠금과 **다른 축**이다. 룬각인은 엘프의 집에 아무 때나 들어갈 수 있지만
 * 3티어 장비가 없으면 할 수 있는 게 없다 — 장소가 잠긴 게 아니라 **자격이 없는**
 * 것이다. 자격이 생기는 순간을 잡아 알려 준다.
 *
 * 한 번만 뜬다 (스토어의 `guidesSeen`). 매번 뜨면 안내가 아니라 방해다.
 */
export interface Guide {
  id: string;
  title: string;
  body: string;
  /** 어디로 가라는 것인가 — 팝업이 이 이름을 적는다 */
  where: string;
  ready: (c: UnlockCtx) => boolean;
}

export const GUIDES: Guide[] = [
  {
    id: 'rune',
    title: '룬각인을 새길 수 있습니다',
    body: `${RUNE_MIN_TIER}티어(철) 이상 장비를 손에 넣었습니다. 정령석을 사서 장비에 새기면 `
      + '아이템레벨이 오르고 특성이 하나 붙습니다. 같은 특성을 여러 칸에 모으면 세트 효과가 붙습니다.',
    where: '정령의 숲 › 엘프의 집',
    ready: (c) => c.bestTier >= RUNE_MIN_TIER,
  },
  {
    id: 'alchemy',
    title: '연성을 부여할 수 있습니다',
    body: `${ALCH_MIN_TIER}티어(백금) 이상 장비를 손에 넣었습니다. 연성액을 부으면 `
      + '아이템레벨 전체에 배수가 곱해집니다 — 각인과 달리 장비 전체를 끌어올립니다.',
    where: '갈라진 땅 › 연금술사의 천막',
    ready: (c) => c.bestTier >= ALCH_MIN_TIER,
  },
];

/** 지금 띄워야 할 안내 (조건을 채웠고 아직 안 본 것). 없으면 null */
export function pendingGuide(c: UnlockCtx, seen: readonly string[]): Guide | null {
  return GUIDES.find((g) => g.ready(c) && !seen.includes(g.id)) ?? null;
}
