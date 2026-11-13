/* Dumpling Day promo (11/21/2026): the looping stage animation in the home-page banner.
   Four segments run right to left like a pass: steamer, pan, folding board, money bags.
   Needs GSAP (loaded from cdnjs just before this file). With reduced motion, no JS or no GSAP,
   the stage keeps its static frame (open steamer, three soup dumplings) from promo.css. */
(function () {
  'use strict';

  var root = document.querySelector('.dd');
  if (!root || !window.gsap || document.documentElement.classList.contains('promo-over')) return;

  var q = gsap.utils.selector(root);
  var toggle = root.querySelector('.dd__toggle');
  var foodIn = root.querySelector('.dd-food-in');
  var captions = root.querySelectorAll('.dd__label span');
  var W = 520;      // far enough right or left to clear the 480-wide stage
  var HID = 1.005;  // dash offset that hides a pathLength="1" line completely

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
    var tl = gsap.timeline({ repeat: -1, delay: .9, defaults: { ease: 'power2.out' } });

    // Captions are stacked spans crossfaded by tweens (no callbacks), so any point of the loop can be seeked.
    function caption(i, at) {
      tl.to(captions, { autoAlpha: 0, duration: .2 }, at)
        .to(captions[i], { autoAlpha: 1, duration: .3 }, at + .2);
    }
    function sparkle(at, x, y) {
      tl.set('.dd-sparkle', { x: x, y: y, autoAlpha: 1 }, at)
        .fromTo(q('.dd-sparkle path'), { strokeDashoffset: HID }, { strokeDashoffset: 0, duration: .3 }, at)
        .to('.dd-sparkle', { autoAlpha: 0, duration: .3 }, at + .9);
    }
    function enter(seg, at) {
      tl.set(seg, { x: W, autoAlpha: 1 }, at).to(seg, { x: 0, duration: 1, ease: 'power3.out' }, at);
    }
    function exit(seg, at) {
      tl.to(seg, { x: -W, duration: .85, ease: 'power2.in' }, at).set(seg, { autoAlpha: 0 }, at + .85);
    }

    // ---- 1. Steamer: the buns puff, the lid drops and rattles, lifts off, steam escapes, showcase.
    var buns = q('.dd-bun'), lid = q('.dd-lid'), steam1 = q('.dd-s1 .dd-steam'), leaks = q('.dd-leak');
    gsap.set('.dd-s1', { x: W });  // off stage before the first frame; the card is still sliding in
    caption(0, 0);
    enter('.dd-s1', 0);
    tl.set(buns, { scaleX: .8, scaleY: .3, y: 0, transformOrigin: '50% 100%' }, 0)
      .set(steam1, { autoAlpha: 0, strokeDashoffset: HID, y: 0 }, 0)
      .set(leaks, { autoAlpha: 0, strokeDashoffset: HID, y: 0 }, 0)
      .set(lid, { autoAlpha: 1, x: 0, y: -240, rotation: 0, transformOrigin: '50% 100%' }, 0)
      .to(buns, { scaleX: 1.06, scaleY: 1.12, duration: .9, ease: 'sine.inOut', stagger: .12 }, .9)
      .to(buns, { scaleX: 1, scaleY: 1, duration: .5, ease: 'back.out(3)', stagger: .12 }, 1.8)
      .to(lid, { y: 0, duration: .5, ease: 'bounce.out' }, 2.5)
      .to(lid, { y: -5, rotation: 1.2, duration: .09, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 3.05)
      .to(leaks, { autoAlpha: .5, strokeDashoffset: 0, duration: .6, stagger: .15 }, 3.05)
      .to(leaks, { autoAlpha: 0, y: -10, duration: .4 }, 3.8)
      .to(lid, { x: 60, y: -90, rotation: 10, duration: .5 }, 4)
      .to(lid, { x: 200, y: -260, rotation: 24, duration: .5, ease: 'power2.in' }, 4.5)
      .fromTo(steam1, { autoAlpha: 0, strokeDashoffset: HID, y: 16 }, { autoAlpha: .6, strokeDashoffset: 0, y: -6, duration: .9, stagger: .12, ease: 'sine.out' }, 4.05)
      .to(steam1, { autoAlpha: 0, y: -30, duration: .8, stagger: .12, ease: 'sine.in' }, 5.1)
      .to(buns, { y: -8, duration: .22, yoyo: true, repeat: 1, stagger: .1, ease: 'sine.out' }, 4.6);
    sparkle(5, 330, 130);
    exit('.dd-s1', 6.4);

    // ---- 2. Pan: potstickers sizzle and brown, a lacy skirt forms, flipped crust-up onto a plate.
    var A = 6.9;
    var flames = q('.dd-flame'), gz = q('.dd-gz'), spat = q('.dd-spat'), steam2 = q('.dd-pansteam'), rings = q('.dd-lace:not(.dd-lace-top) ellipse'), laceTop = q('.dd-lace-top');
    caption(1, A + .2);
    enter('.dd-s2', A);
    tl.set('.dd-pan', { x: 0 }, A)
      .set('.dd-plate-in', { x: W }, A)
      .set('.dd-food', { '--dd-crisp': '#F1E6CB', '--dd-lace': '#E2B865' }, A)
      .set(foodIn, { y: 0, scaleX: 1, scaleY: 1, transformOrigin: '50% 50%' }, A)
      .set(laceTop, { autoAlpha: 0 }, A)
      .set(rings, { strokeDashoffset: HID }, A)
      .set(gz, { y: -80, autoAlpha: 0 }, A)
      .set(spat, { autoAlpha: 0 }, A)
      .set(steam2, { autoAlpha: 0, strokeDashoffset: HID, y: 0 }, A)
      .set(flames, { scale: 0, transformOrigin: '50% 100%' }, A)
      .to(flames, { scale: 1, duration: .4, stagger: .06, ease: 'back.out(2)' }, A + .7)
      .to(flames, { scaleX: 1.08, scaleY: .82, duration: .16, yoyo: true, repeat: 21, ease: 'sine.inOut', stagger: .05 }, A + 1.1)
      .to(gz, { y: 0, autoAlpha: 1, duration: .45, ease: 'bounce.out', stagger: .12 }, A + 1)
      .fromTo(spat, { autoAlpha: 1, y: 0, scale: .4, transformOrigin: '50% 50%' }, { autoAlpha: 0, y: -16, scale: 1, duration: .45, ease: 'power1.out', stagger: { each: .11, repeat: 3 } }, A + 1.6)
      .to('.dd-gyozas', { x: 1.2, duration: .06, yoyo: true, repeat: 23, ease: 'none' }, A + 1.6)
      .to('.dd-food', { '--dd-crisp': '#C98A3A', duration: 2, ease: 'none' }, A + 1.7)
      .fromTo(steam2, { autoAlpha: 0, strokeDashoffset: HID, y: 14 }, { autoAlpha: .55, strokeDashoffset: 0, y: -4, duration: .8, stagger: .1, ease: 'sine.out' }, A + 2.5)
      .to(steam2, { autoAlpha: 0, y: -28, duration: .7, stagger: .1, ease: 'sine.in' }, A + 3.4)
      .to(rings, { strokeDashoffset: 0, duration: .5, ease: 'power1.inOut', stagger: { each: .018, from: 'random' } }, A + 2.8)
      .to('.dd-food', { '--dd-lace': '#B8822F', duration: 1.2, ease: 'none' }, A + 4)
      .to(flames, { scale: 0, duration: .3, stagger: .05, ease: 'power2.in' }, A + 5)
      .to(foodIn, { y: -70, duration: .45 }, A + 5.3)
      .to(foodIn, { scaleY: 0, duration: .18, ease: 'power1.in' }, A + 5.4)
      .set(laceTop, { autoAlpha: 1 }, A + 5.58)  // flipped: the lacy crust is now on top
      .set('.dd-food', { '--dd-crisp': '#B4742C' }, A + 5.58)
      .to(foodIn, { scaleY: 1, duration: .22, ease: 'power1.out' }, A + 5.58)
      .to('.dd-pan', { x: -W, duration: .6, ease: 'power2.in' }, A + 5.35)
      .to('.dd-plate-in', { x: 0, duration: .6, ease: 'power3.out' }, A + 5.5)
      .to(foodIn, { y: 0, duration: .45, ease: 'bounce.out' }, A + 5.85)
      .to(foodIn, { scaleX: 1.04, scaleY: .94, duration: .15, yoyo: true, repeat: 1 }, A + 6.3);
    sparkle(A + 6.4, 336, 148);
    exit('.dd-s2', A + 7.4);

    // ---- 3. Folding board: filling drops on a wrapper, it folds into a leaf and pleats herringbone-style.
    var B = A + 7.9;
    var hero = q('.dd-hero'), pleats = q('.dd-pleat'), sides = q('.dd-side');
    caption(2, B + .2);
    enter('.dd-s3', B);
    tl.set('.dd-wrapper', { autoAlpha: 1, scaleY: 1, transformOrigin: '50% 50%' }, B)
      .set('.dd-filling', { autoAlpha: 0, y: -90, scaleY: 1, transformOrigin: '50% 50%' }, B)
      .set(hero, { autoAlpha: 0, scaleX: 1, scaleY: .4, transformOrigin: '50% 50%' }, B)
      .set(q('.dd-spine'), { strokeDashoffset: HID }, B)
      .set(pleats, { strokeDashoffset: HID }, B)
      .set(sides, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, B)
      .to('.dd-filling', { autoAlpha: 1, y: 0, duration: .5, ease: 'bounce.out' }, B + 1)
      .to(['.dd-wrapper', '.dd-filling'], { scaleY: .35, autoAlpha: 0, duration: .35, ease: 'power2.in' }, B + 1.7)
      .to(hero, { autoAlpha: 1, duration: .15 }, B + 1.85)
      .to(hero, { scaleY: 1, duration: .55, ease: 'back.out(2.2)' }, B + 1.85)
      .to(q('.dd-spine'), { strokeDashoffset: 0, duration: .5, ease: 'power1.inOut' }, B + 2.3)
      .to(pleats, { strokeDashoffset: 0, duration: .18, stagger: .13, ease: 'power1.out' }, B + 2.6)
      .to(hero, { scaleX: .97, duration: .065, yoyo: true, repeat: 27, ease: 'sine.inOut' }, B + 2.6)
      .to(hero, { scale: .7, duration: .5, ease: 'power3.inOut' }, B + 4.7)
      .to(sides, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2)', stagger: .1 }, B + 4.9);
    sparkle(B + 5.3, 300, 170);
    exit('.dd-s3', B + 6.4);

    // ---- 4. Money bags: three purses drop onto slate and get tied with chive.
    var C = B + 6.9;
    var bags = q('.dd-bagi'), ties = q('.dd-ties path');
    caption(3, C + .2);
    enter('.dd-s4', C);
    tl.set(bags, { y: -230, autoAlpha: 1, scaleX: 1, scaleY: 1, rotation: 0, transformOrigin: '50% 100%' }, C)
      .set(ties, { strokeDashoffset: HID }, C)
      .to(bags, { y: 0, duration: .5, ease: 'power2.in', stagger: .16 }, C + .8)
      .to(bags, { scaleX: 1.12, scaleY: .8, duration: .1, yoyo: true, repeat: 1, ease: 'sine.out', stagger: .16 }, C + 1.3)
      .to(ties, { strokeDashoffset: 0, duration: .35, ease: 'power1.out', stagger: function (i) { return Math.floor(i / 2) * .25; } }, C + 1.9)
      .to(bags, { rotation: -4, duration: .15, yoyo: true, repeat: 3, ease: 'sine.inOut', stagger: .1 }, C + 2.9);
    sparkle(C + 3, 326, 160);
    exit('.dd-s4', C + 4.6);

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
