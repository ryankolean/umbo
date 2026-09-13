# Umbo website — roadmap

Living list of planned work. Current base URL: `https://eatumbo.com/`
(GitHub Pages, apex custom domain). Last updated 2026-09-13.

---

## 1. Move to a custom domain - done 2026-09-13

The site now serves from the apex **`eatumbo.com`** instead of the GitHub Pages
project path (`/umbo/`). `robots.txt` and `llms.txt` are only authoritative at a
domain root, so this is what makes them count.

Timeline. The repository side landed 2026-09-07, but DNS did not move until
2026-09-13, so the site did not actually serve from the apex until then.

- 2026-09-07: `./scripts/set-base-url.sh https://eatumbo.com` rewrote every
  absolute reference (canonicals, Open Graph, Twitter cards, JSON-LD
  `url`/`@id`, `sitemap.xml`, `robots.txt`, `llms.txt`). The `CNAME` file was
  written, then deliberately held back in 7b7e47f so the rebuilt site stayed
  reachable at the github.io path while the registrar transfer ran.
- 2026-09-13 05:25 UTC: the Porkbun transfer completed. The Squarespace domain
  registration ended, Google tore down the DNS zone it hosted, and the registry
  still delegated to `ns-cloud-*.googledomains.com`. Those nameservers began
  answering REFUSED. The domain went dark: site and all three mailboxes, for
  roughly seven hours.
- 2026-09-13 12:xx UTC: zone corrected in Porkbun, nameservers delegated there,
  `CNAME` restored in 9d2303a, Pages custom domain set, Enforce HTTPS enabled.

The lesson worth keeping: a registrar transfer tears down the losing
registrar's hosted DNS zone. Build the destination zone and move the
nameservers at completion, not afterwards.
- GitHub repo → Settings → Pages → Custom domain: `eatumbo.com`.
- DNS: apex `A`/`AAAA` to the GitHub Pages IPs, `www` `CNAME` →
  `ryankolean.github.io` (GitHub 301s `www` → apex).
- Enforce HTTPS once the certificate provisions.

> Keep every absolute URL routed through `set-base-url.sh`. Don't hand-edit
> domains in individual files — re-run the script instead, so nothing drifts.

### DNS record set (apex on GitHub Pages, Google Workspace mail intact)

| Type  | Host  | Value                        | Note |
|-------|-------|------------------------------|------|
| A     | @     | 185.199.108.153              | GitHub Pages |
| A     | @     | 185.199.109.153              | GitHub Pages |
| A     | @     | 185.199.110.153              | GitHub Pages |
| A     | @     | 185.199.111.153              | GitHub Pages |
| AAAA  | @     | 2606:50c0:8000::153          | GitHub Pages |
| AAAA  | @     | 2606:50c0:8001::153          | GitHub Pages |
| AAAA  | @     | 2606:50c0:8002::153          | GitHub Pages |
| AAAA  | @     | 2606:50c0:8003::153          | GitHub Pages |
| CNAME | www   | ryankolean.github.io.        | GitHub 301s to apex |
| MX    | @     | `1 smtp.google.com.`         | **Google Workspace — must not be dropped** |
| TXT   | @     | `v=spf1 include:_spf.google.com ~all` | **mail auth — must not be dropped** |
| TXT   | google._domainkey | (DKIM, see `docs/dns-eatumbo.md`) | **mail auth — must not be dropped** |

Squarespace-era records that are deliberately *not* carried over: the apex `A`
to `198.49.23.145`, `www` `CNAME` → `ext-sq.squarespace.com`, and
`_domainconnect` → `_domainconnect.domains.squarespace.com`.

---

## 2. Search presence — after domain move

- [ ] Verify the domain in **Google Search Console**; submit `sitemap.xml`.
- [ ] Verify in **Bing Webmaster Tools** (feeds ChatGPT / Copilot answers).
- [ ] Create / claim **Google Business Profile** (hours, photos, menu link,
      reservations) — the single biggest local-SEO + maps lever for a restaurant.
- [ ] Add **Apple Business Connect** listing (feeds Apple Maps + Siri).
- [ ] Ensure NAP (name, address, phone) is identical across the site, GBP,
      Yelp, and directories.

## 3. Structured data — extend as content grows

- [ ] Add `AggregateRating` / `Review` schema once real reviews exist
      (don't fabricate — Google penalizes self-serving markup).
- [ ] Add `Event` schema + a listing page when hosting ticketed/one-off events.
- [ ] Expand `Menu` JSON-LD with per-item pricing + `suitableForDiet` /
      allergen info as the menu stabilizes.

## 4. Content / AEO

- [ ] Keep `llms.txt` and the FAQ in sync with real hours, menu, and policies.
- [ ] Consider a short journal/press page (natural inbound links + fresh crawl
      signal); link any press mentions.
- [ ] Per-page Open Graph images (menu, events) instead of the shared card.

## 5. Nice-to-have

- [ ] Reservation integration (Resy/Tock) if phone-only changes.
- [ ] Newsletter signup wiring (currently "coming soon-ish").
- [ ] Real 512×512 PWA icon for the web manifest (current max is 180×180).
