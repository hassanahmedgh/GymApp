import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TrackerProvider, useTracker } from './src/state/TrackerContext';
import { TabBar, type TabKey } from './src/components/TabBar';
import { TodayScreen } from './src/screens/TodayScreen';
import { WorkoutScreen } from './src/screens/WorkoutScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { colors, spacing, font, radius, tint } from './src/theme';
import { longDate } from './src/lib/dates';
import type { SyncStatus } from './src/types';

const TAB_META: Record<TabKey, { title: string; subtitle: string }> = {
  today: { title: 'Today', subtitle: longDate() },
  workout: { title: 'Workout', subtitle: 'Push · Pull · Legs' },
  progress: { title: 'Progress', subtitle: 'Body measurements' },
};

function SyncChip({ status }: { status: SyncStatus }) {
  const map: Record<SyncStatus, { label: string; color: string; icon: string }> = {
    synced: { label: 'Synced', color: colors.success, icon: 'cloud-done-outline' },
    connecting: { label: 'Syncing', color: colors.warning, icon: 'sync-outline' },
    local: { label: 'On device', color: colors.textMuted, icon: 'phone-portrait-outline' },
    error: { label: 'Offline', color: colors.danger, icon: 'cloud-offline-outline' },
    offline: { label: 'Offline', color: colors.danger, icon: 'cloud-offline-outline' },
  };
  const s = map[status];
  return (
    <View style={[styles.chip, { backgroundColor: tint(s.color, 0.14) }]}>
      <Ionicons name={s.icon as any} size={13} color={s.color} />
      <Text style={[styles.chipText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const { ready, sync } = useTracker();
  const [tab, setTab] = useState<TabKey>('today');
  const meta = TAB_META[tab];

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <View style={[styles.logoMark, { backgroundColor: tint(colors.primary, 0.16) }]}>
          <Ionicons name="flame" size={30} color={colors.primary} />
        </View>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: tint(colors.primary, 0.16) }]}>
              <Ionicons name="flame" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>{meta.title}</Text>
              <Text style={styles.subtitle}>{meta.subtitle}</Text>
            </View>
          </View>
          <SyncChip status={sync} />
        </View>
      </View>

      {/* Active screen */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'today' && <TodayScreen />}
        {tab === 'workout' && <WorkoutScreen />}
        {tab === 'progress' && <ProgressScreen />}
      </ScrollView>

      <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TrackerProvider>
        <Root />
      </TrackerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: font.small, marginTop: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: font.tiny, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
});
