/**
 * 자동 강화 — 창고 여러 개, 착용 한 자루.
 *
 * `HomeScreen.tsx` 한 파일에 1,700줄이 있던 시절에는 팝업 하나를 고치려고
 * 열 때마다 관계없는 다섯 개를 지나야 했다. 화면은 화면대로, 팝업은 팝업대로 둔다.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { KIND_NAME, fmtIlvl, itemLevel, itemName, useGame } from '@/state/store';
import { Item, ScrollId } from '@/core/types';
import { ENHANCE_SCROLL_ORDER, SCROLLS, canEnhance } from '@/core/enhance';
import { AutoStop, STOP_MSG, autoGoalMax, minCost } from '@/core/autoEnhance';
import { fmt, fmtShort } from '@/core/currency';
import { Bar, Btn, KV, ListItem, Panel, Row, Sep, T, Tag } from '@/ui/atoms';
import { parseTyped } from '@/ui/numberField';
import { BORDER, MONO, SP, WHITE } from '@/ui/theme';
import { Sprite } from '@/ui/Sprite';
import { equipArt } from '@/ui/equipArt';
import { ChargeGauge, EnhanceFx, FxKind } from '@/ui/EnhanceFx';
import { Popup } from '@/ui/Popup';
import { Money } from '@/ui/Money';
import { ItemHead } from './parts';

// ── 자동 강화 ──────────────────────────────────────────
/**
 * 한 번 두들기는 간격.
 *
 * 260ms 다. 더 빠르면 무슨 일이 일어나는지 눈으로 못 따라가고 (그러면 자동이
 * 아니라 그냥 결과창이다), 더 느리면 백 번 두들기는 데 몇 분이 걸린다.
 */
export const AUTO_TICK_MS = 260;

/** 자동 강화가 훑고 지나간 장비 하나의 기록 */
export interface AutoRow {
  id: string;
  name: string;
  /** 시작할 때의 강화 수치 */
  from: number;
  /** 지금(또는 끝났을 때) 강화 수치 */
  now: number;
  goal: number;
  hits: number;
  ok: number;
  /** 파괴됐는가 */
  broken: boolean;
  /** 이 장비에 들어간 돈 */
  spent: number;
}

/**
 * 자동 강화 한 벌.
 *
 * `targets` 에 넘긴 장비들을 `goal` 까지 두들긴다. 창고 여러 개를 한꺼번에 돌리는
 * 데도 쓰고, 착용 중인 한 자루만 돌리는 데도 쓴다 — 다른 건 대상 목록뿐이다.
 *
 * ## 동시성
 *
 * "여러 개를 동시에" 처럼 보이지만 실제로는 **한 번에 하나씩** 친다
 * (`core/autoEnhance` 참고). 장비마다 타이머를 돌리면 셋이 같은 순간에 잔고를
 * 확인하고 셋이 차감해 소지금이 음수로 내려간다. 타이머는 하나고, 그 타이머가
 * 스토어의 `autoEnhanceStep` 을 부른다 — 확인과 차감이 한 번의 set 안에서 끝난다.
 */
