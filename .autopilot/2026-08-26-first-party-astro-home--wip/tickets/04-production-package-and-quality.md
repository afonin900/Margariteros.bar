# 04 — Сайт проверен и готов к безопасному запуску в Dokploy

**Требования:** R23, R31i, R06
**Blocked by:** 03
**Зона:** `site/Dockerfile` · `site/tests/` · `site/docs/` · CI/build scripts
**Волна:** 4
**Status:** ready

## Что должно заработать

Сайт собирается в production image, отвечает `/healthz`, запускается без root и имеет понятный Dokploy runbook. Полный тестовый набор доказывает SSR, доступность, адаптивность, отсутствие алкогольного контента, PII и дублированных событий.

## Из брифа, дословно

> «деплоится на нашем докплое сервере»
> «чтобы пиксельно совпадала адаптивность»

## Разделы спецификации

§10–§11, история 10.

## Критерии приёмки

- [ ] Production Docker image собирается и запускается непривилегированным пользователем
- [ ] `/healthz` проходит HTTP smoke без внешних зависимостей
- [ ] Runbook перечисляет env names, port, healthcheck, deploy и rollback
- [ ] Полный suite: typecheck, unit, build, HTTP smoke, accessibility, content safety
- [ ] Desktop/mobile/tablet screenshots валидны и визуальная проверка завершена
- [ ] Secret scan по `.autopilot/` и новому приложению не находит значений секретов
