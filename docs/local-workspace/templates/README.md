# Margariteros

Статус общей папки: **перенос завершён 5 сентября 2026 года**. Это один удобный вход в семь независимых
репозиториев. Их истории Git, задачи, команды и выпуски не объединяются.
Сначала выбери строку ниже, затем прочитай правила и документы внутри этой
дочерней папки.

| Папка | Цель | Задачи GitHub | Главный документ |
| --- | --- | --- | --- |
| [`margariteros-site`](./margariteros-site) | Сайт бара, страницы, события, меню и переход к бронированию | [#1](https://github.com/afonin900/margariteros-site/issues/1), [#2](https://github.com/afonin900/margariteros-site/issues/2) | [`docs/release-gate.md`](./margariteros-site/docs/release-gate.md) |
| [`margariteros-content`](./margariteros-content) | Проверенные материалы и черновики публикаций по каналам | [#1](https://github.com/afonin900/margariteros-content/issues/1), [#2](https://github.com/afonin900/margariteros-content/issues/2) | [`README.md`](./margariteros-content/README.md) |
| [`margariteros-analytics`](./margariteros-analytics) | Измерение заявок, броней, визитов и выручки без дублей | [#5](https://github.com/afonin900/margariteros-analytics/issues/5), [#9](https://github.com/afonin900/margariteros-analytics/issues/9) | [`docs/ANALYTICS-RUNBOOK.md`](./margariteros-analytics/docs/ANALYTICS-RUNBOOK.md) |
| [`margariteros-ads`](./margariteros-ads) | Реклама и связь рекламного визита с подтверждённым действием | [#4](https://github.com/afonin900/margariteros-ads/issues/4), [#8](https://github.com/afonin900/margariteros-ads/issues/8) | [`advertising/README.md`](./margariteros-ads/advertising/README.md), [`docs/RELEASE_GATE.md`](./margariteros-ads/docs/RELEASE_GATE.md) |
| [`margariteros-r-club`](./margariteros-r-club) | Партнёрская система R Club и безопасная связь с Syrve | [#1](https://github.com/afonin900/margariteros-r-club/issues/1), [#3](https://github.com/afonin900/margariteros-r-club/issues/3) | `README.md` дочернего репозитория |
| [`margariteros-booking-service`](./margariteros-booking-service) | ChoiceQR, депозиты, резерв столика и оплаченный визит | [#1](https://github.com/afonin900/margariteros-booking-service/issues/1), [#4](https://github.com/afonin900/margariteros-booking-service/issues/4) | [`README.md`](./margariteros-booking-service/README.md) |
| [`Margariteros.bar`](./Margariteros.bar) | Историческое происхождение, бренд и общая карта проекта | [#32](https://github.com/afonin900/Margariteros.bar/issues/32), [#36](https://github.com/afonin900/Margariteros.bar/issues/36), [#44](https://github.com/afonin900/Margariteros.bar/issues/44) | [`PROJECT.md`](./Margariteros.bar/PROJECT.md) |

Для контента правила проверки находятся в [`docs/RELEASE_GATE.md`](./margariteros-content/docs/RELEASE_GATE.md);
`node scripts/release-gate.mjs` проверяет структуру местных пакетов.
`margariteros-content` не публикует материалы сам; публикация через Buffer
требует отдельного разрешения. Реклама также не запускается из репозитория:
это ясно зафиксировано в [`advertising/README.md`](./margariteros-ads/advertising/README.md).

## Шесть безопасных локальных команд

Команды выполняются только в указанной папке и не публикуют внешний результат.
Они взяты из `package.json` или скриптов соответствующего репозитория.

```sh
cd /Users/afonin900/Github/Margariteros/margariteros-site && npm run verify:release
cd /Users/afonin900/Github/Margariteros/margariteros-site && npm run verify:docker
cd /Users/afonin900/Github/Margariteros/margariteros-content && python3 scripts/validate-content-factory-entrypoint.py
cd /Users/afonin900/Github/Margariteros/margariteros-analytics && npm run test:contracts
cd /Users/afonin900/Github/Margariteros/margariteros-r-club && pnpm type:check
cd /Users/afonin900/Github/Margariteros/margariteros-booking-service && npm test
```

Для каждой команды сначала прочитай документ из таблицы и проверь
зависимости. Проверка Docker требует запущенного местного Docker; R Club —
установки зависимостей через `pnpm install --frozen-lockfile`. Общей команды сборки нет. Внешние аккаунты, реклама, публикация,
ChoiceQR, Syrve и боевые настройки в этих командах не меняются.

## Пути и совместимость

Данные физически находятся в
`/Users/afonin900/Github/Margariteros/*`. Старые пути в
`/Users/afonin900/Github/` сохраняются только как совместимые символические
ссылки на новые каталоги и не являются отдельными копиями. Старые ссылки сохранены для совместимости; их удаление не входит в выполненный перенос.

Служебные рабочие копии Codex в `/Users/afonin900/.codex/worktrees/` остаются
вне общей папки. Их связь с основным Git проверяется отдельно после переноса.
Общий вход не является Git-репозиторием: не запускай здесь `git init`, общую
сборку или общий выпуск. Не удаляй исторические данные и секреты.

[Результат переноса и проверки](LOCAL-CONSOLIDATION-RESULT-2026-09-05.md).
