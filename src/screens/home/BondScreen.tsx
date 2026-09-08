/**
 * ── 인연 화면 ── 한 사람과 얼마나 가까운가, 그리고 무엇을 할 수 있나.
 *
 * 영웅 관리에서 하트를 누르면 여기로 온다. **창이 아니라 화면**인 까닭:
 * 여기서 하는 일이 셋이고 (대화 · 선물 · 이야기) 그 셋이 각각 또 화면을
 * 여는데, 창 위에 창을 세 겹 쌓으면 나가는 길이 세 번이 된다.
 *
 * ## 셋을 나란히 두는 까닭
 *
 *   대화하기   하루 두 번. **기다려야 하는 것**
 *   선물주기   가진 만큼. **모아야 하는 것**
 *   이야기     단계에 닿으면. **받는 것**
 *
 * 셋이 서로 다른 것을 요구한다. 하나로 합치면 (예: 선물만) 인연이 그냥
 * 아이템을 붓는 축이 되어 레벨업과 같은 일이 된다.
 *
 * ## 여기서 값이 오른다
 *
 * 계산은 전부 `core/bond` 에 있고, 넣는 것은 스토어가 한다 (`talkBond` ·
 * `giveGift` · `readStory`). 화면은 무엇을 골랐는지만 넘긴다 — 화면이 값을
 * 세면 화면에 뜬 수와 실제로 오른 수가 갈린다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId, maxStar } from '@/core/chars';
import {
  BOND_STEPS, BondStep, GIFTS, GIFT_IDS, GiftId, RARITY_BOND, STORY_DIA,
  TALKS, TALK_A_DAY, bondNeed, bondStep, giftMul, storyOpen,
} from '@/core/bond';
import { dayKey } from '@/core/events';
import { Bar, Btn, Row, Stars, T, Tag } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';
import { BORDER, BORDER_HI, C, FS, LINE, O, R, SP, SURF } from '@/ui/theme';

/** 하트 게이지 한 칸 — 채워졌나 */
function Heart({ on, size = 11 }: { on: boolean; size?: number }) {
  /*
    하트를 그림으로 두지 않는다. 스프라이트 한 칸을 쓰면 빈 하트와 찬 하트
    둘이 필요하고, 흑백에서 그 둘을 11px 로 가르는 것이 잘 안 된다.

    대신 **마름모 하나**를 채우거나 비운다. 채운 것과 빈 것이 테두리 하나로
    갈리므로 작은 크기에서도 세어진다.
  */
  return (
    <View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: '45deg' }],
        borderWidth: 1,
        borderColor: on ? C.fg : LINE.mid,
        backgroundColor: on ? C.fg : 'transparent',
      }}
    />
  );
}

/**
 * ── 하트 게이지 ── 지금 몇이고 어디까지 갈 수 있나.
 *
 * 상한까지만 그린다. 등급이 낮으면 칸이 적게 서므로 (`RARITY_BOND`)
 * "여기까지가 끝" 이 게이지 길이로 읽힌다 — 열 칸을 그려 놓고 셋만 채우면
 * 못 채운 것으로 보인다.
 */
export function BondGauge({ lv, cap, size = 11 }: {
  lv: number; cap: number; size?: number;
}) {
  return (
    <Row gap={3}>
      {Array.from({ length: cap }, (_v, i) => (
        <Heart key={i} on={i < lv} size={size} />
      ))}
    </Row>
  );
}

