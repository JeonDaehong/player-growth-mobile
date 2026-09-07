/**
 * ── 스킬 트리 ── 이 사람을 어떤 사람으로 키울까.
 *
 * 캐릭터 창에서 연다 (`CharPopup`).
 *
 * ## 위에서 아래로 읽는다
 *
 * 1단계가 맨 위, 4단계가 맨 아래다. 갈래가 나오는 단계는 두 칸이 나란히
 * 서고, 그 사이를 잇는 선이 **어느 쪽에서 왔는지**를 말한다.
 *
 * 가로로 그려 봤다가 되돌렸다. 폰 폭이 360px 이라 4단계를 가로로 늘어놓으면
 * 칸 하나가 80px 이 되는데, 거기에는 이름 네 글자밖에 안 들어간다 — 무엇을
 * 하는 기술인지가 없으면 고를 수가 없다.
 *
 * ## 칸이 말하는 것은 셋이다
 *
 *   **걸려 있다**   밝은 테두리 + 옅은 면. 지금 이 사람이 쓰는 것
 *   **찍을 수 있다** 점선 테두리 + "찍기". 지금 누르면 걸린다
 *   **잠겼다**      흐리고, 왜 잠겼는지 한 줄 (`whyLocked`)
 *
 * 잠긴 칸을 지우지 않는다. 지우면 이 갈래로 가면 무엇이 나오는지가 화면에
 * 없어서, 고르는 일이 "지금 눌리는 것을 누르는 일" 이 된다.
 *
 * ## 누르면 **창이 하나 더 뜬다** (`NodePopup`)
 *
 * 여태 칸을 누르면 그 자리에서 바로 찍혔다. 되돌리기가 공짜라 큰 사고는
 * 아니지만, **무엇을 고르는지 모르고 고르는 것**은 그대로였다 — 칸에 적힌
 * 두 줄이 전부였으니까.
 *
 * 이제 누르면 그 기술이 도는 그림이 뜨고 (`SkillDemo`), 거기서 적용하거나
 * 그만둔다. 찍을 수 없는 칸도 열린다 — **먼저 보고 나서 성을 올릴지 정하는
 * 것**이 이 창의 값이라, 잠긴 칸이야말로 열려야 한다.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId, maxStar, nodeDemo } from '@/core/chars';
import {
  TreeNode, activeNodes, isPick, treeOf, whyLocked,
} from '@/core/skillTree';
import { Btn, Row, Stars, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, BORDER_HI, FS, LINE, O, R, SP, SURF } from '@/ui/theme';
import { SkillPopup } from './SkillPanel';

/** 단계 사이를 잇는 세로 선 — 갈래면 Y 자로 벌어진다 */
function Link({ split }: { split: boolean }) {
  return (
    <View style={{ height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 1, height: 14, backgroundColor: LINE.mid }} />
      {split && (
        /*
          갈래는 가로선 하나로 말한다. 실제 Y 자로 그리려면 대각선이 필요한데,
          1-bit 에서 1px 대각선은 계단으로 뭉개져서 선이 아니라 점선이 된다.
        */
        <View
          style={{
            position: 'absolute',
            left: '25%',
            right: '25%',
            height: 1,
            backgroundColor: LINE.mid,
          }}
        />
      )}
    </View>
  );
}

