import { MIN_SETS } from '../data';
import type { SetEntry, TrackerState } from '../types';

export function emptySet(): SetEntry {
  return { done: false, reps: '', weight: '' };
}

// A fresh array of blank sets, never fewer than the minimum.
export function seededSets(targetSets: number): SetEntry[] {
  const n = Math.max(targetSets, MIN_SETS);
  return Array.from({ length: n }, emptySet);
}

// The stored sets for an exercise on a date, or a seeded default if none logged yet.
export function readSets(
  log: TrackerState['workoutLog'],
  date: string,
  exId: string,
  targetSets: number
): SetEntry[] {
  return log[date]?.[exId] ?? seededSets(targetSets);
}
