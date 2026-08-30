/**
 * 길드 레이드 — 일일 보스 · 주간 보스.
 *
 * 세 콘텐츠는 **주기와 체력만 다르고 나머지는 같다.** 규칙을 따로 쓰면 셋 중
 * 하나를 고칠 때마다 나머지 둘이 어긋난다. 정의 하나에 몰아넣고 주기만 갈라낸다.
 *
 * 참여 횟수
 *   · 일일 보스   하루 2회 · 자정에 리셋
 *   · 주간 보스   하루 1회 · 주 7회 · 월요일 자정에 리셋
 *
 * 정산 창(00:00~00:10)에는 아무도 때릴 수 없다. 이 10분 동안 지난 주기에 넣은
 * 총 피해가 길드 경험치로 환산된다 — 리셋과 정산이 같은 순간에 일어나면
 * "내가 마지막에 넣은 딜이 반영됐나" 를 확인할 수 없다.
 */
import { Guild } from './guilds';
import { seeded } from './rng';
import { ScrollId } from './types';

export const RAIDS = ['daily', 'weekly'] as const;
export type RaidId = (typeof RAIDS)[number];

/**
 * 레이드는 **체력을 쓰지 않는다.**
 *
 * 예전엔 한 대에 12 였다. 그런데 길드 콘텐츠는 전부 "하루 몇 회" 로 이미 잠겨 있고
 * (일일·주간 참여 횟수), 체력은 탐험·탑·투기장이라는 **혼자 하는 콘텐츠**의 예산이다.
 * 둘을 같은 지갑에서 꺼내게 하면 "오늘 길드 레이드를 치면 탑을 못 간다" 가 되어,
 * 길드에 들어온 사람이 손해를 보는 구조가 된다. 같이 하는 일에 벌금을 매기면 안 된다.
 *
 * 참여 제한은 횟수가, 성장 제한은 내구도가 맡는다 (레이드도 내구도는 닳는다).
 */

/** 정산 창 길이 — 자정부터 10분 */
export const SETTLE_MS = 10 * 60 * 1000;

export interface RaidDef {
  id: RaidId;
  name: string;
  /** 한 주기에 쓸 수 있는 총 횟수 */
  tries: number;
  /** 하루에 쓸 수 있는 횟수 (주간도 하루치 제한이 따로 있다) */
  daily: number;
  /** 주기 — 일간은 자정마다, 주간은 월요일 자정마다 */
  period: 'day' | 'week';
  /** 체력 계수: 평균 아이템레벨 × 인원 × 이 값 */
  hpMul: number;
  /** 한 대당 기여도 */
  gp: number;
  /** 처치 시 길드 경험치 배수 (피해 비례분에 곱한다) */
  killExpMul: number;
  /**
   * 정산 배당 — 내가 넣은 피해 1점당 몇 쿠퍼인가.
   *
   * 기여도(gp)는 길드 안에서의 순위이고, 이건 **내 지갑에 들어오는 돈**이다.
   * 둘을 하나로 묶으면 "기여도를 왜 쌓는가" 와 "왜 때리는가" 가 같은 답이 된다.
   * 자정 정산에서 `raidPay` 가 이 값을 쓴다.
   */
  payPer: number;
  desc: string;
}

/**
 * 체력 계수 잡는 법.
 *
 * 한 번 때리면 평균 아이템레벨만큼 들어간다. 그러니 한 주기에 길드가 넣을 수 있는
 * 잠재 총딜 = 평균템렙 × 인원 × 총횟수다. hpMul 을 그 총횟수보다 **낮게** 두면
 * 전원이 만근하지 않아도 잡히고, 높게 두면 못 잡는다.
 *   · 일일  총횟수 2 → hpMul 1.4 (70% 참여로 처치)
 *   · 주간  총횟수 7 → hpMul 5.0 (71% 참여)
 *
 * 예전엔 여기에 "주간 공성전" 이 하나 더 있었다. 뺐다 — 주간 보스와 주기·횟수·화면이
 * 전부 같아서 실질적으로 같은 콘텐츠를 두 번 하는 것이었고, 길드 탭이 세 칸으로
 * 늘어나면서 오늘 뭘 해야 하는지가 오히려 흐려졌다.
 */
