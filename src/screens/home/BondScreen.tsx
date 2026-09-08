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
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useGame } from '@/state/store';
import { CHARS, CharId, maxStar } from '@/core/chars';
import {
  BOND_STEPS, BondStep, GIFTS, GIFT_A_DAY, GIFT_BASE, GIFT_IDS, RARITY_BOND,
  STORY_DIA, TALK_A_DAY, bondNeed, bondStep, storyNo, storyWhy,
} from '@/core/bond';
import { dayKey } from '@/core/events';
import { Bar, Btn, Row, Stars, T } from '@/ui/atoms';
import { Pixel } from '@/ui/Pixel';
import { HEART, ICONS } from '@/ui/sprites';
import { Popup } from '@/ui/Popup';
import { Sprite } from '@/ui/Sprite';
import { sfx } from '@/ui/sfx';
import { TalkView } from './TalkView';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';
import { BORDER, BORDER_HI, C, FS, LINE, O, R, SP, SURF } from '@/ui/theme';

/**
 * ── 하트 게이지 ── 지금 몇이고 어디까지 갈 수 있나.
 *
 * **진짜 하트를 쓴다** (`ui/sprites` 의 `HEART` — 9×8 도트). 한동안 45도로
 * 돌린 마름모를 채우고 비웠는데, 열 개가 나란히 서면 그냥 **기울어진 네모
 * 줄**이라 인연인지 무슨 칸인지 알 수가 없었다. 빈 것과 찬 것은 색이 아니라
 * **밝기**로 가른다 (`O.faint`) — 흑백에서 같은 모양을 두 벌 그리는 것보다
 * 이쪽이 작은 크기에서 잘 읽힌다.
 *
 * 상한까지만 그린다. 등급이 낮으면 칸이 적게 서므로 (`RARITY_BOND`)
 * "여기까지가 끝" 이 게이지 길이로 읽힌다 — 열 칸을 그려 놓고 셋만 채우면
 * 못 채운 것으로 보인다.
 */
export function BondGauge({ lv, cap, size = 11 }: {
  lv: number; cap: number; size?: number;
}) {
  return (
    <Row gap={2}>
      {Array.from({ length: cap }, (_v, i) => (
        <Pixel
          key={i}
          sprite={HEART}
          scale={size / 9}
          opacity={i < lv ? 1 : O.faint}
        />
      ))}
    </Row>
  );
}

/*
  대화는 **화면**으로 나갔다 (`TalkView`). 창 안의 두 줄짜리 글로는 "이
  사람과 마주 앉는다" 가 안 되고, 선택지 셋을 그 상자에 넣으면 창이 화면
  절반이 된다 — 까닭은 그 파일 머리말에.
*/

/**
 * ── 준 뒤에 뜨는 창 ── 얼마나 올랐나.
 *
 * 여태 토스트로만 알렸다. 토스트는 위에 잠깐 떴다 사라지는 것이라 **선물
 * 목록에 가려져** 못 보고 지나가는 일이 잦았고, 좋아하는 것을 준 것과
 * 싫어하는 것을 준 것이 화면에서 같아 보였다.
 *
 * 창은 **눌러야 닫힌다.** 값이 컸는지 작았는지 마이너스였는지를 한 번은
 * 보게 된다 — 그게 이 사람이 무엇을 좋아하는지 알아 가는 유일한 길이다.
 */
