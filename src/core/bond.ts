/**
 * ── 인연 ── 네 사람과 **얼마나 가까운가.**
 *
 * 레벨·성이 "이 사람이 얼마나 센가" 라면 인연은 "이 사람과 얼마나 가까운가"
 * 다. 둘을 갈라 둔 까닭은 **드는 것이 다르기** 때문이다 — 세지는 데는 골드와
 * 경험의 서가 들고, 가까워지는 데는 시간(하루 두 번의 대화)과 선물이 든다.
 * 한 축으로 묶으면 골드로 애정을 사는 것이 되고, 그러면 이 축이 존재할
 * 이유가 없어진다.
 *
 * ## 상한이 등급으로 갈린다
 *
 *   common      3
 *   rare        6
 *   epic 이상   10
 *
 * 성 상한과 **같은 모양**이다 (`core/growth` 의 `RARITY_STAR`). 등급이 낮은
 * 사람은 끝까지 가도 `우정` 에서 멈춘다 — 그게 등급이 뜻하는 바다.
 *
 * ## 단계 이름이 숫자를 대신한다
 *
 * `인연 7` 이라고 적으면 그건 진도표다. `신뢰` 라고 적으면 **지금 어떤
 * 사이인가**가 되고, 그래야 그 자리에 이야기가 붙는다 (`BOND_STORY`).
 *
 * ## 이 파일은 규칙만 안다
 *
 * 누가 몇인지는 세이브에 있고 (`GameState.bonds`), 화면은 여기 표를 읽어
 * 그린다. 대화의 선택지와 선물의 배수도 여기 있다 — 두 곳에 적으면 화면에
 * 뜨는 값과 실제로 오르는 값이 갈린다.
 */
import { CharId, Rarity } from './chars';

/** 그 등급이 갈 수 있는 마지막 인연 레벨 */
export const RARITY_BOND: Record<Rarity, number> = {
  common: 3,
  rare: 6,
  epic: 10,
  legendary: 10,
  mythic: 10,
};

/** 어떤 등급이든 여기까지 — 화면이 게이지 칸 수를 잡을 때 쓴다 */
export const BOND_CAP = 10;

/** 인연의 단계 — 레벨 구간마다 이름이 있다 */
export interface BondStep {
  id: 'awkward' | 'friend' | 'trust' | 'love';
  name: string;
  /** 이 레벨부터 이 단계다 */
  from: number;
  /** 이 단계에서 열리는 이야기의 한 줄 소개 */
  hint: string;
}

/**
 * 넷으로 나눈다.
 *
 * 구간의 길이가 다르다 (3 · 3 · 4 · 1). 일부러다 — 마지막 하나가 상한
 * 하나뿐이라 `애정` 이 **닿는 자리**가 되고, 그 앞의 `신뢰` 가 제일 길어서
 * 거기서 오래 머문다. 넷을 똑같이 나누면 마지막 단계가 그냥 네 번째 칸이 된다.
 */
export const BOND_STEPS: readonly BondStep[] = [
  { id: 'awkward', name: '어색한 관계', from: 0, hint: '아직 서로를 잘 모릅니다.' },
  { id: 'friend', name: '우정', from: 3, hint: '농담을 주고받을 만큼은 되었습니다.' },
  { id: 'trust', name: '신뢰', from: 6, hint: '등을 맡길 수 있게 되었습니다.' },
  { id: 'love', name: '애정', from: 10, hint: '말하지 않아도 아는 사이가 되었습니다.' },
];

/** 이 레벨은 어느 단계인가 */
export function bondStep(lv: number): BondStep {
  let out = BOND_STEPS[0];
  for (const s of BOND_STEPS) if (lv >= s.from) out = s;
  return out;
}

/** 그 등급이 닿을 수 있는 마지막 단계 — 도감이 "여기까지" 를 적는다 */
export const bondStepCap = (rarity: Rarity): BondStep => bondStep(RARITY_BOND[rarity]);

/**
 * 한 칸 올리는 데 드는 애정 경험치.
 *
 * 뒤로 갈수록 는다 (100 · 150 · 200 …). 대화 한 번이 12~20 이므로
 * (`TALKS`) 처음 한 칸은 예닐곱 번, 끝 칸은 스무 번 남짓이다 — 하루 두 번
 * 이라는 상한이 있으므로 그 숫자가 곧 며칠이다.
 */
export const bondNeed = (lv: number): number => 100 + Math.max(0, lv) * 50;

