# Margariteros Emdash content contract

## Homepage

- Collection: `homepage`
- Public entry slug: `main`
- The website reads only a published `main` entry.
- Editable module: hero image, eyebrow, title, text, two button labels, image description, and gallery heading.
- Every text field has an explicit `_pl`, `_en`, `_ru`, or `_es` suffix.
- `published_locales` declares which language versions are complete.
- Missing, incomplete, draft, or unavailable CMS data falls back to the reviewed text bundled with the site.

## Events

- Collection: `events`
- Required facts: `starts_at`, Polish title/summary/details, image, fact sources, fact confirmation time, and ready languages.
- English, Russian, and Spanish use `_en`, `_ru`, and `_es` fields.
- Only published events with a complete selected locale appear publicly.
- `event_state` is `scheduled`, `postponed`, or `cancelled`.
- `booking_url` may point to the ChoiceQR booking page.

## Agent access

Prefer the project Emdash MCP/API connection. Read collection schema and the target entry before writing. For homepage changes target only `homepage/main`. For events use a stable descriptive slug. After a write, read the entry back and preview the relevant public locale.

## Future articles

Articles are intentionally not present yet. Add a separate `articles` collection only when the public article route and design are approved. Never reuse `events` and never restore social publication planning.
