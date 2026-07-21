import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { colors, radius, spacing, font, tint } from '../theme';

// ---- Card -------------------------------------------------------------------
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---- Badge / chip -----------------------------------------------------------
export function Badge({
  label,
  color,
  solid = false,
}: {
  label: string;
  color: string;
  solid?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        solid ? { backgroundColor: color } : { backgroundColor: tint(color, 0.16) },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: solid ? colors.white : color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ---- Section header ---------------------------------------------------------
export function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

// ---- Linear progress bar ----------------------------------------------------
export function ProgressBar({
  value,
  color = colors.primary,
  height = 8,
  track = colors.surfaceAlt,
}: {
  value: number; // 0..1
  color?: string;
  height?: number;
  track?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.barTrack, { height, backgroundColor: track }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height,
          borderRadius: height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// ---- Pill button ------------------------------------------------------------
export function PillButton({
  label,
  onPress,
  color = colors.primary,
  variant = 'solid',
  icon,
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const bg =
    variant === 'solid' ? color : variant === 'outline' ? 'transparent' : tint(color, 0.14);
  const border = variant === 'outline' ? color : 'transparent';
  const fg = variant === 'solid' ? colors.white : color;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: bg, borderColor: border },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

// ---- Stat tile --------------------------------------------------------------
export function StatTile({
  label,
  value,
  unit,
  color = colors.text,
  style,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.stat, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: font.tiny,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
  },
  barTrack: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: font.body,
    fontWeight: '700',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  statValue: {
    fontSize: font.h2,
    fontWeight: '800',
  },
  statUnit: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  muted: {
    color: colors.textMuted,
    fontSize: font.small,
  },
});
