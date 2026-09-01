# Margariteros Emdash content contract

## Native locale model

- The default locale is `pl`; supported locales are `pl`, `en`, `ru`, and `es`.
- A localized homepage or event is a separate content row. Rows for one piece
  of content share a `translation_group`; create a translation with
  `translationOf` pointing to an existing row.
- Locale is row metadata. Do not model languages as suffixed fields or as a
  separate readiness list.
- The public site reads the published row for the requested locale and uses the
  configured fallback only when that row is unavailable.

## Homepage

- Collection: `homepage`
- Public slug: `main`
- The `main` translation group controls the hero image, eyebrow, title, text,
  two button labels, image description, and gallery heading.
- Visitor-facing fields are translated in the matching locale row. During the
  migration, common image and content facts are copied into all four rows.
- The current Emdash schema marks those common fields as translatable, so a
  later date or image change must be repeated in every row or made by an agent
  with a full-group readback. Automatic shared-field synchronisation is not a
  current guarantee.

## Events

- Collection: `events`; use one stable descriptive slug and one translation
  group per event.
- Required facts in each published row are `starts_at`, visitor-facing title,
  summary and details, image, fact sources, and fact confirmation time.
- During migration, `starts_at`, `ends_at`, `event_state`, image, booking URL,
  fact sources, and confirmation time are copied into every locale row. Since
  these fields are currently translatable, any later common-fact change must be
  repeated across the group or performed by an agent with readback.
- `event_state` is `scheduled`, `postponed`, or `cancelled`.
- `booking_url` may point to the ChoiceQR booking page.
- `primary_performer` is a shared reference to one reusable `performers` row.
  The `event_performers` native relation may add an ordered multi-performer list.

## Performers

- Collection: `performers`; one stable slug and translation group per person or act.
- Shared facts: `name`, optional `main_photo`, optional social URLs, and `active`.
- Localized fact: `bio`. Published profiles require PL/EN/RU/ES rows.
- Only the name is required. Photo, biography and every social link are optional and render only when present.
- The public event page reads only published and active profiles.

## Safe writes

Read the collection schema and the exact translation group before writing.
Require a fact source for event facts and never invent dates, prices,
performers, or offers. Keep affected rows in `draft` until the required public
text is complete and checked. After every write, read the rows back and preview
each affected public locale. Publication and deletion require the owner's
explicit instruction.

Use the Emdash Media Library and current local storage for site images; verify
that each attached image has a useful description. Never create social
publication schedules, Buffer/Postiz records, or social creative workflows in
these collections.

## Future articles

Articles are intentionally not present yet. Add a separate `articles` collection
and public route only after their design is approved, using the same native
locale-row model. Never reuse `events` and never restore social publication
planning.
