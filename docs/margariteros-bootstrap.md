# Margariteros: bootstrap official RefRef

Checked 2026-08-28 against the separate official checkout.

## Pinned upstream

- checkout: `/Users/afonin900/Github/refref`
- origin: `https://github.com/amicalhq/refref.git`
- commit: `81af934fec3b20990a4d9af7ed472d0d14d73a82`
- license: AGPL-3.0-only (`LICENSE`)
- upstream status: alpha; its README warns about breaking changes.
- runtime: Node.js 20+, `pnpm@10.23.0`, PostgreSQL; `portless` is required only for the documented multi-app dev URLs.

This checkout stays separate from the Astro site. Do not fork, push, deploy, or copy upstream code into Margariteros without an explicit licensing and upgrade decision.

## Official bootstrap

The upstream commands are `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm type:check` and `pnpm test:run`. The documented local setup also requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, schema push and an optional seed before any service start. Docker Compose starts PostgreSQL and the webapp, including schema push and seed.

Required names for a real local/webapp setup are `DATABASE_URL` and `BETTER_AUTH_SECRET`. Common optional names are `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_ASSETS_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_ENABLED`, `REFERRAL_HOST_URL`, `PORT`, `HOST`, `NODE_ENV` and `LOG_LEVEL`. Values belong only in the selected deployment secret store.

## Confirmed extension seams

- Signup attribution: `packages/refref-better-auth/src/plugin.ts` and `apps/api/src/routes/v1/track/signup.ts`; public API path is `POST /v1/track/signup` with API-key authentication.
- Purchase/conversion event: `apps/api/src/routes/v1/track/purchase.ts`; public API path is `POST /v1/track/purchase` with API-key authentication.
- Refcode redirect: `apps/refer/src/routes/r.ts`; global `GET /r/:code` and vanity `GET /r/:productSlug/:code` issue `307` to the program landing page.
- Referral/refcode creation: `apps/api/src/routes/v1/widget/init.ts` creates/refinds a refcode and records attribution without duplicate referrals.
- Portal/admin surface: `apps/webapp/src/app/(authenticated)/(core)/participants/` and `apps/webapp/src/server/api/routers/participants.ts`; it is the upstream participant/referral management UI.
- No Syrve provider or payout connector exists in the inspected source. Add a narrow Margariteros adapter only at the authenticated event boundary; it may map opaque RefRef event/participant IDs to Syrve IDs and delivery/readback status.

## Margariteros boundary

Syrve alone owns guest identity, discount, reward amount, wallet balance and transaction. RefRef owns participant, refcode, referral, event and portal. The adapter must not calculate a reward, store a balance, or turn a RefRef reward record into a payout instruction.

Do not use upstream redirect parameters as a ready-made first-party QR contract: the current redirect code base64-encodes participant fields into the URL. Keep printed QR URLs opaque and review/redact the redirect seam before any live use.

## Local verification performed

- `pnpm install --frozen-lockfile` completed (pnpm reported ignored optional dependency build scripts).
- `pnpm --filter @refref/utils test` passed: 44 tests.
- `pnpm --filter @refref/better-auth test` passed: 14 tests.
- `pnpm --filter @refref/refer test` and `pnpm --filter @refref/refer type:check` do not currently start: internal workspace packages have no built `dist` exports after a clean install.
- `pnpm --filter @refref/better-auth typecheck` fails in upstream source/tests against its installed Better Auth types. No source was changed to mask either failure.

Full dev, build and E2E checks remain unproven here because they require the upstream PostgreSQL bootstrap, schema operations and service configuration; no environment files or services were created for Margariteros.
