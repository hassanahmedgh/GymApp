/* FastFit service worker */
const CACHE = 'fastfit-v2';
const SHELL = '/index.html';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.add(SHELL)).catch(() => {})); });
self.addEventListener('activate', (e) => { e.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))); await self.clients.claim(); })()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try { const fresh = await fetch(req); const c = await caches.open(CACHE); c.put(SHELL, fresh.clone()); return fresh; }
      catch { const c = await caches.open(CACHE); return (await c.match(SHELL)) || (await c.match(req)) || Response.error(); }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const cached = await c.match(req);
    if (cached) return cached;
    try { const fresh = await fetch(req); if (fresh && fresh.status === 200) c.put(req, fresh.clone()); return fresh; }
    catch { return cached || Response.error(); }
  })());
});
