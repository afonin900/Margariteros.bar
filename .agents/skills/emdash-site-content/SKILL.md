---
name: emdash-site-content
description: Читать и редактировать страницы, Events, Organizers и медиа сайта Margariteros в EmDash. Использовать для текста, перевода, SEO, native связей и проверки опубликованного сайта. Социальные публикации относятся к отдельному процессу.
---

# Контент сайта Margariteros

## Определить активный target

1. Прочитать поручение владельца, актуальные решения выбранного графа
   `afonin-hq-277` и [AGENTS сайта](../../../../margariteros-site/AGENTS.md).
   Ответственный репозиторий — `margariteros-site`; рабочую копию и source SHA
   брать из текущего графа, а не из исторического каталога `site/` метарепозитория.
2. В выбранной site-копии прочитать `docs/research/site-release-2026-10-20/README.md`
   и `docs/emvb-shared-workflow.md`. Для layout и оформления дополнительно
   прочитать `docs/emvb-site-styles.md` и `DESIGN.md`.
3. Через разрешённый native read подтвердить runtime, collection, entry ID,
   locale, published/draft и revision. Если candidate docs ещё отсутствуют в
   старой production-копии, найти принятый source по графу. Это не повод применять
   старые импортёры или угадывать write target.

На 20.10.2026 новый EmVB workflow — кандидат. Production cutover ещё требует
приёмки. Успешный локальный Publish, API ответ или CI не подтверждает переход
production. Порядок ниже применяется к принятому candidate target; перед
production write нужна подтверждённая цель из текущего поручения и readback.

## Штатные источники кандидата

Перед любой записью проверить fresh schema. Для body, зависящего от миграции,
дополнительно проверить её receipt.
Поле `content` необязательно: title/core SEO и layout Theme Parts достаточны
для layout-only страницы. Body записывать только в поддержанное поле для
реального `PostContent` потребителя. Если поле отсутствует и такой потребитель
нужен, его добавление относится к отдельному migration plan. Остальные правки
не требуют пустого body или нового project field.

- Core `pages` хранит `title`, core SEO и, при необходимости, поддержанный body
  `content`. Главная — `home`. Существующие Page IDs и slugs сохраняются.
- Визуальные узлы, их тексты и изображения редактируются в локализованных
  `emvb_theme_parts.layout`. Section/Loop ссылается на реальный same-locale
  `partId`/`itemPartId`. Выбирать запись по native ID и Core locale, а не по
  похожему имени в selector: EmVB 0.6 не показывает там язык.
- Базовая локаль — `pl`; поддержаны PL, EN, RU и ES. Переводы — отдельные native
  записи с `locale` и translation group.
  Новый перевод создаётся через `translationOf` от существующего entry ID.
  Новые project fields, alias collections и собственный locale registry
  для текста или связей не создаются. Языковые значения не кодируются суффиксами
  в полях. При изменении native `translatable:false` полей проверяется весь
  affected group после Publish.
- Core `events` и Registry Eventual хранят мероприятия. Для сохранённого DJ
  использовать штатный Saved organizer и `organizer_ref` на существующую
  `performers` directory. Схему и поддержанные поля прочитать до записи;
  собственный performer chooser или relation вместо штатной связи не добавлять.
- Факты и формулировки брать из проверенного brief профильного content-репозитория
  и текущего источника мероприятия. Не выдумывать даты, цены, участников или offers.

## Draft → Publish → public readback

1. Прочитать published и существующий draft. Зафиксировать реальные IDs,
   revision, locale, URL и исходные media references. Сохранить чужой draft;
   согласовать пересекающуюся правку с назначенным исполнителем.
2. Изменить только нужные native поля или свойства узлов. Сохранить draft с
   актуальной revision. Проверить preview выбранной локали и всех потребителей
   общей части на desktop/mobile. Preview и sample canvas не доказывают public.
3. Публикация выполняется через штатный UI в пределах действующего поручения
   и роли. Уже порученный выпуск может выполнить UI-агент без повторного
   запроса разрешения. MCP draft scope сам по себе не разрешает Publish;
   `agentPublish` остаётся выключенным. Core content, Theme Parts и Site styles
   имеют отдельные draft/published состояния. Роли и scope сохраняются;
   MCP-доступ без публикационных прав не даёт права обойти их через Core REST.
4. Независимо прочитать публичные URL нужных локалей. Проверить published
   состояние, точную локаль без fallback, текст, ссылки, изображение и SEO.
   Для временного QA опыта восстановить исходные значения через native
   save → Publish → public readback и подтвердить отсутствие собственного draft.

Штатный EmVB MCP работает с builder pages и Site styles в выданном scope.
Его upstream skill применяется к этому MCP-сценарию; указание использовать
только EmVB tools не управляет native Core Pages/Theme Parts порядком сайта.
Theme Parts редактируются в native UI или разрешённым Core Content API.
Создание их locale translations требует Core API с явными `locale` и
`translationOf`: форма EmVB 0.6 их не передаёт. Scope `mcp:tools:emvb` не означает Core REST write, обычный
GUI login или право Publish. PAT авторизует запрос; browser session подтверждается
отдельно. Секреты и cookies остаются в предназначенном хранилище.

## Изображение через Media Library

1. Прочитать исходную ссылку и draft. Выбрать медиа штатным picker в правильном
   локализованном узле. Сохранить выданный native media reference; не выводить
   ID, storage key или URL из имени файла.
2. Проверить draft/preview. После штатного UI Publish проверить фактическое изображение,
   alt, размер и affected locales на публичной странице. Upload/API success
   не заменяет public proof. Если проверяется optimization, записать реальные
   currentSrc, MIME, bytes и dimensions.
3. Для QA восстановить исходный reference и снова проверить public. Исходные
   media и чужие uploads сохраняются. Удаление собственного fixture требует
   разрешённой операции и проверки отсутствия references.

## Граница задачи

Редакторский процесс не запускает миграционные apply, установку плагинов,
сборку или deploy. Отдельно порученная миграция использует её текущий защищённый
план и backup по `docs/research/emvb-stock-content-migration-2026-10-20.md`.
Отклонение native group readback требует диагностики; прямое исправление SQLite
не является редакторским инструментом.

Социальный календарь, Buffer/Postiz и сообщения в соцсетях принадлежат
`margariteros-content`. Ссылка Organizer на соцсеть — информационный атрибут;
она не разрешает публикацию или сообщение. Events не используются вместо блога.
