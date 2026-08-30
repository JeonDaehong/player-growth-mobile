import { g } from '@/core/currency';
/**
 * 플레이어 아바타 (투기장 로고).
 * 지금은 고스트 상대의 얼굴로도 쓰이지만, 실제 PvP 가 붙으면
 * "내가 고른 아바타가 상대 화면에 뜨는" 대전 로고가 된다.
 *
 * ## 기본 12 + 특별 4
 *
 * 앞의 12종은 처음부터 전부 열려 있다 — 얼굴을 고르는 건 게임을 시작하는 행위지
 * 보상이 아니다. 뒤의 4종은 **얻어야 하는 것**이다. 로고는 남의 화면(투기장·채팅
 * 명패·랭킹)에 뜨는 유일한 그림이라, "저건 어디서 났지" 가 성립하는 몇 안 되는
 * 자리다. 그래서 넷의 출처를 전부 다르게 뒀다 — 사는 것 둘, 뽑는 것 하나,
 * 다시는 못 받는 것 하나.
 *
 * ## 그림체를 일부러 갈라 놨다
 *
 * 기본 12종은 거리에서 굴러먹은 사람들이다 — 가면 쓴 결투가, 파산한 상인, 빚쟁이
 * 기사. 특별 4종은 **일본 애니메이션풍 여성 캐릭터**로, 한눈에 다른 계열로 보인다.
 * 톤을 맞추면 얻은 티가 안 난다 — 12종 사이에 13번째 낡은 얼굴이 하나 더 늘 뿐이다.
 *
 * 넷 다 **무기 하나를 끼고 있다** (검·망치·지팡이·기). 이 게임이 장비를 키우는
 * 게임이라 얼굴만 예쁜 것보다 무기를 든 쪽이 이 화면에 맞고, 64px 흉상에서
 * 어깨 너머로 삐져나온 무기가 실루엣을 갈라 주는 실용적인 이유도 있다.
 */
export const AVATAR_IDS = [
  // 기본 12 — 처음부터 열려 있다
  'swordsman', 'miner', 'mercenary', 'knight', 'regular', 'merchant',
  'duelist', 'robber', 'deserter', 'baron', 'spearman', 'archer',
  // 특별 4 — 얻어야 한다 (AVATAR_SOURCE)
  'bunnyblade', 'maidhammer', 'witchgirl', 'knightgirl',
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const AVATAR_NAME: Record<AvatarId, string> = {
  swordsman: '무명의 검객',
  miner: '떠돌이 광부',
  mercenary: '은퇴한 용병',
  knight: '빚쟁이 기사',
  regular: '술집 단골',
  merchant: '파산한 상인',
  duelist: '가면의 결투가',
  robber: '전직 도굴꾼',
  deserter: '수도원 탈주자',
  baron: '노름꾼 자작',
  spearman: '외팔이 창병',
  archer: '고아 궁수',
  bunnyblade: '칼 찬 바니걸',
  maidhammer: '망치 든 메이드',
  witchgirl: '견습 마법소녀',
  knightgirl: '첫 백기사',
};

/** 얻는 방법 */
export type AvatarSource = 'default' | 'gold' | 'kuji' | 'title';

export const AVATAR_SOURCE: Record<AvatarId, AvatarSource> = {
  swordsman: 'default', miner: 'default', mercenary: 'default', knight: 'default',
  regular: 'default', merchant: 'default', duelist: 'default', robber: 'default',
  deserter: 'default', baron: 'default', spearman: 'default', archer: 'default',

  // 이세계 행상인에서 골드로 산다
  bunnyblade: 'gold',
  maidhammer: 'gold',
  // 오락실 쿠지 — 로고 회차의 A상 (500칸 중 1칸)
  witchgirl: 'kuji',
  // '초기 정착민' 칭호를 받은 사람에게 딸려 온다. 자리가 나가면 두 번 다시 안 열린다
  knightgirl: 'title',
};

/** 어디서 났는지 한 줄로 — 로고 선택 화면이 잠긴 칸에 적는다 */
export const AVATAR_FROM: Record<AvatarSource, string> = {
  default: '',
  gold: '뒷동산 › 이세계 행상인',
  kuji: '오락실 › 쿠지 (로고 회차 A상)',
  title: '"초기 정착민" 칭호를 받으면',
};

/** 처음부터 열려 있는 것들 */
export const DEFAULT_AVATARS: AvatarId[] =
  AVATAR_IDS.filter((id) => AVATAR_SOURCE[id] === 'default');

/**
 * 골드로 파는 로고의 값 (이세계 행상인).
 *
 * 예전에는 다이아(현금 재화)로 팔았다. 화폐를 골드 하나로 줄이면서
 * (`core/currency`) 값도 골드로 옮겼다 — 50골드는 장비를 끝까지 올리는 데
 * 드는 돈과 비슷한 자리다. 영구 치장이 그 정도는 되어야 무게가 맞는다.
 */
export const AVATAR_PRICE: Partial<Record<AvatarId, number>> = {
  bunnyblade: g(50),
  maidhammer: g(50),
};

export const DEFAULT_AVATAR: AvatarId = 'swordsman';

export const isAvatarId = (v: string): v is AvatarId =>
  (AVATAR_IDS as readonly string[]).includes(v);

/**
 * 고스트 상대에게 배정할 아바타 — 이름이 같으면 얼굴도 같게 (시드 없이 결정).
 *
 * ⚠ **기본 12종에서만 고른다.** 특별 로고는 돈을 냈거나 선착순 자리를 잡은
 * 사람의 표식인데, 없는 사람의 얼굴로 지어내 뿌리면 그 표식이 아무 의미가 없어진다.
 */
export function avatarForName(name: string): AvatarId {
  const entry = (Object.entries(AVATAR_NAME) as [AvatarId, string][]).find(([, n]) => n === name);
  if (entry && AVATAR_SOURCE[entry[0]] === 'default') return entry[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return DEFAULT_AVATARS[h % DEFAULT_AVATARS.length];
}
