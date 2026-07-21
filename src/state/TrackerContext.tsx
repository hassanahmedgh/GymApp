import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { loadLocal, saveLocal } from '../lib/storage';
import { cloudEnabled, subscribeRemote, pushRemote } from '../lib/cloud';
import { makeId } from '../lib/dates';
import { readSets, emptySet } from '../lib/sets';
import {
  DEFAULT_STATE,
  type Measurement,
  type SetEntry,
  type SyncStatus,
  type TrackerState,
  type Units,
} from '../types';

interface TrackerContextValue {
  state: TrackerState;
  ready: boolean;
  sync: SyncStatus;
  // Daily schedule
  toggleTask: (dateISO: string, taskId: string) => void;
  // Water
  addWater: (dateISO: string, deltaMl: number) => void;
  resetWater: (dateISO: string) => void;
  // Workout sets
  toggleSet: (dateISO: string, exId: string, index: number, targetSets: number) => void;
  setSetReps: (dateISO: string, exId: string, index: number, value: string, targetSets: number) => void;
  setSetWeight: (dateISO: string, exId: string, index: number, value: string, targetSets: number) => void;
  addSet: (dateISO: string, exId: string, targetSets: number) => void;
  removeSet: (dateISO: string, exId: string, index: number, targetSets: number) => void;
  // Measurements
  addMeasurement: (m: { date: string; waist?: number | null; weight?: number | null }) => void;
  deleteMeasurement: (id: string) => void;
  // Settings
  setUnits: (partial: Partial<Units>) => void;
  setRestSeconds: (seconds: number) => void;
  setWaterGoal: (ml: number) => void;
}

const Ctx = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [state, setState] = useState<TrackerState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>('connecting');

  const stateRef = useRef<TrackerState>(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  stateRef.current = state;

  // ---- boot / re-boot when the user changes --------------------------------
  useEffect(() => {
    let unsubSnap: (() => void) | undefined;
    let active = true;

    setReady(false);
    (async () => {
      const local = await loadLocal(uid);
      if (!active) return;
      setState(local);
      setReady(true);

      if (!cloudEnabled()) {
        setSync('local');
        return;
      }
      setSync('connecting');
      unsubSnap = subscribeRemote(
        uid,
        (remote) => {
          const current = stateRef.current;
          if (remote && remote.updatedAt > current.updatedAt) {
            setState(remote);
            saveLocal(uid, remote);
          } else if (!remote || current.updatedAt > remote.updatedAt) {
            pushRemote(uid, current).catch(() => {});
          }
          setSync('synced');
        },
        () => setSync('error')
      );
    })();

    return () => {
      active = false;
      unsubSnap?.();
    };
  }, [uid]);

  // ---- debounced persistence -----------------------------------------------
  function scheduleSave(next: TrackerState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveLocal(uid, next), 300);

    if (cloudEnabled()) {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        setSync('connecting');
        pushRemote(uid, stateRef.current)
          .then(() => setSync('synced'))
          .catch(() => setSync('error'));
      }, 700);
    }
  }

  function mutate(fn: (s: TrackerState) => TrackerState) {
    setState((prev) => {
      const next = { ...fn(prev), updatedAt: Date.now() };
      scheduleSave(next);
      return next;
    });
  }

  // ---- set helpers ----------------------------------------------------------
  function writeSets(s: TrackerState, date: string, exId: string, sets: SetEntry[]): TrackerState {
    const day = { ...(s.workoutLog[date] ?? {}) };
    day[exId] = sets;
    return { ...s, workoutLog: { ...s.workoutLog, [date]: day } };
  }
  function currentSets(s: TrackerState, date: string, exId: string, targetSets: number): SetEntry[] {
    return readSets(s.workoutLog, date, exId, targetSets).map((x) => ({ ...x }));
  }

  const value = useMemo<TrackerContextValue>(() => ({
    state,
    ready,
    sync,

    toggleTask: (dateISO, taskId) =>
      mutate((s) => {
        const day = { ...(s.dayChecks[dateISO] ?? {}) };
        day[taskId] = !day[taskId];
        return { ...s, dayChecks: { ...s.dayChecks, [dateISO]: day } };
      }),

    addWater: (dateISO, deltaMl) =>
      mutate((s) => {
        const current = s.water[dateISO] ?? 0;
        return { ...s, water: { ...s.water, [dateISO]: Math.max(0, current + deltaMl) } };
      }),

    resetWater: (dateISO) =>
      mutate((s) => ({ ...s, water: { ...s.water, [dateISO]: 0 } })),

    toggleSet: (dateISO, exId, index, targetSets) =>
      mutate((s) => {
        const sets = currentSets(s, dateISO, exId, targetSets);
        while (sets.length <= index) sets.push(emptySet());
        sets[index] = { ...sets[index], done: !sets[index].done };
        return writeSets(s, dateISO, exId, sets);
      }),

    setSetReps: (dateISO, exId, index, value, targetSets) =>
      mutate((s) => {
        const sets = currentSets(s, dateISO, exId, targetSets);
        while (sets.length <= index) sets.push(emptySet());
        sets[index] = { ...sets[index], reps: value };
        return writeSets(s, dateISO, exId, sets);
      }),

    setSetWeight: (dateISO, exId, index, value, targetSets) =>
      mutate((s) => {
        const sets = currentSets(s, dateISO, exId, targetSets);
        while (sets.length <= index) sets.push(emptySet());
        sets[index] = { ...sets[index], weight: value };
        return writeSets(s, dateISO, exId, sets);
      }),

    addSet: (dateISO, exId, targetSets) =>
      mutate((s) => {
        const sets = currentSets(s, dateISO, exId, targetSets);
        sets.push(emptySet());
        return writeSets(s, dateISO, exId, sets);
      }),

    removeSet: (dateISO, exId, index, targetSets) =>
      mutate((s) => {
        const sets = currentSets(s, dateISO, exId, targetSets);
        if (sets.length <= 1) return s;
        sets.splice(index, 1);
        return writeSets(s, dateISO, exId, sets);
      }),

    addMeasurement: ({ date, waist, weight }) =>
      mutate((s) => {
        const entry: Measurement = { id: makeId(), date, waist: waist ?? null, weight: weight ?? null };
        const rest = s.measurements.filter((m) => m.date !== date);
        const list = [entry, ...rest].sort((a, b) => (a.date < b.date ? 1 : -1));
        return { ...s, measurements: list };
      }),

    deleteMeasurement: (id) =>
      mutate((s) => ({ ...s, measurements: s.measurements.filter((m) => m.id !== id) })),

    setUnits: (partial) =>
      mutate((s) => ({ ...s, units: { ...s.units, ...partial } })),

    setRestSeconds: (seconds) =>
      mutate((s) => ({ ...s, restSeconds: Math.max(10, Math.min(600, Math.round(seconds))) })),

    setWaterGoal: (ml) =>
      mutate((s) => ({ ...s, waterGoalMl: Math.max(500, Math.min(8000, Math.round(ml))) })),
  }), [state, ready, sync]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}
