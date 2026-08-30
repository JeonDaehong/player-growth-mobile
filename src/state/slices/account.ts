/**
 * 계정 · 아바타 · 충전 · 환경설정.
 *
 * `store.ts` 한 파일에 3,600줄이 있던 시절에는 액션 하나를 고치려고 열 때마다
 * 관계없는 스무 개를 지나야 했다. 여기 있는 것들은 **같이 고쳐지는 것끼리** 모았다.
 *
 * 이 파일은 스토어를 만들지 않는다 — 액션 뭉치를 돌려줄 뿐이고, 조립은
 * `store.ts` 가 한다. 그래서 저장·마이그레이션·미들웨어는 여전히 한 곳에만 있다.
 * `get()` 은 **스토어 전체**를 주므로 다른 뭉치의 액션도 그대로 부를 수 있다.
 */
import type { Store } from '../types';
import type { SliceGet, SliceSet } from './kit';

import { setBgmEnabled, setBgmVolume, setSfxEnabled, setSfxVolume } from '@/ui/sfx';
import { ARENA_MAX_BADGE } from '@/core/combat';
import { SERVER_POPULATION } from '@/core/titles';
import { seeded } from '@/core/rng';
import {
  NICKNAME_MAX,
  NICKNAME_MIN,
  NICKNAME_MSG,
  canChangeFree,
  cashItem,
  validateNickname,
} from '@/core/cash';
import { fmtShort } from '@/core/currency';
import { hasProfanity } from '@/core/profanity';
import { REFILLS, refillMax, refillPrice, usedToday } from '@/core/refill';
import { AVATAR_NAME, AVATAR_PRICE, AVATAR_SOURCE } from '@/core/avatars';
import { dayKey, dayKeyNow, selMaxStamina } from '../helpers';

/** 이 뭉치가 맡는 액션들 */
export type AccountActions = Pick<
  Store,
  'setNickname' | 'signIn' | 'completeSignUp' | 'signOut' | 'buyCashItem'
  | 'setAvatar' | 'grantAvatar' | 'buyAvatar' | 'buyRefill' | 'hideEventPopup'
  | 'markTutorial' | 'setTutorialOff' | 'popTitleNotice' | 'markGuide' | 'resetTutorials'
  | 'setSfxOn' | 'setBgmOn' | 'setSfxVol' | 'setBgmVol'
>;

