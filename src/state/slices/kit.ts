/**
 * 액션 뭉치가 받는 두 손잡이.
 *
 * zustand 의 `set`/`get` 을 그대로 넘기되, 미들웨어(persist)가 얹은 복잡한 타입은
 * 여기서 끊는다. 뭉치들이 그 타입을 알 필요가 없고, 알면 미들웨어를 하나 바꿀 때마다
 * 열 개 파일이 같이 흔들린다. 저장·마이그레이션은 `store.ts` 만 안다.
 */
import type { Store } from '../types';

/** 부분 갱신. 함수형도 받는다 (`set((st) => ...)`) */
export type SliceSet = (
  partial: Partial<Store> | ((state: Store) => Partial<Store>),
) => void;

/** 지금 상태 **전부**. 다른 뭉치의 액션도 여기서 꺼내 쓴다 */
export type SliceGet = () => Store;