export function useAutoRun(targets: Item[], goal: number, scroll: ScrollId | null) {
  const step = useGame((s) => s.autoEnhanceStep);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<AutoRow[]>([]);
  const [stopped, setStopped] = useState<AutoStop | null>(null);
  const [dust, setDust] = useState(0);

  /*
    ⚠ 돌고 있는 동안 바뀌면 안 되는 값들은 ref 로 들고 간다.
    의존성에 넣으면 값이 바뀔 때 타이머가 재생성되면서 한 틱을 건너뛰거나 두 번 돈다.
  */
  const run = useRef({ ids: [] as string[], goal, scroll });

  const start = () => {
    if (!targets.length) return;
    run.current = { ids: targets.map((t) => t.id), goal, scroll };
    setRows(targets.map((t) => ({
      id: t.id,
      name: itemName(t, KIND_NAME),
      from: t.level,
      now: t.level,
      goal,
      hits: 0,
      ok: 0,
      broken: false,
      spent: 0,
    })));
    setDust(0);
    setStopped(null);
    setRunning(true);
  };

  const cancel = () => { setRunning(false); setStopped('cancel'); };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const { ids, goal: gl, scroll: sc } = run.current;
      const r = step(ids, gl, sc);
      if (r.stop) {
        setRunning(false);
        setStopped(r.stop);
        return;
      }
      setDust((d) => d + (r.dust ?? 0));
      setRows((prev) => prev.map((row) => (row.id !== r.id ? row : {
        ...row,
        now: r.to ?? row.now,
        hits: row.hits + 1,
        ok: row.ok + (r.outcome === 'success' ? 1 : 0),
        broken: row.broken || r.outcome === 'destroy',
        spent: row.spent + (r.cost ?? 0),
      })));
    }, AUTO_TICK_MS);
    return () => clearInterval(t);
  }, [running, step]);

  /*
    끝났을 때 소리와 섬광.

    자동 강화는 화면을 안 보고 있어도 도는데, 끝난 걸 알려 주는 게 아무것도
    없었다 — 다시 봤을 때 끝난 건지 도는 중인지 구분이 안 됐다.
    파괴가 있었으면 실패 소리, 없으면 성공 소리를 낸다.
  */
  const [fx, setFx] = useState<FxKind>(null);
  const nonce = useRef(0);
  const wasRunning = useRef(false);
  const fxT = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (wasRunning.current && !running && stopped) {
      const broke = rows.some((r) => r.broken);
      nonce.current += 1;
      setFx(broke ? 'destroy' : 'promote');
      /* 앞의 것이 남아 있으면 치우고 건다 — 연달아 끝나면 두 개가 겹친다 */
      if (fxT.current) clearTimeout(fxT.current);
      fxT.current = setTimeout(() => setFx(null), broke ? 1400 : 1100);
      void Haptics.notificationAsync(
        broke ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success,
      );
    }
    wasRunning.current = running;
  }, [running, stopped, rows]);

  /* 창을 닫을 때 남은 타이머를 치운다 */
  useEffect(() => () => { if (fxT.current) clearTimeout(fxT.current); }, []);

  return { running, rows, stopped, dust, fx, nonce, start, cancel, clear: () => setStopped(null) };
}

/** 장비 한 줄의 진행 상황 — 지금 뭘 하고 있는지가 여기서 다 읽혀야 한다 */
export function AutoRowView({ row, active }: { row: AutoRow; active: boolean }) {
  const done = !row.broken && row.now >= row.goal;
  const span = Math.max(1, row.goal - row.from);
  return (
    <View style={{ paddingVertical: 4 }}>
      <Row between>
        <Row gap={SP.xs} style={{ flex: 1 }}>
          {/* 지금 두들기고 있는 줄에 표시 — 여러 개가 돌 때 어느 것 차례인지 */}
          <T size={11} bold={active}>{active ? '▶' : ' '}</T>
          <T size={11} bold numberOfLines={1} style={{ flex: 1 }}>{row.name}</T>
          {row.broken
            ? <Tag label="파괴" />
            : done ? <Tag label="완료" fill /> : undefined}
        </Row>
        <T size={12} bold>
          +{row.now}
          <T size={9} dim="dim"> / +{row.goal}</T>
        </T>
      </Row>
      <Bar value={Math.min(row.now, row.goal) - row.from} max={span} blocks={20} height={4} />
      <T size={9} dim="dim">
        {row.broken
          ? `+${row.from} 에서 시작해 ${row.hits}번 만에 부서졌습니다`
          : `${row.hits}번 시도 · ${row.ok}번 성공 · ${fmtShort(row.spent)} 사용`}
      </T>
    </View>
  );
}

