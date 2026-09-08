/**
 * ── 나가려 할 때 묻는다 ── 영웅 탭에서 만진 것을 넣을까 물릴까.
 *
 * 여태 영웅 화면 안에 `저장` 과 `변경사항 되돌리기` 두 칸이 있었다. 걷은 까닭:
 * **만지는 자리와 정하는 자리가 어긋나 있었다.** 편성을 만지러 들어온 사람은
 * 만지고 나가는데, 나가기 전에 화면을 아래로 굴려 단추를 한 번 더 눌러야
 * 실제로 들어갔다. 안 누르고 나가면 아무 일도 안 일어났고, 그 사실을 알려
 * 주는 것은 그 화면 안의 글줄뿐이라 **이미 떠난 사람은 못 읽었다.**
 *
 * 나가는 길목에서 물으면 못 보고 지나칠 수가 없다.
 *
 * ## 길이 셋이다
 *
 *   적용     넣고 나간다. 지금 판이 처음부터 다시 선다
 *   되돌리기 물리고 나간다. 만지기 전으로 돌아간다
 *   취소     안 나간다. 하던 것을 마저 만진다
 *
 * `취소` 를 나가는 길로 두지 않은 것이 중요하다. 셋 중 둘이 나가는 길이면
 * 사람은 "닫기" 로 읽고 아무거나 누르는데, 그러면 만진 것이 조용히 사라지거나
 * 조용히 들어간다. 여기서 조용한 쪽은 하나도 없어야 한다.
 *
 * ## 왜 판을 다시 세우나
 *
 * 편성·대형·스킬은 다 "누가 어떻게 싸우나" 를 바꾼다. 판 중간에 갈아 끼우면
 * 반쯤 깎인 적 앞에 새 편성이 서는데, 그러면 위험할 때마다 편성을 바꾸는
 * 것이 늘 최선이 되어 **자동 전투인데 손이 제일 바쁜 순간이 전투 중**이 된다.
 *
 * 잃는 것을 미리 적는다 — 모아 둔 코스트와 걸려 있던 것, 그리고 깎아 둔 적.
 */
import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/store';
import { Btn, Row, T } from '@/ui/atoms';
import { Popup } from '@/ui/Popup';
import { sfx } from '@/ui/sfx';
import { BORDER, FS, LINE, SP, SURF } from '@/ui/theme';

/** 무엇을 만졌나 — 창이 그대로 읽어 준다 */
function What({ label, on }: { label: string; on: boolean }) {
  if (!on) return null;
  return (
    <Row gap={SP.xs} style={{ alignItems: 'center' }}>
      <View style={{ width: 3, height: 3, backgroundColor: LINE.hi }} />
      <T size={FS.tiny} dim="sub">{label}</T>
    </Row>
  );
}

export function ApplyPopup({ open, onDone, onStay }: {
  /** 창을 띄울까 — 나가려는 순간에만 참이다 */
  open: boolean;
  /** 넣었든 물렸든 **나간다** */
  onDone: () => void;
  /** 안 나간다 — 하던 것을 마저 만진다 */
  onStay: () => void;
}) {
  const stage = useGame((s) => s.battle.stage);
  const pendingParty = useGame((s) => s.pendingParty);
  const pendingForm = useGame((s) => s.pendingFormation);
  const treeMark = useGame((s) => s.treeMark);
  const applyEdits = useGame((s) => s.applyEdits);
  const revertEdits = useGame((s) => s.revertEdits);
  const toast = useGame((s) => s.toast);

  if (!open) return null;

  return (
    <Popup visible title="바꾼 것을 적용할까요" onClose={onStay}>
      <T size={FS.body} bold>{`적용하면 ${stage}판을 처음부터 다시 시작합니다`}</T>
      <T size={FS.tiny} dim="dim" style={{ marginTop: SP.xs }}>
        모아 둔 스킬 코스트와 걸려 있던 것은 사라지고, 쓰러진 사람은 다시
        일어섭니다. 깎아 둔 적도 처음으로 돌아갑니다.
      </T>

      {/* 무엇을 만졌는지 — 자기가 뭘 했는지 기억이 안 나는 채로 고르게 두면 안 된다 */}
      <View
        style={[
          BORDER,
          { padding: SP.sm, marginTop: SP.sm, gap: 3, backgroundColor: SURF.up },
        ]}
      >
        <T size={9} dim="dim">바꾼 것</T>
        <What label="영웅 출전" on={pendingParty !== null} />
        <What label="대형" on={pendingForm !== null} />
        <What label="스킬 트리" on={treeMark !== null} />
      </View>

      <Btn
        label="적용"
        size="lg"
        fill
        style={{ marginTop: SP.md }}
        onPress={() => {
          sfx('tap');
          applyEdits();
          toast(`${stage}판을 다시 시작합니다`, 'good');
          onDone();
        }}
      />
      <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
        {/*
          되돌리기가 적용 **아래**에 있다. 둘 다 나가는 길이지만 하나는
          살리고 하나는 버리는 것이라, 버리는 쪽이 손가락이 먼저 닿는
          자리에 있으면 안 된다.
        */}
        <Btn
          label="되돌리기"
          size="lg"
          style={{ flex: 1 }}
          onPress={() => {
            sfx('tap');
            revertEdits();
            toast('바꾸기 전으로 되돌렸습니다', 'plain');
            onDone();
          }}
        />
        <Btn
          label="취소"
          size="lg"
          style={{ flex: 1 }}
          onPress={() => { sfx('tap'); onStay(); }}
        />
      </Row>
      <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
        취소하면 나가지 않고 계속 만집니다. 바꾼 것은 그대로 있습니다.
      </T>
    </Popup>
  );
}
