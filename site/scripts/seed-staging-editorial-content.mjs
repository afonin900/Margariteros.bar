import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import {
  ContentRepository,
  MediaRepository,
  handleContentCreate,
  handleContentGet,
  handleContentPublish,
} from "emdash";

const apply = process.argv.includes("--apply");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const uploadsPath = process.env.EMDASH_UPLOADS_PATH ?? "/app/data/uploads";
const publicPath = process.env.EMDASH_PUBLIC_PATH ?? "/app/dist/client";

const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

const textBlock = (text) => [{
  _type: "block",
  style: "normal",
  children: [{ _type: "span", text, marks: [] }],
  markDefs: [],
}];

async function media(filename, sourceName, alt) {
  const repository = new MediaRepository(db);
  const existing = await repository.findByFilename(filename);
  if (existing) return existing;
  if (!apply) return { filename, missing: true };

  const source = `${publicPath}/media/gallery/${sourceName}`;
  const bytes = await readFile(source);
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const duplicate = await repository.findByContentHash(contentHash);
  if (duplicate) return duplicate;

  const storageKey = `seed/${filename}`;
  await mkdir(`${uploadsPath}/seed`, { recursive: true });
  await copyFile(source, `${uploadsPath}/${storageKey}`);
  const file = await stat(source);
  return repository.create({
    filename,
    mimeType: "image/webp",
    size: file.size,
    width: 400,
    height: 400,
    alt,
    storageKey,
    contentHash,
    status: "ready",
  });
}

function imageValue(item) {
  return {
    id: item.id,
    provider: "local",
    src: item.storageKey,
    filename: item.filename,
    mimeType: item.mimeType,
    width: item.width,
    height: item.height,
    alt: item.alt,
    meta: { storageKey: item.storageKey },
  };
}

async function createPublished(collection, slug, data) {
  const repository = new ContentRepository(db);
  const existing = await repository.findByIdOrSlug(collection, slug, "en");
  if (existing) return { slug, state: "already-present", id: existing.id };
  if (!apply) return { slug, state: "missing" };

  const created = await handleContentCreate(db, collection, {
    slug,
    locale: "en",
    status: "draft",
    data,
  });
  if (!created.success) throw new Error(`${collection}/${slug}: ${created.error.code}: ${created.error.message}`);
  const published = await handleContentPublish(db, collection, created.data.item.id);
  if (!published.success) throw new Error(`${collection}/${slug}: ${published.error.code}: ${published.error.message}`);
  const readback = await handleContentGet(db, collection, slug, "en");
  if (!readback.success || readback.data.item.status !== "published") {
    throw new Error(`${collection}/${slug}: published readback failed`);
  }
  return { slug, state: "published", id: created.data.item.id };
}

