# Margariteros — отдел бара / SMM

**Сначала:** `docs/growth-os/HERMES-START.md`. Без этого файл не трогать.

Штаб: `/opt/data/workspace/HQ/AGENTS.md`. Скиллы: `corp-*`.
Задачи: GitHub Issues `afonin900/Margariteros.bar`.
Факты домена: `PROJECT.md`.
Доска: Margariteros Bar Ops (#8).

`CLAUDE.md` → этот файл.

## Before durable work

1. Read `docs/growth-os/HERMES-START.md`.
2. Read `PROJECT.md` for current project state.
3. Read the assigned GitHub Issue for requested work.
4. Read the README of the needed direction (`content/`, `analytics/` or brandbook) and inspect relevant repository/runtime evidence before changing anything.

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
