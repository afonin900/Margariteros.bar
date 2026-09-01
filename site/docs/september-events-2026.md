# September 2026 event drafts

Source read back: the authenticated Google Calendar named `Margariteros`,
2026-09-01. The personal birthday shown on 7 September is not website content.

| Start (Europe/Warsaw) | End (Europe/Warsaw) | Event |
| --- | --- | --- |
| 2026-09-04 21:00 | 2026-09-05 02:00 | DJ Kike |
| 2026-09-05 21:00 | 2026-09-06 00:00 | Lerola ansambl |
| 2026-09-11 21:00 | 2026-09-12 02:00 | DJ Kike |
| 2026-09-12 21:30 | 2026-09-13 07:00 | After party po Dniach Meksyku |
| 2026-09-15 20:30 | 2026-09-16 04:00 | Dzień Niepodległości Meksyku |
| 2026-09-18 21:00 | 2026-09-19 02:00 | DJ Ibiza |
| 2026-09-19 21:00 | 2026-09-20 03:00 | DJ LSD (DOROTA) |
| 2026-09-25 21:00 | 2026-09-26 02:00 | DJ Kike |
| 2026-09-26 21:00 | 2026-09-27 02:00 | Dj Dragon |

All nine groups were created in staging Emdash as `draft`, with `pl`, `en`,
`ru`, and `es` rows. Date, end time, state, image, booking URL, source, and
confirmation time are shared fields. The current generic real Margariteros
event image is intentionally reused until performer-specific media is added in
the Media Library.

The repeatable importer is `scripts/sync-september-events.mjs`. It is a dry run
by default. Applying it requires an absolute `--backup` path and never publishes
an event.
