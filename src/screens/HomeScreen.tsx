/**
 * 홈 — 지금은 이 게임의 전부다.
 *
 * ## 위에서 아래로
 *
 *   위 띠      로고 · 닉네임 · 재화, 그리고 문 여섯 (`TopBar`, 네비게이터 헤더)
 *   보물 상자  쌓이는 재화 게이지 (`RewardBar`)
 *   무대       2D 자동 전투 (`BattleView`)
 *   세 줄      소식과 채팅이 흐른다 (`Ticker`)
 *   대형       앞뒤 배치 (`FormationPicker`)
 *   파티       넷의 상태 (`PartyBar`)
 *   아래 띠    다섯 칸 (`BottomNav`)
 *
 * ## 위 셋은 이어 붙는다
 *
 * 상자 줄 · 무대 · 세 줄은 **화면 폭을 꽉 채우고 서로 붙어** 있다. 사이는
 * 가는 가로줄 하나로만 갈린다. 각자 테두리를 두르고 8px 씩 떨어져 있던
 * 시절에는 화면이 떠 있는 카드 대여섯 장으로 보였다.
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
import { FormationPicker } from './home/FormationPicker';

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
        /*
          ── 좌우 여백을 여기서 안 준다 ──

          예전에는 스크롤 전체에 `padding: SP.sm` 이었다. 그러면 안에 든
          것들이 전부 **양옆이 뜬 카드**가 되고, 각자 테두리까지 두르고 있어서
          화면이 조각조각 떠 있는 것으로 보였다 ("다 뚝뚝 끊긴 느낌").

          지금은 위쪽 세 덩이(상자 줄 · 무대 · 세 줄)가 화면 폭을 꽉 채운
          **띠**로 이어지고, 사이는 가는 가로줄로만 갈린다. 여백은 각 덩이가
          제 안에서 준다. 무대가 넓어지는 것은 덤이다 — 땅이 그만큼 넓다.
        */
        contentContainerStyle={{ paddingBottom: SP.md }}
        showsVerticalScrollIndicator={false}
      >
        {/*
          ── 시험 중 표시 ──

          이 빌드는 **다듬는 중인 판**이다. 받아 보는 사람이 "이게 완성본인가"
          를 헷갈리지 않게 한 줄 걸어 둔다. 내보낼 때 이 블록만 지운다.
        */}
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: '#FFFFFF66',
            borderStyle: 'dashed',
            paddingVertical: 2,
          }}
        >
          <T size={9} bold center>TEST 진행중</T>
        </View>

        {/* 여기부터 셋이 이어진 한 덩어리다 — 사이에 여백을 두지 않는다 */}
        <RewardBar />
        <BattleView />
        <Ticker />

        {/*
          대형은 파티 바로 위다 — "누가 서나" 와 "어떻게 서나" 는 같은 종류의
          결정이라 붙어 있어야 한다 (`FormationPicker`).

          아래 둘은 위의 띠들과 성격이 다르다. 저건 보는 것이고 이건 만지는
          것이라, 좌우 여백을 줘서 손에 잡히는 칸으로 보이게 한다.
        */}
        <View style={{ paddingHorizontal: SP.sm, marginTop: SP.sm }}>
          <FormationPicker />
        </View>

        <View style={{ paddingHorizontal: SP.sm, marginTop: SP.sm }}>
          <PartyBar onPick={setSlot} />
        </View>
      </ScrollView>

      <BottomNav />

      <CharPopup slot={slot} onClose={() => setSlot(null)} />
    </SafeAreaView>
  );
}
