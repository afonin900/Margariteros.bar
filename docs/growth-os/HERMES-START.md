# Старт для облачного Hermes

Читать до любой работы: `AGENTS.md`, `PROJECT.md`, этот файл, потом assigned Issue.

Ты видишь репо бара. Это не лицензия трогать GTM, меню, QR и публиковать.

## Что уже правда (18.08.2026)

- Репо: `afonin900/Margariteros.bar`, ветка `main`.
- Dokploy уже наш. Отдельный инфраз-проект нельзя.
- BrightBean: https://studio.margariteros.bar
- Postiz: https://postiz.margariteros.bar — Instagram, Threads, Facebook подключены.
- Живые посты: Threads + Instagram Reel DJ Dragón 22.08.
- Бронь: https://margariteroswwa.choiceqr.com/booking (клик ≠ бронь).
- Контент класть в `content/weeks/YYYY-Www/YYYY-MM-DD-slug/<канал>/`.
- `ACCESS.md` устарел по соцсетям. Сверять с runtime, не со строками «неизвестно».

## GTM / sGTM — как ставить, если вообще ставить

Контейнер **уже есть** на Choice: `GTM-T5F4VVGF` (опубликован, v3) → GA4 `G-ZYB0MZ1CSR`. Prod не трогать. Меню и QR не менять. Новый сниппет не вставлять.

Кабинет `Margariteros Bar` (`6313263127`) виден с `afonin900@gmail.com`. Барная почта `margaritabar.pl@gmail.com` тоже админ. Владение не забирать. Как: `GTM-ACCESS.md`.

Порядок после инвайта:

1. **Только чтение.** Issue `#13` / `#16`. Снять Account ID и Container ID, дописать `ACCESS.md` и полку OpenBao `secret/projects/margariteros/gtm`.
2. **Карта, не правка.** Что шлёт контейнер, куда (GA4 / Ads), где обрыв после ухода на `choiceqr.com`. Publish в GTM запрещён.
3. **sGTM — только потом, и это не AdLoop.** AdLoop не ставит теги. Это MCP к Ads/GA4. GTM читаем/правим через уже живой `gtm-mcp` (KFS), когда у той же Google-почты есть контейнер бара. Второй AdLoop и форк `kLOsk/adloop` ради GTM **запрещены**. Барные хиты на школьный `gtm-server` не класть.
4. **Choice отдельно.** Их домен. Серверный контейнер GTM не увидит бронь, пока Choice не отдаст webhook/API. UTM уже есть: `ig` / `threads` / `facebook` / `gbp` + `utm_id=97760_v0_s00_e0_tv3`.

Один AdLoop — несколько проектов. Бар подключаем доступом Google к тому же контуру (`mcpjungle` + `~/.adloop/`), не новой установкой.

## Не делать

- Publish GTM, смена контейнера, вставка сниппета «на всякий случай»
- Деплой sGTM / collector без «можно» и без ID
- Публикация в соцсети без отдельной фразы владельца
- Второй трекер задач вне GitHub Issues

## Если нужен следующий шаг по GTM

Открыть `#16` и `#13`. Спросить у владельца один пакет: доступ к GTM (read) + GA4 Property ID. Пока этого нет — только чтение живых страниц и запись блокера.
