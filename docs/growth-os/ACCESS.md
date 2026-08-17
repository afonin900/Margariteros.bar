# Access inventory — Growth OS

Updated: 2026-08-17
Status: **не проверено live**. Не считать «есть», пока нет доказательства.

| Система | Статус | Нужно | Блокер для |
|---|---|---|---|
| Dokploy (существующий) | частично: CMS/Hermes живут | проект BrightBean + AdLoop | P0 deploy |
| Репозиторий BrightBean Studio | **нет** у `afonin900` | URL / доступ | P0-A |
| Репозиторий AdLoop | **нет** у `afonin900` | URL / форк | P0-C, P1 |
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
