/* Sidecar landing site — service worker (offline-first).
 * v2: network-first for the shell (HTML/CSS/JSON) so updates propagate on the
 * next load; stale-while-revalidate only for heavy brand assets.
 */
'use strict';

var CACHE = 'sidecar-site-v2';
var SHELL = [
  './',
  './index.html',
  './download.html',
  './css/site.css?v=2',
  './favicon.svg',
  './assets/brand/svg/sidecar-symbol.svg',
  './assets/brand/svg/sidecar-symbol-white.svg',
  './assets/brand/svg/sidecar-app-icon-blue.svg',
  './assets/brand/png/wordmark-black-860x176.png',
  './assets/brand/png/wordmark-white-860x176.png',
  './assets/brand/png/sidecar-icon-32.png',
  './assets/brand/png/sidecar-icon-16.png',
  './assets/brand/png/app-icon-blue-180.png'
];

function put(cache, req, resp) {
  if (resp && resp.ok) cache.put(req, resp.clone());
  return resp;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE) return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; // never proxy cross-origin (GitHub API, fonts)

  var isShell = req.mode === 'navigate' ||
    /\.(html|css|js|json)(\?.*)?$/.test(url.pathname);

  if (isShell) {
    // Network-first: always try fresh, cached copy only as offline fallback.
    event.respondWith(
      caches.open(CACHE).then(function (cache) {
        return fetch(req).then(function (resp) { return put(cache, req, resp); })
          .catch(function () { return cache.match(req).then(function (m) { return m || cache.match('./index.html'); }); });
      })
    );
    return;
  }

  // Images / other assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req).then(function (cached) {
        var network = fetch(req).then(function (resp) { return put(cache, req, resp); })
          .catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
