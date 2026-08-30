/**
 * 길드 합동 보스 사냥 (docs/GUILD_CONTENT_DESIGN.md §3).
 *
 * 매주 금 00:00 ~ 일 24:00. 잠재 총딜이 `avgIlvl × 구성원수 × 9` 인데 HP 계수가 8 이라
 * **약 89% 참여를 요구**한다 — 전원이 다 안 오면 못 잡는다. "다 같이 해야 겨우" 감각.
 *
 * 보상을 골드로 주지 않는다. 골드는 도박장으로 흘러가 흔적이 안 남는다.
 * 주문서·장인 재료는 강화대로 돌아와서 "길드 덕에 +14 갔다"는 서사가 생긴다.
 */
import { Guild } from './guilds';
import { ScrollId } from './types';

/** 합동 사냥도 체력을 쓰지 않는다 — 이유는 guildRaid.ts 참고 */
export const BOSS_DAILY_TRIES = 3;
export const BOSS_DAYS = 3;
export const BOSS_MAX_TRIES = BOSS_DAILY_TRIES * BOSS_DAYS;
/** HP 계수 — 잠재 총딜 계수 9 보다 낮게 두어 약 89% 참여를 요구한다 */
export const BOSS_HP_MUL = 8;

export const bossHp = (guild: Guild) =>
  Math.max(1, Math.round(guild.avgIlvl * Math.max(1, guild.members) * BOSS_HP_MUL));

/**
 * 내 1회 딜량. **내구도 보정 후** 아이템레벨을 쓴다 —
 * 수리 안 하고 오면 딜이 실제로 떨어지고 그게 기여도 순위에 그대로 뜬다.
 */
export const myHit = (curIlvl: number, r: () => number) =>
  Math.round(curIlvl * (0.8 + r() * 0.4));

/** 보스 주간이 열려 있는가 — 금(5) · 토(6) · 일(0) */
export function bossOpen(now: number): boolean {
  const d = new Date(now).getDay();
  return d === 5 || d === 6 || d === 0;
}

/** 이번 보스 주간이 얼마나 지났는가 (0~1) */
export function bossElapsed(now: number): number {
  const d = new Date(now);
  const day = d.getDay();
  const idx = day === 5 ? 0 : day === 6 ? 1 : day === 0 ? 2 : -1;
  if (idx < 0) return 0;
  const withinDay = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86_400;
  return Math.min(1, (idx + withinDay) / BOSS_DAYS);
}

export interface BossRanker {
  nick: string;
  damage: number;
  isMe?: boolean;
}

/**
 * 기여도 순위.
 *
 * 예전엔 `npcDamage()` 가 없는 사람들의 누적 딜을 시간 비례로 **지어내서** 얹었다.
 * 일요일 밤에 열면 그럴듯하게 차 있었지만, 그 이름들은 아무도 아니었다.
 *
 * 지금은 같은 길드원들이 **각자 올린 값**(profiles.guild_stats.boss)을 그대로 쓴다.
 * 부르는 쪽(state/store.ts)이 그걸 모아 `mates` 로 넘긴다.
 */
export function bossBoard(mates: BossRanker[], myNick: string, myDamage: number): BossRanker[] {
  return [...mates, { nick: myNick, damage: myDamage, isMe: true }]
    .sort((a, b) => b.damage - a.damage);
}

export const totalDamage = (rows: BossRanker[]) => rows.reduce((a, x) => a + x.damage, 0);

export interface BossReward {
  gp: number;
  scroll: ScrollId;
  material: number;
  label: string;
}

/**
 * 순위별 보상. 실패해도 절반은 준다 —
 * 3일 내내 팬 걸 0으로 만들면 다음 주에 아무도 안 온다.
 */
export function bossReward(killed: boolean, rank: number, joined: boolean): BossReward | null {
  if (!joined) return null;
  if (!killed) return { gp: 100, scroll: 'succ_low', material: 0, label: '참여' };
  if (rank <= 3) return { gp: 400, scroll: 'succ_high', material: 3, label: '1~3위' };
  if (rank <= 10) return { gp: 300, scroll: 'succ_mid', material: 2, label: '4~10위' };
  return { gp: 200, scroll: 'succ_low', material: 1, label: '참여' };
}
