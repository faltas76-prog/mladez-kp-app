const CACHE_NAME = "trainer-app-v1";

const FILES = [
  "./",
  "./index.html",
  "./tactical.html",
  "./players.html",
  "./notes.html",
  "./attendance.html",
  "./manifest.json",
  "./js/tactical.js",
  "./js/players.js",
  "./js/notes.js",
  "./js/attendance.js"
];

/* INSTALL */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

/* ACTIVATE */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

/* FETCH */
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
