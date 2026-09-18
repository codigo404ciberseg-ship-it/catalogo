const CACHE_NAME = 'pwa-tecno-v2';

// Usamos rutas relativas con '.' para evitar problemas de rutas en Cloudflare / GitHub
const urlsToCache = [
  './',
  './index.html',
  './pagina1.html',
  './pagina2.html',
  './pagina3.html',
  './pagina4.html',
  './manifest.json',
  './Logo Digital CD-404.jpg'
];

// 1. INSTALACIÓN: Guardar archivos en caché
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos addAll de forma segura
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. ACTIVACIÓN: Limpiar cachés antiguas si cambiamos la versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Manejar peticiones y limpiar las redirecciones de Cloudflare
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Si Cloudflare redirige la respuesta (ej. /index.html -> /), 
        // creamos una copia limpia para evitar el error de redirección no permitida
        if (networkResponse.redirected) {
          return new Response(networkResponse.body, {
            headers: networkResponse.headers,
            status: networkResponse.status,
            statusText: networkResponse.statusText
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.error('Error en fetch:', err);
      });
    })
  );
});
