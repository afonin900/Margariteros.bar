import { copyFile, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import BetterSqlite3 from "better-sqlite3";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import { ContentRepository, SchemaRegistry, handleContentUpdate } from "emdash";

/**
 * One-time bridge from the old per-language common facts to EmDash 0.35
 * non-translatable fields.  This script deliberately uses the public schema
 * and content APIs only: no direct writes to EmDash tables are performed.
 *
 * EmDash enables non-translatable synchronization inside the running Astro
 * application.  A standalone Node process does not have that i18n runtime,
 * so this migration initializes every sibling explicitly, then verifies them.
 */

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const cleanupLegacy = argv.includes("--cleanup-legacy");
const confirmLegacyCleanup = argv.includes("--confirm-legacy-cleanup");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const databaseFile = resolve(databasePath.startsWith("file:") ? databasePath.slice(5) : databasePath);
const backupArgument = optionValue("--backup");
const locales = ["pl", "en", "ru", "es"];

const imageField = { type: "image", required: true, translatable: false };
const sharedHomepageFields = [
  {
    slug: "shared_hero_image",
    label: "Shared hero image",
    ...imageField,
  },
  {
    slug: "shared_gallery_images",
    label: "Shared homepage gallery images",
    type: "repeater",
    required: true,
    translatable: false,
    validation: {
      minItems: 4,
      maxItems: 20,
      subFields: [{ slug: "image", label: "Image", type: "image", required: true }],
    },
  },
  {
    slug: "gallery_item_alts",
    label: "Gallery image descriptions",
    type: "repeater",
    required: true,
    translatable: true,
    validation: {
      minItems: 4,
      maxItems: 20,
      subFields: [{ slug: "alt", label: "Alt text", type: "string", required: true }],
    },
  },
];

const sharedEventFields = [
  { slug: "shared_starts_at", label: "Shared start date and time", type: "datetime", required: true, indexed: true, translatable: false },
  { slug: "shared_ends_at", label: "Shared end date and time", type: "datetime", translatable: false },
  {
    slug: "shared_event_state",
    label: "Shared event status",
    type: "select",
    required: true,
    indexed: true,
    translatable: false,
    validation: { options: ["scheduled", "postponed", "cancelled"] },
  },
  { slug: "shared_hero_image", label: "Shared event image", ...imageField },
  { slug: "shared_booking_url", label: "Shared booking URL", type: "url", translatable: false },
  { slug: "shared_fact_sources", label: "Shared fact sources", type: "text", required: true, translatable: false },
  { slug: "shared_facts_confirmed_at", label: "Shared facts confirmed at", type: "datetime", required: true, translatable: false },
];

const legacyFields = {
  homepage: ["hero_image", "gallery_items"],
  events: ["starts_at", "ends_at", "event_state", "hero_image", "booking_url", "fact_sources", "facts_confirmed_at"],
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

function validateArguments() {
  if (cleanupLegacy && !apply) throw new Error("--cleanup-legacy requires --apply");
  if (cleanupLegacy && !confirmLegacyCleanup) {
    throw new Error("--cleanup-legacy requires the separate --confirm-legacy-cleanup acknowledgement");
  }
  if (!apply) return;
  if (!backupArgument) throw new Error("--apply requires --backup=/absolute/path/to/pre-migration.db");
  if (!backupArgument.startsWith("/")) throw new Error("--backup must be an absolute path");
}

async function assertDatabaseExists() {
  const info = await stat(databaseFile).catch(() => null);
  if (!info?.isFile()) throw new Error(`EmDash database does not exist: ${databaseFile}`);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0 || value.trim() === "null";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function requiredText(value, description) {
  if (typeof value !== "string" || isBlank(value)) throw new Error(`${description} is missing or empty`);
  return value.trim();
}

function optionalText(value, description) {
  if (isBlank(value)) return undefined;
  if (typeof value !== "string") throw new Error(`${description} must be text or empty`);
  return value.trim();
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function sameValue(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function requireSame(values, description) {
  const first = values[0];
  if (values.some((value) => !sameValue(value, first))) {
    throw new Error(`${description} differs between language rows; stop for manual inspection`);
  }
  return first;
}

function normalizedMedia(value, description) {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim()) {
    throw new Error(`${description} must contain an EmDash media id`);
  }
  // Media alt is editorial copy and must not become a frozen common-language
  // value. The display uses localized titles/descriptions instead.
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "alt"));
}

function galleryFromLegacy(value, description) {
  if (!Array.isArray(value) || value.length < 4 || value.length > 20) {
    throw new Error(`${description} must contain 4–20 gallery rows`);
  }
  const images = [];
  const alts = [];
  for (const [index, row] of value.entries()) {
    if (!isRecord(row)) throw new Error(`${description}[${index}] is not a gallery row`);
    images.push({ image: normalizedMedia(row.image, `${description}[${index}].image`) });
    alts.push({ alt: requiredText(row.alt, `${description}[${index}].alt`) });
  }
  return { images, alts };
}

function sharedGalleryImages(value, description) {
  if (!Array.isArray(value) || value.length < 4 || value.length > 20) {
    throw new Error(`${description} must contain 4–20 gallery rows`);
  }
  return value.map((row, index) => {
    if (!isRecord(row)) throw new Error(`${description}[${index}] is not a gallery row`);
    return { image: normalizedMedia(row.image, `${description}[${index}].image`) };
  });
}

function sharedGalleryAlts(value, description) {
  if (!Array.isArray(value) || value.length < 4 || value.length > 20) {
    throw new Error(`${description} must contain 4–20 descriptions`);
  }
  return value.map((row, index) => {
    if (!isRecord(row)) throw new Error(`${description}[${index}] is not a description row`);
    return { alt: requiredText(row.alt, `${description}[${index}].alt`) };
  });
}

function eventFactsFromLegacy(row) {
  const prefix = `events/${row.slug ?? row.id}/${row.locale}`;
  const state = requiredText(row.data.event_state, `${prefix}/event_state`);
  if (!["scheduled", "postponed", "cancelled"].includes(state)) {
    throw new Error(`${prefix}/event_state has an unsupported value`);
  }
  return {
    shared_starts_at: requiredText(row.data.starts_at, `${prefix}/starts_at`),
    shared_ends_at: optionalText(row.data.ends_at, `${prefix}/ends_at`),
    shared_event_state: state,
    shared_hero_image: normalizedMedia(row.data.hero_image, `${prefix}/hero_image`),
    shared_booking_url: optionalText(row.data.booking_url, `${prefix}/booking_url`),
    shared_fact_sources: requiredText(row.data.fact_sources, `${prefix}/fact_sources`),
    shared_facts_confirmed_at: requiredText(row.data.facts_confirmed_at, `${prefix}/facts_confirmed_at`),
  };
}

function eventFactsFromShared(row) {
  const prefix = `events/${row.slug ?? row.id}/${row.locale}`;
  const values = [
    row.data.shared_starts_at,
    row.data.shared_ends_at,
    row.data.shared_event_state,
    row.data.shared_hero_image,
    row.data.shared_booking_url,
    row.data.shared_fact_sources,
    row.data.shared_facts_confirmed_at,
  ];
  if (values.every(isBlank)) return null;

  const state = requiredText(row.data.shared_event_state, `${prefix}/shared_event_state`);
  if (!["scheduled", "postponed", "cancelled"].includes(state)) {
    throw new Error(`${prefix}/shared_event_state has an unsupported value`);
  }
  return {
    shared_starts_at: requiredText(row.data.shared_starts_at, `${prefix}/shared_starts_at`),
    shared_ends_at: optionalText(row.data.shared_ends_at, `${prefix}/shared_ends_at`),
    shared_event_state: state,
    shared_hero_image: normalizedMedia(row.data.shared_hero_image, `${prefix}/shared_hero_image`),
    shared_booking_url: optionalText(row.data.shared_booking_url, `${prefix}/shared_booking_url`),
    shared_fact_sources: requiredText(row.data.shared_fact_sources, `${prefix}/shared_fact_sources`),
    shared_facts_confirmed_at: requiredText(row.data.shared_facts_confirmed_at, `${prefix}/shared_facts_confirmed_at`),
  };
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

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

function assertSqliteIntegrity(file) {
  const database = new BetterSqlite3(file, { readonly: true, fileMustExist: true });
  try {
    const result = database.pragma("integrity_check");
    const values = result.flatMap((row) => Object.values(row));
    if (!values.includes("ok")) throw new Error(`SQLite integrity check failed for ${file}`);
  } finally {
    database.close();
  }
}

async function rehearseRollback(backupFile) {
  const rollbackDirectory = await mkdtemp(join(tmpdir(), "margariteros-shared-fields-"));
  const restored = join(rollbackDirectory, "emdash.db");
  try {
    await copyFile(backupFile, restored);
    const [backupHash, restoredHash] = await Promise.all([sha256(backupFile), sha256(restored)]);
    if (backupHash !== restoredHash) throw new Error("Temporary rollback copy differs from the backup");
    assertSqliteIntegrity(restored);
    return { sha256: backupHash, rollbackRehearsal: "passed" };
  } finally {
    await rm(rollbackDirectory, { recursive: true, force: true });
  }
}

async function listAll(repository, collection) {
  const rows = [];
  let cursor;
  do {
    const page = await repository.findMany(collection, {
      limit: 100,
      cursor,
      orderBy: { field: "createdAt", direction: "asc" },
    });
    rows.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return rows;
}

function groupRows(rows, collection) {
  const byGroup = new Map();
  for (const row of rows) {
    if (!row.translationGroup) {
      throw new Error(`${collection}/${row.slug ?? row.id}/${row.locale} has no translation group`);
    }
    const group = byGroup.get(row.translationGroup) ?? [];
    group.push(row);
    byGroup.set(row.translationGroup, group);
  }

  return [...byGroup.entries()].map(([translationGroup, group]) => {
    const localeSet = new Set(group.map((row) => row.locale));
    if (localeSet.size !== locales.length || locales.some((locale) => !localeSet.has(locale))) {
      throw new Error(`${collection}/${translationGroup} must contain exactly ${locales.join(", ")}`);
    }
    if (group.some((row) => !row.slug) || new Set(group.map((row) => row.slug)).size !== 1) {
      throw new Error(`${collection}/${translationGroup} does not have one shared slug`);
    }
    return { translationGroup, slug: group[0].slug, rows: locales.map((locale) => group.find((row) => row.locale === locale)) };
  });
}

async function contentGroups(repository) {
  const [allHomepage, allEvents] = await Promise.all([
    listAll(repository, "homepage"),
    listAll(repository, "events"),
  ]);
  const homepage = allHomepage.filter((row) => row.slug === "main");
  if (homepage.length !== locales.length) {
    throw new Error(`homepage/main must have exactly ${locales.length} locale rows before this migration`);
  }
  const homepageGroups = groupRows(homepage, "homepage");
  if (homepageGroups.length !== 1) throw new Error("homepage/main must have one translation group");
  return { homepage: homepageGroups[0], events: groupRows(allEvents, "events") };
}

function assertField(field, definition, description) {
  if (!field) throw new Error(`${description} is missing`);
  if (field.type !== definition.type || field.required !== Boolean(definition.required)) {
    throw new Error(`${description} has incompatible type or required setting`);
  }
  if (field.translatable !== (definition.translatable !== false)) {
    throw new Error(`${description} has incompatible translation setting`);
  }
  if (Boolean(definition.indexed) !== Boolean(field.indexed)) {
    throw new Error(`${description} has incompatible index setting`);
  }
  if (definition.validation?.options) {
    if (!sameValue(field.validation?.options, definition.validation.options)) {
      throw new Error(`${description} has incompatible select options`);
    }
  }
  if (definition.validation?.subFields) {
    const actual = field.validation?.subFields;
    if (!Array.isArray(actual) || actual.length !== definition.validation.subFields.length) {
      throw new Error(`${description} has incompatible repeater fields`);
    }
    for (const expected of definition.validation.subFields) {
      const received = actual.find((item) => item.slug === expected.slug);
      if (!received || received.type !== expected.type || Boolean(received.required) !== Boolean(expected.required)) {
        throw new Error(`${description}.${expected.slug} has incompatible repeater field`);
      }
    }
  }
}

async function prepareSharedSchema(registry) {
  const report = [];
  for (const [collection, fields] of Object.entries({ homepage: sharedHomepageFields, events: sharedEventFields })) {
    for (const definition of fields) {
      const existing = await registry.getField(collection, definition.slug);
      if (existing) {
        assertField(existing, definition, `${collection}.${definition.slug}`);
        report.push({ field: `${collection}.${definition.slug}`, state: "present" });
      } else if (!apply) {
        report.push({ field: `${collection}.${definition.slug}`, state: "would-create" });
      } else {
        await registry.createField(collection, definition);
        const created = await registry.getField(collection, definition.slug);
        assertField(created, definition, `${collection}.${definition.slug}`);
        report.push({ field: `${collection}.${definition.slug}`, state: "created" });
      }
    }
  }
  return report;
}

async function assertLegacySchema(registry) {
  for (const [collection, fields] of Object.entries(legacyFields)) {
    for (const slug of fields) {
      const field = await registry.getField(collection, slug);
      if (!field) throw new Error(`${collection}.${slug} is missing; this bridge requires the pre-cleanup schema`);
      if (field.translatable !== true) throw new Error(`${collection}.${slug} must remain translatable until explicit cleanup`);
    }
  }
}

function localizedSnapshot(group, fields) {
  return new Map(group.rows.map((row) => [row.locale, Object.fromEntries(fields.map((field) => [field, row.data[field]]))]));
}

function homepagePlan(group) {
  const rows = group.rows;
  const legacyHero = requireSame(
    rows.map((row) => normalizedMedia(row.data.hero_image, `homepage/main/${row.locale}/hero_image`)),
    "homepage/main hero image",
  );
  const legacyGallery = rows.map((row) => galleryFromLegacy(row.data.gallery_items, `homepage/main/${row.locale}/gallery_items`));
  const legacyImages = requireSame(legacyGallery.map((gallery) => gallery.images), "homepage/main gallery images");

  const existingHero = rows.map((row) => isBlank(row.data.shared_hero_image)
    ? null
    : normalizedMedia(row.data.shared_hero_image, `homepage/main/${row.locale}/shared_hero_image`));
  const existingImages = rows.map((row) => isBlank(row.data.shared_gallery_images)
    ? null
    : sharedGalleryImages(row.data.shared_gallery_images, `homepage/main/${row.locale}/shared_gallery_images`));
  const existingAlts = rows.map((row) => isBlank(row.data.gallery_item_alts)
    ? null
    : sharedGalleryAlts(row.data.gallery_item_alts, `homepage/main/${row.locale}/gallery_item_alts`));

  function commonState(values, source, description) {
    if (values.every((value) => value === null)) return { state: "would-update", value: source };
    if (values.some((value) => value === null)) throw new Error(`${description} is only partly migrated; stop for manual inspection`);
    return { state: "present", value: requireSame(values, `${description} shared value`) };
  }

  function localState(values, source, description) {
    if (values.every((value) => value === null)) return { state: "would-update", value: source };
    if (values.some((value) => value === null)) throw new Error(`${description} is only partly migrated; stop for manual inspection`);
    return { state: "present", value: values };
  }

  return {
    hero: commonState(existingHero, legacyHero, "homepage/main shared hero image"),
    images: commonState(existingImages, legacyImages, "homepage/main shared gallery images"),
    alts: localState(existingAlts, legacyGallery.map((gallery) => gallery.alts), "homepage/main gallery descriptions"),
  };
}

function eventsPlan(group) {
  const rows = group.rows;
  const existing = rows.map(eventFactsFromShared);
  if (existing.every((value) => value === null)) {
    return { state: "would-update", facts: requireSame(rows.map(eventFactsFromLegacy), `events/${group.slug} common facts`) };
  }
  if (existing.some((value) => value === null)) {
    throw new Error(`events/${group.slug} has partly migrated shared facts; stop for manual inspection`);
  }
  return { state: "present", facts: requireSame(existing, `events/${group.slug} shared facts`) };
}

async function applyHomepagePlan(db, group, plan) {
  const rows = [];
  for (const [index, row] of group.rows.entries()) {
    const data = {
      ...(plan.hero.state === "would-update" ? { shared_hero_image: plan.hero.value } : {}),
      ...(plan.images.state === "would-update" ? { shared_gallery_images: plan.images.value } : {}),
      ...(plan.alts.state === "would-update" ? { gallery_item_alts: plan.alts.value[index] } : {}),
    };
    if (Object.keys(data).length === 0) {
      rows.push({ locale: row.locale, id: row.id, state: "unchanged" });
      continue;
    }
    if (!apply) {
      rows.push({ locale: row.locale, id: row.id, state: "would-update" });
      continue;
    }
    const result = await handleContentUpdate(db, "homepage", row.id, { data });
    if (!result.success) throw new Error(`homepage/main/${row.locale}: ${result.error.code}: ${result.error.message}`);
    rows.push({ locale: row.locale, id: row.id, state: "updated" });
  }
  return rows;
}

async function applyEventsPlan(db, groups, plans) {
  const report = [];
  for (const group of groups) {
    const plan = plans.get(group.translationGroup);
    const rows = [];
    for (const row of group.rows) {
      if (plan.state !== "would-update") {
        rows.push({ locale: row.locale, id: row.id, state: "unchanged" });
        continue;
      }
      if (!apply) {
        rows.push({ locale: row.locale, id: row.id, state: "would-update" });
        continue;
      }
      const result = await handleContentUpdate(db, "events", row.id, { data: plan.facts });
      if (!result.success) throw new Error(`events/${group.slug}/${row.locale}: ${result.error.code}: ${result.error.message}`);
      rows.push({ locale: row.locale, id: row.id, state: "updated" });
    }
    report.push({ slug: group.slug, translationGroup: group.translationGroup, state: plan.state, rows });
  }
  return report;
}

async function reloadGroups(repository) {
  return contentGroups(repository);
}

function assertLocalizedSnapshot(group, snapshot, description) {
  for (const row of group.rows) {
    const before = snapshot.get(row.locale);
    if (!before || !sameValue(before, Object.fromEntries(Object.keys(before).map((field) => [field, row.data[field]])))) {
      throw new Error(`${description}/${row.locale} localized copy changed unexpectedly`);
    }
  }
}

function assertSharedReadback(groups, homepageSnapshot, eventSnapshots) {
  const homepage = homepagePlan(groups.homepage);
  if (homepage.hero.state !== "present" || homepage.images.state !== "present" || homepage.alts.state !== "present") {
    throw new Error("homepage/main shared-field readback is incomplete");
  }
  assertLocalizedSnapshot(groups.homepage, homepageSnapshot, "homepage/main");

  for (const group of groups.events) {
    const plan = eventsPlan(group);
    if (plan.state !== "present") throw new Error(`events/${group.slug} shared-field readback is incomplete`);
    assertLocalizedSnapshot(group, eventSnapshots.get(group.translationGroup), `events/${group.slug}`);
  }
}

function assertLegacyMatchesShared(groups) {
  const homepage = homepagePlan(groups.homepage);
  const rows = groups.homepage.rows;
  for (const [index, row] of rows.entries()) {
    const legacy = galleryFromLegacy(row.data.gallery_items, `homepage/main/${row.locale}/gallery_items`);
    if (!sameValue(normalizedMedia(row.data.hero_image, `homepage/main/${row.locale}/hero_image`), homepage.hero.value)
      || !sameValue(legacy.images, homepage.images.value)
      || !sameValue(legacy.alts, homepage.alts.value[index])) {
      throw new Error(`homepage/main/${row.locale} legacy data no longer matches shared fields; do not delete it`);
    }
  }
  for (const group of groups.events) {
    const shared = eventsPlan(group).facts;
    for (const row of group.rows) {
      if (!sameValue(eventFactsFromLegacy(row), shared)) {
        throw new Error(`events/${group.slug}/${row.locale} legacy data no longer matches shared fields; do not delete it`);
      }
    }
  }
}

async function setSharedDateField(registry) {
  const collection = await registry.getCollection("events");
  if (!collection) throw new Error("events collection is missing");
  if (collection.dateField !== "shared_starts_at") {
    await registry.updateCollection("events", { dateField: "shared_starts_at" });
  }
  const readback = await registry.getCollection("events");
  if (readback?.dateField !== "shared_starts_at") throw new Error("events.dateField readback failed");
  return { before: collection.dateField ?? null, after: readback.dateField };
}

async function deleteLegacyFields(registry) {
  const removed = [];
  for (const [collection, fields] of Object.entries(legacyFields)) {
    for (const slug of fields) {
      await registry.deleteField(collection, slug);
      if (await registry.getField(collection, slug)) throw new Error(`${collection}.${slug} deletion readback failed`);
      removed.push(`${collection}.${slug}`);
    }
  }
  return removed;
}

validateArguments();
await assertDatabaseExists();

const backup = apply ? await createBackup(backupArgument) : null;
const backupProof = backup ? await rehearseRollback(backup) : null;
const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

try {
  const repository = new ContentRepository(db);
  const registry = new SchemaRegistry(db);
  const before = await contentGroups(repository);
  await assertLegacySchema(registry);
  const homepageBefore = localizedSnapshot(before.homepage, [
    "hero_eyebrow", "hero_title", "hero_text", "hero_image_alt", "primary_cta_label", "secondary_cta_label", "gallery_heading",
  ]);
  const eventsBefore = new Map(before.events.map((group) => [
    group.translationGroup,
    localizedSnapshot(group, ["title", "summary", "details"]),
  ]));
  const homepageMigration = homepagePlan(before.homepage);
  const eventMigrations = new Map(before.events.map((group) => [group.translationGroup, eventsPlan(group)]));
  const schema = await prepareSharedSchema(registry);

  if (!apply) {
    const eventReport = before.events.map((group) => ({
      slug: group.slug,
      translationGroup: group.translationGroup,
      state: eventMigrations.get(group.translationGroup).state,
      locales,
    }));
    console.log(JSON.stringify({
      mode: "dry-run",
      database: databaseFile,
      schema,
      homepage: { translationGroup: before.homepage.translationGroup, hero: homepageMigration.hero.state, images: homepageMigration.images.state, descriptions: homepageMigration.alts.state, locales },
      events: eventReport,
      next: "Pause writes, review this report, then run --apply with a new absolute --backup path.",
    }, null, 2));
  } else {
    const homepage = await applyHomepagePlan(db, before.homepage, homepageMigration);
    const events = await applyEventsPlan(db, before.events, eventMigrations);
    const after = await reloadGroups(repository);
    assertSharedReadback(after, homepageBefore, eventsBefore);
    const dateField = await setSharedDateField(registry);

    let removed = [];
    if (cleanupLegacy) {
      // The destructive step has its own explicit flag, fresh backup and
      // parity check. If an editor changed a legacy field, deletion refuses.
      assertLegacyMatchesShared(after);
      removed = await deleteLegacyFields(registry);
    }

    console.log(JSON.stringify({
      mode: cleanupLegacy ? "cleanup-legacy" : "apply",
      database: databaseFile,
      backup: { path: backup, ...backupProof },
      schema,
      homepage: { translationGroup: after.homepage.translationGroup, rows: homepage },
      events,
      dateField,
      removed,
      verified: { locales, homepageGroups: 1, eventGroups: after.events.length },
    }, null, 2));
  }
} finally {
  await db.destroy();
}
