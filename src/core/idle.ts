/**
 * ── 쌓이는 보상 ── 게이지 하나와 그 게이지가 뱉는 전리품.
 *
 * 방치형에서 사람이 앱을 켜 두는 이유와 껐다 다시 켜는 이유가 여기 다 들어
 * 있다. 두 갈래인데 **같은 값을 쓴다.**
 *
 *   **켜 놓고 있는 동안** (`ONLINE_FULL_MS`) — 게이지가 차고, 가득 차면
 *   더 안 찬다. 눌러야 받는다.
 *
 *   **꺼 놓은 동안** (`OFFLINE_CAP_MS`) — 여덟 시간까지 쌓이고, 여덟 시간
 *   꽉 채운 것이 **켜 놓았을 때 한 번 받는 것과 같다.**
 *
 * ## 왜 오프라인이 그렇게 짠가
 *
 * 일부러다. 켜 놓는 쪽이 서른 배 넘게 이득이어야 (30분 : 8시간) 게임을 켤
 * 이유가 남는다. 오프라인 보상은 "안 켠 동안의 손해를 조금 메워 주는 것" 이지
 * "안 켜도 되는 이유" 가 아니다.
 *
 * 그렇다고 0 으로 두면 하루 못 켠 사람이 돌아올 이유가 없다. 여덟 시간에
 * 한 번분은 "돌아오니 상자가 하나 놓여 있다" 정도이고, 그게 이 값이 하려는
 * 일의 전부다.
 *
 * ## 전리품은 늘 다르다
 *
 * 총 가치는 같은데 **구성이 매번 다르다** (`rollLoot`). 골드만 나오면 게이지가
 * 그냥 숫자 늘리는 단추가 되고, 그러면 누를 이유가 습관밖에 안 남는다. 어떤
 * 날은 골드가 많고 어떤 날은 재료가, 아주 가끔 주문서가 나오면 **누를 때마다
 * 한 번 볼 만한 것**이 된다.
 *
 * ## 이 파일은 시각을 안 읽는다
 *
 * `Date.now()` 를 안 부른다. 전부 인자로 받는다 — 그래야 검사에서 "여덟 시간
 * 지났을 때" 를 실제로 여덟 시간 기다리지 않고 물어볼 수 있다. `core/refill`
 * 이 날짜 키를 밖에서 받는 것과 같은 이유다.
 */
import { MATERIAL_IDS, MATERIAL_PRICE, MaterialId } from './artisans';
import { SCROLLS, SCROLL_ORDER } from './enhance';
import type { ScrollId } from './types';
import { Rand, rnd } from './rng';

/**
 * 게이지가 가득 차기까지 (ms) — **30분.**
 *
 * 짧으면 화면을 계속 들여다보게 되고(5분짜리는 알림이지 게이지가 아니다),
 * 길면 한 판을 하는 동안 한 번도 안 찬다. 30분은 "한 판 하고 나면 차 있다"
 * 자리다.
 */
export const ONLINE_FULL_MS = 30 * 60_000;

/** 오프라인으로 쌓이는 최대 시간 (ms) — 여덟 시간 */
export const OFFLINE_CAP_MS = 8 * 60 * 60_000;

/**
 * 하루에 몇 번까지 **다이아로 즉시 채울 수 있나**, 그리고 그 값.
 *
 * 살 때마다 오른다 (`core/refill` 과 같은 규칙, 이유도 같다). 정액이면
 * 다이아를 가진 사람이 게이지라는 개념을 통째로 사 버린다.
 *
 * 길이가 곧 하루 최대 횟수다 — 셋.
 */
export const INSTANT_DIA: readonly number[] = [50, 100, 200];

/** 오늘 `used` 번 쓴 사람의 다음 값. 다 썼으면 null (`core/refill` 과 같은 규칙) */
export function instantDia(used: number): number | null {
  return used >= 0 && used < INSTANT_DIA.length ? INSTANT_DIA[used] : null;
}

/**
 * 이 판에서 **가득 찬 게이지 한 번**이 주는 값 (골드 환산).
 *
 * 잡몹 한 마리 값에 900 을 곱한다 (`core/autoBattle` 의 `killGold`). 900 은
 * 초당 한 마리씩 15분을 잡은 셈이라, 30분을 켜 놓고 받는 것이 **직접 싸운
 * 15분어치**가 된다.
 *
 * 절반으로 잡은 것이 중요하다. 게이지가 직접 싸우는 것보다 이득이면 화면을
 * 켜 두고 아무것도 안 하는 것이 정답이 된다 — 그건 방치형이 아니라 그냥
 * 안 하는 게임이다.
 *
 * @param kill 그 판 잡몹 하나의 골드 (`killGold(stage, false)`)
 */
export const maxValue = (kill: number): number => Math.max(1, Math.round(kill * 900));

/**
 * 지금 게이지가 얼마나 찼나 (0 ~ 1).
 *
 * @param since 마지막으로 받은 뒤로 흐른 시간 (ms)
 */
export const gaugeAt = (since: number): number =>
  Math.max(0, Math.min(1, (Number.isFinite(since) ? since : 0) / ONLINE_FULL_MS));

/** 가득 찼나 — 화면이 이걸로 단추를 켠다 */
export const gaugeFull = (since: number): boolean => gaugeAt(since) >= 1;

/**
 * 자리를 비운 동안 쌓인 몫 (0 ~ 1). 여덟 시간이 1 이다.
 *
 * @param away 자리를 비운 시간 (ms)
 */
