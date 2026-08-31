# Входной пакет для PRD Спецификатора: first-party сайт бара, согласие и ChoiceQR

> TARGET_AGENT: PRD Спецификатор  
> PURPOSE: подготовить исследовательскую спецификацию и направление решения для собственного сайта Margariteros, который станет входной точкой рекламы, событий и честной аналитики, сохранив ChoiceQR для меню и бронирования.  
> STATUS: датированный снимок контекста, не источник живого состояния проекта

## 1. Метаданные снимка

- `captured_at`: 2026-08-24, Europe/Warsaw.
- `repository`: `/Users/afonin900/Github/Margariteros.bar`.
- `branch`: `main` tracking `origin/main`.
- `base_commit`: `0d1f5cd8d0e01d5332601b83c9e23062883becc2`.
- `working_tree`: чистый на момент снимка.
- `github_checked_at`: 2026-08-24; Issue #17 открыт и обновлён в 07:42 UTC.
- `runtime_evidence_checked_at`: в этом исследовании живой браузер, DNS и GTM не открывались; использованы только зафиксированные runtime-снимки от 2026-08-18—2026-08-21.
- `known_access_limits`: без отдельного разрешения нельзя публиковать GTM, менять рекламу/ставки/бюджеты, DNS, домены меню или QR. ChoiceQR Open API ещё не доказан в аккаунте бара.
- `known_stale_sources`: `PROJECT.md` актуален на 2026-08-21; старые `0_hq/`, `PROJECT_PLAN.md`, `ROADMAP.md` — исторические. Диалог ниже является источником решений владельца и сообщений о системе, а не доказательством внешних технических возможностей.

## 2. Что нужно исследовать и специфицировать

Нужно определить безопасную и реализуемую архитектуру небольшого собственного многоязычного сайта Margariteros: он должен принимать рекламный и органический трафик, показывать атмосферу и события бара, вести к меню и бронированию, получать единое законное согласие и давать честную измеримость. ChoiceQR остаётся внешним сервисом меню и бронирования, а не главным CMS/landing-слоем.

Отдельно нужно исследовать, можно ли и при каких условиях передавать уже полученный на собственном сайте выбор согласия в ChoiceQR на `menu.margariteros.bar`, не подменяя согласие и не обходя отказ гостя.

## 3. Конечный результат для пользователя

Гость из Google Ads, GBP, Instagram или поиска попадает на быстрый локализованный сайт Margariteros, видит актуальные события и понятные действия «меню» и «забронировать», а не устаревший главный экран ChoiceQR. Для рекламы доступна food-safe поверхность без алкоголя; для обычных гостей остаются полноценные страницы бара и событий. Владелец один раз управляет фактами о событиях и получает честную воронку до созданной, затем подтверждённой брони, без передачи персональных данных в аналитику.

## 4. Почему это нужно сейчас