/**
 * 창고 장비 여러 개를 골라 한꺼번에 맡긴다.
 *
 * 착용 중인 장비는 여기서 안 다룬다 — 그건 칸을 눌러 강화 창에서 하나씩 하는
 * 흐름이 이미 있고, 거기에 자동 버튼을 따로 뒀다 (`AutoOnePopup`).
 * 두 자리를 한 화면에 섞으면 "지금 뭘 강화하는 중인가" 가 흐려진다.
 */
export function AutoEnhancePanel() {
  const inventory = useGame((s) => s.inventory);
  const money = useGame((s) => s.money);
  const scrolls = useGame((s) => s.scrolls);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [goal, setGoal] = useState(10);
  const [scroll, setScroll] = useState<ScrollId | null>(null);

  /** 더 올릴 수 있는 창고 장비 */
  const usable = inventory.filter((it) => canEnhance(it));
  const targets = usable.filter((it) => picked.includes(it.id));
  const auto = useAutoRun(targets, goal, scroll);

  /* 목표보다 낮은 것만 실제 대상이다 */
  const active = targets.filter((it) => it.level < goal);
  const need = minCost(active, active.map((it) => ({ slot: it.id, goal, from: it.level })));
  const canStart = active.length > 0 && money >= need && !auto.running;

  if (!usable.length) return null;

  const nowId = auto.rows.find((r) => !r.broken && r.now < r.goal)?.id;

  return (
    <Panel
      title="창고 자동 강화"
      right={<Tag label={`${picked.length}개 선택`} fill={picked.length > 0} />}
    >
      <EnhanceFx kind={auto.fx} nonce={auto.nonce.current} />
      <T size={11} dim="sub">
        창고에 있는 장비를 여러 개 골라 목표 강화 수치까지 맡깁니다.
        확률과 결과는 손으로 할 때와 같습니다.
      </T>
      <Btn
        label={auto.running ? '진행 중…' : '설정하고 시작'}
        size="lg"
        fill
        style={{ marginTop: SP.sm }}
        onPress={() => setOpen(true)}
      />

      <Popup
        visible={open}
        title="창고 자동 강화"
        onClose={() => { if (!auto.running) { setOpen(false); auto.clear(); } }}
        right={auto.running ? <Tag label="진행 중" fill /> : undefined}
      >
        {auto.running || (auto.stopped && auto.rows.length) ? (
          <>
            {/*
              끝났는지 아닌지가 제일 먼저 읽혀야 한다.
              돌고 있으면 게이지, 끝났으면 멈춘 이유를 크게 세운다.
            */}
            {auto.running ? (
              <>
                <T size={13} bold center>강화 중…</T>
                <View style={{ marginTop: SP.sm }}>
                  <ChargeGauge running />
                </View>
              </>
            ) : (
              <View style={[BORDER, { padding: SP.sm, borderWidth: 2 }]}>
                <T size={14} bold center>{STOP_MSG[auto.stopped!]}</T>
              </View>
            )}

            <Sep />
            {/* 장비별 현황 — 뭐가 몇 강까지 갔고 뭐가 터졌는지 */}
            {auto.rows.map((r) => (
              <AutoRowView key={r.id} row={r} active={auto.running && r.id === nowId} />
            ))}

            <Sep />
            <KV k="총 시도" v={`${auto.rows.reduce((a, r) => a + r.hits, 0)}회`} />
            <KV k="총 성공" v={`${auto.rows.reduce((a, r) => a + r.ok, 0)}회`} />
            <KV
              k="파괴"
              v={`${auto.rows.filter((r) => r.broken).length}개`}
              warn={auto.rows.some((r) => r.broken)}
            />
            <KV k="쓴 돈" v={fmt(auto.rows.reduce((a, r) => a + r.spent, 0))} />
            {auto.dust > 0 && <KV k="주운 가루" v={`${auto.dust}개`} dim />}

            {auto.running ? (
              <Btn label="멈추기" size="lg" style={{ marginTop: SP.md }} onPress={auto.cancel} />
            ) : (
              <Btn
                label="확인"
                size="lg"
                fill
                style={{ marginTop: SP.md }}
                onPress={() => { auto.clear(); setPicked([]); }}
              />
            )}
          </>
        ) : (
          <>
            <T size={11} bold style={{ marginBottom: SP.xs }}>강화할 장비 (창고)</T>
            {usable.map((it) => {
              const on = picked.includes(it.id);
              return (
                <ListItem
                  key={it.id}
                  left={<Sprite {...equipArt(it.kind, it.tier)} size={24} />}
                  title={itemName(it, KIND_NAME)}
                  sub={`아이템레벨 ${fmtIlvl(itemLevel(it))} · 내구 ${it.dur}%`}
                  right={on ? <Tag label="선택" fill /> : <T size={10} dim="dim">+{it.level}</T>}
                  onPress={() => setPicked((v) => (on ? v.filter((x) => x !== it.id) : [...v, it.id]))}
                />
              );
            })}
            <Row gap={SP.sm}>
              <Btn
                label="전부"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => setPicked(usable.map((i) => i.id))}
              />
              <Btn label="해제" size="sm" style={{ flex: 1 }} onPress={() => setPicked([])} />
            </Row>

            <Sep />
            <Row between>
              <T size={11} bold>목표 강화 수치</T>
              <T size={16} bold>+{goal}</T>
            </Row>
            <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
              <Btn label="−" size="sm" onPress={() => setGoal((v) => Math.max(1, v - 1))} />
              <Bar value={goal} max={15} blocks={15} height={10} />
              <Btn label="+" size="sm" onPress={() => setGoal((v) => Math.min(15, v + 1))} />
            </Row>

            <Sep />
            <T size={11} bold style={{ marginBottom: SP.xs }}>주문서 (매회 1장)</T>
            <ListItem
              title="사용 안 함"
              right={scroll === null ? <Tag label="선택" fill /> : undefined}
              onPress={() => setScroll(null)}
            />
            {ENHANCE_SCROLL_ORDER.map((id) => {
              const have = scrolls[id] ?? 0;
              return (
                <ListItem
                  key={id}
                  title={SCROLLS[id].name}
                  sub={`보유 ${have}장 · 떨어지면 주문서 없이 계속합니다`}
                  disabled={have <= 0}
                  right={scroll === id ? <Tag label="선택" fill /> : <T size={10} dim="dim">{have}</T>}
                  onPress={() => setScroll(scroll === id ? null : id)}
                />
              );
            })}

            <Sep />
            <KV k="고른 장비" v={`${active.length}개`} />
            <KV k="최소 필요 금액" v={fmt(need)} warn={money < need} />
            <KV k="보유 골드" v={fmt(money)} dim={money >= need} />
            <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
              한 번도 실패하지 않았을 때의 금액입니다. 실제로는 더 듭니다 —
              돈이 떨어지면 그 자리에서 멈춥니다.
            </T>

            <Btn
              label="시작"
              size="lg"
              fill={canStart}
              disabled={!canStart}
              style={{ marginTop: SP.md }}
              onPress={auto.start}
            />
            {!active.length && (
              <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>
                목표보다 낮은 장비를 하나 이상 골라 주세요
              </T>
            )}
            {active.length > 0 && money < need && (
              <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>
                최소 {fmtShort(need - money)} 부족합니다
              </T>
            )}
          </>
        )}
      </Popup>
    </Panel>
  );
}

