/* Service worker da versão web (GitHub Pages).
   - A página abre sempre a versão mais recente quando há internet; sem internet, usa a guardada.
   - Imagens e fontes ficam guardadas depois da primeira vez que aparecem, para funcionar offline.
   - O progresso do jogador NÃO está aqui: fica no armazenamento do navegador e nunca é apagado por atualizações. */
'use strict';
var VERSION = '3d3b5bdf88';
var CORE = 'sistema-core-' + VERSION;
var MEDIA = 'sistema-media-' + VERSION;
var FONTS = 'sistema-fonts';
var ICONS = 'assets/web/';
var PRECACHE = ['./', './index.html', './manifest.webmanifest', './' + ICONS + 'icon-192.png', './' + ICONS + 'icon-512.png', './' + ICONS + 'favicon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CORE).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CORE && k !== MEDIA && k !== FONTS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function networkFirst(req) {
  return fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CORE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
  });
}
function cacheFirst(req, name) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(name).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') { e.respondWith(cacheFirst(req, FONTS)); return; }
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || /\.(html|webmanifest|json)$/.test(url.pathname) || url.pathname.slice(-1) === '/') { e.respondWith(networkFirst(req)); return; }
  e.respondWith(cacheFirst(req, MEDIA));
});
