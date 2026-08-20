# Server-side GTM — Margariteros

Домен тегов: `https://gtm.margariteros.bar`  
Превью: `https://gtm.margariteros.bar/preview`  
Образ: `gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable`  
Не школьный `gtm-server`. Хиты бара на школьный хост не класть.

## Кабинет

| Поле | Значение |
|---|---|
| Аккаунт | Margariteros Bar / `6313263127` |
| Web | `GTM-T5F4VVGF` / `230106068` |
| Server | `GTM-KMF9Z88Z` / `261605911` |
| Имя server | `gtm.margariteros.bar` |

`CONTAINER_CONFIG` — в OpenBao `secret/projects/margariteros/gtm`, не в Git.

## Dokploy

Тот же инстанс, отдельный compose (как Postiz). Домены в панели:

- `gtm.margariteros.bar` → сервис `gtm-server`, порт `8080`
- `gtm.margariteros.bar/preview` → сервис `gtm-preview`, порт `8080` (путь снимается)

Превью — ровно один инстанс. Проверка: `GET /healthy` → 200.

## Что не делать без отдельного «можно»

- Publish web-контейнера и `server_container_url` на Choice
- Меню, QR, школьный sGTM
