# Monitoring: eatumbo.com

What watches the site, who gets told, and where the outage record lives.

The Website Maintenance & Support Agreement with Umbo (effective 2026-10-25)
commits Summit to:

| Clause | Promise | Met by |
|---|---|---|
| s.3.2 | Monitor availability and performance | the Site health workflow |
| s.12.2 | 99.9% monthly uptime target (no service credits) | `site-down` issues: one per outage, with its duration |
| Schedule C | Sev 1 (site down or security warning): response within 4 hours, outside business hours on a best-effort basis | an issue assigned to Ryan, which emails him |
| s.3.4 | Quarterly summary of uptime, updates applied and support activity | the recurring calendar task, reading the `site-down` issues |

Full terms: `~/ledgr/docs/contracts/summit/clients/umbo/TERMS.md` (not in this repo).

## The monitor: Site health workflow

`.github/workflows/site-health.yml` runs `scripts/site-health.py`. It is
scheduled every 15 minutes, costs nothing (public repo), and needs no account
or secret.

Each run checks:

| Check | Fails on |
|---|---|
| `https://eatumbo.com/` | any HTTP error, a timeout, a DNS failure, a cert that does not verify, or a 200 without `430 E. Front Street` on the page |
| `https://eatumbo.com/menu.html` | the same |
| the `eatumbo.com` cert | fewer than 14 days left |

The keyword is the street address. It is in the footer of every page and in the
home page's Restaurant JSON-LD, so a registrar parking page, a hijacked record
or a blank build cannot pass. If Umbo moves, change `KEYWORD` in the script in
the same commit as the footer.

Each check gets 3 tries a minute apart before it counts as failed, so a one-off
blip opens nothing.

**On failure** the workflow opens one issue, `[site down] https://eatumbo.com is
failing its health check`, labelled `site-down` and assigned to Ryan. GitHub
emails him on the assignment. While the site keeps failing, the issue body
refreshes on every run and gets a comment at most once an hour. The first
healthy run closes it with a "Recovered" comment giving the approximate
downtime. Set the `INCIDENT_ASSIGNEES` repo variable to change who is assigned.

**Cert under 14 days** opens the same issue. GitHub Pages renews its Let's
Encrypt cert on its own, so this means renewal has stalled. See
[Cert renewal stalled](#cert-renewal-stalled).

### What it does not do

- **Fast detection.** GitHub's scheduler is best-effort. Fly Trap's identical
  15-minute schedule fired 6.4 times a day over 2026-08-25 to 2026-10-26, a
  median gap of 3.6 hours and a longest gap of 11.3 hours. Expect an outage to
  be noticed within hours, not minutes.
- **GitHub-wide outages.** The site and this workflow both run on GitHub, so
  they go down together and nothing alerts. Those are on
  https://www.githubstatus.com, and nothing on our side can fix them anyway.
- **Precise uptime.** Downtime is measured between runs, so it can overstate
  an outage by the gap between runs.

What it does catch is what breaks a Pages site while GitHub is fine: DNS, the
domain registration, the cert, or a bad deploy. The 2026-09-13 DNS cutover
outage (about 7 hours) is that kind.

**For 5-minute checks from outside GitHub**, create an UptimeRobot free account
(commercial use is allowed on every plan). Add a keyword monitor on each URL
above with the same keyword, and assign the email and mobile-app alert
contacts. Nothing in this repo needs to change.

### Keep-alive

GitHub disables scheduled workflows in a public repo after 60 days with no
repository activity, and this site can go two quiet months. Every scheduled run
re-enables the workflow through the API, the same call keepalive-workflow v2
makes. GitHub does not document what resets the timer, so the quarterly
calendar task also checks the workflow is still running. To re-enable it by
hand:

```bash
gh workflow enable site-health.yml --repo ryankolean/umbo
```

## Proven

2026-10-26, on PR #29 before it merged:

| Step | Result |
|---|---|
| PR run against the live site | passed: both pages OK, cert 46.6 days left (expires 2026-12-12) |
| Forced failure: cert floor raised to 400 days (`3d43b29`) | the run failed and opened #30, assigned to Ryan, at 20:38 UTC. GitHub's email, "[ryankolean/umbo] [site down] https://eatumbo.com is failing its health check (Issue #30)", reached Ryan's Gmail the same minute |
| Recovery: the forced failure reverted (`976a1e8`) | the run passed and closed #30 at 20:39 UTC with a "Recovered" comment |

Locally, an expired cert (`expired.badssl.com`) and a page without the
keyword (`example.com`) both fail. #30 was then taken off `site-down`, so the
quarterly report does not count a test as an outage.

GitHub's emails land in Gmail's Updates tab, next to every CI notification. A
Gmail filter on the subject `[site down]` that marks the email important keeps
an alert from getting buried.

## When an alert fires

Sev 1 under Schedule C: respond within 4 hours, including after hours on a
best-effort basis.

1. Open https://eatumbo.com yourself, on a phone off Wi-Fi if you can. The
   issue's table names the failing check and the error.
2. Check https://www.githubstatus.com for a Pages incident. If GitHub is the
   cause, there is nothing to fix on our side.
3. DNS: `dig +short eatumbo.com A` must return the four `185.199.10x.153`
   addresses. `./scripts/porkbun-zone.py --compare-authoritative` diffs the
   live zone against `docs/eatumbo.com.zone`. See `docs/dns-eatumbo.md`.
4. A bad deploy: `gh run list --repo ryankolean/umbo -L 5` shows the latest
   Pages builds. Revert the offending commit on `master`, and Pages redeploys
   on push.
5. Cert: `echo | openssl s_client -connect eatumbo.com:443 -servername eatumbo.com 2>/dev/null | openssl x509 -noout -dates -issuer`.
   Then see the next section.
6. If guests could have noticed, tell Sarah in one email: what happened and
   when it was fixed.

The issue closes itself on the next healthy run. Add a comment saying what the
cause was, for the quarterly report.

### Cert renewal stalled

GitHub Pages provisions and renews the cert only while DNS points at GitHub and
nothing else. Check, in order:

1. **Settings > Pages** on `ryankolean/umbo`: the custom domain panel shows any
   certificate error. `gh api repos/ryankolean/umbo/pages` returns
   `https_certificate.state`.
2. The apex must have exactly the four GitHub `A` records and four `AAAA`
   records, and `www` must be a `CNAME` to `ryankolean.github.io`. A leftover
   record from an old host stalls renewal. Run
   `./scripts/porkbun-zone.py --compare-authoritative`.
3. A `CAA` record that does not allow `letsencrypt.org` blocks issuance. The
   zone has none today.

## Quarterly report

A recurring all-day calendar task, **[umbo] Quarterly maintenance report to
Sarah**, lands on the second weekday of January, April, July and October. Its
description lists what to gather. Outages in a quarter (Q4 2026 shown):

```bash
gh issue list --repo ryankolean/umbo --label site-down --state all --search "created:2026-10-01..2026-12-31" --json number,title,createdAt,closedAt
```

No issues means no outage was detected. Uptime for a month is
`100 * (1 - downtime / minutes in the month)`, and the 99.9% target allows
about 43 minutes a month.

## Testing the alert

Run the workflow by hand with `min_cert_days` set above the real figure. The
run fails and opens the issue. Run it again with the default to close it.

```bash
gh workflow run site-health.yml --repo ryankolean/umbo -f min_cert_days=400
gh workflow run site-health.yml --repo ryankolean/umbo
```

Locally, `MIN_CERT_DAYS=400 ./scripts/site-health.py` exits 1 without touching
any issue.
