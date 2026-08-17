# PRD-01 — BrightBean Content OS

Updated: 2026-08-17
Priority: P0-A (первый)
Status: spec only — продукт не развёрнут

## Outcome

Одно событие бара вводится один раз и даёт **четыре разных** материала: Instagram, Facebook, Threads (PL), Google Business Profile. Все четыре идут через approval, могут быть запланированы, опубликованы и видны в истории.

## Context

Владелец: сначала публикация, потом измерение. Не писать свой scheduler и не делать n8n обязательным слоем. Имя бара в репо — **Margariteros** (в исходном плане иногда «Margherita»).

Upstream: https://github.com/brightbeanxyz/brightbean-studio  
Runtime: наш Dokploy. DNS: зона `margariteros.bar` (Cloudflare в OpenBao).

Источник фактов — Event, не готовый пост.

## Constraints

- Deploy только в существующий Dokploy. Persistent storage, secrets, auth, media, HTTPS, health, логи, обновление без потери данных.
- Агент на P0 **не публикует сам**.
- Не выдумывать DJ, дату, время, цену, блюдо, событие.
- Публичный текст: современный польский; EN — если полезен гостю.
- Реальные фото/видео — hero. Не генерировать людей/интерьер/напитки «как будто были».
- Если канал BrightBean не умеет — capability gap, не писать адаптер вслепую.
- Production GTM / меню / QR этот PRD не трогает.

## Event (минимум)

```yaml
event:
  title: ""
  venue: Margariteros
  city: Warsaw
  date: YYYY-MM-DD
  start_time: "HH:MM"
  languages: [pl, en]
  assets: [photo, video]
  status: draft
```

Плюс: краткое описание, тип, CTA, адрес, booking/menu URL, возрастные ограничения если есть, конец публикации, ответственный, история изменений.

## Четыре выхода (не копии)

| Канал | Характер |
|---|---|
| Instagram | атмосфера, исполнитель, вечер, коктейли, короткий CTA |
| Facebook | дата, время, адрес, описание, ссылка/действие |
| Threads PL | разговорный Warsaw nightlife, вопрос/наблюдение, событие без копипасты IG |
| GBP | что / где / когда / точное время / понятный CTA |

## Workflow

FACTS → CHANNEL DRAFTS → HUMAN REVIEW → APPROVAL → SCHEDULING → PUBLISH → HISTORY

## Acceptance

- [ ] BrightBean поднят в Dokploy (health 200, данные переживают редеплой)
- [ ] По каждому доступному каналу: auth, draft, картинка/видео, schedule, approval, publish, история, статус
- [ ] Один реальный ивент прошёл полный цикл; ссылки сохранены
- [ ] Нет самовольной публикации агентом
- [ ] Нет своего scheduler / обязательного n8n

## Pointers

- PROJECT.md, `docs/growth-os/ROADMAP.md`, `docs/growth-os/ACCESS.md`
- Визуал: asset pack `09_docs/design.md`
- Issue = эта работа. Live = Dokploy + аккаунты.

## Decision boundary

Исполнитель: детали полей Event, раскладка UI BrightBean, порядок подключения каналов.  
Владелец: URL исходников BrightBean, OAuth в соцсети, «можно» на публикацию, любой новый канал/адаптер.
