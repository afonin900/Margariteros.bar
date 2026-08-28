# Margariteros R Club — локальный staging-пакет

Этот пакет поднимает изолированные PostgreSQL, RefRef API, Refer и webapp для проверки R Club. Он **не** делает fork, push, DNS, deploy, live Syrve request или включение программы Loyalty.

## Что проверяется

- `packages/coredb/src/margariteros-staging-seed.ts` создаёт один product, active program, participant и штатный RefRef refcode `x7mq2ka`;
- product metadata и program action маркированы `syrve_native`, но не содержат reward rule, сумму, баланс или PII;
- `/club` — browser/Mini App surface;
- `GET http://localhost:3002/x7mq2ka` отдаёт `307` в `/club?refcode=x7mq2ka` без participant/name/email;
- Telegram route подтверждает test-signed initData один раз через PostgreSQL. Потеря DB возвращает `503 not_ready`, а не позволяет вход;
- `GET http://localhost:3001/health` показывает API/database и отдельный `syrveAdapter: not_ready`; `GET http://localhost:3000/api/ready` отдельно показывает UI, database, RefRef API и неготовый Syrve adapter. Неготовность Syrve ожидаема и не имитирует начисление.

## Local Docker start

Нужны Docker Engine с Compose и свободные host ports: PostgreSQL `54329`, API `3001`, Refer `3002`, webapp `3000`.

```bash
cd /Users/afonin900/Github/refref
cp docker/margariteros-staging.env.example docker/margariteros-staging.env
docker compose --env-file docker/margariteros-staging.env -f docker/margariteros-staging.compose.yml up --build --wait
node docker/verify-margariteros-staging.mjs
```

Compose запускает `drizzle-kit migrate`, затем отдельный idempotent Margariteros seed. Проверка открывает browser portal/referral surface, делает два одинаковых test-signed Telegram launch и ожидает `200`, затем `409`; в финальном JSON Syrve остаётся `not_ready`.

Остановить локальный пакет, сохранив volume:

```bash
docker compose --env-file docker/margariteros-staging.env -f docker/margariteros-staging.compose.yml down
```

Чтобы удалить **только локальные данные этого пакета** после явного решения, добавить `--volumes`. Это нельзя применять к shared/staging production volume.

## Альтернатива без Docker

Upstream RefRef официально поддерживает local PostgreSQL. Не устанавливайте PostgreSQL глобально ради этого пакета: используйте уже предоставленный локальный/CI instance и безопасный `DATABASE_URL`, затем выполните в отдельных терминалах:

```bash
cd /Users/afonin900/Github/refref
corepack pnpm@10.23.0 --filter @refref/coredb db:migrate
corepack pnpm@10.23.0 --filter @refref/coredb staging:margariteros
DATABASE_URL="$DATABASE_URL" PORT=3001 corepack pnpm@10.23.0 --filter @refref/api dev
DATABASE_URL="$DATABASE_URL" PORT=3002 corepack pnpm@10.23.0 --filter @refref/refer dev
DATABASE_URL="$DATABASE_URL" REFREF_API_URL=http://localhost:3001 TELEGRAM_CLUB_BOT_TOKEN=local-only-test-token-not-for-production corepack pnpm@10.23.0 --filter @refref/webapp dev
```

Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_ASSETS_URL` as the normal upstream webapp contract requires. Do not put non-local values in this repository. If neither Docker nor a supplied PostgreSQL instance is available, the runtime verification is blocked; keep the package un-deployed and report that exact missing dependency.

## Environment names

Required for this package: `DATABASE_URL`, `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ASSETS_URL`, `REFREF_API_URL`, `TELEGRAM_CLUB_BOT_TOKEN`, `REFERRAL_HOST_URL`, `PORT`, `HOST`, `LOG_LEVEL`.

Syrve names are intentionally only names: `SYRVE_API_LOGIN`, `SYRVE_LOYALTY_PROGRAM_ID`. Supplying them alone does not make the adapter ready: the official program/order readback contract still needs a separately authorised proof.

## Later authorised staging/deploy path

This repository is an upstream checkout; today there is no fork or deploy. If the owner authorises a real staging release, first create a dedicated fork and record the upstream commit, then rebase/merge upstream with a reviewed diff. Inject environment values only in the approved deployment environment, run the same readiness and verification flow against the candidate, and retain a previous image revision. Rollback means select that previous known-good image, wait for UI/API readiness, verify `/club` and one opaque referral redirect, then confirm Syrve still performs no unapproved write. DNS, public domain binding and live Syrve tests require separate authorisation.
