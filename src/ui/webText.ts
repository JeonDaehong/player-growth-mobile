/**
 * 웹에서만 필요한 글자 렌더링 보정.
 *
 * 브라우저는 기본으로 **서브픽셀 안티에일리어싱**(LCD 필터)을 쓴다. 흰 글씨를
 * 검은 배경에 얹으면 자모 획마다 빨강·파랑이 새어 나오는데, 화면 전체가 흑백
 * 2색인 이 게임에서는 그게 그냥 "글자가 지저분하다"로 읽힌다. 지도처럼 그림
 * 위에 얹히는 작은 라벨에서 특히 심하다.
 *
 * 회색조 AA 로 바꾸면 색 번짐이 사라지고 획이 또렷해진다.
 * 네이티브(iOS·안드로이드)는 원래 회색조라 아무것도 하지 않는다.
 */
import { Platform } from 'react-native';

const STYLE_ID = 'pg-text-rendering';

export function applyWebTextRendering() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    html, body, #root {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
  `;
  document.head.appendChild(el);
}
