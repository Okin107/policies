// Header: dropdowns (hover on desktop, tap anywhere) and the phone menu
(function () {
  var dds = document.querySelectorAll('.dd');
  function closeAll(except) {
    dds.forEach(function (dd) {
      if (dd === except) return;
      dd.classList.remove('open');
      dd.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
  }
  dds.forEach(function (dd) {
    var btn = dd.querySelector('.dd-btn');
    var timer;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    dd.addEventListener('mouseenter', function () {
      if (!window.matchMedia('(hover: hover)').matches) return;
      clearTimeout(timer); closeAll(dd);
      dd.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    });
    dd.addEventListener('mouseleave', function () {
      if (!window.matchMedia('(hover: hover)').matches) return;
      timer = setTimeout(function () { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 160);
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) closeAll(); });

  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mnav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(mnav.hidden); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && !mnav.hidden) setMenu(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeAll();
    if (mnav && !mnav.hidden) { setMenu(false); burger.focus(); }
  });
})();

// Game page trailer: muted autoplay loop while on screen; the button turns sound on and off
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.phone').forEach(function (phone) {
    var v = phone.querySelector('video.trailer');
    var btn = phone.querySelector('.sound');
    if (!v) return;
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
      }, { threshold: 0.35 }).observe(v);
    } else {
      v.controls = true;
    }
    if (btn) btn.addEventListener('click', function () {
      v.muted = !v.muted;
      if (!v.muted) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      btn.textContent = v.muted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
    });
  });
})();

// The visit so far, in this tab only (sessionStorage: no cookie, gone when the tab closes, never sent anywhere but with a
// store tap below): where it came from, the reel link it came with, the pages seen and when, the trailer played. A tab
// quiet for 30 minutes starts a new visit.
(function () {
  var KEY = 'phmnVisit', now = Date.now(), v = null;
  try { v = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!v || !v.t || now - (v.last || v.t) > 30 * 60 * 1000) {
    var q = new URLSearchParams(location.search), from = '';
    try { var r = document.referrer ? new URL(document.referrer) : null; if (r && r.host !== location.host) from = r.host; } catch (e) {}
    var u = function (k) { return (q.get('utm_' + k) || '').slice(0, 60); };
    v = { t: now, from: from, utm: { source: u('source'), medium: u('medium'), campaign: u('campaign'), content: u('content') }, steps: [] };
  }
  var secs = function () { return Math.round((Date.now() - v.t) / 1000); };
  var save = function () { v.last = Date.now(); try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  if (v.steps.length < 12) v.steps.push({ p: location.pathname, s: secs() });
  save();
  var played = false;
  document.addEventListener('play', function (e) {
    if (played || !e.target || e.target.tagName !== 'VIDEO' || v.steps.length >= 12) return;
    played = true;
    v.steps.push({ p: location.pathname, s: secs(), e: 'video' });
    save();
  }, true);
  window.PHMN_VISIT = { get: function () { return { from: v.from, utm: v.utm, steps: v.steps, secs: secs() }; } };
})();

// Store buttons: each tap goes to its game's server (never in the owner's browser, ?me=1) with the visit above, the page
// and the browser's language; the server adds the country and the kind of phone, and keeps nothing that names the
// person (no address, no id). Then the store opens as usual.
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-store]');
    var box = a && a.closest('[data-taps]');
    if (!box || !navigator.sendBeacon || window.PHMN_ME) return;
    var visit = window.PHMN_VISIT ? window.PHMN_VISIT.get() : {};
    try {
      navigator.sendBeacon(box.dataset.taps, JSON.stringify({ store: a.dataset.store, page: location.pathname, lang: (navigator.language || '').slice(0, 12),
        from: visit.from || '', utm: visit.utm || {}, steps: visit.steps || [], secs: visit.secs || 0 }));
    } catch (err) {}
  });
})();
