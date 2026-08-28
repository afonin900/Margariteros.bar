# Спецификация: пилот партнёрской системы Margariteros Club

## Задача

Бар уже подготовил в Syrve Loyalty тестового партнёра, скидку 10% и оболочку бонусной программы 5 PLN, но цепочка не доведена до проверяемого закрытого чека. Партнёру пока нельзя автоматически зарегистрироваться, получить постоянную ссылку/QR и увидеть доказанное начисление без ручной работы и риска дублей.

## Решение

Появится ограниченный пилот из двух последовательных контуров:

1. **Кассовое доказательство** — один тестовый партнёр, один тестовый купон, один оплаченный закрытый чек: гость получает 10%, партнёр получает ровно 5 PLN, повторный readback не создаёт дубль.
2. **Основа автоматизации** — self-hosted RefRef управляет партнёрами, регистрацией, referral links, атрибуцией и кабинетом; интеграционный адаптер связывает RefRef с нативными программами Syrve. Telegram-бот и обычный польский web открывают одну R Club Mini App.

Syrve остаётся источником истины для гостя, категории, карты, кошелька, скидки и бонусной транзакции. RefRef — источник истины для партнёра, referral code, attribution и partner portal. Допустим только технический integration log для доставки событий и reconciliation; он не рассчитывает награду, не хранит бонусный баланс и не подменяет Syrve Loyalty.

### Архитектурная коррекция владельца 2026-08-28

Эта коррекция отменяет все ниже расположенные формулировки про «собственный Club backend/domain/reward ledger» и про перенос полного RefRef за пределы P0. Созданный в ticket 02 custom Club-domain является ошибочной веткой и должен быть удалён отдельным исправляющим ticket. Обязательная архитектура: **RefRef → интеграционный адаптер → штатный Syrve Loyalty**, с Telegram Mini App и обычным web R Club как двумя входами в один интерфейс.

## Результат исследования

До реализации в репозитории появляется отдельный evidence-документ, который:

- находит и сверяет прежний PRD партнёрской системы с текущим owner brief;
- восстанавливает датированные доказательства работы Loyalty UI/API и отделяет их от свежего readback;
- ищет credential только по каноническим проектным путям: OpenBao metadata, deployment env names, `.env.example` и старые исследования; значения не выводятся;
- фиксирует, что project OpenBao shelf сейчас не содержит Syrve credential, и формулирует support request только при доказанном отсутствии application API access;
- сравнивает native Syrve registration/referrer, coupon, virtual-card и RefRef adapter flows;
- выдаёт лицензионный и upgrade verdict по RefRef alpha/AGPL;
- включает live evidence: активная 10% программа, пустая Reward 5 PLN, пустой доступный список купонов и конфликт action series без выпущенного coupon.

Это обязательный deliverable P0, а не фоновая заметка.

## Пользовательские истории

