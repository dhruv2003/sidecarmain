/* Sidecar website — home page motion:
   1. the app window boots and tests itself,
   2. a request travels through the "Under the hood" diagram,
   3. the request log streams with a docked inspector and latency sparkline,
   4. client setup snippets type in line by line. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var fmt = function (n) { return n.toLocaleString('en-US'); };
  var restart = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  var inView = function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  /* ================= 1. Hero app window ================= */
  function countUp(el, to, dec, dur) {
    if (reduced) return;
    var t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec) : fmt(Math.round(v));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  var win = $('app-window'), orb = $('orb'), btn = $('run-test'), step4 = $('step-4');
  var lab = $('orb-label'), ttl = $('orb-title'), cp = $('orb-copy'), txt = $('orb-text');
  var reqCount = 128, testing = false, userTouched = false;

  function setOrb(state, l, t, c) {
    orb.dataset.state = state; lab.textContent = l; ttl.textContent = t; cp.textContent = c;
    restart(txt, 'swap');
  }
  async function runTest() {
    if (testing) return; testing = true;
    btn.disabled = true; btn.textContent = 'Testing…';
    setOrb('testing', 'Testing', 'Checking port, handshake and sign-in', 'Sending a small request through 127.0.0.1:3081 to your Codex account.');
    step4.dataset.state = 'active';
    await sleep(reduced ? 200 : 1400);
    var ms = 360 + Math.round(Math.random() * 120);
    setOrb('ready', 'Connection verified', 'You’re ready to send requests', 'Last test returned 200 OK in ' + ms + ' ms. Point VS Code, Cursor, or a script at your local endpoint.');
    restart(orb.querySelector('.check'), 'draw');
    step4.dataset.state = 'done';
    reqCount++; $('m-req').textContent = fmt(reqCount); $('nav-count').textContent = fmt(reqCount);
    restart($('mx-req'), 'bump');
    btn.disabled = false; btn.textContent = 'Test connection'; testing = false;
  }
  btn.addEventListener('click', function () { userTouched = true; runTest(); });

  function offsetIn(el, ancestor) {
    var x = 0, y = 0;
    while (el && el !== ancestor) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return [x, y];
  }
  async function intro() {
    document.querySelectorAll('[data-count]').forEach(function (el) { countUp(el, parseFloat(el.dataset.count), +el.dataset.dec || 0, 1400); });
    if (reduced || !inView(win)) return;
    setOrb('setup', 'Almost there', 'Send a test to finish setup', 'Workspace, key and Codex sign-in are done. One request confirms the whole path.');
    step4.dataset.state = 'active';
    await sleep(2100);
    if (userTouched) return;
    if (!inView(win)) { runTest(); return; }
    var cur = $('fake-cursor'), ring = $('click-ring');
    var o = offsetIn(btn, win), x = o[0] + btn.offsetWidth * .6, y = o[1] + btn.offsetHeight * .55;
    if (!coarse) {
      var sx = win.offsetWidth * .86, sy = win.offsetHeight * .98;
      await cur.animate([
        { transform: 'translate(' + sx + 'px,' + sy + 'px)', opacity: 0 },
        { transform: 'translate(' + ((sx + x) / 2 + 40) + 'px,' + ((sy + y) / 2) + 'px)', opacity: 1, offset: .35 },
        { transform: 'translate(' + x + 'px,' + y + 'px)', opacity: 1 }
      ], { duration: 1100, easing: 'cubic-bezier(.3,.1,.15,1)', fill: 'forwards' }).finished;
      if (userTouched) { cur.animate({ opacity: [1, 0] }, { duration: 200, fill: 'forwards' }); return; }
      cur.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) scale(1)' }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(.82)' }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(1)' }], { duration: 260, fill: 'forwards' });
    }
    ring.style.left = x + 'px'; ring.style.top = y + 'px';
    ring.animate([{ transform: 'scale(.4)', opacity: .9 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
    btn.classList.add('pressed'); setTimeout(function () { btn.classList.remove('pressed'); }, 160);
    runTest();
    if (!coarse) {
      await sleep(500);
      cur.animate([{ transform: 'translate(' + x + 'px,' + y + 'px)', opacity: 1 }, { transform: 'translate(' + (x + 30) + 'px,' + (y + 40) + 'px)', opacity: 0 }], { duration: 500, easing: 'ease-in', fill: 'forwards' });
    }
  }
  intro();

  /* ================= 2. Request diagram ================= */
  var diagram = $('diagram'), w1 = $('w1'), w2 = $('w2');
  var nEd = $('n-editor'), nCore = $('n-core'), nCx = $('n-codex');
  var checks = Array.prototype.slice.call($('checks').children);
  var rPill = $('r-pill'), rMs = $('r-ms'), rTok = $('r-tok'), rMsg = $('r-msg');
  var sendOne = $('send-one'), sendBurst = $('send-burst');
  var flowBusy = false;
  function travel(wire, forward, color, dur) {
    var p = wire.querySelector('.packet');
    var prop = getComputedStyle(diagram).flexDirection === 'column' ? 'top' : 'left';
    var a = forward ? 0 : 100, b = forward ? 100 : 0;
    var at = function (f) { return (a + (b - a) * f) + '%'; };
    var kf = function (f, op, off) { var k = { opacity: op }; k[prop] = at(f); if (off != null) k.offset = off; return k; };
    wire.style.setProperty('--pc', color); p.style.setProperty('--pc', color);
    wire.classList.add('live'); wire.classList.toggle('rev', !forward);
    var anim = p.animate([kf(0, 0), kf(.12, 1, .12), kf(.88, 1, .88), kf(1, 0)], { duration: dur, easing: 'cubic-bezier(.45,0,.55,1)' });
    return anim.finished.then(function () { wire.classList.remove('live', 'rev'); });
  }
  function hit(node, cls, ms) { cls = cls || 'hit'; node.classList.add(cls); setTimeout(function () { node.classList.remove(cls); }, ms || 500); }
  function setCheck(li, s) { li.dataset.s = s; li.querySelector('use').setAttribute('href', s === 'bad' ? '#i-x' : '#i-check'); }
  function ticker(el, to, dur, suffix) {
    var t0 = performance.now();
    var f = function (now) { var p = Math.min(1, (now - t0) / dur); el.textContent = fmt(Math.round(to * p)) + suffix; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  async function sendFlow(burst) {
    if (flowBusy) return; flowBusy = true;
    sendOne.disabled = sendBurst.disabled = true;
    var speed = reduced ? .25 : 1;
    checks.forEach(function (li) { setCheck(li, 'wait'); });
    $('rate-text').textContent = burst ? '61 requests this minute' : 'Under 60 requests / min';
    rPill.className = 'pill busy'; rPill.textContent = 'In flight'; rMs.textContent = '0 ms'; rTok.textContent = '– / –';
    rMsg.textContent = 'The request leaves your editor for the local gateway.';
    hit(nEd);
    ticker(rMs, burst ? 12 : 412, (burst ? 1500 : 3600) * speed, ' ms');
    await travel(w1, true, 'var(--accent)', 650 * speed);
    nCore.classList.add('hit');
    rMsg.textContent = 'Sidecar checks the key, the rate limit and the workspace.';
    await sleep(160 * speed); setCheck(checks[0], 'ok');
    await sleep(240 * speed);
    if (burst) {
      setCheck(checks[1], 'bad'); nCore.classList.remove('hit'); hit(nCore, 'hit-bad', 900);
      await sleep(300 * speed);
      rMsg.textContent = 'Too many requests. Sidecar answers 429 itself, so nothing reaches Codex.';
      await travel(w1, false, 'var(--warn)', 550 * speed);
      hit(nEd, 'hit-bad', 700);
      rPill.className = 'pill warn'; rPill.textContent = '429 Rate limited'; rMs.textContent = '12 ms'; rTok.textContent = '0 / 0';
      rMsg.textContent = 'Stopped locally in 12 ms. 0 tokens used. Your quota is untouched.';
    } else {
      setCheck(checks[1], 'ok'); await sleep(240 * speed); setCheck(checks[2], 'ok');
      await sleep(200 * speed); nCore.classList.remove('hit');
      rMsg.textContent = 'All checks passed. Forwarded to Codex on your account.';
      await travel(w2, true, 'var(--accent)', 650 * speed);
      hit(nCx, 'hit', 700); rMsg.textContent = 'Codex is generating a response…';
      await sleep(500 * speed);
      await travel(w2, false, 'var(--ok)', 600 * speed); hit(nCore, 'hit-ok', 400);
      await travel(w1, false, 'var(--ok)', 600 * speed); hit(nEd, 'hit-ok', 700);
      rPill.className = 'pill'; rPill.textContent = '200 OK'; rMs.textContent = '412 ms'; rTok.textContent = '14 / 18';
      rMsg.textContent = 'Answered in 412 ms. Logged as metadata only: time, model, status, latency, tokens.';
    }
    sendOne.disabled = sendBurst.disabled = false; flowBusy = false;
  }
  sendOne.addEventListener('click', function () { sendFlow(false); });
  sendBurst.addEventListener('click', function () { sendFlow(true); });
  if (!reduced && 'IntersectionObserver' in window) {
    var once = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { once.disconnect(); setTimeout(function () { sendFlow(false); }, 400); }
    }, { threshold: .5 });
    once.observe(diagram);
  }

  /* ================= 3. Streaming request log ================= */
  var now = Date.now();
  var rows = [
    { ts: now - 60e3, name: 'IDE inline query', model: 'Codex model', code: 200, ms: 412, tin: 14, tout: 14, key: 'client-portal-dev' },
    { ts: now - 240e3, name: 'Prototype test completion', model: 'Selected model', code: 200, ms: 1240, tin: 210, tout: 332, key: 'client-portal-dev' },
    { ts: now - 540e3, name: 'Rapid script loop', model: 'Codex model', code: 429, ms: 12, tin: 0, tout: 0, key: 'bench-script' },
    { ts: now - 840e3, name: 'Connection test', model: 'handshake-ping', code: 200, ms: 210, tin: 12, tout: 20, key: 'client-portal-dev' }
  ];
  var lat = [380, 420, 510, 390, 1240, 450, 300, 410, 620, 380, 12, 400, 470, 350, 980, 420, 390, 210, 440, 520, 405, 1240, 12, 412];
  var pool = [
    ['Inline completion', 'Codex model', 'client-portal-dev'], ['Explain this function', 'Codex model', 'client-portal-dev'],
    ['Prototype stream', 'Selected model', 'client-portal-dev'], ['Commit message draft', 'Codex model', 'client-portal-dev'],
    ['Generate unit tests', 'Selected model', 'client-portal-dev'], ['Benchmark loop', 'Codex model', 'bench-script']
  ];
  var tbody = $('req-rows'), selected = rows[0];
  function ago(ts) { var s = Math.max(0, Math.round((Date.now() - ts) / 1000)); return s < 5 ? 'just now' : s < 60 ? s + ' s ago' : Math.round(s / 60) + ' min ago'; }
  function pillFor(c) { return c === 200 ? '<span class="pill">200 OK</span>' : '<span class="pill warn">429 Limited</span>'; }
  function renderRows(enterFirst) {
    tbody.innerHTML = rows.map(function (r, i) {
      return '<tr tabindex="0" data-i="' + i + '" aria-selected="' + (r === selected) + '"' + (i === 0 && enterFirst ? ' class="enter"' : '') + '>' +
        '<td class="col-time">' + ago(r.ts) + '</td><td>' + r.name + '<span class="sub">' + r.model + '</span></td><td>' + pillFor(r.code) + '</td>' +
        '<td class="num">' + fmt(r.ms) + ' ms</td><td class="num col-tok">' + fmt(r.tin + r.tout) + '</td></tr>';
    }).join('');
  }
  function renderInspector() {
    var r = selected;
    $('ins-title').textContent = r.name;
    var p = $('ins-pill'); p.className = 'pill' + (r.code === 200 ? '' : ' warn'); p.textContent = r.code === 200 ? '200 OK' : '429 Rate limited';
    $('ins-list').innerHTML = [['Key', r.key], ['Model', r.model], ['Duration', fmt(r.ms) + ' ms'], ['Tokens in / out', r.tin + ' / ' + r.tout], ['When', ago(r.ts)]]
      .map(function (kv) { return '<div><dt>' + kv[0] + '</dt><dd>' + kv[1] + '</dd></div>'; }).join('');
    var n = $('ins-note');
    if (r.code === 200) { n.className = 'notice calm'; n.textContent = 'Prompts, responses and secrets are never recorded.'; }
    else { n.className = 'notice'; n.textContent = 'Rate limit reached (60 req/min). Stopped locally, so no quota was used.'; }
  }
  function renderSpark() {
    var W = 240, H = 56, pad = 5, max = Math.max.apply(null, lat) * 1.08;
    var ys = function (v) { return H - pad - (v / max) * (H - pad * 2); };
    var pts = lat.map(function (v, i) { return [(i / (lat.length - 1)) * W, ys(v)]; });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    $('spark-line').setAttribute('d', d);
    $('spark-area').setAttribute('d', d + ' L' + W + ' ' + H + ' L0 ' + H + ' Z');
    var sorted = lat.slice().sort(function (a, b) { return a - b; }), med = sorted[Math.floor(sorted.length / 2)];
    $('spark-mid').setAttribute('y1', ys(med)); $('spark-mid').setAttribute('y2', ys(med));
    var last = pts[pts.length - 1]; $('spark-end').setAttribute('cx', last[0]); $('spark-end').setAttribute('cy', last[1]);
    $('spark-med').textContent = fmt(med) + ' ms median';
  }
  renderRows(false); renderInspector(); renderSpark();
  function pick(tr) {
    selected = rows[+tr.dataset.i]; renderRows(false); renderInspector();
    var el = tbody.querySelector('tr[data-i="' + tr.dataset.i + '"]'); if (el) el.focus({ preventScroll: true });
  }
  tbody.addEventListener('click', function (e) { var tr = e.target.closest('tr'); if (tr) pick(tr); });
  tbody.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var tr = e.target.closest('tr'); if (tr) { e.preventDefault(); pick(tr); }
  });
  function addRow() {
    var name, model, key, code = 200, ms, tin, tout, src;
    if (Math.random() < .12) {
      src = pool[5]; code = 429; ms = 8 + Math.round(Math.random() * 8); tin = tout = 0;
    } else {
      src = pool[Math.floor(Math.random() * 5)];
      ms = 260 + Math.round(Math.random() * 700) + (Math.random() < .15 ? 700 : 0);
      tin = 10 + Math.round(Math.random() * 220); tout = 12 + Math.round(Math.random() * 360);
    }
    name = src[0]; model = src[1]; key = src[2];
    rows.unshift({ ts: Date.now(), name: name, model: model, code: code, ms: ms, tin: tin, tout: tout, key: key });
    rows = rows.slice(0, 6);
    if (rows.indexOf(selected) < 0) selected = rows[0];
    lat.push(ms); lat.shift();
    var focused = tbody.contains(document.activeElement);
    renderRows(true); renderInspector(); renderSpark();
    if (focused) { var el = tbody.querySelector('tr[aria-selected="true"]'); if (el) el.focus({ preventScroll: true }); }
  }
  if (!reduced && 'IntersectionObserver' in window) {
    var timer = null;
    new IntersectionObserver(function (es) {
      var vis = es.some(function (e) { return e.isIntersecting; });
      if (vis && !timer) timer = setInterval(function () { if (!document.hidden) addRow(); }, 3200);
      if (!vis && timer) { clearInterval(timer); timer = null; }
    }, { threshold: .2 }).observe($('telemetry'));
  }

  /* ================= 4. Client snippets ================= */
  var snippets = {
    vscode: ['settings.json', '{\n  <span class="k">"openai.baseUrl"</span>: <span class="s">"http://127.0.0.1:3081/v1"</span>,\n  <span class="k">"openai.apiKey"</span>: <span class="s">"sk-sidecar-dev-••••"</span>\n}', 'http://127.0.0.1:3081/v1'],
    cursor: ['Cursor › Settings › Models', '<span class="c"># Override OpenAI Base URL</span>\n<span class="k">Base URL</span>  <span class="s">http://127.0.0.1:3081/v1</span>\n<span class="k">API key</span>   <span class="s">sk-sidecar-dev-••••</span>', 'http://127.0.0.1:3081/v1'],
    browser: ['prototype.js', '<span class="k">const</span> res = <span class="k">await</span> fetch(<span class="s">"http://127.0.0.1:3081/v1/chat/completions"</span>, {\n  method: <span class="s">"POST"</span>,\n  headers: { Authorization: <span class="s">"Bearer sk-sidecar-dev-••••"</span> },\n  body: JSON.stringify({ messages, stream: <span class="k">true</span> })\n});', 'http://127.0.0.1:3081/v1/chat/completions'],
    curl: ['terminal', '<span class="c">$</span> curl http://127.0.0.1:3081/v1/models \\\n    -H <span class="s">"Authorization: Bearer sk-sidecar-dev-••••"</span>\n\n<span class="c"># 200 OK · 38 ms</span>', 'curl http://127.0.0.1:3081/v1/models']
  };
  var copyText = '';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.client'));
  function show(id) {
    tabs.forEach(function (t) { var on = t.dataset.client === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    var s = snippets[id];
    $('code-file').textContent = s[0]; copyText = s[2];
    var lines = s[1].split('\n');
    $('code-body').innerHTML = lines.map(function (l, i) {
      return '<span class="ln" style="--i:' + i + '">' + (l || ' ') + (i === lines.length - 1 ? '<span class="caret"></span>' : '') + '</span>';
    }).join('');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.dataset.client); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, d = (k === 'ArrowDown' || k === 'ArrowRight') ? 1 : (k === 'ArrowUp' || k === 'ArrowLeft') ? -1 : 0;
      if (!d) return; e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n.dataset.client);
    });
  });
  show('vscode');
  var copyLabel = $('copy-label');
  $('copy').addEventListener('click', function () {
    var done = function () { copyLabel.textContent = 'Copied'; setTimeout(function () { copyLabel.textContent = 'Copy'; }, 1400); };
    var fail = function () {
      var sel = window.getSelection(), range = document.createRange();
      range.selectNodeContents($('code-body')); sel.removeAllRanges(); sel.addRange(range);
      copyLabel.textContent = 'Selected';
    };
    try { navigator.clipboard.writeText(copyText).then(done, fail); } catch (e) { fail(); }
  });

  /* ================= Download CTA: version + visitor's OS ================= */
  /* Show the newest version: the committed snapshot first, then the live GitHub API if it answers with something newer. */
  function showVersion(v) {
    if (!v) return;
    document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = v; });
  }
  function newer(a, b) {
    var pa = String(a).replace(/^v/, '').split('.').map(Number), pb = String(b).replace(/^v/, '').split('.').map(Number);
    for (var i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); }
    return false;
  }
  var shown = null;
  fetch('latest-release.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (d && d.version && (!shown || newer(d.version, shown))) { shown = d.version; showVersion(shown); }
  }).catch(function () {});
  fetch('https://api.github.com/repos/dhruv2003/sidecar/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rel) {
      var v = rel && rel.tag_name;
      if (v && (!shown || newer(v, shown))) {
        shown = v; showVersion(v);
        var badge = document.querySelector('.release-badge'); if (badge) restart(badge, 'fresh');
      }
    }).catch(function () {});
  var ua = navigator.userAgent || '';
  var mac = $('dl-mac'), winBtn = $('dl-win'), hint = $('dl-hint');
  if (/Windows/.test(ua) && mac && winBtn) {
    mac.classList.add('secondary'); winBtn.classList.remove('secondary'); winBtn.parentNode.insertBefore(winBtn, mac);
    hint.textContent = 'Recommended for your PC · .exe';
  } else if (/Macintosh|Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua) && hint) {
    hint.textContent = 'Recommended for your Mac · .dmg';
  }
})();
