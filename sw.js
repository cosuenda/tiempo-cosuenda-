const CACHE_NAME="meteo-cosuenda";

const urlsToCache=[
"/tiempo-cosuenda-/",
"/tiempo-cosuenda-/index.html",
"/tiempo-cosuenda-/style.css",
"/tiempo-cosuenda-/script.js"
];

self.addEventListener("install",event=>{
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache=>cache.addAll(urlsToCache))
);
});

self.addEventListener("fetch",event=>{
event.respondWith(
caches.match(event.request)
.then(response=>response||fetch(event.request))
);
});
