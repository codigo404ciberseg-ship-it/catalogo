const CACHE_NAME = 'pwa-tecno-v4';

// Archivos estáticos
const ASSETS = [
  './',
  './manifest.json',
  './Logo Digital CD-404.jpg'
];

// Instalación
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activación y limpieza de caches antiguas
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

// Interceptación inteligente de peticiones
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Si el usuario está navegando a una página HTML (ej. pagina1.html, pagina2.html)
  // dejamos que la red y Cloudflare manejen la navegación sin interferencia
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // Para imágenes y recursos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
