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
  // During install, attempt to cache core resources but don't fail install
  // if a single resource is temporarily unavailable (robust for CI/dev).
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return Promise.all(urlsToCache.map(url =>
          cache.add(url).catch(err => {
            // Log and continue; individual resource failures shouldn't block install
            console.warn('sw: failed to cache', url, err && err.message);
            return Promise.resolve();
          })
        ));
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Só cachear requisições do mesmo origin (nosso domínio)
  try {
    const reqUrl = new URL(event.request.url);
    if (reqUrl.origin === self.location.origin) {
      event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
          // Try network in parallel but prefer cache if available
          const networkPromise = fetch(event.request).then(function(networkResponse) {
            // If response is ok, put a copy in cache
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
            }
            return networkResponse;
          }).catch(function(err) {
            // Network failed; we'll fall back to cache below
            console.warn('sw: network fetch failed for', event.request.url, err && err.message);
            return null;
          });

          // If cache present, return it immediately; otherwise wait for network or fallback
          return cachedResponse || networkPromise.then(resp => resp || caches.match(BASE_PATH + 'index.html'));
        })
      );
      return;
    }
  } catch (e) {
    // If URL parsing fails, fall back to network
  }

  // For cross-origin requests or parsing failures, try network but catch errors
  event.respondWith(
    fetch(event.request).catch(function(err) {
      console.warn('sw: cross-origin or network fetch failed for', event.request.url, err && err.message);
      return caches.match(event.request) || caches.match(BASE_PATH + 'index.html');
    })
  );
});
