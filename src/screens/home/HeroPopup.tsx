/**
 * ── 영웅 ── 누가 서고 어떻게 서나.
 *
 * 아래 띠의 첫 칸이 여는 창이다 (`BottomNav` 의 `hero`).
 *
 * ## 왜 홈에서 여기로 옮겼나
 *
 * 대형 고르기가 홈 화면 한가운데, 파티 칸 바로 위에 있었다. 그 자리는
 * **지금 벌어지는 일을 보는 자리**인데 대형은 보는 것이 아니라 정하는
 * 것이라, 볼 때마다 눈에 걸리고 정할 때는 무대 아래로 굴려 내려가야 했다.
 *
 * 편성은 편성끼리 모으는 것이 맞다 — 누가 서나(파티)와 어떻게 서나(대형)는
 * 같은 하나의 결정이다.
 *
 * ## 여기서 고른 것은 **다음 판부터** 들어간다
 *
 * 창을 닫는다고 바뀌지 않는다 (`state/types` 의 `pendingParty`). 지금 판이
 * 끝나야 들어가므로, 그때까지는 이 창이 **짜 둔 것**을 보여 준다.
 *
 * 그래서 화면에 두 가지가 같이 있어야 한다: 짜 둔 편성과, 그것이 아직 안
 * 들어갔다는 사실. 뒤엣것이 없으면 "바꿨는데 왜 그대로지" 가 된다.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, FREE_ENHANCE, capOf, maxStar } from '@/core/chars';
import { PARTY_SIZE } from '@/core/party';
import { Btn, Row, Stars, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { CharPopup } from './CharPopup';
import { FormationPicker } from './FormationPicker';

/** 자리 하나 — 얼굴 · 이름 · 별 · 레벨 */
function Slot({ id, n, onPress }: {
  id: string | null; n: number; onPress: () => void;
}) {
  const chars = useGame((s) => s.chars);
  const c = id ? chars[id] : null;
  const d = c ? CHARS[c.id] : null;
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          flex: 1,
          paddingVertical: SP.sm,
          paddingHorizontal: 2,
          alignItems: 'center',
          gap: 2,
          opacity: pressed ? 0.6 : 1,
          /* 찬 칸은 한 단 올라오고 빈 칸은 파인다 — 파티 칸과 같은 규칙 */
          backgroundColor: c ? SURF.up : SURF.down,
          borderColor: c ? LINE.mid : LINE.low,
          borderStyle: c ? 'solid' : 'dashed',
        },
      ]}
    >
      {c && d ? (
        <>
          <Sprite set="avatar" name={d.art} size={34} />
          <T size={FS.tiny} bold center numberOfLines={1}>{d.name}</T>
          <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={9} />
          <T size={8} dim="dim">Lv {c.lv} / {capOf(c)}</T>
        </>
      ) : (
        <>
          <View
            style={{
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: R.round,
              borderWidth: 1,
              borderColor: LINE.mid,
            }}
          >
            <T size={15} dim="sub">+</T>
          </View>
          <T size={FS.tiny} dim="dim">{n}번</T>
        </>
      )}
    </Pressable>
  );
}

