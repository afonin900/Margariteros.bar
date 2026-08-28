# 07 — Проверить нативные 10% и 5 PLN одним кассовым чеком

**Требования:** R04, R11, R16, R17, R18, R19, R25, R26, R34i, R35i
**Blocked by:** 04, 06
**Зона:** `.autopilot/2026-08-28-margariteros-club-pilot--wip/live-poc/` · `docs/club/pos-pilot.md`
**Волна:** 7
**Status:** ready

## Что должно заработать

Один referral из RefRef проходит до физического paid+closed чека; Syrve штатно применяет 10% и начисляет 5 PLN. Readback показывает одну native transaction и отсутствие дубля. Без физического чека статус честно остаётся awaiting_pos_check.

## Критерии приёмки

- [ ] Перед write подтверждены tenant, partner, program/action и rollback
- [ ] Бармен выполняет короткий runbook без ручного custom начисления
- [ ] Чек показывает нативную скидку 10%
- [ ] Syrve transaction показывает ровно +5 PLN
- [ ] Повторный RefRef/Syrve readback не создаёт дубль
- [ ] Evidence secret-safe и не содержит PII
