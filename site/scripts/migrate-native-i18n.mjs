import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import BetterSqlite3 from "better-sqlite3";
import { Kysely, sql } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import {
  ContentRepository,
  SchemaRegistry,
  handleContentCreate,
  handleContentPublish,
  handleContentUpdate,
} from "emdash";

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const cleanup = argv.includes("--cleanup");
const confirmReadback = argv.includes("--confirm-readback");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const databaseFile = resolve(databasePath.startsWith("file:") ? databasePath.slice(5) : databasePath);
const backupArgument = optionValue("--backup");
const locales = ["pl", "en", "ru", "es"];

const homepageFields = [
  "hero_eyebrow",
  "hero_title",
  "hero_text",
  "hero_image_alt",
  "primary_cta_label",
  "secondary_cta_label",
  "gallery_heading",
];
const eventFields = ["title", "summary", "details"];

// TODO(native-i18n-shared-fields): legacy common facts are still marked as
// translatable by EmDash. Flipping that flag is explicitly rejected by the
// registry and needs a separately reviewed data migration. Until then this
// script copies dates, images and booking facts into every locale row.

const requiredFields = {
  homepage: ["name", "hero_image", ...homepageFields],
  events: [
    "starts_at",
    "ends_at",
    "event_state",
    ...eventFields,
    "hero_image",
    "booking_url",
    "fact_sources",
    "facts_confirmed_at",
    "legacy_path",
  ],
};

const nativeAdditions = {
  homepage: [
    { slug: "hero_eyebrow", label: "Hero eyebrow", type: "string" },
    { slug: "hero_title", label: "Hero title", type: "string" },
    { slug: "hero_text", label: "Hero text", type: "text" },
    { slug: "hero_image_alt", label: "Hero image description", type: "string" },
    { slug: "primary_cta_label", label: "Primary button", type: "string" },
    { slug: "secondary_cta_label", label: "Secondary button", type: "string" },
    { slug: "gallery_heading", label: "Gallery heading", type: "string" },
  ],
  events: [],
};

const obsolete = {
  homepage: [
    "published_locales",
    ...locales.flatMap((locale) => homepageFields.map((field) => `${field}_${locale}`)),
  ],
  events: [
    "published_locales",
    ...["en", "ru", "es"].flatMap((locale) => eventFields.map((field) => `${field}_${locale}`)),
  ],
};

