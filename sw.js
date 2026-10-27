const CACHE_NAME = 'rwood-cache-v1220';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192-v4.png',
  './icons/icon-512-v4.png',
  './icons/icon-192-maskable-v4.png',
  './icons/icon-512-maskable-v4.png',
  './icons/logo-header-v4.png',
  './icons/chantier-v2.png',
  './icons/afaire-v2.png',
  './icons/note-v2.png',
  './icons/heures-v2.png',
  './icons/itineraire-v2.png',
  './icons/galerie-v2.png',
  './icons/contacts-v2.png',
  './icons/agenda-v2.png',
  './icons/magasin-v2.png',
  './icons/calcul-v2.png',
  './icons/zinc-v2.png',
  './icons/dev-v2.png',
  './icons/toiture-v2.png',
  './icons/scanner-v2.png',
  './icons/stock-v2.png',
  './icons/suivi-v2.png',
  './icons/zone.png',
  './icons/role-chef-v2.png',
  './icons/role-ouvrier-v2.png',
  './icons/role-conducteur-v2.png',
  './icons/role-compta-v2.png',
  './icons/role-patron-v2.png',
  './icons/megaphone.png',
  './icons/entretien-v2.png',
  './icons/depannage-v2.png',
  './icons/pole-charpente-v2.png',
  './icons/pole-menuiserie-v2.png',
  './rw-biblio.js',
  './rw-ortho-fr.js',
  './icons/messagerie-v2.png',
  './icons/montre-v2.png',
  './icons/motif-outils.jpg',
  './icons/motif-outils-pc.jpg',
  './icons/fond-charpente.jpg',
  './icons/fond-charpente-pc.jpg',
  './icons/engrenage.png',
  './icons/monnaie.png',
  './icons/ordinateur-v2.png',
  './icons/qr.png',
  './icons/seringue.png',
  './icons/export.png',
  './icons/import.png',
  './icons/corbeille.png',
  './icons/fichiers.png',
  './icons/graphique.png',
  './icons/loupe.png',
  './icons/oeil_ferme.png',
  './icons/oeil_ouvert.png',
  './icons/stylo.png',
  './icons/trombone.png',
  './icons/valise.png',
  './icons/voiture.png',
  './icons/boussole.png',
  './icons/boitecles.png',
  './icons/telechargement.png',
  './icons/bulle-warning.png',
  './icons/bulle-punaise.png',
  './icons/bulle-cle.png',
  './icons/bulle-clipboard.png',
  './icons/bulle-gyrophare.png',
  './icons/bulle-ampoule.png',
  './icons/bulle-cone.png',
  './icons/musique/radio.png',
  './icons/musique/country.png',
  './icons/musique/casque.png',
  './icons/musique/note-de-musique.png',
  './icons/musique/pause.png',
  './icons/musique/play.png',
  './icons/musique/precedent.png',
  './icons/musique/micro.png',
  './icons/musique/reggae.png',
  './icons/musique/guitare.png',
  './icons/musique/suivant.png',
  './icons/musique/volume.png',
  './exceljs.min.js',
  './modele_salaire.xlsx',
];

/* v5.53.2 — bibliothèques externes (adresse versionnée, ne change jamais) gardées sur le téléphone :
   l'appli s'ouvre vite même avec un réseau faible, et marche hors ligne (PDF, cartes). */
const LIB_CACHE = 'rwood-lib-v1';
const LIB_RE = /^https:\/\/(cdnjs\.cloudflare\.com|unpkg\.com|cdn\.jsdelivr\.net)\//;
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {})))
    ),
    caches.open(LIB_CACHE).then(async (cache) => {
      for(const u of LIBS){ try{ if(!(await cache.match(u))){ const r = await fetch(u, { mode:'cors', credentials:'omit' }); if(r.ok) await cache.put(u, r); } }catch(e){} }
    }),
  ]));
});

