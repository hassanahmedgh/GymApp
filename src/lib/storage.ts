import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STATE, type TrackerState } from '../types';

const KEY = 'tracker:v1';

// Merge a partial/older blob onto defaults so new fields never come back undefined.
export function normalize(raw: Partial<TrackerState> | null | undefined): TrackerState {
  if (!raw) return { ...DEFAULT_STATE };
  return {
    ...DEFAULT_STATE,
    ...raw,
    dayChecks: raw.dayChecks ?? {},
    water: raw.water ?? {},
    workout: raw.workout ?? {},
    measurements: Array.isArray(raw.measurements) ? raw.measurements : [],
    units: { ...DEFAULT_STATE.units, ...(raw.units ?? {}) },
    waterGoalMl: raw.waterGoalMl ?? DEFAULT_STATE.waterGoalMl,
    updatedAt: raw.updatedAt ?? 0,
  };
}

export async function loadLocal(): Promise<TrackerState> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return normalize(json ? JSON.parse(json) : null);
  } catch (e) {
    console.warn('[storage] load failed', e);
    return { ...DEFAULT_STATE };
  }
}

export async function saveLocal(state: TrackerState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[storage] save failed', e);
  }
}
