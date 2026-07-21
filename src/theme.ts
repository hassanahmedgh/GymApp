// Central design system — colors, spacing, radius, typography.
// Dark, premium fitness aesthetic with vivid category accents.

export const colors = {
  // Surfaces
  bg: '#0C0F14',
  bgElevated: '#11151C',
  surface: '#161B23',
  surfaceAlt: '#1C222C',
  border: '#242B36',
  borderStrong: '#333C49',

  // Text
  text: '#F3F6FA',
  textMuted: '#98A2B3',
  textFaint: '#5F6B7A',

  // Brand / primary
  primary: '#4F8DFB',
  primaryDim: '#20304C',

  // Feedback
  success: '#22C55E',
  successDim: '#123021',
  danger: '#EF4444',
  warning: '#F59E0B',

  // Category accents (Today schedule)
  fasting: '#F59E0B',
  movement: '#14B8A6',
  meal1: '#22C55E',
  meal2: '#F97316',
  preworkout: '#A78BFA',
  gym: '#8B5CF6',

  // Split accents (Workout)
  push: '#EF4444',
  pull: '#3B82F6',
  legs: '#22C55E',
  rest: '#94A3B8',

  // Metrics
  waist: '#14B8A6',
  weight: '#F59E0B',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const font = {
  h1: 30,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
} as const;

// Translucent tint of an accent color for chips / backgrounds.
export function tint(hex: string, alpha = 0.16): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type CategoryKey =
  | 'Fasting'
  | 'Movement'
  | 'Meal 1'
  | 'Meal 2'
  | 'Pre-Workout'
  | 'Gym';

export const categoryColor: Record<CategoryKey, string> = {
  Fasting: colors.fasting,
  Movement: colors.movement,
  'Meal 1': colors.meal1,
  'Meal 2': colors.meal2,
  'Pre-Workout': colors.preworkout,
  Gym: colors.gym,
};

export type SplitKey = 'Push' | 'Pull' | 'Legs' | 'Rest';

export const splitColor: Record<SplitKey, string> = {
  Push: colors.push,
  Pull: colors.pull,
  Legs: colors.legs,
  Rest: colors.rest,
};
