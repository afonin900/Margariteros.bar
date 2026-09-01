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

Editorial-content completion evidence:

- Pre-write backup: `/var/backups/margariteros/emdash-before-editorial-seed-20260901T075923Z.db` (`1433600` bytes, mode `600`; SHA-256 prefix `87f03537`).
- Idempotent import script: `scripts/seed-staging-editorial-content.mjs`.
- Runtime bridge commit: `2e446e6`.
- Dokploy deployment: `sFavOVoWoDzVRHxGFOof8`, completed at `2026-09-01T08:08:35.264Z`.
- Readback: the CMS hero image is served on all four locales, both CMS event cards replace the code-only preview fixtures, and both event detail routes return HTTP `200` for PL/EN/RU/ES.

Owner entry point: `https://new.margariteros.bar/_emdash/admin`.

## Native language rows — applied after editorial seed

The staging app was updated to commit `1d4afa130ad19f78927819c6b5a9ef3faf934150`
on 2026-09-01. The existing Dokploy Swarm service completed update version
`100975` and its new container reported `healthy`.

- Before the first migration read, an SQLite backup was made at
  `/var/backups/margariteros/emdash-before-native-i18n-20260901T091857Z.db`.
- The first `--apply` created the native Homepage fields and completed one
  homepage group plus two event groups, each with published `pl`, `en`, `ru`,
  and `es` rows. Its independent backup is
  `/var/backups/margariteros/emdash-native-i18n-before-apply-20260901T091932Z.db`.
- After the four-locale and public-SSR readback, the separate cleanup removed
  the old `*_pl`, `*_en`, `*_ru`, `*_es` fields and `published_locales`. Its
  independent backup is
  `/var/backups/margariteros/emdash-native-i18n-before-cleanup-20260901T092147Z.db`.
- Final readback proved all three translation groups contain four published
  rows with one shared group each; no legacy field remains in the schema or
  data. `/healthz`, `/pl/`, `/en/`, `/ru/`, and `/es/` returned `200`, and
  every locale rendered its own CMS event row.
- The two clearly marked test events still have no event-specific
  `booking_url`, exactly as before the migration. Their dialog keeps the
  existing general booking fallback; this is not a missing translation.

## Boundary

This deployment does not change `margariteros.bar`, DNS, ChoiceQR, GTM, Google Ads, Cloudflare R2, or the server-side GTM runtime.

## Editable gallery and shared facts — final staging readback

The same staging service was updated from the previous native-language image to
commit `577e22fc1a513ed97c0e341005ba7f9841a28ec6`, then to the small
locale-consistency fix `ae8789c72854130e5da5e6899fd97dde1a8c9dd1`. The final
running image is `margariteros-site-staging-zgyi7c:deploy-ae8789c`; Swarm
service update version `101082` is healthy and retains `start-first` plus
automatic rollback on failure. The persistent `margariteros-emdash-data`
volume, environment, and domain binding were preserved.

### Backups

- Before the first image update: SQLite
  `/var/backups/margariteros/emdash-before-577e22f-20260901T113905Z.db` and
  volume archive
  `/var/backups/margariteros/emdash-volume-before-577e22f-20260901T113905Z.tar.gz`.
- Before the gallery migration:
  `/var/backups/margariteros/emdash-homepage-gallery-before-577e22f-20260901T114048Z.db`.
- Before the shared-field bridge:
  `/var/backups/margariteros/emdash-shared-fields-before-577e22f-20260901T114215Z.db`.
  The bridge's temporary rollback rehearsal passed.
- Before legacy cleanup:
  `/var/backups/margariteros/emdash-shared-fields-cleanup-before-ae8789c-20260901T115055Z.db`.
  The cleanup parity check passed before anything was removed.
- Final post-cleanup copies: SQLite
  `/var/backups/margariteros/emdash-after-cleanup-ae8789c-20260901T115249Z.db`
  and volume archive
  `/var/backups/margariteros/emdash-volume-after-cleanup-ae8789c-20260901T115249Z.tar.gz`.

### Applied content model

- Homepage `main` has one PL/EN/RU/ES translation group, a shared hero image,
  one shared 20-image order, and 20 translated descriptions in every locale.
- Each of the two existing Events groups has four locale rows. Start/end,
  state, image, booking URL, fact source, and confirmation time are now
  non-translatable shared fields; the Events date column uses
  `shared_starts_at`.
- The final cleanup removed the verified duplicate fallbacks:
  `homepage.hero_image`, `homepage.gallery_items`, `events.starts_at`,
  `events.ends_at`, `events.event_state`, `events.hero_image`,
  `events.booking_url`, `events.fact_sources`, and
  `events.facts_confirmed_at`.
- The code treats test-fixture slugs `test-*` as previews in every locale, so
  their general ChoiceQR fallback cannot diverge by language. A real event
  without that test marker builds its date parameter from the shared start
  time.

### Final acceptance

- `/healthz`, `/pl/`, `/en/`, `/ru/`, `/es/`, both event-detail routes in all
  four locales, and `/_emdash/admin/login` returned HTTP `200`.
- Every public homepage renders 20 gallery images. Every test-event booking
  link is the same general ChoiceQR URL in all four languages.
- The live ChoiceQR URL
  `https://qr.margariteros.bar/booking?date=1788541200` opened the Friday,
  4 September, 19:00 choice in the vendor form. No contact data was entered,
  no reservation was submitted, and no payment was attempted.
- The payment/deposit rule is not proven by this check: the first form step
  showed no price. Confirming the Friday paid-reservation setting still needs
  an owner-approved controlled flow or ChoiceQR API evidence.
