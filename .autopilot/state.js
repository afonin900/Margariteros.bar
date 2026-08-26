window.STATE =
{
  "slug": "first-party-astro-home",
  "dir": "2026-08-26-first-party-astro-home",
  "title": "Главная Margariteros для рекламы, бронирований и честной аналитики",
  "mode": "semi",
  "depth": "normal",
  "polish": null,
  "tier": "T2",
  "briefFile": "2026-08-26-brief.md",
  "memoryFile": "AGENTS.md",
  "skillDir": "/Users/afonin900/.codex/plugins/cache/personal/corp/0.5.0+codex.20260826115813/skills/autopilot",
  "startedAt": "2026-08-26T18:01:24+02:00",
  "updatedAt": "2026-08-26T23:32:00+02:00",
  "finishedAt": "2026-08-26T23:32:00+02:00",
  "stages": [
    { "id": "preflight", "status": "done", "startedAt": "2026-08-26T18:01:24+02:00", "finishedAt": "2026-08-26T18:12:00+02:00" },
    { "id": "manifest", "status": "done", "startedAt": "2026-08-26T18:12:00+02:00", "finishedAt": "2026-08-26T18:17:00+02:00" },
    { "id": "briefing", "status": "done", "startedAt": "2026-08-26T18:17:00+02:00", "finishedAt": "2026-08-26T18:29:00+02:00" },
    { "id": "spec", "status": "done", "startedAt": "2026-08-26T18:29:00+02:00", "finishedAt": "2026-08-26T19:01:00+02:00" },
    { "id": "plan", "status": "done", "startedAt": "2026-08-26T19:01:00+02:00", "finishedAt": "2026-08-26T19:17:00+02:00", "note": "5 тасков, ярус T2" },
    { "id": "build", "status": "done", "startedAt": "2026-08-26T19:17:00+02:00", "finishedAt": "2026-08-26T23:19:00+02:00", "note": "5 из 5 тасков готовы" },
    { "id": "review", "status": "done", "startedAt": "2026-08-26T19:36:00+02:00", "finishedAt": "2026-08-26T23:23:00+02:00", "note": "независимые проверки пройдены" },
    { "id": "final", "status": "done", "startedAt": "2026-08-26T23:23:00+02:00", "finishedAt": "2026-08-26T23:32:00+02:00" }
  ],
  "requirements": {
    "total": 36, "done": 30, "inTicket": 0, "inSpec": 0,
    "placeholder": 1, "deferred": 5, "dropped": 0
  },
  "tickets": [
    { "id": "01", "title": "Astro SSR-основа и четыре языка", "requirements": ["R01", "R02", "R03", "R07", "R14", "R22", "G01", "G02", "A01"], "blockedBy": [], "wave": 1, "zone": ["site/", "root build config"], "status": "done", "startedAt": "2026-08-26T19:22:00+02:00", "finishedAt": "2026-08-26T20:31:00+02:00", "retries": 0, "repairs": 1, "repairFindings": ["Публичные утверждения о кухне, танцах и событиях не подтверждены source brief"], "handoffs": 0, "files": ["site/package.json", "site/astro.config.mjs", "site/tsconfig.json", "site/src/content/page.ts", "site/src/layouts/BaseLayout.astro", "site/src/pages/index.astro", "site/src/pages/[locale]/index.astro", "site/tests/page.test.ts"], "tests": { "passed": 1, "failed": 0 }, "commit": "b427e38", "concerns": ["SSR HTTP-швы пока не покрыты отдельными assertions"] },
    { "id": "02", "title": "Точная food-safe копия ChoiceQR", "requirements": ["R04", "R05", "R06", "R08", "R09", "R20", "R21", "R24", "R25", "R26", "R27", "R28", "R29", "R32i"], "blockedBy": ["01"], "wave": 2, "zone": ["site/src/components/", "site/src/styles/", "site/public/"], "status": "done", "startedAt": "2026-08-26T20:31:00+02:00", "finishedAt": "2026-08-26T22:07:00+02:00", "retries": 0, "repairs": 1, "repairFindings": ["R06 требует measured overlay evidence ≤4 px", "mobile header перекрывает brand", "booking CTA обрезан", "food-tacos-tray содержит рюмки", "final captures содержат Astro dev toolbar"], "handoffs": 1, "files": ["site/src/components/", "site/src/styles/choiceqr.css", "site/src/content/page.ts", "site/public/media/", "site/public/fonts/", "site/docs/choiceqr-visual-inventory.md", ".impeccable/review/"], "tests": { "passed": 5, "failed": 0 }, "commit": "e9e4d11", "concerns": ["SSR UI/accessibility швы переданы T04"] },
    { "id": "03", "title": "Consent, атрибуция и честные события", "requirements": ["R10", "R15", "R16", "R17", "R18", "R19", "R30i", "R31i"], "blockedBy": ["02"], "wave": 3, "zone": ["site/src/lib/consent/", "site/src/lib/analytics/", "site/src/components/Consent*"], "status": "done", "startedAt": "2026-08-26T22:07:00+02:00", "finishedAt": "2026-08-26T22:45:00+02:00", "retries": 0, "repairs": 1, "repairFindings": ["contact_click отправляет phone PII", "nested attribution может обходить PII validation", "Reject отправляет analytics event вместо only consent update"], "handoffs": 0, "files": ["site/src/lib/consent/", "site/src/lib/analytics/", "site/src/components/ConsentBanner.astro", "site/tests/privacy.test.ts", "site/.env.example"], "tests": { "passed": 12, "failed": 0 }, "commit": "61a864d", "concerns": [] },
    { "id": "04", "title": "Production-пакет и полная проверка", "requirements": ["R23", "R31i", "R06"], "blockedBy": ["03"], "wave": 4, "zone": ["site/Dockerfile", "site/tests/", "site/docs/", "CI/build scripts"], "status": "done", "startedAt": "2026-08-26T22:47:00+02:00", "finishedAt": "2026-08-26T23:05:00+02:00", "retries": 0, "repairs": 3, "repairFindings": ["release gate lacked reproducible Docker verification", "base image used mutable tag", "accessibility assertions and secret-scan wording needed precision", "secret scan hardcoded temporary --wip run path and broke after landing rename"], "handoffs": 0, "files": ["site/Dockerfile", "site/.dockerignore", "site/src/pages/healthz.ts", "site/tests/production.test.ts", "site/tests/secret-scan.test.ts", "site/scripts/", "site/docs/dokploy-runbook.md", "site/docs/quality-verification.md"], "tests": { "passed": 15, "failed": 0 }, "concerns": [] },
    { "id": "05", "title": "Тестовый запуск на new.margariteros.bar", "requirements": ["R23", "R25", "G04"], "blockedBy": ["04"], "wave": 5, "zone": ["Dokploy", "DNS/Cloudflare"], "status": "done", "startedAt": "2026-08-26T23:08:00+02:00", "finishedAt": "2026-08-26T23:19:00+02:00", "retries": 0, "repairs": 0, "handoffs": 0, "files": [], "tests": { "passed": 5, "failed": 0 }, "deployment": { "url": "https://new.margariteros.bar", "source": "codex/staging-margariteros-site@00c08c6fbbd0", "autoDeploy": false, "health": "healthy" }, "concerns": ["staging canonical указывает на будущий основной домен"] }
  ],
  "singlePass": null,
  "tests": { "passed": 15, "failed": 0 },
  "debt": { "placeholders": [], "assumptions": [], "emptyEnv": [] },
  "additions": [
    { "at": "2026-08-26T18:12:00+02:00", "text": "PL, EN, RU обязательны; ES поддерживаемый маршрут" },
    { "at": "2026-08-26T18:12:00+02:00", "text": "Использовать более дешёвые модели для ограниченных подзадач, Sol только там, где оправдан риск" }
    ,{ "at": "2026-08-26T19:31:00+02:00", "text": "Разрешён тестовый deploy на new.margariteros.bar; основной домен не переключать" }
  ],
  "coverage": {
    "reviewer": "spec_coverage",
    "findings": 8,
    "resolved": [
      "Latin vibe формализован",
      "pixel-match получил overlay критерий",
      "asset extraction получил inventory deliverable",
      "известные GTM IDs и доказательные границы зафиксированы",
      "ChoiceQR cookie contradiction превращён в видимый unsupported bridge",
      "Dokploy deploy включён как terminal approval-gated таск",
      "shared-domain consent cookie включена для qr.margariteros.bar",
      "ChoiceQR consumption остаётся placeholder до vendor proof"
    ]
  },
  "concerns": [
    "REPORT: ChoiceQR ещё не доказал применение margariteros_consent_v1; bridge остаётся unsupported",
    "DROP resolved: live Dokploy readback и staging deploy завершены",
    "DROP resolved: SSR HTTP/accessibility швы покрыты production regression suite"
  ],
  "reviewers": { "manifestSpec": "manifest_spec_reviewer", "craft": "craft_reviewer" },
  "blind": {
    "verdict": "accepted_with_open_items",
    "agreed": ["Astro SSR staging", "ChoiceQR-like food-safe home", "menu and booking links", "PL/EN/RU/ES", "test Dokploy deploy"],
    "drift": [
      "R15/R16/R19: manifest считал conversion/GTM слой готовым, blind acceptance подтвердил только client-side seam; live GTM/server transport не опубликованы",
      "R03/R25: основной домен и рекламный cutover не выполнены; переведены в deferred по явной staging-границе"
    ],
    "expectedPlaceholder": ["R18: ChoiceQR consent bridge остаётся unsupported до vendor contract"],
    "commands": ["npm --prefix site run verify:release", "npm --prefix site run verify:docker"],
    "result": "15 tests passed; Docker non-root/health passed; staging health and four locales 200"
  }
}
