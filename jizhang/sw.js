const CACHE_NAME = 'jizhang-v1';
const urlsToCache = [
    'index.html',
    'manifest.json',
    // 如果有外部图标或字体，可在此添加，现在没有
];

// 安装：缓存所有核心资源
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// 拦截请求：优先从缓存获取，若无则从网络获取并缓存
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            }
            // 如果缓存没有，就去网络请求，并顺便缓存起来
            return fetch(event.request).then(function(networkResponse) {
                // 检查是否是有效的响应
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                // 克隆响应，一个存入缓存，一个返回给页面
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
