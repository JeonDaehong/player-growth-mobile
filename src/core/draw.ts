/**
 * 쿠지 · 가챠 — 유한 재고 뽑기 (docs/KUJI_GACHA_DESIGN.md)
 *
 * 복권(복원추출, 확률 고정)과 달리 **비복원**입니다. 500칸이 든 박스에서 하나씩
 * 빠지고, 빠진 만큼 남은 확률이 변합니다. 재고가 유한하므로 환급률이 설계 시점에
 * 확정된다는 실무적 장점도 있습니다.
 *
 * 재고는 "사람들과 공유"이므로 싱글 게임에서는 다른 사람의 소비를 시간 기반으로
 * 결정론적으로 시뮬레이션합니다 — 앱을 껐다 켜도 같은 결과가 나옵니다.
 */
import { PART_KINDS, PartKind, ScrollId } from './types';
import type { AvatarId } from './avatars';
import type { StoneTier } from './spiritPreview';
import { g, s } from './currency';
import { seeded, shuffle } from './rng';

export type BoxId = 'kuji' | 'gacha';

export type Prize =
  | { kind: 'money'; amount: number }
  | { kind: 'scroll'; id: ScrollId; qty: number }
  | { kind: 'material'; part: PartKind; qty: number }
  | { kind: 'stone'; id: StoneTier; qty: number }
  /**
   * 로고 한 장.
   *
   * 다른 상품과 달리 **두 번 받아도 쌓이지 않는다** — 이미 가진 사람이 뽑으면
   * 스토어가 값어치만큼 돈으로 바꿔 준다 (`store.drawBox` 참고). 500칸에 한 칸이라
   * 두 번 걸릴 일은 거의 없지만, "A상인데 아무 일도 안 일어남" 은 그냥 버그로 읽힌다.
   */
  | { kind: 'avatar'; id: AvatarId };

export interface GradeDef {
  /** 'A'~'G' 또는 'gold'~'black' */
  id: string;
  label: string;
  count: number;
  /** 명목 가치 (환급률 계산용). 비매품은 null */
  value: number | null;
  prizeLabel: string;
  /** i = 전체 소비 인덱스 (재료 부위 등을 결정론적으로 고르는 데 쓴다) */
  prize: (i: number) => Prize;
}

export interface BoxSpec {
  id: BoxId;
  name: string;
  total: number;
  price: number;
  /** 사이클당 1인 구매 한도 */
  perUserLimit: number;
  /** 다른 사람들의 시간당 소비량 */
  npcPerHour: number;
  grades: GradeDef[];
  /** 마지막 칸을 뽑은 사람에게 주는 추가 상품 */
  lastOne?: { label: string; value: number; prize: () => Prize };
  /** 등급별 잔량을 공개하는가 (쿠지는 공개, 가챠는 총량만) */
  revealRemaining: boolean;
  /** 사이클 첫 뽑기에 보장되는 최소 등급 (없으면 보장 없음) */
  firstDrawFloor?: string;
}

// ── 쿠지 ───────────────────────────────────────────────
const money = (amount: number): Prize => ({ kind: 'money', amount });
const scroll = (id: ScrollId, qty = 1): Prize => ({ kind: 'scroll', id, qty });
const stone = (id: StoneTier, qty = 1): Prize => ({ kind: 'stone', id, qty });
const avatar = (id: AvatarId): Prize => ({ kind: 'avatar', id });

/**
 * 쿠지는 **두 종류가 사이클마다 번갈아** 나온다.
 * 늘 같은 상품이면 "이번엔 뭐가 걸렸나" 를 보러 올 이유가 없다.
 */
