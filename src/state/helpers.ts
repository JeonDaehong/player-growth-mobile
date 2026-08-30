/**
 * 스토어가 쓰는 잔손질.
 *
 * 액션 본문에서 **되풀이되던 계산**만 모았다. 판정과 계산의 본체는 `src/core` 의
 * 순수 함수들이고 (그쪽은 스토어를 모른다), 여기 있는 것들은 그 사이를 잇는
 * "이 저장본에서 내 길드를 찾아온다" 같은 일이다 — `GameState` 를 알아야 해서
 * core 로는 못 내리고, 액션마다 복사하기엔 어긋날 위험이 큰 것들.
 *
 * ⚠ 여기에는 `useGame` 을 들이지 않는다. 스토어가 이 파일을 불러 쓰므로
 * 반대 방향 import 가 생기면 순환이 된다. 상태는 **인자로 받는다.**
 */

import { playerCurrentIlvl } from '@/core/tiers';
import { weekKeyOf } from '@/core/rush';
import { GqKey } from '@/core/guildQuest';
import { guildEffects } from '@/core/guildSkill';
import { EMPTY_GUILD_STATS, Guild, GuildStats } from '@/core/guilds';
import { guildSnapshot } from './useGuilds';
import { type NetProfile } from './net';
import { spiritTotal } from '@/core/spirit';
import { SLOT_IDS } from '@/core/types';
import type { Equipped } from '@/core/tiers';
import { wearDurability } from '@/core/economy';
import { MAX_STAMINA } from '@/core/combat';
import { effectsOf } from '@/core/titles';
import { rosterMeId } from './useBoard';
import type { GameState } from './types';

/** 비어 있는 진행 축 — 기간이 바뀌면 여기서 다시 센다 */
export const EMPTY_GQ: Record<GqKey, number> = { enhance: 0, clear: 0, arena: 0, gamble: 0, sell: 0 };

/**
 * 자정 기준 날짜 키.
 *
 * ⚠ `core/events.ts` 의 dayKey 는 **0을 채운 형식**(2026-08-24)이라 이것과 다르다.
 * 출석은 그쪽, 스토어 상태(미션·일일 보너스·레이드)는 이쪽 형식을 쓴다.
 * 저장된 키를 화면에서 비교할 때는 **반드시 이 함수**를 써야 한다 —
 * 형식이 어긋나면 늘 "지난 날짜" 로 판정되어 진행도가 0으로 보인다.
 */
export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/**
 * 화면에서 저장된 날짜 키와 비교할 때 쓴다 (형식이 갈리는 걸 막는 단일 출처).
 * `draw.ts` 에도 같은 이름이 있어 여기서는 dayKeyStore 로 내보낸다.
 */
export const dayKeyStore = dayKey;
export const dayKeyNow = () => dayKey(Date.now());

/**
 * 지금 내가 속한 길드. 내가 만든 길드와 남의 길드를 한 곳에서 푼다 —
 * 호출부마다 분기하면 한쪽만 고치는 실수가 난다.
 */

/**
 * 오늘 매매 횟수 +1. 날짜가 바뀌면 0 부터 다시 센다.
 * "단타왕" 은 하루 20회이므로 누적으로 세면 언젠가 모두가 받는다.
 */
/**
 * 지금 내 길드와 길드원들.
 *
 * 예전엔 `guildById(week, id)` 가 씨앗에서 길드를 **만들어** 돌려줬다 —
 * 서버가 없으니 언제 물어도 답이 있었다. 이제는 서버에서 받아 둔 명부를 본다
 * (state/useGuilds.ts). 아직 못 받았거나 해산된 길드면 null 이고,
 * 그때는 길드 콘텐츠가 조용히 닫힌다.
 */
export function guildOf(st: GameState): { guild: Guild | null; mates: NetProfile[] } {
  return guildSnapshot(
    st.guildId,
    playerCurrentIlvl(st.equipped),
    weeklyPointsOf(st),
  );
}

export const currentGuild = (st: GameState): Guild | null => guildOf(st).guild;

/**
 * 길드가 없을 때 뭐라고 할 것인가.
 *
 * "길드에 속해 있어야 합니다" 는 **정말 길드가 없을 때만** 맞는 말이다.
 * 가입은 돼 있는데 명부를 아직 못 받은 몇 초 동안 같은 말이 나오면,
 * 방금 가입한 사람이 가입이 안 된 줄 안다.
 */
export const noGuildMsg = (st: GameState) =>
  st.guildId ? '길드 정보를 아직 받아오지 못했습니다 — 잠시 후 다시 시도하세요'
    : '길드에 속해 있어야 합니다';

