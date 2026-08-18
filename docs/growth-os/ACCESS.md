# Access inventory — Growth OS

Updated: 2026-08-18
Status: live снято с Dokploy/OpenBao/DNS, не с доков истории.

| Система | Статус | Нужно | Блокер для |
|---|---|---|---|
| Dokploy (наш) | живой | Postiz в проекте `postiz` | — |
| Cloudflare `margariteros.bar` | **есть** в OpenBao `secret/projects/margariteros/cloudflare` (`zone_id` + token) | не печатать ключ | DNS/HTTPS |
| BrightBean Studio | **снят** 2026-08-18: compose удалён, `studio.` DNS нет, секрет OpenBao нет | не возвращать | — |
| Postiz Self-Hosted | **live** https://postiz.margariteros.bar | публикация | — |
| AdLoop upstream | URL есть: `kLOsk/adloop` | наш fork ещё **не создан** | P0-C, P1 |
| AdLoop `project_fork` | нет | создать после P0, не выдумывать имя | P1 |
| Instagram | неизвестно | OAuth / логин владельца | P0 каналы |
| Facebook | неизвестно | то же | P0 |
| Threads | неизвестно | то же | P0 |
| Google Business Profile | неизвестно | OAuth + Location ID | P0-B |
| Google Ads | неизвестно | Customer ID + OAuth | P0-C |
| GA4 | неизвестно | Property ID | P0-C |
| GTM | контейнер **GTM-T5F4VVGF** (владелец назвал 2026-08-18) | вход в Google / web vs server / куда вставлен | P0-C; **prod не трогать** |
| Google Cloud | неизвестно | проект под GBP API | P0-B |
| Choice | неизвестно | URL меню + payload | P1-E |
| Домен меню / физ. QR | неизвестно | не менять до аудита | P1-E |

Идентификаторы: GTM `GTM-T5F4VVGF`. Ads / GA4 / GBP / Choice / menu domain / conversions — не сняты.

Запрет до аудита: правки production GTM, смена доменов меню, перепечатка QR.
