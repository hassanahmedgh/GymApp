import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from '../state/TrackerContext';
import { useAuth } from '../state/AuthContext';
import { colors, spacing, radius, font, tint } from '../theme';
import { Card, SectionHeader, Divider } from '../components/ui';

const REST_PRESETS = [60, 90, 120, 180];

function fmtRest(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function SettingsScreen() {
  const { state, setRestSeconds, setUnits, setWaterGoal } = useTracker();
  const { user, logout } = useAuth();
  const rest = state.restSeconds;
  const goalL = (state.waterGoalMl / 1000).toFixed(1);

  return (
    <View>
      {/* Rest timer */}
      <Card style={styles.card}>
        <SectionHeader title="Rest timer" />
        <Text style={styles.help}>
          Pops up automatically each time you complete a set.
        </Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setRestSeconds(rest - 15)}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          >
            <Ionicons name="remove" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.stepValue}>
            <Text style={styles.stepValueText}>{fmtRest(rest)}</Text>
          </View>
          <Pressable
            onPress={() => setRestSeconds(rest + 15)}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.presets}>
          {REST_PRESETS.map((p) => {
            const active = rest === p;
            return (
              <Pressable
                key={p}
                onPress={() => setRestSeconds(p)}
                style={[
                  styles.preset,
                  active
                    ? { backgroundColor: tint(colors.primary, 0.18), borderColor: colors.primary }
                    : { borderColor: colors.border },
                ]}
              >
                <Text style={[styles.presetText, active && { color: colors.primary }]}>
                  {fmtRest(p)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Units */}
      <Card style={styles.card}>
        <SectionHeader title="Units" />
        <SegRow
          label="Waist"
          value={state.units.waist}
          options={['in', 'cm']}
          onPick={(v) => setUnits({ waist: v as 'in' | 'cm' })}
        />
        <Divider style={{ marginVertical: spacing.md }} />
        <SegRow
          label="Weight"
          value={state.units.weight}
          options={['kg', 'lb']}
          onPick={(v) => setUnits({ weight: v as 'kg' | 'lb' })}
        />
      </Card>

      {/* Water goal */}
      <Card style={styles.card}>
        <SectionHeader title="Daily water goal" />
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setWaterGoal(state.waterGoalMl - 250)}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          >
            <Ionicons name="remove" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.stepValue}>
            <Text style={styles.stepValueText}>{goalL} L</Text>
          </View>
          <Pressable
            onPress={() => setWaterGoal(state.waterGoalMl + 250)}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={22} color={colors.text} />
          </Pressable>
        </View>
      </Card>

      {/* Account */}
      <Card style={styles.card}>
        <SectionHeader title="Account" />
        <View style={styles.account}>
          <View style={[styles.avatar, { backgroundColor: tint(colors.primary, 0.18) }]}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.accName}>{user?.displayName || 'Signed in'}</Text>
            <Text style={styles.accEmail}>{user?.email ?? '—'}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => logout()}
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </Card>

      <Text style={styles.footer}>FastFit · your data syncs to the cloud</Text>
    </View>
  );
}

function SegRow({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: string;
  options: string[];
  onPick: (v: string) => void;
}) {
  return (
    <View style={styles.segRow}>
      <Text style={styles.segLabel}>{label}</Text>
      <View style={styles.seg}>
        {options.map((o) => {
          const active = o === value;
          return (
            <Pressable
              key={o}
              onPress={() => onPick(o)}
              style={[styles.segBtn, active && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.segText, active && { color: colors.white }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  help: { color: colors.textMuted, fontSize: font.small, marginTop: -4, marginBottom: spacing.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { flex: 1, alignItems: 'center' },
  stepValueText: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  presets: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  preset: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
  },
  presetText: { color: colors.textMuted, fontSize: font.small, fontWeight: '800' },

  segRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  segLabel: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  segBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: radius.pill },
  segText: { color: colors.textMuted, fontSize: font.small, fontWeight: '800' },

  account: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accName: { color: colors.text, fontSize: font.body, fontWeight: '800' },
  accEmail: { color: colors.textMuted, fontSize: font.small, marginTop: 1 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: tint(colors.danger, 0.5),
    backgroundColor: tint(colors.danger, 0.1),
    borderRadius: radius.pill,
    paddingVertical: 12,
  },
  signOutText: { color: colors.danger, fontSize: font.body, fontWeight: '800' },
  footer: { color: colors.textFaint, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.sm },
  pressed: { opacity: 0.6 },
});
