/**
 * 전투 화면이 잠깐 들고 있는 값들 — **저장되지 않는 작은 스토어.**
 *
 * ## 왜 게임 스토어에 안 두나
 *
 * 스킬 코스트 칸을 잠깐 `useGame` 에 뒀더니 화면이 버벅였다. 게임 스토어는
 * `persist` 를 물고 있어서, **값이 바뀔 때마다 상태 전체를 JSON 으로 만든다** —
 * 저장을 2초로 묶어 놨어도(`storage.ts`) 직렬화 자체는 매번 돈다. 장비·의뢰·
 * 길드까지 다 들어 있는 덩어리를 초당 몇 번씩 문자열로 만드는 셈이다.
 *
 * 코스트 칸은 화면이 꺼지면 같이 사라져야 하는 값이라 저장할 이유도 없었다.
 * 그래서 저장을 안 하는 스토어를 따로 둔다 — 여기 값은 아무리 자주 바뀌어도
 * 직렬화가 안 일어난다.
 *
 * ## 그런데 왜 지역 상태로는 안 되나
 *
 * 무대(`BattleView`)가 세고 파티 칸(`PartyBar`)이 그린다. 둘은 형제라 서로의
 * 상태를 못 본다. 공통 부모까지 올리면 그 사이의 모든 화면이 초당 몇 번씩
 * 다시 그려진다 — 스토어가 그 일을 안 하고 필요한 둘만 다시 그린다.
 *
 * ## 세는 곳은 여기가 아니다
 *
 * 실제로 코스트를 세는 것은 `Fighter` 다 (제 스윙 순환 안에서). 여기는 그
 * 사람이 **밀어 넣어 주는 것을 받아 두는 자리**다.
 *
 * 한동안 두 곳에서 따로 셌다 — `Fighter` 안의 스윙 횟수와, 여기의 `charge`.
 * 둘이 같은 규칙을 두 번 구현하고 있었으므로 언젠가는 어긋날 수밖에 없었다.
 * 이제 세는 곳이 하나고, 여기는 **그려 주기만** 한다.
 */
import { create } from 'zustand';

interface BattleUi {
  /**
   * 사람별 스킬 코스트 — **기술 자리마다 하나씩** (`core/chars` 의 `Charge`).
   *
   * 예전에는 사람당 숫자 하나였다. 기술이 하나뿐일 때는 같은 말이지만, 4 짜리와
   * 20 짜리를 같이 가지면 칸 하나로는 무엇이 차고 있는지 말할 수가 없다.
   */
  charge: Record<string, readonly number[]>;
  /** `Fighter` 가 제 칸을 밀어 넣는다. 같은 값이면 아무 일도 안 한다 */
  setCharge: (who: string, on: readonly number[]) => void;

  /**
   * **돌아선 아군이 방금 친 사람** (24 · 29판 — `BattleState.charm`).
   *
   * 무대는 이걸 못 알아낸다. 누구를 칠지는 계산이 그 자리에서 무작위로
   * 고르고 (`core/autoBattle` 의 `applyHit`), 무대가 보는 것은 그 결과인
   * 체력 기록뿐이라 "줄었다" 까지만 안다 — 우두머리가 친 것인지 우리 편이
   * 친 것인지가 안 갈린다.
   *
   * 그래서 **계산을 부른 쪽이** 넣어 준다 (`slices/roster` 의 `strikeFoe`).
   * 저장되는 값이 아니고 그 순간의 신호라, 코스트 칸과 같은 자리가 맞다.
   *
   * `no` 는 같은 사람이 연달아 맞아도 무대가 알아보게 하는 번호다.
   */
  charmHit: { id: string; no: number } | null;
  hitByAlly: (id: string) => void;
}

export const useBattleUi = create<BattleUi>((set) => ({
  charge: {},
  charmHit: null,

  hitByAlly: (id) => set((st) => ({
    charmHit: { id, no: (st.charmHit?.no ?? 0) + 1 },
  })),

  setCharge: (who, on) => set((st) => {
    /*
      **같으면 안 건드린다.**

      스윙마다 부르는데, 코스트가 다 차서 멈춰 있으면 (`chargeUp` 이 제 값에서
      멈춘다) 같은 배열이 계속 들어온다. 그때마다 새 객체를 만들면 파티 칸 넷이
      아무것도 안 바뀐 채로 다시 그려진다.
    */
    const was = st.charge[who];
    if (was && was.length === on.length && was.every((v, i) => v === on[i])) return st;
    return { charge: { ...st.charge, [who]: on } };
  }),
}));
