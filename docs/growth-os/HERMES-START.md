# Отлуп Гермесу — читай первым

Не начинай работу с бара, пока не прошёл этот файл. Потом `PROJECT.md`, потом issue.

Говори с Андреем по-русски, коротко: работает / не работает / URL / дальше. Без CMS-жаргона.

## Что это

Бар Варшава. Посты в Postiz. Аналитика — GTM + потом AdLoop. Не сухоцветы, не Afonin Co.

## Сейчас живо

- Postiz: https://postiz.margariteros.bar — публикация. Dokploy проект `postiz`. Не гасить.
- Каналы в орг. **Margariteros**: Instagram, Facebook, Threads.
- Бронь: https://margariteroswwa.choiceqr.com/booking
- DNS/Cloudflare зоны `margariteros.bar` — OpenBao `secret/projects/margariteros/cloudflare`
- Google UI владельца доступен, но для инвентаря GTM и Google Ads сначала использовать Jungle MCP: `docs/growth-os/JUNGLE-MCP-ACCESS.md`. Браузер нужен только там, где MCP не может дать доказательство: GTM/Server Preview, GA4 DebugView и поведение реальной формы. Прод-теги не править.

## Снято. Не поднимать

- BrightBean / `studio.margariteros.bar` — compose удалён, DNS снят, секрет снят (2026-08-18). Ресурсы не жрёт. Возвращать нельзя.

## Две папки в Postiz

- **Margariteros** — аккаунты бара.
- **Afonin** — пустая, под свои аккаунты. KFS не отдельная фирма.

Одно приложение Meta на обе. Каналы школы — Connect уже внутри Afonin.

## Аналитика

Jungle MCP — публичный аналитический контур проекта на `https://mcp.afonin.xyz/v0/groups/growth-tools/mcp`: он даёт доступ к GTM и Google Ads без прямого входа на сервер. Для запуска и границ см. `docs/growth-os/JUNGLE-MCP-ACCESS.md`.
AdLoop — не сайт, а набор MCP-инструментов Google Ads внутри этого контура. Отдельного форка Margariteros нет.
sGTM — свой контейнер **на каждый** проект. Сначала не AdLoop.
Порядок: Google владельца GTM этого бара → веб-контейнер (уже `GTM-T5F4VVGF`) → server-контейнер → сервер на нашем Dokploy → потом AdLoop.
Прод GTM / домен меню / QR — не трогать до аудита.

## Запреты

- Не рестартить gateway / Hermes. Не стопать GBrain.
- Не гасить Postiz ради уборки.
- Секреты только OpenBao + Dokploy env. В чат пароли не повторять.
- Пины / реклама / «кати» — только после явного можно.
- Не плодить свой планировщик и второй Dokploy.

## Секреты OpenBao (имена, не значения)

`secret/projects/margariteros/cloudflare`  
`secret/projects/margariteros/postiz`  
Папки google/gtm/ga4 — нет.

## Если просят GTM

1. Сначала выполнить read-only проверку Jungle MCP из `JUNGLE-MCP-ACCESS.md`.
2. Для списка контейнеров, тегов, версий и рабочих пространств использовать `gtm-mcp__*`, а для Google Ads — `adloop__run_gaql`.
3. В Chrome открывать GTM только для Preview/DebugView или если MCP не покрывает нужное действие.
4. Публикация GTM, изменение рекламы, бюджетов, ставок и конверсий — только после отдельного «можно».
