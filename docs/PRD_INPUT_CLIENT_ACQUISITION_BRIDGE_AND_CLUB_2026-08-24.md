# Входной пакет для PRD Спецификатора: партнёрская система Margariteros на базе Syrve

> TARGET_AGENT: PRD Спецификатор
> PURPOSE: исследовать собственную партнёрскую и реферальную систему бара, в которой Syrve подтверждает визит и оплату, а web, Telegram Mini App и бот дают партнёру единый интерфейс.
> STATUS: датированный снимок, не источник живого состояния.

## 1. Метаданные снимка

- `captured_at`: 2026-08-24
- `repository`: `afonin900/Margariteros.bar`
- `branch` / `base_commit`: `main` / `6892004`
- `working_tree`: этот файл переписан и оставлен незакоммиченным для штабного агента, который ведёт коммит/пуш недельного плана.
- `github_checked_at`: 2026-08-24; Project #8 и Issues #17–#27 прочитаны read-only.
- `runtime_evidence_checked_at`: Syrve tenant/API, SyrveFront POS, OAuth, Telegram bot, `club.margariteros.bar` и инфраструктура не проверялись.
- `known_access_limits`: нет подтверждённых Syrve/ChoiceQR credentials, POS доступа, OAuth keys, Telegram bot token или deploy authority.
- `known_stale_sources`: `0_hq/tasks.md`, BrightBean PRD и старые roadmaps не канон; BrightBean снят и возвращать его нельзя.

## 2. Что нужно исследовать и специфицировать

Специфицировать **Margariteros Partner System** для гостиниц, хостелов, консьержей, гидов, инфлюенсеров, сотрудников и гостей, которые приводят посетителей.

Путь: партнёрская ссылка/QR → бронь или walk-in → заказ Syrve → закрытый оплаченный чек → подтверждённая конверсия → комиссия/выплата. ChoiceQR, собственная landing, QR, Google, Instagram и Telegram — входные каналы, не ядро. Это не AI-агент и не «только Telegram Club»: нужны детерминированные правила, ledger, защита от дублей и admin.

## 3. Конечный результат для пользователя

Партнёр в web-кабинете или Telegram видит ссылку, QR, promo assets, визиты, заработок и выплаты. Бар видит источник гостя, закрытый чек и начисление. Гость по визитке понимает, куда идти, и может открыть маршрут или присоединиться к Club.

## 4. Почему это нужно сейчас

