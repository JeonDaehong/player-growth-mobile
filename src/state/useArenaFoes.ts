/**
 * 투기장 상대 목록.
 *
 * 예전엔 한 명씩 보여 주고 "다른 상대" 를 누르게 했다. 그러면 마음에 드는 상대가
 * 나올 때까지 버튼만 두들기는 화면이 된다. 지금은 **다섯을 늘어놓는다** — 승률과
 * 내구도를 나란히 놓고 고르는 화면이 되고, 그게 투기장에서 할 일이다.
 *
 * 고르는 규칙은 `core/arena` 의 `pickFoes` 에 있다 (같은 티어 → 가까운 티어 →
 * 아이템레벨 순). 여기서는 **받아 오고 들고 있는 것**만 한다.
 *
 * 왜 묶음으로 받는가
 *   다시 뽑을 때마다 왕복하면 느리고, 연타하면 요청이 겹친다. 한 번에 마흔 명을
 *   받아 두면 그 뒤로는 즉시 나온다. 목록이 몇 분 낡아도 상관없다 — 어차피
 *   접속해 있지 않은 사람의 그림자와 붙는 것이다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ghost } from '@/core/combat';
import { arenaTierOf } from '@/core/combat';
import { pickFoes } from '@/core/arena';
import type { ArenaTier } from '@/core/types';
import { fetchOpponents, netEnabled, type NetProfile } from './net';

const toGhost = (p: NetProfile): Ghost => ({
  id: p.userId,
  name: p.nick,
  avatar: p.avatar,
  ilvl: Math.round(p.ilvl),
  dur: p.dur,
  curIlvl: Math.round(p.curIlvl),
  /* 매칭이 티어를 먼저 본다 — 프로필에 이미 실려 오는 값이다 */
  points: p.arenaPoints,
  guildName: p.guildName,
});

export interface ArenaFoes {
  /** 지금 화면에 늘어놓은 상대들 (최대 5) */
  foes: Ghost[];
  /** 다시 뽑는다 — 한 명은 남는다 */
  reroll: () => void;
  /** 방금 싸운 상대를 목록에서 뺀다 (티켓을 쓴 판을 또 걸 수는 없다) */
  consume: (id: string) => void;
  loading: boolean;
  /** 붙을 사람이 아무도 없다 (나 말고 아무도 안 들어왔다) */
  empty: boolean;
  /** 이 빌드에 서버가 없다 */
  off: boolean;
  /** 후보가 다섯보다 적다 — 겹치는 것을 피할 수 없다는 뜻 */
  thin: boolean;
}

export function useArenaFoes(myCurIlvl: number, myTier: ArenaTier): ArenaFoes {
  const pool = useRef<Ghost[]>([]);
  const [foes, setFoes] = useState<Ghost[]>([]);
  const [loading, setLoading] = useState(netEnabled());
  const [empty, setEmpty] = useState(false);

  /*
    ⚠ 매칭에 쓰는 내 티어·템렙은 **ref 로 들고 있는다.**

    상태로 두고 의존성에 걸면 강화 한 번, 판 한 번마다 목록이 통째로 다시 뽑힌다 —
    고르려고 보고 있던 다섯이 눈앞에서 갈린다. 값은 최신으로 유지하되, 다시 뽑는
    건 사람이 누를 때만 한다.
  */
  const my = useRef({ ilvl: myCurIlvl, tier: myTier });
  my.current = { ilvl: myCurIlvl, tier: myTier };

  const draw = useCallback((keep: Ghost[]) => {
    setFoes(pickFoes(pool.current, my.current.tier, my.current.ilvl, arenaTierOf, keep));
  }, []);

  const myIlvlAtMount = useRef(myCurIlvl);
  useEffect(() => {
    if (!netEnabled()) { setLoading(false); return; }
    let alive = true;
    void fetchOpponents(myIlvlAtMount.current).then((list) => {
      if (!alive) return;
      pool.current = list.map(toGhost);
      setLoading(false);
      setEmpty(pool.current.length === 0);
      draw([]);
    });
    return () => { alive = false; };
  }, [draw]);

  const reroll = useCallback(() => draw(foes), [draw, foes]);

  /*
    싸운 상대는 목록에서 뺀다.

    티켓을 쓴 판을 같은 줄에서 또 걸 수 있으면 "다시 뽑기" 에 값을 매긴 의미가
    없다 — 같은 사람만 계속 두들기면 되기 때문이다. 대신 후보 풀에는 남겨 둔다
    (다음에 다시 뽑을 때는 나올 수 있다).
  */
  const consume = useCallback((id: string) => {
    setFoes((cur) => {
      const rest = cur.filter((f) => f.id !== id);
      /* 빈자리는 풀에서 하나 채운다 — 판을 걸 때마다 목록이 줄기만 하면 안 된다 */
      const fill = pool.current.find(
        (p) => p.id !== id && !rest.some((r) => r.id === p.id));
      return fill ? [...rest, fill] : rest;
    });
  }, []);

  return {
    foes,
    reroll,
    consume,
    loading,
    empty,
    off: !netEnabled(),
    thin: pool.current.length > 0 && pool.current.length <= 5,
  };
}
