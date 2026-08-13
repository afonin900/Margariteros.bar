# Задачи

Обновлено: 2026-08-13  
Неделя: W33 (10–16 августа)

GitHub ledger: Epic #1 в `afonin900/Margariteros.bar`; карточки также есть в
GitHub Project #8 `Margariteros Bar Ops`.

## Сейчас

| Приоритет | Карточка | Результат | Блокер |
| ---: | --- | --- | --- |
| 1 | #2 Факты пятницы 14.08 | Один source brief: событие, DJ, время, условия, ChoiceQR, media и источник каждого утверждения. | Бар не подтвердил обязательный факт. |
| 1 | #3 Факты субботы 15.08 | Отдельный source brief, не смешанный с пятницей. | Бар не подтвердил обязательный факт. |
| 2 | #9 Friday post package | Польский caption, CTA, channel variants, Canva brief и fact-check — без публикации. | Зависит от фактов пятницы. |
| 2 | #8 Saturday post package | Самодостаточный пакет для субботы, не копия пятничного. | Зависит от фактов субботы. |
| 3 | #4 Календарь W33 | Два слота с каналом, approval owner, временем и CTA. | Зависит от двух post packages. |
| 3 | #10 Shot list W33 | Только недостающие реальные кадры с форматом/длительностью/сценой. | Зависит от двух post packages. |
| 4 | #6 Owner review W33 | Для каждого пакета: approved / changes requested / blocked. | Зависит от календаря и shot list. |

## После owner review

1. #11 Remotion discovery: один prototype use case, входные поля, assets, runtime и точная проверка.
2. #7 Throwaway Remotion vertical: один локально воспроизводимый render 1080×1920.
3. #5 Metricool fit и analytics proposal: capability matrix без login/connect/payment.

## Growth / Measurement / Infrastructure — план

Цель: подготовить технический контур заранее, чтобы переход Margariteros на собственный домен и production-tracking был активацией готовой системы, а не новым инфраструктурным проектом.

Планируемые направления:

1. Measurement foundation: GA4 audit, event taxonomy, tracking plan, UTM/click-id contract, attribution и consent model.
2. ChoiceQR capability audit: native GA/GTM, Measurement Protocol, API/webhooks, доступные события и ограничения чужого домена.
3. Google Ads: conversion architecture, linking design, diagnostics и campaign attribution.
4. Meta Ads: Pixel/Dataset + CAPI design, browser/server deduplication и diagnostics.
5. Server-side GTM / first-party collector: подготовить контейнерную реализацию сейчас; production domain/DNS и отправку реального трафика включать позже после owner approval.
6. First-party landing/gateway: подготовить архитектуру Ads -> owned domain -> Choice, чтобы campaign context мог быть сохранён до перехода на Choice.
7. Online-to-offline/menu attribution: deterministic только при доказуемом identity bridge; иначе modeled/aggregated или experiment-level measurement.
8. Cloud advertising operations: read/reporting automation раньше write-access; любые budgets/campaign changes остаются под approval gate.
9. API/MCP capability matrix: Google Ads, GA4, GTM, Meta и Choice; MCP использовать как интерфейс автоматизации, но не как замену каноническим API/контрактам.
10. Agent-ready folders/contracts: каждый технический модуль должен иметь scope, inputs, allowed actions, verification и canonical output location.

### BLOCKER — единый Dokploy deployment contract

**Статус: BLOCKED / NEEDS DISCOVERY.**

До реализации контейнерной инфраструктуры Margariteros необходимо определить канонический общий контракт развертывания через Dokploy. Не создавать для Margariteros собственную параллельную схему Docker/VPS/deployment, пока этот контракт не найден или явно не утвержден.

Нужно уточнить:

- какой существующий project/repository отвечает за общую инфраструктуру и deployments;
- где должен находиться canonical Dokploy deployment contract;
- кто является owner этого контракта;
- действительно ли Hermes agent сейчас готовит техническую карту/план общего репозитория и этот контракт;
- как project repositories должны объявлять workload, domains, environment variables, secrets references, health checks, persistent volumes, backups, restore и rollback;
- как задаются staging/production environments и multi-server placement, если Dokploy будет работать более чем на одном сервере;
- какой контракт используется для DNS/domain/TLS provisioning;
- где хранится inventory инфраструктуры, чтобы агентам не приходилось искать, на каком сервере и каким способом развернут сервис.

**Разблокировка:** canonical repo/path + owner + опубликованная версия deployment contract, которую может прочитать агент Margariteros.

После разблокировки все новые workload Margariteros должны быть Dokploy-first: server GTM, first-party collector/gateway, Choice webhook/API receiver, reporting workers, API/MCP bridges и другие новые контейнерные сервисы.

### Infrastructure boundary

- Existing aaPanel/LiteSpeed/Nginx server считается legacy/specialized infrastructure и не мигрируется автоматически.
- Существующий mail-related workload также не переносится в рамках Margariteros без отдельного migration epic и проверки DNS/authentication/deliverability requirements.
- Dokploy является default deployment target для новой инфраструктуры, но миграция legacy workloads — отдельное решение.
- В Git разрешены manifests/config templates и secret names/references; реальные credentials/tokens в Git запрещены.

## Не сейчас

- Facebook Page — отдельное owner decision до создания.
- Telegram — retention-пилот после четырёх недель.
- Production Tag Manager/GA4/Measurement Protocol/cookies activation — после решения о домене, consent-flow и доступах. Подготовительная спецификация и контейнерная инфраструктура разрешены заранее, но зависят от общего Dokploy contract выше.

## Правило исполнения

Карточка не стартует, если обязательный факт/вход не подтверждён. Не раскрытые
данные помечаются `missing`; их нельзя заполнять предположением.

Для infrastructure tasks действует дополнительное правило: если задача требует deployment convention, которого нет в опубликованном общем Dokploy contract, задача останавливается на discovery/ADR и не вводит локальный стандарт только для Margariteros.
