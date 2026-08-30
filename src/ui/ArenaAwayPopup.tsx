/**
 * "그동안 무슨 일이 있었나" — 미접속 중 당한 투기장 판 안내.
 *
 * 개별 줄을 열 개 띄우면 팝업이 아니라 목록이 된다. 여기서 말할 것은 세 가지다:
 * **몇 번 당했고, 몇 점이 오갔고, 티어가 움직였는가.** 누구에게 당했는지는
 * 투기장의 전적 탭이 이미 들고 있으므로 여기서 되풀이하지 않는다.
 *
 * 앱 루트에서 띄운다 — 화면 안에 두면 그 탭을 열어야만 보이는데, 이건 어느 탭으로
 * 들어오든 한 번은 봐야 하는 소식이다.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { useArenaDefense } from '@/state/useArenaDefense';
import { ARENA_TIERS } from '@/core/types';
import { Btn, KV, Row, Sep, T, Tag } from './atoms';
import { Popup } from './Popup';
import { BORDER, SP } from './theme';

export function ArenaAwayPopup({ active }: { active: boolean }) {
  const { digest, clear } = useArenaDefense(active);
  const nickname = useGame((s) => s.nickname);
  if (!digest) return null;

  const moved = digest.from !== digest.to;
  const up = ARENA_TIERS.indexOf(digest.to) > ARENA_TIERS.indexOf(digest.from);

  return (
    <Popup
      visible
      title="자리를 비운 사이"
      onClose={clear}
      right={<Tag label={`${digest.count}판`} fill />}
    >
      <T size={12}>
        {nickname}님이 접속하지 않은 동안 다른 모험가들이 도전해 왔습니다.
      </T>

      <Sep />
      <KV k="당한 판" v={`${digest.count}판`} />
      <KV k="전적" v={`${digest.wins}승 ${digest.losses}패`} />
      <Row between style={{ paddingVertical: 3 }}>
        <T size={12} dim="sub">점수 변동</T>
        <T size={14} bold>{digest.delta >= 0 ? '+' : ''}{digest.delta}</T>
      </Row>

      {/*
        티어가 움직였으면 그것만 크게 세운다 — 숫자보다 이게 먼저 읽혀야 한다.
        안 움직였으면 굳이 "그대로입니다" 를 적지 않는다.
      */}
      {moved && (
        <View style={[BORDER, { padding: SP.sm, marginTop: SP.sm, alignItems: 'center' }]}>
          <T size={11} dim="sub">{up ? '승급' : '강등'}</T>
          <Row gap={SP.sm} style={{ marginTop: 2 }}>
            <T size={18} bold>{digest.from}</T>
            <T size={14} dim="dim">→</T>
            <T size={18} bold>{digest.to}</T>
          </Row>
        </View>
      )}

      <T size={10} dim="dim" style={{ marginTop: SP.sm }}>
        도전을 당했을 때의 점수는 내가 건 판의 3분의 1만 반영됩니다.
        자세한 내용은 투기장 &gt; 전적에서 볼 수 있습니다.
      </T>

      <Btn label="확인" size="lg" fill style={{ marginTop: SP.md }} onPress={clear} />
    </Popup>
  );
}
