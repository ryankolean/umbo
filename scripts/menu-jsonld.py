#!/usr/bin/env python3
"""
menu-jsonld.py - rebuild the menu and catering structured data from the visible rows.

menu.html and events.html list every dish and package as `.menu-row` markup. The
JSON-LD in each page's head repeats those items so search and answer engines can
quote names and prices, which means it goes stale the moment the menu changes.
Run this after every menu edit and commit the result with it:

    ./scripts/menu-jsonld.py           # rewrite the JSON-LD in both pages
    ./scripts/menu-jsonld.py --check   # exit 1 if either page is out of date

menu.html: the `Menu` node gets one `MenuSection` per `.menu-cat` heading, each
with its `MenuItem`s. A single price becomes an `Offer`; "51 | 120" or "20/80"
(caviar sizes, glass / bottle) becomes an `AggregateOffer`. A section note like
"$95 per person." becomes the section's own offer (the prix-fixe), and "$46 a
dozen." becomes an offer for a quantity of 12 (the oysters).

events.html: the catering `Service` gets a `hasOfferCatalog` with every package
priced as a plain "$N / pp" or "$N / hr". Upgrades (+$), estimates (~$) and
"Market" are left out on purpose: they are not standalone offers.
"""

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LD_BLOCK = re.compile(r'(<script type="application/ld\+json">\n)(.*?)(\n</script>)', re.S)


class MenuRows(HTMLParser):
    """Collects [{name, note, rows: [{name, tag, price, desc}]}] in page order."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.row = None
        self.field = None
        self.in_cat = self.in_heading = self.in_note = self.in_em = False
        self.buf, self.em_buf = [], []

    def handle_starttag(self, tag, attrs):
        cls = (dict(attrs).get("class") or "").split()
        if tag == "div" and "menu-cat" in cls:
            self.in_cat = True
        elif self.in_cat and tag in ("h2", "h3"):
            self.in_heading, self.buf = True, []
        elif tag == "p" and "menu-note" in cls and self.sections:
            self.in_note, self.buf = True, []
        elif tag == "div" and "menu-row" in cls:
            self.row = {"name": "", "tag": "", "price": "", "desc": ""}
        elif self.row is not None and tag == "em" and self.field == "name":
            self.in_em, self.em_buf = True, []
        elif self.row is not None and tag == "span" and cls and cls[0].startswith("menu-row__"):
            self.field, self.buf = cls[0].split("__", 1)[1], []

    def handle_endtag(self, tag):
        if self.in_heading and tag in ("h2", "h3"):
            self.sections.append({"name": clean(self.buf), "note": "", "rows": []})
            self.in_heading = self.in_cat = False
        elif self.in_note and tag == "p":
            self.sections[-1]["note"] = clean(self.buf)
            self.in_note = False
        elif self.in_em and tag == "em":
            self.row["tag"] = clean(self.em_buf)
            self.in_em = False
        elif self.field and tag == "span":
            self.row[self.field] = clean(self.buf)
            self.field = None
        elif self.row is not None and tag == "div":
            if self.sections:
                self.sections[-1]["rows"].append(self.row)
            self.row = None

    def handle_data(self, data):
        if self.in_em:
            self.em_buf.append(data)
        elif self.field or self.in_heading or self.in_note:
            self.buf.append(data)


def clean(parts):
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def rows_of(page):
    parser = MenuRows()
    parser.feed((ROOT / page).read_text())
    return parser.sections


def menu_offer(price):
    if not re.fullmatch(r"[\d.]+(\s*[|/]\s*[\d.]+)*", price):
        return None
    nums = re.findall(r"\d+(?:\.\d+)?", price)
    if len(nums) == 1:
        return {"@type": "Offer", "price": nums[0], "priceCurrency": "USD"}
    values = sorted(nums, key=float)
    return {"@type": "AggregateOffer", "lowPrice": values[0], "highPrice": values[-1],
            "offerCount": len(nums), "priceCurrency": "USD"}


def describe(row):
    if row["tag"] and row["desc"]:
        return f'{row["desc"]} ({row["tag"]})'
    return row["desc"] or row["tag"]


def menu_sections():
    out = []
    for section in rows_of("menu.html"):
        items = []
        for row in section["rows"]:
            item = {"@type": "MenuItem", "name": row["name"]}
            if describe(row):
                item["description"] = describe(row)
            offer = menu_offer(row["price"])
            if offer:
                item["offers"] = offer
            items.append(item)
        node = {"@type": "MenuSection", "name": section["name"], "hasMenuItem": items}
        per_person = re.search(r"\$(\d+(?:\.\d+)?) per person", section["note"])
        per_dozen = re.search(r"\$(\d+(?:\.\d+)?) (?:a|per|/) dozen", section["note"])
        if per_person:
            node["offers"] = {"@type": "Offer", "price": per_person.group(1), "priceCurrency": "USD"}
        elif per_dozen:
            node["offers"] = {"@type": "Offer", "price": per_dozen.group(1), "priceCurrency": "USD",
                              "eligibleQuantity": {"@type": "QuantitativeValue", "value": 12}}
        out.append(node)
    return out


def catering_catalog():
    units = {"pp": "per person", "hr": "per hour"}
    groups = []
    for section in rows_of("events.html"):
        offers = []
        for row in section["rows"]:
            m = re.fullmatch(r"\$(\d+(?:\.\d+)?) / (pp|hr)", row["price"])
            if not m:
                continue
            offer = {"@type": "Offer", "name": row["name"],
                     "itemOffered": {"@type": "Service", "name": row["name"]},
                     "priceSpecification": {"@type": "UnitPriceSpecification", "price": m.group(1),
                                            "priceCurrency": "USD", "unitText": units[m.group(2)]}}
            if describe(row):
                offer["description"] = describe(row)
            offers.append(offer)
        if offers:
            groups.append({"@type": "OfferCatalog", "name": section["name"], "itemListElement": offers})
    return {"@type": "OfferCatalog", "name": "Umbo catering menu", "itemListElement": groups}


def rewrite(page, node_type, update):
    path = ROOT / page
    html = path.read_text()
    match = LD_BLOCK.search(html)
    if not match:
        sys.exit(f"{page}: no JSON-LD block found")
    data = json.loads(match.group(2))
    nodes = [n for n in data["@graph"] if n.get("@type") == node_type]
    if len(nodes) != 1:
        sys.exit(f"{page}: expected one {node_type} node, found {len(nodes)}")
    update(nodes[0])
    new = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return path, html, html[:match.start(2)] + new + html[match.end(2):]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check", action="store_true", help="exit 1 if a page is out of date")
    args = ap.parse_args()

    sections, catalog = menu_sections(), catering_catalog()
    results = [
        rewrite("menu.html", "Menu", lambda n: n.update(hasMenuSection=sections)),
        rewrite("events.html", "Service", lambda n: n.update(hasOfferCatalog=catalog)),
    ]
    stale = [p.name for p, old, new in results if old != new]
    if args.check:
        print("out of date: " + ", ".join(stale) if stale else "up to date")
        sys.exit(1 if stale else 0)
    for path, old, new in results:
        if old != new:
            path.write_text(new)
    items = sum(len(s["hasMenuItem"]) for s in sections)
    packages = sum(len(g["itemListElement"]) for g in catalog["itemListElement"])
    print(f"menu.html: {len(sections)} sections, {items} items. "
          f"events.html: {packages} catering offers. Rewrote: {', '.join(stale) or 'nothing'}")


if __name__ == "__main__":
    main()
