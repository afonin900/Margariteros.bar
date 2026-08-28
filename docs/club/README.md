# Margariteros Club — RefRef → Syrve evidence boundary

Текущий P0 имеет live UI readback от 2026-08-28 (Loyalty Margariteros connected и свежий POS diagnostic; Guest 10% active с actions TEST и PARTNER ANDREI10; Reward 5 PLN inactive, exchange/webhook off, 0 actions; CouponsList 0 entries), но application API proof и физический POS proof ещё не приняты. Источник фактов — evidence pack в `.autopilot/2026-08-28-margariteros-club-pilot--wip/evidence/01-evidence-pack.md`.

Разрешённый контракт для будущего runtime:

- RefRef — отдельное self-hosted приложение и источник participant, refcode, referral, event и partner portal;
- Syrve — источник гостя, скидки, баланса и транзакции; интеграционный адаптер передаёт только secret-safe delivery/reconciliation metadata;
- `/r/<opaque-code>` остаётся стабильной ссылкой без PII и должен обслуживаться RefRef-based R Club, а не Astro-сайтом;
- начисление возможно только после `paid + closed`; RefRef reward record лишь отображает статус нативной операции Syrve, но не хранит сумму или баланс.

Любой live write выполняется только в ticket 04 с readback. Секреты и персональные данные в этот каталог не помещаются.
