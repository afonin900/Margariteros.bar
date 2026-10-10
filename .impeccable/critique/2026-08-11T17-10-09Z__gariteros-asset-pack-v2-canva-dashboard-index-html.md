---
target: Margariteros Canva system
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
timestamp: 2026-08-11T17-10-09Z
slug: gariteros-asset-pack-v2-canva-dashboard-index-html
---
Method: dual-agent (A: deleg_20236931/task-0 · B: deleg_20236931/task-1)

# Impeccable critique — Margariteros Canva System

## Design Health Score

| # | Эвристика | Score | Ключевая проблема |
|---|---|---:|---|
| 1 | Visibility of System Status | 1 | Нет состояний brief/fact-check/Canva/approval/export |
| 2 | Match System / Real World | 3 | Польский язык и порядок фактов понятны; внутренние термины не объяснены |
| 3 | User Control and Freedom | 1 | Нет рабочего маршрута исправления и checkpoints |
| 4 | Consistency and Standards | 1 | Одновременно действуют четыре несовместимых font stack |
| 5 | Error Prevention | 2 | Правила описаны, но не встроены в шаблон и checklist |
| 6 | Recognition Rather Than Recall | 2 | Правила надо помнить и собирать из разных файлов |
| 7 | Flexibility and Efficiency | 1 | Нет прямого перехода к шаблонам и quick-start |
| 8 | Aesthetic and Minimalist Design | 2 | Dashboard дисциплинирован, но preview колеблются между cliché и generic |
| 9 | Error Recovery | 0 | Нет recovery для font substitution, overflow, glyph и low contrast |
| 10 | Help and Documentation | 2 | Документация существует, но конфликтует |
| **Total** | | **15/40** | **Poor — каркас есть, производственный опыт не собран** |

## Design Specificity Verdict

Визуальная специфичность — 2/4. Палитра и fiesta-сигналы узнаваемы, но собственная информационная грамматика Margariteros не закреплена. Без papel picado и лайма большинство композиций остаётся generic nightlife.

Детерминированный scan вернул 0 findings, но работал в degraded regex fallback: недоступны htmlparser2, css-select, css-tree и domutils, поэтому вероятны false negatives. Ручная техническая проверка обнаружила accessibility gaps в tablist, мобильную навигацию без замены, четыре конфликтующих font stack и два набора dark/cream tokens.

## Overall Impression

V2 правильно сокращает декоративный шум и делает реальное фото главным. Но сейчас это хорошая бренд-презентация, а не воспроизводимый Canva-инструмент. Главная возможность — превратить набор файлов в единую производственную систему с одним manifest, тремя мастер-шаблонами и обязательным preflight.

## What's Working

1. Фото/видео заявлено hero-слоем, бренд — подписью, а не обоями.
2. Black/cream/lime/orange дают сильную и доступную базовую архитектуру.
3. Афиша уже содержит жизнеспособный ритм: headline → date/time → CTA/footer.

## Priority Issues

### [P0] Нет единой типографической и цветовой истины

- `system/README.md` и `tokens.json`: Barlow Condensed + Montserrat.
- `production-map.md` и dashboard: Archivo Black + Nunito.
- `build_templates.mjs` и PPTX: Arial Black + Nunito.
- Cream/ink также расходятся: `#FFF1D6/#171712` против `#FFF5E1/#0B0B0B`.

**Fix:** принять Barlow Condensed Black Italic + Montserrat и одну палитру как production standard; генерировать dashboard/PPTX/docs из единого manifest. Исключить Arial Black.

**Suggested command:** `$impeccable document`, затем `$impeccable typeset`.

### [P1] Dashboard объясняет систему, но не доводит до Canva

Нет действий «Pobierz PPTX», «Importuj do Canva», source brief, preflight и статуса approval.

**Fix:** три карточки формата с preview/размером/назначением/primary action и stepper Brief → Photo → Template → Check → Approval.

**Suggested command:** `$impeccable shape`.

### [P1] PPTX формально редактируемы, но не являются зрелыми Canva templates

Фото-зоны — rectangles, не Canva frames; marker-system отсутствует; Story не имеет video frame; raster assets не редактируются; import может изменить fit, transparency и grouping.

**Fix:** после ручного PPTX-import в Canva заменить photo rectangles настоящими frames, настроить editable groups, добавить safe-zone и сохранить как Brand Templates.

**Suggested command:** `$impeccable harden`.

### [P1] Marker proof не обучает ручной операции

Proof не показывает left + stretch-center + right, handles, group/re-group и anti-example.

**Fix:** 4-кадровая инструкция и красный пример деформированных caps; crop-master как быстрый вариант.

**Suggested command:** `$impeccable clarify`.

### [P1] Мобильный dashboard сломан

На 390 px hero и paragraph уходят за viewport; основная nav исчезает без замены; полезное действие ниже fold.

**Fix:** mobile typography scale, wrap/overflow correction, компактная navigation/sticky CTA; полноценная keyboard tabs model.

**Suggested command:** `$impeccable adapt`.

## Persona Red Flags

**Jordan — новый сотрудник:** понимает обещание, но не видит первого действия; не знает, какой PPTX канонический; термины `missing`, overlay и marker требуют устного объяснения.

**Riley — стресс-тестер:** длинное название ломает hierarchy; не описаны случаи без DJ/даты/фото; нет recovery после font substitution или broken Polish glyph.

**Casey — мобильный оператор:** hero обрезан; navigation исчезает; дата, CTA и footer малы в feed-thumbnail; до рабочего действия приходится долго прокручивать.

## Minor Observations

- Orange/black проходит AA, lime/black и cream/black имеют высокий контраст; orange/lime — только 2.62:1 и не подходит для обычного текста.
- Papel picado слишком легко становится cliché default, а lime-circle в Story/Reel не несёт функции.
- Абсолютный import `pptxgenjs` из пользовательского cache делает generator непереносимым.
- Tabs не имеют arrow/Home/End behavior, roving tabindex, aria-controls и aria-labelledby.

## Questions to Consider

1. Если убрать лайм и papel picado, останется ли узнаваемая композиционная система Margariteros?
2. Можно ли дать пакет новому сотруднику и через 20 минут получить приемлемый материал без устного объяснения?
3. Что является source of truth: tokens, README, production map, dashboard или результат Canva import?
