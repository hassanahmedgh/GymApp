import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { useTracker } from '../state/TrackerContext';
import { todayISO, shortDate } from '../lib/dates';
import { colors, spacing, radius, font, tint } from '../theme';
import { Card, SectionHeader, Divider } from '../components/ui';
import { Calendar } from '../components/Calendar';
import type { Measurement } from '../types';

export function ProgressScreen() {
  const { state, addMeasurement, deleteMeasurement, setUnits } = useTracker();
  const { measurements, units } = state;

  const [waist, setWaist] = useState('');
  const [weight, setWeight] = useState('');

  const today = todayISO();

  // Oldest → newest, for charts and deltas.
  const chronological = useMemo(
    () => [...measurements].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [measurements]
  );

  const waistSeries = chronological.filter((m) => m.waist != null) as Required<Measurement>[];
  const weightSeries = chronological.filter((m) => m.weight != null) as Required<Measurement>[];

  const waistNow = waistSeries.at(-1)?.waist ?? null;
  const waistFirst = waistSeries[0]?.waist ?? null;
  const waistDelta = waistNow != null && waistFirst != null ? waistNow - waistFirst : null;

  const weightNow = weightSeries.at(-1)?.weight ?? null;
  const weightFirst = weightSeries[0]?.weight ?? null;
  const weightDelta = weightNow != null && weightFirst != null ? weightNow - weightFirst : null;

  function save() {
    const w = parseFloat(waist);
    const bw = parseFloat(weight);
    const hasW = !Number.isNaN(w);
    const hasBW = !Number.isNaN(bw);
    if (!hasW && !hasBW) return;
    addMeasurement({
      date: today,
      waist: hasW ? w : null,
      weight: hasBW ? bw : null,
    });
    setWaist('');
    setWeight('');
    Keyboard.dismiss();
  }

  return (
    <View>
      {/* Activity calendar */}
      <SectionHeader title="Activity" />
      <Calendar />

      {/* Metric summary */}
      <View style={styles.metrics}>
        <MetricCard
          label="Waist"
          value={waistNow}
          unit={units.waist}
          delta={waistDelta}
          color={colors.waist}
          icon="resize-outline"
        />
        <MetricCard
          label="Weight"
          value={weightNow}
          unit={units.weight}
          delta={weightDelta}
          color={colors.weight}
          icon="scale-outline"
        />
      </View>

      {/* Log entry */}
      <Card style={styles.logCard}>
        <SectionHeader title="Log today" />
        <View style={styles.inputRow}>
          <Field
            label="Waist"
            value={waist}
            onChange={setWaist}
            unit={units.waist}
            onToggleUnit={() =>
              setUnits({ waist: units.waist === 'in' ? 'cm' : 'in' })
            }
            accent={colors.waist}
          />
          <Field
            label="Weight"
            value={weight}
            onChange={setWeight}
            unit={units.weight}
            onToggleUnit={() =>
              setUnits({ weight: units.weight === 'kg' ? 'lb' : 'kg' })
            }
            accent={colors.weight}
          />
        </View>
        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.saveBtnText}>Save entry · {shortDate(today)}</Text>
        </Pressable>
        <Text style={styles.hint}>
          Measure your waist relaxed, at the navel — same time & weekday each week.
        </Text>
      </Card>

      {/* Waist trend chart */}
      {waistSeries.length >= 2 ? (
        <Card style={styles.chartCard}>
          <SectionHeader title="Waist trend" />
          <Sparkline
            points={waistSeries.map((m) => m.waist as number)}
            color={colors.waist}
            unit={units.waist}
          />
        </Card>
      ) : null}

      {/* History */}
      <SectionHeader title="History" />
      {measurements.length === 0 ? (
        <Card>
          <View style={styles.empty}>
            <Ionicons name="body-outline" size={28} color={colors.textFaint} />
            <Text style={styles.emptyText}>No measurements yet.</Text>
            <Text style={styles.emptySub}>Log your first waist & weight above.</Text>
          </View>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {measurements.map((m, i) => (
            <View key={m.id}>
              {i > 0 ? <Divider style={{ marginHorizontal: spacing.lg }} /> : null}
              <View style={styles.histRow}>
                <View style={styles.histDate}>
                  <Text style={styles.histDateText}>{shortDate(m.date)}</Text>
                </View>
                <View style={styles.histValues}>
                  {m.waist != null ? (
                    <Text style={styles.histVal}>
                      <Text style={{ color: colors.waist }}>{m.waist}</Text>
                      <Text style={styles.histUnit}> {units.waist} waist</Text>
                    </Text>
                  ) : null}
                  {m.weight != null ? (
                    <Text style={styles.histVal}>
                      <Text style={{ color: colors.weight }}>{m.weight}</Text>
                      <Text style={styles.histUnit}> {units.weight}</Text>
                    </Text>
                  ) : null}
                </View>
                <Pressable onPress={() => deleteMeasurement(m.id)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
                </Pressable>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

// ---- Metric summary card ----------------------------------------------------
function MetricCard({
  label,
  value,
  unit,
  delta,
  color,
  icon,
}: {
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  color: string;
  icon: string;
}) {
  // For both waist and weight in a cut, down = good (green).
  const down = delta != null && delta < 0;
  const flat = delta == null || delta === 0;
  const deltaColor = flat ? colors.textMuted : down ? colors.success : colors.danger;
  return (
    <Card style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: tint(color, 0.16) }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value != null ? value : '—'}</Text>
        {value != null ? <Text style={styles.metricUnit}>{unit}</Text> : null}
      </View>
      {delta != null ? (
        <View style={styles.metricDelta}>
          <Ionicons
            name={down ? 'arrow-down' : delta > 0 ? 'arrow-up' : 'remove'}
            size={12}
            color={deltaColor}
          />
          <Text style={[styles.metricDeltaText, { color: deltaColor }]}>
            {Math.abs(delta).toFixed(1)} {unit} total
          </Text>
        </View>
      ) : (
        <Text style={styles.metricDeltaMuted}>no trend yet</Text>
      )}
    </Card>
  );
}

// ---- Labelled numeric field with a unit toggle ------------------------------
function Field({
  label,
  value,
  onChange,
  unit,
  onToggleUnit,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  onToggleUnit: () => void;
  accent: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="decimal-pad"
          style={styles.fieldInput}
        />
        <Pressable onPress={onToggleUnit} style={[styles.unitToggle, { backgroundColor: tint(accent, 0.16) }]}>
          <Text style={[styles.unitToggleText, { color: accent }]}>{unit}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---- Minimal line chart -----------------------------------------------------
function Sparkline({
  points,
  color,
  unit,
}: {
  points: number[];
  color: string;
  unit: string;
}) {
  const W = 280;
  const H = 120;
  const pad = 10;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (p - min) / range) * (H - pad * 2);
    return { x, y };
  });
  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <View>
      <View style={styles.chartHead}>
        <Text style={styles.chartMax}>{max} {unit}</Text>
        <Text style={styles.chartMin}>{min} {unit}</Text>
      </View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={colors.border} strokeWidth={1} />
        <Polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={3.5} fill={colors.bg} stroke={color} strokeWidth={2} />
        ))}
      </Svg>
      <Text style={styles.chartCaption}>
        {points.length} entries · {(points[points.length - 1] - points[0]).toFixed(1)} {unit} since start
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  metricCard: { flex: 1 },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricLabel: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 2 },
  metricValue: { color: colors.text, fontSize: font.h1, fontWeight: '800', lineHeight: 34 },
  metricUnit: { color: colors.textMuted, fontSize: font.body, fontWeight: '700', marginBottom: 4 },
  metricDelta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  metricDeltaText: { fontSize: font.tiny, fontWeight: '700' },
  metricDeltaMuted: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '600', marginTop: 6 },

  logCard: { marginBottom: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  field: { flex: 1 },
  fieldLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginBottom: 6 },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    paddingRight: 6,
  },
  fieldInput: { flex: 1, color: colors.text, fontSize: font.h3, fontWeight: '700', paddingVertical: 12 },
  unitToggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm },
  unitToggleText: { fontSize: font.small, fontWeight: '800' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  saveBtnText: { color: colors.white, fontSize: font.body, fontWeight: '800' },
  hint: { color: colors.textFaint, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.md, lineHeight: 16 },

  chartCard: { marginBottom: spacing.md },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  chartMax: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },
  chartMin: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' },
  chartCaption: { color: colors.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.sm },

  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: 6 },
  emptyText: { color: colors.textMuted, fontSize: font.body, fontWeight: '700' },
  emptySub: { color: colors.textFaint, fontSize: font.small },

  histRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  histDate: { width: 58 },
  histDateText: { color: colors.textMuted, fontSize: font.small, fontWeight: '700' },
  histValues: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  histVal: { fontSize: font.body, fontWeight: '800' },
  histUnit: { color: colors.textMuted, fontSize: font.small, fontWeight: '600' },
});
