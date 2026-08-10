# Margariteros — правила работы

- Пиши для публичного контента на естественном современном польском; английский
  добавляй только когда он полезен гостю.
- Не выдумывай DJ, дату, время, цену, акцию, доступность, блюдо, гостя или
  событие. До поста обязателен source brief и фактчек.
- Соблюдай `margariteros_asset_pack_v1_lime_fiesta/09_docs/design.md`:
  не растягивай raster/seamless assets; маскот — один stem/base, без ног.
- Реальные фото/видео — hero. Canva — финальная сборка. Remotion-прототипы не
  публикуются автоматически.
- Никаких публикаций, рекламных расходов, подключений аккаунтов, сервисов или
  tracking/cookies без явного owner approval.
- Перед изменением рабочих планов прочти `CONTEXT.md`, `WEEKLY_LOG.md` и
  соответствующую карточку в `0_hq/tasks.md`.

## Agent Operations Config

### Канонические файлы
canonical:
  context: CONTEXT.md
  tasks: 0_hq/tasks.md
  decisions: 0_hq/decisions.md
  weekly_log: WEEKLY_LOG.md

### Weekly cadence
weekly_cadence: Monday brief, Tuesday-Thursday production, Friday-Saturday approved publishing, Sunday review

### Repos
repos:
  - afonin900/Margariteros.bar # execution, growth, brand history

### GitHub Project
project: not configured
owner: afonin900

### Task routing
routing:
  - pattern: content, SMM, Canva, Remotion
    repo: afonin900/Margariteros.bar
  - pattern: brand, asset pack, visual rules
    repo: afonin900/Margariteros.bar
  - pattern: analytics, attribution, ChoiceQR
    repo: afonin900/Margariteros.bar
