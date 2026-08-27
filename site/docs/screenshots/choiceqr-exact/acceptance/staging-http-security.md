# Live staging HTTP/privacy readback — 2026-08-27

Target: `https://new.margariteros.bar`, expected commit `2401e90`. Read-only except one explicit `Tylko niezbędne` consent preference. No booking/auth/order form was submitted and redirects were not followed.

## Runtime identity and locales

- Repository HEAD: `2401e90` (`mirror ChoiceQR home safely in Astro SSR`).
- `/pl/`, `/en/`, `/ru/`, `/es/`: `200`, `data-choiceqr-mirror="home"`, no Astro fallback marker and no `Set-Cookie`.
- `/healthz`: `200`.
- `/`: `302 /pl/`.

## Main response

- `200`, `Cache-Control: private, no-store, max-age=0`.
- CSP, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and device `Vary` are present.
- Delivered HTML contains no GTM, Facebook, Cloudflare analytics tag, dropped `unsafe=drop` value, or upstream `Set-Cookie`.
- Runtime is the mirror, not fallback.
- **Blocker:** canonical and `og:url` are generated with the internal HTTP scheme:
  - `<link rel="canonical" href="http://new.margariteros.bar/pl/">`
  - `<meta property="og:url" content="http://new.margariteros.bar/pl/">`
  Public staging is HTTPS. This is a deployed reverse-proxy origin/readback defect.

## Action routes

Localized and unlocalized booking, booking/create, auth, order/create, delivery areas, feedback and section routes return top-level `302` to the corresponding official `https://qr.margariteros.bar/...` path. `utm_source=x` is retained; `unsafe` and `token` are removed. No redirect was followed. No response sets a cookie.

## API

- Read-only menu, booking params/blocks, favorites, language and inert analytics-cookie GETs return `200` JSON with `private, no-store` and no `Set-Cookie`.
- Booking-create and unknown public GETs return `404` JSON with `private, no-store`.
- The deployed source at `2401e90` uses per-endpoint query allow-lists; unknown query fields are removed before the upstream URL is built.

## Browser/privacy

- Fresh Android 390 / DPR3 / touch5 consent surface is pixel-identical to official (`RMSE 0`). Panel/button rectangles, fonts, colors and borders match exactly.
- The overlay backdrop is the hit target over the header Menu on both origins; a real coordinate click leaves the drawer closed.
- `Tylko niezbędne` was chosen only on staging. The panel disappears and stays absent after reload.
- Staging capture has zero GTM/GA/Facebook/Cloudflare/TikTok/DoubleClick requests, zero load failures, zero console errors and zero runtime logs.

Evidence: `staging-consent.json`, `staging-metrics.json`, `staging-interactions-local.json`, `rmse-staging.tsv` and paired PNGs in this directory.
