# Editing the site in Emdash

Emdash controls three website modules: **Homepage**, **Events**, and
**Performers**. The admin
labels are English, while each visitor-facing text is stored in its own
language version. Social publishing is not part of this site content model.

## Sign in

- Staging admin: `https://new.margariteros.bar/_emdash/admin`
- Local admin: `http://127.0.0.1:4321/_emdash/admin`

Use the existing owner account. Passwords, access links, and API keys do not
belong in Git or in chat.

## How languages work

The default language is Polish (`pl`). The supported languages are `pl`, `en`,
`ru`, and `es`, with public routes `/pl/`, `/en/`, `/ru/`, and `/es/`.

Each language is a separate Emdash row. The four rows for one homepage or event
share one `translation_group`; a new row is made from the existing one with
`translationOf`. This is the standard Emdash model: there is no wall of
`_pl`/`_en`/`_ru`/`_es` fields and no `published_locales` switch.

Visitor-facing fields (`title`, `summary`, `details`, hero text, button labels,
and image descriptions) are edited in the selected language row. After the
shared-fields bridge has been applied, common facts use the `shared_*` fields:
event date/time, status, image, booking link, fact sources, and confirmation
time; the homepage hero image and gallery image order are common too. Edit a
shared field in any one language row and native Emdash synchronizes it to the
other rows in the same group.

This is one editing action, not one physical SQLite cell: Emdash keeps a copy
on each language row and synchronizes the value in its normal runtime write.
Do not manually repeat it. The old fields stay as a read fallback only until a
separate, owner-approved cleanup; once the bridge is live, do not edit them.

Before publication, each required language row needs complete, fact-checked
visitor text. A missing language remains a draft; the site uses its configured
fallback only when a requested published row is unavailable.

## Homepage

Open **Homepage** and select the `main` translation group. The hero eyebrow,
title, text, two button labels, hero image description, and gallery heading are
per-language copy. After the shared-fields bridge, edit `Shared hero image` and
`Shared homepage gallery images` once in any language row. Edit the matching
`Gallery image descriptions` in each language row: images and their order are
common, while screen-reader text remains translated. The gallery accepts 4–20
images and keeps that order on the site.

The gallery remains the existing Astro site module for its visual layout, but
its image list is now editable in Emdash. There is no separate gallery plugin
or publication calendar involved.

## Events

Open **Events** and create one translation group per real event. After the
shared-fields bridge, fill `Shared start date and time`, `Shared end date and
time`, `Shared event status`, `Shared event image`, `Shared booking URL`,
`Shared fact sources`, and `Shared facts confirmed at` once. Then create the
`en`, `ru`, and `es` rows from the Polish row and translate only the
visitor-facing copy. Publish a row only after its required text is ready. The
homepage cards and the event detail route read these localized rows.

Do not add publication channels, scheduling, Buffer, or Postiz data to an event.

## Performers

Open **Performers** to create a reusable DJ or artist profile. Fill the name,
main photo and Instagram URL. Biography is translated in the native PL/EN/RU/ES
rows; Facebook, TikTok, YouTube, SoundCloud and website are optional. Turn off
`Active` to hide a profile from public event pages without deleting it.

In **Events**, `Primary performer` is the normal editor control: select one
profile and save the event. The native `event_performers` relation also supports
an ordered list of additional performers through the protected API. Both paths
are locale-safe, and the public event page ignores draft or inactive profiles.
Social links are informational links only; they do not publish content.

The schema is installed by `scripts/migrate-performers.mjs`. Its default mode is
read-only. An apply is a one-time structure change and requires a database
backup; ordinary profile and event edits do not.

## Standard capabilities audit (checked 2026-09-01)

| Need | Decision | What it means here |
| --- | --- | --- |
| SEO | Use Emdash core | Collections can enable the built-in SEO panel (`supports: ["seo"]`) for title, description, image, canonical, and no-index data. Sitemap and language alternates use published locale rows. No SEO plugin is needed. |
| Images | Use Emdash Media Library + local storage | Editors can upload, search, organize, attach, describe, and reuse images. Local storage remains the current choice; R2 is only a later plan. |
| Gallery | Use the native Emdash repeater + Media Library | After the bridge, `Shared homepage gallery images` holds the common ordered images and `Gallery image descriptions` holds translated alt text, each validated to 4–20 items. The Astro module keeps the approved visual layout; no gallery plugin or Field Kit is needed. |
| WordPress content | Import only with an explicit migration | The official WXR file import is the most complete route and can bring content and media metadata. WordPress.com OAuth and a self-hosted REST probe also exist. Run none of them without an export, backup, mapping, and readback. |
| WordPress design | Port manually when needed | Content import does not copy the WordPress theme's visual design. CSS, layout, breakpoints, fonts, and dynamic parts must be extracted and rebuilt as Astro components. |

