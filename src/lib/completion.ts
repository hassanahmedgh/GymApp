import { SCHEDULE, SPLIT } from '../data';
import { readSets } from './sets';
import { mondayIndex, fromISO } from './dates';
import type { TrackerState } from '../types';

// How much of a given day was completed, 0..1, combining the daily plan
// (schedule tasks) with that weekday's workout sets. Used to "shine" calendar days.
export function dayCompletion(state: TrackerState, iso: string): number {
  const checks = state.dayChecks[iso] ?? {};
  let done = SCHEDULE.reduce((n, i) => (checks[i.id] ? n + 1 : n), 0);
  let total = SCHEDULE.length;

  const day = SPLIT[mondayIndex(fromISO(iso))];
  if (day && day.exercises.length) {
    for (const ex of day.exercises) {
      const sets = readSets(state.workoutLog, iso, ex.id, ex.targetSets);
      total += sets.length;
      done += sets.filter((s) => s.done).length;
    }
  }
  return total ? done / total : 0;
}