try {
  const heroMedia = await media("homepage-hero-dance-floor.webp", "dance-floor-400.webp", "Guests at Margariteros");
  const musicMedia = await media("test-event-music.webp", "dance-floor-400.webp", "Demonstration event card");
  const danceMedia = await media("test-event-dance.webp", "live-music-400.webp", "Demonstration event card");

  const homepage = await createPublished("homepage", "main", {
    name: "Main homepage",
    hero_image: imageValue(heroMedia),
    published_locales: ["pl", "en", "ru", "es"],
    hero_eyebrow_pl: "CHMIELNA 7/9 · WARSZAWA",
    hero_title_pl: "WYDARZENIA W CENTRUM WARSZAWY",
    hero_text_pl: "Muzyka, taniec i meksykańska kuchnia. Zobacz program i wybierz swój wieczór.",
    hero_image_alt_pl: "Goście podczas wydarzenia w Margariteros",
    primary_cta_label_pl: "ZAREZERWUJ STOLIK",
    secondary_cta_label_pl: "ZOBACZ MENU",
    gallery_heading_pl: "ZOBACZ, JAK JEST U NAS",
    hero_eyebrow_en: "CHMIELNA 7/9 · WARSAW",
    hero_title_en: "EVENTS IN CENTRAL WARSAW",
    hero_text_en: "Music, dance and Mexican food. Explore the programme and choose your evening.",
    hero_image_alt_en: "Guests at an event at Margariteros",
    primary_cta_label_en: "BOOK A TABLE",
    secondary_cta_label_en: "VIEW MENU",
    gallery_heading_en: "SEE THE ATMOSPHERE",
    hero_eyebrow_ru: "CHMIELNA 7/9 · WARSZAWA",
    hero_title_ru: "СОБЫТИЯ В ЦЕНТРЕ ВАРШАВЫ",
    hero_text_ru: "Музыка, танцы и мексиканская кухня. Посмотрите программу и выберите свой вечер.",
    hero_image_alt_ru: "Гости на мероприятии в Margariteros",
    primary_cta_label_ru: "ЗАБРОНИРОВАТЬ",
    secondary_cta_label_ru: "ПОСМОТРЕТЬ МЕНЮ",
    gallery_heading_ru: "ПОСМОТРЕТЬ АТМОСФЕРУ",
    hero_eyebrow_es: "CHMIELNA 7/9 · VARSOVIA",
    hero_title_es: "EVENTOS EN EL CENTRO DE VARSOVIA",
    hero_text_es: "Música, baile y cocina mexicana. Descubre el programa y elige tu noche.",
    hero_image_alt_es: "Invitados en un evento de Margariteros",
    primary_cta_label_es: "RESERVAR MESA",
    secondary_cta_label_es: "VER MENÚ",
    gallery_heading_es: "DESCUBRE EL AMBIENTE",
  });

  const eventDefinitions = [
    {
      slug: "test-music-evening-2026-09-05",
      starts_at: "2026-09-05T19:00:00+02:00",
      image: musicMedia,
      title: "TEST — wieczór z muzyką",
      summary: "Przykładowa karta. To nie jest prawdziwe wydarzenie.",
      details: "To wydarzenie testowe służy wyłącznie do sprawdzenia wyglądu i obsługi strony.",
      title_en: "TEST — music evening",
      summary_en: "Example card. This is not a real event.",
      details_en: "This test event exists only to demonstrate the website layout and editing flow.",
      title_ru: "ТЕСТ — музыкальный вечер",
      summary_ru: "Пример карточки. Это не настоящее событие.",
      details_ru: "Это тестовое мероприятие существует только для проверки вида и редактирования сайта.",
      title_es: "PRUEBA — noche de música",
      summary_es: "Tarjeta de ejemplo. No es un evento real.",
      details_es: "Este evento de prueba solo sirve para comprobar el diseño y la edición del sitio.",
    },
    {
      slug: "test-dance-evening-2026-09-12",
      starts_at: "2026-09-12T20:00:00+02:00",
      image: danceMedia,
      title: "TEST — wieczór taneczny",
      summary: "Przykładowa karta do oceny wyglądu. Bez rezerwacji.",
      details: "To wydarzenie testowe służy wyłącznie do sprawdzenia wyglądu i obsługi strony.",
      title_en: "TEST — dance evening",
      summary_en: "Example card for design review. Booking is disabled.",
      details_en: "This test event exists only to demonstrate the website layout and editing flow.",
      title_ru: "ТЕСТ — танцевальный вечер",
      summary_ru: "Пример карточки для оценки дизайна. Бронь отключена.",
      details_ru: "Это тестовое мероприятие существует только для проверки вида и редактирования сайта.",
      title_es: "PRUEBA — noche de baile",
      summary_es: "Tarjeta de ejemplo para evaluar el diseño. Sin reserva.",
      details_es: "Este evento de prueba solo sirve para comprobar el diseño y la edición del sitio.",
    },
  ];

  const events = [];
  for (const event of eventDefinitions) {
    events.push(await createPublished("events", event.slug, {
      starts_at: event.starts_at,
      event_state: "scheduled",
      title: event.title,
      summary: event.summary,
      details: textBlock(event.details),
      title_en: event.title_en,
      summary_en: event.summary_en,
      details_en: textBlock(event.details_en),
      title_ru: event.title_ru,
      summary_ru: event.summary_ru,
      details_ru: textBlock(event.details_ru),
      title_es: event.title_es,
      summary_es: event.summary_es,
      details_es: textBlock(event.details_es),
      published_locales: ["pl", "en", "ru", "es"],
      hero_image: imageValue(event.image),
      booking_url: "",
      fact_sources: "Demonstration fixture requested by the owner; not a real event",
      facts_confirmed_at: "2026-09-01T09:00:00+02:00",
      legacy_path: `staging-preview/${event.slug}`,
    }));
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", homepage, events }, null, 2));
} finally {
  await db.destroy();
}
