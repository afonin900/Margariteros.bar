# ChoiceQR SSR mirror — independent final acceptance, 2026-08-27

## Результат

**LOCAL PASS; LIVE STAGING FAIL / release пока не принят.** Визуал, адаптивность, consent, интерактивы и privacy на `https://new.margariteros.bar` прошли, но публичная HTTPS-страница публикует canonical и `og:url` с `http://`. Это материальный deployed SEO/origin defect, поэтому общий staging verdict не может быть PASS.

Локальный implementation gate остаётся PASS: текущий Astro build выдаёт настоящую mobile/desktop ветку ChoiceQR, а не уменьшенный desktop; геометрия и 20 фото совпадают на семи профилях; статические пиксели, language overlay и drawer совпадают; vendor trackers удалены. Авторитет: `https://qr.margariteros.bar/`. На staging выполнена только разрешённая настройка consent `Tylko niezbędne`; формы брони/auth/order не отправлялись, redirect не follow-ились.

## Live staging `2401e90`

Runtime действительно mirror, не fallback: `/pl/`, `/en/`, `/ru/`, `/es/` отвечают `200` с `data-choiceqr-mirror="home"`; `/healthz` — `200`; upstream `Set-Cookie` отсутствует.

### Consent first visit

- Fresh Android 390: official и staging consent screenshots имеют `RMSE 0`.
- Panel `48 / 424 / 294 / 184`; три кнопки по `294×56`; font, background, borders и цвета совпадают буквально.
- В обеих версиях backdrop является реальным hit target над header Menu. Координатный click не открывает drawer.
- Только на staging выбрано `Tylko niezbędne`; panel исчез и остался скрытым после reload.
- После выбора на staging нет GTM/GA/Facebook/Cloudflare/TikTok/DoubleClick requests, loading failures, console errors или runtime logs.

Evidence: [staging-consent.json](../../docs/screenshots/choiceqr-exact/acceptance/staging-consent.json), [paired first visit](../../docs/screenshots/choiceqr-exact/acceptance/paired-staging-pl-android-390-consent-first.png), [staging HTTP/privacy](../../docs/screenshots/choiceqr-exact/acceptance/staging-http-security.md).

### Saved-consent geometry и pixels

Все profile dimensions и gallery count совпали с authority: Android `320×3137`, `390×3228`, `398×3247`, `597×3659`, `719×3944`; desktop `1024×2066`, `1280×2386`; везде `20` gallery images.

| Staging capture vs official reference | Normalized RMSE |
|---|---:|
| Android 320 full | `0.000782` |
| Android 390 full | `0.000848` |
| Android 398 full | `0.000754` |
| Android 597 full | `0.001443` |
| Android 719 full | `0.000817` |
| Desktop 1024 full | `0.000955` |
| Android 390 top / language / drawer | `0 / 0 / 0` |
| Desktop 1024 / 1280 top viewport | `0.001330 / 0.001303` |

Full desktop 1280 PNG hit the bounded CDP screenshot timeout; exact `1280×2386` geometry, 20/20 gallery and top viewport pixel comparison were recorded instead. Google Maps dynamic interior remains excluded as upstream content; frame geometry is unchanged.

Language overlay contains human English/Polish/Russian plus machine Spanish and is pixel-identical. Drawer is pixel-identical; X closes on both authority/staging, while Escape is the same vendor no-op on both.

Evidence: [staging-metrics.json](../../docs/screenshots/choiceqr-exact/acceptance/staging-metrics.json), [staging interactions](../../docs/screenshots/choiceqr-exact/acceptance/staging-interactions-local.json), [staging RMSE](../../docs/screenshots/choiceqr-exact/acceptance/rmse-staging.tsv).

### HTTP/privacy gate и единственный blocker

- Main response: `private, no-store`, CSP, referrer policy, nosniff, correct device `Vary`, zero `Set-Cookie`.
- Delivered HTML: mirror marker present, fallback marker absent, zero GTM/Facebook/Cloudflare tags, unsafe query removed.
- Localized/unlocalized auth, booking/create, order/create, delivery, feedback and section actions return exact top-level official `302`; only allow-listed attribution survives.
- Allowed read-only API returns `200` JSON/no-store; disallowed GET returns `404` JSON/no-store; no API `Set-Cookie`.
- **Blocking deployed mismatch:** public URL is HTTPS, but HTML contains `<link rel="canonical" href="http://new.margariteros.bar/pl/">` and matching HTTP `og:url`. Вероятная граница ошибки — внутренний HTTP origin за Dokploy proxy не нормализован по forwarded protocol. Исправление реализации/deploy в этом независимом аудите не выполнялось.

## Реальный Chrome и SSR-ветка

- Chrome `152.0.7977.65`, последовательный CDP capture.
- Android widths `320`, `390`, `398`, `597`, `719`; CSS height `844`, DPR `3`, `mobile=true`, touch `5`, Android 14 / Pixel 7 UA и client hints. Live и local runtime: `pointer: coarse`, `hover: none`, server selector `is-mobile`.
- Desktop `1024×768` и `1280×1024`, DPR `1`, `mobile=false`; server selector `is-desktop`.
- Fresh gate: `astro check` — 0 issues; production build — green; mirror/production/privacy tests — `11 passed`.

Evidence: [metrics-summary.json](../../docs/screenshots/choiceqr-exact/acceptance/metrics-summary.json), [mirror-runtime.json](../../docs/screenshots/choiceqr-exact/acceptance/mirror-runtime.json), [interaction-states.json](../../docs/screenshots/choiceqr-exact/acceptance/interaction-states.json), [HTTP/privacy readback](../../docs/screenshots/choiceqr-exact/acceptance/mirror-http-security.md).

