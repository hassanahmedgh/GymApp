import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STATE, type TrackerState } from '../types';

// Local cache is namespaced per user id so multiple accounts can share a device.
function keyFor(uid: string): string {
  return `tracker:v2:${uid}`;
}

// Merge a partial/older blob onto defaults so new fields never come back undefined.
export function normalize(raw: Partial<TrackerState> | null | undefined): TrackerState {
  if (!raw) return { ...DEFAULT_STATE };
  return {
    ...DEFAULT_STATE,
    ...raw,
    dayChecks: raw.dayChecks ?? {},
    water: raw.water ?? {},
    workoutLog: raw.workoutLog ?? {},
    measurements: Array.isArray(raw.measurements) ? raw.measurements : [],
    units: { ...DEFAULT_STATE.units, ...(raw.units ?? {}) },
    waterGoalMl: raw.waterGoalMl ?? DEFAULT_STATE.waterGoalMl,
    restSeconds: raw.restSeconds ?? DEFAULT_STATE.restSeconds,
    notifyWater: raw.notifyWater ?? DEFAULT_STATE.notifyWater,
    notifyFast: raw.notifyFast ?? DEFAULT_STATE.notifyFast,
    updatedAt: raw.updatedAt ?? 0,
  };
}

export async function loadLocal(uid: string): Promise<TrackerState> {
  try {
    const json = await AsyncStorage.getItem(keyFor(uid));
    return normalize(json ? JSON.parse(json) : null);
  } catch (e) {
    console.warn('[storage] load failed', e);
    return { ...DEFAULT_STATE };
  }
}

export async function saveLocal(uid: string, state: TrackerState): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(uid), JSON.stringify(state));
  } catch (e) {
    console.warn('[storage] save failed', e);
  }
}
