const CACHE_NAME = "pwa-cache-v2";
const urlsToCache = [
  "/churchApp/index.html",
  "/churchApp/style.css",
  "/churchApp/app.js",
  "/churchApp/icons/logo.png"
];

// 설치 단계에서 캐시할 파일 정의
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시된 응답이 있으면 반환, 없으면 네트워크에서 가져오기
      return response || fetch(event.request);
    })
  );
});

// 캐시 업데이트 및 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
