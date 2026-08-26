# ChoiceQR overlay evidence

Measured on 2026-08-26 by overlaying same-size live-reference and production SSR captures. The overlays are `../../.impeccable/review/overlay-desktop.png` and `../../.impeccable/review/overlay-mobile.png`; source captures use `reference-*.png` and production captures use `desktop.png` / `mobile.png` at the same dimensions.

| Viewport and boundary | Reference px | Production SSR px | Delta |
|---|---:|---:|---:|
| 1744×1032 stage x / y / width | 256 / 144 / 1232 | 256 / 144 / 1232 | 0 / 0 / 0 |
| 1744×1032 contact height | 128 | 128 | 0 |
| 1744×1032 gallery x / y / width | 288 / 372 / 1168 | 288 / 372 / 1168 | 0 / 0 / 0 |
| 390×844 stage x / y / width | 24 / 120 / 342 | 24 / 120 / 342 | 0 / 0 / 0 |
| 390×844 contact height | 224 | 224 | 0 |
| 390×844 gallery x / y / width | 56 / 444 / 278 | 56 / 444 / 278 | 0 / 0 / 0 |

All key deltas are within the required 4 px. Production server captures had no `astro-dev-toolbar`; changed safe media is compared by crop and grid density, not photo pixels.
