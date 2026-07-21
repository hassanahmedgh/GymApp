// Thin wrapper over Firestore for syncing the state blob to users/{uid}.
// Every function is a no-op when Firebase is disabled or unreachable.

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, enabled, auth } from './firebase';
import { normalize } from './storage';
import type { TrackerState } from '../types';

export function cloudEnabled(): boolean {
  return enabled && !!auth && !!db;
}

// Live-subscribe to the remote document. Returns an unsubscribe fn.
export function subscribeRemote(
  uid: string,
  onData: (state: TrackerState | null) => void,
  onError: (e: unknown) => void
): () => void {
  if (!cloudEnabled()) return () => {};
  const ref = doc(db!, 'users', uid);
  return onSnapshot(
    ref,
    { includeMetadataChanges: false },
    (snap) => onData(snap.exists() ? normalize(snap.data() as TrackerState) : null),
    (err) => onError(err)
  );
}

// Overwrite the remote document with our authoritative local blob (last-write-wins).
export async function pushRemote(uid: string, state: TrackerState): Promise<void> {
  if (!cloudEnabled()) return;
  await setDoc(doc(db!, 'users', uid), state);
}