- [VERIFIED_FACT | evidence=github | source=https://github.com/afonin900/Margariteros.bar/issues/17 | as_of=2026-08-24] Открытый эпик #17 фиксирует две текущие проблемы: Google Ads оптимизируется по мелким действиям, а нынешняя ChoiceQR-поверхность содержит алкогольное позиционирование, из-за чего реклама ограничивается или отклоняется.
- [VERIFIED_FACT | evidence=static | source=PROJECT.md | as_of=2026-08-21] Отдельного сайта или приложения бара сейчас нет: репозиторий — операционный контур контента, аналитики и рекламы.
- [REPORTED | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24 | verification_needed=live ChoiceQR consent, cookies, DNS и API] Владелец считает текущую главную ChoiceQR слабой для атмосферы бара, событий и рекламы; ему нужен управляемый первый экран и отдельное место для меню.

## 5. Контекст обсуждения и принятые решения

- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Основной сайт — собственная first-party поверхность Margariteros; ChoiceQR — специализированный слой меню и бронирования.
- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Главное рекламное действие — бронирование; меню остаётся важной вторичной целью. Бронирование желательно удержать на своём домене, если ChoiceQR поддерживает виджет или API.
- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Меню и QR должны жить на устойчивом поддомене наподобие `menu.margariteros.bar`; QR в баре должен вести сразу к меню, не на рекламный лендинг.
- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Сайт многоязычен через URL-маршруты PL, EN и ES; реклама ведёт сразу на соответствующий язык. Язык не включается в рекламе, пока готова только другая локализация.
- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Сайт — небольшой рекламный лендинг с атмосферой, событиями, CTA, меню и бронью; календарный интерфейс посетителю не нужен. Нужны списки будущих и прошедших событий.
- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Для операционной части Томаш ведёт исходные события в Google Calendar; будущий CMS/back-office рассматривается как Payload с сущностями событий и отдельных единиц контента. Postiz остаётся только publisher для IG/FB/Threads.
- [ACCEPTED_DECISION | authority=project | source=PROJECT.md; GitHub Issue #17 | as_of=2026-08-24] Не считать клики, просмотры, маршруты или `reservation_click` подтверждённой бронью; не передавать имя, телефон, e-mail или комментарий гостя в GA4/GTM/Ads/GitHub.
- [ACCEPTED_DECISION | authority=project | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20] Не дублировать существующие Meta Pixel/CAPI ChoiceQR через GTM.

## 6. Подтверждённое текущее состояние

- [VERIFIED_FACT | evidence=static | source=PROJECT.md | as_of=2026-08-21] Живая форма бронирования: `https://margariteroswwa.choiceqr.com/booking`.
- [VERIFIED_FACT | evidence=runtime | source=analytics/choiceqr/live-2026-08-18.md | as_of=2026-08-18] На ChoiceQR зафиксированы web GTM `GTM-T5F4VVGF`, GA4 `G-ZYB0MZ1CSR`, Meta Pixel и Facebook CAPI; Advanced Consent Mode выключен, sGTM URL в публичной конфигурации не задан.
- [VERIFIED_FACT | evidence=runtime | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20] До полного согласия ChoiceQR не запрашивает Google, GTM и Meta; после согласия загружаются GTM/GA и один Meta PageView. Корректный `consent update` от Choice-баннера к GTM не доказан.
- [VERIFIED_FACT | evidence=runtime | source=docs/growth-os/HANDOFF-2026-08-21-choiceqr-booking-ads.md | as_of=2026-08-21] Одна контролируемая созданная заявка ChoiceQR дала ровно один `booking_request` и одно срабатывание GA4-тега в GTM Preview без гостевых PII. Это `CREATED`, не подтверждение менеджером или визит.
- [VERIFIED_FACT | evidence=runtime | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20] Server GTM опубликован как версия 3, но продление cookies реальным `Set-Cookie` не доказано; считать это готовой функцией нельзя.
- [VERIFIED_FACT | evidence=github | source=https://github.com/afonin900/Margariteros.bar/issues/17 | as_of=2026-08-24] В эпике принята временная глубокая цель Search: проверенный `booking_request`, на уровне отдельной кампании; будущая основная цель — `reservation_confirmed` из ChoiceQR API с дедупликацией по стабильному ID.
- [VERIFIED_FACT | evidence=code | source=repository file inventory at base_commit 0d1f5cd | as_of=2026-08-24] В репозитории нет текущего Astro/Payload-приложения: найден `site/` с медиа и `package.json` только у Canva/производственных инструментов. Новый сайт и CMS нельзя описывать как уже реализованные.
- [REPORTED | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24 | verification_needed=DNS, SSL, ChoiceQR configuration] ChoiceQR может подключать кастомный домен/поддомен через A-запись. Это не подтверждено в данном снимке.
- [REPORTED | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24 | verification_needed=ChoiceQR Open API contract and access] У ChoiceQR есть API бронирований, который потенциально позволяет собственной форме отправлять бронь с сервера. Не считать это готовым доступом или поддержанным для Margariteros контрактом.

## 7. Релевантная карта проекта

```text
Google Ads / GBP / social / SEO / QR
                 ↓
    будущий margariteros.bar (Astro, first-party)
      ├─ CMP + consent state + web GTM → gtm.margariteros.bar → sGTM
      ├─ PL / EN / ES home и event pages
      ├─ CTA «Меню» → будущий menu.margariteros.bar (ChoiceQR)
      └─ CTA «Бронь» → собственный UI + Choice API, если договор/контракт это позволит;
                         иначе подтверждённый ChoiceQR embed/deep link

Google Calendar → будущий Payload/back-office → Events + ContentItems
                                         ├─ Astro site
                                         ├─ GBP publisher (отдельно от Postiz)
                                         └─ Postiz → Instagram / Facebook / Threads
```

Релевантные существующие источники:

- `PROJECT.md` — каноническая карта проекта и границы.
- `analytics/README.md`, `analytics/choiceqr/live-2026-08-18.md` — измерение ChoiceQR и consent-состояние.
- `docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md` — текущая воронка, sGTM и будущий bridge ChoiceQR → Syrve.
- `docs/growth-os/HANDOFF-2026-08-21-choiceqr-booking-ads.md` — доказательство `booking_request`, API-границы и ad-цели.
- `docs/growth-os/sgtm/README.md` — существующий sGTM: web `GTM-T5F4VVGF`, server `GTM-KMF9Z88Z`, `gtm.margariteros.bar`.
- `content/weeks/` — нынешнее хранение готовых пакетов по каналу; это не готовая CMS-схема событий.

## 8. Scope

- Исследовать и предложить границы first-party сайта, ChoiceQR, consent/CMP, web GTM, существующего sGTM, будущего ChoiceQR API bridge и CMS/back-office.
- Сопоставить варианты бронирования: собственный UI через официальный API, поддерживаемый embed/параметры ChoiceQR, либо безопасный deep link как fallback.
- Определить проверяемый путь согласия между корневым доменом и поддоменом меню, включая различия Accept/Reject/частичного выбора/первого QR-визита.
- Определить минимальную модель контента для Events, ContentItems, Media и локализаций; Google Calendar и Payload — как кандидаты, не как уже утверждённая реализация.
- Описать потребность в продакшн-проверках и границы будущих изменений DNS, GTM, рекламы, API и инфраструктуры.

## 9. Non-goals

- Не строить сейчас сайт, Payload, bridge, новый CMP, интеграцию с Google Calendar или публичную посадочную.
- Не публиковать GTM, менять рекламу, ставки, бюджеты, конверсии, домены, QR, DNS или Dokploy.
- Не запускать рекламу алкоголя и не включать PMax в новую booking-логику.
- Не делать полноценную CRM, календарный UI для гостей, доставку/продажи ChoiceQR, автоматическую публикацию social или Meta-кампании.
- Не считать текущий server GTM заменой application bridge либо способом обойти отказ от согласия.

## 10. Ограничения и правила сохранения

- [ACCEPTED_DECISION | authority=project | source=AGENTS.md; docs/growth-os/HERMES-START.md | as_of=2026-08-24] Любые прод-изменения GTM, рекламы, меню/QR, DNS, Dokploy и секретов — только после отдельного «можно».
- [ACCEPTED_DECISION | authority=project | source=PROJECT.md; docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-24] Согласие нельзя подделывать. `denied` не превращается в `granted` ни через GTM, ни через sGTM; sGTM не является обходом CMP.
- [ACCEPTED_DECISION | authority=project | source=PROJECT.md | as_of=2026-08-24] Не передавать PII гостей в GA4, GTM, Google Ads, GitHub или handoff.
- [ACCEPTED_DECISION | authority=project | source=AGENTS.md | as_of=2026-08-24] Не дублировать Meta Pixel/CAPI ChoiceQR через GTM.
- [ACCEPTED_DECISION | authority=owner | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24] Рекламная поверхность должна быть food-safe: без алкогольного текста, изображений, metadata, навигации и автоматических материалов по маршрутам, на которые ведёт реклама.
- [ASSUMPTION | validation_needed=legal review and CMP vendor contract] Один согласованный выбор может применяться к первому домену и его поддомену, только если раскрытие целей/поставщиков охватывает обе поверхности и техническая передача state не искажает выбор.

## 11. Известные проблемы, риски и конфликты

- [CONFLICT | sources=ChatGPT conversation vs PROJECT.md] В разговоре зафиксирован «Astro SSR + Cloudflare cache» как итоговый стек; в репозитории Astro-приложения нет. Это желаемое направление, а не подтверждённая текущая архитектура.
- [CONFLICT | sources=ChatGPT conversation vs docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md] В разговоре предполагалась возможность выставить Choice-cookie после собственного consent; текущая документация проекта доказывает только Basic-поведение ChoiceQR и отсутствие доказанного `consent update`. Нельзя писать cookie «наугад».
- [REPORTED | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24 | verification_needed=live cookie audit] Обсуждалось, что cookie Choice может жить 30 дней или год. Срок, список cookies, значения, Domain/Path/SameSite и значение Accept/Reject неизвестны для текущего бара.
- [REPORTED | source=ChatGPT conversation «Архитектура согласия GTM» | as_of=2026-08-24 | verification_needed=ChoiceQR embedding docs and browser test] Код с первого домена не может произвольно управлять DOM чужого cross-origin iframe; предзаполнение возможно только через подтверждённый API/URL/SDK ChoiceQR.
- [VERIFIED_FACT | evidence=static | source=docs/growth-os/HANDOFF-2026-08-21-choiceqr-booking-ads.md | as_of=2026-08-21] В публично прочитанной документации ChoiceQR есть booking REST methods, но перечислены webhook-события заказов, не `booking.*`; нельзя обещать booking webhook.
- [VERIFIED_FACT | evidence=static | source=docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md | as_of=2026-08-20] Объект `reservation_confirmed` должен появляться только после подтверждения менеджером и успешного создания Syrve reserve; browser-сигнал не заменяет его.

## 12. Предположения и неизвестное

- [UNKNOWN | needed_from=live ChoiceQR cookie/network audit] Какая именно CMP/cookie-модель сейчас включена на `margariteroswwa.choiceqr.com` и на будущем custom subdomain; какие cookies создаются при Accept, Reject и частичном выборе.
- [UNKNOWN | needed_from=ChoiceQR support or contract] Разрешает ли ChoiceQR custom subdomain, какие DNS/SSL правила и кто владеет сертификатом; совместим ли Cloudflare proxy.
- [UNKNOWN | needed_from=ChoiceQR support/API credentials] Доступна ли API-интеграция именно Margariteros, какие методы/поля/лимиты доступны, может ли запись сохранить UTM/click IDs/метаданные и как безопасно получать статусы.
- [UNKNOWN | needed_from=ChoiceQR docs and browser proof] Есть ли официальный embed, URL-параметры даты/времени/события или postMessage/API для бронирования; разрешены ли они в CSP/frame-ancestors.
- [UNKNOWN | needed_from=owner/legal] Какая CMP и юридические тексты/языки допустимы для сайта и могут ли они охватывать ChoiceQR как раскрытого поставщика.
- [UNKNOWN | needed_from=owner] Нужен ли Payload уже в первом релизе или первый выпуск может иметь минимальный источник фактов с последующей миграцией; выбор влияет на операционные затраты, но не на конечную цель.
- [ASSUMPTION | validation_needed=live DNS/hosting audit] Astro SSR можно разместить отдельным Node-сервисом в текущем Dokploy и кэшировать через Cloudflare; это не проверено в этом репозитории.

## 13. Вопросы для внешнего исследования

1. Какие официальные требования Google Consent Mode v2 и EU consent предъявляет first-party сайт в модели: собственный CMP → root domain → поддомен с независимым ChoiceQR CMP? Какие минимальные доказательства должны быть в тестах?
2. При каких юридических и технических условиях допустим адаптер, который переносит уже сделанный выбор согласия в формат CMP внешнего поставщика на поддомене? Какие подходы запрещены как подмена согласия?
3. Как документированный ChoiceQR поддерживает custom domains, embed/виджеты, URL-параметры, бронирование API, статусные обновления и данные атрибуции? Нужны первичные источники/ответ поддержки, не общие статьи.
4. Какой минимальный и поддерживаемый стек Astro SSR + Cloudflare cache + Payload подходит для маленького многоязычного event/restaurant сайта, без лишней очереди, календарного UI и multi-tenant?
5. Какие модели Google Calendar → CMS допустимы, чтобы календарь был источником фактов, но не создавал самопроизвольных публикаций? Как хранить `calendarEventId`, статусы и ручные исключения?
6. Как организовать локализацию PL/EN/ES, canonical/hreflang и food-safe рекламные маршруты так, чтобы органические event pages не потеряли нормальную атмосферу бара?
7. Какую минимальную событийную и атрибуционную модель принять для пути first-party site → ChoiceQR → подтверждение → Syrve, чтобы отличать UI-сигналы от бизнес-фактов и не передавать PII?

## 14. Решения владельца, которые ещё открыты

- Выбрать CMP/юридическое покрытие, если оно требует бюджета, нового поставщика или изменения privacy/cookie policy.
- После исследования выбрать бизнес-приемлемый основной сценарий бронирования: собственная форма через ChoiceQR API, официальный embed либо переход в ChoiceQR.
- Решить, входит ли Payload + Google Calendar sync в первую поставку сайта или это следующий этап после работающего сайта.
- Утвердить реальные тексты, фото, языки и границы food-safe рекламных маршрутов до публикации.

## 15. Решения внутреннего Architect после возврата PRD

- Проверить живой репозиторий и выбрать реальную структуру приложений/пакетов, среду, развёртывание и cache invalidation; не считать предложенный в беседе стек уже утверждённым в коде.
- Спроектировать контракт consent state и возможного Choice-adapter: storage, область домена, схема версий, отказ/withdrawal, миграция и тест-кейсы. Отказаться от адаптера, если ChoiceQR или юридический контракт его не позволяет.
- Выбрать один минимальный booking path и его fallback; определить границы first-party backend, ChoiceQR и bridge, включая failure/retry/idempotency.
- Выбрать минимальную доменную модель Events/ContentItems/Media/locales, ownership Google Calendar vs Payload vs GitHub и ручную проверку перед публикацией.
- Определить границы SSR/cache, security headers, CSP, redirects, UTM/click ID propagation, SEO/hreflang и наблюдаемость.
- Разделить внедрение на зависимые решения и исполнительные задачи только после живой проверки контрактов и отдельного решения владельца.

## 16. Что внутренний Architect обязан перепроверить

- Текущее содержимое и DNS `margariteros.bar`, `menu.margariteros.bar`, `gtm.margariteros.bar`; Cloudflare proxy, SSL и существующие QR-адреса.
- ChoiceQR HTML, cookies, consent-баннер, network, GTM load, Accept/Reject/withdrawal и поведение первого визита/перехода root → menu.
- Возможности ChoiceQR custom domain, API, embed, параметров брони и статусов по первичной документации или письменному ответу поддержки.
- Реальный статус web/server GTM, опубликованных версий и workspace через Jungle MCP; `Set-Cookie` у sGTM; GA4 DebugView и Google Ads conversion setup.
- Текущий Google Ads/GBP маршрут, PMax Final URL Expansion, географию, URL и языки — read-only до отдельного «можно».
- Наличие и контракт Google Calendar, Payload, Dokploy и OpenBao до проектирования синхронизации/развёртывания.
- Политику приватности/consent и допустимость cookie-domain sharing у компетентного юриста или CMP-поставщика.

## 17. Источники

1. `AGENTS.md`, `docs/growth-os/HERMES-START.md`, прочитаны 2026-08-24 — правила безопасности, порядок истины, запрет несанкционированных изменений.
2. `PROJECT.md`, актуален 2026-08-21 — текущая карта проекта, отсутствующий отдельный сайт, живые каналы и границы аналитики.
3. `analytics/README.md`, `analytics/choiceqr/live-2026-08-18.md` — текущие GTM/GA4/consent факты ChoiceQR.
4. `docs/growth-os/HANDOFF-2026-08-20-choiceqr-syrve-analytics.md` — verified runtime поведения consent, sGTM, будущая воронка ChoiceQR → Syrve.
5. `docs/growth-os/HANDOFF-2026-08-21-choiceqr-booking-ads.md` — `booking_request`, API-ограничения и временные/глубокие конверсии.
6. `docs/growth-os/sgtm/README.md` — существующие ID и домен sGTM.
7. [GitHub Issue #17](https://github.com/afonin900/Margariteros.bar/issues/17), прочитана 2026-08-24 — утверждённый продуктовый outcome рекламной и booking-ветки.
8. ChatGPT conversation `6a8c8547-c2c4-83eb-8a8e-ba11f8eea422` «Архитектура согласия GTM», прочитана 2026-08-24 — решения владельца и гипотезы; внешние технические утверждения из неё помечены как `REPORTED` до проверки.

## 18. Ожидаемый ответ

Используй настроенный контракт PRD Спецификатора. Верни один скачиваемый Markdown-файл исследовательской спецификации: варианты с trade-offs, необходимые проверки и чёткие dependency gates. Не создавай Epic, GitHub Issues, исполнительные задачи, окончательный план по файлам или изменения в репозитории. Не принимай за доказанный факт неподтверждённые возможности ChoiceQR, cookie/consent-adapter, API, DNS, Payload или Astro SSR.
