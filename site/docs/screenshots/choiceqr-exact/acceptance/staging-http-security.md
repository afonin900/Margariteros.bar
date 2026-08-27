# Live staging HTTP/privacy readback — 2026-08-27

Target: `https://new.margariteros.bar`, final commit `902e0d6`. Read-only except one explicit `Tylko niezbędne` consent preference. No booking/auth/order form was submitted and redirects were not followed.

## Runtime identity and locales

- Repository HEAD: `902e0d6` (`fix public HTTPS metadata behind Dokploy`).
- `/pl/`, `/en/`, `/ru/`, `/es/`: `200`, `data-choiceqr-mirror="home"`, no Astro fallback marker and no `Set-Cookie`.
- `/healthz`: `200`.
- `/`: `302 /pl/`.

## Main response

- `200`, `Cache-Control: private, no-store, max-age=0`.
- CSP, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and device `Vary` are present.
- Delivered HTML contains no GTM, Facebook, Cloudflare analytics tag, dropped `unsafe=drop` value, or upstream `Set-Cookie`.
- Runtime is the mirror, not fallback.
- Final readback confirms exact public HTTPS metadata:
  - `<link rel="canonical" href="https://new.margariteros.bar/pl/">`
  - `<meta property="og:url" content="https://new.margariteros.bar/pl/">`
  PL/EN/RU/ES each emit their own exact HTTPS locale URL. The previous reverse-proxy internal-HTTP defect is resolved.

## Action routes

Localized and unlocalized booking, booking/create, auth, order/create, delivery areas, feedback and section routes return top-level `302` to the corresponding official `https://qr.margariteros.bar/...` path. `utm_source=x` is retained; `unsafe` and `token` are removed. No redirect was followed. No response sets a cookie.

## API

- Read-only menu, booking params/blocks, favorites, language and inert analytics-cookie GETs return `200` JSON with `private, no-store` and no `Set-Cookie`.
- Booking-create and unknown public GETs return `404` JSON with `private, no-store`.
- The deployed source uses per-endpoint query allow-lists; unknown query fields are removed before the upstream URL is built.

## Browser/privacy

- Fresh Android 390 / DPR3 / touch5 consent surface is pixel-identical to official (`RMSE 0`). Panel/button rectangles, fonts, colors and borders match exactly.
- The overlay backdrop is the hit target over the header Menu on both origins; a real coordinate click leaves the drawer closed.
- `Tylko niezbędne` was chosen only on staging. The panel disappears and stays absent after reload.
- Staging capture has zero GTM/GA/Facebook/Cloudflare/TikTok/DoubleClick requests, zero load failures, zero console errors and zero runtime logs.

Evidence: `staging-consent.json`, `staging-metrics.json`, `staging-interactions-local.json`, `rmse-staging.tsv` and paired PNGs in this directory.

## Final `902e0d6` smoke

- Android SSR source: `is-mobile`; Chrome runtime `390×844`, DPR3, touch5, document `390×3228`.
- Gallery: 20/20 loaded, exactly three columns.
- Saved-consent Language and Menu/drawer states work; PL/EN/RU and machine ES are present.
- Desktop UA source: `is-desktop`.
- Browser tracker requests, failures, console errors and runtime logs: all empty.
- Locales, health and localized/unlocalized booking/auth/write handoffs retain the accepted status.
