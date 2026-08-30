/**
 * 스토어에서 **읽어 가는** 것들.
 *
 * 컴포넌트가 `useGame(...)` 로 직접 파도 되지만, 여러 값을 엮어 계산하는 건
 * 여기 모아 둔다. 같은 계산이 화면마다 조금씩 다르게 복사되면 (실제로 그랬다)
 * 어느 화면에서만 룬 보너스가 빠지는 식으로 어긋난다.
 *
 * ## ⚠ 셀렉터는 **안정된 값**을 돌려줘야 한다
 *
 * zustand 5 는 셀렉터 결과를 `Object.is` 로 비교한다. 그래서
 * `useGame((s) => ({ a: s.a, b: s.b }))` 처럼 **매번 새 객체**를 만들면 항상
 * "바뀌었다" 가 되어 무한 렌더에 빠진다. 이 프로젝트에서 실제로 앱 전체가
 * 흰 화면이 된 적이 있다 (`selUnlockCtx` 가 그랬다).
 *
 * 규칙: 셀렉터는 **원시값**을 돌려준다. 여러 값을 묶어야 하면 훅으로 만들고
 * 안에서 각각 따로 구독한 뒤 `useMemo` 로 묶는다 (`useUnlockCtx` 가 본보기다).
 * `__smoke__` 의 "셀렉터 안정성" 검사가 `sel*` 전부를 두 번 불러 확인한다.
 */

import { useMemo } from 'react';
import { Item, SLOT_IDS, isWeaponKind } from '@/core/types';
import {
  equippedCount,
  hasDurabilityPenalty,
  itemLevel,
  playerCurrentIlvl,
  playerIlvl,
} from '@/core/tiers';

import { TitleEffects, effectsOf } from '@/core/titles';
import { guildEffects } from '@/core/guildSkill';
import { Guild } from '@/core/guilds';
import { useMyGuildLive } from './useGuilds';
import { useMeId } from './useBoard';
import { UnlockCtx } from '@/core/unlock';
import { GRADE_INFO, spiritTotal } from '@/core/spirit';
import { breakdown } from '@/core/networth';
import { Player } from '@/core/ranking';
import { useGame } from './store';
import type { GameState, Store } from './types';
import { selMaxStamina, titleMods, weeklyPointsOf } from './helpers';

/*
  이 둘의 본체는 `helpers.ts` 에 있다 — 스토어 **액션**도 같은 것을 쓰기 때문이다
  (여기 두면 store → selectors → store 순환이 된다). 화면 입장에서는 셀렉터이므로
  이름은 여기서 잇는다.
*/
export { selMaxStamina, titleMods };

/**
 * 아이템레벨 = 장비 합 + 룬각인 세트 시너지.
 *
 * 정령석 **개별** 보너스는 itemLevel 이 이미 더한다 (칸마다 보이는 숫자).
 * 세트 시너지는 여러 칸을 봐야 계산되므로 여기서 한 번 더 얹는다.
 */
/** 칭호에서 오는 룬·세트 보정. 화면과 전투가 같은 값을 쓰게 한 곳에서 뽑는다 */


/**
 * 스칼라로 나눠 둔 이유: 객체를 돌려주는 셀렉터는 매번 새 참조라
 * useSyncExternalStore 가 무한 리렌더로 본다 (useAssets 와 같은 함정).
 */
export const selRuneMul = (s: Store) => titleMods(s).runeIlvlMul;
/** 강화에 쓰이는 정령석 보정. 객체 셀렉터는 무한 리렌더가 나므로 스칼라로 나눈다 */
export const selRuneRate = (s: Store) =>
  spiritTotal(s.equipped, titleMods(s)).bonus.enhance_rate ?? 0;
export const selRuneGuard = (s: Store) =>
  spiritTotal(s.equipped, titleMods(s)).bonus.enhance_guard ?? 0;
export const selSetMul = (s: Store) => titleMods(s).setSynergyMul;

export const selIlvl = (s: Store) => {
  const base = playerIlvl(s.equipped);
  const t = spiritTotal(s.equipped, titleMods(s));
  const individual = SLOT_IDS.reduce((a, sl) => {
    const sp = s.equipped[sl]?.spirit;
    if (!sp) return a;
    const info = (GRADE_INFO as Record<string, { ilvl: number }>)[sp.grade];
    return a + (info?.ilvl ?? 0);
  }, 0);
  return Math.round((base + (t.ilvl - individual)) * 10) / 10;
};
export const selCurIlvl = (s: Store) => playerCurrentIlvl(s.equipped, titleMods(s).runeIlvlMul);
export const selPenalty = (s: Store) => hasDurabilityPenalty(s.equipped);
/** 칭호로 늘어난 체력 최대치 (개척자 +2). 게이지·안내 문구가 전부 여기를 본다 */

export const selEquippedCount = (s: Store) => equippedCount(s.equipped);

/**
 * 자산 분류 · 랭킹용 내 정보.
 * ⚠ 둘 다 매번 새 객체를 만들므로 useGame 셀렉터로 직접 쓰면 무한 리렌더가 난다.
 * 아래 훅으로만 쓴다 (useEffects 와 같은 이유).
 */
