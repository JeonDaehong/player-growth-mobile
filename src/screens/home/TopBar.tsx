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
import { Pixel } from '@/ui/Pixel';
import { ICONS } from '@/ui/sprites';
import { sfx } from '@/ui/sfx';
import { soon } from '@/ui/SoonPopup';
import { BORDER, C, O, SP, WHITE } from '@/ui/theme';
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
 * 그림이 아직 없다. 여섯 개를 다 받으려면 프롬프트를 여섯 벌 써야 하는데,
 * 자리를 잡는 것이 이 작업의 내용이고 자리는 **글자로도 잡힌다.** 그림이
 * 들어오면 `art` 를 채우고 `Sprite` 로 갈아 끼우면 된다.
 *
 * 설정만 실제로 열린다 (`SettingsPopup`) — 소리 스위치가 갈 데가 없어서다.
 * 나머지 다섯은 준비중 (`ui/SoonPopup`).
 */
const GATES: readonly { id: string; label: string }[] = [
  { id: 'rank', label: '랭킹' },
  { id: 'event', label: '이벤트' },
  { id: 'mail', label: '우편' },
  { id: 'gift', label: '선물' },
  { id: 'mission', label: '미션' },
  { id: 'config', label: '설정' },
];

function Gate({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { sfx('tap'); onPress(); }}
      hitSlop={4}
      style={({ pressed }) => [
        BORDER,
        {
          flex: 1,
          paddingVertical: 4,
          alignItems: 'center',
          backgroundColor: pressed ? C.bgInv : 'transparent',
        },
      ]}
    >
      {({ pressed }: { pressed: boolean }) => (
        <T size={10} bold style={{ color: pressed ? C.fgInv : WHITE }}>{label}</T>
      )}
    </Pressable>
  );
}

/** 재화 한 덩이 — 그림 하나에 숫자 하나 */
function Coin({ icon, text }: { icon: typeof ICONS.coin; text: string }) {
  return (
    <Row gap={3}>
      <Pixel sprite={icon} scale={1.4} />
      <T size={11} bold>{text}</T>
    </Row>
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
    <View style={{ backgroundColor: C.bg }}>
      <View
        style={{
          paddingTop: Math.max(insets.top, MIN_TOP) + SP.xs,
          paddingLeft: SP.sm + insets.left,
          paddingRight: SP.sm + insets.right,
          paddingBottom: SP.xs,
          borderBottomWidth: 1,
          borderBottomColor: WHITE,
          gap: SP.xs,
        }}
      >
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
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Row gap={SP.xs}>
              <View style={[BORDER, { padding: 1 }]}>
                <Sprite
                  set="avatar"
                  name={avatar}
                  size={26}
                  fallback={ICONS.badge}
                />
              </View>
              <View>
                <T size={11} bold numberOfLines={1}>{nickname || '이름 없음'}</T>
                <T size={8} dim="dim" numberOfLines={1}>{AVATAR_NAME[avatar] ?? ''}</T>
              </View>
            </Row>
          </Pressable>

          <Row gap={SP.sm}>
            <Coin icon={ICONS.coin} text={fmtShort(money).replace(' 골드', '')} />
            <Coin icon={ICONS.gem} text={String(dia)} />
            {/*
              체력은 숫자만. 막대로 두면 재화 옆에서 폭을 다투고, 이 자리에서
              알아야 하는 것은 "얼마나 남았나" 하나다.
            */}
            <Row gap={3}>
              <Pixel sprite={ICONS.heart} scale={1.3} opacity={O.sub} />
              <T size={11} bold>{`${stamina}/${maxSta}`}</T>
            </Row>
          </Row>
        </Row>

        {/* ── 아랫줄 · 갈 곳 여섯 ── */}
        <Row gap={3}>
          {GATES.map((g) => (
            <Gate
              key={g.id}
              label={g.label}
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
