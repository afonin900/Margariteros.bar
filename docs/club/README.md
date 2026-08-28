# Margariteros Club — evidence boundary

Текущий P0 имеет live UI readback от 2026-08-28 (Loyalty Margariteros connected и свежий POS diagnostic; Guest 10% active с actions TEST и PARTNER ANDREI10; Reward 5 PLN inactive, exchange/webhook off, 0 actions; CouponsList 0 entries), но application API proof и физический POS proof ещё не приняты. Источник фактов — evidence pack в `.autopilot/2026-08-28-margariteros-club-pilot--wip/evidence/01-evidence-pack.md`.

Разрешённый контракт для будущего runtime:

- `/r/<opaque-code>` — стабильная first-party ссылка без PII;
- `pending` до ручной активации, `active` только после operator readback;
- начисление только после `paid + closed`, idempotency key `syrve-check:<externalCheckId>:partner-reward:v1`;
- Syrve — источник гостя, скидки, баланса и транзакции; собственный ledger — техническая связь и аудит.

Любой live write выполняется только в ticket 04 с readback. Секреты и персональные данные в этот каталог не помещаются.
