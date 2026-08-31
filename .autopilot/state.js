window.STATE =
{
  "slug": "margariteros-club-pilot",
  "dir": "2026-08-28-margariteros-club-pilot--wip",
  "title": "Пилот партнёрской системы Margariteros Club",
  "mode": "semi",
  "depth": "deep",
  "polish": null,
  "tier": "T2",
  "briefFile": "2026-08-28-brief.md",
  "memoryFile": "AGENTS.md",
  "skillDir": "/Users/afonin900/.codex/plugins/cache/personal/corp/0.5.0+codex.20260826115813/skills/autopilot",
  "startedAt": "2026-08-28T12:14:46+02:00",
  "updatedAt": "2026-08-31T23:00:00+02:00",
  "finishedAt": null,
  "stages": [
    {
      "id": "preflight",
      "status": "done",
      "startedAt": "2026-08-28T12:14:46+02:00",
      "finishedAt": "2026-08-28T12:20:00+02:00"
    },
    {
      "id": "manifest",
      "status": "done",
      "startedAt": "2026-08-28T12:20:00+02:00",
      "finishedAt": "2026-08-28T12:35:00+02:00"
    },
    {
      "id": "briefing",
      "status": "done",
      "startedAt": "2026-08-28T12:35:00+02:00",
      "finishedAt": "2026-08-28T13:22:00+02:00",
      "note": "самобрифинг по истории, live и официальному API"
    },
    {
      "id": "spec",
      "status": "done",
      "startedAt": "2026-08-28T13:22:00+02:00",
      "finishedAt": "2026-08-28T13:47:00+02:00"
    },
    {
      "id": "plan",
      "status": "done",
      "startedAt": "2026-08-28T13:47:00+02:00",
      "finishedAt": "2026-08-28T13:55:00+02:00",
      "note": "план исправлен: 7 тасков, RefRef → Syrve"
    },
    {
      "id": "build",
      "status": "done",
      "startedAt": "2026-08-28T13:55:00+02:00",
      "finishedAt": "2026-08-28T19:35:00+02:00",
      "note": "RefRef, адаптер, web/Mini App и Dokploy staging собраны; физический POS POC вынесен в ticket 07"
    },
    {
      "id": "review",
      "status": "done",
      "startedAt": "2026-08-28T14:14:00+02:00",
      "finishedAt": "2026-08-28T19:35:00+02:00",
      "note": "staging принят по HTTPS и /api/ready; это не доказательство скидки, награды или закрытого чека"
    },
    {
      "id": "final",
      "status": "pending",
      "note": "ожидается ticket 07: один paid+closed POS-чек, 10% гостю, 5 PLN партнёру, повторное чтение без дубля"
    }
  ],
  "requirements": {
    "total": 42,
    "done": 15,
    "inTicket": 21,
    "inSpec": 0,
    "placeholder": 1,
    "deferred": 4,
    "dropped": 1
  },
  "tickets": [
    {
      "id": "01",
      "title": "Доказанная карта Loyalty и контракт пилота",
      "requirements": [
        "R01",
        "R02",
        "R03",
        "R04",
        "R11",
        "R23",
        "R26",
        "R28",
        "R29",
        "R30",
        "R31",
        "G01"
      ],
      "blockedBy": [],
      "wave": 1,
      "zone": [
        "run/evidence/",
        "docs/club/"
      ],
      "status": "done",
      "startedAt": "2026-08-28T14:07:00+02:00",
      "finishedAt": "2026-08-28T14:48:00+02:00",
      "retries": 0,
      "repairs": 1,
      "repairFindings": [
        "evidence pack обнулил уже полученный live-readback и не дал официальные paths"
      ],
      "handoffs": 0,
      "files": [
        ".autopilot/2026-08-28-margariteros-club-pilot--wip/evidence/01-evidence-pack.md",
        "docs/club/README.md"
      ],
      "tests": {
        "passed": 23,
        "failed": 0
      },
      "commit": "72495a5",
      "concerns": []
    },
    {
      "id": "02",
      "title": "Отменённый самописный Club prototype",
      "requirements": [
        "R09",
        "R12",
        "R14",
        "R15",
        "R17",
        "R18",
        "R19",
        "R20",
        "R24",
        "R32i",
        "R33i",
        "R34i",
        "D01"
      ],
      "blockedBy": [
        "01"
      ],
      "wave": 2,
      "zone": [
        "site/src/lib/club/",
        "site/tests/club/"
      ],
      "status": "failed",
      "startedAt": "2026-08-28T14:48:00+02:00",
      "finishedAt": "2026-08-28T15:18:00+02:00",
      "retries": 0,
      "repairs": 2,
      "repairFindings": [
        "параллельные одинаковые check events могут создать две ledger entries",
        "referral surface требует read-only lookup кандидата по referral code"
      ],
      "handoffs": 0,
      "files": [
        "site/src/lib/club/club-domain.ts",
        "site/src/lib/club/syrve-adapter.ts",
        "site/src/lib/club/index.ts",
        "site/tests/club/club-domain.test.ts"
      ],
      "tests": {
        "passed": 28,
        "failed": 0
      },
      "commit": "29c171e",
      "concerns": [
        "process-local idempotency; multi-instance needs durable transaction store",
        "public referral lookup test does not cover rejected status",
        "владелец подтвердил обязательный RefRef; prototype удаляется ticket 03"
      ]
    },
    {
      "id": "03",
      "title": "Перейти с самописного Club на официальный RefRef",
      "requirements": [
        "R06",
        "R08",
        "R09",
        "R24",
        "D02"
      ],
      "blockedBy": [
        "01"
      ],
      "wave": 3,
      "zone": [
        "site custom Club paths",
        "/Users/afonin900/Github/refref/"
      ],
      "status": "done",
      "startedAt": "2026-08-28T16:05:00+02:00",
      "finishedAt": "2026-08-28T16:45:00+02:00",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "files": [
        "docs/club/README.md",
        "/Users/afonin900/Github/refref/docs/margariteros-bootstrap.md"
      ],
      "tests": {
        "passed": 81,
        "failed": 0
      },
      "commit": "b3dc7b7",
      "externalCommit": "4811c07",
      "concerns": [
        "RefRef alpha/AGPL",
        "full PostgreSQL/dev/E2E deferred to ticket 06",
        "upstream /r payload needs privacy-safe seam"
      ]
    },
    {
      "id": "04",
      "title": "Подключить RefRef к штатному Syrve Loyalty",
      "requirements": [
        "R04",
        "R11",
        "R14",
        "R15",
        "R16",
        "R17",
        "R18",
        "R19",
        "R25",
        "R26",
        "R32i",
        "R33i",
        "R34i"
      ],
      "blockedBy": [
        "03"
      ],
      "wave": 4,
      "zone": [
        "refref/apps/api/",
        "refref/packages/"
      ],
      "status": "done",
      "startedAt": "2026-08-28T16:45:00+02:00",
      "finishedAt": "2026-08-28T17:25:00+02:00",
      "retries": 0,
      "repairs": 1,
      "repairFindings": [
        "timeout reconciliation не перепроверял paid+closed; RefRef internal reward engine продолжал работать рядом с syrve_native"
      ],
      "handoffs": 0,
      "files": [
        "apps/api/src/services/syrve-native*.ts",
        "packages/coredb/src/schema.ts",
        "packages/coredb/drizzle/0003_syrve_native_delivery.sql",
        "apps/api/test/unit/syrve-native.test.ts"
      ],
      "tests": {
        "passed": 65,
        "failed": 0
      },
      "commit": "bfbcc16",
      "concerns": [
        "ordinary RefRef dispatch log lacks safe correlation id",
        "concurrent loser result assertion is incomplete",
        "Drizzle 0003 snapshot metadata missing"
      ]
    },
    {
      "id": "05",
      "title": "R Club для Telegram и обычного польского веба",
      "requirements": [
        "R07",
        "R12",
        "R13",
        "R20",
        "R21",
        "R24",
        "R33i",
        "R36",
        "R37",
        "R38"
      ],
      "blockedBy": [
        "03",
        "04"
      ],
      "wave": 5,
      "zone": [
        "refref/apps/refer/",
        "refref/apps/webapp/",
        "site/src/"
      ],
      "status": "done",
      "startedAt": "2026-08-28T17:25:00+02:00",
      "retries": 0,
      "repairs": 2,
      "repairFindings": [
        "R Club navigation увеличила SSR page height на 80px и сломала layout contract",
        "Mini App route/status расходились, replay initData не предотвращался"
      ],
      "handoffs": 0,
      "finishedAt": "2026-08-28T18:10:00+02:00",
      "files": [
        "apps/refer/src/routes/r.ts",
        "apps/webapp/src/app/club/",
        "apps/webapp/src/app/api/club/",
        "site/src/pages/[locale]/club/index.astro"
      ],
      "tests": {
        "passed": 58,
        "failed": 0
      },
      "commit": "53234a6",
      "externalCommit": "3080135",
      "concerns": [
        "participant/refcode creation awaits product/program and durable identity mapping",
        "durable replay store awaits staging DB",
        "homepage navigation entry deferred to avoid layout regression"
      ]
    },
    {
      "id": "06",
      "title": "Подготовить проверяемый staging R Club",
      "requirements": [
        "R24",
        "R27",
        "R37",
        "R38"
      ],
      "blockedBy": [
        "04",
        "05"
      ],
      "wave": 6,
      "zone": [
        "refref/docker/",
        "refref/docs/",
        "refref/apps/api/",
        "refref/apps/webapp/",
        "refref/packages/coredb/",
        "docs/club/"
      ],
      "status": "done",
      "retries": 1,
      "repairs": 2,
      "handoffs": 0,
      "startedAt": "2026-08-28T18:10:00+02:00",
      "finishedAt": "2026-08-28T19:35:00+02:00",
      "files": ["docker/margariteros-staging.compose.yml", "docker/margariteros-dokploy.compose.yml", "docker/Dockerfile.staging", "docker/verify-margariteros-staging.mjs", "docs/margariteros-staging.md", "packages/coredb/src/margariteros-staging-seed.ts"],
      "tests": {"passed": 80, "failed": 0},
      "commit": "53ee953",
      "externalCommit": "d2ebc87",
      "runtime": {"provider": "dokploy", "composeId": "WYJAhrai2C04gt4BWZ94v", "url": "https://margariteros-r-club-nsdsbv-e6b2f8-37-27-217-246.sslip.io", "readiness": 200},
      "concerns": ["Syrve adapter intentionally remains not_ready until native program/order readback is proven", "Telegram bot token and registration workflow are not yet live", "replay retention cleanup remains operational debt"]
    },
    {
      "id": "07",
      "title": "Проверить нативные 10% и 5 PLN одним кассовым чеком",
      "requirements": [
        "R04",
        "R11",
        "R16",
        "R17",
        "R18",
        "R19",
        "R25",
        "R26",
        "R34i",
        "R35i"
      ],
      "blockedBy": [
        "04",
        "06"
      ],
      "wave": 7,
      "zone": [
        "run/live-poc/",
        "docs/club/pos-pilot.md"
      ],
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
    }
  ],
  "singlePass": null,
  "tests": null,
  "debt": {
    "placeholders": [],
    "assumptions": [],
    "emptyEnv": []
  },
  "additions": [
    {
      "at": "2026-08-28T12:52:00+02:00",
      "text": "Экономное распределение моделей: Luna для простых задач, Terra для интеграций, Sol только для архитектуры и приёмки"
    },
    {
      "at": "2026-08-28T13:05:00+02:00",
      "text": "Live Syrve подтвердил ранее настроенную пару 10% + 5 PLN; скидка активна, бонусная программа выключена"
    },
    {
      "at": "2026-08-28T16:05:00+02:00",
      "text": "Owner correction: mandatory self-host RefRef; Syrve native discount/reward; one R Club UI for Telegram Mini App and ordinary Polish web"
    }
  ],
  "coverage": {
    "reviewer": "spec_coverage_luna",
    "findings": 14,
    "resolved": [
      "добавлен обязательный research/evidence deliverable",
      "добавлен поиск старого PRD и credential metadata",
      "добавлены registration mode и POS UX audit",
      "добавлен точный Luna/Terra/Sol routing",
      "RefRef UI явно deferred с совместимым seam",
      "provisional link выдаётся сразу, activation включает discount flow",
      "staging и physical POS acceptance разведены честно",
      "R25 приведён к подтверждённой цели 10% + 5 PLN"
    ]
  },
  "concerns": [],
  "reviewers": {
    "manifestSpec": null,
    "craft": null
  },
  "blind": null
}
