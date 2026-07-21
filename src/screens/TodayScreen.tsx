import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from '../state/TrackerContext';
import { useAuth } from '../state/AuthContext';
import { SCHEDULE, GLASS_ML } from '../data';
import { todayISO } from '../lib/dates';
import { colors, spacing, radius, font, tint, categoryColor } from '../theme';
import { Card, SectionHeader, ProgressBar } from '../components/ui';
import { Ring } from '../components/Ring';

export function TodayScreen() {
  const { state, toggleTask, addWater, resetWater } = useTracker();
  const { user } = useAuth();
  const today = todayISO();

  const name = useMemo(() => {
    const raw = (user?.displayName || user?.email?.split('@')[0] || 'Athlete').split(' ')[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [user]);

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
      {/* Welcome */}
      <View style={styles.welcome}>
        <Text style={styles.welcomeHi}>Welcome back,</Text>
        <Text style={styles.welcomeName}>{name} 👋</Text>
      </View>

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
          <ProgressBar value={progress} color={progress === 1 ? colors.success : colors.primary} />
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

      {/* Daily plan — table */}
      <SectionHeader title="Daily plan" />
      <Card style={styles.tableCard}>
        <View style={styles.tHead}>
          <Text style={[styles.tHeadCell, styles.tTime]}>TIME</Text>
          <Text style={[styles.tHeadCell, styles.tTask]}>TASK</Text>
          <Text style={[styles.tHeadCell, styles.tDone]}>DONE</Text>
        </View>

        {SCHEDULE.map((item, idx) => {
          const isDone = !!checks[item.id];
          const accent = categoryColor[item.category];
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleTask(today, item.id)}
              style={({ pressed }) => [styles.tRow, idx > 0 && styles.tRowBorder, pressed && styles.pressed]}
            >
              <View style={styles.tTime}>
                <Text style={styles.timeText}>{item.time}</Text>
                <Text style={[styles.catText, { color: accent }]}>{item.category}</Text>
              </View>
              <View style={styles.tTask}>
                <Text style={[styles.taskTitle, isDone && styles.taskDone]}>{item.title}</Text>
                <Text style={styles.taskDetail}>{item.detail}</Text>
              </View>
              <View style={styles.tDone}>
                <View
                  style={[
                    styles.check,
                    isDone
                      ? { backgroundColor: colors.success, borderColor: colors.success }
                      : { borderColor: colors.borderStrong },
                  ]}
                >
                  {isDone ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: { marginBottom: spacing.lg },
  welcomeHi: { color: colors.textMuted, fontSize: font.small, fontWeight: '600' },
  welcomeName: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 2 },

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

  tableCard: { padding: 0, overflow: 'hidden' },
  tHead: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tHeadCell: { color: colors.textFaint, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  tRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'flex-start',
  },
  tRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  tTime: { width: 66, paddingRight: spacing.sm },
  tTask: { flex: 1, paddingRight: spacing.sm },
  tDone: { width: 40, alignItems: 'flex-end' },
  timeText: { color: colors.text, fontSize: font.tiny + 1, fontWeight: '800' },
  catText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', marginTop: 3, letterSpacing: 0.4 },
  taskTitle: { color: colors.text, fontSize: font.body, fontWeight: '700', marginBottom: 2 },
  taskDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskDetail: { color: colors.textMuted, fontSize: font.small, lineHeight: 18 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
