/**
 * 상태 효과 — **한동안 걸려 있다가 풀리는 것.**
 *
 * 출혈 · 중독 · 기절 · 침묵처럼 걸린 사람에게 몇 초씩 붙는 것들이다. 걸린
 * 사람 머리 위에 작은 로고로 뜬다 (`screens/home/StatusRow`).
 *
 * ## 지금은 거의 비어 있다
 *
 * 여기 적힌 열둘 중 **실제로 걸리는 것은 격노 하나**다. 나머지 열하나는
 * 우두머리 기술이 걸 것들인데(`docs/BOSS_SKILLS.md`), 그 기술들이 아직 계산에
 * 안 들어가 있다.
 *
 * 그래도 목록과 화면을 먼저 세워 두는 이유는, 기술을 넣을 때 **표시할 방법을
 * 같이 만들지 않으면 화면에서 아무 일도 안 일어나기 때문**이다. 출혈이 도는데
 * 체력만 조금씩 줄면 플레이어는 무슨 일인지 모른다.
 *
 * ## 좋고 나쁨은 그림이 아니라 자리가 말한다
 *
 * 흑백 2색이라 초록 테두리·빨간 테두리를 쓸 수 없다 (`ui/theme`). 그래서
 * 로고는 **무엇인지만** 말하고, 좋은 것인지 나쁜 것인지는 화면이 **왼쪽에
 * 두느냐 오른쪽에 두느냐**로 말한다 (`StatusRow`).
 */
import { OwnedChar } from './chars';
import { Party, supportMul } from './party';

/** 상태 하나. 값은 곧 스프라이트 칸 이름이다 (`assets/sprites/status_icon/`) */
export type StatusId =
  /* ── 나쁜 것 ── */
  | 'st_bleed'    // 출혈 — 물리 지속 피해
  | 'st_poison'   // 중독 — 마법 지속 피해 (맹독·산성·포자·부패 전부)
  | 'st_stun'     // 기절 — 행동 불가
  | 'st_silence'  // 침묵 — 스킬 사용 불가
  | 'st_slow'     // 둔화 — 공격속도 감소
  | 'st_weak'     // 약화 — 공격력 감소
  | 'st_break'    // 파쇄 — 방어력 감소
  | 'st_wither'   // 시듦 — 받는 치유량 감소
  /* ── 좋은 것 ── */
  | 'st_rage'     // 격노 — 공격력 증가
  | 'st_guard'    // 견고 — 방어력 증가
  | 'st_regen'    // 재생 — 지속 회복
  | 'st_haste';   // 신속 — 공격속도 증가

/** 화면에 적는 이름 — 아직 쓰는 데가 없지만 로고만으로는 뜻이 안 통할 때를 위해 */
export const STATUS_NAME: Record<StatusId, string> = {
  st_bleed: '출혈',
  st_poison: '중독',
  st_stun: '기절',
  st_silence: '침묵',
  st_slow: '둔화',
  st_weak: '약화',
  st_break: '파쇄',
  st_wither: '시듦',
  st_rage: '격노',
  st_guard: '견고',
  st_regen: '재생',
  st_haste: '신속',
};

/**
 * 좋은 것인가.
 *
 * 화면이 이걸로 **자리를 가른다** — 좋은 것은 왼쪽, 나쁜 것은 오른쪽.
 * 흑백에서 색으로 못 가르니 자리로 가른다.
 */
export const GOOD: ReadonlySet<StatusId> = new Set<StatusId>([
  'st_rage', 'st_guard', 'st_regen', 'st_haste',
]);

/** 아무것도 안 걸린 상태 — 새 배열을 매번 만들면 화면이 계속 다시 그려진다 */
const NONE: readonly StatusId[] = [];

/**
 * 지금 이 사람에게 걸려 있는 것들.
 *
 * **아직 격노 하나뿐이다.** 보조가 파티에 서 있으면 전원의 공격력이 오르는데
 * (`core/party` 의 `supportMul`), 그것이 이 게임에 실제로 존재하는 유일한
 * 지속 효과다. 나머지 열하나는 우두머리 기술이 들어올 때 여기에 붙는다.
 *
 * 보조 자신에게도 붙는다 — `supportMul` 이 파티 전체에 걸리므로 본인도
 * 받는다. 본인만 빼면 화면과 계산이 어긋난다.
 */
export function statusOf(
  _who: string,
  party: Party,
  chars: Record<string, OwnedChar>,
): readonly StatusId[] {
  return supportMul(party, chars) > 1 ? RAGE : NONE;
}

const RAGE: readonly StatusId[] = ['st_rage'];
