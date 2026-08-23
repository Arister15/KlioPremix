const CACHE_NAME = 'klio-premix-live-v2';
const FONT_CACHE = 'klio-fonts-cache';

// Εγκατάσταση και άμεση ενεργοποίηση
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ενεργοποίηση και καθαρισμός παλιών εκδόσεων cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
              .map((key) => caches.delete(key))
        );
      })
    ])
  );
});

// Διαχείριση αιτημάτων (Fetch)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Αγνοούμε τα live requests της βάσης δεδομένων Firebase
  if (url.hostname.includes('firebasedatabase.app') || url.hostname.includes('firebaseio.com')) {
    return;
  }

  // 2. Στρατηγική CACHE-FIRST για Γραμματοσειρές (Google Fonts CSS & αρχεία .woff2)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse; // Επιστροφή άμεσα από την cache
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cachedResponse;
        }
      })
    );
    return;
  }

  // 3. Στρατηγική NETWORK-FIRST για την υπόλοιπη εφαρμογή (HTML, JS, εικόνες κ.λπ.)
  event.respondWith(
    fetch(event.request)
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
        // Αν είστε Offline, σερβίρει από την cache
        return caches.match(event.request);
      })
  );
});