self.addEventListener('message', (event) => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  // v5.53.2 — photos déjà enregistrées : on les garde sur le téléphone pour les voir hors ligne
  if(event.data && event.data.type === 'PRECACHE_MEDIA' && Array.isArray(event.data.urls)){
    event.waitUntil((async () => {
      const cache = await caches.open(MEDIA_CACHE);
      let n = 0;
      for(const u of event.data.urls.slice(0, 400)){
        if(!MEDIA_RE.test(u)) continue;
        try{ if(await cache.match(u)) continue; const r = await fetch(u, { mode:'cors', credentials:'omit' }); if(r.ok){ await cache.put(u, r); n++; } }catch(e){}
      }
      if(n) await _mediaTrim(cache);
    })());
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== MEDIA_CACHE && k !== LIB_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const CACHE_FIRST = /\.(png|jpg|jpeg|svg|ico|webp|woff2?)(\?.*)?$/;
// v5.41.350 — photos / documents Supabase : leur URL ne change jamais (uid unique), on les garde
// sur le téléphone (cache séparé, conservé d'une version à l'autre) au lieu de les retélécharger
// à chaque affichage — c'est ce qui faisait exploser le quota « Cached Egress ».
const MEDIA_CACHE = 'rwood-media-v1';
const MEDIA_RE = /\/storage\/v1\/object\/public\//;
const MEDIA_MAX = 1500; // nombre de fichiers gardés au maximum (v5.53.2 : 600 → 1500, pour le hors ligne)
async function _mediaTrim(cache){
  try{ const keys = await cache.keys(); for(let i = 0; i < keys.length - MEDIA_MAX; i++) await cache.delete(keys[i]); }catch(e){}
}
const NET_ONLY    = /supabase\.co|api-adresse|osrm|nominatim/;

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  const url = event.request.url;
  if(MEDIA_RE.test(url) && !/[?&](download|t)=/.test(url)){
    event.respondWith(caches.open(MEDIA_CACHE).then(async (cache) => {
      const hit = await cache.match(url);
      if(hit) return hit;
      // requête CORS (pas « opaque ») : taille réelle comptée par le navigateur, réponse lisible
      let r; try{ r = await fetch(url, { mode:'cors', credentials:'omit' }); }catch(e){ r = null; }
      if(!r) return fetch(event.request);
      if(r.ok) cache.put(url, r.clone()).then(() => _mediaTrim(cache)).catch(() => {});
      return r;
    }));
    return;
  }
  if(LIB_RE.test(url)){   // v5.53.2 — bibliothèques : téléphone d'abord
    event.respondWith(caches.open(LIB_CACHE).then(async (cache) => {
      const hit = await cache.match(url); if(hit) return hit;
      try{ const r = await fetch(event.request); if(r && (r.ok || r.type === 'opaque')) cache.put(url, r.clone()).catch(() => {}); return r; }
      catch(e){ return new Response('', { status:504 }); }
    }));
    return;
  }
  if(NET_ONLY.test(url)) return;

  // Navigation (chargement de la page) — TOUJOURS réseau d'abord, jamais
  // l'ancien HTML en cache. On détecte via request.mode === 'navigate',
  // qui couvre l'URL racine "/RWOOD/" comme "/index.html" de façon fiable.
  const isDocument = event.request.mode === 'navigate'
                     || /index\.html(\?.*)?$/.test(url)
                     || /\/RWOOD\/?(\?.*)?$/.test(url);
  if(isDocument){
    // v5.53.2 — réseau d'abord, mais si le réseau traîne plus de 3 s (ou est absent), on ouvre la
    // version gardée sur le téléphone tout de suite ; la nouvelle version est quand même enregistrée.
    event.respondWith((async () => {
      const net = fetch(event.request, { cache: 'no-store' })
        .then((r) => { if(r && r.ok){ const c = r.clone(); caches.open(CACHE_NAME).then(x => x.put('./index.html', c)); } return r; });
      const cached = await caches.match(event.request) || await caches.match('./index.html');
      if(!cached) return net.catch(() => new Response('<h3 style="font-family:sans-serif;padding:20px">Notybat : pas de connexion</h3>', { headers:{ 'Content-Type':'text/html; charset=utf-8' } }));
      const timeout = new Promise(res => setTimeout(() => res(cached), 3000));
      return Promise.race([ net.then(r => (r && r.ok) ? r : cached).catch(() => cached), timeout ]);
    })());
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
        .then((r) => { if(r && r.ok){ const cp = r.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, cp)).catch(() => {}); } return r; })   // v5.56.3 — copie faite tout de suite
        .catch(() => caches.match(event.request))
    );
  }
});

self.addEventListener('push', (event) => {
  if(!event.data) return;
  let p; try { p = event.data.json(); } catch(e) { p = {title:'Notybat', body:event.data.text()}; }
  event.waitUntil(self.registration.showNotification(p.title||'Notybat', {
    body:p.body||'', icon:'./icons/icon-192-v4.png', badge:'./icons/icon-192-v4.png',
    tag:p.tag||'rwood-notif', data:p.data||{}, vibrate:[200,100,200],
    renotify: String(p.tag||'').startsWith('conv-'), // v5.41.475 — 1 notif par conversation, qui sonne à chaque message
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const view = event.notification.data && event.notification.data.url;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){
      if('focus' in c){
        c.focus();
        if(view) c.postMessage({type:'navigate', view});
        return;
      }
    }
    if(clients.openWindow) return clients.openWindow(view ? './index.html#' + encodeURIComponent(view) : './index.html');
  }));
});
