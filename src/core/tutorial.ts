/**
 * 튜토리얼 — 처음 들어간 시스템을 한 번만 설명한다.
 *
 * 이 게임은 화면이 서른 장 가까이 된다. 대부분 처음 보면 뭘 눌러야 하는지 모른다.
 * 그렇다고 한 번에 다 가르칠 수는 없다 — 회원가입 직후 30장짜리 설명서를 넘기게 하면
 * 아무도 안 읽는다.
 *
 * 그래서 **그 화면에 처음 들어간 순간**에만, 그 화면 이야기만 한다.
 *  · 한 시스템 = 2~4 단계. 넘겨서 5초 안에 끝나야 한다.
 *  · 단계마다 "뭘 누르면 뭐가 되는지" 를 한 문장으로 말한다. 세계관 설명은 넣지 않는다.
 *  · 언제든 건너뛸 수 있다. 건너뛰면 그 화면은 다시 안 뜬다.
 *  · **설정·기타 탭에는 튜토리얼을 두지 않는다** — 설명이 필요한 화면이 아니고,
 *    거기서 튜토리얼을 끄러 온 사람에게 튜토리얼을 띄우는 건 우스운 일이다.
 *
 * 화면은 이 데이터를 읽기만 한다 (ui/Tutorial.tsx). 문구를 고치려면 여기만 고친다.
 */

export interface TutorialStep {
  /** 단계 제목 — 한 줄. "무엇을 하는 곳인가" */
  title: string;
  /** 본문 — 두 문장 안쪽. 길면 아무도 안 읽는다 */
  body: string;
  /**
   * 화면 안에서 눌러 볼 곳. `ui/Tutorial.tsx` 의 `TutorialAnchor id=` 와 맞춘다.
   * 등록된 앵커가 없으면 조용히 가운데 카드로 떨어진다 — 화면이 바뀌어도 안 깨진다.
   */
  anchor?: string;
  /** 함께 보여 줄 스프라이트 (set, name) */
  art?: [string, string];
}

export interface TutorialDef {
  /** 저장 키. 한 번 정하면 바꾸지 않는다 (바꾸면 이미 본 사람에게 다시 뜬다) */
  key: string;
  /** 오버레이 상단에 뜨는 이름 */
  title: string;
  steps: TutorialStep[];
}

/**
 * 첫 진입 안내 — 회원가입 직후 딱 한 번.
 * 다른 튜토리얼과 달리 화면 하나를 설명하지 않는다. **탭 다섯 개가 뭔지**만 알려 준다.
 */
export const INTRO_KEY = 'intro';

