# ChoiceQR SSR mirror — independent final acceptance, 2026-08-27

## Результат

**PASS — безопасное SSR-зеркало главной принято по визуальному, функциональному и privacy gate.** Текущий Astro production build выдаёт настоящую mobile/desktop ветку ChoiceQR, а не уменьшенный desktop: геометрия страницы и 20 фото совпадают на всех семи профилях; статические пиксели, language overlay и drawer совпадают; vendor GTM/Facebook/Cloudflare не попадают в local DOM и сеть.

Это acceptance текущего worktree, не разрешение на deploy/cutover и не разрешение на создание брони. Авторитет: `https://qr.margariteros.bar/`. Последний normal server был поднят только локально из fresh build; fallback проверен отдельным локальным запуском с выключенным mirror. Внешние формы не отправлялись.

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

**PASS.** В текущем fresh build нет материальной видимой или функциональной дельты относительно live на проверенной главной. Privacy differences намеренные и невидимые: трекеры удалены до hydration, API/write поверхность ограничена, cookies не протекают, fallback работает. Нерешённое вне gate: deploy/readback на `new.margariteros.bar`, реальная first-party analytics конфигурация и отдельный ad-safe вариант — всё это требует отдельного разрешения владельца.
