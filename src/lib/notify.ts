// Lightweight web-notification helpers. No-ops on platforms without the
// Notification API (e.g. React Native without a native module).

declare const Notification: any;

export function notifSupported(): boolean {
  return typeof Notification !== 'undefined';
}

export function notifPermission(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!notifSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotif(): Promise<boolean> {
  if (!notifSupported()) return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch {
    return false;
  }
}

export async function showNotif(title: string, body: string): Promise<void> {
  if (!notifSupported() || Notification.permission !== 'granted') return;
  try {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (nav?.serviceWorker?.ready) {
      const reg = await nav.serviceWorker.ready;
      if (reg && typeof reg.showNotification === 'function') {
        reg.showNotification(title, { body, icon: '/icon.png', badge: '/icon.png', tag: title });
        return;
      }
    }
    // eslint-disable-next-line no-new
    new Notification(title, { body, icon: '/icon.png' });
  } catch {
    // ignore
  }
}
