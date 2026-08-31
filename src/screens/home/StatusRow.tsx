/**
 * 걸린 사람 **머리 위**에 뜨는 상태 로고 줄.
 *
 * ## 왜 머리 위인가
 *
 * 파티 칸에 몰아 놓을 수도 있었다. 그런데 상태는 **누구에게 걸렸느냐가 전부**
 * 다 — 출혈이 앞사람에게 걸린 것과 사제에게 걸린 것은 완전히 다른 상황이고,
 * 목록에서 이름을 찾아 읽는 사이에 상황이 끝난다. 걸린 사람 위에 붙어 있으면
 * 찾을 일이 없다.
 *
 * ## 좋고 나쁨은 자리로 말한다
 *
 * 흑백 2색이라 초록·빨강 테두리를 쓸 수 없다 (`ui/theme`). 그래서 **좋은 것은
 * 왼쪽, 나쁜 것은 오른쪽**으로 갈라 놓는다. 로고 자체는 무엇인지만 말하고
 * (`core/status`), 좋고 나쁨은 어디에 있느냐가 말한다.
 *
 * 나쁜 것을 오른쪽에 두는 이유는 그쪽이 적이 있는 방향이기 때문이다 — 나쁜
 * 일은 저기서 온다.
 *
 * ## 아직 그림이 없으면 아무것도 안 그린다
 *
 * `assets/sprites/status_icon/` 가 아직 없다. `Sprite` 는 없는 세트에
 * `fallback` 을 안 주면 아무것도 안 그리므로 (`ui/Sprite`), 그림이 도착하는
 * 순간 저절로 붙고 그때까지는 자리만 비어 있다. 코드는 안 고쳐도 된다.
 */
import React from 'react';
import { View } from 'react-native';
import { GOOD, StatusId } from '@/core/status';
import { Sprite } from '@/ui/Sprite';

/**
 * 로고 하나의 크기.
 *
 * 인물이 40~52px 인데 그 위에 얹히므로 이보다 크면 인물을 가린다. 12px 은
 * 로고를 그릴 때 기준으로 삼은 크기이기도 하다 (`docs/STATUS_ICON_PROMPTS.md`).
 */
const ICON = 12;

/** 한 줄에 몇 개까지 — 넘치면 인물 폭을 넘어 옆 사람 위로 간다 */
const CAP = 4;

export function StatusRow({
  status, size,
}: {
  status: readonly StatusId[];
  /** 인물의 크기. 로고 줄이 그 머리 바로 위에 앉는다 */
  size: number;
}) {
  if (!status.length) return null;

  /*
    좋은 것과 나쁜 것을 갈라 세운다. 넘치면 앞에서부터 자른다 — 다섯 개가
    걸린 순간 줄이 인물보다 길어져서 누구 것인지 안 보이게 된다.
  */
  const good = status.filter((s) => GOOD.has(s)).slice(0, CAP);
  const bad = status.filter((s) => !GOOD.has(s)).slice(0, CAP);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        /* 머리 바로 위. 말풍선(`SkillShout`)은 이보다 더 위에 뜬다 */
        bottom: size + 2,
        /* 인물보다 넓어도 되게 좌우로 넘겨 둔다 */
        left: -14,
        right: -14,
        flexDirection: 'row',
        /* 좋은 것 왼쪽 · 나쁜 것 오른쪽 — 사이를 벌려 두 무리로 읽히게 */
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 44,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {good.map((s) => <Sprite key={s} set="status_icon" name={s} size={ICON} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {bad.map((s) => <Sprite key={s} set="status_icon" name={s} size={ICON} />)}
      </View>
    </View>
  );
}
