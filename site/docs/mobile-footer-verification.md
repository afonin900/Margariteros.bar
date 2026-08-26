# Responsive contact and footer verification

Checked on 2026-08-26 against the locally built SSR surface. The live https://qr.margariteros.bar/ was used read-only as the visual reference; the staging site was not changed. Captures are in .impeccable/review/mobile-footer-fix/repair/ and reference captures remain alongside them.

Each width was measured in a browser after loading the built SSR response. “No overlap” covers brand versus header controls, quick facts versus booking, and consent versus both gallery and footer. scrollWidth equals the viewport in every case. The control minimum includes all visible links, buttons and the language summary.

| Viewport | Stage | Scroll width | Header / booking overlap | Consent overlap | Min target | Footer after gallery | Footer height |
| --- | --- | ---: | --- | --- | ---: | --- | ---: |
| 320 × 844 | edge-to-edge | 320 | no / no | no | 44 px | yes | 716 px |
| 390 × 844 | edge-to-edge | 390 | no / no | no | 44 px | yes | 696 px |
| 597 × 844 | edge-to-edge | 597 | no / no | no | 44 px | yes | 552 px |
| 719 × 844 | edge-to-edge | 719 | no / no | no | 44 px | yes | 552 px |
| 720 × 1024 | centered | 720 | no / no | no | 44 px | yes | 536 px |
| 768 × 1024 | centered | 768 | no / no | no | 44 px | yes | 536 px |
| 1024 × 1024 | centered | 1024 | no / no | no | 44 px | yes | 440 px |
| 1280 × 1024 | centered | 1280 | no / no | no | 44 px | yes | 440 px |

The black content stage is edge-to-edge on phone widths through 719px; contacts and gallery keep their own internal spacing, and the next footer is already edge-to-edge. At 720px the centered container returns before the desktop columns become too wide: the available 672px stage is split into flexible quick facts plus a 176px booking action. Consent stays in document flow at every width, so it cannot cover the gallery or footer.

The prior 390px staging capture had a fixed 342 × 224px contact strip, 278px gallery, 1080px footer and a consent control over the gallery. The repaired local 390px surface has a 265px contact block, 342px gallery, 696px footer and a consent control after the footer.

The same geometry is a regression test: site/tests/layout-contract.test.ts starts the built local SSR server and a local Chrome CDP session through site/scripts/verify-responsive-ui.mjs. It measures the table widths without network access and fails on any overflow, overlap, undersized visible target or missing accessible footer action.