function GiftResult({ who, art, name, exp, up, lv, onClose }: {
  who: CharId;
  art: string;
  name: string;
  exp: number;
  /** 이번에 오른 칸 수 */
  up: number;
  /** 오르고 난 지금 레벨 */
  lv: number;
  onClose: () => void;
}) {
  const d = CHARS[who];
  const good = exp > 0;
  return (
    <Popup visible title="선물을 주었습니다" onClose={onClose}>
      <View style={{ alignItems: 'center', paddingVertical: SP.md, gap: SP.xs }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: R.sm,
            borderWidth: 1,
            borderColor: LINE.low,
            backgroundColor: SURF.down,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprite set="gift_icon" name={art} size={42} />
        </View>
        <T size={FS.body} dim="sub">{`${d.name}에게 ${name}`}</T>
        {/* 오른 값이 제일 크다 — 이 창이 하는 말이 그것 하나다 */}
        <T size={28} bold>{good ? `애정 +${exp}` : `애정 ${exp}`}</T>
        <T size={FS.tiny} dim={good ? 'sub' : 'dim'}>
          {good
            ? (exp >= GIFT_BASE * 2 ? '아주 마음에 들어 합니다' : '나쁘지 않은 모양입니다')
            : '싫어하는 것이었습니다'}
        </T>
        {up > 0 && (
          <View style={{ alignItems: 'center', marginTop: SP.sm, gap: 3 }}>
            <BondGauge lv={lv} cap={RARITY_BOND[d.rarity]} size={13} />
            <T size={FS.body} bold>{`${bondStep(lv).name} 이 되었습니다`}</T>
          </View>
        )}
      </View>
      <Btn label="닫기" size="lg" fill onPress={onClose} />
    </Popup>
  );
}

/**
 * ── 오늘은 더 못 준다 ── 창으로 말한다.
 *
 * 단추를 흐리게 멎어 두고 그 아래에 작게 적었었다. 그러면 **누른 사람이
 * 답을 못 받는다** — 눌렀는데 아무 일도 안 일어나고, 왜 안 되는지는 화면
 * 어딘가에 작게 적혀 있다.
 *
 * 누르면 뜨게 두면 물음과 답이 붙는다. 잠긴 이야기를 눌렀을 때와 같은
 * 규칙이다 (`StoryPopup` 의 `why`).
 */
function GiftFull({ onClose }: { onClose: () => void }) {
  return (
    <Popup visible title="선물" onClose={onClose}>
      <View style={{ alignItems: 'center', paddingVertical: SP.lg, gap: SP.sm }}>
        <Pixel sprite={ICONS.lock} scale={2.4} opacity={O.sub} />
        <T size={FS.body} bold center>오늘 줄 수 있는 선물을 다 줬습니다</T>
        <T size={FS.tiny} dim="dim" center>
          {`하루에 ${GIFT_A_DAY}개까지 줄 수 있습니다. 내일 다시 오세요.`}
        </T>
      </View>
      <Btn label="닫기" size="lg" fill onPress={onClose} />
    </Popup>
  );
}

/** 선물 창 — 가진 것만 뜬다 */
function GiftPopup({ who, onClose }: { who: CharId; onClose: () => void }) {
  const gifts = useGame((s) => s.gifts);
  const bonds = useGame((s) => s.bonds);
  const giveGift = useGame((s) => s.giveGift);
  const toast = useGame((s) => s.toast);
  const d = CHARS[who];
  const have = GIFT_IDS.filter((id) => (gifts[id] ?? 0) > 0);
  /** 방금 준 것 — 창이 뜬다 */
  const [done, setDone] = useState<
    { art: string; name: string; exp: number; up: number; lv: number } | null
  >(null);
  /** 오늘 몫을 다 썼다고 말하는 창 */
  const [full, setFull] = useState(false);

  const b = bonds[who];
  const today = dayKey(Date.now());
  const used = b && b.giftDay === today ? b.gaves : 0;
  const left = Math.max(0, GIFT_A_DAY - used);

  return (
    <Popup visible title={`${d.name}에게 선물`} onClose={onClose}>
      {/* 오늘 몇 개 남았나 — 누르기 전에 알아야 한다 */}
      <Row between style={{ marginBottom: SP.xs }}>
        <T size={FS.tiny} dim="dim">오늘 남은 선물</T>
        <T size={FS.body} bold>{`${left}/${GIFT_A_DAY}`}</T>
      </Row>
      {have.length === 0 ? (
        <T size={FS.body} dim="dim" center style={{ paddingVertical: SP.lg }}>
          줄 수 있는 선물이 없습니다.{'\n'}가방의 기타 칸에 들어갑니다.
        </T>
      ) : (
        <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
          {have.map((id) => {
            const g = GIFTS[id];
            return (
              <Pressable
                key={id}
                onPress={() => {
                  sfx('tap');
                  const r = giveGift(who, id);
                  if (r === 'none') return;
                  /* 다 줬으면 창으로 말한다 — 토스트는 목록에 가려진다 */
                  if (r === 'no') { setFull(true); return; }
                  /* 값은 창이 말한다 — 토스트는 가려져서 못 보고 지나간다 */
                  setDone({
                    art: g.art, name: g.name, exp: r.exp, up: r.up, lv: r.lv,
                  });
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

      {full && <GiftFull onClose={() => setFull(false)} />}

      {/* 준 뒤의 창 — 목록 **위**에 뜬다 (`GiftResult`) */}
      {!!done && (
        <GiftResult
          who={who}
          art={done.art}
          name={done.name}
          exp={done.exp}
          up={done.up}
          lv={done.lv}
          onClose={() => setDone(null)}
        />
      )}
    </Popup>
  );
}

/**
 * ── 이야기 창 ── 네 장, 순서대로.
 *
 * ## 왜 `1장` 이라고 적나
 *
 * 단계 이름(`어색한 관계`)으로 적었었다. 그런데 그 이름은 바로 위 게이지가
 * 이미 말하고 있고, 여기서 사람이 세는 것은 **몇 편까지 봤나** 다. 같은 말을
 * 두 자리에 두면 둘 다 흐려진다.
 *
 * ## 오른쪽은 **보상**이다
 *
 * `열림` · `잠김` 같은 상태 딱지가 있었다. 그건 칸이 흐린 것과 자물쇠가
 * 이미 말하고 있으므로 자리만 먹었다. 그 자리에 받을 것을 적는다 —
 * 다이아 100. 이미 받았으면 **회색으로 남긴다**: 지우면 "원래 안 주는 장"
 * 으로 읽히고, 받은 사람은 무엇을 받았는지 다시 볼 데가 없어진다.
 *
 * ## 잠긴 장을 눌러도 **뭔가 뜬다**
 *
 * 안 눌리게 두면 왜 안 되는지를 알 방법이 없다. 눌리게 두고 창에 까닭을
 * 적는다 — 인연이 모자란 것인지, 앞 장을 안 본 것인지 (`storyWhy`).
 */
function StoryPopup({ who, lv, onClose }: {
  who: CharId; lv: number; onClose: () => void;
}) {
  const bonds = useGame((s) => s.bonds);
  const readStory = useGame((s) => s.readStory);
  const toast = useGame((s) => s.toast);
  /** 열어 본 장 */
  const [open, setOpen] = useState<BondStep | null>(null);
  /** 왜 못 보는지를 말하는 창 */
  const [why, setWhy] = useState<{ step: BondStep; kind: 'level' | 'before' } | null>(null);
  const [paper, setPaper] = useState<string | null>(null);
  const read = bonds[who]?.read ?? [];
  const d = CHARS[who];

  return (
    <>
      <Popup visible title={`${d.name}의 이야기`} onClose={onClose}>
        {BOND_STEPS.map((st) => {
          const kind = storyWhy(lv, st, read);
          const ok = kind === 'ok';
          const done = read.includes(st.id);
          return (
            <Pressable
              key={st.id}
              onPress={() => {
                sfx('tap');
                if (ok || done) { setOpen(st); return; }
                setWhy({ step: st, kind });
              }}
              style={({ pressed }) => [
                done ? BORDER_HI : BORDER,
                {
                  padding: SP.sm,
                  marginBottom: SP.xs,
                  opacity: ok || done ? 1 : O.dim,
                  backgroundColor: pressed ? SURF.up : 'transparent',
                },
              ]}
            >
              <Row between>
                <Row gap={SP.xs} style={{ alignItems: 'center', flex: 1 }}>
                  {/* 잠긴 장에는 자물쇠 — 흐린 것만으로는 "아직" 이 안 읽힌다 */}
                  {!ok && !done && <Pixel sprite={ICONS.lock} scale={1.2} opacity={O.sub} />}
                  <T size={FS.body} bold numberOfLines={1}>
                    {`${storyNo(st.id)}장 : 준비중`}
                  </T>
                </Row>
                {/*
                  ── 보상 ── 다이아 100.

                  이미 받았으면 흐리게 남긴다 (머리말). 지우면 그 장만
                  원래 안 주는 것처럼 보인다.
                */}
                <Row gap={3} style={{ alignItems: 'center', opacity: done ? O.dim : 1 }}>
                  <Sprite set="coin_ui" name="gem" size={14} />
                  <T size={FS.tiny} bold dim={done ? 'dim' : 'full'}>
                    {`×${STORY_DIA}`}
                  </T>
                </Row>
              </Row>
            </Pressable>
          );
        })}
      </Popup>

      {/* 이야기 한 편 — 지금은 자리만 */}
      {!!open && (
        <Popup
          visible
          title={`${d.name} · ${storyNo(open.id)}장`}
          onClose={() => setOpen(null)}
        >
          <View
            style={[
              BORDER,
              { padding: SP.xl, alignItems: 'center', backgroundColor: SURF.up },
            ]}
          >
            <T size={FS.title} bold>준비중</T>
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
                /*
                  ── 받은 월페이퍼를 그 자리에서 보여 준다 ──

                  단계마다 다른 장이 붙는다 (`<사람>_<단계>`). 아직 안 온
                  단계는 그 사람의 한 장으로 떨어지므로 (`wallpaperOf`),
                  그림이 도착하는 순서와 상관없이 늘 뭔가를 보여 준다.
                */
                const key = `${who}_${open.id}`;
                if (hasWallpaper(key)) setPaper(key);
              }
              setOpen(null);
            }}
          />
        </Popup>
      )}

      {/* 왜 못 보는지 — 눌러 보고 나서 알아야 할 것이 아니다 */}
      {!!why && (
        <Popup
          visible
          title={`${storyNo(why.step.id)}장`}
          onClose={() => setWhy(null)}
        >
          <View style={{ alignItems: 'center', paddingVertical: SP.md, gap: SP.sm }}>
            <Pixel sprite={ICONS.lock} scale={2.4} opacity={O.sub} />
            <T size={FS.body} bold center>
              {why.kind === 'before'
                ? `${storyNo(why.step.id) - 1}장을 먼저 보고 오세요`
                : `인연 ${why.step.from} 이 되어야 열립니다`}
            </T>
            <T size={FS.tiny} dim="dim" center>
              {why.kind === 'before'
                ? '이야기는 순서대로 봅니다.'
                : `지금은 인연 ${lv} 입니다. 대화와 선물로 올릴 수 있습니다.`}
            </T>
          </View>
          <Btn label="닫기" size="lg" fill onPress={() => setWhy(null)} />
        </Popup>
      )}

      <WallpaperPopup
        charId={paper}
        name={d.name}
        onClose={() => setPaper(null)}
      />
    </>
  );
}

export function BondScreen({ who, onBack }: { who: CharId; onBack: () => void }) {
  const chars = useGame((s) => s.chars);
  const bonds = useGame((s) => s.bonds);
  const [open, setOpen] = useState<'talk' | 'gift' | 'story' | null>(null);
  /** 오늘 선물을 다 줬다고 말하는 창 */
  const [noGift, setNoGift] = useState(false);

  const c = chars[who];
  const d = CHARS[who];
  if (!c || !d) return null;

  const b = bonds[who]
    ?? { lv: 0, exp: 0, talkDay: '', talks: 0, giftDay: '', gaves: 0, read: [] };
  const cap = RARITY_BOND[d.rarity];
  const step = bondStep(b.lv);
  const today = dayKey(Date.now());
  const used = b.talkDay === today ? b.talks : 0;
  const left = Math.max(0, TALK_A_DAY - used);
  /* 선물도 하루치가 있다 — 대화보다 하나 많다 (`core/bond` 의 `GIFT_A_DAY`) */
  const gaves = b.giftDay === today ? b.gaves : 0;
  const gLeft = Math.max(0, GIFT_A_DAY - gaves);
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
        {/*
          ── 대화는 **다 써도 눌린다** ──

          횟수를 다 쓰면 고르는 대화 대신 한마디만 한다 (`TalkView` 의
          `idle`). 단추를 막아 두면 "말을 걸 수 없다" 와 "오늘은 더 못
          쌓는다" 가 화면에서 같아 보이는데, 이 사람은 늘 거기 있다.
        */}
        {/*
          남은 것은 **분수로** 적는다 (`0/2`). `오늘 2번 남음` · `오늘은 다
          했음` 처럼 말로 적었더니 두 상태의 글자 수가 달라서 칸이 흔들렸고,
          무엇보다 **상한이 몇인지**가 다 쓴 뒤에는 화면에서 사라졌다 —
          분수는 남은 것과 상한을 한 번에 말한다.
        */}
        <Act
          label="대화하기"
          sub={`${left}/${TALK_A_DAY}`}
          on
          onPress={() => setOpen('talk')}
        />
        {/*
          대화와 같은 규칙으로 **늘 눌린다** — 다 줬으면 창이 뜬다
          (`GiftFull`). 멎어 있는 단추는 눌린 사람에게 아무 답도 안 준다.
        */}
        <Act
          label="선물주기"
          sub={`${gLeft}/${GIFT_A_DAY}`}
          on
          onPress={() => (gLeft > 0 ? setOpen('gift') : setNoGift(true))}
        />
        <Act
          label="스토리보기"
          sub={`${(b.read ?? []).length}/${BOND_STEPS.length}`}
          on
          onPress={() => setOpen('story')}
        />
      </Row>

      {maxed && (
        <T size={FS.tiny} dim="dim" style={{ marginTop: SP.sm }}>
          인연이 상한입니다. 대화와 선물로는 더 오르지 않습니다.
        </T>
      )}

      {open === 'talk' && <TalkView who={who} onClose={() => setOpen(null)} />}
      {open === 'gift' && <GiftPopup who={who} onClose={() => setOpen(null)} />}
      {open === 'story' && (
        <StoryPopup who={who} lv={b.lv} onClose={() => setOpen(null)} />
      )}
      {noGift && <GiftFull onClose={() => setNoGift(false)} />}
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
