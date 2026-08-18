# Access inventory — Growth OS

Updated: 2026-08-18  
Status: снято live, где удалось. Секреты только в OpenBao, не в Git.

| Система | Статус | Доказательство | Блокер |
|---|---|---|---|
| Dokploy (наш) | живой | Hermes/CMS уже там | не плодить второй инфраз-проект |
| Cloudflare `margariteros.bar` | есть в OpenBao | полка `secret/projects/margariteros/cloudflare` | не печатать ключ |
| BrightBean Studio | DNS с этой машины **не резолвится** `studio.margariteros.bar` | раньше писали live — сейчас A-записи нет | проверить DNS |
| Postiz Self-Hosted | **live** | `https://postiz.margariteros.bar` → 307 `/auth` (Cloudflare) | ключ MCP не в Git |
| Instagram / Threads / Facebook | подключены в Postiz | живые посты 18.08 | публикация только после «можно» |
| Google Business Profile | кабинет бара есть | `Margariteros Cocktail Bar`, Chmielna 7/9; сайт/меню владелец правил 18.08 | пульта MCP нет |
| Google Ads (бар) | кабинет есть, кампании на паузе | `935-947-2796`, `margaritabar.pl@gmail.com`; часть объявлений на Choice и с отказом «алкоголь» | не менять, пока пауза; MCP/AdLoop ещё не на бар |
| GA4 | **доступ есть** | свойство `504637329`, поток `G-ZYB0MZ1CSR`, кабинет `Margariteros Bar` | барные Ads ещё не смотрел |
| GTM | **sGTM live** | `https://gtm.margariteros.bar/healthy` → ok; server `GTM-KMF9Z88Z` | web Choice не переключали |
| Meta Pixel | **стоит на Choice** | `2116623422287913`, CAPI включён | кабинет Meta не проверяли |
| Choice | **свой домен live** | `https://margariteros.bar`; старый `choiceqr.com` → 302 на него | клик ≠ бронь |
| OpenBao | полка проекта есть | `secret/projects/margariteros/cloudflare` живая; `gtm` описан в контракте | карточку sGTM ещё не записал: SSH на Hermes после деплоя закрылся |

## GTM / GA4 — что снято 18.08.2026

Источник: HTML ChoiceQR, блок `marketing.analytics`.

| Поле | Значение | Где видно |
|---|---|---|
| GTM public ID | `GTM-T5F4VVGF` | Choice главная и бронь |
| GTM published | да, версия `3` | `gtm.js?id=GTM-T5F4VVGF` отвечает 200 |
| GA4 measurement | `G-ZYB0MZ1CSR` | тот же блок + тег `__googtag` в контейнере |
| Meta Pixel | `2116623422287913` | Choice native, не через GTM |
| TikTok Pixel | нет | `null` |
| Consent Mode Advanced | выкл | `googleConsentModeAdvanced: false` |
| Choice measurement | вкл | `measurement: true` |
| Facebook CAPI | вкл | `fbCAPI: true` |
| sGTM URL | live | `https://gtm.margariteros.bar` + превью `https://gtm.margariteros.bar/preview` | Choice / web GTM не переключали |
| GTM Account ID | `6313263127` | кабинет `Margariteros Bar`, 18.08 с `afonin900@gmail.com` |
| GTM Container ID | `230106068` | контейнер `margariteroswwa.choiceqr.com/booking` |
| GA4 Property ID | `504637329` | кабинет `Margariteros Bar`, поток `G-ZYB0MZ1CSR` |
| Почта кабинета | `margaritabar.pl@gmail.com` и `afonin900@gmail.com` | обе с правом администратора аккаунта |

Проверено 18.08.2026: `afonin900@gmail.com` видит аккаунт `Margariteros Bar` и контейнер `GTM-T5F4VVGF`. Prod не публиковали.

Школьный `gtm-mcp` сам по себе не отвечает (процесс живой, порт молчит). Для агентов нужен либо починенный пульт, либо этот же Google-вход. Инструкция: `GTM-ACCESS.md`.

## OpenBao

Канон полок: в штабе `ai-office/deploy/openbao/margariteros-shelf.md`.

Запрет до аудита: publish GTM, смена доменов меню, перепечатка QR.
