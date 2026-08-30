/**
 * "이제 이걸 할 수 있습니다" 안내.
 *
 * 이 게임은 콘텐츠가 **조용히 열린다.** 3티어 무기를 처음 만들면 그 순간부터
 * 룬각인을 새길 수 있는데, 아무도 그 사실을 말해 주지 않았다 — 엘프의 집에
 * 들어가 칸을 눌러 봐야 "3티어 이상만" 이라는 안내가 없어진 걸로 눈치채는 식이다.
 * 열린 줄 모르는 콘텐츠는 없는 콘텐츠와 같다.
 *
 * 조건과 문구는 `core/unlock` 의 `GUIDES` 에 있다. 여기서는 **띄우는 시점**만 맡는다.
 *
 * ## 언제 뜨는가
 *
 * 조건이 채워지는 순간이 아니라 **그다음 조용한 순간**이다. 강화 성공 팝업이
 * 떠 있는 위에 안내를 겹쳐 띄우면 둘 다 못 읽는다. 그래서 팝업이 하나도 없을 때만
 * 뜨도록 앱 루트에 두고, 튜토리얼·이벤트 안내보다 뒤에 세운다.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { useUnlockCtx } from '@/state/selectors';
import { pendingGuide } from '@/core/unlock';
import { Btn, Row, Sep, T } from './atoms';
import { Popup } from './Popup';
import { Pixel } from './Pixel';
import { ICONS } from './sprites';
import { BORDER, SP } from './theme';

export function GuidePopup({ active }: { active: boolean }) {
  const ctx = useUnlockCtx();
  const seen = useGame((s) => s.guidesSeen);
  const mark = useGame((s) => s.markGuide);
  const tutorialOff = useGame((s) => s.tutorialOff);

  /*
    튜토리얼을 끈 사람에게는 안내도 안 띄운다.
    "안내를 끄겠다" 는 의사표시를 두 곳에서 따로 받을 이유가 없다.
  */
  const guide = active && !tutorialOff ? pendingGuide(ctx, seen) : null;
  if (!guide) return null;

  return (
    <Popup visible title={guide.title} onClose={() => mark(guide.id)}>
      <Row gap={SP.md}>
        <View style={[BORDER, { padding: SP.sm }]}>
          <Pixel sprite={ICONS.badge} scale={3} />
        </View>
        <T size={12} style={{ flex: 1, lineHeight: 18 }}>{guide.body}</T>
      </Row>

      <Sep />
      {/* 어디로 가야 하는지가 이 팝업의 본론이다 — 제일 크게 세운다 */}
      <T size={10} dim="sub">가는 곳</T>
      <View style={[BORDER, { padding: SP.sm, marginTop: SP.xs }]}>
        <T size={14} bold center>{guide.where}</T>
      </View>
      <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
        지도 탭에서 찾아갈 수 있습니다. 이 안내는 한 번만 뜹니다.
      </T>

      <Btn label="알겠습니다" size="lg" fill style={{ marginTop: SP.md }} onPress={() => mark(guide.id)} />
    </Popup>
  );
}
