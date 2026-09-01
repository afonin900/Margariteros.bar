import { access } from "node:fs/promises";
import Database from "better-sqlite3";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import {
  ContentRepository,
  MediaRepository,
  SchemaRegistry,
  handleContentCreate,
  handleContentUpdate,
} from "emdash";

const apply = process.argv.includes("--apply");
const backupArg = process.argv.find((arg) => arg.startsWith("--backup="));
const backupPath = backupArg?.slice("--backup=".length);
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const locales = ["pl", "en", "ru", "es"];
const source = "Google Calendar Margariteros, read back 2026-09-01";
const confirmedAt = "2026-09-01T16:15:00+02:00";
const bookingUrl = "https://qr.margariteros.bar/booking";

const textBlock = (text) => [{
  _type: "block",
  style: "normal",
  children: [{ _type: "span", text, marks: [] }],
  markDefs: [],
}];

const events = [
  ["dj-kike-2026-09-04", "2026-09-04T21:00:00+02:00", "2026-09-05T02:00:00+02:00", "DJ Kike", "music"],
  ["lerola-ansambl-2026-09-05", "2026-09-05T21:00:00+02:00", "2026-09-06T00:00:00+02:00", "Lerola ansambl", "dance"],
  ["dj-kike-2026-09-11", "2026-09-11T21:00:00+02:00", "2026-09-12T02:00:00+02:00", "DJ Kike", "music"],
  ["after-party-dni-meksyku-2026-09-12", "2026-09-12T21:30:00+02:00", "2026-09-13T07:00:00+02:00", "After party po Dniach Meksyku", "dance"],
  ["dzien-niepodleglosci-meksyku-2026-09-15", "2026-09-15T20:30:00+02:00", "2026-09-16T04:00:00+02:00", "Dzień Niepodległości Meksyku", "dance"],
  ["dj-ibiza-2026-09-18", "2026-09-18T21:00:00+02:00", "2026-09-19T02:00:00+02:00", "DJ Ibiza", "music"],
  ["dj-lsd-dorota-2026-09-19", "2026-09-19T21:00:00+02:00", "2026-09-20T03:00:00+02:00", "DJ LSD (DOROTA)", "dance"],
  ["dj-kike-2026-09-25", "2026-09-25T21:00:00+02:00", "2026-09-26T02:00:00+02:00", "DJ Kike", "music"],
  ["dj-dragon-2026-09-26", "2026-09-26T21:00:00+02:00", "2026-09-27T02:00:00+02:00", "Dj Dragon", "dance"],
].map(([slug, startsAt, endsAt, title, imageKey]) => ({ slug, startsAt, endsAt, title, imageKey }));

const localizedCopy = (event, locale) => {
  const day = new Intl.DateTimeFormat(locale, { timeZone: "Europe/Warsaw", day: "numeric", month: "long" }).format(new Date(event.startsAt));
  const summaries = {
    pl: `Wydarzenie: ${event.title}.`,
    en: `Event: ${event.title}.`,
    ru: `Событие: ${event.title}.`,
    es: `Evento: ${event.title}.`,
  };
  const details = {
    pl: `${day}. Sprawdź godzinę wydarzenia i zarezerwuj stolik.`,
    en: `${day}. Check the event time and book a table.`,
    ru: `${day}. Проверьте время события и забронируйте столик.`,
    es: `${day}. Consulta la hora del evento y reserva una mesa.`,
  };
  return { title: event.title, summary: summaries[locale], details: textBlock(details[locale]) };
};

