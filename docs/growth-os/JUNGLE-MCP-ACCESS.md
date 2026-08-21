# Jungle MCP: доступ к рекламе и аналитике Margariteros

Этот файл нужен следующему агенту, чтобы начать работу с аналитикой без поиска по переписке и без лишнего Chrome.

**Проверено 2026-08-21:** шлюз запущен, `gtm-mcp__auth_status` вернул `authenticated: true`, а `gtm-mcp__list_accounts` увидел `Margariteros Bar` (`6313263127`).

## Правило выбора инструмента

1. Список сущностей и настройки GTM/Google Ads — сначала Jungle MCP.
2. Реальное поведение гостя — браузер только вместе с MCP: ChoiceQR Accept/Reject, Network, GTM Preview, Server Preview и GA4 DebugView.
3. Chrome не заменяет MCP для инвентаря рекламных кабинетов, контейнеров и версий.
4. Если инструмента в Jungle нет, сначала явно зафиксировать пробел, затем использовать браузер ровно для этого пробела. В текущем наборе Jungle есть GTM и Google Ads; отдельный GA4-инструмент не подтверждён.

## Принцип хранения секретов

- Токены OAuth, приватные ключи сервисных аккаунтов и пароли не хранятся в Git.
- Их источник - секрет-хранилище и переменные развернутых контейнеров Jungle MCP.
- Не запрашивать у владельца новый OAuth-токен, пока не проверен уже развернутый сервис.
- Не выводить значения секретов в терминал, логи, коммиты или чат.

## Вход в Jungle MCP

1. Подключиться к серверу через сохраненный SSH-профиль `hermes-cloud`.
2. Найти работающий шлюз Jungle MCP по Docker label `com.docker.swarm.service.name` с именем `marketing-mcp-gateway`.
3. Выполнять инструменты внутри шлюза командой `/mcpjungle invoke <tool> --input '<json>'`.

Пример безопасной проверки без секретов:

```sh
ssh hermes-cloud '
  jungle=$(docker ps --filter label=com.docker.swarm.service.name=marketing-mcp-gateway-active-u5cf8g_mcpjungle --format "{{.ID}}" | head -n1)
  docker exec "$jungle" /mcpjungle invoke gtm-mcp__auth_status --input "{}"
'
```

Если контейнер не найден по точному label, сначала вывести только имена и labels контейнеров. Не печатать их окружение: оно может содержать секреты.

### Стартовая проверка перед каждой аналитической задачей

Выполнить оба read-only вызова ниже. Они не меняют ни Google, ни контейнеры:

```sh
ssh hermes-cloud '
  jungle=$(docker ps --filter label=com.docker.swarm.service.name=marketing-mcp-gateway-active-u5cf8g_mcpjungle --format "{{.ID}}" | head -n1)
  test -n "$jungle" || { echo "Jungle gateway not found"; exit 1; }
  docker exec "$jungle" /mcpjungle invoke gtm-mcp__auth_status --input "{}"
  docker exec "$jungle" /mcpjungle invoke gtm-mcp__list_accounts --input "{}"
'
```

Ожидаемый результат: `authenticated: true` и аккаунт `Margariteros Bar`. Если хотя бы один ответ другой — остановиться, ничего не лечить перезапуском и записать фактическую ошибку в задачу.

Чтобы посмотреть точный контракт инструмента перед вызовом:

```sh
ssh hermes-cloud '
  jungle=$(docker ps --filter label=com.docker.swarm.service.name=marketing-mcp-gateway-active-u5cf8g_mcpjungle --format "{{.ID}}" | head -n1)
  docker exec "$jungle" /mcpjungle usage gtm-mcp__list_tags
'
```

## Google Tag Manager

- MCP-инструменты: `gtm-mcp__*`.
- Авторизация: сервисный аккаунт, уже переданный в GTM как пользователь. Ручной OAuth-токен не нужен.
- Проверка: `gtm-mcp__auth_status`, затем `gtm-mcp__list_accounts`.
- Аккаунт: `Margariteros Bar`, ID `6313263127`.
- Веб-контейнер: `margariteros.bar`, ID `GTM-T5F4VVGF`.
- Серверный контейнер: `gtm.margariteros.bar`, ID `GTM-KMF9Z88Z`.
- Рабочие пространства с подготовленными, но не опубликованными изменениями:
  - веб: `Margariteros baseline analytics`;
  - сервер: `Margariteros server-side baseline`.

Нельзя публиковать эти рабочие пространства без отдельного решения о передаче согласия на cookies в GTM.

### Безопасный первый запрос GTM

Сначала получить список контейнеров, затем рабочих пространств нужного контейнера, затем состояние выбранного workspace. Для чтения допустимы `list_accounts`, `list_containers`, `list_workspaces`, `get_workspace_status`, `list_tags`, `list_triggers`, `list_variables`, `list_versions`.

Через CLI `mcpjungle invoke` не создавать и не обновлять GTM-сущности, у которых есть поле `name`: у этого маршрута зафиксирована коллизия параметра. Для такой работы нужен стандартный MCP endpoint, где имя инструмента и его аргументы разделены, и отдельное разрешение владельца. `publish_version` никогда не вызывать без явного «можно».

## Google Ads

- MCP-инструменты: `adloop__*`, основной для чтения - `adloop__run_gaql`.
- Авторизация находится в развернутом AdLoop; не передавать и не перевыпускать токен без предварительной проверки текущей авторизации.
- Клиент Margariteros: `9359472796` (в интерфейсе: `935-947-2796`).
- Использовать `customer_id: "9359472796"` в GAQL-запросах.

### Безопасный первый запрос Google Ads

Перед запросом прочитать контракт: `mcpjungle usage adloop__run_gaql`. Затем использовать только `SELECT` в `adloop__run_gaql`; любые изменения кампаний, ставок, бюджетов или конверсий запрещены без отдельного «можно».

Пример формы запроса (поля сверять с `usage`, не вставлять токены):

```json
{
  "customer_id": "9359472796",
  "query": "SELECT customer.id, customer.descriptive_name FROM customer",
  "format": "table"
}
```

## GA4 и проверка событий

- Отдельный инструмент Jungle для GA4 на 2026-08-21 не подтверждён.
- Состояние конфигурации событий берём через GTM MCP.
- Доставку конкретного события в GA4 доказываем через браузер: GTM Preview, Network и GA4 DebugView. Это не обход MCP, а необходимая проверка живого пользовательского пути.
- Для #18 одна тестовая бронь допустима только после отдельного подтверждения владельца непосредственно перед отправкой формы; личные данные гостя не передавать в чат, логи или GA4.

## Границы действий

- Сначала читать состояние аккаунтов и черновиков.
- Не публиковать GTM, не менять бюджеты, ставки, кампании и конверсии без явного подтверждения владельца.
- Не отправлять объявления на модерацию без подтверждения.
- Не использовать маскировку алкогольной тематики для обхода модерации.

## Связанные документы

- `docs/growth-os/HANDOFF-2026-08-20-ads-analytics.md`: целевой план и текущий статус.
- `docs/growth-os/GTM-ACCESS.md`: история и доступ GTM.
- `docs/growth-os/GTM-BRIDGE-RESEARCH-2026-08-20.md`: диагностика мостика GTM.
- `PROJECT.md`: краткая карта проекта и правило выбора MCP/браузера.
