/**
 * ── 영웅 관리 ── 한 사람을 세워 놓고 들여다보고 키운다.
 *
 * 영웅 탭의 첫 갈래다 (`HeroScreen` 의 `sub`).
 *
 * ## 창이 아니라 화면인 이유
 *
 * 이 내용이 여태 **파티 칸을 눌러야 열리는 창**에만 있었다 (`CharPopup`).
 * 그러면 캐릭터를 키우는 길이 "무대 → 파티 칸 → 그 사람" 하나뿐이고, 지금
 * 파티에 안 세운 사람은 **키울 방법이 아예 없다.**
 *
 * 여기서는 가진 사람을 좌우로 넘겨 가며 본다. 파티에 서 있든 아니든 같다.
 *
 * ## 무엇이 한 화면에 있나
 *
 *   누구인가   얼굴 · 이름 · 등급 · 전투 타입 · 별 · 레벨 · 전투력
 *   무엇을 쓰나 패시브와 액티브 (`SkillPanel`)
 *   지금 얼마나 여덟 줄 (`CharStats`)
 *   어떻게 키우나 레벨 · 합성 · 각성 · 스킬 트리
 *
 * 셋 다 **같은 부품**을 쓴다 (`CharStats` · `SkillPanel`). 창과 화면이 각자
 * 그리면 한쪽만 고쳐지고, 그때부터 같은 사람의 공격력이 자리마다 다르게 뜬다.
 *
 * ## 코스튬과 인연
 *
 * 아직 화면이 없다 (`ui/SoonPopup`). 자리를 미리 잡아 두는 이유는, 저 둘이
 * 생길 자리가 **이 화면의 어디인지**가 지금 정해져 있어야 나중에 화면을
 * 다시 짜지 않기 때문이다 — 얼굴 옆이다. 얼굴에 붙는 것들이라 그렇다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  AWAKEN_COPIES, AWAKEN_ELIXIR, BATTLE_TYPE_ART, CHARS, CharId, ELIXIR_NAME,
  FREE_ENHANCE, RARITY_NAME,
  battleTypeOf, canAwaken, capOf, charPower, lvCost, maxStar, starUpCost,
} from '@/core/chars';
import { seatRows } from '@/core/party';
import { openPicks } from '@/core/skillTree';
import { Bar, Btn, Row, Sep, Stars, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { soon } from '@/ui/SoonPopup';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, R, SP, SURF } from '@/ui/theme';
import { CharStats } from './CharStats';
import { SkillPanel } from './SkillPanel';
import { SkillTreePopup } from './SkillTreePopup';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';

/**
 * 좌우로 넘기는 화살표.
 *
 * 갈 데가 없으면 흐리게 멎는다 — 지우면 그 순간 얼굴이 좌우로 밀려서,
 * 넘기는 중에 화면이 흔들린다.
 */
function Arrow({ on, label, onPress }: {
  on: boolean; label: string; onPress: () => void;
}) {
  return (
    <Pressable
      hitSlop={10}
      disabled={!on}
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => ({
        paddingHorizontal: SP.sm,
        paddingVertical: SP.xs,
        opacity: on ? (pressed ? 0.5 : 1) : 0.22,
      })}
    >
      <T size={18} bold>{label}</T>
    </Pressable>
  );
}

/** 얼굴 옆의 작은 단추 — 코스튬 · 인연 */
function SideBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          paddingHorizontal: SP.sm,
          paddingVertical: SP.xs,
          borderRadius: R.md,
          backgroundColor: pressed ? SURF.up : 'transparent',
          alignItems: 'center',
        },
      ]}
    >
      <T size={FS.tiny} bold>{label}</T>
    </Pressable>
  );
}