export const TUTORIALS: Record<string, TutorialDef> = {
  [INTRO_KEY]: {
    key: INTRO_KEY,
    title: '시작하기',
    steps: [
      {
        title: '장비를 올려 아이템레벨을 키우는 게임입니다',
        body: '전투는 오직 아이템레벨로 정해집니다. 같으면 반반, 1.5배 높으면 열에 아홉을 이깁니다.',
        art: ['slot', 'sword'],
      },
      {
        title: '홈 — 내 장비 16칸',
        body: '칸을 누르면 강화·수리·판매를 할 수 있습니다. 강화가 이 게임의 심장입니다.',
        anchor: 'tab-home',
        art: ['tab', 'home'],
      },
      {
        title: '지도 — 갈 수 있는 모든 곳',
        body: '상점·선술집·모험가사무소·오락실이 전부 지도 안에 있습니다. 돈은 여기서 법니다.',
        anchor: 'tab-town',
        art: ['tab', 'town'],
      },
      {
        title: '먼저 할 일',
        body: '지도 › 모험가사무소에서 퀘스트를 받아 보세요. 밑천이 생기면 상점에서 주문서를 삽니다.',
        art: ['bg_place', 'shop'],
      },
    ],
  },

  home: {
    key: 'home',
    title: '내 장비',
    steps: [
      {
        title: '16칸이 곧 아이템레벨입니다',
        body: '칸마다의 아이템레벨을 전부 더한 값으로 싸웁니다. 빈 칸은 그만큼 손해입니다.',
        anchor: 'home-slots',
      },
      {
        title: '칸을 눌러 강화하세요',
        body: '강화는 확률입니다. 실패하면 그대로, 높은 단계에서는 내려가거나 부서지기도 합니다.',
        anchor: 'home-slots',
        art: ['fx', 'burst_1'],
      },
      {
        title: '내구도가 닳으면 약해집니다',
        body: '전투마다 조금씩 닳고, 50% 아래로 내려가면 아이템레벨이 실제로 깎입니다. 상점에서 수리하세요.',
      },
    ],
  },

  town: {
    key: 'town',
    title: '지도',
    steps: [
      {
        title: '건물을 눌러 들어갑니다',
        body: '목록이 아니라 지도입니다. 가고 싶은 건물을 직접 누르세요.',
        anchor: 'town-map',
      },
      {
        title: '돈이 없으면 모험가사무소',
        body: '퀘스트·탐험·보스의탑이 전부 거기 있습니다. 밑천은 여기서 만듭니다.',
        art: ['bg_place', 'adventure'],
      },
      {
        title: '돈이 생기면 상점과 장인의집',
        body: '주문서를 사서 강화 확률을 올리고, 재료가 모이면 장인에게 무구를 제련시킵니다.',
        art: ['bg_place', 'artisan'],
      },
    ],
  },

  shop: {
    key: 'shop',
    title: '상점',
    steps: [
      {
        title: '주문서를 파는 곳입니다',
        body: '강화 확률을 올리거나, 하락·파괴를 막아 줍니다. 한 번에 한 장만 쓸 수 있습니다.',
        anchor: 'shop-scrolls',
        art: ['scroll', 'succ_low'],
      },
      {
        title: '수리도 여기서',
        body: '내구도가 50% 아래인 장비는 아이템레벨이 깎여 있습니다. 싸울 일이 있으면 먼저 고치세요.',
      },
    ],
  },

  adventure: {
    key: 'adventure',
    title: '모험가사무소',
    steps: [
      {
        title: '퀘스트 — 보증금을 걸고 도전합니다',
        body: '성공하면 배수로 돌려받고, 실패하면 보증금을 잃습니다. 어려울수록 배수가 큽니다.',
      },
      {
        title: '탐험 · 보스의탑 — 아이템레벨 싸움',
        body: '권장 아이템레벨에 딱 맞추면 승률 50%입니다. 1.5배면 93%, 1.5배 모자라면 20%입니다.',
        art: ['tab', 'money'],
      },
      {
        title: '체력을 씁니다',
        body: '10분에 1씩 차오릅니다. 다 쓰면 선술집에서 먹고 회복하거나 기다리세요.',
      },
    ],
  },

  arena: {
    key: 'arena',
    title: '투기장',
    steps: [
      {
        title: '다른 사람과 겨룹니다',
        body: '상대를 검색해 아이템레벨을 보고 고르세요. 이기면 점수가 오르고 시즌 끝에 보상을 받습니다.',
        anchor: 'arena-search',
      },
      {
        title: '수리를 안 하고 온 상대가 기회입니다',
        body: '내구도가 50% 아래면 상대의 실제 아이템레벨이 깎여 있습니다. 그 상대를 노리세요.',
      },
      {
        title: '결투는 다섯 합입니다',
        body: '도전하면 전투 장면이 나옵니다. 결과는 이미 정해져 있으니 급하면 화면을 눌러 건너뛰세요.',
      },
    ],
  },

  gamble: {
    key: 'gamble',
    title: '오락실',
    steps: [
      {
        title: '전부 기댓값이 1보다 낮습니다',
        body: '길게 하면 반드시 잃도록 되어 있습니다. 여윳돈으로만 하세요.',
        anchor: 'gamble-list',
      },
      {
        title: '그래도 오는 이유는 쿠지입니다',
        body: 'A상이 강화 확정 주문서입니다. 고티어 +15 는 사실상 이것 말고는 길이 없습니다.',
        art: ['scroll', 'guarantee'],
      },
    ],
  },

  ranking: {
    key: 'ranking',
    title: '랭킹',
    steps: [
      {
        title: '세 가지 순위가 있습니다',
        body: '아이템레벨 · 순자산 · 투기장 점수입니다. 기준마다 1등이 다릅니다.',
        anchor: 'ranking-tabs',
      },
      {
        title: '이름을 누르면 그 사람 장비가 보입니다',
        body: '위에 있는 사람이 뭘 입고 있는지가 다음 목표가 됩니다.',
      },
    ],
  },

  guild: {
    key: 'guild',
    title: '길드',
    steps: [
      {
        title: '혼자 못 하는 것을 같이 합니다',
        body: '출석·레이드·합동 사냥으로 길드 레벨이 오르고, 그만큼 보상이 커집니다.',
        anchor: 'guild-content',
      },
      {
        title: '길드 활동은 체력을 쓰지 않습니다',
        body: '체력은 탐험·탑·투기장의 예산입니다. 길드에 왔다고 혼자 할 일을 못 하게 되지는 않습니다.',
      },
      {
        title: '가입 첫날은 대기입니다',
        body: '자정이 지나야 정식 길드원이 됩니다. 길드를 옮겨 다니며 보상만 빼먹는 걸 막기 위해서입니다.',
      },
    ],
  },

  collection: {
    key: 'collection',
    title: '컬렉션',
    steps: [
      {
        title: '한 번이라도 가졌던 장비가 기록됩니다',
        body: '팔거나 부서져도 도감에는 남습니다. 채워질수록 보상이 나옵니다.',
        anchor: 'collection-grid',
      },
      {
        title: '칭호도 여기서 답니다',
        body: '칭호마다 효과가 다릅니다. 한 번에 하나만 달 수 있습니다.',
      },
    ],
  },

  artisan: {
    key: 'artisan',
    title: '장인의집',
    steps: [
      {
        title: '둔카락스가 무구를 만들어 줍니다',
        body: '보스의탑 50층에서 나오는 번스타인의 재료가 있어야 합니다.',
        anchor: 'artisan-forge',
      },
      {
        title: '장인 무구는 규칙이 다릅니다',
        body: '상한이 없습니다. 부서지지도, 내려가지도 않습니다 — 올라가거나 제자리입니다.',
      },
      {
        title: '대신 갈수록 어려워집니다',
        body: '첫 칸은 60%, 99강에서 100강은 0.4%입니다. 세 자리 강화는 평생의 과업입니다.',
      },
    ],
  },

  tower: {
    key: 'tower',
    title: '보스의탑',
    steps: [
      {
        title: '한 층씩 올라갑니다',
        body: '층마다 권장 아이템레벨이 있습니다. 딱 맞추면 반반입니다.',
      },
      {
        title: '50층에 번스타인이 있습니다',
        body: '장인 무구의 재료가 전부 여기서 나옵니다. 확정 드랍이 아니니 여러 번 올라야 합니다.',
      },
    ],
  },

  gather: {
    key: 'gather',
    title: '채집',
    steps: [
      {
        title: '체력이 남을 때 하는 부수입입니다',
        body: '하루 횟수가 정해져 있습니다. 도구 등급이 오르면 수확도 같이 오릅니다.',
        anchor: 'gather-go',
      },
      {
        title: '도감이 따로 있습니다',
        body: '처음 잡은 종은 기록되고, 모으면 보상이 나옵니다.',
      },
    ],
  },

  abyss: {
    key: 'abyss',
    title: '심연',
    steps: [
      {
        title: '내려갈지 돌아갈지만 고릅니다',
        body: '한 층 통과할 때마다 보상이 쌓이고, 실패하면 그때까지 쌓은 것을 전부 잃습니다.',
        anchor: 'abyss-enter',
      },
      {
        title: '깊을수록 재료가 좋아집니다',
        body: '연금술 재료가 여기서만 나옵니다. 욕심과 손절 사이가 이 콘텐츠의 전부입니다.',
      },
    ],
  },
};

/** 그 화면에 튜토리얼이 있는가 */
export const tutorialOf = (key: string): TutorialDef | null => TUTORIALS[key] ?? null;

export const TUTORIAL_KEYS = Object.keys(TUTORIALS);
