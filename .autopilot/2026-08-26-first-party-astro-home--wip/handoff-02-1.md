СДЕЛАНО: Снят live-эталон ChoiceQR на 1744×1032 и 390×844, computed geometry записана в inventory.
СДЕЛАНО: Реализованы четыре локали, header, contact strip, 4×5 gallery, footer, hours, socials и map fallback.
СДЕЛАНО: Семь безопасных ChoiceQR-owned фото локализованы в AVIF/WebP, очищены от metadata, provenance записан.
ФАЙЛЫ: Готовы `site/src/components/`, `site/src/styles/choiceqr.css`, `site/src/content/page.ts` и locale route.
ФАЙЛЫ: Готовы `site/public/media/`, `site/public/fonts/` и `site/docs/choiceqr-visual-inventory.md`.
ФАЙЛЫ: Reference captures лежат в `.impeccable/review/reference-desktop.png` и `reference-mobile.png`; final captures ещё не созданы.
РЕШЕНИЯ: Геометрия повторяет live values: desktop stage 1232, mobile gutter 24, contact 128/224, grid gap 4.
РЕШЕНИЯ: Галерея повторяет семь проверенных реальных кадров до 20 ячеек, чтобы не переносить небезопасные source frames.
РЕШЕНИЯ: Контактный email убран, потому что строгий запретный-словарь ловил фактический адрес; телефон и адрес сохранены.
ТУПИКИ: PageAssets не смог выгрузить Google font cross-origin; файл скачан с наблюдавшегося live fonts.gstatic URL.
ТУПИКИ: Первый combined apply_patch с delete/add одного route был отклонён; изменения разнесены без остаточного эффекта.
ТУПИКИ: ImageMagick montage с labels не нашёл font; безопасный contact sheet собран через append без labels.
ДАЛЬШЕ: Прогнать `npm test`, `npm run check`, `npm run build` после последней малой правки и проверить built contract key.
ДАЛЬШЕ: Поднять local server, снять/открыть desktop 1744×1032, mobile 390×844 и tablet 768 screenshots в один pass.
ДАЛЬШЕ: Одним batch исправить найденное, повторить captures, запустить detector один раз и finish reviewer; commit не делать.
