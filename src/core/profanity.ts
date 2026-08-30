/**
 * 욕설 필터.
 *
 * 거르는 곳은 두 군데다 — **닉네임은 막고, 채팅은 가린다.**
 * 닉네임은 한 번 정하면 남의 화면에 계속 박혀 있으니 애초에 못 만들게 하고,
 * 채팅은 흐르는 말이라 별표로 덮고 흘려보낸다. 채팅까지 전송을 막으면
 * "왜 안 보내지" 를 알 수 없어 같은 말을 세 번 치게 된다.
 *
 * ## 왜 단순 문자열 매칭이 아닌가
 *
 * 욕은 언제나 사이를 벌려서 온다 — `시 발`, `시.발`, `시-발`, `ㅅㅂ`, `f4ck`.
 * 그래서 **먼저 정규화**하고(공백·기호 제거, 숫자 치환, 소문자화) 그 위에서
 * 찾는다. 대신 정규화하면 원문과 자리가 어긋나므로, 정규화된 글자마다
 * 원문의 몇 번째 글자였는지를 `map` 으로 들고 다닌다. 가릴 때 이 map 을 거꾸로
 * 짚어야 `시 발` 의 공백까지 정확히 `**` 로 덮인다.
 *
 * ## 왜 예외 목록이 필요한가
 *
 * `시발점`, `시발역`, `새끼손가락`, `보지 못했다`, `자지 않고` — 전부 멀쩡한
 * 말인데 금칙어를 품고 있다. 필터가 이런 걸 잡기 시작하면 사람들은 필터가
 * 고장 났다고 여기고 신뢰를 접는다. **못 잡은 욕 하나보다 잘못 잡은 말 하나가
 * 더 비싸다.** 그래서 `ALLOW` 에 걸린 자리는 통째로 보호 구간으로 두고,
 * 그 안에 완전히 들어가는 매치는 무시한다.
 */

// ── 정규화 ─────────────────────────────────────────────

/**
 * 숫자·기호로 글자를 흉내 내는 것들 (leetspeak).
 * `f4ck`, `sh1t`, `@ss` 같은 우회를 원래 글자로 되돌린다.
 */
const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's',
};

/** 살려 둘 글자 — 한글 음절, 낱자모, 알파벳, 숫자 */
const KEEP = /[0-9a-z가-힣ㄱ-ㅣ]/;

export interface Normalized {
  /** 정규화된 문자열 */
  norm: string;
  /** `norm[i]` 가 원문의 몇 번째 글자였는가 */
  map: number[];
}

/**
 * 공백·기호를 버리고 소문자로 눕힌다.
 *
 * 버린 자리를 map 에 남기지 않는 게 핵심이다 — `시 발` 은 `시발`(map=[0,2])
 * 이 되고, 나중에 0~2 번째 글자를 통째로 가리면 공백까지 덮인다.
 */
export function normalizeForFilter(src: string): Normalized {
  let norm = '';
  const map: number[] = [];
  for (let i = 0; i < src.length; i++) {
    const lower = src[i].toLowerCase();
    const ch = LEET[lower] ?? lower;
    if (!KEEP.test(ch)) continue;
    norm += ch;
    map.push(i);
  }
  return { norm, map };
}

// ── 금칙어 ─────────────────────────────────────────────

/**
 * 금칙어. **정규화된 형태**로 적는다 (소문자, 공백 없음).
 *
 * 변형까지 다 적는 게 정직하다 — 어간만 적고 정규식으로 늘리면 잡는 범위가
 * 눈에 안 보여서, 나중에 왜 이 말이 걸렸는지 아무도 설명하지 못한다.
 */
export const PROFANITY: readonly string[] = [
  // 시발 계열
  '시발', '씨발', '시봘', '씨봘', '시팔', '씨팔', '시빨', '씨빨', '싀발', '쓰발', '쒸발',
  '슈발', '쉬발', '십발', '시바루', 'ㅅㅂ', 'ㅆㅂ', 'sibal', 'ssibal',
  // 씹 계열
  '씹새', '씹년', '씹놈', '씹창', '개씹', '씹덕',
  // 병신 계열
  '병신', '븅신', '빙신', '등신', 'ㅄ', 'ㅂㅅ',
  // 새끼 계열
  '새끼', '쌔끼', '색끼', '섀끼', '쉐끼', '스끼', '개새', '개세끼', '개색',
  // 좆 계열
  '좆', '존나', '졸라', '조까', '좃',
  // 지랄 계열
  '지랄', '지럴', 'ㅈㄹ', '개지랄',
  // 미친 계열 — "미친 확률" 같은 감탄까지 막지 않으려고 사람에 붙은 것만 잡는다
  '미친놈', '미친년', '미친새', '또라이', '돌아이',
  // 가족 욕
  '니미', '느금', '느검', '애미', '애비', '엠창', '니애미', '니애비', '패드립',
  // 성별·성적 표현
  '보지', '자지', '섹스', '야동', '자위', '창녀', '걸레년', '후장', '따먹',
  // 기타 욕설
  '썅', '쌍놈', '쌍년', '개년', '개놈', '개년놈', '닥쳐', '꺼져', '뒤져라', '뒤질래',
  '찌질이', '머저리', '호구새', '한남충', '김치녀', '틀딱', '급식충', '맘충',
  // 영어
  'fuck', 'fuk', 'fck', 'fvck', 'fack', 'fcuk', 'phuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt',
  'dick', 'pussy', 'nigger', 'faggot', 'whore', 'slut', 'retard', 'motherfucker',
];

