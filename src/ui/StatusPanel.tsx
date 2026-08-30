import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { dayKeyNow, fmtIlvl, useGame } from '@/state/store';
import {
  selCurIlvl,
  selIlvl,
  selPenalty,
  selRuneMul,
  selSetMul,
  useIsGuildMaster,
  useMyGuild,
} from '@/state/selectors';
import { GUILD_LEVEL_MAX, guildLevelOf } from '@/core/guildRaid';

import { ICONS } from './sprites';
import { isWeaponKind } from '@/core/types';
import { TitleTag } from './TitleTag';
import { fmtShort } from '@/core/currency';
import { Axis, CAPS, GRADES, axisText, spiritTotal } from '@/core/spirit';
import {
  NICKNAME_MAX,
  NICKNAME_MSG,
  canChangeFree,
  freeChangeLabel,
  validateNickname,
} from '@/core/cash';
import { Btn, KV, Panel, Row, Sep, T, Tag } from './atoms';
import { Popup } from './Popup';
import { Pixel } from './Pixel';
import { Sprite } from './Sprite';
import { Shine } from './Shine';
import { isArtisan } from '@/core/tiers';
import { EXPLORE_CHAPTERS, TOWER_FLOORS } from '@/core/combat';
import { equipArt } from './equipArt';
import { WEAPON_SPRITES } from './sprites';
import { BORDER, MONO, SP, WHITE } from './theme';

/**
 * 내 정보 — 홈과 프로필이 같은 것을 본다.
 *
 * 로고(투기장 얼굴)를 맨 위에 두고 이름·칭호·아이템레벨을 붙인다.
 * 홈과 프로필에서 내용이 갈리면 어느 쪽이 맞는지 헷갈리므로 한 컴포넌트로 묶었다.
 * 변경 버튼은 프로필에서만 넘겨준다 (홈은 보기 전용).
 */