async function listAll(repository) {
  const rows = [];
  let cursor;
  do {
    const page = await repository.findMany("events", { limit: 100, cursor, orderBy: { field: "createdAt", direction: "asc" } });
    rows.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return rows;
}

async function makeBackup() {
  if (!apply) return null;
  if (!backupPath) throw new Error("--apply requires --backup=/absolute/path/emdash-before-september-events.db");
  if (!backupPath.startsWith("/")) throw new Error("backup path must be absolute");
  const sqlite = new Database(databasePath, { readonly: true });
  try {
    await sqlite.backup(backupPath);
  } finally {
    sqlite.close();
  }
  await access(backupPath);
  return backupPath;
}

const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

try {
  const registry = new SchemaRegistry(db);
  const schema = await registry.getCollection("events");
  if (!schema || schema.dateField !== "shared_starts_at") throw new Error("events shared date field is not active");
  const requiredShared = ["shared_starts_at", "shared_ends_at", "shared_event_state", "shared_hero_image", "shared_booking_url", "shared_fact_sources", "shared_facts_confirmed_at"];
  for (const field of requiredShared) {
    const definition = await registry.getField("events", field);
    if (!definition || definition.translatable !== false) throw new Error(`events.${field} shared field is missing`);
  }

  const content = new ContentRepository(db);
  const media = new MediaRepository(db);
  const eventImage = await media.findByFilename("test-event-dance.webp");
  const images = {
    music: eventImage,
    dance: eventImage,
  };
  if (!images.music || !images.dance) throw new Error("existing Emdash event images are missing");
  const imageValue = (item) => ({ id: item.id, provider: "local", src: item.storageKey, filename: item.filename, mimeType: item.mimeType, width: item.width, height: item.height, alt: "Margariteros event", meta: { storageKey: item.storageKey } });

  const before = await listAll(content);
  const plans = [];
  for (const event of events) {
    const existing = before.filter((row) => row.slug === event.slug);
    if (existing.length && (existing.length !== locales.length || locales.some((locale) => !existing.some((row) => row.locale === locale)))) {
      throw new Error(`${event.slug} has an incomplete translation group`);
    }
    plans.push({ slug: event.slug, state: existing.length ? "would-update" : "would-create", statuses: existing.map((row) => `${row.locale}:${row.status}`) });
  }

  const backup = await makeBackup();
  if (apply) {
    for (const event of events) {
      const shared = {
        shared_starts_at: event.startsAt,
        shared_ends_at: event.endsAt,
        shared_event_state: "scheduled",
        shared_hero_image: imageValue(images[event.imageKey]),
        shared_booking_url: bookingUrl,
        shared_fact_sources: source,
        shared_facts_confirmed_at: confirmedAt,
      };
      const existing = (await listAll(content)).filter((row) => row.slug === event.slug);
      if (existing.length) {
        const anchor = existing.find((row) => row.locale === "pl");
        const result = await handleContentUpdate(db, "events", anchor.id, { data: { ...shared, ...localizedCopy(event, "pl") } });
        if (!result.success) throw new Error(`${event.slug}/pl update failed: ${result.error.message}`);
        for (const row of existing.filter((item) => item.locale !== "pl")) {
          const update = await handleContentUpdate(db, "events", row.id, { data: localizedCopy(event, row.locale) });
          if (!update.success) throw new Error(`${event.slug}/${row.locale} update failed: ${update.error.message}`);
        }
      } else {
        let anchorId;
        for (const locale of locales) {
          const created = await handleContentCreate(db, "events", {
            slug: event.slug,
            locale,
            translationOf: locale === "pl" ? undefined : anchorId,
            status: "draft",
            data: { ...shared, ...localizedCopy(event, locale), legacy_path: `google-calendar/${event.slug}${locale === "pl" ? "" : `#${locale}`}` },
          });
          if (!created.success) throw new Error(`${event.slug}/${locale} create failed: ${created.error.message}`);
          if (locale === "pl") anchorId = created.data.item.id;
        }
      }
    }
  }

  const after = await listAll(content);
  const readback = events.map((event) => ({
    slug: event.slug,
    rows: locales.map((locale) => {
      const row = after.find((item) => item.slug === event.slug && item.locale === locale);
      return row ? { id: row.id, locale, status: row.status, startsAt: row.data.shared_starts_at, endsAt: row.data.shared_ends_at, title: row.data.title } : { locale, status: "missing" };
    }),
  }));
  if (apply && readback.some((group) => group.rows.some((row) => row.status === "missing"))) throw new Error("readback is incomplete");
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", backup, source, plans, readback }, null, 2));
} finally {
  await db.destroy();
}
