# Graph Report - Margariteros.bar  (2026-08-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 527 nodes · 694 edges · 42 communities (37 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `260f75b1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
- render.ts
- mirror.ts
- remotion/package.json
- page.ts
- dependencies
- sync.py
- capture-acceptance.mjs
- verify-responsive-ui.mjs
- scripts
- Root.tsx
- 02_mascot_pack/manifest.json
- assets
- compilerOptions
- build_templates.mjs
- capture-staging-consent.mjs
- capture-choiceqr-reference.mjs
- capture-mirror-runtime.mjs
- 06_textures_backgrounds/manifest.json
- margariteros_asset_pack_v2_canva/package.json
- send-instagram-handoff.ts
- quality_policy
- 08_video_social_templates_pack/manifest.json
- secret-scan.mjs
- html-posters/package.json
- check.ts
- verify-docker.mjs
- 04_decor_pack/manifest.json
- 05_pattern_pack/manifest.json
- app.js
- build-system.mjs
- ConsentStore
- production.test.ts
- site/tsconfig.json
- .mcp.json

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 12 edges
2. `assets` - 11 edges
3. `verifyResponsiveUi()` - 10 edges
4. `initializeAnalytics()` - 9 edges
5. `fetchMirroredHome()` - 9 edges
6. `officialRedirect()` - 9 edges
7. `mountConsentBanner()` - 8 edges
8. `scripts` - 8 edges
9. `scripts` - 8 edges
10. `Attribution` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ALL()` --calls--> `officialRedirect()`  [EXTRACTED]
  site/src/pages/[locale]/[...path].ts → site/src/lib/choiceqr/mirror.ts
- `ALL()` --calls--> `officialRedirect()`  [EXTRACTED]
  site/src/pages/[...path].ts → site/src/lib/choiceqr/mirror.ts
- `AnalyticsEvent` --references--> `Attribution`  [EXTRACTED]
  site/src/lib/analytics/index.ts → site/src/lib/analytics/attribution.ts
- `mountConsentBanner()` --calls--> `captureAttribution()`  [EXTRACTED]
  site/src/lib/analytics/browser.ts → site/src/lib/analytics/attribution.ts
- `decorateTrackedLinks()` --calls--> `decorateOutbound()`  [EXTRACTED]
  site/src/lib/analytics/browser.ts → site/src/lib/analytics/attribution.ts

## Import Cycles
- None detected.

## Communities (42 total, 5 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.06
Nodes (44): bookingUrl, menuUrl, Attribution, AttributionKey, attributionKeys, captureAttribution(), decorateOutbound(), BrowserAnalyticsOptions (+36 more)

### Community 1 - "render.ts"
Cohesion: 0.06
Nodes (23): artist, chrome, CHROME_CANDIDATES, chromeArgs, chromeProcess, dataPath, dates, FORBIDDEN (+15 more)

### Community 2 - "mirror.ts"
Cohesion: 0.14
Nodes (24): API_QUERY, ATTRIBUTION, deviceHeaders(), fetchMirroredHome(), LOCALES, mirrorHeaders, officialRedirect(), PUBLIC_HOSTS (+16 more)

### Community 3 - "remotion/package.json"
Cohesion: 0.07
Nodes (27): description, devDependencies, eslint, prettier, @remotion/eslint-config-flat, @types/react, @types/web, license (+19 more)

### Community 4 - "page.ts"
Cohesion: 0.13
Nodes (13): GalleryItem, getPage(), Locale, locales, LocalizedPage, OpeningHour, PageContent, pages (+5 more)

### Community 5 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, react, react-dom, remotion, @remotion/cli, @remotion/tailwind-v4, tailwindcss, react (+5 more)

### Community 6 - "sync.py"
Cohesion: 0.18
Nodes (18): audit(), close_passed(), cmdline(), fail(), free_port(), http_ok(), is_ours(), main() (+10 more)

### Community 7 - "capture-acceptance.mjs"
Cohesion: 0.19
Nodes (14): acceptVisibleConsent(), Cdp, configure(), desktopCases, evaluate(), freePort(), mobileCases, navigate() (+6 more)

### Community 8 - "verify-responsive-ui.mjs"
Cohesion: 0.18
Nodes (13): Cdp, entrypoint, freePort(), measurementExpression(), siteRoot, stop(), verifyResponsiveUi(), viewportCases (+5 more)

### Community 9 - "scripts"
Cohesion: 0.07
Nodes (27): astro, @astrojs/check, @astrojs/node, typescript, dependencies, astro, @astrojs/node, devDependencies (+19 more)

### Community 10 - "Root.tsx"
Cohesion: 0.21
Nodes (10): FridayKikeReel(), FridayKikeReelProps, GoogleBusinessKikeVideo(), JoylandGbpPoster(), JoylandReel(), palette, defaultProps, RemotionRoot() (+2 more)

### Community 11 - "02_mascot_pack/manifest.json"
Cohesion: 0.12
Nodes (16): assets, palette, black, cream, lime, orange, project, sheets (+8 more)

### Community 12 - "assets"
Cohesion: 0.12
Nodes (16): assets, canvas, format, name, stage, status, lf_icon_agave.png, lf_icon_cactus.png (+8 more)

### Community 13 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module, moduleResolution, noEmit (+7 more)

### Community 14 - "build_templates.mjs"
Cohesion: 0.24
Nodes (14): addFooter(), addLogo(), addPhotoPlaceholder(), C, carousel(), carouselBase(), here, logo (+6 more)

### Community 15 - "capture-staging-consent.mjs"
Cohesion: 0.23
Nodes (9): Cdp, configure(), evaluate(), freePort(), navigate(), output, screenshot(), sleep() (+1 more)

### Community 16 - "capture-choiceqr-reference.mjs"
Cohesion: 0.15
Nodes (9): cases, Cdp, entry, output, port(), root, server, until() (+1 more)

### Community 17 - "capture-mirror-runtime.mjs"
Cohesion: 0.20
Nodes (8): Cdp, configure(), evaluate(), freePort(), output, screenshot(), sleep(), until()

### Community 18 - "06_textures_backgrounds/manifest.json"
Cohesion: 0.15
Nodes (12): files, generated_at, master_resolution, package, palette, black, cream, green (+4 more)

### Community 19 - "margariteros_asset_pack_v2_canva/package.json"
Cohesion: 0.17
Nodes (11): dependencies, pptxgenjs, name, overrides, image-size, private, scripts, build (+3 more)

### Community 20 - "send-instagram-handoff.ts"
Cohesion: 0.18
Nodes (9): args, briefPath, chatId, eventDir, form, handoffPath, token, video (+1 more)

### Community 21 - "quality_policy"
Cohesion: 0.18
Nodes (10): files, package, quality_policy, background_method, decorative_assets, digital_metadata, print_metadata, source_asset_upscaling (+2 more)

### Community 22 - "08_video_social_templates_pack/manifest.json"
Cohesion: 0.18
Nodes (10): files, package, production_files, quality_policy, background_method, color_space, raster_resampling, source_upscaling (+2 more)

### Community 23 - "secret-scan.mjs"
Cohesion: 0.24
Nodes (9): collectFiles(), ignoredDirectories, ignoredFiles, patterns, repositoryRoot, resolveActiveAutopilotRoot(), scanForKnownSecrets(), siteRoot (+1 more)

### Community 24 - "html-posters/package.json"
Cohesion: 0.29
Nodes (6): name, private, scripts, render, render:kike, type

### Community 25 - "check.ts"
Cohesion: 0.40
Nodes (3): base, key, repoRoot

### Community 26 - "verify-docker.mjs"
Cohesion: 0.60
Nodes (4): docker(), execFile, siteRoot, waitForHealthy()

### Community 27 - "04_decor_pack/manifest.json"
Cohesion: 0.50
Nodes (3): assets, notes, title

### Community 28 - "05_pattern_pack/manifest.json"
Cohesion: 0.50
Nodes (3): assets, notes, title

### Community 32 - "production.test.ts"
Cohesion: 0.67
Nodes (3): freePort(), processes, startProductionServer()

## Knowledge Gaps
- **235 isolated node(s):** `AttributionKey`, `BrowserAnalyticsOptions`, `Locale`, `Window`, `AnalyticsDestination` (+230 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `remotion/package.json` to `scripts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `typescript` connect `scripts` to `remotion/package.json`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `AttributionKey`, `BrowserAnalyticsOptions`, `Locale` to the rest of the system?**
  _235 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `browser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06201923076923077 - nodes in this community are weakly interconnected._
- **Should `render.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `mirror.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13763440860215054 - nodes in this community are weakly interconnected._
- **Should `remotion/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._