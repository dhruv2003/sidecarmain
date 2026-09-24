/* Sidecar landing site — service worker (offline-first, stale-while-revalidate).
 * Caches the shell and core assets so repeat visits load instantly and work
 * with no connection. Release data (latest-release.json) is always refetched.
 */
'use strict';

var CACHE = 'sidecar-site-v1';
var SHELL = [
  './',
  './index.html',
  './download.html',
  './css/site.css',
  './favicon.svg',
  './latest-release.json',
  './assets/brand/svg/sidecar-symbol.svg',
  './assets/brand/svg/sidecar-symbol-white.svg',
  './assets/brand/svg/sidecar-app-icon-blue.svg',
  './assets/brand/png/wordmark-black-860x176.png',
  './assets/brand/png/wordmark-white-860x176.png',
  './assets/brand/png/sidecar-icon-32.png',
  './assets/brand/png/sidecar-icon-16.png',
  './assets/brand/png/app-icon-blue-180.png'
];

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

  // Release snapshot, HTML shell and CSS: network-first via stale-while-revalidate.
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (resp) {
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return resp;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
