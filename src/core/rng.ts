/** 순수 TS 난수 유틸. 시드 고정 PRNG 로 "앱을 껐다 켜도 같은 결과"가 필요한 곳(크리처 러쉬 매치, 주식 뉴스, 선술집 소문)을 재현한다. */

export type Rand = () => number;

/** mulberry32 — 작고 빠른 32bit PRNG. */
export function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 문자열/숫자 조합을 32bit 시드로. (FNV-1a) */
export function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261 >>> 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** 시드에서 바로 PRNG. */
export function seeded(...parts: (string | number)[]): Rand {
  return mulberry32(hashSeed(...parts));
}

export const rnd: Rand = Math.random;

export function randInt(min: number, max: number, r: Rand = rnd): number {
  return min + Math.floor(r() * (max - min + 1));
}

export function pick<T>(arr: readonly T[], r: Rand = rnd): T {
  return arr[Math.floor(r() * arr.length)];
}

export function shuffle<T>(arr: readonly T[], r: Rand = rnd): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 확률 가중 선택. weights 합이 1이 아니어도 됨. */
export function weighted<T>(entries: readonly (readonly [T, number])[], r: Rand = rnd): T {
  const total = entries.reduce((s, e) => s + e[1], 0);
  let x = r() * total;
  for (const [v, w] of entries) {
    x -= w;
    if (x <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

/** p(0~1) 확률로 true. */
export function chance(p: number, r: Rand = rnd): boolean {
  return r() < p;
}
