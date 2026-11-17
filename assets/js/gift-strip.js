/* Holiday gift card strip: a thin bar above the header that points to /gift-cards.html.
   Loaded as a plain (blocking) script as the first thing in <body>, so the bar and the
   header offset are in place before first paint: no layout shift and no flash of a
   finished season. Each season swaps itself in and out by date (America/Detroit).
   After the last season ends the script does nothing; delete it and the <script> tags then.
   Preview any season with ?gift=harvest|shopsmall|stocking|lastcall|newyear (?gift=off hides it). */
(function () {
  var SEASONS = [
    { id: 'harvest', from: '2026-11-17T00:00:00-05:00', until: '2026-11-28T00:00:00-05:00',
      script: 'Grateful', text: 'Pass the oysters. Umbo gift cards for the people at your table.',
      short: 'Gift cards for your table', cta: 'Give one', fx: 'leaf', n: 9 },
    { id: 'shopsmall', from: '2026-11-28T00:00:00-05:00', until: '2026-12-02T00:00:00-05:00',
      script: 'Shop small', text: 'Small Business Saturday to Cyber Monday: give a local dinner, not another gadget.',
      short: 'Give a local dinner', cta: 'Shop gift cards', fx: 'pearl', n: 7 },
    { id: 'stocking', from: '2026-12-02T00:00:00-05:00', until: '2026-12-21T00:00:00-05:00',
      script: 'Stuff the stocking', text: 'A dozen oysters fits in any stocking. Umbo gift cards, by email or in person.',
      short: 'Oysters fit any stocking', cta: 'Give one', fx: 'snow', n: 26 },
    { id: 'lastcall', from: '2026-12-21T00:00:00-05:00', until: '2026-12-25T00:00:00-05:00',
      script: 'Last minute?', text: 'We have you covered. Umbo e-gift cards arrive by email, so you are never too late.',
      short: 'E-gift cards, by email', cta: 'Send one', fx: 'bulb', n: 18 },
    { id: 'newyear', from: '2026-12-25T00:00:00-05:00', until: '2027-01-02T00:00:00-05:00',
      script: "Cheers to '27", text: 'Raise a glass to the new year. Umbo gift cards for whoever buys the next round.',
      short: 'Give the next round', cta: 'Give one', fx: 'bubble', n: 16 }
  ];

  var pick = null, forced = null, now = Date.now();
  try { forced = new URLSearchParams(location.search).get('gift'); } catch (e) {}
  if (forced === 'off') return;
  for (var i = 0; i < SEASONS.length; i++) {
    var s = SEASONS[i];
    if (forced ? s.id === forced : now >= Date.parse(s.from) && now < Date.parse(s.until)) { pick = s; break; }
  }
  if (!pick) return;

  var KEY = 'umbo-gift-strip-hidden';
  if (!forced) { try { if (localStorage.getItem(KEY) === pick.id) return; } catch (e) {} }

  var LEAF = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1c3 3 7 4 7 9a7 7 0 0 1-6 7v2H9v-2a7 7 0 0 1-6-7c0-5 4-6 7-9z"/></svg>';
  var ICONS = {
    leaf: LEAF,
    pearl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6 3 2 8 2 13c0 2 1 4 3 5h14c2-1 3-3 3-5 0-5-4-10-10-10zm0 2v12M8 6l2 11M16 6l-2 11M5 9l4 8M19 9l-4 8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="12" cy="20.5" r="2" class="gs-pearl"/></svg>',
    snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 9l9 6 9-6M12 8C10 4 6 4 7 6.5S12 8 12 8s4-.5 5-1.5S14 4 12 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    bubble: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8l-1 8a3 3 0 0 1-6 0zM12 13v7M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="6" r=".9"/><circle cx="13" cy="8" r=".7"/></svg>'
  };

  var fx = '';
  for (var k = 0; k < pick.n; k++) {
    var x = ((k + 0.5) / pick.n * 100 + (k * 37 % 11) - 5).toFixed(1);
    var d = (k * 0.73 % pick.n * 0.9).toFixed(2);
    var t = (5 + (k * 13 % 7)).toFixed(1);
    var z = (0.6 + (k * 7 % 5) / 10).toFixed(2);
    fx += '<i style="--x:' + x + '%;--d:-' + d + 's;--t:' + t + 's;--z:' + z + '">' + (pick.fx === 'leaf' ? LEAF : '') + '</i>';
  }

  document.documentElement.classList.add('has-gift-strip');
  document.body.insertAdjacentHTML('afterbegin',
    '<aside class="gift-strip gift-strip--' + pick.id + '" aria-label="Holiday gift cards">' +
      '<span class="gift-strip__fx gift-strip__fx--' + pick.fx + '" aria-hidden="true">' + fx + '</span>' +
      '<a class="gift-strip__link" href="/gift-cards.html">' +
        '<span class="gift-strip__icon">' + ICONS[pick.fx] + '</span>' +
        '<span class="gift-strip__script">' + pick.script + '</span>' +
        '<span class="gift-strip__text">' + pick.text + '</span>' +
        '<span class="gift-strip__short">' + pick.short + '</span>' +
        '<span class="gift-strip__cta">' + pick.cta + ' <span aria-hidden="true">&rarr;</span></span>' +
      '</a>' +
      '<button class="gift-strip__close" type="button" aria-label="Hide the gift card banner">&times;</button>' +
    '</aside>');

  document.body.querySelector('.gift-strip__close').addEventListener('click', function () {
    document.documentElement.classList.remove('has-gift-strip');
    this.parentNode.remove();
    try { localStorage.setItem(KEY, pick.id); } catch (e) {}
  });
})();
