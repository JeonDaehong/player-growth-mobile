/**
 * ── 영웅 관리 ── 한 사람을 세워 놓고 들여다보고 키운다.
 *
 * 영웅 탭의 첫 갈래다 (`HeroScreen` 의 `sub`).
 *
 * 화면 구성은 받은 시안 그대로다 (`assets/2026-09-06/123123.jpg`).
 *
 * ## 창이 아니라 화면인 이유
 *
 * 이 내용이 여태 **파티 칸을 눌러야 열리는 창**에만 있었다 (`CharPopup`).
 * 그러면 캐릭터를 키우는 길이 "무대 → 파티 칸 → 그 사람" 하나뿐이고, 지금
 * 파티에 안 세운 사람은 **키울 방법이 아예 없다.**
 *
 * 여기서는 가진 사람을 좌우로 넘겨 가며 본다. 파티에 서 있든 아니든 같다.
 *
 * ## 위에서 아래로 무엇이 있나
 *
 *   무대      전신 · 말풍선 · 등급 문장 · 역할과 패시브 · 단추 둘 · 화살표
 *   이름표    별 · 레벨 · 전투력
 *   기술      "현재 채용중인 스킬" + 스킬 트리 문 · 칸 셋 (`SkillPanel` 의 `grid`)
 *   수치      두 칸 격자 (`CharStats` 의 `cols`)
 *   키우기    승급 · 레벨업
 *
 * **보는 것이 먼저고 하는 것이 나중이다.** 한동안 키우는 단추를 위쪽에 뒀는데,
 * 그러면 화면을 열자마자 단추부터 마주치고 이 사람이 누구인지는 그 아래로
 * 밀린다. 키우는 단추는 손이 닿아야 하는 것이라 아래쪽이 오히려 맞다.
 *
 * ## 무대에 **다 얹는다**
 *
 * 인물 둘레의 빈 자리를 글이 쓴다. 역할과 패시브는 왼쪽 위, 인연·
 * 월페이퍼는 오른쪽 위, 등급 문장은 한가운데 위, 이름은 왼쪽. 넘기는
 * 화살표까지 무대 양 끝에 얹는다.
 *
 * 밖으로 빼면 두 가지를 잃는다. 무대가 그만큼 좁아져서 **인물이 작아지고**,
 * 화면이 "그림 한 장 + 글 목록" 으로 갈려서 인물이 장식처럼 보인다. 시안이
 * 다 얹어 둔 까닭도 같을 것이다.
 *
 * 인물 그림은 좌우가 비어 있는 세로 그림이라 (`docs/CHAR_FULL_PROMPTS.md`)
 * 글이 얹혀도 얼굴이나 무기를 가리지 않는다.
 *
 * ## 배경은 **아주 죽여서** 깐다
 *
 * 시안처럼 뒤에 아치를 깐다 (`bg_hero/hall`). 다만 0.22 로 눌러서 깐다.
 *
 * 1-bit 에서는 배경도 인물도 **같은 흰 선**이다. 또렷하게 깔면 둘이 같은
 * 밝기로 다투고, 그러면 인물이 안 읽힌다 — 게다가 여기는 배경 위에 글까지
 * 얹히는 자리라 (역할 · 패시브 · 이름) 뒤가 밝으면 그 글도 같이 죽는다.
 *
 * 배경이 할 일은 하나다: 여기가 **자리**라는 것. 인물이 허공이 아니라 어딘가에
 * 서 있다는 것만 말하면 되고, 그건 아주 흐린 윤곽으로도 된다.
 *
 * 그림이 없으면 그냥 어둡다 (`SURF.down`). 프롬프트는 `docs/HERO_BG_PROMPT.md`.
 *
 * ## 말풍선
 *
 * 인물 머리 위에 한 마디가 뜬다 (`core/lines`). 5초 있다 사라지고, 5초 쉬었다
 * 다른 말이 뜬다. **인물을 누르면 바로 다음 말**로 넘어간다.
 *
 * 쉬는 5초가 있는 까닭은, 계속 떠 있으면 그것도 결국 무늬가 되기 때문이다.
 * 사라졌다 뜨는 것이 있어야 눈이 그때 한 번 간다.
 *
 * 여기 있던 한 줄 소개(`CharDef.quote`)를 걷고 그 자리를 이걸로 대신한다.
 * 늘 같은 한 마디는 두 번째 볼 때부터 안 읽힌다 — 자세한 까닭은 `core/lines`
 * 머리말에.
 *
 * ## 어디를 누르느냐에 따라 다른 말을 한다
 *
 * 인물 그림 통째가 과녁이고, 그 안에 **좁은 네모 둘**이 따로 있다 —
 * 머리(`HEAD`)와 가슴(`CHEST`). 어느 쪽이든 그 안을 누르면 특별한 반응 셋 중
 * 하나가 나오고 (`core/lines`) 그동안 그 자리의 그림으로 바뀐다 (`pose`).
 * 그 밖을 누르면 여느 때처럼 다음 말이다.
 *
 * **셋이 다 다르다** — 대사도 그림도. 쓰다듬는 것과 사고는 부끄러운 종류가
 * 달라서다 (까닭은 `core/lines` 머리말에).
 *
 * **몸짓은 셋이 같다** (`bob`). 어디를 누르든 인물이 한 번 눌렸다 온다 —
 * 저건 "네 손가락이 닿았다" 는 대답이지 "어디를 눌렀나" 의 답이 아니다.
 *
 * **네모는 사람마다 자리가 다르다.** 넷에게 같은 띠를 썼더니 어떤 사람은
 * 목이, 어떤 사람은 허리가 걸렸다 — 까닭과 잰 값은 `CHEST` 에 있다.
 *
 * 네모가 있다는 티는 안 낸다. 테두리도 안내도 없다 — 눌러 보다 알게 되는
 * 편이 낫고, 무엇보다 **모르고 지나가도 손해가 없다.** 어디를 눌러도 말은
 * 나온다.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useGame } from '@/state/store';
import {
  AWAKEN_COPIES, AWAKEN_ELIXIR, BATTLE_TYPE_ART, BATTLE_TYPE_NAME, CHARS, CharId,
  ELIXIR_NAME, FREE_ENHANCE, RARITY_NAME,
  battleTypeOf, canAwaken, capOf, charPower, lvCost, maxStar, starUpCost,
} from '@/core/chars';
import { fmtShort } from '@/core/currency';
import { chestOf, downOf, headOf, linesOf } from '@/core/lines';
import { passiveOf } from '@/core/passives';
import { seatRows } from '@/core/party';
import { openPicks } from '@/core/skillTree';
import { Btn, Row, Sep, Stars, T, Tag } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { FrameArt, frameStyle } from '@/ui/Frame';
import { HEART, HERO_ACT, ICONS } from '@/ui/sprites';
import { SPRITE_RATIO } from '@/ui/spriteAssets';
import { Pixel } from '@/ui/Pixel';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';
import { CharStats } from './CharStats';
import { SkillPanel } from './SkillPanel';
import { LevelUpPopup } from './LevelUpPopup';
import { BondGauge } from './BondScreen';
import { RARITY_BOND, bondStep } from '@/core/bond';
import { SkillTreePopup } from './SkillTreePopup';
import { WallpaperPopup } from './WallpaperPopup';
import { hasWallpaper } from '@/ui/wallpapers';

/**
 * 무대 — 인물이 서는 상자. 폭은 화면을 다 쓰고, **세로로 길다.**
 *
 * 높이를 값으로 박아 두는 이유는, 인물마다 그림 비율이 달라도 **무대가 안
 * 움직여야** 하기 때문이다 — 좌우로 넘길 때 상자가 늘었다 줄면 아래
 * 이름·별·레벨이 통째로 오르내린다.
 */
const STAGE_H = 320;

/**
 * 무대 위 인물 — **2:3** 이다. 오는 그림이 그 비율이라
 * (`docs/CHAR_FULL_PROMPTS.md`), 상자를 같은 비율로 잡아야 `contain` 이
 * 위아래든 좌우든 여백을 안 남긴다.
 *
 * 무대보다 낮게 잡는다. 남는 위가 등급 문장이 앉을 자리다.
 */
