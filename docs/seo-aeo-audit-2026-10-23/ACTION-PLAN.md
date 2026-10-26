# Umbo SEO + AEO action plan

Audit date: 2026-10-23. Full findings: [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md).

## Status at end of 2026-10-23

- **Shipped:**
  - **PR #25:** C1, H6, H8 (except press `subjectOf`), M5, M6, M8, M9.
  - **Zone commit `a33d0e4`:** C2.
  - **PR #21:** M7.
  - **Backlog PR:**
    - M1: fonts moved to a `<link>`, image dimensions, a WebP `srcset` for the room photo, small footer images. Local mobile Lighthouse went from 78-86 to 98, LCP from 4.1-4.8 s to 2.2-2.3 s.
    - M2: press section, `subjectOf` and the `llms.txt` Press list.
    - M4: `scripts/menu-jsonld.py`.
    - M11, L3, L4.
    - L6 in `ROADMAP.md`.
    - L8: eight unused images removed.
- **Resolved, no change needed:** M10.
- **Skipped:**
  - L2: the "GBP pin" was a Maps viewport center, not a verified point. `hasMap` now points at the Google place instead.
  - L7: no public Wikidata edits without a sign-off.
- **Done 2026-10-24:** H3 Bing. Verified by a DNS CNAME and the sitemap submitted.
- **Done 2026-10-26, from Sarah's answers:**
  - H7: the oyster menu, 14 oysters at $46 a dozen, from her 10-26 order card.
  - M3: four James Beard nominations, and Managing Partner.
  - L1, partly: two photos.
  - H5: the Traverse City Tourism and MyNorth corrections were sent with her okay.
- **Still waiting on Umbo:**
  - C3: online gift cards, which depends on her POS.
  - H1: the GBP manager invite.
  - H2/H4/M12: one call to set up Apple Maps, Tripadvisor and Facebook. Yelp is skipped at her request.
  - Online reservations via Resy in November: swap out every "reservations by text" mention on launch day.

Owner key: **Ryan** = needs a human sign-in or a business decision. **Code** = a repo change. **Umbo** = needs facts or access from Sarah or Cameron.

## Critical: fix now

| # | Action | Owner | Effort |
|---|---|---|---|
| C1 | Add `team-1.html`: a redirect stub (meta refresh + `rel=canonical` to `about.html`, `noindex`). The old Squarespace team page `/team-1` is the **#1 Google result for "Sarah Welch Umbo"** and shows as the "Our Founding Team" sitelink on the brand search, and it returns 404. | Code | 10 min |
| C2 | **Done 2026-10-23.** Domain property verified (owner ryan.kolean@gmail.com, TXT in `docs/eatumbo.com.zone`), `sitemap.xml` submitted, indexing requested for `https://www.eatumbo.com/team-1` (the indexed copy is the www form). Indexing requests for the five pages hit the account's daily quota; all five are already indexed and in the sitemap. | Ryan, then Code | 20 min |
| C3 | Fix the Instagram bio "Gift Cards" link. It points at the old Squarespace product `/events/p/umbo-gift-card`, which now 404s, going into the holiday gift-card season. Needs a gift-card provider decision (Square, Toast, or a "text us" page) before a link can go back. | Umbo + Ryan | decision |

## High: within a week

| # | Action | Owner | Effort |
|---|---|---|---|
| H1 | Google Business Profile exists (4.8 from 107 reviews, hours correct) but control is unclear: the panel shows "Own this business?" yet carries an owner-written description. Confirm who holds access, then add secondary category Oyster bar restaurant, the menu URL, reservation wording ("text 231-944-2797"), and a few dish photos. | Umbo + Ryan | 30 min |
| H2 | Claim the existing unclaimed listings: **Yelp** (5 reviews, also feeds Apple Maps ratings) and **Apple Business Connect** (Apple Maps, Siri). | Ryan | 1 h |
| H3 | Bing Webmaster Tools (import from Search Console) + Bing Places. Umbo did not surface in the non-Google index for any generic query tested; Bing feeds ChatGPT search and Copilot. | Ryan | 20 min |
| H4 | Create a **Tripadvisor** listing. None exists, and Tripadvisor's "Best Oysters in Traverse City" list ranks on page 1 for "oyster bar Traverse City" without Umbo. | Ryan | 30 min |
| H5 | Correct stale third-party facts AI engines cite. Ask Traverse City Tourism to replace "Coming soon" with real hours and category, and update both talent pages ("set to open in 2026"). Ask MyNorth to fix 28 seats to 25 and "phone calls only" to text, and to link eatumbo.com. | Ryan + Umbo | emails |
| H6 | Visible "what is Umbo" paragraph on the home page (60-120 words: 25-seat oyster bar, 430 E. Front Street downtown, Sarah Welch and Cameron Rolka of Marrow and Mink, raw oysters, tinned fish, caviar, all-Michigan natural wine, dinner Thursday-Monday 4:30-9:30, reservations by text). Home is 158 visible words today. | Code | 30 min |
| H7 | Add an Oysters section to the menu. The site calls Umbo an oyster bar, oysters are the top Google review topic (32 mentions), and the menu lists no raw oysters. Even "rotating East and West Coast growers, priced each, ask for today's list" plus a typical price answers the main query. | Umbo, then Code | 30 min |
| H8 | Schema: `acceptsReservations` to boolean `true`; `alternateName: "Umbo Traverse City"` (GBP, Yelp and Apple all use that name, and other Umbo restaurants exist in NC and UT); `Restaurant.sameAs` add GBP CID, Yelp, Apple Maps, traversecity.com; Sarah Welch `jobTitle`; `Person.sameAs` for Bravo, Instagram, LinkedIn and traversecity.com talent pages; press as `subjectOf`. URLs are in the report. | Code | 45 min |