| # | Метка | История | Приёмка |
|---|---|---|---|
| 1 | R01–R04, R23 | Как владелец, я вижу свежий readback Syrve/Loyalty/API, чтобы не строить на старом предположении | зафиксированы источник, дата, доступные операции и `unknown` |
| 2 | R05, R11 | Как владелец, я понимаю, нужен ли support/API enablement | обращение создаётся только при доказанном missing scope и отдельном разрешении |
| 3 | R06–R09 | Как партнёр, я в будущем получаю собственный кабинет, ссылку и QR | P0 задаёт стабильные contracts; RefRef reuse оформлен отдельным решением после POC |
| 4 | R10 | Как владелец, я могу позже разрешить приглашения партнёр→партнёр | в P0 глубина сети равна 1; рекурсивная/многоуровневая модель отложена |
| 5 | R12–R14 | Как кандидат, я передаю телефон в личном чате Telegram и не создаю дубль гостя | контакт принадлежит отправителю; телефон нормализован; create-or-update идемпотентен |
| 6 | R15, R20–R21 | Как кандидат, я нажимаю «Стать партнёром», регистрируюсь и вижу статус | создаётся `pending`; после admin activation выдаются link/QR |
| 7 | R16, R25–R26 | Как приглашённый гость, я предъявляю тестовый код и получаю 10% | в закрытом чеке видны исходная сумма, 10% и итог; используется только тестовый код |
| 8 | R17–R19 | Как партнёр, я получаю 5 PLN после закрытого оплаченного чека | баланс до/после отличается ровно на 5 PLN; одна transaction |
| 9 | R22, R35i | Как бармен, я выполняю короткий кассовый сценарий без настройки системы | runbook: идентифицировать код → применить → закрыть → передать технический ID |
| 10 | R24, R27 | Как владелец, я получаю работающую основу и staging-пилот | код, тесты, runbook и readback; публичный запуск только по отдельному «можно» |
| 11 | R28–R31, G01 | Как владелец, я не трачу внимание и дорогую модель на рутину | вопросы только по бизнес-развилкам; Luna/Terra для ограниченных тасков |
| 12 | R32i | Как система, я безопасно обрабатываю повторный `/start`, регистрацию и событие чека | одинаковый idempotency key возвращает прежний результат |
| 13 | R33i | Как гость, я не оставляю телефон или баланс в Git, аналитике и обычных логах | PII-redaction tests; логи содержат только opaque IDs |
| 14 | R34i | Как оператор, я могу увидеть начисление, дубль и reversal | ledger append-only; reversal отдельной компенсирующей записью |

### Первый запуск и пустые состояния

- До настройки окружения локальный backend стартует с `SyrveAdapter` в режиме `disabled`; health остаётся зелёным, live write возвращает понятный `not_configured`.
- Новый Telegram-пользователь видит только «Стать партнёром» и объяснение, зачем нужен телефон.
- Пустой кабинет показывает `pending` или «Пока нет подтверждённых визитов», а не нулевой обещанный заработок.
- В пустом admin-списке есть следующий шаг: создать тестовую заявку через fixture, без создания live-партнёра.

### Неверный ввод, сбои и прерывания

- Телефон принимается только через Telegram `request_contact` в private chat и только если `contact.user_id == message.from.id`; ручной текстовый номер не подтверждает владение.
- Невалидный referral code возвращает нейтральное «Приглашение не найдено» без утечки существования партнёра.
- Повторный `/start` и повторная отправка contact возобновляют тот же профиль.
- Ошибка Syrve не переводит `pending` в `active`; операция остаётся `retryable` с correlation ID.
- Таймаут после внешней записи требует readback перед retry.
- Никакое начисление не выполняется по `scan`, open order или unpaid/cancelled check.

### Рост, границы и последствия

- P0: один партнёр, один тестовый код, один чек. P1: ограниченный allowlist партнёров. Self-service auto-activation запрещён до лимитов и антифрода.
- Один invitee связывается максимум с одним inviter; rebind возможен только администратором с audit reason.
- Минимальная сумма, исключённые позиции, дневные/месячные лимиты и self-referral остаются обязательными placeholders перед публичным запуском.
- Возврат не удаляет начисление: создаёт компенсирующую отрицательную запись и вызывает Syrve только после отдельного подтверждённого контракта.
- Сотрудник видит телефон только в операционном Syrve/админ-контуре по роли; партнёр видит агрегаты, не данные приглашённых гостей.
- Возможность регистрации на POS проверяется как read-only UX observation и описывается в runbook, даже если реализация откладывается.
- Режим регистрации Syrve исследуется отдельно: наличие create/update/referrer API не означает, что public self-registration безопасно включать.

## Решения по реализации

### Канонический P0

Использовать существующую активную скидочную акцию `PARTNER — ANDREI10 — 10%`, но перед тестом выпустить ровно один тестовый купон в связанной серии и создать одну внутреннюю reward-акцию на 5 PLN. Не включать бонусную программу, пока action, ограничения и readback не проверены визуально.