export const KUJI_SCROLL: BoxSpec = {
  id: 'kuji',
  name: '주문서 쿠지',
  total: 500,
  price: g(1),
  perUserLimit: 5,
  npcPerHour: 25,
  revealRemaining: true,
  grades: [
    { id: 'A', label: 'A상', count: 1,   value: null,  prizeLabel: '강화 확정 주문서',      prize: () => scroll('guarantee') },
    { id: 'B', label: 'B상', count: 3,   value: g(20), prizeLabel: '등급 하락 보정 주문서', prize: () => scroll('guard_down') },
    { id: 'C', label: 'C상', count: 8,   value: g(10), prizeLabel: '상급 강화 확률 상승',   prize: () => scroll('succ_high') },
    { id: 'D', label: 'D상', count: 20,  value: g(5),  prizeLabel: '중급 강화 확률 상승',   prize: () => scroll('succ_mid') },
    { id: 'E', label: 'E상', count: 60,  value: g(1),  prizeLabel: '하급 강화 확률 상승',   prize: () => scroll('succ_low') },
    { id: 'F', label: 'F상', count: 130, value: s(50), prizeLabel: '5,000 골드',                prize: () => money(s(50)) },
    { id: 'G', label: 'G상', count: 278, value: s(20), prizeLabel: '2,000 골드',                prize: () => money(s(20)) },
  ],
  lastOne: {
    label: '라스트원상 · 파괴 확률방어 주문서',
    value: g(50),
    prize: () => scroll('guard_destroy50'),
  },
};

/** 정령석 쿠지 — A상이 상급 정령석이다 (상점에서 살 수 없는 유일한 경로) */
export const KUJI_STONE: BoxSpec = {
  id: 'kuji',
  name: '정령석 쿠지',
  total: 500,
  price: g(1),
  perUserLimit: 5,
  npcPerHour: 25,
  revealRemaining: true,
  grades: [
    { id: 'A', label: 'A상', count: 1,   value: null,  prizeLabel: '상급 정령석',       prize: () => stone('high') },
    { id: 'B', label: 'B상', count: 3,   value: g(20), prizeLabel: '중급 정령석 ×5',    prize: () => stone('mid', 5) },
    { id: 'C', label: 'C상', count: 8,   value: g(10), prizeLabel: '중급 정령석 ×2',    prize: () => stone('mid', 2) },
    { id: 'D', label: 'D상', count: 20,  value: g(5),  prizeLabel: '중급 정령석',       prize: () => stone('mid') },
    { id: 'E', label: 'E상', count: 60,  value: g(1),  prizeLabel: '하급 정령석 ×20',   prize: () => stone('low', 20) },
    { id: 'F', label: 'F상', count: 130, value: s(50), prizeLabel: '하급 정령석 ×10',   prize: () => stone('low', 10) },
    { id: 'G', label: 'G상', count: 278, value: s(20), prizeLabel: '하급 정령석 ×4',    prize: () => stone('low', 4) },
  ],
  lastOne: {
    label: '라스트원상 · 상급 정령석',
    value: g(50),
    prize: () => stone('high'),
  },
};

/**
 * 로고 쿠지 — A상이 '달빛 신관' 로고다.
 *
 * 로고를 상점에만 두면 **돈으로만 살 수 있는 것**이 되고, 칭호로만 두면
 * 초기 가입자 말고는 영영 못 얻는다. 셋째 길이 하나 있어야 한다 — 500칸에 한 칸,
 * 회차당 5회 제한이라 노려서 되는 것도 아니고 아주 안 되는 것도 아니다.
 *
 * 나머지 칸은 **주문서 쿠지와 같은 값**으로 맞췄다. A상만 보고 들어왔다가 꽝을
 * 뽑았을 때, 적어도 다른 회차만큼은 건졌어야 다음에 또 온다.
 */
