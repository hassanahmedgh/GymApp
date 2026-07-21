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
import {
  cloudEnabled,
  ensureAuth,
  subscribeRemote,
  pushRemote,
} from '../lib/cloud';
import { makeId } from '../lib/dates';
import {
  DEFAULT_STATE,
  type Measurement,
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
  // Workout
  toggleWorkout: (dateISO: string) => void;
  // Measurements
  addMeasurement: (m: { date: string; waist?: number | null; weight?: number | null }) => void;
  deleteMeasurement: (id: string) => void;
  // Settings
  setUnits: (partial: Partial<Units>) => void;
}

const Ctx = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TrackerState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>('connecting');

  const uidRef = useRef<string | null>(null);
  const stateRef = useRef<TrackerState>(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  stateRef.current = state;

  // ---- boot: load local, then connect cloud ---------------------------------
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubSnap: (() => void) | undefined;

    (async () => {
      const local = await loadLocal();
      setState(local);
      setReady(true);
      hydrated.current = true;

      if (!cloudEnabled()) {
        setSync('local');
        return;
      }

      setSync('connecting');
      unsubAuth = ensureAuth((uid) => {
        uidRef.current = uid;
        if (!uid) {
          setSync('local');
          return;
        }
        unsubSnap?.();
        unsubSnap = subscribeRemote(
          uid,
          (remote) => {
            const current = stateRef.current;
            if (remote && remote.updatedAt > current.updatedAt) {
              // Remote is newer → adopt it.
              setState(remote);
              saveLocal(remote);
            } else if (!remote || current.updatedAt > remote.updatedAt) {
              // No remote yet, or local is ahead → publish local.
              pushRemote(uid, current).catch(() => {});
            }
            setSync('synced');
          },
          () => setSync('error')
        );
      });
    })();

    return () => {
      unsubSnap?.();
      unsubAuth?.();
    };
  }, []);

  // ---- persistence: debounced local save + cloud push -----------------------
  function scheduleSave(next: TrackerState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveLocal(next), 300);

    if (cloudEnabled()) {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        const uid = uidRef.current;
        if (uid) {
          setSync('connecting');
          pushRemote(uid, stateRef.current)
            .then(() => setSync('synced'))
            .catch(() => setSync('error'));
        }
      }, 700);
    }
  }

  // Apply a mutation, stamp updatedAt, persist.
  function mutate(fn: (s: TrackerState) => TrackerState) {
    setState((prev) => {
      const next = { ...fn(prev), updatedAt: Date.now() };
      scheduleSave(next);
      return next;
    });
  }

  // ---- actions --------------------------------------------------------------
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
        const next = Math.max(0, current + deltaMl);
        return { ...s, water: { ...s.water, [dateISO]: next } };
      }),

    resetWater: (dateISO) =>
      mutate((s) => ({ ...s, water: { ...s.water, [dateISO]: 0 } })),

    toggleWorkout: (dateISO) =>
      mutate((s) => ({
        ...s,
        workout: { ...s.workout, [dateISO]: !s.workout[dateISO] },
      })),

    addMeasurement: ({ date, waist, weight }) =>
      mutate((s) => {
        const entry: Measurement = {
          id: makeId(),
          date,
          waist: waist ?? null,
          weight: weight ?? null,
        };
        // Newest first; if an entry already exists for this date, replace it.
        const rest = s.measurements.filter((m) => m.date !== date);
        const list = [entry, ...rest].sort((a, b) => (a.date < b.date ? 1 : -1));
        return { ...s, measurements: list };
      }),

    deleteMeasurement: (id) =>
      mutate((s) => ({
        ...s,
        measurements: s.measurements.filter((m) => m.id !== id),
      })),

    setUnits: (partial) =>
      mutate((s) => ({ ...s, units: { ...s.units, ...partial } })),
  }), [state, ready, sync]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}
