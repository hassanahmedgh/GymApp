import { dayCompletion } from './completion';
import { toISO, fromISO } from './dates';
import type { TrackerState } from '../types';

// A day "counts" toward a streak once you've done a solid chunk of it.
export const STREAK_THRESHOLD = 0.6;

// Consecutive qualifying days ending today (with a grace for today not being done yet).
export function currentStreak(state: TrackerState, threshold = STREAK_THRESHOLD): number {
  const qualifies = (d: Date) => dayCompletion(state, toISO(d)) >= threshold;
  const day = new Date();
  if (!qualifies(day)) day.setDate(day.getDate() - 1); // today still has time
  let streak = 0;
  while (qualifies(day)) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

// Longest run of qualifying days across all recorded history.
export function bestStreak(state: TrackerState, threshold = STREAK_THRESHOLD): number {
  const dates = new Set([...Object.keys(state.dayChecks), ...Object.keys(state.workoutLog)]);
  if (dates.size === 0) return 0;
  const first = [...dates].sort()[0];
  const cursor = fromISO(first);
  const today = new Date();
  let best = 0;
  let run = 0;
  while (cursor <= today) {
    if (dayCompletion(state, toISO(cursor)) >= threshold) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return best;
}