function optionValue(name) {
  const equalsPrefix = `${name}=`;
  const equals = argv.find((argument) => argument.startsWith(equalsPrefix));
  if (equals) return equals.slice(equalsPrefix.length);

  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} needs an absolute destination path`);
  }
  return value;
}

function isMeaningful(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== null && value !== undefined;
}

function equalValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function requireValue(value, description) {
  if (!isMeaningful(value)) throw new Error(`${description} is missing or empty`);
  return value;
}

function requireLegacyLocales(source, collection) {
  const readyLocales = source.data.published_locales;
  if (!Array.isArray(readyLocales) || locales.some((locale) => !readyLocales.includes(locale))) {
    throw new Error(
      `${collection}/${source.slug ?? source.id} must list all of ${locales.join(", ")} in legacy published_locales`,
    );
  }
}

function legacyPolishEventValue(source, variantsByLocale, field) {
  if (source.locale === "pl") return source.data[field];

  // A retry comes here after the source EN/RU/ES row has already been updated.
  // Its original Polish value then lives in the PL sibling created by the first
  // attempt, so use that value instead of accidentally copying the source text.
  const polishVariant = variantsByLocale.get("pl");
  if (polishVariant && isMeaningful(polishVariant.data[field])) return polishVariant.data[field];

  return source.data[field];
}

function translatedData(collection, source, locale, variantsByLocale) {
  requireLegacyLocales(source, collection);

  if (collection === "homepage") {
    const data = {
      name: requireValue(source.data.name ?? "Main homepage", `${collection}/${source.slug}/name`),
      hero_image: requireValue(source.data.hero_image, `${collection}/${source.slug}/hero_image`),
    };
    for (const field of homepageFields) {
      data[field] = requireValue(
        source.data[`${field}_${locale}`],
        `${collection}/${source.slug}/${field}_${locale}`,
      );
    }
    return data;
  }

  const data = {
    starts_at: requireValue(source.data.starts_at, `${collection}/${source.slug}/starts_at`),
    event_state: requireValue(source.data.event_state, `${collection}/${source.slug}/event_state`),
    hero_image: requireValue(source.data.hero_image, `${collection}/${source.slug}/hero_image`),
    fact_sources: requireValue(source.data.fact_sources, `${collection}/${source.slug}/fact_sources`),
    facts_confirmed_at: requireValue(
      source.data.facts_confirmed_at,
      `${collection}/${source.slug}/facts_confirmed_at`,
    ),
  };

  for (const field of eventFields) {
    const value =
      locale === "pl"
        ? legacyPolishEventValue(source, variantsByLocale, field)
        : source.data[`${field}_${locale}`];
    data[field] = requireValue(value, `${collection}/${source.slug}/${field}_${locale}`);
  }

  for (const field of ["ends_at", "booking_url"]) {
    if (field in source.data) data[field] = source.data[field];
  }

  // legacy_path is unique in the old schema. It is an internal trace, not a
  // public event fact, so keeping it only on the canonical legacy row avoids
  // inventing per-language paths solely to satisfy a unique constraint.
  return data;
}

function isLegacySource(collection, item) {
  if (collection === "homepage") {
    return homepageFields.some((field) => `${field}_pl` in item.data);
  }
  // Old JSON columns may materialise an omitted value as the string "null".
  // Only an actual ready-locale array or a real localized title makes this a
  // legacy source; translated siblings must not become source rows on retry.
  return Array.isArray(item.data.published_locales) || isMeaningful(item.data.title_en);
}

function assertSourceLocale(source, collection) {
  if (!locales.includes(source.locale)) {
    throw new Error(
      `${collection}/${source.slug ?? source.id} has unsupported source locale ${String(source.locale)}; stop for manual inspection`,
    );
  }
}

function assertSourceStatus(source, collection) {
  if (source.status !== "draft" && source.status !== "published") {
    throw new Error(
      `${collection}/${source.slug ?? source.id} has status ${source.status}; scheduled and other states need a separate migration`,
    );
  }
}

async function assertDatabaseExists() {
  const info = await stat(databaseFile).catch(() => null);
  if (!info?.isFile()) {
    throw new Error(`EmDash database does not exist: ${databaseFile}`);
  }
}

async function createBackup(destination) {
  const backupFile = resolve(destination);
  if (backupFile === databaseFile) {
    throw new Error("Backup destination must not be the live EmDash database");
  }

  const parent = await stat(dirname(backupFile)).catch(() => null);
  if (!parent?.isDirectory()) {
    throw new Error(`Backup directory does not exist: ${dirname(backupFile)}`);
  }

  const existing = await stat(backupFile).catch(() => null);
  if (existing) throw new Error(`Backup destination already exists: ${backupFile}`);

  const source = new BetterSqlite3(databaseFile, { readonly: true, fileMustExist: true });
  try {
    await source.backup(backupFile);
  } finally {
    source.close();
  }

  const result = await stat(backupFile).catch(() => null);
  if (!result?.isFile() || result.size === 0) {
    throw new Error(`SQLite backup was not created: ${backupFile}`);
  }
  return backupFile;
}

async function listAll(repository, collection) {
  const items = [];
  let cursor;
  do {
    const page = await repository.findMany(collection, {
      limit: 100,
      cursor,
      orderBy: { field: "createdAt", direction: "asc" },
    });
    items.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return items;
}

async function variantsForSlug(repository, collection, slug) {
  const variants = new Map();
  for (const locale of locales) {
    const item = await repository.findBySlug(collection, slug, locale);
    if (item) variants.set(locale, item);
  }
  return variants;
}

async function prepareNativeSchema(registry, collection, allowCreate) {
  const report = [];
  for (const field of nativeAdditions[collection]) {
    const existing = await registry.getField(collection, field.slug);
    if (existing) {
      if (existing.type !== field.type) {
        throw new Error(
          `${collection}.${field.slug} has type ${existing.type}; expected ${field.type}. Stop for manual schema repair.`,
        );
      }
      report.push({ field: `${collection}.${field.slug}`, state: "present" });
      continue;
    }

    if (!allowCreate) {
      report.push({ field: `${collection}.${field.slug}`, state: "would-create" });
      continue;
    }

    await registry.createField(collection, field);
    report.push({ field: `${collection}.${field.slug}`, state: "created" });
  }

  const missing = [];
  for (const field of requiredFields[collection]) {
    if (!(await registry.getField(collection, field))) missing.push(`${collection}.${field}`);
  }
  if (missing.length > 0 && allowCreate) {
    throw new Error(`Native schema is incomplete after schema add: ${missing.join(", ")}`);
  }
  return { report, missing };
}

async function normalizeTranslationGroup(db, repository, collection, item, expectedGroup) {
  if (item.translationGroup === expectedGroup) return item;
  if (item.translationGroup !== null) {
    throw new Error(
      `${collection}/${item.slug ?? item.id}/${item.locale} belongs to unexpected translation group ${item.translationGroup}; stop for manual inspection`,
    );
  }

  const table = `ec_${collection}`;
  const result = await sql`
    UPDATE ${sql.ref(table)}
    SET translation_group = ${expectedGroup},
        updated_at = ${new Date().toISOString()},
        version = version + 1
    WHERE id = ${item.id}
      AND translation_group IS NULL
      AND deleted_at IS NULL
  `.execute(db);
  if (result.numAffectedRows !== 1n) {
    throw new Error(`${collection}/${item.slug ?? item.id}: translation group changed concurrently`);
  }

  const normalized = await repository.findById(collection, item.id);
  if (!normalized || normalized.translationGroup !== expectedGroup) {
    throw new Error(`${collection}/${item.slug ?? item.id}: translation group readback failed`);
  }
  return normalized;
}

async function publish(collection, id) {
  const result = await handleContentPublish(db, collection, id);
  if (!result.success) throw new Error(`${collection}/${id}: ${result.error.code}: ${result.error.message}`);
}

function needsDataUpdate(item, expectedData) {
  return Object.entries(expectedData).some(([field, expected]) => !equalValue(item.data[field], expected));
}

async function updateEntry(collection, item, data) {
  if (!needsDataUpdate(item, data)) return item;
  const result = await handleContentUpdate(db, collection, item.id, { data });
  if (!result.success) throw new Error(`${collection}/${item.slug ?? item.id}: ${result.error.code}: ${result.error.message}`);
  return result.data.item;
}

async function migrateCollection(collection) {
  const repository = new ContentRepository(db);
  const allRows = await listAll(repository, collection);
  const sourceRows = allRows.filter((item) => isLegacySource(collection, item));
  const seenSlugs = new Set();
  const report = [];

  for (const candidate of sourceRows) {
    if (!candidate.slug) throw new Error(`${collection}/${candidate.id} has no slug; stop for manual inspection`);
    if (seenSlugs.has(candidate.slug)) {
      throw new Error(`${collection}/${candidate.slug} has more than one legacy source row; stop for manual inspection`);
    }
    seenSlugs.add(candidate.slug);
    assertSourceLocale(candidate, collection);
    assertSourceStatus(candidate, collection);
    requireLegacyLocales(candidate, collection);

    let source = candidate;
    let variantsByLocale = await variantsForSlug(repository, collection, source.slug);
    for (const locale of locales) translatedData(collection, source, locale, variantsByLocale);

    if (!apply) {
      for (const locale of locales) {
        const existing = variantsByLocale.get(locale);
        report.push({
          collection,
          slug: source.slug,
          locale,
          state: existing ? "would-upsert" : "would-create",
          normalizeSourceGroup: source.translationGroup === null,
        });
      }
      continue;
    }

    source = await normalizeTranslationGroup(db, repository, collection, source, source.id);
    variantsByLocale = await variantsForSlug(repository, collection, source.slug);
    const toPublish = [];

    for (const locale of locales) {
      const data = translatedData(collection, source, locale, variantsByLocale);
      let existing = variantsByLocale.get(locale);

      if (existing) {
        existing = await normalizeTranslationGroup(db, repository, collection, existing, source.id);
        if (source.status !== "published" && existing.status === "published") {
          throw new Error(
            `${collection}/${source.slug}/${locale} is published while its legacy source is draft; stop rather than unpublish editorial content`,
          );
        }
        const updated = await updateEntry(collection, existing, data);
        if (source.status === "published" && updated.status !== "published") toPublish.push(updated.id);
        report.push({ collection, slug: source.slug, locale, state: "upserted", id: updated.id });
        continue;
      }

      const created = await handleContentCreate(db, collection, {
        slug: source.slug,
        locale,
        translationOf: source.id,
        status: "draft",
        data,
      });
      if (!created.success) {
        throw new Error(`${collection}/${source.slug}/${locale}: ${created.error.code}: ${created.error.message}`);
      }
      if (source.status === "published") toPublish.push(created.data.item.id);
      report.push({ collection, slug: source.slug, locale, state: "created", id: created.data.item.id });
    }

    // Before publishing any new variant, prove that all four rows exist, are
    // grouped together and contain the exact data copied from the legacy row.
    await assertCollectionReadback(collection, [source.id], false);
    for (const id of toPublish) await publish(collection, id);
  }

  return { report, sourceIds: sourceRows.map((source) => source.id) };
}

async function assertCollectionReadback(collection, sourceIds, checkStatus) {
  const repository = new ContentRepository(db);
  const issues = [];

  for (const sourceId of sourceIds) {
    const source = await repository.findById(collection, sourceId);
    if (!source) {
      issues.push(`${collection}/${sourceId}: source disappeared`);
      continue;
    }
    if (!source.slug) {
      issues.push(`${collection}/${sourceId}: source has no slug`);
      continue;
    }
    if (source.translationGroup !== source.id) {
      issues.push(`${collection}/${source.slug}: source translation_group is not its id`);
      continue;
    }

    const variantsByLocale = await variantsForSlug(repository, collection, source.slug);
    if (variantsByLocale.size !== locales.length) {
      issues.push(`${collection}/${source.slug}: expected ${locales.length} locale rows, found ${variantsByLocale.size}`);
      continue;
    }

    for (const locale of locales) {
      const variant = variantsByLocale.get(locale);
      if (!variant) {
        issues.push(`${collection}/${source.slug}: missing ${locale} row`);
        continue;
      }
      if (variant.translationGroup !== source.id) {
        issues.push(`${collection}/${source.slug}/${locale}: wrong translation_group`);
        continue;
      }
      if (checkStatus && variant.status !== source.status) {
        issues.push(`${collection}/${source.slug}/${locale}: status ${variant.status} differs from source ${source.status}`);
      }

      let expected;
      try {
        expected = translatedData(collection, source, locale, variantsByLocale);
      } catch (error) {
        issues.push(`${collection}/${source.slug}/${locale}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      for (const [field, value] of Object.entries(expected)) {
        if (!equalValue(variant.data[field], value)) {
          issues.push(`${collection}/${source.slug}/${locale}: ${field} readback differs`);
        }
      }
    }
  }

  if (issues.length > 0) throw new Error(`Native i18n readback failed:\n- ${issues.join("\n- ")}`);
}

