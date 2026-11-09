const CACHE = "dulce-nube-shell-v6";
const IMAGE_CACHE = "dulce-nube-images-v5";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.json", "./img/icon-192.svg", "./img/icon-512.svg", "./img/icon-192.png", "./img/icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("dulce-nube-") && key !== CACHE && key !== IMAGE_CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => request.mode === "navigate" ? caches.match("./index.html") : new Response("Recurso no disponible sin conexión.", { status: 503 }))));
    return;
  }
  if (["images.unsplash.com","img.ananinja.com","www.marshfield-icecream.co.uk","fonts.googleapis.com","fonts.gstatic.com"].includes(url.hostname)) {
    event.respondWith(caches.open(IMAGE_CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      try { const response = await fetch(request); if (response && (response.ok || response.type === "opaque")) await cache.put(request,response.clone()); return response; }
      catch { return new Response("Foto no disponible sin conexión",{status:503,statusText:"Offline"}); }
    }));
  }
});
