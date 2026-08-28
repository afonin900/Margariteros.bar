# 05 — R Club для Telegram и обычного польского веба

**Требования:** R07, R12, R13, R20, R21, R24, R36, R37, R38
**Blocked by:** 03, 04
**Зона:** `/Users/afonin900/Github/refref/apps/refer/` · `/Users/afonin900/Github/refref/apps/webapp/` · `site/src/`
**Волна:** 5
**Status:** ready

## Что должно заработать

Один RefRef-based R Club интерфейс открывается из Telegram как Mini App и как обычный польский сайт. Telegram identity валидируется по signed initData на сервере; web-партнёр без Telegram проходит отдельную регистрацию и получает те же portal/referral возможности.

## Критерии приёмки

- [ ] Bot/Mini App launch использует server-side initData validation и auth_date
- [ ] Обычный PL web flow не требует Telegram
- [ ] Регистрация создаёт штатного RefRef participant и refcode
- [ ] Partner portal показывает ссылку/QR/status без PII приглашённых
- [ ] Основной Margariteros содержит R Club navigation entry без хранения loyalty state
- [ ] Telegram и browser используют один responsive UI и один URL contract