[VERIFIED_FACT | evidence=github | source=https://github.com/afonin900/Margariteros.bar/issues/17 | as_of=2026-08-24] Нет доказанной связки от брони до фактического визита и закрытого счёта.

[ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation 6a8afeb9-4b94-83ed-84de-849634330625 and owner message 2026-08-24 | as_of=2026-08-24] Нужна партнёрская система на базе факта Syrve; Telegram — один из фронтендов, а не единственный продукт.

## 5. Контекст обсуждения и принятые решения

- [ACCEPTED_DECISION | authority=owner | source=referenced conversation | as_of=2026-08-24] Один продукт имеет три входа: web, Telegram Mini App, Telegram bot; они используют один backend и одну модель пользователя.
- [ACCEPTED_DECISION | authority=owner | source=referenced conversation | as_of=2026-08-24] На web нужны Google/Apple login. В Mini App — Telegram auth с серверной проверкой `initData`, без OAuth-кнопок во встроенном webview.
- [ACCEPTED_DECISION | authority=owner | source=referenced conversation | as_of=2026-08-24] У партнёра есть URL, QR и готовые брендовые story/post/flyer/визитки. Визитка ведёт прежде всего в бар: текстовый адрес и referral landing с маршрутами и join.
- [ACCEPTED_DECISION | authority=owner | source=referenced conversation | as_of=2026-08-24] Свой backend/ledger хранит партнёров, referral claims, комиссии и выплаты. Syrve — источник факта customer/reserve/order/closed paid check, не единственная база партнёрской программы.
- [ACCEPTED_DECISION | authority=project | source=PROJECT.md | as_of=2026-08-21] Raw PII запрещён в GA4/Ads/GitHub; клик или открытая форма не равны брони и визиту.

## 6. Подтверждённое текущее состояние

- [VERIFIED_FACT | evidence=static | source=PROJECT.md | as_of=2026-08-21] Живы ChoiceQR booking, web GTM `GTM-T5F4VVGF`, GA4 `G-ZYB0MZ1CSR`, Postiz и соцканалы.
- [VERIFIED_FACT | evidence=github | source=GitHub Issue #18 | as_of=2026-08-24] Одна тестовая ChoiceQR заявка дала один `booking_request`; это CREATED, не подтверждённая бронь и не визит.
- [REPORTED | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20 | verification_needed=live Syrve audit] Документированы Syrve reserve/status/cancel/workload/webhook candidates, но нет доказанного доступа Margariteros.
- [REPORTED | source=referenced conversation | as_of=2026-08-24 | verification_needed=official docs and live tenant] Syrve Cloud/SyrveFront могут дать customers, orders, external data, paid-close events, loyalty и webhooks.
- [UNKNOWN | needed_from=live audit] Нет доказанного runtime сайта, PostgreSQL, SyrveFront plugin loading, Syrve tenant rights, Google/Apple OAuth или Telegram bot.

## 7. Релевантная карта проекта

```text
Partner web / TG Mini App / TG bot
  → Partner Backend + PostgreSQL ledger
  → links, QR, claims, commissions, payouts, audit
  → adapters: ChoiceQR / own landing / QR / walk-in
  → Syrve Cloud and, if needed, SyrveFront POS plugin
  → reserve / order / closed paid check
  → conversion + commission
  → privacy-safe GA4 / Google Ads analytics
```

Деловой факт оплаты приходит из Syrve. Период атрибуции, расчёт комиссии, payout и audit не должны жить только в POS или Telegram.

## 8. Scope

- Partner registry: тип, статус, ставка/программа, links, QR, promo assets, payout state.
- Универсальные referral URLs/QR без телефона или PII; `ReferralClaim` с периодом действия для офлайн-визита без cookie.
- Booking adapters: связывают claim/reservation/Syrve reserve, но не привязывают ядро к ChoiceQR.
- Walk-in: POS operator выбирает партнёра, вводит код или сканирует QR; attribution пишется в order external data только при подтверждённом API contract.
- Closed-check: один раз создаёт conversion/commission; refund/reversal — отдельная корректировка.
- Web/PWA: Google/Apple, phone binding к Syrve customer, QR/link, visits, earnings, payouts, promo assets.
- Mini App: Telegram auth; bot: notifications, buttons, deep links. Admin: партнёры, claims, orders, commissions, adjustments, payouts, audit.

## 9. Non-goals

- Публикация рекламы/GTM/сайта, изменение боевых Syrve/ChoiceQR записей, бюджетов или ставок.
- AI-агент, который сам начисляет комиссию либо меняет статус заказа.
- L2/L3 network, массовые Telegram рассылки, Meta CAPI и автоматические выплаты в первом MVP.
- Telegram как единственный identity provider или база финансовых/заказных данных.
- PII в GA4, Ads, GitHub или логах.

## 10. Ограничения и правила сохранения

- Секреты только в OpenBao/Dokploy env.
- Google/Apple не дают надёжный телефон: нужен consent-aware verified phone binding к Syrve customer.
- `initData` Telegram валидируется на backend; webview OAuth проверяется по официальной документации.
- Комиссия payable только после closed paid check; повтор/возврат идемпотентны и аудируемы.
- Не дублировать ChoiceQR Meta Pixel/CAPI через GTM.

## 11. Известные проблемы, риски и конфликты

- [CONFLICT | sources=GitHub Issue #27; owner decision 2026-08-24] #27 — узкий ручной Telegram Club, а цель — Syrve-backed partner system с web, Mini App, bot и commission ledger. Manager правит GitHub contract только после write plan.
- [CONFLICT | sources=GitHub Issue #27; GitHub Issue #1] #27 является child SMM Epic #1, хотя системная интеграция и payouts шире его scope.
- [UNKNOWN | needed_from=live Syrve audit] Неизвестно, достаточно ли Cloud API для attribution/paid close или SyrveFront plugin обязателен.
- [UNKNOWN | needed_from=legal/owner] Consent, retention, partner agreement, tax/payout and phone handling для Польши/EU.

## 12. Предположения и неизвестное

- [ASSUMPTION | validation_needed=live POC] P0 докажет цепочку на одном test order: attach attribution → paid close → readback → one conversion/commission.
- [ASSUMPTION | validation_needed=architect] PostgreSQL event/outbox ledger нужен даже если Syrve хранит loyalty/referrer fields.
- [UNKNOWN | needed_from=owner] Commission model, hold period, refund/reversal, payout method, первые сегменты партнёров и первые три promo assets.

## 13. Вопросы для внешнего исследования

1. Какие текущие Syrve Cloud/Live APIs подтверждены для customers, `referrerId`, loyalty/wallet/cards, orders, paid/closed order, external data, reserves и webhooks?
2. Когда нужен SyrveFront plugin: можно ли cloud-only надёжно записать attribution и прочитать paid close; какие deployment/compatibility risks plugin?
3. Как построить idempotent event/outbox/reconciliation/reversal model для claim, closed order, commission и payout?
4. Как объединить Google/Apple OAuth, verified phone и Telegram identity без takeover/duplicate Syrve binding?
5. Какие официальные ограничения Google/Apple/Telegram для OAuth webview и Telegram `initData`?
6. Как генерировать referral card, 9:16 story, 1:1 post, flyer и 85×55 mm визитку из одного referral object; что обязательнее всего на landing?
7. Какие privacy, retention и DPA требования для телефонов, чека, commission/payout и Telegram уведомлений в Польше/EU?
8. Как подключать closed-check events к GA4/Google Ads без PII и не смешать measurement с accounting?

## 14. Решения владельца, которые ещё открыты

- Commission model, hold, reversal и payout.
- Первые сегменты партнёров и обязательные promo assets.
- P0: только paid-check proof или сразу reserve/ChoiceQR adapter.
- Разрешение на Syrve developer application, POC plugin, OAuth and Telegram credentials.

## 15. Решения внутреннего Architect после возврата PRD

- Cloud-only adapter versus SyrveFront plugin; P0 acceptance path.
- Data/event schemas, external-data keys, outbox, reconciliation, RBAC/audit.
- Deploy boundaries API/admin/web/Mini App/bot, after live infrastructure verification.
- ChoiceQR boundary, walk-in UX and attribution precedence.

## 16. Что внутренний Architect обязан перепроверить

- Live Syrve version, tenant/org/scopes, schemas, webhooks, loyalty and POS plugin capability.
- Controlled POC reserve/order/close/reversal with no PII logs.
- Current website runtime, approved domains and OAuth redirect URLs.
- GitHub Project #8 and weekly-plan changes made by штабной agent before a Manager write.

## 17. Источники

- `AGENTS.md`, `docs/growth-os/HERMES-START.md`, `PROJECT.md`, checked 2026-08-24.
- `docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md`, 2026-08-20 — proposal, not proof of live access.
- GitHub [#17](https://github.com/afonin900/Margariteros.bar/issues/17), [#18](https://github.com/afonin900/Margariteros.bar/issues/18), [#25](https://github.com/afonin900/Margariteros.bar/issues/25), [#26](https://github.com/afonin900/Margariteros.bar/issues/26), [#27](https://github.com/afonin900/Margariteros.bar/issues/27), [Project #8](https://github.com/users/afonin900/projects/8), read 2026-08-24.
- Referenced conversation [«Проект партнёрской системы Syrve»](chatgpt-conversation://6a8afeb9-4b94-83ed-84de-849634330625), read 2026-08-24 — owner intent/unverified candidates, not live evidence.
- [Syrve Cloud API](https://api-eu.syrve.live/docs), [ChoiceQR Open API](https://open-api.choiceqr.com/docs), official Google/Apple/Telegram docs — re-check live.

## 18. Ожидаемый ответ

Верни один скачиваемый Markdown-файл спецификации: P0 proof path, components, state/event diagrams, API/POS evidence checklist, auth/identity, referral/promo UX, commission/reversal/payout rules, privacy/risk register, options and owner decisions. Не создавай Epic, GitHub Issues, исполнительные задачи или окончательный plan by files.