/**
 * 이번 주 내 기여도 — 금고 배당의 분자이자, 남에게 보이는 내 몫이다.
 * 길드 퀘스트 진행분과 보스 누적 딜을 합친 값 (예전 claimDividend 의 계산과 같다).
 */
export function weeklyPointsOf(st: GameState): number {
  const week = weekKeyOf(Date.now());
  const quest = Object.values(st.guildQuest.weekKey === week ? st.guildQuest.mine : {})
    .reduce((a: number, x) => a + (x as number), 0);
  return quest + (st.guildBoss.weekKey === week ? st.guildBoss.damage : 0);
}

/** 프로필에 실어 보낼 길드 수치 — useNetSync 가 매번 읽어 간다 */
export function guildStatsOf(st: GameState): GuildStats {
  const now = Date.now();
  const week = weekKeyOf(now);
  const day = dayKey(now);
  if (!st.guildId) return EMPTY_GUILD_STATS;
  return {
    weekly: weeklyPointsOf(st),
    joinedAt: st.guildJoinedAt,
    attendDay: st.guildCheck.dayKey === day ? day : '',
    boss: st.guildBoss.weekKey === week
      ? { key: week, dmg: st.guildBoss.damage }
      : { key: '', dmg: 0 },
    raidD: { key: st.raids.daily.periodKey, dmg: st.raids.daily.damage },
    raidW: { key: st.raids.weekly.periodKey, dmg: st.raids.weekly.damage },
    quest: st.guildQuest.weekKey === week
      ? { key: week, counts: { ...st.guildQuest.mine } }
      : { key: '', counts: {} },
  };
}

/**
 * 탐험·탑 통과 확률 보정 (0~1).
 * 정령석과 길드 스킬이 같은 축을 건드리므로 한 곳에서 더한다.
 */
export function stageBonus(st: GameState, kind: 'explore' | 'tower'): number {
  const rune = spiritTotal(st.equipped, {
    runeIlvlMul: 1, setSynergyMul: 1,
  }).bonus[kind === 'explore' ? 'explore_rate' : 'tower_rate'] ?? 0;
  return (rune + guildEffects(st.guildSkills).stageRateAdd) / 100;
}


/**
 * 지금 칭호가 주는 배수만 뽑는다.
 *
 * ⚠ **객체를 돌려주지만 셀렉터로 직접 쓰면 안 된다.** 호출마다 새 객체라
 * `useGame((s) => titleMods(s))` 는 매번 "바뀌었다" 가 되어 무한 렌더에 빠진다.
 * 화면에서는 `selRuneMul` 처럼 스칼라로 쪼갠 셀렉터를 쓴다 (state/selectors.ts).
 * 여기 있는 이유는 **스토어 액션**도 같은 배수를 필요로 하기 때문이다 —
 * 액션은 렌더와 무관하므로 객체째 써도 된다.
 */
export const titleMods = (s: Pick<GameState, 'equippedTitle'>) => {
  const e = effectsOf(s.equippedTitle);
  return { runeIlvlMul: e.runeIlvlMul, setSynergyMul: e.setSynergyMul };
};

/** 지금 체력 최대치 (칭호가 올려 준다). 숫자라서 셀렉터로 그대로 써도 안전하다 */
export const selMaxStamina = (s: Pick<GameState, 'equippedTitle'>) =>
  MAX_STAMINA + effectsOf(s.equippedTitle).staminaMaxAdd;

/**
 * 전투 1회 후 착용 장비 전체 내구도 소모 (§10).
 *
 * 의뢰·투기장·탐험·탑이 전부 같은 것을 쓴다. 한 곳에서만 빼먹어도
 * "저 콘텐츠만 장비가 안 닳는다" 가 되어 그쪽으로 사람이 몰린다.
 */
export function applyWear(set: (p: Partial<GameState>) => void, get: () => GameState) {
  const st = get();
  const eq: Equipped = { ...st.equipped };
  for (const sl of SLOT_IDS) {
    const it = eq[sl];
    if (it) eq[sl] = wearDurability(it);
  }
  set({ equipped: eq });
}

/**
 * 내가 지금 길드의 길드장인가.
 *
 * `guildOf` 가 찾아 준 길드의 `masterId` 와 내 서버 id 를 견준다. 서버에 안 붙어
 * 있으면(로컬 개발) 판단할 근거가 없으므로 false 다 — 모르면 아니라고 답한다.
 */
export const isGuildMaster = (st: GameState): boolean => {
  const g = guildOf(st).guild;
  const me = rosterMeId();
  return !!g && !!me && g.masterId === me;
};
