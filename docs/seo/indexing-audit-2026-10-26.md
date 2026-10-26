# Indexing audit: eatumbo.com (2026-10-26, SUMMIT-340)

Search Console's first crawl report after verification (2026-10-23) flagged, by email
only (no URLs): Not found (404), Page with redirect, Alternate page with proper
canonical tag, Excluded by 'noindex' tag.

There are no Search Console API credentials yet (SUMMIT-278 is open), so the URL list
below was rebuilt from the live site, the archived Squarespace site and the
2026-10-23 audit (`docs/seo-aeo-audit-2026-10-23/`) instead of a GSC export. The
domain property also holds Squarespace-era history, which is where most of these come
from.

## Method

1. Fetched `/robots.txt` and `/sitemap.xml` from production; checked every sitemap URL
   and every internal link (status without following redirects, final URL, canonical,
   robots meta, `X-Robots-Tag`, meta refresh).
2. Pulled the Wayback Machine URL index for eatumbo.com and the archived Squarespace
   `sitemap.xml` (2025-08-05), and probed every old URL against production.
3. Probed host, extension and trailing-slash variants.

## Live state

| Check | Result |
|---|---|
| robots.txt | Allows everything, points at `/sitemap.xml`. |
| Host variants | `http://`, `www`, `http://www` all 301 to `https://eatumbo.com/`. |
| Sitemap | 5 URLs (`/`, `menu.html`, `visit.html`, `about.html`, `events.html`). All 200, self-canonical, indexable. |
| Internal links | Every internal link resolves to a sitemap URL (home is linked as `./`). |
| Env-based noindex | None. Static HTML; the only noindex is `404.html`. |

## URL table

| URL | Issue | Action |
|---|---|---|
| `/home` | 404. The Squarespace homepage, and the only URL in the Squarespace sitemap | **Redirected**: new `home.html` stub (meta refresh + canonical to `/`), same pattern as `team-1.html` |
| `/team-1` (apex and www) | Page with redirect | **Intentional**: stub to `about.html`, shipped 2026-10-23 |
| `/menu`, `/about`, `/visit`, `/events` | Alternate page with proper canonical | **Intentional**: GitHub Pages serves `menu.html` at `/menu`; the canonical points at the `.html` URL, which Google already selected (audit M10) |
| `/index.html` | Alternate page with proper canonical | **Intentional**: canonical is `/` |
| `http://`, `www` variants | Page with redirect | **Intentional** |
| `/events/p/aurora-shucking`, `/events/p/aurorawinedinner`, `/events/p/table22` | 404 | **Intentionally left 404**: expired Squarespace ticket pages (audit M8) |
| `/events/p/umbo-gift-card` | 404 | **Needs a decision**: the Instagram "Gift Cards" link. No gift-card page exists to send it to (audit C3) |
| `/cart`, `/search`, `/account/`, `/config` | 404 now; Squarespace served cart, search and account with noindex | **Intentionally left 404**: Squarespace system pages. Most likely the source of the noindex reason |
| `/404.html` | noindex | **Intentional**: the error page, not in the sitemap |

## For Ryan after deploy

Resubmit `sitemap.xml`, then "Validate fix" on each reason. The alternate-canonical and
redirect reasons will keep listing the URLs above; that is the expected steady state.
