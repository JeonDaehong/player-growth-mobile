/**
 * 걸려 있는 상태 로고 줄 — **파티 칸 안**, 체력 바로 아래.
 *
 * ## 무대 위에서 여기로 옮겼다
 *
 * 처음에는 걸린 사람 머리 위에 띄웠다. "누구에게 걸렸느냐가 전부" 라는 이유
 * 였는데, 실제로 켜 보니 40~52px 인물 위에 12px 짜리가 얹히면서 인물을 가리고
 * 피해 숫자·말풍선과 같은 자리를 다퉜다. 머리 위는 이미 붐비는 자리다.
 *
 * 파티 칸에는 이미 그 사람의 **지금 상태**가 다 모여 있다 — 남은 체력, 스킬이
 * 몇 칸 찼나. 걸려 있는 것도 같은 종류의 정보라 여기 있는 게 맞고, 자리가
 * 넓어서 여럿이 걸려도 줄이 안 무너진다.
 *
 * ## 있든 없든 높이가 같다
 *
 * 아무것도 안 걸렸을 때 줄을 지우면, 상태가 붙었다 풀릴 때마다 파티 칸 전체가
 * 위아래로 들썩인다. 네 칸이 나란히 있으므로 한 사람만 걸려도 넷의 높이가
 * 어긋난다.
 *
 * 그래서 **줄은 늘 있고 내용만 바뀐다** (`ROW_H`). 빈 줄은 눈에 안 띄지만
 * 자리를 지킨다.
 *
 * ## 좋고 나쁨은 순서로 말한다
 *
 * 흑백 2색이라 초록·빨강 테두리를 못 쓴다 (`ui/theme`). 무대에 있을 때는
 * 왼쪽/오른쪽 끝으로 갈랐는데, 파티 칸은 폭이 좁아서 하나만 걸리면 한쪽에
 * 치우쳐 보인다. 여기서는 **가운데 모아 놓고 좋은 것을 먼저** 둔다.
 *
 * ## 두 세트가 섞인다
 *
 * 패시브가 거는 것은 **패시브 로고**로, 우두머리가 거는 것은 **상태 로고**로
 * 뜬다 (`core/passives` 의 `marksOf` 에 이유가 있다). 그래서 칸마다 어느
 * 폴더에서 꺼낼지를 같이 들고 온다.
 *
 * ## 나쁜 것에 자리를 먼저 준다
 *
 * 칸 폭이 86px 남짓이라 여섯 개가 안 들어간다. 넘치면 잘리는데, 잘리는 것이
 * 하필 제일 끝(나쁜 것)이면 **정작 대응해야 할 것이 안 보인다.**
 *
 * 그래서 나쁜 것을 셋까지 먼저 잡고, 남는 자리에 좋은 것을 넣는다. 패시브는
 * 판이 끝날 때까지 안 바뀌는 것이라 한둘이 밀려도 잃는 게 적다 — 궁금하면
 * 캐릭터 창에 다 적혀 있다.
 */
import React from 'react';
import { View } from 'react-native';
import { Mark } from '@/core/passives';
import { Sprite } from '@/ui/Sprite';
import { BLACK, WHITE } from '@/ui/theme';

/**
 * 로고 하나의 크기.
 *
 * 파티 칸 하나가 화면 폭의 4분의 1 이라 80px 남짓이다. 칸까지 합쳐 14px 이면
 * 넷이 나란히 들어가고도 남는다.
 */
const ICON = 10;

/** 칸의 안쪽 여백 — 로고가 테두리에 닿으면 둘이 한 덩어리로 뭉갠다 */
const PAD = 1;

/**
 * 줄이 차지하는 높이. **늘 이만큼이다.**
 *
 * 로고(10) + 안쪽 여백(1x2) + 테두리(1x2) = 14 에 숨 쉴 틈 2 를 더했다.
 */
export const ROW_H = 16;

/**
 * 한 줄에 몇 개까지.
 *
 * 칸 하나가 86px 남짓이고 로고 하나가 테두리까지 14px, 사이가 2px 다.
 * 넷이면 65px 로 넉넉하고 다섯이면 81px 로 아슬아슬하다. 넷에서 끊는다.
 */
const CAP = 4;

/** 그중 나쁜 것이 차지할 수 있는 몫 — 남는 자리를 좋은 것이 쓴다 */
const BAD_CAP = 3;

/**
 * 로고 한 칸.
 *
 * 테두리가 있는 이유: 로고만 있으면 화면에 얹힌 것이 아니라 **새어 나온
 * 것**처럼 보인다. 칸이 있으면 "여기는 상태가 붙는 자리다" 가 먼저 읽히고,
 * 하나만 걸려 있어도 빈자리가 아니라 한 칸이 찬 것으로 보인다.
 *
 * 안을 검게 채우는 것은 파티 칸의 테두리와 겹쳐 뜨기 때문이다.
 */
function Slot({ mark }: { mark: Mark }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: WHITE,
        backgroundColor: BLACK,
        padding: PAD,
      }}
    >
      {/* 세트를 칸이 들고 온다 — 패시브 로고와 상태 로고가 섞여 뜬다 */}
      <Sprite set={mark.set} name={mark.name} size={ICON} />
    </View>
  );
}

export function StatusRow({ status }: { status: readonly Mark[] }) {
  /* 나쁜 것이 먼저 자리를 잡는다 — 넘쳐서 잘리면 안 되는 쪽이다 */
  const bad = status.filter((s) => !s.good).slice(0, BAD_CAP);
  const good = status.filter((s) => s.good).slice(0, Math.max(0, CAP - bad.length));

  return (
    <View
      pointerEvents="none"
      style={{
        /*
          **비어 있어도 이 높이를 지킨다.** 지우면 상태가 붙었다 풀릴 때마다
          파티 칸 넷의 높이가 서로 어긋난다.
        */
        height: ROW_H,
        marginTop: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {good.map((s, i) => <Slot key={`g${s.set}${s.name}${i}`} mark={s} />)}
      {/* 좋은 것과 나쁜 것 사이만 조금 더 벌린다 — 두 무리로 읽히게 */}
      {!!good.length && !!bad.length && <View style={{ width: 3 }} />}
      {bad.map((s) => <Slot key={`b${s.name}`} mark={s} />)}
    </View>
  );
}
