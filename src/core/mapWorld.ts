/**
 * 세계 지도.
 *
 * 목록으로 나열하면 "메뉴를 고르는" 느낌이지만, 좌표를 주면 "장소를 찾아가는"
 * 느낌이 된다. 좌표는 **0~100 격자의 비율값**이라 화면 폭이 달라도 배치가 유지된다.
 *
 * 구조는 3단이다:
 *   지역(Area) ⊃ 구역(District) ⊃ 장소(Place)
 * 마을 안에 광장·중심가·주거지가 있고, 그 안에 건물이 있는 식이다.
 * 새 지역을 추가할 때는 AREAS 에 한 줄, 필요하면 DISTRICTS 에 몇 줄만 더하면 된다
 * (`locked: true` 로 두면 잠긴 채 지도에 보인다 — 다음에 뭐가 열릴지 알려 준다).
 *
 * 순수 데이터라 화면 없이 검증할 수 있다 (겹침·범위·연결·고아 참조).
 */
import type { TownStackParams } from './mapRoutes';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Area {
  id: string;
  label: string;
  /** 한 줄 소개 — 지도에서 지역을 눌렀을 때 */
  sub: string;
  box: Box;
  /** 배경 아트 (assets/sprites/map). 없으면 테두리만 그린다 */
  art?: { set: string; name: string };
  /** 아직 갈 수 없는 지역 — 확장 자리를 미리 보여 준다 */
  locked?: boolean;
}

export interface District {
  id: string;
  areaId: string;
  label: string;
  box: Box;
}

export interface Place {
  id: keyof TownStackParams;
  label: string;
  /** 팝업에 뜨는 소개 — 무슨 곳인지 한두 문장으로 */
  desc: string;
  districtId: string;
  /** 지도 위 아이콘 중심 (0~100) */
  x: number;
  y: number;
  art: { set: string; name: string };
  /** 아트가 아직 없을 때 대신 그릴 코드 스프라이트 키 (src/ui/sprites ICONS) */
  fallback?: 'coin' | 'chart' | 'skull' | 'sword' | 'scroll';
}

/**
 * 지역 배치 — 위가 북쪽. 정령의 숲(북) → 마을(중앙) → 마을 외곽(동남).
 * 잠긴 지역 두 곳은 지도 가장자리에 두어 "세계가 더 있다" 는 느낌만 준다.
 */
export const AREAS: Area[] = [
  {
    id: 'forest', label: '정령의 숲', sub: '엘프가 정령석을 깎는 곳',
    box: { x: 3, y: 2, w: 46, h: 19 },
    art: { set: 'map', name: 'forest' },
  },
  {
    id: 'hill', label: '뒷동산', sub: '마을 뒤 언덕 — 내 집이 있다',
    box: { x: 51, y: 2, w: 46, h: 19 },
    art: { set: 'map', name: 'wild' },
  },
  {
    id: 'town', label: '마을', sub: '광장 · 중심가 · 가게',
    box: { x: 3, y: 23, w: 66, h: 54 },
    art: { set: 'map', name: 'town' },
  },
  {
    id: 'outskirt', label: '마을 외곽', sub: '마물의숲 · 사냥터 · 보스의탑',
    box: { x: 71, y: 23, w: 26, h: 54 },
    art: { set: 'map', name: 'ruin' },
  },
  {
    // 탑 30층을 깨야 열린다. 열리기 전에도 지도에 보인다 — 다음에 뭐가 열리는지 알려 준다
    id: 'rift', label: '갈라진 땅', sub: '땅이 갈라진 자리. 아래에서 바람이 올라온다',
    box: { x: 3, y: 80, w: 94, h: 17 },
    art: { set: 'map', name: 'rift' },
  },
];

/** 탑 몇 층을 깨야 갈라진 땅이 열리는가. 템렙 조건보다 행동 조건이 명확하다 */
export const RIFT_UNLOCK_FLOOR = 30;

/** 마을은 세 구역으로 나뉜다 — 건물 성격이 뭉쳐 보이게 */
export const DISTRICTS: District[] = [
  { id: 'grove',   areaId: 'forest',   label: '숲속',   box: { x: 6,  y: 6,  w: 40, h: 13 } },
  { id: 'yard',    areaId: 'hill',     label: '언덕길', box: { x: 54, y: 6,  w: 40, h: 13 } },
  { id: 'plaza',   areaId: 'town',     label: '광장',   box: { x: 6,  y: 27, w: 60, h: 15 } },
  { id: 'main',    areaId: 'town',     label: '중심가', box: { x: 6,  y: 44, w: 60, h: 15 } },
  { id: 'market',  areaId: 'town',     label: '가게',   box: { x: 6,  y: 61, w: 60, h: 15 } },
  { id: 'wildland',areaId: 'outskirt', label: '사냥터', box: { x: 73, y: 27, w: 22, h: 48 } },
  { id: 'crack',   areaId: 'rift',     label: '균열',   box: { x: 6,  y: 84, w: 88, h: 11 } },
];