/**
 * 착용 중인 한 자루만 자동으로.
 *
 * 강화 창에서 여는 것이라 **연출은 그대로**다 — 게이지가 차고, 성공하면 섬광이
 * 터지고, 결과 문구가 뜬다. 달라지는 건 손가락으로 누르느냐 아니냐뿐이다.
 */
export function AutoOnePopup({
  item, visible, onClose,
}: { item: Item | null; visible: boolean; onClose: () => void }) {
  const money = useGame((s) => s.money);
  const scrolls = useGame((s) => s.scrolls);
  const [goal, setGoal] = useState(10);
  const [scroll, setScroll] = useState<ScrollId | null>(null);
  /** 목표를 직접 쳐 넣는 중인 글자. null 이면 `goal` 을 그대로 비춘다 */
  const [typing, setTyping] = useState<string | null>(null);

  const targets = useMemo(() => (item ? [item] : []), [item]);
  const auto = useAutoRun(targets, goal, scroll);

  /*
    이 장비에 걸 수 있는 목표 상한.

    일반 장비는 15, **장인 무구는 100** 이다 (`core/autoEnhance`). 장인은
    `maxLevel` 이 무한이라 엔진은 원래 +15 위로도 두들길 수 있었는데, 이 화면이
    둘 다 15 로 막고 있어서 +15 짜리 장인 무구에는 자동 강화를 걸 수가 없었다.
  */
  const cap = autoGoalMax(item);

  /*
    창을 열 때 목표를 지금 강화 수치 위로 맞춰 준다 — +12 짜리에 목표 10 은 무의미하다.

    ⚠ 위로만 올리면 안 된다. 장인 무구(상한 100)를 만지다 일반 장비(상한 15)를
    열면 목표가 100 인 채로 남는다. 그러면 시작 버튼은 켜져 있는데 +15 에서
    "목표 도달" 도 못 하고 멈춘다. 열 때마다 상한으로도 깎는다.
  */
  useEffect(() => {
    if (!visible || !item) return;
    const lim = autoGoalMax(item);
    setGoal((g) => Math.min(lim, Math.max(1, Math.max(g, item.level + 3))));
    setTyping(null);
  }, [visible, item]);

  if (!item) return null;

  /** 버튼으로 만질 때는 입력 중이던 글자를 버린다 — 두 값이 같이 보이면 안 된다 */
  const setGoalTo = (n: number) => {
    setTyping(null);
    setGoal(Math.min(cap, Math.max(1, n)));
  };

  const need = minCost([item], [{ slot: item.id, goal, from: item.level }]);
  const canStart = item.level < goal && money >= need && !auto.running;
  const row = auto.rows[0];

  return (
    <Popup
      visible={visible}
      title={`자동 강화 — ${itemName(item, KIND_NAME)}`}
      onClose={() => { if (!auto.running) { auto.clear(); onClose(); } }}
      right={auto.running ? <Tag label="진행 중" fill /> : <Money amount={money} size={11} />}
      overlay={<EnhanceFx kind={auto.fx} nonce={auto.nonce.current} />}
    >
      <ItemHead item={item} />
      <Sep />

      {auto.running || (auto.stopped && row) ? (
        <>
          {auto.running ? (
            <>
              <T size={13} bold center>강화 중…</T>
              <View style={{ marginTop: SP.sm }}>
                <ChargeGauge running />
              </View>
            </>
          ) : (
            <View style={[BORDER, { padding: SP.sm, borderWidth: 2 }]}>
              <T size={14} bold center>{STOP_MSG[auto.stopped!]}</T>
            </View>
          )}
          <Sep />
          {!!row && <AutoRowView row={row} active={auto.running} />}
          {auto.dust > 0 && <KV k="주운 가루" v={`${auto.dust}개`} dim />}
          {auto.running ? (
            <Btn label="멈추기" size="lg" style={{ marginTop: SP.md }} onPress={auto.cancel} />
          ) : (
            <Btn label="확인" size="lg" fill style={{ marginTop: SP.md }} onPress={() => { auto.clear(); onClose(); }} />
          )}
        </>
      ) : (
        <>
          <Row between>
            <T size={11} bold>목표 강화 수치</T>
            <Row gap={2}>
              <T size={16} bold>+</T>
              {/*
                숫자 칸이 그대로 입력란이다.

                장인 무구는 상한이 100 이라 한 칸씩 누르면 85번을 눌러야 한다.
                큰 걸음(+5·+10)만 붙여도 여전히 열 번 가까이 눌러야 해서,
                상점 수량과 같이 **보던 자리에서 고쳐 쓰게** 했다.
              */}
              <TextInput
                value={typing ?? String(goal)}
                onChangeText={(t) => {
                  const r = parseTyped(t, cap);
                  setTyping(r.text);
                  if (r.value !== null) setGoal(r.value);
                }}
                onBlur={() => setTyping(null)}
                keyboardType="number-pad"
                inputMode="numeric"
                selectTextOnFocus
                maxLength={String(cap).length}
                style={[
                  BORDER,
                  {
                    color: WHITE,
                    fontFamily: MONO,
                    fontSize: 16,
                    fontWeight: 'bold',
                    minWidth: 52,
                    textAlign: 'right',
                    paddingHorizontal: SP.xs,
                    paddingVertical: 1,
                  },
                ]}
              />
            </Row>
          </Row>
          <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
            <Btn label="−1" size="sm" disabled={goal <= 1} onPress={() => setGoalTo(goal - 1)} />
            <Bar value={goal} max={cap} blocks={15} height={10} />
            <Btn label="+1" size="sm" disabled={goal >= cap} onPress={() => setGoalTo(goal + 1)} />
          </Row>
          {/*
            장인 무구에만 큰 걸음을 붙인다. 상한이 15 면 +10 한 번에 끝까지 가서
            버튼이 의미가 없고, 줄만 하나 늘어난다.
          */}
          {cap > 15 && (
            <Row gap={SP.xs} style={{ marginTop: SP.xs }}>
              {[5, 10, 25].map((n) => (
                <Btn
                  key={n}
                  label={`+${n}`}
                  size="sm"
                  style={{ flex: 1 }}
                  disabled={goal >= cap}
                  onPress={() => setGoalTo(goal + n)}
                />
              ))}
              <Btn
                label={`최대 +${cap}`}
                size="sm"
                style={{ flex: 1 }}
                disabled={goal >= cap}
                onPress={() => setGoalTo(cap)}
              />
            </Row>
          )}
          {cap > 15 && (
            <T size={9} dim="dim" style={{ marginTop: SP.xs }}>
              장인의 무구는 강화 상한이 없어 +{cap}까지 걸 수 있습니다.
              더 올리려면 끝난 뒤 한 번 더 돌리세요.
            </T>
          )}

          <Sep />
          <T size={11} bold style={{ marginBottom: SP.xs }}>주문서 (매회 1장)</T>
          <ListItem
            title="사용 안 함"
            right={scroll === null ? <Tag label="선택" fill /> : undefined}
            onPress={() => setScroll(null)}
          />
          {ENHANCE_SCROLL_ORDER.map((id) => {
            const have = scrolls[id] ?? 0;
            return (
              <ListItem
                key={id}
                title={SCROLLS[id].name}
                sub={`보유 ${have}장`}
                disabled={have <= 0}
                right={scroll === id ? <Tag label="선택" fill /> : <T size={10} dim="dim">{have}</T>}
                onPress={() => setScroll(scroll === id ? null : id)}
              />
            );
          })}

          <Sep />
          <KV k="최소 필요 금액" v={fmt(need)} warn={money < need} />
          <T size={9} dim="dim">
            한 번도 실패하지 않았을 때의 금액입니다. 돈이 떨어지면 그 자리에서 멈춥니다.
          </T>
          <Btn
            label="시작"
            size="lg"
            fill={canStart}
            disabled={!canStart}
            style={{ marginTop: SP.md }}
            onPress={auto.start}
          />
          {item.level >= goal && (
            <T size={10} dim="dim" center style={{ marginTop: SP.xs }}>
              목표를 지금 강화 수치보다 높게 잡아 주세요
            </T>
          )}
        </>
      )}
    </Popup>
  );
}
