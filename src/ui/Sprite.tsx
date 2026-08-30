import React from 'react';
import { Image, ImageStyle, View } from 'react-native';
import { SpriteSet, spriteLoose } from './spriteAssets';
import { Pixel } from './Pixel';
import type { Sprite as AsciiSprite } from './sprites';
import { WHITE } from './theme';

interface Props {
  /** 생성된 세트 이름. 아직 없는 폴더(`eq_sword` 등)도 문자열로 받는다 — 없으면 fallback. */
  set: SpriteSet | (string & {});
  name: string;
  size: number;
  /** 에셋이 없을 때 대신 그릴 코드 스프라이트 */
  fallback?: AsciiSprite;
  /**
   * 에셋이 없을 때 대신 쓸 **다른 스프라이트**.
   * 아트가 여러 번에 나눠 들어오므로, 새 폴더가 비어 있는 동안 기존 그림으로 버틴다.
   */
  fallbackSet?: string;
  fallbackName?: string;
  opacity?: number;
  style?: ImageStyle;
  /** 흑백 2색이라 색을 갈아끼울 수 있다 (반전 배경 위에 올릴 때) */
  tint?: string;
  /** 좌우 반전. 아트가 전부 오른쪽을 보고 있어, 오른쪽 자리에 서면 뒤집어야 마주 본다. */
  flip?: boolean;
  /**
   * 상자를 어떻게 채우나. 기본은 `contain` — 비율을 지키고 남는 데를 비운다.
   *
   * 캐릭터·몬스터는 늘 `contain` 이다. 찌그러지면 안 되니까. `stretch` 는
   * **배경**을 위해 있다 — 배경은 화면 띠에 빈틈없이 들어차야 하고, 먼 풍경은
   * 조금 늘어나도 안 보인다. `contain` 으로 두면 양옆이 비거나 위가 잘려
   * 구름이 사라진다.
   */
  fit?: 'contain' | 'stretch' | 'cover';
}

/**
 * 슬라이스된 도트 에셋 렌더러.
 * 에셋은 흰 픽셀 + 투명 배경이라 tintColor 로 색만 바꿔 쓸 수 있다.
 * 아직 아트가 없는 자리는 fallback(ASCII 스프라이트)으로 자동 대체된다 —
 * 에셋이 순차적으로 들어오는 동안 화면이 비지 않게.
 */
export function Sprite({
  set, name, size, fallback, fallbackSet, fallbackName, opacity = 1, style, tint, flip,
  fit = 'contain',
}: Props) {
  const src = spriteLoose(set, name)
    ?? (fallbackSet ? spriteLoose(fallbackSet, fallbackName ?? name) : undefined);
  if (!src) {
    if (fallback) {
      const cols = fallback[0]?.length ?? 1;
      return <Pixel sprite={fallback} scale={size / cols} opacity={opacity} color={tint ?? WHITE} />;
    }
    return <View style={{ width: size, height: size, opacity }} />;
  }
  return (
    <Image
      source={src}
      resizeMode={fit}
      /* 색은 style.tintColor 가 아니라 props.tintColor 로 준다 — style 쪽은 폐기 예정 */
      tintColor={tint}
      /**
       * ⚠ flip 과 style.transform 을 같이 주면 안 된다 — transform 은 속성 하나라
       * 뒤에 오는 style 이 통째로 덮어쓰고 반전이 사라진다.
       * 둘 다 필요하면 호출부에서 transform 배열을 직접 합쳐라 (RushScreen 참고).
       */
      style={[
        { width: size, height: size, opacity },
        flip && !style?.transform ? { transform: [{ scaleX: -1 }] } : null,
        style,
      ]}
    />
  );
}
