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

// A prescribed exercise within a training day.
export interface Exercise {
  id: string;
  name: string;
  targetSets: number; // default number of sets (always >= 2)
  targetReps: string; // e.g. "6–8", "AMRAP", "15"
}

// One day in the Push / Pull / Legs weekly split.
export interface SplitDay {
  weekday: number; // 0 = Monday ... 6 = Sunday
  name: string;
  split: SplitKey;
  focus: string;
  exercises: Exercise[]; // empty on rest days
  notes?: string[]; // used on rest days
}

// One logged set of an exercise.
export interface SetEntry {
  done: boolean;
  reps: string;
  weight: string;
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
  // Set-by-set workout log: date -> exerciseId -> sets.
  workoutLog: Record<string, Record<string, SetEntry[]>>;
  // Body measurement log, newest first.
  measurements: Measurement[];
  units: Units;
  waterGoalMl: number;
  restSeconds: number;
  updatedAt: number;
}

export const DEFAULT_STATE: TrackerState = {
  dayChecks: {},
  water: {},
  workoutLog: {},
  measurements: [],
  units: { waist: 'in', weight: 'kg' },
  waterGoalMl: 4000,
  restSeconds: 90,
  updatedAt: 0,
};

export type SyncStatus = 'offline' | 'connecting' | 'synced' | 'error' | 'local';