## Responsive geometry и галерея

| Профиль | Live / local page | Gallery grid Y live/local | Фото |
|---|---:|---:|---:|
| Android 320 | `320×3137 / 320×3137` | `1422 / 1422` | `20 / 20` |
| Android 390 | `390×3228 / 390×3228` | `1389.5 / 1389.5` | `20 / 20` |
| Android 398 | `398×3247 / 398×3247` | `1389.5 / 1389.5` | `20 / 20` |
| Android 597 | `597×3659 / 597×3659` | `1357.5 / 1357.5` | `20 / 20` |
| Android 719 | `719×3944 / 719×3944` | `1357.5 / 1357.5` | `20 / 20` |
| Desktop 1024 | `1024×2066 / 1024×2066` | `372 / 372` | `20 / 20` |
| Desktop 1280 | `1280×2386 / 1280×2386` | `372 / 372` | `20 / 20` |

Gallery order, column count, gaps, crop geometry, header, services, category blocks, contact/footer structure and map frame geometry are inherited from the same live ChoiceQR document/CSS and match at identical device configuration. At 390 the formerly disputed live height is exactly `3228`, not the old squeezed local `11391`; there are no blank regions.

## Pixel gate

Full-page raw normalized RMSE is zero or only dynamic-subpixel noise:

| Capture | Normalized RMSE |
|---|---:|
| Android 320 full | `0.000582` |
| Android 390 full | `0.000408` |
| Android 398 full | `0` |
| Android 597 full | `0.001120` |
| Android 719 full | `0` |
| Desktop 1024 full | `0` |
| Android 390 top | `0` |
| Android 390 language overlay, settled | `0` |
| Android 390 drawer, settled | `0` |
| Desktop 1024 top | `0` |
| Desktop 1280 top | `0` |

Google Maps iframe interior is dynamic and is not used as a local fidelity failure. Its frame is exact: Android 390 live/local `16 / 2883.203 / 358 / 200`; desktop 1024 `609.609 / 1625 / 390.391 / 200`; desktop 1280 `763.203 / 1945 / 492.797 / 200`. The external directions link is identical on both sides and opens the same Maps query in `_blank`.

Machine output: [rmse-mirror.tsv](../../docs/screenshots/choiceqr-exact/acceptance/rmse-mirror.tsv). Paired proof: [390 full](../../docs/screenshots/choiceqr-exact/acceptance/paired-mirror-pl-android-390-ready.png), [390 top](../../docs/screenshots/choiceqr-exact/acceptance/paired-mirror-pl-android-390-top-viewport.png), [390 language](../../docs/screenshots/choiceqr-exact/acceptance/paired-mirror-pl-android-390-language-overlay.png), [390 drawer](../../docs/screenshots/choiceqr-exact/acceptance/paired-mirror-pl-android-390-drawer.png).

## Hydration, language и drawer

- Local Next hydration: complete; 20 DOM images, 18 loaded in the viewport run exactly as live; zero failed requests, console errors or runtime exceptions.
- Language overlay is pixel-identical after the shared vendor transition settles. It contains human `English / Polish / Russian` and the complete machine group including `Spanish`.
- `/pl/`, `/en/`, `/ru/`, `/es/` each return mirrored SSR `200` with corresponding HTML language. `/` returns `302 /pl/`; `/healthz` returns `200` independently.
- Drawer open state is pixel-identical. The X closes it on both live and local (`visible true -> false`). Escape is a no-op on both (`true -> true`), so local matches the authority rather than inventing different behavior.
- Booking, delivery, feedback, legal and section links hand off with top-level `302` to the exact official path. Login remains the live direct ChoiceQR auth URL. No external write was submitted.

## Privacy и безопасный proxy contract

- Delivered local HTML contains no GTM, `gtag`, Facebook Pixel or Cloudflare beacon. Local browser network contains zero requests to those services and zero TikTok analytics requests.
- `__NEXT_DATA__` retains the marketing/SEO shape required by vendor hydration, but analytics identifiers are `null` and all enable switches are `false`.
- Main SSR response is `private, no-store`, has restrictive CSP/referrer/nosniff headers, varies by device headers and does not expose upstream `Set-Cookie`.
- Only named vendor cookies and UA/client hints may go upstream; first-party consent and unrelated cookies/headers are not forwarded.
- Read-only API paths and their query keys are explicitly allow-listed. Unknown query fields are stripped. Disallowed GET/POST return no-store JSON errors.
- The vendor consent-cookie request is handled locally and inertly (`GET/POST 200 no-store`), so accepting the visible dialog produces no tracking request or external write.
- Auth, booking-create and order-create paths, localized or not, return top-level `302` to the corresponding official ChoiceQR path with only allow-listed attribution; unsafe query fields are removed.
- With the mirror disabled, every locale falls back to the local Astro page with `200`; health stays green and fallback markup has no vendor analytics or upstream cookie.

## Отдельное продуктовое противоречие

Live ChoiceQR буквально содержит алкогольные категории, тексты и фотографии. Точная копия и отдельное требование «главная для рекламы без упоминания алкоголя» не могут одновременно описывать один и тот же экран. Это не дефект fidelity mirror и не понижает этот verdict; ad-safe рекламная главная должна быть следующей отдельной продуктовой итерацией.

## Final gate

**LOCAL PASS; LIVE STAGING FAIL.** На staging нет материальной visible/function/privacy дельты и нет tracker/cookie leakage, но HTTP canonical/`og:url` на публичной HTTPS-странице блокирует release acceptance. После исправления нужен короткий deployed readback canonical/og + один 390 smoke; повторять весь pixel suite не требуется. Отдельно вне этого gate остаются реальная first-party analytics конфигурация и ad-safe рекламный вариант.