export function HeroPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  /*
    ── 짜 둔 것을 보여 준다 ──

    아직 안 들어갔어도 여기서는 그것이 지금의 편성이다. 들어간 것(`party`)을
    보여 주면 방금 바꾼 것이 화면에서 사라져서, 눌리기는 했는데 아무 일도
    안 일어난 것처럼 보인다.
  */
  const party = useGame((s) => s.pendingParty ?? s.party);
  const pendingParty = useGame((s) => s.pendingParty);
  const pendingForm = useGame((s) => s.pendingFormation);
  const clearPending = useGame((s) => s.clearPending);
  const stage = useGame((s) => s.battle.stage);
  /* ⚠ 테스트용 — 아래 성 맞추기 단추가 쓴다. 출시 전에 같이 지운다 */
  const chars = useGame((s) => s.chars);
  const setGrowth = useGame((s) => s.setGrowth);
  const toast = useGame((s) => s.toast);

  const [slot, setSlot] = useState<number | null>(null);

  if (!visible) return null;

  /* 짜 두었지만 아직 안 들어간 것이 있나 */
  const waiting = pendingParty !== null || pendingForm !== null;

  return (
    <>
      <Popup visible title="영웅" onClose={onClose}>
        {/*
          ── 언제 들어가나 ──

          이 한 줄이 이 창에서 제일 중요하다. 편성이 미뤄진다는 것을 모르면
          "바꿨는데 왜 그대로지" 가 되고, 그건 고장으로 읽힌다.
        */}
        <View
          style={{
            padding: SP.sm,
            borderRadius: R.md,
            backgroundColor: waiting ? SURF.up : 'transparent',
            borderWidth: waiting ? 1 : 0,
            borderColor: LINE.hi,
          }}
        >
          <T size={FS.body} bold={waiting}>
            {waiting
              ? '다음 판부터 이 편성으로 싸웁니다'
              : '편성을 바꾸면 다음 판부터 들어갑니다'}
          </T>
          <T size={FS.tiny} dim="dim" style={{ marginTop: 2 }}>
            {waiting
              ? `지금 ${stage}판은 바꾸기 전 편성 그대로 싸웁니다.`
              : '판이 도는 중에는 안 바뀝니다 — 판을 어떻게 짤까를 정하는 자리이지, 지금 뭘 누를까를 정하는 자리가 아닙니다.'}
          </T>
          {waiting && (
            <Btn
              label="짜 둔 편성 버리기"
              size="sm"
              style={{ marginTop: SP.xs, alignSelf: 'flex-start' }}
              onPress={() => { sfx('tap'); clearPending(); }}
            />
          )}
        </View>

        <T size={FS.title} bold style={{ marginTop: SP.md, marginBottom: SP.xs }}>
          누가 서나
        </T>
        <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
          {Array.from({ length: PARTY_SIZE }, (_v, i) => (
            <Slot key={i} id={party[i] ?? null} n={i + 1} onPress={() => setSlot(i)} />
          ))}
        </Row>
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
          칸을 누르면 세울 사람을 고르고, 그 사람을 키울 수도 있습니다.
        </T>

        <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.md }} />

        {/* 어떻게 서나 — 대형 (`FormationPicker`) */}
        <FormationPicker />

        {/*
          ── ⚠ 테스트 단추 ── 출시 전에 통째로 지운다 (`FREE_ENHANCE`)

          **가진 사람 전부**의 성을 한 번에 맞춘다. 캐릭터 창에도 같은 것이
          있지만 (`CharPopup`) 거기는 한 명씩이라, 넷을 4성으로 올려 놓고
          트리를 짜 보려면 창을 네 번 열었다 닫아야 한다.

          등급 상한은 지킨다 — 넷 다 영웅이라 4성이 끝이다 (`maxStar`).
          등급이 낮은 사람이 생기면 그 사람만 제 상한에서 멈춘다.
        */}
        {FREE_ENHANCE && (
          <>
            <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.md }} />
            <Row between style={{ marginBottom: SP.xs }}>
              <T size={FS.tiny} bold>TEST · 전원 성 맞추기</T>
              <T size={FS.tiny} dim="dim">레벨 상한도 같이 따라옵니다</T>
            </Row>
            <Row gap={SP.xs}>
              {[1, 2, 3, 4].map((n) => (
                <Btn
                  key={n}
                  label={`${n}성`}
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={() => {
                    for (const c of Object.values(chars)) setGrowth(c.id, { star: n });
                    toast(`전원 ${n}성`, 'plain');
                  }}
                />
              ))}
            </Row>
            <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
              <Btn
                label="전원 Lv 최대"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => {
                  for (const c of Object.values(chars)) setGrowth(c.id, { lv: 999 });
                  toast('전원 레벨 최대', 'plain');
                }}
              />
              <Btn
                label="전원 조각 +48"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => {
                  for (const c of Object.values(chars)) {
                    setGrowth(c.id, { copies: c.copies + 48 });
                  }
                  toast('전원 조각 +48', 'plain');
                }}
              />
            </Row>
          </>
        )}
      </Popup>

      {/* 칸을 누르면 그 위에 겹쳐 열린다 */}
      <CharPopup slot={slot} onClose={() => setSlot(null)} />
    </>
  );
}
