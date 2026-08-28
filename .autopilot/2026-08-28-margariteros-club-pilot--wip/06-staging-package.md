# 06 — Подготовить проверяемый staging R Club

**Требования:** R24, R27, R37, R38
**Blocked by:** 04, 05
**Зона:** `/Users/afonin900/Github/refref/docker/` · `/Users/afonin900/Github/refref/docs/` · `docs/club/`
**Волна:** 6
**Status:** ready

## Что должно заработать

RefRef/R Club имеет воспроизводимый local container/package, health/readiness, список env names и staging runbook. Fork, GitHub write, DNS и deploy выполняются только после обязательного отдельного разрешения.

## Критерии приёмки

- [ ] PostgreSQL/RefRef local stack стартует по документированной команде
- [ ] Health/readiness различают UI, database, RefRef и Syrve adapter
- [ ] Env example содержит только имена и безопасные placeholders
- [ ] Runbook описывает fork/upstream sync, deploy и rollback
- [ ] Без отдельного разрешения внешняя публикация не выполняется
