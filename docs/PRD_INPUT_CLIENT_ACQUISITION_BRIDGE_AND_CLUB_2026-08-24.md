# Входной пакет для PRD Спецификатора: привлечение гостей через подтверждённые брони и Margariteros Club

> TARGET_AGENT: PRD Спецификатор
> PURPOSE: подготовить исследовательскую спецификацию контура привлечения гостей, где Syrve — ядро учёта рефералок и факта покупки, а Telegram — только фронтенд приглашения и выдачи.
> STATUS: датированный снимок контекста, не источник живого состояния проекта

## 1. Метаданные снимка

- `captured_at`: 2026-08-24T13:46:18+0200
- `repository`: `afonin900/Margariteros.bar`
- `branch`: `main`
- `base_commit`: `81f0e3a64b2047a4cdf297ba4943d6f49ec3a929`
- `working_tree`: уже были чужие незакоммиченные `AGENTS.md`, `docs/ORG-INFRA.md`, `docs/growth-os/RETRO-W34-2026-08-17--2026-08-23.md` и каталог `site/`; `site/` содержит медиафайлы, а не подтверждённый runtime сайта.
- `github_checked_at`: 2026-08-24, GitHub Project `afonin900/8` и Issues репозитория прочитаны read-only.
- `runtime_evidence_checked_at`: в этой сессии live runtime ChoiceQR, Syrve, Telegram и секрет-хранилище не проверялись; используем только датированные repository/GitHub evidence.
- `known_access_limits`: нет подтверждённых ChoiceQR API token/scopes, Syrve API key/webhook access, Telegram runtime/admin access или Google Ads write authorization. Секреты не включены.
- `known_stale_sources`: `docs/growth-os/ROADMAP.md`, BrightBean PRD и исторические baseline нельзя считать текущими без новой сверки; BrightBean снят и возвращать его нельзя.

## 2. Что нужно исследовать и специфицировать

Определить минимальную, безопасную архитектуру для привлечения реальных гостей с двумя связанными модулями:

1. **Conversion Bridge**: детерминированный сервис, который читает подтверждённые брони ChoiceQR, при подтверждении создаёт/синхронизирует reserve в Syrve Cloud и отправляет единственный честный конверсионный сигнал в GA4/Google Ads.
2. **Margariteros Club**: реферальная логика, факт первой оплаченной покупки и выдача — на базе Syrve; Telegram — только интерфейс для ссылки/QR, показа статуса и выдачи гостю, не источник правды о покупке или награде.

Не проектировать это как единый автономный AI-агент: ни один текущий факт не требует LLM для переходов статусов, расчёта дедупликации или выдачи награды.

## 3. Конечный результат для пользователя

У владельца появляются две понятные возможности: видеть, какая **подтверждённая** бронь пришла из рекламы и дошла до резерва/визита, а также запускать Club, где факт покупки и выдача сверяются с Syrve без фальшивых наград и дублей. У гостя остаются привычные ChoiceQR-бронь и Telegram; он не должен видеть технические интеграции.

## 4. Почему это нужно сейчас

