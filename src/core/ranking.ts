/**
 * 랭킹.
 *
 * 예전엔 여기서 **하루 단위로 고정된 가짜 서버 인구 99명을 지어냈다**
 * (`population`). 이제 순위표에 있는 사람은 전부 실제로 이 게임을 켠 사람이다 —
 * 줄은 `state/net.ts` 가 서버(profiles 표)에서 받아 오고, 이 모듈은 **정렬과
 * 표기 규칙**만 맡는다.
 *
 * 그래서 인구는 고정값이 아니라 그때그때 몇 명이 있는지에 달렸고,
 * 갱신도 "자정 1회" 가 아니라 실시간이다.
 */
import { ArenaTier, Item, WEAPON_KINDS, WeaponKind, isWeaponKind } from './types';
import { Equipped, itemLevel } from './tiers';
import { AvatarId } from './avatars';
import { TitleId } from './titles';
import { arenaTierOf } from './combat';

export interface Player {
  /** 서버의 user_id. 나는 'me' */
  id: string;
  nick: string;
  avatar: AvatarId;
  /** 아이템레벨 (16슬롯 합) */
  ilvl: number;
  /** 착용 장비. 목록의 아이템레벨은 이 장비의 합이다 (따로 굴리면 팝업과 어긋난다) */
  gear?: Equipped;
  /**
   * 창고에 있는 무기들.
   *
   * 무기 랭킹은 **가진 것 전부**를 세운다 (아래 `weaponBoard`). 착용한 것만 세면
   * 열한 개 판 중 한 판에만 오를 수 있고, 두 번째로 좋은 검은 있다는 사실조차
   * 아무도 모른다. 착용 무기는 `gear.weapon` 에 있으므로 여기엔 **창고 것만** 담는다.
   */
  weapons?: Item[];
  /** 순자산 */
  net: number;
  arenaPoints: number;
  wins: number;
  losses: number;
  guildId: string | null;
  /** 길드 이름 — 서버가 프로필에 같이 실어 준다 */
  guildName?: string | null;
  /**
   * 장착 중인 칭호.
   *
   * 순위표에 이름만 있으면 1위와 300위가 같은 무게로 읽힌다. 칭호는 그 사람이
   * **무엇을 해냈는지**를 한 칸으로 말해 주는 유일한 표시다 — 선착순 칭호가
   * 달린 줄은 순위와 별개로 눈에 띄어야 한다.
   */
  title?: TitleId | null;
  isMe?: boolean;
}

export const winRateOf = (p: Player) =>
  p.wins + p.losses === 0 ? 0 : p.wins / (p.wins + p.losses);

export const tierOf = (p: Player): ArenaTier => arenaTierOf(p.arenaPoints);

export type BoardId = 'ilvl' | 'net' | 'arena' | 'weapon';

export interface Board {
  id: BoardId;
  label: string;
  rows: Player[];
  /** 내 순위 (1-based) */
  myRank: number;
  /** 이 판에 올라와 있는 사람 수 (나 포함) */
  total: number;
}

const cmp: Record<BoardId, (a: Player, b: Player) => number> = {
  ilvl: (a, b) => b.ilvl - a.ilvl,
  net: (a, b) => b.net - a.net,
  // 투기장은 점수 → 승률 → 승수 순
  arena: (a, b) =>
    b.arenaPoints - a.arenaPoints || winRateOf(b) - winRateOf(a) || b.wins - a.wins,
  /*
    무기 판은 `board()` 를 안 거친다 — 줄의 단위가 사람이 아니라 **무기 한 자루**라
    Player[] 로는 표현이 안 된다 (`weaponBoard` 참고). 여기 있는 건 BoardId 를
    전부 채워야 하는 타입 요구를 메우는 자리이고, 실제로 불리지 않는다.
  */
  weapon: (a, b) => weaponIlvlOf(b) - weaponIlvlOf(a),
};

export const BOARD_META: Record<BoardId, { label: string }> = {
  ilvl: { label: '아이템레벨' },
  net: { label: '보유 자산' },
  arena: { label: '투기장' },
  weapon: { label: '무기' },
};

// ── 무기별 랭킹 ────────────────────────────────────────
/**
 * 무기 판.
 *
 * 아이템레벨 판은 16칸의 합이라 **한 자리에 몰빵한 사람이 안 보인다.** 전설의 검
 * 하나만 파 온 사람은 방어구가 비어 있어 종합 순위가 낮고, 그래서 자기가 뭘
 * 이뤘는지 어디서도 확인할 수 없었다. 무기 하나만 놓고 줄을 세우면 그 자리가 생긴다.
 *
 * **무기만** 센다. 방어구·장신구는 안 넣는다 — 부위를 다 열면 판이 열여섯 개가
 * 되고, 하나하나는 아무도 안 본다. 무기가 이 게임에서 제일 먼저 올리는 칸이고,
 * 종류가 열한 가지라 "내 종류에서 몇 등인가" 가 곧바로 성립한다.
 */
export const WEAPON_BOARD_KINDS = WEAPON_KINDS;

