/**
 * 쿠폰 코드.
 *
 * 코드는 대소문자·공백을 가리지 않는다 (사용자가 어떻게 칠지 모른다).
 * 한 코드는 계정당 1회만 쓸 수 있고, 사용 내역은 저장에 남는다 —
 * 예외는 `repeatable` 이 붙은 시험용 쿠폰뿐이다.
 */
import { fmtShort, g } from './currency';
import { MATERIAL_IDS, MaterialId } from './artisans';
import { SCROLL_IDS, ScrollId } from './types';

export interface CouponDef {
  /** 정규화된 코드 (소문자·공백제거) */
  code: string;
  label: string;
  /** 지급 소지금 (골드) */
  money?: number;
  /** 주문서 지급 — 종류별 개수. 전 종류를 줄 땐 scrollsEach 를 쓴다. */
  scrolls?: Partial<Record<ScrollId, number>>;
  /** 전 종류 주문서를 각각 이 개수만큼 */
  scrollsEach?: number;
  /** 번스타인 재료 3종을 각각 이 개수만큼 */
  materialsEach?: number;
  /**
   * 몇 번이든 다시 쓸 수 있는가.
   *
   * 보통 쿠폰은 계정당 한 번이고, **그 한 번이 유일한 방어선**이다 (코드가 번들에
   * 그대로 남아 개발자도구로 읽히므로). 그래서 이 표시는 **시험용에만** 붙인다 —
   * 붙는 순간 그 코드를 아는 사람은 재화를 무한히 찍을 수 있다는 뜻이다.
   *
   * 시험 중에는 그게 필요하다. 콘텐츠 하나를 확인할 때마다 계정을 새로 파야 하면
   * 피드백을 받을 수가 없다.
   */
  repeatable?: boolean;
}

/**
 * 개발용 쿠폰 — **지금은 비어 있다.**
 *
 * ⚠ 여기 적은 코드는 배포 빌드에 안 들어간다. 목록 자체를 빌드에서 덜어내므로
 * (아래 COUPONS 참조) 코드 문자열까지 통째로 사라진다.
 *
 * 비어 있어도 자리를 남겨 두는 이유: 큰 금액이 필요할 때 **여기 넣으라**는 표시다.
 * 이 칸이 없으면 다음 사람이 LIVE 쪽에 바로 적게 되고, 그 순간 코드가 번들에
 * 노출된다. 지금 `rakdos` 가 딱 그런 경우인데, 그건 배포된 자리에서 시험해야 해서
 * 어쩔 수 없이 감수한 것이다 (아래 주석 참고).
 */
const DEV_COUPONS: CouponDef[] = [];

/**
 * 배포 빌드에도 들어가는 쿠폰.
 *
 * ⚠ **여기 적은 코드는 번들에 그대로 남는다.** 개발자도구로 읽히므로 사실상
 * 공개 코드다 — 퍼져도 괜찮은 것만 넣는다. 한 계정에 한 번뿐이라는 것만이
 * 유일한 방어선이다 (`redeemable` 이 `used` 를 본다).
 *
 * 지금은 **시험용 하나뿐**이다. 소액 쿠폰들(50골드·200골드)은
 * 전부 없앴다 — 이미 받은 사람의 재화는 그대로 남고 (지급은 그때 끝난 일이다),
 * 사용 기록(`coupons` 배열)에 남은 옛 코드도 그냥 안 읽히는 문자열이 될 뿐이다.
 * 없는 코드를 치면 "존재하지 않는 쿠폰" 이 된다.
 */
const LIVE_COUPONS: CouponDef[] = [
  /*
    ⚠⚠ **시험용 목돈 — 베타가 끝나면 지울 것.**

    1,000만 골드는 정상적인 벌이로는 닿을 수 없는 금액이고, 상점의
    모든 것을 다 사고도 남는다. 게다가 **몇 번이든 다시 쓸 수 있게** 열어 두었다
    (`repeatable`) — 즉 이 코드를 아는 사람은 재화를 무한히 찍는다.

    개발 쿠폰(DEV_COUPONS)에 두면 배포 빌드에서 목록째 사라져 정작 시험하는
    자리에서 안 먹는다. 그래서 여기 둔다 — 대신 **번들에 코드가 그대로 남는다.**
    개발자도구를 열면 누구나 읽을 수 있고, 재사용까지 열려 있으니 **방어선이 없다.**

    ⚠ 베타를 닫기 전에 **반드시** 이 줄을 지울 것. 지우면 코드 자체가 사라지므로
    그 뒤로는 아무도 못 쓴다. (재사용 쿠폰은 `coupons` 배열에 기록을 안 남기므로
    지운 흔적도 저장본에 안 쌓인다.)
  */
  { code: 'rakdos', label: '1,000만 골드', money: g(10_000_000), repeatable: true },
];

