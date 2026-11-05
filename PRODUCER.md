# Продюсер Margariteros

Настройка от 5 ноября 2026. Проект `margariteros`.
Основание создания: поручение владельца «project-producer настрой проект»,
задача центрального Beads `afonin-hq-jzo8`.

## Продукт и результат

Margariteros — бар на Chmielna в Варшаве. Путь гостя:
контент или поиск → сайт бара → ChoiceQR booking → визит.
Контент, сайт, реклама, бронирование и операции дают самостоятельные результаты.
Для конкретного поручения определить нужный переход и его подтверждение.

Общий вход проекта — этот репозиторий, канонический локальный корень
`/Users/afonin900/Github/Margariteros/Margariteros.bar`.
`/Users/afonin900/Github/Margariteros.bar` — совместимая ссылка на него.
Репозитории направлений лежат рядом в `/Users/afonin900/Github/Margariteros/`.
При другом размещении найти их по [карте Штаба](https://github.com/afonin900/afonin-hq/blob/main/portfolio/products.md).
Общий процесс задаёт [канон HQ](https://github.com/afonin900/afonin-hq/blob/main/governance/owner-intake.md).

## Контекст по поручению

После выбора направления читать его AGENTS.md, затем указанный вход.
Подключать только источники, нужные для заказанного результата.

| Поручение | Ответственный репозиторий и первый источник |
| --- | --- |
| Страницы, CMS, события, редакторский цикл, выпуск сайта | [margariteros-site / README](https://github.com/afonin900/margariteros-site/blob/main/README.md) |
| Бренд, аудитория, тексты, афиши, Reels, календарь и выпуск соцпостов | [margariteros-content / README](https://github.com/afonin900/margariteros-content/blob/main/README.md), локально также `Content/PROFILE.md` |
| Конверсии, UTM, consent, атрибуция, отчётность | [margariteros-analytics / README](https://github.com/afonin900/margariteros-analytics/blob/main/README.md), [операционный порядок](https://github.com/afonin900/margariteros-analytics/blob/main/docs/ANALYTICS-RUNBOOK.md) |
| Google Ads, Meta, бюджеты, рекламные результаты | [margariteros-ads / README](https://github.com/afonin900/margariteros-ads/blob/main/README.md), затем [доступ](https://github.com/afonin900/margariteros-ads/blob/main/growth-os/ADS-ACCESS-RUNBOOK.md) |
| Меню, цены, фото Choice, Syrve, касса, закупки и документы | [margariteros-operations / старт сессии](https://github.com/afonin900/margariteros-operations/blob/main/docs/session-start.md) |
| Код брони, депозит, резерв, закрытый счёт и передача событий | [margariteros-booking-service / README](https://github.com/afonin900/margariteros-booking-service/blob/main/README.md) |
| Партнёры, условия начислений и кабинет | [margariteros-r-club / состояние](https://github.com/afonin900/margariteros-r-club/blob/main/docs/CURRENT-STATE.md) |
| Общая инфраструктура и доступ | [Platform / дежурный вход](https://github.com/afonin900/platform-infrastructure/blob/main/docs/infrastructure-duty.md) |

Метарепозиторий хранит связи направлений и общие решения. Код, материалы,
договоры и доказательства сохраняются у ответственного направления.
Для межрепозиторного поручения назвать результат каждого участника и владельца
общего факта. Аналитика определяет событие, Booking Service реализует передачу,
Ads использует результат по договору.

## Принятые источники и границы

Распределение ответственности и единый брендбук подтверждены владельцем
12 октября 2026, `beads:afonin-hq-9mw.1`. Источник настройки — локальная карта
`docs/local-workspace/README.md`. Брендбук принадлежит
[Content / brand/BRAND_GUIDE.md](https://github.com/afonin900/margariteros-content/blob/main/brand/BRAND_GUIDE.md).
Факты конкретного события, цены, участники и медиа входят в отдельный бриф.
Язык и доставка материала определяются договором канала в Content.

Рабочий вход локального Content на дату настройки — `Content/PROFILE.md` и `Content/`.
`Content/PROFILE.md` найден в локальной копии, но отсутствует в GitHub `main`
при проверке 5 ноября. Для свежего клона сначала сверить README и рабочую ветку
Content; публикация этого контекста не входит в настройку метарепозитория.
Старые `.content-factory/`, CF3 и `weeks/` служат историей и источниками по задаче.
В метарепозитории старые `site/`, `content/`, `analytics/`, growth-os и autopilot
сохраняют историю; актуальные команды искать у ответственного направления.
Payload — исторический эксперимент вне канона сайта. Его выключение или
удаление данных требует отдельного поручения.

Для меню учитывать [передачу Choice/Syrve от 29 октября](docs/HANDOFF-2026-10-29-choice-syrve-external-menu.md)
и её канонический документ Operations. Это план перехода к 01.01.2027,
а не доказательство переключения production или поручение выполнить миграцию.
Порядок POS, внешнее меню Syrve и гостевое меню Choice имеют разные результаты.

## Что подтверждено на дату настройки

5 ноября прочитаны карта HQ, локальные PROJECT/README/AGENTS, карта направлений,
маркетинговый контекст и рабочие входы профильных репозиториев.
Проверка ограничена настройкой контекста. Живые системы не проверялись.

README Site ссылается на приёмку EmDash 1.3.1 / EmVB 0.8.0 от 23 октября.
README Analytics описывает локальный конверсионный контур и отдельно оставляет
production round-trip и доставку получателям неподтверждёнными.
Эти сведения сохраняют дату и не заменяют проверку для нового поручения.

Клик, заявка, подтверждённая бронь, визит и выручка подтверждаются отдельно.
Черновик, очередь и публичная публикация имеют разные доказательства.
Локальный readback, CI и API Syrve не доказывают результат на физической кассе.
Отсутствующие показатели остаются неизвестными.

Настройка профиля не запускает прежние инициативы. Текущий объём работы задаёт
поручение владельца. Датированные отчёты и наличие доступа дают контекст,
а не новые полномочия на публикацию, рекламные изменения или проведение документов.

Для следующего поручения здесь достаточно выбрать направление и прочитать
его рабочий вход. Приоритет между направлениями этим профилем не установлен.
