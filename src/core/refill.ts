/**
 * 다이아 충전 — 체력과 투기장 티켓.
 *
 * 이 게임에서 사람을 멈춰 세우는 건 돈이 아니라 **시간**이다. 체력은 10분에 1,
 * 투기장 티켓은 한 시간에 1. 다 쓰고 나면 할 게 없어서 앱을 끄고, 그러면 그날은
 * 안 돌아온다. 다이아로 그 벽을 한 번씩 넘게 해 준다.
 *
 * ## 값이 올라가는 이유
 *
 * 정액이면 다이아를 가진 사람이 시간을 통째로 사 버린다 — 하루에 스무 번 채우면
 * 체력이라는 개념 자체가 없어지고, 안 사는 사람 입장에서는 게임이 두 개가 된다.
 * 살 때마다 값이 오르면 **첫 한두 번은 싸고, 계속 사는 건 비싸다.** 오늘 한 판 더
 * 하려는 사람은 싸게 사고, 하루를 통째로 사려는 사람은 그만큼 낸다.
 *
 * 체력은 배로 뛰고(10 → 20 → 40 …) 티켓은 완만하게 오른다(50 → 100 → 150 …).
 * 체력은 열 번까지 열려 있어 뒤로 갈수록 확실히 막아야 하고, 티켓은 다섯 번뿐이라
 * 횟수 자체가 이미 벽이기 때문이다.
 *
 * ## 자정에 리셋된다
 *
 * 산 횟수는 날짜가 바뀌면 0으로 돌아간다 — 값도 첫 칸으로 내려온다.
 * 어제 열 번 산 사람이 오늘 5,120부터 시작하면 그건 벌이지 충전이 아니다.
 */

export type RefillKind = 'stamina' | 'ticket';

export interface RefillDef {
  kind: RefillKind;
  name: string;
  desc: string;
  /** 살 때마다의 값 (다이아). 길이가 곧 하루 최대 횟수 */
  prices: readonly number[];
}

export const REFILLS: Record<RefillKind, RefillDef> = {
  stamina: {
    kind: 'stamina',
    name: '체력 회복',
    desc: '체력을 가득 채웁니다.',
    // 10 부터 배로 — 열 번째는 5,120 이라 사실상 여기서 멈춘다
    prices: [10, 20, 40, 80, 160, 320, 640, 1_280, 2_560, 5_120],
  },
  ticket: {
    kind: 'ticket',
    name: '투기장 티켓',
    desc: '전투 참여 티켓을 가득 채웁니다.',
    // 50 부터 완만하게. 마지막 칸만 한 번 더 뛴다 (250 이 아니라 300)
    prices: [50, 100, 150, 200, 300],
  },
};

export const REFILL_KINDS: RefillKind[] = ['stamina', 'ticket'];

/** 하루 최대 횟수 */
export const refillMax = (k: RefillKind) => REFILLS[k].prices.length;

/**
 * 오늘 `used` 번 산 사람의 다음 값. 한도를 다 썼으면 null.
 *
 * null 을 값 0 대신 쓰는 게 중요하다 — 0 을 돌려주면 화면이 "공짜" 로 그린다.
 */
export function refillPrice(k: RefillKind, used: number): number | null {
  const { prices } = REFILLS[k];
  return used >= 0 && used < prices.length ? prices[used] : null;
}

/** 오늘 몇 번 더 살 수 있는가 */
export const refillLeft = (k: RefillKind, used: number) =>
  Math.max(0, refillMax(k) - Math.max(0, used));

/**
 * 오늘 산 횟수.
 *
 * 저장된 날짜 키가 오늘이 아니면 **0으로 본다.** 자정을 넘긴 걸 감지해서 값을
 * 지우는 타이머를 두는 대신, 읽을 때마다 날짜를 대조한다 — 앱이 꺼져 있는 동안
 * 자정이 지나가는 게 정상이라, 타이머로는 어차피 못 잡는다.
 */
export function usedToday(
  rec: { dayKey: string; stamina: number; ticket: number },
  k: RefillKind,
  todayKey: string,
): number {
  if (rec.dayKey !== todayKey) return 0;
  return Math.max(0, k === 'stamina' ? rec.stamina : rec.ticket);
}
