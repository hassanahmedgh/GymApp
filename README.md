# 🔥 FastFit

A professional **16:8 fasting + gym tracker** built with **React Native (Expo SDK 54)**.
Local-first, works offline, and syncs to the cloud with Firebase.

## Features

- **Accounts** — email/password **sign up / sign in** with **remember-me**. Your data is tied to your account and syncs across devices.
- **Today** — your daily 16:8 fasting & gym schedule with tap-to-complete checkboxes, a completion ring, and a water-intake tracker.
- **Workout** — a **Push / Pull / Legs** weekly split where every exercise has **per-set checkboxes** with editable reps & weight, **add / remove sets**, and progress counted by sets completed. Completing a set pops up a **rest timer** (duration set in Settings).
- **Progress** — log your **waist** and **weight**, see the trend chart, total change since you started, and full history.
- **Settings** — rest-timer duration, units (in/cm · kg/lb), daily water goal, and account / sign-out.
- **Cloud sync** — data is saved on-device instantly (AsyncStorage) and synced to Firebase Firestore in the background. Lose your phone, keep your data.

## Run it as a web app (PWA) on your iPhone — free, no PC

The app is also published as an installable web app via **GitHub Pages**:

1. Enable Pages once: repo **Settings → Pages → Source: Deploy from a branch → `main` / `/docs`**.
2. Live at **https://hassanahmedgh.github.io/GymApp/**
3. On iPhone **Safari** → **Share → Add to Home Screen**. Opens fullscreen, works without the PC.

To rebuild & redeploy the web app after code changes: `npm run build:web`, then commit & push `docs/`.

---

## 📱 Get it on your iPhone

You're on Windows, so there's no Xcode — but these two paths both work from Windows.

### Option A — Run it now with Expo Go (free, ~2 minutes)

Best for using it immediately and for tweaking the app.

1. On your iPhone, install **Expo Go** from the App Store.
2. On your PC, in this folder:
   ```bash
   npm install
   npx expo start
   ```
3. A QR code appears in the terminal. Open the **iPhone Camera**, point it at the QR code, tap the banner → it opens in Expo Go.
   - iPhone and PC must be on the **same Wi-Fi**. If your network blocks it, run `npx expo start --tunnel` instead.

> Expo Go runs the app inside its own container — you won't get a separate home-screen icon. For that, use Option B.

### Option B — Build a real installable app with EAS (no Mac needed)

Expo builds the iOS app **in the cloud**, so you don't need a Mac.

1. Create a free Expo account at https://expo.dev, then:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build -p ios --profile preview
   ```
2. Installing the finished `.ipa` on a **physical iPhone** requires an **Apple Developer account ($99/year)** — Apple's rule, not Expo's. With it you can install via **TestFlight** or register your device for ad-hoc installs.
   - No developer account? Stick with **Option A (Expo Go)** — it's genuinely the same app.

---

## ☁️ Firebase setup (one-time, for cloud sync)

The app already contains the Firebase web config. To turn on syncing, do this in the [Firebase Console](https://console.firebase.google.com) for project **blackstone-880ca**:

1. **Authentication → Sign-in method → Email/Password → Enable.**
   (Required for sign up / sign in. Without it, creating an account fails with "operation-not-allowed".)
2. **Firestore Database → Create database** (Production mode is fine).
3. **Firestore → Rules →** paste the contents of [`firestore.rules`](./firestore.rules) → **Publish.**
   These rules ensure each signed-in user can only read/write their **own** data.

If Firebase isn't configured or the phone is offline, the app still works fully — it just keeps everything on-device and syncs when it can.

### A note on the API key
The Firebase web API key is embedded in the app. That's expected — [Firebase web keys are not secrets](https://firebase.google.com/docs/projects/api-keys); they identify the project, not authorize access. Your data is protected by the **Security Rules** above. For extra hardening later, enable **Firebase App Check**.

> ⚠️ `getAnalytics()` from the original web snippet was intentionally left out — Firebase Analytics is browser-only and crashes in React Native.

---

## 🛠️ Tech

- Expo SDK 54 · React Native 0.81 · React 19 · TypeScript (runs in the App Store Expo Go)
- `@react-native-async-storage/async-storage` — local persistence
- `firebase` (Auth + Firestore) — cloud sync
- `react-native-svg` — progress ring & trend chart
- `@expo/vector-icons` · `react-native-safe-area-context`

## Project structure

```
App.tsx                     App shell — header, tabs, sync status
src/
  theme.ts                  Design tokens (colors, spacing, type)
  data.ts                   Schedule + PPL split content
  types.ts                  State & data types
  lib/
    dates.ts                Local-time date/week helpers
    storage.ts              AsyncStorage load/save
    firebase.ts             Firebase bootstrap (defensive)
    cloud.ts                Firestore sync wrapper
  state/TrackerContext.tsx  Local-first store + cloud sync engine
  components/               Card, Badge, Ring, ScheduleRow, TabBar, ...
  screens/                  TodayScreen, WorkoutScreen, ProgressScreen
```

## Scripts

```bash
npx expo start        # run in Expo Go
npx tsc --noEmit      # typecheck
npx expo export       # produce a JS bundle (build sanity check)
```
