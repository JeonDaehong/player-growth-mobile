/**
 * 자동 강화 — 창고 여러 개, 착용 한 자루.
 *
 * `HomeScreen.tsx` 한 파일에 1,700줄이 있던 시절에는 팝업 하나를 고치려고
 * 열 때마다 관계없는 다섯 개를 지나야 했다. 화면은 화면대로, 팝업은 팝업대로 둔다.
 */
import { View } from 'react-native';
import {
  KIND_NAME,
  TIERS,
  currentItemLevel,
  fmtIlvl,
  itemLevel,
  itemName,
} from '@/state/store';
import {
  MILESTONE_STEP,
  baseItemLevel,
  isArtisan,
  milestoneBonus,
  round1,
  toNextMilestone,
} from '@/core/tiers';
import { freedOf } from '@/core/liberation';
import { fmtMul, imbueBlock } from '@/core/alchemy';
import { Item, isWeaponKind } from '@/core/types';
import { GRADES, GRADE_INFO, Spirit, axisText, engraveBlock, spiritBonus } from '@/core/spirit';
import { KV, Row, Sep, T, Tag } from '@/ui/atoms';
import { BORDER, C, O, SP, WHITE } from '@/ui/theme';
import { WEAPON_SPRITES } from '@/ui/sprites';
import { Sprite } from '@/ui/Sprite';
import { equipArt } from '@/ui/equipArt';
import { Shine } from '@/ui/Shine';

// ── 액션 팝업 ─────────────────────────────────────────

/** 등급 → 뱃지 스프라이트 (낮은 등급부터 g1) */
export const gradeArt = (g: string) => `g${GRADES.indexOf(g as never) + 1}`;

/**
 * 장비에 새겨진 룬각인 한 줄.
 * 없으면 어디서 새기는지 알려 준다 — 3티어 미만이면 그 이유를.
 */
export function RuneLine({ item }: { item: Item }) {
  const sp = item.spirit as Spirit | undefined;
  if (!sp) {
    const block = engraveBlock(item);
    return (
      <>
        <Sep />
        <Row between>
          <T size={11} dim="sub">룬각인</T>
          <T size={10} dim="dim">{block ?? '정령의 숲 · 엘프의 집에서 새깁니다'}</T>
        </Row>
      </>
    );
  }
  return (
    <>
      <Sep />
      <Row between>
        <Row gap={SP.sm} style={{ flex: 1 }}>
          <Sprite set="grade" name={gradeArt(sp.grade)} size={26} />
          <View style={{ flex: 1 }}>
            <Row gap={SP.xs}>
              <T size={12} bold>{sp.grade}</T>
              <T size={12} bold numberOfLines={1}>{sp.trait}</T>
            </Row>
            {Object.entries(spiritBonus(sp)).map(([a, v]) => (
              <T key={a} size={9} dim="sub">{axisText(a as never, v as number)}</T>
            ))}
          </View>
        </Row>
        <T size={10} dim="dim">+{GRADE_INFO[sp.grade].ilvl}</T>
      </Row>
    </>
  );
}

/**
 * 장비에 부여된 연성 한 줄. 룬각인과 같은 무게로 세운다 —
 * 배수는 아이템레벨 전체에 곱해지므로 각인만큼 크게 읽혀야 한다.
 *
 * 어느 연성액을 썼는지는 남기지 않고 배수만 저장하므로(types.ts `alch`),
 * 왼쪽 뱃지는 병 그림 대신 배수 자체를 박는다 — 틀린 병을 그리느니 사실을 쓴다.
 */
export function AlchLine({ item }: { item: Item }) {
  const mul = item.alch;
  if (!mul) {
    const block = imbueBlock(item);
    return (
      <>
        <Sep />
        <Row between>
          <T size={11} dim="sub">연성</T>
          <T size={10} dim="dim">{block ?? '심연 · 연금술사의 천막에서 부여합니다'}</T>
        </Row>
      </>
    );
  }
  // 연성이 얹어 준 몫 = 최종 - 원본. 둘 다 이미 round1 이지만 뺄셈에서 오차가 샌다.
  const gain = round1(itemLevel(item) - baseItemLevel(item));
  return (
    <>
      <Sep />
      <Row between>
        <Row gap={SP.sm} style={{ flex: 1 }}>
          <View
            style={[BORDER, {
              width: 34,
              height: 26,
              alignItems: 'center',
              justifyContent: 'center',
            }]}
          >
            <T size={10} bold>{fmtMul(mul)}</T>
          </View>
          <View style={{ flex: 1 }}>
            <Row gap={SP.xs}>
              <T size={12} bold>연성</T>
              <T size={12} bold numberOfLines={1}>{fmtMul(mul)}</T>
            </Row>
            <T size={9} dim="sub">아이템레벨 {fmtMul(mul)}</T>
          </View>
        </Row>
        <T size={10} dim="dim">+{fmtIlvl(gain)}</T>
      </Row>
    </>
  );
}