export const KUJI_LOGO: BoxSpec = {
  id: 'kuji',
  name: '로고 쿠지',
  total: 500,
  price: g(1),
  perUserLimit: 5,
  npcPerHour: 25,
  revealRemaining: true,
  grades: [
    { id: 'A', label: 'A상', count: 1,   value: null,  prizeLabel: '견습 마법소녀 로고',    prize: () => avatar('witchgirl') },
    { id: 'B', label: 'B상', count: 3,   value: g(20), prizeLabel: '중급 정령석 ×5',        prize: () => stone('mid', 5) },
    { id: 'C', label: 'C상', count: 8,   value: g(10), prizeLabel: '상급 강화 확률 상승',   prize: () => scroll('succ_high') },
    { id: 'D', label: 'D상', count: 20,  value: g(5),  prizeLabel: '중급 강화 확률 상승',   prize: () => scroll('succ_mid') },
    { id: 'E', label: 'E상', count: 60,  value: g(1),  prizeLabel: '하급 정령석 ×20',       prize: () => stone('low', 20) },
    { id: 'F', label: 'F상', count: 130, value: s(50), prizeLabel: '5,000 골드',                prize: () => money(s(50)) },
    { id: 'G', label: 'G상', count: 278, value: s(20), prizeLabel: '2,000 골드',                prize: () => money(s(20)) },
  ],
  lastOne: {
    label: '라스트원상 · 상급 정령석',
    value: g(50),
    prize: () => stone('high'),
  },
};

/**
 * 쿠지 진열대.
 *
 * ## 번갈아 나오던 것을 **동시에 늘어놓는다** (2026-08)
 *
 * 예전엔 사이클마다 주문서 → 정령석 → 로고가 돌아갔다. 그래서 쿠지에 들어가면
 * 그때 걸린 한 종류만 보였고, **로고를 노리는 사람은 로고 회차가 올 때까지
 * 할 게 없었다.** 회차가 언제 바뀌는지도 알 수 없으니 그냥 안 들어오게 된다.
 *
 * 지금은 세 종류를 나란히 두고 **고르게 한다.** 재고와 확률은 종류마다 따로 돈다
 * (`boxState` 가 종류별 뽑은 횟수를 받는다) — 주문서를 다섯 번 뽑았다고 로고
 * 쿠지의 재고가 줄지 않는다.
 */
export const KUJI_KINDS: BoxSpec[] = [KUJI_SCROLL, KUJI_STONE, KUJI_LOGO];

/** 예전 이름 호환 — 순환하던 시절의 목록 */
export const KUJI_ROTATION = KUJI_KINDS;

/** 종류를 구분하는 키 — 저장에서 종류별 뽑은 횟수를 이 키로 센다 */
export const kujiKeyOf = (spec: BoxSpec) => spec.name;

/** 이름으로 찾는다. 모르는 이름이면 첫 번째 (저장본이 옛 이름을 들고 있을 때) */
export function kujiByKey(key: string): BoxSpec {
  return KUJI_KINDS.find((k) => kujiKeyOf(k) === key) ?? KUJI_KINDS[0];
}

/** @deprecated 순환하던 시절의 함수. 지금은 사람이 고른다 */
export function kujiFor(cycleIndex: number): BoxSpec {
  const i = ((cycleIndex % KUJI_KINDS.length) + KUJI_KINDS.length) % KUJI_KINDS.length;
  return KUJI_KINDS[i];
}

/** @deprecated 화면이 고른 종류를 쓴다 (KUJI_KINDS) */
export function currentKuji(now: number, myDrawsToday = 0): BoxSpec {
  return kujiFor(boxState(KUJI_SCROLL, now, myDrawsToday).cycle);
}

/** 기본값 — 화면이 사이클을 모를 때 (호환용) */
export const KUJI = KUJI_SCROLL;

