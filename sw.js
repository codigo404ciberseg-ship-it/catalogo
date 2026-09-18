const CACHE_NAME = 'pwa-tecno-v3';

// Solo guardamos la raíz './' para evitar el conflicto de redirección de Cloudflare
const urlsToCache = [
  './',
  './manifest.json',
  './Logo Digital CD-404.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si está en caché, devolverlo
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no, ir a la red permitiendo seguir redirecciones
      return fetch(event.request, { redirect: 'follow' });
    })
  );
});
