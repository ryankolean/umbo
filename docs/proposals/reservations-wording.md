# Proposal (STUB): improve reservations wording & the "how to reserve" flow

> Status: **stub for exploration** — not a final spec. Opens the conversation;
> nothing here is committed to shipping yet.

## Goal
Make it obvious, warm, and fast for a guest to understand **how to get a table**
at Umbo — and reduce friction / confusion in the current copy.

## Current state (as of this branch)
Reservations live in two places, with slightly different copy:

- **visit.html** — a "We do things the analog way" block:
  > "Reservations are by phone only — give us a ring and a real person picks up.
  > No apps, no online booking… 25 seats at the bar, no tables… parties of two to
  > eight… we always hold at least a third of the bar for walk-ins…"
- **menu.html** — a compact `reserve-band`:
  > "We're tiny — 25 seats, indoor bar seating only… Reservations by phone for
  > parties of 2–8… we always hold at least a third of our seats for walk-ins on a
  > first-come waitlist… Carryout case-by-case — just call." + "No online booking —
  > we're going analog."

Related change already in flight: **PR #9** switches the primary channel from
*call* to *text* (all CTAs, links, and FAQ). This proposal should build on that.

## Problems to solve
1. **Two sources of truth.** visit.html and menu.html describe the same policy in
   different words — they drift. Consider one canonical block + a short pointer.
2. **"Analog way" vs texting.** The headline "We do things the analog way" and
   "we're going analog" now sit next to a *text-first* CTA. Decide the framing:
   keep "analog" (human, no-app) or refresh to something text-native.
3. **The actual steps aren't a scannable list.** It's one dense paragraph. A guest
   skimming on a phone can't quickly answer: *How do I reserve? What size party?
   What if it's just two of us? Can I walk in?*
4. **Walk-in vs reservation expectations** are buried. The "we hold a third of the
   bar for walk-ins" promise is a selling point — surface it.
5. **Group size & carryout** rules are easy to miss.

## Directions to consider (pick / mix later)
- **A short numbered "How to reserve" list** (3 steps: Text the number → tell us
  day, time, party size → we confirm), plus a one-line walk-in note.
- **One canonical reservations block** rendered on visit.html, with menu.html's
  band trimmed to a headline + "See how to reserve →" link.
- **Tone pass** to reconcile "analog" with text-first (e.g. "Skip the app. Just
  text us.").
- **Micro-FAQ inline** ("Just the two of us?" / "Big group?" / "Can we walk in?")
  — could reuse the FAQ styling already on visit.html.

## Open questions for Ryan / Umbo
- [ ] Keep the "analog" brand framing, or move fully to "text us"?
- [ ] Do they still take **phone calls** at all, or text-only now?
- [ ] Any parties **larger than 8** — do those route to Events, or a different ask?
- [ ] Is there a **response-time** expectation to set ("we reply within the hour
      during service")?
- [ ] Same copy on both pages, or canonical-on-visit + pointer-on-menu?

## Out of scope
The booking *mechanism* itself (a real reservation system) is tracked separately —
see `docs/proposals/reservation-system.md`. This doc is **wording & layout only**.

## Next step
Answer the open questions, then turn the chosen direction into a copy + markup
change on visit.html (and a trim on menu.html).