Если Syrve Loyalty не умеет выразить «5 PLN после закрытого оплаченного чека» без преждевременного начисления, нативную Reward-программу не включать. Тогда P0 доказывает скидку, а начисление выполняется вручную через официальный `wallet/topup` только после получения application API credential и повторного readback. Это честный fallback, а не имитация автоматики.

### Модель данных RefRef и интеграции

Используются штатные сущности RefRef `program`, `participant`, `refcode`, `referral`, `event`, `reward` и штатные guest/program/wallet/transaction сущности Syrve. Между ними хранится только secret-safe mapping opaque RefRef participant/event ID ↔ Syrve customer/order/transaction ID и delivery status. Сумма 5 PLN задаётся нативным правилом Syrve; RefRef не является кошельком.

### Контракты Syrve

- `customer/create_or_update`: создаёт/обновляет гостя, сохраняет consent flags, поддерживает `referrerId`.
- `customer/info`: readback категорий, карт и `walletBalances`.
- `customer_category/add`: присваивает `PARTNERS` только после activation.
- `customer/card/add`: выдаёт карту, если выбран card flow; P0 предпочитает существующий coupon flow.
- `customer/wallet/topup`: строго положительный credit; reversal использует отдельный доказанный механизм, не отрицательное значение наугад.
- `transactions/by_revision`: reconciliation начисления.

Application API credential хранится только в OpenBao/Dokploy env. Текущая проектная полка такого ключа не содержит; UI-доступ не подменяет API proof.

### Telegram и web

- Bot command `/start <signed-code>` создаёт или возобновляет candidate session.
- Кнопка contact запрашивает телефон добровольно; отказ оставляет пользователя без регистрации, но не блокирует просмотр публичной информации.
- Mini App валидирует `initData` на backend.
- Обычный web с Google/Apple — P1; телефон всё равно требует отдельной верификации/consent.
- Stable first-party URL имеет форму `/r/<opaque-code>`; напечатанный QR не содержит PII и не меняется при замене RefRef/UI.
- Сразу после регистрации кандидат получает provisional link. До admin activation ссылка показывает статус `pending` и не обещает скидку; после activation тот же URL открывает инструкции/QR для связанного Syrve coupon code.
- На POC `/r/<opaque-code>` однозначно отображает тестовый ANDREI10 flow; касса применяет связанный coupon, поэтому ссылка и скидка образуют одну проверяемую цепочку, даже если физическая передача в POS остаётся сканированием/кодом.

### RefRef

Self-host официальный `amicalhq/refref` обязателен в P0. Используются его participant signup, refcode redirect, referral attribution, event tracking и partner portal. Так как upstream не содержит Syrve provider/payout connector, добавляется узкий adapter на event boundary; внутренний RefRef reward record может быть только отображением статуса нативной операции Syrve, но не источником суммы или баланса.

RefRef разворачивается отдельным приложением, чтобы AGPL-код и upstream updates не смешивались с Astro-сайтом. Основной Margariteros показывает вкладку R Club, ведущую на один URL RefRef-based web app; тот же URL открывает Telegram Mini App.

### Экономный маршрут моделей

- Luna: browser read-only, официальная документация, repo search, fixtures и простые тесты.
- Terra: Syrve adapter, Telegram integration, schema migrations и deployment packaging.
- Sol: спецификация, security/privacy решения, repair противоречивого evidence и blind acceptance.
- Дорогая модель не повторяет аудит Luna/Terra; получает итоговые факты и diff.

### Наблюдаемость и безопасность

- Structured logs: correlation ID, opaque partner/check IDs, status; без телефона, имени, card number, QR payload и баланса приглашённого.
- Idempotency: `syrve-check:<externalCheckId>:partner-reward:v1`.
- Audit trail append-only; ручная корректировка требует reason.
- Webhook без подписи/allowlist не меняет ledger.
- Health не зависит от Syrve; readiness явно показывает adapter status.

## Границы и швы

