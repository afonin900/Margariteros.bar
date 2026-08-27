# SSR mirror HTTP/privacy readback — 2026-08-27

Fresh production build, local `127.0.0.1`, no deploy and no external submit.

## Main document

- `GET /pl/?utm_source=acceptance&unsafe=drop` -> `200`.
- `Cache-Control: private, no-store, max-age=0`.
- CSP limits scripts to self and `cdn-clients.choiceqr.com`; GTM, Facebook and Cloudflare analytics are not permitted.
- `Referrer-Policy: strict-origin-when-cross-origin`; `X-Content-Type-Options: nosniff`.
- `Vary: User-Agent, Sec-CH-UA-Mobile, Sec-CH-UA-Platform`.
- No `Set-Cookie` header from the upstream response.
- The transformed source contains the local mirror marker and the hidden first-party consent marker; it contains no GTM, Facebook or Cloudflare analytics tag and no dropped `unsafe=drop` value.
- `__NEXT_DATA__` keeps the vendor marketing/SEO object shape but all analytics integrations are inert: identifiers are `null`, feature switches are `false`.

## Locales

`/pl/`, `/en/`, `/ru/`, `/es/` each return `200`, the mirror marker, and the corresponding HTML language (`pl`, `en`, `ru`, `es`). `/` returns `302 /pl/`. `/healthz` returns `200` without depending on ChoiceQR.

## Action handoff

Both localized and unlocalized action paths return `302` to the same official ChoiceQR path. Only allow-listed attribution survives; `unsafe` and `token` are removed.

| Local path | Result |
|---|---|
| `/auth` and `/pl/auth` | `302 https://qr.margariteros.bar/auth?utm_source=x` |
| `/booking` and `/pl/booking` | `302 https://qr.margariteros.bar/booking?utm_source=x` |
| `/booking/create` and `/pl/booking/create` | `302 https://qr.margariteros.bar/booking/create?utm_source=x` |
| `/order/create` and `/pl/order/create` | `302 https://qr.margariteros.bar/order/create?utm_source=x` |

No write/submit request was followed to the official host.

## API gate

- Allowed GET paths: menu, booking params/blocks, favorites counters, available languages, inert analytics cookies.
- Query forwarding is per-endpoint. The unit readback confirms unknown query keys are removed before the upstream URL is built.
- Disallowed GET -> `404` JSON/no-store. Disallowed POST -> `405` JSON/no-store.
- `POST /api/public/analytics/cookies` is handled locally as inert `200` JSON/no-store and is never relayed upstream.
- No API response leaks upstream `Set-Cookie`.

## Browser network

Fresh true-Android Chrome 390 capture: 58 local requests/responses, zero failed requests, zero console errors, zero runtime exceptions and zero GTM/GA/Facebook/Cloudflare/TikTok requests. ChoiceQR hydration completes, 20 gallery images exist, and the language API supplies human PL/EN/RU plus machine languages including ES.

## Failure path

With `CHOICEQR_MIRROR_DISABLE=1`, `/pl/`, `/en/`, `/ru/`, `/es/` return the local Astro fallback with `200`; `/healthz` remains `200`. Fallback HTML has no mirror marker, vendor analytics tag or `Set-Cookie`.
