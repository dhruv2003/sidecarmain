/* Sidecar website — download page.
   Release data comes from three sources, best first:
   1. latest-release.json, a same-origin snapshot the update-release workflow commits;
   2. the live GitHub API, which overrides the snapshot when it is reachable;
   3. plain links to the GitHub releases page if neither worked. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var RELEASES_PAGE = 'https://github.com/dhruv2003/sidecar/releases/latest';
  var btnMac = $('btn-mac'), btnWin = $('btn-win');
  var resolved = false;

  /* ---------- Recommend the visitor's OS ---------- */
  var ua = navigator.userAgent || '';
  var isMac = /Macintosh|Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua);
  var isWin = /Windows/.test(ua);
  if (isMac) {
    $('badge-mac').hidden = false; $('card-mac').classList.add('recommended');
  } else if (isWin) {
    $('badge-win').hidden = false; $('card-win').classList.add('recommended');
    btnMac.classList.add('secondary'); btnWin.classList.remove('secondary');
    var grid = $('card-win').parentNode; grid.insertBefore($('card-win'), $('card-mac'));
  }

  /* ---------- Formatting ---------- */
  function fmtSize(bytes) {
    if (!bytes) return '';
    var mb = bytes / (1024 * 1024);
    return (mb >= 100 ? Math.round(mb) : mb.toFixed(1)) + ' MB';
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; }
  }
  function fmtAge(iso) {
    var days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (isNaN(days)) return '';
    if (days <= 0) return 'Released today';
    if (days === 1) return 'Released yesterday';
    return 'Released ' + days + ' days ago';
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function inline(s) {
    return s.replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(https?:\/\/[^\s<)]+)/g, '<a href="$1" rel="noreferrer" target="_blank">$1</a>');
  }
  /* Installer and updater file lists belong on GitHub, not in "What's new". */
  function omitDownloadSections(notes) {
    var hidden = false, hiddenLevel = 0;
    return String(notes).split(/\r?\n/).filter(function (line) {
      var heading = line.trim().match(/^(#{1,6})\s+(.+?)\s*#*$/);
      if (heading) {
        var level = heading[1].length, title = heading[2].trim().toLowerCase();
        if (hidden && level <= hiddenLevel) hidden = false;
        if (title === 'installers' || title === 'automatic-update support files') { hidden = true; hiddenLevel = level; }
      }
      return !hidden;
    }).join('\n');
  }
  function renderNotes(title, notes) {
    notes = omitDownloadSections(notes || '');
    if (!notes.trim()) return;
    var out = '', first = true;
    notes.split(/\r?\n/).forEach(function (line) {
      var t = line.trim();
      if (t.replace(/^[-*]\s*/, '').replace(/^#+\s*/, '') === '') return;
      if (/^#\s/.test(t) && first) { first = false; return; } // the release title is already the panel heading
      first = false;
      if (/^#{1,6}\s/.test(t)) out += '<p class="h">' + inline(escapeHtml(t.replace(/^#+\s*/, ''))) + '</p>';
      else if (/^[-*]\s/.test(t)) out += '<p class="li"><span>' + inline(escapeHtml(t.replace(/^[-*]\s*/, ''))) + '</span></p>';
      else out += '<p>' + inline(escapeHtml(t)) + '</p>';
    });
    $('whats-new-body').innerHTML = out;
    $('whats-new-title').textContent = 'What’s new in ' + title;
    $('whats-new').hidden = false;
  }

  /* ---------- Apply a release ---------- */
  var appliedVersion = null;
  function isOlder(a, b) {
    var pa = String(a).replace(/^v/, '').split('.').map(Number), pb = String(b).replace(/^v/, '').split('.').map(Number);
    for (var i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0); }
    return false;
  }
  function applyRelease(version, dateIso, mac, win, notes, notesTitle) {
    // The snapshot and the live API race; never let an older answer replace a newer one.
    if (version && appliedVersion && isOlder(version, appliedVersion)) return;
    if (version) appliedVersion = version;
    if (version) {
      var date = dateIso ? fmtDate(dateIso) : '';
      $('version-line').textContent = 'Latest: ' + version + (date ? ' · ' + date : '');
      if (dateIso) { var f = $('freshness'); f.textContent = fmtAge(dateIso) + ' · via official GitHub releases'; f.hidden = false; }
    }
    if (notes) renderNotes(notesTitle || version || 'this release', notes);
    if (mac && mac.url) {
      btnMac.href = mac.url;
      $('file-mac').textContent = mac.name || 'macOS disk image';
      $('size-mac').textContent = mac.size ? fmtSize(mac.size) : '';
    }
    if (win && win.url) {
      btnWin.href = win.url;
      $('file-win').textContent = win.name || 'Windows installer';
      $('size-win').textContent = win.size ? fmtSize(win.size) : '';
    }
    if (version || (mac && mac.url) || (win && win.url)) resolved = true;
  }
  function fallback() {
    if (resolved) return;
    $('fallback-note').hidden = false;
    $('version-line').textContent = 'Latest release on GitHub';
    btnMac.href = RELEASES_PAGE; btnWin.href = RELEASES_PAGE;
    ['file-mac', 'file-win'].forEach(function (id) { $(id).textContent = 'Release page on GitHub'; });
    ['size-mac', 'size-win'].forEach(function (id) { $(id).textContent = ''; });
  }

  var snapshot = fetch('latest-release.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) { applyRelease(d.version, d.published_at, d.mac, d.win, d.notes, d.title); });

  var live = fetch('https://api.github.com/repos/dhruv2003/sidecar/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (rel) {
      var assets = rel.assets || [];
      var mac = assets.filter(function (a) { return /\.dmg$/i.test(a.name); })[0];
      var win = assets.filter(function (a) { return /\.exe$/i.test(a.name); })[0];
      applyRelease(rel.tag_name || rel.name, rel.published_at,
        mac && { name: mac.name, size: mac.size, url: mac.browser_download_url },
        win && { name: win.name, size: win.size, url: win.browser_download_url },
        rel.body, rel.name || rel.tag_name);
    });

  Promise.allSettled([snapshot, live]).then(fallback);

  /* ---------- Confirm the click ---------- */
  [btnMac, btnWin].forEach(function (b) {
    b.addEventListener('click', function () {
      var toast = window.Sidecar && window.Sidecar.toast;
      if (!toast) return;
      if (b.href.indexOf('/releases/download/') > -1) toast('Your ' + b.dataset.os + ' download is starting. Check your Downloads folder.');
      else toast('Opening the latest release on GitHub.');
    });
  });
})();
