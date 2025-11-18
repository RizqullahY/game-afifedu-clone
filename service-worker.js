// Service Worker untuk Cache Gambar dan Assets
const CACHE_NAME = 'math-game-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './favicon.ico',
    './character.png',
    './icon_home.png',
    './icon_panjat.png',
    './icon_tarik.png',
    './panjat_pinang/climbleft.png',
    './panjat_pinang/climbright.png',
    './panjat_pinang/standleft.png',
    './panjat_pinang/standright.png',
    './panjat_pinang/tiang.png',
    './fonts/Poppins-Regular.ttf',
    './fonts/Poppins-Bold.ttf',
    './fonts/Poppins-SemiBold.ttf'
];

// Install Service Worker dan cache semua resources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] All assets cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(err => {
                console.error('[Service Worker] Cache failed:', err);
            })
    );
});

// Activate Service Worker dan hapus cache lama
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activated');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch - gunakan cache first, kemudian network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response dari cache
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }

                // Tidak ada di cache - fetch dari network
                console.log('[Service Worker] Fetching from network:', event.request.url);
                return fetch(event.request).then(response => {
                    // Cek apakah response valid
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response karena hanya bisa digunakan sekali
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(err => {
                console.error('[Service Worker] Fetch failed:', err);
            })
    );
});

