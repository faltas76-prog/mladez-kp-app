const CACHE_NAME = "mladez-kp-app-v1";

const BASE = "/mladez-kp-app/";

const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "tactical.html",
  BASE + "lineup.html",
  BASE + "manifest.json",

  BASE + "js/tactical.js",
  BASE + "js/lineup.js",

  BASE + "offline/index.html",
  BASE + "offline/db.js",
  BASE + "offline/sync.js",

  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
