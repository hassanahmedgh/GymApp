import type { CategoryKey, SplitKey } from './theme';

// A single item on the daily fasting / gym schedule.
export interface ScheduleItem {
  id: string;
  time: string;
  category: CategoryKey;
  title: string;
  detail: string;
  icon: string; // Ionicons name
}

// One day in the Push / Pull / Legs weekly split.
export interface SplitDay {
  weekday: number; // 0 = Monday ... 6 = Sunday
  name: string;
  split: SplitKey;
  focus: string;
  lifts: string[];
}

// A logged body measurement.
export interface Measurement {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  waist?: number | null;
  weight?: number | null;
}

export interface Units {
  waist: 'in' | 'cm';
  weight: 'kg' | 'lb';
}

// The full persisted app state — a single blob, local-first and cloud-synced.
export interface TrackerState {
  // Daily schedule completion, keyed by ISO date then task id.
  dayChecks: Record<string, Record<string, boolean>>;
  // Water intake in millilitres, keyed by ISO date.
  water: Record<string, number>;
  // Workout completion flag, keyed by ISO date.
  workout: Record<string, boolean>;
  // Body measurement log, newest first.
  measurements: Measurement[];
  units: Units;
  waterGoalMl: number;
  updatedAt: number;
}

export const DEFAULT_STATE: TrackerState = {
  dayChecks: {},
  water: {},
  workout: {},
  measurements: [],
  units: { waist: 'in', weight: 'kg' },
  waterGoalMl: 4000,
  updatedAt: 0,
};

export type SyncStatus = 'offline' | 'connecting' | 'synced' | 'error' | 'local';
