# Access inventory — Growth OS

Updated: 2026-08-17
Status: **не проверено live**. Не считать «есть», пока нет доказательства.

| Система | Статус | Нужно | Блокер для |
|---|---|---|---|
| Dokploy (наш) | живой (Hermes/CMS уже там) | отдельное приложение BrightBean | P0 deploy |
| Cloudflare `margariteros.bar` | **есть** в OpenBao `secret/projects/margariteros/cloudflare` (`zone_id` + token) | не печатать ключ | DNS/HTTPS |
| BrightBean Studio | **live** https://studio.margariteros.bar (login 200) | соц-OAuth ещё нет | P0 каналы |
| AdLoop upstream | URL есть: `kLOsk/adloop` | наш fork ещё **не создан** | P0-C, P1 |
| AdLoop `project_fork` | нет | создать после P0, не выдумывать имя | P1 |
| Instagram | неизвестно | OAuth / логин владельца | P0 каналы |
| Facebook | неизвестно | то же | P0 |
| Threads | неизвестно | то же | P0 |
| Google Business Profile | неизвестно | OAuth + Location ID | P0-B |
| Google Ads | неизвестно | Customer ID + OAuth | P0-C |
| GA4 | неизвестно | Property ID | P0-C |
| GTM | неизвестно | Account + Container ID | P0-C; **prod не трогать** |
| Google Cloud | неизвестно | проект под GBP API | P0-B |
| Choice | неизвестно | URL меню + payload | P1-E |
| Домен меню / физ. QR | неизвестно | не менять до аудита | P1-E |

Идентификаторы (Ads / GA4 / GTM / GBP / Choice / menu domain / conversions): **не сняты**.

Запрет до аудита: правки production GTM, смена доменов меню, перепечатка QR.
