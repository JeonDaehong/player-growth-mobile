/** 선술집 "오늘의 소문" (기획서 §8-2). 하루 3회 갱신, 신뢰도 70%. */
import { seeded } from './rng';
import { CREATURE_DEFS, slotOf as rushSlotOf, creatureName } from './rush';

export const RUMOR_PERIOD_MS = 8 * 3600_000; // 하루 3회
export const RUMOR_RELIABILITY = 0.7;

export interface Rumor {
  id: string;
  text: string;
  /** 이 소문이 진실인가 (내부값 — UI 는 보여주지 않는다) */
  truthful: boolean;
}

const FLAVOR = [
  '술집 구석의 노인이 중얼거린다',
  '취한 광부가 떠들어댄다',
  '여관 주인이 목소리를 낮춘다',
  '떠돌이 상인이 귀띔한다',
];

const SMALL_TALK = [
  '"요즘 +15 찍었다는 놈은 죄다 사기꾼이더군."',
  '"3금융은 손대는 게 아니야. 내 친구가 그러다 신발까지 팔았어."',
  '"장인의 집 노인네, 젊었을 땐 탑 50층을 맨몸으로 올랐다던데."',
  '"강화 주문서 두 장 붙이면 된다고? 그런 건 없어."',
  '"도박은 체력이 안 든다는 게 제일 무서운 점이지."',
  // ── 정령의 숲 · 룬각인 ──
  '"정령의 숲 엘프 말이야, 3티어 아래 장비는 쳐다도 안 본다더군."',
  '"룬각인은 같은 걸 열여섯 개 맞춰야 진짜라던데. 그게 사람이 할 짓인가."',
  '"상급 정령석? 그건 쿠지에서만 나와. 결국 오락실로 가라는 얘기지."',
  '"SSS를 봤다는 놈은 있어도, 가진 놈은 못 봤어."',
  // ── 보스의탑 · 번스타인 ──
  '"50층의 그놈… 이름이 번스타인이랬나. 강철 껍질이 검을 튕겨낸다더군."',
  '"번스타인 이빨 하나면 목걸이 하나가 나온대. 이빨을 어떻게 뽑느냐가 문제지."',
  '"뼛조각을 모으는 놈들은 다 갑옷을 노리는 거야. 무기는 껍질이 있어야 하고."',
  '"둔카락스가 왜 산에서 안 내려오는 줄 아나? 재료가 없어서야."',
];

/** 해당 소문 슬롯의 소문 3개 */
export function rumorsForSlot(slot: number): Rumor[] {
  const r = seeded('rumor', slot);
  const out: Rumor[] = [];
  const now = slot * RUMOR_PERIOD_MS;

  /*
    1. 잡담 (둘 중 첫 줄)

    예전에는 이 자리가 **주식 뉴스 사전 힌트**였다. 주식장을 없애면서 갈 곳이
    없어졌는데, 그렇다고 소문을 두 줄로 줄이면 선술집에 들어갈 이유가 그만큼 얇아진다.
    그래서 잡담을 두 줄 뽑는다 — 아래 3번과 **겹치지 않게** 골라야 한다.
  */
  const talkA = Math.floor(r() * SMALL_TALK.length);
  out.push({ id: `r-${slot}-talk-a`, text: SMALL_TALK[talkA], truthful: true });

  // 2. 크리처 컨디션
  {
    const c = CREATURE_DEFS[Math.floor(r() * CREATURE_DEFS.length)];
    const truthful = r() < RUMOR_RELIABILITY;
    const bad = r() < 0.5;
    out.push({
      id: `r-${slot}-creature`,
      text: bad
        ? `"${creatureName(c.id)}가 어제 과음했다더군… 오늘은 영 아닐 거야."`
        : `"${creatureName(c.id)} 컨디션이 아주 좋다던데. 오늘 한 판 크게 갈 거야."`,
      truthful,
    });
    void rushSlotOf;
  }

  // 3. 잡담 (1번과 다른 줄로 — 같은 말을 두 번 하면 소문이 아니라 고장으로 보인다)
  {
    const step = 1 + Math.floor(r() * (SMALL_TALK.length - 1));
    out.push({
      id: `r-${slot}-talk-b`,
      text: SMALL_TALK[(talkA + step) % SMALL_TALK.length],
      truthful: true,
    });
  }

  return out;
}

export const rumorSlotOf = (now: number) => Math.floor(now / RUMOR_PERIOD_MS);