/** 대화 창 — 한 마디 묻고 셋 중에 고른다 */
function TalkPopup({ who, onClose }: { who: CharId; onClose: () => void }) {
  const talkBond = useGame((s) => s.talkBond);
  const toast = useGame((s) => s.toast);
  const list = TALKS[who] ?? [];
  /*
    ── 어느 대화인지는 **창을 열 때 한 번** 정한다 ──

    렌더마다 고르면 선택지를 누르는 순간 질문이 바뀐다. `useMemo` 로 묶어
    두면 이 창이 살아 있는 동안 같은 대화다.
  */
  const pick = useMemo(() => Math.floor(Math.random() * Math.max(1, list.length)), [list]);
  const talk = list[pick];
  /** 고르고 난 뒤 — 그 사람의 대답과 오른 값 */
  const [said, setSaid] = useState<{ reply: string; exp: number } | null>(null);

  if (!talk) return null;
  const d = CHARS[who];

  return (
    <Popup visible title={`${d.name}와 대화`} onClose={onClose}>
      <View style={[BORDER, { padding: SP.md, backgroundColor: SURF.up }]}>
        <T size={FS.body}>{said ? said.reply : talk.ask}</T>
      </View>

      {said ? (
        <>
          {/*
            오른 값을 적는다. 안 적으면 잘 고른 것과 잘못 고른 것이 화면에서
            같아 보이고, 그러면 다음에 무엇을 고를지가 안 정해진다.
          */}
          <Row between style={{ marginTop: SP.md }}>
            <T size={FS.tiny} dim="dim">애정</T>
            <T size={FS.body} bold>
              {said.exp >= 0 ? `+${said.exp}` : `${said.exp}`}
            </T>
          </Row>
          <Btn label="닫기" size="lg" fill style={{ marginTop: SP.sm }} onPress={onClose} />
        </>
      ) : (
        <View style={{ marginTop: SP.sm, gap: SP.xs }}>
          {talk.choices.map((ch, i) => (
            <Pressable
              key={ch.text}
              onPress={() => {
                sfx('tap');
                /*
                  자리 번호를 넘긴다 — 값은 스토어가 표에서 읽는다. 여기서
                  값을 넘기면 화면이 고친 수가 그대로 들어간다.
                */
                const r = talkBond(who, pick * talk.choices.length + i);
                if (r === 'no') { toast('오늘은 더 말을 걸 수 없습니다', 'plain'); onClose(); return; }
                if (r.up > 0) toast(`${d.name}와 더 가까워졌습니다`, 'good');
                setSaid({ reply: ch.reply, exp: ch.exp });
              }}
              style={({ pressed }) => [
                BORDER,
                {
                  padding: SP.sm,
                  backgroundColor: pressed ? SURF.up : 'transparent',
                },
              ]}
            >
              <T size={FS.body}>{ch.text}</T>
            </Pressable>
          ))}
        </View>
      )}
    </Popup>
  );
}

