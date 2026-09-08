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
import { ScrollView, View } from 'react-native';
import { useGame } from '@/state/store';
import { BAG_EMPTY, BAG_TABS, BagTab, bagCounts, bagIn, bagOf } from '@/core/bag';
import { Row, T } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { SubTabs } from './BottomNav';
import { TopBar } from './TopBar';

/**
 * 물건 한 칸.
 *
 * **개수가 제일 크다.** 이 화면에서 사람이 보러 온 것이 그것이다 — 무엇이
 * 있는지는 그림과 이름으로 이미 알고, 알고 싶은 것은 "몇 개 남았나" 다.
 *
 * 그림은 액자에 넣는다. 아직 안 온 그림이 있어서 (`item_icon/book_*`) 액자가
 * 없으면 그 칸만 왼쪽이 텅 비어 보이는데, 액자가 있으면 "여기 그림이
 * 들어간다" 가 읽힌다 — `SkCard` 와 같은 규칙이다.
 */
function BagCard({ set, art, name, desc, n, where }: {
  set: string;
  art: string;
  name: string;
  desc: string;
  n: number;
  where: string;
}) {
  return (
    <View style={[BORDER, { padding: SP.sm, marginBottom: SP.xs, backgroundColor: SURF.up }]}>
      <Row gap={SP.sm}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: R.sm,
            borderWidth: 1,
            borderColor: LINE.low,
            backgroundColor: SURF.down,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprite set={set} name={art} size={28} />
        </View>
        <View style={{ flex: 1 }}>
          <T size={FS.body} bold numberOfLines={1}>{name}</T>
          <T size={FS.tiny} dim="dim" numberOfLines={2}>{desc}</T>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <T size={FS.hero} bold>{n.toLocaleString()}</T>
          <T size={9} dim="dim">개</T>
        </View>
      </Row>
      {/* 쓰는 자리 — 여기서 쓰지 않는 대신 어디로 가면 되는지를 적는다 */}
      <Row between style={{ marginTop: SP.xs }}>
        <T size={9} dim="dim">쓰는 곳</T>
        <T size={9} dim="sub">{where}</T>
      </Row>
    </View>
  );
}

export function ItemScreen() {
  /** 어느 갈래를 보고 있나 — 소비가 먼저다, 지금 실제로 든 것이 거기 있다 */
  const [at, setAt] = useState<BagTab>('use');
  const books = useGame((s) => s.books);
  const elixir = useGame((s) => s.elixir);

  const rows = bagOf({ books, elixir });
  const here = bagIn(rows, at);
  const n = bagCounts(rows);

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
            <BagCard
              key={r.key}
              set={r.set}
              art={r.art}
              name={r.name}
              desc={r.desc}
              n={r.n}
              where={r.where}
            />
          ))
        )}
      </ScrollView>

      {/*
        갈래 줄은 굴러가는 몸통 **밖**이다 (`SubTabs`). 가진 것이 늘어나
        목록이 길어져도 갈래는 늘 손가락이 가 있는 자리에 있다.

        칸마다 숫자를 붙인다 — 어느 갈래에 무엇이 있는지 눌러 보지 않고
        알 수 있어야, 빈 갈래를 눌러 보는 일이 안 생긴다.
      */}
      <SubTabs
        at={at}
        tabs={BAG_TABS.map((t) => ({
          id: t.id,
          label: n[t.id] > 0 ? `${t.label} ${n[t.id]}` : t.label,
        }))}
        onGo={setAt}
      />
    </>
  );
}
