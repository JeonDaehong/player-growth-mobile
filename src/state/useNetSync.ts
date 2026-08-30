/**
 * 내 공개 한 줄을 서버에 올린다 — 랭킹·투기장 상대·채팅 명패의 원본.
 *
 * 저장본(useCloudSync)과 다른 것을 올린다. 저장본은 **나만 읽는 전체 상태**고,
 * 여기 올리는 건 **남이 읽는 요약**이다. 창고에 뭐가 있는지, 대출이 몇 개인지는
 * 남이 알 바가 아니다.
 *
 * 언제 올리는가
 *   · 들어오자마자 한 번 — 그래야 다른 사람의 랭킹·상대 목록에 내가 뜬다
 *   · 그 뒤로는 30초마다 한 번, **바뀐 게 있을 때만** (`publishProfile` 이 판단한다)
 *   · 자리를 뜰 때 한 번 더 (마지막 상태를 남긴다)
 *
 * ⚠ 왜 값이 바뀔 때가 아니라 타이머인가
 *   주식은 초당 움직이고 순자산은 거기 딸려 움직인다. 값을 의존성에 걸면 이 훅이
 *   **초당 한 번씩 재실행**되고, 그때마다 AppState 리스너를 떼었다 붙인다.
 *   올리는 건 어차피 눌러 놨으므로(net.ts), 읽는 쪽도 타이머로 맞춘다.
 */
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { guildStatsOf, useGame } from './store';
import { bagWeapons, selCurIlvl, selIlvl, useAssets, useMyGuild } from './selectors';
import { useChat } from './live';
import { autoOpenSessionOnce } from './googleAuth';
import { flushStorage } from './storage';
import { useMeId } from './useBoard';
import {
  forgetUser, myUserId, netEnabled, publishProfile, syncMasterNick, type MyProfile,
} from './net';
import { SLOT_IDS, type Item } from '@/core/types';
import { EMPTY_GUILD_STATS } from '@/core/guilds';

/** 이번 실행에서 세션 자동 복구를 이미 시도했는가 */
let tried = false;

/** 올려 볼까 하고 확인하는 간격. 실제 업로드는 값이 바뀌었을 때만 일어난다 */
const CHECK_MS = 30_000;

/**
 * 착용 장비의 평균 내구도.
 *
 * 투기장 상대 화면이 "수리를 안 하고 왔다" 를 이 값으로 판단한다. 슬롯 하나가
 * 0이어도 나머지가 멀쩡하면 그 사람은 멀쩡한 것이므로 **평균**을 쓴다
 * (최솟값을 쓰면 반지 하나 닳은 랭커가 전부 만만해 보인다).
 */
function avgDur(eq: Partial<Record<string, Item>>): number {
  let sum = 0;
  let n = 0;
  for (const sl of SLOT_IDS) {
    const it = eq[sl];
    if (!it) continue;
    sum += it.dur;
    n += 1;
  }
  return n ? Math.round(sum / n) : 100;
}

/**
 * @param active 게임에 들어온 뒤인가 (로그인·회원가입을 마쳤는가)
 */
