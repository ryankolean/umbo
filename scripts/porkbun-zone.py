#!/usr/bin/env python3
"""
porkbun-zone.py — push the committed zone file to Porkbun, and verify it.

The zone in docs/eatumbo.com.zone is the single source of truth. This reads it,
diffs it against what Porkbun actually has, and only then writes. Nothing is
written without --apply.

Credentials come from 1Password, never from the command line or the repo:

    op item create --category=login --title='Porkbun API' --vault='Dev Secrets' \
        apikey=pk1_xxx secretapikey=sk1_xxx

Override the item path with PORKBUN_OP_ITEM. As a fallback for CI, the script
also accepts PORKBUN_API_KEY / PORKBUN_SECRET_API_KEY from the environment.

Usage:
    ./scripts/porkbun-zone.py --show-desired      # parse the zone, no network
    ./scripts/porkbun-zone.py --check             # auth + is the domain here yet
    ./scripts/porkbun-zone.py --plan              # diff desired vs live (default)
    ./scripts/porkbun-zone.py --apply             # create what is missing
    ./scripts/porkbun-zone.py --apply --prune     # also delete conflicting records
    ./scripts/porkbun-zone.py --verify            # assert Porkbun matches the zone
    ./scripts/porkbun-zone.py --compare-authoritative   # zone vs live public DNS
    ./scripts/porkbun-zone.py --set-ns            # LAST STEP: point NS at Porkbun

Porkbun API reference: https://porkbun.com/api/json/v3/documentation
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.porkbun.com/api/json/v3"
DOMAIN = "eatumbo.com"
ZONE_FILE = Path(__file__).resolve().parent.parent / "docs" / f"{DOMAIN}.zone"
PORKBUN_NS = [
    "curitiba.ns.porkbun.com",
    "fortaleza.ns.porkbun.com",
    "maceio.ns.porkbun.com",
    "salvador.ns.porkbun.com",
]
# A zone without these is not safe to publish: three mailboxes depend on them.
REQUIRED_MAIL_TYPES = {"MX", "TXT"}
PORKBUN_MIN_TTL = 600


# --------------------------------------------------------------------------
# credentials
# --------------------------------------------------------------------------

def load_credentials():
    env_key = os.environ.get("PORKBUN_API_KEY")
    env_secret = os.environ.get("PORKBUN_SECRET_API_KEY")
    if env_key and env_secret:
        return env_key, env_secret

    item = os.environ.get("PORKBUN_OP_ITEM", "op://Dev Secrets/Porkbun API")
    if not shutil.which("op"):
        sys.exit("1Password CLI (op) not found, and PORKBUN_API_KEY is unset.")

    def read(field):
        r = subprocess.run(["op", "read", f"{item}/{field}"],
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit(f"Could not read {item}/{field} from 1Password:\n"
                     f"{r.stderr.strip()}\n\n"
                     f"Create the item, or set PORKBUN_OP_ITEM to its path.")
        return r.stdout.strip()

    return read("apikey"), read("secretapikey")


# --------------------------------------------------------------------------
# zone file
# --------------------------------------------------------------------------

def parse_zone(path):
    """
    Minimal BIND reader for the zone this repo owns — not a general parser.
    It understands $ORIGIN/$TTL, comments, and TXT values split across
    parenthesised character-strings (which it rejoins, because Porkbun wants
    one unsplit value and does its own 255-byte chunking).
    """
    text = path.read_text(encoding="utf-8")

    # Join parenthesised continuations onto one logical line.
    text = re.sub(r"\(\s*(.*?)\s*\)", lambda m: m.group(1), text, flags=re.S)

    def strip_comment(s):
        # ';' starts a comment only outside quotes. DKIM values are full of
        # semicolons ("v=DKIM1; k=rsa; p=..."), so a naive split truncates them.
        out, in_quote = [], False
        for ch in s:
            if ch == '"':
                in_quote = not in_quote
            elif ch == ";" and not in_quote:
                break
            out.append(ch)
        return "".join(out).strip()

    origin, default_ttl, records = DOMAIN + ".", 600, []
    for raw in text.splitlines():
        line = strip_comment(raw)
        if not line:
            continue
        if line.startswith("$ORIGIN"):
            origin = line.split()[1]
            continue
        if line.startswith("$TTL"):
            default_ttl = int(line.split()[1])
            continue

        parts = line.split(None, 4)
        if len(parts) < 4:
            continue
        name, ttl, cls, rtype = parts[0], parts[1], parts[2], parts[3]
        if cls != "IN":
            continue
        rdata = parts[4].strip() if len(parts) > 4 else ""

        prio = "0"
        if rtype == "MX":
            prio, _, rdata = rdata.partition(" ")
            rdata = rdata.strip()

        if rtype == "TXT":
            chunks = re.findall(r'"([^"]*)"', rdata)
            rdata = "".join(chunks) if chunks else rdata.strip('"')
        else:
            rdata = rdata.rstrip(".") if rtype in ("CNAME", "MX", "NS", "ALIAS") else rdata

        sub = "" if name == "@" else name
        records.append({
            "name": sub,
            "type": rtype,
            "content": rdata,
            "ttl": str(max(int(ttl) if ttl.isdigit() else default_ttl, PORKBUN_MIN_TTL)),
            "prio": prio,
        })
    return records


def key_of(r):
    return (r["name"], r["type"], r["content"])


# --------------------------------------------------------------------------
# api
# --------------------------------------------------------------------------

def call(path, apikey, secret, payload=None):
    body = {"apikey": apikey, "secretapikey": secret}
    body.update(payload or {})
    req = urllib.request.Request(
        f"{API}/{path}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:400]
        sys.exit(f"Porkbun API HTTP {e.code} on {path}: {detail}")
    except urllib.error.URLError as e:
        sys.exit(f"Could not reach the Porkbun API: {e.reason}")
    if data.get("status") != "SUCCESS":
        sys.exit(f"Porkbun API error on {path}: {data.get('message', data)}")
    return data


def live_records(apikey, secret):
    data = call(f"dns/retrieve/{DOMAIN}", apikey, secret)
    out = []
    for r in data.get("records", []):
        full = r["name"]
        sub = "" if full == DOMAIN else full[: -(len(DOMAIN) + 1)]
        out.append({
            "id": r["id"], "name": sub, "type": r["type"],
            "content": r["content"], "ttl": str(r.get("ttl", "")),
            "prio": str(r.get("prio") or "0"),
        })
    return out


# --------------------------------------------------------------------------
# reporting
# --------------------------------------------------------------------------

def fmt(r):
    host = r["name"] or "@"
    prio = f" prio={r['prio']}" if r["type"] == "MX" else ""
    content = r["content"] if len(r["content"]) <= 60 else r["content"][:57] + "..."
    return f"  {r['type']:<6} {host:<20} {content}  ttl={r['ttl']}{prio}"


def diff(desired, live):
    live_keys = {key_of(r) for r in live}
    desired_keys = {key_of(r) for r in desired}
    missing = [r for r in desired if key_of(r) not in live_keys]
    # Anything Porkbun added that we did not ask for — typically its parking
    # ALIAS and www CNAME, which would fight the GitHub Pages records.
    extra = [r for r in live if key_of(r) not in desired_keys]
    return missing, extra


def guard_mail(desired):
    types = {r["type"] for r in desired}
    if not REQUIRED_MAIL_TYPES.issubset(types):
        sys.exit("Refusing to continue: the zone is missing MX or TXT records.\n"
                 "Three mailboxes on this domain depend on them.")
    if not any(r["type"] == "MX" for r in desired):
        sys.exit("Refusing to continue: no MX record in the zone.")


# --------------------------------------------------------------------------

def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    g = p.add_mutually_exclusive_group()
    g.add_argument("--show-desired", action="store_true", help="parse the zone file only")
    g.add_argument("--check", action="store_true", help="auth and domain presence")
    g.add_argument("--plan", action="store_true", help="diff desired vs live (default)")
    g.add_argument("--apply", action="store_true", help="create missing records")
    g.add_argument("--verify", action="store_true", help="assert Porkbun matches the zone")
    g.add_argument("--compare-authoritative", action="store_true",
                   help="diff the zone against current public DNS")
    g.add_argument("--set-ns", action="store_true",
                   help="point the nameservers at Porkbun (requires --verify to pass)")
    p.add_argument("--prune", action="store_true",
                   help="with --apply, delete records not in the zone file")
    args = p.parse_args()

    if not ZONE_FILE.exists():
        sys.exit(f"Zone file not found: {ZONE_FILE}")
    desired = parse_zone(ZONE_FILE)
    guard_mail(desired)

    if args.show_desired:
        print(f"Desired zone for {DOMAIN} ({len(desired)} records), from {ZONE_FILE.name}:")
        for r in desired:
            print(fmt(r))
        return

    if args.compare_authoritative:
        print(f"Comparing the zone file against current public DNS for {DOMAIN}.\n")
        for rtype in ("MX", "TXT"):
            want = [r for r in desired if r["type"] == rtype]
            for r in want:
                host = f"{r['name']}.{DOMAIN}" if r["name"] else DOMAIN
                out = subprocess.run(["dig", "+short", rtype, host],
                                     capture_output=True, text=True).stdout
                joined = "".join(re.findall(r'"([^"]*)"', out)) or out.strip()
                match = r["content"] in joined or joined in r["content"]
                print(f"  [{'ok ' if match else 'DIFF'}] {rtype:<4} {host}")
                if not match:
                    print(f"        zone: {r['content'][:70]}")
                    print(f"        live: {joined[:70]}")
        return

    apikey, secret = load_credentials()

    if args.check:
        ping = call("ping", apikey, secret)
        print(f"Auth OK (outbound IP {ping.get('yourIp')}).")
        listed = call("domain/listAll", apikey, secret).get("domains", [])
        names = [d["domain"] for d in listed]
        if DOMAIN in names:
            print(f"{DOMAIN} is in the account. The zone can be written.")
        else:
            print(f"{DOMAIN} is NOT in the account yet ({len(names)} domains present).")
            print("The transfer has not landed. Records cannot be written through "
                  "the API until it does.")
        return

    live = live_records(apikey, secret)
    missing, extra = diff(desired, live)

    if args.verify:
        ok = not missing
        print(f"{len(desired) - len(missing)}/{len(desired)} desired records present.")
        for r in missing:
            print("  MISSING:" + fmt(r)[2:])
        for r in extra:
            print("  EXTRA:  " + fmt(r)[2:])
        if not ok:
            sys.exit(1)
        print("Zone matches the zone file.")
        if extra:
            print("Note: extra records present. Re-run --apply --prune to remove them.")
        return

    if args.set_ns:
        missing_now, _ = diff(desired, live_records(apikey, secret))
        if missing_now:
            sys.exit("Refusing to change nameservers: the Porkbun zone is incomplete.\n"
                     "Run --apply, confirm --verify passes, then retry.")
        current = call(f"domain/getNs/{DOMAIN}", apikey, secret).get("ns", [])
        print(f"Current nameservers: {', '.join(current)}")
        print(f"New nameservers:     {', '.join(PORKBUN_NS)}")
        print("\nThis is the cutover. Mail and web both follow these nameservers,")
        print("and the registry NS TTL means propagation can take up to 48 hours.")
        if input('Type "cutover" to proceed: ').strip() != "cutover":
            sys.exit("Aborted. Nothing changed.")
        call(f"domain/updateNs/{DOMAIN}", apikey, secret, {"ns": PORKBUN_NS})
        print("Nameservers updated. Verify with: dig +short NS " + DOMAIN)
        return

    # --plan (default) and --apply
    print(f"{DOMAIN}: {len(live)} records live, {len(desired)} desired.\n")
    if missing:
        print(f"To create ({len(missing)}):")
        for r in missing:
            print(fmt(r))
    else:
        print("Nothing to create.")
    if extra:
        print(f"\nNot in the zone file ({len(extra)}) — "
              f"{'will delete' if (args.apply and args.prune) else 'left alone'}:")
        for r in extra:
            print(fmt(r))

    if not args.apply:
        print("\nDry run. Re-run with --apply to write.")
        return

    for r in missing:
        call(f"dns/create/{DOMAIN}", apikey, secret, {
            "name": r["name"], "type": r["type"], "content": r["content"],
            "ttl": r["ttl"], "prio": r["prio"],
        })
        print("created:" + fmt(r)[1:])

    if args.prune:
        for r in extra:
            call(f"dns/delete/{DOMAIN}/{r['id']}", apikey, secret)
            print("deleted:" + fmt(r)[1:])

    still_missing, _ = diff(desired, live_records(apikey, secret))
    if still_missing:
        print("\nSome records did not take:")
        for r in still_missing:
            print(fmt(r))
        sys.exit(1)
    print("\nAll desired records are present. Nameservers untouched.")


if __name__ == "__main__":
    main()
