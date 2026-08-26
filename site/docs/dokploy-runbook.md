# Dokploy runbook — тестовый сайт `new.margariteros.bar`

## Граница запуска

Этот runbook относится только к тестовому поддомену `new.margariteros.bar`.
Он не разрешает переключение основного `margariteros.bar`, изменение DNS, GTM,
ChoiceQR или рекламных кабинетов.

## Контейнер

- Build context: `site/`.
- Dockerfile: `site/Dockerfile`.
- Команда запуска: `node ./dist/server/entry.mjs`.
- Внутренний порт: `4321` (`PORT`, по умолчанию `4321`).
- Health check: `GET /healthz`, ожидаемый ответ `200` с телом `ok`.
- Runtime user: `astro` (не root).

## Переменные окружения

Значения не хранятся в Git и вводятся только в Dokploy:

| Имя | Обязательно | Назначение |
| --- | --- | --- |
| `PUBLIC_GTM_CONTAINER_ID` | нет | Идентификатор web GTM; без него GTM не загружается. |
| `PUBLIC_SERVER_GTM_TRANSPORT_URL` | нет | URL server-side GTM transport; без него сайт продолжает работать. |
| `PORT` | нет | Порт Astro Node server, по умолчанию `4321`. |
| `HOST` | нет | Адрес прослушивания, по умолчанию `0.0.0.0` в image. |

## Preflight и deploy

1. Выполнить из `site/`: `npm ci && npm run verify:release`.
2. Выполнить обязательный container preflight: `npm run verify:docker`. Скрипт
   собирает image, проверяет `astro` как runtime user и вызывает `/healthz` из
   контейнера; он намеренно не входит в `verify:release`, потому что на обычном
   CI может отсутствовать Docker daemon.
3. Собрать image: `docker build -t margariteros-site:<tag> .`.
4. В Dokploy создать/обновить приложение из этого Docker context, указать порт `4321` и health path `/healthz`.
5. Привязать только `new.margariteros.bar`; HTTPS и домен подтвердить readback в Dokploy.
6. После запуска проверить `https://new.margariteros.bar/healthz` и все `/pl/`, `/en/`, `/ru/`, `/es/` без обязательного JavaScript.
7. Только после отдельной визуальной приёмки можно обсуждать основной домен; этот runbook не делает cutover.

## Rollback

1. В Dokploy выбрать предыдущий успешный image tag/Deployment.
2. Redeploy предыдущий tag, не меняя env и доменные привязки.
3. Дождаться `200 /healthz`, затем проверить `/pl/` и CTA меню/брони.
4. Зафиксировать причину отката без значений переменных окружения.
