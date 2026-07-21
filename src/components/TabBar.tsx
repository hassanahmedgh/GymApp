import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing } from '../theme';

export type TabKey = 'today' | 'workout' | 'progress';

const TABS: { key: TabKey; label: string; icon: string; iconActive: string }[] = [
  { key: 'today', label: 'Today', icon: 'checkbox-outline', iconActive: 'checkbox' },
  { key: 'workout', label: 'Workout', icon: 'barbell-outline', iconActive: 'barbell' },
  { key: 'progress', label: 'Progress', icon: 'trending-up-outline', iconActive: 'trending-up' },
];

export function TabBar({
  active,
  onChange,
  bottomInset,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={styles.tab}>
            <Ionicons
              name={(isActive ? t.iconActive : t.icon) as any}
              size={23}
              color={isActive ? colors.primary : colors.textFaint}
            />
            <Text style={[styles.label, { color: isActive ? colors.primary : colors.textFaint }]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: font.tiny, fontWeight: '700' },
});
