# Margariteros — отдел бара / SMM

**Сначала:** `docs/growth-os/HERMES-START.md`. Без этого файл не трогать.

Штаб: `/Users/afonin900/Github/afonin-hq/AGENTS.md`. Скиллы: `corp-*`.
Задачи: GitHub Issues `afonin900/Margariteros.bar`.
Факты домена: `PROJECT.md`.
Доска: Margariteros Bar Ops (#8).

`CLAUDE.md` → этот файл.

## Before durable work

1. Read `docs/growth-os/HERMES-START.md`.
2. Read `PROJECT.md` for current project state.
3. Read the assigned GitHub Issue for requested work.
4. For infrastructure, DNS, Dokploy or OpenBao work, read `docs/ORG-INFRA.md`.
5. Read the README of the needed direction (`content/`, `analytics/` or brandbook) and inspect relevant repository/runtime evidence before changing anything.

## Priority of truth

1. Actual assets / live accounts / runtime
2. GitHub Issue for the requested task
3. PROJECT.md
4. README and other documentation (`CONTEXT.md`, `PRODUCT.md`, `0_hq/` — legacy)

If a doc contradicts reality, report the discrepancy. Do not blindly follow stale weekly cards.

## Purpose

Польский контент, который ведёт гостей в бар в пятницу и субботу. Реальное фото важнее шаблона.

## Sources of truth

- Задачи / статус: GitHub Issues
- Что живо: `PROJECT.md`
- Визуал: `margariteros_asset_pack_v1_lime_fiesta/09_docs/design.md`
- Пайплайн контента (черновик): `CONTENT_PIPELINE_DRAFT.md`
- Куда класть посты: `content/weeks/README.md`
- Секреты: не в Git
- Buffer для Margariteros: `.agents/skills/buffer/SKILL.md`; `.buffer/config.json` хранит только несекретные настройки

`0_hq/tasks.md` больше не канон задач. Не плодить второй трекер.

## Куда класть контент

Готовый материал — в `content/weeks/YYYY-Www/YYYY-MM-DD-slug/<канал>/`.
Дата в пути — день события. Каналы: `instagram`, `threads`, `gbp`, `facebook`.
Генератор афиш остаётся в `content/production/html-posters/`; в git идёт `poster.png` из папки канала, не `out/`.
Не складывать подписи всех сетей в один файл.

## Boundaries

- Публичный текст — современный польский. Английский только если полезен гостю.
- Не выдумывать DJ, дату, время, цену, акцию, блюдо, гостя, событие.
- До поста: source brief и фактчек.
- Растр/паттерны не растягивать. Маскот — один stem/base, без ног.
- Реальные фото/видео — hero. Canva — сборка. Remotion сам наружу не публикуется.
- Публикации, реклама, аккаунты, трекинг — только после «можно».
- Buffer не считать подключённым, пока аккаунт, организация и каналы не подтверждены чтением. Черновик, расписание и публикация требуют отдельного «можно» и предварительной безопасной проверки команды.
- Каждый файл для социальной сети до одобрения проходит очистку AI-артефактов по `content/production/ai-cleanup/README.md`; недоступный сервис означает `draft`, а не обход проверки.

## Working rules

- Факты снимать самому. Решение владельца — один вопрос с рекомендацией.
- `corp-*` только когда к делу.

## Manager Config

### GitHub owner

- owner: afonin900

### Repos to scan

- /Users/afonin900/Github/Margariteros.bar

### GitHub Projects integration

- weekly_project: 8
- weekly_project_owner: afonin900
- status_field: Status
- status_in_progress: In Progress

### W-label convention

- enabled: true
- format: W{NN}

### Standing write authorization

- mode: ask-each-time

`manager` перед любым изменением GitHub показывает краткий план. Он не публикует сайт, GTM, рекламу или контент и не закрывает задачи без отдельного прямого решения владельца.

<!-- autopilot:start -->
# Первый собственный сайт Margariteros

Astro SSR-сайт для рекламного трафика, меню, событий, бронирования и измеримых конверсий без алкогольного позиционирования.

## Рабочая память сайта

- Приложение: `site/` — Astro 7 SSR, Node adapter standalone, TypeScript strict. `/` даёт server-side `302` на `/pl/`; рабочие SSR-маршруты: `/pl/`, `/en/`, `/ru/`, `/es/`; `/healthz` должен отвечать `200 ok` без внешних зависимостей.
- Входы: `site/src/pages/[locale]/index.astro` собирает `BaseLayout`, `ChoiceQrHeader`, `ContactBar`, `PhotoGallery`, `SiteFooter`, `ConsentBanner`; `site/src/content/page.ts` — единственная точка локализованных фактов через `getPage(locale)`. Медиа локальны в `site/public/media/`, их происхождение — `site/docs/choiceqr-visual-inventory.md`.
- Контракты: `site/src/lib/consent/` — versioned first-party cookie и `readConsent/saveConsent/subscribeConsent`; `choice-consent-bridge` возвращает `unsupported`, пока нет доказанного vendor contract/readback. `site/src/lib/analytics/attribution.ts` переносит только allow-listed UTM/click IDs без PII. `site/src/lib/analytics/` — единственный consent-gated/deduped вход в `dataLayer`/GTM; PII запрещены также в логах и GitHub.
- Публичный текст: PL/EN/RU/ES, только подтверждённые факты, без алкогольного позиционирования. Не трогать существующие `content/`, Remotion и Canva-материалы.
- Переменные окружения, только имена: `PUBLIC_GTM_CONTAINER_ID`, `PUBLIC_SERVER_GTM_TRANSPORT_URL`, `PORT`, `HOST`. Значения — только deployment environment/Dokploy, не Git, не чат. Без `PUBLIC_GTM_CONTAINER_ID` GTM не грузится; transport optional и не должен ломать сайт.

## Команды и проверки

- Установка: `cd site && npm ci` — только когда нужна установка зависимостей; не заменять отсутствующие зависимости глобальной установкой.
- Разработка: `npm --prefix site run dev`; typecheck: `npm --prefix site run check`; production build: `npm --prefix site run build`; unit/SSR: `npm --prefix site test`.
- Release gate: `npm --prefix site run verify:release` = `check` + `build` + `test` + secret scan; подтверждено: 15 tests passed, check/build/secret scan green. Secret scan сначала определяет каноническую папку run, затем legacy `--wip`.
- Container gate: `npm --prefix site run verify:docker`; подтверждено: non-root runtime user `astro` и `/healthz` green. Он намеренно отдельно от release gate, потому что Docker daemon может отсутствовать в CI.
- Тесты: `site/tests/page.test.ts` покрывает локали, галерею, consent/ChoiceQR bridge, attribution/PII/дедупликацию; `privacy.test.ts` — cookie и consent mode; `production.test.ts` поднимает собранный Node server и проверяет health + SSR surface без JavaScript. Один файл: `npm --prefix site test -- tests/page.test.ts`.

## Деплой и границы

- Docker context `site/`, Dockerfile `site/Dockerfile`, start `node ./dist/server/entry.mjs`, внутренний port `4321`, health path `/healthz`, runtime user `astro` (non-root).
- Разрешённый staging: `https://new.margariteros.bar`; после Dokploy readback проверить HTTPS/domain binding, `/healthz`, все четыре языковых SSR URL и CTA меню/брони без обязательного JavaScript. Runbook: `site/docs/dokploy-runbook.md`; quality evidence: `site/docs/quality-verification.md` и `site/docs/choiceqr-overlay-evidence.md`.
- Staging не разрешает cutover: не менять основной `margariteros.bar`, DNS, GTM, ChoiceQR, Ads или Dokploy без отдельного «можно». При откате выбрать предыдущий успешный image tag, дождаться `200 /healthz`, затем проверить `/pl/` и CTA.

## Autopilot

Состояние run: `.autopilot/state.js`; прогресс: `.autopilot/dashboard.html`. Продолжение: «продолжи автопилот». Требование из manifest снимает только пользователь.
<!-- autopilot:end -->
