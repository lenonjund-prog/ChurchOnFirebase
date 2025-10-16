const CACHE_NAME = 'churchon-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/globals.css',
  '/logo.png',
  '/icon.png',
  // Adicione outros recursos estáticos importantes aqui
  // Ex: '/_next/static/css/main.css', '/_next/static/chunks/main.js'
  // Para Next.js, os caminhos exatos de build podem variar, então é melhor
  // deixar o Service Worker mais genérico ou usar uma biblioteca PWA para Next.js.
  // Para este exemplo, focaremos nos assets que você já tem na pasta public.
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request);
      })
  );
});