import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from '../state/TrackerContext';
import { useRestTimer } from '../state/RestTimerContext';
import { SPLIT } from '../data';
import { readSets } from '../lib/sets';
import { weekDates, todayISO, mondayIndex } from '../lib/dates';
import { colors, spacing, radius, font, tint, splitColor } from '../theme';
import { Card, SectionHeader, ProgressBar, Badge } from '../components/ui';
import type { Exercise, TrackerState } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Count done/total sets across a day's exercises.
function dayTally(log: TrackerState['workoutLog'], date: string, exercises: Exercise[]) {
  let done = 0;
  let total = 0;
  for (const ex of exercises) {
    const sets = readSets(log, date, ex.id, ex.targetSets);
    total += sets.length;
    done += sets.filter((s) => s.done).length;
  }
  return { done, total };
}

export function WorkoutScreen() {
  const { state } = useTracker();
  const week = useMemo(() => weekDates(), []);
  const today = todayISO();
  const todayIdx = mondayIndex(new Date());
  const [open, setOpen] = useState<number>(todayIdx);

  // Weekly set totals across training days.
  const weekTally = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const d of SPLIT) {
      if (!d.exercises.length) continue;
      const t = dayTally(state.workoutLog, week[d.weekday], d.exercises);
      done += t.done;
      total += t.total;
    }
    return { done, total };
  }, [state.workoutLog, week]);

  function toggleOpen(idx: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((cur) => (cur === idx ? -1 : idx));
  }

  return (
    <View>
      {/* Weekly summary */}
      <Card style={styles.summary}>
        <View style={styles.summaryHead}>
          <View>
            <Text style={styles.summaryTitle}>This week</Text>
            <Text style={styles.summarySub}>Push · Pull · Legs · sets completed</Text>
          </View>
          <View style={styles.summaryCount}>
            <Text style={styles.summaryCountValue}>
              {weekTally.done}
              <Text style={styles.summaryCountTotal}>/{weekTally.total}</Text>
            </Text>
            <Text style={styles.summaryCountLabel}>sets</Text>
          </View>
        </View>
        <ProgressBar
          value={weekTally.total ? weekTally.done / weekTally.total : 0}
          color={colors.gym}
          height={10}
        />
        <View style={styles.dots}>
          {SPLIT.map((d) => {
            const iso = week[d.weekday];
            const isRest = !d.exercises.length;
            const t = isRest ? { done: 0, total: 0 } : dayTally(state.workoutLog, iso, d.exercises);
            const ratio = t.total ? t.done / t.total : 0;
            const full = ratio >= 1;
            return (
              <View key={d.weekday} style={styles.dotCol}>
                <View
                  style={[
                    styles.dot,
                    isRest
                      ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border }
                      : full
                      ? { backgroundColor: splitColor[d.split], borderColor: splitColor[d.split] }
                      : ratio > 0
                      ? { backgroundColor: tint(splitColor[d.split], 0.35), borderColor: splitColor[d.split] }
                      : { backgroundColor: 'transparent', borderColor: colors.borderStrong },
                    iso === today && styles.dotToday,
                  ]}
                >
                  {full && !isRest ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                </View>
                <Text style={styles.dotLabel}>{d.name.slice(0, 1)}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <SectionHeader title="Weekly split" />
      {SPLIT.map((d) => (
        <DayCard
          key={d.weekday}
          weekday={d.weekday}
          date={week[d.weekday]}
          isToday={week[d.weekday] === today}
          open={open === d.weekday}
          onToggle={() => toggleOpen(d.weekday)}
        />
      ))}
    </View>
  );
}

// ---- A single day card ------------------------------------------------------
function DayCard({
  weekday,
  date,
  isToday,
  open,
  onToggle,
}: {
  weekday: number;
  date: string;
  isToday: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const { state } = useTracker();
  const day = SPLIT[weekday];
  const accent = splitColor[day.split];
  const isRest = !day.exercises.length;
  const t = isRest ? { done: 0, total: 0 } : dayTally(state.workoutLog, date, day.exercises);

  return (
    <Card style={[styles.dayCard, isToday && { borderColor: tint(accent, 0.6) }]}>
      <Pressable onPress={onToggle} style={styles.dayHead}>
        <View style={[styles.dayAccent, { backgroundColor: accent }]} />
        <View style={styles.dayInfo}>
          <View style={styles.dayTitleRow}>
            <Text style={styles.dayName}>{day.name}</Text>
            {isToday ? <Badge label="Today" color={colors.primary} /> : null}
          </View>
          <View style={styles.daySplitRow}>
            <Badge label={day.split} color={accent} solid />
            <Text style={styles.dayFocus}>{day.focus}</Text>
          </View>
        </View>
        {!isRest ? (
          <Text style={[styles.dayTally, t.done >= t.total && t.total > 0 && { color: colors.success }]}>
            {t.done}/{t.total}
          </Text>
        ) : null}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>

      {open ? (
        <View style={styles.dayBody}>
          {isRest ? (
            <View>
              {(day.notes ?? []).map((n, i) => (
                <View key={i} style={styles.noteRow}>
                  <Ionicons name="leaf-outline" size={15} color={colors.rest} />
                  <Text style={styles.noteText}>{n}</Text>
                </View>
              ))}
            </View>
          ) : (
            day.exercises.map((ex) => (
              <ExerciseBlock key={ex.id} date={date} exercise={ex} accent={accent} />
            ))
          )}
        </View>
      ) : null}
    </Card>
  );
}

// ---- One exercise with its sets --------------------------------------------
function ExerciseBlock({
  date,
  exercise,
  accent,
}: {
  date: string;
  exercise: Exercise;
  accent: string;
}) {
  const { state, toggleSet, setSetReps, addSet, removeSet } = useTracker();
  const { start } = useRestTimer();
  const sets = readSets(state.workoutLog, date, exercise.id, exercise.targetSets);
  const doneCount = sets.filter((s) => s.done).length;

  function onToggle(index: number, currentlyDone: boolean) {
    toggleSet(date, exercise.id, index, exercise.targetSets);
    if (!currentlyDone) start(); // starting a rest only when completing a set
  }

  return (
    <View style={styles.exercise}>
      <View style={styles.exHead}>
        <Text style={styles.exName}>{exercise.name}</Text>
        <Text style={styles.exTarget}>
          {exercise.targetSets}×{exercise.targetReps} · {doneCount}/{sets.length}
        </Text>
      </View>

      {/* column labels */}
      <View style={styles.colHead}>
        <Text style={[styles.colLabel, styles.colSet]}>SET</Text>
        <Text style={[styles.colLabel, styles.colReps]}>REPS</Text>
        <View style={styles.colSpacer} />
        <Text style={[styles.colLabel, styles.colCheck]}>DONE</Text>
      </View>

      {sets.map((s, i) => (
        <View key={i} style={styles.setRow}>
          <Text style={[styles.setNum, s.done && { color: accent }]}>{i + 1}</Text>
          <TextInput
            value={s.reps}
            onChangeText={(v) => setSetReps(date, exercise.id, i, v, exercise.targetSets)}
            placeholder={exercise.targetReps}
            placeholderTextColor={colors.textFaint}
            keyboardType="number-pad"
            style={styles.repsInput}
          />
          <View style={styles.colSpacer} />
          <Pressable onPress={() => onToggle(i, s.done)} style={styles.checkWrap} hitSlop={8}>
            <View
              style={[
                styles.check,
                s.done
                  ? { backgroundColor: colors.success, borderColor: colors.success }
                  : { borderColor: colors.borderStrong },
              ]}
            >
              {s.done ? <Ionicons name="checkmark" size={18} color={colors.white} /> : null}
            </View>
          </Pressable>
        </View>
      ))}

      <View style={styles.setBtns}>
        <Pressable
          onPress={() => addSet(date, exercise.id, exercise.targetSets)}
          style={({ pressed }) => [styles.addSet, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={16} color={accent} />
          <Text style={[styles.addSetText, { color: accent }]}>Add set</Text>
        </Pressable>
        {sets.length > 1 ? (
          <Pressable
            onPress={() => removeSet(date, exercise.id, sets.length - 1, exercise.targetSets)}
            style={({ pressed }) => [styles.removeSet, pressed && styles.pressed]}
            hitSlop={6}
          >
            <Ionicons name="remove" size={16} color={colors.textMuted} />
            <Text style={styles.removeSetText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: spacing.md },
  summaryHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  summaryTitle: { color: colors.text, fontSize: font.h3, fontWeight: '800' },
  summarySub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  summaryCount: { alignItems: 'flex-end' },
  summaryCountValue: { color: colors.gym, fontSize: font.h1, fontWeight: '800', lineHeight: 34 },
  summaryCountTotal: { color: colors.textMuted, fontSize: font.h3, fontWeight: '700' },
  summaryCountLabel: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  dotCol: { alignItems: 'center', gap: 6 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotToday: { transform: [{ scale: 1.12 }] },
  dotLabel: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },

  dayCard: { padding: 0, marginBottom: spacing.sm, overflow: 'hidden' },
  dayHead: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  dayAccent: { width: 4, alignSelf: 'stretch', borderRadius: 999 },
  dayInfo: { flex: 1 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 5 },
  dayName: { color: colors.text, fontSize: font.body, fontWeight: '800' },
  daySplitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayFocus: { color: colors.textMuted, fontSize: font.small, flexShrink: 1 },
  dayTally: { color: colors.textMuted, fontSize: font.body, fontWeight: '800' },
  dayBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  noteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8, marginTop: 4 },
  noteText: { color: colors.text, fontSize: font.body, flex: 1 },

  exercise: {
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  exHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  exName: { color: colors.text, fontSize: font.body, fontWeight: '800', flex: 1 },
  exTarget: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },
  colHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4, gap: spacing.sm },
  colLabel: { color: colors.textFaint, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  colSet: { width: 28, textAlign: 'center' },
  colReps: { width: 96, textAlign: 'center' },
  colSpacer: { flex: 1 },
  colCheck: { width: 44, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 8 },
  setNum: { width: 28, textAlign: 'center', color: colors.textMuted, fontSize: font.body, fontWeight: '800' },
  repsInput: {
    width: 96,
    minWidth: 0,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  checkWrap: { width: 44, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBtns: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  addSet: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  addSetText: { fontSize: font.small, fontWeight: '800' },
  removeSet: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  removeSetText: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },
  pressed: { opacity: 0.6 },
});
