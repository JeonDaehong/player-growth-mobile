/**
 * ── 레벨업 창 ── 경험의 서를 **원하는 만큼** 붓는다.
 *
 * 여태 레벨은 단추를 눌러 한 칸씩 올렸다. 1에서 100까지 아흔아홉 번을 눌러야
 * 했고, 그건 고르는 일이 아니라 **노동**이다 — 누를 때마다 정하는 것이 아무것도
 * 없으니까.
 *
 * 이 창에서는 세 가지 책을 몇 권씩 넣을지 정한다 (`core/exp` 의 `BOOKS`).
 * 넣는 동안 **결과가 위에서 계속 바뀐다** — 지금 넣은 것으로 몇 레벨이 되는지,
 * 골드가 얼마나 드는지. 넣고 나서 알면 늦다.
 *
 * ## 셋을 나란히 두는 까닭
 *
 * 값이 10배씩 벌어진다 (120 · 1,200 · 12,000). 나란히 놓고 수를 올려 보면
 * 그 차이가 화면에서 바로 읽힌다 — 표를 읽는 것이 아니라 **결과가 움직이는
 * 것**으로 안다.
 *
 * ## `가득` 을 두는 까닭
 *
 * 상한까지 딱 채우는 수를 대신 세어 준다. 없으면 사람이 남은 경험치를 책 값으로
 * 나눠 봐야 하는데, 그건 이 화면이 시킬 일이 아니다. 비싼 것부터 채우고 남는
 * 것을 싼 것으로 메운다 — 사람이 손으로 넣을 때도 그 순서로 넣는다.
 */
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId, FREE_ENHANCE, capOf } from '@/core/chars';
import {
  BOOKS, BOOK_IDS, BookId, expOf, expToCap, feed, goldFor, lvExp,
} from '@/core/exp';
import { fmt } from '@/core/currency';
import { Bar, Btn, KV, Row, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, O, SP, SURF } from '@/ui/theme';

/** 넣을 권수 — 세 가지 */
type Bag = Record<BookId, number>;

const EMPTY: Bag = { old: 0, fine: 0, prime: 0 };

/**
 * 책 한 종류의 줄 — 이름 · 가진 수 · 넣을 수 · 늘리고 줄이는 단추.
 *
 * 단추가 넷이다 (`-10 · - · + · +10`). 열 칸짜리를 같이 두는 까닭: 낡은 것은
 * 한 레벨에 여러 권이 드는 물건이라, 하나씩만 누르게 하면 스무 번을 누른다 —
 * 위에서 없앤 그 노동이 이 창 안에서 되살아난다.
 */
function BookRow({ id, have, n, onSet }: {
  id: BookId; have: number; n: number; onSet: (v: number) => void;
}) {
  const d = BOOKS[id];
  const step = (by: number) => {
    sfx('tap');
    onSet(Math.max(0, Math.min(have, n + by)));
  };
  return (
    <View style={[BORDER, { padding: SP.sm, marginBottom: SP.xs, backgroundColor: SURF.up }]}>
      <Row between>
        <Row gap={SP.xs} style={{ flex: 1 }}>
          {/* 그림이 아직 없으면 빈 자리로 남는다 — 오는 날 저절로 붙는다 */}
          <Sprite set="item_icon" name={d.art} size={16} />
          <View style={{ flex: 1 }}>
            <T size={FS.body} bold numberOfLines={1}>{d.name}</T>
            <T size={FS.tiny} dim="dim">
              {`한 권 ${d.exp.toLocaleString()} · 가진 것 ${have.toLocaleString()}`}
            </T>
          </View>
        </Row>
        {/* 지금 넣은 수 — 제일 크게. 이 창에서 사람이 움직이는 값이다 */}
        <T size={FS.hero} bold>{n.toLocaleString()}</T>
      </Row>
      <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
        <Btn label="-10" size="sm" style={{ flex: 1 }} disabled={n <= 0} onPress={() => step(-10)} />
        <Btn label="-" size="sm" style={{ flex: 1 }} disabled={n <= 0} onPress={() => step(-1)} />
        <Btn label="+" size="sm" style={{ flex: 1 }} disabled={n >= have} onPress={() => step(1)} />
        <Btn label="+10" size="sm" style={{ flex: 1 }} disabled={n >= have} onPress={() => step(10)} />
      </Row>
    </View>
  );
}

