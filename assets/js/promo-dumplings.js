/* Dumpling Day promo (11/21/2026): the watercolor steamer in the home-page banner.
   Once, on load: the lid hinges open on its right rim like a clamshell and, without stopping, is carried up
   and off to the right. Steam then rises from behind the three dumplings, on a loop. Only the lid layer and
   the mist blobs move (transform and opacity), so the painted, filtered artwork is drawn once.
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

    // Hinge point: the right end of the lid's rim (362, 180 in the 480 x 300 scene).
    gsap.set(lid, { autoAlpha: 1, x: 0, y: 0, rotation: 0, transformOrigin: '75.4% 60%' });
    gsap.set(wisps, { autoAlpha: 0, x: 0, y: 0, scale: .5 });  // drop the still frame's offsets

    // Two overlapping tweens on different properties: the hinge swing is already under way when the carry
    // starts, and the carry is still accelerating when the swing settles, so the lid never stops.
    var tl = gsap.timeline();
    tl.to(lid, { rotation: 30, duration: 2.2, ease: 'power2.inOut' }, LIFT)
      .to(lid, { xPercent: 62, yPercent: -120, duration: 2.6, ease: 'power2.in' }, LIFT + .9)
      .set(lid, { autoAlpha: 0 }, LIFT + 3.5);

    // Mist: each wisp swells as it climbs, sways a little, and thins out to nothing.
    var mist = gsap.timeline({ paused: true });
    wisps.forEach(function (w, i) {
      var sway = (i % 2 ? 1 : -1) * gsap.utils.random(8, 22);
      var at = i * CYCLE / wisps.length;
      mist.set(w, { yPercent: 20, xPercent: 0, scale: .5, autoAlpha: 0 }, at).to(w,
        { keyframes: { yPercent: [20, -40, -110, -190, -290], xPercent: [0, sway * .2, sway * .6, sway, sway * .7], scale: [.5, .8, 1.1, 1.4, 1.8], autoAlpha: [0, 1, .9, .55, 0], easeEach: 'sine.inOut' },
          duration: CYCLE, ease: 'none', repeat: -1 }, at);
    });
    // Start the mist as the lid cracks open, already mid-cycle so it does not arrive as one puff.
    var misting = false;
    tl.call(function () { misting = true; mist.play(CYCLE * .35); }, null, LIFT + .4);

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
