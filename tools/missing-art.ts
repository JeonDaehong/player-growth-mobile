/**
 * 코드가 요구하는 스프라이트 vs 실제 파일 — 빠진 것만 뽑는다.
 *
 *   bun tools/missing-art.ts
 *
 * "없는 이미지 뭐야?" 를 매번 손으로 세지 않기 위해 만들었다.
 * 데이터(주문서 목록·크리처 목록·지도 장소…)에서 필요한 키를 유도하므로,
 * 새 항목을 추가하면 자동으로 빠진 아트가 잡힌다.
 */
import { readdirSync, statSync } from 'node:fs';
import { SCROLL_IDS, PART_KINDS, isWeaponKind } from '../src/core/types';
import { AVATAR_IDS } from '../src/core/avatars';
import { CREATURE_DEFS } from '../src/core/rush';
import { GUILD_EMBLEMS } from '../src/core/guilds';
import { RAIDS, RAID_BOSSES } from '../src/core/guildRaid';
import { TITLE_ORDER } from '../src/core/titles';
import { PLACES } from '../src/core/mapWorld';
import { STONES, GRADES } from '../src/core/spiritPreview';
import { POTIONS } from '../src/core/alchemy';
import { SPECIES, speciesArt } from '../src/core/gathering';
import { TAVERN_MENU } from '../src/core/economy';
import { MATERIAL_IDS } from '../src/core/artisans';
import { ABYSS_MATERIALS } from '../src/core/abyss';

const ROOT = 'assets/sprites';
const have = new Map<string, Set<string>>();
for (const d of readdirSync(ROOT)) {
  if (!statSync(`${ROOT}/${d}`).isDirectory()) continue;
  have.set(d, new Set(readdirSync(`${ROOT}/${d}`).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4))));
}

/** 프롬프트 문서의 어느 항목이 이걸 만들어 주는지 */
const RAID_DEFS_LABEL = { daily: '일일', weekly: '주간', siege: '공성' } as const;

const rows: { set: string; name: string; why: string; prompt: string }[] = [];
const need = (set: string, name: string, why: string, prompt: string) => {
  if (!have.get(set)?.has(name)) rows.push({ set, name, why, prompt });
};

for (const id of SCROLL_IDS) need('scroll', id, '주문서', '§K5');
for (const id of AVATAR_IDS) need('avatar', id, '아바타', '—');
for (const c of CREATURE_DEFS) {
  need('creature', c.id, '크리처', '—');
  for (const pose of ['idle', 'windup', 'attack', 'down']) need(`cr_${c.id}`, pose, '크리처 동작', '—');
}
for (const e of GUILD_EMBLEMS) need('guild', e, '길드 문장', '—');
for (const t of TITLE_ORDER) need('title', t, '칭호', '§N6');
for (const k of PART_KINDS) for (let t = 1; t <= 10; t++) need(`eq_${k}`, `t${t}`, '장비 티어', '—');
// 장인(11티어) 전용 아트 — 없으면 10티어를 돌려쓰므로 화면은 안 깨지지만 제련해도 그대로다
for (const k of PART_KINDS) need(`eq_${k}`, 't11', '장인 무구', isWeaponKind(k) ? '§A1' : '§A2');
for (const n of ['hero', 'google', 'guest', 'quill']) need('auth', n, '로그인 화면', '§L1');
// 새 콘텐츠 — 없으면 다른 그림을 돌려쓰므로 화면은 안 깨지지만 전부 같아 보인다
for (const n of ['gather', 'hunt', 'fish', 'abyss', 'alchemist']) need('bg_place', n, '새 장소', '§N1');
need('map', 'rift', '갈라진 땅 지형', '§N2');
for (const t of POTIONS) need('potion', t, '연성액', '§N3');
for (const m of ABYSS_MATERIALS) need('abyssmat', m, '심연 재료', '§N3');
for (const f of ['herb', 'ore', 'mushroom', 'beast', 'fish']) need('family', f, '도감 계열', '§N3');
for (const a of ['gather', 'hunt', 'fish']) need('tool', a, '채집 도구', '§N3');
// 채집 도감 50종 — 없으면 계열 아이콘으로 대신 그린다 (칸이 전부 같아 보인다)
for (const sp of SPECIES) {
  const art = speciesArt(sp);
  const sheet = sp.family === '물고기' ? '§D3' : sp.family === '짐승' || sp.family === '버섯' ? '§D2' : '§D1';
  need(art.set, art.name, `도감 · ${sp.family}`, sheet);
}
for (const m of TAVERN_MENU) need('food', m.art, '선술집 메뉴', '§D4');
for (const m of MATERIAL_IDS) need('material', m, '번스타인 재료', '§D4');
for (const n of ['head', 'body', 'tail', 'head_x', 'body_x', 'tail_x', 'ship', 'bullet'])
  need('holo', n, '홀로그램 보스', '§N4');
for (const n of ['closed', 'open', 'bomb', 'flag']) need('mines', n, '지뢰밭 타일', '§N5');
// 레이드 보스 — id 가 곧 파일명이라 명단만 바꿔도 여기서 바로 잡힌다
for (const r of RAIDS)
  for (const b of RAID_BOSSES[r])
    need('raid_boss', b.id, `레이드 보스 · ${RAID_DEFS_LABEL[r]}`, r === 'daily' ? '§R1' : '§R2');
for (const p of PLACES) need(p.art.set, p.art.name, `지도 · ${p.label}`, '§M3');
for (const s of STONES) need('stone', `${s.id}_idle`, '정령석 (화면에서 씀)', '§S2');
for (const s of STONES) for (const st of ['glow', 'crack']) need('stone', `${s.id}_${st}`, '정령석 연출', '§S2');
for (let i = 1; i <= GRADES.length; i++) need('grade', `g${i}`, '등급 뱃지', '§S3');
for (let i = 1; i <= 5; i++) need('fx_rune', String(i), '부여 연출', '§S4');
for (const n of ['ring1', 'ring2', 'ring3', 'crown', 'leaf', 'wind', 'rock', 'rune'])
  need('synergy', n, '세트 시너지', '§S5');

if (!rows.length) {
  console.log('빠진 아트 없음');
} else {
  const w = Math.max(...rows.map((r) => `${r.set}/${r.name}`.length));
  console.log(`빠진 아트 ${rows.length}개\n`);
  let last = '';
  for (const r of rows) {
    if (r.prompt !== last) { console.log(`[${r.prompt}]`); last = r.prompt; }
    console.log(`  ${`${r.set}/${r.name}`.padEnd(w)}  ${r.why}`);
  }
}
