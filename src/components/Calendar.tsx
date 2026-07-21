import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from '../state/TrackerContext';
import { dayCompletion } from '../lib/completion';
import { toISO, todayISO } from '../lib/dates';
import { colors, spacing, radius, font, tint } from '../theme';
import { Card } from './ui';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Colour a day by how much of it was completed:
//   0 → colourless, partial → dimmer green, 100% → brightest + glow.
function cellVisual(ratio: number): { bg: string; text: string; glow: boolean } {
  if (ratio <= 0) return { bg: colors.surfaceAlt, text: colors.textFaint, glow: false };
  if (ratio >= 0.999) return { bg: colors.success, text: '#08140C', glow: true };
  const alpha = 0.18 + ratio * 0.72;
  return { bg: tint(colors.success, alpha), text: ratio > 0.5 ? colors.white : colors.text, glow: false };
}

export function Calendar() {
  const { state } = useTracker();
  const now = new Date();
  const [{ y, m }, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const today = todayISO();

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  // Monday-based index of the 1st.
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  function shift(delta: number) {
    const d = new Date(y, m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  }

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>
          {MONTHS[m]} {y}
        </Text>
        <View style={styles.nav}>
          <Pressable onPress={() => shift(-1)} hitSlop={8} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => shift(1)} hitSlop={8} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.dowRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.dow}>
            {w}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((d, di) => {
            if (d == null) return <View key={di} style={styles.cell} />;
            const iso = toISO(new Date(y, m, d));
            const ratio = dayCompletion(state, iso);
            const v = cellVisual(ratio);
            const isToday = iso === today;
            return (
              <View key={di} style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    { backgroundColor: v.bg },
                    v.glow && styles.glow,
                    isToday && styles.today,
                  ]}
                >
                  <Text style={[styles.dayNum, { color: v.text }]}>{d}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={[styles.legendDot, { backgroundColor: colors.surfaceAlt }]} />
        <View style={[styles.legendDot, { backgroundColor: tint(colors.success, 0.35) }]} />
        <View style={[styles.legendDot, { backgroundColor: tint(colors.success, 0.65) }]} />
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={styles.legendText}>More</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: font.h3, fontWeight: '800' },
  nav: { flexDirection: 'row', gap: spacing.sm },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: {
    flex: 1,
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: font.tiny,
    fontWeight: '800',
  },
  week: { flexDirection: 'row' },
  cell: { flex: 1, aspectRatio: 1, padding: 3 },
  day: {
    flex: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    shadowColor: colors.success,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  today: { borderWidth: 2, borderColor: colors.primary },
  dayNum: { fontSize: font.small, fontWeight: '800' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: spacing.md,
  },
  legendText: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700', marginHorizontal: 4 },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
});
