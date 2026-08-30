/**
 * 게임 전역 상태 (zustand + AsyncStorage 영속화).
 * 규칙: 판정/계산은 전부 src/core 의 순수 함수가 하고, 여기서는 "적용"만 한다.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { debouncedStorage } from './storage';
import { setBgmEnabled, setBgmVolume, setSfxEnabled, setSfxVolume } from '@/ui/sfx';

import {
  Item,
  PartKind,
  PART_KINDS,
  Quest,
  SlotId,
  SLOT_ACCEPTS,
  SLOT_IDS,
  Creature,
  KIND_NAME,
  isWeaponKind,
  WeaponKind,
} from '@/core/types';
import {
  SLOT_COUNT,
  TIERS,
  currentItemLevel,
  fmtIlvl,
  itemLevel,
  itemName,
  isArtisan,
} from '@/core/tiers';

import { Ghost } from '@/core/combat';

import { CREATURE_DEFS, RushTurn } from '@/core/rush';

import type { UnlockCtx } from '@/core/unlock';

import { initial } from './initial';
import { STATE_VERSION, migrateState } from './migrate';

// ── 보조 ───────────────────────────────────────────────
/*
  잔손질은 `state/helpers.ts` 로 옮겼다 (셀렉터도 같은 것을 쓴다).
*/

export { dayKeyStore, dayKeyNow, guildStatsOf } from './helpers';

/*
  상태·액션의 타입은 `state/types.ts` 로 옮겼다.
  이 파일은 **적용**만 한다 — 모양은 저기서 읽는다.
*/
export type {
  ArenaState, EnhanceLog, GameActions, GameState, RushLogEntry, RushResult, Store, Toast,
} from './types';
import type {
  ArenaState, EnhanceLog, GameActions, GameState, RushLogEntry, RushResult, Store, Toast,
} from './types';

// ── 초기 상태 ──────────────────────────────────────────
// initial() 은 src/state/initial.ts 로 분리했다 (마이그레이션이 RN 없이 쓰려면 필요)

import { createCoreSlice } from './slices/core';
import { createGearSlice } from './slices/gear';
import { createTownSlice } from './slices/town';
import { createBattleSlice } from './slices/battle';
import { createNoticesSlice } from './slices/notices';
import { createGambleSlice } from './slices/gamble';
import { createAccountSlice } from './slices/account';
import { createGatherSlice } from './slices/gather';
import { createAdventureSlice } from './slices/adventure';
import { createGuildSlice } from './slices/guild';
import { createRosterSlice } from './slices/roster';

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...initial(),

      /*
        액션은 `state/slices/` 에 뭉치별로 나눠 두고 여기서 펼쳐 조립한다.

        예전에는 이 자리에 액션 아흔일곱 개가 3,600줄로 이어져 있었다. 장비 강화를
        고치러 들어온 사람이 길드 레이드 정산을 지나야 했고, 파일을 여는 것 자체가
        일이었다. 나눠도 **스토어는 여전히 하나**다 — `get()` 은 전체를 주므로 뭉치끼리
        서로의 액션을 그대로 부르고, 저장·마이그레이션·미들웨어는 이 파일에만 있다.

        ⚠ 순서는 의미가 없어야 한다. 두 뭉치가 같은 이름의 액션을 정의하면 뒤엣것이
        조용히 이긴다. `Pick<Store, ...>` 로 각 뭉치의 타입을 묶어 두었으니 이름이
        겹치면 타입 검사에서 걸린다 — 그러라고 Pick 을 쓴다.
      */
      ...createCoreSlice(set, get),
      ...createGearSlice(set, get),
      ...createTownSlice(set, get),
      ...createBattleSlice(set, get),
      ...createNoticesSlice(set, get),
      ...createGambleSlice(set, get),
      ...createAccountSlice(set, get),
      ...createGatherSlice(set, get),
      ...createAdventureSlice(set, get),
      ...createGuildSlice(set, get),
      ...createRosterSlice(set, get),

      reset: () => set({ ...initial(), toasts: [] }),
    }),
    {
      name: 'player-growth/v1',
      storage: createJSONStorage(() => debouncedStorage),
      version: STATE_VERSION,
      /**
       * 저장본 복원 시 **항상** 스키마를 보정한다.
       * migrate 는 version 이 바뀔 때만 돌지만, 이 프로젝트는 필드가 계속 늘어나므로
       * merge 로 매번 채우는 게 안전하다. (종목 5→8 추가 때 실제로 흰 화면이 났다)
       */
      merge: (persisted, current) => ({ ...current, ...migrateState(persisted) }),
      migrate: (persisted) => migrateState(persisted),
      partialize: (s) => {
        const { toasts, ...rest } = s as GameState;
        void toasts;
        return rest as GameState;
      },
      onRehydrateStorage: () => (state) => {
        // 복귀 즉시 경과 시간 정산
        if (state) setTimeout(() => useGame.getState().tick(), 0);
        // 저장된 소리 설정을 오디오 계층에 다시 알려 준다 (sfx 는 스토어를 구독하지 않는다)
        if (state) {
          setSfxEnabled(state.sfxOn !== false);
          setBgmEnabled(state.bgmOn !== false);
          // 음량이 먼저다 — 켜짐을 먼저 적용하면 옛 음량으로 첫 소절이 난다
          setSfxVolume(typeof state.sfxVol === 'number' ? state.sfxVol : 1);
          setBgmVolume(typeof state.bgmVol === 'number' ? state.bgmVol : 1);
        }
      },
    },
  ),
);


/*
  화면이 자주 같이 쓰는 core 심볼을 여기서 한 번 더 내보낸다.

  `@/core/tiers` 에서 직접 가져와도 되지만, 장비 한 칸을 그리는 화면은 거의 언제나
  스토어와 이 이름들을 **함께** 쓴다. 두 줄로 나뉘어 있으면 import 를 고칠 때마다
  두 곳을 만지게 된다. 원본은 어디까지나 core 다 — 여기서 값을 바꾸지 않는다.
*/
export { itemName, itemLevel, currentItemLevel, fmtIlvl, SLOT_COUNT, KIND_NAME, TIERS, isArtisan };
export type { Item, SlotId, Ghost, Quest, PartKind, WeaponKind, RushTurn, Creature };
export { isWeaponKind, CREATURE_DEFS, PART_KINDS, SLOT_IDS, SLOT_ACCEPTS };