/** 자리 하나 */
function Node({ n, state, why, onOpen }: {
  n: TreeNode;
  state: 'on' | 'open' | 'off';
  why: string | null;
  onOpen: () => void;
}) {
  const on = state === 'on';
  const open = state === 'open';
  return (
    <Pressable
      /*
        **잠긴 칸도 눌린다.** 누르는 것이 곧 찍는 것이던 때는 못 찍는 칸을
        막아야 했는데, 지금은 누르면 창이 뜰 뿐이다 (`NodePopup`). 못 찍는
        칸일수록 먼저 봐야 하는 칸이다 — 그걸 보고 성을 올릴지 정한다.
      */
      onPress={() => { sfx('tap'); onOpen(); }}
      style={({ pressed }) => [
        on ? BORDER_HI : BORDER,
        {
          flex: 1,
          padding: SP.sm,
          gap: 3,
          borderStyle: open ? 'dashed' : 'solid',
          borderColor: on ? LINE.hi : open ? LINE.mid : LINE.low,
          backgroundColor: on || pressed ? SURF.up : 'transparent',
          opacity: state === 'off' ? O.dim : 1,
        },
      ]}
    >
      <Row gap={SP.xs}>
        <Sprite set="skill_icon" name={n.art} size={20} />
        <View style={{ flex: 1 }}>
          <Row gap={4}>
            <T size={FS.body} bold numberOfLines={1}>{n.name}</T>
            {on && <Tag label="적용" fill />}
          </Row>
          <Row gap={4}>
            <T size={8} dim="dim">{n.kind === 'active' ? '액티브' : '패시브'}</T>
            {/*
              코스트는 **평타 대수**다. 초로 안 적는 이유는 `SkillPanel` 에
              적어 두었다 — 이 게임에 쿨타임이라는 것이 없다.
            */}
            {n.cost !== undefined && <T size={8} dim="dim">· 평타 {n.cost}대</T>}
            {/*
              아직 전투에 안 들어간 자리에는 표를 단다. 트리를 먼저 세우고
              효과를 하나씩 붙이는 중이라, 찍었는데 숫자가 안 변하는 자리가
              생긴다 — 말 안 해 주면 그건 고장으로 읽힌다.
            */}
            {!n.live && <T size={8} dim="dim">· 준비중</T>}
          </Row>
        </View>
      </Row>
      <T size={FS.tiny} dim="sub">{n.desc}</T>
      {open && <T size={FS.tiny} bold>눌러서 보기 · 찍기</T>}
      {state === 'off' && !!why && <T size={FS.tiny} dim="dim">{why}</T>}
    </Pressable>
  );
}

/**
 * ── 칸 하나를 열어 본 창 ── 도는 그림과 적용·취소.
 *
 * ## 왜 그림이 여기 있나
 *
 * 이 그림은 한동안 캐릭터 창의 기술 목록에 붙어 있었다 (`SkillPanel`). 거기는
 * **이미 고른 것의 수치를 읽는 자리**라 그림이 할 일이 없었다 — 무엇처럼
 * 생겼는지를 알아도 고칠 것이 없으니까. 게다가 목록을 펼 때마다 무대가 하나씩
 * 붙어서, 정작 읽으러 온 숫자가 그만큼 아래로 밀렸다.
 *
 * 고르는 자리는 여기다. 그래서 그림도 여기다.
 *
 * ## **찍은 뒤의 기술**을 보여 준다
 *
 * 파쇄의 태세를 눌렀는데 손 안 댄 검기가 돌면 그 자리를 찍을 이유가 화면에
 * 없다. `nodeDemo` 가 "이 줄기를 끝까지 찍은 사람" 을 지어내서 계산한다
 * (`core/chars`).
 *
 * 비앙카의 과열만 그림이 없다. 저건 기술이 아니라 **평타**를 손보는 것이라
 * 무대에 올릴 기술이 없다.
 *
 * ## 적용과 취소
 *
 * 누르는 것이 곧 찍는 것이던 때는 단추가 필요 없었다. 지금은 창이 한 겹
 * 끼었으므로 **나가는 길이 둘**이다 — 찍고 나가거나, 안 찍고 나가거나.
 * 되돌리기가 공짜여도 이 둘은 갈라 두어야 한다: 보러 들어온 사람이 창을
 * 닫았다는 이유로 뭔가 찍혀 있으면 그건 사고다.
 *
 * 못 찍는 칸에서도 단추는 **지우지 않고 흐려 둔다.** 지우면 "이 칸은 원래
 * 찍는 것이 아닌가" 로 읽히는데, 실제로는 성만 올리면 찍는 칸이다. 대신
 * 그 옆에 왜 안 되는지를 적는다.
 */
