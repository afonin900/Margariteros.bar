# Интерфейсы сборки

## Правила проекта

- Стек: Astro SSR + Node adapter + TypeScript strict.
- Приложение живёт в `site/`; существующие content/Remotion/Canva изменения не трогать.
- Публичный текст — PL/EN/RU/ES, без вымышленных фактов и алкогольного позиционирования.
- Нельзя отправлять PII в dataLayer, GTM, GA4, Ads, логи или GitHub.
- Нельзя публиковать GTM, менять ChoiceQR/Ads/DNS/Dokploy или делать cutover без отдельного разрешения.
- Отсутствующая зависимость возвращается как `BLOCKED`, а не устанавливается глобально и не подменяется другой.

## Границы, решённые в спецификации

| Модуль | Владеет | Выставляет | Прячет |
|---|---|---|---|
| `content` | факты, локали, navigation, links | `getPage(locale) -> PageContent` | форму хранения и fallback локалей |
| `consent` | versioned first-party choice | `readConsent()`, `saveConsent(choice)`, `subscribeConsent()` | cookie encoding и expiry |
| `choice-consent-bridge` | доказанность переноса выбора в ChoiceQR | `syncChoiceConsent(choice) -> supported | unsupported` | vendor-specific adapter и доказательства |
| `attribution` | разрешённые campaign IDs | `captureAttribution(url)`, `decorateOutbound(url)` | allow-list и storage encoding |
| `analytics` | семантику browser events | `track(event)` | dataLayer mapping, consent gating, event-id generation |
| `ui` | SSR layout и accessible interactions | Astro components/pages | реализацию адаптивной композиции |

Основной тестовый шов — публичные функции `consent`, `attribution` и `analytics`; E2E проверяет видимое SSR-поведение и внешние URL.

## Команды

- Установка: `cd site && npm ci`
- Разработка: `cd site && npm run dev`
- Проверка типов/Astro: `cd site && npm run check`
- Тесты: `cd site && npm test`
- Один тестовый файл: `cd site && npm test -- tests/page.test.ts`
- Production build: `cd site && npm run build`

## Из таска 01 — Astro SSR-каркас

- `getPage(locale: Locale): PageContent` — единая точка получения локализованного контента.
- `locales: readonly Locale[]` — поддерживаемые `pl`, `en`, `ru`, `es`.
- `/` серверно отвечает `302` на `/pl/`; языковые маршруты SSR-рендерят HTML и hreflang.

## Из таска 02 — визуальная поверхность, промежуточный seam

- `PageContent.galleryItems: readonly GalleryItem[]` — локализованный контент поставляет безопасные элементы галереи.
- Компоненты `ChoiceQrHeader`, `ContactBar`, `PhotoGallery`, `SiteFooter` собирают SSR-поверхность.
- Геометрия: desktop stage 1232 px, mobile gutter 24 px, contact 128/224 px, gallery gap 4 px.
- Media локальны в `site/public/media/`; provenance — `site/docs/choiceqr-visual-inventory.md`.

## Живые внешние значения

- ChoiceQR reference: `https://qr.margariteros.bar/`
- Booking: `https://margariteroswwa.choiceqr.com/booking`
- Web GTM: `GTM-T5F4VVGF`
- Server GTM: `GTM-KMF9Z88Z`
