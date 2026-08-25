# Инфраструктура Margariteros

`project_id`: `margariteros`
`hq_ref`: `afonin-hq`

## Сначала прочитать

1. `docs/growth-os/HERMES-START.md`, затем `AGENTS.md` и `PROJECT.md`;
2. канонический контракт Штаба: `afonin-hq/infrastructure/project-infrastructure-contract.md`;
3. свой срез из Штаба:

```bash
cd /Users/afonin900/Github/afonin-hq
python3 scripts/render-project-slice.py --project margariteros
```

Срез Штаба — источник общей инфраструктурной навигации. Он не отменяет
специальные ограничения и подтверждённые факты из `HERMES-START.md`; новые
живые факты сначала проверяются, затем поднимаются в Штаб.

## Постоянный проектный доступ

- Полка: `secret/projects/margariteros/`.
- Токен среды: `personal-corp-openbao-margariteros` в Связке ключей macOS.
- Агент напрямую читает готовые ключи своей полки через официальный `bao` CLI
  по SSH на Hermes; отдельного issuer или MCP доступа нет.
- Соседние проекты, запись и удаление секретов запрещены policy.
- Общий Dokploy-доступ остаётся у Infrastructure engineer.

Каноническая команда:
`/Users/afonin900/Github/platform-infrastructure/docs/project-access.md`.

## Граница действий

Агент автономно использует уже выданные проектные ключи в пределах назначенной
задачи. Отдельного решения требуют удаление, перенос доступа между проектами,
изменение общей инфраструктуры, публикация GTM/контента и необратимый cutover.
Секреты не записываются в Git, Issue или логи.