export const RAID_DEFS: Record<RaidId, RaidDef> = {
  daily: {
    id: 'daily', name: '일일 보스', tries: 2, daily: 2, period: 'day',
    hpMul: 1.4, gp: 30, killExpMul: 1.5, payPer: 1,
    desc: '하루 두 번. 자정에 새 보스가 온다.',
  },
  weekly: {
    id: 'weekly', name: '주간 보스', tries: 7, daily: 1, period: 'week',
    hpMul: 5.0, gp: 90, killExpMul: 2, payPer: 1.2,
    desc: '하루 한 번씩 이레. 월요일 자정에 초기화된다.',
  },
};

/**
 * 보스 명단.
 *
 * 일일 10마리 · 주간 3마리 중 주기마다 하나가 뽑힌다.
 * 예전엔 일일이 5마리뿐이라 이틀에 한 번꼴로 같은 얼굴을 봤다 — 매일 여는
 * 콘텐츠에서 그건 "어제 그거" 로 읽힌다. 열로 늘려 열흘에 한 바퀴가 되게 했다.
 *
 * `id` 는 아트 파일명(assets/sprites/raid_boss/{id}.png)과 같다.
 * 이름을 바꿔도 그림이 안 어긋나게 **id 는 절대 바꾸지 않는다.**
 */
export interface RaidBoss {
  /** 스프라이트 키 (raid_boss/{id}) */
  id: string;
  name: string;
  /** 한 줄 소개 — 전투 팝업에서 보여 준다 */
  flavor: string;
  /**
   * 전용 아트가 들어오기 전까지 대신 쓸 크리처 스프라이트 (assets/sprites/creature).
   * 빈 네모를 띄우면 "그림이 안 왔다" 가 아니라 "게임이 깨졌다" 로 보인다.
   */
  fallback: string;
}

export const RAID_BOSSES: Record<RaidId, RaidBoss[]> = {
  daily: [
    { id: 'd01', name: '굶주린 늪지 거인', flavor: '허리까지 진흙에 잠긴 채 백 년을 굶었다.', fallback: 'ogre' },
    { id: 'd02', name: '녹슨 파수병', flavor: '지킬 문이 사라진 뒤로도 자리를 뜨지 않는다.', fallback: 'golem' },
    { id: 'd03', name: '동굴 아귀', flavor: '빛을 본 적이 없어 입만 자랐다.', fallback: 'toad' },
    { id: 'd04', name: '탑을 오르는 것', flavor: '층계를 세지 않는다. 그저 위로만 간다.', fallback: 'tentacle' },
    { id: 'd05', name: '검은 이빨 무리', flavor: '한 마리를 잡으면 세 마리가 더 온다.', fallback: 'wolf' },
    { id: 'd06', name: '폐광의 목소리', flavor: '갱도 끝에서 제 이름을 부르면 대답한다.', fallback: 'bat' },
    { id: 'd07', name: '무쇠턱 두꺼비', flavor: '곡괭이를 통째로 삼키고도 멀쩡했다.', fallback: 'toad' },
    { id: 'd08', name: '잿빛 사냥개', flavor: '주인이 죽은 자리를 아직도 지킨다.', fallback: 'wolf' },
    { id: 'd09', name: '뒤틀린 나무지기', flavor: '벤 만큼 자라고, 자란 만큼 화가 나 있다.', fallback: 'mantis' },
    { id: 'd10', name: '하수도 왕쥐', flavor: '도시의 아래쪽은 이미 이 녀석 것이다.', fallback: 'boar' },
  ],
  weekly: [
    { id: 'w01', name: '재를 먹는 용', flavor: '타 버린 것만 먹어 온 세상을 태우고 다닌다.', fallback: 'tentacle' },
    { id: 'w02', name: '무너진 성의 왕', flavor: '신하도 성벽도 없이 왕관만 남았다.', fallback: 'skeleton' },
    { id: 'w03', name: '심연에서 온 사자', flavor: '아래에서 보낸 전갈이다. 내용은 아무도 모른다.', fallback: 'tentacle' },
  ],
};

/** 이 주기의 보스 — 주기 키가 같으면 늘 같다 */
export function bossOf(id: RaidId, periodKey: string): RaidBoss {
  const pool = RAID_BOSSES[id];
  return pool[Math.floor(seeded('raidname', id, periodKey)() * pool.length)];
}

/** 이 주기의 보스 이름 */
export const bossName = (id: RaidId, periodKey: string) => bossOf(id, periodKey).name;

