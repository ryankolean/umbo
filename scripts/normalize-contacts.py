#!/usr/bin/env python3
"""Turn the Squarespace contact export into a Kit import CSV.

The export is dirty in ways that are specific and known: almost every email
cell carries a trailing comma, one address has a second domain glued onto it,
and 70 addresses repeat across 82 rows. This script fixes exactly those things
and reports every row it changes or drops, so nothing disappears quietly.

Usage:
    python3 scripts/normalize-contacts.py <export.csv> [-o OUTPUT]

Get the input from Google Sheets via File > Download > Comma Separated Values.
A copy-paste of the sheet is not good enough; it escapes underscores in
addresses and silently corrupts them.

Output defaults to ~/umbo-mailing-list/ and may never be written inside this
repo, which is public.
"""

import argparse
import csv
import pathlib
import re
import sys

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")

DEFAULT_OUT = pathlib.Path.home() / "umbo-mailing-list" / "kit-import.csv"


def repo_root():
    """The git working tree this script lives in, or None."""
    here = pathlib.Path(__file__).resolve().parent
    for d in (here, *here.parents):
        if (d / ".git").exists():
            return d
    return None


def pick_column(fieldnames, *wanted):
    """First header containing any of `wanted`, case-insensitively."""
    for want in wanted:
        for name in fieldnames:
            if name and want in name.strip().lower():
                return name
    return None


def clean_email(raw):
    """Return a normalised address, or None if it cannot be salvaged.

    Splitting on the first comma handles both defects at once: the trailing
    comma on 825 of 831 cells, and the one address with a stray `,.com,`
    appended. Whatever precedes the first comma is the address the person
    actually typed.
    """
    value = (raw or "").strip().strip('"').split(",")[0].strip().lower()
    return value if EMAIL_RE.match(value) else None


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=pathlib.Path, help="Squarespace export CSV")
    ap.add_argument("-o", "--output", type=pathlib.Path, default=DEFAULT_OUT,
                    help=f"output CSV (default: {DEFAULT_OUT})")
    ap.add_argument("--expect", type=int, default=None,
                    help="warn if the unique count is not this number")
    args = ap.parse_args()

    out = args.output.expanduser().resolve()
    root = repo_root()
    if root and root in out.parents:
        sys.exit(f"refusing to write subscriber data inside the repo: {out}\n"
                 f"the repo is public. pick a path outside {root}.")

    if not args.source.exists():
        sys.exit(f"no such file: {args.source}")

    with args.source.open(newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames:
            sys.exit("the export has no header row")
        email_col = pick_column(reader.fieldnames, "email")
        name_col = pick_column(reader.fieldnames, "first name", "first", "name")
        date_col = pick_column(reader.fieldnames, "date", "submitted", "time", "created")
        if not email_col:
            sys.exit(f"no email column in: {reader.fieldnames}")
        rows = list(reader)

    print(f"source      {args.source}")
    print(f"columns     email={email_col!r} name={name_col!r} date={date_col!r}")
    print(f"data rows   {len(rows)}")
    print()

    kept, seen, repaired, dropped, dupes = [], {}, [], [], []

    for i, row in enumerate(rows, start=2):        # 2 = first row under the header
        raw = (row.get(email_col) or "").strip()
        email = clean_email(raw)
        if not email:
            dropped.append((i, raw))
            continue
        if raw.strip().strip('"').rstrip(",").strip().lower() != email:
            repaired.append((i, raw, email))
        if email in seen:
            dupes.append((i, email, seen[email]))
            continue
        seen[email] = i
        kept.append({
            "email_address": email,
            "first_name": (row.get(name_col) or "").strip() if name_col else "",
            "signup_date": (row.get(date_col) or "").strip() if date_col else "",
        })

    # First occurrence wins, so signup_date stays the earliest one on record.
    # That date is the consent evidence if Kit ever asks where the list is from.

    if repaired:
        print(f"repaired    {len(repaired)}")
        for i, raw, email in repaired:
            print(f"  row {i}: {raw!r} -> {email}")
        print()
    if dupes:
        print(f"duplicates  {len(dupes)} (kept the earlier row)")
        for i, email, first in dupes:
            print(f"  row {i}: {email} already seen at row {first}")
        print()
    if dropped:
        print(f"dropped     {len(dropped)} (unparseable)")
        for i, raw in dropped:
            print(f"  row {i}: {raw!r}")
        print()

    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=["email_address", "first_name", "signup_date"])
        writer.writeheader()
        writer.writerows(kept)

    print(f"unique      {len(kept)}")
    print(f"wrote       {out}")
    if args.expect is not None and len(kept) != args.expect:
        print(f"\nNOTE: expected {args.expect} unique addresses, got {len(kept)}. "
              f"Reconcile before importing.")


if __name__ == "__main__":
    main()
