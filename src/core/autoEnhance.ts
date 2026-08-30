/**
 * 자동 강화.
 *
 * 여러 장비를 한꺼번에 골라 목표 강화 수치까지 자동으로 두들긴다.
 * 손으로 하면 "강화 → 결과 확인 → 다시 강화" 를 수백 번 반복해야 하는 일이라,
 * 그 반복이 게임이 아니라 노동이 된 지 오래다.
 *
 * ## 동시성 — 이 파일의 존재 이유
 *
 * "병렬로 강화한다" 는 말은 **재화를 동시에 쓴다**는 뜻이다. 장비 셋을 나란히
 * 돌리면서 각자 소지금을 확인하고 각자 차감하면, 셋 다 "돈이 있다" 를 보고
 * 셋 다 차감해 **잔고가 음수로 내려간다.** 화면에서 세 개의 타이머를 돌리는
 * 방식으로 만들면 반드시 이 사고가 난다.
 *
 * 그래서 여기서는 **한 번에 한 대씩** 두들긴다. 순서만 돌아가며 바뀔 뿐,
 * 어느 순간에도 강화는 하나다. 사람 눈에는 셋이 같이 오르는 것처럼 보이고
 * (한 판에 한 대씩 번갈아 친다), 재화는 단 한 곳에서만 줄어든다.
 *
 * 이 모듈은 **순수 함수**다 — 한 번의 두들김을 계산해서 "무엇이 어떻게 바뀌었나"
 * 를 돌려줄 뿐, 스토어를 건드리지 않는다. 스토어는 그 결과를 한 번의 `set` 으로
 * 반영한다. 그래야 중간에 끼어들 자리가 없다.
 */
import { Item, ScrollId } from './types';
import { TIERS, isArtisan } from './tiers';
import { canEnhance, enhanceCost } from './enhance';

/**
 * 자동 강화 목표로 세울 수 있는 가장 높은 수치.
 *
 * ## 장인 무구는 왜 다른가
 *
 * 일반 장비는 `maxLevel` 이 15 라 목표를 그 위로 잡을 이유가 없다. 그런데
 * 장인 무구는 `maxLevel: Infinity` 다 — 끝없이 두들길 수 있다 (`core/tiers`).
 * 그런데도 화면은 둘 다 15 로 막고 있었다. **엔진은 되는데 UI 만 막고 있던**
 * 자리고, 그래서 +15 짜리 장인 무구에 자동 강화를 걸 방법이 없었다.
 *
 * ## 왜 무한이 아니라 100 인가
 *
 * 목표는 사람이 화면에서 고르는 값이라 어딘가에서 끊어야 슬라이더와 진행률
 * 막대가 성립한다. 100 은 `docs/ITEM_LEVEL_TABLE.md` 가 장인 무구를 계산해 둔
 * 범위와 같다. 더 올리고 싶으면 100 까지 돌린 뒤 한 번 더 걸면 된다 —
 * 이건 규칙이 아니라 한 판의 크기다.
 */
export const ARTISAN_GOAL_MAX = 100;

/**
 * 이 장비에 걸 수 있는 목표 상한.
 *
 * `TIERS[...].maxLevel` 을 그대로 쓰면 장인은 `Infinity` 가 나와서 슬라이더가
 * 깨진다. 그 한 곳만 유한한 값으로 바꿔 준다.
 */
export function autoGoalMax(item: Item | null): number {
  if (!item) return 15;
  return isArtisan(item.tier) ? ARTISAN_GOAL_MAX : TIERS[item.tier].maxLevel;
}

/** 자동 강화가 멈추는 이유 */
export type AutoStop =
  /** 고른 장비가 전부 목표에 도달 */
  | 'done'
  /** 돈이 모자라 다음 한 대를 못 친다 */
  | 'money'
  /** 고른 장비가 전부 파괴됐다 */
  | 'destroyed'
  /** 사람이 멈췄다 */
  | 'cancel';

export const STOP_MSG: Record<AutoStop, string> = {
  done: '목표 강화 수치에 전부 도달했습니다',
  money: '강화 비용이 부족해 멈췄습니다',
  destroyed: '고른 장비가 모두 파괴됐습니다',
  cancel: '자동 강화를 멈췄습니다',
};

