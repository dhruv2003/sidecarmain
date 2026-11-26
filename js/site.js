/* Sidecar website — shared behaviour for every page:
   theme switch, mobile menu, scrollspy, cursor light, mobile download bar, service worker. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  var $ = function (id) { return document.getElementById(id); };

  window.Sidecar = window.Sidecar || {};
  window.Sidecar.reduced = reduced;

  /* ---------- Theme: two-button switch, remembered, circular reveal ---------- */
  var light = $('t-light'), dark = $('t-dark');
  function current() { return root.dataset.theme || (darkMq.matches ? 'dark' : 'light'); }
  function sync() {
    var t = current();
    if (light) light.setAttribute('aria-pressed', String(t === 'light'));
    if (dark) dark.setAttribute('aria-pressed', String(t === 'dark'));
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0b0d12' : '#f6f7f9');
  }
  function setTheme(t, btn) {
    if (t === current() && root.dataset.theme) return;
    var apply = function () {
      root.dataset.theme = t;
      try { localStorage.setItem('sidecar-theme', t); } catch (e) {}
      sync();
    };
    if (reduced || !document.startViewTransition || !btn) return apply();
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(apply);
    vt.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () {});
  }
  if (light) light.addEventListener('click', function () { setTheme('light', light); });
  if (dark) dark.addEventListener('click', function () { setTheme('dark', dark); });
  if (darkMq.addEventListener) darkMq.addEventListener('change', sync);
  sync();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('menu-btn'), menu = $('mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    document.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('.site-header')) setMenu(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Scrollspy with a sliding indicator ---------- */
  var nav = $('nav'), ind = $('nav-ind');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  if (nav && ind && sections.length && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(document.querySelectorAll('#nav a[href^="#"], #mobile-menu a[href^="#"]'));
    var active = null;
    var place = function () {
      var a = active && nav.querySelector('a[href="#' + active + '"]');
      if (!a || !a.offsetWidth) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1;
      ind.style.width = (a.offsetWidth - 20) + 'px';
      ind.style.transform = 'translateX(' + (a.offsetLeft + 10) + 'px)';
    };
    var mark = function (id) {
      active = id;
      links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)); });
      place();
    };
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
    window.addEventListener('resize', place, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  /* ---------- Cursor-following light (mouse only) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.spot'); if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Mobile download bar: after the hero, hidden near the download section ---------- */
  var bar = $('dl-bar'), hero = document.querySelector('.hero, .dl-hero'), dlSection = $('download');
  if (bar && hero && 'IntersectionObserver' in window) {
    var heroVisible = true, dlVisible = false;
    var update = function () { bar.classList.toggle('show', !heroVisible && !dlVisible); };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; update(); }, { rootMargin: '0px 0px -40% 0px' }).observe(hero);
    if (dlSection) new IntersectionObserver(function (es) { dlVisible = es[0].isIntersecting; update(); }).observe(dlSection);
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  window.Sidecar.toast = function (text) {
    var t = $('toast'); if (!t) return;
    t.querySelector('span').textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3600);
  };

  /* ---------- Footer year ---------- */
  var year = $('year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- Service worker (offline support) ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
