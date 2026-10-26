#!/usr/bin/env python3
"""
site-health.py: check that eatumbo.com is up and serving a cert that verifies.

Run by .github/workflows/site-health.yml, which opens an issue assigned to Ryan
when this fails and closes it on recovery (see docs/monitoring.md). It passes
only if every page below:

  - answers HTTPS 200 within 20 seconds, with a cert that verifies
  - contains the street address, so a registrar parking page or a blank build
    does not pass as healthy

and the cert has at least MIN_CERT_DAYS days left (default 14). GitHub Pages
renews the cert on its own, so a cert under the floor means renewal has stalled,
weeks before visitors would see a security warning.

Each page gets ATTEMPTS tries, RETRY_DELAY seconds apart, so a one-off blip does
not open an issue. In Actions the result table is written to $GITHUB_OUTPUT as
`summary` for the incident issue.

Usage:
    ./scripts/site-health.py
    MIN_CERT_DAYS=400 ./scripts/site-health.py      # force a failure
"""

import os
import socket
import ssl
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlparse

SITE = os.environ.get("SITE_URL", "https://eatumbo.com").rstrip("/")
PAGES = ["/", "/menu.html"]
# In the footer of every page and in the home page's Restaurant JSON-LD. If Umbo
# moves, change this in the same commit as the footer.
KEYWORD = "430 E. Front Street"
MIN_CERT_DAYS = int(os.environ.get("MIN_CERT_DAYS", "14"))
ATTEMPTS = int(os.environ.get("ATTEMPTS", "3"))
RETRY_DELAY = int(os.environ.get("RETRY_DELAY", "60"))


def page_problem(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "umbo-site-health (+https://github.com/ryankolean/umbo)",
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except (urllib.error.URLError, OSError) as e:
        # DNS failures, timeouts and cert errors all land here.
        return f"unreachable: {getattr(e, 'reason', e)}"
    if KEYWORD not in body:
        return f"HTTP 200, but `{KEYWORD}` is not on the page"
    return None


def cert_problem(host):
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((host, 443), timeout=20) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as tls:
                not_after = tls.getpeercert()["notAfter"]
    except OSError as e:
        return f"does not verify: {e}", None
    days = (ssl.cert_time_to_seconds(not_after) - time.time()) / 86400
    if days < MIN_CERT_DAYS:
        return (f"{days:.1f} days left (expires {not_after}), under the "
                f"{MIN_CERT_DAYS}-day floor"), None
    return None, f"{days:.1f} days left (expires {not_after})"


def retried(check, *args):
    for attempt in range(1, ATTEMPTS + 1):
        result = check(*args)
        failed = result[0] if isinstance(result, tuple) else result
        if not failed or attempt == ATTEMPTS:
            return result
        print(f"  attempt {attempt} failed ({failed}), retrying in {RETRY_DELAY}s")
        time.sleep(RETRY_DELAY)


def main():
    rows, failed = [], False
    for path in PAGES:
        url = SITE + path
        problem = retried(page_problem, url)
        failed |= bool(problem)
        rows.append((url, f"FAIL: {problem}" if problem else "OK"))

    host = urlparse(SITE).hostname
    problem, detail = retried(cert_problem, host)
    failed |= bool(problem)
    rows.append((f"cert for {host}", f"FAIL: {problem}" if problem else f"OK: {detail}"))

    table = "\n".join(["| Check | Result |", "|---|---|"] + [f"| {a} | {b} |" for a, b in rows])
    print(table)
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"summary<<SITE_HEALTH_EOF\n{table}\nSITE_HEALTH_EOF\n")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
