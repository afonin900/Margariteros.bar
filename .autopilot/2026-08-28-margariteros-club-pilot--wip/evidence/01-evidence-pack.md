# Margariteros Club — evidence pack (2026-08-28)

## Итог

Статус P0: `NOT_READY / awaiting_live_readback`. Исторический PRD и спецификация задают правильную границу, но в текущем checkout нет свежего безопасного readback Syrve UI/API, application credential metadata или записи первого партнёра. Поэтому live write, начисление и утверждение кассовой цепочки запрещены.

## Источники и расхождения

| Источник | Дата | Класс | Вывод |
|---|---:|---|---|
| `docs/PRD_INPUT_CLIENT_ACQUISITION_BRIDGE_AND_CLUB_2026-08-24.md` | 2026-08-24 | исторический PRD | owner intent; Cloud API, paid-close, loyalty, webhooks помечены как `REPORTED/UNKNOWN`, не live proof |
| `.autopilot/2026-08-28-margariteros-club-pilot--wip/2026-08-28-brief.md` | 2026-08-28 | owner brief | заявлено, что API работал и первый партнёр заведён; подтверждающий артефакт не найден |
| `docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md` | 2026-08-20 | исторический handoff | Syrve Cloud — источник резерва; не доказательство Loyalty customer/wallet API |
| официальный API URL `https://api-eu.syrve.live/docs` | проверка 2026-08-28 | документация | URL зафиксирован в проектных источниках; автоматический fetch недоступен, live schema остаётся `unknown` |

## Live evidence matrix

| Объект | Сейчас | Что нужно для приёмки |
|---|---|---|
| Loyalty | **live UI readback 2026-08-28: Margariteros connected; свежий POS diagnostic получен** | повторить diagnostic перед POC |
| Guest 10% | **live UI readback 2026-08-28: active; actions `TEST` и `PARTNER ANDREI10`** | подтвердить связанный coupon/series |
| Reward 5 PLN | **live UI readback 2026-08-28: inactive; exchange/webhook off; 0 actions** | только после контракта включать узкую reward action |
| coupons/action series | **live UI CouponsList 2026-08-28: 0 entries** | coupon/series и paid check остаются `unknown` |
| первый партнёр | brief says owner is first partner; identity/ID unknown | operator readback with opaque ID only |
| API credential | project OpenBao shelf has no Syrve credential according to current spec | metadata only: provider, scope, expiry/rotation; value never exported |
| paid closed check / wallet transaction | not evidenced | one test check, external ID redacted, balance delta and one transaction |

## Official contract inventory

OpenAPI paths (application API contract; credential and tenant access still require proof): `/api/1/loyalty/syrve/customer/create_or_update`; `/api/1/loyalty/syrve/customer/info`; `/api/1/loyalty/syrve/customer_category/add`; `/api/1/loyalty/syrve/customer/card/add`; `/api/1/loyalty/syrve/customer/wallet/topup`; `/api/1/loyalty/syrve/transactions/by_revision`. Schemas and permissions must be read back from the authorized OpenAPI/runtime; UI connection is not application API proof.

## RefRef verdict

RefRef repository `https://github.com/amicalhq/refref` is AGPL-3.0 and explicitly alpha/breaking-change risk (official README, checked 2026-08-28). P0 verdict: **do not fork or deploy whole RefRef**. Keep own `/r/<opaque-code>` seam, ledger, consent, Syrve adapter and POS evidence; consider only isolated UI/pattern reuse after license and upgrade spike.

## Reproducible next readback (read-only first)

1. UI: open Loyalty → Margariteros, record connected state, POS diagnostic timestamp, Guest actions and Reward flags; export screenshot with names/phones/cards removed.
2. UI: open CouponsList and record `entries=0`; do not infer a coupon/series or paid check.
3. API: with credential supplied by runtime (never print it), GET/read the six paths above; save timestamp, HTTP status, schema version and correlation ID with IDs/PII redacted.
4. POS: only a bar operator can produce physical proof: apply one test code, close+pay, then read back one discount, balance delta and one transaction; repeat readback must not credit again.

No support request, live mutation, deploy, publication or GitHub write was made.
