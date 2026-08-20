# Доступ агента к GTM бара

Дата: 2026-08-18  
Контейнер уже стоит на Choice: `GTM-T5F4VVGF`. Prod не трогаем. Нужен только доступ.

## Как устроено

Две разные почты Google:

1. **Барная** — владелец кабинета GTM бара. С неё контейнер уже вшит в Choice.
2. **Школьная / оператор** — ею живёт `gtm-mcp` (Kazan Flower School). Этой почтой агент умеет читать и править GTM.

Агент не логинится барной почтой и не переносит кабинет «на школу».

## Что сделать владельцу (один раз)

Из барной почты, которая видит `GTM-T5F4VVGF`:

1. Открыть [tagmanager.google.com](https://tagmanager.google.com).
2. Аккаунт бара → контейнер `GTM-T5F4VVGF`.
3. **Admin → User Management**.
4. **Add users** → почта оператора.
5. Права контейнера: **Publish** (минимум **Edit**).
6. Владельца не менять. Барная почта остаётся хозяином.

Какую почту добавить: ту, которой заходили в школьный GTM. Если это `afonin900@gmail.com` — её. Если школьный кабинет на другой — ту.

Сделано 18.08.2026: `afonin900@gmail.com` добавлен администратором аккаунта `Margariteros Bar` (`6313263127`). Барная почта `margaritabar.pl@gmail.com` тоже администратор, кабинет не забирали.

## Чего не делать

- Не Transfer ownership на школьную почту.
- Не создавать второй контейнер «чтобы агенту было удобно».
- Не вставлять новый сниппет на Choice / меню / QR.
- Не Publish из кабинета, пока нет отдельного «можно».
- Не класть хиты бара на школьный `gtm-server`.

## Что снято после инвайта

| Поле | Значение |
|---|---|
| Аккаунт | Margariteros Bar |
| Account ID | `6313263127` |
| Container ID | `230106068` |
| Public ID (web) | `GTM-T5F4VVGF` |
| Контейнер web | `margariteroswwa.choiceqr.com/booking` |
| Server public ID | `GTM-KMF9Z88Z` |
| Server container ID | `261605911` |
| Server имя | `gtm.margariteros.bar` |
| Операторы | `margaritabar.pl@gmail.com`, `afonin900@gmail.com` (оба admin) |

Дальше: полка OpenBao `secret/projects/margariteros/gtm` и карта тегов только чтением. Publish без «можно» нельзя.

sGTM на Dokploy — только после этого и отдельного «можно».
