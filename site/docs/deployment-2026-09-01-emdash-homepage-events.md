# Staging deployment — Homepage and Events

Date: 2026-09-01
Scope: `https://new.margariteros.bar` only
Deployed commit: `dc2010be0dd0f14380441d9007439ddfa5cb8efd`

## Result

The current Astro SSR site is deployed and healthy on the staging domain. Emdash now contains only two website modules:

- `Homepage` — multilingual hero and gallery heading;
- `Events` — multilingual event cards and event pages.

The retired `publications` and `creative_assets` collections and their content tables were removed after a verified database backup. The existing owner user was preserved.

## Safety evidence

- Dokploy application: `Margariteros site — staging`.
- Application id: `r6jt-TMDo1Bxi7hA5ckPy`.
- Git source: `afonin900/Margariteros.bar`, branch `codex/choiceqr-exact-ssr`, build path `/site`.
- Persistent volume: `margariteros-emdash-data` mounted at `/app/data`.
- Backup: `/var/backups/margariteros/emdash-before-dc2010b-20260901T073606Z.tar.gz`.
- Backup contains `emdash.db`; its SHA-256 starts with `9981b247`.
- Dokploy deployment `mx9yz0esdQ9fEBGPXEXQp` finished with status `done`.
- Runtime container reported healthy.
- `/healthz`, `/pl/`, `/en/`, `/ru/`, `/es/`, and `/_emdash/admin` returned HTTP 200.
- Live database readback: collections `events`, `homepage`; content tables `ec_events`, `ec_homepage`; one owner user preserved.

## Current content state

The published `homepage/main` entry and two clearly labelled test events were added to Emdash after a second SQLite backup. Their images remain in the persistent local upload volume. The public site must read these records through `src/live.config.ts`; the built-in hero and preview events remain only as failure-safe fallbacks.

Owner entry point: `https://new.margariteros.bar/_emdash/admin`.

## Boundary

This deployment does not change `margariteros.bar`, DNS, ChoiceQR, GTM, Google Ads, Cloudflare R2, or the server-side GTM runtime.
