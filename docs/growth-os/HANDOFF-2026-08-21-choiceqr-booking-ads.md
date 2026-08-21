# Margariteros: ChoiceQR booking signals and fast Google Ads optimization

Date: 21 August 2026.  
Purpose: make the working Google Ads Search campaign optimize for the deepest
honest booking signal available now, without claiming that a click or an open
browser tab is a manager-confirmed booking.

## Owner decisions already made

- Ads are live and should be improved now; do not wait for API access.
- A ChoiceQR booking is confirmed manually by staff. The guest can close the
  page before any confirmation is shown.
- ChoiceQR Open API is acquired through an application and approval process.
  It is a parallel track, not a reason to delay the current client-side work.
- No guest PII may enter GA4, GTM logs, Google Ads, GitHub, or this handoff.

## Primary evidence: ChoiceQR GTM documentation

Source: https://choiceqr.notion.site/Google-Tag-Manager-2fd178865343805f9d28e4a7d5372f08

ChoiceQR documents this client-side event on `/booking`:

```js
window.dataLayer.push({
  event: 'booking_request',
  ecommerce: { bookingDetails: { persons, zone, deposit, duration } }
});
```

Its documented trigger is pressing “Reserve a table”. Therefore:

- `booking_request` means a button press / attempt, not an accepted request;
- it is not a manager confirmation and not a completed visit;
- the existing GTM container currently has no Custom Event trigger or GA4 tag
  for it, so its absence from GA4 Realtime during the earlier test is expected;
- `/order-created` in the same docs belongs to a successful order/payment, not
  to a table booking.

Do not send `persons`, `zone`, `deposit`, or `duration` in the first GA4 tag:
they are unnecessary for a basic count and should be introduced only with a
clear reporting need.

## What was observed in the live separate Chrome window

The agent-created Chrome window is the `разработка` profile, not a claimed
owner tab. It opened `https://margariteros.bar/booking`.

Observed before a reservation was sent:

- the ChoiceQR booking form is live;
- Google tag `G-ZYB0MZ1CSR` and web GTM `GTM-T5F4VVGF` loaded;
- `window.dataLayer` was empty at that point;
- the form states that staff will confirm the reservation later;
- only the non-final `Continue` step was clicked to inspect the form;
- the final “Reserve a table” button was **not** clicked, so this window did
  not create a reservation and there is no post-submit trace yet.

Do not infer from the empty pre-submit `dataLayer` that ChoiceQR fails to emit
`booking_request`: the documented event is expected only on the final action.

## Current event model

| Event | Honest meaning | Advertising role now |
| --- | --- | --- |
| `view_booking` | booking form opened | secondary |
| `reservation_click` | path to booking clicked | secondary |
| `booking_request` | final booking button pressed | secondary; fallback temporary Search signal only if no deeper UI signal is proven |
| `booking_submitted_ui` | the UI shows that the request awaits manual confirmation | preferred temporary Search signal, if a stable DOM signal is proved |
| `booking_confirmation_viewed` | the guest’s still-open page displays confirmation | secondary diagnostic only |
| `reservation_confirmed` | future API evidence that staff actually confirmed | future primary Search signal |

Never use `booking_confirmation_viewed` as a confirmed booking. It disappears
when the guest closes the page and is not a platform-side status record.

## Ads snapshot and recommended execution order

Read-only Google Ads audit found Search and Performance Max on Maximize
conversions. Search currently receives route conversions; `reservation_click`
is Secondary. `booking_request` does not yet exist in Google Ads.

1. Run one real controlled booking in the separate agent Chrome window.
   Capture GTM Preview, `dataLayer`, network request names/statuses, and GA4
   DebugView. Do not save request bodies containing guest details.
2. Prove whether the UI shows a stable non-text DOM marker for “awaiting
   confirmation”. Check one click, validation failure, retry, and refresh so
   that a `Once per page` rule does not hide a valid later attempt.
3. Prepare in GTM, without publishing until separately approved:
   - one Custom Event trigger and GA4 Event tag for `booking_request`;
   - only if Step 2 proves a stable marker, one Element Visibility trigger with
     DOM-change observation for `booking_submitted_ui`.
4. Verify exactly one GA4 request for the intended action. Do not create a
   Custom HTML observer if GTM’s native visibility trigger is sufficient.
5. Publish only after owner approval, import the selected signal to Google Ads
   as Secondary first, and verify incoming conversions.
6. Create a Search-only Custom Goal containing only the chosen temporary
   signal. Remove routes and other micro-actions from Search bidding. Leave
   Performance Max unchanged.
7. Keep that objective and bid strategy stable for 7–14 days after the change
   before judging or changing it again.

## API track: facts and boundary

Public docs: https://open-api.choiceqr.com/docs#/content/webhooks

- Booking REST methods are documented: list/get, confirm, cancel.
- Booking statuses include `CREATED`, `CONFIRMED`, `IN_PROGRESS`,
  `COMPLETED`, `NOT_CAME`, and `CANCELLED`.
- The documented webhook list contains order events, not `booking.*` events.
  Do not promise booking webhooks.
- Registration requires an invitation URL requested from `api@choiceqr.com`.
  Creating an application then requires a callback URL and an irreversible
  application type (Plugin, POS terminal, or Delivery integration).

Do not create that application until its type and callback hosting are agreed.
After access is approved, first do a read-only contract check: available
attribution fields, status update timing, pagination, rate limits, and whether
the account actually sees Margariteros bookings. The future bridge must use a
technical booking ID and idempotency; it must never relay the `customer` object
to GA4 or Ads.

## Next concrete action

Use the already-open separate Chrome window for one controlled final submission
only after the owner confirms the real reservation creation at action time.
The agent then records the event and UI transition, not personal data. This is
the only missing evidence before preparing the GTM draft and Search goal.