/** 지금 레벨에서 상한까지 남은 애정 경험치 */
export function bondToCap(lv: number, exp: number, cap: number): number {
  if (lv >= cap) return 0;
  let out = -Math.max(0, exp);
  for (let k = lv; k < cap; k++) out += bondNeed(k);
  return Math.max(0, out);
}

/**
 * 애정 경험치를 넣는다 — **남는 것은 쌓인다.**
 *
 * 음수도 들어온다 (대화에서 이상한 것을 고르면). 그때는 레벨이 **안 내려
 * 간다** — 쌓아 둔 경험치만 깎인다. 며칠 걸려 올린 칸이 한 번 잘못 누른
 * 것으로 내려가면, 사람은 선택지를 고르는 대신 정답을 찾아보고 나서 누른다.
 */
export function bondFeed(
  lv: number, exp: number, add: number, cap: number,
): { lv: number; exp: number; up: number } {
  let nl = Math.max(0, Math.min(cap, lv));
  let ne = Math.max(0, exp) + Math.round(add);
  const was = nl;
  if (ne < 0) ne = 0;
  while (nl < cap && ne >= bondNeed(nl)) {
    ne -= bondNeed(nl);
    nl += 1;
  }
  /* 상한에서는 안 쌓는다 — 쌓아 봐야 쓸 데가 없고 화면의 수만 커진다 */
  if (nl >= cap) ne = 0;
  return { lv: nl, exp: ne, up: nl - was };
}

// ── 선물 ────────────────────────────────────────────────

export type GiftId =
  | 'gf_cookie' | 'gf_pie' | 'gf_carrot' | 'gf_rabbit'
  | 'gf_flower' | 'gf_bible' | 'gf_gong' | 'gf_tea';

export interface GiftDef {
  id: GiftId;
  name: string;
  /** 그림 (`assets/sprites/gift_icon/`) */
  art: string;
  /** 가방에 적는 한 줄 */
  desc: string;
}

export const GIFT_IDS: readonly GiftId[] = [
  'gf_cookie', 'gf_pie', 'gf_carrot', 'gf_rabbit',
  'gf_flower', 'gf_bible', 'gf_gong', 'gf_tea',
];

export const GIFTS: Record<GiftId, GiftDef> = {
  gf_cookie: { id: 'gf_cookie', name: '딸기맛 쿠키', art: 'gf_cookie', desc: '가장자리가 조금 탄 수제 쿠키.' },
  gf_pie: { id: 'gf_pie', name: '호두 파이', art: 'gf_pie', desc: '단단한 호두가 촘촘히 박혀 있다.' },
  gf_carrot: { id: 'gf_carrot', name: '당근 케이크', art: 'gf_carrot', desc: '위에 당근 조각이 하나 얹혀 있다.' },
  gf_rabbit: { id: 'gf_rabbit', name: '토끼 고기', art: 'gf_rabbit', desc: '잘 손질된 사냥감.' },
  gf_flower: { id: 'gf_flower', name: '진귀한 꽃', art: 'gf_flower', desc: '깊은 숲에서만 핀다는 꽃.' },
  gf_bible: { id: 'gf_bible', name: '성서', art: 'gf_bible', desc: '손때가 묻은 낡은 경전.' },
  gf_gong: { id: 'gf_gong', name: '목탁', art: 'gf_gong', desc: '어느 먼 동방에서 왔다는 나무 종.' },
  gf_tea: { id: 'gf_tea', name: '따뜻한 차', art: 'gf_tea', desc: '누구에게 줘도 나쁘지 않은 것.' },
};

/** 선물 하나가 올려 주는 밑값 */
export const GIFT_BASE = 20;

/**
 * ── 이 사람에게 이 선물은 어떤가 ── 배수.
 *
 *    2   아주 좋아한다
 *    1   나쁘지 않다 (기본)
 *   -1   싫어한다 — 애정이 **깎인다**
 *
 * 표에 없으면 1 이다. 사람마다 좋아하는 것 하나와 싫어하는 것 하나를 적어
 * 두면 나머지는 저절로 기본값이 되므로, 선물이 늘어도 이 표는 안 자란다.
 *
 * 리안느만 싫어하는 것이 없다. 넷이 다 같은 모양이면 "싫어하는 것이 하나씩
 * 있다" 가 규칙이 되어 안 줘 본 선물도 안 주게 되는데, 하나가 예외면 실제로
 * 줘 봐야 안다.
 */
