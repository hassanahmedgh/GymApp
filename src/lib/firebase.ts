// Firebase bootstrap — Auth (anonymous) + Firestore, hardened for React Native.
//
// Everything here is best-effort: if Firebase can't initialise or the device is
// offline, the app still runs fully on local storage. Cloud sync simply resumes
// when a connection is available.
//
// NOTE: `getAnalytics` from the web snippet is intentionally omitted — Firebase
// Analytics is browser-only and crashes in React Native.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
} from 'firebase/auth';
// getReactNativePersistence ships in Firebase's react-native build but isn't in
// the default type definitions, so we pull it in without type errors. It is only
// referenced on native; on web the browser build handles persistence itself.
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCBFe-0XvO5x1pEwAbC90j3AqLeX7AK1X8',
  authDomain: 'blackstone-880ca.firebaseapp.com',
  projectId: 'blackstone-880ca',
  storageBucket: 'blackstone-880ca.firebasestorage.app',
  messagingSenderId: '399713081153',
  appId: '1:399713081153:web:9789dee10be904f095b3c0',
  measurementId: 'G-SGMHS27NNY',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let enabled = false;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Auth with a persistent anonymous session so the user id is stable across launches.
  if (Platform.OS === 'web') {
    // The browser build persists to localStorage/IndexedDB by default.
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // Already initialised (e.g. fast refresh) — reuse it.
      auth = getAuth(app);
    }
  }

  // Firestore. Long-polling is needed on native (streaming transport is unreliable
  // in RN); the web build uses its optimal transport automatically.
  try {
    db = initializeFirestore(
      app,
      Platform.OS === 'web' ? {} : { experimentalForceLongPolling: true }
    );
  } catch {
    db = getFirestore(app);
  }

  enabled = true;
} catch (e) {
  console.warn('[firebase] init failed — running local-only', e);
  enabled = false;
}

export { app, auth, db, enabled, signInAnonymously, onAuthStateChanged };
