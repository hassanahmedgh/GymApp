import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from '../state/TrackerContext';
import { SPLIT } from '../data';
import { weekDates, todayISO, mondayIndex, shortDate } from '../lib/dates';
import { colors, spacing, radius, font, tint, splitColor } from '../theme';
import { Card, SectionHeader, ProgressBar, Badge } from '../components/ui';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function WorkoutScreen() {
  const { state, toggleWorkout } = useTracker();
  const week = useMemo(() => weekDates(), []);
  const today = todayISO();
  const todayIdx = mondayIndex(new Date());
  const [open, setOpen] = useState<number>(todayIdx);

  const trained = SPLIT.reduce((n, d) => {
    if (d.split === 'Rest') return n;
    return state.workout[week[d.weekday]] ? n + 1 : n;
  }, 0);
  const totalTraining = SPLIT.filter((d) => d.split !== 'Rest').length;

  function toggle(idx: number) {
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
            <Text style={styles.summarySub}>Push · Pull · Legs split</Text>
          </View>
          <View style={styles.summaryCount}>
            <Text style={styles.summaryCountValue}>
              {trained}
              <Text style={styles.summaryCountTotal}>/{totalTraining}</Text>
            </Text>
            <Text style={styles.summaryCountLabel}>sessions</Text>
          </View>
        </View>
        <ProgressBar value={trained / totalTraining} color={colors.gym} height={10} />
        <View style={styles.dots}>
          {SPLIT.map((d) => {
            const iso = week[d.weekday];
            const isDone = !!state.workout[iso];
            const isRest = d.split === 'Rest';
            return (
              <View key={d.weekday} style={styles.dotCol}>
                <View
                  style={[
                    styles.dot,
                    isRest
                      ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border }
                      : isDone
                      ? { backgroundColor: splitColor[d.split], borderColor: splitColor[d.split] }
                      : { backgroundColor: 'transparent', borderColor: colors.borderStrong },
                    iso === today && styles.dotToday,
                  ]}
                >
                  {isDone && !isRest ? (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  ) : null}
                </View>
                <Text style={styles.dotLabel}>{d.name.slice(0, 1)}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Day cards */}
      <SectionHeader title="Weekly split" />
      {SPLIT.map((d) => {
        const iso = week[d.weekday];
        const isDone = !!state.workout[iso];
        const isRest = d.split === 'Rest';
        const accent = splitColor[d.split];
        const isOpen = open === d.weekday;
        const isToday = iso === today;

        return (
          <Card key={d.weekday} style={[styles.dayCard, isToday && { borderColor: tint(accent, 0.6) }]}>
            <Pressable onPress={() => toggle(d.weekday)} style={styles.dayHead}>
              <View style={[styles.dayAccent, { backgroundColor: accent }]} />
              <View style={styles.dayInfo}>
                <View style={styles.dayTitleRow}>
                  <Text style={styles.dayName}>{d.name}</Text>
                  {isToday ? <Badge label="Today" color={colors.primary} /> : null}
                </View>
                <View style={styles.daySplitRow}>
                  <Badge label={d.split} color={accent} solid />
                  <Text style={styles.dayFocus}>{d.focus}</Text>
                </View>
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>

            {isOpen ? (
              <View style={styles.dayBody}>
                {d.lifts.map((lift, i) => (
                  <View key={i} style={styles.liftRow}>
                    <View style={[styles.liftDot, { backgroundColor: accent }]} />
                    <Text style={styles.liftText}>{lift}</Text>
                  </View>
                ))}

                {!isRest ? (
                  <Pressable
                    onPress={() => toggleWorkout(iso)}
                    style={({ pressed }) => [
                      styles.doneBtn,
                      isDone
                        ? { backgroundColor: tint(colors.success, 0.16), borderColor: colors.success }
                        : { backgroundColor: accent, borderColor: accent },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Ionicons
                      name={isDone ? 'checkmark-circle' : 'barbell-outline'}
                      size={18}
                      color={isDone ? colors.success : colors.white}
                    />
                    <Text
                      style={[
                        styles.doneBtnText,
                        { color: isDone ? colors.success : colors.white },
                      ]}
                    >
                      {isDone ? `Completed · ${shortDate(iso)}` : 'Mark as done'}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.restNote}>
                    <Ionicons name="bed-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.restNoteText}>Recovery day — no session to log.</Text>
                  </View>
                )}
              </View>
            ) : null}
          </Card>
        );
      })}
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
  summaryCountLabel: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700', textTransform: 'uppercase' },
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
  dayBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 2,
  },
  liftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 7 },
  liftDot: { width: 6, height: 6, borderRadius: 3 },
  liftText: { color: colors.text, fontSize: font.body, flex: 1 },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.md,
  },
  doneBtnText: { fontSize: font.body, fontWeight: '800' },
  restNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  restNoteText: { color: colors.textMuted, fontSize: font.small },
});