/**
 * 피해 표기.
 *
 * 예전엔 `fmtShort` 를 썼는데 그건 **돈** 표기다 — 누적 피해가 "12.3실버" 로 나왔다.
 * 피해는 돈이 아니므로 단위를 따로 둔다.
 */
export function fmtDmg(n: number): string {
  const a = Math.max(0, Math.round(n));
  if (a >= 1e8) return `${(a / 1e8).toFixed(1).replace(/\.0$/, '')}억`;
  if (a >= 1e4) return `${(a / 1e4).toFixed(1).replace(/\.0$/, '')}만`;
  return a.toLocaleString('en-US');
}

export const raidHp = (def: RaidDef, guild: Guild) =>
  Math.max(1, Math.round(guild.avgIlvl * Math.max(1, guild.members) * def.hpMul));

/**
 * 한 대의 피해.
 *
 * 아이템레벨에 정비례한다 — 강해질수록 길드에 더 보탬이 된다는 게 눈에 보여야 한다.
 * ±20% 흔들어 매번 같은 숫자가 나오지 않게 하고, 길드 스킬의 레이드 딜 증가를 곱한다.
 */
export const raidHit = (curIlvl: number, dmgMul: number, r: () => number) =>
  Math.max(1, Math.round(curIlvl * (0.8 + r() * 0.4) * dmgMul));

/**
 * 한 대에 받는 기여도.
 *
 * 피해가 크면 조금 더 받되 **큰 차이는 없어야 한다.** 템렙이 낮은 사람이
 * "가 봐야 의미 없다" 고 느끼면 레이드는 고인물만 남는다.
 * 기본값의 100~130% 안에서만 벌어진다.
 */
export function raidGp(def: RaidDef, myHit: number, avgHit: number): number {
  const ratio = avgHit > 0 ? myHit / avgHit : 1;
  return Math.round(def.gp * Math.min(1.3, Math.max(1, 0.85 + ratio * 0.15)));
}

// ── 정산 창 ────────────────────────────────────────────

/** 지금이 정산 창(자정~자정+10분)인가 */
export function inSettleWindow(now: number): boolean {
  const d = new Date(now);
  return d.getHours() === 0 && d.getMinutes() < SETTLE_MS / 60000;
}

/** 정산 창이 끝날 때까지 남은 ms (창 밖이면 0) */
export function settleLeft(now: number): number {
  if (!inSettleWindow(now)) return 0;
  const d = new Date(now);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime() + SETTLE_MS;
  return Math.max(0, end - now);
}

/**
 * 넣은 피해 → 길드 경험치.
 *
 * 보스를 못 잡아도 때린 만큼은 남는다. 잡으면 배수가 붙는다 —
 * "어차피 못 잡으니 안 간다" 가 되면 작은 길드는 영영 레벨이 안 오른다.
 */
export function raidExp(def: RaidDef, damage: number, hp: number, killed: boolean): number {
  const base = damage / Math.max(1, hp);
  return Math.round(base * 1000 * (killed ? def.killExpMul : 1));
}

// ── 길드 레벨 ──────────────────────────────────────────

export const GUILD_LEVEL_MAX = 30;

/**
 * Lv n → n+1 에 필요한 경험치.
 *
 * 처음엔 `500 × 1.18^n` 이었는데 **초반이 너무 빨랐다.** 정원 30명 길드 기준으로
 * 실측하면 Lv5 가 하루, Lv10 이 나흘이었다 — 일주일이면 길드가 "다 한" 상태가 되고,
 * 그 뒤로는 출석 버튼만 누르러 오게 된다. 길드 레벨은 오래 같이 한 흔적이어야 한다.
 *
 * 기울기(1.18 → 1.13)보다 **출발선(500 → 3,000)** 을 크게 올렸다. 문제는 뒤가 아니라
 * 앞이었기 때문이다. 지금 페이스(정원 30명, 하루 ≈ 2,350 경험치):
 *   Lv5 ≈ 6일 · Lv10 ≈ 3주 · Lv15 ≈ 6주 · Lv20 ≈ 3개월 · Lv30 ≈ 11개월
 */
export const levelExp = (level: number) =>
  Math.round(3000 * Math.pow(1.13, Math.max(0, level - 1)));

