# Umbo — Traverse City

Website for Umbo, a restaurant in Traverse City, Michigan.

Elevated rebuild. Design specs and assets captured from the previous site
(eatumbo.com) and their Instagram (@umbotraversecity).

Hosted on GitHub Pages at **https://eatumbo.com** (apex; `www` redirects to it).
The canonical base URL lives in one place — change it with
`./scripts/set-base-url.sh https://new-domain.com`, never by hand.

## Menu content

No date ranges anywhere in menu content — not on `menu.html`, not on the
catering menu in `events.html`, not in `llms.txt` or the FAQ. A printed range
goes stale the moment the kitchen changes a course, and it gets copied into
structured data and the FAQ where nobody remembers to update it.

Menu changes ship as full content updates: replace the dishes, keep the price
and any serving note, and leave the dates off.
