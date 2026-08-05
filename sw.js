const CACHE_NAME = 'klio-premix-live';

// Εγκατάσταση και άμεση ενεργοποίηση
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ενεργοποίηση
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Στρατηγική Network-First (Ζητάει πάντα το φρέσκο αρχείο από το GitHub)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Αν δεν έχεις ίντερνετ (Offline), σερβίρει την τελευταία αποθηκευμένη έκδοση
        return caches.match(event.request);
      })
  );
});
