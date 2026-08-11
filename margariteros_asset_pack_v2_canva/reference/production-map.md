# Canva production map

## Source of truth

1. Repository root `DESIGN.md` — visual rules and normative tokens.
2. `system/tokens.json` — machine-readable production values.
3. `templates/*.pptx` — transport files for Canva import.
4. Canva Brand Templates — accepted only after the import checklist passes.

When files disagree, follow the higher item and rebuild downstream assets.

## Production typography

- Headlines: **Barlow Condensed Black Italic**, weight 900.
- Facts, date, time, address and CTA: **Montserrat**, weights 700–900.
- Required Polish proof: `ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż`.
- Bangers, Archivo Black, Arial Black and Nunito are legacy-only.

## Composition

- real photo/video remains the hero;
- one message and one CTA per material;
- lime is the signature marker;
- orange marks date, urgency, price or CTA;
- mascot appears no more than once in four materials;
- papel picado is a campaign accent, not a default header.

## Formats

| Format | Size | Primary task |
| --- | ---: | --- |
| Feed / Facebook / Telegram post | 1080×1350 | One event or offer and one CTA |
| Carousel | 1080×1350 | One idea per card and one shared rhythm |
| Story / Reel | 1080×1920 | Fast what/when/action message |

## Unknown data

Unknown DJ, date, time, price, offer and availability remain `MISSING` during production. A template containing placeholders must never be exported for publication.
