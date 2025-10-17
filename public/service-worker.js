const CACHE_NAME = 'churchon-cache-v1';
const OFFLINE_URL = '/offline.html';

// Lista de arquivos para cachear durante a instalação
const FILES_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo.png',
  OFFLINE_URL,
  // Adicione outros recursos estáticos importantes aqui, se houver
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching essential files and offline page.');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Ativa o novo Service Worker imediatamente
      .catch((error) => console.error('[Service Worker] Failed to cache during install:', error))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim()) // Assume controle dos clientes imediatamente
  );
});

self.addEventListener('fetch', (event) => {
  // Apenas para requisições de navegação (carregamento de página)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('[Service Worker] Network request failed, serving offline fallback.');
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    // Para outros recursos (CSS, JS, imagens), tente cache-first, depois network
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          // Se a requisição de rede falhar e não houver no cache, pode-se retornar um fallback genérico ou erro
          console.log('[Service Worker] Failed to fetch from network and not in cache:', event.request.url);
          return new Response(null, { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});