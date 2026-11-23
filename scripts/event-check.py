#!/usr/bin/env python3
"""
event-check.py - fail when an event page is incomplete or has outlived its date.

Every page at the repo root whose JSON-LD carries an Event node (FoodEvent,
Event, ...) must have:

  - name, startDate (with a UTC offset), eventStatus, location, organizer,
    url and image (offers too when the event is ticketed or priced; a walk-in
    event like Dumpling Day has none)
  - a head cutoff script (`Date.parse(...)` adding `promo-over`) at or after
    the start, so the page hides its booking details once the event is over
  - a <loc> in sitemap.xml and a link from events.html

and the event must not be over. An event is over at its endDate, or at the
midnight after its startDate when it has none. A past event that still emits
Event JSON-LD reads as upcoming to search and answer engines, so the check
fails until it is retired (docs/events.md, "Retiring an event").

    ./scripts/event-check.py
    NOW=2027-01-02T00:00:00-05:00 ./scripts/event-check.py   # pretend it is later
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://eatumbo.com/"
LD_BLOCK = re.compile(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.S)
CUTOFF = re.compile(r"Date\.parse\('([^']+)'\)\)\s*document\.documentElement\.classList\.add\('promo-over'\)")
REQUIRED = ["name", "startDate", "eventStatus", "location", "organizer", "url", "image"]


def parse_time(value):
    when = datetime.fromisoformat(value)
    if when.tzinfo is None:
        raise ValueError(f"{value} has no UTC offset")
    return when


def events_in(html):
    for block in LD_BLOCK.findall(html):
        data = json.loads(block)
        for node in data.get("@graph", [data]):
            kind = node.get("@type", "")
            if isinstance(kind, str) and kind.endswith("Event"):
                yield node


def problems_for(page, node, now, sitemap, listing):
    found = [f"missing {key}" for key in REQUIRED if not node.get(key)]
    try:
        start = parse_time(node["startDate"])
        end = parse_time(node["endDate"]) if node.get("endDate") else \
            (start + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    except (KeyError, ValueError) as e:
        return found + [f"bad date: {e}"]
    if now >= end:
        found.append(f"ended {end.isoformat()} but still emits Event JSON-LD: retire it (docs/events.md)")
    html = (ROOT / page).read_text()
    cutoff = CUTOFF.search(html)
    if not cutoff:
        found.append("no head cutoff script adding promo-over")
    elif parse_time(cutoff.group(1)) < start:
        found.append(f"cutoff {cutoff.group(1)} is before the start {node['startDate']}")
    if f"<loc>{BASE}{page}</loc>" not in sitemap:
        found.append("not in sitemap.xml")
    if f'href="{page}"' not in listing:
        found.append("not linked from events.html")
    return found


def main():
    now = parse_time(os.environ["NOW"]) if os.environ.get("NOW") else datetime.now().astimezone()
    sitemap = (ROOT / "sitemap.xml").read_text()
    listing = (ROOT / "events.html").read_text()
    failed, count = False, 0
    for path in sorted(ROOT.glob("*.html")):
        for node in events_in(path.read_text()):
            count += 1
            problems = problems_for(path.name, node, now, sitemap, listing)
            status = "ok" if not problems else "; ".join(problems)
            print(f"{path.name}: {node.get('name', '?')} ({node.get('startDate', '?')}): {status}")
            failed |= bool(problems)
    if not count:
        print("no Event JSON-LD on any page")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