const FULL_H = 230;
const FULL_W = Math.round((FULL_H * 2) / 3);

/** 무대에 얹히는 글이 인물을 안 덮게 — 양옆으로 이만큼만 쓴다 */
const SIDE_W = 96;

/**
 * 좌우로 넘기는 화살표 — 무대 양 끝에 얹힌다.
 *
 * 갈 데가 없으면 흐리게 멎는다. 지우면 그 순간 인물이 좌우로 밀려서, 넘기는
 * 중에 화면이 흔들린다.
 */
function Arrow({ on, label, onPress }: {
  on: boolean; label: string; onPress: () => void;
}) {
  return (
    <Pressable
      hitSlop={8}
      disabled={!on}
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => ({
        width: 30,
        height: 30,
        borderRadius: R.round,
        borderWidth: 1,
        borderColor: LINE.mid,
        backgroundColor: pressed ? SURF.up : SURF.down,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: on ? 1 : 0.22,
      })}
    >
      <T size={15} bold>{label}</T>
    </Pressable>
  );
}

/**
 * 무대 오른쪽 위의 동그란 단추 — 인연 · 월페이퍼.
 *
 * **로고만 있다.** 글자로 두었더니 인물 밑에 여덟 자가 한 줄로 깔려서
 * 이름·별·레벨보다 무거웠다 — 자세한 까닭은 `ui/sprites` 의 `HERO_ACT` 에.
 *
 * 대신 `label` 을 읽어 주는 이름으로 넘긴다. 눈으로 못 읽는 사람에게는 로고가
 * 아무 말도 안 하므로, 화면에서 지운 글자는 여기로 옮겨야 한다.
 *
 * 화살표와 **같은 동그라미**다. 무대에 얹히는 단추는 다 같은 모양이어야
 * 그림 위에 뜬 것들이 한 벌로 읽힌다.
 */