/** 이 사람이 낀 무기의 종류. 무기가 없으면 null */
export function weaponKindOf(p: Player): WeaponKind | null {
  const w = p.gear?.weapon;
  return w && isWeaponKind(w.kind) ? w.kind : null;
}

/** 착용 무기 한 자루의 아이템레벨. 무기가 없으면 0 */
export function weaponIlvlOf(p: Player): number {
  const w = p.gear?.weapon;
  return w ? itemLevel(w) : 0;
}

/**
 * 이 사람이 **가진** 무기 전부 — 착용 한 자루 + 창고에 있는 것들.
 *
 * 창고 것도 세는 게 핵심이다. 무기는 한 번에 한 자루만 낄 수 있는데 착용한 것만
 * 세면, 검을 셋 키운 사람도 검 판에 한 줄만 오른다. 나머지 둘은 있다는 사실조차
 * 아무도 모르고, 그러면 "두 번째 무기를 키울 이유" 가 게임에서 사라진다.
 */
export function weaponsOf(p: Player): Item[] {
  const worn = p.gear?.weapon;
  const out: Item[] = [];
  if (worn && isWeaponKind(worn.kind)) out.push(worn);
  for (const it of p.weapons ?? []) if (isWeaponKind(it.kind)) out.push(it);
  return out;
}

/** 무기 판의 한 줄 — 사람이 아니라 **무기 한 자루**가 한 줄이다 */
export interface WeaponEntry {
  /** 이 무기의 주인 */
  p: Player;
  item: Item;
  ilvl: number;
  /** 지금 끼고 있는 자루인가 (창고 것과 구분해 표시한다) */
  worn: boolean;
  /**
   * 목록 key.
   *
   * 사람 id 로는 부족하다 — 같은 사람이 같은 종류를 여러 자루 올릴 수 있어서
   * 한 판에 같은 id 가 여러 번 나온다. 아이템 id 를 붙여 갈라 준다.
   */
  key: string;
}

export interface WeaponBoard {
  kind: WeaponKind;
  rows: WeaponEntry[];
  /** 내 것 중 가장 높은 줄의 순위 (1-based). 한 자루도 없으면 0 */
  myRank: number;
  /** 내가 이 판에 올린 자루 수 */
  mineCount: number;
  /** 이 판에 올라온 자루 수 (사람 수가 아니다) */
  total: number;
}

/**
 * 무기 한 종류의 순위표.
 *
 * **자루 단위로 줄을 세운다.** 한 사람이 같은 종류를 셋 가지고 있으면 세 줄이
 * 올라간다 — 무기 판은 "누가 센가" 가 아니라 "이 종류의 제일 좋은 물건이 어디
 * 있는가" 를 보는 판이라, 사람당 한 줄로 접으면 그 목적이 사라진다.
 *
 * 그 종류를 **한 자루도 안 가진 사람은 아예 안 나온다.** 0으로 세워 두면
 * 열한 개 판마다 같은 사람들이 꼬리에 늘어서서 판이 전부 똑같아 보인다.
 */
export function weaponBoard(kind: WeaponKind, others: Player[], me: Player): WeaponBoard {
  const pool = [...others.filter((p) => !p.isMe && p.id !== me.id), me];
  const rows: WeaponEntry[] = [];
  for (const p of pool) {
    const worn = p.gear?.weapon;
    for (const item of weaponsOf(p)) {
      if (item.kind !== kind) continue;
      rows.push({
        p,
        item,
        ilvl: itemLevel(item),
        worn: !!worn && worn.id === item.id,
        key: `${p.id}#${item.id}`,
      });
    }
  }
  rows.sort((a, b) => b.ilvl - a.ilvl);
  const at = rows.findIndex((r) => r.p.isMe);
  return {
    kind,
    rows,
    myRank: at + 1,
    mineCount: rows.filter((r) => r.p.isMe).length,
    total: rows.length,
  };
}

/**
 * 보유 자산 계산식 — 랭킹 화면의 ? 버튼이 띄운다.
 *
 * 늘 띄워 두면 세 판 중 한 판에서만 쓸모 있는 문장이 항상 자리를 먹는다.
 * 궁금한 사람만 열어 보게 한다.
 */
export const NET_FORMULA = '보유 자산 = 소지금 + 변동성 자산 − 부채';

/**
 * 순위표 한 판을 짠다.
 *
 * `others` 는 서버에서 받은 남들이고, `me` 는 지금 화면의 내 상태다.
 * 서버에도 내 줄이 있지만(주기적으로 올린다) **그건 몇 분 전의 나**라서,
 * 방금 강화한 결과가 내 줄에만 안 보이는 일이 생긴다 — 그래서 서버본의 나는
 * 걷어 내고 지금 값으로 갈아 끼운다.
 */
export function board(id: BoardId, others: Player[], me: Player): Board {
  const rows = [...others.filter((p) => !p.isMe && p.id !== me.id), me].sort(cmp[id]);
  const myRank = rows.findIndex((p) => p.isMe) + 1;
  return { id, label: BOARD_META[id].label, rows, myRank, total: rows.length };
}

/** 상위 몇 %인가 */
export const percentile = (rank: number, total: number) =>
  Math.max(1, Math.round((rank / Math.max(1, total)) * 100));
