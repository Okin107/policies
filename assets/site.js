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

// Store buttons: each tap is counted by its game's server (never in the owner's browser, ?me=1) (one counter per day, store and page; no cookies, nothing about
// the person), then the store opens as usual
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-store]');
    var box = a && a.closest('[data-taps]');
    if (!box || !navigator.sendBeacon || window.PHMN_ME) return;
    try { navigator.sendBeacon(box.dataset.taps, JSON.stringify({ store: a.dataset.store, page: location.pathname })); } catch (err) {}
  });
})();