/**
 * 예외 — 금칙어를 품은 멀쩡한 말.
 *
 * 여기 걸린 구간 **안에 완전히 들어가는** 매치는 없던 일이 된다.
 * `보지` 처럼 한국어 동사 어간과 겹치는 말이 특히 많아서, 뒤에 붙는 어미까지
 * 통째로 적어 둔다.
 */
export const ALLOW: readonly string[] = [
  '시발점', '시발역', '시발자동차',
  '새끼손', '새끼발', '새끼고양이', '새끼강아지', '새끼용',
  // 보다 / 자다 의 활용형 — `보지 못했다`, `자지 않고`
  '보지못', '보지만', '보지마', '보지말', '보지도', '보지는', '보지않', '보지요', '보지그래',
  '엿보지', '바라보지', '알아보지', '들여다보지', '지켜보지', '돌아보지', '살펴보지',
  '자지않', '자지만', '자지도', '자지는', '자지말', '자지마', '주무시지',
  '졸라맨', '조까지', // "졸라맨", "조까지(=조각까지)" 같은 우연한 겹침
];

// ── 찾기 ───────────────────────────────────────────────

export interface Hit {
  /** 원문에서의 시작 위치 (포함) */
  start: number;
  /** 원문에서의 끝 위치 (제외) */
  end: number;
  /** 걸린 금칙어 */
  word: string;
}

/** [시작, 끝) 구간들 — 예외로 보호된 자리 */
function protectedRanges(norm: string): [number, number][] {
  const out: [number, number][] = [];
  for (const safe of ALLOW) {
    let from = 0;
    for (;;) {
      const i = norm.indexOf(safe, from);
      if (i < 0) break;
      out.push([i, i + safe.length]);
      from = i + 1;
    }
  }
  return out;
}

/**
 * 욕설이 원문의 어디에 있는가.
 *
 * 한 글자씩 훑으면서 **모든** 자리의 매치를 모은 뒤, 겹치거나 맞붙은 것은
 * 한 덩어리로 합친다. 건너뛰면 `개새끼` 가 `개새` 로만 잡혀 `**끼` 가 남는데,
 * 그러면 가린 의미가 없다.
 */
export function findProfanity(text: string): Hit[] {
  if (!text) return [];
  const { norm, map } = normalizeForFilter(text);
  if (!norm) return [];
  const safe = protectedRanges(norm);
  const inSafe = (a: number, b: number) => safe.some(([s, e]) => a >= s && b <= e);

  // 정규화 좌표 기준 매치들 (왼쪽부터)
  const raw: { a: number; b: number; word: string }[] = [];
  for (let i = 0; i < norm.length; i++) {
    // 이 자리에서 시작하는 것 중 가장 긴 금칙어를 고른다 (개세끼 > 개새)
    let best = '';
    for (const w of PROFANITY) {
      if (w.length > best.length && norm.startsWith(w, i)) best = w;
    }
    if (!best) continue;
    const b = i + best.length;
    if (inSafe(i, b)) continue;
    raw.push({ a: i, b, word: best });
  }

  const hits: Hit[] = [];
  for (const r of raw) {
    const last = hits[hits.length - 1];
    // 정규화 좌표 → 원문 좌표. 마지막 글자의 원문 위치 + 1 이 끝이다
    const start = map[r.a], end = map[r.b - 1] + 1;
    if (last && start <= last.end) { last.end = Math.max(last.end, end); continue; }
    hits.push({ start, end, word: r.word });
  }
  return hits;
}

/** 욕이 섞여 있는가 */
export const hasProfanity = (text: string): boolean => findProfanity(text).length > 0;

/** 처음 걸린 금칙어 (안내 문구에 쓴다). 없으면 null */
export function firstProfanity(text: string): string | null {
  return findProfanity(text)[0]?.word ?? null;
}

/**
 * 욕설 자리를 별표로 덮는다.
 *
 * 길이는 **원문 그대로** 유지한다 — `시 발` 이 `**` 로 줄어들면 앞뒤 말과
 * 붙어서 무슨 말이었는지 못 알아본다.
 */
export function maskProfanity(text: string, ch = '*'): string {
  const hits = findProfanity(text);
  if (!hits.length) return text;
  let out = '';
  let at = 0;
  for (const h of hits) {
    out += text.slice(at, h.start) + ch.repeat(h.end - h.start);
    at = h.end;
  }
  return out + text.slice(at);
}
