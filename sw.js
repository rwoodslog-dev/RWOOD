const CACHE_NAME = 'rwood-cache-v306';
const ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/logo-header.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('[SW] Asset ignoré :', url, err)
          )
        )
      )
    )
  );
});

self.addEventListener('message', (event) => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const CACHE_FIRST_PATTERNS = [
  /\.(png|jpg|jpeg|svg|ico|webp|woff2?)(\?.*)?$/,
];
const NETWORK_ONLY_PATTERNS = [
  /supabase\.co/,
  /api-adresse\.data\.gouv\.fr/,
  /router\.project-osrm\.org/,
  /nominatim\.openstreetmap\.org/,
  /unpkg\.com/,
  /cdnjs\.cloudflare\.com/,
];

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  const url = event.request.url;
  if(NETWORK_ONLY_PATTERNS.some(p => p.test(url))) return;

  // index.html : TOUJOURS network-first, jamais de cache stale
  if(url.endsWith('index.html') || url.endsWith('/') || url.split('?')[0].endsWith('/')){
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if(response && response.status === 200){
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  const isCacheFirst = CACHE_FIRST_PATTERNS.some(p => p.test(url));
  if(isCacheFirst){
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkPromise = fetch(event.request)
          .then((response) => {
            if(response && response.status === 200) cache.put(event.request, response.clone());
            return response;
          }).catch(() => null);
        return cached || networkPromise;
      })
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

self.addEventListener('push', (event) => {
  if(!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch(e) { payload = { title: 'RWOOD', body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'RWOOD', {
      body: payload.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: payload.tag || 'rwood-notif',
      data: payload.data || {},
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for(const client of list){
        if(client.url.includes('index.html') && 'focus' in client){
          client.focus();
          if(data.view) client.postMessage({ type: 'navigate', view: data.view });
          return;
        }
      }
      if(clients.openWindow) return clients.openWindow(data.url || './index.html');
    })
  );
});
