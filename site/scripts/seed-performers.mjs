import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import { ContentRepository, MediaRepository, SchemaRegistry, handleContentCreate, handleContentPublish, handleContentUpdate } from "emdash";

const apply = process.argv.includes("--apply");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const uploadsPath = process.env.EMDASH_UPLOADS_PATH ?? "/app/data/uploads";
const sourcePath = process.env.EMDASH_PERFORMER_SOURCE_PATH ?? "/app/data/import-performers";
const locales = ["pl", "en", "ru", "es"];
const profiles = [
  { slug: "dj-kike", name: "DJ Kike", image: ["dj-kike.jpg", 562, 1280], bio: { pl: "DJ występujący podczas wydarzeń w Margariteros w Warszawie.", en: "A DJ performing at Margariteros events in Warsaw.", ru: "Диджей, выступающий на мероприятиях Margariteros в Варшаве.", es: "DJ que actúa en eventos de Margariteros en Varsovia." }, events: ["dj-kike-2026-09-04", "dj-kike-2026-09-11", "dj-kike-2026-09-25"] },
  { slug: "dj-dragon", name: "DJ Dragón", image: ["dj-dragon.jpg", 1080, 1440], bio: { pl: "DJ grający salsę, champetę, reggaeton, bachatę i merengue.", en: "A DJ playing salsa, champeta, reggaeton, bachata and merengue.", ru: "Диджей, играющий сальсу, чампету, реггетон, бачату и меренге.", es: "DJ de salsa, champeta, reguetón, bachata y merengue." }, events: ["dj-dragon-2026-09-26"] },
  { slug: "dj-joyland", name: "DJ Joyland", image: ["dj-joyland.jpg", 854, 1280], instagram_url: "https://www.instagram.com/8fhomestudio/", bio: { pl: "DJ związany z muzyką latino i kubańskim klimatem.", en: "A DJ connected with Latin music and Cuban atmosphere.", ru: "Диджей с латиноамериканской музыкой и кубинской атмосферой.", es: "DJ vinculado a la música latina y al ambiente cubano." }, events: [] },
  { slug: "lerolera", name: "LeroLera", image: ["lerolera.jpg", 2560, 1697], instagram_url: "https://www.instagram.com/leroleraband/", bio: { pl: "Cover band grający popularne utwory w różnych stylach: pop i trochę rocka. W repertuarze ma m.in. George'a Michaela, Chrisa Isaaka, Katy Perry, Paramore i Michaela Jacksona.", en: "A cover band playing popular songs across styles, mainly pop with some rock. Their repertoire includes George Michael, Chris Isaak, Katy Perry, Paramore and Michael Jackson.", ru: "Кавер-группа, исполняющая популярные песни разных стилей: в основном поп и немного рока. В репертуаре — George Michael, Chris Isaak, Katy Perry, Paramore и Michael Jackson.", es: "Banda de versiones de canciones populares, principalmente pop y algo de rock. Su repertorio incluye a George Michael, Chris Isaak, Katy Perry, Paramore y Michael Jackson." }, events: ["lerola-ansambl-2026-09-05"] },
];

const db = new Kysely({ dialect: createDialect({ url: databasePath }) });
const content = new ContentRepository(db);
const media = new MediaRepository(db);

async function ensureMedia(profile) {
  const [filename, width, height] = profile.image;
  const storedName = `performer-${filename}`;
  const existing = await media.findByFilename(storedName);
  if (existing) return existing;
  if (!apply) return null;
  const source = `${sourcePath}/${filename}`;
  const bytes = await readFile(source);
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const duplicate = await media.findByContentHash(contentHash);
  if (duplicate) return duplicate;
  const storageKey = `performers/${storedName}`;
  await mkdir(`${uploadsPath}/performers`, { recursive: true });
  await copyFile(source, `${uploadsPath}/${storageKey}`);
  const info = await stat(source);
  return media.create({ filename: storedName, mimeType: "image/jpeg", size: info.size, width, height, alt: profile.name, storageKey, contentHash, status: "ready" });
}

function imageValue(item) {
  return item && { id: item.id, provider: "local", src: item.storageKey, filename: item.filename, mimeType: item.mimeType, width: item.width, height: item.height, alt: item.alt, meta: { storageKey: item.storageKey } };
}

async function publish(id) {
  const result = await handleContentPublish(db, "performers", id);
  if (!result.success) throw new Error(`publish performer ${id}: ${result.error.message}`);
}

async function upsertProfile(profile) {
  const photo = await ensureMedia(profile);
  let anchor;
  const report = [];
  for (const locale of locales) {
    const existing = await content.findByIdOrSlug("performers", profile.slug, locale);
    const data = { name: profile.name, bio: profile.bio[locale], active: true, ...(photo ? { main_photo: imageValue(photo) } : {}), ...(profile.instagram_url ? { instagram_url: profile.instagram_url } : {}) };
    if (!apply) { report.push({ locale, state: existing ? "would-update" : "would-create" }); if (locale === "pl") anchor = existing; continue; }
    if (existing) {
      const updated = await handleContentUpdate(db, "performers", existing.id, { data });
      if (!updated.success) throw new Error(`${profile.slug}/${locale}: ${updated.error.message}`);
      if (existing.status !== "published") await publish(existing.id);
      if (locale === "pl") anchor = existing;
      report.push({ locale, state: "updated", id: existing.id });
    } else {
      const created = await handleContentCreate(db, "performers", { slug: profile.slug, locale, translationOf: locale === "pl" ? undefined : anchor.id, status: "draft", data });
      if (!created.success) throw new Error(`${profile.slug}/${locale}: ${created.error.message}`);
      await publish(created.data.item.id);
      if (locale === "pl") anchor = created.data.item;
      report.push({ locale, state: "created", id: created.data.item.id });
    }
  }
  return { anchor, report };
}

async function linkEvents(profile, performerId, performerPhoto) {
  const report = [];
  for (const slug of profile.events) {
    const event = await content.findByIdOrSlug("events", slug, "pl");
    if (!event) { report.push({ slug, state: "missing" }); continue; }
    if (apply) {
      const result = await handleContentUpdate(db, "events", event.id, {
        data: {
          primary_performer: performerId,
          ...(performerPhoto ? { shared_hero_image: performerPhoto } : {}),
        },
      });
      if (!result.success) throw new Error(`${slug}: ${result.error.message}`);
    }
    report.push({ slug, state: apply ? "linked" : "would-link" });
  }
  return report;
}

try {
  const registry = new SchemaRegistry(db);
  if (!await registry.getCollection("performers")) throw new Error("performers schema is missing");
  const output = [];
  for (const profile of profiles) {
    const result = await upsertProfile(profile);
    const events = result.anchor?.id
      ? await linkEvents(profile, result.anchor.id, result.anchor.data.main_photo)
      : profile.events.map((slug) => ({ slug, state: "would-link" }));
    output.push({ slug: profile.slug, rows: result.report, events });
  }
  const readback = [];
  for (const profile of profiles) {
    const rows = [];
    for (const locale of locales) {
      const row = await content.findByIdOrSlug("performers", profile.slug, locale);
      rows.push(row ? { locale, id: row.id, status: row.status, name: row.data.name, photo: Boolean(row.data.main_photo), instagram: row.data.instagram_url ?? null } : { locale, status: "missing" });
    }
    readback.push({ slug: profile.slug, rows });
  }
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", profiles: output, readback }, null, 2));
} finally {
  await db.destroy();
}
