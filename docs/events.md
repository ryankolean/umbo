# Events

Umbo runs a few one-off events a year (Halloween burger of the day, Dumpling
Day, New Year's Eve). Each gets its own page, built by hand because each one
has its own look and menu. What is not left to memory is the structure around
it: `./scripts/event-check.py` fails when an event page is missing a required
field, is not listed, or has outlived its date. It runs on every pull request,
on every push to `master`, and once a day (`.github/workflows/events-check.yml`),
so a past event that was never retired turns the daily run red and GitHub emails
Ryan.

`new-years-eve.html` is the current reference page. `dumpling-day.html` shows
what a retired page looks like.

## Adding an event

1. Copy `new-years-eve.html` to `<slug>.html` and replace the title, meta
   description, canonical, Open Graph and Twitter tags, breadcrumb and body.
2. Set the head cutoff script to the moment the event ends, with the ET offset
   (`-04:00` in summer, `-05:00` in winter):

   ```html
   <script>if (Date.now() >= Date.parse('2026-12-31T23:59:00-05:00')) document.documentElement.classList.add('promo-over');</script>
   ```

   Mark booking details and the menu `data-promo` (hidden once it is over) and
   the thank-you note `data-promo-after` (shown once it is over). The rules are
   in `assets/css/style.css`.
3. Write the event node in the page's JSON-LD. Use `FoodEvent` for a menu
   event. Required by the check: `name`, `startDate` (with offset), `eventStatus`
   (`https://schema.org/EventScheduled`), `location` (the `#restaurant` node with
   its address), `organizer`, `url`, `image`. Add `endDate` when the end is known,
   and `offers` with `price` and `priceCurrency` only for prices the page prints.
   Walk-in events with no price get no offers.
4. Add a teaser to `events.html`. A second event with its own cutoff on that page
   needs its own class and attribute (see `nye-over` / `data-nye` in the head
   and in `style.css`), because `promo-over` would hide every teaser at once.
5. Add the page to `sitemap.xml` and to the Pages list in `llms.txt`. If the
   event changes hours (a closure, extra seatings), update the hours everywhere
   listed in `ROADMAP.md` section 4, then run `./scripts/faq-jsonld.py`.
6. Run `./scripts/event-check.py` and fix anything it reports.

## If plans change

Do not delete a cancelled or moved event. Set `eventStatus` to
`https://schema.org/EventCancelled` or `https://schema.org/EventRescheduled`
(with the new `startDate` and the old one in `previousStartDate`), and say so
on the page.

## Retiring an event

Do this the day after (PR #59 did it for Dumpling Day):

1. Remove the event node from the page's JSON-LD. Keep the `BreadcrumbList`.
2. Remove its `<url>` from `sitemap.xml` and its line from `llms.txt`.
3. Remove its teaser from `events.html` and any promo on `index.html`, with
   their cutoff scripts and any CSS or JS only they used.
4. Leave the page itself up: the cutoff already shows the thank-you note, and
   inbound links from Instagram and press keep working.
5. Run `./scripts/event-check.py`; the event should no longer be listed.

To see what the check will say after a date, set `NOW`:

```sh
NOW=2027-01-01T00:00:01-05:00 ./scripts/event-check.py
```
