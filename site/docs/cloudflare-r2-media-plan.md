# Cloudflare R2 media plan

Status: accepted plan, not implemented
Decision date: 2026-09-01

## Decision

Keep the site and Emdash on the current Dokploy Node.js runtime for the first production release. Move only new Emdash uploads to the Margariteros Cloudflare R2 account in a separate controlled change.

This gives durable image storage and fast global delivery without forcing an early rewrite of the Emdash database and authentication runtime.

## Current state

- The public bundle contains 62 files and about 4.2 MB of media. These reviewed assets stay in `site/public/media/` and are deployed with the application image.
- New Emdash uploads currently use the persistent Dokploy volume at `/app/data/uploads`.
- Emdash content and users use SQLite at `/app/data/emdash.db` on the same persistent volume.
- Server-side GTM remains on the existing Finnish server. Its location is independent of R2 media storage.

## Target state

```text
Visitor
  -> Cloudflare DNS/CDN
  -> Astro SSR on Dokploy
  -> Emdash content in persistent SQLite
  -> event and article images in Cloudflare R2

Browser analytics
  -> web GTM
  -> existing server-side GTM transport
```

Emdash already supports S3-compatible storage, including Cloudflare R2. The future runtime configuration uses environment names only:

- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_REGION`
- `S3_PUBLIC_URL`

Values belong in OpenBao and the Dokploy deployment environment, never in Git or chat.

## Expected cost

At the current project size the expected Cloudflare cost is USD 0 per month, provided the account's shared free allowance is not already consumed by other projects.

Official R2 monthly free allowance at the decision date:

- 10 GB-month Standard storage;
- 1 million Class A write/list operations;
- 10 million Class B read operations;
- free internet egress.

Source: `https://developers.cloudflare.com/r2/pricing/`.

If the full SSR application is evaluated for Cloudflare Workers later, the Free plan currently allows 100,000 Worker requests per day while static asset requests are free and unlimited. Source: `https://developers.cloudflare.com/workers/platform/pricing/`.

## Why the whole site is not moving now

The current application uses the Astro Node adapter, filesystem sessions, Emdash authentication, local SQLite, and a persistent volume. Emdash 0.35 provides SQLite, libSQL, and PostgreSQL database adapters but no direct Cloudflare D1 adapter in this project.

A full Workers migration therefore needs a separate compatibility proof for Astro SSR, Emdash admin and authentication, database migration, sessions, media operations, backup/restore, ChoiceQR behavior, and GTM conversions. It must not be mixed with the first production cutover.

## R2 implementation gate

1. Read the current Cloudflare account and confirm the Margariteros zone and R2 entitlement without exposing credentials.
2. Create a dedicated bucket and least-privilege credential only after explicit approval.
3. Back up `/app/data/emdash.db` and `/app/data/uploads`.
4. Add conditional Emdash S3 storage configuration and keep local storage as the rollback path.
5. Copy existing Emdash uploads with checksum verification; do not move bundled `site/public/media/` assets.
6. Deploy to `new.margariteros.bar` first.
7. Upload, read, replace, and delete one test image through Emdash; verify PL/EN/RU/ES pages and admin thumbnails.
8. Read Cloudflare usage and confirm the free tier estimate with real traffic.
9. Cut over production only after owner visual acceptance.

## Rollback

Restore the local storage adapter, redeploy the previous successful image, mount the unchanged `margariteros-emdash-data` volume, and verify `/healthz`, the admin media library, Homepage, and Events before removing any R2 test objects.
