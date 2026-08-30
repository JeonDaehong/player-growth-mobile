/**
 * 지도 스택의 화면 목록.
 *
 * nav.ts 는 React Navigation 타입을 물고 있어 core 에서 쓸 수 없다.
 * 지도 데이터(mapWorld)가 참조할 수 있도록 키만 따로 둔다.
 */
export type TownStackParams = {
  TownHub: undefined;
  Gamble: undefined;
  Rush: undefined;
  Kuji: undefined;
  Gacha: undefined;
  Lottery: undefined;
  Adventure: undefined;
  Arena: undefined;
  Outskirts: undefined;   // 예전 통합 화면 (직접 접근하지 않음)
  Beastwood: undefined;   // 마물의숲 (탐험)
  Tower: undefined;       // 보스의탑
  Shop: undefined;
  Tavern: undefined;
  Artisan: undefined;
  ElfHouse: undefined;
  Merchant: undefined;   // 이세계 행상인 (캐시 상점)

  // 채집 · 수렵 · 낚시 — 미니게임이 서로 달라 화면도 따로 둔다
  Gather: undefined;
  Hunt: undefined;
  Fish: undefined;

  // 심연 · 연금술
  Abyss: undefined;
  Alchemist: undefined;

  // 오락실 추가 콘텐츠
  Mines: undefined;
};
