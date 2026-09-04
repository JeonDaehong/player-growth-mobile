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
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId, maxStar } from '@/core/chars';
import {
  TreeNode, activeNodes, isPick, treeOf, whyLocked,
} from '@/core/skillTree';
import { Btn, Row, Stars, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { BORDER, BORDER_HI, FS, LINE, O, R, SP, SURF } from '@/ui/theme';

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
function Node({ n, state, why, onPick }: {
  n: TreeNode;
  state: 'on' | 'open' | 'off';
  why: string | null;
  onPick: () => void;
}) {
  const on = state === 'on';
  const open = state === 'open';
  return (
    <Pressable
      disabled={!open}
      onPress={() => { sfx('tap'); onPick(); }}
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
      {open && <T size={FS.tiny} bold>눌러서 찍기</T>}
      {state === 'off' && !!why && <T size={FS.tiny} dim="dim">{why}</T>}
    </Pressable>
  );
}

export function SkillTreePopup({ who, onClose }: { who: CharId | null; onClose: () => void }) {
  const chars = useGame((s) => s.chars);
  const pickSkill = useGame((s) => s.pickSkill);
  const resetSkills = useGame((s) => s.resetSkills);
  const toast = useGame((s) => s.toast);

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
        <Row gap={SP.xs}>
          <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={12} />
          <T size={FS.tiny} dim="dim">{c.star}성 — {c.star}단계까지 열립니다</T>
        </Row>
        {!!c.tree.length && (
          <Btn
            label="되돌리기"
            size="sm"
            onPress={() => { resetSkills(who); toast('찍은 것을 되돌렸습니다', 'plain'); }}
          />
        )}
      </Row>

      <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
        갈래는 한쪽만 찍을 수 있고, 찍으면 그 줄기의 다음 단계만 열립니다.
        되돌리기는 공짜입니다.
      </T>

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
                    onPick={() => {
                      const bad = pickSkill(who, n.id);
                      if (bad) toast(bad, 'bad');
                      else toast(`${n.name} 을(를) 찍었습니다`, 'good');
                    }}
                  />
                );
              })}
            </Row>
          </View>
        ))}
      </View>

      <T size={FS.tiny} dim="dim" style={{ marginTop: SP.md }}>
        스물네 자리가 전부 전투에 들어가 있습니다. 찍으면 그 자리에서 수치가
        바뀌고, 되돌리기는 공짜입니다.
      </T>
    </Popup>
  );
}