export function LevelUpPopup({ who, onClose }: { who: CharId | null; onClose: () => void }) {
  const chars = useGame((s) => s.chars);
  const money = useGame((s) => s.money);
  const books = useGame((s) => s.books);
  const feedBooks = useGame((s) => s.feedBooks);
  const resetLv = useGame((s) => s.resetLv);
  const toast = useGame((s) => s.toast);
  const [bag, setBag] = useState<Bag>(EMPTY);

  const c = who ? chars[who] : null;

  /*
    넣은 것으로 어떻게 되나 — **매번 다시 센다.**

    계산 자체가 `core/exp` 에 있으므로 (`feed`), 여기서 미리 보는 값과 실제로
    들어가는 값이 같은 함수에서 나온다. 두 곳에서 따로 세면 창에 적힌 레벨과
    실제 레벨이 갈릴 수 있는데, 그건 화면이 스스로 거짓말하는 것이다.
  */
  const plan = useMemo(() => {
    if (!c) return null;
    const cap = capOf(c);
    const add = expOf(bag);
    return {
      cap,
      add,
      gold: FREE_ENHANCE ? 0 : goldFor(add),
      got: feed(c.lv, c.exp, add, cap),
      /* 지금 레벨의 한 칸에 드는 값 — 아래 막대가 이걸 100 으로 친다 */
      need: lvExp(c.lv),
      left: expToCap(c.lv, c.exp, cap),
    };
  }, [c, bag]);

  if (!who || !c || !plan) return null;
  const d = CHARS[who];
  const capped = c.lv >= plan.cap;

  /* 상한까지 딱 채우는 권수 — 비싼 것부터 채우고 남는 것을 싼 것으로 메운다 */
  const fill = () => {
    sfx('tap');
    let want = plan.left;
    const out: Bag = { ...EMPTY };
    for (const id of [...BOOK_IDS].reverse()) {
      if (want <= 0) break;
      const n = Math.min(books[id] ?? 0, Math.ceil(want / BOOKS[id].exp));
      out[id] = n;
      want -= n * BOOKS[id].exp;
    }
    setBag(out);
  };

  const pour = () => {
    const r = feedBooks(who, bag);
    if (r === 'poor') { toast('골드나 책이 모자랍니다', 'bad'); return; }
    if (r === 'max') { toast('지금 성의 상한입니다', 'plain'); return; }
    if (r === 'none') { toast('넣을 책을 고르세요', 'plain'); return; }
    toast(
      plan.got.up > 0 ? `Lv ${c.lv} → ${plan.got.lv}` : '경험치를 쌓았습니다',
      'good',
    );
    setBag(EMPTY);
  };

  return (
    <Popup visible title={`${d.name} · 레벨업`} onClose={onClose}>
      {/*
        ── 지금과 그 뒤 ── 창의 맨 위.

        넣는 칸보다 **먼저** 온다. 아래에서 수를 올릴 때마다 여기가 바뀌는
        것을 보게 하려는 것이라, 순서가 뒤집히면 결과가 화면 밖에서 바뀐다.
      */}
      <View style={[BORDER, { padding: SP.sm, backgroundColor: SURF.up }]}>
        <Row between>
          <Row gap={SP.xs} style={{ alignItems: 'baseline' }}>
            <T size={FS.hero} bold>{`Lv ${c.lv}`}</T>
            <T size={FS.tiny} dim="dim">{`/ ${plan.cap}`}</T>
          </Row>
          {plan.got.up > 0 && (
            <Row gap={SP.xs} style={{ alignItems: 'baseline' }}>
              <T size={FS.tiny} dim="dim">→</T>
              <T size={FS.hero} bold>{`Lv ${plan.got.lv}`}</T>
            </Row>
          )}
        </Row>
        {/* 다음 한 칸까지 얼마나 찼나 */}
        <View style={{ marginTop: SP.xs }}>
          <Bar value={capped ? 1 : c.exp} max={capped ? 1 : plan.need} blocks={24} />
        </View>
        <T size={FS.tiny} dim="dim" style={{ marginTop: 2 }}>
          {capped
            ? '지금 성의 상한입니다. 승급하면 더 올릴 수 있습니다.'
            : `${c.exp.toLocaleString()} / ${plan.need.toLocaleString()}`
              + ` · 상한까지 ${plan.left.toLocaleString()}`}
        </T>
      </View>

      <Row between style={{ marginTop: SP.md, marginBottom: SP.xs }}>
        <T size={FS.title} bold>경험의 서</T>
        <Btn label="가득" size="sm" disabled={capped || plan.left <= 0} onPress={fill} />
      </Row>

      {BOOK_IDS.map((id) => (
        <BookRow
          key={id}
          id={id}
          have={books[id] ?? 0}
          n={bag[id]}
          onSet={(v) => setBag((b) => ({ ...b, [id]: v }))}
        />
      ))}

      <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: SP.sm }} />

      <KV k="넣는 경험치" v={plan.add.toLocaleString()} />
      <KV
        k="드는 골드"
        v={`${fmt(plan.gold)}${FREE_ENHANCE ? ' (시험 중이라 공짜)' : ''}`}
      />
      {/* 모자란 것은 단추 위에 적는다 — 눌러 보고 나서 알면 늦다 */}
      {!FREE_ENHANCE && plan.gold > money && (
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
          {`골드가 ${fmt(plan.gold - money)} 모자랍니다.`}
        </T>
      )}

      <Btn
        label="넣기"
        fill
        disabled={capped || plan.add <= 0 || (!FREE_ENHANCE && plan.gold > money)}
        style={{ marginTop: SP.md }}
        onPress={pour}
      />

      {/*
        ── 시험용 ── 레벨을 1 로 되돌린다.

        **다른 것들과 떨어뜨려 둔다.** 값을 되돌리는 것이 아니라 낮은 레벨의
        화면을 다시 보려는 것이라, 위 단추들과 나란히 두면 게임의 일부로
        읽힌다. 쓴 책도 골드도 안 돌아온다.
      */}
      {FREE_ENHANCE && (
        <View style={{ marginTop: SP.xl }}>
          <T size={FS.tiny} dim="dim" style={{ marginBottom: SP.xs }}>
            아래는 시험용입니다. 쓴 책과 골드는 안 돌아옵니다.
          </T>
          <Btn
            label="레벨 초기화 (Lv 1)"
            size="sm"
            style={{ opacity: O.sub }}
            onPress={() => {
              resetLv(who);
              setBag(EMPTY);
              toast('레벨을 1 로 되돌렸습니다', 'plain');
            }}
          />
        </View>
      )}
    </Popup>
  );
}
