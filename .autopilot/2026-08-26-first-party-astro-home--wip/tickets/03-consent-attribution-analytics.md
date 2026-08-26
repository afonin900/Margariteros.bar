# 03 — Согласие и события работают честно до перехода в ChoiceQR

**Требования:** R10, R15, R16, R17, R18, R19, R30i, R31i
**Blocked by:** 02
**Зона:** `site/src/lib/consent/` · `site/src/lib/analytics/` · `site/src/components/Consent*`
**Волна:** 3
**Status:** ready

## Что должно заработать

Гость выбирает Accept или Reject, а сайт хранит versioned choice на `.margariteros.bar`, соблюдает default-denied, сохраняет только разрешённую атрибуцию и отправляет честные UI-события без PII и дублей. ChoiceQR bridge явно сообщает `unsupported`, пока нет доказанного vendor contract.

## Из брифа, дословно

> «самое главное - трекание всех конверсий»
> «будет принимать условия согласия и подставлять куку»

## Разделы спецификации

§7–§10, истории 5 и 9, границы `consent`, `choice-consent-bridge`, `attribution`, `analytics`.

## Критерии приёмки

- [ ] Accept, Reject и изменение выбора работают на четырёх языках
- [ ] Cookie `margariteros_consent_v1` имеет versioned schema и `Domain=.margariteros.bar`
- [ ] Необязательный tracking соблюдает default-denied и текущий выбор
- [ ] `view_menu`, `reservation_click`, `contact_click`, `consent_updated` дедуплируются и не называются бронью
- [ ] Outbound URL сохраняет только allow-listed UTM/click IDs и никогда PII
- [ ] Web GTM подключается один раз; server transport конфигурируем, но не заявлен доказанным
- [ ] Unit/browser tests покрывают Accept/Reject, reload, duplicate click и unsupported Choice bridge
