import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, font, tint, categoryColor } from '../theme';
import type { ScheduleItem } from '../types';

// One row of the daily schedule with a tappable completion checkbox.
export function ScheduleRow({
  item,
  done,
  onToggle,
}: {
  item: ScheduleItem;
  done: boolean;
  onToggle: () => void;
}) {
  const accent = categoryColor[item.category];
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint(accent, 0.16) }]}>
        <Ionicons name={item.icon as any} size={20} color={accent} />
      </View>

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.time}>{item.time}</Text>
          <View style={[styles.tag, { backgroundColor: tint(accent, 0.16) }]}>
            <Text style={[styles.tagText, { color: accent }]}>{item.category}</Text>
          </View>
        </View>
        <Text style={[styles.title, done && styles.titleDone]}>{item.title}</Text>
        <Text style={styles.detail}>{item.detail}</Text>
      </View>

      <View
        style={[
          styles.check,
          done
            ? { backgroundColor: colors.success, borderColor: colors.success }
            : { borderColor: colors.borderStrong },
        ]}
      >
        {done ? <Ionicons name="checkmark" size={18} color={colors.white} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 3,
  },
  time: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '700',
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  detail: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