export const createAccountSlice = (
  set: SliceSet,
  get: SliceGet,
): AccountActions => ({
  /**
   * 닉네임 변경.
   * 90일에 한 번은 무료, 그 뒤로는 닉네임 변경권을 소모한다.
   */
  setNickname: (n) => {
    const st = get();
    const now = Date.now();
    const tickets = st.cashItems.nick_ticket ?? 0;
    const err = validateNickname(n, st.nickname, st.nicknameChangedAt, now, tickets);
    if (err) { get().toast(NICKNAME_MSG[err], 'bad'); return err; }

    const free = canChangeFree(st.nicknameChangedAt, now);
    set({
      nickname: n.trim(),
      nicknameChangedAt: now,
      cashItems: free
        ? st.cashItems
        : { ...st.cashItems, nick_ticket: tickets - 1 },
    });
    get().toast(free ? '닉네임을 변경했습니다 (무료)' : '닉네임 변경권을 사용했습니다', 'good');
    return 'ok';
  },

  signIn: (provider, id, email) => set({ account: { provider, id, email } }),

  completeSignUp: (nickname) => {
    const t = nickname.trim();
    if (t.length < NICKNAME_MIN || t.length > NICKNAME_MAX) {
      get().toast(`닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자입니다`, 'bad');
      return false;
    }
    // 가입 때도 같은 잣대로 막는다 — 여기가 뚫리면 변경 화면의 검사는 의미가 없다
    if (hasProfanity(t)) {
      get().toast(NICKNAME_MSG.profanity, 'bad');
      return false;
    }
    // 가입 시점의 닉네임은 "변경"이 아니므로 무료 주기를 소모하지 않는다
    // 가입 순번은 계정 id 에서 한 번만 뽑아 고정한다 (매번 굴리면 칭호가 들쭉날쭉해진다)
    const acc = get().account;
    const no = acc
      ? 1 + Math.floor(seeded(acc.id, 'signup-no')() * SERVER_POPULATION)
      : 0;
    set({
      nickname: t, signedUp: true, nicknameChangedAt: 0,
      titleTrack: { ...get().titleTrack, signupNo: no },
    });
    get().checkTitles();
    return true;
  },

  signOut: () => set({ account: null }),

  buyCashItem: (id, qty = 1) => {
    const st = get();
    const it = cashItem(id);
    const total = it.price * qty;
    if (st.money < total) {
      get().toast(`골드가 부족합니다 (${st.money}/${total})`, 'bad');
      return false;
    }
    set({
      money: st.money - total,
      cashItems: { ...st.cashItems, [id]: (st.cashItems[id] ?? 0) + qty },
    });
    get().toast(`${it.name} ${qty}개 구매`, 'good');
    return true;
  },
  /**
   * 로고 변경.
   *
   * 안 가진 로고는 못 낀다. 화면(로고 선택)이 이미 잠긴 칸을 막지만,
   * 여기서 한 번 더 본다 — 저장본을 손댄 상태로 들어올 수 있고, 무엇보다
   * "남의 화면에 뜨는 그림" 은 화면 한 곳만 믿고 열어 둘 자리가 아니다.
   */
  setAvatar: (a) => {
    if (!get().ownedAvatars.includes(a)) {
      get().toast('아직 가지고 있지 않은 로고입니다', 'bad');
      return;
    }
    set({ avatar: a });
  },

  /**
   * 로고를 계정에 넣는다. 쿠지·칭호·구매가 전부 여기를 지난다.
   * @returns 새로 들어왔는가 (이미 있었으면 false)
   */
  grantAvatar: (id) => {
    const st = get();
    if (st.ownedAvatars.includes(id)) return false;
    set({ ownedAvatars: [...st.ownedAvatars, id] });
    return true;
  },

  /** 골드로 로고를 산다 (이세계 행상인) */
  buyAvatar: (id) => {
    const st = get();
    const price = AVATAR_PRICE[id];
    if (AVATAR_SOURCE[id] !== 'gold' || price === undefined) {
      get().toast('여기서 파는 로고가 아닙니다', 'bad');
      return false;
    }
    if (st.ownedAvatars.includes(id)) {
      get().toast('이미 가지고 있습니다', 'bad');
      return false;
    }
    if (st.money < price) {
      get().toast(`${fmtShort(price - st.money)} 부족합니다`, 'bad');
      return false;
    }
    set({ money: st.money - price, ownedAvatars: [...st.ownedAvatars, id] });
    get().toast(`로고 "${AVATAR_NAME[id]}"을(를) 샀습니다`, 'good');
    return true;
  },

  /**
   * 골드로 체력·티켓을 가득 채운다.
   *
   * 값은 **오늘 몇 번째로 사는가**에 달렸다 (`core/refill`). 자정이 지나면
   * 날짜 키가 안 맞아 0번째부터 다시 센다.
   */
  buyRefill: (kind) => {
    const st = get();
    const today = dayKeyNow();
    const used = usedToday(st.refills, kind, today);
    const price = refillPrice(kind, used);
    const def = REFILLS[kind];

    if (price === null) {
      get().toast(`오늘은 ${def.name}을(를) ${refillMax(kind)}번까지만 살 수 있습니다`, 'bad');
      return false;
    }
    if (st.money < price) {
      get().toast(`${fmtShort(price - st.money)} 부족합니다`, 'bad');
      return false;
    }
    // 이미 가득 찬 걸 사면 돈만 없어진다 — 화면이 막지만 여기서도 막는다
    const max = kind === 'stamina' ? selMaxStamina(st) : ARENA_MAX_BADGE;
    const cur = kind === 'stamina' ? st.stamina : st.arena.badges;
    if (cur >= max) {
      get().toast(`이미 가득 차 있습니다 (${cur}/${max})`, 'bad');
      return false;
    }

    const now = Date.now();
    /* 날짜가 바뀌었으면 이번 것이 오늘의 첫 번째다 */
    const base = st.refills.dayKey === today
      ? st.refills
      : { dayKey: today, stamina: 0, ticket: 0 };

    set({
      money: st.money - price,
      refills: { ...base, dayKey: today, [kind]: used + 1 },
      ...(kind === 'stamina'
        /* 가득 찼으므로 다음 회복 시계는 지금부터 다시 센다 */
        ? { stamina: max, staminaAt: now }
        : { arena: { ...st.arena, badges: ARENA_MAX_BADGE, badgeAt: now } }),
    });
    get().toast(`${def.name} — ${cur} → ${max} (${fmtShort(price)})`, 'good');
    return true;
  },

  // ── 온보딩 · 환경설정 ───────────────────────────
  hideEventPopup: (days = 0) =>
    set({ eventPopupHideUntil: days > 0 ? Date.now() + days * 86_400_000 : 0 }),
  markTutorial: (key) => {
    const st = get();
    if (st.tutorialSeen.includes(key)) return;
    set({ tutorialSeen: [...st.tutorialSeen, key] });
  },
  setTutorialOff: (off) => set({ tutorialOff: off }),
  popTitleNotice: () => set((st) => ({ titleQueue: st.titleQueue.slice(1) })),
  markGuide: (id) => {
    const st = get();
    if (st.guidesSeen.includes(id)) return;
    set({ guidesSeen: [...st.guidesSeen, id] });
  },
  resetTutorials: () => set({ tutorialSeen: [], tutorialOff: false, guidesSeen: [] }),
  setSfxOn: (on) => {
    setSfxEnabled(on);
    set({ sfxOn: on });
  },
  setBgmOn: (on) => {
    setBgmEnabled(on);
    set({ bgmOn: on });
  },
  /*
    음량을 0 으로 내려도 켜짐 상태는 그대로 둔다. 0 에서 다시 올릴 때
    "꺼짐" 까지 따로 켜야 한다면 손잡이가 두 개인 이유가 없어진다.
  */
  setSfxVol: (v) => {
    const n = Math.max(0, Math.min(1, v));
    setSfxVolume(n);
    set({ sfxVol: n });
  },
  setBgmVol: (v) => {
    const n = Math.max(0, Math.min(1, v));
    setBgmVolume(n);
    set({ bgmVol: n });
  },
});