export const offlineAt = (away: number): number =>
  Math.max(0, Math.min(1, (Number.isFinite(away) ? away : 0) / OFFLINE_CAP_MS));

/**
 * 오프라인 보상을 안내할 만한가.
 *
 * 10분 아래는 안 띄운다. 화면을 잠깐 내렸다 올릴 때마다 술집 아가씨가
 * 나와서 3골드를 내미는 것은 보상이 아니라 방해다.
 */
export const OFFLINE_MIN_MS = 10 * 60_000;

/* ────────────────────────────── 전리품 ────────────────────────────── */

/** 전리품 한 줄 */
export type Loot =
  | { kind: 'gold'; n: number }
  | { kind: 'mat'; id: MaterialId; n: number }
  | { kind: 'scroll'; id: ScrollId; n: number }
  | { kind: 'dia'; n: number };

/**
 * 어떤 **결**로 나오나.
 *
 * 총 가치는 같고 나누는 방식만 다르다. 확률이 한쪽으로 크게 기울어 있는 것이
 * 중요하다 — 셋이 고르게 나오면 "매번 다르다" 가 아니라 "매번 무작위다" 가
 * 되어, 어느 것도 반가운 일이 아니게 된다.
 *
 *   plain 55%  거의 다 골드. 기본값이자 심심한 쪽
 *   mats  33%  절반쯤이 재료로 — 제련을 미뤄 둔 사람에게 반갑다
 *   rare  12%  주문서 한 장이 섞인다. 가끔 다이아도
 */
export type LootFlavor = 'plain' | 'mats' | 'rare';

export function rollFlavor(r: Rand = rnd): LootFlavor {
  const x = r();
  if (x < 0.55) return 'plain';
  if (x < 0.88) return 'mats';
  return 'rare';
}

/**
 * 이 가치만큼의 전리품을 굴린다.
 *
 * **골드가 언제나 한 줄은 있다.** 재료만 열 개가 나오면 "이걸로 뭘 하나" 가
 * 먼저 오고, 게이지를 누른 보람이 재료 창고를 여는 일이 된다.
 *
 * 값어치는 대략 맞춘다 — 정확히 맞추려고 마지막 줄에 소수점 골드를 끼워
 * 넣으면 숫자가 지저분해진다. 이 값은 사람이 비교하는 값이 아니라 **쌓이는**
 * 값이라, ±10% 는 아무도 못 알아챈다.
 *
 * @param value 골드 환산 총 가치 (`maxValue`)
 */
export function rollLoot(value: number, r: Rand = rnd, flavor?: LootFlavor): Loot[] {
  const v = Math.max(1, Math.round(value));
  const kind = flavor ?? rollFlavor(r);
  const out: Loot[] = [];

  if (kind === 'plain') {
    /* 90~100% 를 골드로. 나머지는 버린다 — 자투리를 재료 한 개로 바꾸면 늘 재료가 나온다 */
    out.push({ kind: 'gold', n: Math.round(v * (0.9 + r() * 0.1)) });
    return out;
  }

  if (kind === 'mats') {
    /* 재료는 **개수로** 센다. 한 개가 `MATERIAL_PRICE` 라 나눗셈 한 번이면 된다 */
    const share = 0.35 + r() * 0.25;
    const mats = Math.max(1, Math.floor((v * share) / MATERIAL_PRICE));
    const id = MATERIAL_IDS[Math.floor(r() * MATERIAL_IDS.length)] ?? 'skin';
    out.push({ kind: 'gold', n: Math.max(1, Math.round(v * (1 - share))) });
    out.push({ kind: 'mat', id, n: mats });
    return out;
  }

  /*
    ── 귀한 결 ──

    **살 수 있는 주문서 중에서** 고른다 (`SCROLL_ORDER` — 확정 주문서는
    비매품이라 빠져 있다). 게이지가 비매품을 뱉으면 쿠지 A상의 값이 사라진다.

    값보다 비싼 주문서는 안 고른다. 그러면 게이지 한 번이 제 값의 스무 배를
    뱉는 판이 생긴다.
    */
  const afford = SCROLL_ORDER.filter((id) => SCROLLS[id].price > 0 && SCROLLS[id].price <= v * 0.7);
  const id = afford.length ? afford[Math.floor(r() * afford.length)] : null;
  const spent = id ? SCROLLS[id].price : 0;
  out.push({ kind: 'gold', n: Math.max(1, Math.round(v - spent)) });
  if (id) out.push({ kind: 'scroll', id, n: 1 });
  /*
    다이아는 **덤이다** — 총 가치에 안 넣는다.

    넣으면 다이아가 골드로 환산되는 셈인데, 그 환율을 한 번 정해 놓으면
    다이아로 살 수 있는 모든 것의 값이 거기 묶인다. 다이아는 여기서 얻는
    유일한 길이 아니고(미션이 있다) 양도 적으므로, 그냥 얹는다.
  */
  if (r() < 0.35) out.push({ kind: 'dia', n: 1 + Math.floor(r() * 3) });
  return out;
}

/** 화면에 적는 한 줄 */
export function lootLabel(l: Loot): string {
  if (l.kind === 'gold') return `${Math.floor(l.n).toLocaleString('en-US')} 골드`;
  if (l.kind === 'dia') return `다이아 ${l.n}`;
  if (l.kind === 'mat') return `재료 ×${l.n}`;
  return `${SCROLLS[l.id].name} ×${l.n}`;
}
