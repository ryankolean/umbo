#!/usr/bin/env python3
"""
faq-jsonld.py - rebuild the visit page FAQPage structured data from the visible FAQ.

visit.html shows each question as a `<dt>` and its answer as a `<dd>` inside
`.faq__list`, and repeats both in the `FAQPage` node of the page's JSON-LD.
Edit one copy and miss the other and the structured data disagrees with the
page. The visible copy is the only source: edit the `<dd>`, then run

    ./scripts/faq-jsonld.py           # rewrite the FAQPage JSON-LD
    ./scripts/faq-jsonld.py --check   # exit 1 if it has drifted from the page

Answer text is the `<dd>` with entities decoded. Links to web pages stay as
`<a href>` with an absolute URL (Google allows links in FAQ answers); `tel:`
and `sms:` links become their visible text, which is the phone number.
"""

import argparse
import json
import re
import sys
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parent.parent
PAGE = "visit.html"
BASE = "https://eatumbo.com/"
LD_BLOCK = re.compile(r'(<script type="application/ld\+json">\n)(.*?)(\n</script>)', re.S)


class Faq(HTMLParser):
    """Collects [(question, answer)] from the dt/dd pairs in `.faq__list`."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pairs = []
        self.in_list = False
        self.field = None
        self.buf = []
        self.link_open = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "dl" and "faq__list" in (attrs.get("class") or "").split():
            self.in_list = True
        elif self.in_list and tag in ("dt", "dd"):
            self.field, self.buf = tag, []
        elif self.field == "dd" and tag == "a":
            href = attrs.get("href") or ""
            if not href.startswith(("tel:", "sms:", "mailto:")):
                self.buf.append(f'<a href="{escape(urljoin(BASE, href))}">')
                self.link_open = True

    def handle_endtag(self, tag):
        if tag == "dl" and self.in_list:
            self.in_list = False
        elif tag == "a" and self.link_open:
            self.buf.append("</a>")
            self.link_open = False
        elif tag == self.field == "dt":
            self.pairs.append([clean(self.buf), ""])
            self.field = None
        elif tag == self.field == "dd":
            if not self.pairs or self.pairs[-1][1]:
                sys.exit(f"{PAGE}: a <dd> without its <dt>")
            self.pairs[-1][1] = clean(self.buf)
            self.field = None

    def handle_data(self, data):
        if self.field == "dd":
            # The answer may carry <a> markup, so its text is HTML too.
            self.buf.append(escape(data, quote=False))
        elif self.field:
            self.buf.append(data)


def clean(parts):
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check", action="store_true", help="exit 1 if the JSON-LD is out of date")
    args = ap.parse_args()

    path = ROOT / PAGE
    html = path.read_text()
    parser = Faq()
    parser.feed(html)
    if not parser.pairs or any(not a for _, a in parser.pairs):
        sys.exit(f"{PAGE}: no complete question and answer pairs found in .faq__list")

    match = LD_BLOCK.search(html)
    if not match:
        sys.exit(f"{PAGE}: no JSON-LD block found")
    data = json.loads(match.group(2))
    nodes = [n for n in data["@graph"] if n.get("@type") == "FAQPage"]
    if len(nodes) != 1:
        sys.exit(f"{PAGE}: expected one FAQPage node, found {len(nodes)}")
    nodes[0]["mainEntity"] = [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
        for q, a in parser.pairs
    ]
    new = html[:match.start(2)] + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + html[match.end(2):]

    if args.check:
        print(f"out of date: {PAGE}" if new != html else "up to date")
        sys.exit(1 if new != html else 0)
    if new != html:
        path.write_text(new)
    print(f"{PAGE}: {len(parser.pairs)} questions. Rewrote: {PAGE if new != html else 'nothing'}")


if __name__ == "__main__":
    main()
