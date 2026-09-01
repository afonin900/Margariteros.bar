import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import { ContentRepository, handleContentUnpublish } from "emdash";

const apply = process.argv.includes("--apply");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const locales = ["pl", "en", "ru", "es"];
const slugs = ["test-music-evening-2026-09-05", "test-dance-evening-2026-09-12"];
const db = new Kysely({ dialect: createDialect({ url: databasePath }) });
const content = new ContentRepository(db);

try {
  const report = [];
  for (const slug of slugs) {
    for (const locale of locales) {
      const event = await content.findByIdOrSlug("events", slug, locale);
      if (!event) {
        report.push({ slug, locale, state: "missing" });
        continue;
      }
      if (apply && event.status === "published") {
        const result = await handleContentUnpublish(db, "events", event.id);
        if (!result.success) throw new Error(`${slug}/${locale}: ${result.error.message}`);
      }
      const current = await content.findByIdOrSlug("events", slug, locale);
      report.push({ slug, locale, id: event.id, state: apply ? current?.status : `would-unpublish:${event.status}` });
    }
  }
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", events: report }, null, 2));
} finally {
  await db.destroy();
}
