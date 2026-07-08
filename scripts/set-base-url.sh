#!/bin/bash
#
# set-base-url.sh — switch the site's canonical base URL in one shot.
#
# Every absolute URL on the site (canonicals, Open Graph, Twitter, JSON-LD,
# sitemap, robots, llms.txt) points at one base. This rewrites that base
# everywhere and writes the GitHub Pages CNAME file, so moving to a custom
# domain is a single command instead of a hand-edit across ~10 files.
#
# Usage:
#   ./scripts/set-base-url.sh https://umbotraversecity.com
#
# Then: commit, push, and set the same domain under
# GitHub repo → Settings → Pages → Custom domain, and point DNS at GitHub.
#
# Notes:
#   - Pass the bare origin, no trailing slash and no path.
#   - The current base is auto-detected from sitemap.xml, so this is
#     re-runnable (switch domains again later, or switch back).
#   - macOS sed syntax (BSD). On Linux, change `sed -i ''` to `sed -i`.

set -euo pipefail

NEW="${1:-}"
if [ -z "$NEW" ]; then
  echo "Usage: $0 https://your-domain.com   (bare origin, no trailing slash)" >&2
  exit 1
fi
NEW="${NEW%/}"

cd "$(dirname "$0")/.."

# Current base = the origin+path of the first <loc> in sitemap.xml, minus trailing slash.
OLD="$(grep -o '<loc>[^<]*</loc>' sitemap.xml | head -1 | sed -E 's|<loc>(.*)</loc>|\1|; s|/$||')"
if [ -z "$OLD" ]; then
  echo "Could not detect current base URL from sitemap.xml" >&2
  exit 1
fi
if [ "$OLD" = "$NEW" ]; then
  echo "Base URL is already $NEW — nothing to do."
  exit 0
fi

echo "Rewriting base URL:"
echo "  from: $OLD"
echo "  to:   $NEW"

# Rewrite every file that references the old base.
FILES="$(grep -rlF "$OLD" --include='*.html' --include='*.xml' --include='*.txt' --include='*.webmanifest' . || true)"
if [ -n "$FILES" ]; then
  # shellcheck disable=SC2086
  printf '%s\n' "$FILES" | while IFS= read -r f; do
    [ -n "$f" ] && sed -i '' "s|$OLD|$NEW|g" "$f" && echo "  updated $f"
  done
fi

# CNAME (host only) for GitHub Pages custom domain.
HOST="${NEW#http://}"; HOST="${HOST#https://}"; HOST="${HOST%%/*}"
printf '%s\n' "$HOST" > CNAME
echo "  wrote CNAME -> $HOST"

echo
echo "Done. Next steps:"
echo "  1. git add -A && git commit -m 'chore: move to $HOST' && git push"
echo "  2. GitHub repo → Settings → Pages → Custom domain: $HOST"
echo "  3. Point DNS at GitHub Pages (A/AAAA to GitHub IPs, or CNAME to <user>.github.io)."
echo "  4. Enable 'Enforce HTTPS' once the certificate provisions."
echo "  5. Resubmit sitemap in Google Search Console + Bing Webmaster Tools."
