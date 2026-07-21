import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTracker } from './TrackerContext';
import { Ring } from '../components/Ring';
import { colors, spacing, radius, font, tint } from '../theme';

interface RestTimerValue {
  start: () => void;
}

const Ctx = createContext<RestTimerValue | null>(null);

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const { state } = useTracker();
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (interval.current) clearInterval(interval.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    interval.current = null;
    hideTimer.current = null;
  }

  useEffect(() => () => clearTimers(), []);

  function finish() {
    clearTimers();
    setDone(true);
    try {
      Vibration.vibrate(400);
    } catch {
      // no-op on platforms without vibration
    }
    hideTimer.current = setTimeout(() => setVisible(false), 900);
  }

  function start() {
    clearTimers();
    const secs = state.restSeconds;
    setTotal(secs);
    setRemaining(secs);
    setDone(false);
    setVisible(true);
    interval.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function addTime(delta: number) {
    setRemaining((r) => {
      const next = Math.max(1, r + delta);
      setTotal((t) => Math.max(t, next));
      return next;
    });
  }

  function skip() {
    clearTimers();
    setVisible(false);
  }

  const value = useMemo<RestTimerValue>(() => ({ start }), [state.restSeconds]);
  const progress = total > 0 ? remaining / total : 0;

  return (
    <Ctx.Provider value={value}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={skip}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.label}>{done ? 'REST COMPLETE' : 'REST'}</Text>
            <View style={styles.ringWrap}>
              <Ring
                progress={done ? 1 : progress}
                size={170}
                stroke={14}
                color={done ? colors.success : colors.primary}
              >
                {done ? (
                  <Ionicons name="checkmark" size={54} color={colors.success} />
                ) : (
                  <Text style={styles.count}>{fmt(remaining)}</Text>
                )}
              </Ring>
            </View>

            {!done ? (
              <>
                <View style={styles.adjustRow}>
                  <Pressable
                    onPress={() => addTime(-15)}
                    style={({ pressed }) => [styles.adjust, pressed && styles.pressed]}
                  >
                    <Text style={styles.adjustText}>−15s</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => addTime(15)}
                    style={({ pressed }) => [styles.adjust, pressed && styles.pressed]}
                  >
                    <Text style={styles.adjustText}>+15s</Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={skip}
                  style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
                >
                  <Ionicons name="play-skip-forward" size={16} color={colors.white} />
                  <Text style={styles.skipText}>Skip rest</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.doneMsg}>Next set — let’s go 💪</Text>
            )}
          </View>
        </View>
      </Modal>
    </Ctx.Provider>
  );
}

export function useRestTimer(): RestTimerValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRestTimer must be used within RestTimerProvider');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  ringWrap: { marginBottom: spacing.xl },
  count: { color: colors.text, fontSize: 46, fontWeight: '800' },
  adjustRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, width: '100%' },
  adjust: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adjustText: { color: colors.text, fontSize: font.body, fontWeight: '800' },
  skip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 13,
    width: '100%',
  },
  skipText: { color: colors.white, fontSize: font.body, fontWeight: '800' },
  doneMsg: { color: colors.textMuted, fontSize: font.body, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
