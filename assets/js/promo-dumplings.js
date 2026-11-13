/* Dumpling Day promo (11/21/2026): the looping stage animation in the home-page banner.
   Two scenes glide through right to left: a bamboo steamer that opens on three soup dumplings,
   then a dumpling folded over and pleated by hand. Smooth eases only, no bounce.
   Needs GSAP (loaded from cdnjs just before this file). With reduced motion, no JS or no GSAP,
   the stage keeps its static frame (open steamer, three soup dumplings) from promo.css. */
(function () {
  'use strict';

  var root = document.querySelector('.dd');
  if (!root || !window.gsap || document.documentElement.classList.contains('promo-over')) return;

  var q = gsap.utils.selector(root);
  var toggle = root.querySelector('.dd__toggle');
  var captions = root.querySelectorAll('.dd__label span');
  var W = 520;      // far enough right or left to clear the 480-wide stage
  var HID = 1.005;  // dash offset that hides a pathLength="1" line completely

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
    var tl = gsap.timeline({ repeat: -1, delay: .9, defaults: { ease: 'power2.inOut' } });

    // Captions are stacked spans crossfaded by tweens (no callbacks), so any point of the loop can be seeked.
    function caption(i, at) {
      tl.to(captions, { autoAlpha: 0, duration: .3 }, at)
        .to(captions[i], { autoAlpha: 1, duration: .5 }, at + .3);
    }
    function enter(seg, at) {
      tl.set(seg, { x: W, autoAlpha: 1 }, at).to(seg, { x: 0, duration: 1.2, ease: 'power3.out' }, at);
    }
    function exit(seg, at) {
      tl.to(seg, { x: -W, duration: 1, ease: 'power2.in' }, at).set(seg, { autoAlpha: 0 }, at + 1);
    }

    // ---- 1. Steamer: a wisp at the seam, the lid lifts away, steam rises, the buns ease up to full size.
    var buns = q('.dd-bun'), lid = q('.dd-lid'), steam = q('.dd-s1 .dd-steam'), leaks = q('.dd-leak');
    gsap.set('.dd-s1', { x: W });  // off stage before the first frame; the card is still sliding in
    caption(0, 0);
    enter('.dd-s1', 0);
    tl.set(buns, { scale: .9, transformOrigin: '50% 100%' }, 0)
      .set(steam, { autoAlpha: 0, strokeDashoffset: HID, y: 0 }, 0)
      .set(leaks, { autoAlpha: 0, strokeDashoffset: HID, y: 0 }, 0)
      .set(lid, { autoAlpha: 1, x: 0, y: 0, rotation: 0, transformOrigin: '50% 100%' }, 0)
      .to(leaks, { autoAlpha: .4, strokeDashoffset: 0, duration: 1, ease: 'sine.out', stagger: .2 }, 1)
      .to(leaks, { autoAlpha: 0, y: -10, duration: .8, ease: 'sine.in' }, 2)
      .to(lid, { x: 40, y: -270, rotation: 5, duration: 1.5 }, 2.1)
      .fromTo(steam, { autoAlpha: 0, strokeDashoffset: HID, y: 20 }, { autoAlpha: .55, strokeDashoffset: 0, y: -4, duration: 1.5, ease: 'sine.out', stagger: .15 }, 2.3)
      .to(buns, { scale: 1, duration: 1.3, ease: 'sine.inOut', stagger: .08 }, 2.4)
      .to(steam, { autoAlpha: 0, y: -28, duration: 1.3, ease: 'sine.in', stagger: .15 }, 4);
    exit('.dd-s1', 5.7);

    // ---- 2. By hand: filling set on a wrapper, the wrapper folds over, pleats pinched along the edge.
    var A = 6.4;
    var flap = q('.dd-flap'), pleats = q('.dd-pleat');
    caption(1, A + .2);
    enter('.dd-s2', A);
    tl.set('.dd-filling', { autoAlpha: 0, y: -24 }, A)
      .set(flap, { scaleY: 1, svgOrigin: '240 216' }, A)
      .set('.dd-crease', { autoAlpha: 0 }, A)
      .set('.dd-wrap-edge', { autoAlpha: 1 }, A)
      .set(pleats, { strokeDashoffset: HID }, A)
      .set('.dd-dumpling', { y: 0 }, A)
      .to('.dd-filling', { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out' }, A + 1.1)
      .to(flap, { scaleY: -1, duration: 1.1 }, A + 2)
      .to('.dd-crease', { autoAlpha: 1, duration: .3 }, A + 2.85)
      .set('.dd-wrap-edge', { autoAlpha: 0 }, A + 3.1)
      .to(pleats, { strokeDashoffset: 0, duration: .32, ease: 'power1.inOut', stagger: .26 }, A + 3.3)
      .to('.dd-dumpling', { y: -3, duration: 1.2, ease: 'sine.inOut' }, A + 5.5);
    exit('.dd-s2', A + 7);

    // Pause control (WCAG 2.2.2), and no work while the banner is off screen.
    var userPaused = false, inView = true;
    function sync() { tl.paused(userPaused || !inView); }
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

    return function () {  // reduced motion switched on: matchMedia reverts every tween to the static frame
      if (io) io.disconnect();
      toggle.removeEventListener('click', onToggle);
      toggle.hidden = true;
    };
  });
})();
