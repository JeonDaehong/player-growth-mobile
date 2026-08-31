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
  knightgirl: require('../../assets/wallpaper/knightgirl.jpg'),
  bunnyaxe: require('../../assets/wallpaper/bunnyaxe.jpg'),
  elfarcher: require('../../assets/wallpaper/elfarcher.jpg'),
  nun: require('../../assets/wallpaper/nun.jpg'),
};

/** 이 사람의 월페이퍼가 있나 — 없으면 단추를 안 내건다 */
export const hasWallpaper = (id: string): boolean => id in WALLPAPERS;
