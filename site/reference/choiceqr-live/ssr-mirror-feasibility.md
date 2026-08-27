# Feasibility: SSR mirror/proxy живого ChoiceQR на `new.margariteros.bar`

Дата проверки: 2026-08-27 (CEST). Источник: `https://qr.margariteros.bar/`, read-only. В отчёте нет реализации и нет отправки заявки на бронь.

## Короткий вывод

**Да, технически выполнимо, но только как контролируемый full reverse proxy, а не как одноразовый SSR-снимок HTML.** Astro SSR может на каждый запрос забрать HTML ChoiceQR, отдать его под `new.margariteros.bar`, проксировать vendor API и Next-маршруты, а до гидратации удалить marketing-конфигурацию ChoiceQR и вставить first-party consent/analytics.

Это даст наиболее близкую к live pixel identity и сохранит настоящие интерактивы: меню, бронь, доставку, feedback, поиск, язык и drawer. Цена — поддержка allow-list маршрутов, cookie/session bridge, переписывание `Location` и постоянная проверка после смены vendor build.

**Raw HTML passthrough с несколькими заменами URL не подходит.** В HTML есть Next hydration (`__NEXT_DATA__`), десятки чанков, динамические route chunks и вызовы относительного `/api`. Как только пользователь уходит с `/`, требуется тот же полный proxy-контур.

Iframe не подходит: live HTTP-ответ отдаёт `X-Frame-Options: SAMEORIGIN`, а consent/analytics и route state внутри iframe не становятся first-party поверхностью `new`.

## Что подтверждено сейчас

### Live document и assets

- `GET https://qr.margariteros.bar/` отвечает `200`, HTML около 138 KB, Next build id при проверке `5pF4zzuxXwGTuBBPFKIVA`.
- В документе есть `__NEXT_DATA__` около 129 KB: place, menu, sections, 20 gallery items, locale data, booking/delivery flags и marketing-конфигурация.
- Основные ресурсы приходят с трёх независимых поверхностей:
  - `cdn-clients.choiceqr.com/client/_next/...` — CSS/JS Next;
  - `cdn-media.choiceqr.com/prod-eat-margariteroswwa/...` — background, logo, gallery и menu media;
  - `fonts.googleapis.com`, `fonts.gstatic.com`, Google Maps iframe.
- Live HTML не содержит `Content-Security-Policy`; есть `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, Cloudflare headers и `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.
- Live root устанавливает пустой `placeDbName` cookie (`Path=/`). Публичный API устанавливает HttpOnly `mguid` с `Path=/`, `Secure`, `SameSite=Lax`, сроком около 20 дней. Эти cookies vendor-сессионные, их нельзя смешивать с произвольными first-party cookies.

### Locales

Проверены живые ответы:

| Локальный canonical path | Vendor request | Фактическое состояние |
| --- | --- | --- |
| `/pl/` | `/pl` после vendor `308` | польский |
| `/en/` | `/en` | английский |
| `/ru/` | `/ru` | русский |
| `/es/` | `/es` | испанская machine translation |

Также работает query-путь `/?lang=pl|en|ru|es`; выбор языка у ChoiceQR меняет UI без отдельного locale href. В зеркале нужно сделать `/pl/`, `/en/`, `/ru/`, `/es/` first-party canonical routes и переводить их во внутренний vendor request, сохраняя функциональные query (`lang`, `screen`, `section`) и только allow-listed attribution (`utm_*`, `gclid`, `gbraid`, `wbraid`). Не передавать неизвестные query-поля наугад.

### API и hydration

В браузере ChoiceQR API client строит URL как `/api` + `/public/...`, если не задан специальный backend base. Это означает, что после переноса документа на `new` без proxy запросы уйдут на `new/api` и сломаются.

Read-only browser network capture на live booking показал:

```text
GET /api/public/booking/params?lang=pl       200 application/json
GET /api/public/booking/blocks?visitDuration=60 200 application/json
```

На live menu после навигации дополнительно виден:

```text
GET /api/public/favorites/query/counters
```

Исходная HTML-страница получает menu data server-side; обычный reload не обязан повторять `/api/public/menu` в браузере. Но этот API нужен SSR и route transitions (`GET /api/public/menu?...` возвращает `200` JSON). В загруженных vendor chunks присутствуют также auth, booking, order, delivery, feedback и translation endpoints. Полный список POST/PUT для создания брони нельзя объявлять по догадке: его нужно снять отдельным согласованным E2E-readback до любого теста, создающего внешнее состояние.

### Реальные marketing-запросы

После гидратации live сам загружает vendor marketing, независимо от нашего first-party consent слоя:

