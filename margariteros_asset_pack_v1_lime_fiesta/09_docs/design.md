# MARGARITEROS — Lime Fiesta Design System v1

**Status:** production asset pack completed  
**Direction:** Lime Fiesta  
**Primary use:** posters, menus, social media, Reels, event promotion, video graphics and bar communication.

## 1. Brand idea

Lime Fiesta is a loud, friendly Mexican-party identity built around four signals: acidic lime, warm orange, matte black and tactile print texture. The system should feel energetic and handmade, but every composition must remain readable and easy to reproduce.

## 2. Master palette

| Role | Color | Hex |
|---|---|---|
| Primary lime | Acid lime | `#C6FF00` |
| Secondary lime | Deep lime | `#7BC300` |
| Warm paper | Cream | `#FFF5E1` |
| Primary dark | Near black | `#0B0B0B` |
| Fiesta accent | Orange | `#FF5A2E` |

Use black and lime as the dominant pair. Orange is an accent, not a second dominant color. Cream is reserved for paper-style layouts, menus and readability blocks.

## 3. Logo

Use `01_logo_pack/lf_logo_primary_round.png` as the primary mark. Keep its proportions unchanged and preserve clear space of at least 12% of the logo diameter around it.

Do not:

- redraw the lettering;
- distort the circle;
- replace the mascot face;
- recolor it outside the approved palette;
- place it on a low-contrast or visually noisy area without a dark or cream holding field.

## 4. Mascot

The mascot is a margarita glass character, not a humanoid body.

Locked anatomy:

- exactly one glass stem and one glass base;
- no human legs or shoes;
- hands and arms may change pose;
- the same sombrero construction, brim width, crown and orange zigzag detail must be retained;
- the glass bowl, face and moustache should remain recognizable across all poses.

Approved poses are stored in `02_mascot_pack/`.

## 5. Typography

Recommended headline mood: condensed, bold, slightly distressed display type. The reference direction uses **Bangers** for expressive headings and **Nunito** for readable supporting copy.

Hierarchy:

1. one large headline;
2. one compact date/time block;
3. one short CTA;
4. supporting text in a quieter sans-serif.

Do not use more than two font families in one composition. Avoid thin type on textured backgrounds.

## 6. Graphic language

Core graphic elements:

- papel picado banners;
- lime, chili, agave, cactus, taco, cocktail and music icons;
- paint strokes and ink edges;
- lime/orange splash clusters;
- decorative floral corners and dividers;
- seamless fiesta patterns;
- matte paper, chalk and grunge textures.

Decoration must frame the message, not compete with it. Keep the center or principal text zone relatively calm.

## 7. Texture rules

Textures live in `06_textures_backgrounds/`.

Recommended use:

- seamless backgrounds at native size or repeated as tiles;
- transparent grain/distress overlays at 8–25% opacity;
- glow overlays at 10–35% opacity;
- vignette only where it improves text contrast.

Do not enlarge a raster texture beyond its native pixel dimensions. Repeat seamless masters instead.

## 8. Patterns

The three repeat masters in `05_pattern_pack/` are true layout modules. Use them by repetition. Never stretch a single tile to fill a large canvas.

For body text, reduce pattern opacity or place text on a solid black/cream block.

## 9. Posters and print

Templates in `07_poster_templates_pack/` are composition frameworks, not locked advertisements.

Rules:

- keep logo and event title inside the guide-safe area;
- use short headings;
- keep date and time together;
- reserve orange for urgency, price, date or CTA;
- for A4/A6 files, export at 300 DPI;
- add printer bleed in the layout application, not by stretching the PNG.

## 10. Video and social

Templates in `08_video_social_templates_pack/` include blank backgrounds and transparent overlays.

For Reels:

- use the safe-zone guide;
- keep critical copy away from top and bottom UI zones;
- animate the mascot with small arm, sombrero and glass-bounce movements;
- do not transform the single stem into legs during animation;
- use 2–4 second title cards and short CTA endings.

## 11. Accessibility and legibility

Primary combinations:

- lime on black;
- cream on black;
- black on lime;
- black on cream.

Avoid orange body text on lime. Maintain strong contrast and use a holding panel when a photo is busy.

## 12. File policy

PNG is the production format for this pack. Transparent PNG is used for isolated assets and overlays; opaque PNG is used for complete backgrounds and templates.

No automatic PNG-to-SVG tracing is included. Raster files must not be marketed as vector masters. If true vectors are later required, manually redraw only the final approved core marks.

## 13. Source-of-truth order

1. `00_master_reference/approved_lime_fiesta_board.png`
2. this `design.md`
3. approved logo and mascot packs
4. stage-specific README and manifest files

When two files differ, follow the higher item in this list.
