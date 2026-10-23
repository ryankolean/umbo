# Umbo SEO + AEO audit

Site: https://eatumbo.com (GitHub Pages, static HTML, five pages). Audit date: 2026-10-23. Repo at `8824e6a`.
Business type: local restaurant, single location (oyster bar, 430 E. Front Street, Traverse City, MI).
Action plan: [ACTION-PLAN.md](ACTION-PLAN.md).

## Executive summary

**SEO health score: 69 / 100**

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 65 |
| Content quality | 23% | 68 |
| On-page SEO | 20% | 70 |
| Schema / structured data | 10% | 72 |
| Performance (CWV, lab) | 10% | 75 |
| AI search readiness | 10% | 68 |
| Images | 5% | 65 |

Local presence is not in the weighted score but is the strongest thing Umbo has: the Google Business Profile shows 4.8 from 107 reviews with correct hours, Umbo is #1 organic and #1 in the local pack for "oyster bar Traverse City", "best oysters Traverse City" and "tinned fish Traverse City", and the press footprint includes Eater's "Where to Eat Around the World in 2026".

The on-site build is clean: correct canonicals, AI crawlers explicitly allowed, `llms.txt`, a real FAQ, identical NAP and hours across every page and every machine-readable file. The gaps are **migration leftovers and listings**: dead Squarespace URLs that still rank, no Search Console or Bing (SUMMIT-151, no verification TXT in DNS), unclaimed Yelp and Apple listings, no Tripadvisor, and third-party pages that still say "coming soon", lunch hours, or reservations by phone.

Top issues:

1. **`/team-1` (old team page) is the #1 Google result for "Sarah Welch Umbo" and a brand sitelink, and returns 404.**
2. **Instagram bio "Gift Cards" link goes to a 404** (`/events/p/umbo-gift-card`) heading into the holidays.
3. **No Search Console or Bing Webmaster Tools**, so no index data, no recrawl requests, and no view of which canonical Google picked (it has indexed the extensionless URLs, not the `.html` canonicals).
4. **Off-site facts are stale or split**: Traverse City Tourism says "Coming soon"; MyNorth says 28 seats and phone-only; The Ticker says lunch 11-3; Yelp and Apple Maps unclaimed; no Tripadvisor; Umbo invisible in the non-Google index for generic queries.
5. **The menu of an oyster bar lists no oysters**, and the home page has no quotable summary (158 words).

Quick wins:

