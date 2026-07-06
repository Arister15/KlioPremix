const CACHE_NAME = 'premix-v1';
// Εδώ βάζουμε όλα τα αρχεία που θέλουμε να αποθηκεύονται στο κινητό
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images.png' // Αν το εικονίδιό σου έχει άλλο όνομα στο manifest, άλλαξέ το εδώ
];

// Εγκατάσταση του Service Worker και αποθήκευση των αρχείων στη μνήμη (Cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Καθαρισμός παλιάς μνήμης cache αν κάνεις αναβάθμιση (π.χ. αν αλλάξεις το premix-v1 σε v2)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Στρατηγική "Cache First": Κοιτάζει πρώτα στη μνήμη του κινητού. Αν είσαι offline, φορτώνει από εκεί.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