/** 팝업 머리글에 쓰는 장비 요약 */
export function ItemHead({ item }: { item: Item }) {
  const art = equipArt(item.kind, item.tier);
  return (
    <Row gap={SP.md}>
      <View style={[BORDER, { padding: SP.sm }]}>
        <Shine size={48} active={isArtisan(item.tier)}>
          <Sprite
            {...art}
            size={48}
            fallback={isWeaponKind(item.kind) ? WEAPON_SPRITES[item.kind] : undefined}
          />
        </Shine>
      </View>
      <View style={{ flex: 1 }}>
        <Row gap={SP.xs}>
          <T size={15} bold>{itemName(item, KIND_NAME)}</T>
          {!!item.alch && <Tag label={fmtMul(item.alch)} fill />}
        </Row>
        <T size={11} dim="sub">
          티어 {item.tier === 11 ? '★ 장인' : item.tier} · 아이템레벨 {fmtIlvl(itemLevel(item))}
          {item.dur < 50 ? ` → ${currentItemLevel(item)}` : ''}
        </T>
        <Row gap={1} style={{ marginTop: 4 }}>
          {Array.from({ length: 16 }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: WHITE,
                opacity: i < Math.round(item.dur / 6.25) ? (item.dur < 50 ? 0.6 : 1) : 0.15,
              }}
            />
          ))}
        </Row>
      </View>
    </Row>
  );
}

/**
 * 슬롯을 누르면 먼저 뜨는 행동 선택 팝업.
 * 여기서 강화 / 수리를 고르면 각각의 팝업으로 넘어간다.
 */

export function MilestoneLine({ item }: { item: Item }) {
  const artisan = isArtisan(item.tier);
  const freed = freedOf(item);
  const step = MILESTONE_STEP;
  const to = toNextMilestone(item.level);
  const nextLv = item.level + (to === 0 ? step : to);
  const n = Math.floor(nextLv / step);
  // 장인은 해방한 칸까지만 보너스를 받는다
  const sealed = artisan && n > freed;

  const gain = milestoneBonus(item.kind, item.tier, nextLv, artisan ? n : undefined)
    - milestoneBonus(item.kind, item.tier, nextLv - step, artisan ? n : undefined);

  // 지금이 마일스톤 직후인가 (하락 위험이 커진 구간)
  const justPassed = item.level % step === 0 && item.level > 0;
  const dropLoss = itemLevel(item) - itemLevel({ ...item, level: Math.max(0, item.level - 1) });

  return (
    <View style={{ marginTop: 4 }}>
      <T size={10} dim="sub">
        다음 계단 +{nextLv} 까지 {nextLv - item.level}칸 · 도달하면 {sealed ? '' : '+'}
        {sealed ? '봉인 상태 (장인의집에서 해방)' : fmtIlvl(gain)}
      </T>
      {justPassed && dropLoss > 0 && (
        <T size={10} dim="dim" style={{ marginTop: 2 }}>
          지금 하락하면 −{fmtIlvl(dropLoss)} 입니다. 계단을 막 밟은 직후가 가장 위험합니다.
        </T>
      )}
    </View>
  );
}

/**
 * 승급 골짜기 경고.
 * 마일스톤이 붙으면서 승급 직후 템렙이 더 깊게 떨어진다 — 모르고 눌렀다가 약해지면 억울하다.
 */
export function PromoteWarning({ item }: { item: Item }) {
  const next = (item.tier + 1) as typeof item.tier;
  if (!TIERS[next]) return null;
  const now = itemLevel(item);
  // 각인·연성은 승급해도 따라가므로 그대로 둔 채 비교한다 — 떨어지는 건 강화 단계뿐이다
  const bare = { ...item, tier: next, level: 0 };
  let recover = 0;
  for (let lv = 0; lv <= 15; lv++) {
    if (itemLevel({ ...bare, level: lv }) >= now) { recover = lv; break; }
    recover = 16;
  }
  return (
    <View style={[BORDER, { padding: SP.sm, marginTop: SP.sm }]}>
      <T size={11} bold>승급하면 아이템레벨이 일시적으로 낮아집니다</T>
      <KV k="지금" v={fmtIlvl(now)} />
      <KV k="승급 직후" v={fmtIlvl(itemLevel(bare))} warn />
      <KV k="원래 값 회복" v={recover > 15 ? `${TIERS[next].prefix} +15 로도 부족` : `${TIERS[next].prefix} +${recover}`} />
      {(!!item.spirit || !!item.alch) && (
        <T size={10} dim="dim" style={{ marginTop: 2 }}>
          새겨 둔 {[item.spirit && '정령석', item.alch && '연성'].filter(Boolean).join('·')}은 그대로 따라갑니다.
        </T>
      )}
    </View>
  );
}

/** 강화·승급 팝업 — 확률, 주문서, 연출까지 전부 팝업 안에서 처리한다 */

export function OddsCell({ label, v, strong }: { label: string; v: number; strong?: boolean }) {
  return (
    <View style={[BORDER, { flex: 1, padding: SP.xs, alignItems: 'center', backgroundColor: strong ? C.bgInv : 'transparent' }]}>
      <T size={9} style={{ color: strong ? C.fgInv : WHITE, opacity: O.sub }}>{label}</T>
      <T size={14} bold style={{ color: strong ? C.fgInv : WHITE }}>
        {v < 10 ? v.toFixed(1) : Math.round(v)}%
      </T>
    </View>
  );
}
