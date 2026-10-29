# ChoiceQR + Syrve External Menu — передача в Operations к 01.01.2027

**Дата:** 29.10.2026. **Статус:** готовый технический handoff и план испытаний; production не переключён.

**Канонический подробный документ:** [ChoiceQR ↔ Syrve External Menu: миграция, фотографии, все операции меню Choice Open API, порядок разделов/категорий/товаров, WebOffice, испытания, rollback, сроки и источники](https://github.com/afonin900/margariteros-operations/blob/main/docs/choice-syrve-external-menu-handoff-2026-10-29.md).

**Почему именно там:** согласно [README Margariteros.bar](../README.md), каталог, номенклатура и интеграции Syrve/Choice принадлежат `afonin900/margariteros-operations`, а не репозиторию публичного сайта. В Operations уже находятся официальные Choice API docs, скрипты работы с фото, архивы предыдущих проверок и настройки доступа. Не создавать вторую несовместимую реализацию в этом репозитории.

## Главное для следующего агента

1. **Не ждать января:** с 01.01.2027 Choice предупреждает о прекращении обновления товаров и цен из старого экспорта, хотя заказы продолжат поступать. Не менять production без проверенного нового источника.
2. **Сортировка в Choice уже через API:** `POST /menu/:lang/sections/position/bulk`, `POST /menu/:lang/categories/:sectionId/position/bulk`, `POST /menu/:lang/dishes/:categoryId/position/bulk` и аналог для `options`. Нужен идемпотентный исполнитель на основе полного снимка, verify и rollback, а не GUI drag-and-drop.
3. **Фото через Choice API уже проверены:** `PATCH /menu/:language/dishes/:id` с `media` = публичный HTTPS URL, Choice создавал CDN original/thumbnail. Использовать текущую медиатеку и существующий TokenStore; не запрашивать новые секреты без нужды.
4. **WebOffice Syrve External Menu уже работает с категориями, порядком, изображениями, описаниями, модификаторами и прайсами**, но обычное обновление из номенклатуры не автоматическое и может затереть ручные поля.
5. **Не смешивать:** внешнее меню Syrve, гостевой Choice и Syrve POS Quick Menu имеют разную структуру/сортировку. Cloud API чтения внешнего меню сам по себе не подтверждает write API для него.
6. Первый шаг — **read-only** инвентаризация текущих товаров/цен/POS ID/фото/порядка и WebOffice/Choice интеграции; затем canary. Полный `POST /menu/:language/full` при неполном payload удаляет отсутствующие объекты; флаг `preserveMissingItems` делает их неактивными.

Документ [в Operations](https://github.com/afonin900/margariteros-operations/blob/main/docs/choice-syrve-external-menu-handoff-2026-10-29.md) включает подробные поля и эндпоинты, тест-матрицу, контрольные точки и ссылки на официальные первоисточники. Результаты исполнения и новые источники фиксировать в Operations, а не дописывать в этот индексный файл.