- `googletagmanager.com/gtm.js` и `gtag/js`;
- `connect.facebook.net` и Facebook `tr`/events;
- Google Ads/remarketing и GA4 collect;
- Cloudflare beacon/`/cdn-cgi/rum`.

В `__NEXT_DATA__` marketing object содержит analytics settings для GTM, GA, Facebook и measurement. Поэтому «проксировать оригинальный HTML и сверху добавить наш баннер» **не удовлетворяет** first-party consent requirement: vendor tags уже запускаются при гидратации. Текущий `choice-consent-bridge` остаётся `unsupported`, пока не будет доказан vendor consent contract/readback.

## Сравнение вариантов

| Вариант | Pixel identity | Интерактивы и routes | Consent/analytics | Вердикт |
| --- | --- | --- | --- | --- |
| Raw HTML + частичный URL rewrite | Высокая только на root-снимке | ломаются API, Next route chunks, cookies и часть language state | vendor tags всё равно запускаются | не принимать |
| Static snapshot + vendor JS | Средняя; быстро устаревает menu/status/build | требует полного API и route proxy; snapshot может не совпасть с API | нужно отдельно вырезать marketing | только fallback для reference |
| Iframe live | Визуально близко внутри frame | `SAMEORIGIN`, frame navigation, scroll и внешние CTA неудобны | consent родителя не контролирует vendor document | не принимать |
| **Full reverse proxy + SSR response transform** | **наивысшая, live CSS/JS/HTML** | **сохраняет vendor routes/API при proxy** | **можно удалить vendor analytics до hydration и загрузить first-party gated analytics** | **рекомендация** |

## Рекомендуемая схема

### Request mapping

1. Оставить Astro SSR entrypoint для `/` (302 на `/pl/`) и четырёх local canonical routes.
2. Для `/pl`, `/en`, `/ru`, `/es` запрашивать соответствующий vendor path; для остальных allow-listed ChoiceQR paths проксировать тот же path:
   `/section:*`, `/booking`, `/delivery-areas`, `/feedback`, `/search`, `/menu`, `/takeaway`, `/delivery`, legal routes и их вложенные route paths.
3. Проксировать `/_next/data/*` к vendor origin, если конкретный Next transition его использует; `/_next/static/*` можно брать с `cdn-clients.choiceqr.com/client/_next/*`. Если HTML оставляет абсолютные CDN URLs, не переписывать CSS/JS asset URLs без необходимости.
4. Проксировать только allow-listed `/api/public/*` и подтверждённые vendor auth/booking/order paths. Минимум для smoke gate: `/api/public/menu`, `/api/public/booking/params`, `/api/public/booking/blocks`, `/api/public/favorites/query/counters`.
5. На SSR upstream передавать только vendor cookies (`mguid`, `placeDbName`, language/session cookies после отдельного подтверждения). Не пересылать произвольные `Cookie`, `Authorization`, `X-Forwarded-For`, first-party consent cookie или PII.
6. На API proxy сохранять method, query, JSON body и нужные `Content-Type`; `Set-Cookie` переписывать на `new.margariteros.bar` без чужого `Domain`. Для booking POST и auth нужна отдельная проверка Origin/CSRF и idempotency; до неё не запускать submit.

### Response transform

- Переписывать vendor `Location: https://qr.margariteros.bar/...` на соответствующий local path; внешние `clients.choiceqr.com`, social и Google Maps оставлять внешними.
- Для SEO переписывать canonical/`og:url` на canonical local locale URL; это не должно менять визуальный DOM.
- До отдачи HTML убрать marketing analytics IDs/settings из `__NEXT_DATA__` (минимум `app.marketing.analytics`) и убрать уже SSR-вставленные vendor analytics tags. Нельзя ограничиться удалением только `<script>`: vendor React/Next может вставить теги снова из hydrated state.
- Сохранить Next runtime, `__NEXT_DATA__`, vendor CSS/JS, live data, links и button semantics.
- Инжектировать fixed first-party consent layer и first-party analytics bootstrap. На denied/невыбранном consent не должно быть запросов GTM/GA/Facebook/TikTok; после accept разрешается только настроенный first-party path. `ChoiceConsentBridge` не объявлять работающим без vendor доказательства.
- Для нового host выставить отдельный строгий CSP с явным allow-list CDN/fonts/Maps и first-party analytics. Не копировать blind vendor CSP: API CSP `script-src 'self'` относится к JSON endpoint и не описывает HTML surface.

### Redirect и кнопки

Рекомендуется сохранять меню/бронь/delivery/feedback под `new.margariteros.bar` через reverse proxy — пользователь остаётся на first-party host, но получает настоящие vendor pages. Exact external contracts остаются:

