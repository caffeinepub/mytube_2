const CACHE_NAME = 'mytube-v1';
const RUNTIME_CACHE = 'mytube-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.webmanifest'
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API calls to Internet Computer canisters (let them go through)
  if (url.hostname.includes('.ic0.app') || url.hostname.includes('.icp0.io') || url.hostname.includes('localhost') && url.port === '4943') {
    return;
  }

  // Never cache video files (large media)
  if (
    request.destination === 'video' ||
    url.pathname.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)
  ) {
    return;
  }

  // Strategy 1: Cache-first for images and thumbnails
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return a fallback if offline and not cached
            return new Response('', { status: 404, statusText: 'Not Found' });
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Network-first with cache fallback for navigation and app shell
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: return cached version or fallback to cached index.html
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // SPA fallback: return cached index.html for client-side routing
            return caches.match('/index.html').then((indexResponse) => {
              return indexResponse || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
          });
        })
    );
    return;
  }

  // Strategy 3: Stale-while-revalidate for scripts, styles, and other assets
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If fetch fails and we have cache, return cache
          return cachedResponse;
        });

        // Return cached response immediately, but update cache in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});
