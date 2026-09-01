import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import BetterSqlite3 from "better-sqlite3";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import {
  ContentRepository,
  MediaRepository,
  SchemaRegistry,
  handleContentUpdate,
} from "emdash";

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const databaseFile = resolve(databasePath.startsWith("file:") ? databasePath.slice(5) : databasePath);
const uploadsPath = process.env.EMDASH_UPLOADS_PATH ?? "/app/data/uploads";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultPublicPath = existsSync("/app/dist/client/media/gallery")
  ? "/app/dist/client"
  : resolve(scriptDirectory, "../public");
const publicPath = process.env.EMDASH_PUBLIC_PATH ?? defaultPublicPath;
const backupArgument = optionValue("--backup");
const locales = ["pl", "en", "ru", "es"];

const galleryField = {
  slug: "gallery_items",
  label: "Homepage gallery",
  type: "repeater",
  required: true,
  validation: {
    minItems: 4,
    maxItems: 20,
    subFields: [
      { slug: "image", label: "Image", type: "image", required: true },
      { slug: "alt", label: "Alt text", type: "string", required: true },
    ],
  },
};

const gallerySequence = [
  "dance-floor",
  "live-music",
  "food-tacos-wall",
  "terrace",
  "interior-seating",
  "food-tacos-wall",
  "interior-wall",
  "dance-floor",
  "food-tacos-wall",
  "interior-seating",
  "live-music",
  "interior-wall",
  "terrace",
  "dance-floor",
  "interior-wall",
  "food-tacos-wall",
  "live-music",
  "terrace",
  "food-tacos-wall",
  "interior-seating",
];

const galleryAlt = {
  pl: {
    dance: "Goście tańczą we wnętrzu Margariteros",
    music: "Muzyka na żywo w Margariteros",
    interior: "Wnętrze Margariteros",
    food: "Dania podane w Margariteros",
    terrace: "Taras Margariteros przy Chmielnej",
  },
  en: {
    dance: "Guests dancing inside Margariteros",
    music: "Live music at Margariteros",
    interior: "The interior of Margariteros",
    food: "Food served at Margariteros",
    terrace: "The Margariteros terrace on Chmielna",
  },
  ru: {
    dance: "Гости танцуют в Margariteros",
    music: "Живая музыка в Margariteros",
    interior: "Интерьер Margariteros",
    food: "Блюда в Margariteros",
    terrace: "Терраса Margariteros на Хмельной",
  },
  es: {
    dance: "Personas bailando dentro de Margariteros",
    music: "Música en vivo en Margariteros",
    interior: "El interior de Margariteros",
    food: "Platos servidos en Margariteros",
    terrace: "La terraza de Margariteros en Chmielna",
  },
};

const assetAltKey = {
  "dance-floor": "dance",
  "live-music": "music",
  "food-tacos-wall": "food",
  terrace: "terrace",
  "interior-seating": "interior",
  "interior-wall": "interior",
};

