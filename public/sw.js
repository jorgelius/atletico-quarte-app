// Service Worker — CD Atlético Quarte
const CACHE = 'atletico-quarte-v1';

// Recursos del shell que se cachean al instalar
const PRECACHE = ['/', '/manifest.webmanifest', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Solo cachear GET de mismo origen
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  // Supabase y Google Fonts siempre desde red
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase.co') || url.hostname.includes('fonts.g')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      });
      // Cache-first para assets estáticos (JS/CSS/PNG/SVG/fonts)
      if (cached && /\.(js|css|png|svg|woff2?|ico)$/.test(url.pathname)) return cached;
      return networkFetch.catch(() => cached ?? new Response('Sin conexión', { status: 503 }));
    })
  );
});
