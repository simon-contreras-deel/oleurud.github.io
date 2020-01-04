const cacheName = 'cache-v1';
const precacheResources = [
    '/',
    'index.html',
    'css/bootstrap.min.css',
    'css/main.css',
    'images/space1.jpg',
    'images/space2.jpg',
    'images/space3.jpg',
    'js/jquery-3.3.1.slim.min.js',
    'js/bootstrap.bundle.min.js'
];

self.addEventListener('install', event => {
    console.log('Service worker install event!');
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(precacheResources))
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker activate event!');

    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (!cacheName !== key) {
                    return caches.delete(key);
                }
            })
        )).then(() => {
            console.log(`${cacheName} now ready to handle fetches!`);
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(caches.match(event.request)
        .then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

