# Project Map

Updated: 2026-08-18
Verified against: live Postiz + ChoiceQR booking; clone рядом со штабом

## Purpose

Система контента варшавского бара Margariteros (Lime Fiesta): из подтверждённых фактов и реальных фото собирать посты без выдуманных событий.

## Current state

Confirmed:

- Репо `afonin900/Margariteros.bar`, ветка `main`, клон рядом со штабом.
- Два бренд-пака на диске: v1 Lime Fiesta и v2 Canva.
- 11 open Issues, эпик `#1` (SMM-ритм). Карточки W33 датированы 10.08 — свежесть не проверял live.
- В HQ отдел зарегистрирован 2026-08-17. Публикаций из этого клона не делали.

## Architecture / major components

```text
факт бара → content/weeks/YYYY-Www/YYYY-MM-DD-slug/<канал>/ → «можно» → сеть
```

Автоматизация Remotion и аналитика в документах — после разбора двух post package. Это план, не факт работы.

## Important paths

- `AGENTS.md`, `PROJECT.md`, `README.md`
- `content/weeks/README.md` — раскладка постов по неделе, дате и сети
- `content/weeks/2026-W34/2026-08-22-dj-dragon/` — текущий слот субботы
- `margariteros_asset_pack_v1_lime_fiesta/` + `09_docs/design.md`
- `margariteros_asset_pack_v2_canva/`
- `CONTENT_PIPELINE_DRAFT.md`
- Legacy: `CONTEXT.md`, `0_hq/tasks.md`, `WEEKLY_LOG.md`, `PROJECT_PLAN.md`

## Runtime / deployment

Сайта/прод-выкладки в этом репо не подтверждено. SMM-аккаунты из клона не трогали.

## External dependencies

Instagram (основной канал по докам), ChoiceQR, Canva. TikTok / Facebook / планировщик — только с отдельного решения.

## Sources of truth

- Tasks: GitHub Issues
- This map: this file
- Visual law: asset pack `design.md`

## Known constraints

- Не публиковать без «можно»
- Не выдумывать факты вечера
- Не растягивать растр; маскот без ног

## Current focus

- BrightBean **снят** 2026-08-18 (compose, DNS `studio.`, секрет). Не поднимать.
- Postiz **поднят**: https://postiz.margariteros.bar. Подключены Instagram, Threads, Facebook. GBP в Postiz нет.
- GTM контейнер назван: `GTM-T5F4VVGF`. Входа в Google у агента нет. Prod GTM не правим.
- Бронь: https://margariteroswwa.choiceqr.com/booking (форма живая, 18.08).
- DNS: `postiz.margariteros.bar` → Cloudflare. Секреты OpenBao, не Git.

Документы: `docs/growth-os/`.

## Unknown / unverified

- Живы ли слоты W33 (14–15.08) и есть ли реальные brief/фото
- PRIVATE vs public: GitHub сейчас public, `CONTEXT.md` пишет private
- Подключены ли Instagram / ChoiceQR / Metricool фактически
