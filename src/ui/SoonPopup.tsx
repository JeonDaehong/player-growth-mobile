/**
 * ── 준비중 ── 아직 없는 화면으로 가는 단추가 누르는 사람에게 하는 말.
 *
 * ## 왜 단추부터 세우나
 *
 * 새 UI 뼈대는 단추가 열한 개다 (위 여섯 · 아래 다섯). 그 뒤에 붙을 화면은
 * 아직 하나도 없다.
 *
 * 그렇다고 단추를 안 세우면 **뼈대가 뼈대가 아니게 된다** — 자리를 잡는 일이
 * 곧 이 작업의 내용이고, 자리는 실제로 눌리는 단추가 서 있어야 잡힌다.
 * 화면이 하나씩 들어올 때마다 여기서 갈래를 하나씩 빼면 된다.
 *
 * ## 왜 토스트가 아닌가
 *
 * 토스트로 띄워 봤을 때 **누른 것과 뜬 것이 안 이어졌다.** 화면 아래 구석에
 * 한 줄이 스쳐 지나가므로, 방금 누른 단추가 무엇이었는지를 보는 사람이 스스로
 * 이어 붙여야 한다. 팝업은 이름을 제목에 걸고 나오므로 그 일이 필요 없다.
 *
 * ## 어디서든 하나만 뜬다
 *
 * 단추마다 팝업을 하나씩 달면 열한 개의 상태가 생기고, 그중 하나만 안 닫히는
 * 날이 온다. 문은 하나만 두고 이름만 갈아 끼운다 (`useSoon`).
 */
import React from 'react';
import { create } from 'zustand';
import { View } from 'react-native';
import { Btn, T } from './atoms';
import { Popup } from './Popup';
import { SP } from './theme';

interface SoonState {
  /** 지금 열려 있는 문의 이름. null 이면 닫혀 있다 */
  name: string | null;
  open: (name: string) => void;
  close: () => void;
}

export const useSoon = create<SoonState>()((set) => ({
  name: null,
  open: (name) => set({ name }),
  close: () => set({ name: null }),
}));

/** 어느 단추에서든 이걸 부르면 된다 — `onPress={() => soon('영웅')}` */
export const soon = (name: string) => useSoon.getState().open(name);

export function SoonPopupHost() {
  const name = useSoon((s) => s.name);
  const close = useSoon((s) => s.close);

  return (
    <Popup visible={!!name} title={name ?? ''} onClose={close}>
      <View style={{ paddingVertical: SP.md, alignItems: 'center', gap: SP.sm }}>
        <T size={13} bold>준비중입니다</T>
        <T size={11} dim="sub" center>
          {`"${name ?? ''}" 은(는) 아직 만드는 중입니다.\n자리만 먼저 잡아 두었습니다.`}
        </T>
      </View>
      <Btn label="닫기" onPress={close} fill />
    </Popup>
  );
}
