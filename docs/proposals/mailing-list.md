# Umbo mailing list: implementation plan

One PR that closes **SUMMIT-149** ("Umbo: move the mailing list to a real
provider") and answers Sarah's 2026-09-13 email ("We had a mailing list with
squarespace - can we add that to the new site?").

Status: **proposal, awaiting review.** Nothing below has been built.

---

## 1. What we actually have

**The list.** `Umbo Contacts`, a Google Sheet owned by sarah@eatumbo.com,
shared 2026-09-13. It is a Squarespace form export.

| Fact | Value |
|---|---|
| Data rows | 831 |
| Parseable emails | 830 |
| **Unique addresses** | **748** |
| Duplicate rows | 82 (70 addresses repeat) |
| Malformed | 1 (`REDACTED@ExampleLaw.com,.com,`) |
| Email cells with a trailing comma | 825 of 831 |
| Rows missing a name | 0 |
| Date range | 2025-06-03 → 2026-03-30 |
| Implied growth | ~83 signups/month while the form was live |

Top domains: gmail 544, yahoo 51, hotmail 29, aol 20, icloud 20, comcast 19.
Consumer addresses, a real patron list, not scraped.

**The site.** Static HTML on GitHub Pages at `eatumbo.com`. No build step, no
backend, no npm. `index.html` has a NEWSLETTER section whose CTA is a `mailto:`
placed in f8e9d6b as an admitted stopgap. The form CSS and the JS submit
handler were deleted in that same commit and need restoring.

**The repo is public.** `github.com/ryankolean/umbo`, visibility PUBLIC. No
contact data may ever be committed.

---

## 2. Provider decision

SUMMIT-149 proposed Buttondown, Kit, or Mailchimp. That ticket was written
before anyone counted the list. **At 748 subscribers, two of the three
candidates are disqualified on the no-cost constraint**, and 2026 tier cuts
took out a third option:

| Provider | Free subscriber cap | Free sends | Free users | 748 subs? |
|---|---|---|---|---|
| Buttondown | 100 | unlimited | 1 | ✗ |
| Mailchimp | 250 (cut 2026-02-17) | 500/mo | 1 | ✗ |
| MailerLite | 250 (cut 2026-07-01) | 2,500/mo | 1 | ✗ |
| Zoho Campaigns | 2,000 | 6,000/mo | **5** | ✓ |
| beehiiv | 2,500 | unlimited | 1 | ✓ |
| EmailOctopus | 2,500 | 10,000/mo | 1 | ✓ |
| Sender.net | 2,500 | 15,000/mo | 1 | ✓ |
| **Kit** (ex-ConvertKit) | **10,000** | **unlimited broadcasts** | 1 | **✓** |

Surveyed across five rounds 2026-09-13; see §2.1 for the ones that lost and why.

### Pick: Kit, free "Newsletter" plan

- 10,000 subscriber cap. At the historical 83/month rate that is ~9 years of
  headroom. We never trip into a paid plan by accident.
- Unlimited broadcasts and unlimited opt-in forms on the free tier.
- Unsubscribe handling, suppression lists, and bounce handling are built in,
  which is the whole compliance problem, solved by the provider.
- **No DNS changes required.** Kit sends from its own infrastructure on the
  free tier. Given that the eatumbo.com zone caused a seven-hour outage on
  2026-09-13, a plan that does not touch MX, SPF, or DKIM is worth a lot.

Accepted trade-offs, all reversible by upgrading later:

- Kit branding appears in sent emails on the free plan.
- No email sequences / automations. We do not need them; Sarah writes a
  broadcast and sends it.
- **One user.** Team seats are paid-only across every provider we looked at.

### 2.1 The rest of the field

Five research rounds covering flat free tiers, usage-based pricing,
discounts, hospitality-specific tools, and self-hosting. Nothing found beats
Kit for *this* shape of problem, 748 subscribers, one sender, $0, but two
findings change the fallback plan, below.

**Disqualified on the 748-subscriber floor:** Buttondown (100), Mailchimp
(250), MailerLite (250).

**Viable but less headroom than Kit:** beehiiv (2,500 subs, unlimited sends,
free custom domain, a genuinely good product, but a newsletter-publishing
frame rather than a restaurant list, and its paid tier jumps to $43/mo),
EmailOctopus (2,500), Sender.net (2,500).

**Different pricing axis, priced by sends, not list size:**

- *Brevo*: ~unlimited stored contacts, but **300 emails/day** free. One blast
  to 748 people takes three days of arbitrary list-splitting. Rejected for the
  blast use case, which is the entire use case.
- *Amazon SES*: $0.10 per 1,000 emails, so a blast costs about **$0.075**.
  Effectively free, but SES is raw sending infrastructure, no list
  management, no signup form, no unsubscribe UI, no bounce dashboard. We would
  own CAN-SPAM compliance ourselves. Rejected on simplicity, not cost.
- *Elastic Email*: 100 emails/day free, same problem as Brevo, worse.

**Self-hosted (Listmonk + SES on a VPS):** $8–30/mo for hosting plus an
ops burden, server upkeep, SMTP relay config, deliverability monitoring.
Fails both the no-cost and the simplicity constraints. Rejected.

**Hospitality-specific:** SevenRooms and SpotOn tie email to reservations and
POS data, the right answer for a restaurant with either, which Umbo does not
have (reservations are by text). Flodesk is $35/mo flat. All paid. Rejected.

**Substack** is genuinely $0 at any list size, it only takes 10% of paid
subscriptions, and Umbo has none. Rejected on fit: it is a publishing network
that pushes readers into Substack's app and social graph. Wrong frame for a
restaurant's menu-and-events list.

### Seats: decided 2026-09-13

The free plan allows a single user. Confirmed pricing at this list size:

| Kit plan | Users | Cost |
|---|---|---|
| Free | **1** | $0 |
| Creator | 2 | $33/mo annual ($390/yr) |
| Creator Pro | unlimited | $66/mo annual ($790/yr) |

**Decision: stay free, one shared login**, held by Sarah and Ryan in a shared
password manager. Accepted cost: no audit trail of who sent what, and no
per-person revocation. With two known holders and no staff access, that is
proportionate.

Worth recording for whoever revisits this: *the moment we pay for anything,
Kit stops being the right answer.* See §2.2, Sender.net does branding removal
and three seats for $6.30/mo, a fifth of Kit's price. Kit's advantage is
entirely in its free tier's headroom, which stops mattering once there is a
bill.

The only way to get real seats at **$0** is **Zoho Campaigns**: 5 users free,
but 2,000 contacts (~15 months of headroom at current growth) and 6,000
emails/month. Not worth switching for, given seats were ruled out as a
day-one need, but it is the answer if that ever reverses and the budget is
still zero.

### 2.2 If we ever pay: do not pay Kit

Both open upgrade paths cost far less elsewhere. Verified 2026-09-13:

| Option | Removes branding | Seats | Cost at ~750 subs |
|---|---|---|---|
| **Sender.net Standard** | **yes** | **3** | **$6.30/mo** ($75.60/yr) |
| Zoho Campaigns Standard | yes | 5+ | ~$3–5/mo |
| Kit Creator | yes | 2 | $33/mo ($390/yr) |
| beehiiv Scale | no (Max only) | - | $43/mo |

Sender.net is **5× cheaper than Kit for strictly more**, branding gone plus
three role-based seats instead of two. Migration cost is unchanged from what
is already documented: export CSV, import CSV, change one form `action` URL.

Runner-up is EmailOctopus (2,500 subs / 10,000 emails per month). Kit wins on
headroom: EmailOctopus would need revisiting in roughly 21 months.

**Exit plan, so this is not a lock-in:** the subscriber list exports to CSV
from Kit at any time, and the site's dependency on Kit is a single form
`action` URL. Swapping providers is a one-line change plus an import. We
export a CSV backup to Drive quarterly regardless.

---

## 3. Design

Three moving parts. Deliberately no fourth.

```
  Visitor on eatumbo.com
        │  form POST (progressive enhancement; native POST if JS is off)
        ▼
  ┌───────────┐        ┌──────────────────────────┐
  │    Kit    │◀───────│  one-time CSV import     │
  │ (the list)│        │  748 legacy subscribers  │
  └─────┬─────┘        └──────────────────────────┘
        │  Sarah logs in → Broadcasts → New → Send
        ▼
     Patrons          (unsubscribe link handled by Kit, automatically)
```

**The reason this shape is right:** because signups land in Kit directly,
*there is no sync step*. The list is never stale, so "get the list current
before a blast" is not a task anyone has to perform. It is the requirement
dissolved rather than satisfied.

### Explicitly rejected

| Option | Why not |
|---|---|
| Google Sheet stays the source of truth, synced to the provider | Adds a sync step that will silently drift. Directly defeats the "always current" requirement. |
| Apps Script / Forms writing to a sheet | A backend to maintain, plus we would own unsubscribe compliance ourselves. |
| Self-hosted (Listmonk on a VPS) | Not free, and someone has to run it. |
| Keeping the `mailto:` and adding people by hand | No unsubscribe path. This is the thing we are fixing. |

---

## 4. Changes in the PR

Small. Roughly 40 lines of site code, one script, one doc.

| File | Change |
|---|---|
| `index.html` | Replace the `mailto:` CTA in the NEWSLETTER block (currently line 123) with a real `<form>` posting to Kit. |
| `assets/css/style.css` | Restore `.newsletter form`, `.newsletter input`, `.newsletter__status`, effectively reverting f8e9d6b's CSS deletion, keeping the dark-section treatment. |
| `assets/js/main.js` | Restore the submit handler, pointed at Kit: honeypot check, inline status text, disabled button during submit. |
| `scripts/normalize-contacts.py` | **New.** Squarespace export CSV → clean Kit import CSV. |
| `.gitignore` | Add `*.csv` and `contacts*` so subscriber data can never be committed to a public repo. |
| `docs/mailing-list.md` | **New.** Runbook: where the list lives, how Sarah sends a blast, how unsubscribe works, how to leave Kit. |
| `ROADMAP.md` | Tick "Newsletter signup wiring (currently 'coming soon-ish')" in §5. |

Untouched: `events.html` has uncommitted in-flight edits from other work. This
PR branches off `master` and does not go near it.

### The form markup

A real form element with a real `action`, so it works with JavaScript disabled
(native POST to Kit's hosted confirmation page). The JS intercepts it only to
keep the visitor on eatumbo.com and show inline status. The previous
implementation had no such fallback.

```html
<form data-newsletter action="https://app.kit.com/forms/FORM_ID/subscriptions" method="post">
  <label class="sr-only" for="nl-email">Email address</label>
  <input id="nl-email" type="email" name="email_address" placeholder="you@email.com" required autocomplete="email">
  <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" hidden>
  <button class="btn btn--coral" type="submit">Join <span class="btn__arrow">&rarr;</span></button>
  <p class="newsletter__status" role="status" hidden></p>
</form>
<p class="muted newsletter__fine">Menus and events only. Unsubscribe anytime.</p>
```

Kit requires the email field to be named `email_address`. Getting this wrong
makes the form appear to succeed while Kit records nothing, worth a test.

### The normalizer

`scripts/normalize-contacts.py` reads the Squarespace export and writes a Kit
import CSV. Rules, each traceable to something in the real data:

1. Strip the trailing comma present on 825 of 831 email cells.
2. Lowercase and trim; validate against an email regex.
3. Repair `REDACTED@ExampleLaw.com,.com,` → `redacted@examplelaw.com`.
4. Dedupe on the lowercased address, **first occurrence wins**, that
   preserves the earliest submission timestamp, which is the consent date.
5. Emit `email_address,first_name,signup_date`.
6. **Report every dropped and repaired row to stdout.** No silent data loss.
7. Default output path is outside the repo (`~/umbo-mailing-list/`). The
   script refuses to write inside the working tree.

Expected output: **748 rows.**

> **Do not feed the script a copy-paste of the sheet.** Reading that sheet
> through a markdown converter mangles addresses, `first_last@hotmail.com`
> comes back as `first\_last@hotmail.com`. Use Google Sheets →
> File → Download → Comma Separated Values, nothing else.

---

## 5. Execution order

**Phase 0, account (before any code).**

1. Create the Kit account under **sarah@eatumbo.com**, not a personal address.
   The list is Umbo's asset; Sarah must not need Ryan to reach it. Credentials
   into the shared password manager, held by Sarah and Ryan, that is the only
   login, so it is shared rather than seated.
2. Set the physical address in Kit to **430 E. Front Street, Traverse City, MI
   49686**. CAN-SPAM requires it in every send; Kit puts it in the footer.
3. Turn **double opt-in on** for new form signups.
4. Create the opt-in form, note its `FORM_ID`.
5. Import 5 rows as a test. Confirm they land, confirm the column mapping,
   confirm they are not sent a confirmation email. Only then proceed.

**Phase 1, data.**

6. Download the sheet as CSV.
7. Run `scripts/normalize-contacts.py`, read its report, confirm 748 rows.
8. Import to Kit with the tag `legacy-squarespace`. Import as already
   confirmed, these people opted in on the old site and we hold the
   timestamps. Do **not** send them a re-confirmation; re-permission campaigns
   typically lose 90% of a list, and it is not required here.
9. Rename the sheet to `Umbo Contacts (ARCHIVE, pre-Kit, do not edit)` and
   put a note in the first row. It is now a consent record, not a working
   list. Left in Drive; never committed.

**Phase 2, site.**

10. Make the seven file changes above.
11. Verify at 375 / 768 / 1280 on the dark section; console clean.
12. Merge and deploy.

**Phase 3, verify on the live site.**

13. Sign up from eatumbo.com with a real address. Confirmation email arrives,
    link works, subscriber appears in Kit tagged as a site signup.
14. Unsubscribe from that email. Confirm it is honored in Kit.
15. Submit with JS disabled once, confirm the native POST fallback works.
16. Send Sarah the runbook and walk them through one broadcast.

**First real send:** include a provenance line near the top, "You're getting
this because you signed up for Umbo's list." The newest address on the list is
5½ months old and the oldest is 15 months; that line meaningfully reduces spam
complaints. Expect 3–8% hard bounces on a list this age. Kit suppresses them.

---

## 6. Acceptance criteria

- [ ] 748 subscribers in Kit, tagged `legacy-squarespace`; zero PII in the repo
- [ ] A signup from the live site reaches Kit, with double opt-in working
- [ ] The unsubscribe link in a real send works end to end
- [ ] The form submits with JavaScript disabled
- [ ] Physical address appears in the footer of a test broadcast
- [ ] Section renders correctly on dark at 375 / 768 / 1280; no console errors
- [ ] Sarah can log in and send a broadcast without involving Ryan
- [ ] Monthly cost: **$0**

---

## 7. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Kit flags a new account importing 748 addresses | Medium | Test import first. Have the consent evidence ready: Squarespace export with per-row timestamps, 2025-06-03 onward. |
| Kit cuts its free tier, as Mailchimp and MailerLite both did in 2026 | Low near-term | Quarterly CSV export to Drive. Migration is one `action` URL plus an import. |
| First send to a 15-month-cold list hits spam folders | Medium | Provenance line, clear subject, no attachments. Watch the complaint rate on send one. |
| Sarah keeps editing the archived sheet, thinking it feeds the list | Medium | Rename it, note in row 1, cover it in the runbook. |
| Kit branding on free-tier emails is unacceptable to Sarah | Unknown | Their call. $39/mo removes it; nothing else changes. |
| Form bots | Low | Honeypot retained, plus double opt-in and Kit's own spam protection. |
| Shared login, no audit trail, no per-person revocation | Accepted | Only two holders, both known, no staff access. Revisit if anyone else needs in; see Seats above. |

---

## 8. Decisions

1. ~~**Kit account owner**~~, **resolved 2026-09-13.** One free-tier login
   under sarah@eatumbo.com, shared with Ryan. No paid seats.
2. **Kit branding in emails**, still open. The free tier puts Kit branding in
   every send. Sarah's call whether that is acceptable on a restaurant
   newsletter.

   **If Sarah says no, do not upgrade Kit.** Build on Sender.net instead:
   $6.30/mo removes the branding and adds three seats, against $33/mo at Kit
   for two. Every other provider we surveyed is worse on one axis or both
   (§2.2). The site-side code is identical either way, a different form
   `action` URL and a different field name, so this can be decided after the
   normalizer and the markup are written.

Decision 2 does not block writing the code, but it blocks the first send.

## 9. Out of scope

Signup in the site footer on every page (homepage only for now); a privacy
policy page; welcome automation; per-item segmentation. Each is a follow-up
ticket if wanted.

---

## Appendix A: full provider survey

Comprehensive sweep, 2026-09-13. Every option evaluated against the actual
constraints: **748 subscribers growing ~83/month, one sender, $0, embeddable
on a static site with no build step, provider-handled unsubscribe.**

Rows marked **[v]** were read from the vendor's own pricing page. Everything
else is third-party and should be re-checked before it is relied on, with
good reason: roundups repeatedly claimed Selzy's free plan carries 1,000
contacts, and Selzy's own page says **100 contacts / 1,000 emails a month**.
Assume any unverified number here is optimistic.

### A.1 Hosted ESPs: free tier fits 748

| Provider | Subs | Sends | Users | Notes |
|---|---|---|---|---|
| **Kit** **[v]** | **10,000** | unlimited | 1 | Chosen. 4× the headroom of anything else. |
| Sender.net **[v]** | 2,500 | 15,000/mo | 1 | Best cheap upgrade path, see §2.2. |
| beehiiv **[v]** | 2,500 | unlimited | 1 | Free custom domain. Paid jumps to $43/mo. |
| EmailOctopus **[v]** | 2,500 | 10,000/mo | 1 | Plain, reliable, no frills. |
| Zoho Campaigns **[v]** | 2,000 | 6,000/mo | **5** | Only free plan with real seats. Deliverability caveat below. |
| Brevo | ~100,000 | **300/day** | 1 | Priced by sends, not list size. |
| Mailercloud | 1,000 | 12,000/mo | ? | Cheapest paid tier found (~$3/mo). Unvetted. |
| HubSpot | 1,000 | 2,000/mo | **2** | Full CRM attached. ~3 months of headroom. |
| Loops | 1,000 | 4,000/30d | ? | Paid jumps to $49/mo. |
| MailPoet | 1,000 | 5,000/mo | - | **Requires WordPress.** Not applicable. |

### A.2 Hosted ESPs: free tier too small for 748

Benchmark (500) · Mailchimp (250) · MailerLite (250) · Omnisend (250) ·
CleverReach (250) · Buttondown (100) · Selzy (100) **[v]** · Mailtrap (100) ·
MailerSend (500 emails/mo) · Postmark (100 emails/mo) · Resend (100/day).

Every one of these would require paying on day one.

### A.3 Usage-based / pay-per-email

| Option | Cost per 748-person blast | Verdict |
|---|---|---|
| Amazon SES | **~$0.075** | Cheapest sending on earth, but raw infrastructure: no list, no form, no unsubscribe UI, no bounce dashboard. We would own CAN-SPAM ourselves. |
| Elastic Email | ~$0.075 | Free tier is 100/day, cannot send one blast. |
| SendPulse | free to 12,000/mo | Viable; no advantage over Kit. |
| Shopify Email | 10,000 free/mo | **Requires a Shopify store ($39/mo).** N/A. |
| Mailjet | ~$50–95 per 100k | No free path at this size. |

Usage-based pricing is genuinely attractive on cost and genuinely wrong on
fit. The bill is rounding error; the compliance and list-management work it
hands back to us is the entire job.

### A.4 Self-hosted / open source

Listmonk (Go + Postgres, single binary) · Mautic (full LAMP stack, 1–2 GB RAM)
· phpList · Keila (AGPL, Elixir) · Mailtrain (Node), all free software.
Mailcoach (Laravel, bring-your-own-ESP) and Sendy ($69 one-time + SES) and
Broadcast ($250 one-time) are commercial licenses.

All of them cost **$5–30/month in hosting** plus ongoing ops: server upkeep,
SMTP relay configuration, deliverability monitoring, and bounce handling that
a hosted ESP does for you. Fails the no-cost constraint and fails the
simplicity constraint harder. Rejected.

### A.5 Platform-bundled

| Option | Cost | Verdict |
|---|---|---|
| Squarespace Email Campaigns | from $8/mo | Where the list came from. Paid, and we have left Squarespace. |
| Wix | 200 emails/mo free | Wrong platform, unusable limit. |
| Ghost | self-host free + Mailgun, or Ghost Pro | Would mean rebuilding the site as Ghost. |
| MailPoet | free to 1,000 | Requires WordPress. |

Umbo is static HTML on GitHub Pages with no build step. Every bundled option
implies adopting a different site platform, which is a far larger change than
the problem justifies.

### A.6 Restaurant / hospitality vertical

| Platform | Cost |
|---|---|
| Toast Marketing | $75–175/mo add-on |
| BentoBox | $119–479/mo + $0.99/order |
| Popmenu | $179–499/mo |
| SevenRooms / SpotOn / Thanx / Owner.com | quote-based, all paid |
| Flodesk | $35/mo flat, unlimited subscribers |

These tie email to POS and reservation data, the correct answer for a
restaurant that has either. **Umbo takes reservations by text and has no
integrated POS data to join against**, so the entire premium buys nothing
here. Rejected on both cost and fit.

### A.7 Newsletter-publishing platforms

**Substack** is truly $0 at any list size, it takes 10% of paid
subscriptions, and Umbo has none. Rejected on fit: it is a publishing network
that pushes readers into Substack's app and social graph, and puts Umbo's
patron list inside someone else's discovery product. Wrong frame for a
menus-and-events list. beehiiv and Ghost share the newsletter-publication
framing to a lesser degree.

### A.8 What the survey changes

Nothing about the recommendation. **Kit remains the pick**, no free tier
found comes within 4× of its 10,000-subscriber headroom, and it is one of the
few with unlimited sends. Three things worth carrying forward:

1. **Zoho's 5 free seats cost inbox placement.** Independent tests put Zoho
   Campaigns at 80–88% inbox placement, behind Mailchimp and MailerLite.
   For a list this size the seats are not worth the deliverability.
2. **Mailercloud claims the cheapest paid tier found (~$3/mo, 5,000
   contacts).** Unvetted and low-profile; if the branding decision ever makes
   us pay, Sender.net at $6.30/mo is the better-evidenced choice.
3. **HubSpot free gives 2 seats** with a CRM attached, but 1,000 marketing
   contacts is roughly three months of headroom at current growth. Not viable
   as a destination.

### A.9 Build-critical confirmations

Two things the plan previously flagged as "verify during setup" are now
confirmed for Kit's free plan:

- **CSV import works on free.** Subscribers → Import Subscribers → upload.
  Email is the only required column; First Name, tags, and custom fields map
  optionally.
- **The import action can be set to "Add without confirming"**, which is
  exactly what the 748 legacy subscribers need, they already opted in, and
  this avoids re-confirming them.
- **Double opt-in is Kit's default** for new form signups, which is what we
  want for the public form.

The Phase 0 test import still stands as a check on our data, not on Kit.