export function useAssets() {
  const money = useGame((s) => s.money);
  const equipped = useGame((s) => s.equipped);
  const inventory = useGame((s) => s.inventory);
  return useMemo(
    () => breakdown({ money, equipped, inventory }),
    [money, equipped, inventory],
  );
}

/**
 * 잠금·해금 판정에 넘길 관측값.
 *
 * `bestTier` 는 **가진 것 전부**에서 고른다 (착용 + 창고). 창고에 넣어 둔 철 무기도
 * 룬각인을 새길 수 있는 자격이라, 착용만 보면 "장비는 있는데 안내가 안 뜨는" 일이 생긴다.
 */
const selBestTier = (s: Store): number => {
  let best = 0;
  for (const sl of SLOT_IDS) {
    const it = s.equipped[sl];
    if (it && it.tier > best) best = it.tier;
  }
  for (const it of s.inventory) if (it.tier > best) best = it.tier;
  return best;
};

/**
 * ⚠ **훅으로 쓴다. 셀렉터로 직접 넘기면 안 된다.**
 *
 * 예전엔 `useGame(selUnlockCtx)` 로 썼는데, 이 함수는 호출마다 `{ towerCleared,
 * bestTier }` 라는 **새 객체**를 만든다. zustand 는 셀렉터 결과를 `Object.is` 로
 * 비교하므로 값이 안 변해도 매번 "바뀌었다" 로 판정하고, 그러면 렌더 → 구독 알림 →
 * 렌더가 끝없이 돈다. 화면이 통째로 안 뜬다 (실제로 그랬다).
 *
 * 원시값 둘만 구독하고 여기서 묶는다. 같은 함정이 `useEffects` 위에도 적혀 있다.
 */
export function useUnlockCtx(): UnlockCtx {
  const towerCleared = useGame((s) => s.towerCleared);
  const bestTier = useGame(selBestTier);
  return useMemo(() => ({ towerCleared, bestTier }), [towerCleared, bestTier]);
}

/** 랭킹표에 넣을 내 엔트리 */
/**
 * 창고에 있는 무기만, 좋은 것부터.
 *
 * 무기 랭킹이 **가진 것 전부**를 세우므로 순위표에 올릴 목록이다.
 * 착용 무기는 `gear.weapon` 에 따로 실리므로 여기엔 넣지 않는다 (넣으면 두 줄이 된다).
 */
export function bagWeapons(inventory: Item[]): Item[] {
  return inventory
    .filter((it) => isWeaponKind(it.kind))
    .sort((a, b) => itemLevel(b) - itemLevel(a));
}

export function useMePlayer(): Player {
  const nickname = useGame((s) => s.nickname);
  const equipped = useGame((s) => s.equipped);
  const inventory = useGame((s) => s.inventory);
  const avatar = useGame((s) => s.avatar);
  const arena = useGame((s) => s.arena);
  const stats = useGame((s) => s.stats);
  const guildId = useGame((s) => s.guildId);
  const title = useGame((s) => s.equippedTitle);
  const ilvl = useGame(selIlvl);
  const assets = useAssets();
  return useMemo(
    () => ({
      id: 'me',
      nick: nickname,
      avatar,
      ilvl,
      gear: equipped,
      weapons: bagWeapons(inventory),
      net: assets.net,
      arenaPoints: arena.points,
      wins: stats.arenaWins,
      losses: stats.arenaLosses,
      guildId,
      title,
      isMe: true,
    }),
    [nickname, avatar, ilvl, equipped, inventory, assets.net, arena.points, stats.arenaWins,
      stats.arenaLosses, guildId, title],
  );
}

/**
 * 칭호 효과.
 * ⚠ `useGame((s) => effectsOf(...))` 로 쓰면 안 된다 — effectsOf 는 호출마다 새 객체를
 * 만들고 zustand v5 는 셀렉터 결과를 Object.is 로 비교하므로, 매 렌더가 "변경됨"으로
 * 판정되어 무한 리렌더(Maximum update depth)에 빠진다.
 * 원시값만 구독하고 useMemo 로 참조를 고정한다.
 */
export function useEffects(): TitleEffects {
  const title = useGame((s) => s.equippedTitle);
  return useMemo(() => effectsOf(title), [title]);
}

/** 길드 스킬 효과. 스킬 레벨만 의존하므로 참조가 안정적이다 */
export function useGuildEffects() {
  const lv = useGame((s) => s.guildSkills);
  return useMemo(() => guildEffects(lv), [lv]);
}

/**
 * 지금 내 길드. 없으면 null.
 *
 * 서버의 명부에서 온다 (state/useGuilds.ts). 평균 아이템레벨과 인원은 **지금의
 * 나**를 섞어 계산한다 — 서버에 실린 내 프로필은 최대 30초 낡았고, 방금 강화한
 * 결과가 내 길드 화면에만 안 뜨면 고장으로 읽힌다.
 */
export function useMyGuild(): Guild | null {
  const guildId = useGame((s) => s.guildId);
  const ilvl = useGame(selIlvl);
  const weekly = useGame(weeklyPointsOf);
  return useMyGuildLive(guildId, ilvl, weekly);
}

/** 내가 이 길드의 길드장인가 */
export function useIsGuildMaster(): boolean {
  const guild = useMyGuild();
  const meId = useMeId();
  return !!guild && !!meId && guild.masterId === meId;
}

