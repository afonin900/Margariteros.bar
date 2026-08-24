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

## Граница действий

По умолчанию — чтение контракта и безопасные проверки. DNS, Dokploy, OpenBao,
окружения, секреты, GTM, публикация и удаление требуют явного решения
владельца. Секреты не записываются в Git, Issue или логи.
