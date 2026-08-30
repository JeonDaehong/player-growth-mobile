/**
 * 전투 화면이 잠깐 들고 있는 값들 — **저장되지 않는 작은 스토어.**
 *
 * ## 왜 게임 스토어에 안 두나
 *
 * 스킬 충전 칸을 잠깐 `useGame` 에 뒀더니 화면이 버벅였다. 게임 스토어는
 * `persist` 를 물고 있어서, **값이 바뀔 때마다 상태 전체를 JSON 으로 만든다** —
 * 저장을 2초로 묶어 놨어도(`storage.ts`) 직렬화 자체는 매번 돈다. 장비·의뢰·
 * 길드까지 다 들어 있는 덩어리를 초당 몇 번씩 문자열로 만드는 셈이다.
 *
 * 충전 칸은 화면이 꺼지면 같이 사라져야 하는 값이라 저장할 이유도 없었다.
 * 그래서 저장을 안 하는 스토어를 따로 둔다 — 여기 값은 아무리 자주 바뀌어도
 * 직렬화가 안 일어난다.
 *
 * ## 그런데 왜 지역 상태로는 안 되나
 *
 * 무대(`BattleView`)가 세고 파티 칸(`PartyBar`)이 그린다. 둘은 형제라 서로의
 * 상태를 못 본다. 공통 부모까지 올리면 그 사이의 모든 화면이 초당 몇 번씩
 * 다시 그려진다 — 스토어가 그 일을 안 하고 필요한 둘만 다시 그린다.
 */
import { create } from 'zustand';
import { skillOf } from '@/core/chars';

interface BattleUi {
  /** 사람별로 지금까지 친 평타 수 (0 ~ every-1) */
  charge: Record<string, number>;
  /** 평타 한 번 = 한 칸. 다 차면 더 안 올라간다 */
  bumpCharge: (who: string) => void;
  /** 기술이 나갔다 — 처음부터 다시 센다 */
  resetCharge: (who: string) => void;
}

export const useBattleUi = create<BattleUi>((set) => ({
  charge: {},

  bumpCharge: (who) => set((st) => ({
    charge: {
      ...st.charge,
      /* 다 차면 멈춘다 — 넘치면 화면의 칸 수보다 많아진다 */
      [who]: Math.min(skillOf(who).every - 1, (st.charge[who] ?? 0) + 1),
    },
  })),

  resetCharge: (who) => set((st) => ({ charge: { ...st.charge, [who]: 0 } })),
}));
