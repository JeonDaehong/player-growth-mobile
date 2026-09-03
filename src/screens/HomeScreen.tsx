/**
 * 홈 — 지금은 이 게임의 전부다.
 *
 * ## 위에서 아래로
 *
 *   무대       2D 자동 전투 (`BattleView`) — **화면에 붙박이**
 *     ├ 위 띠    로고 · 닉네임 · 재화, 그리고 문 여섯 (`TopBar`)
 *     ├ 판 줄    몇 판 · 어디 · 최고 기록
 *     └ 채팅     왼쪽 아래에 작게 (`Ticker`)
 *   보물 상자  쌓이는 재화 게이지 (`RewardBar`) ── 여기부터 스크롤
 *   대형       앞뒤 배치 (`FormationPicker`)
 *   파티       넷의 상태 (`PartyBar`)
 *   아래 띠    다섯 칸 (`BottomNav`) — 붙박이
 *
 * ## 무대는 안 굴러간다
 *
 * "휠 해도 게임 화면은 보이면서 아래만 휠되게끔." 무대가 스크롤 안에 있으면
 * 파티를 보려고 내리는 순간 싸움이 화면 밖으로 나간다. 자동 전투 게임에서
 * 그건 **게임이 안 보이는 것**이다.
 *
 * 그래서 붙박이가 셋이다: 무대(위) · 아래 띠(아래) · 그 사이의 스크롤.
 * 위 띠와 채팅은 스크롤 밖에 따로 두지 않고 **무대 위에 얹었다** — 그래야
 * 배경 그림이 그 뒤로 비치고, 화면이 "게임 창 + 정보 창"으로 안 갈린다.
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
import { TopBar } from './home/TopBar';
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
    /*
      위쪽 안전영역을 **안 뺀다** (`edges` 에 `top` 이 없다). 무대가 화면 맨
      위까지 올라가고 그 위에 띠가 얹히므로, 노치 아래 여백은 띠가 제 안에서
      준다 (`TopBar` 의 `MIN_TOP`).
    */
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['left', 'right']}>
      {/* ── 붙박이 무대 ── 위 띠와 채팅을 안에 얹는다 */}
      <BattleView top={<TopBar />} corner={<Ticker />} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SP.md }}
        showsVerticalScrollIndicator={false}
      >
        {/*
          상자 줄은 **무대 바로 아래 첫 줄**이다. 채팅이 있던 자리이기도
          하다 — 채팅이 무대 안으로 들어가면서 이 자리가 비었고, 게이지는
          "무대에서 눈을 떼면 제일 먼저 보이는 것" 이어야 하므로 여기가 맞다.
        */}
        <RewardBar />

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

        {/*
          ── 시험 중 표시 ──

          이 빌드는 **다듬는 중인 판**이다. 받아 보는 사람이 "이게 완성본인가"
          를 헷갈리지 않게 한 줄 걸어 둔다. 내보낼 때 이 블록만 지운다.

          맨 아래다. 무대 바로 밑은 상자 줄 자리라 (`RewardBar`) 거기에 임시
          표시를 두면, 눈이 무대에서 내려오자마자 이 줄부터 읽게 된다.
        */}
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#FFFFFF66',
            borderStyle: 'dashed',
            paddingVertical: 2,
            marginTop: SP.md,
          }}
        >
          <T size={9} bold center>TEST 진행중</T>
        </View>
      </ScrollView>

      <BottomNav />

      <CharPopup slot={slot} onClose={() => setSlot(null)} />
    </SafeAreaView>
  );
}
