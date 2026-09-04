/**
 * ── 위 띠 ── 내가 누구이고 무엇을 얼마나 가졌나, 그리고 어디로 갈 수 있나.
 *
 * 예전 상태 표시줄(`ui/Hud`, 지웠다)을 대신한다. 저건 소지금 · 아이템레벨 ·
 * 체력 세 줄이었는데, 새 뼈대에서는 이 자리가 **프로필**과 **문 여섯 개**를
 * 같이 져야 한다.
 *
 * ## 두 줄로 나눈 이유
 *
 *   윗줄 — 로고 · 닉네임 · 재화. **나에 관한 것**이다
 *   아랫줄 — 랭킹 · 이벤트 · 우편 · 선물 · 미션 · 설정. **갈 곳**이다
 *
 * 한 줄에 다 넣어 봤더니 폰 폭(360px)에서 재화 세 덩이와 단추 여섯이 서로를
 * 밀어내서, 재화가 `96.1만` 처럼 접히고 단추는 20px 이 됐다. 성격이 다른
 * 두 가지라 줄을 가르는 것이 자리를 아끼는 것보다 낫다.
 *
 * ## 얇아야 한다
 *
 * 이 띠는 무대 **안에** 얹혀 있으므로 (`BattleView` 의 `top`) 여기서 먹는
 * 높이가 그대로 하늘에서 빠진다. 무대를 0.8배로 줄이면서 (`Ground` 의
 * `STAGE_H`) 하늘이 238px 이 됐으니, 띠가 120px 을 먹으면 인물 머리 위로
 * 남는 것이 100px 뿐이다 — 피해 숫자 두 줄이면 천장에 닿는다.
 *
 * 그래서 두 가지를 줄였다: 문 여섯의 글자를 9 에서 8 로, 그림을 20px 에서
 * 18px 로. 다 합쳐 96px 남짓이다.
 *
 * ## 테두리를 걷어냈다
 *
 * 지갑과 문 여섯이 각자 흰 네모를 두르고 있었다. 그 둘에 무대의 네모,
 * 아래 상자 줄의 네모가 더해지니 화면이 **네모의 목록**으로 보였다.
 *
 * 지금은 둘 다 테두리 없이 **어두운 알약** 위에 얹힌다 (`SURF.veil`). 배경
 * 위에서 글씨가 읽히게 하는 것이 원래 목적이었고, 그건 선이 아니라 면이
 * 하는 일이다. 선이 하나 줄 때마다 화면이 한 조각 덜 갈린다.
 *
 * ## 아이템레벨과 체력은 어디로 갔나
 *
 * 안 지웠다. 체력 막대는 윗줄 오른쪽 끝에 가늘게 남고, 아이템레벨은 로고를
 * 누르면 나오는 프로필 창으로 갔다 (`ProfilePopup`) — 저건 **파는 것도 쓰는
 * 것도 아닌 값**이라 늘 보일 이유가 없다. 재화는 다르다: 무엇을 살 수 있나가
 * 이 게임의 매 순간이므로 늘 보여야 한다.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/state/store';
import { selMaxStamina } from '@/state/selectors';
import { AVATAR_NAME } from '@/core/avatars';
import { fmtShort } from '@/core/currency';
import { Row, T } from '@/ui/atoms';
import { Sprite } from '@/ui/Sprite';
import { ICONS, NAV } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { soon } from '@/ui/SoonPopup';
import { FS, LINE, O, R, SP, SURF, WHITE } from '@/ui/theme';
import { ProfilePopup } from './ProfilePopup';
import { SettingsPopup } from './SettingsPopup';

/**
 * 상태 표시줄 최소 상단 여백.
 *
 * `SafeAreaView` 만 쓰면 inset 이 0 인 환경(웹, 일부 안드로이드)에서 첫 줄이
 * 시스템 상태바에 붙는다. inset 위에 최소 여백을 늘 얹는다 (지운 `ui/Hud`
 * 에서 그대로 가져왔다 — 같은 이유로 같은 값이다).
 */
const MIN_TOP = 14;

/**
 * 위쪽 문 여섯.
 *
 * 설정만 실제로 열린다 (`SettingsPopup`) — 소리 스위치가 갈 데가 없어서다.
 * 나머지 다섯은 준비중 (`ui/SoonPopup`).
 *
 * 그림은 `ui/sprites` 의 `NAV` 다. 글자만 있던 시절에는 이 줄이 띠가 아니라
 * **표**로 보였다 — 여섯 칸에 두 글자씩 적힌 줄은 게임이 아니라 목록이다.
 */
const GATES: readonly { id: string; label: string; art: keyof typeof NAV }[] = [
  { id: 'rank', label: '랭킹', art: 'rank' },
  { id: 'event', label: '이벤트', art: 'event' },
  { id: 'mail', label: '우편', art: 'mail' },
  { id: 'gift', label: '선물', art: 'gift' },
  { id: 'mission', label: '미션', art: 'quest' },
  { id: 'config', label: '설정', art: 'config' },
];

