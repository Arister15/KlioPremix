const CACHE_NAME = 'klio-premix-v2'; // 👈 Κάθε φορά που κάνεις αλλαγές στο μέλλον, άλλαζε το v2 σε v3, v4 κτλ.

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './images.png',
  './manifest.json'
];

// Εγκατάσταση και άμεση παράκαμψη αναμονής (skipWaiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Καθαρισμός παλιάς cache κατά την ενεργοποίηση
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Στρατηγική Network First: Προσπαθεί να φέρει τα φρέσκα δεδομένα και αν είναι offline παίρνει από την cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