/** 한 대상의 진행 상황 */
export interface AutoTarget {
  /** 장비가 들어 있던 슬롯 */
  slot: string;
  /** 목표 강화 수치 */
  goal: number;
  /** 시작할 때의 강화 수치 — 얼마나 왔는지 보여 주려고 들고 있는다 */
  from: number;
  /** 파괴됐는가 */
  broken?: boolean;
}

/**
 * 다음에 두들길 대상.
 *
 * **가장 덜 온 것부터** 친다. 순서대로 돌면 앞의 장비가 목표에 닿을 때까지
 * 뒤의 장비는 한 대도 못 맞고, 그러면 "여러 개를 같이 올린다" 가 거짓말이 된다.
 * 진행률이 같으면 목록 순서를 지킨다 (결과가 재현 가능해야 테스트가 된다).
 *
 * @returns 대상의 인덱스. 더 칠 것이 없으면 -1
 */
export function nextTarget(items: (Item | null)[], targets: AutoTarget[]): number {
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < targets.length; i++) {
    const it = items[i];
    const t = targets[i];
    if (!it || t.broken) continue;
    if (it.level >= t.goal) continue;
    if (!canEnhance(it)) continue;
    /* 목표까지 남은 칸 수가 적을수록 뒤로 — 덜 온 것을 먼저 친다 */
    const score = (it.level - t.from) / Math.max(1, t.goal - t.from);
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return best;
}

/** 지금 멈춰야 하는가. 멈출 이유가 없으면 null */
export function stopReason(
  items: (Item | null)[],
  targets: AutoTarget[],
  money: number,
  scroll: ScrollId | null,
): AutoStop | null {
  const alive = targets.filter((t, i) => items[i] && !t.broken);
  if (!alive.length) return 'destroyed';
  const idx = nextTarget(items, targets);
  if (idx < 0) return 'done';
  if (money < enhanceCost(items[idx]!, scroll)) return 'money';
  return null;
}

/**
 * 목표까지 드는 **최소** 비용.
 *
 * 실행 전에 "이만큼은 있어야 시작할 수 있다" 를 판단하는 값이다.
 * 강화는 실패하면 단계가 안 오르므로 실제로는 이보다 훨씬 많이 든다 —
 * 그래서 이건 **하한**이고, 화면은 그 사실을 같이 적어야 한다.
 *
 * 한 번도 안 실패하고 목표까지 올라갔을 때의 비용 합이다.
 *
 * ⚠ **주문서 값은 안 센다.** 주문서는 상점에서 이미 산 물건이라 강화할 때 다시
 * 돈이 나가지 않는다 (`state/slices/gear.ts` 의 `autoEnhanceStep` 참고).
 * 예전에는 `enhanceCost(probe, scroll)` 로 주문서 가격을 얹어서, 화면이 실제보다
 * 훨씬 큰 금액을 요구하고 시작 버튼이 괜히 꺼져 있었다.
 */
export function minCost(items: (Item | null)[], targets: AutoTarget[]): number {
  let sum = 0;
  for (let i = 0; i < targets.length; i++) {
    const it = items[i];
    if (!it) continue;
    const goal = Math.min(targets[i].goal, TIERS[it.tier].maxLevel);
    let probe = it;
    while (probe.level < goal) {
      sum += enhanceCost(probe, null);
      probe = { ...probe, level: probe.level + 1 };
    }
  }
  return sum;
}

/** 고른 장비들이 목표까지 남긴 총 칸 수 (진행률 표시용) */
export function stepsLeft(items: (Item | null)[], targets: AutoTarget[]): number {
  let n = 0;
  for (let i = 0; i < targets.length; i++) {
    const it = items[i];
    if (!it || targets[i].broken) continue;
    n += Math.max(0, targets[i].goal - it.level);
  }
  return n;
}

/** 처음 목표까지 쳐야 했던 총 칸 수 */
export function stepsTotal(targets: AutoTarget[]): number {
  return targets.reduce((a, t) => a + Math.max(0, t.goal - t.from), 0);
}
