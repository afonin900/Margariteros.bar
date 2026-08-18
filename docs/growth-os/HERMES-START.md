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
- GTM контейнер назван: `GTM-T5F4VVGF`. В Google агент **не** залогинен. Прод-теги не править.

## Снято. Не поднимать

- BrightBean / `studio.margariteros.bar` — compose удалён, DNS снят, секрет снят (2026-08-18). Ресурсы не жрёт. Возвращать нельзя.

## Две папки в Postiz

- **Margariteros** — аккаунты бара.
- **Afonin** — пустая, под свои аккаунты. KFS не отдельная фирма.

Одно приложение Meta на обе. Каналы школы — Connect уже внутри Afonin.

## Аналитика

AdLoop — не сайт, MCP к Ads/GA4/GTM. Форка нет, на Dokploy нет.
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

ID уже есть. Следующее — вход владельца в tagmanager.google.com (web или server, куда вставлен). Без этого контейнер на Dokploy не ставить в прод.
