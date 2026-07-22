import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { TrackerProvider, useTracker } from './src/state/TrackerContext';
import { RestTimerProvider } from './src/state/RestTimerContext';
import { TabBar, type TabKey } from './src/components/TabBar';
import { AnimatedSplash } from './src/components/AnimatedSplash';
import { Reminders } from './src/components/Reminders';
import { AuthScreen } from './src/screens/AuthScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { WorkoutScreen } from './src/screens/WorkoutScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors, spacing, font, radius, tint } from './src/theme';
import { longDate } from './src/lib/dates';
import type { SyncStatus } from './src/types';

const TAB_META: Record<TabKey, { title: string; subtitle: string }> = {
  today: { title: 'Today', subtitle: longDate() },
  workout: { title: 'Workout', subtitle: 'Push · Pull · Legs' },
  progress: { title: 'Progress', subtitle: 'Body measurements' },
  settings: { title: 'Settings', subtitle: 'Preferences & account' },
};

function Splash() {
  return <AnimatedSplash />;
}

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

// The signed-in app: header, tabs, screens. Rendered inside TrackerProvider.
function MainApp() {
  const insets = useSafeAreaInsets();
  const { ready, sync } = useTracker();
  const [tab, setTab] = useState<TabKey>('today');
  const meta = TAB_META[tab];

  // Fade + slide the content in whenever the tab changes (and on first mount).
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [tab]);
  const contentTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  if (!ready) return <Splash />;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: anim, transform: [{ translateY: contentTranslate }] }}>
          {tab === 'today' && <TodayScreen />}
          {tab === 'workout' && <WorkoutScreen />}
          {tab === 'progress' && <ProgressScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </Animated.View>
      </ScrollView>

      <Reminders />
      <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />
      <StatusBar style="light" />
    </View>
  );
}

// Decides between the auth screen and the app based on sign-in state.
function Gate() {
  const { user, initializing } = useAuth();

  if (initializing) return <Splash />;
  if (!user) {
    return (
      <>
        <AuthScreen />
        <StatusBar style="light" />
      </>
    );
  }
  return (
    // key by uid so switching accounts fully re-initialises the store.
    <TrackerProvider key={user.uid} uid={user.uid}>
      <RestTimerProvider>
        <MainApp />
      </RestTimerProvider>
    </TrackerProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