[VERIFIED_FACT | evidence=github | source=https://github.com/afonin900/Margariteros.bar/issues/17 | as_of=2026-08-24] Epic #17 ведёт рекламу к честной цели бронирования; нынешний `booking_request` означает создание заявки, а не подтверждение сотрудником.

[VERIFIED_FACT | evidence=github | source=https://github.com/afonin900/Margariteros.bar/issues/27 | as_of=2026-08-24] Планируется Margariteros Club, но его runtime и правило награды ещё не приняты.

## 5. Контекст обсуждения и принятые решения

- [ACCEPTED_DECISION | authority=project | source=PROJECT.md | as_of=2026-08-21] Воронка: реклама/QR → `margariteros.bar` → ChoiceQR → заявка → подтверждённая бронь → визит/закрытый счёт → аналитика.
- [ACCEPTED_DECISION | authority=project | source=GitHub Issue #17 | as_of=2026-08-24] `booking_request` не является подтверждённой бронью; не оптимизировать рекламу по клику, просмотру или маршруту.
- [ACCEPTED_DECISION | authority=project | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20] До подтверждения менеджером в Syrve не создаётся ничего; после подтверждения нужен reserve, не заказ.
- [ACCEPTED_DECISION | authority=project | source=GitHub Issue #26 | as_of=2026-08-24] `reservation_confirmed` сначала Secondary; повторная обработка не должна создать дубль; CANCELLED и NOT_CAME не являются положительной конверсией.
- [ACCEPTED_DECISION | authority=owner | source=owner message 2026-08-24 | as_of=2026-08-24] Рефералка строится на Syrve; Telegram — только фронтенд выдачи. Эта свежая owner decision имеет приоритет над старым текстом Issue #27 о ручной qualification.

## 6. Подтверждённое текущее состояние

- [VERIFIED_FACT | evidence=static | source=PROJECT.md | as_of=2026-08-21] ChoiceQR booking жив; web GTM `GTM-T5F4VVGF` и GA4 `G-ZYB0MZ1CSR` существуют.
- [VERIFIED_FACT | evidence=github | source=GitHub Issue #18 | as_of=2026-08-24] Одна контролируемая заявка дала ровно один `booking_request`/GA4 trigger без имени, телефона, e-mail или комментария. Это доказательство заявки CREATED, не менеджерского CONFIRMED.
- [VERIFIED_FACT | evidence=static | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20] Для Syrve Cloud описаны reserve API: выбор организации/залов, workload, create, status, change tables, cancel и webhook settings; `reserve/create` требует initial `tableId`.
- [VERIFIED_FACT | evidence=github | source=GitHub Issue #25 | as_of=2026-08-24] ChoiceQR Open API документирует read-only list/get booking, стабильный ID, UTM и статусы CREATED/CONFIRMED/CANCELLED/IN_PROGRESS/NOT_CAME/COMPLETED; booking webhooks публично не подтверждены.
- [UNKNOWN | needed_from=ChoiceQR owner/API access] Фактические ChoiceQR token/scopes, доступность брони Margariteros, поля click IDs/metadata, paging/rate limits и возможность получать изменения без webhook.
- [UNKNOWN | needed_from=Syrve owner/API access] Реальный Syrve organization/sections/tables, API scopes, webhook delivery и связь reserve с закрытым счётом.
- [UNKNOWN | needed_from=Syrve owner/API access] Syrve loyalty/customer/discount/closed-bill capabilities, подходящий стабильный идентификатор гостя, способ безопасной выдачи и отмены награды.
- [UNKNOWN | needed_from=owner] Telegram bot/runtime/database, правило награды и какая персональная информация допустима в журнале.

## 7. Релевантная карта проекта

```text
Google Ads / QR / social UTM
  → margariteros.bar / ChoiceQR booking
  → ChoiceQR booking GUID + статус
  → Conversion Bridge (polling + state machine + ledger)
  → Syrve reserve / Syrve status or closed bill
  → GA4 + Google Ads offline conversion

Telegram deep link / QR
  → Margariteros Club frontend
  → referral binding / status request
  → Syrve customer + paid check + reward issuance
  → member status / admin audit
```

Существующие границы: ChoiceQR остаётся гостевой формой и менеджерским приложением; Syrve — источник правды о reserve и фактическом визите; GTM/sGTM не заменяет bridge. В репозитории нет подтверждённого кода такого bridge, Telegram bot, БД или production-site runtime.

## 8. Scope

- Исследовать и сравнить реализацию bridge как маленького сервиса polling-first, а не webhook-only.
- Описать state machine, таблицы/журналы, идемпотентность, retries, reconciliation и операторскую диагностику для брони.
- Описать API boundary ChoiceQR ↔ bridge ↔ Syrve ↔ GA4/Google Ads и допустимую атрибуцию.
- Описать Club на Syrve: как связать referral code с гостем/продажей, как доказать первую оплаченную покупку, выдать/отозвать награду и аудировать это без дублей; Telegram оставить интерфейсом deep-link/QR, статуса и выдачи.
- Выдать несколько подходящих вариантов runtime/хостинга/хранилища, но не считать текущий репозиторий runtime сайта.

## 9. Non-goals

- Автопубликация, реклама, изменение GTM/Google Ads/ChoiceQR/Syrve, deploy или выдача награды.
- AI-агент, который сам решает статусы, начисляет деньги или общается с гостями без правил.
- Массовая Telegram-рассылка, отдельная ручная система лояльности вне Syrve, скидки/платежи вне подтверждённого Syrve-механизма и Meta CAPI.
- Передача raw PII в GA4, Google Ads, GitHub или технические логи.
- Возвращение снятого BrightBean или создание второго сайта/планировщика без подтверждённого runtime.

## 10. Ограничения и правила сохранения

- Секреты только в утверждённом secret store; в GitHub/репозиторий не попадают.
- ChoiceQR consent не обходить; Advanced Consent Mode не объявлять работающим без live proof.
- Не дублировать ChoiceQR Meta Pixel/CAPI через GTM.
- Любая запись в ChoiceQR/Syrve и любая публикация/изменение рекламной цели требуют отдельного разрешения владельца.
- Telegram не должен быть источником истины о покупке, балансе или выдаче: он показывает и запускает только разрешённые действия, подтверждённые ядром Syrve.
- Конверсионный ledger хранит минимум данных; PII из operational mapping изолирован от analytics и логов.
- Внешний номер Syrve reserve должен связываться со стабильным ChoiceQR booking GUID; каждая бизнес-операция повторяется безопасно.

## 11. Известные проблемы, риски и конфликты

- [CONFLICT | sources=GitHub Issue #27; owner message 2026-08-24] #27 говорит о ручной qualification до POS-контракта, но владелец уточнил Syrve как основу рефералки. Manager должен внести это изменение в Issue только после отдельного write plan/подтверждения.
- [CONFLICT | sources=GitHub Issue #27; GitHub Issue #1] #27 указан дочерним к #1, хотя #1 ограничен SMM-ритмом W33–W34 и прямо исключает сервисные подключения. Manager должен отдельно решить корректного родителя до GitHub write.
- [REPORTED | source=docs/growth-os/HANDOFF-2026-08-21-choiceqr-booking-ads.md | as_of=2026-08-21 | verification_needed=ChoiceQR API live read] Публичная документация не подтверждает booking webhooks, поэтому webhook-only дизайн рискован.
- [REPORTED | source=PROJECT.md | as_of=2026-08-21 | verification_needed=public MCP readback] Подготовленная GTM-публикация ещё не доказана как live для всех гостей.
- [UNKNOWN | needed_from=ChoiceQR/Syrve] Без click ID или согласованного consent нельзя обещать индивидуальную offline-attribution Google Ads; остаётся агрегированная UTM-аналитика.

## 12. Предположения и неизвестное

- [ASSUMPTION | validation_needed=Syrve live API audit] Syrve может стать источником правды для Club: это надо подтвердить на конкретном tenant и его доступных loyalty/customer/discount/bill APIs, а не выводить из наличия reserve API.
- [ASSUMPTION | validation_needed=ChoiceQR API audit] Polling списка/деталей booking может надёжно заменить webhook при cursor, watermark, overlap window и reconciliation.
- [UNKNOWN | needed_from=owner] Точная награда Club: размер, получатель, момент выдачи через Syrve, срок действия, правила отмены.
- [UNKNOWN | needed_from=owner/runtime audit] Приемлемые стоимость, платформа Telegram bot, страна/срок хранения данных, канал операторских уведомлений.

## 13. Вопросы для внешнего исследования

1. Как безопасно построить polling-first integration для ChoiceQR booking statuses: cursor/watermark, pagination, rate limit, backoff, overlap, reconciliation и dead-letter операции?
2. Как смоделировать бронь как state machine, включая CREATED → CONFIRMED, отмену/изменение, создание/обновление/cancel Syrve reserve, и какие idempotency keys нужны на каждой границе?
3. Как корректно использовать Syrve reserve API и webhooks для доказательства визита/закрытого счёта, не назначая стол неверно и не создавая дубль?
4. Какие Syrve Cloud API/механизмы подходят для customer/loyalty/referral: привязки гостя, доказательства первого оплаченного чека, выдачи/отмены награды и аудита? Какие операции доступны только через POS/UI и как это меняет MVP?
5. Какие официально поддерживаемые Google Ads offline-conversion варианты возможны при наличии только UTM либо gclid/wbraid/gbraid; где обязателен consent и как проверить diagnostics?
6. Какой минимальный Telegram frontend обеспечивает signed deep link/QR, one-time binding, duplicate `/start` protection, показ статуса и выдачу, не дублируя Syrve как базу покупки и награды?
7. Следует ли использовать один технический runtime для двух сервисов или изолировать их с первого релиза; сравнить по риску PII, простоте эксплуатации и стоимости.

## 14. Решения владельца, которые ещё открыты

- Правило награды Club и разрешение публично его обещать.
- Правило награды, момент выдачи в Syrve и допустимый Telegram UX для её получения.
- Согласие на запрос ChoiceQR API application/token и Syrve API credentials.
- Нужна ли сейчас только подтверждённая бронь или также `visit_completed` из закрытого чека в первом релизе.

## 15. Решения внутреннего Architect после возврата PRD

- Выбрать, остаются ли Conversion Bridge и Telegram frontend разными deployable сервисами или получают общий runtime при сохранении Syrve как источника истины Club.
- Выбрать конкретные контракты, storage, очередь/retry, authentication, secret injection, observability, schema migration и deployment boundary на основании live доступа.
- Решить точное соответствие ChoiceQR statuses → Syrve actions → analytics events и контракт Syrve paid check → Club issuance/reversal.
- Подготовить корректный Epic/Issue graph только после owner choices и проверки API.

## 16. Что внутренний Architect обязан перепроверить

- Реальные ChoiceQR API response schemas, pagination, status history, UTM/click-ID/metadata and webhook capabilities на тестовой брони.
- Реальный Syrve Cloud tenant, organization/sections/tables, reserve permissions, webhook contract и связь с закрытым bill.
- Google consent/legal basis, supported offline-conversion import method, diagnostics и живую публикацию GTM.
- Telegram runtime, bot ownership, allowed member-data fields, retention, access, deep-link and issuance UX; а также конкретный Syrve flow выдачи/reversal.
- GitHub Issue #27 parent/drift и текущие Project #8 statuses перед созданием/изменением задач.

## 17. Источники

- `PROJECT.md`, 2026-08-21 — каноническая цель, live/unknown границы воронки.
- `docs/growth-os/HERMES-START.md`, 2026-08-24 — рабочие сервисы, запреты, секреты и MCP boundary.
- `docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md`, 2026-08-20 — proposed bridge, Syrve reserve endpoints and preservation rules.
- `docs/growth-os/HANDOFF-2026-08-21-choiceqr-booking-ads.md`, 2026-08-21 — доказательство `booking_request`, ChoiceQR API/webhook boundary.
- GitHub Issues [#17](https://github.com/afonin900/Margariteros.bar/issues/17), [#18](https://github.com/afonin900/Margariteros.bar/issues/18), [#21](https://github.com/afonin900/Margariteros.bar/issues/21), [#23](https://github.com/afonin900/Margariteros.bar/issues/23), [#25](https://github.com/afonin900/Margariteros.bar/issues/25), [#26](https://github.com/afonin900/Margariteros.bar/issues/26), [#27](https://github.com/afonin900/Margariteros.bar/issues/27), checked 2026-08-24.
- GitHub Project [Margariteros Bar Ops #8](https://github.com/users/afonin900/projects/8), checked 2026-08-24.
- [ChoiceQR Open API documentation](https://open-api.choiceqr.com/docs) and [Syrve Cloud API documentation](https://api-eu.syrve.live/docs) — official sources to re-check live, since the rendered docs were not machine-readable in this session.

## 18. Ожидаемый ответ

Используй настроенный контракт PRD Спецификатора. Верни один скачиваемый Markdown-файл спецификации: conversion bridge и Syrve-based Club с Telegram-only frontend, comparison of Syrve options, contracts/state diagrams, privacy/consent boundaries, verification plan, risk register and owner decisions. Не создавай Epic, GitHub Issues, исполнительные задачи или окончательный план по файлам.
