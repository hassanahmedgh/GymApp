import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from '../state/TrackerContext';
import { SCHEDULE, GLASS_ML } from '../data';
import { todayISO } from '../lib/dates';
import { colors, spacing, radius, font, tint } from '../theme';
import { Card, SectionHeader, ProgressBar } from '../components/ui';
import { Ring } from '../components/Ring';
import { ScheduleRow } from '../components/ScheduleRow';

export function TodayScreen() {
  const { state, toggleTask, addWater, resetWater } = useTracker();
  const today = todayISO();

  const checks = state.dayChecks[today] ?? {};
  const done = useMemo(
    () => SCHEDULE.reduce((n, i) => (checks[i.id] ? n + 1 : n), 0),
    [checks]
  );
  const total = SCHEDULE.length;
  const progress = done / total;

  const water = state.water[today] ?? 0;
  const goal = state.waterGoalMl;
  const waterPct = Math.min(1, water / goal);
  const glasses = Math.round(water / GLASS_ML);
  const litres = (water / 1000).toFixed(2);
  const goalLitres = (goal / 1000).toFixed(1);

  return (
    <View>
      {/* Daily completion summary */}
      <Card style={styles.summary}>
        <Ring progress={progress} color={progress === 1 ? colors.success : colors.primary}>
          <Text style={styles.ringPct}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.ringSub}>
            {done}/{total}
          </Text>
        </Ring>
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>
            {progress === 1 ? 'Day complete 🎉' : 'Daily checklist'}
          </Text>
          <Text style={styles.summaryDesc}>
            {progress === 1
              ? 'Every task done. Great discipline today.'
              : `${total - done} task${total - done === 1 ? '' : 's'} left. Stay locked in.`}
          </Text>
          <View style={styles.summaryBar}>
            <ProgressBar
              value={progress}
              color={progress === 1 ? colors.success : colors.primary}
            />
          </View>
        </View>
      </Card>

      {/* Water tracker */}
      <Card style={styles.water}>
        <View style={styles.waterTop}>
          <View style={styles.waterHead}>
            <View style={[styles.waterIcon, { backgroundColor: tint(colors.primary, 0.16) }]}>
              <Ionicons name="water" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.waterTitle}>Water intake</Text>
              <Text style={styles.waterSub}>Goal · {goalLitres} L / day</Text>
            </View>
          </View>
          <Pressable onPress={() => resetWater(today)} hitSlop={10}>
            <Text style={styles.reset}>Reset</Text>
          </Pressable>
        </View>

        <View style={styles.waterValueRow}>
          <Text style={styles.waterValue}>{litres}</Text>
          <Text style={styles.waterUnit}>L</Text>
          <Text style={styles.waterGlasses}>· {glasses} glasses</Text>
        </View>

        <View style={styles.waterBar}>
          <ProgressBar
            value={waterPct}
            color={waterPct >= 1 ? colors.success : colors.primary}
            height={10}
          />
        </View>

        <View style={styles.waterBtns}>
          <Pressable
            onPress={() => addWater(today, -GLASS_ML)}
            style={({ pressed }) => [styles.waterBtn, styles.waterBtnGhost, pressed && styles.pressed]}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
            <Text style={styles.waterBtnGhostText}>Glass</Text>
          </Pressable>
          <Pressable
            onPress={() => addWater(today, GLASS_ML)}
            style={({ pressed }) => [styles.waterBtn, styles.waterBtnSolid, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.waterBtnSolidText}>Glass (250 ml)</Text>
          </Pressable>
        </View>
      </Card>

      {/* Schedule */}
      <SectionHeader title="Daily plan" />
      {SCHEDULE.map((item) => (
        <ScheduleRow
          key={item.id}
          item={item}
          done={!!checks[item.id]}
          onToggle={() => toggleTask(today, item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  ringPct: { color: colors.text, fontSize: 26, fontWeight: '800' },
  ringSub: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginTop: -2 },
  summaryText: { flex: 1 },
  summaryTitle: { color: colors.text, fontSize: font.h3, fontWeight: '800', marginBottom: 4 },
  summaryDesc: { color: colors.textMuted, fontSize: font.small, lineHeight: 19, marginBottom: 12 },
  summaryBar: {},

  water: { marginBottom: spacing.md },
  waterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  waterHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  waterIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  waterSub: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '600', marginTop: 1 },
  reset: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },
  waterValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: spacing.sm },
  waterValue: { color: colors.text, fontSize: 34, fontWeight: '800', lineHeight: 38 },
  waterUnit: { color: colors.textMuted, fontSize: font.h3, fontWeight: '700', marginBottom: 4 },
  waterGlasses: { color: colors.textMuted, fontSize: font.small, fontWeight: '600', marginBottom: 6 },
  waterBar: { marginBottom: spacing.lg },
  waterBtns: { flexDirection: 'row', gap: spacing.md },
  waterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  waterBtnGhost: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  waterBtnGhostText: { color: colors.text, fontWeight: '700', fontSize: font.body },
  waterBtnSolid: { backgroundColor: colors.primary },
  waterBtnSolidText: { color: colors.white, fontWeight: '700', fontSize: font.body },
  pressed: { opacity: 0.7 },
});
