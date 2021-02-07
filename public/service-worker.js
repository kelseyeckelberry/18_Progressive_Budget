const filesToPreCache = [
  '/',
  '/index.html',
  '/index.js',
  '/db.js',
  '/manifest.webmanifest',
  '/styles.css',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Files pre-cached successfully.');
      return cache.addAll(filesToPreCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('Removed cache data.', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

//Need to alter this further

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(DATA_CACHE_NAME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
