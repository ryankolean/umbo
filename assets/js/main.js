/* Umbo — interactions: sticky header, mobile nav, scroll reveals, footer year */
(function () {
  'use strict';

  // Opt into JS-only reveal styling (content is visible by default without this).
  document.documentElement.classList.add('js');

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

  // Scroll reveals — progressive enhancement, guaranteed to reveal.
  var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var revealAll = function () { reveals.forEach(function (el) { el.classList.add('in'); }); };
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    // A hidden/backgrounded tab pauses animations and defers IntersectionObserver,
    // which would leave content stuck invisible — reveal everything in that case.
    if (document.hidden) revealAll();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) revealAll(); });
    // Final safety net: never let anything stay hidden.
    window.addEventListener('load', function () { setTimeout(revealAll, 2500); });
  } else {
    revealAll();
  }

  // Footer year
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // Newsletter: posts to Kit, which owns the list, the double opt-in and the
  // unsubscribe. The form has a real action and method, so with JS off the
  // browser does a native POST to Kit's own confirmation page. This handler
  // only intercepts that to keep the visitor on eatumbo.com.
  // Swap the form's `action` to change providers.
  document.querySelectorAll('form[data-newsletter]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var btn = f.querySelector('button');
      var status = f.querySelector('.newsletter__status');
      var emailInput = f.querySelector('input[name="email_address"]');
      var honey = f.querySelector('input[name="_honey"]');
      var setStatus = function (msg) { if (status) { status.hidden = false; status.textContent = msg; } };

      if (honey && honey.value) { e.preventDefault(); return; }   // bot filled the honeypot

      // The provider form id has not been filled in yet. Do not let a native
      // POST send anyone to a dead Kit URL. Tell them the path that works.
      if (!f.action || f.action.indexOf('FORM_ID') !== -1) {
        e.preventDefault();
        setStatus('Email sarah@eatumbo.com to sign up.');
        return;
      }

      e.preventDefault();
      if (btn) { btn.disabled = true; btn.textContent = 'Signing up…'; }
      fetch(f.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(f)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        if (btn) btn.textContent = 'Check your email ✓';
        setStatus('Almost there. Click the confirmation link we just sent.');
        if (emailInput) emailInput.value = '';
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Join'; }
        setStatus('Something went wrong. Email sarah@eatumbo.com to sign up.');
      });
    });
  });

})();
