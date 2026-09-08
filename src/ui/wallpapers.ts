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

/**
 * 열쇠 → 이미지. **인연 단계마다 한 장**이다 (`<사람>_<단계>`).
 *
 * 사람당 한 장씩 두던 시절에는 열쇠가 `knightgirl` 이었다. 인연 이야기가
 * 단계마다 다른 장을 주게 되면서 (`core/bond` 의 `BOND_STEPS`) 그 한 장이
 * 갈 자리가 없어졌다 — 어느 단계 것인지 말할 수 없으므로.
 *
 * 없는 것은 **그냥 없다.** 아직 안 그린 사람은 키가 하나도 없고, 화면이
 * 단추를 안 내건다 (`hasWallpaper`).
 */
export const WALLPAPERS: Record<string, number> = {
  knightgirl_awkward: require('../../assets/wallpaper/knightgirl_awkward.jpg'),
  knightgirl_friend: require('../../assets/wallpaper/knightgirl_friend.jpg'),
  knightgirl_trust: require('../../assets/wallpaper/knightgirl_trust.jpg'),
  knightgirl_love: require('../../assets/wallpaper/knightgirl_love.jpg'),
  /*
    비앙카 · 리안느 · 아녜스는 아직 없다. 프롬프트는 다 있다
    (`docs/BOND_ART_PROMPTS.md` §B4) — 들어오는 대로 넉 줄씩 더한다.
  */
};

/** 이 열쇠의 그림이 있나 — 없으면 화면이 단추를 안 내건다 */
export const hasWallpaper = (id: string): boolean => id in WALLPAPERS;

/** 그 열쇠의 그림 — 없으면 `undefined` */
export const wallpaperOf = (id: string): number | undefined => WALLPAPERS[id];

/**
 * 이 사람이 **받아 둔 것 중 제일 나중 것** — 없으면 `null`.
 *
 * 영웅 관리와 캐릭터 창의 월페이퍼 단추가 이걸 연다. 아무거나 열면 안 되는
 * 까닭: 월페이퍼는 이야기를 다 본 값이다 (`core/bond` 의 `readStory`). 안 본
 * 단계의 그림을 거기서 미리 보여 주면 그 이야기를 열 이유가 사라진다.
 *
 * @param read 그 사람의 다 본 단계들 (`BondState.read`) — 본 차례대로 들어온다
 */
export function ownedWallpaper(
  who: string, read: readonly string[],
): string | null {
  let out: string | null = null;
  /* 뒤엣것이 이긴다 — 목록이 본 차례이므로 마지막이 제일 나중 것이다 */
  for (const step of read) {
    const key = `${who}_${step}`;
    if (key in WALLPAPERS) out = key;
  }
  return out;
}

/**
 * 이 사람의 **모든** 월페이퍼 열쇠 — 받았든 안 받았든.
 *
 * ⚠ 시험용이다 (`FREE_ENHANCE`). 실제로는 이야기를 다 봐야 받는 것이므로
 * (`ownedWallpaper`), 이걸로 화면을 열면 안 본 이야기의 그림이 다 보인다.
 *
 * 차례는 인연 단계 순서다 — 어색 · 우정 · 신뢰 · 애정.
 */
export function allWallpapers(who: string): string[] {
  const order = ['awkward', 'friend', 'trust', 'love'];
  return order.map((s) => `${who}_${s}`).filter((k) => k in WALLPAPERS);
}
