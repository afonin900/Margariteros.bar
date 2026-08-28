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
  "updatedAt": "2026-08-28T15:18:00+02:00",
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
      "note": "4 таска, ярус T2"
    },
    {
      "id": "build",
      "status": "active",
      "startedAt": "2026-08-28T13:55:00+02:00",
      "note": "2 из 4 тасков готовы"
    },
    {
      "id": "review",
      "status": "active",
      "startedAt": "2026-08-28T14:14:00+02:00",
      "note": "проверено 2 из 4"
    },
    {
      "id": "final",
      "status": "pending"
    }
  ],
  "requirements": {
    "total": 37,
    "done": 14,
    "inTicket": 18,
    "inSpec": 0,
    "placeholder": 0,
    "deferred": 5,
    "dropped": 0
  },
  "tickets": [
    {
      "id": "01",
      "title": "Доказанная карта Loyalty и контракт пилота",
      "requirements": ["R01", "R02", "R03", "R04", "R11", "R23", "R26", "R28", "R29", "R30", "R31", "G01"],
      "blockedBy": [],
      "wave": 1,
      "zone": ["run/evidence/", "docs/club/"],
      "status": "done",
      "startedAt": "2026-08-28T14:07:00+02:00",
      "finishedAt": "2026-08-28T14:48:00+02:00",
      "retries": 0,
      "repairs": 1,
      "repairFindings": ["evidence pack обнулил уже полученный live-readback и не дал официальные paths"],
      "handoffs": 0,
      "files": [".autopilot/2026-08-28-margariteros-club-pilot--wip/evidence/01-evidence-pack.md", "docs/club/README.md"],
      "tests": {"passed": 23, "failed": 0},
      "commit": "72495a5",
      "concerns": []
    },
    {
      "id": "02",
      "title": "Надёжное ядро регистрации и начислений",
      "requirements": ["R09", "R12", "R14", "R15", "R17", "R18", "R19", "R20", "R24", "R32i", "R33i", "R34i", "D01"],
      "blockedBy": ["01"],
      "wave": 2,
      "zone": ["site/src/lib/club/", "site/tests/club/"],
      "status": "repair",
      "startedAt": "2026-08-28T14:48:00+02:00",
      "finishedAt": "2026-08-28T15:18:00+02:00",
      "retries": 0,
      "repairs": 2,
      "repairFindings": ["параллельные одинаковые check events могут создать две ledger entries", "referral surface требует read-only lookup кандидата по referral code"],
      "handoffs": 0,
      "files": ["site/src/lib/club/club-domain.ts", "site/src/lib/club/syrve-adapter.ts", "site/src/lib/club/index.ts", "site/tests/club/club-domain.test.ts"],
      "tests": {"passed": 28, "failed": 0},
      "commit": "bbc6c8e",
      "concerns": ["process-local idempotency; multi-instance needs durable transaction store"]
    },
    {
      "id": "03",
      "title": "Регистрация партнёра и постоянная ссылка",
      "requirements": ["R07", "R08", "R13", "R16", "R20", "R21", "R24", "R35i"],
      "blockedBy": ["02"],
      "wave": 3,
      "zone": ["site/src/pages/api/club/", "site/src/pages/r/", "site/src/pages/[locale]/club/", "site/tests/club/registration-and-link.test.ts"],
      "status": "in-progress",
      "startedAt": "2026-08-28T15:18:00+02:00",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
    },
    {
      "id": "04",
      "title": "Один контролируемый чек: скидка 10% и бонус 5 PLN",
      "requirements": ["R04", "R11", "R16", "R17", "R18", "R19", "R25", "R26", "R34i", "R35i"],
      "blockedBy": ["01", "02", "03"],
      "wave": 4,
      "zone": ["run/live-poc/", "docs/club/pos-pilot.md"],
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
