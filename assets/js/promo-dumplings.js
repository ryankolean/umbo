/* Dumpling Day promo (11/21/2026): the watercolor steamer in the home-page banner.
   Once, on load: the lid eases up, hangs a moment, then drifts away. Then mist rises slowly over the
   three dumplings, on a loop. Only the lid layer and the mist blobs move (transform and opacity),
   so the painted, filtered artwork underneath is drawn once.
   Needs GSAP (loaded from cdnjs just before this file). With reduced motion, no JS or no GSAP,
   the scene keeps its still frame from promo.css (lid off, a few wisps). */
(function () {
  'use strict';

  var root = document.querySelector('.dd');
  if (!root || !window.gsap || document.documentElement.classList.contains('promo-over')) return;

  var toggle = root.querySelector('.dd__toggle');
  var lid = root.querySelector('.dd-lid');
  var wisps = gsap.utils.toArray(root.querySelectorAll('.dd-mist span'));

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
    var LIFT = 1.4;   // when the lid starts to rise (the card has slid in by then)
    var CYCLE = 9;    // seconds for one wisp to rise and fade; wisps are spread evenly across it

    gsap.set(lid, { autoAlpha: 1, x: 0, y: 0, rotation: 0, transformOrigin: '50% 45%' });
    gsap.set(wisps, { autoAlpha: 0 });

    var tl = gsap.timeline();
    tl.to(lid, { yPercent: -7, rotation: -1.5, duration: 1.8, ease: 'sine.inOut' }, LIFT)
      .to(lid, { yPercent: -125, xPercent: 30, rotation: 7, duration: 3.4, ease: 'power1.in' }, LIFT + 2.1)
      .set(lid, { autoAlpha: 0 }, LIFT + 5.5);

    // Mist: each wisp swells as it climbs, sways a little, and thins out to nothing.
    var mist = gsap.timeline({ paused: true });
    wisps.forEach(function (w, i) {
      var sway = (i % 2 ? 1 : -1) * gsap.utils.random(8, 22);
      var at = i * CYCLE / wisps.length;
      mist.set(w, { yPercent: 10, xPercent: 0, scale: .45, autoAlpha: 0 }, at).to(w,
        { keyframes: { yPercent: [10, -60, -140, -230], xPercent: [0, sway * .4, sway, sway * .6], scale: [.45, .9, 1.35, 1.8], autoAlpha: [0, .85, .6, 0], easeEach: 'sine.inOut' },
          duration: CYCLE, ease: 'none', repeat: -1 }, at);
    });
    // Start the mist as the lid breaks the seal, already mid-cycle so it does not arrive as one puff.
    var misting = false;
    tl.call(function () { misting = true; mist.play(CYCLE * .35); }, null, LIFT + .6);

    // Pause control (WCAG 2.2.2), and no work while the banner is off screen.
    var userPaused = false, inView = true;
    function sync() { var off = userPaused || !inView; tl.paused(off); if (misting) mist.paused(off); }
    toggle.hidden = false;
    function onToggle() {
      userPaused = !userPaused;
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.textContent = userPaused ? 'Play' : 'Pause';
      sync();
    }
    toggle.addEventListener('click', onToggle);
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (e) { inView = e[0].isIntersecting; sync(); }) : null;
    if (io) io.observe(root);

    return function () {  // reduced motion switched on: matchMedia reverts the tweens to the still frame
      mist.kill();
      if (io) io.disconnect();
      toggle.removeEventListener('click', onToggle);
      toggle.hidden = true;
    };
  });
})();
