# Design Spec: eatumbo.com

## Meta
- **URL:** https://www.eatumbo.com/
- **Extracted:** 2026-07-04
- **Viewports captured:** desktop 1440px (computed styles). Mobile 390px and screenshots NOT captured — see note below.
- **Site type:** Restaurant (pre-/early-open, catering-phase single page)
- **One-line character:** Barebones Squarespace template — cream + oxblood, Libre Baskerville headings, almost no brand identity yet.

> **Capture caveat:** The live site never reaches network idle (Squarespace + booking/analytics polling), so Claude-in-Chrome screenshots and device-emulation resize both failed in this session. All values below are read from **computed styles via JS (measured)**. Visual layout, imagery composition, animations, and true mobile behavior could **not** be visually verified. Marked accordingly.

## Color Palette
| Role | Value | Notes |
|---|---|---|
| Background (primary) | #EFECDC | Warm cream, rgb(239,236,220) — the dominant page bg (measured) |
| Text (primary) | #471515 | Deep oxblood/maroon, rgb(71,21,21) — headings + body + links (measured) |
| Text (on dark sections) | #FFFFFF | Paragraph text measured white in at least one dark section (measured) |
| Accent / brand | — | No distinct accent token found; oxblood does double duty (inferred) |
| Section backgrounds | transparent | Sections inherit page bg; no per-section color blocking (measured) |
- **Palette character:** Two-color scheme — warm cream field with oxblood type. Cozy and vintage-leaning, but flat and under-developed. No secondary/accent color, no gold or blush that the brand's pinup/seashell world would suggest.

## Typography
- **Display / headings:** "Libre Baskerville", weight 700 — used for h1/h2/h3 (measured). High-contrast transitional serif; elegant but a default Squarespace pairing.
- **Body:** figtree (loaded as `figtree-i1857o`), weight 300 — light sans, small (measured). "Bitter" 400 also loaded (secondary serif, measured).
- **Scale (desktop, measured):** h2 ≈ 46.7px / h3 ≈ 36.4px, both weight 700, no uppercase transform · body paragraph ≈ 13.9px, line-height ≈ 20.9px. No `<h1>` present on the homepage (structural gap).
- **Character:** Headings normal case, normal letter-spacing — no editorial styling. Body text is notably small (~14px) and thin (300) — low readability. Heading-to-body jump is large and abrupt (46px → 14px) with no mid-scale.

## Layout & Grid
- **Container:** Squarespace default index; single long page, scrollHeight ≈ 6,582px (measured). Max-width not independently verified (screenshots blocked).
- **Grid:** Squarespace fluid-engine / stacked blocks (inferred from platform).
- **Section rhythm:** Multiple stacked sections (team bios, mailing-list, contact), transparent backgrounds — visual rhythm not verified.
- **Header/nav:** `<nav>` renders `inline-flex` at desktop; links: Home, Our Team (measured). Sparse IA — no Menu, Reservations, About, or Events as first-class nav.
- **Footer:** Minimal — "GET IN TOUCH! sarah@eatumbo.com" (measured).
- **Whitespace & alignment:** Not visually verified.

## Components
- **Buttons:** Only a transparent menu toggle was detectable as a styled button (bg transparent, 0px radius, minimal padding — measured). Primary CTA is a plain text link "View our Catering Menu!" — no real button system.
- **Cards:** Team bios (Chef Cameron Rolka, GM Sarah Welch, "Quality Control" Angus the dog) — layout not visually verified.
- **Forms/inputs:** A "Join our mailing list" block exists (heading measured); field styling not verified.
- **Imagery treatment:** 8 images total. **Alt text is broken/auto-generated and wrong** — e.g. a Navy SEAL trident emblem and a labeled human-anatomy diagram are among the alts, clearly not the real photo subjects. Real subjects per other alts: chef in apron, GM in pink apron against brick + pampas grass, dog in a vineyard. No logo/seashell/pinup imagery detected on the site.
- **Iconography:** None distinctive.

## Animations & Interactions
| Element | Trigger | Behavior | Timing/Easing | Measured or Estimated |
|---|---|---|---|---|
| — | — | Could not trigger or observe animations (screenshots/idle blocked) | — | not verified |
- Squarespace templates typically apply fade/slide-in on scroll, but this could not be confirmed in-session.

## Responsive Behavior
- **Mobile (390px):** NOT verified. `resize_window` did not reduce the page's layout viewport (innerWidth stayed 1728 — macOS window min-width), and screenshots were blocked. Squarespace default: nav collapses to a hamburger below ~768px — assumed, not confirmed. Heading sizes appeared fixed (no fluid scaling) at the widths tested.
- **Tablet (768px):** Not verified.
- **Animation changes on mobile:** Not verified.

## Characteristic Elements
1. **Cream (#EFECDC) + oxblood (#471515) two-tone** — the only real brand signal present on the site.
2. **Libre Baskerville 700 headings** — elegant serif, but a stock Squarespace default, not a bespoke identity.
3. **Catering/pop-up framing** — "Let us bring a taste of Umbo to you!" and "View our Catering Menu!" — the site sells catering, not a dining-room experience.
4. **Team-as-personality** — chef, GM, and the dog ("Quality Control") get equal billing; warmth-forward but informal.
5. **Identity gap** — none of the brand's real assets (logo, seashells, vintage pinup art) appear on the current site; that world lives only on Instagram.
6. **Under-built system** — no `<h1>`, tiny 14px body type, no button system, broken alt text, 2-item nav. High headroom to elevate.

## Review & Changelog
- **Standards review:** not run (offered below).
- **Patches applied:** none.
