/**
 * 캐릭터 월페이퍼 — 한 명당 한 장 (`assets/wallpaper/`).
 *
 * ## 왜 목록을 손으로 적나
 *
 * 번들러가 `require` 를 **빌드할 때** 정적으로 읽는다. `require('.../' + id)`
 * 처럼 만들어 넣으면 파일을 못 찾고, 웹에서는 통째로 빠진 채 배포된다.
 * 스프라이트 인덱스를 생성해서 쓰는 것도(`ui/spriteAssets`) 같은 이유다.
 *
 * 넷뿐이고 캐릭터를 만들 때마다 한 줄이라 여기는 생성기를 두지 않았다.
 * 대신 **없으면 없는 대로 지나간다** — 새 캐릭터에 아직 그림이 없으면
 * 화면이 단추를 안 내건다 (`hasWallpaper`).
 */

/** 캐릭터 id → 이미지. 없는 사람은 아예 키가 없다 */
export const WALLPAPERS: Record<string, number> = {
  /*
    ── 인연 이야기가 주는 장들 ──

    단계마다 한 장이다 (`<사람>_<단계>`). 들어오는 대로 여기 줄을 더한다 —
    아직 없는 것은 아래 사람 것으로 떨어진다 (`wallpaperOf`).

      knightgirl_awkward: require('../../assets/wallpaper/knightgirl_awkward.jpg'),
      knightgirl_friend:  require('../../assets/wallpaper/knightgirl_friend.jpg'),
      knightgirl_trust:   require('../../assets/wallpaper/knightgirl_trust.jpg'),
      knightgirl_love:    require('../../assets/wallpaper/knightgirl_love.jpg'),
      … bunnyaxe_* · elfarcher_* · nun_* 도 같은 넷씩

    프롬프트는 `docs/BOND_ART_PROMPTS.md` §B4 에 열여섯 개가 다 있다.
  */
  knightgirl: require('../../assets/wallpaper/knightgirl.jpg'),
  bunnyaxe: require('../../assets/wallpaper/bunnyaxe.jpg'),
  elfarcher: require('../../assets/wallpaper/elfarcher.jpg'),
  nun: require('../../assets/wallpaper/nun.jpg'),
};

/**
 * 이 열쇠의 월페이퍼가 있나 — 없으면 단추를 안 내건다.
 *
 * 열쇠는 `knightgirl` 이거나 `knightgirl_love` 다. 뒤엣것은 인연 이야기가
 * 주는 것이라 단계마다 다른 장이 붙는다 (`core/bond` 의 `BondStep`).
 *
 * **없으면 사람 것으로 떨어진다** (`baseOf`). 열여섯 장이 한꺼번에 들어올
 * 리가 없으므로, 아직 안 온 단계는 지금 있는 한 장을 그대로 쓴다 — 그래야
 * 그림이 도착하는 순서와 상관없이 이야기가 늘 뭔가를 보여 준다.
 */
export const hasWallpaper = (id: string): boolean => !!wallpaperOf(id);

/** `knightgirl_love` 에서 `knightgirl` 을 떼어 낸다 (캐릭터 id 에는 `_` 가 없다) */
const baseOf = (id: string): string => id.split('_')[0];

/** 그 열쇠의 그림 — 단계 것이 없으면 사람 것으로 (`hasWallpaper` 머리말) */
export const wallpaperOf = (id: string): number | undefined =>
  WALLPAPERS[id] ?? WALLPAPERS[baseOf(id)];
