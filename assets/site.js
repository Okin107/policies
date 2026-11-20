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