function optionValue(name) {
  const equalsPrefix = `${name}=`;
  const equals = argv.find((argument) => argument.startsWith(equalsPrefix));
  if (equals) return equals.slice(equalsPrefix.length);

  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} needs an absolute destination path`);
  return value;
}

function validateArguments() {
  if (!apply) return;
  if (!backupArgument) throw new Error("--apply requires --backup=/absolute/path/to/pre-migration.db");
  if (!backupArgument.startsWith("/")) throw new Error("--backup must be an absolute path");
}

async function assertDatabaseExists() {
  const info = await stat(databaseFile).catch(() => null);
  if (!info?.isFile()) throw new Error(`EmDash database does not exist: ${databaseFile}`);
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

  const result = await stat(backupFile).catch(() => null);
  if (!result?.isFile() || result.size === 0) throw new Error(`SQLite backup was not created: ${backupFile}`);
  return backupFile;
}

function sourcePath(asset) {
  const root = resolve(publicPath);
  const candidate = resolve(root, "media", "gallery", `${asset}-400.webp`);
  if (!candidate.startsWith(`${root}/`)) throw new Error(`Gallery source escaped public path: ${asset}`);
  return candidate;
}

function storedPath(storageKey) {
  const root = resolve(uploadsPath);
  const candidate = resolve(root, storageKey);
  if (!candidate.startsWith(`${root}/`)) throw new Error(`Existing media escaped upload path: ${storageKey}`);
  return candidate;
}

async function loadSourceAssets() {
  const assets = new Map();
  for (const asset of [...new Set(gallerySequence)]) {
    const filename = `${asset}-400.webp`;
    const path = sourcePath(asset);
    const bytes = await readFile(path).catch(() => null);
    if (!bytes) throw new Error(`Gallery source image is missing: ${path}`);
    const file = await stat(path);
    assets.set(asset, {
      asset,
      sourcePath: path,
      sourceFilename: filename,
      size: file.size,
      bytes,
      contentHash: createHash("sha256").update(bytes).digest("hex"),
      filename: `homepage-gallery-${asset}.webp`,
      storageKey: `seed/homepage-gallery-${asset}.webp`,
    });
  }
  return assets;
}

function assertGalleryField(field) {
  if (!field || field.type !== galleryField.type || field.required !== true) {
    throw new Error("homepage.gallery_items exists with an incompatible type or required setting");
  }

  const validation = field.validation;
  const subFields = validation?.subFields;
  const image = subFields?.find((subField) => subField.slug === "image");
  const alt = subFields?.find((subField) => subField.slug === "alt");
  if (
    validation?.minItems !== galleryField.validation.minItems
    || validation?.maxItems !== galleryField.validation.maxItems
    || image?.type !== "image"
    || image.required !== true
    || alt?.type !== "string"
    || alt.required !== true
  ) {
    throw new Error("homepage.gallery_items exists with an incompatible validation or sub-field shape");
  }
}

async function prepareSchema(registry) {
  const existing = await registry.getField("homepage", galleryField.slug);
  if (existing) {
    assertGalleryField(existing);
    return "present";
  }
  if (!apply) return "would-create";

  await registry.createField("homepage", galleryField);
  const created = await registry.getField("homepage", galleryField.slug);
  assertGalleryField(created);
  return "created";
}

async function homepageRows(repository) {
  const rows = await Promise.all(locales.map((locale) => repository.findBySlug("homepage", "main", locale)));
  const missing = locales.filter((_, index) => !rows[index]);
  if (missing.length > 0) throw new Error(`homepage/main is missing locale rows: ${missing.join(", ")}`);

  const present = rows;
  const groups = new Set(present.map((row) => row.translationGroup));
  if (groups.size !== 1 || groups.has(null)) {
    throw new Error("homepage/main locale rows do not share one non-empty translation_group");
  }
  return present;
}

function imageValue(media, alt) {
  return {
    id: media.id,
    provider: "local",
    src: media.storageKey,
    filename: media.filename,
    mimeType: media.mimeType,
    width: media.width ?? 400,
    height: media.height ?? 400,
    alt,
    meta: { storageKey: media.storageKey },
  };
}

function expectedGallery(locale, mediaByAsset) {
  return gallerySequence.map((asset) => {
    const altKey = assetAltKey[asset];
    const alt = galleryAlt[locale][altKey];
    return { image: imageValue(mediaByAsset.get(asset), alt), alt };
  });
}

function galleryRows(value) {
  return Array.isArray(value) ? value : [];
}

function galleryImageIds(value) {
  return galleryRows(value).map((row) => row?.image?.id ?? null);
}

function galleryIsComplete(value) {
  const rows = galleryRows(value);
  return rows.length === gallerySequence.length
    && rows.every((row) => row && typeof row === "object" && row.image && typeof row.image.id === "string" && typeof row.alt === "string" && row.alt.trim());
}

function assertExistingGalleryGroup(rows) {
  if (!rows.every((row) => galleryIsComplete(row.data.gallery_items))) {
    throw new Error("homepage/main has a partial or incomplete gallery_items group; stop for manual inspection");
  }

  const expectedIds = JSON.stringify(galleryImageIds(rows[0].data.gallery_items));
  for (const row of rows.slice(1)) {
    if (JSON.stringify(galleryImageIds(row.data.gallery_items)) !== expectedIds) {
      throw new Error(`homepage/main/${row.locale} has a different gallery image order`);
    }
  }
}

async function ensureMedia(repository, assetInfo) {
  const byHash = await repository.findByContentHash(assetInfo.contentHash);
  if (byHash) {
    if (byHash.status !== "ready") throw new Error(`${assetInfo.filename} points to media that is not ready`);
    return { media: byHash, state: "existing-by-hash" };
  }

  const byFilename = await repository.findByFilename(assetInfo.filename);
  if (byFilename) {
    if (byFilename.status !== "ready") throw new Error(`${assetInfo.filename} points to media that is not ready`);
    if (byFilename.contentHash && byFilename.contentHash !== assetInfo.contentHash) {
      throw new Error(`${assetInfo.filename} exists with a different content hash`);
    }
    if (!byFilename.contentHash) {
      const existingPath = storedPath(byFilename.storageKey);
      const existingBytes = await readFile(existingPath).catch(() => null);
      if (!existingBytes || createHash("sha256").update(existingBytes).digest("hex") !== assetInfo.contentHash) {
        throw new Error(`${assetInfo.filename} exists without a matching content hash or file`);
      }
    }
    return { media: byFilename, state: "existing-by-filename" };
  }

  if (!apply) return { media: null, state: "would-create" };

  const target = storedPath(assetInfo.storageKey);
  await mkdir(dirname(target), { recursive: true });
  const existingBytes = await readFile(target).catch(() => null);
  if (existingBytes) {
    const existingHash = createHash("sha256").update(existingBytes).digest("hex");
    if (existingHash !== assetInfo.contentHash) throw new Error(`${target} exists with a different content hash`);
  } else {
    await copyFile(assetInfo.sourcePath, target);
  }

  const media = await repository.create({
    filename: assetInfo.filename,
    mimeType: "image/webp",
    size: assetInfo.size,
    width: 400,
    height: 400,
    alt: "Margariteros gallery image",
    storageKey: assetInfo.storageKey,
    contentHash: assetInfo.contentHash,
    status: "ready",
  });
  const stored = await stat(target).catch(() => null);
  if (!stored?.isFile() || stored.size !== assetInfo.size) throw new Error(`${target} readback failed`);
  return { media, state: "created" };
}

async function updateHomepageGallery(db, rows, mediaByAsset) {
  const present = rows.map((row) => row.data.gallery_items);
  if (present.every(galleryIsComplete)) {
    assertExistingGalleryGroup(rows);
    return { state: "already-present", rows: rows.map((row) => ({ locale: row.locale, id: row.id, state: "unchanged" })) };
  }
  if (present.some((value) => galleryRows(value).length > 0)) {
    throw new Error("homepage/main has mixed or partial gallery_items values; stop for manual inspection");
  }

  const report = [];
  for (const row of rows) {
    const data = { gallery_items: expectedGallery(row.locale, mediaByAsset) };
    if (!apply) {
      report.push({ locale: row.locale, id: row.id, state: "would-update", items: data.gallery_items.length });
      continue;
    }

    const result = await handleContentUpdate(db, "homepage", row.id, { data });
    if (!result.success) throw new Error(`homepage/main/${row.locale}: ${result.error.code}: ${result.error.message}`);
    report.push({ locale: row.locale, id: row.id, state: "updated", items: data.gallery_items.length });
  }
  return { state: apply ? "updated" : "would-update", rows: report };
}

async function assertGalleryReadback(repository, mediaByAsset, expectedByLocale) {
  const rows = await homepageRows(repository);
  assertExistingGalleryGroup(rows);

  const expectedIds = JSON.stringify(gallerySequence.map((asset) => mediaByAsset.get(asset).id));
  const issues = [];
  for (const row of rows) {
    const actual = row.data.gallery_items;
    const expected = expectedByLocale.get(row.locale);
    if (!expected || JSON.stringify(galleryImageIds(actual)) !== expectedIds) {
      issues.push(`${row.locale}: image order or identity differs`);
      continue;
    }
    if (JSON.stringify(actual) !== JSON.stringify(expected)) issues.push(`${row.locale}: gallery_items data differs`);
  }
  if (issues.length > 0) throw new Error(`Homepage gallery readback failed:\n- ${issues.join("\n- ")}`);
  return rows;
}

validateArguments();
await assertDatabaseExists();
const backup = apply ? await createBackup(backupArgument) : null;
const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

try {
  const repository = new ContentRepository(db);
  const mediaRepository = new MediaRepository(db);
  const registry = new SchemaRegistry(db);
  const sourceAssets = await loadSourceAssets();
  const rows = await homepageRows(repository);
  const schema = await prepareSchema(registry);
  const mediaReport = [];
  const mediaByAsset = new Map();

  for (const [asset, assetInfo] of sourceAssets) {
    const result = await ensureMedia(mediaRepository, assetInfo);
    mediaReport.push({ asset, filename: assetInfo.filename, state: result.state, id: result.media?.id ?? null });
    if (result.media) mediaByAsset.set(asset, result.media);
  }

  if (!apply) {
    const existing = rows.every((row) => galleryIsComplete(row.data.gallery_items));
    const update = existing
      ? { state: "already-present", rows: rows.map((row) => ({ locale: row.locale, id: row.id, state: "unchanged" })) }
      : { state: "would-update", rows: rows.map((row) => ({ locale: row.locale, id: row.id, state: "would-update", items: 20 })) };
    console.log(JSON.stringify({ mode: "dry-run", database: databaseFile, publicPath, schema, sourceAssets: sourceAssets.size, media: mediaReport, homepage: update, next: "Run --apply --backup=/absolute/path/to/pre-migration.db after reviewing this report." }, null, 2));
  } else {
    if (mediaByAsset.size !== sourceAssets.size) throw new Error("Media import did not produce every gallery asset");
    const update = await updateHomepageGallery(db, rows, mediaByAsset);
    const expectedByLocale = new Map(locales.map((locale) => [locale, expectedGallery(locale, mediaByAsset)]));
    const readback = await assertGalleryReadback(repository, mediaByAsset, expectedByLocale);
    console.log(JSON.stringify({ mode: "apply", database: databaseFile, backup, schema, sourceAssets: sourceAssets.size, media: mediaReport, homepage: update, verified: { translationGroup: readback[0].translationGroup, locales: readback.map((row) => row.locale), items: 20 } }, null, 2));
  }
} finally {
  await db.destroy();
}
