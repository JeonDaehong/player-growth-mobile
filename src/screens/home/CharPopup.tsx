/**
 * 파티 칸을 누르면 열리는 창 — 두 가지를 한 자리에서 한다.
 *
 *   · 누구를 세울지 고른다 (가지고 있는 캐릭터 목록)
 *   · 서 있는 캐릭터의 고유장비를 강화한다
 *
 * 둘을 나누지 않은 이유가 있다. 파티 칸을 눌렀을 때 하고 싶은 일은 "이 자리를
 * 어떻게 할까" 하나고, 그 답이 사람을 바꾸는 것일 수도 키우는 것일 수도 있다.
 * 창을 둘로 나누면 누를 때마다 어느 창을 열지 먼저 정해 줘야 한다.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/state/store';
import {
  BATTLE_TYPE_ART, BATTLE_TYPE_NAME, CHARS, CharId, DMG_NAME, MAX_GEAR_LV,
  anyPierce, battleTypeOf, blowOf, charPower, gearCost, gearOdds, statOf,
} from '@/core/chars';
import { fmt } from '@/core/currency';
import { Bar, Btn, KV, ListItem, Row, Sep, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { Money } from '@/ui/Money';
import { BORDER, SP } from '@/ui/theme';
import { SkillPanel } from './SkillPanel';

export function CharPopup({
  slot, onClose,
}: { slot: number | null; onClose: () => void }) {
  const party = useGame((s) => s.party);
  const chars = useGame((s) => s.chars);
  const money = useGame((s) => s.money);
  const setPartySlot = useGame((s) => s.setPartySlot);
  const enhanceGear = useGame((s) => s.enhanceGear);
  const toast = useGame((s) => s.toast);

  /** 방금 두들긴 결과 — 창을 닫으면 사라진다 */
  const [last, setLast] = useState<'up' | 'fail' | null>(null);

  if (slot === null) return null;

  const id = party[slot] ?? null;
  const c = id ? chars[id] : null;
  const d = c ? CHARS[c.id] : null;

  const owned = Object.values(chars);
  const cost = c ? gearCost(c.gearLv) : 0;
  const maxed = !!c && c.gearLv >= MAX_GEAR_LV;
  const canPay = !!c && money >= cost && !maxed;

  const run = () => {
    if (!c) return;
    const r = enhanceGear(c.id);
    if (r === 'poor') { toast('골드가 부족합니다', 'bad'); return; }
    if (r === 'max') { toast('더 올릴 수 없습니다', 'plain'); return; }
    if (r === 'up' || r === 'fail') {
      setLast(r);
      void Haptics.impactAsync(
        r === 'up' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
    }
  };

  const close = () => { setLast(null); onClose(); };

  return (
    <Popup
      visible
      title={`${slot + 1}번 자리`}
      onClose={close}
      right={<Money amount={money} size={11} />}
    >
      {c && d ? (
        <>
          <Row gap={SP.md}>
            <Sprite set="avatar" name={d.art} size={52} />
            <View style={{ flex: 1 }}>
              {!!d.title && <T size={9} dim="dim">{d.title}</T>}
              <Row gap={SP.xs}>
                <T size={15} bold>{d.name}</T>
                <Tag label={d.grade} fill={d.grade === 'S'} />
                {/* 전투 타입 — 아이콘과 이름을 붙여서 한 덩어리로 */}
                <Row gap={3} style={{ alignItems: 'center' }}>
                  <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={11} />
                  <Tag label={BATTLE_TYPE_NAME[battleTypeOf(c.id)]} />
                </Row>
              </Row>
              <T size={10} dim="sub">강화 +{c.gearLv} / {MAX_GEAR_LV}</T>
              <T size={10} dim="dim">전투력 {charPower(c).toLocaleString()}</T>
            </View>
          </Row>

          <Sep />

          {/*
            스킬 — **강화보다 먼저 온다.**

            강화는 "얼마나 세게" 고, 스킬은 "무엇을 하는가" 다. 자리에 누구를
            세울지 고르는 창이므로 먼저 알아야 하는 쪽은 뒤엣것이다 — 궁수와
            사제 중 누구를 넣을지는 공격력 숫자로 안 갈린다.
          */}
          <SkillPanel c={c} party={party} chars={chars} />

          <Sep />

          {/*
            강화 진행 — 이 사람에 대해 **자라는 것은 이것 하나**다.

            예전에는 여기에 경험치 막대가 있었다. 전투가 알아서 채우는 값이라
            보고만 있을 뿐 할 수 있는 게 없었고, 그 옆에서 강화만이 실제 선택
            이었다. 레벨을 없애면서 막대도 강화 쪽으로 옮겼다.
          */}
          <Row between style={{ marginTop: SP.sm }}>
            <T size={9} dim="sub">고유장비 강화</T>
            <T size={9} dim="dim">+{c.gearLv} / {MAX_GEAR_LV}</T>
          </Row>
          <Bar value={c.gearLv} max={MAX_GEAR_LV} blocks={20} height={5} />

          <Sep />

          {/* ── 고유장비 ── */}
          <Row between>
            <T size={12} bold>{d.gear}</T>
            <T size={16} bold>+{c.gearLv}</T>
          </Row>
          {!!d.gearNote && <T size={10} dim="sub">{d.gearNote}</T>}
          <T size={9} dim="dim">
            떼어 낼 수 없는 고유장비입니다. 실패해도 부서지거나 내려가지 않습니다.
          </T>

          <View style={{ marginTop: SP.xs }}>
            <Bar value={c.gearLv} max={MAX_GEAR_LV} blocks={20} height={6} />
          </View>

          {last && (
            <View style={[BORDER, { padding: SP.xs, marginTop: SP.sm }]}>
              <T size={12} bold center>
                {last === 'up' ? `강화 성공! +${c.gearLv}` : '실패 — 그대로입니다'}
              </T>
            </View>
          )}

          <Sep />
          {/*
            ── 수치 ──

            방어력과 마법저항력을 **나란히** 놓는다. 둘은 같은 뺄셈이고 막는
            것만 다른데(`core/chars` 의 `Armor`), 떨어뜨려 놓으면 그 대칭이
            안 보여서 마법저항력이 무슨 값인지 따로 배워야 한다.

            평타 옆에 종류를 붙이는 것도 같은 이유다 — "공격력 15" 만 있으면
            그게 어느 쪽 방어에 막히는지 알 길이 없다.
          */}
          <KV k="공격력" v={`${statOf(c).atk} (${DMG_NAME[blowOf(c.id).type]} 피해)`} />
          <KV k="체력" v={String(statOf(c).hp)} />
          <KV k="방어력" v={`${statOf(c).def} (물리 피해를 막는다)`} />
          <KV k="마법저항력" v={`${statOf(c).res} (마법 피해를 막는다)`} />
          {(() => {
            /* 관통은 **가진 사람에게만** 뜬다 — 0 짜리 줄이 넷에게 다 붙으면 잡음이다 */
            const p = anyPierce(c.id);
            const on: string[] = [];
            if (p.phys) on.push('물리관통');
            if (p.magic) on.push('마법관통');
            return on.length ? <KV k="관통" v={on.join(' · ')} /> : null;
          })()}
          <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
            방어력은 물리 피해를, 마법저항력은 마법 피해를 그 수만큼 깎습니다
            (비율이 아니라 뺄셈이고, 아무리 깎여도 최소 1은 들어갑니다).
            관통이 있으면 그 방어를 통째로 무시합니다.
          </T>
          {!maxed && <KV k="성공 확률" v={`${Math.round(gearOdds(c.gearLv) * 100)}%`} dim />}
          {!maxed && <KV k="강화 비용" v={fmt(cost)} warn={money < cost} />}

          <Btn
            label={maxed ? '최대 강화' : '강화하기'}
            sub={maxed ? undefined : fmt(cost)}
            size="lg"
            fill={canPay}
            disabled={!canPay}
            style={{ marginTop: SP.md }}
            onPress={run}
          />

          <Btn
            label="이 자리 비우기"
            size="sm"
            style={{ marginTop: SP.xs }}
            onPress={() => { setPartySlot(slot, null); setLast(null); }}
          />
        </>
      ) : (
        <T size={11} dim="sub">빈 자리입니다. 세울 캐릭터를 고르세요.</T>
      )}

      <Sep />
      <T size={11} bold style={{ marginBottom: SP.xs }}>
        {c ? '다른 캐릭터로 바꾸기' : '세울 캐릭터'}
      </T>
      {owned.length === 0 && (
        <T size={10} dim="dim">가진 캐릭터가 없습니다.</T>
      )}
      {owned.map((o) => {
        const od = CHARS[o.id];
        /* 다른 자리에 서 있으면 알려 준다 — 고르면 자리를 맞바꾼다 */
        const at = party.indexOf(o.id);
        const here = at === slot;
        return (
          <ListItem
            key={o.id}
            title={od.name}
            sub={`+${o.gearLv} · ${BATTLE_TYPE_NAME[battleTypeOf(o.id)]} · 전투력 ${charPower(o).toLocaleString()}`}
            left={<Sprite set="avatar" name={od.art} size={26} />}
            right={
              here ? <Tag label="이 자리" fill />
                : at >= 0 ? <Tag label={`${at + 1}번과 교체`} />
                  : <Tag label={od.grade} />
            }
            disabled={here}
            onPress={() => setPartySlot(slot, o.id as CharId)}
          />
        );
      })}
    </Popup>
  );
}
