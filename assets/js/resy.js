/* Umbo — Resy booking: links marked data-resy open Resy's booking window in place.
   data-resy-date="YYYY-MM-DD" opens it on that day (the Dumpling Day banner uses 2026-11-21).
   Without JS, or if Resy's script fails to load, they go to the link's Resy page. */
(function () {
  'use strict';

  var links = document.querySelectorAll('a[data-resy]');
  if (!links.length) return;

  // Widget code from ResyOS > Venue > Basic Info > Widget. The key is public by design.
  var RESY = { venueId: 99454, apiKey: 'XaX2PLHdWnMaG5oyOX7zy7trcpuzp9r1' };
  var loading = null;

  // embed.js is ~110 KB, so fetch it on first intent (hover, focus, touch), not on page load.
  function load() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://widgets.resy.com/embed.js';
      s.async = true;
      s.onload = function () { window.resyWidget ? resolve(window.resyWidget) : reject(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return loading;
  }

  Array.prototype.forEach.call(links, function (a) {
    ['pointerenter', 'focus', 'touchstart'].forEach(function (type) {
      a.addEventListener(type, load, { once: true, passive: true });
    });
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      load().then(function (resy) {
        var date = a.getAttribute('data-resy-date');
        resy.openModal(date ? { venueId: RESY.venueId, apiKey: RESY.apiKey, date: date } : RESY);
      }, function () {
        window.location.href = a.href;
      });
    });
  });
})();
