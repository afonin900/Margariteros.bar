---
name: emdash-site-content
description: Safely read or change Margariteros homepage, event, and performer content in Emdash. Use when an agent needs to add, update, remove, translate, link, or inspect website homepage content, events, or DJ profiles. Never use for social publication planning.
---

# Emdash website content

Use Emdash only for the Margariteros website collections `homepage`, `events`,
and `performers`.
The repository contract and the current editing instructions live in
`site/docs/emdash-site-content.md`. Read that document before any write.

## Native multilingual contract

- The default locale is `pl`; the supported locales are `pl`, `en`, `ru`, and
  `es`.
- A localized page or event is a separate Emdash content row. Rows for the same
  content share one `translation_group`; create a translation with
  `translationOf` pointing to an existing row.
- Do not create or restore `_pl`, `_en`, `_ru`, or `_es` fields. Do not create or
  restore `published_locales`. Locale is row metadata, not a long set of fields.
- `title`, `summary`, `details`, hero/button copy, and image descriptions belong
  to the matching locale row. After `migrate:shared-fields` has been accepted,
  `shared_*` fields are the common facts: event date/time, state, image, booking
  URL, fact sources, confirmation time, plus the homepage hero and gallery image
  order. Edit one shared field on any sibling and native Emdash synchronizes it
  to the whole translation group.
- For the homepage, images live in `Shared hero image` and `Shared homepage
  gallery images`; `Gallery image descriptions` remains a translated list. For
  events, use the `Shared ...` fields and keep title/summary/details translated.
  Old non-`shared_*` common fields are fallback only during the two-phase bridge;
  never edit them after the bridge has been applied.
- Emdash's native sync is an editing guarantee, not a reason to hand-write data
  in every SQLite row. It keeps synchronized copies internally. If the group
  readback disagrees, stop rather than manually repairing database tables.
- Administration labels stay in English. Public text must be fact-checked and
  written for its locale; never invent event facts, prices, performers, or
  offers.

## Safe editing loop

1. Read the collection schema and the exact target row before changing it.
2. Keep every affected locale in `draft` until the required visitor-facing
   text is complete and checked. Publication and deletion require the owner's
   explicit instruction.
3. After each write, read the exact translation group back and preview every
   affected public locale. Confirm shared fields are identical in all rows and
   localized copy/descriptions stayed in their own language.

The bridge itself is owner-controlled: first run
`npm run migrate:shared-fields -- --apply --backup=/absolute/path/pre-shared-fields.db`,
then accept the four-route readback. Never run `--cleanup-legacy` unless the
owner explicitly asks after that acceptance; it needs a fresh backup and the
separate `--confirm-legacy-cleanup` flag.

Homepage writes target `homepage/main` and its locale rows. Event writes use a
stable descriptive slug and one translation group per event. The public site
reads the row for the requested locale, with the configured fallback only when
the requested row is unavailable.

Performer writes target `performers`. `name` and `active` are shared facts;
`main_photo` is an optional shared fact and `bio` is localized. Instagram, Facebook, TikTok, YouTube,
SoundCloud, and website are optional HTTPS links. Editors normally choose one
`Primary performer` on an event; the native `event_performers` relation is for
an ordered multi-performer list. Draft or inactive profiles never render.

## Scope boundaries

- Use the Emdash Media Library and the existing local storage for site images;
  check that an image is attached and has a useful alt description.
- Do not create social channels, publication schedules, Buffer/Postiz records,
  or social creative workflows in Emdash.
- A performer social link is informational only. It never authorizes a post,
  message, follow, or other action on that network.
- Do not install a plugin as part of a content edit. The repository audit keeps
  SEO and the Media Library on Emdash core, treats WordPress import as an
  explicit migration, keeps the homepage gallery as its existing site module,
  and defers a standalone gallery plugin and R2 storage.
- Articles are a future separate collection and route. Do not reuse `events`
  for blog posts.
