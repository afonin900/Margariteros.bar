# Website editing in Emdash

The Emdash interface and field labels are English. Public content is stored separately for Polish, English, Russian, and Spanish.

## Sign in

- Staging admin: `https://new.margariteros.bar/_emdash/admin`
- Local admin: `http://127.0.0.1:4321/_emdash/admin`
- Use the existing owner account. Secrets and sign-in links do not belong in Git or chat.

## What to edit

### Homepage

Open **Homepage** and edit the published entry with slug `main`. It controls the hero image, hero text, both button labels, image description, and gallery heading. Every text has Polish, English, Russian, and Spanish fields. Add a language to **Ready languages** only after its fields are complete.

The site uses reviewed built-in text when Emdash is unavailable, the entry is a draft, a language is not ready, or a field is empty. This keeps the homepage working during editing.

### Events

Open **Events** and create one entry per event. Fill the date and time, image, Polish content, any completed translations, booking URL, and fact source. Only a published event whose language is selected in **Ready languages** appears on that language version of the homepage.

Events use cards on the homepage and already have an individual public page route. Social channels and publication schedules are intentionally not part of Emdash.

## Agent and API access

The protected API lives under `/_emdash/api/`; the project-local skill is `.agents/skills/emdash-site-content/SKILL.md`. An agent must read the schema and current entry first, keep writes as drafts, read back the result, and may publish or delete only after an explicit owner instruction. MCP/API credentials stay in the local or deployment environment.

## Future articles

Articles are the next independent module, not an event field. When an article page design is approved, add an `articles` collection and public routes, then extend the same PL/EN/RU/ES rule. No empty blog section is exposed now.

## Applying the schema

`site/.emdash/seed.json` is the reviewed schema source. Applying it to staging changes live administration data and therefore requires a separate deployment/maintenance instruction, a database backup, and a readback. The retired `publications` and `creative_assets` collections must be removed from staging only during that controlled maintenance step.
