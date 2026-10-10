# Восстановление Windows-кэша Playwright

Локальный pw-browsers — установленная Windows x64 runtime-папка Playwright. Все шесть названий и ревизий совпали с официальным [browsers.json v1.55.0](https://raw.githubusercontent.com/microsoft/playwright/v1.55.0/packages/playwright-core/browsers.json). Исходный package.json встроенного приложения недоступен; исходную версию Python-пакета не утверждаем. Воспроизводящий пакет закреплён как playwright@1.55.0. [package.json](https://raw.githubusercontent.com/microsoft/playwright/v1.55.0/packages/playwright/package.json) фиксирует playwright-core 1.55.0.

Chromium 1187, chromium-headless-shell 1187, Firefox 1490, WebKit 2203, ffmpeg 1011, winldd 1007. INSTALLATION_COMPLETE и DEPENDENCIES_VALIDATED присутствуют в каждой runtime-папке. Пользовательских профилей, Cookies, History, Login Data, Preferences и Bookmarks не обнаружено. .links ссылается на Windows Python playwright driver; личный абсолютный путь не сохранён.

Восстановление на Windows x64, PowerShell, Node >=18:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\path\PinUltra\pw-browsers'
npx --yes playwright@1.55.0 install
```

Путь заменить фактической папкой приложения. Команда штатно устанавливает браузеры и инструменты по закреплённому manifest для Windows. Не выполнять её на Mac для этого кэша: Mac по умолчанию получит другой платформенный дистрибутив. На данном этапе установку и скачивание браузеров не выполняли. Выполнение восстановления на Windows не проверено; подтверждены provenance и штатный механизм восстановления по закреплённому исходнику [registry](https://raw.githubusercontent.com/microsoft/playwright/v1.55.0/packages/playwright-core/src/server/registry/index.ts).

Файловый manifest содержит относительные имена, размеры и SHA256. Старый .links и временные служебные маркеры могут иметь другие байты после повторной установки; исходные приложения и документы не находятся в этом кэше. Отдельный pinmetricaultra.exe остаётся защищённым локально и не удаляется.
