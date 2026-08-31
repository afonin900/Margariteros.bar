# Live ChoiceQR interaction contract

Source: `https://qr.margariteros.bar/`, captured read-only on 2026-08-26. The structured inventory is `interactions.json`.

## What must be copied literally

- The sticky ChoiceQR header has a logo-home link, one language button with a searchable popover, a profile link, and a hamburger. The hamburger opens a scroll-locking account/contact drawer and closes via the same control; Escape did not close it in the observed browser session.
- Primary navigation goes to ChoiceQR's same-origin routes: `/`, `/section:menu`, `/booking`, `/delivery-areas`, and `/feedback`. A seamless first-party landing must forward to these exact destinations, rather than substitute a different booking host or a local contact anchor.
- Main card actions are a Google Maps `_blank` link, a `tel:` link, and the same-origin `/booking` CTA.
- In **true Android Chrome emulation** matching the owner's 597×1280-pixel capture (398×853 CSS px, DPR 1.5, mobile/touch/Android UA), the phone markup is a separate ChoiceQR template. It has a 64px logo, Language, Search, Profile and Menu controls — not the desktop navigation. The gallery is **three columns**: 20 static images, 119.33px square tiles, 4px gap. The footer has a two-column social grid and the map/directions/legal/vendor controls described in `interactions.json`.
- All external social/review and map links open in a new tab. Exact URLs and `target` values are in the JSON.
- The live selector lists English, Polish and Russian as human translations; Spanish is a machine translation. It changes ChoiceQR's in-place vendor locale, rather than exposing `/pl/`, `/en/`, `/ru/`, `/es/` URLs.

## Factual gaps in current `https://new.margariteros.bar/pl/`

1. Header behavior differs: staging exposes four static locale links and direct menu/booking icons; live ChoiceQR exposes a popover selector, profile link and working hamburger drawer.
2. Routes differ: staging sends menu to QR home and booking to `margariteroswwa.choiceqr.com/booking`; live uses QR's `/section:menu` and `/booking`. Staging replaces live delivery and feedback routes with an internal contact anchor.
3. The staging footer omits the ChoiceQR email, Google review, TripAdvisor, legal pages, ChoiceQR attribution and the embedded map. Its external links also do not reproduce the live `target="_blank"` contract or the exact Instagram/TikTok URLs.
4. Live uses a map link in the main card, footer map/directions button and phone/email protocol links. The staging contact surface is not the same interaction set.
5. Staging has its own consent controls. They are not part of the public live ChoiceQR header/footer contract; retain them only as the separately required first-party consent layer and position them without altering the copied controls.
6. In the exact Android context, staging renders a four-column gallery with 88.5px tiles; live Android renders three 119.33px columns. Staging also lacks live mobile Search/Profile/hamburger drawer and the Here/Takeaway/Delivery cards plus ChoiceQR category routes.

## Critical responsive correction

The earlier desktop-resize result must not drive implementation: it rendered a desktop-template page at 390px, including a **four-column** gallery and a single-column footer. Real Android Chrome instead serves the mobile template documented above, including the three-column gallery visible in the owner's screenshot. Copy the Android contract for phone breakpoints, not the resized desktop DOM.

No booking, feedback, consent, login, form submission or external account mutation was performed.
