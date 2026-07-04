/* Umbo — interactions: sticky header, mobile nav, scroll reveals, footer year */
(function () {
  'use strict';

  // Sticky header state
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Scroll reveals
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Footer year
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // Newsletter stub (no backend yet)
  document.querySelectorAll('form[data-newsletter]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button');
      if (btn) { btn.textContent = 'On the list ✓'; btn.disabled = true; }
    });
  });
})();
