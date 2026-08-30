/**
 * 창고 패널 세 벌 — 장비 창고 · 채집물 창고 · 번스타인 재료.
 *
 * 원래는 마을 뒷동산의 **집**(`screens/town/HouseScreen`)에 있었다. 집을 없애면서
 * 홈으로 옮겼다. 이유는 하나다 — 창고를 보러 가는 길이 너무 멀었다.
 *
 *   홈 → 지도 탭 → 언덕길까지 스크롤 → 집 → 창고
 *
 * 강화하다가 "창고에 더 좋은 무기 있었나?" 를 확인하려면 매번 이 길을 왕복해야
 * 했고, 그래서 아무도 창고를 안 봤다. 짐은 **장비를 만지는 자리 바로 아래**에
 * 있어야 한다.
 *
 * 화면이 아니라 `ui/` 에 두는 건 홈 화면 파일이 이미 1000줄에 가깝기 때문이다.
 * 셋 다 스토어만 읽고 부모에게 아무것도 요구하지 않으므로 어디에 붙여도 된다.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { KIND_NAME, fmtIlvl, itemLevel, itemName, useGame } from '@/state/store';
import { sellPrice } from '@/core/economy';
import { fmt, fmtShort } from '@/core/currency';
import {
  ACTIVITY_DEFS, FAMILY_GLYPH, YIELD_PRICE, bagCount, bagRows, speciesArt,
} from '@/core/gathering';
import { MATERIALS, MATERIAL_IDS } from '@/core/artisans';
import { Sprite } from './Sprite';
import { ICONS } from './sprites';
import { Btn, KV, ListItem, Panel, Row, Sep, T, Tag } from './atoms';
import { BORDER, SP } from './theme';
import { Popup } from './Popup';
import { equipArt } from './equipArt';

/**
 * 장비 창고.
 *
 * 착용은 여기가 아니라 **장비 칸**에서 한다 (빈 칸을 누르면 낄 수 있는 것이 뜬다).
 * 두 군데서 다 되게 하면 어느 쪽이 정본인지 흐려지고, 무엇보다 "어느 칸에 넣을까"
 * 를 여기서 또 묻게 된다 — 칸에서 시작하면 그 질문 자체가 없다.
 */
export function GearStorage() {
  const inventory = useGame((s) => s.inventory);
  const [open, setOpen] = useState<string | null>(null);
  const picked = inventory.find((i) => i.id === open) ?? null;
  const total = inventory.reduce((a, it) => a + sellPrice(it), 0);

  return (
    <Panel
      title={`창고 (${inventory.length}개)`}
      right={inventory.length ? <Tag label={`전부 팔면 ${fmtShort(total)}`} /> : undefined}
    >
      {!inventory.length ? (
        <T size={12} dim="sub">보관 중인 장비가 없습니다. 상점에서 사거나 탐험에서 얻습니다.</T>
      ) : (
        inventory.map((it) => (
          <ListItem
            key={it.id}
            left={<Sprite {...equipArt(it.kind, it.tier)} size={26} />}
            title={itemName(it, KIND_NAME)}
            sub={`아이템레벨 ${fmtIlvl(itemLevel(it))} · 내구 ${it.dur}% · 판매가 ${fmtShort(sellPrice(it))}`}
            onPress={() => setOpen(it.id)}
          />
        ))
      )}

      <Popup
        visible={!!picked}
        title={picked ? itemName(picked, KIND_NAME) : ''}
        onClose={() => setOpen(null)}
      >
        {!!picked && (
          <>
            <Row gap={SP.md}>
              <View style={[BORDER, { padding: SP.sm }]}>
                <Sprite {...equipArt(picked.kind, picked.tier)} size={48} />
              </View>
              <View style={{ flex: 1 }}>
                <T size={15} bold>{itemName(picked, KIND_NAME)}</T>
                <T size={11} dim="sub">
                  티어 {picked.tier === 11 ? '★ 장인' : picked.tier} · +{picked.level}
                </T>
              </View>
            </Row>
            <Sep />
            <KV k="아이템레벨" v={fmtIlvl(itemLevel(picked))} />
            <KV k="내구도" v={`${picked.dur}%`} />
            <KV k="판매가" v={fmt(sellPrice(picked))} dim />
            <Sep />
            <T size={10} dim="dim">
              착용은 위의 장비 칸에서 합니다 — 빈 칸을 누르면 낄 수 있는 것이 뜹니다.
              파는 것은 마을 &gt; 상점에서 합니다.
            </T>
            <Btn label="확인" size="lg" fill style={{ marginTop: SP.md }} onPress={() => setOpen(null)} />
          </>
        )}
      </Popup>
    </Panel>
  );
}

