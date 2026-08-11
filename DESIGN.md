---
version: alpha
name: Margariteros Lime Fiesta
description: Real bar photography framed by a compact, repeatable fiesta rhythm.
colors:
  primary: "#C6FF00"
  ink: "#0B0B0B"
  cream: "#FFF5E1"
  orange: "#FF5A2E"
  muted: "#CBD2B4"
typography:
  display:
    fontFamily: "Barlow Condensed"
    fontSize: "6rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "italic"
  facts:
    fontFamily: "Montserrat"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.02em"
  label:
    fontFamily: "Montserrat"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  control: "8px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
components:
  marker-lime:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "8px 24px"
  marker-orange:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    typography: "{typography.facts}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  cta-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.facts}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  footer-label:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 0px"
  helper-text:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 0px"
---

# Design System: Margariteros Lime Fiesta

## Overview

**Creative North Star: "The Real Bar, Marked for Fiesta"**

Margariteros is not a generic Mexican-party poster. Real photographs and video from the Warsaw bar carry the emotion; the visual system marks confirmed information with a compact, tactile Lime Fiesta rhythm. The system must remain readable at feed-thumbnail size and reproducible by a non-designer in Canva.

Brand character comes from a fixed information grammar—condensed headline, date/time block, marker caption and compact footer—not from covering every surface with themed decoration.

**Key Characteristics:**
- real photography first;
- one dominant message per surface;
- acidic lime used as a recognisable signal;
- orange reserved for date, urgency or CTA;
- tactile texture without sacrificing legibility;
- modern, natural Polish copy.

## Colors

The palette is deliberately small: near-black and warm cream provide the working surface, lime carries recognition, and orange communicates urgency.

- **Ink:** primary dark surface and text on bright accents.
- **Warm Cream:** primary light text and paper surface.
- **Acid Lime:** signature brand marker and primary action.
- **Fiesta Orange:** date, urgency, price or secondary action—never a second dominant color.
- **Muted Herb:** secondary text on dark operational surfaces.

**The One Accent Rule.** A composition may have lime as its dominant accent or orange as a campaign field; it must not make both compete at equal weight.

**The Contrast Rule.** Use lime/ink, cream/ink, ink/lime or ink/cream. Orange on lime is prohibited for text.

## Typography

**Display Font:** Barlow Condensed Black Italic, weight 900.
**Facts and Labels:** Montserrat, weights 700–900.

Both families include the full Polish set: `ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż`. Canva's built-in families are preferred; repository font files are the licensed fallback.

### Hierarchy
- **Display:** uppercase, 1–3 short lines, maximum 24 characters per line, no automatic ultra-small fallback.
- **Facts:** date, time, location, price and CTA; keep related facts together.
- **Label:** compact uppercase metadata and footer; never the only carrier of critical information.

**The Two-Family Rule.** No Bangers, Archivo Black, Arial Black or Nunito in new production materials.

**The Polish Proof Rule.** Every master template is accepted only after the full glyph string renders correctly after Canva import.

## Layout

Feed and carousel masters use 1080×1350. Story and Reel masters use 1080×1920. Critical Story/Reel content stays at least 90 px from side edges, 250 px from the top and 320 px from the bottom. Reel-cover critical content also stays inside the central 1080×1350 crop.

A standard promotional material contains one hero image/video, one headline, one facts block and one CTA. The 65/20/10/5 ratio is explanatory, not a pixel quota; hierarchy is validated by a two-second mobile scan.

Long names must be rewritten or intentionally broken before type is reduced below readable size. Date and time always remain adjacent.

## Elevation & Depth

The system is flat by default. Depth comes from photography, vignette and tactile raster texture—not generic card shadows. Grain overlays are used at low opacity only when they do not reduce text contrast.

## Shapes

Most brand geometry is rectangular and crop-based. Marker edges may remain irregular, but their caps are never stretched. Rounded corners are reserved for operational controls, not poster decoration.

## Components

### Photo Hero
Use an approved real photo or video. Preserve recognisable people and products; avoid placing text over faces. Add a dark overlay or holding field when the image is busy.

### Marker
Default production component is `marker-crop-master.png`: resize by crop, never by stretch. The advanced three-piece marker uses fixed left/right caps and a stretchable center only.

### Date / Time Block
Montserrat ExtraBold or Black, kept as one visual unit. Orange on ink or ink on orange are preferred.

### CTA
One short action in Polish: for example `REZERWUJ STOLIK`, `SPRAWDŹ MENU`, or `NAPISZ DO NAS`. Do not show a CTA when the destination is unknown.

### Logo
Use the clean approved logo, keep its aspect ratio, and preserve clear space of at least 12% of its diameter. A small readable logo is better than a large competing logo.

### Papel Picado and Mascot
Papel picado is a campaign accent, not a permanent header. Mascot appears no more than once in four materials and only with one glass stem/base and no human legs.

## Do's and Don'ts

### Do:
- **Do** start from confirmed facts and an approved real photo/video.
- **Do** verify the Polish glyph string after every Canva import.
- **Do** use one message and one CTA per material.
- **Do** check at feed-thumbnail size and in Story/Reel safe zones.
- **Do** save final masters as Canva Brand Templates after import verification.

### Don't:
- **Don't** invent DJ, date, time, price, offer, availability, dish, guest or event.
- **Don't** publish `MISSING`, `DD.MM`, `GG:MM` or other placeholders.
- **Don't** use Bangers, Archivo Black, Arial Black or Nunito in new production.
- **Don't** stretch logos, mascot, papel picado, raster textures or marker caps.
- **Don't** use orange text on lime or thin text over photography.
- **Don't** use a Mexican-themed symbol when it does not frame or explain the message.
