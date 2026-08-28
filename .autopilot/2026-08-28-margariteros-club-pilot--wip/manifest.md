# Манифест требований

Источник: `2026-08-28-brief.md`. Строку из этого списка может снять **только пользователь**.

| ID | Из брифа (дословно) | Статус | Основание | Где |
|----|---------------------|--------|-----------|-----|
| R01 | «backend работает на сервере, и мы разрабатывали его API» | done | Исторический API-контракт найден; текущий application proof честно отделён как pending live readback | evidence/01-evidence-pack.md |
| R02 | «в истории действий мы уже подтверждали, что API работает» | done | Предыдущее свидетельство найдено и классифицировано, без подмены свежей проверкой | evidence/01-evidence-pack.md |
| R03 | «где-то есть PRD агентской системы, в предыдущих сессиях было» | done | PRD 2026-08-24 найден и сверён | evidence/01-evidence-pack.md |
| R04 | «Сервер Loyalty у нас подключено, API работает» | in-ticket | Live UI подтвердил Margariteros Loyalty и свежий POS exchange; application API credential ещё не найден | ticket 01 |
| R05 | «если ... создание удаленных партнеров нужно включить API, у нас доступ в техподдержку есть» | deferred | Сначала доказать необходимость; обращение наружу требует разрешения | — |
| R06 | «для как фронтенда хотелось использовать проект на GitHub'е RefRef» | done | Official RefRef checkout поднят отдельно, upstream/pin/license/extension points зафиксированы | /Users/afonin900/Github/refref |
| R07 | «использовать его в виде чат-бота, чат Телеграма, сайта» | in-ticket | Выбрать минимальный пилот без потери будущих поверхностей | ticket 03 |
| R08 | «именно как выдача партнерских ссылок» | in-ticket | Live UI показывает активную action с кодом ANDREI10, но доступный CouponsList пуст; реальный coupon/series остаётся доказать | ticket 03 |
| R09 | «упрощенная партнерская система» | in-ticket | Упрощение реализуется конфигурацией RefRef + штатным Syrve, без custom domain | ticket 03 |
| R10 | «через сервер Loyalty расширенную партнерскую систему, что каждый может приглашать других» | deferred | Исследовать расширенный режим и риски многоуровневости | — |
| R11 | «для этого нужно включить режим регистрации» | in-ticket | Проверить, действительно ли требуется и как безопасно включается | ticket 01 |
| R12 | «Основной у нас, наверное, будет телефон» | in-ticket | Identity flow проектируется в RefRef R Club для Telegram и web | ticket 05 |
| R13 | «Телефон подтверждается ... запрос в Телеграм-боте номера телефона» | in-ticket | Проверить Telegram contact flow и подтверждение владения | ticket 03 |
| R14 | «создание партнера в сервере» | in-ticket | Нужен идемпотентный API-контракт и readback | ticket 02 |
| R15 | «ограниченное количество партнеров» | done | Native provider включается только explicit program customData; остальные программы RefRef не меняются | /Users/afonin900/Github/refref/apps/api/src/services/events.ts |
| R16 | «человек, приходя по ссылке партнера, просто получает скидку» | in-ticket | Live UI подтверждает активную 10% action, которая ссылается на ANDREI10/PARTNER-REFERRALS; сам coupon и кассовый чек не подтверждены | ticket 03 |
| R17 | «сервер начисляет партнеру, который его привел, бонусные баллы» | in-ticket | Live: Reward 5 PLN существует, но выключена и не синхронизирована с POS; начисление не доказано | ticket 02 |
| R18 | «бонусный счет в виде злотых» | in-ticket | Проверить валютную модель и отображение баланса | ticket 02 |
| R19 | «Конкретные цифры пока не ясны» | in-ticket | Пользователь выбрал рабочую цель 10% + 5 PLN; live подтверждает программы, но не полный coupon/reward/check flow | ticket 02 |
| R20 | «каждый хочет быть партнером» | in-ticket | Продумать self-service с защитой от злоупотреблений | ticket 02 |
| R21 | «кнопку стать партнером ... регистрируешься и получаешь свою партнерскую ссылку» | in-ticket | Спроектировать автоматический happy path и ошибки | ticket 03 |
| R22 | «желательно, чтобы на кассе, возможно, и можно было регистрировать» | deferred | Проверить POS/UI возможности; не блокировать Telegram-пилот | — |
| R23 | «сделать ресерч на первом этапе» | done | Evidence pack свёл live UI, API docs, history, RefRef и POS gaps | evidence/01-evidence-pack.md |
| R24 | «заложить основу этой партнерской системы» | in-ticket | Основа перенесена на официальный RefRef; bootstrap в ticket 03, adapter/UI/staging в tickets 04–06 | ticket 03, 04, 05, 06 |
| R25 | «чтобы можно было попробовать сделать первую скидку» | in-ticket | Пользователь разрешил контролируемый POC; после live readback рабочая цель уточнена как 10% гостю + 5 PLN партнёру | ticket 04 |
| R26 | «Я был первым партнером, эти данные где-то заведены у нас в сервере» | in-ticket | Найти запись и использовать как тестового партнёра без раскрытия PII | ticket 01 |
| R27 | «желательно пилот, чтобы был запущен» | deferred | Deploy/внешняя активация требуют отдельного разрешения | — |
| R28 | «Задай наводящие вопросы, можно в расширенном» | done | Открыты только реальные live/API/POS развилки | evidence/01-evidence-pack.md |
| R29 | «Максимально закрой самостоятельно» | done | Безопасные исследовательские решения закрыты автономно | evidence/01-evidence-pack.md |
| R30 | «используй все возможные доступы, не ищи обходных путей» | done | Использованы канонические repo/history/OpenAPI/live UI источники | evidence/01-evidence-pack.md |
| R31 | «постарайся максимально через API, MCP или какие другие варианты» | done | API/CLI были приоритетом, browser использован только для live UI readback | evidence/01-evidence-pack.md |
| R32i | *(подразумевается)* повторный запуск ссылки или регистрации не создаёт дубль | done | Durable unique claim сериализует concurrent RefRef/Syrve delivery | /Users/afonin900/Github/refref/packages/coredb/src/schema.ts |
| R33i | *(подразумевается)* телефон, баланс и связи партнёров не попадают в Git, аналитику и обычные логи | done | Referral URL opaque, Telegram raw data валидируется сервером, adapter/logs secret-safe и без PII | /Users/afonin900/Github/refref/apps/webapp/src/lib/club/ |
| R34i | *(подразумевается)* скидка и начисление можно доказать и отменить без двойной выдачи | in-ticket | Нужны ledger, reconciliation и reversal | ticket 02 |
| R35i | *(подразумевается)* бармен видит простой и безопасный сценарий на кассе | in-ticket | Нужен POS runbook и тест | ticket 03 |
| G01 | «браузерные все остальные функции, которые не требуют режима высокого интеллекта, используй, пожалуйста, модели попроще» | done | Luna выполнила read-only evidence и независимые проверки; дальнейшая реализация закреплена за Terra | evidence/01-evidence-pack.md |
| D01 | *(обнаружено в отменённой custom ветке)* referral URL требовал lookup кандидата | dropped | Custom Club-domain отменён владельцем; штатный RefRef уже владеет participant/refcode | D02 |
| D02 | *(коррекция владельца)* custom Club-domain/ledger не является заказанной архитектурой | done | Ошибочный custom Club/domain/routes/tests удалён; канон RefRef → штатный Syrve | commit b3dc7b7 |
| R36 | «Телеграм-бот должен регистрировать» | in-ticket | Bot запускает общую R Club Mini App; Telegram identity принимается только после server-side initData validation | ticket 05 |
| R37 | «веб-приложение, которое внутри телеграм-бота, как телеграм-апп, будет открываться» | done | Один `/club` UI имеет browser path и validated Telegram Mini App launch contract | /Users/afonin900/Github/refref/apps/webapp/src/app/club/ |
| R38 | «польскоязычных партнеров, у которых нет Телеграма ... могли спокойно пользоваться через сайт» | in-ticket | Польская web-регистрация не требует Telegram; identity/phone verification проектируются отдельно | ticket 05 |
| D03 | *(обнаружено в ticket 06)* локальный Docker Desktop запущен, но engine/socket не отвечает | placeholder | Compose/runtime acceptance и downstream POS pilot нельзя доказать без restart/working daemon | ticket 06, 07 |