function ActBtn({ art, label, onPress }: {
  art: keyof typeof HERO_ACT; label: string; onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => ({
        width: 30,
        height: 30,
        borderRadius: R.round,
        borderWidth: 1,
        borderColor: LINE.mid,
        backgroundColor: pressed ? SURF.up : SURF.down,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      {/*
        `assets/sprites/hero_ui/` 가 있으면 그것을, 없으면 코드 도트를 그린다.
        아래 띠와 같은 방식이다 (`BottomNav`).
      */}
      <Sprite set="hero_ui" name={art} size={17} fallback={HERO_ACT[art]} />
    </Pressable>
  );
}

/**
 * ── 사람마다 다른 자리 ── 제 그림 안에서의 비율 (`x0`·`y0`~`x1`·`y1`).
 *
 * 처음에는 넷에게 같은 띠를 썼다 (위에서 16%~34%). 등신이 비슷하니 대충
 * 맞을 줄 알았는데 안 맞았다 — 아녜스는 베일이 머리 위로 솟아 몸이 통째로
 * 내려가고, 비앙카는 토끼 귀가 그림의 5분의 1을 먹어서 더 내려간다. 이졸데는
 * 반대로 정수리가 그림 꼭대기라 제일 위에 있다. 한 띠로는 어떤 사람은 목을
 * 누르고 어떤 사람은 허리를 누른다.
 *
 * 그래서 **넷을 따로 잰다.** 그림을 10% 격자에 올려 놓고 눈으로 읽은 값이다
 * (`scratchpad/grid2.png` 를 만들어 봤다). 손으로 적은 표지만, 그림이 바뀌면
 * 다시 재야 하는 종류라 자동으로 뽑을 수가 없다 — 픽셀만 봐서는 어디가
 * 가슴인지 알 길이 없다.
 *
 * **가로도 같이 적는다.** 세로만 잡으면 리안느의 활이나 비앙카의 도끼처럼
 * 옆으로 뻗은 것을 눌러도 반응이 나온다. 몸통 폭만 과녁이어야 한다.
 *
 * 값을 고칠 일이 생기면 여기 넷만 만지면 된다.
 */
type Zone = { x0: number; y0: number; x1: number; y1: number };

/**
 * 어디를 눌렀나. `body` 는 좁은 네모 **밖**, 곧 그림 아무 데나다.
 *
 * `body` 가 갈래로 들어와 있는 까닭은 **몸짓 때문**이다. 어디를 누르든
 * 인물이 눌렸다 오므로 (`bob`), 누른 자리를 아는 것이 특별한 반응이 있는
 * 자리뿐이면 통짜를 눌렀을 때만 아무 일도 안 일어난다.
 *
 * 갈래를 늘리려면 세 곳이 짝을 이뤄야 한다 — 여기, 자리 표(`HEAD` 같은),
 * 대사 표(`core/lines`).
 */
type Touch = 'head' | 'chest' | 'body';

/**
 * ── 머리 ── 쓰다듬는 자리.
 *
 * **얼굴까지 넣는다.** 정수리만 좁게 잡으면 사람은 대개 얼굴을 누르는데,
 * 그러면 눌러도 아무 일이 없어서 그런 자리가 있다는 걸 영영 모른다. 위로는
 * 머리카락 끝(아녜스는 베일, 비앙카는 귀, 리안느는 뾰족한 귀)까지, 아래로는
 * 턱까지다.
 *
 * 가슴 과녁과 **안 겹친다.** 넷 다 이 네모의 아래끝과 저 네모의 위끝 사이가
 * 비어 있다 (턱과 가슴 사이의 목·어깨). 겹치면 나중에 그린 것이 손가락을
 * 먼저 먹으므로 한쪽이 영영 안 눌린다.
 */
const HEAD: Record<string, Zone> = {
  /* 정수리가 그림 꼭대기다. 관까지 넣는다 */
  knightgirl: { x0: 0.33, y0: 0.01, x1: 0.61, y1: 0.22 },
  /* 귀가 그림의 5분의 1을 먹는다 — 그 귀도 머리다 */
  bunnyaxe: { x0: 0.3346, y0: 0.04, x1: 0.6102, y1: 0.29 },
  /* 뾰족한 귀가 옆으로 나오고 머리 장식이 위로 솟는다 */
  elfarcher: { x0: 0.3299, y0: 0.05, x1: 0.6597, y1: 0.27 },
  /* 베일이 얼굴을 감싼다 — 그림이 좁아 가로를 많이 차지한다 */
  nun: { x0: 0.3699, y0: 0.01, x1: 0.7208, y1: 0.25 },
};

/** ── 가슴 ── 위 `HEAD` 와 같은 규칙으로 잰 값이다 */
const CHEST: Record<string, Zone> = {
  /* 정수리가 그림 꼭대기라 넷 중 제일 위 — 흉갑 한 장이 그대로 과녁이다 */
  knightgirl: { x0: 0.36, y0: 0.26, x1: 0.64, y1: 0.39 },
  /* 토끼 귀가 위를 먹어 몸이 통째로 내려간다 — 넷 중 제일 아래 */
  bunnyaxe: { x0: 0.3444, y0: 0.31, x1: 0.5905, y1: 0.42 },
  /* 활이 오른쪽으로 크게 뻗는다. 몸통은 그림 왼쪽 절반에 있다 */
  elfarcher: { x0: 0.3477, y0: 0.33, x1: 0.5795, y1: 0.45 },
  /* 향로와 연기가 오른쪽으로 나온다 — 몸통은 그만큼 왼쪽이다 */
  nun: { x0: 0.4337, y0: 0.26, x1: 0.6571, y1: 0.38 },
};

/**
 * 표에 적은 비율을 **화면 위 네모**로 옮긴다.
 *
 * 그림은 상자 안에 `contain` 으로 들어간다. 넷 다 높이가 384 라 높이가 먼저
 * 꽉 차고 좌우가 남는데, 남는 폭이 사람마다 다르다 (아녜스 96px, 비앙카
 * 149px). 그래서 비율을 그냥 상자 크기에 곱하면 좁은 사람일수록 과녁이
 * 옆으로 벌어진다.
 *
 * **그려진 그림 크기를 먼저 구하고** 거기에 곱한다. 그림 비율은 자를 때
 * 같이 적힌 값을 읽는다 (`SPRITE_RATIO` — 높이 ÷ 폭).
 *
 * **평소 그림과 부끄러운 그림이 같은 크기**라 표 하나로 둘 다 맞는다. 자를 때
 * 둘을 같은 자리에서 오려 두었기 때문이다 (`tools/sprites.config.json` 의
 * `region`+`noTrim` — 까닭은 아래 `char_shy` 쪽 주석에).
 *
 * 표에 없는 사람은 `null` 이고, 그때는 부르는 쪽이 그림 통째를 과녁으로 둔다.
 */
function zoneBox(art: string, table: Record<string, Zone>) {
  const r = table[art];
  if (!r) return null;
  const ratio = SPRITE_RATIO[`char_full/${art}`] ?? 1.5;
  const drawnH = Math.min(FULL_H, FULL_W * ratio);
  const drawnW = drawnH / ratio;
  return {
    left: (FULL_W - drawnW) / 2 + r.x0 * drawnW,
    top: (FULL_H - drawnH) / 2 + r.y0 * drawnH,
    width: (r.x1 - r.x0) * drawnW,
    height: (r.y1 - r.y0) * drawnH,
  };
}

/** 말풍선이 떠 있는 시간 · 사라져 있는 시간 */
const TALK_ON = 5000;
const TALK_OFF = 5000;

/**
 * ── 숨겨진 반응을 여는 두들김 수 ──
 *
 * 열 번이다. **손이 미끄러져서 나올 수 있는 수가 아니어야** 한다 — 두세 번이면
 * 특별한 반응을 보러 온 사람이 아니라 그냥 만지던 사람에게도 나오고, 그러면
 * 숨겨 둔 값이 사라진다.
 */
const RUN_NEED = 10;

/**
 * 두들김이 **이어진 것으로 쳐 주는** 간격 (ms).
 *
 * 1초를 넘겨 누르면 처음부터 다시 센다. 이 값이 있어야 "열 번" 이 **연속으로
 * 두들기는 일**이 되고, 없으면 하루 종일 열 번 누른 사람도 걸린다.
 */
const RUN_GAP = 1000;

/**
 * 숨겨진 반응이 서 있는 시간 (ms).
 *
 * 이 5초 동안은 **눌러도 아무 일이 안 일어난다.** 반응이 끝까지 돌아야 하기
 * 때문이다 — 중간에 다음 말로 넘어가 버리면 열 번 두들겨 얻은 것이 반 초 만에
 * 지나간다.
 */
const HIDDEN_MS = 5000;

/** 하트 하나가 뿅 하고 떠올랐다 사라지는 데 걸리는 시간 (ms) */
const HEART_MS = 1250;
/** 몇 개가 겹쳐 도나 */
const HEART_N = 8;

/**
 * ── 하트 하나 ── **뿅** 하고 나타나 떠오르다 사라진다.
 *
 * ## `뿅` 은 **크기**로 만든다
 *
 * 2색이라 반짝임도 번짐도 못 쓴다. 남는 것은 크기와 시간뿐인데, 나타나는
 * 순간에 **제 크기보다 크게 부풀었다 도로 줄면** 그게 "뿅" 이다. 처음부터
 * 제 크기로 떠 있으면 나타난 것이 아니라 **원래 있던 것**으로 보인다.
 *
 * 부풀고 줄어드는 데 한 바퀴의 앞 5분의 1만 쓴다. 길게 끌면 뿅이 아니라
 * 풍선이 부는 것이 된다.
 *
 * ## 몸 위에서는 안 보인다
 *
 * 인물도 흰 그림이고 하트도 흰색이다. 그래서 **몸 밖에서 나서 위로 뜬다** —
 * 나는 자리를 인물 어깨 높이쯤에 두고 좌우로 넓게 흩어 놓으면, 도는 동안
 * 대부분을 검은 데서 보낸다. 김을 만들 때 배운 것이 그대로 여기 쓰인다.
 */
function Heart({ w, h, i }: { w: number; h: number; i: number }) {
  const v = useRef(new Animated.Value(0)).current;

  /* 자리와 크기는 한 번만 정한다 — 매 렌더마다 굴리면 도는 중에 튄다 */
  const at = useMemo(() => {
    /* -1 ~ 1. 나는 자리가 곧 비껴 가는 쪽이다 */
    const side = ((i % 5) - 2) / 2;
    return {
      left: w * (0.5 + side * 0.38),
      /* 어깨 높이쯤에서 난다. 층지게 두어야 한 줄로 서지 않는다 */
      bottom: h * (0.34 + (i % 3) * 0.09),
      /* 크기를 섞는다 — 다 같으면 여덟이 한 벌로 보인다 */
      size: 9 + (i % 3) * 2,
      /* 떠오르며 비껴 가는 폭. 번갈아 반대쪽으로 */
      sway: (i % 2 === 0 ? 7 : -7) + side * 6,
      ms: HEART_MS + (i % 4) * 160,
      delay: (i * HEART_MS) / HEART_N,
    };
  }, [w, h, i]);

  useEffect(() => {
    const run = Animated.sequence([
      Animated.delay(at.delay),
      Animated.loop(Animated.timing(v, {
        toValue: 1, duration: at.ms, easing: Easing.out(Easing.quad), useNativeDriver: true,
      })),
    ]);
    run.start();
    return () => run.stop();
  }, [at, v]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: at.left,
        bottom: at.bottom,
        opacity: v.interpolate({
          /* 뜨는 것은 순식간, 지는 것은 천천히 — 그래야 "떠올랐다" 가 된다 */
          inputRange: [0, 0.08, 0.6, 1], outputRange: [0, 1, 0.85, 0],
        }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -h * 0.42] }) },
          {
            translateX: v.interpolate({
              inputRange: [0, 0.45, 1], outputRange: [0, at.sway, at.sway * 0.5],
            }),
          },
          {
            /* ── 뿅 ── 제 크기보다 한 번 크게 부풀었다 줄어든다 */
            scale: v.interpolate({
              inputRange: [0, 0.09, 0.2, 1], outputRange: [0.2, 1.35, 1, 0.85],
            }),
          },
        ],
      }}
    >
      <Pixel sprite={HEART} scale={at.size / 9} />
    </Animated.View>
  );
}

/**
 * ── 뿅뿅 ── 숨겨진 반응 동안 몸에서 떠오르는 하트들.
 *
 * 여덟 개가 **어긋나게 돈다.** 한꺼번에 뜨면 여덟이 한 덩어리로 맥박치고,
 * 그건 하트가 뿅뿅 하는 것이 아니라 무언가가 깜빡이는 것이다.
 *
 * 그림 **위**에 얹는다. 몸 뒤로 보내면 실루엣에 다 가려서, 인물이 넓은
 * 이졸데에서는 거의 안 보인다.
 */
function Hearts({ w, h }: { w: number; h: number }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {Array.from({ length: HEART_N }, (_v, i) => (
        <Heart key={i} w={w} h={h} i={i} />
      ))}
    </View>
  );
}

/**
 * ── 말풍선 ── 인물 머리 위에 한 마디.
 *
 * 뜨고 · 사라지고 · 다른 말로 다시 뜨는 것을 시간이 돌린다. 인물을 누르면
 * (`bump`) 기다리지 않고 바로 다음 말이다.
 *
 * ## 다음 말은 **바로 앞엣것만 피한다**
 *
 * 무작위로 고르면 같은 말이 연달아 두 번 나오는 일이 생기는데, 그러면 말풍선이
 * 안 바뀐 것처럼 보여서 "고장" 으로 읽힌다. 순서를 통째로 섞어 돌리는 방법도
 * 있지만 열 줄짜리에 그건 과하다 — 앞엣것 하나만 피하면 충분하다.
 */
