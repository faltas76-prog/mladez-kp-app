const CACHE = "kp-mladez-v1";
const FILES = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/training.html",
  "/notes.html",
  "/players.html",
  "/attendance.html",
  "/css/style.css",
  "/js/app.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
