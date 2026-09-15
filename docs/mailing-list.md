# Umbo mailing list: runbook

Who this is for: Sarah, and whoever picks this up after her.

The list lives at **Kit** (kit.com), on the free Newsletter plan. It does not
live in a spreadsheet, and it does not live in anyone's inbox. When someone
signs up on eatumbo.com the address goes straight to Kit, so the list is never
out of date and there is nothing to sync.

Full reasoning for the provider choice is in
[docs/proposals/mailing-list.md](proposals/mailing-list.md).

## The facts

| Thing | Where |
|---|---|
| Provider | Kit, free Newsletter plan, $0/mo |
| Account owner | sarah@eatumbo.com |
| Login | shared, in the password manager. One login, held by Sarah and Ryan |
| Signup form | the "Join the mailing list" block on eatumbo.com |
| Legacy subscribers | 1,123, imported from the Squarespace export, tagged `legacy-squarespace` |
| Consent record | the archived `Umbo Contacts` sheet in Drive, timestamps 2025-06-03 onward |
| Subscriber cap | 10,000 before anything costs money |

## Sending a blast

1. Log in to Kit.
2. Broadcasts, then New.
3. Write it. Subject line first, it is most of whether anyone opens it.
4. Preview, then send a test to yourself and actually read it.
5. Send.

Kit adds the unsubscribe link and the physical address to the footer of every
broadcast on its own. Do not remove them. US law (CAN-SPAM) requires both on
promotional email, and Kit handling it is the main reason the list is here
rather than in an inbox.

**On the first send to the legacy 1,123**, put a line near the top saying why
they are hearing from you: "You are getting this because you signed up for
Umbo's list." The newest of those addresses is months old and the oldest is
over a year old. That line measurably reduces spam complaints. Expect 3 to 8
percent hard bounces on a list that age. Kit suppresses them automatically.

## Unsubscribes

Handled entirely by Kit. Someone clicks the link, Kit stops sending to them,
and Kit blocks any attempt to re-add them. Nobody needs to do anything by hand,
and nobody should try to re-add a person who left.

## Adding people by hand

Kit's Subscribers screen takes single additions and CSV imports. Only add
people who actually asked. A list with addresses on it that never opted in is
the one way this arrangement becomes a legal problem.

## The archived spreadsheet

`Umbo Contacts (ARCHIVE, pre-Kit, do not edit)` in Drive is a consent record,
not a working list. Editing it does nothing. Signups have not flowed through
it since the import.

## Leaving Kit

The list is portable and this is worth knowing before it matters. Kit's
Subscribers screen exports the whole list to CSV. Any other provider imports
that CSV. On the site, one line changes: the `action` URL on the form in
`index.html`, plus the email field name if the new provider uses something
other than `email_address`. The JS handler in `assets/js/main.js` posts
whatever the form contains, so it does not care who the provider is.

Take a CSV export to Drive once a quarter. Mailchimp and MailerLite both cut
their free tiers in 2026; Kit could too, and an export means that is an
afternoon rather than a crisis.

## If the form stops working

The signup form fails safe. If the provider form id is missing or wrong, the
form does not silently swallow addresses; it tells the visitor to email
sarah@eatumbo.com instead. So "signups stopped arriving" means check, in order:

1. Is the `action` URL on the form in `index.html` still a real Kit form?
   It should be `https://app.kit.com/forms/9922392/subscriptions`. Note the
   host: older ConvertKit-era documentation and Kit's own React library still
   say `app.convertkit.com`, but the HTML embed this account generates uses
   `app.kit.com`. Always copy the action out of Kit's own embed rather than
   from a guide, because the guides are behind.
2. Does Kit still list that form under Grow, then Landing Pages & Forms?
3. Is the email input still named `email_address`? Kit requires that exact
   name, and the wrong name makes the form look like it worked while Kit
   records nothing.

## Known unknown, settle this on the first live signup

The handler in `main.js` posts with `fetch` so the visitor stays on
eatumbo.com. Whether Kit's endpoint returns the cross-origin headers that
requires has not been tested against a real form, because the form id did not
exist when this was written.

The first real signup settles it, and both outcomes are fine:

* **It works.** The visitor sees "Almost there" without leaving the site.
* **The browser blocks reading the response.** The subscriber still reaches
  Kit, because the request is sent either way, but the page shows "Something
  went wrong. Email sarah@eatumbo.com to sign up." That message would be
  wrong, not the signup.

So check Kit after the first test signup **before** believing an error
message. If the subscriber is there but the page said it failed, the fix is a
one-line change in `main.js`: drop the response check, or let the form fall
through to its native POST.