function useTalk(
  id: string,
  lines: readonly string[],
  react: Readonly<Partial<Record<Touch, readonly string[]>>>,
  /** 같은 자리를 한 번 더 눌렀을 때 — 주저앉아서 하는 말 */
  deep: Readonly<Partial<Record<Touch, readonly string[]>>>,
) {
  const [at, setAt] = useState(() => Math.floor(Math.random() * lines.length));
  const [on, setOn] = useState(true);
  /**
   * 만져서 나온 한 마디. 있으면 이게 평소 대사를 **덮는다.**
   *
   * 목록의 번호가 아니라 글 자체를 들고 있다. 만졌을 때 대사는 셋뿐이라
   * 번호로 돌리면 순서가 뻔히 보이는데, 그러면 세 번 만에 다 본 것이 아니라
   * **세 번 만에 규칙이 들킨다.**
   *
   * **어디를 눌렀는지도 같이 든다** (`how`). 몸짓이 머리 쪽에만 붙기 때문인데,
   * 글만 들고 있으면 부르는 쪽이 그걸 대사 내용으로 되짚어야 한다.
   */
  const [shy, setShy] = useState<{ text: string; how: Touch; deep: boolean } | null>(null);
  /**
   * 눌린 횟수.
   *
   * 시계를 다시 걸 때가 되었다는 신호다. 같은 대사가 두 번 연달아 뽑히면
   * `shy` 값이 안 바뀌어서 시계가 안 풀리는데, 이 값은 늘 바뀌므로 그때도
   * 5초가 새로 시작된다.
   */
  const [beat, setBeat] = useState(0);
  /**
   * **사람이** 누른 횟수. 몸짓이 이 값에 붙는다 (`bob`).
   *
   * `beat` 로는 안 된다. 저건 시계가 스스로 다음 말로 넘길 때도 오르므로,
   * 저기에 몸짓을 걸면 아무도 안 만졌는데 10초마다 인물이 움찔한다.
   */
  const [poke, setPoke] = useState(0);
  /**
   * ── 연속으로 몇 번 두들겼나 ── 숨겨진 반응의 자물쇠 (`RUN_NEED`).
   *
   * `useState` 가 아니라 `useRef` 다. 화면에 안 나오는 값이고, 무엇보다 누를
   * 때마다 다시 그리면 열 번 두들기는 동안 열 번 그려야 한다.
   *
   * `how` 를 같이 든다 — **같은 자리를** 열 번이어야 한다. 가슴 다섯 번에
   * 머리 다섯 번은 열 번이 아니다.
   */
  const run = useRef<{ how: Touch; n: number; at: number }>({ how: 'body', n: 0, at: 0 });
  /** 숨겨진 반응이 끝나는 시각 — 그때까지 손가락을 안 받는다 */
  const lock = useRef(0);

  /* 사람이 바뀌면 처음부터 — 앞사람의 말이 남아 있으면 안 된다 */
  useEffect(() => {
    setAt(Math.floor(Math.random() * lines.length));
    setOn(true);
    setShy(null);
    /* 세던 것과 잠금도 같이 푼다 — 앞사람의 두들김이 뒷사람에게 넘어가면 안 된다 */
    run.current = { how: 'body', n: 0, at: 0 };
    lock.current = 0;
  }, [id, lines.length]);

  const bump = () => {
    setShy(null);
    setAt((i) => (lines.length < 2 ? i : (i + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length));
    setOn(true);
    setBeat((n) => n + 1);
  };

  /*
    만졌다 — 대사가 없는 사람은 그냥 다음 말로 넘긴다. 눌렀는데 아무 일도
    안 일어나는 것보다 낫다.
  */
  const touch = (how: Touch) => {
    const now = Date.now();
    /*
      ── 숨겨진 반응이 도는 동안은 **손가락을 안 받는다** ──

      몸짓도 대사도 안 바뀐다. 반응이 끝까지 돌아야 하기 때문이다 — 눌러서
      다음 말로 넘어가 버리면 열 번 두들겨 얻은 것이 반 초 만에 지나간다.
    */
    if (now < lock.current) return;

    /* 눌린 것부터 센다 — 대사가 없는 자리라도 몸짓은 나가야 한다 */
    setPoke((n) => n + 1);

    /*
      ── 연속 두들김을 센다 ──

      같은 자리를 `RUN_GAP` 안에 이어서 눌러야 는다. 자리가 바뀌거나 손이
      쉬면 하나부터 다시다.
    */
    const r = run.current;
    const same = r.how === how && now - r.at <= RUN_GAP;
    run.current = { how, n: same ? r.n + 1 : 1, at: now };

    /*
      ── 열 번을 채웠다 ── 주저앉는다 (`char_down`).

      몸 아무 데나(`body`)로는 안 열린다. 좁은 과녁을 열 번 맞히는 것이
      이 반응을 찾는 일의 전부인데, 통짜로 열리면 아무나 걸린다.
    */
    const hit = how !== 'body' && run.current.n >= RUN_NEED;
    if (hit) {
      run.current = { how, n: 0, at: now };
      lock.current = now + HIDDEN_MS;
    }

    const say = (hit ? deep[how] : react[how]) ?? [];
    if (!say.length) { bump(); return; }
    setShy({ text: say[Math.floor(Math.random() * say.length)] ?? '', how, deep: hit });
    setOn(true);
    setBeat((n) => n + 1);
  };

  /*
    떠 있으면 5초 뒤에 지우고, 지워져 있으면 5초 뒤에 다음 말로 띄운다.

    지울 때 부끄러운 얼굴도 같이 푼다 — 말풍선은 사라졌는데 얼굴만 계속
    붉어 있으면 왜 저러고 있는지 알 수가 없다.
  */
  useEffect(() => {
    const t = setTimeout(() => {
      if (on) { setOn(false); setShy(null); }
      else bump();
      /*
        숨겨진 반응은 **제 시간을 쓴다** (`HIDDEN_MS`). 잠금과 같은 값이라
        (`touch`) 손가락이 다시 먹히는 순간과 그림이 풀리는 순간이 같다 —
        갈리면 눌러도 아무 일이 없는 어정쩡한 틈이 생긴다.
      */
    }, on ? (shy?.deep ? HIDDEN_MS : TALK_ON) : TALK_OFF);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, at, beat, id]);

  return {
    text: shy?.text ?? lines[at] ?? '',
    on,
    shy: !!shy,
    /** 방금 어디를 눌렸나 — 아무것도 아니면 `null` */
    how: shy?.how ?? null,
    /** 주저앉았나 — 같은 자리를 한 번 더 눌렀을 때 (`char_down`) */
    deep: !!shy?.deep,
    /** 몸짓을 다시 트는 신호. 같은 자리를 연달아 눌러도 이 값은 늘 바뀐다 */
    poke,
    touch,
  };
}

/**
 * 말풍선 한 덩이 — 상자와 꼬리.
 *
 * 꼬리는 **네모를 45도 돌린 것**이다. 삼각형을 그리는 방법이 따로 없어서
 * (`borderWidth` 로 흉내 내는 손은 1-bit 테두리와 안 맞는다) 마름모를 상자
 * 밑에 반쯤 물려 놓고, 위쪽 절반은 상자가 덮게 둔다. 남는 아래쪽 두 변이
 * 꼬리가 된다.
 */
function Bubble({ text }: { text: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={[
          BORDER,
          {
            maxWidth: 200,
            paddingHorizontal: SP.sm,
            paddingVertical: SP.xs,
            borderColor: LINE.hi,
            /* 무대 위라 불투명해야 한다 — 인물이 비치면 글이 안 읽힌다 */
            backgroundColor: '#0E0E0E',
          },
        ]}
      >
        <T size={FS.tiny} center numberOfLines={2}>{text}</T>
      </View>
      {/*
        꼬리 — 상자 아래로 반쯤만 나온다. 위쪽 절반은 상자가 덮으므로
        `marginTop` 이 음수다.
      */}
      <View
        style={{
          width: 8,
          height: 8,
          marginTop: -5,
          transform: [{ rotate: '45deg' }],
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: LINE.hi,
          backgroundColor: '#0E0E0E',
        }}
      />
    </View>
  );
}

/**
 * 무대 왼쪽 위의 한 줄 — 로고 하나에 이름 하나.
 *
 * 역할과 패시브가 여기 선다. **수치가 아니라 성격**이라 무대에 얹는다 —
 * 아래 격자는 오르내리는 숫자를 보는 자리이고, 이 둘은 이 사람이 어떤
 * 사람인지라 인물 옆이 맞다.
 */
function SideRow({ set, art, text }: { set: string; art: string; text: string }) {
  return (
    <Row gap={5} style={{ alignItems: 'center', marginBottom: 5 }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: R.round,
          borderWidth: 1,
          borderColor: LINE.low,
          backgroundColor: SURF.down,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sprite set={set} name={art} size={13} />
      </View>
      <T size={FS.tiny} numberOfLines={1} style={{ flexShrink: 1 }}>{text}</T>
    </Row>
  );
}

/**
 * ── 키우는 단추 ── 이름 위, 값 아래.
 *
 * 시안의 `승급 2/5` · `레벨업 15/100` 이다. 값을 이름 밑에 따로 두는 이유는,
 * 저 둘이 **다른 것을 센다**는 것이 한 줄에 있으면 안 보이기 때문이다 —
 * 승급은 조각을 세고 레벨업은 골드를 센다.
 *
 * 낼 수 있으면 테두리가 밝아진다. 흑백에서 "지금 누를 수 있다" 를 말하는
 * 방법이 그것뿐이다.
 */
function GrowBtn({ label, now, need, art, icon, on, onPress }: {
  label: string;
  now: string;
  need: string;
  /** `assets/sprites/growth/` 안의 이름 */
  art?: string;
  /** 그림이 없는 재화용 코드 도트 (골드) */
  icon?: typeof ICONS.coin;
  /** 지금 낼 수 있나 */
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      style={({ pressed }) => [
        BORDER,
        {
          flex: 1,
          paddingVertical: SP.xs + 1,
          paddingHorizontal: SP.xs,
          alignItems: 'center',
          gap: 2,
          borderColor: on ? LINE.hi : LINE.low,
          backgroundColor: pressed || on ? SURF.up : 'transparent',
          opacity: on ? 1 : 0.55,
        },
      ]}
    >
      <T size={FS.label} bold>{label}</T>
      <Row gap={3} style={{ alignItems: 'center' }}>
        {!!art && <Sprite set="growth" name={art} size={10} opacity={O.sub} />}
        {!art && !!icon && <Pixel sprite={icon} scale={10 / 8} opacity={O.sub} />}
        <T size={FS.tiny} dim="sub" numberOfLines={1}>{`${now} / ${need}`}</T>
      </Row>
    </Pressable>
  );
}

export function HeroManage({ pick, onPick, onBond }: {
  /** 지금 보고 있는 사람. 없으면 첫 사람 */
  pick: CharId | null;
  onPick: (id: CharId) => void;
  /** 하트를 눌렀다 — 인연 화면으로 넘어간다 (`BondScreen`) */
  onBond: (id: CharId) => void;
}) {
  const raw = useGame((s) => s.chars);
  const party = useGame((s) => s.pendingParty ?? s.party);
  const form = useGame((s) => s.formation);
  const money = useGame((s) => s.money);
  const elixir = useGame((s) => s.elixir);
  const bonds = useGame((s) => s.bonds);
  const starUp = useGame((s) => s.starUp);
  const awaken = useGame((s) => s.awaken);
  const toast = useGame((s) => s.toast);

  /*
    ── 대형에 앉힌 명부를 쓴다 ──

    파티에 서 있는 사람은 줄 배수를 받는다 (`seatRows`). 수치 절이 그걸
    셈하므로 (`CharStats`) 여기서도 같은 몸을 넘겨야 한다 — 맨 몸을 넘기면
    앞줄에 선 사람의 방어력이 화면에서만 낮게 뜬다.
  */
  const chars = useMemo(() => seatRows(party, raw, form), [party, raw, form]);

  /** 스킬 트리를 보고 있나 */
  const [tree, setTree] = useState(false);
  /** 월페이퍼를 보고 있나 */
  const [paper, setPaper] = useState(false);
  /** 레벨업 창을 열었나 (`LevelUpPopup`) */
  const [lvUp, setLvUp] = useState(false);

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
  /* 인연 레벨 — 아직 아무 사이도 아니면 0 이다 (`GameState.bonds`) */
  const bondLv = (id ? bonds[id]?.lv : 0) ?? 0;

  /*
    ── 이 사람이 할 수 있는 말들 ── 첫 줄이 `quote` 다 (`core/lines`).

    **이른 반환보다 위**에 있어야 한다. 아래 `if (!c || !d)` 뒤에 두면, 가진
    캐릭터가 없는 판에서 훅을 건너뛰게 되어 그다음 렌더에서 훅 차례가 어긋난다.
    그래서 없을 수도 있는 값을 빈 것으로 받아 둔다 — 어차피 그때는 말풍선을
    안 그린다.
  */
  const lines = useMemo(() => linesOf(id ?? '', d?.quote), [id, d?.quote]);
  const react = useMemo(
    () => ({ head: headOf(id ?? ''), chest: chestOf(id ?? '') }),
    [id],
  );
  /*
    ── 열 번 두들겼을 때 ── **머리와 가슴 둘 다**.

    가슴에만 달아 두었다가 고쳤다. 그러면 머리를 열 번 두들긴 사람에게는
    할 말이 없어서 (`touch` 의 `say.length` 가 0), 그냥 다음 평소 대사로
    넘어가 버렸다 — 열 번을 채웠는데 아무 일도 안 일어나는 것이 아니라
    **엉뚱한 자세가 나왔다** (쓰다듬는 그림 그대로였다).

    두 자리가 같은 말을 쓴다. 이 칸은 어디를 만졌느냐가 아니라 **너무 오래
    만졌다**가 이유라, 자리마다 다른 말을 할 자리가 아니다.
  */
  const deep = useMemo(
    () => ({ head: downOf(id ?? ''), chest: downOf(id ?? '') }),
    [id],
  );
  const talk = useTalk(id ?? '', lines, react, deep);
  /*
    이 사람의 좁은 과녁 둘이 화면 어디인가 (`HEAD` · `CHEST`).

    이것도 **이른 반환보다 위**다. 위 셋과 같은 까닭이고, 없을 수도 있는 값을
    빈 문자열로 받아 둔다 — 표에 없으면 `null` 이라 그때는 안 그린다.
  */
  const head = useMemo(() => zoneBox(d?.art ?? '', HEAD), [d?.art]);
  const chest = useMemo(() => zoneBox(d?.art ?? '', CHEST), [d?.art]);

  /**
   * ── 지금 어느 그림인가 ── 평소 · 부끄러움 · 쓰다듬김.
   *
   * 셋이 **같은 자리에서 오려낸 같은 크기**라 갈아 끼워도 인물이 안 움직인다
   * (`tools/sprites.config.json` 의 `region`+`noTrim` — 까닭은 아래 `Sprite`
   * 주석에). 그래서 과녁 표(`HEAD`·`CHEST`) 하나가 셋 다에 맞는다.
   *
   * `back` 은 **그 그림이 아직 없을 때** 대신 그릴 것이다. 머리 쪽 그림이 안
   * 들어와 있으면 부끄러운 그림으로 떨어지고, 그러면 대사와 몸짓만 갈린다 —
   * 눌렀는데 빈자리가 뜨는 것보다 낫다.
   */
  const pose = useMemo(() => {
    /* 주저앉은 것이 제일 세다 — 다른 무엇보다 먼저 본다 */
    if (talk.deep) return { set: 'char_down', back: 'char_shy' };
    if (talk.how === 'head') return { set: 'char_pat', back: 'char_shy' };
    if (talk.shy) return { set: 'char_shy', back: 'char_full' };
    return { set: 'char_full', back: 'avatar' };
  }, [talk.deep, talk.how, talk.shy]);

  /**
   * ── 누르면 눌렸다 온다 ── **어디를 누르든.**
   *
   * 처음에는 머리 쪽에만 달았다. 머리와 가슴이 같은 그림을 쓰던 때라, 어느
   * 쪽을 눌렀는지 화면에 남기려던 것이었다. 그런데 그러면 **통짜를 눌렀을 때만
   * 아무 반응이 없어서**, 손가락이 닿았는지 아닌지가 그때만 불확실해진다.
   *
   * 지금은 셋 다 같은 몸짓이다. 몸짓은 "네 손가락이 닿았다" 는 대답이지 "어디를
   * 눌렀나" 의 답이 아니다 — 그건 대사와 얼굴이 말한다.
   *
   * 손이 닿는 만큼만 내려갔다 온다. 두 번 눌리는 것은 **한 번은 그냥 움직임**
   * 이지만 두 번이면 쓰다듬는 것이 되기 때문이다. 4px 과 3px 로 두 번째를
   * 얕게 두는 것도 같은 까닭 — 같은 깊이로 두 번이면 튕기는 것으로 보인다.
   *
   * 그림만 움직인다. 과녁까지 같이 움직이면 몸짓 도중에 누른 손가락이 다른
   * 데로 떨어진다.
   */
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    /* 첫 렌더에는 아무도 안 눌렀다 — 화면에 들어오자마자 움찔하면 안 된다 */
    if (!talk.poke) return undefined;
    const dip = (to: number, ms: number) => Animated.timing(bob, {
      toValue: to, duration: ms, easing: Easing.out(Easing.quad), useNativeDriver: true,
    });
    bob.setValue(0);
    const run = Animated.sequence([dip(4, 90), dip(0, 130), dip(3, 90), dip(0, 160)]);
    run.start();
    /* 사람을 바꾸거나 다시 누르면 하던 몸짓을 접고 제자리로 */
    return () => { run.stop(); bob.setValue(0); };
  }, [talk.poke, bob]);

  if (!c || !d) {
    return (
      <View style={{ paddingVertical: SP.xl, alignItems: 'center' }}>
        <T size={11} dim="sub">아직 가진 캐릭터가 없습니다.</T>
      </View>
    );
  }

  const pv = passiveOf(c.id);
  const picks = openPicks(c.id, c.star, c.tree);

  /* 레벨은 성이 정한 상한까지만 오른다 (`capOf`) */
  const capped = c.lv >= capOf(c);

  /*
    ── 승급 칸은 셋 중 하나다 ──

    성이 남았으면 합성, 성은 다 채웠고 각성이 남았으면 각성, 둘 다 끝났으면
    아무것도 안 그린다.

    마지막 경우에 `Epic 등급이 갈 수 있는 마지막 성입니다` 를 띄웠었다. 맞는
    말인데 **아무것도 시키지 않는 말**이라, 키우는 줄에 못 키운다는 안내만
    남았다. 지금은 칸째 사라진다 — 없는 것이 곧 그 뜻이다.
  */
  const maxed = c.star >= maxStar(d.rarity);
  const awakening = maxed && canAwaken(d.rarity) && !c.awake;
  const starNode = !maxed ? (
    <GrowBtn
      label="승급"
      now={`${c.copies}`}
      need={`${starUpCost(c.star)}`}
      art="shard"
      on={c.copies >= starUpCost(c.star)}
      onPress={() => {
        const r = starUp(c.id);
        if (r === 'short') toast('조각이 부족합니다', 'bad');
        if (r === 'up') toast(`${d.name} ${c.star + 1}성!`, 'good');
      }}
    />
  ) : awakening ? (
    <GrowBtn
      label="각성"
      now={`${c.copies}·${elixir}`}
      need={`${AWAKEN_COPIES}·${AWAKEN_ELIXIR}`}
      art="elixir"
      on={c.copies >= AWAKEN_COPIES && elixir >= AWAKEN_ELIXIR}
      onPress={() => {
        const r = awaken(c.id);
        if (r === 'short') toast(`조각이나 ${ELIXIR_NAME}이 부족합니다`, 'bad');
        if (r === 'ok') toast(`${d.name} 각성!`, 'good');
      }}
    />
  ) : null;

  return (
    <>
      <SkillTreePopup who={tree ? c.id : null} onClose={() => setTree(false)} />
      <WallpaperPopup
        charId={paper ? c.id : null}
        name={d.name}
        onClose={() => setPaper(false)}
      />

      {/*
        ── 무대 ── 인물 · 등급 · 역할 · 단추 · 화살표가 이 상자 하나에 겹친다.

        목록에서 고르는 것보다 좌우로 넘기는 쪽이 맞다. 가진 사람이 넷 안팎이라
        목록을 따로 둘 만큼 많지 않고, 넘기는 동안 **바로 앞뒤 사람과 견주게**
        된다 — 누구를 키울까가 원래 그런 비교다.

        인물은 바닥에 붙여 세운다 (`flex-end`). 전신은 발이 아래에 있는 그림
        이라 가운데로 맞추면 사람마다 발 높이가 달라지고, 좌우로 넘길 때마다
        인물이 위아래로 흔들린다.
      */}
      <View
        style={{
          height: STAGE_H,
          borderRadius: R.md,
          overflow: 'hidden',
          backgroundColor: SURF.down,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {/*
          ── 배경 ── **늘 같은 한 장**이다.

          사람마다 다른 곳에 세우면 넘길 때 장소가 바뀌어서, 바뀐 것이
          사람인지 화면인지가 안 갈린다. 여기는 넷을 견주는 자리라 뒤가
          고정이어야 앞이 비교된다.

          `stretch` 로 늘린다 — 배경은 상자에 빈틈없이 들어차야 하고, 먼
          풍경은 조금 늘어나도 안 보인다 (`Sprite` 의 `fit`).

          맨 처음 그린다. 뒤에 오는 것들(인물 · 글 · 단추)이 전부 이 위에
          얹혀야 한다.
        */}
        <Sprite
          set="bg_hero"
          name="hall"
          size={STAGE_H}
          fit="stretch"
          opacity={0.22}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/*
          전신이 없는 사람은 흉상이 대신 선다 (`fallbackSet`). 상자 크기가
          값으로 박혀 있으므로 (`FULL_W`·`FULL_H`) 어느 쪽이 서든 자리는
          안 움직인다.

          그림마다 **가로 비율이 다르다** — 아녜스는 치맛단이 좁은 종이라
          142x384 이고 비앙카는 246x384 다 (`SPRITE_RATIO`). `contain` 이
          높이를 맞추므로 넷 다 상자 높이를 꽉 채우고, 좁은 사람은 좌우가
          빌 뿐이다. 발 높이는 넷이 같다.
        */}
        {/*
          ── 인물이 과녁이다 ── 머리 · 가슴 · 그 밖.

          말풍선 자체를 과녁으로 두면 사라져 있는 5초 동안 누를 데가 없어진다.
          그래서 그림 통째가 과녁이고, 그 안에 좁은 네모 둘이 얹힌다.

          가르는 티는 안 낸다 — 테두리도 안내도 없다. 눌러 보다 알게 되는
          편이 낫고, 모르고 지나가도 손해가 없다: 어디를 눌러도 말은 나온다.
        */}
        <View style={{ width: FULL_W, height: FULL_H, marginBottom: SP.sm }}>
          {/*
            몸짓이 실리는 것은 **그림뿐이다** (`bob`). 과녁은 아래에 가만히
            있으므로, 고개가 눌리는 동안 누른 손가락이 다른 데로 안 떨어진다.
          */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: FULL_W,
              height: FULL_H,
              transform: [{ translateY: bob }],
            }}
          >
            <Sprite
              /*
                무엇을 그릴지는 위에서 골랐다 (`pose`). 프롬프트는
                `docs/CHAR_SHY_PROMPTS.md` 와 `docs/CHAR_PAT_PROMPTS.md`.

                ── 세 그림은 **같은 자리에서 오려 냈다** ──

                한동안 각자 여백을 깎았더니 (`trim`) 갈아 끼울 때 인물이 튀었다.
                비앙카는 부끄러운 쪽에서 귀가 접혀 위쪽 경계가 귀끝에서 머리로
                바뀌므로 몸이 통째로 올라갔고, 아녜스는 향로가 옆으로 나와 오른쪽
                경계가 넓어지므로 몸이 왼쪽으로 밀렸다. 그림은 멀쩡한데 **깎는
                기준이 서로 달랐던** 것이다.

                지금은 셋의 경계를 합쳐 그 한 자리로 셋 다 오린다 (`region`)
                — 여백은 안 깎는다 (`noTrim`). 그래서 세 그림의 크기가 픽셀까지
                같고, 갈아 끼워도 인물이 안 움직인다.
              */
              set={pose.set}
              name={d.art}
              fallbackSet={pose.back}
              size={FULL_W}
              style={{ width: FULL_W, height: FULL_H }}
            />
          </Animated.View>
          {/* 숨겨진 반응 동안만 하트가 뜬다 (`talk.deep`) */}
          {talk.deep && <Hearts w={FULL_W} h={FULL_H} />}
          {/*
            아래에 **통째로 깔린 과녁**이 말 걸기다. 그 위에 좁은 네모 둘을
            얹어 특별한 반응을 받는다 — 나중에 그린 것이 손가락을 먼저 먹으므로
            네모 안이면 네모가, 밖이면 통짜가 받는다.

            그래서 통짜를 여러 조각으로 쪼갤 것이 없다. 네모 위아래를 따로
            만들면 인물 그림이 바뀔 때마다 여러 값을 다 맞춰야 한다.
          */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${d.name}에게 말 걸기`}
            onPress={() => talk.touch('body')}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          {/*
            좁은 과녁은 **사람마다 자리가 다르다** (`HEAD` · `CHEST`). 표에 없는
            사람은 안 그린다 — 그러면 아래 깔린 통짜가 다 받아서, 어디를
            눌러도 평소 대사가 나온다.

            둘은 안 겹치므로 (`HEAD` 주석) 그리는 차례는 상관없다.
          */}
          {!!head && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${d.name}의 머리를 쓰다듬기`}
              onPress={() => talk.touch('head')}
              style={{ position: 'absolute', ...head }}
            />
          )}
          {!!chest && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${d.name}에게 짓궂게 굴기`}
              onPress={() => talk.touch('chest')}
              style={{ position: 'absolute', ...chest }}
            />
          )}
        </View>

        {/*
          ── 등급 문장 ── 한가운데 위.

          아래 이름 옆에도 등급 딱지가 붙는다. 같은 말이 두 번인 것은 맞는데,
          문장은 **읽는 것이 아니라 알아보는 것**이다 — 신화는 신화의 모양이
          있어서 글자를 안 읽어도 갈린다. 딱지는 그 모양을 아직 모르는 사람을
          위한 이름표다.

          **글자는 안 붙인다.** 문장 밑에 `에픽` 이라고 적어 뒀었는데, 왼쪽
          딱지가 이미 같은 말을 하고 있어서 한 화면에 세 번이었다. 그리고
          그 한 줄만큼 문장 덩이가 아래로 내려와 말풍선과 부딪혔다 — 여기서
          제일 좁은 것이 세로다.
        */}
        <View style={{ position: 'absolute', top: SP.xs, alignItems: 'center' }}>
          <Sprite set="rarity" name={d.rarity} size={26} />
        </View>

        {/*
          ── 왼쪽 위 ── 이 사람이 **어떤 사람인가.**

          역할과 패시브, 그 아래 등급과 이름. 수치가 아니라 성격이라 인물
          옆에 둔다 — 아래 격자는 오르내리는 숫자를 보는 자리다.

          폭을 `SIDE_W` 로 묶는다. 안 묶으면 긴 패시브 이름이 인물 쪽으로
          자라서 얼굴을 덮는다.
        */}
        <View style={{ position: 'absolute', left: SP.sm, top: SP.sm, width: SIDE_W }}>
          <SideRow
            set="role_icon"
            art={BATTLE_TYPE_ART[battleTypeOf(c.id)]}
            text={BATTLE_TYPE_NAME[battleTypeOf(c.id)]}
          />
          {!!pv && <SideRow set="passive_icon" art={pv.art} text={pv.name} />}

          <View style={{ marginTop: SP.sm, alignItems: 'flex-start' }}>
            <Tag
              label={RARITY_NAME[d.rarity]}
              fill={d.rarity === 'mythic' || d.rarity === 'legendary'}
            />
            <T size={FS.hero} bold numberOfLines={1} style={{ marginTop: 2 }}>{d.name}</T>
            {/*
              ── 인연 ── 이름 바로 밑 (`core/bond`).

              **단계 이름과 하트를 같이** 둔다. 하트만 있으면 몇 칸인지는
              세어야 알고, 이름만 있으면 다음 칸이 코앞인지 한참인지 모른다.
              둘이 붙어 있으면 한 번에 읽힌다.

              누르면 인연 화면으로 간다 — 오른쪽 위의 하트 단추와 같은 곳이다.
              여기서도 눌리는 까닭: 이 줄이 곧 그 화면의 요약이라, 더 보고
              싶은 사람의 손가락이 제일 먼저 닿는 자리다.
            */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${d.name}와의 인연 보기`}
              onPress={() => { sfx('tap'); onBond(c.id); }}
              style={({ pressed }) => ({
                marginTop: 3,
                opacity: pressed ? O.sub : 1,
              })}
            >
              <Row gap={SP.xs} style={{ alignItems: 'center' }}>
                <BondGauge lv={bondLv} cap={RARITY_BOND[d.rarity]} size={9} />
                <T size={FS.tiny} dim="sub">{bondStep(bondLv).name}</T>
              </Row>
            </Pressable>
          </View>
        </View>

        {/*
          ── 오른쪽 위 ── 얼굴에 붙는 것들.

          ## 코스튬을 걷었다

          자리만 잡아 두고 "준비중" 을 띄우고 있었다. 걷은 까닭은 **그림 값이
          너무 크기 때문**이다 — 사람 하나에 옷 한 벌을 더 입히려면 전투
          스물세 칸에 흉상과 서 있는 그림 넷까지 스물일곱 장이 필요하다
          (`docs/BIANCA_BASE_SKIN.md` 에 세어 두었다). 넷이면 백여 장이다.

          **자리를 미리 잡는 것에도 값이 있어야 한다.** 곧 채울 자리라면 미리
          잡아 두는 편이 낫지만, 언제 채울지 모르는 자리는 "눌러도 아무 일이
          없는 단추" 로 남는다. 그건 화면에 있는 것보다 없는 것이 낫다.

          인연은 남겼다. 저건 그림이 아니라 글과 수치라 값이 다르다.

          월페이퍼는 **그림이 있는 사람에게만** 뜬다 (`hasWallpaper`). 없는
          사람에게 안 눌리는 단추를 남겨 두면, 그게 "아직 안 나왔다" 인지
          "고장" 인지 알 수가 없다.
        */}
        <View style={{ position: 'absolute', right: SP.sm, top: SP.sm, gap: SP.xs }}>
          <ActBtn art="bond" label="인연" onPress={() => onBond(c.id)} />
          {hasWallpaper(c.id) && (
            <ActBtn art="paper" label="월페이퍼" onPress={() => setPaper(true)} />
          )}
        </View>

        {/*
          ── 화살표는 무대 **위에** 얹힌다 ──

          밖에 두면 인물이 설 폭이 화살표 둘만큼 좁아진다. 양 끝에 붙여 두면
          무대가 폭을 다 쓰고, 인물은 가운데에서 안 밀린다.

          `box-none` 이라 이 투명한 판은 손가락을 안 먹는다 — 안 그러면 무대
          전체가 판에 덮여서 아래 있는 단추들이 안 눌린다.
        */}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: SP.sm,
            right: SP.sm,
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Arrow on={at > 0} label="‹" onPress={() => onPick(owned[at - 1])} />
          <Arrow on={at < owned.length - 1} label="›" onPress={() => onPick(owned[at + 1])} />
        </View>

        {/*
          ── 말풍선 ── **맨 마지막에 그린다.**

          무대에 얹힌 것 중 제일 위여야 한다. 앞에 그리면 화살표 판이나 인물
          위로 올라오는 것들에 가린다.

          자리는 왼쪽 글 다음, 오른쪽 단추 앞 — 그 사이가 인물 머리 위이고,
          여기 말고는 셋 중 하나를 덮는다. 손가락도 안 먹는다: 누르는 것은
          말풍선이 아니라 인물이다.
        */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: SIDE_W + SP.sm,
            right: 44,
            /*
              ── 위가 아니라 **머리에서** 잰다 ──

              한동안 무대 위쪽에서 쟀는데 (`top`), 거기는 등급 문장이 앉은
              자리라 둘이 겹쳤다. 말풍선은 두 줄이 되면 아래로 자라므로
              위에서 재면 자랄수록 문장 쪽으로 밀려 올라간다.

              바닥에서 재면 반대다. 아래 끝이 **인물 머리에 못 박히고**
              두 줄짜리는 위로 자란다 — 꼬리는 늘 머리를 가리키고, 자라는
              쪽은 빈 하늘이다.

              4px 만큼 머리에 물린다. 딱 붙이면 사이에 검은 틈이 보여서
              말풍선이 인물과 상관없이 떠 있는 것처럼 보인다.
            */
            bottom: FULL_H + SP.sm - 4,
            alignItems: 'center',
            opacity: talk.on && talk.text ? 1 : 0,
          }}
        >
          {!!talk.text && <Bubble text={talk.text} />}
        </View>
      </View>

      {/*
        ── 이름표 ── 무대 바로 아래. 별 하나에 상자 하나.

        별은 무대에 안 얹는다. 저건 **오르는 것**이라 아래 승급 단추와 세로로
        이어져 보여야 하고, 무대에 얹으면 그림의 일부처럼 굳어 보인다.
      */}
      <View style={{ alignItems: 'center', marginTop: SP.sm }}>
        <Stars star={c.star} max={maxStar(d.rarity)} awake={c.awake} size={14} />
        <Row gap={SP.xs} style={{ marginTop: SP.xs, alignItems: 'center' }}>
        {/*
          ── 레벨업은 레벨 **바로 옆**이다 ──

          맨 아래 승급 옆에 있었다. 거기서는 "키우는 일 둘" 로 나란히 서서
          말이 됐지만, 정작 **무엇이 올라가는지**(Lv 18 / 100)는 화면 위쪽에
          따로 있었다 — 누르는 자리와 바뀌는 자리가 멀면 눌러 놓고 위를 다시
          봐야 한다.

          지금은 붙어 있다. 누르면 창이 뜨고 (`LevelUpPopup`), 닫고 나면 바로
          옆의 숫자가 바뀌어 있다.
        */}
        <Btn
          label="레벨업"
          size="sm"
          fill={!capped}
          disabled={capped}
          onPress={() => { sfx('tap'); setLvUp(true); }}
        />
        <Row
          gap={SP.sm}
          style={[
            BORDER,
            {
              paddingVertical: SP.xs,
              paddingHorizontal: SP.md,
              alignItems: 'baseline',
              backgroundColor: SURF.up,
            },
          ]}
        >
          {/*
            레벨과 전투력을 **칸막이로** 가른다. 한 줄에 숫자가 넷이라
            어디까지가 레벨인지 안 갈렸다 — 특히 `/ 50` 과 전투력이 붙어
            있으면 한 덩어리로 읽힌다.
          */}
          <T size={FS.body} bold>{`Lv ${c.lv}`}</T>
          <T size={FS.tiny} dim="dim">{`/ ${capOf(c)}`}</T>
          <View style={{ width: 1, height: 10, backgroundColor: WHITE, opacity: 0.14 }} />
          <T size={FS.tiny} dim="sub">전투력</T>
          <T size={FS.body} bold>{charPower(c).toLocaleString()}</T>
        </Row>
        </Row>
      </View>

      <Sep />

      {/*
        ── 무엇을 쓰나 ──

        머리말에 **`현재 채용중인 스킬`** 이라고 적는다. 아래 칸에 뜨는 것이
        이 사람이 가진 기술 전부가 아니라 **지금 쓰고 있는 것**이라서다 —
        트리에서 갈래를 고르면 여기 뜨는 것이 바뀐다 (`skillsFor`). 그 말이
        없으면 트리를 찍고 와서 "왜 아까 본 기술이 없지" 가 된다.

        칸은 시안처럼 가로로 선다 (`grid`). 줄로 늘어놓으면 기술 넷이 세로를
        그만큼 먹고, 그만큼 아래 수치와 키우는 줄이 밀린다. 자세한 것은 칸을
        누르면 아래에 펴진다.
      */}
      <Row between style={{ marginBottom: SP.xs, alignItems: 'center' }}>
        <T size={FS.title} bold>현재 채용중인 스킬</T>
        {/*
          ── 스킬 트리로 가는 문 ── **여기가 제자리다.**

          맨 아래 키우는 줄에 동그라미로 달아 뒀었다. 그런데 저건 골드나
          조각을 치르는 일이 아니라 **무엇을 쓸까를 고르는 일**이라, 승급·
          레벨업과 나란히 있으면 셋 다 같은 종류로 읽힌다.

          지금 쓰는 기술 바로 옆이 맞다. 목록은 "지금 무엇을 쓰나" 를, 트리는
          "무엇으로 바꿀까" 를 말하므로 둘이 한 줄에 있어야 이어진다.

          찍을 것이 남았으면 채워진다 — 성만 되면 저절로 열리던 것이 골라야
          열리는 것으로 바뀌었으므로, 안 찍은 사람은 기술을 잃은 것으로 보인다.
        */}
        <Pressable
          onPress={() => { sfx('tap'); setTree(true); }}
          style={({ pressed }) => [
            frameStyle({ hi: picks > 0, pressed }),
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: SP.sm,
              paddingVertical: 4,
            },
          ]}
        >
          <FrameArt hi={picks > 0} />
          <Sprite set="growth" name="star_on" size={12} />
          <T size={FS.tiny} bold={picks > 0}>
            {picks > 0 ? `스킬 트리 +${picks}` : '스킬 트리'}
          </T>
        </Pressable>
      </Row>

      <SkillPanel c={c} party={party} chars={chars} grid />

      <Sep />

      {/*
        ── 지금 얼마나 ── 두 칸으로 선다 (`cols`).

        여덟 줄이 한 칸으로 서면 세로를 여덟 줄만큼 먹는다. 두 칸이면 넷이고,
        그 차이가 곧 아래 키우는 단추가 화면 안에 있느냐 밖에 있느냐다.

        **지금 판 이야기는 빼고 그린다** (`live`). 초록·붉은 괄호도, 남은
        체력도 안 붙는다 — 여기는 판을 보는 자리가 아니라 키우는 자리라,
        견주는 것이 "이 사람이 얼마나 단단한가" 이지 "지금 얼마나 깎였나"
        가 아니다.
      */}
      <CharStats c={c} party={party} chars={chars} cols={2} live={false} />

      <Sep />

      {/*
        ── 키우기 ── **맨 아래다.**

        시안도 같은 차례다: 인물 · 기술 · 수치를 다 보여 준 다음 맨 밑에
        승급과 레벨업이 있다. 보는 것이 먼저고 하는 것이 나중인데, 키우는
        단추는 손이 닿아야 하는 것이라 아래쪽이 오히려 맞다.

        스킬 트리는 여기 없다. 저건 값을 치르는 것이 아니라 **고르는 것**
        이라, 승급과 나란히 두면 둘 다 같은 일로 읽힌다 — 지금은 쓰는 기술
        바로 옆에 있다.

        **레벨업도 여기 없다.** 레벨 숫자 바로 옆으로 옮겼다 (위 `Btn`) —
        누르는 자리와 바뀌는 자리가 붙어 있어야 한다.
      */}
      <Row gap={SP.xs} style={{ alignItems: 'stretch' }}>
        {starNode}
      </Row>

      {/* 레벨업 창 — 경험의 서를 붓는다 (`LevelUpPopup`) */}
      {lvUp && <LevelUpPopup who={c.id} onClose={() => setLvUp(false)} />}
    </>
  );
}