/**
 * 채집물 창고.
 *
 * 잡은 건 여기서 확인하고, 파는 건 상점에서 한다 —
 * 어디서든 바로 팔 수 있으면 마을에 갈 이유가 없어진다.
 */
export function GatherStorage() {
  const bag = useGame((s) => s.gatherBag);
  const rows = bagRows(bag);
  const count = bagCount(bag);
  /** 누른 종 — 값·쓰임새는 여기서만 보여 준다 (목록은 이름과 수량만) */
  const [open, setOpen] = useState<string | null>(null);
  const shown = rows.find((r) => r.species.id === open) ?? null;

  return (
    <Panel title={`채집물 창고 (${count}개)`}>
      {!rows.length ? (
        <T size={12} dim="sub">모아 둔 것이 없습니다. 채집터 · 수렵터 · 호숫가에서 잡아 오세요.</T>
      ) : (
        rows.map(({ species: sp, n }) => (
          <Pressable key={sp.id} onPress={() => setOpen(sp.id)}>
            <Row between gap={SP.sm} style={{ paddingVertical: 4 }}>
              <Sprite {...speciesArt(sp)} size={20} fallback={ICONS[FAMILY_GLYPH[sp.family]]} />
              <View style={{ flex: 1 }}>
                <T size={11}>{sp.name} × {n}</T>
                <T size={9} dim="dim">{ACTIVITY_DEFS[sp.activity].name} · {sp.grade}급</T>
              </View>
            </Row>
          </Pressable>
        ))
      )}

      <Popup
        visible={!!shown}
        title={shown ? shown.species.name : ''}
        onClose={() => setOpen(null)}
      >
        {!!shown && (
          <>
            <Row gap={SP.md}>
              <View style={[BORDER, { padding: SP.sm }]}>
                <Sprite
                  {...speciesArt(shown.species)}
                  size={48}
                  fallback={ICONS[FAMILY_GLYPH[shown.species.family]]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <T size={15} bold>{shown.species.name}</T>
                <T size={11} dim="sub">
                  {ACTIVITY_DEFS[shown.species.activity].name} · {shown.species.grade}급
                </T>
              </View>
            </Row>
            <Sep />
            <KV k="보유" v={`${shown.n}개`} />
            <KV k="개당 값" v={fmt(YIELD_PRICE[shown.species.grade])} />
            <KV k="전부 팔면" v={fmt(YIELD_PRICE[shown.species.grade] * shown.n)} />
            <Btn
              label="확인"
              size="lg"
              fill
              style={{ marginTop: SP.md }}
              onPress={() => setOpen(null)}
            />
          </>
        )}
      </Popup>
    </Panel>
  );
}

/** 번스타인 재료 보관함 — 제련에 몇 개가 모였는지 홈에서도 세어 볼 수 있게 */
export function MaterialStorage() {
  const materials = useGame((s) => s.materials);
  const total = MATERIAL_IDS.reduce((n, m) => n + (materials[m] ?? 0), 0);

  return (
    <Panel title={`번스타인 재료 (${total}개)`}>
      {!total ? (
        <T size={12} dim="sub">모아 둔 것이 없습니다. 보스의탑 50층에서 나옵니다.</T>
      ) : (
        MATERIAL_IDS.map((m) => (
          <Row key={m} between gap={SP.sm} style={{ paddingVertical: 3 }}>
            <Sprite set="material" name={m} size={20} fallback={ICONS[MATERIALS[m].glyph]} />
            <View style={{ flex: 1 }}>
              <T size={11}>{MATERIALS[m].name}</T>
              <T size={9} dim="dim">{MATERIALS[m].forKind} 제련용</T>
            </View>
            <T size={12} bold>{materials[m] ?? 0}</T>
          </Row>
        ))
      )}
    </Panel>
  );
}
