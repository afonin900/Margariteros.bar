# ChoiceQR visual inventory

Captured from the live reference on 2026-08-26 at 1744×1032 and 390×844.

## Tokens and geometry

| Role | Value |
|---|---|
| Background fallback | `#9dd600` |
| Interactive accent | `#ace01e` (live computed value) |
| Main surface | `#000000` |
| Footer secondary field | `#161d02` |
| Typeface | Hind Siliguri, locally hosted variable file, weights 400–700 |
| Desktop stage | 1232 px, 16 px radius, y=144 |
| Desktop contact | 128 px high, 28 px padding |
| Desktop gallery | 1168 px, 4×289 px columns, 4 px gap |
| Mobile stage | viewport minus 48 px, 24 px side fields |
| Mobile contact | 224 px high, 28 px padding |
| Mobile gallery | 278 px, 4×66.5 px columns, 4 px gap |
| Breakpoints | mobile ≤719 px; tablet 720–1023 px; desktop ≥1024 px |
| Control floor | 44×44 px; visible 3 px focus ring |

## Components

- `ChoiceQrHeader.astro`: brand, language routes, menu, booking, primary navigation.
- `ContactBar.astro`: address, telephone and booking fallback.
- `PhotoGallery.astro`: 4×5 responsive picture grid with AVIF/WebP sources.
- `SiteFooter.astro`: contact, verified opening hours, social links, map and route fallback.

## Media provenance

All shipping photos were downloaded once from the venue's ChoiceQR-owned `prod-eat-margariteroswwa` media space, visually reviewed, cropped to square without generative changes, stripped of embedded metadata, and stored locally. The page has no runtime dependency on the ChoiceQR CDN.

| Local family | Origin |
|---|---|
| `dance-floor-*` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/template-gallery/thumbnail_G-Q-I.webp` |
| `live-music-*` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/template-gallery/thumbnail_X-H-i.webp` |
| `interior-wall-*` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/template-gallery/thumbnail_o-b-l.webp` |
| `interior-seating-*` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/template-gallery/thumbnail_E-m-n.webp` |
| `food-tacos-wall-*` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/template-gallery/thumbnail_f-x-f.webp` |
| `terrace-*` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/template-gallery/thumbnail_NDYrCKR-MjOSUIr-KUcbFiC_X-X-y.webp` |
| `lime-background.webp` | `https://cdn-media.choiceqr.com/prod-eat-margariteroswwa/background-image/tkWNEbA-WeAQsJh-YsAUzqH.webp` |
| `logo.png` | `brandbook-margariteros/visuals/logo-primary-current.png` |
| `hind-siliguri-latin.woff2` | `https://fonts.gstatic.com/s/hindsiliguri/v14/ijwTs5juQtsyLLR5jN4cxBEoTJLax8s3JimW3w.woff2` |

The remaining live-reference media was excluded from the shipping set during the visual safety review.

## Link readback

The live ChoiceQR page was read back on 2026-08-26: its visible TikTok link resolves to `https://www.tiktok.com/@margariteros.bar?_t=ZN-8xnyI1pprok&_r=1`. The first-party site intentionally keeps the canonical public profile URL without transient tracking parameters.