## Medium: within a month

| # | Action | Owner | Effort |
|---|---|---|---|
| M1 | Performance: move Google Fonts from the CSS `@import` to a `<link>` in each page head (or self-host and preload Fraunces), add `width`/`height` to every `<img>`, ship `room.jpg` as WebP/AVIF with `srcset` and `loading="lazy"` (1600w, 368 KB, rendered at ~440px). Mobile lab LCP is 3.9-5.9 s. | Code | 1-2 h |
| M2 | Press page or "As seen in" block linking Eater (Where to Eat Around the World in 2026), Hour Detroit, MyNorth, Northern Express, The Adventurist, 9&10 News, Record-Eagle. Strong earned coverage, none of it linked from the site today. | Code | 1 h |
| M3 | Settle Sarah Welch's credentials before linking them. The About page says four James Beard Best Chef: Great Lakes nominations with a 2023 finalist; Hour Detroit says two-time nominee (2020, 2023). Titles also vary (Chef & Partner, Managing Partner, Founding Partner, GM). Pick one wording, link the JBF source. | Umbo | 15 min |
| M4 | Expand `Menu` JSON-LD with `MenuItem` + `offers` for stable items (caviar, prix-fixe, tinned fish), generated from the HTML by a script so it cannot drift. | Code | 2 h |
| M5 | Add the Restaurant node (hours, address, geo under the same `@id`) to `visit.html`. | Code | 20 min |
| M6 | `sitemap.xml` `lastmod`: all five say 2026-07-07; the menu changed 2026-09-30. | Code | 10 min |
| M7 | Merge PR #21 (per-page OG images, mergeable). | Ryan | 5 min |
| M8 | Custom `404.html` with nav and the visit block, for the expired ticket pages (`/events/p/aurora-shucking`, `/aurorawinedinner`, `/table22`) and anything else old. 404 is the right status for past events. | Code | 30 min |
| M9 | Link home as `./` (and `https://eatumbo.com/` in `llms.txt`) instead of `index.html`. | Code | 10 min |
| M10 | **Resolved, no change needed.** URL Inspection on `menu.html` shows Google-selected canonical = user-declared `https://eatumbo.com/menu.html`, discovered via the sitemap; the extensionless `site:` listings were display only. | - | - |
| M11 | Titles and descriptions: add "Oyster Bar" to inner-page titles (25-38 chars today), trim descriptions on menu (203), visit (174) and home (171) to about 155. | Code | 20 min |
| M12 | Facebook business page (none exists; Meta AI currently describes Umbo as "a new higher-end catering option") and a Downtown Traverse City Association directory listing (not listed). | Ryan + Umbo | 1 h |

## Low: backlog

| # | Action | Owner | Effort |
|---|---|---|---|
| L1 | Food and oyster photography on the site (today: one room photo, three portraits). | Umbo | shoot |
| L2 | Align schema `geo` with the GBP pin (44.763968, -85.6143087; the site's point is about 60 m west). | Code | 5 min |
| L3 | Heading order: footer `h4` after `h2`; menu and visit jump `h1` to `h3`. | Code | 15 min |
| L4 | `hasOfferCatalog` on the catering `Service` with the per-person packages. | Code | 30 min |
| L5 | `Event` schema when ticketed events return (the old site sold Aurora shucking and wine-dinner tickets). | Code | when needed |
| L6 | Seasonal hours checklist: five footers, visit page, FAQ copy + JSON-LD, home JSON-LD, `llms.txt`, GBP, Apple, Yelp, Instagram bio. | Ryan | 15 min |
| L7 | Wikidata item for Sarah Welch (Top Chef: Houston runner-up, already named on Wikipedia) to anchor the entity. | Ryan | 30 min |
| L8 | Remove unused images from the repo (`pattern-sage.png` 1.6 MB and others). No ranking effect. | Code | 5 min |
