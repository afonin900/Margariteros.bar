# Границы реализации

> **Коррекция 2026-08-28:** блоки «Из таска 02» ниже описывают отменённый prototype и не являются интерфейсом для новых tickets. Ticket 03 удаляет этот код. Канон: RefRef владеет partner/referral/portal; Syrve штатно владеет discount/reward/balance; Margariteros хранит только integration delivery/reconciliation metadata.

## Из исправленного таска 03 — официальный RefRef

- Canonical checkout: `/Users/afonin900/Github/refref`, upstream `https://github.com/amicalhq/refref.git`, pinned audited HEAD `81af934fec3b20990a4d9af7ed472d0d14d73a82`.
- Штатные seams: `POST /v1/track/signup`, `POST /v1/track/purchase`, `GET /r/:code`, `GET /r/:productSlug/:code`.
- RefRef владеет participant/refcode/referral/event/portal; Syrve adapter доставляет native Loyalty event/readback.
- Upstream `/r` переносит base64 participant fields в URL; для публичного QR нужен отдельный privacy-safe seam.
- Bootstrap evidence: `/Users/afonin900/Github/refref/docs/margariteros-bootstrap.md`.

## Из таска 04 — Syrve native readback boundary

- Hook: штатный `apps/api/src/services/events.ts:createEvent` после записи RefRef event; adapter opt-in.
- `syrve-native` проверяет paid+closed order и читает native transaction outcome; он не рассчитывает 10%/5 PLN и не вызывает `wallet/topup`.
- `packages/coredb` хранит только delivery/idempotency/reconciliation metadata, не reward balance.
- Без подтверждённого credential/OpenAPI runtime возвращает `not_ready`; live HTTP write path отсутствует.

## Из таска 05 — R Club web и Telegram Mini App

- RefRef `/r` передаёт только opaque `refcode`; base64 participant/name/email удалены из public URL.
- Общий responsive `/club` работает в браузере и Mini App; сервер валидирует raw Telegram `initData` через HMAC и свежий `auth_date`.
- Единственное имя Telegram secret: `TELEGRAM_CLUB_BOT_TOKEN`; `initDataUnsafe` не является источником identity.
- Margariteros `/<locale>/club/` ведёт в portal через `PUBLIC_RCLUB_PORTAL_URL`; без URL показывает honest not-configured.
- Durable participant creation остаётся на штатном `POST /v1/widget/init` после настройки RefRef product/program и identity mapping.

## Границы, решённые в спецификации

- Syrve Loyalty — источник идентичности гостя, оплаченного чека, скидки, баланса и транзакции.
- Собственный Club-модуль хранит только техническое состояние регистрации, opaque referral code, idempotency keys, связь с Syrve IDs и журнал обработки без PII в логах.
- Публичный контракт ссылки стабилен: `/r/<opaque-code>`. Для POC он ведёт в ANDREI10 flow; дальнейшее подключение RefRef не должно менять уже выданные URL и QR.
- Telegram запрашивает номер через native contact request, сверяет `contact.user_id` с отправителем и сразу выдаёт provisional link. До активации URL показывает `pending`.
- Регистрация кандидата и активация партнёра — разные состояния. Автоматическое одобрение, многоуровневая сеть и POS-регистрация не входят в P0.
- Начисление 5 PLN выполняется ровно один раз на закрытый оплаченный чек; повторная доставка события не создаёт вторую транзакцию.
- Если актуальный Syrve API credential или официальный post-close contract не доказаны, интеграция остаётся в `not_ready`, а начисление не имитируется.
- Физическая кассовая проверка — отдельная ступень приёмки. Staging честно показывает `awaiting_pos_check`.

## Стек и команды

- Существующее приложение: Astro 7 SSR, Node adapter standalone, TypeScript strict в `site/`.
- Установка только при необходимости: `npm --prefix site ci`.
- Проверки: `npm --prefix site run check`, `npm --prefix site run build`, `npm --prefix site test`.
- Полный release gate: `npm --prefix site run verify:release`.

## Правила для исполнителей

- Сначала прочитать корневой `AGENTS.md`, `docs/growth-os/HERMES-START.md`, `PROJECT.md`, этот файл и свой ticket.
- Не изменять существующие unrelated dirty files. Добавлять Club вертикально и изолированно.
- Не делать deploy, публикацию, GitHub write, обращение в поддержку или включение общей live-программы.
- Не выводить телефон, card number, API token, guest ID или machine/POS ID в Git, тестовые snapshots, логи и отчёт.
- Не устанавливать отсутствующие зависимости самостоятельно: вернуть `BLOCKED` с точным названием зависимости.
- Любая live-операция Syrve должна быть узкой, обратимой, иметь readback и выполняться только в ticket 04.

## Из таска 01 — доказательства и контракт

- Публичная ссылка: `/r/<opaque-code>`; до активации статус `pending`, после — `active`.
- Ключ идемпотентности начисления: `syrve-check:<externalCheckId>:partner-reward:v1`.
- Live guest/coupon/paid-close/transaction считаются `unknown`, пока ticket 04 не даст отдельный readback; историческое свидетельство их не заменяет.
- Evidence pack: `.autopilot/2026-08-28-margariteros-club-pilot--wip/evidence/01-evidence-pack.md`; краткий вход: `docs/club/README.md`.

## Из таска 02 — Club core

- Вход модуля: `site/src/lib/club/index.ts`.
- `createClubDomain()` создаёт изолированный in-memory domain для P0 и тестов.
- Регистрация и модерация: `registerCandidate`, `activatePartner`, `rejectCandidate`, `suspendPartner`.
- Чеки и ledger: `qualifyCheck`, `reverseReward`, `listLedger`, `listAudit`.
- Syrve boundary: `SyrveAdapter`; реализации `createFakeSyrveAdapter` и `createNotReadySyrveAdapter`.
- Reversal пока создаёт компенсирующую запись `awaiting_reversal_contract` и не вызывает Syrve без доказанного контракта.
- Concurrent одинаковые `qualifyCheck` сериализуются process-local через in-flight idempotency key; multi-instance гарантия потребует durable transactional store.
- `findCandidateByReferralCode(code) -> PublicReferralView | undefined`; public view содержит только `referralCode` и текущий `status`.

## Из таска 03 — регистрация и referral surface

- `POST /api/club/register` и `POST /api/club/telegram-contact` возвращают `{status: "pending", provisionalUrl: "/r/<opaque-code>"}`.
- Telegram contact endpoint принимает только contact текущего Telegram user; чужой contact отклоняется.
- `GET /r/<code>` использует core lookup и показывает public states без PII; pending не обещает скидку.
- Локальная registration page: `/<locale>/club/`; runtime намеренно in-memory до выбора durable store.
