# Editing the site in Emdash

Emdash controls two website modules: **Homepage** and **Events**. The admin
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

Visitor-facing fields (`title`, `summary`, `details`, hero text and button
labels) are edited in the selected language row. During the migration, common
facts are copied into all four rows: the event date and time, status, image,
booking link, fact sources, and confirmation time. The current Emdash schema
also marks these fields as translatable, so a later date or image change must be
repeated in every row or made by an agent with a full-group readback. Automatic
shared-field synchronisation is a separate future improvement, not a current
guarantee.

Before publication, each required language row needs complete, fact-checked
visitor text. A missing language remains a draft; the site uses its configured
fallback only when a requested published row is unavailable.

## Homepage

Open **Homepage** and select the `main` translation group. Edit the selected
locale row's hero image, hero eyebrow, hero title, hero text, two button labels,
image description, or gallery heading. The image must be selected from the
Emdash Media Library/local storage and must have an accurate description.

The gallery shown on the homepage is the existing Astro site module. It is not
a second social or publication calendar. Keep its approved image set and
layout until a separate gallery design is accepted.

## Events

Open **Events** and create one translation group per real event. Fill the shared
date/time, event status, image, booking URL, fact sources, and confirmation
time, then create the `en`, `ru`, and `es` rows from the Polish row and translate
only the visitor-facing copy. Publish a row only after its required text is
ready. The homepage cards and the event detail route read these localized rows.

Do not add publication channels, scheduling, Buffer, or Postiz data to an event.

## Standard capabilities audit (checked 2026-09-01)

| Need | Decision | What it means here |
| --- | --- | --- |
| SEO | Use Emdash core | Collections can enable the built-in SEO panel (`supports: ["seo"]`) for title, description, image, canonical, and no-index data. Sitemap and language alternates use published locale rows. No SEO plugin is needed. |
| Images | Use Emdash Media Library + local storage | Editors can upload, search, organize, attach, describe, and reuse images. Local storage remains the current choice; R2 is only a later plan. |
| Gallery | Keep the current homepage module | Emdash has a gallery block for rich text, but this homepage already has a deliberate Astro gallery. A separate ordered-gallery plugin is not needed now and is deferred until its design and storage are approved. |
| WordPress content | Import only with an explicit migration | The official WXR file import is the most complete route and can bring content and media metadata. WordPress.com OAuth and a self-hosted REST probe also exist. Run none of them without an export, backup, mapping, and readback. |
| WordPress design | Port manually when needed | Content import does not copy the WordPress theme's visual design. CSS, layout, breakpoints, fonts, and dynamic parts must be extracted and rebuilt as Astro components. |

The checked sources are the [Emdash documentation](https://docs.emdashcms.com/),
the [media library guide](https://docs.emdashcms.com/guides/media-library/),
the [WordPress content import guide](https://docs.emdashcms.com/migration/content-import/),
and the [WordPress theme porting guide](https://docs.emdashcms.com/themes/porting-wp-themes/).

No plugin was installed for this audit. SEO and media remain core Emdash
capabilities; a standalone gallery plugin and R2 storage are deferred.

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
