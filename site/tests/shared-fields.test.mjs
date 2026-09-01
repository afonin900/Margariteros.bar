import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import { runMigrations } from "emdash/db";
import { ContentRepository, SchemaRegistry, handleContentUpdate } from "emdash";

const execFileAsync = promisify(execFile);
const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const locales = ["pl", "en", "ru", "es"];
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function image(id, alt) {
  return {
    id,
    provider: "external",
    src: `https://images.example.test/${id}.webp`,
    mimeType: "image/webp",
    width: 1200,
    height: 800,
    alt,
  };
}

function gallery(locale) {
  return ["one", "two", "three", "four"].map((id) => ({
    image: image(`gallery-${id}`, `internal ${locale} ${id}`),
    alt: `${locale} description ${id}`,
  }));
}

async function addField(registry, collection, definition) {
  await registry.createField(collection, definition);
}

async function createTranslations(repository, collection, slug, dataByLocale) {
  let anchor;
  for (const locale of locales) {
    const item = await repository.create({
      type: collection,
      slug,
      status: "published",
      locale,
      translationOf: anchor?.id,
      data: dataByLocale[locale],
    });
    if (locale === "pl") anchor = item;
  }
}

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "margariteros-shared-fields-test-"));
  temporaryDirectories.push(directory);
  const databasePath = join(directory, "emdash.db");
  const db = new Kysely({ dialect: createDialect({ url: databasePath }) });
  await runMigrations(db);

  const registry = new SchemaRegistry(db);
  await registry.createCollection({ slug: "homepage", label: "Homepage", titleField: "name" });
  await addField(registry, "homepage", { slug: "name", label: "Name", type: "string", required: true });
  await addField(registry, "homepage", { slug: "hero_image", label: "Hero", type: "image", required: true });
  await addField(registry, "homepage", {
    slug: "gallery_items",
    label: "Gallery",
    type: "repeater",
    required: true,
    validation: {
      minItems: 4,
      maxItems: 20,
      subFields: [
        { slug: "image", label: "Image", type: "image", required: true },
        { slug: "alt", label: "Alt", type: "string", required: true },
      ],
    },
  });
  for (const field of [
    ["hero_eyebrow", "string"], ["hero_title", "string"], ["hero_text", "text"], ["hero_image_alt", "string"],
    ["primary_cta_label", "string"], ["secondary_cta_label", "string"], ["gallery_heading", "string"],
  ]) {
    await addField(registry, "homepage", { slug: field[0], label: field[0], type: field[1] });
  }

  await registry.createCollection({ slug: "events", label: "Events", titleField: "title" });
  for (const field of [
    { slug: "starts_at", label: "Start", type: "datetime", required: true, indexed: true },
    { slug: "ends_at", label: "End", type: "datetime" },
    { slug: "event_state", label: "State", type: "select", required: true, indexed: true, validation: { options: ["scheduled", "postponed", "cancelled"] } },
    { slug: "title", label: "Title", type: "string", required: true },
    { slug: "summary", label: "Summary", type: "text", required: true },
    { slug: "details", label: "Details", type: "portableText", required: true },
    { slug: "hero_image", label: "Image", type: "image", required: true },
    { slug: "booking_url", label: "Booking", type: "url" },
    { slug: "fact_sources", label: "Sources", type: "text", required: true },
    { slug: "facts_confirmed_at", label: "Checked", type: "datetime", required: true },
  ]) {
    await addField(registry, "events", field);
  }
  await registry.updateCollection("events", { dateField: "starts_at" });

  const repository = new ContentRepository(db);
  await createTranslations(repository, "homepage", "main", Object.fromEntries(locales.map((locale) => [locale, {
    name: "Main homepage",
    hero_image: image("homepage-hero", `${locale} old hero alt`),
    hero_title: `${locale} homepage title`,
    gallery_items: gallery(locale),
  }])));
  await createTranslations(repository, "events", "music-night", Object.fromEntries(locales.map((locale) => [locale, {
    starts_at: "2026-09-05T19:00:00+02:00",
    ends_at: "2026-09-05T23:00:00+02:00",
    event_state: "scheduled",
    title: `${locale} music night`,
    summary: `${locale} summary`,
    details: [{ _type: "block", children: [{ _type: "span", text: `${locale} details`, marks: [] }], markDefs: [] }],
    hero_image: image("event-hero", `${locale} old event alt`),
    booking_url: "https://qr.margariteros.bar/booking",
    fact_sources: "Confirmed booking plan",
    facts_confirmed_at: "2026-09-01T10:00:00+02:00",
  }])));
  await db.destroy();

  return { directory, databasePath, backupPath: join(directory, "before-shared-fields.db") };
}

