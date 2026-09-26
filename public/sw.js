// Expensify service worker: keeps the app shell available offline.
// API calls are never cached; offline expenses are queued by the app itself.
const VERSION = 'v2';
const SHELL = `expensify-shell-${VERSION}`;
const ASSETS = `expensify-assets-${VERSION}`;
const FONTS = `expensify-fonts-${VERSION}`;
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL, ASSETS, FONTS]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Pages: try the network so a new deploy shows up at once, fall back to the cached shell.
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put('/', copy));
          }
          return res;
        })
        .catch(() => caches.match('/', { cacheName: SHELL })),
    );
    return;
  }

  // Hashed build files never change, so the cached copy is always right.
  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) {
    event.respondWith(cacheFirst(req, ASSETS));
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(req, FONTS));
    return;
  }

  if (url.origin === self.location.origin && PRECACHE.includes(url.pathname)) {
    event.respondWith(caches.match(req, { cacheName: SHELL }).then((hit) => hit || fetch(req)));
  }
  // Everything else, including the API, goes straight to the network.
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  // Never store an HTML fallback page under a script or image address.
  const html = (res.headers.get('content-type') || '').includes('text/html');
  if ((res.ok && !html) || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}