1. Add a `team-1.html` redirect stub to `about.html` (10 minutes, fixes the #1 issue).
2. Fix `acceptsReservations: "True"` to boolean `true` and add `alternateName: "Umbo Traverse City"` (home JSON-LD).
3. Update the five stale `lastmod` dates in `sitemap.xml`.
4. Add `width`/`height` to every `<img>` and `loading="lazy"` to `room.jpg`.
5. Merge PR #21 (per-page OG images, mergeable).

## Technical SEO

| Check | Result |
|---|---|
| HTTPS, apex canonical | Pass. `http://` and `www` both 301 to `https://eatumbo.com/`. |
| Status codes | All five pages 200, ~0.1-0.25 s. Unknown paths return GitHub's default 404 (unbranded, no nav). |
| Old Squarespace URLs | From the Wayback Machine, Google and the Instagram bio: `/events` resolves (200, extensionless match to `events.html`). **`/team-1` still ranks** ("Services 1 - Umbo Traverse City", #1 for "Sarah Welch Umbo", brand sitelink "Our Founding Team") and returns 404. `/events/p/umbo-gift-card` (Instagram bio "Gift Cards" link) returns 404. `/events/p/aurora-shucking`, `/aurorawinedinner`, `/table22` (January 2026 ticket pages), `/cart`, `/search` return 404, which is fine for expired pages. |
| `robots.txt` | Pass. `Allow: /` for all, explicit allows for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Bingbot, Amazonbot, CCBot. Sitemap declared. |
| `sitemap.xml` | Valid, five canonical URLs. All `lastmod` = 2026-07-07; menu changed 2026-09-30 (#22), events 2026-09-14 (#12). `changefreq`/`priority` are ignored by Google, harmless. |
| Canonicals | Declared correctly: each page self-canonicals to its `.html` URL, home to `/`. But `site:eatumbo.com` shows Google indexed `/menu`, `/about`, `/visit`, `/events` **extensionless**, so Google appears to be overriding the declared canonical. Both forms return 200. Confirm in Search Console before changing anything. |
| Internal links | Every page links home as `index.html`, a non-canonical duplicate of `/`. Minor equity split, and `llms.txt` repeats it. |
| Meta robots | `index,follow,max-image-preview:large,max-snippet:-1` on all pages. Good for AI snippet length. |
| Search Console / Bing | **Not verified.** No `google-site-verification` or `msvalidate` TXT in DNS (checked 1.1.1.1 and 8.8.8.8), no meta tag, no HTML file. Blocked on Ryan's sign-in per SUMMIT-151. |
| Security headers | GitHub Pages sends no HSTS, CSP or X-Content-Type-Options and they cannot be configured there. Not a ranking factor; note only. |
| Cache | `max-age=600` on all assets (GitHub Pages fixed). Lighthouse flags it; unfixable without a CDN in front. |
| Mobile | Viewport set, Lighthouse SEO 100 and Best Practices 100 on home and menu. |

## Content quality and E-E-A-T

| Page | Visible words | Notes |
|---|---|---|
| Home | 158 | Thin. Eyebrow "Oyster Bar & Restaurant", one sentence lede, one paragraph on the room. No passage that answers "what is Umbo" in full sentences. |
| Menu | ~1,090 | Rich: named producers, origins, prices for tinned fish and caviar, prix-fixe, wine, beer, N/A. **No raw oyster section**, only "ask your server about today's oysters", despite "Oysters and tinned fish are always on" in the intro. |
| About | ~470 | Strongest E-E-A-T on the site: Sarah Welch (Marrow founding partner, 4x James Beard Best Chef Great Lakes nominee, 2023 finalist, Top Chef Houston finalist) and Cameron Rolka (Martin Berasategui, opened Mink 2019). None of the claims link to a source. |
| Events | ~1,130 | Full catering menu with per-person prices. Good long-tail coverage ("oyster catering Traverse City", "raw bar catering"). |
| Visit | ~450 | Hours, address, reservation policy, six-question FAQ with matching JSON-LD. |

Other gaps: no food or oyster photography anywhere; no press or "as seen in" section; no freshness signal beyond menu changes.

## On-page SEO

| Page | Title (chars) | Meta description (chars) | H1 as read by crawlers |
|---|---|---|---|
| Home | Umbo, An Oyster Bar in Traverse City (37) | 171, over ~155 | "a taste of" + wordmark alt "Umbo" |
| Menu | Menu, Umbo Traverse City (25) | **203**, truncated | "the Menu" |
| About | About, Umbo Traverse City (26) | 156 | "a little room" + "Umbo" |
| Events | Events & Catering, Umbo Traverse City (38) | 146 | "let us bring a taste of" + "Umbo" |
| Visit | Visit, Umbo Traverse City (26) | 174, over | "plan a Visit" |

(Titles use an em dash separator on the live site; shown here with a comma.)

- H1s are brand voice fragments with no topical keyword. That is a fair design trade-off, but it puts all the keyword weight on titles, which are short and only the home title says "oyster bar".
- Heading order: footer `h4` follows `h2`; menu and visit jump from `h1` to `h3`. Lighthouse flags it (accessibility, not ranking).
- OG/Twitter tags complete on every page; every page shares one `og.jpg` until PR #21 merges.

## Schema and structured data

All JSON-LD parses. Present:

- Home: `Restaurant` (`@id #restaurant`, address, geo, phone, email, hours Thu-Mon 16:30-21:30, priceRange, servesCuisine, founders, `sameAs` Instagram) + `WebSite`.
- Menu: `BreadcrumbList` + `Menu` with seven `MenuSection` names and no items.
- About: `BreadcrumbList` + `AboutPage` + partial `Restaurant` (founders).
- Events: `BreadcrumbList` + `Service` (catering, provider = restaurant).
- Visit: `BreadcrumbList` + `FAQPage` (six Q&A, matches visible copy word for word).

Issues:

1. `acceptsReservations: "True"` is a string. Schema.org and Google expect boolean `true`, a URL, or the legacy strings "Yes"/"No".
2. `Person` nodes are bare: Sarah Welch has no `jobTitle`, neither has `sameAs`. Linking James Beard, Bravo and Marrow profiles is the cheapest entity-disambiguation win for AI answers about "who runs Umbo".
3. `Restaurant.sameAs` lists only Instagram. Add GBP, Yelp, Tripadvisor once those listings are correct.
4. `Menu` has no `MenuItem`/`offers`, so "how much is caviar at Umbo" cannot be answered from structured data. The visible HTML has the prices.
5. `visit.html`, the natural landing page for hours and directions, carries no `Restaurant` or hours markup.
6. `Restaurant.image` has one 1.91:1 card and one 3:2 photo. Google recommends 16:9, 4:3 and 1:1 variants.
7. FAQ rich results: Google has limited FAQ rich results to government and health sites since August 2023, so `FAQPage` will not produce SERP accordions. Keep it anyway: Bing, ChatGPT and Perplexity still parse it, and it mirrors the visible copy.
8. No `AggregateRating`: correct, self-serving review markup is ineligible.

## Performance

Lighthouse 12.2.1, local runs (PageSpeed Insights API was out of quota). Lab data only; the site almost certainly has no CrUX field data at its traffic level.

| Page | Device | Perf | FCP | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|
| Home | Mobile (3 runs) | 67 / 87 / 71 | 1.7-3.7 s | **3.9-5.9 s** | 0-80 ms | 0 | 692 KiB |
| Menu | Mobile | 98 | 1.8 s | 2.2 s | 0 ms | 0.009 | 340 KiB |
| Home | Desktop | 99 | 0.6 s | 0.9 s | 0 ms | 0.002 | 692 KiB |

Causes on home mobile:

- Four-hop render chain: HTML, then `style.css`, then the Google Fonts CSS from its `@import`, then three woff2 files. The `preconnect` hints help but cannot remove the hops.
- `room.jpg` is 1600x1067, 368 KB JPEG, rendered at about 443x296; not lazy-loaded. Lighthouse estimates ~400 KiB savings from sizing plus ~213 KiB from WebP/AVIF across images.
- No `width`/`height` on most `<img>` tags. Measured CLS is 0-0.009, so this is preventive, not a current failure.

## Images

- Alt text: good. Content images have descriptive alt, decorative shells and parade art use `alt=""`.
- Sizing and format: see Performance. Shell watermark PNGs (48 KB each) are served at ~2x their render size.
- Coverage: one room photo and three portraits. No dish, oyster or raw bar photos, which is what image search, GBP and AI answers surface for a restaurant.
- Unused files in the repo (`pattern-sage.png` 1.6 MB and others) are not referenced by any page, so they do not affect speed.

## AI search readiness (AEO / GEO)

On-site, strong:

- Every major AI crawler explicitly allowed in `robots.txt`.
- `llms.txt` at the root with key facts, policies, page index. Facts match the site.
- FAQ answers are direct, self-contained, and repeated in JSON-LD.
- Hours, address, phone and reservation policy are identical across the five footers, visit page, FAQ, home JSON-LD and `llms.txt`.
- `max-snippet:-1` lets engines quote freely.

On-site, weak:

- Home has no quotable summary passage (H4).
- No oyster facts (H5): the core query for an oyster bar has no on-site answer.
- Credentials are claims without links; engines weight corroborated facts.
- `llms.txt` links home as `/index.html`.

Off-site, Google strong, everything else weak: see the next section.

## Off-site: local listings, citations, press, search

Researched 2026-10-23 in a logged-out, rendered Google session (hl=en, gl=us). The GBP panel and the "Sarah Welch Umbo" ranking were re-checked independently.

### Listings and NAP

| Source | Status | Notes |
|---|---|---|
| Google Business Profile ([CID](https://maps.google.com/?cid=5607100604850190325)) | Exists | "Umbo Traverse City", Seafood restaurant, 430 E Front St, (231) 944-2797, eatumbo.com, Thu-Mon 4:30-9:30 PM. **4.8 from 107 reviews**, 142 photos. Price "$100+" is user-reported (64 people). Panel shows "Own this business?" yet has an owner-written description: control unclear. Top review topics: oysters (32), wines (16), tinned fish (15). Pin is ~60 m east of the site's schema geo. |
| [Yelp](https://www.yelp.com/biz/umbo-traverse-city-traverse-city) | **Unclaimed** | NAP, site and hours correct. 4.6 from 5 reviews. Ranked #1 on Yelp's "Top 10 Best Oyster Bars" in TC. |
| [Apple Maps](https://maps.apple.com/place?place-id=I8442B6AFCD965E59) | **Unclaimed** | NAP and hours correct; ratings come from Yelp's 5 reviews. |
| [Traverse City Tourism](https://www.traversecity.com/food-wine/listing/umbo/6651/) | **Stale** | "A new fine dining restaurant... Coming soon." No hours, not categorized as seafood or oysters. Talent pages for [Sarah Welch](https://www.traversecity.com/food-wine/talent/sarah-welch/) and [Cameron Rolka](https://www.traversecity.com/food-wine/talent/cameron-rolka/) still say "set to open in 2026". |
| Tripadvisor | **Missing** | Its "Best Oysters in Traverse City" list ranks on page 1 and omits Umbo. |
| Facebook | **Missing** | No business page. Third-party posts (TC Tourism, MyNorth) describe "house-made pasta, craft cocktails", which is not on the menu; a Meta AI answer calls Umbo "a new higher-end catering option". |
| Downtown TC directory | **Missing** | Not in [downtowntc.com dining](https://www.downtowntc.com/explore/dining.html). |
| Instagram bio | Mostly OK | NAP and hours correct. "Join our mailing list for open!" label is stale; **Gift Cards link 404s**. |
| Resy / Tock / OpenTable / Michelin | Not listed | Expected (text-only reservations). |

### Search visibility (Google)

| Query | Umbo position | Notes |
|---|---|---|
| Umbo Traverse City | #1 with sitelinks | One sitelink is the dead `/team-1` ("Our Founding Team"). No AI Overview shown. |
| oyster bar Traverse City | #1 organic, #1 Maps | Tripadvisor list (without Umbo) also on page 1. |
| best oysters Traverse City | #1 organic, #1 local pack | Boathouse #2 with 1.3K reviews. Tripadvisor and Yelp "raw oysters" lists omit Umbo. |
| tinned fish Traverse City | #1 with sitelinks | |
| Sarah Welch Umbo | **#1 is `/team-1` (404)** | `/about` is 7th. People Also Ask includes "Who is the disgraced top chef winner?" (entity-confusion risk). |

Outside Google: in the non-Google web index used for this research, generic queries ("Umbo Traverse City", "oyster bar Traverse City", "best oysters") returned **no Umbo results**; only an exact-quoted query found it. Bing itself could not be checked. Treat as a signal that Bing-fed and non-Google engines know little about Umbo yet. Name collisions: Umbo seafood in High Point, NC (umboseafood.com) and an Umbo in Salt Lake City.

### Press (earned, strongest AEO asset, none linked from the site)

- Eater, "Where to Eat Around the World in 2026" (2026-01-28): Traverse City pick naming Welch and Rolka, links eatumbo.com.
- Hour Detroit: Sarah Welch interview (2025-07-29) and "A Field Guide to Traverse City Fine Dining" (2026-08-14).
- Eater Detroit, Northern Michigan food and wine (2025-10-06).
- Northern Express: Little Fleet pop-up (2025-12-20) and "Traverse City's One and Only Raw Bar" (2026-06-27).
- The Adventurist, "Umbo Gives Traverse City a Serious Oyster Bar" (2026-07-20), links eatumbo.com.
- 9&10 News (2026-07-15), Record-Eagle "Meet the Chef: Cameron Rolka" (2026-07-24), MyNorth "The Oyster Bar We've All Been Waiting For" (2026-09-17), MLive (Andrew Zimmern, 2026-08-24; Food & Wine festival lineup), James Beard Foundation story (2025-09).

Facts in that coverage that now conflict with the site, and that AI answers will repeat:

| Claim | Source | Site says |
|---|---|---|
| Lunch Friday-Monday 11-3 | The Ticker, 2026-05-14 | Dinner Thu-Mon 4:30-9:30 |
| 28 seats; reservations "phone calls only" | MyNorth, 2026-09-17 | 25 seats; reservations by text |
| Half of seats held for walk-ins | The Ticker | At least a third |
| "Two-time" JBF nominee (2020, 2023) | Hour Detroit | Four nominations, 2023 finalist |
| Welch as GM / Managing Partner | Record-Eagle captions, TC Tourism | Chef & Partner |

### Entity anchors for schema

- No Wikipedia or Wikidata entries for Umbo, Sarah Welch, Cameron Rolka, Marrow or Mink. Welch is named (unlinked) as Top Chef: Houston runner-up on Wikipedia.
- `Person.sameAs` candidates (HTTP 200 checked by the research pass): Sarah Welch: bravotv.com/people/sarah-welch, instagram.com/chefwelch, LinkedIn, traversecity.com talent page. Cameron Rolka: instagram.com/cameronrolka, traversecity.com talent page. Press articles go in `subjectOf`, not `sameAs`.
- `Restaurant.sameAs` candidates: GBP CID URL, Yelp, Apple Maps, traversecity.com listing, Instagram.

## Method

- Fetched all five pages, `robots.txt`, `sitemap.xml`, `llms.txt`, manifest with curl; parsed head, headings, images, links, JSON-LD with a script.
- Lighthouse 12.2.1 (mobile x3 and desktop on home, mobile on menu).
- DNS TXT lookup on 1.1.1.1 and 8.8.8.8 for verification tokens; SUMMIT-151 read for listing status.
- Off-site research by web search and fetch (see section above); items marked UNVERIFIED could not be confirmed.
- Not covered: Search Console and GA data (not connected), backlink metrics (no Moz/Ahrefs access), CrUX field data (none expected).
