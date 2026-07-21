// Post-process the Expo web export into an installable PWA, then sync to docs/
// for GitHub Pages. Run after: expo export --platform web --output-dir dist
//
//   node scripts/pwa-postbuild.mjs
//
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIST = path.join(ROOT, 'dist');
const DOCS = path.join(ROOT, 'docs');
// Served at the root of a custom domain (fastfit.hassanahmed.site), so no path prefix.
const BASE = '';
const CUSTOM_DOMAIN = 'fastfit.hassanahmed.site';

const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1) viewport with notch support
html = html.replace(
  /<meta name="viewport"[^>]*\/>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover" />'
);

// 2) PWA + iOS home-screen head tags (idempotent)
if (!html.includes('apple-touch-icon')) {
  const head = `
<link rel="manifest" href="${BASE}/manifest.json" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="apple-mobile-web-app-title" content="FastFit" />
<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png" />
<style>html,body,#root{background-color:#0C0F14;}</style>
`;
  html = html.replace('</head>', head + '</head>');
}

// 3) service worker registration
if (!html.includes('serviceWorker')) {
  const sw = `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('${BASE}/sw.js',{scope:'${BASE}/'}).catch(function(){});});}</script>`;
  html = html.replace('</body>', sw + '</body>');
}

fs.writeFileSync(indexPath, html);

// 4) manifest.json
const manifest = {
  name: 'FastFit',
  short_name: 'FastFit',
  description: '16:8 fasting, Push/Pull/Legs workouts & body tracking',
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0C0F14',
  theme_color: '#0C0F14',
  icons: [
    { src: `${BASE}/icon.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: `${BASE}/icon.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};
fs.writeFileSync(path.join(DIST, 'manifest.json'), JSON.stringify(manifest, null, 2));

// 5) service worker
const sw = `/* FastFit service worker */
const CACHE = 'fastfit-v2';
const SHELL = '${BASE}/index.html';
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
`;
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);

// 6) icons + .nojekyll
fs.copyFileSync(path.join(ROOT, 'assets', 'icon.png'), path.join(DIST, 'icon.png'));
fs.copyFileSync(path.join(ROOT, 'assets', 'icon.png'), path.join(DIST, 'apple-touch-icon.png'));
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

// 7) sync dist -> docs (GitHub Pages source)
fs.rmSync(DOCS, { recursive: true, force: true });
fs.cpSync(DIST, DOCS, { recursive: true });

// 8) custom domain for GitHub Pages (must live in the published folder)
fs.writeFileSync(path.join(DOCS, 'CNAME'), `${CUSTOM_DOMAIN}\n`);

console.log(`PWA post-build complete → docs/ ready for GitHub Pages (${CUSTOM_DOMAIN})`);
