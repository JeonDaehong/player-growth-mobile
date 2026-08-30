/**
 * 홈 — 지금은 이 게임의 전부다.
 *
 * 위에서 전투가 돌아가고, 아래에 파티 넷이 선다. 그 사이에 아무것도 안 둔다 —
 * 방치형에서 이 두 가지가 한 화면에 같이 보이는 게 핵심이고, 사이에 뭘 끼우면
 * 스크롤을 내려야 파티가 보인다.
 *
 * ## 전투 틱은 여기서 돌린다
 *
 * `App.tsx` 가 아니라 여기다. 지금은 화면이 하나뿐이라 차이가 없지만, 나중에
 * 화면이 늘면 **홈을 보고 있을 때만** 도는 게 맞다 — 다른 화면에서 돌면 그 화면의
 * 조작과 전투 결과가 같은 프레임에 섞이고, 무엇 때문에 골드가 늘었는지 알 수 없다.
 *
 * 자리를 비운 사이의 진행은 나중에 따로 정산한다 (지금은 없다).
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { TICK_MS } from '@/core/autoBattle';
import { CHAR_IDS } from '@/core/chars';
import { Btn, Screen, Sep, Row, T } from '@/ui/atoms';
import { startBgm } from '@/ui/sfx';
import { SP } from '@/ui/theme';
import { Money } from '@/ui/Money';
import { BattleView } from './home/BattleView';
import { BenchTag, PartyBar } from './home/PartyBar';
import { CharPopup } from './home/CharPopup';
import { RecruitPopup } from './home/RecruitPopup';

/**
 * 배경음 스위치.
 *
 * 원래 환경설정에 있던 것인데, 설정 화면을 통째로 걷어내면서 갈 데가 없어졌다.
 * 지금은 화면이 홈 하나뿐이라 여기 둔다.
 *
 * **끄고 켜는 것 말고 `startBgm()` 을 한 번 더 부른다.** 브라우저는 사용자가
 * 직접 누르기 전에는 소리를 못 내게 막는다. 앱이 뜨자마자 `App.tsx` 가 부르는
 * `startBgm()` 은 그래서 조용히 실패하고, 그 뒤로는 상태만 "켜짐" 이라
 * 아무리 기다려도 안 나온다. 이 버튼을 누르는 것이 곧 그 "직접 누름" 이므로,
 * 여기서 한 번 더 걸어 준다.
 */
function BgmBtn() {
  const on = useGame((s) => s.bgmOn);
  const setOn = useGame((s) => s.setBgmOn);
  return (
    <Btn
      label={on ? 'BGM 켬' : 'BGM 끔'}
      size="sm"
      fill={on}
      onPress={() => { setOn(!on); if (!on) startBgm(); }}
    />
  );
}

export default function HomeScreen() {
  const tickOnce = useGame((s) => s.battleTickOnce);
  const money = useGame((s) => s.money);
  const [slot, setSlot] = useState<number | null>(null);
  const [recruiting, setRecruiting] = useState(false);
  const owned = useGame((s) => Object.keys(s.chars).length);

  /*
    전투를 굴린다.

    `tickOnce` 는 스토어에서 꺼낸 함수라 신원이 안 바뀐다 (zustand 액션은
    한 번 만들어지면 그대로다). 그래서 이 effect 는 화면이 뜰 때 한 번만 돈다 —
    의존성에 상태값을 넣으면 매 틱마다 타이머를 다시 걸게 된다.
  */
  useEffect(() => {
    const t = setInterval(tickOnce, TICK_MS);
    return () => clearInterval(t);
  }, [tickOnce]);

  return (
    <Screen>
      {/*
        ── 시험 중 표시 ──

        지금 이 빌드는 **다듬는 중인 판**이다. 받아 보는 사람이 "이게 완성본인가"
        를 헷갈리지 않게 맨 위에 한 줄 걸어 둔다 — 화면 안에 섞어 두면 게임의
        일부로 읽힌다.

        내보낼 때는 이 블록만 지우면 된다.
      */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#FFFFFF66',
          borderStyle: 'dashed',
          paddingVertical: 3,
          marginBottom: SP.xs,
        }}
      >
        <T size={10} bold center>TEST 진행중</T>
      </View>

      <Row between style={{ marginBottom: SP.xs }}>
        <Row gap={SP.sm}>
          <T size={12} bold>모험</T>
          <BenchTag />
        </Row>
        <Row gap={SP.sm}>
          <Money amount={money} size={12} />
          <BgmBtn />
        </Row>
      </Row>

      <BattleView />

      <Sep />

      <PartyBar onPick={setSlot} />

      <Btn
        label="캐릭터 모집"
        /* 12 로 박아 뒀더니 한 명씩 늘릴 때마다 표시가 거짓말이 됐다 */
        sub={`도감 ${owned} / ${CHAR_IDS.length}`}
        size="lg"
        fill
        style={{ marginTop: SP.md }}
        onPress={() => setRecruiting(true)}
      />

      <View style={{ marginTop: SP.sm }}>
        <T size={9} dim="dim">
          파티 칸을 누르면 캐릭터를 바꾸거나 고유장비를 강화할 수 있습니다.
        </T>
      </View>

      <CharPopup slot={slot} onClose={() => setSlot(null)} />
      <RecruitPopup visible={recruiting} onClose={() => setRecruiting(false)} />
    </Screen>
  );
}