/**
 * 배치 원칙
 *  · 자주 가는 곳(집·상점)은 아래쪽 = 엄지가 닿는 자리
 *  · 돈을 쓰는 곳은 광장에 모아 "그 구역" 처럼 보이게
 *  · 정령의 숲은 마을 밖 위쪽 — 새로 열린 지역이라는 느낌
 */
export const PLACES: Place[] = [
  // 정령의 숲 › 숲속
  { id: 'Gather', label: '채집터', districtId: 'grove', x: 12, y: 13,
    art: { set: 'bg_place', name: 'gather' },
    desc: '숲 그늘에 약초와 버섯이 돋고, 무너진 돌 틈에는 광물이 박혀 있습니다. 손이 야무질수록, 도구가 좋을수록 값나가는 것이 올라옵니다.' },
  { id: 'ElfHouse', label: '엘프의 집', districtId: 'grove', x: 32, y: 13,
    art: { set: 'bg_place', name: 'artisan' },
    desc: '숲을 지키는 엘프가 정령석을 내어 줍니다. 장비에 룬각인을 새겨 잠들어 있던 힘을 깨울 수 있습니다.' },

  /*
    뒷동산 › 언덕길.

    여기 '집' 이 있었다. 창고·채집물 창고·번스타인 재료를 두고, 장비를 갈아입는
    곳이었다. 없앴다 — 하는 일이 전부 **장비를 만지는 일**인데 장비는 홈에 있어서,
    집은 홈에서 한 번 더 걸어와야 하는 두 번째 홈이었다. 안에 있던 것은 전부
    홈으로 옮겼다 (`ui/StoragePanels`).
  */
  // 세 활동을 일부러 멀리 떨어뜨렸다. 한곳에 몰면 "채집 탭 3개" 가 된다
  { id: 'Fish', label: '호숫가', districtId: 'yard', x: 66, y: 13,
    art: { set: 'bg_place', name: 'fish' },
    desc: '바람이 잔잔한 물가입니다. 찌를 던져 두고 숨을 고르며 기다리면, 물속의 것들이 하나씩 걸려 올라옵니다.' },
  { id: 'Merchant', label: '이세계 행상인', districtId: 'yard', x: 88, y: 13,
    art: { set: 'bg_place', name: 'shop' },
    desc: '어디서 왔는지 모를 행상인이 좌판을 폈습니다. 골드를 받고 이 세계에서는 구할 수 없는 물건을 내어 줍니다.' },

  // 마을 › 광장 — 돈을 쓰는 곳
  /*
    주식장이 있던 x=36 자리로 옮겼다.

    광장은 세 칸짜리 가로줄이고 가운데 칸(x=36)이 은행·선술집으로 내려가는 **세로
    기둥**이었다. 주식장을 없애면서 그 칸이 비면 광장에서 아래 구역으로 내려가는
    길이 끊긴다. 오락실이 그 자리를 이어받는다.
  */
  { id: 'Gamble',  label: '오락실',   districtId: 'plaza', x: 36, y: 35,
    art: { set: 'bg_place', name: 'gamble' },
    desc: '동전 구르는 소리가 밤새 끊이지 않는 곳입니다. 크리처 러쉬에 판돈을 걸고, 쿠지와 가챠를 뽑고, 지뢰를 피해 칸을 열며 한 방을 노립니다.' },
  { id: 'Lottery', label: '복권상점', districtId: 'plaza', x: 57, y: 35,
    art: { set: 'lottery', name: 'ticket_plain' },
    desc: '하루에 열 장까지 살 수 있습니다. 매일 저녁 여덟 시에 추첨하니, 사 두고 해가 지기를 기다리는 재미가 있습니다.' },

  // 마을 › 중심가 — 일하고 맡기고 겨루는 곳
  /*
    은행이 있던 x=36 자리로 옮겼다.

    중심가도 세 칸짜리 가로줄이고, 가운데 칸이 광장(오락실)과 가게(선술집)를
    잇는 **세로 기둥**이었다. 은행을 없애면서 그 칸이 비면 마을이 위아래로 끊긴다.
    주식장을 없앨 때 광장에서 했던 것과 같은 처리다.
  */
  { id: 'Adventure', label: '모험가사무소', districtId: 'main', x: 36, y: 52,
    art: { set: 'bg_place', name: 'office' },
    desc: '게시판에 일감이 빼곡히 붙어 있습니다. 몸으로 때우는 아르바이트부터 보증금을 걸고 나서는 퀘스트까지 골라 받습니다.' },
  { id: 'Arena',     label: '투기장',     districtId: 'main', x: 57, y: 52,
    art: { set: 'bg_place', name: 'arena' },
    desc: '다른 모험가가 남기고 간 그림자와 겨룹니다. 시즌마다 판이 새로 짜이고, 성적만큼 뱃지가 쌓입니다.' },

  // 마을 › 가게
  { id: 'Shop',    label: '상점',     districtId: 'market', x: 15, y: 69,
    art: { set: 'bg_place', name: 'shop' },
    desc: '장비와 강화 주문서를 파는 마을의 기본 가게입니다. 채집 도구의 등급을 올리거나, 쓰지 않는 물건을 넘겨 돈으로 바꿀 수도 있습니다.' },
  { id: 'Tavern',  label: '선술집',   districtId: 'market', x: 36, y: 69,
    art: { set: 'bg_place', name: 'tavern' },
    desc: '떠들썩한 홀에서 한 잔 걸치면 지친 몸이 풀립니다. 취객들이 흘리는 소문에는 가끔 진짜가 섞여 있습니다.' },
  { id: 'Artisan', label: '장인의집', districtId: 'market', x: 57, y: 69,
    art: { set: 'bg_place', name: 'artisan' },
    desc: '망가진 장비를 말없이 손봐 주는 노인이 있습니다. 재료를 모아 오면 장인의 무구를 제련해 주기도 합니다.' },

  // 마을 외곽 › 사냥터 — 탐험과 보스의탑을 분리했다
  { id: 'Beastwood', label: '마물의숲', districtId: 'wildland', x: 84, y: 38,
    art: { set: 'bg_place', name: 'beastwood' },
    desc: '마을 밖으로 끝없이 뻗은 깊은 숲입니다. 백서른 개의 챕터를 차례로 밀고 나아갈수록 더 사나운 것들이 기다립니다.' },
  { id: 'Hunt',      label: '수렵터',   districtId: 'wildland', x: 84, y: 52,
    art: { set: 'bg_place', name: 'hunt' },
    desc: '짐승 열두 종이 수풀 사이로 자리를 옮겨 다닙니다. 모습을 드러내는 그 순간을 놓치지 않아야 사냥이 됩니다.' },
  { id: 'Tower',     label: '보스의탑', districtId: 'wildland', x: 84, y: 66,
    art: { set: 'bg_place', name: 'tower' },
    desc: '하늘을 향해 오십 층으로 쌓아 올린 탑입니다. 위로 오를수록 장인의 무구에 들어가는 귀한 재료가 나옵니다.' },

  // 갈라진 땅 › 균열 — 연금술사를 심연 입구에 둔다 (건져 온 걸 그 자리에서 녹인다)
  { id: 'Abyss',     label: '심연',            districtId: 'crack', x: 35, y: 89,
    art: { set: 'bg_place', name: 'abyss' },
    desc: '갈라진 땅 아래로 끝을 모르고 내려갑니다. 깊이 들어갈수록 건질 것이 많아지지만, 돌아설 때를 정하는 건 오직 당신입니다.' },
  { id: 'Alchemist', label: '연금술사의 천막', districtId: 'crack', x: 65, y: 89,
    art: { set: 'bg_place', name: 'alchemist' },
    desc: '심연 입구에 천막을 친 연금술사입니다. 건져 온 재료를 그 자리에서 연성액으로 녹여 장비에 부어 줍니다.' },
];