/**
 * 문 하나 — 그림 위에 글자.
 *
 * **테두리도 칸막이도 없다.** 여섯이 각자 네모를 두르면 작은 상자 여섯이
 * 되고, 세로줄로 가르면 표가 된다. 둘 다 해 봤다.
 *
 * 여섯을 한 줄로 묶는 것은 **그 아래 깔린 알약 하나**다 (`GateRow`). 칸을
 * 가르는 것은 여백뿐이고, 눌리는 자리만 잠깐 밝아진다 — 아래 띠와 같은
 * 규칙이다 (`BottomNav`).
 *
 * 그림은 흐리게(`O.sub`), 글자는 진하게 둔다. 여기는 **읽고 가는 곳**이라
 * 그림이 앞설 이유가 없다 — 그림이 앞서야 하는 곳은 늘 누르는 아래 띠다.
 *
 * ## 그림은 아트가 오면 저절로 갈린다
 *
 * `assets/sprites/nav_top/` 을 먼저 보고, 없으면 코드 도트로 떨어진다
 * (`Sprite` 의 `fallback`). `NAV` 는 **아트가 올 때까지 버티는 자리표**지
 * 최종 그림이 아니다 — 프롬프트는 `docs/UI_SHELL_PROMPTS.md` 에 있다.
 */
function Gate({ label, art, onPress }: {
  label: string; art: keyof typeof NAV; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      hitSlop={4}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 4,
        alignItems: 'center',
        gap: 2,
        borderRadius: R.md,
        backgroundColor: pressed ? '#FFFFFF2E' : 'transparent',
      })}
    >
      <Sprite set="nav_top" name={art} size={18} fallback={NAV[art]} opacity={O.sub} />
      <T size={8} bold>{label}</T>
    </Pressable>
  );
}

/**
 * 재화 한 덩이 — 그림 하나에 숫자 하나.
 *
 * 세 덩이가 **알약 하나 안에** 들어간다 (`TopBar` 의 지갑). 따로 두면 셋
 * 사이 간격이 곧 "이건 다른 것" 이라는 말이 되는데, 내가 가진 것은 한 벌이다.
 *
 * 그림은 흐리고 숫자는 진하다. 여기서 읽는 것은 숫자이고 그림은 그 숫자가
 * 무엇인지 말할 뿐이라, 둘이 같은 밝기면 눈이 그림에서 한 번 멈춘다.
 */
function Coin({ art, icon, text }: {
  /** `assets/sprites/coin_ui/` 안의 이름. 없으면 아래 코드 도트로 떨어진다 */
  art: string; icon: typeof ICONS.coin; text: string;
}) {
  return (
    <Row gap={3}>
      <Sprite set="coin_ui" name={art} size={11} fallback={icon} opacity={O.sub} />
      <T size={FS.label} bold>{text}</T>
    </Row>
  );
}

/** 지갑 안의 칸막이 — 재화 사이를 가르는 세로줄 */
function VBar() {
  return <View style={{ width: 1, height: 10, backgroundColor: WHITE, opacity: 0.14 }} />;
}

/**
 * 띠 뒤에 까는 **옅어지는 검은 판.**
 *
 * 하늘 위에 흰 글씨를 그냥 얹으면 배경이 밝은 챕터에서 안 읽힌다. 그렇다고
 * 통째로 검게 깔면 무대를 덮어 버려서, 배경을 비치게 한 뜻이 사라진다.
 *
 * 1-bit 라 그라디언트가 없으므로 **겹으로 흉내 낸다.** 위쪽 3/4 는 진하게,
 * 아래 1/4 는 옅게 — 두 단이면 경계가 한 번뿐이라 눈에 안 띈다. 아래로 갈수록
 * 옅어지므로 띠가 무대에 스며들어 끝난다.
 */
function Fade() {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {/*
        두 겹에서 **네 겹**으로 늘렸다. 두 겹이면 경계가 한 번뿐이라 눈에
        안 띌 줄 알았는데, 그 한 번이 하늘 한가운데를 가로지르는 실선으로
        보였다 — 배경이 밝은 챕터에서 특히 그랬다.

        네 겹이면 단마다 차이가 절반으로 줄어 실선이 안 생긴다. 다섯을 넘기면
        그때부터는 겹만 늘고 눈에 보이는 것은 그대로다.
      */}
      <View style={{ flex: 4, backgroundColor: '#000000C4' }} />
      <View style={{ flex: 2, backgroundColor: '#0000009E' }} />
      <View style={{ flex: 1, backgroundColor: '#00000066' }} />
      <View style={{ flex: 1, backgroundColor: '#00000029' }} />
    </View>
  );
}

