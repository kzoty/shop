const CACHE_NAME = 'padaria-pdv-v1';

// Compute base path dynamically from the service worker's location so
// caching works when the app is hosted under a subpath (e.g. /shop/)
const BASE_PATH = (function() {
  try {
    const p = self.location.pathname || '/';
    // If the path ends with the service worker filename, strip it to get the directory
    if (p.endsWith('/sw.js')) {
      return p.substring(0, p.lastIndexOf('/') + 1);
    }
    // If the path ends with a slash, use it as-is
    if (p.endsWith('/')) return p;
    // Fallback: take directory portion
    return p.substring(0, p.lastIndexOf('/') + 1) || '/';
  } catch (e) {
    return '/';
  }
})();

const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'styles.css',
  BASE_PATH + 'script.js',
  BASE_PATH + 'sales.html',
  BASE_PATH + 'sales.css',
  BASE_PATH + 'sales.js',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'android-launchericon-192-192.png',
  BASE_PATH + 'android-launchericon-512-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Só cachear requisições do mesmo origin (nosso domínio)
  try {
    const reqUrl = new URL(event.request.url);
    if (reqUrl.origin === self.location.origin) {
      event.respondWith(
        caches.match(event.request)
          .then(function(response) {
            // Retorna do cache se encontrou, senão faz fetch
            if (response) {
              return response;
            }
            return fetch(event.request).then(function(response) {
              // Não cachear respostas que não sejam bem-sucedidas
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              // Clona a resposta para cachear
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
          })
      );
      return;
    }
  } catch (e) {
    // If URL parsing fails, fall back to network
  }
  // Para requisições externas, apenas fetch
  event.respondWith(fetch(event.request));
});
