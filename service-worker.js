const CACHE_NAME = 'ichingapp-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './ui.js',
    './logic.js',
    './spinner.js',
    './firebase.js',
    './auth.js',
    './assets/animations/spinner-animation.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    // 必要に応じて卦画像の一部だけ先にキャッシュも可
];

// インストール時にキャッシュ
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // キャッシュにあれば返す
            if (cachedResponse) return cachedResponse;

            // なければネットワークから取得＆キャッシュに保存
            return fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    // 画像だけキャッシュする（SVGなど）
                    if (event.request.url.endsWith('.svg')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});

// フェッチ時のキャッシュ応答
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

// キャッシュの更新（バージョン変更時）
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }))
        )
    );
});

// fetch エラーハンドリング
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
            .catch((error) => {
                console.error('❌ Fetch error:', error);
                return new Response("Service Worker fetch error", {
                    status: 500,
                    statusText: "SW Fetch Failed"
                });
            })
    );
});
  
