# Proposal (STUB): a reservation system for Umbo

> Status: **stub for exploration** — not a spec, not a decision. Purpose is to
> frame the fork so we can choose a direction before building anything.

## The fork
Two very different bets. Same starting problem, wildly different scope.

1. **Lightweight** — a small, Umbo-only booking capture that fits the current
   static site and the text-first ethos. Days of work.
2. **Standalone product** — a multi-tenant SaaS we could sell to other small,
   reservation-shy restaurants. Months of work + a business.

They aren't mutually exclusive: the lightweight version is a plausible **seed**
for the product. Build small, see if it's loved, then decide whether to
generalize.

---

## Context that shapes this
- The site is **static** (GitHub Pages → moving to `eatumbo.com`), no backend yet.
- Umbo is deliberately **anti-app / anti-online-booking** ("we're going analog")
  and is pivoting to **text-first** contact (PR #9).
- The room is **tiny**: 25 bar seats, no tables, parties of 2–8, and a third held
  for walk-ins. This is *not* a high-volume OpenTable use case.
- Cloudflare tooling is already in the toolbox (Workers, D1, KV, Email) and the
  domain is moving — a Worker + D1 is a cheap, native backend option.

The interesting implication: Umbo's actual need may be **"structured text
requests + a shared inbox"**, not a classic reservation grid.

---

## Option A — Lightweight (Umbo-only)
**Goal:** capture reservation *requests* reliably and let staff confirm them,
without betraying the analog brand.

Possible shapes (pick one):
- **A1. Structured request form** → a Cloudflare Worker writes to **D1**, emails
  staff, and shows the guest "we'll text you to confirm." Human confirms. No
  real-time availability, no calendar — just a clean request pipeline.
- **A2. Text-native** → keep the `sms:` CTA (already shipped) but pre-fill a
  templated message ("Table for __ on __ at __") so guests send a complete
  request in one tap. Zero backend. Staff manage in their phone.
- **A3. Waitlist board** → a tiny staff-only page (Worker + D1) to jot walk-ins
  and hold times during service.

**Effort:** A2 ≈ hours (copy + `sms:?&body=`); A1/A3 ≈ 2–4 days.
**Pros:** on-brand, cheap, no per-cover fees, owns the data.
**Cons:** no availability logic; manual confirms; doesn't scale past one room.

## Option B — Standalone product (sellable)
**Goal:** a SaaS for small, text-first restaurants that hate OpenTable/Resy fees
and vibe.

**Positioning:** "Reservations for restaurants that don't want a reservation
system." Text-first, flat monthly price, no per-cover cut, no diner app.

**Core scope (MVP):** multi-tenant accounts, per-venue settings (seats, party
limits, walk-in hold %), a request→confirm flow over SMS (Twilio/CF), a staff
console, and an embeddable widget/link for each venue's site.

**Effort:** months, plus real product surface — billing, auth, SMS deliverability,
support, onboarding.
**Pros:** recurring revenue; Umbo becomes customer zero + reference; genuine gap
for the "anti-Resy" niche.
**Cons:** it's a company, not a feature. SMS compliance (A2P 10DLC), on-call,
churn. Distracts from the restaurant. Crowded-adjacent market.

---

## How to decide (suggested)
1. Ship **A2** now (nearly free, on-brand) and instrument it — how many text
   requests actually come in? What do guests ask?
2. If volume/pain justifies it, build **A1** (Worker + D1) so requests are
   captured + trackable. This is the seed.
3. Only consider **B** if (a) A1 is genuinely loved in-house *and* (b) 2–3 other
   restaurants say "we'd pay for that." Validate demand before generalizing.

Recommendation: **start lightweight (A2 → A1); treat the product as an option we
earn**, not the opening move.

## Open questions for Ryan
- [ ] Is the near-term need **Umbo-only**, or is the product the actual goal?
- [ ] Appetite to run a SaaS (support, SMS compliance, billing) — or keep it a
      restaurant?
- [ ] Cloudflare (Workers/D1/Email + Twilio for SMS) as the stack, given the move?
- [ ] Budget/fee stance — is avoiding per-cover fees a hard requirement?
- [ ] Who staffs confirmations, and on what device?

## Suggested next step
Green-light **A2** (tap-to-text with a pre-filled request) as a tiny follow-up PR,
and spike **A1** (Worker + D1 request store) behind it. Leave B as a documented
option, revisited only after A1 has real usage.

## Not included here
No code yet — this is the concept stub. A1/A2 would each become their own
implementation PR once a direction is picked.