export function HeroManage({ pick, onPick }: {
  /** 지금 보고 있는 사람. 없으면 첫 사람 */
  pick: CharId | null;
  onPick: (id: CharId) => void;
}) {
  const raw = useGame((s) => s.chars);
  const party = useGame((s) => s.pendingParty ?? s.party);
  const form = useGame((s) => s.formation);
  const money = useGame((s) => s.money);
  const elixir = useGame((s) => s.elixir);
  const levelUp = useGame((s) => s.levelUp);
  const starUp = useGame((s) => s.starUp);
  const awaken = useGame((s) => s.awaken);
  const setGrowth = useGame((s) => s.setGrowth);
  const toast = useGame((s) => s.toast);

  /*
    ── 대형에 앉힌 명부를 쓴다 ──

    파티에 서 있는 사람은 줄 배수를 받는다 (`seatRows`). 수치 절이 그걸
    괄호로 말하므로 (`CharStats`) 여기서도 같은 몸을 넘겨야 한다 — 맨 몸을
    넘기면 앞줄에 선 사람의 방어력이 창에서만 낮게 뜬다.
  */
  const chars = useMemo(() => seatRows(party, raw, form), [party, raw, form]);

  /** 스킬 트리를 보고 있나 */
  const [tree, setTree] = useState(false);
  /** 월페이퍼를 보고 있나 */
  const [paper, setPaper] = useState(false);

  /*
    가진 순서 — 표에 적힌 차례 그대로다 (`CHARS`). 가진 순서로 두면 새로
    뽑을 때마다 목록이 뒤섞여서, 어제 세 번째였던 사람이 오늘 첫 번째가 된다.
  */
  const owned = useMemo(
    () => (Object.keys(CHARS) as CharId[]).filter((id) => !!raw[id]),
    [raw],
  );

  const at = Math.max(0, owned.indexOf((pick ?? owned[0]) as CharId));
  const id = owned[at];
  const c = id ? chars[id] : null;
  const d = c ? CHARS[c.id] : null;

  if (!c || !d) {
    return (
      <View style={{ paddingVertical: SP.xl, alignItems: 'center' }}>
        <T size={11} dim="sub">아직 가진 캐릭터가 없습니다.</T>
      </View>
    );
  }

  const picks = openPicks(c.id, c.star, c.tree);

  return (
    <>
      <SkillTreePopup who={tree ? c.id : null} onClose={() => setTree(false)} />
      <WallpaperPopup
        charId={paper ? c.id : null}
        name={d.name}
        onClose={() => setPaper(false)}
      />

      {/*
        ── 누구인가 ── 얼굴을 가운데 두고 좌우로 넘긴다.

        목록에서 고르는 것보다 이쪽이 맞다. 가진 사람이 넷 안팎이라 목록을
        따로 둘 만큼 많지 않고, 넘기는 동안 **바로 앞뒤 사람과 견주게** 된다 —
        누구를 키울까가 원래 그런 비교다.
      */}
      <Row between style={{ alignItems: 'center' }}>
        <Arrow on={at > 0} label="‹" onPress={() => onPick(owned[at - 1])} />

        <View style={{ alignItems: 'center', flex: 1 }}>
          <Sprite set="avatar" name={d.art} size={72} />
          <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
            <T size={FS.hero} bold>{d.name}</T>
            <Tag
              label={RARITY_NAME[d.rarity]}
              fill={d.rarity === 'mythic' || d.rarity === 'legendary'}
            />
            <Sprite set="role_icon" name={BATTLE_TYPE_ART[battleTypeOf(c.id)]} size={13} />
          </Row>
          <View style={{ marginTop: 3 }}>
            <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={13} />
          </View>
          <Row gap={SP.xs} style={{ marginTop: 3 }}>
            <T size={FS.label} bold>Lv {c.lv}</T>
            <T size={FS.tiny} dim="dim">/ {capOf(c)}</T>
            <T size={FS.tiny} dim="dim">{`전투력 ${charPower(c).toLocaleString()}`}</T>
          </Row>
        </View>

        <Arrow on={at < owned.length - 1} label="›" onPress={() => onPick(owned[at + 1])} />
      </Row>

      {/*
        ── 얼굴에 붙는 것들 ──

        코스튬과 인연은 아직 화면이 없다 (`soon`). 자리를 미리 잡는 이유는
        머리말에 적어 두었다 — 생길 자리가 정해져 있어야 나중에 화면을 다시
        안 짠다.

        월페이퍼는 **그림이 있는 사람에게만** 뜬다 (`hasWallpaper`). 없는
        사람에게 안 눌리는 단추를 남겨 두면, 그게 "아직 안 나왔다" 인지
        "고장" 인지 알 수가 없다.
      */}
      <Row gap={SP.xs} style={{ marginTop: SP.sm, justifyContent: 'center' }}>
        <SideBtn label="코스튬" onPress={() => soon('코스튬')} />
        <SideBtn label="인연" onPress={() => soon('인연')} />
        {hasWallpaper(c.id) && (
          <SideBtn label="월페이퍼" onPress={() => setPaper(true)} />
        )}
      </Row>

      <Sep />

      {/*
        ── 자라는 세 축 ── 등급 · 성 · 레벨 (`core/growth`).

        **스킬보다 먼저 온다.** 성이 스킬을 여는 축이라 (`skillSlots`), 아래
        기술 목록에서 잠긴 칸을 보기 전에 "왜 잠겼나" 가 여기 있어야 한다.
      */}
      <View
        style={{
          padding: SP.sm,
          borderRadius: R.md,
          backgroundColor: SURF.up,
          gap: SP.xs,
        }}
      >
        <Row between>
          <T size={FS.tiny} dim="sub">레벨</T>
          <T size={FS.tiny} dim="dim">
            {c.lv >= capOf(c)
              ? `${c.star}성 상한 — 합성해야 더 오른다`
              : `다음 ${(FREE_ENHANCE ? 0 : lvCost(c.lv)).toLocaleString()} 골드`}
          </T>
        </Row>
        <Row gap={SP.xs}>
          <Bar value={c.lv} max={capOf(c)} blocks={20} height={5} />
          <T size={FS.label} bold>{c.lv} / {capOf(c)}</T>
        </Row>
        <Btn
          label="레벨 올리기"
          size="sm"
          fill={c.lv < capOf(c) && (FREE_ENHANCE || money >= lvCost(c.lv))}
          disabled={c.lv >= capOf(c) || (!FREE_ENHANCE && money < lvCost(c.lv))}
          onPress={() => {
            const r = levelUp(c.id);
            if (r === 'poor') toast('골드가 부족합니다', 'bad');
            if (r === 'max') toast('지금 성의 상한입니다', 'plain');
          }}
        />

        <View style={{ height: 1, backgroundColor: LINE.low, marginVertical: 2 }} />

        <Row between>
          <T size={FS.tiny} dim="sub">성 · 합성</T>
          <T size={FS.tiny} dim="dim">
            {`조각 ${c.copies}장 · ${RARITY_NAME[d.rarity]}는 ${maxStar(d.rarity)}성까지`}
          </T>
        </Row>
        {c.star >= maxStar(d.rarity) ? (
          canAwaken(d.rarity) && !c.awake ? (
            <>
              <Btn
                label={`각성 — 조각 ${AWAKEN_COPIES} · ${ELIXIR_NAME} ${AWAKEN_ELIXIR}`}
                size="sm"
                fill={c.copies >= AWAKEN_COPIES && elixir >= AWAKEN_ELIXIR}
                disabled={c.copies < AWAKEN_COPIES || elixir < AWAKEN_ELIXIR}
                onPress={() => {
                  const r = awaken(c.id);
                  if (r === 'short') toast('조각이나 영약이 부족합니다', 'bad');
                  if (r === 'ok') toast(`${d.name} 각성!`, 'good');
                }}
              />
              <T size={FS.tiny} dim="dim">
                {`가진 것 — 조각 ${c.copies} / ${AWAKEN_COPIES}, `
                  + `${ELIXIR_NAME} ${elixir} / ${AWAKEN_ELIXIR}`}
              </T>
            </>
          ) : (
            <T size={FS.tiny} dim="dim">
              {c.awake
                ? '각성까지 마쳤습니다 — 더 올릴 것이 없습니다.'
                : `${RARITY_NAME[d.rarity]} 등급이 갈 수 있는 마지막 성입니다.`}
            </T>
          )
        ) : (
          <Btn
            label={`${c.star + 1}성으로 — 조각 ${starUpCost(c.star)}장`}
            size="sm"
            fill={c.copies >= starUpCost(c.star)}
            disabled={c.copies < starUpCost(c.star)}
            onPress={() => {
              const r = starUp(c.id);
              if (r === 'short') toast('조각이 부족합니다', 'bad');
              if (r === 'up') toast(`${d.name} ${c.star + 1}성!`, 'good');
            }}
          />
        )}
      </View>

      {/*
        ── 스킬 트리로 가는 문 ──

        목록(`SkillPanel`)은 "지금 무엇을 쓰나" 를, 트리는 "무엇으로 키울까"
        를 말한다. 둘이 다른 질문이라 화면도 나눈다.

        찍을 것이 남았으면 채워진다 — 성만 되면 저절로 열리던 것이 골라야
        열리는 것으로 바뀌었으므로, 안 찍은 사람은 기술을 잃은 것으로 보인다.
      */}
      <Btn
        label="스킬 트리"
        sub={picks > 0 ? `찍을 것 ${picks}개` : `${c.star}단계까지 열림`}
        size="sm"
        fill={picks > 0}
        style={{ marginTop: SP.sm, marginBottom: SP.sm }}
        onPress={() => setTree(true)}
      />

      <SkillPanel c={c} party={party} chars={chars} />

      <Sep />
      <CharStats c={c} party={party} chars={chars} />

      {/*
        ── 테스트용 단추 ── `FREE_ENHANCE` 가 켜져 있을 때만.

        ⚠ 출시 전에 `FREE_ENHANCE` 를 끄면 이 줄은 통째로 사라진다.
      */}
      {FREE_ENHANCE && (
        <>
          <Row gap={SP.xs} style={{ marginTop: SP.sm }}>
            <T size={FS.tiny} dim="dim">성</T>
            {Array.from({ length: maxStar(d.rarity) }, (_v, i) => i + 1).map((n) => (
              <Btn
                key={n}
                label={`${n}`}
                size="sm"
                fill={c.star === n}
                style={{ flex: 1 }}
                onPress={() => setGrowth(c.id, { star: n })}
              />
            ))}
          </Row>
          <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
            <Btn
              label="조각 +48"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => setGrowth(c.id, { copies: c.copies + 48 })}
            />
            <Btn
              label="Lv 최대"
              size="sm"
              style={{ flex: 1 }}
              disabled={c.lv >= capOf(c)}
              onPress={() => setGrowth(c.id, { lv: capOf(c) })}
            />
            <Btn
              label="Lv 1 로"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => setGrowth(c.id, { lv: 1 })}
            />
          </Row>
        </>
      )}
    </>
  );
}