function NodePopup({ who, n, onClose }: {
  who: CharId;
  n: TreeNode;
  onClose: () => void;
}) {
  const chars = useGame((s) => s.chars);
  const party = useGame((s) => s.party);
  const pickSkill = useGame((s) => s.pickSkill);
  const toast = useGame((s) => s.toast);
  const c = chars[who];
  if (!c) return null;

  const on = activeNodes(who, c.star, c.tree).some((x) => x.id === n.id);
  /*
    갈래가 아닌 자리는 `whyLocked` 가 "저절로 열리는 자리" 를 돌려준다. 그건
    잠긴 것이 아니므로 성만 보고 가른다 — 트리 본문과 같은 규칙이다.
  */
  const why = isPick(n)
    ? whyLocked(who, c.star, c.tree, n.id)
    : (c.star < n.tier ? `${n.tier}성이 되어야 합니다` : null);
  const can = isPick(n) && why === null;
  const sk = nodeDemo(c, n.id);

  /*
    창의 몸통은 **영웅 관리와 같은 것**을 쓴다 (`SkillPanel` 의 `SkillPopup`).
    같은 기술을 두 곳에서 다르게 그리면 언젠가 한쪽만 고쳐진다.

    다른 것은 아래에 붙는 적용·취소 하나다.
  */
  return (
    <SkillPopup
      c={c}
      party={party}
      chars={chars}
      sk={sk}
      slot={0}
      title={n.name}
      onClose={onClose}
      footer={(
        <>
          <Row gap={4} style={{ marginBottom: SP.sm }}>
            <Tag label={n.kind === 'active' ? '액티브' : '패시브'} />
            {on && <Tag label="적용중" fill />}
            {!n.live && <Tag label="준비중" />}
          </Row>
          {/*
            보여 줄 기술이 없는 자리 — 비앙카의 과열 하나다 (`nodeDemo` 가
            `null`). 그때는 창이 통째로 비므로 설명만이라도 적는다.
          */}
          {!sk && (
            <T size={FS.body} dim="sub" style={{ marginBottom: SP.sm }}>{n.desc}</T>
          )}
          {/* 왜 못 찍는지는 단추 **위**에 — 눌러 보고 나서 알면 늦다 */}
          {!can && !on && (
            <T size={FS.tiny} dim="dim" style={{ marginBottom: SP.sm }}>
              {isPick(n) ? (why ?? '') : '갈래가 아니라 성만 되면 저절로 열립니다'}
            </T>
          )}
          <Row gap={SP.xs}>
            <Btn
              label={on ? '적용중' : '적용'}
              fill={can}
              disabled={!can}
              style={{ flex: 1 }}
              onPress={() => {
                const bad = pickSkill(who, n.id);
                if (bad) { toast(bad, 'bad'); return; }
                toast(`${n.name} 을(를) 찍었습니다`, 'good');
                onClose();
              }}
            />
            <Btn label="취소" style={{ flex: 1 }} onPress={onClose} />
          </Row>
        </>
      )}
    />
  );
}

export function SkillTreePopup({ who, onClose }: { who: CharId | null; onClose: () => void }) {
  const chars = useGame((s) => s.chars);
  const resetSkills = useGame((s) => s.resetSkills);
  const toast = useGame((s) => s.toast);
  /** 열어 본 칸 — `null` 이면 트리만 보인다 */
  const [at, setAt] = useState<TreeNode | null>(null);

  if (!who) return null;
  const c = chars[who];
  if (!c) return null;
  const d = CHARS[who];

  const nodes = treeOf(who);
  const live = new Set(activeNodes(who, c.star, c.tree).map((n) => n.id));
  /* 단계별로 묶는다 — 1단계가 맨 위 */
  const tiers = [1, 2, 3, 4].map((t) => nodes.filter((n) => n.tier === t));

  return (
    <Popup visible title={`${d.name} · 스킬 트리`} onClose={onClose}>
      <Row between>
        <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={12} />
        {!!c.tree.length && (
          <Btn
            label="되돌리기"
            size="sm"
            onPress={() => { resetSkills(who); toast('찍은 것을 되돌렸습니다', 'plain'); }}
          />
        )}
      </Row>

      <View style={{ marginTop: SP.sm }}>
        {tiers.map((row, i) => (
          <View key={row[0]?.tier ?? i}>
            {i > 0 && <Link split={row.length > 1} />}
            <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
              {row.map((n) => {
                const why = whyLocked(who, c.star, c.tree, n.id);
                /*
                  갈래가 아닌 자리는 `whyLocked` 가 "저절로 열리는 자리" 를
                  돌려준다. 그건 잠긴 것이 아니므로, 성만 보고 가른다.
                */
                const state = live.has(n.id) ? 'on'
                  : (isPick(n) && why === null) ? 'open'
                    : 'off';
                return (
                  <Node
                    key={n.id}
                    n={n}
                    state={state}
                    why={isPick(n) ? why : (c.star < n.tier ? `${n.tier}성이 되어야 합니다` : null)}
                    onOpen={() => setAt(n)}
                  />
                );
              })}
            </Row>
          </View>
        ))}
      </View>

      {/* 칸을 열어 본 창 — 트리 위에 한 겹 더 뜬다 */}
      {!!at && <NodePopup who={who} n={at} onClose={() => setAt(null)} />}
    </Popup>
  );
}