describe("shared EmDash fields migration", () => {
  it("migrates one common value across every translation while preserving local copy", async () => {
    const fixture = await createFixture();
    const { stdout } = await execFileAsync(
      process.execPath,
      ["./scripts/migrate-shared-fields.mjs", "--apply", `--backup=${fixture.backupPath}`],
      { cwd: siteRoot, env: { ...process.env, EMDASH_DATABASE_PATH: fixture.databasePath } },
    );
    const report = JSON.parse(stdout);
    expect(report.mode).toBe("apply");
    expect(report.backup.rollbackRehearsal).toBe("passed");
    expect((await stat(fixture.backupPath)).size).toBeGreaterThan(0);

    const db = new Kysely({ dialect: createDialect({ url: fixture.databasePath }) });
    try {
      const registry = new SchemaRegistry(db);
      expect((await registry.getField("homepage", "shared_hero_image"))?.translatable).toBe(false);
      expect((await registry.getField("homepage", "shared_gallery_images"))?.translatable).toBe(false);
      expect((await registry.getField("homepage", "gallery_item_alts"))?.translatable).toBe(true);
      expect((await registry.getField("events", "shared_starts_at"))?.translatable).toBe(false);
      expect((await registry.getCollection("events"))?.dateField).toBe("shared_starts_at");
      // Normal apply is deliberately non-destructive: the fallback remains
      // until a later owner-confirmed cleanup command.
      expect(await registry.getField("events", "starts_at")).toBeTruthy();

      const repository = new ContentRepository(db);
      const eventRows = await Promise.all(locales.map((locale) => repository.findBySlug("events", "music-night", locale)));
      const homepageRows = await Promise.all(locales.map((locale) => repository.findBySlug("homepage", "main", locale)));
      expect(eventRows.every(Boolean)).toBe(true);
      expect(homepageRows.every(Boolean)).toBe(true);
      expect(eventRows.map((row) => row.data.shared_starts_at)).toEqual(["2026-09-05T19:00:00+02:00", "2026-09-05T19:00:00+02:00", "2026-09-05T19:00:00+02:00", "2026-09-05T19:00:00+02:00"]);
      expect(eventRows.map((row) => row.data.title)).toEqual(locales.map((locale) => `${locale} music night`));
      expect(eventRows.map((row) => row.data.shared_hero_image.alt)).toEqual([undefined, undefined, undefined, undefined]);
      expect(homepageRows.map((row) => row.data.shared_gallery_images.map((item) => item.image.id))).toEqual([
        ["gallery-one", "gallery-two", "gallery-three", "gallery-four"],
        ["gallery-one", "gallery-two", "gallery-three", "gallery-four"],
        ["gallery-one", "gallery-two", "gallery-three", "gallery-four"],
        ["gallery-one", "gallery-two", "gallery-three", "gallery-four"],
      ]);
      expect(homepageRows.map((row) => row.data.gallery_item_alts[0].alt)).toEqual(locales.map((locale) => `${locale} description one`));

      // This simulates the Astro runtime's configured native i18n. The
      // migration itself intentionally does not install this global config.
      const configKey = Symbol.for("emdash:i18n-config");
      const store = globalThis;
      const previous = store[configKey];
      store[configKey] = { defaultLocale: "pl", locales, fallback: { en: "pl", ru: "pl", es: "pl" } };
      try {
        const update = await handleContentUpdate(db, "events", eventRows[0].id, {
          data: { shared_starts_at: "2026-09-05T20:00:00+02:00" },
        });
        expect(update.success).toBe(true);
        const updated = await Promise.all(locales.map((locale) => repository.findBySlug("events", "music-night", locale)));
        expect(updated.map((row) => row.data.shared_starts_at)).toEqual(["2026-09-05T20:00:00+02:00", "2026-09-05T20:00:00+02:00", "2026-09-05T20:00:00+02:00", "2026-09-05T20:00:00+02:00"]);
        expect(updated.map((row) => row.data.title)).toEqual(locales.map((locale) => `${locale} music night`));
      } finally {
        if (previous === undefined) delete store[configKey];
        else store[configKey] = previous;
      }
    } finally {
      await db.destroy();
    }
  });

  it("deletes fallback fields only in a separately confirmed run with a fresh backup", async () => {
    const fixture = await createFixture();
    const bridgeBackup = join(fixture.directory, "before-bridge.db");
    const cleanupBackup = join(fixture.directory, "before-cleanup.db");
    await execFileAsync(
      process.execPath,
      ["./scripts/migrate-shared-fields.mjs", "--apply", `--backup=${bridgeBackup}`],
      { cwd: siteRoot, env: { ...process.env, EMDASH_DATABASE_PATH: fixture.databasePath } },
    );
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        "./scripts/migrate-shared-fields.mjs",
        "--apply",
        "--cleanup-legacy",
        "--confirm-legacy-cleanup",
        `--backup=${cleanupBackup}`,
      ],
      { cwd: siteRoot, env: { ...process.env, EMDASH_DATABASE_PATH: fixture.databasePath } },
    );
    expect(JSON.parse(stdout)).toMatchObject({ mode: "cleanup-legacy", removed: expect.arrayContaining(["homepage.hero_image", "events.starts_at"]) });
    expect((await stat(cleanupBackup)).size).toBeGreaterThan(0);

    const db = new Kysely({ dialect: createDialect({ url: fixture.databasePath }) });
    try {
      const registry = new SchemaRegistry(db);
      expect(await registry.getField("homepage", "hero_image")).toBeNull();
      expect(await registry.getField("events", "starts_at")).toBeNull();
      expect((await registry.getField("events", "shared_starts_at"))?.translatable).toBe(false);
      const repository = new ContentRepository(db);
      const event = await repository.findBySlug("events", "music-night", "pl");
      expect(event?.data.shared_starts_at).toBe("2026-09-05T19:00:00+02:00");
    } finally {
      await db.destroy();
    }
  });
});
