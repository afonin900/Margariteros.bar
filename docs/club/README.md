# Margariteros Club — RefRef → Syrve evidence boundary

Текущий P0 имеет live UI readback от 2026-08-28 (Loyalty Margariteros connected и свежий POS diagnostic; Guest 10% active с actions TEST и PARTNER ANDREI10; Reward 5 PLN inactive, exchange/webhook off, 0 actions; CouponsList 0 entries), но application API proof и физический POS proof ещё не приняты. RefRef, адаптер, web/Mini App и отдельный Dokploy staging собраны; `/api/ready = 200` доказывает чтение активной программы, но не создание гостя, скидку, награду или оплаченный чек. Источник фактов — evidence pack в `.autopilot/2026-08-28-margariteros-club-pilot--wip/evidence/01-evidence-pack.md`.

Разрешённый контракт для будущего runtime:

- RefRef — отдельное self-hosted приложение и источник participant, refcode, referral, event и partner portal;
- Syrve — источник гостя, скидки, баланса и транзакции; интеграционный адаптер передаёт только secret-safe delivery/reconciliation metadata;
- `/r/<opaque-code>` остаётся стабильной ссылкой без PII и должен обслуживаться RefRef-based R Club, а не Astro-сайтом;
- начисление возможно только после `paid + closed`; RefRef reward record лишь отображает статус нативной операции Syrve, но не хранит сумму или баланс.

Ближайший исполнимый рубеж — ticket 07: один физический `paid + closed` чек с доказательством скидки 10%, начисления 5 PLN партнёру и повторного чтения без дубля. Telegram-бот и регистрация пока не считаются запущенными. Публичный домен, боевые лимиты, правила повторной привязки и юридические сроки хранения требуют отдельных решений.

Любой live write выполняется только в ограниченном POC с readback. Секреты и персональные данные в этот каталог не помещаются.
