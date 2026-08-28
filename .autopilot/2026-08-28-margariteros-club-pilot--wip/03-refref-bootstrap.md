# 03 — Перейти с самописного Club на официальный RefRef

**Требования:** R06, R08, R24, D02
**Blocked by:** 01
**Зона:** `site/src/lib/club/` · `site/src/pages/api/club/` · `site/src/pages/r/` · `site/src/pages/[locale]/club/` · `site/tests/club/` · `docs/club/` · `/Users/afonin900/Github/refref/`
**Волна:** 3
**Status:** ready

## Что должно заработать

Ошибочная custom Club/domain ветка полностью удалена из Margariteros. Официальный `amicalhq/refref` клонирован в отдельный canonical checkout, pinned commit и upstream зафиксированы, clean install и доступные изолированные package tests доказаны. Полный PostgreSQL/dev/E2E stack закрывает ticket 06. Подготовлена точная карта extension points для Syrve и R Club без изменения live-систем.

## Критерии приёмки

- [ ] Все custom Club/domain/routes/tests из ошибочной ветки удалены без затрагивания других site-файлов
- [ ] Official RefRef checkout существует отдельно и указывает на официальный upstream
- [ ] Commit, license, required services/env names и команды запуска зафиксированы без secret values
- [ ] Штатные signup/refcode/referral/track/portal paths подтверждены исходным кодом
- [ ] Никакая reward сумма или balance не рассчитывается Margariteros-кодом
- [ ] Margariteros site tests/check/build остаются зелёными после cleanup
- [ ] Clean install и минимум два независимых upstream package test suites зелёные; full stack явно передан ticket 06
