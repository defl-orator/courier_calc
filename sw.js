// Меняйте номер версии (v2, v3 и т.д.) при каждом крупном обновлении сайта
const CACHE_NAME = 'pay-calculator-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Установка: скачиваем ресурсы и сразу активируем новый SW без ожидания закрытия вкладок
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Активация: автоматически удаляем старые версии кэша (например, v1)
self.addEventListener('activate', (e) => {
  e.waitUntil(
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

// Стратегия Network First: проверяем обновленный файл в сети.
// Если сеть есть — отдаем свежий файл и обновляем кэш. Если сети нет (офлайн) — отдаем из кэша.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});