export function StatusPanel({
  onChangeLogo,
  onChangeTitle,
  canRename,
}: {
  onChangeLogo?: () => void;
  onChangeTitle?: () => void;
  /**
   * 이름 옆 연필을 보여 줄까.
   *
   * 홈은 **보기 전용**이다 — 장비를 만지러 들어온 화면에서 이름까지 고칠 수 있으면
   * 무엇을 하는 화면인지 흐려지고, 강화하다 잘못 눌러 닉네임 창이 뜨는 일도 생긴다.
   * 고치는 건 프로필(기타 › 프로필)에서만 한다. 로고·칭호 변경 버튼과 같은 규칙이다.
   */
  canRename?: boolean;
}) {
  const [rename, setRename] = useState(false);
  const avatar = useGame((s) => s.avatar);
  const nickname = useGame((s) => s.nickname);
  const isMaster = useIsGuildMaster();
  const title = useGame((s) => s.equippedTitle);
  const equipped = useGame((s) => s.equipped);
  const ilvl = useGame(selIlvl);
  const cur = useGame(selCurIlvl);
  const penalty = useGame(selPenalty);
  const stats = useGame((s) => s.stats);
  const exploreCleared = useGame((s) => s.exploreCleared);
  const towerCleared = useGame((s) => s.towerCleared);

  const guild = useMyGuild();
  const guildExp = useGame((s) => s.guildExp);
  const guildPoints = useGame((s) => s.guildPoints);
  const guildId = useGame((s) => s.guildId);
  const attendedDay = useGame((s) => s.guildCheck.dayKey);
  // 저장된 날짜 키와 비교할 때는 반드시 스토어의 함수를 쓴다 (형식이 갈리면 늘 "지난 날")
  const today = dayKeyNow();

  const runeMul = useGame(selRuneMul);
  const setMul = useGame(selSetMul);
  const rune = spiritTotal(equipped, { runeIlvlMul: runeMul, setSynergyMul: setMul });
  /** 실제로 값이 붙은 축만 (0 인 축을 늘어놓으면 목록이 표가 된다) */
  const axes = (Object.keys(rune.bonus) as Axis[]).filter((a) => (rune.bonus[a] ?? 0) !== 0);
  const weapon = equipped.weapon;
  const weaponFallback = weapon && isWeaponKind(weapon.kind) ? WEAPON_SPRITES[weapon.kind] : undefined;

  return (
    <Panel title="내 정보">
      {/* 한 줄에 다 담는다 — 로고·이름·칭호 왼쪽, 무기·아이템레벨 오른쪽 */}
      <Row gap={SP.md}>
        <View style={[BORDER, { padding: SP.xs, borderWidth: 2 }]}>
          <Sprite set="avatar" name={avatar} size={60} />
        </View>

        <View style={{ flex: 1 }}>
          {/*
            이름 옆의 연필.

            닉네임 변경은 기타 › 프로필 맨 아래 패널에 있었다. 이름은 **여기**
            적혀 있는데 고치는 곳은 세 번 스크롤 아래였다 — 고치려는 사람이
            자기 이름을 보고 있으면서도 어디로 가야 하는지 몰랐다.
            고치는 자리는 고칠 것 바로 옆이어야 한다.

            단, **프로필에서만** 뜬다 (`canRename`). 홈은 보기 전용이다.
          */}
          <Row gap={SP.xs}>
            <T size={16} bold numberOfLines={1} style={{ flexShrink: 1 }}>{nickname}</T>
            {canRename && (
              <Pressable
                onPress={() => setRename(true)}
                hitSlop={12}
                style={({ pressed }) => ({ padding: 2, opacity: pressed ? 0.5 : 0.75 })}
              >
                <Pixel sprite={ICONS.pencil} scale={1.5} />
              </Pressable>
            )}
          </Row>
          <Row gap={SP.xs} style={{ marginTop: 3 }}>
            {title
              ? <TitleTag id={title} size={11} />
              : <T size={11} dim="dim">칭호 없음</T>}
          </Row>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          {weapon && (
            <Shine size={34} active={isArtisan(weapon.tier)}>
              <Sprite {...equipArt(weapon.kind, weapon.tier)} size={34} fallback={weaponFallback} />
            </Shine>
          )}
          <T size={9} dim="sub">아이템레벨</T>
          <Row gap={SP.xs} style={{ alignItems: 'flex-end' }}>
            <T size={26} bold>{fmtIlvl(cur)}</T>
            {penalty && <T size={11} dim="dim" style={{ marginBottom: 4 }}>/ {fmtIlvl(ilvl)}</T>}
          </Row>
        </View>
      </Row>

      {penalty && (
        <View style={[BORDER, { padding: SP.xs, marginTop: SP.sm }]}>
          <T size={9} bold center>내구도 보정 적용 중 — 수리 후 전투 권장</T>
        </View>
      )}

      {/*
        소속 길드.
        길드 탭까지 들어가야만 내 길드가 보이면, 가입해 놓고도 어디 소속인지
        잊는다. 홈과 프로필이 같이 쓰는 이 패널에 한 줄로 박아 둔다 —
        오늘 길드 출석을 했는지까지 여기서 알 수 있어야 매일 들어갈 이유가 된다.
      */}
      {!!guild && (
        <>
          <Sep />
          <Row gap={SP.sm}>
            <Sprite set="guild" name={guild.emblem} size={30} fallback={ICONS.skull} />
            <View style={{ flex: 1 }}>
              <Row gap={SP.xs}>
                <T size={13} bold numberOfLines={1} style={{ flex: 1 }}>{guild.name}</T>
                {isMaster && <Tag label="길드장" fill />}
              </Row>
              <T size={9} dim="dim" numberOfLines={1}>
                길드 Lv {guildLevelOf(guildExp).level} / {GUILD_LEVEL_MAX}
                {' · '}내 기여도 {guildPoints.toLocaleString('en-US')}
              </T>
            </View>
            <Tag
              label={
                attendedDay === today ? '출석 완료' : '출석 전'
              }
              fill={attendedDay !== today}
            />
          </Row>
        </>
      )}

      {/* 룬각인 요약 — 지금 무슨 세트를 몇 칸 맞췄는지 */}
      {rune.sets.length > 0 && (
        <>
          <Sep />
          <Row between>
            <T size={11} bold>룬각인</T>
            <T size={10} dim="sub">아이템레벨 +{fmtIlvl(rune.ilvl)}</T>
          </Row>
          {rune.sets.slice(0, 3).map((s) => (
            <Row key={`${s.trait}-${s.grade}`} between style={{ paddingVertical: 1 }}>
              <Row gap={SP.xs} style={{ flex: 1 }}>
                <Sprite set="grade" name={`g${GRADES.indexOf(s.grade) + 1}`} size={16} />
                <T size={10} numberOfLines={1} style={{ flex: 1 }}>{s.trait}</T>
              </Row>
              <T size={10} bold>{s.count}칸{s.step > 0 ? ` · ${s.step}단계` : ''}</T>
            </Row>
          ))}
          {rune.sets.length > 3 && (
            <T size={9} dim="dim">외 {rune.sets.length - 3}종</T>
          )}

          {/*
            지금 **실제로 받고 있는 효과 총량.**

            세트가 몇 칸인지는 보여 줬는데 정작 "그래서 뭐가 얼마나 좋아졌나" 가
            어디에도 없었다. 엘프의 집까지 가야 볼 수 있었는데, 그건 각인을 새기러
            가는 곳이지 내 상태를 확인하러 가는 곳이 아니다.
            상한에 걸린 축은 그렇게 표시한다 — 더 모아도 안 오른다는 걸 알아야
            다음 정령석을 어디에 쓸지 정할 수 있다.
          */}
          {axes.length > 0 && (
            <>
              <Sep />
              <T size={11} bold style={{ marginBottom: 2 }}>받고 있는 효과</T>
              {axes.map((a) => (
                <Row key={a} between style={{ paddingVertical: 1 }}>
                  <T size={10} dim="sub">{axisText(a, rune.bonus[a] ?? 0)}</T>
                  {rune.capped.includes(a) && <Tag label={`상한 ${CAPS[a]}`} />}
                </Row>
              ))}
            </>
          )}
        </>
      )}

      <Sep />
      <KV k="투기장 전적" v={`${stats.arenaWins}승 ${stats.arenaLosses}패`} />
      {/* 상수를 박으면 챕터를 늘렸을 때 여기만 조용히 옛 값으로 남는다 (실제로 그랬다) */}
      <KV k="탐험 최고 챕터" v={`${exploreCleared} / ${EXPLORE_CHAPTERS}`} />
      <KV k="보스의탑 최고 층" v={`${towerCleared} / ${TOWER_FLOORS}`} />
      <KV k="강화에 갈아넣은 돈" v={fmtShort(stats.goldSpentOnEnhance)} />

      {(onChangeLogo || onChangeTitle) && (
        <Row gap={SP.sm} style={{ marginTop: SP.md }}>
          {!!onChangeLogo && <Btn label="로고 변경" size="sm" style={{ flex: 1 }} onPress={onChangeLogo} />}
          {!!onChangeTitle && <Btn label="칭호 변경" size="sm" style={{ flex: 1 }} onPress={onChangeTitle} />}
        </Row>
      )}

      <NicknamePopup visible={!!canRename && rename} onClose={() => setRename(false)} />
    </Panel>
  );
}