export const GIFT_LIKE: Record<CharId, Partial<Record<GiftId, number>>> = {
  knightgirl: { gf_cookie: 2, gf_pie: -1 },
  bunnyaxe: { gf_carrot: 2, gf_rabbit: -1 },
  elfarcher: { gf_flower: 2 },
  nun: { gf_bible: 2, gf_gong: -1 },
};

/** 이 선물이 이 사람에게 주는 배수 */
export const giftMul = (who: CharId, gift: GiftId): number =>
  GIFT_LIKE[who]?.[gift] ?? 1;

/** 이 선물이 이 사람에게 주는 애정 경험치 (음수면 깎인다) */
export const giftExp = (who: CharId, gift: GiftId): number =>
  GIFT_BASE * giftMul(who, gift);

// ── 대화 ────────────────────────────────────────────────

/** 하루에 몇 번까지 말을 걸 수 있나 */
export const TALK_A_DAY = 2;

export interface TalkChoice {
  text: string;
  /** 고르면 오르는(또는 깎이는) 애정 경험치 */
  exp: number;
  /** 고른 뒤 그 사람이 하는 말 */
  reply: string;
}

export interface TalkDef {
  /** 그 사람이 먼저 하는 말 */
  ask: string;
  choices: readonly TalkChoice[];
}

/**
 * ── 대화 ── 사람마다 셋씩, 무작위로 하나가 나온다.
 *
 * 선택지는 늘 셋이고 **좋은 것 하나 · 그저 그런 것 하나 · 나쁜 것 하나**다.
 * 값도 셋으로 고정한다 (`+18` · `+6` · `-8`) — 대화마다 다르게 두면 어느
 * 대화가 이득인지를 세게 되고, 그러면 고르는 것이 아니라 푸는 것이 된다.
 *
 * 나쁜 것도 **레벨을 안 깎는다** (`bondFeed`). 쌓아 둔 것만 준다.
 */
export const TALK_GOOD = 18;
export const TALK_MEH = 6;
export const TALK_BAD = -8;

