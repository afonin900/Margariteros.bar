# Margariteros Growth & Content OS — roadmap

Updated: 2026-08-17
Source: owner plan (this file is the locked scope, not a second task tracker).

## Two systems

1. **Content OS** — BrightBean Studio: факты события → 4 канала → approval → публикация.
2. **Growth OS** — форк AdLoop: GBP, Ads, GA4, GTM, server-side, Choice, потом Meta.

Оба в **существующий Dokploy**. Отдельный инфраз-проект запрещён. Свой код — только если функции нет в BrightBean/AdLoop.

Потоки: **A Content** (выше) и **B Growth**. A не ждёт полный B.

## Upstream repositories

Кодовые базы системы. Не выдумывать свои платформы.

```text
Margariteros Growth & Content OS

UPSTREAM
├── BrightBean Studio   https://github.com/brightbeanxyz/brightbean-studio
├── AdLoop              https://github.com/kLOsk/adloop
└── Dokploy             https://github.com/Dokploy/dokploy   (наш runtime; не «Dockploy»)

OPTIONAL
└── Dokploy MCP         https://github.com/Dokploy/mcp

НЕ репозитории: Choice, GTM, GA4, GBP.
```

AdLoop в PRD всегда двумя ссылками:

- `upstream:` https://github.com/kLOsk/adloop
- `project_fork:` **ещё нет** (не выдумывать). Рабочий репо появится после форка `afonin900/…`.

Runtime: **наш существующий Dokploy**. DNS зоны `margariteros.bar` — Cloudflare, ключ в OpenBao `secret/projects/margariteros/cloudflare`.

## P0 / P1 / P2

| Pri | Что должно стать правдой |
|---|---|
| **P0** | Регулярно публикуем. Есть baseline аналитики. GTM prod не трогаем. |
| **P1** | Google-контур: GBP → реклама → меню → конверсия. |
| **P2** | Meta + предложения оптимизации. Не раньше стабильного Google. |

## P0 exit

- BrightBean в Dokploy
- Доступные соцканалы подключены
- Event → 4 разных draft (IG / FB / Threads PL / GBP)
- Одна реальная публикация после approval
- GBP API: доступ к локации + матрица read/write
- AdLoop только read-аудит
- Карта tracking без скрытых правок GTM

## P1 / P2

Не начинать разработку форка AdLoop до закрытия P0. Документы PRD-02…06 — позже, не блокеры публикации.

## Stop

См. owner plan §8. Нет BrightBean-репо / нет GBP access / нет Choice payload / нет GTM diff / нет «можно» — соответствующий кусок стоит.

## Tasks

GitHub Issues `afonin900/Margariteros.bar`. Не дублировать в `0_hq/tasks.md`.