export function useNetSync(active: boolean) {
  const nickname = useGame((s) => s.nickname);
  const avatar = useGame((s) => s.avatar);
  const equipped = useGame((s) => s.equipped);
  const inventory = useGame((s) => s.inventory);
  const arena = useGame((s) => s.arena);
  const stats = useGame((s) => s.stats);
  const guildId = useGame((s) => s.guildId);
  const guild = useMyGuild();
  const meId = useMeId();
  const title = useGame((s) => s.equippedTitle);
  const ilvl = useGame(selIlvl);
  const curIlvl = useGame(selCurIlvl);
  const assets = useAssets();

  /*
    채팅이 내 이름과 길드를 알아야 한다. 전송 계층이 게임 스토어를 직접 읽으면
    store → live 방향의 import 와 맞물려 순환이 되므로, 여기서 밀어 넣는다.
  */
  useEffect(() => {
    useChat.getState().setIdentity(nickname, guildId);
  }, [nickname, guildId]);

  /** 늘 최신 값을 들고 있는 상자. 타이머가 여기서 읽어 간다 */
  const latest = useRef<MyProfile>(null as unknown as MyProfile);
  latest.current = {
    nick: nickname,
    avatar,
    ilvl,
    curIlvl,
    dur: avgDur(equipped),
    net: assets.net,
    arenaPoints: arena.points,
    wins: stats.arenaWins,
    losses: stats.arenaLosses,
    gear: equipped,
    /* 무기 랭킹이 창고 것까지 센다 — 개수는 net.ts 가 자른다 (BAG_MAX) */
    weapons: bagWeapons(inventory),
    guildId,
    /*
      길드 이름은 **길드 표에 있다** — 여기 싣는 건 랭킹 한 줄에서 프로필만 보고
      길드 이름을 적기 위한 사본이다. 목록의 정본은 언제나 guilds 표다.
    */
    guildName: guild?.name ?? null,
    title,
    // 길드 수치는 **올리는 순간에** 읽는다 (아래 snapshot 참고)
    guildStats: EMPTY_GUILD_STATS,
  };

  /*
    올릴 것 한 벌.

    ⚠ 길드 수치(기여도·출석·레이드 피해)는 여기서 **그 순간에** 읽는다.
    렌더 때 굳혀 두면 안 된다 — 이 훅은 그 필드들을 구독하지 않아서,
    레이드를 때려도 리렌더가 안 나면 옛 값이 그대로 다시 올라간다.
  */
  const snapshot = (): MyProfile => ({
    ...latest.current,
    guildStats: guildStatsOf(useGame.getState()),
  });

  useEffect(() => {
    if (!active || !netEnabled()) return;

    // 들어오자마자 (throttle 을 건너뛴다 — 첫 한 줄은 늦으면 안 된다)
    void publishProfile(snapshot(), true);

    const timer = setInterval(() => void publishProfile(snapshot()), CHECK_MS);
    // 탭을 가리거나 닫을 때 마지막 상태를 한 번 더
    const sub = AppState.addEventListener('change', (st) => {
      if (st !== 'active') void publishProfile(snapshot(), true);
    });

    return () => {
      clearInterval(timer);
      sub.remove();
      void publishProfile(snapshot(), true);
    };
  }, [active]);

  /*
    길드가 바뀌면 30초를 기다리지 않고 곧바로 올린다.

    서버는 길드 채팅 권한을 **프로필의 guild_id 로** 판정한다 (schema.sql 의
    "chat: read/write" 정책). 방금 가입한 사람이 인사부터 치는 건 아주 흔한데,
    프로필이 아직 옛 길드면 그 첫 마디가 RLS 에 막힌다.
  */
  useEffect(() => {
    if (!active || !netEnabled()) return;
    void publishProfile(snapshot(), true);
  }, [active, guildId]);

  /*
    길드장이 이름을 바꾸면 길드 표의 표기도 따라가야 한다.

    길드 목록의 "길드장" 칸은 `guilds.master_nick` 에서 온다 — 목록 한 줄을
    그리려고 프로필을 또 조회하지 않으려고 복사해 둔 값이다. 복사본은 원본이
    바뀔 때 같이 갱신하지 않으면 조용히 어긋난다 (닉네임 변경권이 있는 게임이다).
  */
  const isMaster = !!guild && guild.masterId === meId;
  useEffect(() => {
    if (!active || !netEnabled() || !isMaster || !guild) return;
    if (guild.master === nickname) return;
    void syncMasterNick(guild.id, nickname);
  }, [active, isMaster, guild?.id, guild?.master, nickname]);

  /*
    서버 세션이 열려 있는지 들어올 때 확인하고, 없으면 **스스로 연다.**

    구글 로그인은 게임 계정을 만들고, Supabase 세션은 그것과 별개로 열린다.
    두 번째 단계가 조용히 실패하면 랭킹·채팅·길드·클라우드 저장이 전부 죽는데,
    당한 사람은 자기가 뭘 잘못했는지 알 수 없다. **고칠 수 있는 문제를 사람에게
    떠넘기면 안 된다** — 버튼을 만들어 두고 "누르세요" 라고 하는 것도 떠넘기는 것이다.

    자동 복구는 **딱 한 번**이다 (`autoOpenSessionOnce`). 리디렉션은 페이지를
    통째로 갈아 끼우므로, 돌아와서도 세션이 없으면 무한 왕복이 된다.
    두 번째부터는 설정 화면의 진단이 맡는다.

    떠나기 전에 저장본을 비운다 — 로컬 쓰기는 최대 2초 지연되므로, 그냥 나가면
    방금 한 강화가 사라진다.
  */
  useEffect(() => {
    if (!active || !netEnabled() || tried) return;
    tried = true;
    let alive = true;
    void myUserId().then(async (id) => {
      if (!alive || id) return;
      await flushStorage();
      await autoOpenSessionOnce();
    });
    return () => { alive = false; };
  }, [active]);

  // 게임을 나가면(로그아웃) 캐시해 둔 사용자 id 를 버린다 — 계정을 바꿔 들어올 수 있다
  useEffect(() => {
    if (!active) forgetUser();
  }, [active]);
}
