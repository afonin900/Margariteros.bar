# Live QR evidence

Source: https://qr.margariteros.bar/
Captured: 2026-08-26T21:27:51.584Z

## Gallery column proof

| viewport CSS px | gallery item count | columns in first row | rows | first-row item rects |
|---:|---:|---:|---:|---|
| 320 | 20 | 4 | 5 | x=56, y=444, w=49, h=49; x=109, y=444, w=49, h=49; x=162, y=444, w=49, h=49; x=215, y=444, w=49, h=49 |
| 390 | 20 | 4 | 5 | x=32, y=1413.5, w=78.5, h=78.5; x=114.5, y=1413.5, w=78.5, h=78.5; x=197, y=1413.5, w=78.5, h=78.5; x=279.5, y=1413.5, w=78.5, h=78.5 |
| 597 | 20 | 4 | 5 | x=32, y=1381.5, w=130.25, h=130.25; x=166.25, y=1381.5, w=130.25, h=130.25; x=300.5, y=1381.5, w=130.25, h=130.25; x=434.75, y=1381.5, w=130.25, h=130.25 |
| 719 | 20 | 4 | 5 | x=32, y=1381.5, w=160.75, h=160.75; x=196.75, y=1381.5, w=160.75, h=160.75; x=361.5, y=1381.5, w=160.75, h=160.75; x=526.25, y=1381.5, w=160.75, h=160.75 |
| 720 | 20 | 4 | 5 | x=32, y=1381.5, w=161, h=161; x=197, y=1381.5, w=161, h=161; x=362, y=1381.5, w=161, h=161; x=527, y=1381.5, w=161, h=161 |
| 768 | 20 | 4 | 5 | x=32, y=1405.5, w=173, h=173; x=209, y=1405.5, w=173, h=173; x=386, y=1405.5, w=173, h=173; x=563, y=1405.5, w=173, h=173 |
| 1024 | 20 | 4 | 5 | x=32, y=1405.5, w=237, h=237; x=273, y=1405.5, w=237, h=237; x=514, y=1405.5, w=237, h=237; x=755, y=1405.5, w=237, h=237 |
| 1280 | 20 | 4 | 5 | x=32, y=1405.5, w=301, h=301; x=337, y=1405.5, w=301, h=301; x=642, y=1405.5, w=301, h=301; x=947, y=1405.5, w=301, h=301 |

The observed live page uses four gallery columns at every requested viewport, including 320 and 390 CSS px. This is derived from DOMRects of .styles_photoGalleryListItem__1Nm1z, not from screenshot appearance.

## Relevant class selectors

.styles_photoGalleryListItem__1Nm1z is the repeated gallery item; .styles_photoGalleryList__iT_m3 is its list; .styles_photoGallery__iJl68 is the gallery container; .styles_FooterWrapper__Ji6dI is the footer wrapper; .styles_FooterContent__x9t8y is footer content.


## Evidence status

Earlier desktop-resize computed styles and viewport screenshots were captured with desktop browser resize only; use them for desktop-resize comparison, not mobile acceptance. Authoritative phone evidence is true-mobile-computed-styles.json and screenshots/true-mobile-*.png.