/** 선물 창 — 가진 것만 뜬다 */
function GiftPopup({ who, onClose }: { who: CharId; onClose: () => void }) {
  const gifts = useGame((s) => s.gifts);
  const giveGift = useGame((s) => s.giveGift);
  const toast = useGame((s) => s.toast);
  const d = CHARS[who];
  const have = GIFT_IDS.filter((id) => (gifts[id] ?? 0) > 0);

  return (
    <Popup visible title={`${d.name}에게 선물`} onClose={onClose}>
      {have.length === 0 ? (
        <T size={FS.body} dim="dim" center style={{ paddingVertical: SP.lg }}>
          줄 수 있는 선물이 없습니다.{'\n'}가방의 기타 칸에 들어갑니다.
        </T>
      ) : (
        <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
          {have.map((id) => {
            const g = GIFTS[id];
            const mul = giftMul(who, id);
            return (
              <Pressable
                key={id}
                onPress={() => {
                  sfx('tap');
                  const r = giveGift(who, id);
                  if (r === 'none') return;
                  toast(
                    r.exp >= 0 ? `애정 +${r.exp}` : `애정 ${r.exp}`,
                    r.exp >= 0 ? 'good' : 'bad',
                  );
                }}
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
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: R.sm,
                      borderWidth: 1,
                      borderColor: LINE.low,
                      backgroundColor: SURF.down,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sprite set="gift_icon" name={g.art} size={26} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T size={FS.body} bold numberOfLines={1}>{g.name}</T>
                    <T size={9} dim="dim" numberOfLines={1}>{g.desc}</T>
                  </View>
                  <T size={FS.body} bold>{`×${gifts[id]}`}</T>
                </Row>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      {/*
        ── 무엇을 좋아하는지는 **안 적는다** ──

        표를 띄우면 그때부터 이 화면은 표를 읽고 맞는 것만 누르는 자리가
        된다. 줘 보고 알게 두는 편이 낫다 — 잘못 준 것도 이 사람에 대해
        알게 된 것이다.

        대신 **줘 본 것은 기억한다.** 이미 준 적이 있으면 그때 얼마였는지가
        토스트로 떴으므로, 두 번째부터는 사람이 안다.
      */}
      <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
        좋아하는 것이 사람마다 다릅니다. 싫어하는 것을 주면 애정이 깎입니다.
      </T>
    </Popup>
  );
}

/** 이야기 창 — 단계마다 하나 */
function StoryPopup({ who, lv, onClose }: {
  who: CharId; lv: number; onClose: () => void;
}) {
  const bonds = useGame((s) => s.bonds);
  const readStory = useGame((s) => s.readStory);
  const toast = useGame((s) => s.toast);
  const [open, setOpen] = useState<BondStep | null>(null);
  const [paper, setPaper] = useState(false);
  const read = bonds[who]?.read ?? [];
  const d = CHARS[who];

  return (
    <>
      <Popup visible title={`${d.name}의 이야기`} onClose={onClose}>
        {BOND_STEPS.map((s) => {
          const ok = storyOpen(lv, s);
          const done = read.includes(s.id);
          return (
            <Pressable
              key={s.id}
              disabled={!ok}
              onPress={() => { sfx('tap'); setOpen(s); }}
              style={({ pressed }) => [
                done ? BORDER_HI : BORDER,
                {
                  padding: SP.sm,
                  marginBottom: SP.xs,
                  opacity: ok ? 1 : O.dim,
                  backgroundColor: pressed && ok ? SURF.up : 'transparent',
                },
              ]}
            >
              <Row between>
                <T size={FS.body} bold>{s.name}</T>
                {done
                  ? <Tag label="봤음" fill />
                  : <Tag label={ok ? '열림' : `인연 ${s.from}`} />}
              </Row>
              <T size={FS.tiny} dim="dim" style={{ marginTop: 2 }}>
                {ok ? s.hint : '아직 잠겨 있습니다.'}
              </T>
            </Pressable>
          );
        })}
        {/*
          보상을 미리 적는다. 다 보고 나서야 알면 "그래서 뭘 받았지" 가 되고,
          그러면 이야기를 여는 것이 값을 치를 만한 일인지 정할 수가 없다.
        */}
        <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
          {`이야기를 처음 끝까지 보면 다이아 ${STORY_DIA}개와 그 장면의 월페이퍼를 받습니다.`}
        </T>
      </Popup>

      {/* 이야기 한 편 — 지금은 자리만 */}
      {!!open && (
        <Popup visible title={`${d.name} · ${open.name}`} onClose={() => setOpen(null)}>
          <View
            style={[
              BORDER,
              { padding: SP.xl, alignItems: 'center', backgroundColor: SURF.up },
            ]}
          >
            <T size={FS.title} bold>준비중</T>
            <T size={FS.tiny} dim="dim" center style={{ marginTop: SP.xs }}>
              {open.hint}
            </T>
          </View>
          <Btn
            label={read.includes(open.id) ? '이미 받았습니다' : '다 봤습니다'}
            size="lg"
            fill={!read.includes(open.id)}
            disabled={read.includes(open.id)}
            style={{ marginTop: SP.md }}
            onPress={() => {
              sfx('tap');
              if (readStory(who, open.id)) {
                toast(`다이아 ${STORY_DIA}개를 받았습니다`, 'good');
                if (hasWallpaper(who)) setPaper(true);
              }
              setOpen(null);
            }}
          />
        </Popup>
      )}

      {/*
        ── 받은 월페이퍼를 **그 자리에서 보여 준다** ──

        받았다는 토스트만 띄우면 어디로 갔는지 모른다. 한 번 띄워 주면
        "이게 그 그림이다" 가 되고, 다시 볼 자리는 영웅 관리에 있다.

        단계마다 다른 그림이 붙는 것이 사양인데 지금은 사람당 한 장뿐이라
        (`ui/wallpapers`) 그 한 장을 띄운다. 넉 장이 오는 날 여기가 갈린다.
      */}
      <WallpaperPopup
        charId={paper ? who : null}
        name={d.name}
        onClose={() => setPaper(false)}
      />
    </>
  );
}

export function BondScreen({ who, onBack }: { who: CharId; onBack: () => void }) {
  const chars = useGame((s) => s.chars);
  const bonds = useGame((s) => s.bonds);
  const [open, setOpen] = useState<'talk' | 'gift' | 'story' | null>(null);

  const c = chars[who];
  const d = CHARS[who];
  if (!c || !d) return null;

  const b = bonds[who] ?? { lv: 0, exp: 0, talkDay: '', talks: 0, read: [] };
  const cap = RARITY_BOND[d.rarity];
  const step = bondStep(b.lv);
  const today = dayKey(Date.now());
  const used = b.talkDay === today ? b.talks : 0;
  const left = Math.max(0, TALK_A_DAY - used);
  const maxed = b.lv >= cap;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl }}
      showsVerticalScrollIndicator={false}
    >
      <Row between style={{ marginBottom: SP.sm }}>
        <Btn label="← 영웅 관리" size="sm" onPress={onBack} />
        <T size={FS.title} bold>인연</T>
      </Row>

      {/* ── 지금 어떤 사이인가 ── 창의 맨 위, 제일 크게 */}
      <View style={[BORDER, { padding: SP.md, backgroundColor: SURF.up }]}>
        <Row gap={SP.sm}>
          <Sprite set="avatar" name={d.art} size={52} />
          <View style={{ flex: 1 }}>
            <T size={FS.hero} bold numberOfLines={1}>{d.name}</T>
            <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={10} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <T size={FS.hero} bold>{step.name}</T>
            <T size={FS.tiny} dim="dim">{`인연 ${b.lv} / ${cap}`}</T>
          </View>
        </Row>

        <View style={{ marginTop: SP.sm, alignItems: 'center' }}>
          <BondGauge lv={b.lv} cap={cap} size={13} />
        </View>

        {/* 다음 칸까지 — 상한이면 막대를 채워 둔다 */}
        <View style={{ marginTop: SP.sm }}>
          <Bar value={maxed ? 1 : b.exp} max={maxed ? 1 : bondNeed(b.lv)} blocks={24} />
        </View>
        <T size={FS.tiny} dim="dim" style={{ marginTop: 2 }}>
          {maxed
            ? '더 갈 곳이 없습니다.'
            : `${b.exp} / ${bondNeed(b.lv)}`}
        </T>
      </View>

      {/* ── 할 수 있는 일 셋 ── */}
      <Row gap={SP.xs} style={{ marginTop: SP.md, alignItems: 'stretch' }}>
        <Act
          label="대화하기"
          sub={left > 0 ? `오늘 ${left}번 남음` : '내일 다시'}
          on={left > 0 && !maxed}
          onPress={() => setOpen('talk')}
        />
        <Act
          label="선물주기"
          sub="가방의 기타"
          on={!maxed}
          onPress={() => setOpen('gift')}
        />
        <Act
          label="스토리보기"
          sub={`${(b.read ?? []).length} / ${BOND_STEPS.length}`}
          on
          onPress={() => setOpen('story')}
        />
      </Row>

      {maxed && (
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.sm }}>
          인연이 상한입니다. 대화와 선물로는 더 오르지 않습니다.
        </T>
      )}

      {open === 'talk' && <TalkPopup who={who} onClose={() => setOpen(null)} />}
      {open === 'gift' && <GiftPopup who={who} onClose={() => setOpen(null)} />}
      {open === 'story' && (
        <StoryPopup who={who} lv={b.lv} onClose={() => setOpen(null)} />
      )}
    </ScrollView>
  );
}

/** 셋이 나란히 서는 큰 단추 — 이름 아래에 지금 사정을 한 줄 */
function Act({ label, sub, on, onPress }: {
  label: string; sub: string; on: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      disabled={!on}
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          flex: 1,
          paddingVertical: SP.md,
          paddingHorizontal: SP.xs,
          alignItems: 'center',
          gap: 3,
          opacity: on ? 1 : O.dim,
          backgroundColor: pressed && on ? SURF.up : 'transparent',
        },
      ]}
    >
      <T size={FS.body} bold center numberOfLines={1}>{label}</T>
      <T size={9} dim="dim" center numberOfLines={1}>{sub}</T>
    </Pressable>
  );
}
