/**
 * 장비 아트 조회.
 *
 * 티어별 아트(`eq_{부위}/t{티어}`)가 있으면 그걸 쓰고, 아직 없으면 부위 공통
 * 아트(`weapon/{부위}` 또는 `gear/{부위}`)로 떨어진다.
 * 덕분에 §E1~E4 시트가 순차적으로 들어와도 코드를 고칠 필요가 없다.
 */
import { PartKind, SlotId, isWeaponKind } from '@/core/types';
import { ARTISAN_TIER } from '@/core/types';
import { spriteLoose } from './spriteAssets';

/**
 * 빈 슬롯 실루엣 (assets/sprites/slot — 점선 윤곽선 전용 세트).
 * 홈과 집이 같은 그림을 써야 "그 칸이 무슨 칸인지" 가 두 화면에서 어긋나지 않는다.
 */
export const SLOT_GEAR: Record<SlotId, string> = {
  weapon: 'sword', helm: 'helm', chest: 'chest',
  glove: 'glove', greaves: 'greaves', boot: 'boot',
  ear: 'ear', neck: 'neck', ring: 'ring', belt: 'belt',
};

export interface EquipArt {
  set: string;
  name: string;
  /** 티어별 전용 아트를 쓰고 있는가 (테두리 프레임 필요 여부 판단에 쓴다) */
  tiered: boolean;
}

export function equipArt(kind: PartKind, tier: number): EquipArt {
  const set = `eq_${kind}`;
  // 장인(11) 전용 아트(§A1·§A2)가 오면 그걸, 아직이면 최고 티어 아트를 돌려쓴다
  const t = Math.min(tier, spriteLoose(set, `t${ARTISAN_TIER}`) ? ARTISAN_TIER : ARTISAN_TIER - 1);
  if (spriteLoose(set, `t${t}`)) return { set, name: `t${t}`, tiered: true };
  return { set: isWeaponKind(kind) ? 'weapon' : 'gear', name: kind, tiered: false };
}
