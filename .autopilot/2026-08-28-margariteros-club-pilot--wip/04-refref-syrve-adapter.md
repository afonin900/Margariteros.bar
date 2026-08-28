# 04 — Подключить RefRef к штатному Syrve Loyalty

**Требования:** R04, R11, R14, R16, R17, R18, R19, R25, R26, R34i
**Blocked by:** 03
**Зона:** `/Users/afonin900/Github/refref/apps/api/` · `/Users/afonin900/Github/refref/packages/`
**Волна:** 4
**Status:** ready

## Что должно заработать

У RefRef появляется provider boundary для Syrve: registration/participant связывается с customer, referral conversion подтверждается по paid+closed order readback, а 10% и 5 PLN исполняются штатными программами Syrve. Integration log хранит только delivery/idempotency/reconciliation, не кошелёк.

## Критерии приёмки

- [ ] RefRef participant/referral/event остаются штатными сущностями upstream
- [ ] Syrve adapter использует официальный customer/program/order/transaction contract
- [ ] 10% и 5 PLN не рассчитываются и не хранятся как custom balance
- [ ] Повтор события не вызывает повторную native operation
- [ ] Без credential adapter возвращает not-ready и не симулирует успех
- [ ] Recorded redacted fixtures покрывают paid+closed, unpaid, cancelled, duplicate и timeout-readback