/**
 * 개발 빌드인가.
 *
 * `__DEV__` 는 메트로가 주입하는 전역이라 Node(스모크 테스트)에는 없다.
 * 없으면 개발로 친다 — 테스트는 쿠폰 동작을 그대로 검사해야 하기 때문이다.
 * 배포 빌드에서는 메트로가 `__DEV__` 를 false 로 바꿔 넣고, 미니파이어가
 * 이 삼항을 접으면서 DEV_COUPONS 를 통째로 들어낸다 (코드 문자열도 같이 사라진다).
 */
const COUPONS_ENABLED = typeof __DEV__ === 'undefined' ? true : __DEV__;

/**
 * 이 빌드에서 실제로 통하는 쿠폰.
 *
 * 배포 빌드에는 `LIVE_COUPONS` 만 들어간다. 개발용(10만 골드짜리 같은 것)은
 * 미니파이어가 이 삼항을 접으면서 코드 문자열까지 통째로 사라진다.
 */
export const COUPONS: CouponDef[] = COUPONS_ENABLED
  ? [...LIVE_COUPONS, ...DEV_COUPONS]
  : LIVE_COUPONS;

/** 쿠폰이 지급할 번스타인 재료 (종류별 개수) */
export function couponMaterials(c: CouponDef): Partial<Record<MaterialId, number>> {
  const out: Partial<Record<MaterialId, number>> = {};
  if (c.materialsEach) for (const id of MATERIAL_IDS) out[id] = c.materialsEach;
  return out;
}

/** 쿠폰이 실제로 지급할 주문서 (scrollsEach 를 종류별로 펼친다) */
export function couponScrolls(c: CouponDef): Partial<Record<ScrollId, number>> {
  const out: Partial<Record<ScrollId, number>> = {};
  if (c.scrollsEach) for (const id of SCROLL_IDS) out[id] = c.scrollsEach;
  for (const [k, v] of Object.entries(c.scrolls ?? {})) {
    out[k as ScrollId] = (out[k as ScrollId] ?? 0) + (v ?? 0);
  }
  return out;
}

/** 보상 요약 한 줄 — 토스트에 쓴다 */
export function couponSummary(c: CouponDef): string {
  const parts: string[] = [];
  if (c.money) parts.push(fmtShort(c.money));
  const sc = couponScrolls(c);
  const kinds = Object.keys(sc).length;
  if (kinds) {
    const each = Object.values(sc)[0];
    const same = Object.values(sc).every((v) => v === each);
    parts.push(same && kinds === SCROLL_IDS.length
      ? `주문서 전 종류 ${each}장`
      : `주문서 ${Object.values(sc).reduce((a, b) => a + (b ?? 0), 0)}장`);
  }
  if (c.materialsEach) parts.push(`번스타인 재료 3종 ${c.materialsEach}개씩`);
  return parts.join(' + ');
}

/**
 * 쿠폰 사용 기록 초기화 세대.
 *
 * 이 숫자를 올리면 **모든 플레이어의 쿠폰 사용 기록이 한 번 비워진다** —
 * 이미 쓴 쿠폰을 다시 쓸 수 있게 풀어 주는 레버다.
 * 저장본에 기록된 세대가 이 값보다 낮을 때 딱 한 번만 비우므로,
 * 앱을 다시 켜도 또 비워지지 않는다.
 */
export const COUPON_RESET_SEQ = 1;

/** 입력을 코드 비교용으로 정규화 — 대소문자, 공백, 하이픈 무시 */
export const normalizeCode = (raw: string) => raw.trim().toLowerCase().replace(/[\s-]/g, '');

export function findCoupon(raw: string): CouponDef | null {
  const k = normalizeCode(raw);
  return COUPONS.find((c) => c.code === k) ?? null;
}

export type CouponResult = 'ok' | 'unknown' | 'used' | 'empty';

/** 쿠폰 판정 — 지급은 store 가 한다 (core 는 판단만) */
export function redeemable(raw: string, used: string[]): { result: CouponResult; coupon: CouponDef | null } {
  if (!raw.trim()) return { result: 'empty', coupon: null };
  const coupon = findCoupon(raw);
  if (!coupon) return { result: 'unknown', coupon: null };
  /*
    ⚠ 다시 쓸 수 있는 쿠폰은 사용 내역을 보지 않는다.

    "한 계정에 한 번" 은 공개 쿠폰의 **유일한 방어선**이라 함부로 풀면 안 된다.
    지금 풀려 있는 건 시험용(`rakdos`) 하나뿐이고, 그건 베타가 끝나면 목록에서
    지운다 (LIVE_COUPONS 주석 참고).
  */
  if (!coupon.repeatable && used.includes(coupon.code)) return { result: 'used', coupon };
  return { result: 'ok', coupon };
}