async function removeObsoleteFields(registry) {
  const removed = [];
  for (const [collection, fields] of Object.entries(obsolete)) {
    for (const field of fields) {
      const existing = await registry.getField(collection, field);
      if (!existing) continue;
      await registry.deleteField(collection, field);
      removed.push(`${collection}.${field}`);
    }
  }

  for (const [collection, fields] of Object.entries(obsolete)) {
    for (const field of fields) {
      if (await registry.getField(collection, field)) {
        throw new Error(`${collection}.${field} still exists after cleanup`);
      }
    }
  }
  return removed;
}

function validateArguments() {
  if (cleanup && !apply) throw new Error("--cleanup is destructive and requires --apply");
  if (apply && !backupArgument) {
    throw new Error("--apply requires --backup=/absolute/path/to/pre-migration.db");
  }
  if (apply && backupArgument && !backupArgument.startsWith("/")) {
    throw new Error("--backup must be an absolute path");
  }
  if (cleanup && !confirmReadback) {
    throw new Error("--cleanup requires --confirm-readback after the first migration report was reviewed");
  }
}

validateArguments();
await assertDatabaseExists();
const backup = apply ? await createBackup(backupArgument) : null;
const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

try {
  const registry = new SchemaRegistry(db);
  const schema = {
    homepage: await prepareNativeSchema(registry, "homepage", apply && !cleanup),
    events: await prepareNativeSchema(registry, "events", apply && !cleanup),
  };
  const missingFields = [...schema.homepage.missing, ...schema.events.missing];

  if (missingFields.length > 0 && (apply || cleanup)) {
    throw new Error(`Native schema is incomplete: ${missingFields.join(", ")}`);
  }

  if (!apply) {
    const homepage = await migrateCollection("homepage");
    const events = await migrateCollection("events");
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          database: databaseFile,
          schema,
          homepage: homepage.report,
          events: events.report,
          next: "Run --apply with a new --backup path. It will not delete legacy fields.",
        },
        null,
        2,
      ),
    );
  } else if (cleanup) {
    const homepageSources = (await listAll(new ContentRepository(db), "homepage"))
      .filter((item) => isLegacySource("homepage", item))
      .map((item) => item.id);
    const eventSources = (await listAll(new ContentRepository(db), "events"))
      .filter((item) => isLegacySource("events", item))
      .map((item) => item.id);

    await assertCollectionReadback("homepage", homepageSources, true);
    await assertCollectionReadback("events", eventSources, true);
    const removedFields = await removeObsoleteFields(registry);
    console.log(
      JSON.stringify(
        {
          mode: "cleanup",
          database: databaseFile,
          backup,
          verified: { homepageSourceIds: homepageSources, eventSourceIds: eventSources },
          removedFields,
        },
        null,
        2,
      ),
    );
  } else {
    const homepage = await migrateCollection("homepage");
    const events = await migrateCollection("events");
    await assertCollectionReadback("homepage", homepage.sourceIds, true);
    await assertCollectionReadback("events", events.sourceIds, true);
    console.log(
      JSON.stringify(
        {
          mode: "apply",
          database: databaseFile,
          backup,
          schema,
          homepage: homepage.report,
          events: events.report,
          verified: { homepageSourceIds: homepage.sourceIds, eventSourceIds: events.sourceIds },
          next:
            "Review this readback and public SSR pages. Cleanup is a separate --apply --cleanup --confirm-readback run with a fresh backup.",
        },
        null,
        2,
      ),
    );
  }
} finally {
  await db.destroy();
}