export const TALKS: Record<CharId, readonly TalkDef[]> = {
  knightgirl: [
    {
      ask: '…맹세를 지키는 일이 무겁게 느껴질 때가 있나요.',
      choices: [
        { text: '무거우니까 맹세인 거겠죠.', exp: TALK_GOOD, reply: '…그렇게 말해 준 건 당신이 처음입니다.' },
        { text: '가끔은 내려놔도 됩니다.', exp: TALK_MEH, reply: '…생각해 보겠습니다.' },
        { text: '그럼 그만두면 되잖아요.', exp: TALK_BAD, reply: '……그런 말은, 하지 말아 주십시오.' },
      ],
    },
    {
      ask: '앞에 서는 건 무섭지 않냐고들 묻습니다.',
      choices: [
        { text: '무서우니까 앞에 서는 거죠.', exp: TALK_GOOD, reply: '…당신은 사람을 잘 보는군요.' },
        { text: '익숙해지셨겠죠.', exp: TALK_MEH, reply: '익숙해지지는 않습니다. 다만 섭니다.' },
        { text: '기사니까 당연한 거 아닌가요.', exp: TALK_BAD, reply: '…당연한 것은 없습니다.' },
      ],
    },
    {
      ask: '오늘 방패에 흠이 하나 늘었습니다.',
      choices: [
        { text: '그만큼 누군가를 막아 준 거네요.', exp: TALK_GOOD, reply: '…그 흠을 그렇게 보아 주다니.' },
        { text: '고쳐 드릴까요?', exp: TALK_MEH, reply: '괜찮습니다. 아직 쓸 만합니다.' },
        { text: '방패를 좀 아껴 쓰세요.', exp: TALK_BAD, reply: '…아끼려고 든 것이 아닙니다.' },
      ],
    },
  ],
  bunnyaxe: [
    {
      ask: '야, 오늘 몇 마리 잡았게?',
      choices: [
        { text: '세다가 놓쳤어요.', exp: TALK_GOOD, reply: '큭, 정답! 나도 놓쳤거든.' },
        { text: '글쎄요, 열 마리쯤?', exp: TALK_MEH, reply: '에이, 그거보단 많지.' },
        { text: '그런 걸 왜 세요?', exp: TALK_BAD, reply: '……재미없는 소리 하네.' },
      ],
    },
    {
      ask: '이 도끼 무겁지? 한번 들어볼래?',
      choices: [
        { text: '이걸 매일 휘두른다고요?', exp: TALK_GOOD, reply: '그치! 이제 좀 알아주네.' },
        { text: '무겁긴 하네요.', exp: TALK_MEH, reply: '뭐, 그렇지.' },
        { text: '더 가벼운 걸 쓰시죠.', exp: TALK_BAD, reply: '…이건 그런 게 아니라고.' },
      ],
    },
    {
      ask: '나 사실… 다치면 좀 세지는 거 알아?',
      choices: [
        { text: '그래도 안 다쳤으면 좋겠는데요.', exp: TALK_GOOD, reply: '……야. 그런 말 하지 마. 이상하잖아.' },
        { text: '오, 편리하네요.', exp: TALK_MEH, reply: '편리하긴 하지.' },
        { text: '그럼 더 다치면 되겠네요.', exp: TALK_BAD, reply: '…너 진짜.' },
      ],
    },
  ],
  elfarcher: [
    {
      ask: '이 숲의 나무들은 나보다 오래 살아요.',
      choices: [
        { text: '그럼 당신은 아직 어린 거네요.', exp: TALK_GOOD, reply: '…후후. 그렇게 되나요.' },
        { text: '나무는 원래 오래 살죠.', exp: TALK_MEH, reply: '그렇죠.' },
        { text: '베면 금방인데요.', exp: TALK_BAD, reply: '…그런 말은 여기서 하지 마세요.' },
      ],
    },
    {
      ask: '화살은 놓는 게 아니라 보내는 거예요.',
      choices: [
        { text: '보낸 건 돌아오나요?', exp: TALK_GOOD, reply: '…좋은 질문이네요. 아직 답을 못 찾았어요.' },
        { text: '말이 좀 어렵네요.', exp: TALK_MEH, reply: '천천히 알게 될 거예요.' },
        { text: '맞으면 그만 아닌가요.', exp: TALK_BAD, reply: '…그러면 활을 들 이유가 없죠.' },
      ],
    },
    {
      ask: '가끔 아무 소리도 안 나는 밤이 있어요.',
      choices: [
        { text: '그런 밤엔 누가 옆에 있어야죠.', exp: TALK_GOOD, reply: '…네. 그런 것 같아요.' },
        { text: '조용해서 좋겠네요.', exp: TALK_MEH, reply: '좋을 때도 있어요.' },
        { text: '그냥 자면 되죠.', exp: TALK_BAD, reply: '…그렇게 간단하면 좋을 텐데요.' },
      ],
    },
  ],
  nun: [
    {
      ask: '오늘도 아무도 잃지 않았습니다. 다행이지요.',
      choices: [
        { text: '당신이 있어서 그런 거예요.', exp: TALK_GOOD, reply: '…아뇨. 그저 운이 좋았을 뿐입니다.' },
        { text: '다행이네요.', exp: TALK_MEH, reply: '네. 다행입니다.' },
        { text: '어차피 다시 일어나잖아요.', exp: TALK_BAD, reply: '…그렇게 말씀하시면 안 됩니다.' },
      ],
    },
    {
      ask: '제 손은 누구도 벨 수 없습니다.',
      choices: [
        { text: '벨 수 없는 손이 제일 세죠.', exp: TALK_GOOD, reply: '…그런 말을 들은 건 오랜만입니다.' },
        { text: '대신 고치시잖아요.', exp: TALK_MEH, reply: '그것이 제 몫이지요.' },
        { text: '그럼 전투엔 왜 나오세요?', exp: TALK_BAD, reply: '……' },
      ],
    },
    {
      ask: '기도는 들어주는 이가 없어도 합니다.',
      choices: [
        { text: '듣는 사람은 여기 있는데요.', exp: TALK_GOOD, reply: '…아. 그렇군요. 고맙습니다.' },
        { text: '경건하시네요.', exp: TALK_MEH, reply: '습관 같은 것입니다.' },
        { text: '그럼 헛수고 아닌가요.', exp: TALK_BAD, reply: '…헛된 것은 없습니다.' },
      ],
    },
  ],
};

// ── 이야기 ──────────────────────────────────────────────

/** 이야기 하나를 다 보면 주는 다이아 */
export const STORY_DIA = 100;

/** 이야기의 열쇠 — `<캐릭터>:<단계>` */
export const storyKey = (who: CharId, step: BondStep['id']): string => `${who}:${step}`;

/** 이 단계의 이야기를 볼 수 있나 — 그 단계에 닿아야 열린다 */
export const storyOpen = (lv: number, step: BondStep): boolean => lv >= step.from;
