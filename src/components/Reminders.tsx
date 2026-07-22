import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTracker } from '../state/TrackerContext';
import { useNow } from '../lib/useNow';
import { toISO } from '../lib/dates';
import { notifPermission, showNotif } from '../lib/notify';

// Foreground reminder scheduler. While the app is open it fires:
//  • a water reminder every 45 min between 9:00 and 21:00
//  • a "window open" notice at 1 PM and "fast begins" at 9 PM
// Each reminder fires at most once per day (deduped in AsyncStorage), and only
// within 5 min of its mark so reopening the app never dumps missed reminders.
export function Reminders() {
  const { state } = useTracker();
  const now = useNow(30000);
  const fired = useRef<Set<string>>(new Set());
  const day = useRef<string>('');
  const today = toISO(now);

  useEffect(() => {
    if (day.current === today) return;
    day.current = today;
    fired.current = new Set();
    AsyncStorage.getItem(`notiflog:${today}`).then((j) => {
      if (j) {
        try {
          fired.current = new Set(JSON.parse(j));
        } catch {
          // ignore corrupt log
        }
      }
    });
  }, [today]);

  useEffect(() => {
    if (notifPermission() !== 'granted') return;
    const mins = now.getHours() * 60 + now.getMinutes();

    const fire = (key: string, title: string, body: string) => {
      if (fired.current.has(key)) return;
      fired.current.add(key);
      AsyncStorage.setItem(`notiflog:${today}`, JSON.stringify([...fired.current])).catch(() => {});
      showNotif(title, body);
    };

    if (state.notifyWater) {
      const START = 9 * 60;
      const END = 21 * 60;
      const STEP = 45;
      if (mins >= START && mins <= END) {
        const slot = START + Math.floor((mins - START) / STEP) * STEP;
        if (mins - slot <= 5) {
          fire(`water:${slot}`, '💧 Hydrate', 'Time for a glass of water — keep your intake on track.');
        }
      }
    }

    if (state.notifyFast) {
      if (mins >= 13 * 60 && mins <= 13 * 60 + 5) {
        fire('fast:open', '🍽️ Eating window open', 'You can break your fast now — Meal 1 time.');
      }
      if (mins >= 21 * 60 && mins <= 21 * 60 + 5) {
        fire('fast:close', '⏳ Fast begins', 'Eating window closed. Lock in your 16:8 fast.');
      }
    }
  }, [now, state.notifyWater, state.notifyFast, today]);

  return null;
}