// ── 가챠 ───────────────────────────────────────────────
export const GACHA: BoxSpec = {
  id: 'gacha',
  name: '가챠',
  total: 500,
  price: g(1),
  perUserLimit: 5,
  npcPerHour: 25,
  revealRemaining: false,
  firstDrawFloor: 'blue',
  /*
    ## 기대값을 올렸다 (2026-08)

    예전 배분은 흑 캡슐(300칸, 60%)이 **20실버**였다. 1골드를 내고 20실버를 받으니
    열 번 뽑으면 여섯 번은 8할을 잃는다 — 환급률(89.8%)보다 **체감**이 훨씬 나빴다.

    가운데를 깎아 **바닥과 꼭대기를 동시에** 올렸다:
      · 흑(제일 흔한 것) 20실버 → 35실버  — 지는 판이 덜 아프다
      · 금(대박)        50골드 → 100골드 — 터졌을 때 확실히 터진다
      · 대신 은·청·백의 칸 수를 줄였다

    환급률은 89.8% → 97% 다. 100%를 넘기지는 않는다 — 넘기면 뽑기가 도박이 아니라
    돈 찍는 기계가 되고, 이 게임에서 도박은 돈을 잃으라고 있는 자리다.
  */
  grades: [
    { id: 'gold',  label: '금 캡슐', count: 1,   value: g(100), prizeLabel: '100골드', prize: () => money(g(100)) },
    /*
      재료 캡슐 = 제련 한 부위분(ARTISAN_FORGE_MATERIALS)이 통째로 나온다.
      매입가로 치면 10골드지만(MATERIAL_PRICE), 이건 되파는 물건이 아니라
      **등반 50여 회를 건너뛰는 표**다. 명목가 60골드는 그 쓰임새를 본 값이다.
    */
    { id: 'mat',   label: '금 캡슐', count: 1,   value: g(60), prizeLabel: '장인의 무구 재료 ×10',
      prize: (i) => ({ kind: 'material', part: PART_KINDS[Math.floor(seeded('mat', i)() * PART_KINDS.length)], qty: 10 }) },
    { id: 'silver',label: '은 캡슐', count: 8,   value: g(10), prizeLabel: '10골드', prize: () => money(g(10)) },
    { id: 'blue',  label: '청 캡슐', count: 30,  value: g(2),  prizeLabel: '2골드',  prize: () => money(g(2)) },
    { id: 'white', label: '백 캡슐', count: 120, value: s(55), prizeLabel: '5,500 골드', prize: () => money(s(55)) },
    { id: 'black', label: '흑 캡슐', count: 340, value: s(35), prizeLabel: '3,500 골드', prize: () => money(s(35)) },
  ],
};

export const BOXES: Record<BoxId, BoxSpec> = { kuji: KUJI, gacha: GACHA };

/** 등급 순위 (앞이 높음) — 첫뽑기 보장·최고등급 판정에 쓴다 */
export const gradeRank = (spec: BoxSpec, id: string) => spec.grades.findIndex((x) => x.id === id);
export const gradeOf = (spec: BoxSpec, id: string) => spec.grades.find((x) => x.id === id)!;

/** 환급률 = 기대 회수 / 가격. 비매품(value=null)은 제외한다. */
export function payoutRatio(spec: BoxSpec, withLastOne = false): number {
  const sum = spec.grades.reduce((a, x) => a + x.count * (x.value ?? 0), 0)
    + (withLastOne ? (spec.lastOne?.value ?? 0) : 0);
  return sum / (spec.total * spec.price);
}

// ── 사이클 / 재고 ──────────────────────────────────────
export const dayKeyOf = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const midnight = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export interface BoxState {
  cycle: number;
  cycleKey: string;
  /** 이 사이클에서 이미 빠진 개수 */
  pointer: number;
  remaining: number;
  /** 등급별 잔량 */
  left: Record<string, number>;
  /** 다음 리셋(자정)까지 ms */
  resetIn: number;
}

/**
 * 지금 박스 상태.
 * 소비량 = 다른 사람들(시간 기반) + 내가 오늘 뽑은 수. 500을 넘으면 다음 사이클.
 */
/**
 * 지금 이 박스가 어디까지 팔렸는가.
 *
 * ## 시간이 재고를 먹지 않는다 (2026-08)
 *
 * 예전엔 `시간 × npcPerHour` 만큼을 "다른 사람들이 뽑은 것" 으로 쳐서 포인터를
 * 밀었다. 그러면 **아무도 뽑지 않아도 재고가 저절로 줄었다** — 아침에 A상이
 * 남아 있는 걸 보고 저녁에 오면 이미 없다. 그 사이에 실제로 뽑은 사람은 나뿐인데도.
 *
 * 유한 재고 뽑기의 재미는 "남은 칸을 보고 지금 들어갈지 정하는 것" 인데,
 * 지어낸 소비가 그 판단을 매번 거짓말로 만들었다. 이제 포인터는 **내가 실제로
 * 뽑은 횟수**만 센다.
 *
 * `npcPerHour` 는 남겨 둔다 — 여러 사람이 같은 재고를 공유하는 진짜 서버 구현이
 * 들어오면 그때 쓸 값이고, 지우면 설계 의도가 같이 사라진다. 지금은 아무도 안 읽는다.
 */
