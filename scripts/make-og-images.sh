#!/bin/bash
#
# make-og-images.sh — build the per-page Open Graph cards.
#
# Every page used to share assets/img/og.jpg, so a link to the menu previewed
# identically to the home page in iMessage, Instagram DMs, Facebook and Slack.
# This builds one card per significant page from the brand assets already in
# the repo, so the cards can be regenerated when the wordmark or parade change.
#
# Home keeps the photographic card (assets/img/og.jpg, the room shot). The
# inside pages get the graphic lockup: brand ground, parade band, wordmark,
# page label. Distinct ground colours so they stay apart at thumbnail size.
#
# Usage:
#   ./scripts/make-og-images.sh
#
# Requires ImageMagick 7 (`magick`). Fraunces is not needed — the wordmark is
# a PNG. Jost is fetched from Google Fonts on first run and cached in /tmp.
#
# Output: assets/img/og-menu.jpg, og-events.jpg, og-visit.jpg (1200x630).

set -euo pipefail

cd "$(dirname "$0")/.."

command -v magick >/dev/null || { echo "ImageMagick 7 (magick) not found" >&2; exit 1; }

JOST="${JOST_TTF:-/tmp/umbo-og-jost.ttf}"
if [ ! -s "$JOST" ]; then
  echo "Fetching Jost..."
  curl -fsSL -o "$JOST" \
    'https://raw.githubusercontent.com/google/fonts/main/ofl/jost/Jost%5Bwght%5D.ttf'
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Letter-spacing: ImageMagick has no tracking, so space the characters out by
# hand to match the .brand__sub treatment on the site.
track() { printf '%s' "$1" | sed 's/./& /g; s/ $//'; }

# The parade band, bled past both edges and cropped to the figures. Cropping
# from the bottom drops the "she sells sea shells" script, which would collide
# with the subline.
band() { # band <parade-png> <out>
  magick "$1" -resize 1320x -gravity south -crop 1320x220+0+0 +repage "$2"
}
band assets/img/parade-ink.png   "$WORK/band-ink.png"
band assets/img/parade-cream.png "$WORK/band-cream.png"

card() { # card <out> <bg> <band> <wordmark> <label-fill> <sub-fill> <label> <sub>
  magick -size 1200x630 xc:"$2" \
    "$3" -gravity south -geometry +0+0 -composite \
    \( "$4" -resize 420x \) -gravity north -geometry +0+120 -composite \
    -font "$JOST" -pointsize 30 -fill "$5" -gravity north -annotate +0+268 "$(track "$7")" \
    -font "$JOST" -pointsize 21 -fill "$6" -gravity north -annotate +0+322 "$(track "$8")" \
    -strip -interlace Plane -quality 86 "$1"
  echo "  wrote $1"
}

# Palette from assets/css/style.css.
card assets/img/og-menu.jpg   '#E8E3CE' "$WORK/band-ink.png"   assets/img/wordmark-ink.png \
     '#9A6B18' '#5C4A33' 'MENU'              'OYSTER BAR  .  TRAVERSE CITY, MI'
card assets/img/og-events.jpg '#2B2117' "$WORK/band-cream.png" assets/img/wordmark-cream.png \
     '#E7CB8C' '#A9B8A4' 'EVENTS & CATERING' 'OYSTER BAR  .  TRAVERSE CITY, MI'
card assets/img/og-visit.jpg  '#5C6E56' "$WORK/band-cream.png" assets/img/wordmark-cream.png \
     '#E7CB8C' '#D8E0D4' 'VISIT'             '430 E. FRONT STREET  .  TRAVERSE CITY, MI'
