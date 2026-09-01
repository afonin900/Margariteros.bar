import { copyFile, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import BetterSqlite3 from "better-sqlite3";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import { SchemaRegistry, ulid } from "emdash";

/**
 * Adds the performer directory and EmDash's native many-to-many relation from
 * events to performers. No existing event row is changed and no relationship
 * is created by this migration: editors choose the performers per event later.
 *
 * The regular `reference` field is deliberately not used. In EmDash 0.35 it
 * accepts one string id only; a native RelationRepository relation stores an
 * ordered collection of child translation groups and is locale-safe.
 */

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const databaseFile = resolve(databasePath.startsWith("file:") ? databasePath.slice(5) : databasePath);
const backupArgument = optionValue("--backup");
const locales = ["pl", "en", "ru", "es"];

const performerCollection = {
  slug: "performers",
  label: "Performers",
  labelSingular: "Performer",
  description: "DJ and performer profiles used by event cards.",
  supports: ["drafts", "revisions", "preview"],
  titleField: "name",
  routable: false,
  admin: { listColumns: ["active", "instagram_url"] },
};

const performerFields = [
  { slug: "name", label: "Performer name", type: "string", required: true, translatable: false },
  { slug: "main_photo", label: "Main photo", type: "image", translatable: false },
  { slug: "bio", label: "Biography", type: "text", translatable: true },
  { slug: "instagram_url", label: "Instagram URL", type: "url", translatable: false },
  { slug: "facebook_url", label: "Facebook URL", type: "url", translatable: false },
  { slug: "tiktok_url", label: "TikTok URL", type: "url", translatable: false },
  { slug: "youtube_url", label: "YouTube URL", type: "url", translatable: false },
  { slug: "soundcloud_url", label: "SoundCloud URL", type: "url", translatable: false },
  { slug: "website_url", label: "Website URL", type: "url", translatable: false },
  { slug: "active", label: "Active", type: "boolean", required: true, defaultValue: true, indexed: true, translatable: false },
];

const eventPerformersRelation = {
  name: "event_performers",
  parentCollection: "events",
  childCollection: "performers",
  parentLabel: "Performers",
  childLabel: "Events",
};

const primaryPerformerField = {
  slug: "primary_performer",
  label: "Primary performer",
  type: "reference",
  options: { collection: "performers" },
  translatable: false,
};

function optionValue(name) {
  const prefix = `${name}=`;
  const equals = argv.find((argument) => argument.startsWith(prefix));
  if (equals) return equals.slice(prefix.length);
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} needs an absolute destination path`);
  return value;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, stable(entry)]));
}

function same(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

function validateArguments() {
  if (!apply) return;
  if (!backupArgument) throw new Error("--apply requires --backup=/absolute/path/to/pre-performers.db");
  if (!backupArgument.startsWith("/")) throw new Error("--backup must be an absolute path");
}

async function assertDatabaseExists() {
  const info = await stat(databaseFile).catch(() => null);
  if (!info?.isFile()) throw new Error(`EmDash database does not exist: ${databaseFile}`);
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

function assertSqliteIntegrity(file) {
  const database = new BetterSqlite3(file, { readonly: true, fileMustExist: true });
  try {
    const values = database.pragma("integrity_check").flatMap((row) => Object.values(row));
    if (!values.includes("ok")) throw new Error(`SQLite integrity check failed for ${file}`);
  } finally {
    database.close();
  }
}

async function createBackup(destination) {
  const backupFile = resolve(destination);
  if (backupFile === databaseFile) throw new Error("Backup destination must not be the live EmDash database");
  const parent = await stat(dirname(backupFile)).catch(() => null);
  if (!parent?.isDirectory()) throw new Error(`Backup directory does not exist: ${dirname(backupFile)}`);
  if (await stat(backupFile).catch(() => null)) throw new Error(`Backup destination already exists: ${backupFile}`);

  const source = new BetterSqlite3(databaseFile, { readonly: true, fileMustExist: true });
  try {
    await source.backup(backupFile);
  } finally {
    source.close();
  }
  const created = await stat(backupFile).catch(() => null);
  if (!created?.isFile() || created.size === 0) throw new Error(`SQLite backup was not created: ${backupFile}`);
  return backupFile;
}

async function rehearseRollback(backupFile) {
  const directory = await mkdtemp(join(tmpdir(), "margariteros-performers-"));
  const restored = join(directory, "emdash.db");
  try {
    await copyFile(backupFile, restored);
    const [backupHash, restoredHash] = await Promise.all([sha256(backupFile), sha256(restored)]);
    if (backupHash !== restoredHash) throw new Error("Temporary rollback copy differs from the backup");
    assertSqliteIntegrity(restored);
    return { sha256: backupHash, rollbackRehearsal: "passed" };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function assertCollection(collection) {
  if (!collection) throw new Error("performers collection is missing");
  const expected = {
    label: performerCollection.label,
    labelSingular: performerCollection.labelSingular,
    description: performerCollection.description,
    supports: performerCollection.supports,
    titleField: performerCollection.titleField,
    routable: performerCollection.routable,
    admin: performerCollection.admin,
  };
  const actual = {
    label: collection.label,
    labelSingular: collection.labelSingular,
    description: collection.description,
    supports: collection.supports,
    titleField: collection.titleField,
    routable: collection.routable,
    admin: collection.admin,
  };
  if (!same(actual, expected)) throw new Error("performers collection has an incompatible definition");
}

function assertField(field, definition) {
  if (!field) throw new Error(`performers.${definition.slug} is missing`);
  const expected = {
    label: definition.label,
    type: definition.type,
    required: Boolean(definition.required),
    defaultValue: definition.defaultValue,
    indexed: Boolean(definition.indexed),
    translatable: definition.translatable !== false,
  };
  const actual = {
    label: field.label,
    type: field.type,
    required: field.required,
    defaultValue: field.defaultValue,
    indexed: field.indexed,
    translatable: field.translatable,
  };
  if (!same(actual, expected)) throw new Error(`performers.${definition.slug} has an incompatible definition`);
}

async function preparePerformerSchema(registry, db) {
  const eventCollection = await registry.getCollection("events");
  if (!eventCollection) throw new Error("events collection is missing; performers cannot be linked");

  const report = { collection: "present", fields: [] };
  const existing = await registry.getCollection("performers");
  if (!existing) {
    if (!apply) {
      report.collection = "would-create";
    } else {
      await registry.createCollection({
        slug: performerCollection.slug,
        label: performerCollection.label,
        labelSingular: performerCollection.labelSingular,
        description: performerCollection.description,
        supports: performerCollection.supports,
        routable: performerCollection.routable,
        admin: performerCollection.admin,
      });
      report.collection = "created";
    }
  } else {
    assertCollection(existing);
  }

  for (const definition of performerFields) {
    const field = await registry.getField("performers", definition.slug);
    if (field) {
      // Emdash deliberately refuses every required-flag change through its
      // public registry because making a field stricter can invalidate rows.
      // This one-way relaxation is safe: existing values stay intact and the
      // backup made before --apply remains the rollback point.
      const relaxRequiredField = ["main_photo", "instagram_url"].includes(definition.slug)
        && field.required === true
        && definition.required !== true;
      if (relaxRequiredField) {
        assertField(field, { ...definition, required: true });
        if (!apply) {
          report.fields.push({ slug: definition.slug, state: "would-relax-required" });
        } else {
          await db.updateTable("_emdash_fields").set({ required: 0 }).where("id", "=", field.id).execute();
          assertField(await registry.getField("performers", definition.slug), definition);
          report.fields.push({ slug: definition.slug, state: "relaxed-required" });
        }
      } else {
        assertField(field, definition);
        report.fields.push({ slug: definition.slug, state: "present" });
      }
    } else if (!apply) {
      report.fields.push({ slug: definition.slug, state: "would-create" });
    } else {
      await registry.createField("performers", definition);
      assertField(await registry.getField("performers", definition.slug), definition);
      report.fields.push({ slug: definition.slug, state: "created" });
    }
  }

  if (apply) {
    const collection = await registry.getCollection("performers");
    if (!collection) throw new Error("performers collection creation readback failed");
    if (collection.titleField !== performerCollection.titleField) {
      await registry.updateCollection("performers", { titleField: performerCollection.titleField });
    }
    assertCollection(await registry.getCollection("performers"));
  }
  const primary = await registry.getField("events", primaryPerformerField.slug);
  if (!primary) {
    if (apply) await registry.createField("events", primaryPerformerField);
  } else if (primary.type !== "reference" || primary.translatable !== false || primary.options?.collection !== "performers") {
    throw new Error("events.primary_performer has an incompatible definition");
  }
  const primaryReadback = apply ? await registry.getField("events", primaryPerformerField.slug) : primary;
  if (apply && (!primaryReadback || primaryReadback.type !== "reference" || primaryReadback.options?.collection !== "performers")) {
    throw new Error("events.primary_performer creation readback failed");
  }
  report.primaryPerformer = primary ? "present" : apply ? "created" : "would-create";
  return report;
}

function assertRelation(relation) {
  if (!relation) throw new Error("event_performers relation is missing");
  if (relation.name !== eventPerformersRelation.name
    || relation.parentCollection !== eventPerformersRelation.parentCollection
    || relation.childCollection !== eventPerformersRelation.childCollection
    || relation.parentLabel !== eventPerformersRelation.parentLabel
    || relation.childLabel !== eventPerformersRelation.childLabel) {
    throw new Error("event_performers relation has an incompatible definition");
  }
}

function mapRelation(row) {
  return row ? {
    id: row.id,
    name: row.name,
    parentCollection: row.parent_collection,
    childCollection: row.child_collection,
    parentLabel: row.parent_label,
    childLabel: row.child_label,
    locale: row.locale,
    translationGroup: row.translation_group,
  } : null;
}

async function findRelation(db, locale) {
  return mapRelation(await db.selectFrom("_emdash_relations")
    .selectAll()
    .where("name", "=", eventPerformersRelation.name)
    .where("locale", "=", locale)
    .executeTakeFirst());
}

/*
 * EmDash 0.35 exposes relation creation through its authenticated REST API but
 * not through the package's Node export map. This maintenance command runs
 * before that server exists, so it writes only the exact relation-definition
 * rows used by that API. The table layout, group semantics and unique keys are
 * verified against 0.35's RelationRepository implementation.
 */
async function prepareEventPerformersRelation(db) {
  const existing = await Promise.all(locales.map(async (locale) => [locale, await findRelation(db, locale)]));
  const present = existing.filter(([, relation]) => relation);
  for (const [, relation] of present) assertRelation(relation);
  const groups = new Set(present.map(([, relation]) => relation.translationGroup));
  if (groups.size > 1) throw new Error("event_performers relation translations belong to different groups");

  const report = [];
  if (!apply) {
    for (const [locale, relation] of existing) report.push({ locale, state: relation ? "present" : "would-create" });
    return report;
  }

  let anchor = present[0]?.[1];
  for (const [locale, relation] of existing) {
    if (relation) {
      report.push({ locale, id: relation.id, state: "present" });
      continue;
    }
    const id = ulid();
    const now = new Date().toISOString();
    const translationGroup = anchor?.translationGroup ?? id;
    await db.insertInto("_emdash_relations").values({
      id,
      name: eventPerformersRelation.name,
      parent_collection: eventPerformersRelation.parentCollection,
      child_collection: eventPerformersRelation.childCollection,
      parent_label: eventPerformersRelation.parentLabel,
      child_label: eventPerformersRelation.childLabel,
      locale,
      translation_group: translationGroup,
      created_at: now,
      updated_at: now,
    }).execute();
    const created = await findRelation(db, locale);
    anchor ??= created;
    assertRelation(created);
    report.push({ locale, id: created.id, state: "created" });
  }

  const readback = await Promise.all(locales.map((locale) => findRelation(db, locale)));
  if (readback.some((relation) => !relation)) throw new Error("event_performers relation locale readback failed");
  if (new Set(readback.map((relation) => relation.translationGroup)).size !== 1) {
    throw new Error("event_performers relation locale readback is not one translation group");
  }
  readback.forEach(assertRelation);
  return report;
}

validateArguments();
await assertDatabaseExists();

const backup = apply ? await createBackup(backupArgument) : null;
const backupProof = backup ? await rehearseRollback(backup) : null;
const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

try {
  const registry = new SchemaRegistry(db);
  const schema = await preparePerformerSchema(registry, db);
  const relation = await prepareEventPerformersRelation(db);

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    database: databaseFile,
    ...(backup ? { backup: { path: backup, ...backupProof } } : {}),
    schema,
    relation: {
      name: eventPerformersRelation.name,
      direction: "events -> performers",
      locales: relation,
      editorContract: "Set ordered performer ids with POST /_emdash/api/content/events/:eventId/references/event_performers/children and { childIds: [...] }.",
    },
    ...(apply ? { verified: { locales, noEventContentChanged: true } } : {
      next: "Review this report, then run --apply with a new absolute --backup path. No performer or event content is created by this migration.",
    }),
  }, null, 2));
} finally {
  await db.destroy();
}
