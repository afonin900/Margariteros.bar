# Responsive contact and footer verification

Checked on 2026-08-26 against the locally built SSR surface. The live https://qr.margariteros.bar/ was used read-only as the visual reference; the staging site was not changed. Captures are in .impeccable/review/mobile-footer-fix/repair/ and reference captures remain alongside them.

Each width was measured in a browser after loading the built SSR response. “No overlap” covers brand versus header controls, quick facts versus booking, and consent versus both gallery and footer. scrollWidth equals the viewport in every case. The control minimum includes all visible links, buttons and the language summary.

| Viewport | Scroll width | Header / booking overlap | Consent overlap | Min target | Footer after gallery | Footer height |
| --- | ---: | --- | --- | ---: | --- | ---: |
| 320 × 844 | 320 | no / no | no | 44 px | yes | 716 px |
| 390 × 844 | 390 | no / no | no | 44 px | yes | 696 px |
| 597 × 844 | 597 | no / no | no | 44 px | yes | 552 px |
| 719 × 844 | 719 | no / no | no | 44 px | yes | 552 px |
| 720 × 1024 | 720 | no / no | no | 44 px | yes | 536 px |
| 768 × 1024 | 768 | no / no | no | 44 px | yes | 536 px |
| 1024 × 1024 | 1024 | no / no | no | 44 px | yes | 440 px |
| 1280 × 1024 | 1280 | no / no | no | 44 px | yes | 440 px |

The narrow 320px header has its own content-driven layout: a 36px logo and 90px wordmark fit beside three 44px controls without collision. At 720px the contact strip changes before the desktop columns become too wide: the available 672px stage is split into flexible quick facts plus a 176px booking action. Consent stays in document flow at every width, so it cannot cover the gallery or footer.

The prior 390px staging capture had a fixed 342 × 224px contact strip, 278px gallery, 1080px footer and a consent control over the gallery. The repaired local 390px surface has a 265px contact block, 342px gallery, 696px footer and a consent control after the footer.

The same geometry is a regression test: site/tests/layout-contract.test.ts starts the built local SSR server and a local Chrome CDP session through site/scripts/verify-responsive-ui.mjs. It measures the table widths without network access and fails on any overflow, overlap, undersized visible target or missing accessible footer action.
