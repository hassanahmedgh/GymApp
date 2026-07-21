import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, enabled } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  busy: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue | null>(null);

// Map Firebase error codes to friendly, human messages.
function friendly(code: string, fallback: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'That email is already registered — try signing in.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/operation-not-allowed':
      return 'Email sign-in is not enabled in Firebase yet. Enable Email/Password in the console.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return fallback || 'Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !auth) {
      setInitializing(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // Choose how long the session survives (web only; native always persists).
  async function applyPersistence(remember: boolean) {
    if (Platform.OS !== 'web' || !auth) return;
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
    } catch {
      // Non-fatal — fall back to the default persistence.
    }
  }

  async function run(fn: () => Promise<void>) {
    if (!enabled || !auth) {
      setError('Cloud accounts are unavailable right now.');
      throw new Error('auth-unavailable');
    }
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e: any) {
      setError(friendly(e?.code ?? '', e?.message ?? ''));
      throw e;
    } finally {
      setBusy(false);
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    busy,
    error,
    clearError: () => setError(null),

    signIn: (email, password, remember) =>
      run(async () => {
        await applyPersistence(remember);
        await signInWithEmailAndPassword(auth!, email.trim(), password);
      }),

    signUp: (name, email, password, remember) =>
      run(async () => {
        await applyPersistence(remember);
        const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
        const trimmed = name.trim();
        if (trimmed) {
          try {
            await updateProfile(cred.user, { displayName: trimmed });
          } catch {
            // Display name is optional — ignore failures.
          }
        }
      }),

    logout: () =>
      run(async () => {
        await signOut(auth!);
      }),
  }), [user, initializing, busy, error]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
