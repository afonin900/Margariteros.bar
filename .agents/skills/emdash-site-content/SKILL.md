---
name: emdash-site-content
description: Safely read or change Margariteros homepage and event content in Emdash. Use when an agent needs to add, update, remove, translate, or inspect website homepage content or events. Never use for social publication planning.
---

# Emdash website content

Use Emdash only for the Margariteros website collections `homepage` and `events`.
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
- `title`, `summary`, `details`, and other visitor-facing copy belong to the
  matching locale row. During the migration, common facts such as dates, event
  state, image, booking URL, fact sources, and confirmation time are copied into
  all four rows. In the current Emdash schema those fields are also marked
  translatable, so a later date or image change must be repeated in every row or
  made by an agent with a full-group readback. Automatic shared-field sync is a
  separate future improvement, not a current guarantee.
- Administration labels stay in English. Public text must be fact-checked and
  written for its locale; never invent event facts, prices, performers, or
  offers.

## Safe editing loop

1. Read the collection schema and the exact target row before changing it.
2. Keep every affected locale in `draft` until the required visitor-facing
   text is complete and checked. Publication and deletion require the owner's
   explicit instruction.
3. After each write, read the exact translation group back and preview every
   affected public locale. Confirm the copied common facts and image are still
   present in all rows.

Homepage writes target `homepage/main` and its locale rows. Event writes use a
stable descriptive slug and one translation group per event. The public site
reads the row for the requested locale, with the configured fallback only when
the requested row is unavailable.

## Scope boundaries

- Use the Emdash Media Library and the existing local storage for site images;
  check that an image is attached and has a useful alt description.
- Do not create social channels, publication schedules, Buffer/Postiz records,
  or social creative workflows in Emdash.
- Do not install a plugin as part of a content edit. The repository audit keeps
  SEO and the Media Library on Emdash core, treats WordPress import as an
  explicit migration, keeps the homepage gallery as its existing site module,
  and defers a standalone gallery plugin and R2 storage.
- Articles are a future separate collection and route. Do not reuse `events`
  for blog posts.
