/**
 * 홈 — 지금은 이 게임의 전부다.
 *
 * ## 위에서 아래로
 *
 *   위 띠      로고 · 닉네임 · 재화, 그리고 문 여섯 (`TopBar`, 네비게이터 헤더)
 *   보물 상자  쌓이는 재화 게이지 (`RewardBar`)
 *   무대       2D 자동 전투 (`BattleView`)
 *   세 줄      소식과 채팅이 흐른다 (`Ticker`)
 *   파티       넷의 상태 (`PartyBar`)
 *   아래 띠    다섯 칸 (`BottomNav`)
 *
 * ## 아래 띠는 스크롤 밖이다
 *
 * "밑에 캐릭터 상태랑, 우리가 누르고 들어가고자 하는 버튼들이 같이 보여야
 * 함" — 그 말이 이 배치의 전부다. 파티와 단추가 한 화면에 있어야 하는데,
 * 둘 다 스크롤 안에 넣으면 파티가 길어지는 날 단추가 밖으로 밀린다.
 *
 * 그래서 **아래 띠만 밖**이다. 위쪽이 아무리 길어져도 다섯 칸은 제자리에
 * 있고, 스크롤을 끝까지 내리면 그 바로 위에 파티가 선다.
 *
 * ## 전투 틱은 여기서 돌린다
 *
 * `App.tsx` 가 아니라 여기다. 지금은 화면이 하나뿐이라 차이가 없지만, 화면이
 * 늘면 **홈을 보고 있을 때만** 도는 게 맞다 — 다른 화면에서 돌면 그 화면의
 * 조작과 전투 결과가 같은 프레임에 섞이고, 무엇 때문에 골드가 늘었는지 알 수
 * 없다.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/state/store';
import { T } from '@/ui/atoms';
import { TICK_MS } from '@/core/autoBattle';
import { C, SP } from '@/ui/theme';
import { BattleView } from './home/BattleView';
import { PartyBar } from './home/PartyBar';
import { CharPopup } from './home/CharPopup';
import { RewardBar } from './home/RewardBar';
import { Ticker } from './home/Ticker';
import { BottomNav } from './home/BottomNav';

export default function HomeScreen() {
  const tickOnce = useGame((s) => s.battleTickOnce);
  const [slot, setSlot] = useState<number | null>(null);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SP.sm, paddingBottom: SP.md }}
        showsVerticalScrollIndicator={false}
      >
        {/*
          ── 시험 중 표시 ──

          이 빌드는 **다듬는 중인 판**이다. 받아 보는 사람이 "이게 완성본인가"
          를 헷갈리지 않게 한 줄 걸어 둔다. 내보낼 때 이 블록만 지운다.
        */}
        <View
          style={{
            borderWidth: 1,
            borderColor: '#FFFFFF66',
            borderStyle: 'dashed',
            paddingVertical: 2,
            marginBottom: SP.xs,
          }}
        >
          <T size={9} bold center>TEST 진행중</T>
        </View>

        <RewardBar />
        <BattleView />
        <Ticker />

        <View style={{ marginTop: SP.sm }}>
          <PartyBar onPick={setSlot} />
        </View>
      </ScrollView>

      <BottomNav />

      <CharPopup slot={slot} onClose={() => setSlot(null)} />
    </SafeAreaView>
  );
}
