# Umbo website — roadmap

Living list of planned work. Current base URL: `https://ryankolean.github.io/umbo/`
(GitHub Pages project site). Last updated 2026-07-08.

---

## 1. Move to a custom domain  ← do this for real SEO

The site currently lives on a GitHub Pages **project path** (`/umbo/`). Two SEO
files — `robots.txt` and `llms.txt` — are only authoritative when served from a
**domain root**, so a custom domain (e.g. `umbotraversecity.com`) unlocks their
full effect and gives the brand a real address.

The transition is scripted so it stays clean:

```bash
./scripts/set-base-url.sh https://umbotraversecity.com
```

That one command:
- rewrites the base URL in every absolute reference — canonicals, Open Graph,
  Twitter cards, JSON-LD (`url`/`@id`), `sitemap.xml`, `robots.txt`, `llms.txt`;
- writes the `CNAME` file GitHub Pages needs.

Then:
1. `git add -A && git commit -m "chore: move to umbotraversecity.com" && git push`
2. GitHub repo → **Settings → Pages → Custom domain** → enter the domain.
3. DNS: apex `A`/`AAAA` records to GitHub Pages IPs, or `www` `CNAME` →
   `ryankolean.github.io`.
4. Wait for the cert, then enable **Enforce HTTPS**.
5. Resubmit `sitemap.xml` in Google Search Console and Bing Webmaster Tools;
   add the new property.

> Keep every absolute URL routed through `set-base-url.sh`. Don't hand-edit
> domains in individual files — re-run the script instead, so nothing drifts.

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
