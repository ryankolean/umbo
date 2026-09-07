#!/bin/bash
#
# porkbun-dns.sh — apply the eatumbo.com zone to Porkbun via the API.
#
# The zone cannot be staged while the domain is still transferring: Porkbun
# renders a DNS editor for pending transfers but rejects every write with
# "Could not find domain in account. (001)". Run this once the transfer
# completes and the domain appears under Domain Management.
#
# Setup (one time):
#   1. Porkbun → Account → API Access → create an API key. Note the key and
#      the secret key.
#   2. Domain Management → eatumbo.com → Details → toggle API ACCESS on.
#      (Per-domain toggle. The API returns "Invalid domain" without it.)
#   3. Store both in 1Password:
#        op item create --category='API Credential' --title='Porkbun API' \
#          --vault=Personal apikey=pk1_... secretapikey=sk1_...
#
# Usage:
#   ./scripts/porkbun-dns.sh check          # ping the API, list current records
#   ./scripts/porkbun-dns.sh apply          # create the web + mail records
#   ./scripts/porkbun-dns.sh nameservers    # LAST STEP: delegate to Porkbun
#
# "apply" is additive and safe to re-run only on an empty zone — it does not
# delete. Check first.

set -euo pipefail

DOMAIN="eatumbo.com"
API="https://api.porkbun.com/api/json/v3"
OP_ITEM="${PORKBUN_OP_ITEM:-Porkbun API}"

command -v jq >/dev/null || { echo "jq required" >&2; exit 1; }

APIKEY="$(op read "op://Personal/${OP_ITEM}/apikey")"
SECRET="$(op read "op://Personal/${OP_ITEM}/secretapikey")"

auth() { jq -n --arg a "$APIKEY" --arg s "$SECRET" '{apikey:$a, secretapikey:$s}'; }

call() { # call <path> <json-payload>
  curl -s -X POST "$API/$1" -H 'Content-Type: application/json' -d "$2"
}

# type|host|value|ttl|prio   (empty host = apex)
read -r -d '' RECORDS <<'EOF' || true
A||185.199.108.153|600|
A||185.199.109.153|600|
A||185.199.110.153|600|
A||185.199.111.153|600|
AAAA||2606:50c0:8000::153|600|
AAAA||2606:50c0:8001::153|600|
AAAA||2606:50c0:8002::153|600|
AAAA||2606:50c0:8003::153|600|
CNAME|www|ryankolean.github.io|600|
MX||smtp.google.com|3600|1
TXT||v=spf1 include:_spf.google.com ~all|3600|
EOF

# DKIM kept separate: one long unbroken value. Porkbun splits it into
# 255-char strings itself — do NOT pre-chunk or add quotes.
DKIM='v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5K9rkfiboaE97baNCFyozNJgvXX7hk6tJiMoT6NsBF+nLRxEe1Xn7c+rgg9CSzrncVHcAzRE8ZG44TBNLP3c5DHtFh6ypSIjeBB1tjVQ7TjmNjAIKYROZUDAn3+h+ADKxRtTz4QmxuEnBGPg1WrE05vXOEvPBzlaO/fxJV3jOpTkzGWg4Zpc8sd36YZEbLazPngLGyfFjOaVYwmcvRv0aJjpA0hJrYOInVRQY+kZSAVScNzACp+4xjai23wnOAGgw1YNrXu9GmghU2s7pMwinL4XAO1a0zk7BnoJZMn1lwXX9ho7+tEJCHl6XvaoBYLPKSq68GnxpnhjkMrO5OYeVwIDAQAB'

create_record() { # create_record <type> <host> <value> <ttl> <prio>
  local payload
  payload="$(auth | jq --arg n "$2" --arg t "$1" --arg c "$3" --arg ttl "$4" --arg p "$5" \
    '. + {name:$n, type:$t, content:$c, ttl:$ttl} + (if $p == "" then {} else {prio:$p} end)')"
  local resp; resp="$(call "dns/create/$DOMAIN" "$payload")"
  local status; status="$(echo "$resp" | jq -r '.status')"
  printf '  %-5s %-20s %-45s %s\n' "$1" "${2:-@}" "$(echo "$3" | cut -c1-45)" "$status"
  [ "$status" = "SUCCESS" ] || { echo "    -> $(echo "$resp" | jq -r '.message')" >&2; return 1; }
}

case "${1:-check}" in
  check)
    echo "== ping =="
    call "ping" "$(auth)" | jq -r '"status: \(.status)  yourIp: \(.yourIp // "-")"'
    echo "== current records for $DOMAIN =="
    call "dns/retrieve/$DOMAIN" "$(auth)" \
      | jq -r 'if .status=="SUCCESS" then (.records[] | "\(.type)\t\(.name)\t\(.content[0:50])\tttl=\(.ttl)") else "ERROR: \(.message)" end'
    ;;
  apply)
    echo "Creating records for $DOMAIN"
    while IFS='|' read -r type host value ttl prio; do
      [ -z "${type// }" ] && continue
      create_record "$type" "${host// }" "$(echo "$value" | sed 's/^ *//;s/ *$//')" "$ttl" "$prio"
    done <<< "$RECORDS"
    create_record TXT "google._domainkey" "$DKIM" 3600 ""
    echo
    echo "Done. Verify, then run: $0 nameservers"
    ;;
  nameservers)
    echo "This delegates $DOMAIN to Porkbun's nameservers."
    echo "Mail breaks if the records above are not already correct. Verify first:"
    echo "  $0 check"
    read -r -p "Type the domain to confirm: " confirm
    [ "$confirm" = "$DOMAIN" ] || { echo "aborted"; exit 1; }
    payload="$(auth | jq '. + {ns:["curitiba.ns.porkbun.com","fortaleza.ns.porkbun.com","maceio.ns.porkbun.com","salvador.ns.porkbun.com"]}')"
    call "domain/updateNs/$DOMAIN" "$payload" | jq -r '"status: \(.status) \(.message // "")"'
    echo "Registry NS TTL is 172800 - allow up to 48h for full propagation."
    ;;
  *) echo "usage: $0 {check|apply|nameservers}" >&2; exit 1 ;;
esac