export function boxState(spec: BoxSpec, now: number, myDrawsToday: number): BoxState {
  const consumed = Math.max(0, Math.floor(myDrawsToday));
  const cycle = Math.floor(consumed / spec.total);
  const pointer = consumed % spec.total;
  const cycleKey = `${dayKeyOf(now)}#${cycle}`;
  const arr = cycleGrades(spec, cycleKey);

  const left: Record<string, number> = {};
  for (const gr of spec.grades) left[gr.id] = 0;
  for (let i = pointer; i < spec.total; i++) left[arr[i]] += 1;

  return {
    cycle,
    cycleKey,
    pointer,
    remaining: spec.total - pointer,
    left,
    resetIn: midnight(now) + 86400_000 - now,
  };
}

/** 사이클의 등급 배열 — 시드 고정이라 어느 칸이 A상인지 앱을 껐다 켜도 같다 */
export function cycleGrades(spec: BoxSpec, cycleKey: string): string[] {
  const flat: string[] = [];
  for (const gr of spec.grades) for (let i = 0; i < gr.count; i++) flat.push(gr.id);
  return shuffle(flat, seeded(spec.id, cycleKey));
}

export interface DrawResult {
  /** 전체 소비 인덱스 */
  index: number;
  gradeId: string;
  label: string;
  prizeLabel: string;
  prize: Prize;
  /** 라스트원상을 함께 받았는가 */
  lastOne?: { label: string; prize: Prize };
  /** 첫뽑기 보장으로 등급이 올라갔는가 */
  guaranteed?: boolean;
}

/**
 * n회 뽑기. 순수 함수 — 소지금 차감과 상태 반영은 호출자(store) 책임.
 * myDrawsToday 는 포인터를 밀기 위한 값이고, drawsInCycle 은 첫뽑기 보장 판정용.
 */
export function draw(
  spec: BoxSpec,
  now: number,
  myDrawsToday: number,
  drawsInCycle: number,
  n: number,
): DrawResult[] {
  /* 포인터는 **내가 뽑은 만큼**이다 — `boxState` 와 같은 규칙이어야 한다 */
  const base = Math.max(0, Math.floor(myDrawsToday));
  const out: DrawResult[] = [];

  for (let k = 0; k < n; k++) {
    const consumed = base + k;
    const cycle = Math.floor(consumed / spec.total);
    const pos = consumed % spec.total;
    const cycleKey = `${dayKeyOf(now)}#${cycle}`;
    const arr = cycleGrades(spec, cycleKey);

    let gradeId = arr[pos];
    let guaranteed = false;
    // 사이클 첫 뽑기 보장 (가챠) — 하위 등급이면 바닥 등급까지 올려준다
    if (spec.firstDrawFloor && drawsInCycle + k === 0) {
      const floor = gradeRank(spec, spec.firstDrawFloor);
      if (gradeRank(spec, gradeId) > floor) {
        gradeId = spec.firstDrawFloor;
        guaranteed = true;
      }
    }

    const gr = gradeOf(spec, gradeId);
    const res: DrawResult = {
      index: consumed,
      gradeId,
      label: gr.label,
      prizeLabel: gr.prizeLabel,
      prize: gr.prize(consumed),
      guaranteed: guaranteed || undefined,
    };
    // 마지막 칸을 뽑으면 라스트원상
    if (spec.lastOne && pos === spec.total - 1) {
      res.lastOne = { label: spec.lastOne.label, prize: spec.lastOne.prize() };
    }
    out.push(res);
  }
  return out;
}