The checked sources are the [Emdash documentation](https://docs.emdashcms.com/),
the [media library guide](https://docs.emdashcms.com/guides/media-library/),
the [WordPress content import guide](https://docs.emdashcms.com/migration/content-import/),
and the [WordPress theme porting guide](https://docs.emdashcms.com/themes/porting-wp-themes/).

No plugin was installed for this audit. SEO, media, and the ordered homepage
gallery remain core Emdash capabilities; Field Kit, a standalone gallery plugin,
and R2 storage are not needed for this path and remain deferred.

## Agent and API access

The protected API is under `/_emdash/api/`. The project skill is
`.agents/skills/emdash-site-content/SKILL.md`. Before an agent writes, it must
read the schema and the exact translation group; after a write, it must read
back the result and preview each affected locale. MCP/API credentials remain in
the local or deployment environment.

## Future articles

Articles are a separate future module. When an article design and public route
are approved, add an `articles` collection with the same native language-row
model. Do not mix articles with events and do not restore social planning.

## Storage and schema changes

`site/.emdash/seed.json` is the reviewed schema source. Applying it to staging
changes live administration data and requires a backup and a readback. Current
site media stays local. The Cloudflare R2 media plan is recorded separately and
is deliberately deferred.

## Shared fields migration

The bridge is a separate migration, not a content-editing shortcut. Emdash
0.35 correctly refuses to turn an existing translatable field into a
non-translatable one. Its seed format also cannot declare `translatable: false`.
For that reason `shared_*` fields are created only by
`scripts/migrate-shared-fields.mjs`; do not add them to `seed.json` and do not
use a seed apply as a replacement for this migration.

Run it from `site/` only after the homepage gallery migration has completed,
with one writer paused (no editor save and no second application instance
writing at the same time):

```text
# Read-only plan
npm run migrate:shared-fields

# Approved non-destructive bridge: creates shared fields, copies verified data,
# backs up the database and rehearses opening a temporary rollback copy.
npm run migrate:shared-fields -- --apply --backup=/absolute/path/pre-shared-fields.db
```

The ordinary `--apply` never removes `hero_image`, `gallery_items`,
`starts_at`, `ends_at`, `event_state`, `booking_url`, `fact_sources`, or
`facts_confirmed_at`. It checks every PL/EN/RU/ES translation group, refuses
mixed values, preserves localized copy, changes the Events administration date
column to `shared_starts_at`, and prints a JSON readback. Review that report,
then inspect the Emdash admin and `/pl/`, `/en/`, `/ru/`, `/es/` before saying
the bridge is accepted.

Only after that explicit acceptance is the destructive cleanup available. It
requires a new backup and refuses if an old value no longer exactly matches its
shared replacement:

```text
npm run migrate:shared-fields -- --apply --cleanup-legacy --confirm-legacy-cleanup --backup=/absolute/path/pre-shared-fields-cleanup.db
```

For rollback, stop writes, restore the exact pre-run backup to the persistent
Emdash database with the service stopped, restore its normal file ownership,
start one application instance, and read back the admin plus all four public
routes. Do not overwrite a running database file in place. The migration itself
only performs a temporary restore rehearsal; it never restores or deletes a
live database on its own.

## Homepage gallery migration

The repository includes an idempotent migration for an existing native Emdash
database: `scripts/migrate-homepage-gallery.mjs`. It imports the 20 approved
positions from the current static gallery into local Emdash media, adds the
`gallery_items` field when it is absent, fills the `pl`, `en`, `ru`, and `es`
rows, and performs a full translation-group readback. It never removes the old
static files or publishes a row.

Run it from `site/` first without `--apply` to get a plan. Before an approved
staging write, make a new database backup and pass its absolute path:

```text
npm run migrate:homepage-gallery -- --apply --backup=/absolute/path/pre-homepage-gallery.db
```

The script uses `/app/data/emdash.db`, `/app/data/uploads`, and the built
`/app/dist/client` by default in the container. For a local run, set
`EMDASH_DATABASE_PATH`, `EMDASH_UPLOADS_PATH`, and `EMDASH_PUBLIC_PATH` to the
local database, upload directory, and `public`/built asset directory. Review
the JSON readback before checking the four public staging routes.