/**
 * 닉네임 변경.
 *
 * 규칙(90일마다 무료, 그 뒤로는 변경권)은 `core/cash` 에 있고 여기서는 **보여 주고
 * 받는 것**만 한다. 여는 곳은 프로필 하나뿐이다 (`canRename`).
 */
function NicknamePopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const nickname = useGame((s) => s.nickname);
  const setNickname = useGame((s) => s.setNickname);
  const nickAt = useGame((s) => s.nicknameChangedAt);
  const tickets = useGame((s) => s.cashItems.nick_ticket ?? 0);
  const [draft, setDraft] = useState(nickname);

  /* 창을 열 때마다 지금 이름에서 시작한다 — 지난번에 치다 만 글자가 남아 있으면 안 된다 */
  useEffect(() => { if (visible) setDraft(nickname); }, [visible, nickname]);

  const now = Date.now();
  const free = canChangeFree(nickAt, now);
  const err = validateNickname(draft, nickname, nickAt, now, tickets);

  return (
    <Popup
      visible={visible}
      title="닉네임 변경"
      onClose={onClose}
      right={<Tag label={free ? '무료 변경 가능' : `변경권 ${tickets}장`} fill={free} />}
    >
      <T size={11} dim="sub">
        실시간 피드와 채팅, 랭킹에 쓰입니다. 최대 {NICKNAME_MAX}자.
      </T>
      <Row gap={SP.sm} style={{ marginTop: SP.sm }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          maxLength={NICKNAME_MAX}
          autoFocus
          placeholder="이름"
          placeholderTextColor="#FFFFFF55"
          style={[
            BORDER,
            {
              flex: 1,
              color: WHITE,
              fontFamily: MONO,
              fontSize: 15,
              paddingHorizontal: SP.sm,
              paddingVertical: SP.sm,
            },
          ]}
        />
        <T size={10} dim="dim">{draft.trim().length} / {NICKNAME_MAX}</T>
      </Row>

      {/* 못 바꾸는 이유는 입력 바로 아래에 — 버튼까지 내려가서 알면 이미 늦다 */}
      {!!draft.trim() && !!err && err !== 'same' && (
        <T size={11} bold style={{ marginTop: SP.xs }}>{NICKNAME_MSG[err]}</T>
      )}

      <Sep />
      <KV k="지금 이름" v={nickname} dim />
      <T size={10} dim="dim">
        {freeChangeLabel(nickAt, now)}
        {!free && ' · 변경권 1장을 사용합니다'}
      </T>
      {!free && tickets <= 0 && (
        <T size={10} dim="dim" style={{ marginTop: 3 }}>
          닉네임 변경권은 뒷동산 &gt; 이세계 행상인에서 구매합니다.
        </T>
      )}

      <Btn
        label="변경하기"
        size="lg"
        fill={!err}
        disabled={!!err}
        style={{ marginTop: SP.md }}
        onPress={() => { if (setNickname(draft) === 'ok') onClose(); }}
      />
    </Popup>
  );
}
