/**
 * ── 아이템 탭 ── 가진 것을 네 갈래로 (`core/bag`).
 *
 * 여태 아래 띠에서 이 칸을 누르면 "준비중" 만 떴다. 그런데 그동안에도 물건은
 * 늘고 있었다 — 경험의 서 세 가지와 강성의 영약. 다만 **볼 자리가 없어서**
 * 레벨업 창을 열거나 각성 단추 옆 숫자를 봐야 알았고, 안 열어 본 물건은 있는
 * 줄도 몰랐다.
 *
 * ## 갈래 넷은 **비어도 남는다**
 *
 * 장비 칸에 아무것도 없다. 지우지 않고 남긴 뒤 그 자리에 까닭을 적는다
 * (`BAG_EMPTY`) — "장비가 없다" 와 "이 게임에 장비라는 것이 없다" 는 다른
 * 말이고, 빈 칸만 있으면 사람은 앞엣것으로 읽는다.
 *
 * ## 여기서 **쓰지는 않는다**
 *
 * 칸을 눌러도 아무 일도 안 일어난다. 대신 오른쪽에 어디서 쓰는지가 적혀
 * 있다 (`BagRow.where`). 여기서도 쓰게 하면 같은 일이 두 자리에 생기고,
 * 그러면 둘 중 한쪽에만 조건이 붙는 날이 온다 — 레벨업 창은 상한을 보고
 * 남는 경험치를 세는데(`LevelUpPopup`) 가방은 그걸 모른다.
 *
 * 가방은 **세는 자리**다.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useGame } from '@/state/store';
import { BAG_EMPTY, BAG_TABS, BagRow, BagTab, bagIn, bagOf } from '@/core/bag';
import { KV, Row, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { SubTabs } from './BottomNav';
import { TopBar } from './TopBar';

/**
 * 물건 한 칸 — **로고 · 이름 · 개수 셋뿐이다.**
 *
 * 한동안 여기에 무엇에 쓰는지와 어디서 쓰는지까지 적었다. 가방을 여는 까닭이
 * 대개 "몇 개 남았지" 하나인데, 그 한 줄을 읽으려고 넉 줄짜리 상자를 지나가야
 * 했고 물건이 늘수록 화면이 그만큼 길어졌다.
 *
 * 자세한 것은 **눌러서 본다** (`BagPopup`). 개수는 훑는 것이고 설명은 한 번
 * 읽으면 되는 것이라, 훑는 자리에 늘 펴 두면 훑는 일이 느려진다.
 */
function BagCard({ row, onPress }: { row: BagRow; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          padding: SP.sm,
          marginBottom: SP.xs,
          backgroundColor: pressed ? SURF.up : 'transparent',
        },
      ]}
    >
      <Row gap={SP.sm}>
        {/* 액자 — 그림이 아직 없어도 "여기 그림이 들어간다" 가 보인다 */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: R.sm,
            borderWidth: 1,
            borderColor: LINE.low,
            backgroundColor: SURF.down,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprite set={row.set} name={row.art} size={26} />
        </View>
        <T size={FS.body} bold numberOfLines={1} style={{ flex: 1 }}>{row.name}</T>
        {/* 개수 — 이 화면에서 사람이 보러 온 것 */}
        <T size={FS.body} bold>{`×${row.n.toLocaleString()}`}</T>
      </Row>
    </Pressable>
  );
}

/**
 * 물건 하나를 열어 본 창.
 *
 * 목록에서 걷어 낸 것들이 여기 있다 — 무엇에 쓰는 물건인지, 어디서 쓰는지.
 * 여기서도 **쓰지는 않는다**: 같은 일이 두 자리에 있으면 둘 중 한쪽에만
 * 조건이 붙는 날이 온다 (머리말).
 */