- `tel:+48 728 805 628` и `mailto:margaritabar.pl@gmail.com`;
- Google Maps `_blank` link;
- Instagram, TikTok, Google review, TripAdvisor, Facebook `_blank`;
- профиль — `https://clients.choiceqr.com/auth/login/me` (vendor authentication).

Это соответствует live interaction contract и не подменяет booking другим хостом. Если владелец выберет прямой redirect вместо proxy, его нужно зафиксировать отдельно; это уже не mirror interaction surface на `new`.

## Риски и ограничения

- **Vendor drift:** build id, hashed chunks, menu/status/availability, text и CSS меняются без предупреждения. Нельзя долго pin-ить только старый `__NEXT_DATA__`; HTML и asset graph должны быть согласованы по одному fetch/build.
- **Session leakage:** shared cache для HTML/API может отдать одному посетителю чужой `mguid` или состояние. HTML, booking, auth и API — `private/no-store`; кэшировать только content-addressed static assets.
- **PII/attribution leakage:** vendor forms содержат имя/телефон/e-mail/comment; они не должны попадать в GA4/GTM/GitHub или логи proxy. В URL переносить только allow-listed attribution.
- **Origin assumptions:** vendor client ожидает same-origin `/api`, cookies, relative route paths и иногда referer/client-source headers. Это устраняется только полным proxy и явным header/cookie policy.
- **Third-party map:** Google Maps iframe — динамический и может зависеть от referrer/API key. Для pixel gate interior карты маскировать, но проверять frame geometry и `_blank` directions URL. Значение Google API key не копировать в код, отчёт или Git.
- **Legal/product conflict:** live surface буквально содержит alcohol categories/copy. Exact mirror нельзя одновременно считать ad-safe alcohol-restricted landing без отдельной legal-safe вариации.
- **Availability:** booking params/blocks read-only доступны, но создание заявки и auth меняют внешнее состояние; это отдельный approval gate.

## Acceptance test до любого cutover

Один и тот же Chrome/UA/viewport, fresh production build и пустой профиль. Map interior и только заведомо динамические telemetry pixels маскируются; frame, geometry и CTA не маскируются.

1. **SSR/locales:** `GET /`, `/pl/`, `/en/`, `/ru/`, `/es/` дают ожидаемые `200/302` без loop; title и основной язык соответствуют PL/EN/RU/ES, `es` — machine translation. `/healthz` остаётся `200 ok` без upstream.
2. **Hydration/network:** после загрузки `/pl/` нет ошибок hydration. Vendor CSS/JS и 20 gallery images загружаются; API browser requests имеют `new.margariteros.bar` как origin и доходят до ChoiceQR upstream через proxy.
3. **Consent gate:** на fresh visit fixed first-party banner не меняет copied layout; до accept отсутствуют запросы GTM/GA/Facebook/TikTok. После accept появляется ровно один first-party analytics bootstrap; повторный load не дублирует tags/events. PII smoke payload не попадает в dataLayer/logs.
4. **Navigation:** header language/search/profile/menu, drawer open/close + body scroll lock, `/section:menu`, `/booking`, `/delivery-areas`, `/feedback`, legal pages и local locale routes работают. Language picker показывает human PL/EN/RU и machine ES и меняет UI.
5. **CTA contract:** phone/email protocols, Google Maps `_blank`, five social/review `_blank` links, Choice attribution и booking/menu destinations совпадают с `interactions.json`; query attribution сохраняется только по allow-list.
6. **Booking read-only surface:** `/booking` получает `params` и `blocks` с `200`; availability UI не падает. Submit/create booking и auth проверяются только отдельным явным разрешением владельца.
7. **Pixel gate:** сравнить live/local на Android `320, 390, 398, 597, 719` и desktop `1024, 1280`; mobile должен быть настоящим mobile emulation (`mobile=true`, touch, Android UA), не desktop resize. Static regions должны быть pixel-identical или иметь заранее утверждённый tolerance; map interior сравнивать masked, frame/position — exact. Текущий handcrafted clone этот gate не проходит: последняя fresh audit зафиксировала RMSE `8.47–24.75%` по ключевым регионам.
8. **Security/cache:** reject arbitrary proxy target/SSRF, strip inbound secrets/PII headers, rewrite only allow-listed `Location`/cookies, no shared cache for HTML/API, CSP and referrer policy pass, no vendor analytics after denied consent.

## Итоговое решение

Начинать реализацию можно только как отдельную bounded spike: сначала proxy read-only GET + HTML transform + network/visual gate, затем отдельно booking/auth contract. До прохождения acceptance выше нельзя объявлять `new.margariteros.bar` точной live-копией, нельзя делать cutover основного домена и нельзя считать ChoiceQR consent bridged.