| Модуль | Владеет | Выставляет | Прячет |
|---|---|---|---|
| `refref-upstream` | participant, refcode, referral, events, portal | штатные RefRef API/routes | attribution и partner UI |
| `syrve-native-adapter` | доставка RefRef conversion в Syrve | customer/program/order readback и native Loyalty trigger | auth, retries, schemas, redaction |
| `r-club-app` | Telegram Mini App + обычный web вход | validated `initData`, web auth, partner portal | session, consent, locale |
| `margariteros-site` | навигация в клуб | R Club tab/link | не хранит partner/loyalty state |
| `pilot-evidence` | кассовый runbook и readback | `verifyPilot(evidence) -> verdict` | PII-safe evidence normalization |

Главный тестовый шов — RefRef event → Syrve native adapter → Syrve transaction readback. Интеграционные tests используют recorded redacted fixtures; live POC проверяется отдельным evidence verifier.

## POC: порядок и приёмка

1. Read-only: программа 10% активна; Reward 5 PLN выключена; купоны/акции инвентаризированы.
2. Подготовка: один тестовый coupon code; одна reward action; никаких массовых правил и auto-activation.
3. Preflight: баланс партнёра, статус купона, POS sync time, screenshot настроек без PII.
4. Касса: применить код к тестовому заказу, подтвердить 10%, оплатить и закрыть.
5. Readback: closed+paid, одна скидка, баланс +5 PLN, одна transaction, повторный readback без дубля.
6. Если bonus не начислен — не делать ручные повторные клики; сохранить evidence, выключить reward и перейти к API fallback.

Staging-пилот считается запущенным, когда registration/link/status работают на тестовом runtime и health/readiness зелёные. Кассовая часть получает честный статус `awaiting_pos_check`, пока бармен физически не проведёт чек. Отсутствие бармена в текущей сессии не делает весь пилот «не запущенным», но запрещает называть скидку и reward принятыми.

POC не считается завершённым без физического действия бармена/владельца на POS. Агент готовит конфигурацию и точную карточку теста, но не изображает кассовый чек программно.

## Вне рамок

| Требование | Почему не сейчас |
|---|---|
| R05 — обращение в техподдержку | только если readback докажет отсутствующий API scope; внешнее сообщение требует отдельного разрешения |
| Google/Apple auth | Telegram Mini App и обычный web R Club входят в P0; дополнительные identity providers после пилота |
| R10 — многоуровневая сеть | высокий fraud/accounting риск, не нужна для первого чека |
| R22 — регистрация на кассе | POS UX сначала наблюдаем; P0 использует готового партнёра |
| R27 — публичный launch | deploy/staging возможен после кода; публичная активация отдельно разрешается владельцем |
| R34i — автоматический reversal | не включать без доказанного refund contract |

## Открытые места

- Боевые лимиты: минимальный чек, исключённые категории, максимум начислений, self-referral.
- Срок атрибуции и правила смены inviter.
- Application API credential и scopes Syrve; имя переменной `SYRVE_API_LOGIN`, значение не хранится в Git.
- Telegram Club bot token/username; имена `TELEGRAM_CLUB_BOT_TOKEN`, `TELEGRAM_CLUB_BOT_USERNAME`.
- Публичный домен Club и решение по AGPL/RefRef.
- Юридический текст согласия на телефон, retention и правила участия для Польши.

## Покрытие манифеста

| Требование | Раздел спецификации |
|---|---|
| R01–R05 | Истории 1–2; Контракты Syrve; Вне рамок |
| R06–R11 | Истории 3–4; RefRef; Telegram и web; Вне рамок |
| R12–R15 | Истории 5–6; Модель данных; Telegram и web |
| R16–R19 | Истории 7–8; Канонический P0; POC |
| R20–R22 | Истории 6, 9; Рост и границы; Вне рамок |
| R23–R27 | Истории 1, 7, 10; POC; Вне рамок |
| R28–R31 | История 11; Решение по моделям |
| R32i–R35i | Истории 12–14; Сбои; Наблюдаемость; POC |
| G01 | История 11; модельный маршрут Luna/Terra/Sol |
