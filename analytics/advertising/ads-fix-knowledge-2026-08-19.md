# Отчёт по Ads-правкам: польские тексты + ссылка/UTM (для продолжения)

Обновление по состоянию на 19.08.2026

- Google Ads бар: `935-947-2796`, почта админа `margaritabar.pl@gmail.com`, также `afonin900@gmail.com`.
- По последней выгрузке: у бара есть активные объявления в Google Ads типа `RESPONSIVE_SEARCH_AD` (21 шт.), часть с отказом по причине `ALCOHOL_INFORMATION`.
- Из документации/среды: доступ через MCP называется `adloop` (`adloop.json` в `kfs-core/services/mcpjungle/mcp-configs/`), endpoint интеграции: `https://mcp.afonin.xyz/mcp`.
- В `docs/growth-os/ACCESS.md` указано, что AdLoop по бару подключали ранее как «чтение/подготовка»; для массового редактирования нужно действовать через live-сессию AdLoop или через Google Ads UI.
- Попытка прямого `UPDATE` поля `ad_group_ad.ad.final_urls`/`ad_group_ad.ad.tracking_url_template` для существующих объявлений приводила к ошибке: поля иммутабельны (IMMUTABLE_FIELD), поэтому массовая смена ссылок и трек-templates через такой апдейт не проходит.

Что это значит для задачи «ссылки + UTM»

1. Практически надёжный путь — пересоздать объявления с нужными текстами и URL:
   - сохранить структуру RSA/сообщения
   - выставить новые `final_urls`
   - выставить `tracking_url_template`/UTM на новом объявлении
   - отключить старое объявление (Pause) и проверить статус.

2. Если требуется только ручная правка прямо сейчас:
   - зайти в Google Ads по админ-почте
   - для каждого русскоязычного блока править headline/description на безопасный по модерации текст (без намеков на алкоголь)
   - затем заменить landing/UTM согласно единому шаблону.

Рекомендуемый базовый UTM-шаблон для ссылок

- Меню: `https://margariteros.bar/?utm_source=google&utm_medium=ads&utm_campaign=google_search&utm_content={{adgroupid}}`
- Бронь: `https://margariteros.bar/booking?utm_source=google&utm_medium=ads&utm_campaign=google_search&utm_content={{adgroupid}}`

Важно

- Не публиковать и не отправлять эти материалы дальше без отдельного «можно» владельца.
- В этой сессии изменения в объявлениях не были применены в live-аккаунте.
