const CACHE_NAME = "harian-simpanan-shell-v1";
const SHELL = ["/", "/login", "/offline", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.url.includes("/api/") || request.url.includes("supabase")) return;
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((response) => response || caches.match("/offline"))),
  );
});
