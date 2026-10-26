/* Event promo (Halloween 2026): the chalkboard section removes itself once the event is over,
   so the home page is right even before the markup comes out. */
(function () {
  var ENDS = Date.parse('2026-11-01T00:00:00-04:00');
  if (Date.now() < ENDS) return;
  document.querySelectorAll('[data-promo]').forEach(function (n) { n.remove(); });
  document.body.classList.remove('has-promo-board');
})();