/** 누적 경험치 → 레벨과 남은 진행도 */
export function guildLevelOf(exp: number): { level: number; into: number; need: number } {
  let level = 1;
  let rest = Math.max(0, exp);
  while (level < GUILD_LEVEL_MAX) {
    const need = levelExp(level);
    if (rest < need) return { level, into: rest, need };
    rest -= need;
    level++;
  }
  return { level: GUILD_LEVEL_MAX, into: 0, need: 0 };
}

/** Lv1 부터 그 레벨까지의 누적 경험치 */
export function expForLevel(level: number): number {
  let sum = 0;
  for (let i = 1; i < Math.min(level, GUILD_LEVEL_MAX); i++) sum += levelExp(i);
  return sum;
}

/** 레벨이 오를 때마다 스킬 포인트 1점 — Lv1 은 0점 */
export const skillPointsAt = (level: number) => Math.max(0, level - 1);

// ── 정산 (자정 00:00~00:10) ─────────────────────────────

/**
 * 내 기여만큼 받는 돈.
 *
 * 기준은 **내가 넣은 피해**다. 참여 횟수로 주면 템렙 1,000 과 20,000 이 같은 돈을
 * 받고, 길드 총딜로 나누면 고인물 길드에 얹혀 가는 게 최적해가 된다.
 * 잡았으면 1.5배 — 마무리를 못 지어도 때린 만큼은 그대로 남는다.
 */
export function raidPay(def: RaidDef, myDamage: number, killed: boolean): number {
  return Math.max(0, Math.round(Math.max(0, myDamage) * def.payPer * (killed ? 1.5 : 1)));
}

/** 정산 한 줄 — 화면이 "그래서 얼마 받았나" 를 되짚을 수 있게 남긴다 */
export interface RaidSettleEntry {
  id: RaidId;
  /** 정산된 주기 (지난 주기의 키) */
  periodKey: string;
  at: number;
  /** 내가 그 주기에 넣은 총 피해 */
  damage: number;
  money: number;
  gp: number;
  exp: number;
  killed: boolean;
}

/** 남겨 두는 정산 기록 수 — 일일·주간 각 한 줄씩 세 주기면 충분하다 */
export const RAID_LOG_MAX = 6;

export interface RaidReward {
  gp: number;
  scroll: ScrollId | null;
  material: number;
  label: string;
}

/**
 * 처치 보상. 참여했을 때만 준다.
 * 못 잡아도 절반은 준다 — 이레 내내 팬 걸 0으로 만들면 다음 주에 아무도 안 온다.
 *
 * ⚠ 공성전을 없애면서 **그 자리의 보상을 주간 보스가 물려받았다.**
 * 공성전은 길드에서 확정 주문서와 재료가 나오는 유일한 곳이었다. 그냥 지웠다면
 * 길드의 최고 보상이 통째로 사라져서, 콘텐츠 하나를 정리한 게 아니라 깎은 게 된다.
 */
export function raidReward(id: RaidId, killed: boolean, joined: boolean): RaidReward | null {
  if (!joined) return null;
  if (id === 'daily') {
    return killed
      ? { gp: 60, scroll: 'succ_low', material: 0, label: '처치' }
      : { gp: 30, scroll: null, material: 0, label: '참여' };
  }
  return killed
    ? { gp: 300, scroll: 'guarantee', material: 3, label: '처치' }
    : { gp: 130, scroll: 'succ_mid', material: 0, label: '참여' };
}

// ── 길드원이 넣은 피해 ─────────────────────────────────
//
// 예전엔 `npcDamage()` 가 "길드 평균 템렙 × 인원 × 성실도 × 경과" 로 없는
// 사람들의 피해를 **지어냈다.** 보스는 늘 잡혔고, 내가 몇 대를 치든 결과는
// 같았다 — 아무도 없는 방에서 혼자 때리고 있었던 셈이다.
//
// 지금은 길드원들이 각자 올린 값(profiles.guild_stats.raidD / raidW)을 그대로
// 더한다 (state/useGuilds.ts 가 모은다). 그래서 **아무도 안 오면 정말 못 잡는다.**
// 그게 "다 같이 해야 겨우" 라는 이 콘텐츠의 원래 의도다.

/** 이 주기가 얼마나 지났는가 (0~1) */
export function periodElapsed(def: RaidDef, now: number): number {
  const d = new Date(now);
  const within = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86_400;
  if (def.period === 'day') return within;
  // 월요일 00시 시작 — 일(0)은 7일째다
  const day = d.getDay();
  const idx = day === 0 ? 6 : day - 1;
  return (idx + within) / 7;
}
