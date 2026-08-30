import React from 'react';
import { View } from 'react-native';
import { TITLES, TitleId, rarityOf } from '@/core/titles';
import { T } from './atoms';
import { Sprite } from './Sprite';
import { ICONS } from './sprites';
import { BORDER, C, SP, WHITE } from './theme';

/**
 * 칭호 이름표.
 *
 * ## 반짝임을 전부 걷어냈다
 *
 * 예전엔 희소도마다 애니메이션이 붙어 있었다 — 1등급은 테두리가 밝아졌다 어두워지고,
 * 2등급은 배경이 1.8초마다 흑백으로 뒤집히고, 3등급은 빛줄기가 훑고 지나갔다.
 * 하나만 떠 있을 때는 그럴듯했는데, 실제로 이 이름표가 붙는 자리는 **순위표 서른 줄과
 * 채팅 스크롤**이다. 화면 하나에 열댓 개가 각자 다른 주기로 명멸하니 눈이 아파서
 * 정작 이름을 못 읽었다. 2등급의 배경 반전이 특히 나빴다 — 글자가 검정↔흰색을
 * 오가느라 읽는 동안 계속 깜빡였다.
 *
 * 등급은 **정적인 것으로도 충분히 갈린다.** 흑백 2색에서 쓸 수 있는 축은 셋이고,
 * 셋 다 가만히 있어도 눈에 띈다:
 *
 *   0 일반 — 얇은 테두리
 *   1 희귀 — 얇은 테두리 + 앞에 표식 하나
 *   2 영웅 — 굵은 테두리 + 표식
 *   3 전설 — 통째로 반전 (검은 글씨에 흰 바탕). 가만히 있어도 제일 먼저 보인다
 *
 * 3등급을 **영구 반전**으로 둔 게 핵심이다. 예전에 2등급이 1.8초마다 하던 그 모습인데,
 * 깜빡이지 않으니 읽히면서도 확실히 튄다. 3등급은 전 서버 한 명짜리라 화면에
 * 여러 개가 뜰 일이 없으므로 이 정도로 세게 줘도 시끄럽지 않다.
 *
 * 덤으로 이 파일에서 reanimated 가 통째로 빠졌다 — 순위표 한 줄마다 돌던
 * 반복 애니메이션 서른 개가 사라졌다.
 */

/** 희소도 앞에 붙는 표식. 0 은 아무것도 안 붙인다 */
const MARK: Record<number, string> = { 0: '', 1: '·', 2: '◆', 3: '★' };

export function TitleTag({
  id, size = 11, showIcon = true,
}: { id: TitleId; size?: number; showIcon?: boolean }) {
  const r = rarityOf(id);
  const def = TITLES[id];
  /** 3등급만 반전 — 흰 바탕에 검은 글씨 */
  const inv = r === 3;
  const fg = inv ? C.fgInv : WHITE;

  return (
    <View
      style={[
        BORDER,
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 5,
          paddingVertical: 2,
          // 굵은 테두리는 2등급부터. 1등급까지 굵게 하면 굵기가 등급을 못 가른다
          borderWidth: r >= 2 ? 2 : 1,
          backgroundColor: inv ? C.bgInv : 'transparent',
        },
      ]}
    >
      {showIcon && (
        <View style={{ marginRight: 3 }}>
          <Sprite set="title" name={id} size={size + 4} tint={fg} fallback={ICONS.badge} />
        </View>
      )}
      {/*
        표식은 아이콘이 없을 때 특히 값을 한다 — 순위표 한 줄에서는 자리가 좁아
        아이콘을 끄고 쓰는데(showIcon={false}), 그때 등급을 말해 주는 건 이 글자와
        테두리 굵기뿐이다.
      */}
      {!!MARK[r] && (
        <T size={size - 2} bold style={{ marginRight: 2, color: fg }}>{MARK[r]}</T>
      )}
      <T size={size} bold style={{ color: fg }}>{def.name}</T>
    </View>
  );
}

/** 희소도 설명 (칭호 목록에서 왜 다르게 보이는지 알려 준다) */
export const RARITY_LABEL: Record<number, string> = {
  0: '',
  1: '희귀',
  2: '영웅',
  3: '전설',
};
export { SP };
