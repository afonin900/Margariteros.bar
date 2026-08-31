# Точная репродукция ChoiceQR

Источник: read-only извлечение `site/reference/choiceqr-live/` от 2026-08-26. В браузер в production не подгружаются CSS, JavaScript или изображения ChoiceQR: шрифты, logo, background и 20 gallery thumbnails лежат локально в `site/public/media/choiceqr-*`.

## Что перенесено

- независимые desktop и Android/mobile ветки, а не сжатый desktop;
- mobile header 96px: 64px logo, Language, Search, Profile, Menu;
- desktop header: brand, nav, selector, Profile, Menu;
- Android gallery: 3 колонки, gap 4px, 20 квадратных local thumbnails; desktop: 4 колонки;
- area/service controls, category and ChoiceQR route links, contact CTA, footer contacts/hours/social grid/map/legal/Choice attribution;
- language screen with search and separate first-party locale links;
- drawer: same control opens/closes it and locks body scroll;
- same ChoiceQR domain targets: `/`, `/section:menu`, `/booking`, `/delivery-areas`, `/feedback`, legal routes. Campaign identifiers are retained only through the existing allow-list decorator.

## Разрешённые отличия

1. **Домен:** на `new.margariteros.bar` локализованные landing routes остаются first-party (`/pl/`, `/en/`, `/ru/`, `/es/`). Любой menu/booking/legal/action, которого first-party SSR не обслуживает, сразу ведёт на соответствующий `https://qr.margariteros.bar/...` route.
2. **Consent и analytics:** first-party consent panel, cookie и attribution остаются обязательными, поэтому находятся в отдельном fixed layer и не изменяют copied layout. Текущий live-контракт `cookieSettings` подтверждён 2026-08-31 и синхронизируется на `.margariteros.bar`; это рабочий readback, но не публично закреплённый договор поставщика.
3. **Google map surface:** публичный ключ live Google Embed API не копируется. Вместо него локальный raster из live public map viewport повторяет поверхность карты; весь 200px card остаётся точной `_blank` ссылкой на directions URL.
4. **Advertising-content conflict:** extracted live identity literally says `Margariteros Cocktail Bar` and `Tacos, baile y Margarita`; the full live category set also contains alcohol categories. The clone now reproduces these literal PL labels and their ChoiceQR routes at the owner's explicit fidelity request. Therefore it is **not approved for alcohol-restricted advertising** until the owner explicitly chooses a separate legal-safe copy variant.

## Acceptance evidence

`site/scripts/verify-responsive-ui.mjs` launches Chrome through CDP. For widths ≤760 it applies Android UA, `mobile:true`, touch emulation, DPR 3 and checks the mobile branch, three gallery columns, no horizontal overflow, drawer scroll lock/toggle, and language overlay. Larger widths verify the desktop branch and four columns. The production test checks SSR markup, exact external redirect contracts and locally served images.

The saved-consent Android 390×844/DPR3 contract also locks the measured live geometry: `scrollHeight` 3228px; gallery grid `x=16`, `y=1389.5`, `width=358`, 20 loaded images and three columns; footer wrapper height 917px. The missing 41.5px is the live opening-status strip, not an arbitrary gallery spacer. The legal surface is not allowed to add flow below the copied mobile footer; the observed 57px Choice attribution follows its wrapper.

Google tiles and the live Embed iframe are third-party dynamic content: the same saved live page may capture a loader, a locale-specific tile set, or an API-referrer error. Pixel comparison of the surrounding footer surface is retained; the 200px map raster is compared only against the copied static reference, not treated as a deterministic live-frame assertion. The click contract remains the external directions URL above.