export function TopBar() {
  const insets = useSafeAreaInsets();
  const money = useGame((s) => s.money);
  const dia = useGame((s) => s.dia);
  const nickname = useGame((s) => s.nickname);
  const avatar = useGame((s) => s.avatar);
  const stamina = useGame((s) => s.stamina);
  const maxSta = useGame(selMaxStamina);

  const [profile, setProfile] = useState(false);
  const [config, setConfig] = useState(false);

  return (
    /*
      ── 무대 **위에** 얹힌다 ──

      배경을 안 깐다. 이 띠는 무대 안에 있고 (`BattleView` 의 `top`), 뒤로
      배경 그림의 하늘이 그대로 비쳐야 한다 — 요즘 게임 화면이 다 그렇다.
      검게 깔면 화면이 "게임 창 + 정보 창" 두 덩이로 갈리고, 그러면 게임이
      작아 보인다.

      대신 글씨가 하늘 위에서 읽히도록 **아래로 갈수록 옅어지는 검은 판**을
      깐다. 1-bit 라 그라디언트를 못 쓰므로 두 겹으로 흉내 낸다 (아래 `Fade`).
    */
    <View pointerEvents="box-none">
      <View
        pointerEvents="box-none"
        style={{
          paddingTop: Math.max(insets.top, MIN_TOP) + SP.xs,
          paddingLeft: SP.sm + insets.left,
          paddingRight: SP.sm + insets.right,
          paddingBottom: SP.xs,
          gap: SP.xs,
        }}
      >
        <Fade />
        {/* ── 윗줄 · 나에 관한 것 ── */}
        <Row between>
          {/*
            로고를 누르면 프로필이 열린다.

            누를 수 있다는 것이 보여야 하므로 테두리를 두른다 — 얼굴만 덩그러니
            있으면 장식으로 읽힌다. 눌리는 자리는 얼굴과 이름을 통째로 잡는다:
            32px 짜리 그림 하나만 과녁이면 자꾸 빗나간다.
          */}
          <Pressable
            onPress={() => { sfx('tap'); setProfile(true); }}
            hitSlop={6}
            style={({ pressed }) => ({
              /*
                **얼굴과 이름이 한 덩이**다 (알약 하나). 여태 얼굴만 네모를
                두르고 이름은 그 옆에 떠 있어서, 둘이 같은 것을 여는 단추라는
                게 안 보였다.
              */
              flexDirection: 'row',
              alignItems: 'center',
              gap: SP.xs,
              paddingRight: SP.sm,
              paddingLeft: 3,
              paddingVertical: 3,
              borderRadius: R.round,
              backgroundColor: pressed ? '#FFFFFF2E' : SURF.veil,
            })}
          >
            <View
              style={{
                padding: 1,
                borderRadius: R.round,
                borderWidth: 1,
                borderColor: LINE.mid,
                overflow: 'hidden',
              }}
            >
              <Sprite
                set="avatar"
                name={avatar}
                size={24}
                fallback={ICONS.badge}
              />
            </View>
            <View>
              <T size={FS.label} bold numberOfLines={1}>{nickname || '이름 없음'}</T>
              <T size={8} dim="dim" numberOfLines={1}>{AVATAR_NAME[avatar] ?? ''}</T>
            </View>
          </Pressable>

          {/* ── 지갑 ── 셋이 알약 하나 안에 들어간다 */}
          <Row
            gap={SP.xs}
            style={{
              paddingHorizontal: SP.sm,
              paddingVertical: 5,
              borderRadius: R.round,
              backgroundColor: SURF.veil,
            }}
          >
            <Coin art="coin" icon={ICONS.coin} text={fmtShort(money).replace(' 골드', '')} />
            <VBar />
            <Coin art="gem" icon={ICONS.gem} text={String(dia)} />
            <VBar />
            {/*
              체력은 숫자만. 막대로 두면 재화 옆에서 폭을 다투고, 이 자리에서
              알아야 하는 것은 "얼마나 남았나" 하나다.
            */}
            <Coin art="heart" icon={ICONS.heart} text={`${stamina}/${maxSta}`} />
          </Row>
        </Row>

        {/*
          ── 아랫줄 · 갈 곳 여섯 ──

          **알약 하나 위에 여섯**이다. 테두리도 칸막이도 없다 — 한 판 위에
          나란히 놓인 것들은 설명 없이 한 벌로 읽힌다. 칸마다 네모를 두르거나
          세로줄로 가르면 작은 상자 여섯, 또는 표가 된다. 둘 다 해 봤다.
        */}
        <Row
          gap={2}
          style={{
            paddingHorizontal: SP.xs,
            paddingVertical: 2,
            borderRadius: R.lg,
            backgroundColor: SURF.veil,
          }}
        >
          {GATES.map((g) => (
            <Gate
              key={g.id}
              label={g.label}
              art={g.art}
              onPress={() => (g.id === 'config' ? setConfig(true) : soon(g.label))}
            />
          ))}
        </Row>
      </View>

      <ProfilePopup visible={profile} onClose={() => setProfile(false)} />
      <SettingsPopup visible={config} onClose={() => setConfig(false)} />
    </View>
  );
}
