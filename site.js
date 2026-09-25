/* FPFK Bethania Academy — shared site behaviour */
(function () {
  'use strict';
  var WA = '254702242291';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Ticker: duplicate content for seamless loop ---------- */
  (function () {
    var track = $('#tickerTrack');
    if (!track) return;
    var items = $$('span', track).map(function (s) { return s.outerHTML; });
    if (!items.length) return;
    track.innerHTML = items.join('') + items.join('');
  })();

  /* ---------- Nav: scroll shadow + mobile drawer + active link ---------- */
  var nav = $('#siteNav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
    var top = $('#toTop');
    if (top) top.classList.toggle('show', window.scrollY > 800);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('#menuBtn'), drawer = $('#drawer');
  function setDrawer(open) {
    if (!drawer || !menuBtn) return;
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.innerHTML = open
      ? '<svg class="ic"><use href="#i-close"/></svg>'
      : '<svg class="ic"><use href="#i-menu"/></svg>';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  var toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* Mark active nav link by current filename */
  (function () {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === '') file = 'index.html';
    $$('.nav-links a, .drawer a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href === file || (file === 'index.html' && (href === '' || href === './'))) a.classList.add('active');
    });
  })();

  /* ---------- Reveal on scroll ---------- */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el) { ro.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Animated counters ---------- */
  (function () {
    var els = $$('[data-count]');
    if (!els.length) return;
    function run(el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var suf = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
      var t0 = performance.now(), dur = 1300;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
      }, { threshold: .6 });
      els.forEach(function (el) { co.observe(el); });
    } else { els.forEach(run); }
  })();

  /* ---------- Hero cycling keyword (home page) ---------- */
  (function () {
    var el = $('#cycleWord');
    if (!el) return;
    var words = ['Nobility.', 'Excellence.', 'Integrity.', 'Discipline.', 'Faith.', 'Service.'];
    var i = 0;
    function swap() {
      if (reduce) { el.textContent = words[0]; return; }
      var letters = el.textContent.split('');
      el.style.opacity = 0; el.style.transform = 'translateY(10px)';
      setTimeout(function () {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.style.transition = 'none';
        el.style.transform = 'translateY(-10px)';
        requestAnimationFrame(function () {
          el.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.2,.7,.2,1)';
          el.style.opacity = 1; el.style.transform = 'translateY(0)';
        });
      }, 420);
    }
    el.style.display = 'inline-block';
    setInterval(swap, 2600);
  })();

  /* ---------- Gallery: filter + lightbox ---------- */
  (function () {
    var grid = $('#galGrid');
    if (!grid) return;
    var filterWrap = $('#galFilters');
    var items = $$('.gal-item', grid);
    if (filterWrap) {
      $$('.chip', filterWrap).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('.chip', filterWrap).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          var k = b.getAttribute('data-k');
          items.forEach(function (it) {
            it.style.display = (k === 'all' || it.getAttribute('data-cat') === k) ? '' : 'none';
          });
        });
      });
    }
    var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), idx = 0, opener = null;
    function visible() { return items.filter(function (it) { return it.style.display !== 'none'; }); }
    function show(i) {
      var vis = visible();
      idx = (i + vis.length) % vis.length;
      var it = vis[idx], im = $('img', it);
      lbImg.src = im.src; lbImg.alt = im.alt;
      lbCap.textContent = it.getAttribute('data-cap') || '';
    }
    function open(i, el) {
      opener = el; var vis = visible();
      show(vis.indexOf(el));
      lb.classList.add('open'); document.body.style.overflow = 'hidden';
      $('#lbClose').focus();
    }
    function close() {
      lb.classList.remove('open'); document.body.style.overflow = '';
      if (opener && opener.focus) opener.focus();
    }
    items.forEach(function (it) { it.addEventListener('click', function () { open(0, it); }); });
    if (lb) {
      $('#lbClose').addEventListener('click', close);
      $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
      $('#lbNext').addEventListener('click', function () { show(idx + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
      });
    }
  })();

  /* ---------- Reel video player ---------- */
  (function () {
    var v = $('#reelVideo');
    if (!v) return;
    var box = $('#reelBox'), btn = $('#reelToggle'), bar = $('#reelBar'), track = $('#reelTrack');
    var manual = false;
    v.muted = true;
    var sources = v.querySelectorAll('source'), last = sources[sources.length - 1];
    if (last) last.addEventListener('error', function () { if (box) box.style.display = 'none'; });
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function icon() {
      if (!btn) return;
      btn.innerHTML = '<svg class="ic"><use href="#' + (v.paused ? 'i-play' : 'i-pause') + '"/></svg>';
      btn.setAttribute('aria-label', v.paused ? 'Play video' : 'Pause video');
    }
    v.addEventListener('play', icon); v.addEventListener('pause', icon);
    v.addEventListener('timeupdate', function () { if (v.duration && bar) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });
    if (btn) btn.addEventListener('click', function () { if (v.paused) { manual = false; play(); } else { manual = true; v.pause(); } });
    if (track) track.addEventListener('click', function (e) {
      var r = track.getBoundingClientRect();
      if (v.duration) v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
    });
    var saveData = navigator.connection && navigator.connection.saveData;
    if (box && 'IntersectionObserver' in window && !reduce && !saveData) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !manual) play(); else if (!en.isIntersecting) v.pause();
        });
      }, { threshold: .4 }).observe(box);
    }
    $$('[data-play-reel]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.getElementById('watch');
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); manual = false; setTimeout(play, 500); }
      });
    });
    icon();
  })();

  /* ---------- Library grade buttons (no backend yet) ---------- */
  $$('.grade-btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var grade = b.textContent.trim();
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello, please share the ' + grade + ' revision materials.'), '_blank', 'noopener');
    });
  });

  /* ---------- Generic contact / admissions / feedback forms to WhatsApp ---------- */
  $$('form[data-wa]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('.form-err', form);
      var name = $('[name=name]', form), phone = $('[name=phone]', form), msg = $('[name=message]', form);
      if (name && !name.value.trim()) { if (err) err.textContent = 'Please enter your name.'; name.focus(); return; }
      if (phone && phone.hasAttribute('required') && !phone.value.trim()) { if (err) err.textContent = 'Please enter a phone number.'; phone.focus(); return; }
      if (err) err.textContent = '';
      var lines = ['Hello FPFK Bethania Academy,', ''];
      $$('input,select,textarea', form).forEach(function (f) {
        if (!f.name || !f.value) return;
        var lbl = form.querySelector('label[for="' + f.id + '"]');
        lines.push((lbl ? lbl.textContent.trim() : f.name) + ': ' + f.value);
      });
      var text = lines.join('\n');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      var ok = $('.form-ok', form);
      if (ok) ok.classList.add('show');
      form.reset();
    });
  });
})();