/** 지도에 그리는 길 */
export const ROADS: [string, string][] = [
  // 구역을 잇는 큰 길 (세로)
  ['Gamble', 'Adventure'], ['Adventure', 'Tavern'],
  // 구역 안의 길 (가로)
  ['Gamble', 'Lottery'],
  ['Adventure', 'Arena'],
  ['Shop', 'Tavern'], ['Tavern', 'Artisan'],
  // 마을 밖으로
  ['Gamble', 'ElfHouse'], ['ElfHouse', 'Gather'],
  ['Lottery', 'Fish'], ['Fish', 'Merchant'],
  ['Arena', 'Beastwood'], ['Beastwood', 'Hunt'], ['Hunt', 'Tower'], ['Artisan', 'Tower'],
  // 갈라진 땅으로 — 탑에서 이어진다
  ['Tower', 'Abyss'], ['Abyss', 'Alchemist'],
];

export const placeById = (id: string) => PLACES.find((p) => p.id === id);
export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id);
export const areaOfPlace = (p: Place) => {
  const d = districtById(p.districtId);
  return d ? AREAS.find((a) => a.id === d.areaId) : undefined;
};

/** 갈 수 있는 지역만 (지금은 전부 열려 있다 — locked 는 확장용으로 남겨 둔다) */
export const openAreas = () => AREAS.filter((a) => !a.locked);

/** 두 장소가 너무 가까워 아이콘이 겹치는가 (설계 검증용) */
export function tooClose(a: Place, b: Place, min = 12): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < min;
}

/** 사각형이 다른 사각형 안에 들어 있는가 */
export function inside(inner: Box, outer: Box): boolean {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.w <= outer.x + outer.w
    && inner.y + inner.h <= outer.y + outer.h;
}

/** 두 사각형이 겹치는가 */
export function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