function BagPopup({ row, onClose }: { row: BagRow | null; onClose: () => void }) {
  if (!row) return null;
  return (
    <Popup visible title={row.name} onClose={onClose}>
      <Row gap={SP.sm} style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: R.sm,
            borderWidth: 1,
            borderColor: LINE.low,
            backgroundColor: SURF.down,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprite set={row.set} name={row.art} size={36} />
        </View>
        <View style={{ flex: 1 }}>
          <T size={FS.hero} bold>{`${row.n.toLocaleString()}개`}</T>
          <T size={FS.tiny} dim="dim">가지고 있는 수</T>
        </View>
      </Row>

      <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.md }} />
      <KV k="무엇인가" v={row.desc} />
      <KV k="쓰는 곳" v={row.where} />
    </Popup>
  );
}

export function ItemScreen() {
  /** 어느 갈래를 보고 있나 — 소비가 먼저다, 지금 실제로 든 것이 거기 있다 */
  const [at, setAt] = useState<BagTab>('use');
  /** 열어 본 물건의 이름표 — `null` 이면 목록만 보인다 */
  const [open, setOpen] = useState<string | null>(null);
  const books = useGame((s) => s.books);
  const elixir = useGame((s) => s.elixir);
  const gifts = useGame((s) => s.gifts);

  const rows = bagOf({ books, elixir, gifts });
  const here = bagIn(rows, at);

  return (
    <>
      {/*
        위 띠는 여기에도 있다 (`HeroScreen` 과 같은 까닭). 지갑은 어느
        화면에서나 보여야 한다 — 가방을 보다 "살 수 있나" 가 바로 옆 질문이다.

        문 여섯은 안 그린다 (`gates`). 이미 들어와 있는 화면이다.
      */}
      <TopBar gates={false} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* 굴려 내려가면 아래 띠가 화면 밖이라, 여기가 어디인지 맨 위에서 한 번 말한다 */}
        <Row between style={{ marginBottom: SP.sm }}>
          <T size={FS.title} bold>아이템</T>
          <T size={FS.tiny} dim="dim">
            {`${BAG_TABS.find((t) => t.id === at)?.label ?? ''} ${here.length}종`}
          </T>
        </Row>

        {here.length === 0 ? (
          /*
            ── 빈 갈래 ── **까닭을 적는다.**

            빈 상자만 두면 "아직 안 만든 화면" 으로 읽힌다. 무엇이 여기
            들어오고 어디서 나오는지를 적어 두면, 비어 있는 것 자체가
            "가서 구해 오라" 는 말이 된다.
          */
          <View
            style={[
              BORDER,
              { padding: SP.lg, alignItems: 'center', backgroundColor: SURF.up },
            ]}
          >
            <T size={FS.body} dim="sub" center>{BAG_EMPTY[at]}</T>
          </View>
        ) : (
          here.map((r) => (
            <BagCard key={r.key} row={r} onPress={() => setOpen(r.key)} />
          ))
        )}
      </ScrollView>

      {/*
        갈래 줄은 굴러가는 몸통 **밖**이다 (`SubTabs`). 가진 것이 늘어나
        목록이 길어져도 갈래는 늘 손가락이 가 있는 자리에 있다.

        칸마다 숫자를 붙였었다 (`소비 2`). 걷은 까닭: 저 줄은 **어디를 볼까**
        를 고르는 자리이지 세는 자리가 아니다. 네 칸이 정확히 같은 폭으로
        서는데 (`SubTabs`) 어떤 칸에만 숫자가 붙으면 글자 길이가 들쭉날쭉해
        지고, 정작 세어야 할 자리는 이미 위에 있다 (`소비 2종`).
      */}
      <SubTabs at={at} tabs={BAG_TABS} onGo={setAt} />

      {/* 눌러서 여는 창 — 무엇에 쓰는지와 어디서 쓰는지 */}
      <BagPopup row={rows.find((r) => r.key === open) ?? null} onClose={() => setOpen(null)} />
    </>
  );
}
