const CACHE_NAME = 'rwood-cache-v566';
const ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/logo-header.png',
  './icons/chantier.png',
  './icons/afaire.png',
  './icons/heures.png',
  './icons/itineraire.png',
  './icons/galerie.png',
  './icons/contacts.png',
  './icons/agenda.png',
  './icons/magasin.png',
  './icons/calcul.png',
  './icons/zinc.png',
  './icons/dev.png',
  './icons/alerte.png',
  './icons/toiture.png',
  './icons/scanner.png',
  './icons/stock.png',
  './icons/suivi.png',
  './icons/zone.png',
  './icons/bulle-warning.png',
  './icons/bulle-punaise.png',
  './icons/bulle-cle.png',
  './icons/bulle-clipboard.png',
  './icons/bulle-gyrophare.png',
  './icons/bulle-ampoule.png',
  './icons/bulle-cone.png',
  './exceljs.min.js',
  './modele_salaire.xlsx',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener('message', (event) => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const CACHE_FIRST = /\.(png|jpg|jpeg|svg|ico|webp|woff2?)(\?.*)?$/;
const NET_ONLY    = /supabase\.co|api-adresse|osrm|nominatim|unpkg\.com|cdnjs/;

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  const url = event.request.url;
  if(NET_ONLY.test(url)) return;

  // Navigation (chargement de la page) — TOUJOURS réseau d'abord, jamais
  // l'ancien HTML en cache. On détecte via request.mode === 'navigate',
  // qui couvre l'URL racine "/RWOOD/" comme "/index.html" de façon fiable.
  const isDocument = event.request.mode === 'navigate'
                     || /index\.html(\?.*)?$/.test(url)
                     || /\/RWOOD\/?(\?.*)?$/.test(url);
  if(isDocument){
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((r) => { if(r && r.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone())); return r; })
        .catch(() => caches.match(event.request).then(m => m || caches.match('./index.html')))
    );
    return;
  }

  if(CACHE_FIRST.test(url)){
    event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      fetch(event.request).then(r => { if(r.ok) cache.put(event.request, r.clone()); }).catch(()=>{});
      return cached || fetch(event.request);
    }));
  } else {
    // Autres ressources (JS inline exclu car dans index.html) : réseau d'abord.
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((r) => { if(r && r.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone())); return r; })
        .catch(() => caches.match(event.request))
    );
  }
});

self.addEventListener('push', (event) => {
  if(!event.data) return;
  let p; try { p = event.data.json(); } catch(e) { p = {title:'RWOOD', body:event.data.text()}; }
  event.waitUntil(self.registration.showNotification(p.title||'RWOOD', {
    body:p.body||'', icon:'./icons/icon-192.png', badge:'./icons/icon-192.png',
    tag:p.tag||'rwood-notif', data:p.data||{}, vibrate:[200,100,200],
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){ if('focus' in c){ c.focus(); return; } }
    if(clients.openWindow) return clients.openWindow('./index.html');
  }));
});
