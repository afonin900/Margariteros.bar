# Margariteros Bar

Варшавский бар на Chmielna. Этот репозиторий — общий исторический корень и рабочая карта бренда Lime Fiesta, контента, аналитики, рекламы и собственного сайта; цель проекта — привести гостя к понятному визиту и бронированию.

## Идентичность проекта

- `project_id`: `margariteros`
- Репозиторий: `afonin900/Margariteros.bar`
- Владелец: `afonin900`; задачи и внешний статус ведутся отдельно от этого README.

Новые направления разделены по рабочим контурам: `margariteros-site` — сайт, `margariteros-content` — материалы и Buffer, `margariteros-analytics` — измерение, `margariteros-ads` — реклама, `margariteros-r-club` — партнёрский контур. Перед изменением выберите профильный репозиторий.

Как работать: `AGENTS.md`. Что живо: `PROJECT.md`. Задачи: GitHub Issues.

## Первый рабочий шаг

Сначала прочитайте [`AGENTS.md`](AGENTS.md), [`docs/growth-os/HERMES-START.md`](docs/growth-os/HERMES-START.md), затем [`PROJECT.md`](PROJECT.md) и README выбранного направления. Канонические материалы лежат в `content/`, `analytics/`, `brandbook-margariteros/`, `docs/growth-os/` и `site/`.

В корне нет общей команды запуска: приложение сайта живёт в `site/` и имеет собственный [`site/package.json`](site/package.json). Для него доступны команды `npm --prefix site run dev`, `npm --prefix site run check`, `npm --prefix site run build` и `npm --prefix site test`; фактический runtime и staging проверяются отдельным runbook.

## Границы и доступ

Публичный текст должен быть современным польским и опираться на подтверждённые факты. Публикация, реклама, GTM, подключение аккаунтов, DNS и deploy выполняются только после отдельного разрешения. Секреты хранятся в OpenBao/Dokploy и не копируются в README, Git или чат.

Для инфраструктуры и доступа используйте [`docs/ORG-INFRA.md`](docs/ORG-INFRA.md) и [Platform project-access.md](https://github.com/afonin900/platform-infrastructure/blob/main/docs/project-access.md). Основной маршрут контента: подтверждённый brief → пакет по неделе и каналу → фактчек → отдельное одобрение → Postiz.

Паки: `margariteros_asset_pack_v1_lime_fiesta/` и `margariteros_asset_pack_v2_canva/`. Визуальный закон: `…/09_docs/design.md`.

Публикация, реклама, подключение аккаунтов — только после явного «можно».
