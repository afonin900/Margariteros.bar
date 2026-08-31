# Desktop-resize vs true mobile

The first pass used only a desktop browser viewport override and is retained only as a comparison. It is not valid mobile evidence.

| CSS viewport | desktop-resize columns | true mobile columns | desktop item width | true mobile item width | true UA/touch |
|---:|---:|---:|---:|---:|---|
| 320 | 4 | 3 | 49 | 93.328125 | true / dpr 3 |
| 390 | 4 | 3 | 78.5 | 116.6640625 | true / dpr 3 |
| 597 | 4 | 3 | 130.25 | 185.6640625 | true / dpr 3 |
| 719 | 4 | 3 | 160.75 | 226.328125 | true / dpr 3 |
| 720 | 4 | 3 | 161 | 226.6640625 | true / dpr 3 |
| 768 | 4 | 3 | 173 | 242.6640625 | true / dpr 3 |
| 1024 | 4 | 3 | 237 | 328 | true / dpr 3 |
| 1280 | 4 | 3 | 301 | 413.328125 | true / dpr 3 |

True mobile was captured with Emulation.setDeviceMetricsOverride mobile=true, touch emulation, Android Chrome UA, UA metadata, deviceScaleFactor=3, and viewport meta readback. For 390 CSS px: inner/visual viewport 390, dpr 3, touch true; gallery has 3 columns of 116.664px items.

## Consequence

Do not use the earlier desktop-resize gallery result to implement phone layout. The official page true mobile branch is three columns; the desktop browser resized to 390px follows a different branch and is marked invalid for mobile claims.
