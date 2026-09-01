# Проверка качества перед Dokploy

`npm run verify:release` последовательно выполняет typecheck, production build,
unit/SSR HTTP smoke, доступность/контентную безопасность SSR и secret scan.

`tests/production.test.ts` поднимает собранный Node server и проверяет:

- `GET /healthz` возвращает `200 ok` без внешних запросов;
- для PL/EN/RU/ES в HTML уже есть заголовок, menu/booking CTA, доступные имена,
  alt-тексты, 20 изображений галереи и lazy images; JavaScript для их появления
  не нужен;
- HTML не содержит запрещённого алкогольного позиционирования.

Визуальные растры после review лежат вне build context и сохранены в
`.impeccable/review/`: `desktop.png` (1744 px), `tablet.png` (768 px) и
`mobile.png` (390 px). Их состав и расхождения зафиксированы в
`site/docs/choiceqr-overlay-evidence.md`.

Secret scan охватывает `site/` и активный `.autopilot/` run, исключая generated
артефакты и зависимости. Он распознаёт только private key blocks, GitHub/OpenAI/
AWS access keys и credential URLs; это защита от этих известных форматов, а не
утверждение об обнаружении любого возможного токена. Значения переменных
окружения никогда не добавляются в репозиторий.
